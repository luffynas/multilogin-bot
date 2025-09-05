/**
 * DOM utilities for safe querying, visibility checks, and element metrics
 */

/**
 * Safe query selector with error handling
 * @param {string} selector - CSS selector
 * @param {Element} context - Context element (default: document)
 * @returns {Element|null} - Found element or null
 */
export function safeQuerySelector(selector, context = document) {
  try {
    return context.querySelector(selector);
  } catch (error) {
    console.warn(`Invalid selector: ${selector}`, error);
    return null;
  }
}

/**
 * Safe query selector all with error handling
 * @param {string} selector - CSS selector
 * @param {Element} context - Context element (default: document)
 * @returns {NodeList} - Found elements or empty NodeList
 */
export function safeQuerySelectorAll(selector, context = document) {
  try {
    return context.querySelectorAll(selector);
  } catch (error) {
    console.warn(`Invalid selector: ${selector}`, error);
    return document.querySelectorAll(':not(*)'); // Empty NodeList
  }
}

/**
 * Check if element is visible in viewport
 * @param {Element} element - Element to check
 * @returns {boolean} - True if visible
 */
export function isElementVisible(element) {
  if (!element) return false;
  
  const rect = element.getBoundingClientRect();
  const viewport = {
    top: 0,
    left: 0,
    bottom: window.innerHeight,
    right: window.innerWidth
  };
  
  return (
    rect.top < viewport.bottom &&
    rect.bottom > viewport.top &&
    rect.left < viewport.right &&
    rect.right > viewport.left
  );
}

/**
 * Get viewport dimensions
 * @returns {Object} - Viewport dimensions
 */
export function getViewportDimensions() {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    scrollX: window.pageXOffset || document.documentElement.scrollLeft,
    scrollY: window.pageYOffset || document.documentElement.scrollTop
  };
}

/**
 * Get document dimensions
 * @returns {Object} - Document dimensions
 */
export function getDocumentDimensions() {
  return {
    width: Math.max(
      document.body.scrollWidth,
      document.documentElement.scrollWidth,
      document.body.offsetWidth,
      document.documentElement.offsetWidth,
      document.body.clientWidth,
      document.documentElement.clientWidth
    ),
    height: Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight,
      document.body.clientHeight,
      document.documentElement.clientHeight
    )
  };
}

/**
 * Get element metrics
 * @param {Element} element - Element to measure
 * @returns {Object} - Element metrics
 */
export function getElementMetrics(element) {
  if (!element) return null;
  
  const rect = element.getBoundingClientRect();
  const viewport = getViewportDimensions();
  
  return {
    rect,
    isVisible: isElementVisible(element),
    viewportPercentage: {
      width: (rect.width / viewport.width) * 100,
      height: (rect.height / viewport.height) * 100
    },
    position: {
      top: rect.top,
      left: rect.left,
      bottom: rect.bottom,
      right: rect.right
    }
  };
}

/**
 * Get scroll position
 * @returns {Object} - Current scroll position
 */
export function getScrollPosition() {
  return {
    x: window.pageXOffset || document.documentElement.scrollLeft,
    y: window.pageYOffset || document.documentElement.scrollTop
  };
}

/**
 * Get scroll percentage
 * @returns {Object} - Scroll percentage
 */
export function getScrollPercentage() {
  const doc = getDocumentDimensions();
  const viewport = getViewportDimensions();
  const scroll = getScrollPosition();
  
  const maxScrollX = Math.max(0, doc.width - viewport.width);
  const maxScrollY = Math.max(0, doc.height - viewport.height);
  
  return {
    x: maxScrollX > 0 ? (scroll.x / maxScrollX) * 100 : 0,
    y: maxScrollY > 0 ? (scroll.y / maxScrollY) * 100 : 0
  };
}

/**
 * Check if page is at bottom
 * @param {number} threshold - Threshold in pixels (default: 100)
 * @returns {boolean} - True if at bottom
 */
export function isAtBottom(threshold = 100) {
  const doc = getDocumentDimensions();
  const viewport = getViewportDimensions();
  const scroll = getScrollPosition();
  
  return (scroll.y + viewport.height) >= (doc.height - threshold);
}

/**
 * Check if page is at top
 * @param {number} threshold - Threshold in pixels (default: 100)
 * @returns {boolean} - True if at top
 */
export function isAtTop(threshold = 100) {
  const scroll = getScrollPosition();
  return scroll.y <= threshold;
}

/**
 * Create intersection observer for element visibility
 * @param {Function} callback - Callback function
 * @param {Object} options - Observer options
 * @returns {IntersectionObserver} - Observer instance
 */
export function createVisibilityObserver(callback, options = {}) {
  const defaultOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };
  
  return new IntersectionObserver(callback, { ...defaultOptions, ...options });
}

/**
 * Wait for element to be visible
 * @param {string} selector - CSS selector
 * @param {number} timeout - Timeout in ms (default: 5000)
 * @returns {Promise<Element>} - Promise that resolves with element
 */
export function waitForElement(selector, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const element = safeQuerySelector(selector);
    if (element && isElementVisible(element)) {
      resolve(element);
      return;
    }
    
    const observer = createVisibilityObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          observer.disconnect();
          resolve(entry.target);
        }
      });
    });
    
    if (element) {
      observer.observe(element);
    }
    
    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element ${selector} not found within ${timeout}ms`));
    }, timeout);
  });
}
