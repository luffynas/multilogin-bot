"""
Profile Access Management API client
"""
from typing import Optional, Dict, Any, List
from api.base import BaseAPIClient
from models.base import BaseResponse, WorkspaceInfo

class ProfileAccessAPI(BaseAPIClient):
    """Profile Access Management API client"""
    
    def user_sign_in(self, email: str, password: str) -> BaseResponse:
        """User sign in (alternative to auth manager)"""
        url = f"{self.base_url}/user/signin"
        payload = {
            "email": email,
            "password": password
        }
        
        response = self.post(url, json_data=payload)
        
        if response.success:
            return BaseResponse(
                success=True,
                message="User signed in successfully",
                data=response.data
            )
        
        return response
    
    def user_refresh_token(self, refresh_token: str) -> BaseResponse:
        """Refresh user token (switch workspace)"""
        url = f"{self.base_url}/user/refresh_token"
        payload = {
            "refresh_token": refresh_token
        }
        
        response = self.post(url, json_data=payload)
        
        if response.success:
            return BaseResponse(
                success=True,
                message="Token refreshed successfully",
                data=response.data
            )
        
        return response
    
    def get_user_workspaces(self) -> BaseResponse:
        """Get user workspaces"""
        url = f"{self.base_url}/user/workspaces"
        
        response = self.get(url)
        
        if response.success and response.data:
            workspaces_data = response.data.get("data", [])
            workspaces = []
            
            for workspace_data in workspaces_data:
                workspace_info = WorkspaceInfo(
                    id=workspace_data.get("id", ""),
                    name=workspace_data.get("name", ""),
                    folders=workspace_data.get("folders", [])
                )
                workspaces.append(workspace_info.dict())
            
            return BaseResponse(
                success=True,
                data={"workspaces": workspaces}
            )
        
        return response
    
    def get_workspace_folders(self, workspace_id: str) -> BaseResponse:
        """Get folders in a workspace"""
        url = f"{self.base_url}/workspace/{workspace_id}/folders"
        
        response = self.get(url)
        
        if response.success:
            return BaseResponse(
                success=True,
                data=response.data
            )
        
        return response
