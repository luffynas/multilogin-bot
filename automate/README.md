# Automate Project - Undetectable AdSense Testing

A comprehensive automation system for creating and managing browser profiles with undetectable behavior for AdSense testing, focusing on Tier 1 markets with dynamic proxy rotation and multi-provider support using **SOCKS5 protocol**.

## 🚀 Features

### Core Functionality
- **Dynamic Profile Management**: Create X profiles with configurable count
- **Multi-Provider Proxy Support**: Multilogin built-in (5GB) + SocksEscort fallback
- **SOCKS5 Protocol**: Always use SOCKS5 for enhanced security and performance
- **Automatic Provider Switching**: Based on data limits, health, and performance
- **Multilogin X API Integration**: Full API support with authentication
- **Undetectable Automation**: Human-like behavior simulation
- **Tier 1 Market Targeting**: US and other high-value markets
- **Dynamic Scheduler**: Configurable rotation periods

### Human-like Behavior
- **Realistic Browsing**: Multi-page navigation (2-5 pages per session)
- **Natural Navigation**: Categories, legal pages, previous/next, random pages
- **Reading Simulation**: Based on content length with realistic timing
- **Link Hovering**: Safe interaction without clicking
- **Click Simulation**: Natural click patterns with hover effects
- **Traffic Generation**: Realistic browsing patterns
- **Real Human Behavior**: Attention span variation, reading speed variation
- **Mouse Movement**: Natural mouse acceleration and patterns
- **Keyboard Typing**: Realistic typing patterns

### Realistic Browsing Behavior
- **Multi-Page Sessions**: Visit 2-5 pages per session
- **Natural Navigation**: Categories (40%), legal pages (30%), previous/next (60%)
- **Reading Simulation**: Realistic reading time based on content length
- **Link Hovering**: Safe interaction without clicking
- **Page Dwell Time**: 30-180 seconds per page
- **Navigation Patterns**: Random and unpredictable browsing paths

### Advanced Behavior System
- **🕒 Time-Based Patterns**: Automatic behavior adjustment by time of day
- **🎭 Personality Generation**: Explorer, Researcher, Casual, Professional personas
- **📱 Device-Specific**: Desktop, mobile, tablet behavior simulation
- **🌍 Geographic Patterns**: Country-specific behavior for Tier 1 markets
- **📄 Content Awareness**: Intelligent response to page content type
- **🧠 Session Memory**: Persistent behavior consistency across sessions
- **🎯 Smart Ad Interaction**: Context-aware ad engagement
- **📊 Advanced Analytics**: Comprehensive behavior tracking and analysis

### Referer Simulation
- **🔗 Profile-Level Integration**: Referer set at Multilogin profile level, not Selenium
- **🎭 Personality-Based**: Different referer patterns per personality type
- **🌍 Geographic Awareness**: Country-specific referer sources and domains
- **🔍 Multiple Sources**: Google, social media, other search engines, direct traffic
- **📊 Comprehensive Analytics**: Track referer patterns and statistics
- **🎯 Maximum Undetectability**: No JavaScript injection, browser-level configuration

### Proxy Management
- **Multi-Provider Support**: Multilogin built-in + SocksEscort
- **SOCKS5 Protocol**: Enhanced security and performance
- **Automatic Fallback**: Switch providers when limits reached
- **Health Monitoring**: Automatic health checks and blacklisting
- **Rotation System**: Dynamic proxy rotation based on usage
- **Country Targeting**: Geographic distribution for Tier 1 markets
- **Performance Tracking**: Success/failure rate monitoring

## 📋 Requirements

- Python 3.9+
- Multilogin X account
- SocksEscort account (optional, for fallback)
- Chrome browser

## 🛠️ Installation

1. **Clone the repository**:
```bash
cd automate
```

2. **Install dependencies**:
```bash
pip install -r requirements.txt
```

3. **Configure the system**:
   - Update `config/config.yaml` with your Multilogin credentials
   - Add your SocksEscort credentials (optional)
   - Configure target websites

## 🚀 Quick Start with Examples

### Run Examples Easily
Use the provided script to run examples:

```bash
# Make script executable (first time only)
chmod +x run_examples.sh

# Run quick start example (recommended for beginners)
./run_examples.sh quick-start

# Run comprehensive example (all features)
./run_examples.sh comprehensive

# Run batch automation example
./run_examples.sh batch

# Run all examples sequentially
./run_examples.sh all

# Show recent logs
./run_examples.sh logs

# Show data files
./run_examples.sh data
```

### Manual Example Execution
Or run examples manually:

```bash
# Quick start (beginner friendly)
cd examples
python3 quick_start_example.py

# Comprehensive demonstration
python3 multilogin_login_example.py

# Batch automation
python3 batch_automation_example.py

# Advanced behavior demo
python3 advanced_behavior_demo.py

# Referer simulation demo
python3 referer_simulation_demo.py
```

### Example Features Demonstrated
- 🔐 **Multilogin Authentication**: Login and token management
- 👥 **Profile Management**: Create, start, stop profiles
- 🤖 **Selenium Automation**: Undetectable browser automation
- 🎭 **Realistic Behavior**: Human-like browsing patterns
- 📦 **Batch Processing**: Multiple profiles simultaneously
- 📊 **Analytics**: Comprehensive tracking and monitoring
- 🔗 **Referer Simulation**: Profile-level referer generation

For detailed information about examples, see [examples/README.md](examples/README.md).

## ⚙️ Configuration

### Basic Configuration
Edit `config/config.yaml`:

```yaml
multilogin:
  username: "your_email@example.com"
  password: "your_password"
  
proxy:
  protocol: "socks5"  # Always SOCKS5
  total_count: 2000
  rotation_period_days: 10  # Use all proxies in X days
  
profiles:
  total_count: 100  # Dynamic profile count
  geo_default: "US"  # Tier 1 targeting
```

### Provider Configuration
```yaml
proxy:
  protocol: "socks5"  # Always SOCKS5
  providers:
    # Primary: Multilogin built-in residential proxies (5GB)
    - name: "multilogin_residential"
      priority: 1
      enabled: true
      type: "residential"
      protocol: "socks5"
      data_limit: "5GB"
    
    # Fallback: SocksEscort
    - name: "socksescort"
      priority: 2
      enabled: true
      type: "static"
      protocol: "socks5"
      credentials:
        username: "your_socksescort_username"
        password: "your_socksescort_password"
```

### Realistic Browsing Configuration
```yaml
selenium:
  browsing_behavior:
    enabled: true
    min_pages: 2
    max_pages: 5
    page_dwell_time: [30, 180]  # seconds
    navigation_probabilities:
      category: 0.4
      legal: 0.3
      previous_next: 0.6
      random: 0.1
    
    reading_behavior:
      enabled: true
      chars_per_second: 200
      max_reading_time: 30
      text_selectors:
        - "p"
        - "article"
        - ".content"
        - ".post-content"
    
    link_hovering:
      enabled: true
      max_hovers_per_page: 3
      hover_duration: [0.5, 2.0]
      hover_probability: 0.4
```

## 🚀 Usage

### 1. Create Profiles
```bash
# Create default number of profiles (100) with current provider
python main.py --action create

# Create specific number of profiles
python main.py --action create --profiles 50

# Create profiles with specific provider (SOCKS5)
python main.py --action create --profiles 25 --provider multilogin
python main.py --action create --profiles 25 --provider socksescort
```

### 2. Run Automation
```bash
# Run single session
python main.py --action run

# Run concurrent sessions
python main.py --action run-concurrent

# Show statistics
python main.py --action stats
```

### 3. Provider Management
```bash
# Switch to SocksEscort provider (SOCKS5)
python main.py --action switch-provider --provider socksescort

# Switch back to Multilogin provider (SOCKS5)
python main.py --action switch-provider --provider multilogin

# Clean up old data
python main.py --action cleanup --days 14
```

### 4. Dynamic Configuration
```bash
# Use custom config file
python main.py --config custom_config.yaml --action run

# Set log level
python main.py --log-level DEBUG --action run
```

### 5. Realistic Browsing Examples
```python
from src.selenium_automation import UndetectableSeleniumAutomation

# Basic browsing session
automation = UndetectableSeleniumAutomation()
browsing_session = automation.simulate_realistic_browsing("https://example.com")

print(f"Visited {browsing_session['total_pages']} pages")
print(f"Session duration: {browsing_session['session_duration']:.1f}s")
print(f"Navigation pattern: {browsing_session['navigation_pattern']}")

# AdSense testing with realistic browsing
result = automation.test_adsense_ads("https://example.com")
print(f"Ads detected: {result['ads_detected']}")
print(f"Pages browsed: {result['browsing_session']['total_pages']}")
```

```bash
# Run example demonstration
cd examples
python realistic_browsing_example.py
```

## 🔄 Provider Switching

### Automatic Switching
The system automatically switches providers when:
- **Data Limit Reached**: Multilogin 5GB limit exhausted
- **Health Issues**: Provider health score drops below 0.3
- **Performance Issues**: Success rate drops below 0.7
- **High Failure Rate**: Failures exceed 10

### Manual Switching
```bash
# Switch to SocksEscort (SOCKS5)
./run_automate.sh --action switch-provider --provider socksescort

# Switch back to Multilogin (SOCKS5)
./run_automate.sh --action switch-provider --provider multilogin
```

### Provider Statistics
```bash
python main.py --action stats
```

Shows:
- **Provider Status**: Enabled/disabled, active/inactive
- **Protocol**: Always SOCKS5
- **Data Usage**: Current usage vs limits
- **Success Rates**: Performance metrics
- **Failure Counts**: Error tracking

## 📊 Monitoring

### Statistics Dashboard
```bash
python main.py --action stats
```

Shows:
- Profile statistics (total, idle, active, error)
- Proxy health and availability
- Provider status and performance
- Session logs and performance metrics
- Tier 1 targeting statistics

### Real-time Monitoring
- Proxy health monitoring (automatic)
- Provider performance tracking
- Profile usage tracking
- Session performance metrics
- Error rate monitoring

## 🔧 Advanced Features

### Provider Management
```python
from src.profile_manager import ProfileManager

profile_manager = ProfileManager()
proxy_manager = profile_manager.proxy_manager

# Switch providers (SOCKS5)
proxy_manager.switch_to_socksescort()
proxy_manager.switch_to_multilogin()

# Get provider statistics
stats = proxy_manager.get_provider_stats()
print(f"Current provider: {stats['current_provider']}")
```

### Profile Optimization
```python
from src.profile_manager import ProfileManager

profile_manager = ProfileManager()
tier1_profiles = profile_manager.get_tier1_profiles()
optimized = profile_manager.optimize_for_tier1()

# Switch all profiles to new provider (SOCKS5)
switched = profile_manager.switch_provider_for_all_profiles("socksescort")
```

### Human-like Behavior
The system includes advanced human simulation:
- **Mouse Movement**: Natural acceleration and patterns
- **Click Behavior**: Hover effects and timing variations
- **Scrolling**: Natural scroll patterns with pauses
- **Typing**: Realistic typing speed and patterns
- **Attention Span**: Variable reading times and focus

## 🎯 Tier 1 Market Targeting

### Supported Countries
- **US**: Primary target with multiple timezones
- **CA**: Canada with major cities
- **GB**: United Kingdom
- **AU**: Australia
- **DE**: Germany
- **FR**: France
- **NL**: Netherlands

### Fingerprint Optimization
- Country-specific timezones
- Local language settings
- Geographic coordinates
- ISP and network profiles

## 📈 Performance Optimization

### Concurrent Execution
- Up to 20 concurrent sessions
- Load balancing across profiles
- Resource monitoring and auto-scaling

### Proxy Rotation
- Dynamic rotation based on health
- Usage-based distribution
- Geographic load balancing
- Provider-based distribution

### Error Handling
- Automatic retry mechanisms
- Graceful degradation
- Error recovery and cleanup
- Provider fallback

## 🔒 Security & Undetectability

### Anti-Detection Measures
- WebDriver protection
- Canvas fingerprint randomization
- WebRTC protection
- Battery API spoofing
- Performance timing randomization

### Human-like Patterns
- Random delays and variations
- Natural browsing patterns
- Realistic user behavior simulation
- Attention span variation

### SOCKS5 Protocol Benefits
- **Enhanced Security**: Authentication and encryption support
- **Better Performance**: Lower latency and higher reliability
- **Protocol Support**: TCP, UDP, and various protocols
- **No Protocol Leakage**: Doesn't reveal proxy usage

## 📝 Logging

### Log Levels
- **DEBUG**: Detailed debugging information
- **INFO**: General operational information
- **WARNING**: Warning messages
- **ERROR**: Error messages

### Log Files
- `logs/automate.log`: Main application log
- `data/session_logs.json`: Session performance data
- `data/proxy_health.json`: Proxy health monitoring
- `data/provider_status.json`: Provider status tracking

## 🧪 Testing

### Run Tests
```bash
pytest tests/
```

### Test Coverage
- API integration tests
- Proxy management tests
- Provider switching tests
- Human behavior simulation tests
- Performance monitoring tests

## 📁 Project Structure

```
automate/
├── config/
│   └── config.yaml          # Main configuration
├── src/
│   ├── multilogin_api.py    # Multilogin X API client
│   ├── fingerprint_generator.py  # Fingerprint generation
│   ├── profile_manager.py   # Profile management
│   ├── proxy_manager.py     # Multi-provider SOCKS5 proxy management
│   ├── selenium_automation.py  # Selenium automation
│   └── scheduler.py         # Automation scheduler
├── data/                    # Data storage
├── logs/                    # Log files
├── tests/                   # Test files
├── docs/                    # Documentation
│   └── PROVIDER_SWITCHING.md # Provider switching guide (SOCKS5)
├── main.py                  # Main entry point
├── run_automate.sh          # Runner script
├── requirements.txt         # Dependencies
└── README.md               # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is for educational and testing purposes only. Please ensure compliance with all applicable laws and terms of service.

## 🆘 Support

For issues and questions:
1. Check the logs in `logs/automate.log`
2. Review the configuration in `config/config.yaml`
3. Run with `--log-level DEBUG` for detailed information
4. Check provider status and proxy health
5. Review provider switching documentation

## 🔄 Updates

### Version History
- **v1.0.0**: Initial release with basic functionality
- **v1.1.0**: Added Tier 1 targeting and enhanced human behavior
- **v1.2.0**: Improved proxy management and health monitoring
- **v1.3.0**: Added multi-provider support with automatic switching
- **v1.4.0**: Enhanced with SOCKS5 protocol support

### Future Enhancements
- Machine learning-based behavior optimization
- Advanced fingerprint generation
- Additional proxy providers
- Real-time analytics dashboard
- Advanced provider load balancing
