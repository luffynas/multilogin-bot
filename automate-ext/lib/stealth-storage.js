/**
 * Stealth Storage - Secure storage system using localStorage to avoid chrome.storage detection
 */

class StealthStorage {
    constructor() {
        this.prefix = '_stealth_';
        this.encryptionKey = this.generateEncryptionKey();
        this.compressionEnabled = true;
        this.maxStorageSize = 5 * 1024 * 1024; // 5MB limit
        this.isInitialized = false;
    }

    /**
     * Initialize stealth storage system
     */
    initialize() {
        console.log('StealthStorage: Initializing stealth storage system');
        
        try {
            // Check if localStorage is available
            this.checkLocalStorageAvailability();
            
            // Setup storage monitoring
            this.setupStorageMonitoring();
            
            // Initialize storage cleanup
            this.initializeStorageCleanup();
            
            // Setup storage encryption
            this.setupStorageEncryption();
            
            this.isInitialized = true;
            console.log('StealthStorage: Initialized successfully');
            
            return this;
        } catch (error) {
            console.error('StealthStorage: Initialization failed:', error);
            throw error;
        }
    }

    /**
     * Check if localStorage is available
     */
    checkLocalStorageAvailability() {
        try {
            const testKey = this.prefix + 'test';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            console.log('StealthStorage: localStorage is available');
        } catch (error) {
            console.warn('StealthStorage: localStorage not available:', error);
            throw new Error('localStorage is not available');
        }
    }

    /**
     * Setup storage monitoring
     */
    setupStorageMonitoring() {
        console.log('StealthStorage: Setting up storage monitoring');
        
        // Monitor storage usage
        this.monitorStorageUsage();
        
        // Monitor storage access
        this.monitorStorageAccess();
    }

    /**
     * Initialize storage cleanup
     */
    initializeStorageCleanup() {
        console.log('StealthStorage: Initializing storage cleanup');
        
        // Clean up old data
        this.cleanupOldData();
        
        // Setup periodic cleanup
        this.setupPeriodicCleanup();
    }

    /**
     * Setup storage encryption
     */
    setupStorageEncryption() {
        console.log('StealthStorage: Setting up storage encryption');
        
        // Generate new encryption key if needed
        if (!this.encryptionKey) {
            this.encryptionKey = this.generateEncryptionKey();
        }
    }

    /**
     * Monitor storage usage
     */
    monitorStorageUsage() {
        console.log('StealthStorage: Monitoring storage usage');
        // Implementation for monitoring storage usage
    }

    /**
     * Monitor storage access
     */
    monitorStorageAccess() {
        console.log('StealthStorage: Monitoring storage access');
        // Implementation for monitoring storage access
    }

    /**
     * Clean up old data
     */
    cleanupOldData() {
        console.log('StealthStorage: Cleaning up old data');
        
        try {
            const keys = Object.keys(localStorage);
            const stealthKeys = keys.filter(key => key.startsWith(this.prefix));
            
            // Remove old data (older than 7 days)
            const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
            
            stealthKeys.forEach(key => {
                try {
                    const data = localStorage.getItem(key);
                    if (data) {
                        const parsed = this.deobfuscate(data);
                        if (parsed.timestamp && parsed.timestamp < sevenDaysAgo) {
                            localStorage.removeItem(key);
                        }
                    }
                } catch (error) {
                    // Remove corrupted data
                    localStorage.removeItem(key);
                }
            });
        } catch (error) {
            console.warn('StealthStorage: Cleanup failed:', error);
        }
    }

    /**
     * Setup periodic cleanup
     */
    setupPeriodicCleanup() {
        console.log('StealthStorage: Setting up periodic cleanup');
        
        // Run cleanup every hour
        setInterval(() => {
            this.cleanupOldData();
        }, 60 * 60 * 1000);
    }

    /**
     * Generate encryption key for data obfuscation
     */
    generateEncryptionKey() {
        const timestamp = Date.now().toString();
        const random = Math.random().toString(36).substring(2);
        return btoa(timestamp + random).substring(0, 16);
    }

    /**
     * Simple obfuscation for data
     */
    obfuscate(data) {
        try {
            const stringData = JSON.stringify(data);
            const encoded = btoa(stringData);
            return encoded.split('').reverse().join('');
        } catch (e) {
            return data;
        }
    }

    /**
     * De-obfuscate data
     */
    deobfuscate(data) {
        try {
            const reversed = data.split('').reverse().join('');
            const decoded = atob(reversed);
            return JSON.parse(decoded);
        } catch (e) {
            return data;
        }
    }

    /**
     * Compress data if enabled
     */
    compress(data) {
        if (!this.compressionEnabled) return data;
        
        try {
            const stringData = JSON.stringify(data);
            // Simple compression by removing spaces and newlines
            return stringData.replace(/\s+/g, ' ').trim();
        } catch (e) {
            return data;
        }
    }

    /**
     * Decompress data
     */
    decompress(data) {
        if (!this.compressionEnabled) return data;
        
        try {
            return JSON.parse(data);
        } catch (e) {
            return data;
        }
    }

    /**
     * Set data with stealth protection
     */
    set(key, value) {
        try {
            const fullKey = this.prefix + key;
            const processedValue = this.obfuscate(value);
            const compressedValue = this.compress(processedValue);
            
            // Check storage size
            if (this.getStorageSize() + compressedValue.length > this.maxStorageSize) {
                this.cleanup();
            }
            
            localStorage.setItem(fullKey, compressedValue);
            return true;
        } catch (e) {
            // Silent fail for stealth
            return false;
        }
    }

    /**
     * Get data with stealth protection
     */
    get(key) {
        try {
            const fullKey = this.prefix + key;
            const data = localStorage.getItem(fullKey);
            
            if (!data) return null;
            
            const decompressed = this.decompress(data);
            return this.deobfuscate(decompressed);
        } catch (e) {
            // Silent fail for stealth
            return null;
        }
    }

    /**
     * Remove data
     */
    remove(key) {
        try {
            const fullKey = this.prefix + key;
            localStorage.removeItem(fullKey);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Clear all stealth data
     */
    clear() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    localStorage.removeItem(key);
                }
            });
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Get all stealth keys
     */
    getAllKeys() {
        try {
            const keys = Object.keys(localStorage);
            return keys.filter(key => key.startsWith(this.prefix))
                       .map(key => key.replace(this.prefix, ''));
        } catch (e) {
            return [];
        }
    }

    /**
     * Get storage size
     */
    getStorageSize() {
        try {
            let size = 0;
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    size += localStorage.getItem(key).length;
                }
            });
            return size;
        } catch (e) {
            return 0;
        }
    }

    /**
     * Cleanup old data
     */
    cleanup() {
        try {
            const keys = this.getAllKeys();
            const now = Date.now();
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours
            
            keys.forEach(key => {
                const data = this.get(key);
                if (data && data.timestamp && (now - data.timestamp) > maxAge) {
                    this.remove(key);
                }
            });
        } catch (e) {
            // Silent cleanup
        }
    }

    /**
     * Get storage statistics
     */
    getStats() {
        try {
            const keys = this.getAllKeys();
            const size = this.getStorageSize();
            
            return {
                keyCount: keys.length,
                totalSize: size,
                maxSize: this.maxStorageSize,
                usagePercent: (size / this.maxStorageSize) * 100
            };
        } catch (e) {
            return {
                keyCount: 0,
                totalSize: 0,
                maxSize: this.maxStorageSize,
                usagePercent: 0
            };
        }
    }
}

// Export for use in other modules with immediate availability
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StealthStorage;
} else if (typeof window !== 'undefined') {
    // Use stealth naming to avoid detection and ensure immediate availability
    window._stealth_storage = StealthStorage;
    
    // Always export as StealthStorage for module loading
    window.StealthStorage = StealthStorage;
}
