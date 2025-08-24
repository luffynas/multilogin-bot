#!/usr/bin/env python3
"""
Real-Time AdSense Detection Test Script
========================================

This script specifically tests the real-time ad detection system
during scrolling on maxgaming.biz.id to verify if ads are detected correctly.
"""

import sys
import os
import time
import logging
import requests
import json
import random
from datetime import datetime

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
    """Setup logging for the test"""
    log_format = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    logging.basicConfig(
        level=logging.INFO,
        format=log_format,
        handlers=[
            logging.FileHandler('../logs/realtime_ad_test.log'),
            logging.StreamHandler()
        ]
    )
    return logging.getLogger(__name__)

def signin():
    """Authenticate with Multilogin API"""
    try:
        api = MultiloginXAPI("../config/config.yaml")
        if not api.authenticate():
            raise Exception("Authentication failed")
        return api.bearer_token
    except Exception as e:
        print(f"❌ Login error: {e}")
        return None

def start_profile(token):
    """Start Multilogin profile"""
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

def main():
    """Main test function"""
    print("🔥 REAL-TIME AD DETECTION TEST")
    print("=" * 50)
    
    try:
        # Setup logging
        logger = setup_logging()
        
        # Authenticate
        print("🔐 Authenticating with Multilogin X...")
        token = signin()
        if not token:
            print("❌ Authentication failed")
            return
        
        # Start profile
        print("🚀 Starting profile...")
        debugging_url = start_profile(token)
        if not debugging_url:
            print("❌ Failed to start profile")
            return
        
        # Wait for profile to be ready
        time.sleep(10)
        
        # Initialize automation
        print("🔧 Initializing Selenium automation...")
        automation = UndetectableSeleniumAutomation("../config/config.yaml")
        
        # Connect to profile
        print("🔗 Connecting to profile...")
        automation.setup_driver(debugging_url)
        
        # Wait for page to load
        time.sleep(5)
        
        # Get current URL
        current_url = automation.driver.current_url
        print(f"🌐 Current URL: {current_url}")
        
        # 🔥 REAL-TIME AD DETECTION TEST
        print("🔥 STARTING REAL-TIME AD DETECTION TEST")
        print("=" * 50)
        
        # Test 1: Setup real-time observer
        print("📋 Test 1: Setting up real-time ad observer...")
        automation._setup_realtime_ad_observer()
        
        # Test 2: Perform scrolling with real-time detection
        print("📋 Test 2: Performing scrolling with real-time detection...")
        scroll_result = automation._perform_scrolling_with_realtime_detection()
        print(f"📊 Scroll result: {scroll_result}")
        
        # Test 3: Get all detected ads from observer
        print("📋 Test 3: Getting all detected ads from observer...")
        realtime_ads = automation._get_all_detected_ads_from_observer()
        print(f"🎯 Real-time ads detected: {len(realtime_ads)}")
        
        for i, ad in enumerate(realtime_ads):
            print(f"  Ad {i+1}: {ad['unique_id']} - {ad['rect']['width']}x{ad['rect']['height']}")
        
        # Test 4: Traditional detection for comparison
        print("📋 Test 4: Traditional ad detection for comparison...")
        traditional_result = automation._detect_adsense_ads()
        print(f"🎯 Traditional detection result: {traditional_result}")
        
        # Test 5: Manual scrolling test
        print("📋 Test 5: Manual scrolling test...")
        page_height = automation.driver.execute_script("return document.body.scrollHeight;")
        viewport_height = automation.driver.execute_script("return window.innerHeight;")
        
        print(f"📏 Page height: {page_height}, Viewport: {viewport_height}")
        
        if page_height > viewport_height:
            # Perform manual scrolling with ad detection
            detected_ads = set()
            scroll_steps = 5
            scroll_distance = (page_height - viewport_height) // scroll_steps
            
            for step in range(scroll_steps):
                current_position = (step + 1) * scroll_distance
                print(f"📜 Manual scroll step {step+1}/{scroll_steps}: {current_position}px")
                
                # Scroll
                automation.driver.execute_script(f"window.scrollTo({{top: {current_position}, behavior: 'smooth'}});")
                time.sleep(2)
                
                # Check for new ads
                new_ads = automation._detect_new_ads_in_viewport(detected_ads)
                if new_ads:
                    print(f"🎯 Step {step+1}: Found {len(new_ads)} new ads!")
                    for ad_info in new_ads:
                        detected_ads.add(ad_info['unique_id'])
                        print(f"  New ad: {ad_info['unique_id']} - {ad_info['rect']['width']}x{ad_info['rect']['height']}")
                else:
                    print(f"📭 Step {step+1}: No new ads found")
                
                time.sleep(1)
            
            print(f"✅ Manual scrolling completed. Total unique ads: {len(detected_ads)}")
        
        # Summary
        print("📊 REAL-TIME AD DETECTION TEST SUMMARY")
        print("=" * 50)
        print(f"🎯 Real-time ads detected: {len(realtime_ads)}")
        print(f"📜 Scroll positions tested: {scroll_result.get('scroll_positions', 0)}")
        print(f"🌐 Target URL: {current_url}")
        print(f"📏 Page dimensions: {page_height}x{viewport_height}")
        
        if realtime_ads:
            print("✅ SUCCESS: Real-time ad detection is working!")
        else:
            print("⚠️  WARNING: No ads detected with real-time system")
            print("💡 This could mean:")
            print("   - No ads are present on the page")
            print("   - Ads are loaded differently")
            print("   - Selectors need adjustment")
        
        # Cleanup
        print("🧹 Cleaning up...")
        automation.close_driver()
        
        # Close browser completely
        print("🔒 Closing browser...")
        try:
            automation.driver.quit()
        except:
            pass
        
        print("✅ Test completed successfully!")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        print(traceback.format_exc())
        
        # Ensure browser is closed even on error
        print("🔒 Force closing browser...")
        try:
            if 'automation' in locals() and hasattr(automation, 'driver') and automation.driver:
                automation.driver.quit()
        except:
            pass

if __name__ == "__main__":
    main()
