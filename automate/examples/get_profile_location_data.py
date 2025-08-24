#!/usr/bin/env python3
"""
Get Profile Location Data
=========================
Script to retrieve location data (country, region, city) from existing Multilogin profiles
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
            logging.FileHandler('../logs/get_profile_location_data.log'),
            logging.StreamHandler()
        ]
    )
    return logging.getLogger(__name__)

def get_all_profiles_with_location_data(api):
    """Get all profiles and their location data"""
    
    print("🔍 Getting all profiles with location data...")
    
    try:
        # Get all profiles
        profiles = api.get_profiles()
        
        if not profiles:
            print("❌ No profiles found")
            return []
        
        print(f"✅ Found {len(profiles)} profiles")
        
        profiles_with_location = []
        
        for profile in profiles:
            profile_id = profile.get('uuid')
            profile_name = profile.get('name', 'Unknown')
            
            print(f"\n📋 Profile: {profile_name} (ID: {profile_id})")
            
            # Get detailed profile info
            profile_details = api.get_profile(profile_id)
            
            if profile_details:
                # Extract location data
                location_data = {
                    'country': profile_details.get('country', 'Unknown'),
                    'region': profile_details.get('region', 'Unknown'),
                    'city': profile_details.get('city', 'Unknown'),
                    'timezone': profile_details.get('timezone', 'Unknown'),
                    'language': profile_details.get('language', 'Unknown')
                }
                
                print(f"   🌍 Location Data:")
                print(f"      Country: {location_data['country']}")
                print(f"      Region: {location_data['region']}")
                print(f"      City: {location_data['city']}")
                print(f"      Timezone: {location_data['timezone']}")
                print(f"      Language: {location_data['language']}")
                
                profiles_with_location.append({
                    'profile_id': profile_id,
                    'profile_name': profile_name,
                    'location_data': location_data
                })
            else:
                print(f"   ❌ Could not get profile details")
        
        return profiles_with_location
        
    except Exception as e:
        print(f"❌ Error getting profiles: {e}")
        return []

def get_specific_profile_location(api, profile_id):
    """Get location data for a specific profile"""
    
    print(f"🔍 Getting location data for profile: {profile_id}")
    
    try:
        profile_details = api.get_profile(profile_id)
        
        if not profile_details:
            print(f"❌ Profile not found: {profile_id}")
            return None
        
        profile_name = profile_details.get('name', 'Unknown')
        
        # Extract location data
        location_data = {
            'country': profile_details.get('country', 'Unknown'),
            'region': profile_details.get('region', 'Unknown'),
            'city': profile_details.get('city', 'Unknown'),
            'timezone': profile_details.get('timezone', 'Unknown'),
            'language': profile_details.get('language', 'Unknown')
        }
        
        print(f"📋 Profile: {profile_name}")
        print(f"   🌍 Location Configuration:")
        print(f"      Country: {location_data['country']}")
        print(f"      Region: {location_data['region']}")
        print(f"      City: {location_data['city']}")
        print(f"      Timezone: {location_data['timezone']}")
        print(f"      Language: {location_data['language']}")
        
        return location_data
            
    except Exception as e:
        print(f"❌ Error getting profile location: {e}")
        return None

def use_profile_location_for_proxy(api, profile_id):
    """Use profile location data to get proxy connection"""
    
    print(f"🌐 Using profile location for proxy connection: {profile_id}")
    
    try:
        # Get profile location data
        location_data = get_specific_profile_location(api, profile_id)
        
        if not location_data:
            print("❌ No location data to use")
            return False
        
        country = location_data.get('country', '').lower()
        region = location_data.get('region', '').lower()
        city = location_data.get('city', '').lower()
        
        print(f"\n🔗 Getting proxy connection using profile location...")
        print(f"   Country: {country}")
        print(f"   Region: {region}")
        print(f"   City: {city}")
        
        # Get proxy connection using profile location
        connection_result = api.get_multilogin_proxy_connection(
            country=country,
            region=region,
            city=city,
            session_type="sticky",
            protocol="socks5"
        )
        
        if connection_result and connection_result.get('status', {}).get('http_code') == 200:
            print(f"   ✅ Proxy connection successful!")
            
            # Extract and display proxy information
            connection_urls = connection_result.get('data', {}).get('connection_urls', [])
            if connection_urls:
                connection_url = connection_urls[0]
                parts = connection_url.split(':')
                
                if len(parts) >= 4:
                    host = parts[0]
                    port = 1080  # Always use SOCKS5 port
                    username = parts[2]
                    password = parts[3]
                    
                    print(f"   🌐 Proxy Details:")
                    print(f"      Host: {host}")
                    print(f"      Port: {port}")
                    print(f"      Username: {username}")
                    print(f"      Password: {password[:8]}...")
                    
                    # Try to get IP information
                    try:
                        import requests
                        proxy_url = f"socks5://{username}:{password}@{host}:{port}"
                        proxies = {
                            'http': proxy_url,
                            'https': proxy_url
                        }
                        
                        print(f"   🔍 Checking IP with httpbin.org...")
                        response = requests.get(
                            'http://httpbin.org/ip',
                            proxies=proxies,
                            timeout=10
                        )
                        
                        if response.status_code == 200:
                            ip_info = response.json()
                            print(f"   🌍 Current IP: {ip_info.get('origin', 'Unknown')}")
                        else:
                            print(f"   ❌ Failed to get IP (Status: {response.status_code})")
                            
                    except Exception as e:
                        print(f"   ⚠️  Could not verify IP: {str(e)[:50]}...")
                else:
                    print(f"   ❌ Invalid connection URL format: {connection_url}")
            else:
                print(f"   ❌ No connection URLs available")
            
            return True
        else:
            print(f"   ❌ Proxy connection failed")
            return False
            
    except Exception as e:
        print(f"❌ Error using profile location for proxy: {e}")
        return False

def main():
    """Main function"""
    print("🚀 GET PROFILE LOCATION DATA")
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

        print("\n📋 Option 1: Get all profiles with location data")
        print("📋 Option 2: Get specific profile location data")
        print("📋 Option 3: Use profile location for proxy connection")
        
        # For demonstration, let's do all three
        print("\n" + "="*50)
        print("1️⃣ GETTING ALL PROFILES WITH LOCATION DATA")
        print("="*50)
        
        profiles_with_location = get_all_profiles_with_location_data(api)
        
        if profiles_with_location:
            print(f"\n✅ Found {len(profiles_with_location)} profiles with location data")
            
            # Save to file for reference
            with open('../data/profiles_with_location.json', 'w') as f:
                json.dump(profiles_with_location, f, indent=2)
            print(f"💾 Saved to: data/profiles_with_location.json")
            
            # Use first profile for testing
            if profiles_with_location:
                first_profile = profiles_with_location[0]
                profile_id = first_profile['profile_id']
                
                print(f"\n" + "="*50)
                print(f"2️⃣ GETTING SPECIFIC PROFILE LOCATION DATA")
                print("="*50)
                get_specific_profile_location(api, profile_id)
                
                print(f"\n" + "="*50)
                print(f"3️⃣ USING PROFILE LOCATION FOR PROXY")
                print("="*50)
                use_profile_location_for_proxy(api, profile_id)
        else:
            print("❌ No profiles with location data found")
            
            # Create a new profile first to get a valid profile ID
            print(f"\n🔧 Creating a new profile to get valid profile ID...")
            
            try:
                # Get default folder
                folders = api.get_folders()
                folder_id = "default"
                if folders:
                    folder_id = folders[0].get('uuid', 'default')
                
                # Create a new profile
                profile_data = {
                    "name": "Test Profile for Location Data",
                    "notes": "Profile created to test location data extraction",
                    "tags": ["test", "location"],
                    "platform": "windows",
                    "browser": "chrome",
                    "os": "win",
                    "navigator": {
                        "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                        "resolution": "1920x1080",
                        "language": ["en-US", "en"],
                        "platform": "Win32"
                    },
                    "geo": {
                        "mode": "auto",
                        "fillBasedOnIp": True,
                        "latitude": 34.0522,
                        "longitude": -118.2437,
                        "accuracy": 100
                    },
                    "timezone": {
                        "id": "America/Los_Angeles",
                        "fillBasedOnIp": True
                    },
                    "proxy": {
                        "mode": "none"
                    },
                    "webRTC": {
                        "mode": "altered",
                        "ipAddress": ""
                    },
                    "canvas": {
                        "mode": "noise"
                    },
                    "webGL": {
                        "mode": "noise"
                    },
                    "clientRects": {
                        "mode": "noise"
                    },
                    "audioContext": {
                        "mode": "noise"
                    },
                    "mediaDevices": {
                        "mode": "noise"
                    },
                    "webGLMetadata": {
                        "mode": "noise"
                    },
                    "webGLParams": {
                        "mode": "noise"
                    },
                    "plugins": {
                        "mode": "noise"
                    },
                    "fonts": {
                        "families": ["Arial", "Calibri", "Times New Roman"]
                    },
                    "screen": {
                        "mode": "real"
                    },
                    "devicePixelRatio": {
                        "mode": "real"
                    },
                    "cpu": {
                        "architecture": "amd64"
                    },
                    "memory": {
                        "mode": "real"
                    }
                }
                
                created_profile = api.create_profile(profile_data, folder_id)
                
                if created_profile:
                    profile_id = created_profile.get('uuid')
                    print(f"✅ Created new profile with ID: {profile_id}")
                    
                    print(f"\n" + "="*50)
                    print(f"2️⃣ GETTING SPECIFIC PROFILE LOCATION DATA")
                    print("="*50)
                    get_specific_profile_location(api, profile_id)
                    
                    print(f"\n" + "="*50)
                    print(f"3️⃣ USING PROFILE LOCATION FOR PROXY")
                    print("="*50)
                    use_profile_location_for_proxy(api, profile_id)
                else:
                    print("❌ Failed to create profile")
                    
            except Exception as e:
                print(f"❌ Error creating profile: {e}")
                
                # Fallback: Use example location data
                print(f"\n🔍 Using example location data for demonstration...")
                
                example_location = {
                    'country': 'us',
                    'region': 'california', 
                    'city': 'los_angeles',
                    'timezone': 'America/Los_Angeles',
                    'language': 'en-US'
                }
                
                print(f"📋 Example Location Data:")
                print(f"   Country: {example_location['country']}")
                print(f"   Region: {example_location['region']}")
                print(f"   City: {example_location['city']}")
                print(f"   Timezone: {example_location['timezone']}")
                
                print(f"\n" + "="*50)
                print(f"3️⃣ USING EXAMPLE LOCATION FOR PROXY")
                print("="*50)
                
                # Use example location for proxy connection
                connection_result = api.get_multilogin_proxy_connection(
                    country=example_location['country'],
                    region=example_location['region'],
                    city=example_location['city'],
                    session_type="sticky",
                    protocol="socks5"
                )
                
                if connection_result and connection_result.get('status', {}).get('http_code') == 200:
                    print(f"✅ Proxy connection successful using example location!")
                    
                    # Extract and display proxy information
                    connection_urls = connection_result.get('data', {}).get('connection_urls', [])
                    if connection_urls:
                        connection_url = connection_urls[0]
                        parts = connection_url.split(':')
                        
                        if len(parts) >= 4:
                            host = parts[0]
                            port = 1080
                            username = parts[2]
                            password = parts[3]
                            
                            print(f"🌐 Proxy Details:")
                            print(f"   Host: {host}")
                            print(f"   Port: {port}")
                            print(f"   Username: {username}")
                            print(f"   Password: {password[:8]}...")
                            
                            # Try to get IP information
                            try:
                                import requests
                                proxy_url = f"socks5://{username}:{password}@{host}:{port}"
                                proxies = {
                                    'http': proxy_url,
                                    'https': proxy_url
                                }
                                
                                print(f"🔍 Checking IP with httpbin.org...")
                                response = requests.get(
                                    'http://httpbin.org/ip',
                                    proxies=proxies,
                                    timeout=10
                                )
                                
                                if response.status_code == 200:
                                    ip_info = response.json()
                                    print(f"🌍 Current IP: {ip_info.get('origin', 'Unknown')}")
                                else:
                                    print(f"❌ Failed to get IP (Status: {response.status_code})")
                                    
                            except Exception as e:
                                print(f"⚠️  Could not verify IP: {str(e)[:50]}...")
                else:
                    print(f"❌ Proxy connection failed with example location")

        print("\n📊 SUMMARY")
        print("=" * 50)
        print("💡 To get location data from profiles:")
        print("   1. Use api.get_profiles() to get all profiles")
        print("   2. Use api.get_profile(profile_id) to get specific profile")
        print("   3. Extract location data from profile['country'], profile['region'], profile['city']")
        print("   4. Use the location data for proxy connection")
        
        print("\n💡 Example usage:")
        print("""
        # Get all profiles
        profiles = api.get_profiles()
        
        # Get specific profile
        profile = api.get_profile("your-profile-id")
        
        # Extract location data
        country = profile.get('country', 'us')
        region = profile.get('region', 'california')
        city = profile.get('city', '')
        
        # Use for proxy connection
        connection_result = api.get_multilogin_proxy_connection(
            country=country,
            region=region,
            city=city,
            protocol="socks5"
        )
        """)

    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        print(traceback.format_exc())

if __name__ == "__main__":
    main()
