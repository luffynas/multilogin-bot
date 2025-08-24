"""
Proxy Manager for Automate Project
Handles Multilogin built-in proxies and SocksEscort with provider switching (SOCKS5 only)
"""

import json
import time
import random
import logging
import requests
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
import os
from datetime import datetime, timedelta
from threading import Thread, Lock

from base_classes import BaseManager, StatisticsManager, Utils

@dataclass
class ProxyInfo:
    host: str
    port: int
    username: str
    password: str
    provider: str = "multilogin_residential"
    protocol: str = "socks5"  # Always SOCKS5
    country: str = "US"
    city: str = ""
    isp: str = ""
    last_used: Optional[str] = None
    usage_count: int = 0
    health_score: float = 1.0
    is_blacklisted: bool = False
    blacklist_reason: str = ""
    blacklist_until: Optional[str] = None
    data_used: float = 0.0  # MB

@dataclass
class ProviderStatus:
    name: str
    priority: int
    enabled: bool
    active: bool
    protocol: str = "socks5"  # Always SOCKS5
    data_limit: Optional[str] = None
    data_used: float = 0.0
    success_rate: float = 1.0
    failure_count: int = 0
    last_used: Optional[str] = None
    auto_use: bool = True
    fallback_enabled: bool = True

class ProxyManager(BaseManager):
    def __init__(self, config_path: str = "../config/config.yaml"):
        """Initialize proxy manager with multi-provider support (SOCKS5 only)"""
        super().__init__(config_path)
        
        # Load proxy data
        self.proxy_health_file = self.config['storage']['proxy_health_file']
        self.provider_status_file = self.config['storage']['provider_status_file']
        self.proxies: Dict[str, ProxyInfo] = self._load_proxies()
        self.providers: Dict[str, ProviderStatus] = self._load_provider_status()
        
        # Health monitoring
        self.health_check_interval = self.config['proxy']['health_check_interval']
        self.max_failures = self.config['proxy']['health_monitoring']['max_failures']
        self.blacklist_duration = self.config['proxy']['health_monitoring']['blacklist_duration']
        
        # Provider switching
        self.provider_switching = self.config['proxy']['provider_switching']
        self.current_provider = self._get_active_provider()
        
        # Threading
        self.lock = Lock()
        self.health_monitor_thread = None
        self.is_monitoring = False
        
        # Start health monitoring
        self.start_health_monitoring()
    
    def _load_proxies(self) -> Dict[str, ProxyInfo]:
        """Load proxies from file or generate sample proxies"""
        try:
            data = self._load_data(self.proxy_health_file)
            if data:
                proxies = {}
                for proxy_id, proxy_data in data.items():
                    # Ensure protocol is SOCKS5
                    proxy_data['protocol'] = 'socks5'
                    proxies[proxy_id] = ProxyInfo(**proxy_data)
                self.logger.info(f"Loaded {len(proxies)} existing SOCKS5 proxies")
                return proxies
            else:
                self.logger.info("No existing proxy file found, generating sample SOCKS5 proxies")
                return self._generate_sample_proxies()
        except Exception as e:
            self.logger.error(f"Error loading proxies: {e}")
            return self._generate_sample_proxies()
    
    def _load_provider_status(self) -> Dict[str, ProviderStatus]:
        """Load provider status from file"""
        try:
            data = self._load_data(self.provider_status_file)
            if data:
                providers = {}
                for provider_name, provider_data in data.items():
                    # Ensure protocol is SOCKS5
                    provider_data['protocol'] = 'socks5'
                    providers[provider_name] = ProviderStatus(**provider_data)
                self.logger.info(f"Loaded {len(providers)} provider statuses (SOCKS5)")
                return providers
            else:
                return self._initialize_provider_status()
        except Exception as e:
            self.logger.error(f"Error loading provider status: {e}")
            return self._initialize_provider_status()
    
    def _initialize_provider_status(self) -> Dict[str, ProviderStatus]:
        """Initialize provider status from config"""
        providers = {}
        for provider_config in self.config['proxy']['providers']:
            provider = ProviderStatus(
                name=provider_config['name'],
                priority=provider_config['priority'],
                enabled=provider_config['enabled'],
                active=provider_config['settings']['auto_use'],
                protocol='socks5',  # Always SOCKS5
                data_limit=provider_config.get('data_limit'),
                auto_use=provider_config['settings']['auto_use'],
                fallback_enabled=provider_config['settings']['fallback_enabled']
            )
            providers[provider_config['name']] = provider
        
        self._save_provider_status()
        return providers
    
    def _save_provider_status(self):
        """Save provider status to file"""
        try:
            data = {name: {
                'name': provider.name,
                'priority': provider.priority,
                'enabled': provider.enabled,
                'active': provider.active,
                'protocol': provider.protocol,  # Always SOCKS5
                'data_limit': provider.data_limit,
                'data_used': provider.data_used,
                'success_rate': provider.success_rate,
                'failure_count': provider.failure_count,
                'last_used': provider.last_used,
                'auto_use': provider.auto_use,
                'fallback_enabled': provider.fallback_enabled
            } for name, provider in self.providers.items()}
            self._save_data(data, self.provider_status_file)
        except Exception as e:
            self.logger.error(f"Error saving provider status: {e}")
    
    def _generate_sample_proxies(self) -> Dict[str, ProxyInfo]:
        """Generate sample proxy list for Multilogin built-in SOCKS5 proxies"""
        proxies = {}
        total_proxies = self.config['proxy']['total_count']
        
        # Generate sample proxies for Multilogin built-in residential SOCKS5 proxies
        for i in range(total_proxies):
            proxy_id = f"proxy_{i+1:04d}"
            
            # Generate realistic residential proxy IPs
            proxy_info = ProxyInfo(
                host=f"192.168.{i//255}.{i%255}",
                port=1080 + (i % 1000),  # SOCKS5 default port range
                username="",  # Not needed for built-in proxies
                password="",  # Not needed for built-in proxies
                provider="multilogin_residential",
                protocol="socks5",  # Always SOCKS5
                country="US",
                city="New York",
                isp="Residential ISP"
            )
            
            proxies[proxy_id] = proxy_info
        
        self.logger.info(f"Generated {len(proxies)} sample Multilogin residential SOCKS5 proxies")
        return proxies
    
    def _get_active_provider(self) -> str:
        """Get the currently active provider"""
        active_providers = [
            name for name, provider in self.providers.items()
            if provider.enabled and provider.active
        ]
        
        if active_providers:
            # Return the highest priority active provider
            return min(active_providers, key=lambda x: self.providers[x].priority)
        
        return "multilogin_residential"  # Default fallback
    
    def get_available_proxy(self, country: str = "US") -> Optional[str]:
        """Get an available SOCKS5 proxy from the current provider"""
        with self.lock:
            # Check if current provider is still viable
            if not self._is_provider_viable(self.current_provider):
                self._switch_provider()
            
            available_proxies = []
            
            for proxy_id, proxy in self.proxies.items():
                # Check if proxy belongs to current provider and is healthy
                if (proxy.provider == self.current_provider and
                    proxy.protocol == "socks5" and  # Ensure SOCKS5
                    not proxy.is_blacklisted and 
                    proxy.health_score > 0.5 and
                    proxy.country == country):
                    
                    # Check blacklist expiration
                    if proxy.blacklist_until:
                        blacklist_until = datetime.fromisoformat(proxy.blacklist_until)
                        if datetime.now() > blacklist_until:
                            proxy.is_blacklisted = False
                            proxy.blacklist_reason = ""
                            proxy.blacklist_until = None
                    
                    if not proxy.is_blacklisted:
                        available_proxies.append(proxy_id)
            
            if available_proxies:
                # Select proxy with lowest usage count and highest health score
                selected_proxy_id = min(available_proxies, 
                    key=lambda pid: (self.proxies[pid].usage_count, -self.proxies[pid].health_score))
                
                # Update proxy usage
                proxy = self.proxies[selected_proxy_id]
                proxy.last_used = datetime.now().isoformat()
                proxy.usage_count += 1
                
                # Update provider usage
                self.providers[self.current_provider].last_used = datetime.now().isoformat()
                
                self._save_proxies()
                self._save_provider_status()
                
                return f"{proxy.host}:{proxy.port}"
            
            # If no proxies available from current provider, try switching
            if self._switch_provider():
                return self.get_available_proxy(country)
            
            return None
    
    def _is_provider_viable(self, provider_name: str) -> bool:
        """Check if a provider is still viable for use"""
        if provider_name not in self.providers:
            return False
        
        provider = self.providers[provider_name]
        
        # Check if provider is enabled and active
        if not provider.enabled or not provider.active:
            return False
        
        # Check data limit for Multilogin residential proxies
        if provider.data_limit and provider.data_used >= self._parse_data_limit(provider.data_limit):
            self.logger.warning(f"Provider {provider_name} data limit reached")
            return False
        
        # Check success rate
        if provider.success_rate < self.provider_switching['switch_conditions']['success_rate_below']:
            self.logger.warning(f"Provider {provider_name} success rate too low: {provider.success_rate}")
            return False
        
        # Check failure count
        if provider.failure_count >= self.provider_switching['switch_conditions']['max_failures']:
            self.logger.warning(f"Provider {provider_name} failure count too high: {provider.failure_count}")
            return False
        
        return True
    
    def _parse_data_limit(self, data_limit: str) -> float:
        """Parse data limit string to MB"""
        return Utils.parse_data_limit(data_limit)
    
    def _switch_provider(self) -> bool:
        """Switch to next available provider"""
        current_priority = self.providers[self.current_provider].priority
        
        # Find next available provider
        available_providers = []
        for name, provider in self.providers.items():
            if (provider.enabled and 
                provider.fallback_enabled and 
                provider.priority > current_priority and
                self._is_provider_viable(name)):
                available_providers.append((name, provider.priority))
        
        if available_providers:
            # Switch to highest priority available provider
            new_provider = min(available_providers, key=lambda x: x[1])[0]
            old_provider = self.current_provider
            self.current_provider = new_provider
            
            self.logger.info(f"Switched provider: {old_provider} -> {new_provider} (SOCKS5)")
            return True
        
        return False
    
    def mark_proxy_failed(self, proxy_str: str, reason: str = "Connection failed"):
        """Mark a SOCKS5 proxy as failed and potentially blacklist it"""
        with self.lock:
            host, port = proxy_str.split(':')
            
            # Find proxy
            for proxy_id, proxy in self.proxies.items():
                if proxy.host == host and proxy.port == int(port):
                    # Decrease health score
                    proxy.health_score = max(0.0, proxy.health_score - 0.1)
                    
                    # Update provider failure count
                    if proxy.provider in self.providers:
                        self.providers[proxy.provider].failure_count += 1
                        self.providers[proxy.provider].success_rate = max(0.0, 
                            self.providers[proxy.provider].success_rate - 0.05)
                    
                    # Check if should be blacklisted
                    if proxy.health_score < 0.3:
                        proxy.is_blacklisted = True
                        proxy.blacklist_reason = reason
                        proxy.blacklist_until = (datetime.now() + 
                            timedelta(seconds=self.blacklist_duration)).isoformat()
                        
                        self.logger.warning(f"Blacklisted SOCKS5 proxy {proxy_str}: {reason}")
                    
                    self._save_proxies()
                    self._save_provider_status()
                    break
    
    def mark_proxy_success(self, proxy_str: str, data_used: float = 0.0):
        """Mark a SOCKS5 proxy as successful"""
        with self.lock:
            host, port = proxy_str.split(':')
            
            # Find proxy
            for proxy_id, proxy in self.proxies.items():
                if proxy.host == host and proxy.port == int(port):
                    # Increase health score
                    proxy.health_score = min(1.0, proxy.health_score + 0.05)
                    proxy.data_used += data_used
                    
                    # Update provider success rate
                    if proxy.provider in self.providers:
                        provider = self.providers[proxy.provider]
                        provider.success_rate = min(1.0, provider.success_rate + 0.02)
                        provider.data_used += data_used
                    
                    # Remove from blacklist if successful
                    if proxy.is_blacklisted and proxy.health_score > 0.5:
                        proxy.is_blacklisted = False
                        proxy.blacklist_reason = ""
                        proxy.blacklist_until = None
                    
                    self._save_proxies()
                    self._save_provider_status()
                    break
    
    def switch_to_socksescort(self):
        """Manually switch to SocksEscort provider (SOCKS5)"""
        with self.lock:
            if "socksescort" in self.providers:
                self.providers["socksescort"].active = True
                self.providers["multilogin_residential"].active = False
                self.current_provider = "socksescort"
                
                self._save_provider_status()
                self.logger.info("Manually switched to SocksEscort SOCKS5 provider")
                return True
            return False
    
    def switch_to_multilogin(self):
        """Manually switch back to Multilogin provider (SOCKS5)"""
        with self.lock:
            if "multilogin_residential" in self.providers:
                self.providers["multilogin_residential"].active = True
                self.providers["socksescort"].active = False
                self.current_provider = "multilogin_residential"
                
                self._save_provider_status()
                self.logger.info("Manually switched to Multilogin SOCKS5 provider")
                return True
            return False
    
    def get_provider_stats(self) -> Dict:
        """Get provider statistics"""
        with self.lock:
            return StatisticsManager.get_provider_stats(self.providers, self.logger)
    
    def get_proxy_stats(self) -> Dict:
        """Get proxy statistics"""
        with self.lock:
            return StatisticsManager.get_proxy_stats(self.proxies, self.current_provider, self.logger)
    
    def _save_proxies(self):
        """Save proxy data to file"""
        try:
            data = {pid: {
                'host': proxy.host,
                'port': proxy.port,
                'username': proxy.username,
                'password': proxy.password,
                'provider': proxy.provider,
                'protocol': proxy.protocol,  # Always SOCKS5
                'country': proxy.country,
                'city': proxy.city,
                'isp': proxy.isp,
                'last_used': proxy.last_used,
                'usage_count': proxy.usage_count,
                'health_score': proxy.health_score,
                'is_blacklisted': proxy.is_blacklisted,
                'blacklist_reason': proxy.blacklist_reason,
                'blacklist_until': proxy.blacklist_until,
                'data_used': proxy.data_used
            } for pid, proxy in self.proxies.items()}
            self._save_data(data, self.proxy_health_file)
        except Exception as e:
            self.logger.error(f"Error saving proxies: {e}")
    
    def start_health_monitoring(self):
        """Start health monitoring thread"""
        if not self.is_monitoring:
            self.is_monitoring = True
            self.health_monitor_thread = Thread(target=self._health_monitor_loop, daemon=True)
            self.health_monitor_thread.start()
            self.logger.info("Started SOCKS5 proxy health monitoring")
    
    def stop_health_monitoring(self):
        """Stop health monitoring"""
        self.is_monitoring = False
        if self.health_monitor_thread:
            self.health_monitor_thread.join()
        self.logger.info("Stopped SOCKS5 proxy health monitoring")
    
    def _health_monitor_loop(self):
        """Health monitoring loop"""
        while self.is_monitoring:
            try:
                self._check_proxy_health()
                time.sleep(self.health_check_interval)
            except Exception as e:
                self.logger.error(f"Error in health monitoring: {e}")
                time.sleep(60)  # Wait 1 minute on error
    
    def _check_proxy_health(self):
        """Check health of all SOCKS5 proxies"""
        with self.lock:
            for proxy_id, proxy in list(self.proxies.items()):
                if not proxy.is_blacklisted and proxy.protocol == "socks5":
                    try:
                        # Test SOCKS5 proxy with a simple request
                        test_url = "http://httpbin.org/ip"
                        proxy_dict = {
                            'http': f'socks5://{proxy.username}:{proxy.password}@{proxy.host}:{proxy.port}',
                            'https': f'socks5://{proxy.username}:{proxy.password}@{proxy.host}:{proxy.port}'
                        }
                        
                        response = requests.get(test_url, proxies=proxy_dict, timeout=10)
                        
                        if response.status_code == 200:
                            proxy.health_score = min(1.0, proxy.health_score + 0.1)
                        else:
                            proxy.health_score = max(0.0, proxy.health_score - 0.2)
                            
                    except Exception as e:
                        proxy.health_score = max(0.0, proxy.health_score - 0.3)
                        
                        # Blacklist if health score is too low
                        if proxy.health_score < 0.2:
                            proxy.is_blacklisted = True
                            proxy.blacklist_reason = f"SOCKS5 health check failed: {str(e)}"
                            proxy.blacklist_until = (datetime.now() + 
                                timedelta(seconds=self.blacklist_duration)).isoformat()
            
            self._save_proxies()
    
    def rotate_proxies(self, rotation_period_days: int = None) -> int:
        """Rotate proxies based on usage patterns"""
        if rotation_period_days is None:
            rotation_period_days = self.config['proxy']['rotation_period_days']
        
        with self.lock:
            rotated_count = 0
            daily_target = self.config['proxy']['total_count'] // rotation_period_days
            
            # Reset usage counts for proxies that haven't been used recently
            cutoff_date = datetime.now() - timedelta(days=rotation_period_days)
            
            for proxy in self.proxies.values():
                if proxy.last_used:
                    last_used = datetime.fromisoformat(proxy.last_used)
                    if last_used < cutoff_date:
                        proxy.usage_count = 0
                        rotated_count += 1
            
            self._save_proxies()
            self.logger.info(f"Rotated {rotated_count} SOCKS5 proxies for {rotation_period_days}-day period")
            return rotated_count
    
    def add_proxy(self, host: str, port: int, username: str, password: str, 
                  provider: str = "multilogin_residential", country: str = "US", 
                  city: str = "", isp: str = "") -> str:
        """Add a new SOCKS5 proxy to the pool"""
        with self.lock:
            proxy_id = f"proxy_{len(self.proxies) + 1:04d}"
            
            proxy_info = ProxyInfo(
                host=host,
                port=port,
                username=username,
                password=password,
                provider=provider,
                protocol="socks5",  # Always SOCKS5
                country=country,
                city=city,
                isp=isp
            )
            
            self.proxies[proxy_id] = proxy_info
            self._save_proxies()
            
            self.logger.info(f"Added new SOCKS5 proxy: {host}:{port} ({provider}, {country})")
            return proxy_id
    
    def remove_proxy(self, proxy_id: str) -> bool:
        """Remove a proxy from the pool"""
        with self.lock:
            if proxy_id in self.proxies:
                del self.proxies[proxy_id]
                self._save_proxies()
                self.logger.info(f"Removed SOCKS5 proxy: {proxy_id}")
                return True
            return False
    
    def get_proxy_info(self, proxy_str: str) -> Optional[ProxyInfo]:
        """Get information about a specific SOCKS5 proxy"""
        host, port = proxy_str.split(':')
        
        for proxy in self.proxies.values():
            if proxy.host == host and proxy.port == int(port):
                return proxy
        
        return None
