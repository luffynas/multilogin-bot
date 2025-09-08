/**
 * Core autoscroll engine - the heart of the system
 */

import { createLogger } from '../utils/logger.js';
import { sleep, addJitter, createCancellableTimeout } from '../utils/time.js';
import { getProfileValue } from './profiles.js';
import { randScrollStep, randDelay, jitter } from './randomizer.js';
import { noiseEventsGenerator } from '../stealth/noiseEvents.js';
import { tabAwarenessManager } from '../stealth/tabAwareness.js';
import { cursorSimulator } from '../stealth/cursorSimulator.js';
import { gestureSimulator } from '../stealth/gestureSimulator.js';
import { canvasNoise } from '../stealth/canvasNoise.js';
import { hoverSimulator } from '../stealth/hoverSimulator.js';
import { dwellTimeSimulator } from '../stealth/dwellTimeSimulator.js';
import { errorSimulator } from '../stealth/errorSimulator.js';
import { fingerprintVariation } from '../stealth/fingerprintVariation.js';
import { statsCollector } from '../analytics/statsCollector.js';
import { heatmapGenerator } from '../analytics/heatmap.js';
import { sessionTimelineTracker } from '../analytics/sessionTimeline.js';
import { contentEstimator } from '../analytics/estimator.js';
import { patternGenerator } from '../ai/patternGenerator.js';
import { behaviorLearner } from '../ai/behaviorLearner.js';
import { debugOverlay } from '../debug/debugOverlay.js';
import { heatmapOverlay } from '../debug/heatmapOverlay.js';
import { patternReplayManager } from './patternReplay.js';
import { viewportManager } from './viewport.js';
import { fingerprintManager } from './fingerprint.js';
import { adSenseDetector } from '../detectors/adsenseDetector.js';
import { navigationDetector } from '../detectors/navigationDetector.js';
import { paginationDetector } from '../detectors/paginationDetector.js';
import { keywordDetector } from '../detectors/keywordDetector.js';
import { navigationController } from '../navigation/navigationController.js';
import { linkParser } from '../navigation/linkParser.js';
import { tabManager } from '../navigation/tabManager.js';
import { outboundNavigator } from '../navigation/outboundNavigator.js';
import { sessionManager } from '../ai/sessionManager.js';

// Import all strategies and adapters statically
import * as linearStrategy from '../strategies/linear.js';
import * as burstStrategy from '../strategies/burst.js';
import * as idleStrategy from '../strategies/idle.js';
import * as momentumStrategy from '../strategies/momentum.js';

import * as desktopAdapter from '../adapters/desktop.js';
import * as mobileAdapter from '../adapters/mobile.js';

const logger = createLogger('engine');

// Strategy and adapter registries
const STRATEGY_REGISTRY = {
  linear: linearStrategy,
  burst: burstStrategy,
  idle: idleStrategy,
  momentum: momentumStrategy
};

const ADAPTER_REGISTRY = {
  desktop: desktopAdapter,
  mobile: mobileAdapter
};

/**
 * Engine states
 */
export const ENGINE_STATES = {
  STOPPED: 'stopped',
  STARTING: 'starting',
  RUNNING: 'running',
  PAUSED: 'paused',
  STOPPING: 'stopping',
  ERROR: 'error'
};

/**
 * Engine events
 */
export const ENGINE_EVENTS = {
  START: 'start',
  STOP: 'stop',
  PAUSE: 'pause',
  RESUME: 'resume',
  STEP: 'step',
  ERROR: 'error',
  STATE_CHANGE: 'stateChange'
};

/**
 * Core Engine Class
 */
export class AutoscrollEngine {
  constructor() {
    this.state = ENGINE_STATES.STOPPED;
    this.isRunning = false;
    this.currentStrategy = null;
    this.currentAdapter = null;
    this.eventListeners = new Map();
    this.scheduler = null;
    this.stats = {
      startTime: null,
      endTime: null,
      totalSteps: 0,
      totalDistance: 0,
      totalPauses: 0,
      errors: 0
    };
    this.config = {};
    
    // Initialize stealth modules
    this.noiseGenerator = noiseEventsGenerator;
    this.tabAwareness = tabAwarenessManager;
    this.cursorSimulator = cursorSimulator;
    this.gestureSimulator = gestureSimulator;
    this.canvasNoise = canvasNoise;
    this.hoverSimulator = hoverSimulator;
    this.dwellTimeSimulator = dwellTimeSimulator;
    this.errorSimulator = errorSimulator;
    this.fingerprintVariation = fingerprintVariation;
    this.statsCollector = statsCollector;
    
    // Initialize detection modules
    this.adSenseDetector = adSenseDetector;
    this.navigationDetector = navigationDetector;
    this.paginationDetector = paginationDetector;
    this.keywordDetector = keywordDetector;
    
    // Initialize navigation modules
    this.navigationController = navigationController;
    this.linkParser = linkParser;
    this.tabManager = tabManager;
    this.outboundNavigator = outboundNavigator;
    
    // Initialize AI modules
    this.sessionManager = sessionManager;
    
    // Initialize Analytics modules
    this.statsCollector = statsCollector;
    this.heatmapGenerator = heatmapGenerator;
    this.sessionTimelineTracker = sessionTimelineTracker;
    this.contentEstimator = contentEstimator;
    
    // Initialize AI modules
    this.patternGenerator = patternGenerator;
    this.behaviorLearner = behaviorLearner;
    
    // Initialize Debug modules
    this.debugOverlay = debugOverlay;
    this.heatmapOverlay = heatmapOverlay;
    
    // Initialize Core modules
    this.patternReplayManager = patternReplayManager;
    this.viewportManager = viewportManager;
    this.fingerprintManager = fingerprintManager;
  }

  /**
   * Start the engine
   * @param {Object} config - Engine configuration
   * @returns {Promise<boolean>} - Success status
   */
  async start(config = {}) {
    try {
      if (this.isRunning) {
        logger.warn('Engine already running');
        return false;
      }

      logger.info('Starting autoscroll engine', { config });
      
      this.state = ENGINE_STATES.STARTING;
      this.emit(ENGINE_EVENTS.STATE_CHANGE, this.state);
      
      // Merge configuration with profile
      this.config = this.mergeConfig(config);
      
      // Initialize stealth modules
      await this.initializeStealthModules();
      
      // Initialize detection modules
      await this.initializeDetectionModules();
      
      // Initialize navigation modules
      await this.initializeNavigationModules();
      
      // Initialize AI modules
      await this.initializeAIModules();
      
      // Initialize Analytics modules
      await this.initializeAnalyticsModules();
      
      // Initialize Debug modules
      await this.initializeDebugModules();
      
      // Initialize Core modules
      await this.initializeCoreModules();
      
      // Initialize strategy and adapter
      await this.initializeStrategy();
      await this.initializeAdapter();
      
      // Reset stats
      this.resetStats();
      this.stats.startTime = Date.now();
      
      // Start the main loop
      this.isRunning = true;
      this.state = ENGINE_STATES.RUNNING;
      this.emit(ENGINE_EVENTS.STATE_CHANGE, this.state);
      this.emit(ENGINE_EVENTS.START);
      
      // Start scheduler
      this.startScheduler();
      
      logger.info('Autoscroll engine started successfully');
      return true;
    } catch (error) {
      logger.error('Error starting engine', { error });
      this.state = ENGINE_STATES.ERROR;
      this.emit(ENGINE_EVENTS.STATE_CHANGE, this.state);
      this.emit(ENGINE_EVENTS.ERROR, error);
      return false;
    }
  }

  /**
   * Stop the engine
   * @returns {Promise<boolean>} - Success status
   */
  async stop() {
    try {
      if (!this.isRunning) {
        logger.warn('Engine not running');
        return false;
      }

      logger.info('Stopping autoscroll engine');
      
      this.state = ENGINE_STATES.STOPPING;
      this.emit(ENGINE_EVENTS.STATE_CHANGE, this.state);
      
      // Stop stealth modules
      await this.stopStealthModules();
      
      // Stop detection modules
      await this.stopDetectionModules();
      
      // Stop navigation modules
      await this.stopNavigationModules();
      
      // Stop AI modules
      await this.stopAIModules();
      
      // Stop Analytics modules
      await this.stopAnalyticsModules();
      
      // Stop Debug modules
      await this.stopDebugModules();
      
      // Stop Core modules
      await this.stopCoreModules();
      
      // Stop scheduler
      this.stopScheduler();
      
      // Update stats
      this.stats.endTime = Date.now();
      
      this.isRunning = false;
      this.state = ENGINE_STATES.STOPPED;
      this.emit(ENGINE_EVENTS.STATE_CHANGE, this.state);
      this.emit(ENGINE_EVENTS.STOP);
      
      logger.info('Autoscroll engine stopped successfully', { 
        stats: this.getStats() 
      });
      return true;
    } catch (error) {
      logger.error('Error stopping engine', { error });
      this.state = ENGINE_STATES.ERROR;
      this.emit(ENGINE_EVENTS.STATE_CHANGE, this.state);
      this.emit(ENGINE_EVENTS.ERROR, error);
      return false;
    }
  }

  /**
   * Pause the engine
   * @param {number} duration - Pause duration in ms (optional)
   * @returns {Promise<boolean>} - Success status
   */
  async pause(duration = null) {
    try {
      if (!this.isRunning) {
        logger.warn('Engine not running');
        return false;
      }

      logger.info('Pausing autoscroll engine', { duration });
      
      this.state = ENGINE_STATES.PAUSED;
      this.emit(ENGINE_EVENTS.STATE_CHANGE, this.state);
      this.emit(ENGINE_EVENTS.PAUSE);
      
      if (duration) {
        await sleep(duration);
        return await this.resume();
      }
      
      return true;
    } catch (error) {
      logger.error('Error pausing engine', { error });
      this.state = ENGINE_STATES.ERROR;
      this.emit(ENGINE_EVENTS.STATE_CHANGE, this.state);
      this.emit(ENGINE_EVENTS.ERROR, error);
      return false;
    }
  }

  /**
   * Resume the engine
   * @returns {Promise<boolean>} - Success status
   */
  async resume() {
    try {
      if (this.state !== ENGINE_STATES.PAUSED) {
        logger.warn('Engine not paused');
        return false;
      }

      logger.info('Resuming autoscroll engine');
      
      this.state = ENGINE_STATES.RUNNING;
      this.emit(ENGINE_EVENTS.STATE_CHANGE, this.state);
      this.emit(ENGINE_EVENTS.RESUME);
      
      return true;
    } catch (error) {
      logger.error('Error resuming engine', { error });
      this.state = ENGINE_STATES.ERROR;
      this.emit(ENGINE_EVENTS.STATE_CHANGE, this.state);
      this.emit(ENGINE_EVENTS.ERROR, error);
      return false;
    }
  }

  /**
   * Initialize stealth modules
   * @returns {Promise<boolean>} - Success status
   */
  async initializeStealthModules() {
    try {
      // Initialize noise events generator
      if (this.config.stealth?.noiseEvents?.enabled) {
        await this.noiseGenerator.initialize(this.config.stealth.noiseEvents);
        await this.noiseGenerator.start();
        logger.info('Noise events generator initialized');
      }
      
      // Initialize tab awareness manager
      if (this.config.stealth?.tabAwareness?.enabled) {
        await this.tabAwareness.initialize(this.config.stealth.tabAwareness);
        await this.tabAwareness.start();
        logger.info('Tab awareness manager initialized');
      }
      
      // Initialize cursor simulator
      if (this.config.stealth?.cursorSimulator?.enabled) {
        await this.cursorSimulator.initialize(this.config.stealth.cursorSimulator);
        await this.cursorSimulator.start();
        logger.info('Cursor simulator initialized');
      }
      
      // Initialize gesture simulator
      if (this.config.stealth?.gestureSimulator?.enabled) {
        await this.gestureSimulator.initialize(this.config.stealth.gestureSimulator);
        await this.gestureSimulator.start();
        logger.info('Gesture simulator initialized');
      }
      
      // Initialize canvas noise
      if (this.config.stealth?.canvasNoise?.enabled) {
        await this.canvasNoise.initialize(this.config.stealth.canvasNoise);
        await this.canvasNoise.start();
        logger.info('Canvas noise initialized');
      }
      
      // Initialize hover simulator
      if (this.config.stealth?.hoverSimulator?.enabled) {
        await this.hoverSimulator.initialize(this.config.stealth.hoverSimulator);
        await this.hoverSimulator.start();
        logger.info('Hover simulator initialized');
      }
      
      // Initialize dwell time simulator
      if (this.config.stealth?.dwellTimeSimulator?.enabled) {
        await this.dwellTimeSimulator.initialize(this.config.stealth.dwellTimeSimulator);
        await this.dwellTimeSimulator.start();
        logger.info('Dwell time simulator initialized');
      }
      
      // Initialize error simulator
      if (this.config.stealth?.errorSimulator?.enabled) {
        await this.errorSimulator.initialize(this.config.stealth.errorSimulator);
        await this.errorSimulator.start();
        logger.info('Error simulator initialized');
      }
      
      // Initialize fingerprint variation
      if (this.config.stealth?.fingerprintVariation?.enabled) {
        await this.fingerprintVariation.initialize(this.config.stealth.fingerprintVariation);
        await this.fingerprintVariation.start();
        logger.info('Fingerprint variation initialized');
      }
      
      // Initialize statistics collector
      if (this.config.analytics?.enabled) {
        await this.statsCollector.initialize(this.config.analytics);
        await this.statsCollector.start();
        logger.info('Statistics collector initialized');
      }
      
      return true;
    } catch (error) {
      logger.error('Error initializing stealth modules', { error });
      return false;
    }
  }

  /**
   * Stop stealth modules
   * @returns {Promise<boolean>} - Success status
   */
  async stopStealthModules() {
    try {
      // Stop noise events generator
      if (this.noiseGenerator.isActive) {
        await this.noiseGenerator.stop();
        logger.info('Noise events generator stopped');
      }
      
      // Stop tab awareness manager
      if (this.tabAwareness.isActive) {
        await this.tabAwareness.stop();
        logger.info('Tab awareness manager stopped');
      }
      
      // Stop cursor simulator
      if (this.cursorSimulator.isActive) {
        await this.cursorSimulator.stop();
        logger.info('Cursor simulator stopped');
      }
      
      // Stop gesture simulator
      if (this.gestureSimulator.isActive) {
        await this.gestureSimulator.stop();
        logger.info('Gesture simulator stopped');
      }
      
      // Stop canvas noise
      if (this.canvasNoise.isActive) {
        await this.canvasNoise.stop();
        logger.info('Canvas noise stopped');
      }
      
      // Stop hover simulator
      if (this.hoverSimulator.isActive) {
        await this.hoverSimulator.stop();
        logger.info('Hover simulator stopped');
      }
      
      // Stop dwell time simulator
      if (this.dwellTimeSimulator.isActive) {
        await this.dwellTimeSimulator.stop();
        logger.info('Dwell time simulator stopped');
      }
      
      // Stop error simulator
      if (this.errorSimulator.isActive) {
        await this.errorSimulator.stop();
        logger.info('Error simulator stopped');
      }
      
      // Stop fingerprint variation
      if (this.fingerprintVariation.isActive) {
        await this.fingerprintVariation.stop();
        logger.info('Fingerprint variation stopped');
      }
      
      // Stop statistics collector
      if (this.statsCollector.isActive) {
        await this.statsCollector.stop();
        logger.info('Statistics collector stopped');
      }
      
      return true;
    } catch (error) {
      logger.error('Error stopping stealth modules', { error });
      return false;
    }
  }

  /**
   * Initialize detection modules
   * @returns {Promise<boolean>} - Success status
   */
  async initializeDetectionModules() {
    try {
      // Initialize AdSense detector
      if (this.config.detectors?.adsense?.enabled) {
        await this.adSenseDetector.initialize(this.config.detectors.adsense);
        await this.adSenseDetector.start();
        logger.info('AdSense detector initialized');
      }
      
      // Initialize navigation detector
      if (this.config.detectors?.navigation?.enabled) {
        await this.navigationDetector.initialize(this.config.detectors.navigation);
        await this.navigationDetector.start();
        logger.info('Navigation detector initialized');
      }
      
      // Initialize pagination detector
      if (this.config.detectors?.pagination?.enabled) {
        await this.paginationDetector.initialize(this.config.detectors.pagination);
        await this.paginationDetector.start();
        logger.info('Pagination detector initialized');
      }
      
      // Initialize keyword detector
      if (this.config.detectors?.keyword?.enabled) {
        await this.keywordDetector.initialize(this.config.detectors.keyword);
        await this.keywordDetector.start();
        logger.info('Keyword detector initialized');
      }
      
      return true;
    } catch (error) {
      logger.error('Error initializing detection modules', { error });
      return false;
    }
  }

  /**
   * Stop detection modules
   * @returns {Promise<boolean>} - Success status
   */
  async stopDetectionModules() {
    try {
      // Stop AdSense detector
      if (this.adSenseDetector.isActive) {
        await this.adSenseDetector.stop();
        logger.info('AdSense detector stopped');
      }
      
      // Stop navigation detector
      if (this.navigationDetector.isActive) {
        await this.navigationDetector.stop();
        logger.info('Navigation detector stopped');
      }
      
      // Stop pagination detector
      if (this.paginationDetector.isActive) {
        await this.paginationDetector.stop();
        logger.info('Pagination detector stopped');
      }
      
      // Stop keyword detector
      if (this.keywordDetector.isActive) {
        await this.keywordDetector.stop();
        logger.info('Keyword detector stopped');
      }
      
      return true;
    } catch (error) {
      logger.error('Error stopping detection modules', { error });
      return false;
    }
  }

  /**
   * Initialize navigation modules
   * @returns {Promise<boolean>} - Success status
   */
  async initializeNavigationModules() {
    try {
      // Initialize navigation controller
      if (this.config.navigation?.enabled) {
        await this.navigationController.initialize(this.config.navigation);
        await this.navigationController.start();
        logger.info('Navigation controller initialized');
      }
      
      // Initialize link parser
      if (this.config.linkParser?.enabled) {
        await this.linkParser.initialize(this.config.linkParser);
        logger.info('Link parser initialized');
      }
      
      // Initialize tab manager
      if (this.config.tabManager?.enabled) {
        await this.tabManager.initialize(this.config.tabManager);
        await this.tabManager.start();
        logger.info('Tab manager initialized');
      }
      
      // Initialize outbound navigator
      if (this.config.outboundNavigator?.enabled) {
        await this.outboundNavigator.initialize(this.config.outboundNavigator);
        await this.outboundNavigator.start();
        logger.info('Outbound navigator initialized');
      }
      
      return true;
    } catch (error) {
      logger.error('Error initializing navigation modules', { error });
      return false;
    }
  }

  /**
   * Stop navigation modules
   * @returns {Promise<boolean>} - Success status
   */
  async stopNavigationModules() {
    try {
      // Stop navigation controller
      if (this.navigationController.isActive) {
        await this.navigationController.stop();
        logger.info('Navigation controller stopped');
      }
      
      // Stop tab manager
      if (this.tabManager.isActive) {
        await this.tabManager.stop();
        logger.info('Tab manager stopped');
      }
      
      // Stop outbound navigator
      if (this.outboundNavigator.isActive) {
        await this.outboundNavigator.stop();
        logger.info('Outbound navigator stopped');
      }
      
      return true;
    } catch (error) {
      logger.error('Error stopping navigation modules', { error });
      return false;
    }
  }

  /**
   * Initialize AI modules
   * @returns {Promise<boolean>} - Success status
   */
  async initializeAIModules() {
    try {
      // Initialize session manager
      if (this.config.ai?.sessionManager?.enabled) {
        await this.sessionManager.initialize(this.config.ai.sessionManager);
        await this.sessionManager.start();
        logger.info('Session manager initialized');
      }
      
      return true;
    } catch (error) {
      logger.error('Error initializing AI modules', { error });
      return false;
    }
  }

  /**
   * Stop AI modules
   * @returns {Promise<boolean>} - Success status
   */
  async stopAIModules() {
    try {
      // Stop session manager
      if (this.sessionManager.isActive) {
        await this.sessionManager.stop();
        logger.info('Session manager stopped');
      }
      
      return true;
    } catch (error) {
      logger.error('Error stopping AI modules', { error });
      return false;
    }
  }

  /**
   * Set scroll strategy
   * @param {string} strategyName - Strategy name
   * @returns {Promise<boolean>} - Success status
   */
  async setStrategy(strategyName) {
    try {
      logger.info('Setting scroll strategy', { strategyName });
      
      // Get strategy from registry
      const strategyModule = STRATEGY_REGISTRY[strategyName];
      if (!strategyModule) {
        throw new Error(`Strategy '${strategyName}' not found in registry`);
      }
      
      this.currentStrategy = strategyModule;
      
      logger.info('Scroll strategy set successfully', { strategyName });
      return true;
    } catch (error) {
      logger.error('Error setting strategy', { strategyName, error });
      return false;
    }
  }

  /**
   * Set scroll adapter
   * @param {string} adapterName - Adapter name
   * @returns {Promise<boolean>} - Success status
   */
  async setAdapter(adapterName) {
    try {
      logger.info('Setting scroll adapter', { adapterName });
      
      // Get adapter from registry
      const adapterModule = ADAPTER_REGISTRY[adapterName];
      if (!adapterModule) {
        throw new Error(`Adapter '${adapterName}' not found in registry`);
      }
      
      this.currentAdapter = adapterModule;
      
      logger.info('Scroll adapter set successfully', { adapterName });
      return true;
    } catch (error) {
      logger.error('Error setting adapter', { adapterName, error });
      return false;
    }
  }

  /**
   * Start the main scheduler
   */
  startScheduler() {
    if (this.scheduler) {
      this.stopScheduler();
    }

    this.scheduler = this.createScheduler();
  }

  /**
   * Stop the scheduler
   */
  stopScheduler() {
    if (this.scheduler) {
      this.scheduler.cancel();
      this.scheduler = null;
    }
  }

  /**
   * Create the main scheduler
   * @returns {Object} - Scheduler object
   */
  createScheduler() {
    const scheduleNext = () => {
      if (!this.isRunning || this.state !== ENGINE_STATES.RUNNING) {
        return;
      }

      try {
        // Get next step from strategy
        const step = this.getNextStep();
        if (!step) {
          logger.warn('No step available from strategy');
          return;
        }

        // Execute step
        this.executeStep(step);

        // Schedule next step
        const delay = this.calculateDelay(step);
        const timeout = createCancellableTimeout(delay);
        
        timeout.promise.then(() => {
          if (this.isRunning) {
            scheduleNext();
          }
        });

        return timeout;
      } catch (error) {
        logger.error('Error in scheduler', { error });
        this.stats.errors++;
        this.emit(ENGINE_EVENTS.ERROR, error);
      }
    };

    // Start the first step
    const firstTimeout = scheduleNext();
    
    return {
      cancel: () => {
        if (firstTimeout) {
          firstTimeout.cancel();
        }
      }
    };
  }

  /**
   * Get next step from current strategy
   * @returns {Object|null} - Next step or null
   */
  getNextStep() {
    if (!this.currentStrategy || !this.currentStrategy.nextStep) {
      return null;
    }

    try {
      const context = this.createStepContext();
      return this.currentStrategy.nextStep(context);
    } catch (error) {
      logger.error('Error getting next step', { error });
      return null;
    }
  }

  /**
   * Create step context
   * @returns {Object} - Step context
   */
  createStepContext() {
    return {
      config: this.config,
      stats: this.stats,
      state: this.state,
      profile: getProfileValue('scroll', {}),
      randomizer: {
        randScrollStep,
        randDelay,
        jitter
      }
    };
  }

  /**
   * Execute a scroll step
   * @param {Object} step - Step configuration
   */
  async executeStep(step) {
    try {
      if (!this.currentAdapter || !this.currentAdapter.scroll) {
        logger.warn('No adapter available for scrolling');
        return;
      }

      // Execute scroll
      await this.currentAdapter.scroll(step);
      
      // Update stats
      this.stats.totalSteps++;
      this.stats.totalDistance += Math.abs(step.delta || 0);
      
      // Record analytics data
      await this.recordAnalyticsData('scroll', {
        delta: step.delta,
        speed: step.speed,
        strategy: step.strategy,
        timestamp: Date.now()
      });
      
      // Record heatmap data
      await this.recordHeatmapData('scroll', {
        x: window.innerWidth / 2,
        y: window.scrollY + window.innerHeight / 2,
        delta: step.delta,
        intensity: Math.abs(step.delta) / 100
      });
      
      // Record pattern replay data
      await this.recordPatternData('scroll', step);
      
      // Update debug overlay
      this.updateDebugOverlay();
      
      // Emit step event
      this.emit(ENGINE_EVENTS.STEP, step);
      
      logger.debug('Step executed', { step, stats: this.stats });
    } catch (error) {
      logger.error('Error executing step', { error, step });
      this.stats.errors++;
      this.emit(ENGINE_EVENTS.ERROR, error);
    }
  }

  /**
   * Calculate delay for next step
   * @param {Object} step - Current step
   * @returns {number} - Delay in ms
   */
  calculateDelay(step) {
    const baseDelay = step.duration || getProfileValue('scroll.minDelay', 100);
    const maxDelay = getProfileValue('scroll.maxDelay', 500);
    const jitterPercent = getProfileValue('scroll.jitter', 0.1);
    
    // Add jitter to delay
    const jitteredDelay = addJitter(baseDelay, jitterPercent);
    
    // Ensure delay is within bounds
    return Math.max(baseDelay, Math.min(maxDelay, jitteredDelay));
  }

  /**
   * Initialize strategy
   */
  async initializeStrategy() {
    const strategyName = this.config.strategy || getProfileValue('scroll.strategy', 'linear');
    await this.setStrategy(strategyName);
  }

  /**
   * Initialize adapter
   */
  async initializeAdapter() {
    // Detect platform and set appropriate adapter
    const isMobile = this.detectMobile();
    const adapterName = isMobile ? 'mobile' : 'desktop';
    await this.setAdapter(adapterName);
  }

  /**
   * Detect if running on mobile
   * @returns {boolean} - True if mobile
   */
  detectMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  /**
   * Merge configuration with profile
   * @param {Object} config - User configuration
   * @returns {Object} - Merged configuration
   */
  mergeConfig(config) {
    const profile = getProfileValue('scroll', {});
    return {
      ...profile,
      ...config
    };
  }

  /**
   * Initialize Analytics modules
   */
  async initializeAnalyticsModules() {
    try {
      logger.info('Initializing Analytics modules');
      
      // Initialize stats collector
      await this.statsCollector.initialize(this.config.analytics?.statsCollector);
      
      // Initialize heatmap generator
      await this.heatmapGenerator.initialize(this.config.analytics?.heatmap);
      
      // Initialize session timeline tracker
      await this.sessionTimelineTracker.initialize(this.config.analytics?.sessionTimeline);
      
      // Initialize content estimator
      await this.contentEstimator.initialize(this.config.analytics?.estimator);
      
      logger.info('Analytics modules initialized successfully');
    } catch (error) {
      logger.error('Error initializing Analytics modules', { error });
    }
  }

  /**
   * Initialize Debug modules
   */
  async initializeDebugModules() {
    try {
      logger.info('Initializing Debug modules');
      
      // Initialize debug overlay
      await this.debugOverlay.initialize(this.config.debug?.overlay);
      
      // Initialize heatmap overlay
      await this.heatmapOverlay.initialize(this.config.debug?.heatmapOverlay);
      
      logger.info('Debug modules initialized successfully');
    } catch (error) {
      logger.error('Error initializing Debug modules', { error });
    }
  }

  /**
   * Initialize Core modules
   */
  async initializeCoreModules() {
    try {
      logger.info('Initializing Core modules');
      
      // Initialize pattern replay manager
      await this.patternReplayManager.initialize(this.config.core?.patternReplay);
      
      // Initialize viewport manager
      await this.viewportManager.initialize(this.config.core?.viewport);
      
      // Initialize fingerprint manager
      await this.fingerprintManager.initialize(this.config.core?.fingerprint);
      
      logger.info('Core modules initialized successfully');
    } catch (error) {
      logger.error('Error initializing Core modules', { error });
    }
  }

  /**
   * Stop Analytics modules
   */
  async stopAnalyticsModules() {
    try {
      logger.info('Stopping Analytics modules');
      
      // Stop stats collector
      await this.statsCollector.stopCollection();
      
      // Stop heatmap generator
      await this.heatmapGenerator.stopTracking();
      
      // Stop session timeline tracker
      await this.sessionTimelineTracker.stopTracking();
      
      // Stop content estimator
      await this.contentEstimator.stopEstimation();
      
      logger.info('Analytics modules stopped successfully');
    } catch (error) {
      logger.error('Error stopping Analytics modules', { error });
    }
  }

  /**
   * Stop Debug modules
   */
  async stopDebugModules() {
    try {
      logger.info('Stopping Debug modules');
      
      // Stop debug overlay
      await this.debugOverlay.hide();
      
      // Stop heatmap overlay
      await this.heatmapOverlay.hide();
      
      logger.info('Debug modules stopped successfully');
    } catch (error) {
      logger.error('Error stopping Debug modules', { error });
    }
  }

  /**
   * Stop Core modules
   */
  async stopCoreModules() {
    try {
      logger.info('Stopping Core modules');
      
      // Stop pattern replay manager
      await this.patternReplayManager.stopReplay();
      
      // Stop viewport manager
      await this.viewportManager.stopTracking();
      
      // Stop fingerprint manager (no stop method needed)
      
      logger.info('Core modules stopped successfully');
    } catch (error) {
      logger.error('Error stopping Core modules', { error });
    }
  }

  /**
   * Record analytics data
   * @param {string} type - Data type
   * @param {Object} data - Data to record
   */
  async recordAnalyticsData(type, data) {
    try {
      // Record in stats collector
      await this.statsCollector.recordEvent(type, data);
      
      // Record in session timeline
      await this.sessionTimelineTracker.recordEvent(type, data);
      
      // Learn from behavior
      await this.behaviorLearner.learnFromBehavior(type, data);
    } catch (error) {
      logger.error('Error recording analytics data', { error, type, data });
    }
  }

  /**
   * Record heatmap data
   * @param {string} type - Data type
   * @param {Object} data - Data to record
   */
  async recordHeatmapData(type, data) {
    try {
      switch (type) {
        case 'scroll':
          await this.heatmapGenerator.recordScroll(data);
          await this.heatmapOverlay.addScrollData(data);
          break;
        case 'click':
          await this.heatmapGenerator.recordClick(data);
          await this.heatmapOverlay.addClickData(data);
          break;
        case 'hover':
          await this.heatmapGenerator.recordHover(data);
          await this.heatmapOverlay.addHoverData(data);
          break;
        case 'dwell':
          await this.heatmapGenerator.recordDwell(data);
          break;
      }
    } catch (error) {
      logger.error('Error recording heatmap data', { error, type, data });
    }
  }

  /**
   * Record pattern data
   * @param {string} type - Data type
   * @param {Object} data - Data to record
   */
  async recordPatternData(type, data) {
    try {
      await this.patternReplayManager.recordEvent(type, data);
    } catch (error) {
      logger.error('Error recording pattern data', { error, type, data });
    }
  }

  /**
   * Update debug overlay
   */
  updateDebugOverlay() {
    try {
      if (this.debugOverlay) {
        this.debugOverlay.updateDebugData('engine', {
          status: this.state,
          active: this.isRunning,
          strategy: this.currentStrategy?.name || 'None',
          scrollPosition: window.scrollY,
          totalDistance: this.stats.totalDistance,
          steps: this.stats.totalSteps,
          speed: this.stats.totalDistance / (Date.now() - this.stats.startTime) * 1000,
          paused: this.state === ENGINE_STATES.PAUSED
        });
        
        this.debugOverlay.updateDebugData('analytics', {
          sessionDuration: Date.now() - this.stats.startTime,
          pagesVisited: 1,
          totalEvents: this.stats.totalSteps,
          scrollEvents: this.stats.totalSteps,
          navigationEvents: 0,
          stealthEvents: 0,
          behaviorScore: 0.5,
          efficiency: this.stats.totalSteps > 0 ? this.stats.totalDistance / this.stats.totalSteps : 0
        });
        
        this.debugOverlay.updateDebugData('performance', {
          memoryUsage: performance.memory ? performance.memory.usedJSHeapSize / 1024 / 1024 : 0,
          cpuUsage: 0,
          responseTime: 0,
          errorRate: this.stats.errors / Math.max(this.stats.totalSteps, 1),
          successRate: 1 - (this.stats.errors / Math.max(this.stats.totalSteps, 1)),
          fps: 60,
          loadTime: 0,
          lastUpdate: new Date().toLocaleTimeString()
        });
      }
    } catch (error) {
      logger.error('Error updating debug overlay', { error });
    }
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      startTime: null,
      endTime: null,
      totalSteps: 0,
      totalDistance: 0,
      totalPauses: 0,
      errors: 0
    };
  }

  /**
   * Get current statistics
   * @returns {Object} - Current statistics
   */
  getStats() {
    const now = Date.now();
    const duration = this.stats.startTime ? now - this.stats.startTime : 0;
    
    return {
      ...this.stats,
      duration,
      isRunning: this.isRunning,
      state: this.state
    };
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
          logger.error('Error in event listener', { event, error });
        }
      });
    }
  }

  /**
   * Get current state
   * @returns {string} - Current state
   */
  getState() {
    return this.state;
  }

  /**
   * Check if engine is running
   * @returns {boolean} - True if running
   */
  isEngineRunning() {
    return this.isRunning;
  }
}

/**
 * Create engine instance
 * @returns {AutoscrollEngine} - Engine instance
 */
export function createEngine() {
  return new AutoscrollEngine();
}

/**
 * Default engine instance
 */
export const engine = createEngine();
