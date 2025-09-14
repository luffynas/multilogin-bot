/**
 * Performance Tests and Benchmarks
 * Testing system performance, memory usage, and optimization
 */

import { AutoscrollEngine } from '../src/core/engine.js';
import { createLogger } from '../src/utils/logger.js';
import { sleep, createRandomDelay, createHumanBehaviorDelay } from '../src/utils/time.js';
import { safeQuerySelector, isElementVisible, getScrollPosition } from '../src/utils/dom.js';
import { createWheelEvent, createMouseEvent, createTouchEvent, dispatchEventNatural } from '../src/utils/events.js';
import { createNamespacedStorage } from '../src/utils/storage.js';

describe('Performance Tests and Benchmarks', () => {
  let engine;
  let logger;

  beforeEach(() => {
    engine = new AutoscrollEngine();
    logger = createLogger('performance-test');
    
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

  describe('Engine Performance', () => {
    test('should initialize engine within acceptable time', async () => {
      const startTime = performance.now();
      
      await engine.start({
        speed: 2,
        strategy: 'linear',
        adapter: 'desktop'
      });
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Engine should initialize within 100ms
      expect(duration).toBeLessThan(100);
      expect(engine.state).toBe('running');
    });

    test('should handle engine lifecycle efficiently', async () => {
      const startTime = performance.now();
      
      // Start engine
      await engine.start();
      
      // Pause engine
      await engine.pause();
      
      // Resume engine
      await engine.resume();
      
      // Stop engine
      await engine.stop();
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Complete lifecycle should take less than 200ms
      expect(duration).toBeLessThan(200);
      expect(engine.state).toBe('stopped');
    });

    test('should handle rapid state transitions efficiently', async () => {
      const startTime = performance.now();
      
      await engine.start();
      
      // Rapid state transitions
      for (let i = 0; i < 10; i++) {
        await engine.pause();
        await engine.resume();
      }
      
      await engine.stop();
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Rapid transitions should complete within 500ms
      expect(duration).toBeLessThan(500);
    });

    test('should maintain performance with multiple configurations', async () => {
      const configs = [
        { speed: 1, strategy: 'linear', adapter: 'desktop' },
        { speed: 2, strategy: 'burst', adapter: 'desktop' },
        { speed: 3, strategy: 'momentum', adapter: 'desktop' },
        { speed: 1, strategy: 'linear', adapter: 'mobile' },
        { speed: 2, strategy: 'burst', adapter: 'mobile' }
      ];

      const startTime = performance.now();
      
      for (const config of configs) {
        await engine.start(config);
        await engine.stop();
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Multiple configurations should complete within 1 second
      expect(duration).toBeLessThan(1000);
    });
  });

  describe('Memory Performance', () => {
    test('should not leak memory during engine operation', async () => {
      const initialMemory = process.memoryUsage();
      
      await engine.start();
      
      // Simulate some operations
      for (let i = 0; i < 100; i++) {
        await sleep(10);
      }
      
      await engine.stop();
      
      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      
      // Memory increase should be reasonable (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });

    test('should handle memory cleanup properly', async () => {
      const initialMemory = process.memoryUsage();
      
      // Start and stop engine multiple times
      for (let i = 0; i < 10; i++) {
        await engine.start();
        await engine.stop();
      }
      
      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      
      // Memory increase should be minimal after cleanup
      expect(memoryIncrease).toBeLessThan(5 * 1024 * 1024);
    });

    test('should handle large DOM operations efficiently', async () => {
      // Create large DOM structure
      const largeContent = document.createElement('div');
      for (let i = 0; i < 1000; i++) {
        const element = document.createElement('div');
        element.textContent = `Content ${i}`;
        largeContent.appendChild(element);
      }
      document.body.appendChild(largeContent);
      
      const startTime = performance.now();
      
      await engine.start();
      
      // Simulate operations on large DOM
      for (let i = 0; i < 50; i++) {
        const element = safeQuerySelector(`div:nth-child(${i + 1})`);
        if (element) {
          isElementVisible(element);
        }
      }
      
      await engine.stop();
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Operations on large DOM should complete within 1 second
      expect(duration).toBeLessThan(1000);
      
      // Cleanup
      document.body.removeChild(largeContent);
    });
  });

  describe('Utils Performance', () => {
    test('should handle time utilities efficiently', async () => {
      const startTime = performance.now();
      
      // Test sleep performance
      await sleep(50);
      
      // Test random delay performance
      for (let i = 0; i < 10; i++) {
        await createRandomDelay(10, 50);
      }
      
      // Test human behavior delay performance
      for (let i = 0; i < 5; i++) {
        await createHumanBehaviorDelay('natural', { baseDelay: 20, variation: 0.1 });
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Time utilities should complete within 1 second
      expect(duration).toBeLessThan(1000);
    });

    test('should handle DOM utilities efficiently', async () => {
      const startTime = performance.now();
      
      // Test DOM operations
      for (let i = 0; i < 100; i++) {
        const element = safeQuerySelector('#content');
        if (element) {
          isElementVisible(element);
          getScrollPosition();
        }
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // DOM utilities should complete within 100ms
      expect(duration).toBeLessThan(100);
    });

    test('should handle event utilities efficiently', async () => {
      const startTime = performance.now();
      
      // Test event creation
      for (let i = 0; i < 50; i++) {
        const wheelEvent = createWheelEvent({ deltaY: 100, clientX: 960, clientY: 540 });
        const mouseEvent = createMouseEvent('click', { clientX: 100, clientY: 200 });
        const touchEvent = createTouchEvent('touchstart', { clientX: 150, clientY: 250 });
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Event utilities should complete within 50ms
      expect(duration).toBeLessThan(50);
    });

    test('should handle storage utilities efficiently', async () => {
      const startTime = performance.now();
      
      const storage = createNamespacedStorage('performance-test');
      
      // Test storage operations
      for (let i = 0; i < 100; i++) {
        await storage.set(`key${i}`, `value${i}`);
        await storage.get(`key${i}`);
      }
      
      // Cleanup
      await storage.clear();
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Storage utilities should complete within 200ms
      expect(duration).toBeLessThan(200);
    });
  });

  describe('Stealth Performance', () => {
    test('should handle stealth modules efficiently', async () => {
      const config = {
        stealth: {
          enabled: true,
          cursorSimulator: { enabled: true },
          noiseEvents: { enabled: true },
          errorSimulator: { enabled: true }
        }
      };

      const startTime = performance.now();
      
      await engine.start(config);
      
      // Simulate stealth operations
      for (let i = 0; i < 20; i++) {
        if (engine.stealthModules?.cursorSimulator) {
          await engine.stealthModules.cursorSimulator.simulateMovement(100, 200);
        }
        if (engine.stealthModules?.noiseEvents) {
          await engine.stealthModules.noiseEvents.generateMouseMoveEvents(2);
        }
        if (engine.stealthModules?.errorSimulator) {
          await engine.stealthModules.errorSimulator.simulateRandomPause();
        }
      }
      
      await engine.stop();
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Stealth operations should complete within 2 seconds
      expect(duration).toBeLessThan(2000);
    });

    test('should handle fingerprint variation efficiently', async () => {
      const config = {
        stealth: {
          enabled: true,
          fingerprintVariation: { enabled: true }
        }
      };

      const startTime = performance.now();
      
      await engine.start(config);
      
      // Simulate fingerprint operations
      for (let i = 0; i < 10; i++) {
        if (engine.stealthModules?.fingerprintVariation) {
          await engine.stealthModules.fingerprintVariation.generateSessionFingerprint();
          await engine.stealthModules.fingerprintVariation.varyUserAgent();
          await engine.stealthModules.fingerprintVariation.varyTimezone();
          await engine.stealthModules.fingerprintVariation.varyLanguage();
          await engine.stealthModules.fingerprintVariation.varyScreenResolution();
        }
      }
      
      await engine.stop();
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Fingerprint operations should complete within 1 second
      expect(duration).toBeLessThan(1000);
    });

    test('should handle canvas noise efficiently', async () => {
      const config = {
        stealth: {
          enabled: true,
          canvasNoise: { enabled: true }
        }
      };

      const startTime = performance.now();
      
      await engine.start(config);
      
      // Create canvas and test noise operations
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      
      for (let i = 0; i < 10; i++) {
        if (engine.stealthModules?.canvasNoise) {
          await engine.stealthModules.canvasNoise.addNoise(canvas);
          await engine.stealthModules.canvasNoise.generateRandomData(100, 100);
          await engine.stealthModules.canvasNoise.modifyFingerprint(canvas);
        }
      }
      
      await engine.stop();
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Canvas noise operations should complete within 500ms
      expect(duration).toBeLessThan(500);
    });
  });

  describe('Detection Performance', () => {
    test('should handle detector modules efficiently', async () => {
      const config = {
        detectors: {
          enabled: true,
          adSenseDetector: { enabled: true },
          navigationDetector: { enabled: true },
          paginationDetector: { enabled: true },
          keywordDetector: { enabled: true }
        }
      };

      const startTime = performance.now();
      
      await engine.start(config);
      
      // Simulate detection operations
      for (let i = 0; i < 10; i++) {
        if (engine.detectorModules?.adSenseDetector) {
          await engine.detectorModules.adSenseDetector.detectAds();
        }
        if (engine.detectorModules?.navigationDetector) {
          await engine.detectorModules.navigationDetector.detectNavigationElements();
        }
        if (engine.detectorModules?.paginationDetector) {
          await engine.detectorModules.paginationDetector.detectPagination();
        }
        if (engine.detectorModules?.keywordDetector) {
          await engine.detectorModules.keywordDetector.detectKeywordLinks(['test', 'example']);
        }
      }
      
      await engine.stop();
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Detection operations should complete within 1 second
      expect(duration).toBeLessThan(1000);
    });
  });

  describe('Navigation Performance', () => {
    test('should handle navigation modules efficiently', async () => {
      const config = {
        navigation: {
          enabled: true,
          navigationController: { enabled: true },
          tabManager: { enabled: true },
          outboundNavigator: { enabled: true }
        }
      };

      const startTime = performance.now();
      
      await engine.start(config);
      
      // Simulate navigation operations
      for (let i = 0; i < 10; i++) {
        if (engine.navigationModules?.navigationController) {
          await engine.navigationModules.navigationController.navigateToNext();
          await engine.navigationModules.navigationController.navigateToPrevious();
        }
        if (engine.navigationModules?.tabManager) {
          await engine.navigationModules.tabManager.createNewTab('https://example.com');
        }
        if (engine.navigationModules?.outboundNavigator) {
          await engine.navigationModules.outboundNavigator.navigateToExternal('https://example.com');
        }
      }
      
      await engine.stop();
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Navigation operations should complete within 1 second
      expect(duration).toBeLessThan(1000);
    });
  });

  describe('Analytics Performance', () => {
    test('should handle analytics modules efficiently', async () => {
      const config = {
        analytics: {
          enabled: true,
          statsCollector: { enabled: true },
          sessionTimeline: { enabled: true }
        }
      };

      const startTime = performance.now();
      
      await engine.start(config);
      
      // Simulate analytics operations
      for (let i = 0; i < 50; i++) {
        if (engine.analyticsModules?.statsCollector) {
          const stats = engine.analyticsModules.statsCollector.getStats();
          engine.analyticsModules.statsCollector.recordEvent('test-event', { value: i });
        }
        if (engine.analyticsModules?.sessionTimeline) {
          const timeline = engine.analyticsModules.sessionTimeline.getTimeline();
          engine.analyticsModules.sessionTimeline.recordAction('test-action', { timestamp: Date.now() });
        }
      }
      
      await engine.stop();
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Analytics operations should complete within 500ms
      expect(duration).toBeLessThan(500);
    });
  });

  describe('AI Performance', () => {
    test('should handle AI modules efficiently', async () => {
      const config = {
        ai: {
          enabled: true,
          sessionManager: { enabled: true },
          behaviorLearner: { enabled: true },
          patternGenerator: { enabled: true }
        }
      };

      const startTime = performance.now();
      
      await engine.start(config);
      
      // Simulate AI operations
      for (let i = 0; i < 10; i++) {
        if (engine.aiModules?.sessionManager) {
          const session = engine.aiModules.sessionManager.getCurrentSession();
          await engine.aiModules.sessionManager.updateSession({ action: `test-${i}` });
        }
        if (engine.aiModules?.behaviorLearner) {
          await engine.aiModules.behaviorLearner.learnFromStats({ test: i });
        }
        if (engine.aiModules?.patternGenerator) {
          const patterns = await engine.aiModules.patternGenerator.generatePatterns([{ test: i }]);
        }
      }
      
      await engine.stop();
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // AI operations should complete within 1 second
      expect(duration).toBeLessThan(1000);
    });
  });

  describe('Concurrent Operations Performance', () => {
    test('should handle concurrent operations efficiently', async () => {
      const startTime = performance.now();
      
      await engine.start();
      
      // Simulate concurrent operations
      const promises = [];
      for (let i = 0; i < 20; i++) {
        promises.push(sleep(10));
        promises.push(createRandomDelay(5, 15));
        promises.push(new Promise(resolve => {
          const element = safeQuerySelector('#content');
          if (element) {
            isElementVisible(element);
          }
          resolve();
        }));
      }
      
      await Promise.all(promises);
      
      await engine.stop();
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Concurrent operations should complete within 500ms
      expect(duration).toBeLessThan(500);
    });

    test('should handle multiple engine instances efficiently', async () => {
      const engines = [];
      const startTime = performance.now();
      
      // Create multiple engine instances
      for (let i = 0; i < 5; i++) {
        const newEngine = new AutoscrollEngine();
        engines.push(newEngine);
        await newEngine.start();
      }
      
      // Simulate operations on all engines
      for (let i = 0; i < 10; i++) {
        for (const eng of engines) {
          await eng.pause();
          await eng.resume();
        }
      }
      
      // Stop all engines
      for (const eng of engines) {
        await eng.stop();
      }
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Multiple engine instances should complete within 2 seconds
      expect(duration).toBeLessThan(2000);
    });
  });

  describe('Stress Testing', () => {
    test('should handle stress testing efficiently', async () => {
      const startTime = performance.now();
      
      await engine.start();
      
      // Stress test with many operations
      for (let i = 0; i < 100; i++) {
        await sleep(1);
        await createRandomDelay(1, 5);
        
        const element = safeQuerySelector('#content');
        if (element) {
          isElementVisible(element);
        }
        
        if (i % 10 === 0) {
          await engine.pause();
          await engine.resume();
        }
      }
      
      await engine.stop();
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Stress test should complete within 2 seconds
      expect(duration).toBeLessThan(2000);
    });

    test('should handle memory stress testing', async () => {
      const initialMemory = process.memoryUsage();
      
      // Memory stress test
      for (let i = 0; i < 50; i++) {
        await engine.start();
        
        // Simulate memory-intensive operations
        const storage = createNamespacedStorage(`stress-test-${i}`);
        for (let j = 0; j < 100; j++) {
          await storage.set(`key${j}`, `value${j}`.repeat(100));
        }
        
        await engine.stop();
        await storage.clear();
      }
      
      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      
      // Memory increase should be reasonable even under stress
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // 50MB
    });
  });

  describe('Performance Benchmarks', () => {
    test('should meet performance benchmarks', async () => {
      const benchmarks = {
        engineInitialization: 0,
        engineLifecycle: 0,
        utilsPerformance: 0,
        stealthPerformance: 0,
        detectionPerformance: 0,
        navigationPerformance: 0,
        analyticsPerformance: 0,
        aiPerformance: 0
      };

      // Benchmark engine initialization
      const startInit = performance.now();
      await engine.start();
      benchmarks.engineInitialization = performance.now() - startInit;

      // Benchmark engine lifecycle
      const startLifecycle = performance.now();
      await engine.pause();
      await engine.resume();
      benchmarks.engineLifecycle = performance.now() - startLifecycle;

      // Benchmark utils performance
      const startUtils = performance.now();
      for (let i = 0; i < 100; i++) {
        await sleep(1);
        const element = safeQuerySelector('#content');
        if (element) isElementVisible(element);
      }
      benchmarks.utilsPerformance = performance.now() - startUtils;

      // Benchmark stealth performance
      const startStealth = performance.now();
      if (engine.stealthModules?.cursorSimulator) {
        for (let i = 0; i < 10; i++) {
          await engine.stealthModules.cursorSimulator.simulateMovement(100, 200);
        }
      }
      benchmarks.stealthPerformance = performance.now() - startStealth;

      // Benchmark detection performance
      const startDetection = performance.now();
      if (engine.detectorModules?.adSenseDetector) {
        for (let i = 0; i < 10; i++) {
          await engine.detectorModules.adSenseDetector.detectAds();
        }
      }
      benchmarks.detectionPerformance = performance.now() - startDetection;

      // Benchmark navigation performance
      const startNavigation = performance.now();
      if (engine.navigationModules?.navigationController) {
        for (let i = 0; i < 10; i++) {
          await engine.navigationModules.navigationController.navigateToNext();
        }
      }
      benchmarks.navigationPerformance = performance.now() - startNavigation;

      // Benchmark analytics performance
      const startAnalytics = performance.now();
      if (engine.analyticsModules?.statsCollector) {
        for (let i = 0; i < 50; i++) {
          engine.analyticsModules.statsCollector.recordEvent('test-event', { value: i });
        }
      }
      benchmarks.analyticsPerformance = performance.now() - startAnalytics;

      // Benchmark AI performance
      const startAI = performance.now();
      if (engine.aiModules?.sessionManager) {
        for (let i = 0; i < 10; i++) {
          await engine.aiModules.sessionManager.updateSession({ action: `test-${i}` });
        }
      }
      benchmarks.aiPerformance = performance.now() - startAI;

      await engine.stop();

      // Performance benchmarks (in milliseconds)
      expect(benchmarks.engineInitialization).toBeLessThan(100);
      expect(benchmarks.engineLifecycle).toBeLessThan(50);
      expect(benchmarks.utilsPerformance).toBeLessThan(200);
      expect(benchmarks.stealthPerformance).toBeLessThan(500);
      expect(benchmarks.detectionPerformance).toBeLessThan(500);
      expect(benchmarks.navigationPerformance).toBeLessThan(500);
      expect(benchmarks.analyticsPerformance).toBeLessThan(100);
      expect(benchmarks.aiPerformance).toBeLessThan(500);

      // Log benchmarks for analysis
      console.log('Performance Benchmarks:', benchmarks);
    });
  });
});
