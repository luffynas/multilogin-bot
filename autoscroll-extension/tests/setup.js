/**
 * Jest Setup File
 * Comprehensive setup for autoscroll extension testing with realistic HTML structure
 */

import '@testing-library/jest-dom';
import { setupRealisticBrowserWithHTML, getRealisticTestElements } from './realistic-html-setup.js';

// Mock Chrome Extension APIs
global.chrome = {
  // Tabs API
  tabs: {
    query: jest.fn(() => Promise.resolve([{ id: 1, url: 'https://example.com' }])),
    create: jest.fn(() => Promise.resolve({ id: 2 })),
    update: jest.fn(() => Promise.resolve({ id: 1 })),
    remove: jest.fn(() => Promise.resolve()),
    onActivated: { addListener: jest.fn(), removeListener: jest.fn() },
    onUpdated: { addListener: jest.fn(), removeListener: jest.fn() },
    onRemoved: { addListener: jest.fn(), removeListener: jest.fn() }
  },
  
  // Storage API
  storage: {
    local: {
      get: jest.fn(() => Promise.resolve({})),
      set: jest.fn(() => Promise.resolve()),
      remove: jest.fn(() => Promise.resolve()),
      clear: jest.fn(() => Promise.resolve())
    },
    sync: {
      get: jest.fn(() => Promise.resolve({})),
      set: jest.fn(() => Promise.resolve()),
      remove: jest.fn(() => Promise.resolve()),
      clear: jest.fn(() => Promise.resolve())
    }
  },
  
  // Runtime API
  runtime: {
    sendMessage: jest.fn(() => Promise.resolve({})),
    onMessage: { addListener: jest.fn(), removeListener: jest.fn() },
    onInstalled: { addListener: jest.fn(), removeListener: jest.fn() },
    getURL: jest.fn((path) => `chrome-extension://test-id/${path}`)
  },
  
  // Scripting API
  scripting: {
    executeScript: jest.fn(() => Promise.resolve([{ result: 'success' }])),
    insertCSS: jest.fn(() => Promise.resolve()),
    removeCSS: jest.fn(() => Promise.resolve())
  },
  
  // Permissions API
  permissions: {
    request: jest.fn(() => Promise.resolve({ granted: true })),
    contains: jest.fn(() => Promise.resolve(true)),
    remove: jest.fn(() => Promise.resolve({ granted: false }))
  }
};

// Setup realistic browser environment with HTML structure
setupRealisticBrowserWithHTML();

// Mock window and document
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

// Mock MutationObserver
global.MutationObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  takeRecords: jest.fn(() => [])
}));

// Mock window.scrollTo
global.window.scrollTo = jest.fn((options) => {
  if (typeof options === 'object') {
    global.window.scrollY = options.top || 0;
    global.window.scrollX = options.left || 0;
  } else {
    global.window.scrollY = arguments[1] || 0;
    global.window.scrollX = arguments[0] || 0;
  }
});

// Mock performance
global.performance = {
  now: jest.fn(() => Date.now()),
  mark: jest.fn((name) => {
    if (!global.performance.marks) global.performance.marks = [];
    global.performance.marks.push({ name, startTime: Date.now() });
  }),
  measure: jest.fn((name, startMark, endMark) => {
    if (!global.performance.measures) global.performance.measures = [];
    global.performance.measures.push({ name, startTime: 0, duration: 100 });
  }),
  getEntriesByType: jest.fn((type) => {
    if (type === 'mark') return global.performance.marks || [];
    if (type === 'measure') return global.performance.measures || [];
    return [];
  }),
  getEntriesByName: jest.fn((name) => {
    const marks = global.performance.marks || [];
    const measures = global.performance.measures || [];
    return [...marks, ...measures].filter(entry => entry.name === name);
  }),
  getEntries: jest.fn(() => []),
  clearMarks: jest.fn(() => {
    global.performance.marks = [];
  }),
  clearMeasures: jest.fn(() => {
    global.performance.measures = [];
  })
};

// Mock console methods to reduce noise in tests
const originalConsole = global.console;
global.console = {
  ...originalConsole,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn()
};

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
};
global.sessionStorage = sessionStorageMock;

// Mock fetch
global.fetch = jest.fn(() => Promise.resolve({
  ok: true,
  status: 200,
  json: () => Promise.resolve({}),
  text: () => Promise.resolve(''),
  blob: () => Promise.resolve(new Blob())
}));

// Mock crypto
global.crypto = {
  getRandomValues: jest.fn((arr) => {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
    return arr;
  }),
  randomUUID: jest.fn(() => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  }))
};

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 16));
global.cancelAnimationFrame = jest.fn(id => clearTimeout(id));

// Mock getComputedStyle
global.getComputedStyle = jest.fn((element) => {
  const defaultStyle = {
    display: 'block',
    visibility: 'visible',
    opacity: '1',
    position: 'static',
    top: '0px',
    left: '0px',
    width: '100px',
    height: '100px',
    marginTop: '0px',
    marginLeft: '0px',
    marginRight: '0px',
    marginBottom: '0px',
    paddingTop: '0px',
    paddingLeft: '0px',
    paddingRight: '0px',
    paddingBottom: '0px',
    borderTopWidth: '0px',
    borderLeftWidth: '0px',
    borderRightWidth: '0px',
    borderBottomWidth: '0px',
    fontSize: '16px',
    fontFamily: 'Arial, sans-serif',
    color: 'rgb(0, 0, 0)',
    backgroundColor: 'rgba(0, 0, 0, 0)',
    zIndex: 'auto',
    overflow: 'visible',
    overflowX: 'visible',
    overflowY: 'visible'
  };
  
  // Customize based on element
  if (element && element.classList) {
    if (element.classList.contains('hidden')) {
      defaultStyle.display = 'none';
      defaultStyle.visibility = 'hidden';
    }
    if (element.classList.contains('invisible')) {
      defaultStyle.visibility = 'hidden';
    }
    if (element.classList.contains('opacity-0')) {
      defaultStyle.opacity = '0';
    }
  }
  
  return defaultStyle;
});

// Test utilities
global.testUtils = {
  // Mock user agent
  mockUserAgent: (userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36') => {
    try {
      Object.defineProperty(navigator, 'userAgent', { value: userAgent, writable: true, configurable: true });
    } catch (error) {
      // JSDOM limitation - navigator properties are read-only
      console.warn('Cannot mock userAgent in JSDOM environment');
    }
  },
  
  // Mock screen properties
  mockScreen: (width = 1920, height = 1080) => {
    try {
      Object.defineProperty(screen, 'width', { value: width, writable: true, configurable: true });
      Object.defineProperty(screen, 'height', { value: height, writable: true, configurable: true });
      Object.defineProperty(screen, 'availWidth', { value: width, writable: true, configurable: true });
      Object.defineProperty(screen, 'availHeight', { value: height - 40, writable: true, configurable: true });
      Object.defineProperty(screen, 'colorDepth', { value: 24, writable: true, configurable: true });
      Object.defineProperty(screen, 'pixelDepth', { value: 24, writable: true, configurable: true });
    } catch (error) {
      // JSDOM limitation - screen properties are read-only
      console.warn('Cannot mock screen properties in JSDOM environment');
    }
  },
  
  // Mock timezone
  mockTimezone: (timezone = 'America/New_York') => {
    const originalDateTimeFormat = Intl.DateTimeFormat;
    global.Intl.DateTimeFormat = jest.fn().mockImplementation((...args) => {
      if (args.length === 0) {
        return new originalDateTimeFormat('en-US', { timeZone: timezone });
      }
      return new originalDateTimeFormat(...args);
    });
  },
  
  // Mock window size
  mockWindowSize: (width = 1920, height = 1080) => {
    Object.defineProperty(window, 'innerWidth', { value: width, writable: true, configurable: true });
    Object.defineProperty(window, 'innerHeight', { value: height, writable: true, configurable: true });
    Object.defineProperty(window, 'outerWidth', { value: width, writable: true, configurable: true });
    Object.defineProperty(window, 'outerHeight', { value: height, writable: true, configurable: true });
  },
  
  // Mock scroll position
  mockScrollPosition: (x = 0, y = 0) => {
    Object.defineProperty(window, 'scrollX', { value: x, writable: true, configurable: true });
    Object.defineProperty(window, 'scrollY', { value: y, writable: true, configurable: true });
  },
  
  // Create mock DOM element
  createMockElement: (tagName = 'div', className = '', textContent = '') => {
    const element = document.createElement(tagName);
    if (className) element.className = className;
    if (textContent) element.textContent = textContent;
    return element;
  },
  
  // Get realistic test elements
  getTestElements: () => getRealisticTestElements(),
  
  // Simulate user interaction
  simulateUserInteraction: (element, eventType = 'click') => {
    const event = new Event(eventType, { bubbles: true, cancelable: true });
    element.dispatchEvent(event);
  },
  
  // Wait for next tick
  waitForNextTick: () => new Promise(resolve => setTimeout(resolve, 0)),
  
  // Wait for specified time
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms))
};

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
  localStorageMock.clear();
  sessionStorageMock.clear();
});

// Global test timeout
jest.setTimeout(30000);
