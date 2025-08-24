#!/usr/bin/env python3
"""
Multilogin Proxy Flow Test Script
==================================

This script demonstrates the complete flow for updating profiles
with Multilogin's built-in proxy system using the correct endpoints:
1. Profile Setup: https://api.multilogin.com/proxynm/profile_setup
2. Connection URL: https://api.multilogin.com/proxynm/connection_url  
3. Proxy Validation: https://launcher.mlx.yt:45001/api/v1/proxy/validate
4. Profile Update: https://api.multilogin.com/profile/partial_update
"""

import sys
import os
import time
import logging
import json
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
            logging.FileHandler('../logs/multilogin_proxy_flow_test.log'),
            logging.StreamHandler()
        ]
    )
    return logging.getLogger(__name__)

def main():
    """Main test function"""
    print("🚀 MULTILOGIN PROXY FLOW TEST")
    print("=" * 50)

    try:
        # Setup logging
        logger = setup_logging()

        # Initialize API
        print("🔐 Initializing Multilogin X API...")
        api = MultiloginXAPI("../config/config.yaml")

        # Authenticate
        print("🔐 Authenticating...")
        if not api.authenticate():
            print("❌ Authentication failed")
            return

        # Test profile ID (change this to an existing profile)
        test_profile_id = "2ebdd8cb-0ba2-418d-90e1-02efe5ef92f6"  # Change this to your profile ID

        print(f"🎯 Testing complete Multilogin proxy flow for profile: {test_profile_id}")

        # Test 1: Individual Flow Steps
        print("\n📋 Test 1: Individual Flow Steps...")

        # Step 1: Profile Setup
        print("\n   🔄 Step 1: Profile Setup...")
        setup_result = api.setup_multilogin_proxy_profile(
            country="us",
            region="california",
            session_type="sticky",
            protocol="socks5"
        )
        
        if setup_result:
            print("   ✅ Profile setup successful")
            print(f"   📊 Setup response: {json.dumps(setup_result, indent=2)}")
        else:
            print("   ❌ Profile setup failed")

        time.sleep(2)

        # Step 2: Get Connection URL
        print("\n   🔄 Step 2: Get Connection URL...")
        connection_result = api.get_multilogin_proxy_connection(
            country="us",
            region="california",
            city="",
            session_type="sticky",
            protocol="socks5",
            ip_ttl=0
        )
        
        if connection_result:
            print("   ✅ Connection URL successful")
            print(f"   📊 Connection response: {json.dumps(connection_result, indent=2)}")
            
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
                    
                    # Try to get IP information using httpbin (always using SOCKS5)
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
            print("   ❌ Connection URL failed")

        time.sleep(2)

        # Step 3: Proxy Validation
        print("\n   🔄 Step 3: Proxy Validation...")
        if connection_result and 'data' in connection_result:
            proxy_data = connection_result['data']
            proxy_config = {
                "type": "socks5",  # Always use SOCKS5
                "host": proxy_data.get('host', 'gate.multilogin.com'),
                "port": proxy_data.get('port', 1080),
                "username": proxy_data.get('username', ''),
                "password": proxy_data.get('password', '')
            }
            
            validation_result = api.validate_proxy(proxy_config)
            if validation_result:
                print("   ✅ Proxy validation successful")
            else:
                print("   ❌ Proxy validation failed")
        else:
            print("   ⚠️  Skipping validation - no connection data")

        time.sleep(2)

        # Test 2: Complete Flow
        print("\n📋 Test 2: Complete Multilogin Proxy Flow...")
        complete_result = api.update_profile_with_multilogin_proxy(
            profile_id=test_profile_id,
            country="us",
            region="california",
            protocol="socks5"
        )
        
        if complete_result:
            print("✅ Complete proxy flow successful!")
        else:
            print("❌ Complete proxy flow failed")

        time.sleep(2)

        # Test 3: Different Countries/Regions
        print("\n📋 Test 3: Testing Different Countries/Regions...")
        
        test_configs = [
            {"country": "us", "region": "california", "protocol": "socks5"},
            {"country": "ca", "region": "ontario", "protocol": "socks5"},
            {"country": "uk", "region": "england", "protocol": "socks5"},
            {"country": "au", "region": "new_south_wales", "protocol": "socks5"}
        ]
        
        for i, config in enumerate(test_configs, 1):
            print(f"\n   🔄 Test 3.{i}: {config['country']}/{config['region']} ({config['protocol']})...")
            
            # Test connection only (not updating profile)
            connection_result = api.get_multilogin_proxy_connection(
                country=config['country'],
                region=config['region'],
                session_type="sticky",
                protocol=config['protocol']
            )
            
            if connection_result:
                print(f"   ✅ {config['country']}/{config['region']} connection successful")
                
                # Extract and display proxy IP information
                connection_urls = connection_result.get('data', {}).get('connection_urls', [])
                if connection_urls:
                    connection_url = connection_urls[0]
                    parts = connection_url.split(':')
                    
                    if len(parts) >= 4:
                        host = parts[0]
                        port = 1080  # Always use SOCKS5 port
                        username = parts[2]
                        password = parts[3]
                        
                        print(f"      🌐 Proxy: {host}:{port}")
                        print(f"      👤 User: {username}")
                        
                        # Try to get IP information (always using SOCKS5)
                        try:
                            import requests
                            proxy_url = f"socks5://{username}:{password}@{host}:{port}"
                            proxies = {
                                'http': proxy_url,
                                'https': proxy_url
                            }
                            
                            response = requests.get(
                                'http://httpbin.org/ip',
                                proxies=proxies,
                                timeout=8
                            )
                            
                            if response.status_code == 200:
                                ip_info = response.json()
                                print(f"      🌍 IP: {ip_info.get('origin', 'Unknown')}")
                            else:
                                print(f"      ❌ IP check failed")
                                
                        except Exception as e:
                            print(f"      ⚠️  IP check error: {str(e)[:30]}...")
            else:
                print(f"   ❌ {config['country']}/{config['region']} connection failed")
            
            time.sleep(1)

        # Summary
        print("\n📊 MULTILOGIN PROXY FLOW TEST SUMMARY")
        print("=" * 50)
        print(f"🎯 Test profile ID: {test_profile_id}")
        print(f"🔧 API endpoints used:")
        print(f"   - Profile Setup: {api.base_url}/proxynm/profile_setup")
        print(f"   - Connection URL: {api.base_url}/proxynm/connection_url")
        print(f"   - Proxy Validation: {api.launcher_url}/proxy/validate")
        print(f"   - Profile Update: {api.base_url}/profile/partial_update")
        print("✅ All Multilogin proxy flow tests completed!")

        print("\n💡 Usage Examples:")
        print("""
        # Complete flow for updating profile with Multilogin proxy
        success = api.update_profile_with_multilogin_proxy(
            profile_id="your-profile-id",
            country="us",
            region="california", 
            protocol="socks5"
        )

        # Individual steps
        setup_result = api.setup_multilogin_proxy_profile("us", "california")
        connection_result = api.get_multilogin_proxy_connection("us", "california")
        validation_result = api.validate_proxy(proxy_config)
        update_result = api.update_profile_proxy(profile_id, proxy_config)
        """)

        print("\n🚀 Multilogin Proxy Flow Features:")
        print("✅ Complete flow: Setup → Connection → Validation → Update")
        print("✅ Supports multiple countries and regions")
        print("✅ Supports SOCKS5, HTTP, HTTPS protocols")
        print("✅ Automatic session ID generation")
        print("✅ Comprehensive error handling and logging")
        print("✅ Safe validation before profile update")

    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        print(traceback.format_exc())

if __name__ == "__main__":
    main()
