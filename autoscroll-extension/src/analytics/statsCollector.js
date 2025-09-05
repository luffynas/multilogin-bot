/**
 * Statistics collector for autoscroll behavior tracking
 */

import { createLogger } from '@utils/logger.js';
import { getStorage, setStorage } from '@utils/storage.js';
import { randFloat, randInt } from '@core/randomizer.js';

const logger = createLogger('stats-collector');

/**
 * Statistics Collector
 * Collects and manages autoscroll behavior statistics
 */
export class StatsCollector {
  constructor() {
    this.isActive = false;
    this.stats = {
      session: {
        id: this.generateSessionId(),
        startTime: null,
        endTime: null,
        duration: 0,
        totalSteps: 0,
        totalDistance: 0,
        totalPauseTime: 0,
        averageStep: 0,
        averageDelay: 0,
        errors: 0,
        strategy: null,
        profile: null
      },
      realtime: {
        currentStep: 0,
        currentDistance: 0,
        currentDelay: 0,
        lastStepTime: null,
        isPaused: false,
        pauseStartTime: null,
        pauseDuration: 0
      },
      behavior: {
        scrollPatterns: [],
        pausePatterns: [],
        errorPatterns: [],
        speedVariations: [],
        directionChanges: 0,
        idlePeriods: 0,
        totalIdleTime: 0
      },
      performance: {
        frameRate: 0,
        averageFrameTime: 0,
        droppedFrames: 0,
        memoryUsage: 0,
        cpuUsage: 0
      },
      stealth: {
        noiseEvents: 0,
        tabSwitches: 0,
        focusChanges: 0,
        humanLikeActions: 0,
        detectionRisk: 0
      }
    };
    
    this.config = {
      autoSave: true,
      saveInterval: 30000, // 30 seconds
      maxHistory: 100,
      enablePerformance: true,
      enableStealth: true
    };
    
    this.saveTimer = null;
    this.eventListeners = new Map();
  }

  /**
   * Initialize statistics collector
   * @param {Object} config - Configuration object
   * @returns {Promise<boolean>} - Success status
   */
  async initialize(config = {}) {
    try {
      this.config = { ...this.config, ...config };
      
      // Load existing stats if available
      await this.loadStats();
      
      logger.info('Statistics collector initialized', { config: this.config });
      return true;
    } catch (error) {
      logger.error('Error initializing statistics collector', { error });
      return false;
    }
  }

  /**
   * Start collecting statistics
   * @returns {Promise<boolean>} - Success status
   */
  async start() {
    try {
      if (this.isActive) {
        logger.warn('Statistics collector already active');
        return false;
      }

      this.isActive = true;
      this.stats.session.startTime = Date.now();
      this.stats.session.id = this.generateSessionId();
      
      // Start auto-save timer
      if (this.config.autoSave) {
        this.startAutoSave();
      }
      
      logger.info('Statistics collection started', { sessionId: this.stats.session.id });
      return true;
    } catch (error) {
      logger.error('Error starting statistics collection', { error });
      return false;
    }
  }

  /**
   * Stop collecting statistics
   * @returns {Promise<boolean>} - Success status
   */
  async stop() {
    try {
      if (!this.isActive) {
        logger.warn('Statistics collector not active');
        return false;
      }

      this.isActive = false;
      this.stats.session.endTime = Date.now();
      this.stats.session.duration = this.stats.session.endTime - this.stats.session.startTime;
      
      // Stop auto-save timer
      this.stopAutoSave();
      
      // Final save
      await this.saveStats();
      
      logger.info('Statistics collection stopped', { 
        sessionId: this.stats.session.id,
        duration: this.stats.session.duration 
      });
      return true;
    } catch (error) {
      logger.error('Error stopping statistics collection', { error });
      return false;
    }
  }

  /**
   * Record scroll step
   * @param {Object} step - Scroll step data
   */
  recordScrollStep(step) {
    try {
      if (!this.isActive) return;
      
      const now = Date.now();
      
      // Update session stats
      this.stats.session.totalSteps++;
      this.stats.session.totalDistance += step.delta || 0;
      this.stats.session.totalPauseTime += step.delay || 0;
      
      // Update realtime stats
      this.stats.realtime.currentStep = this.stats.session.totalSteps;
      this.stats.realtime.currentDistance = this.stats.session.totalDistance;
      this.stats.realtime.currentDelay = step.delay || 0;
      this.stats.realtime.lastStepTime = now;
      
      // Update behavior stats
      this.stats.behavior.scrollPatterns.push({
        timestamp: now,
        delta: step.delta || 0,
        delay: step.delay || 0,
        strategy: step.strategy || 'unknown',
        easing: step.easing || 'linear'
      });
      
      // Keep only recent patterns
      if (this.stats.behavior.scrollPatterns.length > this.config.maxHistory) {
        this.stats.behavior.scrollPatterns.shift();
      }
      
      // Calculate averages
      this.updateAverages();
      
      logger.debug('Scroll step recorded', { step, stats: this.stats.realtime });
    } catch (error) {
      logger.error('Error recording scroll step', { error });
    }
  }

  /**
   * Record pause event
   * @param {Object} pause - Pause event data
   */
  recordPause(pause) {
    try {
      if (!this.isActive) return;
      
      const now = Date.now();
      
      if (pause.type === 'start') {
        this.stats.realtime.isPaused = true;
        this.stats.realtime.pauseStartTime = now;
      } else if (pause.type === 'end') {
        this.stats.realtime.isPaused = false;
        if (this.stats.realtime.pauseStartTime) {
          const pauseDuration = now - this.stats.realtime.pauseStartTime;
          this.stats.realtime.pauseDuration += pauseDuration;
          this.stats.session.totalPauseTime += pauseDuration;
        }
      }
      
      // Update behavior stats
      this.stats.behavior.pausePatterns.push({
        timestamp: now,
        type: pause.type,
        duration: pause.duration || 0,
        reason: pause.reason || 'unknown'
      });
      
      // Keep only recent patterns
      if (this.stats.behavior.pausePatterns.length > this.config.maxHistory) {
        this.stats.behavior.pausePatterns.shift();
      }
      
      logger.debug('Pause recorded', { pause, stats: this.stats.realtime });
    } catch (error) {
      logger.error('Error recording pause', { error });
    }
  }

  /**
   * Record error event
   * @param {Object} error - Error event data
   */
  recordError(error) {
    try {
      if (!this.isActive) return;
      
      const now = Date.now();
      
      // Update session stats
      this.stats.session.errors++;
      
      // Update behavior stats
      this.stats.behavior.errorPatterns.push({
        timestamp: now,
        type: error.type || 'unknown',
        message: error.message || '',
        severity: error.severity || 'low',
        context: error.context || {}
      });
      
      // Keep only recent patterns
      if (this.stats.behavior.errorPatterns.length > this.config.maxHistory) {
        this.stats.behavior.errorPatterns.shift();
      }
      
      logger.debug('Error recorded', { error, totalErrors: this.stats.session.errors });
    } catch (error) {
      logger.error('Error recording error', { error });
    }
  }

  /**
   * Record stealth event
   * @param {Object} event - Stealth event data
   */
  recordStealthEvent(event) {
    try {
      if (!this.isActive || !this.config.enableStealth) return;
      
      const now = Date.now();
      
      // Update stealth stats
      switch (event.type) {
        case 'noise':
          this.stats.stealth.noiseEvents++;
          break;
        case 'tabSwitch':
          this.stats.stealth.tabSwitches++;
          break;
        case 'focusChange':
          this.stats.stealth.focusChanges++;
          break;
        case 'humanLike':
          this.stats.stealth.humanLikeActions++;
          break;
      }
      
      // Calculate detection risk
      this.calculateDetectionRisk();
      
      logger.debug('Stealth event recorded', { event, stealth: this.stats.stealth });
    } catch (error) {
      logger.error('Error recording stealth event', { error });
    }
  }

  /**
   * Record performance metrics
   * @param {Object} metrics - Performance metrics
   */
  recordPerformance(metrics) {
    try {
      if (!this.isActive || !this.config.enablePerformance) return;
      
      // Update performance stats
      this.stats.performance.frameRate = metrics.frameRate || 0;
      this.stats.performance.averageFrameTime = metrics.averageFrameTime || 0;
      this.stats.performance.droppedFrames = metrics.droppedFrames || 0;
      this.stats.performance.memoryUsage = metrics.memoryUsage || 0;
      this.stats.performance.cpuUsage = metrics.cpuUsage || 0;
      
      logger.debug('Performance recorded', { metrics, performance: this.stats.performance });
    } catch (error) {
      logger.error('Error recording performance', { error });
    }
  }

  /**
   * Update averages
   */
  updateAverages() {
    try {
      if (this.stats.session.totalSteps > 0) {
        this.stats.session.averageStep = this.stats.session.totalDistance / this.stats.session.totalSteps;
        this.stats.session.averageDelay = this.stats.session.totalPauseTime / this.stats.session.totalSteps;
      }
    } catch (error) {
      logger.error('Error updating averages', { error });
    }
  }

  /**
   * Calculate detection risk
   */
  calculateDetectionRisk() {
    try {
      let risk = 0;
      
      // Base risk factors
      const totalEvents = this.stats.stealth.noiseEvents + 
                         this.stats.stealth.tabSwitches + 
                         this.stats.stealth.focusChanges;
      
      if (totalEvents > 0) {
        // High noise events increase risk
        if (this.stats.stealth.noiseEvents > 100) {
          risk += 0.3;
        }
        
        // Frequent tab switches increase risk
        if (this.stats.stealth.tabSwitches > 20) {
          risk += 0.2;
        }
        
        // Low human-like actions increase risk
        const humanRatio = this.stats.stealth.humanLikeActions / totalEvents;
        if (humanRatio < 0.5) {
          risk += 0.4;
        }
      }
      
      // Normalize risk to 0-1
      this.stats.stealth.detectionRisk = Math.min(1, Math.max(0, risk));
    } catch (error) {
      logger.error('Error calculating detection risk', { error });
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
   * Get session summary
   * @returns {Object} - Session summary
   */
  getSessionSummary() {
    return {
      sessionId: this.stats.session.id,
      duration: this.stats.session.duration,
      totalSteps: this.stats.session.totalSteps,
      totalDistance: this.stats.session.totalDistance,
      averageStep: this.stats.session.averageStep,
      averageDelay: this.stats.session.averageDelay,
      errors: this.stats.session.errors,
      strategy: this.stats.session.strategy,
      profile: this.stats.session.profile,
      detectionRisk: this.stats.stealth.detectionRisk
    };
  }

  /**
   * Get behavior analysis
   * @returns {Object} - Behavior analysis
   */
  getBehaviorAnalysis() {
    try {
      const patterns = this.stats.behavior.scrollPatterns;
      if (patterns.length === 0) {
        return { message: 'No data available' };
      }
      
      // Analyze scroll patterns
      const deltas = patterns.map(p => p.delta);
      const delays = patterns.map(p => p.delay);
      
      const analysis = {
        scrollConsistency: this.calculateConsistency(deltas),
        delayConsistency: this.calculateConsistency(delays),
        averageDelta: deltas.reduce((a, b) => a + b, 0) / deltas.length,
        averageDelay: delays.reduce((a, b) => a + b, 0) / delays.length,
        totalPatterns: patterns.length,
        errorRate: this.stats.session.errors / this.stats.session.totalSteps
      };
      
      return analysis;
    } catch (error) {
      logger.error('Error getting behavior analysis', { error });
      return { error: 'Analysis failed' };
    }
  }

  /**
   * Calculate consistency score
   * @param {Array} values - Array of values
   * @returns {number} - Consistency score (0-1)
   */
  calculateConsistency(values) {
    try {
      if (values.length < 2) return 1;
      
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);
      
      // Normalize consistency (lower std dev = higher consistency)
      return Math.max(0, 1 - (stdDev / mean));
    } catch (error) {
      logger.error('Error calculating consistency', { error });
      return 0;
    }
  }

  /**
   * Start auto-save timer
   */
  startAutoSave() {
    if (this.saveTimer) {
      clearInterval(this.saveTimer);
    }
    
    this.saveTimer = setInterval(() => {
      this.saveStats();
    }, this.config.saveInterval);
  }

  /**
   * Stop auto-save timer
   */
  stopAutoSave() {
    if (this.saveTimer) {
      clearInterval(this.saveTimer);
      this.saveTimer = null;
    }
  }

  /**
   * Save statistics to storage
   * @returns {Promise<boolean>} - Success status
   */
  async saveStats() {
    try {
      const key = `autoscroll_stats_${this.stats.session.id}`;
      await setStorage(key, this.stats);
      
      logger.debug('Statistics saved', { sessionId: this.stats.session.id });
      return true;
    } catch (error) {
      logger.error('Error saving statistics', { error });
      return false;
    }
  }

  /**
   * Load statistics from storage
   * @returns {Promise<boolean>} - Success status
   */
  async loadStats() {
    try {
      // Load last session stats if available
      const lastSessionKey = 'autoscroll_last_session';
      const lastSession = await getStorage(lastSessionKey);
      
      if (lastSession) {
        this.stats = { ...this.stats, ...lastSession };
        logger.debug('Statistics loaded', { sessionId: this.stats.session.id });
      }
      
      return true;
    } catch (error) {
      logger.error('Error loading statistics', { error });
      return false;
    }
  }

  /**
   * Generate session ID
   * @returns {string} - Unique session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${randInt(1000, 9999)}`;
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      session: {
        id: this.generateSessionId(),
        startTime: null,
        endTime: null,
        duration: 0,
        totalSteps: 0,
        totalDistance: 0,
        totalPauseTime: 0,
        averageStep: 0,
        averageDelay: 0,
        errors: 0,
        strategy: null,
        profile: null
      },
      realtime: {
        currentStep: 0,
        currentDistance: 0,
        currentDelay: 0,
        lastStepTime: null,
        isPaused: false,
        pauseStartTime: null,
        pauseDuration: 0
      },
      behavior: {
        scrollPatterns: [],
        pausePatterns: [],
        errorPatterns: [],
        speedVariations: [],
        directionChanges: 0,
        idlePeriods: 0,
        totalIdleTime: 0
      },
      performance: {
        frameRate: 0,
        averageFrameTime: 0,
        droppedFrames: 0,
        memoryUsage: 0,
        cpuUsage: 0
      },
      stealth: {
        noiseEvents: 0,
        tabSwitches: 0,
        focusChanges: 0,
        humanLikeActions: 0,
        detectionRisk: 0
      }
    };
    
    logger.debug('Statistics reset');
  }

  /**
   * Update configuration
   * @param {Object} newConfig - New configuration
   */
  updateConfig(newConfig) {
    try {
      this.config = { ...this.config, ...newConfig };
      logger.info('Statistics collector configuration updated', { config: this.config });
    } catch (error) {
      logger.error('Error updating configuration', { error });
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
      logger.info('Statistics collector cleaned up');
      return true;
    } catch (error) {
      logger.error('Error cleaning up statistics collector', { error });
      return false;
    }
  }
}

/**
 * Create statistics collector instance
 * @param {Object} config - Configuration object
 * @returns {StatsCollector} - Collector instance
 */
export function createStatsCollector(config = {}) {
  return new StatsCollector(config);
}

/**
 * Default statistics collector instance
 */
export const statsCollector = createStatsCollector();
