# Start Bayyina Backend (FastAPI)
Write-Host "Starting Bayyina Backend..." -ForegroundColor Green
Set-Location "$PSScriptRoot\backend"
uvicorn main:app --reload --port 8000
