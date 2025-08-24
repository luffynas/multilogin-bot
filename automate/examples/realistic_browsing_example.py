#!/usr/bin/env python3
"""
Realistic Browsing Behavior Example
Demonstrates the new multi-page browsing functionality
"""

import sys
import os
import logging
import time
from typing import List, Dict

# Add src directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from selenium_automation import UndetectableSeleniumAutomation

def setup_logging():
    """Setup logging configuration"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(),
            logging.FileHandler('realistic_browsing_example.log')
        ]
    )

def demonstrate_realistic_browsing():
    """Demonstrate realistic browsing behavior"""
    logger = logging.getLogger(__name__)
    
    # Example websites for testing
    test_websites = [
        "https://dev-plugin.local/",
        "https://example.com",
        "https://blog.example.com"
    ]
    
    # Initialize automation
    automation = UndetectableSeleniumAutomation()
    
    logger.info("🚀 Starting Realistic Browsing Demonstration")
    logger.info("=" * 60)
    
    for website in test_websites:
        try:
            logger.info(f"🌐 Testing website: {website}")
            logger.info("-" * 40)
            
            # Simulate realistic browsing (without actual driver)
            # In real usage, you would use: automation.simulate_realistic_browsing(website)
            
            # Show expected behavior
            logger.info("Expected browsing behavior:")
            logger.info("1. Visit main page")
            logger.info("2. Navigate to 2-5 additional pages")
            logger.info("3. Use various navigation types:")
            logger.info("   - Category browsing (40% chance)")
            logger.info("   - Legal pages (30% chance)")
            logger.info("   - Previous/Next (60% chance)")
            logger.info("   - Random pages (fallback)")
            
            logger.info("4. Simulate realistic behavior on each page:")
            logger.info("   - Mouse movements")
            logger.info("   - Natural scrolling")
            logger.info("   - Reading simulation (70% chance)")
            logger.info("   - Link hovering (40% chance)")
            logger.info("   - Typing simulation (30% chance)")
            
            # Simulate session data
            session_data = {
                "pages_visited": [
                    {"url": website, "type": "main_page", "dwell_time": 45.2},
                    {"url": f"{website}/category/technology", "type": "category", "dwell_time": 67.8},
                    {"url": f"{website}/about-us", "type": "legal", "dwell_time": 23.1},
                    {"url": f"{website}/page/2", "type": "previous_next", "dwell_time": 34.5}
                ],
                "total_pages": 4,
                "session_duration": 170.6,
                "navigation_pattern": ["category", "legal", "previous_next"]
            }
            
            logger.info(f"📊 Session completed:")
            logger.info(f"   - Total pages: {session_data['total_pages']}")
            logger.info(f"   - Session duration: {session_data['session_duration']:.1f}s")
            logger.info(f"   - Navigation pattern: {session_data['navigation_pattern']}")
            
            logger.info("")
            
        except Exception as e:
            logger.error(f"Error testing {website}: {e}")
    
    logger.info("✅ Realistic Browsing Demonstration Complete")
    logger.info("=" * 60)

def show_configuration_examples():
    """Show configuration examples for realistic browsing"""
    logger = logging.getLogger(__name__)
    
    logger.info("⚙️  Configuration Examples")
    logger.info("=" * 60)
    
    # Example 1: Basic configuration
    basic_config = """
selenium:
  browsing_behavior:
    enabled: true
    min_pages: 2
    max_pages: 5
    page_dwell_time: [30, 180]
    navigation_probabilities:
      category: 0.4
      legal: 0.3
      previous_next: 0.6
      random: 0.1
"""
    
    logger.info("1. Basic Configuration:")
    logger.info(basic_config)
    
    # Example 2: Advanced configuration
    advanced_config = """
selenium:
  browsing_behavior:
    enabled: true
    min_pages: 3
    max_pages: 7
    page_dwell_time: [45, 240]
    navigation_probabilities:
      category: 0.5
      legal: 0.2
      previous_next: 0.7
      random: 0.1
    
    reading_behavior:
      enabled: true
      chars_per_second: 250
      max_reading_time: 45
      text_selectors:
        - "p"
        - "article"
        - ".content"
        - ".post-content"
    
    link_hovering:
      enabled: true
      max_hovers_per_page: 5
      hover_duration: [0.8, 3.0]
      hover_probability: 0.6
"""
    
    logger.info("2. Advanced Configuration:")
    logger.info(advanced_config)
    
    # Example 3: Custom navigation selectors
    custom_selectors = """
selenium:
  browsing_behavior:
    navigation_selectors:
      category:
        - "a[href*='category']"
        - "a[href*='cat']"
        - ".menu-categories a"
        - "#sidebar-categories a"
      
      legal_pages:
        - "a[href*='about']"
        - "a[href*='contact']"
        - "a[href*='privacy']"
        - "a[href*='terms']"
        - ".footer-links a"
      
      previous_next:
        - "a[rel='prev']"
        - "a[rel='next']"
        - ".pagination a"
        - ".nav-previous a"
        - ".nav-next a"
"""
    
    logger.info("3. Custom Navigation Selectors:")
    logger.info(custom_selectors)

def show_usage_examples():
    """Show usage examples"""
    logger = logging.getLogger(__name__)
    
    logger.info("💻 Usage Examples")
    logger.info("=" * 60)
    
    # Example 1: Basic usage
    basic_usage = '''
# Basic usage with default configuration
automation = UndetectableSeleniumAutomation()
browsing_session = automation.simulate_realistic_browsing("https://example.com")

print(f"Visited {browsing_session['total_pages']} pages")
print(f"Session duration: {browsing_session['session_duration']:.1f}s")
'''
    
    logger.info("1. Basic Usage:")
    logger.info(basic_usage)
    
    # Example 2: With custom configuration
    custom_usage = '''
# With custom configuration
automation = UndetectableSeleniumAutomation("custom_config.yaml")

# The configuration file should contain:
selenium:
  browsing_behavior:
    min_pages: 3
    max_pages: 6
    navigation_probabilities:
      category: 0.5
      legal: 0.2
      previous_next: 0.7
      random: 0.1
'''
    
    logger.info("2. Custom Configuration:")
    logger.info(custom_usage)
    
    # Example 3: Integration with AdSense testing
    adsense_usage = '''
# Integration with AdSense testing
automation = UndetectableSeleniumAutomation()

# Test AdSense with realistic browsing
result = automation.test_adsense_ads("https://example.com")

print(f"Ads detected: {result['ads_detected']}")
print(f"Pages browsed: {result['browsing_session']['total_pages']}")
print(f"Navigation pattern: {result['browsing_session']['navigation_pattern']}")
'''
    
    logger.info("3. AdSense Integration:")
    logger.info(adsense_usage)

def main():
    """Main function"""
    setup_logging()
    
    print("🎯 Realistic Browsing Behavior Examples")
    print("=" * 80)
    print()
    
    # Demonstrate realistic browsing
    demonstrate_realistic_browsing()
    print()
    
    # Show configuration examples
    show_configuration_examples()
    print()
    
    # Show usage examples
    show_usage_examples()
    print()
    
    print("🎉 Examples complete! Check the logs for detailed information.")
    print("📁 Log file: realistic_browsing_example.log")

if __name__ == "__main__":
    main()
