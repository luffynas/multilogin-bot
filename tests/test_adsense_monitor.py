"""
Unit tests for AdSense Testing Monitor
"""

import unittest
import time
from unittest.mock import Mock, patch
from tests import BaseTestCase

from src.core.adsense_testing_monitor import AdSenseTestingMonitor

class TestAdSenseTestingMonitor(BaseTestCase):
    """Test cases for AdSense Testing Monitor"""
    
    def setUp(self):
        super().setUp()
        self.monitor = AdSenseTestingMonitor(self.test_config)
    
    def test_initialization(self):
        """Test monitor initialization"""
        self.assertEqual(self.monitor.daily_metrics["total_sessions"], 0)
        self.assertEqual(self.monitor.daily_metrics["total_pageviews"], 0)
        self.assertEqual(self.monitor.daily_metrics["ctr"], 0.0)
        self.assertTrue(self.monitor.adsense_config["enabled"])
    
    def test_validate_session_safety_success(self):
        """Test successful session safety validation"""
        session_data = self.create_mock_session_data()
        session_data["duration"] = 300  # 5 minutes
        
        result = self.monitor.validate_session_safety(session_data)
        
        self.assertTrue(result["safe"])
        self.assertFalse(result["blocked"])
        self.assertEqual(len(result["warnings"]), 0)
    
    def test_validate_session_safety_too_short(self):
        """Test session safety validation with too short duration"""
        session_data = self.create_mock_session_data()
        session_data["duration"] = 60  # 1 minute (too short)
        
        result = self.monitor.validate_session_safety(session_data)
        
        self.assertTrue(result["safe"])  # Still safe, just warning
        self.assertFalse(result["blocked"])
        self.assertGreater(len(result["warnings"]), 0)
        self.assertIn("Session too short", result["warnings"][0])
    
    def test_validate_session_safety_daily_limit(self):
        """Test session safety validation when daily limit reached"""
        # Set daily sessions to limit
        self.monitor.daily_metrics["total_sessions"] = 50
        
        session_data = self.create_mock_session_data()
        result = self.monitor.validate_session_safety(session_data)
        
        self.assertFalse(result["safe"])
        self.assertTrue(result["blocked"])
        self.assertIn("Daily session limit reached", result["warnings"])
    
    def test_detect_suspicious_patterns_too_many_clicks(self):
        """Test detection of too many clicks"""
        session_data = self.create_mock_session_data()
        session_data["interactions"] = [
            {"type": "click", "timestamp": time.time() + i}
            for i in range(10)  # 10 clicks (too many)
        ]
        
        patterns = self.monitor.detect_suspicious_patterns(session_data)
        
        self.assertIn("Too many clicks detected", patterns)
    
    def test_detect_suspicious_patterns_excessive_scrolling(self):
        """Test detection of excessive scrolling"""
        session_data = self.create_mock_session_data()
        session_data["interactions"] = [
            {"type": "scroll", "timestamp": time.time() + i}
            for i in range(25)  # 25 scrolls (too many)
        ]
        
        patterns = self.monitor.detect_suspicious_patterns(session_data)
        
        self.assertIn("Excessive scrolling detected", patterns)
    
    def test_detect_suspicious_patterns_too_fast(self):
        """Test detection of too fast interactions"""
        session_data = self.create_mock_session_data()
        current_time = time.time()
        session_data["interactions"] = [
            {"type": "click", "timestamp": current_time + i * 0.5}  # 0.5s intervals (too fast)
            for i in range(5)
        ]
        
        patterns = self.monitor.detect_suspicious_patterns(session_data)
        
        self.assertIn("Interactions too fast", patterns)
    
    def test_update_metrics(self):
        """Test metrics update"""
        session_data = self.create_mock_session_data()
        session_data["page_views"] = 3
        
        initial_sessions = self.monitor.daily_metrics["total_sessions"]
        initial_pageviews = self.monitor.daily_metrics["total_pageviews"]
        
        self.monitor.update_metrics(session_data)
        
        self.assertEqual(self.monitor.daily_metrics["total_sessions"], initial_sessions + 1)
        self.assertEqual(self.monitor.daily_metrics["total_pageviews"], initial_pageviews + 3)
        self.assertEqual(self.monitor.daily_metrics["total_impressions"], initial_pageviews + 3)
    
    def test_check_daily_limits_not_reached(self):
        """Test daily limits check when not reached"""
        result = self.monitor.check_daily_limits()
        
        self.assertTrue(result["can_continue"])
        self.assertFalse(result["sessions_limit_reached"])
        self.assertFalse(result["revenue_limit_reached"])
        self.assertFalse(result["ctr_limit_reached"])
    
    def test_check_daily_limits_sessions_reached(self):
        """Test daily limits check when sessions limit reached"""
        self.monitor.daily_metrics["total_sessions"] = 50
        
        result = self.monitor.check_daily_limits()
        
        self.assertFalse(result["can_continue"])
        self.assertTrue(result["sessions_limit_reached"])
    
    def test_check_daily_limits_revenue_reached(self):
        """Test daily limits check when revenue limit reached"""
        self.monitor.daily_metrics["estimated_revenue"] = 0.02  # Over limit
        
        result = self.monitor.check_daily_limits()
        
        self.assertFalse(result["can_continue"])
        self.assertTrue(result["revenue_limit_reached"])
    
    def test_check_daily_limits_ctr_reached(self):
        """Test daily limits check when CTR limit reached"""
        self.monitor.daily_metrics["total_impressions"] = 100
        self.monitor.daily_metrics["total_clicks"] = 3  # 3% CTR (over 2% limit)
        
        result = self.monitor.check_daily_limits()
        
        self.assertFalse(result["can_continue"])
        self.assertTrue(result["ctr_limit_reached"])
    
    def test_generate_adsense_report(self):
        """Test AdSense report generation"""
        # Add some test data
        self.monitor.daily_metrics["total_sessions"] = 10
        self.monitor.daily_metrics["total_pageviews"] = 25
        self.monitor.daily_metrics["ctr"] = 0.005
        
        report = self.monitor.generate_adsense_report()
        
        self.assertIn("date", report)
        self.assertIn("metrics", report)
        self.assertIn("safety_status", report)
        self.assertIn("recommendations", report)
        self.assertIn("warnings", report)
        
        self.assertEqual(report["metrics"]["total_sessions"], 10)
        self.assertEqual(report["metrics"]["total_pageviews"], 25)
        self.assertEqual(report["metrics"]["ctr"], 0.005)
    
    def test_get_safety_recommendations(self):
        """Test safety recommendations generation"""
        # Set up some test conditions
        self.monitor.daily_metrics["total_sessions"] = 35  # Close to limit
        self.monitor.daily_metrics["ctr"] = 0.006  # Getting high
        
        recommendations = self.monitor.get_safety_recommendations()
        
        self.assertIsInstance(recommendations, list)
        self.assertGreater(len(recommendations), 0)
        
        # Check for specific recommendations
        recommendation_texts = [rec.lower() for rec in recommendations]
        self.assertTrue(any("reduce" in rec for rec in recommendation_texts))
        self.assertTrue(any("monitor" in rec for rec in recommendation_texts))
    
    def test_reset_daily_metrics(self):
        """Test daily metrics reset"""
        # Add some data
        self.monitor.daily_metrics["total_sessions"] = 10
        self.monitor.daily_metrics["total_pageviews"] = 25
        self.monitor.daily_metrics["session_timestamps"] = [time.time()]
        
        self.monitor.reset_daily_metrics()
        
        self.assertEqual(self.monitor.daily_metrics["total_sessions"], 0)
        self.assertEqual(self.monitor.daily_metrics["total_pageviews"], 0)
        self.assertEqual(len(self.monitor.daily_metrics["session_timestamps"]), 0)

if __name__ == '__main__':
    unittest.main()
