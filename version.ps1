$appVersion = "0.0.1"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "         Amiyo Studio Version Check       " -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Latest Release: v$appVersion" -ForegroundColor Green

$searchLocations = @(
    (Get-Location).Path,
    (Join-Path $env:LOCALAPPDATA "Programs\amiyo-studio"),
    (Join-Path $env:LOCALAPPDATA "Programs\Amiyo Studio"),
    "C:\Program Files\Amiyo Studio",
    "C:\Program Files (x86)\Amiyo Studio",
    (Join-Path $env:LOCALAPPDATA "AmiyoStudio"),
    (Join-Path $env:USERPROFILE "Desktop\amiyo studio 2"),
    (Join-Path $env:USERPROFILE "amiyo-studio")
)

$foundPath = $null
foreach ($loc in $searchLocations) {
    if (Test-Path $loc) {
        if ((Test-Path (Join-Path $loc "Amiyo Studio.exe")) -or (Test-Path (Join-Path $loc "amiyo-studio.exe"))) {
            $foundPath = $loc
            break
        } elseif (Test-Path (Join-Path $loc "index.html")) {
            $foundPath = $loc
            break
        }
    }
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
    Write-Host "  irm https://raw.githubusercontent.com/A2004-a/amiyo-studio/main/install.ps1?v=0.0.1 | iex" -ForegroundColor Cyan
}

