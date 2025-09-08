# Stealth Auto Scroll Extension

A highly stealthy Chrome extension that provides intelligent auto-scrolling capabilities while remaining undetectable by anti-bot systems.

## 🕵️ Stealth Features

- **Dynamic Injection**: Uses `chrome.scripting.executeScript()` instead of static content scripts
- **No Global Variables**: Zero footprint in the global scope
- **No Native Function Patching**: Preserves original browser functions
- **Human-like Behavior**: Random timing, pauses, and direction changes
- **Self-removing Injector**: Bootstrap script disappears after injection
- **Hashed Assets**: Obfuscated filenames for better stealth

## 🏗️ Architecture

```
Background Service Worker (Control Hub)
    ↓
Dynamic Injection (chrome.scripting.executeScript)
    ↓
Bootstrap Injector (Self-removing)
    ↓
In-Page Script (Main Logic)
    ↓
Human-like Scrolling Behavior
```

## 📁 Project Structure

```
stealth-auto-scroll/
├── src/
│   ├── background.js      # Service worker - central control
│   ├── injector.js        # Bootstrap script - injects and removes itself
│   ├── inpage.js          # Main logic - runs inline in page
│   ├── popup.js           # Popup UI controller
│   ├── popup.html         # Popup UI
│   ├── popup.css          # Popup styles
│   └── self-audit.js      # Testing script
├── dist/                  # Built files (generated)
├── icons/                 # Extension icons
├── manifest.json          # Extension manifest
├── webpack.config.js      # Build configuration
├── package.json           # Dependencies
└── README.md             # This file
```

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd stealth-auto-scroll
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the extension**
   ```bash
   npm run build
   ```

4. **Load in Chrome**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `stealth-auto-scroll` folder

## 🛠️ Development

### Build Commands

```bash
# Production build
npm run build

# Development build with source maps
npm run build:dev

# Watch mode for development
npm run watch

# Clean build directory
npm run clean
```

### Testing

Run the self-audit script on any webpage to test stealth capabilities:

```javascript
// Paste this in browser console
(function() {
  const script = document.createElement('script');
  script.src = 'data:text/javascript;base64,' + btoa(`
    // Paste contents of src/self-audit.js here
  `);
  document.head.appendChild(script);
})();
```

## 🔧 Configuration

The extension behavior can be configured in `src/inpage.js`:

```javascript
const CONFIG = {
  scrollStep: { min: 50, max: 200 },      // Scroll step range
  scrollDelay: { min: 100, max: 500 },    // Delay between scrolls
  pauseChance: 0.1,                       // Probability of pausing
  pauseDuration: { min: 1000, max: 3000 }, // Pause duration range
  directionChangeChance: 0.05,            // Probability of direction change
  maxScrollDistance: 10000                // Maximum total scroll distance
};
```

## 🎯 Usage

1. **Activate**: Click the extension icon or use the popup
2. **Automatic**: The extension starts scrolling automatically
3. **Human-like**: Scrolling includes random pauses and direction changes
4. **Stealth**: No traces left in the page DOM or global scope

## 🔍 Stealth Techniques

### 1. Dynamic Injection
- No static content scripts in manifest
- Injection only on user trigger
- Scripts disappear after execution

### 2. Inline Execution
- Main logic runs as inline script
- No external resource loading
- Appears as normal page script

### 3. Human-like Behavior
- Random scroll steps and delays
- Occasional pauses and direction changes
- Natural scrolling patterns

### 4. Zero Footprint
- No global variables
- No native function patching
- No permanent DOM modifications

## 🧪 Testing

### Self-Audit Checklist

- [ ] No suspicious global variables
- [ ] No native function patches
- [ ] No extension resources visible
- [ ] No suspicious DOM elements
- [ ] Minimal performance impact
- [ ] Ad blocker detection passes
- [ ] No suspicious event listeners

### Manual Testing

1. Load extension in Chrome
2. Navigate to any webpage
3. Activate extension
4. Run self-audit script
5. Verify all checks pass

## ⚠️ Important Notes

- This extension is designed for educational and testing purposes
- Always comply with website terms of service
- Use responsibly and ethically
- Some websites may still detect automation through other means

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🐛 Troubleshooting

### Extension not working
- Check Chrome console for errors
- Verify manifest.json is valid
- Ensure all permissions are granted

### Detection issues
- Run self-audit script
- Check for global variables
- Verify no native function patches

### Performance issues
- Reduce scroll frequency
- Increase delay ranges
- Check for memory leaks
