@echo off
title Dung tat ca phan he DemoPick Web
echo Dang dung cac dich vu dang chay...

taskkill /FI "IMAGENAME eq node.exe" /F >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5174 ^| findstr LISTENING') do taskkill /F /PID %%a >nul 2>&1

echo.
echo Da dung tat ca cac dich vu Backend (Spring Boot: 8080) & Frontend (5173, 5174)!
echo.
pause
