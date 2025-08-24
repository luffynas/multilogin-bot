#!/usr/bin/env python3
"""
URL Helper Test
==============
Demonstrate how to get current URL from profile
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

def get_current_url_from_profile(debugging_url):
    """
    Get current URL from profile without manual navigation
    """
    try:
        print("\n🔍 Getting Current URL from Profile")
        print("=" * 40)
        
        automation = UndetectableSeleniumAutomation("../config/config.yaml")
        
        if not automation.setup_driver(debugging_url):
            return None
        
        print("✅ Driver setup successful")
        
        # Wait for profile to load
        print("🌐 Waiting for profile to load...")
        time.sleep(5)
        
        # Get current URL from profile
        current_url = automation.driver.current_url
        page_title = automation.driver.title
        
        print(f"🌐 Current URL: {current_url}")
        print(f"📄 Page Title: {page_title}")
        
        # Check what type of page was loaded
        if "devtools://" in current_url:
            print("ℹ️ Profile loaded DevTools page")
            return None
        elif current_url == "data:," or current_url == "about:blank":
            print("ℹ️ Profile loaded blank page")
            return None
        else:
            print("✅ Profile loaded a valid website")
            return current_url
        
    except Exception as e:
        print(f"❌ Error getting current URL: {e}")
        return None
    finally:
        if 'automation' in locals() and automation.driver:
            automation.close_driver()

def main():
    logger = setup_logging()
    
    print("🔍 URL Helper Test")
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
        
        # Get current URL
        current_url = get_current_url_from_profile(debugging_url)
        
        if current_url:
            print(f"\n✅ Successfully got current URL: {current_url}")
            print("💡 You can use this URL for automation without manual navigation")
        else:
            print(f"\n⚠️ Profile didn't load a valid website")
            print("💡 You may need to configure custom_start_urls in profile or use manual navigation")
        
        return True
        
    except Exception as e:
        print(f"❌ Test error: {e}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
