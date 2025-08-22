import requests
import time
import json
import hashlib
from typing import Dict, Any, Optional
import logging

class MultiloginManager:
    def __init__(self, username: str, password: str, base_url: str = "https://api.multilogin.com", launcher_url: str = "https://launcher.mlx.yt:45001/api/v1"):
        self.username = username
        self.password = password
        self.base_url = base_url
        self.launcher_url = launcher_url
        self.token = None
        self.logger = logging.getLogger(__name__)
        
        # ✅ MULTILOGIN X AUTOMATIC SIGN IN
        self._sign_in()
    
    def _sign_in(self):
        """Sign in to Multilogin X and get bearer token"""
        try:
            # ✅ IMPLEMENTATION BASED ON OFFICIAL DOCUMENTATION
            sign_url = f"{self.base_url}/user/signin"
            headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
            }
            
            # ✅ MD5 ENCRYPTION FOR PASSWORD (as per documentation)
            payload = {
                "email": self.username,
                "password": str(hashlib.md5(self.password.encode()).hexdigest()),
            }
            
            # POST request to sign in
            resp = requests.post(sign_url, json=payload, headers=headers)
            resp_json = resp.json()
            
            # Get bearer token
            self.token = resp_json["data"]["token"]
            self.logger.info(f"Successfully signed in to Multilogin X with token: {self.token[:20]}...")
            
            # Set headers with bearer token based on official curl example
            self.headers = {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "X-Strict-Mode": "true",  # Based on official curl example
                "Authorization": f"Bearer {self.token}"
            }
            
        except Exception as e:
            self.logger.error(f"Failed to sign in to Multilogin X: {str(e)}")
            raise Exception(f"Multilogin X authentication failed: {str(e)}")
    
    def _refresh_token_if_needed(self):
        """Refresh token if expired"""
        if not self.token:
            self._sign_in()
    
    def create_profile(self, name: str, proxy_config: Dict, fingerprint_config: Dict) -> Dict:
        """Create new Multilogin X profile with SOCKS5 proxy"""
        try:
            self._refresh_token_if_needed()
            
            # ✅ FIXED: Dynamic OS and platform detection based on device type
            device_type = fingerprint_config.get("device_type", "desktop_windows")
            os_info = self._get_os_info_from_device_type(device_type)
            platform_info = self._get_platform_info_from_device_type(device_type)
            
            # ✅ IMPROVED: Use correct platform according to API documentation
            browser_config = self._get_browser_config_for_device_type(device_type, os_info["os"])
            
            # ✅ FIXED: Correct payload structure based on official curl example
            profile_data = {
                "name": name,
                "browser_type": "chrome",  # Based on curl example
                "folder_id": None,
                "os_type": os_info["os"],
                "core_version": 1,
                "core_minor_version": 0,
                "times": 1,
                "notes": f"Auto-generated for {proxy_config.get('geo', 'unknown')}",
                "parameters": {
                    "flags": {
                        "audio_masking": "true",
                        "fonts_masking": "true",
                        "geolocation_masking": "true",
                        "geolocation_popup": "true",
                        "graphics_masking": "true",
                        "graphics_noise": "true",
                        "localization_masking": "true",
                        "media_devices_masking": "true",
                        "navigator_masking": "true",
                        "ports_masking": "true",
                        "proxy_masking": "true",
                        "screen_masking": "true",
                        "quic_mode": "true",
                        "timezone_masking": "true",
                        "webrtc_masking": "true",
                        "canvas_noise": "true",
                        "startup_behavior": "normal"
                    },
                    "storage": {
                        "is_local": False,
                        "save_service_worker": True
                    },
                    "fingerprint": {
                        "navigator": {
                            "hardware_concurrency": 8,
                            "platform": platform_info["platform"],
                            "user_agent": fingerprint_config["user_agent"],
                            "os_cpu": "x64"
                        },
                        "localization": {
                            "languages": fingerprint_config.get("language", "en-US"),
                            "locale": fingerprint_config.get("language", "en-US"),
                            "accept_languages": fingerprint_config.get("language", "en-US")
                        },
                        "timezone": {
                            "zone": fingerprint_config.get("timezone", "America/New_York")
                        },
                        "graphic": {
                            "renderer": "ANGLE (Intel, Intel(R) UHD Graphics 620 Direct3D11 vs_5_0 ps_5_0, D3D11)",
                            "vendor": "Intel Inc."
                        },
                        "webrtc": {
                            "public_ip": proxy_config["host"]
                        },
                        "media_devices": {
                            "audio_inputs": 1,
                            "audio_outputs": 1,
                            "video_inputs": 1
                        },
                        "screen": {
                            "height": 1080,
                            "pixel_ratio": 1.0,
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
                                {"flag": "--disable-web-security", "value": True},
                                {"flag": "--disable-features", "value": True}
                            ]
                        }
                    },
                    "proxy": {
                        "host": proxy_config["host"],
                        "type": "socks5",
                        "port": proxy_config["port"],
                        "username": proxy_config["username"],
                        "password": proxy_config["password"],
                        "save_traffic": False
                    },
                    "custom_start_urls": []
                }
            }
            
            # ✅ FIXED: Correct endpoint URL according to official curl example
            response = requests.post(
                f"{self.base_url}/profile/create",  # ✅ Correct endpoint as per official curl example
                headers=self.headers,
                json=profile_data,
                timeout=30
            )
            
            if response.status_code == 200:
                profile = response.json()
                self.logger.info(f"Profile created: {profile['uuid']} with OS: {os_info['os']}, Platform: {platform_info['platform']}, Browser: {browser_config['browser']} (Multilogin X)")
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
            self._refresh_token_if_needed()
            
            # ✅ FIXED: Correct endpoint URL based on official structure
            response = requests.post(
                f"{self.base_url}/profile/{profile_id}/start",
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
            self._refresh_token_if_needed()
            
            # ✅ FIXED: Correct endpoint URL based on official structure
            response = requests.post(
                f"{self.base_url}/profile/{profile_id}/stop",
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
            self._refresh_token_if_needed()
            
            navigate_data = {"url": url}
            
            if referer:
                # Inject referer via JavaScript after navigation
                navigate_data["script"] = f"""
                Object.defineProperty(document, 'referrer', {{
                    get: () => '{referer}'
                }});
                """
            
            # ✅ FIXED: Correct endpoint URL based on official structure
            response = requests.post(
                f"{self.base_url}/profile/{profile_id}/navigate",
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
            self._refresh_token_if_needed()
            
            # ✅ FIXED: Correct endpoint URL based on official structure
            response = requests.post(
                f"{self.base_url}/profile/{profile_id}/execute",
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
            self._refresh_token_if_needed()
            
            # ✅ FIXED: Correct endpoint URL based on official structure
            response = requests.get(
                f"{self.base_url}/profile/{profile_id}",
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
            self._refresh_token_if_needed()
            
            # ✅ ADDED: Delete profile endpoint based on official structure
            response = requests.delete(
                f"{self.base_url}/profile/{profile_id}",
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
            self._refresh_token_if_needed()
            
            # ✅ ADDED: Get all profiles endpoint based on official structure
            response = requests.get(
                f"{self.base_url}/profile",
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
            self._refresh_token_if_needed()
            
            # ✅ ADDED: Update profile endpoint based on official structure
            response = requests.put(
                f"{self.base_url}/profile/{profile_id}",
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
