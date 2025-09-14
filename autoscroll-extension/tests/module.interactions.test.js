/**
 * Module Interactions Integration Tests
 * Testing how different modules interact with each other
 */

import { AutoscrollEngine } from '../src/core/engine.js';
import { createLogger } from '../src/utils/logger.js';
import { sleep, createRandomDelay } from '../src/utils/time.js';
import { safeQuerySelector, isElementVisible } from '../src/utils/dom.js';
import { createWheelEvent, dispatchEventNatural } from '../src/utils/events.js';
import { createNamespacedStorage } from '../src/utils/storage.js';

describe('Module Interactions Integration Tests', () => {
  let engine;
  let logger;

  beforeEach(() => {
    engine = new AutoscrollEngine();
    logger = createLogger('module-interactions-test');
    
    // Setup mock DOM with realistic content
    document.body.innerHTML = `
      <div id="main-content" style="height: 3000px;">
        <header id="header">Header Content</header>
        <main id="content">
          <section class="article-section">
            <h1>Article Title</h1>
            <p>Article content paragraph 1...</p>
            <p>Article content paragraph 2...</p>
            <div class="ad-container">
              <div class="adsense-ad">Ad Content</div>
            </div>
            <p>Article content paragraph 3...</p>
          </section>
          <nav class="navigation">
            <a href="#next" class="next-link">Next Article</a>
            <a href="#prev" class="prev-link">Previous Article</a>
            <a href="#related" class="related-link">Related Articles</a>
          </nav>
        </main>
        <footer id="footer">Footer Content</footer>
      </div>
    `;
    
    // Setup mock environment
    global.testUtils.mockViewportSize(1920, 1080);
    global.testUtils.mockDocumentDimensions(1920, 3000);
    global.testUtils.mockScrollPosition(0, 0);
  });

  afterEach(async () => {
    if (engine && engine.state === 'running') {
      await engine.stop();
    }
    document.body.innerHTML = '';
  });

  describe('Stealth and Detection Module Interactions', () => {
    test('should coordinate cursor simulation with ad detection', async () => {
      const config = {
        stealth: {
          enabled: true,
          cursorSimulator: { enabled: true }
        },
        detectors: {
          enabled: true,
          adSenseDetector: { enabled: true }
        }
      };

      await engine.start(config);

      // Simulate cursor movement
      const movement = await engine.stealthModules.cursorSimulator.simulateMovement(100, 200);
      expect(movement).toHaveProperty('x');
      expect(movement).toHaveProperty('y');

      // Detect ads
      const ads = await engine.detectorModules.adSenseDetector.detectAds();
      expect(Array.isArray(ads)).toBe(true);

      // Verify both modules are working together
      expect(engine.stealthModules.cursorSimulator.isActive).toBe(true);
      expect(engine.detectorModules.adSenseDetector.isActive).toBe(true);
    });

    test('should coordinate noise events with navigation detection', async () => {
      const config = {
        stealth: {
          enabled: true,
          noiseEvents: { enabled: true }
        },
        detectors: {
          enabled: true,
          navigationDetector: { enabled: true }
        }
      };

      await engine.start(config);

      // Generate noise events
      const noiseEvents = await engine.stealthModules.noiseEvents.generateMouseMoveEvents(3);
      expect(noiseEvents).toHaveLength(3);

      // Detect navigation elements
      const navElements = await engine.detectorModules.navigationDetector.detectNavigationElements();
      expect(Array.isArray(navElements)).toBe(true);

      // Verify coordination
      expect(engine.stealthModules.noiseEvents.isActive).toBe(true);
      expect(engine.detectorModules.navigationDetector.isActive).toBe(true);
    });

    test('should coordinate tab awareness with all detection modules', async () => {
      const config = {
        stealth: {
          enabled: true,
          tabAwareness: { enabled: true }
        },
        detectors: {
          enabled: true,
          adSenseDetector: { enabled: true },
          navigationDetector: { enabled: true },
          paginationDetector: { enabled: true }
        }
      };

      await engine.start(config);

      // Simulate tab blur
      await engine.stealthModules.tabAwareness.handleTabBlur();
      expect(engine.stealthModules.tabAwareness.isPaused).toBe(true);

      // All detection modules should be paused
      expect(engine.detectorModules.adSenseDetector.isPaused).toBe(true);
      expect(engine.detectorModules.navigationDetector.isPaused).toBe(true);
      expect(engine.detectorModules.paginationDetector.isPaused).toBe(true);

      // Simulate tab focus
      await engine.stealthModules.tabAwareness.handleTabFocus();
      expect(engine.stealthModules.tabAwareness.isPaused).toBe(false);

      // All detection modules should be resumed
      expect(engine.detectorModules.adSenseDetector.isPaused).toBe(false);
      expect(engine.detectorModules.navigationDetector.isPaused).toBe(false);
      expect(engine.detectorModules.paginationDetector.isPaused).toBe(false);
    });
  });

  describe('Detection and Navigation Module Interactions', () => {
    test('should coordinate ad detection with navigation actions', async () => {
      const config = {
        detectors: {
          enabled: true,
          adSenseDetector: { enabled: true }
        },
        navigation: {
          enabled: true,
          navigationController: { enabled: true },
          adNavigator: { enabled: true }
        }
      };

      await engine.start(config);

      // Detect ads
      const ads = await engine.detectorModules.adSenseDetector.detectAds();
      
      if (ads.length > 0) {
        // Navigate to ad
        const adElement = ads[0];
        const result = await engine.navigationModules.adNavigator.navigateToAd(adElement);
        expect(typeof result).toBe('boolean');
      }

      // Verify coordination
      expect(engine.detectorModules.adSenseDetector.isActive).toBe(true);
      expect(engine.navigationModules.navigationController.isActive).toBe(true);
    });

    test('should coordinate navigation detection with tab management', async () => {
      const config = {
        detectors: {
          enabled: true,
          navigationDetector: { enabled: true }
        },
        navigation: {
          enabled: true,
          navigationController: { enabled: true },
          tabManager: { enabled: true }
        }
      };

      await engine.start(config);

      // Detect navigation elements
      const navElements = await engine.detectorModules.navigationDetector.detectNavigationElements();
      expect(Array.isArray(navElements)).toBe(true);

      // Test tab management
      const tabResult = await engine.navigationModules.tabManager.createNewTab('https://example.com');
      expect(typeof tabResult).toBe('boolean');

      // Verify coordination
      expect(engine.detectorModules.navigationDetector.isActive).toBe(true);
      expect(engine.navigationModules.tabManager.isActive).toBe(true);
    });

    test('should coordinate pagination detection with navigation controller', async () => {
      const config = {
        detectors: {
          enabled: true,
          paginationDetector: { enabled: true }
        },
        navigation: {
          enabled: true,
          navigationController: { enabled: true }
        }
      };

      await engine.start(config);

      // Detect pagination
      const pagination = await engine.detectorModules.paginationDetector.detectPagination();
      expect(Array.isArray(pagination)).toBe(true);

      // Test navigation controller
      const navResult = await engine.navigationModules.navigationController.navigateToNext();
      expect(typeof navResult).toBe('boolean');

      // Verify coordination
      expect(engine.detectorModules.paginationDetector.isActive).toBe(true);
      expect(engine.navigationModules.navigationController.isActive).toBe(true);
    });
  });

  describe('Navigation and Analytics Module Interactions', () => {
    test('should coordinate navigation actions with analytics tracking', async () => {
      const config = {
        navigation: {
          enabled: true,
          navigationController: { enabled: true }
        },
        analytics: {
          enabled: true,
          statsCollector: { enabled: true }
        }
      };

      await engine.start(config);

      // Perform navigation action
      const navResult = await engine.navigationModules.navigationController.navigateToNext();
      
      // Check analytics
      const stats = engine.analyticsModules.statsCollector.getStats();
      expect(stats).toBeDefined();
      expect(stats).toHaveProperty('navigationActions');

      // Verify coordination
      expect(engine.navigationModules.navigationController.isActive).toBe(true);
      expect(engine.analyticsModules.statsCollector.isActive).toBe(true);
    });

    test('should coordinate tab management with session tracking', async () => {
      const config = {
        navigation: {
          enabled: true,
          tabManager: { enabled: true }
        },
        analytics: {
          enabled: true,
          sessionTimeline: { enabled: true }
        }
      };

      await engine.start(config);

      // Create new tab
      const tabResult = await engine.navigationModules.tabManager.createNewTab('https://example.com');
      
      // Check session timeline
      const timeline = engine.analyticsModules.sessionTimeline.getTimeline();
      expect(Array.isArray(timeline)).toBe(true);

      // Verify coordination
      expect(engine.navigationModules.tabManager.isActive).toBe(true);
      expect(engine.analyticsModules.sessionTimeline.isActive).toBe(true);
    });
  });

  describe('Analytics and AI Module Interactions', () => {
    test('should coordinate analytics data with AI learning', async () => {
      const config = {
        analytics: {
          enabled: true,
          statsCollector: { enabled: true }
        },
        ai: {
          enabled: true,
          behaviorLearner: { enabled: true }
        }
      };

      await engine.start(config);

      // Collect some analytics data
      const stats = engine.analyticsModules.statsCollector.getStats();
      expect(stats).toBeDefined();

      // AI should learn from analytics
      const learningResult = await engine.aiModules.behaviorLearner.learnFromStats(stats);
      expect(typeof learningResult).toBe('boolean');

      // Verify coordination
      expect(engine.analyticsModules.statsCollector.isActive).toBe(true);
      expect(engine.aiModules.behaviorLearner.isActive).toBe(true);
    });

    test('should coordinate session management with pattern generation', async () => {
      const config = {
        analytics: {
          enabled: true,
          sessionTimeline: { enabled: true }
        },
        ai: {
          enabled: true,
          sessionManager: { enabled: true },
          patternGenerator: { enabled: true }
        }
      };

      await engine.start(config);

      // Get session data
      const timeline = engine.analyticsModules.sessionTimeline.getTimeline();
      
      // Generate patterns based on session
      const patterns = await engine.aiModules.patternGenerator.generatePatterns(timeline);
      expect(Array.isArray(patterns)).toBe(true);

      // Verify coordination
      expect(engine.analyticsModules.sessionTimeline.isActive).toBe(true);
      expect(engine.aiModules.sessionManager.isActive).toBe(true);
      expect(engine.aiModules.patternGenerator.isActive).toBe(true);
    });
  });

  describe('Stealth and AI Module Interactions', () => {
    test('should coordinate stealth behavior with AI adaptation', async () => {
      const config = {
        stealth: {
          enabled: true,
          cursorSimulator: { enabled: true },
          errorSimulator: { enabled: true }
        },
        ai: {
          enabled: true,
          adaptiveSpeed: { enabled: true }
        }
      };

      await engine.start(config);

      // Simulate stealth behavior
      const movement = await engine.stealthModules.cursorSimulator.simulateMovement(100, 200);
      const error = await engine.stealthModules.errorSimulator.simulateRandomPause();

      // AI should adapt based on stealth behavior
      const speed = await engine.aiModules.adaptiveSpeed.calculateOptimalSpeed();
      expect(typeof speed).toBe('number');
      expect(speed).toBeGreaterThan(0);

      // Verify coordination
      expect(engine.stealthModules.cursorSimulator.isActive).toBe(true);
      expect(engine.stealthModules.errorSimulator.isActive).toBe(true);
      expect(engine.aiModules.adaptiveSpeed.isActive).toBe(true);
    });

    test('should coordinate fingerprint variation with session management', async () => {
      const config = {
        stealth: {
          enabled: true,
          fingerprintVariation: { enabled: true }
        },
        ai: {
          enabled: true,
          sessionManager: { enabled: true }
        }
      };

      await engine.start(config);

      // Vary fingerprint
      const fingerprint = await engine.stealthModules.fingerprintVariation.generateSessionFingerprint();
      expect(fingerprint).toBeDefined();
      expect(fingerprint).toHaveProperty('userAgent');

      // Session manager should track fingerprint changes
      const session = engine.aiModules.sessionManager.getCurrentSession();
      expect(session).toBeDefined();

      // Verify coordination
      expect(engine.stealthModules.fingerprintVariation.isActive).toBe(true);
      expect(engine.aiModules.sessionManager.isActive).toBe(true);
    });
  });

  describe('Complex Multi-Module Interactions', () => {
    test('should handle full workflow: detect -> navigate -> track -> learn', async () => {
      const config = {
        stealth: {
          enabled: true,
          cursorSimulator: { enabled: true },
          noiseEvents: { enabled: true }
        },
        detectors: {
          enabled: true,
          adSenseDetector: { enabled: true },
          navigationDetector: { enabled: true }
        },
        navigation: {
          enabled: true,
          navigationController: { enabled: true },
          adNavigator: { enabled: true }
        },
        analytics: {
          enabled: true,
          statsCollector: { enabled: true }
        },
        ai: {
          enabled: true,
          behaviorLearner: { enabled: true }
        }
      };

      await engine.start(config);

      // Step 1: Generate stealth behavior
      const movement = await engine.stealthModules.cursorSimulator.simulateMovement(100, 200);
      const noise = await engine.stealthModules.noiseEvents.generateMouseMoveEvents(2);

      // Step 2: Detect elements
      const ads = await engine.detectorModules.adSenseDetector.detectAds();
      const navElements = await engine.detectorModules.navigationDetector.detectNavigationElements();

      // Step 3: Navigate (if elements found)
      if (ads.length > 0) {
        await engine.navigationModules.adNavigator.navigateToAd(ads[0]);
      }
      if (navElements.length > 0) {
        await engine.navigationModules.navigationController.navigateToNext();
      }

      // Step 4: Track analytics
      const stats = engine.analyticsModules.statsCollector.getStats();

      // Step 5: Learn from behavior
      await engine.aiModules.behaviorLearner.learnFromStats(stats);

      // Verify all modules are coordinated
      expect(engine.stealthModules.cursorSimulator.isActive).toBe(true);
      expect(engine.detectorModules.adSenseDetector.isActive).toBe(true);
      expect(engine.navigationModules.navigationController.isActive).toBe(true);
      expect(engine.analyticsModules.statsCollector.isActive).toBe(true);
      expect(engine.aiModules.behaviorLearner.isActive).toBe(true);
    });

    test('should handle error propagation across modules gracefully', async () => {
      const config = {
        stealth: {
          enabled: true,
          cursorSimulator: { enabled: true }
        },
        detectors: {
          enabled: true,
          adSenseDetector: { enabled: true }
        },
        navigation: {
          enabled: true,
          navigationController: { enabled: true }
        }
      };

      await engine.start(config);

      // Simulate error in one module
      try {
        await engine.stealthModules.cursorSimulator.simulateMovement('invalid', 'invalid');
      } catch (error) {
        // Error should be handled gracefully
        expect(error).toBeDefined();
      }

      // Other modules should continue working
      const ads = await engine.detectorModules.adSenseDetector.detectAds();
      expect(Array.isArray(ads)).toBe(true);

      const navResult = await engine.navigationModules.navigationController.navigateToNext();
      expect(typeof navResult).toBe('boolean');

      // Engine should still be running
      expect(engine.state).toBe('running');
    });

    test('should handle module state synchronization', async () => {
      const config = {
        stealth: {
          enabled: true,
          cursorSimulator: { enabled: true },
          tabAwareness: { enabled: true }
        },
        detectors: {
          enabled: true,
          adSenseDetector: { enabled: true }
        },
        navigation: {
          enabled: true,
          navigationController: { enabled: true }
        }
      };

      await engine.start(config);

      // All modules should be active
      expect(engine.stealthModules.cursorSimulator.isActive).toBe(true);
      expect(engine.stealthModules.tabAwareness.isActive).toBe(true);
      expect(engine.detectorModules.adSenseDetector.isActive).toBe(true);
      expect(engine.navigationModules.navigationController.isActive).toBe(true);

      // Pause engine
      await engine.pause();

      // All modules should be paused
      expect(engine.stealthModules.cursorSimulator.isPaused).toBe(true);
      expect(engine.stealthModules.tabAwareness.isPaused).toBe(true);
      expect(engine.detectorModules.adSenseDetector.isPaused).toBe(true);
      expect(engine.navigationModules.navigationController.isPaused).toBe(true);

      // Resume engine
      await engine.resume();

      // All modules should be resumed
      expect(engine.stealthModules.cursorSimulator.isPaused).toBe(false);
      expect(engine.stealthModules.tabAwareness.isPaused).toBe(false);
      expect(engine.detectorModules.adSenseDetector.isPaused).toBe(false);
      expect(engine.navigationModules.navigationController.isPaused).toBe(false);
    });
  });

  describe('Performance and Resource Management', () => {
    test('should handle resource cleanup across all modules', async () => {
      const config = {
        stealth: { enabled: true, cursorSimulator: { enabled: true } },
        detectors: { enabled: true, adSenseDetector: { enabled: true } },
        navigation: { enabled: true, navigationController: { enabled: true } },
        analytics: { enabled: true, statsCollector: { enabled: true } },
        ai: { enabled: true, sessionManager: { enabled: true } }
      };

      await engine.start(config);

      // Verify all modules are active
      expect(engine.stealthModules.cursorSimulator.isActive).toBe(true);
      expect(engine.detectorModules.adSenseDetector.isActive).toBe(true);
      expect(engine.navigationModules.navigationController.isActive).toBe(true);
      expect(engine.analyticsModules.statsCollector.isActive).toBe(true);
      expect(engine.aiModules.sessionManager.isActive).toBe(true);

      // Stop engine
      await engine.stop();

      // Verify all modules are cleaned up
      expect(engine.stealthModules.cursorSimulator.isActive).toBe(false);
      expect(engine.detectorModules.adSenseDetector.isActive).toBe(false);
      expect(engine.navigationModules.navigationController.isActive).toBe(false);
      expect(engine.analyticsModules.statsCollector.isActive).toBe(false);
      expect(engine.aiModules.sessionManager.isActive).toBe(false);
    });

    test('should handle memory management across modules', async () => {
      const config = {
        stealth: { enabled: true, cursorSimulator: { enabled: true } },
        detectors: { enabled: true, adSenseDetector: { enabled: true } },
        analytics: { enabled: true, statsCollector: { enabled: true } }
      };

      await engine.start(config);

      // Perform operations that might use memory
      for (let i = 0; i < 10; i++) {
        await engine.stealthModules.cursorSimulator.simulateMovement(100, 200);
        await engine.detectorModules.adSenseDetector.detectAds();
        const stats = engine.analyticsModules.statsCollector.getStats();
      }

      // Engine should still be running efficiently
      expect(engine.state).toBe('running');
      expect(engine.stealthModules.cursorSimulator.isActive).toBe(true);
      expect(engine.detectorModules.adSenseDetector.isActive).toBe(true);
      expect(engine.analyticsModules.statsCollector.isActive).toBe(true);
    });
  });
});
