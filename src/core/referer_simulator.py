import random
import urllib.parse
from typing import List, Dict, Optional
import logging

class RefererSimulator:
    def __init__(self, config: Dict):
        self.config = config
        self.logger = logging.getLogger(__name__)
        self.referer_sources = config.get("referer_simulation", {}).get("sources", [])
        self.keywords = config.get("referer_simulation", {}).get("keywords", [])
        
        # Additional realistic referer patterns
        self.social_media_patterns = {
            "facebook": [
                "https://www.facebook.com/",
                "https://www.facebook.com/groups/{group_id}",
                "https://www.facebook.com/pages/{page_name}",
                "https://m.facebook.com/",
            ],
            "twitter": [
                "https://twitter.com/",
                "https://twitter.com/{username}/status/{tweet_id}",
                "https://mobile.twitter.com/",
            ],
            "instagram": [
                "https://www.instagram.com/",
                "https://www.instagram.com/p/{post_id}/",
                "https://www.instagram.com/explore/",
            ],
            "youtube": [
                "https://www.youtube.com/",
                "https://www.youtube.com/watch?v={video_id}",
                "https://www.youtube.com/results?search_query={query}",
            ],
            "reddit": [
                "https://www.reddit.com/",
                "https://www.reddit.com/r/{subreddit}/",
                "https://www.reddit.com/r/{subreddit}/comments/{post_id}/",
            ],
            "pinterest": [
                "https://www.pinterest.com/",
                "https://www.pinterest.com/pin/{pin_id}/",
                "https://www.pinterest.com/search/pins/?q={query}",
            ]
        }
        
        # Google search patterns
        self.google_patterns = [
            "https://www.google.com/search?q={query}",
            "https://www.google.com/search?q={query}&hl={language}",
            "https://www.google.com/search?q={query}&start={start}",
            "https://www.google.com/search?q={query}&source=hp",
            "https://www.google.com/search?q={query}&ie=utf-8",
        ]
    
    def generate_google_referer(self, target_keyword: str = None) -> str:
        """Generate realistic Google search referer"""
        if not target_keyword:
            target_keyword = random.choice(self.keywords)
        
        # Add some variation to the search query
        variations = [
            target_keyword,
            f"{target_keyword} 2024",
            f"{target_keyword} terbaru",
            f"cara {target_keyword}",
            f"tips {target_keyword}",
            f"informasi {target_keyword}",
        ]
        
        query = random.choice(variations)
        query = urllib.parse.quote(query)
        
        pattern = random.choice(self.google_patterns)
        
        # Add random parameters
        params = {}
        if "{language}" in pattern:
            params["language"] = random.choice(["id", "en", "id-ID"])
        if "{start}" in pattern:
            params["start"] = random.choice([0, 10, 20, 30])
        
        referer = pattern.format(query=query, **params)
        self.logger.info(f"Generated Google referer: {referer}")
        return referer
    
    def generate_social_media_referer(self) -> str:
        """Generate realistic social media referer"""
        platform = random.choice(list(self.social_media_patterns.keys()))
        patterns = self.social_media_patterns[platform]
        
        pattern = random.choice(patterns)
        
        # Generate realistic IDs/parameters
        if "{group_id}" in pattern:
            group_id = f"{random.randint(1000000, 9999999)}"
            pattern = pattern.replace("{group_id}", group_id)
        
        if "{page_name}" in pattern:
            page_names = ["berita-terkini", "tips-dan-trik", "informasi-penting", "update-terbaru"]
            page_name = random.choice(page_names)
            pattern = pattern.replace("{page_name}", page_name)
        
        if "{username}" in pattern:
            usernames = ["newsportal", "infoterkini", "beritahariini", "updateinfo"]
            username = random.choice(usernames)
            pattern = pattern.replace("{username}", username)
        
        if "{tweet_id}" in pattern:
            tweet_id = f"{random.randint(1000000000000000000, 9999999999999999999)}"
            pattern = pattern.replace("{tweet_id}", tweet_id)
        
        if "{post_id}" in pattern:
            post_id = f"{random.randint(1000000000000000000, 9999999999999999999)}"
            pattern = pattern.replace("{post_id}", post_id)
        
        if "{video_id}" in pattern:
            video_id = ''.join(random.choices('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_', k=11))
            pattern = pattern.replace("{video_id}", video_id)
        
        if "{subreddit}" in pattern:
            subreddits = ["indonesia", "news", "technology", "worldnews", "todayilearned"]
            subreddit = random.choice(subreddits)
            pattern = pattern.replace("{subreddit}", subreddit)
        
        if "{query}" in pattern:
            query = random.choice(self.keywords)
            query = urllib.parse.quote(query)
            pattern = pattern.replace("{query}", query)
        
        self.logger.info(f"Generated {platform} referer: {pattern}")
        return pattern
    
    def generate_direct_referer(self) -> str:
        """Generate direct traffic (no referer) - occasionally"""
        return ""  # Empty string for direct traffic
    
    def generate_referer(self, target_keyword: str = None) -> str:
        """Generate realistic referer based on probability distribution"""
        # Probability distribution for referer types
        referer_types = {
            "google": 0.45,      # 45% from Google
            "social": 0.35,      # 35% from social media
            "direct": 0.15,      # 15% direct traffic
            "other": 0.05        # 5% other sources
        }
        
        # Choose referer type based on probability
        rand = random.random()
        cumulative = 0
        
        for ref_type, prob in referer_types.items():
            cumulative += prob
            if rand <= cumulative:
                if ref_type == "google":
                    return self.generate_google_referer(target_keyword)
                elif ref_type == "social":
                    return self.generate_social_media_referer()
                elif ref_type == "direct":
                    return self.generate_direct_referer()
                else:
                    # Other sources (news sites, blogs, etc.)
                    other_sources = [
                        "https://www.detik.com/",
                        "https://www.kompas.com/",
                        "https://www.tempo.co/",
                        "https://www.antaranews.com/",
                        "https://www.republika.co.id/",
                    ]
                    return random.choice(other_sources)
        
        # Fallback to Google
        return self.generate_google_referer(target_keyword)
    
    def get_referer_headers(self, referer: str) -> Dict[str, str]:
        """Get complete headers for referer simulation"""
        headers = {}
        
        if referer:
            headers["Referer"] = referer
            
            # Add additional headers based on referer type
            if "google.com" in referer:
                headers["Accept"] = "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
                headers["Accept-Language"] = "id-ID,id;q=0.9,en;q=0.8"
                headers["Accept-Encoding"] = "gzip, deflate, br"
                headers["DNT"] = "1"
                headers["Upgrade-Insecure-Requests"] = "1"
            
            elif "facebook.com" in referer:
                headers["Accept"] = "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
                headers["Accept-Language"] = "id-ID,id;q=0.9,en;q=0.8"
                headers["Sec-Fetch-Dest"] = "document"
                headers["Sec-Fetch-Mode"] = "navigate"
                headers["Sec-Fetch-Site"] = "cross-site"
            
            elif "twitter.com" in referer:
                headers["Accept"] = "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
                headers["Accept-Language"] = "en-US,en;q=0.5"
                headers["Sec-Fetch-Dest"] = "document"
                headers["Sec-Fetch-Mode"] = "navigate"
        
        return headers
