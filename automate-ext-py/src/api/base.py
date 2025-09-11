"""
Base API client for Multilogin X API
"""
import requests
from typing import Dict, Any, Optional
from core.auth import AuthManager
from models.base import BaseResponse
from config import Config

class BaseAPIClient:
    """Base API client with common functionality"""
    
    def __init__(self, auth_manager: AuthManager):
        self.auth_manager = auth_manager
        self.base_url = Config.MULTILOGIN_BASE_URL
        self.launcher_url = Config.MULTILOGIN_LAUNCHER_URL
    
    def _make_request(
        self, 
        method: str, 
        url: str, 
        headers: Optional[Dict[str, str]] = None,
        params: Optional[Dict[str, Any]] = None,
        json_data: Optional[Dict[str, Any]] = None,
        files: Optional[Dict[str, Any]] = None
    ) -> BaseResponse:
        """Make HTTP request with error handling"""
        
        # Ensure we have valid authentication
        if not self.auth_manager.ensure_valid_token():
            return BaseResponse(
                success=False,
                error="Authentication failed"
            )
        
        # Prepare headers
        request_headers = self.auth_manager.get_auth_headers()
        if headers:
            request_headers.update(headers)
        
        try:
            # Handle file uploads differently
            if files:
                # Remove Content-Type header for file uploads
                if 'Content-Type' in request_headers:
                    del request_headers['Content-Type']
                response = requests.request(
                    method=method,
                    url=url,
                    headers=request_headers,
                    params=params,
                    data=json_data,
                    files=files,
                    timeout=30
                )
            else:
                response = requests.request(
                    method=method,
                    url=url,
                    headers=request_headers,
                    params=params,
                    json=json_data,
                    timeout=30
                )
            
            # Handle different status codes
            if response.status_code == 200:
                try:
                    data = response.json()
                    return BaseResponse(
                        success=True,
                        data=data
                    )
                except Exception as e:
                    return BaseResponse(
                        success=False,
                        error=f"Failed to parse JSON response: {str(e)}"
                    )
            elif response.status_code == 401:
                # Token might be expired, try to refresh
                if self.auth_manager.refresh_token().success:
                    # Retry the request
                    if files:
                        retry_headers = self.auth_manager.get_auth_headers()
                        if 'Content-Type' in retry_headers:
                            del retry_headers['Content-Type']
                        response = requests.request(
                            method=method,
                            url=url,
                            headers=retry_headers,
                            params=params,
                            data=json_data,
                            files=files,
                            timeout=30
                        )
                    else:
                        response = requests.request(
                            method=method,
                            url=url,
                            headers=self.auth_manager.get_auth_headers(),
                            params=params,
                            json=json_data,
                            timeout=30
                        )
                    if response.status_code == 200:
                        data = response.json()
                        return BaseResponse(
                            success=True,
                            data=data
                        )
                
                return BaseResponse(
                    success=False,
                    error="Authentication failed"
                )
            elif response.status_code == 429:
                return BaseResponse(
                    success=False,
                    error="Rate limit exceeded"
                )
            else:
                return BaseResponse(
                    success=False,
                    error=f"HTTP {response.status_code}: {response.text}"
                )
                
        except requests.exceptions.Timeout:
            return BaseResponse(
                success=False,
                error="Request timeout"
            )
        except requests.exceptions.RequestException as e:
            return BaseResponse(
                success=False,
                error=f"Request failed: {str(e)}"
            )
        except Exception as e:
            return BaseResponse(
                success=False,
                error=f"Unexpected error: {str(e)}"
            )
    
    def get(self, url: str, params: Optional[Dict[str, Any]] = None) -> BaseResponse:
        """Make GET request"""
        return self._make_request("GET", url, params=params)
    
    def post(self, url: str, json_data: Optional[Dict[str, Any]] = None) -> BaseResponse:
        """Make POST request"""
        return self._make_request("POST", url, json_data=json_data)
    
    def put(self, url: str, json_data: Optional[Dict[str, Any]] = None) -> BaseResponse:
        """Make PUT request"""
        return self._make_request("PUT", url, json_data=json_data)
    
    def delete(self, url: str) -> BaseResponse:
        """Make DELETE request"""
        return self._make_request("DELETE", url)
