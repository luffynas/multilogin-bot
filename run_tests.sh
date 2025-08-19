#!/bin/bash

# Test Runner Script for Multi-Login Bot
# Runs unit tests, integration tests, and provides coverage reporting

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
TEST_DIR="$PROJECT_DIR/tests"
COVERAGE_DIR="$PROJECT_DIR/coverage"

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
    echo -e "${BLUE}  MULTI-LOGIN BOT TEST SUITE${NC}"
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

# Function to install test dependencies
install_test_dependencies() {
    print_info "Installing test dependencies..."
    pip install --upgrade pip
    pip install pytest pytest-cov pytest-mock pytest-asyncio
    pip install -r "$PROJECT_DIR/requirements.txt"
    print_success "Test dependencies installed"
}

# Function to run unit tests
run_unit_tests() {
    print_info "Running unit tests..."
    
    cd "$PROJECT_DIR"
    
    # Run pytest with coverage
    python -m pytest tests/ -v --cov=src --cov-report=html --cov-report=term-missing --cov-fail-under=70
    
    if [ $? -eq 0 ]; then
        print_success "Unit tests passed"
    else
        print_error "Unit tests failed"
        return 1
    fi
}

# Function to run integration tests
run_integration_tests() {
    print_info "Running integration tests..."
    
    cd "$PROJECT_DIR"
    
    # Run integration tests (if any)
    if [ -d "$TEST_DIR/integration" ]; then
        python -m pytest tests/integration/ -v --cov=src --cov-append
        print_success "Integration tests completed"
    else
        print_warning "No integration tests found"
    fi
}

# Function to run configuration validation tests
run_config_tests() {
    print_info "Running configuration validation tests..."
    
    cd "$PROJECT_DIR"
    
    # Test configuration validation
    python -c "
from src.core.config_validator import ConfigValidator
import yaml

# Load test config
with open('config/config.yaml', 'r') as f:
    config = yaml.safe_load(f)

# Validate config
validator = ConfigValidator()
is_valid, errors, warnings = validator.validate_config(config)

print(f'Configuration valid: {is_valid}')
if errors:
    print('Errors:')
    for error in errors:
        print(f'  - {error}')
if warnings:
    print('Warnings:')
    for warning in warnings:
        print(f'  - {warning}')

if not is_valid:
    exit(1)
"
    
    if [ $? -eq 0 ]; then
        print_success "Configuration validation passed"
    else
        print_error "Configuration validation failed"
        return 1
    fi
}

# Function to run linting
run_linting() {
    print_info "Running code linting..."
    
    cd "$PROJECT_DIR"
    
    # Install linting tools if not available
    pip install flake8 pylint black isort
    
    # Run flake8
    print_info "Running flake8..."
    python -m flake8 src/ --max-line-length=120 --ignore=E501,W503
    
    # Run black check
    print_info "Running black check..."
    python -m black --check src/
    
    # Run isort check
    print_info "Running isort check..."
    python -m isort --check-only src/
    
    print_success "Linting passed"
}

# Function to run all tests
run_all_tests() {
    print_header
    
    # Check virtual environment
    check_venv
    
    # Activate virtual environment
    activate_venv
    
    # Install test dependencies
    install_test_dependencies
    
    # Create coverage directory
    mkdir -p "$COVERAGE_DIR"
    
    # Run tests
    print_info "Starting test suite..."
    
    # Run linting first
    run_linting
    
    # Run configuration validation
    run_config_tests
    
    # Run unit tests
    run_unit_tests
    
    # Run integration tests
    run_integration_tests
    
    print_success "All tests completed successfully!"
    
    # Show coverage report
    show_coverage_report
}

# Function to show coverage report
show_coverage_report() {
    if [ -f "$COVERAGE_DIR/html/index.html" ]; then
        print_info "Coverage report generated:"
        echo "  HTML: $COVERAGE_DIR/html/index.html"
        echo "  Open in browser to view detailed coverage"
    fi
}

# Function to run specific test
run_specific_test() {
    local test_file="$1"
    
    print_info "Running specific test: $test_file"
    
    cd "$PROJECT_DIR"
    
    if [ -f "$test_file" ]; then
        python -m pytest "$test_file" -v
    else
        print_error "Test file not found: $test_file"
        exit 1
    fi
}

# Function to run tests with coverage only
run_coverage_only() {
    print_info "Running tests with coverage only..."
    
    cd "$PROJECT_DIR"
    
    python -m pytest tests/ --cov=src --cov-report=html --cov-report=term-missing --cov-fail-under=70 -q
}

# Function to clean test artifacts
clean_test_artifacts() {
    print_info "Cleaning test artifacts..."
    
    cd "$PROJECT_DIR"
    
    # Remove coverage files
    rm -rf "$COVERAGE_DIR"
    rm -rf .coverage
    rm -rf .pytest_cache
    rm -rf __pycache__
    find . -name "*.pyc" -delete
    find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
    
    print_success "Test artifacts cleaned"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTION]"
    echo
    echo "Options:"
    echo "  all              Run all tests (default)"
    echo "  unit             Run unit tests only"
    echo "  integration      Run integration tests only"
    echo "  config           Run configuration validation only"
    echo "  lint             Run linting only"
    echo "  coverage         Run tests with coverage only"
    echo "  clean            Clean test artifacts"
    echo "  specific FILE    Run specific test file"
    echo "  help             Show this help message"
    echo
    echo "Examples:"
    echo "  $0               # Run all tests"
    echo "  $0 unit          # Run unit tests only"
    echo "  $0 specific tests/test_adsense_monitor.py"
    echo "  $0 clean         # Clean test artifacts"
}

# Main script logic
main() {
    case "${1:-all}" in
        all)
            run_all_tests
            ;;
        unit)
            check_venv
            activate_venv
            install_test_dependencies
            run_unit_tests
            ;;
        integration)
            check_venv
            activate_venv
            install_test_dependencies
            run_integration_tests
            ;;
        config)
            check_venv
            activate_venv
            install_test_dependencies
            run_config_tests
            ;;
        lint)
            check_venv
            activate_venv
            install_test_dependencies
            run_linting
            ;;
        coverage)
            check_venv
            activate_venv
            install_test_dependencies
            run_coverage_only
            ;;
        clean)
            clean_test_artifacts
            ;;
        specific)
            if [ -z "$2" ]; then
                print_error "Please specify test file"
                show_usage
                exit 1
            fi
            check_venv
            activate_venv
            install_test_dependencies
            run_specific_test "$2"
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
