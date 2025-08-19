"""
Network Behavior Simulator
Provides realistic network behavior simulation for undetectable traffic
"""

import random
import time
import threading
from typing import Dict, List, Optional, Tuple
import logging
from datetime import datetime, timedelta
from enum import Enum

class NetworkType(Enum):
    """Network connection types"""
    WIFI_HOME = "wifi_home"
    WIFI_PUBLIC = "wifi_public"
    MOBILE_4G = "mobile_4g"
    MOBILE_3G = "mobile_3g"
    ETHERNET_OFFICE = "ethernet_office"
    ETHERNET_HOME = "ethernet_home"
    HOTSPOT = "hotspot"

class NetworkQuality(Enum):
    """Network quality levels"""
    EXCELLENT = "excellent"
    GOOD = "good"
    FAIR = "fair"
    POOR = "poor"
    UNSTABLE = "unstable"

class NetworkBehaviorSimulator:
    """Simulates realistic network behavior patterns"""
    
    def __init__(self, config: Dict):
        self.config = config
        self.logger = logging.getLogger(__name__)
        
        # Network profiles
        self.network_profiles = self.load_network_profiles()
        self.connection_patterns = self.load_connection_patterns()
        self.bandwidth_patterns = self.load_bandwidth_patterns()
        
        # Current state
        self.current_network = None
        self.network_history = []
        self.connection_switches = []
        self.performance_metrics = {}
        
        # Simulation state
        self.simulation_active = False
        self.network_monitor_thread = None
        
    def load_network_profiles(self) -> Dict:
        """Load realistic network profiles"""
        return {
            NetworkType.WIFI_HOME: {
                "base_speed_mbps": random.uniform(50, 200),
                "latency_ms": random.uniform(10, 50),
                "stability": 0.95,
                "peak_hours": [18, 19, 20, 21],  # Evening hours
                "congestion_patterns": {
                    "morning": 0.3,
                    "afternoon": 0.5,
                    "evening": 0.8,
                    "night": 0.2
                },
                "interference_probability": 0.1,
                "device_count": random.randint(3, 8)
            },
            NetworkType.WIFI_PUBLIC: {
                "base_speed_mbps": random.uniform(10, 50),
                "latency_ms": random.uniform(50, 150),
                "stability": 0.7,
                "peak_hours": [12, 13, 17, 18],  # Lunch and after work
                "congestion_patterns": {
                    "morning": 0.4,
                    "afternoon": 0.9,
                    "evening": 0.7,
                    "night": 0.3
                },
                "interference_probability": 0.3,
                "device_count": random.randint(20, 100)
            },
            NetworkType.MOBILE_4G: {
                "base_speed_mbps": random.uniform(20, 100),
                "latency_ms": random.uniform(30, 80),
                "stability": 0.85,
                "peak_hours": [8, 9, 17, 18],  # Commute hours
                "congestion_patterns": {
                    "morning": 0.7,
                    "afternoon": 0.5,
                    "evening": 0.8,
                    "night": 0.3
                },
                "interference_probability": 0.2,
                "signal_strength": random.uniform(0.6, 1.0)
            },
            NetworkType.MOBILE_3G: {
                "base_speed_mbps": random.uniform(1, 10),
                "latency_ms": random.uniform(100, 300),
                "stability": 0.75,
                "peak_hours": [8, 9, 17, 18],
                "congestion_patterns": {
                    "morning": 0.6,
                    "afternoon": 0.4,
                    "evening": 0.7,
                    "night": 0.2
                },
                "interference_probability": 0.25,
                "signal_strength": random.uniform(0.4, 0.8)
            },
            NetworkType.ETHERNET_OFFICE: {
                "base_speed_mbps": random.uniform(100, 1000),
                "latency_ms": random.uniform(5, 20),
                "stability": 0.98,
                "peak_hours": [9, 10, 14, 15],  # Work hours
                "congestion_patterns": {
                    "morning": 0.8,
                    "afternoon": 0.9,
                    "evening": 0.3,
                    "night": 0.1
                },
                "interference_probability": 0.02,
                "device_count": random.randint(50, 200)
            },
            NetworkType.ETHERNET_HOME: {
                "base_speed_mbps": random.uniform(100, 500),
                "latency_ms": random.uniform(5, 30),
                "stability": 0.97,
                "peak_hours": [19, 20, 21, 22],  # Evening
                "congestion_patterns": {
                    "morning": 0.2,
                    "afternoon": 0.3,
                    "evening": 0.7,
                    "night": 0.4
                },
                "interference_probability": 0.03,
                "device_count": random.randint(2, 6)
            },
            NetworkType.HOTSPOT: {
                "base_speed_mbps": random.uniform(5, 25),
                "latency_ms": random.uniform(80, 200),
                "stability": 0.6,
                "peak_hours": [12, 13, 18, 19],
                "congestion_patterns": {
                    "morning": 0.3,
                    "afternoon": 0.6,
                    "evening": 0.5,
                    "night": 0.2
                },
                "interference_probability": 0.4,
                "device_count": random.randint(5, 15)
            }
        }
    
    def load_connection_patterns(self) -> Dict:
        """Load realistic connection switching patterns"""
        return {
            "mobile_user": {
                "primary_network": NetworkType.MOBILE_4G,
                "secondary_networks": [NetworkType.WIFI_HOME, NetworkType.WIFI_PUBLIC],
                "switch_frequency": "high",
                "switch_triggers": ["location_change", "signal_quality", "cost_optimization"],
                "preferred_networks": ["wifi_home", "wifi_public", "mobile_4g"]
            },
            "home_user": {
                "primary_network": NetworkType.WIFI_HOME,
                "secondary_networks": [NetworkType.ETHERNET_HOME],
                "switch_frequency": "low",
                "switch_triggers": ["performance_issues", "maintenance"],
                "preferred_networks": ["wifi_home", "ethernet_home"]
            },
            "office_user": {
                "primary_network": NetworkType.ETHERNET_OFFICE,
                "secondary_networks": [NetworkType.WIFI_PUBLIC, NetworkType.MOBILE_4G],
                "switch_frequency": "medium",
                "switch_triggers": ["meeting_rooms", "travel", "backup"],
                "preferred_networks": ["ethernet_office", "wifi_public", "mobile_4G"]
            },
            "traveler": {
                "primary_network": NetworkType.MOBILE_4G,
                "secondary_networks": [NetworkType.WIFI_PUBLIC, NetworkType.HOTSPOT],
                "switch_frequency": "very_high",
                "switch_triggers": ["location_change", "cost", "availability"],
                "preferred_networks": ["wifi_public", "mobile_4g", "hotspot"]
            }
        }
    
    def load_bandwidth_patterns(self) -> Dict:
        """Load realistic bandwidth usage patterns"""
        return {
            "streaming_heavy": {
                "peak_usage_mbps": random.uniform(20, 50),
                "average_usage_mbps": random.uniform(10, 25),
                "usage_pattern": "bursty",
                "peak_hours": [19, 20, 21, 22],
                "content_types": ["video", "music", "gaming"]
            },
            "browsing_light": {
                "peak_usage_mbps": random.uniform(2, 8),
                "average_usage_mbps": random.uniform(0.5, 2),
                "usage_pattern": "steady",
                "peak_hours": [9, 10, 14, 15],
                "content_types": ["web", "email", "social"]
            },
            "work_productivity": {
                "peak_usage_mbps": random.uniform(5, 15),
                "average_usage_mbps": random.uniform(2, 8),
                "usage_pattern": "variable",
                "peak_hours": [9, 10, 11, 14, 15, 16],
                "content_types": ["web", "email", "cloud", "video_calls"]
            },
            "gaming_intensive": {
                "peak_usage_mbps": random.uniform(15, 40),
                "average_usage_mbps": random.uniform(8, 20),
                "usage_pattern": "bursty",
                "peak_hours": [18, 19, 20, 21, 22, 23],
                "content_types": ["gaming", "streaming", "downloads"]
            }
        }
    
    def generate_network_profile(self, user_type: str = None, location: str = None) -> Dict:
        """Generate realistic network profile for user"""
        if user_type is None:
            user_type = random.choice(list(self.connection_patterns.keys()))
        
        connection_pattern = self.connection_patterns[user_type]
        primary_network = connection_pattern["primary_network"]
        network_profile = self.network_profiles[primary_network].copy()
        
        # Add user-specific characteristics
        network_profile.update({
            "user_type": user_type,
            "location": location or "unknown",
            "connection_pattern": connection_pattern,
            "current_quality": self.calculate_network_quality(network_profile),
            "bandwidth_usage": self.generate_bandwidth_usage(user_type),
            "connection_stability": self.calculate_connection_stability(network_profile),
            "interference_level": self.calculate_interference_level(network_profile)
        })
        
        return network_profile
    
    def calculate_network_quality(self, profile: Dict) -> NetworkQuality:
        """Calculate current network quality based on profile and conditions"""
        base_stability = profile["stability"]
        current_hour = datetime.now().hour
        
        # Get congestion for current time
        time_period = self.get_time_period(current_hour)
        congestion = profile["congestion_patterns"][time_period]
        
        # Calculate quality score
        quality_score = base_stability * (1 - congestion)
        
        # Add random variation
        quality_score += random.uniform(-0.1, 0.1)
        quality_score = max(0, min(1, quality_score))
        
        # Map to quality level
        if quality_score >= 0.9:
            return NetworkQuality.EXCELLENT
        elif quality_score >= 0.7:
            return NetworkQuality.GOOD
        elif quality_score >= 0.5:
            return NetworkQuality.FAIR
        elif quality_score >= 0.3:
            return NetworkQuality.POOR
        else:
            return NetworkQuality.UNSTABLE
    
    def get_time_period(self, hour: int) -> str:
        """Get time period based on hour"""
        if 6 <= hour < 12:
            return "morning"
        elif 12 <= hour < 17:
            return "afternoon"
        elif 17 <= hour < 22:
            return "evening"
        else:
            return "night"
    
    def generate_bandwidth_usage(self, user_type: str) -> Dict:
        """Generate realistic bandwidth usage pattern"""
        usage_patterns = {
            "mobile_user": "browsing_light",
            "home_user": "streaming_heavy",
            "office_user": "work_productivity",
            "traveler": "browsing_light"
        }
        
        pattern_name = usage_patterns.get(user_type, "browsing_light")
        pattern = self.bandwidth_patterns[pattern_name].copy()
        
        # Add current usage
        current_hour = datetime.now().hour
        time_period = self.get_time_period(current_hour)
        
        if time_period in ["evening", "night"]:
            pattern["current_usage_mbps"] = pattern["peak_usage_mbps"]
        else:
            pattern["current_usage_mbps"] = pattern["average_usage_mbps"]
        
        # Add random variation
        pattern["current_usage_mbps"] *= random.uniform(0.8, 1.2)
        
        return pattern
    
    def calculate_connection_stability(self, profile: Dict) -> float:
        """Calculate connection stability score"""
        base_stability = profile["stability"]
        
        # Adjust based on interference
        interference = profile["interference_probability"]
        stability = base_stability * (1 - interference)
        
        # Add time-based variations
        current_hour = datetime.now().hour
        if current_hour in profile.get("peak_hours", []):
            stability *= 0.9  # Slightly less stable during peak hours
        
        return max(0.1, min(1.0, stability))
    
    def calculate_interference_level(self, profile: Dict) -> float:
        """Calculate current interference level"""
        base_interference = profile["interference_probability"]
        
        # Add time-based interference
        current_hour = datetime.now().hour
        time_period = self.get_time_period(current_hour)
        
        # More interference during peak hours
        if time_period in ["afternoon", "evening"]:
            base_interference *= 1.5
        
        # Add random variation
        interference = base_interference * random.uniform(0.5, 1.5)
        
        return min(1.0, interference)
    
    def simulate_connection_switch(self, current_profile: Dict) -> Dict:
        """Simulate realistic connection switching"""
        user_type = current_profile["user_type"]
        connection_pattern = current_profile["connection_pattern"]
        
        # Determine if switch should occur
        switch_probability = self.calculate_switch_probability(current_profile)
        
        if random.random() < switch_probability:
            # Select new network
            available_networks = connection_pattern["secondary_networks"]
            new_network_type = random.choice(available_networks)
            
            # Generate new profile
            new_profile = self.generate_network_profile(user_type, current_profile["location"])
            new_profile["network_type"] = new_network_type
            
            # Add switch metadata
            switch_data = {
                "from_network": current_profile.get("network_type", "unknown"),
                "to_network": new_network_type,
                "switch_reason": self.determine_switch_reason(current_profile, new_profile),
                "switch_duration": random.uniform(5, 30),  # seconds
                "timestamp": datetime.now()
            }
            
            self.connection_switches.append(switch_data)
            
            return new_profile
        
        return current_profile
    
    def calculate_switch_probability(self, profile: Dict) -> float:
        """Calculate probability of connection switching"""
        base_probability = 0.05  # 5% base probability
        
        # Adjust based on current quality
        quality = profile["current_quality"]
        if quality == NetworkQuality.UNSTABLE:
            base_probability += 0.3
        elif quality == NetworkQuality.POOR:
            base_probability += 0.2
        elif quality == NetworkQuality.FAIR:
            base_probability += 0.1
        
        # Adjust based on user type
        user_type = profile["user_type"]
        if user_type == "traveler":
            base_probability += 0.2
        elif user_type == "mobile_user":
            base_probability += 0.1
        
        # Adjust based on time
        current_hour = datetime.now().hour
        if current_hour in [8, 9, 17, 18]:  # Commute hours
            base_probability += 0.1
        
        return min(0.8, base_probability)
    
    def determine_switch_reason(self, old_profile: Dict, new_profile: Dict) -> str:
        """Determine reason for network switch"""
        reasons = [
            "signal_quality_improvement",
            "cost_optimization",
            "location_change",
            "performance_issues",
            "network_maintenance",
            "automatic_fallback"
        ]
        
        # Analyze switch characteristics
        old_quality = old_profile["current_quality"]
        new_quality = new_profile["current_quality"]
        
        if new_quality.value > old_quality.value:
            return "signal_quality_improvement"
        elif old_quality == NetworkQuality.UNSTABLE:
            return "performance_issues"
        else:
            return random.choice(reasons)
    
    def simulate_bandwidth_throttling(self, profile: Dict) -> Dict:
        """Simulate bandwidth throttling based on usage patterns"""
        current_usage = profile["bandwidth_usage"]["current_usage_mbps"]
        base_speed = profile["base_speed_mbps"]
        
        # Calculate throttling factor
        usage_ratio = current_usage / base_speed
        
        throttling_factor = 1.0
        
        if usage_ratio > 0.8:
            # Heavy usage - apply throttling
            throttling_factor = random.uniform(0.3, 0.7)
        elif usage_ratio > 0.6:
            # Moderate usage - slight throttling
            throttling_factor = random.uniform(0.7, 0.9)
        
        # Apply ISP-specific throttling patterns
        isp_throttling = self.get_isp_throttling_pattern(profile)
        throttling_factor *= isp_throttling
        
        # Update effective speed
        effective_speed = base_speed * throttling_factor
        
        return {
            "original_speed_mbps": base_speed,
            "effective_speed_mbps": effective_speed,
            "throttling_factor": throttling_factor,
            "throttling_reason": self.get_throttling_reason(usage_ratio),
            "throttling_duration": random.randint(300, 1800)  # 5-30 minutes
        }
    
    def get_isp_throttling_pattern(self, profile: Dict) -> float:
        """Get ISP-specific throttling pattern"""
        # Simulate different ISP behaviors
        isp_patterns = {
            "mobile_4g": random.uniform(0.8, 1.0),  # Mobile ISPs less aggressive
            "mobile_3g": random.uniform(0.6, 0.9),  # 3G more likely to throttle
            "wifi_home": random.uniform(0.9, 1.0),  # Home ISPs usually don't throttle
            "wifi_public": random.uniform(0.7, 1.0),  # Public WiFi may throttle
            "ethernet_office": random.uniform(0.95, 1.0),  # Office networks stable
            "ethernet_home": random.uniform(0.9, 1.0)  # Home ethernet stable
        }
        
        network_type = profile.get("network_type", "wifi_home")
        return isp_patterns.get(network_type, 1.0)
    
    def get_throttling_reason(self, usage_ratio: float) -> str:
        """Get reason for throttling"""
        if usage_ratio > 0.8:
            return "high_bandwidth_usage"
        elif usage_ratio > 0.6:
            return "moderate_bandwidth_usage"
        else:
            return "network_congestion"
    
    def simulate_network_quality_variations(self, profile: Dict) -> Dict:
        """Simulate realistic network quality variations"""
        base_quality = profile["current_quality"]
        stability = profile["connection_stability"]
        
        # Calculate variation probability
        variation_probability = 1 - stability
        
        if random.random() < variation_probability:
            # Quality degradation
            quality_levels = list(NetworkQuality)
            current_index = quality_levels.index(base_quality)
            
            # Move down one level (worse quality)
            new_index = min(len(quality_levels) - 1, current_index + 1)
            new_quality = quality_levels[new_index]
            
            return {
                "previous_quality": base_quality,
                "current_quality": new_quality,
                "variation_duration": random.randint(60, 600),  # 1-10 minutes
                "variation_reason": self.get_quality_variation_reason(),
                "recovery_probability": random.uniform(0.3, 0.8)
            }
        
        return {
            "previous_quality": base_quality,
            "current_quality": base_quality,
            "variation_duration": 0,
            "variation_reason": "none",
            "recovery_probability": 1.0
        }
    
    def get_quality_variation_reason(self) -> str:
        """Get reason for quality variation"""
        reasons = [
            "signal_interference",
            "network_congestion",
            "weather_conditions",
            "device_interference",
            "temporary_outage",
            "maintenance_work"
        ]
        
        return random.choice(reasons)
    
    def get_network_performance_metrics(self, profile: Dict) -> Dict:
        """Get comprehensive network performance metrics"""
        quality = profile["current_quality"]
        throttling = self.simulate_bandwidth_throttling(profile)
        variations = self.simulate_network_quality_variations(profile)
        
        # Calculate effective performance
        effective_speed = throttling["effective_speed_mbps"]
        latency = profile["latency_ms"]
        
        # Adjust latency based on quality
        if quality == NetworkQuality.UNSTABLE:
            latency *= random.uniform(1.5, 3.0)
        elif quality == NetworkQuality.POOR:
            latency *= random.uniform(1.2, 1.8)
        
        return {
            "download_speed_mbps": effective_speed,
            "upload_speed_mbps": effective_speed * random.uniform(0.1, 0.3),
            "latency_ms": latency,
            "packet_loss_percent": self.calculate_packet_loss(quality),
            "jitter_ms": self.calculate_jitter(quality),
            "connection_quality": quality.value,
            "throttling_active": throttling["throttling_factor"] < 1.0,
            "quality_variation": variations["variation_reason"] != "none",
            "network_stability": profile["connection_stability"],
            "interference_level": profile["interference_level"]
        }
    
    def calculate_packet_loss(self, quality: NetworkQuality) -> float:
        """Calculate packet loss percentage based on quality"""
        base_loss = {
            NetworkQuality.EXCELLENT: 0.01,
            NetworkQuality.GOOD: 0.05,
            NetworkQuality.FAIR: 0.1,
            NetworkQuality.POOR: 0.2,
            NetworkQuality.UNSTABLE: 0.5
        }
        
        return base_loss.get(quality, 0.1) * random.uniform(0.5, 1.5)
    
    def calculate_jitter(self, quality: NetworkQuality) -> float:
        """Calculate jitter based on quality"""
        base_jitter = {
            NetworkQuality.EXCELLENT: 1.0,
            NetworkQuality.GOOD: 3.0,
            NetworkQuality.FAIR: 8.0,
            NetworkQuality.POOR: 15.0,
            NetworkQuality.UNSTABLE: 30.0
        }
        
        return base_jitter.get(quality, 5.0) * random.uniform(0.8, 1.2)
    
    def start_network_monitoring(self):
        """Start continuous network monitoring"""
        if not self.simulation_active:
            self.simulation_active = True
            self.network_monitor_thread = threading.Thread(target=self._monitor_network)
            self.network_monitor_thread.daemon = True
            self.network_monitor_thread.start()
    
    def stop_network_monitoring(self):
        """Stop network monitoring"""
        self.simulation_active = False
        if self.network_monitor_thread:
            self.network_monitor_thread.join(timeout=5)
    
    def _monitor_network(self):
        """Background network monitoring thread"""
        while self.simulation_active:
            if self.current_network:
                # Update network state
                self.current_network = self.simulate_connection_switch(self.current_network)
                
                # Record metrics
                metrics = self.get_network_performance_metrics(self.current_network)
                self.performance_metrics[datetime.now()] = metrics
            
            time.sleep(30)  # Update every 30 seconds
    
    def get_network_summary(self) -> Dict:
        """Get comprehensive network behavior summary"""
        return {
            "current_network": self.current_network,
            "connection_switches": len(self.connection_switches),
            "switch_history": self.connection_switches[-10:],  # Last 10 switches
            "performance_trends": self.analyze_performance_trends(),
            "network_stability_score": self.calculate_stability_score(),
            "bandwidth_utilization": self.calculate_bandwidth_utilization()
        }
    
    def analyze_performance_trends(self) -> Dict:
        """Analyze network performance trends"""
        if not self.performance_metrics:
            return {}
        
        recent_metrics = list(self.performance_metrics.values())[-20:]  # Last 20 measurements
        
        return {
            "average_speed_mbps": sum(m["download_speed_mbps"] for m in recent_metrics) / len(recent_metrics),
            "average_latency_ms": sum(m["latency_ms"] for m in recent_metrics) / len(recent_metrics),
            "stability_trend": "stable" if len(recent_metrics) > 10 else "insufficient_data",
            "quality_distribution": self.get_quality_distribution(recent_metrics)
        }
    
    def get_quality_distribution(self, metrics: List[Dict]) -> Dict:
        """Get distribution of quality levels"""
        quality_counts = {}
        for metric in metrics:
            quality = metric["connection_quality"]
            quality_counts[quality] = quality_counts.get(quality, 0) + 1
        
        return quality_counts
    
    def calculate_stability_score(self) -> float:
        """Calculate overall network stability score"""
        if not self.performance_metrics:
            return 0.0
        
        recent_metrics = list(self.performance_metrics.values())[-10:]
        
        # Calculate stability based on consistency
        speeds = [m["download_speed_mbps"] for m in recent_metrics]
        avg_speed = sum(speeds) / len(speeds)
        
        # Calculate coefficient of variation
        if avg_speed > 0:
            cv = (sum((s - avg_speed) ** 2 for s in speeds) / len(speeds)) ** 0.5 / avg_speed
            stability = max(0, 1 - cv)
        else:
            stability = 0.0
        
        return stability
    
    def calculate_bandwidth_utilization(self) -> float:
        """Calculate current bandwidth utilization"""
        if not self.current_network:
            return 0.0
        
        current_usage = self.current_network["bandwidth_usage"]["current_usage_mbps"]
        effective_speed = self.get_network_performance_metrics(self.current_network)["download_speed_mbps"]
        
        if effective_speed > 0:
            return min(1.0, current_usage / effective_speed)
        else:
            return 0.0
