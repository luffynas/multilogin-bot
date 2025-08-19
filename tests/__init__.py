"""
Testing Framework for Multi-Login Bot
Provides unit tests, integration tests, and test utilities
"""

import os
import sys
import unittest
import tempfile
import yaml
from unittest.mock import Mock, patch, MagicMock

# Add src to path for testing
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

class BaseTestCase(unittest.TestCase):
    """Base test case with common utilities"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.temp_dir = tempfile.mkdtemp()
        self.test_config = self.create_test_config()
    
    def tearDown(self):
        """Clean up test fixtures"""
        import shutil
        shutil.rmtree(self.temp_dir, ignore_errors=True)
    
    def create_test_config(self) -> dict:
        """Create test configuration"""
        return {
            "multilogin": {
                "api_key": "test_api_key",
                "base_url": "http://localhost:35000",
                "max_concurrent_profiles": 5
            },
            "proxy": {
                "provider": "test_provider",
                "type": "socks5",
                "total_count": 10,
                "daily_limit_per_proxy": 1
            },
            "target_website": {
                "url": "https://test-website.com",
                "articles_path": "/test/"
            },
            "behavior": {
                "daily_visits_min": 1,
                "daily_visits_max": 2,
                "session_delay_min": 1,
                "session_delay_max": 2
            },
            "adsense_testing": {
                "enabled": True,
                "max_daily_revenue_test": 0.01
            },
            "error_handling": {
                "max_retries": 2,
                "base_delay": 0.1,
                "max_delay": 1.0
            }
        }
    
    def save_test_config(self, config: dict, filename: str = "test_config.yaml") -> str:
        """Save test configuration to file"""
        config_path = os.path.join(self.temp_dir, filename)
        with open(config_path, 'w') as f:
            yaml.dump(config, f)
        return config_path
    
    def create_mock_session_data(self) -> dict:
        """Create mock session data for testing"""
        return {
            "profile_id": "test_profile_123",
            "proxy_config": {
                "id": "test_proxy_1",
                "host": "test.proxy.com",
                "port": 1080,
                "username": "test_user",
                "password": "test_pass"
            },
            "fingerprint": {
                "user_agent": "Mozilla/5.0 (Test) Chrome/120.0.0.0",
                "timezone": "Asia/Jakarta",
                "screen_resolution": "1920x1080"
            },
            "referer": "https://www.google.com/search?q=test",
            "start_time": 1234567890.0,
            "duration": 300.0,
            "page_views": 2,
            "success": True,
            "interactions": [
                {"type": "scroll", "timestamp": 1234567891.0},
                {"type": "click", "timestamp": 1234567892.0}
            ]
        }
