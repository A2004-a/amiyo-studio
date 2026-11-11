@echo off
setlocal

echo ==========================================
echo          Amiyo Studio Version Check       
echo ==========================================
echo Latest Release: v0.0.1

if exist "%LOCALAPPDATA%\Programs\amiyo-studio\Amiyo Studio.exe" (
  set "FOUND_DIR=%LOCALAPPDATA%\Programs\amiyo-studio"
  goto :installed
)

if exist "%ProgramFiles%\Amiyo Studio\Amiyo Studio.exe" (
  set "FOUND_DIR=%ProgramFiles%\Amiyo Studio"
  goto :installed
)

if exist "index.html" if exist "bin\cli.js" (
  set "FOUND_DIR=%CD%"
  goto :installed
)

if exist "%LOCALAPPDATA%\AmiyoStudio\index.html" (
  set "FOUND_DIR=%LOCALAPPDATA%\AmiyoStudio"
  goto :installed
)

echo Installed: NO [Not downloaded yet]
echo.
echo To download and open immediately, run:
echo   curl -fsSL https://raw.githubusercontent.com/A2004-a/amiyo-studio/main/install.cmd -o "%%TEMP%%\amiyo.cmd" ^&^& call "%%TEMP%%\amiyo.cmd"
exit /b 0

:installed
echo Installed: YES
echo Location:  %FOUND_DIR%
echo.
echo To open Amiyo Studio, type:
echo   amiyo
exit /b 0
