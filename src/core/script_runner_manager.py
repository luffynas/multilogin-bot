import requests
import logging
import time
import json
import os
from typing import Dict, List, Optional
from dataclasses import dataclass
from enum import Enum


class AutomationType(Enum):
    SELENIUM = "selenium"


@dataclass
class ScriptProfile:
    profile_id: str
    is_headless: bool = False


@dataclass
class ScriptConfig:
    script_file: str
    profile_ids: List[ScriptProfile]
    automation_type: AutomationType = AutomationType.SELENIUM


class ScriptRunnerManager:
    """
    Manages Multilogin X Script Runner for safe automation.
    Implements safe script execution to avoid account restrictions.
    """
    
    def __init__(self, launcher_url: str = "https://launcher.mlx.yt:45001"):
        self.launcher_url = launcher_url
        self.logger = logging.getLogger(__name__)
        self.session = requests.Session()
        
        # Safe headers to avoid detection
        self.session.headers.update({
            "Accept": "application/json",
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        })
    
    def start_browser_with_selenium(self, folder_id: str, profile_id: str) -> Optional[int]:
        """
        Start a browser profile with Selenium automation.
        SAFE OPERATION: Uses Multilogin's official automation system.
        """
        try:
            url = f"{self.launcher_url}/api/v1/profile/f/{folder_id}/p/{profile_id}/start"
            params = {"automation_type": "selenium"}
            
            response = self.session.get(url, params=params, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                port = data.get("status", {}).get("message")
                
                if port and port.isdigit():
                    port_num = int(port)
                    self.logger.info(f"Successfully started browser with Selenium on port {port_num}")
                    return port_num
                else:
                    self.logger.error("Invalid port received from launcher")
                    return None
            else:
                self.logger.error(f"Failed to start browser with Selenium: {response.status_code}")
                return None
                
        except Exception as e:
            self.logger.error(f"Error starting browser with Selenium: {e}")
            return None
    
    def start_script_runner(self, script_config: ScriptConfig) -> bool:
        """
        Start Script Runner with specified configuration.
        SAFE OPERATION: Uses Multilogin's official script execution system.
        """
        try:
            url = f"{self.launcher_url}/api/v1/run_script"
            
            payload = {
                "script_file": script_config.script_file,
                "profile_ids": [
                    {
                        "profile_id": profile.profile_id,
                        "is_headless": profile.is_headless
                    }
                    for profile in script_config.profile_ids
                ]
            }
            
            response = self.session.post(url, json=payload, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                results = data.get("data", [])
                
                success_count = 0
                for result in results:
                    if result.get("status") == "success":
                        success_count += 1
                
                self.logger.info(f"Script Runner started successfully: {success_count}/{len(results)} profiles")
                return success_count > 0
            else:
                self.logger.error(f"Failed to start Script Runner: {response.status_code}")
                return False
                
        except Exception as e:
            self.logger.error(f"Error starting Script Runner: {e}")
            return False
    
    def stop_script_runner(self, profile_ids: List[str]) -> bool:
        """
        Stop Script Runner for specified profiles.
        SAFE OPERATION: Graceful shutdown, doesn't corrupt profiles.
        """
        try:
            url = f"{self.launcher_url}/api/v1/profile/stop_script"
            
            payload = {"profile_ids": profile_ids}
            
            response = self.session.post(url, json=payload, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                results = data.get("data", [])
                
                stopped_count = 0
                for result in results:
                    if result.get("status") == "stopped":
                        stopped_count += 1
                
                self.logger.info(f"Script Runner stopped successfully: {stopped_count}/{len(results)} profiles")
                return stopped_count > 0
            else:
                self.logger.error(f"Failed to stop Script Runner: {response.status_code}")
                return False
                
        except Exception as e:
            self.logger.error(f"Error stopping Script Runner: {e}")
            return False
    
    def get_available_scripts(self) -> List[str]:
        """
        Get list of available scripts.
        SAFE OPERATION: Read-only, doesn't modify anything.
        """
        try:
            url = f"{self.launcher_url}/api/v1/scripts"
            
            response = self.session.get(url, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                scripts = data.get("data", [])
                self.logger.info(f"Retrieved {len(scripts)} available scripts")
                return scripts
            else:
                self.logger.error(f"Failed to get available scripts: {response.status_code}")
                return []
                
        except Exception as e:
            self.logger.error(f"Error getting available scripts: {e}")
            return []
    
    def create_safe_adsense_script(self, script_name: str = "adsense_testing.py") -> bool:
        """
        Create a safe AdSense testing script.
        SAFE: Creates script with conservative settings to avoid detection.
        """
        try:
            script_content = '''#!/usr/bin/env python3
"""
Safe AdSense Testing Script for Multilogin X
Implements conservative behavior to avoid account restrictions.
"""

import time
import random
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options


def safe_adsense_testing():
    """
    Safe AdSense testing with conservative behavior.
    """
    try:
        # Conservative Chrome options
        chrome_options = Options()
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-blink-features=AutomationControlled")
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        chrome_options.add_experimental_option('useAutomationExtension', False)
        
        # Initialize driver
        driver = webdriver.Chrome(options=chrome_options)
        driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        
        # Safe navigation to Google
        driver.get("https://www.google.com")
        time.sleep(random.uniform(2, 4))  # Random delay
        
        # Safe search behavior
        search_box = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.NAME, "q"))
        )
        
        # Type slowly like human
        search_terms = ["personal loans", "mortgage rates", "credit cards"]
        search_term = random.choice(search_terms)
        
        for char in search_term:
            search_box.send_keys(char)
            time.sleep(random.uniform(0.1, 0.3))
        
        time.sleep(random.uniform(1, 2))
        search_box.submit()
        
        # Wait for results
        time.sleep(random.uniform(3, 5))
        
        # Safe scrolling
        for _ in range(3):
            driver.execute_script("window.scrollBy(0, 300);")
            time.sleep(random.uniform(1, 2))
        
        # Conservative AdSense interaction
        ads = driver.find_elements(By.CSS_SELECTOR, "[data-ad-client]")
        
        if ads:
            # Only interact with first ad, conservatively
            first_ad = ads[0]
            
            # Scroll to ad
            driver.execute_script("arguments[0].scrollIntoView();", first_ad)
            time.sleep(random.uniform(2, 4))
            
            # Conservative click probability (low)
            if random.random() < 0.1:  # 10% chance
                try:
                    first_ad.click()
                    time.sleep(random.uniform(5, 8))
                    driver.back()
                    time.sleep(random.uniform(2, 4))
                except:
                    pass  # Safe fail
        
        # Safe browsing time
        time.sleep(random.uniform(10, 15))
        
        # Clean exit
        driver.quit()
        
    except Exception as e:
        print(f"Safe AdSense testing error: {e}")
        try:
            driver.quit()
        except:
            pass


if __name__ == "__main__":
    safe_adsense_testing()
'''
            
            # Get script directory
            script_dir = self._get_script_directory()
            script_path = os.path.join(script_dir, script_name)
            
            # Write script
            with open(script_path, 'w') as f:
                f.write(script_content)
            
            self.logger.info(f"Successfully created safe AdSense script: {script_path}")
            return True
            
        except Exception as e:
            self.logger.error(f"Error creating safe AdSense script: {e}")
            return False
    
    def _get_script_directory(self) -> str:
        """
        Get the default script directory based on OS.
        SAFE: Returns path without modifying anything.
        """
        import platform
        
        system = platform.system().lower()
        username = os.getenv('USERNAME') or os.getenv('USER')
        
        if system == "windows":
            return f"C:\\Users\\{username}\\mlx\\deps\\scripts"
        elif system == "darwin":  # macOS
            return f"/Users/{username}/mlx/deps/scripts"
        else:  # Linux
            return f"/home/{username}/mlx/deps/scripts"
    
    def safe_script_execution(self, profile_ids: List[str], script_name: str = "adsense_testing.py") -> bool:
        """
        Safely execute script on multiple profiles.
        IMPLEMENTATION: Uses conservative settings, maintains profile consistency.
        """
        try:
            # Create safe script if it doesn't exist
            if not self._script_exists(script_name):
                self.create_safe_adsense_script(script_name)
            
            # Prepare script configuration
            script_profiles = [
                ScriptProfile(profile_id=pid, is_headless=False)
                for pid in profile_ids
            ]
            
            script_config = ScriptConfig(
                script_file=script_name,
                profile_ids=script_profiles,
                automation_type=AutomationType.SELENIUM
            )
            
            # Execute script
            success = self.start_script_runner(script_config)
            
            if success:
                self.logger.info(f"Successfully executed safe script on {len(profile_ids)} profiles")
                return True
            else:
                self.logger.error("Failed to execute safe script")
                return False
                
        except Exception as e:
            self.logger.error(f"Error in safe script execution: {e}")
            return False
    
    def _script_exists(self, script_name: str) -> bool:
        """
        Check if script exists in default directory.
        SAFE: Read-only check.
        """
        try:
            script_dir = self._get_script_directory()
            script_path = os.path.join(script_dir, script_name)
            return os.path.exists(script_path)
        except:
            return False
    
    def get_script_execution_status(self, profile_ids: List[str]) -> Dict[str, str]:
        """
        Get execution status for profiles.
        SAFE: Read-only status check.
        """
        try:
            # This would typically check the status of running scripts
            # For now, return a safe status
            status = {}
            for profile_id in profile_ids:
                status[profile_id] = "unknown"  # Safe default
            
            return status
            
        except Exception as e:
            self.logger.error(f"Error getting script execution status: {e}")
            return {}
