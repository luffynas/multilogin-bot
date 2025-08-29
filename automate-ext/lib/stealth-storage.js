/**
 * Stealth Storage - Secure storage system using localStorage to avoid chrome.storage detection
 */

class StealthStorage {
    constructor() {
        this.prefix = '_stealth_';
        this.encryptionKey = this.generateEncryptionKey();
        this.compressionEnabled = true;
        this.maxStorageSize = 5 * 1024 * 1024; // 5MB limit
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

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StealthStorage;
} else if (typeof window !== 'undefined' && !window._stealth_storage) {
    // Use stealth naming to avoid detection
    window._stealth_storage = StealthStorage;
}
