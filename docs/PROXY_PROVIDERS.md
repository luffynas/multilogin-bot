# Proxy Provider Configuration Guide

## Supported Proxy Providers

This project supports multiple proxy providers with unified configuration. Each provider has specific features and capabilities.

### 1. SocksEscort (https://socksescort.com/)

**Features:**
- Residential and datacenter proxies
- SOCKS5, HTTP, HTTPS protocols
- Global locations
- High-speed connections

**Configuration:**
```yaml
proxy:
  provider: "socksescort"
  type: "socks5"
  username: "your_socksescort_username"
  password: "your_socksescort_password"
```

**API Endpoint:** `https://api.socksescort.com/proxies`

### 2. Oxylabs

**Features:**
- Residential, datacenter, mobile, ISP proxies
- HTTP, HTTPS, SOCKS5 protocols
- Advanced geo-targeting
- High success rates

**Configuration:**
```yaml
proxy:
  provider: "oxylabs"
  type: "socks5"
  username: "your_oxylabs_username"
  password: "your_oxylabs_password"
```

**API Endpoint:** `https://proxy.oxylabs.io/proxies`

### 3. Bright Data

**Features:**
- Residential, datacenter, mobile, ISP proxies
- HTTP, HTTPS, SOCKS5 protocols
- Advanced targeting options
- High performance

**Configuration:**
```yaml
proxy:
  provider: "brightdata"
  type: "socks5"
  username: "your_brightdata_username"
  password: "your_brightdata_password"
```

**API Endpoint:** `https://brd.superproxy.io/proxies`

### 4. NodeMaven

**Features:**
- Residential and datacenter proxies
- HTTP, HTTPS, SOCKS5 protocols
- Global coverage
- Competitive pricing

**Configuration:**
```yaml
proxy:
  provider: "nodemaven"
  type: "socks5"
  username: "your_nodemaven_username"
  password: "your_nodemaven_password"
```

**API Endpoint:** `https://api.nodemaven.com/proxies`

### 5. Decodo

**Features:**
- Residential and datacenter proxies
- HTTP, HTTPS, SOCKS5 protocols
- Multiple locations
- Reliable performance

**Configuration:**
```yaml
proxy:
  provider: "decodo"
  type: "socks5"
  username: "your_decodo_username"
  password: "your_decodo_password"
```

**API Endpoint:** `https://api.decodo.com/proxies`

### 6. ProxyEmpire

**Features:**
- Residential and datacenter proxies
- HTTP, HTTPS, SOCKS5 protocols
- Global network
- High availability

**Configuration:**
```yaml
proxy:
  provider: "proxyempire"
  type: "socks5"
  username: "your_proxyempire_username"
  password: "your_proxyempire_password"
```

**API Endpoint:** `https://api.proxyempire.io/proxies`

### 7. NetNut

**Features:**
- ISP and residential proxies
- HTTP, HTTPS protocols
- Direct ISP connections
- High performance

**Configuration:**
```yaml
proxy:
  provider: "netnut"
  type: "http"
  username: "your_netnut_username"
  password: "your_netnut_password"
```

**API Endpoint:** `https://api.netnut.io/proxies`

### 8. SOAX

**Features:**
- Residential, datacenter, mobile proxies
- HTTP, HTTPS, SOCKS5 protocols
- Advanced targeting
- High success rates

**Configuration:**
```yaml
proxy:
  provider: "soax"
  type: "socks5"
  username: "your_soax_username"
  password: "your_soax_password"
```

**API Endpoint:** `https://api.soax.com/proxies`

### 9. IPRoyal

**Features:**
- Residential and datacenter proxies
- HTTP, HTTPS, SOCKS5 protocols
- Global coverage
- Competitive pricing

**Configuration:**
```yaml
proxy:
  provider: "iproyal"
  type: "socks5"
  username: "your_iproyal_username"
  password: "your_iproyal_password"
```

**API Endpoint:** `https://api.iproyal.com/proxies`

## Configuration Parameters

### Common Parameters

```yaml
proxy:
  provider: "socksescort"  # Choose your provider
  type: "socks5"          # Protocol type
  total_count: 100        # Number of proxies to use
  daily_limit_per_proxy: 1  # Daily usage limit per proxy
  health_check_interval: 180  # Health check interval (seconds)
  success_rate_min: 0.9   # Minimum success rate (0-1)
  response_time_max: 5.0  # Maximum response time (seconds)
  username: "your_username"
  password: "your_password"
```

### Provider-Specific Features

| Provider | Residential | Datacenter | Mobile | ISP | HTTP | HTTPS | SOCKS5 |
|----------|-------------|------------|--------|-----|------|-------|--------|
| SocksEscort | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Oxylabs | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Bright Data | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| NodeMaven | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Decodo | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ |
| ProxyEmpire | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ |
| NetNut | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ |
| SOAX | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| IPRoyal | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ |

## Setup Instructions

### 1. Choose Your Provider

Select a proxy provider based on your needs:
- **For AdSense testing**: SocksEscort, Oxylabs, Bright Data
- **For high performance**: NetNut, Oxylabs
- **For cost-effectiveness**: NodeMaven, IPRoyal
- **For global coverage**: SOAX, Bright Data

### 2. Get Credentials

1. Sign up for your chosen provider
2. Get your API credentials (username/password)
3. Note the API endpoint and supported protocols

### 3. Update Configuration

Edit `config/config.yaml`:

```yaml
proxy:
  provider: "socksescort"  # Your chosen provider
  type: "socks5"          # Preferred protocol
  username: "your_actual_username"
  password: "your_actual_password"
  # ... other settings
```

### 4. Test Configuration

Run the bot with test mode:

```bash
python src/main.py --test-mode
```

## Provider Switching

You can switch between providers dynamically:

```python
# Switch to different provider
proxy_manager.switch_provider("oxylabs")

# Get available providers
providers = proxy_manager.get_supported_providers()
```

## Health Monitoring

The system automatically monitors proxy health:

- **Response time tracking**
- **Success rate monitoring**
- **Geo-consistency checks**
- **Automatic blacklisting of unhealthy proxies**

## Best Practices

### 1. Provider Selection
- Use residential proxies for AdSense testing
- Use datacenter proxies for high-speed operations
- Consider geo-targeting for specific regions

### 2. Configuration
- Set appropriate daily limits
- Monitor success rates
- Use health checks regularly
- Rotate proxies frequently

### 3. Security
- Keep credentials secure
- Use HTTPS when possible
- Monitor for suspicious activity
- Regular credential rotation

## Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Check username/password
   - Verify API endpoint
   - Check account status

2. **No Proxies Available**
   - Check account balance
   - Verify geo-targeting
   - Check daily limits

3. **Poor Performance**
   - Switch to different protocol
   - Try different geo-location
   - Check provider status

### Support

For provider-specific issues, contact your proxy provider's support team.

For bot-related issues, check the logs and configuration validation.
