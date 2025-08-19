"""
Hardware Emulator
Provides realistic hardware fingerprint emulation for undetectable traffic
"""

import random
import platform
import psutil
from typing import Dict, List, Optional
import logging

class HardwareEmulator:
    """Emulates realistic hardware characteristics"""
    
    def __init__(self, config: Dict):
        self.config = config
        self.logger = logging.getLogger(__name__)
        
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
    
    def generate_hardware_profile(self, device_type: str = None, 
                                geo_location: str = None) -> Dict:
        """Generate realistic hardware profile"""
        if device_type is None:
            device_type = random.choice(list(self.hardware_profiles.keys()))
        
        profile = self.hardware_profiles[device_type]
        
        hardware_profile = {
            "device_type": device_type,
            "cpu": {
                "cores": random.choice(profile["cpu_cores"]),
                "model": random.choice(profile["cpu_models"]),
                "architecture": self._get_architecture(device_type)
            },
            "memory": {
                "size_gb": random.choice(profile["memory_sizes"]),
                "available_gb": lambda: random.uniform(0.7, 0.95) * hardware_profile["memory"]["size_gb"]
            },
            "gpu": {
                "model": random.choice(profile["gpu_models"]),
                "memory_mb": random.choice([512, 1024, 2048, 4096, 8192])
            },
            "display": {
                "resolution": random.choice(profile["screen_resolutions"]),
                "color_depth": random.choice(profile["color_depths"]),
                "pixel_ratio": random.choice(profile["pixel_ratios"]),
                "orientation": "landscape"
            },
            "network": self._generate_network_profile(),
            "battery": self._generate_battery_profile(device_type),
            "sensors": self._generate_sensor_profile(),
            "timezone": self._get_timezone_for_geo(geo_location),
            "language": self._get_language_for_geo(geo_location)
        }
        
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
            "ID": "Asia/Jakarta",
            "US": "America/New_York",
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
            "ID": "id-ID",
            "US": "en-US",
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
            get: () => {profile['cpu']['cores']}
        }});
        
        Object.defineProperty(navigator, 'deviceMemory', {{
            get: () => {profile['memory']['size_gb']}
        }});
        """
        scripts.append(cpu_script)
        
        # Screen characteristics
        width, height = profile['display']['resolution'].split('x')
        screen_script = f"""
        Object.defineProperty(screen, 'width', {{
            get: () => {width}
        }});
        
        Object.defineProperty(screen, 'height', {{
            get: () => {height}
        }});
        
        Object.defineProperty(screen, 'colorDepth', {{
            get: () => {profile['display']['color_depth']}
        }});
        
        Object.defineProperty(window, 'devicePixelRatio', {{
            get: () => {profile['display']['pixel_ratio']}
        }});
        """
        scripts.append(screen_script)
        
        # Network characteristics
        network_script = f"""
        if (navigator.connection) {{
            Object.defineProperty(navigator.connection, 'effectiveType', {{
                get: () => '{profile['network']['effective_type']}'
            }});
            
            Object.defineProperty(navigator.connection, 'rtt', {{
                get: () => {profile['network']['rtt']}
            }});
            
            Object.defineProperty(navigator.connection, 'downlink', {{
                get: () => {profile['network']['downlink']}
            }});
            
            Object.defineProperty(navigator.connection, 'saveData', {{
                get: () => {str(profile['network']['save_data']).lower()}
            }});
        }}
        """
        scripts.append(network_script)
        
        # Battery characteristics
        battery_script = f"""
        if (navigator.getBattery) {{
            navigator.getBattery = function() {{
                return Promise.resolve({{
                    charging: {str(profile['battery']['charging']).lower()},
                    level: {profile['battery']['level']},
                    chargingTime: {profile['battery']['charging_time']},
                    dischargingTime: {profile['battery']['discharging_time']}
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
                get: () => {str(profile['sensors']['accelerometer']).lower()} ? Accelerometer : undefined
            }});
        }}
        
        if ('Gyroscope' in window) {{
            Object.defineProperty(window, 'Gyroscope', {{
                get: () => {str(profile['sensors']['gyroscope']).lower()} ? Gyroscope : undefined
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
        if profile['cpu']['cores'] > 16 and profile['memory']['size_gb'] < 8:
            issues.append("High CPU core count with low memory is unrealistic")
        
        # Check GPU memory consistency
        if profile['gpu']['memory_mb'] > 4096 and profile['memory']['size_gb'] < 16:
            warnings.append("High GPU memory with low system memory may be unrealistic")
        
        # Check screen resolution consistency
        width, height = map(int, profile['display']['resolution'].split('x'))
        if width * height > 4000000 and profile['gpu']['memory_mb'] < 1024:
            warnings.append("High resolution with low GPU memory may cause performance issues")
        
        return {
            "consistent": len(issues) == 0,
            "issues": issues,
            "warnings": warnings
        }
