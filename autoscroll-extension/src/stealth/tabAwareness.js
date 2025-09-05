/**
 * Tab awareness for realistic behavior simulation
 */

import { createLogger } from '@utils/logger.js';
import { randDelay, createHumanDelay } from '@utils/time.js';
import { randFloat, randBool } from '@core/randomizer.js';

const logger = createLogger('tab-awareness');

/**
 * Tab Awareness Manager
 * Handles tab focus/blur events and simulates realistic behavior
 */
export class TabAwarenessManager {
  constructor() {
    this.isActive = false;
    this.isTabVisible = true;
    this.isTabFocused = true;
    this.config = {
      pauseOnBlur: true,
      resumeDelay: 1000,
      simulateFocus: true,
      focusDelay: {
        minMs: 500,
        maxMs: 2000
      },
      blurDelay: {
        minMs: 200,
        maxMs: 800
      }
    };
    this.stats = {
      focusEvents: 0,
      blurEvents: 0,
      totalPauseTime: 0,
      lastFocusTime: null,
      lastBlurTime: null
    };
    this.pauseStartTime = null;
    this.eventListeners = new Map();
  }

  /**
   * Initialize tab awareness manager
   * @param {Object} config - Configuration object
   * @returns {Promise<boolean>} - Success status
   */
  async initialize(config = {}) {
    try {
      this.config = { ...this.config, ...config };
      this.setupEventListeners();
      
      logger.info('Tab awareness manager initialized', { config: this.config });
      return true;
    } catch (error) {
      logger.error('Error initializing tab awareness manager', { error });
      return false;
    }
  }

  /**
   * Start tab awareness monitoring
   * @returns {Promise<boolean>} - Success status
   */
  async start() {
    try {
      if (this.isActive) {
        logger.warn('Tab awareness manager already active');
        return false;
      }

      this.isActive = true;
      this.isTabVisible = !document.hidden;
      this.isTabFocused = document.hasFocus();
      
      logger.info('Tab awareness manager started', {
        isTabVisible: this.isTabVisible,
        isTabFocused: this.isTabFocused
      });
      
      return true;
    } catch (error) {
      logger.error('Error starting tab awareness manager', { error });
      return false;
    }
  }

  /**
   * Stop tab awareness monitoring
   * @returns {Promise<boolean>} - Success status
   */
  async stop() {
    try {
      if (!this.isActive) {
        logger.warn('Tab awareness manager not active');
        return false;
      }

      this.isActive = false;
      this.removeEventListeners();
      
      logger.info('Tab awareness manager stopped');
      return true;
    } catch (error) {
      logger.error('Error stopping tab awareness manager', { error });
      return false;
    }
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    try {
      // Page visibility change
      const visibilityHandler = () => this.handleVisibilityChange();
      document.addEventListener('visibilitychange', visibilityHandler);
      this.eventListeners.set('visibilitychange', visibilityHandler);

      // Window focus/blur
      const focusHandler = () => this.handleWindowFocus();
      const blurHandler = () => this.handleWindowBlur();
      
      window.addEventListener('focus', focusHandler);
      window.addEventListener('blur', blurHandler);
      
      this.eventListeners.set('focus', focusHandler);
      this.eventListeners.set('blur', blurHandler);

      // Document focus/blur
      const docFocusHandler = () => this.handleDocumentFocus();
      const docBlurHandler = () => this.handleDocumentBlur();
      
      document.addEventListener('focus', docFocusHandler);
      document.addEventListener('blur', docBlurHandler);
      
      this.eventListeners.set('docFocus', docFocusHandler);
      this.eventListeners.set('docBlur', docBlurHandler);

      logger.debug('Tab awareness event listeners set up');
    } catch (error) {
      logger.error('Error setting up event listeners', { error });
    }
  }

  /**
   * Remove event listeners
   */
  removeEventListeners() {
    try {
      for (const [eventType, handler] of this.eventListeners) {
        switch (eventType) {
          case 'visibilitychange':
            document.removeEventListener('visibilitychange', handler);
            break;
          case 'focus':
            window.removeEventListener('focus', handler);
            break;
          case 'blur':
            window.removeEventListener('blur', handler);
            break;
          case 'docFocus':
            document.removeEventListener('focus', handler);
            break;
          case 'docBlur':
            document.removeEventListener('blur', handler);
            break;
        }
      }
      
      this.eventListeners.clear();
      logger.debug('Tab awareness event listeners removed');
    } catch (error) {
      logger.error('Error removing event listeners', { error });
    }
  }

  /**
   * Handle page visibility change
   */
  async handleVisibilityChange() {
    try {
      const isVisible = !document.hidden;
      
      if (isVisible !== this.isTabVisible) {
        this.isTabVisible = isVisible;
        
        if (isVisible) {
          await this.handleTabVisible();
        } else {
          await this.handleTabHidden();
        }
        
        logger.debug('Page visibility changed', { isVisible });
      }
    } catch (error) {
      logger.error('Error handling visibility change', { error });
    }
  }

  /**
   * Handle window focus
   */
  async handleWindowFocus() {
    try {
      if (!this.isTabFocused) {
        this.isTabFocused = true;
        await this.handleTabFocused();
        
        logger.debug('Window focused');
      }
    } catch (error) {
      logger.error('Error handling window focus', { error });
    }
  }

  /**
   * Handle window blur
   */
  async handleWindowBlur() {
    try {
      if (this.isTabFocused) {
        this.isTabFocused = false;
        await this.handleTabBlurred();
        
        logger.debug('Window blurred');
      }
    } catch (error) {
      logger.error('Error handling window blur', { error });
    }
  }

  /**
   * Handle document focus
   */
  async handleDocumentFocus() {
    try {
      // Document focus is usually triggered after window focus
      // Add a small delay to simulate realistic behavior
      const delay = createHumanDelay(this.config.focusDelay.minMs, 0.3);
      await this.sleep(delay);
      
      logger.debug('Document focused');
    } catch (error) {
      logger.error('Error handling document focus', { error });
    }
  }

  /**
   * Handle document blur
   */
  async handleDocumentBlur() {
    try {
      // Document blur is usually triggered before window blur
      // Add a small delay to simulate realistic behavior
      const delay = createHumanDelay(this.config.blurDelay.minMs, 0.3);
      await this.sleep(delay);
      
      logger.debug('Document blurred');
    } catch (error) {
      logger.error('Error handling document blur', { error });
    }
  }

  /**
   * Handle tab becoming visible
   */
  async handleTabVisible() {
    try {
      this.stats.focusEvents++;
      this.stats.lastFocusTime = Date.now();
      
      // Simulate realistic focus behavior
      if (this.config.simulateFocus) {
        await this.simulateFocusBehavior();
      }
      
      // Emit focus event
      this.emit('tabVisible', {
        timestamp: Date.now(),
        stats: this.stats
      });
      
      logger.debug('Tab became visible');
    } catch (error) {
      logger.error('Error handling tab visible', { error });
    }
  }

  /**
   * Handle tab becoming hidden
   */
  async handleTabHidden() {
    try {
      this.stats.blurEvents++;
      this.stats.lastBlurTime = Date.now();
      
      // Simulate realistic blur behavior
      if (this.config.simulateFocus) {
        await this.simulateBlurBehavior();
      }
      
      // Emit blur event
      this.emit('tabHidden', {
        timestamp: Date.now(),
        stats: this.stats
      });
      
      logger.debug('Tab became hidden');
    } catch (error) {
      logger.error('Error handling tab hidden', { error });
    }
  }

  /**
   * Handle tab focused
   */
  async handleTabFocused() {
    try {
      this.stats.focusEvents++;
      this.stats.lastFocusTime = Date.now();
      
      // Simulate realistic focus behavior
      if (this.config.simulateFocus) {
        await this.simulateFocusBehavior();
      }
      
      // Emit focus event
      this.emit('tabFocused', {
        timestamp: Date.now(),
        stats: this.stats
      });
      
      logger.debug('Tab focused');
    } catch (error) {
      logger.error('Error handling tab focused', { error });
    }
  }

  /**
   * Handle tab blurred
   */
  async handleTabBlurred() {
    try {
      this.stats.blurEvents++;
      this.stats.lastBlurTime = Date.now();
      
      // Simulate realistic blur behavior
      if (this.config.simulateFocus) {
        await this.simulateBlurBehavior();
      }
      
      // Emit blur event
      this.emit('tabBlurred', {
        timestamp: Date.now(),
        stats: this.stats
      });
      
      logger.debug('Tab blurred');
    } catch (error) {
      logger.error('Error handling tab blurred', { error });
    }
  }

  /**
   * Simulate focus behavior
   */
  async simulateFocusBehavior() {
    try {
      // Simulate user returning to tab
      const behaviors = [
        () => this.simulateMouseMovement(),
        () => this.simulateScrollAdjustment(),
        () => this.simulateReadingPause()
      ];
      
      const behavior = behaviors[Math.floor(Math.random() * behaviors.length)];
      await behavior();
      
      logger.debug('Focus behavior simulated');
    } catch (error) {
      logger.error('Error simulating focus behavior', { error });
    }
  }

  /**
   * Simulate blur behavior
   */
  async simulateBlurBehavior() {
    try {
      // Simulate user leaving tab
      const behaviors = [
        () => this.simulateTabSwitch(),
        () => this.simulateMinimizeWindow(),
        () => this.simulateAltTab()
      ];
      
      const behavior = behaviors[Math.floor(Math.random() * behaviors.length)];
      await behavior();
      
      logger.debug('Blur behavior simulated');
    } catch (error) {
      logger.error('Error simulating blur behavior', { error });
    }
  }

  /**
   * Simulate mouse movement on focus
   */
  async simulateMouseMovement() {
    try {
      // Simulate subtle mouse movement when returning to tab
      const event = new MouseEvent('mousemove', {
        clientX: window.innerWidth / 2 + randFloat(-20, 20),
        clientY: window.innerHeight / 2 + randFloat(-20, 20),
        bubbles: true,
        cancelable: true
      });
      
      document.dispatchEvent(event);
      await this.sleep(randFloat(50, 150));
      
      logger.debug('Mouse movement simulated on focus');
    } catch (error) {
      logger.error('Error simulating mouse movement', { error });
    }
  }

  /**
   * Simulate scroll adjustment on focus
   */
  async simulateScrollAdjustment() {
    try {
      // Simulate small scroll adjustment when returning to tab
      const deltaY = randFloat(-30, 30);
      
      const event = new WheelEvent('wheel', {
        deltaY: deltaY,
        deltaMode: 0,
        bubbles: true,
        cancelable: true
      });
      
      document.dispatchEvent(event);
      await this.sleep(randFloat(100, 300));
      
      logger.debug('Scroll adjustment simulated on focus');
    } catch (error) {
      logger.error('Error simulating scroll adjustment', { error });
    }
  }

  /**
   * Simulate reading pause on focus
   */
  async simulateReadingPause() {
    try {
      // Simulate user pausing to read when returning to tab
      const pauseDuration = randFloat(500, 1500);
      await this.sleep(pauseDuration);
      
      logger.debug('Reading pause simulated on focus');
    } catch (error) {
      logger.error('Error simulating reading pause', { error });
    }
  }

  /**
   * Simulate tab switch behavior
   */
  async simulateTabSwitch() {
    try {
      // Simulate user switching to another tab
      const switchDelay = randFloat(200, 800);
      await this.sleep(switchDelay);
      
      logger.debug('Tab switch simulated');
    } catch (error) {
      logger.error('Error simulating tab switch', { error });
    }
  }

  /**
   * Simulate window minimize behavior
   */
  async simulateMinimizeWindow() {
    try {
      // Simulate user minimizing the window
      const minimizeDelay = randFloat(100, 400);
      await this.sleep(minimizeDelay);
      
      logger.debug('Window minimize simulated');
    } catch (error) {
      logger.error('Error simulating window minimize', { error });
    }
  }

  /**
   * Simulate Alt+Tab behavior
   */
  async simulateAltTab() {
    try {
      // Simulate user using Alt+Tab to switch applications
      const altTabDelay = randFloat(300, 700);
      await this.sleep(altTabDelay);
      
      logger.debug('Alt+Tab simulated');
    } catch (error) {
      logger.error('Error simulating Alt+Tab', { error });
    }
  }

  /**
   * Check if tab is currently visible and focused
   * @returns {boolean} - True if tab is active
   */
  isTabActive() {
    return this.isTabVisible && this.isTabFocused;
  }

  /**
   * Get current tab state
   * @returns {Object} - Current tab state
   */
  getTabState() {
    return {
      isVisible: this.isTabVisible,
      isFocused: this.isTabFocused,
      isActive: this.isTabActive(),
      stats: this.stats
    };
  }

  /**
   * Update configuration
   * @param {Object} newConfig - New configuration
   */
  updateConfig(newConfig) {
    try {
      this.config = { ...this.config, ...newConfig };
      logger.info('Tab awareness configuration updated', { config: this.config });
    } catch (error) {
      logger.error('Error updating configuration', { error });
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
      isTabVisible: this.isTabVisible,
      isTabFocused: this.isTabFocused,
      config: this.config
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      focusEvents: 0,
      blurEvents: 0,
      totalPauseTime: 0,
      lastFocusTime: null,
      lastBlurTime: null
    };
    logger.debug('Tab awareness statistics reset');
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
      this.resetStats();
      logger.info('Tab awareness manager cleaned up');
      return true;
    } catch (error) {
      logger.error('Error cleaning up tab awareness manager', { error });
      return false;
    }
  }
}

/**
 * Create tab awareness manager instance
 * @param {Object} config - Configuration object
 * @returns {TabAwarenessManager} - Manager instance
 */
export function createTabAwarenessManager(config = {}) {
  return new TabAwarenessManager(config);
}

/**
 * Default tab awareness manager instance
 */
export const tabAwarenessManager = createTabAwarenessManager();
