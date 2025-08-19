#!/bin/bash

# Multi-Login Bot Runner Script
# Version: 1.0.0
# Description: Script untuk menjalankan Multi-Login Bot dengan berbagai opsi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Script variables
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"
PYTHON_CMD="python3"
MAIN_SCRIPT="$PROJECT_DIR/src/main.py"
CONFIG_FILE="$PROJECT_DIR/config/config.yaml"
LOG_DIR="$PROJECT_DIR/logs"
VENV_DIR="$PROJECT_DIR/venv"

# Default values
MODE="normal"
DEBUG=false
DAILY_VISITS=0
CONFIG_PATH=""
LOG_LEVEL="INFO"

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
    echo -e "${CYAN}================================${NC}"
    echo -e "${CYAN}   Multi-Login Bot Runner${NC}"
    echo -e "${CYAN}================================${NC}"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help              Show this help message"
    echo "  -d, --debug             Run in debug mode"
    echo "  -t, --test              Run in test mode (single session)"
    echo "  -v, --visits NUMBER     Set custom daily visits count"
    echo "  -c, --config PATH       Use custom config file"
    echo "  -l, --log-level LEVEL   Set log level (DEBUG, INFO, WARNING, ERROR)"
    echo "  -i, --install           Install dependencies"
    echo "  -s, --setup             Setup virtual environment"
    echo "  -r, --reset             Reset logs and cache"
    echo "  -m, --monitor           Monitor running bot"
    echo ""
    echo "Examples:"
    echo "  $0                      # Run normally"
    echo "  $0 -d                   # Run in debug mode"
    echo "  $0 -t                   # Run test mode"
    echo "  $0 -v 100               # Run with 100 daily visits"
    echo "  $0 -c custom_config.yaml # Use custom config"
    echo "  $0 -i                   # Install dependencies"
    echo "  $0 -s                   # Setup virtual environment"
}

# Function to check if Python is installed
check_python() {
    if ! command -v $PYTHON_CMD &> /dev/null; then
        print_error "Python3 is not installed or not in PATH"
        print_status "Please install Python 3.8 or higher"
        exit 1
    fi
    
    PYTHON_VERSION=$($PYTHON_CMD --version 2>&1 | awk '{print $2}')
    print_status "Python version: $PYTHON_VERSION"
}

# Function to setup virtual environment
setup_venv() {
    print_status "Setting up virtual environment..."
    
    if [ ! -d "$VENV_DIR" ]; then
        $PYTHON_CMD -m venv "$VENV_DIR"
        print_status "Virtual environment created at $VENV_DIR"
    else
        print_warning "Virtual environment already exists"
    fi
    
    # Activate virtual environment
    source "$VENV_DIR/bin/activate"
    
    # Upgrade pip
    pip install --upgrade pip
    
    print_status "Virtual environment setup completed"
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    # Check if virtual environment exists
    if [ ! -d "$VENV_DIR" ]; then
        print_warning "Virtual environment not found. Setting up..."
        setup_venv
    fi
    
    # Activate virtual environment
    source "$VENV_DIR/bin/activate"
    
    # Install requirements
    if [ -f "$PROJECT_DIR/requirements.txt" ]; then
        pip install -r "$PROJECT_DIR/requirements.txt"
        print_status "Dependencies installed successfully"
    else
        print_error "requirements.txt not found"
        exit 1
    fi
}

# Function to check configuration
check_config() {
    if [ ! -f "$CONFIG_FILE" ]; then
        print_error "Configuration file not found: $CONFIG_FILE"
        print_status "Please create the configuration file first"
        exit 1
    fi
    
    # Check if config is valid YAML
    if command -v python3 &> /dev/null; then
        $PYTHON_CMD -c "import yaml; yaml.safe_load(open('$CONFIG_FILE'))" 2>/dev/null
        if [ $? -ne 0 ]; then
            print_error "Invalid YAML configuration file"
            exit 1
        fi
    fi
    
    print_status "Configuration file validated"
}

# Function to create necessary directories
create_directories() {
    print_status "Creating necessary directories..."
    
    mkdir -p "$LOG_DIR"
    mkdir -p "$PROJECT_DIR/data"
    mkdir -p "$PROJECT_DIR/cache"
    
    print_status "Directories created"
}

# Function to reset logs and cache
reset_data() {
    print_warning "This will delete all logs and cache data. Continue? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_status "Resetting logs and cache..."
        
        # Remove logs
        if [ -d "$LOG_DIR" ]; then
            rm -rf "$LOG_DIR"/*
            print_status "Logs cleared"
        fi
        
        # Remove cache
        if [ -d "$PROJECT_DIR/cache" ]; then
            rm -rf "$PROJECT_DIR/cache"/*
            print_status "Cache cleared"
        fi
        
        # Remove data
        if [ -d "$PROJECT_DIR/data" ]; then
            rm -rf "$PROJECT_DIR/data"/*
            print_status "Data cleared"
        fi
        
        print_status "Reset completed"
    else
        print_status "Reset cancelled"
    fi
}

# Function to monitor running bot
monitor_bot() {
    print_status "Monitoring bot activity..."
    
    # Check if bot is running
    BOT_PID=$(pgrep -f "python.*main.py")
    if [ -z "$BOT_PID" ]; then
        print_warning "Bot is not currently running"
        return
    fi
    
    print_status "Bot is running with PID: $BOT_PID"
    
    # Show recent logs
    if [ -d "$LOG_DIR" ]; then
        LATEST_LOG=$(ls -t "$LOG_DIR"/bot_*.log 2>/dev/null | head -1)
        if [ -n "$LATEST_LOG" ]; then
            echo ""
            print_status "Recent log entries:"
            echo "----------------------------------------"
            tail -20 "$LATEST_LOG"
            echo "----------------------------------------"
        fi
    fi
    
    # Show system resources
    echo ""
    print_status "System resources:"
    echo "----------------------------------------"
    ps -p "$BOT_PID" -o pid,ppid,cmd,%mem,%cpu
    echo "----------------------------------------"
}

# Function to run bot
run_bot() {
    print_status "Starting Multi-Login Bot..."
    
    # Check if virtual environment exists and activate it
    if [ -d "$VENV_DIR" ]; then
        source "$VENV_DIR/bin/activate"
        print_status "Virtual environment activated"
    else
        print_warning "Virtual environment not found. Running with system Python"
    fi
    
    # Set environment variables
    export PYTHONPATH="$PROJECT_DIR:$PYTHONPATH"
    
    # Build command
    CMD="$PYTHON_CMD $MAIN_SCRIPT"
    
    # Add debug mode
    if [ "$DEBUG" = true ]; then
        export PYTHONUNBUFFERED=1
        CMD="$CMD --debug"
        print_status "Running in debug mode"
    fi
    
    # Add custom config
    if [ -n "$CONFIG_PATH" ]; then
        CMD="$CMD --config $CONFIG_PATH"
        print_status "Using custom config: $CONFIG_PATH"
    fi
    
    # Add custom visits
    if [ "$DAILY_VISITS" -gt 0 ]; then
        CMD="$CMD --visits $DAILY_VISITS"
        print_status "Custom daily visits: $DAILY_VISITS"
    fi
    
    # Add log level
    if [ -n "$LOG_LEVEL" ]; then
        export LOG_LEVEL="$LOG_LEVEL"
        print_status "Log level: $LOG_LEVEL"
    fi
    
    # Run the bot
    print_status "Executing: $CMD"
    echo ""
    
    # Run with error handling
    if eval "$CMD"; then
        print_status "Bot completed successfully"
    else
        print_error "Bot failed with exit code $?"
        exit 1
    fi
}

# Function to run test mode
run_test() {
    print_status "Running in test mode (single session)..."
    
    # Create temporary test config
    TEST_CONFIG="$PROJECT_DIR/config/test_config.yaml"
    cp "$CONFIG_FILE" "$TEST_CONFIG"
    
    # Modify config for test mode
    $PYTHON_CMD -c "
import yaml
config = yaml.safe_load(open('$TEST_CONFIG'))
config['behavior']['daily_visits_min'] = 1
config['behavior']['daily_visits_max'] = 1
with open('$TEST_CONFIG', 'w') as f:
    yaml.dump(config, f)
"
    
    # Run with test config
    CONFIG_PATH="$TEST_CONFIG"
    run_bot
    
    # Cleanup
    rm -f "$TEST_CONFIG"
}

# Main script logic
main() {
    print_header
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_usage
                exit 0
                ;;
            -d|--debug)
                DEBUG=true
                shift
                ;;
            -t|--test)
                MODE="test"
                shift
                ;;
            -v|--visits)
                DAILY_VISITS="$2"
                shift 2
                ;;
            -c|--config)
                CONFIG_PATH="$2"
                shift 2
                ;;
            -l|--log-level)
                LOG_LEVEL="$2"
                shift 2
                ;;
            -i|--install)
                check_python
                setup_venv
                install_dependencies
                exit 0
                ;;
            -s|--setup)
                check_python
                setup_venv
                install_dependencies
                create_directories
                print_status "Setup completed successfully"
                exit 0
                ;;
            -r|--reset)
                reset_data
                exit 0
                ;;
            -m|--monitor)
                monitor_bot
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    # Pre-run checks
    check_python
    check_config
    create_directories
    
    # Run based on mode
    case $MODE in
        "normal")
            run_bot
            ;;
        "test")
            run_test
            ;;
        *)
            print_error "Unknown mode: $MODE"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
