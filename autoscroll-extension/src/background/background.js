/**
 * Background script for autoscroll extension
 */

import { createLogger } from '@utils/logger.js';
import { getStorageValue, setStorageValue } from '@utils/storage.js';

const logger = createLogger('background');

/**
 * Background Service Worker
 */
class BackgroundService {
  constructor() {
    this.isInitialized = false;
    this.activeTabs = new Map();
    this.initialize();
  }

  /**
   * Initialize background service
   */
  async initialize() {
    try {
      logger.info('Initializing background service');
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Initialize storage
      await this.initializeStorage();
      
      this.isInitialized = true;
      logger.info('Background service initialized successfully');
    } catch (error) {
      logger.error('Error initializing background service', { error });
    }
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Extension installation/update
    chrome.runtime.onInstalled.addListener((details) => {
      this.handleInstall(details);
    });

    // Tab events
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      this.handleTabUpdate(tabId, changeInfo, tab);
    });

    chrome.tabs.onRemoved.addListener((tabId) => {
      this.handleTabRemoved(tabId);
    });

    chrome.tabs.onActivated.addListener((activeInfo) => {
      this.handleTabActivated(activeInfo);
    });

    // Message handling
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep message channel open for async response
    });

    // Storage changes
    chrome.storage.onChanged.addListener((changes, areaName) => {
      this.handleStorageChange(changes, areaName);
    });

    // Alarm events
    chrome.alarms.onAlarm.addListener((alarm) => {
      this.handleAlarm(alarm);
    });
  }

  /**
   * Handle extension installation/update
   * @param {Object} details - Installation details
   */
  async handleInstall(details) {
    try {
      logger.info('Extension installed/updated', { details });
      
      if (details.reason === 'install') {
        // First installation
        await this.handleFirstInstall();
      } else if (details.reason === 'update') {
        // Extension update
        await this.handleUpdate(details.previousVersion);
      }
    } catch (error) {
      logger.error('Error handling install', { error });
    }
  }

  /**
   * Handle first installation
   */
  async handleFirstInstall() {
    try {
      logger.info('Handling first installation');
      
      // Set default settings
      await this.setDefaultSettings();
      
      // Show welcome page
      await this.showWelcomePage();
    } catch (error) {
      logger.error('Error handling first install', { error });
    }
  }

  /**
   * Handle extension update
   * @param {string} previousVersion - Previous version
   */
  async handleUpdate(previousVersion) {
    try {
      logger.info('Handling extension update', { previousVersion });
      
      // Migrate settings if needed
      await this.migrateSettings(previousVersion);
      
      // Update active tabs
      await this.updateActiveTabs();
    } catch (error) {
      logger.error('Error handling update', { error });
    }
  }

  /**
   * Handle tab update
   * @param {number} tabId - Tab ID
   * @param {Object} changeInfo - Change information
   * @param {Object} tab - Tab object
   */
  async handleTabUpdate(tabId, changeInfo, tab) {
    try {
      if (changeInfo.status === 'complete' && tab.url) {
        logger.debug('Tab updated', { tabId, url: tab.url });
        
        // Check if tab has autoscroll active
        if (this.activeTabs.has(tabId)) {
          await this.handleTabReload(tabId, tab);
        }
      }
    } catch (error) {
      logger.error('Error handling tab update', { error });
    }
  }

  /**
   * Handle tab removal
   * @param {number} tabId - Tab ID
   */
  async handleTabRemoved(tabId) {
    try {
      logger.debug('Tab removed', { tabId });
      
      // Clean up tab data
      this.activeTabs.delete(tabId);
      
      // Cancel any alarms for this tab
      await chrome.alarms.clear(`autoscroll_${tabId}`);
    } catch (error) {
      logger.error('Error handling tab removal', { error });
    }
  }

  /**
   * Handle tab activation
   * @param {Object} activeInfo - Active tab information
   */
  async handleTabActivated(activeInfo) {
    try {
      logger.debug('Tab activated', { activeInfo });
      
      // Update active tab status
      await this.updateActiveTabStatus(activeInfo.tabId);
    } catch (error) {
      logger.error('Error handling tab activation', { error });
    }
  }

  /**
   * Handle message from content script or popup
   * @param {Object} message - Message object
   * @param {Object} sender - Message sender
   * @param {Function} sendResponse - Response function
   */
  async handleMessage(message, sender, sendResponse) {
    try {
      logger.debug('Received message', { message, sender });
      
      switch (message.action) {
        case 'start':
          await this.handleStart(message, sender, sendResponse);
          break;
        case 'stop':
          await this.handleStop(message, sender, sendResponse);
          break;
        case 'pause':
          await this.handlePause(message, sender, sendResponse);
          break;
        case 'resume':
          await this.handleResume(message, sender, sendResponse);
          break;
        case 'getStatus':
          await this.handleGetStatus(message, sender, sendResponse);
          break;
        case 'getStats':
          await this.handleGetStats(message, sender, sendResponse);
          break;
        case 'updateSettings':
          await this.handleUpdateSettings(message, sender, sendResponse);
          break;
        default:
          logger.warn('Unknown message action', { action: message.action });
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      logger.error('Error handling message', { error });
      sendResponse({ success: false, error: error.message });
    }
  }

  /**
   * Handle start action
   * @param {Object} message - Message object
   * @param {Object} sender - Message sender
   * @param {Function} sendResponse - Response function
   */
  async handleStart(message, sender, sendResponse) {
    try {
      const tabId = sender.tab?.id;
      if (!tabId) {
        sendResponse({ success: false, error: 'No tab ID' });
        return;
      }
      
      // Store tab information
      this.activeTabs.set(tabId, {
        config: message.config,
        startTime: Date.now(),
        isRunning: true,
        isPaused: false
      });
      
      // Set up session timeout
      await this.setupSessionTimeout(tabId, message.config);
      
      logger.info('Autoscroll started', { tabId, config: message.config });
      sendResponse({ success: true });
    } catch (error) {
      logger.error('Error handling start', { error });
      sendResponse({ success: false, error: error.message });
    }
  }

  /**
   * Handle stop action
   * @param {Object} message - Message object
   * @param {Object} sender - Message sender
   * @param {Function} sendResponse - Response function
   */
  async handleStop(message, sender, sendResponse) {
    try {
      const tabId = sender.tab?.id;
      if (!tabId) {
        sendResponse({ success: false, error: 'No tab ID' });
        return;
      }
      
      // Update tab status
      if (this.activeTabs.has(tabId)) {
        const tabData = this.activeTabs.get(tabId);
        tabData.isRunning = false;
        tabData.isPaused = false;
        tabData.endTime = Date.now();
      }
      
      // Clear session timeout
      await chrome.alarms.clear(`autoscroll_${tabId}`);
      
      logger.info('Autoscroll stopped', { tabId });
      sendResponse({ success: true });
    } catch (error) {
      logger.error('Error handling stop', { error });
      sendResponse({ success: false, error: error.message });
    }
  }

  /**
   * Handle pause action
   * @param {Object} message - Message object
   * @param {Object} sender - Message sender
   * @param {Function} sendResponse - Response function
   */
  async handlePause(message, sender, sendResponse) {
    try {
      const tabId = sender.tab?.id;
      if (!tabId) {
        sendResponse({ success: false, error: 'No tab ID' });
        return;
      }
      
      // Update tab status
      if (this.activeTabs.has(tabId)) {
        const tabData = this.activeTabs.get(tabId);
        tabData.isPaused = true;
      }
      
      logger.info('Autoscroll paused', { tabId });
      sendResponse({ success: true });
    } catch (error) {
      logger.error('Error handling pause', { error });
      sendResponse({ success: false, error: error.message });
    }
  }

  /**
   * Handle resume action
   * @param {Object} message - Message object
   * @param {Object} sender - Message sender
   * @param {Function} sendResponse - Response function
   */
  async handleResume(message, sender, sendResponse) {
    try {
      const tabId = sender.tab?.id;
      if (!tabId) {
        sendResponse({ success: false, error: 'No tab ID' });
        return;
      }
      
      // Update tab status
      if (this.activeTabs.has(tabId)) {
        const tabData = this.activeTabs.get(tabId);
        tabData.isPaused = false;
      }
      
      logger.info('Autoscroll resumed', { tabId });
      sendResponse({ success: true });
    } catch (error) {
      logger.error('Error handling resume', { error });
      sendResponse({ success: false, error: error.message });
    }
  }

  /**
   * Handle get status action
   * @param {Object} message - Message object
   * @param {Object} sender - Message sender
   * @param {Function} sendResponse - Response function
   */
  async handleGetStatus(message, sender, sendResponse) {
    try {
      const tabId = sender.tab?.id;
      if (!tabId) {
        sendResponse({ success: false, error: 'No tab ID' });
        return;
      }
      
      const tabData = this.activeTabs.get(tabId);
      const status = {
        isRunning: tabData?.isRunning || false,
        isPaused: tabData?.isPaused || false,
        startTime: tabData?.startTime || null,
        config: tabData?.config || null
      };
      
      sendResponse({ success: true, data: status });
    } catch (error) {
      logger.error('Error handling get status', { error });
      sendResponse({ success: false, error: error.message });
    }
  }

  /**
   * Handle get stats action
   * @param {Object} message - Message object
   * @param {Object} sender - Message sender
   * @param {Function} sendResponse - Response function
   */
  async handleGetStats(message, sender, sendResponse) {
    try {
      const tabId = sender.tab?.id;
      if (!tabId) {
        sendResponse({ success: false, error: 'No tab ID' });
        return;
      }
      
      const tabData = this.activeTabs.get(tabId);
      const stats = {
        sessionDuration: tabData ? Date.now() - tabData.startTime : 0,
        isRunning: tabData?.isRunning || false,
        isPaused: tabData?.isPaused || false
      };
      
      sendResponse({ success: true, data: stats });
    } catch (error) {
      logger.error('Error handling get stats', { error });
      sendResponse({ success: false, error: error.message });
    }
  }

  /**
   * Handle update settings action
   * @param {Object} message - Message object
   * @param {Object} sender - Message sender
   * @param {Function} sendResponse - Response function
   */
  async handleUpdateSettings(message, sender, sendResponse) {
    try {
      // Update settings in storage
      await setStorageValue('extensionSettings', message.settings);
      
      logger.info('Settings updated', { settings: message.settings });
      sendResponse({ success: true });
    } catch (error) {
      logger.error('Error handling update settings', { error });
      sendResponse({ success: false, error: error.message });
    }
  }

  /**
   * Handle storage change
   * @param {Object} changes - Storage changes
   * @param {string} areaName - Storage area name
   */
  async handleStorageChange(changes, areaName) {
    try {
      logger.debug('Storage changed', { changes, areaName });
      
      // Handle specific storage changes
      if (changes.activeProfile) {
        await this.handleProfileChange(changes.activeProfile.newValue);
      }
      
      if (changes.extensionSettings) {
        await this.handleSettingsChange(changes.extensionSettings.newValue);
      }
    } catch (error) {
      logger.error('Error handling storage change', { error });
    }
  }

  /**
   * Handle alarm
   * @param {Object} alarm - Alarm object
   */
  async handleAlarm(alarm) {
    try {
      logger.debug('Alarm triggered', { alarm });
      
      if (alarm.name.startsWith('autoscroll_')) {
        const tabId = parseInt(alarm.name.replace('autoscroll_', ''));
        await this.handleSessionTimeout(tabId);
      }
    } catch (error) {
      logger.error('Error handling alarm', { error });
    }
  }

  /**
   * Initialize storage
   */
  async initializeStorage() {
    try {
      // Set default settings if not exists
      const settings = await getStorageValue('extensionSettings', null);
      if (!settings) {
        await this.setDefaultSettings();
      }
    } catch (error) {
      logger.error('Error initializing storage', { error });
    }
  }

  /**
   * Set default settings
   */
  async setDefaultSettings() {
    try {
      const defaultSettings = {
        activeProfile: 'default',
        activeStrategy: 'linear',
        activeSpeed: 1.0,
        autoNavigate: false,
        navigationMode: 'sameTab',
        navigationTarget: 'next',
        stealthLevel: 'basic',
        debugMode: false
      };
      
      await setStorageValue('extensionSettings', defaultSettings);
      logger.info('Default settings set');
    } catch (error) {
      logger.error('Error setting default settings', { error });
    }
  }

  /**
   * Show welcome page
   */
  async showWelcomePage() {
    try {
      // Open welcome page in new tab
      await chrome.tabs.create({
        url: chrome.runtime.getURL('welcome.html')
      });
    } catch (error) {
      logger.error('Error showing welcome page', { error });
    }
  }

  /**
   * Migrate settings
   * @param {string} previousVersion - Previous version
   */
  async migrateSettings(previousVersion) {
    try {
      logger.info('Migrating settings', { previousVersion });
      
      // Add migration logic here for future versions
      // For now, just log the migration
    } catch (error) {
      logger.error('Error migrating settings', { error });
    }
  }

  /**
   * Update active tabs
   */
  async updateActiveTabs() {
    try {
      // Clean up inactive tabs
      const tabs = await chrome.tabs.query({});
      const activeTabIds = new Set(tabs.map(tab => tab.id));
      
      for (const tabId of this.activeTabs.keys()) {
        if (!activeTabIds.has(tabId)) {
          this.activeTabs.delete(tabId);
        }
      }
    } catch (error) {
      logger.error('Error updating active tabs', { error });
    }
  }

  /**
   * Handle tab reload
   * @param {number} tabId - Tab ID
   * @param {Object} tab - Tab object
   */
  async handleTabReload(tabId, tab) {
    try {
      // Re-inject content script if needed
      if (this.activeTabs.has(tabId)) {
        await this.injectContentScript(tabId);
      }
    } catch (error) {
      logger.error('Error handling tab reload', { error });
    }
  }

  /**
   * Update active tab status
   * @param {number} tabId - Tab ID
   */
  async updateActiveTabStatus(tabId) {
    try {
      // Update tab status based on current state
      if (this.activeTabs.has(tabId)) {
        const tabData = this.activeTabs.get(tabId);
        // Send status update to content script
        await this.sendMessageToTab(tabId, {
          type: 'statusUpdate',
          data: {
            isRunning: tabData.isRunning,
            isPaused: tabData.isPaused
          }
        });
      }
    } catch (error) {
      logger.error('Error updating active tab status', { error });
    }
  }

  /**
   * Set up session timeout
   * @param {number} tabId - Tab ID
   * @param {Object} config - Configuration
   */
  async setupSessionTimeout(tabId, config) {
    try {
      const maxSessionTime = config.maxSessionTime || 300000; // 5 minutes default
      
      await chrome.alarms.create(`autoscroll_${tabId}`, {
        delayInMinutes: maxSessionTime / 60000
      });
    } catch (error) {
      logger.error('Error setting up session timeout', { error });
    }
  }

  /**
   * Handle session timeout
   * @param {number} tabId - Tab ID
   */
  async handleSessionTimeout(tabId) {
    try {
      logger.info('Session timeout reached', { tabId });
      
      // Stop autoscroll
      await this.sendMessageToTab(tabId, {
        type: 'stop',
        reason: 'timeout'
      });
      
      // Clean up tab data
      this.activeTabs.delete(tabId);
    } catch (error) {
      logger.error('Error handling session timeout', { error });
    }
  }

  /**
   * Send message to tab
   * @param {number} tabId - Tab ID
   * @param {Object} message - Message to send
   */
  async sendMessageToTab(tabId, message) {
    try {
      await chrome.tabs.sendMessage(tabId, message);
    } catch (error) {
      logger.error('Error sending message to tab', { error, tabId });
    }
  }

  /**
   * Inject content script
   * @param {number} tabId - Tab ID
   */
  async injectContentScript(tabId) {
    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        files: ['content.js']
      });
    } catch (error) {
      logger.error('Error injecting content script', { error, tabId });
    }
  }

  /**
   * Handle profile change
   * @param {string} newProfile - New profile name
   */
  async handleProfileChange(newProfile) {
    try {
      logger.info('Profile changed', { newProfile });
      
      // Notify all active tabs
      for (const [tabId, tabData] of this.activeTabs) {
        if (tabData.isRunning) {
          await this.sendMessageToTab(tabId, {
            type: 'profileChange',
            data: { profile: newProfile }
          });
        }
      }
    } catch (error) {
      logger.error('Error handling profile change', { error });
    }
  }

  /**
   * Handle settings change
   * @param {Object} newSettings - New settings
   */
  async handleSettingsChange(newSettings) {
    try {
      logger.info('Settings changed', { newSettings });
      
      // Notify all active tabs
      for (const [tabId, tabData] of this.activeTabs) {
        if (tabData.isRunning) {
          await this.sendMessageToTab(tabId, {
            type: 'settingsChange',
            data: { settings: newSettings }
          });
        }
      }
    } catch (error) {
      logger.error('Error handling settings change', { error });
    }
  }
}

// Initialize background service
new BackgroundService();
