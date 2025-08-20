"""
Dynamic Entry Manager
Provides dynamic entry point management for realistic traffic simulation
"""

import random
import time
import json
import requests
from typing import Dict, List, Optional, Tuple, Any
import logging
from datetime import datetime, timedelta
from collections import defaultdict, deque
from urllib.parse import urlparse, parse_qs, urlencode
import re

class EntryPointType:
    """Entry point types for traffic simulation"""
    DIRECT = "direct"
    SEARCH_ENGINE = "search_engine"
    SOCIAL_MEDIA = "social_media"
    REFERRAL = "referral"
    EMAIL = "email"
    BOOKMARK = "bookmark"
    PAID_ADS = "paid_ads"
    ORGANIC_SOCIAL = "organic_social"
    NEWS_AGGREGATOR = "news_aggregator"
    FORUM = "forum"
    BLOG_COMMENT = "blog_comment"
    INFLUENCER = "influencer"

class DynamicEntryManager:
    """Manages dynamic entry points for realistic traffic simulation"""
    
    def __init__(self, config: Dict):
        self.config = config
        self.logger = logging.getLogger(__name__)
        
        # Load custom keywords configuration
        self.custom_keywords_config = config.get("dynamic_entry_points", {}).get("custom_keywords", {})
        self.custom_keywords_enabled = self.custom_keywords_config.get("enabled", False)
        self.custom_keywords_file = self.custom_keywords_config.get("keywords_file", "config/keywords.json")
        self.fallback_to_categories = self.custom_keywords_config.get("fallback_to_categories", True)
        self.merge_with_categories = self.custom_keywords_config.get("merge_with_categories", False)
        self.keywords_per_category = self.custom_keywords_config.get("keywords_per_category", 10)
        self.custom_search_engines = self.custom_keywords_config.get("custom_search_engines", [])
        
        # Load custom referrer domains configuration
        self.custom_referrer_config = config.get("dynamic_entry_points", {}).get("custom_referrer_domains", {})
        self.custom_referrer_enabled = self.custom_referrer_config.get("enabled", False)
        self.custom_referrer_file = self.custom_referrer_config.get("referrer_file", "config/referrer_domains.json")
        self.fallback_to_defaults = self.custom_referrer_config.get("fallback_to_defaults", True)
        self.merge_with_defaults = self.custom_referrer_config.get("merge_with_defaults", False)
        self.domains_per_category = self.custom_referrer_config.get("domains_per_category", 15)
        self.geo_specific = self.custom_referrer_config.get("geo_specific", True)
        
        # Entry point strategies
        self.entry_strategies = self.load_entry_strategies()
        self.traffic_sources = self.load_traffic_sources()
        self.entry_patterns = self.load_entry_patterns()
        
        # Dynamic tracking
        self.entry_history = deque(maxlen=1000)
        self.traffic_analytics = defaultdict(list)
        self.entry_performance = {}
        
        # Real-time adaptation
        self.current_strategy = None
        self.entry_rotation = True
        
        # Log custom keywords configuration
        if self.custom_keywords_enabled:
            self.logger.info(f"Custom keywords enabled: {self.custom_keywords_file}")
            if self.custom_search_engines:
                self.logger.info(f"Custom search engines: {', '.join(self.custom_search_engines)}")
        else:
            self.logger.info("Using default keywords from target categories")
        
        # Log custom referrer domains configuration
        if self.custom_referrer_enabled:
            self.logger.info(f"Custom referrer domains enabled: {self.custom_referrer_file}")
            if self.geo_specific:
                self.logger.info("Geo-specific referrer domains enabled")
        else:
            self.logger.info("Using default referrer domains")
        
    def load_entry_strategies(self) -> Dict:
        """Load comprehensive entry point strategies"""
        # Get search engines based on custom configuration
        search_engines = self.custom_search_engines if self.custom_search_engines else ["google", "bing", "yahoo", "duckduckgo"]
        
        return {
            "organic_search": {
                "weight": 0.35,  # 35% of traffic
                "sources": search_engines,
                "patterns": {
                    "keywords": self.generate_search_keywords(),
                    "search_types": ["web", "news", "images", "videos"],
                    "search_positions": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                    "click_probability": {
                        1: 0.32, 2: 0.18, 3: 0.12, 4: 0.08, 5: 0.06,
                        6: 0.05, 7: 0.04, 8: 0.03, 9: 0.02, 10: 0.01
                    }
                }
            },
            "social_media": {
                "weight": 0.25,  # 25% of traffic
                "sources": ["facebook", "twitter", "instagram", "linkedin", "pinterest", "tiktok"],
                "patterns": {
                    "content_types": ["post", "story", "reel", "tweet", "pin"],
                    "engagement_levels": ["high", "medium", "low"],
                    "viral_probability": 0.1,
                    "share_probability": 0.3
                }
            },
            "direct_traffic": {
                "weight": 0.20,  # 20% of traffic
                "patterns": {
                    "bookmark_probability": 0.4,
                    "typo_probability": 0.1,
                    "memory_probability": 0.5
                }
            },
            "referral": {
                "weight": 0.15,  # 15% of traffic
                "sources": ["news_sites", "blogs", "forums", "email_newsletters"],
                "patterns": {
                    "link_types": ["text_link", "banner", "image_link", "button"],
                    "anchor_texts": self.generate_anchor_texts(),
                    "referrer_domains": self.generate_referrer_domains("US")  # Default geo location
                }
            },
            "paid_ads": {
                "weight": 0.05,  # 5% of traffic
                "sources": ["google_ads", "facebook_ads", "instagram_ads"],
                "patterns": {
                    "ad_positions": ["top", "side", "bottom"],
                    "click_rates": {"top": 0.08, "side": 0.03, "bottom": 0.02},
                    "quality_scores": [7, 8, 9, 10]
                }
            }
        }
    
    def load_traffic_sources(self) -> Dict:
        """Load realistic traffic sources"""
        # Get search engines based on custom configuration
        search_engines_config = self.get_search_engines_config()
        
        return {
            "search_engines": search_engines_config,
            "social_platforms": {
                "facebook": {
                    "base_url": "https://www.facebook.com",
                    "content_types": ["post", "story", "reel"],
                    "engagement_patterns": ["like", "share", "comment"],
                    "referrer_patterns": ["facebook.com", "fb.com", "m.facebook.com"]
                },
                "twitter": {
                    "base_url": "https://twitter.com",
                    "content_types": ["tweet", "retweet", "quote"],
                    "engagement_patterns": ["like", "retweet", "reply"],
                    "referrer_patterns": ["twitter.com", "t.co", "x.com"]
                },
                "instagram": {
                    "base_url": "https://www.instagram.com",
                    "content_types": ["post", "story", "reel", "igtv"],
                    "engagement_patterns": ["like", "comment", "share"],
                    "referrer_patterns": ["instagram.com", "ig.com"]
                },
                "linkedin": {
                    "base_url": "https://www.linkedin.com",
                    "content_types": ["post", "article", "poll"],
                    "engagement_patterns": ["like", "comment", "share"],
                    "referrer_patterns": ["linkedin.com", "lnkd.in"]
                }
            },
            "news_aggregators": {
                "reddit": {
                    "base_url": "https://www.reddit.com",
                    "subreddits": ["news", "technology", "business", "entertainment"],
                    "content_types": ["post", "comment"],
                    "referrer_patterns": ["reddit.com", "redd.it"]
                },
                "hackernews": {
                    "base_url": "https://news.ycombinator.com",
                    "content_types": ["story", "comment"],
                    "referrer_patterns": ["news.ycombinator.com", "hn.algolia.com"]
                }
            },
            "forums": {
                "kaskus": {
                    "base_url": "https://www.kaskus.co.id",
                    "forums": ["lounge", "jual-beli", "teknologi"],
                    "content_types": ["thread", "post"],
                    "referrer_patterns": ["kaskus.co.id", "kaskus.com"]
                }
            }
        }
    
    def load_entry_patterns(self) -> Dict:
        """Load realistic entry patterns"""
        return {
            "time_based_patterns": {
                "morning": {
                    "search_weight": 0.4,
                    "social_weight": 0.2,
                    "direct_weight": 0.3,
                    "referral_weight": 0.1
                },
                "afternoon": {
                    "search_weight": 0.3,
                    "social_weight": 0.3,
                    "direct_weight": 0.2,
                    "referral_weight": 0.2
                },
                "evening": {
                    "search_weight": 0.2,
                    "social_weight": 0.4,
                    "direct_weight": 0.2,
                    "referral_weight": 0.2
                },
                "night": {
                    "search_weight": 0.1,
                    "social_weight": 0.5,
                    "direct_weight": 0.3,
                    "referral_weight": 0.1
                }
            },
            "day_based_patterns": {
                "monday": {"search_heavy": True, "work_related": True},
                "tuesday": {"search_heavy": True, "work_related": True},
                "wednesday": {"balanced": True, "midweek": True},
                "thursday": {"social_heavy": True, "planning": True},
                "friday": {"social_heavy": True, "weekend_prep": True},
                "saturday": {"leisure_heavy": True, "entertainment": True},
                "sunday": {"leisure_heavy": True, "planning": True}
            },
            "seasonal_patterns": {
                "holiday_season": {"social_heavy": True, "shopping_related": True},
                "work_season": {"search_heavy": True, "productivity": True},
                "vacation_season": {"leisure_heavy": True, "travel_related": True}
            }
        }
    
    def generate_search_keywords(self) -> List[str]:
        """Generate search keywords with custom file support"""
        if self.custom_keywords_enabled:
            return self.load_custom_keywords()
        else:
            return self.generate_keywords_from_categories()
    
    def load_custom_keywords(self) -> List[str]:
        """Load keywords from custom keywords file"""
        try:
            with open(self.custom_keywords_file, 'r', encoding='utf-8') as f:
                custom_keywords_data = json.load(f)
            
            all_keywords = []
            
            if self.merge_with_categories:
                # Merge custom keywords with category keywords
                category_keywords = self.generate_keywords_from_categories()
                all_keywords.extend(category_keywords)
            
            # Add custom keywords
            for category, keywords in custom_keywords_data.items():
                if isinstance(keywords, list):
                    # Limit keywords per category if configured
                    if self.keywords_per_category > 0:
                        keywords = keywords[:self.keywords_per_category]
                    all_keywords.extend(keywords)
            
            self.logger.info(f"Loaded {len(all_keywords)} custom keywords from {self.custom_keywords_file}")
            return all_keywords
            
        except FileNotFoundError:
            self.logger.warning(f"Custom keywords file not found: {self.custom_keywords_file}")
            if self.fallback_to_categories:
                self.logger.info("Falling back to category-based keywords")
                return self.generate_keywords_from_categories()
            else:
                return []
        except Exception as e:
            self.logger.error(f"Error loading custom keywords: {str(e)}")
            if self.fallback_to_categories:
                self.logger.info("Falling back to category-based keywords")
                return self.generate_keywords_from_categories()
            else:
                return []
    
    def generate_keywords_from_categories(self) -> List[str]:
        """Generate search keywords based on target categories"""
        # Get target categories from config
        content_analysis_config = self.config.get("content_analysis", {})
        target_categories = content_analysis_config.get("target_categories", [
            "technology", "lifestyle", "business", "entertainment", "education"
        ])
        
        # Generate keywords for each category
        all_keywords = []
        for category in target_categories:
            category_keywords = self.generate_category_keywords(category)
            all_keywords.extend(category_keywords)
        
        return all_keywords
    
    def generate_category_keywords(self, category: str) -> List[str]:
        """Generate keywords for a specific category"""
        category_keywords = {
            "technology": [
                "artificial intelligence", "machine learning", "blockchain", "cloud computing",
                "cybersecurity", "data science", "web development", "mobile apps",
                "software engineering", "digital transformation", "IoT", "virtual reality"
            ],
            "lifestyle": [
                "healthy living", "fitness tips", "nutrition advice", "mental wellness",
                "workout routines", "diet plans", "stress management", "work-life balance",
                "personal development", "mindfulness", "home organization", "fashion trends"
            ],
            "business": [
                "entrepreneurship", "business strategy", "marketing tactics", "financial planning",
                "leadership skills", "startup advice", "investment tips", "sales techniques",
                "business growth", "management skills", "digital marketing", "brand building"
            ],
            "entertainment": [
                "movie reviews", "music releases", "gaming news", "celebrity gossip",
                "TV shows", "streaming services", "concert tickets", "video games",
                "comedy shows", "theater performances", "podcast recommendations"
            ],
            "education": [
                "online courses", "study tips", "academic writing", "research methods",
                "learning strategies", "skill development", "certification programs",
                "tutorial videos", "educational resources", "student life", "career guidance"
            ],
            "finance": [
                "personal finance", "investment strategies", "stock market", "cryptocurrency",
                "retirement planning", "tax advice", "budgeting tips", "credit management",
                "insurance options", "real estate investment", "financial planning"
            ],
            "health": [
                "medical advice", "healthcare tips", "disease prevention", "treatment options",
                "mental health", "nutrition facts", "exercise benefits", "wellness programs",
                "healthcare technology", "medical research", "alternative medicine"
            ],
            "sports": [
                "football news", "basketball updates", "tennis tournaments", "soccer matches",
                "baseball games", "golf championships", "swimming competitions", "running events",
                "fitness training", "sports betting", "athlete profiles"
            ],
            "news": [
                "breaking news", "current events", "political updates", "world news",
                "local news", "business news", "technology news", "sports news",
                "entertainment news", "health news", "science news"
            ],
            "travel": [
                "vacation destinations", "travel tips", "hotel bookings", "flight deals",
                "travel insurance", "tourist attractions", "travel planning", "backpacking tips",
                "luxury travel", "budget travel", "travel photography"
            ]
        }
        
        return category_keywords.get(category, [
            "how to", "best practices", "tips and tricks", "product reviews",
            "comparison guides", "tutorial videos", "expert advice", "industry insights"
        ])
    
    def get_search_engines_config(self) -> Dict:
        """Get search engines configuration based on custom settings"""
        all_search_engines = {
            "google": {
                "base_url": "https://www.google.com/search",
                "parameters": ["q", "hl", "gl", "source", "ie"],
                "user_agents": self.get_search_user_agents(),
                "referrer_patterns": ["google.com", "google.co.id", "google.com.my"]
            },
            "bing": {
                "base_url": "https://www.bing.com/search",
                "parameters": ["q", "cc", "setlang"],
                "user_agents": self.get_search_user_agents(),
                "referrer_patterns": ["bing.com", "bing.com/id"]
            },
            "yahoo": {
                "base_url": "https://search.yahoo.com/search",
                "parameters": ["p", "fr", "ei"],
                "user_agents": self.get_search_user_agents(),
                "referrer_patterns": ["yahoo.com", "search.yahoo.com"]
            },
            "duckduckgo": {
                "base_url": "https://duckduckgo.com/",
                "parameters": ["q", "t", "ia"],
                "user_agents": self.get_search_user_agents(),
                "referrer_patterns": ["duckduckgo.com"]
            }
        }
        
        # If custom search engines are configured, filter the available ones
        if self.custom_search_engines:
            filtered_engines = {}
            for engine in self.custom_search_engines:
                if engine in all_search_engines:
                    filtered_engines[engine] = all_search_engines[engine]
                else:
                    self.logger.warning(f"Unknown search engine: {engine}")
            
            if filtered_engines:
                self.logger.info(f"Using custom search engines: {', '.join(filtered_engines.keys())}")
                return filtered_engines
            else:
                self.logger.warning("No valid custom search engines found, using defaults")
        
        # Return all search engines if no custom configuration
        return all_search_engines
    
    def generate_anchor_texts(self) -> List[str]:
        """Generate realistic anchor texts"""
        return [
            "baca selengkapnya", "klik disini", "selengkapnya", "lanjutkan membaca",
            "artikel menarik", "tips berguna", "informasi penting", "panduan lengkap",
            "solusi terbaik", "rekomendasi", "review", "perbandingan",
            "cara mudah", "tutorial", "guide", "manual"
        ]
    
    def generate_referrer_domains(self, geo_location: str = "US") -> List[str]:
        """Generate referrer domains with custom file support"""
        if self.custom_referrer_enabled:
            return self.load_custom_referrer_domains(geo_location)
        else:
            return self.generate_default_referrer_domains(geo_location)
    
    def load_custom_referrer_domains(self, geo_location: str = "US") -> List[str]:
        """Load referrer domains from custom referrer domains file"""
        try:
            with open(self.custom_referrer_file, 'r', encoding='utf-8') as f:
                custom_referrer_data = json.load(f)
            
            all_domains = []
            
            if self.merge_with_defaults:
                # Merge custom domains with default domains
                default_domains = self.generate_default_referrer_domains(geo_location)
                all_domains.extend(default_domains)
            
            # Add custom domains based on geo location if geo_specific is enabled
            if self.geo_specific:
                geo_domains = self.get_geo_specific_domains(custom_referrer_data, geo_location)
                all_domains.extend(geo_domains)
            
            # Add all domains from custom file
            for category, domains_data in custom_referrer_data.items():
                if isinstance(domains_data, dict):
                    # Handle nested structure (e.g., news_sites -> global/indonesia)
                    for subcategory, domains in domains_data.items():
                        if isinstance(domains, list):
                            # Limit domains per category if configured
                            if self.domains_per_category > 0:
                                domains = domains[:self.domains_per_category]
                            all_domains.extend(domains)
                elif isinstance(domains_data, list):
                    # Handle flat structure
                    domains = domains_data
                    if self.domains_per_category > 0:
                        domains = domains[:self.domains_per_category]
                    all_domains.extend(domains)
            
            # Remove duplicates while preserving order
            unique_domains = list(dict.fromkeys(all_domains))
            
            self.logger.info(f"Loaded {len(unique_domains)} custom referrer domains from {self.custom_referrer_file}")
            return unique_domains
            
        except FileNotFoundError:
            self.logger.warning(f"Custom referrer domains file not found: {self.custom_referrer_file}")
            if self.fallback_to_defaults:
                self.logger.info("Falling back to default referrer domains")
                return self.generate_default_referrer_domains(geo_location)
            else:
                return []
        except Exception as e:
            self.logger.error(f"Error loading custom referrer domains: {str(e)}")
            if self.fallback_to_defaults:
                self.logger.info("Falling back to default referrer domains")
                return self.generate_default_referrer_domains(geo_location)
            else:
                return []
    
    def get_geo_specific_domains(self, referrer_data: Dict, geo_location: str) -> List[str]:
        """Get geo-specific domains based on proxy location"""
        geo_domains = []
        geo_mapping = {
            "US": "global",
            "ID": "indonesia",
            "SG": "singapore", 
            "MY": "malaysia",
            "UK": "global",
            "AU": "global",
            "CA": "global"
        }
        
        geo_key = geo_mapping.get(geo_location, "global")
        
        # Look for geo-specific domains in each category
        for category, domains_data in referrer_data.items():
            if isinstance(domains_data, dict):
                if geo_key in domains_data and isinstance(domains_data[geo_key], list):
                    domains = domains_data[geo_key]
                    if self.domains_per_category > 0:
                        domains = domains[:self.domains_per_category]
                    geo_domains.extend(domains)
                elif "global" in domains_data and isinstance(domains_data["global"], list):
                    # Fallback to global domains
                    domains = domains_data["global"]
                    if self.domains_per_category > 0:
                        domains = domains[:self.domains_per_category]
                    geo_domains.extend(domains)
        
        return geo_domains
    
    def generate_default_referrer_domains(self, geo_location: str = "US") -> List[str]:
        """Generate default referrer domains based on geo location"""
        if geo_location == "ID":
            return [
                # Indonesian news sites
                "detik.com", "kompas.com", "tribunnews.com", "liputan6.com",
                "cnnindonesia.com", "tempo.co", "viva.co.id", "merdeka.com",
                
                # Global platforms
                "blogger.com", "wordpress.com", "medium.com", "substack.com",
                "ghost.org", "wix.com", "squarespace.com",
                
                # Indonesian forums
                "kaskus.co.id", "indonesiaindonesia.com", "forum.detik.com",
                "kompasiana.com", "vemale.com", "fimela.com",
                
                # Email newsletters
                "mailchimp.com", "convertkit.com", "substack.com", "revue.com"
            ]
        else:
            return [
                # Global news sites
                "cnn.com", "bbc.com", "reuters.com", "bloomberg.com",
                "wsj.com", "nytimes.com", "guardian.com", "forbes.com",
                
                # Blogs
                "blogger.com", "wordpress.com", "medium.com", "substack.com",
                "ghost.org", "wix.com", "squarespace.com",
                
                # Forums
                "reddit.com", "stackoverflow.com", "quora.com", "github.com",
                
                # Email newsletters
                "mailchimp.com", "convertkit.com", "substack.com", "revue.com"
            ]
    
    def get_search_user_agents(self) -> List[str]:
        """Get realistic search user agents"""
        return [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/120.0.0.0"
        ]
    
    def generate_dynamic_entry_point(self, target_url: str, user_profile: Dict = None) -> Dict:
        """Generate dynamic entry point based on context"""
        # Get current temporal context
        current_time = datetime.now()
        time_of_day = self.get_time_of_day(current_time.hour)
        day_of_week = current_time.strftime("%A").lower()
        
        # Select entry strategy based on temporal patterns
        strategy = self.select_entry_strategy(time_of_day, day_of_week, user_profile)
        
        # Generate entry point based on strategy
        entry_point = self.generate_entry_point(strategy, target_url, user_profile)
        
        # Add temporal context
        entry_point["temporal_context"] = {
            "time_of_day": time_of_day,
            "day_of_week": day_of_week,
            "hour": current_time.hour,
            "season": self.get_current_season(current_time.month)
        }
        
        # Store entry history
        self.entry_history.append({
            "timestamp": current_time,
            "entry_point": entry_point,
            "strategy": strategy
        })
        
        return entry_point
    
    def select_entry_strategy(self, time_of_day: str, day_of_week: str, user_profile: Dict = None) -> str:
        """Select appropriate entry strategy based on context"""
        # Get time-based weights
        time_patterns = self.entry_patterns["time_based_patterns"]
        day_patterns = self.entry_patterns["day_based_patterns"]
        
        # Adjust weights based on time of day
        base_weights = time_patterns.get(time_of_day, {
            "search_weight": 0.3,
            "social_weight": 0.3,
            "direct_weight": 0.2,
            "referral_weight": 0.2
        })
        
        # Adjust based on day of week
        day_pattern = day_patterns.get(day_of_week, {})
        if day_pattern.get("search_heavy"):
            base_weights["search_weight"] *= 1.3
            base_weights["social_weight"] *= 0.8
        elif day_pattern.get("social_heavy"):
            base_weights["social_weight"] *= 1.3
            base_weights["search_weight"] *= 0.8
        
        # Adjust based on user profile
        if user_profile:
            personality = user_profile.get("personality_type", "casual")
            if personality == "professional":
                base_weights["search_weight"] *= 1.2
                base_weights["direct_weight"] *= 1.1
            elif personality == "social_butterfly":
                base_weights["social_weight"] *= 1.3
                base_weights["search_weight"] *= 0.7
        
        # Normalize weights
        total_weight = sum(base_weights.values())
        normalized_weights = {k: v/total_weight for k, v in base_weights.items()}
        
        # Select strategy based on weights
        strategies = list(normalized_weights.keys())
        weights = list(normalized_weights.values())
        
        selected_strategy = random.choices(strategies, weights=weights)[0]
        
        return selected_strategy
    
    def generate_entry_point(self, strategy: str, target_url: str, user_profile: Dict = None) -> Dict:
        """Generate specific entry point based on strategy"""
        if strategy == "organic_search":
            return self.generate_search_entry(target_url, user_profile)
        elif strategy == "social_media":
            return self.generate_social_entry(target_url, user_profile)
        elif strategy == "direct_traffic":
            return self.generate_direct_entry(target_url, user_profile)
        elif strategy == "referral":
            return self.generate_referral_entry(target_url, user_profile)
        elif strategy == "paid_ads":
            return self.generate_paid_entry(target_url, user_profile)
        else:
            return self.generate_direct_entry(target_url, user_profile)
    
    def generate_search_entry(self, target_url: str, user_profile: Dict = None) -> Dict:
        """Generate search engine entry point"""
        search_engines = self.traffic_sources["search_engines"]
        search_engine = random.choice(list(search_engines.keys()))
        engine_config = search_engines[search_engine]
        
        # Generate search keyword
        keywords = self.entry_strategies["organic_search"]["patterns"]["keywords"]
        keyword = random.choice(keywords)
        
        # Generate search URL
        search_params = {
            "q": keyword,
            "hl": "id",
            "gl": "id",
            "source": "hp",
            "ie": "UTF-8"
        }
        
        search_url = f"{engine_config['base_url']}?{urlencode(search_params)}"
        
        # Generate referrer
        referrer_patterns = engine_config["referrer_patterns"]
        referrer = f"https://{random.choice(referrer_patterns)}"
        
        return {
            "type": EntryPointType.SEARCH_ENGINE,
            "source": search_engine,
            "entry_url": search_url,
            "referrer": referrer,
            "keyword": keyword,
            "search_position": random.randint(1, 10),
            "user_agent": random.choice(engine_config["user_agents"]),
            "click_through": True,
            "search_type": random.choice(["web", "news", "images"]),
            "session_data": {
                "search_query": keyword,
                "search_engine": search_engine,
                "search_position": random.randint(1, 10),
                "time_on_search": random.randint(2, 15)
            }
        }
    
    def generate_social_entry(self, target_url: str, user_profile: Dict = None) -> Dict:
        """Generate social media entry point"""
        social_platforms = self.traffic_sources["social_platforms"]
        platform = random.choice(list(social_platforms.keys()))
        platform_config = social_platforms[platform]
        
        # Generate social content
        content_type = random.choice(platform_config["content_types"])
        engagement_type = random.choice(platform_config["engagement_patterns"])
        
        # Generate social URL
        social_url = f"{platform_config['base_url']}/post/{random.randint(1000000, 9999999)}"
        
        # Generate referrer
        referrer_patterns = platform_config["referrer_patterns"]
        referrer = f"https://{random.choice(referrer_patterns)}"
        
        return {
            "type": EntryPointType.SOCIAL_MEDIA,
            "source": platform,
            "entry_url": social_url,
            "referrer": referrer,
            "content_type": content_type,
            "engagement_type": engagement_type,
            "viral_probability": self.entry_strategies["social_media"]["patterns"]["viral_probability"],
            "user_agent": self.get_social_user_agent(platform),
            "click_through": True,
            "session_data": {
                "social_platform": platform,
                "content_type": content_type,
                "engagement_level": random.choice(["high", "medium", "low"]),
                "time_on_social": random.randint(5, 30)
            }
        }
    
    def generate_direct_entry(self, target_url: str, user_profile: Dict = None) -> Dict:
        """Generate direct traffic entry point"""
        patterns = self.entry_strategies["direct_traffic"]["patterns"]
        
        # Determine direct access type
        if random.random() < patterns["bookmark_probability"]:
            access_type = "bookmark"
        elif random.random() < patterns["typo_probability"]:
            access_type = "typo"
        else:
            access_type = "memory"
        
        return {
            "type": EntryPointType.DIRECT,
            "source": "direct",
            "entry_url": target_url,
            "referrer": "",
            "access_type": access_type,
            "user_agent": random.choice(self.get_search_user_agents()),
            "click_through": False,
            "session_data": {
                "access_type": access_type,
                "is_returning_visitor": random.choice([True, False]),
                "bookmark_access": access_type == "bookmark"
            }
        }
    
    def generate_referral_entry(self, target_url: str, user_profile: Dict = None) -> Dict:
        """Generate referral entry point"""
        patterns = self.entry_strategies["referral"]["patterns"]
        
        # Select referrer domain
        referrer_domain = random.choice(patterns["referrer_domains"])
        anchor_text = random.choice(patterns["anchor_texts"])
        link_type = random.choice(patterns["link_types"])
        
        # Generate referrer URL
        referrer_url = f"https://{referrer_domain}/article/{random.randint(1000, 9999)}"
        
        return {
            "type": EntryPointType.REFERRAL,
            "source": referrer_domain,
            "entry_url": referrer_url,
            "referrer": referrer_url,
            "anchor_text": anchor_text,
            "link_type": link_type,
            "user_agent": random.choice(self.get_search_user_agents()),
            "click_through": True,
            "session_data": {
                "referrer_domain": referrer_domain,
                "anchor_text": anchor_text,
                "link_type": link_type,
                "time_on_referrer": random.randint(10, 60)
            }
        }
    
    def generate_paid_entry(self, target_url: str, user_profile: Dict = None) -> Dict:
        """Generate paid ads entry point"""
        patterns = self.entry_strategies["paid_ads"]["patterns"]
        
        ad_position = random.choice(patterns["ad_positions"])
        click_rate = patterns["click_rates"][ad_position]
        quality_score = random.choice(patterns["quality_scores"])
        
        return {
            "type": EntryPointType.PAID_ADS,
            "source": "google_ads",
            "entry_url": target_url,
            "referrer": "https://www.google.com",
            "ad_position": ad_position,
            "click_rate": click_rate,
            "quality_score": quality_score,
            "user_agent": random.choice(self.get_search_user_agents()),
            "click_through": True,
            "session_data": {
                "ad_platform": "google_ads",
                "ad_position": ad_position,
                "quality_score": quality_score,
                "is_paid_traffic": True
            }
        }
    
    def get_social_user_agent(self, platform: str) -> str:
        """Get platform-specific user agent"""
        mobile_user_agents = [
            "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1.2 Mobile/15E148 Safari/604.1",
            "Mozilla/5.0 (Linux; Android 14; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
            "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0.6099.119 Mobile/15E148 Safari/604.1"
        ]
        
        desktop_user_agents = self.get_search_user_agents()
        
        # Social media is more mobile-heavy
        if random.random() < 0.7:
            return random.choice(mobile_user_agents)
        else:
            return random.choice(desktop_user_agents)
    
    def get_time_of_day(self, hour: int) -> str:
        """Get time of day category"""
        if 6 <= hour < 12:
            return "morning"
        elif 12 <= hour < 17:
            return "afternoon"
        elif 17 <= hour < 22:
            return "evening"
        else:
            return "night"
    
    def get_current_season(self, month: int) -> str:
        """Get current season"""
        if month in [12, 1, 2]:
            return "winter"
        elif month in [3, 4, 5]:
            return "spring"
        elif month in [6, 7, 8]:
            return "summer"
        else:
            return "autumn"
    
    def get_entry_analytics(self) -> Dict:
        """Get entry point analytics"""
        if not self.entry_history:
            return {"total_entries": 0}
        
        analytics = {
            "total_entries": len(self.entry_history),
            "strategy_distribution": defaultdict(int),
            "source_distribution": defaultdict(int),
            "time_distribution": defaultdict(int),
            "performance_metrics": {}
        }
        
        for entry in self.entry_history:
            strategy = entry["strategy"]
            source = entry["entry_point"]["source"]
            time_of_day = entry["entry_point"]["temporal_context"]["time_of_day"]
            
            analytics["strategy_distribution"][strategy] += 1
            analytics["source_distribution"][source] += 1
            analytics["time_distribution"][time_of_day] += 1
        
        return analytics
    
    def get_dynamic_entry_summary(self) -> Dict:
        """Get summary of dynamic entry management"""
        return {
            "total_entries": len(self.entry_history),
            "strategies_used": list(self.entry_strategies.keys()),
            "sources_available": len(self.traffic_sources),
            "current_strategy": self.current_strategy,
            "entry_rotation_enabled": self.entry_rotation,
            "analytics": self.get_entry_analytics()
        }
