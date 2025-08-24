#!/usr/bin/env python3
"""
Main entry point for Automate Project
Handles command-line interface and orchestrates automation tasks
"""

import argparse
import logging
import sys
import os
import yaml
from typing import Optional

# Add src to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from profile_manager import ProfileManager
from scheduler import AutomationScheduler

def setup_logging(config_path: str = "config/config.yaml") -> None:
    """Setup logging configuration"""
    try:
        with open(config_path, 'r') as file:
            config = yaml.safe_load(file)
        
        log_config = config.get('logging', {})
        log_level = getattr(logging, log_config.get('level', 'INFO'))
        log_file = log_config.get('file', 'logs/automate.log')
        log_format = log_config.get('format', '%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        
        # Create logs directory if it doesn't exist
        os.makedirs(os.path.dirname(log_file), exist_ok=True)
        
        # Configure logging
        logging.basicConfig(
            level=log_level,
            format=log_format,
            handlers=[
                logging.FileHandler(log_file),
                logging.StreamHandler(sys.stdout)
            ]
        )
        
        logging.info("Logging configured successfully")
        
    except Exception as e:
        print(f"Error setting up logging: {e}")
        # Fallback to basic logging
        logging.basicConfig(level=logging.INFO)

def create_profiles(profile_count: int = None, config_path: str = "config/config.yaml", provider: str = None) -> None:
    """Create profiles with specified count and provider"""
    try:
        logging.info("Starting profile creation...")
        
        profile_manager = ProfileManager(config_path)
        
        # Check existing profiles
        existing_profiles = len(profile_manager.profiles)
        logging.info(f"Found {existing_profiles} existing profiles")
        
        if profile_count is None:
            with open(config_path, 'r') as file:
                config = yaml.safe_load(file)
            profile_count = config['profiles']['total_count']
        
        # Calculate how many profiles to create
        profiles_to_create = max(0, profile_count - existing_profiles)
        
        if profiles_to_create == 0:
            logging.info("No new profiles needed to be created")
            return
        
        logging.info(f"Creating {profiles_to_create} new profiles...")
        
        # Create profiles with specified provider
        created_profiles = profile_manager.create_profiles(profiles_to_create, provider)
        
        logging.info(f"Successfully created {len(created_profiles)} profiles")
        
        # Show statistics
        stats = profile_manager.get_profile_stats()
        logging.info(f"Profile Statistics: {stats}")
        
    except Exception as e:
        logging.error(f"Error creating profiles: {e}")
        raise

def run_automation(config_path: str = "config/config.yaml", concurrent: bool = False) -> None:
    """Run automation with scheduler"""
    try:
        logging.info("Starting automation...")
        
        scheduler = AutomationScheduler(config_path)
        
        if concurrent:
            logging.info("Running concurrent automation sessions...")
            max_concurrent = None  # Use default from config
            scheduler.run_concurrent_sessions(max_concurrent)
        else:
            logging.info("Starting automation scheduler...")
            scheduler.start_scheduler()
        
    except Exception as e:
        logging.error(f"Error running automation: {e}")
        raise

def show_stats(config_path: str = "config/config.yaml") -> None:
    """Show comprehensive statistics"""
    try:
        logging.info("Gathering statistics...")
        
        profile_manager = ProfileManager(config_path)
        
        # Profile statistics
        profile_stats = profile_manager.get_profile_stats()
        print("\n" + "="*50)
        print("PROFILE STATISTICS")
        print("="*50)
        print(f"Total Profiles: {profile_stats['total_profiles']}")
        print(f"Idle Profiles: {profile_stats['idle_profiles']}")
        print(f"Active Profiles: {profile_stats['active_profiles']}")
        print(f"Error Profiles: {profile_stats['error_profiles']}")
        print(f"Total Usage: {profile_stats['total_usage']}")
        print(f"Average Usage: {profile_stats['average_usage']:.2f}")
        
        if profile_stats['provider_distribution']:
            print("\nProvider Distribution:")
            for provider, count in profile_stats['provider_distribution'].items():
                print(f"  {provider}: {count}")
        
        # Proxy statistics
        proxy_stats = profile_manager.get_proxy_stats()
        print("\n" + "="*50)
        print("PROXY STATISTICS")
        print("="*50)
        print(f"Total Proxies: {proxy_stats['total_proxies']}")
        print(f"Healthy Proxies: {proxy_stats['healthy_proxies']}")
        print(f"Blacklisted Proxies: {proxy_stats['blacklisted_proxies']}")
        print(f"Available Proxies: {proxy_stats['available_proxies']}")
        print(f"Health Percentage: {proxy_stats['health_percentage']:.1f}%")
        print(f"Availability Percentage: {proxy_stats['availability_percentage']:.1f}%")
        print(f"Current Provider: {proxy_stats['current_provider']}")
        
        if proxy_stats['provider_distribution']:
            print("\nProxy Provider Distribution:")
            for provider, count in proxy_stats['provider_distribution'].items():
                print(f"  {provider}: {count}")
        
        # Provider statistics
        provider_stats = profile_manager.get_provider_stats()
        print("\n" + "="*50)
        print("PROVIDER STATISTICS")
        print("="*50)
        for provider_name, stats in provider_stats.items():
            print(f"\n{provider_name.upper()}:")
            print(f"  Enabled: {stats['enabled']}")
            print(f"  Active: {stats['active']}")
            print(f"  Priority: {stats['priority']}")
            if stats['data_limit']:
                print(f"  Data Limit: {stats['data_limit']}")
                print(f"  Data Used: {stats['data_used']:.2f} MB")
                if stats['data_remaining'] is not None:
                    print(f"  Data Remaining: {stats['data_remaining']:.2f} MB")
            print(f"  Success Rate: {stats['success_rate']:.2f}")
            print(f"  Failure Count: {stats['failure_count']}")
            if stats['last_used']:
                print(f"  Last Used: {stats['last_used']}")
        
        print("\n" + "="*50)
        
    except Exception as e:
        logging.error(f"Error showing statistics: {e}")
        raise

def switch_provider(provider: str, config_path: str = "config/config.yaml") -> None:
    """Switch to a different proxy provider"""
    try:
        logging.info(f"Switching to provider: {provider}")
        
        profile_manager = ProfileManager(config_path)
        proxy_manager = profile_manager.proxy_manager
        
        if provider == "socksescort":
            success = proxy_manager.switch_to_socksescort()
            if success:
                logging.info("Successfully switched to SocksEscort provider")
            else:
                logging.error("Failed to switch to SocksEscort provider")
                return
        elif provider == "multilogin":
            success = proxy_manager.switch_to_multilogin()
            if success:
                logging.info("Successfully switched to Multilogin provider")
            else:
                logging.error("Failed to switch to Multilogin provider")
                return
        else:
            logging.error(f"Unknown provider: {provider}")
            return
        
        # Switch all existing profiles to the new provider
        switched_count = profile_manager.switch_provider_for_all_profiles(provider)
        logging.info(f"Switched {switched_count} profiles to {provider} provider")
        
        # Show updated statistics
        show_stats(config_path)
        
    except Exception as e:
        logging.error(f"Error switching provider: {e}")
        raise

def cleanup_old_data(config_path: str = "config/config.yaml", days: int = 30) -> None:
    """Clean up old profiles and data"""
    try:
        logging.info(f"Cleaning up data older than {days} days...")
        
        profile_manager = ProfileManager(config_path)
        
        # Clean up old profiles
        deleted_profiles = profile_manager.cleanup_old_profiles(days)
        logging.info(f"Deleted {deleted_profiles} old profiles")
        
        # Show updated statistics
        show_stats(config_path)
        
    except Exception as e:
        logging.error(f"Error cleaning up data: {e}")
        raise

def main():
    """Main function to handle command-line arguments"""
    parser = argparse.ArgumentParser(description="Automate Project - Undetectable AdSense Testing")
    
    parser.add_argument(
        "--action", 
        choices=["create", "run", "run-concurrent", "stats", "switch-provider", "cleanup"],
        default="run",
        help="Action to perform"
    )
    
    parser.add_argument(
        "--profiles", 
        type=int,
        help="Number of profiles to create"
    )
    
    parser.add_argument(
        "--provider",
        choices=["multilogin", "socksescort"],
        help="Proxy provider to use (for create or switch-provider actions)"
    )
    
    parser.add_argument(
        "--config",
        default="config/config.yaml",
        help="Configuration file path"
    )
    
    parser.add_argument(
        "--log-level",
        choices=["DEBUG", "INFO", "WARNING", "ERROR"],
        default="INFO",
        help="Log level"
    )
    
    parser.add_argument(
        "--days",
        type=int,
        default=30,
        help="Number of days for cleanup (for cleanup action)"
    )
    
    args = parser.parse_args()
    
    # Setup logging
    setup_logging(args.config)
    
    # Set log level
    logging.getLogger().setLevel(getattr(logging, args.log_level))
    
    try:
        if args.action == "create":
            create_profiles(args.profiles, args.config, args.provider)
        
        elif args.action == "run":
            run_automation(args.config, concurrent=False)
        
        elif args.action == "run-concurrent":
            run_automation(args.config, concurrent=True)
        
        elif args.action == "stats":
            show_stats(args.config)
        
        elif args.action == "switch-provider":
            if not args.provider:
                logging.error("Provider must be specified for switch-provider action")
                sys.exit(1)
            switch_provider(args.provider, args.config)
        
        elif args.action == "cleanup":
            cleanup_old_data(args.config, args.days)
        
        else:
            logging.error(f"Unknown action: {args.action}")
            sys.exit(1)
    
    except KeyboardInterrupt:
        logging.info("Operation interrupted by user")
        sys.exit(0)
    except Exception as e:
        logging.error(f"Operation failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
