/**
 * Hover simulator for natural hover behavior and delays
 */

import { createLogger } from '@utils/logger.js';
import { randFloat, randInt, choice, jitter } from '@core/randomizer.js';
import { delay } from '@utils/time.js';

const logger = createLogger('hover-simulator');

/**
 * Hover Simulator
 * Simulates natural hover behavior with realistic delays and patterns
 */
export class HoverSimulator {
  constructor() {
    this.isActive = false;
    this.config = {
      enabled: true,
      hoverTypes: ['natural', 'precise', 'casual', 'focused'],
      currentType: 'natural',
      naturalHover: {
        enabled: true,
        delay: { min: 300, max: 1200 },
        multipleHovers: true,
        maxHovers: 3,
        hoverInterval: { min: 100, max: 500 },
        movementVariation: { min: 0.1, max: 0.3 },
        dwellTime: { min: 500, max: 2000 }
      },
      preciseHover: {
        enabled: true,
        delay: { min: 200, max: 800 },
        multipleHovers: false,
        maxHovers: 1,
        hoverInterval: { min: 50, max: 200 },
        movementVariation: { min: 0.05, max: 0.15 },
        dwellTime: { min: 300, max: 1000 }
      },
      casualHover: {
        enabled: true,
        delay: { min: 500, max: 2000 },
        multipleHovers: true,
        maxHovers: 5,
        hoverInterval: { min: 200, max: 800 },
        movementVariation: { min: 0.2, max: 0.5 },
        dwellTime: { min: 800, max: 3000 }
      },
      focusedHover: {
        enabled: true,
        delay: { min: 150, max: 600 },
        multipleHovers: true,
        maxHovers: 2,
        hoverInterval: { min: 80, max: 300 },
        movementVariation: { min: 0.08, max: 0.2 },
        dwellTime: { min: 400, max: 1500 }
      },
      behavior: {
        humanError: true,
        errorRate: 0.05,
        fatigue: true,
        fatigueRate: 0.1,
        learning: true,
        learningRate: 0.05,
        contextAware: true
      },
      patterns: {
        reading: {
          hoverFrequency: 0.3,
          dwellTime: { min: 1000, max: 3000 },
          movementType: 'natural'
        },
        scanning: {
          hoverFrequency: 0.7,
          dwellTime: { min: 200, max: 800 },
          movementType: 'casual'
        },
        interacting: {
          hoverFrequency: 0.9,
          dwellTime: { min: 300, max: 1200 },
          movementType: 'focused'
        },
        browsing: {
          hoverFrequency: 0.5,
          dwellTime: { min: 500, max: 2000 },
          movementType: 'natural'
        }
      }
    };
    
    this.stats = {
      totalHovers: 0,
      hoversByType: {},
      totalDwellTime: 0,
      averageDwellTime: 0,
      lastHoverTime: null,
      currentElement: null,
      hoverHistory: []
    };
    
    this.isHovering = false;
    this.hoverTimeout = null;
    this.eventListeners = new Map();
  }

  /**
   * Initialize hover simulator
   * @param {Object} config - Configuration object
   * @returns {Promise<boolean>} - Success status
   */
  async initialize(config = {}) {
    try {
      this.config = { ...this.config, ...config };
      
      // Validate configuration
      if (!this.validateConfig()) {
        logger.error('Invalid hover simulator configuration');
        return false;
      }
      
      logger.info('Hover simulator initialized', { config: this.config });
      return true;
    } catch (error) {
      logger.error('Error initializing hover simulator', { error });
      return false;
    }
  }

  /**
   * Start hover simulator
   * @returns {Promise<boolean>} - Success status
   */
  async start() {
    try {
      if (this.isActive) {
        logger.warn('Hover simulator already active');
        return false;
      }

      this.isActive = true;
      
      logger.info('Hover simulator started');
      return true;
    } catch (error) {
      logger.error('Error starting hover simulator', { error });
      return false;
    }
  }

  /**
   * Stop hover simulator
   * @returns {Promise<boolean>} - Success status
   */
  async stop() {
    try {
      if (!this.isActive) {
        logger.warn('Hover simulator not active');
        return false;
      }

      this.isActive = false;
      
      // Clear any pending hovers
      if (this.hoverTimeout) {
        clearTimeout(this.hoverTimeout);
        this.hoverTimeout = null;
      }
      
      this.isHovering = false;
      
      logger.info('Hover simulator stopped');
      return true;
    } catch (error) {
      logger.error('Error stopping hover simulator', { error });
      return false;
    }
  }

  /**
   * Simulate hover over element
   * @param {HTMLElement} element - Element to hover over
   * @param {Object} options - Hover options
   * @returns {Promise<boolean>} - Success status
   */
  async hoverOver(element, options = {}) {
    try {
      if (!this.isActive) {
        logger.warn('Hover simulator not active');
        return false;
      }
      
      if (this.isHovering) {
        logger.debug('Hover already active, queuing hover');
        return false;
      }
      
      this.isHovering = true;
      
      const hoverType = options.type || this.config.currentType;
      const hoverConfig = this.config[hoverType + 'Hover'];
      
      if (!hoverConfig.enabled) {
        logger.debug('Hover type disabled', { type: hoverType });
        this.isHovering = false;
        return false;
      }
      
      // Check for human error
      if (this.config.behavior.humanError && Math.random() < this.config.behavior.errorRate) {
        await this.simulateHoverError(element, hoverConfig);
        this.isHovering = false;
        return false;
      }
      
      // Apply fatigue
      if (this.config.behavior.fatigue) {
        this.applyFatigue(hoverConfig);
      }
      
      // Apply learning
      if (this.config.behavior.learning) {
        this.applyLearning(hoverConfig);
      }
      
      // Generate hover delay
      const hoverDelay = randInt(hoverConfig.delay.min, hoverConfig.delay.max);
      
      // Wait for hover delay
      await delay(hoverDelay);
      
      // Perform multiple hovers if configured
      if (hoverConfig.multipleHovers) {
        const numHovers = randInt(1, hoverConfig.maxHovers);
        await this.performMultipleHovers(element, numHovers, hoverConfig);
      } else {
        await this.performSingleHover(element, hoverConfig);
      }
      
      // Update statistics
      this.updateStats(hoverType, hoverConfig.dwellTime);
      
      this.isHovering = false;
      
      logger.debug('Hover simulated', { 
        element: element.tagName,
        type: hoverType,
        delay: hoverDelay
      });
      
      // Emit event
      this.emit('hoverPerformed', { 
        element, 
        type: hoverType, 
        delay: hoverDelay 
      });
      
      return true;
    } catch (error) {
      logger.error('Error simulating hover', { error, element });
      this.isHovering = false;
      return false;
    }
  }

  /**
   * Perform single hover
   * @param {HTMLElement} element - Element to hover over
   * @param {Object} config - Hover configuration
   * @returns {Promise<void>} - Promise that resolves when hover is complete
   */
  async performSingleHover(element, config) {
    try {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Add movement variation
      const variation = randFloat(config.movementVariation.min, config.movementVariation.max);
      const hoverX = centerX + (Math.random() - 0.5) * variation * rect.width;
      const hoverY = centerY + (Math.random() - 0.5) * variation * rect.height;
      
      // Dispatch hover events
      this.dispatchHoverEvents(element, { x: hoverX, y: hoverY });
      
      // Wait for dwell time
      const dwellTime = randInt(config.dwellTime.min, config.dwellTime.max);
      await delay(dwellTime);
      
      // Dispatch hover end events
      this.dispatchHoverEndEvents(element, { x: hoverX, y: hoverY });
      
    } catch (error) {
      logger.error('Error performing single hover', { error });
    }
  }

  /**
   * Perform multiple hovers
   * @param {HTMLElement} element - Element to hover over
   * @param {number} numHovers - Number of hovers to perform
   * @param {Object} config - Hover configuration
   * @returns {Promise<void>} - Promise that resolves when hovers are complete
   */
  async performMultipleHovers(element, numHovers, config) {
    try {
      for (let i = 0; i < numHovers; i++) {
        await this.performSingleHover(element, config);
        
        // Wait between hovers
        if (i < numHovers - 1) {
          const interval = randInt(config.hoverInterval.min, config.hoverInterval.max);
          await delay(interval);
        }
      }
    } catch (error) {
      logger.error('Error performing multiple hovers', { error });
    }
  }

  /**
   * Simulate hover error
   * @param {HTMLElement} element - Element to hover over
   * @param {Object} config - Hover configuration
   * @returns {Promise<void>} - Promise that resolves when error is simulated
   */
  async simulateHoverError(element, config) {
    try {
      const rect = element.getBoundingClientRect();
      const errorTypes = ['overshoot', 'undershoot', 'wrongElement', 'hesitation'];
      const errorType = choice(errorTypes);
      
      switch (errorType) {
        case 'overshoot':
          // Hover beyond the element
          const overshootX = rect.right + randInt(10, 50);
          const overshootY = rect.bottom + randInt(10, 50);
          this.dispatchHoverEvents(element, { x: overshootX, y: overshootY });
          break;
          
        case 'undershoot':
          // Hover before reaching the element
          const undershootX = rect.left - randInt(10, 50);
          const undershootY = rect.top - randInt(10, 50);
          this.dispatchHoverEvents(element, { x: undershootX, y: undershootY });
          break;
          
        case 'wrongElement':
          // Hover over a different element
          const nearbyElements = this.findNearbyElements(element);
          if (nearbyElements.length > 0) {
            const wrongElement = choice(nearbyElements);
            await this.hoverOver(wrongElement, { type: 'natural' });
          }
          break;
          
        case 'hesitation':
          // Hesitate before hovering
          const hesitationDelay = randInt(500, 2000);
          await delay(hesitationDelay);
          break;
      }
      
      logger.debug('Hover error simulated', { errorType });
    } catch (error) {
      logger.error('Error simulating hover error', { error });
    }
  }

  /**
   * Find nearby elements
   * @param {HTMLElement} element - Reference element
   * @returns {Array} - Array of nearby elements
   */
  findNearbyElements(element) {
    try {
      const rect = element.getBoundingClientRect();
      const nearbyElements = [];
      
      // Find elements within a certain radius
      const allElements = document.querySelectorAll('*');
      
      for (const el of allElements) {
        if (el === element) continue;
        
        const elRect = el.getBoundingClientRect();
        const distance = Math.sqrt(
          Math.pow(elRect.left - rect.left, 2) + Math.pow(elRect.top - rect.top, 2)
        );
        
        if (distance < 100) { // Within 100px
          nearbyElements.push(el);
        }
      }
      
      return nearbyElements;
    } catch (error) {
      logger.error('Error finding nearby elements', { error });
      return [];
    }
  }

  /**
   * Apply fatigue to hover configuration
   * @param {Object} config - Hover configuration
   */
  applyFatigue(config) {
    try {
      const fatigueFactor = 1 + (this.stats.totalHovers * this.config.behavior.fatigueRate);
      
      // Increase delays and dwell times
      config.delay.min *= fatigueFactor;
      config.delay.max *= fatigueFactor;
      config.dwellTime.min *= fatigueFactor;
      config.dwellTime.max *= fatigueFactor;
      
      // Increase movement variation
      config.movementVariation.min *= fatigueFactor;
      config.movementVariation.max *= fatigueFactor;
      
    } catch (error) {
      logger.error('Error applying fatigue', { error });
    }
  }

  /**
   * Apply learning to hover configuration
   * @param {Object} config - Hover configuration
   */
  applyLearning(config) {
    try {
      const learningFactor = 1 - (this.stats.totalHovers * this.config.behavior.learningRate);
      
      // Decrease delays and dwell times
      config.delay.min *= learningFactor;
      config.delay.max *= learningFactor;
      config.dwellTime.min *= learningFactor;
      config.dwellTime.max *= learningFactor;
      
      // Decrease movement variation
      config.movementVariation.min *= learningFactor;
      config.movementVariation.max *= learningFactor;
      
    } catch (error) {
      logger.error('Error applying learning', { error });
    }
  }

  /**
   * Dispatch hover events
   * @param {HTMLElement} element - Element being hovered
   * @param {Object} position - Mouse position
   */
  dispatchHoverEvents(element, position) {
    try {
      // Mouseenter event
      const enterEvent = new MouseEvent('mouseenter', {
        bubbles: true,
        cancelable: true,
        clientX: position.x,
        clientY: position.y,
        screenX: position.x,
        screenY: position.y
      });
      
      element.dispatchEvent(enterEvent);
      
      // Mouseover event
      const overEvent = new MouseEvent('mouseover', {
        bubbles: true,
        cancelable: true,
        clientX: position.x,
        clientY: position.y,
        screenX: position.x,
        screenY: position.y
      });
      
      element.dispatchEvent(overEvent);
      
      // Mousemove event
      const moveEvent = new MouseEvent('mousemove', {
        bubbles: true,
        cancelable: true,
        clientX: position.x,
        clientY: position.y,
        screenX: position.x,
        screenY: position.y
      });
      
      element.dispatchEvent(moveEvent);
      
    } catch (error) {
      logger.error('Error dispatching hover events', { error });
    }
  }

  /**
   * Dispatch hover end events
   * @param {HTMLElement} element - Element being hovered
   * @param {Object} position - Mouse position
   */
  dispatchHoverEndEvents(element, position) {
    try {
      // Mouseleave event
      const leaveEvent = new MouseEvent('mouseleave', {
        bubbles: true,
        cancelable: true,
        clientX: position.x,
        clientY: position.y,
        screenX: position.x,
        screenY: position.y
      });
      
      element.dispatchEvent(leaveEvent);
      
      // Mouseout event
      const outEvent = new MouseEvent('mouseout', {
        bubbles: true,
        cancelable: true,
        clientX: position.x,
        clientY: position.y,
        screenX: position.x,
        screenY: position.y
      });
      
      element.dispatchEvent(outEvent);
      
    } catch (error) {
      logger.error('Error dispatching hover end events', { error });
    }
  }

  /**
   * Set hover type
   * @param {string} type - Hover type
   * @returns {boolean} - Success status
   */
  setHoverType(type) {
    try {
      if (!this.config.hoverTypes.includes(type)) {
        logger.warn('Invalid hover type', { type });
        return false;
      }
      
      this.config.currentType = type;
      logger.debug('Hover type set', { type });
      return true;
    } catch (error) {
      logger.error('Error setting hover type', { error });
      return false;
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
      isHovering: this.isHovering,
      currentType: this.config.currentType,
      config: this.config
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      totalHovers: 0,
      hoversByType: {},
      totalDwellTime: 0,
      averageDwellTime: 0,
      lastHoverTime: null,
      currentElement: null,
      hoverHistory: []
    };
  }

  /**
   * Update configuration
   * @param {Object} newConfig - New configuration
   */
  updateConfig(newConfig) {
    try {
      this.config = { ...this.config, ...newConfig };
      logger.info('Hover simulator configuration updated', { config: this.config });
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
      if (!Array.isArray(this.config.hoverTypes) || this.config.hoverTypes.length === 0) {
        logger.error('Hover types must be a non-empty array');
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
      logger.info('Hover simulator cleaned up');
      return true;
    } catch (error) {
      logger.error('Error cleaning up hover simulator', { error });
      return false;
    }
  }
}

/**
 * Create hover simulator instance
 * @param {Object} config - Configuration object
 * @returns {HoverSimulator} - Simulator instance
 */
export function createHoverSimulator(config = {}) {
  return new HoverSimulator(config);
}

/**
 * Default hover simulator instance
 */
export const hoverSimulator = createHoverSimulator();
