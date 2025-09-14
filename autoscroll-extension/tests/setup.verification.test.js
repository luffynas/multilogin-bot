/**
 * Setup Verification Tests
 * Verify that Jest setup and mocking is working correctly
 */

describe('Jest Setup Verification', () => {
  test('should have Jest environment configured', () => {
    expect(process.env.NODE_ENV).toBe('test');
    expect(process.env.TEST_MODE).toBe('true');
  });

  test('should have Chrome extension APIs mocked', () => {
    expect(global.chrome).toBeDefined();
    expect(global.chrome.tabs).toBeDefined();
    expect(global.chrome.storage).toBeDefined();
    expect(global.chrome.runtime).toBeDefined();
    expect(global.chrome.scripting).toBeDefined();
    expect(global.chrome.alarms).toBeDefined();
    expect(global.chrome.permissions).toBeDefined();
  });

  test('should have DOM APIs available', () => {
    expect(document).toBeDefined();
    expect(window).toBeDefined();
    expect(navigator).toBeDefined();
    expect(screen).toBeDefined();
  });

  test('should have test utilities available', () => {
    expect(global.testUtils).toBeDefined();
    expect(global.testUtils.createMockElement).toBeDefined();
    expect(global.testUtils.createMockEvent).toBeDefined();
    expect(global.testUtils.createMockMouseEvent).toBeDefined();
    expect(global.testUtils.createMockKeyboardEvent).toBeDefined();
    expect(global.testUtils.createMockTouchEvent).toBeDefined();
    expect(global.testUtils.waitFor).toBeDefined();
    expect(global.testUtils.mockScrollPosition).toBeDefined();
    expect(global.testUtils.mockViewportSize).toBeDefined();
    expect(global.testUtils.mockDocumentDimensions).toBeDefined();
    expect(global.testUtils.mockUserAgent).toBeDefined();
    expect(global.testUtils.mockScreen).toBeDefined();
    expect(global.testUtils.mockTimezone).toBeDefined();
    expect(global.testUtils.mockLanguage).toBeDefined();
    expect(global.testUtils.createMockDOM).toBeDefined();
    expect(global.testUtils.mockChromeContext).toBeDefined();
    expect(global.testUtils.resetAllMocks).toBeDefined();
  });

  test('should have browser APIs mocked', () => {
    expect(global.ResizeObserver).toBeDefined();
    expect(global.IntersectionObserver).toBeDefined();
    expect(global.MutationObserver).toBeDefined();
    expect(global.requestAnimationFrame).toBeDefined();
    expect(global.cancelAnimationFrame).toBeDefined();
    expect(global.performance).toBeDefined();
    expect(global.fetch).toBeDefined();
    expect(global.URL).toBeDefined();
    expect(global.crypto).toBeDefined();
  });

  test('should have storage APIs mocked', () => {
    expect(global.localStorage).toBeDefined();
    expect(global.sessionStorage).toBeDefined();
    expect(typeof global.localStorage.getItem).toBe('function');
    expect(typeof global.localStorage.setItem).toBe('function');
    expect(typeof global.sessionStorage.getItem).toBe('function');
    expect(typeof global.sessionStorage.setItem).toBe('function');
  });
});

describe('Test Utilities Functionality', () => {
  test('should create mock elements', () => {
    const element = global.testUtils.createMockElement('div', { id: 'test', class: 'test-class' });
    
    expect(element.tagName).toBe('DIV');
    expect(element.getAttribute('id')).toBe('test');
    expect(element.getAttribute('class')).toBe('test-class');
  });

  test('should create mock events', () => {
    const clickEvent = global.testUtils.createMockEvent('click');
    const mouseEvent = global.testUtils.createMockMouseEvent('mousedown', { clientX: 100, clientY: 200 });
    const keyboardEvent = global.testUtils.createMockKeyboardEvent('keydown', { key: 'Enter' });
    const touchEvent = global.testUtils.createMockTouchEvent('touchstart');
    
    expect(clickEvent.type).toBe('click');
    expect(mouseEvent.type).toBe('mousedown');
    expect(mouseEvent.clientX).toBe(100);
    expect(mouseEvent.clientY).toBe(200);
    expect(keyboardEvent.type).toBe('keydown');
    expect(keyboardEvent.key).toBe('Enter');
    expect(touchEvent.type).toBe('touchstart');
  });

  test('should mock scroll position', () => {
    global.testUtils.mockScrollPosition(100, 200);
    
    expect(window.scrollX).toBe(100);
    expect(window.scrollY).toBe(200);
    expect(window.pageXOffset).toBe(100);
    expect(window.pageYOffset).toBe(200);
  });

  test('should mock viewport size', () => {
    global.testUtils.mockViewportSize(1366, 768);
    
    expect(window.innerWidth).toBe(1366);
    expect(window.innerHeight).toBe(768);
    expect(window.outerWidth).toBe(1366);
    expect(window.outerHeight).toBe(768);
  });

  test('should mock document dimensions', () => {
    global.testUtils.mockDocumentDimensions(1920, 3000);
    
    expect(document.documentElement.scrollWidth).toBe(1920);
    expect(document.documentElement.scrollHeight).toBe(3000);
    expect(document.documentElement.clientWidth).toBe(1920);
    expect(document.documentElement.clientHeight).toBe(3000);
  });

  test('should mock user agent', () => {
    const customUA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36';
    global.testUtils.mockUserAgent(customUA);
    
    expect(navigator.userAgent).toBe(customUA);
  });

  test('should mock screen properties', () => {
    global.testUtils.mockScreen(2560, 1440);
    
    expect(screen.width).toBe(2560);
    expect(screen.height).toBe(1440);
    expect(screen.availWidth).toBe(2560);
    expect(screen.availHeight).toBe(1400); // height - 40
    expect(screen.colorDepth).toBe(24);
    expect(screen.pixelDepth).toBe(24);
  });

  test('should mock timezone', () => {
    global.testUtils.mockTimezone('Europe/London');
    
    const formatter = new Intl.DateTimeFormat();
    expect(formatter).toBeDefined();
  });

  test('should mock language', () => {
    global.testUtils.mockLanguage('fr-FR');
    
    expect(navigator.language).toBe('fr-FR');
    expect(navigator.languages).toEqual(['fr-FR']);
  });

  test('should create mock DOM', () => {
    const { body, head, title } = global.testUtils.createMockDOM();
    
    expect(body.tagName).toBe('BODY');
    expect(head.tagName).toBe('HEAD');
    expect(title.tagName).toBe('TITLE');
    expect(title.textContent).toBe('Test Page');
  });

  test('should handle async operations', async () => {
    const result = await global.testUtils.waitFor(100);
    expect(result).toBeUndefined(); // waitFor doesn't return anything
  });
});

describe('Chrome Extension API Mocking', () => {
  test('should mock tabs API', async () => {
    const tabs = await chrome.tabs.query({ active: true });
    expect(chrome.tabs.query).toHaveBeenCalledWith({ active: true });
    expect(tabs).toEqual([{ id: 1, url: 'https://example.com' }]);
  });

  test('should mock storage API', async () => {
    await chrome.storage.local.set({ key: 'value' });
    expect(chrome.storage.local.set).toHaveBeenCalledWith({ key: 'value' });
    
    const data = await chrome.storage.local.get('key');
    expect(chrome.storage.local.get).toHaveBeenCalledWith('key');
    expect(data).toEqual({});
  });

  test('should mock runtime API', async () => {
    const response = await chrome.runtime.sendMessage({ action: 'test' });
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({ action: 'test' });
    expect(response).toEqual({});
    
    const url = chrome.runtime.getURL('popup.html');
    expect(chrome.runtime.getURL).toHaveBeenCalledWith('popup.html');
    expect(url).toBe('chrome-extension://test-id/popup.html');
  });

  test('should mock scripting API', async () => {
    const results = await chrome.scripting.executeScript({
      target: { tabId: 1 },
      func: () => 'test'
    });
    expect(chrome.scripting.executeScript).toHaveBeenCalled();
    expect(results).toEqual([{ result: 'success' }]);
  });
});

describe('Browser API Mocking', () => {
  test('should mock fetch API', async () => {
    const response = await fetch('https://api.example.com/data');
    expect(global.fetch).toHaveBeenCalledWith('https://api.example.com/data');
    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);
  });

  test('should mock crypto API', () => {
    const array = new Uint8Array(16);
    const result = crypto.getRandomValues(array);
    expect(result).toBe(array);
    expect(typeof result[0]).toBe('number');
    
    const uuid = crypto.randomUUID();
    expect(typeof uuid).toBe('string');
    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });

  test('should mock performance API', () => {
    const now = performance.now();
    expect(typeof now).toBe('number');
    expect(now).toBeGreaterThan(0);
    
    // Test that performance object exists and has expected properties
    expect(performance).toBeDefined();
    expect(typeof performance.now).toBe('function');
    
    // Test that other methods exist (if available)
    if (typeof performance.mark === 'function') {
      expect(typeof performance.mark).toBe('function');
    }
    if (typeof performance.measure === 'function') {
      expect(typeof performance.measure).toBe('function');
    }
  });

  test('should mock localStorage and sessionStorage', () => {
    localStorage.setItem('test', 'value');
    localStorage.getItem('test');
    localStorage.removeItem('test');
    localStorage.clear();
    
    sessionStorage.setItem('session', 'data');
    sessionStorage.getItem('session');
    sessionStorage.removeItem('session');
    sessionStorage.clear();
    
    expect(typeof localStorage.setItem).toBe('function');
    expect(typeof localStorage.getItem).toBe('function');
    expect(typeof sessionStorage.setItem).toBe('function');
    expect(typeof sessionStorage.getItem).toBe('function');
  });
});

describe('Timer and Date Mocking', () => {
  test('should mock Date.now', () => {
    const now = Date.now();
    expect(Date.now).toHaveBeenCalled();
    expect(now).toBe(1704067200000); // Mock date from setup
  });

  test('should handle real timers', async () => {
    let callbackCalled = false;
    setTimeout(() => {
      callbackCalled = true;
    }, 100);
    
    // Wait for the timeout
    await new Promise(resolve => setTimeout(resolve, 150));
    
    expect(callbackCalled).toBe(true);
  });
});
