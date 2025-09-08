/**
 * Keyword detector for identifying and prioritizing links based on keywords
 */

import { createLogger } from '../utils/logger.js';
import { randFloat, randInt, choice } from '../core/randomizer.js';
import { safeQuerySelector, safeQuerySelectorAll, isElementVisible } from '../utils/dom.js';

const logger = createLogger('keyword-detector');

/**
 * Keyword Detector
 * Detects and analyzes links based on keyword preferences
 */
export class KeywordDetector {
  constructor() {
    this.isActive = false;
    this.detectedKeywords = new Map();
    this.config = {
      enabled: true,
      detectionInterval: 5000, // 5 seconds
      minKeywordLength: 3,
      maxKeywordsPerPage: 50,
      selectors: {
        links: [
          'a[href]',
          'button[onclick]',
          '[role="link"]',
          '[data-href]',
          '[data-url]'
        ],
        headings: [
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
          '[role="heading"]',
          '.heading',
          '.title',
          '.headline'
        ],
        content: [
          'p', 'div', 'span', 'article', 'section',
          '.content', '.text', '.description', '.summary'
        ]
      },
      keywordCategories: {
        technology: [
          'javascript', 'python', 'react', 'vue', 'angular', 'node', 'api',
          'programming', 'coding', 'development', 'software', 'tech', 'ai',
          'machine learning', 'data science', 'web development', 'mobile'
        ],
        business: [
          'business', 'marketing', 'sales', 'finance', 'startup', 'entrepreneur',
          'investment', 'strategy', 'management', 'leadership', 'growth',
          'revenue', 'profit', 'customer', 'market', 'industry'
        ],
        lifestyle: [
          'health', 'fitness', 'nutrition', 'wellness', 'travel', 'food',
          'cooking', 'recipe', 'fashion', 'style', 'beauty', 'home',
          'garden', 'diy', 'craft', 'art', 'music', 'movie', 'book'
        ],
        education: [
          'education', 'learning', 'course', 'tutorial', 'guide', 'how to',
          'tips', 'advice', 'knowledge', 'skill', 'training', 'certification',
          'degree', 'university', 'college', 'school', 'student'
        ],
        news: [
          'news', 'breaking', 'latest', 'update', 'report', 'analysis',
          'opinion', 'commentary', 'politics', 'world', 'local', 'national',
          'international', 'economy', 'sports', 'entertainment'
        ]
      },
      scoring: {
        titleWeight: 0.4,
        headingWeight: 0.3,
        contentWeight: 0.2,
        linkTextWeight: 0.1,
        frequencyWeight: 0.1
      },
      preferences: {
        enabled: true,
        categories: ['technology', 'business', 'education'],
        keywords: [],
        excludeKeywords: ['advertisement', 'sponsored', 'promo', 'sale'],
        minScore: 0.3,
        maxResults: 10
      }
    };
    
    this.stats = {
      totalKeywordsDetected: 0,
      keywordsByCategory: {},
      lastDetectionTime: null,
      detectionAccuracy: 0,
      preferences: {
        totalMatches: 0,
        categoryMatches: {},
        keywordMatches: 0
      }
    };
    
    this.detectionTimer = null;
    this.eventListeners = new Map();
  }

  /**
   * Initialize keyword detector
   * @param {Object} config - Configuration object
   * @returns {Promise<boolean>} - Success status
   */
  async initialize(config = {}) {
    try {
      this.config = { ...this.config, ...config };
      
      // Validate configuration
      if (!this.validateConfig()) {
        logger.error('Invalid keyword detector configuration');
        return false;
      }
      
      logger.info('Keyword detector initialized', { config: this.config });
      return true;
    } catch (error) {
      logger.error('Error initializing keyword detector', { error });
      return false;
    }
  }

  /**
   * Start keyword detection
   * @returns {Promise<boolean>} - Success status
   */
  async start() {
    try {
      if (this.isActive) {
        logger.warn('Keyword detector already active');
        return false;
      }

      this.isActive = true;
      
      // Initial detection
      await this.detectKeywords();
      
      // Start periodic detection
      this.startPeriodicDetection();
      
      logger.info('Keyword detector started');
      return true;
    } catch (error) {
      logger.error('Error starting keyword detector', { error });
      return false;
    }
  }

  /**
   * Stop keyword detection
   * @returns {Promise<boolean>} - Success status
   */
  async stop() {
    try {
      if (!this.isActive) {
        logger.warn('Keyword detector not active');
        return false;
      }

      this.isActive = false;
      this.stopPeriodicDetection();
      this.clearDetectedKeywords();
      
      logger.info('Keyword detector stopped');
      return true;
    } catch (error) {
      logger.error('Error stopping keyword detector', { error });
      return false;
    }
  }

  /**
   * Detect keywords on the page
   * @returns {Promise<Array>} - Array of detected keywords
   */
  async detectKeywords() {
    try {
      const keywords = [];
      
      // Detect keywords in different elements
      const linkKeywords = await this.detectLinkKeywords();
      const headingKeywords = await this.detectHeadingKeywords();
      const contentKeywords = await this.detectContentKeywords();
      
      keywords.push(...linkKeywords, ...headingKeywords, ...contentKeywords);
      
      // Filter and validate keywords
      const validKeywords = this.filterValidKeywords(keywords);
      
      // Update detected keywords map
      this.updateDetectedKeywords(validKeywords);
      
      // Update statistics
      this.updateStats(validKeywords);
      
      logger.debug('Keywords detected', { 
        total: validKeywords.length,
        links: linkKeywords.length,
        headings: headingKeywords.length,
        content: contentKeywords.length
      });
      
      return validKeywords;
    } catch (error) {
      logger.error('Error detecting keywords', { error });
      return [];
    }
  }

  /**
   * Detect keywords in links
   * @returns {Promise<Array>} - Array of link keywords
   */
  async detectLinkKeywords() {
    try {
      const keywords = [];
      const selectors = this.config.selectors.links || [];
      
      for (const selector of selectors) {
        try {
          const elements = safeQuerySelectorAll(selector);
          
          for (const element of elements) {
            if (!isElementVisible(element)) continue;
            
            const linkKeywords = await this.analyzeElementKeywords(element, 'link');
            keywords.push(...linkKeywords);
          }
        } catch (selectorError) {
          // Skip invalid selectors
          logger.debug('Invalid selector', { selector, error: selectorError });
        }
      }
      
      return keywords;
    } catch (error) {
      logger.error('Error detecting link keywords', { error });
      return [];
    }
  }

  /**
   * Detect keywords in headings
   * @returns {Promise<Array>} - Array of heading keywords
   */
  async detectHeadingKeywords() {
    try {
      const keywords = [];
      const selectors = this.config.selectors.headings || [];
      
      for (const selector of selectors) {
        try {
          const elements = safeQuerySelectorAll(selector);
          
          for (const element of elements) {
            if (!isElementVisible(element)) continue;
            
            const headingKeywords = await this.analyzeElementKeywords(element, 'heading');
            keywords.push(...headingKeywords);
          }
        } catch (selectorError) {
          // Skip invalid selectors
          logger.debug('Invalid selector', { selector, error: selectorError });
        }
      }
      
      return keywords;
    } catch (error) {
      logger.error('Error detecting heading keywords', { error });
      return [];
    }
  }

  /**
   * Detect keywords in content
   * @returns {Promise<Array>} - Array of content keywords
   */
  async detectContentKeywords() {
    try {
      const keywords = [];
      const selectors = this.config.selectors.content || [];
      
      for (const selector of selectors) {
        try {
          const elements = safeQuerySelectorAll(selector);
          
          for (const element of elements) {
            if (!isElementVisible(element)) continue;
            
            const contentKeywords = await this.analyzeElementKeywords(element, 'content');
            keywords.push(...contentKeywords);
          }
        } catch (selectorError) {
          // Skip invalid selectors
          logger.debug('Invalid selector', { selector, error: selectorError });
        }
      }
      
      return keywords;
    } catch (error) {
      logger.error('Error detecting content keywords', { error });
      return [];
    }
  }

  /**
   * Analyze element for keywords
   * @param {HTMLElement} element - Element to analyze
   * @param {string} type - Element type
   * @returns {Promise<Array>} - Array of keywords found in element
   */
  async analyzeElementKeywords(element, type) {
    try {
      const keywords = [];
      const text = element.textContent?.trim() || '';
      const title = element.title || '';
      const ariaLabel = element.getAttribute('aria-label') || '';
      
      if (!text && !title && !ariaLabel) {
        return keywords;
      }
      
      // Extract keywords from text
      const extractedKeywords = this.extractKeywords(text + ' ' + title + ' ' + ariaLabel);
      
      for (const keyword of extractedKeywords) {
        const keywordObj = {
          id: this.generateKeywordId(keyword, element),
          keyword: keyword,
          element: element,
          type: type,
          text: text,
          title: title,
          ariaLabel: ariaLabel,
          score: this.calculateKeywordScore(keyword, element, type),
          category: this.categorizeKeyword(keyword),
          timestamp: Date.now(),
          preferences: {
            matches: this.checkKeywordPreferences(keyword),
            categoryMatch: this.checkCategoryPreferences(keyword),
            excluded: this.checkExcludedKeywords(keyword)
          }
        };
        
        keywords.push(keywordObj);
      }
      
      return keywords;
    } catch (error) {
      logger.error('Error analyzing element keywords', { error });
      return [];
    }
  }

  /**
   * Extract keywords from text
   * @param {string} text - Text to extract keywords from
   * @returns {Array} - Array of extracted keywords
   */
  extractKeywords(text) {
    try {
      if (!text) return [];
      
      // Clean and normalize text
      const cleanText = text.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      // Split into words
      const words = cleanText.split(' ');
      
      // Filter and extract keywords
      const keywords = [];
      const seen = new Set();
      
      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        
        // Skip short words
        if (word.length < this.config.minKeywordLength) continue;
        
        // Skip common stop words
        if (this.isStopWord(word)) continue;
        
        // Add single word
        if (!seen.has(word)) {
          keywords.push(word);
          seen.add(word);
        }
        
        // Add two-word phrases
        if (i < words.length - 1) {
          const phrase = `${word} ${words[i + 1]}`;
          if (!seen.has(phrase) && phrase.length >= this.config.minKeywordLength) {
            keywords.push(phrase);
            seen.add(phrase);
          }
        }
        
        // Add three-word phrases
        if (i < words.length - 2) {
          const phrase = `${word} ${words[i + 1]} ${words[i + 2]}`;
          if (!seen.has(phrase) && phrase.length >= this.config.minKeywordLength) {
            keywords.push(phrase);
            seen.add(phrase);
          }
        }
      }
      
      return keywords;
    } catch (error) {
      logger.error('Error extracting keywords', { error });
      return [];
    }
  }

  /**
   * Check if word is a stop word
   * @param {string} word - Word to check
   * @returns {boolean} - True if stop word
   */
  isStopWord(word) {
    const stopWords = [
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
      'before', 'after', 'above', 'below', 'between', 'among', 'is', 'are',
      'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do',
      'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
      'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he',
      'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'
    ];
    
    return stopWords.includes(word.toLowerCase());
  }

  /**
   * Calculate keyword score
   * @param {string} keyword - Keyword
   * @param {HTMLElement} element - Element containing keyword
   * @param {string} type - Element type
   * @returns {number} - Keyword score (0-1)
   */
  calculateKeywordScore(keyword, element, type) {
    try {
      let score = 0;
      
      // Base score by element type
      switch (type) {
        case 'heading':
          score += this.config.scoring.headingWeight;
          break;
        case 'link':
          score += this.config.scoring.linkTextWeight;
          break;
        case 'content':
          score += this.config.scoring.contentWeight;
          break;
      }
      
      // Boost score for title attributes
      if (element.title && element.title.toLowerCase().includes(keyword.toLowerCase())) {
        score += this.config.scoring.titleWeight;
      }
      
      // Boost score for frequent keywords
      const frequency = this.getKeywordFrequency(keyword);
      score += frequency * this.config.scoring.frequencyWeight;
      
      // Boost score for preference matches
      if (this.checkKeywordPreferences(keyword)) {
        score += 0.2;
      }
      
      // Boost score for category matches
      if (this.checkCategoryPreferences(keyword)) {
        score += 0.1;
      }
      
      // Reduce score for excluded keywords
      if (this.checkExcludedKeywords(keyword)) {
        score *= 0.1;
      }
      
      return Math.min(1, score);
    } catch (error) {
      logger.error('Error calculating keyword score', { error });
      return 0;
    }
  }

  /**
   * Get keyword frequency
   * @param {string} keyword - Keyword
   * @returns {number} - Keyword frequency (0-1)
   */
  getKeywordFrequency(keyword) {
    try {
      const allKeywords = Array.from(this.detectedKeywords.values());
      const keywordCount = allKeywords.filter(k => k.keyword === keyword).length;
      const totalKeywords = allKeywords.length;
      
      return totalKeywords > 0 ? keywordCount / totalKeywords : 0;
    } catch (error) {
      logger.error('Error getting keyword frequency', { error });
      return 0;
    }
  }

  /**
   * Categorize keyword
   * @param {string} keyword - Keyword
   * @returns {string} - Keyword category
   */
  categorizeKeyword(keyword) {
    try {
      const lowerKeyword = keyword.toLowerCase();
      
      for (const [category, keywords] of Object.entries(this.config.keywordCategories)) {
        for (const catKeyword of keywords) {
          if (lowerKeyword.includes(catKeyword.toLowerCase()) || 
              catKeyword.toLowerCase().includes(lowerKeyword)) {
            return category;
          }
        }
      }
      
      return 'other';
    } catch (error) {
      logger.error('Error categorizing keyword', { error });
      return 'other';
    }
  }

  /**
   * Check keyword preferences
   * @param {string} keyword - Keyword
   * @returns {boolean} - True if matches preferences
   */
  checkKeywordPreferences(keyword) {
    try {
      if (!this.config.preferences.enabled) return false;
      
      const preferences = this.config.preferences.keywords || [];
      const lowerKeyword = keyword.toLowerCase();
      
      return preferences.some(pref => 
        lowerKeyword.includes(pref.toLowerCase()) || 
        pref.toLowerCase().includes(lowerKeyword)
      );
    } catch (error) {
      logger.error('Error checking keyword preferences', { error });
      return false;
    }
  }

  /**
   * Check category preferences
   * @param {string} keyword - Keyword
   * @returns {boolean} - True if matches category preferences
   */
  checkCategoryPreferences(keyword) {
    try {
      if (!this.config.preferences.enabled) return false;
      
      const category = this.categorizeKeyword(keyword);
      const preferredCategories = this.config.preferences.categories || [];
      
      return preferredCategories.includes(category);
    } catch (error) {
      logger.error('Error checking category preferences', { error });
      return false;
    }
  }

  /**
   * Check excluded keywords
   * @param {string} keyword - Keyword
   * @returns {boolean} - True if keyword is excluded
   */
  checkExcludedKeywords(keyword) {
    try {
      const excludedKeywords = this.config.preferences.excludeKeywords || [];
      const lowerKeyword = keyword.toLowerCase();
      
      return excludedKeywords.some(excluded => 
        lowerKeyword.includes(excluded.toLowerCase()) || 
        excluded.toLowerCase().includes(lowerKeyword)
      );
    } catch (error) {
      logger.error('Error checking excluded keywords', { error });
      return false;
    }
  }

  /**
   * Filter valid keywords
   * @param {Array} keywords - Array of keywords
   * @returns {Array} - Array of valid keywords
   */
  filterValidKeywords(keywords) {
    try {
      return keywords.filter(keyword => {
        // Check minimum score
        if (keyword.score < this.config.preferences.minScore) {
          return false;
        }
        
        // Check if keyword is not already detected
        if (this.detectedKeywords.has(keyword.id)) {
          return false;
        }
        
        // Check if keyword is not excluded
        if (keyword.preferences.excluded) {
          return false;
        }
        
        return true;
      });
    } catch (error) {
      logger.error('Error filtering valid keywords', { error });
      return [];
    }
  }

  /**
   * Update detected keywords map
   * @param {Array} keywords - Array of new keywords
   */
  updateDetectedKeywords(keywords) {
    try {
      for (const keyword of keywords) {
        this.detectedKeywords.set(keyword.id, keyword);
      }
      
      // Limit number of detected keywords
      if (this.detectedKeywords.size > this.config.maxKeywordsPerPage) {
        const keywordsArray = Array.from(this.detectedKeywords.values());
        const sortedKeywords = keywordsArray.sort((a, b) => b.score - a.score);
        
        this.detectedKeywords.clear();
        for (let i = 0; i < this.config.maxKeywordsPerPage; i++) {
          this.detectedKeywords.set(sortedKeywords[i].id, sortedKeywords[i]);
        }
      }
    } catch (error) {
      logger.error('Error updating detected keywords', { error });
    }
  }

  /**
   * Start periodic detection
   */
  startPeriodicDetection() {
    if (this.detectionTimer) {
      clearInterval(this.detectionTimer);
    }
    
    this.detectionTimer = setInterval(async () => {
      if (this.isActive) {
        await this.detectKeywords();
      }
    }, this.config.detectionInterval);
  }

  /**
   * Stop periodic detection
   */
  stopPeriodicDetection() {
    if (this.detectionTimer) {
      clearInterval(this.detectionTimer);
      this.detectionTimer = null;
    }
  }

  /**
   * Get detected keywords
   * @returns {Array} - Array of detected keywords
   */
  getDetectedKeywords() {
    return Array.from(this.detectedKeywords.values());
  }

  /**
   * Get keywords by category
   * @param {string} category - Keyword category
   * @returns {Array} - Array of keywords in category
   */
  getKeywordsByCategory(category) {
    return this.getDetectedKeywords().filter(keyword => keyword.category === category);
  }

  /**
   * Get keywords by type
   * @param {string} type - Element type
   * @returns {Array} - Array of keywords in element type
   */
  getKeywordsByType(type) {
    return this.getDetectedKeywords().filter(keyword => keyword.type === type);
  }

  /**
   * Get top keywords
   * @param {number} limit - Maximum number of keywords
   * @returns {Array} - Array of top keywords
   */
  getTopKeywords(limit = 10) {
    const keywords = this.getDetectedKeywords();
    return keywords
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Get preferred keywords
   * @returns {Array} - Array of preferred keywords
   */
  getPreferredKeywords() {
    return this.getDetectedKeywords().filter(keyword => 
      keyword.preferences.matches || keyword.preferences.categoryMatch
    );
  }

  /**
   * Get random keyword for interaction
   * @param {string} category - Optional category filter
   * @returns {Object|null} - Random keyword or null
   */
  getRandomKeyword(category = null) {
    let keywords = this.getDetectedKeywords();
    
    if (category) {
      keywords = keywords.filter(keyword => keyword.category === category);
    }
    
    if (keywords.length === 0) {
      return null;
    }
    
    return choice(keywords);
  }

  /**
   * Update statistics
   * @param {Array} newKeywords - Array of new keywords
   */
  updateStats(newKeywords) {
    try {
      this.stats.totalKeywordsDetected += newKeywords.length;
      this.stats.lastDetectionTime = Date.now();
      
      for (const keyword of newKeywords) {
        this.stats.keywordsByCategory[keyword.category] = 
          (this.stats.keywordsByCategory[keyword.category] || 0) + 1;
        
        if (keyword.preferences.matches) {
          this.stats.preferences.keywordMatches++;
        }
        
        if (keyword.preferences.categoryMatch) {
          this.stats.preferences.categoryMatches[keyword.category] = 
            (this.stats.preferences.categoryMatches[keyword.category] || 0) + 1;
        }
      }
      
      this.stats.preferences.totalMatches = 
        this.stats.preferences.keywordMatches + 
        Object.values(this.stats.preferences.categoryMatches).reduce((a, b) => a + b, 0);
      
      // Calculate detection accuracy (simplified)
      this.stats.detectionAccuracy = Math.min(1, this.stats.totalKeywordsDetected / 100);
    } catch (error) {
      logger.error('Error updating stats', { error });
    }
  }

  /**
   * Clear detected keywords
   */
  clearDetectedKeywords() {
    this.detectedKeywords.clear();
  }

  /**
   * Generate unique keyword ID
   * @param {string} keyword - Keyword
   * @param {HTMLElement} element - Element containing keyword
   * @returns {string} - Unique keyword ID
   */
  generateKeywordId(keyword, element) {
    const rect = element.getBoundingClientRect();
    return `keyword_${keyword}_${element.tagName}_${Math.round(rect.left)}_${Math.round(rect.top)}_${Date.now()}`;
  }

  /**
   * Validate configuration
   * @returns {boolean} - True if valid
   */
  validateConfig() {
    try {
      if (this.config.detectionInterval < 1000) {
        logger.error('Detection interval too short');
        return false;
      }
      
      if (this.config.minKeywordLength < 2) {
        logger.error('Minimum keyword length too short');
        return false;
      }
      
      if (this.config.maxKeywordsPerPage < 1) {
        logger.error('Max keywords per page must be at least 1');
        return false;
      }
      
      return true;
    } catch (error) {
      logger.error('Error validating configuration', { error });
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
      detectedKeywordsCount: this.detectedKeywords.size,
      config: this.config
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      totalKeywordsDetected: 0,
      keywordsByCategory: {},
      lastDetectionTime: null,
      detectionAccuracy: 0,
      preferences: {
        totalMatches: 0,
        categoryMatches: {},
        keywordMatches: 0
      }
    };
  }

  /**
   * Update configuration
   * @param {Object} newConfig - New configuration
   */
  updateConfig(newConfig) {
    try {
      this.config = { ...this.config, ...newConfig };
      logger.info('Keyword detector configuration updated', { config: this.config });
    } catch (error) {
      logger.error('Error updating configuration', { error });
    }
  }

  /**
   * Cleanup resources
   * @returns {Promise<boolean>} - Success status
   */
  async cleanup() {
    try {
      await this.stop();
      this.clearDetectedKeywords();
      this.resetStats();
      logger.info('Keyword detector cleaned up');
      return true;
    } catch (error) {
      logger.error('Error cleaning up keyword detector', { error });
      return false;
    }
  }
}

/**
 * Create keyword detector instance
 * @param {Object} config - Configuration object
 * @returns {KeywordDetector} - Detector instance
 */
export function createKeywordDetector(config = {}) {
  return new KeywordDetector(config);
}

/**
 * Default keyword detector instance
 */
export const keywordDetector = createKeywordDetector();
