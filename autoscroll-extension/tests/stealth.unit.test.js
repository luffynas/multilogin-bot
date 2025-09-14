/**
 * Unit Tests for Stealth Modules
 * Testing anti-detection and stealth capabilities
 */

import { CursorSimulator } from '../src/stealth/cursorSimulator.js';
import { GestureSimulator } from '../src/stealth/gestureSimulator.js';
import { NoiseEventsGenerator } from '../src/stealth/noiseEvents.js';
import { TabAwarenessManager } from '../src/stealth/tabAwareness.js';
import { CanvasNoise } from '../src/stealth/canvasNoise.js';
import { HoverSimulator } from '../src/stealth/hoverSimulator.js';
import { DwellTimeSimulator } from '../src/stealth/dwellTimeSimulator.js';
import { ErrorSimulator } from '../src/stealth/errorSimulator.js';
import { FingerprintVariation } from '../src/stealth/fingerprintVariation.js';

describe('Stealth Modules Unit Tests', () => {
  
  describe('CursorSimulator', () => {
    let cursorSimulator;

    beforeEach(() => {
      cursorSimulator = new CursorSimulator();
    });

    afterEach(async () => {
      if (cursorSimulator && cursorSimulator.isActive) {
        await cursorSimulator.stop();
      }
    });

    test('should initialize with default settings', () => {
      expect(cursorSimulator).toBeDefined();
      expect(cursorSimulator.isActive).toBe(false);
    });

    test('should start cursor simulation', async () => {
      await cursorSimulator.initialize({
        enabled: true,
        movementTypes: ['natural'],
        currentType: 'natural'
      });
      
      expect(cursorSimulator.isActive).toBe(true);
    });

    test('should stop cursor simulation', async () => {
      await cursorSimulator.initialize({ enabled: true });
      await cursorSimulator.stop();
      
      expect(cursorSimulator.isActive).toBe(false);
    });

    test('should simulate natural cursor movement', async () => {
      await cursorSimulator.initialize({
        enabled: true,
        movementTypes: ['natural'],
        currentType: 'natural'
      });
      
      const movement = await cursorSimulator.simulateMovement(100, 200);
      
      expect(movement).toHaveProperty('x');
      expect(movement).toHaveProperty('y');
      expect(typeof movement.x).toBe('number');
      expect(typeof movement.y).toBe('number');
    });

    test('should handle different movement types', async () => {
      await cursorSimulator.initialize({
        enabled: true,
        movementTypes: ['natural', 'linear', 'curved'],
        currentType: 'linear'
      });
      
      const movement = await cursorSimulator.simulateMovement(0, 0);
      
      expect(movement).toBeDefined();
      expect(movement).toHaveProperty('x');
      expect(movement).toHaveProperty('y');
    });

    test('should pause and resume simulation', async () => {
      await cursorSimulator.initialize({ enabled: true });
      
      await cursorSimulator.pause();
      expect(cursorSimulator.isPaused).toBe(true);
      
      await cursorSimulator.resume();
      expect(cursorSimulator.isPaused).toBe(false);
    });
  });

  describe('GestureSimulator', () => {
    let gestureSimulator;

    beforeEach(() => {
      gestureSimulator = new GestureSimulator();
    });

    afterEach(async () => {
      if (gestureSimulator && gestureSimulator.isActive) {
        await gestureSimulator.stop();
      }
    });

    test('should initialize with default settings', () => {
      expect(gestureSimulator).toBeDefined();
      expect(gestureSimulator.isActive).toBe(false);
    });

    test('should simulate swipe gesture', async () => {
      await gestureSimulator.initialize({ enabled: true });
      
      const swipe = await gestureSimulator.simulateSwipe(100, 200, 300, 400);
      
      expect(swipe).toHaveProperty('startX');
      expect(swipe).toHaveProperty('startY');
      expect(swipe).toHaveProperty('endX');
      expect(swipe).toHaveProperty('endY');
      expect(swipe.startX).toBe(100);
      expect(swipe.startY).toBe(200);
      expect(swipe.endX).toBe(300);
      expect(swipe.endY).toBe(400);
    });

    test('should simulate tap gesture', async () => {
      await gestureSimulator.initialize({ enabled: true });
      
      const tap = await gestureSimulator.simulateTap(150, 250);
      
      expect(tap).toHaveProperty('x');
      expect(tap).toHaveProperty('y');
      expect(tap.x).toBe(150);
      expect(tap.y).toBe(250);
    });

    test('should simulate pinch gesture', async () => {
      await gestureSimulator.initialize({ enabled: true });
      
      const pinch = await gestureSimulator.simulatePinch(100, 200, 1.5);
      
      expect(pinch).toHaveProperty('centerX');
      expect(pinch).toHaveProperty('centerY');
      expect(pinch).toHaveProperty('scale');
      expect(pinch.centerX).toBe(100);
      expect(pinch.centerY).toBe(200);
      expect(pinch.scale).toBe(1.5);
    });
  });

  describe('NoiseEventsGenerator', () => {
    let noiseGenerator;

    beforeEach(() => {
      noiseGenerator = new NoiseEventsGenerator();
    });

    afterEach(async () => {
      if (noiseGenerator && noiseGenerator.isActive) {
        await noiseGenerator.stop();
      }
    });

    test('should initialize with default settings', () => {
      expect(noiseGenerator).toBeDefined();
      expect(noiseGenerator.isActive).toBe(false);
    });

    test('should generate mouse move events', async () => {
      await noiseGenerator.initialize({ enabled: true });
      
      const events = await noiseGenerator.generateMouseMoveEvents(5);
      
      expect(events).toHaveLength(5);
      events.forEach(event => {
        expect(event.type).toBe('mousemove');
        expect(event).toHaveProperty('clientX');
        expect(event).toHaveProperty('clientY');
      });
    });

    test('should generate touch events', async () => {
      await noiseGenerator.initialize({ enabled: true });
      
      const events = await noiseGenerator.generateTouchEvents(3);
      
      expect(events).toHaveLength(3);
      events.forEach(event => {
        expect(['touchstart', 'touchmove', 'touchend']).toContain(event.type);
      });
    });

    test('should generate keyboard events', async () => {
      await noiseGenerator.initialize({ enabled: true });
      
      const events = await noiseGenerator.generateKeyboardEvents(2);
      
      expect(events).toHaveLength(2);
      events.forEach(event => {
        expect(['keydown', 'keyup']).toContain(event.type);
        expect(event).toHaveProperty('key');
      });
    });

    test('should generate scroll noise', async () => {
      await noiseGenerator.initialize({ enabled: true });
      
      const events = await noiseGenerator.generateScrollNoise(3);
      
      expect(events).toHaveLength(3);
      events.forEach(event => {
        expect(event.type).toBe('scroll');
        expect(event).toHaveProperty('deltaX');
        expect(event).toHaveProperty('deltaY');
      });
    });
  });

  describe('TabAwarenessManager', () => {
    let tabAwareness;

    beforeEach(() => {
      tabAwareness = new TabAwarenessManager();
    });

    afterEach(async () => {
      if (tabAwareness && tabAwareness.isActive) {
        await tabAwareness.stop();
      }
    });

    test('should initialize with default settings', () => {
      expect(tabAwareness).toBeDefined();
      expect(tabAwareness.isActive).toBe(false);
    });

    test('should detect tab visibility changes', async () => {
      await tabAwareness.initialize({ enabled: true });
      
      // Simulate tab becoming hidden
      Object.defineProperty(document, 'hidden', { value: true, writable: true });
      Object.defineProperty(document, 'visibilityState', { value: 'hidden', writable: true });
      
      const isHidden = tabAwareness.isTabHidden();
      expect(isHidden).toBe(true);
    });

    test('should pause on tab blur', async () => {
      await tabAwareness.initialize({ enabled: true });
      
      const result = await tabAwareness.handleTabBlur();
      
      expect(result).toBe(true);
      expect(tabAwareness.isPaused).toBe(true);
    });

    test('should resume on tab focus', async () => {
      await tabAwareness.initialize({ enabled: true });
      await tabAwareness.handleTabBlur();
      
      const result = await tabAwareness.handleTabFocus();
      
      expect(result).toBe(true);
      expect(tabAwareness.isPaused).toBe(false);
    });

    test('should simulate focus/blur events', async () => {
      await tabAwareness.initialize({ enabled: true });
      
      const focusEvent = await tabAwareness.simulateFocusEvent();
      const blurEvent = await tabAwareness.simulateBlurEvent();
      
      expect(focusEvent.type).toBe('focus');
      expect(blurEvent.type).toBe('blur');
    });
  });

  describe('CanvasNoise', () => {
    let canvasNoise;

    beforeEach(() => {
      canvasNoise = new CanvasNoise();
    });

    afterEach(async () => {
      if (canvasNoise && canvasNoise.isActive) {
        await canvasNoise.stop();
      }
    });

    test('should initialize with default settings', () => {
      expect(canvasNoise).toBeDefined();
      expect(canvasNoise.isActive).toBe(false);
    });

    test('should add noise to canvas', async () => {
      await canvasNoise.initialize({ enabled: true });
      
      // Create a mock canvas
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      
      const result = await canvasNoise.addNoise(canvas);
      
      expect(result).toBe(true);
    });

    test('should generate random canvas data', async () => {
      await canvasNoise.initialize({ enabled: true });
      
      const data = await canvasNoise.generateRandomData(100, 100);
      
      expect(data).toBeDefined();
      expect(data).toHaveProperty('width');
      expect(data).toHaveProperty('height');
      expect(data.width).toBe(100);
      expect(data.height).toBe(100);
    });

    test('should modify canvas fingerprint', async () => {
      await canvasNoise.initialize({ enabled: true });
      
      const canvas = document.createElement('canvas');
      const originalFingerprint = canvas.toDataURL();
      
      await canvasNoise.modifyFingerprint(canvas);
      
      const modifiedFingerprint = canvas.toDataURL();
      expect(modifiedFingerprint).not.toBe(originalFingerprint);
    });
  });

  describe('HoverSimulator', () => {
    let hoverSimulator;

    beforeEach(() => {
      hoverSimulator = new HoverSimulator();
    });

    afterEach(async () => {
      if (hoverSimulator && hoverSimulator.isActive) {
        await hoverSimulator.stop();
      }
    });

    test('should initialize with default settings', () => {
      expect(hoverSimulator).toBeDefined();
      expect(hoverSimulator.isActive).toBe(false);
    });

    test('should simulate hover delay', async () => {
      await hoverSimulator.initialize({ enabled: true });
      
      const element = document.createElement('div');
      const startTime = Date.now();
      
      await hoverSimulator.simulateHoverDelay(element, 100);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeGreaterThanOrEqual(90);
      expect(duration).toBeLessThanOrEqual(150);
    });

    test('should simulate multi-hover before click', async () => {
      await hoverSimulator.initialize({ enabled: true });
      
      const element = document.createElement('div');
      const result = await hoverSimulator.simulateMultiHover(element, 3);
      
      expect(result).toBe(true);
    });

    test('should simulate natural hover pattern', async () => {
      await hoverSimulator.initialize({ enabled: true });
      
      const element = document.createElement('div');
      const pattern = await hoverSimulator.simulateNaturalHover(element);
      
      expect(pattern).toBeDefined();
      expect(pattern).toHaveProperty('duration');
      expect(pattern).toHaveProperty('movements');
    });
  });

  describe('DwellTimeSimulator', () => {
    let dwellTimeSimulator;

    beforeEach(() => {
      dwellTimeSimulator = new DwellTimeSimulator();
    });

    afterEach(async () => {
      if (dwellTimeSimulator && dwellTimeSimulator.isActive) {
        await dwellTimeSimulator.stop();
      }
    });

    test('should initialize with default settings', () => {
      expect(dwellTimeSimulator).toBeDefined();
      expect(dwellTimeSimulator.isActive).toBe(false);
    });

    test('should calculate reading time based on content', async () => {
      await dwellTimeSimulator.initialize({ enabled: true });
      
      const content = 'This is a test content with some words to read.';
      const readingTime = await dwellTimeSimulator.calculateReadingTime(content);
      
      expect(readingTime).toBeGreaterThan(0);
      expect(typeof readingTime).toBe('number');
    });

    test('should simulate dwell time for page', async () => {
      await dwellTimeSimulator.initialize({ enabled: true });
      
      const dwellTime = await dwellTimeSimulator.simulatePageDwellTime();
      
      expect(dwellTime).toBeGreaterThan(0);
      expect(typeof dwellTime).toBe('number');
    });

    test('should simulate content-aware idle time', async () => {
      await dwellTimeSimulator.initialize({ enabled: true });
      
      const idleTime = await dwellTimeSimulator.simulateContentAwareIdle();
      
      expect(idleTime).toBeGreaterThan(0);
      expect(typeof idleTime).toBe('number');
    });
  });

  describe('ErrorSimulator', () => {
    let errorSimulator;

    beforeEach(() => {
      errorSimulator = new ErrorSimulator();
    });

    afterEach(async () => {
      if (errorSimulator && errorSimulator.isActive) {
        await errorSimulator.stop();
      }
    });

    test('should initialize with default settings', () => {
      expect(errorSimulator).toBeDefined();
      expect(errorSimulator.isActive).toBe(false);
    });

    test('should simulate wrong click', async () => {
      await errorSimulator.initialize({ enabled: true });
      
      const element = document.createElement('div');
      const result = await errorSimulator.simulateWrongClick(element);
      
      expect(result).toBe(true);
    });

    test('should simulate scroll up after down', async () => {
      await errorSimulator.initialize({ enabled: true });
      
      const result = await errorSimulator.simulateScrollUpAfterDown();
      
      expect(result).toBe(true);
    });

    test('should simulate random pause', async () => {
      await errorSimulator.initialize({ enabled: true });
      
      const startTime = Date.now();
      await errorSimulator.simulateRandomPause();
      const endTime = Date.now();
      
      const duration = endTime - startTime;
      expect(duration).toBeGreaterThan(0);
    });

    test('should simulate hesitation', async () => {
      await errorSimulator.initialize({ enabled: true });
      
      const hesitation = await errorSimulator.simulateHesitation();
      
      expect(hesitation).toBeDefined();
      expect(hesitation).toHaveProperty('duration');
      expect(hesitation.duration).toBeGreaterThan(0);
    });
  });

  describe('FingerprintVariation', () => {
    let fingerprintVariation;

    beforeEach(() => {
      fingerprintVariation = new FingerprintVariation();
    });

    afterEach(async () => {
      if (fingerprintVariation && fingerprintVariation.isActive) {
        await fingerprintVariation.stop();
      }
    });

    test('should initialize with default settings', () => {
      expect(fingerprintVariation).toBeDefined();
      expect(fingerprintVariation.isActive).toBe(false);
    });

    test('should vary user agent', async () => {
      await fingerprintVariation.initialize({ enabled: true });
      
      const userAgent = await fingerprintVariation.varyUserAgent();
      
      expect(userAgent).toBeDefined();
      expect(typeof userAgent).toBe('string');
      expect(userAgent.length).toBeGreaterThan(0);
    });

    test('should vary timezone', async () => {
      await fingerprintVariation.initialize({ enabled: true });
      
      const timezone = await fingerprintVariation.varyTimezone();
      
      expect(timezone).toBeDefined();
      expect(typeof timezone).toBe('string');
    });

    test('should vary language', async () => {
      await fingerprintVariation.initialize({ enabled: true });
      
      const language = await fingerprintVariation.varyLanguage();
      
      expect(language).toBeDefined();
      expect(typeof language).toBe('string');
    });

    test('should vary screen resolution', async () => {
      await fingerprintVariation.initialize({ enabled: true });
      
      const resolution = await fingerprintVariation.varyScreenResolution();
      
      expect(resolution).toBeDefined();
      expect(resolution).toHaveProperty('width');
      expect(resolution).toHaveProperty('height');
      expect(typeof resolution.width).toBe('number');
      expect(typeof resolution.height).toBe('number');
    });

    test('should generate session fingerprint', async () => {
      await fingerprintVariation.initialize({ enabled: true });
      
      const fingerprint = await fingerprintVariation.generateSessionFingerprint();
      
      expect(fingerprint).toBeDefined();
      expect(fingerprint).toHaveProperty('userAgent');
      expect(fingerprint).toHaveProperty('timezone');
      expect(fingerprint).toHaveProperty('language');
      expect(fingerprint).toHaveProperty('screen');
    });
  });
});
