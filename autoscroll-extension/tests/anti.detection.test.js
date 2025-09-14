/**
 * Anti-Detection Tests
 * Testing specific anti-detection capabilities and bot detection avoidance
 */

import { AutoscrollEngine } from '../src/core/engine.js';
import { createLogger } from '../src/utils/logger.js';
import { sleep, createRandomDelay, createHumanBehaviorDelay } from '../src/utils/time.js';
import { safeQuerySelector, isElementVisible, getScrollPosition } from '../src/utils/dom.js';
import { createWheelEvent, createMouseEvent, createTouchEvent, dispatchEventNatural } from '../src/utils/events.js';

describe('Anti-Detection Tests', () => {
  let engine;
  let logger;

  beforeEach(() => {
    engine = new AutoscrollEngine();
    logger = createLogger('anti-detection-test');
    
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
    global.testUtils.mockUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    global.testUtils.mockScreen(1920, 1080);
  });

  afterEach(async () => {
    if (engine && engine.state === 'running') {
      await engine.stop();
    }
    document.body.innerHTML = '';
  });

  describe('Timing Pattern Avoidance', () => {
    test('should avoid perfect timing intervals', async () => {
      const config = {
        stealth: {
          enabled: true,
          cursorSimulator: { enabled: true }
        }
      };

      await engine.start(config);

      // Test timing variation
      const timings = [];
      for (let i = 0; i < 10; i++) {
        const startTime = Date.now();
        await sleep(50);
        const endTime = Date.now();
        timings.push(endTime - startTime);
      }

      // Check for timing variation (not all identical)
      const uniqueTimings = new Set(timings);
      expect(uniqueTimings.size).toBeGreaterThan(1);

      // Test that timings are not perfectly regular
      const intervals = [];
      for (let i = 1; i < timings.length; i++) {
        intervals.push(Math.abs(timings[i] - timings[i-1]));
      }

      // Should have some variation in intervals
      const uniqueIntervals = new Set(intervals);
      expect(uniqueIntervals.size).toBeGreaterThan(1);
    });

    test('should avoid perfect scroll timing', async () => {
      const config = {
        stealth: {
          enabled: true,
          errorSimulator: { enabled: true }
        }
      };

      await engine.start(config);

      // Test scroll timing variation
      const scrollTimings = [];
      for (let i = 0; i < 5; i++) {
        const startTime = Date.now();
        await engine.stealthModules.errorSimulator.simulateRandomPause();
        const endTime = Date.now();
        scrollTimings.push(endTime - startTime);
      }

      // Check for scroll timing variation
      const uniqueScrollTimings = new Set(scrollTimings);
      expect(uniqueScrollTimings.size).toBeGreaterThan(1);

      // Test that scroll timings are not perfectly regular
      const scrollIntervals = [];
      for (let i = 1; i < scrollTimings.length; i++) {
        scrollIntervals.push(Math.abs(scrollTimings[i] - scrollTimings[i-1]));
      }

      // Should have some variation in scroll intervals
      const uniqueScrollIntervals = new Set(scrollIntervals);
      expect(uniqueScrollIntervals.size).toBeGreaterThan(1);
    });

    test('should avoid perfect mouse movement timing', async () => {
      const config = {
        stealth: {
          enabled: true,
          cursorSimulator: { enabled: true }
        }
      };

      await engine.start(config);

      // Test mouse movement timing variation
      const movementTimings = [];
      for (let i = 0; i < 5; i++) {
        const startTime = Date.now();
        await engine.stealthModules.cursorSimulator.simulateMovement(100, 200);
        const endTime = Date.now();
        movementTimings.push(endTime - startTime);
      }

      // Check for movement timing variation
      const uniqueMovementTimings = new Set(movementTimings);
      expect(uniqueMovementTimings.size).toBeGreaterThan(1);

      // Test that movement timings are not perfectly regular
      const movementIntervals = [];
      for (let i = 1; i < movementTimings.length; i++) {
        movementIntervals.push(Math.abs(movementTimings[i] - movementTimings[i-1]));
      }

      // Should have some variation in movement intervals
      const uniqueMovementIntervals = new Set(movementIntervals);
      expect(uniqueMovementIntervals.size).toBeGreaterThan(1);
    });
  });

  describe('Movement Pattern Avoidance', () => {
    test('should avoid perfect linear movements', async () => {
      const config = {
        stealth: {
          enabled: true,
          cursorSimulator: { enabled: true }
        }
      };

      await engine.start(config);

      // Test movement variation
      const movements = [];
      for (let i = 0; i < 10; i++) {
        const movement = await engine.stealthModules.cursorSimulator.simulateMovement(100, 200);
        movements.push(movement);
      }

      // Check for movement variation
      const uniqueMovements = new Set(movements.map(m => `${m.x},${m.y}`));
      expect(uniqueMovements.size).toBeGreaterThan(1);

      // Test that movements are not perfectly linear
      const distances = [];
      for (let i = 1; i < movements.length; i++) {
        const distance = Math.sqrt(
          Math.pow(movements[i].x - movements[i-1].x, 2) +
          Math.pow(movements[i].y - movements[i-1].y, 2)
        );
        distances.push(distance);
      }

      // Should have some variation in distances
      const uniqueDistances = new Set(distances);
      expect(uniqueDistances.size).toBeGreaterThan(1);
    });

    test('should avoid perfect scroll distances', async () => {
      const config = {
        stealth: {
          enabled: true,
          cursorSimulator: { enabled: true }
        }
      };

      await engine.start(config);

      // Test scroll distance variation
      const scrollDistances = [];
      for (let i = 0; i < 10; i++) {
        const movement = await engine.stealthModules.cursorSimulator.simulateMovement(100, 200);
        scrollDistances.push(movement.y);
      }

      // Check for scroll distance variation
      const uniqueScrollDistances = new Set(scrollDistances);
      expect(uniqueScrollDistances.size).toBeGreaterThan(1);

      // Test that scroll distances are not perfectly regular
      const scrollIntervals = [];
      for (let i = 1; i < scrollDistances.length; i++) {
        scrollIntervals.push(Math.abs(scrollDistances[i] - scrollDistances[i-1]));
      }

      // Should have some variation in scroll intervals
      const uniqueScrollIntervals = new Set(scrollIntervals);
      expect(uniqueScrollIntervals.size).toBeGreaterThan(1);
    });

    test('should avoid perfect mouse trajectories', async () => {
      const config = {
        stealth: {
          enabled: true,
          cursorSimulator: { enabled: true }
        }
      };

      await engine.start(config);

      // Test mouse trajectory variation
      const trajectories = [];
      for (let i = 0; i < 5; i++) {
        const trajectory = [];
        for (let j = 0; j < 3; j++) {
          const movement = await engine.stealthModules.cursorSimulator.simulateMovement(100, 200);
          trajectory.push(movement);
        }
        trajectories.push(trajectory);
      }

      // Check for trajectory variation
      const uniqueTrajectories = new Set(trajectories.map(t => JSON.stringify(t)));
      expect(uniqueTrajectories.size).toBeGreaterThan(1);

      // Test that trajectories are not perfectly regular
      const trajectoryAngles = [];
      trajectories.forEach(trajectory => {
        for (let i = 1; i < trajectory.length; i++) {
          const angle = Math.atan2(
            trajectory[i].y - trajectory[i-1].y,
            trajectory[i].x - trajectory[i-1].x
          );
          trajectoryAngles.push(angle);
        }
      });

      // Should have some variation in trajectory angles
      const uniqueAngles = new Set(trajectoryAngles);
      expect(uniqueAngles.size).toBeGreaterThan(1);
    });
  });

  describe('Behavior Pattern Avoidance', () => {
    test('should avoid perfect reading patterns', async () => {
      const config = {
        stealth: {
          enabled: true,
          dwellTimeSimulator: { enabled: true }
        }
      };

      await engine.start(config);

      // Test reading pattern variation
      const readingPatterns = [];
      for (let i = 0; i < 5; i++) {
        const content = `Test content ${i} with some words to read and understand.`;
        const readingTime = await engine.stealthModules.dwellTimeSimulator.calculateReadingTime(content);
        readingPatterns.push(readingTime);
      }

      // Check for reading pattern variation
      const uniqueReadingPatterns = new Set(readingPatterns);
      expect(uniqueReadingPatterns.size).toBeGreaterThan(1);

      // Test that reading patterns are not perfectly regular
      const readingIntervals = [];
      for (let i = 1; i < readingPatterns.length; i++) {
        readingIntervals.push(Math.abs(readingPatterns[i] - readingPatterns[i-1]));
      }

      // Should have some variation in reading intervals
      const uniqueReadingIntervals = new Set(readingIntervals);
      expect(uniqueReadingIntervals.size).toBeGreaterThan(1);
    });

    test('should avoid perfect hover patterns', async () => {
      const config = {
        stealth: {
          enabled: true,
          hoverSimulator: { enabled: true }
        }
      };

      await engine.start(config);

      const element = safeQuerySelector('#content');

      // Test hover pattern variation
      const hoverPatterns = [];
      for (let i = 0; i < 5; i++) {
        const startTime = Date.now();
        await engine.stealthModules.hoverSimulator.simulateHoverDelay(element, 100);
        const endTime = Date.now();
        hoverPatterns.push(endTime - startTime);
      }

      // Check for hover pattern variation
      const uniqueHoverPatterns = new Set(hoverPatterns);
      expect(uniqueHoverPatterns.size).toBeGreaterThan(1);

      // Test that hover patterns are not perfectly regular
      const hoverIntervals = [];
      for (let i = 1; i < hoverPatterns.length; i++) {
        hoverIntervals.push(Math.abs(hoverPatterns[i] - hoverPatterns[i-1]));
      }

      // Should have some variation in hover intervals
      const uniqueHoverIntervals = new Set(hoverIntervals);
      expect(uniqueHoverIntervals.size).toBeGreaterThan(1);
    });

    test('should avoid perfect error patterns', async () => {
      const config = {
        stealth: {
          enabled: true,
          errorSimulator: { enabled: true }
        }
      };

      await engine.start(config);

      // Test error pattern variation
      const errorPatterns = [];
      for (let i = 0; i < 5; i++) {
        const startTime = Date.now();
        await engine.stealthModules.errorSimulator.simulateRandomPause();
        const endTime = Date.now();
        errorPatterns.push(endTime - startTime);
      }

      // Check for error pattern variation
      const uniqueErrorPatterns = new Set(errorPatterns);
      expect(uniqueErrorPatterns.size).toBeGreaterThan(1);

      // Test that error patterns are not perfectly regular
      const errorIntervals = [];
      for (let i = 1; i < errorPatterns.length; i++) {
        errorIntervals.push(Math.abs(errorPatterns[i] - errorPatterns[i-1]));
      }

      // Should have some variation in error intervals
      const uniqueErrorIntervals = new Set(errorIntervals);
      expect(uniqueErrorIntervals.size).toBeGreaterThan(1);
    });
  });

  describe('Fingerprint Variation', () => {
    test('should vary user agent strings effectively', async () => {
      const config = {
        stealth: {
          enabled: true,
          fingerprintVariation: { enabled: true }
        }
      };

      await engine.start(config);

      // Test user agent variation
      const userAgents = [];
      for (let i = 0; i < 10; i++) {
        const userAgent = await engine.stealthModules.fingerprintVariation.varyUserAgent();
        userAgents.push(userAgent);
      }

      // Check for user agent variation
      const uniqueUserAgents = new Set(userAgents);
      expect(uniqueUserAgents.size).toBeGreaterThan(1);

      // Test that user agents are not identical
      const userAgentVariations = [];
      for (let i = 1; i < userAgents.length; i++) {
        if (userAgents[i] !== userAgents[i-1]) {
          userAgentVariations.push(true);
        }
      }

      // Should have some user agent variations
      expect(userAgentVariations.length).toBeGreaterThan(0);
    });

    test('should vary timezone information effectively', async () => {
      const config = {
        stealth: {
          enabled: true,
          fingerprintVariation: { enabled: true }
        }
      };

      await engine.start(config);

      // Test timezone variation
      const timezones = [];
      for (let i = 0; i < 10; i++) {
        const timezone = await engine.stealthModules.fingerprintVariation.varyTimezone();
        timezones.push(timezone);
      }

      // Check for timezone variation
      const uniqueTimezones = new Set(timezones);
      expect(uniqueTimezones.size).toBeGreaterThan(1);

      // Test that timezones are not identical
      const timezoneVariations = [];
      for (let i = 1; i < timezones.length; i++) {
        if (timezones[i] !== timezones[i-1]) {
          timezoneVariations.push(true);
        }
      }

      // Should have some timezone variations
      expect(timezoneVariations.length).toBeGreaterThan(0);
    });

    test('should vary language settings effectively', async () => {
      const config = {
        stealth: {
          enabled: true,
          fingerprintVariation: { enabled: true }
        }
      };

      await engine.start(config);

      // Test language variation
      const languages = [];
      for (let i = 0; i < 10; i++) {
        const language = await engine.stealthModules.fingerprintVariation.varyLanguage();
        languages.push(language);
      }

      // Check for language variation
      const uniqueLanguages = new Set(languages);
      expect(uniqueLanguages.size).toBeGreaterThan(1);

      // Test that languages are not identical
      const languageVariations = [];
      for (let i = 1; i < languages.length; i++) {
        if (languages[i] !== languages[i-1]) {
          languageVariations.push(true);
        }
      }

      // Should have some language variations
      expect(languageVariations.length).toBeGreaterThan(0);
    });

    test('should vary screen resolution effectively', async () => {
      const config = {
        stealth: {
          enabled: true,
          fingerprintVariation: { enabled: true }
        }
      };

      await engine.start(config);

      // Test screen resolution variation
      const screens = [];
      for (let i = 0; i < 10; i++) {
        const screen = await engine.stealthModules.fingerprintVariation.varyScreenResolution();
        screens.push(screen);
      }

      // Check for screen resolution variation
      const uniqueScreens = new Set(screens.map(s => `${s.width}x${s.height}`));
      expect(uniqueScreens.size).toBeGreaterThan(1);

      // Test that screen resolutions are not identical
      const screenVariations = [];
      for (let i = 1; i < screens.length; i++) {
        if (screens[i].width !== screens[i-1].width || screens[i].height !== screens[i-1].height) {
          screenVariations.push(true);
        }
      }

      // Should have some screen resolution variations
      expect(screenVariations.length).toBeGreaterThan(0);
    });
  });

  describe('Canvas and WebGL Protection', () => {
    test('should vary canvas fingerprint data effectively', async () => {
      const config = {
        stealth: {
          enabled: true,
          canvasNoise: { enabled: true }
        }
      };

      await engine.start(config);

      // Test canvas data variation
      const canvasData = [];
      for (let i = 0; i < 10; i++) {
        const data = await engine.stealthModules.canvasNoise.generateRandomData(100, 100);
        canvasData.push(data);
      }

      // Check for canvas data variation
      const uniqueCanvasData = new Set(canvasData.map(d => JSON.stringify(d)));
      expect(uniqueCanvasData.size).toBeGreaterThan(1);

      // Test that canvas data is not identical
      const canvasVariations = [];
      for (let i = 1; i < canvasData.length; i++) {
        if (JSON.stringify(canvasData[i]) !== JSON.stringify(canvasData[i-1])) {
          canvasVariations.push(true);
        }
      }

      // Should have some canvas data variations
      expect(canvasVariations.length).toBeGreaterThan(0);
    });

    test('should add effective noise to canvas', async () => {
      const config = {
        stealth: {
          enabled: true,
          canvasNoise: { enabled: true }
        }
      };

      await engine.start(config);

      // Create mock canvas
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;

      // Test canvas noise addition
      const result = await engine.stealthModules.canvasNoise.addNoise(canvas);
      expect(result).toBe(true);

      // Test canvas fingerprint modification
      await engine.stealthModules.canvasNoise.modifyFingerprint(canvas);
      expect(engine.stealthModules.canvasNoise.isActive).toBe(true);
    });
  });

  describe('Noise Events and Background Activity', () => {
    test('should generate varied noise event patterns', async () => {
      const config = {
        stealth: {
          enabled: true,
          noiseEvents: { enabled: true }
        }
      };

      await engine.start(config);

      // Test noise event variation
      const noisePatterns = [];
      for (let i = 0; i < 5; i++) {
        const mouseEvents = await engine.stealthModules.noiseEvents.generateMouseMoveEvents(3);
        const touchEvents = await engine.stealthModules.noiseEvents.generateTouchEvents(2);
        const keyboardEvents = await engine.stealthModules.noiseEvents.generateKeyboardEvents(1);
        
        noisePatterns.push({
          mouse: mouseEvents,
          touch: touchEvents,
          keyboard: keyboardEvents
        });
      }

      // Check for noise pattern variation
      const uniqueNoisePatterns = new Set(noisePatterns.map(p => JSON.stringify(p)));
      expect(uniqueNoisePatterns.size).toBeGreaterThan(1);

      // Test that noise patterns are not identical
      const noiseVariations = [];
      for (let i = 1; i < noisePatterns.length; i++) {
        if (JSON.stringify(noisePatterns[i]) !== JSON.stringify(noisePatterns[i-1])) {
          noiseVariations.push(true);
        }
      }

      // Should have some noise pattern variations
      expect(noiseVariations.length).toBeGreaterThan(0);
    });

    test('should generate varied mouse move events', async () => {
      const config = {
        stealth: {
          enabled: true,
          noiseEvents: { enabled: true }
        }
      };

      await engine.start(config);

      // Test mouse move event variation
      const mouseEvents = [];
      for (let i = 0; i < 5; i++) {
        const events = await engine.stealthModules.noiseEvents.generateMouseMoveEvents(3);
        mouseEvents.push(events);
      }

      // Check for mouse event variation
      const uniqueMouseEvents = new Set(mouseEvents.map(e => JSON.stringify(e)));
      expect(uniqueMouseEvents.size).toBeGreaterThan(1);

      // Test that mouse events are not identical
      const mouseVariations = [];
      for (let i = 1; i < mouseEvents.length; i++) {
        if (JSON.stringify(mouseEvents[i]) !== JSON.stringify(mouseEvents[i-1])) {
          mouseVariations.push(true);
        }
      }

      // Should have some mouse event variations
      expect(mouseVariations.length).toBeGreaterThan(0);
    });

    test('should generate varied touch events', async () => {
      const config = {
        stealth: {
          enabled: true,
          noiseEvents: { enabled: true }
        }
      };

      await engine.start(config);

      // Test touch event variation
      const touchEvents = [];
      for (let i = 0; i < 5; i++) {
        const events = await engine.stealthModules.noiseEvents.generateTouchEvents(3);
        touchEvents.push(events);
      }

      // Check for touch event variation
      const uniqueTouchEvents = new Set(touchEvents.map(e => JSON.stringify(e)));
      expect(uniqueTouchEvents.size).toBeGreaterThan(1);

      // Test that touch events are not identical
      const touchVariations = [];
      for (let i = 1; i < touchEvents.length; i++) {
        if (JSON.stringify(touchEvents[i]) !== JSON.stringify(touchEvents[i-1])) {
          touchVariations.push(true);
        }
      }

      // Should have some touch event variations
      expect(touchVariations.length).toBeGreaterThan(0);
    });

    test('should generate varied keyboard events', async () => {
      const config = {
        stealth: {
          enabled: true,
          noiseEvents: { enabled: true }
        }
      };

      await engine.start(config);

      // Test keyboard event variation
      const keyboardEvents = [];
      for (let i = 0; i < 5; i++) {
        const events = await engine.stealthModules.noiseEvents.generateKeyboardEvents(3);
        keyboardEvents.push(events);
      }

      // Check for keyboard event variation
      const uniqueKeyboardEvents = new Set(keyboardEvents.map(e => JSON.stringify(e)));
      expect(uniqueKeyboardEvents.size).toBeGreaterThan(1);

      // Test that keyboard events are not identical
      const keyboardVariations = [];
      for (let i = 1; i < keyboardEvents.length; i++) {
        if (JSON.stringify(keyboardEvents[i]) !== JSON.stringify(keyboardEvents[i-1])) {
          keyboardVariations.push(true);
        }
      }

      // Should have some keyboard event variations
      expect(keyboardVariations.length).toBeGreaterThan(0);
    });
  });

  describe('Stealth Module Coordination', () => {
    test('should coordinate all stealth modules for maximum stealth', async () => {
      const config = {
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
        }
      };

      await engine.start(config);

      // Verify all stealth modules are active
      expect(engine.stealthModules.cursorSimulator.isActive).toBe(true);
      expect(engine.stealthModules.gestureSimulator.isActive).toBe(true);
      expect(engine.stealthModules.noiseEvents.isActive).toBe(true);
      expect(engine.stealthModules.tabAwareness.isActive).toBe(true);
      expect(engine.stealthModules.canvasNoise.isActive).toBe(true);
      expect(engine.stealthModules.hoverSimulator.isActive).toBe(true);
      expect(engine.stealthModules.dwellTimeSimulator.isActive).toBe(true);
      expect(engine.stealthModules.errorSimulator.isActive).toBe(true);
      expect(engine.stealthModules.fingerprintVariation.isActive).toBe(true);

      // Test coordinated stealth behavior
      const element = safeQuerySelector('#content');

      // 1. Vary fingerprint
      const fingerprint = await engine.stealthModules.fingerprintVariation.generateSessionFingerprint();

      // 2. Simulate cursor movement
      const movement = await engine.stealthModules.cursorSimulator.simulateMovement(100, 200);

      // 3. Generate noise events
      const noiseEvents = await engine.stealthModules.noiseEvents.generateMouseMoveEvents(2);

      // 4. Simulate hover
      await engine.stealthModules.hoverSimulator.simulateHoverDelay(element, 100);

      // 5. Simulate reading time
      const readingTime = await engine.stealthModules.dwellTimeSimulator.simulatePageDwellTime();

      // 6. Simulate human error
      await engine.stealthModules.errorSimulator.simulateRandomPause();

      // 7. Add canvas noise
      const canvas = document.createElement('canvas');
      await engine.stealthModules.canvasNoise.addNoise(canvas);

      // All modules should still be active and coordinated
      expect(engine.stealthModules.cursorSimulator.isActive).toBe(true);
      expect(engine.stealthModules.gestureSimulator.isActive).toBe(true);
      expect(engine.stealthModules.noiseEvents.isActive).toBe(true);
      expect(engine.stealthModules.tabAwareness.isActive).toBe(true);
      expect(engine.stealthModules.canvasNoise.isActive).toBe(true);
      expect(engine.stealthModules.hoverSimulator.isActive).toBe(true);
      expect(engine.stealthModules.dwellTimeSimulator.isActive).toBe(true);
      expect(engine.stealthModules.errorSimulator.isActive).toBe(true);
      expect(engine.stealthModules.fingerprintVariation.isActive).toBe(true);
    });

    test('should handle stealth module state synchronization', async () => {
      const config = {
        stealth: {
          enabled: true,
          cursorSimulator: { enabled: true },
          noiseEvents: { enabled: true },
          tabAwareness: { enabled: true }
        }
      };

      await engine.start(config);

      // All modules should be active
      expect(engine.stealthModules.cursorSimulator.isActive).toBe(true);
      expect(engine.stealthModules.noiseEvents.isActive).toBe(true);
      expect(engine.stealthModules.tabAwareness.isActive).toBe(true);

      // Pause engine
      await engine.pause();

      // All stealth modules should be paused
      expect(engine.stealthModules.cursorSimulator.isPaused).toBe(true);
      expect(engine.stealthModules.noiseEvents.isPaused).toBe(true);
      expect(engine.stealthModules.tabAwareness.isPaused).toBe(true);

      // Resume engine
      await engine.resume();

      // All stealth modules should be resumed
      expect(engine.stealthModules.cursorSimulator.isPaused).toBe(false);
      expect(engine.stealthModules.noiseEvents.isPaused).toBe(false);
      expect(engine.stealthModules.tabAwareness.isPaused).toBe(false);
    });
  });

  describe('Anti-Detection Performance', () => {
    test('should maintain stealth performance under load', async () => {
      const config = {
        stealth: {
          enabled: true,
          cursorSimulator: { enabled: true },
          noiseEvents: { enabled: true },
          errorSimulator: { enabled: true }
        }
      };

      await engine.start(config);

      const startTime = performance.now();

      // Perform multiple stealth operations
      for (let i = 0; i < 10; i++) {
        await engine.stealthModules.cursorSimulator.simulateMovement(100, 200);
        await engine.stealthModules.noiseEvents.generateMouseMoveEvents(2);
        await engine.stealthModules.errorSimulator.simulateRandomPause();
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time
      expect(duration).toBeLessThan(5000);

      // All modules should still be active
      expect(engine.stealthModules.cursorSimulator.isActive).toBe(true);
      expect(engine.stealthModules.noiseEvents.isActive).toBe(true);
      expect(engine.stealthModules.errorSimulator.isActive).toBe(true);
    });

    test('should handle stealth module cleanup properly', async () => {
      const config = {
        stealth: {
          enabled: true,
          cursorSimulator: { enabled: true },
          noiseEvents: { enabled: true },
          tabAwareness: { enabled: true }
        }
      };

      await engine.start(config);

      // Verify modules are active
      expect(engine.stealthModules.cursorSimulator.isActive).toBe(true);
      expect(engine.stealthModules.noiseEvents.isActive).toBe(true);
      expect(engine.stealthModules.tabAwareness.isActive).toBe(true);

      // Stop engine
      await engine.stop();

      // Verify modules are cleaned up
      expect(engine.stealthModules.cursorSimulator.isActive).toBe(false);
      expect(engine.stealthModules.noiseEvents.isActive).toBe(false);
      expect(engine.stealthModules.tabAwareness.isActive).toBe(false);
    });
  });
});
