/**
 * Statistics Collector - Event bus and aggregator for analytics
 */

import { createLogger } from '../utils/logger.js';
import { getStorageValue, setStorageValue } from '../utils/storage.js';
import { randFloat, randInt } from '../core/randomizer.js';

const logger = createLogger('stats-collector');

/**
 * Statistics Collector
 * Collects and aggregates statistics from all modules
 */
export class StatsCollector {
  constructor() {
    this.isActive = false;
    this.eventListeners = new Map();
    this.stats = {
      session: {
        startTime: null,
        endTime: null,
        duration: 0,
        pagesVisited: 0,
        totalScrollDistance: 0,
        totalSteps: 0,
        totalPauses: 0,
        totalErrors: 0,
        averageSpeed: 0,
        maxSpeed: 0,
        minSpeed: Infinity
      },
      scroll: {
        totalDistance: 0,
        totalSteps: 0,
        averageStep: 0,
        maxStep: 0,
        minStep: Infinity,
        stepDistribution: {},
        speedDistribution: {},
        directionChanges: 0,
        reverseScrolls: 0,
        momentumScrolls: 0,
        burstScrolls: 0
      },
      navigation: {
        totalNavigations: 0,
        navigationsByType: {
          next: 0,
          previous: 0,
          related: 0,
          recent: 0,
          outbound: 0
        },
        averageNavigationDelay: 0,
        hoverEvents: 0,
        clickEvents: 0,
        tabSwitches: 0
      },
      stealth: {
        noiseEvents: 0,
        cursorMovements: 0,
        gestureEvents: 0,
        dwellTimeEvents: 0,
        errorSimulations: 0,
        fingerprintVariations: 0,
        tabAwarenessEvents: 0,
        canvasNoiseEvents: 0
      },
      performance: {
        averageResponseTime: 0,
        maxResponseTime: 0,
        minResponseTime: Infinity,
        memoryUsage: 0,
        cpuUsage: 0,
        errorRate: 0,
        successRate: 0
      },
      behavior: {
        readingPatterns: {},
        interactionPatterns: {},
        timePatterns: {},
        contentPatterns: {},
        userBehaviorScore: 0
      }
    };
    
    this.config = {
      enabled: true,
      collectionInterval: 1000, // 1 second
      maxHistorySize: 1000,
      exportFormats: ['json', 'csv'],
      autoExport: false,
      exportInterval: 300000, // 5 minutes
      realTimeTracking: true,
      performanceTracking: true,
      behaviorTracking: true
    };
    
    this.history = [];
    this.currentSession = null;
    this.performanceMetrics = {
      startTime: null,
      endTime: null,
      operations: 0,
      errors: 0
    };
  }

  /**
   * Initialize stats collector
   * @param {Object} config - Configuration object
   * @returns {Promise<boolean>} - Success status
   */
  async initialize(config = {}) {
    try {
      logger.info('Initializing stats collector', { config });
      
      this.config = { ...this.config, ...config };
      
      if (this.config.enabled) {
        await this.startCollection();
      }
      
      logger.info('Stats collector initialized successfully');
      return true;
    } catch (error) {
      logger.error('Error initializing stats collector', { error });
      return false;
    }
  }

  /**
   * Start statistics collection
   * @returns {Promise<boolean>} - Success status
   */
  async startCollection() {
    try {
      if (this.isActive) {
        logger.warn('Stats collector already active');
        return false;
      }

      this.isActive = true;
      this.stats.session.startTime = Date.now();
      this.performanceMetrics.startTime = Date.now();
      
      // Start collection interval
      if (this.config.collectionInterval > 0) {
        this.collectionInterval = setInterval(() => {
          this.collectMetrics();
        }, this.config.collectionInterval);
      }
      
      // Start auto-export if enabled
      if (this.config.autoExport) {
        this.exportInterval = setInterval(() => {
          this.exportStats();
        }, this.config.exportInterval);
      }
      
      logger.info('Stats collection started');
      return true;
    } catch (error) {
      logger.error('Error starting stats collection', { error });
      return false;
    }
  }

  /**
   * Stop statistics collection
   * @returns {Promise<boolean>} - Success status
   */
  async stopCollection() {
    try {
      if (!this.isActive) {
        logger.warn('Stats collector not active');
        return false;
      }

      this.isActive = false;
      this.stats.session.endTime = Date.now();
      this.stats.session.duration = this.stats.session.endTime - this.stats.session.startTime;
      this.performanceMetrics.endTime = Date.now();
      
      // Clear intervals
      if (this.collectionInterval) {
        clearInterval(this.collectionInterval);
        this.collectionInterval = null;
      }
      
      if (this.exportInterval) {
        clearInterval(this.exportInterval);
        this.exportInterval = null;
      }
      
      // Final metrics collection
      await this.collectFinalMetrics();
      
      logger.info('Stats collection stopped');
      return true;
    } catch (error) {
      logger.error('Error stopping stats collection', { error });
      return false;
    }
  }

  /**
   * Record an event
   * @param {string} type - Event type
   * @param {Object} data - Event data
   * @returns {Promise<boolean>} - Success status
   */
  async recordEvent(type, data = {}) {
    try {
      if (!this.isActive) {
        return false;
      }

      const event = {
        type,
        data,
        timestamp: Date.now(),
        sessionId: this.currentSession?.id
      };

      // Update statistics based on event type
      this.updateStats(type, data);
      
      // Add to history
      this.history.push(event);
      
      // Maintain history size
      if (this.history.length > this.config.maxHistorySize) {
        this.history.shift();
      }
      
      // Emit event to listeners
      this.emit('event', event);
      
      logger.debug('Event recorded', { type, data });
      return true;
    } catch (error) {
      logger.error('Error recording event', { error, type, data });
      return false;
    }
  }

  /**
   * Update statistics based on event type
   * @param {string} type - Event type
   * @param {Object} data - Event data
   */
  updateStats(type, data) {
    try {
      switch (type) {
        case 'scroll':
          this.updateScrollStats(data);
          break;
        case 'navigation':
          this.updateNavigationStats(data);
          break;
        case 'stealth':
          this.updateStealthStats(data);
          break;
        case 'performance':
          this.updatePerformanceStats(data);
          break;
        case 'behavior':
          this.updateBehaviorStats(data);
          break;
        default:
          logger.debug('Unknown event type', { type });
      }
    } catch (error) {
      logger.error('Error updating stats', { error, type, data });
    }
  }

  /**
   * Update scroll statistics
   * @param {Object} data - Scroll data
   */
  updateScrollStats(data) {
    const { delta, speed, direction, strategy } = data;
    
    this.stats.scroll.totalDistance += Math.abs(delta || 0);
    this.stats.scroll.totalSteps++;
    
    if (delta) {
      this.stats.scroll.averageStep = this.stats.scroll.totalDistance / this.stats.scroll.totalSteps;
      this.stats.scroll.maxStep = Math.max(this.stats.scroll.maxStep, Math.abs(delta));
      this.stats.scroll.minStep = Math.min(this.stats.scroll.minStep, Math.abs(delta));
    }
    
    if (speed) {
      this.stats.session.averageSpeed = (this.stats.session.averageSpeed + speed) / 2;
      this.stats.session.maxSpeed = Math.max(this.stats.session.maxSpeed, speed);
      this.stats.session.minSpeed = Math.min(this.stats.session.minSpeed, speed);
    }
    
    if (direction === 'reverse') {
      this.stats.scroll.reverseScrolls++;
    }
    
    if (strategy) {
      this.stats.scroll.stepDistribution[strategy] = (this.stats.scroll.stepDistribution[strategy] || 0) + 1;
    }
  }

  /**
   * Update navigation statistics
   * @param {Object} data - Navigation data
   */
  updateNavigationStats(data) {
    const { type, delay, success } = data;
    
    this.stats.navigation.totalNavigations++;
    
    if (type) {
      this.stats.navigation.navigationsByType[type] = (this.stats.navigation.navigationsByType[type] || 0) + 1;
    }
    
    if (delay) {
      this.stats.navigation.averageNavigationDelay = (this.stats.navigation.averageNavigationDelay + delay) / 2;
    }
    
    if (data.hover) {
      this.stats.navigation.hoverEvents++;
    }
    
    if (data.click) {
      this.stats.navigation.clickEvents++;
    }
    
    if (data.tabSwitch) {
      this.stats.navigation.tabSwitches++;
    }
  }

  /**
   * Update stealth statistics
   * @param {Object} data - Stealth data
   */
  updateStealthStats(data) {
    const { type, module } = data;
    
    switch (type) {
      case 'noise':
        this.stats.stealth.noiseEvents++;
        break;
      case 'cursor':
        this.stats.stealth.cursorMovements++;
        break;
      case 'gesture':
        this.stats.stealth.gestureEvents++;
        break;
      case 'dwell':
        this.stats.stealth.dwellTimeEvents++;
        break;
      case 'error':
        this.stats.stealth.errorSimulations++;
        break;
      case 'fingerprint':
        this.stats.stealth.fingerprintVariations++;
        break;
      case 'tabAwareness':
        this.stats.stealth.tabAwarenessEvents++;
        break;
      case 'canvasNoise':
        this.stats.stealth.canvasNoiseEvents++;
        break;
    }
  }

  /**
   * Update performance statistics
   * @param {Object} data - Performance data
   */
  updatePerformanceStats(data) {
    const { responseTime, memoryUsage, cpuUsage, success } = data;
    
    this.performanceMetrics.operations++;
    
    if (!success) {
      this.performanceMetrics.errors++;
    }
    
    if (responseTime) {
      this.stats.performance.averageResponseTime = (this.stats.performance.averageResponseTime + responseTime) / 2;
      this.stats.performance.maxResponseTime = Math.max(this.stats.performance.maxResponseTime, responseTime);
      this.stats.performance.minResponseTime = Math.min(this.stats.performance.minResponseTime, responseTime);
    }
    
    if (memoryUsage) {
      this.stats.performance.memoryUsage = memoryUsage;
    }
    
    if (cpuUsage) {
      this.stats.performance.cpuUsage = cpuUsage;
    }
    
    // Calculate rates
    this.stats.performance.errorRate = this.performanceMetrics.errors / this.performanceMetrics.operations;
    this.stats.performance.successRate = 1 - this.stats.performance.errorRate;
  }

  /**
   * Update behavior statistics
   * @param {Object} data - Behavior data
   */
  updateBehaviorStats(data) {
    const { pattern, type, score } = data;
    
    if (pattern) {
      this.stats.behavior.readingPatterns[pattern] = (this.stats.behavior.readingPatterns[pattern] || 0) + 1;
    }
    
    if (type) {
      this.stats.behavior.interactionPatterns[type] = (this.stats.behavior.interactionPatterns[type] || 0) + 1;
    }
    
    if (score) {
      this.stats.behavior.userBehaviorScore = (this.stats.behavior.userBehaviorScore + score) / 2;
    }
  }

  /**
   * Collect current metrics
   */
  collectMetrics() {
    try {
      // Collect performance metrics
      if (this.config.performanceTracking) {
        this.collectPerformanceMetrics();
      }
      
      // Collect behavior metrics
      if (this.config.behaviorTracking) {
        this.collectBehaviorMetrics();
      }
      
      // Emit metrics update
      this.emit('metrics', this.getStats());
    } catch (error) {
      logger.error('Error collecting metrics', { error });
    }
  }

  /**
   * Collect performance metrics
   */
  collectPerformanceMetrics() {
    try {
      // Memory usage (if available)
      if (performance.memory) {
        this.stats.performance.memoryUsage = performance.memory.usedJSHeapSize;
      }
      
      // Calculate response time
      const now = Date.now();
      if (this.performanceMetrics.startTime) {
        const totalTime = now - this.performanceMetrics.startTime;
        const avgResponseTime = totalTime / this.performanceMetrics.operations;
        this.stats.performance.averageResponseTime = avgResponseTime;
      }
    } catch (error) {
      logger.error('Error collecting performance metrics', { error });
    }
  }

  /**
   * Collect behavior metrics
   */
  collectBehaviorMetrics() {
    try {
      // Analyze reading patterns
      this.analyzeReadingPatterns();
      
      // Analyze interaction patterns
      this.analyzeInteractionPatterns();
      
      // Calculate behavior score
      this.calculateBehaviorScore();
    } catch (error) {
      logger.error('Error collecting behavior metrics', { error });
    }
  }

  /**
   * Analyze reading patterns
   */
  analyzeReadingPatterns() {
    try {
      const recentEvents = this.history.slice(-100);
      const scrollEvents = recentEvents.filter(e => e.type === 'scroll');
      
      if (scrollEvents.length > 0) {
        const avgStep = scrollEvents.reduce((sum, e) => sum + Math.abs(e.data.delta || 0), 0) / scrollEvents.length;
        const avgSpeed = scrollEvents.reduce((sum, e) => sum + (e.data.speed || 0), 0) / scrollEvents.length;
        
        // Classify reading pattern
        let pattern = 'normal';
        if (avgStep < 50) pattern = 'careful';
        else if (avgStep > 200) pattern = 'fast';
        else if (avgSpeed < 0.5) pattern = 'slow';
        else if (avgSpeed > 2.0) pattern = 'rapid';
        
        this.stats.behavior.readingPatterns[pattern] = (this.stats.behavior.readingPatterns[pattern] || 0) + 1;
      }
    } catch (error) {
      logger.error('Error analyzing reading patterns', { error });
    }
  }

  /**
   * Analyze interaction patterns
   */
  analyzeInteractionPatterns() {
    try {
      const recentEvents = this.history.slice(-50);
      const interactionEvents = recentEvents.filter(e => e.type === 'navigation' || e.type === 'stealth');
      
      if (interactionEvents.length > 0) {
        const hoverRate = interactionEvents.filter(e => e.data.hover).length / interactionEvents.length;
        const clickRate = interactionEvents.filter(e => e.data.click).length / interactionEvents.length;
        
        // Classify interaction pattern
        let pattern = 'balanced';
        if (hoverRate > 0.7) pattern = 'cautious';
        else if (clickRate > 0.8) pattern = 'direct';
        else if (hoverRate < 0.3 && clickRate < 0.3) pattern = 'passive';
        
        this.stats.behavior.interactionPatterns[pattern] = (this.stats.behavior.interactionPatterns[pattern] || 0) + 1;
      }
    } catch (error) {
      logger.error('Error analyzing interaction patterns', { error });
    }
  }

  /**
   * Calculate behavior score
   */
  calculateBehaviorScore() {
    try {
      let score = 0.5; // Base score
      
      // Factor in reading patterns
      const readingPatterns = this.stats.behavior.readingPatterns;
      const totalReading = Object.values(readingPatterns).reduce((sum, count) => sum + count, 0);
      
      if (totalReading > 0) {
        const carefulRatio = (readingPatterns.careful || 0) / totalReading;
        const fastRatio = (readingPatterns.fast || 0) / totalReading;
        
        score += carefulRatio * 0.2; // Careful reading is more human-like
        score -= fastRatio * 0.1; // Too fast might be bot-like
      }
      
      // Factor in interaction patterns
      const interactionPatterns = this.stats.behavior.interactionPatterns;
      const totalInteraction = Object.values(interactionPatterns).reduce((sum, count) => sum + count, 0);
      
      if (totalInteraction > 0) {
        const balancedRatio = (interactionPatterns.balanced || 0) / totalInteraction;
        const cautiousRatio = (interactionPatterns.cautious || 0) / totalInteraction;
        
        score += balancedRatio * 0.15; // Balanced interaction is good
        score += cautiousRatio * 0.1; // Cautious interaction is human-like
      }
      
      // Factor in error rate
      const errorRate = this.stats.performance.errorRate;
      if (errorRate > 0 && errorRate < 0.1) {
        score += 0.1; // Some errors are human-like
      } else if (errorRate === 0) {
        score -= 0.1; // No errors might be bot-like
      }
      
      // Clamp score between 0 and 1
      this.stats.behavior.userBehaviorScore = Math.max(0, Math.min(1, score));
    } catch (error) {
      logger.error('Error calculating behavior score', { error });
    }
  }

  /**
   * Collect final metrics
   */
  async collectFinalMetrics() {
    try {
      // Final performance metrics
      this.collectPerformanceMetrics();
      
      // Final behavior analysis
      this.collectBehaviorMetrics();
      
      // Calculate session summary
      this.calculateSessionSummary();
      
      // Save to storage
      await this.saveStats();
      
      logger.info('Final metrics collected');
    } catch (error) {
      logger.error('Error collecting final metrics', { error });
    }
  }

  /**
   * Calculate session summary
   */
  calculateSessionSummary() {
    try {
      const session = this.stats.session;
      
      // Calculate averages
      if (session.totalSteps > 0) {
        session.averageSpeed = session.totalScrollDistance / session.duration * 1000; // pixels per second
      }
      
      // Calculate efficiency
      const efficiency = session.totalSteps > 0 ? session.totalScrollDistance / session.totalSteps : 0;
      
      // Add to session stats
      session.efficiency = efficiency;
      session.successRate = 1 - (session.totalErrors / Math.max(session.totalSteps, 1));
      
      logger.info('Session summary calculated', { session });
    } catch (error) {
      logger.error('Error calculating session summary', { error });
    }
  }

  /**
   * Get current statistics
   * @returns {Object} - Current statistics
   */
  getStats() {
    return {
      ...this.stats,
      history: this.history.slice(-100), // Last 100 events
      config: this.config,
      isActive: this.isActive
    };
  }

  /**
   * Export statistics
   * @param {string} format - Export format (json, csv)
   * @returns {Promise<Object>} - Export data
   */
  async exportStats(format = 'json') {
    try {
      const stats = this.getStats();
      
      switch (format) {
        case 'json':
          return {
            format: 'json',
            data: stats,
            timestamp: Date.now(),
            version: '1.0.0'
          };
          
        case 'csv':
          return {
            format: 'csv',
            data: this.convertToCSV(stats),
            timestamp: Date.now(),
            version: '1.0.0'
          };
          
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
    } catch (error) {
      logger.error('Error exporting stats', { error, format });
      throw error;
    }
  }

  /**
   * Convert stats to CSV format
   * @param {Object} stats - Statistics object
   * @returns {string} - CSV data
   */
  convertToCSV(stats) {
    try {
      const rows = [];
      
      // Session data
      rows.push(['Metric', 'Value']);
      rows.push(['Session Duration', stats.session.duration]);
      rows.push(['Pages Visited', stats.session.pagesVisited]);
      rows.push(['Total Scroll Distance', stats.session.totalScrollDistance]);
      rows.push(['Total Steps', stats.session.totalSteps]);
      rows.push(['Average Speed', stats.session.averageSpeed]);
      rows.push(['Success Rate', stats.session.successRate]);
      
      // Navigation data
      rows.push(['Total Navigations', stats.navigation.totalNavigations]);
      Object.entries(stats.navigation.navigationsByType).forEach(([type, count]) => {
        rows.push([`Navigation ${type}`, count]);
      });
      
      // Stealth data
      rows.push(['Noise Events', stats.stealth.noiseEvents]);
      rows.push(['Cursor Movements', stats.stealth.cursorMovements]);
      rows.push(['Gesture Events', stats.stealth.gestureEvents]);
      rows.push(['Dwell Time Events', stats.stealth.dwellTimeEvents]);
      
      // Performance data
      rows.push(['Average Response Time', stats.performance.averageResponseTime]);
      rows.push(['Error Rate', stats.performance.errorRate]);
      rows.push(['Success Rate', stats.performance.successRate]);
      
      // Behavior data
      rows.push(['User Behavior Score', stats.behavior.userBehaviorScore]);
      
      return rows.map(row => row.join(',')).join('\n');
    } catch (error) {
      logger.error('Error converting to CSV', { error });
      return '';
    }
  }

  /**
   * Save statistics to storage
   * @returns {Promise<boolean>} - Success status
   */
  async saveStats() {
    try {
      const stats = this.getStats();
      await setStorageValue('stats', stats);
      
      logger.info('Stats saved to storage');
      return true;
    } catch (error) {
      logger.error('Error saving stats', { error });
      return false;
    }
  }

  /**
   * Load statistics from storage
   * @returns {Promise<Object>} - Loaded statistics
   */
  async loadStats() {
    try {
      const stats = await getStorageValue('stats');
      if (stats) {
        this.stats = { ...this.stats, ...stats };
        logger.info('Stats loaded from storage');
      }
      
      return this.stats;
    } catch (error) {
      logger.error('Error loading stats', { error });
      return this.stats;
    }
  }

  /**
   * Clear statistics
   * @returns {Promise<boolean>} - Success status
   */
  async clearStats() {
    try {
      this.stats = {
        session: {
          startTime: null,
          endTime: null,
          duration: 0,
          pagesVisited: 0,
          totalScrollDistance: 0,
          totalSteps: 0,
          totalPauses: 0,
          totalErrors: 0,
          averageSpeed: 0,
          maxSpeed: 0,
          minSpeed: Infinity
        },
        scroll: {
          totalDistance: 0,
          totalSteps: 0,
          averageStep: 0,
          maxStep: 0,
          minStep: Infinity,
          stepDistribution: {},
          speedDistribution: {},
          directionChanges: 0,
          reverseScrolls: 0,
          momentumScrolls: 0,
          burstScrolls: 0
        },
        navigation: {
          totalNavigations: 0,
          navigationsByType: {
            next: 0,
            previous: 0,
            related: 0,
            recent: 0,
            outbound: 0
          },
          averageNavigationDelay: 0,
          hoverEvents: 0,
          clickEvents: 0,
          tabSwitches: 0
        },
        stealth: {
          noiseEvents: 0,
          cursorMovements: 0,
          gestureEvents: 0,
          dwellTimeEvents: 0,
          errorSimulations: 0,
          fingerprintVariations: 0,
          tabAwarenessEvents: 0,
          canvasNoiseEvents: 0
        },
        performance: {
          averageResponseTime: 0,
          maxResponseTime: 0,
          minResponseTime: Infinity,
          memoryUsage: 0,
          cpuUsage: 0,
          errorRate: 0,
          successRate: 0
        },
        behavior: {
          readingPatterns: {},
          interactionPatterns: {},
          timePatterns: {},
          contentPatterns: {},
          userBehaviorScore: 0
        }
      };
      
      this.history = [];
      this.performanceMetrics = {
        startTime: null,
        endTime: null,
        operations: 0,
        errors: 0
      };
      
      logger.info('Stats cleared');
      return true;
    } catch (error) {
      logger.error('Error clearing stats', { error });
      return false;
    }
  }

  /**
   * Add event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to listeners
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          logger.error('Error in event listener', { error, event });
        }
      });
    }
  }
}

/**
 * Create stats collector instance
 * @param {Object} config - Configuration object
 * @returns {StatsCollector} - Stats collector instance
 */
export function createStatsCollector(config = {}) {
  return new StatsCollector(config);
}

/**
 * Default stats collector instance
 */
export const statsCollector = createStatsCollector();
