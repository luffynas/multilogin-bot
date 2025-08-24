#!/bin/bash

# Automate Examples Runner
# Easy way to run different examples

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

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
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}"
}

print_step() {
    echo -e "${CYAN}[STEP]${NC} $1"
}

# Function to check if Python is available
check_python() {
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 is not installed or not in PATH"
        exit 1
    fi
    print_status "Python 3 found: $(python3 --version)"
}

# Function to check if required files exist
check_requirements() {
    print_step "Checking requirements..."
    
    if [ ! -f "config/config.yaml" ]; then
        print_error "config/config.yaml not found!"
        print_warning "Please configure your Multilogin credentials first"
        exit 1
    fi
    
    if [ ! -d "src" ]; then
        print_error "src directory not found!"
        print_warning "Please run this script from the automate directory"
        exit 1
    fi
    
    print_status "Requirements check passed"
}

# Function to install dependencies
install_dependencies() {
    print_step "Installing dependencies..."
    
    if [ -f "requirements.txt" ]; then
        print_status "Installing from requirements.txt..."
        pip3 install -r requirements.txt
    else
        print_warning "requirements.txt not found, installing basic dependencies..."
        pip3 install requests PyYAML selenium schedule
    fi
    
    print_status "Dependencies installed"
}

# Function to run quick start example
run_quick_start() {
    print_header "Running Quick Start Example"
    
    cd examples
    python3 quick_start_example.py
    cd ..
    
    print_status "Quick start example completed"
}

# Function to run comprehensive example
run_comprehensive() {
    print_header "Running Comprehensive Example"
    
    cd examples
    python3 multilogin_login_example.py
    cd ..
    
    print_status "Comprehensive example completed"
}

# Function to run batch automation example
run_batch_automation() {
    print_header "Running Batch Automation Example"
    
    cd examples
    python3 batch_automation_example.py
    cd ..
    
    print_status "Batch automation example completed"
}

# Function to run advanced behavior demo
run_advanced_behavior() {
    print_header "Running Advanced Behavior Demo"
    
    cd examples
    python3 advanced_behavior_demo.py
    cd ..
    
    print_status "Advanced behavior demo completed"
}

# Function to run connection test
run_connection_test() {
    print_header "Running Connection Test"
    
    cd examples
    python3 test_connection.py
    cd ..
    
    print_status "Connection test completed"
}

# Function to run folder test
run_folder_test() {
    print_header "Running Folder Test"
    
    cd examples
    python3 test_folders.py
    cd ..
    
    print_status "Folder test completed"
}

# Function to run selenium test
run_selenium_test() {
    print_header "Running Selenium Automation Test"
    
    cd examples
    python3 test_selenium_automation.py
    cd ..
    
    print_status "Selenium test completed"
}

# Function to run reading behavior test
run_reading_test() {
    print_header "Running Reading Behavior Test"
    
    cd examples
    python3 test_reading_behavior.py
    cd ..
    
    print_status "Reading behavior test completed"
}

# Function to run scrolling test
run_scrolling_test() {
    print_header "Running Scrolling Test"
    
    cd examples
    python3 test_scrolling_simple.py
    cd ..
    
    print_status "Scrolling test completed"
}

run_url_helper_test() {
    print_header "Running URL Helper Test"
    
    cd examples
    python3 test_url_helper.py
    cd ..
    
    print_status "URL helper test completed"
}

run_smart_url_test() {
    print_header "Running Smart URL Test"
    
    cd examples
    python3 test_smart_url.py
    cd ..
    
    print_status "Smart URL test completed"
}

run_no_url_test() {
    print_header "Running Selenium No URL Test"
    
    cd examples
    python3 test_selenium_no_url.py
    cd ..
    
    print_status "Selenium no URL test completed"
}

run_real_url_test() {
    print_header "Running Selenium Real URL Test"
    
    cd examples
    python3 test_selenium_real_url.py
    cd ..
    
    print_status "Selenium real URL test completed"
}

run_url_helper_module_test() {
    print_header "Running URL Helper Module Test"
    
    cd examples
    python3 test_with_url_helper.py
    cd ..
    
    print_status "URL helper module test completed"
}

run_comprehensive_demo() {
    print_header "Running Comprehensive Automation Demo"
    
    cd examples
    python3 comprehensive_automation_demo.py
    cd ..
    
    print_status "Comprehensive automation demo completed"
}

run_previous_next_test() {
    print_header "Testing Previous/Next Navigation"
    
    cd examples
    python3 test_previous_next_navigation.py
    cd ..
    
    print_status "Previous/Next navigation test completed"
}

run_config_test() {
    print_header "Running Configuration Implementation Test"
    
    cd examples
    python3 test_config_implementation.py
    cd ..
    
    print_status "Configuration implementation test completed"
}

run_proxy_update_test() {
    print_header "Running Proxy Update Test"
    
    cd examples
    python3 test_update_proxy.py
    cd ..
    
    print_status "Proxy update test completed"
}

run_proxy_validation_test() {
    print_header "Running Proxy Validation Test"
    
    cd examples
    python3 test_proxy_validation.py
    cd ..
    
    print_status "Proxy validation test completed"
}

run_multilogin_proxy_flow_test() {
    print_header "Running Multilogin Proxy Flow Test"
    
    cd examples
    python3 test_multilogin_proxy_flow.py
    cd ..
    
    print_status "Multilogin proxy flow test completed"
}

run_get_profile_proxy_data() {
    print_header "Running Get Profile Proxy Data"
    
    cd examples
    python3 get_profile_proxy_data.py
    cd ..
    
    print_status "Get profile proxy data completed"
}

run_get_profile_location_data() {
    print_header "Running Get Profile Location Data"
    
    cd examples
    python3 get_profile_location_data.py
    cd ..
    
    print_status "Get profile location data completed"
}



# Function to run manage folders
run_manage_folders() {
    print_header "Running Manage Folders"
    
    cd examples
    if [ $# -eq 0 ]; then
        python3 manage_folders.py
    else
        python3 manage_folders.py "$@"
    fi
    cd ..
    
    print_status "Manage folders completed"
}

# Function to run referer simulation demo
run_referer_simulation() {
    print_header "Running Referer Simulation Demo"
    
    cd examples
    python3 referer_simulation_demo.py
    cd ..
    
    print_status "Referer simulation demo completed"
}

# Function to show logs
show_logs() {
    print_header "Recent Logs"
    
    if [ -f "examples/multilogin_login_example.log" ]; then
        echo -e "${CYAN}Multilogin Login Example Log:${NC}"
        tail -20 examples/multilogin_login_example.log
        echo ""
    fi
    
    if [ -f "examples/batch_automation.log" ]; then
        echo -e "${CYAN}Batch Automation Log:${NC}"
        tail -20 examples/batch_automation.log
        echo ""
    fi
    
    if [ -f "examples/quick_start_example.log" ]; then
        echo -e "${CYAN}Quick Start Example Log:${NC}"
        tail -20 examples/quick_start_example.log
        echo ""
    fi
}

# Function to show data files
show_data() {
    print_header "Data Files"
    
    if [ -d "data" ]; then
        echo -e "${CYAN}Available data files:${NC}"
        ls -la data/
        echo ""
        
        if [ -f "data/profiles.json" ]; then
            echo -e "${CYAN}Profile count:${NC}"
            python3 -c "import json; data=json.load(open('data/profiles.json')); print(f'Total profiles: {len(data)}')"
        fi
        
        if [ -f "data/referer_statistics.json" ]; then
            echo -e "${CYAN}Referer statistics:${NC}"
            python3 -c "import json; data=json.load(open('data/referer_statistics.json')); print(f'Total referers: {data.get(\"total_referers\", 0)}')"
        fi
    else
        print_warning "No data directory found"
    fi
}

# Function to show help
show_help() {
    print_header "Automate Examples Runner"
    
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  test           Test basic connection (recommended first)"
    echo "  folders        Test folder functionality"
    echo "  manage-folders Manage folders (refresh/list/create)"
    echo "  selenium       Test Selenium automation with profile"
    echo "  reading        Test improved reading behavior simulation"
    echo "  scrolling      Test visible scrolling behavior"
    echo "  url-helper     Test getting current URL from profile"
    echo "  smart-url      Test smart URL handling (no double navigation)"
    echo "  no-url         Test Selenium without target URL (like Chrome extension)"
    echo "  real-url       Test Selenium with real URL from address bar (not DevTools)"
    echo "  url-helper-module Test using URL helper module for clean URL handling"
    echo "  comprehensive-demo Run comprehensive demo with all 50+ features"
    echo "  previous-next-test Test previous/next navigation functionality"
    echo "  config-test       Test configuration implementation from config.yaml"
    echo "  proxy-update-test Test proxy update functionality for existing profiles"
    echo "  proxy-validation-test Test proxy validation functionality using Multilogin API"
    echo "  multilogin-proxy-flow-test Test complete Multilogin proxy update flow (Setup→Connection→Validation→Update)"
    echo "  get-profile-proxy-data    Get proxy data from existing profiles"
    echo "  get-profile-location-data Get location data (country, region, city) from existing profiles"

    echo "  quick-start    Run quick start example (recommended for beginners)"
    echo "  comprehensive  Run comprehensive example (all features)"
    echo "  batch          Run batch automation example (multiple profiles)"
    echo "  behavior       Run advanced behavior demo"
    echo "  referer        Run referer simulation demo"
    echo "  all            Run all examples sequentially"
    echo "  logs           Show recent logs"
    echo "  data           Show data files"
    echo "  install        Install dependencies"
    echo "  check          Check requirements"
    echo "  help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 quick-start    # Run quick start example"
    echo "  $0 all           # Run all examples"
    echo "  $0 logs          # Show recent logs"
    echo ""
    echo "For more information, see examples/README.md"
}

# Function to run all examples
run_all() {
    print_header "Running All Examples"
    
    print_step "1. Quick Start Example"
    run_quick_start
    
    print_step "2. Advanced Behavior Demo"
    run_advanced_behavior
    
    print_step "3. Referer Simulation Demo"
    run_referer_simulation
    
    print_step "4. Batch Automation Example"
    run_batch_automation
    
    print_step "5. Comprehensive Example"
    run_comprehensive
    
    print_status "All examples completed!"
}

# Main script logic
main() {
    print_header "Automate Examples Runner"
    
    # Check Python
    check_python
    
    # Parse command line arguments
    case "${1:-help}" in
        "test")
            check_requirements
            run_connection_test
            ;;
        "folders")
            check_requirements
            run_folder_test
            ;;
        "manage-folders")
            check_requirements
            run_manage_folders
            ;;
        "selenium")
            check_requirements
            run_selenium_test
            ;;
        "reading")
            check_requirements
            run_reading_test
            ;;
        "scrolling")
            check_requirements
            run_scrolling_test
            ;;
        "url-helper")
            check_requirements
            run_url_helper_test
            ;;
        "smart-url")
            check_requirements
            run_smart_url_test
            ;;
        "no-url")
            check_requirements
            run_no_url_test
            ;;
        "real-url")
            check_requirements
            run_real_url_test
            ;;
        "url-helper-module")
            check_requirements
            run_url_helper_module_test
            ;;
        "comprehensive-demo")
            check_requirements
            run_comprehensive_demo
            ;;
        "previous-next-test")
            check_requirements
            run_previous_next_test
            ;;
        "config-test")
            check_requirements
            run_config_test
            ;;
        "proxy-update-test")
            check_requirements
            run_proxy_update_test
            ;;
        "proxy-validation-test")
            check_requirements
            run_proxy_validation_test
            ;;
        "multilogin-proxy-flow-test")
            check_requirements
            run_multilogin_proxy_flow_test
            ;;
        "get-profile-proxy-data")
            check_requirements
            run_get_profile_proxy_data
            ;;
        "get-profile-location-data")
            check_requirements
            run_get_profile_location_data
            ;;

        "quick-start"|"quick")
            check_requirements
            run_quick_start
            ;;
        "comprehensive"|"comp")
            check_requirements
            run_comprehensive
            ;;
        "batch")
            check_requirements
            run_batch_automation
            ;;
        "behavior"|"behav")
            check_requirements
            run_advanced_behavior
            ;;
        "referer"|"ref")
            check_requirements
            run_referer_simulation
            ;;
        "all")
            check_requirements
            run_all
            ;;
        "logs")
            show_logs
            ;;
        "data")
            show_data
            ;;
        "install")
            install_dependencies
            ;;
        "check")
            check_requirements
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            print_error "Unknown option: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
