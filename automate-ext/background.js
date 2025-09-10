/**
 * AdSense Automation Pro - Background Script
 * Handles extension lifecycle and communication between components
 */

class BackgroundManager {
    constructor() {
        this.isInitialized = false;
        this.activeTabs = new Map();
        this.extensionConfig = {
            enabled: true,
            autoStart: true,
            notifications: true
        };
    }

    /**
     * Initialize background manager
     */
    async initialize() {
        if (this.isInitialized) return;
        
        try {
            console.log('AdSense Automation Pro Background: Initializing...');
            
            // Setup event listeners first
            this.setupEventListeners();
            
            // Load configuration
            await this.loadConfiguration();
            
            // Setup message handling
            this.setupMessageHandling();
            
            // Initialize extension
            await this.initializeExtension();
            
            // Log tab status for debugging
            await this.logTabStatus();
            
            this.isInitialized = true;
            console.log('AdSense Automation Pro Background: Initialized successfully');
            
        } catch (error) {
            console.error('AdSense Automation Pro Background: Initialization failed', error);
            // Don't throw error to prevent service worker registration failure
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        try {
            // Extension installation
            if (chrome.runtime.onInstalled) {
                chrome.runtime.onInstalled.addListener((details) => {
                    this.handleInstallation(details);
                });
            }
            
            // Extension startup
            if (chrome.runtime.onStartup) {
                chrome.runtime.onStartup.addListener(() => {
                    this.handleStartup();
                });
            }
            
            // Tab updates
            if (chrome.tabs.onUpdated) {
                chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
                    this.handleTabUpdate(tabId, changeInfo, tab);
                });
            }
            
            // Tab removal
            if (chrome.tabs.onRemoved) {
                chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
                    this.handleTabRemoval(tabId, removeInfo);
                });
            }
            
            // Extension icon click
            if (chrome.action.onClicked) {
                chrome.action.onClicked.addListener((tab) => {
                    this.handleIconClick(tab);
                });
            }
        } catch (error) {
            console.error('Error setting up event listeners:', error);
        }
    }

    /**
     * Setup message handling
     */
    setupMessageHandling() {
        try {
            if (chrome.runtime.onMessage) {
                chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
                    this.handleMessage(message, sender, sendResponse);
                    return true; // Keep message channel open for async responses
                });
            }
        } catch (error) {
            console.error('Error setting up message handling:', error);
        }
    }

    /**
     * Handle extension installation
     */
    async handleInstallation(details) {
        console.log('AdSense Automation Pro: Extension installed', details);
        
        if (details.reason === 'install') {
            // First time installation
            await this.setupDefaultConfiguration();
            await this.showWelcomeNotification();
        } else if (details.reason === 'update') {
            // Extension update
            await this.handleUpdate(details);
        }
    }

    /**
     * Handle extension startup
     */
    async handleStartup() {
        console.log('AdSense Automation Pro: Extension started');
        await this.initialize();
    }

    /**
     * Handle tab updates
     */
    async handleTabUpdate(tabId, changeInfo, tab) {
        try {
            if (changeInfo.status === 'complete' && tab.url) {
                // Check if this is a supported website
                if (this.isSupportedWebsite(tab.url)) {
                    await this.injectContentScript(tabId);
                } else {
                    console.log(`Skipping tab ${tabId}: URL not supported (${tab.url})`);
                }
            }
        } catch (error) {
            console.error(`Error handling tab update for tab ${tabId}:`, error);
        }
    }

    /**
     * Handle tab removal
     */
    handleTabRemoval(tabId, removeInfo) {
        // Clean up tab data
        this.activeTabs.delete(tabId);
    }

    /**
     * Handle extension icon click
     */
    async handleIconClick(tab) {
        try {
            // Open popup or toggle automation
            if (this.isSupportedWebsite(tab.url)) {
                await this.toggleAutomation(tab.id);
            } else {
                console.log(`Icon clicked on unsupported URL: ${tab.url}`);
                await this.showUnsupportedWebsiteMessage();
            }
        } catch (error) {
            console.error('Error handling icon click:', error);
        }
    }

    /**
     * Handle incoming messages
     */
    async handleMessage(message, sender, sendResponse) {
        try {
            if (!message || !message.action) {
                sendResponse({ status: 'error', message: 'Invalid message format' });
                return;
            }

            switch (message.action) {
                case 'getStatus':
                    const status = await this.getStatus();
                    sendResponse({ status: 'success', data: status });
                    break;
                    
                case 'startAutomation':
                    const result = await this.startAutomation(sender.tab?.id, message.options);
                    sendResponse({ status: 'success', result });
                    break;
                    
                case 'stopAutomation':
                    await this.stopAutomation(sender.tab?.id);
                    sendResponse({ status: 'success' });
                    break;
                    
                case 'updateConfig':
                    await this.updateConfiguration(message.config);
                    sendResponse({ status: 'success' });
                    break;
                    
                case 'getMetrics':
                    const metrics = await this.getMetrics(sender.tab?.id);
                    sendResponse({ status: 'success', data: metrics });
                    break;
                    
                case 'exportData':
                    const data = await this.exportData(sender.tab?.id);
                    sendResponse({ status: 'success', data });
                    break;
                    
                case 'showNotification':
                    await this.showNotification(message.notification);
                    sendResponse({ status: 'success' });
                    break;
                    
                default:
                    sendResponse({ status: 'error', message: 'Unknown action' });
            }
        } catch (error) {
            console.error('Background message handling error:', error);
            sendResponse({ status: 'error', error: error.message || 'Unknown error' });
        }
    }

    /**
     * Initialize extension
     */
    async initializeExtension() {
        try {
            // Check if tabs API is available
            if (!chrome.tabs) {
                console.warn('Tabs API not available');
                return;
            }
            
            // Get all tabs and inject content scripts where needed
            const tabs = await chrome.tabs.query({});
            
            console.log(`Found ${tabs.length} tabs, checking for supported websites...`);
            
            for (const tab of tabs) {
                if (tab.url && this.isSupportedWebsite(tab.url)) {
                    await this.injectContentScript(tab.id);
                } else if (tab.url) {
                    console.log(`Skipping tab ${tab.id}: URL not supported (${tab.url})`);
                }
            }
        } catch (error) {
            console.error('Failed to initialize extension:', error);
            // Don't throw error to prevent service worker failure
        }
    }

    /**
     * Check if website is supported
     */
    isSupportedWebsite(url) {
        if (!url) return false;
        
        // Don't inject into chrome://, chrome-extension://, or other restricted URLs
        const restrictedProtocols = [
            'chrome://',
            'chrome-extension://',
            'moz-extension://',
            'about:',
            'chrome-search://',
            'chrome-devtools://',
            'view-source:',
            'data:',
            'file:'
        ];
        
        for (const protocol of restrictedProtocols) {
            if (url.startsWith(protocol)) {
                return false;
            }
        }
        
        // Support all other websites
        return true;
    }

    /**
     * Inject content script into tab with enhanced stealth protection
     */
    async injectContentScript(tabId) {
        try {
            // Enhanced check if content script is already injected
            if (this.activeTabs.has(tabId)) {
                const tabInfo = this.activeTabs.get(tabId);
                if (tabInfo.injected && (Date.now() - tabInfo.timestamp) < 300000) { // 5 minutes
                    console.log(`Content script already active in tab ${tabId} (injected ${Math.round((Date.now() - tabInfo.timestamp) / 1000)}s ago)`);
                    return;
                }
            }
            
            // Get tab information to check URL
            const tab = await chrome.tabs.get(tabId);
            if (!tab || !tab.url) {
                console.log(`Skipping tab ${tabId}: No tab or URL information`);
                return;
            }
            
            // Check if website is supported
            if (!this.isSupportedWebsite(tab.url)) {
                console.log(`Skipping tab ${tabId}: URL not supported (${tab.url})`);
                return;
            }
            
            // Check if scripting API is available
            if (!chrome.scripting) {
                console.warn('Scripting API not available');
                return;
            }
            
            // First, check if automation is already running in the tab
            try {
                const response = await chrome.tabs.sendMessage(tabId, { action: 'ping' });
                if (response && response.status === 'success') {
                    console.log(`Automation already running in tab ${tabId}, skipping injection`);
                    this.activeTabs.set(tabId, { injected: true, timestamp: Date.now() });
                    return;
                }
            } catch (pingError) {
                // Ping failed, proceed with injection
                console.log(`No existing automation found in tab ${tabId}, proceeding with injection`);
            }
            
            // Inject content script with individual file injection for better error handling
            const scriptFiles = [
                'lib/stealth-storage.js',
                'lib/stealth-delay.js',
                'lib/personality-engine.js',
                'lib/behavior-simulator.js',
                'lib/adsense-detector.js',
                'lib/mouse-simulator.js',
                'lib/keyboard-simulator.js',
                'lib/reading-simulator.js',
                'lib/navigation-simulator.js',
                'lib/session-manager.js',
                'lib/stealth-monitor.js',
                'lib/analytics-monitor.js',
                'lib/dynamic-adaptation-engine.js',
                'lib/enhanced-fraud-prevention.js',
                'content-script.js'
            ];
            
            for (const scriptFile of scriptFiles) {
                try {
                    await chrome.scripting.executeScript({
                        target: { tabId: tabId },
                        files: [scriptFile]
                    });
                    console.log(`Injected ${scriptFile} into tab ${tabId}`);
                } catch (scriptError) {
                    console.warn(`Failed to inject ${scriptFile} into tab ${tabId}:`, scriptError);
                    // Continue with other scripts
                }
            }
            
            // Mark tab as active
            this.activeTabs.set(tabId, { injected: true, timestamp: Date.now() });
            
            console.log(`Content script injection completed for tab ${tabId} (${tab.url})`);
            
        } catch (error) {
            console.error(`Failed to inject content script into tab ${tabId}:`, error);
            // Don't throw error to prevent service worker failure
        }
    }

    /**
     * Toggle automation for a tab
     */
    async toggleAutomation(tabId) {
        try {
            // Send message to content script
            const response = await chrome.tabs.sendMessage(tabId, { action: 'getStatus' });
            
            if (response.status === 'success') {
                const isRunning = response.data.isRunning;
                
                if (isRunning) {
                    await this.stopAutomation(tabId);
                } else {
                    await this.startAutomation(tabId);
                }
            }
            
        } catch (error) {
            console.error('Failed to toggle automation:', error);
        }
    }

    /**
     * Start automation for a tab
     */
    async startAutomation(tabId, options = {}) {
        try {
            const response = await chrome.tabs.sendMessage(tabId, {
                action: 'startAutomation',
                options: options
            });
            
            if (response.status === 'success') {
                // Update tab status
                const tabInfo = this.activeTabs.get(tabId) || {};
                tabInfo.automationRunning = true;
                this.activeTabs.set(tabId, tabInfo);
                
                // Show notification
                if (this.extensionConfig.notifications) {
                    await this.showNotification({
                        title: 'AdSense Automation Pro',
                        message: 'Automation started successfully',
                        type: 'success'
                    });
                }
                
                return response.result;
            }
            
        } catch (error) {
            console.error('Failed to start automation:', error);
            throw error;
        }
    }

    /**
     * Stop automation for a tab
     */
    async stopAutomation(tabId) {
        try {
            const response = await chrome.tabs.sendMessage(tabId, { action: 'stopAutomation' });
            
            if (response.status === 'success') {
                // Update tab status
                const tabInfo = this.activeTabs.get(tabId) || {};
                tabInfo.automationRunning = false;
                this.activeTabs.set(tabId, tabInfo);
                
                // Show notification
                if (this.extensionConfig.notifications) {
                    await this.showNotification({
                        title: 'AdSense Automation Pro',
                        message: 'Automation stopped',
                        type: 'info'
                    });
                }
            }
            
        } catch (error) {
            console.error('Failed to stop automation:', error);
        }
    }

    /**
     * Get status for all tabs
     */
    async getStatus() {
        const status = {
            extension: {
                version: chrome.runtime.getManifest().version,
                enabled: this.extensionConfig.enabled,
                activeTabs: this.activeTabs.size
            },
            tabs: []
        };
        
        // Get status for each active tab
        for (const [tabId, tabInfo] of this.activeTabs) {
            try {
                const response = await chrome.tabs.sendMessage(parseInt(tabId), { action: 'getStatus' });
                if (response.status === 'success') {
                    status.tabs.push({
                        tabId: parseInt(tabId),
                        ...response.data
                    });
                }
            } catch (error) {
                // Tab might not be available
                console.warn(`Failed to get status for tab ${tabId}:`, error);
            }
        }
        
        return status;
    }

    /**
     * Get metrics for a tab
     */
    async getMetrics(tabId) {
        try {
            const response = await chrome.tabs.sendMessage(tabId, { action: 'getMetrics' });
            return response.status === 'success' ? response.data : null;
        } catch (error) {
            console.error('Failed to get metrics:', error);
            return null;
        }
    }

    /**
     * Export data for a tab
     */
    async exportData(tabId) {
        try {
            const response = await chrome.tabs.sendMessage(tabId, { action: 'exportData' });
            return response.status === 'success' ? response.data : null;
        } catch (error) {
            console.error('Failed to export data:', error);
            return null;
        }
    }

    /**
     * Update configuration
     */
    async updateConfiguration(config) {
        this.extensionConfig = { ...this.extensionConfig, ...config };
        await this.saveConfiguration();
    }

    /**
     * Load configuration
     */
    async loadConfiguration() {
        try {
            if (chrome.storage && chrome.storage.local) {
                const result = await chrome.storage.local.get(['extensionConfig']);
                if (result.extensionConfig) {
                    this.extensionConfig = { ...this.extensionConfig, ...result.extensionConfig };
                }
            }
        } catch (error) {
            console.warn('Failed to load configuration:', error);
            // Use default configuration if loading fails
        }
    }

    /**
     * Save configuration
     */
    async saveConfiguration() {
        try {
            if (chrome.storage && chrome.storage.local) {
                await chrome.storage.local.set({
                    extensionConfig: this.extensionConfig
                });
            }
        } catch (error) {
            console.warn('Failed to save configuration:', error);
        }
    }

    /**
     * Setup default configuration
     */
    async setupDefaultConfiguration() {
        try {
            const defaultConfig = {
                enabled: true,
                autoStart: true,
                notifications: true,
                targetRPM: 0,
                personalityType: 'auto',
                automationLevel: 'medium',
                stealthMode: true
            };
            
            if (chrome.storage && chrome.storage.local) {
                await chrome.storage.local.set({
                    extensionConfig: defaultConfig,
                    automationConfig: defaultConfig
                });
            }
            
            this.extensionConfig = defaultConfig;
        } catch (error) {
            console.warn('Failed to setup default configuration:', error);
            // Use default config even if storage fails
            this.extensionConfig = {
                enabled: true,
                autoStart: false,
                notifications: true,
                targetRPM: 0,
                personalityType: 'auto',
                automationLevel: 'medium',
                stealthMode: true
            };
        }
    }

    /**
     * Handle extension update
     */
    async handleUpdate(details) {
        console.log('AdSense Automation Pro: Extension updated', details);
        
        // Show update notification
        if (this.extensionConfig.notifications) {
            await this.showNotification({
                title: 'AdSense Automation Pro',
                message: `Extension updated to version ${chrome.runtime.getManifest().version}`,
                type: 'info'
            });
        }
    }

    /**
     * Show welcome notification
     */
    async showWelcomeNotification() {
        if (this.extensionConfig.notifications) {
            await this.showNotification({
                title: 'AdSense Automation Pro',
                message: 'Welcome! Click the extension icon to get started.',
                type: 'success'
            });
        }
    }

    /**
     * Show unsupported website message
     */
    async showUnsupportedWebsiteMessage() {
        if (this.extensionConfig.notifications) {
            await this.showNotification({
                title: 'AdSense Automation Pro',
                message: 'This website is not supported for automation.',
                type: 'warning'
            });
        }
    }

    /**
     * Show notification
     */
    async showNotification(notification) {
        if (!this.extensionConfig.notifications) return;
        
        try {
            if (chrome.notifications) {
                await chrome.notifications.create({
                    type: 'basic',
                    iconUrl: chrome.runtime.getURL('icons/icon48.png'),
                    title: notification.title || 'AdSense Automation Pro',
                    message: notification.message || 'Notification'
                });
            }
        } catch (error) {
            console.warn('Failed to show notification:', error);
        }
    }

    /**
     * Get extension information
     */
    getExtensionInfo() {
        const manifest = chrome.runtime.getManifest();
        return {
            name: manifest.name,
            version: manifest.version,
            description: manifest.description,
            permissions: manifest.permissions
        };
    }

    /**
     * Get tab information for debugging
     */
    async getTabInfo(tabId) {
        try {
            const tab = await chrome.tabs.get(tabId);
            return {
                id: tab.id,
                url: tab.url,
                title: tab.title,
                status: tab.status,
                isSupported: this.isSupportedWebsite(tab.url)
            };
        } catch (error) {
            console.error(`Failed to get tab info for ${tabId}:`, error);
            return null;
        }
    }

    /**
     * Log supported/unsupported tabs for debugging
     */
    async logTabStatus() {
        try {
            const tabs = await chrome.tabs.query({});
            console.log(`\n=== Tab Status Report ===`);
            console.log(`Total tabs: ${tabs.length}`);
            
            let supportedCount = 0;
            let unsupportedCount = 0;
            
            for (const tab of tabs) {
                if (tab.url && this.isSupportedWebsite(tab.url)) {
                    supportedCount++;
                    console.log(`✅ Tab ${tab.id}: ${tab.url} (Supported)`);
                } else if (tab.url) {
                    unsupportedCount++;
                    console.log(`❌ Tab ${tab.id}: ${tab.url} (Not Supported)`);
                }
            }
            
            console.log(`\nSummary: ${supportedCount} supported, ${unsupportedCount} unsupported`);
            console.log(`========================\n`);
        } catch (error) {
            console.error('Failed to log tab status:', error);
        }
    }
}

// Initialize background manager
const backgroundManager = new BackgroundManager();

// Initialize immediately for service worker
backgroundManager.initialize();
