"""
Referer Simulator for Multilogin Profile Configuration
Generates realistic referer patterns for undetectable automation
"""

import random
import logging
from typing import Dict, List, Optional, Any
from urllib.parse import urlparse, parse_qs
import json
import os

class RefererSimulator:
    def __init__(self, config: Dict):
        """Initialize referer simulator with configuration"""
        self.config = config
        self.logger = logging.getLogger(__name__)
        
        # Load referer configuration
        self.referer_config = config.get("referer_simulation", {
            "enabled": True,
            "sources": [
                "google.com", "facebook.com", "twitter.com", "linkedin.com",
                "youtube.com", "reddit.com", "pinterest.com", "instagram.com",
                "bing.com", "duckduckgo.com", "yahoo.com", "quora.com",
                "medium.com", "dev.to"
            ],
            "keywords": [
                "technology", "business", "news", "entertainment", "sports",
                "health", "education", "finance", "lifestyle", "travel",
                "tech", "startup", "marketing", "design", "development"
            ],
            "probabilities": {
                "google": 0.6,      # 60% from Google
                "social": 0.25,     # 25% from social media
                "direct": 0.1,      # 10% direct traffic
                "other": 0.05       # 5% other sources
            },
            "social_probabilities": {
                "facebook": 0.3,
                "twitter": 0.2,
                "linkedin": 0.15,
                "youtube": 0.15,
                "reddit": 0.1,
                "pinterest": 0.05,
                "instagram": 0.05
            }
        })
        
        # Initialize referer statistics
        self.referer_stats = {
            "total_referers": 0,
            "referer_types": {},
            "sources": {},
            "keywords": {}
        }
    
    def generate_referer_for_profile(self, profile_personality: str = None, 
                                   geo_location: str = "US", 
                                   target_keyword: str = None) -> Dict:
        """Generate referer configuration for Multilogin profile"""
        try:
            # Determine referer type based on personality and geo
            referer_type = self._choose_referer_type(profile_personality, geo_location)
            
            if referer_type == "direct":
                return {
                    "type": "direct",
                    "referer": None,
                    "description": "Direct traffic (no referer)",
                    "probability": self.referer_config["probabilities"]["direct"]
                }
            
            # Generate referer URL based on type
            referer_url = self._generate_referer_url(referer_type, target_keyword, geo_location)
            
            # Create referer configuration for Multilogin
            referer_config = {
                "type": referer_type,
                "referer": referer_url,
                "description": f"Generated {referer_type} referer",
                "probability": self.referer_config["probabilities"].get(referer_type, 0.1),
                "multilogin_config": self._create_multilogin_referer_config(referer_url, referer_type)
            }
            
            # Update statistics
            self._update_referer_stats(referer_config)
            
            self.logger.info(f"🔗 Generated {referer_type} referer: {referer_url}")
            return referer_config
            
        except Exception as e:
            self.logger.error(f"Error generating referer: {e}")
            return {
                "type": "direct",
                "referer": None,
                "description": "Error fallback - direct traffic",
                "probability": 0.1
            }
    
    def _choose_referer_type(self, personality: str = None, geo_location: str = "US") -> str:
        """Choose referer type based on personality and geographic location"""
        try:
            # Personality-based referer preferences
            personality_preferences = {
                "explorer": {
                    "google": 0.4,    # More likely to use search
                    "social": 0.4,    # High social media usage
                    "direct": 0.15,   # Some direct traffic
                    "other": 0.05
                },
                "researcher": {
                    "google": 0.7,    # Heavy search usage
                    "social": 0.15,   # Less social
                    "direct": 0.1,    # Some direct
                    "other": 0.05
                },
                "casual": {
                    "google": 0.5,    # Moderate search
                    "social": 0.35,   # High social usage
                    "direct": 0.1,    # Some direct
                    "other": 0.05
                },
                "professional": {
                    "google": 0.6,    # Professional search usage
                    "social": 0.25,   # Moderate social
                    "direct": 0.1,    # Some direct
                    "other": 0.05
                }
            }
            
            # Geographic preferences
            geo_preferences = {
                "US": {
                    "google": 0.65,   # High Google usage in US
                    "social": 0.25,
                    "direct": 0.07,
                    "other": 0.03
                },
                "GB": {
                    "google": 0.6,    # High Google usage in UK
                    "social": 0.25,
                    "direct": 0.1,
                    "other": 0.05
                },
                "DE": {
                    "google": 0.5,    # Lower Google usage in Germany
                    "social": 0.2,    # Lower social usage
                    "direct": 0.2,    # Higher direct traffic
                    "other": 0.1      # Higher other sources
                },
                "CA": {
                    "google": 0.6,    # Similar to US
                    "social": 0.25,
                    "direct": 0.1,
                    "other": 0.05
                },
                "AU": {
                    "google": 0.6,    # Similar to US/UK
                    "social": 0.25,
                    "direct": 0.1,
                    "other": 0.05
                }
            }
            
            # Get preferences
            personality_prefs = personality_preferences.get(personality, personality_preferences["casual"])
            geo_prefs = geo_preferences.get(geo_location, geo_preferences["US"])
            
            # Combine preferences (50% personality, 50% geo)
            combined_prefs = {}
            for key in ["google", "social", "direct", "other"]:
                combined_prefs[key] = (personality_prefs.get(key, 0.25) + geo_prefs.get(key, 0.25)) / 2
            
            # Choose referer type based on probabilities
            rand = random.random()
            cumulative = 0
            
            for ref_type, prob in combined_prefs.items():
                cumulative += prob
                if rand <= cumulative:
                    return ref_type
            
            return "google"  # Default fallback
            
        except Exception as e:
            self.logger.error(f"Error choosing referer type: {e}")
            return "google"
    
    def _generate_referer_url(self, referer_type: str, target_keyword: str = None, 
                            geo_location: str = "US") -> str:
        """Generate realistic referer URL based on type"""
        try:
            if referer_type == "google":
                return self._generate_google_referer(target_keyword, geo_location)
            elif referer_type == "social":
                return self._generate_social_referer(target_keyword, geo_location)
            elif referer_type == "other":
                return self._generate_other_referer(target_keyword, geo_location)
            else:
                return None
                
        except Exception as e:
            self.logger.error(f"Error generating referer URL: {e}")
            return None
    
    def _generate_google_referer(self, target_keyword: str = None, geo_location: str = "US") -> str:
        """Generate Google search referer"""
        try:
            # Choose keyword
            if target_keyword:
                keyword = target_keyword
            else:
                keyword = random.choice(self.referer_config["keywords"])
            
            # Google domains by country
            google_domains = {
                "US": "google.com",
                "GB": "google.co.uk",
                "DE": "google.de",
                "CA": "google.ca",
                "AU": "google.com.au"
            }
            
            domain = google_domains.get(geo_location, "google.com")
            
            # Generate search query
            search_query = keyword.replace(" ", "+")
            
            # Add some random search terms for realism
            if random.random() < 0.3:
                additional_terms = ["best", "top", "latest", "guide", "tutorial", "review"]
                search_query += "+" + random.choice(additional_terms)
            
            # Generate referer URL
            referer_url = f"https://www.{domain}/search?q={search_query}"
            
            # Add random parameters for realism
            if random.random() < 0.5:
                referer_url += "&hl=en"
            if random.random() < 0.3:
                referer_url += "&source=hp"
            
            return referer_url
            
        except Exception as e:
            self.logger.error(f"Error generating Google referer: {e}")
            return "https://www.google.com/search?q=technology"
    
    def _generate_social_referer(self, target_keyword: str = None, geo_location: str = "US") -> str:
        """Generate social media referer"""
        try:
            # Choose social platform based on probabilities
            social_platforms = self.referer_config["social_probabilities"]
            platform = random.choices(
                list(social_platforms.keys()),
                weights=list(social_platforms.values())
            )[0]
            
            # Generate social media URLs
            social_urls = {
                "facebook": "https://www.facebook.com/",
                "twitter": "https://twitter.com/",
                "linkedin": "https://www.linkedin.com/",
                "youtube": "https://www.youtube.com/",
                "reddit": "https://www.reddit.com/",
                "pinterest": "https://www.pinterest.com/",
                "instagram": "https://www.instagram.com/"
            }
            
            base_url = social_urls.get(platform, "https://www.facebook.com/")
            
            # Add realistic paths
            if platform == "facebook":
                paths = ["", "feed/", "groups/", "pages/", "watch/"]
                base_url += random.choice(paths)
            elif platform == "twitter":
                paths = ["", "home", "explore", "notifications"]
                base_url += random.choice(paths)
            elif platform == "linkedin":
                paths = ["", "feed/", "jobs/", "learning/"]
                base_url += random.choice(paths)
            elif platform == "youtube":
                paths = ["", "feed/trending", "feed/subscriptions"]
                base_url += random.choice(paths)
            elif platform == "reddit":
                subreddits = ["technology", "programming", "business", "news", "entertainment"]
                base_url += f"r/{random.choice(subreddits)}/"
            
            return base_url
            
        except Exception as e:
            self.logger.error(f"Error generating social referer: {e}")
            return "https://www.facebook.com/"
    
    def _generate_other_referer(self, target_keyword: str = None, geo_location: str = "US") -> str:
        """Generate other search engine referer"""
        try:
            # Other search engines
            other_sources = [
                "https://www.bing.com/search?q=",
                "https://duckduckgo.com/?q=",
                "https://search.yahoo.com/search?p=",
                "https://www.quora.com/search?q=",
                "https://medium.com/search?q=",
                "https://dev.to/search?q="
            ]
            
            source = random.choice(other_sources)
            
            # Choose keyword
            if target_keyword:
                keyword = target_keyword
            else:
                keyword = random.choice(self.referer_config["keywords"])
            
            search_query = keyword.replace(" ", "+")
            return source + search_query
            
        except Exception as e:
            self.logger.error(f"Error generating other referer: {e}")
            return "https://www.bing.com/search?q=technology"
    
    def _create_multilogin_referer_config(self, referer_url: str, referer_type: str) -> Dict:
        """Create referer configuration for Multilogin profile"""
        try:
            if not referer_url:
                return {
                    "referer": None,
                    "referer_type": "direct"
                }
            
            # Parse referer URL
            parsed_url = urlparse(referer_url)
            
            # Create Multilogin referer configuration
            multilogin_config = {
                "referer": referer_url,
                "referer_type": referer_type,
                "domain": parsed_url.netloc,
                "path": parsed_url.path,
                "query": parsed_url.query,
                "protocol": parsed_url.scheme
            }
            
            # Add specific configuration based on referer type
            if referer_type == "google":
                multilogin_config.update({
                    "search_engine": "google",
                    "search_query": self._extract_search_query(referer_url),
                    "country_domain": self._extract_country_domain(parsed_url.netloc)
                })
            elif referer_type == "social":
                multilogin_config.update({
                    "social_platform": self._extract_social_platform(parsed_url.netloc),
                    "social_path": parsed_url.path
                })
            
            return multilogin_config
            
        except Exception as e:
            self.logger.error(f"Error creating Multilogin referer config: {e}")
            return {"referer": referer_url, "referer_type": referer_type}
    
    def _extract_search_query(self, referer_url: str) -> str:
        """Extract search query from referer URL"""
        try:
            parsed = urlparse(referer_url)
            query_params = parse_qs(parsed.query)
            
            # Handle different search engines
            if "q" in query_params:
                return query_params["q"][0]
            elif "p" in query_params:
                return query_params["p"][0]
            else:
                return ""
                
        except Exception as e:
            self.logger.debug(f"Error extracting search query: {e}")
            return ""
    
    def _extract_country_domain(self, domain: str) -> str:
        """Extract country domain from Google domain"""
        try:
            if "google.co.uk" in domain:
                return "UK"
            elif "google.de" in domain:
                return "DE"
            elif "google.ca" in domain:
                return "CA"
            elif "google.com.au" in domain:
                return "AU"
            else:
                return "US"
        except Exception:
            return "US"
    
    def _extract_social_platform(self, domain: str) -> str:
        """Extract social platform from domain"""
        try:
            if "facebook.com" in domain:
                return "facebook"
            elif "twitter.com" in domain:
                return "twitter"
            elif "linkedin.com" in domain:
                return "linkedin"
            elif "youtube.com" in domain:
                return "youtube"
            elif "reddit.com" in domain:
                return "reddit"
            elif "pinterest.com" in domain:
                return "pinterest"
            elif "instagram.com" in domain:
                return "instagram"
            else:
                return "unknown"
        except Exception:
            return "unknown"
    
    def _update_referer_stats(self, referer_config: Dict):
        """Update referer statistics"""
        try:
            self.referer_stats["total_referers"] += 1
            
            # Update referer type stats
            ref_type = referer_config["type"]
            self.referer_stats["referer_types"][ref_type] = self.referer_stats["referer_types"].get(ref_type, 0) + 1
            
            # Update source stats
            if referer_config.get("referer"):
                parsed_url = urlparse(referer_config["referer"])
                domain = parsed_url.netloc
                self.referer_stats["sources"][domain] = self.referer_stats["sources"].get(domain, 0) + 1
            
            # Update keyword stats
            if referer_config.get("multilogin_config", {}).get("search_query"):
                keyword = referer_config["multilogin_config"]["search_query"]
                self.referer_stats["keywords"][keyword] = self.referer_stats["keywords"].get(keyword, 0) + 1
                
        except Exception as e:
            self.logger.error(f"Error updating referer stats: {e}")
    
    def get_referer_statistics(self) -> Dict:
        """Get referer statistics"""
        return self.referer_stats.copy()
    
    def save_referer_statistics(self, filename: str = "data/referer_statistics.json"):
        """Save referer statistics to file"""
        try:
            os.makedirs("data", exist_ok=True)
            with open(filename, 'w') as f:
                json.dump(self.referer_stats, f, indent=2)
            self.logger.info(f"💾 Referer statistics saved to {filename}")
        except Exception as e:
            self.logger.error(f"Error saving referer statistics: {e}")
    
    def load_referer_statistics(self, filename: str = "data/referer_statistics.json"):
        """Load referer statistics from file"""
        try:
            if os.path.exists(filename):
                with open(filename, 'r') as f:
                    self.referer_stats = json.load(f)
                self.logger.info(f"📊 Referer statistics loaded from {filename}")
        except Exception as e:
            self.logger.error(f"Error loading referer statistics: {e}")
    
    def generate_referer_batch(self, count: int, personality: str = None, 
                             geo_location: str = "US") -> List[Dict]:
        """Generate batch of referers for multiple profiles"""
        try:
            referers = []
            for i in range(count):
                referer_config = self.generate_referer_for_profile(
                    personality, geo_location
                )
                referers.append(referer_config)
            
            self.logger.info(f"🔗 Generated {count} referer configurations")
            return referers
            
        except Exception as e:
            self.logger.error(f"Error generating referer batch: {e}")
            return []
