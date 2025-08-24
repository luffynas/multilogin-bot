"""
Basic Functionality Tests for Automate Project
Tests core components and integration
"""

import unittest
import tempfile
import os
import json
import yaml
from unittest.mock import Mock, patch, MagicMock

# Add src to path
import sys
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from multilogin_api import MultiloginXAPI, ProfileData
from fingerprint_generator import FingerprintGenerator
from proxy_manager import ProxyManager, ProxyInfo
from profile_manager import ProfileManager, ProfileInfo

class TestMultiloginXAPI(unittest.TestCase):
    """Test Multilogin X API functionality"""
    
    def setUp(self):
        """Set up test fixtures"""
        # Create temporary config file
        self.temp_dir = tempfile.mkdtemp()
        self.config_file = os.path.join(self.temp_dir, 'test_config.yaml')
        
        config = {
            'multilogin': {
                'base_url': 'https://api.multilogin.com',
                'launcher_url': 'https://launcher.mlx.yt:45001/api/v2',
                'username': 'test@example.com',
                'password': 'testpassword'
            },
            'proxy': {
                'providers': [{
                    'credentials': {
                        'username': 'proxy_user',
                        'password': 'proxy_pass'
                    }
                }]
            },
            'storage': {
                'profile_data_file': 'data/profiles.json',
                'proxy_usage_file': 'data/proxy_usage.json',
                'session_logs_file': 'data/session_logs.json',
                'fingerprint_cache_file': 'data/fingerprint_cache.json',
                'proxy_health_file': 'data/proxy_health.json'
            }
        }
        
        with open(self.config_file, 'w') as f:
            yaml.dump(config, f)
    
    def tearDown(self):
        """Clean up test fixtures"""
        import shutil
        shutil.rmtree(self.temp_dir)
    
    def test_password_hashing(self):
        """Test password hashing functionality"""
        api = MultiloginXAPI(self.config_file)
        hashed = api._hash_password("testpassword")
        self.assertIsInstance(hashed, str)
        self.assertEqual(len(hashed), 32)  # MD5 hash length
    
    @patch('requests.Session.post')
    def test_authentication(self, mock_post):
        """Test authentication with mock response"""
        # Mock successful authentication response
        mock_response = Mock()
        mock_response.json.return_value = {
            'status': {'http_code': 200},
            'data': {
                'token': 'test_token',
                'refresh_token': 'test_refresh_token'
            }
        }
        mock_response.raise_for_status.return_value = None
        mock_post.return_value = mock_response
        
        api = MultiloginXAPI(self.config_file)
        result = api.authenticate()
        
        self.assertTrue(result)
        self.assertEqual(api.bearer_token, 'test_token')
        self.assertEqual(api.refresh_token, 'test_refresh_token')

class TestFingerprintGenerator(unittest.TestCase):
    """Test fingerprint generation functionality"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.temp_dir = tempfile.mkdtemp()
        self.config_file = os.path.join(self.temp_dir, 'test_config.yaml')
        
        config = {
            'profiles': {
                'geo_default': 'US'
            }
        }
        
        with open(self.config_file, 'w') as f:
            yaml.dump(config, f)
    
    def tearDown(self):
        """Clean up test fixtures"""
        import shutil
        shutil.rmtree(self.temp_dir)
    
    def test_fingerprint_generation(self):
        """Test fingerprint generation"""
        generator = FingerprintGenerator(self.config_file)
        fingerprint = generator.generate_unique_fingerprint("US")
        
        self.assertIsInstance(fingerprint, dict)
        self.assertIn('userAgent', fingerprint)
        self.assertIn('timezone', fingerprint)
        self.assertIn('resolution', fingerprint)
    
    def test_unique_fingerprints(self):
        """Test that generated fingerprints are unique"""
        generator = FingerprintGenerator(self.config_file)
        
        fingerprints = []
        for _ in range(10):
            fingerprint = generator.generate_unique_fingerprint("US")
            fingerprints.append(fingerprint)
        
        # Check that fingerprints are different
        user_agents = [f['userAgent'] for f in fingerprints]
        self.assertEqual(len(set(user_agents)), len(user_agents))

class TestProxyManager(unittest.TestCase):
    """Test proxy management functionality"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.temp_dir = tempfile.mkdtemp()
        self.config_file = os.path.join(self.temp_dir, 'test_config.yaml')
        
        config = {
            'proxy': {
                'total_count': 10,
                'health_check_interval': 300,
                'health_monitoring': {
                    'max_failures': 3,
                    'blacklist_duration': 3600
                }
            },
            'storage': {
                'proxy_health_file': os.path.join(self.temp_dir, 'proxy_health.json')
            }
        }
        
        with open(self.config_file, 'w') as f:
            yaml.dump(config, f)
    
    def tearDown(self):
        """Clean up test fixtures"""
        import shutil
        shutil.rmtree(self.temp_dir)
    
    def test_proxy_creation(self):
        """Test proxy creation and management"""
        manager = ProxyManager(self.config_file)
        
        # Test adding a proxy
        proxy_id = manager.add_proxy(
            host="192.168.1.1",
            port=8080,
            username="test_user",
            password="test_pass",
            country="US"
        )
        
        self.assertIsInstance(proxy_id, str)
        self.assertIn(proxy_id, manager.proxies)
    
    def test_proxy_availability(self):
        """Test proxy availability checking"""
        manager = ProxyManager(self.config_file)
        
        # Add a healthy proxy
        manager.add_proxy(
            host="192.168.1.1",
            port=8080,
            username="test_user",
            password="test_pass",
            country="US"
        )
        
        # Get available proxy
        proxy = manager.get_available_proxy("US")
        self.assertIsNotNone(proxy)
        self.assertEqual(proxy, "192.168.1.1:8080")
    
    def test_proxy_health_tracking(self):
        """Test proxy health tracking"""
        manager = ProxyManager(self.config_file)
        
        # Add a proxy
        manager.add_proxy(
            host="192.168.1.1",
            port=8080,
            username="test_user",
            password="test_pass",
            country="US"
        )
        
        # Mark as failed
        manager.mark_proxy_failed("192.168.1.1:8080", "Test failure")
        
        # Check that proxy is not available
        proxy = manager.get_available_proxy("US")
        self.assertIsNone(proxy)

class TestProfileManager(unittest.TestCase):
    """Test profile management functionality"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.temp_dir = tempfile.mkdtemp()
        self.config_file = os.path.join(self.temp_dir, 'test_config.yaml')
        
        config = {
            'profiles': {
                'total_count': 10,
                'geo_default': 'US',
                'fingerprint': {
                    'tier1_targeting': {
                        'countries': ['US', 'CA', 'GB']
                    }
                }
            },
            'scheduler': {
                'session_spacing_minutes': 30
            },
            'storage': {
                'profile_data_file': os.path.join(self.temp_dir, 'profiles.json'),
                'proxy_health_file': os.path.join(self.temp_dir, 'proxy_health.json')
            }
        }
        
        with open(self.config_file, 'w') as f:
            yaml.dump(config, f)
    
    def tearDown(self):
        """Clean up test fixtures"""
        import shutil
        shutil.rmtree(self.temp_dir)
    
    @patch('src.profile_manager.MultiloginXAPI')
    @patch('src.profile_manager.ProxyManager')
    def test_profile_manager_initialization(self, mock_proxy_manager, mock_api):
        """Test profile manager initialization"""
        manager = ProfileManager(self.config_file)
        
        self.assertIsInstance(manager.profiles, dict)
        self.assertEqual(len(manager.profiles), 0)
    
    def test_profile_stats(self):
        """Test profile statistics"""
        manager = ProfileManager(self.config_file)
        
        # Add a test profile
        profile_info = ProfileInfo(
            profile_id="test_id",
            folder_id="test_folder",
            name="test_profile",
            proxy="192.168.1.1:8080",
            fingerprint={},
            created_at="2024-01-01 00:00:00",
            status="idle"
        )
        
        manager.profiles["test_id"] = profile_info
        
        stats = manager.get_profile_stats()
        
        self.assertEqual(stats['total_profiles'], 1)
        self.assertEqual(stats['idle_profiles'], 1)
        self.assertEqual(stats['active_profiles'], 0)

class TestIntegration(unittest.TestCase):
    """Test integration between components"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.temp_dir = tempfile.mkdtemp()
        self.config_file = os.path.join(self.temp_dir, 'test_config.yaml')
        
        config = {
            'multilogin': {
                'base_url': 'https://api.multilogin.com',
                'launcher_url': 'https://launcher.mlx.yt:45001/api/v2',
                'username': 'test@example.com',
                'password': 'testpassword'
            },
            'profiles': {
                'total_count': 5,
                'geo_default': 'US'
            },
            'proxy': {
                'total_count': 10,
                'health_check_interval': 300,
                'health_monitoring': {
                    'max_failures': 3,
                    'blacklist_duration': 3600
                },
                'providers': [{
                    'credentials': {
                        'username': 'proxy_user',
                        'password': 'proxy_pass'
                    }
                }]
            },
            'scheduler': {
                'session_spacing_minutes': 30
            },
            'storage': {
                'profile_data_file': os.path.join(self.temp_dir, 'profiles.json'),
                'proxy_health_file': os.path.join(self.temp_dir, 'proxy_health.json'),
                'session_logs_file': os.path.join(self.temp_dir, 'session_logs.json'),
                'fingerprint_cache_file': os.path.join(self.temp_dir, 'fingerprint_cache.json')
            }
        }
        
        with open(self.config_file, 'w') as f:
            yaml.dump(config, f)
    
    def tearDown(self):
        """Clean up test fixtures"""
        import shutil
        shutil.rmtree(self.temp_dir)
    
    def test_config_loading(self):
        """Test that all components can load the same config"""
        try:
            api = MultiloginXAPI(self.config_file)
            generator = FingerprintGenerator(self.config_file)
            proxy_manager = ProxyManager(self.config_file)
            profile_manager = ProfileManager(self.config_file)
            
            # If we get here, all components loaded successfully
            self.assertTrue(True)
        except Exception as e:
            self.fail(f"Failed to load components: {e}")

if __name__ == '__main__':
    unittest.main()
