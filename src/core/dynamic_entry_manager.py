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
        
    def load_entry_strategies(self) -> Dict:
        """Load comprehensive entry point strategies"""
        return {
            "organic_search": {
                "weight": 0.35,  # 35% of traffic
                "sources": ["google", "bing", "yahoo", "duckduckgo"],
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
                    "referrer_domains": self.generate_referrer_domains()
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
        return {
            "search_engines": {
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
                }
            },
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
        """Generate realistic search keywords"""
        return [
            # General keywords
            "artikel menarik", "tips dan trik", "berita terbaru", "informasi penting",
            "panduan lengkap", "cara mudah", "solusi terbaik", "update terbaru",
            
            # Topic-specific keywords
            "teknologi terbaru", "bisnis online", "investasi crypto", "kesehatan mental",
            "olahraga fitness", "masakan resep", "travel wisata", "pendidikan belajar",
            
            # Long-tail keywords
            "bagaimana cara membuat", "apa itu", "kapan waktu terbaik",
            "dimana tempat", "siapa yang", "mengapa penting",
            
            # Question-based keywords
            "cara apa", "tips bagaimana", "solusi untuk", "panduan lengkap",
            "review terbaru", "perbandingan", "rekomendasi terbaik"
        ]
    
    def generate_anchor_texts(self) -> List[str]:
        """Generate realistic anchor texts"""
        return [
            "baca selengkapnya", "klik disini", "selengkapnya", "lanjutkan membaca",
            "artikel menarik", "tips berguna", "informasi penting", "panduan lengkap",
            "solusi terbaik", "rekomendasi", "review", "perbandingan",
            "cara mudah", "tutorial", "guide", "manual"
        ]
    
    def generate_referrer_domains(self) -> List[str]:
        """Generate realistic referrer domains"""
        return [
            # News sites
            "detik.com", "kompas.com", "tribunnews.com", "liputan6.com",
            "cnnindonesia.com", "tempo.co", "viva.co.id", "merdeka.com",
            
            # Blogs
            "blogger.com", "wordpress.com", "medium.com", "substack.com",
            "ghost.org", "wix.com", "squarespace.com",
            
            # Forums
            "kaskus.co.id", "indonesiaindonesia.com", "forum.detik.com",
            "kompasiana.com", "vemale.com", "fimela.com",
            
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
