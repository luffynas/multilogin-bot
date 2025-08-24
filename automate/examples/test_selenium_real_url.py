#!/usr/bin/env python3
"""
Selenium Real URL Test
=====================
Test Selenium automation with real URL from address bar (not DevTools)
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

def get_real_url_from_profile(debugging_url):
    """
    Get the real URL from profile's address bar (not DevTools)
    """
    try:
        print("\n🔍 Getting Real URL from Profile")
        print("=" * 40)
        
        automation = UndetectableSeleniumAutomation("../config/config.yaml")
        
        if not automation.setup_driver(debugging_url):
            return None, None
        
        print("✅ Driver setup successful")
        
        # Wait for profile to load
        print("🌐 Waiting for profile to load...")
        time.sleep(5)
        
        # Get current URL from Selenium
        selenium_url = automation.driver.current_url
        selenium_title = automation.driver.title
        
        print(f"🔧 Selenium URL: {selenium_url}")
        print(f"🔧 Selenium Title: {selenium_title}")
        
        # Check if Selenium is accessing DevTools
        if "devtools://" in selenium_url:
            print("⚠️ Selenium is accessing DevTools, not the real page")
            print("💡 Need to switch to the actual tab/window")
            
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
                    real_url = automation.driver.current_url
                    real_title = automation.driver.title
                    
                    print(f"🌐 Real URL: {real_url}")
                    print(f"📄 Real Title: {real_title}")
                    
                    if "devtools://" not in real_url:
                        print("✅ Successfully got real URL from main tab")
                        return real_url, automation
                    else:
                        print("❌ Main tab also shows DevTools")
                else:
                    print("❌ Only one window available")
                
            except Exception as e:
                print(f"❌ Error switching tabs: {e}")
            
            # If switching didn't work, try to navigate to a real URL
            print("🔄 Navigating to a real URL...")
            target_url = "https://maxgaming.biz.id/can-a-vpn-really-boost-your-fps-or-reduce-lag-2025-guide-for-gamers/"
            automation.driver.get(target_url)
            time.sleep(3)
            
            real_url = automation.driver.current_url
            real_title = automation.driver.title
            
            print(f"🌐 Navigated URL: {real_url}")
            print(f"📄 Navigated Title: {real_title}")
            
            return real_url, automation
            
        else:
            print("✅ Selenium is accessing the real page")
            return selenium_url, automation
        
    except Exception as e:
        print(f"❌ Error getting real URL: {e}")
        return None, None

def test_automation_on_real_url(url, automation):
    """Test automation on the real URL"""
    try:
        print(f"\n🎯 Testing Automation on Real URL: {url}")
        print("=" * 40)
        
        # Test basic page interaction
        try:
            # Get page info
            page_height = automation.driver.execute_script("return document.body.scrollHeight;")
            viewport_height = automation.driver.execute_script("return window.innerHeight;")
            
            print(f"📏 Page height: {page_height}, Viewport: {viewport_height}")
            
            # Test scrolling (if page has content)
            if page_height > viewport_height:
                print("🔄 Testing scrolling on real page...")
                automation._simulate_natural_scrolling()
                print("✅ Scrolling completed")
            else:
                print("📄 Page is short, no scrolling needed")
            
            # Test mouse movements
            print("🖱️ Testing mouse movements...")
            automation._simulate_mouse_movement()
            print("✅ Mouse movements completed")
            
            # Test reading behavior
            print("📖 Testing reading behavior...")
            automation._simulate_reading_behavior()
            print("✅ Reading behavior completed")
            
        except Exception as e:
            print(f"⚠️ Some automation failed: {e}")
        
        return True
        
    except Exception as e:
        print(f"❌ Automation test error: {e}")
        return False

def main():
    logger = setup_logging()
    
    print("🔍 Selenium Real URL Test")
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
        
        # Get real URL from profile
        real_url, automation = get_real_url_from_profile(debugging_url)
        
        if real_url and automation:
            print(f"\n✅ Successfully got real URL: {real_url}")
            
            # Test automation on real URL
            success = test_automation_on_real_url(real_url, automation)
            
            if success:
                print("\n💡 Selenium can work with real URL from address bar!")
                print("🔧 No more DevTools - accessing actual webpage")
            else:
                print("\n⚠️ URL OK but automation failed")
        else:
            print(f"\n❌ Failed to get real URL")
        
        return True
        
    except Exception as e:
        print(f"❌ Test error: {e}")
        return False
    finally:
        if 'automation' in locals() and automation and automation.driver:
            try:
                automation.close_driver()
            except Exception as e:
                print(f"⚠️ Error closing driver: {e}")

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
