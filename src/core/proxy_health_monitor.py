import requests
import time
import json
import threading
from typing import Dict, List, Optional, Tuple
import logging
from concurrent.futures import ThreadPoolExecutor, as_completed

class ProxyHealthMonitor:
    def __init__(self, config: Dict):
        self.config = config
        self.logger = logging.getLogger(__name__)
        
        # Health monitoring settings
        self.health_check_interval = config.get("proxy", {}).get("health_check_interval", 300)
        self.max_concurrent_checks = 10
        self.timeout = 30
        
        # Health database
        self.proxy_health_db = {}
        self.blacklisted_proxies = set()
        self.healthy_proxies = set()
        
        # Test endpoints
        self.test_endpoints = [
            "https://httpbin.org/ip",
            "https://api.ipify.org?format=json",
            "https://ipinfo.io/json",
            "https://api.myip.com"
        ]
        
        # Health criteria
        self.health_criteria = {
            "response_time_max": 10.0,  # seconds
            "success_rate_min": 0.8,    # 80%
            "geo_consistency": True,
            "no_captcha": True,
            "no_blocking": True
        }
    
    def check_proxy_health(self, proxy_config: Dict) -> Dict:
        """Comprehensive health check for a single proxy"""
        proxy_id = proxy_config.get("id", proxy_config.get("host", "unknown"))
        
        health_result = {
            "proxy_id": proxy_id,
            "timestamp": time.time(),
            "overall_health": 0.0,
            "response_time": 0.0,
            "success_rate": 0.0,
            "geo_consistency": True,
            "captcha_detected": False,
            "blocked": False,
            "errors": [],
            "recommendations": []
        }
        
        try:
            # Test proxy with multiple endpoints
            test_results = self.test_proxy_with_endpoints(proxy_config)
            
            # Calculate response time
            response_times = [r["response_time"] for r in test_results if r["success"]]
            if response_times:
                health_result["response_time"] = sum(response_times) / len(response_times)
            
            # Calculate success rate
            successful_tests = sum(1 for r in test_results if r["success"])
            health_result["success_rate"] = successful_tests / len(test_results)
            
            # Check for captcha or blocking
            for result in test_results:
                if result.get("captcha_detected"):
                    health_result["captcha_detected"] = True
                if result.get("blocked"):
                    health_result["blocked"] = True
            
            # Check geo consistency
            geo_results = [r.get("geo_info") for r in test_results if r.get("geo_info")]
            if geo_results:
                health_result["geo_consistency"] = self.check_geo_consistency(geo_results, proxy_config)
            
            # Calculate overall health score
            health_result["overall_health"] = self.calculate_health_score(health_result)
            
            # Generate recommendations
            health_result["recommendations"] = self.generate_health_recommendations(health_result)
            
            # Update health database
            self.update_proxy_health(proxy_id, health_result)
            
        except Exception as e:
            health_result["errors"].append(str(e))
            health_result["overall_health"] = 0.0
            self.logger.error(f"Error checking proxy health for {proxy_id}: {str(e)}")
        
        return health_result
    
    def test_proxy_with_endpoints(self, proxy_config: Dict) -> List[Dict]:
        """Test proxy with multiple endpoints"""
        results = []
        
        # Prepare proxy settings
        proxy_settings = {
            "http": f"socks5://{proxy_config['username']}:{proxy_config['password']}@{proxy_config['host']}:{proxy_config['port']}",
            "https": f"socks5://{proxy_config['username']}:{proxy_config['password']}@{proxy_config['host']}:{proxy_config['port']}"
        }
        
        for endpoint in self.test_endpoints:
            result = {
                "endpoint": endpoint,
                "success": False,
                "response_time": 0.0,
                "status_code": 0,
                "geo_info": None,
                "captcha_detected": False,
                "blocked": False,
                "error": None
            }
            
            try:
                start_time = time.time()
                
                response = requests.get(
                    endpoint,
                    proxies=proxy_settings,
                    timeout=self.timeout,
                    headers={
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
                    }
                )
                
                result["response_time"] = time.time() - start_time
                result["status_code"] = response.status_code
                
                if response.status_code == 200:
                    result["success"] = True
                    
                    # Parse response for geo info
                    try:
                        data = response.json()
                        result["geo_info"] = self.extract_geo_info(data, endpoint)
                    except:
                        pass
                    
                    # Check for captcha or blocking
                    result["captcha_detected"] = self.detect_captcha(response)
                    result["blocked"] = self.detect_blocking(response)
                
            except requests.exceptions.Timeout:
                result["error"] = "timeout"
            except requests.exceptions.ProxyError:
                result["error"] = "proxy_error"
            except requests.exceptions.ConnectionError:
                result["error"] = "connection_error"
            except Exception as e:
                result["error"] = str(e)
            
            results.append(result)
        
        return results
    
    def extract_geo_info(self, data: Dict, endpoint: str) -> Dict:
        """Extract geo information from response"""
        geo_info = {}
        
        if "httpbin.org" in endpoint:
            geo_info["ip"] = data.get("origin", "").split(",")[0].strip()
        elif "ipify.org" in endpoint:
            geo_info["ip"] = data.get("ip", "")
        elif "ipinfo.io" in endpoint:
            geo_info["ip"] = data.get("ip", "")
            geo_info["country"] = data.get("country", "")
            geo_info["region"] = data.get("region", "")
            geo_info["city"] = data.get("city", "")
        elif "myip.com" in endpoint:
            geo_info["ip"] = data.get("ip", "")
            geo_info["country"] = data.get("cc", "")
        
        return geo_info
    
    def detect_captcha(self, response) -> bool:
        """Detect if response contains captcha"""
        captcha_indicators = [
            "captcha",
            "recaptcha",
            "cloudflare",
            "challenge",
            "verify",
            "robot",
            "automation"
        ]
        
        content = response.text.lower()
        return any(indicator in content for indicator in captcha_indicators)
    
    def detect_blocking(self, response) -> bool:
        """Detect if response indicates blocking"""
        blocking_indicators = [
            "access denied",
            "blocked",
            "forbidden",
            "rate limited",
            "too many requests",
            "suspicious activity"
        ]
        
        content = response.text.lower()
        return any(indicator in content for indicator in blocking_indicators)
    
    def check_geo_consistency(self, geo_results: List[Dict], proxy_config: Dict) -> bool:
        """Check if geo information is consistent"""
        if not geo_results:
            return True
        
        # Extract IPs
        ips = [geo.get("ip") for geo in geo_results if geo.get("ip")]
        if not ips:
            return True
        
        # Check if all IPs are the same
        unique_ips = set(ips)
        if len(unique_ips) > 1:
            return False
        
        # Check if IP matches expected geo
        expected_geo = proxy_config.get("geo", "")
        if expected_geo:
            countries = [geo.get("country") for geo in geo_results if geo.get("country")]
            if countries and expected_geo not in countries:
                return False
        
        return True
    
    def calculate_health_score(self, health_result: Dict) -> float:
        """Calculate overall health score (0.0 to 1.0)"""
        score = 0.0
        
        # Response time score (30% weight)
        if health_result["response_time"] <= self.health_criteria["response_time_max"]:
            response_score = 1.0 - (health_result["response_time"] / self.health_criteria["response_time_max"])
            score += response_score * 0.3
        
        # Success rate score (40% weight)
        if health_result["success_rate"] >= self.health_criteria["success_rate_min"]:
            score += health_result["success_rate"] * 0.4
        
        # Geo consistency score (15% weight)
        if health_result["geo_consistency"]:
            score += 0.15
        
        # No captcha score (10% weight)
        if not health_result["captcha_detected"]:
            score += 0.10
        
        # No blocking score (5% weight)
        if not health_result["blocked"]:
            score += 0.05
        
        return min(1.0, max(0.0, score))
    
    def generate_health_recommendations(self, health_result: Dict) -> List[str]:
        """Generate recommendations based on health results"""
        recommendations = []
        
        if health_result["response_time"] > self.health_criteria["response_time_max"]:
            recommendations.append("Response time too slow - consider replacing proxy")
        
        if health_result["success_rate"] < self.health_criteria["success_rate_min"]:
            recommendations.append("Low success rate - proxy may be unreliable")
        
        if health_result["captcha_detected"]:
            recommendations.append("Captcha detected - proxy may be flagged")
        
        if health_result["blocked"]:
            recommendations.append("Proxy appears to be blocked")
        
        if not health_result["geo_consistency"]:
            recommendations.append("Geo information inconsistent - proxy may be misconfigured")
        
        if health_result["overall_health"] < 0.5:
            recommendations.append("Overall health poor - recommend replacement")
        
        return recommendations
    
    def update_proxy_health(self, proxy_id: str, health_result: Dict):
        """Update proxy health database"""
        self.proxy_health_db[proxy_id] = health_result
        
        # Update blacklist/whitelist
        if health_result["overall_health"] < 0.3:
            self.blacklisted_proxies.add(proxy_id)
            if proxy_id in self.healthy_proxies:
                self.healthy_proxies.remove(proxy_id)
        elif health_result["overall_health"] > 0.7:
            self.healthy_proxies.add(proxy_id)
            if proxy_id in self.blacklisted_proxies:
                self.blacklisted_proxies.remove(proxy_id)
    
    def get_healthy_proxies(self, count: int = None) -> List[str]:
        """Get list of healthy proxy IDs"""
        healthy_list = list(self.healthy_proxies)
        
        if count:
            return healthy_list[:count]
        
        return healthy_list
    
    def get_proxy_health_summary(self) -> Dict:
        """Get summary of proxy health status"""
        total_proxies = len(self.proxy_health_db)
        healthy_count = len(self.healthy_proxies)
        blacklisted_count = len(self.blacklisted_proxies)
        
        if total_proxies == 0:
            return {
                "total_proxies": 0,
                "healthy_proxies": 0,
                "blacklisted_proxies": 0,
                "health_rate": 0.0
            }
        
        return {
            "total_proxies": total_proxies,
            "healthy_proxies": healthy_count,
            "blacklisted_proxies": blacklisted_count,
            "health_rate": healthy_count / total_proxies,
            "average_health_score": sum(h["overall_health"] for h in self.proxy_health_db.values()) / total_proxies
        }
    
    def batch_health_check(self, proxy_configs: List[Dict]) -> List[Dict]:
        """Perform health check on multiple proxies concurrently"""
        results = []
        
        with ThreadPoolExecutor(max_workers=self.max_concurrent_checks) as executor:
            # Submit health check tasks
            future_to_proxy = {
                executor.submit(self.check_proxy_health, proxy_config): proxy_config
                for proxy_config in proxy_configs
            }
            
            # Collect results
            for future in as_completed(future_to_proxy):
                try:
                    result = future.result()
                    results.append(result)
                except Exception as e:
                    proxy_config = future_to_proxy[future]
                    proxy_id = proxy_config.get("id", "unknown")
                    self.logger.error(f"Error in batch health check for {proxy_id}: {str(e)}")
        
        return results
    
    def start_health_monitoring(self, proxy_configs: List[Dict]):
        """Start continuous health monitoring"""
        def monitor_loop():
            while True:
                try:
                    self.logger.info("Starting batch health check...")
                    results = self.batch_health_check(proxy_configs)
                    
                    # Log summary
                    summary = self.get_proxy_health_summary()
                    self.logger.info(f"Health check completed: {summary}")
                    
                    # Wait for next check
                    time.sleep(self.health_check_interval)
                    
                except Exception as e:
                    self.logger.error(f"Error in health monitoring loop: {str(e)}")
                    time.sleep(60)  # Wait 1 minute before retry
        
        # Start monitoring in background thread
        monitor_thread = threading.Thread(target=monitor_loop, daemon=True)
        monitor_thread.start()
        
        self.logger.info("Health monitoring started")
    
    def is_proxy_healthy(self, proxy_id: str) -> bool:
        """Check if specific proxy is healthy"""
        if proxy_id in self.blacklisted_proxies:
            return False
        
        health_data = self.proxy_health_db.get(proxy_id)
        if not health_data:
            return True  # Assume healthy if no data
        
        return health_data["overall_health"] > 0.5
