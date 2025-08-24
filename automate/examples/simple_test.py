#!/usr/bin/env python3
"""
Simple Test - Only Authentication and Existing Profiles
Test basic connectivity without creating new profiles
"""

import sys
import os
import logging

# Add src directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from multilogin_api import MultiloginXAPI

def setup_logging():
    """Setup basic logging"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s'
    )

def simple_test():
    """Simple test without profile creation"""
    logger = logging.getLogger(__name__)
    
    print("🔍 Simple Multilogin Test")
    print("=" * 40)
    
    try:
        # Test 1: Initialize API
        logger.info("🔧 Initializing Multilogin API...")
        multilogin_api = MultiloginXAPI("../config/config.yaml")
        print("✅ API initialized successfully")
        
        # Test 2: Authentication
        logger.info("🔐 Testing authentication...")
        if multilogin_api.authenticate():
            print("✅ Authentication successful!")
            print(f"   Bearer token: {multilogin_api.bearer_token[:20]}...")
        else:
            print("❌ Authentication failed!")
            print("   Please check your credentials in config/config.yaml")
            return False
        
        # Test 3: Get existing profiles from API
        logger.info("📋 Testing profile retrieval from API...")
        profiles = multilogin_api.get_profiles()
        
        if profiles:
            print(f"✅ Found {len(profiles)} existing profiles via API:")
            for profile in profiles[:3]:  # Show first 3
                profile_id = profile.get('profile_id', 'N/A')
                name = profile.get('name', 'N/A')
                print(f"   - {name} (ID: {profile_id})")
        else:
            print("📝 No existing profiles found via API")
        
        # Test 4: Test token refresh
        logger.info("🔄 Testing token refresh...")
        if multilogin_api.refresh_auth_token():
            print("✅ Token refresh successful!")
        else:
            print("⚠️ Token refresh failed")
        
        print("\n🎉 Simple test completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Simple test failed: {e}")
        logger.error(f"Error during simple test: {e}")
        return False

def main():
    """Main function"""
    setup_logging()
    
    success = simple_test()
    
    if success:
        print("\n✅ Simple test completed successfully!")
        print("🚀 Authentication and API connectivity working!")
    else:
        print("\n❌ Simple test failed!")
        print("🔧 Please check your configuration and try again")
    
    print("\n📖 Next steps:")
    print("1. Check your Multilogin credentials")
    print("2. Ensure Multilogin is running")
    print("3. Try creating profiles manually in Multilogin first")

if __name__ == "__main__":
    main()
