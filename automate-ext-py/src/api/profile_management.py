"""
Profile Management API client
"""
import json
from typing import Optional, Dict, Any, List
from pathlib import Path
from api.base import BaseAPIClient
from models.base import BaseResponse, ProfileInfo

class ProfileManagementAPI(BaseAPIClient):
    """Profile Management API client"""
    
    def create_profile(self, profile_data: Dict[str, Any]) -> BaseResponse:
        """Create a new browser profile"""
        url = f"{self.base_url}/profile"
        
        response = self.post(url, json_data=profile_data)
        
        if response.success and response.data:
            profile_data = response.data.get("data", {})
            profile_info = ProfileInfo(
                id=profile_data.get("id", ""),
                name=profile_data.get("name", ""),
                folder_id=profile_data.get("folder_id", ""),
                status=profile_data.get("status"),
                automation_type=profile_data.get("automation_type"),
                headless_mode=profile_data.get("headless_mode")
            )
            
            return BaseResponse(
                success=True,
                message="Profile created successfully",
                data={"profile": profile_info.dict()}
            )
        
        return response
    
    def remove_profile(self, profile_id: str) -> BaseResponse:
        """Remove a browser profile"""
        url = f"{self.base_url}/profile/{profile_id}"
        
        response = self.delete(url)
        
        if response.success:
            return BaseResponse(
                success=True,
                message="Profile removed successfully"
            )
        
        return response
    
    def partial_update_profile(
        self, 
        profile_id: str, 
        update_data: Dict[str, Any]
    ) -> BaseResponse:
        """Partially update a browser profile"""
        url = f"{self.base_url}/profile/{profile_id}"
        
        response = self.put(url, json_data=update_data)
        
        if response.success and response.data:
            profile_data = response.data.get("data", {})
            profile_info = ProfileInfo(
                id=profile_id,
                name=profile_data.get("name", ""),
                folder_id=profile_data.get("folder_id", ""),
                status=profile_data.get("status"),
                automation_type=profile_data.get("automation_type"),
                headless_mode=profile_data.get("headless_mode")
            )
            
            return BaseResponse(
                success=True,
                message="Profile updated successfully",
                data={"profile": profile_info.dict()}
            )
        
        return response
    
    def get_profile(self, profile_id: str) -> BaseResponse:
        """Get profile information from saved profiles file"""
        profiles = self._load_profiles_from_file()
        
        for profile in profiles:
            if profile.get("id") == profile_id:
                profile_info = ProfileInfo(
                    id=profile_id,
                    name=profile.get("name", ""),
                    folder_id=profile.get("folder_id", ""),
                    status=profile.get("status")
                )
                
                return BaseResponse(
                    success=True,
                    data={"profile": profile_info.dict()}
                )
        
        return BaseResponse(
            success=False,
            message=f"Profile with ID '{profile_id}' not found",
            error=f"Profile with ID '{profile_id}' not found in saved profiles"
        )
    
    def list_profiles(self, folder_id: Optional[str] = None) -> BaseResponse:
        """List all profiles, optionally filtered by folder"""
        # Use the correct endpoint to get all profiles
        url = f"{self.base_url}/profile/search"
        
        # Add required parameters for profile search in request body
        search_data = {
            "is_removed": False,
            "core_version": 140,
            "limit": 100,  # Get up to 100 profiles
            "offset": 0,
            "search_text": "",  # Empty string to get all profiles
            "storage_type": "all",
            "order_by": "created_at",
            "sort": "asc"
        }
        
        if folder_id:
            search_data["folder_id"] = folder_id
        
        response = self.post(url, json_data=search_data)
        
        if response.success and response.data:
            # Handle the response format from Multilogin X API
            # The profiles are in response.data["data"]["profiles"]
            profiles_data = response.data.get("data", {}).get("profiles", [])
            total_count = response.data.get("data", {}).get("total_count", 0)
            profiles = []
            
            if isinstance(profiles_data, list):
                for profile_data in profiles_data:
                    # Save the complete profile data as received from API
                    profiles.append(profile_data)
            
            # Save profiles data to file for future use
            self._save_profiles_to_file(profiles)
            
            return BaseResponse(
                success=True,
                data={"profiles": profiles, "total_count": total_count}
            )
        
        return response
    
    def _save_profiles_to_file(self, profiles: List[Dict[str, Any]]) -> None:
        """Save profiles data to file for future use"""
        try:
            profiles_file = Path("profiles_data.json")
            with open(profiles_file, 'w') as f:
                json.dump(profiles, f, indent=2, default=str)
            print(f"💾 Saved {len(profiles)} profiles to {profiles_file}")
        except Exception as e:
            print(f"❌ Error saving profiles to file: {e}")
    
    def _load_profiles_from_file(self) -> List[Dict[str, Any]]:
        """Load profiles data from file"""
        try:
            profiles_file = Path("profiles_data.json")
            if profiles_file.exists():
                with open(profiles_file, 'r') as f:
                    profiles = json.load(f)
                print(f"📂 Loaded {len(profiles)} profiles from {profiles_file}")
                return profiles
            else:
                print("❌ No profiles file found. Please run 'Check All Profiles' first.")
                return []
        except Exception as e:
            print(f"❌ Error loading profiles from file: {e}")
            return []
    
    def get_profile_by_id(self, profile_id: str) -> Optional[Dict[str, Any]]:
        """Get profile by ID from saved profiles file"""
        profiles = self._load_profiles_from_file()
        for profile in profiles:
            if profile.get("id") == profile_id:
                return profile
        return None
    
    def get_all_saved_profiles(self) -> List[Dict[str, Any]]:
        """Get all profiles from saved file"""
        return self._load_profiles_from_file()
    
    def get_profile_ids_list(self) -> List[str]:
        """Get list of profile IDs from saved profiles"""
        profiles = self._load_profiles_from_file()
        return [profile.get("id", "") for profile in profiles if profile.get("id")]
    
    def get_profile_metas(self, profile_ids: List[str]) -> BaseResponse:
        """Get profile metadata for multiple profiles"""
        url = f"{self.base_url}/profile/metas"
        
        # Use POST method with JSON body containing array of profile IDs
        request_data = {
            "ids": profile_ids
        }
        
        response = self.post(url, json_data=request_data)
        
        if response.success:
            return BaseResponse(
                success=True,
                message="Profile metadata retrieved successfully",
                data=response.data
            )
        
        return response
    
    def get_workspace_folders(self) -> BaseResponse:
        """Get workspace folders"""
        url = f"{self.base_url}/workspace/folders"
        
        response = self.get(url)
        
        if response.success:
            return BaseResponse(
                success=True,
                data=response.data
            )
        
        return response
    
    def convert_profile_storage(self, profile_id: str, workspace_id: str, convert_to_local: bool = False) -> BaseResponse:
        """Convert profile storage between local and cloud"""
        # Use launcher URL for convert endpoint as per the sample request
        url = f"{self.launcher_url}/api/v1/profile/{profile_id}/convert"
        
        # Request body based on the sample request
        request_data = {
            "workspace_id": workspace_id,
            "convert_to_local": convert_to_local
        }
        
        response = self.post(url, json_data=request_data)
        
        if response.success:
            return BaseResponse(
                success=True,
                message="Profile storage converted successfully",
                data=response.data
            )
        
        return response