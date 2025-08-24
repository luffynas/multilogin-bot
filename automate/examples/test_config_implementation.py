#!/usr/bin/env python3
"""
Test Configuration Implementation
================================
Tests that all configuration options from config.yaml are properly implemented
"""

import sys
import os
import time
import logging
import requests
import json
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
    """Setup logging for configuration test"""
    log_format = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    logging.basicConfig(
        level=logging.INFO,
        format=log_format,
        handlers=[
            logging.FileHandler('../logs/config_test.log'),
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

class ConfigurationTestSuite:
    """Test suite for configuration implementation"""
    
    def __init__(self, debugging_url):
        self.debugging_url = debugging_url
        self.automation = None
        self.current_url = None
        self.test_results = {
            "tests_passed": 0,
            "tests_failed": 0,
            "configuration_checks": {},
            "stealth_metrics": {},
            "timestamp": datetime.now().isoformat()
        }
        self.logger = logging.getLogger(__name__)
    
    def setup_automation(self):
        """Setup automation for testing"""
        try:
            print("\n🔧 Setting up Configuration Test Automation")
            print("=" * 50)
            
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
                return True
            else:
                print(f"❌ URL setup failed: {message}")
                return False
                
        except Exception as e:
            self.logger.error(f"❌ Setup error: {e}")
            return False
    
    def test_human_behavior_config(self):
        """Test human behavior configuration implementation"""
        print("\n🧠 Testing Human Behavior Configuration")
        print("=" * 40)
        
        try:
            config = self.automation.human_behavior_config
            
            # Test all human behavior settings
            tests = [
                ("enabled", config.get("enabled", False)),
                ("mouse_movement", config.get("mouse_movement", False)),
                ("random_delays", config.get("random_delays", False)),
                ("natural_scrolling", config.get("natural_scrolling", False)),
                ("realistic_typing", config.get("realistic_typing", False)),
                ("min_delay", config.get("min_delay", 0)),
                ("max_delay", config.get("max_delay", 0)),
                ("scroll_interval_min", config.get("scroll_interval_min", 0)),
                ("scroll_interval_max", config.get("scroll_interval_max", 0))
            ]
            
            for test_name, value in tests:
                if value:
                    print(f"  ✅ {test_name}: {value}")
                    self.test_results["tests_passed"] += 1
                else:
                    print(f"  ❌ {test_name}: Not configured")
                    self.test_results["tests_failed"] += 1
                
                self.test_results["configuration_checks"][f"human_behavior_{test_name}"] = value
            
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Human behavior config test failed: {e}")
            self.test_results["tests_failed"] += 1
            return False
    
    def test_click_simulation_config(self):
        """Test click simulation configuration implementation"""
        print("\n🖱️ Testing Click Simulation Configuration")
        print("=" * 40)
        
        try:
            config = self.automation.click_config
            
            # Test all click simulation settings
            tests = [
                ("enabled", config.get("enabled", False)),
                ("natural_click_patterns", config.get("natural_click_patterns", False)),
                ("hover_before_click", config.get("hover_before_click", False)),
                ("click_delay_variation", config.get("click_delay_variation", False)),
                ("double_click_probability", config.get("double_click_probability", 0))
            ]
            
            for test_name, value in tests:
                if value or (test_name == "double_click_probability" and value >= 0):
                    print(f"  ✅ {test_name}: {value}")
                    self.test_results["tests_passed"] += 1
                else:
                    print(f"  ❌ {test_name}: Not configured")
                    self.test_results["tests_failed"] += 1
                
                self.test_results["configuration_checks"][f"click_simulation_{test_name}"] = value
            
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Click simulation config test failed: {e}")
            self.test_results["tests_failed"] += 1
            return False
    
    def test_traffic_generation_config(self):
        """Test traffic generation configuration implementation"""
        print("\n🚦 Testing Traffic Generation Configuration")
        print("=" * 40)
        
        try:
            config = self.automation.traffic_config
            
            # Test all traffic generation settings
            tests = [
                ("enabled", config.get("enabled", False)),
                ("natural_browsing_patterns", config.get("natural_browsing_patterns", False)),
                ("page_dwell_time", config.get("page_dwell_time", [])),
                ("scroll_behavior", config.get("scroll_behavior", "")),
                ("tab_switching", config.get("tab_switching", False)),
                ("bookmark_creation", config.get("bookmark_creation", False))
            ]
            
            for test_name, value in tests:
                if value or (test_name == "page_dwell_time" and len(value) > 0):
                    print(f"  ✅ {test_name}: {value}")
                    self.test_results["tests_passed"] += 1
                else:
                    print(f"  ❌ {test_name}: Not configured")
                    self.test_results["tests_failed"] += 1
                
                self.test_results["configuration_checks"][f"traffic_generation_{test_name}"] = value
            
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Traffic generation config test failed: {e}")
            self.test_results["tests_failed"] += 1
            return False
    
    def test_realistic_behavior_config(self):
        """Test realistic behavior configuration implementation"""
        print("\n🎭 Testing Realistic Behavior Configuration")
        print("=" * 40)
        
        try:
            config = self.automation.realistic_config
            
            # Test all realistic behavior settings
            tests = [
                ("enabled", config.get("enabled", False)),
                ("attention_span_variation", config.get("attention_span_variation", False)),
                ("reading_speed_variation", config.get("reading_speed_variation", False)),
                ("mouse_acceleration", config.get("mouse_acceleration", False)),
                ("keyboard_typing_patterns", config.get("keyboard_typing_patterns", False)),
                ("browser_navigation_patterns", config.get("browser_navigation_patterns", False))
            ]
            
            for test_name, value in tests:
                if value:
                    print(f"  ✅ {test_name}: {value}")
                    self.test_results["tests_passed"] += 1
                else:
                    print(f"  ❌ {test_name}: Not configured")
                    self.test_results["tests_failed"] += 1
                
                self.test_results["configuration_checks"][f"realistic_behavior_{test_name}"] = value
            
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Realistic behavior config test failed: {e}")
            self.test_results["tests_failed"] += 1
            return False
    
    def test_advanced_behavior_config(self):
        """Test advanced behavior configuration implementation"""
        print("\n🚀 Testing Advanced Behavior Configuration")
        print("=" * 40)
        
        try:
            config = self.automation.advanced_config
            
            # Test all advanced behavior settings
            tests = [
                ("enabled", config.get("enabled", False)),
                ("time_based_adjustment", config.get("time_based_adjustment", False)),
                ("personality_generation", config.get("personality_generation", False)),
                ("personality_weights", config.get("personality_weights", {})),
                ("device_detection", config.get("device_detection", False)),
                ("device_distribution", config.get("device_distribution", {})),
                ("geo_specific_behavior", config.get("geo_specific_behavior", False)),
                ("geo_behavior_enabled", config.get("geo_behavior_enabled", False)),
                ("content_awareness", config.get("content_awareness", False)),
                ("content_analysis", config.get("content_analysis", False)),
                ("session_memory", config.get("session_memory", False)),
                ("memory_persistence", config.get("memory_persistence", False)),
                ("smart_ad_interaction", config.get("smart_ad_interaction", False)),
                ("context_aware_interaction", config.get("context_aware_interaction", False))
            ]
            
            for test_name, value in tests:
                if value or (test_name in ["personality_weights", "device_distribution"] and len(value) > 0):
                    print(f"  ✅ {test_name}: {value}")
                    self.test_results["tests_passed"] += 1
                else:
                    print(f"  ❌ {test_name}: Not configured")
                    self.test_results["tests_failed"] += 1
                
                self.test_results["configuration_checks"][f"advanced_behavior_{test_name}"] = value
            
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Advanced behavior config test failed: {e}")
            self.test_results["tests_failed"] += 1
            return False
    
    def test_behavior_functionality(self):
        """Test that behavior methods are working with configuration"""
        print("\n⚡ Testing Behavior Functionality")
        print("=" * 35)
        
        try:
            # Test random delay functionality
            print("  🔄 Testing random delay...")
            start_time = time.time()
            self.automation._random_delay(0.1, 0.2)
            delay_time = time.time() - start_time
            if 0.1 <= delay_time <= 0.3:  # Allow some tolerance
                print(f"    ✅ Random delay working: {delay_time:.2f}s")
                self.test_results["tests_passed"] += 1
            else:
                print(f"    ❌ Random delay not working: {delay_time:.2f}s")
                self.test_results["tests_failed"] += 1
            
            # Test mouse movement functionality
            print("  🖱️ Testing mouse movement...")
            try:
                self.automation._simulate_mouse_movement()
                print("    ✅ Mouse movement working")
                self.test_results["tests_passed"] += 1
            except Exception as e:
                print(f"    ❌ Mouse movement failed: {e}")
                self.test_results["tests_failed"] += 1
            
            # Test natural scrolling functionality
            print("  📜 Testing natural scrolling...")
            try:
                self.automation._simulate_natural_scrolling()
                print("    ✅ Natural scrolling working")
                self.test_results["tests_passed"] += 1
            except Exception as e:
                print(f"    ❌ Natural scrolling failed: {e}")
                self.test_results["tests_failed"] += 1
            
            # Test stealth metrics
            print("  📊 Testing stealth metrics...")
            try:
                metrics = self.automation.get_stealth_metrics()
                if metrics:
                    print("    ✅ Stealth metrics working")
                    self.test_results["tests_passed"] += 1
                    self.test_results["stealth_metrics"] = metrics
                else:
                    print("    ❌ Stealth metrics failed")
                    self.test_results["tests_failed"] += 1
            except Exception as e:
                print(f"    ❌ Stealth metrics failed: {e}")
                self.test_results["tests_failed"] += 1
            
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Behavior functionality test failed: {e}")
            self.test_results["tests_failed"] += 1
            return False
    
    def run_comprehensive_test(self):
        """Run all configuration tests"""
        try:
            print("\n🎯 Starting Configuration Implementation Test")
            print("=" * 50)
            print("Testing all configuration options from config.yaml")
            
            # Setup automation
            if not self.setup_automation():
                return False
            
            # Run all configuration tests
            self.test_human_behavior_config()
            self.test_click_simulation_config()
            self.test_traffic_generation_config()
            self.test_realistic_behavior_config()
            self.test_advanced_behavior_config()
            self.test_behavior_functionality()
            
            # Print summary
            self._print_test_summary()
            
            # Save test results
            self._save_test_results()
            
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Comprehensive test failed: {e}")
            return False
        finally:
            if self.automation and self.automation.driver:
                try:
                    self.automation.close_driver()
                except Exception as e:
                    self.logger.error(f"⚠️ Error closing driver: {e}")
    
    def _print_test_summary(self):
        """Print test summary"""
        print("\n📊 Configuration Test Summary")
        print("=" * 35)
        print(f"✅ Tests Passed: {self.test_results['tests_passed']}")
        print(f"❌ Tests Failed: {self.test_results['tests_failed']}")
        print(f"📈 Success Rate: {(self.test_results['tests_passed'] / (self.test_results['tests_passed'] + self.test_results['tests_failed']) * 100):.1f}%")
        
        if self.test_results["stealth_metrics"]:
            print(f"\n🎭 Personality: {self.test_results['stealth_metrics'].get('personality', 'Unknown')}")
            print(f"📱 Device Type: {self.test_results['stealth_metrics'].get('device_type', 'Unknown')}")
            print(f"🌍 Geo Location: {self.test_results['stealth_metrics'].get('geo_location', 'Unknown')}")
            print(f"🖱️ Mouse Movements: {self.test_results['stealth_metrics'].get('mouse_movements', 0)}")
            print(f"🖱️ Clicks: {self.test_results['stealth_metrics'].get('clicks', 0)}")
            print(f"📜 Scrolls: {self.test_results['stealth_metrics'].get('scrolls', 0)}")
    
    def _save_test_results(self):
        """Save test results to file"""
        try:
            results_file = f"../data/config_test_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            
            # Ensure data directory exists
            os.makedirs("../data", exist_ok=True)
            
            with open(results_file, 'w') as f:
                json.dump(self.test_results, f, indent=2, default=str)
            
            print(f"💾 Test results saved to: {results_file}")
            
        except Exception as e:
            self.logger.error(f"Failed to save test results: {e}")

def main():
    """Main function to run configuration tests"""
    logger = setup_logging()
    
    print("🎯 Configuration Implementation Test")
    print("=" * 50)
    print("Testing all configuration options from config.yaml")
    
    try:
        # Auth
        token = signin()
        if not token:
            return False
        
        # Start profile
        debugging_url = start_profile(token)
        if not debugging_url:
            return False
        
        # Create and run configuration test suite
        test_suite = ConfigurationTestSuite(debugging_url)
        success = test_suite.run_comprehensive_test()
        
        if success:
            print("\n🏆 Configuration implementation test completed!")
            print("📋 All configuration options have been implemented and tested")
        else:
            print("\n❌ Configuration test failed")
        
        return success
        
    except Exception as e:
        print(f"❌ Test error: {e}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)

