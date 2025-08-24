#!/usr/bin/env python3
"""
Quick Start Example - Multilogin Login
Simple example to get started with Multilogin automation
"""

import sys
import os
import time
import logging

# Add src directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from multilogin_api import MultiloginXAPI
from profile_manager import ProfileManager
from selenium_automation import UndetectableSeleniumAutomation

def setup_logging():
    """Setup basic logging"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s'
    )

def quick_start_example():
    """Quick start example for Multilogin automation"""
    logger = logging.getLogger(__name__)
    
    logger.info("🚀 Quick Start - Multilogin Automation")
    logger.info("=" * 50)
    
    try:
        # Step 1: Login to Multilogin
        logger.info("🔐 Step 1: Logging into Multilogin...")
        multilogin_api = MultiloginXAPI("../config/config.yaml")
        
        if not multilogin_api.authenticate():
            logger.error("❌ Failed to authenticate with Multilogin")
            logger.error("   Please check your credentials in config/config.yaml")
            return False
        
        logger.info("✅ Successfully logged into Multilogin!")
        
        # Step 2: Get or create profiles
        logger.info("👥 Step 2: Managing profiles...")
        profile_manager = ProfileManager("../config/config.yaml")
        
        # Get existing profiles
        existing_profiles = profile_manager.get_all_profiles()
        
        if not existing_profiles:
            logger.info("📝 No profiles found. Creating new profile...")
            new_profiles = profile_manager.create_profiles(count=1, provider="multilogin_residential")
            
            if not new_profiles:
                logger.error("❌ Failed to create profile")
                return False
            
            test_profile = new_profiles[0]
            logger.info(f"✅ Created profile: {test_profile.name}")
        else:
            test_profile = existing_profiles[0]
            logger.info(f"✅ Using existing profile: {test_profile.name}")
        
        # Step 3: Start profile
        logger.info("▶️ Step 3: Starting profile...")
        start_result = multilogin_api.start_profile(test_profile.profile_id)
        
        if not start_result:
            logger.error("❌ Failed to start profile")
            return False
        
        debugging_url = start_result.get('debugging_url')
        logger.info(f"✅ Profile started! Debugging URL: {debugging_url}")
        
        # Step 4: Setup Selenium automation
        logger.info("🤖 Step 4: Setting up Selenium automation...")
        automation = UndetectableSeleniumAutomation("../config/config.yaml")
        
        if not automation.setup_driver(debugging_url):
            logger.error("❌ Failed to setup Selenium driver")
            return False
        
        logger.info("✅ Selenium automation ready!")
        
        try:
            # Step 5: Test automation
            logger.info("🌐 Step 5: Testing automation...")
            
            # Navigate to a test page
            test_url = "https://httpbin.org/ip"
            automation.driver.get(test_url)
            time.sleep(3)
            
            # Get page title
            page_title = automation.driver.title
            logger.info(f"📄 Page title: {page_title}")
            
            # Test realistic browsing
            logger.info("🎭 Testing realistic browsing...")
            browsing_result = automation.simulate_realistic_browsing("https://example.com")
            
            if browsing_result and not browsing_result.get("error"):
                logger.info("✅ Realistic browsing completed!")
                logger.info(f"   Pages visited: {browsing_result.get('total_pages', 0)}")
                logger.info(f"   Duration: {browsing_result.get('session_duration', 0):.1f}s")
                logger.info(f"   Personality: {browsing_result.get('personality', 'N/A')}")
            else:
                logger.warning("⚠️ Realistic browsing failed")
            
            # Test AdSense detection
            logger.info("🎯 Testing AdSense detection...")
            adsense_result = automation.test_adsense_ads("https://example.com")
            
            if adsense_result:
                logger.info("✅ AdSense testing completed!")
                logger.info(f"   Ads detected: {adsense_result.get('ads_detected', 0)}")
            else:
                logger.warning("⚠️ AdSense testing failed")
            
        except Exception as e:
            logger.error(f"❌ Error during automation: {e}")
        
        finally:
            # Step 6: Cleanup
            logger.info("🧹 Step 6: Cleaning up...")
            
            if automation.driver:
                automation.driver.quit()
                logger.info("✅ Driver closed")
            
            # Stop profile
            multilogin_api.stop_profile(test_profile.profile_id)
            logger.info("✅ Profile stopped")
        
        logger.info("🎉 Quick start example completed successfully!")
        return True
        
    except Exception as e:
        logger.error(f"❌ Error in quick start example: {e}")
        return False

def show_usage_instructions():
    """Show usage instructions"""
    print("\n📖 Usage Instructions:")
    print("=" * 50)
    print("1. Configure your Multilogin credentials in config/config.yaml")
    print("2. Run this example: python quick_start_example.py")
    print("3. Check the logs for detailed information")
    print("4. The example will:")
    print("   - Login to Multilogin")
    print("   - Create or use existing profiles")
    print("   - Start a profile")
    print("   - Setup Selenium automation")
    print("   - Test realistic browsing")
    print("   - Test AdSense detection")
    print("   - Clean up resources")
    print("\n🔧 Configuration:")
    print("- Edit config/config.yaml to customize settings")
    print("- Add your Multilogin username and password")
    print("- Configure proxy settings if needed")
    print("- Adjust automation parameters")

def main():
    """Main function"""
    setup_logging()
    
    print("🚀 Multilogin Quick Start Example")
    print("=" * 50)
    
    success = quick_start_example()
    
    if success:
        print("\n✅ Quick start completed successfully!")
        print("🎯 You can now build your own automation scripts!")
    else:
        print("\n❌ Quick start failed!")
        print("🔧 Please check the logs and configuration")
    
    show_usage_instructions()

if __name__ == "__main__":
    main()
