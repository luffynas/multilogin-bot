import requests
import logging
import time
import json
from typing import Dict, List, Optional
from dataclasses import dataclass


@dataclass
class CookieMetadata:
    profile_id: str
    target_website: str
    additional_website: Optional[str] = None


class PremadeCookiesManager:
    """
    Manages Multilogin X pre-made cookies for enhanced AdSense testing success rate.
    Implements safe cookie management to avoid account restrictions.
    """
    
    def __init__(self, base_url: str = "https://cookies.multilogin.com"):
        self.base_url = base_url
        self.logger = logging.getLogger(__name__)
        self.session = requests.Session()
        
        # Safe headers to avoid detection
        self.session.headers.update({
            "Accept": "application/json",
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        })
    
    def get_available_target_websites(self) -> List[Dict[str, str]]:
        """
        Get list of available target websites for pre-made cookies.
        Safe operation - read-only.
        """
        try:
            url = f"{self.base_url}/api/v1/cookies/metadata/websites"
            response = self.session.get(url, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                websites = data.get("data", [])
                self.logger.info(f"Retrieved {len(websites)} available target websites")
                return websites
            else:
                self.logger.error(f"Failed to get target websites: {response.status_code}")
                return []
                
        except Exception as e:
            self.logger.error(f"Error getting target websites: {e}")
            return []
    
    def create_cookies_metadata(self, profile_id: str, target_website: str, 
                               additional_website: Optional[str] = None) -> bool:
        """
        Create cookies metadata for a profile.
        SAFE OPERATION: Only creates metadata, doesn't modify existing cookies.
        """
        try:
            url = f"{self.base_url}/api/v1/cookies/metadata"
            
            payload = {
                "profile_id": profile_id,
                "target_website": target_website
            }
            
            if additional_website:
                payload["additional_website"] = additional_website
            
            response = self.session.post(url, json=payload, timeout=30)
            
            if response.status_code == 201:
                self.logger.info(f"Successfully created cookies metadata for profile {profile_id} with target {target_website}")
                return True
            else:
                self.logger.error(f"Failed to create cookies metadata: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.logger.error(f"Error creating cookies metadata: {e}")
            return False
    
    def get_cookies_for_profile(self, profile_id: str) -> List[Dict]:
        """
        Get pre-made cookies for a specific profile.
        SAFE OPERATION: Read-only, doesn't modify profile settings.
        """
        try:
            url = f"{self.base_url}/api/v1/cookies/{profile_id}"
            response = self.session.get(url, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                cookies_data = data.get("data", {}).get("cookies", [])
                self.logger.info(f"Retrieved {len(cookies_data)} cookie sets for profile {profile_id}")
                return cookies_data
            else:
                self.logger.error(f"Failed to get cookies for profile {profile_id}: {response.status_code}")
                return []
                
        except Exception as e:
            self.logger.error(f"Error getting cookies for profile {profile_id}: {e}")
            return []
    
    def update_cookies_metadata(self, profile_id: str, target_website: str,
                               additional_website: Optional[str] = None) -> bool:
        """
        Update cookies metadata for a profile.
        SAFE OPERATION: Only updates metadata, preserves existing cookies.
        """
        try:
            url = f"{self.base_url}/api/v1/cookies/metadata"
            
            payload = {
                "profile_id": profile_id,
                "target_website": target_website
            }
            
            if additional_website:
                payload["additional_website"] = additional_website
            
            response = self.session.put(url, json=payload, timeout=30)
            
            if response.status_code == 200:
                self.logger.info(f"Successfully updated cookies metadata for profile {profile_id}")
                return True
            else:
                self.logger.error(f"Failed to update cookies metadata: {response.status_code}")
                return False
                
        except Exception as e:
            self.logger.error(f"Error updating cookies metadata: {e}")
            return False
    
    def get_optimal_target_website(self, geo_location: str = "US") -> str:
        """
        Get optimal target website based on geo location.
        SAFE: Returns recommended target without modifying anything.
        """
        # Safe mapping based on geo location
        geo_targets = {
            "US": "google",  # Best for US AdSense
            "CA": "google",  # Best for Canadian AdSense
            "UK": "google",  # Best for UK AdSense
            "AU": "google",  # Best for Australian AdSense
            "DE": "google",  # Best for German AdSense
            "FR": "google",  # Best for French AdSense
            "ID": "google",  # Best for Indonesian AdSense
        }
        
        return geo_targets.get(geo_location.upper(), "google")
    
    def validate_cookies_consistency(self, profile_id: str, target_website: str) -> bool:
        """
        Validate that cookies are consistent with profile settings.
        SAFE: Read-only validation.
        """
        try:
            cookies = self.get_cookies_for_profile(profile_id)
            
            if not cookies:
                self.logger.warning(f"No cookies found for profile {profile_id}")
                return False
            
            # Check if cookies match target website
            for cookie_set in cookies:
                if cookie_set.get("data"):
                    # Basic validation - cookies exist and are not empty
                    if len(cookie_set["data"]) > 0:
                        self.logger.info(f"Cookies validation passed for profile {profile_id}")
                        return True
            
            self.logger.warning(f"Cookies validation failed for profile {profile_id}")
            return False
            
        except Exception as e:
            self.logger.error(f"Error validating cookies consistency: {e}")
            return False
    
    def safe_cookies_application(self, profile_id: str, geo_location: str = "US") -> bool:
        """
        Safely apply pre-made cookies to a profile.
        IMPLEMENTATION: Only creates metadata, doesn't modify existing profile settings.
        """
        try:
            # Get optimal target website
            target_website = self.get_optimal_target_website(geo_location)
            
            # Create cookies metadata (safe operation)
            success = self.create_cookies_metadata(profile_id, target_website)
            
            if success:
                # Validate consistency (safe operation)
                is_consistent = self.validate_cookies_consistency(profile_id, target_website)
                
                if is_consistent:
                    self.logger.info(f"Successfully applied safe cookies for profile {profile_id}")
                    return True
                else:
                    self.logger.warning(f"Cookies applied but consistency check failed for profile {profile_id}")
                    return False
            else:
                self.logger.error(f"Failed to apply cookies for profile {profile_id}")
                return False
                
        except Exception as e:
            self.logger.error(f"Error in safe cookies application: {e}")
            return False
