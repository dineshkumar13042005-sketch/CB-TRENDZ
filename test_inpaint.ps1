Add-Type -AssemblyName System.Drawing

$src = Join-Path (Get-Location) "IMG_6517_enhanced_straight.jpg.jpeg"
$bmp = New-Object System.Drawing.Bitmap($src)

# Let's inspect exact sticker bounds
# The sticker has white background
$stkMinX = 9999; $stkMaxX = 0; $stkMinY = 9999; $stkMaxY = 0

for ($y = 1380; $y -lt 1560; $y++) {
    for ($x = 550; $x -lt 850; $x++) {
        $c = $bmp.GetPixel($x, $y)
        # Sticker white/light paper: R > 190, G > 190, B > 180
        if ($c.R -gt 190 -and $c.G -gt 190 -and $c.B -gt 175) {
            if ($x -lt $stkMinX) { $stkMinX = $x }
            if ($x -gt $stkMaxX) { $stkMaxX = $x }
            if ($y -lt $stkMinY) { $stkMinY = $y }
            if ($y -gt $stkMaxY) { $stkMaxY = $y }
        }
    }
}

Write-Host "Exact sticker bounds: X=[$stkMinX, $stkMaxX], Y=[$stkMinY, $stkMaxY]"

# Inpaint: take patch from X = [stkMinX - ($stkMaxX - $stkMinX) - 20] to [stkMinX - 20]
$patchW = ($stkMaxX - $stkMinX) + 30
$patchH = ($stkMaxY - $stkMinY) + 20
$patchStartX = $stkMinX - 15
$patchStartY = $stkMinY - 10

# Source patch to the left:
$srcX = $patchStartX - $patchW - 30

Write-Host "Inpainting with patch from X=$srcX, Y=$patchStartY, W=$patchW, H=$patchH"

$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

$srcRect = New-Object System.Drawing.Rectangle($srcX, $patchStartY, $patchW, $patchH)
$destRect = New-Object System.Drawing.Rectangle($patchStartX, $patchStartY, $patchW, $patchH)

$g.DrawImage($bmp, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)

# Inpaint the white string around Y = 1130 to 1160 across the saree (X=350 to 1200)
for ($x = 330; $x -lt 1220; $x++) {
    for ($y = 1125; $y -lt 1165; $y++) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.R -gt 195 -and $c.G -gt 195 -and $c.B -gt 195) {
            # Replace with pixel 15 pixels below or above
            $replacement = $bmp.GetPixel($x, $y + 18)
            $bmp.SetPixel($x, $y, $replacement)
        }
    }
}

$destTest = "C:\Users\Admin\.gemini\antigravity\brain\3f3c2b04-18d7-4416-8424-6a1ba7c703f7\inpaint_test.jpg"
$bmp.Save($destTest, [System.Drawing.Imaging.ImageFormat]::Jpeg)

$g.Dispose()
$bmp.Dispose()
Write-Host "Saved inpaint test to $destTest"
