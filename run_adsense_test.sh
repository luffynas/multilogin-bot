#!/bin/bash

# AdSense Testing Script for Multi-Login Bot
# Enhanced safety features and monitoring for AdSense compliance

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
VENV_DIR="$PROJECT_DIR/venv"
CONFIG_FILE="$PROJECT_DIR/config/config.yaml"
LOG_DIR="$PROJECT_DIR/logs"

# Print functions
print_info() {
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

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE}  AD SENSE TESTING MODE${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Function to check if virtual environment exists
check_venv() {
    if [ ! -d "$VENV_DIR" ]; then
        print_warning "Virtual environment not found. Creating..."
        python3 -m venv "$VENV_DIR"
        print_success "Virtual environment created"
    fi
}

# Function to activate virtual environment
activate_venv() {
    source "$VENV_DIR/bin/activate"
    print_info "Virtual environment activated"
}

# Function to install dependencies
install_dependencies() {
    print_info "Installing dependencies..."
    pip install --upgrade pip
    pip install -r "$PROJECT_DIR/requirements.txt"
    print_success "Dependencies installed"
}

# Function to validate AdSense configuration
validate_adsense_config() {
    print_info "Validating AdSense configuration..."
    
    if [ ! -f "$CONFIG_FILE" ]; then
        print_error "Configuration file not found: $CONFIG_FILE"
        exit 1
    fi
    
    # Check if AdSense testing is enabled
    if ! grep -q "adsense_testing:" "$CONFIG_FILE"; then
        print_error "AdSense testing configuration not found in config.yaml"
        exit 1
    fi
    
    # Check if target website is configured
    if ! grep -q "url:" "$CONFIG_FILE"; then
        print_error "Target website URL not configured"
        exit 1
    fi
    
    print_success "AdSense configuration validated"
}

# Function to run AdSense safety check
run_safety_check() {
    print_info "Running AdSense safety check..."
    
    # Check if logs directory exists
    if [ ! -d "$LOG_DIR" ]; then
        mkdir -p "$LOG_DIR"
        print_info "Created logs directory"
    fi
    
    # Check for previous AdSense reports
    if ls "$LOG_DIR"/adsense_report_*.json 1> /dev/null 2>&1; then
        print_warning "Previous AdSense reports found. Reviewing..."
        latest_report=$(ls -t "$LOG_DIR"/adsense_report_*.json | head -1)
        print_info "Latest report: $latest_report"
        
        # Check for warnings in latest report
        if grep -q "warnings" "$latest_report"; then
            print_warning "Warnings found in latest report. Please review before continuing."
            read -p "Continue anyway? (y/N): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                print_info "Aborted by user"
                exit 0
            fi
        fi
    fi
    
    print_success "Safety check completed"
}

# Function to run AdSense test with specific settings
run_adsense_test() {
    local visits=$1
    local stealth_level=${2:-"expert"}
    
    print_header
    print_info "Starting AdSense test with $visits visits (stealth: $stealth_level)"
    
    # Validate configuration
    validate_adsense_config
    
    # Run safety check
    run_safety_check
    
    # Activate virtual environment
    activate_venv
    
    # Run the bot with AdSense testing mode
    cd "$PROJECT_DIR"
    
    print_info "Running Multi-Login Bot in AdSense testing mode..."
    python3 -m src.main --adsense-test --visits "$visits" --stealth "$stealth_level"
    
    print_success "AdSense test completed"
    
    # Show results
    show_adsense_results
}

# Function to show AdSense test results
show_adsense_results() {
    print_info "AdSense Test Results:"
    echo
    
    # Find latest AdSense report
    if ls "$LOG_DIR"/adsense_report_*.json 1> /dev/null 2>&1; then
        latest_report=$(ls -t "$LOG_DIR"/adsense_report_*.json | head -1)
        
        echo "📊 Latest AdSense Report: $latest_report"
        echo
        
        # Extract key metrics
        if command -v jq &> /dev/null; then
            echo "📈 Key Metrics:"
            jq -r '.metrics | "Sessions: \(.total_sessions)\nPageviews: \(.total_pageviews)\nCTR: \(.ctr * 100 | round / 100)%\nEstimated Revenue: $\(.estimated_revenue)"' "$latest_report"
            echo
            
            echo "⚠️  Warnings:"
            jq -r '.warnings[]?' "$latest_report" 2>/dev/null || echo "None"
            echo
            
            echo "💡 Recommendations:"
            jq -r '.recommendations[]?' "$latest_report" 2>/dev/null || echo "None"
        else
            print_warning "jq not installed. Install jq for better report formatting."
            echo "Report saved to: $latest_report"
        fi
    else
        print_warning "No AdSense reports found"
    fi
}

# Function to run quick test
run_quick_test() {
    print_info "Running quick AdSense test (5 visits)..."
    run_adsense_test 5 "expert"
}

# Function to run full test
run_full_test() {
    print_info "Running full AdSense test (20 visits)..."
    run_adsense_test 20 "expert"
}

# Function to run custom test
run_custom_test() {
    read -p "Enter number of visits (1-50): " visits
    read -p "Enter stealth level (basic/advanced/expert) [expert]: " stealth_level
    stealth_level=${stealth_level:-"expert"}
    
    if [[ ! "$visits" =~ ^[0-9]+$ ]] || [ "$visits" -lt 1 ] || [ "$visits" -gt 50 ]; then
        print_error "Invalid number of visits. Must be between 1 and 50."
        exit 1
    fi
    
    if [[ ! "$stealth_level" =~ ^(basic|advanced|expert)$ ]]; then
        print_error "Invalid stealth level. Must be basic, advanced, or expert."
        exit 1
    fi
    
    run_adsense_test "$visits" "$stealth_level"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTION]"
    echo
    echo "Options:"
    echo "  quick     Run quick AdSense test (5 visits)"
    echo "  full      Run full AdSense test (20 visits)"
    echo "  custom    Run custom AdSense test"
    echo "  setup     Setup environment for AdSense testing"
    echo "  results   Show latest AdSense test results"
    echo "  help      Show this help message"
    echo
    echo "Examples:"
    echo "  $0 quick          # Run quick test"
    echo "  $0 full           # Run full test"
    echo "  $0 custom         # Run custom test"
    echo "  $0 setup          # Setup environment"
    echo "  $0 results        # Show results"
}

# Function to setup environment
setup_environment() {
    print_header
    print_info "Setting up environment for AdSense testing..."
    
    # Check virtual environment
    check_venv
    
    # Activate virtual environment
    activate_venv
    
    # Install dependencies
    install_dependencies
    
    # Create logs directory
    mkdir -p "$LOG_DIR"
    
    # Validate configuration
    validate_adsense_config
    
    print_success "Environment setup completed"
    print_info "You can now run AdSense tests with:"
    echo "  $0 quick    # Quick test"
    echo "  $0 full     # Full test"
    echo "  $0 custom   # Custom test"
}

# Function to show results
show_results() {
    print_header
    show_adsense_results
}

# Main script logic
main() {
    case "${1:-help}" in
        quick)
            run_quick_test
            ;;
        full)
            run_full_test
            ;;
        custom)
            run_custom_test
            ;;
        setup)
            setup_environment
            ;;
        results)
            show_results
            ;;
        help|--help|-h)
            show_usage
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
