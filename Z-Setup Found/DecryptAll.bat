@echo off
chcp 65001 >nul
title Decrypt All

setlocal DisableDelayedExpansion

set "ROOT=%~dp0"
if "%ROOT:~-1%"=="\" set "ROOT=%ROOT:~0,-1%"

echo Folder target: "%ROOT%"
echo.

set /p "PW=Masukkan password DEKRIPSI: "
if "%PW%"=="" (
  echo Password kosong!
  pause
  exit /b
)

set /p "DELCHOICE=Hapus file .enc? (y/N): "
if /I "%DELCHOICE%"=="y" (
  set "DELFLAG=delete"
) else (
  set "DELFLAG="
)

echo.
node "%~dp0decrypt-recursive.js" "%ROOT%" "%PW%" "%DELFLAG%"

echo.
echo SELESAI
pause
endlocal