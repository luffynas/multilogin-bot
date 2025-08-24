#!/usr/bin/env python3
"""
Simple Scrolling Test
====================
"""

import sys
import os
import time
import logging
import requests

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from multilogin_api import MultiloginXAPI
from selenium_automation import UndetectableSeleniumAutomation

# Config
MLX_LAUNCHER_V2 = "https://launcher.mlx.yt:45001/api/v2"
LOCALHOST = "http://127.0.0.1"
HEADERS = {"Accept": "application/json", "Content-Type": "application/json"}
FOLDER_ID = "94caeb51-cc7f-477d-a6db-c79e696b5530"
PROFILE_ID = "2ebdd8cb-0ba2-418d-90e1-02efe5ef92f6"

def setup_logging():
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
    # Set selenium automation logger to INFO level for detailed scrolling logs
    logging.getLogger('selenium_automation').setLevel(logging.INFO)
    return logging.getLogger(__name__)

def signin():
    try:
        api = MultiloginXAPI("../config/config.yaml")
        if not api.authenticate():
            raise Exception("Authentication failed")
        return api.bearer_token
    except Exception as e:
        print(f"❌ Login error: {e}")
        return None

def start_profile(token):
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

def test_scrolling(debugging_url):
    try:
        print("\n📜 Testing Scrolling Behavior")
        print("=" * 40)
        
        automation = UndetectableSeleniumAutomation("../config/config.yaml")
        
        if not automation.setup_driver(debugging_url):
            return False
        
        print("✅ Driver setup successful")
        
        # Wait for profile to load and get current URL
        print("🌐 Waiting for profile to load...")
        time.sleep(5)  # Wait for profile to fully load
        
        # Get current URL from profile
        selenium_url = automation.driver.current_url
        print(f"🔧 Selenium URL: {selenium_url}")
        
        # Check if Selenium is accessing DevTools
        if "devtools://" in selenium_url:
            print("⚠️ Selenium is accessing DevTools, switching to main tab...")
            
            # Try to get the real URL by switching to the main tab
            try:
                # Get all window handles
                handles = automation.driver.window_handles
                print(f"📑 Available windows: {len(handles)}")
                
                # Switch to the main tab (usually the first one)
                if len(handles) > 1:
                    print("🔄 Switching to main tab...")
                    automation.driver.switch_to.window(handles[0])
                    time.sleep(2)
                    
                    # Get URL from main tab
                    current_url = automation.driver.current_url
                    current_title = automation.driver.title
                    
                    print(f"🌐 Real URL: {current_url}")
                    print(f"📄 Real Title: {current_title}")
                    
                    if "devtools://" not in current_url:
                        print("✅ Successfully got real URL from main tab")
                    else:
                        print("❌ Main tab also shows DevTools, navigating to target URL")
                        target_url = "https://maxgaming.biz.id/can-a-vpn-really-boost-your-fps-or-reduce-lag-2025-guide-for-gamers/"
                        automation.driver.get(target_url)
                        time.sleep(3)
                        current_url = automation.driver.current_url
                        print(f"🌐 Navigated to: {current_url}")
                else:
                    print("❌ Only one window available, navigating to target URL")
                    target_url = "https://maxgaming.biz.id/can-a-vpn-really-boost-your-fps-or-reduce-lag-2025-guide-for-gamers/"
                    automation.driver.get(target_url)
                    time.sleep(3)
                    current_url = automation.driver.current_url
                    print(f"🌐 Navigated to: {current_url}")
                
            except Exception as e:
                print(f"❌ Error switching tabs: {e}")
                print("🔄 Navigating to target URL as fallback...")
                target_url = "https://maxgaming.biz.id/can-a-vpn-really-boost-your-fps-or-reduce-lag-2025-guide-for-gamers/"
                automation.driver.get(target_url)
                time.sleep(3)
                current_url = automation.driver.current_url
                print(f"🌐 Navigated to: {current_url}")
        else:
            print("✅ Selenium is accessing the real page")
            current_url = selenium_url
        
        # Test different personalities
        personalities = ["explorer", "researcher", "casual", "professional"]
        
        for personality in personalities:
            print(f"\n🎭 Testing {personality} scrolling:")
            print("-" * 30)
            
            automation.user_personality = personality
            
            try:
                # Check if driver is still active
                if not automation.driver:
                    print("❌ Driver not available, skipping")
                    break
                
                # Test scrolling with detailed logging
                print(f"🔄 Starting {personality} scrolling pattern...")
                automation._simulate_natural_scrolling()
                print(f"✅ {personality} scrolling completed")
                
            except Exception as e:
                print(f"❌ {personality} scrolling failed: {e}")
                # Continue with next personality instead of stopping
            
            time.sleep(1)  # Shorter wait between personalities
        
        return True
        
    except Exception as e:
        print(f"❌ Scrolling test error: {e}")
        return False
    finally:
        try:
            if 'automation' in locals() and automation.driver:
                automation.close_driver()
        except Exception as e:
            print(f"⚠️ Error closing driver: {e}")

def main():
    logger = setup_logging()
    
    print("📜 Simple Scrolling Test")
    print("=" * 40)
    
    try:
        # Auth
        token = signin()
        if not token:
            return False
        
        # Start profile
        debugging_url = start_profile(token)
        if not debugging_url:
            return False
        
        # Test scrolling
        success = test_scrolling(debugging_url)
        
        print(f"\n📊 Result: {'✅ Success' if success else '❌ Failed'}")
        return success
        
    except Exception as e:
        print(f"❌ Test error: {e}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
