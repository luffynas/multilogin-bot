/**
 * Stealth Detection Tests
 * Testing anti-bot capabilities and stealth detection avoidance
 */

import { AutoscrollEngine } from '../src/core/engine.js';
import { createLogger } from '../src/utils/logger.js';
import { sleep, createRandomDelay, createHumanBehaviorDelay } from '../src/utils/time.js';
import { safeQuerySelector, isElementVisible, getScrollPosition } from '../src/utils/dom.js';
import { createWheelEvent, createMouseEvent, createTouchEvent, dispatchEventNatural } from '../src/utils/events.js';
import { createNamespacedStorage } from '../src/utils/storage.js';

describe('Stealth Detection Tests', () => {
  let engine;
  let logger;

  beforeEach(() => {
    engine = new AutoscrollEngine();
    logger = createLogger('stealth-detection-test');
    
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

  describe('Bot Detection Avoidance', () => {
    test('should avoid perfect timing patterns', async () => {
      const config = {
        stealth: {
          enabled: true,
          cursorSimulator: { enabled: true },
          noiseEvents: { enabled: true }
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

      // Test random delays
      const delays = [];
      for (let i = 0; i < 5; i++) {
        const delay = await createRandomDelay(100, 300);
        delays.push(delay);
      }

      // Check for delay variation
      const uniqueDelays = new Set(delays);
      expect(uniqueDelays.size).toBeGreaterThan(1);
    });

    test('should avoid perfect scroll patterns', async () => {
      const config = {
        stealth: {
          enabled: true,
          cursorSimulator: { enabled: true }
        }
      };

      await engine.start(config);

      // Test scroll step variation
      const scrollSteps = [];
      for (let i = 0; i < 10; i++) {
        const step = await engine.stealthModules.cursorSimulator.simulateMovement(100, 200);
        scrollSteps.push(step);
      }

      // Check for movement variation
      const uniqueSteps = new Set(scrollSteps.map(s => `${s.x},${s.y}`));
      expect(uniqueSteps.size).toBeGreaterThan(1);

      // Test scroll distance variation
      const distances = [];
      for (let i = 0; i < 5; i++) {
        const distance = Math.abs(scrollSteps[i].y - scrollSteps[i + 1]?.y || 0);
        if (distance > 0) distances.push(distance);
      }

      // Check for distance variation
      if (distances.length > 1) {
        const uniqueDistances = new Set(distances);
        expect(uniqueDistances.size).toBeGreaterThan(1);
      }
    });

    test('should avoid perfect mouse movement patterns', async () => {
      const config = {
        stealth: {
          enabled: true,
          cursorSimulator: { enabled: true },
          noiseEvents: { enabled: true }
        }
      };

      await engine.start(config);

      // Test mouse movement variation
      const movements = [];
      for (let i = 0; i < 10; i++) {
        const movement = await engine.stealthModules.cursorSimulator.simulateMovement(100, 200);
        movements.push(movement);
      }

      // Check for movement variation
      const uniqueMovements = new Set(movements.map(m => `${m.x},${m.y}`));
      expect(uniqueMovements.size).toBeGreaterThan(1);

      // Test noise events variation
      const noiseEvents = await engine.stealthModules.noiseEvents.generateMouseMoveEvents(5);
      expect(noiseEvents).toHaveLength(5);

      // Check for noise event variation
      const uniqueNoise = new Set(noiseEvents.map(e => `${e.clientX},${e.clientY}`));
      expect(uniqueNoise.size).toBeGreaterThan(1);
    });

    test('should avoid perfect scroll timing', async () => {
      const config = {
        stealth: {
          enabled: true,
          errorSimulator: { enabled: true }
        }
      };

      await engine.start(config);

      // Test error simulation for realistic timing
      const errors = [];
      for (let i = 0; i < 5; i++) {
        const startTime = Date.now();
        await engine.stealthModules.errorSimulator.simulateRandomPause();
        const endTime = Date.now();
        errors.push(endTime - startTime);
      }

      // Check for error timing variation
      const uniqueErrors = new Set(errors);
      expect(uniqueErrors.size).toBeGreaterThan(1);

      // Test hesitation simulation
      const hesitations = [];
      for (let i = 0; i < 3; i++) {
        const hesitation = await engine.stealthModules.errorSimulator.simulateHesitation();
        hesitations.push(hesitation.duration);
      }

      // Check for hesitation variation
      const uniqueHesitations = new Set(hesitations);
      expect(uniqueHesitations.size).toBeGreaterThan(1);
    });
  });

  describe('Human Behavior Simulation', () => {
    test('should simulate realistic reading patterns', async () => {
      const config = {
        stealth: {
          enabled: true,
          dwellTimeSimulator: { enabled: true }
        }
      };

      await engine.start(config);

      // Test reading time calculation
      const content = 'This is a test content with some words to read and understand.';
      const readingTime = await engine.stealthModules.dwellTimeSimulator.calculateReadingTime(content);
      expect(readingTime).toBeGreaterThan(0);
      expect(typeof readingTime).toBe('number');

      // Test page dwell time simulation
      const pageDwellTime = await engine.stealthModules.dwellTimeSimulator.simulatePageDwellTime();
      expect(pageDwellTime).toBeGreaterThan(0);
      expect(typeof pageDwellTime).toBe('number');

      // Test content-aware idle time
      const idleTime = await engine.stealthModules.dwellTimeSimulator.simulateContentAwareIdle();
      expect(idleTime).toBeGreaterThan(0);
      expect(typeof idleTime).toBe('number');
    });

    test('should simulate realistic hover patterns', async () => {
      const config = {
        stealth: {
          enabled: true,
          hoverSimulator: { enabled: true }
        }
      };

      await engine.start(config);

      const element = safeQuerySelector('#content');

      // Test hover delay simulation
      const startTime = Date.now();
      await engine.stealthModules.hoverSimulator.simulateHoverDelay(element, 100);
      const endTime = Date.now();
      expect(endTime - startTime).toBeGreaterThanOrEqual(90);

      // Test multi-hover simulation
      const multiHover = await engine.stealthModules.hoverSimulator.simulateMultiHover(element, 3);
      expect(multiHover).toBe(true);

      // Test natural hover pattern
      const pattern = await engine.stealthModules.hoverSimulator.simulateNaturalHover(element);
      expect(pattern).toBeDefined();
      expect(pattern).toHaveProperty('duration');
      expect(pattern).toHaveProperty('movements');
    });

    test('should simulate realistic gesture patterns', async () => {
      const config = {
        stealth: {
          enabled: true,
          gestureSimulator: { enabled: true }
        }
      };

      await engine.start(config);

      // Test swipe gesture simulation
      const swipe = await engine.stealthModules.gestureSimulator.simulateSwipe(100, 200, 300, 400);
      expect(swipe).toHaveProperty('startX');
      expect(swipe).toHaveProperty('startY');
      expect(swipe).toHaveProperty('endX');
      expect(swipe).toHaveProperty('endY');

      // Test tap gesture simulation
      const tap = await engine.stealthModules.gestureSimulator.simulateTap(150, 250);
      expect(tap).toHaveProperty('x');
      expect(tap).toHaveProperty('y');

      // Test pinch gesture simulation
      const pinch = await engine.stealthModules.gestureSimulator.simulatePinch(100, 200, 1.5);
      expect(pinch).toHaveProperty('centerX');
      expect(pinch).toHaveProperty('centerY');
      expect(pinch).toHaveProperty('scale');
    });

    test('should simulate realistic error patterns', async () => {
      const config = {
        stealth: {
          enabled: true,
          errorSimulator: { enabled: true }
        }
      };

      await engine.start(config);

      // Test wrong click simulation
      const element = safeQuerySelector('#content');
      const wrongClick = await engine.stealthModules.errorSimulator.simulateWrongClick(element);
      expect(wrongClick).toBe(true);

      // Test scroll up after down simulation
      const scrollUp = await engine.stealthModules.errorSimulator.simulateScrollUpAfterDown();
      expect(scrollUp).toBe(true);

      // Test random pause simulation
      const startTime = Date.now();
      await engine.stealthModules.errorSimulator.simulateRandomPause();
      const endTime = Date.now();
      expect(endTime - startTime).toBeGreaterThan(0);

      // Test hesitation simulation
      const hesitation = await engine.stealthModules.errorSimulator.simulateHesitation();
      expect(hesitation).toBeDefined();
      expect(hesitation).toHaveProperty('duration');
    });
  });

  describe('Fingerprint Variation', () => {
    test('should vary user agent strings', async () => {
      const config = {
        stealth: {
          enabled: true,
          fingerprintVariation: { enabled: true }
        }
      };

      await engine.start(config);

      // Test user agent variation
      const userAgent = await engine.stealthModules.fingerprintVariation.varyUserAgent();
      expect(typeof userAgent).toBe('string');
      expect(userAgent).toContain('Mozilla');

      // Test multiple user agent variations
      const userAgents = [];
      for (let i = 0; i < 3; i++) {
        const ua = await engine.stealthModules.fingerprintVariation.varyUserAgent();
        userAgents.push(ua);
      }

      // Check for user agent variation
      const uniqueUserAgents = new Set(userAgents);
      expect(uniqueUserAgents.size).toBeGreaterThan(1);
    });

    test('should vary timezone information', async () => {
      const config = {
        stealth: {
          enabled: true,
          fingerprintVariation: { enabled: true }
        }
      };

      await engine.start(config);

      // Test timezone variation
      const timezone = await engine.stealthModules.fingerprintVariation.varyTimezone();
      expect(typeof timezone).toBe('string');
      expect(timezone).toMatch(/^[A-Za-z_\/]+$/);

      // Test multiple timezone variations
      const timezones = [];
      for (let i = 0; i < 3; i++) {
        const tz = await engine.stealthModules.fingerprintVariation.varyTimezone();
        timezones.push(tz);
      }

      // Check for timezone variation
      const uniqueTimezones = new Set(timezones);
      expect(uniqueTimezones.size).toBeGreaterThan(1);
    });

    test('should vary language settings', async () => {
      const config = {
        stealth: {
          enabled: true,
          fingerprintVariation: { enabled: true }
        }
      };

      await engine.start(config);

      // Test language variation
      const language = await engine.stealthModules.fingerprintVariation.varyLanguage();
      expect(typeof language).toBe('string');
      expect(language).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/);

      // Test multiple language variations
      const languages = [];
      for (let i = 0; i < 3; i++) {
        const lang = await engine.stealthModules.fingerprintVariation.varyLanguage();
        languages.push(lang);
      }

      // Check for language variation
      const uniqueLanguages = new Set(languages);
      expect(uniqueLanguages.size).toBeGreaterThan(1);
    });

    test('should vary screen resolution', async () => {
      const config = {
        stealth: {
          enabled: true,
          fingerprintVariation: { enabled: true }
        }
      };

      await engine.start(config);

      // Test screen resolution variation
      const screen = await engine.stealthModules.fingerprintVariation.varyScreenResolution();
      expect(screen).toHaveProperty('width');
      expect(screen).toHaveProperty('height');
      expect(typeof screen.width).toBe('number');
      expect(typeof screen.height).toBe('number');

      // Test multiple screen resolution variations
      const screens = [];
      for (let i = 0; i < 3; i++) {
        const scr = await engine.stealthModules.fingerprintVariation.varyScreenResolution();
        screens.push(scr);
      }

      // Check for screen resolution variation
      const uniqueScreens = new Set(screens.map(s => `${s.width}x${s.height}`));
      expect(uniqueScreens.size).toBeGreaterThan(1);
    });

    test('should generate session fingerprints', async () => {
      const config = {
        stealth: {
          enabled: true,
          fingerprintVariation: { enabled: true }
        }
      };

      await engine.start(config);

      // Test session fingerprint generation
      const fingerprint = await engine.stealthModules.fingerprintVariation.generateSessionFingerprint();
      expect(fingerprint).toBeDefined();
      expect(fingerprint).toHaveProperty('userAgent');
      expect(fingerprint).toHaveProperty('timezone');
      expect(fingerprint).toHaveProperty('language');
      expect(fingerprint).toHaveProperty('screen');

      // Test multiple fingerprint variations
      const fingerprints = [];
      for (let i = 0; i < 3; i++) {
        const fp = await engine.stealthModules.fingerprintVariation.generateSessionFingerprint();
        fingerprints.push(fp);
      }

      // Check for fingerprint variation
      const uniqueFingerprints = new Set(fingerprints.map(f => JSON.stringify(f)));
      expect(uniqueFingerprints.size).toBeGreaterThan(1);
    });
  });

  describe('Canvas and WebGL Protection', () => {
    test('should add noise to canvas fingerprinting', async () => {
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

      // Test random canvas data generation
      const data = await engine.stealthModules.canvasNoise.generateRandomData(100, 100);
      expect(data).toBeDefined();
      expect(data).toHaveProperty('width');
      expect(data).toHaveProperty('height');

      // Test canvas fingerprint modification
      await engine.stealthModules.canvasNoise.modifyFingerprint(canvas);
      expect(engine.stealthModules.canvasNoise.isActive).toBe(true);
    });

    test('should vary canvas fingerprint data', async () => {
      const config = {
        stealth: {
          enabled: true,
          canvasNoise: { enabled: true }
        }
      };

      await engine.start(config);

      // Test multiple canvas data variations
      const canvasData = [];
      for (let i = 0; i < 3; i++) {
        const data = await engine.stealthModules.canvasNoise.generateRandomData(100, 100);
        canvasData.push(data);
      }

      // Check for canvas data variation
      const uniqueCanvasData = new Set(canvasData.map(d => JSON.stringify(d)));
      expect(uniqueCanvasData.size).toBeGreaterThan(1);
    });
  });

  describe('Tab Awareness and Focus Simulation', () => {
    test('should handle tab visibility changes', async () => {
      const config = {
        stealth: {
          enabled: true,
          tabAwareness: { enabled: true }
        }
      };

      await engine.start(config);

      // Test tab blur handling
      await engine.stealthModules.tabAwareness.handleTabBlur();
      expect(engine.stealthModules.tabAwareness.isPaused).toBe(true);

      // Test tab focus handling
      await engine.stealthModules.tabAwareness.handleTabFocus();
      expect(engine.stealthModules.tabAwareness.isPaused).toBe(false);
    });

    test('should coordinate tab awareness with other modules', async () => {
      const config = {
        stealth: {
          enabled: true,
          tabAwareness: { enabled: true },
          cursorSimulator: { enabled: true },
          noiseEvents: { enabled: true }
        }
      };

      await engine.start(config);

      // Test tab blur coordination
      await engine.stealthModules.tabAwareness.handleTabBlur();
      expect(engine.stealthModules.tabAwareness.isPaused).toBe(true);
      expect(engine.stealthModules.cursorSimulator.isPaused).toBe(true);
      expect(engine.stealthModules.noiseEvents.isPaused).toBe(true);

      // Test tab focus coordination
      await engine.stealthModules.tabAwareness.handleTabFocus();
      expect(engine.stealthModules.tabAwareness.isPaused).toBe(false);
      expect(engine.stealthModules.cursorSimulator.isPaused).toBe(false);
      expect(engine.stealthModules.noiseEvents.isPaused).toBe(false);
    });
  });

  describe('Noise Events and Background Activity', () => {
    test('should generate realistic background noise', async () => {
      const config = {
        stealth: {
          enabled: true,
          noiseEvents: { enabled: true }
        }
      };

      await engine.start(config);

      // Test mouse move events
      const mouseEvents = await engine.stealthModules.noiseEvents.generateMouseMoveEvents(5);
      expect(mouseEvents).toHaveLength(5);
      mouseEvents.forEach(event => {
        expect(event.type).toBe('mousemove');
        expect(event).toHaveProperty('clientX');
        expect(event).toHaveProperty('clientY');
      });

      // Test touch events
      const touchEvents = await engine.stealthModules.noiseEvents.generateTouchEvents(3);
      expect(touchEvents).toHaveLength(3);
      touchEvents.forEach(event => {
        expect(['touchstart', 'touchmove', 'touchend']).toContain(event.type);
      });

      // Test keyboard events
      const keyboardEvents = await engine.stealthModules.noiseEvents.generateKeyboardEvents(2);
      expect(keyboardEvents).toHaveLength(2);
      keyboardEvents.forEach(event => {
        expect(['keydown', 'keyup']).toContain(event.type);
        expect(event).toHaveProperty('key');
      });

      // Test scroll noise
      const scrollEvents = await engine.stealthModules.noiseEvents.generateScrollNoise(3);
      expect(scrollEvents).toHaveLength(3);
      scrollEvents.forEach(event => {
        expect(event.type).toBe('scroll');
        expect(event).toHaveProperty('deltaX');
        expect(event).toHaveProperty('deltaY');
      });
    });

    test('should vary noise event patterns', async () => {
      const config = {
        stealth: {
          enabled: true,
          noiseEvents: { enabled: true }
        }
      };

      await engine.start(config);

      // Test multiple noise event variations
      const noisePatterns = [];
      for (let i = 0; i < 3; i++) {
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
      const uniquePatterns = new Set(noisePatterns.map(p => JSON.stringify(p)));
      expect(uniquePatterns.size).toBeGreaterThan(1);
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

  describe('Stealth Detection Risk Assessment', () => {
    test('should assess detection risk levels', async () => {
      const config = {
        stealth: {
          enabled: true,
          cursorSimulator: { enabled: true },
          noiseEvents: { enabled: true },
          errorSimulator: { enabled: true }
        }
      };

      await engine.start(config);

      // Test detection risk assessment
      const riskLevel = await engine.assessDetectionRisk();
      expect(typeof riskLevel).toBe('number');
      expect(riskLevel).toBeGreaterThanOrEqual(0);
      expect(riskLevel).toBeLessThanOrEqual(100);

      // Test risk factors
      const riskFactors = await engine.getRiskFactors();
      expect(Array.isArray(riskFactors)).toBe(true);
      riskFactors.forEach(factor => {
        expect(factor).toHaveProperty('name');
        expect(factor).toHaveProperty('risk');
        expect(factor).toHaveProperty('description');
      });
    });

    test('should provide stealth recommendations', async () => {
      const config = {
        stealth: {
          enabled: true,
          cursorSimulator: { enabled: true },
          noiseEvents: { enabled: true }
        }
      };

      await engine.start(config);

      // Test stealth recommendations
      const recommendations = await engine.getStealthRecommendations();
      expect(Array.isArray(recommendations)).toBe(true);
      recommendations.forEach(rec => {
        expect(rec).toHaveProperty('type');
        expect(rec).toHaveProperty('priority');
        expect(rec).toHaveProperty('description');
        expect(rec).toHaveProperty('action');
      });
    });
  });
});
