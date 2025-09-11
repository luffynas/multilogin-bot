#!/usr/bin/env python3
"""
Test script for token validation functionality
"""
import sys
import os
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from core.auth import AuthManager
from api.launcher import LauncherAPI
from api.profile_management import ProfileManagementAPI
from api.proxy import ProxyAPI
from bot.manager import BotManager
from config import Config

def test_token_validation():
    """Test token validation functionality"""
    print("🧪 Testing Token Validation Functionality")
    print("=" * 50)
    
    # Validate configuration
    if not Config.validate():
        print("❌ Configuration error: Please set MULTILOGIN_EMAIL and MULTILOGIN_PASSWORD in .env file")
        return False
    
    try:
        # Initialize authentication manager
        print("🔐 Initializing authentication...")
        auth_manager = AuthManager()
        
        # Try to load existing token
        token = auth_manager.load_token()
        if not token or not auth_manager.is_token_valid():
            print("🔑 No valid token found, signing in...")
            result = auth_manager.sign_in()
            if not result.success:
                print(f"❌ Authentication failed: {result.error}")
                return False
            print("✅ Authentication successful")
        else:
            print("✅ Using existing valid token")
        
        # Initialize API clients
        print("🔧 Initializing API clients...")
        launcher_api = LauncherAPI(auth_manager)
        profile_api = ProfileManagementAPI(auth_manager)
        proxy_api = ProxyAPI(auth_manager)
        
        # Initialize bot manager
        print("🤖 Initializing bot manager...")
        bot_manager = BotManager(launcher_api, profile_api, auth_manager, proxy_api)
        
        # Test token validation method
        print("\n🔍 Testing token validation method...")
        is_valid = bot_manager.validate_and_refresh_token()
        
        if is_valid:
            print("✅ Token validation test passed")
        else:
            print("❌ Token validation test failed")
            return False
        
        # Test getting profiles (this will also test token validation)
        print("\n📋 Testing profile retrieval...")
        profiles = bot_manager.get_all_profiles()
        print(f"✅ Retrieved {len(profiles)} profiles")
        
        if profiles:
            # Test proxy validation for profiles
            print(f"\n🔍 Testing proxy validation for profiles...")
            test_profile = profiles[0]
            proxy_valid = bot_manager.validate_profile_proxy(test_profile)
            if proxy_valid:
                print(f"✅ Proxy validation successful for profile {test_profile.name}")
            else:
                print(f"⚠️  Proxy validation failed for profile {test_profile.name}")
            
            # Test single profile start (with token and proxy validation)
            print(f"\n🚀 Testing single profile start with token and proxy validation...")
            result = bot_manager.start_profile_bot(test_profile, automation_type="none", headless_mode=True)
            
            if result["success"]:
                print(f"✅ Profile {test_profile.name} started successfully")
                
                # Stop the profile
                print("🛑 Stopping test profile...")
                stop_result = bot_manager.stop_profile_bot(test_profile.id)
                if stop_result["success"]:
                    print("✅ Profile stopped successfully")
                else:
                    print(f"⚠️  Failed to stop profile: {stop_result['message']}")
            else:
                print(f"❌ Failed to start profile: {result['message']}")
        
        print("\n🎉 All token and proxy validation tests completed successfully!")
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_token_validation()
    sys.exit(0 if success else 1)
