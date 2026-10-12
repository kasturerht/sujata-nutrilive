Add-Type -AssemblyName System.Drawing
$imgPath = 'C:\Users\Prime\.gemini\antigravity\brain\5b259ba4-e5f7-4fae-9f9e-b9c23e1960df\.user_uploaded\media_1791565278019_3af9085f.png'
$img = [System.Drawing.Image]::FromFile($imgPath)
Write-Host "Width: $($img.Width), Height: $($img.Height)"

# Crop top 5 sections of height 1200 each
$cropHeight = [Math]::Min(1200, $img.Height)
$numSlices = [Math]::Ceiling($img.Height / 1200.0)
$outDir = 'C:\Users\Prime\.gemini\antigravity\brain\5b259ba4-e5f7-4fae-9f9e-b9c23e1960df\scratch'
if (!(Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir }

for ($i = 0; $i -lt $numSlices; $i++) {
    $y = $i * 1200
    $h = [Math]::Min(1200, $img.Height - $y)
    $rect = New-Object System.Drawing.Rectangle(0, $y, $img.Width, $h)
    $bmp = New-Object System.Drawing.Bitmap($img.Width, $h)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.DrawImage($img, (New-Object System.Drawing.Rectangle(0, 0, $img.Width, $h)), $rect, [System.Drawing.GraphicsUnit]::Pixel)
    $outPath = "$outDir\slice_$($i).png"
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Saved slice $i to $outPath (Y: $y, Height: $h)"
}
$img.Dispose()
