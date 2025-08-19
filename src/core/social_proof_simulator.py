"""
Social Proof Simulator
Provides realistic social media interactions and social proof behaviors
"""

import random
import time
import json
from typing import Dict, List, Optional, Tuple
import logging
from datetime import datetime, timedelta
from enum import Enum

class SocialPlatform(Enum):
    """Social media platforms"""
    FACEBOOK = "facebook"
    TWITTER = "twitter"
    INSTAGRAM = "instagram"
    LINKEDIN = "linkedin"
    YOUTUBE = "youtube"
    TIKTOK = "tiktok"
    REDDIT = "reddit"
    PINTEREST = "pinterest"

class SocialAction(Enum):
    """Social media actions"""
    LIKE = "like"
    SHARE = "share"
    COMMENT = "comment"
    FOLLOW = "follow"
    BOOKMARK = "bookmark"
    SAVE = "save"
    RETWEET = "retweet"
    REPOST = "repost"

class SocialProofSimulator:
    """Simulates realistic social media interactions and social proof behaviors"""
    
    def __init__(self, config: Dict):
        self.config = config
        self.logger = logging.getLogger(__name__)
        
        # Social profiles
        self.social_profiles = self.load_social_profiles()
        self.interaction_patterns = self.load_interaction_patterns()
        self.trending_topics = self.load_trending_topics()
        
        # Social proof data
        self.social_proof_data = {}
        self.interaction_history = []
        self.social_signals = {}
        
        # Real-time adaptation
        self.adaptation_enabled = True
        self.social_trends = {}
        
    def load_social_profiles(self) -> Dict:
        """Load realistic social media profiles"""
        return {
            "social_butterfly": {
                "platforms": [SocialPlatform.FACEBOOK, SocialPlatform.INSTAGRAM, SocialPlatform.TWITTER],
                "activity_level": "high",
                "follower_count": random.randint(500, 5000),
                "following_count": random.randint(200, 1000),
                "posting_frequency": "daily",
                "interaction_rate": 0.8,
                "engagement_style": "active",
                "content_preferences": ["lifestyle", "entertainment", "news", "personal"],
                "social_influence": "medium"
            },
            "professional_networker": {
                "platforms": [SocialPlatform.LINKEDIN, SocialPlatform.TWITTER],
                "activity_level": "medium",
                "follower_count": random.randint(200, 2000),
                "following_count": random.randint(100, 500),
                "posting_frequency": "weekly",
                "interaction_rate": 0.6,
                "engagement_style": "professional",
                "content_preferences": ["business", "technology", "career", "industry"],
                "social_influence": "high"
            },
            "content_consumer": {
                "platforms": [SocialPlatform.YOUTUBE, SocialPlatform.INSTAGRAM, SocialPlatform.TIKTOK],
                "activity_level": "medium",
                "follower_count": random.randint(50, 500),
                "following_count": random.randint(100, 800),
                "posting_frequency": "monthly",
                "interaction_rate": 0.4,
                "engagement_style": "passive",
                "content_preferences": ["entertainment", "education", "lifestyle", "gaming"],
                "social_influence": "low"
            },
            "news_enthusiast": {
                "platforms": [SocialPlatform.TWITTER, SocialPlatform.REDDIT, SocialPlatform.FACEBOOK],
                "activity_level": "high",
                "follower_count": random.randint(100, 1000),
                "following_count": random.randint(200, 600),
                "posting_frequency": "daily",
                "interaction_rate": 0.7,
                "engagement_style": "informative",
                "content_preferences": ["news", "politics", "technology", "science"],
                "social_influence": "medium"
            },
            "casual_user": {
                "platforms": [SocialPlatform.FACEBOOK, SocialPlatform.INSTAGRAM],
                "activity_level": "low",
                "follower_count": random.randint(20, 200),
                "following_count": random.randint(50, 300),
                "posting_frequency": "monthly",
                "interaction_rate": 0.3,
                "engagement_style": "casual",
                "content_preferences": ["family", "friends", "personal", "entertainment"],
                "social_influence": "low"
            }
        }
    
    def load_interaction_patterns(self) -> Dict:
        """Load realistic social interaction patterns"""
        return {
            "like_patterns": {
                "frequency": {
                    "high": random.uniform(0.7, 0.9),
                    "medium": random.uniform(0.4, 0.7),
                    "low": random.uniform(0.1, 0.4)
                },
                "timing": {
                    "immediate": 0.3,
                    "delayed": 0.5,
                    "never": 0.2
                },
                "selectivity": {
                    "high": 0.2,  # Only like high-quality content
                    "medium": 0.6,  # Like most relevant content
                    "low": 0.2   # Like almost everything
                }
            },
            "share_patterns": {
                "frequency": {
                    "high": random.uniform(0.3, 0.5),
                    "medium": random.uniform(0.1, 0.3),
                    "low": random.uniform(0.01, 0.1)
                },
                "motivation": {
                    "informative": 0.4,
                    "entertaining": 0.3,
                    "personal": 0.2,
                    "trending": 0.1
                },
                "platform_preference": {
                    "same_platform": 0.6,
                    "cross_platform": 0.3,
                    "private": 0.1
                }
            },
            "comment_patterns": {
                "frequency": {
                    "high": random.uniform(0.2, 0.4),
                    "medium": random.uniform(0.05, 0.2),
                    "low": random.uniform(0.01, 0.05)
                },
                "comment_type": {
                    "positive": 0.6,
                    "neutral": 0.3,
                    "negative": 0.1
                },
                "comment_length": {
                    "short": 0.5,
                    "medium": 0.3,
                    "long": 0.2
                }
            },
            "follow_patterns": {
                "frequency": {
                    "high": random.uniform(0.1, 0.3),
                    "medium": random.uniform(0.05, 0.1),
                    "low": random.uniform(0.01, 0.05)
                },
                "criteria": {
                    "similar_interests": 0.4,
                    "high_quality_content": 0.3,
                    "mutual_connections": 0.2,
                    "trending": 0.1
                }
            }
        }
    
    def load_trending_topics(self) -> Dict:
        """Load trending topics and hashtags"""
        return {
            "current_trends": [
                "#technews", "#innovation", "#sustainability", "#wellness",
                "#travel", "#food", "#fitness", "#fashion", "#business",
                "#entertainment", "#sports", "#politics", "#science"
            ],
            "platform_specific": {
                SocialPlatform.TWITTER: ["#breaking", "#trending", "#viral"],
                SocialPlatform.INSTAGRAM: ["#instagood", "#photooftheday", "#lifestyle"],
                SocialPlatform.LINKEDIN: ["#networking", "#career", "#leadership"],
                SocialPlatform.TIKTOK: ["#fyp", "#viral", "#trending"]
            },
            "topic_categories": {
                "technology": ["AI", "blockchain", "cybersecurity", "startups"],
                "lifestyle": ["fitness", "nutrition", "mindfulness", "travel"],
                "business": ["entrepreneurship", "marketing", "finance", "leadership"],
                "entertainment": ["movies", "music", "gaming", "celebrity"]
            }
        }
    
    def generate_social_profile(self, personality_type: str = None) -> Dict:
        """Generate realistic social media profile"""
        if personality_type is None:
            personality_type = random.choice(list(self.social_profiles.keys()))
        
        base_profile = self.social_profiles[personality_type].copy()
        
        # Add dynamic elements
        profile = {
            **base_profile,
            "profile_age_days": random.randint(30, 1000),
            "last_active": datetime.now() - timedelta(hours=random.randint(0, 72)),
            "verification_status": random.choice([True, False, False, False]),  # 25% verified
            "profile_completeness": random.uniform(0.6, 1.0),
            "engagement_rate": self.calculate_engagement_rate(base_profile),
            "social_credibility": self.calculate_social_credibility(base_profile),
            "influence_score": self.calculate_influence_score(base_profile),
            "content_quality_score": random.uniform(0.5, 0.9),
            "interaction_history": self.generate_interaction_history(base_profile)
        }
        
        return profile
    
    def calculate_engagement_rate(self, profile: Dict) -> float:
        """Calculate realistic engagement rate"""
        follower_count = profile["follower_count"]
        activity_level = profile["activity_level"]
        
        # Base engagement rate
        base_rate = 0.02  # 2% base engagement
        
        # Adjust based on activity level
        if activity_level == "high":
            base_rate *= 1.5
        elif activity_level == "low":
            base_rate *= 0.7
        
        # Adjust based on follower count (inverse relationship)
        if follower_count > 1000:
            base_rate *= 0.8
        elif follower_count < 100:
            base_rate *= 1.3
        
        return min(0.1, max(0.005, base_rate))  # Between 0.5% and 10%
    
    def calculate_social_credibility(self, profile: Dict) -> float:
        """Calculate social credibility score"""
        credibility = 0.5  # Base credibility
        
        # Profile age factor
        profile_age = profile.get("profile_age_days", 365)
        if profile_age > 365:
            credibility += 0.2
        elif profile_age > 180:
            credibility += 0.1
        
        # Verification status
        if profile.get("verification_status", False):
            credibility += 0.2
        
        # Follower to following ratio
        follower_count = profile["follower_count"]
        following_count = profile["following_count"]
        if following_count > 0:
            ratio = follower_count / following_count
            if ratio > 2:
                credibility += 0.1
            elif ratio < 0.5:
                credibility -= 0.1
        
        # Activity level factor
        if profile["activity_level"] == "high":
            credibility += 0.1
        
        return min(1.0, max(0.0, credibility))
    
    def calculate_influence_score(self, profile: Dict) -> float:
        """Calculate social influence score"""
        influence = 0.0
        
        # Follower count factor
        follower_count = profile["follower_count"]
        if follower_count > 10000:
            influence += 0.4
        elif follower_count > 1000:
            influence += 0.3
        elif follower_count > 100:
            influence += 0.2
        else:
            influence += 0.1
        
        # Engagement rate factor
        engagement_rate = self.calculate_engagement_rate(profile)
        influence += engagement_rate * 2
        
        # Social credibility factor
        credibility = self.calculate_social_credibility(profile)
        influence += credibility * 0.3
        
        # Activity level factor
        if profile["activity_level"] == "high":
            influence += 0.1
        
        return min(1.0, influence)
    
    def generate_interaction_history(self, profile: Dict) -> List[Dict]:
        """Generate realistic interaction history"""
        history = []
        platforms = profile["platforms"]
        
        # Generate recent interactions
        for i in range(random.randint(5, 20)):
            platform = random.choice(platforms)
            action = random.choice(list(SocialAction))
            
            interaction = {
                "platform": platform.value,
                "action": action.value,
                "timestamp": datetime.now() - timedelta(
                    hours=random.randint(1, 168),  # Last week
                    minutes=random.randint(0, 59)
                ),
                "content_type": random.choice(profile["content_preferences"]),
                "engagement_level": random.choice(["low", "medium", "high"])
            }
            
            history.append(interaction)
        
        # Sort by timestamp
        history.sort(key=lambda x: x["timestamp"], reverse=True)
        
        return history
    
    def simulate_social_interaction(self, content_data: Dict, user_profile: Dict) -> Dict:
        """Simulate realistic social media interaction"""
        interaction = {
            "platform": random.choice(user_profile["platforms"]).value,
            "content_id": content_data.get("id", f"content_{random.randint(1000, 9999)}"),
            "timestamp": datetime.now(),
            "user_profile": user_profile,
            "interaction_type": None,
            "interaction_data": {},
            "social_proof_impact": 0.0
        }
        
        # Determine interaction type based on patterns
        interaction_type = self.determine_interaction_type(content_data, user_profile)
        interaction["interaction_type"] = interaction_type
        
        # Generate interaction-specific data
        interaction_data = self.generate_interaction_data(interaction_type, content_data, user_profile)
        interaction["interaction_data"] = interaction_data
        
        # Calculate social proof impact
        social_proof_impact = self.calculate_social_proof_impact(interaction)
        interaction["social_proof_impact"] = social_proof_impact
        
        # Store interaction
        self.interaction_history.append(interaction)
        
        return interaction
    
    def determine_interaction_type(self, content_data: Dict, user_profile: Dict) -> str:
        """Determine what type of interaction to perform"""
        patterns = self.interaction_patterns
        activity_level = user_profile["activity_level"]
        
        # Get interaction probabilities
        like_prob = patterns["like_patterns"]["frequency"][activity_level]
        share_prob = patterns["share_patterns"]["frequency"][activity_level]
        comment_prob = patterns["comment_patterns"]["frequency"][activity_level]
        follow_prob = patterns["follow_patterns"]["frequency"][activity_level]
        
        # Adjust probabilities based on content quality
        content_quality = content_data.get("quality_score", 0.5)
        if content_quality > 0.8:
            like_prob *= 1.2
            share_prob *= 1.3
            comment_prob *= 1.1
        elif content_quality < 0.3:
            like_prob *= 0.5
            share_prob *= 0.3
            comment_prob *= 0.2
        
        # Random selection based on probabilities
        rand = random.random()
        cumulative_prob = 0
        
        if rand < (cumulative_prob := cumulative_prob + like_prob):
            return SocialAction.LIKE.value
        elif rand < (cumulative_prob := cumulative_prob + share_prob):
            return SocialAction.SHARE.value
        elif rand < (cumulative_prob := cumulative_prob + comment_prob):
            return SocialAction.COMMENT.value
        elif rand < (cumulative_prob := cumulative_prob + follow_prob):
            return SocialAction.FOLLOW.value
        else:
            return "view"  # No interaction
    
    def generate_interaction_data(self, interaction_type: str, content_data: Dict, user_profile: Dict) -> Dict:
        """Generate data specific to interaction type"""
        if interaction_type == SocialAction.LIKE.value:
            return {
                "reaction_type": random.choice(["like", "love", "wow", "haha"]),
                "reaction_strength": random.uniform(0.5, 1.0)
            }
        
        elif interaction_type == SocialAction.SHARE.value:
            return {
                "share_method": random.choice(["public", "friends", "private"]),
                "share_message": self.generate_share_message(content_data),
                "hashtags": self.generate_relevant_hashtags(content_data),
                "mention_users": self.generate_mentions(user_profile)
            }
        
        elif interaction_type == SocialAction.COMMENT.value:
            return {
                "comment_text": self.generate_comment_text(content_data, user_profile),
                "comment_sentiment": random.choice(["positive", "neutral", "question"]),
                "comment_length": random.choice(["short", "medium", "long"]),
                "hashtags": self.generate_relevant_hashtags(content_data),
                "mentions": self.generate_mentions(user_profile)
            }
        
        elif interaction_type == SocialAction.FOLLOW.value:
            return {
                "follow_reason": random.choice(["similar_interests", "quality_content", "mutual_connection"]),
                "notification_preferences": random.choice(["all", "important", "none"])
            }
        
        else:
            return {"view_duration": random.uniform(5, 60)}
    
    def generate_share_message(self, content_data: Dict) -> str:
        """Generate realistic share message"""
        content_type = content_data.get("type", "article")
        quality = content_data.get("quality_score", 0.5)
        
        messages = {
            "article": [
                "Great read! 📚",
                "Interesting article worth sharing",
                "This is really insightful",
                "Definitely worth your time",
                "Highly recommend this"
            ],
            "video": [
                "Amazing video! 🎥",
                "You have to see this",
                "This is incredible",
                "Worth watching",
                "Check this out!"
            ],
            "image": [
                "Beautiful! 📸",
                "Love this",
                "Amazing shot",
                "This is stunning",
                "Incredible!"
            ]
        }
        
        base_messages = messages.get(content_type, messages["article"])
        
        # Adjust based on quality
        if quality > 0.8:
            message = random.choice(base_messages[:2])  # More enthusiastic
        elif quality < 0.3:
            message = random.choice(base_messages[-2:])  # Less enthusiastic
        else:
            message = random.choice(base_messages)
        
        return message
    
    def generate_comment_text(self, content_data: Dict, user_profile: Dict) -> str:
        """Generate realistic comment text"""
        content_type = content_data.get("type", "article")
        sentiment = random.choice(["positive", "neutral", "question"])
        
        comments = {
            "positive": {
                "article": [
                    "Great article! Thanks for sharing.",
                    "Really enjoyed reading this.",
                    "Excellent insights here.",
                    "This is spot on!",
                    "Love the perspective on this."
                ],
                "video": [
                    "Amazing video!",
                    "This is so well done.",
                    "Great content as always.",
                    "Love this!",
                    "Incredible work."
                ]
            },
            "neutral": {
                "article": [
                    "Interesting read.",
                    "Good points made here.",
                    "Thanks for sharing.",
                    "Worth checking out.",
                    "Nice article."
                ],
                "video": [
                    "Nice video.",
                    "Good content.",
                    "Thanks for sharing.",
                    "Interesting.",
                    "Cool video."
                ]
            },
            "question": {
                "article": [
                    "What do you think about this?",
                    "Has anyone tried this approach?",
                    "Interesting perspective. Thoughts?",
                    "What's your take on this?",
                    "Anyone have experience with this?"
                ],
                "video": [
                    "How did you achieve this?",
                    "What's your process?",
                    "Any tips for beginners?",
                    "How long did this take?",
                    "What equipment did you use?"
                ]
            }
        }
        
        content_comments = comments[sentiment].get(content_type, comments[sentiment]["article"])
        return random.choice(content_comments)
    
    def generate_relevant_hashtags(self, content_data: Dict) -> List[str]:
        """Generate relevant hashtags for content"""
        content_type = content_data.get("type", "article")
        topic = content_data.get("topic", "general")
        
        # Get trending hashtags
        trending = self.trending_topics["current_trends"]
        
        # Get topic-specific hashtags
        topic_hashtags = self.trending_topics["topic_categories"].get(topic, [])
        
        # Combine and select
        all_hashtags = trending + topic_hashtags
        selected_hashtags = random.sample(all_hashtags, min(3, len(all_hashtags)))
        
        return selected_hashtags
    
    def generate_mentions(self, user_profile: Dict) -> List[str]:
        """Generate realistic user mentions"""
        # Simulate mentioning friends or influencers
        mentions = []
        
        # 30% chance to mention someone
        if random.random() < 0.3:
            mention_count = random.randint(1, 2)
            for _ in range(mention_count):
                # Generate realistic username
                username = f"user_{random.randint(1000, 9999)}"
                mentions.append(username)
        
        return mentions
    
    def calculate_social_proof_impact(self, interaction: Dict) -> float:
        """Calculate the social proof impact of an interaction"""
        impact = 0.0
        
        # Base impact by interaction type
        interaction_weights = {
            SocialAction.LIKE.value: 0.1,
            SocialAction.SHARE.value: 0.8,
            SocialAction.COMMENT.value: 0.6,
            SocialAction.FOLLOW.value: 0.4,
            "view": 0.05
        }
        
        impact += interaction_weights.get(interaction["interaction_type"], 0.1)
        
        # User influence factor
        user_profile = interaction["user_profile"]
        influence_score = user_profile.get("influence_score", 0.5)
        impact *= (1 + influence_score)
        
        # Social credibility factor
        credibility = user_profile.get("social_credibility", 0.5)
        impact *= (1 + credibility * 0.5)
        
        # Engagement level factor
        engagement_level = interaction["interaction_data"].get("engagement_level", "medium")
        engagement_multipliers = {"low": 0.7, "medium": 1.0, "high": 1.3}
        impact *= engagement_multipliers.get(engagement_level, 1.0)
        
        return min(1.0, impact)
    
    def generate_social_proof_signals(self, content_data: Dict) -> Dict:
        """Generate social proof signals for content"""
        signals = {
            "view_count": random.randint(100, 10000),
            "like_count": 0,
            "share_count": 0,
            "comment_count": 0,
            "engagement_rate": 0.0,
            "social_mentions": [],
            "trending_status": "none",
            "viral_potential": 0.0
        }
        
        # Calculate engagement counts based on view count
        view_count = signals["view_count"]
        engagement_rate = random.uniform(0.01, 0.05)  # 1-5% engagement rate
        
        signals["like_count"] = int(view_count * engagement_rate * random.uniform(0.6, 0.8))
        signals["share_count"] = int(view_count * engagement_rate * random.uniform(0.05, 0.15))
        signals["comment_count"] = int(view_count * engagement_rate * random.uniform(0.1, 0.3))
        signals["engagement_rate"] = engagement_rate
        
        # Generate social mentions
        mention_count = random.randint(0, 5)
        for _ in range(mention_count):
            platform = random.choice(list(SocialPlatform)).value
            username = f"user_{random.randint(1000, 9999)}"
            signals["social_mentions"].append({
                "platform": platform,
                "username": username,
                "timestamp": datetime.now() - timedelta(hours=random.randint(1, 24))
            })
        
        # Determine trending status
        if engagement_rate > 0.03 and signals["share_count"] > 50:
            signals["trending_status"] = "trending"
        elif engagement_rate > 0.02:
            signals["trending_status"] = "rising"
        
        # Calculate viral potential
        viral_potential = (engagement_rate * 10) + (signals["share_count"] / 100)
        signals["viral_potential"] = min(1.0, viral_potential)
        
        return signals
    
    def adapt_to_social_trends(self, content_data: Dict) -> Dict:
        """Adapt content based on current social trends"""
        if not self.adaptation_enabled:
            return content_data
        
        # Get current trending topics
        trending_topics = self.trending_topics["current_trends"]
        
        # Check if content is related to trending topics
        content_topic = content_data.get("topic", "")
        content_hashtags = content_data.get("hashtags", [])
        
        # Calculate trend relevance
        trend_relevance = 0.0
        for topic in trending_topics:
            if topic.lower() in content_topic.lower():
                trend_relevance += 0.3
            if topic in content_hashtags:
                trend_relevance += 0.2
        
        # Adapt content if relevant to trends
        if trend_relevance > 0.3:
            adapted_content = content_data.copy()
            
            # Add trending hashtags
            if "hashtags" not in adapted_content:
                adapted_content["hashtags"] = []
            
            # Add 1-2 trending hashtags
            new_hashtags = random.sample(trending_topics, min(2, len(trending_topics)))
            adapted_content["hashtags"].extend(new_hashtags)
            
            # Increase engagement probability
            adapted_content["trend_boost"] = trend_relevance
            
            return adapted_content
        
        return content_data
    
    def get_social_proof_summary(self) -> Dict:
        """Get summary of social proof activities"""
        if not self.interaction_history:
            return {"total_interactions": 0}
        
        # Calculate statistics
        total_interactions = len(self.interaction_history)
        interaction_types = {}
        platforms = {}
        total_impact = 0.0
        
        for interaction in self.interaction_history:
            # Count interaction types
            interaction_type = interaction["interaction_type"]
            interaction_types[interaction_type] = interaction_types.get(interaction_type, 0) + 1
            
            # Count platforms
            platform = interaction["platform"]
            platforms[platform] = platforms.get(platform, 0) + 1
            
            # Sum impact
            total_impact += interaction["social_proof_impact"]
        
        return {
            "total_interactions": total_interactions,
            "interaction_types": interaction_types,
            "platforms": platforms,
            "average_impact": total_impact / total_interactions if total_interactions > 0 else 0,
            "total_impact": total_impact,
            "recent_interactions": self.interaction_history[-10:] if self.interaction_history else []
        }
