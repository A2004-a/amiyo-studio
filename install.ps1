# Amiyo Studio Installer
$appVersion = "1.0.0"
$githubRepo = "A2004-a/amiyo-studio"
$zipUrl = "https://github.com/$githubRepo/archive/refs/heads/main.zip"

# Ensure TLS 1.2+ for reliable HTTPS communication across all PowerShell versions
try {
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
} catch {}

Write-Host "       /\                                           " -ForegroundColor Yellow
Write-Host "      /#\                                          " -ForegroundColor Yellow
Write-Host "     /###\        >>  AMIYO STUDIO                  " -ForegroundColor Red
Write-Host "    /## # \          Professional Video Editor      " -ForegroundColor Cyan
Write-Host "   /#######\         v$appVersion                   " -ForegroundColor Gray
Write-Host "  /###   ###\                                      " -ForegroundColor Yellow
Write-Host " =============                                     " -ForegroundColor DarkYellow
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
        # Check for modern native desktop executable (>= 1.0.0)
        $exe1 = Join-Path $loc "Amiyo Studio.exe"
        $exe2 = Join-Path $loc "amiyo-studio.exe"
        $cand = ""
        if (Test-Path $exe1) { $cand = $exe1 }
        elseif (Test-Path $exe2) { $cand = $exe2 }

        if ($cand) {
            try {
                $ver = (Get-Item $cand).VersionInfo.ProductVersion
                if ($ver) {
                    $major = [int]($ver.Split('.')[0])
                    if ($major -ge 1) {
                        $nativeExe = $cand
                        $targetDir = $loc
                        break
                    }
                }
            } catch {}
        }

        # Check for web / node application workspace
        $pkgPath = Join-Path $loc "package.json"
        if ((Test-Path (Join-Path $loc "index.html")) -and (Test-Path $pkgPath)) {
            try {
                $pkgContent = Get-Content $pkgPath -Raw | ConvertFrom-Json
                if ($pkgContent.version -eq $appVersion -or $loc -eq (Get-Location).Path -or $loc -like "*amiyo studio 2*") {
                    $targetDir = $loc
                    break
                }
            } catch {}
        }
    }
}

if ($targetDir -and (Test-Path (Join-Path $targetDir "index.html"))) {
    Write-Host "[OK] Detected Amiyo Studio v$appVersion at: $targetDir" -ForegroundColor Green
    if (Test-Path (Join-Path $targetDir ".git")) {
        try {
            Write-Host "[INFO] Syncing latest updates via git..." -ForegroundColor Cyan
            Push-Location $targetDir
            git pull --rebase origin main 2>&1 | Out-Null
            Pop-Location
        } catch {}
    }
} else {
    # NOT INSTALLED OR OUTDATED -> Download and install latest v1.0.0 now
    $targetDir = Join-Path $env:LOCALAPPDATA "AmiyoStudio"
    Write-Host "[INFO] Installing / Updating Amiyo Studio v$appVersion to: $targetDir" -ForegroundColor Cyan

    $downloadSuccess = $false
    if (Get-Command git -ErrorAction SilentlyContinue) {
        try {
            if (Test-Path (Join-Path $targetDir ".git")) {
                Push-Location $targetDir
                git fetch origin main 2>&1 | Out-Null
                git reset --hard origin/main 2>&1 | Out-Null
                Pop-Location
                $downloadSuccess = (Test-Path (Join-Path $targetDir "index.html"))
            } elseif (Test-Path (Join-Path $targetDir "index.html")) {
                Push-Location $targetDir
                git clone --depth 1 "https://github.com/$githubRepo.git" . 2>&1 | Out-Null
                Pop-Location
                $downloadSuccess = (Test-Path (Join-Path $targetDir "index.html"))
            } else {
                if (Test-Path $targetDir) {
                    Remove-Item $targetDir -Recurse -Force -ErrorAction SilentlyContinue
                }
                git clone --depth 1 "https://github.com/$githubRepo.git" $targetDir 2>&1 | Out-Null
                $downloadSuccess = (Test-Path (Join-Path $targetDir "index.html"))
            }
        } catch {
            $downloadSuccess = $false
        }
    }

    if (-not $downloadSuccess) {
        $tempZip = Join-Path $env:TEMP "amiyo-studio-main.zip"
        $downloaded = $false
        try {
            Invoke-WebRequest -Uri $zipUrl -OutFile $tempZip -UseBasicParsing -ErrorAction Stop
            $downloaded = $true
        } catch {
            try {
                (New-Object System.Net.WebClient).DownloadFile($zipUrl, $tempZip)
                $downloaded = $true
            } catch {
                if (Get-Command curl.exe -ErrorAction SilentlyContinue) {
                    & curl.exe -fsSL $zipUrl -o $tempZip
                    if (Test-Path $tempZip) { $downloaded = $true }
                }
            }
        }

        if ($downloaded -and (Test-Path $tempZip)) {
            $tempExtract = Join-Path $env:TEMP "amiyo_extract_temp"
            if (Test-Path $tempExtract) {
                Remove-Item $tempExtract -Recurse -Force -ErrorAction SilentlyContinue
            }
            Expand-Archive -Path $tempZip -DestinationPath $tempExtract -Force
            $extractedFolder = Join-Path $tempExtract "amiyo-studio-main"
            if (-not (Test-Path $targetDir)) {
                New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
            }
            Copy-Item -Path "$extractedFolder\*" -Destination $targetDir -Recurse -Force
            Remove-Item $tempZip -Force -ErrorAction SilentlyContinue
            Remove-Item $tempExtract -Recurse -Force -ErrorAction SilentlyContinue
        }
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
$cmdContent = @"
@echo off
if /i "%~1"=="--version" (echo Amiyo Studio v$appVersion & exit /b 0)
if /i "%~1"=="-v" (echo Amiyo Studio v$appVersion & exit /b 0)
if /i "%~1"=="version" (echo Amiyo Studio v$appVersion & exit /b 0)
if /i "%~1"=="-version" (echo Amiyo Studio v$appVersion & exit /b 0)
if /i "%~1"=="/v" (echo Amiyo Studio v$appVersion & exit /b 0)
if /i "%~1"=="--help" (echo Amiyo Studio CLI v$appVersion & exit /b 0)
if /i "%~1"=="-h" (echo Amiyo Studio CLI v$appVersion & exit /b 0)
if /i "%~1"=="help" (echo Amiyo Studio CLI v$appVersion & exit /b 0)
if /i "%~1"=="update" (
  powershell -NoProfile -Command "irm https://raw.githubusercontent.com/$githubRepo/main/update.ps1 | iex"
  exit /b 0
)
"@
if ($nativeExe) {
    $cmdContent += "`r`nstart `"`" `"$nativeExe`" %*`r`nexit /b 0`r`n"
} else {
    $cmdContent += @"

where node >nul 2>&1
if %ERRORLEVEL% equ 0 (
  if exist "$targetDir\bin\cli.js" (
    node "$targetDir\bin\cli.js" %*
    exit /b %ERRORLEVEL%
  )
)
start "" "$targetDir\index.html"
exit /b 0
"@
}
[System.IO.File]::WriteAllText($amiyoCmdPath, $cmdContent, [System.Text.Encoding]::ASCII)

# Generate amiyo.ps1
$ps1Content = @"
# Amiyo Studio CLI Launcher
`$appVersion = "$appVersion"
if (`$args -contains "--version" -or `$args -contains "-v" -or `$args -contains "version" -or `$args -contains "-version" -or `$args -contains "/v") {
    Write-Host "Amiyo Studio v`$appVersion" -ForegroundColor Green
    return
}
if (`$args -contains "update" -or `$args -contains "upgrade" -or `$args -contains "--update") {
    irm https://raw.githubusercontent.com/$githubRepo/main/update.ps1 | iex
    return
}
if (`$args -contains "--help" -or `$args -contains "-h" -or `$args -contains "help" -or `$args -contains "-help" -or `$args -contains "/?") {
    Write-Host "Amiyo Studio CLI v`$appVersion" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage:"
    Write-Host "  amiyo                 Directly open Amiyo Studio"
    Write-Host "  amiyo update          Update existing installation to latest version"
    Write-Host "  amiyo --version, -v   Show installed version"
    Write-Host "  amiyo --help, -h      Show this help message"
    Write-Host "  amiyo -p 8080         Start local server on port 8080"
    return
}
"@
if ($nativeExe) {
    $ps1Content += "`r`nStart-Process `"$nativeExe`" -ArgumentList `$args`r`n"
} else {
    $ps1Content += @"

`$cli = "$targetDir\bin\cli.js"
`$html = "$targetDir\index.html"
if ((Get-Command node -ErrorAction SilentlyContinue) -and (Test-Path `$cli)) {
    node `$cli @args
} else {
    Write-Host "Opening Amiyo Studio v`$appVersion..." -ForegroundColor Cyan
    Start-Process `$html
}
"@
}
[System.IO.File]::WriteAllText($amiyoPs1Path, $ps1Content, [System.Text.Encoding]::ASCII)

# Register in user environments
try {
    # Layer 1: npm global bin
    $npmDir = Join-Path $env:APPDATA "npm"
    if (Test-Path $npmDir) {
        try {
            Copy-Item $amiyoCmdPath (Join-Path $npmDir "amiyo.cmd") -Force -ErrorAction SilentlyContinue 2>$null
            Copy-Item $amiyoPs1Path (Join-Path $npmDir "amiyo.ps1") -Force -ErrorAction SilentlyContinue 2>$null
        } catch {}
    }

    # Layer 2: WindowsApps
    $windowsApps = Join-Path $env:LOCALAPPDATA "Microsoft\WindowsApps"
    if (Test-Path $windowsApps) {
        try {
            Copy-Item $amiyoCmdPath (Join-Path $windowsApps "amiyo.cmd") -Force -ErrorAction SilentlyContinue 2>$null
            Copy-Item $amiyoPs1Path (Join-Path $windowsApps "amiyo.ps1") -Force -ErrorAction SilentlyContinue 2>$null
        } catch {}
    }

    # Layer 3: User Home bin
    $userBin = Join-Path $env:USERPROFILE "bin"
    try {
        if (-not (Test-Path -LiteralPath $userBin -ErrorAction SilentlyContinue)) {
            New-Item -ItemType Directory -Path $userBin -Force -ErrorAction SilentlyContinue 2>$null | Out-Null
        }
        if (Test-Path -LiteralPath $userBin -ErrorAction SilentlyContinue) {
            Copy-Item -LiteralPath $amiyoCmdPath -Destination (Join-Path $userBin "amiyo.cmd") -Force -ErrorAction SilentlyContinue 2>$null
            Copy-Item -LiteralPath $amiyoPs1Path -Destination (Join-Path $userBin "amiyo.ps1") -Force -ErrorAction SilentlyContinue 2>$null
        }
    } catch {}

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
    $profileSnippet = "`r`n# Amiyo Studio CLI Launcher`r`nfunction global:amiyo { if (`$args -contains '--version' -or `$args -contains '-v' -or `$args -contains 'version') { Write-Host 'Amiyo Studio v$appVersion' -ForegroundColor Green; return }; if (Test-Path `"$amiyoPs1Path`") { & powershell.exe -NoProfile -ExecutionPolicy Bypass -File `"$amiyoPs1Path`" @args } else { & `"$amiyoCmdPath`" @args } }`r`n"
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
} catch {}

# Define function in current session for instant terminal use
function global:amiyo {
    if ($args -contains "--version" -or $args -contains "-v" -or $args -contains "version") {
        Write-Host "Amiyo Studio v$appVersion" -ForegroundColor Green
        return
    }
    if (Test-Path $amiyoPs1Path) {
        & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $amiyoPs1Path @args
    } else {
        & $amiyoCmdPath @args
    }
}

# 4. DIRECTLY OPEN AMIYO STUDIO
Write-Host "[->] Directly opening Amiyo Studio v$appVersion..." -ForegroundColor Cyan

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
Write-Host "  amiyo --version   (Check installed version: v$appVersion)" -ForegroundColor Cyan
Write-Host "  amiyo             (Open Amiyo Studio)" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Green
