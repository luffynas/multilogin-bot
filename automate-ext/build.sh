#!/bin/bash

# AdSense Automation Pro - Build Script
# Builds the browser extension for Chrome and Firefox

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
EXTENSION_NAME="adsense-automation-pro"
VERSION="1.0.0"
BUILD_DIR="dist"
CHROME_BUILD_DIR="$BUILD_DIR/chrome"
FIREFOX_BUILD_DIR="$BUILD_DIR/firefox"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to create directory if it doesn't exist
create_dir() {
    if [ ! -d "$1" ]; then
        mkdir -p "$1"
        print_status "Created directory: $1"
    fi
}

# Function to copy files
copy_files() {
    local src="$1"
    local dest="$2"
    local exclude="$3"
    
    if [ -n "$exclude" ]; then
        rsync -av --exclude="$exclude" "$src" "$dest"
    else
        rsync -av "$src" "$dest"
    fi
}

# Function to build Chrome extension
build_chrome() {
    print_status "Building Chrome extension..."
    
    # Create Chrome build directory
    create_dir "$CHROME_BUILD_DIR"
    
    # Copy all files except Firefox manifest
    copy_files "." "$CHROME_BUILD_DIR/" "manifest-firefox.json"
    
    # Copy Chrome manifest as manifest.json
    cp "manifest.json" "$CHROME_BUILD_DIR/manifest.json"
    
    # Create Chrome package
    cd "$CHROME_BUILD_DIR"
    if command_exists zip; then
        zip -r "../${EXTENSION_NAME}-chrome-v${VERSION}.zip" . -x "*.git*" "node_modules/*" "*.log" "*.DS_Store"
        print_success "Chrome extension packaged: ${EXTENSION_NAME}-chrome-v${VERSION}.zip"
    else
        print_warning "zip command not found. Chrome extension files are in $CHROME_BUILD_DIR"
    fi
    cd - > /dev/null
    
    print_success "Chrome extension built successfully"
}

# Function to build Firefox extension
build_firefox() {
    print_status "Building Firefox extension..."
    
    # Create Firefox build directory
    create_dir "$FIREFOX_BUILD_DIR"
    
    # Copy all files except Chrome manifest
    copy_files "." "$FIREFOX_BUILD_DIR/" "manifest.json"
    
    # Copy Firefox manifest as manifest.json
    cp "manifest-firefox.json" "$FIREFOX_BUILD_DIR/manifest.json"
    
    # Create Firefox package
    cd "$FIREFOX_BUILD_DIR"
    if command_exists zip; then
        zip -r "../${EXTENSION_NAME}-firefox-v${VERSION}.zip" . -x "*.git*" "node_modules/*" "*.log" "*.DS_Store"
        print_success "Firefox extension packaged: ${EXTENSION_NAME}-firefox-v${VERSION}.zip"
    else
        print_warning "zip command not found. Firefox extension files are in $FIREFOX_BUILD_DIR"
    fi
    cd - > /dev/null
    
    print_success "Firefox extension built successfully"
}

# Function to validate files
validate_files() {
    print_status "Validating required files..."
    
    local required_files=(
        "manifest.json"
        "manifest-firefox.json"
        "background.js"
        "content-script.js"
        "popup.html"
        "popup.css"
        "popup.js"
        "lib/personality-engine.js"
        "lib/adsense-detector.js"
        "lib/behavior-simulator.js"
        "lib/mouse-simulator.js"
        "lib/keyboard-simulator.js"
        "lib/reading-simulator.js"
        "lib/navigation-simulator.js"
        "lib/session-manager.js"
        "lib/stealth-monitor.js"
        "README.md"
        "package.json"
        "LICENSE"
    )
    
    local missing_files=()
    
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            missing_files+=("$file")
        fi
    done
    
    if [ ${#missing_files[@]} -eq 0 ]; then
        print_success "All required files found"
    else
        print_error "Missing required files:"
        for file in "${missing_files[@]}"; do
            echo "  - $file"
        done
        exit 1
    fi
}

# Function to clean build directory
clean_build() {
    print_status "Cleaning build directory..."
    
    if [ -d "$BUILD_DIR" ]; then
        rm -rf "$BUILD_DIR"
        print_success "Build directory cleaned"
    fi
}

# Function to show help
show_help() {
    echo "AdSense Automation Pro - Build Script"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -c, --chrome     Build Chrome extension only"
    echo "  -f, --firefox    Build Firefox extension only"
    echo "  -a, --all        Build both Chrome and Firefox extensions (default)"
    echo "  -v, --version    Show version information"
    echo "  -h, --help       Show this help message"
    echo "  --clean          Clean build directory before building"
    echo ""
    echo "Examples:"
    echo "  $0                    # Build both extensions"
    echo "  $0 --chrome           # Build Chrome extension only"
    echo "  $0 --firefox          # Build Firefox extension only"
    echo "  $0 --clean --all      # Clean and build both extensions"
    echo ""
}

# Function to show version
show_version() {
    echo "AdSense Automation Pro v$VERSION"
    echo "Build script for browser extension"
}

# Main function
main() {
    local build_chrome_flag=false
    local build_firefox_flag=false
    local clean_flag=false
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -c|--chrome)
                build_chrome_flag=true
                shift
                ;;
            -f|--firefox)
                build_firefox_flag=true
                shift
                ;;
            -a|--all)
                build_chrome_flag=true
                build_firefox_flag=true
                shift
                ;;
            --clean)
                clean_flag=true
                shift
                ;;
            -v|--version)
                show_version
                exit 0
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # Default to building both if no specific target specified
    if [ "$build_chrome_flag" = false ] && [ "$build_firefox_flag" = false ]; then
        build_chrome_flag=true
        build_firefox_flag=true
    fi
    
    print_status "Starting build process for AdSense Automation Pro v$VERSION"
    
    # Validate files
    validate_files
    
    # Clean build directory if requested
    if [ "$clean_flag" = true ]; then
        clean_build
    fi
    
    # Create build directory
    create_dir "$BUILD_DIR"
    
    # Build extensions
    if [ "$build_chrome_flag" = true ]; then
        build_chrome
    fi
    
    if [ "$build_firefox_flag" = true ]; then
        build_firefox
    fi
    
    print_success "Build process completed successfully!"
    
    # Show build summary
    echo ""
    echo "Build Summary:"
    echo "=============="
    if [ "$build_chrome_flag" = true ]; then
        echo "✓ Chrome extension: $CHROME_BUILD_DIR"
        if [ -f "$BUILD_DIR/${EXTENSION_NAME}-chrome-v${VERSION}.zip" ]; then
            echo "  Package: ${EXTENSION_NAME}-chrome-v${VERSION}.zip"
        fi
    fi
    
    if [ "$build_firefox_flag" = true ]; then
        echo "✓ Firefox extension: $FIREFOX_BUILD_DIR"
        if [ -f "$BUILD_DIR/${EXTENSION_NAME}-firefox-v${VERSION}.zip" ]; then
            echo "  Package: ${EXTENSION_NAME}-firefox-v${VERSION}.zip"
        fi
    fi
    
    echo ""
    echo "Installation Instructions:"
    echo "========================="
    echo "Chrome:"
    echo "  1. Open chrome://extensions/"
    echo "  2. Enable 'Developer mode'"
    echo "  3. Click 'Load unpacked'"
    echo "  4. Select the $CHROME_BUILD_DIR folder"
    echo ""
    echo "Firefox:"
    echo "  1. Open about:debugging"
    echo "  2. Click 'This Firefox' tab"
    echo "  3. Click 'Load Temporary Add-on'"
    echo "  4. Select the manifest.json file in $FIREFOX_BUILD_DIR"
}

# Run main function with all arguments
main "$@"
