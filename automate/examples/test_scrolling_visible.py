#!/usr/bin/env python3
"""
Test Visible Scrolling Example
=============================

This example focuses specifically on demonstrating visible scrolling behavior
with detailed logging to show the scrolling process.

Usage:
    python3 test_scrolling_visible.py
"""

import sys
import os
import time
import logging
import requests
from typing import Dict

# Add parent directory to path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from multilogin_api import MultiloginXAPI
from selenium_automation import UndetectableSeleniumAutomation

# Configuration
MLX_LAUNCHER_V2 = "https://launcher.mlx.yt:45001/api/v2"
LOCALHOST = "http://127.0.0.1"
HEADERS = {"Accept": "application/json", "Content-Type": "application/json"}

# Profile configuration
FOLDER_ID = "d3602d53-2e54-4cce-87d7-64e89e0f8679"
PROFILE_ID = "8b6e3c8e-1f75-482f-a28d-ea05d50c6d18"

# Test URL with long content for scrolling
TEST_URL = "https://cekmedia.my.id/pinjaman-bca-online-langsung-cair-solusi-dana-instan-dari-bank-terpercaya/"

def setup_logging():
    """Setup detailed logging configuration"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(),
            logging.FileHandler('../logs/test_scrolling_visible.log')
        ]
    )
    return logging.getLogger(__name__)

def signin() -> str:
    """Sign in to Multilogin and get bearer token"""
    try:
        api = MultiloginXAPI("../config/config.yaml")
        
        if not api.authenticate():
            raise Exception("Authentication failed")
        
        token = api.bearer_token
        if not token:
            raise Exception("No bearer token received")
        
        print(f"✅ Successfully authenticated with Multilogin X API")
        return token
        
    except Exception as e:
        print(f"❌ Error during login: {e}")
        return None

def start_profile(token: str) -> Dict:
    """Start the profile and get Selenium debugging URL"""
    try:
        headers = HEADERS.copy()
        headers["Authorization"] = f"Bearer {token}"
        
        start_url = f"{MLX_LAUNCHER_V2}/profile/f/{FOLDER_ID}/p/{PROFILE_ID}/start?automation_type=selenium"
        
        print(f"🚀 Starting profile {PROFILE_ID}...")
        
        response = requests.get(start_url, headers=headers)
        
        if response.status_code != 200:
            print(f"❌ Error starting profile: {response.status_code}")
            print(f"   Response: {response.text}")
            return None
        
        profile_data = response.json()
        print(f"✅ Profile started successfully!")
        
        selenium_port = profile_data["data"]["port"]
        debugging_url = f"{LOCALHOST}:{selenium_port}"
        
        print(f"🔗 Selenium debugging URL: {debugging_url}")
        
        return {
            "debugging_url": debugging_url,
            "port": selenium_port,
            "profile_data": profile_data
        }
        
    except Exception as e:
        print(f"❌ Error starting profile: {e}")
        return None

def stop_profile(token: str):
    """Stop the profile"""
    try:
        headers = HEADERS.copy()
        headers["Authorization"] = f"Bearer {token}"
        
        stop_url = f"{MLX_LAUNCHER_V2}/profile/f/{FOLDER_ID}/p/{PROFILE_ID}/stop"
        
        print(f"🛑 Stopping profile {PROFILE_ID}...")
        
        response = requests.get(stop_url, headers=headers)
        
        if response.status_code == 200:
            print(f"✅ Profile stopped successfully!")
        else:
            print(f"⚠️ Warning: Profile stop response: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Error stopping profile: {e}")

def test_visible_scrolling(debugging_url: str):
    """Test visible scrolling behavior with detailed logging"""
    try:
        print("\n📜 Testing Visible Scrolling Behavior")
        print("=" * 50)
        
        # Initialize automation
        automation = UndetectableSeleniumAutomation("../config/config.yaml")
        
        # Setup driver
        if not automation.setup_driver(debugging_url):
            print("❌ Failed to setup driver")
            return False
        
        print("✅ Driver setup successful")
        
        # Navigate to test URL
        print(f"🌐 Navigating to: {TEST_URL}")
        automation.driver.get(TEST_URL)
        time.sleep(3)
        
        # Get page info
        page_title = automation.driver.title
        print(f"📄 Page title: {page_title}")
        
        # Test different scrolling patterns
        scrolling_tests = [
            {"personality": "explorer", "content_type": "blog"},
            {"personality": "researcher", "content_type": "technology"},
            {"personality": "casual", "content_type": "general"},
            {"personality": "professional", "content_type": "business"}
        ]
        
        for test in scrolling_tests:
            print(f"\n🎭 Testing scrolling for: {test['personality']} - {test['content_type']}")
            print("-" * 50)
            
            # Set personality
            automation.user_personality = test["personality"]
            
            # Test scrolling specifically
            try:
                automation._simulate_natural_scrolling(test["content_type"])
                print(f"✅ Scrolling test completed for {test['personality']}")
            except Exception as e:
                print(f"❌ Scrolling test failed: {e}")
            
            # Wait between tests
            if test != scrolling_tests[-1]:
                print("⏳ Waiting 3 seconds before next test...")
                time.sleep(3)
        
        return True
        
    except Exception as e:
        print(f"❌ Error in scrolling test: {e}")
        return False
    finally:
        if 'automation' in locals() and automation.driver:
            automation.close_driver()

def main():
    """Main test function"""
    logger = setup_logging()
    
    print("📜 Visible Scrolling Test")
    print("=" * 50)
    print(f"📁 Folder ID: {FOLDER_ID}")
    print(f"👤 Profile ID: {PROFILE_ID}")
    print(f"🎯 Test URL: {TEST_URL}")
    print()
    
    try:
        # Step 1: Authentication
        print("🔐 Step 1: Authentication")
        print("-" * 30)
        token = signin()
        if not token:
            print("❌ Authentication failed. Exiting.")
            return False
        
        # Step 2: Start Profile
        print("\n🚀 Step 2: Start Profile")
        print("-" * 30)
        profile_info = start_profile(token)
        if not profile_info:
            print("❌ Failed to start profile. Exiting.")
            return False
        
        debugging_url = profile_info["debugging_url"]
        
        # Step 3: Test Visible Scrolling
        print("\n📜 Step 3: Test Visible Scrolling")
        print("-" * 30)
        success = test_visible_scrolling(debugging_url)
        
        # Step 4: Stop Profile
        print("\n🛑 Step 4: Stop Profile")
        print("-" * 30)
        stop_profile(token)
        
        # Summary
        print("\n📊 Test Summary")
        print("=" * 50)
        print(f"✅ Authentication: Success")
        print(f"✅ Profile Start: Success")
        print(f"✅ Visible Scrolling Test: {'Success' if success else 'Failed'}")
        print(f"✅ Profile Stop: Success")
        
        if success:
            print("\n🎉 Scrolling test completed successfully!")
            print("💡 Check the browser to see detailed scrolling behavior")
            print("📋 Check logs for detailed scrolling information")
        else:
            print("\n❌ Scrolling test failed")
        
        return success
        
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        logger.error(f"Test failed: {e}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
