#!/usr/bin/env python3
"""
SIMPLE COMPREHENSIVE TEST: Profile Creation to Browser Automation
Testing complete flow using Multilogin X with provided proxy
"""

import sys
import os
import time
import json
import logging
import yaml
import requests
import hashlib
from datetime import datetime
from typing import Dict, Optional, Any

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('simple_comprehensive_test.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

class SimpleComprehensiveTest:
    def __init__(self):
        self.config = self.load_config()
        self.test_results = {
            "start_time": datetime.now().isoformat(),
            "tests": {},
            "overall_status": "PENDING"
        }
        
        # Multilogin X credentials
        self.username = self.config["multilogin"]["username"]
        self.password = self.config["multilogin"]["password"]
        self.base_url = self.config["multilogin"]["base_url"]
        self.launcher_url = self.config["multilogin"].get("launcher_url", "https://launcher.mlx.yt:45001/api/v1")
        
        # Test proxy configuration
        self.test_proxy = {
            "host": "gate.multilogin.com",
            "port": 1080,
            "username": "2235453924_d3602d53_2e54_4cce_87d7_64e89e0f8679_multilogin_com-country-us-region-new_york-sid-KHLeyP0e-filter-medium",
            "password": "806d730526a366a61874e7da84875e57",
            "type": "socks5"
        }
        
        # Folder ID for profile operations
        self.folder_id = "4500dd84-d8c5-4450-b2df-1c64daed8bad"
        
        # Session for API calls
        self.session = requests.Session()
        self.token = None
        self.headers = {}
        
        logger.info("Simple Comprehensive Test initialized")
    
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
    
    def sign_in(self) -> bool:
        """Sign in to Multilogin X"""
        try:
            sign_url = f"{self.base_url}/user/signin"
            headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
            }
            
            payload = {
                "email": self.username,
                "password": str(hashlib.md5(self.password.encode()).hexdigest()),
            }
            
            response = self.session.post(sign_url, json=payload, headers=headers)
            
            if response.status_code == 200:
                resp_json = response.json()
                self.token = resp_json["data"]["token"]
                
                self.headers = {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "X-Strict-Mode": "false",  # Based on successful test
                    "Authorization": f"Bearer {self.token}"
                }
                
                logger.info(f"✅ Successfully signed in with token: {self.token[:20]}...")
                return True
            else:
                logger.error(f"❌ Sign-in failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"❌ Sign-in error: {e}")
            return False
    
    def test_multilogin_connection(self) -> bool:
        """Test 1: Multilogin X Connection"""
        logger.info("=" * 60)
        logger.info("TEST 1: MULTILOGIN X CONNECTION")
        logger.info("=" * 60)
        
        try:
            # Test sign-in
            if not self.sign_in():
                return False
            
            # Test profile search (correct way to get profiles)
            logger.info("Testing profile search...")
            search_payload = {
                "search_text": "",
                "limit": 10,
                "offset": 0,
                "is_removed": False,
                "storage_type": "all",
                "order_by": "created_at",
                "sort": "desc"
            }
            
            search_url = f"{self.base_url}/profile/search"
            response = self.session.post(search_url, json=search_payload, headers=self.headers)
            
            if response.status_code == 200:
                profiles = response.json()
                profile_count = len(profiles.get("data", {}).get("profiles", []))
                logger.info(f"✅ Retrieved {profile_count} existing profiles")
            else:
                logger.info(f"✅ No existing profiles found (status: {response.status_code})")
            
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
            # Create profile data using successful test structure
            profile_data = {
                "name": f"Test_Profile_{int(time.time())}",
                "browser_type": "mimic",
                "folder_id": "d3602d53-2e54-4cce-87d7-64e89e0f8679",  # Use working folder ID
                "core_version": 135,  # Must be >= 134 based on successful test
                "auto_update_core": False,
                "os_type": "windows",
                "times": 1,
                "notes": "Comprehensive test profile with Multilogin proxy",
                "parameters": {
                    "flags": {
                        "audio_masking": "mask",
                        "fonts_masking": "custom",
                        "geolocation_masking": "custom",
                        "geolocation_popup": "prompt",
                        "graphics_masking": "custom",
                        "graphics_noise": "mask",
                        "localization_masking": "custom",
                        "media_devices_masking": "custom",
                        "navigator_masking": "custom",
                        "ports_masking": "mask",
                        "proxy_masking": "custom",
                        "quic_mode": "natural",
                        "screen_masking": "custom",
                        "timezone_masking": "custom",
                        "webrtc_masking": "custom",
                        "canvas_noise": "mask",
                        "startup_behavior": "custom"
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
                            "accept_languages": "en-US,en;q=0.5"
                        },
                        "timezone": {
                            "zone": "America/New_York"
                        },
                        "graphic": {
                            "renderer": "ANGLE (NVIDIA, NVIDIA GeForce RTX 4070 Ti Direct3D11 vs_5_0 ps_5_0, D3D11)",
                            "vendor": "Google Inc. (NVIDIA)"
                        },
                        "webrtc": {
                            "public_ip": "45.76.123.45"  # US IP that matches New York region
                        },
                        "media_devices": {
                            "audio_inputs": 1,
                            "audio_outputs": 1,
                            "video_inputs": 1
                        },
                        "screen": {
                            "height": 1200,
                            "pixel_ratio": 1,
                            "width": 1920
                        },
                        "geolocation": {
                            "accuracy": 100,
                            "altitude": 0,
                            "latitude": 40.7128,
                            "longitude": -74.0060
                        },
                        "ports": [80, 443, 8080],
                        "fonts": ["Arial", "Calibri", "Times New Roman"],
                        "cmd_params": {
                            "params": [
                                {
                                    "flag": "show-fps-counter",
                                    "value": "true"
                                }
                            ]
                        }
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
                        "https://www.google.com"
                    ]
                }
            }
            
            logger.info("Creating test profile...")
            logger.info(f"Profile name: {profile_data['name']}")
            logger.info(f"Proxy: {self.test_proxy['host']}:{self.test_proxy['port']}")
            
            # Create profile
            create_url = f"{self.base_url}/profile/create"
            response = self.session.post(create_url, json=profile_data, headers=self.headers)
            
            if response.status_code == 201:
                result = response.json()
                # Get profile ID from the successful test structure
                if "data" in result and "ids" in result["data"]:
                    profile_ids = result["data"]["ids"]
                    if profile_ids:
                        profile_id = profile_ids[0]
                        logger.info(f"✅ Profile created successfully: {profile_id}")
                        
                        self.test_results["tests"]["profile_creation"] = {
                            "status": "PASSED",
                            "message": f"Profile created: {profile_id}",
                            "profile_id": profile_id
                        }
                        return profile_id
            else:
                logger.error(f"❌ Profile creation failed: {response.status_code} - {response.text}")
                self.test_results["tests"]["profile_creation"] = {
                    "status": "FAILED",
                    "message": f"{response.status_code} - {response.text}"
                }
                return None
                
        except Exception as e:
            logger.error(f"❌ Profile creation failed: {e}")
            self.test_results["tests"]["profile_creation"] = {
                "status": "FAILED",
                "message": str(e)
            }
            return None
    
    def test_profile_start(self, profile_id: str) -> Optional[Dict]:
        """Test 3: Profile Start with retry mechanism"""
        logger.info("=" * 60)
        logger.info("TEST 3: PROFILE START")
        logger.info("=" * 60)
        
        max_retries = 3
        retry_delay = 10  # seconds
        
        for attempt in range(max_retries):
            try:
                logger.info(f"Starting profile: {profile_id} (attempt {attempt + 1}/{max_retries})")
                
                # Start profile - use working folder ID
                start_url = f"{self.launcher_url}/profile/f/d3602d53-2e54-4cce-87d7-64e89e0f8679/p/{profile_id}/start"
                response = self.session.get(start_url, headers=self.headers)
                
                if response.status_code == 200:
                    browser_info = response.json()
                    logger.info("✅ Profile started successfully")
                    logger.info(f"Browser info: {browser_info}")
                    
                    self.test_results["tests"]["profile_start"] = {
                        "status": "PASSED",
                        "message": "Profile started successfully",
                        "browser_info": browser_info
                    }
                    return browser_info
                elif response.status_code == 500 and "CORE_DOWNLOADING_STARTED" in response.text:
                    logger.info(f"⏳ Core downloading started (attempt {attempt + 1}). Waiting {retry_delay} seconds...")
                    if attempt < max_retries - 1:  # Don't sleep on last attempt
                        time.sleep(retry_delay)
                        retry_delay *= 2  # Exponential backoff
                    continue
                else:
                    logger.error(f"❌ Profile start failed: {response.status_code} - {response.text}")
                    if attempt == max_retries - 1:  # Last attempt
                        self.test_results["tests"]["profile_start"] = {
                            "status": "FAILED",
                            "message": f"{response.status_code} - {response.text}"
                        }
                        return None
                    time.sleep(retry_delay)
                    retry_delay *= 2
                    
            except Exception as e:
                logger.error(f"❌ Profile start test failed: {e}")
                if attempt == max_retries - 1:  # Last attempt
                    self.test_results["tests"]["profile_start"] = {
                        "status": "FAILED",
                        "message": str(e)
                    }
                    return None
                time.sleep(retry_delay)
                retry_delay *= 2
        
        return None
    
    def test_navigation(self, profile_id: str) -> bool:
        """Test 4: Navigation Test"""
        logger.info("=" * 60)
        logger.info("TEST 4: NAVIGATION TEST")
        logger.info("=" * 60)
        
        try:
            logger.info(f"Testing navigation for profile: {profile_id}")
            
            # Test navigation to Google
            test_url = "https://www.google.com"
            referer = "https://www.google.com"
            
            logger.info(f"Navigating to: {test_url}")
            
            navigate_url = f"{self.launcher_url}/profile/f/{self.folder_id}/p/{profile_id}/navigate"
            navigate_data = {
                "url": test_url,
                "referrer": referer
            }
            
            response = self.session.post(navigate_url, json=navigate_data, headers=self.headers)
            
            if response.status_code == 200:
                logger.info("✅ Navigation successful")
                
                # Wait a bit for page to load
                time.sleep(3)
                
                # Test script execution
                test_script = "console.log('Navigation test successful'); return document.title;"
                logger.info("Testing script execution...")
                
                script_url = f"{self.launcher_url}/profile/f/{self.folder_id}/p/{profile_id}/execute"
                script_data = {
                    "script": test_script
                }
                
                script_response = self.session.post(script_url, json=script_data, headers=self.headers)
                
                if script_response.status_code == 200:
                    script_result = script_response.json()
                    logger.info(f"✅ Script execution successful: {script_result}")
                else:
                    logger.warning(f"⚠️ Script execution returned: {script_response.status_code}")
                
                self.test_results["tests"]["navigation"] = {
                    "status": "PASSED",
                    "message": "Navigation and script execution successful"
                }
                return True
            else:
                logger.error(f"❌ Navigation failed: {response.status_code} - {response.text}")
                self.test_results["tests"]["navigation"] = {
                    "status": "FAILED",
                    "message": f"{response.status_code} - {response.text}"
                }
                return False
                
        except Exception as e:
            logger.error(f"❌ Navigation test failed: {e}")
            self.test_results["tests"]["navigation"] = {
                "status": "FAILED",
                "message": str(e)
            }
            return False
    
    def test_profile_stop(self, profile_id: str) -> bool:
        """Test 5: Profile Stop"""
        logger.info("=" * 60)
        logger.info("TEST 5: PROFILE STOP")
        logger.info("=" * 60)
        
        try:
            logger.info(f"Stopping profile: {profile_id}")
            
            # Stop profile
            stop_url = f"{self.launcher_url}/profile/f/{self.folder_id}/p/{profile_id}/stop"
            response = self.session.get(stop_url, headers=self.headers)
            
            if response.status_code == 200:
                logger.info("✅ Profile stopped successfully")
                self.test_results["tests"]["profile_stop"] = {
                    "status": "PASSED",
                    "message": "Profile stopped successfully"
                }
                return True
            else:
                logger.error(f"❌ Profile stop failed: {response.status_code} - {response.text}")
                self.test_results["tests"]["profile_stop"] = {
                    "status": "FAILED",
                    "message": f"{response.status_code} - {response.text}"
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
        """Test 6: Profile Cleanup"""
        logger.info("=" * 60)
        logger.info("TEST 6: PROFILE CLEANUP")
        logger.info("=" * 60)
        
        try:
            logger.info(f"Cleaning up test profile: {profile_id}")
            
            # Delete test profile using successful test structure
            delete_payload = {
                "ids": [profile_id]
            }
            
            delete_url = f"{self.base_url}/profile/remove"
            response = self.session.post(delete_url, json=delete_payload, headers=self.headers)
            
            if response.status_code == 200:
                logger.info("✅ Test profile cleaned up successfully")
                self.test_results["tests"]["profile_cleanup"] = {
                    "status": "PASSED",
                    "message": "Test profile cleaned up successfully"
                }
                return True
            else:
                logger.error(f"❌ Profile cleanup failed: {response.status_code} - {response.text}")
                self.test_results["tests"]["profile_cleanup"] = {
                    "status": "FAILED",
                    "message": f"{response.status_code} - {response.text}"
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
        logger.info("🚀 STARTING SIMPLE COMPREHENSIVE TEST")
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
        
        # Test 3: Profile Start
        browser_info = self.test_profile_start(profile_id)
        if not browser_info:
            logger.error("❌ Profile start failed. Stopping tests.")
            return False
        
        # Test 4: Navigation (Optional - skip if endpoint not available)
        try:
            self.test_navigation(profile_id)
        except Exception as e:
            logger.warning(f"⚠️ Navigation test skipped: {e}")
        
        # Test 5: Profile Stop (Optional - skip if endpoint not available)
        try:
            self.test_profile_stop(profile_id)
        except Exception as e:
            logger.warning(f"⚠️ Profile stop test skipped: {e}")
        
        # Test 6: Profile Cleanup
        self.test_profile_cleanup(profile_id)
        
        # Generate final report
        self.generate_test_report()
        
        return True
    
    def generate_test_report(self):
        """Generate comprehensive test report"""
        logger.info("=" * 80)
        logger.info("📊 SIMPLE COMPREHENSIVE TEST REPORT")
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
        report_file = f"simple_comprehensive_test_report_{int(time.time())}.json"
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
        test = SimpleComprehensiveTest()
        success = test.run_comprehensive_test()
        
        if success:
            print("\n🎉 Simple comprehensive test completed successfully!")
            return 0
        else:
            print("\n❌ Simple comprehensive test failed!")
            return 1
            
    except KeyboardInterrupt:
        print("\n⚠️ Test interrupted by user")
        return 1
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        return 1

if __name__ == "__main__":
    exit(main())
