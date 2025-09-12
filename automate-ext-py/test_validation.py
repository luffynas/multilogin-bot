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

def test_validation():
    """Test token and proxy validation functionality"""
    print("🧪 Testing Token and Proxy Validation Functionality")
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
        
        # Test folder filtering functionality
        print("\n📁 Testing folder filtering functionality...")
        folders = bot_manager.get_available_folders()
        if folders:
            print(f"✅ Found {len(folders)} folders:")
            for folder in folders:
                folder_name = folder.get("name", "Unknown")
                folder_id = folder.get("folder_id", "")
                profiles_count = folder.get("profiles_count", 0)
                print(f"  - {folder_name} (ID: {folder_id[:8]}..., Profiles: {profiles_count})")
            
            # Test filtering by first folder
            if folders:
                test_folder_id = folders[0].get("folder_id")
                test_folder_name = folders[0].get("name", "Unknown")
                print(f"\n🔍 Testing profile filtering for folder: {test_folder_name}")
                filtered_profiles = bot_manager.get_all_profiles(test_folder_id)
                print(f"✅ Found {len(filtered_profiles)} profiles in folder '{test_folder_name}'")
        else:
            print("⚠️  No folders found")
        
        if profiles:
            # Test proxy validation for profiles (with auto-update capability)
            print(f"\n🔍 Testing proxy validation with auto-update for profiles...")
            test_profile = profiles[0]
            
            # Test auto-update proxy functionality
            print(f"\n🔄 Testing auto-update proxy functionality...")
            proxy_config = bot_manager._extract_proxy_config_from_profile(test_profile)
            if proxy_config:
                print(f"📋 Current proxy config: {proxy_config.get('host', 'N/A')}:{proxy_config.get('port', 'N/A')}")
                
                # Test getting new proxy connection
                new_proxy = bot_manager._get_new_proxy_connection(proxy_config)
                if new_proxy:
                    print(f"✅ Successfully generated new proxy: {new_proxy.get('host', 'N/A')}:{new_proxy.get('port', 'N/A')}")
                else:
                    print(f"⚠️  Failed to generate new proxy")
            else:
                print(f"⚠️  No proxy configuration found for testing")
            
            proxy_valid = bot_manager.validate_profile_proxy(test_profile)
            if proxy_valid:
                print(f"✅ Proxy validation successful for profile {test_profile.name}")
            else:
                print(f"⚠️  Proxy validation failed for profile {test_profile.name}")
            
            # Test single profile start (with token and proxy validation + auto-update)
            print(f"\n🚀 Testing single profile start with token and proxy validation (with auto-update)...")
            print(f"📝 Note: Proxy validation now happens individually per profile, not in batch")
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
        
        # Test concurrent execution (if multiple profiles available)
        if len(profiles) > 1:
            print(f"\n🚀 Testing concurrent execution with {min(2, len(profiles))} profiles...")
            test_profiles = profiles[:2]  # Test with first 2 profiles
            concurrent_results = bot_manager.run_concurrent_bots(
                test_profiles, 
                max_concurrent=2, 
                automation_type="none", 
                headless_mode=True
            )
            
            successful_concurrent = sum(1 for r in concurrent_results if r["success"])
            print(f"✅ Concurrent execution completed: {successful_concurrent}/{len(concurrent_results)} successful")
            
            # Stop any running profiles from concurrent test
            for profile in test_profiles:
                stop_result = bot_manager.stop_profile_bot(profile.id)
                if stop_result["success"]:
                    print(f"🛑 Stopped test profile: {profile.name}")
        else:
            print(f"\n⚠️  Only {len(profiles)} profile available, skipping concurrent execution test")
        
        print("\n🎉 All token, proxy validation (with auto-update), and concurrent execution tests completed successfully!")
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed with error: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_validation()
    sys.exit(0 if success else 1)
