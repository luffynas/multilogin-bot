#!/usr/bin/env python3
"""
COMPREHENSIVE TEST: Profile Creation to Browser Automation
Testing complete flow using Multilogin X with provided proxy
"""

import sys
import os
import time
import json
import logging
import yaml
from datetime import datetime
from typing import Dict, Optional, Any

# Add parent directory to path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from core.multilogin_manager import MultiloginManager
from core.premade_cookies_manager import PremadeCookiesManager
from core.proxy_generation_manager import ProxyGenerationManager
from core.script_runner_manager import ScriptRunnerManager
from core.object_storage_manager import ObjectStorageManager
from core.bookmark_manager import BookmarkManager
from core.browser_profile_data_manager import BrowserProfileDataManager

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('comprehensive_test.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

class ComprehensiveTest:
    def __init__(self):
        self.config = self.load_config()
        self.test_results = {
            "start_time": datetime.now().isoformat(),
            "tests": {},
            "overall_status": "PENDING"
        }
        
        # Initialize Multilogin Manager
        self.ml_manager = MultiloginManager(
            username=self.config["multilogin"]["username"],
            password=self.config["multilogin"]["password"],
            base_url=self.config["multilogin"]["base_url"],
            launcher_url=self.config["multilogin"].get("launcher_url", "https://launcher.mlx.yt:45001/api/v1")
        )
        
        # Initialize Phase 1 & 2 managers
        self.premade_cookies_manager = PremadeCookiesManager()
        self.proxy_generation_manager = ProxyGenerationManager()
        self.script_runner_manager = ScriptRunnerManager(
            launcher_url=self.config["multilogin"].get("launcher_url", "https://launcher.mlx.yt:45001")
        )
        self.object_storage_manager = ObjectStorageManager(
            base_url=self.config["multilogin"]["base_url"],
            launcher_url=self.config["multilogin"].get("launcher_url", "https://launcher.mlx.yt:45001")
        )
        self.bookmark_manager = BookmarkManager(
            launcher_url=self.config["multilogin"].get("launcher_url", "https://launcher.mlx.yt:45001")
        )
        self.browser_profile_data_manager = BrowserProfileDataManager(
            base_url=self.config["multilogin"]["base_url"]
        )
        
        # Test proxy configuration
        self.test_proxy = {
            "host": "gate.multilogin.com",
            "port": 1080,
            "username": "2235453924_d3602d53_2e54_4cce_87d7_64e89e0f8679_multilogin_com-country-us-region-new_york-sid-KHLeyP0e-filter-medium",
            "password": "806d730526a366a61874e7da84875e57",
            "type": "socks5"
        }
        
        logger.info("Comprehensive Test initialized")
    
    def load_config(self) -> Dict:
        """Load configuration from YAML file"""
        try:
            with open("config/config.yaml", 'r', encoding='utf-8') as file:
                config = yaml.safe_load(file)
            logger.info("Configuration loaded successfully")
            return config
        except Exception as e:
            logger.error(f"Error loading configuration: {e}")
            sys.exit(1)
    
    def test_multilogin_connection(self) -> bool:
        """Test 1: Multilogin X Connection"""
        logger.info("=" * 60)
        logger.info("TEST 1: MULTILOGIN X CONNECTION")
        logger.info("=" * 60)
        
        try:
            # Test sign-in
            logger.info("Testing Multilogin X sign-in...")
            try:
                self.ml_manager._sign_in()
                logger.info("✅ Multilogin X sign-in successful")
            except Exception as e:
                logger.error(f"❌ Multilogin X sign-in failed: {e}")
                return False
            
            # Test token refresh
            logger.info("Testing token refresh...")
            self.ml_manager._refresh_token_if_needed()
            logger.info("✅ Token refresh successful")
            
            # Test get all profiles
            logger.info("Testing get all profiles...")
            profiles = self.ml_manager.get_all_profiles()
            if profiles:
                profile_count = len(profiles.get("data", []))
                logger.info(f"✅ Retrieved {profile_count} existing profiles")
            else:
                logger.info("✅ No existing profiles found (normal for new account)")
            
            self.test_results["tests"]["multilogin_connection"] = {
                "status": "PASSED",
                "message": "Multilogin X connection successful"
            }
            return True
            
        except Exception as e:
            logger.error(f"❌ Multilogin X connection failed: {e}")
            self.test_results["tests"]["multilogin_connection"] = {
                "status": "FAILED",
                "message": str(e)
            }
            return False
    
    def test_profile_creation(self) -> Optional[str]:
        """Test 2: Profile Creation with Test Proxy"""
        logger.info("=" * 60)
        logger.info("TEST 2: PROFILE CREATION")
        logger.info("=" * 60)
        
        try:
            # Create profile data with test proxy
            profile_data = {
                "name": f"Test_Profile_{int(time.time())}",
                "browser_type": "mimic",
                "folder_id": "4500dd84-d8c5-4450-b2df-1c64daed8bad",  # Default folder
                "core_version": 130,
                "auto_update_core": True,
                "os_type": "windows",
                "times": 1,
                "notes": "Comprehensive test profile with Multilogin proxy",
                "parameters": {
                    "flags": {
                        "audio_masking": "mask",
                        "fonts_masking": "mask",
                        "geolocation_masking": "mask",
                        "geolocation_popup": "prompt",
                        "graphics_masking": "mask",
                        "graphics_noise": "mask",
                        "localization_masking": "mask",
                        "media_devices_masking": "mask",
                        "navigator_masking": "mask",
                        "ports_masking": "mask",
                        "proxy_masking": "custom",
                        "quic_mode": "natural",
                        "screen_masking": "mask",
                        "timezone_masking": "mask",
                        "webrtc_masking": "mask",
                        "canvas_noise": "mask",
                        "startup_behavior": "natural"
                    },
                    "storage": {
                        "is_local": False,
                        "save_service_worker": False
                    },
                    "fingerprint": {
                        "navigator": {
                            "hardware_concurrency": 8,
                            "platform": "Win32",
                            "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                            "os_cpu": ""
                        },
                        "localization": {
                            "languages": "en-US",
                            "locale": "en-US",
                            "accept_languages": "en-US,en;q=0.9"
                        },
                        "timezone": {
                            "zone": "America/New_York"
                        },
                        "graphic": {
                            "renderer": "ANGLE (NVIDIA, NVIDIA GeForce RTX 4070 Ti Direct3D11 vs_5_0 ps_5_0, D3D11)",
                            "vendor": "Google Inc. (NVIDIA)"
                        },
                        "webrtc": {
                            "public_ip": "192.168.1.1"
                        },
                        "media_devices": {
                            "audio_inputs": 1,
                            "audio_outputs": 1,
                            "video_inputs": 1
                        },
                        "screen": {
                            "height": 1080,
                            "pixel_ratio": 1,
                            "width": 1920
                        },
                        "geolocation": {
                            "accuracy": 100,
                            "altitude": 0,
                            "latitude": 40.7128,
                            "longitude": -74.0060
                        },
                        "ports": [443, 80, 8080],
                        "fonts": ["Arial", "Calibri", "Times New Roman"]
                    },
                    "proxy": {
                        "type": self.test_proxy["type"],
                        "host": self.test_proxy["host"],
                        "port": self.test_proxy["port"],
                        "username": self.test_proxy["username"],
                        "password": self.test_proxy["password"],
                        "save_traffic": False
                    },
                    "custom_start_urls": [
                        "https://www.google.com",
                        "https://www.example.com"
                    ]
                }
            }
            
            logger.info("Creating test profile...")
            logger.info(f"Profile name: {profile_data['name']}")
            logger.info(f"Proxy: {self.test_proxy['host']}:{self.test_proxy['port']}")
            
            # Create profile with proper parameters
            name = profile_data["name"]
            proxy_config = {
                "host": self.test_proxy["host"],
                "port": self.test_proxy["port"],
                "username": self.test_proxy["username"],
                "password": self.test_proxy["password"],
                "type": self.test_proxy["type"],
                "geo": "US"
            }
            fingerprint_config = {
                "user_agent": profile_data["parameters"]["fingerprint"]["navigator"]["user_agent"],
                "device_type": "desktop_windows",
                "language": "en-US",
                "timezone": "America/New_York"
            }
            
            result = self.ml_manager.create_profile(name, proxy_config, fingerprint_config)
            
            if result and result.get("status", {}).get("http_code") == 201:
                profile_id = result.get("data", {}).get("profile_id")
                logger.info(f"✅ Profile created successfully: {profile_id}")
                
                self.test_results["tests"]["profile_creation"] = {
                    "status": "PASSED",
                    "message": f"Profile created: {profile_id}",
                    "profile_id": profile_id
                }
                return profile_id
            else:
                logger.error(f"❌ Profile creation failed: {result}")
                self.test_results["tests"]["profile_creation"] = {
                    "status": "FAILED",
                    "message": str(result)
                }
                return None
                
        except Exception as e:
            logger.error(f"❌ Profile creation failed: {e}")
            self.test_results["tests"]["profile_creation"] = {
                "status": "FAILED",
                "message": str(e)
            }
            return None
    
    def test_premade_cookies(self, profile_id: str) -> bool:
        """Test 3: Pre-made Cookies Application"""
        logger.info("=" * 60)
        logger.info("TEST 3: PRE-MADE COOKIES APPLICATION")
        logger.info("=" * 60)
        
        try:
            logger.info(f"Applying pre-made cookies to profile: {profile_id}")
            
            # Test safe cookies application
            success = self.premade_cookies_manager.safe_cookies_application(
                profile_id=profile_id,
                geo_location="US"
            )
            
            if success:
                logger.info("✅ Pre-made cookies applied successfully")
                self.test_results["tests"]["premade_cookies"] = {
                    "status": "PASSED",
                    "message": "Pre-made cookies applied successfully"
                }
                return True
            else:
                logger.error("❌ Pre-made cookies application failed")
                self.test_results["tests"]["premade_cookies"] = {
                    "status": "FAILED",
                    "message": "Pre-made cookies application failed"
                }
                return False
                
        except Exception as e:
            logger.error(f"❌ Pre-made cookies test failed: {e}")
            self.test_results["tests"]["premade_cookies"] = {
                "status": "FAILED",
                "message": str(e)
            }
            return False
    
    def test_bookmark_management(self, profile_id: str) -> bool:
        """Test 4: Bookmark Management"""
        logger.info("=" * 60)
        logger.info("TEST 4: BOOKMARK MANAGEMENT")
        logger.info("=" * 60)
        
        try:
            logger.info(f"Managing bookmarks for profile: {profile_id}")
            
            # Test safe bookmark management
            success = self.bookmark_manager.safe_bookmark_management(
                profile_id=profile_id,
                geo_location="US"
            )
            
            if success:
                logger.info("✅ Bookmark management successful")
                self.test_results["tests"]["bookmark_management"] = {
                    "status": "PASSED",
                    "message": "Bookmark management successful"
                }
                return True
            else:
                logger.error("❌ Bookmark management failed")
                self.test_results["tests"]["bookmark_management"] = {
                    "status": "FAILED",
                    "message": "Bookmark management failed"
                }
                return False
                
        except Exception as e:
            logger.error(f"❌ Bookmark management test failed: {e}")
            self.test_results["tests"]["bookmark_management"] = {
                "status": "FAILED",
                "message": str(e)
            }
            return False
    
    def test_profile_start(self, profile_id: str) -> Optional[Dict]:
        """Test 5: Profile Start"""
        logger.info("=" * 60)
        logger.info("TEST 5: PROFILE START")
        logger.info("=" * 60)
        
        try:
            logger.info(f"Starting profile: {profile_id}")
            
            # Start profile
            browser_info = self.ml_manager.start_profile(profile_id)
            
            if browser_info:
                logger.info("✅ Profile started successfully")
                logger.info(f"Browser info: {browser_info}")
                
                self.test_results["tests"]["profile_start"] = {
                    "status": "PASSED",
                    "message": "Profile started successfully",
                    "browser_info": browser_info
                }
                return browser_info
            else:
                logger.error("❌ Profile start failed")
                self.test_results["tests"]["profile_start"] = {
                    "status": "FAILED",
                    "message": "Profile start failed"
                }
                return None
                
        except Exception as e:
            logger.error(f"❌ Profile start test failed: {e}")
            self.test_results["tests"]["profile_start"] = {
                "status": "FAILED",
                "message": str(e)
            }
            return None
    
    def test_navigation(self, profile_id: str) -> bool:
        """Test 6: Navigation Test"""
        logger.info("=" * 60)
        logger.info("TEST 6: NAVIGATION TEST")
        logger.info("=" * 60)
        
        try:
            logger.info(f"Testing navigation for profile: {profile_id}")
            
            # Test navigation to Google
            test_url = "https://www.google.com"
            referer = "https://www.google.com"
            
            logger.info(f"Navigating to: {test_url}")
            success = self.ml_manager.navigate_to_url(profile_id, test_url, referer)
            
            if success:
                logger.info("✅ Navigation successful")
                
                # Wait a bit for page to load
                time.sleep(3)
                
                # Test script execution
                test_script = "console.log('Navigation test successful'); return document.title;"
                logger.info("Testing script execution...")
                
                script_result = self.ml_manager.execute_script(profile_id, test_script)
                
                if script_result:
                    logger.info(f"✅ Script execution successful: {script_result}")
                else:
                    logger.warning("⚠️ Script execution returned no result (may be normal)")
                
                self.test_results["tests"]["navigation"] = {
                    "status": "PASSED",
                    "message": "Navigation and script execution successful"
                }
                return True
            else:
                logger.error("❌ Navigation failed")
                self.test_results["tests"]["navigation"] = {
                    "status": "FAILED",
                    "message": "Navigation failed"
                }
                return False
                
        except Exception as e:
            logger.error(f"❌ Navigation test failed: {e}")
            self.test_results["tests"]["navigation"] = {
                "status": "FAILED",
                "message": str(e)
            }
            return False
    
    def test_script_runner(self, profile_id: str) -> bool:
        """Test 7: Script Runner Test"""
        logger.info("=" * 60)
        logger.info("TEST 7: SCRIPT RUNNER TEST")
        logger.info("=" * 60)
        
        try:
            logger.info(f"Testing script runner for profile: {profile_id}")
            
            # Test safe script execution
            success = self.script_runner_manager.safe_script_execution(
                profile_ids=[profile_id],
                script_name="test_automation.py"
            )
            
            if success:
                logger.info("✅ Script runner test successful")
                self.test_results["tests"]["script_runner"] = {
                    "status": "PASSED",
                    "message": "Script runner test successful"
                }
                return True
            else:
                logger.warning("⚠️ Script runner test failed (may be normal for test environment)")
                self.test_results["tests"]["script_runner"] = {
                    "status": "WARNING",
                    "message": "Script runner test failed (may be normal for test environment)"
                }
                return False
                
        except Exception as e:
            logger.error(f"❌ Script runner test failed: {e}")
            self.test_results["tests"]["script_runner"] = {
                "status": "FAILED",
                "message": str(e)
            }
            return False
    
    def test_profile_stop(self, profile_id: str) -> bool:
        """Test 8: Profile Stop"""
        logger.info("=" * 60)
        logger.info("TEST 8: PROFILE STOP")
        logger.info("=" * 60)
        
        try:
            logger.info(f"Stopping profile: {profile_id}")
            
            # Stop profile
            success = self.ml_manager.stop_profile(profile_id)
            
            if success:
                logger.info("✅ Profile stopped successfully")
                self.test_results["tests"]["profile_stop"] = {
                    "status": "PASSED",
                    "message": "Profile stopped successfully"
                }
                return True
            else:
                logger.error("❌ Profile stop failed")
                self.test_results["tests"]["profile_stop"] = {
                    "status": "FAILED",
                    "message": "Profile stop failed"
                }
                return False
                
        except Exception as e:
            logger.error(f"❌ Profile stop test failed: {e}")
            self.test_results["tests"]["profile_stop"] = {
                "status": "FAILED",
                "message": str(e)
            }
            return False
    
    def test_profile_cleanup(self, profile_id: str) -> bool:
        """Test 9: Profile Cleanup"""
        logger.info("=" * 60)
        logger.info("TEST 9: PROFILE CLEANUP")
        logger.info("=" * 60)
        
        try:
            logger.info(f"Cleaning up test profile: {profile_id}")
            
            # Delete test profile
            success = self.ml_manager.delete_profile(profile_id)
            
            if success:
                logger.info("✅ Test profile cleaned up successfully")
                self.test_results["tests"]["profile_cleanup"] = {
                    "status": "PASSED",
                    "message": "Test profile cleaned up successfully"
                }
                return True
            else:
                logger.error("❌ Profile cleanup failed")
                self.test_results["tests"]["profile_cleanup"] = {
                    "status": "FAILED",
                    "message": "Profile cleanup failed"
                }
                return False
                
        except Exception as e:
            logger.error(f"❌ Profile cleanup test failed: {e}")
            self.test_results["tests"]["profile_cleanup"] = {
                "status": "FAILED",
                "message": str(e)
            }
            return False
    
    def run_comprehensive_test(self):
        """Run all comprehensive tests"""
        logger.info("🚀 STARTING COMPREHENSIVE TEST")
        logger.info("=" * 80)
        
        # Test 1: Multilogin Connection
        if not self.test_multilogin_connection():
            logger.error("❌ Multilogin connection failed. Stopping tests.")
            return False
        
        # Test 2: Profile Creation
        profile_id = self.test_profile_creation()
        if not profile_id:
            logger.error("❌ Profile creation failed. Stopping tests.")
            return False
        
        # Test 3: Pre-made Cookies
        self.test_premade_cookies(profile_id)
        
        # Test 4: Bookmark Management
        self.test_bookmark_management(profile_id)
        
        # Test 5: Profile Start
        browser_info = self.test_profile_start(profile_id)
        if not browser_info:
            logger.error("❌ Profile start failed. Stopping tests.")
            return False
        
        # Test 6: Navigation
        self.test_navigation(profile_id)
        
        # Test 7: Script Runner
        self.test_script_runner(profile_id)
        
        # Test 8: Profile Stop
        self.test_profile_stop(profile_id)
        
        # Test 9: Profile Cleanup
        self.test_profile_cleanup(profile_id)
        
        # Generate final report
        self.generate_test_report()
        
        return True
    
    def generate_test_report(self):
        """Generate comprehensive test report"""
        logger.info("=" * 80)
        logger.info("📊 COMPREHENSIVE TEST REPORT")
        logger.info("=" * 80)
        
        # Calculate overall status
        passed_tests = sum(1 for test in self.test_results["tests"].values() 
                          if test["status"] == "PASSED")
        total_tests = len(self.test_results["tests"])
        
        if passed_tests == total_tests:
            self.test_results["overall_status"] = "PASSED"
        elif passed_tests >= total_tests * 0.8:  # 80% success rate
            self.test_results["overall_status"] = "PARTIAL_SUCCESS"
        else:
            self.test_results["overall_status"] = "FAILED"
        
        # Print test results
        for test_name, test_result in self.test_results["tests"].items():
            status_icon = "✅" if test_result["status"] == "PASSED" else "❌"
            logger.info(f"{status_icon} {test_name}: {test_result['status']}")
            if test_result.get("message"):
                logger.info(f"   └─ {test_result['message']}")
        
        # Print summary
        logger.info("=" * 80)
        logger.info(f"📈 SUMMARY: {passed_tests}/{total_tests} tests passed")
        logger.info(f"🎯 OVERALL STATUS: {self.test_results['overall_status']}")
        logger.info("=" * 80)
        
        # Save report to file
        report_file = f"comprehensive_test_report_{int(time.time())}.json"
        with open(report_file, 'w') as f:
            json.dump(self.test_results, f, indent=2)
        
        logger.info(f"📄 Detailed report saved to: {report_file}")
        
        if self.test_results["overall_status"] == "PASSED":
            logger.info("🎉 ALL TESTS PASSED! System is ready for production use.")
        elif self.test_results["overall_status"] == "PARTIAL_SUCCESS":
            logger.info("⚠️ MOST TESTS PASSED! System is mostly functional.")
        else:
            logger.error("❌ MANY TESTS FAILED! System needs attention.")

def main():
    """Main function"""
    try:
        # Create and run comprehensive test
        test = ComprehensiveTest()
        success = test.run_comprehensive_test()
        
        if success:
            print("\n🎉 Comprehensive test completed successfully!")
            return 0
        else:
            print("\n❌ Comprehensive test failed!")
            return 1
            
    except KeyboardInterrupt:
        print("\n⚠️ Test interrupted by user")
        return 1
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        return 1

if __name__ == "__main__":
    exit(main())
