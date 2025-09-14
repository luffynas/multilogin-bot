/**
 * Integration Tests for Engine and Module Interactions
 * Testing how different modules work together in the autoscroll system
 */

import { AutoscrollEngine, ENGINE_STATES, ENGINE_EVENTS } from '../src/core/engine.js';
import { getProfileValue, loadProfile } from '../src/core/profiles.js';
import { randScrollStep, randDelay, jitter } from '../src/core/randomizer.js';
import { createLogger } from '../src/utils/logger.js';
import { sleep, addJitter, createCancellableTimeout } from '../src/utils/time.js';
import { safeQuerySelector, isElementVisible, getScrollPosition } from '../src/utils/dom.js';
import { createWheelEvent, dispatchEventNatural } from '../src/utils/events.js';
import { createNamespacedStorage } from '../src/utils/storage.js';

describe('Engine Integration Tests', () => {
  let engine;
  let logger;

  beforeEach(() => {
    engine = new AutoscrollEngine();
    logger = createLogger('integration-test');
    
    // Setup mock DOM
    document.body.innerHTML = `
      <div id="scrollable-content" style="height: 2000px;">
        <div class="content-section">Section 1</div>
        <div class="content-section">Section 2</div>
        <div class="content-section">Section 3</div>
        <div class="content-section">Section 4</div>
        <div class="content-section">Section 5</div>
      </div>
    `;
    
    // Setup mock viewport and scroll
    global.testUtils.mockViewportSize(1920, 1080);
    global.testUtils.mockDocumentDimensions(1920, 2000);
    global.testUtils.mockScrollPosition(0, 0);
  });

  afterEach(async () => {
    if (engine && engine.state === 'running') {
      await engine.stop();
    }
    document.body.innerHTML = '';
  });

  describe('Engine Core Integration', () => {
    test('should initialize engine with profile configuration', async () => {
      const config = {
        speed: 2,
        strategy: 'linear',
        adapter: 'desktop',
        stealth: {
          enabled: true,
          cursorSimulator: { enabled: true },
          noiseEvents: { enabled: true }
        }
      };

      await engine.start(config);

      expect(engine.state).toBe(ENGINE_STATES.RUNNING);
      expect(engine.config.speed).toBe(2);
      expect(engine.config.strategy).toBe('linear');
      expect(engine.config.adapter).toBe('desktop');
    });

    test('should handle engine lifecycle with event emission', async () => {
      const startSpy = jest.fn();
      const stopSpy = jest.fn();
      const stateChangeSpy = jest.fn();

      engine.on(ENGINE_EVENTS.START, startSpy);
      engine.on(ENGINE_EVENTS.STOP, stopSpy);
      engine.on(ENGINE_EVENTS.STATE_CHANGE, stateChangeSpy);

      await engine.start();
      expect(startSpy).toHaveBeenCalled();
      expect(stateChangeSpy).toHaveBeenCalledWith(ENGINE_STATES.RUNNING);

      await engine.stop();
      expect(stopSpy).toHaveBeenCalled();
      expect(stateChangeSpy).toHaveBeenCalledWith(ENGINE_STATES.STOPPED);
    });

    test('should integrate with randomizer for scroll patterns', async () => {
      await engine.start({ strategy: 'linear' });

      // Test that engine can use randomizer functions
      const scrollStep = randScrollStep(50, 150);
      const delay = randDelay(100, 300);
      const jitteredValue = jitter(1000, 0.1);

      expect(scrollStep).toBeGreaterThanOrEqual(50);
      expect(scrollStep).toBeLessThanOrEqual(150);
      expect(delay).toBeGreaterThanOrEqual(100);
      expect(delay).toBeLessThanOrEqual(300);
      expect(jitteredValue).toBeGreaterThanOrEqual(900);
      expect(jitteredValue).toBeLessThanOrEqual(1100);
    });

    test('should handle strategy switching during runtime', async () => {
      await engine.start({ strategy: 'linear' });
      expect(engine.currentStrategy).toBe('linear');

      const result = await engine.setStrategy('burst');
      expect(result).toBe(true);
      expect(engine.currentStrategy).toBe('burst');

      const result2 = await engine.setStrategy('momentum');
      expect(result2).toBe(true);
      expect(engine.currentStrategy).toBe('momentum');
    });

    test('should handle adapter switching during runtime', async () => {
      await engine.start({ adapter: 'desktop' });
      expect(engine.currentAdapter).toBe('desktop');

      const result = await engine.setAdapter('mobile');
      expect(result).toBe(true);
      expect(engine.currentAdapter).toBe('mobile');
    });
  });

  describe('Engine and Utils Integration', () => {
    test('should integrate with logger for debugging', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await engine.start();
      logger.info('Engine started successfully');
      
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    test('should integrate with time utilities for delays', async () => {
      await engine.start();

      const startTime = Date.now();
      await sleep(50);
      const endTime = Date.now();

      expect(endTime - startTime).toBeGreaterThanOrEqual(40);
      expect(endTime - startTime).toBeLessThan(100);
    });

    test('should integrate with DOM utilities for element detection', async () => {
      await engine.start();

      const scrollableElement = safeQuerySelector('#scrollable-content');
      expect(scrollableElement).toBeDefined();
      expect(scrollableElement.id).toBe('scrollable-content');

      const isVisible = isElementVisible(scrollableElement);
      expect(typeof isVisible).toBe('boolean');
    });

    test('should integrate with event utilities for scroll simulation', async () => {
      await engine.start();

      const scrollableElement = safeQuerySelector('#scrollable-content');
      const wheelEvent = createWheelEvent({
        deltaY: 100,
        clientX: 960,
        clientY: 540
      });

      const spy = jest.fn();
      scrollableElement.addEventListener('wheel', spy);
      
      await dispatchEventNatural(scrollableElement, wheelEvent, 10);
      
      expect(spy).toHaveBeenCalledWith(wheelEvent);
    });

    test('should integrate with storage utilities for configuration', async () => {
      const storage = createNamespacedStorage('autoscroll-engine');
      
      await storage.set('config', {
        speed: 2,
        strategy: 'linear',
        adapter: 'desktop'
      });

      const config = await storage.get('config');
      expect(config.speed).toBe(2);
      expect(config.strategy).toBe('linear');
      expect(config.adapter).toBe('desktop');
    });
  });

  describe('Engine and Stealth Modules Integration', () => {
    test('should initialize stealth modules when enabled', async () => {
      const config = {
        stealth: {
          enabled: true,
          cursorSimulator: { enabled: true },
          gestureSimulator: { enabled: true },
          noiseEvents: { enabled: true },
          tabAwareness: { enabled: true }
        }
      };

      await engine.start(config);

      // Check that stealth modules are initialized
      expect(engine.stealthModules).toBeDefined();
      expect(engine.stealthModules.cursorSimulator).toBeDefined();
      expect(engine.stealthModules.gestureSimulator).toBeDefined();
      expect(engine.stealthModules.noiseEvents).toBeDefined();
      expect(engine.stealthModules.tabAwareness).toBeDefined();
    });

    test('should handle stealth module lifecycle', async () => {
      const config = {
        stealth: {
          enabled: true,
          cursorSimulator: { enabled: true }
        }
      };

      await engine.start(config);
      expect(engine.stealthModules.cursorSimulator.isActive).toBe(true);

      await engine.stop();
      expect(engine.stealthModules.cursorSimulator.isActive).toBe(false);
    });

    test('should coordinate between multiple stealth modules', async () => {
      const config = {
        stealth: {
          enabled: true,
          cursorSimulator: { enabled: true },
          noiseEvents: { enabled: true },
          tabAwareness: { enabled: true }
        }
      };

      await engine.start(config);

      // Simulate tab blur
      await engine.stealthModules.tabAwareness.handleTabBlur();
      expect(engine.stealthModules.tabAwareness.isPaused).toBe(true);

      // Simulate tab focus
      await engine.stealthModules.tabAwareness.handleTabFocus();
      expect(engine.stealthModules.tabAwareness.isPaused).toBe(false);
    });
  });

  describe('Engine and Detector Modules Integration', () => {
    test('should initialize detector modules when enabled', async () => {
      const config = {
        detectors: {
          enabled: true,
          adSenseDetector: { enabled: true },
          navigationDetector: { enabled: true },
          paginationDetector: { enabled: true },
          keywordDetector: { enabled: true }
        }
      };

      await engine.start(config);

      expect(engine.detectorModules).toBeDefined();
      expect(engine.detectorModules.adSenseDetector).toBeDefined();
      expect(engine.detectorModules.navigationDetector).toBeDefined();
      expect(engine.detectorModules.paginationDetector).toBeDefined();
      expect(engine.detectorModules.keywordDetector).toBeDefined();
    });

    test('should coordinate detector modules with engine state', async () => {
      const config = {
        detectors: {
          enabled: true,
          adSenseDetector: { enabled: true }
        }
      };

      await engine.start(config);
      expect(engine.detectorModules.adSenseDetector.isActive).toBe(true);

      await engine.pause();
      expect(engine.detectorModules.adSenseDetector.isPaused).toBe(true);

      await engine.resume();
      expect(engine.detectorModules.adSenseDetector.isPaused).toBe(false);
    });
  });

  describe('Engine and Navigation Modules Integration', () => {
    test('should initialize navigation modules when enabled', async () => {
      const config = {
        navigation: {
          enabled: true,
          navigationController: { enabled: true },
          tabManager: { enabled: true },
          outboundNavigator: { enabled: true }
        }
      };

      await engine.start(config);

      expect(engine.navigationModules).toBeDefined();
      expect(engine.navigationModules.navigationController).toBeDefined();
      expect(engine.navigationModules.tabManager).toBeDefined();
      expect(engine.navigationModules.outboundNavigator).toBeDefined();
    });

    test('should coordinate navigation with engine lifecycle', async () => {
      const config = {
        navigation: {
          enabled: true,
          navigationController: { enabled: true }
        }
      };

      await engine.start(config);
      expect(engine.navigationModules.navigationController.isActive).toBe(true);

      await engine.stop();
      expect(engine.navigationModules.navigationController.isActive).toBe(false);
    });
  });

  describe('Engine and Analytics Integration', () => {
    test('should initialize analytics modules when enabled', async () => {
      const config = {
        analytics: {
          enabled: true,
          statsCollector: { enabled: true }
        }
      };

      await engine.start(config);

      expect(engine.analyticsModules).toBeDefined();
      expect(engine.analyticsModules.statsCollector).toBeDefined();
    });

    test('should collect statistics during engine operation', async () => {
      const config = {
        analytics: {
          enabled: true,
          statsCollector: { enabled: true }
        }
      };

      await engine.start(config);
      
      const initialStats = engine.stats;
      expect(initialStats.startTime).toBeGreaterThan(0);
      expect(initialStats.isActive).toBe(true);

      await engine.stop();
      
      const finalStats = engine.stats;
      expect(finalStats.endTime).toBeGreaterThan(finalStats.startTime);
      expect(finalStats.isActive).toBe(false);
    });
  });

  describe('Engine and AI Modules Integration', () => {
    test('should initialize AI modules when enabled', async () => {
      const config = {
        ai: {
          enabled: true,
          sessionManager: { enabled: true }
        }
      };

      await engine.start(config);

      expect(engine.aiModules).toBeDefined();
      expect(engine.aiModules.sessionManager).toBeDefined();
    });

    test('should coordinate AI modules with engine behavior', async () => {
      const config = {
        ai: {
          enabled: true,
          sessionManager: { enabled: true }
        }
      };

      await engine.start(config);
      expect(engine.aiModules.sessionManager.isActive).toBe(true);

      await engine.stop();
      expect(engine.aiModules.sessionManager.isActive).toBe(false);
    });
  });

  describe('Complex Integration Scenarios', () => {
    test('should handle full system integration with all modules', async () => {
      const config = {
        speed: 2,
        strategy: 'linear',
        adapter: 'desktop',
        stealth: {
          enabled: true,
          cursorSimulator: { enabled: true },
          noiseEvents: { enabled: true },
          tabAwareness: { enabled: true }
        },
        detectors: {
          enabled: true,
          adSenseDetector: { enabled: true },
          navigationDetector: { enabled: true }
        },
        navigation: {
          enabled: true,
          navigationController: { enabled: true },
          tabManager: { enabled: true }
        },
        analytics: {
          enabled: true,
          statsCollector: { enabled: true }
        },
        ai: {
          enabled: true,
          sessionManager: { enabled: true }
        }
      };

      await engine.start(config);

      // Verify all modules are initialized
      expect(engine.stealthModules).toBeDefined();
      expect(engine.detectorModules).toBeDefined();
      expect(engine.navigationModules).toBeDefined();
      expect(engine.analyticsModules).toBeDefined();
      expect(engine.aiModules).toBeDefined();

      // Verify all modules are active
      expect(engine.stealthModules.cursorSimulator.isActive).toBe(true);
      expect(engine.detectorModules.adSenseDetector.isActive).toBe(true);
      expect(engine.navigationModules.navigationController.isActive).toBe(true);
      expect(engine.analyticsModules.statsCollector.isActive).toBe(true);
      expect(engine.aiModules.sessionManager.isActive).toBe(true);

      await engine.stop();

      // Verify all modules are stopped
      expect(engine.stealthModules.cursorSimulator.isActive).toBe(false);
      expect(engine.detectorModules.adSenseDetector.isActive).toBe(false);
      expect(engine.navigationModules.navigationController.isActive).toBe(false);
      expect(engine.analyticsModules.statsCollector.isActive).toBe(false);
      expect(engine.aiModules.sessionManager.isActive).toBe(false);
    });

    test('should handle module coordination during state transitions', async () => {
      const config = {
        stealth: { enabled: true, cursorSimulator: { enabled: true } },
        detectors: { enabled: true, adSenseDetector: { enabled: true } },
        navigation: { enabled: true, navigationController: { enabled: true } }
      };

      await engine.start(config);

      // Pause engine
      await engine.pause();
      expect(engine.stealthModules.cursorSimulator.isPaused).toBe(true);
      expect(engine.detectorModules.adSenseDetector.isPaused).toBe(true);
      expect(engine.navigationModules.navigationController.isPaused).toBe(true);

      // Resume engine
      await engine.resume();
      expect(engine.stealthModules.cursorSimulator.isPaused).toBe(false);
      expect(engine.detectorModules.adSenseDetector.isPaused).toBe(false);
      expect(engine.navigationModules.navigationController.isPaused).toBe(false);
    });

    test('should handle error recovery across modules', async () => {
      const config = {
        stealth: { enabled: true, cursorSimulator: { enabled: true } },
        detectors: { enabled: true, adSenseDetector: { enabled: true } }
      };

      await engine.start(config);

      // Simulate error in one module
      try {
        await engine.stealthModules.cursorSimulator.simulateMovement('invalid', 'invalid');
      } catch (error) {
        // Error should be handled gracefully
        expect(error).toBeDefined();
      }

      // Engine should continue running
      expect(engine.state).toBe(ENGINE_STATES.RUNNING);
      expect(engine.detectorModules.adSenseDetector.isActive).toBe(true);
    });

    test('should handle configuration updates across all modules', async () => {
      const initialConfig = {
        speed: 1,
        strategy: 'linear',
        stealth: { enabled: true, cursorSimulator: { enabled: true } }
      };

      await engine.start(initialConfig);

      // Update configuration
      const newConfig = {
        speed: 3,
        strategy: 'burst',
        stealth: { enabled: true, cursorSimulator: { enabled: true } }
      };

      await engine.updateConfig(newConfig);

      expect(engine.config.speed).toBe(3);
      expect(engine.config.strategy).toBe('burst');
    });
  });

  describe('Performance Integration Tests', () => {
    test('should maintain performance with multiple modules', async () => {
      const config = {
        stealth: { enabled: true, cursorSimulator: { enabled: true } },
        detectors: { enabled: true, adSenseDetector: { enabled: true } },
        navigation: { enabled: true, navigationController: { enabled: true } },
        analytics: { enabled: true, statsCollector: { enabled: true } }
      };

      const startTime = performance.now();
      await engine.start(config);
      const endTime = performance.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(1000); // Should start within 1 second
    });

    test('should handle rapid state transitions efficiently', async () => {
      await engine.start();

      const startTime = performance.now();
      
      // Rapid state transitions
      await engine.pause();
      await engine.resume();
      await engine.pause();
      await engine.resume();
      await engine.stop();
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeLessThan(500); // Should handle transitions quickly
    });
  });
});
