@echo off
setlocal enabledelayedexpansion

set "APP_DIR=%~dp0.."
if not exist "%APP_DIR%\index.html" (
  set "APP_DIR=%LOCALAPPDATA%\AmiyoStudio"
)

rem Check version requests
if /i "%~1"=="--version" goto :show_version
if /i "%~1"=="-v" goto :show_version
if /i "%~1"=="version" goto :show_version

rem Check help requests
if /i "%~1"=="--help" goto :show_help
if /i "%~1"=="-h" goto :show_help
if /i "%~1"=="help" goto :show_help

rem If Node.js is installed, use cli.js for full features
where node >nul 2>&1
if %ERRORLEVEL% equ 0 (
  if exist "%APP_DIR%\bin\cli.js" (
    node "%APP_DIR%\bin\cli.js" %*
    exit /b %ERRORLEVEL%
  )
)

rem If Node.js is not installed, open index.html directly in browser
echo Opening Amiyo Studio...
start "" "%APP_DIR%\index.html"
exit /b 0

:show_version
echo Amiyo Studio v0.0.1
exit /b 0

:show_help
echo Amiyo Studio CLI v0.0.1
echo.
echo Usage:
echo   amiyo                 Directly open Amiyo Studio
echo   amiyo --version, -v   Show installed version
echo   amiyo --help, -h      Show help message
echo   amiyo -p 8080         Start local server on port 8080
echo.
exit /b 0
