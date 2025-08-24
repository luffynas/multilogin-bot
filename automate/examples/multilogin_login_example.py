#!/usr/bin/env python3
"""
Multilogin Login Example
Demonstrates how to login to Multilogin and use profiles for automation
"""

import sys
import os
import time
import logging
import json
import random
from typing import Dict, List, Optional
from datetime import datetime

# Add src directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from multilogin_api import MultiloginXAPI, ProfileData
from profile_manager import ProfileManager
from selenium_automation import UndetectableSeleniumAutomation

def setup_logging():
    """Setup logging configuration"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(),
            logging.FileHandler('multilogin_login_example.log')
        ]
    )

def demonstrate_multilogin_login():
    """Demonstrate Multilogin login and authentication"""
    logger = logging.getLogger(__name__)
    
    logger.info("🔐 Multilogin Login Demonstration")
    logger.info("=" * 50)
    
    try:
        # Initialize Multilogin API
        multilogin_api = MultiloginXAPI("../config/config.yaml")
        
        # Attempt authentication
        logger.info("🔑 Attempting to authenticate with Multilogin...")
        
        if multilogin_api.authenticate():
            logger.info("✅ Successfully authenticated with Multilogin!")
            logger.info(f"   Bearer Token: {multilogin_api.bearer_token[:20]}...")
            logger.info(f"   Refresh Token: {multilogin_api.refresh_token[:20]}...")
            
            # Test token refresh
            logger.info("🔄 Testing token refresh...")
            if multilogin_api.refresh_auth_token():
                logger.info("✅ Token refresh successful!")
            else:
                logger.warning("⚠️ Token refresh failed")
            
            return multilogin_api
        else:
            logger.error("❌ Authentication failed!")
            return None
            
    except Exception as e:
        logger.error(f"❌ Error during authentication: {e}")
        return None

def demonstrate_profile_management(multilogin_api: MultiloginXAPI):
    """Demonstrate profile management operations"""
    logger = logging.getLogger(__name__)
    
    logger.info("👥 Profile Management Demonstration")
    logger.info("=" * 50)
    
    try:
        # Initialize profile manager
        profile_manager = ProfileManager("../config/config.yaml")
        
        # Get existing profiles
        logger.info("📋 Getting existing profiles...")
        existing_profiles = profile_manager.get_all_profiles()
        
        if existing_profiles:
            logger.info(f"✅ Found {len(existing_profiles)} existing profiles:")
            for profile in existing_profiles[:5]:  # Show first 5
                logger.info(f"   - {profile.name} (ID: {profile.profile_id})")
                logger.info(f"     Provider: {profile.provider}")
                logger.info(f"     Status: {profile.status}")
                logger.info(f"     Created: {profile.created_at}")
                logger.info("")
        else:
            logger.info("📝 No existing profiles found. Creating new profiles...")
            
            # Create new profiles
            logger.info("🔨 Creating new profiles...")
            new_profiles = profile_manager.create_profiles(count=2, provider="multilogin_residential")
            
            if new_profiles:
                logger.info(f"✅ Successfully created {len(new_profiles)} profiles:")
                for profile in new_profiles:
                    logger.info(f"   - {profile.name} (ID: {profile.profile_id})")
                    logger.info(f"     Provider: {profile.provider}")
                    logger.info(f"     Created: {profile.created_at}")
                    logger.info("")
            else:
                logger.error("❌ Failed to create profiles")
                return None
        
        return profile_manager
        
    except Exception as e:
        logger.error(f"❌ Error in profile management: {e}")
        return None

def demonstrate_profile_start_stop(multilogin_api: MultiloginXAPI, profile_manager: ProfileManager):
    """Demonstrate starting and stopping profiles"""
    logger = logging.getLogger(__name__)
    
    logger.info("🚀 Profile Start/Stop Demonstration")
    logger.info("=" * 50)
    
    try:
        # Get available profiles
        available_profiles = profile_manager.get_all_profiles()
        
        if not available_profiles:
            logger.error("❌ No profiles available for testing")
            return None
        
        # Select a profile for testing
        test_profile = available_profiles[0]
        logger.info(f"🎯 Testing with profile: {test_profile.name}")
        
        # Start profile
        logger.info("▶️ Starting profile...")
        start_result = multilogin_api.start_profile(test_profile.profile_id)
        
        if start_result:
            logger.info("✅ Profile started successfully!")
            logger.info(f"   Debugging URL: {start_result.get('debugging_url', 'N/A')}")
            logger.info(f"   Profile ID: {start_result.get('profile_id', 'N/A')}")
            
            # Wait a moment
            time.sleep(3)
            
            # Stop profile
            logger.info("⏹️ Stopping profile...")
            stop_result = multilogin_api.stop_profile(test_profile.profile_id)
            
            if stop_result:
                logger.info("✅ Profile stopped successfully!")
            else:
                logger.warning("⚠️ Profile stop failed")
        else:
            logger.error("❌ Failed to start profile")
            return None
        
        return test_profile
        
    except Exception as e:
        logger.error(f"❌ Error in profile start/stop: {e}")
        return None

def demonstrate_selenium_automation(multilogin_api: MultiloginXAPI, profile_manager: ProfileManager):
    """Demonstrate Selenium automation with Multilogin profile"""
    logger = logging.getLogger(__name__)
    
    logger.info("🤖 Selenium Automation Demonstration")
    logger.info("=" * 50)
    
    try:
        # Get available profile
        available_profiles = profile_manager.get_all_profiles()
        
        if not available_profiles:
            logger.error("❌ No profiles available for automation")
            return None
        
        test_profile = available_profiles[0]
        logger.info(f"🎯 Using profile: {test_profile.name}")
        
        # Start profile
        logger.info("▶️ Starting profile for automation...")
        start_result = multilogin_api.start_profile(test_profile.profile_id)
        
        if not start_result:
            logger.error("❌ Failed to start profile for automation")
            return None
        
        debugging_url = start_result.get('debugging_url')
        logger.info(f"🔗 Debugging URL: {debugging_url}")
        
        # Initialize Selenium automation
        logger.info("🤖 Initializing Selenium automation...")
        automation = UndetectableSeleniumAutomation("../config/config.yaml")
        
        # Setup driver with Multilogin debugging URL
        logger.info("🔧 Setting up undetectable Chrome driver...")
        if automation.setup_driver(debugging_url):
            logger.info("✅ Driver setup successful!")
            
            try:
                # Test basic navigation
                logger.info("🌐 Testing basic navigation...")
                test_url = "https://example.com"
                automation.driver.get(test_url)
                time.sleep(3)
                
                page_title = automation.driver.title
                logger.info(f"📄 Page title: {page_title}")
                
                # Test realistic browsing
                logger.info("🎭 Testing realistic browsing behavior...")
                browsing_session = automation.simulate_realistic_browsing(test_url)
                
                if browsing_session and not browsing_session.get("error"):
                    logger.info("✅ Realistic browsing completed!")
                    logger.info(f"   Pages visited: {browsing_session.get('total_pages', 0)}")
                    logger.info(f"   Session duration: {browsing_session.get('session_duration', 0):.1f}s")
                    logger.info(f"   Personality: {browsing_session.get('personality', 'N/A')}")
                    logger.info(f"   Device type: {browsing_session.get('device_type', 'N/A')}")
                    logger.info(f"   Navigation pattern: {browsing_session.get('navigation_pattern', [])}")
                else:
                    logger.warning("⚠️ Realistic browsing failed")
                
                # Test AdSense detection
                logger.info("🎯 Testing AdSense detection...")
                adsense_result = automation.test_adsense_ads(test_url)
                
                if adsense_result:
                    logger.info("✅ AdSense testing completed!")
                    logger.info(f"   Ads detected: {adsense_result.get('ads_detected', 0)}")
                    logger.info(f"   Interactions: {adsense_result.get('interactions', {})}")
                else:
                    logger.warning("⚠️ AdSense testing failed")
                
            except Exception as e:
                logger.error(f"❌ Error during automation: {e}")
            
            finally:
                # Cleanup
                logger.info("🧹 Cleaning up...")
                if automation.driver:
                    automation.driver.quit()
                    logger.info("✅ Driver closed")
        else:
            logger.error("❌ Driver setup failed")
        
        # Stop profile
        logger.info("⏹️ Stopping profile...")
        multilogin_api.stop_profile(test_profile.profile_id)
        logger.info("✅ Profile stopped")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ Error in Selenium automation: {e}")
        return None

def demonstrate_batch_automation(multilogin_api: MultiloginXAPI, profile_manager: ProfileManager):
    """Demonstrate batch automation with multiple profiles"""
    logger = logging.getLogger(__name__)
    
    logger.info("📦 Batch Automation Demonstration")
    logger.info("=" * 50)
    
    try:
        # Get available profiles
        available_profiles = profile_manager.get_all_profiles()
        
        if len(available_profiles) < 2:
            logger.warning("⚠️ Need at least 2 profiles for batch demonstration")
            return None
        
        # Select profiles for batch testing
        test_profiles = available_profiles[:2]
        logger.info(f"🎯 Testing with {len(test_profiles)} profiles")
        
        results = []
        
        for i, profile in enumerate(test_profiles):
            logger.info(f"🔄 Processing profile {i+1}/{len(test_profiles)}: {profile.name}")
            
            try:
                # Start profile
                start_result = multilogin_api.start_profile(profile.profile_id)
                
                if not start_result:
                    logger.warning(f"⚠️ Failed to start profile {profile.name}")
                    continue
                
                debugging_url = start_result.get('debugging_url')
                
                # Initialize automation
                automation = UndetectableSeleniumAutomation("../config/config.yaml")
                
                if automation.setup_driver(debugging_url):
                    try:
                        # Quick test
                        test_url = "https://httpbin.org/ip"
                        automation.driver.get(test_url)
                        time.sleep(2)
                        
                        # Get IP info
                        page_source = automation.driver.page_source
                        if "origin" in page_source:
                            logger.info(f"✅ Profile {profile.name} - IP check successful")
                        else:
                            logger.warning(f"⚠️ Profile {profile.name} - IP check failed")
                        
                        # Simulate brief browsing
                        browsing_session = automation.simulate_realistic_browsing("https://example.com")
                        
                        result = {
                            "profile_name": profile.name,
                            "profile_id": profile.profile_id,
                            "status": "success",
                            "browsing_session": browsing_session
                        }
                        
                    except Exception as e:
                        logger.error(f"❌ Error with profile {profile.name}: {e}")
                        result = {
                            "profile_name": profile.name,
                            "profile_id": profile.profile_id,
                            "status": "error",
                            "error": str(e)
                        }
                    
                    finally:
                        # Cleanup
                        if automation.driver:
                            automation.driver.quit()
                
                # Stop profile
                multilogin_api.stop_profile(profile.profile_id)
                
                results.append(result)
                
            except Exception as e:
                logger.error(f"❌ Error processing profile {profile.name}: {e}")
                results.append({
                    "profile_name": profile.name,
                    "profile_id": profile.profile_id,
                    "status": "error",
                    "error": str(e)
                })
        
        # Show batch results
        logger.info("📊 Batch Automation Results:")
        for result in results:
            status_icon = "✅" if result["status"] == "success" else "❌"
            logger.info(f"   {status_icon} {result['profile_name']}: {result['status']}")
            
            if result["status"] == "success" and result.get("browsing_session"):
                session = result["browsing_session"]
                logger.info(f"      Pages: {session.get('total_pages', 0)}")
                logger.info(f"      Duration: {session.get('session_duration', 0):.1f}s")
                logger.info(f"      Personality: {session.get('personality', 'N/A')}")
        
        return results
        
    except Exception as e:
        logger.error(f"❌ Error in batch automation: {e}")
        return None

def demonstrate_analytics_and_monitoring():
    """Demonstrate analytics and monitoring features"""
    logger = logging.getLogger(__name__)
    
    logger.info("📊 Analytics and Monitoring Demonstration")
    logger.info("=" * 50)
    
    try:
        # Load profile data
        profiles_file = "data/profiles.json"
        if os.path.exists(profiles_file):
            with open(profiles_file, 'r') as f:
                profiles_data = json.load(f)
            
            logger.info(f"📋 Profile Analytics:")
            logger.info(f"   Total profiles: {len(profiles_data)}")
            
            # Analyze by provider
            providers = {}
            for profile_id, profile_info in profiles_data.items():
                provider = profile_info.get('provider', 'unknown')
                providers[provider] = providers.get(provider, 0) + 1
            
            logger.info("   Provider distribution:")
            for provider, count in providers.items():
                logger.info(f"     {provider}: {count}")
            
            # Analyze by status
            statuses = {}
            for profile_id, profile_info in profiles_data.items():
                status = profile_info.get('status', 'unknown')
                statuses[status] = statuses.get(status, 0) + 1
            
            logger.info("   Status distribution:")
            for status, count in statuses.items():
                logger.info(f"     {status}: {count}")
        
        # Load referer statistics
        referer_stats_file = "data/referer_statistics.json"
        if os.path.exists(referer_stats_file):
            with open(referer_stats_file, 'r') as f:
                referer_stats = json.load(f)
            
            logger.info(f"🔗 Referer Analytics:")
            logger.info(f"   Total referers: {referer_stats.get('total_referers', 0)}")
            
            if referer_stats.get('referer_types'):
                logger.info("   Referer type distribution:")
                for ref_type, count in referer_stats['referer_types'].items():
                    percentage = (count / referer_stats['total_referers']) * 100
                    logger.info(f"     {ref_type}: {count} ({percentage:.1f}%)")
        
        # Load session memory
        session_memory_file = f"data/session_memory_{datetime.now().strftime('%Y%m%d')}.json"
        if os.path.exists(session_memory_file):
            with open(session_memory_file, 'r') as f:
                session_memory = json.load(f)
            
            logger.info(f"🧠 Session Memory Analytics:")
            logger.info(f"   Total sessions: {len(session_memory)}")
            
            # Analyze by personality
            personalities = {}
            for session_id, session_info in session_memory.items():
                personality = session_info.get('personality', 'unknown')
                personalities[personality] = personalities.get(personality, 0) + 1
            
            logger.info("   Personality distribution:")
            for personality, count in personalities.items():
                logger.info(f"     {personality}: {count}")
        
        logger.info("✅ Analytics demonstration completed!")
        
    except Exception as e:
        logger.error(f"❌ Error in analytics demonstration: {e}")

def run_comprehensive_example():
    """Run comprehensive Multilogin example"""
    logger = logging.getLogger(__name__)
    
    logger.info("🚀 Multilogin Login Example - Comprehensive Demonstration")
    logger.info("=" * 80)
    logger.info("")
    
    # Step 1: Login to Multilogin
    multilogin_api = demonstrate_multilogin_login()
    if not multilogin_api:
        logger.error("❌ Cannot proceed without Multilogin authentication")
        return
    
    # Step 2: Profile Management
    profile_manager = demonstrate_profile_management(multilogin_api)
    if not profile_manager:
        logger.error("❌ Cannot proceed without profile management")
        return
    
    # Step 3: Profile Start/Stop
    test_profile = demonstrate_profile_start_stop(multilogin_api, profile_manager)
    if not test_profile:
        logger.warning("⚠️ Profile start/stop demonstration failed")
    
    # Step 4: Selenium Automation
    automation_result = demonstrate_selenium_automation(multilogin_api, profile_manager)
    if not automation_result:
        logger.warning("⚠️ Selenium automation demonstration failed")
    
    # Step 5: Batch Automation
    batch_result = demonstrate_batch_automation(multilogin_api, profile_manager)
    if not batch_result:
        logger.warning("⚠️ Batch automation demonstration failed")
    
    # Step 6: Analytics and Monitoring
    demonstrate_analytics_and_monitoring()
    
    logger.info("🎉 Multilogin Login Example Completed!")
    logger.info("=" * 80)
    logger.info("")
    logger.info("📁 Check the log file for detailed information:")
    logger.info("   multilogin_login_example.log")
    logger.info("")
    logger.info("🔧 All features demonstrated successfully!")
    logger.info("   - Multilogin authentication")
    logger.info("   - Profile management")
    logger.info("   - Profile start/stop")
    logger.info("   - Selenium automation")
    logger.info("   - Batch processing")
    logger.info("   - Analytics and monitoring")

def main():
    """Main function"""
    setup_logging()
    run_comprehensive_example()

if __name__ == "__main__":
    main()
