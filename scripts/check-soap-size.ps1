Add-Type -AssemblyName System.Drawing
$imgPath = 'd:\Sujata Nutrilive\Website\Sujata-Nutrilive - v1\public\products\sujata-spiruglow-bath-soap-box.jpg'
$img = [System.Drawing.Image]::FromFile($imgPath)
Write-Host "Image size: $($img.Width) x $($img.Height)"
$img.Dispose()
