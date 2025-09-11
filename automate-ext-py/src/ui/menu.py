"""
Main menu system for the application
"""
from typing import List, Dict, Any, Optional
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
8. Start Bot (Single Profile)
9. Start Bot (Multiple Profiles)
10. Stop All Profiles
11. View Running Profiles Status
12. Exit
        """
        
        panel = Panel(menu_text, title="Main Menu", border_style="green")
        self.console.print(panel)
        
        choice = Prompt.ask(
            "Select an option",
            choices=["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
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
            choices=["none", "mimic", "stealthfox"], 
            default="none"
        )
        
        # Get headless mode
        headless_mode = Confirm.ask("Enable headless mode?", default=False)
        
        # Get all profiles
        profiles = self.bot_manager.get_all_profiles()
        
        if not profiles:
            self.console.print("❌ No profiles available")
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
    
    def stop_all_profiles(self):
        """Stop all running profiles"""
        self.console.print("\n🛑 Stop All Profiles")
        
        if Confirm.ask("Are you sure you want to stop all profiles?"):
            results = self.bot_manager.stop_all_bots()
            
            successful = sum(1 for r in results if r["success"])
            self.console.print(f"✅ Stopped {successful} profiles")
    
    def view_running_status(self):
        """View status of running profiles"""
        self.console.print("\n📊 Running Profiles Status")
        
        status_info = self.bot_manager.get_running_profiles_status()
        
        if status_info:
            table = Table(title="Running Profiles")
            table.add_column("Profile ID", style="cyan")
            table.add_column("Name", style="green")
            table.add_column("Status", style="yellow")
            table.add_column("Runtime", style="magenta")
            table.add_column("Remaining", style="red")
            table.add_column("Port", style="blue")
            
            for profile_id, info in status_info.items():
                runtime_min = int(info["runtime_seconds"] / 60)
                remaining_min = int(info["remaining_seconds"] / 60)
                
                table.add_row(
                    profile_id[:8] + "...",
                    info["profile_name"],
                    info["status"],
                    f"{runtime_min}m",
                    f"{remaining_min}m",
                    str(info.get("port", "N/A"))
                )
            
            self.console.print(table)
        else:
            self.console.print("ℹ️ No profiles currently running")
    
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
                    self.start_single_bot()
                elif choice == "9":
                    self.start_multiple_bots()
                elif choice == "10":
                    self.stop_all_profiles()
                elif choice == "11":
                    self.view_running_status()
                elif choice == "12":
                    self.console.print("👋 Goodbye!")
                    break
                
                # Pause before showing menu again
                if choice != "12":
                    Prompt.ask("\nPress Enter to continue...")
                    
            except KeyboardInterrupt:
                self.console.print("\n\n👋 Goodbye!")
                break
            except Exception as e:
                self.console.print(f"\n❌ Error: {str(e)}")
                Prompt.ask("Press Enter to continue...")
