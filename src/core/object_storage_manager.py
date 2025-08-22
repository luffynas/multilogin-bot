import requests
import logging
import time
import json
import os
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum


class StorageType(Enum):
    LOCAL = "local"
    CLOUD = "cloud"
    REMOTE = "remote"


class ObjectType(Enum):
    PROFILE_TEMPLATES = "7e46e7f9-15d4-41b6-83b9-a652336793ec"
    PROXY_CONFIG_TEMPLATES = "3c1a0080-5282-436b-885c-ab27d5004aa8"
    EXTENSIONS = "6811b909-2e4b-45db-ab62-f14f515523cf"
    COOKIES = "58268a18-02b8-4d2d-ac59-9cc166ea4064"
    PASSWORDS = "bb80e9b9-b2bb-43b5-968b-c2ea9b509d7a"
    AUTOMATION_SCRIPTS = "8dfc6cec-4aad-41f0-ac87-ff44a4be0b3a"
    LAUNCH_PARAMETER_TEMPLATES = "42d592bc-df3a-47b5-8d50-4b338df6ade2"


@dataclass
class ObjectMetadata:
    id: str
    object_name: str
    object_type_id: str
    storage_type: StorageType
    object_size: int
    created_at: str
    updated_at: str
    meta_info: Dict[str, Any]


class ObjectStorageManager:
    """
    Manages Multilogin X Object Storage for template management.
    Implements safe object storage operations to avoid account restrictions.
    """
    
    def __init__(self, base_url: str = "https://api.multilogin.com", 
                 launcher_url: str = "https://launcher.mlx.yt:45001"):
        self.base_url = base_url
        self.launcher_url = launcher_url
        self.logger = logging.getLogger(__name__)
        self.session = requests.Session()
        
        # Safe headers to avoid detection
        self.session.headers.update({
            "Accept": "application/json",
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        })
    
    def get_object_types(self) -> List[Dict[str, str]]:
        """
        Get list of available object types.
        SAFE OPERATION: Read-only, doesn't modify anything.
        """
        try:
            url = f"{self.base_url}/api/v1/resources/types"
            response = self.session.get(url, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                types = data.get("data", {}).get("types", [])
                self.logger.info(f"Retrieved {len(types)} object types")
                return types
            else:
                self.logger.error(f"Failed to get object types: {response.status_code}")
                return []
                
        except Exception as e:
            self.logger.error(f"Error getting object types: {e}")
            return []
    
    def get_object_statistics(self) -> Dict:
        """
        Get object storage statistics.
        SAFE OPERATION: Read-only statistics.
        """
        try:
            url = f"{self.base_url}/api/v1/resources/statistics"
            response = self.session.get(url, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                self.logger.info("Successfully retrieved object statistics")
                return data.get("data", {})
            else:
                self.logger.error(f"Failed to get object statistics: {response.status_code}")
                return {}
                
        except Exception as e:
            self.logger.error(f"Error getting object statistics: {e}")
            return {}
    
    def get_objects_meta(self, limit: int = 10, offset: int = 0, 
                        object_type_id: Optional[str] = None,
                        storage_type: Optional[StorageType] = None) -> List[ObjectMetadata]:
        """
        Get objects metadata with filtering options.
        SAFE OPERATION: Read-only, doesn't modify anything.
        """
        try:
            url = f"{self.base_url}/api/v1/resources/metas"
            params = {
                "limit": limit,
                "offset": offset
            }
            
            if object_type_id:
                params["object_type_id"] = object_type_id
            if storage_type:
                params["storage_type"] = storage_type.value
            
            response = self.session.get(url, params=params, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                objects_data = data.get("data", {}).get("objects", [])
                
                objects = []
                for obj_data in objects_data:
                    try:
                        obj = ObjectMetadata(
                            id=obj_data.get("id", ""),
                            object_name=obj_data.get("object_name", ""),
                            object_type_id=obj_data.get("object_type_id", ""),
                            storage_type=StorageType(obj_data.get("storage_type", "cloud")),
                            object_size=obj_data.get("object_size", 0),
                            created_at=obj_data.get("created_at", ""),
                            updated_at=obj_data.get("update_at", ""),
                            meta_info=obj_data.get("meta_info", {})
                        )
                        objects.append(obj)
                    except Exception as e:
                        self.logger.warning(f"Error parsing object metadata: {e}")
                        continue
                
                self.logger.info(f"Retrieved {len(objects)} objects metadata")
                return objects
            else:
                self.logger.error(f"Failed to get objects metadata: {response.status_code}")
                return []
                
        except Exception as e:
            self.logger.error(f"Error getting objects metadata: {e}")
            return []
    
    def get_object_meta_by_id(self, object_id: str) -> Optional[ObjectMetadata]:
        """
        Get specific object metadata by ID.
        SAFE OPERATION: Read-only, doesn't modify anything.
        """
        try:
            url = f"{self.base_url}/api/v1/resources/{object_id}/meta"
            response = self.session.get(url, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                obj_data = data.get("data", {})
                
                obj = ObjectMetadata(
                    id=obj_data.get("id", ""),
                    object_name=obj_data.get("object_name", ""),
                    object_type_id=obj_data.get("object_type_id", ""),
                    storage_type=StorageType(obj_data.get("storage_type", "cloud")),
                    object_size=obj_data.get("object_size", 0),
                    created_at=obj_data.get("created_at", ""),
                    updated_at=obj_data.get("update_at", ""),
                    meta_info=obj_data.get("meta_info", {})
                )
                
                self.logger.info(f"Retrieved metadata for object {object_id}")
                return obj
            else:
                self.logger.error(f"Failed to get object metadata: {response.status_code}")
                return None
                
        except Exception as e:
            self.logger.error(f"Error getting object metadata: {e}")
            return None
    
    def create_and_upload_object(self, object_name: str, object_extension: str,
                                object_type_id: str, object_body: str,
                                object_meta: str, encrypt: bool = False) -> Optional[str]:
        """
        Create and upload object to storage.
        SAFE OPERATION: Creates new object, doesn't modify existing ones.
        """
        try:
            url = f"{self.launcher_url}/api/v1/object_storage/create_and_upload"
            
            payload = {
                "object_name": object_name,
                "object_extension": object_extension,
                "object_type_id": object_type_id,
                "object_body": object_body,
                "object_meta": object_meta,
                "encrypt": encrypt
            }
            
            response = self.session.post(url, json=payload, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                meta_id = data.get("data", {}).get("meta_id")
                
                if meta_id:
                    self.logger.info(f"Successfully created and uploaded object: {object_name}")
                    return meta_id
                else:
                    self.logger.error("No meta_id received in response")
                    return None
            else:
                self.logger.error(f"Failed to create and upload object: {response.status_code}")
                return None
                
        except Exception as e:
            self.logger.error(f"Error creating and uploading object: {e}")
            return None
    
    def download_object(self, object_id: str) -> Optional[Dict]:
        """
        Download object from storage.
        SAFE OPERATION: Read-only download.
        """
        try:
            url = f"{self.launcher_url}/api/v1/object_storage/{object_id}/download"
            response = self.session.get(url, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                self.logger.info(f"Successfully downloaded object {object_id}")
                return data
            else:
                self.logger.error(f"Failed to download object: {response.status_code}")
                return None
                
        except Exception as e:
            self.logger.error(f"Error downloading object: {e}")
            return None
    
    def delete_object(self, object_id: str, permanently: bool = False) -> bool:
        """
        Delete object from storage.
        SAFE OPERATION: Moves to trashbin by default, doesn't permanently delete unless specified.
        """
        try:
            url = f"{self.base_url}/api/v1/resources/{object_id}/delete"
            params = {"permanently": permanently}
            
            response = self.session.get(url, params=params, timeout=30)
            
            if response.status_code == 200:
                self.logger.info(f"Successfully deleted object {object_id} (permanently: {permanently})")
                return True
            else:
                self.logger.error(f"Failed to delete object: {response.status_code}")
                return False
                
        except Exception as e:
            self.logger.error(f"Error deleting object: {e}")
            return False
    
    def restore_object(self, object_id: str) -> bool:
        """
        Restore object from trashbin.
        SAFE OPERATION: Restores deleted object.
        """
        try:
            url = f"{self.base_url}/api/v1/resources/{object_id}/restore"
            response = self.session.get(url, timeout=30)
            
            if response.status_code == 200:
                self.logger.info(f"Successfully restored object {object_id}")
                return True
            else:
                self.logger.error(f"Failed to restore object: {response.status_code}")
                return False
                
        except Exception as e:
            self.logger.error(f"Error restoring object: {e}")
            return False
    
    def create_extension_from_url(self, url: str, browser_type: str = "mimic",
                                 storage_type: StorageType = StorageType.CLOUD) -> bool:
        """
        Create extension from URL.
        SAFE OPERATION: Creates new extension, doesn't modify existing ones.
        """
        try:
            extension_url = f"{self.launcher_url}/api/v1/create_extension_from_url"
            
            payload = {
                "url": url,
                "browser_type": browser_type,
                "storage_type": storage_type.value
            }
            
            response = self.session.post(extension_url, json=payload, timeout=30)
            
            if response.status_code == 200:
                self.logger.info(f"Successfully created extension from URL: {url}")
                return True
            else:
                self.logger.error(f"Failed to create extension: {response.status_code}")
                return False
                
        except Exception as e:
            self.logger.error(f"Error creating extension: {e}")
            return False
    
    def enable_extension_for_profiles(self, object_id: str, profile_ids: List[str]) -> bool:
        """
        Enable extension for specific profiles.
        SAFE OPERATION: Enables extension, doesn't modify profile settings.
        """
        try:
            url = f"{self.base_url}/api/v1/resources/{object_id}/enable_for_profiles"
            
            payload = {"profile_ids": profile_ids}
            
            response = self.session.post(url, json=payload, timeout=30)
            
            if response.status_code == 200:
                self.logger.info(f"Successfully enabled extension {object_id} for {len(profile_ids)} profiles")
                return True
            else:
                self.logger.error(f"Failed to enable extension: {response.status_code}")
                return False
                
        except Exception as e:
            self.logger.error(f"Error enabling extension: {e}")
            return False
    
    def disable_extension_for_profiles(self, object_id: str, profile_ids: List[str]) -> bool:
        """
        Disable extension for specific profiles.
        SAFE OPERATION: Disables extension, doesn't modify profile settings.
        """
        try:
            url = f"{self.base_url}/api/v1/resources/{object_id}/disable_for_profiles"
            
            payload = {"profile_ids": profile_ids}
            
            response = self.session.post(url, json=payload, timeout=30)
            
            if response.status_code == 200:
                self.logger.info(f"Successfully disabled extension {object_id} for {len(profile_ids)} profiles")
                return True
            else:
                self.logger.error(f"Failed to disable extension: {response.status_code}")
                return False
                
        except Exception as e:
            self.logger.error(f"Error disabling extension: {e}")
            return False
    
    def get_profile_object_usages(self, object_type: str, profile_id: str) -> List[Dict]:
        """
        Get objects used by a specific profile.
        SAFE OPERATION: Read-only usage information.
        """
        try:
            url = f"{self.base_url}/api/v1/resources/profile_object_usages"
            
            payload = {
                "object_type": object_type,
                "profile_id": profile_id
            }
            
            response = self.session.post(url, json=payload, timeout=30)
            
            if response.status_code == 200:
                data = response.json()
                objects = data.get("data", [])
                self.logger.info(f"Retrieved {len(objects)} objects for profile {profile_id}")
                return objects
            else:
                self.logger.error(f"Failed to get profile object usages: {response.status_code}")
                return []
                
        except Exception as e:
            self.logger.error(f"Error getting profile object usages: {e}")
            return []
    
    def create_safe_profile_template(self, template_name: str, geo_location: str = "US") -> Optional[str]:
        """
        Create a safe profile template for AdSense testing.
        SAFE: Creates template with conservative settings.
        """
        try:
            template_data = {
                "name": f"{template_name}_{geo_location}",
                "geo_location": geo_location,
                "browser_type": "mimic",
                "os_type": "windows",
                "core_version": 135,
                "flags": {
                    "audio_masking": "mask",
                    "fonts_masking": "mask",
                    "geolocation_masking": "mask",
                    "graphics_masking": "mask",
                    "proxy_masking": "custom",
                    "screen_masking": "mask",
                    "timezone_masking": "mask",
                    "webrtc_masking": "mask"
                },
                "fingerprint": {
                    "navigator": {
                        "platform": "Win32",
                        "user_agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                    },
                    "screen": {
                        "width": 1920,
                        "height": 1080,
                        "pixel_ratio": 1
                    }
                },
                "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
                "safe_settings": True,
                "adsense_optimized": True
            }
            
            object_body = json.dumps(template_data, indent=2)
            object_meta = json.dumps({
                "template_type": "profile",
                "geo_location": geo_location,
                "safe_mode": True,
                "adsense_optimized": True
            })
            
            meta_id = self.create_and_upload_object(
                object_name=template_name,
                object_extension="json",
                object_type_id=ObjectType.PROFILE_TEMPLATES.value,
                object_body=object_body,
                object_meta=object_meta,
                encrypt=False
            )
            
            if meta_id:
                self.logger.info(f"Successfully created safe profile template: {template_name}")
                return meta_id
            else:
                self.logger.error(f"Failed to create profile template: {template_name}")
                return None
                
        except Exception as e:
            self.logger.error(f"Error creating safe profile template: {e}")
            return None
