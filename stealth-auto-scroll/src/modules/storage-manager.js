/**
 * Storage Manager Module - Stealth Extension
 * Handles data storage and retrieval for user preferences and settings
 */

class StorageManagerModule {
  constructor() {
    this.storageKey = 'stealth_scroll_data';
    this.defaultSettings = {
      scrollBehavior: {
        scrollStep: { min: 50, max: 200 },
        scrollDelay: { min: 100, max: 500 },
        pauseChance: 0.1,
        pauseDuration: { min: 1000, max: 3000 },
        directionChangeChance: 0.05,
        maxScrollDistance: 10000
      },
      sitePreferences: {
        // Site-specific settings
        'amazon.com': { pattern: 'shopping', riskLevel: 'medium' },
        'shopee.co.id': { pattern: 'shopping', riskLevel: 'high' },
        'lazada.co.id': { pattern: 'shopping', riskLevel: 'medium' },
        'facebook.com': { pattern: 'social', riskLevel: 'medium' },
        'twitter.com': { pattern: 'social', riskLevel: 'low' },
        'instagram.com': { pattern: 'social', riskLevel: 'medium' },
        'wikipedia.org': { pattern: 'reading', riskLevel: 'low' },
        'medium.com': { pattern: 'reading', riskLevel: 'low' }
      },
      userPreferences: {
        autoStart: false,
        showNotifications: true,
        enableStealthMode: true,
        enableRiskAdaptation: true,
        enableSiteSpecificBehavior: true,
        enableHumanLikeBehavior: true
      },
      statistics: {
        totalScrollTime: 0,
        totalScrollDistance: 0,
        sitesVisited: [],
        lastUsed: null,
        usageCount: 0
      }
    };
    
    this.cache = new Map();
    this.init();
  }

  /**
   * Initialize storage manager
   */
  async init() {
    try {
      await this.loadData();
      console.log('Storage Manager initialized');
    } catch (error) {
      console.error('Failed to initialize storage manager:', error);
      this.data = { ...this.defaultSettings };
    }
  }

  /**
   * Load data from storage
   */
  async loadData() {
    try {
      const result = await chrome.storage.local.get([this.storageKey]);
      this.data = result[this.storageKey] || { ...this.defaultSettings };
      
      // Merge with default settings to ensure all properties exist
      this.data = this.mergeWithDefaults(this.data, this.defaultSettings);
      
      // Cache the data
      this.cache.set(this.storageKey, this.data);
      
      return this.data;
    } catch (error) {
      console.error('Failed to load data:', error);
      this.data = { ...this.defaultSettings };
      return this.data;
    }
  }

  /**
   * Save data to storage
   */
  async saveData() {
    try {
      const dataToSave = { [this.storageKey]: this.data };
      await chrome.storage.local.set(dataToSave);
      
      // Update cache
      this.cache.set(this.storageKey, this.data);
      
      console.log('Data saved successfully');
      return true;
    } catch (error) {
      console.error('Failed to save data:', error);
      return false;
    }
  }

  /**
   * Get specific setting
   */
  getSetting(path) {
    const keys = path.split('.');
    let value = this.data;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return null;
      }
    }
    
    return value;
  }

  /**
   * Set specific setting
   */
  async setSetting(path, value) {
    const keys = path.split('.');
    let current = this.data;
    
    // Navigate to the parent object
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    
    // Set the value
    const lastKey = keys[keys.length - 1];
    current[lastKey] = value;
    
    // Save to storage
    await this.saveData();
    
    return true;
  }

  /**
   * Get scroll behavior settings
   */
  getScrollBehavior() {
    return this.getSetting('scrollBehavior') || this.defaultSettings.scrollBehavior;
  }

  /**
   * Set scroll behavior settings
   */
  async setScrollBehavior(behavior) {
    return await this.setSetting('scrollBehavior', behavior);
  }

  /**
   * Get site-specific preferences
   */
  getSitePreferences(domain) {
    const sitePrefs = this.getSetting('sitePreferences') || {};
    return sitePrefs[domain] || null;
  }

  /**
   * Set site-specific preferences
   */
  async setSitePreferences(domain, preferences) {
    const sitePrefs = this.getSetting('sitePreferences') || {};
    sitePrefs[domain] = preferences;
    return await this.setSetting('sitePreferences', sitePrefs);
  }

  /**
   * Get user preferences
   */
  getUserPreferences() {
    return this.getSetting('userPreferences') || this.defaultSettings.userPreferences;
  }

  /**
   * Set user preferences
   */
  async setUserPreferences(preferences) {
    return await this.setSetting('userPreferences', preferences);
  }

  /**
   * Get statistics
   */
  getStatistics() {
    return this.getSetting('statistics') || this.defaultSettings.statistics;
  }

  /**
   * Update statistics
   */
  async updateStatistics(updates) {
    const stats = this.getStatistics();
    const updatedStats = { ...stats, ...updates };
    return await this.setSetting('statistics', updatedStats);
  }

  /**
   * Record site visit
   */
  async recordSiteVisit(domain) {
    const stats = this.getStatistics();
    const sitesVisited = stats.sitesVisited || [];
    
    if (!sitesVisited.includes(domain)) {
      sitesVisited.push(domain);
    }
    
    await this.updateStatistics({
      sitesVisited,
      lastUsed: new Date().toISOString(),
      usageCount: (stats.usageCount || 0) + 1
    });
  }

  /**
   * Record scroll activity
   */
  async recordScrollActivity(distance, time) {
    const stats = this.getStatistics();
    await this.updateStatistics({
      totalScrollDistance: (stats.totalScrollDistance || 0) + distance,
      totalScrollTime: (stats.totalScrollTime || 0) + time
    });
  }

  /**
   * Export data
   */
  exportData() {
    return JSON.stringify(this.data, null, 2);
  }

  /**
   * Import data
   */
  async importData(jsonData) {
    try {
      const importedData = JSON.parse(jsonData);
      this.data = this.mergeWithDefaults(importedData, this.defaultSettings);
      await this.saveData();
      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }

  /**
   * Reset to default settings
   */
  async resetToDefaults() {
    this.data = { ...this.defaultSettings };
    await this.saveData();
    return true;
  }

  /**
   * Clear all data
   */
  async clearAllData() {
    try {
      await chrome.storage.local.remove([this.storageKey]);
      this.data = { ...this.defaultSettings };
      this.cache.clear();
      return true;
    } catch (error) {
      console.error('Failed to clear data:', error);
      return false;
    }
  }

  /**
   * Get storage usage
   */
  async getStorageUsage() {
    try {
      const result = await chrome.storage.local.getBytesInUse([this.storageKey]);
      return result;
    } catch (error) {
      console.error('Failed to get storage usage:', error);
      return 0;
    }
  }

  /**
   * Merge imported data with defaults
   */
  mergeWithDefaults(data, defaults) {
    const merged = { ...defaults };
    
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        if (typeof data[key] === 'object' && data[key] !== null && !Array.isArray(data[key])) {
          merged[key] = this.mergeWithDefaults(data[key], defaults[key] || {});
        } else {
          merged[key] = data[key];
        }
      }
    }
    
    return merged;
  }

  /**
   * Validate data structure
   */
  validateData(data) {
    const requiredKeys = ['scrollBehavior', 'sitePreferences', 'userPreferences', 'statistics'];
    
    for (const key of requiredKeys) {
      if (!(key in data)) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Get cached data
   */
  getCachedData() {
    return this.cache.get(this.storageKey) || this.data;
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get all data
   */
  getAllData() {
    return this.data;
  }
}

// Export for use in main script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageManagerModule;
} else {
  window.StorageManagerModule = StorageManagerModule;
}
