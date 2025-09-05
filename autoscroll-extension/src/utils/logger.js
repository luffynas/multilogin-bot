/**
 * Logging utilities with different levels and module tagging
 */

/**
 * Log levels
 */
export const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  OFF: 4
};

/**
 * Default log level
 */
let currentLogLevel = LOG_LEVELS.INFO;

/**
 * Set log level
 * @param {number} level - Log level
 */
export function setLogLevel(level) {
  currentLogLevel = level;
}

/**
 * Get current log level
 * @returns {number} - Current log level
 */
export function getLogLevel() {
  return currentLogLevel;
}

/**
 * Check if log level should be output
 * @param {number} level - Log level to check
 * @returns {boolean} - True if should output
 */
function shouldLog(level) {
  return level >= currentLogLevel;
}

/**
 * Format log message with timestamp and module
 * @param {string} level - Log level name
 * @param {string} module - Module name
 * @param {string} message - Log message
 * @param {Array} args - Additional arguments
 * @returns {string} - Formatted log message
 */
function formatLogMessage(level, module, message, args = []) {
  const timestamp = new Date().toISOString();
  const moduleTag = module ? `[${module}]` : '';
  const argsStr = args.length > 0 ? ` ${args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
  ).join(' ')}` : '';
  
  return `${timestamp} ${level} ${moduleTag} ${message}${argsStr}`;
}

/**
 * Debug log
 * @param {string} module - Module name
 * @param {string} message - Log message
 * @param {...any} args - Additional arguments
 */
export function debug(module, message, ...args) {
  if (shouldLog(LOG_LEVELS.DEBUG)) {
    const formattedMessage = formatLogMessage('DEBUG', module, message, args);
    console.debug(formattedMessage);
  }
}

/**
 * Info log
 * @param {string} module - Module name
 * @param {string} message - Log message
 * @param {...any} args - Additional arguments
 */
export function info(module, message, ...args) {
  if (shouldLog(LOG_LEVELS.INFO)) {
    const formattedMessage = formatLogMessage('INFO', module, message, args);
    console.info(formattedMessage);
  }
}

/**
 * Warning log
 * @param {string} module - Module name
 * @param {string} message - Log message
 * @param {...any} args - Additional arguments
 */
export function warn(module, message, ...args) {
  if (shouldLog(LOG_LEVELS.WARN)) {
    const formattedMessage = formatLogMessage('WARN', module, message, args);
    console.warn(formattedMessage);
  }
}

/**
 * Error log
 * @param {string} module - Module name
 * @param {string} message - Log message
 * @param {...any} args - Additional arguments
 */
export function error(module, message, ...args) {
  if (shouldLog(LOG_LEVELS.ERROR)) {
    const formattedMessage = formatLogMessage('ERROR', module, message, args);
    console.error(formattedMessage);
  }
}

/**
 * Create module-specific logger
 * @param {string} moduleName - Module name
 * @returns {Object} - Logger instance
 */
export function createLogger(moduleName) {
  return {
    debug: (message, ...args) => debug(moduleName, message, ...args),
    info: (message, ...args) => info(moduleName, message, ...args),
    warn: (message, ...args) => warn(moduleName, message, ...args),
    error: (message, ...args) => error(moduleName, message, ...args)
  };
}

/**
 * Performance logger
 * @param {string} module - Module name
 * @param {string} operation - Operation name
 * @param {Function} fn - Function to measure
 * @returns {Promise<any>} - Function result
 */
export async function measurePerformance(module, operation, fn) {
  const startTime = performance.now();
  
  try {
    const result = await fn();
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    debug(module, `Performance: ${operation} took ${duration.toFixed(2)}ms`);
    
    return result;
  } catch (err) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    error(module, `Performance: ${operation} failed after ${duration.toFixed(2)}ms`, err);
    throw err;
  }
}

/**
 * Log function execution with timing
 * @param {string} module - Module name
 * @param {string} functionName - Function name
 * @param {Function} fn - Function to execute
 * @returns {Function} - Wrapped function
 */
export function logFunction(module, functionName, fn) {
  return async function(...args) {
    const startTime = performance.now();
    
    try {
      debug(module, `Executing: ${functionName}`, args);
      const result = await fn.apply(this, args);
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      debug(module, `Completed: ${functionName} in ${duration.toFixed(2)}ms`);
      return result;
    } catch (err) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      error(module, `Failed: ${functionName} after ${duration.toFixed(2)}ms`, err);
      throw err;
    }
  };
}

/**
 * Log event with context
 * @param {string} module - Module name
 * @param {string} eventType - Event type
 * @param {Object} context - Event context
 * @param {Object} data - Event data
 */
export function logEvent(module, eventType, context = {}, data = {}) {
  debug(module, `Event: ${eventType}`, { context, data });
}

/**
 * Log state change
 * @param {string} module - Module name
 * @param {string} stateName - State name
 * @param {any} oldState - Old state
 * @param {any} newState - New state
 */
export function logStateChange(module, stateName, oldState, newState) {
  debug(module, `State change: ${stateName}`, { from: oldState, to: newState });
}

/**
 * Log error with stack trace
 * @param {string} module - Module name
 * @param {string} message - Error message
 * @param {Error} err - Error object
 */
export function logError(module, message, err) {
  error(module, message, {
    name: err.name,
    message: err.message,
    stack: err.stack
  });
}

/**
 * Log configuration
 * @param {string} module - Module name
 * @param {Object} config - Configuration object
 */
export function logConfig(module, config) {
  debug(module, 'Configuration loaded', config);
}

/**
 * Log user action
 * @param {string} module - Module name
 * @param {string} action - User action
 * @param {Object} details - Action details
 */
export function logUserAction(module, action, details = {}) {
  info(module, `User action: ${action}`, details);
}

/**
 * Log system event
 * @param {string} module - Module name
 * @param {string} event - System event
 * @param {Object} details - Event details
 */
export function logSystemEvent(module, event, details = {}) {
  info(module, `System event: ${event}`, details);
}

/**
 * Log stealth action
 * @param {string} module - Module name
 * @param {string} action - Stealth action
 * @param {Object} details - Action details
 */
export function logStealthAction(module, action, details = {}) {
  debug(module, `Stealth action: ${action}`, details);
}

/**
 * Log navigation event
 * @param {string} module - Module name
 * @param {string} event - Navigation event
 * @param {Object} details - Event details
 */
export function logNavigation(module, event, details = {}) {
  info(module, `Navigation: ${event}`, details);
}

/**
 * Log analytics data
 * @param {string} module - Module name
 * @param {string} metric - Metric name
 * @param {any} value - Metric value
 */
export function logAnalytics(module, metric, value) {
  debug(module, `Analytics: ${metric}`, value);
}
