"""
Configuration Validator
Validates and ensures configuration completeness and correctness
"""

import os
import re
from typing import Dict, List, Tuple, Optional
from urllib.parse import urlparse

class ConfigValidator:
    """Validates configuration settings"""
    
    def __init__(self):
        self.errors = []
        self.warnings = []
    
    def validate_config(self, config: Dict) -> Tuple[bool, List[str], List[str]]:
        """Validate entire configuration"""
        self.errors = []
        self.warnings = []
        
        # Validate required sections
        self._validate_required_sections(config)
        
        # Validate Multilogin configuration
        if "multilogin" in config:
            self._validate_multilogin_config(config["multilogin"])
        
        # Validate proxy configuration
        if "proxy" in config:
            self._validate_proxy_config(config["proxy"])
        
        # Validate target website configuration
        if "target_website" in config:
            self._validate_target_website_config(config["target_website"])
        
        # Validate behavior configuration
        if "behavior" in config:
            self._validate_behavior_config(config["behavior"])
        
        # Validate AdSense testing configuration
        if "adsense_testing" in config:
            self._validate_adsense_config(config["adsense_testing"])
        
        # Validate fingerprint configuration
        if "fingerprint" in config:
            self._validate_fingerprint_config(config["fingerprint"])
        
        # Validate referer simulation configuration
        if "referer_simulation" in config:
            self._validate_referer_config(config["referer_simulation"])
        
        return len(self.errors) == 0, self.errors, self.warnings
    
    def _validate_required_sections(self, config: Dict):
        """Validate that all required sections are present"""
        required_sections = ["multilogin", "proxy", "target_website", "behavior"]
        
        for section in required_sections:
            if section not in config:
                self.errors.append(f"Missing required configuration section: {section}")
    
    def _validate_multilogin_config(self, config: Dict):
        """Validate Multilogin configuration"""
        required_fields = ["api_key", "base_url"]
        
        for field in required_fields:
            if field not in config:
                self.errors.append(f"Missing required Multilogin field: {field}")
            elif not config[field]:
                self.errors.append(f"Multilogin {field} cannot be empty")
        
        # Validate API key format
        if "api_key" in config and config["api_key"]:
            if config["api_key"] == "YOUR_MULTILOGIN_API_KEY":
                self.errors.append("Multilogin API key must be set to actual value")
            elif len(config["api_key"]) < 10:
                self.warnings.append("Multilogin API key seems too short")
        
        # Validate base URL
        if "base_url" in config and config["base_url"]:
            try:
                urlparse(config["base_url"])
            except Exception:
                self.errors.append("Invalid Multilogin base URL format")
        
        # Validate numeric fields
        numeric_fields = ["max_concurrent_profiles", "profile_timeout"]
        for field in numeric_fields:
            if field in config:
                if not isinstance(config[field], (int, float)) or config[field] <= 0:
                    self.errors.append(f"Multilogin {field} must be a positive number")
    
    def _validate_proxy_config(self, config: Dict):
        """Validate proxy configuration"""
        required_fields = ["provider", "type", "total_count"]
        
        for field in required_fields:
            if field not in config:
                self.errors.append(f"Missing required proxy field: {field}")
            elif not config[field]:
                self.errors.append(f"Proxy {field} cannot be empty")
        
        # Validate proxy type
        if "type" in config and config["type"]:
            valid_types = ["socks5", "socks4", "http", "https"]
            if config["type"] not in valid_types:
                self.errors.append(f"Invalid proxy type: {config['type']}. Must be one of: {valid_types}")
        
        # Validate provider
        if "provider" in config and config["provider"]:
            valid_providers = ["oxylabs", "webshare", "brightdata", "test_provider"]
            if config["provider"] not in valid_providers:
                self.warnings.append(f"Unknown proxy provider: {config['provider']}")
        
        # Validate numeric fields
        numeric_fields = ["total_count", "daily_limit_per_proxy", "health_check_interval"]
        for field in numeric_fields:
            if field in config:
                if not isinstance(config[field], (int, float)) or config[field] <= 0:
                    self.errors.append(f"Proxy {field} must be a positive number")
        
        # Validate success rate
        if "success_rate_min" in config:
            rate = config["success_rate_min"]
            if not isinstance(rate, (int, float)) or rate < 0 or rate > 1:
                self.errors.append("Proxy success_rate_min must be between 0 and 1")
    
    def _validate_target_website_config(self, config: Dict):
        """Validate target website configuration"""
        required_fields = ["url"]
        
        for field in required_fields:
            if field not in config:
                self.errors.append(f"Missing required target website field: {field}")
            elif not config[field]:
                self.errors.append(f"Target website {field} cannot be empty")
        
        # Validate URL format
        if "url" in config and config["url"]:
            try:
                parsed = urlparse(config["url"])
                if not parsed.scheme or not parsed.netloc:
                    self.errors.append("Invalid target website URL format")
            except Exception:
                self.errors.append("Invalid target website URL format")
        
        # Validate numeric fields
        numeric_fields = ["reading_time_min", "reading_time_max"]
        for field in numeric_fields:
            if field in config:
                if not isinstance(config[field], (int, float)) or config[field] <= 0:
                    self.errors.append(f"Target website {field} must be a positive number")
        
        # Validate time range
        if "reading_time_min" in config and "reading_time_max" in config:
            min_time = config["reading_time_min"]
            max_time = config["reading_time_max"]
            if min_time >= max_time:
                self.errors.append("Target website reading_time_min must be less than reading_time_max")
    
    def _validate_behavior_config(self, config: Dict):
        """Validate behavior configuration"""
        required_fields = ["daily_visits_min", "daily_visits_max"]
        
        for field in required_fields:
            if field not in config:
                self.errors.append(f"Missing required behavior field: {field}")
            elif not isinstance(config[field], int) or config[field] <= 0:
                self.errors.append(f"Behavior {field} must be a positive integer")
        
        # Validate visit range
        if "daily_visits_min" in config and "daily_visits_max" in config:
            min_visits = config["daily_visits_min"]
            max_visits = config["daily_visits_max"]
            if min_visits >= max_visits:
                self.errors.append("Behavior daily_visits_min must be less than daily_visits_max")
            
            # Check for reasonable limits
            if max_visits > 1000:
                self.warnings.append("High daily visit count may cause performance issues")
        
        # Validate delay range
        if "session_delay_min" in config and "session_delay_max" in config:
            min_delay = config["session_delay_min"]
            max_delay = config["session_delay_max"]
            if min_delay >= max_delay:
                self.errors.append("Behavior session_delay_min must be less than session_delay_max")
    
    def _validate_adsense_config(self, config: Dict):
        """Validate AdSense testing configuration"""
        if not config.get("enabled", False):
            return  # Skip validation if not enabled
        
        # Validate revenue limit
        if "max_daily_revenue_test" in config:
            revenue = config["max_daily_revenue_test"]
            if not isinstance(revenue, (int, float)) or revenue < 0:
                self.errors.append("AdSense max_daily_revenue_test must be a non-negative number")
            elif revenue > 1.0:
                self.warnings.append("High daily revenue limit for testing")
        
        # Validate session spacing
        if "session_spacing_min" in config and "session_spacing_max" in config:
            min_spacing = config["session_spacing_min"]
            max_spacing = config["session_spacing_max"]
            if min_spacing >= max_spacing:
                self.errors.append("AdSense session_spacing_min must be less than session_spacing_max")
        
        # Validate probability fields
        probability_fields = ["click_probability", "hover_probability", "scroll_probability"]
        for field in probability_fields:
            if field in config:
                prob = config[field]
                if not isinstance(prob, (int, float)) or prob < 0 or prob > 1:
                    self.errors.append(f"AdSense {field} must be between 0 and 1")
    
    def _validate_fingerprint_config(self, config: Dict):
        """Validate fingerprint configuration"""
        boolean_fields = [
            "enable_geo_consistency",
            "enable_canvas_randomization",
            "enable_webrtc_protection",
            "enable_advanced_stealth",
            "enable_ai_behavior"
        ]
        
        for field in boolean_fields:
            if field in config and not isinstance(config[field], bool):
                self.errors.append(f"Fingerprint {field} must be a boolean value")
    
    def _validate_referer_config(self, config: Dict):
        """Validate referer simulation configuration"""
        if not config.get("enabled", False):
            return  # Skip validation if not enabled
        
        # Validate sources
        if "sources" in config:
            sources = config["sources"]
            if not isinstance(sources, list) or len(sources) == 0:
                self.errors.append("Referer sources must be a non-empty list")
            else:
                for source in sources:
                    if not isinstance(source, str):
                        self.errors.append("Referer sources must be strings")
                    elif not source.startswith("http"):
                        self.warnings.append(f"Referer source may not be valid URL: {source}")
        
        # Validate keywords
        if "keywords" in config:
            keywords = config["keywords"]
            if not isinstance(keywords, list) or len(keywords) == 0:
                self.errors.append("Referer keywords must be a non-empty list")
            else:
                for keyword in keywords:
                    if not isinstance(keyword, str) or len(keyword.strip()) == 0:
                        self.errors.append("Referer keywords must be non-empty strings")
    
    def get_config_summary(self, config: Dict) -> Dict:
        """Get configuration summary with validation status"""
        is_valid, errors, warnings = self.validate_config(config)
        
        summary = {
            "valid": is_valid,
            "errors": errors,
            "warnings": warnings,
            "sections": {},
            "recommendations": []
        }
        
        # Analyze each section
        sections = ["multilogin", "proxy", "target_website", "behavior", "adsense_testing", "fingerprint", "referer_simulation"]
        
        for section in sections:
            if section in config:
                summary["sections"][section] = {
                    "present": True,
                    "fields_count": len(config[section]) if isinstance(config[section], dict) else 0
                }
            else:
                summary["sections"][section] = {
                    "present": False,
                    "fields_count": 0
                }
        
        # Generate recommendations
        if not is_valid:
            summary["recommendations"].append("Fix all configuration errors before running the bot")
        
        if len(warnings) > 0:
            summary["recommendations"].append("Review configuration warnings for potential issues")
        
        if "multilogin" in config and config["multilogin"].get("api_key") == "YOUR_MULTILOGIN_API_KEY":
            summary["recommendations"].append("Set your actual Multilogin API key")
        
        if "proxy" in config and config["proxy"].get("provider") == "test_provider":
            summary["recommendations"].append("Configure actual proxy provider credentials")
        
        return summary
