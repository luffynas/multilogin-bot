#!/usr/bin/env python3
"""
Simple Connection Test
Test basic connectivity to Multilogin and profile creation
"""

import sys
import os
import logging

# Add src directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from multilogin_api import MultiloginXAPI
from profile_manager import ProfileManager

def setup_logging():
    """Setup basic logging"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s'
    )

def test_connection():
    """Test basic connection and functionality"""
    logger = logging.getLogger(__name__)
    
    print("🔍 Testing Multilogin Connection")
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
        
        # Test 3: Get profiles
        logger.info("📋 Testing profile retrieval...")
        profile_manager = ProfileManager("../config/config.yaml")
        existing_profiles = profile_manager.get_all_profiles()
        
        if existing_profiles:
            print(f"✅ Found {len(existing_profiles)} existing profiles")
            for profile in existing_profiles[:3]:  # Show first 3
                print(f"   - {profile.name} (ID: {profile.profile_id})")
        else:
            print("📝 No existing profiles found")
        
        # Test 4: Create test profile
        logger.info("🔨 Testing profile creation...")
        new_profiles = profile_manager.create_profiles(count=1, provider="multilogin_residential")
        
        if new_profiles:
            test_profile = new_profiles[0]
            print(f"✅ Created test profile: {test_profile.name}")
            print(f"   Profile ID: {test_profile.profile_id}")
            print(f"   Provider: {test_profile.provider}")
            
            # Test 5: Start profile
            logger.info("▶️ Testing profile start...")
            start_result = multilogin_api.start_profile(test_profile.profile_id)
            
            if start_result:
                debugging_url = start_result.get('debugging_url')
                print(f"✅ Profile started successfully!")
                print(f"   Debugging URL: {debugging_url}")
                
                # Test 6: Stop profile
                logger.info("⏹️ Testing profile stop...")
                stop_result = multilogin_api.stop_profile(test_profile.profile_id)
                
                if stop_result:
                    print("✅ Profile stopped successfully!")
                else:
                    print("⚠️ Profile stop failed")
            else:
                print("❌ Profile start failed")
        else:
            print("❌ Profile creation failed")
            return False
        
        print("\n🎉 All connection tests passed!")
        return True
        
    except Exception as e:
        print(f"❌ Connection test failed: {e}")
        logger.error(f"Error during connection test: {e}")
        return False

def main():
    """Main function"""
    setup_logging()
    
    success = test_connection()
    
    if success:
        print("\n✅ Connection test completed successfully!")
        print("🚀 You can now run the full examples!")
    else:
        print("\n❌ Connection test failed!")
        print("🔧 Please check your configuration and try again")
    
    print("\n📖 Next steps:")
    print("1. Run: ./run_examples.sh quick-start")
    print("2. Run: ./run_examples.sh comprehensive")
    print("3. Check logs for detailed information")

if __name__ == "__main__":
    main()
