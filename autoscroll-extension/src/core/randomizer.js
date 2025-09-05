/**
 * Randomizer utilities for human-like variations
 */

/**
 * Generate random float between min and max
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} - Random float
 */
export function randFloat(min, max) {
  return min + Math.random() * (max - min);
}

/**
 * Generate random integer between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} - Random integer
 */
export function randInt(min, max) {
  return Math.floor(randFloat(min, max + 1));
}

/**
 * Generate random boolean
 * @param {number} probability - Probability of true (0-1)
 * @returns {boolean} - Random boolean
 */
export function randBool(probability = 0.5) {
  return Math.random() < probability;
}

/**
 * Choose random element from array
 * @param {Array} array - Array to choose from
 * @returns {any} - Random element
 */
export function choice(array) {
  if (!array || array.length === 0) return null;
  return array[randInt(0, array.length - 1)];
}

/**
 * Choose weighted random element from array
 * @param {Array} array - Array of objects with value and weight
 * @returns {any} - Random element based on weight
 */
export function choiceWeighted(array) {
  if (!array || array.length === 0) return null;
  
  const totalWeight = array.reduce((sum, item) => sum + (item.weight || 1), 0);
  let random = Math.random() * totalWeight;
  
  for (const item of array) {
    random -= (item.weight || 1);
    if (random <= 0) {
      return item.value;
    }
  }
  
  return array[array.length - 1].value;
}

/**
 * Generate random jitter value
 * @param {number} baseValue - Base value
 * @param {number} jitterPercent - Jitter percentage (0-1)
 * @returns {number} - Value with jitter
 */
export function jitter(baseValue, jitterPercent = 0.1) {
  const jitterAmount = baseValue * jitterPercent;
  const randomJitter = (Math.random() - 0.5) * 2 * jitterAmount;
  return baseValue + randomJitter;
}

/**
 * Generate random delay with human-like distribution
 * @param {number} minMs - Minimum delay in ms
 * @param {number} maxMs - Maximum delay in ms
 * @returns {number} - Random delay
 */
export function randDelay(minMs, maxMs) {
  // Use exponential distribution for more natural delays
  const lambda = 1 / ((minMs + maxMs) / 2);
  const random = Math.random();
  const delay = -Math.log(1 - random) / lambda;
  
  return Math.max(minMs, Math.min(maxMs, delay));
}

/**
 * Generate random scroll step
 * @param {number} minStep - Minimum step
 * @param {number} maxStep - Maximum step
 * @returns {number} - Random scroll step
 */
export function randScrollStep(minStep, maxStep) {
  // Use normal distribution for more natural scroll steps
  const mean = (minStep + maxStep) / 2;
  const stdDev = (maxStep - minStep) / 6; // 99.7% within range
  
  // Box-Muller transform for normal distribution
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  
  const step = mean + z0 * stdDev;
  return Math.max(minStep, Math.min(maxStep, step));
}

/**
 * Generate random easing function
 * @returns {string} - Easing function name
 */
export function randEasing() {
  const easings = [
    'ease',
    'ease-in',
    'ease-out',
    'ease-in-out',
    'linear'
  ];
  
  return choice(easings);
}

/**
 * Generate random bezier curve for natural movement
 * @returns {string} - CSS cubic-bezier value
 */
export function randBezier() {
  const curves = [
    'cubic-bezier(0.25, 0.46, 0.45, 0.94)', // ease-out-quad
    'cubic-bezier(0.55, 0.085, 0.68, 0.53)', // ease-in-quad
    'cubic-bezier(0.455, 0.03, 0.515, 0.955)', // ease-in-out-quad
    'cubic-bezier(0.25, 0.46, 0.45, 0.94)', // ease-out-sine
    'cubic-bezier(0.39, 0.575, 0.565, 1)', // ease-out-back
    'cubic-bezier(0.175, 0.885, 0.32, 1.275)' // ease-out-back-strong
  ];
  
  return choice(curves);
}

/**
 * Generate random human-like pause duration
 * @param {number} baseMs - Base pause in ms
 * @returns {number} - Human-like pause
 */
export function randHumanPause(baseMs = 1000) {
  // Human pauses are often longer than expected
  const multiplier = randFloat(0.5, 2.5);
  return baseMs * multiplier;
}

/**
 * Generate random hesitation delay
 * @param {number} baseMs - Base delay in ms
 * @returns {number} - Hesitation delay
 */
export function randHesitation(baseMs = 500) {
  // Hesitation is often shorter but with more variation
  const multiplier = randFloat(0.2, 1.8);
  return baseMs * multiplier;
}

/**
 * Generate random fatigue factor
 * @param {number} sessionDuration - Session duration in ms
 * @returns {number} - Fatigue factor (1.0 = no fatigue)
 */
export function randFatigue(sessionDuration) {
  // Fatigue increases over time
  const fatigueRate = 0.0001; // 0.01% per second
  const baseFatigue = 1 + (sessionDuration * fatigueRate / 1000);
  
  // Add some randomness
  const randomFactor = randFloat(0.8, 1.2);
  return baseFatigue * randomFactor;
}

/**
 * Generate random reading speed variation
 * @param {number} baseSpeed - Base reading speed (chars/min)
 * @returns {number} - Varied reading speed
 */
export function randReadingSpeed(baseSpeed = 200) {
  // Reading speed varies significantly
  const variation = randFloat(0.5, 1.5);
  return baseSpeed * variation;
}

/**
 * Generate random scroll direction
 * @param {number} downProbability - Probability of scrolling down (0-1)
 * @returns {string} - Scroll direction ('up' or 'down')
 */
export function randScrollDirection(downProbability = 0.9) {
  return randBool(downProbability) ? 'down' : 'up';
}

/**
 * Generate random scroll pattern
 * @param {string} patternType - Pattern type
 * @returns {Object} - Scroll pattern configuration
 */
export function randScrollPattern(patternType = 'mixed') {
  const patterns = {
    linear: {
      type: 'linear',
      stepVariation: 0.1,
      delayVariation: 0.2
    },
    burst: {
      type: 'burst',
      burstCount: randInt(2, 4),
      burstDelay: randInt(50, 150),
      pauseDelay: randInt(500, 2000)
    },
    momentum: {
      type: 'momentum',
      acceleration: randFloat(0.1, 0.3),
      deceleration: randFloat(0.05, 0.15)
    },
    mixed: {
      type: 'mixed',
      patterns: ['linear', 'burst', 'momentum'],
      switchProbability: 0.1
    }
  };
  
  return patterns[patternType] || patterns.mixed;
}

/**
 * Generate random human error
 * @param {number} errorProbability - Probability of error (0-1)
 * @returns {Object|null} - Error configuration or null
 */
export function randHumanError(errorProbability = 0.05) {
  if (!randBool(errorProbability)) return null;
  
  const errors = [
    { type: 'overshoot', correction: randInt(50, 200) },
    { type: 'undershoot', correction: randInt(50, 200) },
    { type: 'wrong_direction', correction: randInt(100, 300) },
    { type: 'pause', duration: randInt(1000, 5000) }
  ];
  
  return choice(errors);
}

/**
 * Generate random interaction pattern
 * @returns {Object} - Interaction pattern
 */
export function randInteractionPattern() {
  const patterns = [
    { type: 'scroll_only', weight: 0.7 },
    { type: 'scroll_with_pause', weight: 0.2 },
    { type: 'scroll_with_hover', weight: 0.1 }
  ];
  
  return choiceWeighted(patterns);
}

/**
 * Generate random session length
 * @param {number} minMs - Minimum session length in ms
 * @param {number} maxMs - Maximum session length in ms
 * @returns {number} - Random session length
 */
export function randSessionLength(minMs = 30000, maxMs = 300000) {
  // Use log-normal distribution for more realistic session lengths
  const mean = Math.log((minMs + maxMs) / 2);
  const stdDev = 0.5;
  
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  
  const logNormal = Math.exp(mean + z0 * stdDev);
  return Math.max(minMs, Math.min(maxMs, logNormal));
}

/**
 * Generate random device characteristics
 * @returns {Object} - Device characteristics
 */
export function randDeviceCharacteristics() {
  const devices = [
    { type: 'desktop', scrollSpeed: randFloat(100, 300), precision: 'high' },
    { type: 'laptop', scrollSpeed: randFloat(80, 250), precision: 'medium' },
    { type: 'tablet', scrollSpeed: randFloat(50, 150), precision: 'medium' },
    { type: 'mobile', scrollSpeed: randFloat(30, 100), precision: 'low' }
  ];
  
  return choice(devices);
}

/**
 * Generate random user behavior profile
 * @returns {Object} - User behavior profile
 */
export function randUserProfile() {
  const profiles = [
    { type: 'fast_reader', speed: 1.5, pause: 0.5, error: 0.02 },
    { type: 'careful_reader', speed: 0.7, pause: 1.5, error: 0.01 },
    { type: 'skimmer', speed: 2.0, pause: 0.3, error: 0.03 },
    { type: 'casual_reader', speed: 1.0, pause: 1.0, error: 0.05 },
    { type: 'distracted_reader', speed: 0.8, pause: 2.0, error: 0.08 }
  ];
  
  return choice(profiles);
}

/**
 * Generate random time of day behavior
 * @param {Date} date - Date object
 * @returns {Object} - Time-based behavior
 */
export function randTimeBasedBehavior(date = new Date()) {
  const hour = date.getHours();
  
  let behavior = {
    speed: 1.0,
    pause: 1.0,
    error: 0.05,
    fatigue: 1.0
  };
  
  // Morning (6-12)
  if (hour >= 6 && hour < 12) {
    behavior.speed = randFloat(1.1, 1.3);
    behavior.pause = randFloat(0.8, 1.2);
    behavior.error = randFloat(0.03, 0.06);
  }
  // Afternoon (12-18)
  else if (hour >= 12 && hour < 18) {
    behavior.speed = randFloat(0.9, 1.1);
    behavior.pause = randFloat(0.9, 1.3);
    behavior.error = randFloat(0.04, 0.07);
  }
  // Evening (18-24)
  else if (hour >= 18 && hour < 24) {
    behavior.speed = randFloat(0.8, 1.0);
    behavior.pause = randFloat(1.0, 1.5);
    behavior.error = randFloat(0.05, 0.08);
    behavior.fatigue = randFloat(1.1, 1.3);
  }
  // Night (0-6)
  else {
    behavior.speed = randFloat(0.6, 0.9);
    behavior.pause = randFloat(1.2, 2.0);
    behavior.error = randFloat(0.06, 0.1);
    behavior.fatigue = randFloat(1.2, 1.5);
  }
  
  return behavior;
}

/**
 * Generate human-like scroll pattern with natural variations
 * @param {Object} baseConfig - Base configuration
 * @returns {Object} - Human-like scroll pattern
 */
export function generateHumanScrollPattern(baseConfig = {}) {
  const config = {
    minStep: 50,
    maxStep: 200,
    minDelay: 100,
    maxDelay: 500,
    ...baseConfig
  };
  
  // Add natural human variations
  const variations = {
    stepVariation: randFloat(0.8, 1.2),
    delayVariation: randFloat(0.7, 1.3),
    jitterFactor: randFloat(0.05, 0.15),
    momentumFactor: randFloat(0.9, 1.1)
  };
  
  return {
    ...config,
    minStep: Math.round(config.minStep * variations.stepVariation),
    maxStep: Math.round(config.maxStep * variations.stepVariation),
    minDelay: Math.round(config.minDelay * variations.delayVariation),
    maxDelay: Math.round(config.maxDelay * variations.delayVariation),
    jitter: variations.jitterFactor,
    momentum: variations.momentumFactor
  };
}

/**
 * Generate realistic scroll acceleration curve
 * @param {number} duration - Total duration in ms
 * @returns {Array} - Array of {time, speed} objects
 */
export function generateScrollAcceleration(duration = 1000) {
  const points = [];
  const steps = 20;
  const stepDuration = duration / steps;
  
  for (let i = 0; i <= steps; i++) {
    const progress = i / steps;
    const time = i * stepDuration;
    
    // Natural acceleration curve (ease-in-out)
    const speed = progress < 0.5 
      ? 2 * progress * progress 
      : 1 - Math.pow(-2 * progress + 2, 2) / 2;
    
    points.push({ time, speed });
  }
  
  return points;
}

/**
 * Generate human-like hesitation pattern
 * @param {number} baseDelay - Base delay in ms
 * @returns {Object} - Hesitation pattern
 */
export function generateHesitationPattern(baseDelay = 1000) {
  const hesitationTypes = [
    { type: 'quick', factor: 0.3, probability: 0.4 },
    { type: 'normal', factor: 1.0, probability: 0.4 },
    { type: 'long', factor: 2.0, probability: 0.2 }
  ];
  
  const hesitation = choiceWeighted(hesitationTypes.map(h => ({
    value: h,
    weight: h.probability
  })));
  
  return {
    type: hesitation.type,
    duration: Math.round(baseDelay * hesitation.factor),
    factor: hesitation.factor
  };
}

/**
 * Generate natural scroll rhythm
 * @param {number} count - Number of scroll steps
 * @returns {Array} - Array of rhythm patterns
 */
export function generateScrollRhythm(count = 10) {
  const rhythms = [];
  
  for (let i = 0; i < count; i++) {
    const rhythm = {
      step: i,
      intensity: randFloat(0.5, 1.5),
      pause: randFloat(0.8, 1.2),
      variation: randFloat(0.9, 1.1)
    };
    
    // Add natural rhythm patterns
    if (i % 3 === 0) {
      rhythm.intensity *= 1.2; // Stronger every 3rd step
    }
    
    if (i % 5 === 0) {
      rhythm.pause *= 1.5; // Longer pause every 5th step
    }
    
    rhythms.push(rhythm);
  }
  
  return rhythms;
}

/**
 * Generate human-like error pattern
 * @param {number} errorRate - Base error rate (0-1)
 * @returns {Object} - Error pattern
 */
export function generateErrorPattern(errorRate = 0.05) {
  const errorTypes = [
    { type: 'overshoot', probability: 0.4, correction: randInt(50, 200) },
    { type: 'undershoot', probability: 0.3, correction: randInt(30, 150) },
    { type: 'wrong_direction', probability: 0.2, correction: randInt(100, 300) },
    { type: 'hesitation', probability: 0.1, correction: randInt(500, 2000) }
  ];
  
  if (Math.random() < errorRate) {
    const error = choiceWeighted(errorTypes.map(e => ({
      value: e,
      weight: e.probability
    })));
    
    return {
      hasError: true,
      type: error.type,
      correction: error.correction,
      timestamp: Date.now()
    };
  }
  
  return { hasError: false };
}

/**
 * Generate natural scroll sequence
 * @param {Object} config - Configuration
 * @returns {Array} - Array of scroll steps
 */
export function generateNaturalScrollSequence(config = {}) {
  const sequence = [];
  const stepCount = config.stepCount || 20;
  const baseStep = config.baseStep || 100;
  const baseDelay = config.baseDelay || 200;
  
  for (let i = 0; i < stepCount; i++) {
    const step = {
      index: i,
      delta: Math.round(baseStep * randFloat(0.7, 1.3)),
      delay: Math.round(baseDelay * randFloat(0.8, 1.2)),
      easing: randEasing(),
      timestamp: Date.now() + (i * baseDelay)
    };
    
    // Add natural variations
    if (i % 4 === 0) {
      step.delta *= 1.2; // Stronger step every 4th
    }
    
    if (i % 7 === 0) {
      step.delay *= 1.5; // Longer delay every 7th
    }
    
    sequence.push(step);
  }
  
  return sequence;
}
