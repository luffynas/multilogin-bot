/**
 * Scroll Behavior Module - Stealth Extension
 * Modular scroll behavior patterns for different reader variants
 * Integrated with Reader Variant System
 */

class ScrollBehaviorModule {
  constructor() {
    this.patterns = {
      // Reader Variant Patterns
      deepDiver: this.createDeepDiverPattern(),
      practicalScanner: this.createPracticalScannerPattern(),
      curiousExplorer: this.createCuriousExplorerPattern(),
      comparativeResearcher: this.createComparativeResearcherPattern(),
      focusedSkimmer: this.createFocusedSkimmerPattern(),
      
      // Legacy patterns for backward compatibility
      reading: this.createReadingPattern(),
      browsing: this.createBrowsingPattern(),
      shopping: this.createShoppingPattern(),
      social: this.createSocialPattern()
    };
    
    this.currentVariant = null;
    this.totalScrolled = 0;
  }

  /**
   * Deep Diver pattern - slow, deliberate scrolling for thorough reading
   */
  createDeepDiverPattern() {
    return {
      scrollStep: { min: 20, max: 50 },
      scrollDelay: { min: 1000, max: 2500 },
      pauseChance: 0.3,
      pauseDuration: { min: 2000, max: 5000 },
      directionChangeChance: 0.02,
      maxScrollDistance: 5000,
      description: 'Slow, deliberate scrolling for deep reading and comprehension'
    };
  }

  /**
   * Practical Scanner pattern - fast scrolling to find solutions quickly
   */
  createPracticalScannerPattern() {
    return {
      scrollStep: { min: 50, max: 120 },
      scrollDelay: { min: 300, max: 800 },
      pauseChance: 0.1,
      pauseDuration: { min: 500, max: 1500 },
      directionChangeChance: 0.05,
      maxScrollDistance: 8000,
      description: 'Fast scrolling to quickly find solutions and practical information'
    };
  }

  /**
   * Curious Explorer pattern - moderate scrolling with exploration pauses
   */
  createCuriousExplorerPattern() {
    return {
      scrollStep: { min: 30, max: 80 },
      scrollDelay: { min: 600, max: 1200 },
      pauseChance: 0.25,
      pauseDuration: { min: 1000, max: 3000 },
      directionChangeChance: 0.08,
      maxScrollDistance: 10000,
      description: 'Moderate scrolling with pauses for exploration and discovery'
    };
  }

  /**
   * Comparative Researcher pattern - methodical scrolling for data analysis
   */
  createComparativeResearcherPattern() {
    return {
      scrollStep: { min: 25, max: 60 },
      scrollDelay: { min: 800, max: 1500 },
      pauseChance: 0.2,
      pauseDuration: { min: 1500, max: 4000 },
      directionChangeChance: 0.03,
      maxScrollDistance: 6000,
      description: 'Methodical scrolling for thorough data analysis and comparison'
    };
  }

  /**
   * Focused Skimmer pattern - very fast scrolling for quick overview
   */
  createFocusedSkimmerPattern() {
    return {
      scrollStep: { min: 80, max: 150 },
      scrollDelay: { min: 200, max: 500 },
      pauseChance: 0.05,
      pauseDuration: { min: 300, max: 800 },
      directionChangeChance: 0.01,
      maxScrollDistance: 15000,
      description: 'Very fast scrolling for quick content overview and key points'
    };
  }

  /**
   * Reading pattern - slow, deliberate scrolling (legacy)
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
   * Get pattern based on reader variant or URL
   * @param {string} variant - Reader variant (deepDiver, practicalScanner, etc.)
   * @param {string} url - Current URL
   */
  getPattern(variant = null, url = window.location.href) {
    // Priority 1: Use reader variant if specified
    if (variant && this.patterns[variant]) {
      this.currentVariant = variant;
      console.log(`ScrollBehavior: Using ${variant} pattern - ${this.patterns[variant].description}`);
      return this.patterns[variant];
    }
    
    // Priority 2: Use current variant if set
    if (this.currentVariant && this.patterns[this.currentVariant]) {
      console.log(`ScrollBehavior: Using current variant ${this.currentVariant} pattern`);
      return this.patterns[this.currentVariant];
    }
    
    // Priority 3: Auto-detect based on URL (legacy behavior)
    if (url.includes('amazon') || url.includes('shopee') || url.includes('lazada')) {
      console.log('ScrollBehavior: Auto-detected shopping pattern');
      return this.patterns.shopping;
    } else if (url.includes('facebook') || url.includes('twitter') || url.includes('instagram')) {
      console.log('ScrollBehavior: Auto-detected social pattern');
      return this.patterns.social;
    } else if (url.includes('wikipedia') || url.includes('medium') || url.includes('blog')) {
      console.log('ScrollBehavior: Auto-detected reading pattern');
      return this.patterns.reading;
    } else {
      console.log('ScrollBehavior: Using default browsing pattern');
      return this.patterns.browsing;
    }
  }

  /**
   * Set current reader variant
   * @param {string} variant - Reader variant
   */
  setVariant(variant) {
    if (this.patterns[variant]) {
      this.currentVariant = variant;
      console.log(`ScrollBehavior: Variant set to ${variant}`);
    } else {
      console.warn(`ScrollBehavior: Unknown variant ${variant}`);
    }
  }

  /**
   * Get current variant
   */
  getCurrentVariant() {
    return this.currentVariant;
  }

  /**
   * Generate human-like scroll step
   */
  generateScrollStep(pattern) {
    const baseStep = this.randomBetween(pattern.scrollStep.min, pattern.scrollStep.max);
    
    // Add some variation based on scroll speed
    const speedFactor = Math.min(this.totalScrolled / 1000, 2);
    return Math.floor(baseStep * (0.8 + speedFactor * 0.2));
  }

  /**
   * Generate human-like delay
   */
  generateDelay(pattern) {
    const baseDelay = this.randomBetween(pattern.scrollDelay.min, pattern.scrollDelay.max);
    
    // Longer delays when scrolling faster
    const speedFactor = Math.min(this.totalScrolled / 1000, 1);
    return Math.floor(baseDelay * (1 + speedFactor * 0.5));
  }

  /**
   * Update total scrolled distance
   * @param {number} distance - Distance scrolled
   */
  updateTotalScrolled(distance) {
    this.totalScrolled += Math.abs(distance);
  }

  /**
   * Reset scroll tracking
   */
  resetScrollTracking() {
    this.totalScrolled = 0;
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

  /**
   * Get pattern information for debugging
   * @param {string} variant - Variant name
   */
  getPatternInfo(variant = null) {
    const pattern = variant ? this.patterns[variant] : this.getPattern();
    return {
      variant: variant || this.currentVariant,
      scrollStep: pattern.scrollStep,
      scrollDelay: pattern.scrollDelay,
      pauseChance: pattern.pauseChance,
      pauseDuration: pattern.pauseDuration,
      directionChangeChance: pattern.directionChangeChance,
      maxScrollDistance: pattern.maxScrollDistance,
      description: pattern.description || 'No description available',
      totalScrolled: this.totalScrolled
    };
  }

  /**
   * Get all available patterns
   */
  getAllPatterns() {
    return Object.keys(this.patterns).map(key => ({
      name: key,
      ...this.patterns[key]
    }));
  }

  /**
   * Check if pattern exists
   * @param {string} variant - Variant name
   */
  hasPattern(variant) {
    return this.patterns.hasOwnProperty(variant);
  }

  /**
   * Get pattern statistics
   */
  getPatternStats() {
    const stats = {};
    Object.keys(this.patterns).forEach(key => {
      const pattern = this.patterns[key];
      stats[key] = {
        avgScrollStep: (pattern.scrollStep.min + pattern.scrollStep.max) / 2,
        avgScrollDelay: (pattern.scrollDelay.min + pattern.scrollDelay.max) / 2,
        pauseChance: pattern.pauseChance,
        maxDistance: pattern.maxScrollDistance
      };
    });
    return stats;
  }

  /**
   * Integrate with Reader Variant System
   * This method is called by the Reader Variant System to set the variant
   */
  integrateWithReaderVariantSystem() {
    // Listen for variant changes from the reader variant system
    if (window.readerVariantSystem) {
      // Set up event listener for variant changes
      window.addEventListener('reader-variant-changed', (event) => {
        const newVariant = event.detail.variant;
        this.setVariant(newVariant);
        console.log(`ScrollBehavior: Integrated with Reader Variant System - variant changed to ${newVariant}`);
      });
    }
  }
}

// Export for use in main script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ScrollBehaviorModule;
} else {
  window.ScrollBehaviorModule = ScrollBehaviorModule;
}
