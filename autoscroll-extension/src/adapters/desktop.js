/**
 * Desktop adapter - handles desktop scrolling with wheel events
 */

import { createLogger } from '../utils/logger.js';
import { dispatchWheelEvent, simulateNaturalScroll } from '../utils/events.js';
import { getScrollPosition, getDocumentDimensions } from '../utils/dom.js';

const logger = createLogger('desktop-adapter');

/**
 * Desktop adapter for scrolling
 * Uses wheel events and smooth scrolling for desktop browsers
 */

/**
 * Initialize desktop adapter
 * @param {Object} config - Adapter configuration
 * @returns {Promise<boolean>} - Success status
 */
export async function initialize(config = {}) {
  try {
    logger.info('Initializing desktop adapter', { config });
    
    // Desktop adapter doesn't need special initialization
    // It uses standard DOM APIs
    
    logger.info('Desktop adapter initialized successfully');
    return true;
  } catch (error) {
    logger.error('Error initializing desktop adapter', { error });
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
    
    logger.debug('Executing desktop scroll step', { step });
    
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
      logger.debug('Desktop scroll step executed successfully', { 
        from: currentPosition.y, 
        to: clampedTargetY,
        delta: step.delta
      });
    }
    
    return success;
  } catch (error) {
    logger.error('Error executing desktop scroll step', { error, step });
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
      // Use smooth scrolling
      return await executeSmoothScroll(step, fromY, toY);
    } else {
      // Use wheel events
      return await executeWheelScroll(step, deltaY);
    }
  } catch (error) {
    logger.error('Error executing scroll', { error });
    return false;
  }
}

/**
 * Execute smooth scrolling
 * @param {Object} step - Step configuration
 * @param {number} fromY - Starting Y position
 * @param {number} toY - Target Y position
 * @returns {Promise<boolean>} - Success status
 */
async function executeSmoothScroll(step, fromY, toY) {
  try {
    // Use native smooth scrolling
    window.scrollTo({
      top: toY,
      behavior: 'smooth'
    });
    
    // Wait for scroll to complete
    await waitForScrollComplete(fromY, toY, step.duration || 1000);
    
    return true;
  } catch (error) {
    logger.error('Error executing smooth scroll', { error });
    return false;
  }
}

/**
 * Execute wheel event scrolling
 * @param {Object} step - Step configuration
 * @param {number} deltaY - Scroll delta
 * @returns {Promise<boolean>} - Success status
 */
async function executeWheelScroll(step, deltaY) {
  try {
    // Create wheel event
    const wheelEvent = {
      deltaY: deltaY,
      deltaMode: 0, // DOM_DELTA_PIXEL
      bubbles: true,
      cancelable: true
    };
    
    // Dispatch wheel event
    const success = await dispatchWheelEvent(document.body, wheelEvent);
    
    if (!success) {
      // Fallback to native scroll
      window.scrollBy(0, deltaY);
    }
    
    return true;
  } catch (error) {
    logger.error('Error executing wheel scroll', { error });
    return false;
  }
}

/**
 * Wait for scroll to complete
 * @param {number} fromY - Starting Y position
 * @param {number} toY - Target Y position
 * @param {number} maxWait - Maximum wait time in ms
 * @returns {Promise<void>} - Promise that resolves when scroll is complete
 */
async function waitForScrollComplete(fromY, toY, maxWait = 1000) {
  const startTime = Date.now();
  const targetDelta = Math.abs(toY - fromY);
  
  return new Promise((resolve) => {
    const checkScroll = () => {
      const currentPosition = getScrollPosition();
      const currentDelta = Math.abs(currentPosition.y - fromY);
      
      // Check if we've reached the target or timeout
      if (currentDelta >= targetDelta * 0.9 || Date.now() - startTime >= maxWait) {
        resolve();
        return;
      }
      
      // Continue checking
      requestAnimationFrame(checkScroll);
    };
    
    checkScroll();
  });
}

/**
 * Get adapter capabilities
 * @returns {Object} - Adapter capabilities
 */
export function getCapabilities() {
  return {
    name: 'desktop',
    displayName: 'Desktop Adapter',
    description: 'Desktop scrolling with wheel events and smooth scrolling',
    version: '1.0.0',
    features: [
      'Wheel event simulation',
      'Smooth scrolling',
      'Precise control',
      'Native fallback'
    ],
    supportedEvents: [
      'wheel',
      'scroll',
      'mousemove',
      'mouseover',
      'mouseout'
    ],
    precision: 'high',
    performance: 'excellent'
  };
}

/**
 * Get adapter statistics
 * @returns {Object} - Adapter statistics
 */
export function getStats() {
  return {
    adapter: 'desktop',
    totalScrolls: 0,
    successfulScrolls: 0,
    failedScrolls: 0,
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
    logger.info('Cleaning up desktop adapter');
    
    // Desktop adapter doesn't need special cleanup
    // It doesn't maintain persistent state
    
    logger.info('Desktop adapter cleaned up successfully');
    return true;
  } catch (error) {
    logger.error('Error cleaning up desktop adapter', { error });
    return false;
  }
}

/**
 * Test adapter functionality
 * @returns {Promise<boolean>} - Success status
 */
export async function test() {
  try {
    logger.info('Testing desktop adapter');
    
    // Test basic scroll functionality
    const testStep = {
      delta: 100,
      duration: 100,
      easing: 'ease-out',
      type: 'test'
    };
    
    const success = await scroll(testStep);
    
    if (success) {
      logger.info('Desktop adapter test passed');
    } else {
      logger.warn('Desktop adapter test failed');
    }
    
    return success;
  } catch (error) {
    logger.error('Error testing desktop adapter', { error });
    return false;
  }
}
