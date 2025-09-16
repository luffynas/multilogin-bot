#!/usr/bin/env python3
"""
Monitor Script Runner status untuk menganalisis execution failures
"""

import sys
import os
import time
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from core.auth import AuthManager
from api.script_runner import ScriptRunnerAPI
from api.profile_management import ProfileManagementAPI
from api.proxy import ProxyAPI
from api.launcher import LauncherAPI
from bot.manager import BotManager

def monitor_script_execution():
    """Monitor script execution untuk melihat apa yang terjadi setelah API success"""
    print("🔍 Monitoring Script Runner Execution...")
    
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
        
        launcher_api = LauncherAPI(auth_manager)
        profile_api = ProfileManagementAPI(auth_manager)
        proxy_api = ProxyAPI(auth_manager)
        bot_manager = BotManager(launcher_api, profile_api, auth_manager, proxy_api)
        
        # Get test profiles
        print("📋 Getting test profiles...")
        profiles = bot_manager.get_all_profiles()
        
        if not profiles:
            print("❌ No profiles found")
            return False
        
        # Take first 3 profiles for detailed monitoring
        test_profiles = profiles[:3]
        test_profile_ids = [p.id for p in test_profiles]
        
        print(f"🧪 Monitoring {len(test_profile_ids)} profiles:")
        for i, profile in enumerate(test_profiles, 1):
            print(f"  {i}. {profile.name} (ID: {profile.id[:8]}...)")
        
        # Test script
        test_script = "advanced_website_robot.py"
        print(f"\n📄 Using script: {test_script}")
        
        # Start script runner for all profiles
        print("\n🚀 Starting Script Runner for all profiles...")
        response = script_runner_api.start_script_runner(
            script_file=test_script,
            profile_ids=test_profile_ids,
            is_headless=False
        )
        
        print(f"📊 Initial Response:")
        print(f"  - Success: {response.success}")
        print(f"  - Data: {response.data}")
        print(f"  - Error: {response.error}")
        
        if response.data and "data" in response.data:
            results = response.data.get("data", [])
            print(f"\n📋 Individual Profile Results:")
            for i, result in enumerate(results, 1):
                profile_id = result.get("profile_id", "unknown")
                status = result.get("status", "unknown")
                message = result.get("message", "no message")
                print(f"  {i}. Profile {profile_id[:8]}...: {status}")
                if message != "no message":
                    print(f"     Message: {message}")
        
        # Monitor status for a few minutes
        print(f"\n⏱️  Monitoring script execution for 3 minutes...")
        print("   (Check Multilogin X interface to see actual browser behavior)")
        
        for minute in range(3):
            print(f"\n--- Minute {minute + 1}/3 ---")
            
            # Check script status
            try:
                status_response = script_runner_api.get_script_runner_status(test_profile_ids)
                print(f"📊 Status Check:")
                print(f"  - Success: {status_response.success}")
                print(f"  - Data: {status_response.data}")
                print(f"  - Error: {status_response.error}")
            except Exception as e:
                print(f"❌ Status check failed: {str(e)}")
            
            # Wait 1 minute
            if minute < 2:  # Don't wait after last iteration
                print("⏳ Waiting 60 seconds...")
                time.sleep(60)
        
        print(f"\n📊 Final Analysis:")
        print("Possible reasons for script execution failures:")
        print("1. 🌐 Network connectivity issues during script execution")
        print("2. ⏱️  Script timeout or hanging")
        print("3. 🔌 Proxy connection drops during execution")
        print("4. 💾 Browser crashes or memory issues")
        print("5. 🚫 Website blocking or rate limiting")
        print("6. 📄 Script errors (Python exceptions)")
        print("7. 🔒 Profile authentication issues during execution")
        print("8. 🖥️  System resource constraints")
        
        print(f"\n💡 Recommendations:")
        print("1. Check Multilogin X interface for actual browser behavior")
        print("2. Monitor system resources (CPU, Memory)")
        print("3. Check proxy status and connectivity")
        print("4. Review script logs in Multilogin X")
        print("5. Test with simpler script first")
        print("6. Try with headless mode to reduce resource usage")
        
        return True
        
    except Exception as e:
        print(f"❌ Monitor script failed: {str(e)}")
        return False

if __name__ == "__main__":
    monitor_script_execution()
