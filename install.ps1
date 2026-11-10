Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "      Launching Amiyo Studio              " -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Cyan

# Check if we are already inside the amiyo-studio repository
if ((Test-Path "index.html") -and (Test-Path "bin\cli.js")) {
    Write-Host "Running in current directory..." -ForegroundColor Green
} else {
    $currentPath = (Get-Location).Path
    $projectDir = Join-Path $currentPath "amiyo-studio"
    if (Test-Path $projectDir) {
        Write-Host "Found existing amiyo-studio directory, updating..." -ForegroundColor Green
        Set-Location $projectDir
        if (Get-Command git -ErrorAction SilentlyContinue) {
            git pull origin main
        }
    } else {
        Write-Host "Downloading Amiyo Studio..." -ForegroundColor Green
        if (Get-Command git -ErrorAction SilentlyContinue) {
            git clone --depth 1 https://github.com/A2004-a/amiyo-studio.git $projectDir
            Set-Location $projectDir
        } else {
            $zipUrl = "https://github.com/A2004-a/amiyo-studio/archive/refs/heads/main.zip"
            $zipPath = Join-Path $currentPath "amiyo-studio.zip"
            Invoke-WebRequest -Uri $zipUrl -OutFile $zipPath
            Expand-Archive -Path $zipPath -DestinationPath $currentPath -Force
            Remove-Item $zipPath -Force
            Rename-Item (Join-Path $currentPath "amiyo-studio-main") "amiyo-studio" -Force
            Set-Location $projectDir
        }
    }
}

Write-Host "Amiyo Studio ready!" -ForegroundColor Green

# Resolve launcher files
$entryHtml = Join-Path (Get-Location).Path "index.html"
$cliScript = Join-Path (Get-Location).Path "bin\cli.js"

if ((Get-Command node -ErrorAction SilentlyContinue) -and (Test-Path $cliScript)) {
    Write-Host "Starting local high-speed server..." -ForegroundColor Cyan
    node bin\cli.js
} else {
    Write-Host "Opening Amiyo Studio directly in browser..." -ForegroundColor Cyan
    Start-Process $entryHtml
}
