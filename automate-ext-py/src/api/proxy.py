"""
Proxy Management API client
"""
from typing import Optional, Dict, Any, List
from api.base import BaseAPIClient
from models.base import BaseResponse, ProxyInfo

class ProxyAPI(BaseAPIClient):
    """Proxy Management API client"""
    
    def generate_proxy(self, proxy_config: Dict[str, Any]) -> BaseResponse:
        """Generate proxy configuration"""
        url = f"{self.base_url}/proxy/generate"
        
        response = self.post(url, json_data=proxy_config)
        
        if response.success and response.data:
            proxy_data = response.data.get("data", {})
            proxy_info = ProxyInfo(
                host=proxy_data.get("host", ""),
                port=proxy_data.get("port", 0),
                username=proxy_data.get("username"),
                password=proxy_data.get("password"),
                type=proxy_data.get("type", "http")
            )
            
            return BaseResponse(
                success=True,
                message="Proxy generated successfully",
                data={"proxy": proxy_info.dict()}
            )
        
        return response
    
    def fetch_proxy_data(self, proxy_id: str) -> BaseResponse:
        """Fetch proxy data by ID"""
        url = f"{self.base_url}/proxy/{proxy_id}"
        
        response = self.get(url)
        
        if response.success and response.data:
            proxy_data = response.data.get("data", {})
            proxy_info = ProxyInfo(
                host=proxy_data.get("host", ""),
                port=proxy_data.get("port", 0),
                username=proxy_data.get("username"),
                password=proxy_data.get("password"),
                type=proxy_data.get("type", "http")
            )
            
            return BaseResponse(
                success=True,
                data={"proxy": proxy_info.dict()}
            )
        
        return response
    
    def list_proxies(self) -> BaseResponse:
        """List all available proxies"""
        url = f"{self.base_url}/proxy"
        
        response = self.get(url)
        
        if response.success and response.data:
            proxies_data = response.data.get("data", [])
            proxies = []
            
            for proxy_data in proxies_data:
                proxy_info = ProxyInfo(
                    host=proxy_data.get("host", ""),
                    port=proxy_data.get("port", 0),
                    username=proxy_data.get("username"),
                    password=proxy_data.get("password"),
                    type=proxy_data.get("type", "http")
                )
                proxies.append(proxy_info.dict())
            
            return BaseResponse(
                success=True,
                data={"proxies": proxies}
            )
        
        return response
    
    def get_profile_setup(self, username: str) -> BaseResponse:
        """Get profile setup data for proxy configuration"""
        url = f"{self.base_url}/proxynm/profile_setup"
        
        params = {"username": username}
        
        response = self.get(url, params=params)
        
        if response.success:
            return BaseResponse(
                success=True,
                message="Profile setup retrieved successfully",
                data=response.data
            )
        
        return response
    
    def get_connection_url(
        self, 
        country: str = "us",
        region: str = "",
        city: str = "",
        session_type: str = "sticky",
        protocol: str = "socks5",
        ip_ttl: int = 0,
        connection_type: str = "residential",
        workspace_id: str = ""
    ) -> BaseResponse:
        """Get connection URL for proxy"""
        url = f"{self.base_url}/proxynm/connection_url"
        
        params = {
            "country": country,
            "region": region,
            "city": city,
            "session_type": session_type,
            "protocol": protocol,
            "ip_ttl": ip_ttl,
            "connection_type": connection_type,
            "workspace_id": workspace_id
        }
        
        # Remove empty parameters
        params = {k: v for k, v in params.items() if v}
        
        response = self.get(url, params=params)
        
        if response.success:
            return BaseResponse(
                success=True,
                message="Connection URL retrieved successfully",
                data=response.data
            )
        
        return response
    
    def validate_proxy(self, proxy_config: Dict[str, Any]) -> BaseResponse:
        """Validate proxy configuration"""
        url = f"{self.launcher_url}/api/v1/proxy/validate"
        
        response = self.post(url, json_data=proxy_config)
        
        if response.success:
            return BaseResponse(
                success=True,
                message="Proxy validated successfully",
                data=response.data
            )
        
        return response
    
    def update_profile_proxy(
        self, 
        profile_id: str, 
        proxy_data: Dict[str, Any]
    ) -> BaseResponse:
        """Update proxy for a specific profile (legacy method)"""
        url = f"{self.base_url}/profile/{profile_id}/proxy"
        
        response = self.put(url, json_data=proxy_data)
        
        if response.success:
            return BaseResponse(
                success=True,
                message="Profile proxy updated successfully"
            )
        
        return response
    
    def update_profile_with_proxy(
        self, 
        profile_id: str,
        name: str,
        tags: list,
        custom_start_urls: list,
        proxy_config: Dict[str, Any],
        profile_data: Dict[str, Any]
    ) -> BaseResponse:
        """Update profile with new proxy configuration using profile/update endpoint"""
        url = f"{self.base_url}/profile/update"
        
        # Extract existing parameters from profile metadata
        existing_parameters = profile_data.get("parameters", {})
        existing_fingerprint = existing_parameters.get("fingerprint", {})
        existing_flags = existing_parameters.get("flags", {})
        existing_storage = existing_parameters.get("storage", {})
        
        # Prepare the update data using existing profile metadata
        update_data = {
            "profile_id": profile_id,
            "name": name,
            "tags": tags,
            "parameters": {
                "custom_start_urls": custom_start_urls,
                "fingerprint": existing_fingerprint,
                "flags": existing_flags,
                "proxy": proxy_config,
                "storage": existing_storage
            }
        }
        
        response = self.post(url, json_data=update_data)
        
        if response.success:
            return BaseResponse(
                success=True,
                message="Profile updated successfully with new proxy",
                data=response.data
            )
        
        return response
