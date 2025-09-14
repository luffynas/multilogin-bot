/**
 * Debug Overlay - Real-time debug information display
 */

import { createLogger } from '../utils/logger.js';

const logger = createLogger('debug-overlay');

/**
 * Debug Overlay
 * Displays real-time debug information on the page
 */
export class DebugOverlay {
  constructor() {
    this.isActive = false;
    this.overlay = null;
    this.config = {
      enabled: false,
      position: 'top-right',
      opacity: 0.8,
      fontSize: '12px',
      fontFamily: 'monospace',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      textColor: '#00ff00',
      borderColor: '#00ff00',
      updateInterval: 1000, // 1 second
      maxLines: 20,
      showTimestamp: true,
      showModule: true,
      showLevel: true,
      autoHide: false,
      autoHideDelay: 5000
    };
    
    this.debugData = {
      engine: {},
      stealth: {},
      navigation: {},
      analytics: {},
      performance: {},
      errors: []
    };
    
    this.updateInterval = null;
    this.eventListeners = new Map();
  }

  /**
   * Initialize debug overlay
   * @param {Object} config - Configuration object
   * @returns {Promise<boolean>} - Success status
   */
  async initialize(config = {}) {
    try {
      logger.info('Initializing debug overlay', { config });
      
      this.config = { ...this.config, ...config };
      
      if (this.config.enabled) {
        await this.createOverlay();
        await this.startUpdates();
      }
      
      logger.info('Debug overlay initialized successfully');
      return true;
    } catch (error) {
      logger.error('Error initializing debug overlay', { error });
      return false;
    }
  }

  /**
   * Create debug overlay element
   * @returns {Promise<boolean>} - Success status
   */
  async createOverlay() {
    try {
      // Remove existing overlay if any
      if (this.overlay) {
        this.overlay.remove();
      }
      
      // Create overlay element
      this.overlay = document.createElement('div');
      this.overlay.id = 'autoscroll-debug-overlay';
      this.overlay.className = 'autoscroll-debug-overlay';
      
      // Apply styles
      this.applyStyles();
      
      // Create content structure
      this.createContentStructure();
      
      // Add to page
      document.body.appendChild(this.overlay);
      
      // Add event listeners
      this.addEventListeners();
      
      logger.info('Debug overlay created');
      return true;
    } catch (error) {
      logger.error('Error creating debug overlay', { error });
      return false;
    }
  }

  /**
   * Apply styles to overlay
   */
  applyStyles() {
    try {
      const styles = {
        position: 'fixed',
        top: this.config.position.includes('top') ? '10px' : 'auto',
        bottom: this.config.position.includes('bottom') ? '10px' : 'auto',
        left: this.config.position.includes('left') ? '10px' : 'auto',
        right: this.config.position.includes('right') ? '10px' : 'auto',
        width: '300px',
        maxHeight: '400px',
        backgroundColor: this.config.backgroundColor,
        color: this.config.textColor,
        border: `1px solid ${this.config.borderColor}`,
        borderRadius: '5px',
        padding: '10px',
        fontSize: this.config.fontSize,
        fontFamily: this.config.fontFamily,
        opacity: this.config.opacity,
        zIndex: '999999',
        overflow: 'auto',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
        userSelect: 'text',
        cursor: 'default'
      };
      
      Object.assign(this.overlay.style, styles);
      
      // Add CSS class for additional styling
      this.overlay.classList.add('autoscroll-debug-overlay');
    } catch (error) {
      logger.error('Error applying styles', { error });
    }
  }

  /**
   * Create content structure
   */
  createContentStructure() {
    try {
      // Create header
      const header = document.createElement('div');
      header.className = 'debug-header';
      header.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <span style="font-weight: bold; color: #00ff00;">AutoScroll Debug</span>
          <button id="debug-toggle" style="background: none; border: 1px solid #00ff00; color: #00ff00; padding: 2px 6px; cursor: pointer; font-size: 10px;">Hide</button>
        </div>
      `;
      
      // Create content sections
      const content = document.createElement('div');
      content.className = 'debug-content';
      content.innerHTML = `
        <div class="debug-section" data-section="engine">
          <div class="section-header">Engine Status</div>
          <div class="section-content" id="engine-content"></div>
        </div>
        
        <div class="debug-section" data-section="stealth">
          <div class="section-header">Stealth Status</div>
          <div class="section-content" id="stealth-content"></div>
        </div>
        
        <div class="debug-section" data-section="navigation">
          <div class="section-header">Navigation Status</div>
          <div class="section-content" id="navigation-content"></div>
        </div>
        
        <div class="debug-section" data-section="analytics">
          <div class="section-header">Analytics Status</div>
          <div class="section-content" id="analytics-content"></div>
        </div>
        
        <div class="debug-section" data-section="performance">
          <div class="section-header">Performance</div>
          <div class="section-content" id="performance-content"></div>
        </div>
        
        <div class="debug-section" data-section="errors">
          <div class="section-header">Recent Errors</div>
          <div class="section-content" id="errors-content"></div>
        </div>
      `;
      
      // Apply section styles
      this.applySectionStyles();
      
      // Append to overlay
      this.overlay.appendChild(header);
      this.overlay.appendChild(content);
    } catch (error) {
      logger.error('Error creating content structure', { error });
    }
  }

  /**
   * Apply section styles
   */
  applySectionStyles() {
    try {
      const style = document.createElement('style');
      style.textContent = `
        .autoscroll-debug-overlay .debug-section {
          margin-bottom: 10px;
          border-bottom: 1px solid #333;
          padding-bottom: 5px;
        }
        
        .autoscroll-debug-overlay .section-header {
          font-weight: bold;
          color: #00ff00;
          margin-bottom: 5px;
          font-size: 11px;
        }
        
        .autoscroll-debug-overlay .section-content {
          font-size: 10px;
          line-height: 1.2;
          color: #cccccc;
        }
        
        .autoscroll-debug-overlay .debug-line {
          margin-bottom: 2px;
          word-break: break-all;
        }
        
        .autoscroll-debug-overlay .debug-timestamp {
          color: #666;
          font-size: 9px;
        }
        
        .autoscroll-debug-overlay .debug-module {
          color: #ffaa00;
          font-weight: bold;
        }
        
        .autoscroll-debug-overlay .debug-level {
          color: #ff6666;
          font-weight: bold;
        }
        
        .autoscroll-debug-overlay .debug-value {
          color: #66ff66;
        }
        
        .autoscroll-debug-overlay .debug-error {
          color: #ff6666;
          background: rgba(255, 102, 102, 0.1);
          padding: 2px;
          border-radius: 2px;
        }
        
        .autoscroll-debug-overlay .debug-warning {
          color: #ffaa00;
          background: rgba(255, 170, 0, 0.1);
          padding: 2px;
          border-radius: 2px;
        }
        
        .autoscroll-debug-overlay .debug-info {
          color: #66aaff;
          background: rgba(102, 170, 255, 0.1);
          padding: 2px;
          border-radius: 2px;
        }
      `;
      
      document.head.appendChild(style);
    } catch (error) {
      logger.error('Error applying section styles', { error });
    }
  }

  /**
   * Add event listeners
   */
  addEventListeners() {
    try {
      // Toggle button
      const toggleButton = this.overlay.querySelector('#debug-toggle');
      if (toggleButton) {
        toggleButton.addEventListener('click', () => {
          this.toggleVisibility();
        });
      }
      
      // Auto-hide functionality
      if (this.config.autoHide) {
        this.overlay.addEventListener('mouseenter', () => {
          this.clearAutoHide();
        });
        
        this.overlay.addEventListener('mouseleave', () => {
          this.setAutoHide();
        });
      }
    } catch (error) {
      logger.error('Error adding event listeners', { error });
    }
  }

  /**
   * Start debug updates
   * @returns {Promise<boolean>} - Success status
   */
  async startUpdates() {
    try {
      if (this.updateInterval) {
        clearInterval(this.updateInterval);
      }
      
      this.updateInterval = setInterval(() => {
        this.updateDebugInfo();
      }, this.config.updateInterval);
      
      // Initial update
      this.updateDebugInfo();
      
      logger.info('Debug updates started');
      return true;
    } catch (error) {
      logger.error('Error starting debug updates', { error });
      return false;
    }
  }

  /**
   * Stop debug updates
   * @returns {Promise<boolean>} - Success status
   */
  async stopUpdates() {
    try {
      if (this.updateInterval) {
        clearInterval(this.updateInterval);
        this.updateInterval = null;
      }
      
      logger.info('Debug updates stopped');
      return true;
    } catch (error) {
      logger.error('Error stopping debug updates', { error });
      return false;
    }
  }

  /**
   * Update debug information
   */
  updateDebugInfo() {
    try {
      if (!this.overlay) return;
      
      // Update each section
      this.updateEngineInfo();
      this.updateStealthInfo();
      this.updateNavigationInfo();
      this.updateAnalyticsInfo();
      this.updatePerformanceInfo();
      this.updateErrorsInfo();
    } catch (error) {
      logger.error('Error updating debug info', { error });
    }
  }

  /**
   * Update engine information
   */
  updateEngineInfo() {
    try {
      const content = this.overlay.querySelector('#engine-content');
      if (!content) return;
      
      const engineData = this.debugData.engine;
      const lines = [
        `Status: ${engineData.status || 'Unknown'}`,
        `Active: ${engineData.active || false}`,
        `Current Strategy: ${engineData.strategy || 'None'}`,
        `Scroll Position: ${engineData.scrollPosition || 0}`,
        `Total Distance: ${engineData.totalDistance || 0}`,
        `Steps: ${engineData.steps || 0}`,
        `Speed: ${engineData.speed || 0}`,
        `Paused: ${engineData.paused || false}`
      ];
      
      content.innerHTML = lines.map(line => `<div class="debug-line">${line}</div>`).join('');
    } catch (error) {
      logger.error('Error updating engine info', { error });
    }
  }

  /**
   * Update stealth information
   */
  updateStealthInfo() {
    try {
      const content = this.overlay.querySelector('#stealth-content');
      if (!content) return;
      
      const stealthData = this.debugData.stealth;
      const lines = [
        `Active: ${stealthData.active || false}`,
        `Noise Events: ${stealthData.noiseEvents || 0}`,
        `Cursor Movements: ${stealthData.cursorMovements || 0}`,
        `Gesture Events: ${stealthData.gestureEvents || 0}`,
        `Dwell Time: ${stealthData.dwellTime || 0}`,
        `Error Simulations: ${stealthData.errorSimulations || 0}`,
        `Fingerprint Variations: ${stealthData.fingerprintVariations || 0}`,
        `Tab Awareness: ${stealthData.tabAwareness || false}`
      ];
      
      content.innerHTML = lines.map(line => `<div class="debug-line">${line}</div>`).join('');
    } catch (error) {
      logger.error('Error updating stealth info', { error });
    }
  }

  /**
   * Update navigation information
   */
  updateNavigationInfo() {
    try {
      const content = this.overlay.querySelector('#navigation-content');
      if (!content) return;
      
      const navData = this.debugData.navigation;
      const lines = [
        `Active: ${navData.active || false}`,
        `Total Navigations: ${navData.totalNavigations || 0}`,
        `Next: ${navData.next || 0}`,
        `Previous: ${navData.previous || 0}`,
        `Related: ${navData.related || 0}`,
        `Recent: ${navData.recent || 0}`,
        `Outbound: ${navData.outbound || 0}`,
        `Current Page: ${navData.currentPage || 'Unknown'}`
      ];
      
      content.innerHTML = lines.map(line => `<div class="debug-line">${line}</div>`).join('');
    } catch (error) {
      logger.error('Error updating navigation info', { error });
    }
  }

  /**
   * Update analytics information
   */
  updateAnalyticsInfo() {
    try {
      const content = this.overlay.querySelector('#analytics-content');
      if (!content) return;
      
      const analyticsData = this.debugData.analytics;
      const lines = [
        `Session Duration: ${analyticsData.sessionDuration || 0}`,
        `Pages Visited: ${analyticsData.pagesVisited || 0}`,
        `Total Events: ${analyticsData.totalEvents || 0}`,
        `Scroll Events: ${analyticsData.scrollEvents || 0}`,
        `Navigation Events: ${analyticsData.navigationEvents || 0}`,
        `Stealth Events: ${analyticsData.stealthEvents || 0}`,
        `Behavior Score: ${analyticsData.behaviorScore || 0}`,
        `Efficiency: ${analyticsData.efficiency || 0}`
      ];
      
      content.innerHTML = lines.map(line => `<div class="debug-line">${line}</div>`).join('');
    } catch (error) {
      logger.error('Error updating analytics info', { error });
    }
  }

  /**
   * Update performance information
   */
  updatePerformanceInfo() {
    try {
      const content = this.overlay.querySelector('#performance-content');
      if (!content) return;
      
      const perfData = this.debugData.performance;
      const lines = [
        `Memory Usage: ${perfData.memoryUsage || 0} MB`,
        `CPU Usage: ${perfData.cpuUsage || 0}%`,
        `Response Time: ${perfData.responseTime || 0}ms`,
        `Error Rate: ${perfData.errorRate || 0}%`,
        `Success Rate: ${perfData.successRate || 0}%`,
        `FPS: ${perfData.fps || 0}`,
        `Load Time: ${perfData.loadTime || 0}ms`,
        `Last Update: ${new Date().toLocaleTimeString()}`
      ];
      
      content.innerHTML = lines.map(line => `<div class="debug-line">${line}</div>`).join('');
    } catch (error) {
      logger.error('Error updating performance info', { error });
    }
  }

  /**
   * Update errors information
   */
  updateErrorsInfo() {
    try {
      const content = this.overlay.querySelector('#errors-content');
      if (!content) return;
      
      const errors = this.debugData.errors.slice(-this.config.maxLines);
      const lines = errors.map(error => {
        const timestamp = this.config.showTimestamp ? 
          `<span class="debug-timestamp">[${new Date(error.timestamp).toLocaleTimeString()}]</span> ` : '';
        const module = this.config.showModule ? 
          `<span class="debug-module">[${error.module}]</span> ` : '';
        const level = this.config.showLevel ? 
          `<span class="debug-level">[${error.level}]</span> ` : '';
        
        return `<div class="debug-line debug-${error.level}">${timestamp}${module}${level}${error.message}</div>`;
      });
      
      content.innerHTML = lines.join('');
    } catch (error) {
      logger.error('Error updating errors info', { error });
    }
  }

  /**
   * Update debug data
   * @param {string} section - Section name
   * @param {Object} data - Debug data
   */
  updateDebugData(section, data) {
    try {
      if (this.debugData[section]) {
        this.debugData[section] = { ...this.debugData[section], ...data };
      } else {
        this.debugData[section] = data;
      }
    } catch (error) {
      logger.error('Error updating debug data', { error, section, data });
    }
  }

  /**
   * Add error to debug data
   * @param {Object} error - Error object
   */
  addError(error) {
    try {
      this.debugData.errors.push({
        ...error,
        timestamp: Date.now()
      });
      
      // Limit errors array size
      if (this.debugData.errors.length > this.config.maxLines * 2) {
        this.debugData.errors.shift();
      }
    } catch (error) {
      logger.error('Error adding error to debug data', { error });
    }
  }

  /**
   * Toggle overlay visibility
   */
  toggleVisibility() {
    try {
      if (this.overlay) {
        const isVisible = this.overlay.style.display !== 'none';
        this.overlay.style.display = isVisible ? 'none' : 'block';
        
        const toggleButton = this.overlay.querySelector('#debug-toggle');
        if (toggleButton) {
          toggleButton.textContent = isVisible ? 'Show' : 'Hide';
        }
      }
    } catch (error) {
      logger.error('Error toggling visibility', { error });
    }
  }

  /**
   * Set auto-hide timer
   */
  setAutoHide() {
    try {
      if (this.autoHideTimer) {
        clearTimeout(this.autoHideTimer);
      }
      
      this.autoHideTimer = setTimeout(() => {
        this.toggleVisibility();
      }, this.config.autoHideDelay);
    } catch (error) {
      logger.error('Error setting auto-hide', { error });
    }
  }

  /**
   * Clear auto-hide timer
   */
  clearAutoHide() {
    try {
      if (this.autoHideTimer) {
        clearTimeout(this.autoHideTimer);
        this.autoHideTimer = null;
      }
    } catch (error) {
      logger.error('Error clearing auto-hide', { error });
    }
  }

  /**
   * Show debug overlay
   * @returns {Promise<boolean>} - Success status
   */
  async show() {
    try {
      if (this.overlay) {
        this.overlay.style.display = 'block';
        this.isActive = true;
        
        if (!this.updateInterval) {
          await this.startUpdates();
        }
        
        logger.info('Debug overlay shown');
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('Error showing debug overlay', { error });
      return false;
    }
  }

  /**
   * Hide debug overlay
   * @returns {Promise<boolean>} - Success status
   */
  async hide() {
    try {
      if (this.overlay) {
        this.overlay.style.display = 'none';
        this.isActive = false;
        
        if (this.updateInterval) {
          await this.stopUpdates();
        }
        
        logger.info('Debug overlay hidden');
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('Error hiding debug overlay', { error });
      return false;
    }
  }

  /**
   * Remove debug overlay
   * @returns {Promise<boolean>} - Success status
   */
  async remove() {
    try {
      if (this.overlay) {
        await this.stopUpdates();
        this.overlay.remove();
        this.overlay = null;
        this.isActive = false;
        
        logger.info('Debug overlay removed');
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('Error removing debug overlay', { error });
      return false;
    }
  }

  /**
   * Get debug data
   * @returns {Object} - Debug data
   */
  getDebugData() {
    return { ...this.debugData };
  }

  /**
   * Clear debug data
   * @returns {Promise<boolean>} - Success status
   */
  async clearDebugData() {
    try {
      this.debugData = {
        engine: {},
        stealth: {},
        navigation: {},
        analytics: {},
        performance: {},
        errors: []
      };
      
      logger.info('Debug data cleared');
      return true;
    } catch (error) {
      logger.error('Error clearing debug data', { error });
      return false;
    }
  }
}

/**
 * Create debug overlay instance
 * @param {Object} config - Configuration object
 * @returns {DebugOverlay} - Debug overlay instance
 */
export function createDebugOverlay(config = {}) {
  return new DebugOverlay(config);
}

/**
 * Default debug overlay instance
 */
export const debugOverlay = createDebugOverlay();
