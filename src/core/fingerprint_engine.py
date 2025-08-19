import random
import json
from typing import Dict, List, Optional
import logging
from fake_useragent import UserAgent

class FingerprintEngine:
    def __init__(self, config: Dict):
        self.config = config
        self.logger = logging.getLogger(__name__)
        self.ua = UserAgent()
        self.fingerprint_database = {}
        
        # Geo-specific configurations
        self.geo_configs = {
            "ID": {
                "timezone": "Asia/Jakarta",
                "language": "id-ID",
                "screen_resolutions": ["1920x1080", "1366x768", "1440x900", "1536x864"],
                "user_agent_patterns": [
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/{version} Safari/537.36",
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:{version}) Gecko/20100101 Firefox/{version}",
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/{version} Safari/537.36"
                ],
                "webgl_vendors": ["Google Inc. (Intel)", "Google Inc. (NVIDIA)", "Google Inc. (AMD)"],
                "fonts": ["Arial", "Calibri", "Times New Roman", "Verdana", "Tahoma", "Segoe UI"]
            },
            "US": {
                "timezone": "America/New_York",
                "language": "en-US",
                "screen_resolutions": ["1920x1080", "2560x1440", "1366x768", "1440x900"],
                "user_agent_patterns": [
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/{version} Safari/537.36",
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/{version} Safari/537.36",
                    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/{version} Safari/537.36"
                ],
                "webgl_vendors": ["Google Inc. (Intel)", "Google Inc. (NVIDIA)", "Google Inc. (AMD)", "Apple Inc."],
                "fonts": ["Arial", "Helvetica", "Times New Roman", "Georgia", "Verdana", "Tahoma"]
            },
            "GB": {
                "timezone": "Europe/London",
                "language": "en-GB",
                "screen_resolutions": ["1920x1080", "2560x1440", "1366x768", "1440x900"],
                "user_agent_patterns": [
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/{version} Safari/537.36",
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/{version} Safari/537.36"
                ],
                "webgl_vendors": ["Google Inc. (Intel)", "Google Inc. (NVIDIA)", "Google Inc. (AMD)"],
                "fonts": ["Arial", "Helvetica", "Times New Roman", "Georgia", "Verdana", "Tahoma"]
            }
        }
        
        # Default configuration
        self.default_config = {
            "timezone": "Asia/Jakarta",
            "language": "id-ID",
            "screen_resolution": "1920x1080",
            "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "webgl_vendor": "Google Inc. (Intel)",
            "fonts": ["Arial", "Calibri", "Times New Roman", "Verdana", "Tahoma"]
        }
    
    def detect_geo_from_proxy(self, proxy_config: Dict) -> str:
        """Detect geo location from proxy configuration"""
        # This would typically use a geo-IP service
        # For now, we'll use a simple mapping or random selection
        geo_options = ["ID", "US", "GB"]
        
        if "geo" in proxy_config:
            return proxy_config["geo"]
        elif "country" in proxy_config:
            return proxy_config["country"]
        else:
            # Random geo if not specified
            return random.choice(geo_options)
    
    def generate_geo_consistent_fingerprint(self, proxy_config: Dict) -> Dict:
        """Generate fingerprint consistent with proxy geo location"""
        geo = self.detect_geo_from_proxy(proxy_config)
        geo_config = self.geo_configs.get(geo, self.default_config)
        
        # Generate consistent fingerprint for this proxy
        proxy_id = proxy_config.get("id", proxy_config.get("host", "unknown"))
        
        if proxy_id not in self.fingerprint_database:
            fingerprint = {
                "timezone": geo_config["timezone"],
                "language": geo_config["language"],
                "screen_resolution": random.choice(geo_config["screen_resolutions"]),
                "user_agent": self.generate_user_agent(geo_config),
                "webgl_vendor": random.choice(geo_config["webgl_vendors"]),
                "canvas_fingerprint": self.generate_canvas_fingerprint(),
                "fonts": random.sample(geo_config["fonts"], random.randint(3, 5)),
                "device_memory": random.choice([4, 8, 16, 32]),
                "hardware_concurrency": random.choice([2, 4, 6, 8, 12, 16]),
                "platform": random.choice(["Win32", "MacIntel", "Linux x86_64"]),
                "do_not_track": random.choice(["1", "0", None]),
                "color_depth": random.choice([24, 32]),
                "pixel_ratio": random.choice([1, 1.25, 1.5, 2]),
                "geo": geo
            }
            
            self.fingerprint_database[proxy_id] = fingerprint
            self.logger.info(f"Generated fingerprint for proxy {proxy_id}: {geo}")
        
        return self.fingerprint_database[proxy_id]
    
    def generate_user_agent(self, geo_config: Dict) -> str:
        """Generate realistic user agent"""
        pattern = random.choice(geo_config["user_agent_patterns"])
        
        # Generate realistic version numbers
        chrome_versions = ["120.0.0.0", "119.0.0.0", "118.0.0.0", "117.0.0.0"]
        firefox_versions = ["121.0", "120.0", "119.0", "118.0"]
        
        if "Chrome" in pattern:
            version = random.choice(chrome_versions)
            return pattern.replace("{version}", version)
        elif "Firefox" in pattern:
            version = random.choice(firefox_versions)
            return pattern.replace("{version}", version)
        else:
            return self.ua.random
    
    def generate_canvas_fingerprint(self) -> str:
        """Generate canvas fingerprint with noise"""
        # This would typically generate a canvas hash
        # For now, we'll create a random string that looks like a canvas hash
        import hashlib
        import time
        
        # Create a unique canvas fingerprint
        canvas_data = f"canvas_{time.time()}_{random.randint(1000, 9999)}"
        return hashlib.md5(canvas_data.encode()).hexdigest()
    
    def get_stealth_scripts(self, fingerprint: Dict) -> List[str]:
        """Get stealth scripts to inject into browser"""
        scripts = [
            # Disable webdriver property
            "Object.defineProperty(navigator, 'webdriver', {get: () => undefined});",
            
            # Set consistent fingerprint properties
            f"Object.defineProperty(navigator, 'platform', {{get: () => '{fingerprint['platform']}'}});",
            f"Object.defineProperty(navigator, 'hardwareConcurrency', {{get: () => {fingerprint['hardware_concurrency']}}});",
            f"Object.defineProperty(navigator, 'deviceMemory', {{get: () => {fingerprint['device_memory']}}});",
            
            # Set language
            f"Object.defineProperty(navigator, 'language', {{get: () => '{fingerprint['language']}'}});",
            
            # Set screen properties
            f"Object.defineProperty(screen, 'colorDepth', {{get: () => {fingerprint['color_depth']}}});",
            f"Object.defineProperty(window, 'devicePixelRatio', {{get: () => {fingerprint['pixel_ratio']}}});",
            
            # Disable automation flags
            "delete window.cdc_adoQpoasnfa76pfcZLmcfl_Array;",
            "delete window.cdc_adoQpoasnfa76pfcZLmcfl_Promise;",
            "delete window.cdc_adoQpoasnfa76pfcZLmcfl_Symbol;",
            
            # Randomize canvas fingerprint
            """
            const originalGetContext = HTMLCanvasElement.prototype.getContext;
            HTMLCanvasElement.prototype.getContext = function(type) {
                const context = originalGetContext.apply(this, arguments);
                if (type === '2d') {
                    const originalFillText = context.fillText;
                    context.fillText = function() {
                        const args = Array.prototype.slice.call(arguments);
                        args[0] = args[0] + Math.random().toString(36).substr(2, 1);
                        return originalFillText.apply(this, args);
                    };
                }
                return context;
            };
            """,
            
            # Disable WebRTC
            """
            const originalGetUserMedia = navigator.mediaDevices.getUserMedia;
            navigator.mediaDevices.getUserMedia = function() {
                return Promise.reject(new Error('getUserMedia is not implemented'));
            };
            """
        ]
        
        return scripts
    
    def maintain_fingerprint_consistency(self, profile_id: str, proxy_config: Dict) -> Dict:
        """Ensure fingerprint remains consistent for one proxy"""
        proxy_id = proxy_config.get("id", proxy_config.get("host", "unknown"))
        
        if proxy_id not in self.fingerprint_database:
            return self.generate_geo_consistent_fingerprint(proxy_config)
        
        return self.fingerprint_database[proxy_id]
    
    def get_fingerprint_summary(self) -> Dict:
        """Get summary of all fingerprints"""
        geo_distribution = {}
        for proxy_id, fingerprint in self.fingerprint_database.items():
            geo = fingerprint.get("geo", "unknown")
            geo_distribution[geo] = geo_distribution.get(geo, 0) + 1
        
        return {
            "total_fingerprints": len(self.fingerprint_database),
            "geo_distribution": geo_distribution,
            "consistency_score": self.calculate_consistency_score()
        }
    
    def calculate_consistency_score(self) -> float:
        """Calculate fingerprint consistency score"""
        if not self.fingerprint_database:
            return 0.0
        
        # Check for duplicate fingerprints
        fingerprints = list(self.fingerprint_database.values())
        unique_fingerprints = len(set(str(fp) for fp in fingerprints))
        total_fingerprints = len(fingerprints)
        
        return unique_fingerprints / total_fingerprints
