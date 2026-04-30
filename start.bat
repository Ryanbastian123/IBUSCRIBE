@echo off
title MedScribe Dev

:: Start backend in its own window
start "MedScribe Backend" cmd /k "cd /d "%~dp0backend" && call venv\Scripts\activate && uvicorn main:app --reload"

:: Small pause so backend window opens first
timeout /t 1 /nobreak >nul

:: Start frontend in its own window
start "MedScribe Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo  Both servers starting...
echo  Backend  ^>  http://localhost:8000
echo  Frontend ^>  http://localhost:3000
echo.
pause
