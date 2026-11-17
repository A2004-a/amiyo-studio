# Amiyo Studio Auto-Updater
$appVersion = "1.0.0"
$githubRepo = "A2004-a/amiyo-studio"
$zipUrl = "https://github.com/$githubRepo/archive/refs/heads/main.zip"

try {
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
} catch {}

Write-Host "       ▲                                           " -ForegroundColor Yellow
Write-Host "      /█\                                          " -ForegroundColor Yellow
Write-Host "     /███\        ▶  AMIYO STUDIO UPDATER          " -ForegroundColor Red
Write-Host "    /██ █ \          Updating old version to latest " -ForegroundColor Cyan
Write-Host "   /███████\                                       " -ForegroundColor Gray
Write-Host "  /███   ███\                                      " -ForegroundColor Yellow
Write-Host " ═════════════                                     " -ForegroundColor DarkYellow
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "      Amiyo Studio Auto-Updater           " -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Locate existing installation
$targetDir = ""
$searchLocations = @(
    (Get-Location).Path,
    (Join-Path $env:LOCALAPPDATA "AmiyoStudio"),
    (Join-Path $env:LOCALAPPDATA "Programs\amiyo-studio"),
    (Join-Path $env:LOCALAPPDATA "Programs\Amiyo Studio"),
    "C:\Program Files\Amiyo Studio",
    (Join-Path $env:USERPROFILE "Desktop\amiyo studio 2"),
    (Join-Path $env:USERPROFILE "amiyo-studio")
)

foreach ($loc in $searchLocations) {
    if ((Test-Path (Join-Path $loc "index.html")) -and (Test-Path (Join-Path $loc "bin\cli.js"))) {
        $targetDir = $loc
        break
    }
}

if (-not $targetDir) {
    $targetDir = Join-Path $env:LOCALAPPDATA "AmiyoStudio"
    Write-Host "[INFO] Installing fresh copy at: $targetDir" -ForegroundColor Yellow
} else {
    Write-Host "[OK] Found existing installation at: $targetDir" -ForegroundColor Green
}

# 2. Update via git or archive download
$updated = $false
if (Test-Path (Join-Path $targetDir ".git")) {
    try {
        Write-Host "[INFO] Pulling latest updates via git..." -ForegroundColor Cyan
        Push-Location $targetDir
        git pull --rebase origin main 2>&1 | Out-Null
        Pop-Location
        $updated = $true
    } catch {
        $updated = $false
    }
}

if (-not $updated) {
    Write-Host "[INFO] Downloading latest release archive..." -ForegroundColor Cyan
    $tempZip = Join-Path $env:TEMP "amiyo_update.zip"
    $tempExtract = Join-Path $env:TEMP "amiyo_update_extract"

    Invoke-WebRequest -Uri $zipUrl -OutFile $tempZip -UseBasicParsing -ErrorAction Stop
    if (Test-Path $tempExtract) { Remove-Item $tempExtract -Recurse -Force -ErrorAction SilentlyContinue }
    Expand-Archive -Path $tempZip -DestinationPath $tempExtract -Force

    if (-not (Test-Path $targetDir)) { New-Item -ItemType Directory -Path $targetDir -Force | Out-Null }
    Copy-Item -Path "$tempExtract\amiyo-studio-main\*" -Destination $targetDir -Recurse -Force
    Remove-Item $tempZip -Force -ErrorAction SilentlyContinue
    Remove-Item $tempExtract -Recurse -Force -ErrorAction SilentlyContinue
    $updated = $true
}

# 3. Update global CLI commands
$binDir = Join-Path $targetDir "bin"
$npmDir = Join-Path $env:APPDATA "npm"
$winApps = Join-Path $env:LOCALAPPDATA "Microsoft\WindowsApps"
$userBin = Join-Path $env:USERPROFILE "bin"

$amiyoCmd = Join-Path $binDir "amiyo.cmd"
$amiyoPs1 = Join-Path $binDir "amiyo.ps1"

foreach ($loc in @($npmDir, $winApps, $userBin)) {
    try {
        if ($loc -and (Test-Path -LiteralPath $loc -ErrorAction SilentlyContinue)) {
            Copy-Item -LiteralPath $amiyoCmd -Destination (Join-Path $loc "amiyo.cmd") -Force -ErrorAction SilentlyContinue 2>$null
            Copy-Item -LiteralPath $amiyoPs1 -Destination (Join-Path $loc "amiyo.ps1") -Force -ErrorAction SilentlyContinue 2>$null
        }
    } catch {}
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "  [OK] Amiyo Studio Updated Successfully! " -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host "To open Amiyo Studio now, run:" -ForegroundColor White
Write-Host "  amiyo" -ForegroundColor Yellow
