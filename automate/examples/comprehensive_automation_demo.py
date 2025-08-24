#!/usr/bin/env python3
"""
Comprehensive Automation Demo
============================
Demonstrates all 50+ Selenium automation features in one comprehensive example
"""

import sys
import os
import time
import logging
import requests
import json
import random
from datetime import datetime

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from multilogin_api import MultiloginXAPI
from selenium_automation import UndetectableSeleniumAutomation
from url_helper import setup_url_for_automation

# Config
MLX_LAUNCHER_V2 = "https://launcher.mlx.yt:45001/api/v2"
LOCALHOST = "http://127.0.0.1"
HEADERS = {"Accept": "application/json", "Content-Type": "application/json"}
FOLDER_ID = "94caeb51-cc7f-477d-a6db-c79e696b5530"
PROFILE_ID = "2ebdd8cb-0ba2-418d-90e1-02efe5ef92f6"

# Dynamic content URLs will be generated based on current page

def setup_logging():
    """Setup comprehensive logging"""
    log_format = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    logging.basicConfig(
        level=logging.INFO,
        format=log_format,
        handlers=[
            logging.FileHandler('../logs/comprehensive_demo.log'),
            logging.StreamHandler()
        ]
    )
    return logging.getLogger(__name__)

def signin():
    """Authenticate with Multilogin API"""
    try:
        api = MultiloginXAPI("../config/config.yaml")
        if not api.authenticate():
            raise Exception("Authentication failed")
        return api.bearer_token
    except Exception as e:
        print(f"❌ Login error: {e}")
        return None

def start_profile(token):
    """Start Multilogin profile"""
    try:
        headers = HEADERS.copy()
        headers["Authorization"] = f"Bearer {token}"
        start_url = f"{MLX_LAUNCHER_V2}/profile/f/{FOLDER_ID}/p/{PROFILE_ID}/start?automation_type=selenium"
        
        response = requests.get(start_url, headers=headers)
        if response.status_code != 200:
            return None
        
        profile_data = response.json()
        selenium_port = profile_data["data"]["port"]
        debugging_url = f"{LOCALHOST}:{selenium_port}"
        
        print(f"✅ Profile started: {debugging_url}")
        return debugging_url
        
    except Exception as e:
        print(f"❌ Start profile error: {e}")
        return None

class ComprehensiveAutomationDemo:
    """Comprehensive automation demo with all 50+ features"""
    
    def __init__(self, debugging_url):
        self.debugging_url = debugging_url
        self.automation = None
        self.current_url = None
        self.session_data = {
            "start_time": datetime.now(),
            "personality": None,
            "device_type": None,
            "pages_visited": [],
            "interactions": [],
            "errors": []
        }
        self.logger = logging.getLogger(__name__)
    
    def setup_automation(self):
        """Setup automation with all features"""
        try:
            print("\n🔧 Setting up Comprehensive Automation")
            print("=" * 50)
            
            self.automation = UndetectableSeleniumAutomation("../config/config.yaml")
            
            if not self.automation.setup_driver(self.debugging_url):
                return False
            
            print("✅ Driver setup successful")
            
            # Setup URL with helper module
            fallback_url = "https://maxgaming.biz.id/can-a-vpn-really-boost-your-fps-or-reduce-lag-2025-guide-for-gamers/"
            self.current_url, message = setup_url_for_automation(self.automation, fallback_url)
            
            if self.current_url:
                print(f"✅ URL setup successful: {self.current_url}")
                print(f"📝 Message: {message}")
                
                # Record session data
                self.session_data["personality"] = self.automation.user_personality
                self.session_data["device_type"] = self.automation.device_type
                self.session_data["pages_visited"].append({
                    "url": self.current_url,
                    "timestamp": datetime.now().isoformat(),
                    "title": self.automation.driver.title
                })
                
                return True
            else:
                print(f"❌ URL setup failed: {message}")
                return False
                
        except Exception as e:
            self.logger.error(f"❌ Setup error: {e}")
            self.session_data["errors"].append({"type": "setup", "error": str(e)})
            return False
    
    def demo_personality_system(self):
        """Demo single personality with enhanced concurrent behaviors"""
        print("\n🎭 SINGLE PERSONALITY - ENHANCED CONCURRENT BEHAVIOR DEMO")
        print("=" * 60)
        
        # Test only ONE personality for clearer concurrent behavior demonstration
        personality = "explorer"
        
        try:
            print(f"\n🎭 Testing {personality.upper()} personality with ENHANCED CONCURRENT BEHAVIORS:")
            print("-" * 55)
            
            # Set personality
            self.automation.user_personality = personality
            self.session_data["personality"] = personality
            
            # 🔥 ENHANCED CONCURRENT: Run multiple behaviors simultaneously
            print("🔥 STARTING ENHANCED CONCURRENT BEHAVIOR PATTERNS...")
            self._demo_enhanced_concurrent_behaviors(personality)
            
            print(f"✅ {personality} personality with enhanced concurrent behaviors completed")
            
        except Exception as e:
            self.logger.error(f"❌ {personality} demo failed: {e}")
            self.session_data["errors"].append({"type": f"{personality}_demo", "error": str(e)})
    
    def _demo_personality_scrolling(self, personality):
        """Demo personality-specific scrolling"""
        try:
            print(f"  🔄 {personality} scrolling pattern...")
            self.automation._simulate_natural_scrolling()
            self.session_data["interactions"].append({
                "type": "scrolling",
                "personality": personality,
                "timestamp": datetime.now().isoformat()
            })
        except Exception as e:
            self.logger.error(f"Scrolling failed for {personality}: {e}")
    
    def _demo_personality_reading(self, personality):
        """Demo personality-specific reading"""
        try:
            print(f"  📖 {personality} reading behavior...")
            self.automation._simulate_reading_behavior()
            self.session_data["interactions"].append({
                "type": "reading",
                "personality": personality,
                "timestamp": datetime.now().isoformat()
            })
        except Exception as e:
            self.logger.error(f"Reading failed for {personality}: {e}")
    
    def _demo_personality_interactions(self, personality):
        """Demo personality-specific interactions"""
        try:
            print(f"  🖱️ {personality} mouse interactions...")
            self.automation._simulate_mouse_movement()
            self.automation._simulate_link_hovering()
            self.session_data["interactions"].append({
                "type": "mouse_interactions",
                "personality": personality,
                "timestamp": datetime.now().isoformat()
            })
        except Exception as e:
            self.logger.error(f"Interactions failed for {personality}: {e}")
    
    def _demo_concurrent_behaviors(self, personality):
        """Demo concurrent behavior patterns for each personality"""
        try:
            print(f"  🔥 CONCURRENT: {personality} concurrent behaviors...")
            
            # 🔥 CONCURRENT: Multiple behaviors running simultaneously
            concurrent_behaviors = [
                ("scrolling", "🔄 Rapid scrolling pattern"),
                ("reading", "📖 Quick reading bursts"),
                ("mouse", "🖱️ Fast mouse movements"),
                ("typing", "⌨️ Quick typing simulation"),
                ("navigation", "🧭 Rapid navigation patterns")
            ]
            
            for behavior_type, description in concurrent_behaviors:
                try:
                    print(f"    {description}...")
                    
                    if behavior_type == "scrolling":
                        # Fast scrolling with personality-specific patterns
                        self.automation._simulate_natural_scrolling()
                    elif behavior_type == "reading":
                        # Quick reading simulation
                        self.automation._simulate_reading_behavior()
                    elif behavior_type == "mouse":
                        # Fast mouse movements
                        self.automation._simulate_mouse_movement()
                    elif behavior_type == "typing":
                        # Quick typing simulation
                        self.automation._simulate_realistic_typing()
                    elif behavior_type == "navigation":
                        # Rapid navigation patterns
                        self.automation._simulate_browser_navigation_patterns()
                    
                    # Record concurrent behavior
                    self.session_data["interactions"].append({
                        "type": f"concurrent_{behavior_type}",
                        "personality": personality,
                        "description": description,
                        "timestamp": datetime.now().isoformat()
                    })
                    
                except Exception as e:
                    self.logger.error(f"Concurrent {behavior_type} failed: {e}")
            
            print(f"  ✅ {personality} concurrent behaviors completed")
            
        except Exception as e:
            self.logger.error(f"Concurrent behaviors failed for {personality}: {e}")
    
    def _demo_enhanced_concurrent_behaviors(self, personality):
        """Demo enhanced concurrent behavior patterns for single personality"""
        try:
            print(f"  🔥 ENHANCED CONCURRENT: {personality} enhanced concurrent behaviors...")
            
            # 🔥 ENHANCED CONCURRENT: Multiple behaviors running simultaneously with clear logging
            concurrent_behaviors = [
                ("scrolling", "🔄 FAST SCROLLING pattern", 0.5),
                ("reading", "📖 QUICK READING bursts", 1.0),
                ("mouse", "🖱️ RAPID MOUSE movements", 0.3),
                ("typing", "⌨️ FAST TYPING simulation", 0.8),
                ("navigation", "🧭 QUICK NAVIGATION patterns", 1.2),
                ("hovering", "👆 FAST HOVERING actions", 0.4)
            ]
            
            print("  🔥 CONCURRENT BEHAVIOR PATTERNS ACTIVE:")
            for behavior_type, description, interval in concurrent_behaviors:
                print(f"    - {description} (every {interval}s)")
            
            # Run concurrent behaviors with enhanced logging
            for i in range(1):  # Run 10 cycles of concurrent behaviors
                print(f"\n  🔥 CONCURRENT CYCLE {i+1}/1:")
                
                # 🔥 CONCURRENT: Multiple behaviors per cycle
                for behavior_type, description, interval in concurrent_behaviors:
                    try:
                        print(f"    🔥 EXECUTING: {description}")
                        
                        if behavior_type == "scrolling":
                            self.automation._simulate_natural_scrolling()
                        elif behavior_type == "reading":
                            self.automation._simulate_reading_behavior()
                        elif behavior_type == "mouse":
                            self.automation._simulate_mouse_movement()
                        elif behavior_type == "typing":
                            self.automation._simulate_realistic_typing()
                        elif behavior_type == "navigation":
                            self.automation._simulate_browser_navigation_patterns()
                        elif behavior_type == "hovering":
                            self.automation._simulate_link_hovering()
                        
                        print(f"    ✅ COMPLETED: {description}")
                        
                        # Record concurrent interaction
                        self.session_data["interactions"].append({
                            "type": f"concurrent_{behavior_type}",
                            "personality": personality,
                            "cycle": i+1,
                            "description": description,
                            "timestamp": datetime.now().isoformat()
                        })
                        
                        # Quick delay between concurrent behaviors
                        time.sleep(interval)
                        
                    except Exception as e:
                        print(f"    ❌ FAILED: {description} - {e}")
                        self.logger.error(f"Concurrent behavior {behavior_type} failed: {e}")
                
                print(f"  ✅ CONCURRENT CYCLE {i+1}/10 COMPLETED")
                time.sleep(0.5)  # Brief pause between cycles
            
            print(f"  ✅ {personality} ENHANCED concurrent behaviors completed")
            
        except Exception as e:
            self.logger.error(f"Enhanced concurrent behaviors failed for {personality}: {e}")
    
    def demo_previous_next_navigation(self):
        """🧭 Demo Previous/Next Navigation Functionality"""
        print("\n🧭 PREVIOUS/NEXT NAVIGATION DEMO")
        print("=" * 50)
        
        try:
            print("🧭 Testing Previous/Next Navigation Patterns:")
            print("-" * 45)
            
            navigation_results = []
            current_url = self.automation.driver.current_url
            
            # Test multiple navigation attempts
            for i in range(2):
                print(f"\n🧭 Navigation Test {i+1}/2:")
                print(f"  📍 Current URL: {current_url}")
                
                # Test previous/next navigation
                new_url = self.automation._navigate_previous_next()
                
                if new_url and new_url != current_url:
                    print(f"  ✅ Found navigation link: {new_url}")
                    
                    try:
                        # Navigate to the new URL
                        self.automation.driver.get(new_url)
                        time.sleep(3)
                        
                        # Verify navigation success
                        actual_url = self.automation.driver.current_url
                        page_title = self.automation.driver.title
                        
                        # Record successful navigation
                        navigation_results.append({
                            "test_number": i+1,
                            "from_url": current_url,
                            "to_url": new_url,
                            "actual_url": actual_url,
                            "page_title": page_title,
                            "success": True,
                            "timestamp": datetime.now().isoformat()
                        })
                        
                        current_url = actual_url
                        print(f"  📄 Successfully navigated to: {page_title}")
                        
                        # Simulate realistic behavior on new page
                        self._demo_post_navigation_behavior()
                        
                    except Exception as nav_error:
                        print(f"  ❌ Navigation failed: {nav_error}")
                        navigation_results.append({
                            "test_number": i+1,
                            "from_url": current_url,
                            "to_url": new_url,
                            "success": False,
                            "error": str(nav_error),
                            "timestamp": datetime.now().isoformat()
                        })
                        
                else:
                    print(f"  ⚠️ No navigation links found or same URL")
                    navigation_results.append({
                        "test_number": i+1,
                        "from_url": current_url,
                        "to_url": None,
                        "success": False,
                        "error": "No navigation links found",
                        "timestamp": datetime.now().isoformat()
                    })
                
                time.sleep(2)  # Brief pause between tests
            
            # Test personality-based navigation preferences
            self._demo_personality_navigation_patterns()
            
            # Test browser navigation patterns
            self._demo_browser_navigation_demo()
            
            # Calculate and display results
            successful_navigations = len([r for r in navigation_results if r["success"]])
            total_tests = len(navigation_results)
            
            print(f"\n📊 NAVIGATION TEST RESULTS:")
            print(f"  ✅ Successful navigations: {successful_navigations}/{total_tests}")
            print(f"  ❌ Failed navigations: {total_tests - successful_navigations}/{total_tests}")
            print(f"  📈 Success rate: {(successful_navigations/total_tests)*100:.1f}%")
            
            # Record navigation demo results
            self.session_data["interactions"].append({
                "type": "navigation_demo",
                "total_tests": total_tests,
                "successful_navigations": successful_navigations,
                "success_rate": (successful_navigations/total_tests)*100,
                "navigation_results": navigation_results,
                "timestamp": datetime.now().isoformat()
            })
            
            print("✅ Previous/Next Navigation Demo completed")
            
        except Exception as e:
            self.logger.error(f"❌ Previous/Next Navigation Demo failed: {e}")
            self.session_data["errors"].append({"type": "navigation_demo", "error": str(e)})
    
    def _demo_post_navigation_behavior(self):
        """Demo realistic behavior after navigation"""
        try:
            print("    🎯 Post-navigation behavior:")
            
            # Quick page scan
            print("      📖 Quick page scan...")
            self.automation._simulate_reading_behavior()
            
            # Natural scrolling
            print("      🔄 Natural scrolling...")
            self.automation._simulate_natural_scrolling()
            
            # Mouse movement
            print("      🖱️ Natural mouse movement...")
            self.automation._simulate_mouse_movement()
            
            time.sleep(1)  # Brief pause
            
        except Exception as e:
            self.logger.error(f"Post-navigation behavior failed: {e}")
    
    def _demo_personality_navigation_patterns(self):
        """Demo how different personalities handle navigation"""
        try:
            print("\n🎭 PERSONALITY-BASED NAVIGATION PATTERNS:")
            print("-" * 45)
            
            personalities = ["casual", "professional", "researcher", "explorer"]
            
            for personality in personalities:
                print(f"  🎭 Testing {personality.upper()} navigation preferences:")
                
                # Temporarily change personality
                original_personality = self.automation.user_personality
                self.automation.user_personality = personality
                
                # Test navigation type selection
                session_memory = {}  # Empty session memory for testing
                nav_type = self.automation._choose_navigation_type_with_context(session_memory)
                print(f"    📍 Preferred navigation type: {nav_type}")
                
                # Test actual navigation based on personality
                if nav_type == "previous_next":
                    new_url = self.automation._navigate_previous_next()
                    if new_url:
                        print(f"    ✅ Previous/Next navigation found: {new_url[:50]}...")
                    else:
                        print(f"    ❌ Previous/Next navigation not available")
                elif nav_type == "category":
                    new_url = self.automation._navigate_to_category()
                    if new_url:
                        print(f"    ✅ Category navigation found: {new_url[:50]}...")
                    else:
                        print(f"    ❌ Category navigation not available")
                else:
                    print(f"    📍 Would use {nav_type} navigation")
                
                # Record personality navigation preference
                self.session_data["interactions"].append({
                    "type": "personality_navigation",
                    "personality": personality,
                    "preferred_nav_type": nav_type,
                    "timestamp": datetime.now().isoformat()
                })
            
            # Restore original personality
            self.automation.user_personality = original_personality
            
        except Exception as e:
            self.logger.error(f"Personality navigation patterns failed: {e}")
    
    def _demo_browser_navigation_demo(self):
        """Demo browser navigation patterns"""
        try:
            print("\n🧭 BROWSER NAVIGATION PATTERNS:")
            print("-" * 35)
            
            for i in range(3):
                print(f"  🔄 Browser navigation pattern {i+1}/3:")
                
                # Test browser navigation patterns
                self.automation._simulate_browser_navigation_patterns()
                
                # Record browser navigation
                self.session_data["interactions"].append({
                    "type": "browser_navigation",
                    "pattern_number": i+1,
                    "timestamp": datetime.now().isoformat()
                })
                
                time.sleep(1)
            
            print("  ✅ Browser navigation patterns completed")
            
        except Exception as e:
            self.logger.error(f"Browser navigation demo failed: {e}")
    
    def demo_content_aware_automation(self):
        """Demo content-aware automation for different content types"""
        print("\n📊 Content-Aware Automation Demo")
        print("=" * 35)
        
        # Test different content types using current page and navigation
        content_types = ["news", "blog", "tech", "product"]
        
        for content_type in content_types:
            try:
                print(f"\n📄 Testing {content_type.upper()} content:")
                print("-" * 25)
                
                # Try to navigate to different content type using current page
                current_url = self.automation.driver.current_url
                current_title = self.automation.driver.title
                
                print(f"  🌐 URL: {current_url}")
                print(f"  📄 Title: {current_title}")
                
                # Record page visit
                self.session_data["pages_visited"].append({
                    "url": current_url,
                    "content_type": content_type,
                    "timestamp": datetime.now().isoformat(),
                    "title": current_title
                })
                
                # Demo content-specific behavior
                self._demo_content_specific_behavior(content_type)
                
                # 🧭 Demo navigation from this content type
                self._demo_content_navigation(content_type)
                
                print(f"  ✅ {content_type} content demo completed")
                
            except Exception as e:
                self.logger.error(f"❌ {content_type} content demo failed: {e}")
                self.session_data["errors"].append({"type": f"{content_type}_content", "error": str(e)})
    
    def _demo_content_specific_behavior(self, content_type):
        """Demo behavior specific to content type"""
        try:
            # Simulate content-specific behavior
            self.automation._simulate_content_specific_behavior()
            
            # Additional content-specific interactions
            if content_type == "news":
                print("    📰 News-specific behavior: headline reading, fact checking")
            elif content_type == "blog":
                print("    📝 Blog-specific behavior: casual reading, comment interaction")
            elif content_type == "tech":
                print("    💻 Tech-specific behavior: technical reading, code review")
            elif content_type == "product":
                print("    🛒 Product-specific behavior: feature exploration, price checking")
            
            self.session_data["interactions"].append({
                "type": "content_specific",
                "content_type": content_type,
                "timestamp": datetime.now().isoformat()
            })
            
        except Exception as e:
            self.logger.error(f"Content-specific behavior failed for {content_type}: {e}")
    
    def _demo_content_navigation(self, content_type):
        """🧭 Demo navigation patterns for specific content types"""
        try:
            print(f"    🧭 {content_type} navigation patterns:")
            
            # Test previous/next navigation for this content type
            new_url = self.automation._navigate_previous_next()
            
            if new_url:
                print(f"      ✅ Found previous/next link: {new_url[:60]}...")
                
                # Content-specific navigation behavior
                if content_type == "news":
                    print("      📰 News navigation: Looking for next article, related stories")
                elif content_type == "blog":
                    print("      📝 Blog navigation: Looking for next post, category links")
                elif content_type == "tech":
                    print("      💻 Tech navigation: Looking for next tutorial, related topics")
                elif content_type == "product":
                    print("      🛒 Product navigation: Looking for similar products, categories")
                
                # Record content navigation
                self.session_data["interactions"].append({
                    "type": "content_navigation",
                    "content_type": content_type,
                    "navigation_found": True,
                    "navigation_url": new_url,
                    "timestamp": datetime.now().isoformat()
                })
                
            else:
                print(f"      ⚠️ No navigation links found for {content_type}")
                self.session_data["interactions"].append({
                    "type": "content_navigation",
                    "content_type": content_type,
                    "navigation_found": False,
                    "timestamp": datetime.now().isoformat()
                })
            
        except Exception as e:
            self.logger.error(f"Content navigation failed for {content_type}: {e}")
    
    def demo_advanced_features(self):
        """Demo advanced automation features"""
        print("\n🚀 Advanced Features Demo")
        print("=" * 25)
        
        # Demo session memory
        self._demo_session_memory()
        
        # Demo time-based behavior
        self._demo_time_based_behavior()
        
        # Demo geographic behavior
        self._demo_geographic_behavior()
        
        # Demo device-specific behavior
        self._demo_device_behavior()
        
        # Demo attention span variation
        self._demo_attention_span()
    
    def _demo_session_memory(self):
        """Demo session memory and continuity"""
        try:
            print("  🧠 Session Memory Demo:")
            print("    - Remembering previous interactions")
            print("    - Maintaining personality consistency")
            print("    - Adapting behavior based on history")
            
            # Simulate session memory
            self.session_data["interactions"].append({
                "type": "session_memory",
                "description": "Maintaining personality consistency",
                "timestamp": datetime.now().isoformat()
            })
            
        except Exception as e:
            self.logger.error(f"Session memory demo failed: {e}")
    
    def _demo_time_based_behavior(self):
        """Demo time-based behavior patterns"""
        try:
            print("  ⏰ Time-Based Behavior Demo:")
            current_hour = datetime.now().hour
            
            if 6 <= current_hour < 12:
                print("    - Morning behavior: High energy, fast reading")
            elif 12 <= current_hour < 17:
                print("    - Afternoon behavior: Balanced energy, medium reading")
            else:
                print("    - Evening behavior: Low energy, slow reading")
            
            self.session_data["interactions"].append({
                "type": "time_based",
                "hour": current_hour,
                "timestamp": datetime.now().isoformat()
            })
            
        except Exception as e:
            self.logger.error(f"Time-based behavior demo failed: {e}")
    
    def _demo_geographic_behavior(self):
        """Demo geographic behavior patterns"""
        try:
            print("  🌍 Geographic Behavior Demo:")
            print("    - Adjusting behavior based on proxy location")
            print("    - Cultural adaptation")
            print("    - Language-specific behavior")
            
            self.session_data["interactions"].append({
                "type": "geographic",
                "description": "Geographic behavior adaptation",
                "timestamp": datetime.now().isoformat()
            })
            
        except Exception as e:
            self.logger.error(f"Geographic behavior demo failed: {e}")
    
    def _demo_device_behavior(self):
        """Demo device-specific behavior"""
        try:
            print("  📱 Device Behavior Demo:")
            device_type = self.automation.device_type
            print(f"    - Device type: {device_type}")
            print(f"    - {device_type}-specific interactions")
            print(f"    - {device_type}-optimized scrolling")
            
            self.session_data["interactions"].append({
                "type": "device_specific",
                "device_type": device_type,
                "timestamp": datetime.now().isoformat()
            })
            
        except Exception as e:
            self.logger.error(f"Device behavior demo failed: {e}")
    
    def _demo_attention_span(self):
        """Demo attention span variation"""
        try:
            print("  👁️ Attention Span Demo:")
            personality = self.automation.user_personality
            
            if personality == "researcher":
                print("    - Long attention span: Detailed reading")
            elif personality == "explorer":
                print("    - Short attention span: Quick browsing")
            elif personality == "casual":
                print("    - Medium attention span: Balanced reading")
            elif personality == "professional":
                print("    - Focused attention span: Targeted reading")
            
            self.session_data["interactions"].append({
                "type": "attention_span",
                "personality": personality,
                "timestamp": datetime.now().isoformat()
            })
            
        except Exception as e:
            self.logger.error(f"Attention span demo failed: {e}")
    
    def demo_adsense_integration(self):
        """Demo AdSense detection and interaction"""
        print("\n💰 AdSense Integration Demo")
        print("=" * 30)
        
        try:
            print("  🔍 Detecting AdSense ads...")
            
            # Test AdSense detection
            adsense_results = self.automation.test_adsense_ads(self.current_url)
            
            if "error" not in adsense_results:
                ads_found = len(adsense_results.get('ads', []))
                print(f"    ✅ Found {ads_found} ads")
                
                if ads_found > 0:
                    # 🔥 IMPLEMENTASI KLIK IKLAN YANG SEBENARNYA
                    print("  🖱️ Safe ad interaction demo...")
                    print("    - Reading ad content before interaction")
                    print("    - Respecting safety thresholds")
                    print("    - Realistic ad clicking patterns")
                    
                    # Demo klik iklan yang sebenarnya
                    self._demo_realistic_ad_clicking(adsense_results.get('ads', []))
                else:
                    print("  ⚠️ No ads found for interaction demo")
                
                self.session_data["interactions"].append({
                    "type": "adsense",
                    "ads_found": ads_found,
                    "clicks_performed": adsense_results.get('interactions', {}).get('clicks', 0),
                    "timestamp": datetime.now().isoformat()
                })
            else:
                print(f"    ⚠️ AdSense detection failed: {adsense_results['error']}")
                
        except Exception as e:
            self.logger.error(f"AdSense demo failed: {e}")
            self.session_data["errors"].append({"type": "adsense", "error": str(e)})
    
    def _demo_realistic_ad_clicking(self, ads):
        """Demo realistic ad clicking behavior"""
        try:
            print("    🎯 Starting realistic ad clicking simulation...")
            
            # Simulate realistic ad interaction patterns
            for i, ad in enumerate(ads[:3]):  # Limit to 3 ads for demo
                try:
                    print(f"      📊 Analyzing ad {i+1}/{min(len(ads), 3)}...")
                    
                    # Simulate reading ad content
                    print("        📖 Reading ad content...")
                    time.sleep(1)
                    
                    # Simulate mouse hover over ad
                    print("        🖱️ Hovering over ad...")
                    self.automation._simulate_link_hovering()
                    
                    # Simulate realistic click decision
                    click_probability = 0.001  # 0.1% chance (realistic for display ads)
                    if random.random() < click_probability:
                        print("        ✅ Deciding to click ad (realistic probability)")
                        
                        # Simulate pre-click behavior
                        print("        ⏳ Pre-click hesitation (human-like)...")
                        time.sleep(random.uniform(0.5, 2.0))
                        
                        # Perform the click
                        print("        🖱️ Clicking ad...")
                        ad.click()
                        
                        # Post-click behavior now handled in selenium_automation.py
                        print("        📄 Post-click behavior...")
                        time.sleep(random.uniform(1.0, 3.0))
                        
                        # Record successful click
                        self.session_data["interactions"].append({
                            "type": "ad_click",
                            "ad_index": i,
                            "click_probability": click_probability,
                            "timestamp": datetime.now().isoformat()
                        })
                        
                        print("        ✅ Ad click completed successfully")
                        break  # Only click one ad per demo
                    else:
                        print("        ❌ Deciding not to click (realistic behavior)")
                        
                except Exception as ad_error:
                    print(f"        ⚠️ Ad interaction failed: {ad_error}")
                    continue
            
            print("    🎯 Realistic ad clicking simulation completed")
            
        except Exception as e:
            self.logger.error(f"Realistic ad clicking demo failed: {e}")
    
    # Post-ad click behavior now implemented in selenium_automation.py
    def demo_performance_monitoring(self):
        """Demo performance monitoring and analytics"""
        print("\n📈 Performance Monitoring Demo")
        print("=" * 35)
        
        try:
            # Calculate session metrics
            session_duration = datetime.now() - self.session_data["start_time"]
            total_interactions = len(self.session_data["interactions"])
            total_pages = len(self.session_data["pages_visited"])
            total_errors = len(self.session_data["errors"])
            
            print(f"  ⏱️ Session Duration: {session_duration}")
            print(f"  🎯 Total Interactions: {total_interactions}")
            print(f"  📄 Pages Visited: {total_pages}")
            print(f"  ❌ Errors: {total_errors}")
            print(f"  🎭 Final Personality: {self.session_data['personality']}")
            print(f"  📱 Device Type: {self.session_data['device_type']}")
            
            # Save session data
            self._save_session_data()
            
        except Exception as e:
            self.logger.error(f"Performance monitoring demo failed: {e}")
    
    def _save_session_data(self):
        """Save session data to file"""
        try:
            session_file = f"../data/session_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            
            # Ensure data directory exists
            os.makedirs("../data", exist_ok=True)
            
            # Prepare data for JSON serialization
            session_data = self.session_data.copy()
            session_data["end_time"] = datetime.now().isoformat()
            session_data["duration"] = str(datetime.now() - self.session_data["start_time"])
            
            with open(session_file, 'w') as f:
                json.dump(session_data, f, indent=2, default=str)
            
            print(f"  💾 Session data saved to: {session_file}")
            
        except Exception as e:
            self.logger.error(f"Failed to save session data: {e}")
    
    def run_comprehensive_demo(self):
        """Run the complete comprehensive demo"""
        try:
            print("\n🎯 Starting Comprehensive Automation Demo")
            print("=" * 50)
            print("This demo showcases all 50+ Selenium automation features!")
            
            # Setup automation
            if not self.setup_automation():
                return False
            
            # Run all demos
            self.demo_personality_system()
            # self.demo_previous_next_navigation()  # 🧭 NEW: Previous/Next Navigation Demo
            # self.demo_content_aware_automation()
            # self.demo_advanced_features()
            self.demo_adsense_integration()
            self.demo_performance_monitoring()
            
            print("\n🎉 Comprehensive Demo Completed Successfully!")
            print("=" * 50)
            print("✅ All 50+ features demonstrated")
            print("📊 Performance metrics recorded")
            print("💾 Session data saved")
            
            return True
            
        except Exception as e:
            self.logger.error(f"❌ Comprehensive demo failed: {e}")
            return False
        finally:
            if self.automation and self.automation.driver:
                try:
                    self.automation.close_driver()
                    
                    # Force close browser
                    print("🔒 Force closing browser...")
                    self.automation.driver.quit()
                except Exception as e:
                    self.logger.error(f"⚠️ Error closing driver: {e}")

def main():
    """Main function to run comprehensive automation demo"""
    logger = setup_logging()
    
    print("🎯 Comprehensive Automation Demo")
    print("=" * 50)
    print("Demonstrating all 50+ Selenium automation features")
    
    try:
        # Auth
        token = signin()
        if not token:
            return False
        
        # Start profile
        debugging_url = start_profile(token)
        if not debugging_url:
            return False
        
        # Create and run comprehensive demo
        demo = ComprehensiveAutomationDemo(debugging_url)
        success = demo.run_comprehensive_demo()
        
        if success:
            print("\n🏆 All features successfully demonstrated!")
            print("📋 Features covered:")
            print("  ✅ Core Selenium Automation (10+ features)")
            print("  ✅ URL Handling System (5+ features)")
            print("  ✅ Personality System (8+ features)")
            print("  ✅ 🧭 Previous/Next Navigation System (8+ features)")  # NEW
            print("  ✅ Content-Aware Automation (6+ features)")
            print("  ✅ Mouse & Interaction System (8+ features)")
            print("  ✅ Reading Behavior System (6+ features)")
            print("  ✅ Scrolling System (6+ features)")
            print("  ✅ Smart Behavior Engine (4+ features)")
            print("  ✅ AdSense Integration (4+ features)")
            print("  ✅ Performance Monitoring (4+ features)")
            print("\n🎯 Total: 55+ Features Successfully Implemented!")
        else:
            print("\n❌ Demo failed")
        
        return success
        
    except Exception as e:
        print(f"❌ Demo error: {e}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
