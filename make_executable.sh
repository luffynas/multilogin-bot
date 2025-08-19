#!/bin/bash

# Make Executable Script for Multi-Login Bot
# This script makes all shell scripts executable

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}   Make Executable Script${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# List of scripts to make executable
SCRIPTS=(
    "run_bot.sh"
    "run_adsense_test.sh"
    "run_tests.sh"
    "scripts/start_daily.sh"
    "scripts/setup_cron.sh"
    "make_executable.sh"
)

print_header
print_status "Making shell scripts executable..."

# Make each script executable
for script in "${SCRIPTS[@]}"; do
    script_path="$SCRIPT_DIR/$script"
    
    if [ -f "$script_path" ]; then
        if chmod +x "$script_path"; then
            print_status "Made executable: $script"
        else
            print_error "Failed to make executable: $script"
        fi
    else
        print_warning "Script not found: $script"
    fi
done

print_status "All scripts processed!"
print_status "You can now run:"
echo "  ./run_bot.sh --help"
echo "  ./scripts/setup_cron.sh --help"
