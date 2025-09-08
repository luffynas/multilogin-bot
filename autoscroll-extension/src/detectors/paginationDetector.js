/**
 * Pagination detector for identifying infinite scroll and load more functionality
 */

import { createLogger } from '../utils/logger.js';
import { randFloat, randInt, choice } from '../core/randomizer.js';
import { safeQuerySelector, safeQuerySelectorAll, isElementVisible } from '../utils/dom.js';

const logger = createLogger('pagination-detector');

/**
 * Pagination Detector
 * Detects pagination patterns and infinite scroll functionality
 */
export class PaginationDetector {
  constructor() {
    this.isActive = false;
    this.detectedPagination = new Map();
    this.config = {
      enabled: true,
      detectionInterval: 2000, // 2 seconds
      scrollThreshold: 0.8, // 80% of page height
      loadMoreThreshold: 0.9, // 90% of page height
      selectors: {
        loadMore: [
          'button[class*="load" i]',
          'button[class*="more" i]',
          'a[class*="load" i]',
          'a[class*="more" i]',
          'button:contains("Load More")',
          'button:contains("Show More")',
          'button:contains("View More")',
          'a:contains("Load More")',
          'a:contains("Show More")',
          'a:contains("View More")',
          '.load-more',
          '.show-more',
          '.view-more',
          '.pagination-load-more',
          '.infinite-scroll-trigger',
          '[data-action="load-more"]',
          '[data-load="more"]'
        ],
        pagination: [
          '.pagination',
          '.page-numbers',
          '.pager',
          '.page-nav',
          '.pagination-nav',
          'nav[aria-label*="page" i]',
          'nav[aria-label*="pagination" i]',
          '[role="navigation"]',
          '.pagination-container',
          '.pagination-wrapper'
        ],
        infiniteScroll: [
          '.infinite-scroll',
          '.infinite-loading',
          '.lazy-load',
          '.scroll-load',
          '[data-infinite="true"]',
          '[data-lazy="true"]',
          '[data-scroll="load"]'
        ],
        nextPage: [
          'a[rel="next"]',
          'a[aria-label*="next" i]',
          'a[title*="next" i]',
          'a:contains("Next")',
          'a:contains(">")',
          'a:contains("→")',
          '.next',
          '.next-page',
          '.pagination-next',
          '.nav-next',
          '.page-next',
          '[data-nav="next"]',
          '[data-direction="next"]'
        ]
      },
      textPatterns: {
        loadMore: [
          /load more/i,
          /show more/i,
          /view more/i,
          /see more/i,
          /get more/i,
          /fetch more/i,
          /load additional/i,
          /show additional/i
        ],
        infiniteScroll: [
          /infinite scroll/i,
          /lazy load/i,
          /scroll to load/i,
          /auto load/i,
          /continuous scroll/i
        ],
        pagination: [
          /page \d+/i,
          /\d+ of \d+/i,
          /next page/i,
          /previous page/i,
          /go to page/i
        ]
      },
      attributes: {
        loadMore: ['data-action="load-more"', 'data-load="more"', 'data-trigger="load"'],
        infiniteScroll: ['data-infinite="true"', 'data-lazy="true"', 'data-scroll="load"'],
        pagination: ['role="navigation"', 'aria-label*="page"', 'aria-label*="pagination"']
      }
    };
    
    this.stats = {
      totalPaginationDetected: 0,
      paginationByType: {},
      lastDetectionTime: null,
      detectionAccuracy: 0,
      scrollEvents: 0,
      loadMoreClicks: 0
    };
    
    this.detectionTimer = null;
    this.scrollListener = null;
    this.eventListeners = new Map();
    this.lastScrollPosition = 0;
    this.pageHeight = 0;
  }

  /**
   * Initialize pagination detector
   * @param {Object} config - Configuration object
   * @returns {Promise<boolean>} - Success status
   */
  async initialize(config = {}) {
    try {
      this.config = { ...this.config, ...config };
      
      // Validate configuration
      if (!this.validateConfig()) {
        logger.error('Invalid pagination detector configuration');
        return false;
      }
      
      // Set up scroll listener
      this.setupScrollListener();
      
      logger.info('Pagination detector initialized', { config: this.config });
      return true;
    } catch (error) {
      logger.error('Error initializing pagination detector', { error });
      return false;
    }
  }

  /**
   * Start pagination detection
   * @returns {Promise<boolean>} - Success status
   */
  async start() {
    try {
      if (this.isActive) {
        logger.warn('Pagination detector already active');
        return false;
      }

      this.isActive = true;
      
      // Initial detection
      await this.detectPagination();
      
      // Start periodic detection
      this.startPeriodicDetection();
      
      logger.info('Pagination detector started');
      return true;
    } catch (error) {
      logger.error('Error starting pagination detector', { error });
      return false;
    }
  }

  /**
   * Stop pagination detection
   * @returns {Promise<boolean>} - Success status
   */
  async stop() {
    try {
      if (!this.isActive) {
        logger.warn('Pagination detector not active');
        return false;
      }

      this.isActive = false;
      this.stopPeriodicDetection();
      this.removeScrollListener();
      this.clearDetectedPagination();
      
      logger.info('Pagination detector stopped');
      return true;
    } catch (error) {
      logger.error('Error stopping pagination detector', { error });
      return false;
    }
  }

  /**
   * Detect pagination on the page
   * @returns {Promise<Array>} - Array of detected pagination elements
   */
  async detectPagination() {
    try {
      const paginationElements = [];
      
      // Detect different types of pagination
      const loadMoreElements = await this.detectLoadMoreElements();
      const paginationElements_detected = await this.detectPaginationElements();
      const infiniteScrollElements = await this.detectInfiniteScrollElements();
      const nextPageElements = await this.detectNextPageElements();
      
      paginationElements.push(
        ...loadMoreElements,
        ...paginationElements_detected,
        ...infiniteScrollElements,
        ...nextPageElements
      );
      
      // Filter and validate elements
      const validElements = this.filterValidPagination(paginationElements);
      
      // Update detected pagination map
      this.updateDetectedPagination(validElements);
      
      // Update statistics
      this.updateStats(validElements);
      
      logger.debug('Pagination detected', { 
        total: validElements.length,
        loadMore: loadMoreElements.length,
        pagination: paginationElements_detected.length,
        infiniteScroll: infiniteScrollElements.length,
        nextPage: nextPageElements.length
      });
      
      return validElements;
    } catch (error) {
      logger.error('Error detecting pagination', { error });
      return [];
    }
  }

  /**
   * Detect load more elements
   * @returns {Promise<Array>} - Array of load more elements
   */
  async detectLoadMoreElements() {
    try {
      const elements = [];
      const selectors = this.config.selectors.loadMore || [];
      
      for (const selector of selectors) {
        try {
          const foundElements = safeQuerySelectorAll(selector);
          
          for (const element of foundElements) {
            const paginationElement = await this.analyzePaginationElement(element, 'loadMore');
            if (paginationElement) {
              elements.push(paginationElement);
            }
          }
        } catch (selectorError) {
          // Skip invalid selectors
          logger.debug('Invalid selector', { selector, error: selectorError });
        }
      }
      
      // Also detect by text patterns
      const textElements = await this.detectElementsByTextPattern('loadMore');
      elements.push(...textElements);
      
      // Also detect by attributes
      const attrElements = await this.detectElementsByAttributes('loadMore');
      elements.push(...attrElements);
      
      return elements;
    } catch (error) {
      logger.error('Error detecting load more elements', { error });
      return [];
    }
  }

  /**
   * Detect pagination elements
   * @returns {Promise<Array>} - Array of pagination elements
   */
  async detectPaginationElements() {
    try {
      const elements = [];
      const selectors = this.config.selectors.pagination || [];
      
      for (const selector of selectors) {
        try {
          const foundElements = safeQuerySelectorAll(selector);
          
          for (const element of foundElements) {
            const paginationElement = await this.analyzePaginationElement(element, 'pagination');
            if (paginationElement) {
              elements.push(paginationElement);
            }
          }
        } catch (selectorError) {
          // Skip invalid selectors
          logger.debug('Invalid selector', { selector, error: selectorError });
        }
      }
      
      // Also detect by text patterns
      const textElements = await this.detectElementsByTextPattern('pagination');
      elements.push(...textElements);
      
      // Also detect by attributes
      const attrElements = await this.detectElementsByAttributes('pagination');
      elements.push(...attrElements);
      
      return elements;
    } catch (error) {
      logger.error('Error detecting pagination elements', { error });
      return [];
    }
  }

  /**
   * Detect infinite scroll elements
   * @returns {Promise<Array>} - Array of infinite scroll elements
   */
  async detectInfiniteScrollElements() {
    try {
      const elements = [];
      const selectors = this.config.selectors.infiniteScroll || [];
      
      for (const selector of selectors) {
        try {
          const foundElements = safeQuerySelectorAll(selector);
          
          for (const element of foundElements) {
            const paginationElement = await this.analyzePaginationElement(element, 'infiniteScroll');
            if (paginationElement) {
              elements.push(paginationElement);
            }
          }
        } catch (selectorError) {
          // Skip invalid selectors
          logger.debug('Invalid selector', { selector, error: selectorError });
        }
      }
      
      // Also detect by text patterns
      const textElements = await this.detectElementsByTextPattern('infiniteScroll');
      elements.push(...textElements);
      
      // Also detect by attributes
      const attrElements = await this.detectElementsByAttributes('infiniteScroll');
      elements.push(...attrElements);
      
      return elements;
    } catch (error) {
      logger.error('Error detecting infinite scroll elements', { error });
      return [];
    }
  }

  /**
   * Detect next page elements
   * @returns {Promise<Array>} - Array of next page elements
   */
  async detectNextPageElements() {
    try {
      const elements = [];
      const selectors = this.config.selectors.nextPage || [];
      
      for (const selector of selectors) {
        try {
          const foundElements = safeQuerySelectorAll(selector);
          
          for (const element of foundElements) {
            const paginationElement = await this.analyzePaginationElement(element, 'nextPage');
            if (paginationElement) {
              elements.push(paginationElement);
            }
          }
        } catch (selectorError) {
          // Skip invalid selectors
          logger.debug('Invalid selector', { selector, error: selectorError });
        }
      }
      
      return elements;
    } catch (error) {
      logger.error('Error detecting next page elements', { error });
      return [];
    }
  }

  /**
   * Detect elements by text patterns
   * @param {string} type - Element type
   * @returns {Promise<Array>} - Array of detected elements
   */
  async detectElementsByTextPattern(type) {
    try {
      const elements = [];
      const patterns = this.config.textPatterns[type] || [];
      
      if (patterns.length === 0) {
        return elements;
      }
      
      // Get all buttons and links
      const allElements = [...safeQuerySelectorAll('button'), ...safeQuerySelectorAll('a')];
      
      for (const element of allElements) {
        const text = element.textContent?.trim() || '';
        const title = element.title || '';
        const ariaLabel = element.getAttribute('aria-label') || '';
        
        const combinedText = `${text} ${title} ${ariaLabel}`.toLowerCase();
        
        for (const pattern of patterns) {
          if (pattern.test(combinedText)) {
            const analyzedElement = await this.analyzePaginationElement(element, type);
            if (analyzedElement) {
              elements.push(analyzedElement);
              break; // Don't add the same element multiple times
            }
          }
        }
      }
      
      return elements;
    } catch (error) {
      logger.error('Error detecting elements by text pattern', { error, type });
      return [];
    }
  }

  /**
   * Detect elements by attributes
   * @param {string} type - Element type
   * @returns {Promise<Array>} - Array of detected elements
   */
  async detectElementsByAttributes(type) {
    try {
      const elements = [];
      const attributes = this.config.attributes[type] || [];
      
      if (attributes.length === 0) {
        return elements;
      }
      
      // Get all elements
      const allElements = safeQuerySelectorAll('*');
      
      for (const element of allElements) {
        for (const attr of attributes) {
          if (element.hasAttribute(attr.split('=')[0])) {
            const attrValue = element.getAttribute(attr.split('=')[0]);
            const expectedValue = attr.split('=')[1]?.replace(/"/g, '');
            
            if (attrValue === expectedValue) {
              const analyzedElement = await this.analyzePaginationElement(element, type);
              if (analyzedElement) {
                elements.push(analyzedElement);
                break; // Don't add the same element multiple times
              }
            }
          }
        }
      }
      
      return elements;
    } catch (error) {
      logger.error('Error detecting elements by attributes', { error, type });
      return [];
    }
  }

  /**
   * Analyze pagination element
   * @param {HTMLElement} element - Pagination element
   * @param {string} type - Element type
   * @returns {Promise<Object|null>} - Pagination element object or null
   */
  async analyzePaginationElement(element, type) {
    try {
      if (!element || !isElementVisible(element)) {
        return null;
      }
      
      const rect = element.getBoundingClientRect();
      const size = { width: rect.width, height: rect.height };
      
      // Extract pagination information
      const paginationElement = {
        id: this.generatePaginationId(element),
        element: element,
        type: type,
        text: element.textContent?.trim() || '',
        title: element.title || '',
        ariaLabel: element.getAttribute('aria-label') || '',
        size: size,
        position: {
          x: rect.left,
          y: rect.top,
          viewport: this.isInViewport(rect)
        },
        attributes: this.extractPaginationAttributes(element),
        confidence: this.calculatePaginationConfidence(element, type),
        timestamp: Date.now(),
        interactions: {
          hovered: false,
          clicked: false,
          dwellTime: 0
        }
      };
      
      // Only return elements with reasonable confidence
      if (paginationElement.confidence < 0.3) {
        return null;
      }
      
      return paginationElement;
    } catch (error) {
      logger.error('Error analyzing pagination element', { error });
      return null;
    }
  }

  /**
   * Extract pagination attributes
   * @param {HTMLElement} element - Pagination element
   * @returns {Object} - Pagination attributes
   */
  extractPaginationAttributes(element) {
    try {
      const attributes = {};
      
      // Common pagination attributes
      const paginationAttributes = [
        'data-action',
        'data-load',
        'data-trigger',
        'data-infinite',
        'data-lazy',
        'data-scroll',
        'role',
        'aria-label',
        'title',
        'class',
        'id'
      ];
      
      for (const attr of paginationAttributes) {
        if (element.hasAttribute(attr)) {
          attributes[attr] = element.getAttribute(attr);
        }
      }
      
      return attributes;
    } catch (error) {
      logger.error('Error extracting pagination attributes', { error });
      return {};
    }
  }

  /**
   * Calculate pagination confidence
   * @param {HTMLElement} element - Pagination element
   * @param {string} type - Element type
   * @returns {number} - Confidence score (0-1)
   */
  calculatePaginationConfidence(element, type) {
    try {
      let confidence = 0;
      
      // Check text content
      const text = element.textContent?.trim().toLowerCase() || '';
      const patterns = this.config.textPatterns[type] || [];
      
      for (const pattern of patterns) {
        if (pattern.test(text)) {
          confidence += 0.4;
          break;
        }
      }
      
      // Check attributes
      const attributes = this.config.attributes[type] || [];
      for (const attr of attributes) {
        const [attrName, attrValue] = attr.split('=');
        const actualValue = element.getAttribute(attrName);
        
        if (actualValue === attrValue?.replace(/"/g, '')) {
          confidence += 0.3;
          break;
        }
      }
      
      // Check class names
      const className = element.className?.toLowerCase() || '';
      if (className.includes(type.toLowerCase()) || 
          className.includes('pagination') || 
          className.includes('load') || 
          className.includes('more')) {
        confidence += 0.2;
      }
      
      // Check if element is in pagination context
      const parent = element.closest('nav, .navigation, .pagination, .pager, .pagination-container');
      if (parent) {
        confidence += 0.1;
      }
      
      return Math.min(1, confidence);
    } catch (error) {
      logger.error('Error calculating pagination confidence', { error });
      return 0;
    }
  }

  /**
   * Filter valid pagination elements
   * @param {Array} elements - Array of pagination elements
   * @returns {Array} - Array of valid pagination elements
   */
  filterValidPagination(elements) {
    try {
      return elements.filter(element => {
        // Check if element is still visible
        if (!isElementVisible(element.element)) {
          return false;
        }
        
        // Check if element is not already detected
        if (this.detectedPagination.has(element.id)) {
          return false;
        }
        
        // Check confidence threshold
        if (element.confidence < 0.3) {
          return false;
        }
        
        return true;
      });
    } catch (error) {
      logger.error('Error filtering valid pagination', { error });
      return [];
    }
  }

  /**
   * Update detected pagination map
   * @param {Array} elements - Array of new pagination elements
   */
  updateDetectedPagination(elements) {
    try {
      for (const element of elements) {
        this.detectedPagination.set(element.id, element);
      }
    } catch (error) {
      logger.error('Error updating detected pagination', { error });
    }
  }

  /**
   * Setup scroll listener
   */
  setupScrollListener() {
    try {
      this.scrollListener = () => {
        if (this.isActive) {
          this.handleScroll();
        }
      };
      
      window.addEventListener('scroll', this.scrollListener, { passive: true });
      logger.debug('Scroll listener set up');
    } catch (error) {
      logger.error('Error setting up scroll listener', { error });
    }
  }

  /**
   * Remove scroll listener
   */
  removeScrollListener() {
    try {
      if (this.scrollListener) {
        window.removeEventListener('scroll', this.scrollListener);
        this.scrollListener = null;
        logger.debug('Scroll listener removed');
      }
    } catch (error) {
      logger.error('Error removing scroll listener', { error });
    }
  }

  /**
   * Handle scroll events
   */
  handleScroll() {
    try {
      const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
      const documentHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;
      
      this.pageHeight = documentHeight;
      this.stats.scrollEvents++;
      
      // Check if we're near the bottom of the page
      const scrollPercentage = (currentScrollPosition + windowHeight) / documentHeight;
      
      if (scrollPercentage >= this.config.scrollThreshold) {
        this.emit('scrollThresholdReached', {
          scrollPercentage,
          threshold: this.config.scrollThreshold
        });
      }
      
      if (scrollPercentage >= this.config.loadMoreThreshold) {
        this.emit('loadMoreThresholdReached', {
          scrollPercentage,
          threshold: this.config.loadMoreThreshold
        });
      }
      
      this.lastScrollPosition = currentScrollPosition;
    } catch (error) {
      logger.error('Error handling scroll', { error });
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
        await this.detectPagination();
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
   * Get detected pagination elements
   * @returns {Array} - Array of detected pagination elements
   */
  getDetectedPagination() {
    return Array.from(this.detectedPagination.values());
  }

  /**
   * Get pagination elements by type
   * @param {string} type - Element type
   * @returns {Array} - Array of pagination elements of specified type
   */
  getPaginationByType(type) {
    return this.getDetectedPagination().filter(element => element.type === type);
  }

  /**
   * Get pagination elements in viewport
   * @returns {Array} - Array of pagination elements in viewport
   */
  getPaginationInViewport() {
    return this.getDetectedPagination().filter(element => element.position.viewport);
  }

  /**
   * Get best pagination element of type
   * @param {string} type - Element type
   * @returns {Object|null} - Best pagination element of type or null
   */
  getBestPaginationOfType(type) {
    const elements = this.getPaginationByType(type);
    if (elements.length === 0) {
      return null;
    }
    
    return elements.reduce((best, current) => 
      current.confidence > best.confidence ? current : best
    );
  }

  /**
   * Get random pagination element for interaction
   * @param {string} type - Optional element type filter
   * @returns {Object|null} - Random pagination element or null
   */
  getRandomPagination(type = null) {
    let elements = this.getPaginationInViewport();
    
    if (type) {
      elements = elements.filter(element => element.type === type);
    }
    
    if (elements.length === 0) {
      return null;
    }
    
    return choice(elements);
  }

  /**
   * Update statistics
   * @param {Array} newElements - Array of new pagination elements
   */
  updateStats(newElements) {
    try {
      this.stats.totalPaginationDetected += newElements.length;
      this.stats.lastDetectionTime = Date.now();
      
      for (const element of newElements) {
        this.stats.paginationByType[element.type] = (this.stats.paginationByType[element.type] || 0) + 1;
      }
      
      // Calculate detection accuracy (simplified)
      this.stats.detectionAccuracy = Math.min(1, this.stats.totalPaginationDetected / 10);
    } catch (error) {
      logger.error('Error updating stats', { error });
    }
  }

  /**
   * Clear detected pagination
   */
  clearDetectedPagination() {
    this.detectedPagination.clear();
  }

  /**
   * Generate unique pagination ID
   * @param {HTMLElement} element - Pagination element
   * @returns {string} - Unique pagination ID
   */
  generatePaginationId(element) {
    const rect = element.getBoundingClientRect();
    return `pagination_${element.tagName}_${Math.round(rect.left)}_${Math.round(rect.top)}_${Date.now()}`;
  }

  /**
   * Check if element is in viewport
   * @param {DOMRect} rect - Element rectangle
   * @returns {boolean} - True if in viewport
   */
  isInViewport(rect) {
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
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
      
      if (this.config.scrollThreshold < 0 || this.config.scrollThreshold > 1) {
        logger.error('Scroll threshold must be between 0 and 1');
        return false;
      }
      
      if (this.config.loadMoreThreshold < 0 || this.config.loadMoreThreshold > 1) {
        logger.error('Load more threshold must be between 0 and 1');
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
      detectedPaginationCount: this.detectedPagination.size,
      config: this.config
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      totalPaginationDetected: 0,
      paginationByType: {},
      lastDetectionTime: null,
      detectionAccuracy: 0,
      scrollEvents: 0,
      loadMoreClicks: 0
    };
  }

  /**
   * Update configuration
   * @param {Object} newConfig - New configuration
   */
  updateConfig(newConfig) {
    try {
      this.config = { ...this.config, ...newConfig };
      logger.info('Pagination detector configuration updated', { config: this.config });
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
      this.clearDetectedPagination();
      this.resetStats();
      logger.info('Pagination detector cleaned up');
      return true;
    } catch (error) {
      logger.error('Error cleaning up pagination detector', { error });
      return false;
    }
  }
}

/**
 * Create pagination detector instance
 * @param {Object} config - Configuration object
 * @returns {PaginationDetector} - Detector instance
 */
export function createPaginationDetector(config = {}) {
  return new PaginationDetector(config);
}

/**
 * Default pagination detector instance
 */
export const paginationDetector = createPaginationDetector();
