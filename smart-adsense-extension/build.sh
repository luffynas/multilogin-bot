#!/bin/bash

# Smart AdSense Pro - Build Script
# Script untuk build dan package extension

set -e

echo "🚀 Smart AdSense Pro - Build Script"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
EXTENSION_NAME="smart-adsense-pro"
VERSION="1.0.0"
BUILD_DIR="dist"
ZIP_FILE="${EXTENSION_NAME}-v${VERSION}.zip"

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

# Function to validate files
validate_files() {
    print_status "Validating extension files..."
    
    local required_files=(
        "manifest.json"
        "background.js"
        "content-script.js"
        "popup.html"
        "popup.css"
        "popup.js"
        "lib/device-detector.js"
        "lib/content-analyzer.js"
        "lib/personality-engine.js"
        "lib/reading-simulator.js"
        "lib/navigation-engine.js"
        "lib/adsense-detector.js"
        "lib/click-simulator.js"
        "lib/stealth-monitor.js"
        "lib/session-manager.js"
        "icons/icon16.png"
        "icons/icon48.png"
        "icons/icon128.png"
    )
    
    local missing_files=()
    
    for file in "${required_files[@]}"; do
        if [[ ! -f "$file" ]]; then
            missing_files+=("$file")
        fi
    done
    
    if [[ ${#missing_files[@]} -gt 0 ]]; then
        print_error "Missing required files:"
        for file in "${missing_files[@]}"; do
            echo "  - $file"
        done
        exit 1
    fi
    
    print_success "All required files found"
}

# Function to validate manifest
validate_manifest() {
    print_status "Validating manifest.json..."
    
    if ! command_exists jq; then
        print_warning "jq not found, skipping manifest validation"
        return
    fi
    
    if ! jq empty manifest.json 2>/dev/null; then
        print_error "Invalid JSON in manifest.json"
        exit 1
    fi
    
    local manifest_version=$(jq -r '.manifest_version' manifest.json)
    if [[ "$manifest_version" != "3" ]]; then
        print_error "Manifest version must be 3"
        exit 1
    fi
    
    print_success "Manifest validation passed"
}

# Function to create build directory
create_build_dir() {
    print_status "Creating build directory..."
    
    if [[ -d "$BUILD_DIR" ]]; then
        rm -rf "$BUILD_DIR"
    fi
    
    mkdir -p "$BUILD_DIR"
    print_success "Build directory created: $BUILD_DIR"
}

# Function to copy files
copy_files() {
    print_status "Copying extension files..."
    
    # Copy main files
    cp manifest.json "$BUILD_DIR/"
    cp background.js "$BUILD_DIR/"
    cp content-script.js "$BUILD_DIR/"
    cp popup.html "$BUILD_DIR/"
    cp popup.css "$BUILD_DIR/"
    cp popup.js "$BUILD_DIR/"
    cp package.json "$BUILD_DIR/"
    cp README.md "$BUILD_DIR/"
    
    # Copy lib directory
    cp -r lib "$BUILD_DIR/"
    
    # Copy icons directory
    cp -r icons "$BUILD_DIR/"
    
    print_success "Files copied to build directory"
}

# Function to create zip file
create_zip() {
    print_status "Creating zip file..."
    
    if command_exists zip; then
        cd "$BUILD_DIR"
        zip -r "../$ZIP_FILE" . -x "*.DS_Store" "*.git*" "node_modules/*"
        cd ..
        print_success "Zip file created: $ZIP_FILE"
    else
        print_warning "zip command not found, skipping zip creation"
    fi
}

# Function to calculate file sizes
calculate_sizes() {
    print_status "Calculating file sizes..."
    
    local total_size=0
    local file_count=0
    
    while IFS= read -r -d '' file; do
        if [[ -f "$file" ]]; then
            local size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo "0")
            total_size=$((total_size + size))
            file_count=$((file_count + 1))
        fi
    done < <(find "$BUILD_DIR" -type f -print0)
    
    local size_kb=$((total_size / 1024))
    local size_mb=$((size_kb / 1024))
    
    print_success "Build contains $file_count files"
    if [[ $size_mb -gt 0 ]]; then
        print_success "Total size: ${size_mb}.$((size_kb % 1024)) MB"
    else
        print_success "Total size: ${size_kb} KB"
    fi
}

# Function to show build summary
show_summary() {
    echo ""
    echo "🎉 Build Summary"
    echo "==============="
    echo "Extension: $EXTENSION_NAME"
    echo "Version: $VERSION"
    echo "Build Directory: $BUILD_DIR"
    if [[ -f "$ZIP_FILE" ]]; then
        echo "Zip File: $ZIP_FILE"
    fi
    echo ""
    echo "📁 Files included:"
    find "$BUILD_DIR" -type f | sort | sed 's|^dist/|  |'
    echo ""
    echo "🚀 Next steps:"
    echo "1. Load extension in Chrome: chrome://extensions/"
    echo "2. Enable Developer mode"
    echo "3. Click 'Load unpacked' and select: $BUILD_DIR"
    echo ""
}

# Function to clean build
clean_build() {
    print_status "Cleaning build directory..."
    
    if [[ -d "$BUILD_DIR" ]]; then
        rm -rf "$BUILD_DIR"
        print_success "Build directory cleaned"
    fi
    
    if [[ -f "$ZIP_FILE" ]]; then
        rm "$ZIP_FILE"
        print_success "Zip file removed"
    fi
}

# Function to show help
show_help() {
    echo "Smart AdSense Pro - Build Script"
    echo ""
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  build     Build the extension (default)"
    echo "  clean     Clean build files"
    echo "  validate  Validate files only"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 build    # Build extension"
    echo "  $0 clean    # Clean build files"
    echo "  $0 validate # Validate files only"
}

# Main build function
main_build() {
    print_status "Starting build process..."
    
    validate_files
    validate_manifest
    create_build_dir
    copy_files
    create_zip
    calculate_sizes
    show_summary
    
    print_success "Build completed successfully!"
}

# Main script logic
case "${1:-build}" in
    "build")
        main_build
        ;;
    "clean")
        clean_build
        ;;
    "validate")
        validate_files
        validate_manifest
        print_success "Validation completed"
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        print_error "Unknown option: $1"
        show_help
        exit 1
        ;;
esac
