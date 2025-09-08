/**
 * URL Analyzer Module - Stealth Extension
 * Analyzes URLs to determine appropriate behavior patterns
 */

class URLAnalyzerModule {
  constructor() {
    this.domainPatterns = {
      // E-commerce sites
      shopping: [
        'amazon', 'shopee', 'lazada', 'tokopedia', 'bukalapak',
        'ebay', 'alibaba', 'aliexpress', 'wish', 'etsy'
      ],
      
      // Social media
      social: [
        'facebook', 'twitter', 'instagram', 'linkedin', 'tiktok',
        'youtube', 'reddit', 'pinterest', 'snapchat'
      ],
      
      // News and content
      reading: [
        'wikipedia', 'medium', 'blog', 'news', 'article',
        'cnn', 'bbc', 'reuters', 'nytimes', 'guardian'
      ],
      
      // Banking and finance
      banking: [
        'bank', 'paypal', 'stripe', 'square', 'venmo',
        'chase', 'wells', 'bofa', 'citi'
      ],
      
      // Streaming and entertainment
      entertainment: [
        'netflix', 'youtube', 'twitch', 'spotify', 'hulu',
        'disney', 'prime', 'hbo'
      ],
      
      // Professional and business
      professional: [
        'linkedin', 'indeed', 'glassdoor', 'monster',
        'salesforce', 'hubspot', 'slack'
      ]
    };

    this.riskLevels = {
      low: ['wikipedia', 'medium', 'blog', 'news'],
      medium: ['amazon', 'shopee', 'lazada', 'facebook', 'twitter'],
      high: ['bank', 'paypal', 'chase', 'wells', 'bofa']
    };
  }

  /**
   * Analyze URL and return site type
   */
  analyzeURL(url = window.location.href) {
    const domain = this.extractDomain(url);
    const path = this.extractPath(url);
    
    return {
      domain: domain,
      path: path,
      siteType: this.getSiteType(domain, path),
      riskLevel: this.getRiskLevel(domain),
      recommendations: this.getRecommendations(domain, path)
    };
  }

  /**
   * Extract domain from URL
   */
  extractDomain(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.toLowerCase();
    } catch (e) {
      return '';
    }
  }

  /**
   * Extract path from URL
   */
  extractPath(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname.toLowerCase();
    } catch (e) {
      return '';
    }
  }

  /**
   * Determine site type based on domain and path
   */
  getSiteType(domain, path) {
    // Check domain patterns
    for (const [type, patterns] of Object.entries(this.domainPatterns)) {
      if (patterns.some(pattern => domain.includes(pattern))) {
        return type;
      }
    }

    // Check path patterns
    if (path.includes('/product/') || path.includes('/item/')) {
      return 'shopping';
    } else if (path.includes('/post/') || path.includes('/status/')) {
      return 'social';
    } else if (path.includes('/article/') || path.includes('/blog/')) {
      return 'reading';
    } else if (path.includes('/account/') || path.includes('/profile/')) {
      return 'banking';
    }

    return 'browsing';
  }

  /**
   * Get risk level for domain
   */
  getRiskLevel(domain) {
    for (const [level, patterns] of Object.entries(this.riskLevels)) {
      if (patterns.some(pattern => domain.includes(pattern))) {
        return level;
      }
    }
    return 'low';
  }

  /**
   * Get behavior recommendations
   */
  getRecommendations(domain, path) {
    const siteType = this.getSiteType(domain, path);
    const riskLevel = this.getRiskLevel(domain);

    const recommendations = {
      scrollBehavior: this.getScrollBehavior(siteType, riskLevel),
      timing: this.getTimingRecommendations(riskLevel),
      interactions: this.getInteractionRecommendations(siteType, riskLevel),
      stealth: this.getStealthRecommendations(riskLevel)
    };

    return recommendations;
  }

  /**
   * Get scroll behavior recommendations
   */
  getScrollBehavior(siteType, riskLevel) {
    const behaviors = {
      shopping: {
        low: { step: { min: 100, max: 250 }, delay: { min: 200, max: 600 } },
        medium: { step: { min: 80, max: 200 }, delay: { min: 300, max: 800 } },
        high: { step: { min: 50, max: 150 }, delay: { min: 500, max: 1200 } }
      },
      social: {
        low: { step: { min: 80, max: 200 }, delay: { min: 150, max: 400 } },
        medium: { step: { min: 60, max: 150 }, delay: { min: 250, max: 600 } },
        high: { step: { min: 40, max: 120 }, delay: { min: 400, max: 1000 } }
      },
      reading: {
        low: { step: { min: 30, max: 80 }, delay: { min: 800, max: 2000 } },
        medium: { step: { min: 25, max: 60 }, delay: { min: 1000, max: 2500 } },
        high: { step: { min: 20, max: 50 }, delay: { min: 1500, max: 3000 } }
      },
      banking: {
        low: { step: { min: 20, max: 50 }, delay: { min: 1000, max: 3000 } },
        medium: { step: { min: 15, max: 40 }, delay: { min: 1500, max: 4000 } },
        high: { step: { min: 10, max: 30 }, delay: { min: 2000, max: 5000 } }
      },
      browsing: {
        low: { step: { min: 50, max: 150 }, delay: { min: 300, max: 800 } },
        medium: { step: { min: 40, max: 120 }, delay: { min: 400, max: 1000 } },
        high: { step: { min: 30, max: 100 }, delay: { min: 600, max: 1500 } }
      }
    };

    return behaviors[siteType]?.[riskLevel] || behaviors.browsing.low;
  }

  /**
   * Get timing recommendations
   */
  getTimingRecommendations(riskLevel) {
    const timings = {
      low: { pauseChance: 0.1, pauseDuration: { min: 1000, max: 3000 } },
      medium: { pauseChance: 0.2, pauseDuration: { min: 1500, max: 4000 } },
      high: { pauseChance: 0.3, pauseDuration: { min: 2000, max: 5000 } }
    };

    return timings[riskLevel] || timings.low;
  }

  /**
   * Get interaction recommendations
   */
  getInteractionRecommendations(siteType, riskLevel) {
    const interactions = {
      shopping: {
        low: { mouseMovement: 0.1, clicks: 0.05 },
        medium: { mouseMovement: 0.15, clicks: 0.08 },
        high: { mouseMovement: 0.2, clicks: 0.12 }
      },
      social: {
        low: { mouseMovement: 0.05, clicks: 0.02 },
        medium: { mouseMovement: 0.1, clicks: 0.05 },
        high: { mouseMovement: 0.15, clicks: 0.08 }
      },
      reading: {
        low: { mouseMovement: 0.02, clicks: 0.01 },
        medium: { mouseMovement: 0.05, clicks: 0.02 },
        high: { mouseMovement: 0.08, clicks: 0.03 }
      },
      banking: {
        low: { mouseMovement: 0.01, clicks: 0.005 },
        medium: { mouseMovement: 0.02, clicks: 0.01 },
        high: { mouseMovement: 0.03, clicks: 0.015 }
      },
      browsing: {
        low: { mouseMovement: 0.05, clicks: 0.02 },
        medium: { mouseMovement: 0.08, clicks: 0.03 },
        high: { mouseMovement: 0.12, clicks: 0.05 }
      }
    };

    return interactions[siteType]?.[riskLevel] || interactions.browsing.low;
  }

  /**
   * Get stealth recommendations
   */
  getStealthRecommendations(riskLevel) {
    const stealth = {
      low: { directionChanges: 0.05, randomPauses: 0.1 },
      medium: { directionChanges: 0.08, randomPauses: 0.15 },
      high: { directionChanges: 0.12, randomPauses: 0.2 }
    };

    return stealth[riskLevel] || stealth.low;
  }
}

// Export for use in main script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = URLAnalyzerModule;
} else {
  window.URLAnalyzerModule = URLAnalyzerModule;
}
