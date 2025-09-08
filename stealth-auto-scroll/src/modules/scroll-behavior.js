/**
 * Scroll Behavior Module - Stealth Extension
 * Modular scroll behavior patterns for different scenarios
 */

class ScrollBehaviorModule {
  constructor() {
    this.patterns = {
      reading: this.createReadingPattern(),
      browsing: this.createBrowsingPattern(),
      shopping: this.createShoppingPattern(),
      social: this.createSocialPattern()
    };
  }

  /**
   * Reading pattern - slow, deliberate scrolling
   */
  createReadingPattern() {
    return {
      scrollStep: { min: 30, max: 80 },
      scrollDelay: { min: 800, max: 2000 },
      pauseChance: 0.3,
      pauseDuration: { min: 2000, max: 5000 },
      directionChangeChance: 0.02,
      maxScrollDistance: 5000
    };
  }

  /**
   * Browsing pattern - moderate scrolling
   */
  createBrowsingPattern() {
    return {
      scrollStep: { min: 50, max: 150 },
      scrollDelay: { min: 300, max: 800 },
      pauseChance: 0.15,
      pauseDuration: { min: 1000, max: 3000 },
      directionChangeChance: 0.05,
      maxScrollDistance: 8000
    };
  }

  /**
   * Shopping pattern - quick scanning
   */
  createShoppingPattern() {
    return {
      scrollStep: { min: 100, max: 250 },
      scrollDelay: { min: 200, max: 600 },
      pauseChance: 0.1,
      pauseDuration: { min: 500, max: 2000 },
      directionChangeChance: 0.08,
      maxScrollDistance: 12000
    };
  }

  /**
   * Social media pattern - rapid scrolling
   */
  createSocialPattern() {
    return {
      scrollStep: { min: 80, max: 200 },
      scrollDelay: { min: 150, max: 400 },
      pauseChance: 0.05,
      pauseDuration: { min: 300, max: 1500 },
      directionChangeChance: 0.03,
      maxScrollDistance: 15000
    };
  }

  /**
   * Get pattern based on URL or user preference
   */
  getPattern(url = window.location.href) {
    if (url.includes('amazon') || url.includes('shopee') || url.includes('lazada')) {
      return this.patterns.shopping;
    } else if (url.includes('facebook') || url.includes('twitter') || url.includes('instagram')) {
      return this.patterns.social;
    } else if (url.includes('wikipedia') || url.includes('medium') || url.includes('blog')) {
      return this.patterns.reading;
    } else {
      return this.patterns.browsing;
    }
  }

  /**
   * Generate human-like scroll step
   */
  generateScrollStep(pattern) {
    const baseStep = this.randomBetween(pattern.scrollStep.min, pattern.scrollStep.max);
    
    // Add some variation based on scroll speed
    const speedFactor = Math.min(totalScrolled / 1000, 2);
    return Math.floor(baseStep * (0.8 + speedFactor * 0.2));
  }

  /**
   * Generate human-like delay
   */
  generateDelay(pattern) {
    const baseDelay = this.randomBetween(pattern.scrollDelay.min, pattern.scrollDelay.max);
    
    // Longer delays when scrolling faster
    const speedFactor = Math.min(totalScrolled / 1000, 1);
    return Math.floor(baseDelay * (1 + speedFactor * 0.5));
  }

  /**
   * Check if should pause
   */
  shouldPause(pattern) {
    return Math.random() < pattern.pauseChance;
  }

  /**
   * Check if should change direction
   */
  shouldChangeDirection(pattern) {
    return Math.random() < pattern.directionChangeChance;
  }

  /**
   * Generate random number between min and max
   */
  randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

// Export for use in main script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScrollBehaviorModule;
} else {
  window.ScrollBehaviorModule = ScrollBehaviorModule;
}
