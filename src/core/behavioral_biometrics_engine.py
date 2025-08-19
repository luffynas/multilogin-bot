"""
Behavioral Biometrics Engine
Provides advanced human behavioral pattern analysis and simulation
"""

import random
import time
import json
import math
from typing import Dict, List, Optional, Tuple, Any
import logging
from datetime import datetime, timedelta
from collections import defaultdict, deque
import numpy as np

class BehavioralBiometricsEngine:
    """Advanced behavioral biometrics for ultra-realistic human simulation"""
    
    def __init__(self, config: Dict):
        self.config = config
        self.logger = logging.getLogger(__name__)
        
        # Behavioral patterns
        self.typing_patterns = self.load_typing_patterns()
        self.scrolling_patterns = self.load_scrolling_patterns()
        self.click_patterns = self.load_click_patterns()
        self.eye_movement_patterns = self.load_eye_movement_patterns()
        
        # Biometric profiles
        self.biometric_profiles = self.generate_biometric_profiles()
        self.behavioral_signatures = {}
        
        # Real-time tracking
        self.current_session = {}
        self.behavioral_history = deque(maxlen=1000)
        
    def load_typing_patterns(self) -> Dict:
        """Load realistic typing behavior patterns"""
        return {
            "typing_speeds": {
                "slow": {"wpm": (20, 35), "accuracy": (0.85, 0.95), "pause_frequency": "high"},
                "average": {"wpm": (35, 50), "accuracy": (0.90, 0.98), "pause_frequency": "medium"},
                "fast": {"wpm": (50, 80), "accuracy": (0.80, 0.95), "pause_frequency": "low"},
                "expert": {"wpm": (80, 120), "accuracy": (0.85, 0.98), "pause_frequency": "very_low"}
            },
            "typing_characteristics": {
                "pause_patterns": {
                    "natural_pauses": [(0.1, 0.3), (0.5, 1.2), (2.0, 5.0)],  # seconds
                    "error_correction_pauses": [(1.0, 3.0)],
                    "thinking_pauses": [(3.0, 10.0)]
                },
                "key_press_durations": {
                    "short": (0.05, 0.15),
                    "medium": (0.15, 0.25),
                    "long": (0.25, 0.4)
                },
                "typing_rhythm": {
                    "consistent": {"variation": 0.1},
                    "variable": {"variation": 0.3},
                    "irregular": {"variation": 0.5}
                }
            },
            "error_patterns": {
                "common_errors": ["teh", "adn", "recieve", "seperate", "definately"],
                "error_frequency": {
                    "low": 0.01,  # 1% error rate
                    "medium": 0.03,  # 3% error rate
                    "high": 0.05   # 5% error rate
                },
                "correction_patterns": {
                    "immediate": 0.7,  # 70% corrected immediately
                    "delayed": 0.2,    # 20% corrected after pause
                    "never": 0.1       # 10% never corrected
                }
            }
        }
    
    def load_scrolling_patterns(self) -> Dict:
        """Load realistic scrolling behavior patterns"""
        return {
            "scroll_types": {
                "smooth": {
                    "speed": (50, 150),  # pixels per second
                    "acceleration": "gradual",
                    "deceleration": "smooth",
                    "frequency": "continuous"
                },
                "jerky": {
                    "speed": (100, 300),
                    "acceleration": "sudden",
                    "deceleration": "abrupt",
                    "frequency": "intermittent"
                },
                "precise": {
                    "speed": (20, 80),
                    "acceleration": "controlled",
                    "deceleration": "precise",
                    "frequency": "measured"
                }
            },
            "scroll_behavior": {
                "reading_scroll": {
                    "pattern": "linear_downward",
                    "speed_variation": 0.2,
                    "pause_frequency": "medium",
                    "backtrack_probability": 0.1
                },
                "browsing_scroll": {
                    "pattern": "variable",
                    "speed_variation": 0.5,
                    "pause_frequency": "high",
                    "backtrack_probability": 0.3
                },
                "searching_scroll": {
                    "pattern": "rapid_scanning",
                    "speed_variation": 0.8,
                    "pause_frequency": "low",
                    "backtrack_probability": 0.2
                }
            },
            "scroll_characteristics": {
                "momentum": {
                    "enabled": True,
                    "friction_factor": 0.95,
                    "max_momentum": 500
                },
                "overshoot": {
                    "probability": 0.3,
                    "correction_speed": (0.5, 2.0)
                },
                "micro_adjustments": {
                    "frequency": 0.4,
                    "magnitude": (5, 20)
                }
            }
        }
    
    def load_click_patterns(self) -> Dict:
        """Load realistic clicking behavior patterns"""
        return {
            "click_types": {
                "single_click": {
                    "duration": (0.05, 0.15),
                    "pressure": "normal",
                    "accuracy": (0.95, 0.99)
                },
                "double_click": {
                    "interval": (0.2, 0.4),
                    "duration": (0.05, 0.12),
                    "accuracy": (0.90, 0.98)
                },
                "right_click": {
                    "duration": (0.1, 0.25),
                    "pressure": "light",
                    "accuracy": (0.85, 0.95)
                },
                "drag_click": {
                    "duration": (0.5, 3.0),
                    "pressure": "variable",
                    "accuracy": (0.80, 0.95)
                }
            },
            "click_characteristics": {
                "pre_click_pause": {
                    "min": 0.1,
                    "max": 2.0,
                    "variation": 0.3
                },
                "post_click_pause": {
                    "min": 0.05,
                    "max": 1.0,
                    "variation": 0.4
                },
                "click_precision": {
                    "target_offset": (2, 8),  # pixels from target center
                    "miss_probability": 0.02
                }
            },
            "click_patterns": {
                "confident": {
                    "speed": "fast",
                    "accuracy": "high",
                    "hesitation": "low"
                },
                "cautious": {
                    "speed": "slow",
                    "accuracy": "very_high",
                    "hesitation": "high"
                },
                "casual": {
                    "speed": "medium",
                    "accuracy": "medium",
                    "hesitation": "medium"
                }
            }
        }
    
    def load_eye_movement_patterns(self) -> Dict:
        """Load realistic eye movement patterns"""
        return {
            "saccade_patterns": {
                "reading": {
                    "saccade_length": (5, 15),  # characters
                    "fixation_duration": (0.2, 0.4),  # seconds
                    "regression_probability": 0.15
                },
                "scanning": {
                    "saccade_length": (20, 50),
                    "fixation_duration": (0.1, 0.25),
                    "regression_probability": 0.05
                },
                "searching": {
                    "saccade_length": (30, 80),
                    "fixation_duration": (0.15, 0.3),
                    "regression_probability": 0.25
                }
            },
            "visual_attention": {
                "foveal_vision": {
                    "radius": 2,  # degrees
                    "acuity": "high"
                },
                "parafoveal_vision": {
                    "radius": 5,  # degrees
                    "acuity": "medium"
                },
                "peripheral_vision": {
                    "radius": 10,  # degrees
                    "acuity": "low"
                }
            },
            "attention_patterns": {
                "focused": {
                    "attention_span": (10, 30),  # seconds
                    "distraction_resistance": "high",
                    "refocus_speed": "fast"
                },
                "distracted": {
                    "attention_span": (3, 10),
                    "distraction_resistance": "low",
                    "refocus_speed": "slow"
                },
                "adaptive": {
                    "attention_span": (5, 20),
                    "distraction_resistance": "medium",
                    "refocus_speed": "medium"
                }
            }
        }
    
    def generate_biometric_profiles(self) -> Dict:
        """Generate realistic biometric profiles"""
        profiles = {}
        
        # Generate different user types
        user_types = ["expert", "experienced", "casual", "novice", "elderly"]
        
        for user_type in user_types:
            profile = {
                "typing_profile": self.generate_typing_profile(user_type),
                "scrolling_profile": self.generate_scrolling_profile(user_type),
                "clicking_profile": self.generate_clicking_profile(user_type),
                "eye_movement_profile": self.generate_eye_movement_profile(user_type),
                "behavioral_signature": self.generate_behavioral_signature(user_type)
            }
            
            profiles[user_type] = profile
        
        return profiles
    
    def generate_typing_profile(self, user_type: str) -> Dict:
        """Generate typing profile for user type"""
        typing_speeds = self.typing_patterns["typing_speeds"]
        
        if user_type == "expert":
            speed_profile = typing_speeds["expert"]
            rhythm = "consistent"
            error_rate = "low"
        elif user_type == "experienced":
            speed_profile = typing_speeds["fast"]
            rhythm = "consistent"
            error_rate = "low"
        elif user_type == "casual":
            speed_profile = typing_speeds["average"]
            rhythm = "variable"
            error_rate = "medium"
        elif user_type == "novice":
            speed_profile = typing_speeds["slow"]
            rhythm = "irregular"
            error_rate = "high"
        else:  # elderly
            speed_profile = typing_speeds["slow"]
            rhythm = "irregular"
            error_rate = "high"
        
        return {
            "wpm_range": speed_profile["wpm"],
            "accuracy_range": speed_profile["accuracy"],
            "pause_frequency": speed_profile["pause_frequency"],
            "typing_rhythm": rhythm,
            "error_rate": error_rate,
            "key_press_duration": self.typing_patterns["typing_characteristics"]["key_press_durations"]["medium"],
            "pause_patterns": self.typing_patterns["typing_characteristics"]["pause_patterns"]
        }
    
    def generate_scrolling_profile(self, user_type: str) -> Dict:
        """Generate scrolling profile for user type"""
        scroll_types = self.scrolling_patterns["scroll_types"]
        
        if user_type in ["expert", "experienced"]:
            scroll_type = "precise"
            behavior = "reading_scroll"
        elif user_type == "casual":
            scroll_type = "smooth"
            behavior = "browsing_scroll"
        else:  # novice, elderly
            scroll_type = "jerky"
            behavior = "searching_scroll"
        
        return {
            "scroll_type": scroll_type,
            "scroll_behavior": behavior,
            "speed_range": scroll_types[scroll_type]["speed"],
            "acceleration": scroll_types[scroll_type]["acceleration"],
            "deceleration": scroll_types[scroll_type]["deceleration"],
            "frequency": scroll_types[scroll_type]["frequency"],
            "momentum_enabled": self.scrolling_patterns["scroll_characteristics"]["momentum"]["enabled"],
            "overshoot_probability": self.scrolling_patterns["scroll_characteristics"]["overshoot"]["probability"]
        }
    
    def generate_clicking_profile(self, user_type: str) -> Dict:
        """Generate clicking profile for user type"""
        click_patterns = self.click_patterns["click_patterns"]
        
        if user_type == "expert":
            pattern = "confident"
        elif user_type == "experienced":
            pattern = "confident"
        elif user_type == "casual":
            pattern = "casual"
        else:  # novice, elderly
            pattern = "cautious"
        
        return {
            "click_pattern": pattern,
            "speed": click_patterns[pattern]["speed"],
            "accuracy": click_patterns[pattern]["accuracy"],
            "hesitation": click_patterns[pattern]["hesitation"],
            "pre_click_pause": self.click_patterns["click_characteristics"]["pre_click_pause"],
            "post_click_pause": self.click_patterns["click_characteristics"]["post_click_pause"],
            "click_precision": self.click_patterns["click_characteristics"]["click_precision"]
        }
    
    def generate_eye_movement_profile(self, user_type: str) -> Dict:
        """Generate eye movement profile for user type"""
        attention_patterns = self.eye_movement_patterns["attention_patterns"]
        
        if user_type == "expert":
            attention = "focused"
            saccade_pattern = "reading"
        elif user_type == "experienced":
            attention = "focused"
            saccade_pattern = "reading"
        elif user_type == "casual":
            attention = "adaptive"
            saccade_pattern = "scanning"
        else:  # novice, elderly
            attention = "distracted"
            saccade_pattern = "searching"
        
        return {
            "attention_pattern": attention,
            "saccade_pattern": saccade_pattern,
            "attention_span": attention_patterns[attention]["attention_span"],
            "distraction_resistance": attention_patterns[attention]["distraction_resistance"],
            "refocus_speed": attention_patterns[attention]["refocus_speed"],
            "foveal_radius": self.eye_movement_patterns["visual_attention"]["foveal_vision"]["radius"],
            "parafoveal_radius": self.eye_movement_patterns["visual_attention"]["parafoveal_vision"]["radius"]
        }
    
    def generate_behavioral_signature(self, user_type: str) -> Dict:
        """Generate unique behavioral signature"""
        signature = {
            "typing_signature": {
                "rhythm_consistency": random.uniform(0.7, 0.95),
                "pause_patterns": self.generate_pause_patterns(user_type),
                "error_correction_style": random.choice(["immediate", "delayed", "selective"]),
                "typing_confidence": random.uniform(0.6, 0.95)
            },
            "mouse_signature": {
                "movement_smoothness": random.uniform(0.6, 0.95),
                "click_precision": random.uniform(0.7, 0.98),
                "hover_patterns": self.generate_hover_patterns(user_type),
                "mouse_speed_preference": random.choice(["slow", "medium", "fast"])
            },
            "scrolling_signature": {
                "scroll_smoothness": random.uniform(0.5, 0.95),
                "scroll_speed_preference": random.uniform(0.3, 1.0),
                "scroll_pattern_consistency": random.uniform(0.6, 0.9),
                "overshoot_frequency": random.uniform(0.1, 0.4)
            },
            "attention_signature": {
                "focus_duration": random.uniform(0.5, 1.5),
                "distraction_sensitivity": random.uniform(0.2, 0.8),
                "refocus_ability": random.uniform(0.4, 0.9),
                "multitasking_capacity": random.uniform(0.3, 0.8)
            }
        }
        
        return signature
    
    def generate_pause_patterns(self, user_type: str) -> List[float]:
        """Generate realistic pause patterns"""
        if user_type in ["expert", "experienced"]:
            # Shorter, more consistent pauses
            pauses = [random.uniform(0.1, 0.5) for _ in range(5)]
        elif user_type == "casual":
            # Variable pauses
            pauses = [random.uniform(0.2, 1.0) for _ in range(5)]
        else:  # novice, elderly
            # Longer, more frequent pauses
            pauses = [random.uniform(0.5, 2.0) for _ in range(5)]
        
        return pauses
    
    def generate_hover_patterns(self, user_type: str) -> Dict:
        """Generate hover behavior patterns"""
        if user_type in ["expert", "experienced"]:
            return {
                "hover_duration": (0.1, 0.3),
                "hover_frequency": "low",
                "hover_precision": "high"
            }
        elif user_type == "casual":
            return {
                "hover_duration": (0.2, 0.8),
                "hover_frequency": "medium",
                "hover_precision": "medium"
            }
        else:  # novice, elderly
            return {
                "hover_duration": (0.5, 1.5),
                "hover_frequency": "high",
                "hover_precision": "low"
            }
    
    def simulate_typing_behavior(self, text: str, user_type: str = "casual") -> List[Dict]:
        """Simulate realistic typing behavior"""
        profile = self.biometric_profiles[user_type]["typing_profile"]
        signature = self.biometric_profiles[user_type]["behavioral_signature"]["typing_signature"]
        
        typing_events = []
        current_time = 0.0
        
        # Split text into words
        words = text.split()
        
        for word in words:
            # Calculate typing time for word
            wpm = random.uniform(*profile["wpm_range"])
            word_time = (len(word) / 5) * (60 / wpm)  # 5 characters per word average
            
            # Add typing events for each character
            for char in word:
                # Key press duration
                press_duration = random.uniform(*profile["key_press_duration"])
                
                # Add key press event
                typing_events.append({
                    "type": "key_press",
                    "character": char,
                    "timestamp": current_time,
                    "duration": press_duration,
                    "pressure": "normal"
                })
                
                current_time += press_duration
                
                # Add key release event
                typing_events.append({
                    "type": "key_release",
                    "character": char,
                    "timestamp": current_time,
                    "duration": 0.0
                })
                
                # Inter-key delay
                if char != word[-1]:  # Not last character in word
                    delay = random.uniform(0.05, 0.15) * signature["rhythm_consistency"]
                    current_time += delay
            
            # Word completion pause
            if word != words[-1]:  # Not last word
                pause_duration = random.choice(profile["pause_patterns"]["natural_pauses"])
                pause_duration *= random.uniform(0.8, 1.2)  # Add variation
                current_time += pause_duration
        
        return typing_events
    
    def simulate_scrolling_behavior(self, scroll_distance: int, user_type: str = "casual") -> List[Dict]:
        """Simulate realistic scrolling behavior"""
        profile = self.biometric_profiles[user_type]["scrolling_profile"]
        signature = self.biometric_profiles[user_type]["behavioral_signature"]["scrolling_signature"]
        
        scroll_events = []
        current_position = 0
        current_time = 0.0
        
        # Calculate scroll speed
        speed = random.uniform(*profile["speed_range"])
        speed *= signature["scroll_speed_preference"]
        
        # Generate scroll events
        while current_position < scroll_distance:
            # Scroll step size
            step_size = random.randint(10, 50)
            step_size = min(step_size, scroll_distance - current_position)
            
            # Step duration
            step_duration = step_size / speed
            
            # Add scroll event
            scroll_events.append({
                "type": "scroll",
                "direction": "down",
                "distance": step_size,
                "timestamp": current_time,
                "duration": step_duration,
                "smoothness": signature["scroll_smoothness"]
            })
            
            current_position += step_size
            current_time += step_duration
            
            # Add pause between scrolls
            if current_position < scroll_distance:
                pause_duration = random.uniform(0.1, 0.5)
                current_time += pause_duration
        
        # Add overshoot if applicable
        if random.random() < profile["overshoot_probability"]:
            overshoot_distance = random.randint(5, 20)
            scroll_events.append({
                "type": "scroll",
                "direction": "down",
                "distance": overshoot_distance,
                "timestamp": current_time,
                "duration": 0.2,
                "smoothness": 0.8
            })
            
            # Correction scroll
            current_time += 0.3
            scroll_events.append({
                "type": "scroll",
                "direction": "up",
                "distance": overshoot_distance,
                "timestamp": current_time,
                "duration": 0.3,
                "smoothness": 0.9
            })
        
        return scroll_events
    
    def simulate_clicking_behavior(self, target_position: Tuple[int, int], user_type: str = "casual") -> List[Dict]:
        """Simulate realistic clicking behavior"""
        profile = self.biometric_profiles[user_type]["clicking_profile"]
        signature = self.biometric_profiles[user_type]["behavioral_signature"]["mouse_signature"]
        
        click_events = []
        current_time = 0.0
        
        # Pre-click pause
        pre_click_pause = random.uniform(*profile["pre_click_pause"])
        current_time += pre_click_pause
        
        # Calculate click accuracy
        accuracy = signature["click_precision"]
        if random.random() > accuracy:
            # Miss the target
            offset_x = random.randint(-10, 10)
            offset_y = random.randint(-10, 10)
            actual_position = (target_position[0] + offset_x, target_position[1] + offset_y)
        else:
            # Hit the target with slight variation
            offset_x = random.randint(-3, 3)
            offset_y = random.randint(-3, 3)
            actual_position = (target_position[0] + offset_x, target_position[1] + offset_y)
        
        # Mouse down event
        click_duration = random.uniform(0.05, 0.15)
        click_events.append({
            "type": "mouse_down",
            "position": actual_position,
            "timestamp": current_time,
            "button": "left"
        })
        
        current_time += click_duration
        
        # Mouse up event
        click_events.append({
            "type": "mouse_up",
            "position": actual_position,
            "timestamp": current_time,
            "button": "left"
        })
        
        # Post-click pause
        post_click_pause = random.uniform(*profile["post_click_pause"])
        current_time += post_click_pause
        
        return click_events
    
    def simulate_eye_movement_behavior(self, content_areas: List[Dict], user_type: str = "casual") -> List[Dict]:
        """Simulate realistic eye movement behavior"""
        profile = self.biometric_profiles[user_type]["eye_movement_profile"]
        signature = self.biometric_profiles[user_type]["behavioral_signature"]["attention_signature"]
        
        eye_events = []
        current_time = 0.0
        current_focus = None
        
        for area in content_areas:
            # Saccade to new area
            if current_focus is not None:
                saccade_duration = random.uniform(0.02, 0.05)
                eye_events.append({
                    "type": "saccade",
                    "from_position": current_focus,
                    "to_position": area["position"],
                    "timestamp": current_time,
                    "duration": saccade_duration
                })
                current_time += saccade_duration
            
            # Fixation on area
            fixation_duration = random.uniform(0.2, 0.8)
            fixation_duration *= signature["focus_duration"]
            
            eye_events.append({
                "type": "fixation",
                "position": area["position"],
                "timestamp": current_time,
                "duration": fixation_duration,
                "attention_level": signature["focus_duration"]
            })
            
            current_time += fixation_duration
            current_focus = area["position"]
            
            # Potential distraction
            if random.random() < (1 - signature["distraction_resistance"]):
                distraction_duration = random.uniform(0.5, 2.0)
                eye_events.append({
                    "type": "distraction",
                    "position": area["position"],
                    "timestamp": current_time,
                    "duration": distraction_duration
                })
                current_time += distraction_duration
        
        return eye_events
    
    def generate_behavioral_session(self, user_type: str = "casual", session_duration: int = 300) -> Dict:
        """Generate complete behavioral session"""
        session = {
            "user_type": user_type,
            "session_duration": session_duration,
            "typing_events": [],
            "scrolling_events": [],
            "clicking_events": [],
            "eye_movement_events": [],
            "behavioral_signature": self.biometric_profiles[user_type]["behavioral_signature"]
        }
        
        # Generate sample text for typing
        sample_text = "This is a sample text for typing simulation. It contains various words and sentences to demonstrate realistic typing behavior patterns."
        session["typing_events"] = self.simulate_typing_behavior(sample_text, user_type)
        
        # Generate scrolling events
        scroll_distance = random.randint(500, 2000)
        session["scrolling_events"] = self.simulate_scrolling_behavior(scroll_distance, user_type)
        
        # Generate clicking events
        click_targets = [(100, 200), (300, 400), (500, 600)]
        for target in click_targets:
            session["clicking_events"].extend(self.simulate_clicking_behavior(target, user_type))
        
        # Generate eye movement events
        content_areas = [
            {"position": (100, 100), "type": "text"},
            {"position": (300, 200), "type": "image"},
            {"position": (500, 300), "type": "button"}
        ]
        session["eye_movement_events"] = self.simulate_eye_movement_behavior(content_areas, user_type)
        
        return session
    
    def analyze_behavioral_consistency(self, session_data: Dict) -> Dict:
        """Analyze behavioral consistency in session"""
        analysis = {
            "typing_consistency": 0.0,
            "scrolling_consistency": 0.0,
            "clicking_consistency": 0.0,
            "attention_consistency": 0.0,
            "overall_consistency": 0.0
        }
        
        # Analyze typing consistency
        if session_data.get("typing_events"):
            typing_times = [event["timestamp"] for event in session_data["typing_events"] if event["type"] == "key_press"]
            if len(typing_times) > 1:
                intervals = [typing_times[i+1] - typing_times[i] for i in range(len(typing_times) - 1)]
                analysis["typing_consistency"] = 1.0 - (np.std(intervals) / np.mean(intervals)) if np.mean(intervals) > 0 else 0.0
        
        # Analyze scrolling consistency
        if session_data.get("scrolling_events"):
            scroll_durations = [event["duration"] for event in session_data["scrolling_events"]]
            if scroll_durations:
                analysis["scrolling_consistency"] = 1.0 - (np.std(scroll_durations) / np.mean(scroll_durations)) if np.mean(scroll_durations) > 0 else 0.0
        
        # Analyze clicking consistency
        if session_data.get("clicking_events"):
            click_positions = [event["position"] for event in session_data["clicking_events"] if event["type"] == "mouse_down"]
            if len(click_positions) > 1:
                distances = []
                for i in range(len(click_positions) - 1):
                    dist = math.sqrt((click_positions[i+1][0] - click_positions[i][0])**2 + 
                                   (click_positions[i+1][1] - click_positions[i][1])**2)
                    distances.append(dist)
                analysis["clicking_consistency"] = 1.0 - (np.std(distances) / np.mean(distances)) if np.mean(distances) > 0 else 0.0
        
        # Calculate overall consistency
        consistency_scores = [
            analysis["typing_consistency"],
            analysis["scrolling_consistency"],
            analysis["clicking_consistency"],
            analysis["attention_consistency"]
        ]
        analysis["overall_consistency"] = sum(consistency_scores) / len(consistency_scores)
        
        return analysis
    
    def get_behavioral_biometrics_summary(self) -> Dict:
        """Get summary of behavioral biometrics analysis"""
        return {
            "total_profiles": len(self.biometric_profiles),
            "user_types": list(self.biometric_profiles.keys()),
            "behavioral_signatures": len(self.behavioral_signatures),
            "session_history_count": len(self.behavioral_history),
            "current_session": self.current_session if self.current_session else None
        }
