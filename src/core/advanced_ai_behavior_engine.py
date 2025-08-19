"""
Advanced AI Behavior Engine
Provides sophisticated AI-driven behavior simulation with complex decision trees
"""

import random
import time
import math
import json
from typing import Dict, List, Optional, Tuple, Any
import logging
from datetime import datetime, timedelta
from enum import Enum

class PersonalityType(Enum):
    """Personality types for behavioral simulation"""
    CURIOUS_EXPLORER = "curious_explorer"
    FAST_SCANNER = "fast_scanner"
    THOROUGH_READER = "thorough_reader"
    SOCIAL_BUTTERFLY = "social_butterfly"
    CAUTIOUS_OBSERVER = "cautious_observer"
    IMPULSIVE_CLICKER = "impulsive_clicker"
    ANALYTICAL_THINKER = "analytical_thinker"
    MULTITASKER = "multitasker"

class ContextType(Enum):
    """Context types for behavior adaptation"""
    READING_ARTICLE = "reading_article"
    BROWSING_HOMEPAGE = "browsing_homepage"
    SEARCHING_CONTENT = "searching_content"
    SOCIAL_INTERACTION = "social_interaction"
    SHOPPING_BEHAVIOR = "shopping_behavior"
    NEWS_CONSUMPTION = "news_consumption"
    EDUCATIONAL_CONTENT = "educational_content"
    ENTERTAINMENT = "entertainment"

class AdvancedAIBehaviorEngine:
    """Advanced AI-driven behavior simulation engine"""
    
    def __init__(self, config: Dict):
        self.config = config
        self.logger = logging.getLogger(__name__)
        
        # Load behavior models
        self.behavior_models = self.load_advanced_behavior_models()
        self.decision_trees = self.build_advanced_decision_trees()
        self.personality_profiles = self.generate_personality_profiles()
        
        # Context memory
        self.context_memory = {}
        self.session_history = []
        self.behavioral_signatures = {}
        
        # Advanced features
        self.mood_system = MoodSystem()
        self.attention_system = AttentionSystem()
        self.learning_system = LearningSystem()
    
    def load_advanced_behavior_models(self) -> Dict:
        """Load sophisticated behavior models based on human psychology"""
        return {
            "reading_patterns": {
                "thorough_reader": {
                    "avg_words_per_minute": 200,
                    "comprehension_rate": 0.85,
                    "reread_probability": 0.3,
                    "highlight_probability": 0.4,
                    "note_taking_probability": 0.2,
                    "pause_frequency": "high",
                    "scroll_speed": "slow"
                },
                "fast_scanner": {
                    "avg_words_per_minute": 400,
                    "comprehension_rate": 0.6,
                    "reread_probability": 0.1,
                    "highlight_probability": 0.1,
                    "note_taking_probability": 0.05,
                    "pause_frequency": "low",
                    "scroll_speed": "fast"
                },
                "selective_reader": {
                    "avg_words_per_minute": 300,
                    "comprehension_rate": 0.75,
                    "reread_probability": 0.2,
                    "highlight_probability": 0.25,
                    "note_taking_probability": 0.15,
                    "pause_frequency": "medium",
                    "scroll_speed": "variable"
                }
            },
            "interaction_patterns": {
                "high_engagement": {
                    "click_probability": 0.7,
                    "hover_probability": 0.8,
                    "scroll_probability": 0.9,
                    "time_on_page": "long",
                    "return_visits": "frequent"
                },
                "moderate_engagement": {
                    "click_probability": 0.4,
                    "hover_probability": 0.5,
                    "scroll_probability": 0.7,
                    "time_on_page": "medium",
                    "return_visits": "occasional"
                },
                "low_engagement": {
                    "click_probability": 0.2,
                    "hover_probability": 0.3,
                    "scroll_probability": 0.4,
                    "time_on_page": "short",
                    "return_visits": "rare"
                }
            },
            "attention_patterns": {
                "focused": {
                    "attention_span": "long",
                    "distraction_resistance": "high",
                    "multitasking": "low",
                    "break_frequency": "low"
                },
                "easily_distracted": {
                    "attention_span": "short",
                    "distraction_resistance": "low",
                    "multitasking": "high",
                    "break_frequency": "high"
                },
                "adaptive": {
                    "attention_span": "variable",
                    "distraction_resistance": "medium",
                    "multitasking": "medium",
                    "break_frequency": "medium"
                }
            }
        }
    
    def build_advanced_decision_trees(self) -> Dict:
        """Build sophisticated decision trees for behavior simulation"""
        return {
            "next_action": {
                "root": {
                    "condition": "time_on_page",
                    "thresholds": {
                        "short": "continue_reading",
                        "medium": "evaluate_interest",
                        "long": "consider_navigation"
                    },
                    "children": {
                        "continue_reading": {
                            "condition": "content_quality",
                            "thresholds": {
                                "high": "deep_read",
                                "medium": "skim_read",
                                "low": "quick_scan"
                            }
                        },
                        "evaluate_interest": {
                            "condition": "personal_interest",
                            "thresholds": {
                                "high": "engage_deeply",
                                "medium": "moderate_engagement",
                                "low": "minimal_engagement"
                            }
                        },
                        "consider_navigation": {
                            "condition": "page_completion",
                            "thresholds": {
                                "complete": "find_next_content",
                                "partial": "continue_or_navigate",
                                "minimal": "leave_page"
                            }
                        }
                    }
                }
            },
            "interaction_choice": {
                "root": {
                    "condition": "content_type",
                    "thresholds": {
                        "article": "reading_interaction",
                        "gallery": "visual_interaction",
                        "video": "media_interaction",
                        "social": "social_interaction"
                    },
                    "children": {
                        "reading_interaction": {
                            "condition": "reading_progress",
                            "thresholds": {
                                "beginning": "scroll_down",
                                "middle": "highlight_or_click",
                                "end": "share_or_bookmark"
                            }
                        },
                        "visual_interaction": {
                            "condition": "image_interest",
                            "thresholds": {
                                "high": "click_image",
                                "medium": "hover_image",
                                "low": "skip_image"
                            }
                        }
                    }
                }
            },
            "navigation_decision": {
                "root": {
                    "condition": "session_context",
                    "thresholds": {
                        "exploration": "browse_related",
                        "research": "deep_dive",
                        "entertainment": "casual_browse",
                        "shopping": "product_browse"
                    },
                    "children": {
                        "browse_related": {
                            "condition": "related_content_quality",
                            "thresholds": {
                                "high": "click_related",
                                "medium": "consider_related",
                                "low": "search_new"
                            }
                        },
                        "deep_dive": {
                            "condition": "information_depth",
                            "thresholds": {
                                "comprehensive": "stay_current",
                                "moderate": "find_more",
                                "shallow": "search_deeper"
                            }
                        }
                    }
                }
            }
        }
    
    def generate_personality_profiles(self) -> Dict:
        """Generate diverse personality profiles with realistic traits"""
        return {
            PersonalityType.CURIOUS_EXPLORER: {
                "traits": {
                    "openness": 0.9,
                    "curiosity": 0.95,
                    "risk_tolerance": 0.7,
                    "patience": 0.6,
                    "focus": 0.5
                },
                "behavioral_patterns": {
                    "click_probability": 0.8,
                    "exploration_depth": "deep",
                    "return_visits": "frequent",
                    "social_sharing": "high",
                    "content_consumption": "diverse"
                },
                "decision_making": {
                    "speed": "fast",
                    "thoroughness": "medium",
                    "adaptability": "high",
                    "consistency": "low"
                }
            },
            PersonalityType.THOROUGH_READER: {
                "traits": {
                    "openness": 0.7,
                    "curiosity": 0.6,
                    "risk_tolerance": 0.3,
                    "patience": 0.9,
                    "focus": 0.95
                },
                "behavioral_patterns": {
                    "click_probability": 0.3,
                    "exploration_depth": "thorough",
                    "return_visits": "occasional",
                    "social_sharing": "low",
                    "content_consumption": "focused"
                },
                "decision_making": {
                    "speed": "slow",
                    "thoroughness": "high",
                    "adaptability": "low",
                    "consistency": "high"
                }
            },
            PersonalityType.SOCIAL_BUTTERFLY: {
                "traits": {
                    "openness": 0.8,
                    "curiosity": 0.7,
                    "risk_tolerance": 0.6,
                    "patience": 0.4,
                    "focus": 0.3
                },
                "behavioral_patterns": {
                    "click_probability": 0.9,
                    "exploration_depth": "shallow",
                    "return_visits": "frequent",
                    "social_sharing": "very_high",
                    "content_consumption": "trending"
                },
                "decision_making": {
                    "speed": "very_fast",
                    "thoroughness": "low",
                    "adaptability": "high",
                    "consistency": "low"
                }
            },
            PersonalityType.ANALYTICAL_THINKER: {
                "traits": {
                    "openness": 0.6,
                    "curiosity": 0.8,
                    "risk_tolerance": 0.4,
                    "patience": 0.8,
                    "focus": 0.9
                },
                "behavioral_patterns": {
                    "click_probability": 0.5,
                    "exploration_depth": "analytical",
                    "return_visits": "strategic",
                    "social_sharing": "selective",
                    "content_consumption": "quality_focused"
                },
                "decision_making": {
                    "speed": "medium",
                    "thoroughness": "very_high",
                    "adaptability": "medium",
                    "consistency": "high"
                }
            },
            PersonalityType.IMPULSIVE_CLICKER: {
                "traits": {
                    "openness": 0.5,
                    "curiosity": 0.4,
                    "risk_tolerance": 0.9,
                    "patience": 0.2,
                    "focus": 0.3
                },
                "behavioral_patterns": {
                    "click_probability": 0.95,
                    "exploration_depth": "minimal",
                    "return_visits": "rare",
                    "social_sharing": "impulsive",
                    "content_consumption": "random"
                },
                "decision_making": {
                    "speed": "very_fast",
                    "thoroughness": "very_low",
                    "adaptability": "very_high",
                    "consistency": "very_low"
                }
            }
        }
    
    def generate_behavioral_profile(self, session_context: Dict) -> Dict:
        """Generate sophisticated behavioral profile based on context"""
        # Determine personality type based on context
        personality_type = self.determine_personality_type(session_context)
        personality = self.personality_profiles[personality_type]
        
        # Generate mood state
        mood = self.mood_system.generate_mood(session_context)
        
        # Generate attention state
        attention = self.attention_system.generate_attention_state(session_context)
        
        # Create behavioral profile
        profile = {
            "personality_type": personality_type.value,
            "personality_traits": personality["traits"],
            "behavioral_patterns": personality["behavioral_patterns"],
            "decision_making": personality["decision_making"],
            "mood_state": mood,
            "attention_state": attention,
            "context_awareness": self.generate_context_awareness(session_context),
            "learning_preferences": self.generate_learning_preferences(personality_type),
            "social_behavior": self.generate_social_behavior(personality_type, session_context),
            "temporal_patterns": self.generate_temporal_patterns(session_context)
        }
        
        return profile
    
    def determine_personality_type(self, context: Dict) -> PersonalityType:
        """Determine personality type based on context and session data"""
        # Analyze session patterns
        session_patterns = self.analyze_session_patterns(context)
        
        # Use weighted decision based on multiple factors
        personality_scores = {}
        
        for personality_type in PersonalityType:
            score = 0
            
            # Base score from session patterns
            if session_patterns["click_frequency"] == "high":
                if personality_type in [PersonalityType.SOCIAL_BUTTERFLY, PersonalityType.IMPULSIVE_CLICKER]:
                    score += 0.4
            elif session_patterns["click_frequency"] == "low":
                if personality_type in [PersonalityType.THOROUGH_READER, PersonalityType.ANALYTICAL_THINKER]:
                    score += 0.4
            
            # Time-based patterns
            if session_patterns["time_on_page"] == "long":
                if personality_type in [PersonalityType.THOROUGH_READER, PersonalityType.ANALYTICAL_THINKER]:
                    score += 0.3
            elif session_patterns["time_on_page"] == "short":
                if personality_type in [PersonalityType.FAST_SCANNER, PersonalityType.IMPULSIVE_CLICKER]:
                    score += 0.3
            
            # Content engagement patterns
            if session_patterns["engagement_depth"] == "deep":
                if personality_type in [PersonalityType.CURIOUS_EXPLORER, PersonalityType.THOROUGH_READER]:
                    score += 0.3
            elif session_patterns["engagement_depth"] == "shallow":
                if personality_type in [PersonalityType.SOCIAL_BUTTERFLY, PersonalityType.IMPULSIVE_CLICKER]:
                    score += 0.3
            
            personality_scores[personality_type] = score
        
        # Return personality with highest score
        return max(personality_scores, key=personality_scores.get)
    
    def analyze_session_patterns(self, context: Dict) -> Dict:
        """Analyze current session patterns for personality determination"""
        patterns = {
            "click_frequency": "medium",
            "time_on_page": "medium",
            "engagement_depth": "medium",
            "navigation_pattern": "linear",
            "content_preference": "mixed"
        }
        
        # Analyze based on available context data
        if "session_data" in context:
            session_data = context["session_data"]
            
            # Click frequency analysis
            click_count = len(session_data.get("interactions", []))
            if click_count > 10:
                patterns["click_frequency"] = "high"
            elif click_count < 3:
                patterns["click_frequency"] = "low"
            
            # Time on page analysis
            duration = session_data.get("duration", 0)
            if duration > 300:  # 5 minutes
                patterns["time_on_page"] = "long"
            elif duration < 60:  # 1 minute
                patterns["time_on_page"] = "short"
            
            # Engagement depth analysis
            page_views = session_data.get("page_views", 1)
            if page_views > 5:
                patterns["engagement_depth"] = "deep"
            elif page_views == 1:
                patterns["engagement_depth"] = "shallow"
        
        return patterns
    
    def generate_context_awareness(self, context: Dict) -> Dict:
        """Generate sophisticated context awareness"""
        return {
            "page_type": context.get("page_type", "unknown"),
            "content_category": context.get("content_category", "general"),
            "user_intent": self.infer_user_intent(context),
            "environmental_factors": self.analyze_environmental_factors(context),
            "temporal_context": self.analyze_temporal_context(context),
            "social_context": self.analyze_social_context(context),
            "technical_context": self.analyze_technical_context(context)
        }
    
    def infer_user_intent(self, context: Dict) -> str:
        """Infer user intent based on context"""
        page_type = context.get("page_type", "")
        content_category = context.get("content_category", "")
        
        intent_patterns = {
            "article": "information_seeking",
            "product": "shopping",
            "news": "current_events",
            "social": "social_interaction",
            "search": "exploration",
            "homepage": "general_browsing"
        }
        
        return intent_patterns.get(page_type, "general_browsing")
    
    def analyze_environmental_factors(self, context: Dict) -> Dict:
        """Analyze environmental factors affecting behavior"""
        return {
            "time_of_day": datetime.now().hour,
            "day_of_week": datetime.now().weekday(),
            "season": self.get_current_season(),
            "weather_context": "unknown",  # Could be enhanced with weather API
            "location_context": context.get("geo_location", "unknown"),
            "device_context": context.get("device_type", "desktop")
        }
    
    def analyze_temporal_context(self, context: Dict) -> Dict:
        """Analyze temporal context for behavior adaptation"""
        current_time = datetime.now()
        
        return {
            "hour_of_day": current_time.hour,
            "day_of_week": current_time.weekday(),
            "is_weekend": current_time.weekday() >= 5,
            "is_work_hours": 9 <= current_time.hour <= 17,
            "is_late_night": current_time.hour >= 22 or current_time.hour <= 6,
            "session_duration": context.get("session_duration", 0),
            "time_since_last_visit": context.get("time_since_last_visit", 0)
        }
    
    def analyze_social_context(self, context: Dict) -> Dict:
        """Analyze social context for behavior adaptation"""
        return {
            "social_media_presence": context.get("social_media_presence", False),
            "sharing_behavior": context.get("sharing_behavior", "none"),
            "community_engagement": context.get("community_engagement", "low"),
            "peer_influence": context.get("peer_influence", "none"),
            "trending_topics": context.get("trending_topics", [])
        }
    
    def analyze_technical_context(self, context: Dict) -> Dict:
        """Analyze technical context for behavior adaptation"""
        return {
            "device_performance": context.get("device_performance", "medium"),
            "network_speed": context.get("network_speed", "medium"),
            "browser_capabilities": context.get("browser_capabilities", "modern"),
            "screen_size": context.get("screen_size", "desktop"),
            "input_method": context.get("input_method", "mouse_keyboard")
        }
    
    def generate_learning_preferences(self, personality_type: PersonalityType) -> Dict:
        """Generate learning preferences based on personality"""
        preferences = {
            "visual_learning": random.uniform(0.3, 0.8),
            "auditory_learning": random.uniform(0.2, 0.7),
            "kinesthetic_learning": random.uniform(0.1, 0.6),
            "reading_preference": random.uniform(0.4, 0.9),
            "interactive_preference": random.uniform(0.3, 0.8)
        }
        
        # Adjust based on personality type
        if personality_type == PersonalityType.THOROUGH_READER:
            preferences["reading_preference"] = random.uniform(0.7, 0.95)
            preferences["visual_learning"] = random.uniform(0.5, 0.8)
        
        elif personality_type == PersonalityType.SOCIAL_BUTTERFLY:
            preferences["interactive_preference"] = random.uniform(0.7, 0.95)
            preferences["auditory_learning"] = random.uniform(0.5, 0.8)
        
        return preferences
    
    def generate_social_behavior(self, personality_type: PersonalityType, context: Dict) -> Dict:
        """Generate social behavior patterns"""
        base_social = {
            "sharing_probability": 0.3,
            "commenting_probability": 0.2,
            "liking_probability": 0.4,
            "following_probability": 0.1,
            "social_networking": "moderate"
        }
        
        # Adjust based on personality
        if personality_type == PersonalityType.SOCIAL_BUTTERFLY:
            base_social["sharing_probability"] = 0.8
            base_social["commenting_probability"] = 0.6
            base_social["liking_probability"] = 0.9
            base_social["social_networking"] = "high"
        
        elif personality_type == PersonalityType.THOROUGH_READER:
            base_social["sharing_probability"] = 0.1
            base_social["commenting_probability"] = 0.05
            base_social["liking_probability"] = 0.2
            base_social["social_networking"] = "low"
        
        return base_social
    
    def generate_temporal_patterns(self, context: Dict) -> Dict:
        """Generate temporal behavior patterns"""
        return {
            "peak_activity_hours": [9, 14, 20],  # Morning, afternoon, evening
            "session_duration_preference": random.choice(["short", "medium", "long"]),
            "break_patterns": random.choice(["frequent", "moderate", "rare"]),
            "return_visit_timing": random.choice(["same_day", "next_day", "weekly", "monthly"]),
            "time_sensitivity": random.uniform(0.1, 0.9)
        }
    
    def decide_next_action(self, current_context: Dict, behavioral_profile: Dict) -> str:
        """Make sophisticated decision for next action using advanced decision trees"""
        # Get relevant decision tree
        decision_tree = self.decision_trees["next_action"]
        
        # Evaluate conditions through the tree
        action = self.traverse_decision_tree(decision_tree, current_context, behavioral_profile)
        
        # Apply personality and mood adjustments
        adjusted_action = self.apply_personality_adjustments(action, behavioral_profile)
        
        # Apply context awareness
        final_action = self.apply_context_awareness(adjusted_action, current_context)
        
        return final_action
    
    def traverse_decision_tree(self, tree: Dict, context: Dict, profile: Dict) -> str:
        """Traverse decision tree to determine action"""
        current_node = tree["root"]
        
        while "children" in current_node:
            # Evaluate condition
            condition = current_node["condition"]
            condition_value = self.evaluate_condition(condition, context, profile)
            
            # Find matching threshold
            thresholds = current_node["thresholds"]
            matched_threshold = self.find_matching_threshold(condition_value, thresholds)
            
            # Move to child node
            if matched_threshold in current_node["children"]:
                current_node = current_node["children"][matched_threshold]
            else:
                # Fallback to first child
                current_node = list(current_node["children"].values())[0]
        
        return current_node.get("action", "default_action")
    
    def evaluate_condition(self, condition: str, context: Dict, profile: Dict) -> Any:
        """Evaluate condition based on context and profile"""
        condition_evaluators = {
            "time_on_page": lambda: context.get("time_on_page", 0),
            "content_quality": lambda: context.get("content_quality", "medium"),
            "personal_interest": lambda: profile["personality_traits"]["curiosity"],
            "page_completion": lambda: context.get("page_completion", 0.5),
            "content_type": lambda: context.get("content_type", "article"),
            "reading_progress": lambda: context.get("reading_progress", 0.5),
            "image_interest": lambda: profile["personality_traits"]["openness"],
            "session_context": lambda: context.get("session_context", "exploration"),
            "related_content_quality": lambda: context.get("related_content_quality", "medium"),
            "information_depth": lambda: context.get("information_depth", "moderate")
        }
        
        evaluator = condition_evaluators.get(condition, lambda: "unknown")
        return evaluator()
    
    def find_matching_threshold(self, value: Any, thresholds: Dict) -> str:
        """Find matching threshold for given value"""
        if isinstance(value, (int, float)):
            # Numeric comparison
            if value < 0.33:
                return "low"
            elif value < 0.67:
                return "medium"
            else:
                return "high"
        else:
            # String comparison
            return thresholds.get(str(value), list(thresholds.values())[0])
    
    def apply_personality_adjustments(self, action: str, profile: Dict) -> str:
        """Apply personality-based adjustments to action"""
        personality_type = profile["personality_type"]
        traits = profile["personality_traits"]
        
        # Adjust action based on personality traits
        if personality_type == "impulsive_clicker" and "click" not in action:
            if random.random() < traits["risk_tolerance"]:
                action = "click_random_element"
        
        elif personality_type == "thorough_reader" and "scroll" in action:
            if random.random() < traits["patience"]:
                action = "read_slowly"
        
        elif personality_type == "social_butterfly" and "share" not in action:
            if random.random() < profile["social_behavior"]["sharing_probability"]:
                action = "share_content"
        
        return action
    
    def apply_context_awareness(self, action: str, context: Dict) -> str:
        """Apply context-aware adjustments to action"""
        # Adjust based on time of day
        hour = datetime.now().hour
        if hour < 6 or hour > 23:
            # Late night - slower actions
            if "fast" in action:
                action = action.replace("fast", "slow")
        
        # Adjust based on device type
        device_type = context.get("device_type", "desktop")
        if device_type == "mobile":
            # Mobile-specific adjustments
            if "hover" in action:
                action = "tap_element"
        
        # Adjust based on network speed
        network_speed = context.get("network_speed", "medium")
        if network_speed == "slow":
            # Avoid heavy actions on slow network
            if "load_video" in action:
                action = "skip_video"
        
        return action
    
    def get_current_season(self) -> str:
        """Get current season"""
        month = datetime.now().month
        if month in [12, 1, 2]:
            return "winter"
        elif month in [3, 4, 5]:
            return "spring"
        elif month in [6, 7, 8]:
            return "summer"
        else:
            return "autumn"


class MoodSystem:
    """Simulates human mood states affecting behavior"""
    
    def __init__(self):
        self.mood_states = ["happy", "neutral", "stressed", "excited", "tired", "focused", "distracted"]
        self.mood_transitions = self.build_mood_transitions()
    
    def build_mood_transitions(self) -> Dict:
        """Build mood transition probabilities"""
        return {
            "happy": {"happy": 0.7, "neutral": 0.2, "excited": 0.1},
            "neutral": {"neutral": 0.6, "happy": 0.2, "stressed": 0.1, "tired": 0.1},
            "stressed": {"stressed": 0.5, "neutral": 0.3, "tired": 0.2},
            "excited": {"excited": 0.4, "happy": 0.4, "neutral": 0.2},
            "tired": {"tired": 0.6, "neutral": 0.3, "stressed": 0.1},
            "focused": {"focused": 0.5, "neutral": 0.3, "tired": 0.2},
            "distracted": {"distracted": 0.4, "neutral": 0.4, "stressed": 0.2}
        }
    
    def generate_mood(self, context: Dict) -> Dict:
        """Generate mood state based on context"""
        current_mood = random.choice(self.mood_states)
        
        return {
            "current_mood": current_mood,
            "mood_intensity": random.uniform(0.3, 0.9),
            "mood_stability": random.uniform(0.5, 0.9),
            "mood_duration": random.randint(300, 1800),  # 5-30 minutes
            "mood_factors": self.analyze_mood_factors(context)
        }
    
    def analyze_mood_factors(self, context: Dict) -> Dict:
        """Analyze factors affecting mood"""
        return {
            "time_of_day": self.get_time_mood_factor(),
            "content_quality": context.get("content_quality", "neutral"),
            "social_context": context.get("social_context", "neutral"),
            "technical_issues": context.get("technical_issues", False),
            "personal_interest": context.get("personal_interest", 0.5)
        }
    
    def get_time_mood_factor(self) -> str:
        """Get mood factor based on time of day"""
        hour = datetime.now().hour
        if 6 <= hour <= 9:
            return "morning_energy"
        elif 9 <= hour <= 12:
            return "peak_productivity"
        elif 12 <= hour <= 14:
            return "lunch_break"
        elif 14 <= hour <= 17:
            return "afternoon_focus"
        elif 17 <= hour <= 20:
            return "evening_relaxation"
        else:
            return "late_night"


class AttentionSystem:
    """Simulates human attention patterns"""
    
    def __init__(self):
        self.attention_states = ["focused", "distracted", "multitasking", "deep_work", "casual"]
        self.attention_factors = self.build_attention_factors()
    
    def build_attention_factors(self) -> Dict:
        """Build attention factor weights"""
        return {
            "content_interest": 0.3,
            "environmental_noise": 0.2,
            "time_pressure": 0.15,
            "device_distractions": 0.15,
            "personal_energy": 0.2
        }
    
    def generate_attention_state(self, context: Dict) -> Dict:
        """Generate attention state based on context"""
        attention_state = random.choice(self.attention_states)
        
        return {
            "current_state": attention_state,
            "attention_span": self.calculate_attention_span(attention_state),
            "distraction_sensitivity": random.uniform(0.1, 0.8),
            "focus_recovery_time": random.uniform(30, 300),  # 30 seconds to 5 minutes
            "multitasking_capacity": random.uniform(0.2, 0.8),
            "attention_factors": self.analyze_attention_factors(context)
        }
    
    def calculate_attention_span(self, state: str) -> int:
        """Calculate attention span in seconds based on state"""
        spans = {
            "focused": random.randint(300, 900),      # 5-15 minutes
            "distracted": random.randint(30, 120),    # 30 seconds to 2 minutes
            "multitasking": random.randint(60, 300),  # 1-5 minutes
            "deep_work": random.randint(900, 1800),   # 15-30 minutes
            "casual": random.randint(120, 600)        # 2-10 minutes
        }
        return spans.get(state, 300)
    
    def analyze_attention_factors(self, context: Dict) -> Dict:
        """Analyze factors affecting attention"""
        return {
            "content_complexity": context.get("content_complexity", "medium"),
            "environmental_distractions": context.get("environmental_distractions", "low"),
            "time_constraints": context.get("time_constraints", "none"),
            "device_notifications": context.get("device_notifications", "low"),
            "personal_energy_level": context.get("energy_level", "medium")
        }


class LearningSystem:
    """Simulates learning and adaptation over time"""
    
    def __init__(self):
        self.learning_patterns = {}
        self.adaptation_history = []
    
    def update_learning_patterns(self, session_data: Dict):
        """Update learning patterns based on session data"""
        # Track successful patterns
        if session_data.get("success", False):
            pattern = self.extract_pattern(session_data)
            self.learning_patterns[pattern] = self.learning_patterns.get(pattern, 0) + 1
    
    def extract_pattern(self, session_data: Dict) -> str:
        """Extract behavioral pattern from session data"""
        interactions = session_data.get("interactions", [])
        
        # Create pattern signature
        pattern_parts = []
        pattern_parts.append(f"duration_{self.categorize_duration(session_data.get('duration', 0))}")
        pattern_parts.append(f"clicks_{len([i for i in interactions if i.get('type') == 'click'])}")
        pattern_parts.append(f"scrolls_{len([i for i in interactions if i.get('type') == 'scroll'])}")
        pattern_parts.append(f"pages_{session_data.get('page_views', 1)}")
        
        return "_".join(pattern_parts)
    
    def categorize_duration(self, duration: float) -> str:
        """Categorize session duration"""
        if duration < 60:
            return "short"
        elif duration < 300:
            return "medium"
        else:
            return "long"
    
    def get_learned_preferences(self) -> Dict:
        """Get learned behavioral preferences"""
        if not self.learning_patterns:
            return {}
        
        # Analyze most successful patterns
        sorted_patterns = sorted(self.learning_patterns.items(), key=lambda x: x[1], reverse=True)
        
        preferences = {
            "preferred_duration": "medium",
            "preferred_interaction_frequency": "medium",
            "preferred_navigation_style": "linear",
            "successful_patterns": sorted_patterns[:3]
        }
        
        return preferences
