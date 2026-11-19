Add-Type -AssemblyName System.Drawing

$srcPath = Join-Path (Get-Location) "IMG_6517_enhanced_straight.jpg.jpeg"
$bmp = New-Object System.Drawing.Bitmap($srcPath)

$w = $bmp.Width
$h = $bmp.Height

Write-Host "Processing IMG_6517 ($w x $h)..."

# Step 1: Inpaint Sticker
# Sticker is at X ≈ [565, 845], Y ≈ [1408, 1555]
# Sample matching border pattern from X = [875, 1155], Y = [1408, 1555]
# Apply smooth alpha feathering at left and right edges (width 12px)
$stkX1 = 560; $stkX2 = 850; $stkY1 = 1405; $stkY2 = 1560
$shiftX = 300 # 300px to the right is clean border

for ($y = $stkY1; $y -le $stkY2; $y++) {
    for ($x = $stkX1; $x -le $stkX2; $x++) {
        $sampleX = $x + $shiftX
        if ($sampleX -lt ($w - 50)) {
            $srcC = $bmp.GetPixel($sampleX, $y)
            $curC = $bmp.GetPixel($x, $y)
            
            # Feather blend factor
            $distLeft = [Math]::Max(0, $x - $stkX1)
            $distRight = [Math]::Max(0, $stkX2 - $x)
            $dist = [Math]::Min($distLeft, $distRight)
            $alpha = [Math]::Min(1.0, $dist / 12.0)
            
            $r = [int]($srcC.R * $alpha + $curC.R * (1.0 - $alpha))
            $g = [int]($srcC.G * $alpha + $curC.G * (1.0 - $alpha))
            $b = [int]($srcC.B * $alpha + $curC.B * (1.0 - $alpha))
            
            # If current pixel is white paper or within the core of the sticker, replace completely
            $isPaper = ($curC.R -gt 180 -and $curC.G -gt 180 -and $curC.B -gt 170)
            if ($isPaper -or $dist -gt 8) {
                $bmp.SetPixel($x, $y, $srcC)
            } else {
                $bmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($r, $g, $b))
            }
        }
    }
}

# Step 2: Inpaint Knot at X = [1130, 1225], Y = [1115, 1195]
for ($y = 1115; $y -le 1195; $y++) {
    for ($x = 1130; $x -le 1225; $x++) {
        $sampleX = $x - 120
        $c = $bmp.GetPixel($sampleX, $y)
        $bmp.SetPixel($x, $y, $c)
    }
}

# Step 3: Inpaint Horizontal String at Y = [1132, 1156], X = [330, 1130]
for ($x = 330; $x -le 1130; $x++) {
    # Sample clean cyan from lower band at Y = 1450 (which has exact same cyan tone)
    $cleanCyan = $bmp.GetPixel($x, 1450)
    for ($y = 1132; $y -le 1156; $y++) {
        $curC = $bmp.GetPixel($x, $y)
        if ($curC.R -gt 180 -and $curC.G -gt 180 -and $curC.B -gt 180) {
            $bmp.SetPixel($x, $y, $cleanCyan)
        }
    }
}

# Step 4: Clean and smooth the background around the saree
# Fleece rug is light neutral (R>185, G>185, B>180, |R-G|<20, |G-B|<20)
# Replace with smooth studio high-key warm white gradient with subtle vignette
$studioGrad = New-Object System.Drawing.Bitmap($w, $h)
$gGrad = [System.Drawing.Graphics]::FromImage($studioGrad)
$gGrad.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic

# Create a clean studio backdrop
for ($y = 0; $y -lt $h; $y += 4) {
    # Vertical soft studio light (slightly brighter at center)
    $vFactor = 1.0 - ([Math]::Abs($y - ($h / 2)) / ($h / 2)) * 0.08
    $rBg = [int](250 * $vFactor)
    $gBg = [int](248 * $vFactor)
    $bBg = [int](244 * $vFactor) # warm studio cream-white
    $bgBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb($rBg, $gBg, $bBg))
    $gGrad.FillRectangle($bgBrush, 0, $y, $w, 4)
    $bgBrush.Dispose()
}

# Composite saree onto studio backdrop with edge smoothing
# Find boundary of saree per row
for ($y = 0; $y -lt $h; $y++) {
    for ($x = 0; $x -lt $w; $x++) {
        $c = $bmp.GetPixel($x, $y)
        # Check if fleece rug
        $isFleece = ($c.R -gt 180 -and $c.G -gt 180 -and $c.B -gt 175 -and 
                     [Math]::Abs($c.R - $c.G) -lt 22 -and [Math]::Abs($c.G - $c.B) -lt 22)
        
        # Also ensure corners outside saree bounds are fleece
        if ($x -lt 320 -or $x -gt 1235 -or $y -lt 310 -or $y -gt 1765) {
            $isFleece = $true
        }
        
        if (-not $isFleece) {
            $studioGrad.SetPixel($x, $y, $c)
        }
    }
}

# Step 5: High-definition Color & Contrast Grading
# Contrast 1.08, saturation boost for lime green & cyan teal
$targetW = 1200
$targetH = 1600 # 3:4 portrait
$hdBmp = New-Object System.Drawing.Bitmap($targetW, $targetH)
$gHd = [System.Drawing.Graphics]::FromImage($hdBmp)
$gHd.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gHd.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$gHd.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$gHd.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

# Calculate scale to give 8% margin top/bottom so saree is NEVER cropped
# Saree height in studioGrad is from Y=310 to Y=1765 (1455px)
# Canvas is 1600px, so 1455 fits with 145px margin!
$cm = New-Object System.Drawing.Imaging.ColorMatrix
$c = 1.07 # contrast
$t = (1.0 - $c) / 2.0
$cm.Matrix00 = $c * 1.02 # R
$cm.Matrix11 = $c * 1.04 # G (boost green for lime green brilliance)
$cm.Matrix22 = $c * 1.03 # B (boost blue for vibrant cyan-teal)
$cm.Matrix33 = 1.0
$cm.Matrix40 = $t
$cm.Matrix41 = $t
$cm.Matrix42 = $t
$cm.Matrix44 = 1.0

$ia = New-Object System.Drawing.Imaging.ImageAttributes
$ia.SetColorMatrix($cm)

# Saree crop: X=180 to 1356 (width 1176), Y=180 to 1748 (height 1568)
$cropX = 180; $cropY = 180; $cropW = 1176; $cropH = 1568
$rect = New-Object System.Drawing.Rectangle(0, 0, $targetW, $targetH)
$gHd.DrawImage($studioGrad, $rect, $cropX, $cropY, $cropW, $cropH, [System.Drawing.GraphicsUnit]::Pixel, $ia)

# Save test result
$testOut = "C:\Users\Admin\.gemini\antigravity\brain\3f3c2b04-18d7-4416-8424-6a1ba7c703f7\remaster_6517.jpg"
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$ep = New-Object System.Drawing.Imaging.EncoderParameters(1)
$ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]93)

$hdBmp.Save($testOut, $codec, $ep)

$gHd.Dispose()
$ia.Dispose()
$hdBmp.Dispose()
$gGrad.Dispose()
$studioGrad.Dispose()
$bmp.Dispose()

Write-Host "Remastered IMG_6517 successfully -> $testOut"
