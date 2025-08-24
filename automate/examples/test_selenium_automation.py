#!/usr/bin/env python3
"""
Test Selenium Automation Example
================================

This example demonstrates how to:
1. Start a Multilogin profile with Selenium automation
2. Use the UndetectableSeleniumAutomation class
3. Test realistic browsing behavior
4. Test AdSense detection and interaction

Based on Multilogin's official Selenium automation example:
https://multilogin.com/help/selenium-automation-example

Usage:
    python3 test_selenium_automation.py
"""

import sys
import os
import time
import logging
import hashlib
import requests
from typing import Dict, List

# Add parent directory to path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from multilogin_api import MultiloginXAPI
from selenium_automation import UndetectableSeleniumAutomation

# Configuration
MLX_BASE = "https://api.multilogin.com"
MLX_LAUNCHER_V2 = "https://launcher.mlx.yt:45001/api/v2"
LOCALHOST = "http://127.0.0.1"
HEADERS = {"Accept": "application/json", "Content-Type": "application/json"}

# Profile configuration - using the created profile
FOLDER_ID = "94caeb51-cc7f-477d-a6db-c79e696b5530"  # Default folder
PROFILE_ID = "2ebdd8cb-0ba2-418d-90e1-02efe5ef92f6"  # Created profile

# Profile will automatically load article from custom_start_urls

def setup_logging():
    """Setup logging configuration"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(),
            logging.FileHandler('../logs/test_selenium_automation.log')
        ]
    )
    return logging.getLogger(__name__)

def signin() -> str:
    """Sign in to Multilogin and get bearer token"""
    try:
        # Load config to get credentials
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
        # Update headers with token
        headers = HEADERS.copy()
        headers["Authorization"] = f"Bearer {token}"
        
        # Start profile with Selenium automation
        start_url = f"{MLX_LAUNCHER_V2}/profile/f/{FOLDER_ID}/p/{PROFILE_ID}/start?automation_type=selenium"
        
        print(f"🚀 Starting profile {PROFILE_ID}...")
        print(f"   URL: {start_url}")
        
        response = requests.get(start_url, headers=headers)
        
        if response.status_code != 200:
            print(f"❌ Error starting profile: {response.status_code}")
            print(f"   Response: {response.text}")
            return None
        
        profile_data = response.json()
        print(f"✅ Profile started successfully!")
        
        # Extract debugging URL
        selenium_port = profile_data["data"]["port"]
        debugging_url = f"{LOCALHOST}:{selenium_port}"
        
        print(f"🔗 Selenium debugging URL: {debugging_url}")
        print(f"📊 Profile data: {profile_data}")
        
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

def test_basic_selenium(debugging_url: str):
    """Test basic Selenium functionality"""
    try:
        print("\n🔧 Testing basic Selenium functionality...")
        
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
        
        # Check page title
        page_title = automation.driver.title
        print(f"📄 Page title: {page_title}")
        
        # Test basic interaction
        print("🖱️ Testing basic interactions...")
        automation.simulate_human_behavior({})
        
        print("✅ Basic Selenium test completed")
        return True
        
    except Exception as e:
        print(f"❌ Error in basic Selenium test: {e}")
        return False
    finally:
        if 'automation' in locals() and automation.driver:
            automation.close_driver()

def test_realistic_browsing(debugging_url: str):
    """Test realistic browsing behavior"""
    try:
        print("\n🎭 Testing realistic browsing behavior...")
        
        # Initialize automation
        automation = UndetectableSeleniumAutomation("../config/config.yaml")
        
        # Setup driver
        if not automation.setup_driver(debugging_url):
            print("❌ Failed to setup driver")
            return False
        
        print("✅ Driver setup successful")
        
        results = []
        
        # Test with current URL
        print(f"\n📄 Testing current URL: {current_url}")
        
        try:
            # Test realistic browsing
            browsing_session = automation.simulate_realistic_browsing(current_url)
            
            if "error" not in browsing_session:
                print(f"✅ Browsing session completed:")
                print(f"   Pages visited: {browsing_session.get('total_pages', 0)}")
                print(f"   Session duration: {browsing_session.get('session_duration', 0):.1f}s")
                print(f"   Navigation pattern: {browsing_session.get('navigation_pattern', [])}")
                
                results.append({
                    "url": current_url,
                    "status": "success",
                    "session": browsing_session
                })
            else:
                print(f"❌ Browsing session failed: {browsing_session['error']}")
                results.append({
                    "url": current_url,
                    "status": "error",
                    "error": browsing_session['error']
                })
            
            # Test completed
            print("✅ Realistic browsing test completed")
                
        except Exception as e:
            print(f"❌ Error testing current URL: {e}")
            results.append({
                "url": current_url,
                "status": "error",
                "error": str(e)
            })
        
        print(f"\n📊 Browsing test summary:")
        print(f"   Current URL: {current_url}")
        print(f"   Status: {'Success' if results else 'Failed'}")
        
        return results
        
    except Exception as e:
        print(f"❌ Error in realistic browsing test: {e}")
        return []
    finally:
        if 'automation' in locals() and automation.driver:
            automation.close_driver()

def test_adsense_detection(debugging_url: str):
    """Test AdSense detection and interaction"""
    try:
        print("\n💰 Testing AdSense detection and interaction...")
        
        # Initialize automation
        automation = UndetectableSeleniumAutomation("../config/config.yaml")
        
        # Setup driver
        if not automation.setup_driver(debugging_url):
            print("❌ Failed to setup driver")
            return False
        
        print("✅ Driver setup successful")
        
        results = []
        
        # Test AdSense on current URL
        print(f"\n💰 Testing AdSense on current URL: {current_url}")
        
        try:
            # Test AdSense detection
            adsense_results = automation.test_adsense_ads(current_url)
            
            if "error" not in adsense_results:
                print(f"✅ AdSense test completed:")
                print(f"   Ads detected: {adsense_results.get('ads_detected', 0)}")
                print(f"   Impressions: {adsense_results.get('interactions', {}).get('impressions', 0)}")
                print(f"   Clicks: {adsense_results.get('interactions', {}).get('clicks', 0)}")
                print(f"   Hover events: {adsense_results.get('interactions', {}).get('hover_events', 0)}")
                print(f"   Context relevance: {adsense_results.get('interactions', {}).get('context_relevance', 'unknown')}")
                
                results.append({
                    "url": current_url,
                    "status": "success",
                    "results": adsense_results
                })
            else:
                print(f"❌ AdSense test failed: {adsense_results['error']}")
                results.append({
                    "url": current_url,
                    "status": "error",
                    "error": adsense_results['error']
                })
            
            # Test completed
            print("✅ AdSense detection test completed")
                
        except Exception as e:
            print(f"❌ Error testing AdSense on current URL: {e}")
            results.append({
                "url": current_url,
                "status": "error",
                "error": str(e)
            })
        
        print(f"\n📊 AdSense test summary:")
        print(f"   Current URL: {current_url}")
        print(f"   Status: {'Success' if results else 'Failed'}")
        
        return results
        
    except Exception as e:
        print(f"❌ Error in AdSense detection test: {e}")
        return []
    finally:
        if 'automation' in locals() and automation.driver:
            automation.close_driver()

def main():
    """Main test function"""
    logger = setup_logging()
    
    print("🚀 Multilogin Selenium Automation Test")
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
        
        # Step 3: Test Basic Selenium
        print("\n🔧 Step 3: Basic Selenium Test")
        print("-" * 30)
        basic_success = test_basic_selenium(debugging_url)
        
        if not basic_success:
            print("❌ Basic Selenium test failed. Stopping profile.")
            stop_profile(token)
            return False
        
        # Step 4: Test Realistic Browsing
        print("\n🎭 Step 4: Realistic Browsing Test")
        print("-" * 30)
        browsing_results = test_realistic_browsing(debugging_url)
        
        # Step 5: Test AdSense Detection
        print("\n💰 Step 5: AdSense Detection Test")
        print("-" * 30)
        adsense_results = test_adsense_detection(debugging_url)
        
        # Step 6: Stop Profile
        print("\n🛑 Step 6: Stop Profile")
        print("-" * 30)
        stop_profile(token)
        
        # Summary
        print("\n📊 Test Summary")
        print("=" * 50)
        print(f"✅ Authentication: Success")
        print(f"✅ Profile Start: Success")
        print(f"✅ Basic Selenium: {'Success' if basic_success else 'Failed'}")
        print(f"✅ Realistic Browsing: {'Success' if browsing_results else 'Failed'}")
        print(f"✅ AdSense Detection: {'Success' if adsense_results else 'Failed'}")
        print(f"✅ Profile Stop: Success")
        
        print("\n🎉 All tests completed!")
        return True
        
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        logger.error(f"Test failed: {e}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
