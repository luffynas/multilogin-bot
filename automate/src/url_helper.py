#!/usr/bin/env python3
"""
URL Helper Module
================
Helper functions for handling URLs in Selenium automation
"""

import time
import logging
import random

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

def setup_url_for_automation(automation, fallback_url=None, stealth_mode=True):
    """
    Setup URL for automation with stealth navigation
    
    Args:
        automation: UndetectableSeleniumAutomation instance
        fallback_url: URL to navigate to if needed
        stealth_mode: Use stealth navigation patterns
    
    Returns:
        tuple: (current_url, success_message)
    """
    try:
        # Wait for profile to load
        logging.info("🌐 Waiting for profile to load...")
        time.sleep(5)
        
        # Get current URL from profile
        current_url = automation.driver.current_url
        logging.info(f"🔍 Current URL: {current_url}")
        
        # Check if URL is valid (not blank, devtools, etc.)
        if is_valid_website_url(current_url) and current_url != "about:blank":
            logging.info(f"✅ Profile already has valid URL: {current_url}")
            return current_url, "Profile already has valid URL"
        
        # If URL is blank or invalid, navigate with stealth
        if stealth_mode and fallback_url:
            return _stealth_navigate_to_url(automation, fallback_url)
        elif fallback_url:
            return _navigate_to_fallback(automation, fallback_url)
        else:
            logging.error("❌ No valid URL and no fallback provided")
            return None, "No valid URL and no fallback provided"
            
    except Exception as e:
        logging.error(f"❌ Error in setup_url_for_automation: {e}")
        return None, f"Error in setup_url_for_automation: {e}"

def _stealth_navigate_to_url(automation, target_url):
    """
    Navigate to URL using stealth patterns to avoid detection
    
    Args:
        automation: UndetectableSeleniumAutomation instance
        target_url: URL to navigate to
    
    Returns:
        tuple: (current_url, success_message)
    """
    try:
        logging.info(f"🕵️ Stealth navigation to: {target_url}")
        
        # Simulate human-like behavior before navigation
        _simulate_pre_navigation_behavior(automation)
        
        # Navigate to URL
        automation.driver.get(target_url)
        
        # Wait for page load with realistic timing
        _wait_for_page_load(automation)
        
        # Simulate post-navigation behavior
        _simulate_post_navigation_behavior(automation)
        
        # Get final URL
        final_url = automation.driver.current_url
        final_title = automation.driver.title
        
        logging.info(f"✅ Stealth navigation successful: {final_url}")
        logging.info(f"📄 Page title: {final_title}")
        
        return final_url, f"Stealth navigation successful: {final_url}"
        
    except Exception as e:
        logging.error(f"❌ Error in stealth navigation: {e}")
        return None, f"Error in stealth navigation: {e}"

def _simulate_pre_navigation_behavior(automation):
    """Simulate human behavior before navigation"""
    try:
        # Random delay before navigation (human thinking time)
        thinking_time = random.uniform(1.0, 3.0)
        time.sleep(thinking_time)
        
        # Sometimes move mouse (simulate user interaction)
        if random.random() < 0.3:
            automation._simulate_mouse_movement()
        
        # Sometimes scroll slightly (simulate user checking current page)
        if random.random() < 0.2:
            automation.driver.execute_script("window.scrollBy(0, 100);")
            time.sleep(random.uniform(0.5, 1.5))
        
    except Exception as e:
        logging.debug(f"Pre-navigation behavior simulation failed: {e}")

def _wait_for_page_load(automation):
    """Wait for page to load with realistic timing"""
    try:
        # Wait for page to start loading
        time.sleep(random.uniform(1.0, 2.0))
        
        # Wait for page to be ready
        max_wait = 30
        wait_time = 0
        
        while wait_time < max_wait:
            try:
                # Check if page is loaded
                ready_state = automation.driver.execute_script("return document.readyState;")
                if ready_state == "complete":
                    break
                
                time.sleep(1)
                wait_time += 1
                
            except Exception:
                # If script fails, assume page is loaded
                break
        
        # Additional random wait (human behavior)
        extra_wait = random.uniform(1.0, 3.0)
        time.sleep(extra_wait)
        
    except Exception as e:
        logging.debug(f"Page load wait failed: {e}")

def _simulate_post_navigation_behavior(automation):
    """Simulate human behavior after navigation"""
    try:
        # Random delay after page load (human reading time)
        reading_time = random.uniform(2.0, 5.0)
        time.sleep(reading_time)
        
        # Sometimes scroll slightly (simulate user checking page)
        if random.random() < 0.4:
            scroll_amount = random.randint(50, 200)
            automation.driver.execute_script(f"window.scrollBy(0, {scroll_amount});")
            time.sleep(random.uniform(0.5, 1.5))
        
        # Sometimes move mouse (simulate user interaction)
        if random.random() < 0.3:
            automation._simulate_mouse_movement()
        
    except Exception as e:
        logging.debug(f"Post-navigation behavior simulation failed: {e}")
