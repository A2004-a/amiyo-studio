# Amiyo Studio - Windows 1-Line Installer & Launcher
# Usage: irm https://raw.githubusercontent.com/A2004-a/amiyo-studio/main/install.ps1 | iex

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "      🎬 Launching Amiyo Studio           " -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan

$targetDir = Join-Path $PWD "amiyo-studio"
if (Test-Path $targetDir) {
    Write-Host "Found existing amiyo-studio, updating..." -ForegroundColor Green
    Set-Location $targetDir
    if (Get-Command git -ErrorAction SilentlyContinue) {
        git pull origin main
    }
} else {
    Write-Host "Downloading Amiyo Studio..." -ForegroundColor Green
    if (Get-Command git -ErrorAction SilentlyContinue) {
        git clone https://github.com/A2004-a/amiyo-studio.git $targetDir
        Set-Location $targetDir
    } else {
        $zipUrl = "https://github.com/A2004-a/amiyo-studio/archive/refs/heads/main.zip"
        $zipPath = Join-Path $PWD "amiyo-studio.zip"
        Invoke-WebRequest -Uri $zipUrl -OutFile $zipPath
        Expand-Archive -Path $zipPath -DestinationPath $PWD -Force
        Remove-Item $zipPath
        Rename-Item (Join-Path $PWD "amiyo-studio-main") $targetDir
        Set-Location $targetDir
    }
}

Write-Host "✓ Amiyo Studio downloaded successfully!" -ForegroundColor Green

if (Get-Command node -ErrorAction SilentlyContinue) {
    Write-Host "Starting local high-speed server..." -ForegroundColor Cyan
    node bin/cli.js
} else {
    Write-Host "Opening Amiyo Studio directly in browser..." -ForegroundColor Cyan
    Start-Process (Join-Path $targetDir "index.html")
}

