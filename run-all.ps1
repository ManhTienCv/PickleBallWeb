# Script khoi dong tat ca cac phan he DemoPick Web System (PowerShell)
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host " Khoi dong he thong DemoPick Web Framework (SOA)   " -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Cyan

$scriptPath = $PSScriptRoot

# 1. Backend API (Laravel)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$scriptPath\PickleBall'; php artisan serve --port=8000"

# 2. Customer Portal SPA (React + Vite)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$scriptPath\demopick-client'; npm run dev"

# 3. Admin Dashboard SPA (React + Vite)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$scriptPath\demopick-admin'; npm run dev"

Write-Host ""
Write-Host "Da khoi chay 3 phan ung dung:" -ForegroundColor Yellow
Write-Host " 1. Backend API:         http://localhost:8000" -ForegroundColor White
Write-Host " 2. Customer Portal SPA: http://localhost:5173" -ForegroundColor White
Write-Host " 3. Admin Dashboard SPA: http://localhost:5174" -ForegroundColor White
Write-Host ""
