# Multilogin X API Automation Tool

A comprehensive Python tool for automating Multilogin browser profiles with concurrent execution, proxy management, cookie handling, and extension management.

## Features

### 🔐 Authentication
- Automatic token management with refresh capability
- Secure credential storage
- Session persistence

### 🚀 Profile Management
- Start/stop browser profiles
- Profile status monitoring
- Concurrent profile execution
- 30-minute runtime limits per profile

### 🌐 Proxy Management
- Generate and validate proxy configurations
- Update proxy settings for profiles
- Support for various proxy types

### 🍪 Cookie Management
- Pre-made cookie handling
- Target website cookie lists
- Profile-specific cookie application

### 📦 Extension Management
- Upload extensions to object storage
- Enable/disable extensions for profiles
- Extension version management

### 🤖 Bot Automation
- Single profile bot execution
- Multi-profile concurrent execution
- Random start intervals (1-5 minutes)
- Automatic timeout handling

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd automate-ext-py
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment:
```bash
cp .env.example .env
# Edit .env with your Multilogin credentials
```

4. Run the application:
```bash
python main.py
```

## Configuration

Create a `.env` file with the following variables:

```env
# Multilogin X API Configuration
MULTILOGIN_EMAIL=your_email@example.com
MULTILOGIN_PASSWORD=your_password
MULTILOGIN_BASE_URL=https://api.multilogin.com
MULTILOGIN_LAUNCHER_URL=https://launcher.mlx.yt:45001

# Token storage
TOKEN_FILE=token.json

# Bot configuration
MAX_PROFILE_RUNTIME=1800  # 30 minutes in seconds
MIN_START_INTERVAL=60     # 1 minute in seconds
MAX_START_INTERVAL=300    # 5 minutes in seconds
```

## Usage

### Main Menu Options

1. **Check All Profiles** - View all available profiles
2. **Update Proxy to Profile** - Configure proxy for a specific profile
3. **Upload Extension** - Upload browser extensions
4. **Update Cookies** - Apply cookies to profiles
5. **Start Bot (Single Profile)** - Run automation for one profile
6. **Start Bot (Multiple Profiles)** - Run concurrent automation
7. **Stop All Profiles** - Stop all running profiles
8. **View Running Profiles Status** - Monitor active profiles
9. **Exit** - Close the application

### Bot Execution Flow

1. **System Start** - Initialize authentication and API clients
2. **Login** - Authenticate with Multilogin X API
3. **Main Menu** - Choose from available operations
4. **Bot Execution**:
   - Single or multi-profile execution
   - Random start intervals (1-5 minutes)
   - 30-minute runtime limit per profile
   - Automatic timeout handling
   - Concurrent execution with configurable limits

## Project Structure

```
automate-ext-py/
├── src/
│   ├── api/                 # API clients
│   │   ├── base.py         # Base API client
│   │   ├── launcher.py     # Launcher API
│   │   ├── profile_management.py
│   │   ├── profile_access.py
│   │   ├── proxy.py
│   │   ├── cookies.py
│   │   └── object_storage.py
│   ├── bot/                # Bot management
│   │   └── manager.py      # Bot manager
│   ├── core/               # Core functionality
│   │   └── auth.py         # Authentication
│   ├── models/             # Data models
│   │   └── base.py         # Base models
│   └── ui/                 # User interface
│       └── menu.py         # Menu system
├── config.py               # Configuration
├── main.py                 # Main application
├── requirements.txt        # Dependencies
└── README.md              # This file
```

## API Endpoints Implemented

### Launcher
- Start Browser Profile
- Stop Browser Profile
- Stop All Profiles
- Get Profile Status
- Get All Profiles Status
- Delete Browser Core
- Validate Proxy

### Profile Access Management
- User Sign In
- User Refresh Token
- User Workspaces
- Workspace Folders

### Profile Management
- Profile Create
- Profile Remove
- Profile Partial Update

### Proxy
- Generate Proxy
- Fetch Proxy Data

### Pre-made Cookies
- Target Website List
- Create Cookies Metadata
- Cookies List
- Update Cookies Metadata

### Object Storage
- Upload Object
- Create Extension
- Enable Extension
- Disable Extension
- List Objects per Profile

## Error Handling

The application includes comprehensive error handling for:
- Authentication failures
- API rate limiting
- Network timeouts
- Invalid responses
- File operations

## Security Features

- Secure token storage
- Automatic token refresh
- Credential validation
- Safe file handling

## Dependencies

- `requests` - HTTP client
- `python-dotenv` - Environment variable management
- `pydantic` - Data validation
- `rich` - Terminal UI
- `typer` - CLI framework
- `colorama` - Cross-platform colored terminal text

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please refer to the Multilogin X API documentation or create an issue in the repository.
