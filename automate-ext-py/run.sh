#!/bin/bash

# Multilogin X API Automation Tool Runner

echo "🚀 Starting Multilogin X API Automation Tool..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp .env.example .env
    echo "📝 Please edit .env file with your Multilogin credentials"
    echo "   Then run this script again."
    exit 1
fi

# Run the application
echo "🎯 Starting application..."
python main.py
