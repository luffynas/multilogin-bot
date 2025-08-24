#!/usr/bin/env python3
"""
Proxy Update Test Script
========================

This script demonstrates how to update proxy configuration
for existing Multilogin X profiles using the correct API endpoints.
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
            logging.FileHandler('../logs/proxy_update_test.log'),
            logging.StreamHandler()
        ]
    )
    return logging.getLogger(__name__)

def main():
    """Main test function"""
    print("🔧 PROXY UPDATE TEST")
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

        # Test profile ID (you can change this to an existing profile)
        test_profile_id = "2ebdd8cb-0ba2-418d-90e1-02efe5ef92f6"  # Change this to your profile ID

        print(f"🎯 Testing proxy update for profile: {test_profile_id}")

        # Test 1: Update with HTTP proxy
        print("\n📋 Test 1: Updating with HTTP proxy...")
        http_proxy_config = {
            "type": "http",
            "host": "proxy.example.com",
            "port": 8080,
            "username": "testuser",
            "password": "testpass",
            "save_traffic": False
        }
        
        success = api.update_profile_proxy(test_profile_id, http_proxy_config)
        if success:
            print("✅ HTTP proxy updated successfully")
        else:
            print("❌ HTTP proxy update failed")

        time.sleep(2)

        # Test 2: Update with SOCKS5 proxy
        print("\n📋 Test 2: Updating with SOCKS5 proxy...")
        socks5_proxy_config = {
            "type": "socks5",
            "host": "socks5.example.com",
            "port": 1080,
            "username": "socksuser",
            "password": "sockspass",
            "save_traffic": True
        }
        
        success = api.update_profile_proxy(test_profile_id, socks5_proxy_config)
        if success:
            print("✅ SOCKS5 proxy updated successfully")
        else:
            print("❌ SOCKS5 proxy update failed")

        time.sleep(2)

        # Test 3: Update with HTTPS proxy
        print("\n📋 Test 3: Updating with HTTPS proxy...")
        https_proxy_config = {
            "type": "https",
            "host": "https-proxy.example.com",
            "port": 8443,
            "save_traffic": False
        }
        
        success = api.update_profile_proxy(test_profile_id, https_proxy_config)
        if success:
            print("✅ HTTPS proxy updated successfully")
        else:
            print("❌ HTTPS proxy update failed")

        time.sleep(2)

        # Test 4: Remove proxy
        print("\n📋 Test 4: Removing proxy...")
        success = api.remove_profile_proxy(test_profile_id)
        if success:
            print("✅ Proxy removed successfully")
        else:
            print("❌ Proxy removal failed")

        # Summary
        print("\n📊 PROXY UPDATE TEST SUMMARY")
        print("=" * 50)
        print(f"🎯 Test profile ID: {test_profile_id}")
        print(f"🔧 API endpoint used: {api.base_url}/profile/partial_update")
        print("✅ All proxy update tests completed!")

        print("\n💡 Usage Examples:")
        print("""
        # Update HTTP proxy
        http_proxy = {
            "type": "http",
            "host": "proxy.example.com",
            "port": 8080,
            "username": "user",
            "password": "pass"
        }
        api.update_profile_proxy(profile_id, http_proxy)

        # Update SOCKS5 proxy
        socks5_proxy = {
            "type": "socks5",
            "host": "socks.example.com",
            "port": 1080
        }
        api.update_profile_proxy(profile_id, socks5_proxy)

        # Remove proxy
        api.remove_profile_proxy(profile_id)
        """)

    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        print(traceback.format_exc())

if __name__ == "__main__":
    main()
