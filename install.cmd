@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo           Amiyo Studio v0.0.1
echo ==========================================

rem Check version flag
if /i "%~1"=="--version" (
  echo Installed Version: v0.0.1
  exit /b 0
)
if /i "%~1"=="-v" (
  echo Installed Version: v0.0.1
  exit /b 0
)
if /i "%~1"=="version" (
  echo Installed Version: v0.0.1
  exit /b 0
)

set "TARGET_DIR=%CD%"
set "STANDARD_DIR=%LOCALAPPDATA%\AmiyoStudio"
set "NATIVE_EXE="

if exist "%LOCALAPPDATA%\Programs\amiyo-studio\Amiyo Studio.exe" (
  set "NATIVE_EXE=%LOCALAPPDATA%\Programs\amiyo-studio\Amiyo Studio.exe"
  set "TARGET_DIR=%LOCALAPPDATA%\Programs\amiyo-studio"
  echo [OK] Detected desktop installation at: !TARGET_DIR!
  goto :setup_cmd
)

if exist "%ProgramFiles%\Amiyo Studio\Amiyo Studio.exe" (
  set "NATIVE_EXE=%ProgramFiles%\Amiyo Studio\Amiyo Studio.exe"
  set "TARGET_DIR=%ProgramFiles%\Amiyo Studio"
  echo [OK] Detected desktop installation at: !TARGET_DIR!
  goto :setup_cmd
)

if exist "%TARGET_DIR%\index.html" if exist "%TARGET_DIR%\bin\cli.js" (
  echo [OK] Detected active workspace: %TARGET_DIR%
  goto :setup_cmd
)

if exist "%STANDARD_DIR%\index.html" (
  set "TARGET_DIR=%STANDARD_DIR%"
  echo [OK] Amiyo Studio is already installed at: !TARGET_DIR!
  echo [OK] Skipping download - directly opening installed app.
  goto :setup_cmd
)

rem Not installed -> Download now
echo [INFO] Amiyo Studio is not installed on this system.
echo [INFO] Downloading and installing Amiyo Studio v0.0.1...
if not exist "%STANDARD_DIR%" mkdir "%STANDARD_DIR%"

where git >nul 2>&1
if %ERRORLEVEL% equ 0 (
  git clone --depth 1 https://github.com/A2004-a/amiyo-studio.git "%STANDARD_DIR%"
  if %ERRORLEVEL% equ 0 (
    set "TARGET_DIR=%STANDARD_DIR%"
    goto :setup_cmd
  )
)

set "ZIP_TEMP=%TEMP%\amiyo_main.zip"
curl -fsSL "https://github.com/A2004-a/amiyo-studio/archive/refs/heads/main.zip" -o "%ZIP_TEMP%"
powershell -NoProfile -Command "Expand-Archive -Path '%ZIP_TEMP%' -DestinationPath '%TEMP%\amiyo_extract' -Force; Copy-Item -Path '%TEMP%\amiyo_extract\amiyo-studio-main\*' -Destination '%STANDARD_DIR%' -Recurse -Force; Remove-Item '%ZIP_TEMP%' -Force; Remove-Item '%TEMP%\amiyo_extract' -Recurse -Force"
set "TARGET_DIR=%STANDARD_DIR%"

:setup_cmd
if exist "%APPDATA%\npm" (
  copy /y "%TARGET_DIR%\bin\amiyo.cmd" "%APPDATA%\npm\amiyo.cmd" >nul 2>&1
)
if exist "%LOCALAPPDATA%\Microsoft\WindowsApps" (
  copy /y "%TARGET_DIR%\bin\amiyo.cmd" "%LOCALAPPDATA%\Microsoft\WindowsApps\amiyo.cmd" >nul 2>&1
)

:launch
echo [-^>] Directly opening Amiyo Studio...
if defined NATIVE_EXE (
  start "" "!NATIVE_EXE!"
  exit /b 0
)
where node >nul 2>&1
if %ERRORLEVEL% equ 0 (
  if exist "%TARGET_DIR%\bin\cli.js" (
    echo [OK] Starting local engine at http://localhost:3000 ...
    node "%TARGET_DIR%\bin\cli.js"
    exit /b %ERRORLEVEL%
  )
)

echo [OK] Opening in default browser...
start "" "%TARGET_DIR%\index.html"
exit /b 0

