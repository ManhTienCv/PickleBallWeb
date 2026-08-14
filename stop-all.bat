@echo off
title Dung tat ca phan he DemoPick Web
echo Dang dung cac dich vu dang chay...

taskkill /FI "IMAGENAME eq php.exe" /F >nul 2>&1
taskkill /FI "IMAGENAME eq node.exe" /F >nul 2>&1

echo.
echo Da dung tat ca cac dich vu Backend (php) & Frontend (node/vite)!
echo.
pause
