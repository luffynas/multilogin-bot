#!/bin/bash

# Run Automate Script
# ===================
# Script to run automation with profile parameter

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_header() {
    echo -e "${CYAN}================================${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}================================${NC}"
}

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

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

# Function to check Python
check_python() {
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version 2>&1 | cut -d' ' -f2)
        print_info "Python 3 found: $PYTHON_VERSION"
        return 0
    elif command -v python &> /dev/null; then
        PYTHON_VERSION=$(python --version 2>&1 | cut -d' ' -f2)
        print_info "Python found: $PYTHON_VERSION"
        return 0
    else
        print_error "Python not found. Please install Python 3.7+"
        return 1
    fi
}

# Function to check requirements
check_requirements() {
    print_step "Checking requirements..."
    
    # Check if config file exists
    if [ ! -f "config/config.yaml" ]; then
        print_error "Config file not found: config/config.yaml"
        print_info "Please create config file with Multilogin API credentials"
        return 1
    fi
    
    # Check if examples directory exists
    if [ ! -d "examples" ]; then
        print_error "Examples directory not found"
        return 1
    fi
    
    # Check if start_automate.py exists
    if [ ! -f "examples/start_automate.py" ]; then
        print_error "start_automate.py not found in examples directory"
        return 1
    fi
    
    print_success "Requirements check passed"
    return 0
}

# Function to show help
show_help() {
    print_header "Run Automate"
    
    echo "Usage: $0 run --profile=PROFILE_ID"
    echo ""
    echo "Commands:"
    echo "  run                    Run automation with profile"
    echo "  help                   Show this help message"
    echo ""
    echo "Options:"
    echo "  --profile=PROFILE_ID   Profile ID to use for automation"
    echo ""
    echo "Examples:"
    echo "  $0 run --profile=2ebdd8cb-0ba2-418d-90e1-02efe5ef92f6"
    echo "  $0 help"
    echo ""
    echo "Features:"
    echo "  ✅ Proxy Update (using profile location data)"
    echo "  ✅ Profile Start"
    echo "  ✅ Selenium Automation"
    echo "  ✅ Personality System"
    echo "  ✅ Navigation System"
    echo "  ✅ AdSense Integration"
    echo "  ✅ Performance Monitoring"
}

# Function to run automation
run_automation() {
    local profile_id="$1"
    
    if [ -z "$profile_id" ]; then
        print_error "Profile ID is required"
        echo "Usage: $0 run --profile=PROFILE_ID"
        return 1
    fi
    
    print_header "Running Automation"
    print_info "Profile ID: $profile_id"
    
    # Check requirements
    if ! check_requirements; then
        return 1
    fi
    
    # Run automation
    print_step "Starting automation..."
    
    cd examples
    python3 start_automate.py --profile="$profile_id"
    exit_code=$?
    cd ..
    
    if [ $exit_code -eq 0 ]; then
        print_success "Automation completed successfully!"
    else
        print_error "Automation failed with exit code: $exit_code"
    fi
    
    return $exit_code
}

# Main script logic
main() {
    print_header "Run Automate"
    
    # Check Python
    if ! check_python; then
        exit 1
    fi
    
    # Parse command line arguments
    case "${1:-help}" in
        "run")
            # Extract profile ID from --profile=PROFILE_ID format
            profile_id=""
            for arg in "$@"; do
                if [[ $arg == --profile=* ]]; then
                    profile_id="${arg#--profile=}"
                    break
                fi
            done
            
            run_automation "$profile_id"
            ;;
        "help"|"--help"|"-h")
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
