#!/usr/bin/env python3
"""
Multilogin X API Connection Test Script
Tests connection to Multilogin X using automatic sign-in with credentials
Based on official documentation: https://multilogin.com/help/en_US/custom-api-scripts-with-python/log-in-automatically
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

def test_multilogin_connection(config: Dict) -> bool:
    """Test connection to Multilogin X using automatic sign-in"""
    print("🔍 Testing Multilogin X Connection with Automatic Sign-in...")
    print("=" * 50)
    
    # Get Multilogin config
    ml_config = config.get("multilogin", {})
    username = ml_config.get("username")
    password = ml_config.get("password")
    base_url = ml_config.get("base_url", "https://api.multilogin.com")
    launcher_url = ml_config.get("launcher_url", "https://launcher.mlx.yt:45001/api/v1")
    
    # Validate credentials
    if not username or username == "YOUR_MULTILOGIN_X_EMAIL":
        print("❌ ERROR: Username not configured!")
        print("📝 Please update config/config.yaml with your Multilogin X email")
        return False
    
    if not password or password == "YOUR_MULTILOGIN_X_PASSWORD":
        print("❌ ERROR: Password not configured!")
        print("📝 Please update config/config.yaml with your Multilogin X password")
        return False
    
    print(f"✅ Username: {username}")
    print(f"✅ Base URL: {base_url}")
    print(f"✅ Launcher URL: {launcher_url}")
    print("✅ Using automatic sign-in (no API key needed)")
    
    # Sign in to get token
    print("\n🔍 Step 1: Signing in to Multilogin X...")
    token = sign_in_to_multilogin_x(username, password, base_url)
    
    if not token:
        print("❌ ERROR: Failed to sign in to Multilogin X")
        return False
    
    print(f"✅ SUCCESS: Signed in to Multilogin X")
    print(f"✅ Token: {token[:20]}...")
    
    # Setup headers with bearer token
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }
    
    # Test 2: Get all profiles - Debug multiple endpoints
    print("\n🔍 Step 2: Getting all profiles...")
    print(f"🔍 Debug - Token being used: {token[:50]}...")
    print(f"🔍 Debug - Headers: {headers}")
    
    try:
        # ✅ TRY ENDPOINTS BASED ON OFFICIAL POSTMAN DOCUMENTATION
        # Reference: https://documenter.getpostman.com/view/28533318/2s946h9Cv9#30a01926-ed46-4db4-8e60-87b7e13786d3
        endpoints_to_try = [
            # Based on official curl example provided
            f"{base_url}/profile",  # For getting profiles
            f"{base_url}/profile/create",  # For creating profiles
            # Alternative structures
            f"{base_url}/profiles",
            f"{base_url}/api/profile",
            f"{base_url}/api/profiles"
        ]
        
        for endpoint in endpoints_to_try:
            print(f"\n🔍 Trying: {endpoint}")
            try:
                response = requests.get(endpoint, headers=headers, timeout=30)
                print(f"   Status: {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                
                if response.status_code == 200:
                    profiles = response.json()
                    print(f"✅ SUCCESS: Found working endpoint: {endpoint}")
                    print(f"✅ Found profiles: {profiles}")
                    return True
                elif response.status_code == 401:
                    print(f"   ⚠️ Unauthorized - check token")
                elif response.status_code == 403:
                    print(f"   ⚠️ Forbidden - check permissions")
                elif response.status_code == 404:
                    print(f"   ⚠️ Not found - endpoint doesn't exist")
                else:
                    print(f"   ⚠️ HTTP {response.status_code}")
                    
            except Exception as e:
                print(f"   Error: {str(e)}")
        
        # Try with launcher URL structure
        print(f"\n🔍 Trying launcher URL structure...")
        launcher_endpoints = [
            f"{launcher_url}/profile",
            f"{launcher_url}/profiles",
            f"{launcher_url}/browser/profile",
            f"{launcher_url}/browser/profiles"
        ]
        
        for endpoint in launcher_endpoints:
            print(f"\n🔍 Trying: {endpoint}")
            try:
                response = requests.get(endpoint, headers=headers, timeout=30)
                print(f"   Status: {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                
                if response.status_code == 200:
                    profiles = response.json()
                    print(f"✅ SUCCESS: Found working endpoint: {endpoint}")
                    print(f"✅ Found profiles: {profiles}")
                    return True
                    
            except Exception as e:
                print(f"   Error: {str(e)}")
        
        # Try with different base URLs and structures
        print(f"\n🔍 Trying different base URLs and API structures...")
        
        # Try different possible base URLs
        possible_base_urls = [
            base_url,
            "https://api.multilogin.com/api",
            "https://api.multilogin.com/api/v1",
            "https://api.multilogin.com/api/v2",
            launcher_url
        ]
        
        # Try different endpoint patterns
        endpoint_patterns = [
            "/profile",
            "/profiles", 
            "/profile/create",
            "/browser/profile",
            "/browser/profiles"
        ]
        
        correct_headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "X-Strict-Mode": "true",
            "Authorization": f"Bearer {token}"
        }
        
        for base in possible_base_urls:
            for pattern in endpoint_patterns:
                endpoint = f"{base}{pattern}"
                print(f"\n🔍 Trying: {endpoint}")
                try:
                    response = requests.get(endpoint, headers=correct_headers, timeout=30)
                    print(f"   Status: {response.status_code}")
                    print(f"   Response: {response.text[:200]}...")
                    
                    if response.status_code == 200:
                        profiles = response.json()
                        print(f"✅ SUCCESS: Found working endpoint: {endpoint}")
                        print(f"✅ Found profiles: {profiles}")
                        return True
                    elif response.status_code == 401:
                        print(f"   ⚠️ Unauthorized - check token")
                    elif response.status_code == 403:
                        print(f"   ⚠️ Forbidden - check permissions")
                    elif response.status_code == 404:
                        print(f"   ⚠️ Not found - endpoint doesn't exist")
                    else:
                        print(f"   ⚠️ HTTP {response.status_code}")
                        
                except Exception as e:
                    print(f"   Error: {str(e)}")
                    continue
        
        # If no endpoints work, return detailed error
        print("❌ ERROR: No working profile endpoints found")
        print("📝 This might indicate:")
        print("   1. API version mismatch")
        print("   2. Account subscription issue")
        print("   3. Different API structure than expected")
        return False
            
    except requests.exceptions.ConnectionError:
        print("❌ ERROR: Cannot connect to Multilogin X API")
        print("📝 Please check:")
        print("   - Internet connection")
        print("   - Base URL configuration")
        print("   - Credentials validity")
        return False
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False

def test_profile_creation(config: Dict) -> bool:
    """Test profile creation functionality"""
    print("\n🔍 Test 3: Testing profile creation...")
    
    ml_config = config.get("multilogin", {})
    username = ml_config.get("username")
    password = ml_config.get("password")
    base_url = ml_config.get("base_url", "https://api.multilogin.com")
    
    # Sign in to get token
    token = sign_in_to_multilogin_x(username, password, base_url)
    if not token:
        return False
    
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }
    
    # Test profile data according to official curl example
    test_profile = {
        "name": "Test Profile - Connection Test",
        "browser_type": "chrome",
        "folder_id": None,
        "os_type": "win",
        "core_version": 1,
        "core_minor_version": 0,
        "times": 1,
        "notes": "Test profile for connection verification",
        "parameters": {
            "flags": {
                "audio_masking": "true",
                "fonts_masking": "true",
                "geolocation_masking": "true",
                "geolocation_popup": "true",
                "graphics_masking": "true",
                "graphics_noise": "true",
                "localization_masking": "true",
                "media_devices_masking": "true",
                "navigator_masking": "true",
                "ports_masking": "true",
                "proxy_masking": "true",
                "screen_masking": "true",
                "quic_mode": "true",
                "timezone_masking": "true",
                "webrtc_masking": "true",
                "canvas_noise": "true",
                "startup_behavior": "normal"
            },
            "storage": {
                "is_local": False,
                "save_service_worker": True
            },
            "fingerprint": {
                "navigator": {
                    "hardware_concurrency": 8,
                    "platform": "Win32",
                    "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                    "os_cpu": "x64"
                },
                "localization": {
                    "languages": "en-US",
                    "locale": "en-US",
                    "accept_languages": "en-US"
                },
                "timezone": {
                    "zone": "America/New_York"
                },
                "graphic": {
                    "renderer": "ANGLE (Intel, Intel(R) UHD Graphics 620 Direct3D11 vs_5_0 ps_5_0, D3D11)",
                    "vendor": "Intel Inc."
                },
                "webrtc": {
                    "public_ip": "127.0.0.1"
                },
                "media_devices": {
                    "audio_inputs": 1,
                    "audio_outputs": 1,
                    "video_inputs": 1
                },
                "screen": {
                    "height": 1080,
                    "pixel_ratio": 1.0,
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
                        {"flag": "--disable-web-security", "value": True},
                        {"flag": "--disable-features", "value": True}
                    ]
                }
            },
            "proxy": {
                "host": "127.0.0.1",
                "type": "none",
                "port": 0,
                "username": "",
                "password": "",
                "save_traffic": False
            },
            "custom_start_urls": []
        }
    }
    
    try:
        response = requests.post(
            f"{base_url}/profile/create",  # ✅ FIXED: Correct endpoint as per official curl example
            headers=headers,
            json=test_profile,
            timeout=30
        )
        
        if response.status_code == 200:
            profile = response.json()
            print(f"✅ SUCCESS: Test profile created with ID: {profile.get('uuid', 'N/A')}")
            
            # Clean up: Delete test profile
            delete_response = requests.delete(
                f"{base_url}/profile/{profile['uuid']}",  # ✅ FIXED: Correct endpoint as per official structure
                headers=headers,
                timeout=30
            )
            
            if delete_response.status_code == 200:
                print("✅ SUCCESS: Test profile cleaned up")
            else:
                print("⚠️ WARNING: Could not delete test profile")
            
            return True
        else:
            print(f"❌ ERROR: HTTP {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        return False

def main():
    """Main test function"""
    print("🚀 Multilogin X API Connection Test")
    print("=" * 50)
    print("✅ This project uses Multilogin X with automatic sign-in")
    print("✅ No API key needed - uses email/password authentication")
    print("✅ Based on official documentation")
    print("=" * 50)
    
    # Load config
    config = load_config()
    if not config:
        sys.exit(1)
    
    # Test connection
    connection_ok = test_multilogin_connection(config)
    if not connection_ok:
        print("\n❌ CONNECTION TEST FAILED")
        print("📝 Please fix the issues above before running the main bot")
        sys.exit(1)
    
    # Test profile creation
    creation_ok = test_profile_creation(config)
    
    # Summary
    print("\n" + "=" * 50)
    if connection_ok and creation_ok:
        print("✅ ALL TESTS PASSED!")
        print("🎉 Multilogin X connection is working correctly")
        print("🚀 You can now run the main bot: python src/main.py --test")
        print("✅ Automatic sign-in working - no manual API key needed!")
    else:
        print("❌ SOME TESTS FAILED")
        print("📝 Please fix the issues before running the main bot")
    
    print("=" * 50)

if __name__ == "__main__":
    main()
