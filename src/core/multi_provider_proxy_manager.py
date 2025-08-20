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
        
        # Current provider configuration
        self.current_provider = config.get("proxy", {}).get("provider", "oxylabs")
        self.provider_config = self.provider_configs.get(self.current_provider, {})
        
        # Proxy pool management
        self.proxy_pool = []
        self.active_proxies = {}
        self.proxy_usage_stats = {}
        
        # Authentication
        self.username = config.get("proxy", {}).get("username")
        self.password = config.get("proxy", {}).get("password")
        
        # Load proxy pool
        self.load_proxy_pool()
    
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
        """Get available proxies with optional filtering"""
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
