/**
 * Cursor simulator for realistic mouse movement patterns
 */

import { createLogger } from '@utils/logger.js';
import { randFloat, randInt, choice, jitter } from '@core/randomizer.js';
import { delay } from '@utils/time.js';

const logger = createLogger('cursor-simulator');

/**
 * Cursor Simulator
 * Simulates realistic mouse cursor movements and behaviors
 */
export class CursorSimulator {
  constructor() {
    this.isActive = false;
    this.config = {
      enabled: true,
      movementTypes: ['natural', 'precise', 'casual', 'focused'],
      currentType: 'natural',
      naturalMovement: {
        enabled: true,
        speed: { min: 0.5, max: 2.0 },
        acceleration: { min: 0.8, max: 1.2 },
        jitter: { min: 0.1, max: 0.3 },
        curve: { min: 0.3, max: 0.8 },
        pause: { min: 50, max: 200 }
      },
      preciseMovement: {
        enabled: true,
        speed: { min: 0.3, max: 0.8 },
        acceleration: { min: 0.9, max: 1.1 },
        jitter: { min: 0.05, max: 0.15 },
        curve: { min: 0.1, max: 0.3 },
        pause: { min: 100, max: 300 }
      },
      casualMovement: {
        enabled: true,
        speed: { min: 0.8, max: 2.5 },
        acceleration: { min: 0.7, max: 1.3 },
        jitter: { min: 0.2, max: 0.5 },
        curve: { min: 0.5, max: 1.0 },
        pause: { min: 30, max: 150 }
      },
      focusedMovement: {
        enabled: true,
        speed: { min: 0.4, max: 1.0 },
        acceleration: { min: 0.8, max: 1.2 },
        jitter: { min: 0.08, max: 0.2 },
        curve: { min: 0.2, max: 0.6 },
        pause: { min: 80, max: 250 }
      },
      behavior: {
        hoverDelay: { min: 300, max: 1200 },
        clickDelay: { min: 50, max: 200 },
        doubleClickDelay: { min: 100, max: 300 },
        dragDelay: { min: 200, max: 500 },
        scrollDelay: { min: 100, max: 400 }
      },
      patterns: {
        reading: {
          speed: 0.6,
          jitter: 0.15,
          pause: 200,
          curve: 0.4
        },
        scanning: {
          speed: 1.2,
          jitter: 0.25,
          pause: 100,
          curve: 0.6
        },
        clicking: {
          speed: 0.8,
          jitter: 0.1,
          pause: 150,
          curve: 0.3
        },
        idle: {
          speed: 0.3,
          jitter: 0.05,
          pause: 500,
          curve: 0.2
        }
      }
    };
    
    this.stats = {
      totalMovements: 0,
      movementsByType: {},
      totalDistance: 0,
      averageSpeed: 0,
      lastMovementTime: null,
      currentPosition: { x: 0, y: 0 },
      targetPosition: { x: 0, y: 0 }
    };
    
    this.currentPath = [];
    this.isMoving = false;
    this.movementTimeout = null;
    this.eventListeners = new Map();
  }

  /**
   * Initialize cursor simulator
   * @param {Object} config - Configuration object
   * @returns {Promise<boolean>} - Success status
   */
  async initialize(config = {}) {
    try {
      this.config = { ...this.config, ...config };
      
      // Validate configuration
      if (!this.validateConfig()) {
        logger.error('Invalid cursor simulator configuration');
        return false;
      }
      
      // Set initial position
      this.stats.currentPosition = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      
      logger.info('Cursor simulator initialized', { config: this.config });
      return true;
    } catch (error) {
      logger.error('Error initializing cursor simulator', { error });
      return false;
    }
  }

  /**
   * Start cursor simulator
   * @returns {Promise<boolean>} - Success status
   */
  async start() {
    try {
      if (this.isActive) {
        logger.warn('Cursor simulator already active');
        return false;
      }

      this.isActive = true;
      
      logger.info('Cursor simulator started');
      return true;
    } catch (error) {
      logger.error('Error starting cursor simulator', { error });
      return false;
    }
  }

  /**
   * Stop cursor simulator
   * @returns {Promise<boolean>} - Success status
   */
  async stop() {
    try {
      if (!this.isActive) {
        logger.warn('Cursor simulator not active');
        return false;
      }

      this.isActive = false;
      
      // Clear any pending movements
      if (this.movementTimeout) {
        clearTimeout(this.movementTimeout);
        this.movementTimeout = null;
      }
      
      this.isMoving = false;
      
      logger.info('Cursor simulator stopped');
      return true;
    } catch (error) {
      logger.error('Error stopping cursor simulator', { error });
      return false;
    }
  }

  /**
   * Move cursor to position
   * @param {Object} target - Target position {x, y}
   * @param {Object} options - Movement options
   * @returns {Promise<boolean>} - Success status
   */
  async moveTo(target, options = {}) {
    try {
      if (!this.isActive) {
        logger.warn('Cursor simulator not active');
        return false;
      }
      
      if (this.isMoving) {
        logger.debug('Cursor already moving, queuing movement');
        return false;
      }
      
      const movementType = options.type || this.config.currentType;
      const movementConfig = this.config[movementType + 'Movement'];
      
      if (!movementConfig.enabled) {
        logger.debug('Movement type disabled', { type: movementType });
        return false;
      }
      
      this.isMoving = true;
      this.stats.targetPosition = { ...target };
      
      // Generate movement path
      const path = this.generateMovementPath(
        this.stats.currentPosition,
        target,
        movementConfig
      );
      
      // Execute movement
      await this.executeMovement(path, movementConfig);
      
      // Update position
      this.stats.currentPosition = { ...target };
      this.stats.totalMovements++;
      this.stats.movementsByType[movementType] = (this.stats.movementsByType[movementType] || 0) + 1;
      this.stats.lastMovementTime = Date.now();
      
      this.isMoving = false;
      
      logger.debug('Cursor moved to position', { 
        from: this.stats.currentPosition, 
        to: target,
        type: movementType
      });
      
      // Emit event
      this.emit('cursorMoved', { 
        from: this.stats.currentPosition, 
        to: target,
        type: movementType
      });
      
      return true;
    } catch (error) {
      logger.error('Error moving cursor', { error, target });
      this.isMoving = false;
      return false;
    }
  }

  /**
   * Generate movement path
   * @param {Object} start - Start position
   * @param {Object} end - End position
   * @param {Object} config - Movement configuration
   * @returns {Array} - Array of path points
   */
  generateMovementPath(start, end, config) {
    try {
      const path = [];
      const distance = Math.sqrt(
        Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
      );
      
      // Calculate number of steps based on distance and speed
      const baseSpeed = randFloat(config.speed.min, config.speed.max);
      const steps = Math.max(3, Math.floor(distance / (baseSpeed * 10)));
      
      // Generate control points for bezier curve
      const controlPoints = this.generateControlPoints(start, end, config);
      
      // Generate path points
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const point = this.calculateBezierPoint(t, controlPoints);
        
        // Add jitter
        const jitterAmount = randFloat(config.jitter.min, config.jitter.max);
        const jitteredPoint = {
          x: point.x + (Math.random() - 0.5) * jitterAmount * 10,
          y: point.y + (Math.random() - 0.5) * jitterAmount * 10
        };
        
        // Ensure point is within viewport
        jitteredPoint.x = Math.max(0, Math.min(window.innerWidth, jitteredPoint.x));
        jitteredPoint.y = Math.max(0, Math.min(window.innerHeight, jitteredPoint.y));
        
        path.push(jitteredPoint);
      }
      
      return path;
    } catch (error) {
      logger.error('Error generating movement path', { error });
      return [start, end];
    }
  }

  /**
   * Generate control points for bezier curve
   * @param {Object} start - Start position
   * @param {Object} end - End position
   * @param {Object} config - Movement configuration
   * @returns {Array} - Array of control points
   */
  generateControlPoints(start, end, config) {
    try {
      const distance = Math.sqrt(
        Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
      );
      
      const curveIntensity = randFloat(config.curve.min, config.curve.max);
      const controlDistance = distance * curveIntensity;
      
      // Calculate control points
      const angle = Math.atan2(end.y - start.y, end.x - start.x);
      const controlAngle1 = angle + (Math.random() - 0.5) * Math.PI * 0.5;
      const controlAngle2 = angle + (Math.random() - 0.5) * Math.PI * 0.5;
      
      const control1 = {
        x: start.x + Math.cos(controlAngle1) * controlDistance * 0.5,
        y: start.y + Math.sin(controlAngle1) * controlDistance * 0.5
      };
      
      const control2 = {
        x: end.x + Math.cos(controlAngle2) * controlDistance * 0.5,
        y: end.y + Math.sin(controlAngle2) * controlDistance * 0.5
      };
      
      return [start, control1, control2, end];
    } catch (error) {
      logger.error('Error generating control points', { error });
      return [start, end];
    }
  }

  /**
   * Calculate bezier point
   * @param {number} t - Parameter (0-1)
   * @param {Array} points - Control points
   * @returns {Object} - Calculated point
   */
  calculateBezierPoint(t, points) {
    try {
      if (points.length === 2) {
        // Linear interpolation
        return {
          x: points[0].x + t * (points[1].x - points[0].x),
          y: points[0].y + t * (points[1].y - points[0].y)
        };
      }
      
      if (points.length === 4) {
        // Cubic bezier
        const u = 1 - t;
        const tt = t * t;
        const uu = u * u;
        const uuu = uu * u;
        const ttt = tt * t;
        
        return {
          x: uuu * points[0].x + 3 * uu * t * points[1].x + 3 * u * tt * points[2].x + ttt * points[3].x,
          y: uuu * points[0].y + 3 * uu * t * points[1].y + 3 * u * tt * points[2].y + ttt * points[3].y
        };
      }
      
      return points[0];
    } catch (error) {
      logger.error('Error calculating bezier point', { error });
      return points[0];
    }
  }

  /**
   * Execute movement along path
   * @param {Array} path - Movement path
   * @param {Object} config - Movement configuration
   * @returns {Promise<void>} - Promise that resolves when movement is complete
   */
  async executeMovement(path, config) {
    try {
      for (let i = 0; i < path.length; i++) {
        const point = path[i];
        
        // Dispatch mousemove event
        this.dispatchMouseMove(point);
        
        // Calculate delay between points
        const baseDelay = randFloat(config.pause.min, config.pause.max);
        const acceleration = randFloat(config.acceleration.min, config.acceleration.max);
        const delay = baseDelay * acceleration;
        
        // Wait before next point
        if (i < path.length - 1) {
          await delay(delay);
        }
      }
    } catch (error) {
      logger.error('Error executing movement', { error });
    }
  }

  /**
   * Dispatch mousemove event
   * @param {Object} position - Mouse position
   */
  dispatchMouseMove(position) {
    try {
      const event = new MouseEvent('mousemove', {
        bubbles: true,
        cancelable: true,
        clientX: position.x,
        clientY: position.y,
        screenX: position.x,
        screenY: position.y,
        movementX: position.x - this.stats.currentPosition.x,
        movementY: position.y - this.stats.currentPosition.y
      });
      
      document.dispatchEvent(event);
      
      // Update current position
      this.stats.currentPosition = { ...position };
    } catch (error) {
      logger.error('Error dispatching mousemove event', { error });
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
        logger.warn('Cursor simulator not active');
        return false;
      }
      
      const rect = element.getBoundingClientRect();
      const targetX = rect.left + rect.width / 2;
      const targetY = rect.top + rect.height / 2;
      
      // Move cursor to element
      const moveSuccess = await this.moveTo({ x: targetX, y: targetY }, options);
      if (!moveSuccess) {
        return false;
      }
      
      // Wait for hover delay
      const hoverDelay = randInt(
        this.config.behavior.hoverDelay.min,
        this.config.behavior.hoverDelay.max
      );
      await delay(hoverDelay);
      
      // Dispatch hover events
      this.dispatchHoverEvents(element, { x: targetX, y: targetY });
      
      logger.debug('Hovered over element', { 
        element: element.tagName,
        position: { x: targetX, y: targetY }
      });
      
      return true;
    } catch (error) {
      logger.error('Error hovering over element', { error });
      return false;
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
    } catch (error) {
      logger.error('Error dispatching hover events', { error });
    }
  }

  /**
   * Simulate click on element
   * @param {HTMLElement} element - Element to click
   * @param {Object} options - Click options
   * @returns {Promise<boolean>} - Success status
   */
  async clickOn(element, options = {}) {
    try {
      if (!this.isActive) {
        logger.warn('Cursor simulator not active');
        return false;
      }
      
      const rect = element.getBoundingClientRect();
      const targetX = rect.left + rect.width / 2;
      const targetY = rect.top + rect.height / 2;
      
      // Move cursor to element
      const moveSuccess = await this.moveTo({ x: targetX, y: targetY }, options);
      if (!moveSuccess) {
        return false;
      }
      
      // Wait for click delay
      const clickDelay = randInt(
        this.config.behavior.clickDelay.min,
        this.config.behavior.clickDelay.max
      );
      await delay(clickDelay);
      
      // Dispatch click events
      this.dispatchClickEvents(element, { x: targetX, y: targetY });
      
      logger.debug('Clicked on element', { 
        element: element.tagName,
        position: { x: targetX, y: targetY }
      });
      
      return true;
    } catch (error) {
      logger.error('Error clicking on element', { error });
      return false;
    }
  }

  /**
   * Dispatch click events
   * @param {HTMLElement} element - Element being clicked
   * @param {Object} position - Mouse position
   */
  dispatchClickEvents(element, position) {
    try {
      // Mousedown event
      const downEvent = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
        clientX: position.x,
        clientY: position.y,
        screenX: position.x,
        screenY: position.y,
        button: 0
      });
      
      element.dispatchEvent(downEvent);
      
      // Wait a bit
      setTimeout(() => {
        // Mouseup event
        const upEvent = new MouseEvent('mouseup', {
          bubbles: true,
          cancelable: true,
          clientX: position.x,
          clientY: position.y,
          screenX: position.x,
          screenY: position.y,
          button: 0
        });
        
        element.dispatchEvent(upEvent);
        
        // Click event
        const clickEvent = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          clientX: position.x,
          clientY: position.y,
          screenX: position.x,
          screenY: position.y,
          button: 0
        });
        
        element.dispatchEvent(clickEvent);
      }, randInt(50, 150));
    } catch (error) {
      logger.error('Error dispatching click events', { error });
    }
  }

  /**
   * Set movement type
   * @param {string} type - Movement type
   * @returns {boolean} - Success status
   */
  setMovementType(type) {
    try {
      if (!this.config.movementTypes.includes(type)) {
        logger.warn('Invalid movement type', { type });
        return false;
      }
      
      this.config.currentType = type;
      logger.debug('Movement type set', { type });
      return true;
    } catch (error) {
      logger.error('Error setting movement type', { error });
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
      isMoving: this.isMoving,
      currentType: this.config.currentType,
      config: this.config
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      totalMovements: 0,
      movementsByType: {},
      totalDistance: 0,
      averageSpeed: 0,
      lastMovementTime: null,
      currentPosition: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
      targetPosition: { x: 0, y: 0 }
    };
  }

  /**
   * Update configuration
   * @param {Object} newConfig - New configuration
   */
  updateConfig(newConfig) {
    try {
      this.config = { ...this.config, ...newConfig };
      logger.info('Cursor simulator configuration updated', { config: this.config });
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
      if (!Array.isArray(this.config.movementTypes) || this.config.movementTypes.length === 0) {
        logger.error('Movement types must be a non-empty array');
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
      logger.info('Cursor simulator cleaned up');
      return true;
    } catch (error) {
      logger.error('Error cleaning up cursor simulator', { error });
      return false;
    }
  }
}

/**
 * Create cursor simulator instance
 * @param {Object} config - Configuration object
 * @returns {CursorSimulator} - Simulator instance
 */
export function createCursorSimulator(config = {}) {
  return new CursorSimulator(config);
}

/**
 * Default cursor simulator instance
 */
export const cursorSimulator = createCursorSimulator();
