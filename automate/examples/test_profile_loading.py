#!/usr/bin/env python3
"""
Test Profile Loading
===================
Check if profile auto-loads URL or needs manual navigation
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

def test_profile_loading(debugging_url):
    try:
        print("\n🔍 Testing Profile Loading")
        print("=" * 40)
        
        automation = UndetectableSeleniumAutomation("../config/config.yaml")
        
        if not automation.setup_driver(debugging_url):
            return False
        
        print("✅ Driver setup successful")
        
        # Wait for page to load
        time.sleep(5)
        
        # Check current URL
        current_url = automation.driver.current_url
        page_title = automation.driver.title
        
        print(f"🌐 Current URL: {current_url}")
        print(f"📄 Page Title: {page_title}")
        
        # Check if page is loaded
        if current_url == "data:," or current_url == "about:blank":
            print("❌ Profile did NOT auto-load URL - page is blank")
            print("🔧 Need to manually navigate to target URL")
            return False
        else:
            print("✅ Profile auto-loaded URL successfully")
            return True
        
    except Exception as e:
        print(f"❌ Profile loading test error: {e}")
        return False
    finally:
        if 'automation' in locals() and automation.driver:
            automation.close_driver()

def test_manual_navigation(debugging_url):
    try:
        print("\n🔧 Testing Manual Navigation")
        print("=" * 40)
        
        automation = UndetectableSeleniumAutomation("../config/config.yaml")
        
        if not automation.setup_driver(debugging_url):
            return False
        
        print("✅ Driver setup successful")
        
        # Test URL to navigate to
        test_url = "https://cekmedia.my.id/pinjaman-bca-online-langsung-cair-solusi-dana-instan-dari-bank-terpercaya/"
        
        print(f"🌐 Navigating to: {test_url}")
        automation.driver.get(test_url)
        
        # Wait for page to load
        time.sleep(5)
        
        # Check if navigation successful
        current_url = automation.driver.current_url
        page_title = automation.driver.title
        
        print(f"✅ Navigation successful")
        print(f"🌐 Current URL: {current_url}")
        print(f"📄 Page Title: {page_title}")
        
        return True
        
    except Exception as e:
        print(f"❌ Manual navigation test error: {e}")
        return False
    finally:
        if 'automation' in locals() and automation.driver:
            automation.close_driver()

def main():
    logger = setup_logging()
    
    print("🔍 Profile Loading Test")
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
        
        # Test 1: Check if profile auto-loads
        auto_load_success = test_profile_loading(debugging_url)
        
        if not auto_load_success:
            print("\n⚠️ Profile does NOT auto-load URL")
            print("🔧 Testing manual navigation...")
            
            # Test 2: Manual navigation
            manual_nav_success = test_manual_navigation(debugging_url)
            
            if manual_nav_success:
                print("\n✅ Manual navigation works")
                print("💡 Need to use manual navigation in test scripts")
            else:
                print("\n❌ Manual navigation failed")
        else:
            print("\n✅ Profile auto-loads URL")
            print("💡 Can use profile without manual navigation")
        
        print(f"\n📊 Result: {'✅ Success' if auto_load_success else '⚠️ Manual navigation required'}")
        return True
        
    except Exception as e:
        print(f"❌ Test error: {e}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
