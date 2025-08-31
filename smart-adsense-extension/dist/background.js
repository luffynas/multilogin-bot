/**
 * Smart AdSense Pro - Background Service Worker
 * Mengatur ekstensi saat diaktifkan dan mengelola komunikasi antar komponen
 */

class SmartAdSenseBackground {
    constructor() {
        this.isActive = false;
        this.config = {
            enabled: true,
            autoStart: true,
            maxPostsPerSession: 5,
            readingTimeRange: { min: 2, max: 5 }, // menit
            maxAdClicksPerSession: 1,
            stealthMode: true
        };
        
        this.sessionData = {
            startTime: null,
            postsRead: 0,
            adClicks: 0,
            currentUrl: null
        };
        
        this.init();
    }

    async init() {
        // Load saved configuration
        await this.loadConfig();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Auto start jika diaktifkan
        if (this.config.autoStart) {
            this.startExtension();
        }
        
        console.log('🟢 Smart AdSense Pro Background Service Ready');
    }

    async loadConfig() {
        try {
            const saved = await chrome.storage.local.get(['smartAdSenseConfig']);
            if (saved.smartAdSenseConfig) {
                this.config = { ...this.config, ...saved.smartAdSenseConfig };
            }
        } catch (error) {
            console.error('Error loading config:', error);
        }
    }

    async saveConfig() {
        try {
            await chrome.storage.local.set({ smartAdSenseConfig: this.config });
        } catch (error) {
            console.error('Error saving config:', error);
        }
    }

    setupEventListeners() {
        // Listen for messages from content scripts
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            this.handleMessage(message, sender, sendResponse);
            return true; // Keep message channel open for async response
        });

        // Listen for tab updates
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if (changeInfo.status === 'complete' && tab.url) {
                this.handleTabUpdate(tabId, tab);
            }
        });

        // Listen for extension icon clicks
        chrome.action.onClicked.addListener((tab) => {
            this.toggleExtension(tab);
        });
    }

    handleMessage(message, sender, sendResponse) {
        switch (message.action) {
            case 'startAutomation':
                this.startAutomation(sender.tab.id);
                sendResponse({ status: 'started' });
                break;
                
            case 'stopAutomation':
                this.stopAutomation(sender.tab.id);
                sendResponse({ status: 'stopped' });
                break;
                
            case 'updateSession':
                this.updateSession(message.data);
                sendResponse({ status: 'updated' });
                break;
                
            case 'getConfig':
                sendResponse({ config: this.config });
                break;
                
            case 'updateConfig':
                this.config = { ...this.config, ...message.config };
                this.saveConfig();
                sendResponse({ status: 'config_updated' });
                break;
                
            case 'getSessionData':
                sendResponse({ sessionData: this.sessionData });
                break;
                
            default:
                sendResponse({ error: 'Unknown action' });
        }
    }

    handleTabUpdate(tabId, tab) {
        if (this.isActive && tab.url) {
            // Kirim pesan ke content script untuk memulai otomatisasi
            chrome.tabs.sendMessage(tabId, {
                action: 'pageLoaded',
                url: tab.url
            }).catch(() => {
                // Content script belum siap, tunggu sebentar
                setTimeout(() => {
                    chrome.tabs.sendMessage(tabId, {
                        action: 'pageLoaded',
                        url: tab.url
                    }).catch(() => {});
                }, 1000);
            });
        }
    }

    startExtension() {
        this.isActive = true;
        this.sessionData.startTime = Date.now();
        this.sessionData.postsRead = 0;
        this.sessionData.adClicks = 0;
        
        console.log('🚀 Smart AdSense Pro Extension Started');
        
        // Notify all active tabs
        chrome.tabs.query({ active: true }, (tabs) => {
            tabs.forEach(tab => {
                chrome.tabs.sendMessage(tab.id, {
                    action: 'extensionStarted'
                }).catch(() => {});
            });
        });
    }

    stopExtension() {
        this.isActive = false;
        console.log('⏹️ Smart AdSense Pro Extension Stopped');
        
        // Notify all active tabs
        chrome.tabs.query({ active: true }, (tabs) => {
            tabs.forEach(tab => {
                chrome.tabs.sendMessage(tab.id, {
                    action: 'extensionStopped'
                }).catch(() => {});
            });
        });
    }

    toggleExtension(tab) {
        if (this.isActive) {
            this.stopExtension();
        } else {
            this.startExtension();
        }
    }

    startAutomation(tabId) {
        chrome.tabs.sendMessage(tabId, {
            action: 'startAutomation'
        }).catch(() => {});
    }

    stopAutomation(tabId) {
        chrome.tabs.sendMessage(tabId, {
            action: 'stopAutomation'
        }).catch(() => {});
    }

    updateSession(data) {
        this.sessionData = { ...this.sessionData, ...data };
        
        // Check session limits
        if (this.sessionData.postsRead >= this.config.maxPostsPerSession) {
            console.log('📊 Session limit reached - stopping automation');
            this.stopExtension();
        }
        
        if (this.sessionData.adClicks >= this.config.maxAdClicksPerSession) {
            console.log('🖱️ Max ad clicks reached for this session');
        }
    }

    // Utility methods
    getRandomDelay(min, max) {
        return Math.random() * (max - min) + min;
    }

    isAdSenseSite(url) {
        const adSenseDomains = [
            'google.com',
            'googlesyndication.com',
            'doubleclick.net',
            'googleadservices.com'
        ];
        
        return adSenseDomains.some(domain => url.includes(domain));
    }
}

// Initialize background service
const backgroundService = new SmartAdSenseBackground();

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('🎉 Smart AdSense Pro Extension Installed');
        backgroundService.startExtension();
    }
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
    console.log('🔄 Smart AdSense Pro Extension Starting...');
    backgroundService.startExtension();
});
