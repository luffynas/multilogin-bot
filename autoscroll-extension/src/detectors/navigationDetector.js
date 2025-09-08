/**
 * Navigation detector for identifying next/prev/related/recent links
 */

import { createLogger } from '../utils/logger.js';
import { randFloat, randInt, choice } from '../core/randomizer.js';
import { safeQuerySelector, safeQuerySelectorAll, isElementVisible } from '../utils/dom.js';

const logger = createLogger('navigation-detector');

/**
 * Navigation Detector
 * Detects navigation links and elements on the page
 */
export class NavigationDetector {
  constructor() {
    this.isActive = false;
    this.detectedLinks = new Map();
    this.config = {
      enabled: true,
      detectionInterval: 3000, // 3 seconds
      maxLinksPerType: 5,
      minLinkSize: { width: 50, height: 20 },
      selectors: {
        next: [
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
        ],
        previous: [
          'a[rel="prev"]',
          'a[rel="previous"]',
          'a[aria-label*="prev" i]',
          'a[aria-label*="previous" i]',
          'a[title*="prev" i]',
          'a[title*="previous" i]',
          'a:contains("Previous")',
          'a:contains("Prev")',
          'a:contains("<")',
          'a:contains("←")',
          '.prev',
          '.previous',
          '.prev-page',
          '.pagination-prev',
          '.nav-prev',
          '.page-prev',
          '[data-nav="prev"]',
          '[data-nav="previous"]',
          '[data-direction="prev"]',
          '[data-direction="previous"]'
        ],
        related: [
          'a[rel="related"]',
          'a[aria-label*="related" i]',
          'a[title*="related" i]',
          'a:contains("Related")',
          'a:contains("Similar")',
          'a:contains("More")',
          '.related',
          '.related-posts',
          '.similar-posts',
          '.more-posts',
          '.related-articles',
          '.similar-articles',
          '[data-type="related"]',
          '[data-category="related"]'
        ],
        recent: [
          'a[rel="recent"]',
          'a[aria-label*="recent" i]',
          'a[title*="recent" i]',
          'a:contains("Recent")',
          'a:contains("Latest")',
          'a:contains("New")',
          '.recent',
          '.recent-posts',
          '.latest-posts',
          '.new-posts',
          '.recent-articles',
          '.latest-articles',
          '[data-type="recent"]',
          '[data-category="recent"]'
        ],
        pagination: [
          '.pagination',
          '.page-numbers',
          '.pager',
          '.page-nav',
          '.pagination-nav',
          '[role="navigation"]',
          'nav[aria-label*="page" i]',
          'nav[aria-label*="pagination" i]'
        ]
      },
      textPatterns: {
        next: [
          /next/i,
          /continue/i,
          /more/i,
          /→/,
          />/,
          /forward/i,
          /proceed/i
        ],
        previous: [
          /prev/i,
          /previous/i,
          /back/i,
          /←/,
          /</,
          /return/i,
          /go back/i
        ],
        related: [
          /related/i,
          /similar/i,
          /more like this/i,
          /you might also like/i,
          /recommended/i,
          /suggested/i
        ],
        recent: [
          /recent/i,
          /latest/i,
          /new/i,
          /fresh/i,
          /updated/i,
          /current/i
        ]
      },
      attributes: {
        next: ['rel="next"', 'data-nav="next"', 'data-direction="next"'],
        previous: ['rel="prev"', 'rel="previous"', 'data-nav="prev"', 'data-direction="prev"'],
        related: ['rel="related"', 'data-type="related"', 'data-category="related"'],
        recent: ['rel="recent"', 'data-type="recent"', 'data-category="recent"']
      }
    };
    
    this.stats = {
      totalLinksDetected: 0,
      linksByType: {},
      lastDetectionTime: null,
      detectionAccuracy: 0
    };
    
    this.detectionTimer = null;
    this.eventListeners = new Map();
  }

  /**
   * Initialize navigation detector
   * @param {Object} config - Configuration object
   * @returns {Promise<boolean>} - Success status
   */
  async initialize(config = {}) {
    try {
      this.config = { ...this.config, ...config };
      
      // Validate configuration
      if (!this.validateConfig()) {
        logger.error('Invalid navigation detector configuration');
        return false;
      }
      
      logger.info('Navigation detector initialized', { config: this.config });
      return true;
    } catch (error) {
      logger.error('Error initializing navigation detector', { error });
      return false;
    }
  }

  /**
   * Start navigation detection
   * @returns {Promise<boolean>} - Success status
   */
  async start() {
    try {
      if (this.isActive) {
        logger.warn('Navigation detector already active');
        return false;
      }

      this.isActive = true;
      
      // Initial detection
      await this.detectNavigationLinks();
      
      // Start periodic detection
      this.startPeriodicDetection();
      
      logger.info('Navigation detector started');
      return true;
    } catch (error) {
      logger.error('Error starting navigation detector', { error });
      return false;
    }
  }

  /**
   * Stop navigation detection
   * @returns {Promise<boolean>} - Success status
   */
  async stop() {
    try {
      if (!this.isActive) {
        logger.warn('Navigation detector not active');
        return false;
      }

      this.isActive = false;
      this.stopPeriodicDetection();
      this.clearDetectedLinks();
      
      logger.info('Navigation detector stopped');
      return true;
    } catch (error) {
      logger.error('Error stopping navigation detector', { error });
      return false;
    }
  }

  /**
   * Detect navigation links on the page
   * @returns {Promise<Array>} - Array of detected navigation links
   */
  async detectNavigationLinks() {
    try {
      const links = [];
      
      // Detect different types of navigation links
      const nextLinks = await this.detectLinksByType('next');
      const prevLinks = await this.detectLinksByType('previous');
      const relatedLinks = await this.detectLinksByType('related');
      const recentLinks = await this.detectLinksByType('recent');
      
      links.push(...nextLinks, ...prevLinks, ...relatedLinks, ...recentLinks);
      
      // Filter and validate links
      const validLinks = this.filterValidLinks(links);
      
      // Update detected links map
      this.updateDetectedLinks(validLinks);
      
      // Update statistics
      this.updateStats(validLinks);
      
      logger.debug('Navigation links detected', { 
        total: validLinks.length,
        next: nextLinks.length,
        previous: prevLinks.length,
        related: relatedLinks.length,
        recent: recentLinks.length
      });
      
      return validLinks;
    } catch (error) {
      logger.error('Error detecting navigation links', { error });
      return [];
    }
  }

  /**
   * Detect links by type
   * @param {string} type - Link type (next, previous, related, recent)
   * @returns {Promise<Array>} - Array of detected links
   */
  async detectLinksByType(type) {
    try {
      const links = [];
      const selectors = this.config.selectors[type] || [];
      
      for (const selector of selectors) {
        try {
          const elements = safeQuerySelectorAll(selector);
          
          for (const element of elements) {
            const link = await this.analyzeLinkElement(element, type);
            if (link) {
              links.push(link);
            }
          }
        } catch (selectorError) {
          // Skip invalid selectors
          logger.debug('Invalid selector', { selector, error: selectorError });
        }
      }
      
      // Also detect by text patterns
      const textLinks = await this.detectLinksByTextPattern(type);
      links.push(...textLinks);
      
      // Also detect by attributes
      const attrLinks = await this.detectLinksByAttributes(type);
      links.push(...attrLinks);
      
      return links;
    } catch (error) {
      logger.error('Error detecting links by type', { error, type });
      return [];
    }
  }

  /**
   * Detect links by text patterns
   * @param {string} type - Link type
   * @returns {Promise<Array>} - Array of detected links
   */
  async detectLinksByTextPattern(type) {
    try {
      const links = [];
      const patterns = this.config.textPatterns[type] || [];
      
      if (patterns.length === 0) {
        return links;
      }
      
      // Get all links on the page
      const allLinks = safeQuerySelectorAll('a');
      
      for (const link of allLinks) {
        const text = link.textContent?.trim() || '';
        const title = link.title || '';
        const ariaLabel = link.getAttribute('aria-label') || '';
        
        const combinedText = `${text} ${title} ${ariaLabel}`.toLowerCase();
        
        for (const pattern of patterns) {
          if (pattern.test(combinedText)) {
            const analyzedLink = await this.analyzeLinkElement(link, type);
            if (analyzedLink) {
              links.push(analyzedLink);
              break; // Don't add the same link multiple times
            }
          }
        }
      }
      
      return links;
    } catch (error) {
      logger.error('Error detecting links by text pattern', { error, type });
      return [];
    }
  }

  /**
   * Detect links by attributes
   * @param {string} type - Link type
   * @returns {Promise<Array>} - Array of detected links
   */
  async detectLinksByAttributes(type) {
    try {
      const links = [];
      const attributes = this.config.attributes[type] || [];
      
      if (attributes.length === 0) {
        return links;
      }
      
      // Get all links on the page
      const allLinks = safeQuerySelectorAll('a');
      
      for (const link of allLinks) {
        for (const attr of attributes) {
          if (link.hasAttribute(attr.split('=')[0])) {
            const attrValue = link.getAttribute(attr.split('=')[0]);
            const expectedValue = attr.split('=')[1]?.replace(/"/g, '');
            
            if (attrValue === expectedValue) {
              const analyzedLink = await this.analyzeLinkElement(link, type);
              if (analyzedLink) {
                links.push(analyzedLink);
                break; // Don't add the same link multiple times
              }
            }
          }
        }
      }
      
      return links;
    } catch (error) {
      logger.error('Error detecting links by attributes', { error, type });
      return [];
    }
  }

  /**
   * Analyze link element
   * @param {HTMLElement} element - Link element
   * @param {string} type - Link type
   * @returns {Promise<Object|null>} - Link object or null
   */
  async analyzeLinkElement(element, type) {
    try {
      if (!element || !isElementVisible(element)) {
        return null;
      }
      
      const rect = element.getBoundingClientRect();
      const size = { width: rect.width, height: rect.height };
      
      // Check minimum size
      if (size.width < this.config.minLinkSize.width || 
          size.height < this.config.minLinkSize.height) {
        return null;
      }
      
      // Extract link information
      const link = {
        id: this.generateLinkId(element),
        element: element,
        type: type,
        href: element.href || '',
        text: element.textContent?.trim() || '',
        title: element.title || '',
        ariaLabel: element.getAttribute('aria-label') || '',
        size: size,
        position: {
          x: rect.left,
          y: rect.top,
          viewport: this.isInViewport(rect)
        },
        attributes: this.extractLinkAttributes(element),
        confidence: this.calculateLinkConfidence(element, type),
        timestamp: Date.now(),
        interactions: {
          hovered: false,
          clicked: false,
          dwellTime: 0
        }
      };
      
      // Only return links with reasonable confidence
      if (link.confidence < 0.3) {
        return null;
      }
      
      return link;
    } catch (error) {
      logger.error('Error analyzing link element', { error });
      return null;
    }
  }

  /**
   * Extract link attributes
   * @param {HTMLElement} element - Link element
   * @returns {Object} - Link attributes
   */
  extractLinkAttributes(element) {
    try {
      const attributes = {};
      
      // Common navigation attributes
      const navAttributes = [
        'rel',
        'data-nav',
        'data-direction',
        'data-type',
        'data-category',
        'aria-label',
        'title',
        'class',
        'id'
      ];
      
      for (const attr of navAttributes) {
        if (element.hasAttribute(attr)) {
          attributes[attr] = element.getAttribute(attr);
        }
      }
      
      return attributes;
    } catch (error) {
      logger.error('Error extracting link attributes', { error });
      return {};
    }
  }

  /**
   * Calculate link confidence
   * @param {HTMLElement} element - Link element
   * @param {string} type - Link type
   * @returns {number} - Confidence score (0-1)
   */
  calculateLinkConfidence(element, type) {
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
      if (className.includes(type)) {
        confidence += 0.2;
      }
      
      // Check if link is in navigation context
      const parent = element.closest('nav, .navigation, .pagination, .pager');
      if (parent) {
        confidence += 0.1;
      }
      
      return Math.min(1, confidence);
    } catch (error) {
      logger.error('Error calculating link confidence', { error });
      return 0;
    }
  }

  /**
   * Filter valid links
   * @param {Array} links - Array of links
   * @returns {Array} - Array of valid links
   */
  filterValidLinks(links) {
    try {
      return links.filter(link => {
        // Check if link is still visible
        if (!isElementVisible(link.element)) {
          return false;
        }
        
        // Check if link is not already detected
        if (this.detectedLinks.has(link.id)) {
          return false;
        }
        
        // Check minimum size
        if (link.size.width < this.config.minLinkSize.width || 
            link.size.height < this.config.minLinkSize.height) {
          return false;
        }
        
        // Check if link has valid href
        if (!link.href || link.href === '#' || link.href === 'javascript:void(0)') {
          return false;
        }
        
        // Check confidence threshold
        if (link.confidence < 0.3) {
          return false;
        }
        
        return true;
      });
    } catch (error) {
      logger.error('Error filtering valid links', { error });
      return [];
    }
  }

  /**
   * Update detected links map
   * @param {Array} links - Array of new links
   */
  updateDetectedLinks(links) {
    try {
      for (const link of links) {
        this.detectedLinks.set(link.id, link);
      }
      
      // Limit number of detected links per type
      const linksByType = {};
      for (const link of this.detectedLinks.values()) {
        if (!linksByType[link.type]) {
          linksByType[link.type] = [];
        }
        linksByType[link.type].push(link);
      }
      
      // Keep only the best links per type
      this.detectedLinks.clear();
      for (const [type, typeLinks] of Object.entries(linksByType)) {
        const sortedLinks = typeLinks.sort((a, b) => b.confidence - a.confidence);
        const maxLinks = this.config.maxLinksPerType;
        
        for (let i = 0; i < Math.min(maxLinks, sortedLinks.length); i++) {
          this.detectedLinks.set(sortedLinks[i].id, sortedLinks[i]);
        }
      }
    } catch (error) {
      logger.error('Error updating detected links', { error });
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
        await this.detectNavigationLinks();
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
   * Get detected links
   * @returns {Array} - Array of detected links
   */
  getDetectedLinks() {
    return Array.from(this.detectedLinks.values());
  }

  /**
   * Get links by type
   * @param {string} type - Link type
   * @returns {Array} - Array of links of specified type
   */
  getLinksByType(type) {
    return this.getDetectedLinks().filter(link => link.type === type);
  }

  /**
   * Get links in viewport
   * @returns {Array} - Array of links in viewport
   */
  getLinksInViewport() {
    return this.getDetectedLinks().filter(link => link.position.viewport);
  }

  /**
   * Get best link of type
   * @param {string} type - Link type
   * @returns {Object|null} - Best link of type or null
   */
  getBestLinkOfType(type) {
    const links = this.getLinksByType(type);
    if (links.length === 0) {
      return null;
    }
    
    return links.reduce((best, current) => 
      current.confidence > best.confidence ? current : best
    );
  }

  /**
   * Get random link for interaction
   * @param {string} type - Optional link type filter
   * @returns {Object|null} - Random link or null
   */
  getRandomLink(type = null) {
    let links = this.getLinksInViewport();
    
    if (type) {
      links = links.filter(link => link.type === type);
    }
    
    if (links.length === 0) {
      return null;
    }
    
    return choice(links);
  }

  /**
   * Update statistics
   * @param {Array} newLinks - Array of new links
   */
  updateStats(newLinks) {
    try {
      this.stats.totalLinksDetected += newLinks.length;
      this.stats.lastDetectionTime = Date.now();
      
      for (const link of newLinks) {
        this.stats.linksByType[link.type] = (this.stats.linksByType[link.type] || 0) + 1;
      }
      
      // Calculate detection accuracy (simplified)
      this.stats.detectionAccuracy = Math.min(1, this.stats.totalLinksDetected / 20);
    } catch (error) {
      logger.error('Error updating stats', { error });
    }
  }

  /**
   * Clear detected links
   */
  clearDetectedLinks() {
    this.detectedLinks.clear();
  }

  /**
   * Generate unique link ID
   * @param {HTMLElement} element - Link element
   * @returns {string} - Unique link ID
   */
  generateLinkId(element) {
    const rect = element.getBoundingClientRect();
    return `nav_${element.tagName}_${Math.round(rect.left)}_${Math.round(rect.top)}_${Date.now()}`;
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
      
      if (this.config.maxLinksPerType < 1) {
        logger.error('Max links per type must be at least 1');
        return false;
      }
      
      if (this.config.minLinkSize.width < 10 || this.config.minLinkSize.height < 10) {
        logger.error('Minimum link size too small');
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
      detectedLinksCount: this.detectedLinks.size,
      config: this.config
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      totalLinksDetected: 0,
      linksByType: {},
      lastDetectionTime: null,
      detectionAccuracy: 0
    };
  }

  /**
   * Update configuration
   * @param {Object} newConfig - New configuration
   */
  updateConfig(newConfig) {
    try {
      this.config = { ...this.config, ...newConfig };
      logger.info('Navigation detector configuration updated', { config: this.config });
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
      this.clearDetectedLinks();
      this.resetStats();
      logger.info('Navigation detector cleaned up');
      return true;
    } catch (error) {
      logger.error('Error cleaning up navigation detector', { error });
      return false;
    }
  }
}

/**
 * Create navigation detector instance
 * @param {Object} config - Configuration object
 * @returns {NavigationDetector} - Detector instance
 */
export function createNavigationDetector(config = {}) {
  return new NavigationDetector(config);
}

/**
 * Default navigation detector instance
 */
export const navigationDetector = createNavigationDetector();
