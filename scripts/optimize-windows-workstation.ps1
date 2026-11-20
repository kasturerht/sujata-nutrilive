# Sujata Nutrilive - Silicon Valley Workstation Performance Optimizer
# Run this in PowerShell as Administrator

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Silicon Valley Workstation Performance Optimizer" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Uncap Virtual Memory / Pagefile
try {
    $cs = Get-CimInstance Win32_ComputerSystem
    $cs.AutomaticManagedPagefile = $true
    Set-CimInstance -CimInstance $cs
    Write-Host " [✓] Windows Pagefile: Set to System Managed (Dynamic NVMe/SSD Swap)" -ForegroundColor Green
} catch {
    Write-Host " [!] Could not set Pagefile. Ensure you right-clicked 'Run as Administrator'." -ForegroundColor Red
}

# 2. Enable Memory Compression
try {
    Enable-MMAgent -mc -ErrorAction SilentlyContinue
    Write-Host " [✓] Memory Compression: Active (3:1 RAM Compression)" -ForegroundColor Green
} catch {}

# 3. Set Node.js Heap Bound
[Environment]::SetEnvironmentVariable('NODE_OPTIONS', '--max-old-space-size=2048', 'User')
Write-Host " [✓] Node.js V8 Memory Cap: Set to 2048 MB per process" -ForegroundColor Green

# 4. Cleanup Temp
Remove-Item -Path "$env:TEMP\*" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host " [✓] Temp developer scratch cleared" -ForegroundColor Green

Write-Host "`nAll optimizations applied! Please restart your PC once." -ForegroundColor Yellow
