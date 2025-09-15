#!/usr/bin/env python3
"""
Simple test script for Multilogin X Script Runner
This script performs basic browser automation tasks.
"""

import time
import random
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def main():
    """
    Main function for the test script
    """
    print("🚀 Starting simple test script...")
    
    try:
        # Get the WebDriver instance (provided by Multilogin X)
        driver = webdriver.Chrome()
        
        print("✅ WebDriver initialized successfully")
        
        # Navigate to a test website
        test_url = "https://httpbin.org/user-agent"
        print(f"🌐 Navigating to: {test_url}")
        driver.get(test_url)
        
        # Wait for page to load
        time.sleep(2)
        
        # Get page title
        title = driver.title
        print(f"📄 Page title: {title}")
        
        # Get user agent
        try:
            user_agent_element = driver.find_element(By.TAG_NAME, "pre")
            user_agent = user_agent_element.text
            print(f"🔍 User Agent: {user_agent}")
        except Exception as e:
            print(f"⚠️  Could not get user agent: {e}")
        
        # Simulate some human-like behavior
        print("🤖 Simulating human-like behavior...")
        time.sleep(random.uniform(2, 4))
        
        # Scroll down a bit
        driver.execute_script("window.scrollTo(0, 100);")
        time.sleep(random.uniform(1, 2))
        
        # Navigate to another test page
        test_url2 = "https://httpbin.org/ip"
        print(f"🌐 Navigating to: {test_url2}")
        driver.get(test_url2)
        time.sleep(2)
        
        # Get IP information
        try:
            ip_element = driver.find_element(By.TAG_NAME, "pre")
            ip_info = ip_element.text
            print(f"🌍 IP Information: {ip_info}")
        except Exception as e:
            print(f"⚠️  Could not get IP info: {e}")
        
        print("✅ Test script completed successfully!")
        
        # Keep browser open for a bit
        time.sleep(5)
        
    except Exception as e:
        print(f"❌ Error in test script: {str(e)}")
        return False
    
    finally:
        # Close the browser
        try:
            driver.quit()
            print("🔒 Browser closed")
        except:
            pass
    
    return True

if __name__ == "__main__":
    main()
