"""
Authentication management for Multilogin X API
"""
import json
import requests
import hashlib
import base64
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from pathlib import Path

from models.base import TokenInfo, BaseResponse
from config import Config

class AuthManager:
    """Manages authentication and token operations"""
    
    def __init__(self):
        self.base_url = Config.MULTILOGIN_BASE_URL
        self.token_file = Config.get_token_path()
        self._current_token: Optional[TokenInfo] = None
    
    def _hash_password(self, password: str) -> str:
        """Hash password using MD5 as required by Multilogin X API"""
        return hashlib.md5(password.encode()).hexdigest()
    
    def _decode_jwt_payload(self, token: str) -> Optional[Dict[str, Any]]:
        """Decode JWT token payload without verification (for expiration check)"""
        try:
            # Split token into parts
            parts = token.split('.')
            if len(parts) != 3:
                return None
            
            # Decode payload (second part)
            payload = parts[1]
            
            # Add padding if needed
            missing_padding = len(payload) % 4
            if missing_padding:
                payload += '=' * (4 - missing_padding)
            
            # Decode base64
            decoded_bytes = base64.urlsafe_b64decode(payload)
            payload_data = json.loads(decoded_bytes.decode('utf-8'))
            
            return payload_data
        except Exception as e:
            print(f"Error decoding JWT payload: {e}")
            return None
    
    def load_token(self) -> Optional[TokenInfo]:
        """Load token from file"""
        try:
            if self.token_file.exists():
                with open(self.token_file, 'r') as f:
                    token_data = json.load(f)
                    self._current_token = TokenInfo(**token_data)
                    return self._current_token
        except Exception as e:
            print(f"Error loading token: {e}")
        return None
    
    def save_token(self, token: TokenInfo) -> None:
        """Save token to file"""
        try:
            with open(self.token_file, 'w') as f:
                json.dump(token.dict(), f, indent=2, default=str)
            self._current_token = token
        except Exception as e:
            print(f"Error saving token: {e}")
    
    def is_token_valid(self) -> bool:
        """Check if current token is valid by decoding JWT exp field"""
        if not self._current_token or not self._current_token.access_token:
            return False
        
        # Decode JWT payload to get expiration time
        payload = self._decode_jwt_payload(self._current_token.access_token)
        if not payload or 'exp' not in payload:
            return False
        
        # Check if token is expired
        exp_timestamp = payload['exp']
        exp_datetime = datetime.fromtimestamp(exp_timestamp)
        current_time = datetime.now()
        
        # Add 1 minute buffer to avoid edge cases
        return current_time < (exp_datetime - timedelta(minutes=1))
    
    def get_token_expiration_time(self) -> Optional[datetime]:
        """Get token expiration time from JWT payload"""
        if not self._current_token or not self._current_token.access_token:
            return None
        
        payload = self._decode_jwt_payload(self._current_token.access_token)
        if not payload or 'exp' not in payload:
            return None
        
        exp_timestamp = payload['exp']
        return datetime.fromtimestamp(exp_timestamp)
    
    def get_token_remaining_time(self) -> Optional[timedelta]:
        """Get remaining time until token expires"""
        exp_time = self.get_token_expiration_time()
        if not exp_time:
            return None
        
        current_time = datetime.now()
        remaining = exp_time - current_time
        return remaining if remaining.total_seconds() > 0 else timedelta(0)
    
    def get_workspace_id(self) -> Optional[str]:
        """Get workspace ID from current JWT token"""
        if not self._current_token or not self._current_token.access_token:
            return None
        
        payload = self._decode_jwt_payload(self._current_token.access_token)
        if not payload:
            return None
        
        return payload.get('workspaceID')
    
    def get_auth_headers(self) -> Dict[str, str]:
        """Get authentication headers"""
        if not self._current_token:
            raise ValueError("No valid token available")
        
        return {
            "Authorization": f"{self._current_token.token_type} {self._current_token.access_token}",
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
    
    def sign_in(self, email: str = None, password: str = None) -> BaseResponse:
        """Sign in to Multilogin X API"""
        email = email or Config.MULTILOGIN_EMAIL
        password = password or Config.MULTILOGIN_PASSWORD
        
        if not email or not password:
            return BaseResponse(
                success=False,
                error="Email and password are required"
            )
        
        url = f"{self.base_url}/user/signin"
        
        # Hash password using MD5 as required by Multilogin X API
        hashed_password = self._hash_password(password)
        
        payload = {
            "email": email,
            "password": hashed_password
        }
        
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers)
            response.raise_for_status()
            
            data = response.json()
            
            # Check if the response has the expected structure
            if data.get("status", {}).get("http_code") == 200:
                # Create token without manual expires_at - will be calculated from JWT
                token = TokenInfo(
                    access_token=data["data"]["token"],
                    refresh_token=data["data"].get("refresh_token"),
                    expires_at=None  # Will be calculated from JWT exp field
                )
                
                self.save_token(token)
                
                return BaseResponse(
                    success=True,
                    message="Successfully signed in",
                    data={"token": token.dict()}
                )
            else:
                return BaseResponse(
                    success=False,
                    error=data.get("status", {}).get("message", "Sign in failed")
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
    
    def refresh_token(self) -> BaseResponse:
        """Refresh the current token"""
        if not self._current_token or not self._current_token.refresh_token:
            return BaseResponse(
                success=False,
                error="No refresh token available"
            )
        
        url = f"{self.base_url}/user/refresh_token"
        
        # Get workspace ID from current JWT token
        workspace_id = self.get_workspace_id()
        
        # Fallback to default if not found in token
        if not workspace_id:
            workspace_id = "d3602d53-2e54-4cce-87d7-64e89e0f8679"
            print(f"⚠️ Using fallback workspace ID: {workspace_id}")
        else:
            print(f"✅ Using workspace ID from JWT: {workspace_id}")
        
        payload = {
            "email": Config.MULTILOGIN_EMAIL,
            "refresh_token": self._current_token.refresh_token,
            "workspace_id": workspace_id
        }
        
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        
        try:
            response = requests.post(url, json=payload, headers=headers)
            response.raise_for_status()
            
            data = response.json()
            
            # Check if the response has the expected structure
            if data.get("status", {}).get("http_code") == 200:
                # Create token without manual expires_at - will be calculated from JWT
                token = TokenInfo(
                    access_token=data["data"]["token"],
                    refresh_token=data["data"].get("refresh_token"),
                    expires_at=None  # Will be calculated from JWT exp field
                )
                
                self.save_token(token)
                
                return BaseResponse(
                    success=True,
                    message="Token refreshed successfully",
                    data={"token": token.dict()}
                )
            else:
                return BaseResponse(
                    success=False,
                    error=data.get("status", {}).get("message", "Token refresh failed")
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
    
    def ensure_valid_token(self) -> bool:
        """Ensure we have a valid token, refresh if needed"""
        if not self.is_token_valid():
            if self._current_token and self._current_token.refresh_token:
                result = self.refresh_token()
                return result.success
            else:
                result = self.sign_in()
                return result.success
        return True
