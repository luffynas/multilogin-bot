"""
Pre-made Cookies API client
"""
from typing import Optional, Dict, Any, List
from api.base import BaseAPIClient
from models.base import BaseResponse, CookieInfo

class CookiesAPI(BaseAPIClient):
    """Pre-made Cookies API client"""
    
    def get_target_website_list(self) -> BaseResponse:
        """Get list of target websites for cookies"""
        url = f"{self.base_url}/cookies/websites"
        
        response = self.get(url)
        
        if response.success:
            return BaseResponse(
                success=True,
                data=response.data
            )
        
        return response
    
    def create_cookies_metadata(
        self, 
        cookies_data: Dict[str, Any]
    ) -> BaseResponse:
        """Create cookies metadata"""
        url = f"{self.base_url}/cookies/metadata"
        
        response = self.post(url, json_data=cookies_data)
        
        if response.success:
            return BaseResponse(
                success=True,
                message="Cookies metadata created successfully",
                data=response.data
            )
        
        return response
    
    def get_cookies_list(self, profile_id: Optional[str] = None) -> BaseResponse:
        """Get list of cookies, optionally filtered by profile"""
        url = f"{self.base_url}/cookies"
        params = {}
        
        if profile_id:
            params["profile_id"] = profile_id
        
        response = self.get(url, params=params)
        
        if response.success and response.data:
            cookies_data = response.data.get("data", [])
            cookies = []
            
            for cookie_data in cookies_data:
                cookie_info = CookieInfo(
                    name=cookie_data.get("name", ""),
                    value=cookie_data.get("value", ""),
                    domain=cookie_data.get("domain", ""),
                    path=cookie_data.get("path", "/"),
                    expires=cookie_data.get("expires"),
                    secure=cookie_data.get("secure", False),
                    http_only=cookie_data.get("http_only", False)
                )
                cookies.append(cookie_info.dict())
            
            return BaseResponse(
                success=True,
                data={"cookies": cookies}
            )
        
        return response
    
    def update_cookies_metadata(
        self, 
        cookies_id: str, 
        update_data: Dict[str, Any]
    ) -> BaseResponse:
        """Update cookies metadata"""
        url = f"{self.base_url}/cookies/metadata/{cookies_id}"
        
        response = self.put(url, json_data=update_data)
        
        if response.success:
            return BaseResponse(
                success=True,
                message="Cookies metadata updated successfully"
            )
        
        return response
    
    def apply_cookies_to_profile(
        self, 
        profile_id: str, 
        cookies_data: List[Dict[str, Any]]
    ) -> BaseResponse:
        """Apply cookies to a specific profile"""
        url = f"{self.base_url}/profile/{profile_id}/cookies"
        
        response = self.post(url, json_data={"cookies": cookies_data})
        
        if response.success:
            return BaseResponse(
                success=True,
                message="Cookies applied to profile successfully"
            )
        
        return response
    
    def import_cookies(self, profile_id: str, folder_id: str, cookies_data: str) -> BaseResponse:
        """Import cookies for a profile"""
        url = f"{self.launcher_url}/api/v1/cookie_import"
        
        request_data = {
            "profile_id": profile_id,
            "folder_id": folder_id,
            "cookies": cookies_data
        }
        
        response = self.post(url, json_data=request_data)
        
        if response.success:
            return BaseResponse(
                success=True,
                message="Cookies successfully imported",
                data=response.data
            )
        
        return response
