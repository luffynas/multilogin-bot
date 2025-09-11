#!/usr/bin/env python3
"""
Test script to verify Multilogin X API connection
"""
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from core.auth import AuthManager
from config import Config

def test_connection():
    """Test basic connection to Multilogin X API"""
    print("🧪 Testing Multilogin X API Connection...")
    
    # Check configuration
    if not Config.validate():
        print("❌ Configuration error: Please set MULTILOGIN_EMAIL and MULTILOGIN_PASSWORD in .env file")
        return False
    
    print(f"📧 Email: {Config.MULTILOGIN_EMAIL}")
    print(f"🌐 Base URL: {Config.MULTILOGIN_BASE_URL}")
    print(f"🚀 Launcher URL: {Config.MULTILOGIN_LAUNCHER_URL}")
    
    # Test authentication
    auth_manager = AuthManager()
    
    print("\n🔐 Testing authentication...")
    result = auth_manager.sign_in()
    
    if result.success:
        print("✅ Authentication successful!")
        print(f"🎫 Token saved to: {Config.get_token_path()}")
        return True
    else:
        print(f"❌ Authentication failed: {result.error}")
        return False

if __name__ == "__main__":
    success = test_connection()
    sys.exit(0 if success else 1)
