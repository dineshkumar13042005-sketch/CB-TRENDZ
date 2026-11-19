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
                // 1. Inpaint sticker at X ≈ [560, 848], Y ≈ [1405, 1558]
                // Sample from X = [860, 1148] (shift = 300)
                int stkX1 = 560, stkX2 = 848, stkY1 = 1405, stkY2 = 1558;
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

                            int bCur = curPx[0], gCur = curPx[1], rCur = curPx[2];
                            bool isWhite = (rCur > 175 && gCur > 175 && bCur > 165);

                            int distLeft = x - stkX1;
                            int distRight = stkX2 - x;
                            int dist = Math.Min(distLeft, distRight);

                            if (isWhite || dist > 6)
                            {
                                curPx[0] = srcPx[0];
                                curPx[1] = srcPx[1];
                                curPx[2] = srcPx[2];
                            }
                        }
                    }
                }

                // 2. Inpaint knot at X ≈ [1130, 1220], Y ≈ [1115, 1195]
                for (int y = 1115; y <= 1195; y++)
                {
                    byte* row = scan0 + (y * stride);
                    for (int x = 1130; x <= 1220; x++)
                    {
                        int srcX = x - 120;
                        byte* curPx = row + (x * 3);
                        byte* srcPx = row + (srcX * 3);
                        curPx[0] = srcPx[0];
                        curPx[1] = srcPx[1];
                        curPx[2] = srcPx[2];
                    }
                }

                // 3. Inpaint string at Y ≈ [1132, 1156], X ≈ [330, 1130]
                for (int x = 330; x <= 1130; x++)
                {
                    byte* cyanRow = scan0 + (1450 * stride);
                    byte bClean = cyanRow[x * 3];
                    byte gClean = cyanRow[x * 3 + 1];
                    byte rClean = cyanRow[x * 3 + 2];

                    for (int y = 1132; y <= 1156; y++)
                    {
                        byte* curPx = scan0 + (y * stride) + (x * 3);
                        if (curPx[2] > 180 && curPx[1] > 180 && curPx[0] > 180)
                        {
                            curPx[0] = bClean;
                            curPx[1] = gClean;
                            curPx[2] = rClean;
                        }
                    }
                }
            }
            else
            {
                // Slide 2: Inpaint thin string at Y ≈ [950, 980], X ≈ [330, 1200]
                for (int x = 330; x <= 1200; x++)
                {
                    for (int y = 950; y <= 980; y++)
                    {
                        byte* curPx = scan0 + (y * stride) + (x * 3);
                        if (curPx[2] > 185 && curPx[1] > 185 && curPx[0] > 185)
                        {
                            byte* srcPx = scan0 + ((y - 20) * stride) + (x * 3);
                            curPx[0] = srcPx[0];
                            curPx[1] = srcPx[1];
                            curPx[2] = srcPx[2];
                        }
                    }
                }
            }

            src.UnlockBits(data);

            // 4. Create Studio Cutout with Clean Smooth Edges
            // Crop exact saree rectangle
            int sX = 345, sY = 320, sW = 875, sH = 1425;
            if (!isSlide1)
            {
                sX = 350; sY = 320; sW = 865; sH = 1425;
            }

            int outW = 1200, outH = 1600; // 3:4 portrait
            using (Bitmap dest = new Bitmap(outW, outH))
            using (Graphics gDest = Graphics.FromImage(dest))
            {
                gDest.InterpolationMode = InterpolationMode.HighQualityBicubic;
                gDest.SmoothingMode = SmoothingMode.HighQuality;
                gDest.PixelOffsetMode = PixelOffsetMode.HighQuality;
                gDest.CompositingQuality = CompositingQuality.HighQuality;

                // Warm studio background (light ivory/cream)
                using (SolidBrush bg = new SolidBrush(Color.FromArgb(249, 247, 243)))
                {
                    gDest.FillRectangle(bg, 0, 0, outW, outH);
                }

                // Saree target position centered with generous margins
                int targetH = 1350;
                float scale = (float)targetH / sH;
                int targetW = (int)(sW * scale);
                int targetX = (outW - targetW) / 2;
                int targetY = (outH - targetH) / 2;

                // Soft elegant studio drop shadow
                for (int i = 20; i >= 1; i--)
                {
                    int alpha = (int)(25 * (1.0f - (float)i / 20.0f));
                    using (SolidBrush sb = new SolidBrush(Color.FromArgb(alpha, 60, 45, 30)))
                    {
                        using (GraphicsPath sp = GetRoundedRect(new Rectangle(targetX - i / 2, targetY + 6, targetW + i, targetH + i), 28 + i))
                        {
                            gDest.FillPath(sb, sp);
                        }
                    }
                }

                // Color Matrix for contrast + saturation boost
                float contrast = 1.08f;
                float t = (1.0f - contrast) / 2.0f;
                ColorMatrix cm = new ColorMatrix(new float[][] {
                    new float[] { contrast * 1.02f, 0, 0, 0, 0 },
                    new float[] { 0, contrast * 1.06f, 0, 0, 0 }, // Vibrant lime green
                    new float[] { 0, 0, contrast * 1.05f, 0, 0 }, // Vibrant teal border
                    new float[] { 0, 0, 0, 1.0f, 0 },
                    new float[] { t, t, t, 0, 1.0f }
                });

                using (ImageAttributes ia = new ImageAttributes())
                {
                    ia.SetColorMatrix(cm);

                    // Clip to clean rounded rectangle for the saree fold
                    using (GraphicsPath clipPath = GetRoundedRect(new Rectangle(targetX, targetY, targetW, targetH), 26))
                    {
                        gDest.SetClip(clipPath);
                        Rectangle srcRect = new Rectangle(sX, sY, sW, sH);
                        Rectangle destRect = new Rectangle(targetX, targetY, targetW, targetH);
                        gDest.DrawImage(src, destRect, srcRect.X, srcRect.Y, srcRect.Width, srcRect.Height, GraphicsUnit.Pixel, ia);
                        gDest.ResetClip();
                    }
                }

                // Subtle inner border line for definition
                using (Pen borderPen = new Pen(Color.FromArgb(40, 180, 160, 100), 1.0f))
                using (GraphicsPath bp = GetRoundedRect(new Rectangle(targetX, targetY, targetW, targetH), 26))
                {
                    gDest.DrawPath(borderPen, bp);
                }

                ImageCodecInfo jpegCodec = null;
                foreach (ImageCodecInfo c in ImageCodecInfo.GetImageEncoders())
                {
                    if (c.MimeType == "image/jpeg") { jpegCodec = c; break; }
                }

                EncoderParameters ep = new EncoderParameters(1);
                ep.Param[0] = new EncoderParameter(Encoder.Quality, 94L);

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
$out1 = "C:\Users\Admin\.gemini\antigravity\brain\3f3c2b04-18d7-4416-8424-6a1ba7c703f7\studio_clean_6517.jpg"
[ImageProcessor]::ProcessImage($src1, $out1, $true)
Write-Host "Studio cleaned View 1!"

$src2 = Join-Path (Get-Location) "IMG_6518_enhanced_straight.jpg.jpeg"
$out2 = "C:\Users\Admin\.gemini\antigravity\brain\3f3c2b04-18d7-4416-8424-6a1ba7c703f7\studio_clean_6518.jpg"
[ImageProcessor]::ProcessImage($src2, $out2, $false)
Write-Host "Studio cleaned View 2!"
