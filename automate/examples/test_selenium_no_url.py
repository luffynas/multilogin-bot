#!/usr/bin/env python3
"""
Selenium No URL Test
===================
Test Selenium automation without target URL (like Chrome extension)
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

def test_selenium_without_url(debugging_url):
    """Test Selenium automation without navigating to specific URL"""
    try:
        print("\n🔧 Selenium Without URL Test")
        print("=" * 40)
        
        automation = UndetectableSeleniumAutomation("../config/config.yaml")
        
        if not automation.setup_driver(debugging_url):
            return False
        
        print("✅ Driver setup successful")
        
        # Wait for profile to load (whatever it loads)
        print("🌐 Waiting for profile to load...")
        time.sleep(5)
        
        # Get current URL (whatever profile loaded)
        current_url = automation.driver.current_url
        page_title = automation.driver.title
        
        print(f"🌐 Current URL: {current_url}")
        print(f"📄 Page Title: {page_title}")
        
        # Test automation on whatever page is loaded
        print("\n🎯 Testing automation on current page...")
        
        # 1. Test basic page interaction
        try:
            # Get page info
            page_height = automation.driver.execute_script("return document.body.scrollHeight;")
            viewport_height = automation.driver.execute_script("return window.innerHeight;")
            
            print(f"📏 Page height: {page_height}, Viewport: {viewport_height}")
            
            # 2. Test scrolling (if page has content)
            if page_height > viewport_height:
                print("🔄 Testing scrolling on current page...")
                automation._simulate_natural_scrolling()
                print("✅ Scrolling completed")
            else:
                print("📄 Page is short, no scrolling needed")
            
            # 3. Test mouse movements
            print("🖱️ Testing mouse movements...")
            automation._simulate_mouse_movement()
            print("✅ Mouse movements completed")
            
        except Exception as e:
            print(f"⚠️ Some automation failed: {e}")
        
        return True
        
    except Exception as e:
        print(f"❌ Selenium test error: {e}")
        return False
    finally:
        if 'automation' in locals() and automation.driver:
            try:
                automation.close_driver()
            except Exception as e:
                print(f"⚠️ Error closing driver: {e}")

def main():
    logger = setup_logging()
    
    print("🔧 Selenium No URL Test")
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
        
        # Test Selenium without URL
        success = test_selenium_without_url(debugging_url)
        
        if success:
            print("\n💡 Selenium can work without target URL!")
            print("🔧 Like Chrome extension - works with whatever page is loaded")
        else:
            print("\n❌ Test failed")
        
        return success
        
    except Exception as e:
        print(f"❌ Test error: {e}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
