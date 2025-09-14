/**
 * Benchmark Tests
 * Specific performance benchmarks and measurements
 */

import { AutoscrollEngine } from '../src/core/engine.js';
import { createLogger } from '../src/utils/logger.js';
import { sleep, createRandomDelay, createHumanBehaviorDelay } from '../src/utils/time.js';
import { safeQuerySelector, isElementVisible, getScrollPosition } from '../src/utils/dom.js';
import { createWheelEvent, createMouseEvent, createTouchEvent, dispatchEventNatural } from '../src/utils/events.js';
import { createNamespacedStorage } from '../src/utils/storage.js';

describe('Benchmark Tests', () => {
  let engine;
  let logger;

  beforeEach(() => {
    engine = new AutoscrollEngine();
    logger = createLogger('benchmark-test');
    
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

  describe('Engine Benchmarks', () => {
    test('should benchmark engine initialization time', async () => {
      const iterations = 10;
      const times = [];

      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        await engine.start();
        const endTime = performance.now();
        times.push(endTime - startTime);
        await engine.stop();
      }

      const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      const minTime = Math.min(...times);
      const maxTime = Math.max(...times);

      // Benchmark expectations
      expect(averageTime).toBeLessThan(50); // Average should be under 50ms
      expect(minTime).toBeLessThan(30); // Minimum should be under 30ms
      expect(maxTime).toBeLessThan(100); // Maximum should be under 100ms

      console.log(`Engine Initialization Benchmark:
        Average: ${averageTime.toFixed(2)}ms
        Min: ${minTime.toFixed(2)}ms
        Max: ${maxTime.toFixed(2)}ms
        Iterations: ${iterations}`);
    });

    test('should benchmark engine lifecycle time', async () => {
      const iterations = 10;
      const times = [];

      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        
        await engine.start();
        await engine.pause();
        await engine.resume();
        await engine.stop();
        
        const endTime = performance.now();
        times.push(endTime - startTime);
      }

      const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      const minTime = Math.min(...times);
      const maxTime = Math.max(...times);

      // Benchmark expectations
      expect(averageTime).toBeLessThan(100); // Average should be under 100ms
      expect(minTime).toBeLessThan(50); // Minimum should be under 50ms
      expect(maxTime).toBeLessThan(200); // Maximum should be under 200ms

      console.log(`Engine Lifecycle Benchmark:
        Average: ${averageTime.toFixed(2)}ms
        Min: ${minTime.toFixed(2)}ms
        Max: ${maxTime.toFixed(2)}ms
        Iterations: ${iterations}`);
    });

    test('should benchmark engine state transitions', async () => {
      await engine.start();
      
      const iterations = 100;
      const times = [];

      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        
        await engine.pause();
        await engine.resume();
        
        const endTime = performance.now();
        times.push(endTime - startTime);
      }

      await engine.stop();

      const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
      const minTime = Math.min(...times);
      const maxTime = Math.max(...times);

      // Benchmark expectations
      expect(averageTime).toBeLessThan(20); // Average should be under 20ms
      expect(minTime).toBeLessThan(10); // Minimum should be under 10ms
      expect(maxTime).toBeLessThan(50); // Maximum should be under 50ms

      console.log(`Engine State Transitions Benchmark:
        Average: ${averageTime.toFixed(2)}ms
        Min: ${minTime.toFixed(2)}ms
        Max: ${maxTime.toFixed(2)}ms
        Iterations: ${iterations}`);
    });
  });

  describe('Utils Benchmarks', () => {
    test('should benchmark time utilities', async () => {
      const iterations = 100;
      const sleepTimes = [];
      const randomDelayTimes = [];
      const humanDelayTimes = [];

      // Benchmark sleep
      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        await sleep(10);
        const endTime = performance.now();
        sleepTimes.push(endTime - startTime);
      }

      // Benchmark random delay
      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        await createRandomDelay(10, 20);
        const endTime = performance.now();
        randomDelayTimes.push(endTime - startTime);
      }

      // Benchmark human behavior delay
      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        await createHumanBehaviorDelay('natural', { baseDelay: 10, variation: 0.1 });
        const endTime = performance.now();
        humanDelayTimes.push(endTime - startTime);
      }

      const sleepAvg = sleepTimes.reduce((sum, time) => sum + time, 0) / sleepTimes.length;
      const randomDelayAvg = randomDelayTimes.reduce((sum, time) => sum + time, 0) / randomDelayTimes.length;
      const humanDelayAvg = humanDelayTimes.reduce((sum, time) => sum + time, 0) / humanDelayTimes.length;

      // Benchmark expectations
      expect(sleepAvg).toBeLessThan(20); // Sleep should be close to 10ms
      expect(randomDelayAvg).toBeLessThan(30); // Random delay should be reasonable
      expect(humanDelayAvg).toBeLessThan(30); // Human delay should be reasonable

      console.log(`Time Utilities Benchmark:
        Sleep Average: ${sleepAvg.toFixed(2)}ms
        Random Delay Average: ${randomDelayAvg.toFixed(2)}ms
        Human Delay Average: ${humanDelayAvg.toFixed(2)}ms
        Iterations: ${iterations}`);
    });

    test('should benchmark DOM utilities', async () => {
      const iterations = 1000;
      const queryTimes = [];
      const visibilityTimes = [];
      const scrollTimes = [];

      // Benchmark query selector
      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        safeQuerySelector('#content');
        const endTime = performance.now();
        queryTimes.push(endTime - startTime);
      }

      // Benchmark visibility check
      const element = safeQuerySelector('#content');
      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        isElementVisible(element);
        const endTime = performance.now();
        visibilityTimes.push(endTime - startTime);
      }

      // Benchmark scroll position
      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        getScrollPosition();
        const endTime = performance.now();
        scrollTimes.push(endTime - startTime);
      }

      const queryAvg = queryTimes.reduce((sum, time) => sum + time, 0) / queryTimes.length;
      const visibilityAvg = visibilityTimes.reduce((sum, time) => sum + time, 0) / visibilityTimes.length;
      const scrollAvg = scrollTimes.reduce((sum, time) => sum + time, 0) / scrollTimes.length;

      // Benchmark expectations
      expect(queryAvg).toBeLessThan(1); // Query should be very fast
      expect(visibilityAvg).toBeLessThan(1); // Visibility check should be very fast
      expect(scrollAvg).toBeLessThan(1); // Scroll position should be very fast

      console.log(`DOM Utilities Benchmark:
        Query Selector Average: ${queryAvg.toFixed(3)}ms
        Visibility Check Average: ${visibilityAvg.toFixed(3)}ms
        Scroll Position Average: ${scrollAvg.toFixed(3)}ms
        Iterations: ${iterations}`);
    });

    test('should benchmark event utilities', async () => {
      const iterations = 1000;
      const wheelEventTimes = [];
      const mouseEventTimes = [];
      const touchEventTimes = [];

      // Benchmark wheel event creation
      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        createWheelEvent({ deltaY: 100, clientX: 960, clientY: 540 });
        const endTime = performance.now();
        wheelEventTimes.push(endTime - startTime);
      }

      // Benchmark mouse event creation
      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        createMouseEvent('click', { clientX: 100, clientY: 200 });
        const endTime = performance.now();
        mouseEventTimes.push(endTime - startTime);
      }

      // Benchmark touch event creation
      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        createTouchEvent('touchstart', { clientX: 150, clientY: 250 });
        const endTime = performance.now();
        touchEventTimes.push(endTime - startTime);
      }

      const wheelAvg = wheelEventTimes.reduce((sum, time) => sum + time, 0) / wheelEventTimes.length;
      const mouseAvg = mouseEventTimes.reduce((sum, time) => sum + time, 0) / mouseEventTimes.length;
      const touchAvg = touchEventTimes.reduce((sum, time) => sum + time, 0) / touchEventTimes.length;

      // Benchmark expectations
      expect(wheelAvg).toBeLessThan(1); // Event creation should be very fast
      expect(mouseAvg).toBeLessThan(1); // Event creation should be very fast
      expect(touchAvg).toBeLessThan(1); // Event creation should be very fast

      console.log(`Event Utilities Benchmark:
        Wheel Event Average: ${wheelAvg.toFixed(3)}ms
        Mouse Event Average: ${mouseAvg.toFixed(3)}ms
        Touch Event Average: ${touchAvg.toFixed(3)}ms
        Iterations: ${iterations}`);
    });

    test('should benchmark storage utilities', async () => {
      const iterations = 100;
      const setTimes = [];
      const getTimes = [];
      const clearTimes = [];

      const storage = createNamespacedStorage('benchmark-test');

      // Benchmark set operations
      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        await storage.set(`key${i}`, `value${i}`);
        const endTime = performance.now();
        setTimes.push(endTime - startTime);
      }

      // Benchmark get operations
      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        await storage.get(`key${i}`);
        const endTime = performance.now();
        getTimes.push(endTime - startTime);
      }

      // Benchmark clear operation
      const startTime = performance.now();
      await storage.clear();
      const endTime = performance.now();
      clearTimes.push(endTime - startTime);

      const setAvg = setTimes.reduce((sum, time) => sum + time, 0) / setTimes.length;
      const getAvg = getTimes.reduce((sum, time) => sum + time, 0) / getTimes.length;
      const clearAvg = clearTimes.reduce((sum, time) => sum + time, 0) / clearTimes.length;

      // Benchmark expectations
      expect(setAvg).toBeLessThan(5); // Set should be fast
      expect(getAvg).toBeLessThan(5); // Get should be fast
      expect(clearAvg).toBeLessThan(10); // Clear should be fast

      console.log(`Storage Utilities Benchmark:
        Set Average: ${setAvg.toFixed(2)}ms
        Get Average: ${getAvg.toFixed(2)}ms
        Clear Average: ${clearAvg.toFixed(2)}ms
        Iterations: ${iterations}`);
    });
  });

  describe('Stealth Benchmarks', () => {
    test('should benchmark stealth module operations', async () => {
      const config = {
        stealth: {
          enabled: true,
          cursorSimulator: { enabled: true },
          noiseEvents: { enabled: true },
          errorSimulator: { enabled: true }
        }
      };

      await engine.start(config);

      const iterations = 100;
      const cursorTimes = [];
      const noiseTimes = [];
      const errorTimes = [];

      // Benchmark cursor simulation
      for (let i = 0; i < iterations; i++) {
        if (engine.stealthModules?.cursorSimulator) {
          const startTime = performance.now();
          await engine.stealthModules.cursorSimulator.simulateMovement(100, 200);
          const endTime = performance.now();
          cursorTimes.push(endTime - startTime);
        }
      }

      // Benchmark noise events
      for (let i = 0; i < iterations; i++) {
        if (engine.stealthModules?.noiseEvents) {
          const startTime = performance.now();
          await engine.stealthModules.noiseEvents.generateMouseMoveEvents(2);
          const endTime = performance.now();
          noiseTimes.push(endTime - startTime);
        }
      }

      // Benchmark error simulation
      for (let i = 0; i < iterations; i++) {
        if (engine.stealthModules?.errorSimulator) {
          const startTime = performance.now();
          await engine.stealthModules.errorSimulator.simulateRandomPause();
          const endTime = performance.now();
          errorTimes.push(endTime - startTime);
        }
      }

      await engine.stop();

      const cursorAvg = cursorTimes.reduce((sum, time) => sum + time, 0) / cursorTimes.length;
      const noiseAvg = noiseTimes.reduce((sum, time) => sum + time, 0) / noiseTimes.length;
      const errorAvg = errorTimes.reduce((sum, time) => sum + time, 0) / errorTimes.length;

      // Benchmark expectations
      expect(cursorAvg).toBeLessThan(50); // Cursor simulation should be reasonable
      expect(noiseAvg).toBeLessThan(50); // Noise events should be reasonable
      expect(errorAvg).toBeLessThan(50); // Error simulation should be reasonable

      console.log(`Stealth Module Benchmark:
        Cursor Simulation Average: ${cursorAvg.toFixed(2)}ms
        Noise Events Average: ${noiseAvg.toFixed(2)}ms
        Error Simulation Average: ${errorAvg.toFixed(2)}ms
        Iterations: ${iterations}`);
    });

    test('should benchmark fingerprint variation', async () => {
      const config = {
        stealth: {
          enabled: true,
          fingerprintVariation: { enabled: true }
        }
      };

      await engine.start(config);

      const iterations = 50;
      const fingerprintTimes = [];
      const userAgentTimes = [];
      const timezoneTimes = [];

      // Benchmark fingerprint generation
      for (let i = 0; i < iterations; i++) {
        if (engine.stealthModules?.fingerprintVariation) {
          const startTime = performance.now();
          await engine.stealthModules.fingerprintVariation.generateSessionFingerprint();
          const endTime = performance.now();
          fingerprintTimes.push(endTime - startTime);
        }
      }

      // Benchmark user agent variation
      for (let i = 0; i < iterations; i++) {
        if (engine.stealthModules?.fingerprintVariation) {
          const startTime = performance.now();
          await engine.stealthModules.fingerprintVariation.varyUserAgent();
          const endTime = performance.now();
          userAgentTimes.push(endTime - startTime);
        }
      }

      // Benchmark timezone variation
      for (let i = 0; i < iterations; i++) {
        if (engine.stealthModules?.fingerprintVariation) {
          const startTime = performance.now();
          await engine.stealthModules.fingerprintVariation.varyTimezone();
          const endTime = performance.now();
          timezoneTimes.push(endTime - startTime);
        }
      }

      await engine.stop();

      const fingerprintAvg = fingerprintTimes.reduce((sum, time) => sum + time, 0) / fingerprintTimes.length;
      const userAgentAvg = userAgentTimes.reduce((sum, time) => sum + time, 0) / userAgentTimes.length;
      const timezoneAvg = timezoneTimes.reduce((sum, time) => sum + time, 0) / timezoneTimes.length;

      // Benchmark expectations
      expect(fingerprintAvg).toBeLessThan(100); // Fingerprint generation should be reasonable
      expect(userAgentAvg).toBeLessThan(50); // User agent variation should be fast
      expect(timezoneAvg).toBeLessThan(50); // Timezone variation should be fast

      console.log(`Fingerprint Variation Benchmark:
        Fingerprint Generation Average: ${fingerprintAvg.toFixed(2)}ms
        User Agent Variation Average: ${userAgentAvg.toFixed(2)}ms
        Timezone Variation Average: ${timezoneAvg.toFixed(2)}ms
        Iterations: ${iterations}`);
    });
  });

  describe('Detection Benchmarks', () => {
    test('should benchmark detector module operations', async () => {
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

      const iterations = 50;
      const adSenseTimes = [];
      const navigationTimes = [];
      const paginationTimes = [];
      const keywordTimes = [];

      // Benchmark ad sense detection
      for (let i = 0; i < iterations; i++) {
        if (engine.detectorModules?.adSenseDetector) {
          const startTime = performance.now();
          await engine.detectorModules.adSenseDetector.detectAds();
          const endTime = performance.now();
          adSenseTimes.push(endTime - startTime);
        }
      }

      // Benchmark navigation detection
      for (let i = 0; i < iterations; i++) {
        if (engine.detectorModules?.navigationDetector) {
          const startTime = performance.now();
          await engine.detectorModules.navigationDetector.detectNavigationElements();
          const endTime = performance.now();
          navigationTimes.push(endTime - startTime);
        }
      }

      // Benchmark pagination detection
      for (let i = 0; i < iterations; i++) {
        if (engine.detectorModules?.paginationDetector) {
          const startTime = performance.now();
          await engine.detectorModules.paginationDetector.detectPagination();
          const endTime = performance.now();
          paginationTimes.push(endTime - startTime);
        }
      }

      // Benchmark keyword detection
      for (let i = 0; i < iterations; i++) {
        if (engine.detectorModules?.keywordDetector) {
          const startTime = performance.now();
          await engine.detectorModules.keywordDetector.detectKeywordLinks(['test', 'example']);
          const endTime = performance.now();
          keywordTimes.push(endTime - startTime);
        }
      }

      await engine.stop();

      const adSenseAvg = adSenseTimes.reduce((sum, time) => sum + time, 0) / adSenseTimes.length;
      const navigationAvg = navigationTimes.reduce((sum, time) => sum + time, 0) / navigationTimes.length;
      const paginationAvg = paginationTimes.reduce((sum, time) => sum + time, 0) / paginationTimes.length;
      const keywordAvg = keywordTimes.reduce((sum, time) => sum + time, 0) / keywordTimes.length;

      // Benchmark expectations
      expect(adSenseAvg).toBeLessThan(100); // Ad sense detection should be reasonable
      expect(navigationAvg).toBeLessThan(100); // Navigation detection should be reasonable
      expect(paginationAvg).toBeLessThan(100); // Pagination detection should be reasonable
      expect(keywordAvg).toBeLessThan(100); // Keyword detection should be reasonable

      console.log(`Detection Module Benchmark:
        Ad Sense Detection Average: ${adSenseAvg.toFixed(2)}ms
        Navigation Detection Average: ${navigationAvg.toFixed(2)}ms
        Pagination Detection Average: ${paginationAvg.toFixed(2)}ms
        Keyword Detection Average: ${keywordAvg.toFixed(2)}ms
        Iterations: ${iterations}`);
    });
  });

  describe('Navigation Benchmarks', () => {
    test('should benchmark navigation module operations', async () => {
      const config = {
        navigation: {
          enabled: true,
          navigationController: { enabled: true },
          tabManager: { enabled: true },
          outboundNavigator: { enabled: true }
        }
      };

      await engine.start(config);

      const iterations = 50;
      const navigationTimes = [];
      const tabTimes = [];
      const outboundTimes = [];

      // Benchmark navigation controller
      for (let i = 0; i < iterations; i++) {
        if (engine.navigationModules?.navigationController) {
          const startTime = performance.now();
          await engine.navigationModules.navigationController.navigateToNext();
          const endTime = performance.now();
          navigationTimes.push(endTime - startTime);
        }
      }

      // Benchmark tab manager
      for (let i = 0; i < iterations; i++) {
        if (engine.navigationModules?.tabManager) {
          const startTime = performance.now();
          await engine.navigationModules.tabManager.createNewTab('https://example.com');
          const endTime = performance.now();
          tabTimes.push(endTime - startTime);
        }
      }

      // Benchmark outbound navigator
      for (let i = 0; i < iterations; i++) {
        if (engine.navigationModules?.outboundNavigator) {
          const startTime = performance.now();
          await engine.navigationModules.outboundNavigator.navigateToExternal('https://example.com');
          const endTime = performance.now();
          outboundTimes.push(endTime - startTime);
        }
      }

      await engine.stop();

      const navigationAvg = navigationTimes.reduce((sum, time) => sum + time, 0) / navigationTimes.length;
      const tabAvg = tabTimes.reduce((sum, time) => sum + time, 0) / tabTimes.length;
      const outboundAvg = outboundTimes.reduce((sum, time) => sum + time, 0) / outboundTimes.length;

      // Benchmark expectations
      expect(navigationAvg).toBeLessThan(100); // Navigation should be reasonable
      expect(tabAvg).toBeLessThan(100); // Tab management should be reasonable
      expect(outboundAvg).toBeLessThan(100); // Outbound navigation should be reasonable

      console.log(`Navigation Module Benchmark:
        Navigation Controller Average: ${navigationAvg.toFixed(2)}ms
        Tab Manager Average: ${tabAvg.toFixed(2)}ms
        Outbound Navigator Average: ${outboundAvg.toFixed(2)}ms
        Iterations: ${iterations}`);
    });
  });

  describe('Analytics Benchmarks', () => {
    test('should benchmark analytics module operations', async () => {
      const config = {
        analytics: {
          enabled: true,
          statsCollector: { enabled: true },
          sessionTimeline: { enabled: true }
        }
      };

      await engine.start(config);

      const iterations = 1000;
      const statsTimes = [];
      const timelineTimes = [];

      // Benchmark stats collector
      for (let i = 0; i < iterations; i++) {
        if (engine.analyticsModules?.statsCollector) {
          const startTime = performance.now();
          engine.analyticsModules.statsCollector.recordEvent('test-event', { value: i });
          const endTime = performance.now();
          statsTimes.push(endTime - startTime);
        }
      }

      // Benchmark session timeline
      for (let i = 0; i < iterations; i++) {
        if (engine.analyticsModules?.sessionTimeline) {
          const startTime = performance.now();
          engine.analyticsModules.sessionTimeline.recordAction('test-action', { timestamp: Date.now() });
          const endTime = performance.now();
          timelineTimes.push(endTime - startTime);
        }
      }

      await engine.stop();

      const statsAvg = statsTimes.reduce((sum, time) => sum + time, 0) / statsTimes.length;
      const timelineAvg = timelineTimes.reduce((sum, time) => sum + time, 0) / timelineTimes.length;

      // Benchmark expectations
      expect(statsAvg).toBeLessThan(1); // Stats recording should be very fast
      expect(timelineAvg).toBeLessThan(1); // Timeline recording should be very fast

      console.log(`Analytics Module Benchmark:
        Stats Collector Average: ${statsAvg.toFixed(3)}ms
        Session Timeline Average: ${timelineAvg.toFixed(3)}ms
        Iterations: ${iterations}`);
    });
  });

  describe('AI Benchmarks', () => {
    test('should benchmark AI module operations', async () => {
      const config = {
        ai: {
          enabled: true,
          sessionManager: { enabled: true },
          behaviorLearner: { enabled: true },
          patternGenerator: { enabled: true }
        }
      };

      await engine.start(config);

      const iterations = 50;
      const sessionTimes = [];
      const learningTimes = [];
      const patternTimes = [];

      // Benchmark session manager
      for (let i = 0; i < iterations; i++) {
        if (engine.aiModules?.sessionManager) {
          const startTime = performance.now();
          await engine.aiModules.sessionManager.updateSession({ action: `test-${i}` });
          const endTime = performance.now();
          sessionTimes.push(endTime - startTime);
        }
      }

      // Benchmark behavior learner
      for (let i = 0; i < iterations; i++) {
        if (engine.aiModules?.behaviorLearner) {
          const startTime = performance.now();
          await engine.aiModules.behaviorLearner.learnFromStats({ test: i });
          const endTime = performance.now();
          learningTimes.push(endTime - startTime);
        }
      }

      // Benchmark pattern generator
      for (let i = 0; i < iterations; i++) {
        if (engine.aiModules?.patternGenerator) {
          const startTime = performance.now();
          await engine.aiModules.patternGenerator.generatePatterns([{ test: i }]);
          const endTime = performance.now();
          patternTimes.push(endTime - startTime);
        }
      }

      await engine.stop();

      const sessionAvg = sessionTimes.reduce((sum, time) => sum + time, 0) / sessionTimes.length;
      const learningAvg = learningTimes.reduce((sum, time) => sum + time, 0) / learningTimes.length;
      const patternAvg = patternTimes.reduce((sum, time) => sum + time, 0) / patternTimes.length;

      // Benchmark expectations
      expect(sessionAvg).toBeLessThan(100); // Session management should be reasonable
      expect(learningAvg).toBeLessThan(100); // Behavior learning should be reasonable
      expect(patternAvg).toBeLessThan(100); // Pattern generation should be reasonable

      console.log(`AI Module Benchmark:
        Session Manager Average: ${sessionAvg.toFixed(2)}ms
        Behavior Learner Average: ${learningAvg.toFixed(2)}ms
        Pattern Generator Average: ${patternAvg.toFixed(2)}ms
        Iterations: ${iterations}`);
    });
  });

  describe('Memory Benchmarks', () => {
    test('should benchmark memory usage', async () => {
      const initialMemory = process.memoryUsage();
      
      // Test memory usage during engine operation
      await engine.start();
      
      const startMemory = process.memoryUsage();
      
      // Simulate operations
      for (let i = 0; i < 100; i++) {
        await sleep(10);
        const element = safeQuerySelector('#content');
        if (element) isElementVisible(element);
      }
      
      const endMemory = process.memoryUsage();
      
      await engine.stop();
      
      const finalMemory = process.memoryUsage();
      
      const startIncrease = startMemory.heapUsed - initialMemory.heapUsed;
      const endIncrease = endMemory.heapUsed - initialMemory.heapUsed;
      const finalIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      
      // Memory benchmarks
      expect(startIncrease).toBeLessThan(5 * 1024 * 1024); // Start should use less than 5MB
      expect(endIncrease).toBeLessThan(10 * 1024 * 1024); // End should use less than 10MB
      expect(finalIncrease).toBeLessThan(5 * 1024 * 1024); // Final should use less than 5MB
      
      console.log(`Memory Usage Benchmark:
        Initial: ${(initialMemory.heapUsed / 1024 / 1024).toFixed(2)}MB
        Start: ${(startMemory.heapUsed / 1024 / 1024).toFixed(2)}MB (+${(startIncrease / 1024 / 1024).toFixed(2)}MB)
        End: ${(endMemory.heapUsed / 1024 / 1024).toFixed(2)}MB (+${(endIncrease / 1024 / 1024).toFixed(2)}MB)
        Final: ${(finalMemory.heapUsed / 1024 / 1024).toFixed(2)}MB (+${(finalIncrease / 1024 / 1024).toFixed(2)}MB)`);
    });
  });

  describe('Overall Performance Benchmarks', () => {
    test('should benchmark overall system performance', async () => {
      const startTime = performance.now();
      
      // Start engine
      await engine.start();
      
      // Simulate comprehensive operations
      for (let i = 0; i < 100; i++) {
        // Time operations
        await sleep(1);
        await createRandomDelay(1, 5);
        
        // DOM operations
        const element = safeQuerySelector('#content');
        if (element) isElementVisible(element);
        
        // Event operations
        createWheelEvent({ deltaY: 100, clientX: 960, clientY: 540 });
        
        // Storage operations
        const storage = createNamespacedStorage('benchmark-test');
        await storage.set(`key${i}`, `value${i}`);
        await storage.get(`key${i}`);
        
        // State transitions
        if (i % 20 === 0) {
          await engine.pause();
          await engine.resume();
        }
      }
      
      // Stop engine
      await engine.stop();
      
      const endTime = performance.now();
      const totalDuration = endTime - startTime;
      
      // Overall performance benchmark
      expect(totalDuration).toBeLessThan(2000); // Total should be under 2 seconds
      
      console.log(`Overall System Performance Benchmark:
        Total Duration: ${totalDuration.toFixed(2)}ms
        Operations: 100 iterations
        Average per Operation: ${(totalDuration / 100).toFixed(2)}ms`);
    });
  });
});
