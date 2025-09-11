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
from models.base import ProfileInfo
from config import Config

class BotManager:
    """Manages concurrent bot execution with time limits"""
    
    def __init__(self, launcher_api: LauncherAPI, profile_api: ProfileManagementAPI):
        self.launcher_api = launcher_api
        self.profile_api = profile_api
        self.running_profiles: Dict[str, Dict[str, Any]] = {}
        self.max_runtime = Config.MAX_PROFILE_RUNTIME
        self.min_interval = Config.MIN_START_INTERVAL
        self.max_interval = Config.MAX_START_INTERVAL
    
    def get_all_profiles(self) -> List[ProfileInfo]:
        """Get all available profiles"""
        response = self.profile_api.list_profiles()
        if response.success and response.data:
            profiles_data = response.data.get("profiles", [])
            return [ProfileInfo(**profile) for profile in profiles_data]
        return []
    
    def start_profile_bot(self, profile: ProfileInfo, automation_type: str = "none", headless_mode: bool = False) -> Dict[str, Any]:
        """Start a single profile bot"""
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
                response = self.launcher_api.stop_browser_profile(
                    folder_id=profile_info.folder_id,
                    profile_id=profile_id
                )
                
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
    
    def stop_all_bots(self) -> List[Dict[str, Any]]:
        """Stop all running bots"""
        results = []
        profile_ids = list(self.running_profiles.keys())
        
        for profile_id in profile_ids:
            result = self.stop_profile_bot(profile_id)
            results.append(result)
        
        return results
    
    def get_running_profiles_status(self) -> Dict[str, Any]:
        """Get status of all running profiles"""
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
