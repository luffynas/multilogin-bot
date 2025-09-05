/**
 * Tests for stealth modules
 */

import { NoiseEventsGenerator } from '../src/stealth/noiseEvents.js';
import { TabAwarenessManager } from '../src/stealth/tabAwareness.js';
import { StatsCollector } from '../src/analytics/statsCollector.js';

describe('Stealth Modules', () => {
  let noiseGenerator;
  let tabAwareness;
  let statsCollector;

  beforeEach(() => {
    noiseGenerator = new NoiseEventsGenerator();
    tabAwareness = new TabAwarenessManager();
    statsCollector = new StatsCollector();
  });

  afterEach(async () => {
    await noiseGenerator.cleanup();
    await tabAwareness.cleanup();
    await statsCollector.cleanup();
  });

  describe('NoiseEventsGenerator', () => {
    test('should initialize correctly', async () => {
      const result = await noiseGenerator.initialize();
      expect(result).toBe(true);
      expect(noiseGenerator.isActive).toBe(false);
    });

    test('should start and stop correctly', async () => {
      await noiseGenerator.initialize();
      
      const startResult = await noiseGenerator.start();
      expect(startResult).toBe(true);
      expect(noiseGenerator.isActive).toBe(true);
      
      const stopResult = await noiseGenerator.stop();
      expect(stopResult).toBe(true);
      expect(noiseGenerator.isActive).toBe(false);
    });

    test('should not start if already active', async () => {
      await noiseGenerator.initialize();
      await noiseGenerator.start();
      
      const result = await noiseGenerator.start();
      expect(result).toBe(false);
    });

    test('should not stop if not active', async () => {
      await noiseGenerator.initialize();
      
      const result = await noiseGenerator.stop();
      expect(result).toBe(false);
    });

    test('should generate mouse move events', async () => {
      await noiseGenerator.initialize();
      await noiseGenerator.start();
      
      // Mock document.body.dispatchEvent
      const mockDispatchEvent = jest.fn();
      document.body.dispatchEvent = mockDispatchEvent;
      
      await noiseGenerator.generateMouseMove();
      
      expect(mockDispatchEvent).toHaveBeenCalled();
    });

    test('should generate key press events', async () => {
      await noiseGenerator.initialize();
      await noiseGenerator.start();
      
      // Mock document.body.dispatchEvent
      const mockDispatchEvent = jest.fn();
      document.body.dispatchEvent = mockDispatchEvent;
      
      await noiseGenerator.generateKeyPress();
      
      expect(mockDispatchEvent).toHaveBeenCalled();
    });

    test('should update configuration', () => {
      const newConfig = { frequency: 0.2, intensity: 'high' };
      noiseGenerator.updateConfig(newConfig);
      
      expect(noiseGenerator.config.frequency).toBe(0.2);
      expect(noiseGenerator.config.intensity).toBe('high');
    });

    test('should track statistics', async () => {
      await noiseGenerator.initialize();
      await noiseGenerator.start();
      
      // Generate some events
      await noiseGenerator.generateMouseMove();
      await noiseGenerator.generateKeyPress();
      
      const stats = noiseGenerator.getStats();
      expect(stats.totalEvents).toBeGreaterThan(0);
      expect(stats.eventsByType).toHaveProperty('mousemove');
      expect(stats.eventsByType).toHaveProperty('keypress');
    });

    test('should reset statistics', async () => {
      await noiseGenerator.initialize();
      await noiseGenerator.start();
      
      // Generate some events
      await noiseGenerator.generateMouseMove();
      
      let stats = noiseGenerator.getStats();
      expect(stats.totalEvents).toBeGreaterThan(0);
      
      noiseGenerator.resetStats();
      
      stats = noiseGenerator.getStats();
      expect(stats.totalEvents).toBe(0);
    });
  });

  describe('TabAwarenessManager', () => {
    test('should initialize correctly', async () => {
      const result = await tabAwareness.initialize();
      expect(result).toBe(true);
      expect(tabAwareness.isActive).toBe(false);
    });

    test('should start and stop correctly', async () => {
      await tabAwareness.initialize();
      
      const startResult = await tabAwareness.start();
      expect(startResult).toBe(true);
      expect(tabAwareness.isActive).toBe(true);
      
      const stopResult = await tabAwareness.stop();
      expect(stopResult).toBe(true);
      expect(tabAwareness.isActive).toBe(false);
    });

    test('should handle visibility change', async () => {
      await tabAwareness.initialize();
      await tabAwareness.start();
      
      // Mock document.hidden
      Object.defineProperty(document, 'hidden', {
        writable: true,
        value: true
      });
      
      // Mock event listener
      const mockListener = jest.fn();
      tabAwareness.on('tabHidden', mockListener);
      
      // Trigger visibility change
      await tabAwareness.handleVisibilityChange();
      
      expect(tabAwareness.isTabVisible).toBe(true);
    });

    test('should handle window focus', async () => {
      await tabAwareness.initialize();
      await tabAwareness.start();
      
      // Mock document.hasFocus
      Object.defineProperty(document, 'hasFocus', {
        writable: true,
        value: jest.fn(() => true)
      });
      
      // Mock event listener
      const mockListener = jest.fn();
      tabAwareness.on('tabFocused', mockListener);
      
      // Trigger focus
      await tabAwareness.handleWindowFocus();
      
      expect(tabAwareness.isTabFocused).toBe(true);
    });

    test('should handle window blur', async () => {
      await tabAwareness.initialize();
      await tabAwareness.start();
      
      // Mock event listener
      const mockListener = jest.fn();
      tabAwareness.on('tabBlurred', mockListener);
      
      // Trigger blur
      await tabAwareness.handleWindowBlur();
      
      expect(tabAwareness.isTabFocused).toBe(false);
    });

    test('should check tab active state', async () => {
      await tabAwareness.initialize();
      await tabAwareness.start();
      
      tabAwareness.isTabVisible = true;
      tabAwareness.isTabFocused = true;
      
      expect(tabAwareness.isTabActive()).toBe(true);
      
      tabAwareness.isTabFocused = false;
      expect(tabAwareness.isTabActive()).toBe(false);
    });

    test('should get tab state', async () => {
      await tabAwareness.initialize();
      await tabAwareness.start();
      
      const state = tabAwareness.getTabState();
      expect(state).toHaveProperty('isVisible');
      expect(state).toHaveProperty('isFocused');
      expect(state).toHaveProperty('isActive');
      expect(state).toHaveProperty('stats');
    });

    test('should update configuration', () => {
      const newConfig = { pauseOnBlur: false, resumeDelay: 2000 };
      tabAwareness.updateConfig(newConfig);
      
      expect(tabAwareness.config.pauseOnBlur).toBe(false);
      expect(tabAwareness.config.resumeDelay).toBe(2000);
    });

    test('should track statistics', async () => {
      await tabAwareness.initialize();
      await tabAwareness.start();
      
      // Trigger some events
      await tabAwareness.handleTabFocused();
      await tabAwareness.handleTabBlurred();
      
      const stats = tabAwareness.getStats();
      expect(stats.focusEvents).toBeGreaterThan(0);
      expect(stats.blurEvents).toBeGreaterThan(0);
    });

    test('should reset statistics', async () => {
      await tabAwareness.initialize();
      await tabAwareness.start();
      
      // Trigger some events
      await tabAwareness.handleTabFocused();
      
      let stats = tabAwareness.getStats();
      expect(stats.focusEvents).toBeGreaterThan(0);
      
      tabAwareness.resetStats();
      
      stats = tabAwareness.getStats();
      expect(stats.focusEvents).toBe(0);
    });
  });

  describe('StatsCollector', () => {
    test('should initialize correctly', async () => {
      const result = await statsCollector.initialize();
      expect(result).toBe(true);
      expect(statsCollector.isActive).toBe(false);
    });

    test('should start and stop correctly', async () => {
      await statsCollector.initialize();
      
      const startResult = await statsCollector.start();
      expect(startResult).toBe(true);
      expect(statsCollector.isActive).toBe(true);
      expect(statsCollector.stats.session.startTime).toBeTruthy();
      
      const stopResult = await statsCollector.stop();
      expect(stopResult).toBe(true);
      expect(statsCollector.isActive).toBe(false);
      expect(statsCollector.stats.session.endTime).toBeTruthy();
    });

    test('should record scroll steps', async () => {
      await statsCollector.initialize();
      await statsCollector.start();
      
      const step = { delta: 100, delay: 200, strategy: 'linear' };
      statsCollector.recordScrollStep(step);
      
      expect(statsCollector.stats.session.totalSteps).toBe(1);
      expect(statsCollector.stats.session.totalDistance).toBe(100);
      expect(statsCollector.stats.session.totalPauseTime).toBe(200);
    });

    test('should record pause events', async () => {
      await statsCollector.initialize();
      await statsCollector.start();
      
      // Start pause
      statsCollector.recordPause({ type: 'start', reason: 'user' });
      expect(statsCollector.stats.realtime.isPaused).toBe(true);
      
      // End pause
      statsCollector.recordPause({ type: 'end', duration: 1000 });
      expect(statsCollector.stats.realtime.isPaused).toBe(false);
    });

    test('should record error events', async () => {
      await statsCollector.initialize();
      await statsCollector.start();
      
      const error = { type: 'scroll', message: 'Test error', severity: 'low' };
      statsCollector.recordError(error);
      
      expect(statsCollector.stats.session.errors).toBe(1);
      expect(statsCollector.stats.behavior.errorPatterns).toHaveLength(1);
    });

    test('should record stealth events', async () => {
      await statsCollector.initialize();
      await statsCollector.start();
      
      statsCollector.recordStealthEvent({ type: 'noise' });
      statsCollector.recordStealthEvent({ type: 'tabSwitch' });
      statsCollector.recordStealthEvent({ type: 'focusChange' });
      statsCollector.recordStealthEvent({ type: 'humanLike' });
      
      expect(statsCollector.stats.stealth.noiseEvents).toBe(1);
      expect(statsCollector.stats.stealth.tabSwitches).toBe(1);
      expect(statsCollector.stats.stealth.focusChanges).toBe(1);
      expect(statsCollector.stats.stealth.humanLikeActions).toBe(1);
    });

    test('should record performance metrics', async () => {
      await statsCollector.initialize();
      await statsCollector.start();
      
      const metrics = {
        frameRate: 60,
        averageFrameTime: 16.67,
        droppedFrames: 0,
        memoryUsage: 50,
        cpuUsage: 25
      };
      
      statsCollector.recordPerformance(metrics);
      
      expect(statsCollector.stats.performance.frameRate).toBe(60);
      expect(statsCollector.stats.performance.averageFrameTime).toBe(16.67);
    });

    test('should calculate detection risk', async () => {
      await statsCollector.initialize();
      await statsCollector.start();
      
      // Record some stealth events
      statsCollector.recordStealthEvent({ type: 'noise' });
      statsCollector.recordStealthEvent({ type: 'humanLike' });
      
      // Calculate risk
      statsCollector.calculateDetectionRisk();
      
      expect(statsCollector.stats.stealth.detectionRisk).toBeGreaterThanOrEqual(0);
      expect(statsCollector.stats.stealth.detectionRisk).toBeLessThanOrEqual(1);
    });

    test('should get session summary', async () => {
      await statsCollector.initialize();
      await statsCollector.start();
      
      // Record some data
      statsCollector.recordScrollStep({ delta: 100, delay: 200 });
      statsCollector.recordError({ type: 'test' });
      
      const summary = statsCollector.getSessionSummary();
      
      expect(summary).toHaveProperty('sessionId');
      expect(summary).toHaveProperty('totalSteps');
      expect(summary).toHaveProperty('totalDistance');
      expect(summary).toHaveProperty('errors');
    });

    test('should get behavior analysis', async () => {
      await statsCollector.initialize();
      await statsCollector.start();
      
      // Record some scroll patterns
      statsCollector.recordScrollStep({ delta: 100, delay: 200 });
      statsCollector.recordScrollStep({ delta: 150, delay: 250 });
      statsCollector.recordScrollStep({ delta: 120, delay: 220 });
      
      const analysis = statsCollector.getBehaviorAnalysis();
      
      expect(analysis).toHaveProperty('scrollConsistency');
      expect(analysis).toHaveProperty('delayConsistency');
      expect(analysis).toHaveProperty('averageDelta');
      expect(analysis).toHaveProperty('averageDelay');
    });

    test('should update configuration', () => {
      const newConfig = { autoSave: false, saveInterval: 60000 };
      statsCollector.updateConfig(newConfig);
      
      expect(statsCollector.config.autoSave).toBe(false);
      expect(statsCollector.config.saveInterval).toBe(60000);
    });

    test('should reset statistics', () => {
      // Set some initial data
      statsCollector.stats.session.totalSteps = 10;
      statsCollector.stats.session.totalDistance = 1000;
      
      statsCollector.resetStats();
      
      expect(statsCollector.stats.session.totalSteps).toBe(0);
      expect(statsCollector.stats.session.totalDistance).toBe(0);
    });

    test('should handle event listeners', () => {
      const mockListener = jest.fn();
      
      // Add listener
      statsCollector.on('testEvent', mockListener);
      
      // Emit event
      statsCollector.emit('testEvent', 'testData');
      
      expect(mockListener).toHaveBeenCalledWith('testData');
      
      // Remove listener
      statsCollector.off('testEvent', mockListener);
      
      // Emit event again
      statsCollector.emit('testEvent', 'testData2');
      
      expect(mockListener).toHaveBeenCalledTimes(1);
    });
  });

  describe('Integration Tests', () => {
    test('should work together seamlessly', async () => {
      // Initialize all modules
      await noiseGenerator.initialize();
      await tabAwareness.initialize();
      await statsCollector.initialize();
      
      // Start all modules
      await noiseGenerator.start();
      await tabAwareness.start();
      await statsCollector.start();
      
      // Verify all are active
      expect(noiseGenerator.isActive).toBe(true);
      expect(tabAwareness.isActive).toBe(true);
      expect(statsCollector.isActive).toBe(true);
      
      // Record some interactions
      await noiseGenerator.generateMouseMove();
      statsCollector.recordStealthEvent({ type: 'noise' });
      
      // Verify stats are being collected
      const noiseStats = noiseGenerator.getStats();
      const collectorStats = statsCollector.getStats();
      
      expect(noiseStats.totalEvents).toBeGreaterThan(0);
      expect(collectorStats.stealth.noiseEvents).toBe(1);
      
      // Stop all modules
      await noiseGenerator.stop();
      await tabAwareness.stop();
      await statsCollector.stop();
      
      // Verify all are stopped
      expect(noiseGenerator.isActive).toBe(false);
      expect(tabAwareness.isActive).toBe(false);
      expect(statsCollector.isActive).toBe(false);
    });
  });
});
