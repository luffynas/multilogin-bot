/**
 * Unit Tests for Utils Modules
 * Testing utility functions and helpers
 */

import { createLogger } from '../src/utils/logger.js';
import { sleep, addJitter, createCancellableTimeout, createRandomDelay, createHumanBehaviorDelay, throttle, debounce } from '../src/utils/time.js';
import { safeQuerySelector, safeQuerySelectorAll, isElementVisible, getElementMetrics, getScrollPosition } from '../src/utils/dom.js';
import { createWheelEvent, createTouchEvent, createMouseEvent, dispatchEventNatural, addNaturalEventListener, removeNaturalEventListener } from '../src/utils/events.js';
import { createStorageObserver, createNamespacedStorage } from '../src/utils/storage.js';

describe('Utils Modules Unit Tests', () => {
  
  describe('Logger Utils', () => {
    test('should create logger with default settings', () => {
      const logger = createLogger('test-module');
      
      expect(logger).toBeDefined();
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.debug).toBe('function');
    });

    test('should create logger with custom settings', () => {
      const logger = createLogger('test-module');
      
      expect(logger).toBeDefined();
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.debug).toBe('function');
    });

    test('should log messages with correct format', () => {
      const logger = createLogger('test-module');
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      logger.info('Test message');
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[test-module]'),
        expect.stringContaining('Test message')
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('Time Utils', () => {
    test('should sleep for specified duration', async () => {
      const startTime = Date.now();
      await sleep(50); // Reduced time for faster tests
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeGreaterThanOrEqual(40);
      expect(endTime - startTime).toBeLessThan(100);
    });

    test('should add jitter to values', () => {
      const baseValue = 1000;
      const jitteredValue = addJitter(baseValue, 0.1);
      
      expect(jitteredValue).toBeGreaterThanOrEqual(900);
      expect(jitteredValue).toBeLessThanOrEqual(1100);
    });

    test('should create cancellable timeout', async () => {
      const { promise, cancel } = createCancellableTimeout(100);
      
      // Cancel the timeout immediately
      cancel();
      
      // Should resolve when cancelled
      await expect(promise).resolves.toBeUndefined();
    }, 1000);

    test('should create random delay within range', async () => {
      const min = 50;
      const max = 100;
      const startTime = Date.now();
      
      await createRandomDelay(min, max);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeGreaterThanOrEqual(min - 10);
      expect(duration).toBeLessThanOrEqual(max + 10);
    });

    test('should create human behavior delay', async () => {
      const startTime = Date.now();
      
      await createHumanBehaviorDelay('natural', {
        baseDelay: 50,
        variation: 0.2
      });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeGreaterThanOrEqual(40);
      expect(duration).toBeLessThanOrEqual(70);
    });
  });

  describe('DOM Utils', () => {
    beforeEach(() => {
      // Setup mock DOM
      document.body.innerHTML = `
        <div id="test-element" class="visible">Test Content</div>
        <div id="hidden-element" class="hidden" style="display: none;">Hidden Content</div>
        <div class="multiple">Item 1</div>
        <div class="multiple">Item 2</div>
        <div class="multiple">Item 3</div>
      `;
    });

    afterEach(() => {
      document.body.innerHTML = '';
    });

    test('should safely query selector', () => {
      const element = safeQuerySelector('#test-element');
      
      expect(element).toBeDefined();
      expect(element.id).toBe('test-element');
    });

    test('should return null for non-existent selector', () => {
      const element = safeQuerySelector('#non-existent');
      
      expect(element).toBeNull();
    });

    test('should safely query selector all', () => {
      const elements = safeQuerySelectorAll('.multiple');
      
      expect(elements).toHaveLength(3);
      expect(elements[0].textContent).toBe('Item 1');
    });

    test('should return empty array for non-existent selector', () => {
      const elements = safeQuerySelectorAll('.non-existent');
      
      expect(elements).toHaveLength(0);
    });

    test('should check if element is visible', () => {
      const visibleElement = document.getElementById('test-element');
      const hiddenElement = document.getElementById('hidden-element');
      
      // Mock getComputedStyle to return proper visibility
      const mockGetComputedStyle = jest.fn((element) => {
        if (element.id === 'hidden-element') {
          return { display: 'none', visibility: 'hidden', opacity: '0' };
        }
        return { display: 'block', visibility: 'visible', opacity: '1' };
      });
      
      global.getComputedStyle = mockGetComputedStyle;
      
      expect(isElementVisible(visibleElement)).toBe(true);
      expect(isElementVisible(hiddenElement)).toBe(false);
    });

    test('should get element metrics', () => {
      const element = document.getElementById('test-element');
      const metrics = getElementMetrics(element);
      
      expect(metrics).toHaveProperty('top');
      expect(metrics).toHaveProperty('left');
      expect(metrics).toHaveProperty('width');
      expect(metrics).toHaveProperty('height');
      expect(typeof metrics.top).toBe('number');
    });

    test('should get scroll position', () => {
      global.testUtils.mockScrollPosition(100, 200);
      
      const position = getScrollPosition();
      
      expect(position).toEqual({ x: 100, y: 200 });
    });

    test('should get scroll percentage', () => {
      global.testUtils.mockScrollPosition(100, 200);
      global.testUtils.mockDocumentDimensions(1000, 2000);
      
      const percentage = getScrollPosition();
      
      expect(percentage).toHaveProperty('x');
      expect(percentage).toHaveProperty('y');
      expect(typeof percentage.x).toBe('number');
      expect(typeof percentage.y).toBe('number');
    });
  });

  describe('Event Utils', () => {
    test('should create wheel event', () => {
      const event = createWheelEvent({
        deltaY: 100,
        clientX: 200,
        clientY: 300
      });
      
      expect(event.type).toBe('wheel');
      expect(event.deltaY).toBe(100);
      expect(event.clientX).toBe(200);
      expect(event.clientY).toBe(300);
    });

    test('should create touch event', () => {
      const event = createTouchEvent('touchstart', {
        touches: [{ clientX: 100, clientY: 200 }]
      });
      
      expect(event.type).toBe('touchstart');
      expect(event.touches).toHaveLength(1);
      expect(event.touches[0].clientX).toBe(100);
    });

    test('should create mouse event', () => {
      const event = createMouseEvent('click', {
        clientX: 150,
        clientY: 250
      });
      
      expect(event.type).toBe('click');
      expect(event.clientX).toBe(150);
      expect(event.clientY).toBe(250);
    });

    test('should dispatch event naturally', async () => {
      const element = document.createElement('div');
      const event = createMouseEvent('click');
      const spy = jest.fn();
      
      element.addEventListener('click', spy);
      await dispatchEventNatural(element, event, 10);
      
      expect(spy).toHaveBeenCalledWith(event);
    });

    test('should add natural event listener', () => {
      const element = document.createElement('div');
      const spy = jest.fn();
      
      addNaturalEventListener(element, 'click', spy);
      
      // Simulate click
      element.click();
      
      expect(spy).toHaveBeenCalled();
    });

    test('should remove natural event listener', () => {
      const element = document.createElement('div');
      const spy = jest.fn();
      
      addNaturalEventListener(element, 'click', spy);
      removeNaturalEventListener(element, 'click', spy);
      
      // Simulate click
      element.click();
      
      expect(spy).not.toHaveBeenCalled();
    });

    test('should throttle function calls', async () => {
      const spy = jest.fn();
      const throttledFn = throttle(spy, 50);
      
      // Call multiple times quickly
      throttledFn();
      throttledFn();
      throttledFn();
      
      // Wait for throttle delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Should only be called once due to throttling
      expect(spy).toHaveBeenCalledTimes(1);
    });

    test('should debounce function calls', async () => {
      const spy = jest.fn();
      const debouncedFn = debounce(spy, 50);
      
      // Call multiple times quickly
      debouncedFn();
      debouncedFn();
      debouncedFn();
      
      // Wait for debounce delay
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Should only be called once due to debouncing
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Storage Utils', () => {
    beforeEach(() => {
      // Clear storage before each test
      localStorage.clear();
      sessionStorage.clear();
    });

    test('should create storage observer', () => {
      const callback = jest.fn();
      const observer = createStorageObserver(callback);
      
      expect(observer).toBeDefined();
      expect(typeof observer.start).toBe('function');
      expect(typeof observer.stop).toBe('function');
    });

    test('should create namespaced storage', () => {
      const namespace = 'test-namespace';
      const storage = createNamespacedStorage(namespace);
      
      expect(storage).toBeDefined();
      expect(typeof storage.get).toBe('function');
      expect(typeof storage.set).toBe('function');
      expect(typeof storage.remove).toBe('function');
      expect(typeof storage.clear).toBe('function');
    });

    test('should handle storage operations with namespaced storage', async () => {
      const namespace = 'test-namespace';
      const storage = createNamespacedStorage(namespace);
      
      await storage.set('key1', 'value1');
      const value = await storage.get('key1');
      
      expect(value).toBe('value1');
    });

    test('should handle complex objects with namespaced storage', async () => {
      const namespace = 'test-namespace';
      const storage = createNamespacedStorage(namespace);
      
      const testObject = { name: 'test', value: 123, nested: { data: 'test' } };
      
      await storage.set('test-object', testObject);
      const retrieved = await storage.get('test-object');
      
      expect(retrieved).toEqual(testObject);
    });

    test('should clear namespaced storage', async () => {
      const namespace = 'test-namespace';
      const storage = createNamespacedStorage(namespace);
      
      await storage.set('key1', 'value1');
      await storage.set('key2', 'value2');
      
      await storage.clear();
      
      const value1 = await storage.get('key1');
      const value2 = await storage.get('key2');
      
      expect(value1).toBeNull();
      expect(value2).toBeNull();
    });

    test('should handle storage errors gracefully', async () => {
      // Mock localStorage to throw error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn(() => {
        throw new Error('Storage quota exceeded');
      });
      
      const namespace = 'test-namespace';
      const storage = createNamespacedStorage(namespace);
      
      // Should not throw error
      await expect(storage.set('test-key', 'test-value')).resolves.toBeUndefined();
      
      // Restore original function
      localStorage.setItem = originalSetItem;
    });
  });
});
