#!/usr/bin/env python3
"""
Specialized Ad Detection Test for maxgaming.biz.id
Tests ad detection with different device types and timing
"""

import time
import logging
import requests
from datetime import datetime
from src.multilogin_api import MultiloginXAPI
from src.selenium_automation import UndetectableSeleniumAutomation
from src.url_helper import setup_url_for_automation

# Constants
MLX_LAUNCHER_V2 = "https://launcher.mlx.yt:45001"
LOCALHOST = "http://127.0.0.1"
HEADERS = {"Accept": "application/json", "Content-Type": "application/json"}
FOLDER_ID = "94caeb51-cc7f-477d-a6db-c79e696b5530"
PROFILE_ID = "2ebdd8cb-0ba2-418d-90e1-02efe5ef92f6"

def setup_logging():
    """Setup logging"""
    log_format = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    logging.basicConfig(
        level=logging.INFO,
        format=log_format,
        handlers=[
            logging.FileHandler('../logs/ad_detection_test.log'),
            logging.StreamHandler()
        ]
    )
    return logging.getLogger(__name__)

def signin():
    """Authenticate with Multilogin API"""
    try:
        api = MultiloginXAPI("../config/config.yaml")
        if not api.authenticate():
            raise Exception("Authentication failed")
        return api.bearer_token
    except Exception as e:
        print(f"❌ Login error: {e}")
        return None

def start_profile(token):
    """Start Multilogin profile"""
    try:
        headers = HEADERS.copy()
        headers["Authorization"] = f"Bearer {token}"
        start_url = f"{MLX_LAUNCHER_V2}/profile/f/{FOLDER_ID}/p/{PROFILE_ID}/start?automation_type=selenium"
        
        response = requests.get(start_url, headers=headers)
        if response.status_code != 200:
            return None
        
        profile_data = response.json()
        selenium_port = profile_data["data"]["port"]
        debugging_url = f"{LOCALHOST}:{selenium_port}"
        
        print(f"✅ Profile started: {debugging_url}")
        return debugging_url
        
    except Exception as e:
        print(f"❌ Start profile error: {e}")
        return None

def test_ad_detection_with_desktop():
    """Test ad detection with desktop device type"""
    logger = setup_logging()
    
    print("🎯 Ad Detection Test - Desktop Device")
    print("=" * 50)
    
    # Auth
    token = signin()
    if not token:
        return False
    
    # Start profile
    debugging_url = start_profile(token)
    if not debugging_url:
        return False
    
    try:
        # Setup automation with desktop device type
        automation = UndetectableSeleniumAutomation("../config/config.yaml")
        
        # Force desktop device type
        automation.device_type = "desktop"
        automation.logger.info(f"📱 Forced device type: {automation.device_type}")
        
        if not automation.setup_driver(debugging_url):
            return False
        
        print("✅ Driver setup successful")
        
        # Setup URL
        target_url = "https://maxgaming.biz.id/gaming-vpns-that-work-with-xbox-playstation-and-switch-2025-edition/"
        current_url, message = setup_url_for_automation(automation, target_url)
        
        if not current_url:
            print("❌ URL setup failed")
            return False
        
        print(f"✅ URL setup successful: {current_url}")
        
        # Test ad detection with different timing
        print("\n🔍 Testing Ad Detection with Different Timing")
        print("=" * 50)
        
        for wait_time in [5, 10, 15, 20]:
            print(f"\n⏳ Testing with {wait_time}s wait time...")
            
            # Wait for ads to load
            time.sleep(wait_time)
            
            # Test ad detection
            ads_result = automation._detect_adsense_ads()
            
            print(f"  📊 Ads detected: {ads_result['count']}")
            if ads_result['count'] > 0:
                print(f"  📍 Ad positions: {len(ads_result['positions'])}")
                for i, ad in enumerate(ads_result['details'][:3]):  # Show first 3 ads
                    print(f"    Ad {i+1}: {ad['selector']} - {ad['size']['width']}x{ad['size']['height']}")
            
            if ads_result['count'] > 0:
                print(f"✅ Found {ads_result['count']} ads with {wait_time}s wait!")
                break
        
        # Test scrolling to trigger lazy loading
        print("\n🔄 Testing Scrolling to Trigger Lazy Loading")
        print("=" * 50)
        
        # Scroll down to trigger lazy loading
        automation.driver.execute_script("window.scrollTo(0, 1000);")
        time.sleep(5)
        
        # Test ad detection again
        ads_result = automation._detect_adsense_ads()
        print(f"📊 After scrolling: {ads_result['count']} ads detected")
        
        # Scroll back up
        automation.driver.execute_script("window.scrollTo(0, 0);")
        time.sleep(3)
        
        # Final test
        ads_result = automation._detect_adsense_ads()
        print(f"📊 Final test: {ads_result['count']} ads detected")
        
        # Test simulated ad interaction if no real ads
        if ads_result['count'] == 0:
            print("\n🎯 Testing Simulated Ad Interaction")
            print("=" * 50)
            
            # Force create simulated ads
            simulated_ads = automation._create_simulated_ads_for_testing()
            print(f"✅ Created {simulated_ads['count']} simulated ads")
            
            # Test interaction
            interaction_result = automation._simulate_ad_interaction()
            print(f"📊 Interaction result: {interaction_result}")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Ad detection test failed: {e}")
        return False
    finally:
        if 'automation' in locals() and automation.driver:
            automation.close_driver()

def main():
    """Main function"""
    print("🎯 Ad Detection Test for maxgaming.biz.id")
    print("=" * 50)
    
    success = test_ad_detection_with_desktop()
    
    if success:
        print("\n✅ Ad detection test completed successfully")
    else:
        print("\n❌ Ad detection test failed")

if __name__ == "__main__":
    main()
