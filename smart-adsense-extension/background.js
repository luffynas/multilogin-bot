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
        
        // Global visited URLs tracking
        this.globalVisitedUrls = new Set();
        this.maxPostsPerSession = 5;
        
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
            const saved = await chrome.storage.local.get(['smartAdSenseConfig', 'globalVisitedUrls']);
            if (saved.smartAdSenseConfig) {
                this.config = { ...this.config, ...saved.smartAdSenseConfig };
            }
            if (saved.globalVisitedUrls) {
                this.globalVisitedUrls = new Set(saved.globalVisitedUrls);
                console.log('📊 Loaded global visited URLs:', this.globalVisitedUrls.size);
            }
        } catch (error) {
            console.error('Error loading config:', error);
        }
    }

    async saveConfig() {
        try {
            await chrome.storage.local.set({ 
                smartAdSenseConfig: this.config,
                globalVisitedUrls: Array.from(this.globalVisitedUrls)
            });
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
                
            case 'addVisitedUrl':
                this.addGlobalVisitedUrl(message.url);
                sendResponse({ status: 'url_added' });
                break;
                
            case 'isUrlVisited':
                const isVisited = this.isGlobalUrlVisited(message.url);
                sendResponse({ isVisited: isVisited });
                break;
                
            case 'getGlobalVisitedUrls':
                sendResponse({ 
                    visitedUrls: Array.from(this.globalVisitedUrls),
                    count: this.globalVisitedUrls.size,
                    maxPosts: this.maxPostsPerSession
                });
                break;
                
            case 'resetGlobalVisitedUrls':
                this.resetGlobalVisitedUrls();
                sendResponse({ status: 'reset_complete' });
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

    // Global URL tracking methods
    addGlobalVisitedUrl(url) {
        if (url && typeof url === 'string') {
            this.globalVisitedUrls.add(url);
            console.log('📝 Added to global visited URLs:', url);
            console.log('📊 Total global visited URLs:', this.globalVisitedUrls.size);
            
            // Save to storage
            this.saveConfig();
        }
    }

    isGlobalUrlVisited(url) {
        if (!url || typeof url !== 'string') return false;
        
        // Check exact match
        if (this.globalVisitedUrls.has(url)) {
            return true;
        }
        
        // Check without hash fragments
        try {
            const urlObj = new URL(url);
            const urlWithoutHash = urlObj.origin + urlObj.pathname + urlObj.search;
            
            for (const visitedUrl of this.globalVisitedUrls) {
                const visitedUrlObj = new URL(visitedUrl);
                const visitedWithoutHash = visitedUrlObj.origin + visitedUrlObj.pathname + visitedUrlObj.search;
                
                if (urlWithoutHash === visitedWithoutHash) {
                    return true;
                }
            }
        } catch (error) {
            console.warn('Error checking global visited URL:', error);
        }
        
        return false;
    }

    resetGlobalVisitedUrls() {
        this.globalVisitedUrls.clear();
        console.log('🔄 Global visited URLs reset');
        this.saveConfig();
    }

    shouldResetGlobalSession() {
        const visitedCount = this.globalVisitedUrls.size;
        const maxPosts = this.maxPostsPerSession;
        
        // Only reset when we've reached the maximum posts limit
        if (visitedCount >= maxPosts) {
            console.log('🔄 Global session limit reached, should reset');
            return true;
        }
        
        // Don't reset just because we're near the limit
        // This prevents premature resets that could cause URL revisiting
        console.log(`📊 Global session progress: ${visitedCount}/${maxPosts} (${Math.round(visitedCount/maxPosts*100)}%)`);
        
        return false;
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
