"""
Object Storage API client
"""
from typing import Optional, Dict, Any, List
from api.base import BaseAPIClient
from models.base import BaseResponse

class ObjectStorageAPI(BaseAPIClient):
    """Object Storage API client"""
    
    def upload_object(
        self, 
        file_path: str, 
        object_data: Dict[str, Any]
    ) -> BaseResponse:
        """Upload an object to storage"""
        url = f"{self.base_url}/storage/upload"
        
        try:
            with open(file_path, 'rb') as file:
                files = {'file': file}
                data = object_data
                
                # Make request with file upload
                response = self._make_request(
                    "POST", 
                    url, 
                    json_data=data,
                    files=files
                )
                
                if response.success:
                    return BaseResponse(
                        success=True,
                        message="Object uploaded successfully",
                        data=response.data
                    )
                
                return response
                
        except FileNotFoundError:
            return BaseResponse(
                success=False,
                error="File not found"
            )
        except Exception as e:
            return BaseResponse(
                success=False,
                error=f"Upload failed: {str(e)}"
            )
    
    def create_extension(
        self, 
        extension_data: Dict[str, Any]
    ) -> BaseResponse:
        """Create an extension"""
        url = f"{self.base_url}/extension"
        
        response = self.post(url, json_data=extension_data)
        
        if response.success:
            return BaseResponse(
                success=True,
                message="Extension created successfully",
                data=response.data
            )
        
        return response
    
    def enable_extension(
        self, 
        extension_id: str, 
        profile_id: str
    ) -> BaseResponse:
        """Enable extension for a profile"""
        url = f"{self.base_url}/extension/{extension_id}/enable"
        
        payload = {"profile_id": profile_id}
        response = self.post(url, json_data=payload)
        
        if response.success:
            return BaseResponse(
                success=True,
                message="Extension enabled successfully"
            )
        
        return response
    
    def disable_extension(
        self, 
        extension_id: str, 
        profile_id: str
    ) -> BaseResponse:
        """Disable extension for a profile"""
        url = f"{self.base_url}/extension/{extension_id}/disable"
        
        payload = {"profile_id": profile_id}
        response = self.post(url, json_data=payload)
        
        if response.success:
            return BaseResponse(
                success=True,
                message="Extension disabled successfully"
            )
        
        return response
    
    def list_objects_per_profile(self, profile_id: str) -> BaseResponse:
        """List objects for a specific profile"""
        url = f"{self.base_url}/storage/profile/{profile_id}/objects"
        
        response = self.get(url)
        
        if response.success:
            return BaseResponse(
                success=True,
                data=response.data
            )
        
        return response
    
    def list_extensions(self) -> BaseResponse:
        """List all available extensions"""
        url = f"{self.base_url}/extension"
        
        response = self.get(url)
        
        if response.success:
            return BaseResponse(
                success=True,
                data=response.data
            )
        
        return response
