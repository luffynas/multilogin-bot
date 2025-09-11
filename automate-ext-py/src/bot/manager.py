"""
Bot Manager for concurrent profile management
"""
import asyncio
import random
import time
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from concurrent.futures import ThreadPoolExecutor, as_completed

from api.launcher import LauncherAPI
from api.profile_management import ProfileManagementAPI
from api.proxy import ProxyAPI
from core.auth import AuthManager
from models.base import ProfileInfo
from config import Config

class BotManager:
    """Manages concurrent bot execution with time limits"""
    
    def __init__(self, launcher_api: LauncherAPI, profile_api: ProfileManagementAPI, auth_manager: AuthManager, proxy_api: ProxyAPI):
        self.launcher_api = launcher_api
        self.profile_api = profile_api
        self.auth_manager = auth_manager
        self.proxy_api = proxy_api
        self.running_profiles: Dict[str, Dict[str, Any]] = {}
        self.max_runtime = Config.MAX_PROFILE_RUNTIME
        self.min_interval = Config.MIN_START_INTERVAL
        self.max_interval = Config.MAX_START_INTERVAL
    
    def validate_and_refresh_token(self) -> bool:
        """Validate token and auto-refresh if expired before running profiles"""
        print("🔐 Validating authentication token...")
        
        # Check if token is valid
        if not self.auth_manager.is_token_valid():
            print("⚠️  Token expired or invalid, attempting to refresh...")
            
            # Try to refresh token first
            if self.auth_manager._current_token and self.auth_manager._current_token.refresh_token:
                refresh_result = self.auth_manager.refresh_token()
                if refresh_result.success:
                    print("✅ Token refreshed successfully")
                    return True
                else:
                    print(f"❌ Token refresh failed: {refresh_result.error}")
            
            # If refresh fails, try to sign in again
            print("🔄 Attempting to sign in again...")
            signin_result = self.auth_manager.sign_in()
            if signin_result.success:
                print("✅ Re-authentication successful")
                return True
            else:
                print(f"❌ Re-authentication failed: {signin_result.error}")
                return False
        else:
            print("✅ Token is valid")
            return True
    
    def _extract_proxy_config_from_profile(self, profile: ProfileInfo) -> Optional[Dict[str, Any]]:
        """Extract proxy configuration from profile data"""
        try:
            # Get profile metadata to access proxy configuration
            all_profile_ids = self.profile_api.get_profile_ids_list()
            if not all_profile_ids:
                return None
            
            metas_response = self.profile_api.get_profile_metas(all_profile_ids)
            if not metas_response.success:
                return None
            
            # Extract profiles from response structure
            if isinstance(metas_response.data, dict) and "data" in metas_response.data:
                data_section = metas_response.data.get("data", {})
                if isinstance(data_section, dict) and "profiles" in data_section:
                    metas_data = data_section.get("profiles", [])
                else:
                    metas_data = []
            else:
                metas_data = []
            
            # Find the specific profile metadata
            profile_meta = None
            for meta in metas_data:
                if meta.get("id") == profile.id:
                    profile_meta = meta
                    break
            
            if not profile_meta:
                return None
            
            # Extract proxy configuration from profile parameters
            parameters = profile_meta.get("parameters", {})
            proxy_config = parameters.get("proxy", {})
            
            # Check if proxy configuration exists and has required fields
            if proxy_config and proxy_config.get("host") and proxy_config.get("port"):
                return proxy_config
            
            return None
            
        except Exception as e:
            print(f"⚠️  Error extracting proxy config for profile {profile.name}: {str(e)}")
            return None
    
    def validate_profile_proxy(self, profile: ProfileInfo) -> bool:
        """Validate proxy configuration for a specific profile with auto-update capability"""
        print(f"🔍 Validating proxy for profile: {profile.name}")
        
        # Extract proxy configuration from profile
        proxy_config = self._extract_proxy_config_from_profile(profile)
        
        if not proxy_config:
            print(f"⚠️  No proxy configuration found for profile {profile.name}")
            return True  # Allow profiles without proxy to continue
        
        # Validate proxy configuration with auto-update
        max_retries = 3
        retry_count = 0
        current_proxy_config = proxy_config.copy()
        
        while retry_count < max_retries:
            validate_response = self.proxy_api.validate_proxy(current_proxy_config)
            
            if validate_response.success:
                print(f"✅ Proxy validation successful for profile {profile.name}")
                return True
            else:
                retry_count += 1
                print(f"⚠️  Proxy validation failed for profile {profile.name} (attempt {retry_count}/{max_retries}): {validate_response.error}")
                
                if retry_count < max_retries:
                    print(f"🔄 Attempting to get new proxy for profile {profile.name}...")
                    
                    # Try to get new proxy connection
                    new_proxy_config = self._get_new_proxy_connection(current_proxy_config)
                    
                    if new_proxy_config:
                        # Update profile with new proxy
                        if self._update_profile_proxy(profile, new_proxy_config):
                            current_proxy_config = new_proxy_config
                            print(f"🔄 Using new proxy configuration for retry")
                        else:
                            print(f"❌ Failed to update profile with new proxy, retrying with current proxy")
                    else:
                        print(f"❌ Failed to get new proxy, retrying with current proxy")
                    
                    time.sleep(2)  # Wait 2 seconds before retry
        
        print(f"❌ Proxy validation failed for profile {profile.name} after {max_retries} attempts")
        return False
    
    def _get_new_proxy_connection(self, proxy_config: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Get new proxy connection URL when current proxy fails validation"""
        try:
            # Extract proxy type from current config
            proxy_type = proxy_config.get("type", "socks5")
            
            # Map proxy types to connection parameters
            if proxy_type.lower() in ["socks5", "socks4"]:
                protocol = "socks5"
            else:
                protocol = "http"
            
            # Get new connection URL
            connection_response = self.proxy_api.get_connection_url(
                country="us",  # Default to US as per memory
                protocol=protocol,
                connection_type="residential"
            )
            
            if not connection_response.success:
                print(f"❌ Failed to get new connection URL: {connection_response.error}")
                return None
            
            # Parse new connection URL
            connection_data = connection_response.data.get("data", {})
            connection_urls = connection_data.get("connection_urls", [])
            
            if not connection_urls:
                print("❌ No connection URLs received")
                return None
            
            # Parse the first connection URL
            connection_url = connection_urls[0]
            parts = connection_url.split(":")
            
            if len(parts) < 4:
                print("❌ Invalid connection URL format")
                return None
            
            # Create new proxy configuration
            new_proxy_config = {
                "type": protocol,
                "host": parts[0],
                "port": int(parts[1]),
                "username": parts[2],
                "password": parts[3]
            }
            
            print(f"✅ Generated new proxy configuration: {new_proxy_config['host']}:{new_proxy_config['port']}")
            return new_proxy_config
            
        except Exception as e:
            print(f"❌ Error getting new proxy connection: {str(e)}")
            return None
    
    def _update_profile_proxy(self, profile: ProfileInfo, new_proxy_config: Dict[str, Any]) -> bool:
        """Update profile with new proxy configuration"""
        try:
            print(f"🔄 Updating proxy for profile: {profile.name}")
            
            # Get current profile metadata
            all_profile_ids = self.profile_api.get_profile_ids_list()
            if not all_profile_ids:
                return False
            
            metas_response = self.profile_api.get_profile_metas(all_profile_ids)
            if not metas_response.success:
                return False
            
            # Extract profiles from response structure
            if isinstance(metas_response.data, dict) and "data" in metas_response.data:
                data_section = metas_response.data.get("data", {})
                if isinstance(data_section, dict) and "profiles" in data_section:
                    metas_data = data_section.get("profiles", [])
                else:
                    metas_data = []
            else:
                metas_data = []
            
            # Find the specific profile metadata
            profile_meta = None
            for meta in metas_data:
                if meta.get("id") == profile.id:
                    profile_meta = meta
                    break
            
            if not profile_meta:
                print(f"❌ Profile metadata not found for {profile.name}")
                return False
            
            # Update proxy configuration in profile metadata
            parameters = profile_meta.get("parameters", {})
            parameters["proxy"] = new_proxy_config
            
            # Prepare update data
            update_data = {
                "profile_id": profile.id,
                "name": profile.name,
                "tags": profile_meta.get("tags", []),
                "parameters": parameters
            }
            
            # Update profile with new proxy
            update_response = self.profile_api.partial_update_profile(profile.id, update_data)
            
            if update_response.success:
                print(f"✅ Successfully updated proxy for profile {profile.name}")
                return True
            else:
                print(f"❌ Failed to update profile {profile.name}: {update_response.error}")
                return False
                
        except Exception as e:
            print(f"❌ Error updating profile proxy: {str(e)}")
            return False
    
    def get_all_profiles(self) -> List[ProfileInfo]:
        """Get all available profiles"""
        response = self.profile_api.list_profiles()
        if response.success and response.data:
            profiles_data = response.data.get("profiles", [])
            return [ProfileInfo(**profile) for profile in profiles_data]
        return []
    
    def start_profile_bot(self, profile: ProfileInfo, automation_type: str = "none", headless_mode: bool = False) -> Dict[str, Any]:
        """Start a single profile bot"""
        # Validate token before starting profile
        if not self.validate_and_refresh_token():
            return {
                "success": False,
                "profile_id": profile.id,
                "message": f"Authentication failed. Cannot start profile {profile.name} without valid token.",
                "error": "Token validation failed"
            }
        
        # Validate proxy before starting profile
        if not self.validate_profile_proxy(profile):
            return {
                "success": False,
                "profile_id": profile.id,
                "message": f"Proxy validation failed. Cannot start profile {profile.name} with invalid proxy.",
                "error": "Proxy validation failed"
            }
        
        start_time = datetime.now()
        profile_id = profile.id
        folder_id = profile.folder_id
        
        try:
            # Start the profile
            response = self.launcher_api.start_browser_profile(
                folder_id=folder_id,
                profile_id=profile_id,
                automation_type=automation_type,
                headless_mode=headless_mode
            )
            
            if response.success:
                # Record running profile
                self.running_profiles[profile_id] = {
                    "profile": profile,
                    "start_time": start_time,
                    "status": "running",
                    "port": response.data.get("profile", {}).get("port") if response.data else None
                }
                
                return {
                    "success": True,
                    "profile_id": profile_id,
                    "message": f"Profile {profile.name} started successfully",
                    "port": self.running_profiles[profile_id]["port"]
                }
            else:
                return {
                    "success": False,
                    "profile_id": profile_id,
                    "message": f"Failed to start profile {profile.name}: {response.error}"
                }
                
        except Exception as e:
            return {
                "success": False,
                "profile_id": profile_id,
                "message": f"Error starting profile {profile.name}: {str(e)}"
            }
    
    def stop_profile_bot(self, profile_id: str) -> Dict[str, Any]:
        """Stop a single profile bot"""
        try:
            if profile_id in self.running_profiles:
                profile_info = self.running_profiles[profile_id]["profile"]
                
                # Stop the profile
                response = self.launcher_api.stop_browser_profile(profile_id)
                
                if response.success:
                    # Remove from running profiles
                    del self.running_profiles[profile_id]
                    return {
                        "success": True,
                        "profile_id": profile_id,
                        "message": f"Profile {profile_info.name} stopped successfully"
                    }
                else:
                    return {
                        "success": False,
                        "profile_id": profile_id,
                        "message": f"Failed to stop profile: {response.error}"
                    }
            else:
                return {
                    "success": False,
                    "profile_id": profile_id,
                    "message": "Profile not found in running profiles"
                }
                
        except Exception as e:
            return {
                "success": False,
                "profile_id": profile_id,
                "message": f"Error stopping profile: {str(e)}"
            }
    
    def check_timeout_profiles(self) -> List[str]:
        """Check for profiles that have exceeded runtime limit"""
        timeout_profiles = []
        current_time = datetime.now()
        
        for profile_id, profile_data in self.running_profiles.items():
            start_time = profile_data["start_time"]
            runtime = (current_time - start_time).total_seconds()
            
            if runtime >= self.max_runtime:
                timeout_profiles.append(profile_id)
        
        return timeout_profiles
    
    def stop_timeout_profiles(self) -> List[Dict[str, Any]]:
        """Stop all profiles that have exceeded runtime limit"""
        timeout_profiles = self.check_timeout_profiles()
        results = []
        
        for profile_id in timeout_profiles:
            result = self.stop_profile_bot(profile_id)
            results.append(result)
        
        return results
    
    def run_concurrent_bots(
        self, 
        profiles: List[ProfileInfo], 
        max_concurrent: int = 5,
        automation_type: str = "none",
        headless_mode: bool = False
    ) -> List[Dict[str, Any]]:
        """Run bots concurrently with random start intervals"""
        # Validate and refresh token before starting profiles
        if not self.validate_and_refresh_token():
            return [{
                "success": False,
                "message": "Authentication failed. Cannot start profiles without valid token.",
                "error": "Token validation failed"
            }]
        
        results = []
        profiles_queue = profiles.copy()
        random.shuffle(profiles_queue)  # Randomize order
        
        with ThreadPoolExecutor(max_workers=max_concurrent) as executor:
            # Submit initial batch
            futures = {}
            started_count = 0
            
            while profiles_queue or futures:
                # Start new profiles if we have capacity and profiles in queue
                while (len(futures) < max_concurrent and 
                       started_count < len(profiles) and 
                       profiles_queue):
                    
                    profile = profiles_queue.pop(0)
                    future = executor.submit(self.start_profile_bot, profile, automation_type, headless_mode)
                    futures[future] = profile
                    started_count += 1
                    
                    # Random delay between starts (1-5 minutes)
                    if profiles_queue:  # Don't delay after the last profile
                        delay = random.randint(self.min_interval, self.max_interval)
                        print(f"Waiting {delay} seconds before starting next profile...")
                        time.sleep(delay)
                
                # Check for completed profiles
                completed_futures = []
                for future in as_completed(futures, timeout=1):
                    try:
                        result = future.result()
                        results.append(result)
                        completed_futures.append(future)
                        
                        if result["success"]:
                            print(f"✅ {result['message']}")
                        else:
                            print(f"❌ {result['message']}")
                            
                    except Exception as e:
                        profile = futures[future]
                        error_result = {
                            "success": False,
                            "profile_id": profile.id,
                            "message": f"Exception in profile {profile.name}: {str(e)}"
                        }
                        results.append(error_result)
                        completed_futures.append(future)
                        print(f"❌ {error_result['message']}")
                
                # Remove completed futures
                for future in completed_futures:
                    del futures[future]
                
                # Check for timeout profiles and stop them
                timeout_results = self.stop_timeout_profiles()
                for result in timeout_results:
                    if result not in results:
                        results.append(result)
                        print(f"⏰ {result['message']} (timeout)")
        
        return results
    
    def stop_all_bots(self, profile_type: str = "all") -> List[Dict[str, Any]]:
        """Stop all running bots"""
        try:
            # Use API to stop all profiles
            response = self.launcher_api.stop_all_profiles(profile_type)
            
            if response.success:
                # Clear all running profiles from memory
                stopped_count = len(self.running_profiles)
                self.running_profiles.clear()
                
                return [{
                    "success": True,
                    "message": f"Stopped {stopped_count} profiles",
                    "profile_type": profile_type
                }]
            else:
                return [{
                    "success": False,
                    "message": f"Failed to stop profiles: {response.error}",
                    "profile_type": profile_type
                }]
                
        except Exception as e:
            return [{
                "success": False,
                "message": f"Error stopping profiles: {str(e)}",
                "profile_type": profile_type
            }]
    
    def get_running_profiles_status(self) -> Dict[str, Any]:
        """Get status of all running profiles"""
        try:
            # Use API to get all profiles status
            response = self.launcher_api.get_all_profiles_status()
            
            if response.success:
                # Parse API response
                data = response.data.get("data", {})
                states = data.get("states", {})
                active_counter = data.get("active_counter", {})
                
                # Convert to our format
                status_info = {}
                current_time = datetime.now()
                
                for profile_id, profile_data in states.items():
                    # Calculate runtime if we have this profile in our running list
                    runtime = 0
                    remaining_time = 0
                    
                    if profile_id in self.running_profiles:
                        start_time = self.running_profiles[profile_id]["start_time"]
                        runtime = (current_time - start_time).total_seconds()
                        remaining_time = max(0, self.max_runtime - runtime)
                    
                    status_info[profile_id] = {
                        "profile_name": profile_data.get("name", "Unknown"),
                        "status": profile_data.get("status", "unknown"),
                        "start_time": self.running_profiles.get(profile_id, {}).get("start_time", current_time).isoformat() if profile_id in self.running_profiles else None,
                        "runtime_seconds": runtime,
                        "remaining_seconds": remaining_time,
                        "port": profile_data.get("port"),
                        "browser_type": profile_data.get("browser_type"),
                        "is_quick": profile_data.get("is_quick", False),
                        "last_launched_at": profile_data.get("last_launched_at"),
                        "in_use_by": profile_data.get("in_use_by")
                    }
                
                # Add active counter info
                status_info["_active_counter"] = active_counter
                
                return status_info
            else:
                # Fallback to local data if API fails
                return self._get_local_running_status()
                
        except Exception as e:
            print(f"Error getting profiles status from API: {e}")
            # Fallback to local data
            return self._get_local_running_status()
    
    def _get_local_running_status(self) -> Dict[str, Any]:
        """Fallback method to get local running profiles status"""
        current_time = datetime.now()
        status_info = {}
        
        for profile_id, profile_data in self.running_profiles.items():
            start_time = profile_data["start_time"]
            runtime = (current_time - start_time).total_seconds()
            remaining_time = max(0, self.max_runtime - runtime)
            
            status_info[profile_id] = {
                "profile_name": profile_data["profile"].name,
                "status": profile_data["status"],
                "start_time": start_time.isoformat(),
                "runtime_seconds": runtime,
                "remaining_seconds": remaining_time,
                "port": profile_data.get("port")
            }
        
        return status_info
