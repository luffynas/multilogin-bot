/**
 * Navigation controller for managing page navigation and link interactions
 */

import { createLogger } from '@utils/logger.js';
import { randFloat, randInt, choice } from '@core/randomizer.js';
import { adSenseDetector } from '../detectors/adsenseDetector.js';
import { navigationDetector } from '../detectors/navigationDetector.js';
import { paginationDetector } from '../detectors/paginationDetector.js';
import { keywordDetector } from '../detectors/keywordDetector.js';

const logger = createLogger('navigation-controller');

/**
 * Navigation Controller
 * Manages navigation between pages and link interactions
 */
export class NavigationController {
  constructor() {
    this.isActive = false;
    this.config = {
      enabled: true,
      autoNavigate: false,
      navigationMode: 'sameTab', // 'sameTab', 'newTab', 'random'
      navigationTarget: 'next', // 'next', 'prev', 'related', 'recent', 'random'
      outboundChance: 0.01,
      navigationDelay: { minMs: 2000, maxMs: 5000 },
      hoverDelay: { minMs: 500, maxMs: 1500 },
      clickDelay: { minMs: 100, maxMs: 500 },
      dwellTime: { minMs: 1000, maxMs: 3000 },
      maxPagesPerSession: 10,
      sessionTimeout: 300000, // 5 minutes
      selectors: {
        navigation: [
          'a[href]',
          'button[onclick]',
          '[role="link"]',
          '[data-href]',
          '[data-url]'
        ],
        pagination: [
          '.pagination',
          '.page-numbers',
          '.pager',
          '.page-nav',
          '.pagination-nav'
        ]
      },
      preferences: {
        enabled: true,
        categories: ['technology', 'business', 'education'],
        keywords: [],
        excludeKeywords: ['advertisement', 'sponsored', 'promo', 'sale'],
        minScore: 0.3
      }
    };
    
    this.stats = {
      totalNavigations: 0,
      navigationsByType: {},
      lastNavigationTime: null,
      sessionStartTime: null,
      pagesVisited: 0,
      errors: 0
    };
    
    this.detectors = {
      adSense: adSenseDetector,
      navigation: navigationDetector,
      pagination: paginationDetector,
      keyword: keywordDetector
    };
    
    this.eventListeners = new Map();
    this.sessionTimer = null;
  }

  /**
   * Initialize navigation controller
   * @param {Object} config - Configuration object
   * @returns {Promise<boolean>} - Success status
   */
  async initialize(config = {}) {
    try {
      this.config = { ...this.config, ...config };
      
      // Validate configuration
      if (!this.validateConfig()) {
        logger.error('Invalid navigation controller configuration');
        return false;
      }
      
      // Initialize detectors
      await this.initializeDetectors();
      
      logger.info('Navigation controller initialized', { config: this.config });
      return true;
    } catch (error) {
      logger.error('Error initializing navigation controller', { error });
      return false;
    }
  }

  /**
   * Start navigation controller
   * @returns {Promise<boolean>} - Success status
   */
  async start() {
    try {
      if (this.isActive) {
        logger.warn('Navigation controller already active');
        return false;
      }

      this.isActive = true;
      this.stats.sessionStartTime = Date.now();
      
      // Start detectors
      await this.startDetectors();
      
      // Start session timer
      this.startSessionTimer();
      
      logger.info('Navigation controller started');
      return true;
    } catch (error) {
      logger.error('Error starting navigation controller', { error });
      return false;
    }
  }

  /**
   * Stop navigation controller
   * @returns {Promise<boolean>} - Success status
   */
  async stop() {
    try {
      if (!this.isActive) {
        logger.warn('Navigation controller not active');
        return false;
      }

      this.isActive = false;
      
      // Stop detectors
      await this.stopDetectors();
      
      // Stop session timer
      this.stopSessionTimer();
      
      logger.info('Navigation controller stopped');
      return true;
    } catch (error) {
      logger.error('Error stopping navigation controller', { error });
      return false;
    }
  }

  /**
   * Initialize detectors
   * @returns {Promise<boolean>} - Success status
   */
  async initializeDetectors() {
    try {
      // Initialize AdSense detector
      if (this.config.adSense?.enabled) {
        await this.detectors.adSense.initialize(this.config.adSense);
      }
      
      // Initialize navigation detector
      if (this.config.navigation?.enabled) {
        await this.detectors.navigation.initialize(this.config.navigation);
      }
      
      // Initialize pagination detector
      if (this.config.pagination?.enabled) {
        await this.detectors.pagination.initialize(this.config.pagination);
      }
      
      // Initialize keyword detector
      if (this.config.keyword?.enabled) {
        await this.detectors.keyword.initialize(this.config.keyword);
      }
      
      logger.info('Detectors initialized');
      return true;
    } catch (error) {
      logger.error('Error initializing detectors', { error });
      return false;
    }
  }

  /**
   * Start detectors
   * @returns {Promise<boolean>} - Success status
   */
  async startDetectors() {
    try {
      // Start AdSense detector
      if (this.config.adSense?.enabled) {
        await this.detectors.adSense.start();
      }
      
      // Start navigation detector
      if (this.config.navigation?.enabled) {
        await this.detectors.navigation.start();
      }
      
      // Start pagination detector
      if (this.config.pagination?.enabled) {
        await this.detectors.pagination.start();
      }
      
      // Start keyword detector
      if (this.config.keyword?.enabled) {
        await this.detectors.keyword.start();
      }
      
      logger.info('Detectors started');
      return true;
    } catch (error) {
      logger.error('Error starting detectors', { error });
      return false;
    }
  }

  /**
   * Stop detectors
   * @returns {Promise<boolean>} - Success status
   */
  async stopDetectors() {
    try {
      // Stop AdSense detector
      if (this.detectors.adSense.isActive) {
        await this.detectors.adSense.stop();
      }
      
      // Stop navigation detector
      if (this.detectors.navigation.isActive) {
        await this.detectors.navigation.stop();
      }
      
      // Stop pagination detector
      if (this.detectors.pagination.isActive) {
        await this.detectors.pagination.stop();
      }
      
      // Stop keyword detector
      if (this.detectors.keyword.isActive) {
        await this.detectors.keyword.stop();
      }
      
      logger.info('Detectors stopped');
      return true;
    } catch (error) {
      logger.error('Error stopping detectors', { error });
      return false;
    }
  }

  /**
   * Navigate to next page
   * @returns {Promise<boolean>} - Success status
   */
  async navigateToNext() {
    try {
      if (!this.isActive) {
        logger.warn('Navigation controller not active');
        return false;
      }
      
      // Check session limits
      if (this.stats.pagesVisited >= this.config.maxPagesPerSession) {
        logger.info('Maximum pages per session reached');
        return false;
      }
      
      // Get next page link
      const nextLink = this.detectors.navigation.getBestLinkOfType('next');
      if (!nextLink) {
        logger.warn('No next page link found');
        return false;
      }
      
      // Navigate to next page
      const success = await this.navigateToLink(nextLink);
      if (success) {
        this.stats.totalNavigations++;
        this.stats.navigationsByType.next = (this.stats.navigationsByType.next || 0) + 1;
        this.stats.lastNavigationTime = Date.now();
        this.stats.pagesVisited++;
      }
      
      return success;
    } catch (error) {
      logger.error('Error navigating to next page', { error });
      this.stats.errors++;
      return false;
    }
  }

  /**
   * Navigate to previous page
   * @returns {Promise<boolean>} - Success status
   */
  async navigateToPrevious() {
    try {
      if (!this.isActive) {
        logger.warn('Navigation controller not active');
        return false;
      }
      
      // Get previous page link
      const prevLink = this.detectors.navigation.getBestLinkOfType('previous');
      if (!prevLink) {
        logger.warn('No previous page link found');
        return false;
      }
      
      // Navigate to previous page
      const success = await this.navigateToLink(prevLink);
      if (success) {
        this.stats.totalNavigations++;
        this.stats.navigationsByType.previous = (this.stats.navigationsByType.previous || 0) + 1;
        this.stats.lastNavigationTime = Date.now();
        this.stats.pagesVisited++;
      }
      
      return success;
    } catch (error) {
      logger.error('Error navigating to previous page', { error });
      this.stats.errors++;
      return false;
    }
  }

  /**
   * Navigate to related page
   * @returns {Promise<boolean>} - Success status
   */
  async navigateToRelated() {
    try {
      if (!this.isActive) {
        logger.warn('Navigation controller not active');
        return false;
      }
      
      // Get related page links
      const relatedLinks = this.detectors.navigation.getLinksByType('related');
      if (relatedLinks.length === 0) {
        logger.warn('No related page links found');
        return false;
      }
      
      // Choose best related link
      const bestLink = relatedLinks.reduce((best, current) => 
        current.confidence > best.confidence ? current : best
      );
      
      // Navigate to related page
      const success = await this.navigateToLink(bestLink);
      if (success) {
        this.stats.totalNavigations++;
        this.stats.navigationsByType.related = (this.stats.navigationsByType.related || 0) + 1;
        this.stats.lastNavigationTime = Date.now();
        this.stats.pagesVisited++;
      }
      
      return success;
    } catch (error) {
      logger.error('Error navigating to related page', { error });
      this.stats.errors++;
      return false;
    }
  }

  /**
   * Navigate to recent page
   * @returns {Promise<boolean>} - Success status
   */
  async navigateToRecent() {
    try {
      if (!this.isActive) {
        logger.warn('Navigation controller not active');
        return false;
      }
      
      // Get recent page links
      const recentLinks = this.detectors.navigation.getLinksByType('recent');
      if (recentLinks.length === 0) {
        logger.warn('No recent page links found');
        return false;
      }
      
      // Choose best recent link
      const bestLink = recentLinks.reduce((best, current) => 
        current.confidence > best.confidence ? current : best
      );
      
      // Navigate to recent page
      const success = await this.navigateToLink(bestLink);
      if (success) {
        this.stats.totalNavigations++;
        this.stats.navigationsByType.recent = (this.stats.navigationsByType.recent || 0) + 1;
        this.stats.lastNavigationTime = Date.now();
        this.stats.pagesVisited++;
      }
      
      return success;
    } catch (error) {
      logger.error('Error navigating to recent page', { error });
      this.stats.errors++;
      return false;
    }
  }

  /**
   * Navigate to random page
   * @returns {Promise<boolean>} - Success status
   */
  async navigateToRandom() {
    try {
      if (!this.isActive) {
        logger.warn('Navigation controller not active');
        return false;
      }
      
      // Get all available links
      const allLinks = this.detectors.navigation.getDetectedLinks();
      if (allLinks.length === 0) {
        logger.warn('No navigation links found');
        return false;
      }
      
      // Choose random link
      const randomLink = choice(allLinks);
      
      // Navigate to random page
      const success = await this.navigateToLink(randomLink);
      if (success) {
        this.stats.totalNavigations++;
        this.stats.navigationsByType.random = (this.stats.navigationsByType.random || 0) + 1;
        this.stats.lastNavigationTime = Date.now();
        this.stats.pagesVisited++;
      }
      
      return success;
    } catch (error) {
      logger.error('Error navigating to random page', { error });
      this.stats.errors++;
      return false;
    }
  }

  /**
   * Navigate to link
   * @param {Object} link - Link object
   * @returns {Promise<boolean>} - Success status
   */
  async navigateToLink(link) {
    try {
      if (!link || !link.element) {
        logger.warn('Invalid link object');
        return false;
      }
      
      // Simulate hover
      await this.simulateHover(link.element);
      
      // Wait for hover delay
      const hoverDelay = randInt(
        this.config.hoverDelay.minMs,
        this.config.hoverDelay.maxMs
      );
      await this.sleep(hoverDelay);
      
      // Simulate click
      const clickSuccess = await this.simulateClick(link.element);
      if (!clickSuccess) {
        logger.warn('Failed to simulate click');
        return false;
      }
      
      // Wait for navigation delay
      const navigationDelay = randInt(
        this.config.navigationDelay.minMs,
        this.config.navigationDelay.maxMs
      );
      await this.sleep(navigationDelay);
      
      logger.info('Navigated to link', { 
        href: link.href, 
        text: link.text,
        type: link.type 
      });
      
      return true;
    } catch (error) {
      logger.error('Error navigating to link', { error });
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
   * Handle load more functionality
   * @returns {Promise<boolean>} - Success status
   */
  async handleLoadMore() {
    try {
      if (!this.isActive) {
        logger.warn('Navigation controller not active');
        return false;
      }
      
      // Get load more elements
      const loadMoreElements = this.detectors.pagination.getPaginationByType('loadMore');
      if (loadMoreElements.length === 0) {
        logger.warn('No load more elements found');
        return false;
      }
      
      // Choose best load more element
      const bestElement = loadMoreElements.reduce((best, current) => 
        current.confidence > best.confidence ? current : best
      );
      
      // Simulate hover and click
      await this.simulateHover(bestElement.element);
      
      const hoverDelay = randInt(
        this.config.hoverDelay.minMs,
        this.config.hoverDelay.maxMs
      );
      await this.sleep(hoverDelay);
      
      const clickSuccess = await this.simulateClick(bestElement.element);
      if (!clickSuccess) {
        logger.warn('Failed to simulate click on load more');
        return false;
      }
      
      logger.info('Load more triggered');
      return true;
    } catch (error) {
      logger.error('Error handling load more', { error });
      this.stats.errors++;
      return false;
    }
  }

  /**
   * Handle infinite scroll
   * @returns {Promise<boolean>} - Success status
   */
  async handleInfiniteScroll() {
    try {
      if (!this.isActive) {
        logger.warn('Navigation controller not active');
        return false;
      }
      
      // Check if we're near the bottom of the page
      const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
      const documentHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;
      
      const scrollPercentage = (scrollPosition + windowHeight) / documentHeight;
      
      if (scrollPercentage >= 0.8) {
        // Simulate scroll to trigger infinite scroll
        const scrollEvent = new Event('scroll', {
          bubbles: true,
          cancelable: true
        });
        
        window.dispatchEvent(scrollEvent);
        
        logger.info('Infinite scroll triggered');
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('Error handling infinite scroll', { error });
      this.stats.errors++;
      return false;
    }
  }

  /**
   * Start session timer
   */
  startSessionTimer() {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
    }
    
    this.sessionTimer = setTimeout(() => {
      if (this.isActive) {
        logger.info('Session timeout reached');
        this.emit('sessionTimeout');
      }
    }, this.config.sessionTimeout);
  }

  /**
   * Stop session timer
   */
  stopSessionTimer() {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
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
      config: this.config,
      detectors: {
        adSense: this.detectors.adSense.getStats(),
        navigation: this.detectors.navigation.getStats(),
        pagination: this.detectors.pagination.getStats(),
        keyword: this.detectors.keyword.getStats()
      }
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      totalNavigations: 0,
      navigationsByType: {},
      lastNavigationTime: null,
      sessionStartTime: null,
      pagesVisited: 0,
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
      logger.info('Navigation controller configuration updated', { config: this.config });
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
      if (this.config.maxPagesPerSession < 1) {
        logger.error('Max pages per session must be at least 1');
        return false;
      }
      
      if (this.config.sessionTimeout < 60000) {
        logger.error('Session timeout must be at least 1 minute');
        return false;
      }
      
      if (this.config.outboundChance < 0 || this.config.outboundChance > 1) {
        logger.error('Outbound chance must be between 0 and 1');
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
      this.resetStats();
      logger.info('Navigation controller cleaned up');
      return true;
    } catch (error) {
      logger.error('Error cleaning up navigation controller', { error });
      return false;
    }
  }
}

/**
 * Create navigation controller instance
 * @param {Object} config - Configuration object
 * @returns {NavigationController} - Controller instance
 */
export function createNavigationController(config = {}) {
  return new NavigationController(config);
}

/**
 * Default navigation controller instance
 */
export const navigationController = createNavigationController();
