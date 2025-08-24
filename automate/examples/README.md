# Examples Directory

This directory contains comprehensive examples demonstrating how to use the Automate project with Multilogin.

## 📁 Available Examples

### 1. **Connection Test** (`test_connection.py`)
**Start here!** Simple test to verify everything is working.

```bash
cd examples
python test_connection.py
```

**What it does:**
- 🔧 Initialize Multilogin API
- 🔐 Test authentication
- 📋 Check existing profiles
- 🔨 Create test profile
- ▶️ Start and stop profile
- ✅ Verify all connections work

**Best for:** First-time setup and troubleshooting.

---

### 2. **Quick Start Example** (`quick_start_example.py`)
**Perfect for beginners!** Simple example to get started quickly.

```bash
cd examples
python quick_start_example.py
```

**What it does:**
- 🔐 Login to Multilogin
- 👥 Create or use existing profiles
- ▶️ Start a profile
- 🤖 Setup Selenium automation
- 🌐 Test basic navigation
- 🎭 Test realistic browsing
- 🎯 Test AdSense detection
- 🧹 Clean up resources

**Best for:** Getting familiar with the system quickly.

---

### 2. **Comprehensive Login Example** (`multilogin_login_example.py`)
**Full-featured demonstration** of all capabilities.

```bash
cd examples
python multilogin_login_example.py
```

**What it does:**
- 🔐 Multilogin authentication with token refresh
- 👥 Complete profile management
- 🚀 Profile start/stop operations
- 🤖 Full Selenium automation
- 📦 Batch automation with multiple profiles
- 📊 Analytics and monitoring
- 🔗 Referer simulation demonstration

**Best for:** Understanding all features and capabilities.

---

### 3. **Batch Automation Example** (`batch_automation_example.py`)
**Advanced multi-profile automation** with threading.

```bash
cd examples
python batch_automation_example.py
```

**What it does:**
- 📦 Run automation across multiple profiles simultaneously
- ⚡ Threaded execution for better performance
- 📊 Comprehensive result tracking
- 💾 Save detailed results to JSON files
- 📈 Performance analytics and success rates

**Best for:** Production automation with multiple profiles.

---

### 4. **Advanced Behavior Demo** (`advanced_behavior_demo.py`)
**Demonstrates all advanced behavior features.**

```bash
cd examples
python advanced_behavior_demo.py
```

**What it shows:**
- 🕒 Time-based behavior patterns
- 🎭 Personality generation
- 📱 Device-specific behavior
- 🌍 Geographic behavior patterns
- 📄 Content-aware browsing
- 🧠 Session memory system
- 🎯 Smart ad interaction
- 📊 Advanced analytics

**Best for:** Understanding behavioral features.

---

### 5. **Referer Simulation Demo** (`referer_simulation_demo.py`)
**Shows referer simulation capabilities.**

```bash
cd examples
python referer_simulation_demo.py
```

**What it demonstrates:**
- 🔗 Different referer types (Google, Social, Direct)
- 🎭 Personality-based referer generation
- 🌍 Geographic referer patterns
- 📦 Batch referer generation
- 🔧 Multilogin profile integration
- 📊 Referer analytics

**Best for:** Understanding referer simulation features.

## 🚀 Getting Started

### Prerequisites
1. **Configure Multilogin credentials** in `config/config.yaml`:
```yaml
multilogin:
  username: "your_email@example.com"
  password: "your_password"
  base_url: "https://app.multilogin.com"
  launcher_url: "https://launcher.mlx.yt:45001/api/v2"
```

2. **Install dependencies**:
```bash
pip install -r requirements.txt
```

3. **Ensure Multilogin is running** and accessible.

### Quick Start
1. **First, test the connection**:
```bash
cd examples
python test_connection.py
```

2. **Then run the quick start example**:
```bash
cd examples
python quick_start_example.py
```

2. **Check the logs** for detailed information:
```bash
tail -f multilogin_login_example.log
```

3. **Review results** in the `data/` directory.

## 📊 Example Outputs

### Quick Start Example Output
```
🚀 Quick Start - Multilogin Automation
==================================================
🔐 Step 1: Logging into Multilogin...
✅ Successfully logged into Multilogin!
👥 Step 2: Managing profiles...
✅ Using existing profile: AutoProfile_001_multilogin_residential
▶️ Step 3: Starting profile...
✅ Profile started! Debugging URL: http://127.0.0.1:12345
🤖 Step 4: Setting up Selenium automation...
✅ Selenium automation ready!
🌐 Step 5: Testing automation...
📄 Page title: httpbin.org
🎭 Testing realistic browsing...
✅ Realistic browsing completed!
   Pages visited: 3
   Duration: 45.2s
   Personality: explorer
🎯 Testing AdSense detection...
✅ AdSense testing completed!
   Ads detected: 0
🧹 Step 6: Cleaning up...
✅ Driver closed
✅ Profile stopped
🎉 Quick start example completed successfully!
```

### Batch Automation Output
```
🚀 Starting batch automation with 3 profiles
🎯 Target URLs: 4
⚙️ Max workers: 2
✅ Found 3 profiles for batch automation
✅ Profile-1: success
   URLs visited: 4
   Total pages: 12
✅ Profile-2: success
   URLs visited: 4
   Total pages: 11
✅ Profile-3: success
   URLs visited: 4
   Total pages: 13

📊 Batch Automation Summary
==================================================
📈 Total Profiles: 3
✅ Successful: 3
❌ Failed: 0
🌐 URLs Visited: 12
⚠️ Total Errors: 0
📊 Success Rate: 100.0%
```

## 🔧 Customization

### Modify Target URLs
Edit the `target_urls` list in any example:
```python
target_urls = [
    "https://your-target-site.com",
    "https://another-site.com",
    "https://test-site.com"
]
```

### Adjust Profile Count
Change the number of profiles to use:
```python
# In batch automation
results = batch_automation.run_batch_automation(
    target_urls=target_urls,
    max_profiles=5,  # Use 5 profiles
    max_workers=3    # Use 3 concurrent workers
)
```

### Customize Behavior
Modify behavior settings in `config/config.yaml`:
```yaml
selenium:
  browsing_behavior:
    min_pages: 3
    max_pages: 7
    page_dwell_time: [20, 120]
  
  advanced_behavior:
    personality_weights:
      explorer: 0.4
      researcher: 0.2
      casual: 0.2
      professional: 0.2
```

## 📁 Generated Files

Examples generate several files:

### Log Files
- `multilogin_login_example.log` - Comprehensive example logs
- `quick_start_example.log` - Quick start logs
- `batch_automation.log` - Batch automation logs

### Data Files
- `data/profiles.json` - Profile information
- `data/referer_statistics.json` - Referer analytics
- `data/session_memory_YYYYMMDD.json` - Session memory
- `data/batch_results_YYYYMMDD_HHMMSS.json` - Batch results

### Configuration Files
- `config/config.yaml` - Main configuration
- `config/keywords.json` - Keywords for referer generation
- `config/referrer_domains.json` - Referer domain lists

## 🎯 Use Cases

### 1. **AdSense Testing**
```python
# Test AdSense detection on multiple sites
target_urls = [
    "https://news-site.com",
    "https://blog-site.com",
    "https://content-site.com"
]
```

### 2. **Traffic Generation**
```python
# Generate realistic traffic to your sites
target_urls = [
    "https://your-main-site.com",
    "https://your-blog.com",
    "https://your-landing-page.com"
]
```

### 3. **Competitor Analysis**
```python
# Analyze competitor sites
target_urls = [
    "https://competitor1.com",
    "https://competitor2.com",
    "https://competitor3.com"
]
```

### 4. **SEO Testing**
```python
# Test SEO elements across different profiles
target_urls = [
    "https://your-site.com/page1",
    "https://your-site.com/page2",
    "https://your-site.com/page3"
]
```

## 🔍 Troubleshooting

### Common Issues

1. **Authentication Failed**
   - Check credentials in `config/config.yaml`
   - Ensure Multilogin is running
   - Verify internet connection

2. **Profile Creation Failed**
   - Check Multilogin subscription
   - Verify proxy settings
   - Check API rate limits

3. **Selenium Setup Failed**
   - Ensure Chrome is installed
   - Check debugging URL is accessible
   - Verify port availability

4. **Batch Automation Errors**
   - Reduce `max_workers` for stability
   - Check system resources
   - Verify profile availability

### Debug Mode
Enable debug logging:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Performance Tips
- Use `max_workers=2` for stability
- Limit `max_profiles=3` for testing
- Increase delays for better stealth
- Monitor system resources

## 📚 Next Steps

After running the examples:

1. **Study the code** to understand the implementation
2. **Modify the examples** for your specific needs
3. **Create your own scripts** based on the examples
4. **Monitor the logs** for optimization opportunities
5. **Analyze the results** to improve performance

## 🆘 Support

If you encounter issues:

1. **Check the logs** for detailed error messages
2. **Verify configuration** in `config/config.yaml`
3. **Test with quick start example** first
4. **Review the documentation** in the main README
5. **Check Multilogin status** and API documentation

---

**Happy automating! 🚀**
