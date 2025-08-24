#!/usr/bin/env python3
"""
Manage Folders Example
=====================

This example demonstrates how to:
1. Refresh and save folders from API
2. List available folders
3. Select folder for profile creation
4. Create profile with specific folder

Usage:
    python3 manage_folders.py [refresh|list|create]
"""

import sys
import os
import logging

# Add parent directory to path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from multilogin_api import MultiloginXAPI
from fingerprint_generator import FingerprintGenerator

def setup_logging():
    """Setup logging configuration"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(),
            logging.FileHandler('../logs/manage_folders.log')
        ]
    )
    return logging.getLogger(__name__)

def refresh_folders(api):
    """Refresh folders from API and save to file"""
    print("🔄 Refreshing folders from API...")
    folders = api.refresh_and_save_folders()
    
    if folders:
        print(f"✅ Successfully refreshed {len(folders)} folders")
        for folder in folders:
            print(f"   📂 {folder.get('name')} (ID: {folder.get('folder_id')}) - {folder.get('profiles_count', 0)} profiles")
    else:
        print("❌ Failed to refresh folders")
    
    return folders

def list_folders(api):
    """List all available folders"""
    print("📁 Listing available folders...")
    api.list_available_folders()

def create_profile_with_folder(api, folder_name=None, folder_id=None):
    """Create profile with specific folder"""
    print("🔨 Creating profile with specific folder...")
    
    # Determine folder to use
    target_folder = None
    if folder_id:
        target_folder = api.get_folder_by_id(folder_id)
        if target_folder:
            print(f"✅ Using folder by ID: {target_folder.get('name')}")
    elif folder_name:
        target_folder = api.get_folder_by_name(folder_name)
        if target_folder:
            print(f"✅ Using folder by name: {target_folder.get('name')}")
    
    if not target_folder:
        print("❌ Folder not found, using default folder")
        folder_id = None
    else:
        folder_id = target_folder.get('folder_id')
        print(f"   Folder ID: {folder_id}")
        print(f"   Current profiles: {target_folder.get('profiles_count', 0)}")
    
    # Generate fingerprint
    fingerprint_gen = FingerprintGenerator("../config/config.yaml")
    fingerprint = fingerprint_gen.generate_unique_fingerprint(proxy_location="US")
    
    # Create profile
    profile = api.create_profile(
        name="manual_folder_profile",
        fingerprint=fingerprint,
        provider="multilogin_residential",
        personality="researcher",
        geo_location="US",
        folder_id=folder_id
    )
    
    if profile:
        print(f"✅ Profile created successfully!")
        print(f"   Profile ID: {profile.profile_id}")
        print(f"   Folder ID: {profile.folder_id}")
        print(f"   Name: {profile.name}")
        print(f"   Created: {profile.created_at}")
        
        # Update folder count in saved data
        if target_folder:
            target_folder['profiles_count'] = target_folder.get('profiles_count', 0) + 1
            api.save_folders_data(api.load_folders_data())
            print(f"   Updated folder count: {target_folder.get('profiles_count')}")
    else:
        print("❌ Profile creation failed")

def main():
    """Main function"""
    logger = setup_logging()
    
    if len(sys.argv) < 2:
        print("Usage: python3 manage_folders.py [refresh|list|create] [folder_name|folder_id]")
        print("")
        print("Commands:")
        print("  refresh                    - Refresh folders from API")
        print("  list                       - List available folders")
        print("  create [folder_name|id]    - Create profile with specific folder")
        print("")
        print("Examples:")
        print("  python3 manage_folders.py refresh")
        print("  python3 manage_folders.py list")
        print("  python3 manage_folders.py create 'Default folder'")
        print("  python3 manage_folders.py create d3602d53-2e54-4cce-87d7-64e89e0f8679")
        return
    
    command = sys.argv[1].lower()
    
    try:
        # Initialize Multilogin API
        logger.info("🔧 Initializing Multilogin API...")
        api = MultiloginXAPI("../config/config.yaml")
        
        if not api.authenticate():
            logger.error("❌ Authentication failed")
            return
        
        logger.info("✅ Authentication successful!")
        
        if command == "refresh":
            refresh_folders(api)
            
        elif command == "list":
            list_folders(api)
            
        elif command == "create":
            folder_arg = sys.argv[2] if len(sys.argv) > 2 else None
            create_profile_with_folder(api, folder_name=folder_arg, folder_id=folder_arg)
            
        else:
            print(f"❌ Unknown command: {command}")
            print("Use: refresh, list, or create")
            
    except Exception as e:
        logger.error(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    main()
