/**
 * Unit Tests for Core Modules
 * Testing core engine, profiles, and randomizer functionality
 */

import { AutoscrollEngine, ENGINE_STATES, ENGINE_EVENTS } from '../src/core/engine.js';
import { getProfileValue, loadProfile, validateProfile } from '../src/core/profiles.js';
import { randScrollStep, randDelay, jitter, createRandomValue, createRandomArray } from '../src/core/randomizer.js';

describe('Core Modules Unit Tests', () => {
  
  describe('AutoscrollEngine', () => {
    let engine;

    beforeEach(() => {
      engine = new AutoscrollEngine();
    });

    afterEach(async () => {
      if (engine && engine.state === 'running') {
        await engine.stop();
      }
    });

    test('should initialize with default state', () => {
      expect(engine.state).toBe(ENGINE_STATES.STOPPED);
      expect(engine.isRunning).toBe(false);
      expect(engine.isPaused).toBe(false);
      expect(engine.stats).toBeDefined();
    });

    test('should start engine successfully', async () => {
      await engine.start();
      
      expect(engine.state).toBe(ENGINE_STATES.RUNNING);
      expect(engine.isRunning).toBe(true);
    });

    test('should stop engine successfully', async () => {
      await engine.start();
      await engine.stop();
      
      expect(engine.state).toBe(ENGINE_STATES.STOPPED);
      expect(engine.isRunning).toBe(false);
    });

    test('should pause and resume engine', async () => {
      await engine.start();
      
      await engine.pause();
      expect(engine.state).toBe(ENGINE_STATES.PAUSED);
      expect(engine.isPaused).toBe(true);
      
      await engine.resume();
      expect(engine.state).toBe(ENGINE_STATES.RUNNING);
      expect(engine.isPaused).toBe(false);
    });

    test('should emit events correctly', async () => {
      const startSpy = jest.fn();
      const stopSpy = jest.fn();
      const stateChangeSpy = jest.fn();
      
      engine.on(ENGINE_EVENTS.START, startSpy);
      engine.on(ENGINE_EVENTS.STOP, stopSpy);
      engine.on(ENGINE_EVENTS.STATE_CHANGE, stateChangeSpy);
      
      await engine.start();
      await engine.stop();
      
      expect(startSpy).toHaveBeenCalled();
      expect(stopSpy).toHaveBeenCalled();
      expect(stateChangeSpy).toHaveBeenCalledWith(ENGINE_STATES.RUNNING);
      expect(stateChangeSpy).toHaveBeenCalledWith(ENGINE_STATES.STOPPED);
    });

    test('should handle configuration updates', async () => {
      const config = {
        speed: 2,
        strategy: 'linear',
        adapter: 'desktop'
      };
      
      await engine.start(config);
      
      expect(engine.config.speed).toBe(2);
      expect(engine.config.strategy).toBe('linear');
      expect(engine.config.adapter).toBe('desktop');
    });

    test('should update statistics on state changes', async () => {
      const initialStats = { ...engine.stats };
      
      await engine.start();
      
      expect(engine.stats.startTime).toBeGreaterThan(initialStats.startTime);
      expect(engine.stats.isActive).toBe(true);
      
      await engine.stop();
      
      expect(engine.stats.endTime).toBeGreaterThan(engine.stats.startTime);
      expect(engine.stats.isActive).toBe(false);
    });

    test('should handle strategy changes', async () => {
      await engine.start();
      
      const result = await engine.setStrategy('linear');
      expect(result).toBe(true);
      expect(engine.currentStrategy).toBe('linear');
    });

    test('should handle adapter changes', async () => {
      await engine.start();
      
      const result = await engine.setAdapter('desktop');
      expect(result).toBe(true);
      expect(engine.currentAdapter).toBe('desktop');
    });

    test('should handle invalid strategy gracefully', async () => {
      await engine.start();
      
      const result = await engine.setStrategy('invalid-strategy');
      expect(result).toBe(false);
    });

    test('should handle invalid adapter gracefully', async () => {
      await engine.start();
      
      const result = await engine.setAdapter('invalid-adapter');
      expect(result).toBe(false);
    });
  });

  describe('Profiles Module', () => {
    test('should get profile value with default', () => {
      const value = getProfileValue('speed', 1);
      expect(value).toBe(1);
    });

    test('should get profile value from loaded profile', () => {
      // Mock a loaded profile
      const mockProfile = { speed: 2, strategy: 'linear' };
      global.currentProfile = mockProfile;
      
      const value = getProfileValue('speed', 1);
      expect(value).toBe(2);
    });

    test('should load profile successfully', async () => {
      const profile = await loadProfile('default');
      
      expect(profile).toBeDefined();
      expect(profile.speed).toBeDefined();
      expect(profile.strategy).toBeDefined();
    });

    test('should validate profile structure', () => {
      const validProfile = {
        speed: 1,
        strategy: 'linear',
        adapter: 'desktop',
        stealth: {
          enabled: true
        }
      };
      
      const isValid = validateProfile(validProfile);
      expect(isValid).toBe(true);
    });

    test('should reject invalid profile structure', () => {
      const invalidProfile = {
        speed: 'invalid',
        strategy: null
      };
      
      const isValid = validateProfile(invalidProfile);
      expect(isValid).toBe(false);
    });

    test('should handle missing profile gracefully', async () => {
      const profile = await loadProfile('non-existent');
      
      // Should return default profile
      expect(profile).toBeDefined();
      expect(profile.speed).toBeDefined();
    });
  });

  describe('Randomizer Module', () => {
    test('should generate random scroll step', () => {
      const step = randScrollStep(100, 200);
      
      expect(step).toBeGreaterThanOrEqual(100);
      expect(step).toBeLessThanOrEqual(200);
    });

    test('should generate random delay', () => {
      const delay = randDelay(50, 150);
      
      expect(delay).toBeGreaterThanOrEqual(50);
      expect(delay).toBeLessThanOrEqual(150);
    });

    test('should add jitter to values', () => {
      const baseValue = 1000;
      const jitteredValue = jitter(baseValue, 0.1);
      
      expect(jitteredValue).toBeGreaterThanOrEqual(900);
      expect(jitteredValue).toBeLessThanOrEqual(1100);
    });

    test('should create random value within range', () => {
      const value = createRandomValue(10, 20);
      
      expect(value).toBeGreaterThanOrEqual(10);
      expect(value).toBeLessThanOrEqual(20);
    });

    test('should create random array with specified length', () => {
      const array = createRandomArray(5, 1, 10);
      
      expect(array).toHaveLength(5);
      array.forEach(value => {
        expect(value).toBeGreaterThanOrEqual(1);
        expect(value).toBeLessThanOrEqual(10);
      });
    });

    test('should generate different values on multiple calls', () => {
      const values = [];
      
      for (let i = 0; i < 10; i++) {
        values.push(randScrollStep(100, 200));
      }
      
      // Should have some variation (not all the same)
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBeGreaterThan(1);
    });

    test('should handle edge cases', () => {
      // Test with same min and max
      const sameValue = randScrollStep(100, 100);
      expect(sameValue).toBe(100);
      
      // Test with zero jitter
      const noJitter = jitter(100, 0);
      expect(noJitter).toBe(100);
    });

    test('should respect bounds', () => {
      const min = 50;
      const max = 100;
      
      for (let i = 0; i < 100; i++) {
        const value = randScrollStep(min, max);
        expect(value).toBeGreaterThanOrEqual(min);
        expect(value).toBeLessThanOrEqual(max);
      }
    });
  });

  describe('Engine Integration with Core Modules', () => {
    let engine;

    beforeEach(() => {
      engine = new AutoscrollEngine();
    });

    afterEach(async () => {
      if (engine && engine.state === 'running') {
        await engine.stop();
      }
    });

    test('should use profile values in configuration', async () => {
      const config = {
        speed: 2,
        strategy: 'linear'
      };
      
      await engine.start(config);
      
      expect(engine.config.speed).toBe(2);
      expect(engine.config.strategy).toBe('linear');
    });

    test('should handle randomizer integration', async () => {
      await engine.start();
      
      // Engine should be able to use randomizer functions
      expect(typeof randScrollStep).toBe('function');
      expect(typeof randDelay).toBe('function');
      expect(typeof jitter).toBe('function');
    });

    test('should maintain state consistency', async () => {
      await engine.start();
      
      expect(engine.state).toBe(ENGINE_STATES.RUNNING);
      expect(engine.isRunning).toBe(true);
      expect(engine.isPaused).toBe(false);
      
      await engine.pause();
      
      expect(engine.state).toBe(ENGINE_STATES.PAUSED);
      expect(engine.isRunning).toBe(true);
      expect(engine.isPaused).toBe(true);
    });

    test('should handle multiple state transitions', async () => {
      await engine.start();
      await engine.pause();
      await engine.resume();
      await engine.pause();
      await engine.resume();
      await engine.stop();
      
      expect(engine.state).toBe(ENGINE_STATES.STOPPED);
      expect(engine.isRunning).toBe(false);
      expect(engine.isPaused).toBe(false);
    });
  });
});
