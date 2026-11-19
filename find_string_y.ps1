Add-Type -AssemblyName System.Drawing

$src = Join-Path (Get-Location) "IMG_6517_enhanced_straight.jpg.jpeg"
$bmp = New-Object System.Drawing.Bitmap($src)

# Let's inspect along X = 600, 700, 800 for Y between 1050 and 1250
for ($y = 1080; $y -lt 1200; $y++) {
    $c = $bmp.GetPixel(700, $y)
    # Check if light/white
    if ($c.R -gt 190 -and $c.G -gt 190 -and $c.B -gt 190) {
        Write-Host "White string at Y=$y (R=$($c.R), G=$($c.G), B=$($c.B))"
    }
}

$bmp.Dispose()
