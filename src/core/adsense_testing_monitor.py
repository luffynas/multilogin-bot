"""
AdSense Testing Monitor Module
Ensures safe and compliant traffic for AdSense testing
"""

import time
import json
import logging
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import random

class AdSenseTestingMonitor:
    def __init__(self, config: Dict):
        self.config = config
        self.adsense_config = config.get("adsense_testing", {})
        self.logger = logging.getLogger(__name__)
        
        # AdSense testing metrics
        self.daily_metrics = {
            "total_sessions": 0,
            "total_pageviews": 0,
            "total_impressions": 0,
            "total_clicks": 0,
            "estimated_revenue": 0.0,
            "ctr": 0.0,
            "cpm": 0.0,
            "suspicious_activities": [],
            "session_timestamps": []
        }
        
        # Safety thresholds
        self.safety_thresholds = {
            "max_daily_sessions": 50,
            "max_daily_revenue": 0.01,
            "max_ctr": 0.02,  # 2% max CTR
            "min_session_duration": 180,  # 3 minutes
            "max_sessions_per_hour": 10,
            "min_time_between_sessions": 300  # 5 minutes
        }
        
        # Load safety thresholds from config
        if self.adsense_config.get("enabled"):
            self.safety_thresholds.update({
                "max_daily_sessions": self.adsense_config.get("daily_visits_max", 50),
                "max_daily_revenue": self.adsense_config.get("max_daily_revenue_test", 0.01),
                "min_time_between_sessions": self.adsense_config.get("session_spacing_min", 300)
            })
    
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
    
    def update_metrics(self, session_data: Dict):
        """Update AdSense testing metrics"""
        try:
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
    
    def check_daily_limits(self) -> Dict:
        """Check if daily limits are reached"""
        limits_status = {
            "sessions_limit_reached": False,
            "revenue_limit_reached": False,
            "ctr_limit_reached": False,
            "can_continue": True
        }
        
        try:
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
    
    def reset_daily_metrics(self):
        """Reset daily metrics (call at start of new day)"""
        self.daily_metrics = {
            "total_sessions": 0,
            "total_pageviews": 0,
            "total_impressions": 0,
            "total_clicks": 0,
            "estimated_revenue": 0.0,
            "ctr": 0.0,
            "cpm": 0.0,
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
