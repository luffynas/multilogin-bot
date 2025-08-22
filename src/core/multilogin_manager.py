import requests
import time
import json
from typing import Dict, Any, Optional
import logging

class MultiloginManager:
    def __init__(self, api_key: str, base_url: str = "http://localhost:35000"):
        self.api_key = api_key
        self.base_url = base_url
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        self.logger = logging.getLogger(__name__)
    
    def create_profile(self, name: str, proxy_config: Dict, fingerprint_config: Dict) -> Dict:
        """Create new Multilogin profile with SOCKS5 proxy"""
        try:
            # ✅ FIXED: Dynamic OS and platform detection based on device type
            device_type = fingerprint_config.get("device_type", "desktop_windows")
            os_info = self._get_os_info_from_device_type(device_type)
            platform_info = self._get_platform_info_from_device_type(device_type)
            
            # ✅ IMPROVED: Use Browser Mimic X for better stealth
            browser_config = self._get_browser_config_for_device_type(device_type, os_info["os"])
            
            profile_data = {
                "name": name,
                "platform": "mimic",  # ✅ Browser Mimic X instead of "chrome"
                "browser": browser_config["browser"],  # ✅ Dynamic browser selection
                "proxy": {
                    "mode": "socks5",
                    "host": proxy_config["host"],
                    "port": proxy_config["port"],
                    "username": proxy_config["username"],
                    "password": proxy_config["password"]
                },
                "userAgent": fingerprint_config["user_agent"],
                "notes": f"Auto-generated for {proxy_config.get('geo', 'unknown')}",
                "timezone": fingerprint_config.get("timezone", "America/New_York"),
                "language": fingerprint_config.get("language", "en-US"),
                "screenResolution": fingerprint_config.get("screen_resolution", "1920x1080"),
                # ✅ FIXED: Dynamic OS and platform based on device type
                "tags": [],
                "folderId": None,
                "os": os_info["os"],
                "navigator": {
                    "userAgent": fingerprint_config["user_agent"],
                    "language": fingerprint_config.get("language", "en-US"),
                    "platform": platform_info["platform"]
                }
            }
            
            response = requests.post(
                f"{self.base_url}/api/v2/profile",
                headers=self.headers,
                json=profile_data,
                timeout=30
            )
            
            if response.status_code == 200:
                profile = response.json()
                self.logger.info(f"Profile created: {profile['uuid']} with OS: {os_info['os']}, Platform: {platform_info['platform']}, Browser: {browser_config['browser']} (Mimic X)")
                return profile
            else:
                self.logger.error(f"Failed to create profile: {response.text}")
                return None
                
        except Exception as e:
            self.logger.error(f"Error creating profile: {str(e)}")
            return None
    
    def _get_os_info_from_device_type(self, device_type: str) -> Dict:
        """Get OS information based on device type"""
        os_mapping = {
            "desktop_windows": {"os": "win", "name": "Windows"},
            "desktop_mac": {"os": "mac", "name": "macOS"},
            "desktop_linux": {"os": "lin", "name": "Linux"},
            "laptop_windows": {"os": "win", "name": "Windows"},
            "laptop_mac": {"os": "mac", "name": "macOS"},
            "laptop_linux": {"os": "lin", "name": "Linux"},
            "mobile_android": {"os": "android", "name": "Android"},
            "mobile_ios": {"os": "ios", "name": "iOS"},
            "tablet_android": {"os": "android", "name": "Android"},
            "tablet_ios": {"os": "ios", "name": "iOS"}
        }
        
        return os_mapping.get(device_type, {"os": "win", "name": "Windows"})
    
    def _get_platform_info_from_device_type(self, device_type: str) -> Dict:
        """Get platform information based on device type"""
        platform_mapping = {
            "desktop_windows": {"platform": "Win32", "architecture": "x64"},
            "desktop_mac": {"platform": "MacIntel", "architecture": "x64"},
            "desktop_linux": {"platform": "Linux x86_64", "architecture": "x64"},
            "laptop_windows": {"platform": "Win32", "architecture": "x64"},
            "laptop_mac": {"platform": "MacIntel", "architecture": "x64"},
            "laptop_linux": {"platform": "Linux x86_64", "architecture": "x64"},
            "mobile_android": {"platform": "Linux armv8l", "architecture": "arm64"},
            "mobile_ios": {"platform": "iPhone", "architecture": "arm64"},
            "tablet_android": {"platform": "Linux armv8l", "architecture": "arm64"},
            "tablet_ios": {"platform": "iPad", "architecture": "arm64"}
        }
        
        return platform_mapping.get(device_type, {"platform": "Win32", "architecture": "x64"})
    
    def _get_browser_config_for_device_type(self, device_type: str, os: str) -> Dict:
        """Get browser configuration based on device type and OS"""
        # Browser distribution based on device type and OS
        browser_distribution = {
            "desktop_windows": {
                "chrome": 0.65,    # 65% Chrome
                "firefox": 0.20,   # 20% Firefox
                "edge": 0.15       # 15% Edge
            },
            "desktop_mac": {
                "chrome": 0.50,    # 50% Chrome
                "safari": 0.35,    # 35% Safari
                "firefox": 0.15    # 15% Firefox
            },
            "desktop_linux": {
                "chrome": 0.60,    # 60% Chrome
                "firefox": 0.35,   # 35% Firefox
                "edge": 0.05       # 5% Edge
            },
            "laptop_windows": {
                "chrome": 0.70,    # 70% Chrome
                "firefox": 0.20,   # 20% Firefox
                "edge": 0.10       # 10% Edge
            },
            "laptop_mac": {
                "chrome": 0.55,    # 55% Chrome
                "safari": 0.30,    # 30% Safari
                "firefox": 0.15    # 15% Firefox
            },
            "laptop_linux": {
                "chrome": 0.65,    # 65% Chrome
                "firefox": 0.30,   # 30% Firefox
                "edge": 0.05       # 5% Edge
            },
            "mobile_android": {
                "chrome": 0.80,    # 80% Chrome
                "firefox": 0.15,   # 15% Firefox
                "samsung": 0.05    # 5% Samsung Internet
            },
            "mobile_ios": {
                "safari": 0.85,    # 85% Safari
                "chrome": 0.10,    # 10% Chrome
                "firefox": 0.05    # 5% Firefox
            },
            "tablet_android": {
                "chrome": 0.75,    # 75% Chrome
                "firefox": 0.20,   # 20% Firefox
                "samsung": 0.05    # 5% Samsung Internet
            },
            "tablet_ios": {
                "safari": 0.80,    # 80% Safari
                "chrome": 0.15,    # 15% Chrome
                "firefox": 0.05    # 5% Firefox
            }
        }
        
        # Get distribution for device type
        distribution = browser_distribution.get(device_type, browser_distribution["desktop_windows"])
        
        # Select browser based on weighted distribution
        import random
        browsers = list(distribution.keys())
        weights = list(distribution.values())
        
        selected_browser = random.choices(browsers, weights=weights, k=1)[0]
        
        return {
            "browser": selected_browser,
            "distribution": distribution
        }
    
    def start_profile(self, profile_id: str) -> Optional[Dict]:
        """Start browser profile"""
        try:
            # ✅ FIXED: Correct endpoint URL according to API documentation
            response = requests.post(
                f"{self.base_url}/api/v2/profile/{profile_id}/start",
                headers=self.headers,
                timeout=30
            )
            
            if response.status_code == 200:
                browser_info = response.json()
                self.logger.info(f"Profile started: {profile_id}")
                return browser_info
            else:
                self.logger.error(f"Failed to start profile: {response.text}")
                return None
                
        except Exception as e:
            self.logger.error(f"Error starting profile: {str(e)}")
            return None
    
    def stop_profile(self, profile_id: str) -> bool:
        """Stop browser profile"""
        try:
            # ✅ FIXED: Correct endpoint URL according to API documentation
            response = requests.post(
                f"{self.base_url}/api/v2/profile/{profile_id}/stop",
                headers=self.headers,
                timeout=30
            )
            
            if response.status_code == 200:
                self.logger.info(f"Profile stopped: {profile_id}")
                return True
            else:
                self.logger.error(f"Failed to stop profile: {response.text}")
                return False
                
        except Exception as e:
            self.logger.error(f"Error stopping profile: {str(e)}")
            return False
    
    def navigate_to_url(self, profile_id: str, url: str, referer: str = None) -> bool:
        """Navigate to URL with optional referer"""
        try:
            navigate_data = {"url": url}
            
            if referer:
                # Inject referer via JavaScript after navigation
                navigate_data["script"] = f"""
                Object.defineProperty(document, 'referrer', {{
                    get: () => '{referer}'
                }});
                """
            
            # ✅ FIXED: Correct endpoint URL according to API documentation
            response = requests.post(
                f"{self.base_url}/api/v2/profile/{profile_id}/navigate",
                headers=self.headers,
                json=navigate_data,
                timeout=30
            )
            
            if response.status_code == 200:
                self.logger.info(f"Navigated to {url} with referer: {referer}")
                return True
            else:
                self.logger.error(f"Failed to navigate: {response.text}")
                return False
                
        except Exception as e:
            self.logger.error(f"Error navigating: {str(e)}")
            return False
    
    def execute_script(self, profile_id: str, script: str) -> Optional[Dict]:
        """Execute JavaScript in browser"""
        try:
            # ✅ FIXED: Correct endpoint URL according to API documentation
            response = requests.post(
                f"{self.base_url}/api/v2/profile/{profile_id}/execute",
                headers=self.headers,
                json={"script": script},
                timeout=30
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                self.logger.error(f"Failed to execute script: {response.text}")
                return None
                
        except Exception as e:
            self.logger.error(f"Error executing script: {str(e)}")
            return None
    
    def get_profile_info(self, profile_id: str) -> Optional[Dict]:
        """Get profile information"""
        try:
            # ✅ FIXED: Correct endpoint URL according to API documentation
            response = requests.get(
                f"{self.base_url}/api/v2/profile/{profile_id}",
                headers=self.headers,
                timeout=30
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                self.logger.error(f"Failed to get profile info: {response.text}")
                return None
                
        except Exception as e:
            self.logger.error(f"Error getting profile info: {str(e)}")
            return None
    
    def delete_profile(self, profile_id: str) -> bool:
        """Delete profile"""
        try:
            # ✅ ADDED: Delete profile endpoint according to API documentation
            response = requests.delete(
                f"{self.base_url}/api/v2/profile/{profile_id}",
                headers=self.headers,
                timeout=30
            )
            
            if response.status_code == 200:
                self.logger.info(f"Profile deleted: {profile_id}")
                return True
            else:
                self.logger.error(f"Failed to delete profile: {response.text}")
                return False
                
        except Exception as e:
            self.logger.error(f"Error deleting profile: {str(e)}")
            return False
    
    def get_all_profiles(self) -> Optional[Dict]:
        """Get all profiles"""
        try:
            # ✅ ADDED: Get all profiles endpoint according to API documentation
            response = requests.get(
                f"{self.base_url}/api/v2/profile",
                headers=self.headers,
                timeout=30
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                self.logger.error(f"Failed to get profiles: {response.text}")
                return None
                
        except Exception as e:
            self.logger.error(f"Error getting profiles: {str(e)}")
            return None
    
    def update_profile(self, profile_id: str, profile_data: Dict) -> Optional[Dict]:
        """Update profile"""
        try:
            # ✅ ADDED: Update profile endpoint according to API documentation
            response = requests.put(
                f"{self.base_url}/api/v2/profile/{profile_id}",
                headers=self.headers,
                json=profile_data,
                timeout=30
            )
            
            if response.status_code == 200:
                self.logger.info(f"Profile updated: {profile_id}")
                return response.json()
            else:
                self.logger.error(f"Failed to update profile: {response.text}")
                return None
                
        except Exception as e:
            self.logger.error(f"Error updating profile: {str(e)}")
            return None
