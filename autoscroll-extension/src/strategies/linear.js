/**
 * Linear scroll strategy - consistent, steady scrolling
 */

import { createLogger } from '../utils/logger.js';
import { randScrollStep, randDelay, jitter } from '../core/randomizer.js';

const logger = createLogger('linear-strategy');

/**
 * Linear scroll strategy
 * Provides consistent, steady scrolling with small variations
 */

/**
 * Get next scroll step
 * @param {Object} ctx - Context object
 * @returns {Object} - Next step configuration
 */
export function nextStep(ctx) {
  try {
    const { config, profile, randomizer } = ctx;
    
    // Get configuration values
    const minStep = profile.minStep || config.minStep || 50;
    const maxStep = profile.maxStep || config.maxStep || 200;
    const minDelay = profile.minDelay || config.minDelay || 100;
    const maxDelay = profile.maxDelay || config.maxDelay || 500;
    const jitterPercent = profile.jitter || config.jitter || 0.1;
    
    // Generate random scroll step
    const step = randScrollStep(minStep, maxStep);
    
    // Add jitter to step
    const jitteredStep = jitter(step, jitterPercent);
    
    // Generate random delay
    const delay = randDelay(minDelay, maxDelay);
    
    // Add jitter to delay
    const jitteredDelay = jitter(delay, jitterPercent);
    
    const stepConfig = {
      delta: Math.round(jitteredStep),
      duration: Math.round(jitteredDelay),
      easing: profile.easing || config.easing || 'ease-out',
      type: 'linear',
      timestamp: Date.now()
    };
    
    logger.debug('Generated linear step', { stepConfig });
    
    return stepConfig;
  } catch (error) {
    logger.error('Error generating linear step', { error });
    return null;
  }
}

/**
 * Handle section change
 * @param {Object} ctx - Context object
 * @param {Object} section - Section information
 */
export function onSectionChange(ctx, section) {
  try {
    logger.debug('Linear strategy section change', { section });
    
    // Linear strategy doesn't need special handling for section changes
    // It maintains consistent behavior regardless of content
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
    logger.debug('Linear strategy reached page bottom');
    
    // Linear strategy stops at page bottom
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
    logger.debug('Linear strategy reached page top');
    
    // Linear strategy stops at page top
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
    name: 'linear',
    displayName: 'Linear Scroll',
    description: 'Consistent, steady scrolling with small variations',
    version: '1.0.0',
    features: [
      'Consistent scroll speed',
      'Small random variations',
      'Predictable behavior',
      'Low resource usage'
    ],
    parameters: {
      minStep: { type: 'number', default: 50, min: 1, max: 1000 },
      maxStep: { type: 'number', default: 200, min: 1, max: 1000 },
      minDelay: { type: 'number', default: 100, min: 1, max: 10000 },
      maxDelay: { type: 'number', default: 500, min: 1, max: 10000 },
      jitter: { type: 'number', default: 0.1, min: 0, max: 1 }
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
  
  if (config.jitter > 0.5) {
    warnings.push('High jitter values may make scrolling less predictable');
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
      strategy: 'linear'
    };
  } catch (error) {
    logger.error('Error getting strategy stats', { error });
    return {
      totalSteps: 0,
      totalDistance: 0,
      averageStep: 0,
      strategy: 'linear'
    };
  }
}
