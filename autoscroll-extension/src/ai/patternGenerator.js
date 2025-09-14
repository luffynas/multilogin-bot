/**
 * Pattern Generator - AI-powered pattern generation for human-like behavior
 */

import { createLogger } from '../utils/logger.js';
import { randFloat, randInt, choice, jitter } from '../core/randomizer.js';

const logger = createLogger('pattern-generator');

/**
 * AI Pattern Generator
 * Generates human-like behavior patterns using machine learning techniques
 */
export class PatternGenerator {
  constructor() {
    this.isActive = false;
    this.config = {
      enabled: true,
      learningRate: 0.01,
      memorySize: 1000,
      patternTypes: ['scroll', 'navigation', 'interaction', 'stealth'],
      generation: {
        enabled: true,
        frequency: 0.1, // 10% chance to generate new pattern
        variation: 0.3, // 30% variation in generated patterns
        complexity: 'medium' // low, medium, high
      },
      models: {
        scroll: {
          enabled: true,
          patterns: ['linear', 'burst', 'momentum', 'idle', 'reverse', 'adaptive'],
          weights: [0.3, 0.2, 0.2, 0.15, 0.1, 0.05]
        },
        navigation: {
          enabled: true,
          patterns: ['direct', 'exploratory', 'cautious', 'aggressive'],
          weights: [0.4, 0.3, 0.2, 0.1]
        },
        interaction: {
          enabled: true,
          patterns: ['minimal', 'moderate', 'extensive'],
          weights: [0.3, 0.5, 0.2]
        },
        stealth: {
          enabled: true,
          patterns: ['basic', 'advanced', 'expert'],
          weights: [0.4, 0.4, 0.2]
        }
      }
    };
    
    this.patternMemory = new Map();
    this.behaviorModels = new Map();
    this.generationHistory = [];
    this.learningData = [];
  }

  /**
   * Initialize pattern generator
   * @param {Object} config - Configuration object
   * @returns {Promise<boolean>} - Success status
   */
  async initialize(config = {}) {
    try {
      logger.info('Initializing pattern generator', { config });
      
      this.config = { ...this.config, ...config };
      
      if (this.config.enabled) {
        await this.startGeneration();
      }
      
      logger.info('Pattern generator initialized successfully');
      return true;
    } catch (error) {
      logger.error('Error initializing pattern generator', { error });
      return false;
    }
  }

  /**
   * Start pattern generation
   * @returns {Promise<boolean>} - Success status
   */
  async startGeneration() {
    try {
      if (this.isActive) {
        logger.warn('Pattern generation already active');
        return false;
      }

      this.isActive = true;
      
      // Initialize behavior models
      await this.initializeBehaviorModels();
      
      logger.info('Pattern generation started');
      return true;
    } catch (error) {
      logger.error('Error starting pattern generation', { error });
      return false;
    }
  }

  /**
   * Stop pattern generation
   * @returns {Promise<boolean>} - Success status
   */
  async stopGeneration() {
    try {
      if (!this.isActive) {
        logger.warn('Pattern generation not active');
        return false;
      }

      this.isActive = false;
      
      logger.info('Pattern generation stopped');
      return true;
    } catch (error) {
      logger.error('Error stopping pattern generation', { error });
      return false;
    }
  }

  /**
   * Initialize behavior models
   * @returns {Promise<boolean>} - Success status
   */
  async initializeBehaviorModels() {
    try {
      // Initialize scroll behavior model
      this.behaviorModels.set('scroll', this.createScrollModel());
      
      // Initialize navigation behavior model
      this.behaviorModels.set('navigation', this.createNavigationModel());
      
      // Initialize interaction behavior model
      this.behaviorModels.set('interaction', this.createInteractionModel());
      
      // Initialize stealth behavior model
      this.behaviorModels.set('stealth', this.createStealthModel());
      
      logger.info('Behavior models initialized');
      return true;
    } catch (error) {
      logger.error('Error initializing behavior models', { error });
      return false;
    }
  }

  /**
   * Create scroll behavior model
   * @returns {Object} - Scroll behavior model
   */
  createScrollModel() {
    return {
      patterns: {
        linear: {
          weight: 0.3,
          parameters: {
            stepSize: { min: 50, max: 200, distribution: 'normal' },
            delay: { min: 100, max: 500, distribution: 'exponential' },
            jitter: { min: 0.1, max: 0.3, distribution: 'uniform' }
          }
        },
        burst: {
          weight: 0.2,
          parameters: {
            burstSize: { min: 2, max: 5, distribution: 'poisson' },
            burstDelay: { min: 50, max: 200, distribution: 'uniform' },
            pauseDelay: { min: 1000, max: 3000, distribution: 'exponential' }
          }
        },
        momentum: {
          weight: 0.2,
          parameters: {
            acceleration: { min: 0.8, max: 1.5, distribution: 'normal' },
            deceleration: { min: 0.9, max: 0.99, distribution: 'uniform' },
            maxSpeed: { min: 2.0, max: 4.0, distribution: 'normal' }
          }
        },
        idle: {
          weight: 0.15,
          parameters: {
            idleDuration: { min: 2000, max: 8000, distribution: 'exponential' },
            idleProbability: { min: 0.1, max: 0.3, distribution: 'uniform' }
          }
        },
        reverse: {
          weight: 0.1,
          parameters: {
            reverseProbability: { min: 0.05, max: 0.15, distribution: 'uniform' },
            reverseSteps: { min: 1, max: 3, distribution: 'poisson' }
          }
        },
        adaptive: {
          weight: 0.05,
          parameters: {
            adaptationRate: { min: 0.1, max: 0.5, distribution: 'uniform' },
            learningRate: { min: 0.01, max: 0.1, distribution: 'uniform' }
          }
        }
      },
      context: {
        timeOfDay: { morning: 0.3, afternoon: 0.4, evening: 0.2, night: 0.1 },
        contentType: { text: 0.4, mixed: 0.3, media: 0.2, interactive: 0.1 },
        userState: { focused: 0.5, casual: 0.3, distracted: 0.2 }
      }
    };
  }

  /**
   * Create navigation behavior model
   * @returns {Object} - Navigation behavior model
   */
  createNavigationModel() {
    return {
      patterns: {
        direct: {
          weight: 0.4,
          parameters: {
            clickDelay: { min: 100, max: 500, distribution: 'uniform' },
            hoverDelay: { min: 200, max: 800, distribution: 'exponential' }
          }
        },
        exploratory: {
          weight: 0.3,
          parameters: {
            explorationDepth: { min: 2, max: 5, distribution: 'poisson' },
            backtrackProbability: { min: 0.1, max: 0.3, distribution: 'uniform' }
          }
        },
        cautious: {
          weight: 0.2,
          parameters: {
            hesitationDelay: { min: 1000, max: 3000, distribution: 'exponential' },
            multipleHover: { min: 2, max: 4, distribution: 'poisson' }
          }
        },
        aggressive: {
          weight: 0.1,
          parameters: {
            quickClick: { min: 50, max: 200, distribution: 'uniform' },
            rapidNavigation: { min: 0.5, max: 2.0, distribution: 'normal' }
          }
        }
      },
      context: {
        pageType: { article: 0.4, list: 0.3, gallery: 0.2, interactive: 0.1 },
        linkDensity: { low: 0.3, medium: 0.4, high: 0.3 },
        userIntent: { browsing: 0.5, searching: 0.3, task: 0.2 }
      }
    };
  }

  /**
   * Create interaction behavior model
   * @returns {Object} - Interaction behavior model
   */
  createInteractionModel() {
    return {
      patterns: {
        minimal: {
          weight: 0.3,
          parameters: {
            interactionRate: { min: 0.1, max: 0.3, distribution: 'uniform' },
            interactionTypes: ['hover', 'scroll']
          }
        },
        moderate: {
          weight: 0.5,
          parameters: {
            interactionRate: { min: 0.3, max: 0.7, distribution: 'uniform' },
            interactionTypes: ['hover', 'scroll', 'click', 'focus']
          }
        },
        extensive: {
          weight: 0.2,
          parameters: {
            interactionRate: { min: 0.7, max: 1.0, distribution: 'uniform' },
            interactionTypes: ['hover', 'scroll', 'click', 'focus', 'drag', 'keyboard']
          }
        }
      },
      context: {
        elementType: { text: 0.4, link: 0.3, button: 0.2, input: 0.1 },
        elementSize: { small: 0.3, medium: 0.4, large: 0.3 },
        elementVisibility: { visible: 0.8, partially: 0.15, hidden: 0.05 }
      }
    };
  }

  /**
   * Create stealth behavior model
   * @returns {Object} - Stealth behavior model
   */
  createStealthModel() {
    return {
      patterns: {
        basic: {
          weight: 0.4,
          parameters: {
            noiseLevel: { min: 0.1, max: 0.3, distribution: 'uniform' },
            stealthModules: ['noiseEvents', 'tabAwareness']
          }
        },
        advanced: {
          weight: 0.4,
          parameters: {
            noiseLevel: { min: 0.3, max: 0.7, distribution: 'uniform' },
            stealthModules: ['noiseEvents', 'tabAwareness', 'cursorSimulator', 'dwellTimeSimulator']
          }
        },
        expert: {
          weight: 0.2,
          parameters: {
            noiseLevel: { min: 0.7, max: 1.0, distribution: 'uniform' },
            stealthModules: ['noiseEvents', 'tabAwareness', 'cursorSimulator', 'dwellTimeSimulator', 'errorSimulator', 'fingerprintVariation']
          }
        }
      },
      context: {
        detectionRisk: { low: 0.5, medium: 0.3, high: 0.2 },
        siteType: { news: 0.3, blog: 0.3, ecommerce: 0.2, social: 0.2 },
        userBehavior: { normal: 0.6, cautious: 0.3, aggressive: 0.1 }
      }
    };
  }

  /**
   * Generate pattern for specific type
   * @param {string} type - Pattern type
   * @param {Object} context - Context information
   * @returns {Promise<Object>} - Generated pattern
   */
  async generatePattern(type, context = {}) {
    try {
      if (!this.isActive) {
        return this.getDefaultPattern(type);
      }

      const model = this.behaviorModels.get(type);
      if (!model) {
        logger.warn('No model found for pattern type', { type });
        return this.getDefaultPattern(type);
      }

      // Select pattern based on weights and context
      const selectedPattern = this.selectPattern(model, context);
      
      // Generate parameters for selected pattern
      const parameters = this.generateParameters(selectedPattern, context);
      
      // Apply context adjustments
      const adjustedParameters = this.applyContextAdjustments(parameters, context);
      
      // Add variation
      const variedParameters = this.addVariation(adjustedParameters);
      
      const result = {
        type,
        pattern: selectedPattern.name,
        parameters: variedParameters,
        context,
        confidence: this.calculateConfidence(selectedPattern, context),
        timestamp: Date.now()
      };
      
      // Add to generation history
      this.addToHistory(result);
      
      // Learn from generation
      await this.learnFromGeneration(result, context);
      
      logger.debug('Pattern generated', { type, result });
      return result;
    } catch (error) {
      logger.error('Error generating pattern', { error, type, context });
      return this.getDefaultPattern(type);
    }
  }

  /**
   * Select pattern based on model and context
   * @param {Object} model - Behavior model
   * @param {Object} context - Context information
   * @returns {Object} - Selected pattern
   */
  selectPattern(model, context) {
    try {
      const patterns = model.patterns;
      const weights = Object.values(patterns).map(p => p.weight);
      
      // Adjust weights based on context
      const adjustedWeights = this.adjustWeightsForContext(weights, patterns, context);
      
      // Select pattern using weighted random selection
      const selectedIndex = this.weightedRandomSelection(adjustedWeights);
      const patternNames = Object.keys(patterns);
      const selectedPatternName = patternNames[selectedIndex];
      
      return {
        name: selectedPatternName,
        ...patterns[selectedPatternName]
      };
    } catch (error) {
      logger.error('Error selecting pattern', { error, model, context });
      return { name: 'default', weight: 1, parameters: {} };
    }
  }

  /**
   * Adjust weights based on context
   * @param {Array} weights - Original weights
   * @param {Object} patterns - Pattern definitions
   * @param {Object} context - Context information
   * @returns {Array} - Adjusted weights
   */
  adjustWeightsForContext(weights, patterns, context) {
    try {
      const adjustedWeights = [...weights];
      
      // Apply context-based adjustments
      if (context.timeOfDay) {
        // Adjust based on time of day
        const timeAdjustments = {
          morning: [1.2, 1.0, 0.8, 1.1, 0.9, 1.0],
          afternoon: [1.0, 1.1, 1.0, 1.0, 1.0, 1.0],
          evening: [0.8, 1.2, 1.1, 0.9, 1.1, 1.0],
          night: [0.7, 1.3, 1.2, 0.8, 1.2, 1.0]
        };
        
        const adjustments = timeAdjustments[context.timeOfDay] || timeAdjustments.afternoon;
        adjustments.forEach((adjustment, index) => {
          if (adjustedWeights[index]) {
            adjustedWeights[index] *= adjustment;
          }
        });
      }
      
      if (context.contentType) {
        // Adjust based on content type
        const contentAdjustments = {
          text: [1.2, 0.8, 1.0, 1.1, 1.0, 1.0],
          mixed: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
          media: [0.8, 1.2, 1.1, 0.9, 1.0, 1.0],
          interactive: [0.7, 1.3, 1.2, 0.8, 1.1, 1.0]
        };
        
        const adjustments = contentAdjustments[context.contentType] || contentAdjustments.mixed;
        adjustments.forEach((adjustment, index) => {
          if (adjustedWeights[index]) {
            adjustedWeights[index] *= adjustment;
          }
        });
      }
      
      // Normalize weights
      const totalWeight = adjustedWeights.reduce((sum, weight) => sum + weight, 0);
      return adjustedWeights.map(weight => weight / totalWeight);
    } catch (error) {
      logger.error('Error adjusting weights for context', { error, weights, patterns, context });
      return weights;
    }
  }

  /**
   * Weighted random selection
   * @param {Array} weights - Weights array
   * @returns {number} - Selected index
   */
  weightedRandomSelection(weights) {
    try {
      const random = Math.random();
      let cumulativeWeight = 0;
      
      for (let i = 0; i < weights.length; i++) {
        cumulativeWeight += weights[i];
        if (random <= cumulativeWeight) {
          return i;
        }
      }
      
      return weights.length - 1;
    } catch (error) {
      logger.error('Error in weighted random selection', { error, weights });
      return 0;
    }
  }

  /**
   * Generate parameters for selected pattern
   * @param {Object} pattern - Selected pattern
   * @param {Object} context - Context information
   * @returns {Object} - Generated parameters
   */
  generateParameters(pattern, context) {
    try {
      const parameters = {};
      
      Object.entries(pattern.parameters).forEach(([key, config]) => {
        parameters[key] = this.generateParameterValue(config);
      });
      
      return parameters;
    } catch (error) {
      logger.error('Error generating parameters', { error, pattern, context });
      return {};
    }
  }

  /**
   * Generate parameter value based on configuration
   * @param {Object} config - Parameter configuration
   * @returns {*} - Generated value
   */
  generateParameterValue(config) {
    try {
      const { min, max, distribution = 'uniform' } = config;
      
      switch (distribution) {
        case 'uniform':
          return randFloat(min, max);
          
        case 'normal':
          return this.generateNormalDistribution(min, max);
          
        case 'exponential':
          return this.generateExponentialDistribution(min, max);
          
        case 'poisson':
          return this.generatePoissonDistribution(min, max);
          
        default:
          return randFloat(min, max);
      }
    } catch (error) {
      logger.error('Error generating parameter value', { error, config });
      return config.min || 0;
    }
  }

  /**
   * Generate normal distribution value
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} - Generated value
   */
  generateNormalDistribution(min, max) {
    try {
      const mean = (min + max) / 2;
      const stdDev = (max - min) / 6; // 99.7% within 3 standard deviations
      
      // Box-Muller transform
      const u1 = Math.random();
      const u2 = Math.random();
      const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      
      const value = mean + z0 * stdDev;
      return Math.max(min, Math.min(max, value));
    } catch (error) {
      logger.error('Error generating normal distribution', { error, min, max });
      return (min + max) / 2;
    }
  }

  /**
   * Generate exponential distribution value
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} - Generated value
   */
  generateExponentialDistribution(min, max) {
    try {
      const lambda = 1 / ((max - min) / 2);
      const value = -Math.log(1 - Math.random()) / lambda;
      return Math.max(min, Math.min(max, value));
    } catch (error) {
      logger.error('Error generating exponential distribution', { error, min, max });
      return (min + max) / 2;
    }
  }

  /**
   * Generate Poisson distribution value
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} - Generated value
   */
  generatePoissonDistribution(min, max) {
    try {
      const lambda = (min + max) / 2;
      let k = 0;
      let p = 1;
      
      do {
        k++;
        p *= Math.random();
      } while (p > Math.exp(-lambda));
      
      return Math.max(min, Math.min(max, k - 1));
    } catch (error) {
      logger.error('Error generating Poisson distribution', { error, min, max });
      return Math.floor((min + max) / 2);
    }
  }

  /**
   * Apply context adjustments to parameters
   * @param {Object} parameters - Generated parameters
   * @param {Object} context - Context information
   * @returns {Object} - Adjusted parameters
   */
  applyContextAdjustments(parameters, context) {
    try {
      const adjusted = { ...parameters };
      
      // Apply user state adjustments
      if (context.userState) {
        const stateAdjustments = {
          focused: { multiplier: 1.0, variation: 0.1 },
          casual: { multiplier: 1.2, variation: 0.2 },
          distracted: { multiplier: 1.5, variation: 0.3 }
        };
        
        const adjustment = stateAdjustments[context.userState] || stateAdjustments.casual;
        
        Object.keys(adjusted).forEach(key => {
          if (typeof adjusted[key] === 'number') {
            adjusted[key] *= adjustment.multiplier;
            adjusted[key] += (Math.random() - 0.5) * adjustment.variation * adjusted[key];
          }
        });
      }
      
      return adjusted;
    } catch (error) {
      logger.error('Error applying context adjustments', { error, parameters, context });
      return parameters;
    }
  }

  /**
   * Add variation to parameters
   * @param {Object} parameters - Parameters to vary
   * @returns {Object} - Varied parameters
   */
  addVariation(parameters) {
    try {
      const variation = this.config.generation.variation;
      const varied = {};
      
      Object.entries(parameters).forEach(([key, value]) => {
        if (typeof value === 'number') {
          const jitterAmount = value * variation;
          varied[key] = jitter(value, jitterAmount);
        } else {
          varied[key] = value;
        }
      });
      
      return varied;
    } catch (error) {
      logger.error('Error adding variation', { error, parameters });
      return parameters;
    }
  }

  /**
   * Calculate pattern confidence
   * @param {Object} pattern - Selected pattern
   * @param {Object} context - Context information
   * @returns {number} - Confidence score (0-1)
   */
  calculateConfidence(pattern, context) {
    try {
      let confidence = pattern.weight;
      
      // Adjust confidence based on context match
      if (context.timeOfDay && pattern.context?.timeOfDay) {
        const timeMatch = pattern.context.timeOfDay[context.timeOfDay] || 0.5;
        confidence *= timeMatch;
      }
      
      if (context.contentType && pattern.context?.contentType) {
        const contentMatch = pattern.context.contentType[context.contentType] || 0.5;
        confidence *= contentMatch;
      }
      
      return Math.max(0, Math.min(1, confidence));
    } catch (error) {
      logger.error('Error calculating confidence', { error, pattern, context });
      return 0.5;
    }
  }

  /**
   * Add generation to history
   * @param {Object} result - Generation result
   */
  addToHistory(result) {
    try {
      this.generationHistory.push(result);
      
      // Limit history size
      if (this.generationHistory.length > this.config.memorySize) {
        this.generationHistory.shift();
      }
    } catch (error) {
      logger.error('Error adding to history', { error, result });
    }
  }

  /**
   * Learn from generation
   * @param {Object} result - Generation result
   * @param {Object} context - Context information
   */
  async learnFromGeneration(result, context) {
    try {
      // Add to learning data
      this.learningData.push({
        result,
        context,
        timestamp: Date.now()
      });
      
      // Limit learning data size
      if (this.learningData.length > this.config.memorySize) {
        this.learningData.shift();
      }
      
      // Update pattern memory
      this.updatePatternMemory(result, context);
      
      // Update behavior models
      await this.updateBehaviorModels(result, context);
    } catch (error) {
      logger.error('Error learning from generation', { error, result, context });
    }
  }

  /**
   * Update pattern memory
   * @param {Object} result - Generation result
   * @param {Object} context - Context information
   */
  updatePatternMemory(result, context) {
    try {
      const key = `${result.type}_${result.pattern}`;
      const existing = this.patternMemory.get(key) || { count: 0, contexts: [] };
      
      existing.count++;
      existing.contexts.push(context);
      
      // Limit context history
      if (existing.contexts.length > 100) {
        existing.contexts.shift();
      }
      
      this.patternMemory.set(key, existing);
    } catch (error) {
      logger.error('Error updating pattern memory', { error, result, context });
    }
  }

  /**
   * Update behavior models
   * @param {Object} result - Generation result
   * @param {Object} context - Context information
   */
  async updateBehaviorModels(result, context) {
    try {
      const model = this.behaviorModels.get(result.type);
      if (!model) return;
      
      const pattern = model.patterns[result.pattern];
      if (!pattern) return;
      
      // Update pattern weight based on usage
      const learningRate = this.config.learningRate;
      pattern.weight = pattern.weight * (1 - learningRate) + learningRate;
      
      // Normalize weights
      const totalWeight = Object.values(model.patterns).reduce((sum, p) => sum + p.weight, 0);
      Object.values(model.patterns).forEach(p => {
        p.weight /= totalWeight;
      });
    } catch (error) {
      logger.error('Error updating behavior models', { error, result, context });
    }
  }

  /**
   * Get default pattern
   * @param {string} type - Pattern type
   * @returns {Object} - Default pattern
   */
  getDefaultPattern(type) {
    const defaultPatterns = {
      scroll: {
        type: 'scroll',
        pattern: 'linear',
        parameters: {
          stepSize: 100,
          delay: 300,
          jitter: 0.2
        },
        confidence: 0.5,
        timestamp: Date.now()
      },
      navigation: {
        type: 'navigation',
        pattern: 'direct',
        parameters: {
          clickDelay: 300,
          hoverDelay: 500
        },
        confidence: 0.5,
        timestamp: Date.now()
      },
      interaction: {
        type: 'interaction',
        pattern: 'moderate',
        parameters: {
          interactionRate: 0.5,
          interactionTypes: ['hover', 'scroll', 'click']
        },
        confidence: 0.5,
        timestamp: Date.now()
      },
      stealth: {
        type: 'stealth',
        pattern: 'basic',
        parameters: {
          noiseLevel: 0.3,
          stealthModules: ['noiseEvents', 'tabAwareness']
        },
        confidence: 0.5,
        timestamp: Date.now()
      }
    };
    
    return defaultPatterns[type] || defaultPatterns.scroll;
  }

  /**
   * Get generation history
   * @param {number} limit - Maximum number of generations
   * @returns {Array} - Generation history
   */
  getHistory(limit = 100) {
    try {
      return this.generationHistory.slice(-limit);
    } catch (error) {
      logger.error('Error getting history', { error, limit });
      return [];
    }
  }

  /**
   * Get pattern memory
   * @returns {Object} - Pattern memory
   */
  getPatternMemory() {
    try {
      const memory = {};
      this.patternMemory.forEach((value, key) => {
        memory[key] = value;
      });
      return memory;
    } catch (error) {
      logger.error('Error getting pattern memory', { error });
      return {};
    }
  }

  /**
   * Clear pattern memory and history
   * @returns {Promise<boolean>} - Success status
   */
  async clearMemory() {
    try {
      this.patternMemory.clear();
      this.generationHistory = [];
      this.learningData = [];
      
      logger.info('Pattern memory and history cleared');
      return true;
    } catch (error) {
      logger.error('Error clearing memory', { error });
      return false;
    }
  }
}

/**
 * Create pattern generator instance
 * @param {Object} config - Configuration object
 * @returns {PatternGenerator} - Pattern generator instance
 */
export function createPatternGenerator(config = {}) {
  return new PatternGenerator(config);
}

/**
 * Default pattern generator instance
 */
export const patternGenerator = createPatternGenerator();
