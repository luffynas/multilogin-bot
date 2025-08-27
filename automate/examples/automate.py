#!/usr/bin/env python3
"""
Clean Automation Example
=======================
Simplified version of comprehensive automation demo with clean structure
"""

import sys
import os
import time
import logging
import json
import random
import argparse
import concurrent.futures
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed

# Add src to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from multilogin_api import MultiloginXAPI
from selenium_automation import UndetectableSeleniumAutomation
from url_helper import setup_url_for_automation


# Configuration
CONFIG_PATH = "../config/config.yaml"
PROFILE_DATA_PATH = "../config/profile.json"
FOLDER_ID = "94caeb51-cc7f-477d-a6db-c79e696b5530"
PROFILE_ID = "2ebdd8cb-0ba2-418d-90e1-02efe5ef92f6"
GOOGLE_SEARCH_QUERY = "site:maxgaming.biz.id play smart"

random_urls = [
    "https://maxgaming.biz.id/crypto-investment-product-for-gamers-the-future-of-digital-wealth-in-the-united-states/",
    "https://maxgaming.biz.id/order-nft-characters-in-p2e-games-the-complete-guide-for-u-s-gamers-and-investors/",
    "https://maxgaming.biz.id/checkout-p2e-game-marketplace-a-complete-guide-for-u-s-gamers-and-investors/",
    "https://maxgaming.biz.id/cart-nft-items-play-to-earn-the-ultimate-guide-for-u-s-gamers-and-investors/",
    "https://maxgaming.biz.id/crypto-trading-service-for-play-to-earn-a-comprehensive-guide-for-u-s-gamers-and-investors/",
    "https://maxgaming.biz.id/defi-solution-for-nft-games-unlocking-the-future-of-play-to-earn-in-the-united-states/",
    "https://maxgaming.biz.id/purchase-ethereum-for-gaming-a-complete-guide-for-u-s-gamers-and-investors/",
    "https://maxgaming.biz.id/play-to-earn-insurance-service-protecting-u-s-gamers-in-the-blockchain-era/",
    "https://maxgaming.biz.id/crypto-gaming-marketing-advertising-solution-driving-growth-for-play-to-earn-platforms-in-the-u-s/",
    "https://maxgaming.biz.id/lawyer-service-for-nft-scams-protecting-your-digital-assets-in-the-united-states/",
    "https://maxgaming.biz.id/online-banking-for-play-to-earn-payments-a-secure-financial-future-for-u-s-gamers/",
]

# Load config for launcher and localhost
import yaml
with open(CONFIG_PATH, 'r') as f:
    config = yaml.safe_load(f)

MLX_LAUNCHER_V2 = config.get('multilogin', {}).get('launcher_v2', 'https://launcher.mlx.yt:45001/api/v1')
LOCALHOST = config.get('multilogin', {}).get('localhost', 'http://127.0.0.1:19995')



def load_profile_data():
    """Load profile data from JSON file"""
    try:
        with open(PROFILE_DATA_PATH, 'r') as f:
            profiles = json.load(f)
        return profiles
    except Exception as e:
        print(f"❌ Error loading profile data: {e}")
        return []

def select_profiles_for_testing(profiles, count=3):
    """Select diverse profiles for testing"""
    # Filter profiles by different characteristics
    mobile_profiles = [p for p in profiles if p.get('os_type') == 'android']
    desktop_profiles = [p for p in profiles if p.get('os_type') in ['windows', 'macos']]
    
    selected_profiles = []
    
    # Select 1 mobile profile
    if mobile_profiles:
        selected_profiles.append(mobile_profiles[0])
    
    # Select 2 desktop profiles (different OS)
    windows_profiles = [p for p in desktop_profiles if p.get('os_type') == 'windows']
    macos_profiles = [p for p in desktop_profiles if p.get('os_type') == 'macos']
    
    if windows_profiles:
        selected_profiles.append(windows_profiles[0])
    if macos_profiles and len(selected_profiles) < count:
        selected_profiles.append(macos_profiles[0])
    
    # Fill remaining slots if needed
    while len(selected_profiles) < count and desktop_profiles:
        for profile in desktop_profiles:
            if profile not in selected_profiles:
                selected_profiles.append(profile)
                break
    
    return selected_profiles[:count]

def parse_arguments():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(description='Clean Automation Example')
    parser.add_argument('--profile', type=str, help='Profile ID to use for automation')
    parser.add_argument('--folder', type=str, help='Folder ID to use for automation')
    parser.add_argument('--config', type=str, default=CONFIG_PATH, help='Path to config file')
    parser.add_argument('--concurrent', action='store_true', help='Run concurrent automation with multiple profiles')
    parser.add_argument('--workers', type=int, default=3, help='Number of concurrent workers')
    parser.add_argument('--profiles', nargs='+', help='Specific profile IDs for concurrent mode')
    return parser.parse_args()



def signin(config_path=None):
    """Authenticate with Multilogin API"""
    try:
        config_path = config_path or CONFIG_PATH
        api = MultiloginXAPI(config_path)
        if not api.authenticate():
            raise Exception("Authentication failed")
        return api.bearer_token
    except Exception as e:
        print(f"❌ Login error: {e}")
        return None

def start_profile(token, folder_id, profile_id, fresh_start=True, use_start_url=True):
    """Start Multilogin profile with optional fresh start and start URL"""
    try:
        headers = {"Accept": "application/json", "Content-Type": "application/json"}
        headers["Authorization"] = f"Bearer {token}"
        
        # Add fresh start parameters
        params = {
            "automation_type": "selenium"
        }
        
        if fresh_start:
            params.update({
                "clear_cache": "true",
                "clear_cookies": "true",
                "clear_storage": "true",
                "reset_state": "true"
            })
            print(f"🔄 Starting profile with fresh state: {profile_id}")
        else:
            print(f"📂 Starting profile with existing state: {profile_id}")
        
        # Add parameter to use Start URL from Multilogin profile
        if use_start_url:
            params.update({
                "use_start_url": "true"
            })
            print(f"🌐 Using Start URL from Multilogin profile: {profile_id}")
        
        start_url = f"{MLX_LAUNCHER_V2}/profile/f/{folder_id}/p/{profile_id}/start"
        
        import requests
        response = requests.get(start_url, headers=headers, params=params)
        
        print(f"🔍 Response status: {response.status_code}")
        print(f"🔍 Response content: {response.text[:200]}...")
        
        if response.status_code != 200:
            print(f"❌ API Error: {response.status_code} - {response.text}")
            return None
        
        try:
            profile_data = response.json()
            print(f"🔍 Profile data keys: {list(profile_data.keys())}")
            
            # Handle different response structures
            if "data" in profile_data and "port" in profile_data["data"]:
                selenium_port = profile_data["data"]["port"]
            elif "port" in profile_data:
                selenium_port = profile_data["port"]
            elif "status" in profile_data and "message" in profile_data["status"]:
                # Port is in status.message
                selenium_port = profile_data["status"]["message"]
            else:
                print(f"❌ No port found in response: {profile_data}")
                return None
            
            debugging_url = f"{LOCALHOST}:{selenium_port}"
            
            print(f"✅ Profile started: {debugging_url}")
            return debugging_url
            
        except Exception as e:
            print(f"❌ Error parsing response: {e}")
            print(f"🔍 Raw response: {response.text}")
            return None
        
    except Exception as e:
        print(f"❌ Start profile error: {e}")
        return None

def stop_profile(token, profile_id):
    """Stop Multilogin profile properly"""
    try:
        headers = {"Accept": "application/json", "Content-Type": "application/json"}
        headers["Authorization"] = f"Bearer {token}"
        
        stop_url = f"{MLX_LAUNCHER_V2}/profile/stop/p/{profile_id}"
        
        import requests
        response = requests.get(stop_url, headers=headers)
        
        if response.status_code == 200:
            print(f"✅ Profile stopped successfully: {profile_id}")
            return True
        else:
            print(f"⚠️ Warning: Failed to stop profile {profile_id} (status: {response.status_code})")
            return False
            
    except Exception as e:
        print(f"❌ Error stopping profile {profile_id}: {e}")
        return False

def run_single_profile_concurrent(profile_data, config_path, session_id, folder_id):
    """Run automation for a single profile in concurrent mode with enhanced error handling"""
    profile_id = profile_data['id']
    profile_name = profile_data['name']
    os_type = profile_data.get('os_type', 'unknown')
    
    print(f"🚀 Starting Profile {session_id}: {profile_name} ({os_type})")
    print(f"   📋 Profile ID: {profile_id}")
    
    token = None
    automation = None
    
    try:
        # Step 1: Authenticate with retry
        token = signin(config_path)
        if not token:
            raise Exception("Authentication failed")
        
        # Step 2: Start profile without fresh start to preserve existing URL
        debugging_url = start_profile(token, folder_id, profile_id, fresh_start=False, use_start_url=True)
        if not debugging_url:
            raise Exception("Failed to start profile")
        
        # Step 3: Setup automation with retry mechanism
        automation = UndetectableSeleniumAutomation(config_path, profile_id, os_type)
        
        # Retry setup driver up to 3 times
        max_retries = 3
        for attempt in range(max_retries):
            try:
                if automation.setup_driver(debugging_url):
                    break
                else:
                    if attempt < max_retries - 1:
                        print(f"   🔄 Retry {attempt + 1}/{max_retries}: Setup driver failed, retrying...")
                        time.sleep(2)
                    else:
                        raise Exception("Failed to setup driver after all retries")
            except Exception as e:
                if attempt < max_retries - 1:
                    print(f"   🔄 Retry {attempt + 1}/{max_retries}: {e}, retrying...")
                    time.sleep(2)
                else:
                    raise e
        
        # Load config for fallback URL
        with open(config_path, 'r') as f:
            config_data = yaml.safe_load(f)
        
        # Start with realistic Google search simulation
        print(f"   🚀 Starting with Google search simulation...")
        target_url = random.choice(random_urls)
        current_url = automation.simulate_google_search_and_click(GOOGLE_SEARCH_QUERY, target_url)
        if not current_url:
            print(f"   ⚠️ Google search simulation failed")
            raise Exception("Failed to reach target site")
        
        if not current_url:
            raise Exception("Failed to reach target site")
        
        print(f"   ✅ Successfully reached target site: {current_url}")
        
        print(f"   ✅ Automation setup successful: {current_url}")
        

        
        # Step 4: Run automation demos with error handling
        print(f"   🎭 Running automation demos...")
        
        # Demo personality system
        print(f"   🎭 Testing personality system...")
        try:
            automation._simulate_attention_span_variation()
            automation._simulate_reading_speed_variation()
        except Exception as e:
            print(f"   ⚠️ Personality system error (non-critical): {e}")
        
        # Demo navigation with multiple pages
        print(f"   🧭 Testing navigation with multiple pages...")
        try:
            automation._simulate_natural_scrolling()
        except Exception as e:
            print(f"   ⚠️ Navigation error (non-critical): {e}")
        
        # Navigate to multiple pages (3-5 pages total) with error handling
        pages_visited = 1  # Current page
        max_pages = random.randint(3, 5)
        
        print(f"   📄 Target: {max_pages} pages total")
        
        while pages_visited < max_pages:
            try:
                # Try to navigate to next/previous page
                next_url = automation._navigate_previous_next()
                
                if next_url:
                    print(f"   🔄 Navigating to page {pages_visited + 1}/{max_pages}")
                    automation.driver.get(next_url)
                    time.sleep(random.uniform(2, 4))  # Wait for page load
                    
                    # Simulate behavior on new page
                    try:
                        automation._simulate_natural_scrolling()
                        automation._simulate_mouse_movement()
                    except Exception as e:
                        print(f"   ⚠️ Page behavior error (non-critical): {e}")
                    
                    pages_visited += 1
                else:
                    # Try random navigation if prev/next not available
                    random_url = automation._navigate_random_page()
                    if random_url:
                        print(f"   🎲 Navigating to random page {pages_visited + 1}/{max_pages}")
                        automation.driver.get(random_url)
                        time.sleep(random.uniform(2, 4))
                        
                        # Simulate behavior on new page
                        try:
                            automation._simulate_natural_scrolling()
                            automation._simulate_mouse_movement()
                        except Exception as e:
                            print(f"   ⚠️ Random page behavior error (non-critical): {e}")
                        
                        pages_visited += 1
                    else:
                        print(f"   ⚠️ No more navigation links found, stopping at {pages_visited} pages")
                        break
            except Exception as e:
                print(f"   ⚠️ Navigation error (non-critical): {e}")
                break
        
        print(f"   ✅ Visited {pages_visited} pages total")
        
        # Demo AdSense integration with RPM optimization
        print(f"   💰 Testing AdSense integration with RPM optimization...")
        try:
            adsense_results = automation.test_adsense_ads()
            if "error" not in adsense_results:
                ads_found = adsense_results.get('ads_detected', 0)
                print(f"   ✅ Found {ads_found} ads")
                
                # Smart Ad Interaction for RPM
                print(f"   🎯 Testing Smart Ad Interaction for RPM...")
                try:
                    rpm_results = automation._smart_ad_interaction_for_rpm()
                    if "error" not in rpm_results:
                        commercial_category = rpm_results.get('commercial_category', 'none')
                        commercial_score = rpm_results.get('commercial_score', 0)
                        click_probability = rpm_results.get('click_probability', 0)
                        print(f"   💎 Commercial intent: {commercial_category} (score: {commercial_score})")
                        print(f"   🎯 Click probability: {click_probability*100:.1f}%")
                except Exception as e:
                    print(f"   ⚠️ RPM interaction error (non-critical): {e}")
        except Exception as e:
            print(f"   ⚠️ AdSense integration error (non-critical): {e}")
        
        # Demo Professional User Behavior
        print(f"   👔 Testing Professional User Behavior...")
        try:
            automation._simulate_professional_user_behavior()
        except Exception as e:
            print(f"   ⚠️ Professional behavior error (non-critical): {e}")
        
        # Demo Extended Session Behavior
        print(f"   ⏰ Testing Extended Session Behavior...")
        try:
            session_config = automation._simulate_extended_session_behavior()
            if "error" not in session_config:
                duration = session_config.get('duration', 0)
                page_views = session_config.get('page_views', 0)
                print(f"   📊 Extended session: {duration/60:.1f}min, {page_views} pages")
        except Exception as e:
            print(f"   ⚠️ Extended session error (non-critical): {e}")
        
        # Demo advanced features
        print(f"   🚀 Testing advanced features...")
        try:
            automation._simulate_mouse_movement()
            automation._simulate_link_hovering()
        except Exception as e:
            print(f"   ⚠️ Advanced features error (non-critical): {e}")
        
        # Demo click simulation
        print(f"   🖱️ Testing click simulation...")
        try:
            automation._simulate_natural_click()
        except Exception as e:
            print(f"   ⚠️ Click simulation error (non-critical): {e}")
        
        # Demo ad interaction with realistic click probability
        try:
            if adsense_results and adsense_results.get('ads_detected', 0) > 0:
                print(f"   🎯 Testing ad interaction...")
                # Very low probability click (realistic)
                click_probability = 0.001  # 0.1% chance
                if random.random() < click_probability:
                    print(f"   ✅ Deciding to click ad (realistic probability)")
                    # Note: Actual click is handled in selenium_automation.py
                else:
                    print(f"   ❌ Deciding not to click (realistic behavior)")
        except Exception as e:
            print(f"   ⚠️ Ad interaction error (non-critical): {e}")
        
        # Record session data
        session_data = {
            "profile_id": profile_id,
            "profile_name": profile_name,
            "os_type": os_type,
            "device_type": automation.device_type,
            "personality": automation.user_personality,
            "session_id": session_id,
            "timestamp": datetime.now().isoformat(),
            "status": "completed",
            "url": current_url,
            "pages_visited": pages_visited,
    
        }
        
        # Save session data
        os.makedirs("../data", exist_ok=True)
        session_file = f"../data/concurrent_session_{session_id}_{profile_id[:8]}.json"
        with open(session_file, 'w') as f:
            json.dump(session_data, f, indent=2)
        
        print(f"   ✅ Profile {session_id} completed successfully!")
        print(f"   💾 Session data saved: {session_file}")
        
        return {
            "session_id": session_id,
            "profile_id": profile_id,
            "profile_name": profile_name,
            "device_type": automation.device_type,
            "personality": automation.user_personality,
            "status": "success",
            "pages_visited": pages_visited
        }
        
    except Exception as e:
        print(f"   ❌ Profile {session_id} failed: {e}")
        return {
            "session_id": session_id,
            "profile_id": profile_id,
            "profile_name": profile_name,
            "status": "failed",
            "error": str(e)
        }
        
    finally:
        # Enhanced cleanup - always execute
        print(f"   🧹 Cleaning up Profile {session_id}...")
        
        # Cleanup automation driver
        if automation and automation.driver:
            try:
                automation.close_driver()
                print(f"   ✅ Driver closed for Profile {session_id}")
            except Exception as e:
                print(f"   ⚠️ Error closing driver for Profile {session_id}: {e}")
        
        # Stop profile in Multilogin
        if token and profile_id:
            try:
                stop_success = stop_profile(token, profile_id)
                if stop_success:
                    print(f"   ✅ Profile stopped in Multilogin: {profile_id}")
                else:
                    print(f"   ⚠️ Failed to stop profile in Multilogin: {profile_id}")
            except Exception as e:
                print(f"   ⚠️ Error stopping profile in Multilogin: {e}")
        
        print(f"   ✅ Cleanup completed for Profile {session_id}")

class CleanAutomation:
    """Clean automation example with simplified structure"""
    
    def __init__(self, profile_id=None, folder_id=None, config_path=None, os_type="windows"):
        """Initialize automation with optional parameters"""
        self.profile_id = profile_id or PROFILE_ID
        self.folder_id = folder_id or FOLDER_ID
        self.config_path = config_path or CONFIG_PATH
        self.os_type = os_type  # Add OS type parameter
        
        self.api = None
        self.automation = None
        self.debugging_url = None
        self.session_data = {
            "start_time": datetime.now(),
            "personality": None,
            "pages_visited": [],
            "interactions": [],
            "errors": []
        }
        self.logger = self._setup_logging()
    
    def _setup_logging(self):
        """Setup logging"""
        log_format = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        logging.basicConfig(
            level=logging.INFO,
            format=log_format,
            handlers=[
                logging.FileHandler('../logs/clean_automation.log'),
                logging.StreamHandler()
            ]
        )
        return logging.getLogger(__name__)
    
    def authenticate(self):
        """Authenticate with Multilogin API"""
        try:
            self.logger.info("🔐 Authenticating with Multilogin API...")
            
            # Use the signin function with config path
            token = signin(self.config_path)
            if not token:
                raise Exception("Authentication failed")
            
            # Create API instance
            self.api = MultiloginXAPI(self.config_path)
            self.api.bearer_token = token
            
            self.logger.info("✅ Authentication successful")
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Authentication failed: {e}")
            return False
    
    def start_profile(self):
        """Start Multilogin profile"""
        try:
            self.logger.info("🚀 Starting Multilogin profile...")
            self.logger.info(f"Using Profile ID: {self.profile_id}")
            self.logger.info(f"Using Folder ID: {self.folder_id}")
            
            # Use the start_profile function with token and parameters (no fresh start to preserve existing URL)
            self.debugging_url = start_profile(self.api.bearer_token, self.folder_id, self.profile_id, fresh_start=False, use_start_url=True)
            
            if not self.debugging_url:
                raise Exception("Failed to start profile")
            
            self.logger.info(f"✅ Profile started: {self.debugging_url}")
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Failed to start profile: {e}")
            return False
    
    def setup_automation(self):
        """Setup Selenium automation"""
        try:
            self.logger.info("🔧 Setting up Selenium automation...")
            
            # Pass profile ID and OS type to automation for consistent behavior
            self.automation = UndetectableSeleniumAutomation(self.config_path, self.profile_id, self.os_type)
            
            if not self.automation.setup_driver(self.debugging_url):
                raise Exception("Failed to setup driver")
            
            # Start with realistic Google search simulation
            self.logger.info("🚀 Starting with Google search simulation...")
            target_url = random.choice(random_urls)
            final_url = self.automation.simulate_google_search_and_click(GOOGLE_SEARCH_QUERY, target_url)
            if not final_url:
                self.logger.warning("⚠️ Google search simulation failed, using fallback")
                # Fallback to direct navigation
                self.automation.driver.get("https://maxgaming.biz.id")
                final_url = "https://maxgaming.biz.id"
            
            # Use the final URL from Google search simulation
            current_url = final_url
            
            if not current_url:
                raise Exception("Failed to reach target site")
            
            self.logger.info(f"✅ Successfully reached target site: {current_url}")
            
            # Record session data
            self.session_data["personality"] = self.automation.user_personality
            self.session_data["pages_visited"].append({
                "url": current_url,
                "timestamp": datetime.now().isoformat(),
                "title": self.automation.driver.title
            })
            
            self.logger.info(f"✅ Automation setup successful: {current_url}")
            

            
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Automation setup failed: {e}")
            self.session_data["errors"].append({"type": "setup", "error": str(e)})
            return False
    
    def demo_personality_system(self):
        """Demo personality system with clean structure"""
        try:
            self.logger.info("🎭 Demo: Personality System")
            
            # Test single personality for clarity
            personality = "explorer"
            self.automation.user_personality = personality
            self.session_data["personality"] = personality
            
            self.logger.info(f"🎭 Testing {personality.upper()} personality...")
            
            # Run personality-specific behaviors
            self._demo_personality_behaviors(personality)
            
            self.logger.info(f"✅ {personality} personality demo completed")
            
        except Exception as e:
            self.logger.error(f"❌ Personality demo failed: {e}")
            self.session_data["errors"].append({"type": "personality_demo", "error": str(e)})
    
    def _demo_personality_behaviors(self, personality):
        """Demo personality-specific behaviors"""
        behaviors = [
            ("scrolling", "🔄 Natural scrolling"),
            ("reading", "📖 Reading behavior"),
            ("mouse", "🖱️ Mouse interactions"),
            ("typing", "⌨️ Typing simulation")
        ]
        
        for behavior_type, description in behaviors:
            try:
                self.logger.info(f"  {description}...")
                
                if behavior_type == "scrolling":
                    self.automation._simulate_natural_scrolling()
                elif behavior_type == "reading":
                    self.automation._simulate_reading_behavior()
                elif behavior_type == "mouse":
                    self.automation._simulate_mouse_movement()
                    self.automation._simulate_link_hovering()
                elif behavior_type == "typing":
                    self.automation._simulate_realistic_typing()
                
                # Record interaction
                self.session_data["interactions"].append({
                    "type": behavior_type,
                    "personality": personality,
                    "timestamp": datetime.now().isoformat()
                })
                
                time.sleep(1)  # Brief pause between behaviors
                
            except Exception as e:
                self.logger.error(f"    ❌ {behavior_type} failed: {e}")
    
    def demo_navigation(self):
        """Demo navigation functionality with multiple pages"""
        try:
            self.logger.info("🧭 Demo: Navigation System")
            
            # Navigate to multiple pages (3-5 pages total)
            pages_visited = 1  # Current page
            max_pages = random.randint(3, 5)
            
            self.logger.info(f"📄 Target: {max_pages} pages total")
            
            while pages_visited < max_pages:
                # Try to navigate to next/previous page
                new_url = self.automation._navigate_previous_next()
                
                if new_url:
                    self.logger.info(f"🔄 Navigating to page {pages_visited + 1}/{max_pages}")
                    self.logger.info(f"✅ Found navigation link: {new_url[:60]}...")
                    
                    # Navigate to new URL
                    self.automation.driver.get(new_url)
                    time.sleep(random.uniform(2, 4))
                    
                    # Record navigation
                    self.session_data["pages_visited"].append({
                        "url": new_url,
                        "timestamp": datetime.now().isoformat(),
                        "title": self.automation.driver.title
                    })
                    
                    # Simulate behavior on new page
                    self._demo_post_navigation_behavior()
                    
                    pages_visited += 1
                else:
                    # Try random navigation if prev/next not available
                    random_url = self.automation._navigate_random_page()
                    if random_url:
                        self.logger.info(f"🎲 Navigating to random page {pages_visited + 1}/{max_pages}")
                        self.logger.info(f"✅ Found random link: {random_url[:60]}...")
                        
                        # Navigate to random URL
                        self.automation.driver.get(random_url)
                        time.sleep(random.uniform(2, 4))
                        
                        # Record navigation
                        self.session_data["pages_visited"].append({
                            "url": random_url,
                            "timestamp": datetime.now().isoformat(),
                            "title": self.automation.driver.title
                        })
                        
                        # Simulate behavior on new page
                        self._demo_post_navigation_behavior()
                        
                        pages_visited += 1
                    else:
                        self.logger.info(f"⚠️ No more navigation links found, stopping at {pages_visited} pages")
                        break
            
            self.logger.info(f"✅ Visited {pages_visited} pages total")
            
        except Exception as e:
            self.logger.error(f"❌ Navigation demo failed: {e}")
            self.session_data["errors"].append({"type": "navigation_demo", "error": str(e)})
    
    def _demo_post_navigation_behavior(self):
        """Demo behavior after navigation"""
        try:
            self.logger.info("    🎯 Post-navigation behavior:")
            
            # Quick page scan
            self.automation._simulate_reading_behavior()
            
            # Natural scrolling
            self.automation._simulate_natural_scrolling()
            
            # Mouse movement
            self.automation._simulate_mouse_movement()
            
        except Exception as e:
            self.logger.error(f"    ❌ Post-navigation behavior failed: {e}")
    
    def demo_adsense_integration(self):
        """Demo AdSense detection and interaction with RPM optimization"""
        try:
            self.logger.info("💰 Demo: AdSense Integration with RPM Optimization")
            
            # Test AdSense detection on current page
            adsense_results = self.automation.test_adsense_ads()
            
            if "error" not in adsense_results:
                ads_found = adsense_results.get('ads_detected', 0)
                self.logger.info(f"✅ Found {ads_found} ads")
                
                # Smart Ad Interaction for RPM
                self.logger.info("🎯 Testing Smart Ad Interaction for RPM...")
                rpm_results = self.automation._smart_ad_interaction_for_rpm()
                if "error" not in rpm_results:
                    commercial_category = rpm_results.get('commercial_category', 'none')
                    commercial_score = rpm_results.get('commercial_score', 0)
                    click_probability = rpm_results.get('click_probability', 0)
                    self.logger.info(f"💎 Commercial intent: {commercial_category} (score: {commercial_score})")
                    self.logger.info(f"🎯 Click probability: {click_probability*100:.1f}%")
                
                if ads_found > 0:
                    self.logger.info("🖱️ Safe ad interaction demo...")
                    self._demo_safe_ad_interaction(adsense_results.get('details', []))
                
                # Record AdSense results with RPM data
                self.session_data["interactions"].append({
                    "type": "adsense",
                    "ads_found": ads_found,
                    "rpm_optimization": rpm_results,
                    "timestamp": datetime.now().isoformat()
                })
            else:
                self.logger.warning(f"⚠️ AdSense detection failed: {adsense_results['error']}")
                
        except Exception as e:
            self.logger.error(f"❌ AdSense demo failed: {e}")
            self.session_data["errors"].append({"type": "adsense", "error": str(e)})
    
    def demo_professional_behavior(self):
        """Demo Professional User Behavior for RPM optimization"""
        try:
            self.logger.info("👔 Demo: Professional User Behavior")
            
            # Simulate professional user behavior
            self.automation._simulate_professional_user_behavior()
            
            # Record professional behavior data
            self.session_data["interactions"].append({
                "type": "professional_behavior",
                "personality": self.automation.user_personality,
                "device_type": self.automation.device_type,
                "timestamp": datetime.now().isoformat()
            })
            
        except Exception as e:
            self.logger.error(f"❌ Professional behavior demo failed: {e}")
            self.session_data["errors"].append({"type": "professional_behavior", "error": str(e)})
    
    def demo_extended_session(self):
        """Demo Extended Session Behavior for RPM optimization"""
        try:
            self.logger.info("⏰ Demo: Extended Session Behavior")
            
            # Simulate extended session behavior
            session_config = self.automation._simulate_extended_session_behavior()
            
            if "error" not in session_config:
                duration = session_config.get('duration', 0)
                page_views = session_config.get('page_views', 0)
                engagement_level = session_config.get('engagement_level', 'medium')
                
                self.logger.info(f"📊 Extended session: {duration/60:.1f}min, {page_views} pages")
                self.logger.info(f"🎯 Engagement level: {engagement_level}")
                
                # Record extended session data
                self.session_data["interactions"].append({
                    "type": "extended_session",
                    "duration_minutes": duration / 60,
                    "page_views": page_views,
                    "engagement_level": engagement_level,
                    "timestamp": datetime.now().isoformat()
                })
            else:
                self.logger.warning(f"⚠️ Extended session error: {session_config.get('error')}")
            
        except Exception as e:
            self.logger.error(f"❌ Extended session demo failed: {e}")
            self.session_data["errors"].append({"type": "extended_session", "error": str(e)})
    
    def _demo_safe_ad_interaction(self, ads):
        """Demo safe ad interaction"""
        try:
            self.logger.info("    🎯 Safe ad interaction simulation...")
            
            for i, ad in enumerate(ads[:2]):  # Limit to 2 ads for demo
                try:
                    self.logger.info(f"      📊 Analyzing ad {i+1}/{min(len(ads), 2)}...")
                    
                    # Simulate reading ad content
                    time.sleep(1)
                    
                    # Simulate mouse hover
                    self.automation._simulate_link_hovering()
                    
                    # Very low probability click (realistic)
                    click_probability = 0.001  # 0.1% chance
                    if random.random() < click_probability:
                        self.logger.info("        ✅ Deciding to click ad (realistic probability)")
                        # Note: Actual click is handled in selenium_automation.py
                    else:
                        self.logger.info("        ❌ Deciding not to click (realistic behavior)")
                    
                except Exception as ad_error:
                    self.logger.error(f"        ⚠️ Ad interaction failed: {ad_error}")
                    continue
            
        except Exception as e:
            self.logger.error(f"    ❌ Safe ad interaction failed: {e}")
    
    def demo_advanced_features(self):
        """Demo advanced automation features"""
        try:
            self.logger.info("🚀 Demo: Advanced Features")
            
            # Demo session memory
            self.logger.info("  🧠 Session memory and continuity...")
            self.session_data["interactions"].append({
                "type": "session_memory",
                "description": "Maintaining personality consistency",
                "timestamp": datetime.now().isoformat()
            })
            
            # Demo time-based behavior
            current_hour = datetime.now().hour
            if 6 <= current_hour < 12:
                self.logger.info("  ⏰ Morning behavior: High energy, fast reading")
            elif 12 <= current_hour < 17:
                self.logger.info("  ⏰ Afternoon behavior: Balanced energy")
            else:
                self.logger.info("  ⏰ Evening behavior: Low energy, slow reading")
            
            # Demo device-specific behavior
            device_type = self.automation.device_type
            self.logger.info(f"  📱 Device-specific behavior: {device_type}")
            
            # Record advanced features
            self.session_data["interactions"].append({
                "type": "advanced_features",
                "hour": current_hour,
                "device_type": device_type,
                "timestamp": datetime.now().isoformat()
            })
            
        except Exception as e:
            self.logger.error(f"❌ Advanced features demo failed: {e}")
            self.session_data["errors"].append({"type": "advanced_features", "error": str(e)})
    
    def save_session_data(self):
        """Save session data to file"""
        try:
            session_file = f"../data/session_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            
            # Ensure data directory exists
            os.makedirs("../data", exist_ok=True)
            
            # Prepare data for JSON serialization
            session_data = self.session_data.copy()
            session_data["end_time"] = datetime.now().isoformat()
            session_data["duration"] = str(datetime.now() - self.session_data["start_time"])
            
            with open(session_file, 'w') as f:
                json.dump(session_data, f, indent=2, default=str)
            
            self.logger.info(f"💾 Session data saved to: {session_file}")
            
        except Exception as e:
            self.logger.error(f"❌ Failed to save session data: {e}")
    
    def print_summary(self):
        """Print session summary"""
        try:
            session_duration = datetime.now() - self.session_data["start_time"]
            total_interactions = len(self.session_data["interactions"])
            total_pages = len(self.session_data["pages_visited"])
            total_errors = len(self.session_data["errors"])
            
            print("\n📊 SESSION SUMMARY")
            print("=" * 50)
            print(f"⏱️  Duration: {session_duration}")
            print(f"🎯 Interactions: {total_interactions}")
            print(f"📄 Pages Visited: {total_pages}")
            print(f"❌ Errors: {total_errors}")
            print(f"🎭 Personality: {self.session_data['personality']}")
            print(f"📱 Device Type: {self.automation.device_type if self.automation else 'N/A'}")
            
        except Exception as e:
            self.logger.error(f"❌ Error printing summary: {e}")
    
    def run_automation(self):
        """Run the complete automation"""
        try:
            self.logger.info("🎯 Starting Clean Automation")
            print("=" * 50)
            
            # Step 1: Authenticate
            if not self.authenticate():
                return False
            
            # Step 2: Start profile
            if not self.start_profile():
                return False
            
            # Step 3: Setup automation
            if not self.setup_automation():
                return False
            
            # Step 4: Run demos
            self.demo_personality_system()
            self.demo_navigation()
            self.demo_adsense_integration()
            self.demo_professional_behavior()
            self.demo_extended_session()
            self.demo_advanced_features()
            
            # Step 5: Save and summarize
            self.save_session_data()
            self.print_summary()
            
            self.logger.info("🎉 Clean Automation Completed Successfully!")
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Automation failed: {e}")
            return False
        finally:
            # Cleanup
            if self.automation and self.automation.driver:
                try:
                    self.automation.close_driver()
                    self.logger.info("🔒 Browser closed")
                except Exception as e:
                    self.logger.error(f"⚠️ Error closing browser: {e}")

def run_concurrent_automation(profile_ids=None, max_workers=3, config_path=CONFIG_PATH, folder_id=FOLDER_ID):
    """Run concurrent automation with queue system - process all profiles with 1-5 concurrent workers"""
    print("🎯 Concurrent Queue Automation")
    print("=" * 60)
    print(f"⏰ Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🔧 Max Workers: {max_workers}")
    
    # Load ALL profile data
    all_profiles = load_profile_data()
    if not all_profiles:
        print("❌ No profiles found!")
        return False
    
    # Select profiles for processing
    if profile_ids:
        # Use specified profile IDs
        profiles_to_process = [p for p in all_profiles if p['id'] in profile_ids]
        if len(profiles_to_process) != len(profile_ids):
            print(f"⚠️ Warning: Only {len(profiles_to_process)} of {len(profile_ids)} profiles found")
    else:
        # Use ALL profiles from the file
        profiles_to_process = all_profiles
        print(f"📋 Processing ALL {len(profiles_to_process)} profiles from profile.json")
    
    if not profiles_to_process:
        print("❌ No profiles to process!")
        return False
    
    print(f"\n📋 Profiles to Process:")
    for i, profile in enumerate(profiles_to_process, 1):
        print(f"   {i:2d}. {profile['name']} ({profile.get('os_type', 'unknown')}) - {profile['id']}")
    
    print(f"\n🚀 Starting queue processing with {max_workers} concurrent workers...")
    print(f"📊 Queue Strategy: Process {len(profiles_to_process)} profiles, {max_workers} at a time")
    
    # Queue system with ThreadPoolExecutor
    results = []
    completed_count = 0
    start_time = time.time()
    
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        # Submit initial batch of tasks
        future_to_profile = {}
        active_profiles = min(max_workers, len(profiles_to_process))
        
        print(f"\n🔄 Submitting initial batch of {active_profiles} profiles...")
        for i in range(active_profiles):
            profile = profiles_to_process[i]
            future = executor.submit(
                run_single_profile_concurrent, 
                profile, 
                config_path, 
                f"session_{i+1:02d}",
                folder_id
            )
            future_to_profile[future] = profile
            print(f"   🚀 Started: {profile['name']} (session_{i+1:02d})")
        
        # Process remaining profiles as workers become available
        next_profile_index = active_profiles
        
        while future_to_profile:
            # Wait for any task to complete
            done, _ = concurrent.futures.wait(
                future_to_profile.keys(), 
                return_when=concurrent.futures.FIRST_COMPLETED
            )
            
            # Process completed tasks
            for future in done:
                profile = future_to_profile.pop(future)
                completed_count += 1
                
                try:
                    result = future.result()
                    results.append(result)
                    status_icon = "✅" if result['status'] == 'success' else "❌"
                    print(f"\n{status_icon} Completed ({completed_count}/{len(profiles_to_process)}): {result['profile_name']} ({result['status']})")
                    
                    if result['status'] == 'success':
                        print(f"   📱 Device: {result['device_type']}")
                        print(f"   🎭 Personality: {result['personality']}")
                        if 'pages_visited' in result:
                            print(f"   📄 Pages visited: {result['pages_visited']}")
                    else:
                        print(f"   💥 Error: {result.get('error', 'Unknown error')}")
                        
                except Exception as e:
                    print(f"\n❌ Exception in {profile['name']}: {e}")
                    results.append({
                        "session_id": "unknown",
                        "profile_id": profile['id'],
                        "profile_name": profile['name'],
                        "status": "exception",
                        "error": str(e)
                    })
                
                # Submit next profile if available
                if next_profile_index < len(profiles_to_process):
                    next_profile = profiles_to_process[next_profile_index]
                    future = executor.submit(
                        run_single_profile_concurrent, 
                        next_profile, 
                        config_path, 
                        f"session_{next_profile_index+1:02d}",
                        folder_id
                    )
                    future_to_profile[future] = next_profile
                    print(f"   🚀 Started: {next_profile['name']} (session_{next_profile_index+1:02d})")
                    next_profile_index += 1
                else:
                    print(f"   📊 Queue: {len(future_to_profile)} profiles still running, {len(profiles_to_process) - completed_count} completed")
    
    # Calculate execution time
    execution_time = time.time() - start_time
    
    # Print summary
    print(f"\n📊 QUEUE AUTOMATION SUMMARY")
    print("=" * 60)
    print(f"⏱️  Total Execution Time: {execution_time:.2f} seconds")
    print(f"📋 Total Profiles Processed: {len(profiles_to_process)}")
    print(f"🔧 Concurrent Workers: {max_workers}")
    print(f"✅ Successful: {len([r for r in results if r['status'] == 'success'])}")
    print(f"❌ Failed: {len([r for r in results if r['status'] != 'success'])}")
    print(f"📈 Success Rate: {len([r for r in results if r['status'] == 'success'])/len(profiles_to_process)*100:.1f}%")
    
    # Enhanced statistics
    successful_results = [r for r in results if r['status'] == 'success']
    if successful_results:
        avg_pages = sum(r.get('pages_visited', 0) for r in successful_results) / len(successful_results)
        print(f"📄 Average Pages per Session: {avg_pages:.1f}")
    
    # Error analysis
    failed_results = [r for r in results if r['status'] != 'success']
    if failed_results:
        print(f"\n🔍 Error Analysis:")
        error_types = {}
        for result in failed_results:
            error = result.get('error', 'Unknown')
            error_key = error.split(':')[0] if ':' in error else error
            error_types[error_key] = error_types.get(error_key, 0) + 1
        
        for error_type, count in error_types.items():
            print(f"   • {error_type}: {count} occurrences")
    
    print(f"\n📈 Individual Results:")
    for i, result in enumerate(results, 1):
        status_icon = "✅" if result['status'] == 'success' else "❌"
        print(f"   {i:2d}. {status_icon} {result['profile_name']}")
        if result['status'] == 'success':
            print(f"      📱 Device: {result['device_type']}")
            print(f"      🎭 Personality: {result['personality']}")
        else:
            print(f"      💥 Error: {result.get('error', 'Unknown error')}")
    
    # Save overall results
    summary_data = {
        "timestamp": datetime.now().isoformat(),
        "execution_time": execution_time,
        "total_profiles": len(profiles_to_process),
        "concurrent_workers": max_workers,
        "successful": len([r for r in results if r['status'] == 'success']),
        "failed": len([r for r in results if r['status'] != 'success']),
        "success_rate": len([r for r in results if r['status'] == 'success'])/len(profiles_to_process)*100,
        "results": results
    }
    
    summary_file = f"../data/queue_summary_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(summary_file, 'w') as f:
        json.dump(summary_data, f, indent=2)
    
    print(f"\n💾 Summary saved: {summary_file}")
    print(f"\n🎉 Queue automation completed!")
    
    return len([r for r in results if r['status'] == 'success']) > 0

def main():
    """Main function"""
    # Parse command line arguments
    args = parse_arguments()
    
    # Check if concurrent mode is requested
    if args.concurrent:
        print("🎯 Concurrent Queue Automation")
        print("=" * 60)
        print("Processing ALL profiles with queue system (1-5 concurrent workers)")
        print("📊 Strategy: When one profile finishes, next profile starts automatically")
        
        # Show parameters being used
        if args.profiles:
            print(f"📋 Using Profile IDs: {args.profiles}")
        else:
            print(f"📋 Using ALL profiles from profile.json")
        if args.workers:
            print(f"🔧 Max Workers: {args.workers}")
        if args.config != CONFIG_PATH:
            print(f"⚙️ Using Config: {args.config}")
        
        # Run concurrent automation with queue system
        success = run_concurrent_automation(
            profile_ids=args.profiles,
            max_workers=args.workers,
            config_path=args.config,
            folder_id=args.folder or FOLDER_ID
        )
        
        if success:
            print("\n🏆 Queue automation completed successfully!")
            print("📋 Features demonstrated:")
            print("  ✅ Queue System (1-5 concurrent workers)")
            print("  ✅ Automatic Profile Rotation")
            print("  ✅ Multi-Profile Authentication")
            print("  ✅ Concurrent Browser Sessions")
            print("  ✅ Device-Specific Behavior")
            print("  ✅ Personality System")
            print("  ✅ Navigation System")
            print("  ✅ AdSense Integration with RPM Optimization")
            print("  ✅ Professional User Behavior")
            print("  ✅ Extended Session Behavior")
            print("  ✅ Advanced Features")
            print("  ✅ Session Data Management")
        else:
            print("\n❌ Queue automation failed")
        
        return success
    else:
        # Single profile mode (original functionality)
        print("🎯 Clean Automation Example")
        print("=" * 50)
        print("Simplified automation with clean structure")
        
        # Show parameters being used
        if args.profile:
            print(f"📋 Using Profile ID: {args.profile}")
        if args.folder:
            print(f"📁 Using Folder ID: {args.folder}")
        if args.config != CONFIG_PATH:
            print(f"⚙️ Using Config: {args.config}")
        
        # Get OS type from profile data if profile is specified
        os_type = "windows"  # Default
        if args.profile:
            # Try to get OS type from profile data
            try:
                profiles = load_profile_data()
                profile_data = next((p for p in profiles if p['id'] == args.profile), None)
                if profile_data:
                    os_type = profile_data.get('os_type', 'windows')
            except Exception as e:
                print(f"⚠️ Could not get OS type from profile data: {e}")
        
        # Create and run automation with parameters
        automation = CleanAutomation(
            profile_id=args.profile,
            folder_id=args.folder,
            config_path=args.config,
            os_type=os_type
        )
        success = automation.run_automation()
        
        if success:
            print("\n🏆 Automation completed successfully!")
            print("📋 Features demonstrated:")
            print("  ✅ Authentication & Profile Management")
            print("  ✅ Selenium Automation Setup")
            print("  ✅ Personality System")
            print("  ✅ Navigation System")
            print("  ✅ AdSense Integration with RPM Optimization")
            print("  ✅ Professional User Behavior")
            print("  ✅ Extended Session Behavior")
            print("  ✅ Advanced Features")
            print("  ✅ Session Data Management")
        else:
            print("\n❌ Automation failed")
        
        return success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
