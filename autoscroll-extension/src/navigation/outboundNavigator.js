/**
 * Outbound navigator for handling external link navigation
 */

import { createLogger } from '../utils/logger.js';
import { randFloat, randInt, choice } from '../core/randomizer.js';
import { linkParser } from './linkParser.js';
import { tabManager } from './tabManager.js';

const logger = createLogger('outbound-navigator');

/**
 * Outbound Navigator
 * Handles navigation to external links and outbound traffic
 */
export class OutboundNavigator {
  constructor() {
    this.isActive = false;
    this.config = {
      enabled: true,
      outboundChance: 0.01, // 1% chance
      maxOutboundPerSession: 5,
      navigationDelay: { minMs: 2000, maxMs: 8000 },
      hoverDelay: { minMs: 800, maxMs: 2500 },
      clickDelay: { minMs: 100, maxMs: 500 },
      dwellTime: { minMs: 1000, maxMs: 5000 },
      returnDelay: { minMs: 3000, maxMs: 10000 },
      selectors: {
        externalLinks: [
          'a[href^="http://"]',
          'a[href^="https://"]',
          'a[href^="//"]',
          'a[target="_blank"]',
          'a[rel="external"]',
          'a[rel="nofollow"]'
        ],
        outboundTriggers: [
          '.external-link',
          '.outbound-link',
          '.external',
          '.outbound',
          '[data-external="true"]',
          '[data-outbound="true"]'
        ]
      },
      whitelist: {
        enabled: true,
        domains: [
          'google.com',
          'youtube.com',
          'facebook.com',
          'twitter.com',
          'linkedin.com',
          'github.com',
          'stackoverflow.com',
          'wikipedia.org',
          'reddit.com',
          'medium.com'
        ]
      },
      blacklist: {
        enabled: true,
        domains: [
          'malware.com',
          'phishing.com',
          'spam.com',
          'ads.com',
          'tracking.com'
        ],
        patterns: [
          /ads\./i,
          /tracking\./i,
          /analytics\./i,
          /metrics\./i,
          /pixel\./i
        ]
      },
      behavior: {
        hoverBeforeClick: true,
        multipleHovers: true,
        maxHovers: 3,
        dwellTimeVariation: 0.3,
        returnToOrigin: true,
        simulateReading: true
      }
    };
    
    this.stats = {
      totalOutboundClicks: 0,
      outboundByDomain: {},
      outboundByType: {},
      lastOutboundTime: null,
      sessionOutboundCount: 0,
      errors: 0
    };
    
    this.detectedLinks = new Map();
    this.eventListeners = new Map();
    this.originUrl = null;
  }

  /**
   * Initialize outbound navigator
   * @param {Object} config - Configuration object
   * @returns {Promise<boolean>} - Success status
   */
  async initialize(config = {}) {
    try {
      this.config = { ...this.config, ...config };
      
      // Validate configuration
      if (!this.validateConfig()) {
        logger.error('Invalid outbound navigator configuration');
        return false;
      }
      
      // Store origin URL
      this.originUrl = window.location.href;
      
      logger.info('Outbound navigator initialized', { config: this.config });
      return true;
    } catch (error) {
      logger.error('Error initializing outbound navigator', { error });
      return false;
    }
  }

  /**
   * Start outbound navigator
   * @returns {Promise<boolean>} - Success status
   */
  async start() {
    try {
      if (this.isActive) {
        logger.warn('Outbound navigator already active');
        return false;
      }

      this.isActive = true;
      
      // Initial detection
      await this.detectOutboundLinks();
      
      logger.info('Outbound navigator started');
      return true;
    } catch (error) {
      logger.error('Error starting outbound navigator', { error });
      return false;
    }
  }

  /**
   * Stop outbound navigator
   * @returns {Promise<boolean>} - Success status
   */
  async stop() {
    try {
      if (!this.isActive) {
        logger.warn('Outbound navigator not active');
        return false;
      }

      this.isActive = false;
      this.clearDetectedLinks();
      
      logger.info('Outbound navigator stopped');
      return true;
    } catch (error) {
      logger.error('Error stopping outbound navigator', { error });
      return false;
    }
  }

  /**
   * Detect outbound links on the page
   * @returns {Promise<Array>} - Array of detected outbound links
   */
  async detectOutboundLinks() {
    try {
      const links = [];
      
      // Detect external links
      const externalLinks = await this.detectExternalLinks();
      links.push(...externalLinks);
      
      // Detect outbound trigger elements
      const triggerLinks = await this.detectOutboundTriggers();
      links.push(...triggerLinks);
      
      // Filter and validate links
      const validLinks = this.filterValidOutboundLinks(links);
      
      // Update detected links map
      this.updateDetectedLinks(validLinks);
      
      logger.debug('Outbound links detected', { 
        total: validLinks.length,
        external: externalLinks.length,
        triggers: triggerLinks.length
      });
      
      return validLinks;
    } catch (error) {
      logger.error('Error detecting outbound links', { error });
      return [];
    }
  }

  /**
   * Detect external links
   * @returns {Promise<Array>} - Array of external links
   */
  async detectExternalLinks() {
    try {
      const links = [];
      const selectors = this.config.selectors.externalLinks || [];
      
      for (const selector of selectors) {
        try {
          const elements = document.querySelectorAll(selector);
          
          for (const element of elements) {
            const link = await this.analyzeOutboundLink(element);
            if (link) {
              links.push(link);
            }
          }
        } catch (selectorError) {
          // Skip invalid selectors
          logger.debug('Invalid selector', { selector, error: selectorError });
        }
      }
      
      return links;
    } catch (error) {
      logger.error('Error detecting external links', { error });
      return [];
    }
  }

  /**
   * Detect outbound trigger elements
   * @returns {Promise<Array>} - Array of outbound trigger elements
   */
  async detectOutboundTriggers() {
    try {
      const links = [];
      const selectors = this.config.selectors.outboundTriggers || [];
      
      for (const selector of selectors) {
        try {
          const elements = document.querySelectorAll(selector);
          
          for (const element of elements) {
            const link = await this.analyzeOutboundLink(element);
            if (link) {
              links.push(link);
            }
          }
        } catch (selectorError) {
          // Skip invalid selectors
          logger.debug('Invalid selector', { selector, error: selectorError });
        }
      }
      
      return links;
    } catch (error) {
      logger.error('Error detecting outbound triggers', { error });
      return [];
    }
  }

  /**
   * Analyze outbound link
   * @param {HTMLElement} element - Link element
   * @returns {Promise<Object|null>} - Outbound link object or null
   */
  async analyzeOutboundLink(element) {
    try {
      if (!element || !element.href) {
        return null;
      }
      
      // Parse link
      const parsedLink = linkParser.parseLink(element);
      if (!parsedLink) {
        return null;
      }
      
      // Check if it's an outbound link
      if (parsedLink.type !== 'external') {
        return null;
      }
      
      // Check whitelist
      if (this.config.whitelist.enabled) {
        const domain = parsedLink.parsed.hostname;
        if (!this.config.whitelist.domains.includes(domain)) {
          return null;
        }
      }
      
      // Check blacklist
      if (this.config.blacklist.enabled) {
        if (this.isBlacklisted(parsedLink)) {
          return null;
        }
      }
      
      // Create outbound link object
      const outboundLink = {
        id: this.generateOutboundLinkId(element),
        element: element,
        parsedLink: parsedLink,
        domain: parsedLink.parsed.hostname,
        url: parsedLink.normalized,
        text: parsedLink.text,
        title: parsedLink.title,
        confidence: this.calculateOutboundConfidence(parsedLink, element),
        timestamp: Date.now(),
        interactions: {
          hovered: false,
          clicked: false,
          dwellTime: 0
        }
      };
      
      return outboundLink;
    } catch (error) {
      logger.error('Error analyzing outbound link', { error });
      return null;
    }
  }

  /**
   * Check if link is blacklisted
   * @param {Object} parsedLink - Parsed link object
   * @returns {boolean} - True if blacklisted
   */
  isBlacklisted(parsedLink) {
    try {
      const domain = parsedLink.parsed.hostname;
      const url = parsedLink.normalized;
      
      // Check domain blacklist
      if (this.config.blacklist.domains.includes(domain)) {
        return true;
      }
      
      // Check pattern blacklist
      for (const pattern of this.config.blacklist.patterns) {
        if (pattern.test(url)) {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      logger.error('Error checking blacklist', { error });
      return false;
    }
  }

  /**
   * Calculate outbound confidence
   * @param {Object} parsedLink - Parsed link object
   * @param {HTMLElement} element - Link element
   * @returns {number} - Confidence score (0-1)
   */
  calculateOutboundConfidence(parsedLink, element) {
    try {
      let confidence = 0.5; // Base confidence
      
      // Boost confidence for visible elements
      if (element.offsetWidth > 0 && element.offsetHeight > 0) {
        confidence += 0.2;
      }
      
      // Boost confidence for elements with text
      if (parsedLink.text) {
        confidence += 0.1;
      }
      
      // Boost confidence for elements with title
      if (parsedLink.title) {
        confidence += 0.1;
      }
      
      // Boost confidence for trusted domains
      if (this.config.whitelist.domains.includes(parsedLink.parsed.hostname)) {
        confidence += 0.2;
      }
      
      return Math.min(1, confidence);
    } catch (error) {
      logger.error('Error calculating outbound confidence', { error });
      return 0.5;
    }
  }

  /**
   * Filter valid outbound links
   * @param {Array} links - Array of outbound links
   * @returns {Array} - Array of valid outbound links
   */
  filterValidOutboundLinks(links) {
    try {
      return links.filter(link => {
        // Check if link is not already detected
        if (this.detectedLinks.has(link.id)) {
          return false;
        }
        
        // Check confidence threshold
        if (link.confidence < 0.3) {
          return false;
        }
        
        return true;
      });
    } catch (error) {
      logger.error('Error filtering valid outbound links', { error });
      return [];
    }
  }

  /**
   * Update detected links map
   * @param {Array} links - Array of new outbound links
   */
  updateDetectedLinks(links) {
    try {
      for (const link of links) {
        this.detectedLinks.set(link.id, link);
      }
    } catch (error) {
      logger.error('Error updating detected links', { error });
    }
  }

  /**
   * Navigate to outbound link
   * @param {Object} link - Outbound link object
   * @returns {Promise<boolean>} - Success status
   */
  async navigateToOutboundLink(link) {
    try {
      if (!this.isActive) {
        logger.warn('Outbound navigator not active');
        return false;
      }
      
      // Check outbound chance
      if (Math.random() > this.config.outboundChance) {
        logger.debug('Outbound navigation skipped by probability');
        return false;
      }
      
      // Check session limits
      if (this.stats.sessionOutboundCount >= this.config.maxOutboundPerSession) {
        logger.info('Maximum outbound clicks per session reached');
        return false;
      }
      
      // Simulate hover behavior
      if (this.config.behavior.hoverBeforeClick) {
        await this.simulateHoverBehavior(link);
      }
      
      // Simulate click
      const clickSuccess = await this.simulateClick(link.element);
      if (!clickSuccess) {
        logger.warn('Failed to simulate click on outbound link');
        return false;
      }
      
      // Update statistics
      this.stats.totalOutboundClicks++;
      this.stats.outboundByDomain[link.domain] = (this.stats.outboundByDomain[link.domain] || 0) + 1;
      this.stats.outboundByType[link.parsedLink.type] = (this.stats.outboundByType[link.parsedLink.type] || 0) + 1;
      this.stats.lastOutboundTime = Date.now();
      this.stats.sessionOutboundCount++;
      
      // Update link interactions
      link.interactions.clicked = true;
      
      logger.info('Navigated to outbound link', { 
        domain: link.domain, 
        url: link.url,
        text: link.text
      });
      
      // Emit event
      this.emit('outboundNavigated', { link });
      
      // Handle return to origin
      if (this.config.behavior.returnToOrigin) {
        await this.handleReturnToOrigin();
      }
      
      return true;
    } catch (error) {
      logger.error('Error navigating to outbound link', { error, link });
      this.stats.errors++;
      return false;
    }
  }

  /**
   * Simulate hover behavior
   * @param {Object} link - Outbound link object
   * @returns {Promise<boolean>} - Success status
   */
  async simulateHoverBehavior(link) {
    try {
      const maxHovers = this.config.behavior.multipleHovers ? 
        randInt(1, this.config.behavior.maxHovers) : 1;
      
      for (let i = 0; i < maxHovers; i++) {
        // Simulate hover
        await this.simulateHover(link.element);
        
        // Wait for hover delay
        const hoverDelay = randInt(
          this.config.hoverDelay.minMs,
          this.config.hoverDelay.maxMs
        );
        await this.sleep(hoverDelay);
        
        // Simulate dwell time
        if (this.config.behavior.simulateReading) {
          const dwellTime = randInt(
            this.config.dwellTime.minMs,
            this.config.dwellTime.maxMs
          );
          await this.sleep(dwellTime);
          link.interactions.dwellTime += dwellTime;
        }
      }
      
      link.interactions.hovered = true;
      return true;
    } catch (error) {
      logger.error('Error simulating hover behavior', { error });
      return false;
    }
  }

  /**
   * Simulate hover over element
   * @param {HTMLElement} element - Element to hover over
   * @returns {Promise<boolean>} - Success status
   */
  async simulateHover(element) {
    try {
      const rect = element.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      
      // Create hover event
      const hoverEvent = new MouseEvent('mouseenter', {
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y,
        screenX: x,
        screenY: y
      });
      
      element.dispatchEvent(hoverEvent);
      
      // Wait a bit
      await this.sleep(randInt(100, 300));
      
      // Create mouseover event
      const mouseoverEvent = new MouseEvent('mouseover', {
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y,
        screenX: x,
        screenY: y
      });
      
      element.dispatchEvent(mouseoverEvent);
      
      logger.debug('Hover simulated', { x, y });
      return true;
    } catch (error) {
      logger.error('Error simulating hover', { error });
      return false;
    }
  }

  /**
   * Simulate click on element
   * @param {HTMLElement} element - Element to click
   * @returns {Promise<boolean>} - Success status
   */
  async simulateClick(element) {
    try {
      const rect = element.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      
      // Create mousedown event
      const mousedownEvent = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y,
        screenX: x,
        screenY: y,
        button: 0
      });
      
      element.dispatchEvent(mousedownEvent);
      
      // Wait a bit
      await this.sleep(randInt(50, 150));
      
      // Create mouseup event
      const mouseupEvent = new MouseEvent('mouseup', {
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y,
        screenX: x,
        screenY: y,
        button: 0
      });
      
      element.dispatchEvent(mouseupEvent);
      
      // Wait a bit
      await this.sleep(randInt(50, 150));
      
      // Create click event
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y,
        screenX: x,
        screenY: y,
        button: 0
      });
      
      element.dispatchEvent(clickEvent);
      
      logger.debug('Click simulated', { x, y });
      return true;
    } catch (error) {
      logger.error('Error simulating click', { error });
      return false;
    }
  }

  /**
   * Handle return to origin
   * @returns {Promise<boolean>} - Success status
   */
  async handleReturnToOrigin() {
    try {
      if (!this.originUrl) {
        logger.warn('No origin URL to return to');
        return false;
      }
      
      // Generate return delay
      const returnDelay = randInt(
        this.config.returnDelay.minMs,
        this.config.returnDelay.maxMs
      );
      
      await this.sleep(returnDelay);
      
      // Navigate back to origin
      const success = await tabManager.navigateToUrl(this.originUrl);
      if (!success) {
        logger.warn('Failed to return to origin URL');
        return false;
      }
      
      logger.info('Returned to origin URL', { originUrl: this.originUrl });
      
      // Emit event
      this.emit('returnedToOrigin', { originUrl: this.originUrl });
      
      return true;
    } catch (error) {
      logger.error('Error handling return to origin', { error });
      return false;
    }
  }

  /**
   * Get detected outbound links
   * @returns {Array} - Array of detected outbound links
   */
  getDetectedOutboundLinks() {
    return Array.from(this.detectedLinks.values());
  }

  /**
   * Get random outbound link for interaction
   * @returns {Object|null} - Random outbound link or null
   */
  getRandomOutboundLink() {
    const links = this.getDetectedOutboundLinks();
    if (links.length === 0) {
      return null;
    }
    
    return choice(links);
  }

  /**
   * Get outbound links by domain
   * @param {string} domain - Domain to filter by
   * @returns {Array} - Array of outbound links for domain
   */
  getOutboundLinksByDomain(domain) {
    return this.getDetectedOutboundLinks().filter(link => link.domain === domain);
  }

  /**
   * Clear detected links
   */
  clearDetectedLinks() {
    this.detectedLinks.clear();
  }

  /**
   * Generate unique outbound link ID
   * @param {HTMLElement} element - Link element
   * @returns {string} - Unique outbound link ID
   */
  generateOutboundLinkId(element) {
    const rect = element.getBoundingClientRect();
    return `outbound_${element.tagName}_${Math.round(rect.left)}_${Math.round(rect.top)}_${Date.now()}`;
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
      originUrl: this.originUrl,
      config: this.config
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      totalOutboundClicks: 0,
      outboundByDomain: {},
      outboundByType: {},
      lastOutboundTime: null,
      sessionOutboundCount: 0,
      errors: 0
    };
  }

  /**
   * Update configuration
   * @param {Object} newConfig - New configuration
   */
  updateConfig(newConfig) {
    try {
      this.config = { ...this.config, ...newConfig };
      logger.info('Outbound navigator configuration updated', { config: this.config });
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
      if (this.config.outboundChance < 0 || this.config.outboundChance > 1) {
        logger.error('Outbound chance must be between 0 and 1');
        return false;
      }
      
      if (this.config.maxOutboundPerSession < 0) {
        logger.error('Max outbound per session must be non-negative');
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
   * Sleep utility
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>} - Promise that resolves after delay
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
      logger.info('Outbound navigator cleaned up');
      return true;
    } catch (error) {
      logger.error('Error cleaning up outbound navigator', { error });
      return false;
    }
  }
}

/**
 * Create outbound navigator instance
 * @param {Object} config - Configuration object
 * @returns {OutboundNavigator} - Navigator instance
 */
export function createOutboundNavigator(config = {}) {
  return new OutboundNavigator(config);
}

/**
 * Default outbound navigator instance
 */
export const outboundNavigator = createOutboundNavigator();
