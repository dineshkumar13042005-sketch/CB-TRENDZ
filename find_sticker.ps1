Add-Type -AssemblyName System.Drawing

$src = Join-Path (Get-Location) "IMG_6517_enhanced_straight.jpg.jpeg"
$bmp = New-Object System.Drawing.Bitmap($src)

# Check sticker area around Y = 1350 to 1550
$minX = 9999; $maxX = 0; $minY = 9999; $maxY = 0; $count = 0
for ($y = 1350; $y -lt 1550; $y += 2) {
    for ($x = 500; $x -lt 950; $x += 2) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.R -gt 200 -and $c.G -gt 200 -and $c.B -gt 190) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
            $count++
        }
    }
}
Write-Host "Sticker: X=[$minX, $maxX], Y=[$minY, $maxY], sampled: $count"

# Check string area around Y = 1100 to 1200
$strMinY = 9999; $strMaxY = 0
for ($y = 1100; $y -lt 1200; $y++) {
    for ($x = 400; $x -lt 1150; $x += 10) {
        $c = $bmp.GetPixel($x, $y)
        if ($c.R -gt 210 -and $c.G -gt 210 -and $c.B -gt 210) {
            if ($y -lt $strMinY) { $strMinY = $y }
            if ($y -gt $strMaxY) { $strMaxY = $y }
        }
    }
}
Write-Host "String: Y=[$strMinY, $strMaxY]"

$bmp.Dispose()
