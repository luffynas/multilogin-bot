/**
 * Tests for core engine functionality
 */

import { AutoscrollEngine, ENGINE_STATES, ENGINE_EVENTS } from '../src/core/engine.js';

describe('AutoscrollEngine', () => {
  let engine;

  beforeEach(() => {
    engine = new AutoscrollEngine();
  });

  afterEach(() => {
    if (engine.isEngineRunning()) {
      engine.stop();
    }
  });

  describe('Initialization', () => {
    test('should initialize with stopped state', () => {
      expect(engine.getState()).toBe(ENGINE_STATES.STOPPED);
      expect(engine.isEngineRunning()).toBe(false);
    });

    test('should have empty stats initially', () => {
      const stats = engine.getStats();
      expect(stats.totalSteps).toBe(0);
      expect(stats.totalDistance).toBe(0);
      expect(stats.errors).toBe(0);
    });
  });

  describe('Start/Stop', () => {
    test('should start engine successfully', async () => {
      const config = {
        strategy: 'linear',
        minStep: 50,
        maxStep: 200
      };

      const result = await engine.start(config);
      expect(result).toBe(true);
      expect(engine.getState()).toBe(ENGINE_STATES.RUNNING);
      expect(engine.isEngineRunning()).toBe(true);
    });

    test('should stop engine successfully', async () => {
      await engine.start({});
      const result = await engine.stop();
      
      expect(result).toBe(true);
      expect(engine.getState()).toBe(ENGINE_STATES.STOPPED);
      expect(engine.isEngineRunning()).toBe(false);
    });

    test('should not start if already running', async () => {
      await engine.start({});
      const result = await engine.start({});
      
      expect(result).toBe(false);
    });

    test('should not stop if not running', async () => {
      const result = await engine.stop();
      expect(result).toBe(false);
    });
  });

  describe('Pause/Resume', () => {
    test('should pause engine successfully', async () => {
      await engine.start({});
      const result = await engine.pause();
      
      expect(result).toBe(true);
      expect(engine.getState()).toBe(ENGINE_STATES.PAUSED);
    });

    test('should resume engine successfully', async () => {
      await engine.start({});
      await engine.pause();
      const result = await engine.resume();
      
      expect(result).toBe(true);
      expect(engine.getState()).toBe(ENGINE_STATES.RUNNING);
    });

    test('should not pause if not running', async () => {
      const result = await engine.pause();
      expect(result).toBe(false);
    });

    test('should not resume if not paused', async () => {
      await engine.start({});
      const result = await engine.resume();
      expect(result).toBe(false);
    });
  });

  describe('Strategy Management', () => {
    test('should set strategy successfully', async () => {
      const result = await engine.setStrategy('linear');
      expect(result).toBe(true);
    });

    test('should handle invalid strategy', async () => {
      const result = await engine.setStrategy('invalid');
      expect(result).toBe(false);
    });
  });

  describe('Adapter Management', () => {
    test('should set adapter successfully', async () => {
      const result = await engine.setAdapter('desktop');
      expect(result).toBe(true);
    });

    test('should handle invalid adapter', async () => {
      const result = await engine.setAdapter('invalid');
      expect(result).toBe(false);
    });
  });

  describe('Event System', () => {
    test('should emit start event', async () => {
      const startHandler = jest.fn();
      engine.on(ENGINE_EVENTS.START, startHandler);
      
      await engine.start({});
      expect(startHandler).toHaveBeenCalled();
    });

    test('should emit stop event', async () => {
      const stopHandler = jest.fn();
      engine.on(ENGINE_EVENTS.STOP, stopHandler);
      
      await engine.start({});
      await engine.stop();
      expect(stopHandler).toHaveBeenCalled();
    });

    test('should emit state change event', async () => {
      const stateChangeHandler = jest.fn();
      engine.on(ENGINE_EVENTS.STATE_CHANGE, stateChangeHandler);
      
      await engine.start({});
      expect(stateChangeHandler).toHaveBeenCalledWith(ENGINE_STATES.RUNNING);
    });

    test('should remove event listener', async () => {
      const handler = jest.fn();
      engine.on(ENGINE_EVENTS.START, handler);
      engine.off(ENGINE_EVENTS.START, handler);
      
      await engine.start({});
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('Statistics', () => {
    test('should update stats on start', async () => {
      await engine.start({});
      const stats = engine.getStats();
      
      expect(stats.startTime).toBeTruthy();
      expect(stats.isRunning).toBe(true);
    });

    test('should update stats on stop', async () => {
      await engine.start({});
      await engine.stop();
      const stats = engine.getStats();
      
      expect(stats.endTime).toBeTruthy();
      expect(stats.isRunning).toBe(false);
    });

    test('should reset stats', () => {
      engine.resetStats();
      const stats = engine.getStats();
      
      expect(stats.totalSteps).toBe(0);
      expect(stats.totalDistance).toBe(0);
      expect(stats.errors).toBe(0);
    });
  });

  describe('Configuration', () => {
    test('should merge configuration with profile', async () => {
      const config = {
        strategy: 'linear',
        minStep: 100
      };

      await engine.start(config);
      expect(engine.config).toMatchObject(config);
    });
  });
});
