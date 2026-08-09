@echo off
title Khoi dong DemoPick Web System (3 App SOA)
echo ===================================================
echo  Khoi dong he thong DemoPick Web Framework (SOA)
echo ===================================================

start "DemoPick Backend API (8000)" cmd /k "cd /d %~dp0\PickleBall && php artisan serve --port=8000"
start "DemoPick Customer Portal (5173)" cmd /k "cd /d %~dp0\demopick-client && npm run dev"
start "DemoPick Admin Portal (5174)" cmd /k "cd /d %~dp0\demopick-admin && npm run dev"

echo.
echo Da khoi chay 3 phan ung dung:
echo  1. Backend API:         http://localhost:8000
echo  2. Customer Portal SPA: http://localhost:5173
echo  3. Admin Dashboard SPA: http://localhost:5174
echo.
