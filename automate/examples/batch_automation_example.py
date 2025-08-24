#!/usr/bin/env python3
"""
Batch Automation Example - Multiple Profiles
Demonstrates how to run automation across multiple Multilogin profiles
"""

import sys
import os
import time
import logging
import json
import random
from typing import List, Dict
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime

# Add src directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from multilogin_api import MultiloginXAPI
from profile_manager import ProfileManager
from selenium_automation import UndetectableSeleniumAutomation

def setup_logging():
    """Setup logging for batch automation"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(),
            logging.FileHandler('batch_automation.log')
        ]
    )

class BatchAutomation:
    def __init__(self, config_path: str = "../config/config.yaml"):
        """Initialize batch automation"""
        self.config_path = config_path
        self.logger = logging.getLogger(__name__)
        
        # Initialize components
        self.multilogin_api = MultiloginXAPI(config_path)
        self.profile_manager = ProfileManager(config_path)
        
        # Authentication
        if not self.multilogin_api.authenticate():
            raise Exception("Failed to authenticate with Multilogin")
        
        self.logger.info("✅ Batch automation initialized successfully")
    
    def get_available_profiles(self, max_profiles: int = 5) -> List:
        """Get available profiles for batch automation"""
        try:
            profiles = self.profile_manager.get_all_profiles()
            
            if not profiles:
                self.logger.info("📝 No profiles found. Creating new profiles...")
                new_profiles = self.profile_manager.create_profiles(
                    count=max_profiles, 
                    provider="multilogin_residential"
                )
                if new_profiles:
                    profiles = new_profiles
                else:
                    raise Exception("Failed to create profiles")
            
            # Limit to max_profiles
            available_profiles = profiles[:max_profiles]
            
            self.logger.info(f"✅ Found {len(available_profiles)} profiles for batch automation")
            return available_profiles
            
        except Exception as e:
            self.logger.error(f"❌ Error getting available profiles: {e}")
            return []
    
    def run_single_profile_automation(self, profile, target_urls: List[str]) -> Dict:
        """Run automation for a single profile"""
        profile_logger = logging.getLogger(f"Profile-{profile.name}")
        
        result = {
            "profile_name": profile.name,
            "profile_id": profile.profile_id,
            "status": "error",
            "start_time": datetime.now().isoformat(),
            "end_time": None,
            "urls_visited": [],
            "errors": [],
            "browsing_sessions": []
        }
        
        try:
            profile_logger.info(f"🚀 Starting automation for profile: {profile.name}")
            
            # Start profile
            start_result = self.multilogin_api.start_profile(profile.profile_id)
            if not start_result:
                raise Exception("Failed to start profile")
            
            debugging_url = start_result.get('debugging_url')
            profile_logger.info(f"✅ Profile started: {debugging_url}")
            
            # Initialize automation
            automation = UndetectableSeleniumAutomation(self.config_path)
            
            if not automation.setup_driver(debugging_url):
                raise Exception("Failed to setup Selenium driver")
            
            profile_logger.info("✅ Selenium automation ready")
            
            # Run automation for each target URL
            for i, target_url in enumerate(target_urls):
                try:
                    profile_logger.info(f"🌐 Processing URL {i+1}/{len(target_urls)}: {target_url}")
                    
                    # Navigate to URL
                    automation.driver.get(target_url)
                    time.sleep(random.uniform(2, 4))
                    
                    # Get page info
                    page_title = automation.driver.title
                    current_url = automation.driver.current_url
                    
                    profile_logger.info(f"📄 Page: {page_title}")
                    
                    # Simulate realistic browsing
                    browsing_session = automation.simulate_realistic_browsing(target_url)
                    
                    if browsing_session and not browsing_session.get("error"):
                        profile_logger.info(f"✅ Browsing completed: {browsing_session.get('total_pages', 0)} pages")
                        
                        # Add to results
                        result["urls_visited"].append({
                            "url": target_url,
                            "title": page_title,
                            "final_url": current_url,
                            "browsing_session": browsing_session
                        })
                        
                        result["browsing_sessions"].append(browsing_session)
                    else:
                        profile_logger.warning(f"⚠️ Browsing failed for {target_url}")
                        result["errors"].append(f"Browsing failed for {target_url}")
                    
                    # Random delay between URLs
                    time.sleep(random.uniform(5, 15))
                    
                except Exception as e:
                    error_msg = f"Error processing {target_url}: {str(e)}"
                    profile_logger.error(error_msg)
                    result["errors"].append(error_msg)
            
            # Test AdSense detection on last URL
            if result["urls_visited"]:
                try:
                    last_url = result["urls_visited"][-1]["url"]
                    profile_logger.info(f"🎯 Testing AdSense detection on: {last_url}")
                    
                    adsense_result = automation.test_adsense_ads(last_url)
                    if adsense_result:
                        profile_logger.info(f"✅ AdSense test completed: {adsense_result.get('ads_detected', 0)} ads")
                        result["adsense_result"] = adsense_result
                    else:
                        profile_logger.warning("⚠️ AdSense test failed")
                        
                except Exception as e:
                    profile_logger.error(f"❌ AdSense test error: {e}")
            
            result["status"] = "success"
            profile_logger.info("✅ Profile automation completed successfully")
            
        except Exception as e:
            error_msg = f"Profile automation failed: {str(e)}"
            profile_logger.error(error_msg)
            result["errors"].append(error_msg)
            result["status"] = "error"
        
        finally:
            # Cleanup
            try:
                if 'automation' in locals() and automation.driver:
                    automation.driver.quit()
                    profile_logger.info("✅ Driver closed")
                
                # Stop profile
                self.multilogin_api.stop_profile(profile.profile_id)
                profile_logger.info("✅ Profile stopped")
                
            except Exception as e:
                profile_logger.error(f"❌ Cleanup error: {e}")
            
            result["end_time"] = datetime.now().isoformat()
        
        return result
    
    def run_batch_automation(self, target_urls: List[str], max_profiles: int = 3, 
                           max_workers: int = 2) -> List[Dict]:
        """Run batch automation across multiple profiles"""
        self.logger.info(f"🚀 Starting batch automation with {max_profiles} profiles")
        self.logger.info(f"🎯 Target URLs: {len(target_urls)}")
        self.logger.info(f"⚙️ Max workers: {max_workers}")
        
        # Get available profiles
        profiles = self.get_available_profiles(max_profiles)
        if not profiles:
            self.logger.error("❌ No profiles available for batch automation")
            return []
        
        results = []
        
        # Run automation with thread pool
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            # Submit tasks
            future_to_profile = {
                executor.submit(self.run_single_profile_automation, profile, target_urls): profile
                for profile in profiles
            }
            
            # Collect results
            for future in as_completed(future_to_profile):
                profile = future_to_profile[future]
                
                try:
                    result = future.result()
                    results.append(result)
                    
                    status_icon = "✅" if result["status"] == "success" else "❌"
                    self.logger.info(f"{status_icon} {profile.name}: {result['status']}")
                    
                    if result["status"] == "success":
                        self.logger.info(f"   URLs visited: {len(result['urls_visited'])}")
                        self.logger.info(f"   Total pages: {sum(len(s.get('pages_visited', [])) for s in result['browsing_sessions'])}")
                    else:
                        self.logger.error(f"   Errors: {len(result['errors'])}")
                        
                except Exception as e:
                    self.logger.error(f"❌ Error with profile {profile.name}: {e}")
                    results.append({
                        "profile_name": profile.name,
                        "profile_id": profile.profile_id,
                        "status": "error",
                        "errors": [str(e)],
                        "start_time": datetime.now().isoformat(),
                        "end_time": datetime.now().isoformat()
                    })
        
        return results
    
    def save_batch_results(self, results: List[Dict], filename: str = None):
        """Save batch automation results"""
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"data/batch_results_{timestamp}.json"
        
        try:
            os.makedirs("data", exist_ok=True)
            
            batch_summary = {
                "timestamp": datetime.now().isoformat(),
                "total_profiles": len(results),
                "successful_profiles": len([r for r in results if r["status"] == "success"]),
                "failed_profiles": len([r for r in results if r["status"] == "error"]),
                "total_urls_visited": sum(len(r.get("urls_visited", [])) for r in results),
                "total_errors": sum(len(r.get("errors", [])) for r in results),
                "results": results
            }
            
            with open(filename, 'w') as f:
                json.dump(batch_summary, f, indent=2)
            
            self.logger.info(f"💾 Batch results saved to: {filename}")
            return filename
            
        except Exception as e:
            self.logger.error(f"❌ Error saving batch results: {e}")
            return None
    
    def print_batch_summary(self, results: List[Dict]):
        """Print batch automation summary"""
        self.logger.info("📊 Batch Automation Summary")
        self.logger.info("=" * 50)
        
        total_profiles = len(results)
        successful_profiles = len([r for r in results if r["status"] == "success"])
        failed_profiles = len([r for r in results if r["status"] == "error"])
        
        total_urls = sum(len(r.get("urls_visited", [])) for r in results)
        total_errors = sum(len(r.get("errors", [])) for r in results)
        
        self.logger.info(f"📈 Total Profiles: {total_profiles}")
        self.logger.info(f"✅ Successful: {successful_profiles}")
        self.logger.info(f"❌ Failed: {failed_profiles}")
        self.logger.info(f"🌐 URLs Visited: {total_urls}")
        self.logger.info(f"⚠️ Total Errors: {total_errors}")
        
        if successful_profiles > 0:
            success_rate = (successful_profiles / total_profiles) * 100
            self.logger.info(f"📊 Success Rate: {success_rate:.1f}%")
        
        # Show individual profile results
        self.logger.info("\n📋 Individual Profile Results:")
        for result in results:
            status_icon = "✅" if result["status"] == "success" else "❌"
            profile_name = result["profile_name"]
            urls_count = len(result.get("urls_visited", []))
            errors_count = len(result.get("errors", []))
            
            self.logger.info(f"   {status_icon} {profile_name}: {urls_count} URLs, {errors_count} errors")

def main():
    """Main function for batch automation example"""
    logging.getLogger().info("🚀 Batch Automation Example")
    logging.getLogger().info("=" * 50)
    
    try:
        # Initialize batch automation
        batch_automation = BatchAutomation()
        
        # Define target URLs for testing
        target_urls = [
            "https://example.com",
            "https://httpbin.org/ip",
            "https://httpbin.org/user-agent",
            "https://httpbin.org/headers"
        ]
        
        # Run batch automation
        results = batch_automation.run_batch_automation(
            target_urls=target_urls,
            max_profiles=3,
            max_workers=2
        )
        
        # Print summary
        batch_automation.print_batch_summary(results)
        
        # Save results
        results_file = batch_automation.save_batch_results(results)
        
        if results_file:
            logging.getLogger().info(f"💾 Results saved to: {results_file}")
        
        logging.getLogger().info("🎉 Batch automation example completed!")
        
    except Exception as e:
        logging.getLogger().error(f"❌ Batch automation failed: {e}")

if __name__ == "__main__":
    setup_logging()
    main()
