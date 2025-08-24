"""
Selenium Automation for Undetectable AdSense Testing
Implements human-like behavior and undetectable automation
"""

import time
import random
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import yaml
import os
import json

class UndetectableSeleniumAutomation:
    def __init__(self, config_path: str = "../config/config.yaml"):
        """Initialize undetectable Selenium automation with comprehensive configuration"""
        self.config = self._load_config(config_path)
        self.logger = logging.getLogger(__name__)
        self.driver = None
        self.wait = None
        
        # Load all selenium configurations from YAML
        selenium_config = self.config.get("selenium", {})
        
        # Load human behavior configuration
        self.human_behavior_config = selenium_config.get("human_behavior", {
            "enabled": True,
            "mouse_movement": True,
            "random_delays": True,
            "natural_scrolling": True,
            "realistic_typing": True,
            "min_delay": 1,
            "max_delay": 5,
            "scroll_interval_min": 0.5,  # Fixed: Use faster speed
            "scroll_interval_max": 1.5   # Fixed: Use faster speed
        })
        
        # Load click simulation configuration
        self.click_config = self.human_behavior_config.get("click_simulation", {
            "enabled": True,
            "natural_click_patterns": True,
            "hover_before_click": True,
            "click_delay_variation": True,
            "double_click_probability": 0.05
        })
        
        # Load traffic generation configuration
        self.traffic_config = self.human_behavior_config.get("traffic_generation", {
            "enabled": True,
            "natural_browsing_patterns": True,
            "page_dwell_time": [30, 180],
            "scroll_behavior": "natural",
            "tab_switching": True,
            "bookmark_creation": True
        })
        
        # Load realistic behavior configuration
        self.realistic_config = self.human_behavior_config.get("realistic_behavior", {
            "enabled": True,
            "attention_span_variation": True,
            "reading_speed_variation": True,
            "mouse_acceleration": True,
            "keyboard_typing_patterns": True,
            "browser_navigation_patterns": True
        })
        
        # Load browsing behavior configuration from YAML
        self.browsing_config = selenium_config.get("browsing_behavior", {
            "min_pages": 2,
            "max_pages": 5,
            "page_dwell_time": [30, 180],
            "navigation_probabilities": {
                "category": 0.4,
                "legal": 0.3,
                "previous_next": 0.6,
                "random": 0.1
            }
        })
        
        # Load advanced behavior configuration
        self.advanced_config = selenium_config.get("advanced_behavior", {
            "enabled": True,
            "time_based_adjustment": True,
            "personality_generation": True,
            "personality_weights": {
                "explorer": 0.25,
                "researcher": 0.25,
                "casual": 0.25,
                "professional": 0.25
            },
            "device_detection": True,
            "device_distribution": {
                "desktop": 0.6,
                "mobile": 0.3,
                "tablet": 0.1
            },
            "geo_specific_behavior": True,
            "geo_behavior_enabled": True,
            "content_awareness": True,
            "content_analysis": True,
            "session_memory": True,
            "memory_persistence": True,
            "smart_ad_interaction": True,
            "context_aware_interaction": True,
            "post_ad_click_behavior": {
                "enabled": True,
                "landing_page_behavior": True,
                "form_interaction": True,
                "purchase_simulation": True,
                "back_navigation": True
            }
        })
        
        # Initialize advanced behavior systems with configuration
        self.session_memory = {}
        self.user_personality = self._generate_user_personality()
        self.device_type = self._detect_device_type()
        self.geo_location = "US"  # Default, will be updated from fingerprint
        
        # Initialize stealth behavior tracking
        self.stealth_metrics = {
            "mouse_movements": 0,
            "clicks": 0,
            "scrolls": 0,
            "typing_events": 0,
            "page_visits": 0,
            "session_start": datetime.now(),
            "last_activity": datetime.now()
        }
        
        # Time-based behavior adjustment
        if self.advanced_config.get("time_based_adjustment", True):
            self._adjust_behavior_by_time()
        
        # Initialize all behavior systems
        self._initialize_behavior_systems()
    
    def _initialize_behavior_systems(self):
        """Initialize all behavior systems based on configuration"""
        try:
            # Initialize realistic behavior systems
            if self.realistic_config.get("enabled", True):
                self._simulate_attention_span_variation()
                self._simulate_reading_speed_variation()
                self._simulate_browser_navigation_patterns()
            
            # Initialize traffic generation systems
            if self.traffic_config.get("enabled", True):
                self._simulate_tab_switching()
                self._simulate_bookmark_creation()
            
            # Initialize session memory if enabled
            if self.advanced_config.get("session_memory", True):
                self.session_memory.update({
                    "personality": self.user_personality,
                    "device_type": self.device_type,
                    "geo_location": self.geo_location,
                    "session_start": datetime.now().isoformat(),
                    "behavior_patterns": {
                        "attention_span": "medium",
                        "reading_speed": "medium",
                        "navigation_style": "balanced"
                    }
                })
            
            self.logger.info("🎯 All behavior systems initialized successfully")
            
        except Exception as e:
            self.logger.error(f"Error initializing behavior systems: {e}")
    
    def get_stealth_metrics(self) -> Dict:
        """Get current stealth metrics for monitoring"""
        try:
            session_duration = datetime.now() - self.stealth_metrics["session_start"]
            
            metrics = {
                "session_duration": str(session_duration),
                "mouse_movements": self.stealth_metrics["mouse_movements"],
                "clicks": self.stealth_metrics["clicks"],
                "scrolls": self.stealth_metrics["scrolls"],
                "typing_events": self.stealth_metrics["typing_events"],
                "page_visits": self.stealth_metrics["page_visits"],
                "last_activity": self.stealth_metrics["last_activity"].isoformat(),
                "personality": self.user_personality,
                "device_type": self.device_type,
                "geo_location": self.geo_location,
                "behavior_config": {
                    "human_behavior_enabled": self.human_behavior_config.get("enabled", True),
                    "click_simulation_enabled": self.click_config.get("enabled", True),
                    "traffic_generation_enabled": self.traffic_config.get("enabled", True),
                    "realistic_behavior_enabled": self.realistic_config.get("enabled", True),
                    "advanced_behavior_enabled": self.advanced_config.get("enabled", True)
                }
            }
            
            return metrics
            
        except Exception as e:
            self.logger.error(f"Error getting stealth metrics: {e}")
            return {}
    
    def _load_config(self, config_path: str) -> Dict:
        """Load configuration from YAML file"""
        try:
            with open(config_path, 'r') as file:
                return yaml.safe_load(file)
        except FileNotFoundError:
            raise FileNotFoundError(f"Configuration file not found: {config_path}")
    
    def _adjust_behavior_by_time(self):
        """Adjust behavior based on time of day"""
        current_hour = datetime.now().hour
        
        # Time-based behavior patterns
        if 6 <= current_hour < 12:  # Morning - High energy
            self.browsing_config["min_pages"] = 3
            self.browsing_config["max_pages"] = 6
            self.browsing_config["page_dwell_time"] = [20, 120]
            self.browsing_config["reading_speed"] = "fast"
            self.browsing_config["energy_level"] = "high"
            self.logger.info("🌅 Morning behavior: High energy, fast reading, more pages")
            
        elif 12 <= current_hour < 18:  # Afternoon - Medium energy
            self.browsing_config["min_pages"] = 2
            self.browsing_config["max_pages"] = 5
            self.browsing_config["page_dwell_time"] = [30, 180]
            self.browsing_config["reading_speed"] = "medium"
            self.browsing_config["energy_level"] = "medium"
            self.logger.info("☀️ Afternoon behavior: Medium energy, balanced activity")
            
        elif 18 <= current_hour < 22:  # Evening - Low energy
            self.browsing_config["min_pages"] = 2
            self.browsing_config["max_pages"] = 4
            self.browsing_config["page_dwell_time"] = [45, 240]
            self.browsing_config["reading_speed"] = "slow"
            self.browsing_config["energy_level"] = "low"
            self.logger.info("🌆 Evening behavior: Low energy, slow reading, fewer pages")
            
        else:  # Night - Very low energy
            self.browsing_config["min_pages"] = 1
            self.browsing_config["max_pages"] = 3
            self.browsing_config["page_dwell_time"] = [60, 300]
            self.browsing_config["reading_speed"] = "very_slow"
            self.browsing_config["energy_level"] = "very_low"
            self.logger.info("🌙 Night behavior: Very low energy, minimal activity")
    
    def _generate_user_personality(self) -> str:
        """Generate consistent personality for each session using configuration weights"""
        personalities = {
            "explorer": {
                "curiosity": "high",
                "depth": "shallow", 
                "speed": "fast",
                "navigation_style": "random",
                "attention_span": "short"
            },
            "researcher": {
                "curiosity": "high",
                "depth": "deep",
                "speed": "slow", 
                "navigation_style": "systematic",
                "attention_span": "long"
            },
            "casual": {
                "curiosity": "low",
                "depth": "shallow",
                "speed": "medium",
                "navigation_style": "linear", 
                "attention_span": "medium"
            },
            "professional": {
                "curiosity": "medium",
                "depth": "deep",
                "speed": "medium",
                "navigation_style": "efficient",
                "attention_span": "long"
            }
        }
        
        # Use personality weights from configuration if available
        personality_weights = self.advanced_config.get("personality_weights", {
            "explorer": 0.25,
            "researcher": 0.25,
            "casual": 0.25,
            "professional": 0.25
        })
        
        # Generate personality based on weights
        personality = random.choices(
            list(personalities.keys()),
            weights=list(personality_weights.values())
        )[0]
        
        self.logger.info(f"🎭 Generated personality: {personality}")
        return personality
    
    def _detect_device_type(self) -> str:
        """Detect device type from user agent or configuration using distribution weights"""
        # Use device distribution from configuration
        device_distribution = self.advanced_config.get("device_distribution", {
            "desktop": 0.6,
            "mobile": 0.3,
            "tablet": 0.1
        })
        
        # Generate device type based on distribution weights
        device_types = list(device_distribution.keys())
        weights = list(device_distribution.values())
        
        device_type = random.choices(device_types, weights=weights)[0]
        self.logger.info(f"📱 Detected device type: {device_type}")
        return device_type
    
    def _get_geo_specific_behavior(self, country: str) -> Dict:
        """Get behavior patterns specific to geographic location"""
        geo_patterns = {
            "US": {
                "reading_speed": "fast",
                "attention_span": "short",
                "preferred_content": ["news", "entertainment", "technology"],
                "navigation_style": "efficient",
                "page_dwell_time": [20, 120]
            },
            "GB": {
                "reading_speed": "medium",
                "attention_span": "medium", 
                "preferred_content": ["news", "sports", "business"],
                "navigation_style": "thorough",
                "page_dwell_time": [30, 180]
            },
            "DE": {
                "reading_speed": "slow",
                "attention_span": "long",
                "preferred_content": ["technology", "business", "education"],
                "navigation_style": "systematic",
                "page_dwell_time": [45, 240]
            },
            "CA": {
                "reading_speed": "medium",
                "attention_span": "medium",
                "preferred_content": ["news", "technology", "lifestyle"],
                "navigation_style": "balanced",
                "page_dwell_time": [25, 150]
            },
            "AU": {
                "reading_speed": "medium",
                "attention_span": "medium",
                "preferred_content": ["sports", "news", "entertainment"],
                "navigation_style": "casual",
                "page_dwell_time": [30, 180]
            }
        }
        
        return geo_patterns.get(country, geo_patterns["US"])
    
    def _random_delay(self, min_delay: float = None, max_delay: float = None):
        """Apply random delay based on configuration for stealth behavior"""
        if not self.human_behavior_config.get("random_delays", True):
            return
            
        min_d = min_delay or self.human_behavior_config.get("min_delay", 1)
        max_d = max_delay or self.human_behavior_config.get("max_delay", 5)
        
        delay = random.uniform(min_d, max_d)
        time.sleep(delay)
        
        # Update stealth metrics
        self.stealth_metrics["last_activity"] = datetime.now()
    
    def _simulate_realistic_typing(self, text: str, element=None):
        """Simulate realistic typing patterns with configuration"""
        if not self.human_behavior_config.get("realistic_typing", True):
            return
            
        try:
            if element:
                element.clear()
            
            # Get typing patterns from realistic behavior config
            typing_patterns = self.realistic_config.get("keyboard_typing_patterns", True)
            
            if typing_patterns:
                # Simulate human typing with variable speed
                for char in text:
                    if element:
                        element.send_keys(char)
                    
                    # Variable typing speed (100-300ms per character)
                    typing_delay = random.uniform(0.1, 0.3)
                    time.sleep(typing_delay)
                    
                    # Occasional longer pauses (like human thinking)
                    if random.random() < 0.05:  # 5% chance
                        time.sleep(random.uniform(0.5, 1.5))
            
            # Update stealth metrics
            self.stealth_metrics["typing_events"] += 1
            self.stealth_metrics["last_activity"] = datetime.now()
            
        except Exception as e:
            self.logger.error(f"Error in realistic typing: {e}")
    
    def _simulate_mouse_acceleration(self, start_x: int, start_y: int, end_x: int, end_y: int):
        """Simulate realistic mouse acceleration patterns"""
        if not self.realistic_config.get("mouse_acceleration", True):
            return
            
        try:
            # Calculate distance
            distance = ((end_x - start_x) ** 2 + (end_y - start_y) ** 2) ** 0.5
            
            # Generate acceleration curve (slow start, fast middle, slow end)
            steps = max(5, int(distance / 10))
            points = []
            
            for i in range(steps + 1):
                t = i / steps
                # Ease-in-out curve
                if t < 0.5:
                    ease = 2 * t * t
                else:
                    ease = 1 - 2 * (1 - t) * (1 - t)
                
                x = start_x + (end_x - start_x) * ease
                y = start_y + (end_y - start_y) * ease
                points.append((x, y))
            
            # Execute mouse movement with acceleration
            for x, y in points:
                self.driver.execute_script(f"""
                    var event = new MouseEvent('mousemove', {{
                        'view': window,
                        'bubbles': true,
                        'cancelable': true,
                        'clientX': {x},
                        'clientY': {y}
                    }});
                    document.dispatchEvent(event);
                """)
                time.sleep(random.uniform(0.01, 0.03))
            
            # Update stealth metrics
            self.stealth_metrics["mouse_movements"] += 1
            self.stealth_metrics["last_activity"] = datetime.now()
            
        except Exception as e:
            self.logger.error(f"Error in mouse acceleration: {e}")
    
    def _simulate_attention_span_variation(self):
        """Simulate realistic attention span variation"""
        if not self.realistic_config.get("attention_span_variation", True):
            return
            
        try:
            # Get personality-based attention span
            personality_attention = {
                "explorer": 0.3,      # Short attention
                "researcher": 0.8,    # Long attention
                "casual": 0.5,        # Medium attention
                "professional": 0.7   # Good attention
            }
            
            base_attention = personality_attention.get(self.user_personality, 0.5)
            
            # Add random variation
            attention_factor = base_attention + random.uniform(-0.2, 0.2)
            attention_factor = max(0.1, min(1.0, attention_factor))
            
            # Apply attention span to behavior
            if attention_factor < 0.3:
                # Short attention - quick browsing
                self.browsing_config["page_dwell_time"] = [10, 60]
                self.logger.info("👁️ Short attention span: Quick browsing mode")
            elif attention_factor > 0.7:
                # Long attention - detailed reading
                self.browsing_config["page_dwell_time"] = [60, 300]
                self.logger.info("👁️ Long attention span: Detailed reading mode")
            else:
                # Medium attention - balanced
                self.browsing_config["page_dwell_time"] = [30, 180]
                self.logger.info("👁️ Medium attention span: Balanced mode")
                
        except Exception as e:
            self.logger.error(f"Error in attention span variation: {e}")
    
    def _simulate_reading_speed_variation(self):
        """Simulate realistic reading speed variation"""
        if not self.realistic_config.get("reading_speed_variation", True):
            return
            
        try:
            # Get personality-based reading speed
            personality_speed = {
                "explorer": 0.3,      # Fast reader
                "researcher": 0.8,    # Slow, thorough reader
                "casual": 0.5,        # Medium speed
                "professional": 0.6   # Efficient reader
            }
            
            base_speed = personality_speed.get(self.user_personality, 0.5)
            
            # Add random variation
            speed_factor = base_speed + random.uniform(-0.2, 0.2)
            speed_factor = max(0.1, min(1.0, speed_factor))
            
            # Apply reading speed to behavior
            if speed_factor < 0.3:
                # Fast reader
                self.browsing_config["reading_speed"] = "fast"
                self.logger.info("📖 Fast reading speed: Quick scanning mode")
            elif speed_factor > 0.7:
                # Slow reader
                self.browsing_config["reading_speed"] = "slow"
                self.logger.info("📖 Slow reading speed: Thorough reading mode")
            else:
                # Medium speed
                self.browsing_config["reading_speed"] = "medium"
                self.logger.info("📖 Medium reading speed: Balanced mode")
                
        except Exception as e:
            self.logger.error(f"Error in reading speed variation: {e}")
    
    def _simulate_browser_navigation_patterns(self):
        """Simulate realistic browser navigation patterns"""
        if not self.realistic_config.get("browser_navigation_patterns", True):
            return
            
        try:
            # Simulate common browser navigation patterns
            navigation_patterns = [
                "back_button_usage",
                "forward_button_usage", 
                "refresh_page",
                "bookmark_page",
                "open_new_tab",
                "close_tab"
            ]
            
            # Select random navigation pattern based on personality
            if self.user_personality == "explorer":
                # Explorer uses more navigation
                pattern = random.choice(navigation_patterns)
            elif self.user_personality == "researcher":
                # Researcher uses systematic navigation
                pattern = random.choice(["back_button_usage", "bookmark_page", "open_new_tab"])
            elif self.user_personality == "casual":
                # Casual user minimal navigation
                pattern = random.choice(["back_button_usage", "refresh_page"])
            else:  # professional
                # Professional efficient navigation
                pattern = random.choice(["back_button_usage", "bookmark_page"])
            
            # Execute navigation pattern
            if pattern == "back_button_usage" and random.random() < 0.3:
                self.driver.back()
                self._random_delay(2, 5)
            elif pattern == "refresh_page" and random.random() < 0.1:
                self.driver.refresh()
                self._random_delay(3, 8)
            
            # Update stealth metrics
            self.stealth_metrics["last_activity"] = datetime.now()
            
        except Exception as e:
            self.logger.error(f"Error in browser navigation patterns: {e}")
    
    def _simulate_tab_switching(self):
        """Simulate realistic tab switching behavior"""
        if not self.traffic_config.get("tab_switching", True):
            return
            
        try:
            # Get current window handles
            handles = self.driver.window_handles
            
            if len(handles) > 1:
                # Switch to random tab
                target_handle = random.choice(handles)
                self.driver.switch_to.window(target_handle)
                
                # Random delay after switching
                self._random_delay(1, 3)
                
                # Update stealth metrics
                self.stealth_metrics["last_activity"] = datetime.now()
                
        except Exception as e:
            self.logger.error(f"Error in tab switching: {e}")
    
    def _simulate_bookmark_creation(self):
        """Simulate realistic bookmark creation behavior"""
        if not self.traffic_config.get("bookmark_creation", True):
            return
            
        try:
            # Simulate bookmark creation (5% chance)
            if random.random() < 0.05:
                # Use keyboard shortcut Ctrl+D (or Cmd+D on Mac)
                from selenium.webdriver.common.keys import Keys
                from selenium.webdriver.common.action_chains import ActionChains
                
                actions = ActionChains(self.driver)
                actions.key_down(Keys.COMMAND if os.name == 'posix' else Keys.CONTROL)
                actions.send_keys('d')
                actions.key_up(Keys.COMMAND if os.name == 'posix' else Keys.CONTROL)
                actions.perform()
                
                # Random delay after bookmarking
                self._random_delay(2, 5)
                
                # Update stealth metrics
                self.stealth_metrics["last_activity"] = datetime.now()
                
        except Exception as e:
            self.logger.error(f"Error in bookmark creation: {e}")
    
    def _detect_content_type(self) -> str:
        """Detect the type of content on the page"""
        try:
            page_text = self.driver.find_element(By.TAG_NAME, "body").text.lower()
            page_title = self.driver.title.lower()
            
            # Content type indicators
            content_indicators = {
                "news": ["news", "breaking", "update", "latest", "report", "announcement"],
                "product": ["buy", "price", "product", "shop", "store", "purchase", "order"],
                "blog": ["blog", "post", "article", "story", "tutorial", "guide"],
                "technology": ["tech", "technology", "software", "app", "digital", "online"],
                "business": ["business", "company", "corporate", "enterprise", "industry"],
                "entertainment": ["entertainment", "movie", "music", "game", "fun", "play"]
            }
            
            # Count matches for each content type
            content_scores = {}
            for content_type, indicators in content_indicators.items():
                score = sum(1 for indicator in indicators if indicator in page_text or indicator in page_title)
                content_scores[content_type] = score
            
            # Return the content type with highest score
            if content_scores:
                detected_type = max(content_scores, key=content_scores.get)
                if content_scores[detected_type] > 0:
                    self.logger.debug(f"📄 Detected content type: {detected_type}")
                    return detected_type
            
            return "general"
            
        except Exception as e:
            self.logger.debug(f"Error detecting content type: {e}")
            return "general"
    
    def _analyze_content_quality(self) -> Dict:
        """Analyze content quality and adjust behavior accordingly"""
        try:
            page_text = self.driver.find_element(By.TAG_NAME, "body").text
            
            # Quality indicators
            quality_indicators = {
                "high_quality": {
                    "indicators": ["research", "study", "analysis", "expert", "professional", "comprehensive"],
                    "min_length": 1000,
                    "behavior": {"dwell_time": "long", "engagement": "high", "reading_speed": "slow"}
                },
                "medium_quality": {
                    "indicators": ["article", "post", "story", "information", "details"],
                    "min_length": 500,
                    "behavior": {"dwell_time": "medium", "engagement": "medium", "reading_speed": "medium"}
                },
                "low_quality": {
                    "indicators": ["clickbait", "advertisement", "sponsored", "promotion"],
                    "min_length": 100,
                    "behavior": {"dwell_time": "short", "engagement": "low", "reading_speed": "fast"}
                }
            }
            
            text_length = len(page_text)
            
            for quality, config in quality_indicators.items():
                indicator_count = sum(1 for indicator in config["indicators"] if indicator in page_text.lower())
                if indicator_count > 0 and text_length >= config["min_length"]:
                    self.logger.debug(f"📊 Content quality: {quality}")
                    return config["behavior"]
            
            return {"dwell_time": "medium", "engagement": "medium", "reading_speed": "medium"}
            
        except Exception as e:
            self.logger.debug(f"Error analyzing content quality: {e}")
            return {"dwell_time": "medium", "engagement": "medium", "reading_speed": "medium"}
    
    def _smart_ad_interaction(self) -> Dict:
        """Intelligent ad interaction based on context from config"""
        try:
            # Analyze page context
            page_text = self.driver.find_element(By.TAG_NAME, "body").text.lower()
            page_title = self.driver.title.lower()
            
            # Get keyword relevance from config
            keyword_config = self.config.get('adsense_testing', {}).get('keyword_relevance', {})
            
            # Calculate relevance score for each category
            high_score = 0
            medium_score = 0
            low_score = 0
            
            # High relevance keywords
            if 'high_relevance' in keyword_config:
                high_keywords = keyword_config['high_relevance'].get('keywords', [])
                high_score = sum(1 for word in high_keywords if word in page_text or word in page_title)
            
            # Medium relevance keywords
            if 'medium_relevance' in keyword_config:
                medium_keywords = keyword_config['medium_relevance'].get('keywords', [])
                medium_score = sum(1 for word in medium_keywords if word in page_text or word in page_title)
            
            # Low relevance keywords
            if 'low_relevance' in keyword_config:
                low_keywords = keyword_config['low_relevance'].get('keywords', [])
                low_score = sum(1 for word in low_keywords if word in page_text or word in page_title)
            
            # Return appropriate configuration based on score
            if high_score > 0:
                high_config = keyword_config.get('high_relevance', {})
                return {
                    "interaction_probability": high_config.get('interaction_probability', 0.05),
                    "dwell_time": high_config.get('dwell_time', 'long'),
                    "relevance": high_config.get('relevance', 'high')
                }
            elif medium_score > 0:
                medium_config = keyword_config.get('medium_relevance', {})
                return {
                    "interaction_probability": medium_config.get('interaction_probability', 0.02),
                    "dwell_time": medium_config.get('dwell_time', 'medium'),
                    "relevance": medium_config.get('relevance', 'medium')
                }
            else:
                low_config = keyword_config.get('low_relevance', {})
                return {
                    "interaction_probability": low_config.get('interaction_probability', 0.001),
                    "dwell_time": low_config.get('dwell_time', 'short'),
                    "relevance": low_config.get('relevance', 'low')
                }
                
        except Exception as e:
            self.logger.debug(f"Error in smart ad interaction: {e}")
            return {"interaction_probability": 0.001, "dwell_time": "short", "relevance": "low"}
    
    def _save_session_memory(self, session_data: Dict):
        """Save session data for future reference"""
        try:
            memory_file = f"data/session_memory_{datetime.now().strftime('%Y%m%d')}.json"
            
            # Load existing memory
            existing_memory = {}
            if os.path.exists(memory_file):
                with open(memory_file, 'r') as f:
                    existing_memory = json.load(f)
            
            # Add new session data
            session_id = f"session_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            existing_memory[session_id] = {
                "timestamp": datetime.now().isoformat(),
                "personality": self.user_personality,
                "device_type": self.device_type,
                "geo_location": self.geo_location,
                "session_data": session_data
            }
            
            # Save updated memory
            os.makedirs("data", exist_ok=True)
            with open(memory_file, 'w') as f:
                json.dump(existing_memory, f, indent=2)
                
            self.logger.debug(f"💾 Session memory saved: {session_id}")
            
        except Exception as e:
            self.logger.error(f"Error saving session memory: {e}")
    
    def _load_session_memory(self) -> Dict:
        """Load previous session memory for consistency"""
        try:
            memory_file = f"data/session_memory_{datetime.now().strftime('%Y%m%d')}.json"
            
            if os.path.exists(memory_file):
                with open(memory_file, 'r') as f:
                    memory_data = json.load(f)
                
                # Get recent sessions for this personality/device/geo combination
                recent_sessions = []
                for session_id, session_info in memory_data.items():
                    if (session_info.get("personality") == self.user_personality and
                        session_info.get("device_type") == self.device_type and
                        session_info.get("geo_location") == self.geo_location):
                        recent_sessions.append(session_info)
                
                if recent_sessions:
                    # Return patterns from recent sessions
                    return {
                        "preferred_categories": self._extract_preferred_categories(recent_sessions),
                        "reading_speed": self._extract_reading_speed(recent_sessions),
                        "navigation_style": self._extract_navigation_style(recent_sessions)
                    }
            
            return {}
            
        except Exception as e:
            self.logger.error(f"Error loading session memory: {e}")
            return {}
    
    def _extract_preferred_categories(self, sessions: List[Dict]) -> List[str]:
        """Extract preferred categories from session history"""
        categories = []
        for session in sessions:
            if "session_data" in session and "navigation_pattern" in session["session_data"]:
                categories.extend(session["session_data"]["navigation_pattern"])
        
        # Return most common categories
        from collections import Counter
        category_counts = Counter(categories)
        return [cat for cat, count in category_counts.most_common(3)]
    
    def _extract_reading_speed(self, sessions: List[Dict]) -> str:
        """Extract average reading speed from session history"""
        speeds = []
        for session in sessions:
            if "session_data" in session and "session_duration" in session["session_data"]:
                duration = session["session_data"]["session_duration"]
                pages = session["session_data"].get("total_pages", 1)
                if pages > 0:
                    avg_time_per_page = duration / pages
                    if avg_time_per_page < 60:
                        speeds.append("fast")
                    elif avg_time_per_page < 120:
                        speeds.append("medium")
                    else:
                        speeds.append("slow")
        
        if speeds:
            from collections import Counter
            speed_counts = Counter(speeds)
            return speed_counts.most_common(1)[0][0]
        
        return "medium"
    
    def _extract_navigation_style(self, sessions: List[Dict]) -> str:
        """Extract navigation style from session history"""
        styles = []
        for session in sessions:
            if "session_data" in session and "navigation_pattern" in session["session_data"]:
                pattern = session["session_data"]["navigation_pattern"]
                if "category" in pattern:
                    styles.append("explorer")
                elif "legal" in pattern:
                    styles.append("researcher")
                elif "previous_next" in pattern:
                    styles.append("linear")
                else:
                    styles.append("random")
        
        if styles:
            from collections import Counter
            style_counts = Counter(styles)
            return style_counts.most_common(1)[0][0]
        
        return "explorer"
    
    def setup_driver(self, debugging_url: str) -> bool:
        """Setup undetectable Chrome driver"""
        try:
            chrome_options = Options()
            
            # Basic settings for Multilogin compatibility
            chrome_options.add_argument("--no-sandbox")
            chrome_options.add_argument("--disable-dev-shm-usage")
            chrome_options.add_argument("--disable-blink-features=AutomationControlled")
            
            # Remove problematic experimental options
            # chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
            # chrome_options.add_experimental_option('useAutomationExtension', False)
            
            # Additional stealth settings
            chrome_options.add_argument("--disable-web-security")
            chrome_options.add_argument("--disable-features=VizDisplayCompositor")
            chrome_options.add_argument("--disable-extensions")
            chrome_options.add_argument("--disable-plugins")
            # chrome_options.add_argument("--disable-images")  # Optional: for faster loading
            
            # User agent will be set by Multilogin fingerprint
            
            # Connect to Multilogin debugging URL
            self.driver = webdriver.Remote(
                command_executor=debugging_url,
                options=chrome_options
            )
            
            # Execute stealth script
            self.driver.execute_script("""
                Object.defineProperty(navigator, 'webdriver', {
                    get: () => undefined,
                });
            """)
            
            self.wait = WebDriverWait(self.driver, 10)
            self.logger.info("Successfully setup undetectable Chrome driver")
            return True
            
        except Exception as e:
            self.logger.error(f"Error setting up driver: {e}")
            return False
    
    def simulate_realistic_browsing(self, base_url: str) -> Dict:
        """Simulate realistic browsing behavior with multiple page visits"""
        try:
            # Load session memory for consistency
            session_memory = self._load_session_memory()
            
            # Get geo-specific behavior
            geo_behavior = self._get_geo_specific_behavior(self.geo_location)
            
            browsing_session = {
                "pages_visited": [],
                "total_pages": 0,
                "session_duration": 0,
                "navigation_pattern": [],
                "start_time": time.time(),
                "personality": self.user_personality,
                "device_type": self.device_type,
                "geo_location": self.geo_location,
                "session_memory": session_memory,
                "geo_behavior": geo_behavior
            }
            
            # Adjust behavior based on personality and memory
            self._adjust_behavior_by_personality()
            self._adjust_behavior_by_memory(session_memory)
            
            # Determine number of pages to visit
            pages_to_visit = random.randint(
                self.browsing_config["min_pages"], 
                self.browsing_config["max_pages"]
            )
            
            self.logger.info(f"🎭 Starting realistic browsing session: {pages_to_visit} pages")
            self.logger.info(f"👤 Personality: {self.user_personality}")
            self.logger.info(f"📱 Device: {self.device_type}")
            self.logger.info(f"🌍 Location: {self.geo_location}")
            self.logger.info(f"🕒 Time-based behavior: {self.browsing_config.get('energy_level', 'medium')}")
            
            # Start with the base URL
            current_url = base_url
            self.driver.get(current_url)
            time.sleep(random.uniform(3, 6))
            
            # Simulate initial page behavior with content awareness
            content_type = self._detect_content_type()
            content_quality = self._analyze_content_quality()
            
            self._simulate_page_behavior(content_type, content_quality)
            browsing_session["pages_visited"].append({
                "url": current_url,
                "type": "main_page",
                "content_type": content_type,
                "content_quality": content_quality,
                "dwell_time": random.uniform(*self.browsing_config["page_dwell_time"])
            })
            
            # Navigate through additional pages
            for page_num in range(1, pages_to_visit):
                try:
                    # Decide navigation type based on personality and memory
                    navigation_type = self._choose_navigation_type_with_context(session_memory)
                    
                    if navigation_type == "category":
                        new_url = self._navigate_to_category()
                    elif navigation_type == "legal":
                        new_url = self._navigate_to_legal_page()
                    elif navigation_type == "previous_next":
                        new_url = self._navigate_previous_next()
                    else:
                        new_url = self._navigate_random_page()
                    
                    if new_url and new_url != current_url:
                        # Navigate to new page
                        self.driver.get(new_url)
                        time.sleep(random.uniform(2, 4))
                        
                        # Analyze content and simulate behavior
                        content_type = self._detect_content_type()
                        content_quality = self._analyze_content_quality()
                        
                        self._simulate_page_behavior(content_type, content_quality)
                        
                        # Record page visit with detailed information
                        browsing_session["pages_visited"].append({
                            "url": new_url,
                            "type": navigation_type,
                            "content_type": content_type,
                            "content_quality": content_quality,
                            "dwell_time": random.uniform(*self.browsing_config["page_dwell_time"])
                        })
                        
                        browsing_session["navigation_pattern"].append(navigation_type)
                        current_url = new_url
                        
                        self.logger.info(f"📄 Visited page {page_num + 1}: {navigation_type} - {content_type} ({content_quality['dwell_time']}) - {new_url}")
                    
                except Exception as e:
                    self.logger.error(f"Error during page navigation: {e}")
                    break
            
            # Calculate session metrics
            browsing_session["total_pages"] = len(browsing_session["pages_visited"])
            browsing_session["session_duration"] = time.time() - browsing_session["start_time"]
            
            # Save session memory for future consistency
            self._save_session_memory(browsing_session)
            
            self.logger.info(f"✅ Browsing session completed: {browsing_session['total_pages']} pages, {browsing_session['session_duration']:.1f}s")
            self.logger.info(f"🎯 Navigation pattern: {browsing_session['navigation_pattern']}")
            
            return browsing_session
            
        except Exception as e:
            self.logger.error(f"Error in realistic browsing: {e}")
            return {"error": str(e)}
    
    def _choose_navigation_type(self) -> str:
        """Choose navigation type based on probabilities"""
        rand = random.random()
        probabilities = self.browsing_config["navigation_probabilities"]
        
        if rand < probabilities["category"]:
            return "category"
        elif rand < probabilities["category"] + probabilities["legal"]:
            return "legal"
        elif rand < probabilities["category"] + probabilities["legal"] + probabilities["previous_next"]:
            return "previous_next"
        else:
            return "random"
    
    def _choose_navigation_type_with_context(self, session_memory: Dict) -> str:
        """Choose navigation type based on personality, memory, and context"""
        # Get personality preferences
        personality_preferences = {
            "explorer": {"category": 0.6, "random": 0.3, "legal": 0.1, "previous_next": 0.0},
            "researcher": {"legal": 0.5, "category": 0.3, "previous_next": 0.2, "random": 0.0},
            "casual": {"previous_next": 0.6, "category": 0.2, "random": 0.2, "legal": 0.0},
            "professional": {"category": 0.4, "legal": 0.3, "previous_next": 0.2, "random": 0.1}
        }
        
        # Get preferences based on personality
        preferences = personality_preferences.get(self.user_personality, personality_preferences["casual"])
        
        # Adjust based on session memory
        if session_memory.get("preferred_categories"):
            # Increase probability for preferred categories
            preferences["category"] += 0.2
            # Normalize probabilities
            total = sum(preferences.values())
            preferences = {k: v/total for k, v in preferences.items()}
        
        # Choose navigation type
        rand = random.random()
        cumulative = 0
        
        for nav_type, prob in preferences.items():
            cumulative += prob
            if rand <= cumulative:
                return nav_type
        
        return "random"
    
    def _adjust_behavior_by_personality(self):
        """Adjust browsing behavior based on personality"""
        personality_adjustments = {
            "explorer": {
                "min_pages": 3,
                "max_pages": 7,
                "page_dwell_time": [15, 90],
                "reading_speed": "fast",
                "attention_span": "short"
            },
            "researcher": {
                "min_pages": 2,
                "max_pages": 5,
                "page_dwell_time": [60, 300],
                "reading_speed": "slow",
                "attention_span": "long"
            },
            "casual": {
                "min_pages": 2,
                "max_pages": 4,
                "page_dwell_time": [30, 150],
                "reading_speed": "medium",
                "attention_span": "medium"
            },
            "professional": {
                "min_pages": 2,
                "max_pages": 6,
                "page_dwell_time": [25, 120],
                "reading_speed": "medium",
                "attention_span": "long"
            }
        }
        
        adjustment = personality_adjustments.get(self.user_personality, personality_adjustments["casual"])
        
        # Apply adjustments
        for key, value in adjustment.items():
            if key in self.browsing_config:
                self.browsing_config[key] = value
        
        self.logger.debug(f"🎭 Applied personality adjustments: {self.user_personality}")
    
    def _adjust_behavior_by_memory(self, session_memory: Dict):
        """Adjust behavior based on session memory"""
        if not session_memory:
            return
        
        # Adjust reading speed based on memory
        if session_memory.get("reading_speed"):
            self.browsing_config["reading_speed"] = session_memory["reading_speed"]
        
        # Adjust page count based on navigation style
        if session_memory.get("navigation_style"):
            if session_memory["navigation_style"] == "explorer":
                self.browsing_config["max_pages"] = min(self.browsing_config["max_pages"] + 1, 8)
            elif session_memory["navigation_style"] == "researcher":
                self.browsing_config["min_pages"] = max(self.browsing_config["min_pages"] - 1, 1)
        
        self.logger.debug(f"🧠 Applied memory-based adjustments")
    
    def _simulate_device_specific_behavior(self):
        """Simulate behavior specific to device type"""
        device_behaviors = {
            "mobile": {
                "scroll_pattern": "touch_scroll",
                "click_pattern": "touch_tap",
                "viewport_behavior": "mobile_viewport",
                "typing_speed": "slow",
                "hover_probability": 0.1  # Less hovering on mobile
            },
            "tablet": {
                "scroll_pattern": "touch_scroll",
                "click_pattern": "touch_tap",
                "viewport_behavior": "tablet_viewport", 
                "typing_speed": "medium",
                "hover_probability": 0.2
            },
            "desktop": {
                "scroll_pattern": "mouse_scroll",
                "click_pattern": "mouse_click",
                "viewport_behavior": "desktop_viewport",
                "typing_speed": "fast",
                "hover_probability": 0.4
            }
        }
        
        behavior = device_behaviors.get(self.device_type, device_behaviors["desktop"])
        
        # Apply device-specific adjustments
        if self.device_type == "mobile":
            # Reduce page count and dwell time for mobile
            self.browsing_config["max_pages"] = min(self.browsing_config["max_pages"], 4)
            self.browsing_config["page_dwell_time"] = [max(15, self.browsing_config["page_dwell_time"][0]), 
                                                      min(120, self.browsing_config["page_dwell_time"][1])]
        
        self.logger.debug(f"📱 Applied device-specific behavior: {self.device_type}")
        return behavior
    
    def _navigate_to_category(self) -> Optional[str]:
        """Navigate to a category page"""
        try:
            # Get category selectors from config
            navigation_selectors = self.browsing_config.get("navigation_selectors", {})
            category_selectors = navigation_selectors.get("category", [
                "a[href*='category']",
                "a[href*='cat']",
                "a[href*='tag']",
                "nav a",
                ".category a",
                ".categories a",
                "ul.menu a",
                ".navigation a"
            ])
            
            for selector in category_selectors:
                try:
                    category_links = self.driver.find_elements(By.CSS_SELECTOR, selector)
                    visible_links = [link for link in category_links if link.is_displayed()]
                    
                    if visible_links:
                        # Choose random category link
                        chosen_link = random.choice(visible_links)
                        href = chosen_link.get_attribute("href")
                        
                        if href and href != self.driver.current_url:
                            self.logger.debug(f"Navigating to category: {href}")
                            return href
                            
                except Exception as e:
                    self.logger.debug(f"Error with category selector {selector}: {e}")
            
            return None
            
        except Exception as e:
            self.logger.error(f"Error navigating to category: {e}")
            return None
    
    def _navigate_to_legal_page(self) -> Optional[str]:
        """Navigate to a legal/info page"""
        try:
            # Get legal page selectors from config
            navigation_selectors = self.browsing_config.get("navigation_selectors", {})
            legal_selectors = navigation_selectors.get("legal_pages", [
                "a[href*='about']",
                "a[href*='contact']",
                "a[href*='privacy']",
                "a[href*='terms']",
                "a[href*='disclaimer']",
                "a[href*='faq']",
                "a[href*='help']",
                "a[href*='support']"
            ])
            
                        # Look for legal page links
            for selector in legal_selectors:
                try:
                    legal_links = self.driver.find_elements(By.CSS_SELECTOR, selector)
                    visible_links = [link for link in legal_links if link.is_displayed()]
                    
                    if visible_links:
                        chosen_link = random.choice(visible_links)
                        href = chosen_link.get_attribute("href")
                        
                        if href and href != self.driver.current_url:
                            self.logger.debug(f"Navigating to legal page: {href}")
                            return href
                            
                except Exception as e:
                    self.logger.debug(f"Error with legal page selector {selector}: {e}")
            
            return None
            
        except Exception as e:
            self.logger.error(f"Error navigating to legal page: {e}")
            return None
    
    def _navigate_previous_next(self) -> Optional[str]:
        """Navigate using previous/next navigation"""
        try:
            # Get previous/next selectors from config
            navigation_selectors_config = self.browsing_config.get("navigation_selectors", {})
            navigation_selectors = navigation_selectors_config.get("previous_next", [
                "a[rel='prev']",
                "a[rel='next']",
                ".pagination a",
                ".nav-previous a",
                ".nav-next a",
                ".prev a",
                ".next a",
                "a[href*='page']",
                "a[href*='p=']"
            ])
            
            for selector in navigation_selectors:
                try:
                    nav_links = self.driver.find_elements(By.CSS_SELECTOR, selector)
                    visible_links = [link for link in nav_links if link.is_displayed()]
                    
                    if visible_links:
                        # Prefer next over previous (more natural)
                        next_links = [link for link in visible_links if "next" in link.text.lower() or ">" in link.text]
                        if next_links:
                            chosen_link = random.choice(next_links)
                        else:
                            chosen_link = random.choice(visible_links)
                        
                        href = chosen_link.get_attribute("href")
                        
                        if href and href != self.driver.current_url:
                            self.logger.debug(f"Navigating with prev/next: {href}")
                            return href
                            
                except Exception as e:
                    self.logger.debug(f"Error with navigation selector {selector}: {e}")
            
            return None
            
        except Exception as e:
            self.logger.error(f"Error navigating previous/next: {e}")
            return None
    
    def _navigate_random_page(self) -> Optional[str]:
        """Navigate to a random page on the site"""
        try:
            # Look for internal links
            internal_link_selectors = [
                "a[href^='/']",
                "a[href^='./']",
                "a[href^='../']",
                "a[href*='" + self.driver.current_url.split('/')[2] + "']"  # Same domain
            ]
            
            all_links = []
            for selector in internal_link_selectors:
                try:
                    links = self.driver.find_elements(By.CSS_SELECTOR, selector)
                    visible_links = [link for link in links if link.is_displayed()]
                    all_links.extend(visible_links)
                except Exception as e:
                    self.logger.debug(f"Error with internal link selector {selector}: {e}")
            
            if all_links:
                # Remove duplicates
                unique_links = list(set(all_links))
                chosen_link = random.choice(unique_links)
                href = chosen_link.get_attribute("href")
                
                if href and href != self.driver.current_url:
                    self.logger.debug(f"Navigating to random page: {href}")
                    return href
            
            return None
            
        except Exception as e:
            self.logger.error(f"Error navigating to random page: {e}")
            return None
    
    def _simulate_page_behavior(self, content_type: str = "general", content_quality: Dict = None):
        """Simulate realistic behavior on a single page with comprehensive configuration"""
        try:
            # Check if human behavior is enabled
            if not self.human_behavior_config.get("enabled", True):
                return
            
            # Get device-specific behavior
            device_behavior = self._simulate_device_specific_behavior()
            
            # Get behavior probabilities from config
            reading_config = self.browsing_config.get("reading_behavior", {})
            hovering_config = self.browsing_config.get("link_hovering", {})
            
            # Adjust probabilities based on content type and quality
            reading_probability = self._calculate_reading_probability(content_type, content_quality)
            hovering_probability = self._calculate_hovering_probability(content_type, device_behavior)
            typing_probability = self._calculate_typing_probability(content_type)
            
            # Random initial delay based on content quality and configuration
            initial_delay = self._calculate_initial_delay(content_quality)
            self._random_delay(initial_delay, initial_delay * 1.5)
            
            # Simulate mouse movement patterns with configuration
            if self.human_behavior_config.get("mouse_movement", True):
                try:
                    self._simulate_mouse_movement()
                except Exception as e:
                    self.logger.debug(f"Mouse movement failed: {e}")
            
            # Simulate natural scrolling based on content type and configuration
            if self.human_behavior_config.get("natural_scrolling", True):
                try:
                    self._simulate_natural_scrolling()
                except Exception as e:
                    self.logger.debug(f"Scrolling failed: {e}")
            
            # Sometimes simulate reading behavior
            if random.random() < reading_probability:
                try:
                    self._simulate_reading_behavior(content_type, content_quality)
                except Exception as e:
                    self.logger.debug(f"Reading behavior failed: {e}")
            
            # Sometimes simulate realistic typing (if forms exist) with configuration
            if random.random() < typing_probability and self.human_behavior_config.get("realistic_typing", True):
                try:
                    self._simulate_realistic_typing("Sample text for testing", None)
                except Exception as e:
                    self.logger.debug(f"Typing behavior failed: {e}")
            
            # Sometimes hover over links (but don't click) with configuration
            if random.random() < hovering_probability:
                try:
                    self._simulate_link_hovering(device_behavior)
                except Exception as e:
                    self.logger.debug(f"Link hovering failed: {e}")
            
            # Simulate content-specific behaviors
            try:
                self._simulate_content_specific_behavior(content_type, content_quality)
            except Exception as e:
                self.logger.debug(f"Content-specific behavior failed: {e}")
            
            # Simulate traffic generation behaviors
            if self.traffic_config.get("enabled", True):
                try:
                    self._simulate_tab_switching()
                    self._simulate_bookmark_creation()
                except Exception as e:
                    self.logger.debug(f"Traffic generation failed: {e}")
            
            # Simulate browser navigation patterns
            if self.realistic_config.get("browser_navigation_patterns", True):
                try:
                    self._simulate_browser_navigation_patterns()
                except Exception as e:
                    self.logger.debug(f"Browser navigation failed: {e}")
            
            # Update page visits in stealth metrics
            self.stealth_metrics["page_visits"] += 1
            self.stealth_metrics["last_activity"] = datetime.now()
            
        except Exception as e:
            self.logger.error(f"Error simulating page behavior: {e}")
    
    def _calculate_reading_probability(self, content_type: str, content_quality: Dict) -> float:
        """Calculate reading probability based on content type and quality"""
        base_probability = 0.7
        
        # Adjust based on content type
        content_adjustments = {
            "news": 0.8,
            "blog": 0.9,
            "technology": 0.8,
            "business": 0.7,
            "product": 0.3,  # Less reading for product pages
            "entertainment": 0.6,
            "general": 0.7
        }
        
        # Adjust based on content quality
        quality_adjustments = {
            "high": 1.2,
            "medium": 1.0,
            "low": 0.5
        }
        
        content_adj = content_adjustments.get(content_type, 0.7)
        quality_adj = quality_adjustments.get(content_quality.get("dwell_time", "medium"), 1.0)
        
        return min(base_probability * content_adj * quality_adj, 1.0)
    
    def _calculate_hovering_probability(self, content_type: str, device_behavior: Dict) -> float:
        """Calculate hovering probability based on content type and device"""
        base_probability = device_behavior.get("hover_probability", 0.4)
        
        # Adjust based on content type
        content_adjustments = {
            "product": 0.8,  # More hovering on product pages
            "news": 0.3,
            "blog": 0.5,
            "technology": 0.6,
            "business": 0.4,
            "entertainment": 0.5,
            "general": 0.4
        }
        
        content_adj = content_adjustments.get(content_type, 0.4)
        return min(base_probability * content_adj, 1.0)
    
    def _calculate_typing_probability(self, content_type: str) -> float:
        """Calculate typing probability based on content type"""
        base_probability = 0.3
        
        # Adjust based on content type
        content_adjustments = {
            "product": 0.6,  # More typing on product pages (search, forms)
            "news": 0.1,
            "blog": 0.2,
            "technology": 0.3,
            "business": 0.4,
            "entertainment": 0.1,
            "general": 0.3
        }
        
        return content_adjustments.get(content_type, 0.3)
    
    def _calculate_initial_delay(self, content_quality: Dict) -> float:
        """Calculate initial delay based on content quality"""
        base_delay = random.uniform(2, 5)
        
        if content_quality:
            quality = content_quality.get("dwell_time", "medium")
            if quality == "long":
                base_delay *= 1.5
            elif quality == "short":
                base_delay *= 0.7
        
        return base_delay
    
    def _simulate_content_specific_behavior(self, content_type: str, content_quality: Dict):
        """Simulate behavior specific to content type"""
        try:
            if content_type == "product":
                # Simulate product page behavior
                self._simulate_product_page_behavior()
            elif content_type == "news":
                # Simulate news reading behavior
                self._simulate_news_reading_behavior()
            elif content_type == "blog":
                # Simulate blog reading behavior
                self._simulate_blog_reading_behavior()
            elif content_type == "technology":
                # Simulate tech content behavior
                self._simulate_tech_content_behavior()
            else:
                # General content behavior - scroll and hover over various elements
                self._simulate_general_content_behavior()
            
        except Exception as e:
            self.logger.debug(f"Error in content-specific behavior: {e}")
    
    def _simulate_general_content_behavior(self):
        """Simulate general content interaction behavior"""
        try:
            # Find various interactive elements
            interactive_selectors = [
                "img", "button", ".btn", ".button", 
                "h1", "h2", "h3", ".title", ".heading",
                ".card", ".box", ".item", ".product"
            ]
            
            for selector in interactive_selectors:
                try:
                    elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                    visible_elements = [el for el in elements if el.is_displayed()]
                    
                    if visible_elements:
                        # Choose random element to interact with
                        element = random.choice(visible_elements[:3])  # Limit to first 3
                        
                        # Scroll to element
                        self.driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", element)
                        time.sleep(random.uniform(0.5, 1.5))
                        
                        # Hover over element
                        self.driver.execute_script("""
                            var element = arguments[0];
                            var event = new MouseEvent('mouseover', {
                                'view': window,
                                'bubbles': true,
                                'cancelable': true
                            });
                            element.dispatchEvent(event);
                        """, element)
                        
                        time.sleep(random.uniform(0.5, 1.0))
                        
                        # Trigger mouseout
                        self.driver.execute_script("""
                            var element = arguments[0];
                            var event = new MouseEvent('mouseout', {
                                'view': window,
                                'bubbles': true,
                                'cancelable': true
                            });
                            element.dispatchEvent(event);
                        """, element)
                        
                        break  # Only interact with one element type per page
                        
                except Exception as e:
                    self.logger.debug(f"Error with general content selector {selector}: {e}")
                    
        except Exception as e:
            self.logger.debug(f"Error in general content behavior: {e}")
    
    def _simulate_product_page_behavior(self):
        """Simulate behavior specific to product pages"""
        try:
            # Look for product images and hover over them
            product_images = self.driver.find_elements(By.CSS_SELECTOR, "img[src*='product'], .product-image img")
            if product_images:
                for img in product_images[:2]:  # Hover over first 2 images
                    if img.is_displayed():
                        actions = ActionChains(self.driver)
                        actions.move_to_element(img)
                        actions.pause(random.uniform(1, 3))
                        actions.perform()
                        time.sleep(random.uniform(0.5, 1.5))
            
            # Look for price elements and "read" them
            price_elements = self.driver.find_elements(By.CSS_SELECTOR, ".price, .cost, [class*='price']")
            if price_elements:
                for price in price_elements[:1]:
                    if price.is_displayed():
                        self.driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", price)
                        time.sleep(random.uniform(1, 2))
            
        except Exception as e:
            self.logger.debug(f"Error in product page behavior: {e}")
    
    def _simulate_news_reading_behavior(self):
        """Simulate behavior specific to news pages"""
        try:
            # Look for headlines and read them
            headlines = self.driver.find_elements(By.CSS_SELECTOR, "h1, h2, h3, .headline, .title")
            if headlines:
                for headline in headlines[:3]:  # Read first 3 headlines
                    if headline.is_displayed():
                        self.driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", headline)
                        time.sleep(random.uniform(0.5, 1.5))
            
            # Look for author and date information
            meta_elements = self.driver.find_elements(By.CSS_SELECTOR, ".author, .date, .published, .byline")
            if meta_elements:
                for meta in meta_elements[:1]:
                    if meta.is_displayed():
                        actions = ActionChains(self.driver)
                        actions.move_to_element(meta)
                        actions.pause(random.uniform(0.5, 1))
                        actions.perform()
            
        except Exception as e:
            self.logger.debug(f"Error in news reading behavior: {e}")
    
    def _simulate_blog_reading_behavior(self):
        """Simulate behavior specific to blog pages"""
        try:
            # Look for social sharing buttons and hover over them
            social_buttons = self.driver.find_elements(By.CSS_SELECTOR, ".share, .social, [class*='share'], [class*='social']")
            if social_buttons:
                for button in social_buttons[:2]:
                    if button.is_displayed():
                        actions = ActionChains(self.driver)
                        actions.move_to_element(button)
                        actions.pause(random.uniform(0.5, 1))
                        actions.perform()
                        time.sleep(random.uniform(0.3, 0.8))
            
            # Look for related articles
            related_articles = self.driver.find_elements(By.CSS_SELECTOR, ".related, .similar, [class*='related']")
            if related_articles:
                for article in related_articles[:1]:
                    if article.is_displayed():
                        self.driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", article)
                        time.sleep(random.uniform(1, 2))
            
        except Exception as e:
            self.logger.debug(f"Error in blog reading behavior: {e}")
    
    def _simulate_tech_content_behavior(self):
        """Simulate behavior specific to technology content"""
        try:
            # Look for code blocks and "read" them
            code_blocks = self.driver.find_elements(By.CSS_SELECTOR, "pre, code, .code-block, [class*='code']")
            if code_blocks:
                for code in code_blocks[:1]:
                    if code.is_displayed():
                        self.driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", code)
                        time.sleep(random.uniform(2, 4))  # Longer time for code
            
            # Look for technical specifications
            tech_specs = self.driver.find_elements(By.CSS_SELECTOR, ".specs, .specifications, .tech-specs")
            if tech_specs:
                for spec in tech_specs[:1]:
                    if spec.is_displayed():
                        actions = ActionChains(self.driver)
                        actions.move_to_element(spec)
                        actions.pause(random.uniform(1, 2))
                        actions.perform()
            
        except Exception as e:
            self.logger.debug(f"Error in tech content behavior: {e}")
    
    def _simulate_reading_behavior(self, content_type: str = "general", content_quality: Dict = None):
        """Simulate realistic reading behavior based on content type and quality"""
        try:
            # Get reading behavior config
            reading_config = self.browsing_config.get("reading_behavior", {})
            text_selectors = reading_config.get("text_selectors", [
                "p", "article", ".content", ".post-content", 
                ".entry-content", ".article-content", "main", ".text", ".body"
            ])
            
            # Find all text elements on the page
            all_text_elements = []
            for selector in text_selectors:
                try:
                    elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                    all_text_elements.extend([el for el in elements if el.is_displayed() and len(el.text.strip()) > 50])
                except Exception as e:
                    self.logger.debug(f"Error with selector {selector}: {e}")
            
            if not all_text_elements:
                self.logger.debug("No suitable text elements found for reading simulation")
                return
            
            # Choose elements to read based on personality and content type
            elements_to_read = self._select_elements_to_read(all_text_elements, content_type)
            
            if not elements_to_read:
                return
            
            # Simulate realistic reading for each selected element
            for element in elements_to_read:
                try:
                    self._simulate_realistic_reading_of_element(element, content_type, content_quality)
                except Exception as e:
                    self.logger.debug(f"Error reading element: {e}")
                    
        except Exception as e:
            self.logger.error(f"Error simulating reading behavior: {e}")
    
    def _select_elements_to_read(self, elements: List, content_type: str) -> List:
        """Select which elements to read based on personality and content type"""
        if not elements:
            return []
        
        # Personality-based selection
        personality_selection = {
            "explorer": {"max_elements": 2, "preference": "headlines"},  # Skim headlines
            "researcher": {"max_elements": 5, "preference": "detailed"},  # Read everything
            "casual": {"max_elements": 3, "preference": "mixed"},  # Mix of content
            "professional": {"max_elements": 4, "preference": "structured"}  # Structured reading
        }
        
        selection_config = personality_selection.get(self.user_personality, personality_selection["casual"])
        max_elements = selection_config["max_elements"]
        preference = selection_config["preference"]
        
        # Sort elements by importance (headlines first, then paragraphs)
        sorted_elements = self._sort_elements_by_importance(elements)
        
        # Select elements based on preference
        if preference == "headlines":
            # Prefer headline-like elements
            selected = [el for el in sorted_elements if self._is_headline_element(el)][:max_elements]
        elif preference == "detailed":
            # Prefer longer, detailed content
            selected = sorted(sorted_elements, key=lambda x: len(x.text), reverse=True)[:max_elements]
        elif preference == "structured":
            # Mix of headlines and content
            headlines = [el for el in sorted_elements if self._is_headline_element(el)][:max_elements//2]
            content = [el for el in sorted_elements if not self._is_headline_element(el)][:max_elements//2]
            selected = headlines + content
        else:  # mixed
            # Random selection
            selected = random.sample(sorted_elements, min(max_elements, len(sorted_elements)))
        
        return selected[:max_elements]
    
    def _sort_elements_by_importance(self, elements: List) -> List:
        """Sort elements by their importance for reading"""
        def importance_score(element):
            score = 0
            tag_name = element.tag_name.lower()
            
            # Headlines get higher priority
            if tag_name in ['h1', 'h2', 'h3']:
                score += 100
            elif tag_name in ['h4', 'h5', 'h6']:
                score += 50
            
            # Article content gets medium priority
            if tag_name in ['article', 'main']:
                score += 30
            
            # Paragraphs get base priority
            if tag_name == 'p':
                score += 10
            
            # Longer text gets higher priority
            text_length = len(element.text.strip())
            score += min(text_length / 100, 20)  # Cap at 20 points
            
            return score
        
        return sorted(elements, key=importance_score, reverse=True)
    
    def _is_headline_element(self, element) -> bool:
        """Check if element is a headline"""
        tag_name = element.tag_name.lower()
        return tag_name in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']
    
    def _simulate_realistic_reading_of_element(self, element, content_type: str, content_quality: Dict):
        """Simulate realistic reading of a single element"""
        try:
            # Scroll element into view
            self.driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", element)
            time.sleep(random.uniform(1, 2))
            
            # Get element text and calculate reading parameters
            text = element.text.strip()
            if not text:
                return
            
            # Calculate reading time based on text length and content type
            reading_time = self._calculate_realistic_reading_time(text, content_type, content_quality)
            
            # Simulate different reading patterns based on content type
            if self._is_headline_element(element):
                self._simulate_headline_reading(element, reading_time)
            else:
                self._simulate_content_reading(element, reading_time, text)
                
        except Exception as e:
            self.logger.debug(f"Error in realistic reading simulation: {e}")
    
    def _calculate_realistic_reading_time(self, text: str, content_type: str, content_quality: Dict) -> float:
        """Calculate realistic reading time based on multiple factors"""
        # Base reading speed (words per minute)
        base_wpm = 200
        
        # Personality adjustments
        personality_speeds = {
            "explorer": 1.3,  # Fast reader
            "researcher": 0.7,  # Slow, careful reader
            "casual": 1.0,  # Normal speed
            "professional": 1.1  # Slightly fast
        }
        
        # Content type adjustments
        content_speeds = {
            "news": 1.2,  # Fast reading for news
            "blog": 0.9,  # Normal reading for blogs
            "technology": 0.7,  # Slower for technical content
            "business": 0.8,  # Careful reading for business
            "product": 1.4,  # Fast scanning for products
            "entertainment": 1.1,  # Fast for entertainment
            "general": 1.0
        }
        
        # Quality adjustments
        quality_multipliers = {
            "high": 1.3,  # Read longer for high-quality content
            "medium": 1.0,  # Normal time
            "low": 0.7  # Read faster for low-quality content
        }
        
        # Calculate adjusted reading speed
        personality_adj = personality_speeds.get(self.user_personality, 1.0)
        content_adj = content_speeds.get(content_type, 1.0)
        quality_adj = quality_multipliers.get(content_quality.get("dwell_time", "medium"), 1.0)
        
        adjusted_wpm = base_wpm * personality_adj * content_adj * quality_adj
        
        # Calculate reading time
        word_count = len(text.split())
        reading_time = (word_count / adjusted_wpm) * 60  # Convert to seconds
        
        # Add some randomness and minimum time
        reading_time *= random.uniform(0.8, 1.4)
        reading_time = max(reading_time, 3.0)  # Minimum 3 seconds
        
        return reading_time
    
    def _simulate_headline_reading(self, element, reading_time: float):
        """Simulate reading a headline"""
        try:
            # Headlines are read more quickly with focused attention
            # Simulate eye movement across the headline
            text = element.text.strip()
            words = text.split()
            
            # Calculate time per word
            time_per_word = reading_time / len(words)
            
            # Simulate reading word by word
            for i, word in enumerate(words):
                # Move mouse to approximate word position
                word_position = i / len(words)
                self._move_mouse_to_text_position(element, word_position)
                
                # Pause for word reading (with some variation)
                pause_time = time_per_word * random.uniform(0.8, 1.2)
                time.sleep(pause_time)
                
                # Sometimes pause longer (like when processing information)
                if random.random() < 0.1:  # 10% chance
                    time.sleep(random.uniform(0.5, 1.5))
                    
        except Exception as e:
            self.logger.debug(f"Error in headline reading: {e}")
            time.sleep(reading_time)
    
    def _simulate_content_reading(self, element, reading_time: float, text: str):
        """Simulate reading content with realistic eye movement"""
        try:
            # Break reading into natural chunks
            paragraphs = text.split('\n\n') if '\n\n' in text else [text]
            
            for paragraph in paragraphs:
                if not paragraph.strip():
                    continue
                
                # Calculate time for this paragraph
                para_ratio = len(paragraph) / len(text)
                para_time = reading_time * para_ratio
                
                # Simulate reading paragraph with eye movement
                self._simulate_paragraph_reading(element, paragraph, para_time)
                
                # Pause between paragraphs (natural reading behavior)
                if len(paragraphs) > 1:
                    time.sleep(random.uniform(0.5, 1.5))
                    
        except Exception as e:
            self.logger.debug(f"Error in content reading: {e}")
            time.sleep(reading_time)
    
    def _simulate_paragraph_reading(self, element, paragraph: str, reading_time: float):
        """Simulate reading a paragraph with realistic eye movement"""
        try:
            # Break paragraph into lines for more realistic reading
            lines = paragraph.split('\n') if '\n' in paragraph else [paragraph]
            
            time_per_line = reading_time / len(lines)
            
            for line in lines:
                if not line.strip():
                    continue
                
                # Simulate reading line with left-to-right eye movement
                self._simulate_line_reading(element, line, time_per_line)
                
                # Small pause between lines
                time.sleep(random.uniform(0.1, 0.3))
                
        except Exception as e:
            self.logger.debug(f"Error in paragraph reading: {e}")
            time.sleep(reading_time)
    
    def _simulate_line_reading(self, element, line: str, reading_time: float):
        """Simulate reading a line with left-to-right eye movement"""
        try:
            # Calculate reading positions (left to right)
            num_positions = min(10, len(line))  # Max 10 positions per line
            time_per_position = reading_time / num_positions
            
            for i in range(num_positions):
                # Calculate position ratio (0 = start of line, 1 = end of line)
                position_ratio = i / (num_positions - 1) if num_positions > 1 else 0.5
                
                # Move mouse to approximate reading position
                self._move_mouse_to_text_position(element, position_ratio)
                
                # Pause for reading this position
                pause_time = time_per_position * random.uniform(0.8, 1.2)
                time.sleep(pause_time)
                
                # Sometimes pause longer (like when processing complex words)
                if random.random() < 0.05:  # 5% chance
                    time.sleep(random.uniform(0.3, 0.8))
                    
        except Exception as e:
            self.logger.debug(f"Error in line reading: {e}")
            time.sleep(reading_time)
    
    def _move_mouse_to_text_position(self, element, position_ratio: float):
        """Move mouse to a specific position within text element"""
        try:
            # Get element bounds
            rect = element.rect
            
            # Calculate position within the element
            x = rect['x'] + (rect['width'] * position_ratio)
            y = rect['y'] + (rect['height'] * 0.5)  # Middle of element height
            
            # Add some randomness to make it more natural
            x += random.uniform(-10, 10)
            y += random.uniform(-5, 5)
            
            # Move mouse using JavaScript
            self.driver.execute_script(f"""
                var event = new MouseEvent('mousemove', {{
                    'view': window,
                    'bubbles': true,
                    'cancelable': true,
                    'clientX': {x},
                    'clientY': {y}
                }});
                document.dispatchEvent(event);
            """)
            
        except Exception as e:
            self.logger.debug(f"Error moving mouse to text position: {e}")
    
    def _simulate_natural_scrolling(self, content_type: str = "general"):
        """Simulate natural scrolling behavior based on content type with real-time ad detection"""
        try:
            # Check if driver is still active
            if not self.driver:
                self.logger.warning("Driver not available, skipping scrolling")
                return
            
            # Get page height
            page_height = self.driver.execute_script("return document.body.scrollHeight;")
            viewport_height = self.driver.execute_script("return window.innerHeight;")
            
            self.logger.info(f"📏 Page height: {page_height}, Viewport: {viewport_height}")
            
            if page_height > viewport_height:
                # Adjust scroll behavior based on content type and personality
                scroll_config = self._get_scroll_config(content_type)
                
                # Calculate scroll parameters
                scroll_step = self._calculate_scroll_step(scroll_config)
                total_scroll_distance = page_height - viewport_height
                
                self.logger.info(f"🔄 Starting scroll with REAL-TIME AD DETECTION: {total_scroll_distance}px")
                
                # 🔥 REAL-TIME AD DETECTION SCROLLING
                self._simulate_scrolling_with_realtime_ad_detection(total_scroll_distance, scroll_step, scroll_config)
            else:
                self.logger.info("📄 Page is short, no scrolling needed")
                
        except Exception as e:
            self.logger.error(f"Error simulating natural scrolling: {e}")
            # Fallback to simple scrolling
            self._fallback_scrolling()
    
    def _fallback_scrolling(self):
        """Simple fallback scrolling when advanced scrolling fails"""
        try:
            self.logger.info("🔄 Using fallback scrolling method")
            
            # Simple scroll down and up
            self.driver.execute_script("window.scrollTo(0, 500);")
            time.sleep(2)
            
            self.driver.execute_script("window.scrollTo(0, 1000);")
            time.sleep(2)
            
            self.driver.execute_script("window.scrollTo(0, 0);")
            time.sleep(1)
            
            self.logger.info("✅ Fallback scrolling completed")
            
        except Exception as e:
            self.logger.error(f"Error in fallback scrolling: {e}")
    
    def _get_scroll_config(self, content_type: str) -> Dict:
        """Get scroll configuration based on content type and personality"""
        # Base scroll adjustments
        scroll_adjustments = {
            "news": {"speed": "fast", "thoroughness": "medium", "pattern": "linear"},
            "blog": {"speed": "medium", "thoroughness": "high", "pattern": "exploratory"},
            "technology": {"speed": "slow", "thoroughness": "high", "pattern": "careful"},
            "business": {"speed": "medium", "thoroughness": "medium", "pattern": "efficient"},
            "product": {"speed": "fast", "thoroughness": "low", "pattern": "scanning"},
            "entertainment": {"speed": "fast", "thoroughness": "low", "pattern": "casual"},
            "general": {"speed": "medium", "thoroughness": "medium", "pattern": "balanced"}
        }
        
        base_config = scroll_adjustments.get(content_type, scroll_adjustments["general"])
        
        # Personality adjustments
        personality_adjustments = {
            "explorer": {"speed_mult": 1.2, "thoroughness_mult": 0.8, "pattern": "exploratory"},
            "researcher": {"speed_mult": 0.7, "thoroughness_mult": 1.3, "pattern": "careful"},
            "casual": {"speed_mult": 1.0, "thoroughness_mult": 0.9, "pattern": "casual"},
            "professional": {"speed_mult": 1.1, "thoroughness_mult": 1.1, "pattern": "efficient"}
        }
        
        personality_config = personality_adjustments.get(self.user_personality, personality_adjustments["casual"])
        
        # Combine configurations
        return {
            "speed": base_config["speed"],
            "thoroughness": base_config["thoroughness"],
            "pattern": personality_config["pattern"],
            "speed_multiplier": personality_config["speed_mult"],
            "thoroughness_multiplier": personality_config["thoroughness_mult"]
        }
    
    def _calculate_scroll_step(self, scroll_config: Dict) -> int:
        """Calculate scroll step based on configuration"""
        # Base scroll step
        base_step = random.randint(150, 400)
        
        # Speed adjustments
        speed_adjustments = {"fast": 0.6, "medium": 1.0, "slow": 1.5}
        speed_adj = speed_adjustments.get(scroll_config["speed"], 1.0)
        
        # Apply personality multiplier
        speed_adj *= scroll_config["speed_multiplier"]
        
        return int(base_step * speed_adj)
    
    def _simulate_realistic_scroll_pattern(self, total_distance: int, scroll_step: int, config: Dict):
        """Simulate realistic scrolling pattern"""
        current_position = 0
        scroll_pattern = config["pattern"]
        
        # Calculate number of scroll actions
        num_scrolls = max(3, int(total_distance / scroll_step))
        
        # Adjust based on thoroughness
        thoroughness_adj = config["thoroughness_multiplier"]
        if config["thoroughness"] == "high":
            num_scrolls = int(num_scrolls * 1.5)
        elif config["thoroughness"] == "low":
            num_scrolls = int(num_scrolls * 0.7)
        
        self.logger.info(f"🔄 Will perform {num_scrolls} scroll actions with {scroll_pattern} pattern")
        
        for i in range(num_scrolls):
            # Calculate scroll amount based on pattern
            scroll_amount = self._calculate_pattern_scroll_amount(
                i, num_scrolls, scroll_step, scroll_pattern, current_position, total_distance
            )
            
            # Apply scroll
            current_position += scroll_amount
            current_position = min(current_position, total_distance)
            
            self.logger.info(f"📜 Scroll {i+1}/{num_scrolls}: {scroll_amount}px → Position: {current_position}px")
            
            # Smooth scroll to position
            self.driver.execute_script(f"window.scrollTo({{top: {current_position}, behavior: 'smooth'}});")
            
            # Pause based on pattern and content
            pause_time = self._calculate_scroll_pause(i, num_scrolls, scroll_pattern, config)
            time.sleep(pause_time)
            
            # Sometimes pause longer to "read" content
            if random.random() < 0.3:  # 30% chance
                reading_pause = random.uniform(2, 5) * thoroughness_adj
                self.logger.info(f"📖 Reading pause: {reading_pause:.1f}s")
                time.sleep(reading_pause)
            
            # Sometimes scroll back (human behavior)
            if random.random() < 0.15:  # 15% chance
                back_amount = random.randint(50, 200)
                current_position = max(0, current_position - back_amount)
                self.logger.info(f"⬅️ Scroll back: {back_amount}px → Position: {current_position}px")
                self.driver.execute_script(f"window.scrollTo({{top: {current_position}, behavior: 'smooth'}});")
                time.sleep(random.uniform(1, 2))
        
        # Final scroll to top
        self.logger.info("⬆️ Final scroll to top")
        self.driver.execute_script("window.scrollTo({top: 0, behavior: 'smooth'});")
        time.sleep(1)
    
    def _calculate_pattern_scroll_amount(self, step: int, total_steps: int, base_step: int, 
                                       pattern: str, current_pos: int, total_distance: int) -> int:
        """Calculate scroll amount based on pattern"""
        if pattern == "linear":
            # Consistent scrolling
            return base_step + random.randint(-50, 50)
        
        elif pattern == "exploratory":
            # Variable scrolling with pauses
            if step % 3 == 0:  # Every 3rd step, scroll more
                return base_step * 1.5 + random.randint(-30, 30)
            else:
                return base_step * 0.7 + random.randint(-40, 40)
        
        elif pattern == "careful":
            # Slow, deliberate scrolling
            return base_step * 0.8 + random.randint(-20, 20)
        
        elif pattern == "efficient":
            # Fast, purposeful scrolling
            return base_step * 1.2 + random.randint(-30, 30)
        
        elif pattern == "scanning":
            # Quick scanning with occasional stops
            if step % 4 == 0:  # Every 4th step, scroll less
                return base_step * 0.5 + random.randint(-20, 20)
            else:
                return base_step * 1.3 + random.randint(-40, 40)
        
        elif pattern == "casual":
            # Relaxed, variable scrolling
            return base_step + random.randint(-80, 80)
        
        else:  # balanced
            return base_step + random.randint(-60, 60)
    
    def _calculate_scroll_pause(self, step: int, total_steps: int, pattern: str, config: Dict) -> float:
        """Calculate pause time between scrolls"""
        base_pause = random.uniform(1, 3)
        
        # Pattern adjustments
        pattern_adjustments = {
            "linear": 1.0,
            "exploratory": 1.3,
            "careful": 1.5,
            "efficient": 0.8,
            "scanning": 0.6,
            "casual": 1.2,
            "balanced": 1.0
        }
        
        pattern_adj = pattern_adjustments.get(pattern, 1.0)
        
        # Apply thoroughness multiplier
        thoroughness_adj = config["thoroughness_multiplier"]
        
        return base_pause * pattern_adj * thoroughness_adj
    
    def _simulate_scrolling_with_realtime_ad_detection(self, total_distance: int, scroll_step: int, config: Dict):
        """Simulate scrolling with real-time AdSense detection"""
        try:
            self.logger.info("🔥 Starting REAL-TIME AD DETECTION scrolling...")
            
            # Initialize ad tracking
            detected_ads = set()  # Track unique ads
            ad_interactions = []
            current_position = 0
            scroll_pattern = config["pattern"]
            
            # Setup real-time ad detection observer
            self._setup_realtime_ad_observer()
            
            # Calculate number of scroll actions
            num_scrolls = max(3, int(total_distance / scroll_step))
            thoroughness_adj = config["thoroughness_multiplier"]
            
            if config["thoroughness"] == "high":
                num_scrolls = int(num_scrolls * 1.5)
            elif config["thoroughness"] == "low":
                num_scrolls = int(num_scrolls * 0.7)
            
            self.logger.info(f"🔄 Will perform {num_scrolls} scroll actions with REAL-TIME ad detection")
            
            for i in range(num_scrolls):
                # Calculate scroll amount based on pattern
                scroll_amount = self._calculate_pattern_scroll_amount(
                    i, num_scrolls, scroll_step, scroll_pattern, current_position, total_distance
                )
                
                # Apply scroll
                current_position += scroll_amount
                current_position = min(current_position, total_distance)
                
                self.logger.info(f"📜 Scroll {i+1}/{num_scrolls}: {scroll_amount}px → Position: {current_position}px")
                
                # Smooth scroll to position
                self.driver.execute_script(f"window.scrollTo({{top: {current_position}, behavior: 'smooth'}});")
                
                # 🔥 REAL-TIME AD DETECTION DURING SCROLL
                time.sleep(1)  # Wait for scroll to complete
                new_ads = self._detect_new_ads_in_viewport(detected_ads)
                
                if new_ads:
                    self.logger.info(f"🎯 REAL-TIME: Found {len(new_ads)} new ads at scroll position {current_position}px")
                    
                    for ad_info in new_ads:
                        detected_ads.add(ad_info['unique_id'])
                        
                        # Simulate immediate ad interaction if configured
                        interaction_result = self._handle_realtime_ad_interaction(ad_info)
                        if interaction_result:
                            ad_interactions.append({
                                "scroll_position": current_position,
                                "ad_info": ad_info,
                                "interaction": interaction_result,
                                "timestamp": datetime.now().isoformat()
                            })
                
                # Normal scroll pause
                pause_time = self._calculate_scroll_pause(i, num_scrolls, scroll_pattern, config)
                time.sleep(pause_time)
                
                # Sometimes pause longer to "read" content and check for more ads
                if random.random() < 0.3:  # 30% chance
                    reading_pause = random.uniform(2, 5) * thoroughness_adj
                    self.logger.info(f"📖 Reading pause with ad scan: {reading_pause:.1f}s")
                    
                    # Additional ad check during reading pause
                    additional_ads = self._detect_new_ads_in_viewport(detected_ads)
                    if additional_ads:
                        self.logger.info(f"🎯 READING PAUSE: Found {len(additional_ads)} additional ads")
                        for ad_info in additional_ads:
                            detected_ads.add(ad_info['unique_id'])
                    
                    time.sleep(reading_pause)
                
                # Sometimes scroll back (human behavior) and check for ads
                if random.random() < 0.15:  # 15% chance
                    back_amount = random.randint(50, 200)
                    current_position = max(0, current_position - back_amount)
                    self.logger.info(f"⬅️ Scroll back: {back_amount}px → Position: {current_position}px")
                    self.driver.execute_script(f"window.scrollTo({{top: {current_position}, behavior: 'smooth'}});")
                    
                    # Check for ads after scroll back
                    time.sleep(1)
                    back_ads = self._detect_new_ads_in_viewport(detected_ads)
                    if back_ads:
                        self.logger.info(f"🎯 SCROLL BACK: Found {len(back_ads)} ads")
                    
                    time.sleep(random.uniform(1, 2))
            
            # Final scroll to top with ad detection
            self.logger.info("⬆️ Final scroll to top with ad detection")
            self.driver.execute_script("window.scrollTo({top: 0, behavior: 'smooth'});")
            time.sleep(2)
            
            # Final ad detection at top
            final_ads = self._detect_new_ads_in_viewport(detected_ads)
            if final_ads:
                self.logger.info(f"🎯 FINAL CHECK: Found {len(final_ads)} ads at top")
            
            # Summary
            total_ads_found = len(detected_ads)
            total_interactions = len(ad_interactions)
            
            self.logger.info(f"✅ REAL-TIME AD DETECTION SUMMARY:")
            self.logger.info(f"   📊 Total ads detected: {total_ads_found}")
            self.logger.info(f"   🎯 Total interactions: {total_interactions}")
            self.logger.info(f"   📜 Scroll positions: {num_scrolls}")
            
            return {
                "total_ads_detected": total_ads_found,
                "total_interactions": total_interactions,
                "ad_interactions": ad_interactions,
                "scroll_positions": num_scrolls
            }
            
        except Exception as e:
            self.logger.error(f"Error in real-time ad detection scrolling: {e}")
            # Fallback to normal scrolling
            self._simulate_realistic_scroll_pattern(total_distance, scroll_step, config)
    
    def _setup_realtime_ad_observer(self):
        """Setup JavaScript Intersection Observer for real-time ad detection"""
        try:
            observer_script = """
            // Real-time AdSense detection observer
            if (!window.adDetectionObserver) {
                window.detectedAds = new Set();
                window.newAdsFound = [];
                
                // Create intersection observer
                window.adDetectionObserver = new IntersectionObserver(function(entries) {
                    entries.forEach(function(entry) {
                        if (entry.isIntersecting) {
                            var element = entry.target;
                            var adId = element.id || element.className || 'unknown-ad';
                            
                            if (!window.detectedAds.has(adId)) {
                                window.detectedAds.add(adId);
                                window.newAdsFound.push({
                                    element: element,
                                    id: adId,
                                    rect: entry.boundingClientRect,
                                    timestamp: Date.now()
                                });
                            }
                        }
                    });
                }, {
                    threshold: 0.1,  // Trigger when 10% visible
                    rootMargin: '50px'  // Detect ads 50px before they enter viewport
                });
                
                // Observe all potential ad elements
                var adSelectors = [
                    'ins.adsbygoogle',
                    'div[class*="adsbygoogle"]',
                    'div[id*="google_ads"]',
                    'div[id*="div-gpt-ad"]',
                    'div[data-google-ad-client]',
                    'div[data-ad-slot]',
                    'div[class*="ad-"]',
                    'div[id*="ad-"]',
                    'iframe[src*="googleads"]',
                    'iframe[src*="doubleclick"]'
                ];
                
                adSelectors.forEach(function(selector) {
                    var elements = document.querySelectorAll(selector);
                    elements.forEach(function(element) {
                        window.adDetectionObserver.observe(element);
                    });
                });
            }
            
            return window.detectedAds.size;
            """
            
            result = self.driver.execute_script(observer_script)
            self.logger.info(f"🔍 Real-time ad observer setup complete. Initial ads: {result}")
            
        except Exception as e:
            self.logger.error(f"Error setting up real-time ad observer: {e}")
    
    def _detect_new_ads_in_viewport(self, known_ads: set) -> list:
        """Detect new ads that have appeared in viewport"""
        try:
            # Get new ads from JavaScript observer
            new_ads_script = """
            var newAds = window.newAdsFound || [];
            window.newAdsFound = [];  // Clear the array
            return newAds.map(function(ad) {
                return {
                    unique_id: ad.id,
                    element_tag: ad.element.tagName,
                    element_class: ad.element.className,
                    element_id: ad.element.id,
                    rect: {
                        x: ad.rect.x,
                        y: ad.rect.y,
                        width: ad.rect.width,
                        height: ad.rect.height
                    },
                    timestamp: ad.timestamp
                };
            });
            """
            
            new_ads_data = self.driver.execute_script(new_ads_script)
            
            # Filter out ads we already know about
            truly_new_ads = []
            for ad_data in new_ads_data:
                if ad_data['unique_id'] not in known_ads:
                    truly_new_ads.append(ad_data)
            
            return truly_new_ads
            
        except Exception as e:
            self.logger.error(f"Error detecting new ads in viewport: {e}")
            return []
    
    def _handle_realtime_ad_interaction(self, ad_info: dict) -> dict:
        """Handle interaction with newly detected ad"""
        try:
            # Get smart ad interaction settings
            ad_context = self._smart_ad_interaction()
            interaction_probability = ad_context["interaction_probability"]
            
            # Lower probability for real-time detection to avoid too many interactions
            realtime_probability = interaction_probability * 0.3  # 30% of normal probability
            
            interaction_result = {
                "ad_detected": True,
                "ad_size": f"{ad_info['rect']['width']}x{ad_info['rect']['height']}",
                "interaction_attempted": False,
                "interaction_successful": False
            }
            
            # Decide whether to interact
            if random.random() < realtime_probability:
                self.logger.info(f"🎯 REAL-TIME INTERACTION: Attempting interaction with ad {ad_info['unique_id']}")
                
                try:
                    # Find the actual element for interaction
                    ad_element = None
                    if ad_info['element_id']:
                        ad_element = self.driver.find_element(By.ID, ad_info['element_id'])
                    elif ad_info['element_class']:
                        ad_element = self.driver.find_element(By.CLASS_NAME, ad_info['element_class'].split()[0])
                    
                    if ad_element and ad_element.is_displayed():
                        # Scroll to ad
                        self.driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", ad_element)
                        time.sleep(1)
                        
                        # Simulate hover
                        actions = ActionChains(self.driver)
                        actions.move_to_element(ad_element)
                        actions.pause(random.uniform(0.5, 1.5))
                        actions.perform()
                        
                        interaction_result["interaction_attempted"] = True
                        
                        # Very low probability click for safety
                        if random.random() < 0.001:  # 0.1% chance
                            ad_element.click()
                            interaction_result["interaction_successful"] = True
                            
                            # 🔥 POST-AD CLICK BEHAVIOR
                            self._handle_post_ad_click_behavior(ad_element, ad_context["relevance"])
                            
                            self.logger.warning(f"🎯 REAL-TIME AD CLICKED: {ad_info['unique_id']}")
                        
                        time.sleep(random.uniform(0.5, 1.0))
                    
                except Exception as e:
                    self.logger.debug(f"Error interacting with real-time ad: {e}")
            
            return interaction_result
            
        except Exception as e:
            self.logger.error(f"Error handling real-time ad interaction: {e}")
            return {"error": str(e)}
    
    def _perform_scrolling_with_realtime_detection(self) -> dict:
        """Perform scrolling with real-time ad detection"""
        try:
            # Get page dimensions
            page_height = self.driver.execute_script("return document.body.scrollHeight;")
            viewport_height = self.driver.execute_script("return window.innerHeight;")
            
            if page_height <= viewport_height:
                self.logger.info("📄 Page is short, no scrolling needed")
                return {"total_ads_detected": 0, "scroll_positions": 0}
            
            # Perform systematic scrolling with ad detection
            total_distance = page_height - viewport_height
            scroll_step = min(300, total_distance // 10)  # 10 scroll steps max
            num_scrolls = max(3, min(10, total_distance // scroll_step))
            
            self.logger.info(f"🔄 Performing {num_scrolls} scroll steps with real-time ad detection")
            
            detected_ads = set()
            current_position = 0
            
            for i in range(num_scrolls):
                # Calculate scroll position
                scroll_amount = min(scroll_step, total_distance - current_position)
                current_position += scroll_amount
                
                # Smooth scroll
                self.driver.execute_script(f"window.scrollTo({{top: {current_position}, behavior: 'smooth'}});")
                time.sleep(1.5)  # Wait for scroll and ads to load
                
                # Check for new ads
                new_ads = self._detect_new_ads_in_viewport(detected_ads)
                if new_ads:
                    self.logger.info(f"🎯 Scroll {i+1}: Found {len(new_ads)} new ads at position {current_position}px")
                    for ad_info in new_ads:
                        detected_ads.add(ad_info['unique_id'])
                
                # Sometimes pause longer to trigger lazy loading
                if i % 3 == 0:  # Every 3rd scroll
                    time.sleep(2)
                    # Additional ad check
                    additional_ads = self._detect_new_ads_in_viewport(detected_ads)
                    if additional_ads:
                        self.logger.info(f"🎯 Lazy load check: Found {len(additional_ads)} additional ads")
                        for ad_info in additional_ads:
                            detected_ads.add(ad_info['unique_id'])
            
            # Final scroll to top
            self.driver.execute_script("window.scrollTo({top: 0, behavior: 'smooth'});")
            time.sleep(2)
            
            return {
                "total_ads_detected": len(detected_ads),
                "scroll_positions": num_scrolls,
                "detected_ads": list(detected_ads)
            }
            
        except Exception as e:
            self.logger.error(f"Error in scrolling with real-time detection: {e}")
            return {"total_ads_detected": 0, "scroll_positions": 0, "error": str(e)}
    
    def _get_all_detected_ads_from_observer(self) -> list:
        """Get all ads detected by the real-time observer"""
        try:
            script = """
            if (window.detectedAds) {
                return Array.from(window.detectedAds).map(function(adId) {
                    var element = document.getElementById(adId) || 
                                 document.querySelector('[class*="' + adId + '"]') ||
                                 document.querySelector('[id*="' + adId + '"]');
                    
                    if (element) {
                        var rect = element.getBoundingClientRect();
                        return {
                            unique_id: adId,
                            element_tag: element.tagName,
                            element_class: element.className,
                            element_id: element.id,
                            rect: {
                                x: rect.x,
                                y: rect.y,
                                width: rect.width,
                                height: rect.height
                            },
                            timestamp: Date.now()
                        };
                    }
                    return null;
                }).filter(function(ad) { return ad !== null; });
            }
            return [];
            """
            
            ads_data = self.driver.execute_script(script)
            self.logger.info(f"🔍 Observer detected {len(ads_data)} ads total")
            return ads_data
            
        except Exception as e:
            self.logger.error(f"Error getting ads from observer: {e}")
            return []
    
    def _convert_realtime_ads_to_dict(self, realtime_ads: list) -> dict:
        """Convert real-time ads data to standard format"""
        try:
            ad_positions = []
            ad_details = []
            
            for ad_info in realtime_ads:
                position = {
                    "x": ad_info['rect']['x'],
                    "y": ad_info['rect']['y'],
                    "width": ad_info['rect']['width'],
                    "height": ad_info['rect']['height']
                }
                ad_positions.append(position)
                
                detail = {
                    "selector": "realtime-detected",
                    "location": {"x": ad_info['rect']['x'], "y": ad_info['rect']['y']},
                    "size": {"width": ad_info['rect']['width'], "height": ad_info['rect']['height']},
                    "visible": True,
                    "element_tag": ad_info['element_tag'],
                    "element_class": ad_info['element_class'],
                    "element_id": ad_info['element_id'],
                    "realtime_detected": True
                }
                ad_details.append(detail)
            
            return {
                "count": len(realtime_ads),
                "positions": ad_positions,
                "details": ad_details
            }
            
        except Exception as e:
            self.logger.error(f"Error converting real-time ads: {e}")
            return {"count": 0, "positions": [], "details": []}
    
    def _simulate_realistic_typing(self, device_behavior: Dict = None):
        """Simulate realistic typing behavior based on device type"""
        try:
            # Find input fields (if any)
            input_fields = self.driver.find_elements(By.TAG_NAME, "input")
            textareas = self.driver.find_elements(By.TAG_NAME, "textarea")
            
            all_fields = input_fields + textareas
            
            # Adjust typing behavior based on device
            if device_behavior:
                typing_speed = device_behavior.get("typing_speed", "fast")
                typing_speed_adjustments = {"fast": 0.05, "medium": 0.1, "slow": 0.15}
                base_delay = typing_speed_adjustments.get(typing_speed, 0.1)
            else:
                base_delay = 0.1
            
            for field in all_fields[:2]:  # Limit to first 2 fields
                if field.is_displayed() and field.is_enabled():
                    # Click on field
                    self.driver.execute_script("arguments[0].click();", field)
                    time.sleep(random.uniform(0.5, 1))
                    
                    # Type with realistic delays
                    sample_text = "This is a sample text for testing purposes."
                    
                    for char in sample_text:
                        field.send_keys(char)
                        # Random delay between keystrokes
                        time.sleep(random.uniform(base_delay * 0.5, base_delay * 1.5))
                    
                    time.sleep(random.uniform(1, 2))
                    
        except Exception as e:
            self.logger.error(f"Error simulating realistic typing: {e}")
    
    def _simulate_link_hovering(self, device_behavior: Dict = None):
        """Simulate hovering over links without clicking"""
        try:
            # Get device-specific hovering behavior
            if device_behavior:
                max_hovers = device_behavior.get("hover_probability", 0.4) * 5  # Convert to count
            else:
                max_hovers = 3
            
            # Find links
            links = self.driver.find_elements(By.TAG_NAME, "a")
            visible_links = [link for link in links if link.is_displayed()]
            
            if visible_links:
                # Hover over random links
                num_hovers = random.randint(1, min(int(max_hovers), len(visible_links)))
                chosen_links = random.sample(visible_links, num_hovers)
                
                for link in chosen_links:
                    try:
                        # Use JavaScript for more reliable hovering
                        self.driver.execute_script("""
                            var element = arguments[0];
                            var event = new MouseEvent('mouseover', {
                                'view': window,
                                'bubbles': true,
                                'cancelable': true
                            });
                            element.dispatchEvent(event);
                        """, link)
                        
                        # Pause for hover effect
                        time.sleep(random.uniform(0.5, 2.0))
                        
                        # Trigger mouseout event
                        self.driver.execute_script("""
                            var element = arguments[0];
                            var event = new MouseEvent('mouseout', {
                                'view': window,
                                'bubbles': true,
                                'cancelable': true
                            });
                            element.dispatchEvent(event);
                        """, link)
                        
                        time.sleep(random.uniform(0.5, 1.5))
                        
                    except Exception as e:
                        self.logger.debug(f"Error hovering over link: {e}")
                        
        except Exception as e:
            self.logger.error(f"Error simulating link hovering: {e}")
    
    def _simulate_link_hovering(self):
        """Simulate hovering over links without clicking"""
        try:
            # Get link hovering config
            hovering_config = self.browsing_config.get("link_hovering", {})
            max_hovers = hovering_config.get("max_hovers_per_page", 3)
            hover_duration = hovering_config.get("hover_duration", [0.5, 2.0])
            hover_probability = hovering_config.get("hover_probability", 0.4)
            
            # Check if hovering should be performed
            if random.random() > hover_probability:
                return
            
            # Find links
            links = self.driver.find_elements(By.TAG_NAME, "a")
            visible_links = [link for link in links if link.is_displayed()]
            
            if visible_links:
                # Hover over random links
                num_hovers = random.randint(1, min(max_hovers, len(visible_links)))
                chosen_links = random.sample(visible_links, num_hovers)
                
                for link in chosen_links:
                    try:
                        actions = ActionChains(self.driver)
                        actions.move_to_element(link)
                        actions.pause(random.uniform(*hover_duration))
                        actions.perform()
                        time.sleep(random.uniform(0.5, 1.5))
                    except Exception as e:
                        self.logger.debug(f"Error hovering over link: {e}")
                        
        except Exception as e:
            self.logger.error(f"Error simulating link hovering: {e}")
    
    def simulate_human_behavior(self, profile_fingerprint: Dict):
        """Simulate human-like behavior based on fingerprint"""
        try:
            # Random initial delay
            time.sleep(random.uniform(2, 5))
            
            # Simulate mouse movement patterns
            self._simulate_mouse_movement()
            
            # Simulate natural scrolling
            self._simulate_natural_scrolling()
            
            # Simulate realistic typing (if needed)
            self._simulate_realistic_typing()
            
            self.logger.info("Applied human-like behavior simulation")
            
        except Exception as e:
            self.logger.error(f"Error simulating human behavior: {e}")
    
    def _simulate_mouse_movement(self):
        """Simulate realistic mouse movements using configuration"""
        if not self.human_behavior_config.get("mouse_movement", True):
            return
            
        try:
            # Get viewport size
            viewport_width = self.driver.execute_script("return window.innerWidth;")
            viewport_height = self.driver.execute_script("return window.innerHeight;")
            
            # Generate random mouse movements based on personality
            if self.user_personality == "explorer":
                num_movements = random.randint(5, 12)  # More movements
            elif self.user_personality == "researcher":
                num_movements = random.randint(3, 6)   # Fewer, precise movements
            elif self.user_personality == "casual":
                num_movements = random.randint(2, 5)   # Minimal movements
            else:  # professional
                num_movements = random.randint(3, 8)   # Balanced movements
            
            for i in range(num_movements):
                # Random coordinates within viewport (with safer bounds)
                x = random.randint(50, max(100, viewport_width - 50))
                y = random.randint(50, max(100, viewport_height - 50))
                
                # Use mouse acceleration if enabled
                if self.realistic_config.get("mouse_acceleration", True) and i > 0:
                    # Get previous position (simplified)
                    prev_x = random.randint(50, max(100, viewport_width - 50))
                    prev_y = random.randint(50, max(100, viewport_height - 50))
                    self._simulate_mouse_acceleration(prev_x, prev_y, x, y)
                else:
                    # Move to random position using JavaScript (more reliable)
                    self.driver.execute_script(f"""
                        var event = new MouseEvent('mousemove', {{
                            'view': window,
                            'bubbles': true,
                            'cancelable': true,
                            'clientX': {x},
                            'clientY': {y}
                        }});
                        document.dispatchEvent(event);
                    """)
                
                # Random pause based on configuration
                self._random_delay(0.1, 0.5)
            
            # Update stealth metrics
            self.stealth_metrics["mouse_movements"] += 1
            self.stealth_metrics["last_activity"] = datetime.now()
            
        except Exception as e:
            self.logger.error(f"Error simulating mouse movement: {e}")
    
    def _simulate_natural_scrolling(self):
        """Simulate natural scrolling behavior using configuration"""
        if not self.human_behavior_config.get("natural_scrolling", True):
            return
            
        try:
            # Get page height
            page_height = self.driver.execute_script("return document.body.scrollHeight;")
            viewport_height = self.driver.execute_script("return window.innerHeight;")
            
            if page_height > viewport_height:
                # Get scroll intervals from configuration
                min_interval = self.human_behavior_config.get("scroll_interval_min", 0.5)
                max_interval = self.human_behavior_config.get("scroll_interval_max", 1.5)
                
                # Scroll down gradually
                current_scroll = 0
                scroll_step = random.randint(100, 300)
                
                while current_scroll < page_height:
                    # Random scroll amount
                    scroll_amount = random.randint(scroll_step - 50, scroll_step + 50)
                    current_scroll += scroll_amount
                    
                    # Smooth scroll
                    self.driver.execute_script(f"window.scrollTo(0, {current_scroll});")
                    
                    # Random pause between scrolls based on configuration
                    self._random_delay(min_interval, max_interval)
                    
                    # Sometimes scroll back up a bit (human behavior)
                    if random.random() < 0.2:
                        back_scroll = random.randint(50, 150)
                        current_scroll -= back_scroll
                        self.driver.execute_script(f"window.scrollTo(0, {current_scroll});")
                        self._random_delay(0.5, 1.5)
                
                # Scroll back to top
                self.driver.execute_script("window.scrollTo(0, 0);")
                self._random_delay(1, 2)
                
                # Update stealth metrics
                self.stealth_metrics["scrolls"] += 1
                self.stealth_metrics["last_activity"] = datetime.now()
                
        except Exception as e:
            self.logger.error(f"Error simulating natural scrolling: {e}")
    
    def _simulate_realistic_typing(self):
        """Simulate realistic typing behavior"""
        try:
            # Find input fields (if any)
            input_fields = self.driver.find_elements(By.TAG_NAME, "input")
            textareas = self.driver.find_elements(By.TAG_NAME, "textarea")
            
            all_fields = input_fields + textareas
            
            for field in all_fields[:2]:  # Limit to first 2 fields
                if field.is_displayed() and field.is_enabled():
                    # Click on field
                    self.driver.execute_script("arguments[0].click();", field)
                    time.sleep(random.uniform(0.5, 1))
                    
                    # Type with realistic delays
                    sample_text = "This is a sample text for testing purposes."
                    
                    for char in sample_text:
                        field.send_keys(char)
                        # Random delay between keystrokes
                        time.sleep(random.uniform(0.05, 0.15))
                    
                    time.sleep(random.uniform(1, 2))
                    
        except Exception as e:
            self.logger.error(f"Error simulating realistic typing: {e}")
    
    def _simulate_natural_click(self, element=None, x=None, y=None):
        """Simulate natural click patterns using configuration"""
        if not self.click_config.get("enabled", True):
            return
            
        try:
            # Hover before click if enabled
            if self.click_config.get("hover_before_click", True) and element:
                self._simulate_link_hovering()
                self._random_delay(0.2, 0.8)
            
            # Click delay variation if enabled
            if self.click_config.get("click_delay_variation", True):
                self._random_delay(0.1, 0.5)
            
            # Perform click
            if element:
                # Use JavaScript click for better reliability
                self.driver.execute_script("arguments[0].click();", element)
            elif x is not None and y is not None:
                # Click at specific coordinates
                self.driver.execute_script(f"""
                    var event = new MouseEvent('click', {{
                        'view': window,
                        'bubbles': true,
                        'cancelable': true,
                        'clientX': {x},
                        'clientY': {y}
                    }});
                    document.elementFromPoint({x}, {y}).dispatchEvent(event);
                """)
            
            # Double click probability
            if self.click_config.get("double_click_probability", 0.05) > random.random():
                self._random_delay(0.1, 0.3)
                if element:
                    self.driver.execute_script("arguments[0].click();", element)
                elif x is not None and y is not None:
                    self.driver.execute_script(f"""
                        var event = new MouseEvent('click', {{
                            'view': window,
                            'bubbles': true,
                            'cancelable': true,
                            'clientX': {x},
                            'clientY': {y}
                        }});
                        document.elementFromPoint({x}, {y}).dispatchEvent(event);
                    """)
            
            # Update stealth metrics
            self.stealth_metrics["clicks"] += 1
            self.stealth_metrics["last_activity"] = datetime.now()
            
        except Exception as e:
            self.logger.error(f"Error in natural click: {e}")
    
    def test_adsense_ads(self) -> Dict:
        """Test AdSense ads on current page with FOCUS on ad interaction"""
        try:
            current_url = self.driver.current_url
            self.logger.info(f"Testing AdSense ads on current page: {current_url}")
            
            # Look for AdSense ads on current page
            adsense_results = self._detect_adsense_ads()
            
            # Simulate ad interaction (very carefully)
            interaction_results = self._simulate_ad_interaction()
            
            # Collect metrics
            metrics = self._collect_adsense_metrics()
            
            results = {
                "url": current_url,
                "ads_detected": adsense_results["count"],
                "ad_positions": adsense_results["positions"],
                "interactions": interaction_results,
                "metrics": metrics,
                "timestamp": time.strftime('%Y-%m-%d %H:%M:%S')
            }
            
            self.logger.info(f"AdSense test completed: {adsense_results['count']} ads detected")
            return results
            
        except Exception as e:
            self.logger.error(f"Error testing AdSense ads: {e}")
            return {"error": str(e)}
    
    def _detect_adsense_ads(self) -> Dict:
        """Detect AdSense ads on the page with REAL-TIME detection"""
        try:
            # Wait for ads to load
            self.logger.info("⏳ Waiting for ads to load...")
            time.sleep(5)  # Give ads time to load
            
            # 🔥 SETUP REAL-TIME AD DETECTION FIRST
            self.logger.info("🔍 Setting up REAL-TIME ad detection system...")
            self._setup_realtime_ad_observer()
            
            # 🔥 PERFORM SCROLLING WITH REAL-TIME DETECTION
            self.logger.info("🔄 Starting scrolling with REAL-TIME ad detection...")
            scroll_result = self._perform_scrolling_with_realtime_detection()
            
            # Get detected ads from real-time system
            realtime_ads = self._get_all_detected_ads_from_observer()
            
            if realtime_ads:
                self.logger.info(f"🎯 REAL-TIME DETECTION: Found {len(realtime_ads)} ads!")
                return self._convert_realtime_ads_to_dict(realtime_ads)
            
            # Fallback to traditional detection if real-time didn't find anything
            self.logger.info("🔍 Fallback: Scanning page with traditional selectors...")
            
            # Comprehensive AdSense selectors
            adsense_selectors = [
                # Standard AdSense
                "ins.adsbygoogle",
                "div[class*='adsbygoogle']",
                "div[id*='google_ads']",
                
                # Google Ad Manager / DFP
                "div[id*='div-gpt-ad']",
                "div[data-google-ad-client]",
                "div[data-ad-slot]",
                
                # Generic ad selectors
                "div[class*='ad-']",
                "div[id*='ad-']",
                "div[class*='ads-']",
                "div[id*='ads-']",
                ".ad-container",
                ".ad-banner",
                ".ad-unit",
                ".advertisement",
                
                # iFrame ads
                "iframe[src*='googleads']",
                "iframe[src*='doubleclick']",
                "iframe[src*='googlesyndication']",
                "iframe[src*='adsystem']",
                
                # More specific patterns
                "div[class*='google']",
                "div[id*='google']"
            ]
            
            self.logger.info(f"🔍 Scanning page with {len(adsense_selectors)} ad selectors...")
            
            detected_ads = []
            ad_positions = []
            
            for i, selector in enumerate(adsense_selectors):
                try:
                    ads = self.driver.find_elements(By.CSS_SELECTOR, selector)
                    self.logger.debug(f"Selector {i+1}/{len(adsense_selectors)} '{selector}': Found {len(ads)} elements")
                    
                    for ad in ads:
                        if ad.is_displayed() and ad.size["width"] > 0 and ad.size["height"] > 0:
                            # Get ad position
                            location = ad.location
                            size = ad.size
                            
                            # Check if ad is reasonably sized (not just 1x1 pixel)
                            if size["width"] >= 50 and size["height"] >= 50:
                                ad_info = {
                                    "selector": selector,
                                    "location": location,
                                    "size": size,
                                    "visible": ad.is_displayed(),
                                    "element_tag": ad.tag_name,
                                    "element_class": ad.get_attribute("class") or "",
                                    "element_id": ad.get_attribute("id") or ""
                                }
                                
                                detected_ads.append(ad_info)
                                ad_positions.append({
                                    "x": location["x"],
                                    "y": location["y"],
                                    "width": size["width"],
                                    "height": size["height"]
                                })
                                
                                self.logger.info(f"✅ Found ad: {selector} - {size['width']}x{size['height']} at ({location['x']}, {location['y']})")
                            
                except Exception as e:
                    self.logger.debug(f"Error with selector {selector}: {e}")
            
            self.logger.info(f"🎯 Total ads detected: {len(detected_ads)}")
            
            # Return real detection results (no fallback to simulated ads)
            return {
                "count": len(detected_ads),
                "positions": ad_positions,
                "details": detected_ads
            }
            
        except Exception as e:
            self.logger.error(f"Error detecting AdSense ads: {e}")
            return {"count": 0, "positions": [], "details": []}
    
    def _create_simulated_ads_for_testing(self) -> Dict:
        """Create simulated ads for testing post-click behavior when no real ads exist"""
        try:
            # Create invisible div elements that can act as clickable ads for testing
            self.driver.execute_script("""
                // Create simulated ad elements for testing
                var simulatedAds = [];
                for (var i = 0; i < 2; i++) {
                    var adDiv = document.createElement('div');
                    adDiv.id = 'simulated-ad-' + i;
                    adDiv.className = 'simulated-adsense-ad';
                    adDiv.style.width = '300px';
                    adDiv.style.height = '250px';
                    adDiv.style.position = 'absolute';
                    adDiv.style.top = (100 + i * 300) + 'px';
                    adDiv.style.left = '50px';
                    adDiv.style.backgroundColor = 'transparent';
                    adDiv.style.border = '1px solid transparent';
                    adDiv.style.cursor = 'pointer';
                    adDiv.style.zIndex = '9999';
                    
                    // Add click handler that simulates ad click behavior
                    adDiv.onclick = function() {
                        // Simulate ad click by opening a new tab to a landing page
                        var landingPages = [
                            'https://example.com/landing1',
                            'https://example.com/landing2',
                            'https://httpbin.org/html',
                            'https://httpbin.org/forms/post'
                        ];
                        var randomPage = landingPages[Math.floor(Math.random() * landingPages.length)];
                        window.open(randomPage, '_blank');
                    };
                    
                    document.body.appendChild(adDiv);
                    simulatedAds.push(adDiv);
                }
                return simulatedAds.length;
            """)
            
            # Return simulated ad data
            simulated_ad_data = {
                "count": 2,
                "positions": [
                    {"x": 50, "y": 100, "width": 300, "height": 250},
                    {"x": 50, "y": 400, "width": 300, "height": 250}
                ],
                "details": [
                    {
                        "selector": "simulated-ad",
                        "location": {"x": 50, "y": 100},
                        "size": {"width": 300, "height": 250},
                        "visible": True,
                        "simulated": True
                    },
                    {
                        "selector": "simulated-ad", 
                        "location": {"x": 50, "y": 400},
                        "size": {"width": 300, "height": 250},
                        "visible": True,
                        "simulated": True
                    }
                ]
            }
            
            self.logger.info(f"✅ Created {simulated_ad_data['count']} simulated ads for testing")
            return simulated_ad_data
            
        except Exception as e:
            self.logger.error(f"Error creating simulated ads: {e}")
            return {"count": 0, "positions": [], "details": []}
    
    def _simulate_ad_interaction(self) -> Dict:
        """Simulate intelligent ad interaction based on context"""
        try:
            interactions = {
                "impressions": 0,
                "clicks": 0,
                "hover_events": 0,
                "context_relevance": "low"
            }
            
            # Get smart ad interaction settings
            ad_context = self._smart_ad_interaction()
            interaction_probability = ad_context["interaction_probability"]
            dwell_time = ad_context["dwell_time"]
            relevance = ad_context["relevance"]
            
            interactions["context_relevance"] = relevance
            
            # Find real ads only (no simulated ads)
            adsense_selectors = [
                "ins.adsbygoogle",
                "div[id*='google_ads']",
                "div[class*='adsbygoogle']",
                "div[id*='div-gpt-ad']",
                "div[data-google-ad-client]",
                "div[data-ad-slot]",
                "div[class*='ad-']",
                "div[id*='ad-']",
                "iframe[src*='googleads']",
                "iframe[src*='doubleclick']"
            ]
            
            for selector in adsense_selectors:
                try:
                    ads = self.driver.find_elements(By.CSS_SELECTOR, selector)
                    
                    for ad in ads[:2]:  # Limit to first 2 ads
                        if ad.is_displayed():
                            # Scroll ad into view
                            self.driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", ad)
                            
                            # Adjust dwell time based on context
                            if dwell_time == "long":
                                time.sleep(random.uniform(3, 6))
                            elif dwell_time == "medium":
                                time.sleep(random.uniform(2, 4))
                            else:  # short
                                time.sleep(random.uniform(1, 2))
                            
                            # Simulate hover based on context relevance
                            hover_probability = 0.1 if relevance == "high" else 0.05 if relevance == "medium" else 0.02
                            if random.random() < hover_probability:
                                actions = ActionChains(self.driver)
                                actions.move_to_element(ad)
                                actions.pause(random.uniform(0.5, 1.5))
                                actions.perform()
                                interactions["hover_events"] += 1
                                time.sleep(random.uniform(1, 2))
                            
                            # Count impression
                            interactions["impressions"] += 1
                            
                            # Click simulation based on context relevance
                            click_probability = interaction_probability
                            if random.random() < click_probability:
                                try:
                                    ad.click()
                                    interactions["clicks"] += 1
                                    
                                    # 🔥 IMPLEMENTASI PERILAKU KHUSUS SETELAH KLIK IKLAN
                                    self._handle_post_ad_click_behavior(ad, relevance)
                                    
                                    self.logger.warning(f"Simulated ad click (context: {relevance}, probability: {click_probability})")
                                except Exception as e:
                                    self.logger.debug(f"Click failed: {e}")
                            
                except Exception as e:
                    self.logger.debug(f"Error with ad interaction {selector}: {e}")
            
            return interactions
            
        except Exception as e:
            self.logger.error(f"Error simulating ad interaction: {e}")
            return {"impressions": 0, "clicks": 0, "hover_events": 0, "context_relevance": "low"}
    
    def _handle_post_ad_click_behavior(self, ad_element, context_relevance: str):
        """Handle realistic behavior after clicking an ad"""
        try:
            # Check if post-ad click behavior is enabled
            post_click_config = self.advanced_config.get("post_ad_click_behavior", {})
            if not post_click_config.get("enabled", True):
                self.logger.debug("Post-ad click behavior disabled, skipping")
                return
            
            self.logger.info(f"🎯 Starting post-ad click behavior simulation (context: {context_relevance})")
            
            # Wait for page to load after click
            time.sleep(random.uniform(2, 4))
            
            # 1. LANDING PAGE BEHAVIOR
            if post_click_config.get("landing_page_behavior", True):
                self._simulate_landing_page_behavior()
            
            # 2. FORM INTERACTION (if available)
            if post_click_config.get("form_interaction", True) and self._detect_forms_on_page():
                self._simulate_form_interaction()
            
            # 3. PURCHASE SIMULATION (if e-commerce)
            if post_click_config.get("purchase_simulation", True) and self._detect_ecommerce_elements():
                self._simulate_purchase_behavior()
            
            # 4. BACK NAVIGATION
            if post_click_config.get("back_navigation", True):
                self._simulate_back_navigation()
            
            self.logger.info("✅ Post-ad click behavior simulation completed")
            
        except Exception as e:
            self.logger.error(f"Post-ad click behavior failed: {e}")
    
    def _simulate_landing_page_behavior(self):
        """Simulate realistic behavior on ad landing page"""
        try:
            # Get landing page configuration
            post_click_config = self.advanced_config.get("post_ad_click_behavior", {})
            landing_config = post_click_config.get("landing_page", {})
            
            self.logger.debug("📖 Simulating landing page behavior...")
            
            # Read page title and content
            page_title = self.driver.title
            self.logger.debug(f"📄 Landing page: {page_title}")
            
            # Simulate reading behavior if enabled
            if random.random() < landing_config.get("reading_probability", 0.8):
                self._simulate_reading_behavior()
            
            # Scroll through content if enabled
            if random.random() < landing_config.get("scrolling_probability", 0.9):
                self._simulate_natural_scrolling()
            
            # Check for important elements if enabled
            if landing_config.get("element_checking", True):
                self._check_page_elements()
            
            # Random dwell time based on configuration
            dwell_time = random.uniform(
                landing_config.get("dwell_time_min", 10),
                landing_config.get("dwell_time_max", 30)
            )
            self.logger.debug(f"⏱️ Landing page dwell time: {dwell_time:.1f}s")
            time.sleep(dwell_time)
            
        except Exception as e:
            self.logger.error(f"Landing page behavior failed: {e}")
    
    def _detect_forms_on_page(self) -> bool:
        """Detect if there are forms on the landing page"""
        try:
            forms = self.driver.find_elements(By.CSS_SELECTOR, "form, input[type='email'], input[type='text']")
            return len(forms) > 0
        except:
            return False
    
    def _simulate_form_interaction(self):
        """Simulate realistic form filling behavior"""
        try:
            # Get form interaction configuration
            post_click_config = self.advanced_config.get("post_ad_click_behavior", {})
            form_config = post_click_config.get("form_interaction", {})
            
            self.logger.debug("📝 Simulating form interaction...")
            
            # Find form elements
            email_inputs = self.driver.find_elements(By.CSS_SELECTOR, "input[type='email']")
            text_inputs = self.driver.find_elements(By.CSS_SELECTOR, "input[type='text']")
            
            if email_inputs and random.random() < form_config.get("email_filling_probability", 0.7):
                self.logger.debug("📧 Found email field, simulating interaction...")
                email_input = email_inputs[0]
                
                # Generate fake email
                fake_email = f"user{random.randint(1000, 9999)}@example.com"
                
                # Realistic typing with configurable speed
                email_input.clear()
                for char in fake_email:
                    email_input.send_keys(char)
                    time.sleep(random.uniform(
                        form_config.get("typing_speed_min", 0.05),
                        form_config.get("typing_speed_max", 0.15)
                    ))
                
                self.logger.debug(f"✉️ Entered email: {fake_email}")
            
            if text_inputs and random.random() < form_config.get("name_filling_probability", 0.6):
                self.logger.debug("📝 Found text field, simulating interaction...")
                text_input = text_inputs[0]
                
                # Generate fake name
                fake_names = ["John Doe", "Jane Smith", "Mike Johnson", "Sarah Wilson"]
                fake_name = random.choice(fake_names)
                
                # Realistic typing with configurable speed
                text_input.clear()
                for char in fake_name:
                    text_input.send_keys(char)
                    time.sleep(random.uniform(
                        form_config.get("typing_speed_min", 0.05),
                        form_config.get("typing_speed_max", 0.15)
                    ))
                
                self.logger.debug(f"👤 Entered name: {fake_name}")
            
            # Decide whether to submit or abandon based on configuration
            submit_probability = form_config.get("submit_probability", 0.3)
            if random.random() < submit_probability:
                self.logger.debug("✅ Deciding to submit form...")
                submit_buttons = self.driver.find_elements(By.CSS_SELECTOR, "button[type='submit'], input[type='submit']")
                if submit_buttons:
                    submit_buttons[0].click()
                    self.logger.debug("📤 Form submitted")
                    time.sleep(random.uniform(3, 8))
            else:
                self.logger.debug("❌ Deciding to abandon form (realistic behavior)")
            
        except Exception as e:
            self.logger.error(f"Form interaction failed: {e}")
    
    def _detect_ecommerce_elements(self) -> bool:
        """Detect if page has e-commerce elements"""
        try:
            ecommerce_selectors = [
                "button[class*='buy']", "button[class*='add']", "button[class*='cart']",
                ".price", ".product", ".shop", ".store", "[data-price]"
            ]
            
            for selector in ecommerce_selectors:
                elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                if elements:
                    return True
            return False
        except:
            return False
    
    def _simulate_purchase_behavior(self):
        """Simulate realistic purchase flow"""
        try:
            # Get purchase simulation configuration
            post_click_config = self.advanced_config.get("post_ad_click_behavior", {})
            purchase_config = post_click_config.get("purchase_simulation", {})
            
            self.logger.debug("🛒 Simulating e-commerce behavior...")
            
            # Browse products if enabled
            if random.random() < purchase_config.get("product_browsing_probability", 0.6):
                product_links = self.driver.find_elements(By.CSS_SELECTOR, "a[href*='product'], .product a, .item a")
                
                if product_links:
                    # Click on a random product (limit based on config)
                    max_products = purchase_config.get("max_products_to_browse", 3)
                    random_product = random.choice(product_links[:max_products])
                    self.logger.debug("📦 Clicking on product...")
                    random_product.click()
                    time.sleep(random.uniform(2, 5))
                    
                    # Simulate product page behavior
                    self.logger.debug("👀 Viewing product details...")
                    self._simulate_reading_behavior()
                    
                    # Add to cart simulation
                    add_to_cart_buttons = self.driver.find_elements(By.CSS_SELECTOR, "button[class*='add'], button[class*='cart'], .add-to-cart")
                    if add_to_cart_buttons:
                        add_probability = purchase_config.get("add_to_cart_probability", 0.4)
                        if random.random() < add_probability:
                            self.logger.debug("🛍️ Adding to cart...")
                            add_to_cart_buttons[0].click()
                            time.sleep(random.uniform(2, 4))
                            
                            # Checkout simulation
                            checkout_buttons = self.driver.find_elements(By.CSS_SELECTOR, "button[class*='checkout'], .checkout, a[href*='checkout']")
                            if checkout_buttons:
                                checkout_probability = purchase_config.get("checkout_probability", 0.2)
                                if random.random() < checkout_probability:
                                    self.logger.debug("💳 Proceeding to checkout...")
                                    checkout_buttons[0].click()
                                    time.sleep(random.uniform(3, 6))
                                    
                                    # Abandon at payment (realistic behavior)
                                    self.logger.debug("❌ Abandoning at payment (realistic)")
                                else:
                                    self.logger.debug("❌ Abandoning at checkout (realistic)")
                            else:
                                self.logger.debug("❌ No checkout option found")
                        else:
                            self.logger.debug("❌ Deciding not to add to cart (realistic)")
            
        except Exception as e:
            self.logger.error(f"Purchase behavior failed: {e}")
    
    def _check_page_elements(self):
        """Check for important page elements"""
        try:
            important_elements = [
                ("h1", "headings"),
                ("p", "paragraphs"),
                ("img", "images"),
                ("button", "buttons"),
                ("a", "links")
            ]
            
            for selector, name in important_elements:
                elements = self.driver.find_elements(By.CSS_SELECTOR, selector)
                if elements:
                    self.logger.debug(f"📊 Found {len(elements)} {name}")
            
        except Exception as e:
            self.logger.error(f"Page element check failed: {e}")
    
    def _simulate_back_navigation(self):
        """Simulate realistic back navigation"""
        try:
            # Get back navigation configuration
            post_click_config = self.advanced_config.get("post_ad_click_behavior", {})
            back_config = post_click_config.get("back_navigation", {})
            
            # Check if back navigation is enabled
            if not back_config.get("enabled", True):
                self.logger.debug("Back navigation disabled, skipping")
                return
            
            # Check return probability
            if random.random() > back_config.get("return_probability", 0.9):
                self.logger.debug("Deciding not to return (realistic behavior)")
                return
            
            self.logger.debug("🔙 Simulating back navigation...")
            
            # Use browser back button
            self.driver.back()
            time.sleep(random.uniform(2, 4))
            
            # Verify we're back to original page
            current_url = self.driver.current_url
            self.logger.debug(f"📍 Back to: {current_url}")
            
            # Continue browsing on original page if enabled
            if random.random() < back_config.get("continue_browsing_probability", 0.8):
                self._simulate_natural_scrolling()
                self._simulate_mouse_movement()
            
        except Exception as e:
            self.logger.error(f"Back navigation failed: {e}")
    
    def _collect_adsense_metrics(self) -> Dict:
        """Collect AdSense-related metrics"""
        try:
            metrics = {
                "page_load_time": 0,
                "adsense_loaded": False,
                "page_title": "",
                "url": self.driver.current_url
            }
            
            # Get page title
            metrics["page_title"] = self.driver.title
            
            # Check if AdSense is loaded
            try:
                adsense_script = self.driver.find_element(By.CSS_SELECTOR, "script[src*='pagead2.googlesyndication.com']")
                metrics["adsense_loaded"] = True
            except NoSuchElementException:
                metrics["adsense_loaded"] = False
            
            # Get page load time
            navigation_timing = self.driver.execute_script("""
                var timing = window.performance.timing;
                return timing.loadEventEnd - timing.navigationStart;
            """)
            metrics["page_load_time"] = navigation_timing
            
            return metrics
            
        except Exception as e:
            self.logger.error(f"Error collecting metrics: {e}")
            return {"error": str(e)}
    
    def close_driver(self):
        """Close the browser driver"""
        try:
            if self.driver:
                self.driver.quit()
                self.logger.info("Browser driver closed")
        except Exception as e:
            self.logger.error(f"Error closing driver: {e}")
    
    def run_adsense_test_session(self, debugging_url: str, target_urls: List[str]) -> List[Dict]:
        """Run a complete AdSense testing session"""
        try:
            if not self.setup_driver(debugging_url):
                return []
            
            results = []
            
            for url in target_urls:
                try:
                    result = self.test_adsense_ads(url)
                    results.append(result)
                    
                    # Random delay between URLs
                    time.sleep(random.uniform(5, 15))
                    
                except Exception as e:
                    self.logger.error(f"Error testing URL {url}: {e}")
                    results.append({"url": url, "error": str(e)})
            
            return results
            
        except Exception as e:
            self.logger.error(f"Error in AdSense test session: {e}")
            return []
        finally:
            self.close_driver()
