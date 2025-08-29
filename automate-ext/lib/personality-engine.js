/**
 * Personality Engine - Generates and manages user personalities
 * Implements personality types: Explorer, Researcher, Casual, Professional
 */

class PersonalityEngine {
    constructor() {
        this.personalityTypes = {
            EXPLORER: 'explorer',
            RESEARCHER: 'researcher', 
            CASUAL: 'casual',
            PROFESSIONAL: 'professional'
        };
        
        this.currentPersonality = null;
        this.personalityWeights = {
            explorer: 0.25,    // Balanced distribution
            researcher: 0.25,  // Balanced distribution
            casual: 0.25,      // Balanced distribution
            professional: 0.25 // Balanced distribution
        };
    }

    /**
     * Generate user personality based on weights
     */
    generateUserPersonality() {
        const random = Math.random();
        let cumulativeWeight = 0;
        
        for (const [type, weight] of Object.entries(this.personalityWeights)) {
            cumulativeWeight += weight;
            if (random <= cumulativeWeight) {
                this.currentPersonality = this.createPersonality(type);
                return this.currentPersonality;
            }
        }
        
        // Fallback to explorer
        this.currentPersonality = this.createPersonality('explorer');
        return this.currentPersonality;
    }

    /**
     * Create detailed personality object
     */
    createPersonality(type) {
        const basePersonality = {
            type: type,
            timestamp: Date.now(),
            sessionId: this.generateSessionId()
        };

        switch (type) {
            case 'explorer':
                return {
                    ...basePersonality,
                    navigationStyle: 'high',
                    readingSpeed: 'fast',
                    attentionSpan: 'medium',
                    engagementLevel: 'high',
                    dwellTime: { min: 30, max: 120 },
                    scrollBehavior: 'continuous',
                    clickProbability: 0.12, // Reduced to 12%
                    hoverProbability: 0.8,
                    tabSwitching: 'frequent',
                    searchBehavior: 'broad'
                };

            case 'researcher':
                return {
                    ...basePersonality,
                    navigationStyle: 'deep',
                    readingSpeed: 'slow',
                    attentionSpan: 'long',
                    engagementLevel: 'very_high',
                    dwellTime: { min: 120, max: 300 },
                    scrollBehavior: 'analytical',
                    clickProbability: 0.15, // Reduced to 15%
                    hoverProbability: 0.6,
                    tabSwitching: 'rare',
                    searchBehavior: 'specific'
                };

            case 'casual':
                return {
                    ...basePersonality,
                    navigationStyle: 'low',
                    readingSpeed: 'medium',
                    attentionSpan: 'short',
                    engagementLevel: 'low',
                    dwellTime: { min: 15, max: 60 },
                    scrollBehavior: 'quick',
                    clickProbability: 0.08, // Reduced to 8%
                    hoverProbability: 0.4,
                    tabSwitching: 'moderate',
                    searchBehavior: 'general'
                };

            case 'professional':
                return {
                    ...basePersonality,
                    navigationStyle: 'systematic',
                    readingSpeed: 'medium',
                    attentionSpan: 'long',
                    engagementLevel: 'high',
                    dwellTime: { min: 60, max: 180 },
                    scrollBehavior: 'methodical',
                    clickProbability: 0.10, // Reduced to 10%
                    hoverProbability: 0.5,
                    tabSwitching: 'strategic',
                    searchBehavior: 'targeted'
                };

            default:
                return this.createPersonality('explorer');
        }
    }

    /**
     * Adjust behavior based on personality
     */
    adjustBehaviorByPersonality(behaviorType, baseValue) {
        if (!this.currentPersonality) {
            this.generateUserPersonality();
        }

        const personality = this.currentPersonality;
        let adjustment = 1.0;

        switch (behaviorType) {
            case 'click_delay':
                adjustment = personality.readingSpeed === 'slow' ? 1.5 : 
                           personality.readingSpeed === 'fast' ? 0.7 : 1.0;
                break;

            case 'scroll_speed':
                adjustment = personality.scrollBehavior === 'quick' ? 0.5 :
                           personality.scrollBehavior === 'analytical' ? 2.0 : 1.0;
                break;

            case 'dwell_time':
                adjustment = personality.dwellTime.max / 120; // Normalize to 120s
                break;

            case 'click_probability':
                adjustment = personality.clickProbability;
                break;

            case 'hover_probability':
                adjustment = personality.hoverProbability;
                break;

            case 'attention_span':
                adjustment = personality.attentionSpan === 'long' ? 2.0 :
                           personality.attentionSpan === 'short' ? 0.5 : 1.0;
                break;
        }

        return baseValue * adjustment;
    }

    /**
     * Get personality-specific behavior patterns
     */
    getBehaviorPatterns() {
        if (!this.currentPersonality) {
            this.generateUserPersonality();
        }

        return {
            mouseMovement: this.getMouseMovementPattern(),
            scrolling: this.getScrollingPattern(),
            clicking: this.getClickingPattern(),
            reading: this.getReadingPattern(),
            navigation: this.getNavigationPattern()
        };
    }

    getMouseMovementPattern() {
        const personality = this.currentPersonality;
        
        return {
            speed: personality.type === 'casual' ? 'fast' : 
                   personality.type === 'researcher' ? 'slow' : 'medium',
            precision: personality.type === 'professional' ? 'high' : 'medium',
            hoverTime: personality.hoverProbability > 0.7 ? 'long' : 'short',
            pathType: personality.type === 'explorer' ? 'curved' : 'direct'
        };
    }

    getScrollingPattern() {
        const personality = this.currentPersonality;
        
        return {
            speed: personality.scrollBehavior === 'quick' ? 'fast' :
                   personality.scrollBehavior === 'analytical' ? 'slow' : 'medium',
            pauseFrequency: personality.attentionSpan === 'long' ? 'high' : 'low',
            scrollDistance: personality.type === 'explorer' ? 'large' : 'medium',
            direction: 'mixed'
        };
    }

    getClickingPattern() {
        const personality = this.currentPersonality;
        
        return {
            frequency: personality.clickProbability > 0.7 ? 'high' : 'low',
            precision: personality.type === 'professional' ? 'high' : 'medium',
            doubleClickProbability: personality.type === 'casual' ? 0.1 : 0.05,
            clickDelay: personality.readingSpeed === 'slow' ? 'long' : 'short'
        };
    }

    getReadingPattern() {
        const personality = this.currentPersonality;
        
        return {
            speed: personality.readingSpeed,
            comprehension: personality.type === 'researcher' ? 'high' : 'medium',
            selectionProbability: personality.type === 'researcher' ? 0.8 : 0.3,
            reReadingProbability: personality.attentionSpan === 'long' ? 0.6 : 0.2
        };
    }

    getNavigationPattern() {
        const personality = this.currentPersonality;
        
        return {
            style: personality.navigationStyle,
            tabUsage: personality.tabSwitching,
            backForwardUsage: personality.type === 'explorer' ? 'high' : 'low',
            bookmarkUsage: personality.type === 'professional' ? 'high' : 'low',
            searchUsage: personality.searchBehavior
        };
    }

    /**
     * Generate session ID
     */
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Get current personality
     */
    getCurrentPersonality() {
        if (!this.currentPersonality) {
            this.generateUserPersonality();
        }
        return this.currentPersonality;
    }

    /**
     * Update personality weights
     */
    updatePersonalityWeights(weights) {
        this.personalityWeights = { ...this.personalityWeights, ...weights };
    }

    /**
     * Save personality to stealth storage
     */
    async savePersonality() {
        if (this.currentPersonality) {
            // Use stealth storage instead of chrome storage
            const stealthStorage = new (window._stealth_storage || StealthStorage)();
            stealthStorage.set('currentPersonality', this.currentPersonality);
        }
    }

    /**
     * Load personality from stealth storage
     */
    async loadPersonality() {
        // Use stealth storage instead of chrome storage
        const stealthStorage = new (window._stealth_storage || StealthStorage)();
        const currentPersonality = stealthStorage.get('currentPersonality');
        if (currentPersonality) {
            this.currentPersonality = currentPersonality;
            return this.currentPersonality;
        }
        return null;
    }
}

// Export for use in other modules with enhanced stealth protection
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PersonalityEngine;
} else if (typeof window !== 'undefined' && !window.PersonalityEngine) {
    window.PersonalityEngine = PersonalityEngine;
}
