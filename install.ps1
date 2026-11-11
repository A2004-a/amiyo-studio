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

# 2. Check if already installed
$targetDir = ""
$currentDir = (Get-Location).Path
$standardDir = Join-Path $env:LOCALAPPDATA "AmiyoStudio"
$desktopDir = Join-Path $env:USERPROFILE "Desktop\amiyo studio 2"
$userHomeDir = Join-Path $env:USERPROFILE "amiyo-studio"

if ((Test-Path (Join-Path $currentDir "index.html")) -and (Test-Path (Join-Path $currentDir "bin\cli.js"))) {
    $targetDir = $currentDir
    Write-Host "[OK] Detected active workspace: $targetDir" -ForegroundColor Green
} elseif (Test-Path (Join-Path $standardDir "index.html")) {
    $targetDir = $standardDir
    Write-Host "[OK] Amiyo Studio is already installed at: $targetDir" -ForegroundColor Green
    Write-Host "[OK] Skipping download - directly opening installed app." -ForegroundColor Green
} elseif (Test-Path (Join-Path $desktopDir "index.html")) {
    $targetDir = $desktopDir
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

# 3. Register global Windows terminal command 'amiyo' across all shells
try {
    $srcCmd = Join-Path $targetDir "bin\amiyo.cmd"
    $srcPs1 = Join-Path $targetDir "bin\amiyo.ps1"
    $binDir = Join-Path $targetDir "bin"

    # Layer 1: npm global bin directory (always in PATH on developer machines)
    $npmDir = Join-Path $env:APPDATA "npm"
    if (Test-Path $npmDir) {
        if (Test-Path $srcCmd) { Copy-Item $srcCmd (Join-Path $npmDir "amiyo.cmd") -Force -ErrorAction SilentlyContinue }
        if (Test-Path $srcPs1) { Copy-Item $srcPs1 (Join-Path $npmDir "amiyo.ps1") -Force -ErrorAction SilentlyContinue }
    }

    # Layer 2: WindowsApps directory
    $windowsApps = Join-Path $env:LOCALAPPDATA "Microsoft\WindowsApps"
    if (Test-Path $windowsApps) {
        if (Test-Path $srcCmd) { Copy-Item $srcCmd (Join-Path $windowsApps "amiyo.cmd") -Force -ErrorAction SilentlyContinue }
        if (Test-Path $srcPs1) { Copy-Item $srcPs1 (Join-Path $windowsApps "amiyo.ps1") -Force -ErrorAction SilentlyContinue }
    }

    # Layer 3: PowerShell Profiles (guarantees EVERY new PowerShell terminal has 'amiyo')
    $profileSnippet = "`r`n# Amiyo Studio CLI Launcher`r`nfunction global:amiyo { & `"$binDir\amiyo.ps1`" @args }`r`n"
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

    # Layer 4: Permanent User PATH in Windows Registry
    $userPath = [Environment]::GetEnvironmentVariable("Path", [EnvironmentVariableTarget]::User)
    if ($userPath -notlike "*$binDir*") {
        [Environment]::SetEnvironmentVariable("Path", "$binDir;$userPath", [EnvironmentVariableTarget]::User)
    }
    if ($env:Path -notlike "*$binDir*") {
        $env:Path = "$binDir;$env:Path"
    }
} catch {
    # Non-fatal registration
}

# Define function in current session for instant use
function global:amiyo {
    & "$targetDir\bin\amiyo.ps1" @args
}

# 4. DIRECTLY OPEN AMIRYO STUDIO (NON-BLOCKING)
Write-Host "[->] Directly opening Amiyo Studio..." -ForegroundColor Cyan

$cliScript = Join-Path $targetDir "bin\cli.js"
$entryHtml = Join-Path $targetDir "index.html"

if ((Get-Command node -ErrorAction SilentlyContinue) -and (Test-Path $cliScript)) {
    Write-Host "[OK] Starting local server engine at http://localhost:3000 ..." -ForegroundColor Green
    Start-Process -FilePath "node" -ArgumentList "`"$cliScript`"" -WindowStyle Hidden
    Start-Sleep -Milliseconds 600
    Start-Process "http://localhost:3000"
} else {
    Write-Host "[OK] Opening in default browser..." -ForegroundColor Green
    Start-Process $entryHtml
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "   Amiyo Studio is now ACTIVE and READY!  " -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Green
Write-Host "You can now run commands in this terminal:" -ForegroundColor White
Write-Host "  amiyo --version   (Check version)" -ForegroundColor Cyan
Write-Host "  amiyo             (Open editor)" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Green
