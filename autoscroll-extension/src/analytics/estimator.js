/**
 * Estimator - Reading time and content analysis estimation
 */

import { createLogger } from '../utils/logger.js';
import { randFloat, randInt } from '../core/randomizer.js';

const logger = createLogger('estimator');

/**
 * Content and Reading Time Estimator
 * Estimates reading time and analyzes content complexity
 */
export class ContentEstimator {
  constructor() {
    this.isActive = false;
    this.config = {
      enabled: true,
      readingSpeed: {
        slow: 150, // words per minute
        normal: 200,
        fast: 300,
        veryFast: 400
      },
      contentAnalysis: {
        enabled: true,
        complexityFactors: {
          headings: 0.1,
          images: 0.05,
          links: 0.02,
          lists: 0.03,
          code: 0.15,
          tables: 0.08
        }
      },
      estimation: {
        baseTime: 1000, // base time in milliseconds
        wordWeight: 0.3,
        complexityWeight: 0.2,
        interestWeight: 0.1,
        variation: 0.3 // 30% variation
      }
    };
    
    this.contentCache = new Map();
    this.estimationHistory = [];
  }

  /**
   * Initialize content estimator
   * @param {Object} config - Configuration object
   * @returns {Promise<boolean>} - Success status
   */
  async initialize(config = {}) {
    try {
      logger.info('Initializing content estimator', { config });
      
      this.config = { ...this.config, ...config };
      
      if (this.config.enabled) {
        await this.startEstimation();
      }
      
      logger.info('Content estimator initialized successfully');
      return true;
    } catch (error) {
      logger.error('Error initializing content estimator', { error });
      return false;
    }
  }

  /**
   * Start content estimation
   * @returns {Promise<boolean>} - Success status
   */
  async startEstimation() {
    try {
      if (this.isActive) {
        logger.warn('Content estimation already active');
        return false;
      }

      this.isActive = true;
      
      logger.info('Content estimation started');
      return true;
    } catch (error) {
      logger.error('Error starting content estimation', { error });
      return false;
    }
  }

  /**
   * Stop content estimation
   * @returns {Promise<boolean>} - Success status
   */
  async stopEstimation() {
    try {
      if (!this.isActive) {
        logger.warn('Content estimation not active');
        return false;
      }

      this.isActive = false;
      
      logger.info('Content estimation stopped');
      return true;
    } catch (error) {
      logger.error('Error stopping content estimation', { error });
      return false;
    }
  }

  /**
   * Estimate reading time for content
   * @param {Object} options - Estimation options
   * @returns {Promise<Object>} - Reading time estimation
   */
  async estimateReadingTime(options = {}) {
    try {
      if (!this.isActive) {
        return this.getDefaultEstimation();
      }

      const {
        content = document.body,
        readingSpeed = 'normal',
        includeComplexity = true,
        includeInterest = true
      } = options;

      // Analyze content
      const contentAnalysis = await this.analyzeContent(content);
      
      // Calculate base reading time
      const baseTime = this.calculateBaseReadingTime(contentAnalysis, readingSpeed);
      
      // Apply complexity factor
      const complexityFactor = includeComplexity ? 
        this.calculateComplexityFactor(contentAnalysis) : 1;
      
      // Apply interest factor
      const interestFactor = includeInterest ? 
        this.calculateInterestFactor(contentAnalysis) : 1;
      
      // Calculate final estimation
      const estimatedTime = baseTime * complexityFactor * interestFactor;
      
      // Add variation
      const variation = this.config.estimation.variation;
      const minTime = estimatedTime * (1 - variation);
      const maxTime = estimatedTime * (1 + variation);
      
      const result = {
        estimatedTime: Math.round(estimatedTime),
        minTime: Math.round(minTime),
        maxTime: Math.round(maxTime),
        baseTime: Math.round(baseTime),
        complexityFactor,
        interestFactor,
        contentAnalysis,
        readingSpeed,
        confidence: this.calculateConfidence(contentAnalysis),
        timestamp: Date.now()
      };
      
      // Cache result
      this.cacheEstimation(content, result);
      
      // Add to history
      this.addToHistory(result);
      
      logger.debug('Reading time estimated', { result });
      return result;
    } catch (error) {
      logger.error('Error estimating reading time', { error, options });
      return this.getDefaultEstimation();
    }
  }

  /**
   * Analyze content for complexity and characteristics
   * @param {Element} content - Content element
   * @returns {Promise<Object>} - Content analysis
   */
  async analyzeContent(content) {
    try {
      const analysis = {
        wordCount: 0,
        characterCount: 0,
        sentenceCount: 0,
        paragraphCount: 0,
        headingCount: 0,
        imageCount: 0,
        linkCount: 0,
        listCount: 0,
        codeCount: 0,
        tableCount: 0,
        complexity: 0,
        readability: 0,
        structure: {},
        elements: {}
      };

      // Get text content
      const textContent = content.textContent || '';
      analysis.characterCount = textContent.length;
      
      // Count words
      const words = textContent.trim().split(/\s+/).filter(word => word.length > 0);
      analysis.wordCount = words.length;
      
      // Count sentences
      const sentences = textContent.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
      analysis.sentenceCount = sentences.length;
      
      // Count paragraphs
      const paragraphs = content.querySelectorAll('p');
      analysis.paragraphCount = paragraphs.length;
      
      // Count headings
      const headings = content.querySelectorAll('h1, h2, h3, h4, h5, h6');
      analysis.headingCount = headings.length;
      
      // Count images
      const images = content.querySelectorAll('img');
      analysis.imageCount = images.length;
      
      // Count links
      const links = content.querySelectorAll('a');
      analysis.linkCount = links.length;
      
      // Count lists
      const lists = content.querySelectorAll('ul, ol');
      analysis.listCount = lists.length;
      
      // Count code blocks
      const codeBlocks = content.querySelectorAll('code, pre');
      analysis.codeCount = codeBlocks.length;
      
      // Count tables
      const tables = content.querySelectorAll('table');
      analysis.tableCount = tables.length;
      
      // Calculate complexity
      analysis.complexity = this.calculateContentComplexity(analysis);
      
      // Calculate readability
      analysis.readability = this.calculateReadability(analysis);
      
      // Analyze structure
      analysis.structure = this.analyzeStructure(content);
      
      // Analyze elements
      analysis.elements = this.analyzeElements(content);
      
      return analysis;
    } catch (error) {
      logger.error('Error analyzing content', { error, content });
      return this.getDefaultAnalysis();
    }
  }

  /**
   * Calculate base reading time
   * @param {Object} analysis - Content analysis
   * @param {string} readingSpeed - Reading speed level
   * @returns {number} - Base reading time in milliseconds
   */
  calculateBaseReadingTime(analysis, readingSpeed) {
    try {
      const wordsPerMinute = this.config.readingSpeed[readingSpeed] || this.config.readingSpeed.normal;
      const wordsPerSecond = wordsPerMinute / 60;
      const baseTime = (analysis.wordCount / wordsPerSecond) * 1000; // Convert to milliseconds
      
      return Math.max(this.config.estimation.baseTime, baseTime);
    } catch (error) {
      logger.error('Error calculating base reading time', { error, analysis, readingSpeed });
      return this.config.estimation.baseTime;
    }
  }

  /**
   * Calculate content complexity factor
   * @param {Object} analysis - Content analysis
   * @returns {number} - Complexity factor
   */
  calculateComplexityFactor(analysis) {
    try {
      const factors = this.config.contentAnalysis.complexityFactors;
      let complexityFactor = 1;
      
      // Apply complexity factors
      complexityFactor += (analysis.headingCount * factors.headings);
      complexityFactor += (analysis.imageCount * factors.images);
      complexityFactor += (analysis.linkCount * factors.links);
      complexityFactor += (analysis.listCount * factors.lists);
      complexityFactor += (analysis.codeCount * factors.code);
      complexityFactor += (analysis.tableCount * factors.tables);
      
      // Normalize complexity factor
      return Math.max(0.5, Math.min(2.0, complexityFactor));
    } catch (error) {
      logger.error('Error calculating complexity factor', { error, analysis });
      return 1;
    }
  }

  /**
   * Calculate interest factor
   * @param {Object} analysis - Content analysis
   * @returns {number} - Interest factor
   */
  calculateInterestFactor(analysis) {
    try {
      let interestFactor = 1;
      
      // Factor in content type
      if (analysis.headingCount > 0) {
        interestFactor += 0.1; // Headings make content more interesting
      }
      
      if (analysis.imageCount > 0) {
        interestFactor += 0.05; // Images make content more engaging
      }
      
      if (analysis.listCount > 0) {
        interestFactor += 0.03; // Lists make content more scannable
      }
      
      // Factor in content length
      if (analysis.wordCount > 1000) {
        interestFactor += 0.1; // Longer content might be more engaging
      } else if (analysis.wordCount < 100) {
        interestFactor -= 0.1; // Very short content might be less engaging
      }
      
      // Factor in readability
      if (analysis.readability > 0.7) {
        interestFactor += 0.05; // More readable content is more engaging
      } else if (analysis.readability < 0.3) {
        interestFactor -= 0.05; // Less readable content is less engaging
      }
      
      return Math.max(0.5, Math.min(1.5, interestFactor));
    } catch (error) {
      logger.error('Error calculating interest factor', { error, analysis });
      return 1;
    }
  }

  /**
   * Calculate content complexity score
   * @param {Object} analysis - Content analysis
   * @returns {number} - Complexity score (0-1)
   */
  calculateContentComplexity(analysis) {
    try {
      let complexity = 0;
      
      // Word complexity
      if (analysis.wordCount > 0) {
        const avgWordLength = analysis.characterCount / analysis.wordCount;
        complexity += Math.min(avgWordLength / 10, 0.3); // Max 0.3 for word complexity
      }
      
      // Sentence complexity
      if (analysis.sentenceCount > 0) {
        const avgSentenceLength = analysis.wordCount / analysis.sentenceCount;
        complexity += Math.min(avgSentenceLength / 50, 0.2); // Max 0.2 for sentence complexity
      }
      
      // Structural complexity
      const structuralElements = analysis.headingCount + analysis.listCount + analysis.tableCount + analysis.codeCount;
      complexity += Math.min(structuralElements / 20, 0.3); // Max 0.3 for structural complexity
      
      // Link complexity
      if (analysis.wordCount > 0) {
        const linkDensity = analysis.linkCount / analysis.wordCount;
        complexity += Math.min(linkDensity * 100, 0.2); // Max 0.2 for link complexity
      }
      
      return Math.max(0, Math.min(1, complexity));
    } catch (error) {
      logger.error('Error calculating content complexity', { error, analysis });
      return 0.5;
    }
  }

  /**
   * Calculate readability score
   * @param {Object} analysis - Content analysis
   * @returns {number} - Readability score (0-1)
   */
  calculateReadability(analysis) {
    try {
      if (analysis.wordCount === 0 || analysis.sentenceCount === 0) {
        return 0.5;
      }
      
      // Simple readability calculation based on average sentence length
      const avgSentenceLength = analysis.wordCount / analysis.sentenceCount;
      
      // Normalize to 0-1 scale (shorter sentences = higher readability)
      const readability = Math.max(0, Math.min(1, 1 - (avgSentenceLength - 10) / 30));
      
      return readability;
    } catch (error) {
      logger.error('Error calculating readability', { error, analysis });
      return 0.5;
    }
  }

  /**
   * Analyze content structure
   * @param {Element} content - Content element
   * @returns {Object} - Structure analysis
   */
  analyzeStructure(content) {
    try {
      const structure = {
        hasTitle: false,
        hasIntroduction: false,
        hasConclusion: false,
        hasNavigation: false,
        hasSidebar: false,
        hasFooter: false,
        sections: 0,
        depth: 0
      };
      
      // Check for title
      structure.hasTitle = content.querySelector('h1, title') !== null;
      
      // Check for introduction (first paragraph or section)
      const firstParagraph = content.querySelector('p');
      structure.hasIntroduction = firstParagraph !== null;
      
      // Check for conclusion (last paragraph or section)
      const paragraphs = content.querySelectorAll('p');
      structure.hasConclusion = paragraphs.length > 0;
      
      // Check for navigation
      structure.hasNavigation = content.querySelector('nav, .navigation, .menu') !== null;
      
      // Check for sidebar
      structure.hasSidebar = content.querySelector('.sidebar, .aside, aside') !== null;
      
      // Check for footer
      structure.hasFooter = content.querySelector('footer, .footer') !== null;
      
      // Count sections
      structure.sections = content.querySelectorAll('section, .section').length;
      
      // Calculate depth (max heading level)
      const headings = content.querySelectorAll('h1, h2, h3, h4, h5, h6');
      let maxDepth = 0;
      headings.forEach(heading => {
        const level = parseInt(heading.tagName.charAt(1));
        maxDepth = Math.max(maxDepth, level);
      });
      structure.depth = maxDepth;
      
      return structure;
    } catch (error) {
      logger.error('Error analyzing structure', { error, content });
      return {};
    }
  }

  /**
   * Analyze content elements
   * @param {Element} content - Content element
   * @returns {Object} - Elements analysis
   */
  analyzeElements(content) {
    try {
      const elements = {
        interactive: 0,
        media: 0,
        forms: 0,
        buttons: 0,
        inputs: 0
      };
      
      // Count interactive elements
      elements.interactive = content.querySelectorAll('a, button, input, select, textarea').length;
      
      // Count media elements
      elements.media = content.querySelectorAll('img, video, audio, iframe').length;
      
      // Count forms
      elements.forms = content.querySelectorAll('form').length;
      
      // Count buttons
      elements.buttons = content.querySelectorAll('button, input[type="button"], input[type="submit"]').length;
      
      // Count inputs
      elements.inputs = content.querySelectorAll('input, textarea, select').length;
      
      return elements;
    } catch (error) {
      logger.error('Error analyzing elements', { error, content });
      return {};
    }
  }

  /**
   * Calculate estimation confidence
   * @param {Object} analysis - Content analysis
   * @returns {number} - Confidence score (0-1)
   */
  calculateConfidence(analysis) {
    try {
      let confidence = 0.5; // Base confidence
      
      // Higher confidence for more content
      if (analysis.wordCount > 100) {
        confidence += 0.2;
      }
      
      // Higher confidence for structured content
      if (analysis.headingCount > 0) {
        confidence += 0.1;
      }
      
      if (analysis.paragraphCount > 0) {
        confidence += 0.1;
      }
      
      // Lower confidence for very complex content
      if (analysis.complexity > 0.8) {
        confidence -= 0.1;
      }
      
      // Lower confidence for very short content
      if (analysis.wordCount < 50) {
        confidence -= 0.2;
      }
      
      return Math.max(0, Math.min(1, confidence));
    } catch (error) {
      logger.error('Error calculating confidence', { error, analysis });
      return 0.5;
    }
  }

  /**
   * Cache estimation result
   * @param {Element} content - Content element
   * @param {Object} result - Estimation result
   */
  cacheEstimation(content, result) {
    try {
      const contentHash = this.generateContentHash(content);
      this.contentCache.set(contentHash, {
        result,
        timestamp: Date.now()
      });
      
      // Limit cache size
      if (this.contentCache.size > 100) {
        const firstKey = this.contentCache.keys().next().value;
        this.contentCache.delete(firstKey);
      }
    } catch (error) {
      logger.error('Error caching estimation', { error, content, result });
    }
  }

  /**
   * Generate content hash
   * @param {Element} content - Content element
   * @returns {string} - Content hash
   */
  generateContentHash(content) {
    try {
      const text = content.textContent || '';
      const length = text.length;
      const words = text.split(/\s+/).length;
      return `${length}_${words}_${content.tagName}`;
    } catch (error) {
      logger.error('Error generating content hash', { error, content });
      return Date.now().toString();
    }
  }

  /**
   * Add estimation to history
   * @param {Object} result - Estimation result
   */
  addToHistory(result) {
    try {
      this.estimationHistory.push(result);
      
      // Limit history size
      if (this.estimationHistory.length > 1000) {
        this.estimationHistory.shift();
      }
    } catch (error) {
      logger.error('Error adding to history', { error, result });
    }
  }

  /**
   * Get default estimation
   * @returns {Object} - Default estimation
   */
  getDefaultEstimation() {
    return {
      estimatedTime: this.config.estimation.baseTime,
      minTime: this.config.estimation.baseTime * 0.7,
      maxTime: this.config.estimation.baseTime * 1.3,
      baseTime: this.config.estimation.baseTime,
      complexityFactor: 1,
      interestFactor: 1,
      contentAnalysis: this.getDefaultAnalysis(),
      readingSpeed: 'normal',
      confidence: 0.5,
      timestamp: Date.now()
    };
  }

  /**
   * Get default analysis
   * @returns {Object} - Default analysis
   */
  getDefaultAnalysis() {
    return {
      wordCount: 0,
      characterCount: 0,
      sentenceCount: 0,
      paragraphCount: 0,
      headingCount: 0,
      imageCount: 0,
      linkCount: 0,
      listCount: 0,
      codeCount: 0,
      tableCount: 0,
      complexity: 0.5,
      readability: 0.5,
      structure: {},
      elements: {}
    };
  }

  /**
   * Get estimation history
   * @param {number} limit - Maximum number of estimations
   * @returns {Array} - Estimation history
   */
  getHistory(limit = 100) {
    try {
      return this.estimationHistory.slice(-limit);
    } catch (error) {
      logger.error('Error getting history', { error, limit });
      return [];
    }
  }

  /**
   * Clear estimation cache and history
   * @returns {Promise<boolean>} - Success status
   */
  async clearCache() {
    try {
      this.contentCache.clear();
      this.estimationHistory = [];
      
      logger.info('Estimation cache and history cleared');
      return true;
    } catch (error) {
      logger.error('Error clearing cache', { error });
      return false;
    }
  }
}

/**
 * Create content estimator instance
 * @param {Object} config - Configuration object
 * @returns {ContentEstimator} - Content estimator instance
 */
export function createContentEstimator(config = {}) {
  return new ContentEstimator(config);
}

/**
 * Default content estimator instance
 */
export const contentEstimator = createContentEstimator();
