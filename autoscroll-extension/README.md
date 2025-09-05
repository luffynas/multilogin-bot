# Autoscroll Extension

A human-like autoscroll browser extension with advanced stealth capabilities.

## Features

- **Human-like Scrolling**: Natural scroll patterns with randomization
- **Multiple Strategies**: Linear, momentum, and burst scrolling modes
- **Cross-Platform**: Works on desktop and mobile browsers
- **Stealth Mode**: Advanced anti-detection capabilities
- **Smart Navigation**: Auto-navigate through pages
- **Analytics**: Track scrolling behavior and statistics
- **Customizable**: Multiple profiles and configuration options

## Installation

### Development Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd autoscroll-extension
```

2. Install dependencies:
```bash
npm install
```

3. Build the extension:
```bash
npm run build
```

4. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `dist` folder

### Production Installation

1. Download the extension from the Chrome Web Store (coming soon)
2. Click "Add to Chrome" to install

## Usage

### Basic Usage

1. Click the extension icon in your browser toolbar
2. Select a profile (Default or Advanced Stealth)
3. Choose a scroll strategy (Linear, Momentum, or Burst)
4. Adjust the speed slider if needed
5. Click "Start" to begin autoscrolling
6. Click "Stop" to end the session

### Advanced Features

- **Auto-Navigation**: Enable to automatically navigate to next/previous pages
- **Statistics**: View detailed scrolling statistics
- **Options**: Access advanced settings and configuration

## Configuration

### Profiles

- **Default Profile**: Balanced scrolling with basic stealth
- **Advanced Stealth**: High-level stealth with advanced human behavior simulation

### Strategies

- **Linear**: Consistent, steady scrolling
- **Momentum**: Natural acceleration and deceleration
- **Burst**: Quick bursts followed by pauses

### Navigation Modes

- **Same Tab**: Navigate in the current tab
- **New Tab**: Open links in new tabs
- **Mixed**: Randomly choose between same tab and new tab

## Development

### Project Structure

```
autoscroll-extension/
├── src/
│   ├── background/          # Background service worker
│   ├── content/             # Content scripts
│   ├── core/                # Core engine and logic
│   ├── strategies/          # Scroll strategies
│   ├── adapters/            # Platform adapters
│   ├── stealth/             # Stealth modules
│   ├── detectors/           # Content detectors
│   ├── navigation/          # Navigation logic
│   ├── analytics/           # Analytics and tracking
│   ├── ai/                  # AI and ML modules
│   ├── ui/                  # User interface
│   ├── profiles/            # Configuration profiles
│   └── utils/               # Utility functions
├── dist/                    # Built extension
├── tests/                   # Test files
└── docs/                    # Documentation
```

### Building

```bash
# Development build
npm run build:dev

# Production build
npm run build

# Watch mode
npm run watch
```

### Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Linting

```bash
# Check for linting errors
npm run lint

# Fix linting errors
npm run lint:fix

# Format code
npm run format
```

## API Reference

### Core Engine

The core engine manages the autoscroll functionality:

```javascript
import { engine } from '@core/engine.js';

// Start autoscroll
await engine.start(config);

// Stop autoscroll
await engine.stop();

// Pause autoscroll
await engine.pause();

// Resume autoscroll
await engine.resume();
```

### Strategies

Scroll strategies define how scrolling behaves:

```javascript
import { nextStep } from '@strategies/linear.js';

// Get next scroll step
const step = nextStep(context);
```

### Adapters

Adapters handle platform-specific scrolling:

```javascript
import { scroll } from '@adapters/desktop.js';

// Execute scroll step
await scroll(step);
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see LICENSE file for details

## Privacy

This extension:
- Does not collect personal information
- Does not track user behavior
- Does not send data to external servers
- Stores all data locally in the browser

## Support

- **Issues**: Report bugs and request features on GitHub
- **Documentation**: Check the docs/ folder for detailed documentation
- **Community**: Join our Discord server for discussions

## Roadmap

### Phase 1 (Current)
- ✅ Basic autoscroll functionality
- ✅ Multiple scroll strategies
- ✅ Desktop and mobile support
- ✅ Basic UI

### Phase 2 (Next)
- 🔄 Advanced stealth features
- 🔄 Navigation automation
- 🔄 Analytics dashboard
- 🔄 Profile management

### Phase 3 (Future)
- 📋 AI-powered behavior
- 📋 Plugin system
- 📋 Cloud sync
- 📋 Advanced analytics

## Changelog

### Version 1.0.0 (Current)
- Initial release
- Basic autoscroll functionality
- Three scroll strategies
- Cross-platform support
- Basic stealth features

## Acknowledgments

- Inspired by human browsing behavior research
- Built with modern web technologies
- Community feedback and contributions
