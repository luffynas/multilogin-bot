#!/bin/bash

# Daily Automation Script for Multi-Login Bot
# This script can be used with cron to run the bot daily

# Script variables
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
RUN_SCRIPT="$PROJECT_DIR/run_bot.sh"
LOG_FILE="$PROJECT_DIR/logs/daily_automation.log"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Function to log messages
log_message() {
    local message="$1"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] $message" | tee -a "$LOG_FILE"
}

# Function to check if bot should run
should_run_bot() {
    local current_hour=$(date '+%H')
    local current_minute=$(date '+%M')
    
    # Run between 8 AM and 10 PM
    if [ "$current_hour" -ge 8 ] && [ "$current_hour" -lt 22 ]; then
        return 0
    else
        return 1
    fi
}

# Function to check if bot is already running
is_bot_running() {
    pgrep -f "python.*main.py" > /dev/null
    return $?
}

# Function to start the bot
start_bot() {
    log_message "Starting Multi-Login Bot..."
    
    # Run the bot with normal settings
    if "$RUN_SCRIPT"; then
        log_message "Bot completed successfully"
        return 0
    else
        log_message "Bot failed with exit code $?"
        return 1
    fi
}

# Function to send notification
send_notification() {
    local message="$1"
    local status="$2"
    
    # You can customize this to send notifications via email, Slack, etc.
    log_message "NOTIFICATION [$status]: $message"
    
    # Example: Send email notification
    # echo "$message" | mail -s "Multi-Login Bot $status" your-email@example.com
    
    # Example: Send Slack notification
    # curl -X POST -H 'Content-type: application/json' \
    #     --data "{\"text\":\"Multi-Login Bot $status: $message\"}" \
    #     https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
}

# Main execution
main() {
    log_message "=== Daily Automation Started ==="
    
    # Check if bot should run based on time
    if ! should_run_bot; then
        log_message "Outside of operating hours (8 AM - 10 PM). Skipping."
        exit 0
    fi
    
    # Check if bot is already running
    if is_bot_running; then
        log_message "Bot is already running. Skipping this execution."
        send_notification "Bot is already running" "WARNING"
        exit 0
    fi
    
    # Check if run script exists
    if [ ! -f "$RUN_SCRIPT" ]; then
        log_message "ERROR: Run script not found at $RUN_SCRIPT"
        send_notification "Run script not found" "ERROR"
        exit 1
    fi
    
    # Make run script executable
    chmod +x "$RUN_SCRIPT"
    
    # Start the bot
    if start_bot; then
        log_message "=== Daily Automation Completed Successfully ==="
        send_notification "Daily automation completed successfully" "SUCCESS"
    else
        log_message "=== Daily Automation Failed ==="
        send_notification "Daily automation failed" "ERROR"
        exit 1
    fi
}

# Run main function
main "$@"
