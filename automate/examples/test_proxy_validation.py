#!/usr/bin/env python3
"""
Proxy Validation Test Script
============================

This script demonstrates how to validate proxy configurations
using Multilogin X API endpoint: https://launcher.mlx.yt:45001/api/v1/proxy/validate
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
            logging.FileHandler('../logs/proxy_validation_test.log'),
            logging.StreamHandler()
        ]
    )
    return logging.getLogger(__name__)

def main():
    """Main test function"""
    print("🔍 PROXY VALIDATION TEST")
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

        print("🎯 Testing proxy validation with different configurations...")

        # Test 1: HTTP Proxy with authentication
        print("\n📋 Test 1: Validating HTTP proxy with authentication...")
        http_proxy_config = {
            "type": "http",
            "host": "proxy.example.com",
            "port": 8080,
            "username": "testuser",
            "password": "testpass"
        }
        
        success = api.validate_proxy(http_proxy_config)
        if success:
            print("✅ HTTP proxy validation successful")
        else:
            print("❌ HTTP proxy validation failed")

        time.sleep(2)

        # Test 2: SOCKS5 Proxy without authentication
        print("\n📋 Test 2: Validating SOCKS5 proxy without authentication...")
        socks5_proxy_config = {
            "type": "socks5",
            "host": "socks5.example.com",
            "port": 1080
        }
        
        success = api.validate_proxy(socks5_proxy_config)
        if success:
            print("✅ SOCKS5 proxy validation successful")
        else:
            print("❌ SOCKS5 proxy validation failed")

        time.sleep(2)

        # Test 3: HTTPS Proxy
        print("\n📋 Test 3: Validating HTTPS proxy...")
        https_proxy_config = {
            "type": "https",
            "host": "https-proxy.example.com",
            "port": 8443,
            "username": "httpsuser",
            "password": "httpspass"
        }
        
        success = api.validate_proxy(https_proxy_config)
        if success:
            print("✅ HTTPS proxy validation successful")
        else:
            print("❌ HTTPS proxy validation failed")

        time.sleep(2)

        # Test 4: Invalid proxy (should fail)
        print("\n📋 Test 4: Validating invalid proxy (should fail)...")
        invalid_proxy_config = {
            "type": "http",
            "host": "invalid.proxy.com",
            "port": 9999,
            "username": "invalid",
            "password": "invalid"
        }
        
        success = api.validate_proxy(invalid_proxy_config)
        if success:
            print("⚠️  Invalid proxy validation unexpectedly successful")
        else:
            print("✅ Invalid proxy correctly failed validation")

        # Summary
        print("\n📊 PROXY VALIDATION TEST SUMMARY")
        print("=" * 50)
        print(f"🔧 API endpoint used: {api.launcher_url}/proxy/validate")
        print("✅ All proxy validation tests completed!")

        print("\n💡 Usage Examples:")
        print("""
        # Validate HTTP proxy
        http_proxy = {
            "type": "http",
            "host": "proxy.example.com",
            "port": 8080,
            "username": "user",
            "password": "pass"
        }
        api.validate_proxy(http_proxy)

        # Validate SOCKS5 proxy
        socks5_proxy = {
            "type": "socks5",
            "host": "socks.example.com",
            "port": 1080
        }
        api.validate_proxy(socks5_proxy)

        # Validate HTTPS proxy
        https_proxy = {
            "type": "https",
            "host": "https-proxy.example.com",
            "port": 8443
        }
        api.validate_proxy(https_proxy)
        """)

        print("\n🔍 Proxy Validation Features:")
        print("✅ Supports HTTP, HTTPS, SOCKS4, SOCKS5 protocols")
        print("✅ Optional username/password authentication")
        print("✅ 30-second timeout for validation")
        print("✅ Detailed error logging")
        print("✅ Safe operation (only validates, doesn't modify)")

    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        print(traceback.format_exc())

if __name__ == "__main__":
    main()
