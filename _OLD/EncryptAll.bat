@echo off
chcp 65001 >nul
title Encrypt All

setlocal DisableDelayedExpansion

set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"

echo Folder target: "%ROOT%"
echo.

set /p "PW=Masukkan password ENKRIPSI: "
if "%PW%"=="" (
  echo Password kosong!
  pause
  exit /b
)

set /p "DELCHOICE=Hapus file asli? (y/N): "
if /I "%DELCHOICE%"=="y" (
  set "DELFLAG=delete"
) else (
  set "DELFLAG="
)

echo.
node "%~dp0encrypt-recursive.js" "%ROOT%" "%PW%" "%DELFLAG%"

echo.
echo SELESAI
pause
endlocal