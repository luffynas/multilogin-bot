"""
Launcher API client for Multilogin X
"""
from typing import Optional, Dict, Any, List
from api.base import BaseAPIClient
from models.base import BaseResponse, ProfileInfo

class LauncherAPI(BaseAPIClient):
    """Launcher API client for browser profile management"""
    
    def start_browser_profile(
        self, 
        folder_id: str, 
        profile_id: str,
        automation_type: str = "selenium",
        headless_mode: bool = False
    ) -> BaseResponse:
        """Start a browser profile"""
        url = f"{self.launcher_url}/api/v2/profile/f/{folder_id}/p/{profile_id}/start"
        params = {
            "automation_type": automation_type,
            "headless_mode": headless_mode
        }
        
        response = self.get(url, params=params)
        
        if response.success and response.data:
            # Extract port and other info from response
            profile_data = response.data.get("data", {})
            profile_info = ProfileInfo(
                id=profile_id,
                name=profile_data.get("name", ""),
                folder_id=folder_id,
                status="running",
                port=profile_data.get("port"),
                automation_type=automation_type,
                headless_mode=headless_mode
            )
            
            return BaseResponse(
                success=True,
                message="Profile started successfully",
                data={"profile": profile_info.dict()}
            )
        
        return response
    
    def stop_browser_profile(
        self, 
        folder_id: str, 
        profile_id: str
    ) -> BaseResponse:
        """Stop a browser profile"""
        url = f"{self.launcher_url}/api/v2/profile/f/{folder_id}/p/{profile_id}/stop"
        
        response = self.get(url)
        
        if response.success:
            return BaseResponse(
                success=True,
                message="Profile stopped successfully"
            )
        
        return response
    
    def stop_all_profiles(self) -> BaseResponse:
        """Stop all running profiles"""
        url = f"{self.launcher_url}/api/v2/profile/stop-all"
        
        response = self.get(url)
        
        if response.success:
            return BaseResponse(
                success=True,
                message="All profiles stopped successfully"
            )
        
        return response
    
    def get_profile_status(
        self, 
        folder_id: str, 
        profile_id: str
    ) -> BaseResponse:
        """Get status of a specific profile"""
        url = f"{self.launcher_url}/api/v2/profile/f/{folder_id}/p/{profile_id}/status"
        
        response = self.get(url)
        
        if response.success and response.data:
            profile_data = response.data.get("data", {})
            profile_info = ProfileInfo(
                id=profile_id,
                name=profile_data.get("name", ""),
                folder_id=folder_id,
                status=profile_data.get("status"),
                port=profile_data.get("port"),
                automation_type=profile_data.get("automation_type"),
                headless_mode=profile_data.get("headless_mode")
            )
            
            return BaseResponse(
                success=True,
                data={"profile": profile_info.dict()}
            )
        
        return response
    
    def get_all_profiles_status(self) -> BaseResponse:
        """Get status of all profiles"""
        url = f"{self.launcher_url}/api/v2/profile/status"
        
        response = self.get(url)
        
        if response.success and response.data:
            profiles_data = response.data.get("data", [])
            profiles = []
            
            for profile_data in profiles_data:
                profile_info = ProfileInfo(
                    id=profile_data.get("id", ""),
                    name=profile_data.get("name", ""),
                    folder_id=profile_data.get("folder_id", ""),
                    status=profile_data.get("status"),
                    port=profile_data.get("port"),
                    automation_type=profile_data.get("automation_type"),
                    headless_mode=profile_data.get("headless_mode")
                )
                profiles.append(profile_info.dict())
            
            return BaseResponse(
                success=True,
                data={"profiles": profiles}
            )
        
        return response
    
    def delete_browser_core(self, core_id: str) -> BaseResponse:
        """Delete browser core"""
        url = f"{self.launcher_url}/api/v2/core/{core_id}"
        
        response = self.delete(url)
        
        if response.success:
            return BaseResponse(
                success=True,
                message="Browser core deleted successfully"
            )
        
        return response
    
    def validate_proxy(self, proxy_data: Dict[str, Any]) -> BaseResponse:
        """Validate proxy configuration"""
        url = f"{self.launcher_url}/api/v2/proxy/validate"
        
        response = self.post(url, json_data=proxy_data)
        
        if response.success:
            return BaseResponse(
                success=True,
                message="Proxy validation successful",
                data=response.data
            )
        
        return response
