"""
Base models for Multilogin X API
"""
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from datetime import datetime

class BaseResponse(BaseModel):
    """Base response model"""
    success: bool = Field(default=True)
    message: Optional[str] = None
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

class ProfileInfo(BaseModel):
    """Profile information model"""
    id: str
    name: str
    folder_id: str
    status: Optional[str] = None
    port: Optional[int] = None
    automation_type: Optional[str] = None
    headless_mode: Optional[bool] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class WorkspaceInfo(BaseModel):
    """Workspace information model"""
    id: str
    name: str
    folders: Optional[List[Dict[str, Any]]] = None

class TokenInfo(BaseModel):
    """Token information model"""
    access_token: str
    refresh_token: Optional[str] = None
    expires_at: Optional[datetime] = None
    token_type: str = "Bearer"

class ProxyInfo(BaseModel):
    """Proxy information model"""
    host: str
    port: int
    username: Optional[str] = None
    password: Optional[str] = None
    type: str = "http"  # http, https, socks4, socks5

class CookieInfo(BaseModel):
    """Cookie information model"""
    name: str
    value: str
    domain: str
    path: str = "/"
    expires: Optional[datetime] = None
    secure: bool = False
    http_only: bool = False
