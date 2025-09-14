/**
 * Fingerprint - Browser fingerprinting and variation
 */

import { createLogger } from '../utils/logger.js';
import { randFloat, randInt } from '../core/randomizer.js';

const logger = createLogger('fingerprint');

/**
 * Fingerprint Manager
 * Manages browser fingerprinting and variation for stealth
 */
export class FingerprintManager {
  constructor() {
    this.isActive = false;
    this.config = {
      enabled: true,
      variation: {
        enabled: true,
        intensity: 0.1, // 10% variation
        frequency: 0.05, // 5% chance per update
        persistence: true
      },
      fingerprinting: {
        enabled: true,
        components: [
          'userAgent',
          'screen',
          'timezone',
          'language',
          'platform',
          'hardwareConcurrency',
          'deviceMemory',
          'maxTouchPoints',
          'webgl',
          'canvas',
          'audio',
          'fonts'
        ]
      },
      storage: {
        enabled: true,
        key: 'autoscroll_fingerprint',
        ttl: 86400000 // 24 hours
      }
    };
    
    this.originalFingerprint = {};
    this.variedFingerprint = {};
    this.fingerprintHash = '';
    this.variationHistory = [];
    this.lastVariation = Date.now();
  }

  /**
   * Initialize fingerprint manager
   * @param {Object} config - Configuration object
   * @returns {Promise<boolean>} - Success status
   */
  async initialize(config = {}) {
    try {
      logger.info('Initializing fingerprint manager', { config });
      
      this.config = { ...this.config, ...config };
      
      if (this.config.enabled) {
        await this.generateFingerprint();
        await this.loadStoredFingerprint();
      }
      
      logger.info('Fingerprint manager initialized successfully');
      return true;
    } catch (error) {
      logger.error('Error initializing fingerprint manager', { error });
      return false;
    }
  }

  /**
   * Generate browser fingerprint
   * @returns {Promise<Object>} - Generated fingerprint
   */
  async generateFingerprint() {
    try {
      const fingerprint = {};
      
      // User Agent
      if (this.config.fingerprinting.components.includes('userAgent')) {
        fingerprint.userAgent = navigator.userAgent;
      }
      
      // Screen properties
      if (this.config.fingerprinting.components.includes('screen')) {
        fingerprint.screen = {
          width: screen.width,
          height: screen.height,
          availWidth: screen.availWidth,
          availHeight: screen.availHeight,
          colorDepth: screen.colorDepth,
          pixelDepth: screen.pixelDepth
        };
      }
      
      // Timezone
      if (this.config.fingerprinting.components.includes('timezone')) {
        fingerprint.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        fingerprint.timezoneOffset = new Date().getTimezoneOffset();
      }
      
      // Language
      if (this.config.fingerprinting.components.includes('language')) {
        fingerprint.language = navigator.language;
        fingerprint.languages = navigator.languages;
      }
      
      // Platform
      if (this.config.fingerprinting.components.includes('platform')) {
        fingerprint.platform = navigator.platform;
      }
      
      // Hardware concurrency
      if (this.config.fingerprinting.components.includes('hardwareConcurrency')) {
        fingerprint.hardwareConcurrency = navigator.hardwareConcurrency;
      }
      
      // Device memory
      if (this.config.fingerprinting.components.includes('deviceMemory')) {
        fingerprint.deviceMemory = navigator.deviceMemory;
      }
      
      // Max touch points
      if (this.config.fingerprinting.components.includes('maxTouchPoints')) {
        fingerprint.maxTouchPoints = navigator.maxTouchPoints;
      }
      
      // WebGL
      if (this.config.fingerprinting.components.includes('webgl')) {
        fingerprint.webgl = this.getWebGLFingerprint();
      }
      
      // Canvas
      if (this.config.fingerprinting.components.includes('canvas')) {
        fingerprint.canvas = this.getCanvasFingerprint();
      }
      
      // Audio
      if (this.config.fingerprinting.components.includes('audio')) {
        fingerprint.audio = await this.getAudioFingerprint();
      }
      
      // Fonts
      if (this.config.fingerprinting.components.includes('fonts')) {
        fingerprint.fonts = await this.getFontFingerprint();
      }
      
      this.originalFingerprint = fingerprint;
      this.fingerprintHash = this.hashFingerprint(fingerprint);
      
      logger.info('Fingerprint generated', { hash: this.fingerprintHash });
      return fingerprint;
    } catch (error) {
      logger.error('Error generating fingerprint', { error });
      return {};
    }
  }

  /**
   * Get WebGL fingerprint
   * @returns {Object} - WebGL fingerprint
   */
  getWebGLFingerprint() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!gl) {
        return { supported: false };
      }
      
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      
      return {
        supported: true,
        vendor: gl.getParameter(debugInfo ? debugInfo.UNMASKED_VENDOR_WEBGL : gl.VENDOR),
        renderer: gl.getParameter(debugInfo ? debugInfo.UNMASKED_RENDERER_WEBGL : gl.RENDERER),
        version: gl.getParameter(gl.VERSION),
        shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
        maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
        maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS),
        maxVertexAttribs: gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
        maxVaryingVectors: gl.getParameter(gl.MAX_VARYING_VECTORS),
        aliasedLineWidthRange: gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE),
        aliasedPointSizeRange: gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE)
      };
    } catch (error) {
      logger.error('Error getting WebGL fingerprint', { error });
      return { supported: false };
    }
  }

  /**
   * Get canvas fingerprint
   * @returns {Object} - Canvas fingerprint
   */
  getCanvasFingerprint() {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      canvas.width = 200;
      canvas.height = 50;
      
      // Draw text
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('Canvas fingerprint', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('Canvas fingerprint', 4, 17);
      
      // Draw shapes
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = 'rgb(255,0,255)';
      ctx.beginPath();
      ctx.arc(50, 50, 50, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgb(0,255,255)';
      ctx.beginPath();
      ctx.arc(100, 50, 50, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'rgb(255,255,0)';
      ctx.beginPath();
      ctx.arc(75, 100, 50, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fill();
      
      return {
        dataURL: canvas.toDataURL(),
        width: canvas.width,
        height: canvas.height
      };
    } catch (error) {
      logger.error('Error getting canvas fingerprint', { error });
      return { dataURL: '', width: 0, height: 0 };
    }
  }

  /**
   * Get audio fingerprint
   * @returns {Promise<Object>} - Audio fingerprint
   */
  async getAudioFingerprint() {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const analyser = audioContext.createAnalyser();
      const gainNode = audioContext.createGain();
      
      // Use modern approach without ScriptProcessorNode
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(10000, audioContext.currentTime);
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      
      oscillator.connect(analyser);
      analyser.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      return new Promise((resolve) => {
        // Use analyser to get frequency data instead of ScriptProcessorNode
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const processAudio = () => {
          analyser.getByteFrequencyData(dataArray);
          
          // Create fingerprint from frequency data
          const fingerprint = Array.from(dataArray).slice(0, 30).map(x => (x / 255).toFixed(6)).join(',');
          
          oscillator.stop();
          audioContext.close();
          
          resolve({
            fingerprint,
            sampleRate: audioContext.sampleRate,
            maxChannelCount: audioContext.destination.maxChannelCount
          });
        };
        
        oscillator.start();
        
        // Process audio after a short delay
        setTimeout(processAudio, 100);
      });
    } catch (error) {
      logger.error('Error getting audio fingerprint', { error });
      return { fingerprint: '', sampleRate: 0, maxChannelCount: 0 };
    }
  }

  /**
   * Get font fingerprint
   * @returns {Promise<Object>} - Font fingerprint
   */
  async getFontFingerprint() {
    try {
      const fonts = [
        'Arial', 'Arial Black', 'Arial Narrow', 'Arial Rounded MT Bold',
        'Calibri', 'Cambria', 'Candara', 'Century Gothic', 'Comic Sans MS',
        'Consolas', 'Constantia', 'Corbel', 'Courier New', 'Franklin Gothic Medium',
        'Gabriola', 'Gadugi', 'Georgia', 'Impact', 'Lucida Console',
        'Lucida Sans Unicode', 'Microsoft Sans Serif', 'Palatino Linotype',
        'Segoe UI', 'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana'
      ];
      
      const availableFonts = [];
      
      for (const font of fonts) {
        if (this.isFontAvailable(font)) {
          availableFonts.push(font);
        }
      }
      
      return {
        available: availableFonts,
        count: availableFonts.length
      };
    } catch (error) {
      logger.error('Error getting font fingerprint', { error });
      return { available: [], count: 0 };
    }
  }

  /**
   * Check if font is available
   * @param {string} font - Font name
   * @returns {boolean} - Font availability
   */
  isFontAvailable(font) {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      const testString = 'abcdefghijklmnopqrstuvwxyz0123456789';
      const testSize = '72px';
      
      // Set baseline font
      ctx.font = testSize + ' monospace';
      const baselineWidth = ctx.measureText(testString).width;
      
      // Set test font
      ctx.font = testSize + ' ' + font + ', monospace';
      const testWidth = ctx.measureText(testString).width;
      
      return baselineWidth !== testWidth;
    } catch (error) {
      logger.error('Error checking font availability', { error, font });
      return false;
    }
  }

  /**
   * Hash fingerprint
   * @param {Object} fingerprint - Fingerprint object
   * @returns {string} - Hash string
   */
  hashFingerprint(fingerprint) {
    try {
      const str = JSON.stringify(fingerprint);
      let hash = 0;
      
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      
      return hash.toString(36);
    } catch (error) {
      logger.error('Error hashing fingerprint', { error, fingerprint });
      return '';
    }
  }

  /**
   * Apply fingerprint variations
   * @returns {Promise<Object>} - Varied fingerprint
   */
  async applyVariations() {
    try {
      if (!this.config.variation.enabled) {
        this.variedFingerprint = { ...this.originalFingerprint };
        return this.variedFingerprint;
      }
      
      const varied = { ...this.originalFingerprint };
      const intensity = this.config.variation.intensity;
      
      // Vary screen properties
      if (varied.screen) {
        varied.screen.width = this.varyValue(varied.screen.width, intensity, 1);
        varied.screen.height = this.varyValue(varied.screen.height, intensity, 1);
        varied.screen.availWidth = this.varyValue(varied.screen.availWidth, intensity, 1);
        varied.screen.availHeight = this.varyValue(varied.screen.availHeight, intensity, 1);
      }
      
      // Vary hardware concurrency
      if (varied.hardwareConcurrency) {
        varied.hardwareConcurrency = this.varyValue(varied.hardwareConcurrency, intensity, 1);
      }
      
      // Vary device memory
      if (varied.deviceMemory) {
        varied.deviceMemory = this.varyValue(varied.deviceMemory, intensity, 0.5);
      }
      
      // Vary max touch points
      if (varied.maxTouchPoints) {
        varied.maxTouchPoints = this.varyValue(varied.maxTouchPoints, intensity, 1);
      }
      
      // Vary WebGL properties
      if (varied.webgl && varied.webgl.supported) {
        if (varied.webgl.maxTextureSize) {
          varied.webgl.maxTextureSize = this.varyValue(varied.webgl.maxTextureSize, intensity, 1);
        }
        if (varied.webgl.maxVertexAttribs) {
          varied.webgl.maxVertexAttribs = this.varyValue(varied.webgl.maxVertexAttribs, intensity, 1);
        }
      }
      
      this.variedFingerprint = varied;
      this.lastVariation = Date.now();
      
      // Add to variation history
      this.variationHistory.push({
        timestamp: this.lastVariation,
        intensity,
        changes: this.getVariationChanges(this.originalFingerprint, varied)
      });
      
      // Limit history size
      if (this.variationHistory.length > 100) {
        this.variationHistory.shift();
      }
      
      logger.debug('Fingerprint variations applied', { intensity });
      return varied;
    } catch (error) {
      logger.error('Error applying variations', { error });
      return this.originalFingerprint;
    }
  }

  /**
   * Vary a value within specified intensity
   * @param {number} value - Original value
   * @param {number} intensity - Variation intensity
   * @param {number} step - Step size
   * @returns {number} - Varied value
   */
  varyValue(value, intensity, step = 1) {
    try {
      const variation = (Math.random() - 0.5) * 2 * intensity;
      const varied = value + (variation * step);
      return Math.max(1, Math.round(varied));
    } catch (error) {
      logger.error('Error varying value', { error, value, intensity, step });
      return value;
    }
  }

  /**
   * Get variation changes
   * @param {Object} original - Original fingerprint
   * @param {Object} varied - Varied fingerprint
   * @returns {Array} - List of changes
   */
  getVariationChanges(original, varied) {
    try {
      const changes = [];
      
      const compareObjects = (orig, varied, path = '') => {
        Object.keys(varied).forEach(key => {
          const currentPath = path ? `${path}.${key}` : key;
          
          if (typeof varied[key] === 'object' && varied[key] !== null) {
            compareObjects(orig[key] || {}, varied[key], currentPath);
          } else if (orig[key] !== varied[key]) {
            changes.push({
              path: currentPath,
              original: orig[key],
              varied: varied[key]
            });
          }
        });
      };
      
      compareObjects(original, varied);
      return changes;
    } catch (error) {
      logger.error('Error getting variation changes', { error, original, varied });
      return [];
    }
  }

  /**
   * Load stored fingerprint
   * @returns {Promise<boolean>} - Success status
   */
  async loadStoredFingerprint() {
    try {
      if (!this.config.storage.enabled) {
        return false;
      }
      
      const stored = localStorage.getItem(this.config.storage.key);
      if (stored) {
        const data = JSON.parse(stored);
        
        // Check if stored data is still valid
        if (data.timestamp && (Date.now() - data.timestamp) < this.config.storage.ttl) {
          this.variedFingerprint = data.fingerprint;
          this.fingerprintHash = data.hash;
          
          logger.info('Stored fingerprint loaded', { hash: this.fingerprintHash });
          return true;
        }
      }
      
      return false;
    } catch (error) {
      logger.error('Error loading stored fingerprint', { error });
      return false;
    }
  }

  /**
   * Save fingerprint to storage
   * @returns {Promise<boolean>} - Success status
   */
  async saveFingerprint() {
    try {
      if (!this.config.storage.enabled) {
        return false;
      }
      
      const data = {
        fingerprint: this.variedFingerprint,
        hash: this.fingerprintHash,
        timestamp: Date.now()
      };
      
      localStorage.setItem(this.config.storage.key, JSON.stringify(data));
      
      logger.info('Fingerprint saved to storage', { hash: this.fingerprintHash });
      return true;
    } catch (error) {
      logger.error('Error saving fingerprint', { error });
      return false;
    }
  }

  /**
   * Get current fingerprint
   * @returns {Object} - Current fingerprint
   */
  getFingerprint() {
    return { ...this.variedFingerprint };
  }

  /**
   * Get original fingerprint
   * @returns {Object} - Original fingerprint
   */
  getOriginalFingerprint() {
    return { ...this.originalFingerprint };
  }

  /**
   * Get fingerprint hash
   * @returns {string} - Fingerprint hash
   */
  getFingerprintHash() {
    return this.fingerprintHash;
  }

  /**
   * Get variation history
   * @param {number} limit - Maximum number of entries
   * @returns {Array} - Variation history
   */
  getVariationHistory(limit = 50) {
    try {
      return this.variationHistory.slice(-limit);
    } catch (error) {
      logger.error('Error getting variation history', { error, limit });
      return [];
    }
  }

  /**
   * Clear fingerprint data
   * @returns {Promise<boolean>} - Success status
   */
  async clearFingerprint() {
    try {
      this.originalFingerprint = {};
      this.variedFingerprint = {};
      this.fingerprintHash = '';
      this.variationHistory = [];
      
      if (this.config.storage.enabled) {
        localStorage.removeItem(this.config.storage.key);
      }
      
      logger.info('Fingerprint data cleared');
      return true;
    } catch (error) {
      logger.error('Error clearing fingerprint', { error });
      return false;
    }
  }
}

/**
 * Create fingerprint manager instance
 * @param {Object} config - Configuration object
 * @returns {FingerprintManager} - Fingerprint manager instance
 */
export function createFingerprintManager(config = {}) {
  return new FingerprintManager(config);
}

/**
 * Default fingerprint manager instance
 */
export const fingerprintManager = createFingerprintManager();
