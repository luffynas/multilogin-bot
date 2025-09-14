/**
 * Stealth Integration Tests
 * Testing anti-detection capabilities and stealth module interactions
 */

import { AutoscrollEngine } from '../src/core/engine.js';
import { createLogger } from '../src/utils/logger.js';
import { sleep, createRandomDelay } from '../src/utils/time.js';
import { safeQuerySelector, isElementVisible } from '../src/utils/dom.js';
import { createWheelEvent, createMouseEvent, dispatchEventNatural } from '../src/utils/events.js';

describe('Stealth Integration Tests', () => {
  let engine;
  let logger;

  beforeEach(() => {
    engine = new AutoscrollEngine();
    logger = createLogger('stealth-integration-test');
    
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

  describe('Anti-Detection Capabilities', () => {
    test('should maintain human-like behavior patterns', async () => {
      const config = {
        stealth: {
          enabled: true,
          cursorSimulator: { enabled: true },
          noiseEvents: { enabled: true },
          errorSimulator: { enabled: true }
        }
      };

      await engine.start(config);

      // Test cursor movement patterns
      const movements = [];
      for (let i = 0; i < 5; i++) {
        const movement = await engine.stealthModules.cursorSimulator.simulateMovement(100, 200);
        movements.push(movement);
        await sleep(50);
      }

      // Verify movements have variation (not identical)
      const uniqueMovements = new Set(movements.map(m => `${m.x},${m.y}`));
      expect(uniqueMovements.size).toBeGreaterThan(1);

      // Test noise events
      const noiseEvents = await engine.stealthModules.noiseEvents.generateMouseMoveEvents(3);
      expect(noiseEvents).toHaveLength(3);

      // Test error simulation
      await engine.stealthModules.errorSimulator.simulateRandomPause();
      expect(engine.stealthModules.errorSimulator.isActive).toBe(true);
    });

    test('should coordinate multiple stealth modules for realistic behavior', async () => {
      const config = {
        stealth: {
          enabled: true,
          cursorSimulator: { enabled: true },
          gestureSimulator: { enabled: true },
          noiseEvents: { enabled: true },
          hoverSimulator: { enabled: true },
          dwellTimeSimulator: { enabled: true }
        }
      };

      await engine.start(config);

      // Coordinate cursor and gesture simulation
      const movement = await engine.stealthModules.cursorSimulator.simulateMovement(100, 200);
      const gesture = await engine.stealthModules.gestureSimulator.simulateTap(100, 200);

      // Coordinate noise events
      const noiseEvents = await engine.stealthModules.noiseEvents.generateMouseMoveEvents(2);

      // Coordinate hover simulation
      const element = safeQuerySelector('#content');
      await engine.stealthModules.hoverSimulator.simulateHoverDelay(element, 100);

      // Coordinate dwell time simulation
      const dwellTime = await engine.stealthModules.dwellTimeSimulator.simulatePageDwellTime();

      // Verify all modules are working together
      expect(engine.stealthModules.cursorSimulator.isActive).toBe(true);
      expect(engine.stealthModules.gestureSimulator.isActive).toBe(true);
      expect(engine.stealthModules.noiseEvents.isActive).toBe(true);
      expect(engine.stealthModules.hoverSimulator.isActive).toBe(true);
      expect(engine.stealthModules.dwellTimeSimulator.isActive).toBe(true);
    });

    test('should handle tab awareness and focus simulation', async () => {
      const config = {
        stealth: {
          enabled: true,
          tabAwareness: { enabled: true },
          cursorSimulator: { enabled: true },
          noiseEvents: { enabled: true }
        }
      };

      await engine.start(config);

      // Simulate tab becoming hidden
      await engine.stealthModules.tabAwareness.handleTabBlur();
      expect(engine.stealthModules.tabAwareness.isPaused).toBe(true);

      // Other stealth modules should be paused
      expect(engine.stealthModules.cursorSimulator.isPaused).toBe(true);
      expect(engine.stealthModules.noiseEvents.isPaused).toBe(true);

      // Simulate tab becoming visible
      await engine.stealthModules.tabAwareness.handleTabFocus();
      expect(engine.stealthModules.tabAwareness.isPaused).toBe(false);

      // Other stealth modules should be resumed
      expect(engine.stealthModules.cursorSimulator.isPaused).toBe(false);
      expect(engine.stealthModules.noiseEvents.isPaused).toBe(false);
    });

    test('should maintain fingerprint variation', async () => {
      const config = {
        stealth: {
          enabled: true,
          fingerprintVariation: { enabled: true }
        }
      };

      await engine.start(config);

      // Generate session fingerprint
      const fingerprint = await engine.stealthModules.fingerprintVariation.generateSessionFingerprint();
      expect(fingerprint).toBeDefined();
      expect(fingerprint).toHaveProperty('userAgent');
      expect(fingerprint).toHaveProperty('timezone');
      expect(fingerprint).toHaveProperty('language');
      expect(fingerprint).toHaveProperty('screen');

      // Vary individual components
      const userAgent = await engine.stealthModules.fingerprintVariation.varyUserAgent();
      const timezone = await engine.stealthModules.fingerprintVariation.varyTimezone();
      const language = await engine.stealthModules.fingerprintVariation.varyLanguage();
      const screen = await engine.stealthModules.fingerprintVariation.varyScreenResolution();

      expect(typeof userAgent).toBe('string');
      expect(typeof timezone).toBe('string');
      expect(typeof language).toBe('string');
      expect(screen).toHaveProperty('width');
      expect(screen).toHaveProperty('height');
    });
  });

  describe('Canvas and WebGL Fingerprint Protection', () => {
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

      // Add noise to canvas
      const result = await engine.stealthModules.canvasNoise.addNoise(canvas);
      expect(result).toBe(true);

      // Generate random canvas data
      const data = await engine.stealthModules.canvasNoise.generateRandomData(100, 100);
      expect(data).toBeDefined();
      expect(data).toHaveProperty('width');
      expect(data).toHaveProperty('height');

      // Modify canvas fingerprint
      await engine.stealthModules.canvasNoise.modifyFingerprint(canvas);
      expect(engine.stealthModules.canvasNoise.isActive).toBe(true);
    });
  });

  describe('Human Error Simulation', () => {
    test('should simulate realistic human errors', async () => {
      const config = {
        stealth: {
          enabled: true,
          errorSimulator: { enabled: true }
        }
      };

      await engine.start(config);

      // Simulate wrong click
      const element = safeQuerySelector('#content');
      const wrongClick = await engine.stealthModules.errorSimulator.simulateWrongClick(element);
      expect(wrongClick).toBe(true);

      // Simulate scroll up after down
      const scrollUp = await engine.stealthModules.errorSimulator.simulateScrollUpAfterDown();
      expect(scrollUp).toBe(true);

      // Simulate random pause
      const startTime = Date.now();
      await engine.stealthModules.errorSimulator.simulateRandomPause();
      const endTime = Date.now();
      expect(endTime - startTime).toBeGreaterThan(0);

      // Simulate hesitation
      const hesitation = await engine.stealthModules.errorSimulator.simulateHesitation();
      expect(hesitation).toBeDefined();
      expect(hesitation).toHaveProperty('duration');
    });
  });

  describe('Dwell Time and Reading Behavior', () => {
    test('should simulate realistic reading patterns', async () => {
      const config = {
        stealth: {
          enabled: true,
          dwellTimeSimulator: { enabled: true }
        }
      };

      await engine.start(config);

      // Calculate reading time based on content
      const content = 'This is a test content with some words to read and understand.';
      const readingTime = await engine.stealthModules.dwellTimeSimulator.calculateReadingTime(content);
      expect(readingTime).toBeGreaterThan(0);
      expect(typeof readingTime).toBe('number');

      // Simulate page dwell time
      const pageDwellTime = await engine.stealthModules.dwellTimeSimulator.simulatePageDwellTime();
      expect(pageDwellTime).toBeGreaterThan(0);
      expect(typeof pageDwellTime).toBe('number');

      // Simulate content-aware idle time
      const idleTime = await engine.stealthModules.dwellTimeSimulator.simulateContentAwareIdle();
      expect(idleTime).toBeGreaterThan(0);
      expect(typeof idleTime).toBe('number');
    });
  });

  describe('Hover and Interaction Simulation', () => {
    test('should simulate realistic hover patterns', async () => {
      const config = {
        stealth: {
          enabled: true,
          hoverSimulator: { enabled: true }
        }
      };

      await engine.start(config);

      const element = safeQuerySelector('#content');

      // Simulate hover delay
      const startTime = Date.now();
      await engine.stealthModules.hoverSimulator.simulateHoverDelay(element, 100);
      const endTime = Date.now();
      expect(endTime - startTime).toBeGreaterThanOrEqual(90);

      // Simulate multi-hover before click
      const multiHover = await engine.stealthModules.hoverSimulator.simulateMultiHover(element, 3);
      expect(multiHover).toBe(true);

      // Simulate natural hover pattern
      const pattern = await engine.stealthModules.hoverSimulator.simulateNaturalHover(element);
      expect(pattern).toBeDefined();
      expect(pattern).toHaveProperty('duration');
      expect(pattern).toHaveProperty('movements');
    });
  });

  describe('Gesture and Touch Simulation', () => {
    test('should simulate realistic touch gestures', async () => {
      const config = {
        stealth: {
          enabled: true,
          gestureSimulator: { enabled: true }
        }
      };

      await engine.start(config);

      // Simulate swipe gesture
      const swipe = await engine.stealthModules.gestureSimulator.simulateSwipe(100, 200, 300, 400);
      expect(swipe).toHaveProperty('startX');
      expect(swipe).toHaveProperty('startY');
      expect(swipe).toHaveProperty('endX');
      expect(swipe).toHaveProperty('endY');

      // Simulate tap gesture
      const tap = await engine.stealthModules.gestureSimulator.simulateTap(150, 250);
      expect(tap).toHaveProperty('x');
      expect(tap).toHaveProperty('y');

      // Simulate pinch gesture
      const pinch = await engine.stealthModules.gestureSimulator.simulatePinch(100, 200, 1.5);
      expect(pinch).toHaveProperty('centerX');
      expect(pinch).toHaveProperty('centerY');
      expect(pinch).toHaveProperty('scale');
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

      // Generate mouse move events
      const mouseEvents = await engine.stealthModules.noiseEvents.generateMouseMoveEvents(5);
      expect(mouseEvents).toHaveLength(5);
      mouseEvents.forEach(event => {
        expect(event.type).toBe('mousemove');
        expect(event).toHaveProperty('clientX');
        expect(event).toHaveProperty('clientY');
      });

      // Generate touch events
      const touchEvents = await engine.stealthModules.noiseEvents.generateTouchEvents(3);
      expect(touchEvents).toHaveLength(3);
      touchEvents.forEach(event => {
        expect(['touchstart', 'touchmove', 'touchend']).toContain(event.type);
      });

      // Generate keyboard events
      const keyboardEvents = await engine.stealthModules.noiseEvents.generateKeyboardEvents(2);
      expect(keyboardEvents).toHaveLength(2);
      keyboardEvents.forEach(event => {
        expect(['keydown', 'keyup']).toContain(event.type);
        expect(event).toHaveProperty('key');
      });

      // Generate scroll noise
      const scrollEvents = await engine.stealthModules.noiseEvents.generateScrollNoise(3);
      expect(scrollEvents).toHaveLength(3);
      scrollEvents.forEach(event => {
        expect(event.type).toBe('scroll');
        expect(event).toHaveProperty('deltaX');
        expect(event).toHaveProperty('deltaY');
      });
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

      // Test coordination by simulating a complex interaction
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

  describe('Stealth Performance and Resource Management', () => {
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
