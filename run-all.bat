@echo off
title Khoi dong DemoPick Web System (3 App SOA) - Port 8080
echo ===================================================
echo  Khoi dong he thong DemoPick Web Framework (SOA)
echo  Backend API: http://localhost:8080
echo ===================================================

start /min "DemoPick Backend API (8080)" cmd /c "cd /d %~dp0\PickleBall && php artisan serve --port=8080"
start /min "DemoPick Customer Portal (5173)" cmd /c "cd /d %~dp0\demopick-client && npm run dev"
start /min "DemoPick Admin Portal (5174)" cmd /c "cd /d %~dp0\demopick-admin && npm run dev"

echo.
echo Da khoi chay 3 phan ung dung duoi thanh Taskbar (Thu nho):
echo  1. Backend API:         http://localhost:8080
echo  2. Customer Portal SPA: http://localhost:5173
echo  3. Admin Dashboard SPA: http://localhost:5174
echo.
echo De dung tat ca cac ung dung, chay file stop-all.bat
