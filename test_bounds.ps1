Add-Type -AssemblyName System.Drawing

$srcPath = "IMG_6517_enhanced_straight.jpg.jpeg"
$bmp = New-Object System.Drawing.Bitmap($srcPath)

function IsFleece($c) {
    if ($c.R -gt 180 -and $c.G -gt 180 -and $c.B -gt 175) {
        $maxDiff = [Math]::Max([Math]::Abs($c.R - $c.G), [Math]::Max([Math]::Abs($c.G - $c.B), [Math]::Abs($c.R - $c.B)))
        if ($maxDiff -lt 25) { return $true }
    }
    return $false
}

# Scan each row from Y = 250 to 1850 to find the left and right boundary of the saree
$leftBound = @{}
$rightBound = @{}

for ($y = 250; $y -lt 1850; $y++) {
    $lx = 0
    for ($x = 100; $x -lt 700; $x++) {
        if (-not (IsFleece($bmp.GetPixel($x, $y)))) {
            $lx = $x
            break
        }
    }
    $rx = $bmp.Width
    for ($x = $bmp.Width - 100; $x -gt 800; $x--) {
        if (-not (IsFleece($bmp.GetPixel($x, $y)))) {
            $rx = $x
            break
        }
    }
    $leftBound[$y] = $lx
    $rightBound[$y] = $rx
}

Write-Host "Sample bounds at Y=500: Left=$($leftBound[500]), Right=$($rightBound[500])"
Write-Host "Sample bounds at Y=1000: Left=$($leftBound[1000]), Right=$($rightBound[1000])"
Write-Host "Sample bounds at Y=1500: Left=$($leftBound[1500]), Right=$($rightBound[1500])"

$bmp.Dispose()
