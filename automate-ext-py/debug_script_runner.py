#!/usr/bin/env python3
"""
Debug script untuk menganalisis Script Runner failures
"""

import sys
import os
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from core.auth import AuthManager
from api.script_runner import ScriptRunnerAPI
from bot.manager import BotManager

def debug_script_runner_failures():
    """Debug Script Runner failures dengan detail response"""
    print("🔍 Debugging Script Runner Failures...")
    
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
        
        # Initialize APIs
        print("🔧 Initializing APIs...")
        script_runner_api = ScriptRunnerAPI(auth_manager)
        
        # Initialize BotManager with required APIs
        from api.profile_management import ProfileManagementAPI
        from api.proxy import ProxyAPI
        from api.launcher import LauncherAPI
        
        launcher_api = LauncherAPI(auth_manager)
        profile_api = ProfileManagementAPI(auth_manager)
        proxy_api = ProxyAPI(auth_manager)
        bot_manager = BotManager(launcher_api, profile_api, auth_manager, proxy_api)
        
        # Get some test profiles
        print("📋 Getting test profiles...")
        profiles = bot_manager.get_all_profiles()
        
        if not profiles:
            print("❌ No profiles found")
            return False
        
        # Take first 5 profiles for testing
        test_profiles = profiles[:5]
        test_profile_ids = [p.id for p in test_profiles]
        
        print(f"🧪 Testing with {len(test_profile_ids)} profiles:")
        for i, profile in enumerate(test_profiles, 1):
            print(f"  {i}. {profile.name} (ID: {profile.id[:8]}...)")
        
        # Test script - try different script names
        test_scripts = [
            "simple_test_script.py",
            "advanced_website_robot.py", 
            "test_adsense_script.py",
            "example.py"
        ]
        
        # Try each script until we find one that works
        test_script = None
        for script in test_scripts:
            print(f"🔍 Testing script: {script}")
            # Quick test with first profile
            response = script_runner_api.start_script_runner(
                script_file=script,
                profile_ids=[test_profile_ids[0]],
                is_headless=False
            )
            
            if response.data and "data" in response.data:
                results = response.data.get("data", [])
                if results and results[0].get("status") != "error":
                    test_script = script
                    print(f"✅ Found working script: {script}")
                    break
                elif results and "not found" not in results[0].get("message", "").lower():
                    test_script = script
                    print(f"✅ Script exists (may have other issues): {script}")
                    break
            elif response.error and "not found" not in response.error.lower():
                test_script = script
                print(f"✅ Script exists (may have other issues): {script}")
                break
            else:
                print(f"❌ Script not found: {script}")
        
        if not test_script:
            print("❌ No working script found, using simple_test_script.py for testing")
            test_script = "simple_test_script.py"
        print(f"\n📄 Using script: {test_script}")
        
        # Test each profile individually to see detailed responses
        print("\n🔍 Testing each profile individually...")
        
        for i, profile_id in enumerate(test_profile_ids, 1):
            print(f"\n--- Profile {i}/{len(test_profile_ids)} ---")
            print(f"Profile ID: {profile_id[:8]}...")
            
            try:
                # Make the request
                response = script_runner_api.start_script_runner(
                    script_file=test_script,
                    profile_ids=[profile_id],
                    is_headless=False
                )
                
                print(f"✅ API Call Successful: {response.success}")
                print(f"📄 Response Data: {response.data}")
                print(f"❌ Response Error: {response.error}")
                
                # Analyze the response data
                if response.data and "data" in response.data:
                    results = response.data.get("data", [])
                    if results:
                        result = results[0]
                        print(f"📊 Profile Result:")
                        print(f"  - Status: {result.get('status', 'unknown')}")
                        print(f"  - Message: {result.get('message', 'no message')}")
                        print(f"  - Profile ID: {result.get('profile_id', 'unknown')}")
                        
                        # Check for specific error patterns
                        message = result.get('message', '').lower()
                        if 'proxy' in message:
                            print("  🚨 PROXY ERROR DETECTED")
                        elif 'connection' in message:
                            print("  🚨 CONNECTION ERROR DETECTED")
                        elif 'timeout' in message:
                            print("  🚨 TIMEOUT ERROR DETECTED")
                        elif 'browser' in message:
                            print("  🚨 BROWSER ERROR DETECTED")
                        elif 'script' in message:
                            print("  🚨 SCRIPT ERROR DETECTED")
                    else:
                        print("  ⚠️  No results in response data")
                else:
                    print("  ⚠️  No data in response")
                
            except Exception as e:
                print(f"❌ Exception during API call: {str(e)}")
        
        print("\n📊 Summary Analysis:")
        print("Common causes of Script Runner failures:")
        print("1. 🔌 Proxy connection issues")
        print("2. 🌐 Network connectivity problems")
        print("3. ⏱️  Browser startup timeouts")
        print("4. 📄 Script file not found or invalid")
        print("5. 🔒 Profile authentication issues")
        print("6. 💾 Insufficient system resources")
        print("7. 🚫 Profile already running")
        
        return True
        
    except Exception as e:
        print(f"❌ Debug script failed: {str(e)}")
        return False

if __name__ == "__main__":
    debug_script_runner_failures()
