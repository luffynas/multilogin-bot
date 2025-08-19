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
            profile_data = {
                "name": name,
                "platform": "chrome",
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
                "screenResolution": fingerprint_config.get("screen_resolution", "1920x1080")
            }
            
            response = requests.post(
                f"{self.base_url}/api/v2/profile",
                headers=self.headers,
                json=profile_data,
                timeout=30
            )
            
            if response.status_code == 200:
                profile = response.json()
                self.logger.info(f"Profile created: {profile['uuid']}")
                return profile
            else:
                self.logger.error(f"Failed to create profile: {response.text}")
                return None
                
        except Exception as e:
            self.logger.error(f"Error creating profile: {str(e)}")
            return None
    
    def start_profile(self, profile_id: str) -> Optional[Dict]:
        """Start browser profile"""
        try:
            response = requests.post(
                f"{self.base_url}/api/v2/profile/start?profileId={profile_id}",
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
            response = requests.post(
                f"{self.base_url}/api/v2/profile/stop?profileId={profile_id}",
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
