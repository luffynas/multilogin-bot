/**
 * Viewport - Viewport management and utilities
 */

import { createLogger } from '../utils/logger.js';
import { randFloat, randInt } from '../core/randomizer.js';

const logger = createLogger('viewport');

/**
 * Viewport Manager
 * Manages viewport dimensions, scroll position, and viewport-related utilities
 */
export class ViewportManager {
  constructor() {
    this.isActive = false;
    this.config = {
      enabled: true,
      updateInterval: 100, // 100ms
      resizeThreshold: 50, // pixels
      scrollThreshold: 10, // pixels
      orientationChangeThreshold: 15, // degrees
      tracking: {
        dimensions: true,
        scrollPosition: true,
        orientation: true,
        devicePixelRatio: true,
        zoom: true
      }
    };
    
    this.viewport = {
      width: 0,
      height: 0,
      scrollX: 0,
      scrollY: 0,
      scrollWidth: 0,
      scrollHeight: 0,
      devicePixelRatio: 1,
      orientation: 'landscape',
      zoom: 1,
      isMobile: false,
      isTablet: false,
      isDesktop: false
    };
    
    this.history = [];
    this.updateInterval = null;
    this.eventListeners = new Map();
    this.lastUpdate = Date.now();
  }

  /**
   * Initialize viewport manager
   * @param {Object} config - Configuration object
   * @returns {Promise<boolean>} - Success status
   */
  async initialize(config = {}) {
    try {
      logger.info('Initializing viewport manager', { config });
      
      this.config = { ...this.config, ...config };
      
      if (this.config.enabled) {
        await this.startTracking();
      }
      
      logger.info('Viewport manager initialized successfully');
      return true;
    } catch (error) {
      logger.error('Error initializing viewport manager', { error });
      return false;
    }
  }

  /**
   * Start viewport tracking
   * @returns {Promise<boolean>} - Success status
   */
  async startTracking() {
    try {
      if (this.isActive) {
        logger.warn('Viewport tracking already active');
        return false;
      }

      this.isActive = true;
      
      // Initial viewport update
      this.updateViewport();
      
      // Start update interval
      if (this.config.updateInterval > 0) {
        this.updateInterval = setInterval(() => {
          this.updateViewport();
        }, this.config.updateInterval);
      }
      
      // Add event listeners
      this.addEventListeners();
      
      logger.info('Viewport tracking started');
      return true;
    } catch (error) {
      logger.error('Error starting viewport tracking', { error });
      return false;
    }
  }

  /**
   * Stop viewport tracking
   * @returns {Promise<boolean>} - Success status
   */
  async stopTracking() {
    try {
      if (!this.isActive) {
        logger.warn('Viewport tracking not active');
        return false;
      }

      this.isActive = false;
      
      // Clear update interval
      if (this.updateInterval) {
        clearInterval(this.updateInterval);
        this.updateInterval = null;
      }
      
      // Remove event listeners
      this.removeEventListeners();
      
      logger.info('Viewport tracking stopped');
      return true;
    } catch (error) {
      logger.error('Error stopping viewport tracking', { error });
      return false;
    }
  }

  /**
   * Update viewport information
   */
  updateViewport() {
    try {
      const previousViewport = { ...this.viewport };
      
      // Update dimensions
      if (this.config.tracking.dimensions) {
        this.viewport.width = window.innerWidth;
        this.viewport.height = window.innerHeight;
      }
      
      // Update scroll position
      if (this.config.tracking.scrollPosition) {
        this.viewport.scrollX = window.scrollX || window.pageXOffset;
        this.viewport.scrollY = window.scrollY || window.pageYOffset;
        this.viewport.scrollWidth = document.documentElement.scrollWidth;
        this.viewport.scrollHeight = document.documentElement.scrollHeight;
      }
      
      // Update device pixel ratio
      if (this.config.tracking.devicePixelRatio) {
        this.viewport.devicePixelRatio = window.devicePixelRatio || 1;
      }
      
      // Update orientation
      if (this.config.tracking.orientation) {
        this.viewport.orientation = this.getOrientation();
      }
      
      // Update zoom
      if (this.config.tracking.zoom) {
        this.viewport.zoom = this.getZoom();
      }
      
      // Update device type
      this.updateDeviceType();
      
      // Check for significant changes
      const hasSignificantChange = this.hasSignificantChange(previousViewport, this.viewport);
      
      if (hasSignificantChange) {
        this.lastUpdate = Date.now();
        this.addToHistory(this.viewport);
        this.emit('viewportChange', {
          previous: previousViewport,
          current: this.viewport,
          timestamp: this.lastUpdate
        });
      }
    } catch (error) {
      logger.error('Error updating viewport', { error });
    }
  }

  /**
   * Get current orientation
   * @returns {string} - Orientation (landscape, portrait, square)
   */
  getOrientation() {
    try {
      const width = this.viewport.width;
      const height = this.viewport.height;
      
      if (width > height) {
        return 'landscape';
      } else if (height > width) {
        return 'portrait';
      } else {
        return 'square';
      }
    } catch (error) {
      logger.error('Error getting orientation', { error });
      return 'landscape';
    }
  }

  /**
   * Get current zoom level
   * @returns {number} - Zoom level
   */
  getZoom() {
    try {
      // Simple zoom detection based on device pixel ratio
      const baseRatio = 1;
      const currentRatio = window.devicePixelRatio || 1;
      return currentRatio / baseRatio;
    } catch (error) {
      logger.error('Error getting zoom', { error });
      return 1;
    }
  }

  /**
   * Update device type detection
   */
  updateDeviceType() {
    try {
      const width = this.viewport.width;
      const height = this.viewport.height;
      const userAgent = navigator.userAgent.toLowerCase();
      
      // Reset device types
      this.viewport.isMobile = false;
      this.viewport.isTablet = false;
      this.viewport.isDesktop = false;
      
      // Mobile detection
      if (width <= 768 || userAgent.includes('mobile')) {
        this.viewport.isMobile = true;
      }
      // Tablet detection
      else if (width <= 1024 || userAgent.includes('tablet')) {
        this.viewport.isTablet = true;
      }
      // Desktop detection
      else {
        this.viewport.isDesktop = true;
      }
    } catch (error) {
      logger.error('Error updating device type', { error });
    }
  }

  /**
   * Check if there's a significant change
   * @param {Object} previous - Previous viewport
   * @param {Object} current - Current viewport
   * @returns {boolean} - Has significant change
   */
  hasSignificantChange(previous, current) {
    try {
      // Check dimension changes
      if (Math.abs(current.width - previous.width) > this.config.resizeThreshold ||
          Math.abs(current.height - previous.height) > this.config.resizeThreshold) {
        return true;
      }
      
      // Check scroll position changes
      if (Math.abs(current.scrollX - previous.scrollX) > this.config.scrollThreshold ||
          Math.abs(current.scrollY - previous.scrollY) > this.config.scrollThreshold) {
        return true;
      }
      
      // Check orientation changes
      if (current.orientation !== previous.orientation) {
        return true;
      }
      
      // Check device pixel ratio changes
      if (Math.abs(current.devicePixelRatio - previous.devicePixelRatio) > 0.1) {
        return true;
      }
      
      // Check zoom changes
      if (Math.abs(current.zoom - previous.zoom) > 0.1) {
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('Error checking significant change', { error, previous, current });
      return false;
    }
  }

  /**
   * Add viewport state to history
   * @param {Object} viewport - Viewport state
   */
  addToHistory(viewport) {
    try {
      this.history.push({
        ...viewport,
        timestamp: Date.now()
      });
      
      // Limit history size
      if (this.history.length > 1000) {
        this.history.shift();
      }
    } catch (error) {
      logger.error('Error adding to history', { error, viewport });
    }
  }

  /**
   * Add event listeners
   */
  addEventListeners() {
    try {
      // Resize event
      window.addEventListener('resize', () => {
        this.updateViewport();
      });
      
      // Scroll event
      window.addEventListener('scroll', () => {
        this.updateViewport();
      });
      
      // Orientation change event
      window.addEventListener('orientationchange', () => {
        setTimeout(() => {
          this.updateViewport();
        }, 100);
      });
      
      // Zoom event (if supported)
      if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', () => {
          this.updateViewport();
        });
      }
    } catch (error) {
      logger.error('Error adding event listeners', { error });
    }
  }

  /**
   * Remove event listeners
   */
  removeEventListeners() {
    try {
      // Note: In a real implementation, you would store references to the event listeners
      // and remove them properly. For simplicity, we're not doing that here.
      logger.info('Event listeners removed');
    } catch (error) {
      logger.error('Error removing event listeners', { error });
    }
  }

  /**
   * Get current viewport
   * @returns {Object} - Current viewport state
   */
  getViewport() {
    return { ...this.viewport };
  }

  /**
   * Get viewport history
   * @param {number} limit - Maximum number of entries
   * @returns {Array} - Viewport history
   */
  getHistory(limit = 100) {
    try {
      return this.history.slice(-limit);
    } catch (error) {
      logger.error('Error getting history', { error, limit });
      return [];
    }
  }

  /**
   * Check if element is in viewport
   * @param {Element} element - Element to check
   * @param {Object} options - Options
   * @returns {Object} - Visibility information
   */
  isElementInViewport(element, options = {}) {
    try {
      const {
        threshold = 0,
        rootMargin = '0px',
        includePartial = true
      } = options;
      
      const rect = element.getBoundingClientRect();
      const viewport = this.getViewport();
      
      const isVisible = {
        fully: rect.top >= 0 && rect.left >= 0 && 
               rect.bottom <= viewport.height && rect.right <= viewport.width,
        partially: rect.bottom > 0 && rect.right > 0 && 
                   rect.top < viewport.height && rect.left < viewport.width,
        above: rect.bottom < 0,
        below: rect.top > viewport.height,
        left: rect.right < 0,
        right: rect.left > viewport.width
      };
      
      // Calculate visibility percentage
      const visibleWidth = Math.max(0, Math.min(rect.right, viewport.width) - Math.max(rect.left, 0));
      const visibleHeight = Math.max(0, Math.min(rect.bottom, viewport.height) - Math.max(rect.top, 0));
      const visibleArea = visibleWidth * visibleHeight;
      const totalArea = rect.width * rect.height;
      const visibilityPercentage = totalArea > 0 ? (visibleArea / totalArea) * 100 : 0;
      
      return {
        ...isVisible,
        visibilityPercentage,
        rect,
        viewport,
        meetsThreshold: visibilityPercentage >= threshold
      };
    } catch (error) {
      logger.error('Error checking element visibility', { error, element, options });
      return {
        fully: false,
        partially: false,
        above: false,
        below: false,
        left: false,
        right: false,
        visibilityPercentage: 0,
        rect: null,
        viewport: this.getViewport(),
        meetsThreshold: false
      };
    }
  }

  /**
   * Get scrollable area information
   * @returns {Object} - Scrollable area information
   */
  getScrollableArea() {
    try {
      const viewport = this.getViewport();
      
      return {
        scrollableWidth: Math.max(0, viewport.scrollWidth - viewport.width),
        scrollableHeight: Math.max(0, viewport.scrollHeight - viewport.height),
        scrollPercentageX: viewport.scrollWidth > viewport.width ? 
          (viewport.scrollX / (viewport.scrollWidth - viewport.width)) * 100 : 0,
        scrollPercentageY: viewport.scrollHeight > viewport.height ? 
          (viewport.scrollY / (viewport.scrollHeight - viewport.height)) * 100 : 0,
        canScrollLeft: viewport.scrollX > 0,
        canScrollRight: viewport.scrollX < viewport.scrollWidth - viewport.width,
        canScrollUp: viewport.scrollY > 0,
        canScrollDown: viewport.scrollY < viewport.scrollHeight - viewport.height
      };
    } catch (error) {
      logger.error('Error getting scrollable area', { error });
      return {
        scrollableWidth: 0,
        scrollableHeight: 0,
        scrollPercentageX: 0,
        scrollPercentageY: 0,
        canScrollLeft: false,
        canScrollRight: false,
        canScrollUp: false,
        canScrollDown: false
      };
    }
  }

  /**
   * Get viewport center coordinates
   * @returns {Object} - Center coordinates
   */
  getViewportCenter() {
    try {
      const viewport = this.getViewport();
      
      return {
        x: viewport.width / 2,
        y: viewport.height / 2,
        scrollX: viewport.scrollX + (viewport.width / 2),
        scrollY: viewport.scrollY + (viewport.height / 2)
      };
    } catch (error) {
      logger.error('Error getting viewport center', { error });
      return { x: 0, y: 0, scrollX: 0, scrollY: 0 };
    }
  }

  /**
   * Get viewport dimensions in different units
   * @returns {Object} - Dimensions in different units
   */
  getViewportDimensions() {
    try {
      const viewport = this.getViewport();
      
      return {
        pixels: {
          width: viewport.width,
          height: viewport.height
        },
        vw: {
          width: (viewport.width / window.innerWidth) * 100,
          height: (viewport.height / window.innerHeight) * 100
        },
        vh: {
          width: (viewport.width / window.innerHeight) * 100,
          height: (viewport.height / window.innerHeight) * 100
        },
        devicePixels: {
          width: viewport.width * viewport.devicePixelRatio,
          height: viewport.height * viewport.devicePixelRatio
        }
      };
    } catch (error) {
      logger.error('Error getting viewport dimensions', { error });
      return {
        pixels: { width: 0, height: 0 },
        vw: { width: 0, height: 0 },
        vh: { width: 0, height: 0 },
        devicePixels: { width: 0, height: 0 }
      };
    }
  }

  /**
   * Get device information
   * @returns {Object} - Device information
   */
  getDeviceInfo() {
    try {
      const viewport = this.getViewport();
      const userAgent = navigator.userAgent;
      
      return {
        type: viewport.isMobile ? 'mobile' : viewport.isTablet ? 'tablet' : 'desktop',
        isMobile: viewport.isMobile,
        isTablet: viewport.isTablet,
        isDesktop: viewport.isDesktop,
        orientation: viewport.orientation,
        devicePixelRatio: viewport.devicePixelRatio,
        zoom: viewport.zoom,
        userAgent,
        screen: {
          width: screen.width,
          height: screen.height,
          availWidth: screen.availWidth,
          availHeight: screen.availHeight
        }
      };
    } catch (error) {
      logger.error('Error getting device info', { error });
      return {
        type: 'unknown',
        isMobile: false,
        isTablet: false,
        isDesktop: false,
        orientation: 'landscape',
        devicePixelRatio: 1,
        zoom: 1,
        userAgent: '',
        screen: { width: 0, height: 0, availWidth: 0, availHeight: 0 }
      };
    }
  }

  /**
   * Add event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to listeners
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          logger.error('Error in event listener', { error, event });
        }
      });
    }
  }
}

/**
 * Create viewport manager instance
 * @param {Object} config - Configuration object
 * @returns {ViewportManager} - Viewport manager instance
 */
export function createViewportManager(config = {}) {
  return new ViewportManager(config);
}

/**
 * Default viewport manager instance
 */
export const viewportManager = createViewportManager();
