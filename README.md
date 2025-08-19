# Multi-Login Bot - Undetectable Traffic Simulator

A sophisticated bot system that simulates realistic human traffic using Multilogin and SOCKS5 proxies with advanced referer simulation and fingerprint consistency.

## 🎯 **Features**

- **Undetectable Traffic Simulation**: Advanced fingerprint management and human behavior simulation
- **AdSense Testing Mode**: Specialized configuration for safe AdSense testing with compliance monitoring
- **Referer Simulation**: Realistic traffic sources (Google, Facebook, Twitter, etc.)
- **SOCKS5 Proxy Support**: Full integration with Oxylabs and other proxy providers
- **Multilogin Integration**: Complete API integration for browser profile management
- **Human Behavior Engine**: Realistic scrolling, clicking, and reading patterns
- **Fingerprint Consistency**: Geo-consistent fingerprints per proxy
- **Daily Automation**: Random visit counts (20-50 per day for AdSense testing) with intelligent scheduling
- **Safety Monitoring**: Real-time detection of suspicious patterns and compliance violations

## 📋 **Requirements**

- Python 3.8+
- Multilogin (installed and running)
- SOCKS5 Proxy provider (Oxylabs recommended)
- Target website for testing

## 🚀 **Installation**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd multi-login-bot
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure the bot**
   ```bash
   # Edit config/config.yaml with your settings
   nano config/config.yaml
   ```

## ⚙️ **Configuration**

Edit `config/config.yaml` with your settings:

```yaml
multilogin:
  api_key: "YOUR_MULTILOGIN_API_KEY"
  base_url: "http://localhost:35000"

proxy:
  provider: "oxylabs"
  type: "socks5"
  total_count: 10000

target_website:
  url: "https://your-target-website.com"

behavior:
  daily_visits_min: 20    # Conservative for AdSense testing
  daily_visits_max: 50    # Conservative for AdSense testing
```

## 🔧 **Setup Steps**

### 1. Multilogin Setup
1. Install Multilogin on your system
2. Get your API key from Multilogin
3. Ensure Multilogin is running on port 35000

### 2. Proxy Setup
1. Purchase SOCKS5 proxies from Oxylabs
2. Update proxy configuration in `config/config.yaml`
3. Test proxy connectivity

### 3. Target Website
1. Set your target website URL in configuration
2. Ensure the website has article navigation (next/previous)

## 🎯 **Usage**

### Quick Start (Recommended)
```bash
# Make scripts executable
chmod +x make_executable.sh
./make_executable.sh

# Setup environment
./run_bot.sh --setup

# Run bot
./run_bot.sh
```

### Basic Usage
```bash
# Run normally
./run_bot.sh

# Run in debug mode
./run_bot.sh --debug

# Run test mode (single session)
./run_bot.sh --test

# Run with custom visits
./run_bot.sh --visits 100
```

### Advanced Usage
```bash
# Install dependencies only
./run_bot.sh --install

# Setup virtual environment
./run_bot.sh --setup

# Monitor running bot
./run_bot.sh --monitor

# Reset logs and cache
./run_bot.sh --reset
```

### Automation Setup
```bash
# Setup cron jobs for daily automation
./scripts/setup_cron.sh --recommended

# Show current cron jobs
./scripts/setup_cron.sh --show

# Setup custom cron schedule
./scripts/setup_cron.sh --custom
```

### Python Direct Usage
```python
from src.main import MultiLoginBotOrchestrator

# Initialize bot
orchestrator = MultiLoginBotOrchestrator()

# Run daily visits
orchestrator.run_daily_visits()

# Generate report
orchestrator.generate_daily_report()
```

### Windows Users
```powershell
# Run with PowerShell
.\run_bot.ps1

# Setup environment
.\run_bot.ps1 -Setup

# Run in debug mode
.\run_bot.ps1 -Debug
```

## 📊 **How It Works**

### 1. Daily Visit Generation
- Randomly generates 20-50 visits per day (AdSense testing mode)
- Ensures natural traffic patterns with conservative limits

### 2. Proxy Rotation
- Uses 10,000 SOCKS5 proxies
- Each proxy used only once per day
- Maintains fingerprint consistency

### 3. Referer Simulation
- 45% Google search traffic
- 35% Social media traffic
- 15% Direct traffic
- 5% Other sources

### 4. Human Behavior Simulation
- 4-7 minutes reading per article
- Realistic scrolling patterns
- Random interactions (hover, click, highlight)
- Navigation between articles

### 5. Fingerprint Management
- Geo-consistent fingerprints per proxy
- Advanced stealth scripts
- Canvas fingerprint randomization
- WebRTC protection

## 🎯 **AdSense Testing Mode**

### Specialized Configuration for AdSense Testing
The bot includes a specialized AdSense testing mode with enhanced safety features and compliance monitoring.

### AdSense Testing Features
- **Conservative Traffic Limits**: 20-50 visits per day (vs 50-150 normal)
- **Safety Monitoring**: Real-time detection of suspicious patterns
- **Compliance Validation**: Ensures AdSense policy compliance
- **Revenue Limits**: Maximum $0.01 per day for testing
- **CTR Monitoring**: Keeps CTR under 1% for natural appearance
- **Session Spacing**: 5-10 minutes between sessions for natural timing

### AdSense Testing Usage

#### Quick Start for AdSense Testing
```bash
# Setup AdSense testing environment
./run_adsense_test.sh setup

# Run quick AdSense test (5 visits)
./run_adsense_test.sh quick

# Run full AdSense test (20 visits)
./run_adsense_test.sh full

# Run custom AdSense test
./run_adsense_test.sh custom

# Show latest AdSense test results
./run_adsense_test.sh results
```

#### Windows PowerShell
```powershell
# Setup AdSense testing environment
.\run_adsense_test.ps1 setup

# Run quick AdSense test
.\run_adsense_test.ps1 quick

# Run full AdSense test
.\run_adsense_test.ps1 full

# Show results
.\run_adsense_test.ps1 results
```

### AdSense Safety Features
- **Daily Session Limits**: Maximum 50 sessions per day
- **Hourly Limits**: Maximum 10 sessions per hour
- **Session Duration**: Minimum 3 minutes per session
- **Interaction Limits**: Conservative click and scroll patterns
- **Pattern Detection**: Identifies robotic behavior patterns
- **Warning System**: Alerts on suspicious activities

### AdSense Compliance Monitoring
- **Real-time Validation**: Checks each session for compliance
- **Metrics Tracking**: Monitors CTR, revenue, and session patterns
- **Report Generation**: Detailed AdSense testing reports
- **Safety Recommendations**: Provides actionable safety tips
- **Warning Alerts**: Notifies of potential policy violations

## 📈 **Expected Results**

### Daily Traffic (AdSense Testing Mode)
- **Visits**: 20-50 per day (conservative for testing)
- **Page Views**: 60-150 per day (3 pages per visit)
- **Session Duration**: 12-20 minutes per session
- **Bounce Rate**: <30%
- **CTR**: <1% (conservative for testing)
- **Revenue**: <$0.01 per day (testing limit)

### Monthly Traffic (30 days)
- **Total Visits**: 1,500-4,500
- **Total Page Views**: 4,500-13,500
- **Proxy Usage**: 1,000 unique proxies

## 🔍 **Monitoring & Logs**

### Log Files
- `logs/bot_YYYYMMDD.log` - Daily bot activity
- `logs/daily_report_YYYYMMDD.json` - Daily performance report

### Key Metrics
- Session success rate
- Page view count
- Average session duration
- Fingerprint consistency score
- Referer distribution

## 🛡️ **Anti-Detection Features**

### Fingerprint Protection
- Canvas fingerprint randomization
- WebRTC leak prevention
- Automation flag removal
- Consistent geo-location matching

### Behavior Protection
- Realistic mouse movements
- Natural reading patterns
- Random interaction timing
- Human-like scrolling

### Traffic Protection
- Realistic referer simulation
- Natural visit distribution
- Proxy rotation
- Session isolation

## ⚠️ **Important Notes**

1. **Proxy Quality**: Use high-quality residential proxies for best results
2. **Target Website**: Ensure your target website can handle the traffic
3. **Multilogin Limits**: Respect Multilogin Solo plan limits (100 concurrent profiles)
4. **Legal Compliance**: Ensure compliance with target website terms of service

## 🔧 **Troubleshooting**

### Common Issues

1. **Multilogin Connection Error**
   - Ensure Multilogin is running
   - Check API key validity
   - Verify port 35000 is accessible

2. **Proxy Connection Error**
   - Verify proxy credentials
   - Check proxy provider status
   - Test proxy connectivity manually

3. **Session Creation Failed**
   - Check Multilogin profile limits
   - Verify fingerprint configuration
   - Review error logs

### Debug Mode
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 📝 **Customization**

### Adding New Referer Sources
Edit `src/core/referer_simulator.py`:
```python
self.social_media_patterns["new_platform"] = [
    "https://newplatform.com/",
    "https://newplatform.com/search?q={query}"
]
```

### Custom Behavior Patterns
Edit `src/bots/human_simulator.py`:
```python
def custom_interaction(self, multilogin_manager, profile_id):
    # Add your custom interaction logic
    pass
```

### Proxy Provider Integration
Edit `src/main.py`:
```python
def generate_proxy_config(self, proxy_id: int) -> Dict:
    # Add your proxy provider integration
    pass
```

## 📞 **Support**

For issues and questions:
1. Check the logs in `logs/` directory
2. Review configuration settings
3. Test individual components
4. Check Multilogin and proxy provider status

## 📄 **License**

This project is for educational and testing purposes only. Ensure compliance with all applicable laws and terms of service.

## 🔄 **Updates**

- **v1.0.0**: Initial release with basic functionality
- **v1.1.0**: Added advanced referer simulation
- **v1.2.0**: Enhanced fingerprint consistency
- **v1.3.0**: Improved human behavior simulation

---

**⚠️ Disclaimer**: This tool is designed for legitimate testing purposes. Users are responsible for ensuring compliance with all applicable laws and website terms of service.
