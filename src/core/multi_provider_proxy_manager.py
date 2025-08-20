"""
Multi-Provider Proxy Manager
Supports multiple proxy providers with unified interface
"""

import requests
import time
import json
import random
from typing import Dict, List, Optional, Tuple, Any
import logging
from datetime import datetime, timedelta
import hashlib

class MultiProviderProxyManager:
    """Manages multiple proxy providers with unified interface"""
    
    def __init__(self, config: Dict):
        self.config = config
        self.logger = logging.getLogger(__name__)
        
        # Supported proxy providers
        self.provider_configs = {
            "oxylabs": {
                "name": "Oxylabs",
                "api_base": "https://proxy.oxylabs.io",
                "auth_type": "basic",
                "proxy_format": "username:password@host:port",
                "rotation_type": "session",
                "features": ["residential", "datacenter", "mobile", "isp"],
                "protocols": ["http", "https", "socks5"],
                "geo_locations": ["US", "GB", "DE", "FR", "CA", "AU", "JP", "BR", "IN", "ID"]
            },
            "brightdata": {
                "name": "Bright Data",
                "api_base": "https://brd.superproxy.io",
                "auth_type": "basic",
                "proxy_format": "username:password@host:port",
                "rotation_type": "session",
                "features": ["residential", "datacenter", "mobile", "isp"],
                "protocols": ["http", "https", "socks5"],
                "geo_locations": ["US", "GB", "DE", "FR", "CA", "AU", "JP", "BR", "IN", "ID"]
            },
            "socksescort": {
                "name": "SocksEscort",
                "api_base": "https://api.socksescort.com",
                "auth_type": "basic",
                "proxy_format": "username:password@host:port",
                "rotation_type": "session",
                "features": ["residential", "datacenter"],
                "protocols": ["socks5", "http", "https"],
                "geo_locations": ["US", "GB", "DE", "FR", "CA", "AU", "JP", "BR", "IN", "ID"]
            },
            "nodemaven": {
                "name": "NodeMaven",
                "api_base": "https://api.nodemaven.com",
                "auth_type": "basic",
                "proxy_format": "username:password@host:port",
                "rotation_type": "session",
                "features": ["residential", "datacenter"],
                "protocols": ["http", "https", "socks5"],
                "geo_locations": ["US", "GB", "DE", "FR", "CA", "AU", "JP", "BR", "IN", "ID"]
            },
            "decodo": {
                "name": "Decodo",
                "api_base": "https://api.decodo.com",
                "auth_type": "basic",
                "proxy_format": "username:password@host:port",
                "rotation_type": "session",
                "features": ["residential", "datacenter"],
                "protocols": ["http", "https", "socks5"],
                "geo_locations": ["US", "GB", "DE", "FR", "CA", "AU", "JP", "BR", "IN", "ID"]
            },
            "proxyempire": {
                "name": "ProxyEmpire",
                "api_base": "https://api.proxyempire.io",
                "auth_type": "basic",
                "proxy_format": "username:password@host:port",
                "rotation_type": "session",
                "features": ["residential", "datacenter"],
                "protocols": ["http", "https", "socks5"],
                "geo_locations": ["US", "GB", "DE", "FR", "CA", "AU", "JP", "BR", "IN", "ID"]
            },
            "netnut": {
                "name": "NetNut",
                "api_base": "https://api.netnut.io",
                "auth_type": "basic",
                "proxy_format": "username:password@host:port",
                "rotation_type": "session",
                "features": ["isp", "residential"],
                "protocols": ["http", "https"],
                "geo_locations": ["US", "GB", "DE", "FR", "CA", "AU", "JP", "BR", "IN", "ID"]
            },
            "soax": {
                "name": "SOAX",
                "api_base": "https://api.soax.com",
                "auth_type": "basic",
                "proxy_format": "username:password@host:port",
                "rotation_type": "session",
                "features": ["residential", "datacenter", "mobile"],
                "protocols": ["http", "https", "socks5"],
                "geo_locations": ["US", "GB", "DE", "FR", "CA", "AU", "JP", "BR", "IN", "ID"]
            },
            "iproyal": {
                "name": "IPRoyal",
                "api_base": "https://api.iproyal.com",
                "auth_type": "basic",
                "proxy_format": "username:password@host:port",
                "rotation_type": "session",
                "features": ["residential", "datacenter"],
                "protocols": ["http", "https", "socks5"],
                "geo_locations": ["US", "GB", "DE", "FR", "CA", "AU", "JP", "BR", "IN", "ID"]
            }
        }
        
        # Production monitoring settings
        self.alert_threshold = config.get("proxy", {}).get("alert_threshold", 0.2)
        self.critical_threshold = config.get("proxy", {}).get("critical_threshold", 0.1)
        self.auto_fallback = config.get("proxy", {}).get("auto_fallback", True)
        self.fallback_delay = config.get("proxy", {}).get("fallback_delay", 60)
        self.max_fallback_retries = config.get("proxy", {}).get("max_fallback_retries", 3)
        
        # Unified multi-provider configuration
        self.provider_list = config.get("proxy", {}).get("providers", [])
        
        # Initialize current provider from primary provider in list
        self.current_provider, self.current_provider_index = self._find_primary_provider()
        self.provider_config = self.provider_configs.get(self.current_provider, {})
        self.fallback_attempts = 0
        
        # Log initialization
        if self.provider_list:
            self.logger.info(f"Unified multi-provider mode enabled with {len(self.provider_list)} providers")
            self.logger.info(f"Primary provider: {self.current_provider} (priority {self.current_provider_index + 1})")
        else:
            # Fallback to default if no providers configured
            self.current_provider = "oxylabs"
            self.current_provider_index = 0
            self.logger.warning("No providers configured, using default: oxylabs")
        
        # Proxy pool management
        self.proxy_pool = []
        self.active_proxies = {}
        self.proxy_usage_stats = {}
        
        # Authentication from provider credentials
        self.username, self.password = self._get_current_credentials()
        
        # Load proxy pool
        self.load_proxy_pool()
    
    def _find_primary_provider(self) -> tuple[str, int]:
        """Find primary provider from providers list"""
        if not self.provider_list:
            return "oxylabs", 0
        
        # Look for provider marked as primary
        for i, provider in enumerate(self.provider_list):
            if provider.get("primary", False):
                return provider["name"], i
        
        # If no primary, use first enabled provider
        for i, provider in enumerate(self.provider_list):
            if provider.get("enabled", True):
                return provider["name"], i
        
        # Fallback to first provider
        return self.provider_list[0]["name"], 0
    
    def _get_current_credentials(self) -> tuple[str, str]:
        """Get credentials for current provider"""
        if not self.provider_list:
            return None, None
        
        current_provider_config = self.provider_list[self.current_provider_index]
        credentials = current_provider_config.get("credentials", {})
        
        return credentials.get("username"), credentials.get("password")
    
    def _get_credentials_for_provider(self, provider_config: Dict) -> tuple[str, str]:
        """Get credentials for specific provider"""
        credentials = provider_config.get("credentials", {})
        return credentials.get("username"), credentials.get("password")
    
    def _find_provider_index(self, provider_name: str) -> int:
        """Find provider index in multi-provider list"""
        for i, provider in enumerate(self.provider_list):
            if provider.get("name") == provider_name:
                return i
        return 0  # Default to first provider if not found
    
    def load_proxy_pool(self):
        """Load proxy pool based on provider"""
        try:
            if self.current_provider == "socksescort":
                self.proxy_pool = self.load_socksescort_proxies()
            elif self.current_provider == "oxylabs":
                self.proxy_pool = self.load_oxylabs_proxies()
            elif self.current_provider == "brightdata":
                self.proxy_pool = self.load_brightdata_proxies()
            elif self.current_provider == "nodemaven":
                self.proxy_pool = self.load_nodemaven_proxies()
            elif self.current_provider == "decodo":
                self.proxy_pool = self.load_decodo_proxies()
            elif self.current_provider == "proxyempire":
                self.proxy_pool = self.load_proxyempire_proxies()
            elif self.current_provider == "netnut":
                self.proxy_pool = self.load_netnut_proxies()
            elif self.current_provider == "soax":
                self.proxy_pool = self.load_soax_proxies()
            elif self.current_provider == "iproyal":
                self.proxy_pool = self.load_iproyal_proxies()
            else:
                self.logger.warning(f"Unknown provider: {self.current_provider}")
                self.proxy_pool = []
                
        except Exception as e:
            self.logger.error(f"Error loading proxy pool for {self.current_provider}: {str(e)}")
            self.proxy_pool = []
    
    def load_socksescort_proxies(self) -> List[Dict]:
        """Load SocksEscort proxies"""
        proxies = []
        
        try:
            # SocksEscort API endpoint
            api_url = f"{self.provider_config['api_base']}/proxies"
            
            headers = {
                "Authorization": f"Basic {self._encode_credentials()}",
                "Content-Type": "application/json"
            }
            
            response = requests.get(api_url, headers=headers, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                
                for proxy in data.get("proxies", []):
                    proxy_config = {
                        "id": proxy.get("id", f"socksescort_{len(proxies)}"),
                        "host": proxy.get("host"),
                        "port": proxy.get("port"),
                        "username": self.username,
                        "password": self.password,
                        "type": "socks5",
                        "provider": "socksescort",
                        "geo": proxy.get("country", "US"),
                        "city": proxy.get("city", "Unknown"),
                        "isp": proxy.get("isp", "Unknown"),
                        "speed": proxy.get("speed", 100),
                        "uptime": proxy.get("uptime", 99.9),
                        "last_check": time.time()
                    }
                    proxies.append(proxy_config)
                    
            else:
                self.logger.error(f"SocksEscort API error: {response.status_code} - {response.text}")
                
        except Exception as e:
            self.logger.error(f"Error loading SocksEscort proxies: {str(e)}")
        
        return proxies
    
    def load_oxylabs_proxies(self) -> List[Dict]:
        """Load Oxylabs proxies"""
        proxies = []
        
        try:
            # Oxylabs API endpoint
            api_url = f"{self.provider_config['api_base']}/proxies"
            
            headers = {
                "Authorization": f"Basic {self._encode_credentials()}",
                "Content-Type": "application/json"
            }
            
            response = requests.get(api_url, headers=headers, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                
                for proxy in data.get("proxies", []):
                    proxy_config = {
                        "id": proxy.get("id", f"oxylabs_{len(proxies)}"),
                        "host": proxy.get("host"),
                        "port": proxy.get("port"),
                        "username": self.username,
                        "password": self.password,
                        "type": "socks5",
                        "provider": "oxylabs",
                        "geo": proxy.get("country", "US"),
                        "city": proxy.get("city", "Unknown"),
                        "isp": proxy.get("isp", "Unknown"),
                        "speed": proxy.get("speed", 100),
                        "uptime": proxy.get("uptime", 99.9),
                        "last_check": time.time()
                    }
                    proxies.append(proxy_config)
                    
            else:
                self.logger.error(f"Oxylabs API error: {response.status_code} - {response.text}")
                
        except Exception as e:
            self.logger.error(f"Error loading Oxylabs proxies: {str(e)}")
        
        return proxies
    
    def load_brightdata_proxies(self) -> List[Dict]:
        """Load Bright Data proxies"""
        proxies = []
        
        try:
            # Bright Data API endpoint
            api_url = f"{self.provider_config['api_base']}/proxies"
            
            headers = {
                "Authorization": f"Basic {self._encode_credentials()}",
                "Content-Type": "application/json"
            }
            
            response = requests.get(api_url, headers=headers, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                
                for proxy in data.get("proxies", []):
                    proxy_config = {
                        "id": proxy.get("id", f"brightdata_{len(proxies)}"),
                        "host": proxy.get("host"),
                        "port": proxy.get("port"),
                        "username": self.username,
                        "password": self.password,
                        "type": "socks5",
                        "provider": "brightdata",
                        "geo": proxy.get("country", "US"),
                        "city": proxy.get("city", "Unknown"),
                        "isp": proxy.get("isp", "Unknown"),
                        "speed": proxy.get("speed", 100),
                        "uptime": proxy.get("uptime", 99.9),
                        "last_check": time.time()
                    }
                    proxies.append(proxy_config)
                    
            else:
                self.logger.error(f"Bright Data API error: {response.status_code} - {response.text}")
                
        except Exception as e:
            self.logger.error(f"Error loading Bright Data proxies: {str(e)}")
        
        return proxies
    
    def load_nodemaven_proxies(self) -> List[Dict]:
        """Load NodeMaven proxies"""
        proxies = []
        
        try:
            # NodeMaven API endpoint
            api_url = f"{self.provider_config['api_base']}/proxies"
            
            headers = {
                "Authorization": f"Basic {self._encode_credentials()}",
                "Content-Type": "application/json"
            }
            
            response = requests.get(api_url, headers=headers, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                
                for proxy in data.get("proxies", []):
                    proxy_config = {
                        "id": proxy.get("id", f"nodemaven_{len(proxies)}"),
                        "host": proxy.get("host"),
                        "port": proxy.get("port"),
                        "username": self.username,
                        "password": self.password,
                        "type": "socks5",
                        "provider": "nodemaven",
                        "geo": proxy.get("country", "US"),
                        "city": proxy.get("city", "Unknown"),
                        "isp": proxy.get("isp", "Unknown"),
                        "speed": proxy.get("speed", 100),
                        "uptime": proxy.get("uptime", 99.9),
                        "last_check": time.time()
                    }
                    proxies.append(proxy_config)
                    
            else:
                self.logger.error(f"NodeMaven API error: {response.status_code} - {response.text}")
                
        except Exception as e:
            self.logger.error(f"Error loading NodeMaven proxies: {str(e)}")
        
        return proxies
    
    def load_decodo_proxies(self) -> List[Dict]:
        """Load Decodo proxies"""
        proxies = []
        
        try:
            # Decodo API endpoint
            api_url = f"{self.provider_config['api_base']}/proxies"
            
            headers = {
                "Authorization": f"Basic {self._encode_credentials()}",
                "Content-Type": "application/json"
            }
            
            response = requests.get(api_url, headers=headers, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                
                for proxy in data.get("proxies", []):
                    proxy_config = {
                        "id": proxy.get("id", f"decodo_{len(proxies)}"),
                        "host": proxy.get("host"),
                        "port": proxy.get("port"),
                        "username": self.username,
                        "password": self.password,
                        "type": "socks5",
                        "provider": "decodo",
                        "geo": proxy.get("country", "US"),
                        "city": proxy.get("city", "Unknown"),
                        "isp": proxy.get("isp", "Unknown"),
                        "speed": proxy.get("speed", 100),
                        "uptime": proxy.get("uptime", 99.9),
                        "last_check": time.time()
                    }
                    proxies.append(proxy_config)
                    
            else:
                self.logger.error(f"Decodo API error: {response.status_code} - {response.text}")
                
        except Exception as e:
            self.logger.error(f"Error loading Decodo proxies: {str(e)}")
        
        return proxies
    
    def load_proxyempire_proxies(self) -> List[Dict]:
        """Load ProxyEmpire proxies"""
        proxies = []
        
        try:
            # ProxyEmpire API endpoint
            api_url = f"{self.provider_config['api_base']}/proxies"
            
            headers = {
                "Authorization": f"Basic {self._encode_credentials()}",
                "Content-Type": "application/json"
            }
            
            response = requests.get(api_url, headers=headers, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                
                for proxy in data.get("proxies", []):
                    proxy_config = {
                        "id": proxy.get("id", f"proxyempire_{len(proxies)}"),
                        "host": proxy.get("host"),
                        "port": proxy.get("port"),
                        "username": self.username,
                        "password": self.password,
                        "type": "socks5",
                        "provider": "proxyempire",
                        "geo": proxy.get("country", "US"),
                        "city": proxy.get("city", "Unknown"),
                        "isp": proxy.get("isp", "Unknown"),
                        "speed": proxy.get("speed", 100),
                        "uptime": proxy.get("uptime", 99.9),
                        "last_check": time.time()
                    }
                    proxies.append(proxy_config)
                    
            else:
                self.logger.error(f"ProxyEmpire API error: {response.status_code} - {response.text}")
                
        except Exception as e:
            self.logger.error(f"Error loading ProxyEmpire proxies: {str(e)}")
        
        return proxies
    
    def load_netnut_proxies(self) -> List[Dict]:
        """Load NetNut proxies"""
        proxies = []
        
        try:
            # NetNut API endpoint
            api_url = f"{self.provider_config['api_base']}/proxies"
            
            headers = {
                "Authorization": f"Basic {self._encode_credentials()}",
                "Content-Type": "application/json"
            }
            
            response = requests.get(api_url, headers=headers, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                
                for proxy in data.get("proxies", []):
                    proxy_config = {
                        "id": proxy.get("id", f"netnut_{len(proxies)}"),
                        "host": proxy.get("host"),
                        "port": proxy.get("port"),
                        "username": self.username,
                        "password": self.password,
                        "type": "http",  # NetNut primarily uses HTTP
                        "provider": "netnut",
                        "geo": proxy.get("country", "US"),
                        "city": proxy.get("city", "Unknown"),
                        "isp": proxy.get("isp", "Unknown"),
                        "speed": proxy.get("speed", 100),
                        "uptime": proxy.get("uptime", 99.9),
                        "last_check": time.time()
                    }
                    proxies.append(proxy_config)
                    
            else:
                self.logger.error(f"NetNut API error: {response.status_code} - {response.text}")
                
        except Exception as e:
            self.logger.error(f"Error loading NetNut proxies: {str(e)}")
        
        return proxies
    
    def load_soax_proxies(self) -> List[Dict]:
        """Load SOAX proxies"""
        proxies = []
        
        try:
            # SOAX API endpoint
            api_url = f"{self.provider_config['api_base']}/proxies"
            
            headers = {
                "Authorization": f"Basic {self._encode_credentials()}",
                "Content-Type": "application/json"
            }
            
            response = requests.get(api_url, headers=headers, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                
                for proxy in data.get("proxies", []):
                    proxy_config = {
                        "id": proxy.get("id", f"soax_{len(proxies)}"),
                        "host": proxy.get("host"),
                        "port": proxy.get("port"),
                        "username": self.username,
                        "password": self.password,
                        "type": "socks5",
                        "provider": "soax",
                        "geo": proxy.get("country", "US"),
                        "city": proxy.get("city", "Unknown"),
                        "isp": proxy.get("isp", "Unknown"),
                        "speed": proxy.get("speed", 100),
                        "uptime": proxy.get("uptime", 99.9),
                        "last_check": time.time()
                    }
                    proxies.append(proxy_config)
                    
            else:
                self.logger.error(f"SOAX API error: {response.status_code} - {response.text}")
                
        except Exception as e:
            self.logger.error(f"Error loading SOAX proxies: {str(e)}")
        
        return proxies
    
    def load_iproyal_proxies(self) -> List[Dict]:
        """Load IPRoyal proxies"""
        proxies = []
        
        try:
            # IPRoyal API endpoint
            api_url = f"{self.provider_config['api_base']}/proxies"
            
            headers = {
                "Authorization": f"Basic {self._encode_credentials()}",
                "Content-Type": "application/json"
            }
            
            response = requests.get(api_url, headers=headers, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                
                for proxy in data.get("proxies", []):
                    proxy_config = {
                        "id": proxy.get("id", f"iproyal_{len(proxies)}"),
                        "host": proxy.get("host"),
                        "port": proxy.get("port"),
                        "username": self.username,
                        "password": self.password,
                        "type": "socks5",
                        "provider": "iproyal",
                        "geo": proxy.get("country", "US"),
                        "city": proxy.get("city", "Unknown"),
                        "isp": proxy.get("isp", "Unknown"),
                        "speed": proxy.get("speed", 100),
                        "uptime": proxy.get("uptime", 99.9),
                        "last_check": time.time()
                    }
                    proxies.append(proxy_config)
                    
            else:
                self.logger.error(f"IPRoyal API error: {response.status_code} - {response.text}")
                
        except Exception as e:
            self.logger.error(f"Error loading IPRoyal proxies: {str(e)}")
        
        return proxies
    
    def _encode_credentials(self) -> str:
        """Encode credentials for Basic Auth"""
        import base64
        credentials = f"{self.username}:{self.password}"
        return base64.b64encode(credentials.encode()).decode()
    
    def get_available_proxies(self, count: int = None, geo_filter: str = None) -> List[Dict]:
        """Get available proxies with auto-recovery and monitoring"""
        try:
            # Get proxies from current provider
            available_proxies = self._get_proxies_from_current_provider(count, geo_filter)
            
            # Check if we need to trigger fallback
            if not available_proxies and self.auto_fallback:
                available_proxies = self._try_provider_fallback(count, geo_filter)
            
            # Monitor proxy availability
            self._monitor_proxy_availability(available_proxies)
            
            return available_proxies
            
        except Exception as e:
            self.logger.error(f"Error getting proxies from {self.current_provider}: {str(e)}")
            
            # Try fallback if auto-fallback is enabled
            if self.auto_fallback:
                return self._try_provider_fallback(count, geo_filter)
            
            return []
    
    def _get_proxies_from_current_provider(self, count: int = None, geo_filter: str = None) -> List[Dict]:
        """Get proxies from current provider with filtering"""
        available_proxies = self.proxy_pool.copy()
        
        # Filter by geo if specified
        if geo_filter:
            available_proxies = [p for p in available_proxies if p.get("geo") == geo_filter]
        
        # Filter out proxies that have exceeded daily limit
        daily_limit = self.config.get("proxy", {}).get("daily_limit_per_proxy", 1)
        available_proxies = [
            p for p in available_proxies 
            if self.proxy_usage_stats.get(p["id"], 0) < daily_limit
        ]
        
        # Limit count if specified
        if count:
            available_proxies = available_proxies[:count]
        
        return available_proxies
    
    def _try_provider_fallback(self, count: int = None, geo_filter: str = None) -> List[Dict]:
        """Try fallback to next available provider"""
        if self.fallback_attempts >= self.max_fallback_retries:
            self.logger.error(f"Max fallback attempts ({self.max_fallback_retries}) reached")
            return []
        
        self.fallback_attempts += 1
        self.logger.warning(f"Attempting provider fallback (attempt {self.fallback_attempts}/{self.max_fallback_retries})")
        
        # Try next provider in the list
        for i in range(len(self.provider_list)):
            next_index = (self.current_provider_index + i) % len(self.provider_list)
            provider_config = self.provider_list[next_index]
            
            if provider_config.get("enabled", True):
                old_provider = self.current_provider
                self.current_provider = provider_config["name"]
                self.current_provider_index = next_index
                
                self.logger.info(f"Switching from {old_provider} to {self.current_provider}")
                
                # Update credentials from provider config
                self.username, self.password = self._get_credentials_for_provider(provider_config)
                
                # Reload proxy pool for new provider
                self.load_proxy_pool()
                
                # Try to get proxies from new provider
                proxies = self._get_proxies_from_current_provider(count, geo_filter)
                
                if proxies:
                    self.logger.info(f"Successfully switched to {self.current_provider}")
                    self.fallback_attempts = 0  # Reset fallback attempts
                    return proxies
                else:
                    self.logger.warning(f"Failed to get proxies from {self.current_provider}")
        
        # If all providers failed, wait before retry
        if self.fallback_attempts < self.max_fallback_retries:
            self.logger.info(f"Waiting {self.fallback_delay} seconds before next fallback attempt...")
            time.sleep(self.fallback_delay)
            return self._try_provider_fallback(count, geo_filter)
        
        return []
    
    def _monitor_proxy_availability(self, proxies: List[Dict]):
        """Monitor proxy availability and trigger alerts"""
        if not proxies:
            return
        
        total_proxies = len(self.proxy_pool) if self.proxy_pool else 1
        available_ratio = len(proxies) / total_proxies
        
        # Check critical threshold
        if available_ratio <= self.critical_threshold:
            self.logger.critical(f"CRITICAL: Proxy availability below critical threshold! "
                               f"Available: {len(proxies)}/{total_proxies} ({available_ratio:.1%})")
        
        # Check alert threshold
        elif available_ratio <= self.alert_threshold:
            self.logger.warning(f"ALERT: Proxy availability below alert threshold! "
                              f"Available: {len(proxies)}/{total_proxies} ({available_ratio:.1%})")
        
        # Log normal availability
        else:
            self.logger.info(f"Proxy availability: {len(proxies)}/{total_proxies} ({available_ratio:.1%})")
    
    def retry_proxy_acquisition(self, count: int = 100, max_retries: int = 3) -> List[Dict]:
        """Retry proxy acquisition with exponential backoff"""
        for attempt in range(max_retries):
            self.logger.info(f"Proxy acquisition attempt {attempt + 1}/{max_retries}")
            
            proxies = self.get_available_proxies(count=count)
            if proxies:
                self.logger.info(f"Successfully acquired {len(proxies)} proxies")
                return proxies
            
            # Exponential backoff
            delay = 60 * (2 ** attempt)  # 60s, 120s, 240s
            self.logger.info(f"No proxies available, waiting {delay} seconds before retry...")
            time.sleep(delay)
        
        self.logger.error(f"Failed to acquire proxies after {max_retries} attempts")
        return []
    
    def get_proxy_for_session(self, session_id: str, geo_preference: str = None) -> Optional[Dict]:
        """Get a proxy for a specific session"""
        available_proxies = self.get_available_proxies(geo_filter=geo_preference)
        
        if not available_proxies:
            self.logger.warning("No available proxies found")
            return None
        
        # Select proxy based on provider-specific logic
        if self.current_provider == "socksescort":
            proxy = self._select_socksescort_proxy(available_proxies)
        else:
            proxy = random.choice(available_proxies)
        
        if proxy:
            # Mark proxy as active for this session
            self.active_proxies[session_id] = proxy["id"]
            
            # Update usage stats
            proxy_id = proxy["id"]
            self.proxy_usage_stats[proxy_id] = self.proxy_usage_stats.get(proxy_id, 0) + 1
        
        return proxy
    
    def _select_socksescort_proxy(self, available_proxies: List[Dict]) -> Optional[Dict]:
        """Select SocksEscort proxy based on performance metrics"""
        # Sort by speed and uptime
        sorted_proxies = sorted(
            available_proxies,
            key=lambda x: (x.get("speed", 0) * x.get("uptime", 0)),
            reverse=True
        )
        
        # Return the best performing proxy
        return sorted_proxies[0] if sorted_proxies else None
    
    def release_proxy(self, session_id: str):
        """Release proxy from session"""
        if session_id in self.active_proxies:
            proxy_id = self.active_proxies[session_id]
            del self.active_proxies[session_id]
            self.logger.info(f"Released proxy {proxy_id} from session {session_id}")
    
    def get_proxy_stats(self) -> Dict:
        """Get proxy usage statistics"""
        return {
            "provider": self.current_provider,
            "total_proxies": len(self.proxy_pool),
            "active_proxies": len(self.active_proxies),
            "usage_stats": self.proxy_usage_stats,
            "geo_distribution": self._get_geo_distribution(),
            "provider_features": self.provider_config.get("features", [])
        }
    
    def _get_geo_distribution(self) -> Dict:
        """Get geographic distribution of proxies"""
        geo_dist = {}
        for proxy in self.proxy_pool:
            geo = proxy.get("geo", "Unknown")
            geo_dist[geo] = geo_dist.get(geo, 0) + 1
        return geo_dist
    
    def switch_provider(self, new_provider: str):
        """Switch to a different proxy provider"""
        if new_provider in self.provider_configs:
            self.current_provider = new_provider
            self.provider_config = self.provider_configs[new_provider]
            self.load_proxy_pool()
            self.logger.info(f"Switched to provider: {new_provider}")
        else:
            self.logger.error(f"Unknown provider: {new_provider}")
    
    def get_supported_providers(self) -> List[str]:
        """Get list of supported providers"""
        return list(self.provider_configs.keys())
