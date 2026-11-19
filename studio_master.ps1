$csharp = @"
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;

public class ImageProcessor
{
    public static unsafe void ProcessImage(string srcPath, string outPath, bool isSlide1)
    {
        using (Bitmap src = new Bitmap(srcPath))
        {
            int w = src.Width;
            int h = src.Height;

            BitmapData data = src.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.ReadWrite, PixelFormat.Format24bppRgb);
            int stride = data.Stride;
            byte* scan0 = (byte*)data.Scan0;

            if (isSlide1)
            {
                // 1. Inpaint sticker at X ≈ [560, 855], Y ≈ [1405, 1560]
                int stkX1 = 560, stkX2 = 855, stkY1 = 1405, stkY2 = 1560;
                int shift = 300;

                for (int y = stkY1; y <= stkY2; y++)
                {
                    byte* row = scan0 + (y * stride);
                    for (int x = stkX1; x <= stkX2; x++)
                    {
                        int srcX = x + shift;
                        if (srcX < w - 20)
                        {
                            byte* curPx = row + (x * 3);
                            byte* srcPx = row + (srcX * 3);

                            int distLeft = x - stkX1;
                            int distRight = stkX2 - x;
                            int dist = Math.Min(distLeft, distRight);

                            if (dist > 10)
                            {
                                curPx[0] = srcPx[0];
                                curPx[1] = srcPx[1];
                                curPx[2] = srcPx[2];
                            }
                            else
                            {
                                float alpha = dist / 10.0f;
                                curPx[0] = (byte)(srcPx[0] * alpha + curPx[0] * (1.0f - alpha));
                                curPx[1] = (byte)(srcPx[1] * alpha + curPx[1] * (1.0f - alpha));
                                curPx[2] = (byte)(srcPx[2] * alpha + curPx[2] * (1.0f - alpha));
                            }
                        }
                    }
                }

                // 2. Inpaint knot on the right border: X ≈ [1110, 1225], Y ≈ [1090, 1160]
                for (int y = 1090; y <= 1160; y++)
                {
                    byte* row = scan0 + (y * stride);
                    for (int x = 1110; x <= 1225; x++)
                    {
                        int srcX = x - 130;
                        byte* curPx = row + (x * 3);
                        byte* srcPx = row + (srcX * 3);
                        curPx[0] = srcPx[0];
                        curPx[1] = srcPx[1];
                        curPx[2] = srcPx[2];
                    }
                }

                // 3. Remove horizontal string: exact string location Y = [1112, 1128]
                // Below it at Y=1135 is clean cyan stripe, above it at Y=1105 is clean cyan stripe.
                for (int x = 340; x <= 1220; x++)
                {
                    byte* topCyan = scan0 + (1106 * stride) + (x * 3);
                    byte* botCyan = scan0 + (1134 * stride) + (x * 3);

                    for (int y = 1112; y <= 1128; y++)
                    {
                        byte* curPx = scan0 + (y * stride) + (x * 3);
                        float factor = (float)(y - 1112) / (1128 - 1112);
                        curPx[0] = (byte)(topCyan[0] * (1.0f - factor) + botCyan[0] * factor);
                        curPx[1] = (byte)(topCyan[1] * (1.0f - factor) + botCyan[1] * factor);
                        curPx[2] = (byte)(topCyan[2] * (1.0f - factor) + botCyan[2] * factor);
                    }
                }
            }
            else
            {
                // Slide 2: Inpaint thin string at Y ≈ [950, 978]
                for (int x = 340; x <= 1220; x++)
                {
                    byte* cleanGreen = scan0 + (935 * stride) + (x * 3);
                    for (int y = 950; y <= 978; y++)
                    {
                        byte* curPx = scan0 + (y * stride) + (x * 3);
                        if (curPx[2] > 170 && curPx[1] > 170 && curPx[0] > 160)
                        {
                            curPx[0] = cleanGreen[0];
                            curPx[1] = cleanGreen[1];
                            curPx[2] = cleanGreen[2];
                        }
                    }
                }
            }

            src.UnlockBits(data);

            // 4. Exact Saree Cutout with Zero Fleece
            // Clean crop strictly inside saree fold:
            int sX = 368, sY = 388, sW = 822, sH = 1350;
            if (!isSlide1)
            {
                sX = 368; sY = 385; sW = 822; sH = 1350;
            }

            int outW = 1200, outH = 1600; // Standard 3:4 portrait
            using (Bitmap dest = new Bitmap(outW, outH))
            using (Graphics gDest = Graphics.FromImage(dest))
            {
                gDest.InterpolationMode = InterpolationMode.HighQualityBicubic;
                gDest.SmoothingMode = SmoothingMode.HighQuality;
                gDest.PixelOffsetMode = PixelOffsetMode.HighQuality;
                gDest.CompositingQuality = CompositingQuality.HighQuality;

                // Luxury warm studio background (soft ivory cream matching boutique cards)
                using (SolidBrush bg = new SolidBrush(Color.FromArgb(248, 246, 241)))
                {
                    gDest.FillRectangle(bg, 0, 0, outW, outH);
                }

                // Saree target centered with comfortable margins
                int targetH = 1380;
                float scale = (float)targetH / sH;
                int targetW = (int)(sW * scale);
                int targetX = (outW - targetW) / 2;
                int targetY = (outH - targetH) / 2;

                // Soft commercial studio drop shadow
                for (int i = 24; i >= 1; i--)
                {
                    int alpha = (int)(24 * (1.0f - (float)i / 24.0f));
                    using (SolidBrush sb = new SolidBrush(Color.FromArgb(alpha, 55, 42, 28)))
                    {
                        using (GraphicsPath sp = GetRoundedRect(new Rectangle(targetX - i / 2, targetY + 6, targetW + i, targetH + i), 20 + i))
                        {
                            gDest.FillPath(sb, sp);
                        }
                    }
                }

                // Contrast + Saturation boost
                float contrast = 1.08f;
                float t = (1.0f - contrast) / 2.0f;
                ColorMatrix cm = new ColorMatrix(new float[][] {
                    new float[] { contrast * 1.02f, 0, 0, 0, 0 },
                    new float[] { 0, contrast * 1.06f, 0, 0, 0 }, // Rich lime green
                    new float[] { 0, 0, contrast * 1.05f, 0, 0 }, // Rich cyan-teal
                    new float[] { 0, 0, 0, 1.0f, 0 },
                    new float[] { t, t, t, 0, 1.0f }
                });

                using (ImageAttributes ia = new ImageAttributes())
                {
                    ia.SetColorMatrix(cm);

                    using (GraphicsPath clipPath = GetRoundedRect(new Rectangle(targetX, targetY, targetW, targetH), 18))
                    {
                        gDest.SetClip(clipPath);
                        Rectangle srcRect = new Rectangle(sX, sY, sW, sH);
                        Rectangle destRect = new Rectangle(targetX, targetY, targetW, targetH);
                        gDest.DrawImage(src, destRect, srcRect.X, srcRect.Y, srcRect.Width, srcRect.Height, GraphicsUnit.Pixel, ia);
                        gDest.ResetClip();
                    }
                }

                // Fine gold edge stroke for luxury finish
                using (Pen borderPen = new Pen(Color.FromArgb(45, 180, 155, 90), 1.0f))
                using (GraphicsPath bp = GetRoundedRect(new Rectangle(targetX, targetY, targetW, targetH), 18))
                {
                    gDest.DrawPath(borderPen, bp);
                }

                ImageCodecInfo jpegCodec = null;
                foreach (ImageCodecInfo c in ImageCodecInfo.GetImageEncoders())
                {
                    if (c.MimeType == "image/jpeg") { jpegCodec = c; break; }
                }

                EncoderParameters ep = new EncoderParameters(1);
                ep.Param[0] = new EncoderParameter(Encoder.Quality, 95L);

                dest.Save(outPath, jpegCodec, ep);
            }
        }
    }

    private static GraphicsPath GetRoundedRect(Rectangle bounds, int radius)
    {
        GraphicsPath path = new GraphicsPath();
        int d = radius * 2;
        path.AddArc(bounds.X, bounds.Y, d, d, 180, 90);
        path.AddArc(bounds.Right - d, bounds.Y, d, d, 270, 90);
        path.AddArc(bounds.Right - d, bounds.Bottom - d, d, d, 0, 90);
        path.AddArc(bounds.X, bounds.Bottom - d, d, d, 90, 90);
        path.CloseFigure();
        return path;
    }
}
"@

$cp = New-Object System.CodeDom.Compiler.CompilerParameters
$cp.CompilerOptions = "/unsafe"
$cp.ReferencedAssemblies.Add("System.Drawing.dll") | Out-Null
$cp.GenerateInMemory = $true

Add-Type -TypeDefinition $csharp -CompilerParameters $cp

$src1 = Join-Path (Get-Location) "IMG_6517_enhanced_straight.jpg.jpeg"
$dest1 = Join-Path (Get-Location) "images\IMG_6517_enhanced_straight.jpg"
[ImageProcessor]::ProcessImage($src1, $dest1, $true)
Copy-Item $dest1 "$dest1.jpeg" -Force
Write-Host "Overwrote images\IMG_6517_enhanced_straight.jpg!"

$src2 = Join-Path (Get-Location) "IMG_6518_enhanced_straight.jpg.jpeg"
$dest2 = Join-Path (Get-Location) "images\IMG_6518_enhanced_straight.jpg"
[ImageProcessor]::ProcessImage($src2, $dest2, $false)
Copy-Item $dest2 "$dest2.jpeg" -Force
Write-Host "Overwrote images\IMG_6518_enhanced_straight.jpg!"
