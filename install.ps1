$appVersion = "0.0.1"
$githubRepo = "A2004-a/amiyo-studio"
$zipUrl = "https://github.com/$githubRepo/archive/refs/heads/main.zip"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "          Amiyo Studio v$appVersion       " -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan

# 1. Version Check Request
if ($args -contains "--version" -or $args -contains "-v" -or $args -contains "version" -or $args -contains "-version" -or $args -contains "/v" -or $env:AMIYO_VERSION_ONLY -eq "1") {
    Write-Host "Installed Version: v$appVersion" -ForegroundColor Green
    return
}

# 2. Search for existing installations across Desktop app and Web app locations
$targetDir = ""
$nativeExe = ""

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

foreach ($loc in $searchLocations) {
    if (Test-Path $loc) {
        # Check for native desktop executable
        $exe1 = Join-Path $loc "Amiyo Studio.exe"
        $exe2 = Join-Path $loc "amiyo-studio.exe"
        if (Test-Path $exe1) {
            $nativeExe = $exe1
            $targetDir = $loc
            break
        } elseif (Test-Path $exe2) {
            $nativeExe = $exe2
            $targetDir = $loc
            break
        } elseif ((Test-Path (Join-Path $loc "index.html")) -and (Test-Path (Join-Path $loc "bin\cli.js"))) {
            $targetDir = $loc
            break
        } elseif (Test-Path (Join-Path $loc "index.html")) {
            $targetDir = $loc
            break
        }
    }
}

if ($targetDir) {
    Write-Host "[OK] Detected Amiyo Studio installation at: $targetDir" -ForegroundColor Green
    Write-Host "[OK] Skipping download - configuring terminal commands directly." -ForegroundColor Green
} else {
    # NOT INSTALLED -> Download and install now
    Write-Host "[INFO] Amiyo Studio is not installed on this system." -ForegroundColor Yellow
    Write-Host "[INFO] Downloading and installing Amiyo Studio v$appVersion..." -ForegroundColor Cyan

    $targetDir = Join-Path $env:LOCALAPPDATA "AmiyoStudio"
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

# 3. Build & Register global CLI executable scripts
$binDir = Join-Path $targetDir "bin"
if (-not (Test-Path $binDir)) {
    New-Item -ItemType Directory -Path $binDir -Force | Out-Null
}

$amiyoCmdPath = Join-Path $binDir "amiyo.cmd"
$amiyoPs1Path = Join-Path $binDir "amiyo.ps1"

# Generate amiyo.cmd
$cmdLines = @(
    "@echo off",
    "if /i `"%~1`"==`"--version`" (echo Amiyo Studio v$appVersion & exit /b 0)",
    "if /i `"%~1`"==`"-v`" (echo Amiyo Studio v$appVersion & exit /b 0)",
    "if /i `"%~1`"==`"version`" (echo Amiyo Studio v$appVersion & exit /b 0)",
    "if /i `"%~1`"==`"-version`" (echo Amiyo Studio v$appVersion & exit /b 0)",
    "if /i `"%~1`"==`"/v`" (echo Amiyo Studio v$appVersion & exit /b 0)"
)

if ($nativeExe) {
    $cmdLines += "start `"`" `"$nativeExe`" %*"
    $cmdLines += "exit /b 0"
} else {
    $cmdLines += "where node >nul 2>&1"
    $cmdLines += "if %ERRORLEVEL% equ 0 ("
    $cmdLines += "  if exist `"$targetDir\bin\cli.js`" ("
    $cmdLines += "    node `"$targetDir\bin\cli.js`" %*"
    $cmdLines += "    exit /b %ERRORLEVEL%"
    $cmdLines += "  )"
    $cmdLines += ")"
    $cmdLines += "start `"`" `"$targetDir\index.html`""
    $cmdLines += "exit /b 0"
}
[System.IO.File]::WriteAllLines($amiyoCmdPath, $cmdLines, [System.Text.Encoding]::ASCII)

# Generate amiyo.ps1
$ps1Lines = @(
    "`$appVersion = `"$appVersion`"",
    "if (`$args -contains `"--version`" -or `$args -contains `"-v`" -or `$args -contains `"version`" -or `$args -contains `"-version`" -or `$args -contains `"/v`") {",
    "    Write-Host `"Amiyo Studio v`$appVersion`" -ForegroundColor Green",
    "    return",
    "}"
)
if ($nativeExe) {
    $ps1Lines += "Start-Process `"$nativeExe`" -ArgumentList `$args"
} else {
    $ps1Lines += "`$cli = `"$targetDir\bin\cli.js`""
    $ps1Lines += "`$html = `"$targetDir\index.html`""
    $ps1Lines += "if ((Get-Command node -ErrorAction SilentlyContinue) -and (Test-Path `$cli)) {",
    $ps1Lines += "    node `$cli @args",
    $ps1Lines += "} else {",
    $ps1Lines += "    Start-Process `$html",
    $ps1Lines += "}"
}
[System.IO.File]::WriteAllLines($amiyoPs1Path, $ps1Lines, [System.Text.Encoding]::ASCII)

# Register across Windows system locations
try {
    # Layer 1: npm global bin (standard Windows dev PATH)
    $npmDir = Join-Path $env:APPDATA "npm"
    if (Test-Path $npmDir) {
        Copy-Item $amiyoCmdPath (Join-Path $npmDir "amiyo.cmd") -Force -ErrorAction SilentlyContinue
        Copy-Item $amiyoPs1Path (Join-Path $npmDir "amiyo.ps1") -Force -ErrorAction SilentlyContinue
    }

    # Layer 2: WindowsApps
    $windowsApps = Join-Path $env:LOCALAPPDATA "Microsoft\WindowsApps"
    if (Test-Path $windowsApps) {
        Copy-Item $amiyoCmdPath (Join-Path $windowsApps "amiyo.cmd") -Force -ErrorAction SilentlyContinue
        Copy-Item $amiyoPs1Path (Join-Path $windowsApps "amiyo.ps1") -Force -ErrorAction SilentlyContinue
    }

    # Layer 3: User Home bin
    $userBin = Join-Path $env:USERPROFILE "bin"
    if (-not (Test-Path $userBin)) { New-Item -ItemType Directory -Path $userBin -Force -ErrorAction SilentlyContinue | Out-Null }
    if (Test-Path $userBin) {
        Copy-Item $amiyoCmdPath (Join-Path $userBin "amiyo.cmd") -Force -ErrorAction SilentlyContinue
        Copy-Item $amiyoPs1Path (Join-Path $userBin "amiyo.ps1") -Force -ErrorAction SilentlyContinue
    }

    # Layer 4: Permanent User PATH in Windows Registry
    $userPath = [Environment]::GetEnvironmentVariable("Path", [EnvironmentVariableTarget]::User)
    $pathsToAdd = @($binDir, $userBin)
    $updatedPath = $userPath
    foreach ($p in $pathsToAdd) {
        if ($updatedPath -notlike "*$p*") {
            $updatedPath = "$p;$updatedPath"
        }
    }
    if ($updatedPath -ne $userPath) {
        [Environment]::SetEnvironmentVariable("Path", $updatedPath, [EnvironmentVariableTarget]::User)
    }

    # Layer 5: Update current session PATH
    if ($env:Path -notlike "*$binDir*") {
        $env:Path = "$binDir;$userBin;$env:Path"
    }

    # Layer 6: PowerShell Profiles
    $profileSnippet = "`r`n# Amiyo Studio CLI Launcher`r`nfunction global:amiyo { & `"$amiyoPs1Path`" @args }`r`n"
    $profilePaths = @(
        "$env:USERPROFILE\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1",
        "$env:USERPROFILE\Documents\PowerShell\Microsoft.PowerShell_profile.ps1"
    )
    foreach ($pPath in $profilePaths) {
        try {
            $pDir = Split-Path -Parent $pPath
            if (-not (Test-Path $pDir)) { New-Item -ItemType Directory -Path $pDir -Force -ErrorAction SilentlyContinue | Out-Null }
            if (-not (Test-Path $pPath) -or (Get-Content $pPath -Raw -ErrorAction SilentlyContinue) -notlike "*Amiyo Studio CLI Launcher*") {
                Add-Content -Path $pPath -Value $profileSnippet -ErrorAction SilentlyContinue
            }
        } catch {}
    }
} catch {
    # Non-fatal registration
}

# Define function in current session for instant terminal use
function global:amiyo {
    & $amiyoPs1Path @args
}

# 4. DIRECTLY OPEN AMIRYO STUDIO
Write-Host "[->] Directly opening Amiyo Studio..." -ForegroundColor Cyan

if ($nativeExe) {
    Start-Process $nativeExe
} elseif ((Get-Command node -ErrorAction SilentlyContinue) -and (Test-Path (Join-Path $targetDir "bin\cli.js"))) {
    Write-Host "[OK] Starting local server engine in background..." -ForegroundColor Green
    $cliScript = Join-Path $targetDir "bin\cli.js"
    Start-Process -FilePath "node" -ArgumentList "`"$cliScript`"" -WindowStyle Hidden
    Start-Sleep -Milliseconds 600
    Start-Process "http://localhost:3000"
} else {
    Write-Host "[OK] Opening in default browser..." -ForegroundColor Green
    Start-Process (Join-Path $targetDir "index.html")
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "   Amiyo Studio is now ACTIVE and READY!  " -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Green
Write-Host "Terminal commands are now working! Try typing:" -ForegroundColor White
Write-Host "  amiyo --version   (Check installed version)" -ForegroundColor Cyan
Write-Host "  amiyo             (Open Amiyo Studio)" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Green
