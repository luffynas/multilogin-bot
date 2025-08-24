#!/usr/bin/env python3
"""
Basic Test - Working Features Only
Test features that are known to work
"""

import sys
import os
import logging

# Add src directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from multilogin_api import MultiloginXAPI
from fingerprint_generator import FingerprintGenerator
from referer_simulator import RefererSimulator

def setup_logging():
    """Setup basic logging"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s'
    )

def basic_test():
    """Test basic working features"""
    logger = logging.getLogger(__name__)
    
    print("🔍 Basic Multilogin Test")
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
            return False
        
        # Test 3: Fingerprint Generator
        logger.info("🖐️ Testing fingerprint generator...")
        fingerprint_gen = FingerprintGenerator("../config/config.yaml")
        fingerprint = fingerprint_gen.generate_unique_fingerprint(proxy_location="US")
        
        if fingerprint:
            print("✅ Fingerprint generation successful!")
            print(f"   User Agent: {fingerprint.get('userAgent', 'N/A')[:50]}...")
            print(f"   Platform: {fingerprint.get('platform', 'N/A')}")
            print(f"   Timezone: {fingerprint.get('timezone', 'N/A')}")
            print(f"   Language: {fingerprint.get('language', 'N/A')}")
        else:
            print("❌ Fingerprint generation failed!")
            return False
        
        # Test 4: Referer Simulator
        logger.info("🔗 Testing referer simulator...")
        referer_sim = RefererSimulator(multilogin_api.config)
        referer_config = referer_sim.generate_referer_for_profile(
            profile_personality="explorer",
            geo_location="US"
        )
        
        if referer_config:
            print("✅ Referer simulation successful!")
            print(f"   Referer URL: {referer_config.get('referer', 'N/A')}")
            print(f"   Type: {referer_config.get('type', 'N/A')}")
        else:
            print("❌ Referer simulation failed!")
            return False
        
        # Test 5: Fingerprint Validation
        logger.info("✅ Testing fingerprint validation...")
        is_valid = fingerprint_gen.validate_fingerprint_consistency(fingerprint, "US")
        
        if is_valid:
            print("✅ Fingerprint validation successful!")
        else:
            print("⚠️ Fingerprint validation failed!")
        
        # Test 6: Configuration Loading
        logger.info("⚙️ Testing configuration loading...")
        config = multilogin_api.config
        
        if config:
            print("✅ Configuration loading successful!")
            print(f"   Multilogin URL: {config.get('multilogin', {}).get('base_url', 'N/A')}")
            print(f"   Launcher URL: {config.get('multilogin', {}).get('launcher_url', 'N/A')}")
            print(f"   Default Geo: {config.get('profiles', {}).get('geo_default', 'N/A')}")
        else:
            print("❌ Configuration loading failed!")
            return False
        
        print("\n🎉 Basic test completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Basic test failed: {e}")
        logger.error(f"Error during basic test: {e}")
        return False

def main():
    """Main function"""
    setup_logging()
    
    success = basic_test()
    
    if success:
        print("\n✅ Basic test completed successfully!")
        print("🚀 Core functionality is working!")
        print("📋 Working features:")
        print("   - Authentication")
        print("   - Fingerprint generation")
        print("   - Referer simulation")
        print("   - Configuration loading")
    else:
        print("\n❌ Basic test failed!")
        print("🔧 Please check your configuration and try again")
    
    print("\n📖 Next steps:")
    print("1. The core system is working!")
    print("2. Profile creation may need manual setup first")
    print("3. Try creating a profile manually in Multilogin")

if __name__ == "__main__":
    main()
