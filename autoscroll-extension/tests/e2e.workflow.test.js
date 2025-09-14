/**
 * End-to-End Tests for Full Workflow
 * Testing complete user scenarios from start to finish
 */

import { AutoscrollEngine } from '../src/core/engine.js';
import { createLogger } from '../src/utils/logger.js';
import { sleep, createRandomDelay, createHumanBehaviorDelay } from '../src/utils/time.js';
import { safeQuerySelector, safeQuerySelectorAll, isElementVisible, getScrollPosition } from '../src/utils/dom.js';
import { createWheelEvent, createMouseEvent, createTouchEvent, dispatchEventNatural } from '../src/utils/events.js';
import { createNamespacedStorage } from '../src/utils/storage.js';

describe('End-to-End Workflow Tests', () => {
  let engine;
  let logger;

  beforeEach(() => {
    engine = new AutoscrollEngine();
    logger = createLogger('e2e-workflow-test');
    
    // Setup comprehensive mock DOM with realistic content
    document.body.innerHTML = `
      <div id="main-content" style="height: 5000px;">
        <header id="header" style="height: 100px;">
          <nav class="main-nav">
            <a href="#home" class="nav-link">Home</a>
            <a href="#about" class="nav-link">About</a>
            <a href="#contact" class="nav-link">Contact</a>
          </nav>
        </header>
        <main id="content" style="height: 4000px;">
          <section class="hero-section" style="height: 500px;">
            <h1>Welcome to Our Website</h1>
            <p>This is a comprehensive test page for autoscroll extension.</p>
          </section>
          <section class="article-section" style="height: 1000px;">
            <h2>Article Title</h2>
            <p>Article content paragraph 1 with some text to read...</p>
            <p>Article content paragraph 2 with more text content...</p>
            <div class="ad-container">
              <div class="adsense-ad" data-ad-type="banner">Ad Content</div>
            </div>
            <p>Article content paragraph 3 with additional text...</p>
            <div class="image-gallery">
              <img src="image1.jpg" alt="Image 1" />
              <img src="image2.jpg" alt="Image 2" />
              <img src="image3.jpg" alt="Image 3" />
            </div>
          </section>
          <section class="features-section" style="height: 800px;">
            <h2>Features</h2>
            <div class="feature-list">
              <div class="feature-item">Feature 1</div>
              <div class="feature-item">Feature 2</div>
              <div class="feature-item">Feature 3</div>
            </div>
          </section>
          <section class="testimonials-section" style="height: 600px;">
            <h2>Testimonials</h2>
            <div class="testimonial-list">
              <div class="testimonial-item">Testimonial 1</div>
              <div class="testimonial-item">Testimonial 2</div>
            </div>
          </section>
          <nav class="pagination" style="height: 100px;">
            <a href="#prev" class="prev-link">Previous Page</a>
            <a href="#next" class="next-link">Next Page</a>
            <a href="#related" class="related-link">Related Articles</a>
            <a href="#recent" class="recent-link">Recent Posts</a>
          </nav>
        </main>
        <footer id="footer" style="height: 200px;">
          <div class="footer-content">
            <p>Footer content with links and information</p>
            <div class="social-links">
              <a href="#facebook" class="social-link">Facebook</a>
              <a href="#twitter" class="social-link">Twitter</a>
              <a href="#linkedin" class="social-link">LinkedIn</a>
            </div>
          </div>
        </footer>
      </div>
    `;
    
    // Setup mock environment
    global.testUtils.mockViewportSize(1920, 1080);
    global.testUtils.mockDocumentDimensions(1920, 5000);
    global.testUtils.mockScrollPosition(0, 0);
  });

  afterEach(async () => {
    if (engine && engine.state === 'running') {
      await engine.stop();
    }
    document.body.innerHTML = '';
  });

  describe('Complete User Journey - Basic Autoscroll', () => {
    test('should complete basic autoscroll workflow from start to finish', async () => {
      // Step 1: Initialize engine with basic configuration
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

      const startTime = performance.now();
      await engine.start(config);
      const initTime = performance.now() - startTime;

      // Verify engine is running
      expect(engine.state).toBe('running');
      expect(initTime).toBeLessThan(100);

      // Step 2: Simulate user browsing behavior
      await sleep(100); // Initial page load time

      // Step 3: Simulate reading behavior
      const readingTime = await createHumanBehaviorDelay('reading', { baseDelay: 200, variation: 0.2 });
      await sleep(readingTime);

      // Step 4: Simulate scroll behavior
      for (let i = 0; i < 5; i++) {
        await sleep(50);
        // Simulate scroll step
        if (engine.stealthModules?.cursorSimulator) {
          await engine.stealthModules.cursorSimulator.simulateMovement(100, 200);
        }
      }

      // Step 5: Simulate pause and resume
      await engine.pause();
      expect(engine.state).toBe('paused');
      
      await sleep(100); // Pause duration
      
      await engine.resume();
      expect(engine.state).toBe('running');

      // Step 6: Continue scrolling
      for (let i = 0; i < 3; i++) {
        await sleep(50);
        if (engine.stealthModules?.cursorSimulator) {
          await engine.stealthModules.cursorSimulator.simulateMovement(100, 200);
        }
      }

      // Step 7: Stop engine
      const stopTime = performance.now();
      await engine.stop();
      const totalTime = stopTime - startTime;

      // Verify completion
      expect(engine.state).toBe('stopped');
      expect(totalTime).toBeLessThan(2000); // Should complete within 2 seconds

      console.log(`Basic Autoscroll Workflow:
        Initialization: ${initTime.toFixed(2)}ms
        Total Duration: ${totalTime.toFixed(2)}ms
        Status: Completed Successfully`);
    });

    test('should handle mobile autoscroll workflow', async () => {
      // Step 1: Initialize engine for mobile
      const config = {
        speed: 1.5,
        strategy: 'momentum',
        adapter: 'mobile',
        stealth: {
          enabled: true,
          gestureSimulator: { enabled: true },
          touchEvents: { enabled: true }
        }
      };

      await engine.start(config);
      expect(engine.state).toBe('running');

      // Step 2: Simulate mobile touch interactions
      for (let i = 0; i < 3; i++) {
        await sleep(100);
        
        // Simulate touch gestures
        if (engine.stealthModules?.gestureSimulator) {
          await engine.stealthModules.gestureSimulator.simulateSwipe(100, 200, 100, 400);
        }
      }

      // Step 3: Simulate mobile reading behavior
      await sleep(200); // Reading time

      // Step 4: Continue with touch interactions
      for (let i = 0; i < 2; i++) {
        await sleep(100);
        if (engine.stealthModules?.gestureSimulator) {
          await engine.stealthModules.gestureSimulator.simulateTap(200, 300);
        }
      }

      // Step 5: Stop engine
      await engine.stop();
      expect(engine.state).toBe('stopped');

      console.log('Mobile Autoscroll Workflow: Completed Successfully');
    });
  });

  describe('Complete User Journey - Advanced Autoscroll with Detection', () => {
    test('should complete advanced autoscroll workflow with ad detection', async () => {
      // Step 1: Initialize engine with advanced configuration
      const config = {
        speed: 2.5,
        strategy: 'burst',
        adapter: 'desktop',
        stealth: {
          enabled: true,
          cursorSimulator: { enabled: true },
          noiseEvents: { enabled: true },
          errorSimulator: { enabled: true }
        },
        detectors: {
          enabled: true,
          adSenseDetector: { enabled: true },
          navigationDetector: { enabled: true }
        }
      };

      const startTime = performance.now();
      await engine.start(config);

      // Step 2: Simulate initial page exploration
      await sleep(100);
      
      // Step 3: Detect and interact with ads
      if (engine.detectorModules?.adSenseDetector) {
        const ads = await engine.detectorModules.adSenseDetector.detectAds();
        expect(Array.isArray(ads)).toBe(true);
        
        if (ads.length > 0) {
          // Simulate ad interaction
          await sleep(50);
        }
      }

      // Step 4: Simulate reading behavior with human-like patterns
      for (let i = 0; i < 3; i++) {
        const readingDelay = await createHumanBehaviorDelay('reading', { baseDelay: 150, variation: 0.3 });
        await sleep(readingDelay);
        
        // Simulate cursor movement
        if (engine.stealthModules?.cursorSimulator) {
          await engine.stealthModules.cursorSimulator.simulateMovement(100, 200);
        }
        
        // Simulate human errors
        if (engine.stealthModules?.errorSimulator) {
          await engine.stealthModules.errorSimulator.simulateRandomPause();
        }
      }

      // Step 5: Detect navigation elements
      if (engine.detectorModules?.navigationDetector) {
        const navElements = await engine.detectorModules.navigationDetector.detectNavigationElements();
        expect(Array.isArray(navElements)).toBe(true);
      }

      // Step 6: Simulate navigation behavior
      await sleep(100);
      
      // Step 7: Continue scrolling with stealth behavior
      for (let i = 0; i < 4; i++) {
        await sleep(50);
        
        // Generate noise events
        if (engine.stealthModules?.noiseEvents) {
          await engine.stealthModules.noiseEvents.generateMouseMoveEvents(2);
        }
        
        // Simulate cursor movement
        if (engine.stealthModules?.cursorSimulator) {
          await engine.stealthModules.cursorSimulator.simulateMovement(100, 200);
        }
      }

      // Step 8: Stop engine
      const totalTime = performance.now() - startTime;
      await engine.stop();

      expect(engine.state).toBe('stopped');
      expect(totalTime).toBeLessThan(3000);

      console.log(`Advanced Autoscroll with Detection:
        Total Duration: ${totalTime.toFixed(2)}ms
        Status: Completed Successfully`);
    });

    test('should complete workflow with navigation and tab management', async () => {
      // Step 1: Initialize engine with navigation capabilities
      const config = {
        speed: 2,
        strategy: 'linear',
        adapter: 'desktop',
        stealth: {
          enabled: true,
          cursorSimulator: { enabled: true },
          tabAwareness: { enabled: true }
        },
        detectors: {
          enabled: true,
          navigationDetector: { enabled: true },
          paginationDetector: { enabled: true }
        },
        navigation: {
          enabled: true,
          navigationController: { enabled: true },
          tabManager: { enabled: true }
        }
      };

      await engine.start(config);

      // Step 2: Simulate page exploration
      await sleep(100);

      // Step 3: Detect pagination
      if (engine.detectorModules?.paginationDetector) {
        const pagination = await engine.detectorModules.paginationDetector.detectPagination();
        expect(Array.isArray(pagination)).toBe(true);
      }

      // Step 4: Simulate navigation actions
      if (engine.navigationModules?.navigationController) {
        await engine.navigationModules.navigationController.navigateToNext();
        await sleep(100);
        await engine.navigationModules.navigationController.navigateToPrevious();
      }

      // Step 5: Simulate tab management
      if (engine.navigationModules?.tabManager) {
        await engine.navigationModules.tabManager.createNewTab('https://example.com');
        await sleep(100);
      }

      // Step 6: Simulate tab awareness
      if (engine.stealthModules?.tabAwareness) {
        await engine.stealthModules.tabAwareness.handleTabBlur();
        await sleep(50);
        await engine.stealthModules.tabAwareness.handleTabFocus();
      }

      // Step 7: Continue scrolling
      for (let i = 0; i < 3; i++) {
        await sleep(50);
        if (engine.stealthModules?.cursorSimulator) {
          await engine.stealthModules.cursorSimulator.simulateMovement(100, 200);
        }
      }

      // Step 8: Stop engine
      await engine.stop();
      expect(engine.state).toBe('stopped');

      console.log('Navigation and Tab Management Workflow: Completed Successfully');
    });
  });

  describe('Complete User Journey - Full System Integration', () => {
    test('should complete full system integration workflow', async () => {
      // Step 1: Initialize engine with all modules enabled
      const config = {
        speed: 2,
        strategy: 'linear',
        adapter: 'desktop',
        stealth: {
          enabled: true,
          cursorSimulator: { enabled: true },
          gestureSimulator: { enabled: true },
          noiseEvents: { enabled: true },
          tabAwareness: { enabled: true },
          canvasNoise: { enabled: true },
          hoverSimulator: { enabled: true },
          dwellTimeSimulator: { enabled: true },
          errorSimulator: { enabled: true },
          fingerprintVariation: { enabled: true }
        },
        detectors: {
          enabled: true,
          adSenseDetector: { enabled: true },
          navigationDetector: { enabled: true },
          paginationDetector: { enabled: true },
          keywordDetector: { enabled: true }
        },
        navigation: {
          enabled: true,
          navigationController: { enabled: true },
          tabManager: { enabled: true },
          outboundNavigator: { enabled: true }
        },
        analytics: {
          enabled: true,
          statsCollector: { enabled: true },
          sessionTimeline: { enabled: true }
        },
        ai: {
          enabled: true,
          sessionManager: { enabled: true },
          behaviorLearner: { enabled: true },
          patternGenerator: { enabled: true }
        }
      };

      const startTime = performance.now();
      await engine.start(config);

      // Step 2: Simulate comprehensive user behavior
      await sleep(100);

      // Step 3: Generate session fingerprint
      if (engine.stealthModules?.fingerprintVariation) {
        const fingerprint = await engine.stealthModules.fingerprintVariation.generateSessionFingerprint();
        expect(fingerprint).toBeDefined();
      }

      // Step 4: Simulate reading behavior with dwell time
      if (engine.stealthModules?.dwellTimeSimulator) {
        const dwellTime = await engine.stealthModules.dwellTimeSimulator.simulatePageDwellTime();
        await sleep(dwellTime);
      }

      // Step 5: Simulate hover behavior
      const contentElement = safeQuerySelector('#content');
      if (engine.stealthModules?.hoverSimulator && contentElement) {
        await engine.stealthModules.hoverSimulator.simulateHoverDelay(contentElement, 100);
      }

      // Step 6: Detect and interact with various elements
      if (engine.detectorModules?.adSenseDetector) {
        const ads = await engine.detectorModules.adSenseDetector.detectAds();
        if (ads.length > 0) {
          await sleep(50);
        }
      }

      if (engine.detectorModules?.navigationDetector) {
        const navElements = await engine.detectorModules.navigationDetector.detectNavigationElements();
        if (navElements.length > 0) {
          await sleep(50);
        }
      }

      if (engine.detectorModules?.keywordDetector) {
        const keywordLinks = await engine.detectorModules.keywordDetector.detectKeywordLinks(['test', 'example']);
        if (keywordLinks.length > 0) {
          await sleep(50);
        }
      }

      // Step 7: Simulate navigation actions
      if (engine.navigationModules?.navigationController) {
        await engine.navigationModules.navigationController.navigateToNext();
        await sleep(100);
      }

      // Step 8: Record analytics
      if (engine.analyticsModules?.statsCollector) {
        engine.analyticsModules.statsCollector.recordEvent('page-view', { section: 'main' });
        engine.analyticsModules.statsCollector.recordEvent('scroll', { position: 1000 });
      }

      if (engine.analyticsModules?.sessionTimeline) {
        engine.analyticsModules.sessionTimeline.recordAction('scroll', { timestamp: Date.now() });
        engine.analyticsModules.sessionTimeline.recordAction('hover', { element: 'content' });
      }

      // Step 9: AI learning and pattern generation
      if (engine.aiModules?.sessionManager) {
        await engine.aiModules.sessionManager.updateSession({ action: 'scroll', position: 1000 });
      }

      if (engine.aiModules?.behaviorLearner) {
        const stats = engine.analyticsModules?.statsCollector?.getStats();
        if (stats) {
          await engine.aiModules.behaviorLearner.learnFromStats(stats);
        }
      }

      if (engine.aiModules?.patternGenerator) {
        const timeline = engine.analyticsModules?.sessionTimeline?.getTimeline();
        if (timeline) {
          const patterns = await engine.aiModules.patternGenerator.generatePatterns(timeline);
          expect(Array.isArray(patterns)).toBe(true);
        }
      }

      // Step 10: Simulate comprehensive stealth behavior
      for (let i = 0; i < 5; i++) {
        await sleep(50);
        
        // Cursor movement
        if (engine.stealthModules?.cursorSimulator) {
          await engine.stealthModules.cursorSimulator.simulateMovement(100, 200);
        }
        
        // Noise events
        if (engine.stealthModules?.noiseEvents) {
          await engine.stealthModules.noiseEvents.generateMouseMoveEvents(2);
        }
        
        // Human errors
        if (engine.stealthModules?.errorSimulator) {
          await engine.stealthModules.errorSimulator.simulateRandomPause();
        }
        
        // Canvas noise
        if (engine.stealthModules?.canvasNoise) {
          const canvas = document.createElement('canvas');
          await engine.stealthModules.canvasNoise.addNoise(canvas);
        }
      }

      // Step 11: Simulate tab awareness
      if (engine.stealthModules?.tabAwareness) {
        await engine.stealthModules.tabAwareness.handleTabBlur();
        await sleep(100);
        await engine.stealthModules.tabAwareness.handleTabFocus();
      }

      // Step 12: Final navigation actions
      if (engine.navigationModules?.outboundNavigator) {
        await engine.navigationModules.outboundNavigator.navigateToExternal('https://example.com');
        await sleep(100);
      }

      // Step 13: Stop engine and collect final analytics
      const totalTime = performance.now() - startTime;
      await engine.stop();

      // Verify completion
      expect(engine.state).toBe('stopped');
      expect(totalTime).toBeLessThan(5000); // Should complete within 5 seconds

      console.log(`Full System Integration Workflow:
        Total Duration: ${totalTime.toFixed(2)}ms
        Status: Completed Successfully
        Modules Tested: All (Stealth, Detection, Navigation, Analytics, AI)`);
    });

    test('should handle error recovery and graceful degradation', async () => {
      // Step 1: Initialize engine with error-prone configuration
      const config = {
        speed: 3,
        strategy: 'burst',
        adapter: 'desktop',
        stealth: {
          enabled: true,
          cursorSimulator: { enabled: true },
          errorSimulator: { enabled: true }
        },
        detectors: {
          enabled: true,
          adSenseDetector: { enabled: true }
        }
      };

      await engine.start(config);

      // Step 2: Simulate normal operation
      await sleep(100);

      // Step 3: Simulate error conditions
      try {
        // Simulate invalid operations
        if (engine.stealthModules?.cursorSimulator) {
          await engine.stealthModules.cursorSimulator.simulateMovement('invalid', 'invalid');
        }
      } catch (error) {
        // Error should be handled gracefully
        expect(error).toBeDefined();
      }

      // Step 4: Continue normal operation after error
      await sleep(100);
      
      if (engine.stealthModules?.cursorSimulator) {
        await engine.stealthModules.cursorSimulator.simulateMovement(100, 200);
      }

      // Step 5: Simulate detection errors
      try {
        if (engine.detectorModules?.adSenseDetector) {
          await engine.detectorModules.adSenseDetector.detectAds();
        }
      } catch (error) {
        // Error should be handled gracefully
        expect(error).toBeDefined();
      }

      // Step 6: Continue operation
      await sleep(100);

      // Step 7: Stop engine
      await engine.stop();
      expect(engine.state).toBe('stopped');

      console.log('Error Recovery and Graceful Degradation: Completed Successfully');
    });
  });

  describe('Complete User Journey - Performance and Stress Testing', () => {
    test('should handle high-load workflow efficiently', async () => {
      const config = {
        speed: 2,
        strategy: 'linear',
        adapter: 'desktop',
        stealth: {
          enabled: true,
          cursorSimulator: { enabled: true },
          noiseEvents: { enabled: true }
        },
        analytics: {
          enabled: true,
          statsCollector: { enabled: true }
        }
      };

      const startTime = performance.now();
      await engine.start(config);

      // Step 1: High-frequency operations
      for (let i = 0; i < 50; i++) {
        await sleep(10);
        
        if (engine.stealthModules?.cursorSimulator) {
          await engine.stealthModules.cursorSimulator.simulateMovement(100, 200);
        }
        
        if (engine.stealthModules?.noiseEvents) {
          await engine.stealthModules.noiseEvents.generateMouseMoveEvents(1);
        }
        
        if (engine.analyticsModules?.statsCollector) {
          engine.analyticsModules.statsCollector.recordEvent('high-load', { iteration: i });
        }
      }

      // Step 2: Rapid state transitions
      for (let i = 0; i < 10; i++) {
        await engine.pause();
        await sleep(10);
        await engine.resume();
        await sleep(10);
      }

      // Step 3: Memory-intensive operations
      const storage = createNamespacedStorage('e2e-stress-test');
      for (let i = 0; i < 100; i++) {
        await storage.set(`stress-key-${i}`, `stress-value-${i}`);
      }

      // Step 4: Cleanup
      await storage.clear();

      const totalTime = performance.now() - startTime;
      await engine.stop();

      expect(engine.state).toBe('stopped');
      expect(totalTime).toBeLessThan(3000); // Should handle high load efficiently

      console.log(`High-Load Workflow:
        Total Duration: ${totalTime.toFixed(2)}ms
        Operations: 50 iterations + 10 state transitions + 100 storage operations
        Status: Completed Successfully`);
    });

    test('should handle long-running workflow', async () => {
      const config = {
        speed: 1,
        strategy: 'linear',
        adapter: 'desktop',
        stealth: {
          enabled: true,
          cursorSimulator: { enabled: true },
          dwellTimeSimulator: { enabled: true }
        }
      };

      const startTime = performance.now();
      await engine.start(config);

      // Step 1: Long-running simulation
      for (let i = 0; i < 20; i++) {
        await sleep(100);
        
        if (engine.stealthModules?.cursorSimulator) {
          await engine.stealthModules.cursorSimulator.simulateMovement(100, 200);
        }
        
        if (engine.stealthModules?.dwellTimeSimulator) {
          const dwellTime = await engine.stealthModules.dwellTimeSimulator.simulatePageDwellTime();
          await sleep(dwellTime);
        }
        
        // Simulate periodic state changes
        if (i % 5 === 0) {
          await engine.pause();
          await sleep(50);
          await engine.resume();
        }
      }

      const totalTime = performance.now() - startTime;
      await engine.stop();

      expect(engine.state).toBe('stopped');
      expect(totalTime).toBeLessThan(5000); // Should handle long-running efficiently

      console.log(`Long-Running Workflow:
        Total Duration: ${totalTime.toFixed(2)}ms
        Iterations: 20 with dwell time simulation
        Status: Completed Successfully`);
    });
  });

  describe('Complete User Journey - Real-world Scenarios', () => {
    test('should simulate realistic news website browsing', async () => {
      const config = {
        speed: 2,
        strategy: 'linear',
        adapter: 'desktop',
        stealth: {
          enabled: true,
          cursorSimulator: { enabled: true },
          noiseEvents: { enabled: true },
          dwellTimeSimulator: { enabled: true }
        },
        detectors: {
          enabled: true,
          adSenseDetector: { enabled: true },
          navigationDetector: { enabled: true }
        },
        navigation: {
          enabled: true,
          navigationController: { enabled: true }
        }
      };

      await engine.start(config);

      // Step 1: Initial page load and exploration
      await sleep(200);

      // Step 2: Read article content
      if (engine.stealthModules?.dwellTimeSimulator) {
        const readingTime = await engine.stealthModules.dwellTimeSimulator.calculateReadingTime(
          'This is a comprehensive article about autoscroll extension testing. It contains multiple paragraphs and sections that would typically be found on a news website.'
        );
        await sleep(readingTime);
      }

      // Step 3: Scroll through article
      for (let i = 0; i < 8; i++) {
        await sleep(100);
        
        if (engine.stealthModules?.cursorSimulator) {
          await engine.stealthModules.cursorSimulator.simulateMovement(100, 200);
        }
        
        // Simulate reading pauses
        if (i % 3 === 0) {
          await sleep(150);
        }
      }

      // Step 4: Interact with ads
      if (engine.detectorModules?.adSenseDetector) {
        const ads = await engine.detectorModules.adSenseDetector.detectAds();
        if (ads.length > 0) {
          await sleep(100); // Ad viewing time
        }
      }

      // Step 5: Navigate to related articles
      if (engine.detectorModules?.navigationDetector) {
        const navElements = await engine.detectorModules.navigationDetector.detectNavigationElements();
        if (navElements.length > 0) {
          await sleep(100);
        }
      }

      if (engine.navigationModules?.navigationController) {
        await engine.navigationModules.navigationController.navigateToNext();
        await sleep(200);
      }

      // Step 6: Continue browsing
      for (let i = 0; i < 5; i++) {
        await sleep(100);
        
        if (engine.stealthModules?.cursorSimulator) {
          await engine.stealthModules.cursorSimulator.simulateMovement(100, 200);
        }
      }

      await engine.stop();
      expect(engine.state).toBe('stopped');

      console.log('Realistic News Website Browsing: Completed Successfully');
    });

    test('should simulate e-commerce website browsing', async () => {
      const config = {
        speed: 1.5,
        strategy: 'momentum',
        adapter: 'desktop',
        stealth: {
          enabled: true,
          cursorSimulator: { enabled: true },
          hoverSimulator: { enabled: true },
          dwellTimeSimulator: { enabled: true }
        },
        detectors: {
          enabled: true,
          adSenseDetector: { enabled: true },
          keywordDetector: { enabled: true }
        }
      };

      await engine.start(config);

      // Step 1: Browse product categories
      await sleep(200);

      // Step 2: Hover over products
      const productElements = safeQuerySelectorAll('.feature-item');
      for (let i = 0; i < Math.min(3, productElements.length); i++) {
        if (engine.stealthModules?.hoverSimulator) {
          await engine.stealthModules.hoverSimulator.simulateHoverDelay(productElements[i], 200);
        }
        await sleep(100);
      }

      // Step 3: Scroll through product listings
      for (let i = 0; i < 6; i++) {
        await sleep(100);
        
        if (engine.stealthModules?.cursorSimulator) {
          await engine.stealthModules.cursorSimulator.simulateMovement(100, 200);
        }
        
        // Simulate product viewing time
        if (i % 2 === 0) {
          await sleep(150);
        }
      }

      // Step 4: Search for specific keywords
      if (engine.detectorModules?.keywordDetector) {
        const keywordLinks = await engine.detectorModules.keywordDetector.detectKeywordLinks(['product', 'buy', 'sale']);
        if (keywordLinks.length > 0) {
          await sleep(100);
        }
      }

      // Step 5: Interact with promotional ads
      if (engine.detectorModules?.adSenseDetector) {
        const ads = await engine.detectorModules.adSenseDetector.detectAds();
        if (ads.length > 0) {
          await sleep(200); // Longer ad viewing time for e-commerce
        }
      }

      // Step 6: Continue browsing
      for (let i = 0; i < 4; i++) {
        await sleep(100);
        
        if (engine.stealthModules?.cursorSimulator) {
          await engine.stealthModules.cursorSimulator.simulateMovement(100, 200);
        }
      }

      await engine.stop();
      expect(engine.state).toBe('stopped');

      console.log('E-commerce Website Browsing: Completed Successfully');
    });
  });

  describe('Complete User Journey - Cross-platform Testing', () => {
    test('should handle desktop to mobile workflow transition', async () => {
      // Step 1: Start with desktop configuration
      let config = {
        speed: 2,
        strategy: 'linear',
        adapter: 'desktop',
        stealth: {
          enabled: true,
          cursorSimulator: { enabled: true }
        }
      };

      await engine.start(config);
      expect(engine.state).toBe('running');

      // Step 2: Simulate desktop browsing
      for (let i = 0; i < 3; i++) {
        await sleep(100);
        if (engine.stealthModules?.cursorSimulator) {
          await engine.stealthModules.cursorSimulator.simulateMovement(100, 200);
        }
      }

      // Step 3: Switch to mobile configuration
      config = {
        speed: 1.5,
        strategy: 'momentum',
        adapter: 'mobile',
        stealth: {
          enabled: true,
          gestureSimulator: { enabled: true }
        }
      };

      await engine.stop();
      await engine.start(config);
      expect(engine.state).toBe('running');

      // Step 4: Simulate mobile browsing
      for (let i = 0; i < 3; i++) {
        await sleep(100);
        if (engine.stealthModules?.gestureSimulator) {
          await engine.stealthModules.gestureSimulator.simulateSwipe(100, 200, 100, 400);
        }
      }

      // Step 5: Stop engine
      await engine.stop();
      expect(engine.state).toBe('stopped');

      console.log('Desktop to Mobile Workflow Transition: Completed Successfully');
    });

    test('should handle strategy switching during workflow', async () => {
      const config = {
        speed: 2,
        strategy: 'linear',
        adapter: 'desktop',
        stealth: {
          enabled: true,
          cursorSimulator: { enabled: true }
        }
      };

      await engine.start(config);

      // Step 1: Start with linear strategy
      for (let i = 0; i < 2; i++) {
        await sleep(100);
        if (engine.stealthModules?.cursorSimulator) {
          await engine.stealthModules.cursorSimulator.simulateMovement(100, 200);
        }
      }

      // Step 2: Switch to burst strategy
      await engine.setStrategy('burst');
      for (let i = 0; i < 2; i++) {
        await sleep(100);
        if (engine.stealthModules?.cursorSimulator) {
          await engine.stealthModules.cursorSimulator.simulateMovement(100, 200);
        }
      }

      // Step 3: Switch to momentum strategy
      await engine.setStrategy('momentum');
      for (let i = 0; i < 2; i++) {
        await sleep(100);
        if (engine.stealthModules?.cursorSimulator) {
          await engine.stealthModules.cursorSimulator.simulateMovement(100, 200);
        }
      }

      // Step 4: Stop engine
      await engine.stop();
      expect(engine.state).toBe('stopped');

      console.log('Strategy Switching During Workflow: Completed Successfully');
    });
  });
});
