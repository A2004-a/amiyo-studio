$appVersion = "0.0.1"

# Check version requests
if ($args -contains "--version" -or $args -contains "-v" -or $args -contains "version" -or $args -contains "-version" -or $args -contains "/v") {
    Write-Host "Amiyo Studio v$appVersion" -ForegroundColor Green
    return
}

# Check help requests
if ($args -contains "--help" -or $args -contains "-h" -or $args -contains "help" -or $args -contains "-help" -or $args -contains "/?") {
    Write-Host "Amiyo Studio CLI v$appVersion" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage:"
    Write-Host "  amiyo                 Directly open Amiyo Studio"
    Write-Host "  amiyo --version, -v   Show installed version"
    Write-Host "  amiyo --help, -h      Show this help message"
    Write-Host "  amiyo -p 8080         Start local server on port 8080"
    return
}

# Resolve application root directory & native executable
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = Split-Path -Parent $scriptDir
$nativeExe = ""

$searchLocations = @(
    $rootDir,
    (Join-Path $env:LOCALAPPDATA "Programs\amiyo-studio"),
    (Join-Path $env:LOCALAPPDATA "Programs\Amiyo Studio"),
    "C:\Program Files\Amiyo Studio",
    "C:\Program Files (x86)\Amiyo Studio",
    (Join-Path $env:LOCALAPPDATA "AmiyoStudio"),
    (Join-Path $env:USERPROFILE "Desktop\amiyo studio 2"),
    (Join-Path $env:USERPROFILE "amiyo-studio")
)

foreach ($loc in $searchLocations) {
    if (Test-Path $loc) {
        $exe1 = Join-Path $loc "Amiyo Studio.exe"
        $exe2 = Join-Path $loc "amiyo-studio.exe"
        if (Test-Path $exe1) { $nativeExe = $exe1; $rootDir = $loc; break }
        if (Test-Path $exe2) { $nativeExe = $exe2; $rootDir = $loc; break }
        if (Test-Path (Join-Path $loc "index.html")) { $rootDir = $loc; break }
    }
}

if ($nativeExe) {
    Start-Process $nativeExe -ArgumentList $args
} else {
    $cliPath = Join-Path $rootDir "bin\cli.js"
    $htmlPath = Join-Path $rootDir "index.html"
    if ((Get-Command node -ErrorAction SilentlyContinue) -and (Test-Path $cliPath)) {
        node $cliPath @args
    } else {
        Write-Host "Opening Amiyo Studio in default browser..." -ForegroundColor Cyan
        Start-Process $htmlPath
    }
}
