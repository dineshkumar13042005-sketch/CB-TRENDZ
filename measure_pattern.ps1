Add-Type -AssemblyName System.Drawing

$src = Join-Path (Get-Location) "IMG_6517_enhanced_straight.jpg.jpeg"
$bmp = New-Object System.Drawing.Bitmap($src)

# Let's find the centers of golden medallions along Y = 1530 (below the sticker level, from X=380 to 580)
# Gold has high R and G, lower B: R > 150, G > 150, B < 120
$goldProfile = @()
for ($x = 380; $x -lt 580; $x++) {
    $c = $bmp.GetPixel($x, 1530)
    $isGold = ($c.R -gt 130 -and $c.G -gt 130 -and $c.B -lt 110)
    if ($isGold) {
        $goldProfile += $x
    }
}
Write-Host "Gold pixels count: $($goldProfile.Length)"

# Let's inspect brightness variation along Y = 1530 from X=850 to 1150
$peaks = @()
$prevVal = 0
$goingUp = $false
for ($x = 860; $x -lt 1160; $x++) {
    $c = $bmp.GetPixel($x, 1530)
    $val = $c.R + $c.G - $c.B
    if ($val -gt 150 -and $val -gt $prevVal) {
        $goingUp = $true
    } elseif ($goingUp -and $val -lt $prevVal) {
        $peaks += ($x - 1)
        $goingUp = $false
    }
    $prevVal = $val
}
Write-Host "Medallion peaks at X: $($peaks -join ', ')"
if ($peaks.Length -ge 2) {
    $diffs = @()
    for ($i = 0; $i -lt $peaks.Length - 1; $i++) {
        $diffs += ($peaks[$i+1] - $peaks[$i])
    }
    Write-Host "Repeat distances: $($diffs -join ', ')"
}

$bmp.Dispose()
