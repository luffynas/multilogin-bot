"""
Multilogin X API Client for Profile Management
Handles authentication, profile creation, and management using Multilogin X API
"""

import requests
import json
import time
import logging
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
import os
import random
from base_classes import ConfigLoader, Utils
try:
    from .referer_simulator import RefererSimulator
except ImportError:
    from referer_simulator import RefererSimulator

@dataclass
class ProfileData:
    profile_id: str
    folder_id: str
    name: str
    proxy: Optional[str] = None
    fingerprint: Optional[Dict] = None
    created_at: Optional[str] = None

class MultiloginXAPI:
    def __init__(self, config_path: str = "../config/config.yaml"):
        """Initialize Multilogin X API client"""
        self.config = ConfigLoader.load_config(config_path)
        self.base_url = self.config['multilogin']['base_url']
        self.launcher_url = self.config['multilogin']['launcher_url']
        self.username = self.config['multilogin']['username']
        self.password = self.config['multilogin']['password']
        self.session = requests.Session()
        self.bearer_token = None
        self.refresh_token = None
        self.logger = logging.getLogger(__name__)
        
        # Initialize referer simulator
        self.referer_simulator = RefererSimulator(self.config)
        
    def _hash_password(self, password: str) -> str:
        """Hash password using MD5 as required by Multilogin X API"""
        return Utils.hash_password(password)
    
    def authenticate(self) -> bool:
        """Authenticate with Multilogin X API and get bearer token"""
        try:
            auth_url = f"{self.base_url}/user/signin"
            
            # Hash password using MD5
            hashed_password = self._hash_password(self.password)
            
            auth_data = {
                "email": self.username,
                "password": hashed_password
            }
            
            headers = {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
            
            response = self.session.post(auth_url, json=auth_data, headers=headers)
            response.raise_for_status()
            
            auth_response = response.json()
            
            if auth_response.get('status', {}).get('http_code') == 200:
                data = auth_response.get('data', {})
                self.bearer_token = data.get('token')
                self.refresh_token = data.get('refresh_token')
                
                if self.bearer_token:
                    self.session.headers.update({
                        'Authorization': f'Bearer {self.bearer_token}',
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    })
                    self.logger.info("Successfully authenticated with Multilogin X API")
                    return True
                else:
                    self.logger.error("Authentication failed: No token in response")
                    return False
            else:
                self.logger.error(f"Authentication failed: {auth_response}")
                return False
                
        except requests.exceptions.RequestException as e:
            self.logger.error(f"Authentication error: {e}")
            return False
    
    def refresh_auth_token(self) -> bool:
        """Refresh authentication token"""
        try:
            if not self.refresh_token:
                return self.authenticate()
            
            refresh_url = f"{self.base_url}/user/refresh_token"
            refresh_data = {
                "refresh_token": self.refresh_token
            }
            
            headers = {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
            
            response = self.session.post(refresh_url, json=refresh_data, headers=headers)
            response.raise_for_status()
            
            refresh_response = response.json()
            
            if refresh_response.get('status', {}).get('http_code') == 200:
                data = refresh_response.get('data', {})
                self.bearer_token = data.get('token')
                self.refresh_token = data.get('refresh_token')
                
                if self.bearer_token:
                    self.session.headers.update({
                        'Authorization': f'Bearer {self.bearer_token}',
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    })
                    self.logger.info("Successfully refreshed authentication token")
                    return True
            
            return False
            
        except requests.exceptions.RequestException as e:
            self.logger.error(f"Token refresh error: {e}")
            return False
    
    def _get_random_target_websites(self, count: int = 5) -> List[str]:
        """Get random target websites from configuration"""
        return Utils.get_random_target_websites(self.config, count)

    def get_folders(self) -> List[Dict]:
        """Get list of available folders from workspace"""
        try:
            if not self.bearer_token:
                if not self.authenticate():
                    return []
            
            # Use the correct endpoint for getting folders
            folders_url = f"{self.base_url}/workspace/folders"
            
            self.logger.info(f"Getting folders from: {folders_url}")
            
            response = self.session.get(folders_url)
            response.raise_for_status()
            
            folders_response = response.json()
            
            if folders_response.get('status', {}).get('http_code') == 200:
                folders_data = folders_response.get('data', {}).get('folders', [])
                self.logger.info(f"Successfully retrieved {len(folders_data)} folders")
                return folders_data
            else:
                self.logger.error(f"Failed to get folders: {folders_response}")
                return []
                
        except requests.exceptions.RequestException as e:
            self.logger.error(f"Error getting folders: {e}")
            if hasattr(e, 'response') and e.response is not None:
                try:
                    error_response = e.response.json()
                    self.logger.error(f"Error response: {error_response}")
                except:
                    self.logger.error(f"Error response text: {e.response.text}")
            return []

    def get_default_folder_id(self) -> str:
        """Get the default folder ID for profile creation"""
        folders = self.get_folders()
        
        if not folders:
            self.logger.warning("No folders found, using 'default' as folder_id")
            return "default"
        
        # Look for default folder
        for folder in folders:
            if folder.get('name', '').lower() == 'default folder':
                folder_id = folder.get('folder_id')
                self.logger.info(f"Found default folder: {folder.get('name')} (ID: {folder_id})")
                return folder_id
        
        # If no default folder found, use the first folder
        first_folder = folders[0]
        folder_id = first_folder.get('folder_id')
        self.logger.info(f"Using first available folder: {first_folder.get('name')} (ID: {folder_id})")
        return folder_id

    def save_folders_data(self, folders: List[Dict]) -> bool:
        """Save folders data to file"""
        try:
            import json
            import os
            
            # Ensure data directory exists
            os.makedirs('data', exist_ok=True)
            
            folders_file = 'data/folders.json'
            
            # Prepare data for saving
            folders_data = {
                'last_updated': time.strftime('%Y-%m-%d %H:%M:%S'),
                'total_folders': len(folders),
                'folders': folders
            }
            
            with open(folders_file, 'w', encoding='utf-8') as f:
                json.dump(folders_data, f, indent=2, ensure_ascii=False)
            
            self.logger.info(f"✅ Saved {len(folders)} folders to {folders_file}")
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Error saving folders data: {e}")
            return False

    def load_folders_data(self) -> List[Dict]:
        """Load folders data from file"""
        try:
            import json
            
            folders_file = 'data/folders.json'
            
            if not os.path.exists(folders_file):
                self.logger.info("No saved folders data found")
                return []
            
            with open(folders_file, 'r', encoding='utf-8') as f:
                folders_data = json.load(f)
            
            folders = folders_data.get('folders', [])
            last_updated = folders_data.get('last_updated', 'Unknown')
            
            self.logger.info(f"✅ Loaded {len(folders)} folders from {folders_file} (updated: {last_updated})")
            return folders
            
        except Exception as e:
            self.logger.error(f"❌ Error loading folders data: {e}")
            return []

    def refresh_and_save_folders(self) -> List[Dict]:
        """Refresh folders from API and save to file"""
        folders = self.get_folders()
        if folders:
            self.save_folders_data(folders)
        return folders

    def get_folder_by_name(self, folder_name: str) -> Optional[Dict]:
        """Get folder by name from saved data"""
        folders = self.load_folders_data()
        
        for folder in folders:
            if folder.get('name', '').lower() == folder_name.lower():
                return folder
        
        # If exact match not found, try partial match
        for folder in folders:
            if folder_name.lower() in folder.get('name', '').lower():
                return folder
        
        return None

    def get_folder_by_id(self, folder_id: str) -> Optional[Dict]:
        """Get folder by ID from saved data"""
        folders = self.load_folders_data()
        
        for folder in folders:
            if folder.get('folder_id') == folder_id:
                return folder
        
        return None

    def list_available_folders(self) -> None:
        """List all available folders with their details"""
        folders = self.load_folders_data()
        
        if not folders:
            self.logger.info("No folders found. Run refresh_and_save_folders() first.")
            return
        
        self.logger.info(f"📁 Available folders ({len(folders)} total):")
        for i, folder in enumerate(folders, 1):
            self.logger.info(f"  {i}. {folder.get('name')}")
            self.logger.info(f"     ID: {folder.get('folder_id')}")
            self.logger.info(f"     Profiles: {folder.get('profiles_count', 0)}")
            self.logger.info(f"     Created: {folder.get('created_at', 'Unknown')}")
            if folder.get('comment'):
                self.logger.info(f"     Comment: {folder.get('comment')}")
            self.logger.info("")

    def create_profile(self, name: str, proxy: str = None, fingerprint: Dict = None, 
                      provider: str = "multilogin_residential", personality: str = None,
                      geo_location: str = "US", folder_id: str = None) -> Optional[ProfileData]:
        """Create a new profile with specified proxy, fingerprint, and referer using Multilogin X API"""
        try:
            if not self.bearer_token:
                if not self.authenticate():
                    return None
            
            # Generate referer configuration for this profile
            referer_config = self.referer_simulator.generate_referer_for_profile(
                personality, geo_location
            )
            
            # Prepare profile data for Multilogin X API (matching Postman structure)
            profile_data = {
                "name": name,
                "browser_type": "mimic",
                "folder_id": folder_id if folder_id else self.get_default_folder_id(),
                "os_type": "windows",
                "core_version": 135,  # Updated to minimum required version
                "notes": f"Created by automate bot - {geo_location} - {provider}",
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
                        "screen_masking": "custom",
                        "timezone_masking": "custom",
                        "webrtc_masking": "custom",
                        "canvas_noise": "mask",
                        "startup_behavior": "custom"
                    },
                    "storage": {
                        "is_local": False,
                        "save_service_worker": True
                    },
                    "fingerprint": {},  # Will be populated below
                    "custom_start_urls": self._get_random_target_websites()  # Max 5 URLs from config
                }
            }
            
            # Add proxy configuration based on provider (always SOCKS5)
            if proxy and provider == "socksescort":
                # External SOCKS5 proxy (SocksEscort)
                proxy_host, proxy_port = proxy.split(':')
                profile_data["parameters"]["proxy"] = {
                    "host": proxy_host,
                    "type": "socks5",  # Always use SOCKS5
                    "port": int(proxy_port),
                    "username": self.config['proxy']['providers'][1]['credentials']['username'],
                    "password": self.config['proxy']['providers'][1]['credentials']['password'],
                    "save_traffic": False
                }
            elif provider == "multilogin_residential":
                # Use Multilogin built-in residential proxies (SOCKS5)
                # For residential proxies, we don't specify proxy details - Multilogin handles it
                # Set proxy_masking to "disabled" when not using external proxy
                profile_data["parameters"]["flags"]["proxy_masking"] = "disabled"
            
            # Add fingerprint if provided
            if fingerprint:
                converted_fingerprint = self._convert_fingerprint_format(fingerprint)
            
            # Fix User Agent consistency with OS type
            if profile_data["os_type"] == "windows" and "navigator" in converted_fingerprint:
                # Force Windows User Agent for Windows OS
                self.logger.info("🔧 Fixing User Agent for Windows OS")
                converted_fingerprint["navigator"]["user_agent"] = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
                converted_fingerprint["navigator"]["platform"] = "Win32"
                self.logger.info(f"✅ Updated User Agent: {converted_fingerprint['navigator']['user_agent']}")
            
            # Fix WebRTC public IP if null
            if "webrtc" in converted_fingerprint and converted_fingerprint["webrtc"].get("public_ip") is None:
                converted_fingerprint["webrtc"]["public_ip"] = "8.8.8.8"  # Use Google DNS as fallback
            
            profile_data["parameters"]["fingerprint"] = converted_fingerprint
            
            # Add referer configuration to profile (temporarily disabled for debugging)
            # if referer_config.get("referer"):
            #     profile_data["parameters"]["referer"] = {
            #         "url": referer_config["referer"],
            #         "type": referer_config["type"],
            #         "description": referer_config["description"]
            #     }
            #     
            #     # Add referer-specific settings
            #     if referer_config.get("multilogin_config"):
            #         profile_data["parameters"]["referer"].update(referer_config["multilogin_config"])
            
            # Create profile using permanent profile endpoint
            create_url = f"{self.base_url}/profile/create"
            
            # Debug logging
            self.logger.info(f"Creating profile with URL: {create_url}")
            self.logger.debug(f"Profile data: {profile_data}")
            
            response = self.session.post(create_url, json=profile_data)
            response.raise_for_status()
            
            profile_response = response.json()
            
            # Debug logging for response structure
            self.logger.info(f"Full API response: {profile_response}")
            
            if profile_response.get('status', {}).get('http_code') in [200, 201]:  # 201 for created
                data = profile_response.get('data', {})
                
                # Handle different response structures
                if 'ids' in data:
                    # Permanent profile returns array of IDs
                    profile_ids = data.get('ids', [])
                    profile_id = profile_ids[0] if profile_ids else None
                else:
                    # Quick profile returns single ID
                    profile_id = data.get('profile_id') or data.get('id')
                
                # Use provided folder_id or get default
                if not folder_id:
                    folder_id = self.get_default_folder_id()
                port = data.get('port', 'N/A')  # Port not available for permanent profiles
                
                if profile_id:
                    profile = ProfileData(
                        profile_id=profile_id,
                        folder_id=folder_id,
                        name=name,
                        proxy=proxy,
                        fingerprint=fingerprint,
                        created_at=time.strftime('%Y-%m-%d %H:%M:%S')
                    )
                    self.logger.info(f"Successfully created profile: {name} (ID: {profile_id}, Port: {port}) with {provider} SOCKS5 proxy and {referer_config['type']} referer")
                    return profile
                else:
                    self.logger.error("Profile creation failed: No profile ID in response")
                    return None
            else:
                self.logger.error(f"Profile creation failed: {profile_response}")
                return None
                
        except requests.exceptions.RequestException as e:
            self.logger.error(f"Profile creation error: {e}")
            if hasattr(e, 'response') and e.response is not None:
                try:
                    error_response = e.response.json()
                    self.logger.error(f"Error response: {error_response}")
                except:
                    self.logger.error(f"Error response text: {e.response.text}")
            return None
    
    def _convert_fingerprint_format(self, fingerprint: Dict) -> Dict:
        """Convert fingerprint to Multilogin X API format with proxy location consistency"""
        try:
            # Get country from fingerprint for consistency
            country = fingerprint.get("country", "US")
            
            # Convert our fingerprint format to Multilogin X format
            mlx_fingerprint = {
                "navigator": {
                    "hardware_concurrency": fingerprint.get("hardware_concurrency", 8),
                    "platform": fingerprint.get("platform", "Win32"),
                    "user_agent": fingerprint.get("userAgent", ""),
                    "os_cpu": ""
                },
                "localization": {
                    "languages": fingerprint.get("language", "en-US"),
                    "locale": fingerprint.get("locale", "en-US"),
                    "accept_languages": "en-US,en;q=0.5"
                },
                "timezone": {
                    "zone": fingerprint.get("timezone", "America/New_York")
                },
                "graphic": {
                    "renderer": fingerprint.get("webgl", {}).get("renderer", ""),
                    "vendor": fingerprint.get("webgl", {}).get("vendor", "")
                },
                "webrtc": {
                    "public_ip": fingerprint.get("webrtc", {}).get("publicIP", "")
                },
                "media_devices": {
                    "audio_inputs": 1,
                    "audio_outputs": 1,
                    "video_inputs": 2
                },
                "screen": {
                    "height": fingerprint.get("resolution", {}).get("height", 1080),
                    "pixel_ratio": 1,
                    "width": fingerprint.get("resolution", {}).get("width", 1920)
                },
                "geolocation": {
                    "accuracy": fingerprint.get("geolocation", {}).get("accuracy", 100),
                    "altitude": fingerprint.get("geolocation", {}).get("altitude", 100),
                    "latitude": fingerprint.get("geolocation", {}).get("latitude", 40.7128),
                    "longitude": fingerprint.get("geolocation", {}).get("longitude", -74.0060)
                },
                "ports": [12345],
                "fonts": ["81938139"]
            }
            
            # Log fingerprint consistency
            self.logger.info(f"Converted fingerprint for country: {country}")
            self.logger.debug(f"Timezone: {mlx_fingerprint['timezone']['zone']}")
            self.logger.debug(f"Language: {mlx_fingerprint['localization']['languages']}")
            self.logger.debug(f"Geolocation: {mlx_fingerprint['geolocation']['latitude']}, {mlx_fingerprint['geolocation']['longitude']}")
            
            return mlx_fingerprint
            
        except Exception as e:
            self.logger.error(f"Error converting fingerprint format: {e}")
            return {}
    
    def get_profiles(self) -> List[Dict]:
        """Get all profiles"""
        try:
            if not self.bearer_token:
                if not self.authenticate():
                    return []
            
            profiles_url = f"{self.base_url}/profile"
            response = self.session.get(profiles_url)
            response.raise_for_status()
            
            profiles_response = response.json()
            
            if profiles_response.get('status', {}).get('http_code') == 200:
                return profiles_response.get('data', [])
            else:
                self.logger.error(f"Error getting profiles: {profiles_response}")
                return []
            
        except requests.exceptions.RequestException as e:
            self.logger.error(f"Error getting profiles: {e}")
            return []
    
    def get_profile(self, profile_id: str) -> Optional[Dict]:
        """Get specific profile details"""
        try:
            if not self.bearer_token:
                if not self.authenticate():
                    return None
            
            profile_url = f"{self.base_url}/profiles/{profile_id}"
            response = self.session.get(profile_url)
            response.raise_for_status()
            
            profile_response = response.json()
            
            if profile_response.get('status', {}).get('http_code') == 200:
                return profile_response.get('data', {})
            else:
                self.logger.error(f"Error getting profile: {profile_response}")
                return None
            
        except requests.exceptions.RequestException as e:
            self.logger.error(f"Error getting profile: {e}")
            return None
    
    def start_profile(self, profile_id: str, folder_id: str = "default", fresh_start: bool = True, use_start_url: bool = True) -> Optional[str]:
        """Start a profile and return the debugging URL"""
        try:
            if not self.bearer_token:
                if not self.authenticate():
                    return None
            
            start_url = f"{self.launcher_url}/profile/f/{folder_id}/p/{profile_id}/start"
            params = {
                "automation_type": "selenium",
                "headless_mode": "false"
            }
            
            # Add fresh start parameters if requested
            if fresh_start:
                params.update({
                    "clear_cache": "true",
                    "clear_cookies": "true",
                    "clear_storage": "true",
                    "reset_state": "true"
                })
                self.logger.info(f"Starting profile with fresh state: {profile_id}")
            else:
                self.logger.info(f"Starting profile with existing state: {profile_id}")
            
            # Add parameter to use Start URL from Multilogin profile
            if use_start_url:
                params.update({
                    "use_start_url": "true"
                })
                self.logger.info(f"Using Start URL from Multilogin profile: {profile_id}")
            
            response = self.session.get(start_url, params=params)
            response.raise_for_status()
            
            start_response = response.json()
            
            if start_response.get('status', {}).get('http_code') == 200:
                data = start_response.get('data', {})
                debugging_url = data.get('debugging_url')
                
                if debugging_url:
                    self.logger.info(f"Successfully started profile: {profile_id}")
                    return debugging_url
                else:
                    self.logger.error("Profile start failed: No debugging URL in response")
                    return None
            else:
                self.logger.error(f"Profile start failed: {start_response}")
                return None
                
        except requests.exceptions.RequestException as e:
            self.logger.error(f"Profile start error: {e}")
            return None
    
    def clear_profile_data(self, profile_id: str, folder_id: str = "default") -> bool:
        """Clear all profile data (cache, cookies, storage)"""
        try:
            if not self.bearer_token:
                if not self.authenticate():
                    return False
            
            clear_url = f"{self.launcher_url}/profile/f/{folder_id}/p/{profile_id}/clear"
            params = {
                "clear_cache": "true",
                "clear_cookies": "true", 
                "clear_local_storage": "true",
                "clear_session_storage": "true",
                "clear_indexed_db": "true",
                "clear_service_workers": "true"
            }
            
            response = self.session.get(clear_url, params=params)
            response.raise_for_status()
            
            clear_response = response.json()
            
            if clear_response.get('status', {}).get('http_code') == 200:
                self.logger.info(f"Successfully cleared profile data: {profile_id}")
                return True
            else:
                self.logger.error(f"Profile clear failed: {clear_response}")
                return False
                
        except requests.exceptions.RequestException as e:
            self.logger.error(f"Profile clear error: {e}")
            return False
    
    def reset_profile_state(self, profile_id: str, folder_id: str = "default") -> bool:
        """Reset profile to initial state"""
        try:
            if not self.bearer_token:
                if not self.authenticate():
                    return False
            
            reset_url = f"{self.launcher_url}/profile/f/{folder_id}/p/{profile_id}/reset"
            
            response = self.session.get(reset_url)
            response.raise_for_status()
            
            reset_response = response.json()
            
            if reset_response.get('status', {}).get('http_code') == 200:
                self.logger.info(f"Successfully reset profile state: {profile_id}")
                return True
            else:
                self.logger.error(f"Profile reset failed: {reset_response}")
                return False
                
        except requests.exceptions.RequestException as e:
            self.logger.error(f"Profile reset error: {e}")
            return False
    
    def stop_profile(self, profile_id: str, folder_id: str = "default") -> bool:
        """Stop a running profile using the correct endpoint"""
        try:
            if not self.bearer_token:
                if not self.authenticate():
                    return False
            
            # Use the correct endpoint format as provided
            stop_url = f"{self.launcher_url}/profile/stop/p/{profile_id}"
            
            response = self.session.get(stop_url)
            response.raise_for_status()
            
            stop_response = response.json()
            
            if stop_response.get('status', {}).get('http_code') == 200:
                self.logger.info(f"Successfully stopped profile: {profile_id}")
                return True
            else:
                self.logger.error(f"Profile stop failed: {stop_response}")
                return False
            
        except requests.exceptions.RequestException as e:
            self.logger.error(f"Profile stop error: {e}")
            return False
    
    def delete_profile(self, profile_id: str) -> bool:
        """Delete a profile"""
        try:
            if not self.bearer_token:
                if not self.authenticate():
                    return False
            
            delete_url = f"{self.base_url}/profile/{profile_id}"
            response = self.session.delete(delete_url)
            response.raise_for_status()
            
            delete_response = response.json()
            
            if delete_response.get('status', {}).get('http_code') == 200:
                self.logger.info(f"Successfully deleted profile: {profile_id}")
                return True
            else:
                self.logger.error(f"Profile deletion failed: {delete_response}")
                return False
            
        except requests.exceptions.RequestException as e:
            self.logger.error(f"Profile deletion error: {e}")
            return False
    
    def update_profile_proxy(self, profile_id: str, proxy_config: dict) -> bool:
        """
        Update proxy configuration for an existing profile using the correct API endpoint
        
        Args:
            profile_id (str): The profile ID to update
            proxy_config (dict): Proxy configuration
                {
                    "type": "http|https|socks4|socks5",
                    "host": "proxy.host.com",
                    "port": 8080,
                    "username": "user",  # optional
                    "password": "pass",  # optional
                    "save_traffic": false  # optional
                }
        
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            if not self.bearer_token:
                if not self.authenticate():
                    return False
            
            # Use the correct endpoint from Postman collection
            update_url = f"{self.base_url}/profile/partial_update"
            
            # Prepare the update payload
            payload = {
                "profile_id": profile_id,
                "proxy": proxy_config
            }
            
            self.logger.info(f"🔄 Updating proxy for profile {profile_id}...")
            response = self.session.post(update_url, json=payload)
            response.raise_for_status()
            
            update_response = response.json()
            
            if update_response.get('status', {}).get('http_code') in [200, 201]:
                self.logger.info(f"✅ Proxy updated successfully for profile {profile_id}")
                return True
            else:
                self.logger.error(f"❌ Failed to update proxy for profile {profile_id}: {update_response}")
                return False
                
        except requests.exceptions.RequestException as e:
            self.logger.error(f"❌ Error updating proxy for profile {profile_id}: {e}")
            return False

    def remove_profile_proxy(self, profile_id: str) -> bool:
        """
        Remove proxy configuration from an existing profile
        
        Args:
            profile_id (str): The profile ID to update
        
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            if not self.bearer_token:
                if not self.authenticate():
                    return False
            
            # Use the correct endpoint from Postman collection
            update_url = f"{self.base_url}/profile/partial_update"
            
            # Prepare the update payload with empty proxy to remove it
            payload = {
                "profile_id": profile_id,
                "proxy": None
            }
            
            self.logger.info(f"🔄 Removing proxy from profile {profile_id}...")
            response = self.session.post(update_url, json=payload)
            response.raise_for_status()
            
            update_response = response.json()
            
            if update_response.get('status', {}).get('http_code') in [200, 201]:
                self.logger.info(f"✅ Proxy removed successfully from profile {profile_id}")
                return True
            else:
                self.logger.error(f"❌ Failed to remove proxy from profile {profile_id}: {update_response}")
                return False
                
        except requests.exceptions.RequestException as e:
            self.logger.error(f"❌ Error removing proxy from profile {profile_id}: {e}")
            return False

    def validate_proxy(self, proxy_config: dict) -> bool:
        """
        Validate proxy configuration using Multilogin's validation endpoint
        
        Args:
            proxy_config (dict): Proxy configuration
                {
                    "type": "http|https|socks4|socks5",
                    "host": "proxy.host.com",
                    "port": 8080,
                    "username": "user",  # optional
                    "password": "pass"   # optional
                }
        
        Returns:
            bool: True if proxy is valid, False otherwise
        """
        try:
            # Use the correct launcher URL for proxy validation
            validate_url = "https://launcher.mlx.yt:45001/api/v1/proxy/validate"
            
            # Prepare the validation payload
            payload = {
                "type": proxy_config.get("type", "http"),
                "host": proxy_config["host"],
                "port": proxy_config["port"]
            }
            
            # Add optional credentials if provided
            if "username" in proxy_config:
                payload["username"] = proxy_config["username"]
            if "password" in proxy_config:
                payload["password"] = proxy_config["password"]
            
            self.logger.info(f"🔍 Validating proxy {proxy_config['host']}:{proxy_config['port']}...")
            response = self.session.post(validate_url, json=payload, timeout=30)
            response.raise_for_status()
            
            validate_response = response.json()
            
            if validate_response.get('status', {}).get('http_code') == 200:
                self.logger.info(f"✅ Proxy validation successful for {proxy_config['host']}")
                return True
            else:
                self.logger.error(f"❌ Proxy validation failed: {validate_response}")
                return False
                
        except requests.exceptions.RequestException as e:
            self.logger.error(f"❌ Error validating proxy: {e}")
            return False
        except Exception as e:
            self.logger.error(f"❌ Unexpected error validating proxy: {e}")
            return False

    def setup_multilogin_proxy_profile(self, country: str = "us", region: str = "california", 
                                     session_type: str = "sticky", protocol: str = "socks5", 
                                     ip_ttl: int = 0) -> dict:
        """
        Setup Multilogin proxy profile using the correct flow
        
        Args:
            country (str): Country code (e.g., "us", "ca", "uk")
            region (str): Region name (e.g., "california", "ontario", "england")
            session_type (str): Session type ("sticky", "rotating")
            protocol (str): Protocol ("socks5", "http", "https")
            ip_ttl (int): IP TTL in seconds (0 for default)
        
        Returns:
            dict: Profile setup response
        """
        try:
            # Step 1: Profile Setup Request
            setup_url = f"{self.base_url}/proxynm/profile_setup"
            
            # Generate username format like in the sample
            username = f"{self.config.get('user_id', 'default')}_{self.config.get('workspace_id', 'default')}_multilogin_com-country-{country}-region-{region}-sid-{self._generate_session_id()}-filter-medium"
            
            params = {
                "username": username
            }
            
            self.logger.info(f"🔄 Setting up Multilogin proxy profile for {country}/{region}...")
            response = self.session.get(setup_url, params=params)
            response.raise_for_status()
            
            setup_response = response.json()
            
            if setup_response.get('status', {}).get('http_code') == 200:
                self.logger.info(f"✅ Profile setup successful for {country}/{region}")
                return setup_response
            else:
                self.logger.error(f"❌ Profile setup failed: {setup_response}")
                return {}
                
        except requests.exceptions.RequestException as e:
            self.logger.error(f"❌ Error in profile setup: {e}")
            return {}
        except Exception as e:
            self.logger.error(f"❌ Unexpected error in profile setup: {e}")
            return {}

    def get_multilogin_proxy_connection(self, country: str = "us", region: str = "california", 
                                      city: str = "", session_type: str = "sticky", 
                                      protocol: str = "socks5", ip_ttl: int = 0) -> dict:
        """
        Get Multilogin proxy connection URL using the correct flow
        
        Args:
            country (str): Country code
            region (str): Region name
            city (str): City name (optional)
            session_type (str): Session type
            protocol (str): Protocol
            ip_ttl (int): IP TTL
        
        Returns:
            dict: Connection response with proxy details
        """
        try:
            # Step 2: Get Connection URL
            connection_url = f"{self.base_url}/proxynm/connection_url"
            
            params = {
                "country": country,
                "region": region,
                "city": city,
                "session_type": session_type,
                "protocol": protocol,
                "ip_ttl": ip_ttl,
                "workspace_id": self.config.get('workspace_id', 'default')
            }
            
            self.logger.info(f"🔄 Getting proxy connection for {country}/{region}...")
            response = self.session.get(connection_url, params=params)
            response.raise_for_status()
            
            connection_response = response.json()
            
            if connection_response.get('status', {}).get('http_code') == 200:
                self.logger.info(f"✅ Proxy connection successful for {country}/{region}")
                return connection_response
            else:
                self.logger.error(f"❌ Proxy connection failed: {connection_response}")
                return {}
                
        except requests.exceptions.RequestException as e:
            self.logger.error(f"❌ Error getting proxy connection: {e}")
            return {}
        except Exception as e:
            self.logger.error(f"❌ Unexpected error getting proxy connection: {e}")
            return {}

    def update_profile_with_multilogin_proxy(self, profile_id: str, country: str = "us", 
                                           region: str = "california", protocol: str = "socks5") -> bool:
        """
        Complete flow to update profile with Multilogin proxy
        
        Args:
            profile_id (str): Profile ID to update
            country (str): Country for proxy
            region (str): Region for proxy
            protocol (str): Protocol type
        
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            self.logger.info(f"🚀 Starting complete Multilogin proxy update flow for profile {profile_id}")
            
            # Step 1: Setup proxy profile
            setup_result = self.setup_multilogin_proxy_profile(country, region, "sticky", protocol)
            if not setup_result:
                self.logger.error("❌ Profile setup failed, aborting proxy update")
                return False
            
            # Step 2: Get connection details
            connection_result = self.get_multilogin_proxy_connection(country, region, "", "sticky", protocol)
            if not connection_result:
                self.logger.error("❌ Connection setup failed, aborting proxy update")
                return False
            
            # Step 3: Extract proxy details from connection response
            connection_urls = connection_result.get('data', {}).get('connection_urls', [])
            if not connection_urls:
                self.logger.error("❌ No connection URLs in response")
                return False
            
            # Parse connection URL: "gate.multilogin.com:1080:username:password"
            connection_url = connection_urls[0]
            parts = connection_url.split(':')
            
            if len(parts) >= 4:
                host = parts[0]
                port = int(parts[1])
                username = parts[2]
                password = parts[3]
            else:
                self.logger.error(f"❌ Invalid connection URL format: {connection_url}")
                return False
            
            # Step 4: Update profile with proxy
            proxy_config = {
                "type": protocol,
                "host": host,
                "port": port,
                "username": username,
                "password": password,
                "save_traffic": False
            }
            
            # Step 5: Validate proxy before updating profile
            if not self.validate_proxy(proxy_config):
                self.logger.error("❌ Proxy validation failed, aborting profile update")
                return False
            
            # Step 6: Update profile with validated proxy
            success = self.update_profile_proxy(profile_id, proxy_config)
            
            if success:
                self.logger.info(f"✅ Complete proxy update flow successful for profile {profile_id}")
                return True
            else:
                self.logger.error(f"❌ Profile proxy update failed for {profile_id}")
                return False
                
        except Exception as e:
            self.logger.error(f"❌ Error in complete proxy update flow: {e}")
            return False

    def _generate_session_id(self) -> str:
        """Generate a random session ID for proxy setup"""
        return Utils.generate_session_id()
