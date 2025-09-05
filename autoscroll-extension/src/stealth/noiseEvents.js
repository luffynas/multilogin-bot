/**
 * Noise events generator for human-like behavior simulation
 */

import { createLogger } from '@utils/logger.js';
import { randFloat, randInt, choice } from '@core/randomizer.js';
import { createMouseEvent, createTouchEvent, dispatchEventNatural } from '@utils/events.js';
import { getViewportDimensions } from '@utils/dom.js';

const logger = createLogger('noise-events');

/**
 * Noise Events Generator
 * Generates subtle human-like interactions to avoid bot detection
 */
export class NoiseEventsGenerator {
  constructor() {
    this.isActive = false;
    this.eventTypes = ['mousemove', 'keypress', 'focus', 'blur'];
    this.scheduler = null;
    this.config = {
      frequency: 0.1, // 10% chance per second
      intensity: 'medium',
      types: ['mousemove', 'keypress']
    };
    this.stats = {
      totalEvents: 0,
      eventsByType: {},
      lastEventTime: null
    };
  }

  /**
   * Initialize noise events generator
   * @param {Object} config - Configuration object
   * @returns {Promise<boolean>} - Success status
   */
  async initialize(config = {}) {
    try {
      this.config = { ...this.config, ...config };
      logger.info('Noise events generator initialized', { config: this.config });
      return true;
    } catch (error) {
      logger.error('Error initializing noise events generator', { error });
      return false;
    }
  }

  /**
   * Start generating noise events
   * @returns {Promise<boolean>} - Success status
   */
  async start() {
    try {
      if (this.isActive) {
        logger.warn('Noise events generator already active');
        return false;
      }

      this.isActive = true;
      this.startScheduler();
      
      logger.info('Noise events generator started');
      return true;
    } catch (error) {
      logger.error('Error starting noise events generator', { error });
      return false;
    }
  }

  /**
   * Stop generating noise events
   * @returns {Promise<boolean>} - Success status
   */
  async stop() {
    try {
      if (!this.isActive) {
        logger.warn('Noise events generator not active');
        return false;
      }

      this.isActive = false;
      this.stopScheduler();
      
      logger.info('Noise events generator stopped');
      return true;
    } catch (error) {
      logger.error('Error stopping noise events generator', { error });
      return false;
    }
  }

  /**
   * Start the event scheduler
   */
  startScheduler() {
    if (this.scheduler) {
      this.stopScheduler();
    }

    this.scheduler = setInterval(() => {
      this.generateNoiseEvent();
    }, 1000); // Check every second
  }

  /**
   * Stop the event scheduler
   */
  stopScheduler() {
    if (this.scheduler) {
      clearInterval(this.scheduler);
      this.scheduler = null;
    }
  }

  /**
   * Generate a noise event
   */
  async generateNoiseEvent() {
    try {
      if (!this.isActive) {
        return;
      }

      // Check if we should generate an event
      if (Math.random() > this.config.frequency) {
        return;
      }

      // Select event type
      const eventType = choice(this.config.types);
      
      // Generate the event
      await this.generateEvent(eventType);
      
      // Update stats
      this.stats.totalEvents++;
      this.stats.eventsByType[eventType] = (this.stats.eventsByType[eventType] || 0) + 1;
      this.stats.lastEventTime = Date.now();
      
      logger.debug('Noise event generated', { eventType, stats: this.stats });
    } catch (error) {
      logger.error('Error generating noise event', { error });
    }
  }

  /**
   * Generate specific event type
   * @param {string} eventType - Type of event to generate
   */
  async generateEvent(eventType) {
    try {
      switch (eventType) {
        case 'mousemove':
          await this.generateMouseMove();
          break;
        case 'keypress':
          await this.generateKeyPress();
          break;
        case 'focus':
          await this.generateFocus();
          break;
        case 'blur':
          await this.generateBlur();
          break;
        default:
          logger.warn('Unknown event type', { eventType });
      }
    } catch (error) {
      logger.error('Error generating event', { error, eventType });
    }
  }

  /**
   * Generate mouse move event
   */
  async generateMouseMove() {
    try {
      const viewport = getViewportDimensions();
      
      // Generate random mouse position with slight movement
      const currentX = viewport.width / 2 + randInt(-50, 50);
      const currentY = viewport.height / 2 + randInt(-50, 50);
      
      // Create mouse move event
      const event = createMouseEvent('mousemove', {
        clientX: currentX,
        clientY: currentY,
        screenX: currentX,
        screenY: currentY,
        bubbles: true,
        cancelable: true
      });
      
      // Dispatch event
      await dispatchEventNatural(document.body, event, randInt(10, 50));
      
      logger.debug('Mouse move event generated', { x: currentX, y: currentY });
    } catch (error) {
      logger.error('Error generating mouse move event', { error });
    }
  }

  /**
   * Generate key press event
   */
  async generateKeyPress() {
    try {
      // Common keys that users might press
      const commonKeys = [
        'Tab', 'Enter', 'Space', 'ArrowUp', 'ArrowDown', 
        'ArrowLeft', 'ArrowRight', 'Escape', 'Backspace'
      ];
      
      const key = choice(commonKeys);
      
      // Create key press event
      const event = new KeyboardEvent('keydown', {
        key: key,
        code: `Key${key}`,
        bubbles: true,
        cancelable: true
      });
      
      // Dispatch event
      await dispatchEventNatural(document.body, event, randInt(5, 20));
      
      logger.debug('Key press event generated', { key });
    } catch (error) {
      logger.error('Error generating key press event', { error });
    }
  }

  /**
   * Generate focus event
   */
  async generateFocus() {
    try {
      // Create focus event
      const event = new FocusEvent('focus', {
        bubbles: true,
        cancelable: true
      });
      
      // Dispatch event
      await dispatchEventNatural(document.body, event, randInt(5, 15));
      
      logger.debug('Focus event generated');
    } catch (error) {
      logger.error('Error generating focus event', { error });
    }
  }

  /**
   * Generate blur event
   */
  async generateBlur() {
    try {
      // Create blur event
      const event = new FocusEvent('blur', {
        bubbles: true,
        cancelable: true
      });
      
      // Dispatch event
      await dispatchEventNatural(document.body, event, randInt(5, 15));
      
      logger.debug('Blur event generated');
    } catch (error) {
      logger.error('Error generating blur event', { error });
    }
  }

  /**
   * Generate micro mouse movements
   * @param {number} count - Number of micro movements
   */
  async generateMicroMovements(count = 3) {
    try {
      for (let i = 0; i < count; i++) {
        await this.generateMouseMove();
        await this.sleep(randInt(50, 150));
      }
    } catch (error) {
      logger.error('Error generating micro movements', { error });
    }
  }

  /**
   * Generate random idle behavior
   */
  async generateIdleBehavior() {
    try {
      const behaviors = [
        () => this.generateMouseMove(),
        () => this.generateKeyPress(),
        () => this.generateMicroMovements(2),
        () => this.sleep(randInt(100, 500))
      ];
      
      const behavior = choice(behaviors);
      await behavior();
      
      logger.debug('Idle behavior generated');
    } catch (error) {
      logger.error('Error generating idle behavior', { error });
    }
  }

  /**
   * Generate scroll-related noise
   */
  async generateScrollNoise() {
    try {
      // Generate subtle scroll events
      const deltaY = randInt(-10, 10);
      
      const event = new WheelEvent('wheel', {
        deltaY: deltaY,
        deltaMode: 0,
        bubbles: true,
        cancelable: true
      });
      
      await dispatchEventNatural(document.body, event, randInt(5, 15));
      
      logger.debug('Scroll noise generated', { deltaY });
    } catch (error) {
      logger.error('Error generating scroll noise', { error });
    }
  }

  /**
   * Generate touch noise (for mobile)
   */
  async generateTouchNoise() {
    try {
      const viewport = getViewportDimensions();
      const x = randInt(50, viewport.width - 50);
      const y = randInt(50, viewport.height - 50);
      
      // Create touch start event
      const startEvent = createTouchEvent('touchstart', {
        touches: [{
          identifier: 1,
          target: document.body,
          clientX: x,
          clientY: y,
          screenX: x,
          screenY: y
        }]
      });
      
      // Create touch end event
      const endEvent = createTouchEvent('touchend', {
        changedTouches: [{
          identifier: 1,
          target: document.body,
          clientX: x,
          clientY: y,
          screenX: x,
          screenY: y
        }]
      });
      
      // Dispatch events
      await dispatchEventNatural(document.body, startEvent, 0);
      await this.sleep(randInt(50, 200));
      await dispatchEventNatural(document.body, endEvent, 0);
      
      logger.debug('Touch noise generated', { x, y });
    } catch (error) {
      logger.error('Error generating touch noise', { error });
    }
  }

  /**
   * Update configuration
   * @param {Object} newConfig - New configuration
   */
  updateConfig(newConfig) {
    try {
      this.config = { ...this.config, ...newConfig };
      logger.info('Noise events configuration updated', { config: this.config });
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
      config: this.config
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      totalEvents: 0,
      eventsByType: {},
      lastEventTime: null
    };
    logger.debug('Noise events statistics reset');
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
      logger.info('Noise events generator cleaned up');
      return true;
    } catch (error) {
      logger.error('Error cleaning up noise events generator', { error });
      return false;
    }
  }
}

/**
 * Create noise events generator instance
 * @param {Object} config - Configuration object
 * @returns {NoiseEventsGenerator} - Generator instance
 */
export function createNoiseEventsGenerator(config = {}) {
  return new NoiseEventsGenerator(config);
}

/**
 * Default noise events generator instance
 */
export const noiseEventsGenerator = createNoiseEventsGenerator();
