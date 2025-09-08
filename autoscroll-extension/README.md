# Autoscroll Extension

A human-like and realistic autoscroll extension with advanced stealth capabilities, supporting both desktop and mobile browsers.

## Features

### Core Functionality
- **Human-like Scrolling**: Variable speed, acceleration, hesitation, and rhythm patterns
- **Event Simulation**: Native touch/wheel events with noise and micro-movements
- **Adaptive Behavior**: Content-aware scrolling and idle strategies
- **Multi-Platform**: Desktop and mobile browser support

### Stealth Capabilities
- **Anti-Detection**: Advanced bot detection avoidance
- **Noise Events**: Mousemove, keypress, focus/blur simulation
- **Canvas Noise**: Fingerprint variation and session management
- **Human Error Simulation**: Realistic interaction patterns

### Navigation & Detection
- **Google AdSense Detector**: Natural ad interaction
- **Navigation Controller**: Next/Previous/Related/Recent post automation
- **Pagination Detector**: Load More and infinite scroll detection
- **Keyword Detector**: User-defined link identification
- **Tab Manager**: Multi-tab navigation and control

### Analytics & AI
- **Real-time Statistics**: Scroll time, pages, navigation clicks
- **Heatmap Generation**: Dwell time and scroll intensity mapping
- **Session Timeline**: Chronological user session tracking
- **AI Pattern Generation**: Machine learning for behavior adaptation
- **Content Analysis**: Reading time estimation and content analysis

### Debug Tools
- **Real-time Debug Overlay**: Live performance metrics
- **Visual Heatmap Overlay**: Interactive debugging interface
- **Performance Monitoring**: Memory usage and execution time tracking
- **Error Tracking**: Comprehensive error logging and reporting

## Installation

### For Development/Testing

1. **Build the Extension**
   ```bash
   cd autoscroll-extension
   npm install
   npm run build
   ```

2. **Load in Chrome/Edge**
   - Open Chrome/Edge browser
   - Go to `chrome://extensions/` or `edge://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `dist` folder from this project

3. **Load in Firefox**
   - Open Firefox browser
   - Go to `about:debugging`
   - Click "This Firefox"
   - Click "Load Temporary Add-on"
   - Select the `manifest.json` file from the `dist` folder

### For Production

The extension is built using Webpack and follows Chrome Extension Manifest V3 standards.

## Usage

### Basic Usage

1. **Start Autoscroll**
   - Click the extension icon in your browser toolbar
   - Click "Start" button in the popup
   - The extension will begin human-like scrolling

2. **Configure Settings**
   - Right-click extension icon → "Options"
   - Adjust scroll speed, strategy, and stealth level
   - Save your preferences

3. **Navigation Features**
   - Enable "Auto Navigation" in options
   - Choose navigation target (Next/Previous/Related/Recent)
   - Select navigation mode (Same Tab/New Tab/Background Tab)

### Advanced Features

1. **Stealth Modes**
   - **Basic**: Standard human-like behavior
   - **Intermediate**: Enhanced noise and variation
   - **Advanced**: Full anti-detection suite
   - **Expert**: Maximum stealth with AI adaptation

2. **Debug Mode**
   - Enable in options for real-time debugging
   - View performance metrics and heatmaps
   - Monitor stealth events and detection avoidance

3. **Profile Management**
   - Create custom profiles for different websites
   - Export/import settings for backup
   - Switch between profiles based on content type

## Testing

### Browser Testing

The extension can be tested in any Chromium-based browser (Chrome, Edge, Brave) or Firefox.

**Test Scenarios:**
1. **Basic Scrolling**: Test on various websites with different content types
2. **Navigation**: Test auto-navigation on blog/news sites
3. **Stealth**: Test on sites with bot detection
4. **Performance**: Monitor memory usage and CPU impact
5. **Mobile**: Test on mobile browsers (if supported)

### Automated Testing

Run the test suite:
```bash
npm test
```

**Test Coverage:**
- Unit tests for core modules
- Integration tests for engine interactions
- Stealth detection tests
- Performance benchmarks
- End-to-end workflow tests

## Configuration

### Profiles

The extension includes several pre-configured profiles:

- **Default**: Balanced scrolling with basic stealth
- **Fast**: High-speed scrolling for quick browsing
- **Slow**: Slow, deliberate scrolling for reading
- **Advanced**: Maximum stealth with AI adaptation

### Settings

Key configuration options:

- **Scroll Speed**: 0.1x to 5.0x multiplier
- **Strategy**: Linear, Exponential, Sine Wave, Random, Adaptive
- **Stealth Level**: Basic, Intermediate, Advanced, Expert
- **Navigation Mode**: Same Tab, New Tab, Background Tab
- **Debug Mode**: Enable/disable debugging features

## Architecture

### Core Modules
- **Engine**: Main orchestration and control
- **Strategies**: Scroll pattern implementations
- **Adapters**: Platform-specific event handling
- **Stealth**: Anti-detection mechanisms

### Advanced Modules
- **Analytics**: Statistics collection and analysis
- **AI**: Pattern generation and behavior learning
- **Debug**: Development and monitoring tools
- **Navigation**: Link detection and automation

### Utilities
- **Logger**: Comprehensive logging system
- **Storage**: Settings and data persistence
- **Randomizer**: Human-like variation generation

## Development

### Project Structure
```
autoscroll-extension/
├── src/
│   ├── core/           # Core engine and utilities
│   ├── strategies/     # Scroll pattern implementations
│   ├── adapters/       # Platform-specific adapters
│   ├── stealth/        # Anti-detection mechanisms
│   ├── navigation/     # Link detection and automation
│   ├── analytics/      # Statistics and monitoring
│   ├── ai/            # AI and machine learning
│   ├── debug/         # Debug tools and overlays
│   ├── ui/            # User interface components
│   ├── background/    # Service worker
│   ├── content/       # Content script
│   └── utils/         # Utility functions
├── tests/             # Test suite
├── dist/              # Built extension
└── docs/              # Documentation
```

### Building
```bash
# Development build
npm run build

# Production build
npm run build:prod

# Watch mode for development
npm run dev
```

### Testing
```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e
npm run test:performance

# Generate coverage report
npm run test:coverage
```

## Browser Compatibility

- **Chrome**: 88+ (Manifest V3)
- **Edge**: 88+ (Chromium-based)
- **Firefox**: 109+ (Manifest V3)
- **Safari**: Not supported (different extension format)

## Performance

- **Memory Usage**: < 10MB typical
- **CPU Impact**: < 5% during active scrolling
- **Bundle Size**: ~370KB (content script)
- **Startup Time**: < 100ms

## Security

- **Permissions**: Minimal required permissions
- **Data Storage**: Local storage only
- **Network**: No external requests
- **Privacy**: No data collection or transmission

## Troubleshooting

### Common Issues

1. **Extension Not Loading**
   - Check browser compatibility
   - Verify manifest.json syntax
   - Check console for errors

2. **Scrolling Not Working**
   - Ensure content script is injected
   - Check for JavaScript errors
   - Verify page permissions

3. **Performance Issues**
   - Reduce scroll speed
   - Lower stealth level
   - Disable debug mode

4. **Detection Issues**
   - Increase stealth level
   - Enable more noise events
   - Use adaptive strategy

### Debug Mode

Enable debug mode in options to see:
- Real-time performance metrics
- Stealth event logs
- Error messages
- Memory usage

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Enable debug mode for detailed logs
3. Create an issue with detailed information
4. Include browser version and error messages

## Changelog

### Version 1.0.0
- Initial release
- Core autoscroll functionality
- Basic stealth capabilities
- Navigation automation
- Analytics and AI integration
- Debug tools
- Comprehensive test suite