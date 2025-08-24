"""
Fingerprint Generator for Undetectable Profiles
Creates unique fingerprints that match proxy geolocation and are undetectable
"""

import random
import json
import time
import logging
from typing import Dict, List, Optional, Tuple
import os

from base_classes import ConfigLoader

class FingerprintGenerator:
    def __init__(self, config_path: str = "../config/config.yaml"):
        """Initialize fingerprint generator"""
        self.config = ConfigLoader.load_config(config_path)
        self.logger = logging.getLogger(__name__)
        self.used_fingerprints = set()
        
        # Load device and browser data
        self.device_data = self._load_device_data()
        self.browser_data = self._load_browser_data()
        self.geo_data = self._load_geo_data()
    

    
    def _load_device_data(self) -> Dict:
        """Load device specifications"""
        return {
            "desktop_windows": {
                "os": "win",
                "arch": "x64",
                "platforms": ["Windows NT 10.0", "Windows NT 6.3", "Windows NT 6.1"],
                "resolutions": [
                    {"width": 1920, "height": 1080},
                    {"width": 1366, "height": 768},
                    {"width": 1440, "height": 900},
                    {"width": 1536, "height": 864},
                    {"width": 2560, "height": 1440}
                ]
            },
            "desktop_mac": {
                "os": "mac",
                "arch": "x64",
                "platforms": ["Macintosh; Intel Mac OS X 10_15_7", "Macintosh; Intel Mac OS X 10_14_6"],
                "resolutions": [
                    {"width": 1440, "height": 900},
                    {"width": 1920, "height": 1080},
                    {"width": 2560, "height": 1600},
                    {"width": 2880, "height": 1800}
                ]
            },
            "laptop_windows": {
                "os": "win",
                "arch": "x64",
                "platforms": ["Windows NT 10.0", "Windows NT 6.3"],
                "resolutions": [
                    {"width": 1366, "height": 768},
                    {"width": 1920, "height": 1080},
                    {"width": 1440, "height": 900},
                    {"width": 1600, "height": 900}
                ]
            }
        }
    
    def _load_browser_data(self) -> Dict:
        """Load browser specifications"""
        return {
            "chrome": {
                "versions": ["120.0.0.0", "119.0.0.0", "118.0.0.0", "117.0.0.0"],
                "user_agents": [
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
                ]
            }
        }
    
    def _load_geo_data(self) -> Dict:
        """Load geolocation data for Tier 1 markets"""
        return {
            "US": {
                "timezones": [
                    "America/New_York",
                    "America/Chicago", 
                    "America/Denver",
                    "America/Los_Angeles",
                    "America/Phoenix",
                    "America/Anchorage",
                    "Pacific/Honolulu"
                ],
                "languages": ["en-US", "en"],
                "locales": ["en-US", "en"],
                "geolocation": {
                    "latitude_range": (25.0, 49.0),
                    "longitude_range": (-125.0, -66.0),
                    "accuracy": 100
                },
                "webgl_vendors": [
                    "Google Inc. (Intel)",
                    "Google Inc. (NVIDIA)",
                    "Google Inc. (AMD)",
                    "Intel Inc.",
                    "NVIDIA Corporation"
                ],
                "webgl_renderers": [
                    "ANGLE (Intel, Intel(R) UHD Graphics 620 Direct3D11 vs_5_0 ps_5_0, D3D11)",
                    "ANGLE (NVIDIA, NVIDIA GeForce GTX 1060 Direct3D11 vs_5_0 ps_5_0, D3D11)",
                    "ANGLE (AMD, AMD Radeon RX 580 Direct3D11 vs_5_0 ps_5_0, D3D11)"
                ]
            },
            "CA": {
                "timezones": [
                    "America/Toronto",
                    "America/Vancouver",
                    "America/Edmonton",
                    "America/Winnipeg",
                    "America/Halifax"
                ],
                "languages": ["en-CA", "en", "fr-CA", "fr"],
                "locales": ["en-CA", "en", "fr-CA", "fr"],
                "geolocation": {
                    "latitude_range": (41.0, 84.0),
                    "longitude_range": (-141.0, -52.0),
                    "accuracy": 100
                },
                "webgl_vendors": [
                    "Google Inc. (Intel)",
                    "Google Inc. (NVIDIA)",
                    "Google Inc. (AMD)",
                    "Intel Inc.",
                    "NVIDIA Corporation"
                ],
                "webgl_renderers": [
                    "ANGLE (Intel, Intel(R) UHD Graphics 620 Direct3D11 vs_5_0 ps_5_0, D3D11)",
                    "ANGLE (NVIDIA, NVIDIA GeForce GTX 1060 Direct3D11 vs_5_0 ps_5_0, D3D11)",
                    "ANGLE (AMD, AMD Radeon RX 580 Direct3D11 vs_5_0 ps_5_0, D3D11)"
                ]
            },
            "GB": {
                "timezones": ["Europe/London"],
                "languages": ["en-GB", "en"],
                "locales": ["en-GB", "en"],
                "geolocation": {
                    "latitude_range": (49.0, 61.0),
                    "longitude_range": (-8.0, 2.0),
                    "accuracy": 100
                },
                "webgl_vendors": [
                    "Google Inc. (Intel)",
                    "Google Inc. (NVIDIA)",
                    "Google Inc. (AMD)",
                    "Intel Inc.",
                    "NVIDIA Corporation"
                ],
                "webgl_renderers": [
                    "ANGLE (Intel, Intel(R) UHD Graphics 620 Direct3D11 vs_5_0 ps_5_0, D3D11)",
                    "ANGLE (NVIDIA, NVIDIA GeForce GTX 1060 Direct3D11 vs_5_0 ps_5_0, D3D11)",
                    "ANGLE (AMD, AMD Radeon RX 580 Direct3D11 vs_5_0 ps_5_0, D3D11)"
                ]
            },
            "AU": {
                "timezones": [
                    "Australia/Sydney",
                    "Australia/Melbourne",
                    "Australia/Brisbane",
                    "Australia/Perth",
                    "Australia/Adelaide"
                ],
                "languages": ["en-AU", "en"],
                "locales": ["en-AU", "en"],
                "geolocation": {
                    "latitude_range": (-43.0, -10.0),
                    "longitude_range": (113.0, 154.0),
                    "accuracy": 100
                },
                "webgl_vendors": [
                    "Google Inc. (Intel)",
                    "Google Inc. (NVIDIA)",
                    "Google Inc. (AMD)",
                    "Intel Inc.",
                    "NVIDIA Corporation"
                ],
                "webgl_renderers": [
                    "ANGLE (Intel, Intel(R) UHD Graphics 620 Direct3D11 vs_5_0 ps_5_0, D3D11)",
                    "ANGLE (NVIDIA, NVIDIA GeForce GTX 1060 Direct3D11 vs_5_0 ps_5_0, D3D11)",
                    "ANGLE (AMD, AMD Radeon RX 580 Direct3D11 vs_5_0 ps_5_0, D3D11)"
                ]
            },
            "DE": {
                "timezones": ["Europe/Berlin"],
                "languages": ["de-DE", "de", "en"],
                "locales": ["de-DE", "de", "en"],
                "geolocation": {
                    "latitude_range": (47.0, 55.0),
                    "longitude_range": (6.0, 15.0),
                    "accuracy": 100
                },
                "webgl_vendors": [
                    "Google Inc. (Intel)",
                    "Google Inc. (NVIDIA)",
                    "Google Inc. (AMD)",
                    "Intel Inc.",
                    "NVIDIA Corporation"
                ],
                "webgl_renderers": [
                    "ANGLE (Intel, Intel(R) UHD Graphics 620 Direct3D11 vs_5_0 ps_5_0, D3D11)",
                    "ANGLE (NVIDIA, NVIDIA GeForce GTX 1060 Direct3D11 vs_5_0 ps_5_0, D3D11)",
                    "ANGLE (AMD, AMD Radeon RX 580 Direct3D11 vs_5_0 ps_5_0, D3D11)"
                ]
            },
            "FR": {
                "timezones": ["Europe/Paris"],
                "languages": ["fr-FR", "fr", "en"],
                "locales": ["fr-FR", "fr", "en"],
                "geolocation": {
                    "latitude_range": (41.0, 51.0),
                    "longitude_range": (-5.0, 10.0),
                    "accuracy": 100
                },
                "webgl_vendors": [
                    "Google Inc. (Intel)",
                    "Google Inc. (NVIDIA)",
                    "Google Inc. (AMD)",
                    "Intel Inc.",
                    "NVIDIA Corporation"
                ],
                "webgl_renderers": [
                    "ANGLE (Intel, Intel(R) UHD Graphics 620 Direct3D11 vs_5_0 ps_5_0, D3D11)",
                    "ANGLE (NVIDIA, NVIDIA GeForce GTX 1060 Direct3D11 vs_5_0 ps_5_0, D3D11)",
                    "ANGLE (AMD, AMD Radeon RX 580 Direct3D11 vs_5_0 ps_5_0, D3D11)"
                ]
            },
            "NL": {
                "timezones": ["Europe/Amsterdam"],
                "languages": ["nl-NL", "nl", "en"],
                "locales": ["nl-NL", "nl", "en"],
                "geolocation": {
                    "latitude_range": (50.0, 54.0),
                    "longitude_range": (3.0, 8.0),
                    "accuracy": 100
                },
                "webgl_vendors": [
                    "Google Inc. (Intel)",
                    "Google Inc. (NVIDIA)",
                    "Google Inc. (AMD)",
                    "Intel Inc.",
                    "NVIDIA Corporation"
                ],
                "webgl_renderers": [
                    "ANGLE (Intel, Intel(R) UHD Graphics 620 Direct3D11 vs_5_0 ps_5_0, D3D11)",
                    "ANGLE (NVIDIA, NVIDIA GeForce GTX 1060 Direct3D11 vs_5_0 ps_5_0, D3D11)",
                    "ANGLE (AMD, AMD Radeon RX 580 Direct3D11 vs_5_0 ps_5_0, D3D11)"
                ]
            }
        }
    
    def generate_unique_fingerprint(self, proxy_location: str = "US") -> Dict:
        """Generate a unique fingerprint for undetectable behavior"""
        fingerprint_hash = None
        max_attempts = 100
        
        for attempt in range(max_attempts):
            fingerprint = self._generate_fingerprint(proxy_location)
            fingerprint_hash = self._hash_fingerprint(fingerprint)
            
            if fingerprint_hash not in self.used_fingerprints:
                self.used_fingerprints.add(fingerprint_hash)
                self.logger.info(f"Generated unique fingerprint for {proxy_location} (attempt {attempt + 1})")
                return fingerprint
        
        self.logger.warning(f"Could not generate unique fingerprint for {proxy_location} after 100 attempts")
        return self._generate_fingerprint(proxy_location)
    
    def _generate_fingerprint(self, proxy_location: str = "US") -> Dict:
        """Generate a fingerprint with undetectable settings that matches proxy location"""
        # Use default location if not found
        if proxy_location not in self.geo_data:
            proxy_location = "US"
            self.logger.warning(f"Unknown proxy location {proxy_location}, using US")
        
        # Select random device type
        device_type = random.choice(list(self.device_data.keys()))
        device = self.device_data[device_type]
        
        # Select random resolution
        resolution = random.choice(device["resolutions"])
        
        # Select random browser version and user agent
        browser = self.browser_data["chrome"]
        version = random.choice(browser["versions"])
        user_agent = random.choice(browser["user_agents"])
        
        # Select geo settings based on proxy location
        geo = self.geo_data[proxy_location]
        timezone = random.choice(geo["timezones"])
        language = random.choice(geo["languages"])
        locale = random.choice(geo["locales"])
        webgl_vendor = random.choice(geo["webgl_vendors"])
        webgl_renderer = random.choice(geo["webgl_renderers"])
        
        # Generate geolocation coordinates based on proxy location
        geo_coords = self._generate_geo_coordinates(geo["geolocation"])
        
        # Generate canvas fingerprint
        canvas_fingerprint = self._generate_canvas_fingerprint()
        
        # Generate audio fingerprint
        audio_fingerprint = self._generate_audio_fingerprint()
        
        fingerprint = {
            "os": device["os"],
            "arch": device["arch"],
            "platform": random.choice(device["platforms"]),
            "resolution": resolution,
            "userAgent": user_agent,
            "timezone": timezone,
            "language": language,
            "locale": locale,
            "country": proxy_location,  # Add country for consistency
            "webgl": {
                "vendor": webgl_vendor,
                "renderer": webgl_renderer
            },
            "canvas": canvas_fingerprint,
            "audio": audio_fingerprint,
            "webrtc": {
                "enabled": False,  # Disable WebRTC for privacy
                "publicIP": None
            },
            "geolocation": geo_coords,  # Add geolocation coordinates
            "mediaDevices": {
                "enabled": False,  # Disable media devices
                "microphone": False,
                "camera": False
            },
            "battery": {
                "enabled": True,
                "level": random.uniform(0.2, 1.0),
                "charging": random.choice([True, False])
            },
            "connection": {
                "type": random.choice(["wifi", "ethernet", "4g"]),
                "downlink": random.uniform(5.0, 100.0),
                "rtt": random.uniform(10, 100)
            },
            "performance": {
                "timing": {
                    "navigationStart": int(time.time() * 1000),
                    "fetchStart": random.randint(0, 100),
                    "domainLookupStart": random.randint(100, 200),
                    "domainLookupEnd": random.randint(200, 300),
                    "connectStart": random.randint(300, 400),
                    "connectEnd": random.randint(400, 500),
                    "requestStart": random.randint(500, 600),
                    "responseStart": random.randint(600, 800),
                    "responseEnd": random.randint(800, 1000),
                    "domLoading": random.randint(1000, 1200),
                    "domInteractive": random.randint(1200, 1500),
                    "domContentLoadedEventStart": random.randint(1500, 1600),
                    "domContentLoadedEventEnd": random.randint(1600, 1700),
                    "domComplete": random.randint(1700, 2000),
                    "loadEventStart": random.randint(2000, 2100),
                    "loadEventEnd": random.randint(2100, 2200)
                }
            },
            "fonts": self._generate_font_list(),
            "plugins": self._generate_plugin_list(),
            "screen": {
                "width": resolution["width"],
                "height": resolution["height"],
                "colorDepth": 24,
                "pixelDepth": 24,
                "availWidth": resolution["width"],
                "availHeight": resolution["height"]
            },
            "window": {
                "innerWidth": resolution["width"],
                "innerHeight": resolution["height"],
                "outerWidth": resolution["width"],
                "outerHeight": resolution["height"]
            },
            "hardware_concurrency": random.choice([4, 6, 8, 12, 16])
        }
        
        return fingerprint
    
    def _generate_geo_coordinates(self, geo_config: Dict) -> Dict:
        """Generate realistic geolocation coordinates based on proxy location"""
        lat_range = geo_config["latitude_range"]
        lon_range = geo_config["longitude_range"]
        
        latitude = random.uniform(lat_range[0], lat_range[1])
        longitude = random.uniform(lon_range[0], lon_range[1])
        
        return {
            "latitude": round(latitude, 6),
            "longitude": round(longitude, 6),
            "accuracy": geo_config["accuracy"],
            "altitude": random.uniform(0, 1000)
        }
    
    def _generate_canvas_fingerprint(self) -> str:
        """Generate a unique canvas fingerprint"""
        # This is a simplified version - in real implementation, you'd generate actual canvas data
        canvas_data = f"canvas_{random.randint(1000000, 9999999)}"
        return canvas_data
    
    def _generate_audio_fingerprint(self) -> str:
        """Generate a unique audio fingerprint"""
        # This is a simplified version - in real implementation, you'd generate actual audio data
        audio_data = f"audio_{random.randint(1000000, 9999999)}"
        return audio_data
    
    def _generate_font_list(self) -> List[str]:
        """Generate a realistic font list"""
        common_fonts = [
            "Arial", "Arial Black", "Arial Unicode MS", "Calibri", "Cambria", 
            "Cambria Math", "Comic Sans MS", "Courier", "Courier New", 
            "Georgia", "Helvetica", "Impact", "Times", "Times New Roman", 
            "Trebuchet MS", "Verdana", "Webdings", "Wingdings", "Wingdings 2", 
            "Wingdings 3", "MS Gothic", "MS Mincho", "MS PGothic", "MS PMincho", 
            "MS UI Gothic", "Segoe UI", "Segoe UI Light", "Segoe UI Semibold", 
            "Segoe UI Symbol", "Segoe UI Emoji", "Segoe UI Historic", 
            "Segoe UI Variable", "Segoe UI Variable Display", "Segoe UI Variable Small", 
            "Segoe UI Variable Text"
        ]
        
        # Select random subset of fonts
        num_fonts = random.randint(20, len(common_fonts))
        return random.sample(common_fonts, num_fonts)
    
    def _generate_plugin_list(self) -> List[Dict]:
        """Generate a realistic plugin list"""
        common_plugins = [
            {"name": "Chrome PDF Plugin", "description": "Portable Document Format", "filename": "internal-pdf-viewer"},
            {"name": "Chrome PDF Viewer", "description": "", "filename": "mhjfbmdgcfjbbpaeojofohoefgiehjai"},
            {"name": "Native Client", "description": "", "filename": "internal-nacl-plugin"},
            {"name": "Widevine Content Decryption Module", "description": "Enables Widevine licenses for playback of HTML audio/video content.", "filename": "widevinecdmadapter.dll"},
            {"name": "Shockwave Flash", "description": "Shockwave Flash 32.0 r0", "filename": "flash32_32_0_0_0.ocx"}
        ]
        
        # Select random subset of plugins
        num_plugins = random.randint(3, len(common_plugins))
        return random.sample(common_plugins, num_plugins)
    
    def _hash_fingerprint(self, fingerprint: Dict) -> str:
        """Create a hash of the fingerprint for uniqueness checking"""
        # Create a simplified hash based on key fingerprint components
        key_components = [
            fingerprint.get("userAgent", ""),
            fingerprint.get("timezone", ""),
            fingerprint.get("resolution", {}).get("width", ""),
            fingerprint.get("resolution", {}).get("height", ""),
            fingerprint.get("webgl", {}).get("vendor", ""),
            fingerprint.get("webgl", {}).get("renderer", ""),
            fingerprint.get("country", ""),
            fingerprint.get("hardware_concurrency", "")
        ]
        
        return hash("|".join(str(comp) for comp in key_components))
    
    def get_fingerprint_for_proxy(self, proxy: str, proxy_location: str = "US") -> Dict:
        """Get a fingerprint that matches the proxy location"""
        # Extract location from proxy if possible
        # For now, we'll use the provided location
        # In a real implementation, you might want to:
        # 1. Parse proxy string to extract location
        # 2. Use IP geolocation service
        # 3. Match with proxy provider's location data
        
        self.logger.info(f"Generating fingerprint for proxy location: {proxy_location}")
        return self.generate_unique_fingerprint(proxy_location)
    
    def validate_fingerprint_consistency(self, fingerprint: Dict, proxy_location: str = "US") -> bool:
        """Validate that fingerprint is consistent with proxy location"""
        if proxy_location not in self.geo_data:
            return False
        
        geo = self.geo_data[proxy_location]
        
        # Check timezone consistency
        if fingerprint.get("timezone") not in geo["timezones"]:
            self.logger.warning(f"Timezone {fingerprint.get('timezone')} not consistent with {proxy_location}")
            return False
        
        # Check language consistency
        if fingerprint.get("language") not in geo["languages"]:
            self.logger.warning(f"Language {fingerprint.get('language')} not consistent with {proxy_location}")
            return False
        
        # Check locale consistency
        if fingerprint.get("locale") not in geo["locales"]:
            self.logger.warning(f"Locale {fingerprint.get('locale')} not consistent with {proxy_location}")
            return False
        
        # Check country consistency
        if fingerprint.get("country") != proxy_location:
            self.logger.warning(f"Country {fingerprint.get('country')} not consistent with {proxy_location}")
            return False
        
        self.logger.info(f"Fingerprint validation passed for {proxy_location}")
        return True
