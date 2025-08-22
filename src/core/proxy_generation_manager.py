import requests
import logging
import time
import json
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from enum import Enum


class ProxyProtocol(Enum):
    HTTP = "http"
    SOCKS5 = "socks5"


class SessionType(Enum):
    STICKY = "sticky"
    ROTATING = "rotating"


@dataclass
class ProxyConfig:
    host: str
    port: int
    username: str
    password: str
    protocol: ProxyProtocol
    country: str
    region: Optional[str] = None
    city: Optional[str] = None
    session_type: SessionType = SessionType.STICKY
    ipttl: int = 86400  # 24 hours default


class ProxyGenerationManager:
    """
    Manages Multilogin X internal proxy generation for enhanced reliability.
    Implements safe proxy management to avoid account restrictions.
    """
    
    def __init__(self, base_url: str = "https://profile-proxy.multilogin.com"):
        self.base_url = base_url
        self.logger = logging.getLogger(__name__)
        self.session = requests.Session()
        
        # Safe headers to avoid detection
        self.session.headers.update({
            "Accept": "application/json",
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        })
    
    def generate_proxy(self, country: str = "us", session_type: SessionType = SessionType.STICKY,
                      protocol: ProxyProtocol = ProxyProtocol.HTTP, region: Optional[str] = None,
                      city: Optional[str] = None, ipttl: int = 86400, count: int = 1) -> Optional[ProxyConfig]:
        """
        Generate a proxy using Multilogin's internal system.
        SAFE OPERATION: Uses Multilogin's own proxy infrastructure.
        """
        try:
            url = f"{self.base_url}/v1/proxy/connection_url"
            
            payload = {
                "country": country.lower(),
                "sessionType": session_type.value,
                "protocol": protocol.value,
                "IPTTL": ipttl,
                "count": count
            }
            
            if region:
                payload["region"] = region
            if city:
                payload["city"] = city
            
            response = self.session.post(url, json=payload, timeout=30)
            
            if response.status_code == 201:
                data = response.json()
                proxy_string = data.get("data", "")
                
                if proxy_string:
                    # Parse proxy string: "gate.multilogin.com:8080:username:password"
                    parts = proxy_string.split(":")
                    if len(parts) >= 4:
                        host = parts[0]
                        port = int(parts[1])
                        username = parts[2]
                        password = parts[3]
                        
                        proxy_config = ProxyConfig(
                            host=host,
                            port=port,
                            username=username,
                            password=password,
                            protocol=protocol,
                            country=country,
                            region=region,
                            city=city,
                            session_type=session_type,
                            ipttl=ipttl
                        )
                        
                        self.logger.info(f"Successfully generated proxy for {country}")
                        return proxy_config
                    else:
                        self.logger.error(f"Invalid proxy string format: {proxy_string}")
                        return None
                else:
                    self.logger.error("Empty proxy string received")
                    return None
            else:
                self.logger.error(f"Failed to generate proxy: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            self.logger.error(f"Error generating proxy: {e}")
            return None
    
    def get_proxy_usage_data(self) -> Dict:
        """
        Get proxy usage statistics.
        SAFE OPERATION: Read-only statistics.
        """
        try:
            url = f"{self.base_url}/v1/user"
            response = self.session.get(url, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                self.logger.info("Successfully retrieved proxy usage data")
                return data
            else:
                self.logger.error(f"Failed to get proxy usage data: {response.status_code}")
                return {}
                
        except Exception as e:
            self.logger.error(f"Error getting proxy usage data: {e}")
            return {}
    
    def validate_proxy(self, proxy_config: ProxyConfig) -> bool:
        """
        Validate proxy configuration using Multilogin's validation endpoint.
        SAFE OPERATION: Only validates, doesn't modify anything.
        """
        try:
            url = "https://launcher.mlx.yt:45001/api/v1/proxy/validate"
            
            payload = {
                "type": proxy_config.protocol.value,
                "host": proxy_config.host,
                "port": proxy_config.port,
                "username": proxy_config.username,
                "password": proxy_config.password
            }
            
            response = self.session.post(url, json=payload, timeout=30)
            
            if response.status_code == 200:
                self.logger.info(f"Proxy validation successful for {proxy_config.host}")
                return True
            else:
                self.logger.error(f"Proxy validation failed: {response.status_code}")
                return False
                
        except Exception as e:
            self.logger.error(f"Error validating proxy: {e}")
            return False
    
    def get_optimal_proxy_config(self, geo_location: str = "US") -> Dict:
        """
        Get optimal proxy configuration based on geo location.
        SAFE: Returns recommended config without generating anything.
        """
        # Safe mapping based on geo location
        geo_configs = {
            "US": {
                "country": "us",
                "region": "new_jersey",
                "city": "east_brunswick",
                "protocol": ProxyProtocol.HTTP,
                "session_type": SessionType.STICKY
            },
            "CA": {
                "country": "ca",
                "region": "ontario",
                "city": "toronto",
                "protocol": ProxyProtocol.HTTP,
                "session_type": SessionType.STICKY
            },
            "UK": {
                "country": "gb",
                "region": "england",
                "city": "london",
                "protocol": ProxyProtocol.HTTP,
                "session_type": SessionType.STICKY
            },
            "AU": {
                "country": "au",
                "region": "new_south_wales",
                "city": "sydney",
                "protocol": ProxyProtocol.HTTP,
                "session_type": SessionType.STICKY
            },
            "DE": {
                "country": "de",
                "region": "berlin",
                "city": "berlin",
                "protocol": ProxyProtocol.HTTP,
                "session_type": SessionType.STICKY
            },
            "FR": {
                "country": "fr",
                "region": "ile_de_france",
                "city": "paris",
                "protocol": ProxyProtocol.HTTP,
                "session_type": SessionType.STICKY
            },
            "ID": {
                "country": "id",
                "region": "jakarta",
                "city": "jakarta",
                "protocol": ProxyProtocol.HTTP,
                "session_type": SessionType.STICKY
            }
        }
        
        return geo_configs.get(geo_location.upper(), geo_configs["US"])
    
    def safe_proxy_generation(self, geo_location: str = "US") -> Optional[ProxyConfig]:
        """
        Safely generate proxy with optimal configuration.
        IMPLEMENTATION: Uses Multilogin's internal system, maintains consistency.
        """
        try:
            # Get optimal configuration
            config = self.get_optimal_proxy_config(geo_location)
            
            # Generate proxy with optimal settings
            proxy_config = self.generate_proxy(
                country=config["country"],
                session_type=config["session_type"],
                protocol=config["protocol"],
                region=config.get("region"),
                city=config.get("city")
            )
            
            if proxy_config:
                # Validate the generated proxy
                is_valid = self.validate_proxy(proxy_config)
                
                if is_valid:
                    self.logger.info(f"Successfully generated and validated proxy for {geo_location}")
                    return proxy_config
                else:
                    self.logger.warning(f"Proxy generated but validation failed for {geo_location}")
                    return None
            else:
                self.logger.error(f"Failed to generate proxy for {geo_location}")
                return None
                
        except Exception as e:
            self.logger.error(f"Error in safe proxy generation: {e}")
            return None
    
    def batch_proxy_generation(self, geo_locations: List[str], count_per_location: int = 1) -> List[ProxyConfig]:
        """
        Generate multiple proxies for different locations.
        SAFE: Uses consistent settings per location.
        """
        proxies = []
        
        for geo_location in geo_locations:
            for _ in range(count_per_location):
                proxy_config = self.safe_proxy_generation(geo_location)
                if proxy_config:
                    proxies.append(proxy_config)
                else:
                    self.logger.warning(f"Failed to generate proxy for {geo_location}")
                
                # Safe delay between generations
                time.sleep(1)
        
        self.logger.info(f"Generated {len(proxies)} proxies for {len(geo_locations)} locations")
        return proxies
    
    def convert_to_multilogin_format(self, proxy_config: ProxyConfig) -> Dict:
        """
        Convert proxy config to Multilogin profile format.
        SAFE: Only formats data, doesn't modify profile settings.
        """
        return {
            "type": proxy_config.protocol.value,
            "host": proxy_config.host,
            "port": proxy_config.port,
            "username": proxy_config.username,
            "password": proxy_config.password,
            "save_traffic": False
        }
