#!/usr/bin/env python3
"""
Test Folders Example
===================

This example demonstrates how to:
1. Get available folders from workspace
2. Get default folder ID for profile creation
3. Test folder integration with profile creation

Usage:
    python3 test_folders.py
"""

import sys
import os
import logging

# Add parent directory to path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from multilogin_api import MultiloginXAPI

def setup_logging():
    """Setup logging configuration"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(),
            logging.FileHandler('../logs/test_folders.log')
        ]
    )
    return logging.getLogger(__name__)

def test_folders():
    """Test folder functionality"""
    logger = setup_logging()
    
    print("🔍 Testing Folder Functionality")
    print("=" * 50)
    
    try:
        # Initialize Multilogin API
        logger.info("🔧 Initializing Multilogin API...")
        api = MultiloginXAPI("../config/config.yaml")
        
        if not api.authenticate():
            logger.error("❌ Authentication failed")
            return False
        
        logger.info("✅ Authentication successful!")
        
        # Test 1: Get all folders
        print("\n📁 Test 1: Getting all folders...")
        folders = api.get_folders()
        
        if folders:
            print(f"✅ Found {len(folders)} folders:")
            for folder in folders:
                print(f"   📂 {folder.get('name')} (ID: {folder.get('folder_id')}) - {folder.get('profiles_count', 0)} profiles")
        else:
            print("❌ No folders found")
            return False
        
        # Test 2: Get default folder ID
        print("\n🎯 Test 2: Getting default folder ID...")
        default_folder_id = api.get_default_folder_id()
        print(f"✅ Default folder ID: {default_folder_id}")
        
        # Test 3: Create profile with correct folder_id
        print("\n🔨 Test 3: Creating profile with folder integration...")
        
        # Generate fingerprint
        from fingerprint_generator import FingerprintGenerator
        fingerprint_gen = FingerprintGenerator("../config/config.yaml")
        fingerprint = fingerprint_gen.generate_unique_fingerprint(proxy_location="US")
        
        # Create profile
        profile = api.create_profile(
            name="test_folder_profile",
            fingerprint=fingerprint,
            provider="multilogin_residential",
            personality="researcher",
            geo_location="US"
        )
        
        if profile:
            print(f"✅ Profile created successfully!")
            print(f"   Profile ID: {profile.profile_id}")
            print(f"   Folder ID: {profile.folder_id}")
            print(f"   Name: {profile.name}")
            print(f"   Created: {profile.created_at}")
        else:
            print("❌ Profile creation failed")
            return False
        
        print("\n🎉 All folder tests passed!")
        return True
        
    except Exception as e:
        logger.error(f"❌ Test failed with error: {e}")
        return False

if __name__ == "__main__":
    success = test_folders()
    sys.exit(0 if success else 1)
