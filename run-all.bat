@echo off

echo  Khoi dong he thong DemoPick Web Framework (SOA)
echo Dang tu dong don dep cac phan he cu (neu co)...
taskkill /FI "IMAGENAME eq php.exe" /F >nul 2>&1
taskkill /FI "IMAGENAME eq node.exe" /F >nul 2>&1
wscript.exe "%~dp0run-all-silent.vbs"
echo.
echo [THANH CONG] Da khoi chay 3 phan he AN HOAN TOAN TRONG NEN:
echo  1. Backend API:         http://localhost:8080
echo  2. Customer Portal SPA: http://localhost:5173
echo  3. Admin Dashboard SPA: http://localhost:5174
echo.

