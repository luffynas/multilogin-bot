/**
 * Error simulator for human-like mistakes and corrections
 */

import { createLogger } from '../utils/logger.js';
import { randFloat, randInt, choice, jitter } from '../core/randomizer.js';
import { delay } from '../utils/time.js';

const logger = createLogger('error-simulator');

/**
 * Error Simulator
 * Simulates human-like errors and corrections
 */
export class ErrorSimulator {
  constructor() {
    this.isActive = false;
    this.config = {
      enabled: true,
      errorTypes: ['scroll', 'click', 'hover', 'navigation', 'input'],
      currentType: 'scroll',
      scroll: {
        enabled: true,
        errorRate: 0.05,
        errorTypes: ['overshoot', 'undershoot', 'wrongDirection', 'hesitation'],
        overshoot: {
          probability: 0.4,
          correctionDelay: { min: 200, max: 800 },
          correctionDistance: { min: 50, max: 200 }
        },
        undershoot: {
          probability: 0.3,
          correctionDelay: { min: 100, max: 500 },
          correctionDistance: { min: 30, max: 150 }
        },
        wrongDirection: {
          probability: 0.2,
          correctionDelay: { min: 300, max: 1000 },
          correctionDistance: { min: 100, max: 300 }
        },
        hesitation: {
          probability: 0.1,
          correctionDelay: { min: 500, max: 2000 },
          correctionDistance: 0
        }
      },
      click: {
        enabled: true,
        errorRate: 0.03,
        errorTypes: ['miss', 'doubleClick', 'wrongElement', 'hesitation'],
        miss: {
          probability: 0.5,
          correctionDelay: { min: 200, max: 600 },
          retryAttempts: { min: 1, max: 3 }
        },
        doubleClick: {
          probability: 0.2,
          correctionDelay: { min: 100, max: 300 },
          retryAttempts: 1
        },
        wrongElement: {
          probability: 0.2,
          correctionDelay: { min: 300, max: 800 },
          retryAttempts: { min: 1, max: 2 }
        },
        hesitation: {
          probability: 0.1,
          correctionDelay: { min: 800, max: 2000 },
          retryAttempts: 1
        }
      },
      hover: {
        enabled: true,
        errorRate: 0.04,
        errorTypes: ['overshoot', 'undershoot', 'wrongElement', 'hesitation'],
        overshoot: {
          probability: 0.4,
          correctionDelay: { min: 150, max: 500 },
          correctionDistance: { min: 20, max: 100 }
        },
        undershoot: {
          probability: 0.3,
          correctionDelay: { min: 100, max: 400 },
          correctionDistance: { min: 10, max: 80 }
        },
        wrongElement: {
          probability: 0.2,
          correctionDelay: { min: 200, max: 600 },
          correctionDistance: { min: 50, max: 150 }
        },
        hesitation: {
          probability: 0.1,
          correctionDelay: { min: 400, max: 1200 },
          correctionDistance: 0
        }
      },
      navigation: {
        enabled: true,
        errorRate: 0.02,
        errorTypes: ['wrongLink', 'backButton', 'refresh', 'hesitation'],
        wrongLink: {
          probability: 0.4,
          correctionDelay: { min: 1000, max: 3000 },
          retryAttempts: 1
        },
        backButton: {
          probability: 0.3,
          correctionDelay: { min: 500, max: 2000 },
          retryAttempts: 1
        },
        refresh: {
          probability: 0.2,
          correctionDelay: { min: 2000, max: 5000 },
          retryAttempts: 1
        },
        hesitation: {
          probability: 0.1,
          correctionDelay: { min: 1000, max: 4000 },
          retryAttempts: 1
        }
      },
      input: {
        enabled: true,
        errorRate: 0.06,
        errorTypes: ['typo', 'wrongField', 'clearField', 'hesitation'],
        typo: {
          probability: 0.5,
          correctionDelay: { min: 200, max: 800 },
          retryAttempts: { min: 1, max: 3 }
        },
        wrongField: {
          probability: 0.2,
          correctionDelay: { min: 300, max: 1000 },
          retryAttempts: 1
        },
        clearField: {
          probability: 0.2,
          correctionDelay: { min: 100, max: 500 },
          retryAttempts: 1
        },
        hesitation: {
          probability: 0.1,
          correctionDelay: { min: 500, max: 2000 },
          retryAttempts: 1
        }
      },
      behavior: {
        humanVariation: true,
        fatigue: true,
        fatigueRate: 0.1,
        learning: true,
        learningRate: 0.05,
        contextAware: true,
        timeOfDay: true
      },
      patterns: {
        morning: {
          errorRate: 0.8,
          correctionSpeed: 1.2
        },
        afternoon: {
          errorRate: 1.0,
          correctionSpeed: 1.0
        },
        evening: {
          errorRate: 1.2,
          correctionSpeed: 0.8
        },
        night: {
          errorRate: 1.5,
          correctionSpeed: 0.6
        }
      }
    };
    
    this.stats = {
      totalErrors: 0,
      errorsByType: {},
      totalCorrections: 0,
      averageCorrectionTime: 0,
      lastErrorTime: null,
      currentError: null,
      errorHistory: []
    };
    
    this.isErrorActive = false;
    this.errorTimeout = null;
    this.eventListeners = new Map();
  }

  /**
   * Initialize error simulator
   * @param {Object} config - Configuration object
   * @returns {Promise<boolean>} - Success status
   */
  async initialize(config = {}) {
    try {
      this.config = { ...this.config, ...config };
      
      // Validate configuration
      if (!this.validateConfig()) {
        logger.error('Invalid error simulator configuration');
        return false;
      }
      
      logger.info('Error simulator initialized', { config: this.config });
      return true;
    } catch (error) {
      logger.error('Error initializing error simulator', { error });
      return false;
    }
  }

  /**
   * Start error simulator
   * @returns {Promise<boolean>} - Success status
   */
  async start() {
    try {
      if (this.isActive) {
        logger.warn('Error simulator already active');
        return false;
      }

      this.isActive = true;
      
      logger.info('Error simulator started');
      return true;
    } catch (error) {
      logger.error('Error starting error simulator', { error });
      return false;
    }
  }

  /**
   * Stop error simulator
   * @returns {Promise<boolean>} - Success status
   */
  async stop() {
    try {
      if (!this.isActive) {
        logger.warn('Error simulator not active');
        return false;
      }

      this.isActive = false;
      
      // Clear any pending errors
      if (this.errorTimeout) {
        clearTimeout(this.errorTimeout);
        this.errorTimeout = null;
      }
      
      this.isErrorActive = false;
      
      logger.info('Error simulator stopped');
      return true;
    } catch (error) {
      logger.error('Error stopping error simulator', { error });
      return false;
    }
  }

  /**
   * Simulate error for action
   * @param {string} actionType - Type of action
   * @param {Object} actionData - Action data
   * @param {Object} options - Error options
   * @returns {Promise<Object|null>} - Error object or null
   */
  async simulateError(actionType, actionData, options = {}) {
    try {
      if (!this.isActive) {
        logger.warn('Error simulator not active');
        return null;
      }
      
      if (this.isErrorActive) {
        logger.debug('Error already active, queuing error');
        return null;
      }
      
      this.isErrorActive = true;
      
      const errorConfig = this.config[actionType];
      if (!errorConfig || !errorConfig.enabled) {
        logger.debug('Error type disabled', { type: actionType });
        this.isErrorActive = false;
        return null;
      }
      
      // Calculate error rate
      let errorRate = errorConfig.errorRate;
      
      // Apply time of day patterns
      if (this.config.behavior.timeOfDay) {
        errorRate = this.applyTimeOfDayPatterns(errorRate);
      }
      
      // Apply fatigue
      if (this.config.behavior.fatigue) {
        errorRate = this.applyFatigue(errorRate);
      }
      
      // Apply learning
      if (this.config.behavior.learning) {
        errorRate = this.applyLearning(errorRate);
      }
      
      // Check if error should occur
      if (Math.random() > errorRate) {
        logger.debug('No error occurred', { actionType, errorRate });
        this.isErrorActive = false;
        return null;
      }
      
      // Select error type
      const errorType = this.selectErrorType(errorConfig);
      const errorTypeConfig = errorConfig[errorType];
      
      // Create error object
      const error = {
        type: actionType,
        errorType: errorType,
        actionData: actionData,
        timestamp: Date.now(),
        correctionDelay: randInt(errorTypeConfig.correctionDelay.min, errorTypeConfig.correctionDelay.max),
        retryAttempts: typeof errorTypeConfig.retryAttempts === 'object' ? 
          randInt(errorTypeConfig.retryAttempts.min, errorTypeConfig.retryAttempts.max) : 
          errorTypeConfig.retryAttempts,
        correctionDistance: typeof errorTypeConfig.correctionDistance === 'object' ? 
          randInt(errorTypeConfig.correctionDistance.min, errorTypeConfig.correctionDistance.max) : 
          errorTypeConfig.correctionDistance
      };
      
      // Simulate error
      await this.simulateErrorAction(error);
      
      // Update statistics
      this.updateStats(error);
      
      this.isErrorActive = false;
      
      logger.debug('Error simulated', { 
        actionType, 
        errorType, 
        correctionDelay: error.correctionDelay 
      });
      
      // Emit event
      this.emit('errorSimulated', { error });
      
      return error;
    } catch (error) {
      logger.error('Error simulating error', { error, actionType });
      this.isErrorActive = false;
      return null;
    }
  }

  /**
   * Select error type
   * @param {Object} errorConfig - Error configuration
   * @returns {string} - Selected error type
   */
  selectErrorType(errorConfig) {
    try {
      const errorTypes = errorConfig.errorTypes;
      const weights = errorTypes.map(type => errorConfig[type].probability);
      
      // Weighted random selection
      const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
      let random = Math.random() * totalWeight;
      
      for (let i = 0; i < errorTypes.length; i++) {
        random -= weights[i];
        if (random <= 0) {
          return errorTypes[i];
        }
      }
      
      return errorTypes[0]; // Fallback
    } catch (error) {
      logger.error('Error selecting error type', { error });
      return 'hesitation'; // Safe fallback
    }
  }

  /**
   * Simulate error action
   * @param {Object} error - Error object
   * @returns {Promise<void>} - Promise that resolves when error is simulated
   */
  async simulateErrorAction(error) {
    try {
      switch (error.type) {
        case 'scroll':
          await this.simulateScrollError(error);
          break;
        case 'click':
          await this.simulateClickError(error);
          break;
        case 'hover':
          await this.simulateHoverError(error);
          break;
        case 'navigation':
          await this.simulateNavigationError(error);
          break;
        case 'input':
          await this.simulateInputError(error);
          break;
        default:
          logger.warn('Unknown error type', { type: error.type });
      }
    } catch (error) {
      logger.error('Error simulating error action', { error });
    }
  }

  /**
   * Simulate scroll error
   * @param {Object} error - Error object
   * @returns {Promise<void>} - Promise that resolves when scroll error is simulated
   */
  async simulateScrollError(error) {
    try {
      const { actionData } = error;
      
      switch (error.errorType) {
        case 'overshoot':
          // Scroll too far
          const overshootDistance = error.correctionDistance;
          this.dispatchScrollEvent(actionData.delta + overshootDistance);
          break;
          
        case 'undershoot':
          // Scroll not far enough
          const undershootDistance = error.correctionDistance;
          this.dispatchScrollEvent(actionData.delta - undershootDistance);
          break;
          
        case 'wrongDirection':
          // Scroll in wrong direction
          this.dispatchScrollEvent(-actionData.delta);
          break;
          
        case 'hesitation':
          // Hesitate before scrolling
          await delay(error.correctionDelay);
          break;
      }
      
      // Wait for correction delay
      await delay(error.correctionDelay);
      
      // Perform correction
      this.dispatchScrollEvent(actionData.delta);
      
    } catch (error) {
      logger.error('Error simulating scroll error', { error });
    }
  }

  /**
   * Simulate click error
   * @param {Object} error - Error object
   * @returns {Promise<void>} - Promise that resolves when click error is simulated
   */
  async simulateClickError(error) {
    try {
      const { actionData } = error;
      
      switch (error.errorType) {
        case 'miss':
          // Click near but not on element
          const missOffset = { x: randInt(-20, 20), y: randInt(-20, 20) };
          this.dispatchClickEvent(actionData.x + missOffset.x, actionData.y + missOffset.y);
          break;
          
        case 'doubleClick':
          // Double click instead of single click
          this.dispatchClickEvent(actionData.x, actionData.y);
          await delay(100);
          this.dispatchClickEvent(actionData.x, actionData.y);
          break;
          
        case 'wrongElement':
          // Click on wrong element
          const wrongOffset = { x: randInt(-50, 50), y: randInt(-50, 50) };
          this.dispatchClickEvent(actionData.x + wrongOffset.x, actionData.y + wrongOffset.y);
          break;
          
        case 'hesitation':
          // Hesitate before clicking
          await delay(error.correctionDelay);
          break;
      }
      
      // Wait for correction delay
      await delay(error.correctionDelay);
      
      // Perform correction
      this.dispatchClickEvent(actionData.x, actionData.y);
      
    } catch (error) {
      logger.error('Error simulating click error', { error });
    }
  }

  /**
   * Simulate hover error
   * @param {Object} error - Error object
   * @returns {Promise<void>} - Promise that resolves when hover error is simulated
   */
  async simulateHoverError(error) {
    try {
      const { actionData } = error;
      
      switch (error.errorType) {
        case 'overshoot':
          // Hover beyond element
          const overshootOffset = { x: randInt(10, error.correctionDistance), y: randInt(10, error.correctionDistance) };
          this.dispatchHoverEvent(actionData.x + overshootOffset.x, actionData.y + overshootOffset.y);
          break;
          
        case 'undershoot':
          // Hover before reaching element
          const undershootOffset = { x: randInt(-error.correctionDistance, -10), y: randInt(-error.correctionDistance, -10) };
          this.dispatchHoverEvent(actionData.x + undershootOffset.x, actionData.y + undershootOffset.y);
          break;
          
        case 'wrongElement':
          // Hover on wrong element
          const wrongOffset = { x: randInt(-error.correctionDistance, error.correctionDistance), y: randInt(-error.correctionDistance, error.correctionDistance) };
          this.dispatchHoverEvent(actionData.x + wrongOffset.x, actionData.y + wrongOffset.y);
          break;
          
        case 'hesitation':
          // Hesitate before hovering
          await delay(error.correctionDelay);
          break;
      }
      
      // Wait for correction delay
      await delay(error.correctionDelay);
      
      // Perform correction
      this.dispatchHoverEvent(actionData.x, actionData.y);
      
    } catch (error) {
      logger.error('Error simulating hover error', { error });
    }
  }

  /**
   * Simulate navigation error
   * @param {Object} error - Error object
   * @returns {Promise<void>} - Promise that resolves when navigation error is simulated
   */
  async simulateNavigationError(error) {
    try {
      const { actionData } = error;
      
      switch (error.errorType) {
        case 'wrongLink':
          // Click on wrong link
          await delay(error.correctionDelay);
          // Simulate back navigation
          window.history.back();
          break;
          
        case 'backButton':
          // Accidentally press back button
          await delay(error.correctionDelay);
          window.history.back();
          break;
          
        case 'refresh':
          // Accidentally refresh page
          await delay(error.correctionDelay);
          window.location.reload();
          break;
          
        case 'hesitation':
          // Hesitate before navigating
          await delay(error.correctionDelay);
          break;
      }
      
    } catch (error) {
      logger.error('Error simulating navigation error', { error });
    }
  }

  /**
   * Simulate input error
   * @param {Object} error - Error object
   * @returns {Promise<void>} - Promise that resolves when input error is simulated
   */
  async simulateInputError(error) {
    try {
      const { actionData } = error;
      
      switch (error.errorType) {
        case 'typo':
          // Make a typo
          const typoText = actionData.text + 'x'; // Simple typo
          this.dispatchInputEvent(actionData.element, typoText);
          await delay(error.correctionDelay);
          // Correct the typo
          this.dispatchInputEvent(actionData.element, actionData.text);
          break;
          
        case 'wrongField':
          // Type in wrong field
          await delay(error.correctionDelay);
          // Clear wrong field and type in correct field
          this.dispatchInputEvent(actionData.element, '');
          this.dispatchInputEvent(actionData.element, actionData.text);
          break;
          
        case 'clearField':
          // Accidentally clear field
          this.dispatchInputEvent(actionData.element, '');
          await delay(error.correctionDelay);
          // Re-type content
          this.dispatchInputEvent(actionData.element, actionData.text);
          break;
          
        case 'hesitation':
          // Hesitate before typing
          await delay(error.correctionDelay);
          this.dispatchInputEvent(actionData.element, actionData.text);
          break;
      }
      
    } catch (error) {
      logger.error('Error simulating input error', { error });
    }
  }

  /**
   * Dispatch scroll event
   * @param {number} delta - Scroll delta
   */
  dispatchScrollEvent(delta) {
    try {
      const event = new WheelEvent('wheel', {
        bubbles: true,
        cancelable: true,
        deltaY: delta
      });
      
      document.dispatchEvent(event);
    } catch (error) {
      logger.error('Error dispatching scroll event', { error });
    }
  }

  /**
   * Dispatch click event
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   */
  dispatchClickEvent(x, y) {
    try {
      const event = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y,
        screenX: x,
        screenY: y
      });
      
      document.dispatchEvent(event);
    } catch (error) {
      logger.error('Error dispatching click event', { error });
    }
  }

  /**
   * Dispatch hover event
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   */
  dispatchHoverEvent(x, y) {
    try {
      const event = new MouseEvent('mouseover', {
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y,
        screenX: x,
        screenY: y
      });
      
      document.dispatchEvent(event);
    } catch (error) {
      logger.error('Error dispatching hover event', { error });
    }
  }

  /**
   * Dispatch input event
   * @param {HTMLElement} element - Input element
   * @param {string} text - Text to input
   */
  dispatchInputEvent(element, text) {
    try {
      element.value = text;
      
      const event = new Event('input', {
        bubbles: true,
        cancelable: true
      });
      
      element.dispatchEvent(event);
    } catch (error) {
      logger.error('Error dispatching input event', { error });
    }
  }

  /**
   * Apply time of day patterns
   * @param {number} errorRate - Base error rate
   * @returns {number} - Adjusted error rate
   */
  applyTimeOfDayPatterns(errorRate) {
    try {
      const hour = new Date().getHours();
      let pattern;
      
      if (hour >= 6 && hour < 12) {
        pattern = this.config.patterns.morning;
      } else if (hour >= 12 && hour < 18) {
        pattern = this.config.patterns.afternoon;
      } else if (hour >= 18 && hour < 22) {
        pattern = this.config.patterns.evening;
      } else {
        pattern = this.config.patterns.night;
      }
      
      return errorRate * pattern.errorRate;
    } catch (error) {
      logger.error('Error applying time of day patterns', { error });
      return errorRate;
    }
  }

  /**
   * Apply fatigue to error rate
   * @param {number} errorRate - Base error rate
   * @returns {number} - Fatigued error rate
   */
  applyFatigue(errorRate) {
    try {
      const fatigueFactor = 1 + (this.stats.totalErrors * this.config.behavior.fatigueRate);
      return errorRate * fatigueFactor;
    } catch (error) {
      logger.error('Error applying fatigue', { error });
      return errorRate;
    }
  }

  /**
   * Apply learning to error rate
   * @param {number} errorRate - Base error rate
   * @returns {number} - Learned error rate
   */
  applyLearning(errorRate) {
    try {
      const learningFactor = 1 - (this.stats.totalErrors * this.config.behavior.learningRate);
      return errorRate * learningFactor;
    } catch (error) {
      logger.error('Error applying learning', { error });
      return errorRate;
    }
  }

  /**
   * Update statistics
   * @param {Object} error - Error object
   */
  updateStats(error) {
    try {
      this.stats.totalErrors++;
      this.stats.errorsByType[error.type] = (this.stats.errorsByType[error.type] || 0) + 1;
      this.stats.totalCorrections += error.retryAttempts;
      this.stats.averageCorrectionTime = (this.stats.averageCorrectionTime + error.correctionDelay) / 2;
      this.stats.lastErrorTime = Date.now();
      this.stats.currentError = error;
      this.stats.errorHistory.push(error);
      
      // Keep only last 100 errors
      if (this.stats.errorHistory.length > 100) {
        this.stats.errorHistory = this.stats.errorHistory.slice(-100);
      }
    } catch (error) {
      logger.error('Error updating stats', { error });
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
      isErrorActive: this.isErrorActive,
      currentType: this.config.currentType,
      config: this.config
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      totalErrors: 0,
      errorsByType: {},
      totalCorrections: 0,
      averageCorrectionTime: 0,
      lastErrorTime: null,
      currentError: null,
      errorHistory: []
    };
  }

  /**
   * Update configuration
   * @param {Object} newConfig - New configuration
   */
  updateConfig(newConfig) {
    try {
      this.config = { ...this.config, ...newConfig };
      logger.info('Error simulator configuration updated', { config: this.config });
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
      if (!Array.isArray(this.config.errorTypes) || this.config.errorTypes.length === 0) {
        logger.error('Error types must be a non-empty array');
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
   * Cleanup resources
   * @returns {Promise<boolean>} - Success status
   */
  async cleanup() {
    try {
      await this.stop();
      this.resetStats();
      logger.info('Error simulator cleaned up');
      return true;
    } catch (error) {
      logger.error('Error cleaning up error simulator', { error });
      return false;
    }
  }
}

/**
 * Create error simulator instance
 * @param {Object} config - Configuration object
 * @returns {ErrorSimulator} - Simulator instance
 */
export function createErrorSimulator(config = {}) {
  return new ErrorSimulator(config);
}

/**
 * Default error simulator instance
 */
export const errorSimulator = createErrorSimulator();
