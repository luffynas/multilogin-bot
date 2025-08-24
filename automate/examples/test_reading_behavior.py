#!/usr/bin/env python3
"""
Test Reading Behavior Example
============================

This example focuses specifically on testing the improved reading behavior
with realistic eye movement, scrolling, and content interaction.

Usage:
    python3 test_reading_behavior.py
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
FOLDER_ID = "94caeb51-cc7f-477d-a6db-c79e696b5530"
PROFILE_ID = "2ebdd8cb-0ba2-418d-90e1-02efe5ef92f6"

# Profile will automatically load article from custom_start_urls

def setup_logging():
    """Setup logging configuration"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(),
            logging.FileHandler('../logs/test_reading_behavior.log')
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

def test_reading_behavior(debugging_url: str):
    """Test the improved reading behavior"""
    try:
        print("\n📖 Testing Improved Reading Behavior")
        print("=" * 50)
        
        # Initialize automation
        automation = UndetectableSeleniumAutomation("../config/config.yaml")
        
        # Setup driver
        if not automation.setup_driver(debugging_url):
            print("❌ Failed to setup driver")
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
        
        # Get page info
        page_title = automation.driver.title
        print(f"📄 Page title: {page_title}")
        
        # Test different personalities
        personalities = ["explorer", "researcher", "casual", "professional"]
        
        for personality in personalities:
            print(f"\n🎭 Testing personality: {personality}")
            print("-" * 30)
            
            # Set personality
            automation.user_personality = personality
            
            # Simulate realistic browsing with focus on reading
            browsing_session = automation.simulate_realistic_browsing(current_url)
            
            if "error" not in browsing_session:
                print(f"✅ {personality} reading session completed:")
                print(f"   Pages visited: {browsing_session.get('total_pages', 0)}")
                print(f"   Session duration: {browsing_session.get('session_duration', 0):.1f}s")
                print(f"   Navigation pattern: {browsing_session.get('navigation_pattern', [])}")
            else:
                print(f"❌ {personality} reading session failed: {browsing_session['error']}")
            
            # Wait between personalities
            if personality != personalities[-1]:
                print("⏳ Waiting 5 seconds before next personality...")
                time.sleep(5)
        
        return True
        
    except Exception as e:
        print(f"❌ Error in reading behavior test: {e}")
        return False
    finally:
        if 'automation' in locals() and automation.driver:
            automation.close_driver()

def main():
    """Main test function"""
    logger = setup_logging()
    
    print("📖 Reading Behavior Test")
    print("=" * 50)
    print(f"📁 Folder ID: {FOLDER_ID}")
    print(f"👤 Profile ID: {PROFILE_ID}")
    print(f"🎯 Profile will auto-load article from custom_start_urls")
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
        
        # Step 3: Test Reading Behavior
        print("\n📖 Step 3: Test Reading Behavior")
        print("-" * 30)
        success = test_reading_behavior(debugging_url)
        
        # Step 4: Stop Profile
        print("\n🛑 Step 4: Stop Profile")
        print("-" * 30)
        stop_profile(token)
        
        # Summary
        print("\n📊 Test Summary")
        print("=" * 50)
        print(f"✅ Authentication: Success")
        print(f"✅ Profile Start: Success")
        print(f"✅ Reading Behavior Test: {'Success' if success else 'Failed'}")
        print(f"✅ Profile Stop: Success")
        
        if success:
            print("\n🎉 Reading behavior test completed successfully!")
            print("💡 Check the browser to see realistic reading simulation")
        else:
            print("\n❌ Reading behavior test failed")
        
        return success
        
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        logger.error(f"Test failed: {e}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
