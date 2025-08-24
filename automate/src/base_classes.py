"""
Base Classes for Automate Project
Provides common functionality to eliminate code duplication
"""

import json
import yaml
import logging
import os
from typing import Dict, Any, Optional
from datetime import datetime
from dataclasses import dataclass, asdict


class ConfigLoader:
    """Base class for configuration loading functionality"""
    
    @staticmethod
    def load_config(config_path: str) -> Dict:
        """Load configuration from YAML file"""
        try:
            with open(config_path, 'r') as file:
                return yaml.safe_load(file)
        except FileNotFoundError:
            raise FileNotFoundError(f"Configuration file not found: {config_path}")
        except Exception as e:
            raise Exception(f"Error loading configuration: {e}")


class DataPersistence:
    """Base class for data persistence functionality"""
    
    @staticmethod
    def save_data(data: Dict, file_path: str, logger: logging.Logger = None) -> bool:
        """Save data to JSON file"""
        try:
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            with open(file_path, 'w') as file:
                json.dump(data, file, indent=2, default=str)
            
            if logger:
                logger.info(f"✅ Data saved to {file_path}")
            return True
            
        except Exception as e:
            if logger:
                logger.error(f"❌ Error saving data to {file_path}: {e}")
            return False
    
    @staticmethod
    def load_data(file_path: str, logger: logging.Logger = None) -> Dict:
        """Load data from JSON file"""
        try:
            if os.path.exists(file_path):
                with open(file_path, 'r') as file:
                    data = json.load(file)
                
                if logger:
                    logger.info(f"✅ Data loaded from {file_path}")
                return data
            else:
                if logger:
                    logger.info(f"📁 No data file found at {file_path}, starting fresh")
                return {}
                
        except Exception as e:
            if logger:
                logger.error(f"❌ Error loading data from {file_path}: {e}")
            return {}


class StatisticsManager:
    """Base class for statistics management functionality"""
    
    @staticmethod
    def get_provider_stats(providers: Dict, logger: logging.Logger = None) -> Dict:
        """Get unified provider statistics"""
        try:
            stats = {}
            for name, provider in providers.items():
                stats[name] = {
                    "enabled": provider.enabled,
                    "active": provider.active,
                    "priority": provider.priority,
                    "protocol": provider.protocol,
                    "data_limit": provider.data_limit,
                    "data_used": provider.data_used,
                    "data_remaining": StatisticsManager._calculate_data_remaining(provider),
                    "success_rate": provider.success_rate,
                    "failure_count": provider.failure_count,
                    "last_used": provider.last_used,
                    "auto_use": provider.auto_use,
                    "fallback_enabled": provider.fallback_enabled
                }
            
            if logger:
                logger.info(f"📊 Provider statistics generated for {len(stats)} providers")
            return stats
            
        except Exception as e:
            if logger:
                logger.error(f"❌ Error generating provider stats: {e}")
            return {}
    
    @staticmethod
    def get_proxy_stats(proxies: Dict, current_provider: str, logger: logging.Logger = None) -> Dict:
        """Get unified proxy statistics"""
        try:
            total_proxies = len(proxies)
            healthy_proxies = sum(1 for p in proxies.values() if p.health_score > 0.7)
            blacklisted_proxies = sum(1 for p in proxies.values() if p.is_blacklisted)
            available_proxies = sum(1 for p in proxies.values() 
                                  if not p.is_blacklisted and p.health_score > 0.5)
            
            # Provider distribution
            provider_stats = {}
            for proxy in proxies.values():
                provider = proxy.provider
                if provider not in provider_stats:
                    provider_stats[provider] = 0
                provider_stats[provider] += 1
            
            stats = {
                "total_proxies": total_proxies,
                "healthy_proxies": healthy_proxies,
                "blacklisted_proxies": blacklisted_proxies,
                "available_proxies": available_proxies,
                "health_percentage": (healthy_proxies / total_proxies * 100) if total_proxies > 0 else 0,
                "availability_percentage": (available_proxies / total_proxies * 100) if total_proxies > 0 else 0,
                "provider_distribution": provider_stats,
                "current_provider": current_provider,
                "protocol": "socks5"  # Always SOCKS5
            }
            
            if logger:
                logger.info(f"📊 Proxy statistics generated: {total_proxies} total, {available_proxies} available")
            return stats
            
        except Exception as e:
            if logger:
                logger.error(f"❌ Error generating proxy stats: {e}")
            return {}
    
    @staticmethod
    def _calculate_data_remaining(provider) -> Optional[float]:
        """Calculate remaining data for provider"""
        try:
            if provider.data_limit:
                return DataPersistence._parse_data_limit(provider.data_limit) - provider.data_used
            return None
        except:
            return None


class BaseManager:
    """Base class for all manager classes"""
    
    def __init__(self, config_path: str = "../config/config.yaml"):
        """Initialize base manager with common functionality"""
        self.config = ConfigLoader.load_config(config_path)
        self.logger = logging.getLogger(self.__class__.__name__)
    
    def _save_data(self, data: Dict, file_path: str) -> bool:
        """Save data using DataPersistence"""
        return DataPersistence.save_data(data, file_path, self.logger)
    
    def _load_data(self, file_path: str) -> Dict:
        """Load data using DataPersistence"""
        return DataPersistence.load_data(file_path, self.logger)


# Utility functions that can be shared across modules
class Utils:
    """Utility functions for common operations"""
    
    @staticmethod
    def parse_data_limit(data_limit: str) -> float:
        """Parse data limit string to MB"""
        try:
            if "GB" in data_limit.upper():
                return float(data_limit.replace("GB", "").replace("gb", "")) * 1024
            elif "MB" in data_limit.upper():
                return float(data_limit.replace("MB", "").replace("mb", ""))
            else:
                return float(data_limit)
        except:
            return 0.0
    
    @staticmethod
    def generate_session_id() -> str:
        """Generate a random session ID"""
        import random
        import string
        return ''.join(random.choices(string.ascii_letters + string.digits, k=8))
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash password using MD5"""
        import hashlib
        return hashlib.md5(password.encode()).hexdigest()
    
    @staticmethod
    def get_random_target_websites(config: Dict, count: int = 5) -> list:
        """Get random target websites from configuration"""
        import random
        
        target_websites = config.get('adsense_testing', {}).get('target_websites', [])
        
        if not target_websites:
            # Fallback to default websites
            return ["https://google.com"]
        
        # Randomly select up to 'count' websites
        if len(target_websites) <= count:
            return target_websites
        else:
            return random.sample(target_websites, count)
