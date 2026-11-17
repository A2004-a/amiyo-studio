@echo off
setlocal enabledelayedexpansion

echo        /\
echo       /  \
echo      / /\ \       [^>] AMIYO STUDIO UPDATER
echo     / /  \ \          Updating old version to latest release...
echo    / /____\ \
echo   /_/      \_\
echo ==========================================
echo        Amiyo Studio Auto-Updater
echo ==========================================

set "TARGET_DIR=%CD%"
set "STANDARD_DIR=%LOCALAPPDATA%\AmiyoStudio"

if exist "%CD%\index.html" if exist "%CD%\bin\cli.js" (
  set "TARGET_DIR=%CD%"
  goto :do_update
)

if exist "%STANDARD_DIR%\index.html" (
  set "TARGET_DIR=%STANDARD_DIR%"
  goto :do_update
)

:do_update
echo [INFO] Updating installation at: %TARGET_DIR%

if exist "%TARGET_DIR%\.git" (
  pushd "%TARGET_DIR%"
  git fetch origin main >nul 2>&1
  git reset --hard origin/main >nul 2>&1
  popd
  echo [OK] Updated successfully via git!
  goto :finish
)

echo [INFO] Downloading latest archive from GitHub...
set "ZIP_TEMP=%TEMP%\amiyo_update.zip"
curl -fsSL "https://github.com/A2004-a/amiyo-studio/archive/refs/heads/main.zip" -o "%ZIP_TEMP%"
powershell -NoProfile -Command "Expand-Archive -Path '%ZIP_TEMP%' -DestinationPath '%TEMP%\amiyo_update_ext' -Force; Copy-Item -Path '%TEMP%\amiyo_update_ext\amiyo-studio-main\*' -Destination '%TARGET_DIR%' -Recurse -Force; Remove-Item '%ZIP_TEMP%' -Force; Remove-Item '%TEMP%\amiyo_update_ext' -Recurse -Force"
echo [OK] Updated successfully from release archive!

:finish
if exist "%APPDATA%\npm" (
  copy /y "%TARGET_DIR%\bin\amiyo.cmd" "%APPDATA%\npm\amiyo.cmd" >nul 2>&1
  copy /y "%TARGET_DIR%\bin\amiyo.ps1" "%APPDATA%\npm\amiyo.ps1" >nul 2>&1
)
if exist "%LOCALAPPDATA%\Microsoft\WindowsApps" (
  copy /y "%TARGET_DIR%\bin\amiyo.cmd" "%LOCALAPPDATA%\Microsoft\WindowsApps\amiyo.cmd" >nul 2>&1
  copy /y "%TARGET_DIR%\bin\amiyo.ps1" "%LOCALAPPDATA%\Microsoft\WindowsApps\amiyo.ps1" >nul 2>&1
)
if exist "%USERPROFILE%\bin" (
  copy /y "%TARGET_DIR%\bin\amiyo.cmd" "%USERPROFILE%\bin\amiyo.cmd" >nul 2>&1
  copy /y "%TARGET_DIR%\bin\amiyo.ps1" "%USERPROFILE%\bin\amiyo.ps1" >nul 2>&1
)

echo.
echo ==========================================
echo   [OK] Amiyo Studio Updated Successfully!
echo ==========================================
echo To open Amiyo Studio now, run:
echo   amiyo
exit /b 0
