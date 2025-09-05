/**
 * Popup UI logic for autoscroll extension
 */

import { createLogger } from '@utils/logger.js';
import { getStorageValue, setStorageValue } from '@utils/storage.js';

const logger = createLogger('popup');

/**
 * Popup UI Controller
 */
class PopupController {
  constructor() {
    this.isRunning = false;
    this.isPaused = false;
    this.currentProfile = 'default';
    this.currentStrategy = 'linear';
    this.currentSpeed = 1.0;
    this.stats = {
      steps: 0,
      distance: 0,
      duration: 0,
      errors: 0
    };
    
    this.initializeElements();
    this.attachEventListeners();
    this.loadSettings();
    this.updateUI();
  }

  /**
   * Initialize DOM elements
   */
  initializeElements() {
    // Main controls
    this.startStopBtn = document.getElementById('startStopBtn');
    this.pauseBtn = document.getElementById('pauseBtn');
    
    // Status elements
    this.statusDot = document.getElementById('statusDot');
    this.statusText = document.getElementById('statusText');
    
    // Profile and strategy
    this.profileSelect = document.getElementById('profileSelect');
    this.strategySelect = document.getElementById('strategySelect');
    
    // Speed control
    this.speedSlider = document.getElementById('speedSlider');
    this.speedValue = document.getElementById('speedValue');
    
    // Statistics
    this.stepsValue = document.getElementById('stepsValue');
    this.distanceValue = document.getElementById('distanceValue');
    this.durationValue = document.getElementById('durationValue');
    this.errorsValue = document.getElementById('errorsValue');
    this.resetStatsBtn = document.getElementById('resetStatsBtn');
    
    // Navigation
    this.autoNavigateToggle = document.getElementById('autoNavigateToggle');
    this.navModeSelect = document.getElementById('navModeSelect');
    this.navTargetSelect = document.getElementById('navTargetSelect');
    
    // Footer buttons
    this.optionsBtn = document.getElementById('optionsBtn');
    this.helpBtn = document.getElementById('helpBtn');
    
    // Overlays and toasts
    this.loadingOverlay = document.getElementById('loadingOverlay');
    this.errorToast = document.getElementById('errorToast');
    this.successToast = document.getElementById('successToast');
    this.errorMessage = document.getElementById('errorMessage');
    this.successMessage = document.getElementById('successMessage');
    this.errorClose = document.getElementById('errorClose');
    this.successClose = document.getElementById('successClose');
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Main controls
    this.startStopBtn.addEventListener('click', () => this.toggleStartStop());
    this.pauseBtn.addEventListener('click', () => this.togglePause());
    
    // Profile and strategy changes
    this.profileSelect.addEventListener('change', (e) => this.onProfileChange(e.target.value));
    this.strategySelect.addEventListener('change', (e) => this.onStrategyChange(e.target.value));
    
    // Speed control
    this.speedSlider.addEventListener('input', (e) => this.onSpeedChange(e.target.value));
    
    // Statistics
    this.resetStatsBtn.addEventListener('click', () => this.resetStats());
    
    // Navigation
    this.autoNavigateToggle.addEventListener('change', (e) => this.onAutoNavigateChange(e.target.checked));
    this.navModeSelect.addEventListener('change', (e) => this.onNavModeChange(e.target.value));
    this.navTargetSelect.addEventListener('change', (e) => this.onNavTargetChange(e.target.value));
    
    // Footer buttons
    this.optionsBtn.addEventListener('click', () => this.openOptions());
    this.helpBtn.addEventListener('click', () => this.showHelp());
    
    // Toast close buttons
    this.errorClose.addEventListener('click', () => this.hideErrorToast());
    this.successClose.addEventListener('click', () => this.hideSuccessToast());
    
    // Listen for messages from content script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
    });
  }

  /**
   * Load settings from storage
   */
  async loadSettings() {
    try {
      this.currentProfile = await getStorageValue('activeProfile', 'default');
      this.currentStrategy = await getStorageValue('activeStrategy', 'linear');
      this.currentSpeed = await getStorageValue('activeSpeed', 1.0);
      
      // Load statistics
      const savedStats = await getStorageValue('popupStats', {});
      this.stats = { ...this.stats, ...savedStats };
      
      // Load navigation settings
      const navSettings = await getStorageValue('navigationSettings', {});
      this.autoNavigateToggle.checked = navSettings.autoNavigate || false;
      this.navModeSelect.value = navSettings.mode || 'sameTab';
      this.navTargetSelect.value = navSettings.target || 'next';
      
      logger.info('Settings loaded successfully');
    } catch (error) {
      logger.error('Error loading settings', { error });
    }
  }

  /**
   * Save settings to storage
   */
  async saveSettings() {
    try {
      await setStorageValue('activeProfile', this.currentProfile);
      await setStorageValue('activeStrategy', this.currentStrategy);
      await setStorageValue('activeSpeed', this.currentSpeed);
      await setStorageValue('popupStats', this.stats);
      await setStorageValue('navigationSettings', {
        autoNavigate: this.autoNavigateToggle.checked,
        mode: this.navModeSelect.value,
        target: this.navTargetSelect.value
      });
      
      logger.info('Settings saved successfully');
    } catch (error) {
      logger.error('Error saving settings', { error });
    }
  }

  /**
   * Update UI elements
   */
  updateUI() {
    // Update status
    this.updateStatus();
    
    // Update controls
    this.updateControls();
    
    // Update statistics
    this.updateStatistics();
    
    // Update selectors
    this.profileSelect.value = this.currentProfile;
    this.strategySelect.value = this.currentStrategy;
    this.speedSlider.value = this.currentSpeed;
    this.speedValue.textContent = `${this.currentSpeed}x`;
  }

  /**
   * Update status indicator
   */
  updateStatus() {
    if (this.isRunning && !this.isPaused) {
      this.statusDot.className = 'status-dot running';
      this.statusText.textContent = 'Running';
    } else if (this.isPaused) {
      this.statusDot.className = 'status-dot paused';
      this.statusText.textContent = 'Paused';
    } else {
      this.statusDot.className = 'status-dot';
      this.statusText.textContent = 'Stopped';
    }
  }

  /**
   * Update control buttons
   */
  updateControls() {
    if (this.isRunning) {
      this.startStopBtn.innerHTML = '<span class="btn-icon">⏹</span><span class="btn-text">Stop</span>';
      this.startStopBtn.className = 'control-btn primary stop';
      this.pauseBtn.disabled = false;
    } else {
      this.startStopBtn.innerHTML = '<span class="btn-icon">▶</span><span class="btn-text">Start</span>';
      this.startStopBtn.className = 'control-btn primary';
      this.pauseBtn.disabled = true;
    }
    
    if (this.isPaused) {
      this.pauseBtn.innerHTML = '<span class="btn-icon">▶</span><span class="btn-text">Resume</span>';
    } else {
      this.pauseBtn.innerHTML = '<span class="btn-icon">⏸</span><span class="btn-text">Pause</span>';
    }
  }

  /**
   * Update statistics display
   */
  updateStatistics() {
    this.stepsValue.textContent = this.stats.steps.toLocaleString();
    this.distanceValue.textContent = `${this.stats.distance.toLocaleString()}px`;
    this.durationValue.textContent = this.formatDuration(this.stats.duration);
    this.errorsValue.textContent = this.stats.errors.toLocaleString();
  }

  /**
   * Format duration in seconds
   * @param {number} seconds - Duration in seconds
   * @returns {string} - Formatted duration
   */
  formatDuration(seconds) {
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    }
  }

  /**
   * Toggle start/stop
   */
  async toggleStartStop() {
    try {
      this.showLoading();
      
      if (this.isRunning) {
        await this.stop();
      } else {
        await this.start();
      }
    } catch (error) {
      logger.error('Error toggling start/stop', { error });
      this.showError('Failed to toggle autoscroll');
    } finally {
      this.hideLoading();
    }
  }

  /**
   * Toggle pause/resume
   */
  async togglePause() {
    try {
      this.showLoading();
      
      if (this.isPaused) {
        await this.resume();
      } else {
        await this.pause();
      }
    } catch (error) {
      logger.error('Error toggling pause', { error });
      this.showError('Failed to toggle pause');
    } finally {
      this.hideLoading();
    }
  }

  /**
   * Start autoscroll
   */
  async start() {
    try {
      const message = {
        action: 'start',
        config: {
          profile: this.currentProfile,
          strategy: this.currentStrategy,
          speed: this.currentSpeed
        }
      };
      
      const response = await this.sendMessageToContentScript(message);
      
      if (response && response.success) {
        this.isRunning = true;
        this.isPaused = false;
        this.updateUI();
        this.showSuccess('Autoscroll started');
        await this.saveSettings();
      } else {
        throw new Error(response?.error || 'Failed to start autoscroll');
      }
    } catch (error) {
      logger.error('Error starting autoscroll', { error });
      throw error;
    }
  }

  /**
   * Stop autoscroll
   */
  async stop() {
    try {
      const message = { action: 'stop' };
      const response = await this.sendMessageToContentScript(message);
      
      if (response && response.success) {
        this.isRunning = false;
        this.isPaused = false;
        this.updateUI();
        this.showSuccess('Autoscroll stopped');
        await this.saveSettings();
      } else {
        throw new Error(response?.error || 'Failed to stop autoscroll');
      }
    } catch (error) {
      logger.error('Error stopping autoscroll', { error });
      throw error;
    }
  }

  /**
   * Pause autoscroll
   */
  async pause() {
    try {
      const message = { action: 'pause' };
      const response = await this.sendMessageToContentScript(message);
      
      if (response && response.success) {
        this.isPaused = true;
        this.updateUI();
        this.showSuccess('Autoscroll paused');
      } else {
        throw new Error(response?.error || 'Failed to pause autoscroll');
      }
    } catch (error) {
      logger.error('Error pausing autoscroll', { error });
      throw error;
    }
  }

  /**
   * Resume autoscroll
   */
  async resume() {
    try {
      const message = { action: 'resume' };
      const response = await this.sendMessageToContentScript(message);
      
      if (response && response.success) {
        this.isPaused = false;
        this.updateUI();
        this.showSuccess('Autoscroll resumed');
      } else {
        throw new Error(response?.error || 'Failed to resume autoscroll');
      }
    } catch (error) {
      logger.error('Error resuming autoscroll', { error });
      throw error;
    }
  }

  /**
   * Send message to content script
   * @param {Object} message - Message to send
   * @returns {Promise<Object>} - Response from content script
   */
  async sendMessageToContentScript(message) {
    return new Promise((resolve) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
            if (chrome.runtime.lastError) {
              resolve({ success: false, error: chrome.runtime.lastError.message });
            } else {
              resolve(response);
            }
          });
        } else {
          resolve({ success: false, error: 'No active tab found' });
        }
      });
    });
  }

  /**
   * Handle message from content script
   * @param {Object} message - Message from content script
   * @param {Object} sender - Message sender
   * @param {Function} sendResponse - Response function
   */
  handleMessage(message, sender, sendResponse) {
    try {
      switch (message.type) {
        case 'statusUpdate':
          this.handleStatusUpdate(message.data);
          break;
        case 'statsUpdate':
          this.handleStatsUpdate(message.data);
          break;
        case 'error':
          this.handleError(message.data);
          break;
      }
    } catch (error) {
      logger.error('Error handling message', { error, message });
    }
  }

  /**
   * Handle status update
   * @param {Object} data - Status data
   */
  handleStatusUpdate(data) {
    this.isRunning = data.isRunning;
    this.isPaused = data.isPaused;
    this.updateUI();
  }

  /**
   * Handle statistics update
   * @param {Object} data - Statistics data
   */
  handleStatsUpdate(data) {
    this.stats = { ...this.stats, ...data };
    this.updateStatistics();
  }

  /**
   * Handle error
   * @param {Object} data - Error data
   */
  handleError(data) {
    this.showError(data.message || 'An error occurred');
  }

  /**
   * Event handlers
   */
  onProfileChange(profile) {
    this.currentProfile = profile;
    this.saveSettings();
  }

  onStrategyChange(strategy) {
    this.currentStrategy = strategy;
    this.saveSettings();
  }

  onSpeedChange(speed) {
    this.currentSpeed = parseFloat(speed);
    this.speedValue.textContent = `${this.currentSpeed}x`;
    this.saveSettings();
  }

  onAutoNavigateChange(enabled) {
    this.saveSettings();
  }

  onNavModeChange(mode) {
    this.saveSettings();
  }

  onNavTargetChange(target) {
    this.saveSettings();
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      steps: 0,
      distance: 0,
      duration: 0,
      errors: 0
    };
    this.updateStatistics();
    this.saveSettings();
    this.showSuccess('Statistics reset');
  }

  /**
   * Open options page
   */
  openOptions() {
    chrome.runtime.openOptionsPage();
  }

  /**
   * Show help
   */
  showHelp() {
    // Open help page or show help modal
    this.showSuccess('Help feature coming soon!');
  }

  /**
   * Show loading overlay
   */
  showLoading() {
    this.loadingOverlay.classList.remove('hidden');
  }

  /**
   * Hide loading overlay
   */
  hideLoading() {
    this.loadingOverlay.classList.add('hidden');
  }

  /**
   * Show error toast
   * @param {string} message - Error message
   */
  showError(message) {
    this.errorMessage.textContent = message;
    this.errorToast.classList.remove('hidden');
    
    // Auto-hide after 5 seconds
    setTimeout(() => this.hideErrorToast(), 5000);
  }

  /**
   * Hide error toast
   */
  hideErrorToast() {
    this.errorToast.classList.add('hidden');
  }

  /**
   * Show success toast
   * @param {string} message - Success message
   */
  showSuccess(message) {
    this.successMessage.textContent = message;
    this.successToast.classList.remove('hidden');
    
    // Auto-hide after 3 seconds
    setTimeout(() => this.hideSuccessToast(), 3000);
  }

  /**
   * Hide success toast
   */
  hideSuccessToast() {
    this.successToast.classList.add('hidden');
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PopupController();
});
