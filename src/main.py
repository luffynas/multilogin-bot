#!/usr/bin/env python3
"""
Multi-Login Bot - Main Orchestrator
Simulates realistic human traffic using Multilogin and SOCKS5 proxies
"""

import os
import sys
import time
import random
import logging
import yaml
import json
import argparse
from datetime import datetime, timedelta
from typing import Dict, List, Optional

# Add src to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from src.core.multilogin_manager import MultiloginManager
from src.core.referer_simulator import RefererSimulator
from src.core.fingerprint_engine import FingerprintEngine
from src.bots.human_simulator import HumanSimulator
from src.core.adsense_testing_monitor import AdSenseTestingMonitor
from src.core.mouse_simulator import MouseSimulator
from src.core.hardware_emulator import HardwareEmulator
from src.core.advanced_ai_behavior_engine import AdvancedAIBehaviorEngine
from src.core.network_behavior_simulator import NetworkBehaviorSimulator
from src.core.ml_adaptive_engine import MLAdaptiveEngine
from src.core.social_proof_simulator import SocialProofSimulator
from src.core.content_intelligence_engine import ContentIntelligenceEngine
from src.core.behavioral_biometrics_engine import BehavioralBiometricsEngine
from src.core.temporal_pattern_analyzer import TemporalPatternAnalyzer
from src.core.dynamic_entry_manager import DynamicEntryManager

def parse_arguments():
    """Parse command line arguments"""
    parser = argparse.ArgumentParser(
        description="Multi-Login Bot - Undetectable Traffic Simulator",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python -m src.main                    # Run with default config
  python -m src.main --config custom.yaml  # Use custom config
  python -m src.main --visits 50        # Set custom visit count
  python -m src.main --debug            # Run in debug mode
  python -m src.main --test             # Run single test session
  python -m src.main --adsense-test     # Run in AdSense testing mode
  python -m src.main --stealth expert   # Use expert stealth level
        """
    )
    
    # Configuration options
    parser.add_argument(
        '--config', '-c',
        type=str,
        default="config/config.yaml",
        help="Path to configuration file (default: config/config.yaml)"
    )
    
    # Operation modes
    parser.add_argument(
        '--test', '-t',
        action='store_true',
        help="Run in test mode (single session)"
    )
    
    parser.add_argument(
        '--adsense-test', '-a',
        action='store_true',
        help="Run in AdSense testing mode with enhanced safety"
    )
    
    # Custom settings
    parser.add_argument(
        '--visits', '-v',
        type=int,
        help="Override daily visit count"
    )
    
    parser.add_argument(
        '--stealth', '-s',
        choices=['basic', 'advanced', 'expert'],
        default='advanced',
        help="Stealth level (default: advanced)"
    )
    
    # Debug and logging
    parser.add_argument(
        '--debug', '-d',
        action='store_true',
        help="Enable debug mode with verbose logging"
    )
    
    parser.add_argument(
        '--log-level', '-l',
        choices=['DEBUG', 'INFO', 'WARNING', 'ERROR'],
        default='INFO',
        help="Set logging level (default: INFO)"
    )
    
    # Output options
    parser.add_argument(
        '--quiet', '-q',
        action='store_true',
        help="Suppress console output (logs only)"
    )
    
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help="Simulate execution without creating actual sessions"
    )
    
    return parser.parse_args()

class MultiLoginBotOrchestrator:
    def __init__(self, config_path: str = "config/config.yaml", args: Optional[argparse.Namespace] = None):
        self.config_path = config_path
        self.args = args
        self.config = self.load_config()
        
        # Override config with command line arguments
        if args:
            self.override_config_with_args(args)
        
        # Setup logging
        self.setup_logging()
        self.logger = logging.getLogger(__name__)
        
        # Initialize components
        self.ml_manager = MultiloginManager(
            api_key=self.config["multilogin"]["api_key"],
            base_url=self.config["multilogin"]["base_url"]
        )
        
        self.referer_simulator = RefererSimulator(self.config)
        self.fingerprint_engine = FingerprintEngine(self.config)
        self.human_simulator = HumanSimulator(self.config)
        
        # Initialize AdSense testing monitor
        self.adsense_monitor = AdSenseTestingMonitor(self.config)
        
        # Initialize advanced undetectable components
        if self.config.get("undetectable_traffic", {}).get("enabled", False):
            self.mouse_simulator = MouseSimulator(self.config)
            self.hardware_emulator = HardwareEmulator(self.config)
            self.ai_behavior_engine = AdvancedAIBehaviorEngine(self.config)
            self.network_behavior_simulator = NetworkBehaviorSimulator(self.config)
            
            # Initialize ultra-advanced components
            self.ml_adaptive_engine = MLAdaptiveEngine(self.config)
            self.social_proof_simulator = SocialProofSimulator(self.config)
            self.content_intelligence_engine = ContentIntelligenceEngine(self.config)
            self.behavioral_biometrics_engine = BehavioralBiometricsEngine(self.config)
            self.temporal_pattern_analyzer = TemporalPatternAnalyzer(self.config)
            
            # Initialize dynamic entry manager
            self.dynamic_entry_manager = DynamicEntryManager(self.config)

            # Start network monitoring
            self.network_behavior_simulator.start_network_monitoring()

            self.logger.info("Ultra-advanced undetectable components initialized")
        else:
            self.mouse_simulator = None
            self.hardware_emulator = None
            self.ai_behavior_engine = None
            self.network_behavior_simulator = None
            self.ml_adaptive_engine = None
            self.social_proof_simulator = None
            self.content_intelligence_engine = None
            self.behavioral_biometrics_engine = None
            self.temporal_pattern_analyzer = None
            self.dynamic_entry_manager = None
        
        # Session tracking
        self.active_sessions = {}
        self.session_history = []
        self.proxy_usage = {}
        
        self.logger.info("Multi-Login Bot Orchestrator initialized")
    
    def override_config_with_args(self, args: argparse.Namespace):
        """Override configuration with command line arguments"""
        if args.visits:
            self.config["behavior"]["daily_visits_min"] = args.visits
            self.config["behavior"]["daily_visits_max"] = args.visits
        
        if args.stealth:
            self.config["fingerprint"]["stealth_level"] = args.stealth
        
        if args.test:
            self.config["behavior"]["daily_visits_min"] = 1
            self.config["behavior"]["daily_visits_max"] = 1
        
        if args.adsense_test:
            self.config["adsense_testing"]["enabled"] = True
    
    def load_config(self) -> Dict:
        """Load configuration from YAML file"""
        try:
            with open(self.config_path, 'r', encoding='utf-8') as file:
                config = yaml.safe_load(file)
            
            # Validate required configuration
            required_keys = ["multilogin", "proxy", "target_website", "behavior"]
            for key in required_keys:
                if key not in config:
                    raise ValueError(f"Missing required configuration: {key}")
            
            return config
            
        except Exception as e:
            print(f"Error loading configuration: {str(e)}")
            sys.exit(1)
    
    def setup_logging(self):
        """Setup logging configuration"""
        log_dir = "logs"
        if not os.path.exists(log_dir):
            os.makedirs(log_dir)
        
        log_file = os.path.join(log_dir, f"bot_{datetime.now().strftime('%Y%m%d')}.log")
        
        # Determine log level
        log_level = logging.INFO
        if self.args:
            if self.args.debug:
                log_level = logging.DEBUG
            else:
                log_level = getattr(logging, self.args.log_level.upper(), logging.INFO)
        
        # Setup handlers
        handlers = [logging.FileHandler(log_file)]
        
        # Add console handler unless quiet mode
        if not (self.args and self.args.quiet):
            handlers.append(logging.StreamHandler(sys.stdout))
        
        logging.basicConfig(
            level=log_level,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=handlers
        )
    
    def generate_proxy_config(self, proxy_id: int) -> Dict:
        """Generate proxy configuration for testing (replace with actual proxy data)"""
        # This is a placeholder - replace with actual proxy data from your provider
        proxy_configs = [
            {
                "id": f"proxy_{i}",
                "host": "proxy.oxylabs.io",
                "port": 1080,
                "username": f"customer-username-zone-static_route-id-ip-{i}",
                "password": "your_password",
                "geo": "ID"
            }
            for i in range(1, 10001)  # 10000 proxies
        ]
        
        return proxy_configs[proxy_id % len(proxy_configs)]
    
    def get_available_proxies(self, count: int) -> List[Dict]:
        """Get available proxies that haven't been used today"""
        today = datetime.now().date()
        available_proxies = []
        
        for i in range(count):
            proxy_config = self.generate_proxy_config(i)
            proxy_id = proxy_config["id"]
            
            # Check if proxy was used today
            if proxy_id not in self.proxy_usage or self.proxy_usage[proxy_id] != today:
                available_proxies.append(proxy_config)
                self.proxy_usage[proxy_id] = today
        
        return available_proxies
    
    def create_session(self, proxy_config: Dict, target_url: str) -> Optional[Dict]:
        """Create complete browsing session with dynamic entry point simulation"""
        try:
            # Step 1: Generate fingerprint
            fingerprint = self.fingerprint_engine.generate_geo_consistent_fingerprint(proxy_config)
            
            # Step 2: Generate dynamic entry point if enabled
            entry_point = None
            referer = None
            if self.dynamic_entry_manager and self.config.get("dynamic_entry_points", {}).get("enabled", False):
                # Generate user profile for entry point selection
                user_profile = {
                    "personality_type": random.choice(["casual", "professional", "social_butterfly", "tech_savvy"]),
                    "age_group": random.choice(["18-24", "25-34", "35-44", "45-54", "55+"]),
                    "interests": random.choice([["technology", "business"], ["lifestyle", "entertainment"], ["news", "politics"]])
                }
                
                entry_point = self.dynamic_entry_manager.generate_dynamic_entry_point(target_url, user_profile)
                referer = entry_point.get("referrer", "")
                
                self.logger.info(f"Generated dynamic entry point: {entry_point['type']} from {entry_point['source']}")
            else:
                # Fallback to basic referer simulation
                referer = self.referer_simulator.generate_referer()
            
            # Step 3: Create Multilogin profile
            profile_name = f"session_{int(time.time())}_{proxy_config['id']}"
            profile = self.ml_manager.create_profile(
                name=profile_name,
                proxy_config=proxy_config,
                fingerprint_config=fingerprint
            )
            
            if not profile:
                self.logger.error(f"Failed to create profile for proxy {proxy_config['id']}")
                return None
            
            # Step 4: Start browser
            browser_info = self.ml_manager.start_profile(profile["uuid"])
            
            if not browser_info:
                self.logger.error(f"Failed to start profile {profile['uuid']}")
                return None
            
            # Step 5: Inject stealth scripts
            stealth_scripts = self.fingerprint_engine.get_stealth_scripts(fingerprint)
            for script in stealth_scripts:
                self.ml_manager.execute_script(profile["uuid"], script)
            
            # Step 5.5: Inject advanced undetectable scripts if enabled
            hardware_profile = None
            if self.hardware_emulator and self.config.get("undetectable_traffic", {}).get("enabled", False):
                # Generate hardware profile
                hardware_profile = self.hardware_emulator.generate_hardware_profile(
                    geo_location=proxy_config.get("geo", "ID")
                )
                
                # Inject hardware emulation scripts
                hardware_scripts = self.hardware_emulator.get_hardware_scripts(hardware_profile)
                for script in hardware_scripts:
                    self.ml_manager.execute_script(profile["uuid"], script)
                
                # Inject performance simulation scripts
                performance_scripts = self.hardware_emulator.get_performance_scripts(hardware_profile)
                for script in performance_scripts:
                    self.ml_manager.execute_script(profile["uuid"], script)
            
            # Step 6: Navigate with dynamic entry point or referer
            if entry_point and entry_point.get("click_through", False):
                # Simulate click-through from entry point
                entry_url = entry_point.get("entry_url", "")
                if entry_url:
                    # Navigate to entry point first
                    self.ml_manager.navigate_to_url(profile["uuid"], entry_url, "")
                    time.sleep(random.uniform(2, 5))  # Simulate time on entry page
                    
                    # Then navigate to target with referer
                    success = self.ml_manager.navigate_to_url(profile["uuid"], target_url, entry_url)
                else:
                    success = self.ml_manager.navigate_to_url(profile["uuid"], target_url, referer)
            else:
                success = self.ml_manager.navigate_to_url(profile["uuid"], target_url, referer)
            
            if not success:
                self.logger.error(f"Failed to navigate to {target_url}")
                return None
            
            session_data = {
                "profile_id": profile["uuid"],
                "proxy_config": proxy_config,
                "fingerprint": fingerprint,
                "referer": referer,
                "entry_point": entry_point,
                "start_time": time.time(),
                "browser_info": browser_info,
                "hardware_profile": hardware_profile
            }
            
            self.active_sessions[profile["uuid"]] = session_data
            self.logger.info(f"Session created: {profile['uuid']} with referer: {referer}")
            
            return session_data
            
        except Exception as e:
            self.logger.error(f"Error creating session: {str(e)}")
            return None
    
    def run_daily_visits(self):
        """Run daily visit simulation"""
        # Generate random visit count
        min_visits = self.config["behavior"]["daily_visits_min"]
        max_visits = self.config["behavior"]["daily_visits_max"]
        visit_count = random.randint(min_visits, max_visits)
        
        self.logger.info(f"Starting daily visits: {visit_count}")
        
        # Get available proxies
        available_proxies = self.get_available_proxies(visit_count)
        
        if len(available_proxies) < visit_count:
            self.logger.warning(f"Not enough available proxies. Need {visit_count}, have {len(available_proxies)}")
            visit_count = len(available_proxies)
        
        # Get target URL with priority: dynamic_entry_points > target_website
        target_url = None
        
        # Try dynamic entry points first
        if self.config.get("dynamic_entry_points", {}).get("enabled", False):
            dynamic_config = self.config.get("dynamic_entry_points", {}).get("target_websites", {})
            if dynamic_config.get("primary", {}).get("url"):
                target_url = dynamic_config["primary"]["url"]
                self.logger.info(f"Using dynamic entry point target: {target_url}")
        
        # Fallback to legacy target_website
        if not target_url:
            target_url = self.config.get("target_website", {}).get("url")
            if target_url:
                self.logger.info(f"Using legacy target_website: {target_url}")
        
        # Final fallback
        if not target_url:
            raise ValueError("No target URL found in configuration. Please set either dynamic_entry_points.target_websites.primary.url or target_website.url")
        
        # Run sessions
        successful_sessions = 0
        
        for i in range(visit_count):
            try:
                proxy_config = available_proxies[i]
                
                # Check AdSense safety limits before creating session
                limits_status = self.adsense_monitor.check_daily_limits()
                if not limits_status["can_continue"]:
                    self.logger.warning(f"AdSense daily limits reached: {limits_status}")
                    break
                
                # Create session
                session_data = self.create_session(proxy_config, target_url)
                
                if session_data:
                    # Validate session safety for AdSense
                    safety_validation = self.adsense_monitor.validate_session_safety(session_data)
                    if not safety_validation["safe"]:
                        self.logger.warning(f"Session safety validation failed: {safety_validation['warnings']}")
                        if safety_validation["blocked"]:
                            continue
                    
                    # Run human simulation with ultra-advanced AI behavior if enabled
                    if self.ai_behavior_engine and self.config.get("undetectable_traffic", {}).get("enabled", False):
                        # Generate behavioral profile
                        behavioral_profile = self.ai_behavior_engine.generate_behavioral_profile({
                            "session_data": session_data,
                            "page_type": "article",
                            "content_category": "general",
                            "geo_location": proxy_config.get("geo", "ID"),
                            "device_type": session_data.get("hardware_profile", {}).get("device_type", "desktop_windows")
                        })
                        
                        # Content intelligence analysis
                        if self.content_intelligence_engine:
                            content_data = {
                                "url": target_url,
                                "title": "Article Title",  # Would be extracted from page
                                "content": "Article content...",  # Would be extracted from page
                                "keywords": ["article", "content", "information"]
                            }
                            content_analysis = self.content_intelligence_engine.analyze_content(content_data)
                            adaptive_behavior = self.content_intelligence_engine.generate_adaptive_behavior(
                                content_analysis, behavioral_profile
                            )
                            session_data["content_analysis"] = content_analysis
                            session_data["adaptive_behavior"] = adaptive_behavior
                        
                        # Social proof simulation
                        if self.social_proof_simulator:
                            social_profile = self.social_proof_simulator.generate_social_profile(
                                personality_type=behavioral_profile.get("personality_type", "social_butterfly")
                            )
                            social_interaction = self.social_proof_simulator.simulate_social_interaction(
                                content_data, social_profile
                            )
                            session_data["social_profile"] = social_profile
                            session_data["social_interaction"] = social_interaction
                        
                        # Run enhanced human simulation
                        simulation_result = self.human_simulator.simulate_reading_session(
                            self.ml_manager,
                            session_data["profile_id"],
                            target_url
                        )
                        
                        # Add behavioral profile to session data
                        session_data["behavioral_profile"] = behavioral_profile
                        
                        # Update simulation with AI-driven decisions
                        if self.mouse_simulator:
                            # Enhance with realistic mouse movements
                            simulation_result["mouse_movements"] = "realistic_simulation_enabled"
                        
                        # Add network behavior if available
                        if self.network_behavior_simulator:
                            network_profile = self.network_behavior_simulator.generate_network_profile(
                                user_type=behavioral_profile.get("personality_type", "home_user")
                            )
                            session_data["network_profile"] = network_profile
                            simulation_result["network_behavior"] = "simulated"
                        
                        # Machine learning adaptation
                        if self.ml_adaptive_engine:
                            # Learn from session and adapt
                            adaptation = self.ml_adaptive_engine.learn_from_session(session_data, True)
                            session_data["ml_adaptation"] = adaptation
                            simulation_result["ml_learning"] = "enabled"
                        
                        # Behavioral biometrics simulation
                        if self.behavioral_biometrics_engine:
                            user_type = behavioral_profile.get("personality_type", "casual")
                            biometric_session = self.behavioral_biometrics_engine.generate_behavioral_session(user_type)
                            session_data["biometric_session"] = biometric_session
                            simulation_result["behavioral_biometrics"] = "enabled"
                        
                        # Temporal pattern analysis
                        if self.temporal_pattern_analyzer:
                            temporal_behavior = self.temporal_pattern_analyzer.generate_temporal_behavior(
                                user_type=behavioral_profile.get("personality_type", "casual"),
                                context={}
                            )
                            session_data["temporal_behavior"] = temporal_behavior
                            simulation_result["temporal_patterns"] = "enabled"
                    else:
                        # Standard human simulation
                        simulation_result = self.human_simulator.simulate_reading_session(
                            self.ml_manager,
                            session_data["profile_id"],
                            target_url
                        )
                    
                    # Merge results
                    session_data.update(simulation_result)
                    
                    # Update AdSense metrics
                    self.adsense_monitor.update_metrics(session_data)
                    
                    # Stop profile
                    self.ml_manager.stop_profile(session_data["profile_id"])
                    
                    # Log session
                    self.session_history.append(session_data)
                    
                    successful_sessions += 1
                    
                    self.logger.info(f"Session {i+1}/{visit_count} completed successfully")
                    
                    # Random delay between sessions
                    delay_min = self.config["behavior"]["session_delay_min"]
                    delay_max = self.config["behavior"]["session_delay_max"]
                    delay = random.randint(delay_min, delay_max)
                    
                    if i < visit_count - 1:  # Don't delay after last session
                        self.logger.info(f"Waiting {delay} seconds before next session...")
                        time.sleep(delay)
                
            except Exception as e:
                self.logger.error(f"Error in session {i+1}: {str(e)}")
                continue
        
        self.logger.info(f"Daily visits completed: {successful_sessions}/{visit_count} successful")
        self.generate_daily_report()
    
    def generate_daily_report(self):
        """Generate daily report"""
        if not self.session_history:
            return
        
        report = {
            "date": datetime.now().strftime("%Y-%m-%d"),
            "total_sessions": len(self.session_history),
            "successful_sessions": len([s for s in self.session_history if s.get("success", False)]),
            "total_duration": sum(s.get("duration", 0) for s in self.session_history),
            "total_page_views": sum(s.get("page_views", 0) for s in self.session_history),
            "average_session_duration": sum(s.get("duration", 0) for s in self.session_history) / len(self.session_history),
            "fingerprint_summary": self.fingerprint_engine.get_fingerprint_summary(),
            "referer_distribution": self.get_referer_distribution(),
            "proxy_usage": len(self.proxy_usage)
        }
        
        # Generate AdSense specific report
        adsense_report = self.adsense_monitor.generate_adsense_report()
        report["adsense_testing"] = adsense_report
        
        # Save main report
        report_file = f"logs/daily_report_{datetime.now().strftime('%Y%m%d')}.json"
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        # Save AdSense specific report
        self.adsense_monitor.save_adsense_report(adsense_report)
        
        self.logger.info(f"Daily report generated: {report_file}")
        self.logger.info(f"Report summary: {report['successful_sessions']}/{report['total_sessions']} sessions, "
                        f"{report['total_page_views']} pageviews, {report['total_duration']:.2f}s total duration")
        
        # Log AdSense safety recommendations
        safety_recommendations = self.adsense_monitor.get_safety_recommendations()
        if safety_recommendations:
            self.logger.info("AdSense Safety Recommendations:")
            for rec in safety_recommendations:
                self.logger.info(f"  - {rec}")
    
    def get_referer_distribution(self) -> Dict:
        """Get distribution of referer types"""
        referer_types = {}
        for session in self.session_history:
            referer = session.get("referer", "")
            if "google.com" in referer:
                referer_types["google"] = referer_types.get("google", 0) + 1
            elif "facebook.com" in referer:
                referer_types["facebook"] = referer_types.get("facebook", 0) + 1
            elif "twitter.com" in referer:
                referer_types["twitter"] = referer_types.get("twitter", 0) + 1
            elif not referer:
                referer_types["direct"] = referer_types.get("direct", 0) + 1
            else:
                referer_types["other"] = referer_types.get("other", 0) + 1
        
        return referer_types
    
    def cleanup(self):
        """Cleanup active sessions and advanced components"""
        # Stop network monitoring if active
        if self.network_behavior_simulator:
            self.network_behavior_simulator.stop_network_monitoring()
        
        # Cleanup active sessions
        for profile_id in list(self.active_sessions.keys()):
            try:
                self.ml_manager.stop_profile(profile_id)
                del self.active_sessions[profile_id]
            except Exception as e:
                self.logger.error(f"Error cleaning up session {profile_id}: {str(e)}")
        
        # Generate final network summary if available
        if self.network_behavior_simulator:
            network_summary = self.network_behavior_simulator.get_network_summary()
            self.logger.info(f"Network behavior summary: {network_summary.get('connection_switches', 0)} switches, "
                           f"stability score: {network_summary.get('network_stability_score', 0):.2f}")
        
        # Generate final intelligence summaries
        if self.ml_adaptive_engine:
            learning_summary = self.ml_adaptive_engine.get_learning_summary()
            self.logger.info(f"ML Learning summary: {learning_summary.get('total_sessions', 0)} sessions, "
                           f"success rate: {learning_summary.get('success_rate', 0):.2f}")
        
        if self.social_proof_simulator:
            social_summary = self.social_proof_simulator.get_social_proof_summary()
            self.logger.info(f"Social proof summary: {social_summary.get('total_interactions', 0)} interactions, "
                           f"total impact: {social_summary.get('total_impact', 0):.2f}")
        
        if self.content_intelligence_engine:
            content_summary = self.content_intelligence_engine.get_content_intelligence_summary()
            self.logger.info(f"Content intelligence summary: {content_summary.get('total_analyses', 0)} analyses, "
                           f"avg quality: {content_summary.get('average_quality_score', 0):.2f}")
        
        if self.behavioral_biometrics_engine:
            biometric_summary = self.behavioral_biometrics_engine.get_behavioral_biometrics_summary()
            self.logger.info(f"Behavioral biometrics summary: {biometric_summary.get('total_profiles', 0)} profiles, "
                           f"session history: {biometric_summary.get('session_history_count', 0)}")
        
        if self.temporal_pattern_analyzer:
            temporal_summary = self.temporal_pattern_analyzer.get_temporal_pattern_summary()
            self.logger.info(f"Temporal pattern summary: {temporal_summary.get('total_profiles', 0)} profiles, "
                           f"session history: {temporal_summary.get('session_history_count', 0)}")

def main():
    """Main entry point"""
    try:
        # Parse arguments
        args = parse_arguments()
        
        # Initialize orchestrator
        orchestrator = MultiLoginBotOrchestrator(args.config, args)
        
        # Run daily visits
        orchestrator.run_daily_visits()
        
        # Cleanup
        orchestrator.cleanup()
        
        print("Multi-Login Bot completed successfully!")
        
    except KeyboardInterrupt:
        print("\nBot interrupted by user")
        if 'orchestrator' in locals():
            orchestrator.cleanup()
    except Exception as e:
        print(f"Error in main: {str(e)}")
        if 'orchestrator' in locals():
            orchestrator.cleanup()

if __name__ == "__main__":
    main()
