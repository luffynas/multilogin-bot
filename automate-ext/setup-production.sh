#!/bin/bash

# Production Setup Script for AdSense Automation Pro
# This script sets up the environment and builds the extension for production

set -e

echo "🚀 Setting up AdSense Automation Pro for Production Build..."
echo "================================================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm version: $(npm -v)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Check if installation was successful
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Run tests to ensure everything is working
echo ""
echo "🧪 Running tests..."
npm test

if [ $? -ne 0 ]; then
    echo "❌ Tests failed. Please fix issues before building for production."
    exit 1
fi

echo "✅ All tests passed"

# Build for production
echo ""
echo "🔨 Building for production..."

# Option 1: Use webpack (recommended for advanced optimization)
if [ "$1" = "webpack" ]; then
    echo "Using webpack build system..."
    npm run build:prod
else
    # Option 2: Use custom production build script
    echo "Using custom production build script..."
    node build-production.js
fi

if [ $? -ne 0 ]; then
    echo "❌ Production build failed"
    exit 1
fi

echo "✅ Production build completed successfully!"

# Show build results
echo ""
echo "📊 Build Results:"
echo "================================================================"

if [ -d "dist" ]; then
    echo "📁 Build directory: dist/"
    
    # Count files
    TOTAL_FILES=$(find dist -type f | wc -l)
    echo "📄 Total files: $TOTAL_FILES"
    
    # Calculate total size
    TOTAL_SIZE=$(du -sh dist | cut -f1)
    echo "💾 Total size: $TOTAL_SIZE"
    
    # List JavaScript files
    JS_FILES=$(find dist -name "*.js" | wc -l)
    echo "🔧 JavaScript files: $JS_FILES"
    
    # Show created packages
    if [ -f "dist/adsense-automation-pro-chrome.zip" ]; then
        CHROME_SIZE=$(du -sh dist/adsense-automation-pro-chrome.zip | cut -f1)
        echo "🌐 Chrome package: dist/adsense-automation-pro-chrome.zip ($CHROME_SIZE)"
    fi
    
    if [ -f "dist/adsense-automation-pro-firefox.zip" ]; then
        FIREFOX_SIZE=$(du -sh dist/adsense-automation-pro-firefox.zip | cut -f1)
        echo "🦊 Firefox package: dist/adsense-automation-pro-firefox.zip ($FIREFOX_SIZE)"
    fi
    
    if [ -f "dist/adsense-automation-pro-complete.zip" ]; then
        COMPLETE_SIZE=$(du -sh dist/adsense-automation-pro-complete.zip | cut -f1)
        echo "📦 Complete package: dist/adsense-automation-pro-complete.zip ($COMPLETE_SIZE)"
    fi
fi

echo ""
echo "🎉 Production setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Load the extension from the 'dist' folder in Chrome/Firefox"
echo "2. Test the extension functionality"
echo "3. Deploy the zip packages as needed"
echo ""
echo "🔧 Build options:"
echo "- Run './setup-production.sh webpack' for webpack build"
echo "- Run './setup-production.sh' for custom build"
echo ""
echo "📁 Build artifacts:"
echo "- dist/ - Production build directory"
echo "- *.zip - Extension packages"
echo "- build-report.json - Build statistics"
