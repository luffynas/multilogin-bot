/**
 * Realistic DOM Helper
 * Provides utilities for testing with realistic DOM structure
 */

import { createTestElements, simulateUserInteractions } from './jsdom-setup.js';

/**
 * Enhanced test utilities for realistic DOM testing
 */
export const realisticDOMHelper = {
  /**
   * Get realistic test elements
   */
  getTestElements: () => {
    return createTestElements();
  },

  /**
   * Create realistic scroll scenario
   */
  createScrollScenario: (scrollDistance = 500) => {
    const elements = createTestElements();
    
    // Simulate scrolling through the page
    const scrollSteps = 10;
    const stepDistance = scrollDistance / scrollSteps;
    
    for (let i = 0; i < scrollSteps; i++) {
      setTimeout(() => {
        global.window.scrollY += stepDistance;
        const scrollEvent = new global.window.Event('scroll');
        global.window.dispatchEvent(scrollEvent);
      }, i * 100);
    }
    
    return elements;
  },

  /**
   * Simulate realistic user browsing behavior
   */
  simulateBrowsingBehavior: () => {
    const elements = createTestElements();
    
    // Simulate mouse movements
    simulateUserInteractions();
    
    // Simulate clicking on navigation links
    elements.navLinks.forEach((link, index) => {
      setTimeout(() => {
        const clickEvent = new global.window.MouseEvent('click', {
          bubbles: true,
          cancelable: true
        });
        link.dispatchEvent(clickEvent);
      }, index * 200);
    });
    
    // Simulate hovering over products
    elements.productCards.forEach((card, index) => {
      setTimeout(() => {
        const hoverEvent = new global.window.MouseEvent('mouseover', {
          bubbles: true
        });
        card.dispatchEvent(hoverEvent);
      }, index * 300);
    });
    
    return elements;
  },

  /**
   * Create realistic ad interaction scenario
   */
  createAdInteractionScenario: () => {
    const elements = createTestElements();
    
    // Simulate ad interactions
    elements.adContainers.forEach((ad, index) => {
      setTimeout(() => {
        // Simulate ad visibility
        const intersectionEvent = new global.window.Event('intersectionchange');
        ad.dispatchEvent(intersectionEvent);
        
        // Simulate ad click
        const clickEvent = new global.window.MouseEvent('click', {
          bubbles: true,
          cancelable: true
        });
        ad.dispatchEvent(clickEvent);
      }, index * 500);
    });
    
    return elements;
  },

  /**
   * Create realistic mobile browsing scenario
   */
  createMobileBrowsingScenario: () => {
    // Simulate mobile viewport
    Object.defineProperty(global.window, 'innerWidth', {
      value: 375,
      writable: true,
      configurable: true
    });
    
    Object.defineProperty(global.window, 'innerHeight', {
      value: 667,
      writable: true,
      configurable: true
    });
    
    Object.defineProperty(global.screen, 'width', {
      value: 375,
      writable: true,
      configurable: true
    });
    
    Object.defineProperty(global.screen, 'height', {
      value: 667,
      writable: true,
      configurable: true
    });
    
    Object.defineProperty(global.navigator, 'maxTouchPoints', {
      value: 5,
      writable: true,
      configurable: true
    });
    
    const elements = createTestElements();
    
    // Simulate touch events
    elements.productCards.forEach((card, index) => {
      setTimeout(() => {
        const touchStartEvent = new global.window.TouchEvent('touchstart', {
          bubbles: true,
          touches: [{
            clientX: 100,
            clientY: 100,
            target: card
          }]
        });
        card.dispatchEvent(touchStartEvent);
        
        const touchEndEvent = new global.window.TouchEvent('touchend', {
          bubbles: true,
          touches: []
        });
        card.dispatchEvent(touchEndEvent);
      }, index * 200);
    });
    
    return elements;
  },

  /**
   * Create realistic e-commerce browsing scenario
   */
  createEcommerceScenario: () => {
    const elements = createTestElements();
    
    // Simulate product browsing
    elements.productCards.forEach((card, index) => {
      setTimeout(() => {
        // Hover over product
        const hoverEvent = new global.window.MouseEvent('mouseover', {
          bubbles: true
        });
        card.dispatchEvent(hoverEvent);
        
        // Click on product
        const clickEvent = new global.window.MouseEvent('click', {
          bubbles: true,
          cancelable: true
        });
        card.dispatchEvent(clickEvent);
        
        // Simulate add to cart
        const addToCartEvent = new global.window.CustomEvent('addToCart', {
          bubbles: true,
          detail: { productId: `product-${index}` }
        });
        card.dispatchEvent(addToCartEvent);
      }, index * 300);
    });
    
    return elements;
  },

  /**
   * Create realistic news browsing scenario
   */
  createNewsBrowsingScenario: () => {
    const elements = createTestElements();
    
    // Simulate reading blog posts
    elements.blogPosts.forEach((post, index) => {
      setTimeout(() => {
        // Scroll to post
        post.scrollIntoView();
        
        // Simulate reading time
        const readingTime = 2000 + (index * 500);
        setTimeout(() => {
          // Simulate post interaction
          const interactionEvent = new global.window.CustomEvent('postInteraction', {
            bubbles: true,
            detail: { postId: `post-${index}`, timeSpent: readingTime }
          });
          post.dispatchEvent(interactionEvent);
        }, readingTime);
      }, index * 1000);
    });
    
    return elements;
  },

  /**
   * Create realistic corporate website scenario
   */
  createCorporateScenario: () => {
    const elements = createTestElements();
    
    // Simulate navigation through corporate sections
    elements.navLinks.forEach((link, index) => {
      setTimeout(() => {
        // Simulate navigation click
        const clickEvent = new global.window.MouseEvent('click', {
          bubbles: true,
          cancelable: true
        });
        link.dispatchEvent(clickEvent);
        
        // Simulate page load
        const loadEvent = new global.window.Event('load');
        global.window.dispatchEvent(loadEvent);
        
        // Simulate feature exploration
        elements.featureItems.forEach((feature, featureIndex) => {
          setTimeout(() => {
            const hoverEvent = new global.window.MouseEvent('mouseover', {
              bubbles: true
            });
            feature.dispatchEvent(hoverEvent);
          }, featureIndex * 100);
        });
      }, index * 2000);
    });
    
    return elements;
  },

  /**
   * Measure realistic performance metrics
   */
  measurePerformance: (scenarioFunction) => {
    const startTime = performance.now();
    const startMemory = process.memoryUsage();
    
    const elements = scenarioFunction();
    
    const endTime = performance.now();
    const endMemory = process.memoryUsage();
    
    return {
      executionTime: endTime - startTime,
      memoryUsage: {
        heapUsed: endMemory.heapUsed - startMemory.heapUsed,
        heapTotal: endMemory.heapTotal - startMemory.heapTotal,
        external: endMemory.external - startMemory.external
      },
      elements: elements
    };
  },

  /**
   * Create realistic error scenario
   */
  createErrorScenario: () => {
    const elements = createTestElements();
    
    // Simulate network errors
    setTimeout(() => {
      const errorEvent = new global.window.ErrorEvent('error', {
        bubbles: true,
        message: 'Network error',
        filename: 'test.js',
        lineno: 1,
        colno: 1
      });
      global.window.dispatchEvent(errorEvent);
    }, 1000);
    
    // Simulate JavaScript errors
    setTimeout(() => {
      const errorEvent = new global.window.ErrorEvent('error', {
        bubbles: true,
        message: 'Script error',
        filename: 'script.js',
        lineno: 10,
        colno: 5
      });
      global.window.dispatchEvent(errorEvent);
    }, 2000);
    
    return elements;
  },

  /**
   * Create realistic multi-tab scenario
   */
  createMultiTabScenario: () => {
    const elements = createTestElements();
    
    // Simulate opening new tabs
    const newTabEvent = new global.window.CustomEvent('newTab', {
      bubbles: true,
      detail: { url: 'https://example.com/new-tab' }
    });
    global.window.dispatchEvent(newTabEvent);
    
    // Simulate tab switching
    const tabSwitchEvent = new global.window.CustomEvent('tabSwitch', {
      bubbles: true,
      detail: { tabId: 2 }
    });
    global.window.dispatchEvent(tabSwitchEvent);
    
    // Simulate tab focus/blur
    const focusEvent = new global.window.Event('focus');
    global.window.dispatchEvent(focusEvent);
    
    setTimeout(() => {
      const blurEvent = new global.window.Event('blur');
      global.window.dispatchEvent(blurEvent);
    }, 1000);
    
    return elements;
  }
};

export default realisticDOMHelper;
