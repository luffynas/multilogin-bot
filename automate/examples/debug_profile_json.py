#!/usr/bin/env python3
"""
Debug Profile Creation JSON
Prints the exact JSON that would be sent to Multilogin API
"""

import sys
import os
import json
from pathlib import Path

# Add automate src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from multilogin_api import MultiloginXAPI
from fingerprint_generator import FingerprintGenerator

def debug_profile_json():
    """Debug the profile creation JSON structure"""
    
    print("🔍 Debug Profile Creation JSON")
    print("=" * 50)
    
    try:
        # Initialize API
        print("🔧 Initializing API...")
        api = MultiloginXAPI("../config/config.yaml")
        
        # Generate fingerprint
        print("🖐️ Generating fingerprint...")
        fingerprint_gen = FingerprintGenerator("../config/config.yaml")
        fingerprint = fingerprint_gen.generate_unique_fingerprint(proxy_location="US")
        
        # Create the exact profile data that would be sent
        print("📋 Creating profile data structure...")
        
        # Generate referer configuration for this profile
        referer_config = api.referer_simulator.generate_referer_for_profile(
            "casual", "US"
        )
        
        # Prepare profile data for Multilogin X API (matching Postman structure)
        profile_data = {
            "browser_type": "mimic",
            "core_version": 124,  # Required field from Postman
            "os_type": "windows",
            "automation": "selenium",
            "is_headless": False,
            "parameters": {
                "flags": {
                    "audio_masking": "mask",
                    "fonts_masking": "custom",
                    "geolocation_masking": "custom",
                    "geolocation_popup": "prompt",
                    "graphics_masking": "custom",
                    "graphics_noise": "mask",
                    "localization_masking": "custom",
                    "media_devices_masking": "custom",
                    "navigator_masking": "custom",
                    "ports_masking": "mask",
                    "proxy_masking": "disabled",  # For residential proxy
                    "screen_masking": "custom",
                    "timezone_masking": "custom",
                    "webrtc_masking": "custom",
                    "canvas_noise": "custom",
                    "startup_behavior": "custom"
                },
                "fingerprint": {},  # Will be populated below
                "custom_start_urls": []  # Optional field from Postman
            }
        }
        
        # Add fingerprint if provided
        if fingerprint:
            profile_data["parameters"]["fingerprint"] = api._convert_fingerprint_format(fingerprint)
        
        # Print the JSON structure
        print("\n📄 PROFILE DATA JSON:")
        print("=" * 50)
        print(json.dumps(profile_data, indent=2))
        
        print("\n📊 JSON VALIDATION:")
        print("=" * 50)
        
        # Check required fields
        required_fields = ["browser_type", "os_type", "parameters"]
        for field in required_fields:
            if field in profile_data:
                print(f"✅ {field}: Present")
            else:
                print(f"❌ {field}: Missing")
        
        # Check parameters structure
        if "parameters" in profile_data:
            param_fields = ["flags", "fingerprint"]
            for field in param_fields:
                if field in profile_data["parameters"]:
                    print(f"✅ parameters.{field}: Present")
                else:
                    print(f"❌ parameters.{field}: Missing")
        
        # Check flags
        if "flags" in profile_data.get("parameters", {}):
            flags = profile_data["parameters"]["flags"]
            required_flags = [
                "audio_masking", "fonts_masking", "geolocation_masking", 
                "geolocation_popup", "graphics_masking", "graphics_noise",
                "localization_masking", "media_devices_masking", "navigator_masking",
                "ports_masking", "proxy_masking", "screen_masking", 
                "timezone_masking", "webrtc_masking"
            ]
            
            print(f"\n🏁 FLAGS CHECK ({len(flags)} total):")
            for flag in required_flags:
                if flag in flags:
                    print(f"✅ {flag}: {flags[flag]}")
                else:
                    print(f"❌ {flag}: Missing")
        
        # Check fingerprint structure
        if "fingerprint" in profile_data.get("parameters", {}):
            fp = profile_data["parameters"]["fingerprint"]
            print(f"\n🖐️ FINGERPRINT SECTIONS ({len(fp)} total):")
            for section in fp.keys():
                print(f"✅ {section}: Present")
        
        print("\n🎯 ENDPOINT URL:")
        print("=" * 50)
        create_url = f"{api.launcher_url.replace('/api/v2', '/api/v3')}/profile/quick"
        print(f"URL: {create_url}")
        
        print("\n✅ Debug completed successfully!")
        
    except Exception as e:
        print(f"❌ Error during debug: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    debug_profile_json()
