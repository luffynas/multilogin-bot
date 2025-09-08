/**
 * Content script for autoscroll extension
 */

import { createLogger } from '../utils/logger.js';
import { engine, ENGINE_STATES, ENGINE_EVENTS } from '../core/engine.js';
import { initializeProfiles } from '../core/profiles.js';

const logger = createLogger('content');

/**
 * Content Script Controller
 */
class ContentScriptController {
  constructor() {
    this.isInitialized = false;
    this.isRunning = false;
    this.isPaused = false;
    this.currentConfig = null;
    this.stats = {
      startTime: null,
      endTime: null,
      totalSteps: 0,
      totalDistance: 0,
      totalPauses: 0,
      errors: 0
    };
    
    this.initialize();
  }

  /**
   * Initialize content script
   */
  async initialize() {
    try {
      logger.info('Initializing content script');
      
      // Wait for DOM to be ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.onDOMReady());
      } else {
        await this.onDOMReady();
      }
    } catch (error) {
      logger.error('Error initializing content script', { error });
    }
  }

  /**
   * Handle DOM ready
   */
  async onDOMReady() {
    try {
      // Initialize profiles system
      await initializeProfiles();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Set up engine event listeners
      this.setupEngineListeners();
      
      // Inject core modules
      await this.injectCoreModules();
      
      this.isInitialized = true;
      logger.info('Content script initialized successfully');
      
      // Notify background script
      this.sendMessageToBackground({
        type: 'contentScriptReady',
        data: { url: window.location.href }
      });
    } catch (error) {
      logger.error('Error on DOM ready', { error });
    }
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Message handling from background script and popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
      return true; // Keep message channel open for async response
    });

    // Page visibility changes
    document.addEventListener('visibilitychange', () => {
      this.handleVisibilityChange();
    });

    // Page unload
    window.addEventListener('beforeunload', () => {
      this.handlePageUnload();
    });

    // User interaction detection
    this.setupUserInteractionListeners();
  }

  /**
   * Set up engine event listeners
   */
  setupEngineListeners() {
    engine.on(ENGINE_EVENTS.START, () => {
      this.handleEngineStart();
    });

    engine.on(ENGINE_EVENTS.STOP, () => {
      this.handleEngineStop();
    });

    engine.on(ENGINE_EVENTS.PAUSE, () => {
      this.handleEnginePause();
    });

    engine.on(ENGINE_EVENTS.RESUME, () => {
      this.handleEngineResume();
    });

    engine.on(ENGINE_EVENTS.STEP, (step) => {
      this.handleEngineStep(step);
    });

    engine.on(ENGINE_EVENTS.ERROR, (error) => {
      this.handleEngineError(error);
    });

    engine.on(ENGINE_EVENTS.STATE_CHANGE, (state) => {
      this.handleEngineStateChange(state);
    });
  }

  /**
   * Set up user interaction listeners
   */
  setupUserInteractionListeners() {
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    
    events.forEach(eventType => {
      document.addEventListener(eventType, () => {
        this.handleUserInteraction(eventType);
      }, { passive: true });
    });
  }

  /**
   * Inject core modules into page context
   */
  async injectCoreModules() {
    try {
      // Inject modules directly without creating script element
      if (typeof window !== 'undefined') {
        window.autoscrollExtension = {
          engine: null,
          isInitialized: false
        };
      }
      
      logger.info('Core modules injected successfully');
    } catch (error) {
      logger.error('Error injecting core modules', { error });
    }
  }

  /**
   * Handle message from background script or popup
   * @param {Object} message - Message object
   * @param {Object} sender - Message sender
   * @param {Function} sendResponse - Response function
   */
  async handleMessage(message, sender, sendResponse) {
    try {
      logger.debug('Received message', { message, sender });
      
      switch (message.action) {
        case 'start':
          await this.handleStart(message, sendResponse);
          break;
        case 'stop':
          await this.handleStop(message, sendResponse);
          break;
        case 'pause':
          await this.handlePause(message, sendResponse);
          break;
        case 'resume':
          await this.handleResume(message, sendResponse);
          break;
        case 'getStatus':
          await this.handleGetStatus(message, sendResponse);
          break;
        case 'getStats':
          await this.handleGetStats(message, sendResponse);
          break;
        case 'updateConfig':
          await this.handleUpdateConfig(message, sendResponse);
          break;
        default:
          logger.warn('Unknown message action', { action: message.action });
          sendResponse({ success: false, error: 'Unknown action' });
      }
    } catch (error) {
      logger.error('Error handling message', { error });
      sendResponse({ success: false, error: error.message });
    }
  }

  /**
   * Handle start action
   * @param {Object} message - Message object
   * @param {Function} sendResponse - Response function
   */
  async handleStart(message, sendResponse) {
    try {
      if (this.isRunning) {
        sendResponse({ success: false, error: 'Autoscroll already running' });
        return;
      }
      
      // Store configuration
      this.currentConfig = message.config || {};
      
      // Start engine
      const success = await engine.start(this.currentConfig);
      
      if (success) {
        this.isRunning = true;
        this.isPaused = false;
        this.stats.startTime = Date.now();
        
        logger.info('Autoscroll started', { config: this.currentConfig });
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: 'Failed to start engine' });
      }
    } catch (error) {
      logger.error('Error handling start', { error });
      sendResponse({ success: false, error: error.message });
    }
  }

  /**
   * Handle stop action
   * @param {Object} message - Message object
   * @param {Function} sendResponse - Response function
   */
  async handleStop(message, sendResponse) {
    try {
      if (!this.isRunning) {
        sendResponse({ success: false, error: 'Autoscroll not running' });
        return;
      }
      
      // Stop engine
      const success = await engine.stop();
      
      if (success) {
        this.isRunning = false;
        this.isPaused = false;
        this.stats.endTime = Date.now();
        
        logger.info('Autoscroll stopped', { stats: this.getStats() });
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: 'Failed to stop engine' });
      }
    } catch (error) {
      logger.error('Error handling stop', { error });
      sendResponse({ success: false, error: error.message });
    }
  }

  /**
   * Handle pause action
   * @param {Object} message - Message object
   * @param {Function} sendResponse - Response function
   */
  async handlePause(message, sendResponse) {
    try {
      if (!this.isRunning || this.isPaused) {
        sendResponse({ success: false, error: 'Autoscroll not running or already paused' });
        return;
      }
      
      // Pause engine
      const success = await engine.pause();
      
      if (success) {
        this.isPaused = true;
        this.stats.totalPauses++;
        
        logger.info('Autoscroll paused');
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: 'Failed to pause engine' });
      }
    } catch (error) {
      logger.error('Error handling pause', { error });
      sendResponse({ success: false, error: error.message });
    }
  }

  /**
   * Handle resume action
   * @param {Object} message - Message object
   * @param {Function} sendResponse - Response function
   */
  async handleResume(message, sendResponse) {
    try {
      if (!this.isRunning || !this.isPaused) {
        sendResponse({ success: false, error: 'Autoscroll not running or not paused' });
        return;
      }
      
      // Resume engine
      const success = await engine.resume();
      
      if (success) {
        this.isPaused = false;
        
        logger.info('Autoscroll resumed');
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: 'Failed to resume engine' });
      }
    } catch (error) {
      logger.error('Error handling resume', { error });
      sendResponse({ success: false, error: error.message });
    }
  }

  /**
   * Handle get status action
   * @param {Object} message - Message object
   * @param {Function} sendResponse - Response function
   */
  async handleGetStatus(message, sendResponse) {
    try {
      const status = {
        isRunning: this.isRunning,
        isPaused: this.isPaused,
        engineState: engine.getState(),
        config: this.currentConfig,
        stats: this.getStats()
      };
      
      sendResponse({ success: true, data: status });
    } catch (error) {
      logger.error('Error handling get status', { error });
      sendResponse({ success: false, error: error.message });
    }
  }

  /**
   * Handle get stats action
   * @param {Object} message - Message object
   * @param {Function} sendResponse - Response function
   */
  async handleGetStats(message, sendResponse) {
    try {
      const stats = this.getStats();
      sendResponse({ success: true, data: stats });
    } catch (error) {
      logger.error('Error handling get stats', { error });
      sendResponse({ success: false, error: error.message });
    }
  }

  /**
   * Handle update config action
   * @param {Object} message - Message object
   * @param {Function} sendResponse - Response function
   */
  async handleUpdateConfig(message, sendResponse) {
    try {
      this.currentConfig = { ...this.currentConfig, ...message.config };
      
      // Update engine configuration if running
      if (this.isRunning) {
        // Engine will pick up new configuration on next step
        logger.info('Configuration updated', { config: this.currentConfig });
      }
      
      sendResponse({ success: true });
    } catch (error) {
      logger.error('Error handling update config', { error });
      sendResponse({ success: false, error: error.message });
    }
  }

  /**
   * Handle page visibility change
   */
  handleVisibilityChange() {
    try {
      if (document.hidden) {
        logger.debug('Page hidden');
        // Pause autoscroll when page is hidden
        if (this.isRunning && !this.isPaused) {
          this.handlePause({}, () => {});
        }
      } else {
        logger.debug('Page visible');
        // Resume autoscroll when page is visible
        if (this.isRunning && this.isPaused) {
          this.handleResume({}, () => {});
        }
      }
    } catch (error) {
      logger.error('Error handling visibility change', { error });
    }
  }

  /**
   * Handle page unload
   */
  handlePageUnload() {
    try {
      if (this.isRunning) {
        // Stop autoscroll before page unloads
        this.handleStop({}, () => {});
      }
    } catch (error) {
      logger.error('Error handling page unload', { error });
    }
  }

  /**
   * Handle user interaction
   * @param {string} eventType - Type of user interaction
   */
  handleUserInteraction(eventType) {
    try {
      // Log user interaction for analytics
      logger.debug('User interaction detected', { eventType });
      
      // Update stats
      this.stats.lastUserInteraction = Date.now();
    } catch (error) {
      logger.error('Error handling user interaction', { error });
    }
  }

  /**
   * Engine event handlers
   */
  handleEngineStart() {
    logger.info('Engine started');
    this.sendStatusUpdate();
  }

  handleEngineStop() {
    logger.info('Engine stopped');
    this.sendStatusUpdate();
  }

  handleEnginePause() {
    logger.info('Engine paused');
    this.sendStatusUpdate();
  }

  handleEngineResume() {
    logger.info('Engine resumed');
    this.sendStatusUpdate();
  }

  handleEngineStep(step) {
    logger.debug('Engine step executed', { step });
    this.stats.totalSteps++;
    this.stats.totalDistance += Math.abs(step.delta || 0);
    this.sendStatsUpdate();
  }

  handleEngineError(error) {
    logger.error('Engine error', { error });
    this.stats.errors++;
    this.sendErrorUpdate(error);
  }

  handleEngineStateChange(state) {
    logger.debug('Engine state changed', { state });
    this.sendStatusUpdate();
  }

  /**
   * Send message to background script
   * @param {Object} message - Message to send
   */
  sendMessageToBackground(message) {
    try {
      chrome.runtime.sendMessage(message);
    } catch (error) {
      logger.error('Error sending message to background', { error });
    }
  }

  /**
   * Send status update to popup
   */
  sendStatusUpdate() {
    this.sendMessageToBackground({
      type: 'statusUpdate',
      data: {
        isRunning: this.isRunning,
        isPaused: this.isPaused,
        engineState: engine.getState()
      }
    });
  }

  /**
   * Send statistics update to popup
   */
  sendStatsUpdate() {
    this.sendMessageToBackground({
      type: 'statsUpdate',
      data: this.getStats()
    });
  }

  /**
   * Send error update to popup
   * @param {Error} error - Error object
   */
  sendErrorUpdate(error) {
    this.sendMessageToBackground({
      type: 'error',
      data: {
        message: error.message,
        stack: error.stack
      }
    });
  }

  /**
   * Get current statistics
   * @returns {Object} - Current statistics
   */
  getStats() {
    const now = Date.now();
    const duration = this.stats.startTime ? 
      (this.stats.endTime || now) - this.stats.startTime : 0;
    
    return {
      ...this.stats,
      duration: Math.floor(duration / 1000), // Convert to seconds
      isRunning: this.isRunning,
      isPaused: this.isPaused
    };
  }
}

// Initialize content script when loaded
new ContentScriptController();
