"""
Profile Manager for Automate Project
Handles profile creation, storage, and management with proxy rotation
"""

import json
import time
import logging
import random
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
import os
from datetime import datetime, timedelta

from base_classes import BaseManager, StatisticsManager
from multilogin_api import MultiloginXAPI, ProfileData
from fingerprint_generator import FingerprintGenerator
from proxy_manager import ProxyManager

@dataclass
class ProfileInfo:
    profile_id: str
    folder_id: str
    name: str
    proxy: str
    provider: str
    fingerprint: Dict
    created_at: str
    last_used: Optional[str] = None
    usage_count: int = 0
    status: str = "idle"  # idle, active, error

class ProfileManager(BaseManager):
    def __init__(self, config_path: str = "../config/config.yaml"):
        """Initialize profile manager"""
        super().__init__(config_path)
        self.api = MultiloginXAPI(config_path)
        self.fingerprint_generator = FingerprintGenerator(config_path)
        self.proxy_manager = ProxyManager(config_path)
        
        # Load existing profiles
        self.profiles_file = self.config['storage']['profile_data_file']
        self.profiles: Dict[str, ProfileInfo] = self._load_profiles()
        
    def _load_profiles(self) -> Dict[str, ProfileInfo]:
        """Load existing profiles from file"""
        try:
            data = self._load_data(self.profiles_file)
            profiles = {}
            for profile_id, profile_data in data.items():
                # Handle backward compatibility for profiles without provider field
                if 'provider' not in profile_data:
                    profile_data['provider'] = 'multilogin_residential'
                profiles[profile_id] = ProfileInfo(**profile_data)
            self.logger.info(f"Loaded {len(profiles)} existing profiles")
            return profiles
        except Exception as e:
            self.logger.error(f"Error loading profiles: {e}")
            return {}
    
    def _save_profiles(self):
        """Save profiles to file"""
        try:
            data = {pid: asdict(profile) for pid, profile in self.profiles.items()}
            self._save_data(data, self.profiles_file)
        except Exception as e:
            self.logger.error(f"Error saving profiles: {e}")
    
    def create_profiles(self, count: int = None, provider: str = None) -> List[ProfileInfo]:
        """Create specified number of profiles with unique fingerprints and proxies"""
        if count is None:
            count = self.config['profiles']['total_count']
        
        if provider is None:
            provider = self.proxy_manager.current_provider
        
        created_profiles = []
        existing_count = len(self.profiles)
        
        self.logger.info(f"Creating {count} profiles with {provider} provider (existing: {existing_count})")
        
        for i in range(count):
            profile_num = existing_count + i + 1
            profile_name = f"automate_profile_{profile_num:03d}"
            
            # Get proxy based on provider
            if provider == "multilogin_residential":
                # For Multilogin built-in proxies, we don't need external proxy
                proxy = None
                proxy_location = self.config['profiles']['geo_default']
            else:
                # For external providers like SocksEscort, get proxy from proxy manager
                proxy = self.proxy_manager.get_available_proxy(self.config['profiles']['geo_default'])
                if not proxy:
                    self.logger.error(f"No available proxies for profile {profile_name}")
                    continue
                
                # Get proxy location from proxy info
                proxy_info = self.proxy_manager.get_proxy_info(proxy)
                proxy_location = proxy_info.country if proxy_info else self.config['profiles']['geo_default']
            
            # Generate unique fingerprint for proxy location
            fingerprint = self.fingerprint_generator.get_fingerprint_for_proxy(
                proxy or "residential", 
                proxy_location
            )
            
            # Validate fingerprint consistency with proxy location
            if not self.fingerprint_generator.validate_fingerprint_consistency(fingerprint, proxy_location):
                self.logger.warning(f"Fingerprint validation failed for profile {profile_name}, regenerating...")
                fingerprint = self.fingerprint_generator.get_fingerprint_for_proxy(
                    proxy or "residential", 
                    proxy_location
                )
            
            # Generate personality for referer simulation
            personalities = ["explorer", "researcher", "casual", "professional"]
            personality = random.choice(personalities)
            
            # Create profile via API with referer simulation
            profile_data = self.api.create_profile(
                profile_name, proxy, fingerprint, provider, 
                personality, proxy_location
            )
            if profile_data:
                profile_info = ProfileInfo(
                    profile_id=profile_data.profile_id,
                    folder_id=profile_data.folder_id,
                    name=profile_name,
                    proxy=proxy or "residential",
                    provider=provider,
                    fingerprint=fingerprint,
                    created_at=profile_data.created_at
                )
                
                self.profiles[profile_data.profile_id] = profile_info
                created_profiles.append(profile_info)
                
                # Mark proxy as successfully used if external proxy
                if proxy and provider != "multilogin_residential":
                    self.proxy_manager.mark_proxy_success(proxy)
                
                self.logger.info(f"Created profile {profile_name} with {provider} provider and {proxy_location} fingerprint")
                
                # Add delay between profile creation to avoid rate limiting
                time.sleep(random.uniform(1, 3))
            else:
                self.logger.error(f"Failed to create profile {profile_name}")
                # Mark proxy as failed if external proxy
                if proxy and provider != "multilogin_residential":
                    self.proxy_manager.mark_proxy_failed(proxy, "Profile creation failed")
        
        # Save profiles to file
        self._save_profiles()
        
        # Save referer statistics
        self.api.referer_simulator.save_referer_statistics()
        
        self.logger.info(f"Successfully created {len(created_profiles)} profiles with {provider} provider and referer simulation")
        return created_profiles
    
    def get_all_profiles(self) -> List[ProfileInfo]:
        """Get all profiles"""
        return list(self.profiles.values())
    
    def get_available_profile(self) -> Optional[ProfileInfo]:
        """Get an available profile for automation"""
        available_profiles = []
        
        for profile in self.profiles.values():
            if profile.status == "idle":
                # Check if profile hasn't been used recently
                if not profile.last_used or self._can_use_profile(profile):
                    available_profiles.append(profile)
        
        if available_profiles:
            return random.choice(available_profiles)
        else:
            self.logger.warning("No available profiles found")
            return None
    
    def _can_use_profile(self, profile: ProfileInfo) -> bool:
        """Check if profile can be used based on usage limits"""
        if not profile.last_used:
            return True
        
        last_used = datetime.fromisoformat(profile.last_used)
        time_since_last_use = datetime.now() - last_used
        
        # Check if enough time has passed since last use
        min_spacing = timedelta(minutes=self.config['scheduler']['session_spacing_minutes'])
        return time_since_last_use >= min_spacing
    
    def update_profile_status(self, profile_id: str, status: str):
        """Update profile status"""
        if profile_id in self.profiles:
            self.profiles[profile_id].status = status
            if status == "active":
                self.profiles[profile_id].last_used = datetime.now().isoformat()
                self.profiles[profile_id].usage_count += 1
            self._save_profiles()
    
    def rotate_profile_proxy(self, profile_id: str) -> bool:
        """Rotate proxy for a profile"""
        if profile_id not in self.profiles:
            return False
        
        profile = self.profiles[profile_id]
        new_provider = self.proxy_manager.current_provider
        
        # Get new proxy if using external provider
        if new_provider != "multilogin_residential":
            new_proxy = self.proxy_manager.get_available_proxy(self.config['profiles']['geo_default'])
            if not new_proxy:
                return False
        else:
            new_proxy = "residential"
        
        # Update profile via API
        if self.api.update_profile_proxy(profile_id, new_proxy, new_provider):
            old_proxy = profile.proxy
            old_provider = profile.provider
            
            profile.proxy = new_proxy
            profile.provider = new_provider
            
            # Mark new proxy as successfully used if external proxy
            if new_proxy != "residential":
                self.proxy_manager.mark_proxy_success(new_proxy)
            
            # Generate new fingerprint for new proxy
            new_fingerprint = self.fingerprint_generator.get_fingerprint_for_proxy(
                new_proxy, 
                self.config['profiles']['geo_default']
            )
            profile.fingerprint = new_fingerprint
            
            self._save_profiles()
            
            self.logger.info(f"Rotated proxy for profile {profile_id}: {old_provider}({old_proxy}) -> {new_provider}({new_proxy})")
            return True
        else:
            # Mark proxy as failed if external proxy
            if new_proxy != "residential":
                self.proxy_manager.mark_proxy_failed(new_proxy, "Profile proxy update failed")
        
        return False
    
    def get_profile_stats(self) -> Dict:
        """Get profile statistics"""
        total_profiles = len(self.profiles)
        idle_profiles = sum(1 for p in self.profiles.values() if p.status == "idle")
        active_profiles = sum(1 for p in self.profiles.values() if p.status == "active")
        error_profiles = sum(1 for p in self.profiles.values() if p.status == "error")
        
        total_usage = sum(p.usage_count for p in self.profiles.values())
        
        # Provider distribution
        provider_stats = {}
        for profile in self.profiles.values():
            provider = profile.provider
            if provider not in provider_stats:
                provider_stats[provider] = 0
            provider_stats[provider] += 1
        
        return {
            "total_profiles": total_profiles,
            "idle_profiles": idle_profiles,
            "active_profiles": active_profiles,
            "error_profiles": error_profiles,
            "total_usage": total_usage,
            "average_usage": total_usage / total_profiles if total_profiles > 0 else 0,
            "provider_distribution": provider_stats
        }
    
    def get_proxy_stats(self) -> Dict:
        """Get proxy usage statistics from proxy manager"""
        return self.proxy_manager.get_proxy_stats()
    
    def get_provider_stats(self) -> Dict:
        """Get provider statistics from proxy manager"""
        return self.proxy_manager.get_provider_stats()
    
    def cleanup_old_profiles(self, days_old: int = 30) -> int:
        """Clean up old profiles"""
        cutoff_date = datetime.now() - timedelta(days=days_old)
        profiles_to_delete = []
        
        for profile_id, profile in self.profiles.items():
            created_date = datetime.fromisoformat(profile.created_at.replace(' ', 'T'))
            if created_date < cutoff_date:
                profiles_to_delete.append(profile_id)
        
        deleted_count = 0
        for profile_id in profiles_to_delete:
            if self.api.delete_profile(profile_id):
                del self.profiles[profile_id]
                deleted_count += 1
        
        if deleted_count > 0:
            self._save_profiles()
            self.logger.info(f"Deleted {deleted_count} old profiles")
        
        return deleted_count
    
    def get_tier1_profiles(self) -> List[ProfileInfo]:
        """Get profiles configured for Tier 1 markets"""
        tier1_profiles = []
        tier1_countries = self.config['profiles']['fingerprint']['tier1_targeting']['countries']
        
        for profile in self.profiles.values():
            # Check if profile fingerprint is configured for Tier 1
            fingerprint_country = profile.fingerprint.get('country', 'US')
            if fingerprint_country in tier1_countries:
                tier1_profiles.append(profile)
        
        return tier1_profiles
    
    def optimize_for_tier1(self) -> int:
        """Optimize profiles for Tier 1 markets"""
        optimized_count = 0
        
        for profile in self.profiles.values():
            # Update fingerprint for Tier 1 targeting
            tier1_fingerprint = self.fingerprint_generator.get_fingerprint_for_proxy(
                profile.proxy,
                self.config['profiles']['geo_default']
            )
            
            if tier1_fingerprint != profile.fingerprint:
                profile.fingerprint = tier1_fingerprint
                optimized_count += 1
        
        if optimized_count > 0:
            self._save_profiles()
            self.logger.info(f"Optimized {optimized_count} profiles for Tier 1 markets")
        
        return optimized_count
    
    def switch_provider_for_all_profiles(self, new_provider: str) -> int:
        """Switch all profiles to use a different provider"""
        switched_count = 0
        
        for profile_id, profile in self.profiles.items():
            if profile.provider != new_provider:
                # Get new proxy for the provider
                if new_provider == "multilogin_residential":
                    new_proxy = "residential"
                else:
                    new_proxy = self.proxy_manager.get_available_proxy(self.config['profiles']['geo_default'])
                    if not new_proxy:
                        continue
                
                # Update profile proxy
                if self.api.update_profile_proxy(profile_id, new_proxy, new_provider):
                    old_provider = profile.provider
                    profile.provider = new_provider
                    profile.proxy = new_proxy
                    switched_count += 1
                    
                    self.logger.info(f"Switched profile {profile_id} from {old_provider} to {new_provider}")
        
        if switched_count > 0:
            self._save_profiles()
            self.logger.info(f"Switched {switched_count} profiles to {new_provider} provider")
        
        return switched_count
