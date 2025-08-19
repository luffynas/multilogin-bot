"""
Advanced Sensor Emulator
Provides realistic sensor emulation for device fingerprinting
"""

import random
import time
import math
from typing import Dict, List, Optional, Tuple
import logging
from datetime import datetime, timedelta

class AdvancedSensorEmulator:
    """Advanced sensor emulation for realistic device behavior"""
    
    def __init__(self, config: Dict):
        self.config = config
        self.logger = logging.getLogger(__name__)
        
        # Sensor profiles for different device types
        self.sensor_profiles = {
            "desktop_windows": {
                "accelerometer": False,
                "gyroscope": False,
                "magnetometer": False,
                "ambient_light": False,
                "proximity": False,
                "geolocation": False,
                "camera": False,
                "microphone": False,
                "touch_screen": False,
                "fingerprint": False,
                "face_id": False
            },
            "desktop_mac": {
                "accelerometer": False,
                "gyroscope": False,
                "magnetometer": False,
                "ambient_light": False,
                "proximity": False,
                "geolocation": False,
                "camera": True,
                "microphone": True,
                "touch_screen": False,
                "fingerprint": False,
                "face_id": False
            },
            "laptop_windows": {
                "accelerometer": False,
                "gyroscope": False,
                "magnetometer": False,
                "ambient_light": False,
                "proximity": False,
                "geolocation": False,
                "camera": True,
                "microphone": True,
                "touch_screen": True,
                "fingerprint": False,
                "face_id": False
            },
            "mobile_android": {
                "accelerometer": True,
                "gyroscope": True,
                "magnetometer": True,
                "ambient_light": True,
                "proximity": True,
                "geolocation": True,
                "camera": True,
                "microphone": True,
                "touch_screen": True,
                "fingerprint": True,
                "face_id": True
            },
            "mobile_ios": {
                "accelerometer": True,
                "gyroscope": True,
                "magnetometer": True,
                "ambient_light": True,
                "proximity": True,
                "geolocation": True,
                "camera": True,
                "microphone": True,
                "touch_screen": True,
                "fingerprint": True,
                "face_id": True
            },
            "tablet_android": {
                "accelerometer": True,
                "gyroscope": True,
                "magnetometer": True,
                "ambient_light": True,
                "proximity": False,
                "geolocation": True,
                "camera": True,
                "microphone": True,
                "touch_screen": True,
                "fingerprint": True,
                "face_id": True
            },
            "tablet_ios": {
                "accelerometer": True,
                "gyroscope": True,
                "magnetometer": True,
                "ambient_light": True,
                "proximity": False,
                "geolocation": True,
                "camera": True,
                "microphone": True,
                "touch_screen": True,
                "fingerprint": True,
                "face_id": True
            }
        }
        
        # Sensor data patterns
        self.sensor_patterns = {
            "accelerometer": {
                "x_range": (-10, 10),  # m/s²
                "y_range": (-10, 10),
                "z_range": (9.5, 10.5),  # Gravity
                "noise_level": 0.1,
                "update_frequency": 60  # Hz
            },
            "gyroscope": {
                "x_range": (-5, 5),  # rad/s
                "y_range": (-5, 5),
                "z_range": (-5, 5),
                "noise_level": 0.05,
                "update_frequency": 60
            },
            "magnetometer": {
                "x_range": (-50, 50),  # μT
                "y_range": (-50, 50),
                "z_range": (-50, 50),
                "noise_level": 1.0,
                "update_frequency": 10
            },
            "ambient_light": {
                "range": (0, 1000),  # lux
                "noise_level": 10,
                "update_frequency": 1
            },
            "proximity": {
                "range": (0, 10),  # cm
                "noise_level": 0.5,
                "update_frequency": 10
            }
        }
        
        # Sensor state tracking
        self.current_sensor_state = {}
        self.sensor_history = []
        
    def generate_sensor_profile(self, device_type: str) -> Dict:
        """Generate realistic sensor profile for device type"""
        base_profile = self.sensor_profiles.get(device_type, self.sensor_profiles["desktop_windows"])
        
        # Add sensor-specific characteristics
        sensor_profile = {
            "device_type": device_type,
            "sensors": base_profile.copy(),
            "sensor_characteristics": {}
        }
        
        # Add characteristics for available sensors
        for sensor_name, is_available in base_profile.items():
            if is_available:
                sensor_profile["sensor_characteristics"][sensor_name] = self._generate_sensor_characteristics(sensor_name, device_type)
        
        return sensor_profile
    
    def _generate_sensor_characteristics(self, sensor_name: str, device_type: str) -> Dict:
        """Generate characteristics for specific sensor"""
        base_pattern = self.sensor_patterns.get(sensor_name, {})
        
        if sensor_name == "accelerometer":
            return {
                "x_range": base_pattern["x_range"],
                "y_range": base_pattern["y_range"],
                "z_range": base_pattern["z_range"],
                "noise_level": base_pattern["noise_level"],
                "update_frequency": base_pattern["update_frequency"],
                "calibration_offset": {
                    "x": random.uniform(-0.5, 0.5),
                    "y": random.uniform(-0.5, 0.5),
                    "z": random.uniform(-0.2, 0.2)
                }
            }
        elif sensor_name == "gyroscope":
            return {
                "x_range": base_pattern["x_range"],
                "y_range": base_pattern["y_range"],
                "z_range": base_pattern["z_range"],
                "noise_level": base_pattern["noise_level"],
                "update_frequency": base_pattern["update_frequency"],
                "drift_rate": random.uniform(0.001, 0.01)  # rad/s²
            }
        elif sensor_name == "magnetometer":
            return {
                "x_range": base_pattern["x_range"],
                "y_range": base_pattern["y_range"],
                "z_range": base_pattern["z_range"],
                "noise_level": base_pattern["noise_level"],
                "update_frequency": base_pattern["update_frequency"],
                "magnetic_declination": random.uniform(-20, 20)  # degrees
            }
        elif sensor_name == "ambient_light":
            return {
                "range": base_pattern["range"],
                "noise_level": base_pattern["noise_level"],
                "update_frequency": base_pattern["update_frequency"],
                "sensitivity": random.uniform(0.8, 1.2)
            }
        elif sensor_name == "proximity":
            return {
                "range": base_pattern["range"],
                "noise_level": base_pattern["noise_level"],
                "update_frequency": base_pattern["update_frequency"],
                "detection_threshold": random.uniform(2, 5)  # cm
            }
        else:
            return base_pattern
    
    def generate_sensor_data(self, sensor_name: str, sensor_profile: Dict) -> Dict:
        """Generate realistic sensor data"""
        if not sensor_profile["sensors"].get(sensor_name, False):
            return None
        
        characteristics = sensor_profile["sensor_characteristics"].get(sensor_name, {})
        
        if sensor_name == "accelerometer":
            return self._generate_accelerometer_data(characteristics)
        elif sensor_name == "gyroscope":
            return self._generate_gyroscope_data(characteristics)
        elif sensor_name == "magnetometer":
            return self._generate_magnetometer_data(characteristics)
        elif sensor_name == "ambient_light":
            return self._generate_ambient_light_data(characteristics)
        elif sensor_name == "proximity":
            return self._generate_proximity_data(characteristics)
        else:
            return None
    
    def _generate_accelerometer_data(self, characteristics: Dict) -> Dict:
        """Generate realistic accelerometer data"""
        # Simulate device movement
        movement_factor = random.uniform(0, 1)
        
        x = random.uniform(*characteristics["x_range"]) * movement_factor
        y = random.uniform(*characteristics["y_range"]) * movement_factor
        z = random.uniform(*characteristics["z_range"])  # Always close to gravity
        
        # Add calibration offset
        x += characteristics["calibration_offset"]["x"]
        y += characteristics["calibration_offset"]["y"]
        z += characteristics["calibration_offset"]["z"]
        
        # Add noise
        noise = characteristics["noise_level"]
        x += random.uniform(-noise, noise)
        y += random.uniform(-noise, noise)
        z += random.uniform(-noise, noise)
        
        return {
            "x": round(x, 3),
            "y": round(y, 3),
            "z": round(z, 3),
            "timestamp": time.time()
        }
    
    def _generate_gyroscope_data(self, characteristics: Dict) -> Dict:
        """Generate realistic gyroscope data"""
        # Simulate device rotation
        rotation_factor = random.uniform(0, 1)
        
        x = random.uniform(*characteristics["x_range"]) * rotation_factor
        y = random.uniform(*characteristics["y_range"]) * rotation_factor
        z = random.uniform(*characteristics["z_range"]) * rotation_factor
        
        # Add drift
        drift = characteristics["drift_rate"]
        x += drift * random.uniform(-1, 1)
        y += drift * random.uniform(-1, 1)
        z += drift * random.uniform(-1, 1)
        
        # Add noise
        noise = characteristics["noise_level"]
        x += random.uniform(-noise, noise)
        y += random.uniform(-noise, noise)
        z += random.uniform(-noise, noise)
        
        return {
            "x": round(x, 4),
            "y": round(y, 4),
            "z": round(z, 4),
            "timestamp": time.time()
        }
    
    def _generate_magnetometer_data(self, characteristics: Dict) -> Dict:
        """Generate realistic magnetometer data"""
        # Simulate magnetic field
        declination = characteristics["magnetic_declination"]
        
        # Earth's magnetic field components
        x = 25 * math.cos(math.radians(declination))
        y = 25 * math.sin(math.radians(declination))
        z = -50  # Downward component
        
        # Add noise
        noise = characteristics["noise_level"]
        x += random.uniform(-noise, noise)
        y += random.uniform(-noise, noise)
        z += random.uniform(-noise, noise)
        
        return {
            "x": round(x, 1),
            "y": round(y, 1),
            "z": round(z, 1),
            "timestamp": time.time()
        }
    
    def _generate_ambient_light_data(self, characteristics: Dict) -> Dict:
        """Generate realistic ambient light data"""
        # Simulate different lighting conditions
        lighting_conditions = [
            (0, 50),      # Dark
            (50, 200),    # Dim
            (200, 500),   # Normal indoor
            (500, 1000)   # Bright indoor
        ]
        
        condition = random.choice(lighting_conditions)
        value = random.uniform(*condition)
        
        # Apply sensitivity
        value *= characteristics["sensitivity"]
        
        # Add noise
        noise = characteristics["noise_level"]
        value += random.uniform(-noise, noise)
        
        return {
            "value": max(0, round(value)),
            "timestamp": time.time()
        }
    
    def _generate_proximity_data(self, characteristics: Dict) -> Dict:
        """Generate realistic proximity data"""
        # Simulate proximity detection
        threshold = characteristics["detection_threshold"]
        
        # Random proximity state
        if random.random() < 0.1:  # 10% chance of close proximity
            value = random.uniform(0, threshold)
        else:
            value = random.uniform(threshold, characteristics["range"][1])
        
        # Add noise
        noise = characteristics["noise_level"]
        value += random.uniform(-noise, noise)
        
        return {
            "value": max(0, round(value, 1)),
            "timestamp": time.time()
        }
    
    def get_sensor_emulation_scripts(self, sensor_profile: Dict) -> List[str]:
        """Get JavaScript scripts for sensor emulation"""
        scripts = []
        
        # Basic sensor availability
        sensor_script = """
        // Sensor Availability Emulation
        window.sensorAvailability = {
        """
        
        for sensor_name, is_available in sensor_profile["sensors"].items():
            sensor_script += f'    "{sensor_name}": {str(is_available).lower()},\n'
        
        sensor_script += "};\n"
        scripts.append(sensor_script)
        
        # Accelerometer emulation
        if sensor_profile["sensors"]["accelerometer"]:
            accel_script = """
            // Accelerometer Emulation
            if ('Accelerometer' in window) {
                const originalAccelerometer = window.Accelerometer;
                window.Accelerometer = function(options) {
                    const sensor = new originalAccelerometer(options);
                    
                    // Override reading
                    Object.defineProperty(sensor, 'reading', {
                        get: () => ({
                            x: window.accelerometerData?.x || 0,
                            y: window.accelerometerData?.y || 0,
                            z: window.accelerometerData?.z || 9.81,
                            timestamp: window.accelerometerData?.timestamp || Date.now()
                        })
                    });
                    
                    return sensor;
                };
            }
            """
            scripts.append(accel_script)
        
        # Gyroscope emulation
        if sensor_profile["sensors"]["gyroscope"]:
            gyro_script = """
            // Gyroscope Emulation
            if ('Gyroscope' in window) {
                const originalGyroscope = window.Gyroscope;
                window.Gyroscope = function(options) {
                    const sensor = new originalGyroscope(options);
                    
                    // Override reading
                    Object.defineProperty(sensor, 'reading', {
                        get: () => ({
                            x: window.gyroscopeData?.x || 0,
                            y: window.gyroscopeData?.y || 0,
                            z: window.gyroscopeData?.z || 0,
                            timestamp: window.gyroscopeData?.timestamp || Date.now()
                        })
                    });
                    
                    return sensor;
                };
            }
            """
            scripts.append(gyro_script)
        
        # Ambient Light Sensor emulation
        if sensor_profile["sensors"]["ambient_light"]:
            light_script = """
            // Ambient Light Sensor Emulation
            if ('AmbientLightSensor' in window) {
                const originalAmbientLightSensor = window.AmbientLightSensor;
                window.AmbientLightSensor = function(options) {
                    const sensor = new originalAmbientLightSensor(options);
                    
                    // Override reading
                    Object.defineProperty(sensor, 'reading', {
                        get: () => ({
                            illuminance: window.ambientLightData?.value || 500,
                            timestamp: window.ambientLightData?.timestamp || Date.now()
                        })
                    });
                    
                    return sensor;
                };
            }
            """
            scripts.append(light_script)
        
        # Proximity Sensor emulation
        if sensor_profile["sensors"]["proximity"]:
            proximity_script = """
            // Proximity Sensor Emulation
            if ('ProximitySensor' in window) {
                const originalProximitySensor = window.ProximitySensor;
                window.ProximitySensor = function(options) {
                    const sensor = new originalProximitySensor(options);
                    
                    // Override reading
                    Object.defineProperty(sensor, 'reading', {
                        get: () => ({
                            distance: window.proximityData?.value || 10,
                            timestamp: window.proximityData?.timestamp || Date.now()
                        })
                    });
                    
                    return sensor;
                };
            }
            """
            scripts.append(proximity_script)
        
        return scripts
    
    def update_sensor_data(self, sensor_profile: Dict) -> Dict:
        """Update sensor data in real-time"""
        updated_data = {}
        
        for sensor_name in sensor_profile["sensors"]:
            if sensor_profile["sensors"][sensor_name]:
                data = self.generate_sensor_data(sensor_name, sensor_profile)
                if data:
                    updated_data[sensor_name] = data
        
        # Store in history
        self.sensor_history.append({
            "timestamp": time.time(),
            "data": updated_data
        })
        
        # Keep only recent history
        if len(self.sensor_history) > 1000:
            self.sensor_history = self.sensor_history[-1000:]
        
        return updated_data
    
    def get_sensor_analytics(self) -> Dict:
        """Get sensor analytics summary"""
        return {
            "total_sensor_readings": len(self.sensor_history),
            "sensor_utilization": self._calculate_sensor_utilization(),
            "data_quality_metrics": self._calculate_data_quality(),
            "sensor_patterns": self._analyze_sensor_patterns()
        }
    
    def _calculate_sensor_utilization(self) -> Dict:
        """Calculate sensor utilization rates"""
        if not self.sensor_history:
            return {}
        
        sensor_counts = {}
        total_readings = len(self.sensor_history)
        
        for reading in self.sensor_history:
            for sensor_name in reading["data"]:
                sensor_counts[sensor_name] = sensor_counts.get(sensor_name, 0) + 1
        
        return {
            sensor: count / total_readings 
            for sensor, count in sensor_counts.items()
        }
    
    def _calculate_data_quality(self) -> Dict:
        """Calculate data quality metrics"""
        if not self.sensor_history:
            return {}
        
        quality_metrics = {}
        
        for sensor_name in ["accelerometer", "gyroscope", "magnetometer", "ambient_light", "proximity"]:
            sensor_data = [
                reading["data"][sensor_name] 
                for reading in self.sensor_history 
                if sensor_name in reading["data"]
            ]
            
            if sensor_data:
                # Calculate variance as quality indicator
                values = [data.get("x", data.get("value", 0)) for data in sensor_data]
                variance = sum((x - sum(values)/len(values))**2 for x in values) / len(values)
                quality_metrics[sensor_name] = {
                    "variance": variance,
                    "readings_count": len(sensor_data),
                    "data_consistency": 1.0 / (1.0 + variance)
                }
        
        return quality_metrics
    
    def _analyze_sensor_patterns(self) -> Dict:
        """Analyze sensor usage patterns"""
        if not self.sensor_history:
            return {}
        
        # Analyze temporal patterns
        timestamps = [reading["timestamp"] for reading in self.sensor_history]
        intervals = [timestamps[i+1] - timestamps[i] for i in range(len(timestamps)-1)]
        
        return {
            "average_interval": sum(intervals) / len(intervals) if intervals else 0,
            "update_frequency": len(self.sensor_history) / max(1, (timestamps[-1] - timestamps[0]) / 3600),  # per hour
            "data_continuity": len([i for i in intervals if i < 1.0]) / len(intervals) if intervals else 0
        }
