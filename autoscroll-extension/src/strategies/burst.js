/**
 * Burst scroll strategy - quick bursts followed by pauses
 */

import { createLogger } from '../utils/logger.js';
import { randScrollStep, randDelay, jitter } from '../core/randomizer.js';

const logger = createLogger('burst-strategy');

/**
 * Burst scroll strategy
 * Provides quick bursts of scrolling followed by longer pauses
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
    const minStep = profile.minStep || config.minStep || 100;
    const maxStep = profile.maxStep || config.maxStep || 400;
    const minDelay = profile.minDelay || config.minDelay || 50;
    const maxDelay = profile.maxDelay || config.maxDelay || 150;
    const jitterPercent = profile.jitter || config.jitter || 0.15;
    
    // Get burst state
    const burstState = getBurstState(stats);
    
    let stepConfig;
    
    if (burstState.phase === 'burst') {
      // Generate burst step
      const burstStep = randScrollStep(minStep, maxStep);
      const jitteredStep = jitter(burstStep, jitterPercent);
      
      stepConfig = {
        delta: Math.round(jitteredStep),
        duration: randDelay(minDelay, maxDelay),
        easing: 'ease-out',
        type: 'burst',
        burstPhase: 'burst',
        burstCount: burstState.count,
        timestamp: Date.now()
      };
    } else {
      // Generate pause step
      const pauseDuration = randDelay(1000, 3000);
      
      stepConfig = {
        delta: 0,
        duration: pauseDuration,
        easing: 'linear',
        type: 'burst',
        burstPhase: 'pause',
        burstCount: burstState.count,
        timestamp: Date.now()
      };
    }
    
    logger.debug('Generated burst step', { stepConfig });
    
    return stepConfig;
  } catch (error) {
    logger.error('Error generating burst step', { error });
    return null;
  }
}

/**
 * Get current burst state
 * @param {Object} stats - Engine statistics
 * @returns {Object} - Burst state information
 */
function getBurstState(stats) {
  const recentSteps = stats.recentSteps || [];
  const stepCount = recentSteps.length;
  
  if (stepCount === 0) {
    return {
      phase: 'burst',
      count: 0,
      burstSteps: 0,
      pauseSteps: 0
    };
  }
  
  // Count recent burst and pause steps
  let burstSteps = 0;
  let pauseSteps = 0;
  let currentPhase = 'burst';
  
  for (let i = recentSteps.length - 1; i >= 0; i--) {
    const step = recentSteps[i];
    if (step.type === 'burst') {
      if (step.burstPhase === 'burst') {
        burstSteps++;
        if (currentPhase === 'pause') break;
        currentPhase = 'burst';
      } else if (step.burstPhase === 'pause') {
        pauseSteps++;
        if (currentPhase === 'burst') break;
        currentPhase = 'pause';
      }
    }
  }
  
  // Determine next phase
  let nextPhase = currentPhase;
  let count = 0;
  
  if (currentPhase === 'burst') {
    // Continue burst for 2-4 steps
    if (burstSteps < 2 || (burstSteps < 4 && Math.random() < 0.3)) {
      nextPhase = 'burst';
      count = burstSteps + 1;
    } else {
      nextPhase = 'pause';
      count = 0;
    }
  } else {
    // Continue pause for 1-3 steps
    if (pauseSteps < 1 || (pauseSteps < 3 && Math.random() < 0.4)) {
      nextPhase = 'pause';
      count = pauseSteps + 1;
    } else {
      nextPhase = 'burst';
      count = 0;
    }
  }
  
  return {
    phase: nextPhase,
    count,
    burstSteps,
    pauseSteps
  };
}

/**
 * Handle section change
 * @param {Object} ctx - Context object
 * @param {Object} section - Section information
 */
export function onSectionChange(ctx, section) {
  try {
    logger.debug('Burst strategy section change', { section });
    
    // Reset burst state on section change
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
    logger.debug('Burst strategy reached page bottom');
    
    // Burst strategy stops at page bottom
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
    logger.debug('Burst strategy reached page top');
    
    // Burst strategy stops at page top
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
    name: 'burst',
    displayName: 'Burst Scroll',
    description: 'Quick bursts of scrolling followed by pauses',
    version: '1.0.0',
    features: [
      'Quick scroll bursts',
      'Natural pauses',
      'Skimming behavior',
      'Variable timing'
    ],
    parameters: {
      minStep: { type: 'number', default: 100, min: 1, max: 1000 },
      maxStep: { type: 'number', default: 400, min: 1, max: 1000 },
      minDelay: { type: 'number', default: 50, min: 1, max: 10000 },
      maxDelay: { type: 'number', default: 150, min: 1, max: 10000 },
      jitter: { type: 'number', default: 0.15, min: 0, max: 1 }
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
    warnings.push('High jitter values may interfere with burst patterns');
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
      strategy: 'burst',
      burstStats: {
        totalBursts: stats.totalBursts || 0,
        totalPauses: stats.totalPauses || 0,
        averageBurstLength: stats.averageBurstLength || 0,
        averagePauseLength: stats.averagePauseLength || 0
      }
    };
  } catch (error) {
    logger.error('Error getting strategy stats', { error });
    return {
      totalSteps: 0,
      totalDistance: 0,
      averageStep: 0,
      strategy: 'burst',
      burstStats: {
        totalBursts: 0,
        totalPauses: 0,
        averageBurstLength: 0,
        averagePauseLength: 0
      }
    };
  }
}
