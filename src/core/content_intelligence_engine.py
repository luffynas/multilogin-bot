"""
Content Intelligence Engine
Provides real-time content analysis and context-aware behavior adaptation
"""

import random
import time
import json
import re
from typing import Dict, List, Optional, Tuple, Any
import logging
from datetime import datetime, timedelta
from collections import defaultdict
import hashlib
from enum import Enum

class ContentType(Enum):
    """Content types for analysis"""
    ARTICLE = "article"
    VIDEO = "video"
    IMAGE = "image"
    PRODUCT = "product"
    NEWS = "news"
    BLOG = "blog"
    SOCIAL = "social"
    LANDING = "landing"

class ContentIntelligenceEngine:
    """Real-time content analysis and context-aware behavior adaptation"""
    
    def __init__(self, config: Dict):
        self.config = config
        self.logger = logging.getLogger(__name__)
        
        # Load configurable target categories
        self.content_analysis_config = config.get("content_analysis", {})
        self.target_categories = self.content_analysis_config.get("target_categories", [
            "technology", "lifestyle", "business", "entertainment", "education"
        ])
        self.category_weights = self.content_analysis_config.get("category_weights", {})
        self.category_patterns = self.content_analysis_config.get("category_patterns", {})
        
        # Content analysis models
        self.content_patterns = self.load_content_patterns()
        self.reading_patterns = self.load_reading_patterns()
        self.engagement_patterns = self.load_engagement_patterns()
        
        # Context tracking
        self.content_history = []
        self.context_memory = {}
        self.adaptation_rules = {}
        
        # Real-time analysis
        self.current_content = None
        self.content_metrics = {}
        
        self.logger.info(f"Content Intelligence Engine initialized with {len(self.target_categories)} target categories")
        
    def load_content_patterns(self) -> Dict:
        """Load content analysis patterns"""
        return {
            "content_types": {
                "article": {
                    "avg_reading_time": 300,  # 5 minutes
                    "engagement_factors": ["headline", "introduction", "conclusion"],
                    "reading_depth": "deep",
                    "interaction_probability": 0.6
                },
                "video": {
                    "avg_watch_time": 180,  # 3 minutes
                    "engagement_factors": ["thumbnail", "title", "description"],
                    "reading_depth": "medium",
                    "interaction_probability": 0.8
                },
                "product": {
                    "avg_view_time": 120,  # 2 minutes
                    "engagement_factors": ["images", "price", "reviews"],
                    "reading_depth": "shallow",
                    "interaction_probability": 0.9
                },
                "news": {
                    "avg_reading_time": 180,  # 3 minutes
                    "engagement_factors": ["headline", "breaking", "relevance"],
                    "reading_depth": "medium",
                    "interaction_probability": 0.7
                },
                "blog": {
                    "avg_reading_time": 420,  # 7 minutes
                    "engagement_factors": ["topic", "author", "comments"],
                    "reading_depth": "deep",
                    "interaction_probability": 0.5
                }
            },
            "topic_categories": self.get_topic_categories_patterns(),
            "complexity_levels": {
                "simple": {
                    "reading_speed": "fast",
                    "comprehension_rate": 0.9,
                    "reread_probability": 0.1,
                    "note_taking": 0.1
                },
                "moderate": {
                    "reading_speed": "medium",
                    "comprehension_rate": 0.7,
                    "reread_probability": 0.3,
                    "note_taking": 0.3
                },
                "complex": {
                    "reading_speed": "slow",
                    "comprehension_rate": 0.5,
                    "reread_probability": 0.6,
                    "note_taking": 0.6
                }
            }
        }
    
    def load_reading_patterns(self) -> Dict:
        """Load realistic reading behavior patterns"""
        return {
            "reading_styles": {
                "skimmer": {
                    "avg_time_per_word": 0.1,  # seconds
                    "comprehension_rate": 0.6,
                    "highlight_probability": 0.1,
                    "pause_frequency": "low"
                },
                "thorough": {
                    "avg_time_per_word": 0.3,
                    "comprehension_rate": 0.9,
                    "highlight_probability": 0.4,
                    "pause_frequency": "high"
                },
                "selective": {
                    "avg_time_per_word": 0.2,
                    "comprehension_rate": 0.7,
                    "highlight_probability": 0.2,
                    "pause_frequency": "medium"
                }
            },
            "attention_patterns": {
                "focused": {
                    "attention_span": 900,  # 15 minutes
                    "break_frequency": "low",
                    "distraction_resistance": "high"
                },
                "easily_distracted": {
                    "attention_span": 300,  # 5 minutes
                    "break_frequency": "high",
                    "distraction_resistance": "low"
                },
                "adaptive": {
                    "attention_span": 600,  # 10 minutes
                    "break_frequency": "medium",
                    "distraction_resistance": "medium"
                }
            },
            "interaction_patterns": {
                "high_engagement": {
                    "click_probability": 0.7,
                    "scroll_probability": 0.9,
                    "comment_probability": 0.3,
                    "share_probability": 0.4
                },
                "moderate_engagement": {
                    "click_probability": 0.4,
                    "scroll_probability": 0.7,
                    "comment_probability": 0.1,
                    "share_probability": 0.2
                },
                "low_engagement": {
                    "click_probability": 0.2,
                    "scroll_probability": 0.4,
                    "comment_probability": 0.05,
                    "share_probability": 0.1
                }
            }
        }
    
    def load_engagement_patterns(self) -> Dict:
        """Load content engagement patterns"""
        return {
            "engagement_triggers": {
                "emotional": {
                    "triggers": ["surprise", "joy", "anger", "sadness", "fear"],
                    "response_probability": 0.8,
                    "action_type": "immediate"
                },
                "intellectual": {
                    "triggers": ["curiosity", "confusion", "insight", "agreement"],
                    "response_probability": 0.6,
                    "action_type": "delayed"
                },
                "social": {
                    "triggers": ["trending", "viral", "controversial", "popular"],
                    "response_probability": 0.7,
                    "action_type": "immediate"
                },
                "practical": {
                    "triggers": ["useful", "actionable", "relevant", "timely"],
                    "response_probability": 0.5,
                    "action_type": "delayed"
                }
            },
            "content_quality_indicators": {
                "high_quality": {
                    "indicators": ["well_researched", "original", "comprehensive", "professional"],
                    "engagement_boost": 1.5,
                    "reading_time_multiplier": 1.3
                },
                "medium_quality": {
                    "indicators": ["informative", "clear", "relevant", "adequate"],
                    "engagement_boost": 1.0,
                    "reading_time_multiplier": 1.0
                },
                "low_quality": {
                    "indicators": ["poorly_written", "clickbait", "incomplete", "unreliable"],
                    "engagement_boost": 0.5,
                    "reading_time_multiplier": 0.7
                }
            }
        }
    
    def analyze_content(self, content_data: Dict) -> Dict:
        """Analyze content and extract intelligence"""
        analysis = {
            "content_type": self.detect_content_type(content_data),
            "topic_category": self.categorize_topic(content_data),
            "complexity_level": self.assess_complexity(content_data),
            "quality_score": self.assess_quality(content_data),
            "engagement_potential": self.calculate_engagement_potential(content_data),
            "reading_requirements": self.calculate_reading_requirements(content_data),
            "interaction_opportunities": self.identify_interaction_opportunities(content_data),
            "context_relevance": self.assess_context_relevance(content_data),
            "trending_factors": self.analyze_trending_factors(content_data),
            "user_intent_matching": self.assess_user_intent_matching(content_data)
        }
        
        # Store current content
        self.current_content = analysis
        
        # Update content history
        self.content_history.append({
            "timestamp": datetime.now(),
            "analysis": analysis,
            "content_id": content_data.get("id", "unknown")
        })
        
        return analysis
    
    def detect_content_type(self, content_data: Dict) -> str:
        """Detect content type based on data"""
        url = content_data.get("url", "")
        title = content_data.get("title", "")
        content = content_data.get("content", "")
        
        # URL-based detection
        if any(keyword in url.lower() for keyword in ["video", "youtube", "vimeo"]):
            return "video"
        elif any(keyword in url.lower() for keyword in ["product", "shop", "buy"]):
            return "product"
        elif any(keyword in url.lower() for keyword in ["news", "breaking"]):
            return "news"
        elif any(keyword in url.lower() for keyword in ["blog", "post"]):
            return "blog"
        
        # Content-based detection
        if len(content) > 2000:
            return "article"
        elif len(content) > 500:
            return "blog"
        else:
            return "article"  # Default
    
    def categorize_topic(self, content_data: Dict) -> str:
        """Categorize content topic using configurable target categories"""
        title = content_data.get("title", "")
        content = content_data.get("content", "")
        keywords = content_data.get("keywords", [])
        
        # Load topic keywords for configurable categories
        topic_keywords = self.load_topic_keywords_for_categories()
        
        # Analyze text for topic keywords
        text = (title + " " + content).lower()
        topic_scores = {}
        
        # Only analyze configured target categories
        for topic in self.target_categories:
            if topic in topic_keywords:
                keywords_list = topic_keywords[topic]
                score = sum(1 for keyword in keywords_list if keyword in text)
                topic_scores[topic] = score
        
        # Apply category weights if configured
        if self.category_weights and topic_scores:
            return self.select_weighted_category(topic_scores)
        elif topic_scores:
            # Return topic with highest score
            return max(topic_scores, key=topic_scores.get)
        else:
            return "general"
    
    def load_topic_keywords_for_categories(self) -> Dict[str, List[str]]:
        """Load topic keywords for configurable target categories"""
        return {
            "technology": ["ai", "tech", "software", "digital", "innovation", "startup", "programming", "coding", "app", "web", "mobile", "cloud", "data", "algorithm"],
            "lifestyle": ["health", "fitness", "food", "travel", "fashion", "wellness", "diet", "exercise", "beauty", "style", "home", "family", "relationship"],
            "business": ["business", "entrepreneur", "marketing", "finance", "strategy", "management", "leadership", "startup", "investment", "sales", "growth", "profit"],
            "entertainment": ["movie", "music", "game", "celebrity", "show", "fun", "film", "song", "artist", "actor", "actress", "concert", "festival", "comedy"],
            "education": ["learn", "study", "course", "tutorial", "knowledge", "skill", "training", "school", "university", "college", "degree", "certificate", "online"],
            "finance": ["money", "investment", "banking", "loan", "credit", "debt", "saving", "budget", "financial", "economy", "stock", "trading", "insurance"],
            "health": ["medical", "doctor", "hospital", "treatment", "medicine", "disease", "symptom", "diagnosis", "therapy", "recovery", "prevention", "wellness"],
            "sports": ["football", "basketball", "tennis", "soccer", "baseball", "golf", "swimming", "running", "fitness", "athlete", "team", "championship", "tournament"],
            "news": ["breaking", "latest", "update", "announcement", "report", "investigation", "analysis", "opinion", "editorial", "headline", "story"],
            "travel": ["vacation", "trip", "destination", "hotel", "flight", "booking", "resort", "beach", "mountain", "city", "country", "culture", "adventure"]
        }
    
    def select_weighted_category(self, topic_scores: Dict[str, int]) -> str:
        """Select category using weighted probability based on scores and configured weights"""
        if not self.category_weights:
            return max(topic_scores, key=topic_scores.get)
        
        # Calculate weighted scores
        weighted_scores = {}
        total_weight = 0
        
        for topic, score in topic_scores.items():
            weight = self.category_weights.get(topic, 0.1)  # Default weight if not configured
            weighted_score = score * weight
            weighted_scores[topic] = weighted_score
            total_weight += weighted_score
        
        if total_weight == 0:
            # Fallback to unweighted selection
            return max(topic_scores, key=topic_scores.get)
        
        # Normalize weights
        normalized_weights = {}
        for topic, weighted_score in weighted_scores.items():
            normalized_weights[topic] = weighted_score / total_weight
        
        # Select category using weighted random choice
        import random
        categories = list(normalized_weights.keys())
        weights = list(normalized_weights.values())
        
        return random.choices(categories, weights=weights, k=1)[0]
    
    def get_topic_categories_patterns(self) -> Dict:
        """Get topic categories patterns from config or use defaults"""
        if self.category_patterns:
            return self.category_patterns
        
        # Default patterns if not configured
        return {
            "technology": {
                "interest_level": 0.8,
                "reading_speed": "medium",
                "interaction_type": "analytical",
                "share_probability": 0.6,
                "engagement_depth": "high"
            },
            "lifestyle": {
                "interest_level": 0.7,
                "reading_speed": "fast",
                "interaction_type": "emotional",
                "share_probability": 0.8,
                "engagement_depth": "medium"
            },
            "business": {
                "interest_level": 0.9,
                "reading_speed": "slow",
                "interaction_type": "professional",
                "share_probability": 0.4,
                "engagement_depth": "high"
            },
            "entertainment": {
                "interest_level": 0.6,
                "reading_speed": "fast",
                "interaction_type": "casual",
                "share_probability": 0.7,
                "engagement_depth": "medium"
            },
            "education": {
                "interest_level": 0.8,
                "reading_speed": "slow",
                "interaction_type": "studious",
                "share_probability": 0.5,
                "engagement_depth": "high"
            },
            "finance": {
                "interest_level": 0.9,
                "reading_speed": "slow",
                "interaction_type": "analytical",
                "share_probability": 0.3,
                "engagement_depth": "high"
            },
            "health": {
                "interest_level": 0.8,
                "reading_speed": "medium",
                "interaction_type": "careful",
                "share_probability": 0.6,
                "engagement_depth": "high"
            },
            "sports": {
                "interest_level": 0.7,
                "reading_speed": "fast",
                "interaction_type": "enthusiastic",
                "share_probability": 0.7,
                "engagement_depth": "medium"
            },
            "news": {
                "interest_level": 0.8,
                "reading_speed": "medium",
                "interaction_type": "informed",
                "share_probability": 0.5,
                "engagement_depth": "medium"
            },
            "travel": {
                "interest_level": 0.8,
                "reading_speed": "medium",
                "interaction_type": "exploratory",
                "share_probability": 0.7,
                "engagement_depth": "medium"
            }
        }
    
    def get_category_pattern(self, topic: str) -> Dict:
        """Get behavioral pattern for a specific category"""
        patterns = self.get_topic_categories_patterns()
        return patterns.get(topic, {
            "interest_level": 0.7,
            "reading_speed": "medium",
            "interaction_type": "general",
            "share_probability": 0.5,
            "engagement_depth": "medium"
        })
    
    def get_random_target_category(self) -> str:
        """Get a random target category using configured weights"""
        if not self.target_categories:
            return "general"
        
        if self.category_weights:
            # Use weighted selection
            categories = list(self.category_weights.keys())
            weights = list(self.category_weights.values())
            return random.choices(categories, weights=weights, k=1)[0]
        else:
            # Use uniform selection
            return random.choice(self.target_categories)
    
    def assess_complexity(self, content_data: Dict) -> str:
        """Assess content complexity level"""
        content = content_data.get("content", "")
        
        # Simple complexity indicators
        word_count = len(content.split())
        avg_word_length = sum(len(word) for word in content.split()) / word_count if word_count > 0 else 0
        sentence_count = len(re.split(r'[.!?]+', content))
        avg_sentence_length = word_count / sentence_count if sentence_count > 0 else 0
        
        # Complexity scoring
        complexity_score = 0
        
        # Word length factor
        if avg_word_length > 6:
            complexity_score += 2
        elif avg_word_length > 5:
            complexity_score += 1
        
        # Sentence length factor
        if avg_sentence_length > 20:
            complexity_score += 2
        elif avg_sentence_length > 15:
            complexity_score += 1
        
        # Content length factor
        if word_count > 1000:
            complexity_score += 1
        elif word_count > 500:
            complexity_score += 0.5
        
        # Determine complexity level
        if complexity_score >= 4:
            return "complex"
        elif complexity_score >= 2:
            return "moderate"
        else:
            return "simple"
    
    def assess_quality(self, content_data: Dict) -> float:
        """Assess content quality score"""
        quality_score = 0.5  # Base score
        
        # Content length factor
        content_length = len(content_data.get("content", ""))
        if content_length > 1000:
            quality_score += 0.1
        elif content_length < 100:
            quality_score -= 0.2
        
        # Title quality factor
        title = content_data.get("title", "")
        if len(title) > 10 and len(title) < 100:
            quality_score += 0.1
        else:
            quality_score -= 0.1
        
        # Keyword presence factor
        keywords = content_data.get("keywords", [])
        if len(keywords) > 0:
            quality_score += 0.1
        
        # Structure factor (headers, paragraphs)
        content = content_data.get("content", "")
        if "<h" in content or "##" in content:
            quality_score += 0.1
        
        # Links factor
        if "http" in content:
            quality_score += 0.05
        
        # Random variation
        quality_score += random.uniform(-0.1, 0.1)
        
        return max(0.0, min(1.0, quality_score))
    
    def calculate_engagement_potential(self, content_data: Dict) -> float:
        """Calculate content engagement potential"""
        engagement_score = 0.5  # Base score
        
        # Content type factor
        content_type = self.detect_content_type(content_data)
        type_patterns = self.content_patterns["content_types"]
        if content_type in type_patterns:
            engagement_score += type_patterns[content_type]["interaction_probability"] * 0.3
        
        # Topic factor
        topic_category = self.categorize_topic(content_data)
        topic_patterns = self.content_patterns["topic_categories"]
        if topic_category in topic_patterns:
            engagement_score += topic_patterns[topic_category]["interest_level"] * 0.2
        
        # Quality factor
        quality_score = self.assess_quality(content_data)
        engagement_score += quality_score * 0.2
        
        # Trending factor
        trending_score = self.analyze_trending_factors(content_data)
        engagement_score += trending_score * 0.1
        
        # Random variation
        engagement_score += random.uniform(-0.1, 0.1)
        
        return max(0.0, min(1.0, engagement_score))
    
    def calculate_reading_requirements(self, content_data: Dict) -> Dict:
        """Calculate reading requirements for content"""
        content = content_data.get("content", "")
        content_type = self.detect_content_type(content_data)
        complexity = self.assess_complexity(content_data)
        
        # Base reading time
        word_count = len(content.split())
        base_reading_time = word_count * 0.2  # 0.2 seconds per word
        
        # Adjust based on content type
        type_patterns = self.content_patterns["content_types"]
        if content_type in type_patterns:
            base_reading_time = type_patterns[content_type]["avg_reading_time"]
        
        # Adjust based on complexity
        complexity_patterns = self.content_patterns["complexity_levels"]
        if complexity in complexity_patterns:
            complexity_multiplier = {
                "simple": 0.8,
                "moderate": 1.0,
                "complex": 1.5
            }.get(complexity, 1.0)
            base_reading_time *= complexity_multiplier
        
        # Quality adjustment
        quality_score = self.assess_quality(content_data)
        if quality_score > 0.8:
            base_reading_time *= 1.2  # High quality content takes longer to read
        elif quality_score < 0.3:
            base_reading_time *= 0.7  # Low quality content is read faster
        
        return {
            "estimated_reading_time": int(base_reading_time),
            "word_count": word_count,
            "complexity_level": complexity,
            "comprehension_rate": complexity_patterns[complexity]["comprehension_rate"],
            "reread_probability": complexity_patterns[complexity]["reread_probability"],
            "note_taking_probability": complexity_patterns[complexity]["note_taking"]
        }
    
    def identify_interaction_opportunities(self, content_data: Dict) -> List[Dict]:
        """Identify potential interaction opportunities"""
        opportunities = []
        content = content_data.get("content", "")
        
        # Link interactions
        links = re.findall(r'<a[^>]+href="([^"]+)"', content)
        for link in links:
            opportunities.append({
                "type": "link_click",
                "target": link,
                "probability": 0.3,
                "position": "inline"
            })
        
        # Image interactions
        images = re.findall(r'<img[^>]+src="([^"]+)"', content)
        for image in images:
            opportunities.append({
                "type": "image_click",
                "target": image,
                "probability": 0.2,
                "position": "inline"
            })
        
        # Button interactions
        buttons = re.findall(r'<button[^>]*>([^<]+)</button>', content)
        for button in buttons:
            opportunities.append({
                "type": "button_click",
                "target": button,
                "probability": 0.4,
                "position": "inline"
            })
        
        # Social sharing opportunities
        if self.assess_quality(content_data) > 0.6:
            opportunities.append({
                "type": "social_share",
                "target": "general",
                "probability": 0.2,
                "position": "end"
            })
        
        # Comment opportunities
        if self.calculate_engagement_potential(content_data) > 0.7:
            opportunities.append({
                "type": "comment",
                "target": "content",
                "probability": 0.15,
                "position": "end"
            })
        
        return opportunities
    
    def assess_context_relevance(self, content_data: Dict) -> float:
        """Assess how relevant content is to current context"""
        relevance_score = 0.5  # Base relevance
        
        # Check if content matches user interests (from context memory)
        user_interests = self.context_memory.get("user_interests", [])
        content_keywords = content_data.get("keywords", [])
        
        if user_interests and content_keywords:
            matches = sum(1 for interest in user_interests if interest in content_keywords)
            relevance_score += (matches / len(user_interests)) * 0.3
        
        # Check if content matches recent browsing history
        recent_topics = [item["analysis"]["topic_category"] for item in self.content_history[-5:]]
        current_topic = self.categorize_topic(content_data)
        
        if current_topic in recent_topics:
            relevance_score += 0.2
        
        # Check temporal relevance
        if "breaking" in content_data.get("title", "").lower():
            relevance_score += 0.1
        
        return min(1.0, relevance_score)
    
    def analyze_trending_factors(self, content_data: Dict) -> float:
        """Analyze trending factors in content"""
        trending_score = 0.0
        
        title = content_data.get("title", "").lower()
        content = content_data.get("content", "").lower()
        
        # Trending keywords
        trending_keywords = [
            "breaking", "viral", "trending", "latest", "new", "update",
            "just in", "exclusive", "first", "announcement"
        ]
        
        for keyword in trending_keywords:
            if keyword in title:
                trending_score += 0.2
            if keyword in content:
                trending_score += 0.1
        
        # Social proof indicators
        social_indicators = [
            "popular", "viral", "shared", "liked", "trending",
            "most viewed", "top", "best", "recommended"
        ]
        
        for indicator in social_indicators:
            if indicator in title or indicator in content:
                trending_score += 0.1
        
        return min(1.0, trending_score)
    
    def assess_user_intent_matching(self, content_data: Dict) -> float:
        """Assess how well content matches user intent"""
        intent_score = 0.5  # Base score
        
        # Get user intent from context memory
        user_intent = self.context_memory.get("user_intent", "browsing")
        
        # Intent matching patterns
        intent_patterns = {
            "information_seeking": ["how to", "what is", "guide", "tutorial", "explain"],
            "entertainment": ["fun", "amazing", "incredible", "awesome", "wow"],
            "shopping": ["buy", "price", "deal", "sale", "discount"],
            "news": ["breaking", "latest", "update", "announcement", "news"]
        }
        
        if user_intent in intent_patterns:
            keywords = intent_patterns[user_intent]
            title = content_data.get("title", "").lower()
            content = content_data.get("content", "").lower()
            
            matches = sum(1 for keyword in keywords if keyword in title or keyword in content)
            intent_score += (matches / len(keywords)) * 0.3
        
        return min(1.0, intent_score)
    
    def generate_adaptive_behavior(self, content_analysis: Dict, user_profile: Dict) -> Dict:
        """Generate adaptive behavior based on content analysis"""
        adaptive_behavior = {
            "reading_style": self.select_reading_style(content_analysis, user_profile),
            "interaction_strategy": self.select_interaction_strategy(content_analysis, user_profile),
            "attention_pattern": self.select_attention_pattern(content_analysis, user_profile),
            "timing_adjustments": self.calculate_timing_adjustments(content_analysis),
            "engagement_level": self.determine_engagement_level(content_analysis, user_profile)
        }
        
        return adaptive_behavior
    
    def select_reading_style(self, content_analysis: Dict, user_profile: Dict) -> str:
        """Select appropriate reading style based on content and user"""
        complexity = content_analysis["complexity_level"]
        quality = content_analysis["quality_score"]
        topic = content_analysis["topic_category"]
        
        # Complexity-based selection
        if complexity == "complex":
            return "thorough"
        elif complexity == "simple":
            return "skimmer"
        else:
            # Quality and topic-based selection
            if quality > 0.8 and topic in ["business", "education"]:
                return "thorough"
            elif quality < 0.4:
                return "skimmer"
            else:
                return "selective"
    
    def select_interaction_strategy(self, content_analysis: Dict, user_profile: Dict) -> str:
        """Select interaction strategy based on content analysis"""
        engagement_potential = content_analysis["engagement_potential"]
        interaction_opportunities = len(content_analysis["interaction_opportunities"])
        
        if engagement_potential > 0.8 and interaction_opportunities > 3:
            return "high_engagement"
        elif engagement_potential > 0.6:
            return "moderate_engagement"
        else:
            return "low_engagement"
    
    def select_attention_pattern(self, content_analysis: Dict, user_profile: Dict) -> str:
        """Select attention pattern based on content analysis"""
        complexity = content_analysis["complexity_level"]
        reading_time = content_analysis["reading_requirements"]["estimated_reading_time"]
        
        if complexity == "complex" or reading_time > 600:  # 10+ minutes
            return "focused"
        elif complexity == "simple" and reading_time < 180:  # < 3 minutes
            return "easily_distracted"
        else:
            return "adaptive"
    
    def calculate_timing_adjustments(self, content_analysis: Dict) -> Dict:
        """Calculate timing adjustments for content"""
        reading_requirements = content_analysis["reading_requirements"]
        complexity = content_analysis["complexity_level"]
        quality = content_analysis["quality_score"]
        
        base_time = reading_requirements["estimated_reading_time"]
        
        # Adjust based on complexity
        complexity_multipliers = {
            "simple": 0.8,
            "moderate": 1.0,
            "complex": 1.4
        }
        
        adjusted_time = base_time * complexity_multipliers.get(complexity, 1.0)
        
        # Adjust based on quality
        if quality > 0.8:
            adjusted_time *= 1.2  # High quality takes longer
        elif quality < 0.3:
            adjusted_time *= 0.7  # Low quality is faster
        
        return {
            "adjusted_reading_time": int(adjusted_time),
            "pause_frequency": "high" if complexity == "complex" else "medium",
            "break_probability": 0.3 if adjusted_time > 300 else 0.1,
            "reread_sections": complexity == "complex"
        }
    
    def determine_engagement_level(self, content_analysis: Dict, user_profile: Dict) -> str:
        """Determine appropriate engagement level"""
        engagement_potential = content_analysis["engagement_potential"]
        context_relevance = content_analysis["context_relevance"]
        user_intent_matching = content_analysis["user_intent_matching"]
        
        # Calculate engagement score
        engagement_score = (engagement_potential + context_relevance + user_intent_matching) / 3
        
        if engagement_score > 0.7:
            return "high_engagement"
        elif engagement_score > 0.4:
            return "moderate_engagement"
        else:
            return "low_engagement"
    
    def update_context_memory(self, content_analysis: Dict, user_behavior: Dict):
        """Update context memory with new information"""
        # Update user interests
        topic = content_analysis["topic_category"]
        if "user_interests" not in self.context_memory:
            self.context_memory["user_interests"] = []
        
        if topic not in self.context_memory["user_interests"]:
            self.context_memory["user_interests"].append(topic)
        
        # Update reading preferences
        reading_style = user_behavior.get("reading_style", "selective")
        if "reading_preferences" not in self.context_memory:
            self.context_memory["reading_preferences"] = []
        
        if reading_style not in self.context_memory["reading_preferences"]:
            self.context_memory["reading_preferences"].append(reading_style)
        
        # Update interaction patterns
        interaction_strategy = user_behavior.get("interaction_strategy", "moderate_engagement")
        if "interaction_patterns" not in self.context_memory:
            self.context_memory["interaction_patterns"] = []
        
        if interaction_strategy not in self.context_memory["interaction_patterns"]:
            self.context_memory["interaction_patterns"].append(interaction_strategy)
    
    def get_content_intelligence_summary(self) -> Dict:
        """Get summary of content intelligence analysis"""
        if not self.content_history:
            return {"total_analyses": 0}
        
        # Calculate statistics
        total_analyses = len(self.content_history)
        content_types = defaultdict(int)
        topic_categories = defaultdict(int)
        quality_scores = []
        engagement_scores = []
        
        for item in self.content_history:
            analysis = item["analysis"]
            content_types[analysis["content_type"]] += 1
            topic_categories[analysis["topic_category"]] += 1
            quality_scores.append(analysis["quality_score"])
            engagement_scores.append(analysis["engagement_potential"])
        
        return {
            "total_analyses": total_analyses,
            "content_types": dict(content_types),
            "topic_categories": dict(topic_categories),
            "average_quality_score": sum(quality_scores) / len(quality_scores) if quality_scores else 0,
            "average_engagement_score": sum(engagement_scores) / len(engagement_scores) if engagement_scores else 0,
            "context_memory": self.context_memory,
            "recent_analyses": self.content_history[-5:] if self.content_history else []
        }
