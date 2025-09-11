"""
Configuration management for Multilogin X API automation
"""
import os
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Config:
    """Configuration class for the application"""
    
    # API Configuration
    MULTILOGIN_EMAIL: str = os.getenv("MULTILOGIN_EMAIL", "")
    MULTILOGIN_PASSWORD: str = os.getenv("MULTILOGIN_PASSWORD", "")
    MULTILOGIN_BASE_URL: str = os.getenv("MULTILOGIN_BASE_URL", "https://api.multilogin.com")
    MULTILOGIN_LAUNCHER_URL: str = os.getenv("MULTILOGIN_LAUNCHER_URL", "https://launcher.mlx.yt:45001")
    
    # Token storage
    TOKEN_FILE: str = os.getenv("TOKEN_FILE", "token.json")
    
    # Bot configuration
    MAX_PROFILE_RUNTIME: int = int(os.getenv("MAX_PROFILE_RUNTIME", "1800"))  # 30 minutes
    MIN_START_INTERVAL: int = int(os.getenv("MIN_START_INTERVAL", "60"))      # 1 minute
    MAX_START_INTERVAL: int = int(os.getenv("MAX_START_INTERVAL", "300"))     # 5 minutes
    
    # Default geo setting (US instead of ID as per memory)
    DEFAULT_GEO: str = "US"
    
    @classmethod
    def validate(cls) -> bool:
        """Validate that required configuration is present"""
        if not cls.MULTILOGIN_EMAIL or not cls.MULTILOGIN_PASSWORD:
            return False
        return True
    
    @classmethod
    def get_token_path(cls) -> Path:
        """Get the full path to the token file"""
        return Path(cls.TOKEN_FILE)
