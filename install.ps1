param(
    [switch]$Version,
    [switch]$Help
)

$appVersion = "0.0.1"
$githubRepo = "A2004-a/amiyo-studio"
$zipUrl = "https://github.com/A2004-a/amiyo-studio/archive/refs/heads/main.zip"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "          Amiyo Studio v$appVersion       " -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Version Check Request
if ($Version -or ($args -contains "--version") -or ($args -contains "-v") -or ($args -contains "version") -or ($env:AMIYO_VERSION_ONLY -eq "1")) {
    Write-Host "Installed Version: v$appVersion" -ForegroundColor Green
    return
}

# 2. Check if already installed
$targetDir = ""
$currentDir = (Get-Location).Path
$standardDir = Join-Path $env:LOCALAPPDATA "AmiyoStudio"
$userHomeDir = Join-Path $env:USERPROFILE "amiyo-studio"

if ((Test-Path (Join-Path $currentDir "index.html")) -and (Test-Path (Join-Path $currentDir "bin\cli.js"))) {
    $targetDir = $currentDir
    Write-Host "[OK] Detected active workspace: $targetDir" -ForegroundColor Green
} elseif (Test-Path (Join-Path $standardDir "index.html")) {
    $targetDir = $standardDir
    Write-Host "[OK] Amiyo Studio is already installed at: $targetDir" -ForegroundColor Green
    Write-Host "[OK] Skipping download - directly opening installed app." -ForegroundColor Green
} elseif (Test-Path (Join-Path $userHomeDir "index.html")) {
    $targetDir = $userHomeDir
    Write-Host "[OK] Amiyo Studio is already installed at: $targetDir" -ForegroundColor Green
    Write-Host "[OK] Skipping download - directly opening installed app." -ForegroundColor Green
} else {
    # NOT INSTALLED -> Download and install now
    Write-Host "[INFO] Amiyo Studio is not installed on this system." -ForegroundColor Yellow
    Write-Host "[INFO] Downloading and installing Amiyo Studio v$appVersion..." -ForegroundColor Cyan

    $targetDir = $standardDir
    if (-not (Test-Path $targetDir)) {
        New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    }

    $downloadSuccess = $false
    if (Get-Command git -ErrorAction SilentlyContinue) {
        try {
            git clone --depth 1 "https://github.com/$githubRepo.git" $targetDir
            $downloadSuccess = $true
        } catch {
            $downloadSuccess = $false
        }
    }

    if (-not $downloadSuccess) {
        $tempZip = Join-Path $env:TEMP "amiyo-studio-main.zip"
        Invoke-WebRequest -Uri $zipUrl -OutFile $tempZip
        $tempExtract = Join-Path $env:TEMP "amiyo_extract_temp"
        if (Test-Path $tempExtract) {
            Remove-Item $tempExtract -Recurse -Force
        }
        Expand-Archive -Path $tempZip -DestinationPath $tempExtract -Force
        $extractedFolder = Join-Path $tempExtract "amiyo-studio-main"
        Copy-Item -Path "$extractedFolder\*" -Destination $targetDir -Recurse -Force
        Remove-Item $tempZip -Force -ErrorAction SilentlyContinue
        Remove-Item $tempExtract -Recurse -Force -ErrorAction SilentlyContinue
    }

    Write-Host "[OK] Installation completed successfully!" -ForegroundColor Green
}

# 3. Register global Windows terminal command 'amiyo'
try {
    $windowsApps = Join-Path $env:LOCALAPPDATA "Microsoft\WindowsApps"
    if (Test-Path $windowsApps) {
        $cmdShim = Join-Path $windowsApps "amiyo.cmd"
        $cmdLines = @(
            "@echo off",
            "if /i `"%~1`"==`"--version`" (echo Amiyo Studio v$appVersion & exit /b 0)",
            "if /i `"%~1`"==`"-v`" (echo Amiyo Studio v$appVersion & exit /b 0)",
            "if /i `"%~1`"==`"version`" (echo Amiyo Studio v$appVersion & exit /b 0)",
            "where node >nul 2>&1",
            "if %ERRORLEVEL% equ 0 (",
            "  node `"$targetDir\bin\cli.js`" %*",
            "  exit /b %ERRORLEVEL%",
            ")",
            "start `"`" `"$targetDir\index.html`"",
            "exit /b 0"
        )
        [System.IO.File]::WriteAllLines($cmdShim, $cmdLines, [System.Text.Encoding]::ASCII)
    }
} catch {
    # Non-fatal shim registration
}

# Register function in current PowerShell session for immediate terminal access
function global:amiyo {
    param([string]$Arg1)
    if ($Arg1 -eq "--version" -or $Arg1 -eq "-v" -or $Arg1 -eq "version") {
        Write-Host "Amiyo Studio v0.0.1" -ForegroundColor Green
        return
    }
    $cli = Join-Path $targetDir "bin\cli.js"
    $html = Join-Path $targetDir "index.html"
    if ((Get-Command node -ErrorAction SilentlyContinue) -and (Test-Path $cli)) {
        node $cli $args
    } else {
        Start-Process $html
    }
}

# 4. DIRECTLY OPEN AMIRYO STUDIO
Write-Host "[->] Directly opening Amiyo Studio..." -ForegroundColor Cyan

$cliScript = Join-Path $targetDir "bin\cli.js"
$entryHtml = Join-Path $targetDir "index.html"

if ((Get-Command node -ErrorAction SilentlyContinue) -and (Test-Path $cliScript)) {
    Write-Host "[OK] Starting local engine at http://localhost:3000 ..." -ForegroundColor Green
    node $cliScript
} else {
    Write-Host "[OK] Opening in default browser..." -ForegroundColor Green
    Start-Process $entryHtml
}
