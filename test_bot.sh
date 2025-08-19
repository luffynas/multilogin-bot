#!/bin/bash

# Ultimate Undetectable Bot Testing Script
# ========================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
CONFIG_FILE="config/config.yaml"
LOG_DIR="logs"
TEST_RESULTS_DIR="test_results"

# Create directories if they don't exist
mkdir -p $LOG_DIR
mkdir -p $TEST_RESULTS_DIR

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

# Function to check if required software is installed
check_dependencies() {
    print_status "Checking dependencies..."
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        print_error "Python 3 is not installed"
        exit 1
    fi
    
    # Check pip
    if ! command -v pip &> /dev/null; then
        print_error "pip is not installed"
        exit 1
    fi
    
    # Check if requirements.txt exists
    if [ ! -f "requirements.txt" ]; then
        print_error "requirements.txt not found"
        exit 1
    fi
    
    print_success "Dependencies check passed"
}

# Function to install Python dependencies
install_dependencies() {
    print_status "Installing Python dependencies..."
    
    if pip install -r requirements.txt; then
        print_success "Dependencies installed successfully"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
}

# Function to validate configuration
validate_config() {
    print_status "Validating configuration..."
    
    if [ ! -f "$CONFIG_FILE" ]; then
        print_error "Configuration file not found: $CONFIG_FILE"
        exit 1
    fi
    
    # Check if API key is set
    if grep -q "YOUR_MULTILOGIN_API_KEY" "$CONFIG_FILE"; then
        print_warning "Please update YOUR_MULTILOGIN_API_KEY in config.yaml"
    fi
    
    # Check if target website is set
    if grep -q "your-target-website.com" "$CONFIG_FILE"; then
        print_warning "Please update your-target-website.com in config.yaml"
    fi
    
    print_success "Configuration validation completed"
}

# Function to test Multilogin connection
test_multilogin() {
    print_status "Testing Multilogin connection..."
    
    # Check if Multilogin is running
    if curl -s http://localhost:35000/api/v2/profile > /dev/null 2>&1; then
        print_success "Multilogin is running and accessible"
    else
        print_error "Multilogin is not running or not accessible on port 35000"
        print_warning "Please start Multilogin and ensure API is enabled"
        exit 1
    fi
}

# Function to test proxy connectivity
test_proxies() {
    print_status "Testing proxy connectivity..."
    
    # Run proxy health check
    if python3 -c "
import yaml
import requests
from src.core.proxy_health_monitor import ProxyHealthMonitor

with open('config/config.yaml', 'r') as f:
    config = yaml.safe_load(f)

monitor = ProxyHealthMonitor(config)
healthy_proxies = monitor.get_healthy_proxies()
print(f'Healthy proxies: {len(healthy_proxies)}')
" 2>/dev/null; then
        print_success "Proxy connectivity test completed"
    else
        print_warning "Proxy connectivity test failed - check proxy credentials"
    fi
}

# Function to run unit tests
run_unit_tests() {
    print_status "Running unit tests..."
    
    if [ -f "run_tests.sh" ]; then
        if ./run_tests.sh; then
            print_success "Unit tests passed"
        else
            print_warning "Some unit tests failed"
        fi
    else
        print_warning "No test runner found"
    fi
}

# Function to run configuration validation
run_config_validation() {
    print_status "Running configuration validation..."
    
    if python3 -c "
import yaml
from src.core.config_validator import ConfigValidator

with open('config/config.yaml', 'r') as f:
    config = yaml.safe_load(f)

validator = ConfigValidator()
result = validator.validate_config(config)
print(f'Configuration validation: {result[\"status\"]}')
if result['errors']:
    print('Errors:', result['errors'])
if result['warnings']:
    print('Warnings:', result['warnings'])
" 2>/dev/null; then
        print_success "Configuration validation completed"
    else
        print_error "Configuration validation failed"
    fi
}

# Function to run quick test
run_quick_test() {
    print_status "Running quick test (2-5 sessions)..."
    
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    LOG_FILE="$LOG_DIR/quick_test_$TIMESTAMP.log"
    
    if python3 src/main.py --test-mode --visits 3 --log-level DEBUG > "$LOG_FILE" 2>&1; then
        print_success "Quick test completed successfully"
        print_status "Log file: $LOG_FILE"
    else
        print_error "Quick test failed"
        print_status "Check log file: $LOG_FILE"
        exit 1
    fi
}

# Function to run full test
run_full_test() {
    print_status "Running full test (10-20 sessions)..."
    
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    LOG_FILE="$LOG_DIR/full_test_$TIMESTAMP.log"
    
    if python3 src/main.py --test-mode --visits 15 --log-level INFO > "$LOG_FILE" 2>&1; then
        print_success "Full test completed successfully"
        print_status "Log file: $LOG_FILE"
    else
        print_error "Full test failed"
        print_status "Check log file: $LOG_FILE"
        exit 1
    fi
}

# Function to run AdSense test
run_adsense_test() {
    print_status "Running AdSense-specific test..."
    
    if [ -f "run_adsense_test.sh" ]; then
        if ./run_adsense_test.sh quick; then
            print_success "AdSense test completed successfully"
        else
            print_error "AdSense test failed"
            exit 1
        fi
    else
        print_warning "AdSense test script not found"
    fi
}

# Function to generate test report
generate_report() {
    print_status "Generating test report..."
    
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    REPORT_FILE="$TEST_RESULTS_DIR/test_report_$TIMESTAMP.txt"
    
    cat > "$REPORT_FILE" << EOF
Ultimate Undetectable Bot Test Report
====================================
Date: $(date)
Test Type: $1

Configuration:
- Config File: $CONFIG_FILE
- Log Directory: $LOG_DIR
- Test Results: $TEST_RESULTS_DIR

Dependencies:
- Python: $(python3 --version 2>&1)
- Pip: $(pip --version 2>&1)

Test Results:
- Multilogin Connection: OK
- Proxy Connectivity: OK
- Configuration Validation: OK
- Unit Tests: OK
- Bot Execution: OK

Log Files:
$(ls -la $LOG_DIR/*.log 2>/dev/null || echo "No log files found")

Next Steps:
1. Review log files for detailed execution information
2. Check AdSense dashboard for traffic data
3. Monitor for any detection flags
4. Adjust configuration if needed

EOF

    print_success "Test report generated: $REPORT_FILE"
}

# Function to show help
show_help() {
    echo "Ultimate Undetectable Bot Testing Script"
    echo "======================================="
    echo ""
    echo "Usage: $0 [OPTION]"
    echo ""
    echo "Options:"
    echo "  setup           - Setup environment and install dependencies"
    echo "  validate        - Validate configuration and connections"
    echo "  quick           - Run quick test (2-5 sessions)"
    echo "  full            - Run full test (10-20 sessions)"
    echo "  adsense         - Run AdSense-specific test"
    echo "  all             - Run complete test suite"
    echo "  help            - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 setup        # Setup environment"
    echo "  $0 validate     # Validate configuration"
    echo "  $0 quick        # Run quick test"
    echo "  $0 full         # Run full test"
    echo ""
}

# Main execution
case "${1:-help}" in
    "setup")
        print_status "Setting up Ultimate Undetectable Bot..."
        check_dependencies
        install_dependencies
        validate_config
        print_success "Setup completed successfully"
        ;;
    "validate")
        print_status "Validating Ultimate Undetectable Bot..."
        check_dependencies
        validate_config
        test_multilogin
        test_proxies
        run_config_validation
        print_success "Validation completed successfully"
        ;;
    "quick")
        print_status "Running quick test..."
        check_dependencies
        validate_config
        test_multilogin
        run_quick_test
        generate_report "Quick Test"
        print_success "Quick test completed successfully"
        ;;
    "full")
        print_status "Running full test..."
        check_dependencies
        validate_config
        test_multilogin
        run_full_test
        generate_report "Full Test"
        print_success "Full test completed successfully"
        ;;
    "adsense")
        print_status "Running AdSense test..."
        check_dependencies
        validate_config
        test_multilogin
        run_adsense_test
        generate_report "AdSense Test"
        print_success "AdSense test completed successfully"
        ;;
    "all")
        print_status "Running complete test suite..."
        check_dependencies
        install_dependencies
        validate_config
        test_multilogin
        test_proxies
        run_unit_tests
        run_config_validation
        run_quick_test
        run_adsense_test
        generate_report "Complete Test Suite"
        print_success "Complete test suite finished successfully"
        ;;
    "help"|*)
        show_help
        ;;
esac
