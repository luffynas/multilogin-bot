"""
Extension Management API Client
Handles extension creation, upload, and management operations
"""

from typing import Dict, Any, List, Optional
from api.base import BaseAPIClient
from models.base import BaseResponse


class ExtensionAPI(BaseAPIClient):
    """API client for extension management operations"""
    
    def __init__(self, auth_manager):
        super().__init__(auth_manager)
    
    def create_extension_from_url(self, url: str, browser_type: str = "mimic", storage_type: str = "cloud") -> BaseResponse:
        """Create extension from URL"""
        endpoint = f"{self.launcher_url}/api/v1/create_extension_from_url"
        
        request_data = {
            "url": url,
            "browser_type": browser_type,
            "storage_type": storage_type
        }
        
        response = self.post(endpoint, json_data=request_data)
        
        if response.success:
            return BaseResponse(
                success=True,
                message="Extension created successfully",
                data=response.data
            )
        
        return response
    
    def upload_object(self, object_name: str, object_extension: str, object_type_id: str, 
                     object_body: str, object_meta: str, encrypt: bool = False) -> BaseResponse:
        """Upload object to storage"""
        endpoint = f"{self.launcher_url}/api/v1/object_storage/create_and_upload"
        
        request_data = {
            "object_name": object_name,
            "object_extension": object_extension,
            "object_type_id": object_type_id,
            "object_body": object_body,
            "object_meta": object_meta,
            "encrypt": encrypt
        }
        
        response = self.post(endpoint, json_data=request_data)
        
        if response.success:
            return BaseResponse(
                success=True,
                message="Object uploaded successfully",
                data=response.data
            )
        
        return response
    
    def enable_extension_for_profiles(self, object_id: str, profile_ids: List[str]) -> BaseResponse:
        """Enable extension for specific profiles"""
        endpoint = f"{self.base_url}/api/v1/resources/{object_id}/enable_for_profiles"
        
        request_data = {
            "profile_ids": profile_ids
        }
        
        response = self.post(endpoint, json_data=request_data)
        
        if response.success:
            return BaseResponse(
                success=True,
                message="Extension enabled for profiles successfully",
                data=response.data
            )
        
        return response
    
    def disable_extension_for_profiles(self, object_id: str, profile_ids: List[str]) -> BaseResponse:
        """Disable extension for specific profiles"""
        endpoint = f"{self.base_url}/api/v1/resources/{object_id}/disable_for_profiles"
        
        request_data = {
            "profile_ids": profile_ids
        }
        
        response = self.post(endpoint, json_data=request_data)
        
        if response.success:
            return BaseResponse(
                success=True,
                message="Extension disabled for profiles successfully",
                data=response.data
            )
        
        return response
    
    def get_object_types(self) -> BaseResponse:
        """Get available object types"""
        endpoint = f"{self.launcher_url}/api/v1/object_storage/types"
        
        response = self.get(endpoint)
        
        if response.success:
            return BaseResponse(
                success=True,
                message="Object types retrieved successfully",
                data=response.data
            )
        
        return response
    
    def get_objects(self, object_type_id: Optional[str] = None) -> BaseResponse:
        """Get objects from storage"""
        endpoint = f"{self.launcher_url}/api/v1/object_storage/objects"
        
        params = {}
        if object_type_id:
            params["object_type_id"] = object_type_id
        
        response = self.get(endpoint, params=params)
        
        if response.success:
            return BaseResponse(
                success=True,
                message="Objects retrieved successfully",
                data=response.data
            )
        
        return response
    
    def get_resources_metas(self, limit: int = 100, offset: int = 0, object_type_id: Optional[str] = None) -> BaseResponse:
        """Get resources metadata"""
        endpoint = f"{self.base_url}/api/v1/resources/metas"
        
        params = {
            "limit": limit,
            "offset": offset
        }
        
        if object_type_id:
            params["object_type_id"] = object_type_id
        
        response = self.get(endpoint, params=params)
        
        if response.success:
            return BaseResponse(
                success=True,
                message="Resources metadata retrieved successfully",
                data=response.data
            )
        
        return response
