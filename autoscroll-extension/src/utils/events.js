/**
 * Event utilities for creating and dispatching natural events
 */

/**
 * Create a natural wheel event
 * @param {Object} options - Event options
 * @returns {WheelEvent} - Wheel event
 */
export function createWheelEvent(options = {}) {
  const defaultOptions = {
    deltaX: 0,
    deltaY: 100,
    deltaZ: 0,
    deltaMode: 0,
    bubbles: true,
    cancelable: true
  };
  
  const eventOptions = { ...defaultOptions, ...options };
  
  return new WheelEvent('wheel', eventOptions);
}

/**
 * Create a natural touch event
 * @param {string} type - Touch event type
 * @param {Object} options - Event options
 * @returns {TouchEvent} - Touch event
 */
export function createTouchEvent(type, options = {}) {
  try {
    // Check if TouchEvent is supported
    if (typeof TouchEvent === 'undefined') {
      console.warn('TouchEvent not supported, using fallback');
      return createTouchEventFallback(type, options);
    }

    const defaultOptions = {
      touches: [],
      targetTouches: [],
      changedTouches: [],
      bubbles: true,
      cancelable: true
    };
    
    const eventOptions = { ...defaultOptions, ...options };
    
    // Try to create TouchEvent with minimal options first
    try {
      return new TouchEvent(type, {
        bubbles: eventOptions.bubbles,
        cancelable: eventOptions.cancelable
      });
    } catch (minimalError) {
      console.warn('TouchEvent with minimal options failed, trying with touch data');
      
      // Convert touch arrays to proper Touch objects if they contain touch data
      if (eventOptions.touches && eventOptions.touches.length > 0) {
        eventOptions.touches = eventOptions.touches.map(touch => createTouchObject(touch));
      }
      if (eventOptions.targetTouches && eventOptions.targetTouches.length > 0) {
        eventOptions.targetTouches = eventOptions.targetTouches.map(touch => createTouchObject(touch));
      }
      if (eventOptions.changedTouches && eventOptions.changedTouches.length > 0) {
        eventOptions.changedTouches = eventOptions.changedTouches.map(touch => createTouchObject(touch));
      }
      
      return new TouchEvent(type, eventOptions);
    }
  } catch (error) {
    console.error('Error creating TouchEvent:', error);
    // Fallback: create a custom touch event
    return createTouchEventFallback(type, options);
  }
}

/**
 * Create a Touch object
 * @param {Object} touchData - Touch data
 * @returns {Object} - Touch object
 */
function createTouchObject(touchData) {
  return {
    identifier: touchData.identifier || Date.now() + Math.random(),
    target: touchData.target || document.body,
    clientX: touchData.clientX || 0,
    clientY: touchData.clientY || 0,
    screenX: touchData.screenX || 0,
    screenY: touchData.screenY || 0,
    pageX: touchData.pageX || 0,
    pageY: touchData.pageY || 0,
    radiusX: touchData.radiusX || 0,
    radiusY: touchData.radiusY || 0,
    rotationAngle: touchData.rotationAngle || 0,
    force: touchData.force || 0
  };
}

/**
 * Create a fallback touch event when TouchEvent is not supported
 * @param {string} type - Event type
 * @param {Object} options - Event options
 * @returns {Event} - Fallback event
 */
function createTouchEventFallback(type, options = {}) {
  try {
    // Create a custom event that mimics TouchEvent
    const event = new CustomEvent(type, {
      bubbles: options.bubbles !== false,
      cancelable: options.cancelable !== false,
      detail: {
        touches: options.touches || [],
        targetTouches: options.targetTouches || [],
        changedTouches: options.changedTouches || [],
        type: type,
        timeStamp: Date.now()
      }
    });
    
    // Add TouchEvent-like properties
    event.touches = options.touches || [];
    event.targetTouches = options.targetTouches || [];
    event.changedTouches = options.changedTouches || [];
    event.type = type;
    event.timeStamp = Date.now();
    
    return event;
  } catch (error) {
    console.error('Error creating touch event fallback:', error);
    // Ultimate fallback: simple event
    return new Event(type, { 
      bubbles: options.bubbles !== false, 
      cancelable: options.cancelable !== false 
    });
  }
}

/**
 * Create a natural mouse event
 * @param {string} type - Mouse event type
 * @param {Object} options - Event options
 * @returns {MouseEvent} - Mouse event
 */
export function createMouseEvent(type, options = {}) {
  const defaultOptions = {
    bubbles: true,
    cancelable: true,
    view: window,
    detail: 1,
    screenX: 0,
    screenY: 0,
    clientX: 0,
    clientY: 0,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    button: 0,
    buttons: 1
  };
  
  const eventOptions = { ...defaultOptions, ...options };
  
  return new MouseEvent(type, eventOptions);
}

/**
 * Create a natural pointer event
 * @param {string} type - Pointer event type
 * @param {Object} options - Event options
 * @returns {PointerEvent} - Pointer event
 */
export function createPointerEvent(type, options = {}) {
  const defaultOptions = {
    bubbles: true,
    cancelable: true,
    view: window,
    detail: 1,
    screenX: 0,
    screenY: 0,
    clientX: 0,
    clientY: 0,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    button: 0,
    buttons: 1,
    pointerId: 1,
    pointerType: 'mouse',
    isPrimary: true
  };
  
  const eventOptions = { ...defaultOptions, ...options };
  
  return new PointerEvent(type, eventOptions);
}

/**
 * Dispatch event with natural timing
 * @param {Element} element - Target element
 * @param {Event} event - Event to dispatch
 * @param {number} delay - Delay in ms (default: 0)
 * @returns {Promise<boolean>} - Promise that resolves with dispatch result
 */
export function dispatchEventNatural(element, event, delay = 0) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const result = element.dispatchEvent(event);
      resolve(result);
    }, delay);
  });
}

/**
 * Create and dispatch wheel event with natural properties
 * @param {Element} element - Target element
 * @param {Object} options - Wheel event options
 * @returns {Promise<boolean>} - Promise that resolves with dispatch result
 */
export function dispatchWheelEvent(element, options = {}) {
  const event = createWheelEvent(options);
  return dispatchEventNatural(element, event);
}

/**
 * Create and dispatch touch event with natural properties
 * @param {Element} element - Target element
 * @param {string} type - Touch event type
 * @param {Object} options - Touch event options
 * @returns {Promise<boolean>} - Promise that resolves with dispatch result
 */
export function dispatchTouchEvent(element, type, options = {}) {
  const event = createTouchEvent(type, options);
  return dispatchEventNatural(element, event);
}

/**
 * Create and dispatch mouse event with natural properties
 * @param {Element} element - Target element
 * @param {string} type - Mouse event type
 * @param {Object} options - Mouse event options
 * @returns {Promise<boolean>} - Promise that resolves with dispatch result
 */
export function dispatchMouseEvent(element, type, options = {}) {
  const event = createMouseEvent(type, options);
  return dispatchEventNatural(element, event);
}

/**
 * Create and dispatch pointer event with natural properties
 * @param {Element} element - Target element
 * @param {string} type - Pointer event type
 * @param {Object} options - Pointer event options
 * @returns {Promise<boolean>} - Promise that resolves with dispatch result
 */
export function dispatchPointerEvent(element, type, options = {}) {
  const event = createPointerEvent(type, options);
  return dispatchEventNatural(element, event);
}

/**
 * Simulate natural scroll with multiple wheel events
 * @param {Element} element - Target element
 * @param {number} deltaY - Total scroll delta
 * @param {number} steps - Number of steps (default: 3)
 * @param {number} interval - Interval between steps in ms (default: 16)
 * @returns {Promise<void>} - Promise that resolves when complete
 */
export function simulateNaturalScroll(element, deltaY, steps = 3, interval = 16) {
  const stepDelta = deltaY / steps;
  
  return new Promise((resolve) => {
    let currentStep = 0;
    
    const scrollStep = () => {
      if (currentStep >= steps) {
        resolve();
        return;
      }
      
      const event = createWheelEvent({
        deltaY: stepDelta,
        deltaMode: 0
      });
      
      element.dispatchEvent(event);
      currentStep++;
      
      setTimeout(scrollStep, interval);
    };
    
    scrollStep();
  });
}

/**
 * Simulate natural touch scroll with multiple touch events
 * @param {Element} element - Target element
 * @param {number} startY - Start Y position
 * @param {number} endY - End Y position
 * @param {number} steps - Number of steps (default: 10)
 * @param {number} interval - Interval between steps in ms (default: 16)
 * @returns {Promise<void>} - Promise that resolves when complete
 */
export function simulateNaturalTouchScroll(element, startY, endY, steps = 10, interval = 16) {
  const stepSize = (endY - startY) / steps;
  
  return new Promise((resolve) => {
    let currentStep = 0;
    
    const touchStep = () => {
      if (currentStep >= steps) {
        // End touch
        const touchData = {
          identifier: 1,
          target: element,
          clientX: 0,
          clientY: endY,
          screenX: 0,
          screenY: endY,
          pageX: 0,
          pageY: endY,
          radiusX: 10,
          radiusY: 10,
          rotationAngle: 0,
          force: 1.0
        };
        
        const endEvent = createTouchEvent('touchend', {
          touches: [],
          targetTouches: [],
          changedTouches: [touchData]
        });
        
        element.dispatchEvent(endEvent);
        resolve();
        return;
      }
      
      const currentY = startY + (stepSize * currentStep);
      
      const touchData = {
        identifier: 1,
        target: element,
        clientX: 0,
        clientY: currentY,
        screenX: 0,
        screenY: currentY,
        pageX: 0,
        pageY: currentY,
        radiusX: 10,
        radiusY: 10,
        rotationAngle: 0,
        force: 1.0
      };
      
      if (currentStep === 0) {
        // Start touch
        const startEvent = createTouchEvent('touchstart', {
          touches: [touchData],
          targetTouches: [touchData],
          changedTouches: [touchData]
        });
        
        element.dispatchEvent(startEvent);
      } else {
        // Move touch
        const moveEvent = createTouchEvent('touchmove', {
          touches: [touchData],
          targetTouches: [touchData],
          changedTouches: [touchData]
        });
        
        element.dispatchEvent(moveEvent);
      }
      
      currentStep++;
      setTimeout(touchStep, interval);
    };
    
    touchStep();
  });
}

/**
 * Add event listener with natural event handling
 * @param {Element} element - Target element
 * @param {string} eventType - Event type
 * @param {Function} handler - Event handler
 * @param {Object} options - Event listener options
 */
export function addNaturalEventListener(element, eventType, handler, options = {}) {
  const defaultOptions = {
    passive: true,
    capture: false
  };
  
  const listenerOptions = { ...defaultOptions, ...options };
  
  element.addEventListener(eventType, handler, listenerOptions);
}

/**
 * Remove event listener
 * @param {Element} element - Target element
 * @param {string} eventType - Event type
 * @param {Function} handler - Event handler
 * @param {Object} options - Event listener options
 */
export function removeNaturalEventListener(element, eventType, handler, options = {}) {
  const defaultOptions = {
    passive: true,
    capture: false
  };
  
  const listenerOptions = { ...defaultOptions, ...options };
  
  element.removeEventListener(eventType, handler, listenerOptions);
}
