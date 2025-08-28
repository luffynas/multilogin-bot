# AdSense Automation Pro - Browser Extension

A sophisticated browser extension for Chrome and Firefox that automates website content interaction to increase Google AdSense revenue and improve RPM (Revenue Per Mille). Designed specifically for use with Multilogin's Mimic X and StealthFox browsers.

## Features

### 🎯 Core Automation
- **Human-like Behavior Simulation**: Realistic mouse movements, typing patterns, and scrolling behavior
- **Personality-based Automation**: Four distinct personality types (Explorer, Researcher, Casual, Professional)
- **Intelligent AdSense Detection**: Advanced algorithms to identify and interact with AdSense ads
- **Stealth Monitoring**: Continuous analysis to avoid bot detection

### 🧠 Personality Engine
- **Explorer**: Curious, clicks on various content, explores related links
- **Researcher**: Focused, reads thoroughly, searches for specific information
- **Casual**: Relaxed browsing, skims content, occasional interactions
- **Professional**: Efficient, targeted interactions, business-focused behavior

### 📊 AdSense Optimization
- **Smart Ad Detection**: Identifies AdSense ads using multiple selectors
- **High-Value Ad Targeting**: Prioritizes ads in lucrative categories (finance, business, etc.)
- **RPM Score Calculation**: Tracks and optimizes Revenue Per Mille
- **Intelligent Interaction**: Decides whether to click, hover, or view based on ad value

### 🎭 Human Behavior Simulation
- **Natural Mouse Movements**: Bezier curve paths with acceleration and jitter
- **Realistic Typing**: Variable speed, typos, backspaces, and thinking pauses
- **Reading Behavior**: Eye movement simulation, text selection, re-reading patterns
- **Intelligent Navigation**: Context-aware link selection and browsing patterns

### 🛡️ Stealth & Security
- **Behavior Pattern Analysis**: Continuous monitoring of interaction patterns
- **Bot Detection Risk Assessment**: Real-time evaluation of human-likeness
- **Dynamic Behavior Adjustment**: Automatic modification based on risk levels
- **Session Management**: Persistent tracking of browsing sessions

## Installation

### Chrome (Manifest V3)
1. Download the extension files
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the `automate-ext` folder
5. The extension icon should appear in your toolbar

### Firefox (Manifest V2)
1. Download the extension files
2. Open Firefox and navigate to `about:debugging`
3. Click "This Firefox" tab
4. Click "Load Temporary Add-on" and select the `manifest.json` file
5. The extension icon should appear in your toolbar

## Usage

### Basic Setup
1. Click the extension icon to open the popup
2. Configure your preferred personality type and automation level
3. Set your target RPM and enable stealth mode if desired
4. Click "Start" to begin automation

### Configuration Options
- **Personality Type**: Choose from Explorer, Researcher, Casual, Professional, or Auto
- **Automation Level**: Low, Medium, High, or Custom
- **Target RPM**: Set your desired Revenue Per Mille target
- **Stealth Mode**: Enable enhanced bot detection avoidance
- **Auto Start**: Automatically start automation on page load

### Actions Available
- **Detect Ads**: Manually scan the current page for AdSense ads
- **Simulate Behavior**: Trigger human-like behavior simulation
- **Export Data**: Download session data and metrics
- **View Metrics**: Access detailed performance statistics

## Architecture

### File Structure
```
automate-ext/
├── manifest.json (Chrome - Manifest V3)
├── manifest.json (Firefox - Manifest V2)
├── background.js
├── content-script.js
├── popup.html
├── popup.css
├── popup.js
├── lib/
│   ├── personality-engine.js
│   ├── adsense-detector.js
│   ├── behavior-simulator.js
│   ├── mouse-simulator.js
│   ├── keyboard-simulator.js
│   ├── reading-simulator.js
│   ├── navigation-simulator.js
│   ├── session-manager.js
│   └── stealth-monitor.js
└── README.md
```

### Core Components

#### Background Script (`background.js`)
- Manages extension lifecycle
- Handles communication between popup and content scripts
- Manages tab state and script injection
- Handles notifications and storage

#### Content Script (`content-script.js`)
- Main automation orchestrator
- Initializes all simulation components
- Handles message communication
- Manages the automation loop

#### Popup Interface (`popup.html`, `popup.css`, `popup.js`)
- User interface for configuration and control
- Real-time status and metrics display
- Configuration management
- Data export functionality

### Library Modules

#### Personality Engine (`personality-engine.js`)
- Generates and manages user personalities
- Defines behavior patterns for each personality type
- Adjusts automation behavior based on personality

#### AdSense Detector (`adsense-detector.js`)
- Identifies AdSense ads on web pages
- Analyzes ad content and value
- Manages ad interaction strategies

#### Behavior Simulator (`behavior-simulator.js`)
- Orchestrates human-like behavior simulation
- Integrates personality-based adjustments
- Manages interaction timing and patterns

#### Mouse Simulator (`mouse-simulator.js`)
- Generates natural mouse movements
- Implements realistic clicking behavior
- Manages hover and drag operations

#### Keyboard Simulator (`keyboard-simulator.js`)
- Simulates realistic typing patterns
- Generates typos and corrections
- Manages keyboard shortcuts and combinations

#### Reading Simulator (`reading-simulator.js`)
- Simulates natural reading behavior
- Analyzes content type and complexity
- Manages reading speed and comprehension

#### Navigation Simulator (`navigation-simulator.js`)
- Manages intelligent page navigation
- Selects contextually appropriate links
- Simulates browsing patterns

#### Session Manager (`session-manager.js`)
- Tracks browsing sessions
- Manages data persistence
- Handles session lifecycle

#### Stealth Monitor (`stealth-monitor.js`)
- Monitors behavior patterns
- Assesses bot detection risk
- Provides stealth recommendations

## Configuration

### Default Settings
```javascript
{
  personalityType: 'auto',
  automationLevel: 'medium',
  targetRPM: 0,
  stealthMode: true,
  autoStart: false
}
```

### Personality Types
- **Explorer**: High interaction rate, diverse content exploration
- **Researcher**: Focused reading, targeted searches, thorough analysis
- **Casual**: Relaxed browsing, occasional interactions, content skimming
- **Professional**: Efficient navigation, business-focused behavior

### Automation Levels
- **Low**: Minimal interaction, high stealth
- **Medium**: Balanced interaction and stealth
- **High**: Maximum interaction, moderate stealth
- **Custom**: User-defined settings

## Metrics & Analytics

### Session Metrics
- **Duration**: Total session time
- **Pages Visited**: Number of pages accessed
- **Total Interactions**: Mouse clicks, scrolls, typing events

### AdSense Metrics
- **Ads Detected**: Number of AdSense ads found
- **Ad Clicks**: Total ad interactions
- **High-Value Clicks**: Clicks on lucrative ad categories
- **RPM Score**: Calculated Revenue Per Mille

### Stealth Metrics
- **Human Behavior Score**: Assessment of human-likeness
- **Bot Detection Risk**: Probability of being flagged as a bot
- **Stealth Effectiveness**: Overall stealth performance

## Security & Privacy

### Data Collection
- Only collects browsing behavior data for stealth analysis
- No personal information is stored or transmitted
- All data is stored locally in browser storage

### Bot Detection Avoidance
- Implements advanced algorithms to mimic human behavior
- Continuous monitoring and adjustment of interaction patterns
- Risk assessment and automatic behavior modification

### Compliance
- Respects website terms of service
- Implements rate limiting and natural delays
- Avoids aggressive or harmful automation patterns

## Troubleshooting

### Common Issues

#### Extension Not Loading
- Ensure you're using the correct manifest file for your browser
- Check that all required files are present
- Verify browser permissions are granted

#### Automation Not Working
- Check that the content script is injected properly
- Verify the target website allows content scripts
- Ensure no other extensions are conflicting

#### Performance Issues
- Reduce automation level if experiencing slowdowns
- Disable stealth mode for better performance
- Check browser memory usage

### Debug Mode
Enable debug logging by setting `debugMode: true` in the extension configuration.

## Development

### Building from Source
1. Clone the repository
2. Install dependencies (if any)
3. Modify source files as needed
4. Test in development mode
5. Package for distribution

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the troubleshooting section

## Disclaimer

This extension is designed for educational and research purposes. Users are responsible for ensuring compliance with website terms of service and applicable laws. The developers are not responsible for any misuse or violations.
