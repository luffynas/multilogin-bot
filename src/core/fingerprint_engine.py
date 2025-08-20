import random
import json
import os
import time
import shutil
import uuid
import base64
import glob
import threading
from typing import Dict, List, Optional
import logging
from fake_useragent import UserAgent

class FingerprintEngine:
    def __init__(self, config: Dict):
        self.config = config
        self.logger = logging.getLogger(__name__)
        self.ua = UserAgent()
        self.fingerprint_database = {}
        
        # Optional persistence configuration
        self.persistence_config = config.get("fingerprint", {}).get("persistence", {})
        self.hardware_persistence_config = config.get("fingerprint", {}).get("hardware_persistence", {})
        self.consistency_config = config.get("fingerprint", {}).get("consistency_monitoring", {})
        
        # Stealth file operations configuration
        self.stealth_file_ops = self.persistence_config.get("stealth_file_ops", {})
        self.stealth_monitoring = self.consistency_config.get("stealth_monitoring", {})
        
        # Memory-only storage for maximum stealth
        self.memory_fingerprint_cache = {}
        self.memory_hardware_cache = {}
        self.pending_writes = []
        self.last_write_time = time.time()
        
        # Load persistent data if enabled and stealth allows
        if self.persistence_config.get("enabled", False):
            if self.stealth_file_ops.get("use_memory_cache", True):
                # Use memory-only mode for maximum stealth
                self.logger.info("Fingerprint persistence enabled (MEMORY-ONLY mode for stealth)")
            else:
                self.load_fingerprint_database_stealth()
                self.logger.info("Fingerprint persistence enabled (STEALTH FILE mode)")
        
        # Hardware profile cache with stealth
        self.hardware_database = {}
        if self.hardware_persistence_config.get("enabled", False):
            stealth_hw_ops = self.hardware_persistence_config.get("stealth_file_ops", {})
            if stealth_hw_ops.get("use_memory_cache", True):
                self.logger.info("Hardware persistence enabled (MEMORY-ONLY mode for stealth)")
            else:
                self.load_hardware_database_stealth()
                self.logger.info("Hardware persistence enabled (STEALTH FILE mode)")
        
        # Consistency tracking with stealth
        self.fingerprint_changes = []
        if self.consistency_config.get("enabled", False):
            if self.stealth_monitoring.get("memory_only", True):
                self.logger.info("Consistency monitoring enabled (MEMORY-ONLY mode for stealth)")
            else:
                self.logger.info("Consistency monitoring enabled")
        
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
        
        # Track old fingerprint for consistency monitoring
        old_fingerprint = self.fingerprint_database.get(proxy_id, None)
        
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
            
            # Track fingerprint change if monitoring enabled
            if old_fingerprint:
                self.track_fingerprint_change(proxy_id, old_fingerprint, fingerprint)
            
            # Auto-save if enabled with stealth
            if self.persistence_config.get("auto_save", True):
                if self.stealth_file_ops.get("enabled", True):
                    self.save_fingerprint_database_stealth()
                else:
                    self.save_fingerprint_database()
        
        return self.fingerprint_database[proxy_id]
    
    def save_fingerprint_database_stealth(self):
        """Save fingerprint database with stealth anti-detection measures"""
        if not self.persistence_config.get("enabled", False):
            return
        
        # Check if stealth file ops are enabled
        if self.stealth_file_ops.get("enabled", True):
            # Memory-only mode - no disk writes for maximum stealth
            if self.stealth_file_ops.get("use_memory_cache", True):
                # Store in memory cache only
                self.memory_fingerprint_cache.update(self.fingerprint_database)
                self.logger.debug(f"Fingerprint database cached in memory: {len(self.fingerprint_database)} entries")
                return
            
            # Delayed writes to avoid detection patterns
            if self.stealth_file_ops.get("delayed_writes", True):
                current_time = time.time()
                write_delay_min = self.stealth_file_ops.get("write_delay_min", 30)
                write_delay_max = self.stealth_file_ops.get("write_delay_max", 300)
                
                if current_time - self.last_write_time < write_delay_min:
                    # Add to pending writes instead of immediate write
                    self.pending_writes.append({
                        "type": "fingerprint",
                        "data": self.fingerprint_database.copy(),
                        "timestamp": current_time
                    })
                    self.logger.debug("Fingerprint write delayed for stealth")
                    return
        
        # Proceed with stealth file write
        self._execute_stealth_file_write("fingerprint")
    
    def _execute_stealth_file_write(self, data_type: str):
        """Execute stealth file write with anti-detection measures"""
        try:
            if data_type == "fingerprint":
                data = self.fingerprint_database
                cache_file = self.persistence_config.get("cache_file", "fingerprint_cache.json")
            else:
                return
            
            # Generate random filename if enabled
            if self.stealth_file_ops.get("randomize_filenames", True):
                import uuid
                random_suffix = str(uuid.uuid4())[:8]
                cache_file = f"fp_{random_suffix}.cache"
            
            # Encrypt and obfuscate content if enabled
            if self.stealth_file_ops.get("encrypted_storage", True):
                encrypted_data = self._encrypt_data(data)
                obfuscated_data = self._obfuscate_data(encrypted_data) if self.stealth_file_ops.get("obfuscate_content", True) else encrypted_data
            else:
                obfuscated_data = data
            
            # Write to temporary file first
            temp_file = f"{cache_file}.tmp"
            with open(temp_file, "w") as f:
                if isinstance(obfuscated_data, str):
                    f.write(obfuscated_data)
                else:
                    json.dump(obfuscated_data, f, indent=2)
            
            # Atomic move to final location
            os.rename(temp_file, cache_file)
            
            # Immediate cleanup if enabled
            if self.stealth_file_ops.get("temp_file_cleanup", True):
                # Schedule cleanup of old cache files
                self._schedule_stealth_cleanup(cache_file)
            
            self.last_write_time = time.time()
            self.logger.debug(f"Stealth file write completed: {cache_file}")
            
        except Exception as e:
            self.logger.error(f"Error in stealth file write: {str(e)}")
    
    def _encrypt_data(self, data: dict) -> str:
        """Simple encryption for cache data"""
        import base64
        json_str = json.dumps(data)
        # Simple XOR encryption with rotating key
        key = "StealthBot2024"
        encrypted = ""
        for i, char in enumerate(json_str):
            encrypted += chr(ord(char) ^ ord(key[i % len(key)]))
        return base64.b64encode(encrypted.encode()).decode()
    
    def _decrypt_data(self, encrypted_data: str) -> dict:
        """Simple decryption for cache data"""
        import base64
        try:
            encrypted = base64.b64decode(encrypted_data.encode()).decode()
            key = "StealthBot2024"
            decrypted = ""
            for i, char in enumerate(encrypted):
                decrypted += chr(ord(char) ^ ord(key[i % len(key)]))
            return json.loads(decrypted)
        except Exception as e:
            self.logger.error(f"Error decrypting data: {str(e)}")
            return {}
    
    def _obfuscate_data(self, data: str) -> str:
        """Obfuscate data to avoid pattern detection"""
        # Add random padding and structure obfuscation
        import base64
        import random
        
        # Add random padding
        padding = ''.join(random.choices('abcdefghijklmnopqrstuvwxyz0123456789', k=random.randint(10, 50)))
        obfuscated = f"#{padding}#{data}#{padding}#"
        
        # Base64 encode again
        return base64.b64encode(obfuscated.encode()).decode()
    
    def _deobfuscate_data(self, obfuscated_data: str) -> str:
        """Deobfuscate data"""
        import base64
        try:
            decoded = base64.b64decode(obfuscated_data.encode()).decode()
            # Extract data between padding markers
            parts = decoded.split('#')
            if len(parts) >= 4:
                return parts[2]  # The actual data is in the middle
            return decoded
        except Exception as e:
            self.logger.error(f"Error deobfuscating data: {str(e)}")
            return obfuscated_data
    
    def _schedule_stealth_cleanup(self, current_file: str):
        """Schedule cleanup of old cache files"""
        try:
            import glob
            import threading
            
            def cleanup_old_files():
                # Clean up old cache files after delay
                time.sleep(random.uniform(60, 300))  # 1-5 minutes delay
                
                pattern = "fp_*.cache"
                old_files = glob.glob(pattern)
                
                for file in old_files:
                    if file != current_file and os.path.exists(file):
                        try:
                            os.remove(file)
                            self.logger.debug(f"Cleaned up old cache file: {file}")
                        except Exception as e:
                            self.logger.debug(f"Could not cleanup {file}: {str(e)}")
            
            # Run cleanup in background thread
            cleanup_thread = threading.Thread(target=cleanup_old_files, daemon=True)
            cleanup_thread.start()
            
        except Exception as e:
            self.logger.debug(f"Cleanup scheduling failed: {str(e)}")
    
    def load_fingerprint_database_stealth(self):
        """Load fingerprint database with stealth anti-detection measures"""
        if not self.persistence_config.get("enabled", False):
            return
        
        try:
            # Check memory cache first
            if self.stealth_file_ops.get("use_memory_cache", True):
                if self.memory_fingerprint_cache:
                    self.fingerprint_database = self.memory_fingerprint_cache.copy()
                    self.logger.info(f"Fingerprint database loaded from memory: {len(self.fingerprint_database)} entries")
                    return
            
            cache_file = self.persistence_config.get("cache_file", "fingerprint_cache.json")
            
            # Try to find randomized filename
            if self.stealth_file_ops.get("randomize_filenames", True):
                import glob
                pattern = "fp_*.cache"
                cache_files = glob.glob(pattern)
                if cache_files:
                    cache_file = max(cache_files, key=os.path.getmtime)  # Get most recent
            
            if os.path.exists(cache_file):
                with open(cache_file, "r") as f:
                    content = f.read()
                
                # Decrypt and deobfuscate if needed
                if self.stealth_file_ops.get("encrypted_storage", True):
                    if self.stealth_file_ops.get("obfuscate_content", True):
                        content = self._deobfuscate_data(content)
                    self.fingerprint_database = self._decrypt_data(content)
                else:
                    self.fingerprint_database = json.loads(content)
                
                self.logger.info(f"Stealth fingerprint database loaded: {len(self.fingerprint_database)} entries")
                
                # Cleanup after loading if enabled
                if self.stealth_file_ops.get("temp_file_cleanup", True):
                    self._schedule_stealth_cleanup(cache_file)
            else:
                self.logger.info("No stealth fingerprint cache found, starting fresh")
                
        except Exception as e:
            self.logger.error(f"Error loading stealth fingerprint database: {str(e)}")
            self.fingerprint_database = {}
    
    def save_fingerprint_database(self):
        """Save fingerprint database to file (optional persistence)"""
        if not self.persistence_config.get("enabled", False):
            return
        
        try:
            cache_file = self.persistence_config.get("cache_file", "fingerprint_cache.json")
            
            # Create backup if enabled
            if self.persistence_config.get("backup_enabled", True):
                import os
                if os.path.exists(cache_file):
                    backup_file = f"{cache_file}.backup"
                    import shutil
                    shutil.copy2(cache_file, backup_file)
                    self.logger.debug(f"Created backup: {backup_file}")
            
            # Save current database
            with open(cache_file, "w") as f:
                json.dump(self.fingerprint_database, f, indent=2)
            
            self.logger.debug(f"Fingerprint database saved: {len(self.fingerprint_database)} entries")
            
        except Exception as e:
            self.logger.error(f"Error saving fingerprint database: {str(e)}")
    
    def load_fingerprint_database(self):
        """Load fingerprint database from file (optional persistence)"""
        if not self.persistence_config.get("enabled", False):
            return
        
        try:
            cache_file = self.persistence_config.get("cache_file", "fingerprint_cache.json")
            
            if os.path.exists(cache_file):
                with open(cache_file, "r") as f:
                    self.fingerprint_database = json.load(f)
                
                self.logger.info(f"Fingerprint database loaded: {len(self.fingerprint_database)} entries")
                
                # Cleanup old entries if needed
                self.cleanup_fingerprint_database()
            else:
                self.logger.info("No fingerprint cache file found, starting fresh")
                
        except Exception as e:
            self.logger.error(f"Error loading fingerprint database: {str(e)}")
            self.fingerprint_database = {}
    
    def cleanup_fingerprint_database(self):
        """Cleanup old fingerprint entries"""
        if not self.persistence_config.get("enabled", False):
            return
        
        max_size = self.persistence_config.get("max_cache_size", 1000)
        
        if len(self.fingerprint_database) > max_size:
            # Remove oldest entries (simple FIFO)
            entries_to_remove = len(self.fingerprint_database) - max_size
            keys_to_remove = list(self.fingerprint_database.keys())[:entries_to_remove]
            
            for key in keys_to_remove:
                del self.fingerprint_database[key]
            
            self.logger.info(f"Cleaned up {entries_to_remove} old fingerprint entries")
    
    def save_hardware_database(self):
        """Save hardware database to file (optional persistence)"""
        if not self.hardware_persistence_config.get("enabled", False):
            return
        
        try:
            cache_file = self.hardware_persistence_config.get("cache_file", "hardware_cache.json")
            
            # Create backup if enabled
            if self.hardware_persistence_config.get("backup_enabled", True):
                import os
                if os.path.exists(cache_file):
                    backup_file = f"{cache_file}.backup"
                    import shutil
                    shutil.copy2(cache_file, backup_file)
                    self.logger.debug(f"Created hardware backup: {backup_file}")
            
            # Save current database
            with open(cache_file, "w") as f:
                json.dump(self.hardware_database, f, indent=2)
            
            self.logger.debug(f"Hardware database saved: {len(self.hardware_database)} entries")
            
        except Exception as e:
            self.logger.error(f"Error saving hardware database: {str(e)}")
    
    def load_hardware_database(self):
        """Load hardware database from file (optional persistence)"""
        if not self.hardware_persistence_config.get("enabled", False):
            return
        
        try:
            cache_file = self.hardware_persistence_config.get("cache_file", "hardware_cache.json")
            
            if os.path.exists(cache_file):
                with open(cache_file, "r") as f:
                    self.hardware_database = json.load(f)
                
                self.logger.info(f"Hardware database loaded: {len(self.hardware_database)} entries")
                
                # Cleanup old entries if needed
                self.cleanup_hardware_database()
            else:
                self.logger.info("No hardware cache file found, starting fresh")
                
        except Exception as e:
            self.logger.error(f"Error loading hardware database: {str(e)}")
            self.hardware_database = {}
    
    def cleanup_hardware_database(self):
        """Cleanup old hardware entries"""
        if not self.hardware_persistence_config.get("enabled", False):
            return
        
        max_size = self.hardware_persistence_config.get("max_cache_size", 500)
        
        if len(self.hardware_database) > max_size:
            # Remove oldest entries (simple FIFO)
            entries_to_remove = len(self.hardware_database) - max_size
            keys_to_remove = list(self.hardware_database.keys())[:entries_to_remove]
            
            for key in keys_to_remove:
                del self.hardware_database[key]
            
            self.logger.info(f"Cleaned up {entries_to_remove} old hardware entries")
    
    def track_fingerprint_change(self, proxy_id: str, old_fingerprint: Dict, new_fingerprint: Dict):
        """Track fingerprint changes for consistency monitoring"""
        if not self.consistency_config.get("enabled", False):
            return
        
        if old_fingerprint != new_fingerprint:
            change_record = {
                "timestamp": time.time(),
                "proxy_id": proxy_id,
                "old_fingerprint": old_fingerprint,
                "new_fingerprint": new_fingerprint,
                "changes": self._calculate_fingerprint_changes(old_fingerprint, new_fingerprint)
            }
            
            self.fingerprint_changes.append(change_record)
            
            if self.consistency_config.get("log_changes", True):
                self.logger.warning(f"Fingerprint changed for proxy {proxy_id}: {change_record['changes']}")
            
            if self.consistency_config.get("alert_on_inconsistency", False):
                self.logger.error(f"FINGERPRINT INCONSISTENCY ALERT: Proxy {proxy_id} has different fingerprint")
    
    def _calculate_fingerprint_changes(self, old_fingerprint: Dict, new_fingerprint: Dict) -> List[str]:
        """Calculate what changed between fingerprints"""
        changes = []
        
        for key in set(old_fingerprint.keys()) | set(new_fingerprint.keys()):
            if key not in old_fingerprint:
                changes.append(f"Added: {key}")
            elif key not in new_fingerprint:
                changes.append(f"Removed: {key}")
            elif old_fingerprint[key] != new_fingerprint[key]:
                changes.append(f"Changed: {key} ({old_fingerprint[key]} -> {new_fingerprint[key]})")
        
        return changes
    
    def get_consistency_report(self) -> Dict:
        """Get consistency monitoring report"""
        if not self.consistency_config.get("enabled", False):
            return {"enabled": False}
        
        total_changes = len(self.fingerprint_changes)
        recent_changes = [c for c in self.fingerprint_changes if time.time() - c["timestamp"] < 3600]  # Last hour
        
        return {
            "enabled": True,
            "total_fingerprint_changes": total_changes,
            "recent_changes_last_hour": len(recent_changes),
            "consistency_score": self._calculate_consistency_score(),
            "change_threshold": self.consistency_config.get("change_threshold", 0.8),
            "recommendations": self._generate_consistency_recommendations()
        }
    
    def _calculate_consistency_score(self) -> float:
        """Calculate overall consistency score"""
        if not self.fingerprint_changes:
            return 1.0
        
        # Simple scoring: fewer changes = higher consistency
        total_proxies = len(self.fingerprint_database)
        if total_proxies == 0:
            return 1.0
        
        changed_proxies = len(set(change["proxy_id"] for change in self.fingerprint_changes))
        consistency_score = 1.0 - (changed_proxies / total_proxies)
        
        return max(0.0, min(1.0, consistency_score))
    
    def _generate_consistency_recommendations(self) -> List[str]:
        """Generate recommendations based on consistency data"""
        recommendations = []
        
        if self.fingerprint_changes:
            recommendations.append("Enable fingerprint persistence to maintain consistency")
        
        if len(self.fingerprint_changes) > 10:
            recommendations.append("High number of fingerprint changes detected - consider enabling persistence")
        
        consistency_score = self._calculate_consistency_score()
        threshold = self.consistency_config.get("change_threshold", 0.8)
        
        if consistency_score < threshold:
            recommendations.append(f"Consistency score ({consistency_score:.2f}) below threshold ({threshold})")
        
        return recommendations
    
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
