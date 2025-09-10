/**
 * Personality Engine - Generates and manages user personalities
 * Implements personality types: Explorer, Researcher, Casual, Professional
 * Each personality type has unique behavior patterns that influence automation
 */

class PersonalityEngine {
    constructor() {
        // Define available personality types for user behavior simulation
        this.personalityTypes = {
            EXPLORER: 'explorer',      // Curious, fast-paced, broad navigation
            RESEARCHER: 'researcher',  // Analytical, thorough, deep reading
            CASUAL: 'casual',          // Quick, surface-level, minimal engagement
            PROFESSIONAL: 'professional' // Systematic, efficient, goal-oriented
        };
        
        // Constants for behavior configuration
        this.BEHAVIOR_CONSTANTS = {
            // Dwell time ranges (in seconds)
            DWELL_TIME: {
                EXPLORER: { min: 30, max: 120 },
                RESEARCHER: { min: 120, max: 300 },
                CASUAL: { min: 30, max: 120 },    // Optimized from 15-60s to 30-120s for better RPM
                PROFESSIONAL: { min: 60, max: 180 }
            },
            
            // Click probability ranges (increased for better ad interaction)
            CLICK_PROBABILITY: {
                EXPLORER: 0.25,     // Increased from 0.12
                RESEARCHER: 0.30,   // Increased from 0.15
                CASUAL: 0.25,       // Optimized from 0.20 to 0.25 for higher RPM
                PROFESSIONAL: 0.22  // Increased from 0.10
            },
            
            // Hover probability ranges
            HOVER_PROBABILITY: {
                EXPLORER: 0.8,
                RESEARCHER: 0.6,
                CASUAL: 0.6,        // Optimized from 0.4 to 0.6 for higher engagement
                PROFESSIONAL: 0.5
            },
            
            // Session ID configuration
            SESSION_ID: {
                MAX_LENGTH: 100,
                PREFIX: 'session_',
                FALLBACK_PREFIX: 'session_fallback_'
            }
        };
        
        this.currentPersonality = null;
        
        // Distribution weights for personality generation (balanced 25% each)
        // Higher weights = more likely to be selected during random generation
        this.personalityWeights = {
            explorer: 0.25,    // 25% chance - Balanced distribution
            researcher: 0.25,  // 25% chance - Balanced distribution
            casual: 0.25,      // 25% chance - Balanced distribution
            professional: 0.25 // 25% chance - Balanced distribution
        };
    }

    /**
     * Generate user personality based on weights
     * Uses weighted random selection to choose personality type
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
        
        // Fallback to explorer if no personality selected
        this.currentPersonality = this.createPersonality('explorer');
        return this.currentPersonality;
    }

    /**
     * Create detailed personality object with behavior configurations
     * Each personality type has specific parameters that influence automation behavior
     */
    createPersonality(type) {
        // Validate personality type to prevent injection attacks
        const validatedType = this.validatePersonalityType(type);
        
        const basePersonality = {
            type: validatedType,                    // Personality type identifier
            timestamp: Date.now(),         // When personality was created
            sessionId: this.generateSessionId() // Unique session identifier
        };

        switch (validatedType) {
            case 'explorer':
                return {
                    ...basePersonality,
                    // Navigation behavior - High engagement with multiple pages
                    navigationStyle: 'high',           // Visits many pages, explores broadly
                    readingSpeed: 'fast',              // Quick reading, skims content
                    attentionSpan: 'medium',           // Moderate focus duration
                    engagementLevel: 'high',           // High interaction with content
                    dwellTime: this.BEHAVIOR_CONSTANTS.DWELL_TIME.EXPLORER,  // Use constants
                    scrollBehavior: 'continuous',      // Smooth, uninterrupted scrolling
                    clickProbability: this.BEHAVIOR_CONSTANTS.CLICK_PROBABILITY.EXPLORER,  // Use constants
                    hoverProbability: this.BEHAVIOR_CONSTANTS.HOVER_PROBABILITY.EXPLORER,  // Use constants
                    tabSwitching: 'frequent',          // Often switches between tabs
                    searchBehavior: 'broad'            // Searches for general topics
                };

            case 'researcher':
                return {
                    ...basePersonality,
                    // Navigation behavior - Deep analysis of specific content
                    navigationStyle: 'deep',            // Focuses on specific topics deeply
                    readingSpeed: 'slow',               // Thorough reading, analyzes content
                    attentionSpan: 'long',              // Extended focus duration
                    engagementLevel: 'very_high',       // Very high interaction with content
                    dwellTime: { min: 120, max: 300 },  // 2-5 minutes per page (longer reading)
                    scrollBehavior: 'analytical',       // Pauses to analyze content while scrolling
                    clickProbability: 0.30,             // 30% chance to click ads (highest among personalities)
                    hoverProbability: 0.6,              // 60% chance to hover over elements
                    tabSwitching: 'rare',               // Rarely switches tabs, focuses on current content
                    searchBehavior: 'specific'          // Searches for specific, detailed information
                };

            case 'casual':
                return {
                    ...basePersonality,
                    // Navigation behavior - Optimized for better RPM while maintaining casual nature
                    navigationStyle: 'medium',          // Optimized: Visits moderate pages, balanced exploration
                    readingSpeed: 'medium',             // Moderate reading speed
                    attentionSpan: 'medium',            // Optimized: Extended focus duration for better engagement
                    engagementLevel: 'medium',          // Optimized: Medium interaction with content for higher RPM
                    dwellTime: this.BEHAVIOR_CONSTANTS.DWELL_TIME.CASUAL,  // Use optimized constants (30-120s)
                    scrollBehavior: 'moderate',         // Optimized: Moderate scrolling with some pauses
                    clickProbability: this.BEHAVIOR_CONSTANTS.CLICK_PROBABILITY.CASUAL,  // Use optimized constants (25%)
                    hoverProbability: this.BEHAVIOR_CONSTANTS.HOVER_PROBABILITY.CASUAL,  // Use optimized constants (60%)
                    tabSwitching: 'moderate',           // Moderate tab switching
                    searchBehavior: 'general'           // Searches for general, popular topics
                };

            case 'professional':
                return {
                    ...basePersonality,
                    // Navigation behavior - Systematic, goal-oriented browsing
                    navigationStyle: 'systematic',      // Organized, methodical navigation
                    readingSpeed: 'medium',             // Balanced reading speed
                    attentionSpan: 'long',              // Extended focus duration
                    engagementLevel: 'high',            // High interaction with relevant content
                    dwellTime: { min: 60, max: 180 },   // 1-3 minutes per page (focused reading)
                    scrollBehavior: 'methodical',       // Systematic scrolling with purpose
                    clickProbability: 0.22,             // 22% chance to click ads (moderate)
                    hoverProbability: 0.5,              // 50% chance to hover over elements
                    tabSwitching: 'strategic',          // Strategic tab switching for efficiency
                    searchBehavior: 'targeted'          // Searches for specific, professional topics
                };

            default:
                return this.createPersonality('explorer');
        }
    }

    /**
     * Adjust behavior based on personality characteristics
     * Modifies base values according to personality traits
     */
    adjustBehaviorByPersonality(behaviorType, baseValue) {
        if (!this.currentPersonality) {
            this.generateUserPersonality();
        }

        const personality = this.currentPersonality;
        let adjustment = 1.0; // Default multiplier (no change)

        switch (behaviorType) {
            case 'click_delay':
                // Adjust click delay based on reading speed
                adjustment = personality.readingSpeed === 'slow' ? 1.5 :    // 50% slower for slow readers
                           personality.readingSpeed === 'fast' ? 0.7 : 1.0; // 30% faster for fast readers
                break;

            case 'scroll_speed':
                // Adjust scroll speed based on scroll behavior pattern
                adjustment = personality.scrollBehavior === 'quick' ? 0.5 :        // 50% faster for quick scrollers
                           personality.scrollBehavior === 'analytical' ? 2.0 : 1.0; // 100% slower for analytical scrollers
                break;

            case 'dwell_time':
                // Normalize dwell time to 120 seconds baseline
                adjustment = personality.dwellTime.max / 120;
                break;

            case 'click_probability':
                // Use personality-specific click probability
                adjustment = personality.clickProbability;
                break;

            case 'hover_probability':
                // Use personality-specific hover probability
                adjustment = personality.hoverProbability;
                break;

            case 'attention_span':
                // Adjust based on attention span characteristics
                adjustment = personality.attentionSpan === 'long' ? 2.0 :   // 100% longer for long attention spans
                           personality.attentionSpan === 'short' ? 0.5 : 1.0; // 50% shorter for short attention spans
                break;
        }

        return baseValue * adjustment;
    }

    /**
     * Get personality-specific behavior patterns for automation
     * Returns detailed patterns for mouse, scrolling, clicking, reading, and navigation
     */
    getBehaviorPatterns() {
        if (!this.currentPersonality) {
            this.generateUserPersonality();
        }

        return {
            mouseMovement: this.getMouseMovementPattern(),    // Mouse movement characteristics
            scrolling: this.getScrollingPattern(),            // Scrolling behavior patterns
            clicking: this.getClickingPattern(),              // Clicking behavior patterns
            reading: this.getReadingPattern(),                // Reading behavior patterns
            navigation: this.getNavigationPattern()           // Navigation behavior patterns
        };
    }

    /**
     * Get mouse movement pattern based on personality
     * Influences how mouse moves across the page
     */
    getMouseMovementPattern() {
        const personality = this.currentPersonality;
        
        return {
            speed: personality.type === 'casual' ? 'fast' :           // Fast movement for casual users
                   personality.type === 'researcher' ? 'slow' : 'medium', // Slow, deliberate for researchers
            precision: personality.type === 'professional' ? 'high' : 'medium', // High precision for professionals
            hoverTime: personality.hoverProbability > 0.7 ? 'long' : 'short', // Long hover for high probability
            pathType: personality.type === 'explorer' ? 'curved' : 'direct'    // Curved paths for explorers
        };
    }

    /**
     * Get scrolling pattern based on personality
     * Influences how user scrolls through content
     */
    getScrollingPattern() {
        const personality = this.currentPersonality;
        
        return {
            speed: personality.scrollBehavior === 'quick' ? 'fast' :           // Fast scrolling for quick behavior
                   personality.scrollBehavior === 'analytical' ? 'slow' : 'medium', // Slow for analytical behavior
            pauseFrequency: personality.attentionSpan === 'long' ? 'high' : 'low', // Frequent pauses for long attention
            scrollDistance: personality.type === 'explorer' ? 'large' : 'medium',   // Large scrolls for explorers
            direction: 'mixed' // Mixed scroll directions for realism
        };
    }

    /**
     * Get clicking pattern based on personality
     * Influences how user clicks on elements
     */
    getClickingPattern() {
        const personality = this.currentPersonality;
        
        return {
            frequency: personality.clickProbability > 0.7 ? 'high' : 'low',    // High frequency for high probability
            precision: personality.type === 'professional' ? 'high' : 'medium', // High precision for professionals
            doubleClickProbability: personality.type === 'casual' ? 0.1 : 0.05, // Higher double-click for casual users
            clickDelay: personality.readingSpeed === 'slow' ? 'long' : 'short'   // Longer delays for slow readers
        };
    }

    /**
     * Get reading pattern based on personality
     * Influences how user reads and interacts with content
     */
    getReadingPattern() {
        const personality = this.currentPersonality;
        
        return {
            speed: personality.readingSpeed,                                    // Reading speed characteristic
            comprehension: personality.type === 'researcher' ? 'high' : 'medium', // High comprehension for researchers
            selectionProbability: personality.type === 'researcher' ? 0.8 : 0.3,  // High text selection for researchers
            reReadingProbability: personality.attentionSpan === 'long' ? 0.6 : 0.2 // High re-reading for long attention spans
        };
    }

    /**
     * Get navigation pattern based on personality
     * Influences how user navigates between pages and uses browser features
     */
    getNavigationPattern() {
        const personality = this.currentPersonality;
        
        return {
            style: personality.navigationStyle,                                // Navigation style characteristic
            tabUsage: personality.tabSwitching,                               // Tab switching behavior
            backForwardUsage: personality.type === 'explorer' ? 'high' : 'low', // High back/forward for explorers
            bookmarkUsage: personality.type === 'professional' ? 'high' : 'low', // High bookmark usage for professionals
            searchUsage: personality.searchBehavior                           // Search behavior pattern
        };
    }

    /**
     * Generate unique session ID for tracking with security enhancements
     * Combines timestamp with random string for uniqueness and sanitizes output
     */
    generateSessionId() {
        try {
            const timestamp = Date.now().toString();
            const random = Math.random().toString(36).substr(2, 9);
            const sessionId = `${this.BEHAVIOR_CONSTANTS.SESSION_ID.PREFIX}${timestamp}_${random}`;
            
            // Sanitize session ID to prevent injection attacks
            return this.sanitizeString(sessionId);
        } catch (error) {
            console.warn('Error generating session ID:', error.message);
            // Fallback to simple timestamp-based ID
            return `${this.BEHAVIOR_CONSTANTS.SESSION_ID.FALLBACK_PREFIX}${Date.now()}`;
        }
    }

    /**
     * Sanitize string to prevent XSS and injection attacks
     */
    sanitizeString(input) {
        if (typeof input !== 'string') {
            return '';
        }
        
        // Remove potentially dangerous characters
        return input
            .replace(/[<>\"'&]/g, '') // Remove HTML special characters
            .replace(/[^a-zA-Z0-9_-]/g, '') // Only allow alphanumeric, underscore, and dash
            .substring(0, this.BEHAVIOR_CONSTANTS.SESSION_ID.MAX_LENGTH); // Limit length to prevent buffer overflow
    }

    /**
     * Validate personality type to prevent injection attacks
     */
    validatePersonalityType(type) {
        const validTypes = Object.values(this.personalityTypes);
        return validTypes.includes(type) ? type : this.personalityTypes.EXPLORER;
    }

    /**
     * Get current personality or generate new one if none exists
     */
    getCurrentPersonality() {
        if (!this.currentPersonality) {
            this.generateUserPersonality();
        }
        return this.currentPersonality;
    }

    /**
     * Update personality weights for different distribution
     * Allows dynamic adjustment of personality selection probabilities
     */
    updatePersonalityWeights(weights) {
        this.personalityWeights = { ...this.personalityWeights, ...weights };
    }

    /**
     * Save personality to stealth storage for persistence
     * Uses stealth storage to avoid detection while maintaining session continuity
     */
    async savePersonality() {
        if (this.currentPersonality) {
            // Use stealth storage instead of chrome storage for enhanced security
            try {
                const stealthStorage = new (window._stealth_storage || (() => {
                    // Fallback storage if stealth storage is not available
                    return {
                        set: (key, value) => {
                            try {
                                localStorage.setItem(key, JSON.stringify(value));
                            } catch (e) {
                                // Silent fallback - no error logging for stealth
                            }
                        },
                        get: (key) => {
                            try {
                                const item = localStorage.getItem(key);
                                return item ? JSON.parse(item) : null;
                            } catch (e) {
                                return null;
                            }
                        }
                    };
                })());
                stealthStorage.set('currentPersonality', this.currentPersonality);
            } catch (error) {
                // Silent fallback - no error logging for stealth
            }
        }
    }

    /**
     * Load personality from stealth storage for session continuity
     * Restores previous personality state if available
     */
    async loadPersonality() {
        // Use stealth storage instead of chrome storage for enhanced security
        try {
            const stealthStorage = new (window._stealth_storage || (() => {
                // Fallback storage if stealth storage is not available
                return {
                    set: (key, value) => {
                        try {
                            localStorage.setItem(key, JSON.stringify(value));
                        } catch (e) {
                            // Silent fallback - no error logging for stealth
                        }
                    },
                    get: (key) => {
                        try {
                            const item = localStorage.getItem(key);
                            return item ? JSON.parse(item) : null;
                        } catch (e) {
                            return null;
                        }
                    }
                };
            })());
            const currentPersonality = stealthStorage.get('currentPersonality');
            if (currentPersonality) {
                this.currentPersonality = currentPersonality;
                return this.currentPersonality;
            }
        } catch (error) {
            // Silent fallback - no error logging for stealth
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
