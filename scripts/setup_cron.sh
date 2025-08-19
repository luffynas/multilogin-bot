#!/bin/bash

# Setup Cron Jobs for Multi-Login Bot
# This script sets up automated daily execution

# Script variables
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
DAILY_SCRIPT="$PROJECT_DIR/scripts/start_daily.sh"
CRON_LOG="$PROJECT_DIR/logs/cron_setup.log"

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
    echo -e "${BLUE}   Cron Setup for Multi-Login Bot${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Function to log messages
log_message() {
    local message="$1"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] $message" | tee -a "$CRON_LOG"
}

# Function to check if script exists
check_script() {
    if [ ! -f "$DAILY_SCRIPT" ]; then
        print_error "Daily script not found: $DAILY_SCRIPT"
        return 1
    fi
    
    # Make script executable
    chmod +x "$DAILY_SCRIPT"
    print_status "Daily script is executable"
    return 0
}

# Function to show current cron jobs
show_current_cron() {
    print_status "Current cron jobs for user $(whoami):"
    echo "----------------------------------------"
    crontab -l 2>/dev/null || echo "No cron jobs found"
    echo "----------------------------------------"
}

# Function to add cron job
add_cron_job() {
    local schedule="$1"
    local description="$2"
    
    # Create temporary cron file
    local temp_cron=$(mktemp)
    
    # Get current cron jobs
    crontab -l 2>/dev/null > "$temp_cron"
    
    # Add new cron job
    echo "# $description" >> "$temp_cron"
    echo "$schedule $DAILY_SCRIPT >> $PROJECT_DIR/logs/cron.log 2>&1" >> "$temp_cron"
    
    # Install new cron jobs
    if crontab "$temp_cron"; then
        print_status "Cron job added successfully: $description"
        log_message "Cron job added: $description ($schedule)"
    else
        print_error "Failed to add cron job"
        log_message "Failed to add cron job: $description"
        rm -f "$temp_cron"
        return 1
    fi
    
    # Cleanup
    rm -f "$temp_cron"
    return 0
}

# Function to remove cron jobs
remove_cron_jobs() {
    print_warning "This will remove all Multi-Login Bot cron jobs. Continue? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        # Create temporary cron file
        local temp_cron=$(mktemp)
        
        # Get current cron jobs and filter out Multi-Login Bot jobs
        crontab -l 2>/dev/null | grep -v "Multi-Login Bot" | grep -v "$DAILY_SCRIPT" > "$temp_cron"
        
        # Install filtered cron jobs
        if crontab "$temp_cron"; then
            print_status "Multi-Login Bot cron jobs removed"
            log_message "Multi-Login Bot cron jobs removed"
        else
            print_error "Failed to remove cron jobs"
            log_message "Failed to remove cron jobs"
        fi
        
        # Cleanup
        rm -f "$temp_cron"
    else
        print_status "Cron job removal cancelled"
    fi
}

# Function to setup recommended cron jobs
setup_recommended_cron() {
    print_status "Setting up recommended cron jobs..."
    
    # Daily execution at 9 AM
    add_cron_job "0 9 * * *" "Multi-Login Bot - Daily execution at 9 AM"
    
    # Daily execution at 2 PM
    add_cron_job "0 14 * * *" "Multi-Login Bot - Daily execution at 2 PM"
    
    # Daily execution at 7 PM
    add_cron_job "0 19 * * *" "Multi-Login Bot - Daily execution at 7 PM"
    
    print_status "Recommended cron jobs setup completed"
}

# Function to setup custom cron job
setup_custom_cron() {
    print_status "Setting up custom cron job..."
    
    echo "Available schedules:"
    echo "1. Every hour (0 * * * *)"
    echo "2. Every 2 hours (0 */2 * * *)"
    echo "3. Every 4 hours (0 */4 * * *)"
    echo "4. Twice daily at 9 AM and 7 PM (0 9,19 * * *)"
    echo "5. Custom schedule"
    echo ""
    
    read -p "Choose schedule (1-5): " choice
    
    case $choice in
        1)
            add_cron_job "0 * * * *" "Multi-Login Bot - Every hour"
            ;;
        2)
            add_cron_job "0 */2 * * *" "Multi-Login Bot - Every 2 hours"
            ;;
        3)
            add_cron_job "0 */4 * * *" "Multi-Login Bot - Every 4 hours"
            ;;
        4)
            add_cron_job "0 9,19 * * *" "Multi-Login Bot - Twice daily (9 AM, 7 PM)"
            ;;
        5)
            echo "Enter custom cron schedule (e.g., '0 9 * * *' for daily at 9 AM):"
            read -p "Schedule: " custom_schedule
            read -p "Description: " custom_description
            add_cron_job "$custom_schedule" "Multi-Login Bot - $custom_description"
            ;;
        *)
            print_error "Invalid choice"
            return 1
            ;;
    esac
}

# Function to show cron help
show_cron_help() {
    echo "Cron Schedule Format:"
    echo "┌───────────── minute (0 - 59)"
    echo "│ ┌───────────── hour (0 - 23)"
    echo "│ │ ┌───────────── day of month (1 - 31)"
    echo "│ │ │ ┌───────────── month (1 - 12)"
    echo "│ │ │ │ ┌───────────── day of week (0 - 6) (Sunday=0)"
    echo "│ │ │ │ │"
    echo "* * * * * command"
    echo ""
    echo "Examples:"
    echo "0 9 * * *     - Daily at 9 AM"
    echo "0 9,17 * * *  - Daily at 9 AM and 5 PM"
    echo "0 */2 * * *   - Every 2 hours"
    echo "0 9 * * 1-5   - Weekdays at 9 AM"
    echo "0 9 1 * *     - First day of month at 9 AM"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help              Show this help message"
    echo "  -s, --show              Show current cron jobs"
    echo "  -r, --recommended       Setup recommended cron jobs"
    echo "  -c, --custom            Setup custom cron job"
    echo "  -d, --remove            Remove all Multi-Login Bot cron jobs"
    echo "  -i, --info              Show cron schedule help"
    echo ""
    echo "Examples:"
    echo "  $0 -s                   # Show current cron jobs"
    echo "  $0 -r                   # Setup recommended cron jobs"
    echo "  $0 -c                   # Setup custom cron job"
    echo "  $0 -d                   # Remove cron jobs"
}

# Main script logic
main() {
    print_header
    
    # Check if script exists
    if ! check_script; then
        exit 1
    fi
    
    # Parse command line arguments
    case "${1:-}" in
        -h|--help)
            show_usage
            exit 0
            ;;
        -s|--show)
            show_current_cron
            exit 0
            ;;
        -r|--recommended)
            setup_recommended_cron
            show_current_cron
            exit 0
            ;;
        -c|--custom)
            setup_custom_cron
            show_current_cron
            exit 0
            ;;
        -d|--remove)
            remove_cron_jobs
            show_current_cron
            exit 0
            ;;
        -i|--info)
            show_cron_help
            exit 0
            ;;
        "")
            # No arguments provided, show interactive menu
            echo "Multi-Login Bot Cron Setup"
            echo "=========================="
            echo "1. Show current cron jobs"
            echo "2. Setup recommended cron jobs"
            echo "3. Setup custom cron job"
            echo "4. Remove cron jobs"
            echo "5. Show cron help"
            echo "6. Exit"
            echo ""
            read -p "Choose option (1-6): " choice
            
            case $choice in
                1)
                    show_current_cron
                    ;;
                2)
                    setup_recommended_cron
                    show_current_cron
                    ;;
                3)
                    setup_custom_cron
                    show_current_cron
                    ;;
                4)
                    remove_cron_jobs
                    show_current_cron
                    ;;
                5)
                    show_cron_help
                    ;;
                6)
                    print_status "Exiting..."
                    exit 0
                    ;;
                *)
                    print_error "Invalid choice"
                    exit 1
                    ;;
            esac
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
