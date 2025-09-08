/**
 * Time utilities for delays, jitter, and timing control
 */

/**
 * Sleep for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise<void>} - Promise that resolves after delay
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Delay for specified milliseconds (alias for sleep)
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise<void>} - Promise that resolves after delay
 */
export function delay(ms) {
  return sleep(ms);
}

/**
 * Add jitter to a delay value
 * @param {number} baseDelay - Base delay in ms
 * @param {number} jitterPercent - Jitter percentage (0-1)
 * @returns {number} - Delay with jitter
 */
export function addJitter(baseDelay, jitterPercent = 0.1) {
  const jitter = baseDelay * jitterPercent;
  const randomJitter = (Math.random() - 0.5) * 2 * jitter;
  return Math.max(0, baseDelay + randomJitter);
}

/**
 * Create a cancellable timeout
 * @param {number} ms - Milliseconds to wait
 * @returns {Object} - Object with promise and cancel function
 */
export function createCancellableTimeout(ms) {
  let timeoutId;
  let isCancelled = false;
  
  const promise = new Promise((resolve, reject) => {
    timeoutId = setTimeout(() => {
      if (!isCancelled) {
        resolve();
      }
    }, ms);
  });
  
  const cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      isCancelled = true;
    }
  };
  
  return { promise, cancel };
}

/**
 * Create a cancellable interval
 * @param {Function} callback - Callback function
 * @param {number} ms - Interval in milliseconds
 * @returns {Object} - Object with cancel function
 */
export function createCancellableInterval(callback, ms) {
  let intervalId;
  let isCancelled = false;
  
  intervalId = setInterval(() => {
    if (!isCancelled) {
      callback();
    }
  }, ms);
  
  const cancel = () => {
    if (intervalId) {
      clearInterval(intervalId);
      isCancelled = true;
    }
  };
  
  return { cancel };
}

/**
 * Throttle function execution
 * @param {Function} fn - Function to throttle
 * @param {number} delay - Throttle delay in ms
 * @returns {Function} - Throttled function
 */
export function throttle(fn, delay) {
  let lastCall = 0;
  let timeoutId;
  
  return function(...args) {
    const now = Date.now();
    
    if (now - lastCall >= delay) {
      lastCall = now;
      return fn.apply(this, args);
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        fn.apply(this, args);
      }, delay - (now - lastCall));
    }
  };
}

/**
 * Debounce function execution
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Debounce delay in ms
 * @returns {Function} - Debounced function
 */
export function debounce(fn, delay) {
  let timeoutId;
  
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

/**
 * Measure execution time
 * @param {Function} fn - Function to measure
 * @returns {Promise<Object>} - Object with result and duration
 */
export async function measureTime(fn) {
  const startTime = performance.now();
  
  try {
    const result = await fn();
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    return { result, duration };
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    return { error, duration };
  }
}

/**
 * Create a rate limiter
 * @param {number} maxCalls - Maximum calls per period
 * @param {number} periodMs - Period in milliseconds
 * @returns {Function} - Rate limiter function
 */
export function createRateLimiter(maxCalls, periodMs) {
  const calls = [];
  
  return function() {
    const now = Date.now();
    
    // Remove old calls
    while (calls.length > 0 && calls[0] < now - periodMs) {
      calls.shift();
    }
    
    if (calls.length >= maxCalls) {
      return false; // Rate limited
    }
    
    calls.push(now);
    return true; // Allowed
  };
}

/**
 * Create a human-like delay pattern
 * @param {number} baseDelay - Base delay in ms
 * @param {number} variation - Variation percentage (0-1)
 * @returns {number} - Human-like delay
 */
export function createHumanDelay(baseDelay, variation = 0.3) {
  // Add some randomness to make it more human-like
  const randomFactor = 0.5 + Math.random() * 0.5; // 0.5 to 1.0
  const jitter = addJitter(baseDelay * randomFactor, variation);
  
  // Ensure minimum delay
  return Math.max(50, jitter);
}

/**
 * Create a natural pause duration
 * @param {number} minMs - Minimum pause in ms
 * @param {number} maxMs - Maximum pause in ms
 * @returns {number} - Natural pause duration
 */
export function createNaturalPause(minMs = 500, maxMs = 2000) {
  // Use exponential distribution for more natural pauses
  const lambda = 1 / ((minMs + maxMs) / 2);
  const random = Math.random();
  const pause = -Math.log(1 - random) / lambda;
  
  return Math.max(minMs, Math.min(maxMs, pause));
}

/**
 * Create a reading pause based on content length
 * @param {number} contentLength - Content length in characters
 * @param {number} readingSpeed - Reading speed in characters per minute
 * @returns {number} - Reading pause in ms
 */
export function createReadingPause(contentLength, readingSpeed = 200) {
  const readingTimeMs = (contentLength / readingSpeed) * 60 * 1000;
  const variation = addJitter(readingTimeMs, 0.2);
  
  return Math.max(1000, Math.min(30000, variation)); // 1-30 seconds
}

/**
 * Create a hesitation delay
 * @param {number} baseDelay - Base delay in ms
 * @returns {number} - Hesitation delay
 */
export function createHesitationDelay(baseDelay = 1000) {
  // Sometimes longer, sometimes shorter
  const hesitationFactor = 0.5 + Math.random() * 1.5; // 0.5 to 2.0
  return baseDelay * hesitationFactor;
}

/**
 * Create a fatigue delay (increases over time)
 * @param {number} baseDelay - Base delay in ms
 * @param {number} fatigueFactor - Fatigue factor (0-1)
 * @returns {number} - Fatigue-adjusted delay
 */
export function createFatigueDelay(baseDelay, fatigueFactor = 0.1) {
  const fatigueMultiplier = 1 + (fatigueFactor * Math.random());
  return baseDelay * fatigueMultiplier;
}

/**
 * Create a random delay within range
 * @param {number} minMs - Minimum delay in ms
 * @param {number} maxMs - Maximum delay in ms
 * @returns {number} - Random delay
 */
export function createRandomDelay(minMs, maxMs) {
  return minMs + Math.random() * (maxMs - minMs);
}

/**
 * Create a delay with exponential backoff
 * @param {number} baseDelay - Base delay in ms
 * @param {number} attempt - Attempt number (0-based)
 * @param {number} maxDelay - Maximum delay in ms
 * @returns {number} - Delay with exponential backoff
 */
export function createExponentialBackoff(baseDelay, attempt, maxDelay = 10000) {
  const delay = baseDelay * Math.pow(2, attempt);
  return Math.min(delay, maxDelay);
}

/**
 * Create a delay with linear backoff
 * @param {number} baseDelay - Base delay in ms
 * @param {number} attempt - Attempt number (0-based)
 * @param {number} maxDelay - Maximum delay in ms
 * @returns {number} - Delay with linear backoff
 */
export function createLinearBackoff(baseDelay, attempt, maxDelay = 10000) {
  const delay = baseDelay * (attempt + 1);
  return Math.min(delay, maxDelay);
}

/**
 * Create a delay with jitter and backoff
 * @param {number} baseDelay - Base delay in ms
 * @param {number} attempt - Attempt number (0-based)
 * @param {number} jitterPercent - Jitter percentage (0-1)
 * @returns {number} - Delay with jitter and backoff
 */
export function createJitteredBackoff(baseDelay, attempt, jitterPercent = 0.1) {
  const backoffDelay = createExponentialBackoff(baseDelay, attempt);
  return addJitter(backoffDelay, jitterPercent);
}

/**
 * Create a delay for human-like behavior
 * @param {string} behavior - Behavior type
 * @param {Object} options - Options for the behavior
 * @returns {number} - Human-like delay
 */
export function createHumanBehaviorDelay(behavior, options = {}) {
  switch (behavior) {
    case 'reading':
      return createReadingPause(options.contentLength, options.readingSpeed);
    case 'hesitation':
      return createHesitationDelay(options.baseDelay);
    case 'fatigue':
      return createFatigueDelay(options.baseDelay, options.fatigueFactor);
    case 'natural':
      return createHumanDelay(options.baseDelay, options.variation);
    case 'pause':
      return createNaturalPause(options.minMs, options.maxMs);
    default:
      return createRandomDelay(options.minMs || 100, options.maxMs || 1000);
  }
}

/**
 * Wait for a condition to be true
 * @param {Function} condition - Condition function
 * @param {number} timeout - Timeout in ms
 * @param {number} interval - Check interval in ms
 * @returns {Promise<boolean>} - Promise that resolves with condition result
 */
export function waitForCondition(condition, timeout = 5000, interval = 100) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const check = () => {
      if (condition()) {
        resolve(true);
        return;
      }
      
      if (Date.now() - startTime >= timeout) {
        resolve(false);
        return;
      }
      
      setTimeout(check, interval);
    };
    
    check();
  });
}

/**
 * Create a timeout that can be extended
 * @param {number} initialMs - Initial timeout in ms
 * @returns {Object} - Object with extend and cancel functions
 */
export function createExtendableTimeout(initialMs) {
  let timeoutId;
  let isCancelled = false;
  
  const promise = new Promise((resolve, reject) => {
    timeoutId = setTimeout(() => {
      if (!isCancelled) {
        resolve();
      }
    }, initialMs);
  });
  
  const extend = (additionalMs) => {
    if (timeoutId && !isCancelled) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (!isCancelled) {
          resolve();
        }
      }, additionalMs);
    }
  };
  
  const cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      isCancelled = true;
    }
  };
  
  return { promise, extend, cancel };
}
