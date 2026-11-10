param(
    [switch]$Version,
    [switch]$Help,
    [switch]$NoOpen,
    [int]$Port = 3000
)

$appVersion = "0.0.1"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = Split-Path -Parent $scriptDir

if (-not (Test-Path (Join-Path $rootDir "index.html"))) {
    $rootDir = Join-Path $env:LOCALAPPDATA "AmiyoStudio"
}

if ($Version -or ($args -contains "--version") -or ($args -contains "-v") -or ($args -contains "version")) {
    Write-Host "Amiyo Studio v$appVersion" -ForegroundColor Green
    return
}

if ($Help -or ($args -contains "--help") -or ($args -contains "-h") -or ($args -contains "help")) {
    Write-Host "Amiyo Studio CLI v$appVersion" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage:"
    Write-Host "  amiyo                 Directly open Amiyo Studio"
    Write-Host "  amiyo --version, -v   Show installed version"
    Write-Host "  amiyo --help, -h      Show this help message"
    Write-Host "  amiyo -p 8080         Start local server on port 8080"
    return
}

$cliPath = Join-Path $rootDir "bin\cli.js"
$htmlPath = Join-Path $rootDir "index.html"

if ((Get-Command node -ErrorAction SilentlyContinue) -and (Test-Path $cliPath)) {
    node $cliPath $args
} else {
    Write-Host "Opening Amiyo Studio in default browser..." -ForegroundColor Cyan
    Start-Process $htmlPath
}
