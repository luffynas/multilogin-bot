"""
Hardware Emulator
Provides realistic hardware fingerprint emulation for undetectable traffic
"""

import random
import platform
import psutil
import json
import os
import shutil
from typing import Dict, List, Optional
import logging

class HardwareEmulator:
    """Emulates realistic hardware characteristics"""
    
    def __init__(self, config: Dict):
        self.config = config
        self.logger = logging.getLogger(__name__)
        
        # Optional hardware persistence configuration
        self.hardware_persistence_config = config.get("fingerprint", {}).get("hardware_persistence", {})
        self.hardware_database = {}
        
        # Load persistent hardware data if enabled
        if self.hardware_persistence_config.get("enabled", False):
            self.load_hardware_database()
            self.logger.info("Hardware persistence enabled")
        
        # Hardware profiles for different device types
        self.hardware_profiles = {
            "desktop_windows": {
                "cpu_cores": [2, 4, 6, 8, 12, 16],
                "cpu_models": [
                    "Intel(R) Core(TM) i3-6100 CPU @ 3.70GHz",
                    "Intel(R) Core(TM) i5-7400 CPU @ 3.00GHz",
                    "Intel(R) Core(TM) i7-7700 CPU @ 3.60GHz",
                    "AMD Ryzen 5 1600X Six-Core Processor",
                    "AMD Ryzen 7 1700X Eight-Core Processor"
                ],
                "memory_sizes": [4, 8, 16, 32, 64],
                "gpu_models": [
                    "Intel(R) HD Graphics 530",
                    "NVIDIA GeForce GTX 1060",
                    "AMD Radeon RX 580",
                    "NVIDIA GeForce RTX 3060"
                ],
                "screen_resolutions": [
                    "1366x768", "1920x1080", "2560x1440", "3840x2160"
                ],
                "color_depths": [24, 32],
                "pixel_ratios": [1.0, 1.25, 1.5, 2.0]
            },
            "desktop_mac": {
                "cpu_cores": [4, 6, 8, 10, 12],
                "cpu_models": [
                    "Intel(R) Core(TM) i5-8259U CPU @ 2.30GHz",
                    "Intel(R) Core(TM) i7-9750H CPU @ 2.60GHz",
                    "Apple M1",
                    "Apple M1 Pro",
                    "Apple M1 Max"
                ],
                "memory_sizes": [8, 16, 32, 64],
                "gpu_models": [
                    "Intel Iris Plus Graphics 655",
                    "AMD Radeon Pro 5500M",
                    "Apple M1 GPU",
                    "Apple M1 Pro GPU"
                ],
                "screen_resolutions": [
                    "1440x900", "1920x1080", "2560x1440", "3456x2234"
                ],
                "color_depths": [24, 32],
                "pixel_ratios": [1.0, 2.0]
            },
            "laptop_windows": {
                "cpu_cores": [2, 4, 6, 8],
                "cpu_models": [
                    "Intel(R) Core(TM) i3-6006U CPU @ 2.00GHz",
                    "Intel(R) Core(TM) i5-7200U CPU @ 2.50GHz",
                    "Intel(R) Core(TM) i7-7500U CPU @ 2.70GHz",
                    "AMD Ryzen 5 3500U with Radeon Vega Mobile Gfx"
                ],
                "memory_sizes": [4, 8, 16, 32],
                "gpu_models": [
                    "Intel(R) HD Graphics 520",
                    "Intel(R) UHD Graphics 620",
                    "NVIDIA GeForce MX150",
                    "AMD Radeon Vega 8"
                ],
                "screen_resolutions": [
                    "1366x768", "1920x1080", "2560x1440"
                ],
                "color_depths": [24, 32],
                "pixel_ratios": [1.0, 1.25, 1.5]
            },
            "mobile_android": {
                "cpu_cores": [4, 6, 8],
                "cpu_models": [
                    "Qualcomm Snapdragon 855",
                    "Qualcomm Snapdragon 865",
                    "Qualcomm Snapdragon 888",
                    "Samsung Exynos 2100",
                    "MediaTek Dimensity 1200"
                ],
                "memory_sizes": [4, 6, 8, 12, 16],
                "gpu_models": [
                    "Adreno 640",
                    "Adreno 650",
                    "Adreno 660",
                    "Mali-G78 MP14",
                    "Mali-G78 MP10"
                ],
                "screen_resolutions": [
                    "720x1280", "1080x1920", "1440x2560", "1080x2400", "1440x3200"
                ],
                "color_depths": [24, 32],
                "pixel_ratios": [2.0, 2.5, 3.0, 3.5]
            },
            "mobile_ios": {
                "cpu_cores": [2, 4, 6],
                "cpu_models": [
                    "Apple A13 Bionic",
                    "Apple A14 Bionic",
                    "Apple A15 Bionic",
                    "Apple A16 Bionic",
                    "Apple A17 Pro"
                ],
                "memory_sizes": [3, 4, 6, 8],
                "gpu_models": [
                    "Apple A13 GPU",
                    "Apple A14 GPU",
                    "Apple A15 GPU",
                    "Apple A16 GPU",
                    "Apple A17 Pro GPU"
                ],
                "screen_resolutions": [
                    "750x1334", "1125x2436", "1170x2532", "1179x2556", "1290x2796"
                ],
                "color_depths": [24, 32],
                "pixel_ratios": [2.0, 2.5, 3.0]
            },
            "tablet_android": {
                "cpu_cores": [4, 6, 8],
                "cpu_models": [
                    "Qualcomm Snapdragon 870",
                    "MediaTek Dimensity 1100",
                    "Samsung Exynos 2100",
                    "Unisoc T618"
                ],
                "memory_sizes": [4, 6, 8, 12],
                "gpu_models": [
                    "Adreno 650",
                    "Mali-G77 MC9",
                    "Mali-G78 MP10",
                    "Mali-G52 MC2"
                ],
                "screen_resolutions": [
                    "1200x1920", "1600x2560", "2048x2732", "2560x1600"
                ],
                "color_depths": [24, 32],
                "pixel_ratios": [1.5, 2.0, 2.5]
            },
            "tablet_ios": {
                "cpu_cores": [4, 6, 8],
                "cpu_models": [
                    "Apple A12Z Bionic",
                    "Apple A14 Bionic",
                    "Apple M1",
                    "Apple M2"
                ],
                "memory_sizes": [4, 6, 8, 16],
                "gpu_models": [
                    "Apple A12Z GPU",
                    "Apple A14 GPU",
                    "Apple M1 GPU",
                    "Apple M2 GPU"
                ],
                "screen_resolutions": [
                    "1668x2388", "2048x2732", "2360x1640", "2732x2048"
                ],
                "color_depths": [24, 32],
                "pixel_ratios": [2.0, 2.5]
            }
        }
        
        # Network characteristics
        self.network_profiles = {
            "home_wifi": {
                "connection_type": "wifi",
                "effective_type": ["4g", "wifi"],
                "rtt": [20, 50, 100],
                "downlink": [10, 25, 50, 100],
                "save_data": False
            },
            "mobile_4g": {
                "connection_type": "cellular",
                "effective_type": ["4g", "3g"],
                "rtt": [50, 100, 200],
                "downlink": [5, 10, 25, 50],
                "save_data": True
            },
            "office_ethernet": {
                "connection_type": "ethernet",
                "effective_type": ["4g", "wifi"],
                "rtt": [5, 15, 30],
                "downlink": [50, 100, 500, 1000],
                "save_data": False
            }
        }
    
    def generate_hardware_profile(self, geo_location: str = "US", complexity: str = "moderate") -> Dict:
        """Generate hardware profile with complexity-based variations"""
        # Base hardware configuration
        base_config = {
            "device_type": random.choice(self.config.get("hardware_emulation", {}).get("device_types", ["desktop_windows"])),
            "network_profile": random.choice(self.config.get("hardware_emulation", {}).get("network_profiles", ["home_wifi"])),
            "geo_location": geo_location
        }
        
        # Complexity-based hardware variations
        if complexity == "simple":
            # Simple hardware: Basic configuration
            hardware_config = {
                "cpu_cores": random.choice([2, 4]),
                "memory_gb": random.choice([4, 8]),
                "gpu_memory": random.choice([1, 2]),
                "storage_type": "hdd",
                "network_speed": random.choice([10, 25, 50]),  # Mbps
                "screen_resolution": random.choice(["1366x768", "1440x900"]),
                "battery_level": random.randint(20, 80),
                "performance_level": "basic"
            }
        elif complexity == "moderate":
            # Moderate hardware: Mid-range configuration
            hardware_config = {
                "cpu_cores": random.choice([4, 6, 8]),
                "memory_gb": random.choice([8, 16]),
                "gpu_memory": random.choice([2, 4, 6]),
                "storage_type": random.choice(["hdd", "ssd"]),
                "network_speed": random.choice([50, 100, 200]),  # Mbps
                "screen_resolution": random.choice(["1920x1080", "2560x1440"]),
                "battery_level": random.randint(30, 90),
                "performance_level": "mid_range"
            }
        elif complexity == "complex":
            # Complex hardware: High-end configuration
            hardware_config = {
                "cpu_cores": random.choice([8, 12, 16]),
                "memory_gb": random.choice([16, 32, 64]),
                "gpu_memory": random.choice([6, 8, 12, 16]),
                "storage_type": "ssd",
                "network_speed": random.choice([200, 500, 1000]),  # Mbps
                "screen_resolution": random.choice(["2560x1440", "3840x2160"]),
                "battery_level": random.randint(40, 95),
                "performance_level": "high_end"
            }
        
        # Merge configurations
        hardware_profile = {**base_config, **hardware_config}
        
        # Add complexity-specific features
        if complexity == "complex":
            hardware_profile.update({
                "advanced_features": True,
                "sensor_support": True,
                "high_performance_mode": True,
                "multiple_displays": random.choice([True, False])
            })
        else:
            hardware_profile.update({
                "advanced_features": False,
                "sensor_support": False,
                "high_performance_mode": False,
                "multiple_displays": False
            })
        
        return hardware_profile
    
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
    
    def get_hardware_profile_with_persistence(self, geo_location: str = "US", complexity: str = "moderate") -> Dict:
        """Get hardware profile with optional persistence"""
        # Create unique key for this combination
        profile_key = f"{geo_location}_{complexity}"
        
        # Check if we have a cached profile
        if profile_key in self.hardware_database:
            self.logger.debug(f"Using cached hardware profile for {profile_key}")
            return self.hardware_database[profile_key]
        
        # Generate new profile
        hardware_profile = self.generate_hardware_profile(geo_location, complexity)
        
        # Cache the profile
        self.hardware_database[profile_key] = hardware_profile
        
        # Auto-save if enabled
        if self.hardware_persistence_config.get("auto_save", True):
            self.save_hardware_database()
        
        return hardware_profile
    
    def _get_architecture(self, device_type: str) -> str:
        """Get CPU architecture based on device type"""
        if "mac" in device_type:
            return random.choice(["x64", "arm64"])
        else:
            return "x64"
    
    def _generate_network_profile(self) -> Dict:
        """Generate realistic network profile"""
        network_type = random.choice(list(self.network_profiles.keys()))
        profile = self.network_profiles[network_type]
        
        return {
            "type": profile["connection_type"],
            "effective_type": random.choice(profile["effective_type"]),
            "rtt": random.choice(profile["rtt"]),
            "downlink": random.choice(profile["downlink"]),
            "save_data": profile["save_data"],
            "online": True
        }
    
    def _generate_battery_profile(self, device_type: str) -> Dict:
        """Generate battery profile"""
        if "laptop" in device_type or "mac" in device_type:
            return {
                "charging": random.choice([True, False]),
                "level": random.uniform(0.1, 1.0) if not random.choice([True, False]) else 1.0,
                "charging_time": random.randint(0, 3600) if random.choice([True, False]) else float('inf'),
                "discharging_time": random.randint(1800, 7200) if not random.choice([True, False]) else float('inf')
            }
        else:
            return {
                "charging": True,
                "level": 1.0,
                "charging_time": float('inf'),
                "discharging_time": float('inf')
            }
    
    def _generate_sensor_profile(self) -> Dict:
        """Generate sensor profile"""
        return {
            "accelerometer": random.choice([True, False]),
            "gyroscope": random.choice([True, False]),
            "magnetometer": random.choice([True, False]),
            "ambient_light": random.choice([True, False]),
            "proximity": random.choice([True, False])
        }
    
    def _get_timezone_for_geo(self, geo_location: str) -> str:
        """Get timezone based on geo location"""
        timezone_map = {
            "US": "America/New_York",
            "ID": "Asia/Jakarta",
            "GB": "Europe/London",
            "DE": "Europe/Berlin",
            "FR": "Europe/Paris",
            "JP": "Asia/Tokyo",
            "AU": "Australia/Sydney"
        }
        
        return timezone_map.get(geo_location, "UTC")
    
    def _get_language_for_geo(self, geo_location: str) -> str:
        """Get language based on geo location"""
        language_map = {
            "US": "en-US",
            "ID": "id-ID",
            "GB": "en-GB",
            "DE": "de-DE",
            "FR": "fr-FR",
            "JP": "ja-JP",
            "AU": "en-AU"
        }
        
        return language_map.get(geo_location, "en-US")
    
    def get_hardware_scripts(self, profile: Dict) -> List[str]:
        """Get JavaScript scripts to inject hardware characteristics"""
        scripts = []
        
        # CPU and memory emulation
        cpu_script = f"""
        Object.defineProperty(navigator, 'hardwareConcurrency', {{
            get: () => {profile['cpu_cores']}
        }});
        
        Object.defineProperty(navigator, 'deviceMemory', {{
            get: () => {profile['memory_gb']}
        }});
        """
        scripts.append(cpu_script)
        
        # Screen characteristics
        width, height = profile['screen_resolution'].split('x')
        screen_script = f"""
        Object.defineProperty(screen, 'width', {{
            get: () => {width}
        }});
        
        Object.defineProperty(screen, 'height', {{
            get: () => {height}
        }});
        
        Object.defineProperty(screen, 'colorDepth', {{
            get: () => {profile['color_depths']}
        }});
        
        Object.defineProperty(window, 'devicePixelRatio', {{
            get: () => {profile['pixel_ratios']}
        }});
        """
        scripts.append(screen_script)
        
        # Network characteristics
        network_script = f"""
        if (navigator.connection) {{
            Object.defineProperty(navigator.connection, 'effectiveType', {{
                get: () => '{profile['network_profile']['effective_type']}'
            }});
            
            Object.defineProperty(navigator.connection, 'rtt', {{
                get: () => {profile['network_profile']['rtt']}
            }});
            
            Object.defineProperty(navigator.connection, 'downlink', {{
                get: () => {profile['network_speed']}
            }});
            
            Object.defineProperty(navigator.connection, 'saveData', {{
                get: () => {str(profile['network_profile']['save_data']).lower()}
            }});
        }}
        """
        scripts.append(network_script)
        
        # Battery characteristics
        battery_script = f"""
        if (navigator.getBattery) {{
            navigator.getBattery = function() {{
                return Promise.resolve({{
                    charging: {str(profile['battery_level'] > 50).lower()},
                    level: {profile['battery_level']},
                    chargingTime: {profile['charging_time']},
                    dischargingTime: {profile['discharging_time']}
                }});
            }};
        }}
        """
        scripts.append(battery_script)
        
        # Sensor characteristics
        sensor_script = f"""
        // Emulate sensor availability
        if ('Accelerometer' in window) {{
            Object.defineProperty(window, 'Accelerometer', {{
                get: () => {str(profile['accelerometer']).lower()} ? Accelerometer : undefined
            }});
        }}
        
        if ('Gyroscope' in window) {{
            Object.defineProperty(window, 'Gyroscope', {{
                get: () => {str(profile['gyroscope']).lower()} ? Gyroscope : undefined
            }});
        }}
        """
        scripts.append(sensor_script)
        
        return scripts
    
    def get_performance_scripts(self, profile: Dict) -> List[str]:
        """Get scripts to emulate realistic performance characteristics"""
        scripts = []
        
        # Memory usage simulation
        memory_script = f"""
        // Simulate memory pressure
        const memoryPressure = {random.uniform(0.1, 0.8)};
        
        // Add memory pressure to performance timing
        const originalNow = performance.now;
        performance.now = function() {{
            const baseTime = originalNow.call(this);
            return baseTime + (memoryPressure * Math.random() * 10);
        }};
        """
        scripts.append(memory_script)
        
        # CPU throttling simulation
        cpu_script = f"""
        // Simulate CPU throttling based on device type
        const cpuThrottle = {random.uniform(0.05, 0.3)};
        
        // Add CPU pressure to timing functions
        const originalSetTimeout = window.setTimeout;
        window.setTimeout = function(fn, delay, ...args) {{
            const adjustedDelay = delay * (1 + cpuThrottle * Math.random());
            return originalSetTimeout.call(this, fn, adjustedDelay, ...args);
        }};
        """
        scripts.append(cpu_script)
        
        return scripts
    
    def get_device_orientation_scripts(self, profile: Dict) -> List[str]:
        """Get scripts to handle device orientation"""
        scripts = []
        
        orientation_script = f"""
        // Emulate device orientation
        Object.defineProperty(screen, 'orientation', {{
            get: () => ({{
                type: '{profile['display']['orientation']}',
                angle: 0,
                onchange: null
            }})
        }});
        
        // Emulate orientation events
        if (window.DeviceOrientationEvent) {{
            window.DeviceOrientationEvent = function(type, init) {{
                this.type = type;
                this.alpha = Math.random() * 360;
                this.beta = Math.random() * 180 - 90;
                this.gamma = Math.random() * 180 - 90;
                Object.assign(this, init);
            }};
        }}
        """
        scripts.append(orientation_script)
        
        return scripts
    
    def validate_hardware_consistency(self, profile: Dict) -> Dict:
        """Validate hardware profile consistency"""
        issues = []
        warnings = []
        
        # Check CPU and memory consistency
        if profile['cpu_cores'] > 16 and profile['memory_gb'] < 8:
            issues.append("High CPU core count with low memory is unrealistic")
        
        # Check GPU memory consistency
        if profile['gpu_memory'] > 4096 and profile['memory_gb'] < 16:
            warnings.append("High GPU memory with low system memory may be unrealistic")
        
        # Check screen resolution consistency
        width, height = map(int, profile['screen_resolution'].split('x'))
        if width * height > 4000000 and profile['gpu_memory'] < 1024:
            warnings.append("High resolution with low GPU memory may cause performance issues")
        
        return {
            "consistent": len(issues) == 0,
            "issues": issues,
            "warnings": warnings
        }
