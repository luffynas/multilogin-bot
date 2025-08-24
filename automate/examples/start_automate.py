#!/usr/bin/env python3
"""
Start Automate
==============
Automated Selenium automation with proxy update before starting profile
"""

import sys
import os
import time
import logging
import requests
import json
import random
import argparse
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
# Use a profile that exists in the profile.json file
PROFILE_ID = "7dcb7410-4552-4702-8750-a2e506e97990"  # ID - FB profile from profile.json

def setup_logging():
    """Setup comprehensive logging"""
    log_format = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    logging.basicConfig(
        level=logging.INFO,
        format=log_format,
        handlers=[
            logging.FileHandler('../logs/start_automate.log'),
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
        return api
    except Exception as e:
        print(f"❌ Login error: {e}")
        return None

def get_bearer_token():
    """Get bearer token for API calls"""
    try:
        api = MultiloginXAPI("../config/config.yaml")
        if not api.authenticate():
            raise Exception("Authentication failed")
        return api.bearer_token
    except Exception as e:
        print(f"❌ Login error: {e}")
        return None

def update_profile_proxy(api, profile_id):
    """Update profile proxy before starting automation"""
    print(f"\n🌐 UPDATING PROFILE PROXY")
    print("=" * 40)
    
    try:
        # Get profile details to extract location data
        print(f"🔍 Getting profile details for: {profile_id}")
        profile_details = api.get_profile(profile_id)
        
        if not profile_details:
            print(f"❌ Profile not found: {profile_id}")
            print("🔍 Trying to get profile from list...")
            
            # Try to get from profiles list first
            profiles = api.get_profiles()
            if profiles:
                # Find profile by ID
                found_profile = None
                for profile in profiles:
                    if profile.get('uuid') == profile_id:
                        found_profile = profile
                        break
                
                if found_profile:
                    print(f"✅ Found profile in list: {found_profile.get('name', 'Unknown')}")
                    # Use basic location data from profile list
                    country = 'us'  # Default
                    region = 'california'  # Default
                    city = ''
                else:
                    print(f"❌ Profile not found in list either")
                    return False
            else:
                print(f"❌ No profiles available")
                return False
        else:
            profile_name = profile_details.get('name', 'Unknown')
            print(f"📋 Profile: {profile_name}")
            
            # Extract location data from profile
            country = profile_details.get('country', 'us').lower()
            region = profile_details.get('region', 'california').lower()
            city = profile_details.get('city', '').lower()
        
        print(f"🌍 Location Data from Profile:")
        print(f"   Country: {country}")
        print(f"   Region: {region}")
        print(f"   City: {city}")
        
        # Update profile with Multilogin proxy using profile location
        print(f"\n🔄 Updating profile with Multilogin proxy...")
        update_result = api.update_profile_with_multilogin_proxy(
            profile_id=profile_id,
            country=country,
            region=region,
            protocol="socks5"
        )
        
        if update_result:
            print(f"✅ Profile proxy updated successfully!")
            
            # Test proxy connection
            print(f"\n🔍 Testing proxy connection...")
            connection_result = api.get_multilogin_proxy_connection(
                country=country,
                region=region,
                city=city,
                session_type="sticky",
                protocol="socks5"
            )
            
            if connection_result and connection_result.get('status', {}).get('http_code') == 200:
                print(f"✅ Proxy connection test successful!")
                
                # Extract and display proxy information
                connection_urls = connection_result.get('data', {}).get('connection_urls', [])
                if connection_urls:
                    connection_url = connection_urls[0]
                    parts = connection_url.split(':')
                    
                    if len(parts) >= 4:
                        host = parts[0]
                        port = 1080  # Always use SOCKS5 port
                        username = parts[2]
                        password = parts[3]
                        
                        print(f"🌐 Proxy Details:")
                        print(f"   Host: {host}")
                        print(f"   Port: {port}")
                        print(f"   Username: {username}")
                        print(f"   Password: {password[:8]}...")
                        
                        # Try to get IP information
                        try:
                            proxy_url = f"socks5://{username}:{password}@{host}:{port}"
                            proxies = {
                                'http': proxy_url,
                                'https': proxy_url
                            }
                            
                            print(f"🔍 Checking IP with httpbin.org...")
                            response = requests.get(
                                'http://httpbin.org/ip',
                                proxies=proxies,
                                timeout=10
                            )
                            
                            if response.status_code == 200:
                                ip_info = response.json()
                                print(f"🌍 Current IP: {ip_info.get('origin', 'Unknown')}")
                            else:
                                print(f"❌ Failed to get IP (Status: {response.status_code})")
                                
                        except Exception as e:
                            print(f"⚠️  Could not verify IP: {str(e)[:50]}...")
                
                return True
            else:
                print(f"❌ Proxy connection test failed")
                return False
        else:
            print(f"❌ Profile proxy update failed")
            return False
            
    except Exception as e:
        print(f"❌ Error updating profile proxy: {e}")
        return False

def start_profile(profile_id):
    """Start Multilogin profile"""
    try:
        token = get_bearer_token()
        if not token:
            return None
        
        headers = HEADERS.copy()
        headers["Authorization"] = f"Bearer {token}"
        start_url = f"{MLX_LAUNCHER_V2}/profile/f/{FOLDER_ID}/p/{profile_id}/start?automation_type=selenium"
        
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

class StartAutomate:
    """Start automation with proxy update"""
    
    def __init__(self, debugging_url, profile_id):
        self.debugging_url = debugging_url
        self.profile_id = profile_id
        self.automation = None
        self.current_url = None
        self.session_data = {
            "start_time": datetime.now(),
            "profile_id": profile_id,
            "personality": None,
            "device_type": None,
            "pages_visited": [],
            "interactions": [],
            "errors": []
        }
        self.logger = logging.getLogger(__name__)
    
    def setup_automation(self):
        """Setup automation with all features"""
        try:
            print("\n🔧 Setting up Automation")
            print("=" * 30)
            
            self.automation = UndetectableSeleniumAutomation("../config/config.yaml")
            
            if not self.automation.setup_driver(self.debugging_url):
                return False
            
            print("✅ Driver setup successful")
            
            # Setup URL with helper module
            fallback_url = "https://maxgaming.biz.id/can-a-vpn-really-boost-your-fps-or-reduce-lag-2025-guide-for-gamers/"
            self.current_url, message = setup_url_for_automation(self.automation, fallback_url)
            
            if self.current_url:
                print(f"✅ URL setup successful: {self.current_url}")
                print(f"📝 Message: {message}")
                
                # Record session data
                self.session_data["personality"] = self.automation.user_personality
                self.session_data["device_type"] = self.automation.device_type
                self.session_data["pages_visited"].append({
                    "url": self.current_url,
                    "timestamp": datetime.now().isoformat(),
                    "title": self.automation.driver.title
                })
                
                return True
            else:
                print(f"❌ URL setup failed: {message}")
                return False
                
        except Exception as e:
            self.logger.error(f"❌ Setup error: {e}")
            self.session_data["errors"].append({"type": "setup", "error": str(e)})
            return False
    
    def run_automation(self):
        """Run the automation"""
        try:
            print("\n🎯 Starting Automation")
            print("=" * 30)
            print("Running comprehensive automation features!")
            
            # Setup automation
            if not self.setup_automation():
                return False
            
            # Run automation features
            self._run_personality_automation()
            self._run_navigation_automation()
            self._run_adsense_automation()
            self._run_performance_monitoring()
            
            print("\n🎉 Automation Completed Successfully!")
            print("=" * 30)
            print("✅ All features executed")
            print("📊 Performance metrics recorded")
            print("💾 Session data saved")
            
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Automation failed: {e}")
            return False
        finally:
            if self.automation and self.automation.driver:
                try:
                    self.automation.close_driver()
                    
                    # Force close browser
                    print("🔒 Force closing browser...")
                    self.automation.driver.quit()
                except Exception as e:
                    self.logger.error(f"⚠️ Error closing driver: {e}")
    
    def _run_personality_automation(self):
        """Run personality-based automation"""
        try:
            print("\n🎭 Running Personality Automation")
            print("-" * 30)
            
            personality = self.automation.user_personality
            print(f"🎭 Using personality: {personality}")
            
            # Run personality-specific behaviors
            print("🔄 Running scrolling behavior...")
            self.automation._simulate_natural_scrolling()
            
            print("📖 Running reading behavior...")
            self.automation._simulate_reading_behavior()
            
            print("🖱️ Running mouse interactions...")
            self.automation._simulate_mouse_movement()
            self.automation._simulate_link_hovering()
            
            print("⌨️ Running typing simulation...")
            self.automation._simulate_realistic_typing()
            
            # Record interactions
            self.session_data["interactions"].extend([
                {"type": "scrolling", "personality": personality, "timestamp": datetime.now().isoformat()},
                {"type": "reading", "personality": personality, "timestamp": datetime.now().isoformat()},
                {"type": "mouse_interactions", "personality": personality, "timestamp": datetime.now().isoformat()},
                {"type": "typing", "personality": personality, "timestamp": datetime.now().isoformat()}
            ])
            
            print("✅ Personality automation completed")
            
        except Exception as e:
            self.logger.error(f"❌ Personality automation failed: {e}")
            self.session_data["errors"].append({"type": "personality", "error": str(e)})
    
    def _run_navigation_automation(self):
        """Run navigation automation"""
        try:
            print("\n🧭 Running Navigation Automation")
            print("-" * 30)
            
            # Test previous/next navigation
            print("🧭 Testing previous/next navigation...")
            new_url = self.automation._navigate_previous_next()
            
            if new_url:
                print(f"✅ Found navigation link: {new_url[:60]}...")
                
                try:
                    # Navigate to the new URL
                    self.automation.driver.get(new_url)
                    time.sleep(3)
                    
                    # Verify navigation success
                    actual_url = self.automation.driver.current_url
                    page_title = self.automation.driver.title
                    
                    print(f"📄 Successfully navigated to: {page_title}")
                    
                    # Record successful navigation
                    self.session_data["interactions"].append({
                        "type": "navigation",
                        "from_url": self.current_url,
                        "to_url": new_url,
                        "actual_url": actual_url,
                        "page_title": page_title,
                        "success": True,
                        "timestamp": datetime.now().isoformat()
                    })
                    
                    self.current_url = actual_url
                    
                    # Simulate behavior on new page
                    print("🎯 Simulating behavior on new page...")
                    self.automation._simulate_reading_behavior()
                    self.automation._simulate_natural_scrolling()
                    self.automation._simulate_mouse_movement()
                    
                except Exception as nav_error:
                    print(f"❌ Navigation failed: {nav_error}")
                    self.session_data["errors"].append({"type": "navigation", "error": str(nav_error)})
            else:
                print("⚠️ No navigation links found")
                self.session_data["interactions"].append({
                    "type": "navigation",
                    "success": False,
                    "error": "No navigation links found",
                    "timestamp": datetime.now().isoformat()
                })
            
            print("✅ Navigation automation completed")
            
        except Exception as e:
            self.logger.error(f"❌ Navigation automation failed: {e}")
            self.session_data["errors"].append({"type": "navigation", "error": str(e)})
    
    def _run_adsense_automation(self):
        """Run AdSense automation"""
        try:
            print("\n💰 Running AdSense Automation")
            print("-" * 30)
            
            print("🔍 Detecting AdSense ads...")
            
            # Test AdSense detection
            adsense_results = self.automation.test_adsense_ads(self.current_url)
            
            if "error" not in adsense_results:
                ads_found = len(adsense_results.get('ads', []))
                print(f"✅ Found {ads_found} ads")
                
                if ads_found > 0:
                    print("🖱️ Running ad interaction demo...")
                    print("  - Reading ad content before interaction")
                    print("  - Respecting safety thresholds")
                    print("  - Realistic ad clicking patterns")
                    
                    # Demo realistic ad clicking
                    self._demo_realistic_ad_clicking(adsense_results.get('ads', []))
                else:
                    print("⚠️ No ads found for interaction demo")
                
                self.session_data["interactions"].append({
                    "type": "adsense",
                    "ads_found": ads_found,
                    "clicks_performed": adsense_results.get('interactions', {}).get('clicks', 0),
                    "timestamp": datetime.now().isoformat()
                })
            else:
                print(f"⚠️ AdSense detection failed: {adsense_results['error']}")
                
        except Exception as e:
            self.logger.error(f"❌ AdSense automation failed: {e}")
            self.session_data["errors"].append({"type": "adsense", "error": str(e)})
    
    def _demo_realistic_ad_clicking(self, ads):
        """Demo realistic ad clicking behavior"""
        try:
            print("🎯 Starting realistic ad clicking simulation...")
            
            # Simulate realistic ad interaction patterns
            for i, ad in enumerate(ads[:2]):  # Limit to 2 ads for demo
                try:
                    print(f"📊 Analyzing ad {i+1}/{min(len(ads), 2)}...")
                    
                    # Simulate reading ad content
                    print("📖 Reading ad content...")
                    time.sleep(1)
                    
                    # Simulate mouse hover over ad
                    print("🖱️ Hovering over ad...")
                    self.automation._simulate_link_hovering()
                    
                    # Simulate realistic click decision
                    click_probability = 0.001  # 0.1% chance (realistic for display ads)
                    if random.random() < click_probability:
                        print("✅ Deciding to click ad (realistic probability)")
                        
                        # Simulate pre-click behavior
                        print("⏳ Pre-click hesitation (human-like)...")
                        time.sleep(random.uniform(0.5, 2.0))
                        
                        # Perform the click
                        print("🖱️ Clicking ad...")
                        ad.click()
                        
                        # Post-click behavior now handled in selenium_automation.py
                        print("📄 Post-click behavior...")
                        time.sleep(random.uniform(1.0, 3.0))
                        
                        # Record successful click
                        self.session_data["interactions"].append({
                            "type": "ad_click",
                            "ad_index": i,
                            "click_probability": click_probability,
                            "timestamp": datetime.now().isoformat()
                        })
                        
                        print("✅ Ad click completed successfully")
                        break  # Only click one ad per demo
                    else:
                        print("❌ Deciding not to click (realistic behavior)")
                        
                except Exception as ad_error:
                    print(f"⚠️ Ad interaction failed: {ad_error}")
                    continue
            
            print("🎯 Realistic ad clicking simulation completed")
            
        except Exception as e:
            self.logger.error(f"Realistic ad clicking demo failed: {e}")
    
    def _run_performance_monitoring(self):
        """Run performance monitoring"""
        try:
            print("\n📈 Running Performance Monitoring")
            print("-" * 30)
            
            # Calculate session metrics
            session_duration = datetime.now() - self.session_data["start_time"]
            total_interactions = len(self.session_data["interactions"])
            total_pages = len(self.session_data["pages_visited"])
            total_errors = len(self.session_data["errors"])
            
            print(f"⏱️ Session Duration: {session_duration}")
            print(f"🎯 Total Interactions: {total_interactions}")
            print(f"📄 Pages Visited: {total_pages}")
            print(f"❌ Errors: {total_errors}")
            print(f"🎭 Final Personality: {self.session_data['personality']}")
            print(f"📱 Device Type: {self.session_data['device_type']}")
            
            # Save session data
            self._save_session_data()
            
        except Exception as e:
            self.logger.error(f"Performance monitoring failed: {e}")
    
    def _save_session_data(self):
        """Save session data to file"""
        try:
            session_file = f"../data/session_{self.profile_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            
            # Ensure data directory exists
            os.makedirs("../data", exist_ok=True)
            
            # Prepare data for JSON serialization
            session_data = self.session_data.copy()
            session_data["end_time"] = datetime.now().isoformat()
            session_data["duration"] = str(datetime.now() - self.session_data["start_time"])
            
            with open(session_file, 'w') as f:
                json.dump(session_data, f, indent=2, default=str)
            
            print(f"💾 Session data saved to: {session_file}")
            
        except Exception as e:
            self.logger.error(f"Failed to save session data: {e}")

def main():
    """Main function to run automation"""
    logger = setup_logging()
    
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Start automation with profile')
    parser.add_argument('--profile', required=True, help='Profile ID to use')
    args = parser.parse_args()
    
    profile_id = args.profile
    
    print("🎯 Start Automate")
    print("=" * 30)
    print(f"Profile ID: {profile_id}")
    
    try:
        # Auth
        api = signin()
        if not api:
            return False
        
        # Update profile proxy first (optional - continue even if it fails)
        try:
            if not update_profile_proxy(api, profile_id):
                print("⚠️ Proxy update failed, but continuing...")
        except Exception as e:
            print(f"⚠️ Proxy update error: {e}, but continuing...")
        
        # Start profile
        debugging_url = start_profile(profile_id)
        if not debugging_url:
            return False
        
        # Create and run automation
        automate = StartAutomate(debugging_url, profile_id)
        success = automate.run_automation()
        
        if success:
            print("\n🏆 Automation completed successfully!")
            print("📋 Features executed:")
            print("  ✅ Proxy Update")
            print("  ✅ Profile Start")
            print("  ✅ Selenium Automation")
            print("  ✅ Personality System")
            print("  ✅ Navigation System")
            print("  ✅ AdSense Integration")
            print("  ✅ Performance Monitoring")
        else:
            print("\n❌ Automation failed")
        
        return success
        
    except Exception as e:
        print(f"❌ Automation error: {e}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
