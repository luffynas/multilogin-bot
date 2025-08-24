# Provider Switching Guide (SOCKS5)

## Overview

The Automate Project supports multiple proxy providers with automatic and manual switching capabilities, **always using SOCKS5 protocol**:

- **Multilogin Built-in Residential Proxies** (Primary): 5GB data limit, SOCKS5
- **SocksEscort** (Fallback): External proxy service, SOCKS5

## Provider Configuration

### Multilogin Built-in Proxies
- **Type**: Residential proxies
- **Protocol**: SOCKS5 (always)
- **Data Limit**: 5GB per month
- **Authentication**: Automatic (no external credentials needed)
- **Priority**: 1 (Primary)
- **Auto-use**: Enabled

### SocksEscort
- **Type**: Static proxies
- **Protocol**: SOCKS5 (always)
- **Data Limit**: Unlimited (based on your plan)
- **Authentication**: Requires username/password
- **Priority**: 2 (Fallback)
- **Auto-use**: Disabled (manual activation)

## Automatic Provider Switching

The system automatically switches providers based on:

1. **Data Limit Reached**: When Multilogin 5GB limit is exhausted
2. **Health Score**: When provider health drops below 0.3
3. **Success Rate**: When success rate drops below 0.7
4. **Failure Count**: When failures exceed 10

## Manual Provider Switching

### Using Command Line

#### Switch to SocksEscort (SOCKS5)
```bash
# Using Python directly
python main.py --action switch-provider --provider socksescort

# Using shell script
./run_automate.sh --action switch-provider --provider socksescort
```

#### Switch back to Multilogin (SOCKS5)
```bash
# Using Python directly
python main.py --action switch-provider --provider multilogin

# Using shell script
./run_automate.sh --action switch-provider --provider multilogin
```

### Using Python API

```python
from src.profile_manager import ProfileManager

# Initialize profile manager
profile_manager = ProfileManager()

# Switch to SocksEscort (SOCKS5)
proxy_manager = profile_manager.proxy_manager
proxy_manager.switch_to_socksescort()

# Switch back to Multilogin (SOCKS5)
proxy_manager.switch_to_multilogin()

# Switch all profiles to new provider
switched_count = profile_manager.switch_provider_for_all_profiles("socksescort")
print(f"Switched {switched_count} profiles")
```

## Creating Profiles with Specific Provider

### Create profiles with Multilogin provider (SOCKS5)
```bash
# Create 50 profiles using Multilogin built-in SOCKS5 proxies
python main.py --action create --profiles 50 --provider multilogin

# Using shell script
./run_automate.sh --action create --profiles 50 --provider multilogin
```

### Create profiles with SocksEscort provider (SOCKS5)
```bash
# Create 25 profiles using SocksEscort SOCKS5 proxies
python main.py --action create --profiles 25 --provider socksescort

# Using shell script
./run_automate.sh --action create --profiles 25 --provider socksescort
```

## Monitoring Provider Status

### View Provider Statistics
```bash
python main.py --action stats
```

This shows:
- **Provider Status**: Enabled/disabled, active/inactive
- **Protocol**: Always SOCKS5
- **Data Usage**: Current usage vs limits
- **Success Rates**: Performance metrics
- **Failure Counts**: Error tracking
- **Last Used**: Recent activity

### Example Output
```
==================================================
PROVIDER STATISTICS
==================================================

MULTILOGIN_RESIDENTIAL:
  Enabled: True
  Active: True
  Priority: 1
  Protocol: SOCKS5
  Data Limit: 5GB
  Data Used: 2048.50 MB
  Data Remaining: 3071.50 MB
  Success Rate: 0.95
  Failure Count: 2
  Last Used: 2024-01-15T10:30:00

SOCKSESCORT:
  Enabled: True
  Active: False
  Priority: 2
  Protocol: SOCKS5
  Data Limit: None
  Data Used: 0.00 MB
  Data Remaining: None
  Success Rate: 1.00
  Failure Count: 0
  Last Used: None
```

## Configuration

### Update SocksEscort Credentials
Edit `config/config.yaml`:

```yaml
proxy:
  protocol: "socks5"  # Always SOCKS5
  providers:
    - name: "socksescort"
      priority: 2
      enabled: true
      type: "static"
      source: "socksescort"
      protocol: "socks5"  # Always SOCKS5
      credentials:
        username: "your_socksescort_username"
        password: "your_socksescort_password"
      settings:
        auto_use: false
        fallback_enabled: true
        api_endpoint: "https://socksescort.com/api"
```

### Provider Switching Conditions
```yaml
provider_switching:
  enabled: true
  auto_fallback: true
  manual_switch: true
  switch_conditions:
    data_limit_reached: true
    health_score_below: 0.3
    success_rate_below: 0.7
    max_failures: 10
```

## SOCKS5 Protocol Benefits

### Security
- **Encryption**: SOCKS5 supports authentication and encryption
- **Protocol Support**: Supports TCP, UDP, and various protocols
- **No Protocol Leakage**: Doesn't reveal proxy usage to websites

### Performance
- **Faster**: More efficient than HTTP proxies
- **Lower Latency**: Direct connection establishment
- **Better Reliability**: More stable connections

### Compatibility
- **Universal Support**: Works with all modern browsers and applications
- **Multilogin Integration**: Native SOCKS5 support in Multilogin
- **SocksEscort Support**: Full SOCKS5 protocol support

## Best Practices

### 1. Monitor Data Usage
- Check Multilogin data usage regularly
- Switch to SocksEscort before hitting 5GB limit
- Monitor success rates and health scores

### 2. Gradual Migration
- Don't switch all profiles at once
- Test with a few profiles first
- Monitor performance after switching

### 3. Backup Strategy
- Keep SocksEscort credentials ready
- Have fallback proxy lists prepared
- Test provider switching in advance

### 4. Performance Optimization
- Use Multilogin for high-value sessions
- Use SocksEscort for testing and backup
- Balance load between providers

### 5. SOCKS5 Configuration
- Ensure all proxies use SOCKS5 protocol
- Verify SOCKS5 authentication works
- Test SOCKS5 health checks

## Troubleshooting

### Provider Not Switching
1. Check if provider is enabled in config
2. Verify credentials are correct
3. Check network connectivity
4. Review logs for error messages
5. Ensure SOCKS5 protocol is supported

### Profile Creation Fails
1. Verify provider credentials
2. Check proxy availability
3. Ensure API endpoints are accessible
4. Review rate limiting settings
5. Verify SOCKS5 configuration

### Performance Issues
1. Monitor provider health scores
2. Check success rates
3. Review failure counts
4. Consider switching providers
5. Verify SOCKS5 performance

### SOCKS5 Connection Issues
1. Check SOCKS5 port accessibility
2. Verify SOCKS5 authentication
3. Test SOCKS5 health checks
4. Review SOCKS5 configuration
5. Check firewall settings

## API Reference

### ProxyManager Methods

```python
# Switch providers (SOCKS5)
proxy_manager.switch_to_socksescort()
proxy_manager.switch_to_multilogin()

# Get provider statistics
stats = proxy_manager.get_provider_stats()

# Check provider viability
is_viable = proxy_manager._is_provider_viable("multilogin_residential")

# Add SOCKS5 proxy
proxy_id = proxy_manager.add_proxy(
    host="proxy.example.com",
    port=1080,  # SOCKS5 default port
    username="user",
    password="pass",
    provider="socksescort"
)
```

### ProfileManager Methods

```python
# Switch all profiles to new provider (SOCKS5)
switched = profile_manager.switch_provider_for_all_profiles("socksescort")

# Create profiles with specific provider (SOCKS5)
profiles = profile_manager.create_profiles(10, "socksescort")

# Get provider statistics
provider_stats = profile_manager.get_provider_stats()
```

## Logging

Provider switching events are logged with detailed information:

```
[INFO] Switched provider: multilogin_residential -> socksescort (SOCKS5)
[INFO] Manually switched to SocksEscort SOCKS5 provider
[INFO] Switched 25 profiles to socksescort provider
[WARNING] Provider multilogin_residential data limit reached
[WARNING] Provider socksescort success rate too low: 0.65
[INFO] Started SOCKS5 proxy health monitoring
[INFO] Added new SOCKS5 proxy: 192.168.1.1:1080 (socksescort, US)
```

Check logs in `logs/automate.log` for detailed provider switching information.
