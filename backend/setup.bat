@echo off
REM NyayNeti Backend Setup Script for Windows
REM Run this from the backend directory

echo ============================================
echo NyayNeti Backend Setup
echo ============================================

REM Create virtual environment if not exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate and install dependencies
echo Installing dependencies...
call venv\Scripts\activate.bat
pip install -r requirements.txt

REM Copy env file if not exists
if not exist ".env" (
    echo Creating .env from .env.example...
    copy .env.example .env
)

REM Create necessary directories
if not exist "uploads" mkdir uploads
if not exist "demo_data" mkdir demo_data

echo.
echo ============================================
echo Setup complete!
echo ============================================
echo.
echo Next steps:
echo   1. Edit .env with your configuration
echo   2. Run: python ..\ml\download_model.py  (to download LLM model)
echo   3. Run: python app.py  (to start the server)
echo.
pause
