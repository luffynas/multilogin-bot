#!/usr/bin/env python3
"""
Minimal test script untuk debugging Script Runner issues
Script ini sangat sederhana untuk mengidentifikasi masalah dasar
"""

import time
import sys
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def main():
    """
    Minimal test function - hanya buka website dan print status
    """
    print("🚀 Starting minimal test script...")
    print(f"🐍 Python version: {sys.version}")
    
    driver = None
    try:
        # Initialize WebDriver
        print("🔧 Initializing WebDriver...")
        driver = webdriver.Chrome()
        print("✅ WebDriver initialized successfully")
        
        # Test basic navigation
        test_url = "https://httpbin.org/ip"
        print(f"🌐 Navigating to: {test_url}")
        
        driver.get(test_url)
        print("✅ Navigation completed")
        
        # Wait for page load
        print("⏳ Waiting for page to load...")
        time.sleep(3)
        
        # Check page title
        title = driver.title
        print(f"📄 Page title: {title}")
        
        # Check if page loaded successfully
        if "httpbin" in title.lower() or "ip" in title.lower():
            print("✅ Page loaded successfully")
            
            # Try to get IP information
            try:
                # Wait for content to load
                wait = WebDriverWait(driver, 10)
                content = wait.until(EC.presence_of_element_located((By.TAG_NAME, "pre")))
                ip_info = content.text
                print(f"🌍 IP Information: {ip_info}")
                print("✅ IP information retrieved successfully")
            except Exception as e:
                print(f"⚠️  Could not get IP info: {e}")
        else:
            print(f"❌ Page did not load correctly. Title: {title}")
            return False
        
        # Test basic interaction
        print("🤖 Testing basic interaction...")
        driver.execute_script("window.scrollTo(0, 100);")
        time.sleep(1)
        print("✅ Basic interaction successful")
        
        # Keep browser open for observation
        print("👀 Keeping browser open for 10 seconds for observation...")
        time.sleep(10)
        
        print("✅ Minimal test script completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error in minimal test script: {str(e)}")
        print(f"❌ Error type: {type(e).__name__}")
        import traceback
        print(f"❌ Traceback: {traceback.format_exc()}")
        return False
    
    finally:
        # Close browser
        if driver:
            try:
                print("🔒 Closing browser...")
                driver.quit()
                print("✅ Browser closed successfully")
            except Exception as e:
                print(f"⚠️  Error closing browser: {e}")

if __name__ == "__main__":
    success = main()
    if success:
        print("\n🎉 Script execution: SUCCESS")
        sys.exit(0)
    else:
        print("\n💥 Script execution: FAILED")
        sys.exit(1)
