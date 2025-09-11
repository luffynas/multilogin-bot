#!/usr/bin/env python3
"""
Multilogin X API Automation Tool
Main application entry point
"""
import sys
import os
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from core.auth import AuthManager
from api.launcher import LauncherAPI
from api.profile_management import ProfileManagementAPI
from api.profile_access import ProfileAccessAPI
from api.proxy import ProxyAPI
from api.cookies import CookiesAPI
from api.object_storage import ObjectStorageAPI
from api.extension import ExtensionAPI
from bot.manager import BotManager
from ui.menu import MenuSystem
from config import Config

def main():
    """Main application entry point"""
    print("🚀 Starting Multilogin X API Automation Tool...")
    
    # Validate configuration
    if not Config.validate():
        print("❌ Configuration error: Please set MULTILOGIN_EMAIL and MULTILOGIN_PASSWORD in .env file")
        print("📝 Copy .env.example to .env and fill in your credentials")
        return 1
    
    try:
        # Initialize authentication manager
        print("🔐 Initializing authentication...")
        auth_manager = AuthManager()
        
        # Try to load existing token
        token = auth_manager.load_token()
        if not token or not auth_manager.is_token_valid():
            print("🔑 No valid token found, signing in...")
            result = auth_manager.sign_in()
            if not result.success:
                print(f"❌ Authentication failed: {result.error}")
                return 1
            print("✅ Authentication successful")
        else:
            print("✅ Using existing valid token")
        
        # Initialize API clients
        print("🔧 Initializing API clients...")
        launcher_api = LauncherAPI(auth_manager)
        profile_api = ProfileManagementAPI(auth_manager)
        profile_access_api = ProfileAccessAPI(auth_manager)
        proxy_api = ProxyAPI(auth_manager)
        cookies_api = CookiesAPI(auth_manager)
        object_storage_api = ObjectStorageAPI(auth_manager)
        extension_api = ExtensionAPI(auth_manager)
        
        # Initialize bot manager
        print("🤖 Initializing bot manager...")
        bot_manager = BotManager(launcher_api, profile_api, auth_manager, proxy_api)
        
        # Initialize menu system
        print("📋 Initializing menu system...")
        menu_system = MenuSystem(
            launcher_api=launcher_api,
            profile_api=profile_api,
            profile_access_api=profile_access_api,
            proxy_api=proxy_api,
            cookies_api=cookies_api,
            object_storage_api=object_storage_api,
            extension_api=extension_api,
            bot_manager=bot_manager
        )
        
        print("✅ All systems initialized successfully!")
        print()
        
        # Run the main menu
        menu_system.run()
        
        return 0
        
    except KeyboardInterrupt:
        print("\n\n👋 Application interrupted by user")
        return 0
    except Exception as e:
        print(f"\n❌ Unexpected error: {str(e)}")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
