# Multi-Login Bot Runner Script (PowerShell)
# Version: 1.0.0
# Description: Script untuk menjalankan Multi-Login Bot di Windows

param(
    [switch]$Help,
    [switch]$Debug,
    [switch]$Test,
    [int]$Visits = 0,
    [string]$Config = "",
    [string]$LogLevel = "INFO",
    [switch]$Install,
    [switch]$Setup,
    [switch]$Reset,
    [switch]$Monitor
)

# Script variables
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectDir = $ScriptDir
$PythonCmd = "python"
$MainScript = Join-Path $ProjectDir "src\main.py"
$ConfigFile = Join-Path $ProjectDir "config\config.yaml"
$LogDir = Join-Path $ProjectDir "logs"
$VenvDir = Join-Path $ProjectDir "venv"

# Default values
$Mode = "normal"
$DebugMode = $false
$DailyVisits = 0
$ConfigPath = ""
$LogLevelSetting = "INFO"

# Function to write colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Write-Header {
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host "   Multi-Login Bot Runner" -ForegroundColor Cyan
    Write-Host "================================" -ForegroundColor Cyan
}

# Function to show usage
function Show-Usage {
    Write-Host "Usage: .\run_bot.ps1 [OPTIONS]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -Help              Show this help message"
    Write-Host "  -Debug             Run in debug mode"
    Write-Host "  -Test              Run in test mode (single session)"
    Write-Host "  -Visits NUMBER     Set custom daily visits count"
    Write-Host "  -Config PATH       Use custom config file"
    Write-Host "  -LogLevel LEVEL    Set log level (DEBUG, INFO, WARNING, ERROR)"
    Write-Host "  -Install           Install dependencies"
    Write-Host "  -Setup             Setup virtual environment"
    Write-Host "  -Reset             Reset logs and cache"
    Write-Host "  -Monitor           Monitor running bot"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\run_bot.ps1                      # Run normally"
    Write-Host "  .\run_bot.ps1 -Debug               # Run in debug mode"
    Write-Host "  .\run_bot.ps1 -Test                # Run test mode"
    Write-Host "  .\run_bot.ps1 -Visits 100          # Run with 100 daily visits"
    Write-Host "  .\run_bot.ps1 -Config custom.yaml  # Use custom config"
    Write-Host "  .\run_bot.ps1 -Install             # Install dependencies"
    Write-Host "  .\run_bot.ps1 -Setup               # Setup virtual environment"
}

# Function to check if Python is installed
function Check-Python {
    try {
        $pythonVersion = & $PythonCmd --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Status "Python version: $pythonVersion"
            return $true
        }
    }
    catch {
        Write-Error "Python is not installed or not in PATH"
        Write-Status "Please install Python 3.8 or higher"
        return $false
    }
    return $false
}

# Function to setup virtual environment
function Setup-Venv {
    Write-Status "Setting up virtual environment..."
    
    if (-not (Test-Path $VenvDir)) {
        & $PythonCmd -m venv $VenvDir
        Write-Status "Virtual environment created at $VenvDir"
    }
    else {
        Write-Warning "Virtual environment already exists"
    }
    
    # Activate virtual environment
    $activateScript = Join-Path $VenvDir "Scripts\Activate.ps1"
    if (Test-Path $activateScript) {
        & $activateScript
        Write-Status "Virtual environment activated"
    }
    
    # Upgrade pip
    & pip install --upgrade pip
    
    Write-Status "Virtual environment setup completed"
}

# Function to install dependencies
function Install-Dependencies {
    Write-Status "Installing dependencies..."
    
    # Check if virtual environment exists
    if (-not (Test-Path $VenvDir)) {
        Write-Warning "Virtual environment not found. Setting up..."
        Setup-Venv
    }
    
    # Activate virtual environment
    $activateScript = Join-Path $VenvDir "Scripts\Activate.ps1"
    if (Test-Path $activateScript) {
        & $activateScript
    }
    
    # Install requirements
    $requirementsFile = Join-Path $ProjectDir "requirements.txt"
    if (Test-Path $requirementsFile) {
        & pip install -r $requirementsFile
        Write-Status "Dependencies installed successfully"
    }
    else {
        Write-Error "requirements.txt not found"
        exit 1
    }
}

# Function to check configuration
function Check-Config {
    if (-not (Test-Path $ConfigFile)) {
        Write-Error "Configuration file not found: $ConfigFile"
        Write-Status "Please create the configuration file first"
        exit 1
    }
    
    # Check if config is valid YAML
    try {
        $null = [System.Management.Automation.PSParser]::Tokenize((Get-Content $ConfigFile -Raw), [ref]$null)
        Write-Status "Configuration file validated"
    }
    catch {
        Write-Error "Invalid YAML configuration file"
        exit 1
    }
}

# Function to create necessary directories
function Create-Directories {
    Write-Status "Creating necessary directories..."
    
    $directories = @($LogDir, (Join-Path $ProjectDir "data"), (Join-Path $ProjectDir "cache"))
    
    foreach ($dir in $directories) {
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
        }
    }
    
    Write-Status "Directories created"
}

# Function to reset logs and cache
function Reset-Data {
    Write-Warning "This will delete all logs and cache data. Continue? (y/N)"
    $response = Read-Host
    if ($response -match "^[yY]") {
        Write-Status "Resetting logs and cache..."
        
        # Remove logs
        if (Test-Path $LogDir) {
            Remove-Item "$LogDir\*" -Recurse -Force
            Write-Status "Logs cleared"
        }
        
        # Remove cache
        $cacheDir = Join-Path $ProjectDir "cache"
        if (Test-Path $cacheDir) {
            Remove-Item "$cacheDir\*" -Recurse -Force
            Write-Status "Cache cleared"
        }
        
        # Remove data
        $dataDir = Join-Path $ProjectDir "data"
        if (Test-Path $dataDir) {
            Remove-Item "$dataDir\*" -Recurse -Force
            Write-Status "Data cleared"
        }
        
        Write-Status "Reset completed"
    }
    else {
        Write-Status "Reset cancelled"
    }
}

# Function to monitor running bot
function Monitor-Bot {
    Write-Status "Monitoring bot activity..."
    
    # Check if bot is running
    $botProcess = Get-Process -Name "python" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*main.py*" }
    if (-not $botProcess) {
        Write-Warning "Bot is not currently running"
        return
    }
    
    Write-Status "Bot is running with PID: $($botProcess.Id)"
    
    # Show recent logs
    if (Test-Path $LogDir) {
        $latestLog = Get-ChildItem "$LogDir\bot_*.log" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
        if ($latestLog) {
            Write-Host ""
            Write-Status "Recent log entries:"
            Write-Host "----------------------------------------"
            Get-Content $latestLog.FullName -Tail 20
            Write-Host "----------------------------------------"
        }
    }
    
    # Show system resources
    Write-Host ""
    Write-Status "System resources:"
    Write-Host "----------------------------------------"
    Get-Process -Id $botProcess.Id | Select-Object Id, ProcessName, CPU, WorkingSet
    Write-Host "----------------------------------------"
}

# Function to run bot
function Run-Bot {
    Write-Status "Starting Multi-Login Bot..."
    
    # Check if virtual environment exists and activate it
    if (Test-Path $VenvDir) {
        $activateScript = Join-Path $VenvDir "Scripts\Activate.ps1"
        if (Test-Path $activateScript) {
            & $activateScript
            Write-Status "Virtual environment activated"
        }
    }
    else {
        Write-Warning "Virtual environment not found. Running with system Python"
    }
    
    # Set environment variables
    $env:PYTHONPATH = "$ProjectDir;$env:PYTHONPATH"
    
    # Build command
    $cmd = "$PythonCmd $MainScript"
    
    # Add debug mode
    if ($DebugMode) {
        $env:PYTHONUNBUFFERED = "1"
        $cmd += " --debug"
        Write-Status "Running in debug mode"
    }
    
    # Add custom config
    if ($ConfigPath) {
        $cmd += " --config $ConfigPath"
        Write-Status "Using custom config: $ConfigPath"
    }
    
    # Add custom visits
    if ($DailyVisits -gt 0) {
        $cmd += " --visits $DailyVisits"
        Write-Status "Custom daily visits: $DailyVisits"
    }
    
    # Add log level
    if ($LogLevelSetting) {
        $env:LOG_LEVEL = $LogLevelSetting
        Write-Status "Log level: $LogLevelSetting"
    }
    
    # Run the bot
    Write-Status "Executing: $cmd"
    Write-Host ""
    
    # Run with error handling
    try {
        Invoke-Expression $cmd
        Write-Status "Bot completed successfully"
    }
    catch {
        Write-Error "Bot failed with error: $_"
        exit 1
    }
}

# Function to run test mode
function Run-Test {
    Write-Status "Running in test mode (single session)..."
    
    # Create temporary test config
    $testConfig = Join-Path $ProjectDir "config\test_config.yaml"
    Copy-Item $ConfigFile $testConfig
    
    # Modify config for test mode
    $configContent = Get-Content $testConfig -Raw
    $configContent = $configContent -replace "daily_visits_min: \d+", "daily_visits_min: 1"
    $configContent = $configContent -replace "daily_visits_max: \d+", "daily_visits_max: 1"
    Set-Content $testConfig $configContent
    
    # Run with test config
    $ConfigPath = $testConfig
    Run-Bot
    
    # Cleanup
    Remove-Item $testConfig -Force
}

# Main script logic
function Main {
    Write-Header
    
    # Process parameters
    if ($Help) {
        Show-Usage
        exit 0
    }
    
    if ($Debug) {
        $DebugMode = $true
    }
    
    if ($Test) {
        $Mode = "test"
    }
    
    if ($Visits -gt 0) {
        $DailyVisits = $Visits
    }
    
    if ($Config) {
        $ConfigPath = $Config
    }
    
    if ($LogLevel) {
        $LogLevelSetting = $LogLevel
    }
    
    if ($Install) {
        if (Check-Python) {
            Setup-Venv
            Install-Dependencies
        }
        exit 0
    }
    
    if ($Setup) {
        if (Check-Python) {
            Setup-Venv
            Install-Dependencies
            Create-Directories
            Write-Status "Setup completed successfully"
        }
        exit 0
    }
    
    if ($Reset) {
        Reset-Data
        exit 0
    }
    
    if ($Monitor) {
        Monitor-Bot
        exit 0
    }
    
    # Pre-run checks
    if (-not (Check-Python)) {
        exit 1
    }
    Check-Config
    Create-Directories
    
    # Run based on mode
    switch ($Mode) {
        "normal" { Run-Bot }
        "test" { Run-Test }
        default {
            Write-Error "Unknown mode: $Mode"
            exit 1
        }
    }
}

# Run main function
Main
