Add-Type -AssemblyName System.Drawing

$src = Join-Path (Get-Location) "IMG_6517_enhanced_straight.jpg.jpeg"
$bmp = New-Object System.Drawing.Bitmap($src)

# Let's find the left, right, top, bottom edges of the saree fold
# The background is white/gray fleece (R > 210, G > 210, B > 210, neutral)
# The saree body is lime green (G high, R medium, B low, not neutral) or cyan border (B high, G high, R low)
function IsBackground($c) {
    # Fleece rug is light neutral: high brightness and low color saturation
    $max = [Math]::Max($c.R, [Math]::Max($c.G, $c.B))
    $min = [Math]::Min($c.R, [Math]::Min($c.G, $c.B))
    $diff = $max - $min
    return ($max -gt 190 -and $diff -lt 35)
}

# Scan horizontal line at Y = 800 (lime green body)
$leftX = 0; $rightX = $bmp.Width
for ($x = 100; $x -lt $bmp.Width / 2; $x++) {
    if (-not (IsBackground($bmp.GetPixel($x, 800)))) {
        $leftX = $x; break
    }
}
for ($x = $bmp.Width - 100; $x -gt $bmp.Width / 2; $x--) {
    if (-not (IsBackground($bmp.GetPixel($x, 800)))) {
        $rightX = $x; break
    }
}

# Scan vertical line at X = 750 (center)
$topY = 0; $bottomY = $bmp.Height
for ($y = 100; $y -lt $bmp.Height / 2; $y++) {
    if (-not (IsBackground($bmp.GetPixel(750, $y)))) {
        $topY = $y; break
    }
}
for ($y = $bmp.Height - 100; $y -gt $bmp.Height / 2; $y--) {
    if (-not (IsBackground($bmp.GetPixel(750, $y)))) {
        $bottomY = $y; break
    }
}

Write-Host "Saree bounds in IMG_6517: Left=$leftX, Right=$rightX, Top=$topY, Bottom=$bottomY"
$bmp.Dispose()
