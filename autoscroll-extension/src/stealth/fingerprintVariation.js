/**
 * Fingerprint variation for anti-detection and browser fingerprinting protection
 */

import { createLogger } from '@utils/logger.js';
import { randFloat, randInt, choice, jitter } from '@core/randomizer.js';
import { delay } from '@utils/time.js';

const logger = createLogger('fingerprint-variation');

/**
 * Fingerprint Variation
 * Provides anti-detection through browser fingerprint variation
 */
export class FingerprintVariation {
  constructor() {
    this.isActive = false;
    this.config = {
      enabled: true,
      variationTypes: ['userAgent', 'timezone', 'language', 'screen', 'plugins', 'fonts'],
      currentType: 'userAgent',
      userAgent: {
        enabled: true,
        variationRate: 0.1,
        userAgents: [
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0',
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:119.0) Gecko/20100101 Firefox/119.0',
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:120.0) Gecko/20100101 Firefox/120.0',
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:119.0) Gecko/20100101 Firefox/119.0'
        ]
      },
      timezone: {
        enabled: true,
        variationRate: 0.05,
        timezones: [
          'America/New_York',
          'America/Chicago',
          'America/Denver',
          'America/Los_Angeles',
          'Europe/London',
          'Europe/Paris',
          'Europe/Berlin',
          'Asia/Tokyo',
          'Asia/Shanghai',
          'Australia/Sydney'
        ]
      },
      language: {
        enabled: true,
        variationRate: 0.03,
        languages: [
          'en-US',
          'en-GB',
          'en-CA',
          'en-AU',
          'es-US',
          'es-ES',
          'fr-FR',
          'fr-CA',
          'de-DE',
          'it-IT',
          'pt-BR',
          'pt-PT',
          'ja-JP',
          'ko-KR',
          'zh-CN',
          'zh-TW'
        ]
      },
      screen: {
        enabled: true,
        variationRate: 0.02,
        resolutions: [
          { width: 1920, height: 1080 },
          { width: 1366, height: 768 },
          { width: 1536, height: 864 },
          { width: 1440, height: 900 },
          { width: 1280, height: 720 },
          { width: 1600, height: 900 },
          { width: 2560, height: 1440 },
          { width: 3840, height: 2160 }
        ]
      },
      plugins: {
        enabled: true,
        variationRate: 0.01,
        pluginSets: [
          ['Chrome PDF Plugin', 'Chrome PDF Viewer', 'Native Client'],
          ['Chrome PDF Plugin', 'Chrome PDF Viewer', 'Native Client', 'WebKit built-in PDF'],
          ['Chrome PDF Plugin', 'Chrome PDF Viewer', 'Native Client', 'WebKit built-in PDF', 'Microsoft Edge PDF Viewer'],
          ['Chrome PDF Plugin', 'Chrome PDF Viewer', 'Native Client', 'WebKit built-in PDF', 'Microsoft Edge PDF Viewer', 'PDF.js']
        ]
      },
      fonts: {
        enabled: true,
        variationRate: 0.01,
        fontSets: [
          ['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana'],
          ['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana', 'Georgia'],
          ['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana', 'Georgia', 'Palatino'],
          ['Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana', 'Georgia', 'Palatino', 'Garamond']
        ]
      },
      behavior: {
        humanVariation: true,
        sessionBased: true,
        timeBased: true,
        contextAware: true,
        gradualChange: true,
        changeRate: 0.1
      },
      patterns: {
        morning: {
          variationRate: 0.8,
          changeFrequency: 0.5
        },
        afternoon: {
          variationRate: 1.0,
          changeFrequency: 1.0
        },
        evening: {
          variationRate: 1.2,
          changeFrequency: 1.5
        },
        night: {
          variationRate: 1.5,
          changeFrequency: 2.0
        }
      }
    };
    
    this.stats = {
      totalVariations: 0,
      variationsByType: {},
      lastVariationTime: null,
      currentFingerprint: {},
      fingerprintHistory: []
    };
    
    this.isVariating = false;
    this.variationTimeout = null;
    this.originalValues = new Map();
    this.eventListeners = new Map();
  }

  /**
   * Initialize fingerprint variation
   * @param {Object} config - Configuration object
   * @returns {Promise<boolean>} - Success status
   */
  async initialize(config = {}) {
    try {
      this.config = { ...this.config, ...config };
      
      // Validate configuration
      if (!this.validateConfig()) {
        logger.error('Invalid fingerprint variation configuration');
        return false;
      }
      
      // Store original values
      this.storeOriginalValues();
      
      logger.info('Fingerprint variation initialized', { config: this.config });
      return true;
    } catch (error) {
      logger.error('Error initializing fingerprint variation', { error });
      return false;
    }
  }

  /**
   * Start fingerprint variation
   * @returns {Promise<boolean>} - Success status
   */
  async start() {
    try {
      if (this.isActive) {
        logger.warn('Fingerprint variation already active');
        return false;
      }

      this.isActive = true;
      
      // Apply initial variations
      await this.applyInitialVariations();
      
      // Start periodic variations
      this.startPeriodicVariations();
      
      logger.info('Fingerprint variation started');
      return true;
    } catch (error) {
      logger.error('Error starting fingerprint variation', { error });
      return false;
    }
  }

  /**
   * Stop fingerprint variation
   * @returns {Promise<boolean>} - Success status
   */
  async stop() {
    try {
      if (!this.isActive) {
        logger.warn('Fingerprint variation not active');
        return false;
      }

      this.isActive = false;
      
      // Stop periodic variations
      this.stopPeriodicVariations();
      
      // Restore original values
      this.restoreOriginalValues();
      
      logger.info('Fingerprint variation stopped');
      return true;
    } catch (error) {
      logger.error('Error stopping fingerprint variation', { error });
      return false;
    }
  }

  /**
   * Store original values
   */
  storeOriginalValues() {
    try {
      // Store original user agent
      this.originalValues.set('userAgent', navigator.userAgent);
      
      // Store original timezone
      this.originalValues.set('timezone', Intl.DateTimeFormat().resolvedOptions().timeZone);
      
      // Store original language
      this.originalValues.set('language', navigator.language);
      this.originalValues.set('languages', navigator.languages);
      
      // Store original screen properties
      this.originalValues.set('screenWidth', screen.width);
      this.originalValues.set('screenHeight', screen.height);
      this.originalValues.set('screenAvailWidth', screen.availWidth);
      this.originalValues.set('screenAvailHeight', screen.availHeight);
      this.originalValues.set('screenColorDepth', screen.colorDepth);
      this.originalValues.set('screenPixelDepth', screen.pixelDepth);
      
      // Store original plugins
      this.originalValues.set('plugins', Array.from(navigator.plugins).map(p => p.name));
      
      // Store original fonts
      this.originalValues.set('fonts', this.detectFonts());
      
      logger.debug('Original values stored');
    } catch (error) {
      logger.error('Error storing original values', { error });
    }
  }

  /**
   * Restore original values
   */
  restoreOriginalValues() {
    try {
      // Restore original user agent
      if (this.originalValues.has('userAgent')) {
        Object.defineProperty(navigator, 'userAgent', {
          value: this.originalValues.get('userAgent'),
          writable: false
        });
      }
      
      // Restore original timezone
      if (this.originalValues.has('timezone')) {
        // Timezone restoration is complex and may not be fully possible
        logger.debug('Timezone restoration attempted');
      }
      
      // Restore original language
      if (this.originalValues.has('language')) {
        Object.defineProperty(navigator, 'language', {
          value: this.originalValues.get('language'),
          writable: false
        });
      }
      
      if (this.originalValues.has('languages')) {
        Object.defineProperty(navigator, 'languages', {
          value: this.originalValues.get('languages'),
          writable: false
        });
      }
      
      // Restore original screen properties
      if (this.originalValues.has('screenWidth')) {
        Object.defineProperty(screen, 'width', {
          value: this.originalValues.get('screenWidth'),
          writable: false
        });
      }
      
      if (this.originalValues.has('screenHeight')) {
        Object.defineProperty(screen, 'height', {
          value: this.originalValues.get('screenHeight'),
          writable: false
        });
      }
      
      // Restore original plugins
      if (this.originalValues.has('plugins')) {
        // Plugin restoration is complex and may not be fully possible
        logger.debug('Plugin restoration attempted');
      }
      
      // Restore original fonts
      if (this.originalValues.has('fonts')) {
        // Font restoration is complex and may not be fully possible
        logger.debug('Font restoration attempted');
      }
      
      logger.debug('Original values restored');
    } catch (error) {
      logger.error('Error restoring original values', { error });
    }
  }

  /**
   * Apply initial variations
   * @returns {Promise<void>} - Promise that resolves when variations are applied
   */
  async applyInitialVariations() {
    try {
      // Apply user agent variation
      if (this.config.userAgent.enabled) {
        await this.varyUserAgent();
      }
      
      // Apply timezone variation
      if (this.config.timezone.enabled) {
        await this.varyTimezone();
      }
      
      // Apply language variation
      if (this.config.language.enabled) {
        await this.varyLanguage();
      }
      
      // Apply screen variation
      if (this.config.screen.enabled) {
        await this.varyScreen();
      }
      
      // Apply plugin variation
      if (this.config.plugins.enabled) {
        await this.varyPlugins();
      }
      
      // Apply font variation
      if (this.config.fonts.enabled) {
        await this.varyFonts();
      }
      
      logger.debug('Initial variations applied');
    } catch (error) {
      logger.error('Error applying initial variations', { error });
    }
  }

  /**
   * Vary user agent
   * @returns {Promise<void>} - Promise that resolves when user agent is varied
   */
  async varyUserAgent() {
    try {
      const config = this.config.userAgent;
      
      if (Math.random() > config.variationRate) {
        return;
      }
      
      const newUserAgent = choice(config.userAgents);
      
      // Override navigator.userAgent
      Object.defineProperty(navigator, 'userAgent', {
        value: newUserAgent,
        writable: false
      });
      
      this.stats.currentFingerprint.userAgent = newUserAgent;
      this.stats.variationsByType.userAgent = (this.stats.variationsByType.userAgent || 0) + 1;
      
      logger.debug('User agent varied', { newUserAgent });
    } catch (error) {
      logger.error('Error varying user agent', { error });
    }
  }

  /**
   * Vary timezone
   * @returns {Promise<void>} - Promise that resolves when timezone is varied
   */
  async varyTimezone() {
    try {
      const config = this.config.timezone;
      
      if (Math.random() > config.variationRate) {
        return;
      }
      
      const newTimezone = choice(config.timezones);
      
      // Override timezone-related methods
      const originalDateTimeFormat = Intl.DateTimeFormat;
      Intl.DateTimeFormat = function(...args) {
        const options = args[1] || {};
        options.timeZone = newTimezone;
        return new originalDateTimeFormat(args[0], options);
      };
      
      this.stats.currentFingerprint.timezone = newTimezone;
      this.stats.variationsByType.timezone = (this.stats.variationsByType.timezone || 0) + 1;
      
      logger.debug('Timezone varied', { newTimezone });
    } catch (error) {
      logger.error('Error varying timezone', { error });
    }
  }

  /**
   * Vary language
   * @returns {Promise<void>} - Promise that resolves when language is varied
   */
  async varyLanguage() {
    try {
      const config = this.config.language;
      
      if (Math.random() > config.variationRate) {
        return;
      }
      
      const newLanguage = choice(config.languages);
      const newLanguages = [newLanguage, 'en-US', 'en'];
      
      // Override navigator.language
      Object.defineProperty(navigator, 'language', {
        value: newLanguage,
        writable: false
      });
      
      // Override navigator.languages
      Object.defineProperty(navigator, 'languages', {
        value: newLanguages,
        writable: false
      });
      
      this.stats.currentFingerprint.language = newLanguage;
      this.stats.currentFingerprint.languages = newLanguages;
      this.stats.variationsByType.language = (this.stats.variationsByType.language || 0) + 1;
      
      logger.debug('Language varied', { newLanguage, newLanguages });
    } catch (error) {
      logger.error('Error varying language', { error });
    }
  }

  /**
   * Vary screen properties
   * @returns {Promise<void>} - Promise that resolves when screen is varied
   */
  async varyScreen() {
    try {
      const config = this.config.screen;
      
      if (Math.random() > config.variationRate) {
        return;
      }
      
      const newResolution = choice(config.resolutions);
      
      // Override screen properties
      Object.defineProperty(screen, 'width', {
        value: newResolution.width,
        writable: false
      });
      
      Object.defineProperty(screen, 'height', {
        value: newResolution.height,
        writable: false
      });
      
      Object.defineProperty(screen, 'availWidth', {
        value: newResolution.width,
        writable: false
      });
      
      Object.defineProperty(screen, 'availHeight', {
        value: newResolution.height - 40, // Account for taskbar
        writable: false
      });
      
      this.stats.currentFingerprint.screen = newResolution;
      this.stats.variationsByType.screen = (this.stats.variationsByType.screen || 0) + 1;
      
      logger.debug('Screen varied', { newResolution });
    } catch (error) {
      logger.error('Error varying screen', { error });
    }
  }

  /**
   * Vary plugins
   * @returns {Promise<void>} - Promise that resolves when plugins are varied
   */
  async varyPlugins() {
    try {
      const config = this.config.plugins;
      
      if (Math.random() > config.variationRate) {
        return;
      }
      
      const newPlugins = choice(config.pluginSets);
      
      // Override navigator.plugins
      const mockPlugins = newPlugins.map((name, index) => ({
        name: name,
        description: `${name} Plugin`,
        filename: `${name.toLowerCase().replace(/\s+/g, '-')}.plugin`,
        length: 1
      }));
      
      Object.defineProperty(navigator, 'plugins', {
        value: mockPlugins,
        writable: false
      });
      
      this.stats.currentFingerprint.plugins = newPlugins;
      this.stats.variationsByType.plugins = (this.stats.variationsByType.plugins || 0) + 1;
      
      logger.debug('Plugins varied', { newPlugins });
    } catch (error) {
      logger.error('Error varying plugins', { error });
    }
  }

  /**
   * Vary fonts
   * @returns {Promise<void>} - Promise that resolves when fonts are varied
   */
  async varyFonts() {
    try {
      const config = this.config.fonts;
      
      if (Math.random() > config.variationRate) {
        return;
      }
      
      const newFonts = choice(config.fontSets);
      
      // Override font detection
      const originalFontFaceSet = FontFaceSet;
      FontFaceSet = function() {
        const mockFontFaceSet = new originalFontFaceSet();
        mockFontFaceSet.has = function(font) {
          return newFonts.includes(font);
        };
        return mockFontFaceSet;
      };
      
      this.stats.currentFingerprint.fonts = newFonts;
      this.stats.variationsByType.fonts = (this.stats.variationsByType.fonts || 0) + 1;
      
      logger.debug('Fonts varied', { newFonts });
    } catch (error) {
      logger.error('Error varying fonts', { error });
    }
  }

  /**
   * Detect available fonts
   * @returns {Array} - Array of available fonts
   */
  detectFonts() {
    try {
      const testFonts = [
        'Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana',
        'Georgia', 'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS',
        'Trebuchet MS', 'Arial Black', 'Impact', 'Tahoma', 'Geneva'
      ];
      
      const availableFonts = [];
      const testString = 'abcdefghijklmnopqrstuvwxyz0123456789';
      const testSize = '72px';
      
      // Create test element
      const testElement = document.createElement('div');
      testElement.style.position = 'absolute';
      testElement.style.left = '-9999px';
      testElement.style.fontSize = testSize;
      testElement.textContent = testString;
      document.body.appendChild(testElement);
      
      // Test each font
      for (const font of testFonts) {
        testElement.style.fontFamily = font;
        const width = testElement.offsetWidth;
        const height = testElement.offsetHeight;
        
        // If dimensions are different, font is available
        if (width > 0 && height > 0) {
          availableFonts.push(font);
        }
      }
      
      // Clean up
      document.body.removeChild(testElement);
      
      return availableFonts;
    } catch (error) {
      logger.error('Error detecting fonts', { error });
      return [];
    }
  }

  /**
   * Start periodic variations
   */
  startPeriodicVariations() {
    if (this.variationTimeout) {
      clearTimeout(this.variationTimeout);
    }
    
    this.variationTimeout = setTimeout(async () => {
      if (this.isActive) {
        await this.applyPeriodicVariations();
        this.startPeriodicVariations(); // Schedule next variation
      }
    }, randInt(30000, 120000)); // 30 seconds to 2 minutes
  }

  /**
   * Stop periodic variations
   */
  stopPeriodicVariations() {
    if (this.variationTimeout) {
      clearTimeout(this.variationTimeout);
      this.variationTimeout = null;
    }
  }

  /**
   * Apply periodic variations
   * @returns {Promise<void>} - Promise that resolves when variations are applied
   */
  async applyPeriodicVariations() {
    try {
      // Select random variation type
      const variationType = choice(this.config.variationTypes);
      
      switch (variationType) {
        case 'userAgent':
          await this.varyUserAgent();
          break;
        case 'timezone':
          await this.varyTimezone();
          break;
        case 'language':
          await this.varyLanguage();
          break;
        case 'screen':
          await this.varyScreen();
          break;
        case 'plugins':
          await this.varyPlugins();
          break;
        case 'fonts':
          await this.varyFonts();
          break;
      }
      
      // Update statistics
      this.stats.totalVariations++;
      this.stats.lastVariationTime = Date.now();
      this.stats.fingerprintHistory.push({
        timestamp: Date.now(),
        fingerprint: { ...this.stats.currentFingerprint }
      });
      
      // Keep only last 50 fingerprints
      if (this.stats.fingerprintHistory.length > 50) {
        this.stats.fingerprintHistory = this.stats.fingerprintHistory.slice(-50);
      }
      
      logger.debug('Periodic variation applied', { variationType });
    } catch (error) {
      logger.error('Error applying periodic variations', { error });
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
      isVariating: this.isVariating,
      currentType: this.config.currentType,
      config: this.config
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      totalVariations: 0,
      variationsByType: {},
      lastVariationTime: null,
      currentFingerprint: {},
      fingerprintHistory: []
    };
  }

  /**
   * Update configuration
   * @param {Object} newConfig - New configuration
   */
  updateConfig(newConfig) {
    try {
      this.config = { ...this.config, ...newConfig };
      logger.info('Fingerprint variation configuration updated', { config: this.config });
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
      if (!Array.isArray(this.config.variationTypes) || this.config.variationTypes.length === 0) {
        logger.error('Variation types must be a non-empty array');
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
   * Cleanup resources
   * @returns {Promise<boolean>} - Success status
   */
  async cleanup() {
    try {
      await this.stop();
      this.resetStats();
      logger.info('Fingerprint variation cleaned up');
      return true;
    } catch (error) {
      logger.error('Error cleaning up fingerprint variation', { error });
      return false;
    }
  }
}

/**
 * Create fingerprint variation instance
 * @param {Object} config - Configuration object
 * @returns {FingerprintVariation} - Variation instance
 */
export function createFingerprintVariation(config = {}) {
  return new FingerprintVariation(config);
}

/**
 * Default fingerprint variation instance
 */
export const fingerprintVariation = createFingerprintVariation();
