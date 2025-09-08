/**
 * Google AdSense detector for identifying and interacting with ads
 */

import { createLogger } from '../utils/logger.js';
import { randFloat, randInt, choice } from '../core/randomizer.js';
import { safeQuerySelector, safeQuerySelectorAll, isElementVisible } from '../utils/dom.js';

const logger = createLogger('adsense-detector');

/**
 * AdSense Detector
 * Detects and analyzes Google AdSense ads on the page
 */
export class AdSenseDetector {
  constructor() {
    this.isActive = false;
    this.detectedAds = new Map();
    this.config = {
      enabled: true,
      detectionInterval: 5000, // 5 seconds
      interactionEnabled: false, // Requires opt-in
      hoverEnabled: true,
      clickEnabled: false, // Requires explicit opt-in
      dwellTimeEnabled: true,
      maxAdsPerPage: 10,
      minAdSize: { width: 200, height: 100 },
      selectors: {
        // Common AdSense selectors
        adsense: [
          'ins[data-ad-slot]',
          'ins[data-ad-client]',
          'div[data-ad-slot]',
          'div[data-ad-client]',
          '.adsbygoogle',
          '.adsense',
          '.google-ads',
          '.ad-container',
          '.ad-wrapper',
          '.advertisement'
        ],
        // Generic ad selectors
        generic: [
          '[id*="ad-"]',
          '[class*="ad-"]',
          '[id*="ads-"]',
          '[class*="ads-"]',
          '[id*="advertisement"]',
          '[class*="advertisement"]',
          '[id*="banner"]',
          '[class*="banner"]'
        ]
      },
      interaction: {
        hoverProbability: 0.3,
        clickProbability: 0.05, // Very low, requires opt-in
        dwellTime: { minMs: 1000, maxMs: 3000 },
        hoverDelay: { minMs: 500, maxMs: 1500 }
      }
    };
    
    this.stats = {
      totalAdsDetected: 0,
      adsByType: {},
      interactions: 0,
      lastDetectionTime: null,
      detectionAccuracy: 0
    };
    
    this.detectionTimer = null;
    this.eventListeners = new Map();
  }

  /**
   * Initialize AdSense detector
   * @param {Object} config - Configuration object
   * @returns {Promise<boolean>} - Success status
   */
  async initialize(config = {}) {
    try {
      this.config = { ...this.config, ...config };
      
      // Validate configuration
      if (!this.validateConfig()) {
        logger.error('Invalid AdSense detector configuration');
        return false;
      }
      
      logger.info('AdSense detector initialized', { config: this.config });
      return true;
    } catch (error) {
      logger.error('Error initializing AdSense detector', { error });
      return false;
    }
  }

  /**
   * Start AdSense detection
   * @returns {Promise<boolean>} - Success status
   */
  async start() {
    try {
      if (this.isActive) {
        logger.warn('AdSense detector already active');
        return false;
      }

      this.isActive = true;
      
      // Initial detection
      await this.detectAds();
      
      // Start periodic detection
      this.startPeriodicDetection();
      
      logger.info('AdSense detector started');
      return true;
    } catch (error) {
      logger.error('Error starting AdSense detector', { error });
      return false;
    }
  }

  /**
   * Stop AdSense detection
   * @returns {Promise<boolean>} - Success status
   */
  async stop() {
    try {
      if (!this.isActive) {
        logger.warn('AdSense detector not active');
        return false;
      }

      this.isActive = false;
      this.stopPeriodicDetection();
      this.clearDetectedAds();
      
      logger.info('AdSense detector stopped');
      return true;
    } catch (error) {
      logger.error('Error stopping AdSense detector', { error });
      return false;
    }
  }

  /**
   * Detect ads on the page
   * @returns {Promise<Array>} - Array of detected ads
   */
  async detectAds() {
    try {
      const ads = [];
      
      // Detect AdSense ads
      const adsenseAds = await this.detectAdSenseAds();
      ads.push(...adsenseAds);
      
      // Detect generic ads
      const genericAds = await this.detectGenericAds();
      ads.push(...genericAds);
      
      // Filter and validate ads
      const validAds = this.filterValidAds(ads);
      
      // Update detected ads map
      this.updateDetectedAds(validAds);
      
      // Update statistics
      this.updateStats(validAds);
      
      logger.debug('Ads detected', { 
        total: validAds.length, 
        adsense: adsenseAds.length, 
        generic: genericAds.length 
      });
      
      return validAds;
    } catch (error) {
      logger.error('Error detecting ads', { error });
      return [];
    }
  }

  /**
   * Detect AdSense specific ads
   * @returns {Promise<Array>} - Array of AdSense ads
   */
  async detectAdSenseAds() {
    try {
      const ads = [];
      
      for (const selector of this.config.selectors.adsense) {
        const elements = safeQuerySelectorAll(selector);
        
        for (const element of elements) {
          const ad = await this.analyzeAdElement(element, 'adsense');
          if (ad) {
            ads.push(ad);
          }
        }
      }
      
      return ads;
    } catch (error) {
      logger.error('Error detecting AdSense ads', { error });
      return [];
    }
  }

  /**
   * Detect generic ads
   * @returns {Promise<Array>} - Array of generic ads
   */
  async detectGenericAds() {
    try {
      const ads = [];
      
      for (const selector of this.config.selectors.generic) {
        const elements = safeQuerySelectorAll(selector);
        
        for (const element of elements) {
          const ad = await this.analyzeAdElement(element, 'generic');
          if (ad) {
            ads.push(ad);
          }
        }
      }
      
      return ads;
    } catch (error) {
      logger.error('Error detecting generic ads', { error });
      return [];
    }
  }

  /**
   * Analyze ad element
   * @param {HTMLElement} element - Ad element
   * @param {string} type - Ad type
   * @returns {Promise<Object|null>} - Ad object or null
   */
  async analyzeAdElement(element, type) {
    try {
      if (!element || !isElementVisible(element)) {
        return null;
      }
      
      const rect = element.getBoundingClientRect();
      const size = { width: rect.width, height: rect.height };
      
      // Check minimum size
      if (size.width < this.config.minAdSize.width || 
          size.height < this.config.minAdSize.height) {
        return null;
      }
      
      // Extract ad information
      const ad = {
        id: this.generateAdId(element),
        element: element,
        type: type,
        size: size,
        position: {
          x: rect.left,
          y: rect.top,
          viewport: this.isInViewport(rect)
        },
        attributes: this.extractAdAttributes(element),
        content: this.extractAdContent(element),
        timestamp: Date.now(),
        interactions: {
          hovered: false,
          clicked: false,
          dwellTime: 0
        }
      };
      
      return ad;
    } catch (error) {
      logger.error('Error analyzing ad element', { error });
      return null;
    }
  }

  /**
   * Extract ad attributes
   * @param {HTMLElement} element - Ad element
   * @returns {Object} - Ad attributes
   */
  extractAdAttributes(element) {
    try {
      const attributes = {};
      
      // Common AdSense attributes
      const adAttributes = [
        'data-ad-slot',
        'data-ad-client',
        'data-ad-format',
        'data-ad-layout',
        'data-ad-layout-key',
        'data-full-width-responsive'
      ];
      
      for (const attr of adAttributes) {
        if (element.hasAttribute(attr)) {
          attributes[attr] = element.getAttribute(attr);
        }
      }
      
      // Generic attributes
      attributes.id = element.id;
      attributes.className = element.className;
      attributes.tagName = element.tagName;
      
      return attributes;
    } catch (error) {
      logger.error('Error extracting ad attributes', { error });
      return {};
    }
  }

  /**
   * Extract ad content
   * @param {HTMLElement} element - Ad element
   * @returns {Object} - Ad content
   */
  extractAdContent(element) {
    try {
      const content = {
        text: element.textContent?.trim() || '',
        images: [],
        links: []
      };
      
      // Extract images
      const images = element.querySelectorAll('img');
      for (const img of images) {
        content.images.push({
          src: img.src,
          alt: img.alt,
          width: img.width,
          height: img.height
        });
      }
      
      // Extract links
      const links = element.querySelectorAll('a');
      for (const link of links) {
        content.links.push({
          href: link.href,
          text: link.textContent?.trim() || '',
          target: link.target
        });
      }
      
      return content;
    } catch (error) {
      logger.error('Error extracting ad content', { error });
      return { text: '', images: [], links: [] };
    }
  }

  /**
   * Filter valid ads
   * @param {Array} ads - Array of ads
   * @returns {Array} - Array of valid ads
   */
  filterValidAds(ads) {
    try {
      return ads.filter(ad => {
        // Check if ad is still visible
        if (!isElementVisible(ad.element)) {
          return false;
        }
        
        // Check if ad is not already detected
        if (this.detectedAds.has(ad.id)) {
          return false;
        }
        
        // Check minimum size
        if (ad.size.width < this.config.minAdSize.width || 
            ad.size.height < this.config.minAdSize.height) {
          return false;
        }
        
        // Check if ad has meaningful content
        if (!ad.content.text && ad.content.images.length === 0) {
          return false;
        }
        
        return true;
      });
    } catch (error) {
      logger.error('Error filtering valid ads', { error });
      return [];
    }
  }

  /**
   * Update detected ads map
   * @param {Array} ads - Array of new ads
   */
  updateDetectedAds(ads) {
    try {
      for (const ad of ads) {
        this.detectedAds.set(ad.id, ad);
      }
      
      // Limit number of detected ads
      if (this.detectedAds.size > this.config.maxAdsPerPage) {
        const adsArray = Array.from(this.detectedAds.values());
        const sortedAds = adsArray.sort((a, b) => b.timestamp - a.timestamp);
        
        this.detectedAds.clear();
        for (let i = 0; i < this.config.maxAdsPerPage; i++) {
          this.detectedAds.set(sortedAds[i].id, sortedAds[i]);
        }
      }
    } catch (error) {
      logger.error('Error updating detected ads', { error });
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
        await this.detectAds();
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
   * Interact with ad
   * @param {string} adId - Ad ID
   * @param {string} interactionType - Type of interaction
   * @returns {Promise<boolean>} - Success status
   */
  async interactWithAd(adId, interactionType = 'hover') {
    try {
      if (!this.config.interactionEnabled) {
        logger.warn('Ad interaction not enabled');
        return false;
      }
      
      const ad = this.detectedAds.get(adId);
      if (!ad) {
        logger.warn('Ad not found', { adId });
        return false;
      }
      
      switch (interactionType) {
        case 'hover':
          return await this.hoverAd(ad);
        case 'click':
          return await this.clickAd(ad);
        case 'dwell':
          return await this.dwellAd(ad);
        default:
          logger.warn('Unknown interaction type', { interactionType });
          return false;
      }
    } catch (error) {
      logger.error('Error interacting with ad', { error, adId, interactionType });
      return false;
    }
  }

  /**
   * Hover over ad
   * @param {Object} ad - Ad object
   * @returns {Promise<boolean>} - Success status
   */
  async hoverAd(ad) {
    try {
      if (!this.config.hoverEnabled) {
        return false;
      }
      
      // Check hover probability
      if (Math.random() > this.config.interaction.hoverProbability) {
        return false;
      }
      
      // Generate hover delay
      const delay = randInt(
        this.config.interaction.hoverDelay.minMs,
        this.config.interaction.hoverDelay.maxMs
      );
      
      // Simulate hover
      const hoverEvent = new MouseEvent('mouseenter', {
        bubbles: true,
        cancelable: true,
        clientX: ad.position.x + ad.size.width / 2,
        clientY: ad.position.y + ad.size.height / 2
      });
      
      ad.element.dispatchEvent(hoverEvent);
      
      // Wait for hover delay
      await this.sleep(delay);
      
      // Dispatch mouseleave
      const leaveEvent = new MouseEvent('mouseleave', {
        bubbles: true,
        cancelable: true,
        clientX: ad.position.x + ad.size.width / 2,
        clientY: ad.position.y + ad.size.height / 2
      });
      
      ad.element.dispatchEvent(leaveEvent);
      
      // Update ad interactions
      ad.interactions.hovered = true;
      this.stats.interactions++;
      
      logger.debug('Ad hovered', { adId: ad.id, delay });
      return true;
    } catch (error) {
      logger.error('Error hovering ad', { error, adId: ad.id });
      return false;
    }
  }

  /**
   * Click ad
   * @param {Object} ad - Ad object
   * @returns {Promise<boolean>} - Success status
   */
  async clickAd(ad) {
    try {
      if (!this.config.clickEnabled) {
        logger.warn('Ad clicking not enabled - requires explicit opt-in');
        return false;
      }
      
      // Check click probability
      if (Math.random() > this.config.interaction.clickProbability) {
        return false;
      }
      
      // Find clickable element within ad
      const clickableElement = this.findClickableElement(ad.element);
      if (!clickableElement) {
        logger.warn('No clickable element found in ad', { adId: ad.id });
        return false;
      }
      
      // Simulate click
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        clientX: ad.position.x + ad.size.width / 2,
        clientY: ad.position.y + ad.size.height / 2
      });
      
      clickableElement.dispatchEvent(clickEvent);
      
      // Update ad interactions
      ad.interactions.clicked = true;
      this.stats.interactions++;
      
      logger.debug('Ad clicked', { adId: ad.id });
      return true;
    } catch (error) {
      logger.error('Error clicking ad', { error, adId: ad.id });
      return false;
    }
  }

  /**
   * Dwell on ad
   * @param {Object} ad - Ad object
   * @returns {Promise<boolean>} - Success status
   */
  async dwellAd(ad) {
    try {
      if (!this.config.dwellTimeEnabled) {
        return false;
      }
      
      // Generate dwell time
      const dwellTime = randInt(
        this.config.interaction.dwellTime.minMs,
        this.config.interaction.dwellTime.maxMs
      );
      
      // Simulate dwell
      await this.sleep(dwellTime);
      
      // Update ad interactions
      ad.interactions.dwellTime += dwellTime;
      
      logger.debug('Ad dwelled', { adId: ad.id, dwellTime });
      return true;
    } catch (error) {
      logger.error('Error dwelling ad', { error, adId: ad.id });
      return false;
    }
  }

  /**
   * Find clickable element within ad
   * @param {HTMLElement} adElement - Ad element
   * @returns {HTMLElement|null} - Clickable element or null
   */
  findClickableElement(adElement) {
    try {
      // Look for common clickable elements
      const clickableSelectors = ['a', 'button', '[onclick]', '[role="button"]'];
      
      for (const selector of clickableSelectors) {
        const element = adElement.querySelector(selector);
        if (element && isElementVisible(element)) {
          return element;
        }
      }
      
      // If no specific clickable element, return the ad element itself
      return adElement;
    } catch (error) {
      logger.error('Error finding clickable element', { error });
      return null;
    }
  }

  /**
   * Get detected ads
   * @returns {Array} - Array of detected ads
   */
  getDetectedAds() {
    return Array.from(this.detectedAds.values());
  }

  /**
   * Get ads in viewport
   * @returns {Array} - Array of ads in viewport
   */
  getAdsInViewport() {
    return this.getDetectedAds().filter(ad => ad.position.viewport);
  }

  /**
   * Get random ad for interaction
   * @returns {Object|null} - Random ad or null
   */
  getRandomAd() {
    const ads = this.getAdsInViewport();
    if (ads.length === 0) {
      return null;
    }
    
    return choice(ads);
  }

  /**
   * Update statistics
   * @param {Array} newAds - Array of new ads
   */
  updateStats(newAds) {
    try {
      this.stats.totalAdsDetected += newAds.length;
      this.stats.lastDetectionTime = Date.now();
      
      for (const ad of newAds) {
        this.stats.adsByType[ad.type] = (this.stats.adsByType[ad.type] || 0) + 1;
      }
      
      // Calculate detection accuracy (simplified)
      this.stats.detectionAccuracy = Math.min(1, this.stats.totalAdsDetected / 10);
    } catch (error) {
      logger.error('Error updating stats', { error });
    }
  }

  /**
   * Clear detected ads
   */
  clearDetectedAds() {
    this.detectedAds.clear();
  }

  /**
   * Generate unique ad ID
   * @param {HTMLElement} element - Ad element
   * @returns {string} - Unique ad ID
   */
  generateAdId(element) {
    const rect = element.getBoundingClientRect();
    return `ad_${element.tagName}_${Math.round(rect.left)}_${Math.round(rect.top)}_${Date.now()}`;
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
      
      if (this.config.maxAdsPerPage < 1) {
        logger.error('Max ads per page must be at least 1');
        return false;
      }
      
      if (this.config.minAdSize.width < 50 || this.config.minAdSize.height < 50) {
        logger.error('Minimum ad size too small');
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
      detectedAdsCount: this.detectedAds.size,
      config: this.config
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      totalAdsDetected: 0,
      adsByType: {},
      interactions: 0,
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
      logger.info('AdSense detector configuration updated', { config: this.config });
    } catch (error) {
      logger.error('Error updating configuration', { error });
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
      this.clearDetectedAds();
      this.resetStats();
      logger.info('AdSense detector cleaned up');
      return true;
    } catch (error) {
      logger.error('Error cleaning up AdSense detector', { error });
      return false;
    }
  }
}

/**
 * Create AdSense detector instance
 * @param {Object} config - Configuration object
 * @returns {AdSenseDetector} - Detector instance
 */
export function createAdSenseDetector(config = {}) {
  return new AdSenseDetector(config);
}

/**
 * Default AdSense detector instance
 */
export const adSenseDetector = createAdSenseDetector();
