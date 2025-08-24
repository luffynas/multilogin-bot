#!/usr/bin/env python3
"""
Referer Simulation Demonstration
Shows how referer simulation works at the Multilogin profile level
"""

import sys
import os
import logging
import random
from typing import List, Dict

# Add src directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'src'))

from referer_simulator import RefererSimulator

def setup_logging():
    """Setup logging configuration"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(),
            logging.FileHandler('referer_simulation_demo.log')
        ]
    )

def demonstrate_referer_types():
    """Demonstrate different referer types"""
    logger = logging.getLogger(__name__)
    
    logger.info("🔗 Referer Types Demonstration")
    logger.info("=" * 50)
    
    # Load config
    config = {
        "referer_simulation": {
            "enabled": True,
            "sources": [
                "google.com", "facebook.com", "twitter.com", "linkedin.com",
                "youtube.com", "reddit.com", "pinterest.com", "instagram.com",
                "bing.com", "duckduckgo.com", "yahoo.com", "quora.com",
                "medium.com", "dev.to"
            ],
            "keywords": [
                "technology", "business", "news", "entertainment", "sports",
                "health", "education", "finance", "lifestyle", "travel",
                "tech", "startup", "marketing", "design", "development"
            ],
            "probabilities": {
                "google": 0.6,
                "social": 0.25,
                "direct": 0.1,
                "other": 0.05
            },
            "social_probabilities": {
                "facebook": 0.3,
                "twitter": 0.2,
                "linkedin": 0.15,
                "youtube": 0.15,
                "reddit": 0.1,
                "pinterest": 0.05,
                "instagram": 0.05
            }
        }
    }
    
    referer_simulator = RefererSimulator(config)
    
    # Demonstrate different referer types
    referer_types = ["google", "social", "other", "direct"]
    
    for ref_type in referer_types:
        logger.info(f"📄 {ref_type.upper()} REFERER:")
        
        # Generate multiple examples
        for i in range(3):
            referer_config = referer_simulator.generate_referer_for_profile(
                personality="researcher",
                geo_location="US"
            )
            
            if referer_config["type"] == ref_type:
                logger.info(f"   Example {i+1}: {referer_config['referer']}")
                logger.info(f"   Description: {referer_config['description']}")
                logger.info(f"   Probability: {referer_config['probability']}")
                logger.info("")
    
    logger.info("")

def demonstrate_personality_based_referers():
    """Demonstrate personality-based referer generation"""
    logger = logging.getLogger(__name__)
    
    logger.info("🎭 Personality-Based Referer Generation")
    logger.info("=" * 50)
    
    config = {
        "referer_simulation": {
            "enabled": True,
            "probabilities": {
                "google": 0.6,
                "social": 0.25,
                "direct": 0.1,
                "other": 0.05
            }
        }
    }
    
    referer_simulator = RefererSimulator(config)
    
    personalities = ["explorer", "researcher", "casual", "professional"]
    
    for personality in personalities:
        logger.info(f"👤 {personality.upper()} PERSONALITY:")
        
        # Generate multiple referers for this personality
        referer_counts = {"google": 0, "social": 0, "direct": 0, "other": 0}
        
        for i in range(20):  # Generate 20 referers to see pattern
            referer_config = referer_simulator.generate_referer_for_profile(
                personality=personality,
                geo_location="US"
            )
            referer_counts[referer_config["type"]] += 1
        
        # Show distribution
        for ref_type, count in referer_counts.items():
            percentage = (count / 20) * 100
            logger.info(f"   {ref_type}: {count}/20 ({percentage:.1f}%)")
        
        logger.info("")
    
    logger.info("")

def demonstrate_geographic_referers():
    """Demonstrate geographic-based referer generation"""
    logger = logging.getLogger(__name__)
    
    logger.info("🌍 Geographic-Based Referer Generation")
    logger.info("=" * 50)
    
    config = {
        "referer_simulation": {
            "enabled": True,
            "probabilities": {
                "google": 0.6,
                "social": 0.25,
                "direct": 0.1,
                "other": 0.05
            }
        }
    }
    
    referer_simulator = RefererSimulator(config)
    
    countries = ["US", "GB", "DE", "CA", "AU"]
    
    for country in countries:
        logger.info(f"🌍 {country} GEOGRAPHIC PATTERN:")
        
        # Generate multiple referers for this country
        referer_counts = {"google": 0, "social": 0, "direct": 0, "other": 0}
        google_domains = []
        
        for i in range(15):  # Generate 15 referers to see pattern
            referer_config = referer_simulator.generate_referer_for_profile(
                personality="casual",
                geo_location=country
            )
            referer_counts[referer_config["type"]] += 1
            
            # Track Google domains for geographic verification
            if referer_config["type"] == "google" and referer_config.get("referer"):
                if "google.com" in referer_config["referer"]:
                    google_domains.append("google.com")
                elif "google.co.uk" in referer_config["referer"]:
                    google_domains.append("google.co.uk")
                elif "google.de" in referer_config["referer"]:
                    google_domains.append("google.de")
                elif "google.ca" in referer_config["referer"]:
                    google_domains.append("google.ca")
                elif "google.com.au" in referer_config["referer"]:
                    google_domains.append("google.com.au")
        
        # Show distribution
        for ref_type, count in referer_counts.items():
            percentage = (count / 15) * 100
            logger.info(f"   {ref_type}: {count}/15 ({percentage:.1f}%)")
        
        # Show Google domain distribution
        if google_domains:
            domain_counts = {}
            for domain in google_domains:
                domain_counts[domain] = domain_counts.get(domain, 0) + 1
            
            logger.info(f"   Google domains: {domain_counts}")
        
        logger.info("")
    
    logger.info("")

def demonstrate_batch_generation():
    """Demonstrate batch referer generation"""
    logger = logging.getLogger(__name__)
    
    logger.info("📦 Batch Referer Generation")
    logger.info("=" * 50)
    
    config = {
        "referer_simulation": {
            "enabled": True,
            "probabilities": {
                "google": 0.6,
                "social": 0.25,
                "direct": 0.1,
                "other": 0.05
            }
        }
    }
    
    referer_simulator = RefererSimulator(config)
    
    # Generate batch of referers
    batch_size = 10
    logger.info(f"Generating {batch_size} referers for profile creation...")
    
    referers = referer_simulator.generate_referer_batch(
        count=batch_size,
        personality="explorer",
        geo_location="US"
    )
    
    # Display batch results
    for i, referer in enumerate(referers, 1):
        logger.info(f"Profile {i:2d}: {referer['type']:8s} - {referer['referer']}")
    
    # Show statistics
    logger.info("")
    logger.info("📊 Batch Statistics:")
    
    type_counts = {}
    for referer in referers:
        ref_type = referer["type"]
        type_counts[ref_type] = type_counts.get(ref_type, 0) + 1
    
    for ref_type, count in type_counts.items():
        percentage = (count / batch_size) * 100
        logger.info(f"   {ref_type}: {count}/{batch_size} ({percentage:.1f}%)")
    
    logger.info("")

def demonstrate_multilogin_integration():
    """Demonstrate Multilogin profile integration"""
    logger = logging.getLogger(__name__)
    
    logger.info("🔧 Multilogin Profile Integration")
    logger.info("=" * 50)
    
    config = {
        "referer_simulation": {
            "enabled": True,
            "probabilities": {
                "google": 0.6,
                "social": 0.25,
                "direct": 0.1,
                "other": 0.05
            }
        }
    }
    
    referer_simulator = RefererSimulator(config)
    
    # Simulate profile creation with referer
    logger.info("Simulating profile creation with referer simulation:")
    
    personalities = ["explorer", "researcher", "casual", "professional"]
    countries = ["US", "GB", "DE"]
    
    for i in range(5):
        personality = random.choice(personalities)
        country = random.choice(countries)
        
        # Generate referer for profile
        referer_config = referer_simulator.generate_referer_for_profile(
            personality=personality,
            geo_location=country
        )
        
        logger.info(f"Profile {i+1}:")
        logger.info(f"   Name: AutoProfile_{i+1:03d}_multilogin")
        logger.info(f"   Personality: {personality}")
        logger.info(f"   Location: {country}")
        logger.info(f"   Referer Type: {referer_config['type']}")
        logger.info(f"   Referer URL: {referer_config['referer']}")
        
        # Show Multilogin configuration
        if referer_config.get("multilogin_config"):
            multilogin_config = referer_config["multilogin_config"]
            logger.info(f"   Multilogin Config:")
            logger.info(f"     Domain: {multilogin_config.get('domain', 'N/A')}")
            logger.info(f"     Path: {multilogin_config.get('path', 'N/A')}")
            logger.info(f"     Query: {multilogin_config.get('query', 'N/A')}")
            
            if multilogin_config.get("search_engine"):
                logger.info(f"     Search Engine: {multilogin_config['search_engine']}")
                logger.info(f"     Search Query: {multilogin_config.get('search_query', 'N/A')}")
                logger.info(f"     Country Domain: {multilogin_config.get('country_domain', 'N/A')}")
            
            if multilogin_config.get("social_platform"):
                logger.info(f"     Social Platform: {multilogin_config['social_platform']}")
                logger.info(f"     Social Path: {multilogin_config.get('social_path', 'N/A')}")
        
        logger.info("")
    
    logger.info("")

def demonstrate_analytics():
    """Demonstrate referer analytics"""
    logger = logging.getLogger(__name__)
    
    logger.info("📊 Referer Analytics Demonstration")
    logger.info("=" * 50)
    
    config = {
        "referer_simulation": {
            "enabled": True,
            "probabilities": {
                "google": 0.6,
                "social": 0.25,
                "direct": 0.1,
                "other": 0.05
            }
        }
    }
    
    referer_simulator = RefererSimulator(config)
    
    # Generate some referers to build statistics
    logger.info("Generating referers to build statistics...")
    
    for i in range(50):
        personality = random.choice(["explorer", "researcher", "casual", "professional"])
        country = random.choice(["US", "GB", "DE", "CA", "AU"])
        
        referer_simulator.generate_referer_for_profile(
            personality=personality,
            geo_location=country
        )
    
    # Get and display statistics
    stats = referer_simulator.get_referer_statistics()
    
    logger.info("📈 Referer Statistics:")
    logger.info(f"   Total referers: {stats['total_referers']}")
    
    logger.info("   Referer Types:")
    for ref_type, count in stats['referer_types'].items():
        percentage = (count / stats['total_referers']) * 100
        logger.info(f"     {ref_type}: {count} ({percentage:.1f}%)")
    
    logger.info("   Top Sources:")
    sorted_sources = sorted(stats['sources'].items(), key=lambda x: x[1], reverse=True)
    for source, count in sorted_sources[:5]:
        percentage = (count / stats['total_referers']) * 100
        logger.info(f"     {source}: {count} ({percentage:.1f}%)")
    
    logger.info("   Top Keywords:")
    sorted_keywords = sorted(stats['keywords'].items(), key=lambda x: x[1], reverse=True)
    for keyword, count in sorted_keywords[:5]:
        percentage = (count / stats['total_referers']) * 100
        logger.info(f"     {keyword}: {count} ({percentage:.1f}%)")
    
    # Save statistics
    referer_simulator.save_referer_statistics("data/referer_demo_statistics.json")
    logger.info("   💾 Statistics saved to data/referer_demo_statistics.json")
    
    logger.info("")

def run_comprehensive_demo():
    """Run comprehensive referer simulation demonstration"""
    logger = logging.getLogger(__name__)
    
    logger.info("🚀 Referer Simulation System - Comprehensive Demonstration")
    logger.info("=" * 80)
    logger.info("")
    
    # Demonstrate all features
    demonstrate_referer_types()
    demonstrate_personality_based_referers()
    demonstrate_geographic_referers()
    demonstrate_batch_generation()
    demonstrate_multilogin_integration()
    demonstrate_analytics()
    
    logger.info("🎉 Referer Simulation Demonstration Complete!")
    logger.info("=" * 80)
    logger.info("")
    logger.info("📁 Check the log file for detailed information:")
    logger.info("   referer_simulation_demo.log")
    logger.info("")
    logger.info("🔧 Referer simulation is now integrated into profile creation!")
    logger.info("   Each profile will have realistic referer patterns based on")
    logger.info("   personality and geographic location.")

def main():
    """Main function"""
    setup_logging()
    run_comprehensive_demo()

if __name__ == "__main__":
    main()
