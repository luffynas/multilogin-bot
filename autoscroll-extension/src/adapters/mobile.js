/**
 * Mobile adapter - handles mobile scrolling with touch events
 */

import { createLogger } from '../utils/logger.js';
import { dispatchTouchEvent, simulateNaturalTouchScroll } from '../utils/events.js';
import { getScrollPosition, getDocumentDimensions } from '../utils/dom.js';

const logger = createLogger('mobile-adapter');

/**
 * Mobile adapter for scrolling
 * Uses touch events and gesture simulation for mobile browsers
 */

/**
 * Initialize mobile adapter
 * @param {Object} config - Adapter configuration
 * @returns {Promise<boolean>} - Success status
 */
export async function initialize(config = {}) {
  try {
    logger.info('Initializing mobile adapter', { config });
    
    // Mobile adapter doesn't need special initialization
    // It uses standard DOM APIs
    
    logger.info('Mobile adapter initialized successfully');
    return true;
  } catch (error) {
    logger.error('Error initializing mobile adapter', { error });
    return false;
  }
}

/**
 * Execute scroll step
 * @param {Object} step - Step configuration
 * @returns {Promise<boolean>} - Success status
 */
export async function scroll(step) {
  try {
    if (!step || step.delta === 0) {
      return true;
    }
    
    logger.debug('Executing mobile scroll step', { step });
    
    // Get current scroll position
    const currentPosition = getScrollPosition();
    const docDimensions = getDocumentDimensions();
    
    // Calculate target position
    const targetY = currentPosition.y + step.delta;
    
    // Ensure we don't scroll beyond document bounds
    const maxScrollY = docDimensions.height - window.innerHeight;
    const clampedTargetY = Math.max(0, Math.min(targetY, maxScrollY));
    
    if (clampedTargetY === currentPosition.y) {
      logger.debug('Scroll target is same as current position, skipping');
      return true;
    }
    
    // Execute scroll based on configuration
    const success = await executeScroll(step, currentPosition.y, clampedTargetY);
    
    if (success) {
      logger.debug('Mobile scroll step executed successfully', { 
        from: currentPosition.y, 
        to: clampedTargetY,
        delta: step.delta
      });
    }
    
    return success;
  } catch (error) {
    logger.error('Error executing mobile scroll step', { error, step });
    return false;
  }
}

/**
 * Execute scroll with different methods
 * @param {Object} step - Step configuration
 * @param {number} fromY - Starting Y position
 * @param {number} toY - Target Y position
 * @returns {Promise<boolean>} - Success status
 */
async function executeScroll(step, fromY, toY) {
  try {
    const deltaY = toY - fromY;
    
    // Choose scroll method based on configuration
    if (step.easing && step.easing !== 'linear') {
      // Use touch gesture simulation
      return await executeTouchGesture(step, fromY, toY);
    } else {
      // Use native scroll
      return await executeNativeScroll(step, deltaY);
    }
  } catch (error) {
    logger.error('Error executing scroll', { error });
    return false;
  }
}

/**
 * Execute touch gesture scrolling
 * @param {Object} step - Step configuration
 * @param {number} fromY - Starting Y position
 * @param {number} toY - Target Y position
 * @returns {Promise<boolean>} - Success status
 */
async function executeTouchGesture(step, fromY, toY) {
  try {
    // Calculate touch parameters
    const touchStartY = window.innerHeight / 2;
    const touchEndY = touchStartY - (toY - fromY);
    const steps = Math.max(5, Math.abs(toY - fromY) / 50);
    const stepDuration = (step.duration || 500) / steps;
    
    // Simulate natural touch scroll
    await simulateNaturalTouchScroll(
      document.body,
      touchStartY,
      touchEndY,
      steps,
      stepDuration
    );
    
    return true;
  } catch (error) {
    logger.error('Error executing touch gesture', { error });
    return false;
  }
}

/**
 * Execute native scroll
 * @param {Object} step - Step configuration
 * @param {number} deltaY - Scroll delta
 * @returns {Promise<boolean>} - Success status
 */
async function executeNativeScroll(step, deltaY) {
  try {
    // Use native scrollBy for mobile
    window.scrollBy(0, deltaY);
    
    // Wait for scroll to complete
    await sleep(step.duration || 100);
    
    return true;
  } catch (error) {
    logger.error('Error executing native scroll', { error });
    return false;
  }
}

/**
 * Execute swipe gesture
 * @param {Object} config - Swipe configuration
 * @returns {Promise<boolean>} - Success status
 */
export async function swipe(config = {}) {
  try {
    const {
      direction = 'down',
      distance = 100,
      duration = 300,
      startX = window.innerWidth / 2,
      startY = window.innerHeight / 2
    } = config;
    
    logger.debug('Executing swipe gesture', { direction, distance, duration });
    
    // Calculate swipe parameters
    let endX = startX;
    let endY = startY;
    
    switch (direction) {
      case 'down':
        endY = startY + distance;
        break;
      case 'up':
        endY = startY - distance;
        break;
      case 'left':
        endX = startX - distance;
        break;
      case 'right':
        endX = startX + distance;
        break;
    }
    
    // Simulate touch swipe
    await simulateNaturalTouchScroll(
      document.body,
      startY,
      endY,
      Math.max(5, distance / 20),
      duration / Math.max(5, distance / 20)
    );
    
    return true;
  } catch (error) {
    logger.error('Error executing swipe gesture', { error });
    return false;
  }
}

/**
 * Execute tap gesture
 * @param {Object} config - Tap configuration
 * @returns {Promise<boolean>} - Success status
 */
export async function tap(config = {}) {
  try {
    const {
      x = window.innerWidth / 2,
      y = window.innerHeight / 2,
      duration = 100
    } = config;
    
    logger.debug('Executing tap gesture', { x, y, duration });
    
    // Create touch events for tap
    const touchData = {
      identifier: 1,
      target: document.body,
      clientX: x,
      clientY: y,
      screenX: x,
      screenY: y,
      pageX: x,
      pageY: y,
      radiusX: 10,
      radiusY: 10,
      rotationAngle: 0,
      force: 1.0
    };
    
    const touchStart = {
      touches: [touchData],
      targetTouches: [touchData],
      changedTouches: [touchData]
    };
    
    const touchEnd = {
      touches: [],
      targetTouches: [],
      changedTouches: [touchData]
    };
    
    // Dispatch touch events
    await dispatchTouchEvent(document.body, 'touchstart', touchStart);
    await sleep(duration);
    await dispatchTouchEvent(document.body, 'touchend', touchEnd);
    
    return true;
  } catch (error) {
    logger.error('Error executing tap gesture', { error });
    return false;
  }
}

/**
 * Get adapter capabilities
 * @returns {Object} - Adapter capabilities
 */
export function getCapabilities() {
  return {
    name: 'mobile',
    displayName: 'Mobile Adapter',
    description: 'Mobile scrolling with touch events and gesture simulation',
    version: '1.0.0',
    features: [
      'Touch event simulation',
      'Gesture simulation',
      'Swipe support',
      'Tap support',
      'Native fallback'
    ],
    supportedEvents: [
      'touchstart',
      'touchmove',
      'touchend',
      'touchcancel',
      'scroll'
    ],
    supportedGestures: [
      'swipe',
      'tap',
      'pinch',
      'rotate'
    ],
    precision: 'medium',
    performance: 'good'
  };
}

/**
 * Get adapter statistics
 * @returns {Object} - Adapter statistics
 */
export function getStats() {
  return {
    adapter: 'mobile',
    totalScrolls: 0,
    successfulScrolls: 0,
    failedScrolls: 0,
    totalSwipes: 0,
    totalTaps: 0,
    averageScrollTime: 0,
    lastScrollTime: null
  };
}

/**
 * Cleanup adapter
 * @returns {Promise<boolean>} - Success status
 */
export async function cleanup() {
  try {
    logger.info('Cleaning up mobile adapter');
    
    // Mobile adapter doesn't need special cleanup
    // It doesn't maintain persistent state
    
    logger.info('Mobile adapter cleaned up successfully');
    return true;
  } catch (error) {
    logger.error('Error cleaning up mobile adapter', { error });
    return false;
  }
}

/**
 * Test adapter functionality
 * @returns {Promise<boolean>} - Success status
 */
export async function test() {
  try {
    logger.info('Testing mobile adapter');
    
    // Test basic scroll functionality
    const testStep = {
      delta: 100,
      duration: 100,
      easing: 'ease-out',
      type: 'test'
    };
    
    const success = await scroll(testStep);
    
    if (success) {
      logger.info('Mobile adapter test passed');
    } else {
      logger.warn('Mobile adapter test failed');
    }
    
    return success;
  } catch (error) {
    logger.error('Error testing mobile adapter', { error });
    return false;
  }
}

/**
 * Sleep utility
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>} - Promise that resolves after delay
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
