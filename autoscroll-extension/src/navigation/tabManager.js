/**
 * Tab manager for controlling tab operations and navigation
 */

import { createLogger } from '@utils/logger.js';
import { randFloat, randInt, choice } from '@core/randomizer.js';

const logger = createLogger('tab-manager');

/**
 * Tab Manager
 * Manages tab operations and navigation
 */
export class TabManager {
  constructor() {
    this.isActive = false;
    this.config = {
      enabled: true,
      maxTabs: 10,
      tabTimeout: 30000, // 30 seconds
      navigationDelay: { minMs: 1000, maxMs: 3000 },
      tabSwitching: {
        enabled: true,
        probability: 0.1,
        delay: { minMs: 500, maxMs: 2000 }
      },
      tabClosing: {
        enabled: true,
        probability: 0.05,
        delay: { minMs: 1000, maxMs: 5000 }
      },
      tabCreation: {
        enabled: true,
        probability: 0.2,
        delay: { minMs: 2000, maxMs: 8000 }
      }
    };
    
    this.stats = {
      totalTabsCreated: 0,
      totalTabsClosed: 0,
      totalTabsSwitched: 0,
      currentTabCount: 0,
      lastTabOperation: null,
      errors: 0
    };
    
    this.tabs = new Map();
    this.currentTabId = null;
    this.eventListeners = new Map();
  }

  /**
   * Initialize tab manager
   * @param {Object} config - Configuration object
   * @returns {Promise<boolean>} - Success status
   */
  async initialize(config = {}) {
    try {
      this.config = { ...this.config, ...config };
      
      // Validate configuration
      if (!this.validateConfig()) {
        logger.error('Invalid tab manager configuration');
        return false;
      }
      
      // Set up event listeners
      this.setupEventListeners();
      
      logger.info('Tab manager initialized', { config: this.config });
      return true;
    } catch (error) {
      logger.error('Error initializing tab manager', { error });
      return false;
    }
  }

  /**
   * Start tab manager
   * @returns {Promise<boolean>} - Success status
   */
  async start() {
    try {
      if (this.isActive) {
        logger.warn('Tab manager already active');
        return false;
      }

      this.isActive = true;
      
      // Get current tab information
      await this.updateCurrentTab();
      
      logger.info('Tab manager started');
      return true;
    } catch (error) {
      logger.error('Error starting tab manager', { error });
      return false;
    }
  }

  /**
   * Stop tab manager
   * @returns {Promise<boolean>} - Success status
   */
  async stop() {
    try {
      if (!this.isActive) {
        logger.warn('Tab manager not active');
        return false;
      }

      this.isActive = false;
      
      // Remove event listeners
      this.removeEventListeners();
      
      logger.info('Tab manager stopped');
      return true;
    } catch (error) {
      logger.error('Error stopping tab manager', { error });
      return false;
    }
  }

  /**
   * Create new tab
   * @param {string} url - URL to open in new tab
   * @param {Object} options - Tab creation options
   * @returns {Promise<Object|null>} - Created tab object or null
   */
  async createTab(url, options = {}) {
    try {
      if (!this.isActive) {
        logger.warn('Tab manager not active');
        return null;
      }
      
      // Check tab limit
      if (this.stats.currentTabCount >= this.config.maxTabs) {
        logger.warn('Maximum tab limit reached');
        return null;
      }
      
      // Check creation probability
      if (Math.random() > this.config.tabCreation.probability) {
        logger.debug('Tab creation skipped by probability');
        return null;
      }
      
      // Generate creation delay
      const delay = randInt(
        this.config.tabCreation.delay.minMs,
        this.config.tabCreation.delay.maxMs
      );
      
      await this.sleep(delay);
      
      // Create tab
      const tab = await this.createTabInternal(url, options);
      if (!tab) {
        logger.warn('Failed to create tab');
        return null;
      }
      
      // Update statistics
      this.stats.totalTabsCreated++;
      this.stats.currentTabCount++;
      this.stats.lastTabOperation = Date.now();
      
      // Store tab information
      this.tabs.set(tab.id, {
        id: tab.id,
        url: tab.url,
        title: tab.title,
        created: Date.now(),
        lastAccessed: Date.now(),
        options: options
      });
      
      logger.info('Tab created', { 
        id: tab.id, 
        url: tab.url, 
        title: tab.title 
      });
      
      // Emit event
      this.emit('tabCreated', { tab });
      
      return tab;
    } catch (error) {
      logger.error('Error creating tab', { error, url });
      this.stats.errors++;
      return null;
    }
  }

  /**
   * Create tab internally
   * @param {string} url - URL to open
   * @param {Object} options - Tab options
   * @returns {Promise<Object|null>} - Created tab or null
   */
  async createTabInternal(url, options) {
    try {
      // Use Chrome extension API if available
      if (typeof chrome !== 'undefined' && chrome.tabs) {
        return new Promise((resolve) => {
          chrome.tabs.create({
            url: url,
            active: options.active !== false,
            ...options
          }, (tab) => {
            if (chrome.runtime.lastError) {
              logger.error('Chrome tabs API error', { error: chrome.runtime.lastError });
              resolve(null);
            } else {
              resolve(tab);
            }
          });
        });
      }
      
      // Fallback to window.open
      const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
      if (!newWindow) {
        logger.warn('Failed to open new window');
        return null;
      }
      
      // Create mock tab object
      const mockTab = {
        id: Date.now(),
        url: url,
        title: 'New Tab',
        active: true,
        windowId: 1
      };
      
      return mockTab;
    } catch (error) {
      logger.error('Error creating tab internally', { error });
      return null;
    }
  }

  /**
   * Close tab
   * @param {number} tabId - Tab ID to close
   * @returns {Promise<boolean>} - Success status
   */
  async closeTab(tabId) {
    try {
      if (!this.isActive) {
        logger.warn('Tab manager not active');
        return false;
      }
      
      // Check closing probability
      if (Math.random() > this.config.tabClosing.probability) {
        logger.debug('Tab closing skipped by probability');
        return false;
      }
      
      // Generate closing delay
      const delay = randInt(
        this.config.tabClosing.delay.minMs,
        this.config.tabClosing.delay.maxMs
      );
      
      await this.sleep(delay);
      
      // Close tab
      const success = await this.closeTabInternal(tabId);
      if (!success) {
        logger.warn('Failed to close tab', { tabId });
        return false;
      }
      
      // Update statistics
      this.stats.totalTabsClosed++;
      this.stats.currentTabCount = Math.max(0, this.stats.currentTabCount - 1);
      this.stats.lastTabOperation = Date.now();
      
      // Remove tab from tracking
      this.tabs.delete(tabId);
      
      logger.info('Tab closed', { tabId });
      
      // Emit event
      this.emit('tabClosed', { tabId });
      
      return true;
    } catch (error) {
      logger.error('Error closing tab', { error, tabId });
      this.stats.errors++;
      return false;
    }
  }

  /**
   * Close tab internally
   * @param {number} tabId - Tab ID to close
   * @returns {Promise<boolean>} - Success status
   */
  async closeTabInternal(tabId) {
    try {
      // Use Chrome extension API if available
      if (typeof chrome !== 'undefined' && chrome.tabs) {
        return new Promise((resolve) => {
          chrome.tabs.remove(tabId, () => {
            if (chrome.runtime.lastError) {
              logger.error('Chrome tabs API error', { error: chrome.runtime.lastError });
              resolve(false);
            } else {
              resolve(true);
            }
          });
        });
      }
      
      // Fallback - can't close tabs from content script
      logger.warn('Cannot close tabs from content script');
      return false;
    } catch (error) {
      logger.error('Error closing tab internally', { error });
      return false;
    }
  }

  /**
   * Switch to tab
   * @param {number} tabId - Tab ID to switch to
   * @returns {Promise<boolean>} - Success status
   */
  async switchToTab(tabId) {
    try {
      if (!this.isActive) {
        logger.warn('Tab manager not active');
        return false;
      }
      
      // Check switching probability
      if (Math.random() > this.config.tabSwitching.probability) {
        logger.debug('Tab switching skipped by probability');
        return false;
      }
      
      // Generate switching delay
      const delay = randInt(
        this.config.tabSwitching.delay.minMs,
        this.config.tabSwitching.delay.maxMs
      );
      
      await this.sleep(delay);
      
      // Switch to tab
      const success = await this.switchToTabInternal(tabId);
      if (!success) {
        logger.warn('Failed to switch to tab', { tabId });
        return false;
      }
      
      // Update statistics
      this.stats.totalTabsSwitched++;
      this.stats.lastTabOperation = Date.now();
      this.currentTabId = tabId;
      
      // Update tab last accessed time
      if (this.tabs.has(tabId)) {
        this.tabs.get(tabId).lastAccessed = Date.now();
      }
      
      logger.info('Switched to tab', { tabId });
      
      // Emit event
      this.emit('tabSwitched', { tabId });
      
      return true;
    } catch (error) {
      logger.error('Error switching to tab', { error, tabId });
      this.stats.errors++;
      return false;
    }
  }

  /**
   * Switch to tab internally
   * @param {number} tabId - Tab ID to switch to
   * @returns {Promise<boolean>} - Success status
   */
  async switchToTabInternal(tabId) {
    try {
      // Use Chrome extension API if available
      if (typeof chrome !== 'undefined' && chrome.tabs) {
        return new Promise((resolve) => {
          chrome.tabs.update(tabId, { active: true }, (tab) => {
            if (chrome.runtime.lastError) {
              logger.error('Chrome tabs API error', { error: chrome.runtime.lastError });
              resolve(false);
            } else {
              resolve(true);
            }
          });
        });
      }
      
      // Fallback - can't switch tabs from content script
      logger.warn('Cannot switch tabs from content script');
      return false;
    } catch (error) {
      logger.error('Error switching to tab internally', { error });
      return false;
    }
  }

  /**
   * Navigate to URL in current tab
   * @param {string} url - URL to navigate to
   * @returns {Promise<boolean>} - Success status
   */
  async navigateToUrl(url) {
    try {
      if (!this.isActive) {
        logger.warn('Tab manager not active');
        return false;
      }
      
      // Generate navigation delay
      const delay = randInt(
        this.config.navigationDelay.minMs,
        this.config.navigationDelay.maxMs
      );
      
      await this.sleep(delay);
      
      // Navigate to URL
      const success = await this.navigateToUrlInternal(url);
      if (!success) {
        logger.warn('Failed to navigate to URL', { url });
        return false;
      }
      
      logger.info('Navigated to URL', { url });
      
      // Emit event
      this.emit('urlNavigated', { url });
      
      return true;
    } catch (error) {
      logger.error('Error navigating to URL', { error, url });
      this.stats.errors++;
      return false;
    }
  }

  /**
   * Navigate to URL internally
   * @param {string} url - URL to navigate to
   * @returns {Promise<boolean>} - Success status
   */
  async navigateToUrlInternal(url) {
    try {
      // Use Chrome extension API if available
      if (typeof chrome !== 'undefined' && chrome.tabs) {
        return new Promise((resolve) => {
          chrome.tabs.update({ url: url }, (tab) => {
            if (chrome.runtime.lastError) {
              logger.error('Chrome tabs API error', { error: chrome.runtime.lastError });
              resolve(false);
            } else {
              resolve(true);
            }
          });
        });
      }
      
      // Fallback to window.location
      window.location.href = url;
      return true;
    } catch (error) {
      logger.error('Error navigating to URL internally', { error });
      return false;
    }
  }

  /**
   * Get current tab information
   * @returns {Promise<Object|null>} - Current tab object or null
   */
  async getCurrentTab() {
    try {
      // Use Chrome extension API if available
      if (typeof chrome !== 'undefined' && chrome.tabs) {
        return new Promise((resolve) => {
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (chrome.runtime.lastError) {
              logger.error('Chrome tabs API error', { error: chrome.runtime.lastError });
              resolve(null);
            } else {
              resolve(tabs[0] || null);
            }
          });
        });
      }
      
      // Fallback - create mock tab object
      const mockTab = {
        id: Date.now(),
        url: window.location.href,
        title: document.title,
        active: true,
        windowId: 1
      };
      
      return mockTab;
    } catch (error) {
      logger.error('Error getting current tab', { error });
      return null;
    }
  }

  /**
   * Get all tabs
   * @returns {Promise<Array>} - Array of tab objects
   */
  async getAllTabs() {
    try {
      // Use Chrome extension API if available
      if (typeof chrome !== 'undefined' && chrome.tabs) {
        return new Promise((resolve) => {
          chrome.tabs.query({}, (tabs) => {
            if (chrome.runtime.lastError) {
              logger.error('Chrome tabs API error', { error: chrome.runtime.lastError });
              resolve([]);
            } else {
              resolve(tabs);
            }
          });
        });
      }
      
      // Fallback - return current tab only
      const currentTab = await this.getCurrentTab();
      return currentTab ? [currentTab] : [];
    } catch (error) {
      logger.error('Error getting all tabs', { error });
      return [];
    }
  }

  /**
   * Update current tab information
   * @returns {Promise<boolean>} - Success status
   */
  async updateCurrentTab() {
    try {
      const currentTab = await this.getCurrentTab();
      if (currentTab) {
        this.currentTabId = currentTab.id;
        this.stats.currentTabCount = Math.max(1, this.stats.currentTabCount);
        
        // Update tab in tracking
        this.tabs.set(currentTab.id, {
          id: currentTab.id,
          url: currentTab.url,
          title: currentTab.title,
          created: Date.now(),
          lastAccessed: Date.now(),
          options: {}
        });
        
        logger.debug('Current tab updated', { 
          id: currentTab.id, 
          url: currentTab.url 
        });
      }
      
      return true;
    } catch (error) {
      logger.error('Error updating current tab', { error });
      return false;
    }
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    try {
      // Listen for tab updates
      if (typeof chrome !== 'undefined' && chrome.tabs) {
        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
          if (this.isActive) {
            this.handleTabUpdate(tabId, changeInfo, tab);
          }
        });
        
        chrome.tabs.onActivated.addListener((activeInfo) => {
          if (this.isActive) {
            this.handleTabActivated(activeInfo);
          }
        });
        
        chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
          if (this.isActive) {
            this.handleTabRemoved(tabId, removeInfo);
          }
        });
      }
      
      logger.debug('Event listeners set up');
    } catch (error) {
      logger.error('Error setting up event listeners', { error });
    }
  }

  /**
   * Remove event listeners
   */
  removeEventListeners() {
    try {
      // Chrome extension API doesn't provide a way to remove listeners
      // They will be automatically removed when the extension is unloaded
      logger.debug('Event listeners removed');
    } catch (error) {
      logger.error('Error removing event listeners', { error });
    }
  }

  /**
   * Handle tab update
   * @param {number} tabId - Tab ID
   * @param {Object} changeInfo - Change information
   * @param {Object} tab - Tab object
   */
  handleTabUpdate(tabId, changeInfo, tab) {
    try {
      logger.debug('Tab updated', { tabId, changeInfo, tab });
      
      // Update tab in tracking
      if (this.tabs.has(tabId)) {
        const tabInfo = this.tabs.get(tabId);
        tabInfo.url = tab.url;
        tabInfo.title = tab.title;
        tabInfo.lastAccessed = Date.now();
      }
      
      // Emit event
      this.emit('tabUpdated', { tabId, changeInfo, tab });
    } catch (error) {
      logger.error('Error handling tab update', { error });
    }
  }

  /**
   * Handle tab activated
   * @param {Object} activeInfo - Active tab information
   */
  handleTabActivated(activeInfo) {
    try {
      logger.debug('Tab activated', { activeInfo });
      
      this.currentTabId = activeInfo.tabId;
      
      // Update tab last accessed time
      if (this.tabs.has(activeInfo.tabId)) {
        this.tabs.get(activeInfo.tabId).lastAccessed = Date.now();
      }
      
      // Emit event
      this.emit('tabActivated', { activeInfo });
    } catch (error) {
      logger.error('Error handling tab activated', { error });
    }
  }

  /**
   * Handle tab removed
   * @param {number} tabId - Tab ID
   * @param {Object} removeInfo - Remove information
   */
  handleTabRemoved(tabId, removeInfo) {
    try {
      logger.debug('Tab removed', { tabId, removeInfo });
      
      // Remove tab from tracking
      this.tabs.delete(tabId);
      this.stats.currentTabCount = Math.max(0, this.stats.currentTabCount - 1);
      
      // Emit event
      this.emit('tabRemoved', { tabId, removeInfo });
    } catch (error) {
      logger.error('Error handling tab removed', { error });
    }
  }

  /**
   * Get current statistics
   * @returns {Object} - Current statistics
   */
  getStats() {
    return {
      ...this.stats,
      isActive: this.isActive,
      currentTabId: this.currentTabId,
      trackedTabs: this.tabs.size,
      config: this.config
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      totalTabsCreated: 0,
      totalTabsClosed: 0,
      totalTabsSwitched: 0,
      currentTabCount: 0,
      lastTabOperation: null,
      errors: 0
    };
  }

  /**
   * Update configuration
   * @param {Object} newConfig - New configuration
   */
  updateConfig(newConfig) {
    try {
      this.config = { ...this.config, ...newConfig };
      logger.info('Tab manager configuration updated', { config: this.config });
    } catch (error) {
      logger.error('Error updating configuration', { error });
    }
  }

  /**
   * Validate configuration
   * @returns {boolean} - True if valid
   */
  validateConfig() {
    try {
      if (this.config.maxTabs < 1) {
        logger.error('Max tabs must be at least 1');
        return false;
      }
      
      if (this.config.tabTimeout < 1000) {
        logger.error('Tab timeout must be at least 1 second');
        return false;
      }
      
      return true;
    } catch (error) {
      logger.error('Error validating configuration', { error });
      return false;
    }
  }

  /**
   * Add event listener
   * @param {string} event - Event name
   * @param {Function} listener - Event listener
   */
  on(event, listener) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(listener);
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} listener - Event listener
   */
  off(event, listener) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit event
   * @param {string} event - Event name
   * @param {...any} args - Event arguments
   */
  emit(event, ...args) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      listeners.forEach(listener => {
        try {
          listener(...args);
        } catch (error) {
          logger.error('Error in event listener', { error, event });
        }
      });
    }
  }

  /**
   * Sleep utility
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>} - Promise that resolves after delay
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Cleanup resources
   * @returns {Promise<boolean>} - Success status
   */
  async cleanup() {
    try {
      await this.stop();
      this.tabs.clear();
      this.resetStats();
      logger.info('Tab manager cleaned up');
      return true;
    } catch (error) {
      logger.error('Error cleaning up tab manager', { error });
      return false;
    }
  }
}

/**
 * Create tab manager instance
 * @param {Object} config - Configuration object
 * @returns {TabManager} - Manager instance
 */
export function createTabManager(config = {}) {
  return new TabManager(config);
}

/**
 * Default tab manager instance
 */
export const tabManager = createTabManager();
