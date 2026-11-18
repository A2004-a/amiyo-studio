# Amiyo Studio CLI Launcher
$appVersion = "1.0.0"

# Check version requests
if ($args -contains "--version" -or $args -contains "-v" -or $args -contains "version" -or $args -contains "-version" -or $args -contains "/v") {
    Write-Host "Amiyo Studio v$appVersion" -ForegroundColor Green
    return
}

# Check update requests
if ($args -contains "update" -or $args -contains "upgrade" -or $args -contains "--update" -or $args -contains "-update") {
    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    $rootDir = Split-Path -Parent $scriptDir
    $searchUpdates = @(
        (Join-Path $rootDir "update.ps1"),
        (Join-Path (Get-Location).Path "update.ps1"),
        (Join-Path $env:USERPROFILE "Desktop\amiyo studio 2\update.ps1"),
        (Join-Path $env:LOCALAPPDATA "AmiyoStudio\update.ps1"),
        (Join-Path $env:USERPROFILE "amiyo-studio\update.ps1")
    )
    foreach ($candidate in $searchUpdates) {
        if ($candidate -and (Test-Path $candidate)) {
            & $candidate
            return
        }
    }
    irm https://raw.githubusercontent.com/A2004-a/amiyo-studio/main/update.ps1 | iex
    return
}

# Check help requests
if ($args -contains "--help" -or $args -contains "-h" -or $args -contains "help" -or $args -contains "-help" -or $args -contains "/?") {
    Write-Host "Amiyo Studio CLI v$appVersion" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage:"
    Write-Host "  amiyo                 Directly open Amiyo Studio"
    Write-Host "  amiyo update          Update existing installation to latest version"
    Write-Host "  amiyo --version, -v   Show installed version"
    Write-Host "  amiyo --help, -h      Show this help message"
    Write-Host "  amiyo -p 8080         Start local server on port 8080"
    return
}

# Resolve application root directory & modern native executable
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = Split-Path -Parent $scriptDir
$nativeExe = ""

$searchLocations = @(
    (Get-Location).Path,
    $rootDir,
    (Join-Path $env:USERPROFILE "Desktop\amiyo studio 2"),
    (Join-Path $env:LOCALAPPDATA "AmiyoStudio"),
    (Join-Path $env:LOCALAPPDATA "Programs\amiyo-studio"),
    (Join-Path $env:LOCALAPPDATA "Programs\Amiyo Studio"),
    "C:\Program Files\Amiyo Studio",
    "C:\Program Files (x86)\Amiyo Studio",
    (Join-Path $env:USERPROFILE "amiyo-studio")
)

foreach ($loc in $searchLocations) {
    if (Test-Path $loc) {
        $exe1 = Join-Path $loc "Amiyo Studio.exe"
        $exe2 = Join-Path $loc "amiyo-studio.exe"
        $candidateExe = ""
        if (Test-Path $exe1) { $candidateExe = $exe1 }
        elseif (Test-Path $exe2) { $candidateExe = $exe2 }

        if ($candidateExe) {
            try {
                $verStr = (Get-Item $candidateExe).VersionInfo.ProductVersion
                if ($verStr) {
                    $major = [int]($verStr.Split('.')[0])
                    if ($major -ge 1) {
                        $nativeExe = $candidateExe
                        $rootDir = $loc
                        break
                    }
                }
            } catch {}
        }

        if ((Test-Path (Join-Path $loc "index.html")) -and (Test-Path (Join-Path $loc "bin\cli.js"))) {
            $rootDir = $loc
            break
        } elseif (Test-Path (Join-Path $loc "index.html")) {
            $rootDir = $loc
            break
        }
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
        Write-Host "Opening Amiyo Studio v$appVersion..." -ForegroundColor Cyan
        Start-Process $htmlPath
    }
}
