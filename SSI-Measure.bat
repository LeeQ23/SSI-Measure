@echo off
title SSI Measure Desktop App
cd /d "%~dp0"
echo Memulai SSI Measure Desktop App...

rem Membersihkan proses lama yang menduduki port 3001 jika ada
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001 ^| findstr LISTENING 2^>nul') do (
    taskkill /F /PID %%a >nul 2>&1
)

if exist "%~dp0node_modules\.bin\electron.cmd" (
    call "%~dp0node_modules\.bin\electron.cmd" .
) else (
    call npx --yes electron .
)
if %errorlevel% neq 0 (
    echo.
    echo Terjadi masalah saat membuka aplikasi.
    pause
)
