"""
Machine Learning Adaptive Engine
Provides real-time learning and adaptation for undetectable traffic
"""

import random
import time
import json
import numpy as np
from typing import Dict, List, Optional, Tuple, Any
import logging
from datetime import datetime, timedelta
from collections import defaultdict, deque
import pickle
import os

class MLAdaptiveEngine:
    """Machine Learning engine for adaptive undetectable behavior"""
    
    def __init__(self, config: Dict):
        self.config = config
        self.logger = logging.getLogger(__name__)
        
        # Learning data storage
        self.behavior_patterns = defaultdict(list)
        self.detection_indicators = defaultdict(list)
        self.success_patterns = defaultdict(list)
        self.failure_patterns = defaultdict(list)
        
        # Adaptive models
        self.behavior_model = BehaviorModel()
        self.detection_model = DetectionModel()
        self.adaptation_model = AdaptationModel()
        
        # Real-time learning
        self.learning_rate = 0.01
        self.memory_size = 1000
        self.adaptation_threshold = 0.7
        
        # Performance tracking
        self.performance_history = deque(maxlen=100)
        self.adaptation_history = []
        
        # Load existing models if available
        self.load_models()
    
    def learn_from_session(self, session_data: Dict, success: bool):
        """Learn from session data and adapt behavior"""
        try:
            # Extract behavioral features
            features = self.extract_behavioral_features(session_data)
            
            # Extract detection indicators
            indicators = self.extract_detection_indicators(session_data)
            
            # Update learning data
            if success:
                self.success_patterns[features["session_type"]].append(features)
                self.behavior_patterns[features["behavior_type"]].append(features)
            else:
                self.failure_patterns[features["session_type"]].append(features)
                self.detection_indicators[indicators["detection_type"]].append(indicators)
            
            # Update models
            self.update_behavior_model(features, success)
            self.update_detection_model(indicators, success)
            
            # Adapt behavior based on learning
            adaptation = self.generate_adaptation(features, indicators, success)
            
            # Store adaptation
            self.adaptation_history.append({
                "timestamp": datetime.now(),
                "adaptation": adaptation,
                "success": success,
                "features": features,
                "indicators": indicators
            })
            
            # Update performance tracking
            self.update_performance_tracking(success, adaptation)
            
            # Save models periodically
            if len(self.adaptation_history) % 10 == 0:
                self.save_models()
            
            return adaptation
            
        except Exception as e:
            self.logger.error(f"Error in learning from session: {str(e)}")
            return {}
    
    def extract_behavioral_features(self, session_data: Dict) -> Dict:
        """Extract behavioral features from session data"""
        features = {
            "session_type": session_data.get("session_type", "unknown"),
            "behavior_type": session_data.get("behavioral_profile", {}).get("personality_type", "unknown"),
            "duration": session_data.get("duration", 0),
            "page_views": session_data.get("page_views", 0),
            "interaction_count": len(session_data.get("interactions", [])),
            "click_pattern": self.analyze_click_pattern(session_data),
            "scroll_pattern": self.analyze_scroll_pattern(session_data),
            "timing_pattern": self.analyze_timing_pattern(session_data),
            "navigation_pattern": self.analyze_navigation_pattern(session_data),
            "device_characteristics": session_data.get("hardware_profile", {}),
            "network_characteristics": session_data.get("network_profile", {}),
            "fingerprint_consistency": self.calculate_fingerprint_consistency(session_data),
            "referer_type": self.categorize_referer(session_data.get("referer", "")),
            "content_engagement": self.calculate_content_engagement(session_data),
            "session_complexity": self.calculate_session_complexity(session_data)
        }
        
        return features
    
    def analyze_click_pattern(self, session_data: Dict) -> Dict:
        """Analyze click patterns for learning"""
        interactions = session_data.get("interactions", [])
        clicks = [i for i in interactions if i.get("type") == "click"]
        
        if not clicks:
            return {"click_count": 0, "click_distribution": "none", "click_timing": "none"}
        
        # Analyze click distribution
        click_positions = [(c.get("x", 0), c.get("y", 0)) for c in clicks]
        click_timings = [c.get("timestamp", 0) for c in clicks]
        
        # Calculate click density
        if len(click_positions) > 1:
            distances = []
            for i in range(len(click_positions) - 1):
                dist = np.sqrt((click_positions[i+1][0] - click_positions[i][0])**2 + 
                             (click_positions[i+1][1] - click_positions[i][1])**2)
                distances.append(dist)
            
            avg_distance = np.mean(distances)
            click_distribution = "clustered" if avg_distance < 100 else "spread"
        else:
            click_distribution = "single"
        
        # Analyze click timing
        if len(click_timings) > 1:
            intervals = [click_timings[i+1] - click_timings[i] for i in range(len(click_timings) - 1)]
            avg_interval = np.mean(intervals)
            click_timing = "fast" if avg_interval < 2 else "slow" if avg_interval > 10 else "normal"
        else:
            click_timing = "single"
        
        return {
            "click_count": len(clicks),
            "click_distribution": click_distribution,
            "click_timing": click_timing,
            "avg_interval": np.mean(intervals) if len(click_timings) > 1 else 0
        }
    
    def analyze_scroll_pattern(self, session_data: Dict) -> Dict:
        """Analyze scroll patterns for learning"""
        interactions = session_data.get("interactions", [])
        scrolls = [i for i in interactions if i.get("type") == "scroll"]
        
        if not scrolls:
            return {"scroll_count": 0, "scroll_pattern": "none", "scroll_speed": "none"}
        
        scroll_directions = [s.get("direction", "down") for s in scrolls]
        scroll_amounts = [s.get("amount", 0) for s in scrolls]
        
        # Analyze scroll pattern
        down_scrolls = scroll_directions.count("down")
        up_scrolls = scroll_directions.count("up")
        
        if down_scrolls > up_scrolls * 2:
            scroll_pattern = "progressive"
        elif up_scrolls > down_scrolls * 2:
            scroll_pattern = "regressive"
        else:
            scroll_pattern = "mixed"
        
        # Analyze scroll speed
        avg_amount = np.mean(scroll_amounts)
        scroll_speed = "fast" if avg_amount > 500 else "slow" if avg_amount < 100 else "normal"
        
        return {
            "scroll_count": len(scrolls),
            "scroll_pattern": scroll_pattern,
            "scroll_speed": scroll_speed,
            "avg_amount": avg_amount
        }
    
    def analyze_timing_pattern(self, session_data: Dict) -> Dict:
        """Analyze timing patterns for learning"""
        interactions = session_data.get("interactions", [])
        
        if not interactions:
            return {"timing_consistency": "none", "response_time": "none"}
        
        timestamps = [i.get("timestamp", 0) for i in interactions]
        intervals = [timestamps[i+1] - timestamps[i] for i in range(len(timestamps) - 1)]
        
        if not intervals:
            return {"timing_consistency": "single", "response_time": "unknown"}
        
        # Calculate timing consistency
        std_dev = np.std(intervals)
        mean_interval = np.mean(intervals)
        cv = std_dev / mean_interval if mean_interval > 0 else 0
        
        timing_consistency = "consistent" if cv < 0.5 else "variable" if cv < 1.0 else "random"
        
        # Analyze response time
        response_time = "fast" if mean_interval < 1 else "slow" if mean_interval > 5 else "normal"
        
        return {
            "timing_consistency": timing_consistency,
            "response_time": response_time,
            "mean_interval": mean_interval,
            "std_dev": std_dev
        }
    
    def analyze_navigation_pattern(self, session_data: Dict) -> Dict:
        """Analyze navigation patterns for learning"""
        page_views = session_data.get("page_views", 1)
        duration = session_data.get("duration", 0)
        
        # Calculate navigation depth
        navigation_depth = "shallow" if page_views <= 2 else "deep" if page_views >= 5 else "moderate"
        
        # Calculate navigation speed
        if page_views > 1 and duration > 0:
            pages_per_minute = page_views / (duration / 60)
            navigation_speed = "fast" if pages_per_minute > 2 else "slow" if pages_per_minute < 0.5 else "normal"
        else:
            navigation_speed = "single_page"
        
        return {
            "navigation_depth": navigation_depth,
            "navigation_speed": navigation_speed,
            "page_views": page_views,
            "avg_time_per_page": duration / page_views if page_views > 0 else 0
        }
    
    def calculate_fingerprint_consistency(self, session_data: Dict) -> float:
        """Calculate fingerprint consistency score"""
        fingerprint = session_data.get("fingerprint", {})
        hardware_profile = session_data.get("hardware_profile", {})
        
        consistency_score = 0.0
        checks = 0
        
        # Check geo consistency
        if fingerprint.get("geo") == hardware_profile.get("geo_location"):
            consistency_score += 1.0
        checks += 1
        
        # Check timezone consistency
        if fingerprint.get("timezone") == hardware_profile.get("timezone"):
            consistency_score += 1.0
        checks += 1
        
        # Check language consistency
        if fingerprint.get("language") == hardware_profile.get("language"):
            consistency_score += 1.0
        checks += 1
        
        return consistency_score / checks if checks > 0 else 0.0
    
    def categorize_referer(self, referer: str) -> str:
        """Categorize referer type"""
        if not referer:
            return "direct"
        elif "google.com" in referer:
            return "search"
        elif "facebook.com" in referer:
            return "social"
        elif "twitter.com" in referer:
            return "social"
        elif "youtube.com" in referer:
            return "media"
        else:
            return "other"
    
    def calculate_content_engagement(self, session_data: Dict) -> float:
        """Calculate content engagement score"""
        duration = session_data.get("duration", 0)
        page_views = session_data.get("page_views", 1)
        interaction_count = len(session_data.get("interactions", []))
        
        # Base engagement score
        engagement = 0.0
        
        # Time-based engagement
        if duration > 300:  # 5+ minutes
            engagement += 0.4
        elif duration > 120:  # 2+ minutes
            engagement += 0.2
        
        # Interaction-based engagement
        if interaction_count > 10:
            engagement += 0.3
        elif interaction_count > 5:
            engagement += 0.2
        
        # Page view engagement
        if page_views > 3:
            engagement += 0.3
        elif page_views > 1:
            engagement += 0.1
        
        return min(1.0, engagement)
    
    def calculate_session_complexity(self, session_data: Dict) -> str:
        """Calculate session complexity level"""
        interaction_count = len(session_data.get("interactions", []))
        page_views = session_data.get("page_views", 1)
        duration = session_data.get("duration", 0)
        
        complexity_score = 0
        
        # Interaction complexity
        if interaction_count > 20:
            complexity_score += 3
        elif interaction_count > 10:
            complexity_score += 2
        elif interaction_count > 5:
            complexity_score += 1
        
        # Navigation complexity
        if page_views > 5:
            complexity_score += 2
        elif page_views > 2:
            complexity_score += 1
        
        # Duration complexity
        if duration > 600:  # 10+ minutes
            complexity_score += 2
        elif duration > 300:  # 5+ minutes
            complexity_score += 1
        
        if complexity_score >= 5:
            return "high"
        elif complexity_score >= 3:
            return "medium"
        else:
            return "low"
    
    def extract_detection_indicators(self, session_data: Dict) -> Dict:
        """Extract detection indicators from session data"""
        indicators = {
            "detection_type": "none",
            "suspicious_patterns": [],
            "anomaly_score": 0.0,
            "bot_indicators": [],
            "human_indicators": []
        }
        
        # Analyze for suspicious patterns
        suspicious_patterns = []
        
        # Check for too perfect timing
        timing_pattern = self.analyze_timing_pattern(session_data)
        if timing_pattern["timing_consistency"] == "consistent" and timing_pattern["mean_interval"] < 0.5:
            suspicious_patterns.append("too_perfect_timing")
        
        # Check for too many interactions
        if len(session_data.get("interactions", [])) > 50:
            suspicious_patterns.append("excessive_interactions")
        
        # Check for unrealistic navigation
        nav_pattern = self.analyze_navigation_pattern(session_data)
        if nav_pattern["navigation_speed"] == "fast" and nav_pattern["page_views"] > 10:
            suspicious_patterns.append("unrealistic_navigation")
        
        # Check for fingerprint inconsistencies
        if self.calculate_fingerprint_consistency(session_data) < 0.5:
            suspicious_patterns.append("fingerprint_inconsistency")
        
        # Calculate anomaly score
        anomaly_score = len(suspicious_patterns) * 0.2
        
        # Determine detection type
        if anomaly_score > 0.6:
            detection_type = "high_risk"
        elif anomaly_score > 0.3:
            detection_type = "medium_risk"
        else:
            detection_type = "low_risk"
        
        indicators.update({
            "detection_type": detection_type,
            "suspicious_patterns": suspicious_patterns,
            "anomaly_score": anomaly_score
        })
        
        return indicators
    
    def update_behavior_model(self, features: Dict, success: bool):
        """Update behavior model with new data"""
        self.behavior_model.update(features, success)
    
    def update_detection_model(self, indicators: Dict, success: bool):
        """Update detection model with new data"""
        self.detection_model.update(indicators, success)
    
    def generate_adaptation(self, features: Dict, indicators: Dict, success: bool) -> Dict:
        """Generate behavioral adaptation based on learning"""
        adaptation = {}
        
        # Analyze failure patterns
        if not success:
            adaptation = self.analyze_failure_and_adapt(features, indicators)
        else:
            # Reinforce successful patterns
            adaptation = self.reinforce_successful_patterns(features)
        
        # Apply adaptive adjustments
        adaptation.update(self.apply_adaptive_adjustments(features, indicators))
        
        return adaptation
    
    def analyze_failure_and_adapt(self, features: Dict, indicators: Dict) -> Dict:
        """Analyze failure patterns and generate adaptations"""
        adaptation = {}
        
        # Analyze suspicious patterns
        for pattern in indicators.get("suspicious_patterns", []):
            if pattern == "too_perfect_timing":
                adaptation["timing_randomization"] = "increase"
                adaptation["response_delay"] = "add_variation"
            
            elif pattern == "excessive_interactions":
                adaptation["interaction_frequency"] = "reduce"
                adaptation["pause_duration"] = "increase"
            
            elif pattern == "unrealistic_navigation":
                adaptation["navigation_speed"] = "slow_down"
                adaptation["page_depth"] = "reduce"
            
            elif pattern == "fingerprint_inconsistency":
                adaptation["fingerprint_consistency"] = "improve"
                adaptation["geo_matching"] = "strict"
        
        # Apply learned adjustments
        if indicators.get("anomaly_score", 0) > 0.5:
            adaptation["stealth_level"] = "increase"
            adaptation["human_behavior"] = "emphasize"
        
        return adaptation
    
    def reinforce_successful_patterns(self, features: Dict) -> Dict:
        """Reinforce successful behavioral patterns"""
        adaptation = {}
        
        # Reinforce successful timing patterns
        if features.get("timing_pattern", {}).get("timing_consistency") == "variable":
            adaptation["timing_pattern"] = "maintain_variability"
        
        # Reinforce successful interaction patterns
        if features.get("click_pattern", {}).get("click_distribution") == "spread":
            adaptation["click_distribution"] = "maintain_spread"
        
        # Reinforce successful navigation patterns
        if features.get("navigation_pattern", {}).get("navigation_depth") == "moderate":
            adaptation["navigation_depth"] = "maintain_moderate"
        
        return adaptation
    
    def apply_adaptive_adjustments(self, features: Dict, indicators: Dict) -> Dict:
        """Apply adaptive adjustments based on current performance"""
        adjustments = {}
        
        # Performance-based adjustments
        recent_performance = self.get_recent_performance()
        
        if recent_performance < 0.7:  # Low success rate
            adjustments["conservative_mode"] = True
            adjustments["interaction_frequency"] = "reduce"
            adjustments["session_duration"] = "increase"
        
        elif recent_performance > 0.9:  # High success rate
            adjustments["aggressive_mode"] = True
            adjustments["interaction_frequency"] = "maintain"
            adjustments["session_complexity"] = "increase"
        
        # Detection-based adjustments
        if indicators.get("anomaly_score", 0) > 0.3:
            adjustments["stealth_enhancement"] = True
            adjustments["fingerprint_randomization"] = "increase"
        
        return adjustments
    
    def get_recent_performance(self) -> float:
        """Get recent performance score"""
        if not self.performance_history:
            return 0.5  # Default neutral performance
        
        recent_scores = list(self.performance_history)[-20:]  # Last 20 sessions
        return sum(recent_scores) / len(recent_scores)
    
    def update_performance_tracking(self, success: bool, adaptation: Dict):
        """Update performance tracking"""
        score = 1.0 if success else 0.0
        self.performance_history.append(score)
    
    def predict_detection_risk(self, planned_behavior: Dict) -> float:
        """Predict detection risk for planned behavior"""
        return self.detection_model.predict_risk(planned_behavior)
    
    def optimize_behavior(self, target_behavior: Dict) -> Dict:
        """Optimize behavior to minimize detection risk"""
        return self.behavior_model.optimize(target_behavior)
    
    def save_models(self):
        """Save learned models to disk"""
        try:
            models_dir = "models"
            if not os.path.exists(models_dir):
                os.makedirs(models_dir)
            
            # Save behavior model
            with open(os.path.join(models_dir, "behavior_model.pkl"), "wb") as f:
                pickle.dump(self.behavior_model, f)
            
            # Save detection model
            with open(os.path.join(models_dir, "detection_model.pkl"), "wb") as f:
                pickle.dump(self.detection_model, f)
            
            # Save adaptation model
            with open(os.path.join(models_dir, "adaptation_model.pkl"), "wb") as f:
                pickle.dump(self.adaptation_model, f)
            
            # Save learning data
            learning_data = {
                "behavior_patterns": dict(self.behavior_patterns),
                "detection_indicators": dict(self.detection_indicators),
                "success_patterns": dict(self.success_patterns),
                "failure_patterns": dict(self.failure_patterns),
                "adaptation_history": self.adaptation_history,
                "performance_history": list(self.performance_history)
            }
            
            with open(os.path.join(models_dir, "learning_data.json"), "w") as f:
                json.dump(learning_data, f, indent=2, default=str)
            
            self.logger.info("Models saved successfully")
            
        except Exception as e:
            self.logger.error(f"Error saving models: {str(e)}")
    
    def load_models(self):
        """Load learned models from disk"""
        try:
            models_dir = "models"
            
            # Load behavior model
            behavior_model_path = os.path.join(models_dir, "behavior_model.pkl")
            if os.path.exists(behavior_model_path):
                with open(behavior_model_path, "rb") as f:
                    self.behavior_model = pickle.load(f)
            
            # Load detection model
            detection_model_path = os.path.join(models_dir, "detection_model.pkl")
            if os.path.exists(detection_model_path):
                with open(detection_model_path, "rb") as f:
                    self.detection_model = pickle.load(f)
            
            # Load adaptation model
            adaptation_model_path = os.path.join(models_dir, "adaptation_model.pkl")
            if os.path.exists(adaptation_model_path):
                with open(adaptation_model_path, "rb") as f:
                    self.adaptation_model = pickle.load(f)
            
            # Load learning data
            learning_data_path = os.path.join(models_dir, "learning_data.json")
            if os.path.exists(learning_data_path):
                with open(learning_data_path, "r") as f:
                    learning_data = json.load(f)
                
                self.behavior_patterns = defaultdict(list, learning_data.get("behavior_patterns", {}))
                self.detection_indicators = defaultdict(list, learning_data.get("detection_indicators", {}))
                self.success_patterns = defaultdict(list, learning_data.get("success_patterns", {}))
                self.failure_patterns = defaultdict(list, learning_data.get("failure_patterns", {}))
                self.adaptation_history = learning_data.get("adaptation_history", [])
                self.performance_history = deque(learning_data.get("performance_history", []), maxlen=100)
            
            self.logger.info("Models loaded successfully")
            
        except Exception as e:
            self.logger.error(f"Error loading models: {str(e)}")
    
    def get_learning_summary(self) -> Dict:
        """Get summary of learning progress"""
        return {
            "total_sessions": len(self.adaptation_history),
            "success_rate": self.get_recent_performance(),
            "behavior_patterns_count": sum(len(patterns) for patterns in self.behavior_patterns.values()),
            "detection_indicators_count": sum(len(indicators) for indicators in self.detection_indicators.values()),
            "recent_adaptations": self.adaptation_history[-10:] if self.adaptation_history else [],
            "performance_trend": list(self.performance_history)[-20:] if self.performance_history else []
        }


class BehaviorModel:
    """Model for learning and optimizing behavior patterns"""
    
    def __init__(self):
        self.patterns = defaultdict(list)
        self.weights = defaultdict(float)
    
    def update(self, features: Dict, success: bool):
        """Update model with new behavior data"""
        pattern_key = self.extract_pattern_key(features)
        self.patterns[pattern_key].append({
            "features": features,
            "success": success,
            "timestamp": datetime.now()
        })
        
        # Update weights
        if success:
            self.weights[pattern_key] += 0.1
        else:
            self.weights[pattern_key] -= 0.1
        
        # Normalize weights
        self.weights[pattern_key] = max(0, min(1, self.weights[pattern_key]))
    
    def extract_pattern_key(self, features: Dict) -> str:
        """Extract pattern key from features"""
        return f"{features.get('behavior_type', 'unknown')}_{features.get('session_complexity', 'low')}"
    
    def optimize(self, target_behavior: Dict) -> Dict:
        """Optimize behavior based on learned patterns"""
        # Find best performing patterns
        best_patterns = sorted(self.weights.items(), key=lambda x: x[1], reverse=True)[:3]
        
        optimization = {}
        
        for pattern_key, weight in best_patterns:
            if weight > 0.7:  # High performing pattern
                optimization["apply_pattern"] = pattern_key
                optimization["confidence"] = weight
        
        return optimization


class DetectionModel:
    """Model for predicting detection risk"""
    
    def __init__(self):
        self.risk_patterns = defaultdict(list)
        self.risk_weights = defaultdict(float)
    
    def update(self, indicators: Dict, success: bool):
        """Update model with detection data"""
        risk_key = indicators.get("detection_type", "unknown")
        self.risk_patterns[risk_key].append({
            "indicators": indicators,
            "success": success,
            "timestamp": datetime.now()
        })
        
        # Update risk weights
        if not success:  # Detection occurred
            self.risk_weights[risk_key] += 0.2
        else:  # No detection
            self.risk_weights[risk_key] -= 0.1
        
        # Normalize weights
        self.risk_weights[risk_key] = max(0, min(1, self.risk_weights[risk_key]))
    
    def predict_risk(self, planned_behavior: Dict) -> float:
        """Predict detection risk for planned behavior"""
        # Simple risk prediction based on learned patterns
        risk_score = 0.0
        
        # Check for high-risk patterns
        for risk_type, weight in self.risk_weights.items():
            if weight > 0.5:  # High risk pattern
                risk_score += weight * 0.3
        
        return min(1.0, risk_score)


class AdaptationModel:
    """Model for generating behavioral adaptations"""
    
    def __init__(self):
        self.adaptation_rules = []
        self.adaptation_effectiveness = defaultdict(float)
    
    def add_adaptation_rule(self, condition: str, action: str, effectiveness: float):
        """Add adaptation rule"""
        self.adaptation_rules.append({
            "condition": condition,
            "action": action,
            "effectiveness": effectiveness
        })
    
    def get_adaptation(self, context: Dict) -> Dict:
        """Get adaptation based on context"""
        adaptations = {}
        
        for rule in self.adaptation_rules:
            if self.evaluate_condition(rule["condition"], context):
                adaptations[rule["action"]] = rule["effectiveness"]
        
        return adaptations
    
    def evaluate_condition(self, condition: str, context: Dict) -> bool:
        """Evaluate adaptation condition"""
        # Simple condition evaluation
        if "high_risk" in condition and context.get("risk_level", "low") == "high":
            return True
        elif "low_performance" in condition and context.get("performance", 1.0) < 0.7:
            return True
        
        return False
