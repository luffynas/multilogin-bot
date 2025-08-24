#!/usr/bin/env python3
"""
Get Profile Proxy Data
======================
Script to retrieve proxy data from existing Multilogin profiles
"""

import sys
import os
import json
import time
from datetime import datetime

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from multilogin_api import MultiloginXAPI

def setup_logging():
    """Setup logging for the test"""
    log_format = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    logging.basicConfig(
        level=logging.INFO,
        format=log_format,
        handlers=[
            logging.FileHandler('../logs/get_profile_proxy_data.log'),
            logging.StreamHandler()
        ]
    )
    return logging.getLogger(__name__)

def get_all_profiles_with_proxy_data(api):
    """Get all profiles and their proxy data"""
    
    print("🔍 Getting all profiles...")
    
    try:
        # Get all profiles
        profiles = api.get_profiles()
        
        if not profiles:
            print("❌ No profiles found")
            return []
        
        print(f"✅ Found {len(profiles)} profiles")
        
        profiles_with_proxy = []
        
        for profile in profiles:
            profile_id = profile.get('uuid')
            profile_name = profile.get('name', 'Unknown')
            
            print(f"\n📋 Profile: {profile_name} (ID: {profile_id})")
            
            # Get detailed profile info
            profile_details = api.get_profile(profile_id)
            
            if profile_details:
                proxy_data = profile_details.get('proxy', {})
                
                if proxy_data:
                    print(f"   🌐 Proxy Found:")
                    print(f"      Type: {proxy_data.get('type', 'Unknown')}")
                    print(f"      Host: {proxy_data.get('host', 'Unknown')}")
                    print(f"      Port: {proxy_data.get('port', 'Unknown')}")
                    print(f"      Username: {proxy_data.get('username', 'None')}")
                    print(f"      Password: {'***' if proxy_data.get('password') else 'None'}")
                    
                    profiles_with_proxy.append({
                        'profile_id': profile_id,
                        'profile_name': profile_name,
                        'proxy_data': proxy_data
                    })
                else:
                    print(f"   ❌ No proxy configured")
            else:
                print(f"   ❌ Could not get profile details")
        
        return profiles_with_proxy
        
    except Exception as e:
        print(f"❌ Error getting profiles: {e}")
        return []

def get_specific_profile_proxy(api, profile_id):
    """Get proxy data for a specific profile"""
    
    print(f"🔍 Getting proxy data for profile: {profile_id}")
    
    try:
        profile_details = api.get_profile(profile_id)
        
        if not profile_details:
            print(f"❌ Profile not found: {profile_id}")
            return None
        
        profile_name = profile_details.get('name', 'Unknown')
        proxy_data = profile_details.get('proxy', {})
        
        print(f"📋 Profile: {profile_name}")
        
        if proxy_data:
            print(f"   🌐 Proxy Configuration:")
            print(f"      Type: {proxy_data.get('type', 'Unknown')}")
            print(f"      Host: {proxy_data.get('host', 'Unknown')}")
            print(f"      Port: {proxy_data.get('port', 'Unknown')}")
            print(f"      Username: {proxy_data.get('username', 'None')}")
            print(f"      Password: {'***' if proxy_data.get('password') else 'None'}")
            print(f"      Save Traffic: {proxy_data.get('save_traffic', False)}")
            
            return proxy_data
        else:
            print(f"   ❌ No proxy configured for this profile")
            return None
            
    except Exception as e:
        print(f"❌ Error getting profile proxy: {e}")
        return None

def test_proxy_from_profile(api, profile_id):
    """Test proxy from a specific profile"""
    
    print(f"🧪 Testing proxy from profile: {profile_id}")
    
    try:
        # Get profile proxy data
        proxy_data = get_specific_profile_proxy(api, profile_id)
        
        if not proxy_data:
            print("❌ No proxy data to test")
            return False
        
        # Test proxy connection
        print(f"\n🔍 Testing proxy connection...")
        
        try:
            import requests
            
            proxy_type = proxy_data.get('type', 'socks5')
            host = proxy_data.get('host')
            port = proxy_data.get('port')
            username = proxy_data.get('username')
            password = proxy_data.get('password')
            
            if not all([host, port]):
                print("❌ Missing host or port")
                return False
            
            # Build proxy URL
            if username and password:
                proxy_url = f"{proxy_type}://{username}:{password}@{host}:{port}"
            else:
                proxy_url = f"{proxy_type}://{host}:{port}"
            
            proxies = {
                'http': proxy_url,
                'https': proxy_url
            }
            
            print(f"   🔗 Proxy URL: {proxy_type}://{host}:{port}")
            print(f"   👤 Username: {username or 'None'}")
            
            # Test with httpbin
            response = requests.get(
                'http://httpbin.org/ip',
                proxies=proxies,
                timeout=10
            )
            
            if response.status_code == 200:
                ip_info = response.json()
                print(f"   🌍 Current IP: {ip_info.get('origin', 'Unknown')}")
                print(f"   ✅ Proxy test successful!")
                return True
            else:
                print(f"   ❌ Proxy test failed (Status: {response.status_code})")
                return False
                
        except Exception as e:
            print(f"   ❌ Proxy test error: {str(e)[:50]}...")
            return False
            
    except Exception as e:
        print(f"❌ Error testing proxy: {e}")
        return False

def main():
    """Main function"""
    print("🚀 GET PROFILE PROXY DATA")
    print("=" * 50)

    try:
        # Initialize API
        print("🔐 Initializing Multilogin X API...")
        api = MultiloginXAPI("../config/config.yaml")

        # Authenticate
        print("🔐 Authenticating...")
        if not api.authenticate():
            print("❌ Authentication failed")
            return

        print("\n📋 Option 1: Get all profiles with proxy data")
        print("📋 Option 2: Get specific profile proxy data")
        print("📋 Option 3: Test proxy from specific profile")
        
        # For demonstration, let's do all three
        print("\n" + "="*50)
        print("1️⃣ GETTING ALL PROFILES WITH PROXY DATA")
        print("="*50)
        
        profiles_with_proxy = get_all_profiles_with_proxy_data(api)
        
        if profiles_with_proxy:
            print(f"\n✅ Found {len(profiles_with_proxy)} profiles with proxy data")
            
            # Save to file for reference
            with open('../data/profiles_with_proxy.json', 'w') as f:
                json.dump(profiles_with_proxy, f, indent=2)
            print(f"💾 Saved to: data/profiles_with_proxy.json")
            
            # Use first profile for testing
            if profiles_with_proxy:
                first_profile = profiles_with_proxy[0]
                profile_id = first_profile['profile_id']
                
                print(f"\n" + "="*50)
                print(f"2️⃣ GETTING SPECIFIC PROFILE PROXY DATA")
                print("="*50)
                get_specific_profile_proxy(api, profile_id)
                
                print(f"\n" + "="*50)
                print(f"3️⃣ TESTING PROXY FROM PROFILE")
                print("="*50)
                test_proxy_from_profile(api, profile_id)
        else:
            print("❌ No profiles with proxy data found")
            
            # Try with a known profile ID
            known_profile_id = "2ebdd8cb-0ba2-418d-90e1-02efe5ef92f6"
            print(f"\n🔍 Trying with known profile ID: {known_profile_id}")
            
            print(f"\n" + "="*50)
            print(f"2️⃣ GETTING SPECIFIC PROFILE PROXY DATA")
            print("="*50)
            get_specific_profile_proxy(api, known_profile_id)
            
            print(f"\n" + "="*50)
            print(f"3️⃣ TESTING PROXY FROM PROFILE")
            print("="*50)
            test_proxy_from_profile(api, known_profile_id)

        print("\n📊 SUMMARY")
        print("=" * 50)
        print("💡 To get proxy data from profiles:")
        print("   1. Use api.get_profiles() to get all profiles")
        print("   2. Use api.get_profile(profile_id) to get specific profile")
        print("   3. Extract proxy data from profile['proxy']")
        print("   4. Use the proxy data in your automation scripts")
        
        print("\n💡 Example usage:")
        print("""
        # Get all profiles
        profiles = api.get_profiles()
        
        # Get specific profile
        profile = api.get_profile("your-profile-id")
        
        # Extract proxy data
        proxy_data = profile.get('proxy', {})
        
        # Use in automation
        if proxy_data:
            host = proxy_data.get('host')
            port = proxy_data.get('port')
            username = proxy_data.get('username')
            password = proxy_data.get('password')
            proxy_type = proxy_data.get('type', 'socks5')
        """)

    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        print(traceback.format_exc())

if __name__ == "__main__":
    main()
