"""
AdSense Testing Monitor Module with HIGH CPC Focus - THREAD SAFE
Ensures safe and compliant traffic for AdSense testing with revenue optimization
"""

import time
import json
import logging
import threading
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import random

class AdSenseTestingMonitor:
    def __init__(self, config: Dict):
        self.config = config
        self.adsense_config = config.get("adsense_testing", {})
        self.logger = logging.getLogger(__name__)
        
        # Thread safety lock for concurrent execution
        self._metrics_lock = threading.Lock()
        
        # AdSense testing metrics with HIGH CPC focus
        self.daily_metrics = {
            "total_sessions": 0,
            "total_pageviews": 0,
            "total_impressions": 0,
            "total_clicks": 0,
            "estimated_revenue": 0.0,
            "ctr": 0.0,
            "cpm": 0.0,
            "avg_cpc": 0.0,
            "high_cpc_clicks": 0,
            "display_ad_impressions": 0,
            "long_impression_sessions": 0,
            "revenue_per_session": 0.0,
            "suspicious_activities": [],
            "session_timestamps": []
        }
        
        # Safety thresholds with realistic HIGH CPC optimization
        self.safety_thresholds = {
            "max_daily_sessions": 50,
            "max_daily_revenue": 0.01,
            "max_ctr": 0.02,  # 2% max CTR
            "min_session_duration": 180,  # 3 minutes
            "max_sessions_per_hour": 10,
            "min_time_between_sessions": 300,  # 5 minutes
            "min_impression_time": 10,  # 10 seconds minimum ad view time (realistic)
            "target_cpc_threshold": 0.10,  # Target $0.10+ CPC (realistic)
            "max_revenue_per_session": 0.02  # $0.02 max per session (realistic)
        }
        
        # HIGH CPC Strategy Configuration - STEALTH FOCUSED
        self.high_cpc_strategy = {
            "enabled": True,
            "display_ad_positions": ["top", "sidebar", "in-content", "bottom"],
            "impression_time_strategies": {
                "minimum_view_time": 10,      # 10 seconds minimum (realistic)
                "optimal_view_time": 20,      # 20 seconds optimal (realistic)
                "maximum_view_time": 60,      # 1 minute maximum (realistic)
                "scroll_into_view_probability": 0.2,  # 20% chance (realistic)
                "hover_over_ad_probability": 0.1,     # 10% chance (realistic)
                "click_probability": 0.001            # 0.1% chance (realistic for display ads)
            },
            "revenue_optimization": {
                "premium_content_focus": True,
                "high_value_keywords": True,
                "long_session_optimization": True,
                "natural_engagement": True
            }
        }
        
        # Load safety thresholds from config
        if self.adsense_config.get("enabled"):
            self.safety_thresholds.update({
                "max_daily_sessions": self.adsense_config.get("daily_visits_max", 50),
                "max_daily_revenue": self.adsense_config.get("max_daily_revenue_test", 0.01),
                "min_time_between_sessions": self.adsense_config.get("session_spacing_min", 300)
            })
            
            # Load HIGH CPC strategy from config
            if self.adsense_config.get("high_cpc_focus", {}).get("enabled", False):
                self.high_cpc_strategy.update(self.adsense_config.get("high_cpc_focus", {}))
    
    def validate_session_safety(self, session_data: Dict) -> Dict:
        """Validate if session is safe for AdSense testing"""
        validation_result = {
            "safe": True,
            "warnings": [],
            "blocked": False,
            "recommendations": []
        }
        
        try:
            # Check daily session limit
            if self.daily_metrics["total_sessions"] >= self.safety_thresholds["max_daily_sessions"]:
                validation_result["safe"] = False
                validation_result["blocked"] = True
                validation_result["warnings"].append("Daily session limit reached")
            
            # Check session duration
            session_duration = session_data.get("duration", 0)
            if session_duration < self.safety_thresholds["min_session_duration"]:
                validation_result["warnings"].append(f"Session too short: {session_duration}s")
                validation_result["recommendations"].append("Increase session duration")
            
            # Check time between sessions
            if self.daily_metrics["session_timestamps"]:
                last_session_time = self.daily_metrics["session_timestamps"][-1]
                time_since_last = time.time() - last_session_time
                if time_since_last < self.safety_thresholds["min_time_between_sessions"]:
                    validation_result["warnings"].append(f"Too soon since last session: {time_since_last}s")
                    validation_result["recommendations"].append("Increase delay between sessions")
            
            # Check for suspicious behavior patterns
            suspicious_patterns = self.detect_suspicious_patterns(session_data)
            if suspicious_patterns:
                validation_result["warnings"].extend(suspicious_patterns)
                validation_result["recommendations"].append("Review behavior patterns")
            
            # Check hourly session limit
            current_hour = datetime.now().hour
            hourly_sessions = len([ts for ts in self.daily_metrics["session_timestamps"] 
                                 if datetime.fromtimestamp(ts).hour == current_hour])
            if hourly_sessions >= self.safety_thresholds["max_sessions_per_hour"]:
                validation_result["warnings"].append(f"Hourly session limit reached: {hourly_sessions}")
                validation_result["recommendations"].append("Reduce hourly session frequency")
            
        except Exception as e:
            self.logger.error(f"Error validating session safety: {str(e)}")
            validation_result["safe"] = False
            validation_result["warnings"].append(f"Validation error: {str(e)}")
        
        return validation_result
    
    def detect_suspicious_patterns(self, session_data: Dict) -> List[str]:
        """Detect suspicious behavior patterns that might flag AdSense"""
        suspicious_patterns = []
        
        try:
            # Check for too many clicks
            interactions = session_data.get("interactions", [])
            clicks = [i for i in interactions if i.get("type") == "click"]
            if len(clicks) > 5:  # More than 5 clicks per session
                suspicious_patterns.append("Too many clicks detected")
            
            # Check for unrealistic scroll patterns
            scrolls = [i for i in interactions if i.get("type") == "scroll"]
            if len(scrolls) > 20:  # More than 20 scrolls per session
                suspicious_patterns.append("Excessive scrolling detected")
            
            # Check for too fast interactions
            if interactions:
                timestamps = [i.get("timestamp", 0) for i in interactions]
                if len(timestamps) > 1:
                    intervals = [timestamps[i+1] - timestamps[i] for i in range(len(timestamps)-1)]
                    avg_interval = sum(intervals) / len(intervals)
                    if avg_interval < 2:  # Less than 2 seconds between interactions
                        suspicious_patterns.append("Interactions too fast")
            
            # Check for robotic patterns
            if len(interactions) > 0:
                # Check for too regular timing
                if len(interactions) > 5:
                    intervals = []
                    for i in range(1, len(interactions)):
                        interval = interactions[i]["timestamp"] - interactions[i-1]["timestamp"]
                        intervals.append(interval)
                    
                    if intervals:
                        variance = sum((x - sum(intervals)/len(intervals))**2 for x in intervals) / len(intervals)
                        if variance < 1:  # Too regular timing
                            suspicious_patterns.append("Too regular interaction timing")
            
        except Exception as e:
            self.logger.error(f"Error detecting suspicious patterns: {str(e)}")
        
        return suspicious_patterns
    
    def optimize_for_high_cpc(self, session_data: Dict) -> Dict:
        """Optimize session for natural HIGH CPC display ads engagement"""
        optimization_result = {
            "optimized": False,
            "strategies_applied": [],
            "estimated_cpc": 0.0,
            "impression_time": 0,
            "revenue_potential": 0.0
        }
        
        try:
            # Apply natural HIGH CPC optimization strategies
            strategies = []
            
            # 1. Natural Impression Time Strategy
            if self.high_cpc_strategy["enabled"]:
                impression_time = random.randint(
                    self.high_cpc_strategy["impression_time_strategies"]["minimum_view_time"],
                    self.high_cpc_strategy["impression_time_strategies"]["optimal_view_time"]
                )
                
                session_data["display_ad_impression_time"] = impression_time
                session_data["scroll_to_ads"] = random.random() < self.high_cpc_strategy["impression_time_strategies"]["scroll_into_view_probability"]
                session_data["hover_over_ads"] = random.random() < self.high_cpc_strategy["impression_time_strategies"]["hover_over_ad_probability"]
                
                strategies.append(f"Natural impression time: {impression_time}s")
                optimization_result["impression_time"] = impression_time
            
            # 2. Natural Click Strategy (Realistic for Display Ads)
            if self.high_cpc_strategy["enabled"]:
                # Realistic click probability for display ads
                click_probability = self.high_cpc_strategy["impression_time_strategies"]["click_probability"]
                
                # Slight increase based on session quality (but keep realistic)
                if session_data.get("duration", 0) > 300:  # 5+ minutes
                    click_probability *= 1.2  # Only 20% increase
                if session_data.get("page_views", 1) > 2:
                    click_probability *= 1.1  # Only 10% increase
                
                # Cap at realistic maximum
                session_data["high_cpc_click_probability"] = min(0.002, click_probability)  # Max 0.2%
                strategies.append(f"Natural click probability: {session_data['high_cpc_click_probability']:.4f}")
            
            # 3. Natural Revenue Optimization (Based on Content Quality)
            if self.high_cpc_strategy["revenue_optimization"]["enabled"]:
                # Estimate realistic CPC based on content quality and session engagement
                # Normal display ad CPC range: $0.10 - $0.50
                base_cpc = random.uniform(0.10, 0.50)  # Realistic CPC range
                
                # Slight adjustment based on session characteristics (keep realistic)
                cpc_multiplier = 1.0
                if session_data.get("duration", 0) > 300:
                    cpc_multiplier *= 1.1  # Only 10% increase
                if session_data.get("page_views", 1) > 2:
                    cpc_multiplier *= 1.05  # Only 5% increase
                if session_data.get("session_complexity") == "complex":
                    cpc_multiplier *= 1.15  # Only 15% increase
                
                estimated_cpc = base_cpc * cpc_multiplier
                session_data["estimated_cpc"] = estimated_cpc
                session_data["revenue_potential"] = estimated_cpc * session_data.get("high_cpc_click_probability", 0.001)
                
                optimization_result["estimated_cpc"] = estimated_cpc
                optimization_result["revenue_potential"] = session_data["revenue_potential"]
                strategies.append(f"Realistic CPC: ${estimated_cpc:.2f}")
            
            # 4. Natural Ad Position Engagement
            if self.high_cpc_strategy["enabled"]:
                # Natural ad position engagement (don't force targeting)
                ad_positions = self.high_cpc_strategy["display_ad_positions"]
                # Random selection without forcing specific positions
                session_data["natural_ad_engagement"] = random.choice(ad_positions)
                strategies.append(f"Natural ad engagement: {session_data['natural_ad_engagement']}")
            
            optimization_result["optimized"] = True
            optimization_result["strategies_applied"] = strategies
            
            self.logger.info(f"Natural HIGH CPC optimization applied: {strategies}")
            
        except Exception as e:
            self.logger.error(f"Error optimizing for natural HIGH CPC: {str(e)}")
        
        return optimization_result
    
    def update_metrics(self, session_data: Dict):
        """Update AdSense testing metrics (THREAD SAFE)"""
        try:
            with self._metrics_lock:
                self.daily_metrics["total_sessions"] += 1
                self.daily_metrics["total_pageviews"] += session_data.get("page_views", 1)
                self.daily_metrics["session_timestamps"].append(time.time())
                
                # Estimate impressions (assuming 1 impression per pageview)
                estimated_impressions = session_data.get("page_views", 1)
                self.daily_metrics["total_impressions"] += estimated_impressions
                
                # Estimate clicks (very conservative for testing)
                estimated_clicks = 0
                if random.random() < 0.001:  # 0.1% chance of click for testing
                    estimated_clicks = 1
                    self.daily_metrics["total_clicks"] += 1
                
                # Calculate metrics
                if self.daily_metrics["total_impressions"] > 0:
                    self.daily_metrics["ctr"] = self.daily_metrics["total_clicks"] / self.daily_metrics["total_impressions"]
                    self.daily_metrics["cpm"] = (self.daily_metrics["estimated_revenue"] / self.daily_metrics["total_impressions"]) * 1000
                
                # Log metrics
                self.logger.info(f"Updated metrics - Sessions: {self.daily_metrics['total_sessions']}, "
                               f"Pageviews: {self.daily_metrics['total_pageviews']}, "
                               f"CTR: {self.daily_metrics['ctr']:.4f}")
            
        except Exception as e:
            self.logger.error(f"Error updating metrics: {str(e)}")
    
    def update_metrics_with_high_cpc(self, session_data: Dict):
        """Update AdSense testing metrics with realistic HIGH CPC focus (THREAD SAFE)"""
        try:
            with self._metrics_lock:
                self.daily_metrics["total_sessions"] += 1
                self.daily_metrics["total_pageviews"] += session_data.get("page_views", 1)
                self.daily_metrics["session_timestamps"].append(time.time())
                
                # Update display ad impressions
                display_impressions = session_data.get("page_views", 1)
                self.daily_metrics["display_ad_impressions"] += display_impressions
                self.daily_metrics["total_impressions"] += display_impressions
                
                # Check for natural impression sessions
                if session_data.get("display_ad_impression_time", 0) > 15:  # 15+ seconds is natural
                    self.daily_metrics["long_impression_sessions"] += 1
                
                # Realistic HIGH CPC click simulation
                click_probability = session_data.get("high_cpc_click_probability", 0.001)
                estimated_cpc = session_data.get("estimated_cpc", 0.0)
                
                if random.random() < click_probability:
                    self.daily_metrics["total_clicks"] += 1
                    self.daily_metrics["high_cpc_clicks"] += 1
                    
                    # Calculate revenue based on realistic CPC
                    revenue = estimated_cpc
                    self.daily_metrics["estimated_revenue"] += revenue
                    
                    self.logger.info(f"Natural HIGH CPC click detected! CPC: ${estimated_cpc:.2f}, Revenue: ${revenue:.4f}")
                
                # Calculate metrics
                if self.daily_metrics["total_impressions"] > 0:
                    self.daily_metrics["ctr"] = self.daily_metrics["total_clicks"] / self.daily_metrics["total_impressions"]
                    self.daily_metrics["cpm"] = (self.daily_metrics["estimated_revenue"] / self.daily_metrics["total_impressions"]) * 1000
                
                if self.daily_metrics["total_clicks"] > 0:
                    self.daily_metrics["avg_cpc"] = self.daily_metrics["estimated_revenue"] / self.daily_metrics["total_clicks"]
                
                # Calculate revenue per session
                if self.daily_metrics["total_sessions"] > 0:
                    self.daily_metrics["revenue_per_session"] = self.daily_metrics["estimated_revenue"] / self.daily_metrics["total_sessions"]
                
                # Log realistic HIGH CPC metrics
                self.logger.info(f"Realistic HIGH CPC metrics updated - Sessions: {self.daily_metrics['total_sessions']}, "
                               f"Display Impressions: {self.daily_metrics['display_ad_impressions']}, "
                               f"Natural Clicks: {self.daily_metrics['high_cpc_clicks']}, "
                               f"Avg CPC: ${self.daily_metrics['avg_cpc']:.2f}, "
                               f"Revenue/Session: ${self.daily_metrics['revenue_per_session']:.4f}")
            
        except Exception as e:
            self.logger.error(f"Error updating realistic HIGH CPC metrics: {str(e)}")
    
    def check_daily_limits(self) -> Dict:
        """Check if daily limits are reached (THREAD SAFE)"""
        limits_status = {
            "sessions_limit_reached": False,
            "revenue_limit_reached": False,
            "ctr_limit_reached": False,
            "can_continue": True
        }
        
        try:
            with self._metrics_lock:
                # Check session limit
                if self.daily_metrics["total_sessions"] >= self.safety_thresholds["max_daily_sessions"]:
                    limits_status["sessions_limit_reached"] = True
                    limits_status["can_continue"] = False
                
                # Check revenue limit
                if self.daily_metrics["estimated_revenue"] >= self.safety_thresholds["max_daily_revenue"]:
                    limits_status["revenue_limit_reached"] = True
                    limits_status["can_continue"] = False
                
                # Check CTR limit
                if self.daily_metrics["ctr"] > self.safety_thresholds["max_ctr"]:
                    limits_status["ctr_limit_reached"] = True
                    limits_status["can_continue"] = False
            
        except Exception as e:
            self.logger.error(f"Error checking daily limits: {str(e)}")
            limits_status["can_continue"] = False
        
        return limits_status
    
    def generate_adsense_report(self) -> Dict:
        """Generate AdSense testing report"""
        report = {
            "date": datetime.now().strftime("%Y-%m-%d"),
            "metrics": self.daily_metrics.copy(),
            "safety_status": self.check_daily_limits(),
            "recommendations": [],
            "warnings": []
        }
        
        try:
            # Add recommendations based on metrics
            if self.daily_metrics["ctr"] > 0.01:  # CTR > 1%
                report["warnings"].append("CTR is higher than typical for testing")
                report["recommendations"].append("Reduce click probability")
            
            if self.daily_metrics["total_sessions"] > 40:  # Close to limit
                report["warnings"].append("Approaching daily session limit")
                report["recommendations"].append("Consider reducing daily visits")
            
            # Add safety recommendations
            if self.daily_metrics["suspicious_activities"]:
                report["warnings"].append(f"Detected {len(self.daily_metrics['suspicious_activities'])} suspicious activities")
                report["recommendations"].append("Review behavior patterns")
            
            # Add general recommendations
            report["recommendations"].extend([
                "Monitor Google AdSense dashboard for any warnings",
                "Keep daily revenue under $0.01 for testing",
                "Maintain natural user behavior patterns",
                "Rotate proxies regularly",
                "Vary session timing and duration"
            ])
            
        except Exception as e:
            self.logger.error(f"Error generating AdSense report: {str(e)}")
        
        return report
    
    def generate_high_cpc_report(self) -> Dict:
        """Generate detailed HIGH CPC performance report"""
        report = {
            "date": datetime.now().strftime("%Y-%m-%d"),
            "high_cpc_performance": {
                "total_sessions": self.daily_metrics["total_sessions"],
                "display_ad_impressions": self.daily_metrics["display_ad_impressions"],
                "long_impression_sessions": self.daily_metrics["long_impression_sessions"],
                "high_cpc_clicks": self.daily_metrics["high_cpc_clicks"],
                "total_clicks": self.daily_metrics["total_clicks"],
                "estimated_revenue": self.daily_metrics["estimated_revenue"],
                "avg_cpc": self.daily_metrics["avg_cpc"],
                "revenue_per_session": self.daily_metrics["revenue_per_session"],
                "ctr": self.daily_metrics["ctr"],
                "cpm": self.daily_metrics["cpm"]
            },
            "optimization_metrics": {
                "long_impression_rate": self.daily_metrics["long_impression_sessions"] / max(1, self.daily_metrics["total_sessions"]),
                "high_cpc_click_rate": self.daily_metrics["high_cpc_clicks"] / max(1, self.daily_metrics["total_clicks"]),
                "revenue_efficiency": self.daily_metrics["revenue_per_session"] / max(0.01, self.safety_thresholds["max_revenue_per_session"])
            },
            "safety_status": {
                "within_daily_limits": self.daily_metrics["total_sessions"] <= self.safety_thresholds["max_daily_sessions"],
                "within_revenue_limits": self.daily_metrics["estimated_revenue"] <= self.safety_thresholds["max_daily_revenue"],
                "within_ctr_limits": self.daily_metrics["ctr"] <= self.safety_thresholds["max_ctr"],
                "high_cpc_target_achieved": self.daily_metrics["avg_cpc"] >= self.safety_thresholds["target_cpc_threshold"]
            },
            "recommendations": self._get_high_cpc_recommendations(),
            "warnings": self._get_high_cpc_warnings()
        }
        
        return report
    
    def _get_high_cpc_recommendations(self) -> List[str]:
        """Get realistic HIGH CPC optimization recommendations"""
        recommendations = []
        
        if self.daily_metrics["avg_cpc"] < self.safety_thresholds["target_cpc_threshold"]:
            recommendations.append("Content quality is good, CPC will improve naturally")
            recommendations.append("Focus on natural user engagement rather than forced optimization")
        
        if self.daily_metrics["long_impression_sessions"] / max(1, self.daily_metrics["total_sessions"]) < 0.3:
            recommendations.append("Natural ad engagement is good, no need to force longer view times")
        
        if self.daily_metrics["revenue_per_session"] < 0.005:
            recommendations.append("Revenue per session is realistic for display ads")
        
        return recommendations
    
    def _get_high_cpc_warnings(self) -> List[str]:
        """Get realistic HIGH CPC safety warnings"""
        warnings = []
        
        if self.daily_metrics["ctr"] > self.safety_thresholds["max_ctr"]:
            warnings.append(f"CTR too high: {self.daily_metrics['ctr']:.3f} (max: {self.safety_thresholds['max_ctr']})")
        
        if self.daily_metrics["estimated_revenue"] > self.safety_thresholds["max_daily_revenue"]:
            warnings.append(f"Daily revenue limit exceeded: ${self.daily_metrics['estimated_revenue']:.4f}")
        
        if self.daily_metrics["avg_cpc"] > 1.0:
            warnings.append(f"Unrealistically high CPC: ${self.daily_metrics['avg_cpc']:.2f} (should be $0.10-$0.50)")
        
        return warnings
    
    def reset_daily_metrics(self):
        """Reset daily metrics (call at start of new day) (THREAD SAFE)"""
        with self._metrics_lock:
            self.daily_metrics = {
                "total_sessions": 0,
                "total_pageviews": 0,
                "total_impressions": 0,
                "total_clicks": 0,
                "estimated_revenue": 0.0,
                "ctr": 0.0,
                "cpm": 0.0,
                "avg_cpc": 0.0,
                "high_cpc_clicks": 0,
                "display_ad_impressions": 0,
                "long_impression_sessions": 0,
                "revenue_per_session": 0.0,
                "suspicious_activities": [],
                "session_timestamps": []
            }
            self.logger.info("Daily metrics reset for new day")
    
    def save_adsense_report(self, report: Dict, filename: str = None):
        """Save AdSense report to file"""
        try:
            if not filename:
                filename = f"logs/adsense_report_{datetime.now().strftime('%Y%m%d')}.json"
            
            with open(filename, 'w') as f:
                json.dump(report, f, indent=2, default=str)
            
            self.logger.info(f"AdSense report saved to {filename}")
            
        except Exception as e:
            self.logger.error(f"Error saving AdSense report: {str(e)}")
    
    def get_safety_recommendations(self) -> List[str]:
        """Get current safety recommendations"""
        recommendations = []
        
        try:
            # Check current metrics and provide recommendations
            if self.daily_metrics["total_sessions"] > 30:
                recommendations.append("Consider reducing daily sessions to stay under limits")
            
            if self.daily_metrics["ctr"] > 0.005:
                recommendations.append("CTR is getting high, reduce click probability")
            
            if len(self.daily_metrics["suspicious_activities"]) > 0:
                recommendations.append("Review and adjust behavior patterns")
            
            # Add general safety tips
            recommendations.extend([
                "Always use different proxies for each session",
                "Vary session duration between 10-20 minutes",
                "Include natural pauses and breaks",
                "Avoid clicking on ads during testing",
                "Monitor for any AdSense policy violations"
            ])
            
        except Exception as e:
            self.logger.error(f"Error getting safety recommendations: {str(e)}")
        
        return recommendations
