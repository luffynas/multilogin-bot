/**
 * Popup script for autoscroll extension
 */

import { createLogger } from '../../utils/logger.js';
import { getStorageValue, setStorageValue } from '../../utils/storage.js';

const logger = createLogger('popup');

/**
 * Popup Controller
 */
class PopupController {
  constructor() {
    this.isInitialized = false;
    this.currentTab = null;
    this.isRunning = false;
    this.isPaused = false;
    this.currentConfig = null;
    this.stats = {
      steps: 0,
      distance: 0,
      duration: 0,
      errors: 0
    };
    
    this.initialize();
  }

  /**
   * Initialize popup
   */
  async initialize() {
    try {
      logger.info('Initializing popup');
      
      // Get current tab
      await this.getCurrentTab();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Load current status
      await this.loadCurrentStatus();
      
      // Load settings
      await this.loadSettings();
      
      this.isInitialized = true;
      logger.info('Popup initialized successfully');
    } catch (error) {
      logger.error('Error initializing popup', { error });
    }
  }

  /**
   * Get current active tab
   */
  async getCurrentTab() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      this.currentTab = tab;
      logger.debug('Current tab', { tab });
    } catch (error) {
      logger.error('Error getting current tab', { error });
    }
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Start/Stop button
    const startStopBtn = document.getElementById('startStopBtn');
    if (startStopBtn) {
      startStopBtn.addEventListener('click', () => this.handleStartStop());
    }

    // Pause button
    const pauseBtn = document.getElementById('pauseBtn');
    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => this.handlePause());
    }

    // Profile selection
    const profileSelect = document.getElementById('profileSelect');
    if (profileSelect) {
      profileSelect.addEventListener('change', (e) => this.handleProfileChange(e.target.value));
    }

    // Strategy selection
    const strategySelect = document.getElementById('strategySelect');
    if (strategySelect) {
      strategySelect.addEventListener('change', (e) => this.handleStrategyChange(e.target.value));
    }

    // Speed slider
    const speedSlider = document.getElementById('speedSlider');
    if (speedSlider) {
      speedSlider.addEventListener('input', (e) => this.handleSpeedChange(e.target.value));
    }

    // Reset stats button
    const resetStatsBtn = document.getElementById('resetStatsBtn');
    if (resetStatsBtn) {
      resetStatsBtn.addEventListener('click', () => this.handleResetStats());
    }

    // Auto navigate toggle
    const autoNavigateToggle = document.getElementById('autoNavigateToggle');
    if (autoNavigateToggle) {
      autoNavigateToggle.addEventListener('change', (e) => this.handleAutoNavigateChange(e.target.checked));
    }

    // Navigation mode selection
    const navModeSelect = document.getElementById('navModeSelect');
    if (navModeSelect) {
      navModeSelect.addEventListener('change', (e) => this.handleNavModeChange(e.target.value));
    }

    // Navigation target selection
    const navTargetSelect = document.getElementById('navTargetSelect');
    if (navTargetSelect) {
      navTargetSelect.addEventListener('change', (e) => this.handleNavTargetChange(e.target.value));
    }

    // Options button
    const optionsBtn = document.getElementById('optionsBtn');
    if (optionsBtn) {
      optionsBtn.addEventListener('click', () => this.handleOptions());
    }

    // Help button
    const helpBtn = document.getElementById('helpBtn');
    if (helpBtn) {
      helpBtn.addEventListener('click', () => this.handleHelp());
    }

    // Error toast close
    const errorClose = document.getElementById('errorClose');
    if (errorClose) {
      errorClose.addEventListener('click', () => this.hideErrorToast());
    }

    // Success toast close
    const successClose = document.getElementById('successClose');
    if (successClose) {
      successClose.addEventListener('click', () => this.hideSuccessToast());
    }
  }

  /**
   * Load current status
   */
  async loadCurrentStatus() {
    try {
      if (!this.currentTab) return;

      const response = await this.sendMessageToTab({
        action: 'getStatus'
      });

      if (response && response.success) {
        const status = response.data;
        this.isRunning = status.isRunning;
        this.isPaused = status.isPaused;
        this.currentConfig = status.config;
        
        this.updateUI();
      }
    } catch (error) {
      logger.error('Error loading current status', { error });
    }
  }

  /**
   * Load settings
   */
  async loadSettings() {
    try {
      const settings = await getStorageValue('extensionSettings', {});
      
      // Update UI with current settings
      this.updateSettingsUI(settings);
    } catch (error) {
      logger.error('Error loading settings', { error });
    }
  }

  /**
   * Update settings UI
   * @param {Object} settings - Settings object
   */
  updateSettingsUI(settings) {
    try {
      // Profile
      const profileSelect = document.getElementById('profileSelect');
      if (profileSelect && settings.activeProfile) {
        profileSelect.value = settings.activeProfile;
      }

      // Strategy
      const strategySelect = document.getElementById('strategySelect');
      if (strategySelect && settings.activeStrategy) {
        strategySelect.value = settings.activeStrategy;
      }

      // Speed
      const speedSlider = document.getElementById('speedSlider');
      const speedValue = document.getElementById('speedValue');
      if (speedSlider && settings.activeSpeed) {
        speedSlider.value = settings.activeSpeed;
        if (speedValue) {
          speedValue.textContent = `${settings.activeSpeed}x`;
        }
      }

      // Auto navigate
      const autoNavigateToggle = document.getElementById('autoNavigateToggle');
      if (autoNavigateToggle && settings.autoNavigate !== undefined) {
        autoNavigateToggle.checked = settings.autoNavigate;
      }

      // Navigation mode
      const navModeSelect = document.getElementById('navModeSelect');
      if (navModeSelect && settings.navigationMode) {
        navModeSelect.value = settings.navigationMode;
      }

      // Navigation target
      const navTargetSelect = document.getElementById('navTargetSelect');
      if (navTargetSelect && settings.navigationTarget) {
        navTargetSelect.value = settings.navigationTarget;
      }
    } catch (error) {
      logger.error('Error updating settings UI', { error });
    }
  }

  /**
   * Update UI based on current state
   */
  updateUI() {
    try {
      // Update status indicator
      this.updateStatusIndicator();
      
      // Update buttons
      this.updateButtons();
      
      // Update statistics
      this.updateStatistics();
    } catch (error) {
      logger.error('Error updating UI', { error });
    }
  }

  /**
   * Update status indicator
   */
  updateStatusIndicator() {
    try {
      const statusDot = document.getElementById('statusDot');
      const statusText = document.getElementById('statusText');
      
      if (statusDot && statusText) {
        if (this.isRunning) {
          if (this.isPaused) {
            statusDot.className = 'status-dot paused';
            statusText.textContent = 'Paused';
          } else {
            statusDot.className = 'status-dot running';
            statusText.textContent = 'Running';
          }
        } else {
          statusDot.className = 'status-dot stopped';
          statusText.textContent = 'Stopped';
        }
      }
    } catch (error) {
      logger.error('Error updating status indicator', { error });
    }
  }

  /**
   * Update buttons
   */
  updateButtons() {
    try {
      const startStopBtn = document.getElementById('startStopBtn');
      const pauseBtn = document.getElementById('pauseBtn');
      
      if (startStopBtn) {
        if (this.isRunning) {
          startStopBtn.innerHTML = '<span class="btn-icon">⏹</span><span class="btn-text">Stop</span>';
          startStopBtn.className = 'control-btn danger';
        } else {
          startStopBtn.innerHTML = '<span class="btn-icon">▶</span><span class="btn-text">Start</span>';
          startStopBtn.className = 'control-btn primary';
        }
      }
      
      if (pauseBtn) {
        pauseBtn.disabled = !this.isRunning;
        if (this.isPaused) {
          pauseBtn.innerHTML = '<span class="btn-icon">▶</span><span class="btn-text">Resume</span>';
        } else {
          pauseBtn.innerHTML = '<span class="btn-icon">⏸</span><span class="btn-text">Pause</span>';
        }
      }
    } catch (error) {
      logger.error('Error updating buttons', { error });
    }
  }

  /**
   * Update statistics
   */
  updateStatistics() {
    try {
      const stepsValue = document.getElementById('stepsValue');
      const distanceValue = document.getElementById('distanceValue');
      const durationValue = document.getElementById('durationValue');
      const errorsValue = document.getElementById('errorsValue');
      
      if (stepsValue) stepsValue.textContent = this.stats.steps;
      if (distanceValue) distanceValue.textContent = `${this.stats.distance}px`;
      if (durationValue) durationValue.textContent = `${this.stats.duration}s`;
      if (errorsValue) errorsValue.textContent = this.stats.errors;
    } catch (error) {
      logger.error('Error updating statistics', { error });
    }
  }

  /**
   * Handle start/stop button click
   */
  async handleStartStop() {
    try {
      if (!this.currentTab) {
        this.showErrorToast('No active tab found');
        return;
      }

      if (this.isRunning) {
        await this.stopAutoscroll();
      } else {
        await this.startAutoscroll();
      }
    } catch (error) {
      logger.error('Error handling start/stop', { error });
      this.showErrorToast('Error starting/stopping autoscroll');
    }
  }

  /**
   * Handle pause button click
   */
  async handlePause() {
    try {
      if (!this.currentTab) {
        this.showErrorToast('No active tab found');
        return;
      }

      if (this.isPaused) {
        await this.resumeAutoscroll();
      } else {
        await this.pauseAutoscroll();
      }
    } catch (error) {
      logger.error('Error handling pause', { error });
      this.showErrorToast('Error pausing/resuming autoscroll');
    }
  }

  /**
   * Start autoscroll
   */
  async startAutoscroll() {
    try {
      const config = this.getCurrentConfig();
      
      const response = await this.sendMessageToTab({
        action: 'start',
        config: config
      });

      if (response && response.success) {
        this.isRunning = true;
        this.isPaused = false;
        this.updateUI();
        this.showSuccessToast('Autoscroll started');
      } else {
        this.showErrorToast(response?.error || 'Failed to start autoscroll');
      }
    } catch (error) {
      logger.error('Error starting autoscroll', { error });
      this.showErrorToast('Error starting autoscroll');
    }
  }

  /**
   * Stop autoscroll
   */
  async stopAutoscroll() {
    try {
      const response = await this.sendMessageToTab({
        action: 'stop'
      });

      if (response && response.success) {
        this.isRunning = false;
        this.isPaused = false;
        this.updateUI();
        this.showSuccessToast('Autoscroll stopped');
      } else {
        this.showErrorToast(response?.error || 'Failed to stop autoscroll');
      }
    } catch (error) {
      logger.error('Error stopping autoscroll', { error });
      this.showErrorToast('Error stopping autoscroll');
    }
  }

  /**
   * Pause autoscroll
   */
  async pauseAutoscroll() {
    try {
      const response = await this.sendMessageToTab({
        action: 'pause'
      });

      if (response && response.success) {
        this.isPaused = true;
        this.updateUI();
        this.showSuccessToast('Autoscroll paused');
      } else {
        this.showErrorToast(response?.error || 'Failed to pause autoscroll');
      }
    } catch (error) {
      logger.error('Error pausing autoscroll', { error });
      this.showErrorToast('Error pausing autoscroll');
    }
  }

  /**
   * Resume autoscroll
   */
  async resumeAutoscroll() {
    try {
      const response = await this.sendMessageToTab({
        action: 'resume'
      });

      if (response && response.success) {
        this.isPaused = false;
        this.updateUI();
        this.showSuccessToast('Autoscroll resumed');
      } else {
        this.showErrorToast(response?.error || 'Failed to resume autoscroll');
      }
    } catch (error) {
      logger.error('Error resuming autoscroll', { error });
      this.showErrorToast('Error resuming autoscroll');
    }
  }

  /**
   * Get current configuration
   * @returns {Object} - Current configuration
   */
  getCurrentConfig() {
    try {
      const profileSelect = document.getElementById('profileSelect');
      const strategySelect = document.getElementById('strategySelect');
      const speedSlider = document.getElementById('speedSlider');
      const autoNavigateToggle = document.getElementById('autoNavigateToggle');
      const navModeSelect = document.getElementById('navModeSelect');
      const navTargetSelect = document.getElementById('navTargetSelect');

      return {
        profile: profileSelect?.value || 'default',
        strategy: strategySelect?.value || 'linear',
        speed: parseFloat(speedSlider?.value || '1.0'),
        autoNavigate: autoNavigateToggle?.checked || false,
        navigationMode: navModeSelect?.value || 'sameTab',
        navigationTarget: navTargetSelect?.value || 'next'
      };
    } catch (error) {
      logger.error('Error getting current config', { error });
      return {};
    }
  }

  /**
   * Handle profile change
   * @param {string} profile - Profile name
   */
  async handleProfileChange(profile) {
    try {
      await setStorageValue('activeProfile', profile);
      logger.info('Profile changed', { profile });
    } catch (error) {
      logger.error('Error handling profile change', { error });
    }
  }

  /**
   * Handle strategy change
   * @param {string} strategy - Strategy name
   */
  async handleStrategyChange(strategy) {
    try {
      await setStorageValue('activeStrategy', strategy);
      logger.info('Strategy changed', { strategy });
    } catch (error) {
      logger.error('Error handling strategy change', { error });
    }
  }

  /**
   * Handle speed change
   * @param {string} speed - Speed value
   */
  async handleSpeedChange(speed) {
    try {
      const speedValue = document.getElementById('speedValue');
      if (speedValue) {
        speedValue.textContent = `${speed}x`;
      }
      
      await setStorageValue('activeSpeed', parseFloat(speed));
      logger.info('Speed changed', { speed });
    } catch (error) {
      logger.error('Error handling speed change', { error });
    }
  }

  /**
   * Handle reset stats
   */
  async handleResetStats() {
    try {
      this.stats = { steps: 0, distance: 0, duration: 0, errors: 0 };
      this.updateStatistics();
      this.showSuccessToast('Statistics reset');
    } catch (error) {
      logger.error('Error handling reset stats', { error });
    }
  }

  /**
   * Handle auto navigate change
   * @param {boolean} enabled - Auto navigate enabled
   */
  async handleAutoNavigateChange(enabled) {
    try {
      await setStorageValue('autoNavigate', enabled);
      logger.info('Auto navigate changed', { enabled });
    } catch (error) {
      logger.error('Error handling auto navigate change', { error });
    }
  }

  /**
   * Handle navigation mode change
   * @param {string} mode - Navigation mode
   */
  async handleNavModeChange(mode) {
    try {
      await setStorageValue('navigationMode', mode);
      logger.info('Navigation mode changed', { mode });
    } catch (error) {
      logger.error('Error handling navigation mode change', { error });
    }
  }

  /**
   * Handle navigation target change
   * @param {string} target - Navigation target
   */
  async handleNavTargetChange(target) {
    try {
      await setStorageValue('navigationTarget', target);
      logger.info('Navigation target changed', { target });
    } catch (error) {
      logger.error('Error handling navigation target change', { error });
    }
  }

  /**
   * Handle options button click
   */
  handleOptions() {
    try {
      chrome.runtime.openOptionsPage();
    } catch (error) {
      logger.error('Error opening options', { error });
    }
  }

  /**
   * Handle help button click
   */
  handleHelp() {
    try {
      // Open options page instead of help page
      chrome.runtime.openOptionsPage();
    } catch (error) {
      logger.error('Error opening help', { error });
    }
  }

  /**
   * Send message to current tab
   * @param {Object} message - Message to send
   * @returns {Promise<Object>} - Response
   */
  async sendMessageToTab(message) {
    try {
      if (!this.currentTab) {
        throw new Error('No current tab');
      }

      return new Promise((resolve) => {
        chrome.tabs.sendMessage(this.currentTab.id, message, (response) => {
          if (chrome.runtime.lastError) {
            logger.error('Error sending message to tab', { error: chrome.runtime.lastError });
            resolve({ success: false, error: chrome.runtime.lastError.message });
          } else {
            resolve(response);
          }
        });
      });
    } catch (error) {
      logger.error('Error sending message to tab', { error });
      return { success: false, error: error.message };
    }
  }

  /**
   * Show error toast
   * @param {string} message - Error message
   */
  showErrorToast(message) {
    try {
      const errorToast = document.getElementById('errorToast');
      const errorMessage = document.getElementById('errorMessage');
      
      if (errorToast && errorMessage) {
        errorMessage.textContent = message;
        errorToast.classList.remove('hidden');
        
        // Auto hide after 3 seconds
        setTimeout(() => {
          this.hideErrorToast();
        }, 3000);
      }
    } catch (error) {
      logger.error('Error showing error toast', { error });
    }
  }

  /**
   * Hide error toast
   */
  hideErrorToast() {
    try {
      const errorToast = document.getElementById('errorToast');
      if (errorToast) {
        errorToast.classList.add('hidden');
      }
    } catch (error) {
      logger.error('Error hiding error toast', { error });
    }
  }

  /**
   * Show success toast
   * @param {string} message - Success message
   */
  showSuccessToast(message) {
    try {
      const successToast = document.getElementById('successToast');
      const successMessage = document.getElementById('successMessage');
      
      if (successToast && successMessage) {
        successMessage.textContent = message;
        successToast.classList.remove('hidden');
        
        // Auto hide after 2 seconds
        setTimeout(() => {
          this.hideSuccessToast();
        }, 2000);
      }
    } catch (error) {
      logger.error('Error showing success toast', { error });
    }
  }

  /**
   * Hide success toast
   */
  hideSuccessToast() {
    try {
      const successToast = document.getElementById('successToast');
      if (successToast) {
        successToast.classList.add('hidden');
      }
    } catch (error) {
      logger.error('Error hiding success toast', { error });
    }
  }
}

// Initialize popup when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new PopupController();
});