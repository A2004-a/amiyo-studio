$appVersion = "0.0.1"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "         Amiyo Studio Version Check       " -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Latest Release: v$appVersion" -ForegroundColor Green

$installDir = Join-Path $env:LOCALAPPDATA "AmiyoStudio"
$userHomeDir = Join-Path $env:USERPROFILE "amiyo-studio"
$currentDir = (Get-Location).Path

$foundPath = $null
if ((Test-Path (Join-Path $currentDir "index.html")) -and (Test-Path (Join-Path $currentDir "bin\cli.js"))) {
    $foundPath = $currentDir
} elseif (Test-Path (Join-Path $installDir "index.html")) {
    $foundPath = $installDir
} elseif (Test-Path (Join-Path $userHomeDir "index.html")) {
    $foundPath = $userHomeDir
}

if ($foundPath) {
    Write-Host "Installed: YES" -ForegroundColor Green
    Write-Host "Location:  $foundPath" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "To open Amiyo Studio, type:" -ForegroundColor White
    Write-Host "  amiyo" -ForegroundColor Yellow
} else {
    Write-Host "Installed: NO (Not downloaded yet)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To download and open immediately, run:" -ForegroundColor White
    Write-Host "  irm https://raw.githubusercontent.com/A2004-a/amiyo-studio/main/install.ps1 | iex" -ForegroundColor Cyan
}

