"""
Script Runner API for Multilogin X
"""
from typing import List, Dict, Any, Optional
from .base import BaseAPIClient
from models.base import BaseResponse

class ScriptRunnerAPI(BaseAPIClient):
    """API client for Script Runner operations"""
    
    def start_script_runner(
        self, 
        script_file: str, 
        profile_ids: List[str], 
        is_headless: bool = False
    ) -> BaseResponse:
        """
        Start Script Runner with specified script and profiles
        
        Args:
            script_file: Name of the script file (e.g., "example.py")
            profile_ids: List of profile IDs to run the script on
            is_headless: Whether to run in headless mode
            
        Returns:
            BaseResponse with success status and data
        """
        url = f"{self.launcher_url}/api/v1/run_script"
        
        payload = {
            "script_file": script_file,
            "profile_ids": [
                {
                    "profile_id": profile_id,
                    "is_headless": is_headless
                }
                for profile_id in profile_ids
            ]
        }
        
        # Make the request and handle response specially for Script Runner
        response = self._make_request("POST", url, json_data=payload)
        
        # Script Runner API returns data in response.data regardless of success/error
        # We need to check if the response contains valid data structure
        if response.data and "data" in response.data:
            # Check if all profiles have success status
            results = response.data.get("data", [])
            all_success = all(r.get("status") == "success" for r in results)
            
            return BaseResponse(
                success=all_success,
                data=response.data,
                error=response.error if not all_success else None
            )
        
        return response
    
    def stop_script_runner(self, profile_ids: List[str]) -> BaseResponse:
        """
        Stop Script Runner for specified profiles
        
        Args:
            profile_ids: List of profile IDs to stop script runner for
            
        Returns:
            BaseResponse with success status
        """
        url = f"{self.launcher_url}/api/v1/stop_script"
        
        payload = {
            "profile_ids": profile_ids
        }
        
        return self.post(url, json_data=payload)
    
    def get_script_runner_status(self, profile_ids: List[str]) -> BaseResponse:
        """
        Get Script Runner status for specified profiles
        
        Args:
            profile_ids: List of profile IDs to check status for
            
        Returns:
            BaseResponse with status information
        """
        url = f"{self.launcher_url}/api/v1/script_status"
        
        params = {
            "profile_ids": ",".join(profile_ids)
        }
        
        return self.get(url, params=params)
