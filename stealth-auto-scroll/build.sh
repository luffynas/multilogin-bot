#!/bin/bash

# Build script for Stealth Auto Scroll Extension

echo "🚀 Building Stealth Auto Scroll Extension..."

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist/

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the extension
echo "🔨 Building extension..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "📁 Built files:"
    ls -la dist/
    
    # Create icons directory if it doesn't exist
    if [ ! -d "icons" ]; then
        echo "📁 Creating icons directory..."
        mkdir icons
        
        # Create placeholder icon files
        echo "Creating placeholder icons..."
        # You can replace these with actual icon files
        touch icons/icon16.png
        touch icons/icon32.png
        touch icons/icon48.png
        touch icons/icon128.png
        touch icons/active16.png
        touch icons/active32.png
        touch icons/active48.png
        touch icons/active128.png
        touch icons/inactive16.png
        touch icons/inactive32.png
        touch icons/inactive48.png
        touch icons/inactive128.png
    fi
    
    echo ""
    echo "🎉 Extension ready for loading!"
    echo "📋 Next steps:"
    echo "1. Open Chrome and go to chrome://extensions/"
    echo "2. Enable 'Developer mode'"
    echo "3. Click 'Load unpacked' and select this folder"
    echo "4. Test the extension on any webpage"
    echo ""
    echo "🧪 To test stealth capabilities, run the self-audit script:"
    echo "   - Open browser console on any page"
    echo "   - Paste the contents of src/self-audit.js"
    echo "   - Check the results"
    
else
    echo "❌ Build failed!"
    exit 1
fi
