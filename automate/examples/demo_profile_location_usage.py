#!/usr/bin/env python3
"""
Demo Profile Location Usage
===========================
Script to demonstrate how to use profile location data for proxy connection
"""

import sys
import os
import json
import time
from datetime import datetime

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from multilogin_api import MultiloginXAPI

def demo_profile_location_usage():
    """Demonstrate how to use profile location data for proxy connection"""
    
    print("🚀 DEMO: USING PROFILE LOCATION DATA FOR PROXY")
    print("=" * 60)
    
    # Initialize API
    print("🔐 Initializing Multilogin X API...")
    api = MultiloginXAPI("../config/config.yaml")

    # Authenticate
    print("🔐 Authenticating...")
    if not api.authenticate():
        print("❌ Authentication failed")
        return

    # Example profile location data (you would get this from actual profiles)
    example_profiles = [
        {
            "profile_id": "profile-1",
            "profile_name": "US California Profile",
            "location_data": {
                "country": "us",
                "region": "california",
                "city": "los_angeles",
                "timezone": "America/Los_Angeles",
                "language": "en-US"
            }
        },
        {
            "profile_id": "profile-2", 
            "profile_name": "UK England Profile",
            "location_data": {
                "country": "uk",
                "region": "england",
                "city": "london",
                "timezone": "Europe/London",
                "language": "en-GB"
            }
        },
        {
            "profile_id": "profile-3",
            "profile_name": "CA Ontario Profile", 
            "location_data": {
                "country": "ca",
                "region": "ontario",
                "city": "toronto",
                "timezone": "America/Toronto",
                "language": "en-CA"
            }
        }
    ]
    
    print(f"\n📋 Example Profile Location Data:")
    for i, profile in enumerate(example_profiles, 1):
        print(f"\n{i}. {profile['profile_name']}:")
        print(f"   Country: {profile['location_data']['country']}")
        print(f"   Region: {profile['location_data']['region']}")
        print(f"   City: {profile['location_data']['city']}")
        print(f"   Timezone: {profile['location_data']['timezone']}")
    
    print(f"\n" + "="*60)
    print("🌐 USING LOCATION DATA FOR PROXY CONNECTION")
    print("="*60)
    
    for i, profile in enumerate(example_profiles, 1):
        print(f"\n🔗 Test {i}: {profile['profile_name']}")
        print("-" * 40)
        
        location = profile['location_data']
        country = location['country']
        region = location['region']
        city = location['city']
        
        print(f"   🌍 Location: {country.upper()}/{region.title()}/{city.replace('_', ' ').title()}")
        
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
        else:
            print(f"   ❌ Proxy connection failed")
        
        time.sleep(2)

def show_how_to_get_real_profile_data():
    """Show how to get real profile data"""
    
    print(f"\n" + "="*60)
    print("💡 HOW TO GET REAL PROFILE LOCATION DATA")
    print("="*60)
    
    print("""
🔍 To get real profile location data:

1. Get all profiles:
   profiles = api.get_profiles()
   
2. Get specific profile details:
   profile = api.get_profile("your-profile-id")
   
3. Extract location data:
   country = profile.get('country', 'us')
   region = profile.get('region', 'california') 
   city = profile.get('city', '')
   timezone = profile.get('timezone', 'America/Los_Angeles')
   language = profile.get('language', 'en-US')
   
4. Use for proxy connection:
   connection_result = api.get_multilogin_proxy_connection(
       country=country,
       region=region,
       city=city,
       protocol="socks5"
   )
    """)

def show_integration_example():
    """Show integration example"""
    
    print(f"\n" + "="*60)
    print("🔧 INTEGRATION EXAMPLE")
    print("="*60)
    
    print("""
📝 Example: Update test_multilogin_proxy_flow.py to use profile location:

# Instead of hardcoded values:
setup_result = api.setup_multilogin_proxy_profile(
    country="us",           # ❌ Hardcoded
    region="california",    # ❌ Hardcoded
    session_type="sticky",
    protocol="socks5"
)

# Use profile location data:
profile = api.get_profile("your-profile-id")
country = profile.get('country', 'us')
region = profile.get('region', 'california')

setup_result = api.setup_multilogin_proxy_profile(
    country=country,        # ✅ From profile
    region=region,          # ✅ From profile
    session_type="sticky",
    protocol="socks5"
)
    """)

def main():
    """Main function"""
    try:
        # Demo profile location usage
        demo_profile_location_usage()
        
        # Show how to get real profile data
        show_how_to_get_real_profile_data()
        
        # Show integration example
        show_integration_example()
        
        print(f"\n" + "="*60)
        print("✅ DEMO COMPLETED!")
        print("="*60)
        print("💡 Now you know how to:")
        print("   1. Get location data from existing profiles")
        print("   2. Use that data for proxy connections")
        print("   3. Integrate it into your automation scripts")
        
    except Exception as e:
        print(f"❌ Demo failed: {e}")
        import traceback
        print(traceback.format_exc())

if __name__ == "__main__":
    main()
