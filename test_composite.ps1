Add-Type -AssemblyName System.Drawing

$srcImgPath = Join-Path (Get-Location) "IMG_6517_enhanced_straight.jpg.jpeg"
$marbleRefPath = "C:\Users\Admin\.gemini\antigravity\brain\3f3c2b04-18d7-4416-8424-6a1ba7c703f7\kanchi_cotton_maroon_saree_studio_1794908768902.jpg"

$sareeBmp = New-Object System.Drawing.Bitmap($srcImgPath)
$marbleBmp = New-Object System.Drawing.Bitmap($marbleRefPath)

Write-Host "Saree: $($sareeBmp.Width)x$($sareeBmp.Height), Marble: $($marbleBmp.Width)x$($marbleBmp.Height)"

# 1. First, inpaint the sticker in $sareeBmp
# The sticker is at X ≈ 590 to 830, Y ≈ 1410 to 1545.
# At this height, the pattern repeats.
# To the right: X ≈ 880 to 1120 is the clean cyan border.
# Let's inspect:
$stickerX1 = 575; $stickerX2 = 845; $stickerY1 = 1410; $stickerY2 = 1550
$w = $stickerX2 - $stickerX1

# Let's copy from the right side of the border (X=875 to 1145) where the pattern is identical
for ($y = $stickerY1 - 5; $y -le $stickerY2 + 5; $y++) {
    for ($x = $stickerX1 - 5; $x -le $stickerX2 + 5; $x++) {
        # Smooth horizontal blend at edges
        $srcX = $x + 270 # 270 pixels to the right
        if ($srcX -lt ($sareeBmp.Width - 100)) {
            $srcCol = $sareeBmp.GetPixel($srcX, $y)
            # Only replace if near/inside sticker
            $curCol = $sareeBmp.GetPixel($x, $y)
            $isWhite = ($curCol.R -gt 180 -and $curCol.G -gt 180 -and $curCol.B -gt 170)
            if ($isWhite -or ($x -ge $stickerX1 -and $x -le $stickerX2 -and $y -ge $stickerY1 -and $y -le $stickerY2)) {
                $sareeBmp.SetPixel($x, $y, $srcCol)
            }
        }
    }
}

# 2. Inpaint the white string around Y = 1135 to 1155
for ($x = 350; $x -lt 1200; $x++) {
    for ($y = 1130; $y -lt 1160; $y++) {
        $c = $sareeBmp.GetPixel($x, $y)
        if ($c.R -gt 195 -and $c.G -gt 195 -and $c.B -gt 195) {
            # Average of 15 px above and 15 px below
            $cAbove = $sareeBmp.GetPixel($x, $y - 15)
            $cBelow = $sareeBmp.GetPixel($x, $y + 15)
            $avgR = [int](($cAbove.R + $cBelow.R) / 2)
            $avgG = [int](($cAbove.G + $cBelow.G) / 2)
            $avgB = [int](($cAbove.B + $cBelow.B) / 2)
            $sareeBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($avgR, $avgG, $avgB))
        }
    }
}

$testPath = "C:\Users\Admin\.gemini\antigravity\brain\3f3c2b04-18d7-4416-8424-6a1ba7c703f7\inpaint_step1.jpg"
$sareeBmp.Save($testPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
Write-Host "Saved step 1 inpaint to $testPath"

$sareeBmp.Dispose()
$marbleBmp.Dispose()
