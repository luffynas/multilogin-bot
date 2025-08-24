#!/usr/bin/env python3
"""
URL Helper Module
================
Helper functions for handling URLs in Selenium automation
"""

import time
import logging

def get_real_url_from_profile(automation, fallback_url=None):
    """
    Get the real URL from profile's address bar (not DevTools)
    
    Args:
        automation: UndetectableSeleniumAutomation instance
        fallback_url: URL to navigate to if switching tabs fails
    
    Returns:
        tuple: (real_url, success_message)
    """
    try:
        # Wait for profile to load
        time.sleep(5)
        
        # Get current URL from Selenium
        selenium_url = automation.driver.current_url
        selenium_title = automation.driver.title
        
        logging.info(f"🔧 Selenium URL: {selenium_url}")
        logging.info(f"🔧 Selenium Title: {selenium_title}")
        
        # Check if Selenium is accessing DevTools
        if "devtools://" in selenium_url:
            logging.info("⚠️ Selenium is accessing DevTools, switching to main tab...")
            
            # Try to get the real URL by switching to the main tab
            try:
                # Get all window handles
                handles = automation.driver.window_handles
                logging.info(f"📑 Available windows: {len(handles)}")
                
                # Switch to the main tab (usually the first one)
                if len(handles) > 1:
                    logging.info("🔄 Switching to main tab...")
                    automation.driver.switch_to.window(handles[0])
                    time.sleep(2)
                    
                    # Get URL from main tab
                    real_url = automation.driver.current_url
                    real_title = automation.driver.title
                    
                    logging.info(f"🌐 Real URL: {real_url}")
                    logging.info(f"📄 Real Title: {real_title}")
                    
                    if "devtools://" not in real_url:
                        logging.info("✅ Successfully got real URL from main tab")
                        return real_url, "Successfully got real URL from main tab"
                    else:
                        logging.info("❌ Main tab also shows DevTools")
                        if fallback_url:
                            return _navigate_to_fallback(automation, fallback_url)
                        else:
                            return None, "Main tab shows DevTools and no fallback URL provided"
                else:
                    logging.info("❌ Only one window available")
                    if fallback_url:
                        return _navigate_to_fallback(automation, fallback_url)
                    else:
                        return None, "Only one window available and no fallback URL provided"
                
            except Exception as e:
                logging.error(f"❌ Error switching tabs: {e}")
                if fallback_url:
                    return _navigate_to_fallback(automation, fallback_url)
                else:
                    return None, f"Error switching tabs: {e}"
            
        else:
            logging.info("✅ Selenium is accessing the real page")
            return selenium_url, "Selenium is accessing the real page"
        
    except Exception as e:
        logging.error(f"❌ Error getting real URL: {e}")
        return None, f"Error getting real URL: {e}"

def _navigate_to_fallback(automation, fallback_url):
    """Navigate to fallback URL"""
    try:
        logging.info(f"🔄 Navigating to fallback URL: {fallback_url}")
        automation.driver.get(fallback_url)
        time.sleep(3)
        
        real_url = automation.driver.current_url
        real_title = automation.driver.title
        
        logging.info(f"🌐 Navigated URL: {real_url}")
        logging.info(f"📄 Navigated Title: {real_title}")
        
        return real_url, f"Successfully navigated to fallback URL: {real_url}"
        
    except Exception as e:
        logging.error(f"❌ Error navigating to fallback URL: {e}")
        return None, f"Error navigating to fallback URL: {e}"

def is_valid_website_url(url):
    """Check if URL is a valid website (not DevTools, blank, etc.)"""
    invalid_patterns = [
        "devtools://",
        "data:,",
        "about:blank",
        "chrome://",
        "chrome-extension://"
    ]
    
    for pattern in invalid_patterns:
        if pattern in url:
            return False
    return True

def setup_url_for_automation(automation, fallback_url=None):
    """
    Setup URL for automation - get real URL or navigate to fallback
    
    Args:
        automation: UndetectableSeleniumAutomation instance
        fallback_url: URL to navigate to if needed
    
    Returns:
        tuple: (current_url, success_message)
    """
    try:
        # Wait for profile to load
        logging.info("🌐 Waiting for profile to load...")
        time.sleep(5)
        
        # Get real URL from profile
        real_url, message = get_real_url_from_profile(automation, fallback_url)
        
        if real_url:
            logging.info(f"✅ Successfully got URL: {real_url}")
            return real_url, message
        else:
            logging.error(f"❌ Failed to get URL: {message}")
            return None, message
            
    except Exception as e:
        logging.error(f"❌ Error in setup_url_for_automation: {e}")
        return None, f"Error in setup_url_for_automation: {e}"
