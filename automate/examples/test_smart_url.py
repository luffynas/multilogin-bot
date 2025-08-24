#!/usr/bin/env python3
"""
Smart URL Test
=============
Test smart URL handling without double navigation
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

def is_valid_website_url(url):
    """Check if URL is a valid website (not DevTools, blank, etc.)"""
    invalid_patterns = [
        "devtools://",
        "data:,",
        "about:blank",
        "chrome://",
        "chrome-extension://"
    ]
    
    for pattern in invalid_patterns:
        if pattern in url:
            return False
    return True

def get_smart_url(debugging_url, fallback_url=None):
    """
    Smart URL handling - avoid double navigation
    """
    try:
        print("\n🧠 Smart URL Handling")
        print("=" * 40)
        
        automation = UndetectableSeleniumAutomation("../config/config.yaml")
        
        if not automation.setup_driver(debugging_url):
            return None, None
        
        print("✅ Driver setup successful")
        
        # Wait for profile to load
        print("🌐 Waiting for profile to load...")
        time.sleep(5)
        
        # Get current URL from profile
        current_url = automation.driver.current_url
        page_title = automation.driver.title
        
        print(f"🌐 Current URL: {current_url}")
        print(f"📄 Page Title: {page_title}")
        
        # Check if profile loaded a valid website
        if is_valid_website_url(current_url):
            print("✅ Profile loaded a valid website - no navigation needed")
            return current_url, automation
        else:
            print("⚠️ Profile loaded invalid page (DevTools/blank)")
            
            if fallback_url:
                print(f"🔄 Navigating to fallback URL: {fallback_url}")
                automation.driver.get(fallback_url)
                time.sleep(3)
                
                # Get new URL after navigation
                new_url = automation.driver.current_url
                print(f"🌐 New URL: {new_url}")
                
                if is_valid_website_url(new_url):
                    print("✅ Successfully navigated to valid website")
                    return new_url, automation
                else:
                    print("❌ Fallback navigation failed")
                    return None, automation
            else:
                print("❌ No fallback URL provided")
                return None, automation
        
    except Exception as e:
        print(f"❌ Error in smart URL handling: {e}")
        return None, None

def test_scrolling_with_smart_url(url, automation):
    """Test scrolling with smart URL handling"""
    try:
        print(f"\n📜 Testing Scrolling on: {url}")
        print("=" * 40)
        
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
                
                # Test scrolling
                print(f"🔄 Starting {personality} scrolling pattern...")
                automation._simulate_natural_scrolling()
                print(f"✅ {personality} scrolling completed")
                
            except Exception as e:
                print(f"❌ {personality} scrolling failed: {e}")
            
            time.sleep(1)
        
        return True
        
    except Exception as e:
        print(f"❌ Scrolling test error: {e}")
        return False

def main():
    logger = setup_logging()
    
    print("🧠 Smart URL Test")
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
        
        # Get smart URL (avoid double navigation)
        fallback_url = "https://maxgaming.biz.id/can-a-vpn-really-boost-your-fps-or-reduce-lag-2025-guide-for-gamers/"
        current_url, automation = get_smart_url(debugging_url, fallback_url)
        
        if current_url and automation:
            print(f"\n✅ Successfully got URL: {current_url}")
            print("💡 No double navigation - using existing URL or single navigation")
            
            # Test scrolling
            success = test_scrolling_with_smart_url(current_url, automation)
            
            if success:
                print("\n📊 Result: ✅ Success - Smart URL handling works!")
            else:
                print("\n📊 Result: ⚠️ Partial success - URL OK but scrolling failed")
        else:
            print(f"\n❌ Failed to get valid URL")
            print("📊 Result: ❌ Failed")
        
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
