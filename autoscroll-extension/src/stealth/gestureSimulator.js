/**
 * Gesture simulator for mobile touch interactions
 */

import { createLogger } from '@utils/logger.js';
import { randFloat, randInt, choice, jitter } from '@core/randomizer.js';
import { delay } from '@utils/time.js';

const logger = createLogger('gesture-simulator');

/**
 * Gesture Simulator
 * Simulates realistic touch gestures and mobile interactions
 */
export class GestureSimulator {
  constructor() {
    this.isActive = false;
    this.config = {
      enabled: true,
      gestureTypes: ['tap', 'swipe', 'pinch', 'longPress', 'doubleTap'],
      currentType: 'tap',
      tap: {
        enabled: true,
        duration: { min: 50, max: 200 },
        pressure: { min: 0.5, max: 1.0 },
        size: { min: 0.8, max: 1.2 },
        jitter: { min: 0.1, max: 0.3 }
      },
      swipe: {
        enabled: true,
        duration: { min: 200, max: 800 },
        distance: { min: 50, max: 300 },
        direction: ['up', 'down', 'left', 'right'],
        velocity: { min: 0.5, max: 2.0 },
        acceleration: { min: 0.8, max: 1.2 }
      },
      pinch: {
        enabled: true,
        duration: { min: 300, max: 1000 },
        scale: { min: 0.5, max: 2.0 },
        center: { x: 0.5, y: 0.5 },
        fingers: 2
      },
      longPress: {
        enabled: true,
        duration: { min: 500, max: 2000 },
        pressure: { min: 0.7, max: 1.0 },
        size: { min: 1.0, max: 1.5 }
      },
      doubleTap: {
        enabled: true,
        interval: { min: 100, max: 300 },
        duration: { min: 50, max: 150 },
        pressure: { min: 0.6, max: 1.0 }
      },
      behavior: {
        naturalVariation: true,
        humanError: true,
        errorRate: 0.05,
        fatigue: true,
        fatigueRate: 0.1
      },
      patterns: {
        reading: {
          tapFrequency: 0.3,
          swipeFrequency: 0.7,
          longPressFrequency: 0.2
        },
        scrolling: {
          swipeFrequency: 0.9,
          tapFrequency: 0.1,
          longPressFrequency: 0.05
        },
        interacting: {
          tapFrequency: 0.8,
          swipeFrequency: 0.2,
          longPressFrequency: 0.3
        }
      }
    };
    
    this.stats = {
      totalGestures: 0,
      gesturesByType: {},
      totalDistance: 0,
      averageDuration: 0,
      lastGestureTime: null,
      currentPosition: { x: 0, y: 0 },
      touchPoints: new Map()
    };
    
    this.isGestureActive = false;
    this.gestureTimeout = null;
    this.eventListeners = new Map();
  }

  /**
   * Initialize gesture simulator
   * @param {Object} config - Configuration object
   * @returns {Promise<boolean>} - Success status
   */
  async initialize(config = {}) {
    try {
      this.config = { ...this.config, ...config };
      
      // Validate configuration
      if (!this.validateConfig()) {
        logger.error('Invalid gesture simulator configuration');
        return false;
      }
      
      // Set initial position
      this.stats.currentPosition = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      
      logger.info('Gesture simulator initialized', { config: this.config });
      return true;
    } catch (error) {
      logger.error('Error initializing gesture simulator', { error });
      return false;
    }
  }

  /**
   * Start gesture simulator
   * @returns {Promise<boolean>} - Success status
   */
  async start() {
    try {
      if (this.isActive) {
        logger.warn('Gesture simulator already active');
        return false;
      }

      this.isActive = true;
      
      logger.info('Gesture simulator started');
      return true;
    } catch (error) {
      logger.error('Error starting gesture simulator', { error });
      return false;
    }
  }

  /**
   * Stop gesture simulator
   * @returns {Promise<boolean>} - Success status
   */
  async stop() {
    try {
      if (!this.isActive) {
        logger.warn('Gesture simulator not active');
        return false;
      }

      this.isActive = false;
      
      // Clear any pending gestures
      if (this.gestureTimeout) {
        clearTimeout(this.gestureTimeout);
        this.gestureTimeout = null;
      }
      
      this.isGestureActive = false;
      
      logger.info('Gesture simulator stopped');
      return true;
    } catch (error) {
      logger.error('Error stopping gesture simulator', { error });
      return false;
    }
  }

  /**
   * Simulate tap gesture
   * @param {Object} position - Tap position {x, y}
   * @param {Object} options - Tap options
   * @returns {Promise<boolean>} - Success status
   */
  async tap(position, options = {}) {
    try {
      if (!this.isActive) {
        logger.warn('Gesture simulator not active');
        return false;
      }
      
      if (this.isGestureActive) {
        logger.debug('Gesture already active, queuing tap');
        return false;
      }
      
      this.isGestureActive = true;
      
      const config = this.config.tap;
      const duration = randInt(config.duration.min, config.duration.max);
      const pressure = randFloat(config.pressure.min, config.pressure.max);
      const size = randFloat(config.size.min, config.size.max);
      
      // Add jitter to position
      const jitteredPosition = this.addJitter(position, config.jitter);
      
      // Create touch point
      const touch = this.createTouch(jitteredPosition, pressure, size);
      
      // Dispatch touch events
      this.dispatchTouchStart([touch]);
      await delay(duration);
      this.dispatchTouchEnd([touch]);
      
      // Update statistics
      this.updateStats('tap', duration, 0);
      
      this.isGestureActive = false;
      
      logger.debug('Tap gesture simulated', { 
        position: jitteredPosition, 
        duration, 
        pressure, 
        size 
      });
      
      // Emit event
      this.emit('gesturePerformed', { 
        type: 'tap', 
        position: jitteredPosition, 
        duration, 
        pressure, 
        size 
      });
      
      return true;
    } catch (error) {
      logger.error('Error simulating tap gesture', { error, position });
      this.isGestureActive = false;
      return false;
    }
  }

  /**
   * Simulate swipe gesture
   * @param {Object} start - Start position {x, y}
   * @param {Object} end - End position {x, y}
   * @param {Object} options - Swipe options
   * @returns {Promise<boolean>} - Success status
   */
  async swipe(start, end, options = {}) {
    try {
      if (!this.isActive) {
        logger.warn('Gesture simulator not active');
        return false;
      }
      
      if (this.isGestureActive) {
        logger.debug('Gesture already active, queuing swipe');
        return false;
      }
      
      this.isGestureActive = true;
      
      const config = this.config.swipe;
      const duration = randInt(config.duration.min, config.duration.max);
      const velocity = randFloat(config.velocity.min, config.velocity.max);
      const acceleration = randFloat(config.acceleration.min, config.acceleration.max);
      
      // Calculate distance
      const distance = Math.sqrt(
        Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
      );
      
      // Generate swipe path
      const path = this.generateSwipePath(start, end, duration, velocity, acceleration);
      
      // Execute swipe
      await this.executeSwipe(path, duration);
      
      // Update statistics
      this.updateStats('swipe', duration, distance);
      
      this.isGestureActive = false;
      
      logger.debug('Swipe gesture simulated', { 
        start, 
        end, 
        duration, 
        distance, 
        velocity 
      });
      
      // Emit event
      this.emit('gesturePerformed', { 
        type: 'swipe', 
        start, 
        end, 
        duration, 
        distance, 
        velocity 
      });
      
      return true;
    } catch (error) {
      logger.error('Error simulating swipe gesture', { error, start, end });
      this.isGestureActive = false;
      return false;
    }
  }

  /**
   * Simulate pinch gesture
   * @param {Object} center - Center position {x, y}
   * @param {number} scale - Scale factor
   * @param {Object} options - Pinch options
   * @returns {Promise<boolean>} - Success status
   */
  async pinch(center, scale, options = {}) {
    try {
      if (!this.isActive) {
        logger.warn('Gesture simulator not active');
        return false;
      }
      
      if (this.isGestureActive) {
        logger.debug('Gesture already active, queuing pinch');
        return false;
      }
      
      this.isGestureActive = true;
      
      const config = this.config.pinch;
      const duration = randInt(config.duration.min, config.duration.max);
      const finalScale = randFloat(config.scale.min, config.scale.max) * scale;
      
      // Generate pinch path
      const path = this.generatePinchPath(center, finalScale, duration);
      
      // Execute pinch
      await this.executePinch(path, duration);
      
      // Update statistics
      this.updateStats('pinch', duration, 0);
      
      this.isGestureActive = false;
      
      logger.debug('Pinch gesture simulated', { 
        center, 
        scale: finalScale, 
        duration 
      });
      
      // Emit event
      this.emit('gesturePerformed', { 
        type: 'pinch', 
        center, 
        scale: finalScale, 
        duration 
      });
      
      return true;
    } catch (error) {
      logger.error('Error simulating pinch gesture', { error, center, scale });
      this.isGestureActive = false;
      return false;
    }
  }

  /**
   * Simulate long press gesture
   * @param {Object} position - Press position {x, y}
   * @param {Object} options - Long press options
   * @returns {Promise<boolean>} - Success status
   */
  async longPress(position, options = {}) {
    try {
      if (!this.isActive) {
        logger.warn('Gesture simulator not active');
        return false;
      }
      
      if (this.isGestureActive) {
        logger.debug('Gesture already active, queuing long press');
        return false;
      }
      
      this.isGestureActive = true;
      
      const config = this.config.longPress;
      const duration = randInt(config.duration.min, config.duration.max);
      const pressure = randFloat(config.pressure.min, config.pressure.max);
      const size = randFloat(config.size.min, config.size.max);
      
      // Add jitter to position
      const jitteredPosition = this.addJitter(position, 0.1);
      
      // Create touch point
      const touch = this.createTouch(jitteredPosition, pressure, size);
      
      // Dispatch touch events
      this.dispatchTouchStart([touch]);
      await delay(duration);
      this.dispatchTouchEnd([touch]);
      
      // Update statistics
      this.updateStats('longPress', duration, 0);
      
      this.isGestureActive = false;
      
      logger.debug('Long press gesture simulated', { 
        position: jitteredPosition, 
        duration, 
        pressure, 
        size 
      });
      
      // Emit event
      this.emit('gesturePerformed', { 
        type: 'longPress', 
        position: jitteredPosition, 
        duration, 
        pressure, 
        size 
      });
      
      return true;
    } catch (error) {
      logger.error('Error simulating long press gesture', { error, position });
      this.isGestureActive = false;
      return false;
    }
  }

  /**
   * Simulate double tap gesture
   * @param {Object} position - Tap position {x, y}
   * @param {Object} options - Double tap options
   * @returns {Promise<boolean>} - Success status
   */
  async doubleTap(position, options = {}) {
    try {
      if (!this.isActive) {
        logger.warn('Gesture simulator not active');
        return false;
      }
      
      if (this.isGestureActive) {
        logger.debug('Gesture already active, queuing double tap');
        return false;
      }
      
      this.isGestureActive = true;
      
      const config = this.config.doubleTap;
      const interval = randInt(config.interval.min, config.interval.max);
      const duration = randInt(config.duration.min, config.duration.max);
      const pressure = randFloat(config.pressure.min, config.pressure.max);
      
      // Add jitter to position
      const jitteredPosition = this.addJitter(position, 0.1);
      
      // First tap
      const touch1 = this.createTouch(jitteredPosition, pressure, 1.0);
      this.dispatchTouchStart([touch1]);
      await delay(duration);
      this.dispatchTouchEnd([touch1]);
      
      // Wait for interval
      await delay(interval);
      
      // Second tap
      const touch2 = this.createTouch(jitteredPosition, pressure, 1.0);
      this.dispatchTouchStart([touch2]);
      await delay(duration);
      this.dispatchTouchEnd([touch2]);
      
      // Update statistics
      this.updateStats('doubleTap', duration * 2 + interval, 0);
      
      this.isGestureActive = false;
      
      logger.debug('Double tap gesture simulated', { 
        position: jitteredPosition, 
        duration, 
        interval, 
        pressure 
      });
      
      // Emit event
      this.emit('gesturePerformed', { 
        type: 'doubleTap', 
        position: jitteredPosition, 
        duration, 
        interval, 
        pressure 
      });
      
      return true;
    } catch (error) {
      logger.error('Error simulating double tap gesture', { error, position });
      this.isGestureActive = false;
      return false;
    }
  }

  /**
   * Generate swipe path
   * @param {Object} start - Start position
   * @param {Object} end - End position
   * @param {number} duration - Swipe duration
   * @param {number} velocity - Swipe velocity
   * @param {number} acceleration - Swipe acceleration
   * @returns {Array} - Array of path points
   */
  generateSwipePath(start, end, duration, velocity, acceleration) {
    try {
      const path = [];
      const steps = Math.max(5, Math.floor(duration / 16)); // 60fps
      
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        
        // Apply acceleration curve
        const acceleratedT = this.applyAcceleration(t, acceleration);
        
        // Calculate position
        const x = start.x + (end.x - start.x) * acceleratedT;
        const y = start.y + (end.y - start.y) * acceleratedT;
        
        // Add natural variation
        const variation = this.config.behavior.naturalVariation ? 
          randFloat(-0.5, 0.5) : 0;
        
        path.push({
          x: x + variation,
          y: y + variation,
          t: t,
          pressure: 1.0,
          size: 1.0
        });
      }
      
      return path;
    } catch (error) {
      logger.error('Error generating swipe path', { error });
      return [start, end];
    }
  }

  /**
   * Generate pinch path
   * @param {Object} center - Center position
   * @param {number} scale - Scale factor
   * @param {number} duration - Pinch duration
   * @returns {Array} - Array of path points
   */
  generatePinchPath(center, scale, duration) {
    try {
      const path = [];
      const steps = Math.max(5, Math.floor(duration / 16)); // 60fps
      const baseDistance = 50; // Base distance between fingers
      
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const currentScale = 1 + (scale - 1) * t;
        const currentDistance = baseDistance * currentScale;
        
        // Calculate finger positions
        const finger1 = {
          x: center.x - currentDistance / 2,
          y: center.y,
          pressure: 1.0,
          size: 1.0
        };
        
        const finger2 = {
          x: center.x + currentDistance / 2,
          y: center.y,
          pressure: 1.0,
          size: 1.0
        };
        
        path.push({
          fingers: [finger1, finger2],
          scale: currentScale,
          t: t
        });
      }
      
      return path;
    } catch (error) {
      logger.error('Error generating pinch path', { error });
      return [];
    }
  }

  /**
   * Execute swipe gesture
   * @param {Array} path - Swipe path
   * @param {number} duration - Swipe duration
   * @returns {Promise<void>} - Promise that resolves when swipe is complete
   */
  async executeSwipe(path, duration) {
    try {
      const stepDuration = duration / path.length;
      
      for (let i = 0; i < path.length; i++) {
        const point = path[i];
        const touch = this.createTouch(point, point.pressure, point.size);
        
        if (i === 0) {
          this.dispatchTouchStart([touch]);
        } else if (i === path.length - 1) {
          this.dispatchTouchEnd([touch]);
        } else {
          this.dispatchTouchMove([touch]);
        }
        
        if (i < path.length - 1) {
          await delay(stepDuration);
        }
      }
    } catch (error) {
      logger.error('Error executing swipe', { error });
    }
  }

  /**
   * Execute pinch gesture
   * @param {Array} path - Pinch path
   * @param {number} duration - Pinch duration
   * @returns {Promise<void>} - Promise that resolves when pinch is complete
   */
  async executePinch(path, duration) {
    try {
      const stepDuration = duration / path.length;
      
      for (let i = 0; i < path.length; i++) {
        const point = path[i];
        const touches = point.fingers.map(finger => 
          this.createTouch(finger, finger.pressure, finger.size)
        );
        
        if (i === 0) {
          this.dispatchTouchStart(touches);
        } else if (i === path.length - 1) {
          this.dispatchTouchEnd(touches);
        } else {
          this.dispatchTouchMove(touches);
        }
        
        if (i < path.length - 1) {
          await delay(stepDuration);
        }
      }
    } catch (error) {
      logger.error('Error executing pinch', { error });
    }
  }

  /**
   * Create touch object
   * @param {Object} position - Touch position
   * @param {number} pressure - Touch pressure
   * @param {number} size - Touch size
   * @returns {Object} - Touch object
   */
  createTouch(position, pressure, size) {
    return {
      identifier: Date.now() + Math.random(),
      target: document.body,
      clientX: position.x,
      clientY: position.y,
      screenX: position.x,
      screenY: position.y,
      pageX: position.x,
      pageY: position.y,
      force: pressure,
      radiusX: size * 10,
      radiusY: size * 10,
      rotationAngle: 0,
      altitudeAngle: 0,
      azimuthAngle: 0
    };
  }

  /**
   * Add jitter to position
   * @param {Object} position - Original position
   * @param {number} jitterAmount - Jitter amount
   * @returns {Object} - Jittered position
   */
  addJitter(position, jitterAmount) {
    const jitterX = (Math.random() - 0.5) * jitterAmount * 20;
    const jitterY = (Math.random() - 0.5) * jitterAmount * 20;
    
    return {
      x: Math.max(0, Math.min(window.innerWidth, position.x + jitterX)),
      y: Math.max(0, Math.min(window.innerHeight, position.y + jitterY))
    };
  }

  /**
   * Apply acceleration curve
   * @param {number} t - Time parameter (0-1)
   * @param {number} acceleration - Acceleration factor
   * @returns {number} - Accelerated time parameter
   */
  applyAcceleration(t, acceleration) {
    if (acceleration > 1) {
      // Ease out
      return 1 - Math.pow(1 - t, acceleration);
    } else if (acceleration < 1) {
      // Ease in
      return Math.pow(t, 1 / acceleration);
    } else {
      // Linear
      return t;
    }
  }

  /**
   * Dispatch touch start event
   * @param {Array} touches - Array of touch objects
   */
  dispatchTouchStart(touches) {
    try {
      const event = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
        touches: touches,
        targetTouches: touches,
        changedTouches: touches
      });
      
      document.dispatchEvent(event);
    } catch (error) {
      logger.error('Error dispatching touch start event', { error });
    }
  }

  /**
   * Dispatch touch move event
   * @param {Array} touches - Array of touch objects
   */
  dispatchTouchMove(touches) {
    try {
      const event = new TouchEvent('touchmove', {
        bubbles: true,
        cancelable: true,
        touches: touches,
        targetTouches: touches,
        changedTouches: touches
      });
      
      document.dispatchEvent(event);
    } catch (error) {
      logger.error('Error dispatching touch move event', { error });
    }
  }

  /**
   * Dispatch touch end event
   * @param {Array} touches - Array of touch objects
   */
  dispatchTouchEnd(touches) {
    try {
      const event = new TouchEvent('touchend', {
        bubbles: true,
        cancelable: true,
        touches: [],
        targetTouches: [],
        changedTouches: touches
      });
      
      document.dispatchEvent(event);
    } catch (error) {
      logger.error('Error dispatching touch end event', { error });
    }
  }

  /**
   * Update statistics
   * @param {string} type - Gesture type
   * @param {number} duration - Gesture duration
   * @param {number} distance - Gesture distance
   */
  updateStats(type, duration, distance) {
    try {
      this.stats.totalGestures++;
      this.stats.gesturesByType[type] = (this.stats.gesturesByType[type] || 0) + 1;
      this.stats.totalDistance += distance;
      this.stats.averageDuration = (this.stats.averageDuration + duration) / 2;
      this.stats.lastGestureTime = Date.now();
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
      isGestureActive: this.isGestureActive,
      currentType: this.config.currentType,
      config: this.config
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      totalGestures: 0,
      gesturesByType: {},
      totalDistance: 0,
      averageDuration: 0,
      lastGestureTime: null,
      currentPosition: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
      touchPoints: new Map()
    };
  }

  /**
   * Update configuration
   * @param {Object} newConfig - New configuration
   */
  updateConfig(newConfig) {
    try {
      this.config = { ...this.config, ...newConfig };
      logger.info('Gesture simulator configuration updated', { config: this.config });
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
      if (!Array.isArray(this.config.gestureTypes) || this.config.gestureTypes.length === 0) {
        logger.error('Gesture types must be a non-empty array');
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
      logger.info('Gesture simulator cleaned up');
      return true;
    } catch (error) {
      logger.error('Error cleaning up gesture simulator', { error });
      return false;
    }
  }
}

/**
 * Create gesture simulator instance
 * @param {Object} config - Configuration object
 * @returns {GestureSimulator} - Simulator instance
 */
export function createGestureSimulator(config = {}) {
  return new GestureSimulator(config);
}

/**
 * Default gesture simulator instance
 */
export const gestureSimulator = createGestureSimulator();
