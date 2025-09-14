/**
 * Options page script for autoscroll extension
 */

import { createLogger } from '../../utils/logger.js';
import { getStorageValue, setStorageValue } from '../../utils/storage.js';

const logger = createLogger('options');

/**
 * Options Controller
 */
class OptionsController {
  constructor() {
    this.isInitialized = false;
    this.settings = {};
    
    this.initialize();
  }

  /**
   * Initialize options page
   */
  async initialize() {
    try {
      logger.info('Initializing options page');
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Load current settings
      await this.loadSettings();
      
      // Update UI
      this.updateUI();
      
      // Load additional data
      await this.updateProfileSelect();
      await this.loadStatistics();
      
      this.isInitialized = true;
      logger.info('Options page initialized successfully');
    } catch (error) {
      logger.error('Error initializing options page', { error });
    }
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Save button
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.handleSave());
    }

    // Reset button
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.handleReset());
    }

    // Export button
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.handleExport());
    }

    // Import button
    const importBtn = document.getElementById('importBtn');
    if (importBtn) {
      importBtn.addEventListener('click', () => this.handleImport());
    }

    // Import file input
    const importFile = document.getElementById('importFile');
    if (importFile) {
      importFile.addEventListener('change', (e) => this.handleImportFile(e));
    }

    // Profile management buttons
    const createProfileBtn = document.getElementById('createProfileBtn');
    if (createProfileBtn) {
      createProfileBtn.addEventListener('click', () => this.handleCreateProfile());
    }

    const deleteProfileBtn = document.getElementById('deleteProfileBtn');
    if (deleteProfileBtn) {
      deleteProfileBtn.addEventListener('click', () => this.handleDeleteProfile());
    }

    // Speed slider change
    const speedSlider = document.getElementById('speedSlider');
    if (speedSlider) {
      speedSlider.addEventListener('input', (e) => this.handleSpeedChange(e));
    }
  }

  /**
   * Load current settings
   */
  async loadSettings() {
    try {
      this.settings = await getStorageValue('extensionSettings', {
        activeProfile: 'default',
        activeStrategy: 'linear',
        activeSpeed: 1.0,
        autoNavigate: false,
        navigationMode: 'sameTab',
        navigationTarget: 'next',
        stealthLevel: 'basic',
        debugMode: false
      });
      
      logger.info('Settings loaded', { settings: this.settings });
    } catch (error) {
      logger.error('Error loading settings', { error });
    }
  }

  /**
   * Update UI with current settings
   */
  updateUI() {
    try {
      // Profile selection
      const profileSelect = document.getElementById('profileSelect');
      if (profileSelect) {
        profileSelect.value = this.settings.activeProfile || 'default';
      }

      // Strategy selection
      const strategySelect = document.getElementById('strategySelect');
      if (strategySelect) {
        strategySelect.value = this.settings.activeStrategy || 'linear';
      }

      // Speed slider
      const speedSlider = document.getElementById('speedSlider');
      const speedValue = document.getElementById('speedValue');
      if (speedSlider) {
        speedSlider.value = this.settings.activeSpeed || 1.0;
        if (speedValue) {
          speedValue.textContent = `${this.settings.activeSpeed || 1.0}x`;
        }
      }

      // Auto navigate toggle
      const autoNavigateToggle = document.getElementById('autoNavigateToggle');
      if (autoNavigateToggle) {
        autoNavigateToggle.checked = this.settings.autoNavigate || false;
      }

      // Navigation mode
      const navModeSelect = document.getElementById('navModeSelect');
      if (navModeSelect) {
        navModeSelect.value = this.settings.navigationMode || 'sameTab';
      }

      // Navigation target
      const navTargetSelect = document.getElementById('navTargetSelect');
      if (navTargetSelect) {
        navTargetSelect.value = this.settings.navigationTarget || 'next';
      }

      // Stealth level
      const stealthLevelSelect = document.getElementById('stealthLevelSelect');
      if (stealthLevelSelect) {
        stealthLevelSelect.value = this.settings.stealthLevel || 'basic';
      }

      // Debug mode
      const debugModeToggle = document.getElementById('debugModeToggle');
      if (debugModeToggle) {
        debugModeToggle.checked = this.settings.debugMode || false;
      }
    } catch (error) {
      logger.error('Error updating UI', { error });
    }
  }

  /**
   * Handle save button click
   */
  async handleSave() {
    try {
      const newSettings = this.getFormSettings();
      
      await setStorageValue('extensionSettings', newSettings);
      this.settings = newSettings;
      
      // Notify background script about settings change
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        try {
          await chrome.runtime.sendMessage({
            action: 'updateSettings',
            settings: newSettings
          });
        } catch (error) {
          logger.warn('Could not notify background script', { error });
        }
      }
      
      this.showMessage('Settings saved successfully', 'success');
      logger.info('Settings saved', { settings: newSettings });
    } catch (error) {
      logger.error('Error saving settings', { error });
      this.showMessage('Error saving settings', 'error');
    }
  }

  /**
   * Handle reset button click
   */
  async handleReset() {
    try {
      if (confirm('Are you sure you want to reset all settings to default?')) {
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
        this.settings = defaultSettings;
        this.updateUI();
        
        this.showMessage('Settings reset to default', 'success');
        logger.info('Settings reset', { settings: defaultSettings });
      }
    } catch (error) {
      logger.error('Error resetting settings', { error });
      this.showMessage('Error resetting settings', 'error');
    }
  }

  /**
   * Handle export button click
   */
  async handleExport() {
    try {
      const dataStr = JSON.stringify(this.settings, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = 'autoscroll-settings.json';
      link.click();
      
      this.showMessage('Settings exported successfully', 'success');
      logger.info('Settings exported');
    } catch (error) {
      logger.error('Error exporting settings', { error });
      this.showMessage('Error exporting settings', 'error');
    }
  }

  /**
   * Handle import button click
   */
  handleImport() {
    try {
      const importFile = document.getElementById('importFile');
      if (importFile) {
        importFile.click();
      }
    } catch (error) {
      logger.error('Error handling import', { error });
      this.showMessage('Error importing settings', 'error');
    }
  }

  /**
   * Handle import file selection
   * @param {Event} event - File input event
   */
  async handleImportFile(event) {
    try {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const settings = JSON.parse(e.target.result);
          
          // Validate settings
          if (this.validateSettings(settings)) {
            await setStorageValue('extensionSettings', settings);
            this.settings = settings;
            this.updateUI();
            
            this.showMessage('Settings imported successfully', 'success');
            logger.info('Settings imported', { settings });
          } else {
            this.showMessage('Invalid settings file', 'error');
          }
        } catch (error) {
          logger.error('Error parsing imported settings', { error });
          this.showMessage('Error parsing settings file', 'error');
        }
      };
      
      reader.readAsText(file);
    } catch (error) {
      logger.error('Error handling import file', { error });
      this.showMessage('Error importing settings', 'error');
    }
  }

  /**
   * Get settings from form
   * @returns {Object} - Settings object
   */
  getFormSettings() {
    try {
      const profileSelect = document.getElementById('profileSelect');
      const strategySelect = document.getElementById('strategySelect');
      const speedSlider = document.getElementById('speedSlider');
      const autoNavigateToggle = document.getElementById('autoNavigateToggle');
      const navModeSelect = document.getElementById('navModeSelect');
      const navTargetSelect = document.getElementById('navTargetSelect');
      const stealthLevelSelect = document.getElementById('stealthLevelSelect');
      const debugModeToggle = document.getElementById('debugModeToggle');

      return {
        activeProfile: profileSelect?.value || 'default',
        activeStrategy: strategySelect?.value || 'linear',
        activeSpeed: parseFloat(speedSlider?.value || '1.0'),
        autoNavigate: autoNavigateToggle?.checked || false,
        navigationMode: navModeSelect?.value || 'sameTab',
        navigationTarget: navTargetSelect?.value || 'next',
        stealthLevel: stealthLevelSelect?.value || 'basic',
        debugMode: debugModeToggle?.checked || false
      };
    } catch (error) {
      logger.error('Error getting form settings', { error });
      return {};
    }
  }

  /**
   * Validate settings object
   * @param {Object} settings - Settings to validate
   * @returns {boolean} - True if valid
   */
  validateSettings(settings) {
    try {
      const requiredFields = [
        'activeProfile',
        'activeStrategy',
        'activeSpeed',
        'autoNavigate',
        'navigationMode',
        'navigationTarget',
        'stealthLevel',
        'debugMode'
      ];

      for (const field of requiredFields) {
        if (!(field in settings)) {
          return false;
        }
      }

      // Validate specific values
      if (typeof settings.activeSpeed !== 'number' || settings.activeSpeed < 0.1 || settings.activeSpeed > 5.0) {
        return false;
      }

      if (typeof settings.autoNavigate !== 'boolean') {
        return false;
      }

      if (typeof settings.debugMode !== 'boolean') {
        return false;
      }

      return true;
    } catch (error) {
      logger.error('Error validating settings', { error });
      return false;
    }
  }

  /**
   * Handle create profile
   */
  async handleCreateProfile() {
    try {
      const profileNameInput = document.getElementById('profileName');
      if (!profileNameInput || !profileNameInput.value.trim()) {
        this.showMessage('Please enter a profile name', 'error');
        return;
      }

      const profileName = profileNameInput.value.trim();
      const currentSettings = this.getFormSettings();
      
      // Save profile
      const profiles = await getStorageValue('extensionProfiles', {});
      profiles[profileName] = {
        ...currentSettings,
        createdAt: Date.now(),
        name: profileName
      };
      
      await setStorageValue('extensionProfiles', profiles);
      
      // Update profile select
      this.updateProfileSelect();
      
      // Clear input
      profileNameInput.value = '';
      
      this.showMessage(`Profile "${profileName}" created successfully`, 'success');
      logger.info('Profile created', { profileName });
    } catch (error) {
      logger.error('Error creating profile', { error });
      this.showMessage('Error creating profile', 'error');
    }
  }

  /**
   * Handle delete profile
   */
  async handleDeleteProfile() {
    try {
      const profileSelect = document.getElementById('profileSelect');
      if (!profileSelect || !profileSelect.value) {
        this.showMessage('Please select a profile to delete', 'error');
        return;
      }

      const profileName = profileSelect.value;
      
      if (profileName === 'default') {
        this.showMessage('Cannot delete default profile', 'error');
        return;
      }

      if (!confirm(`Are you sure you want to delete profile "${profileName}"?`)) {
        return;
      }

      const profiles = await getStorageValue('extensionProfiles', {});
      delete profiles[profileName];
      
      await setStorageValue('extensionProfiles', profiles);
      
      // Update profile select
      this.updateProfileSelect();
      
      this.showMessage(`Profile "${profileName}" deleted successfully`, 'success');
      logger.info('Profile deleted', { profileName });
    } catch (error) {
      logger.error('Error deleting profile', { error });
      this.showMessage('Error deleting profile', 'error');
    }
  }

  /**
   * Handle speed change
   */
  handleSpeedChange(event) {
    try {
      const speedValue = document.getElementById('speedValue');
      if (speedValue) {
        speedValue.textContent = `${event.target.value}x`;
      }
    } catch (error) {
      logger.error('Error handling speed change', { error });
    }
  }

  /**
   * Update profile select options
   */
  async updateProfileSelect() {
    try {
      const profileSelect = document.getElementById('profileSelect');
      if (!profileSelect) return;

      const profiles = await getStorageValue('extensionProfiles', {});
      const currentValue = profileSelect.value;
      
      // Clear existing options
      profileSelect.innerHTML = '<option value="default">Default</option>';
      
      // Add custom profiles
      Object.keys(profiles).forEach(profileName => {
        const option = document.createElement('option');
        option.value = profileName;
        option.textContent = profileName;
        profileSelect.appendChild(option);
      });
      
      // Restore selection
      if (currentValue && profileSelect.querySelector(`option[value="${currentValue}"]`)) {
        profileSelect.value = currentValue;
      }
    } catch (error) {
      logger.error('Error updating profile select', { error });
    }
  }

  /**
   * Load statistics
   */
  async loadStatistics() {
    try {
      const stats = await getStorageValue('extensionStats', {
        totalScrollTime: 0,
        pagesScrolled: 0,
        navigationClicks: 0,
        stealthEvents: 0
      });

      // Update statistics display
      const totalScrollTime = document.getElementById('totalScrollTime');
      if (totalScrollTime) {
        const hours = Math.floor(stats.totalScrollTime / 3600000);
        const minutes = Math.floor((stats.totalScrollTime % 3600000) / 60000);
        totalScrollTime.textContent = `${hours}h ${minutes}m`;
      }

      const pagesScrolled = document.getElementById('pagesScrolled');
      if (pagesScrolled) {
        pagesScrolled.textContent = stats.pagesScrolled.toString();
      }

      const navigationClicks = document.getElementById('navigationClicks');
      if (navigationClicks) {
        navigationClicks.textContent = stats.navigationClicks.toString();
      }

      const stealthEvents = document.getElementById('stealthEvents');
      if (stealthEvents) {
        stealthEvents.textContent = stats.stealthEvents.toString();
      }
    } catch (error) {
      logger.error('Error loading statistics', { error });
    }
  }

  /**
   * Show message to user
   * @param {string} message - Message to show
   * @param {string} type - Message type (success, error, info)
   */
  showMessage(message, type = 'info') {
    try {
      const messageDiv = document.getElementById('message');
      if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
        
        // Auto hide after 3 seconds
        setTimeout(() => {
          messageDiv.style.display = 'none';
        }, 3000);
      }
    } catch (error) {
      logger.error('Error showing message', { error });
    }
  }
}

// Initialize options page when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new OptionsController();
});
