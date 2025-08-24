#!/usr/bin/env python3
"""
Test with URL Helper
===================
Test using the URL helper module for clean URL handling
"""

import sys
import os
import time
import logging
import requests

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from multilogin_api import MultiloginXAPI
from selenium_automation import UndetectableSeleniumAutomation
from url_helper import setup_url_for_automation

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

def test_with_url_helper(debugging_url):
    """Test using URL helper module"""
    try:
        print("\n🔧 Test with URL Helper Module")
        print("=" * 40)
        
        automation = UndetectableSeleniumAutomation("../config/config.yaml")
        
        if not automation.setup_driver(debugging_url):
            return False
        
        print("✅ Driver setup successful")
        
        # Use URL helper module
        fallback_url = "https://maxgaming.biz.id/can-a-vpn-really-boost-your-fps-or-reduce-lag-2025-guide-for-gamers/"
        current_url, message = setup_url_for_automation(automation, fallback_url)
        
        if current_url:
            print(f"✅ URL setup successful: {current_url}")
            print(f"📝 Message: {message}")
            
            # Test automation on the URL
            print(f"\n🎯 Testing automation on: {current_url}")
            
            # Test scrolling
            try:
                print("🔄 Testing scrolling...")
                automation._simulate_natural_scrolling()
                print("✅ Scrolling completed")
            except Exception as e:
                print(f"⚠️ Scrolling failed: {e}")
            
            # Test mouse movements
            try:
                print("🖱️ Testing mouse movements...")
                automation._simulate_mouse_movement()
                print("✅ Mouse movements completed")
            except Exception as e:
                print(f"⚠️ Mouse movements failed: {e}")
            
            # Test reading behavior
            try:
                print("📖 Testing reading behavior...")
                automation._simulate_reading_behavior()
                print("✅ Reading behavior completed")
            except Exception as e:
                print(f"⚠️ Reading behavior failed: {e}")
            
            return True
        else:
            print(f"❌ URL setup failed: {message}")
            return False
        
    except Exception as e:
        print(f"❌ Test error: {e}")
        return False
    finally:
        if 'automation' in locals() and automation.driver:
            try:
                automation.close_driver()
            except Exception as e:
                print(f"⚠️ Error closing driver: {e}")

def main():
    logger = setup_logging()
    
    print("🔧 Test with URL Helper")
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
        
        # Test with URL helper
        success = test_with_url_helper(debugging_url)
        
        if success:
            print("\n💡 URL Helper module works perfectly!")
            print("🔧 Clean and reusable URL handling")
        else:
            print("\n❌ Test failed")
        
        return success
        
    except Exception as e:
        print(f"❌ Test error: {e}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
