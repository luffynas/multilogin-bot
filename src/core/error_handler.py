"""
Error Handling and Recovery System
Provides robust error handling, retry mechanisms, and graceful degradation
"""

import time
import logging
import traceback
from typing import Dict, List, Optional, Callable, Any
from functools import wraps
from enum import Enum
import random

class ErrorSeverity(Enum):
    """Error severity levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class ErrorCategory(Enum):
    """Error categories"""
    CONNECTION = "connection"
    AUTHENTICATION = "authentication"
    CONFIGURATION = "configuration"
    RESOURCE = "resource"
    TIMEOUT = "timeout"
    VALIDATION = "validation"
    UNKNOWN = "unknown"

class BotError(Exception):
    """Custom exception for bot-related errors"""
    def __init__(self, message: str, category: ErrorCategory, severity: ErrorSeverity, 
                 retryable: bool = True, context: Dict = None):
        super().__init__(message)
        self.category = category
        self.severity = severity
        self.retryable = retryable
        self.context = context or {}
        self.timestamp = time.time()

class ErrorHandler:
    """Centralized error handling and recovery system"""
    
    def __init__(self, config: Dict):
        self.config = config
        self.logger = logging.getLogger(__name__)
        
        # Error tracking
        self.error_history = []
        self.retry_counts = {}
        self.blacklisted_resources = set()
        
        # Retry configuration
        self.retry_config = {
            "max_retries": config.get("error_handling", {}).get("max_retries", 3),
            "base_delay": config.get("error_handling", {}).get("base_delay", 1),
            "max_delay": config.get("error_handling", {}).get("max_delay", 60),
            "backoff_factor": config.get("error_handling", {}).get("backoff_factor", 2),
            "jitter": config.get("error_handling", {}).get("jitter", 0.1)
        }
        
        # Error thresholds
        self.thresholds = {
            "max_errors_per_hour": config.get("error_handling", {}).get("max_errors_per_hour", 10),
            "max_errors_per_session": config.get("error_handling", {}).get("max_errors_per_session", 3),
            "critical_error_threshold": config.get("error_handling", {}).get("critical_error_threshold", 5)
        }
    
    def handle_error(self, error: Exception, context: Dict = None) -> Dict:
        """Handle an error and determine recovery action"""
        error_info = self.analyze_error(error, context)
        
        # Log error
        self.log_error(error_info)
        
        # Track error
        self.error_history.append(error_info)
        
        # Check if we should stop
        if self.should_stop_execution(error_info):
            raise BotError(
                "Too many errors, stopping execution",
                ErrorCategory.UNKNOWN,
                ErrorSeverity.CRITICAL,
                retryable=False
            )
        
        # Determine recovery action
        recovery_action = self.determine_recovery_action(error_info)
        
        return {
            "error_info": error_info,
            "recovery_action": recovery_action,
            "should_retry": recovery_action.get("retry", False),
            "delay": recovery_action.get("delay", 0)
        }
    
    def analyze_error(self, error: Exception, context: Dict = None) -> Dict:
        """Analyze error and categorize it"""
        error_info = {
            "error": error,
            "message": str(error),
            "type": type(error).__name__,
            "timestamp": time.time(),
            "context": context or {},
            "traceback": traceback.format_exc()
        }
        
        # Categorize error
        if "connection" in str(error).lower() or "timeout" in str(error).lower():
            error_info["category"] = ErrorCategory.CONNECTION
            error_info["severity"] = ErrorSeverity.MEDIUM
            error_info["retryable"] = True
        elif "authentication" in str(error).lower() or "unauthorized" in str(error).lower():
            error_info["category"] = ErrorCategory.AUTHENTICATION
            error_info["severity"] = ErrorSeverity.HIGH
            error_info["retryable"] = False
        elif "config" in str(error).lower() or "configuration" in str(error).lower():
            error_info["category"] = ErrorCategory.CONFIGURATION
            error_info["severity"] = ErrorSeverity.HIGH
            error_info["retryable"] = False
        elif "resource" in str(error).lower() or "limit" in str(error).lower():
            error_info["category"] = ErrorCategory.RESOURCE
            error_info["severity"] = ErrorSeverity.MEDIUM
            error_info["retryable"] = True
        else:
            error_info["category"] = ErrorCategory.UNKNOWN
            error_info["severity"] = ErrorSeverity.MEDIUM
            error_info["retryable"] = True
        
        return error_info
    
    def log_error(self, error_info: Dict):
        """Log error with appropriate level"""
        log_message = f"Error [{error_info['category'].value}]: {error_info['message']}"
        
        if error_info["severity"] == ErrorSeverity.CRITICAL:
            self.logger.critical(log_message, extra={"error_info": error_info})
        elif error_info["severity"] == ErrorSeverity.HIGH:
            self.logger.error(log_message, extra={"error_info": error_info})
        elif error_info["severity"] == ErrorSeverity.MEDIUM:
            self.logger.warning(log_message, extra={"error_info": error_info})
        else:
            self.logger.info(log_message, extra={"error_info": error_info})
    
    def should_stop_execution(self, error_info: Dict) -> bool:
        """Determine if execution should stop due to too many errors"""
        current_time = time.time()
        hour_ago = current_time - 3600
        
        # Count errors in last hour
        recent_errors = [e for e in self.error_history if e["timestamp"] > hour_ago]
        
        if len(recent_errors) >= self.thresholds["max_errors_per_hour"]:
            return True
        
        # Count critical errors
        critical_errors = [e for e in recent_errors if e["severity"] == ErrorSeverity.CRITICAL]
        if len(critical_errors) >= self.thresholds["critical_error_threshold"]:
            return True
        
        return False
    
    def determine_recovery_action(self, error_info: Dict) -> Dict:
        """Determine appropriate recovery action"""
        if not error_info["retryable"]:
            return {"retry": False, "action": "stop"}
        
        # Get retry count for this error type
        error_key = f"{error_info['category'].value}_{error_info['type']}"
        retry_count = self.retry_counts.get(error_key, 0)
        
        if retry_count >= self.retry_config["max_retries"]:
            return {"retry": False, "action": "skip", "reason": "max_retries_exceeded"}
        
        # Calculate delay with exponential backoff and jitter
        delay = min(
            self.retry_config["base_delay"] * (self.retry_config["backoff_factor"] ** retry_count),
            self.retry_config["max_delay"]
        )
        
        # Add jitter
        jitter = delay * self.retry_config["jitter"] * random.uniform(-1, 1)
        delay += jitter
        
        return {
            "retry": True,
            "action": "retry",
            "delay": max(0, delay),
            "retry_count": retry_count + 1
        }
    
    def retry_with_backoff(self, func: Callable, *args, **kwargs) -> Any:
        """Execute function with retry and backoff"""
        error_key = f"{func.__name__}"
        retry_count = 0
        
        while retry_count <= self.retry_config["max_retries"]:
            try:
                return func(*args, **kwargs)
            except Exception as e:
                retry_count += 1
                self.retry_counts[error_key] = retry_count
                
                if retry_count > self.retry_config["max_retries"]:
                    raise e
                
                # Calculate delay
                delay = min(
                    self.retry_config["base_delay"] * (self.retry_config["backoff_factor"] ** (retry_count - 1)),
                    self.retry_config["max_delay"]
                )
                
                # Add jitter
                jitter = delay * self.retry_config["jitter"] * random.uniform(-1, 1)
                delay += jitter
                
                self.logger.warning(f"Retry {retry_count}/{self.retry_config['max_retries']} for {func.__name__} after {delay:.2f}s")
                time.sleep(max(0, delay))
    
    def get_error_summary(self) -> Dict:
        """Get summary of recent errors"""
        current_time = time.time()
        hour_ago = current_time - 3600
        
        recent_errors = [e for e in self.error_history if e["timestamp"] > hour_ago]
        
        summary = {
            "total_errors": len(self.error_history),
            "recent_errors": len(recent_errors),
            "errors_by_category": {},
            "errors_by_severity": {},
            "retry_counts": self.retry_counts.copy(),
            "blacklisted_resources": list(self.blacklisted_resources)
        }
        
        # Count by category
        for error in recent_errors:
            category = error["category"].value
            severity = error["severity"].value
            
            summary["errors_by_category"][category] = summary["errors_by_category"].get(category, 0) + 1
            summary["errors_by_severity"][severity] = summary["errors_by_severity"].get(severity, 0) + 1
        
        return summary
    
    def reset_error_tracking(self):
        """Reset error tracking (call at start of new day)"""
        self.error_history = []
        self.retry_counts = {}
        self.blacklisted_resources.clear()
        self.logger.info("Error tracking reset")

def handle_errors(error_handler: ErrorHandler, context: Dict = None):
    """Decorator for automatic error handling"""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except Exception as e:
                error_result = error_handler.handle_error(e, context)
                
                if error_result["should_retry"]:
                    time.sleep(error_result["delay"])
                    return error_handler.retry_with_backoff(func, *args, **kwargs)
                else:
                    raise e
        
        return wrapper
    return decorator
