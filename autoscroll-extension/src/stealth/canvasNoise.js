/**
 * Canvas noise for fingerprint protection and anti-detection
 */

import { createLogger } from '../utils/logger.js';
import { randFloat, randInt, choice } from '../core/randomizer.js';
import { delay } from '../utils/time.js';

const logger = createLogger('canvas-noise');

/**
 * Canvas Noise
 * Generates noise to protect against canvas fingerprinting
 */
export class CanvasNoise {
  constructor() {
    this.isActive = false;
    this.config = {
      enabled: true,
      intensity: 'low', // 'low', 'medium', 'high'
      noiseTypes: ['pixel', 'text', 'shape', 'gradient'],
      pixelNoise: {
        enabled: true,
        density: 0.01, // 1% of pixels
        intensity: { min: 0.1, max: 0.3 },
        colorVariation: { min: 0.8, max: 1.2 }
      },
      textNoise: {
        enabled: true,
        density: 0.005, // 0.5% of pixels
        fontSize: { min: 8, max: 16 },
        fontFamily: ['Arial', 'Helvetica', 'Times', 'Courier'],
        color: { min: 0.1, max: 0.3 },
        rotation: { min: -15, max: 15 }
      },
      shapeNoise: {
        enabled: true,
        density: 0.002, // 0.2% of pixels
        shapes: ['circle', 'rectangle', 'line'],
        size: { min: 2, max: 8 },
        color: { min: 0.1, max: 0.3 },
        opacity: { min: 0.1, max: 0.5 }
      },
      gradientNoise: {
        enabled: true,
        density: 0.001, // 0.1% of pixels
        type: ['linear', 'radial'],
        colors: ['rgba(255,255,255,0.1)', 'rgba(0,0,0,0.1)'],
        size: { min: 10, max: 50 }
      },
      timing: {
        enabled: true,
        delay: { min: 100, max: 500 },
        interval: { min: 1000, max: 5000 },
        randomize: true
      },
      protection: {
        canvasFingerprint: true,
        webglFingerprint: true,
        audioFingerprint: false,
        fontFingerprint: false
      }
    };
    
    this.stats = {
      totalNoiseGenerated: 0,
      noiseByType: {},
      lastNoiseTime: null,
      canvasModifications: 0,
      webglModifications: 0
    };
    
    this.originalMethods = new Map();
    this.noiseInterval = null;
    this.eventListeners = new Map();
  }

  /**
   * Initialize canvas noise
   * @param {Object} config - Configuration object
   * @returns {Promise<boolean>} - Success status
   */
  async initialize(config = {}) {
    try {
      this.config = { ...this.config, ...config };
      
      // Validate configuration
      if (!this.validateConfig()) {
        logger.error('Invalid canvas noise configuration');
        return false;
      }
      
      // Store original methods
      this.storeOriginalMethods();
      
      logger.info('Canvas noise initialized', { config: this.config });
      return true;
    } catch (error) {
      logger.error('Error initializing canvas noise', { error });
      return false;
    }
  }

  /**
   * Start canvas noise
   * @returns {Promise<boolean>} - Success status
   */
  async start() {
    try {
      if (this.isActive) {
        logger.warn('Canvas noise already active');
        return false;
      }

      this.isActive = true;
      
      // Apply noise to existing canvases
      await this.applyNoiseToExistingCanvases();
      
      // Start periodic noise generation
      this.startPeriodicNoise();
      
      logger.info('Canvas noise started');
      return true;
    } catch (error) {
      logger.error('Error starting canvas noise', { error });
      return false;
    }
  }

  /**
   * Stop canvas noise
   * @returns {Promise<boolean>} - Success status
   */
  async stop() {
    try {
      if (!this.isActive) {
        logger.warn('Canvas noise not active');
        return false;
      }

      this.isActive = false;
      
      // Stop periodic noise
      this.stopPeriodicNoise();
      
      // Restore original methods
      this.restoreOriginalMethods();
      
      logger.info('Canvas noise stopped');
      return true;
    } catch (error) {
      logger.error('Error stopping canvas noise', { error });
      return false;
    }
  }

  /**
   * Store original methods
   */
  storeOriginalMethods() {
    try {
      // Store original canvas methods
      if (HTMLCanvasElement.prototype.toDataURL) {
        this.originalMethods.set('toDataURL', HTMLCanvasElement.prototype.toDataURL);
      }
      
      if (HTMLCanvasElement.prototype.toBlob) {
        this.originalMethods.set('toBlob', HTMLCanvasElement.prototype.toBlob);
      }
      
      if (HTMLCanvasElement.prototype.getContext) {
        this.originalMethods.set('getContext', HTMLCanvasElement.prototype.getContext);
      }
      
      // Store original WebGL methods
      if (WebGLRenderingContext.prototype.getParameter) {
        this.originalMethods.set('getParameter', WebGLRenderingContext.prototype.getParameter);
      }
      
      if (WebGLRenderingContext.prototype.getExtension) {
        this.originalMethods.set('getExtension', WebGLRenderingContext.prototype.getExtension);
      }
      
      logger.debug('Original methods stored');
    } catch (error) {
      logger.error('Error storing original methods', { error });
    }
  }

  /**
   * Restore original methods
   */
  restoreOriginalMethods() {
    try {
      // Restore original canvas methods
      if (this.originalMethods.has('toDataURL')) {
        HTMLCanvasElement.prototype.toDataURL = this.originalMethods.get('toDataURL');
      }
      
      if (this.originalMethods.has('toBlob')) {
        HTMLCanvasElement.prototype.toBlob = this.originalMethods.get('toBlob');
      }
      
      if (this.originalMethods.has('getContext')) {
        HTMLCanvasElement.prototype.getContext = this.originalMethods.get('getContext');
      }
      
      // Restore original WebGL methods
      if (this.originalMethods.has('getParameter')) {
        WebGLRenderingContext.prototype.getParameter = this.originalMethods.get('getParameter');
      }
      
      if (this.originalMethods.has('getExtension')) {
        WebGLRenderingContext.prototype.getExtension = this.originalMethods.get('getExtension');
      }
      
      logger.debug('Original methods restored');
    } catch (error) {
      logger.error('Error restoring original methods', { error });
    }
  }

  /**
   * Apply noise to existing canvases
   * @returns {Promise<void>} - Promise that resolves when noise is applied
   */
  async applyNoiseToExistingCanvases() {
    try {
      const canvases = document.querySelectorAll('canvas');
      
      for (const canvas of canvases) {
        await this.addNoiseToCanvas(canvas);
      }
      
      logger.debug('Noise applied to existing canvases', { count: canvases.length });
    } catch (error) {
      logger.error('Error applying noise to existing canvases', { error });
    }
  }

  /**
   * Add noise to canvas
   * @param {HTMLCanvasElement} canvas - Canvas element
   * @returns {Promise<void>} - Promise that resolves when noise is added
   */
  async addNoiseToCanvas(canvas) {
    try {
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return;
      }
      
      // Add different types of noise
      if (this.config.pixelNoise.enabled) {
        this.addPixelNoise(ctx, canvas.width, canvas.height);
      }
      
      if (this.config.textNoise.enabled) {
        this.addTextNoise(ctx, canvas.width, canvas.height);
      }
      
      if (this.config.shapeNoise.enabled) {
        this.addShapeNoise(ctx, canvas.width, canvas.height);
      }
      
      if (this.config.gradientNoise.enabled) {
        this.addGradientNoise(ctx, canvas.width, canvas.height);
      }
      
      this.stats.canvasModifications++;
      
      logger.debug('Noise added to canvas', { 
        width: canvas.width, 
        height: canvas.height 
      });
    } catch (error) {
      logger.error('Error adding noise to canvas', { error });
    }
  }

  /**
   * Add pixel noise to canvas
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} width - Canvas width
   * @param {number} height - Canvas height
   */
  addPixelNoise(ctx, width, height) {
    try {
      const config = this.config.pixelNoise;
      const imageData = ctx.getImageData(0, 0, width, height);
      const data = imageData.data;
      
      const numPixels = Math.floor(width * height * config.density);
      
      for (let i = 0; i < numPixels; i++) {
        const pixelIndex = randInt(0, data.length / 4 - 1) * 4;
        const intensity = randFloat(config.intensity.min, config.intensity.max);
        const colorVariation = randFloat(config.colorVariation.min, config.colorVariation.max);
        
        // Modify pixel color
        data[pixelIndex] = Math.min(255, data[pixelIndex] * colorVariation + intensity * 255);
        data[pixelIndex + 1] = Math.min(255, data[pixelIndex + 1] * colorVariation + intensity * 255);
        data[pixelIndex + 2] = Math.min(255, data[pixelIndex + 2] * colorVariation + intensity * 255);
      }
      
      ctx.putImageData(imageData, 0, 0);
      
      this.stats.noiseByType.pixel = (this.stats.noiseByType.pixel || 0) + 1;
    } catch (error) {
      logger.error('Error adding pixel noise', { error });
    }
  }

  /**
   * Add text noise to canvas
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} width - Canvas width
   * @param {number} height - Canvas height
   */
  addTextNoise(ctx, width, height) {
    try {
      const config = this.config.textNoise;
      const numTexts = Math.floor(width * height * config.density);
      
      for (let i = 0; i < numTexts; i++) {
        const x = randInt(0, width);
        const y = randInt(0, height);
        const fontSize = randInt(config.fontSize.min, config.fontSize.max);
        const fontFamily = choice(config.fontFamily);
        const color = randFloat(config.color.min, config.color.max);
        const rotation = randInt(config.rotation.min, config.rotation.max);
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.font = `${fontSize}px ${fontFamily}`;
        ctx.fillStyle = `rgba(0,0,0,${color})`;
        ctx.fillText('•', 0, 0);
        ctx.restore();
      }
      
      this.stats.noiseByType.text = (this.stats.noiseByType.text || 0) + 1;
    } catch (error) {
      logger.error('Error adding text noise', { error });
    }
  }

  /**
   * Add shape noise to canvas
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} width - Canvas width
   * @param {number} height - Canvas height
   */
  addShapeNoise(ctx, width, height) {
    try {
      const config = this.config.shapeNoise;
      const numShapes = Math.floor(width * height * config.density);
      
      for (let i = 0; i < numShapes; i++) {
        const x = randInt(0, width);
        const y = randInt(0, height);
        const size = randInt(config.size.min, config.size.max);
        const color = randFloat(config.color.min, config.color.max);
        const opacity = randFloat(config.opacity.min, config.opacity.max);
        const shape = choice(config.shapes);
        
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.fillStyle = `rgba(0,0,0,${color})`;
        
        switch (shape) {
          case 'circle':
            ctx.beginPath();
            ctx.arc(x, y, size, 0, 2 * Math.PI);
            ctx.fill();
            break;
          case 'rectangle':
            ctx.fillRect(x - size / 2, y - size / 2, size, size);
            break;
          case 'line':
            ctx.beginPath();
            ctx.moveTo(x - size, y);
            ctx.lineTo(x + size, y);
            ctx.stroke();
            break;
        }
        
        ctx.restore();
      }
      
      this.stats.noiseByType.shape = (this.stats.noiseByType.shape || 0) + 1;
    } catch (error) {
      logger.error('Error adding shape noise', { error });
    }
  }

  /**
   * Add gradient noise to canvas
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} width - Canvas width
   * @param {number} height - Canvas height
   */
  addGradientNoise(ctx, width, height) {
    try {
      const config = this.config.gradientNoise;
      const numGradients = Math.floor(width * height * config.density);
      
      for (let i = 0; i < numGradients; i++) {
        const x = randInt(0, width);
        const y = randInt(0, height);
        const size = randInt(config.size.min, config.size.max);
        const type = choice(config.type);
        const color = choice(config.colors);
        
        let gradient;
        
        if (type === 'linear') {
          gradient = ctx.createLinearGradient(x - size, y - size, x + size, y + size);
        } else {
          gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
        }
        
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'transparent');
        
        ctx.save();
        ctx.fillStyle = gradient;
        ctx.fillRect(x - size, y - size, size * 2, size * 2);
        ctx.restore();
      }
      
      this.stats.noiseByType.gradient = (this.stats.noiseByType.gradient || 0) + 1;
    } catch (error) {
      logger.error('Error adding gradient noise', { error });
    }
  }

  /**
   * Start periodic noise generation
   */
  startPeriodicNoise() {
    if (this.noiseInterval) {
      clearInterval(this.noiseInterval);
    }
    
    this.noiseInterval = setInterval(async () => {
      if (this.isActive) {
        await this.generatePeriodicNoise();
      }
    }, randInt(
      this.config.timing.interval.min,
      this.config.timing.interval.max
    ));
  }

  /**
   * Stop periodic noise generation
   */
  stopPeriodicNoise() {
    if (this.noiseInterval) {
      clearInterval(this.noiseInterval);
      this.noiseInterval = null;
    }
  }

  /**
   * Generate periodic noise
   * @returns {Promise<void>} - Promise that resolves when noise is generated
   */
  async generatePeriodicNoise() {
    try {
      // Add delay if configured
      if (this.config.timing.enabled) {
        const delay = randInt(
          this.config.timing.delay.min,
          this.config.timing.delay.max
        );
        await delay(delay);
      }
      
      // Apply noise to all canvases
      await this.applyNoiseToExistingCanvases();
      
      // Update statistics
      this.stats.totalNoiseGenerated++;
      this.stats.lastNoiseTime = Date.now();
      
      logger.debug('Periodic noise generated');
    } catch (error) {
      logger.error('Error generating periodic noise', { error });
    }
  }

  /**
   * Override canvas methods
   */
  overrideCanvasMethods() {
    try {
      // Override toDataURL
      if (this.config.protection.canvasFingerprint) {
        HTMLCanvasElement.prototype.toDataURL = function(...args) {
          const original = this.originalMethods.get('toDataURL');
          const result = original.apply(this, args);
          
          // Add noise to result
          if (this.isActive) {
            return this.addNoiseToDataURL(result);
          }
          
          return result;
        }.bind(this);
      }
      
      // Override toBlob
      if (this.config.protection.canvasFingerprint) {
        HTMLCanvasElement.prototype.toBlob = function(callback, ...args) {
          const original = this.originalMethods.get('toBlob');
          
          original.call(this, (blob) => {
            // Add noise to blob
            if (this.isActive) {
              blob = this.addNoiseToBlob(blob);
            }
            
            callback(blob);
          }, ...args);
        }.bind(this);
      }
      
      // Override getContext
      HTMLCanvasElement.prototype.getContext = function(type, ...args) {
        const original = this.originalMethods.get('getContext');
        const context = original.call(this, type, ...args);
        
        // Override WebGL methods if needed
        if (type === 'webgl' || type === 'experimental-webgl') {
          this.overrideWebGLMethods(context);
        }
        
        return context;
      }.bind(this);
      
      logger.debug('Canvas methods overridden');
    } catch (error) {
      logger.error('Error overriding canvas methods', { error });
    }
  }

  /**
   * Override WebGL methods
   * @param {WebGLRenderingContext} context - WebGL context
   */
  overrideWebGLMethods(context) {
    try {
      if (!this.config.protection.webglFingerprint) {
        return;
      }
      
      // Override getParameter
      const originalGetParameter = context.getParameter;
      context.getParameter = function(parameter) {
        const result = originalGetParameter.call(this, parameter);
        
        // Add noise to specific parameters
        if (this.isActive) {
          return this.addNoiseToWebGLParameter(parameter, result);
        }
        
        return result;
      }.bind(this);
      
      // Override getExtension
      const originalGetExtension = context.getExtension;
      context.getExtension = function(name) {
        const result = originalGetExtension.call(this, name);
        
        // Add noise to extension
        if (this.isActive && result) {
          return this.addNoiseToWebGLExtension(result);
        }
        
        return result;
      }.bind(this);
      
      logger.debug('WebGL methods overridden');
    } catch (error) {
      logger.error('Error overriding WebGL methods', { error });
    }
  }

  /**
   * Add noise to data URL
   * @param {string} dataURL - Original data URL
   * @returns {string} - Modified data URL
   */
  addNoiseToDataURL(dataURL) {
    try {
      // Simple noise addition - in practice, this would be more sophisticated
      const noise = Math.random().toString(36).substring(2, 8);
      return dataURL.replace(/data:image\/png;base64,/, `data:image/png;base64,${noise}`);
    } catch (error) {
      logger.error('Error adding noise to data URL', { error });
      return dataURL;
    }
  }

  /**
   * Add noise to blob
   * @param {Blob} blob - Original blob
   * @returns {Blob} - Modified blob
   */
  addNoiseToBlob(blob) {
    try {
      // Simple noise addition - in practice, this would be more sophisticated
      const noise = Math.random().toString(36).substring(2, 8);
      return new Blob([blob, noise], { type: blob.type });
    } catch (error) {
      logger.error('Error adding noise to blob', { error });
      return blob;
    }
  }

  /**
   * Add noise to WebGL parameter
   * @param {number} parameter - WebGL parameter
   * @param {any} value - Original value
   * @returns {any} - Modified value
   */
  addNoiseToWebGLParameter(parameter, value) {
    try {
      // Add noise to specific parameters
      if (parameter === WebGLRenderingContext.VENDOR || 
          parameter === WebGLRenderingContext.RENDERER ||
          parameter === WebGLRenderingContext.VERSION) {
        const noise = Math.random().toString(36).substring(2, 8);
        return value + noise;
      }
      
      return value;
    } catch (error) {
      logger.error('Error adding noise to WebGL parameter', { error });
      return value;
    }
  }

  /**
   * Add noise to WebGL extension
   * @param {any} extension - Original extension
   * @returns {any} - Modified extension
   */
  addNoiseToWebGLExtension(extension) {
    try {
      // Add noise to extension properties
      if (extension && typeof extension === 'object') {
        const noise = Math.random().toString(36).substring(2, 8);
        extension._noise = noise;
      }
      
      return extension;
    } catch (error) {
      logger.error('Error adding noise to WebGL extension', { error });
      return extension;
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
      config: this.config
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      totalNoiseGenerated: 0,
      noiseByType: {},
      lastNoiseTime: null,
      canvasModifications: 0,
      webglModifications: 0
    };
  }

  /**
   * Update configuration
   * @param {Object} newConfig - New configuration
   */
  updateConfig(newConfig) {
    try {
      this.config = { ...this.config, ...newConfig };
      logger.info('Canvas noise configuration updated', { config: this.config });
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
      if (!Array.isArray(this.config.noiseTypes) || this.config.noiseTypes.length === 0) {
        logger.error('Noise types must be a non-empty array');
        return false;
      }
      
      if (!['low', 'medium', 'high'].includes(this.config.intensity)) {
        logger.error('Intensity must be low, medium, or high');
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
      logger.info('Canvas noise cleaned up');
      return true;
    } catch (error) {
      logger.error('Error cleaning up canvas noise', { error });
      return false;
    }
  }
}

/**
 * Create canvas noise instance
 * @param {Object} config - Configuration object
 * @returns {CanvasNoise} - Noise instance
 */
export function createCanvasNoise(config = {}) {
  return new CanvasNoise(config);
}

/**
 * Default canvas noise instance
 */
export const canvasNoise = createCanvasNoise();
