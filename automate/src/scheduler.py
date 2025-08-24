"""
Scheduler for Automate Project
Manages profile rotation, proxy rotation, and automation scheduling
"""

import time
import random
import logging
import json
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import yaml
import os
from threading import Thread, Lock
import schedule

from profile_manager import ProfileManager
from selenium_automation import UndetectableSeleniumAutomation

class AutomationScheduler:
    def __init__(self, config_path: str = "../config/config.yaml"):
        """Initialize automation scheduler"""
        self.config = self._load_config(config_path)
        self.profile_manager = ProfileManager(config_path)
        self.selenium_automation = UndetectableSeleniumAutomation(config_path)
        self.logger = logging.getLogger(__name__)
        
        # Scheduler state
        self.is_running = False
        self.active_sessions = {}
        self.session_lock = Lock()
        
        # Load session logs
        self.session_logs_file = self.config['storage']['session_logs_file']
        self.session_logs = self._load_session_logs()
        
    def _load_config(self, config_path: str) -> Dict:
        """Load configuration from YAML file"""
        try:
            with open(config_path, 'r') as file:
                return yaml.safe_load(file)
        except FileNotFoundError:
            raise FileNotFoundError(f"Configuration file not found: {config_path}")
    
    def _load_session_logs(self) -> List[Dict]:
        """Load session logs from file"""
        try:
            if os.path.exists(self.session_logs_file):
                with open(self.session_logs_file, 'r') as file:
                    return json.load(file)
            else:
                return []
        except Exception as e:
            self.logger.error(f"Error loading session logs: {e}")
            return []
    
    def _save_session_logs(self):
        """Save session logs to file"""
        try:
            os.makedirs(os.path.dirname(self.session_logs_file), exist_ok=True)
            with open(self.session_logs_file, 'w') as file:
                json.dump(self.session_logs, file, indent=2)
        except Exception as e:
            self.logger.error(f"Error saving session logs: {e}")
    
    def start_scheduler(self):
        """Start the automation scheduler"""
        if self.is_running:
            self.logger.warning("Scheduler is already running")
            return
        
        self.is_running = True
        self.logger.info("Starting automation scheduler")
        
        # Schedule daily tasks
        self._setup_daily_schedule()
        
        # Start scheduler in background thread
        scheduler_thread = Thread(target=self._run_scheduler, daemon=True)
        scheduler_thread.start()
        
        # Start immediate session if needed
        self._start_immediate_session()
    
    def _setup_daily_schedule(self):
        """Setup daily schedule for automation"""
        # Schedule sessions throughout the day
        schedule.every().day.at("09:00").do(self._run_scheduled_session)
        schedule.every().day.at("12:00").do(self._run_scheduled_session)
        schedule.every().day.at("15:00").do(self._run_scheduled_session)
        schedule.every().day.at("18:00").do(self._run_scheduled_session)
        schedule.every().day.at("21:00").do(self._run_scheduled_session)
        
        # Schedule proxy rotation
        schedule.every().day.at("06:00").do(self._rotate_all_proxies)
        
        # Schedule cleanup
        schedule.every().day.at("03:00").do(self._cleanup_old_sessions)
        
        self.logger.info("Daily schedule configured")
    
    def _run_scheduler(self):
        """Run the scheduler loop"""
        while self.is_running:
            try:
                schedule.run_pending()
                time.sleep(60)  # Check every minute
            except Exception as e:
                self.logger.error(f"Error in scheduler loop: {e}")
                time.sleep(300)  # Wait 5 minutes on error
    
    def _start_immediate_session(self):
        """Start an immediate automation session"""
        try:
            self.logger.info("Starting immediate automation session")
            self._run_automation_session()
        except Exception as e:
            self.logger.error(f"Error starting immediate session: {e}")
    
    def _run_scheduled_session(self):
        """Run a scheduled automation session"""
        try:
            self.logger.info("Running scheduled automation session")
            self._run_automation_session()
        except Exception as e:
            self.logger.error(f"Error in scheduled session: {e}")
    
    def _run_automation_session(self):
        """Run a complete automation session"""
        try:
            # Get available profile
            profile = self.profile_manager.get_available_profile()
            if not profile:
                self.logger.warning("No available profiles for automation")
                return
            
            # Update profile status
            self.profile_manager.update_profile_status(profile.profile_id, "active")
            
            # Start profile
            debugging_url = self.profile_manager.api.start_profile(profile.profile_id)
            if not debugging_url:
                self.logger.error(f"Failed to start profile {profile.profile_id}")
                self.profile_manager.update_profile_status(profile.profile_id, "error")
                return
            
            # Run automation
            session_results = self._execute_automation_session(profile, debugging_url)
            
            # Stop profile
            self.profile_manager.api.stop_profile(profile.profile_id)
            
            # Update profile status
            self.profile_manager.update_profile_status(profile.profile_id, "idle")
            
            # Log session results
            self._log_session_results(profile, session_results)
            
            self.logger.info(f"Completed automation session for profile {profile.name}")
            
        except Exception as e:
            self.logger.error(f"Error in automation session: {e}")
            if 'profile' in locals():
                self.profile_manager.update_profile_status(profile.profile_id, "error")
    
    def _execute_automation_session(self, profile, debugging_url: str) -> List[Dict]:
        """Execute automation session with Selenium"""
        try:
            # Get target URLs
            target_urls = self.config['adsense_testing']['target_websites']
            
            # Run AdSense testing
            results = self.selenium_automation.run_adsense_test_session(
                debugging_url, 
                target_urls
            )
            
            return results
            
        except Exception as e:
            self.logger.error(f"Error executing automation session: {e}")
            return []
    
    def _log_session_results(self, profile, results: List[Dict]):
        """Log session results"""
        try:
            session_log = {
                "profile_id": profile.profile_id,
                "profile_name": profile.name,
                "proxy": profile.proxy,
                "session_start": datetime.now().isoformat(),
                "results": results,
                "total_ads_detected": sum(r.get("ads_detected", 0) for r in results),
                "total_interactions": sum(
                    r.get("interactions", {}).get("impressions", 0) for r in results
                )
            }
            
            self.session_logs.append(session_log)
            
            # Keep only last 1000 sessions
            if len(self.session_logs) > 1000:
                self.session_logs = self.session_logs[-1000:]
            
            self._save_session_logs()
            
        except Exception as e:
            self.logger.error(f"Error logging session results: {e}")
    
    def _rotate_all_proxies(self):
        """Rotate proxies for all profiles"""
        try:
            self.logger.info("Starting proxy rotation for all profiles")
            
            rotated_count = 0
            for profile_id in self.profile_manager.profiles:
                if self.profile_manager.rotate_profile_proxy(profile_id):
                    rotated_count += 1
                    time.sleep(random.uniform(1, 3))  # Delay between rotations
            
            self.logger.info(f"Rotated proxies for {rotated_count} profiles")
            
        except Exception as e:
            self.logger.error(f"Error rotating proxies: {e}")
    
    def _cleanup_old_sessions(self):
        """Clean up old sessions and profiles"""
        try:
            self.logger.info("Starting cleanup of old sessions and profiles")
            
            # Clean up old profiles
            deleted_profiles = self.profile_manager.cleanup_old_profiles(days_old=30)
            
            # Clean up old session logs
            cutoff_date = datetime.now() - timedelta(days=7)
            old_sessions = [
                log for log in self.session_logs 
                if datetime.fromisoformat(log["session_start"]) < cutoff_date
            ]
            
            for session in old_sessions:
                self.session_logs.remove(session)
            
            self._save_session_logs()
            
            self.logger.info(f"Cleanup completed: {deleted_profiles} profiles deleted, {len(old_sessions)} old sessions removed")
            
        except Exception as e:
            self.logger.error(f"Error in cleanup: {e}")
    
    def run_concurrent_sessions(self, max_concurrent: int = None):
        """Run multiple concurrent automation sessions"""
        if max_concurrent is None:
            max_concurrent = self.config['scheduler']['max_concurrent_sessions']
        
        try:
            self.logger.info(f"Starting {max_concurrent} concurrent automation sessions")
            
            # Get available profiles
            available_profiles = []
            for profile in self.profile_manager.profiles.values():
                if profile.status == "idle" and self.profile_manager._can_use_profile(profile):
                    available_profiles.append(profile)
            
            if len(available_profiles) < max_concurrent:
                max_concurrent = len(available_profiles)
                self.logger.warning(f"Only {max_concurrent} profiles available")
            
            # Start concurrent sessions
            threads = []
            for i in range(max_concurrent):
                profile = available_profiles[i]
                thread = Thread(
                    target=self._run_concurrent_session,
                    args=(profile,),
                    daemon=True
                )
                threads.append(thread)
                thread.start()
                
                # Delay between thread starts
                time.sleep(random.uniform(5, 15))
            
            # Wait for all threads to complete
            for thread in threads:
                thread.join()
            
            self.logger.info("All concurrent sessions completed")
            
        except Exception as e:
            self.logger.error(f"Error running concurrent sessions: {e}")
    
    def _run_concurrent_session(self, profile):
        """Run a single concurrent automation session"""
        try:
            self.logger.info(f"Starting concurrent session for profile {profile.name}")
            
            # Update profile status
            self.profile_manager.update_profile_status(profile.profile_id, "active")
            
            # Start profile
            debugging_url = self.profile_manager.api.start_profile(profile.profile_id)
            if not debugging_url:
                self.logger.error(f"Failed to start profile {profile.profile_id}")
                self.profile_manager.update_profile_status(profile.profile_id, "error")
                return
            
            # Run automation
            session_results = self._execute_automation_session(profile, debugging_url)
            
            # Stop profile
            self.profile_manager.api.stop_profile(profile.profile_id)
            
            # Update profile status
            self.profile_manager.update_profile_status(profile.profile_id, "idle")
            
            # Log session results
            self._log_session_results(profile, session_results)
            
            self.logger.info(f"Completed concurrent session for profile {profile.name}")
            
        except Exception as e:
            self.logger.error(f"Error in concurrent session for profile {profile.name}: {e}")
            self.profile_manager.update_profile_status(profile.profile_id, "error")
    
    def get_scheduler_stats(self) -> Dict:
        """Get scheduler statistics"""
        try:
            stats = {
                "is_running": self.is_running,
                "active_sessions": len(self.active_sessions),
                "total_sessions_logged": len(self.session_logs),
                "profile_stats": self.profile_manager.get_profile_stats(),
                "proxy_stats": self.profile_manager.get_proxy_stats(),
                "recent_sessions": self.session_logs[-10:] if self.session_logs else []
            }
            
            return stats
            
        except Exception as e:
            self.logger.error(f"Error getting scheduler stats: {e}")
            return {"error": str(e)}
    
    def stop_scheduler(self):
        """Stop the automation scheduler"""
        self.is_running = False
        self.logger.info("Stopping automation scheduler")
        
        # Stop all active sessions
        with self.session_lock:
            for session_id in list(self.active_sessions.keys()):
                self._stop_session(session_id)
    
    def _stop_session(self, session_id: str):
        """Stop a specific session"""
        try:
            if session_id in self.active_sessions:
                session_info = self.active_sessions[session_id]
                
                # Stop profile
                self.profile_manager.api.stop_profile(session_info["profile_id"])
                
                # Update profile status
                self.profile_manager.update_profile_status(session_info["profile_id"], "idle")
                
                # Remove from active sessions
                del self.active_sessions[session_id]
                
                self.logger.info(f"Stopped session {session_id}")
                
        except Exception as e:
            self.logger.error(f"Error stopping session {session_id}: {e}")
