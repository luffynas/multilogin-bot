import requests
import logging
import time
import json
import os
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum


class BookmarkOperation(Enum):
    OVERRIDE = "override"
    APPEND = "append"


@dataclass
class BookmarkData:
    name: str
    url: str
    folder: Optional[str] = None
    created_at: Optional[str] = None


class BookmarkManager:
    """
    Manages Multilogin X Bookmark Management for profile consistency.
    Implements safe bookmark operations to avoid account restrictions.
    """
    
    def __init__(self, launcher_url: str = "https://launcher.mlx.yt:45001"):
        self.launcher_url = launcher_url
        self.logger = logging.getLogger(__name__)
        self.session = requests.Session()
        
        # Safe headers to avoid detection
        self.session.headers.update({
            "Accept": "application/json",
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        })
    
    def export_bookmarks(self, profile_id: str) -> Optional[str]:
        """
        Export bookmarks from a profile.
        SAFE OPERATION: Read-only export, doesn't modify profile.
        """
        try:
            url = f"{self.launcher_url}/api/v1/profile/{profile_id}/bookmarks/export"
            response = self.session.get(url, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                export_path = data.get("data", {}).get("path", "")
                
                if export_path:
                    self.logger.info(f"Successfully exported bookmarks for profile {profile_id}")
                    return export_path
                else:
                    self.logger.error("No export path received")
                    return None
            else:
                self.logger.error(f"Failed to export bookmarks: {response.status_code}")
                return None
                
        except Exception as e:
            self.logger.error(f"Error exporting bookmarks: {e}")
            return None
    
    def import_bookmarks(self, profile_id: str, bookmark_paths: List[str], 
                        operation: BookmarkOperation = BookmarkOperation.OVERRIDE) -> bool:
        """
        Import bookmarks into a profile.
        SAFE OPERATION: Imports bookmarks, maintains profile consistency.
        """
        try:
            url = f"{self.launcher_url}/api/v1/profile/{profile_id}/bookmarks/import"
            
            payload = {
                "paths": bookmark_paths,
                "operation": operation.value
            }
            
            response = self.session.post(url, json=payload, timeout=30)
            
            if response.status_code == 200:
                self.logger.info(f"Successfully imported bookmarks for profile {profile_id}")
                return True
            else:
                self.logger.error(f"Failed to import bookmarks: {response.status_code}")
                return False
                
        except Exception as e:
            self.logger.error(f"Error importing bookmarks: {e}")
            return False
    
    def copy_bookmarks(self, source_profile_id: str, target_profile_id: str,
                      operation: BookmarkOperation = BookmarkOperation.OVERRIDE) -> bool:
        """
        Copy bookmarks from one profile to another.
        SAFE OPERATION: Copies bookmarks, maintains consistency.
        """
        try:
            url = f"{self.launcher_url}/api/v1/profile/{target_profile_id}/bookmarks/copy/{source_profile_id}"
            
            payload = {
                "operation": operation.value
            }
            
            response = self.session.post(url, json=payload, timeout=30)
            
            if response.status_code == 200:
                self.logger.info(f"Successfully copied bookmarks from {source_profile_id} to {target_profile_id}")
                return True
            else:
                self.logger.error(f"Failed to copy bookmarks: {response.status_code}")
                return False
                
        except Exception as e:
            self.logger.error(f"Error copying bookmarks: {e}")
            return False
    
    def get_bookmark_directory(self) -> str:
        """
        Get the default bookmark directory based on OS.
        SAFE: Returns path without modifying anything.
        """
        import platform
        
        system = platform.system().lower()
        username = os.getenv('USERNAME') or os.getenv('USER')
        
        if system == "windows":
            return f"C:\\Users\\{username}\\mlx\\bookmarks"
        elif system == "darwin":  # macOS
            return f"/Users/{username}/mlx/bookmarks"
        else:  # Linux
            return f"/home/{username}/mlx/bookmarks"
    
    def create_safe_adsense_bookmarks(self, profile_id: str) -> bool:
        """
        Create safe AdSense-related bookmarks for a profile.
        SAFE: Creates realistic bookmark structure.
        """
        try:
            # Create safe AdSense bookmark structure
            safe_bookmarks = [
                {
                    "name": "Google AdSense",
                    "url": "https://www.google.com/adsense",
                    "folder": "Business"
                },
                {
                    "name": "Google Analytics",
                    "url": "https://analytics.google.com",
                    "folder": "Business"
                },
                {
                    "name": "Google Search Console",
                    "url": "https://search.google.com/search-console",
                    "folder": "Business"
                },
                {
                    "name": "Personal Loans",
                    "url": "https://www.google.com/search?q=personal+loans",
                    "folder": "Research"
                },
                {
                    "name": "Mortgage Rates",
                    "url": "https://www.google.com/search?q=mortgage+rates",
                    "folder": "Research"
                },
                {
                    "name": "Credit Cards",
                    "url": "https://www.google.com/search?q=credit+cards",
                    "folder": "Research"
                },
                {
                    "name": "Financial News",
                    "url": "https://www.google.com/search?q=financial+news",
                    "folder": "News"
                },
                {
                    "name": "Investment Tips",
                    "url": "https://www.google.com/search?q=investment+tips",
                    "folder": "Research"
                }
            ]
            
            # Create bookmark file
            bookmark_dir = self.get_bookmark_directory()
            os.makedirs(bookmark_dir, exist_ok=True)
            
            bookmark_file = os.path.join(bookmark_dir, f"{profile_id}_safe_bookmarks.json")
            
            bookmark_data = {
                "profile_id": profile_id,
                "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
                "bookmarks": safe_bookmarks,
                "safe_mode": True,
                "adsense_optimized": True
            }
            
            with open(bookmark_file, 'w') as f:
                json.dump(bookmark_data, f, indent=2)
            
            # Import bookmarks to profile
            success = self.import_bookmarks(profile_id, [bookmark_file], BookmarkOperation.OVERRIDE)
            
            if success:
                self.logger.info(f"Successfully created and imported safe bookmarks for profile {profile_id}")
                return True
            else:
                self.logger.error(f"Failed to import safe bookmarks for profile {profile_id}")
                return False
                
        except Exception as e:
            self.logger.error(f"Error creating safe bookmarks: {e}")
            return False
    
    def create_geo_specific_bookmarks(self, profile_id: str, geo_location: str = "US") -> bool:
        """
        Create geo-specific bookmarks for a profile.
        SAFE: Creates location-appropriate bookmarks.
        """
        try:
            # Geo-specific bookmark mappings
            geo_bookmarks = {
                "US": [
                    {"name": "US Banking", "url": "https://www.google.com/search?q=us+banking", "folder": "Finance"},
                    {"name": "US Mortgages", "url": "https://www.google.com/search?q=us+mortgages", "folder": "Finance"},
                    {"name": "US Credit Cards", "url": "https://www.google.com/search?q=us+credit+cards", "folder": "Finance"}
                ],
                "CA": [
                    {"name": "Canadian Banking", "url": "https://www.google.com/search?q=canadian+banking", "folder": "Finance"},
                    {"name": "Canadian Mortgages", "url": "https://www.google.com/search?q=canadian+mortgages", "folder": "Finance"}
                ],
                "UK": [
                    {"name": "UK Banking", "url": "https://www.google.com/search?q=uk+banking", "folder": "Finance"},
                    {"name": "UK Mortgages", "url": "https://www.google.com/search?q=uk+mortgages", "folder": "Finance"}
                ],
                "AU": [
                    {"name": "Australian Banking", "url": "https://www.google.com/search?q=australian+banking", "folder": "Finance"},
                    {"name": "Australian Mortgages", "url": "https://www.google.com/search?q=australian+mortgages", "folder": "Finance"}
                ],
                "DE": [
                    {"name": "German Banking", "url": "https://www.google.com/search?q=german+banking", "folder": "Finance"},
                    {"name": "German Mortgages", "url": "https://www.google.com/search?q=german+mortgages", "folder": "Finance"}
                ],
                "FR": [
                    {"name": "French Banking", "url": "https://www.google.com/search?q=french+banking", "folder": "Finance"},
                    {"name": "French Mortgages", "url": "https://www.google.com/search?q=french+mortgages", "folder": "Finance"}
                ],
                "ID": [
                    {"name": "Indonesian Banking", "url": "https://www.google.com/search?q=indonesian+banking", "folder": "Finance"},
                    {"name": "Indonesian Loans", "url": "https://www.google.com/search?q=indonesian+loans", "folder": "Finance"}
                ]
            }
            
            # Get bookmarks for geo location
            bookmarks = geo_bookmarks.get(geo_location.upper(), geo_bookmarks["US"])
            
            # Create bookmark file
            bookmark_dir = self.get_bookmark_directory()
            os.makedirs(bookmark_dir, exist_ok=True)
            
            bookmark_file = os.path.join(bookmark_dir, f"{profile_id}_{geo_location.lower()}_bookmarks.json")
            
            bookmark_data = {
                "profile_id": profile_id,
                "geo_location": geo_location,
                "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
                "bookmarks": bookmarks,
                "safe_mode": True,
                "geo_specific": True
            }
            
            with open(bookmark_file, 'w') as f:
                json.dump(bookmark_data, f, indent=2)
            
            # Import bookmarks to profile
            success = self.import_bookmarks(profile_id, [bookmark_file], BookmarkOperation.OVERRIDE)
            
            if success:
                self.logger.info(f"Successfully created geo-specific bookmarks for profile {profile_id} ({geo_location})")
                return True
            else:
                self.logger.error(f"Failed to import geo-specific bookmarks for profile {profile_id}")
                return False
                
        except Exception as e:
            self.logger.error(f"Error creating geo-specific bookmarks: {e}")
            return False
    
    def validate_bookmark_consistency(self, profile_id: str, geo_location: str = "US") -> bool:
        """
        Validate bookmark consistency for a profile.
        SAFE: Read-only validation.
        """
        try:
            # Export bookmarks to check consistency
            export_path = self.export_bookmarks(profile_id)
            
            if not export_path:
                self.logger.warning(f"No bookmarks found for profile {profile_id}")
                return False
            
            # Check if export file exists and has content
            if os.path.exists(export_path):
                with open(export_path, 'r') as f:
                    bookmark_data = json.load(f)
                
                if bookmark_data and "bookmarks" in bookmark_data:
                    bookmark_count = len(bookmark_data["bookmarks"])
                    self.logger.info(f"Profile {profile_id} has {bookmark_count} bookmarks")
                    return bookmark_count > 0
                else:
                    self.logger.warning(f"No valid bookmark data found for profile {profile_id}")
                    return False
            else:
                self.logger.warning(f"Bookmark export file not found: {export_path}")
                return False
                
        except Exception as e:
            self.logger.error(f"Error validating bookmark consistency: {e}")
            return False
    
    def safe_bookmark_management(self, profile_id: str, geo_location: str = "US") -> bool:
        """
        Safely manage bookmarks for a profile.
        IMPLEMENTATION: Creates consistent, geo-appropriate bookmarks.
        """
        try:
            # Create geo-specific bookmarks
            success = self.create_geo_specific_bookmarks(profile_id, geo_location)
            
            if success:
                # Validate consistency
                is_consistent = self.validate_bookmark_consistency(profile_id, geo_location)
                
                if is_consistent:
                    self.logger.info(f"Successfully managed safe bookmarks for profile {profile_id}")
                    return True
                else:
                    self.logger.warning(f"Bookmarks created but consistency check failed for profile {profile_id}")
                    return False
            else:
                self.logger.error(f"Failed to create bookmarks for profile {profile_id}")
                return False
                
        except Exception as e:
            self.logger.error(f"Error in safe bookmark management: {e}")
            return False
    
    def batch_bookmark_management(self, profile_ids: List[str], geo_locations: List[str]) -> Dict[str, bool]:
        """
        Manage bookmarks for multiple profiles.
        SAFE: Uses consistent settings per profile.
        """
        results = {}
        
        for profile_id, geo_location in zip(profile_ids, geo_locations):
            try:
                success = self.safe_bookmark_management(profile_id, geo_location)
                results[profile_id] = success
                
                if success:
                    self.logger.info(f"Successfully managed bookmarks for profile {profile_id}")
                else:
                    self.logger.warning(f"Failed to manage bookmarks for profile {profile_id}")
                
                # Safe delay between operations
                time.sleep(1)
                
            except Exception as e:
                self.logger.error(f"Error managing bookmarks for profile {profile_id}: {e}")
                results[profile_id] = False
        
        success_count = sum(results.values())
        self.logger.info(f"Bookmark management completed: {success_count}/{len(profile_ids)} profiles successful")
        
        return results
