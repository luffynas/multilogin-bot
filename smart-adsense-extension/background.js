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
            maxAdClicksPerSession: 3,
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
            // Initialize storage service
            this.storageService = new StorageService();
            await this.storageService.init();
            
            // Load configuration using unified storage
            const saved = await this.storageService.get(['smartAdSenseConfig', 'globalVisitedUrls']);
            
            if (saved.smartAdSenseConfig) {
                this.config = { ...this.config, ...saved.smartAdSenseConfig };
                console.log('✅ Configuration loaded from unified storage');
            }
            
            if (saved.globalVisitedUrls) {
                this.globalVisitedUrls = new Set(saved.globalVisitedUrls);
                console.log('📊 Loaded global visited URLs:', this.globalVisitedUrls.size);
            }
            
            // Migrate old localStorage data if needed
            await this.migrateOldData();
            
        } catch (error) {
            console.error('Error loading config:', error);
        }
    }

    async saveConfig() {
        try {
            if (this.storageService) {
                await this.storageService.set('smartAdSenseConfig', this.config);
                await this.storageService.set('globalVisitedUrls', Array.from(this.globalVisitedUrls));
                console.log('✅ Configuration saved to unified storage');
            }
        } catch (error) {
            console.error('Error saving config:', error);
        }
    }

    async migrateOldData() {
        try {
            if (this.storageService) {
                const migratedCount = await this.storageService.migrateFromLocalStorage();
                if (migratedCount > 0) {
                    console.log(`🔄 Migrated ${migratedCount} items from localStorage to unified storage`);
                }
            }
        } catch (error) {
            console.warn('⚠️ Error during data migration:', error);
        }
    }

    async resetSession() {
        try {
            console.log('🔄 Resetting session...');
            
            // Reset session data
            this.sessionData = {
                startTime: Date.now(),
                postsRead: 0,
                adClicks: 0,
                currentUrl: null
            };
            
            // Clear global visited URLs
            this.globalVisitedUrls.clear();
            
            // Save reset state
            await this.saveConfig();
            
            console.log('✅ Session reset completed');
        } catch (error) {
            console.error('❌ Error resetting session:', error);
            throw error;
        }
    }

    async clearStorage() {
        try {
            console.log('🧹 Clearing all storage data...');
            
            if (this.storageService) {
                await this.storageService.clear();
            }
            
            // Clear local data structures
            this.globalVisitedUrls.clear();
            this.sessionData = {
                startTime: Date.now(),
                postsRead: 0,
                adClicks: 0,
                currentUrl: null
            };
            
            console.log('✅ Storage cleared successfully');
        } catch (error) {
            console.error('❌ Error clearing storage:', error);
            throw error;
        }
    }

    async getStorageInfo() {
        try {
            if (this.storageService) {
                return await this.storageService.getStorageInfo();
            } else {
                return {
                    type: 'unknown',
                    keyCount: 0,
                    totalSize: 0,
                    available: false,
                    error: 'Storage service not initialized'
                };
            }
        } catch (error) {
            console.error('❌ Error getting storage info:', error);
            return {
                type: 'error',
                keyCount: 0,
                totalSize: 0,
                available: false,
                error: error.message
            };
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
                // This functionality is now handled by navigation engine
                sendResponse({ status: 'deprecated', message: 'Use navigation engine methods instead' });
                break;
                
            case 'isUrlVisited':
                // This functionality is now handled by navigation engine
                sendResponse({ status: 'deprecated', message: 'Use navigation engine methods instead' });
                break;
                
            case 'getGlobalVisitedUrls':
                // This functionality is now handled by navigation engine
                sendResponse({ status: 'deprecated', message: 'Use navigation engine methods instead' });
                break;
                
            case 'resetGlobalVisitedUrls':
                // This functionality is now handled by navigation engine
                sendResponse({ status: 'deprecated', message: 'Use navigation engine methods instead' });
                break;
                
            case 'resetSession':
                this.resetSession().then(() => {
                    sendResponse({ status: 'reset' });
                }).catch(error => {
                    sendResponse({ status: 'error', message: error.message });
                });
                break;
                
            case 'clearStorage':
                this.clearStorage().then(() => {
                    sendResponse({ status: 'cleared' });
                }).catch(error => {
                    sendResponse({ status: 'error', message: error.message });
                });
                break;
                
            case 'getStorageInfo':
                this.getStorageInfo().then(storageInfo => {
                    sendResponse({ storageInfo: storageInfo });
                }).catch(error => {
                    sendResponse({ status: 'error', message: error.message });
                });
                break;
                
            case 'migrateStorage':
                this.migrateOldData().then(() => {
                    sendResponse({ status: 'migrated' });
                }).catch(error => {
                    sendResponse({ status: 'error', message: error.message });
                });
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

    startExtension() {
        this.isActive = true;
        console.log('🟢 Smart AdSense Pro Extension Started');
        
        // Send message to all active tabs
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
        console.log('🔴 Smart AdSense Pro Extension Stopped');
        
        // Send message to all active tabs
        chrome.tabs.query({ active: true }, (tabs) => {
            tabs.forEach(tab => {
                chrome.tabs.sendMessage(tab.id, {
                    action: 'extensionStopped'
                }).catch(() => {});
            });
        });
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
        console.warn('addGlobalVisitedUrl is deprecated - use navigation engine methods instead');
        return false;
    }

    isGlobalUrlVisited(url) {
        if (!url || typeof url !== 'string') return false;
        
        console.warn('isGlobalUrlVisited is deprecated - use navigation engine methods instead');
        return false;

    }

    resetGlobalVisitedUrls() {
        console.warn('resetGlobalVisitedUrls is deprecated - use navigation engine methods instead');
    }

    shouldResetGlobalSession() {
        console.warn('shouldResetGlobalSession is deprecated - use navigation engine methods instead');
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
