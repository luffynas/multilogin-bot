#!/usr/bin/env python3
"""
Multilogin X API Connection Test Script v2
Tests connection to Multilogin X using correct endpoints from Postman collection
Based on comprehensive analysis of: Multilogin X API.postman_collection.json
"""

import requests
import yaml
import json
import sys
import os
import hashlib
from typing import Dict, Optional

def load_config(config_path: str = "config/config.yaml") -> Dict:
    """Load configuration from YAML file"""
    try:
        with open(config_path, 'r', encoding='utf-8') as file:
            return yaml.safe_load(file)
    except Exception as e:
        print(f"❌ Error loading config: {e}")
        return None

def sign_in_to_multilogin_x(username: str, password: str, base_url: str) -> str:
    """Sign in to Multilogin X and get bearer token"""
    try:
        # ✅ IMPLEMENTATION BASED ON OFFICIAL DOCUMENTATION
        sign_url = f"{base_url}/user/signin"
        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
        }
        
        # ✅ MD5 ENCRYPTION FOR PASSWORD (as per documentation)
        payload = {
            "email": username,
            "password": str(hashlib.md5(password.encode()).hexdigest()),
        }
        
        # POST request to sign in
        resp = requests.post(sign_url, json=payload, headers=headers)
        resp_json = resp.json()
        
        # Get bearer token
        token = resp_json["data"]["token"]
        return token
        
    except Exception as e:
        print(f"❌ ERROR: Failed to sign in to Multilogin X: {str(e)}")
        return None

def test_profile_search(config: Dict) -> tuple[bool, str]:
    """Test profile search endpoint (correct way to get profiles)"""
    print("🔍 Testing Profile Search (GET profiles)...")
    print("=" * 50)
    
    # Get Multilogin config
    ml_config = config.get("multilogin", {})
    username = ml_config.get("username")
    password = ml_config.get("password")
    base_url = ml_config.get("base_url", "https://api.multilogin.com")
    
    # Validate credentials
    if not username or username == "YOUR_MULTILOGIN_X_EMAIL":
        print("❌ ERROR: Username not configured!")
        return False, ""
    
    if not password or password == "YOUR_MULTILOGIN_X_PASSWORD":
        print("❌ ERROR: Password not configured!")
        return False, ""
    
    print(f"✅ Username: {username}")
    print(f"✅ Base URL: {base_url}")
    
    # Sign in to get token
    print("\n🔍 Step 1: Signing in to Multilogin X...")
    token = sign_in_to_multilogin_x(username, password, base_url)
    
    if not token:
        print("❌ ERROR: Failed to sign in to Multilogin X")
        return False, ""
    
    print(f"✅ SUCCESS: Signed in to Multilogin X")
    print(f"✅ Token: {token[:20]}...")
    
    # Setup headers based on Postman collection
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "X-Strict-Mode": "false",  # Based on Postman collection
        "Authorization": f"Bearer {token}"
    }
    
    # Test profile search endpoint (correct way to get profiles)
    print("\n🔍 Step 2: Testing Profile Search endpoint...")
    try:
        # ✅ CORRECT ENDPOINT FROM POSTMAN COLLECTION
        search_payload = {
            "search_text": "",  # ✅ Required field based on error message
            "limit": 10,
            "offset": 0,
            "is_removed": False,
            "storage_type": "all",
            "order_by": "created_at",
            "sort": "desc"
        }
        
        response = requests.post(
            f"{base_url}/profile/search",  # ✅ Correct endpoint from Postman collection
            headers=headers,
            json=search_payload,
            timeout=30
        )
        
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.text[:300]}...")
        
        if response.status_code == 200:
            profiles_data = response.json()
            print(f"✅ SUCCESS: Profile search working!")
            print(f"✅ Found profiles data: {profiles_data}")
            return True, token
        elif response.status_code == 401:
            print("❌ ERROR: Unauthorized - Token may be invalid")
            return False, ""
        elif response.status_code == 404:
            print("❌ ERROR: API endpoint not found")
            return False, ""
        else:
            print(f"❌ ERROR: HTTP {response.status_code} - {response.text}")
            return False, ""
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False, ""

def test_profile_creation(config: Dict, token: str) -> bool:
    """Test profile creation functionality"""
    print("\n🔍 Step 3: Testing profile creation...")
    
    ml_config = config.get("multilogin", {})
    base_url = ml_config.get("base_url", "https://api.multilogin.com")
    
    # Use token from previous step
    if not token:
        print("❌ ERROR: No token provided")
        return False
    
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "X-Strict-Mode": "false",
        "Authorization": f"Bearer {token}"
    }
    
    # ✅ CORRECT PROFILE STRUCTURE FROM POSTMAN COLLECTION
    test_profile = {
        "name": "Test Profile - API Connection Test",
        "browser_type": "mimic",  # Based on sample request
        "folder_id": "d3602d53-2e54-4cce-87d7-64e89e0f8679",  # Use folder ID from existing profiles
        "core_version": 135,  # Must be >= 134 based on error message
        "auto_update_core": False,  # Based on sample request
        "os_type": "windows",
        "times": 1,
        "notes": "Test profile for API connection verification",
        "parameters": {
            "flags": {
                "audio_masking": "mask",
                "fonts_masking": "custom",
                "geolocation_masking": "custom",
                "geolocation_popup": "prompt",
                "graphics_masking": "custom",
                "graphics_noise": "mask",
                "localization_masking": "custom",
                "media_devices_masking": "custom",
                "navigator_masking": "custom",
                "ports_masking": "mask",
                "proxy_masking": "custom",
                "quic_mode": "natural",
                "screen_masking": "custom",
                "timezone_masking": "custom",
                "webrtc_masking": "custom",
                "canvas_noise": "mask",
                "startup_behavior": "custom"
            },
            "storage": {
                "is_local": False,
                "save_service_worker": False
            },
            "fingerprint": {
                "navigator": {
                    "hardware_concurrency": 8,
                    "platform": "Win32",
                    "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                    "os_cpu": ""
                },
                "localization": {
                    "languages": "en-US",
                    "locale": "en-US",
                    "accept_languages": "en-US,en;q=0.5"
                },
                "timezone": {
                    "zone": "America/New_York"
                },
                "graphic": {
                    "renderer": "ANGLE (Intel, Intel(R) UHD Graphics 620 Direct3D11 vs_5_0 ps_5_0, D3D11)",
                    "vendor": "Intel Inc."
                },
                "webrtc": {
                    "public_ip": "192.168.1.1"
                },
                "media_devices": {
                    "audio_inputs": 1,
                    "audio_outputs": 1,
                    "video_inputs": 1
                },
                "screen": {
                    "height": 1200,
                    "pixel_ratio": 1,
                    "width": 1920
                },
                "geolocation": {
                    "accuracy": 100,
                    "altitude": 0,
                    "latitude": 40.7128,
                    "longitude": -74.0060
                },
                "ports": [80, 443, 8080],
                "fonts": ["Arial", "Calibri", "Times New Roman"],
                "cmd_params": {
                    "params": [
                        {
                            "flag": "show-fps-counter",
                            "value": "true"
                        }
                    ]
                }
            },
            "proxy": {
                "type": "none",
                "host": "127.0.0.1",
                "port": 8080,
                "username": "",
                "password": "",
                "save_traffic": False
            },
            "custom_start_urls": [
                "https://www.google.com"
            ]
        }
    }
    
    try:
        response = requests.post(
            f"{base_url}/profile/create",  # ✅ Correct endpoint from Postman collection
            headers=headers,
            json=test_profile,
            timeout=30
        )
        
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.text[:300]}...")
        
        if response.status_code == 201:  # Profile creation returns 201
            profile_data = response.json()
            print(f"✅ SUCCESS: Test profile created!")
            print(f"✅ Profile data: {profile_data}")
            
            # Get profile ID for cleanup
            if "data" in profile_data and "ids" in profile_data["data"]:
                profile_ids = profile_data["data"]["ids"]
                if profile_ids:
                    profile_id = profile_ids[0]
                    print(f"✅ Profile ID: {profile_id}")
                    
                    # Clean up: Delete test profile
                    delete_payload = {
                        "profile_ids": [profile_id]
                    }
                    
                    delete_response = requests.post(
                        f"{base_url}/profile/remove",  # ✅ Correct delete endpoint
                        headers=headers,
                        json=delete_payload,
                        timeout=30
                    )
                    
                    if delete_response.status_code == 200:
                        print("✅ SUCCESS: Test profile cleaned up")
                    else:
                        print(f"⚠️ WARNING: Could not delete test profile: {delete_response.text}")
            
            return True
        else:
            print(f"❌ ERROR: HTTP {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False

def main():
    """Main test function"""
    print("🚀 Multilogin X API Connection Test v2")
    print("=" * 60)
    print("✅ Based on comprehensive Postman collection analysis")
    print("✅ Using correct endpoints and payload structures")
    print("✅ Profile Management: api.multilogin.com")
    print("✅ Launcher: launcher.mlx.yt:45001")
    print("=" * 60)
    
    # Load config
    config = load_config()
    if not config:
        sys.exit(1)
    
    # Test profile search (getting profiles)
    search_result, token = test_profile_search(config)
    if not search_result:
        print("\n❌ PROFILE SEARCH TEST FAILED")
        print("📝 Please fix the issues above before proceeding")
        sys.exit(1)
    
    # Test profile creation
    creation_ok = test_profile_creation(config, token)
    
    # Summary
    print("\n" + "=" * 60)
    if search_result and creation_ok:
        print("✅ ALL TESTS PASSED!")
        print("🎉 Multilogin X API connection is working correctly")
        print("🚀 Profile search and creation endpoints verified")
        print("✅ Ready to implement full bot functionality!")
    else:
        print("❌ SOME TESTS FAILED")
        print("📝 Please fix the issues before running the main bot")
    
    print("=" * 60)

if __name__ == "__main__":
    main()
