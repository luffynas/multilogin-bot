# AdSense Testing Script for Multi-Login Bot (Windows)
# Enhanced safety features and monitoring for AdSense compliance

param(
    [Parameter(Position=0)]
    [ValidateSet("quick", "full", "custom", "setup", "results", "help")]
    [string]$Action = "help"
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"
$White = "White"

# Variables
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectDir = Split-Path -Parent $ScriptDir
$VenvDir = Join-Path $ProjectDir "venv"
$ConfigFile = Join-Path $ProjectDir "config\config.yaml"
$LogDir = Join-Path $ProjectDir "logs"

# Print functions
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Red
}

function Write-Header {
    Write-Host "================================" -ForegroundColor $Blue
    Write-Host "  AD SENSE TESTING MODE" -ForegroundColor $Blue
    Write-Host "================================" -ForegroundColor $Blue
}

# Function to check if virtual environment exists
function Test-Venv {
    if (-not (Test-Path $VenvDir)) {
        Write-Warning "Virtual environment not found. Creating..."
        python -m venv $VenvDir
        Write-Success "Virtual environment created"
    }
}

# Function to activate virtual environment
function Start-Venv {
    $ActivateScript = Join-Path $VenvDir "Scripts\Activate.ps1"
    if (Test-Path $ActivateScript) {
        & $ActivateScript
        Write-Info "Virtual environment activated"
    } else {
        Write-Error "Virtual environment activation script not found"
        exit 1
    }
}

# Function to install dependencies
function Install-Dependencies {
    Write-Info "Installing dependencies..."
    python -m pip install --upgrade pip
    python -m pip install -r (Join-Path $ProjectDir "requirements.txt")
    Write-Success "Dependencies installed"
}

# Function to validate AdSense configuration
function Test-AdsenseConfig {
    Write-Info "Validating AdSense configuration..."
    
    if (-not (Test-Path $ConfigFile)) {
        Write-Error "Configuration file not found: $ConfigFile"
        exit 1
    }
    
    # Check if AdSense testing is enabled
    $ConfigContent = Get-Content $ConfigFile -Raw
    if ($ConfigContent -notmatch "adsense_testing:") {
        Write-Error "AdSense testing configuration not found in config.yaml"
        exit 1
    }
    
    # Check if target website is configured
    if ($ConfigContent -notmatch "url:") {
        Write-Error "Target website URL not configured"
        exit 1
    }
    
    Write-Success "AdSense configuration validated"
}

# Function to run AdSense safety check
function Test-SafetyCheck {
    Write-Info "Running AdSense safety check..."
    
    # Check if logs directory exists
    if (-not (Test-Path $LogDir)) {
        New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
        Write-Info "Created logs directory"
    }
    
    # Check for previous AdSense reports
    $Reports = Get-ChildItem -Path $LogDir -Filter "adsense_report_*.json" -ErrorAction SilentlyContinue
    if ($Reports) {
        Write-Warning "Previous AdSense reports found. Reviewing..."
        $LatestReport = $Reports | Sort-Object LastWriteTime -Descending | Select-Object -First 1
        Write-Info "Latest report: $($LatestReport.Name)"
        
        # Check for warnings in latest report
        $ReportContent = Get-Content $LatestReport.FullName -Raw
        if ($ReportContent -match "warnings") {
            Write-Warning "Warnings found in latest report. Please review before continuing."
            $Continue = Read-Host "Continue anyway? (y/N)"
            if ($Continue -notmatch "^[Yy]$") {
                Write-Info "Aborted by user"
                exit 0
            }
        }
    }
    
    Write-Success "Safety check completed"
}

# Function to run AdSense test with specific settings
function Start-AdsenseTest {
    param(
        [int]$Visits,
        [string]$StealthLevel = "expert"
    )
    
    Write-Header
    Write-Info "Starting AdSense test with $Visits visits (stealth: $StealthLevel)"
    
    # Validate configuration
    Test-AdsenseConfig
    
    # Run safety check
    Test-SafetyCheck
    
    # Activate virtual environment
    Start-Venv
    
    # Run the bot with AdSense testing mode
    Set-Location $ProjectDir
    
    Write-Info "Running Multi-Login Bot in AdSense testing mode..."
    python -m src.main --adsense-test --visits $Visits --stealth $StealthLevel
    
    Write-Success "AdSense test completed"
    
    # Show results
    Show-AdsenseResults
}

# Function to show AdSense test results
function Show-AdsenseResults {
    Write-Info "AdSense Test Results:"
    Write-Host ""
    
    # Find latest AdSense report
    $Reports = Get-ChildItem -Path $LogDir -Filter "adsense_report_*.json" -ErrorAction SilentlyContinue
    if ($Reports) {
        $LatestReport = $Reports | Sort-Object LastWriteTime -Descending | Select-Object -First 1
        
        Write-Host "📊 Latest AdSense Report: $($LatestReport.Name)" -ForegroundColor $Blue
        Write-Host ""
        
        # Extract key metrics
        try {
            $ReportData = Get-Content $LatestReport.FullName | ConvertFrom-Json
            
            Write-Host "📈 Key Metrics:" -ForegroundColor $Green
            Write-Host "Sessions: $($ReportData.metrics.total_sessions)"
            Write-Host "Pageviews: $($ReportData.metrics.total_pageviews)"
            Write-Host "CTR: $([math]::Round($ReportData.metrics.ctr * 100, 2))%"
            Write-Host "Estimated Revenue: `$$($ReportData.metrics.estimated_revenue)"
            Write-Host ""
            
            if ($ReportData.warnings) {
                Write-Host "⚠️  Warnings:" -ForegroundColor $Yellow
                $ReportData.warnings | ForEach-Object { Write-Host "  - $_" }
                Write-Host ""
            }
            
            if ($ReportData.recommendations) {
                Write-Host "💡 Recommendations:" -ForegroundColor $Green
                $ReportData.recommendations | ForEach-Object { Write-Host "  - $_" }
                Write-Host ""
            }
        } catch {
            Write-Warning "Error parsing report. Report saved to: $($LatestReport.FullName)"
        }
    } else {
        Write-Warning "No AdSense reports found"
    }
}

# Function to run quick test
function Start-QuickTest {
    Write-Info "Running quick AdSense test (5 visits)..."
    Start-AdsenseTest -Visits 5 -StealthLevel "expert"
}

# Function to run full test
function Start-FullTest {
    Write-Info "Running full AdSense test (20 visits)..."
    Start-AdsenseTest -Visits 20 -StealthLevel "expert"
}

# Function to run custom test
function Start-CustomTest {
    $Visits = Read-Host "Enter number of visits (1-50)"
    $StealthLevel = Read-Host "Enter stealth level (basic/advanced/expert) [expert]"
    if (-not $StealthLevel) { $StealthLevel = "expert" }
    
    if ($Visits -notmatch "^\d+$" -or [int]$Visits -lt 1 -or [int]$Visits -gt 50) {
        Write-Error "Invalid number of visits. Must be between 1 and 50."
        exit 1
    }
    
    if ($StealthLevel -notmatch "^(basic|advanced|expert)$") {
        Write-Error "Invalid stealth level. Must be basic, advanced, or expert."
        exit 1
    }
    
    Start-AdsenseTest -Visits ([int]$Visits) -StealthLevel $StealthLevel
}

# Function to show usage
function Show-Usage {
    Write-Host "Usage: $($MyInvocation.MyCommand.Name) [OPTION]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  quick     Run quick AdSense test (5 visits)"
    Write-Host "  full      Run full AdSense test (20 visits)"
    Write-Host "  custom    Run custom AdSense test"
    Write-Host "  setup     Setup environment for AdSense testing"
    Write-Host "  results   Show latest AdSense test results"
    Write-Host "  help      Show this help message"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  $($MyInvocation.MyCommand.Name) quick          # Run quick test"
    Write-Host "  $($MyInvocation.MyCommand.Name) full           # Run full test"
    Write-Host "  $($MyInvocation.MyCommand.Name) custom         # Run custom test"
    Write-Host "  $($MyInvocation.MyCommand.Name) setup          # Setup environment"
    Write-Host "  $($MyInvocation.MyCommand.Name) results        # Show results"
}

# Function to setup environment
function Start-Setup {
    Write-Header
    Write-Info "Setting up environment for AdSense testing..."
    
    # Check virtual environment
    Test-Venv
    
    # Activate virtual environment
    Start-Venv
    
    # Install dependencies
    Install-Dependencies
    
    # Create logs directory
    if (-not (Test-Path $LogDir)) {
        New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
    }
    
    # Validate configuration
    Test-AdsenseConfig
    
    Write-Success "Environment setup completed"
    Write-Info "You can now run AdSense tests with:"
    Write-Host "  $($MyInvocation.MyCommand.Name) quick    # Quick test"
    Write-Host "  $($MyInvocation.MyCommand.Name) full     # Full test"
    Write-Host "  $($MyInvocation.MyCommand.Name) custom   # Custom test"
}

# Function to show results
function Show-Results {
    Write-Header
    Show-AdsenseResults
}

# Main script logic
switch ($Action) {
    "quick" {
        Start-QuickTest
    }
    "full" {
        Start-FullTest
    }
    "custom" {
        Start-CustomTest
    }
    "setup" {
        Start-Setup
    }
    "results" {
        Show-Results
    }
    "help" {
        Show-Usage
    }
    default {
        Write-Error "Unknown option: $Action"
        Show-Usage
        exit 1
    }
}
