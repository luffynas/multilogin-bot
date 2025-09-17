@echo off
REM Multilogin X API Automation Tool Runner for Windows

echo 🚀 Starting Multilogin X API Automation Tool...

REM Check if virtual environment exists
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo 📥 Installing dependencies...
pip install -r requirements.txt

REM Check if .env file exists
if not exist ".env" (
    echo ⚠️  .env file not found. Creating from template...
    copy .env.example .env
    echo 📝 Please edit .env file with your Multilogin credentials
    echo    Then run this script again.
    pause
    exit /b 1
)

REM Run the application
echo 🎯 Starting application...
python main.py

REM Keep window open if there's an error
if errorlevel 1 (
    echo.
    echo ❌ Application exited with an error.
    pause
)

