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
from datetime import datetime

# Add src to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from multilogin_api import MultiloginXAPI
from selenium_automation import UndetectableSeleniumAutomation
from url_helper import setup_url_for_automation

# Configuration
CONFIG_PATH = "../config/config.yaml"
FOLDER_ID = "94caeb51-cc7f-477d-a6db-c79e696b5530"
PROFILE_ID = "2ebdd8cb-0ba2-418d-90e1-02efe5ef92f6"

# Load config for launcher and localhost
import yaml
with open(CONFIG_PATH, 'r') as f:
    config = yaml.safe_load(f)
    MLX_LAUNCHER_V2 = config['multilogin']['launcher_url']
    LOCALHOST = config['multilogin']['localhost']

def signin():
    """Authenticate with Multilogin API"""
    try:
        api = MultiloginXAPI(CONFIG_PATH)
        if not api.authenticate():
            raise Exception("Authentication failed")
        return api.bearer_token
    except Exception as e:
        print(f"❌ Login error: {e}")
        return None

def start_profile(token):
    """Start Multilogin profile"""
    try:
        headers = {"Accept": "application/json", "Content-Type": "application/json"}
        headers["Authorization"] = f"Bearer {token}"
        start_url = f"{MLX_LAUNCHER_V2}/profile/f/{FOLDER_ID}/p/{PROFILE_ID}/start?automation_type=selenium"
        
        import requests
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

class CleanAutomation:
    """Clean automation example with simplified structure"""
    
    def __init__(self):
        """Initialize automation"""
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
            
            # Use the signin function
            token = signin()
            if not token:
                raise Exception("Authentication failed")
            
            # Create API instance
            self.api = MultiloginXAPI(CONFIG_PATH)
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
            self.logger.info(f"Using Profile ID: {PROFILE_ID}")
            self.logger.info(f"Using Folder ID: {FOLDER_ID}")
            
            # Use the start_profile function with token
            self.debugging_url = start_profile(self.api.bearer_token)
            
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
            
            self.automation = UndetectableSeleniumAutomation(CONFIG_PATH)
            
            if not self.automation.setup_driver(self.debugging_url):
                raise Exception("Failed to setup driver")
            
            # Setup URL with helper - get fallback URL from config
            fallback_url = config.get('adsense_testing', {}).get('fallback_url', "https://gengsego.com")
            current_url, message = setup_url_for_automation(self.automation, fallback_url)
            
            if not current_url:
                raise Exception(f"Failed to setup URL: {message}")
            
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
        """Demo navigation functionality"""
        try:
            self.logger.info("🧭 Demo: Navigation System")
            
            # Test previous/next navigation
            new_url = self.automation._navigate_previous_next()
            
            if new_url:
                self.logger.info(f"✅ Found navigation link: {new_url[:60]}...")
                
                # Navigate to new URL
                self.automation.driver.get(new_url)
                time.sleep(3)
                
                # Record navigation
                self.session_data["pages_visited"].append({
                    "url": new_url,
                    "timestamp": datetime.now().isoformat(),
                    "title": self.automation.driver.title
                })
                
                # Simulate behavior on new page
                self._demo_post_navigation_behavior()
                
            else:
                self.logger.info("⚠️ No navigation links found")
            
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
        """Demo AdSense detection and interaction"""
        try:
            self.logger.info("💰 Demo: AdSense Integration")
            
            # Test AdSense detection on current page
            adsense_results = self.automation.test_adsense_ads()
            
            if "error" not in adsense_results:
                ads_found = adsense_results.get('ads_detected', 0)
                self.logger.info(f"✅ Found {ads_found} ads")
                
                if ads_found > 0:
                    self.logger.info("🖱️ Safe ad interaction demo...")
                    self._demo_safe_ad_interaction(adsense_results.get('details', []))
                
                # Record AdSense results
                self.session_data["interactions"].append({
                    "type": "adsense",
                    "ads_found": ads_found,
                    "timestamp": datetime.now().isoformat()
                })
            else:
                self.logger.warning(f"⚠️ AdSense detection failed: {adsense_results['error']}")
                
        except Exception as e:
            self.logger.error(f"❌ AdSense demo failed: {e}")
            self.session_data["errors"].append({"type": "adsense", "error": str(e)})
    
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

def main():
    """Main function"""
    print("🎯 Clean Automation Example")
    print("=" * 50)
    print("Simplified automation with clean structure")
    
    # Create and run automation
    automation = CleanAutomation()
    success = automation.run_automation()
    
    if success:
        print("\n🏆 Automation completed successfully!")
        print("📋 Features demonstrated:")
        print("  ✅ Authentication & Profile Management")
        print("  ✅ Selenium Automation Setup")
        print("  ✅ Personality System")
        print("  ✅ Navigation System")
        print("  ✅ AdSense Integration")
        print("  ✅ Advanced Features")
        print("  ✅ Session Data Management")
    else:
        print("\n❌ Automation failed")
    
    return success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
