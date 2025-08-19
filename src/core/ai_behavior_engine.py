import random
import time
import math
from typing import Dict, List, Optional, Tuple
import logging

class AIBehaviorEngine:
    def __init__(self, config: Dict):
        self.config = config
        self.logger = logging.getLogger(__name__)
        
        # AI behavior patterns
        self.behavior_models = self.load_behavior_models()
        
        # Decision trees for realistic behavior
        self.decision_trees = self.build_decision_trees()
        
        # Context awareness
        self.context_memory = {}
    
    def load_behavior_models(self) -> Dict:
        """Load AI behavior models based on real human data"""
        return {
            "reading_behavior": {
                "fast_reader": {
                    "avg_words_per_minute": 300,
                    "pause_frequency": 0.1,
                    "scroll_speed": "fast",
                    "comprehension_style": "skimming"
                },
                "average_reader": {
                    "avg_words_per_minute": 200,
                    "pause_frequency": 0.3,
                    "scroll_speed": "medium",
                    "comprehension_style": "normal"
                },
                "slow_reader": {
                    "avg_words_per_minute": 150,
                    "pause_frequency": 0.5,
                    "scroll_speed": "slow",
                    "comprehension_style": "detailed"
                }
            },
            "interaction_patterns": {
                "explorer": {
                    "click_probability": 0.8,
                    "hover_probability": 0.9,
                    "scroll_probability": 0.7,
                    "back_button_usage": 0.3
                },
                "focused": {
                    "click_probability": 0.4,
                    "hover_probability": 0.6,
                    "scroll_probability": 0.9,
                    "back_button_usage": 0.1
                },
                "casual": {
                    "click_probability": 0.6,
                    "hover_probability": 0.7,
                    "scroll_probability": 0.5,
                    "back_button_usage": 0.2
                }
            },
            "attention_patterns": {
                "high_attention": {
                    "focus_duration": (30, 120),
                    "distraction_probability": 0.1,
                    "return_probability": 0.9
                },
                "medium_attention": {
                    "focus_duration": (15, 60),
                    "distraction_probability": 0.3,
                    "return_probability": 0.7
                },
                "low_attention": {
                    "focus_duration": (5, 30),
                    "distraction_probability": 0.6,
                    "return_probability": 0.4
                }
            }
        }
    
    def build_decision_trees(self) -> Dict:
        """Build decision trees for realistic behavior choices"""
        return {
            "next_action": {
                "conditions": [
                    {
                        "if": "time_on_page > 300",
                        "then": ["scroll_down", "click_link", "leave_page"],
                        "weights": [0.4, 0.4, 0.2]
                    },
                    {
                        "if": "content_length > 1000",
                        "then": ["continue_reading", "scroll_down", "take_break"],
                        "weights": [0.5, 0.3, 0.2]
                    },
                    {
                        "if": "interesting_content",
                        "then": ["read_more", "bookmark", "share"],
                        "weights": [0.6, 0.2, 0.2]
                    },
                    {
                        "if": "boring_content",
                        "then": ["scroll_fast", "click_away", "close_tab"],
                        "weights": [0.3, 0.5, 0.2]
                    }
                ]
            },
            "interaction_choice": {
                "conditions": [
                    {
                        "if": "first_visit",
                        "then": ["explore_navigation", "read_content", "check_about"],
                        "weights": [0.3, 0.5, 0.2]
                    },
                    {
                        "if": "returning_visitor",
                        "then": ["go_to_bookmarks", "search_content", "check_updates"],
                        "weights": [0.4, 0.4, 0.2]
                    }
                ]
            }
        }
    
    def generate_behavioral_profile(self, session_context: Dict) -> Dict:
        """Generate unique behavioral profile for each session"""
        # Determine user type based on context
        user_type = self.determine_user_type(session_context)
        
        # Generate reading behavior
        reading_behavior = self.behavior_models["reading_behavior"][user_type["reading_style"]]
        
        # Generate interaction patterns
        interaction_patterns = self.behavior_models["interaction_patterns"][user_type["interaction_style"]]
        
        # Generate attention patterns
        attention_patterns = self.behavior_models["attention_patterns"][user_type["attention_style"]]
        
        # Add randomization for uniqueness
        profile = {
            "user_type": user_type,
            "reading_behavior": {
                "words_per_minute": reading_behavior["avg_words_per_minute"] + random.randint(-20, 20),
                "pause_frequency": reading_behavior["pause_frequency"] + random.uniform(-0.1, 0.1),
                "scroll_speed": reading_behavior["scroll_speed"],
                "comprehension_style": reading_behavior["comprehension_style"]
            },
            "interaction_patterns": {
                "click_probability": interaction_patterns["click_probability"] + random.uniform(-0.1, 0.1),
                "hover_probability": interaction_patterns["hover_probability"] + random.uniform(-0.1, 0.1),
                "scroll_probability": interaction_patterns["scroll_probability"] + random.uniform(-0.1, 0.1),
                "back_button_usage": interaction_patterns["back_button_usage"] + random.uniform(-0.05, 0.05)
            },
            "attention_patterns": {
                "focus_duration": (
                    attention_patterns["focus_duration"][0] + random.randint(-5, 5),
                    attention_patterns["focus_duration"][1] + random.randint(-10, 10)
                ),
                "distraction_probability": attention_patterns["distraction_probability"] + random.uniform(-0.1, 0.1),
                "return_probability": attention_patterns["return_probability"] + random.uniform(-0.1, 0.1)
            },
            "personality_traits": {
                "curiosity_level": random.uniform(0.3, 0.9),
                "patience_level": random.uniform(0.2, 0.8),
                "technical_skill": random.uniform(0.1, 0.9),
                "social_behavior": random.uniform(0.2, 0.8)
            }
        }
        
        return profile
    
    def determine_user_type(self, session_context: Dict) -> Dict:
        """Determine user type based on session context"""
        # Analyze session context to determine user type
        time_of_day = session_context.get("time_of_day", "day")
        referer_type = session_context.get("referer_type", "google")
        device_type = session_context.get("device_type", "desktop")
        
        # Reading style determination
        if time_of_day in ["morning", "evening"]:
            reading_style = random.choice(["average_reader", "slow_reader"])
        else:
            reading_style = random.choice(["fast_reader", "average_reader"])
        
        # Interaction style determination
        if referer_type == "social":
            interaction_style = "explorer"
        elif referer_type == "google":
            interaction_style = "focused"
        else:
            interaction_style = "casual"
        
        # Attention style determination
        if device_type == "mobile":
            attention_style = "low_attention"
        elif time_of_day in ["morning", "evening"]:
            attention_style = "high_attention"
        else:
            attention_style = "medium_attention"
        
        return {
            "reading_style": reading_style,
            "interaction_style": interaction_style,
            "attention_style": attention_style
        }
    
    def decide_next_action(self, current_context: Dict, behavioral_profile: Dict) -> str:
        """AI-powered decision making for next action"""
        # Update context memory
        self.update_context_memory(current_context)
        
        # Get relevant decision tree
        decision_tree = self.decision_trees["next_action"]
        
        # Evaluate conditions
        for condition in decision_tree["conditions"]:
            if self.evaluate_condition(condition["if"], current_context):
                actions = condition["then"]
                weights = condition["weights"]
                
                # Choose action based on weights and behavioral profile
                chosen_action = self.weighted_choice(actions, weights, behavioral_profile)
                return chosen_action
        
        # Default action if no conditions match
        return self.get_default_action(behavioral_profile)
    
    def evaluate_condition(self, condition: str, context: Dict) -> bool:
        """Evaluate condition string against context"""
        try:
            # Simple condition evaluation
            if "time_on_page > 300" in condition:
                return context.get("time_on_page", 0) > 300
            elif "content_length > 1000" in condition:
                return context.get("content_length", 0) > 1000
            elif "interesting_content" in condition:
                return context.get("content_interest_score", 0) > 0.7
            elif "boring_content" in condition:
                return context.get("content_interest_score", 0) < 0.3
            elif "first_visit" in condition:
                return context.get("visit_count", 1) == 1
            elif "returning_visitor" in condition:
                return context.get("visit_count", 1) > 1
            
            return False
        except Exception as e:
            self.logger.warning(f"Error evaluating condition: {e}")
            return False
    
    def weighted_choice(self, actions: List[str], weights: List[float], profile: Dict) -> str:
        """Make weighted choice based on behavioral profile"""
        # Adjust weights based on behavioral profile
        adjusted_weights = []
        
        for i, action in enumerate(actions):
            base_weight = weights[i]
            
            # Adjust based on personality traits
            if action == "scroll_down" and profile["personality_traits"]["patience_level"] < 0.5:
                base_weight *= 1.5
            elif action == "read_more" and profile["personality_traits"]["curiosity_level"] > 0.7:
                base_weight *= 1.3
            elif action == "click_away" and profile["personality_traits"]["patience_level"] < 0.3:
                base_weight *= 1.4
            
            adjusted_weights.append(max(0.1, base_weight))  # Ensure minimum weight
        
        # Normalize weights
        total_weight = sum(adjusted_weights)
        normalized_weights = [w / total_weight for w in adjusted_weights]
        
        # Make choice
        rand = random.random()
        cumulative = 0
        
        for i, weight in enumerate(normalized_weights):
            cumulative += weight
            if rand <= cumulative:
                return actions[i]
        
        return actions[0]  # Fallback
    
    def get_default_action(self, profile: Dict) -> str:
        """Get default action based on behavioral profile"""
        interaction_patterns = profile["interaction_patterns"]
        
        # Choose based on interaction probabilities
        if random.random() < interaction_patterns["scroll_probability"]:
            return "scroll_down"
        elif random.random() < interaction_patterns["click_probability"]:
            return "click_link"
        elif random.random() < interaction_patterns["hover_probability"]:
            return "hover_element"
        else:
            return "wait"
    
    def update_context_memory(self, context: Dict):
        """Update context memory for better decision making"""
        session_id = context.get("session_id", "default")
        
        if session_id not in self.context_memory:
            self.context_memory[session_id] = {
                "actions_taken": [],
                "time_spent": 0,
                "pages_visited": 0,
                "interactions_count": 0
            }
        
        # Update memory
        memory = self.context_memory[session_id]
        memory["time_spent"] += context.get("time_delta", 0)
        memory["pages_visited"] = context.get("pages_visited", 0)
        memory["interactions_count"] = context.get("interactions_count", 0)
        
        # Keep only recent actions
        if "last_action" in context:
            memory["actions_taken"].append(context["last_action"])
            memory["actions_taken"] = memory["actions_taken"][-10:]  # Keep last 10 actions
    
    def generate_realistic_timing(self, action: str, profile: Dict) -> float:
        """Generate realistic timing for actions based on behavioral profile"""
        base_timings = {
            "scroll_down": (1.0, 3.0),
            "click_link": (0.5, 2.0),
            "hover_element": (0.2, 1.0),
            "read_content": (5.0, 15.0),
            "wait": (2.0, 8.0),
            "type_text": (0.1, 0.3),
            "select_text": (0.5, 1.5)
        }
        
        base_timing = base_timings.get(action, (1.0, 3.0))
        
        # Adjust based on behavioral profile
        patience_level = profile["personality_traits"]["patience_level"]
        reading_speed = profile["reading_behavior"]["words_per_minute"]
        
        # Calculate adjusted timing
        min_time, max_time = base_timing
        
        if action == "read_content":
            # Adjust reading time based on reading speed
            speed_factor = 200 / reading_speed  # 200 wpm as baseline
            min_time *= speed_factor
            max_time *= speed_factor
        elif action in ["scroll_down", "wait"]:
            # Adjust based on patience level
            patience_factor = 1 + (0.5 - patience_level)  # Less patient = faster
            min_time *= patience_factor
            max_time *= patience_factor
        
        # Add randomization
        timing = random.uniform(min_time, max_time)
        
        # Add micro-variations for realism
        timing += random.uniform(-0.1, 0.1)
        
        return max(0.1, timing)  # Ensure minimum timing
    
    def should_take_break(self, context: Dict, profile: Dict) -> bool:
        """Decide if user should take a break"""
        attention_patterns = profile["attention_patterns"]
        time_on_page = context.get("time_on_page", 0)
        
        # Check if focus duration exceeded
        max_focus = attention_patterns["focus_duration"][1]
        if time_on_page > max_focus:
            return random.random() < attention_patterns["distraction_probability"]
        
        # Random break based on personality
        if profile["personality_traits"]["patience_level"] < 0.4:
            return random.random() < 0.1  # 10% chance for impatient users
        
        return False
    
    def get_break_duration(self, profile: Dict) -> float:
        """Get realistic break duration"""
        attention_patterns = profile["attention_patterns"]
        
        if attention_patterns["return_probability"] > 0.8:
            # High return probability = short break
            return random.uniform(5.0, 30.0)
        elif attention_patterns["return_probability"] > 0.5:
            # Medium return probability = medium break
            return random.uniform(30.0, 120.0)
        else:
            # Low return probability = long break or no return
            return random.uniform(120.0, 300.0)
