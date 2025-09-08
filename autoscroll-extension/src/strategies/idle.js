/**
 * Idle strategy - natural pauses and reading behavior
 */

import { createLogger } from '../utils/logger.js';
import { randFloat, randInt, choice, randHumanPause, randHesitation } from '../core/randomizer.js';
import { createReadingPause, createNaturalPause } from '../utils/time.js';

const logger = createLogger('idle-strategy');

/**
 * Idle scroll strategy
 * Provides natural pauses and reading behavior simulation
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
    const minStep = profile.minStep || config.minStep || 30;
    const maxStep = profile.maxStep || config.maxStep || 150;
    const minDelay = profile.minDelay || config.minDelay || 200;
    const maxDelay = profile.maxDelay || config.maxDelay || 800;
    const jitterPercent = profile.jitter || config.jitter || 0.2;
    
    // Determine if this should be an idle period
    const shouldIdle = shouldEnterIdlePeriod(stats, profile);
    
    if (shouldIdle) {
      return generateIdleStep(profile, config);
    } else {
      return generateScrollStep(minStep, maxStep, minDelay, maxDelay, jitterPercent, profile);
    }
  } catch (error) {
    logger.error('Error generating idle step', { error });
    return null;
  }
}

/**
 * Determine if should enter idle period
 * @param {Object} stats - Engine statistics
 * @param {Object} profile - Profile configuration
 * @returns {boolean} - True if should idle
 */
function shouldEnterIdlePeriod(stats, profile) {
  try {
    const recentSteps = stats.recentSteps || [];
    const stepCount = recentSteps.length;
    
    // Base idle probability
    let idleProbability = profile.idleProbability || 0.15;
    
    // Increase probability based on recent activity
    if (stepCount > 10) {
      idleProbability += 0.1; // More likely to idle after many steps
    }
    
    // Increase probability based on content type
    if (profile.contentAware) {
      const contentFactor = getContentIdleFactor(stats);
      idleProbability += contentFactor;
    }
    
    // Random chance
    return Math.random() < idleProbability;
  } catch (error) {
    logger.error('Error determining idle period', { error });
    return false;
  }
}

/**
 * Get content-based idle factor
 * @param {Object} stats - Engine statistics
 * @returns {number} - Idle factor based on content
 */
function getContentIdleFactor(stats) {
  try {
    // Simulate content analysis
    const contentTypes = {
      text: 0.1,      // More likely to idle on text
      images: 0.05,   // Less likely to idle on images
      videos: 0.2,    // Very likely to idle on videos
      ads: -0.1       // Less likely to idle on ads
    };
    
    // For now, use random content type
    const contentType = choice(Object.keys(contentTypes));
    return contentTypes[contentType];
  } catch (error) {
    logger.error('Error getting content idle factor', { error });
    return 0;
  }
}

/**
 * Generate idle step
 * @param {Object} profile - Profile configuration
 * @param {Object} config - Configuration
 * @returns {Object} - Idle step configuration
 */
function generateIdleStep(profile, config) {
  try {
    const idleTypes = ['reading', 'thinking', 'distraction', 'micro-pause'];
    const idleType = choice(idleTypes);
    
    let duration;
    let behavior;
    
    switch (idleType) {
      case 'reading':
        duration = generateReadingPause(profile);
        behavior = 'reading';
        break;
      case 'thinking':
        duration = generateThinkingPause(profile);
        behavior = 'thinking';
        break;
      case 'distraction':
        duration = generateDistractionPause(profile);
        behavior = 'distraction';
        break;
      case 'micro-pause':
        duration = generateMicroPause(profile);
        behavior = 'micro-pause';
        break;
      default:
        duration = generateReadingPause(profile);
        behavior = 'reading';
    }
    
    const stepConfig = {
      delta: 0,
      duration: duration,
      easing: 'linear',
      type: 'idle',
      idleType: idleType,
      behavior: behavior,
      timestamp: Date.now()
    };
    
    logger.debug('Generated idle step', { stepConfig });
    
    return stepConfig;
  } catch (error) {
    logger.error('Error generating idle step', { error });
    return null;
  }
}

/**
 * Generate scroll step
 * @param {number} minStep - Minimum step
 * @param {number} maxStep - Maximum step
 * @param {number} minDelay - Minimum delay
 * @param {number} maxDelay - Maximum delay
 * @param {number} jitterPercent - Jitter percentage
 * @param {Object} profile - Profile configuration
 * @returns {Object} - Scroll step configuration
 */
function generateScrollStep(minStep, maxStep, minDelay, maxDelay, jitterPercent, profile) {
  try {
    // Generate smaller steps for idle strategy
    const adjustedMinStep = minStep * 0.7;
    const adjustedMaxStep = maxStep * 0.8;
    
    const step = randInt(adjustedMinStep, adjustedMaxStep);
    const delay = randInt(minDelay, maxDelay);
    
    // Add jitter
    const jitteredStep = step + (step * jitterPercent * (Math.random() - 0.5));
    const jitteredDelay = delay + (delay * jitterPercent * (Math.random() - 0.5));
    
    const stepConfig = {
      delta: Math.round(jitteredStep),
      duration: Math.round(jitteredDelay),
      easing: 'ease-out',
      type: 'idle-scroll',
      timestamp: Date.now()
    };
    
    logger.debug('Generated scroll step', { stepConfig });
    
    return stepConfig;
  } catch (error) {
    logger.error('Error generating scroll step', { error });
    return null;
  }
}

/**
 * Generate reading pause duration
 * @param {Object} profile - Profile configuration
 * @returns {number} - Reading pause duration in ms
 */
function generateReadingPause(profile) {
  try {
    const baseDuration = profile.readingPause?.baseMs || 2000;
    const variation = profile.readingPause?.variation || 0.5;
    
    // Simulate reading time based on content
    const contentLength = randInt(100, 500); // Simulated content length
    const readingSpeed = profile.readingSpeed || 200; // chars per minute
    
    const readingTime = (contentLength / readingSpeed) * 60 * 1000; // Convert to ms
    const variedTime = readingTime * (1 + (Math.random() - 0.5) * variation);
    
    return Math.max(baseDuration, Math.min(10000, variedTime));
  } catch (error) {
    logger.error('Error generating reading pause', { error });
    return 2000;
  }
}

/**
 * Generate thinking pause duration
 * @param {Object} profile - Profile configuration
 * @returns {number} - Thinking pause duration in ms
 */
function generateThinkingPause(profile) {
  try {
    const baseDuration = profile.thinkingPause?.baseMs || 1500;
    const variation = profile.thinkingPause?.variation || 0.4;
    
    // Thinking pauses are usually shorter than reading pauses
    const thinkingTime = baseDuration * (1 + (Math.random() - 0.5) * variation);
    
    return Math.max(500, Math.min(5000, thinkingTime));
  } catch (error) {
    logger.error('Error generating thinking pause', { error });
    return 1500;
  }
}

/**
 * Generate distraction pause duration
 * @param {Object} profile - Profile configuration
 * @returns {number} - Distraction pause duration in ms
 */
function generateDistractionPause(profile) {
  try {
    const baseDuration = profile.distractionPause?.baseMs || 3000;
    const variation = profile.distractionPause?.variation || 0.6;
    
    // Distraction pauses can be longer
    const distractionTime = baseDuration * (1 + (Math.random() - 0.5) * variation);
    
    return Math.max(1000, Math.min(15000, distractionTime));
  } catch (error) {
    logger.error('Error generating distraction pause', { error });
    return 3000;
  }
}

/**
 * Generate micro pause duration
 * @param {Object} profile - Profile configuration
 * @returns {number} - Micro pause duration in ms
 */
function generateMicroPause(profile) {
  try {
    const baseDuration = profile.microPause?.baseMs || 500;
    const variation = profile.microPause?.variation || 0.3;
    
    // Micro pauses are very short
    const microTime = baseDuration * (1 + (Math.random() - 0.5) * variation);
    
    return Math.max(100, Math.min(1000, microTime));
  } catch (error) {
    logger.error('Error generating micro pause', { error });
    return 500;
  }
}

/**
 * Handle section change
 * @param {Object} ctx - Context object
 * @param {Object} section - Section information
 */
export function onSectionChange(ctx, section) {
  try {
    logger.debug('Idle strategy section change', { section });
    
    // Reset idle state on section change
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
    logger.debug('Idle strategy reached page bottom');
    
    // Idle strategy stops at page bottom
    return null;
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
    logger.debug('Idle strategy reached page top');
    
    // Idle strategy stops at page top
    return null;
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
    name: 'idle',
    displayName: 'Idle Strategy',
    description: 'Natural pauses and reading behavior simulation',
    version: '1.0.0',
    features: [
      'Reading pauses',
      'Thinking pauses',
      'Distraction simulation',
      'Micro-pauses',
      'Content-aware behavior'
    ],
    parameters: {
      minStep: { type: 'number', default: 30, min: 1, max: 1000 },
      maxStep: { type: 'number', default: 150, min: 1, max: 1000 },
      minDelay: { type: 'number', default: 200, min: 1, max: 10000 },
      maxDelay: { type: 'number', default: 800, min: 1, max: 10000 },
      jitter: { type: 'number', default: 0.2, min: 0, max: 1 },
      idleProbability: { type: 'number', default: 0.15, min: 0, max: 1 },
      contentAware: { type: 'boolean', default: true }
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
  
  if (config.idleProbability > 0.5) {
    warnings.push('High idle probability may make scrolling very slow');
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
      strategy: 'idle',
      idleStats: {
        totalIdleSteps: stats.totalIdleSteps || 0,
        totalIdleTime: stats.totalIdleTime || 0,
        averageIdleDuration: stats.averageIdleDuration || 0,
        idleTypes: stats.idleTypes || {}
      }
    };
  } catch (error) {
    logger.error('Error getting strategy stats', { error });
    return {
      totalSteps: 0,
      totalDistance: 0,
      averageStep: 0,
      strategy: 'idle',
      idleStats: {
        totalIdleSteps: 0,
        totalIdleTime: 0,
        averageIdleDuration: 0,
        idleTypes: {}
      }
    };
  }
}
