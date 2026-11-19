Add-Type -AssemblyName System.Drawing

# 1. Load the inpainted image
$srcPath = "C:\Users\Admin\.gemini\antigravity\brain\3f3c2b04-18d7-4416-8424-6a1ba7c703f7\inpaint_step1.jpg"
$marblePath = "C:\Users\Admin\.gemini\antigravity\brain\3f3c2b04-18d7-4416-8424-6a1ba7c703f7\kanchi_cotton_maroon_saree_studio_1794908768902.jpg"

$sareeBmp = New-Object System.Drawing.Bitmap($srcPath)
$marbleBmp = New-Object System.Drawing.Bitmap($marblePath)

# Clean up string & knot completely:
# Knot at X = 1130 to 1215, Y = 1120 to 1195
# Inpaint knot from X = 1000 to 1085 (same height, clean border)
for ($y = 1115; $y -le 1200; $y++) {
    for ($x = 1130; $x -le 1215; $x++) {
        $srcX = $x - 130
        $c = $sareeBmp.GetPixel($srcX, $y)
        $sareeBmp.SetPixel($x, $y, $c)
    }
}

# String line across X = 330 to 1150 at Y = 1130 to 1158
# The string sits between the small gold motifs (Y~1100-1125) and the thick gold band (Y~1160-1230).
# The space between is a plain cyan stripe. Let's fill the string with plain cyan silk color sampled from Y = 1125 / 1450
for ($x = 330; $x -le 1145; $x++) {
    # Sample clean cyan from lower plain band (Y = 1450)
    $cleanCyan = $sareeBmp.GetPixel($x, 1450)
    for ($y = 1132; $y -le 1155; $y++) {
        $cur = $sareeBmp.GetPixel($x, $y)
        if ($cur.R -gt 180 -and $cur.G -gt 180 -and $cur.B -gt 180) {
            $sareeBmp.SetPixel($x, $y, $cleanCyan)
        }
    }
}

# Create high-res 1200x1600 output canvas (3:4 portrait)
$outW = 1200
$outH = 1600
$finalBmp = New-Object System.Drawing.Bitmap($outW, $outH)
$g = [System.Drawing.Graphics]::FromImage($finalBmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

# Tile/draw the warm cream marble background across the canvas
$g.DrawImage($marbleBmp, 0, 0, $outW, $outH)

# Find the precise bounding box of the saree in $sareeBmp
# Saree is non-neutral (lime green or cyan)
# Fleece rug is light neutral (R>195, G>195, B>195, low saturation)
$minX = 330; $maxX = 1220; $minY = 320; $maxY = 1750
$sareeW = $maxX - $minX
$sareeH = $maxY - $minY

# Target size of saree on canvas: centered with comfortable 12% margins
$targetH = [int]($outH * 0.80)
$scale = $targetH / $sareeH
$targetW = [int]($sareeW * $scale)
$targetX = [int](($outW - $targetW) / 2)
$targetY = [int](($outH - $targetH) / 2)

# Draw soft natural drop shadow under saree
$shadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(45, 30, 20, 10))
for ($i = 15; $i -ge 1; $i--) {
    $alpha = [int](35 * (1.0 - ($i / 15.0)))
    $b = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb($alpha, 40, 25, 15))
    $rect = New-Object System.Drawing.Rectangle($targetX - $i, $targetY + 8, $targetW + ($i*2), $targetH + ($i*2))
    $g.FillRectangle($b, $rect)
    $b.Dispose()
}

# Extract saree with alpha mask and draw onto canvas
$cropRect = New-Object System.Drawing.Rectangle($minX, $minY, $sareeW, $sareeH)
$sareeCrop = $sareeBmp.Clone($cropRect, $sareeBmp.PixelFormat)

# Draw the cropped saree
$destRect = New-Object System.Drawing.Rectangle($targetX, $targetY, $targetW, $targetH)
$g.DrawImage($sareeCrop, $destRect, 0, 0, $sareeW, $sareeH, [System.Drawing.GraphicsUnit]::Pixel)

$testFinal = "C:\Users\Admin\.gemini\antigravity\brain\3f3c2b04-18d7-4416-8424-6a1ba7c703f7\studio_green_test.jpg"
$finalBmp.Save($testFinal, [System.Drawing.Imaging.ImageFormat]::Jpeg)

$g.Dispose()
$sareeCrop.Dispose()
$finalBmp.Dispose()
$sareeBmp.Dispose()
$marbleBmp.Dispose()

Write-Host "Created studio composite: $testFinal"
