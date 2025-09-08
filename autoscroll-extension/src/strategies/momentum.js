/**
 * Momentum scroll strategy - simulates natural momentum and inertia
 */

import { createLogger } from '../utils/logger.js';
import { randScrollStep, randDelay, jitter } from '../core/randomizer.js';

const logger = createLogger('momentum-strategy');

/**
 * Momentum scroll strategy
 * Simulates natural momentum with acceleration and deceleration
 */

/**
 * Get next scroll step
 * @param {Object} ctx - Context object
 * @returns {Object} - Next step configuration
 */
export function nextStep(ctx) {
  try {
    const { config, profile, randomizer, stats } = ctx;
    
    // Get configuration values
    const minStep = profile.minStep || config.minStep || 50;
    const maxStep = profile.maxStep || config.maxStep || 300;
    const minDelay = profile.minDelay || config.minDelay || 50;
    const maxDelay = profile.maxDelay || config.maxDelay || 200;
    const jitterPercent = profile.jitter || config.jitter || 0.2;
    
    // Calculate momentum based on recent steps
    const momentum = calculateMomentum(stats);
    
    // Generate base step
    const baseStep = randScrollStep(minStep, maxStep);
    
    // Apply momentum
    const momentumStep = baseStep * momentum.factor;
    
    // Add jitter
    const jitteredStep = jitter(momentumStep, jitterPercent);
    
    // Calculate delay based on momentum
    const baseDelay = randDelay(minDelay, maxDelay);
    const momentumDelay = baseDelay * momentum.delayFactor;
    
    // Add jitter to delay
    const jitteredDelay = jitter(momentumDelay, jitterPercent);
    
    const stepConfig = {
      delta: Math.round(jitteredStep),
      duration: Math.round(jitteredDelay),
      easing: getMomentumEasing(momentum.phase),
      type: 'momentum',
      momentum: momentum,
      timestamp: Date.now()
    };
    
    logger.debug('Generated momentum step', { stepConfig });
    
    return stepConfig;
  } catch (error) {
    logger.error('Error generating momentum step', { error });
    return null;
  }
}

/**
 * Calculate momentum based on recent steps
 * @param {Object} stats - Engine statistics
 * @returns {Object} - Momentum information
 */
function calculateMomentum(stats) {
  const recentSteps = stats.recentSteps || [];
  const stepCount = recentSteps.length;
  
  if (stepCount === 0) {
    // Starting momentum
    return {
      phase: 'acceleration',
      factor: 0.8,
      delayFactor: 1.2,
      direction: 1
    };
  }
  
  // Calculate average step size from recent steps
  const avgStep = recentSteps.reduce((sum, step) => sum + Math.abs(step.delta), 0) / stepCount;
  const lastStep = recentSteps[recentSteps.length - 1];
  
  // Determine momentum phase
  let phase = 'steady';
  let factor = 1.0;
  let delayFactor = 1.0;
  
  if (stepCount < 3) {
    // Acceleration phase
    phase = 'acceleration';
    factor = 0.7 + (stepCount * 0.1);
    delayFactor = 1.3 - (stepCount * 0.1);
  } else if (stepCount > 8) {
    // Deceleration phase
    phase = 'deceleration';
    factor = 1.0 - ((stepCount - 8) * 0.05);
    delayFactor = 1.0 + ((stepCount - 8) * 0.05);
  } else {
    // Steady phase
    phase = 'steady';
    factor = 1.0;
    delayFactor = 1.0;
  }
  
  // Add some randomness to momentum
  const randomFactor = 0.9 + Math.random() * 0.2; // 0.9 to 1.1
  factor *= randomFactor;
  
  // Ensure minimum values
  factor = Math.max(0.3, Math.min(2.0, factor));
  delayFactor = Math.max(0.5, Math.min(2.0, delayFactor));
  
  return {
    phase,
    factor,
    delayFactor,
    direction: lastStep.delta > 0 ? 1 : -1,
    avgStep
  };
}

/**
 * Get easing function based on momentum phase
 * @param {string} phase - Momentum phase
 * @returns {string} - CSS easing function
 */
function getMomentumEasing(phase) {
  const easings = {
    acceleration: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', // ease-out-quad
    steady: 'ease-out',
    deceleration: 'cubic-bezier(0.55, 0.085, 0.68, 0.53)' // ease-in-quad
  };
  
  return easings[phase] || 'ease-out';
}

/**
 * Handle section change
 * @param {Object} ctx - Context object
 * @param {Object} section - Section information
 */
export function onSectionChange(ctx, section) {
  try {
    logger.debug('Momentum strategy section change', { section });
    
    // Reset momentum on section change
    if (ctx.stats) {
      ctx.stats.recentSteps = [];
    }
  } catch (error) {
    logger.error('Error handling section change', { error });
  }
}

/**
 * Handle page bottom reached
 * @param {Object} ctx - Context object
 * @returns {Object|null} - Special step or null
 */
export function onPageBottom(ctx) {
  try {
    logger.debug('Momentum strategy reached page bottom');
    
    // Momentum strategy gradually slows down at page bottom
    return {
      delta: 0,
      duration: 1000,
      easing: 'ease-out',
      type: 'momentum-stop',
      timestamp: Date.now()
    };
  } catch (error) {
    logger.error('Error handling page bottom', { error });
    return null;
  }
}

/**
 * Handle page top reached
 * @param {Object} ctx - Context object
 * @returns {Object|null} - Special step or null
 */
export function onPageTop(ctx) {
  try {
    logger.debug('Momentum strategy reached page top');
    
    // Momentum strategy gradually slows down at page top
    return {
      delta: 0,
      duration: 1000,
      easing: 'ease-out',
      type: 'momentum-stop',
      timestamp: Date.now()
    };
  } catch (error) {
    logger.error('Error handling page top', { error });
    return null;
  }
}

/**
 * Get strategy information
 * @returns {Object} - Strategy information
 */
export function getStrategyInfo() {
  return {
    name: 'momentum',
    displayName: 'Momentum Scroll',
    description: 'Natural momentum with acceleration and deceleration',
    version: '1.0.0',
    features: [
      'Natural acceleration',
      'Momentum-based scrolling',
      'Smooth deceleration',
      'Realistic physics simulation'
    ],
    parameters: {
      minStep: { type: 'number', default: 50, min: 1, max: 1000 },
      maxStep: { type: 'number', default: 300, min: 1, max: 1000 },
      minDelay: { type: 'number', default: 50, min: 1, max: 10000 },
      maxDelay: { type: 'number', default: 200, min: 1, max: 10000 },
      jitter: { type: 'number', default: 0.2, min: 0, max: 1 }
    }
  };
}

/**
 * Validate strategy configuration
 * @param {Object} config - Configuration to validate
 * @returns {Object} - Validation result
 */
export function validateConfig(config) {
  const errors = [];
  const warnings = [];
  
  if (config.minStep >= config.maxStep) {
    errors.push('minStep must be less than maxStep');
  }
  
  if (config.minDelay >= config.maxDelay) {
    errors.push('minDelay must be less than maxDelay');
  }
  
  if (config.jitter > 0.3) {
    warnings.push('High jitter values may interfere with momentum calculation');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Get strategy statistics
 * @param {Object} ctx - Context object
 * @returns {Object} - Strategy statistics
 */
export function getStats(ctx) {
  try {
    const { stats } = ctx;
    
    return {
      totalSteps: stats.totalSteps || 0,
      totalDistance: stats.totalDistance || 0,
      averageStep: stats.totalSteps > 0 ? stats.totalDistance / stats.totalSteps : 0,
      strategy: 'momentum',
      momentumPhases: {
        acceleration: stats.accelerationSteps || 0,
        steady: stats.steadySteps || 0,
        deceleration: stats.decelerationSteps || 0
      }
    };
  } catch (error) {
    logger.error('Error getting strategy stats', { error });
    return {
      totalSteps: 0,
      totalDistance: 0,
      averageStep: 0,
      strategy: 'momentum',
      momentumPhases: {
        acceleration: 0,
        steady: 0,
        deceleration: 0
      }
    };
  }
}
