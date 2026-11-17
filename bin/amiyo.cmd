@echo off
setlocal enabledelayedexpansion

rem Check version requests
if /i "%~1"=="--version" goto :show_version
if /i "%~1"=="-v" goto :show_version
if /i "%~1"=="version" goto :show_version
if /i "%~1"=="-version" goto :show_version
if /i "%~1"=="/v" goto :show_version

rem Check update requests
if /i "%~1"=="update" goto :do_update
if /i "%~1"=="upgrade" goto :do_update
if /i "%~1"=="--update" goto :do_update

rem Check help requests
if /i "%~1"=="--help" goto :show_help
if /i "%~1"=="-h" goto :show_help
if /i "%~1"=="help" goto :show_help
if /i "%~1"=="-help" goto :show_help
if /i "%~1"=="/?" goto :show_help

rem Resolve application root directory
set "APP_DIR=%~dp0.."
if not exist "%APP_DIR%\index.html" (
  if exist "%USERPROFILE%\Desktop\amiyo studio 2\index.html" (
    set "APP_DIR=%USERPROFILE%\Desktop\amiyo studio 2"
  ) else if exist "%LOCALAPPDATA%\AmiyoStudio\index.html" (
    set "APP_DIR=%LOCALAPPDATA%\AmiyoStudio"
  ) else if exist "%USERPROFILE%\amiyo-studio\index.html" (
    set "APP_DIR=%USERPROFILE%\amiyo-studio"
  )
)

rem Check modern native desktop app installations (v1.0.0+)
set "NATIVE_EXE="
if exist "%LOCALAPPDATA%\Programs\amiyo-studio\Amiyo Studio.exe" set "CANDIDATE=%LOCALAPPDATA%\Programs\amiyo-studio\Amiyo Studio.exe"
if not defined CANDIDATE if exist "%LOCALAPPDATA%\Programs\Amiyo Studio\Amiyo Studio.exe" set "CANDIDATE=%LOCALAPPDATA%\Programs\Amiyo Studio\Amiyo Studio.exe"

if defined CANDIDATE (
  for /f "usebackq delims=" %%v in (`powershell -NoProfile -Command "(Get-Item '%CANDIDATE%').VersionInfo.ProductVersion" 2^>nul`) do (
    set "EXE_VER=%%v"
  )
  if defined EXE_VER (
    for /f "tokens=1 delims=." %%m in ("!EXE_VER!") do (
      if %%m geq 1 set "NATIVE_EXE=!CANDIDATE!"
    )
  )
)

if defined NATIVE_EXE (
  start "" "!NATIVE_EXE!" %*
  exit /b 0
)

rem If Node.js is installed, use cli.js for full NLE engine
where node >nul 2>&1
if %ERRORLEVEL% equ 0 (
  if exist "%APP_DIR%\bin\cli.js" (
    node "%APP_DIR%\bin\cli.js" %*
    exit /b %ERRORLEVEL%
  )
)

rem If Node.js is not installed, open index.html directly in browser
echo Opening Amiyo Studio v1.0.0...
start "" "%APP_DIR%\index.html"
exit /b 0

:show_version
echo Amiyo Studio v1.0.0
exit /b 0

:show_help
echo Amiyo Studio CLI v1.0.0
echo.
echo Usage:
echo   amiyo                 Directly open Amiyo Studio
echo   amiyo update          Update existing installation to latest version
echo   amiyo --version, -v   Show installed version
echo   amiyo --help, -h      Show help message
echo   amiyo -p 8080         Start local server on port 8080
echo.
exit /b 0

:do_update
if exist "%APP_DIR%\update.cmd" (
  call "%APP_DIR%\update.cmd"
  exit /b %ERRORLEVEL%
)
where node >nul 2>&1
if %ERRORLEVEL% equ 0 (
  if exist "%APP_DIR%\scripts\update.js" (
    node "%APP_DIR%\scripts\update.js"
    exit /b %ERRORLEVEL%
  )
)
echo Updating Amiyo Studio from GitHub...
powershell -NoProfile -Command "irm https://raw.githubusercontent.com/A2004-a/amiyo-studio/main/update.ps1 | iex"
exit /b %ERRORLEVEL%
