"""
Main menu system for the application
"""
from typing import List, Dict, Any, Optional
import time
import random
from concurrent.futures import ThreadPoolExecutor, as_completed
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.prompt import Prompt, Confirm
from rich import print as rprint

from api.launcher import LauncherAPI
from api.profile_management import ProfileManagementAPI
from api.profile_access import ProfileAccessAPI
from api.proxy import ProxyAPI
from api.cookies import CookiesAPI
from api.object_storage import ObjectStorageAPI
from api.extension import ExtensionAPI
from api.script_runner import ScriptRunnerAPI
from bot.manager import BotManager
from models.base import ProfileInfo

class MenuSystem:
    """Main menu system for the application"""
    
    def __init__(
        self,
        launcher_api: LauncherAPI,
        profile_api: ProfileManagementAPI,
        profile_access_api: ProfileAccessAPI,
        proxy_api: ProxyAPI,
        cookies_api: CookiesAPI,
        object_storage_api: ObjectStorageAPI,
        extension_api: ExtensionAPI,
        script_runner_api: ScriptRunnerAPI,
        bot_manager: BotManager
    ):
        self.console = Console()
        self.launcher_api = launcher_api
        self.profile_api = profile_api
        self.profile_access_api = profile_access_api
        self.proxy_api = proxy_api
        self.cookies_api = cookies_api
        self.object_storage_api = object_storage_api
        self.extension_api = extension_api
        self.script_runner_api = script_runner_api
        self.bot_manager = bot_manager
    
    def display_welcome(self):
        """Display welcome message"""
        welcome_text = """
🚀 Multilogin X API Automation Tool

This tool helps you automate Multilogin browser profiles with:
• Profile management and automation
• Concurrent bot execution
• Proxy and cookie management
• Extension management
• 30-minute runtime limits per profile
        """
        
        panel = Panel(welcome_text, title="Welcome", border_style="blue")
        self.console.print(panel)
    
    def display_main_menu(self) -> str:
        """Display main menu and get user choice"""
        menu_text = """
1. Check All Profiles
2. Update Proxy to Profile
3. Upload Object
4. Create Extension
5. Available Extensions
6. Activate Extension
7. Import Cookies
8. Convert Storage
9. Start Bot (Single Profile)
10. Start Bot (Multiple Profiles)
11. Start Bot Script-Runner (Multiple Profiles)
12. Profile Warm (Multiple Profiles)
13. Stop Profile
14. Stop All Profiles
15. View Running Profiles Status
16. Exit
        """
        
        panel = Panel(menu_text, title="Main Menu", border_style="green")
        self.console.print(panel)
        
        choice = Prompt.ask(
            "Select an option",
            choices=["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16"],
            default="1"
        )
        
        return choice
    
    def check_all_profiles(self):
        """Check and display all profiles"""
        self.console.print("\n🔍 Checking all profiles...")
        
        response = self.profile_api.list_profiles()
        
        if response.success and response.data:
            profiles = response.data.get("profiles", [])
            
            if profiles:
                table = Table(title="Available Profiles")
                table.add_column("ID", style="cyan")
                table.add_column("Name", style="green")
                table.add_column("Folder ID", style="yellow")
                table.add_column("Status", style="magenta")
                
                for profile in profiles:
                    # Determine status based on in_use_by field
                    status = "available" if not profile.get("in_use_by") else "in_use"
                    table.add_row(
                        profile.get("id", "")[:8] + "...",
                        profile.get("name", ""),
                        profile.get("folder_id", "")[:8] + "...",
                        status
                    )
                
                self.console.print(table)
                self.console.print(f"\n✅ Found {len(profiles)} profiles")
                
                # Display profile IDs list
                profile_ids = self.profile_api.get_profile_ids_list()
                if profile_ids:
                    self.console.print(f"\n📋 Profile IDs List ({len(profile_ids)} profiles):")
                    # Display IDs in a more compact format
                    ids_text = ", ".join([f"{pid[:8]}..." for pid in profile_ids[:20]])  # Show first 20
                    if len(profile_ids) > 20:
                        ids_text += f" ... and {len(profile_ids) - 20} more"
                    self.console.print(f"[dim]{ids_text}[/dim]")
            else:
                self.console.print("❌ No profiles found")
        else:
            self.console.print(f"❌ Error: {response.error}")
    
    def update_proxy_to_profile(self):
        """Update proxy for a profile with complete flow"""
        self.console.print("\n🌐 Update Proxy to Profile")
        
        # Get profile ID or 'all'
        profile_input = Prompt.ask("Enter profile ID or 'all' to update all profiles")
        
        # Get proxy configuration
        country = Prompt.ask("Enter country code", default="us")
        protocol = Prompt.ask("Enter protocol", choices=["socks5", "http", "https"], default="socks5")
        connection_type = Prompt.ask("Enter connection type", choices=["residential", "datacenter"], default="residential")
        
        # Get custom start URLs
        start_urls_input = Prompt.ask("Enter custom start URLs (comma-separated, optional)", default="")
        custom_start_urls = [url.strip() for url in start_urls_input.split(",") if url.strip()] if start_urls_input else []
        
        if profile_input.lower() == "all":
            # Update all profiles
            profiles = self.profile_api.get_all_saved_profiles()
            if not profiles:
                self.console.print("❌ No profiles found. Please run 'Check All Profiles' first.")
                return
            
            self.console.print(f"🔄 Updating {len(profiles)} profiles...")
            
            success_count = 0
            for i, profile in enumerate(profiles, 1):
                self.console.print(f"\n📝 Processing profile {i}/{len(profiles)}")
                if self._update_single_profile_proxy(profile, country, protocol, connection_type, custom_start_urls):
                    success_count += 1
            
            self.console.print(f"\n✅ Successfully updated {success_count}/{len(profiles)} profiles")
        else:
            # Update single profile
            profile = self.profile_api.get_profile_by_id(profile_input)
            if not profile:
                self.console.print(f"❌ Profile with ID '{profile_input}' not found in saved profiles.")
                return
            
            if self._update_single_profile_proxy(profile, country, protocol, connection_type, custom_start_urls):
                self.console.print("✅ Proxy updated successfully")
            else:
                self.console.print("❌ Failed to update proxy")
    
    def _update_single_profile_proxy(self, profile: Dict[str, Any], country: str, protocol: str, connection_type: str, custom_start_urls: list, profile_meta: Dict[str, Any] = None) -> bool:
        """Update proxy for a single profile with complete flow"""
        profile_id = profile.get("id", "")
        profile_name = profile.get("name", "Unknown")
        
        self.console.print(f"📝 Processing profile: {profile_name}")
        
        try:
            # Step 1: Get profile metadata (if not provided)
            if not profile_meta:
                self.console.print("  🔍 Step 1: Getting profile metadata...")
                # Get all profile IDs and fetch metadata for all profiles at once
                all_profile_ids = self.profile_api.get_profile_ids_list()
                self.console.print(f"  📋 Fetching metadata for {len(all_profile_ids)} profiles...")
                metas_response = self.profile_api.get_profile_metas(all_profile_ids)
                if not metas_response.success:
                    self.console.print(f"  ❌ Failed to get profile metadata: {metas_response.error}")
                    return False
                
                # Extract profiles from response structure: response.data.data.profiles
                if isinstance(metas_response.data, dict) and "data" in metas_response.data:
                    data_section = metas_response.data.get("data", {})
                    if isinstance(data_section, dict) and "profiles" in data_section:
                        metas_data = data_section.get("profiles", [])
                    else:
                        metas_data = []
                else:
                    metas_data = []
                
                
                if not metas_data:
                    self.console.print("  ❌ No metadata found in response")
                    return False
                
                # Find the specific profile metadata
                profile_meta = None
                for meta in metas_data:
                    if isinstance(meta, dict) and meta.get("id") == profile_id:
                        profile_meta = meta
                        break
                
                if not profile_meta:
                    self.console.print(f"  ❌ Profile metadata not found for ID: {profile_id}")
                    return False
            else:
                self.console.print("  ✅ Using provided profile metadata")
            
            # Step 2: Get profile setup data
            self.console.print("  🔍 Step 2: Getting profile setup data...")
            proxy_config_meta = profile_meta.get("parameters", {}).get("proxy", {})
            username = proxy_config_meta.get("username", "")
            
            if not username:
                self.console.print("  ❌ No username found in profile metadata")
                return False
            
            setup_response = self.proxy_api.get_profile_setup(username)
            if not setup_response.success:
                self.console.print(f"  ❌ Failed to get profile setup: {setup_response.error}")
                return False
            
            # Step 3: Get connection URL for new proxy
            self.console.print("  🔍 Step 3: Getting new proxy connection URL...")
            # Extract current proxy info from metadata for reference
            current_proxy = proxy_config_meta
            current_country = current_proxy.get("username", "").split("-country-")[-1].split("-")[0] if "-country-" in current_proxy.get("username", "") else country
            
            connection_response = self.proxy_api.get_connection_url(
                country=current_country if current_country else country,
                protocol=protocol,
                connection_type=connection_type
            )
            if not connection_response.success:
                self.console.print(f"  ❌ Failed to get connection URL: {connection_response.error}")
                return False
            
            # Step 4: Extract proxy config from connection URL
            connection_data = connection_response.data.get("data", {})
            connection_urls = connection_data.get("connection_urls", [])
            if not connection_urls:
                self.console.print("  ❌ No connection URLs received")
                return False
            
            # Parse connection URL: host:port:username:password
            connection_url = connection_urls[0]
            parts = connection_url.split(":")
            if len(parts) < 4:
                self.console.print("  ❌ Invalid connection URL format")
                return False
            
            proxy_config = {
                "type": protocol,
                "host": parts[0],
                "port": int(parts[1]),
                "username": parts[2],
                "password": parts[3]
            }
            
            # Step 5: Validate proxy with retry mechanism
            self.console.print("  🔍 Step 5: Validating new proxy...")
            max_retries = 3
            retry_count = 0
            proxy_validated = False
            
            while retry_count < max_retries and not proxy_validated:
                validate_response = self.proxy_api.validate_proxy(proxy_config)
                if validate_response.success:
                    proxy_validated = True
                    self.console.print("  ✅ Proxy validation successful")
                else:
                    retry_count += 1
                    self.console.print(f"  ⚠️ Proxy validation failed (attempt {retry_count}/{max_retries}): {validate_response.error}")
                    
                    if retry_count < max_retries:
                        self.console.print("  🔄 Retrying with new connection URL...")
                        # Retry with new connection URL
                        connection_response = self.proxy_api.get_connection_url(
                            country=current_country if current_country else country,
                            protocol=protocol,
                            connection_type=connection_type
                        )
                        if not connection_response.success:
                            self.console.print(f"  ❌ Failed to get new connection URL: {connection_response.error}")
                            return False
                        
                        # Parse new connection URL
                        connection_data = connection_response.data.get("data", {})
                        connection_urls = connection_data.get("connection_urls", [])
                        if not connection_urls:
                            self.console.print("  ❌ No connection URLs received in retry")
                            return False
                        
                        # Update proxy config with new connection URL
                        connection_url = connection_urls[0]
                        parts = connection_url.split(":")
                        if len(parts) < 4:
                            self.console.print("  ❌ Invalid connection URL format in retry")
                            return False
                        
                        proxy_config = {
                            "type": protocol,
                            "host": parts[0],
                            "port": int(parts[1]),
                            "username": parts[2],
                            "password": parts[3]
                        }
                        self.console.print("  🔄 Using new proxy configuration for retry")
            
            if not proxy_validated:
                self.console.print(f"  ❌ Proxy validation failed after {max_retries} attempts")
                return False
            
            # Step 6: Update profile with new proxy
            self.console.print("  🔍 Step 6: Updating profile with new proxy...")
            # Use data from profile metadata for more accurate update
            profile_name_meta = profile_meta.get("name", profile_name)
            profile_tags_meta = profile_meta.get("tags", profile.get("tags", []))
            custom_start_urls_meta = profile_meta.get("parameters", {}).get("custom_start_urls", custom_start_urls)
            
            update_response = self.proxy_api.update_profile_with_proxy(
                profile_id=profile_id,
                name=profile_name_meta,
                tags=profile_tags_meta,
                custom_start_urls=custom_start_urls_meta if custom_start_urls_meta else custom_start_urls,
                proxy_config=proxy_config,
                profile_data=profile_meta
            )
            
            if update_response.success:
                self.console.print(f"  ✅ Successfully updated profile: {profile_name}")
                return True
            else:
                self.console.print(f"  ❌ Failed to update profile: {update_response.error}")
                return False
                
        except Exception as e:
            self.console.print(f"  ❌ Error processing profile: {str(e)}")
            return False
    
    def _update_proxy_before_script_runner(self, profile_id: str) -> bool:
        """
        Update proxy for a profile before starting script runner
        Uses default US geo settings as per project memory
        
        Args:
            profile_id: Profile ID to update proxy for
            
        Returns:
            bool: True if proxy update successful, False otherwise
        """
        try:
            # Get profile information
            profile = self.profile_api.get_profile_by_id(profile_id)
            if not profile:
                self.console.print(f"    ❌ Profile with ID '{profile_id}' not found")
                return False
            
            # Use default proxy settings based on project memory (US geo)
            country = "us"  # Default to US as per project memory
            protocol = "socks5"  # Default protocol
            connection_type = "residential"  # Default connection type
            custom_start_urls = []  # No custom start URLs for script runner
            
            self.console.print(f"    🔧 Using default proxy settings: {country.upper()}, {protocol}, {connection_type}")
            
            # Update proxy using the existing _update_single_profile_proxy method
            return self._update_single_profile_proxy(
                profile=profile,
                country=country,
                protocol=protocol,
                connection_type=connection_type,
                custom_start_urls=custom_start_urls
            )
            
        except Exception as e:
            self.console.print(f"    ❌ Error updating proxy for profile {profile_id[:8]}: {str(e)}")
            return False
    
    def upload_object(self):
        """Upload object to storage"""
        self.console.print("\n📦 Upload Object")
        
        # Get object types first
        types_response = self.extension_api.get_object_types()
        if not types_response.success:
            self.console.print(f"❌ Failed to get object types: {types_response.error}")
            return
        
        # Display available object types
        types_data = types_response.data.get("data", {}).get("types", [])
        if types_data:
            self.console.print("Available object types:")
            for i, obj_type in enumerate(types_data):
                self.console.print(f"{i+1}. {obj_type.get('name', 'Unknown')} (ID: {obj_type.get('id', 'N/A')})")
        
        object_name = Prompt.ask("Enter object name")
        object_extension = Prompt.ask("Enter object extension (e.g., txt, json, zip)")
        object_type_id = Prompt.ask("Enter object type ID")
        object_body = Prompt.ask("Enter object body (JSON format)")
        object_meta = Prompt.ask("Enter object metadata (JSON format)", default="{}")
        
        response = self.extension_api.upload_object(
            object_name=object_name,
            object_extension=object_extension,
            object_type_id=object_type_id,
            object_body=object_body,
            object_meta=object_meta
        )
        
        if response.success:
            self.console.print("✅ Object uploaded successfully")
            if response.data and "data" in response.data:
                meta_id = response.data["data"].get("meta_id")
                if meta_id:
                    self.console.print(f"📋 Object ID: {meta_id}")
        else:
            self.console.print(f"❌ Error: {response.error}")
    
    def create_extension(self):
        """Create extension from URL"""
        self.console.print("\n🔧 Create Extension")
        
        url = Prompt.ask("Enter extension URL")
        browser_type = Prompt.ask("Enter browser type", choices=["mimic", "stealthfox"], default="mimic")
        storage_type = Prompt.ask("Enter storage type", choices=["local", "cloud"], default="cloud")
        
        response = self.extension_api.create_extension_from_url(
            url=url,
            browser_type=browser_type,
            storage_type=storage_type
        )
        
        if response.success:
            self.console.print("✅ Extension created successfully")
            
            # Display extension data after successful creation
            self.console.print("\n📋 Fetching extension data...")
            self._display_extensions()
        else:
            self.console.print(f"❌ Error: {response.error}")
    
    def _display_extensions(self):
        """Display extensions in a table format"""
        # Extension object type ID
        extension_type_id = "6811b909-2e4b-45db-ab62-f14f515523cf"
        
        # Get resources metadata for extensions
        response = self.extension_api.get_resources_metas(
            limit=100,
            offset=0,
            object_type_id=extension_type_id
        )
        
        if not response.success:
            self.console.print(f"❌ Failed to fetch extension data: {response.error}")
            return
        
        # Parse response data
        data = response.data.get("data", {})
        objects = data.get("objects", [])
        
        if not objects:
            self.console.print("📭 No extensions found")
            return
        
        # Create table
        table = Table(title="📦 Available Extensions", show_header=True, header_style="bold magenta")
        table.add_column("ID", style="cyan", width=50)
        table.add_column("Name", style="green", width=30)
        table.add_column("Version", style="yellow", width=10)
        table.add_column("Browser Type", style="blue", width=12)
        table.add_column("Storage", style="magenta", width=8)
        table.add_column("Size", style="red", width=10)
        
        for obj in objects:
            # Parse meta_info JSON
            meta_info_str = obj.get("meta_info", "{}")
            try:
                import json
                meta_info = json.loads(meta_info_str)
                extension_info = meta_info.get("extension", {})
                name = extension_info.get("name", "Unknown")
                version = extension_info.get("version", "N/A")
                browser_type = extension_info.get("browser_type", "N/A")
            except (json.JSONDecodeError, KeyError):
                name = obj.get("object_name", "Unknown")
                version = "N/A"
                browser_type = "N/A"
            
            # Format file size
            size_bytes = obj.get("object_size", 0)
            if size_bytes > 1024 * 1024:
                size_str = f"{size_bytes / (1024 * 1024):.1f} MB"
            elif size_bytes > 1024:
                size_str = f"{size_bytes / 1024:.1f} KB"
            else:
                size_str = f"{size_bytes} B"
            
            table.add_row(
                obj.get("id", "N/A"),
                name,
                version,
                browser_type,
                obj.get("storage_type", "N/A"),
                size_str
            )
        
        self.console.print(table)
        self.console.print(f"\n📊 Total extensions: {len(objects)}")
    
    def available_extensions(self):
        """Display available extensions"""
        self.console.print("\n📦 Available Extensions")
        self._display_extensions()
    
    def activate_extension(self):
        """Activate extension for profiles"""
        self.console.print("\n🔌 Activate Extension")
        
        # Get extension ID
        extension_id = Prompt.ask("Enter extension ID")
        
        # Get profile selection
        profile_input = Prompt.ask("Enter profile ID or 'all' to activate for all profiles")
        
        if profile_input.lower() == "all":
            # Get all profile IDs
            profile_ids = self.profile_api.get_profile_ids_list()
            if not profile_ids:
                self.console.print("❌ No profiles found. Please run 'Check All Profiles' first.")
                return
        else:
            # Validate single profile
            profile = self.profile_api.get_profile_by_id(profile_input)
            if not profile:
                self.console.print(f"❌ Profile with ID '{profile_input}' not found in saved profiles.")
                return
            profile_ids = [profile_input]
        
        self.console.print(f"🔌 Activating extension for {len(profile_ids)} profile(s)...")
        
        response = self.extension_api.enable_extension_for_profiles(
            object_id=extension_id,
            profile_ids=profile_ids
        )
        
        if response.success:
            self.console.print(f"✅ Extension activated successfully for {len(profile_ids)} profile(s)")
        else:
            self.console.print(f"❌ Error: {response.error}")
    
    def import_cookies(self):
        """Import cookies for a profile"""
        self.console.print("\n🍪 Import Cookies")
        
        # Get profile selection
        profile_input = Prompt.ask("Enter profile ID or 'all' to import for all profiles")
        
        if profile_input.lower() == "all":
            # Get all profile IDs
            profile_ids = self.profile_api.get_profile_ids_list()
            if not profile_ids:
                self.console.print("❌ No profiles found. Please run 'Check All Profiles' first.")
                return
        else:
            # Validate single profile
            profile = self.profile_api.get_profile_by_id(profile_input)
            if not profile:
                self.console.print(f"❌ Profile with ID '{profile_input}' not found in saved profiles.")
                return
            profile_ids = [profile_input]
        
        # Get file path
        file_path = Prompt.ask("Enter cookies file path (.json or .txt)")
        
        # Validate file extension
        if not file_path.lower().endswith(('.json', '.txt')):
            self.console.print("❌ Error: Only .json and .txt files are supported")
            return
        
        # Check if file exists
        import os
        if not os.path.exists(file_path):
            self.console.print(f"❌ Error: File '{file_path}' not found")
            return
        
        # Read file content
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                file_content = f.read()
        except Exception as e:
            self.console.print(f"❌ Error reading file: {str(e)}")
            return
        
        # Process cookies for each profile
        success_count = 0
        for profile_id in profile_ids:
            # Get profile info to get folder_id
            profile = self.profile_api.get_profile_by_id(profile_id)
            if not profile:
                self.console.print(f"❌ Profile {profile_id} not found, skipping...")
                continue
            
            folder_id = profile.get("folder_id", "")
            if not folder_id:
                self.console.print(f"❌ No folder_id found for profile {profile_id}, skipping...")
                continue
            
            self.console.print(f"📝 Importing cookies for profile: {profile.get('name', 'Unknown')}")
            
            # Import cookies
            response = self.cookies_api.import_cookies(
                profile_id=profile_id,
                folder_id=folder_id,
                cookies_data=file_content
            )
            
            if response.success:
                self.console.print(f"✅ Cookies imported successfully for profile: {profile.get('name', 'Unknown')}")
                success_count += 1
            else:
                self.console.print(f"❌ Error importing cookies for profile {profile.get('name', 'Unknown')}: {response.error}")
        
        self.console.print(f"\n📊 Successfully imported cookies for {success_count}/{len(profile_ids)} profiles")
    
    def start_single_bot(self):
        """Start bot for a single profile"""
        self.console.print("\n🤖 Start Single Bot")
        
        profile_id = Prompt.ask("Enter profile ID")
        
        # Get automation type
        automation_type = Prompt.ask(
            "Enter automation type", 
            choices=["none", "mimic", "stealthfox"], 
            default="none"
        )
        
        # Get headless mode
        headless_mode = Confirm.ask("Enable headless mode?", default=False)
        
        # Get profile info
        response = self.profile_api.get_profile(profile_id)
        
        if response.success and response.data:
            profile_data = response.data.get("profile", {})
            profile = ProfileInfo(**profile_data)
            
            result = self.bot_manager.start_profile_bot(profile, automation_type, headless_mode)
            
            if result["success"]:
                self.console.print(f"✅ {result['message']}")
                if result.get("port"):
                    self.console.print(f"🌐 Profile running on port: {result['port']}")
            else:
                self.console.print(f"❌ {result['message']}")
        else:
            self.console.print(f"❌ Profile not found: {response.error}")
    
    def start_multiple_bots(self):
        """Start bots for multiple profiles"""
        self.console.print("\n🤖 Start Multiple Bots")
        
        max_concurrent = int(Prompt.ask("Enter max concurrent profiles", default="5"))
        
        # Get automation type
        automation_type = Prompt.ask(
            "Enter automation type", 
            choices=["none", "selenium", "puppeteer", "playwright"], 
            default="none"
        )
        
        # Get headless mode
        headless_mode = Confirm.ask("Enable headless mode?", default=False)
        
        # Get folder selection
        self.console.print("\n📁 Folder Selection:")
        folders = self.bot_manager.get_available_folders()
        
        if folders:
            self.console.print("Available folders:")
            folder_choices = ["all"]  # Default option
            for i, folder in enumerate(folders, 1):
                folder_name = folder.get("name", "Unknown")
                folder_id = folder.get("folder_id", "")
                profiles_count = folder.get("profiles_count", 0)
                self.console.print(f"  {i}. {folder_name} (ID: {folder_id[:8]}..., Profiles: {profiles_count})")
                folder_choices.append(folder_id)
            
            folder_choice = Prompt.ask(
                "Select folder (enter number or 'all' for all folders)", 
                choices=[str(i) for i in range(1, len(folders) + 1)] + ["all"],
                default="all"
            )
            
            if folder_choice == "all":
                selected_folder_id = None
                self.console.print("📁 Selected: All folders")
            else:
                selected_folder_id = folder_choices[int(folder_choice)]
                selected_folder_name = folders[int(folder_choice) - 1].get("name", "Unknown")
                self.console.print(f"📁 Selected: {selected_folder_name}")
        else:
            self.console.print("⚠️  No folders found, using all profiles")
            selected_folder_id = None
        
        # Get profiles based on folder selection
        profiles = self.bot_manager.get_all_profiles(selected_folder_id)
        
        if not profiles:
            self.console.print("❌ No profiles available in selected folder")
            return
        
        self.console.print(f"📋 Found {len(profiles)} profiles")
        
        if Confirm.ask("Start all profiles?"):
            self.console.print("🚀 Starting multiple bots...")
            
            results = self.bot_manager.run_concurrent_bots(profiles, max_concurrent, automation_type, headless_mode)
            
            # Display results summary
            successful = sum(1 for r in results if r["success"])
            failed = len(results) - successful
            
            self.console.print(f"\n📊 Results Summary:")
            self.console.print(f"✅ Successful: {successful}")
            self.console.print(f"❌ Failed: {failed}")
    
    def start_script_runner_multiple_profiles(self):
        """Start Script Runner for multiple profiles"""
        self.console.print("\n🚀 Start Bot Script-Runner (Multiple Profiles)")
        
        # Get script file name with options
        script_options = [
            "advanced_website_robot.py",
            "multilogin_profile_warmer.py",
            "custom"
        ]
        
        self.console.print("\n📄 Available Scripts:")
        for i, script in enumerate(script_options[:-1], 1):
            self.console.print(f"  {i}. {script}")
        self.console.print(f"  {len(script_options)}. Custom script name")
        
        script_choice = Prompt.ask(
            "Select script (enter number)", 
            choices=[str(i) for i in range(1, len(script_options) + 1)],
            default="1"
        )
        
        if script_choice == str(len(script_options)):
            script_file = Prompt.ask("Enter custom script file name")
        else:
            script_file = script_options[int(script_choice) - 1]
        
        # Get max concurrent profiles
        max_concurrent = int(Prompt.ask("Enter max concurrent profiles", default="5"))
        
        # Note: Script Runner uses selenium by default, no automation type selection needed
        
        # Get headless mode
        is_headless = Confirm.ask("Enable headless mode?", default=False)
        
        # Get folder selection
        self.console.print("\n📁 Folder Selection:")
        folders = self.bot_manager.get_available_folders()
        
        if folders:
            self.console.print("Available folders:")
            folder_choices = ["all"]  # Default option
            for i, folder in enumerate(folders, 1):
                folder_name = folder.get("name", "Unknown")
                folder_id = folder.get("folder_id", "")
                profiles_count = folder.get("profiles_count", 0)
                self.console.print(f"  {i}. {folder_name} (ID: {folder_id[:8]}..., Profiles: {profiles_count})")
                folder_choices.append(folder_id)
            
            folder_choice = Prompt.ask(
                "Select folder (enter number or 'all' for all folders)", 
                choices=[str(i) for i in range(1, len(folders) + 1)] + ["all"],
                default="all"
            )
            
            if folder_choice == "all":
                selected_folder_id = None
                self.console.print("📁 Selected: All folders")
            else:
                selected_folder_id = folder_choices[int(folder_choice)]
                selected_folder_name = folders[int(folder_choice) - 1].get("name", "Unknown")
                self.console.print(f"📁 Selected: {selected_folder_name}")
        else:
            self.console.print("⚠️  No folders found, using all profiles")
            selected_folder_id = None
        
        # Get profiles based on folder selection
        profiles = self.bot_manager.get_all_profiles(selected_folder_id)
        
        if not profiles:
            self.console.print("❌ No profiles available in selected folder")
            return
        
        self.console.print(f"📋 Found {len(profiles)} profiles")
        
        if Confirm.ask("Start Script Runner for all profiles?"):
            self.console.print("🚀 Starting Script Runner for multiple profiles...")
            self.console.print(f"📊 Processing mode: Concurrent with 3-5 minute delays between starts")
            self.console.print(f"🔧 Automation type: selenium (default)")
            self.console.print(f"👁️  Headless mode: {'Enabled' if is_headless else 'Disabled'}")
            self.console.print(f"📄 Script file: {script_file}")
            self.console.print(f"⏰ Estimated total time: {len(profiles) * 4} minutes")
            self.console.print(f"\n💡 Monitoring Tips:")
            self.console.print(f"  - Profiles start with 3-5 minute delays but run concurrently")
            self.console.print(f"  - Authentication is checked before each profile starts")
            self.console.print(f"  - Check Multilogin X interface for actual browser behavior")
            self.console.print(f"  - Monitor system resources (CPU, Memory)")
            self.console.print(f"  - API success ≠ Script execution success")
            self.console.print(f"  - Use 'minimal_test_script.py' for debugging")
            
            # Extract profile IDs
            profile_ids = [profile.id for profile in profiles if profile.id]
            
            if not profile_ids:
                self.console.print("❌ No valid profile IDs found")
                return
            
            # Process profiles concurrently with 3-5 minute delays between starts
            self.console.print(f"🔄 Processing {len(profile_ids)} profiles concurrently with 3-5 minute delays between starts")
            self.console.print(f"📊 Max concurrent profiles: {max_concurrent}")
            self.console.print(f"⏰ Estimated total time: {len(profile_ids) * 4} minutes (4 minutes average per profile)")
            
            all_results = []
            
            # Use ThreadPoolExecutor with progressive submission and delays
            with ThreadPoolExecutor(max_workers=max_concurrent) as executor:
                # Progressive submission with 3-5 minute delays
                profiles_queue = profile_ids.copy()
                random.shuffle(profiles_queue)  # Randomize order
                futures = {}
                started_count = 0
                completed_count = 0
                
                while profiles_queue or futures:
                    # Start new profiles if we have capacity and profiles in queue
                    while (len(futures) < max_concurrent and 
                           started_count < len(profile_ids) and 
                           profiles_queue):
                        
                        profile_id = profiles_queue.pop(0)
                        future = executor.submit(
                            self._start_single_script_runner,
                            script_file=script_file,
                            profile_id=profile_id,
                            is_headless=is_headless
                        )
                        futures[future] = profile_id
                        started_count += 1
                        
                        # 3-5 minute delay between starts (except for the last profile)
                        if profiles_queue:  # Don't delay if this is the last profile
                            delay_minutes = random.uniform(1, 2)
                            delay_seconds = int(delay_minutes * 60)
                            
                            self.console.print(f"  🚀 [{started_count}/{len(profile_ids)}] Starting profile {profile_id[:8]}... (waiting {delay_minutes:.1f} minutes)")
                            self.console.print(f"  📊 Progress: {started_count}/{len(profile_ids)} profiles started")
                            
                            # Show countdown every 30 seconds
                            remaining_seconds = delay_seconds
                            while remaining_seconds > 0:
                                if remaining_seconds % 30 == 0 or remaining_seconds <= 10:
                                    minutes_left = remaining_seconds // 60
                                    seconds_left = remaining_seconds % 60
                                    if minutes_left > 0:
                                        self.console.print(f"  ⏰ {minutes_left}m {seconds_left}s remaining...")
                                    else:
                                        self.console.print(f"  ⏰ {seconds_left}s remaining...")
                                
                                time.sleep(1)
                                remaining_seconds -= 1
                            
                            self.console.print(f"  ✅ Wait completed, starting next profile...")
                        else:
                            self.console.print(f"  🚀 [{started_count}/{len(profile_ids)}] Starting profile {profile_id[:8]}... (last profile)")
                    
                    # Check for completed tasks
                    completed_futures = []
                    for future in futures:
                        if future.done():
                            completed_futures.append(future)
                    
                    # Process completed tasks
                    for future in completed_futures:
                        profile_id = futures[future]
                        completed_count += 1
                        
                        try:
                            result = future.result()
                            all_results.append(result)
                            
                            if result.get("status") == "success":
                                self.console.print(f"  ✅ [{completed_count}/{len(profile_ids)}] Profile {profile_id[:8]}... completed successfully")
                            else:
                                error_msg = result.get("message", "Unknown error")
                                self.console.print(f"  ❌ [{completed_count}/{len(profile_ids)}] Profile {profile_id[:8]}... failed: {error_msg}")
                                
                                # Log detailed error for debugging
                                self.console.print(f"    🔍 Debug info: {result}")
                                
                        except Exception as e:
                            error_result = {
                                "profile_id": profile_id,
                                "status": "error",
                                "message": f"Exception: {str(e)}"
                            }
                            all_results.append(error_result)
                            self.console.print(f"  ❌ [{completed_count}/{len(profile_ids)}] Profile {profile_id[:8]}... exception: {str(e)}")
                            
                            # Log detailed exception for debugging
                            import traceback
                            self.console.print(f"    🔍 Exception details: {traceback.format_exc()}")
                        
                        # Remove completed future
                        del futures[future]
                    
                    # Small delay to prevent busy waiting
                    if profiles_queue or futures:
                        time.sleep(0.1)
            
            # Display final results summary
            if all_results:
                successful = sum(1 for r in all_results if r.get("status") == "success")
                failed = len(all_results) - successful
                
                self.console.print(f"\n📊 Final Script Runner Results:")
                self.console.print(f"✅ Total Successful: {successful}")
                self.console.print(f"❌ Total Failed: {failed}")
                self.console.print(f"📊 Total Profiles: {len(all_results)}")
                
                # Show details for failed profiles
                if failed > 0:
                    self.console.print("\n❌ Failed profiles:")
                    error_summary = {}
                    for result in all_results:
                        if result.get("status") != "success":
                            profile_id = result.get("profile_id", "Unknown")
                            error_message = result.get("message", "Unknown error")
                            self.console.print(f"  - {profile_id[:8]}...: {error_message}")
                            
                            # Count error types for summary
                            if "proxy connection" in error_message.lower():
                                error_type = "Proxy Connection Issues"
                            elif "authentication failed" in error_message.lower():
                                error_type = "Authentication Issues"
                            elif ":" in error_message:
                                error_type = error_message.split(":")[0]
                            else:
                                error_type = error_message
                            error_summary[error_type] = error_summary.get(error_type, 0) + 1
                    
                    # Show error summary
                    if error_summary:
                        self.console.print(f"\n📊 Error Summary:")
                        for error_type, count in error_summary.items():
                            self.console.print(f"  - {error_type}: {count} profiles")
                
                # Show details for successful profiles
                if successful > 0:
                    self.console.print("\n✅ Successful profiles:")
                    for result in all_results:
                        if result.get("status") == "success":
                            profile_id = result.get("profile_id", "Unknown")
                            message = result.get("message", "Started successfully")
                            self.console.print(f"  - {profile_id[:8]}...: {message}")
                
                # Overall status message
                if successful == len(all_results):
                    self.console.print(f"\n🎉 All {len(all_results)} profiles started successfully!")
                elif successful > 0:
                    self.console.print(f"\n⚠️  Partial success: {successful}/{len(all_results)} profiles started")
                else:
                    self.console.print(f"\n❌ All {len(all_results)} profiles failed to start")
            else:
                self.console.print(f"\n❌ No results received from Script Runner")
    
    def start_profile_warm_multiple_profiles(self):
        """Start Profile Warm for multiple profiles with faster processing"""
        self.console.print("\n🔥 Profile Warm (Multiple Profiles)")
        
        # Use profile warmer script by default
        script_file = "multilogin_profile_warmer.py"
        self.console.print(f"📄 Using script: {script_file}")
        
        # Get max concurrent profiles (higher default for faster processing)
        max_concurrent = int(Prompt.ask("Enter max concurrent profiles", default="10"))
        
        # Get headless mode
        is_headless = Confirm.ask("Enable headless mode?", default=True)
        
        # Get folder selection
        self.console.print("\n📁 Folder Selection:")
        folders = self.bot_manager.get_available_folders()
        
        if folders:
            self.console.print("Available folders:")
            folder_choices = ["all"]  # Default option
            for i, folder in enumerate(folders, 1):
                folder_name = folder.get("name", "Unknown")
                folder_id = folder.get("folder_id", "")
                profiles_count = folder.get("profiles_count", 0)
                self.console.print(f"  {i}. {folder_name} (ID: {folder_id[:8]}..., Profiles: {profiles_count})")
                folder_choices.append(folder_id)
            
            folder_choice = Prompt.ask(
                "Select folder (enter number or 'all' for all folders)", 
                choices=[str(i) for i in range(1, len(folders) + 1)] + ["all"],
                default="all"
            )
            
            if folder_choice == "all":
                selected_folder_id = None
                self.console.print("📁 Selected: All folders")
            else:
                selected_folder_id = folder_choices[int(folder_choice)]
                selected_folder_name = folders[int(folder_choice) - 1].get("name", "Unknown")
                self.console.print(f"📁 Selected: {selected_folder_name}")
        else:
            self.console.print("⚠️  No folders found, using all profiles")
            selected_folder_id = None
        
        # Get profiles based on folder selection
        profiles = self.bot_manager.get_all_profiles(selected_folder_id)
        
        if not profiles:
            self.console.print("❌ No profiles available in selected folder")
            return
        
        self.console.print(f"📋 Found {len(profiles)} profiles")
        
        if Confirm.ask("Start Profile Warm for all profiles?"):
            self.console.print("🔥 Starting Profile Warm for multiple profiles...")
            self.console.print(f"📊 Processing mode: Fast concurrent with 30-60 second delays between starts")
            self.console.print(f"🔧 Automation type: selenium (default)")
            self.console.print(f"👁️  Headless mode: {'Enabled' if is_headless else 'Disabled'}")
            self.console.print(f"📄 Script file: {script_file}")
            self.console.print(f"⏰ Estimated total time: {len(profiles) * 1} minutes (1 minute average per profile)")
            self.console.print(f"\n💡 Profile Warm Features:")
            self.console.print(f"  - Faster processing with shorter delays (30-60 seconds)")
            self.console.print(f"  - Higher concurrent limit for faster execution")
            self.console.print(f"  - Optimized for profile warming and testing")
            self.console.print(f"  - Proxy update included for each profile")
            self.console.print(f"  - Authentication checked before each profile starts")
            
            # Extract profile IDs
            profile_ids = [profile.id for profile in profiles if profile.id]
            
            if not profile_ids:
                self.console.print("❌ No valid profile IDs found")
                return
            
            # Process profiles concurrently with faster 30-60 second delays between starts
            self.console.print(f"🔄 Processing {len(profile_ids)} profiles concurrently with 30-60 second delays between starts")
            self.console.print(f"📊 Max concurrent profiles: {max_concurrent}")
            self.console.print(f"⏰ Estimated total time: {len(profile_ids) * 1} minutes (1 minute average per profile)")
            
            all_results = []
            
            # Use ThreadPoolExecutor with progressive submission and faster delays
            with ThreadPoolExecutor(max_workers=max_concurrent) as executor:
                # Progressive submission with 30-60 second delays
                profiles_queue = profile_ids.copy()
                random.shuffle(profiles_queue)  # Randomize order
                futures = {}
                started_count = 0
                completed_count = 0
                
                while profiles_queue or futures:
                    # Start new profiles if we have capacity and profiles in queue
                    while (len(futures) < max_concurrent and 
                           started_count < len(profile_ids) and 
                           profiles_queue):
                        
                        profile_id = profiles_queue.pop(0)
                        future = executor.submit(
                            self._start_single_script_runner,
                            script_file=script_file,
                            profile_id=profile_id,
                            is_headless=is_headless
                        )
                        futures[future] = profile_id
                        started_count += 1
                        
                        # 30-60 second delay between starts (faster than script runner)
                        if profiles_queue:  # Don't delay if this is the last profile
                            delay_seconds = random.randint(30, 60)  # 30-60 seconds
                            
                            self.console.print(f"  🔥 [{started_count}/{len(profile_ids)}] Starting profile {profile_id[:8]}... (waiting {delay_seconds} seconds)")
                            self.console.print(f"  📊 Progress: {started_count}/{len(profile_ids)} profiles started")
                            
                            # Show countdown every 10 seconds
                            remaining_seconds = delay_seconds
                            while remaining_seconds > 0:
                                if remaining_seconds % 10 == 0 or remaining_seconds <= 5:
                                    if remaining_seconds > 60:
                                        minutes_left = remaining_seconds // 60
                                        seconds_left = remaining_seconds % 60
                                        self.console.print(f"  ⏰ {minutes_left}m {seconds_left}s remaining...")
                                    else:
                                        self.console.print(f"  ⏰ {remaining_seconds}s remaining...")
                                
                                time.sleep(1)
                                remaining_seconds -= 1
                            
                            self.console.print(f"  ✅ Wait completed, starting next profile...")
                        else:
                            self.console.print(f"  🔥 [{started_count}/{len(profile_ids)}] Starting profile {profile_id[:8]}... (last profile)")
                    
                    # Check for completed tasks
                    completed_futures = []
                    for future in futures:
                        if future.done():
                            completed_futures.append(future)
                    
                    # Process completed tasks
                    for future in completed_futures:
                        profile_id = futures[future]
                        completed_count += 1
                        
                        try:
                            result = future.result()
                            all_results.append(result)
                            
                            if result.get("status") == "success":
                                self.console.print(f"  ✅ [{completed_count}/{len(profile_ids)}] Profile {profile_id[:8]}... warmed successfully")
                            else:
                                error_msg = result.get("message", "Unknown error")
                                self.console.print(f"  ❌ [{completed_count}/{len(profile_ids)}] Profile {profile_id[:8]}... failed: {error_msg}")
                                
                                # Log detailed error for debugging
                                self.console.print(f"    🔍 Debug info: {result}")
                                
                        except Exception as e:
                            error_result = {
                                "profile_id": profile_id,
                                "status": "error",
                                "message": f"Exception: {str(e)}"
                            }
                            all_results.append(error_result)
                            self.console.print(f"  ❌ [{completed_count}/{len(profile_ids)}] Profile {profile_id[:8]}... exception: {str(e)}")
                            
                            # Log detailed exception for debugging
                            import traceback
                            self.console.print(f"    🔍 Exception details: {traceback.format_exc()}")
                        
                        # Remove completed future
                        del futures[future]
                    
                    # Small delay to prevent busy waiting
                    if profiles_queue or futures:
                        time.sleep(0.1)
            
            # Display final results summary
            if all_results:
                successful = sum(1 for r in all_results if r.get("status") == "success")
                failed = len(all_results) - successful
                
                self.console.print(f"\n📊 Final Profile Warm Results:")
                self.console.print(f"✅ Total Successful: {successful}")
                self.console.print(f"❌ Total Failed: {failed}")
                self.console.print(f"📊 Total Profiles: {len(all_results)}")
                
                # Show details for failed profiles
                if failed > 0:
                    self.console.print("\n❌ Failed profiles:")
                    error_summary = {}
                    for result in all_results:
                        if result.get("status") != "success":
                            profile_id = result.get("profile_id", "Unknown")
                            error_message = result.get("message", "Unknown error")
                            self.console.print(f"  - {profile_id[:8]}...: {error_message}")
                            
                            # Count error types for summary
                            if "proxy connection" in error_message.lower():
                                error_type = "Proxy Connection Issues"
                            elif "authentication failed" in error_message.lower():
                                error_type = "Authentication Issues"
                            elif "proxy update" in error_message.lower():
                                error_type = "Proxy Update Issues"
                            elif ":" in error_message:
                                error_type = error_message.split(":")[0]
                            else:
                                error_type = error_message
                            error_summary[error_type] = error_summary.get(error_type, 0) + 1
                    
                    # Show error summary
                    if error_summary:
                        self.console.print(f"\n📊 Error Summary:")
                        for error_type, count in error_summary.items():
                            self.console.print(f"  - {error_type}: {count} profiles")
                
                # Show details for successful profiles
                if successful > 0:
                    self.console.print("\n✅ Successfully warmed profiles:")
                    for result in all_results:
                        if result.get("status") == "success":
                            profile_id = result.get("profile_id", "Unknown")
                            message = result.get("message", "Warmed successfully")
                            self.console.print(f"  - {profile_id[:8]}...: {message}")
                
                # Overall status message
                if successful == len(all_results):
                    self.console.print(f"\n🎉 All {len(all_results)} profiles warmed successfully!")
                elif successful > 0:
                    self.console.print(f"\n⚠️  Partial success: {successful}/{len(all_results)} profiles warmed")
                else:
                    self.console.print(f"\n❌ All {len(all_results)} profiles failed to warm")
            else:
                self.console.print(f"\n❌ No results received from Profile Warm")
    
    def _start_single_script_runner(self, script_file: str, profile_id: str, is_headless: bool = False) -> Dict[str, Any]:
        """
        Start Script Runner for a single profile with authentication check and proxy update
        
        Args:
            script_file: Name of the script file
            profile_id: Profile ID to run script on
            is_headless: Whether to run in headless mode
            
        Returns:
            Dict with result information
        """
        try:
            # Check authentication before starting script runner
            self.console.print(f"  🔐 Checking authentication for profile {profile_id[:8]}...")
            
            # Ensure we have valid authentication with retry mechanism
            max_auth_retries = 3
            auth_success = False
            
            for retry in range(max_auth_retries):
                if self.script_runner_api.auth_manager.ensure_valid_token():
                    auth_success = True
                    break
                else:
                    self.console.print(f"    ⚠️ Authentication retry {retry + 1}/{max_auth_retries} for profile {profile_id[:8]}")
                    if retry < max_auth_retries - 1:
                        time.sleep(2)  # Wait 2 seconds before retry
            
            if not auth_success:
                return {
                    "profile_id": profile_id,
                    "status": "error",
                    "message": "Authentication failed - token is invalid or expired after retries"
                }
            
            self.console.print(f"  ✅ Authentication valid for profile {profile_id[:8]}")
            
            # Check token expiration time for monitoring
            remaining_time = self.script_runner_api.auth_manager.get_token_remaining_time()
            if remaining_time:
                remaining_minutes = int(remaining_time.total_seconds() / 60)
                if remaining_minutes < 5:
                    self.console.print(f"    ⚠️ Token expires in {remaining_minutes} minutes")
            
            # Update proxy before starting script runner
            self.console.print(f"  🌐 Updating proxy for profile {profile_id[:8]}...")
            proxy_update_success = self._update_proxy_before_script_runner(profile_id)
            
            if not proxy_update_success:
                return {
                    "profile_id": profile_id,
                    "status": "error",
                    "message": "Failed to update proxy before starting script runner",
                    "error_type": "proxy_update_error"
                }
            
            self.console.print(f"  ✅ Proxy updated successfully for profile {profile_id[:8]}")
            
            # Start Script Runner for single profile
            response = self.script_runner_api.start_script_runner(
                script_file=script_file,
                profile_ids=[profile_id],
                is_headless=is_headless
            )
            
            # Process response
            if response.data and "data" in response.data:
                results = response.data.get("data", [])
                if results:
                    result = results[0]  # Get first (and only) result
                    
                    # Check for proxy-related errors
                    if result.get("status") != "success":
                        error_msg = result.get("message", "")
                        if "proxy connection" in error_msg.lower():
                            return {
                                "profile_id": profile_id,
                                "status": "error",
                                "message": f"Proxy connection failed: {error_msg}",
                                "error_type": "proxy_error"
                            }
                    
                    return result
                else:
                    return {
                        "profile_id": profile_id,
                        "status": "error",
                        "message": "No results in response"
                    }
            else:
                return {
                    "profile_id": profile_id,
                    "status": "error",
                    "message": response.error or "Unknown error"
                }
                
        except Exception as e:
            return {
                "profile_id": profile_id,
                "status": "error",
                "message": f"Exception: {str(e)}"
            }
    
    def stop_single_profile(self):
        """Stop a single profile"""
        self.console.print("\n🛑 Stop Single Profile")
        
        profile_id = Prompt.ask("Enter profile ID to stop")
        
        result = self.bot_manager.stop_profile_bot(profile_id)
        
        if result["success"]:
            self.console.print(f"✅ {result['message']}")
        else:
            self.console.print(f"❌ {result['message']}")
    
    def stop_all_profiles(self):
        """Stop all running profiles"""
        self.console.print("\n🛑 Stop All Profiles")
        
        # Get profile type
        profile_type = Prompt.ask(
            "Enter profile type to stop", 
            choices=["all", "regular", "quick"], 
            default="all"
        )
        
        if Confirm.ask(f"Are you sure you want to stop all {profile_type} profiles?"):
            results = self.bot_manager.stop_all_bots(profile_type)
            
            successful = sum(1 for r in results if r["success"])
            if successful > 0:
                self.console.print(f"✅ {results[0]['message']}")
            else:
                self.console.print(f"❌ {results[0]['message']}")
    
    def view_running_status(self):
        """View status of running profiles"""
        self.console.print("\n📊 Running Profiles Status")
        
        status_info = self.bot_manager.get_running_profiles_status()
        
        if status_info:
            # Display active counter if available
            active_counter = status_info.get("_active_counter", {})
            if active_counter:
                self.console.print(f"\n📈 Active Profiles Summary:")
                self.console.print(f"   Cloud: {active_counter.get('cloud', 0)}")
                self.console.print(f"   Local: {active_counter.get('local', 0)}")
                self.console.print(f"   Quick: {active_counter.get('quick', 0)}")
            
            # Filter out the active counter from the main data
            profile_data = {k: v for k, v in status_info.items() if k != "_active_counter"}
            
            if profile_data:
                table = Table(title="Profile Status Details")
                table.add_column("Profile ID", style="cyan", width=12)
                table.add_column("Name", style="green", width=20)
                table.add_column("Status", style="yellow", width=15)
                table.add_column("Browser", style="blue", width=10)
                table.add_column("Runtime", style="magenta", width=8)
                table.add_column("Remaining", style="red", width=8)
                table.add_column("Port", style="blue", width=6)
                table.add_column("Quick", style="cyan", width=6)
                
                for profile_id, info in profile_data.items():
                    runtime_min = int(info["runtime_seconds"] / 60) if info["runtime_seconds"] > 0 else 0
                    remaining_min = int(info["remaining_seconds"] / 60) if info["remaining_seconds"] > 0 else 0
                    
                    table.add_row(
                        profile_id[:8] + "...",
                        info["profile_name"][:20] + "..." if len(info["profile_name"]) > 20 else info["profile_name"],
                        info["status"],
                        info.get("browser_type", "N/A"),
                        f"{runtime_min}m",
                        f"{remaining_min}m",
                        str(info.get("port", "N/A")),
                        "Yes" if info.get("is_quick", False) else "No"
                    )
                
                self.console.print(table)
            else:
                self.console.print("ℹ️ No profile details available")
        else:
            self.console.print("ℹ️ No profiles currently running")
    
    def convert_storage(self):
        """Convert profile storage between local and cloud"""
        self.console.print("\n🔄 Convert Profile Storage")
        
        # Get profile selection
        profile_input = Prompt.ask("Enter profile ID or 'all' to convert all profiles")
        
        if profile_input.lower() == "all":
            # Get all profile IDs
            profile_ids = self.profile_api.get_profile_ids_list()
            if not profile_ids:
                self.console.print("❌ No profiles found. Please run 'Check All Profiles' first.")
                return
        else:
            # Validate single profile
            profile = self.profile_api.get_profile_by_id(profile_input)
            if not profile:
                self.console.print(f"❌ Profile with ID '{profile_input}' not found in saved profiles.")
                return
            profile_ids = [profile_input]
        
        # Get conversion direction
        conversion_type = Prompt.ask(
            "Select conversion type",
            choices=["local_to_cloud", "cloud_to_local"],
            default="local_to_cloud"
        )
        
        convert_to_local = conversion_type == "cloud_to_local"
        
        # Get workspace ID (using default from profiles data)
        workspace_id = Prompt.ask("Enter workspace ID", default="d3602d53-2e54-4cce-87d7-64e89e0f8679")
        
        # Confirm conversion
        direction_text = "local to cloud" if not convert_to_local else "cloud to local"
        if not Confirm.ask(f"Convert {len(profile_ids)} profile(s) from {direction_text}?"):
            self.console.print("❌ Conversion cancelled")
            return
        
        self.console.print(f"🔄 Converting {len(profile_ids)} profile(s) from {direction_text}...")
        
        success_count = 0
        for i, profile_id in enumerate(profile_ids, 1):
            self.console.print(f"\n📝 Processing profile {i}/{len(profile_ids)}: {profile_id[:8]}...")
            
            # Get profile info for display
            profile = self.profile_api.get_profile_by_id(profile_id)
            profile_name = profile.get("name", "Unknown") if profile else "Unknown"
            current_storage = "local" if profile.get("is_local", True) else "cloud"
            
            self.console.print(f"  📋 Profile: {profile_name}")
            self.console.print(f"  💾 Current storage: {current_storage}")
            
            # Convert storage
            response = self.profile_api.convert_profile_storage(
                profile_id=profile_id,
                workspace_id=workspace_id,
                convert_to_local=convert_to_local
            )
            
            if response.success:
                self.console.print(f"  ✅ Successfully converted profile: {profile_name}")
                success_count += 1
            else:
                self.console.print(f"  ❌ Failed to convert profile {profile_name}: {response.error}")
        
        self.console.print(f"\n📊 Conversion Results:")
        self.console.print(f"✅ Successfully converted: {success_count}")
        self.console.print(f"❌ Failed: {len(profile_ids) - success_count}")
        self.console.print(f"📊 Total profiles: {len(profile_ids)}")
        
        if success_count > 0:
            self.console.print(f"\n💡 Tip: Run 'Check All Profiles' to see updated storage status")
    
    def run(self):
        """Run the main menu loop"""
        self.display_welcome()
        
        while True:
            try:
                choice = self.display_main_menu()
                
                if choice == "1":
                    self.check_all_profiles()
                elif choice == "2":
                    self.update_proxy_to_profile()
                elif choice == "3":
                    self.upload_object()
                elif choice == "4":
                    self.create_extension()
                elif choice == "5":
                    self.available_extensions()
                elif choice == "6":
                    self.activate_extension()
                elif choice == "7":
                    self.import_cookies()
                elif choice == "8":
                    self.convert_storage()
                elif choice == "9":
                    self.start_single_bot()
                elif choice == "10":
                    self.start_multiple_bots()
                elif choice == "11":
                    self.start_script_runner_multiple_profiles()
                elif choice == "12":
                    self.start_profile_warm_multiple_profiles()
                elif choice == "13":
                    self.stop_single_profile()
                elif choice == "14":
                    self.stop_all_profiles()
                elif choice == "15":
                    self.view_running_status()
                elif choice == "16":
                    self.console.print("👋 Goodbye!")
                    break
                
                # Pause before showing menu again
                if choice != "16":
                    Prompt.ask("\nPress Enter to continue...")
                    
            except KeyboardInterrupt:
                self.console.print("\n\n👋 Goodbye!")
                break
            except Exception as e:
                self.console.print(f"\n❌ Error: {str(e)}")
                Prompt.ask("Press Enter to continue...")
