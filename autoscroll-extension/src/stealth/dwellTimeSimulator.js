/**
 * Dwell time simulator for realistic reading and interaction durations
 */

import { createLogger } from '@utils/logger.js';
import { randFloat, randInt, choice, jitter } from '@core/randomizer.js';
import { delay } from '@utils/time.js';

const logger = createLogger('dwell-time-simulator');

/**
 * Dwell Time Simulator
 * Simulates realistic dwell times for reading and interaction
 */
export class DwellTimeSimulator {
  constructor() {
    this.isActive = false;
    this.config = {
      enabled: true,
      dwellTypes: ['reading', 'scanning', 'interacting', 'browsing', 'thinking'],
      currentType: 'reading',
      reading: {
        enabled: true,
        baseTime: { min: 2000, max: 8000 },
        variation: 0.4,
        contentAware: true,
        readingSpeed: 200, // words per minute
        wordCountMultiplier: 0.3,
        complexityMultiplier: 0.2,
        interestMultiplier: 0.1
      },
      scanning: {
        enabled: true,
        baseTime: { min: 500, max: 2000 },
        variation: 0.3,
        contentAware: true,
        scanningSpeed: 500, // words per minute
        wordCountMultiplier: 0.2,
        complexityMultiplier: 0.1,
        interestMultiplier: 0.05
      },
      interacting: {
        enabled: true,
        baseTime: { min: 1000, max: 3000 },
        variation: 0.2,
        contentAware: false,
        interactionComplexity: 0.3,
        userExperience: 0.2,
        elementSize: 0.1
      },
      browsing: {
        enabled: true,
        baseTime: { min: 1500, max: 5000 },
        variation: 0.35,
        contentAware: true,
        browsingSpeed: 300, // words per minute
        wordCountMultiplier: 0.25,
        complexityMultiplier: 0.15,
        interestMultiplier: 0.08
      },
      thinking: {
        enabled: true,
        baseTime: { min: 3000, max: 10000 },
        variation: 0.5,
        contentAware: true,
        thinkingSpeed: 100, // words per minute
        wordCountMultiplier: 0.4,
        complexityMultiplier: 0.3,
        interestMultiplier: 0.2
      },
      behavior: {
        humanVariation: true,
        fatigue: true,
        fatigueRate: 0.1,
        learning: true,
        learningRate: 0.05,
        contextAware: true,
        timeOfDay: true,
        dayOfWeek: true
      },
      patterns: {
        morning: {
          readingSpeed: 1.2,
          thinkingSpeed: 1.1,
          variation: 0.3
        },
        afternoon: {
          readingSpeed: 1.0,
          thinkingSpeed: 1.0,
          variation: 0.4
        },
        evening: {
          readingSpeed: 0.8,
          thinkingSpeed: 0.9,
          variation: 0.5
        },
        night: {
          readingSpeed: 0.6,
          thinkingSpeed: 0.7,
          variation: 0.6
        }
      }
    };
    
    this.stats = {
      totalDwellTimes: 0,
      dwellTimesByType: {},
      totalDwellDuration: 0,
      averageDwellTime: 0,
      lastDwellTime: null,
      currentElement: null,
      dwellHistory: []
    };
    
    this.isDwelling = false;
    this.dwellTimeout = null;
    this.eventListeners = new Map();
  }

  /**
   * Initialize dwell time simulator
   * @param {Object} config - Configuration object
   * @returns {Promise<boolean>} - Success status
   */
  async initialize(config = {}) {
    try {
      this.config = { ...this.config, ...config };
      
      // Validate configuration
      if (!this.validateConfig()) {
        logger.error('Invalid dwell time simulator configuration');
        return false;
      }
      
      logger.info('Dwell time simulator initialized', { config: this.config });
      return true;
    } catch (error) {
      logger.error('Error initializing dwell time simulator', { error });
      return false;
    }
  }

  /**
   * Start dwell time simulator
   * @returns {Promise<boolean>} - Success status
   */
  async start() {
    try {
      if (this.isActive) {
        logger.warn('Dwell time simulator already active');
        return false;
      }

      this.isActive = true;
      
      logger.info('Dwell time simulator started');
      return true;
    } catch (error) {
      logger.error('Error starting dwell time simulator', { error });
      return false;
    }
  }

  /**
   * Stop dwell time simulator
   * @returns {Promise<boolean>} - Success status
   */
  async stop() {
    try {
      if (!this.isActive) {
        logger.warn('Dwell time simulator not active');
        return false;
      }

      this.isActive = false;
      
      // Clear any pending dwell times
      if (this.dwellTimeout) {
        clearTimeout(this.dwellTimeout);
        this.dwellTimeout = null;
      }
      
      this.isDwelling = false;
      
      logger.info('Dwell time simulator stopped');
      return true;
    } catch (error) {
      logger.error('Error stopping dwell time simulator', { error });
      return false;
    }
  }

  /**
   * Simulate dwell time for element
   * @param {HTMLElement} element - Element to dwell on
   * @param {Object} options - Dwell options
   * @returns {Promise<number>} - Actual dwell time in milliseconds
   */
  async dwellOn(element, options = {}) {
    try {
      if (!this.isActive) {
        logger.warn('Dwell time simulator not active');
        return 0;
      }
      
      if (this.isDwelling) {
        logger.debug('Dwell already active, queuing dwell');
        return 0;
      }
      
      this.isDwelling = true;
      
      const dwellType = options.type || this.config.currentType;
      const dwellConfig = this.config[dwellType];
      
      if (!dwellConfig.enabled) {
        logger.debug('Dwell type disabled', { type: dwellType });
        this.isDwelling = false;
        return 0;
      }
      
      // Calculate base dwell time
      let baseTime = randInt(dwellConfig.baseTime.min, dwellConfig.baseTime.max);
      
      // Apply content awareness
      if (dwellConfig.contentAware) {
        baseTime = this.applyContentAwareness(element, baseTime, dwellConfig);
      }
      
      // Apply human variation
      if (this.config.behavior.humanVariation) {
        baseTime = this.applyHumanVariation(baseTime, dwellConfig);
      }
      
      // Apply fatigue
      if (this.config.behavior.fatigue) {
        baseTime = this.applyFatigue(baseTime);
      }
      
      // Apply learning
      if (this.config.behavior.learning) {
        baseTime = this.applyLearning(baseTime);
      }
      
      // Apply time of day patterns
      if (this.config.behavior.timeOfDay) {
        baseTime = this.applyTimeOfDayPatterns(baseTime);
      }
      
      // Apply day of week patterns
      if (this.config.behavior.dayOfWeek) {
        baseTime = this.applyDayOfWeekPatterns(baseTime);
      }
      
      // Ensure minimum dwell time
      baseTime = Math.max(100, baseTime);
      
      // Wait for dwell time
      await delay(baseTime);
      
      // Update statistics
      this.updateStats(dwellType, baseTime);
      
      this.isDwelling = false;
      
      logger.debug('Dwell time simulated', { 
        element: element.tagName,
        type: dwellType,
        duration: baseTime
      });
      
      // Emit event
      this.emit('dwellTimeCompleted', { 
        element, 
        type: dwellType, 
        duration: baseTime 
      });
      
      return baseTime;
    } catch (error) {
      logger.error('Error simulating dwell time', { error, element });
      this.isDwelling = false;
      return 0;
    }
  }

  /**
   * Apply content awareness to dwell time
   * @param {HTMLElement} element - Element to analyze
   * @param {number} baseTime - Base dwell time
   * @param {Object} config - Dwell configuration
   * @returns {number} - Adjusted dwell time
   */
  applyContentAwareness(element, baseTime, config) {
    try {
      let adjustedTime = baseTime;
      
      // Analyze text content
      const textContent = element.textContent || '';
      const wordCount = textContent.split(/\s+/).length;
      
      // Apply word count multiplier
      if (config.wordCountMultiplier) {
        const wordTime = (wordCount / config.readingSpeed) * 60 * 1000; // Convert to milliseconds
        adjustedTime += wordTime * config.wordCountMultiplier;
      }
      
      // Analyze content complexity
      const complexity = this.analyzeContentComplexity(textContent);
      if (config.complexityMultiplier) {
        adjustedTime *= (1 + complexity * config.complexityMultiplier);
      }
      
      // Analyze content interest
      const interest = this.analyzeContentInterest(textContent);
      if (config.interestMultiplier) {
        adjustedTime *= (1 + interest * config.interestMultiplier);
      }
      
      return Math.round(adjustedTime);
    } catch (error) {
      logger.error('Error applying content awareness', { error });
      return baseTime;
    }
  }

  /**
   * Analyze content complexity
   * @param {string} text - Text content
   * @returns {number} - Complexity score (0-1)
   */
  analyzeContentComplexity(text) {
    try {
      if (!text) return 0;
      
      const words = text.split(/\s+/);
      const sentences = text.split(/[.!?]+/);
      const paragraphs = text.split(/\n\s*\n/);
      
      // Calculate average word length
      const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
      
      // Calculate average sentence length
      const avgSentenceLength = words.length / sentences.length;
      
      // Calculate paragraph density
      const paragraphDensity = paragraphs.length / words.length;
      
      // Combine metrics
      const complexity = (
        (avgWordLength / 10) * 0.4 +
        (avgSentenceLength / 20) * 0.4 +
        (paragraphDensity * 100) * 0.2
      );
      
      return Math.min(1, Math.max(0, complexity));
    } catch (error) {
      logger.error('Error analyzing content complexity', { error });
      return 0;
    }
  }

  /**
   * Analyze content interest
   * @param {string} text - Text content
   * @returns {number} - Interest score (0-1)
   */
  analyzeContentInterest(text) {
    try {
      if (!text) return 0;
      
      const interestKeywords = [
        'important', 'urgent', 'breaking', 'news', 'update', 'latest',
        'exclusive', 'revealed', 'discovered', 'found', 'new', 'innovative',
        'revolutionary', 'amazing', 'incredible', 'shocking', 'surprising'
      ];
      
      const lowerText = text.toLowerCase();
      let interestScore = 0;
      
      for (const keyword of interestKeywords) {
        if (lowerText.includes(keyword)) {
          interestScore += 0.1;
        }
      }
      
      // Check for question marks (indicating engagement)
      const questionCount = (text.match(/\?/g) || []).length;
      interestScore += questionCount * 0.05;
      
      // Check for exclamation marks (indicating excitement)
      const exclamationCount = (text.match(/!/g) || []).length;
      interestScore += exclamationCount * 0.03;
      
      return Math.min(1, interestScore);
    } catch (error) {
      logger.error('Error analyzing content interest', { error });
      return 0;
    }
  }

  /**
   * Apply human variation to dwell time
   * @param {number} baseTime - Base dwell time
   * @param {Object} config - Dwell configuration
   * @returns {number} - Varied dwell time
   */
  applyHumanVariation(baseTime, config) {
    try {
      const variation = randFloat(-config.variation, config.variation);
      return Math.round(baseTime * (1 + variation));
    } catch (error) {
      logger.error('Error applying human variation', { error });
      return baseTime;
    }
  }

  /**
   * Apply fatigue to dwell time
   * @param {number} baseTime - Base dwell time
   * @returns {number} - Fatigued dwell time
   */
  applyFatigue(baseTime) {
    try {
      const fatigueFactor = 1 + (this.stats.totalDwellTimes * this.config.behavior.fatigueRate);
      return Math.round(baseTime * fatigueFactor);
    } catch (error) {
      logger.error('Error applying fatigue', { error });
      return baseTime;
    }
  }

  /**
   * Apply learning to dwell time
   * @param {number} baseTime - Base dwell time
   * @returns {number} - Learned dwell time
   */
  applyLearning(baseTime) {
    try {
      const learningFactor = 1 - (this.stats.totalDwellTimes * this.config.behavior.learningRate);
      return Math.round(baseTime * learningFactor);
    } catch (error) {
      logger.error('Error applying learning', { error });
      return baseTime;
    }
  }

  /**
   * Apply time of day patterns
   * @param {number} baseTime - Base dwell time
   * @returns {number} - Time-adjusted dwell time
   */
  applyTimeOfDayPatterns(baseTime) {
    try {
      const hour = new Date().getHours();
      let pattern;
      
      if (hour >= 6 && hour < 12) {
        pattern = this.config.patterns.morning;
      } else if (hour >= 12 && hour < 18) {
        pattern = this.config.patterns.afternoon;
      } else if (hour >= 18 && hour < 22) {
        pattern = this.config.patterns.evening;
      } else {
        pattern = this.config.patterns.night;
      }
      
      // Apply reading speed adjustment
      if (pattern.readingSpeed) {
        baseTime *= pattern.readingSpeed;
      }
      
      // Apply thinking speed adjustment
      if (pattern.thinkingSpeed) {
        baseTime *= pattern.thinkingSpeed;
      }
      
      // Apply variation
      if (pattern.variation) {
        const variation = randFloat(-pattern.variation, pattern.variation);
        baseTime *= (1 + variation);
      }
      
      return Math.round(baseTime);
    } catch (error) {
      logger.error('Error applying time of day patterns', { error });
      return baseTime;
    }
  }

  /**
   * Apply day of week patterns
   * @param {number} baseTime - Base dwell time
   * @returns {number} - Day-adjusted dwell time
   */
  applyDayOfWeekPatterns(baseTime) {
    try {
      const dayOfWeek = new Date().getDay();
      
      // Weekdays vs weekends
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        // Weekdays - faster reading
        baseTime *= 0.9;
      } else {
        // Weekends - slower, more relaxed reading
        baseTime *= 1.1;
      }
      
      return Math.round(baseTime);
    } catch (error) {
      logger.error('Error applying day of week patterns', { error });
      return baseTime;
    }
  }

  /**
   * Set dwell type
   * @param {string} type - Dwell type
   * @returns {boolean} - Success status
   */
  setDwellType(type) {
    try {
      if (!this.config.dwellTypes.includes(type)) {
        logger.warn('Invalid dwell type', { type });
        return false;
      }
      
      this.config.currentType = type;
      logger.debug('Dwell type set', { type });
      return true;
    } catch (error) {
      logger.error('Error setting dwell type', { error });
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
      isDwelling: this.isDwelling,
      currentType: this.config.currentType,
      config: this.config
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      totalDwellTimes: 0,
      dwellTimesByType: {},
      totalDwellDuration: 0,
      averageDwellTime: 0,
      lastDwellTime: null,
      currentElement: null,
      dwellHistory: []
    };
  }

  /**
   * Update configuration
   * @param {Object} newConfig - New configuration
   */
  updateConfig(newConfig) {
    try {
      this.config = { ...this.config, ...newConfig };
      logger.info('Dwell time simulator configuration updated', { config: this.config });
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
      if (!Array.isArray(this.config.dwellTypes) || this.config.dwellTypes.length === 0) {
        logger.error('Dwell types must be a non-empty array');
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
      logger.info('Dwell time simulator cleaned up');
      return true;
    } catch (error) {
      logger.error('Error cleaning up dwell time simulator', { error });
      return false;
    }
  }
}

/**
 * Create dwell time simulator instance
 * @param {Object} config - Configuration object
 * @returns {DwellTimeSimulator} - Simulator instance
 */
export function createDwellTimeSimulator(config = {}) {
  return new DwellTimeSimulator(config);
}

/**
 * Default dwell time simulator instance
 */
export const dwellTimeSimulator = createDwellTimeSimulator();
