#!/usr/bin/env python3
"""
Test script for Script Runner API
"""

import sys
import os
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from core.auth import AuthManager
from api.script_runner import ScriptRunnerAPI

def test_script_runner():
    """Test Script Runner API"""
    print("🧪 Testing Script Runner API...")
    
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
        
        # Initialize Script Runner API
        print("🔧 Initializing Script Runner API...")
        script_runner_api = ScriptRunnerAPI(auth_manager)
        
        # Test with a simple script
        test_script = "test_adsense_script.py"  # Use existing script
        test_profile_ids = ["test-profile-id"]  # This will fail but we can see the response
        
        print(f"🚀 Testing with script: {test_script}")
        print(f"📋 Testing with profile IDs: {test_profile_ids}")
        
        # Make the request
        response = script_runner_api.start_script_runner(
            script_file=test_script,
            profile_ids=test_profile_ids,
            is_headless=False
        )
        
        print(f"\n📊 Response Status: {response.success}")
        print(f"📄 Response Data: {response.data}")
        print(f"❌ Response Error: {response.error}")
        
        if response.data:
            print("\n🔍 Detailed Response Analysis:")
            if "data" in response.data:
                results = response.data.get("data", [])
                print(f"  📋 Results count: {len(results)}")
                for i, result in enumerate(results):
                    print(f"  Result {i+1}:")
                    print(f"    Profile ID: {result.get('profile_id', 'N/A')}")
                    print(f"    Status: {result.get('status', 'N/A')}")
                    print(f"    Message: {result.get('message', 'N/A')}")
        
        return True
        
    except Exception as e:
        print(f"❌ Test failed with error: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_script_runner()
    if success:
        print("\n✅ Test completed successfully")
    else:
        print("\n❌ Test failed")
        sys.exit(1)
