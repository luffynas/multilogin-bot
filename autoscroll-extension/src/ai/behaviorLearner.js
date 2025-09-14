/**
 * Behavior Learner - Adaptive behavior learning from user interactions
 */

import { createLogger } from '../utils/logger.js';
import { randFloat, randInt } from '../core/randomizer.js';

const logger = createLogger('behavior-learner');

/**
 * Behavior Learner
 * Learns and adapts behavior patterns from user interactions
 */
export class BehaviorLearner {
  constructor() {
    this.isActive = false;
    this.config = {
      enabled: true,
      learningRate: 0.01,
      memorySize: 1000,
      adaptationThreshold: 0.7,
      learningTypes: ['scroll', 'navigation', 'interaction', 'stealth'],
      adaptation: {
        enabled: true,
        frequency: 0.1, // 10% chance to adapt
        intensity: 0.2, // 20% change intensity
        stability: 0.8 // 80% stability factor
      }
    };
    
    this.behaviorMemory = new Map();
    this.adaptationHistory = [];
    this.learningData = [];
    this.userProfile = {
      preferences: {},
      patterns: {},
      adaptations: {},
      confidence: 0.5
    };
  }

  /**
   * Initialize behavior learner
   * @param {Object} config - Configuration object
   * @returns {Promise<boolean>} - Success status
   */
  async initialize(config = {}) {
    try {
      logger.info('Initializing behavior learner', { config });
      
      this.config = { ...this.config, ...config };
      
      if (this.config.enabled) {
        await this.startLearning();
      }
      
      logger.info('Behavior learner initialized successfully');
      return true;
    } catch (error) {
      logger.error('Error initializing behavior learner', { error });
      return false;
    }
  }

  /**
   * Start behavior learning
   * @returns {Promise<boolean>} - Success status
   */
  async startLearning() {
    try {
      if (this.isActive) {
        logger.warn('Behavior learning already active');
        return false;
      }

      this.isActive = true;
      
      // Initialize user profile
      await this.initializeUserProfile();
      
      logger.info('Behavior learning started');
      return true;
    } catch (error) {
      logger.error('Error starting behavior learning', { error });
      return false;
    }
  }

  /**
   * Stop behavior learning
   * @returns {Promise<boolean>} - Success status
   */
  async stopLearning() {
    try {
      if (!this.isActive) {
        logger.warn('Behavior learning not active');
        return false;
      }

      this.isActive = false;
      
      logger.info('Behavior learning stopped');
      return true;
    } catch (error) {
      logger.error('Error stopping behavior learning', { error });
      return false;
    }
  }

  /**
   * Initialize user profile
   * @returns {Promise<boolean>} - Success status
   */
  async initializeUserProfile() {
    try {
      this.userProfile = {
        preferences: {
          scrollSpeed: 0.5,
          navigationStyle: 'balanced',
          interactionLevel: 'moderate',
          stealthLevel: 'medium'
        },
        patterns: {
          scroll: {},
          navigation: {},
          interaction: {},
          stealth: {}
        },
        adaptations: {
          total: 0,
          successful: 0,
          failed: 0
        },
        confidence: 0.5,
        lastUpdate: Date.now()
      };
      
      logger.info('User profile initialized');
      return true;
    } catch (error) {
      logger.error('Error initializing user profile', { error });
      return false;
    }
  }

  /**
   * Learn from behavior data
   * @param {string} type - Behavior type
   * @param {Object} data - Behavior data
   * @param {Object} context - Context information
   * @returns {Promise<boolean>} - Success status
   */
  async learnFromBehavior(type, data, context = {}) {
    try {
      if (!this.isActive) {
        return false;
      }

      // Add to learning data
      this.learningData.push({
        type,
        data,
        context,
        timestamp: Date.now()
      });
      
      // Limit learning data size
      if (this.learningData.length > this.config.memorySize) {
        this.learningData.shift();
      }
      
      // Update behavior memory
      this.updateBehaviorMemory(type, data, context);
      
      // Update user profile
      await this.updateUserProfile(type, data, context);
      
      // Check for adaptation opportunities
      if (this.shouldAdapt()) {
        await this.adaptBehavior(type, data, context);
      }
      
      logger.debug('Learned from behavior', { type, data, context });
      return true;
    } catch (error) {
      logger.error('Error learning from behavior', { error, type, data, context });
      return false;
    }
  }

  /**
   * Update behavior memory
   * @param {string} type - Behavior type
   * @param {Object} data - Behavior data
   * @param {Object} context - Context information
   */
  updateBehaviorMemory(type, data, context) {
    try {
      const key = `${type}_${JSON.stringify(context)}`;
      const existing = this.behaviorMemory.get(key) || {
        count: 0,
        data: [],
        patterns: {},
        lastUpdate: Date.now()
      };
      
      existing.count++;
      existing.data.push(data);
      existing.lastUpdate = Date.now();
      
      // Limit data size
      if (existing.data.length > 100) {
        existing.data.shift();
      }
      
      // Update patterns
      this.updatePatterns(existing.patterns, data);
      
      this.behaviorMemory.set(key, existing);
    } catch (error) {
      logger.error('Error updating behavior memory', { error, type, data, context });
    }
  }

  /**
   * Update patterns from data
   * @param {Object} patterns - Patterns object
   * @param {Object} data - Behavior data
   */
  updatePatterns(patterns, data) {
    try {
      Object.entries(data).forEach(([key, value]) => {
        if (typeof value === 'number') {
          if (!patterns[key]) {
            patterns[key] = { sum: 0, count: 0, min: Infinity, max: -Infinity };
          }
          
          const pattern = patterns[key];
          pattern.sum += value;
          pattern.count++;
          pattern.min = Math.min(pattern.min, value);
          pattern.max = Math.max(pattern.max, value);
          pattern.average = pattern.sum / pattern.count;
        } else if (typeof value === 'string') {
          if (!patterns[key]) {
            patterns[key] = {};
          }
          patterns[key][value] = (patterns[key][value] || 0) + 1;
        }
      });
    } catch (error) {
      logger.error('Error updating patterns', { error, patterns, data });
    }
  }

  /**
   * Update user profile
   * @param {string} type - Behavior type
   * @param {Object} data - Behavior data
   * @param {Object} context - Context information
   */
  async updateUserProfile(type, data, context) {
    try {
      const learningRate = this.config.learningRate;
      
      // Update preferences based on behavior
      switch (type) {
        case 'scroll':
          await this.updateScrollPreferences(data, learningRate);
          break;
        case 'navigation':
          await this.updateNavigationPreferences(data, learningRate);
          break;
        case 'interaction':
          await this.updateInteractionPreferences(data, learningRate);
          break;
        case 'stealth':
          await this.updateStealthPreferences(data, learningRate);
          break;
      }
      
      // Update patterns
      this.userProfile.patterns[type] = this.analyzePatterns(type);
      
      // Update confidence
      this.userProfile.confidence = this.calculateConfidence();
      this.userProfile.lastUpdate = Date.now();
    } catch (error) {
      logger.error('Error updating user profile', { error, type, data, context });
    }
  }

  /**
   * Update scroll preferences
   * @param {Object} data - Scroll data
   * @param {number} learningRate - Learning rate
   */
  async updateScrollPreferences(data, learningRate) {
    try {
      const { speed, stepSize, delay } = data;
      
      if (speed !== undefined) {
        this.userProfile.preferences.scrollSpeed = 
          this.userProfile.preferences.scrollSpeed * (1 - learningRate) + 
          speed * learningRate;
      }
      
      // Update scroll patterns
      if (!this.userProfile.patterns.scroll) {
        this.userProfile.patterns.scroll = {};
      }
      
      if (stepSize !== undefined) {
        this.userProfile.patterns.scroll.stepSize = 
          (this.userProfile.patterns.scroll.stepSize || 100) * (1 - learningRate) + 
          stepSize * learningRate;
      }
      
      if (delay !== undefined) {
        this.userProfile.patterns.scroll.delay = 
          (this.userProfile.patterns.scroll.delay || 300) * (1 - learningRate) + 
          delay * learningRate;
      }
    } catch (error) {
      logger.error('Error updating scroll preferences', { error, data, learningRate });
    }
  }

  /**
   * Update navigation preferences
   * @param {Object} data - Navigation data
   * @param {number} learningRate - Learning rate
   */
  async updateNavigationPreferences(data, learningRate) {
    try {
      const { style, delay, hoverDelay } = data;
      
      if (style) {
        // Update navigation style preference
        const styles = ['direct', 'exploratory', 'cautious', 'aggressive'];
        const currentStyle = this.userProfile.preferences.navigationStyle;
        const currentIndex = styles.indexOf(currentStyle);
        const newIndex = styles.indexOf(style);
        
        if (newIndex !== -1) {
          // Gradually shift towards new style
          const shift = (newIndex - currentIndex) * learningRate;
          const newIndexFloat = currentIndex + shift;
          const newStyleIndex = Math.round(newIndexFloat);
          this.userProfile.preferences.navigationStyle = styles[newStyleIndex];
        }
      }
      
      // Update navigation patterns
      if (!this.userProfile.patterns.navigation) {
        this.userProfile.patterns.navigation = {};
      }
      
      if (delay !== undefined) {
        this.userProfile.patterns.navigation.delay = 
          (this.userProfile.patterns.navigation.delay || 500) * (1 - learningRate) + 
          delay * learningRate;
      }
      
      if (hoverDelay !== undefined) {
        this.userProfile.patterns.navigation.hoverDelay = 
          (this.userProfile.patterns.navigation.hoverDelay || 300) * (1 - learningRate) + 
          hoverDelay * learningRate;
      }
    } catch (error) {
      logger.error('Error updating navigation preferences', { error, data, learningRate });
    }
  }

  /**
   * Update interaction preferences
   * @param {Object} data - Interaction data
   * @param {number} learningRate - Learning rate
   */
  async updateInteractionPreferences(data, learningRate) {
    try {
      const { level, frequency, types } = data;
      
      if (level) {
        const levels = ['minimal', 'moderate', 'extensive'];
        const currentLevel = this.userProfile.preferences.interactionLevel;
        const currentIndex = levels.indexOf(currentLevel);
        const newIndex = levels.indexOf(level);
        
        if (newIndex !== -1) {
          const shift = (newIndex - currentIndex) * learningRate;
          const newIndexFloat = currentIndex + shift;
          const newLevelIndex = Math.round(newIndexFloat);
          this.userProfile.preferences.interactionLevel = levels[newLevelIndex];
        }
      }
      
      // Update interaction patterns
      if (!this.userProfile.patterns.interaction) {
        this.userProfile.patterns.interaction = {};
      }
      
      if (frequency !== undefined) {
        this.userProfile.patterns.interaction.frequency = 
          (this.userProfile.patterns.interaction.frequency || 0.5) * (1 - learningRate) + 
          frequency * learningRate;
      }
      
      if (types) {
        this.userProfile.patterns.interaction.types = types;
      }
    } catch (error) {
      logger.error('Error updating interaction preferences', { error, data, learningRate });
    }
  }

  /**
   * Update stealth preferences
   * @param {Object} data - Stealth data
   * @param {number} learningRate - Learning rate
   */
  async updateStealthPreferences(data, learningRate) {
    try {
      const { level, intensity, modules } = data;
      
      if (level) {
        const levels = ['basic', 'medium', 'high', 'maximum'];
        const currentLevel = this.userProfile.preferences.stealthLevel;
        const currentIndex = levels.indexOf(currentLevel);
        const newIndex = levels.indexOf(level);
        
        if (newIndex !== -1) {
          const shift = (newIndex - currentIndex) * learningRate;
          const newIndexFloat = currentIndex + shift;
          const newLevelIndex = Math.round(newIndexFloat);
          this.userProfile.preferences.stealthLevel = levels[newLevelIndex];
        }
      }
      
      // Update stealth patterns
      if (!this.userProfile.patterns.stealth) {
        this.userProfile.patterns.stealth = {};
      }
      
      if (intensity !== undefined) {
        this.userProfile.patterns.stealth.intensity = 
          (this.userProfile.patterns.stealth.intensity || 0.5) * (1 - learningRate) + 
          intensity * learningRate;
      }
      
      if (modules) {
        this.userProfile.patterns.stealth.modules = modules;
      }
    } catch (error) {
      logger.error('Error updating stealth preferences', { error, data, learningRate });
    }
  }

  /**
   * Analyze patterns for specific type
   * @param {string} type - Behavior type
   * @returns {Object} - Analyzed patterns
   */
  analyzePatterns(type) {
    try {
      const relevantData = this.learningData.filter(item => item.type === type);
      if (relevantData.length === 0) {
        return {};
      }
      
      const patterns = {
        frequency: relevantData.length,
        averageInterval: 0,
        consistency: 0,
        trends: {}
      };
      
      // Calculate average interval
      if (relevantData.length > 1) {
        const intervals = [];
        for (let i = 1; i < relevantData.length; i++) {
          intervals.push(relevantData[i].timestamp - relevantData[i - 1].timestamp);
        }
        patterns.averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
      }
      
      // Calculate consistency
      patterns.consistency = this.calculateConsistency(relevantData);
      
      // Analyze trends
      patterns.trends = this.analyzeTrends(relevantData);
      
      return patterns;
    } catch (error) {
      logger.error('Error analyzing patterns', { error, type });
      return {};
    }
  }

  /**
   * Calculate consistency score
   * @param {Array} data - Behavior data
   * @returns {number} - Consistency score (0-1)
   */
  calculateConsistency(data) {
    try {
      if (data.length < 2) return 1;
      
      // Calculate variance in key metrics
      const metrics = ['speed', 'delay', 'intensity'];
      let totalVariance = 0;
      let metricCount = 0;
      
      metrics.forEach(metric => {
        const values = data.map(item => item.data[metric]).filter(val => val !== undefined);
        if (values.length > 1) {
          const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
          const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
          const normalizedVariance = variance / (mean * mean);
          totalVariance += normalizedVariance;
          metricCount++;
        }
      });
      
      if (metricCount === 0) return 1;
      
      const averageVariance = totalVariance / metricCount;
      return Math.max(0, 1 - averageVariance);
    } catch (error) {
      logger.error('Error calculating consistency', { error, data });
      return 0.5;
    }
  }

  /**
   * Analyze trends in data
   * @param {Array} data - Behavior data
   * @returns {Object} - Trend analysis
   */
  analyzeTrends(data) {
    try {
      const trends = {};
      const metrics = ['speed', 'delay', 'intensity'];
      
      metrics.forEach(metric => {
        const values = data.map(item => item.data[metric]).filter(val => val !== undefined);
        if (values.length > 2) {
          // Simple linear trend analysis
          const n = values.length;
          const x = Array.from({ length: n }, (_, i) => i);
          const y = values;
          
          const sumX = x.reduce((sum, val) => sum + val, 0);
          const sumY = y.reduce((sum, val) => sum + val, 0);
          const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
          const sumXX = x.reduce((sum, val) => sum + val * val, 0);
          
          const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
          trends[metric] = {
            direction: slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable',
            magnitude: Math.abs(slope),
            confidence: Math.min(1, n / 10) // More data = higher confidence
          };
        }
      });
      
      return trends;
    } catch (error) {
      logger.error('Error analyzing trends', { error, data });
      return {};
    }
  }

  /**
   * Calculate overall confidence
   * @returns {number} - Confidence score (0-1)
   */
  calculateConfidence() {
    try {
      let confidence = 0.5; // Base confidence
      
      // Factor in data amount
      const dataAmount = this.learningData.length;
      if (dataAmount > 100) {
        confidence += 0.2;
      } else if (dataAmount > 50) {
        confidence += 0.1;
      }
      
      // Factor in consistency
      const consistencyScores = Object.values(this.userProfile.patterns).map(pattern => pattern.consistency || 0);
      if (consistencyScores.length > 0) {
        const averageConsistency = consistencyScores.reduce((sum, score) => sum + score, 0) / consistencyScores.length;
        confidence += averageConsistency * 0.2;
      }
      
      // Factor in adaptation success
      const adaptations = this.userProfile.adaptations;
      if (adaptations.total > 0) {
        const successRate = adaptations.successful / adaptations.total;
        confidence += successRate * 0.1;
      }
      
      return Math.max(0, Math.min(1, confidence));
    } catch (error) {
      logger.error('Error calculating confidence', { error });
      return 0.5;
    }
  }

  /**
   * Check if should adapt behavior
   * @returns {boolean} - Should adapt
   */
  shouldAdapt() {
    try {
      if (!this.config.adaptation.enabled) return false;
      
      const random = Math.random();
      return random < this.config.adaptation.frequency;
    } catch (error) {
      logger.error('Error checking adaptation need', { error });
      return false;
    }
  }

  /**
   * Adapt behavior based on learning
   * @param {string} type - Behavior type
   * @param {Object} data - Behavior data
   * @param {Object} context - Context information
   * @returns {Promise<Object>} - Adaptation result
   */
  async adaptBehavior(type, data, context) {
    try {
      const adaptation = {
        type,
        original: { ...data },
        adapted: { ...data },
        confidence: this.userProfile.confidence,
        timestamp: Date.now()
      };
      
      // Apply adaptations based on learned patterns
      switch (type) {
        case 'scroll':
          adaptation.adapted = this.adaptScrollBehavior(data);
          break;
        case 'navigation':
          adaptation.adapted = this.adaptNavigationBehavior(data);
          break;
        case 'interaction':
          adaptation.adapted = this.adaptInteractionBehavior(data);
          break;
        case 'stealth':
          adaptation.adapted = this.adaptStealthBehavior(data);
          break;
      }
      
      // Record adaptation
      this.adaptationHistory.push(adaptation);
      this.userProfile.adaptations.total++;
      
      // Add to history
      this.addToHistory(adaptation);
      
      logger.debug('Behavior adapted', { adaptation });
      return adaptation;
    } catch (error) {
      logger.error('Error adapting behavior', { error, type, data, context });
      return null;
    }
  }

  /**
   * Adapt scroll behavior
   * @param {Object} data - Scroll data
   * @returns {Object} - Adapted scroll data
   */
  adaptScrollBehavior(data) {
    try {
      const adapted = { ...data };
      const intensity = this.config.adaptation.intensity;
      const stability = this.config.adaptation.stability;
      
      // Adapt based on user preferences
      if (data.speed !== undefined) {
        const preferredSpeed = this.userProfile.preferences.scrollSpeed;
        adapted.speed = data.speed * stability + preferredSpeed * (1 - stability);
        adapted.speed += (Math.random() - 0.5) * intensity;
      }
      
      if (data.stepSize !== undefined) {
        const preferredStepSize = this.userProfile.patterns.scroll?.stepSize || 100;
        adapted.stepSize = data.stepSize * stability + preferredStepSize * (1 - stability);
        adapted.stepSize += (Math.random() - 0.5) * intensity * adapted.stepSize;
      }
      
      if (data.delay !== undefined) {
        const preferredDelay = this.userProfile.patterns.scroll?.delay || 300;
        adapted.delay = data.delay * stability + preferredDelay * (1 - stability);
        adapted.delay += (Math.random() - 0.5) * intensity * adapted.delay;
      }
      
      return adapted;
    } catch (error) {
      logger.error('Error adapting scroll behavior', { error, data });
      return data;
    }
  }

  /**
   * Adapt navigation behavior
   * @param {Object} data - Navigation data
   * @returns {Object} - Adapted navigation data
   */
  adaptNavigationBehavior(data) {
    try {
      const adapted = { ...data };
      const intensity = this.config.adaptation.intensity;
      const stability = this.config.adaptation.stability;
      
      if (data.delay !== undefined) {
        const preferredDelay = this.userProfile.patterns.navigation?.delay || 500;
        adapted.delay = data.delay * stability + preferredDelay * (1 - stability);
        adapted.delay += (Math.random() - 0.5) * intensity * adapted.delay;
      }
      
      if (data.hoverDelay !== undefined) {
        const preferredHoverDelay = this.userProfile.patterns.navigation?.hoverDelay || 300;
        adapted.hoverDelay = data.hoverDelay * stability + preferredHoverDelay * (1 - stability);
        adapted.hoverDelay += (Math.random() - 0.5) * intensity * adapted.hoverDelay;
      }
      
      return adapted;
    } catch (error) {
      logger.error('Error adapting navigation behavior', { error, data });
      return data;
    }
  }

  /**
   * Adapt interaction behavior
   * @param {Object} data - Interaction data
   * @returns {Object} - Adapted interaction data
   */
  adaptInteractionBehavior(data) {
    try {
      const adapted = { ...data };
      const intensity = this.config.adaptation.intensity;
      const stability = this.config.adaptation.stability;
      
      if (data.frequency !== undefined) {
        const preferredFrequency = this.userProfile.patterns.interaction?.frequency || 0.5;
        adapted.frequency = data.frequency * stability + preferredFrequency * (1 - stability);
        adapted.frequency += (Math.random() - 0.5) * intensity;
        adapted.frequency = Math.max(0, Math.min(1, adapted.frequency));
      }
      
      return adapted;
    } catch (error) {
      logger.error('Error adapting interaction behavior', { error, data });
      return data;
    }
  }

  /**
   * Adapt stealth behavior
   * @param {Object} data - Stealth data
   * @returns {Object} - Adapted stealth data
   */
  adaptStealthBehavior(data) {
    try {
      const adapted = { ...data };
      const intensity = this.config.adaptation.intensity;
      const stability = this.config.adaptation.stability;
      
      if (data.intensity !== undefined) {
        const preferredIntensity = this.userProfile.patterns.stealth?.intensity || 0.5;
        adapted.intensity = data.intensity * stability + preferredIntensity * (1 - stability);
        adapted.intensity += (Math.random() - 0.5) * intensity;
        adapted.intensity = Math.max(0, Math.min(1, adapted.intensity));
      }
      
      return adapted;
    } catch (error) {
      logger.error('Error adapting stealth behavior', { error, data });
      return data;
    }
  }

  /**
   * Add adaptation to history
   * @param {Object} adaptation - Adaptation result
   */
  addToHistory(adaptation) {
    try {
      this.adaptationHistory.push(adaptation);
      
      // Limit history size
      if (this.adaptationHistory.length > this.config.memorySize) {
        this.adaptationHistory.shift();
      }
    } catch (error) {
      logger.error('Error adding to history', { error, adaptation });
    }
  }

  /**
   * Get user profile
   * @returns {Object} - User profile
   */
  getUserProfile() {
    try {
      return {
        ...this.userProfile,
        behaviorMemory: this.getBehaviorMemory(),
        adaptationHistory: this.adaptationHistory.slice(-100),
        learningData: this.learningData.slice(-100)
      };
    } catch (error) {
      logger.error('Error getting user profile', { error });
      return this.userProfile;
    }
  }

  /**
   * Get behavior memory
   * @returns {Object} - Behavior memory
   */
  getBehaviorMemory() {
    try {
      const memory = {};
      this.behaviorMemory.forEach((value, key) => {
        memory[key] = value;
      });
      return memory;
    } catch (error) {
      logger.error('Error getting behavior memory', { error });
      return {};
    }
  }

  /**
   * Get adaptation history
   * @param {number} limit - Maximum number of adaptations
   * @returns {Array} - Adaptation history
   */
  getAdaptationHistory(limit = 100) {
    try {
      return this.adaptationHistory.slice(-limit);
    } catch (error) {
      logger.error('Error getting adaptation history', { error, limit });
      return [];
    }
  }

  /**
   * Clear learning data and memory
   * @returns {Promise<boolean>} - Success status
   */
  async clearLearningData() {
    try {
      this.behaviorMemory.clear();
      this.adaptationHistory = [];
      this.learningData = [];
      
      // Reset user profile
      await this.initializeUserProfile();
      
      logger.info('Learning data and memory cleared');
      return true;
    } catch (error) {
      logger.error('Error clearing learning data', { error });
      return false;
    }
  }
}

/**
 * Create behavior learner instance
 * @param {Object} config - Configuration object
 * @returns {BehaviorLearner} - Behavior learner instance
 */
export function createBehaviorLearner(config = {}) {
  return new BehaviorLearner(config);
}

/**
 * Default behavior learner instance
 */
export const behaviorLearner = createBehaviorLearner();
