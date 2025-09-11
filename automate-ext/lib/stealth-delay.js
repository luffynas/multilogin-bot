/**
 * Stealth Delay - Random delay system to avoid pattern detection
 */

// Check if class already exists before declaring
if (typeof window.StealthDelay === 'undefined') {
    class StealthDelay {
    constructor() {
        this.delayHistory = [];
        this.maxHistorySize = 50;
        this.baseDelays = {
            short: { min: 500, max: 1500 },
            medium: { min: 1500, max: 4000 },
            long: { min: 4000, max: 8000 },
            veryLong: { min: 8000, max: 15000 }
        };
        this.personalityMultipliers = {
            explorer: { min: 0.7, max: 1.2 },
            researcher: { min: 1.2, max: 1.8 },
            casual: { min: 0.8, max: 1.1 },
            professional: { min: 0.9, max: 1.3 }
        };
        this.contentTypeMultipliers = {
            article: { min: 1.1, max: 1.4 },
            technical: { min: 1.3, max: 1.6 },
            news: { min: 0.8, max: 1.1 },
            product: { min: 0.7, max: 1.0 },
            entertainment: { min: 0.6, max: 0.9 }
        };
    }

    /**
     * Generate random delay with human-like variation
     */
    generateDelay(type = 'medium', personality = null, contentType = null) {
        const baseDelay = this.baseDelays[type] || this.baseDelays.medium;
        
        // Base random delay
        let delay = this.randomBetween(baseDelay.min, baseDelay.max);
        
        // Apply personality multiplier
        if (personality && this.personalityMultipliers[personality]) {
            const multiplier = this.personalityMultipliers[personality];
            const personalityMultiplier = this.randomBetween(multiplier.min, multiplier.max);
            delay *= personalityMultiplier;
        }
        
        // Apply content type multiplier
        if (contentType && this.contentTypeMultipliers[contentType]) {
            const multiplier = this.contentTypeMultipliers[contentType];
            const contentTypeMultiplier = this.randomBetween(multiplier.min, multiplier.max);
            delay *= contentTypeMultiplier;
        }
        
        // Add micro-variations for more human-like behavior
        delay += this.randomBetween(-100, 100);
        
        // Ensure minimum delay
        delay = Math.max(delay, 200);
        
        // Add to history for pattern analysis
        this.addToHistory(delay, type);
        
        return Math.round(delay);
    }

    /**
     * Random number between min and max
     */
    randomBetween(min, max) {
        return Math.random() * (max - min) + min;
    }

    /**
     * Add delay to history
     */
    addToHistory(delay, type) {
        this.delayHistory.push({
            delay: delay,
            type: type,
            timestamp: Date.now()
        });
        
        // Keep history size manageable
        if (this.delayHistory.length > this.maxHistorySize) {
            this.delayHistory.shift();
        }
    }

    /**
     * Wait for specified delay
     */
    async wait(delay) {
        return new Promise(resolve => {
            setTimeout(resolve, delay);
        });
    }

    /**
     * Wait with random delay
     */
    async waitRandom(type = 'medium', personality = null, contentType = null) {
        const delay = this.generateDelay(type, personality, contentType);
        await this.wait(delay);
        return delay;
    }

    /**
     * Wait with natural reading delay
     */
    async waitForReading(textLength, personality = null, contentType = null) {
        const wordsPerMinute = this.getReadingSpeed(personality, contentType);
        const wordCount = textLength.split(/\s+/).length;
        const readingTime = (wordCount / wordsPerMinute) * 60 * 1000; // Convert to milliseconds
        
        // Add variation to reading time
        const variation = this.randomBetween(0.7, 1.3);
        const finalDelay = readingTime * variation;
        
        await this.wait(Math.round(finalDelay));
        return Math.round(finalDelay);
    }

    /**
     * Get reading speed based on personality and content
     */
    getReadingSpeed(personality, contentType) {
        let baseSpeed = 200; // words per minute
        
        // Personality adjustments
        if (personality) {
            switch (personality) {
                case 'researcher':
                    baseSpeed *= 0.7; // Slower, careful reading
                    break;
                case 'explorer':
                    baseSpeed *= 1.3; // Faster, scanning reading
                    break;
                case 'casual':
                    baseSpeed *= 1.0; // Normal speed
                    break;
                case 'professional':
                    baseSpeed *= 1.1; // Slightly faster
                    break;
            }
        }
        
        // Content type adjustments
        if (contentType) {
            switch (contentType) {
                case 'technical':
                    baseSpeed *= 0.6; // Much slower for technical content
                    break;
                case 'article':
                    baseSpeed *= 0.8; // Slower for articles
                    break;
                case 'news':
                    baseSpeed *= 1.2; // Faster for news
                    break;
                case 'product':
                    baseSpeed *= 1.4; // Fast scanning for products
                    break;
            }
        }
        
        return Math.round(baseSpeed);
    }

    /**
     * Wait with natural scrolling delay (Enhanced for Human-Like Behavior)
     */
    async waitForScrolling(scrollDistance, personality = null) {
        // More natural base scroll speed with wider variation
        const baseScrollSpeed = 60 + Math.random() * 140; // 60-200 pixels per second (was 100 fixed)
        let scrollSpeed = baseScrollSpeed;
        
        // Personality adjustments with more natural variation
        if (personality) {
            switch (personality) {
                case 'researcher':
                    scrollSpeed *= (0.5 + Math.random() * 0.3); // 0.5-0.8x (was 0.6x fixed)
                    break;
                case 'explorer':
                    scrollSpeed *= (1.2 + Math.random() * 0.6); // 1.2-1.8x (was 1.4x fixed)
                    break;
                case 'casual':
                    scrollSpeed *= (0.8 + Math.random() * 0.4); // 0.8-1.2x (was 1.0x fixed)
                    break;
                case 'professional':
                    scrollSpeed *= (1.0 + Math.random() * 0.4); // 1.0-1.4x (was 1.2x fixed)
                    break;
                default:
                    scrollSpeed *= (0.7 + Math.random() * 0.6); // 0.7-1.3x for unknown personality
                    break;
            }
        }
        
        const scrollTime = (scrollDistance / scrollSpeed) * 1000; // Convert to milliseconds
        
        // More natural variation with human imperfection
        const variation = this.randomBetween(0.5, 1.8); // 50-180% (was 80-120%)
        const finalDelay = scrollTime * variation;
        
        // Add human-like hesitation factor
        const hesitationFactor = Math.random() < 0.1 ? (1.2 + Math.random() * 0.8) : 1.0; // 10% chance for 1.2-2.0x delay
        const finalDelayWithHesitation = finalDelay * hesitationFactor;
        
        await this.wait(Math.round(finalDelayWithHesitation));
        return Math.round(finalDelayWithHesitation);
    }

    /**
     * Wait with natural click delay
     */
    async waitForClick(personality = null) {
        const baseDelay = this.randomBetween(200, 800);
        let clickDelay = baseDelay;
        
        // Personality adjustments
        if (personality) {
            switch (personality) {
                case 'researcher':
                    clickDelay *= 1.3; // More deliberate clicks
                    break;
                case 'explorer':
                    clickDelay *= 0.7; // Faster, impulsive clicks
                    break;
                case 'casual':
                    clickDelay *= 1.0; // Normal speed
                    break;
                case 'professional':
                    clickDelay *= 0.9; // Slightly faster
                    break;
            }
        }
        
        await this.wait(Math.round(clickDelay));
        return Math.round(clickDelay);
    }

    /**
     * Wait with natural typing delay
     */
    async waitForTyping(textLength, personality = null) {
        const baseTypingSpeed = 40; // words per minute
        let typingSpeed = baseTypingSpeed;
        
        // Personality adjustments
        if (personality) {
            switch (personality) {
                case 'researcher':
                    typingSpeed *= 0.8; // More careful typing
                    break;
                case 'explorer':
                    typingSpeed *= 1.2; // Faster typing
                    break;
                case 'casual':
                    typingSpeed *= 1.0; // Normal speed
                    break;
                case 'professional':
                    typingSpeed *= 1.1; // Slightly faster
                    break;
            }
        }
        
        const wordCount = textLength.split(/\s+/).length;
        const typingTime = (wordCount / typingSpeed) * 60 * 1000; // Convert to milliseconds
        const variation = this.randomBetween(0.8, 1.3);
        const finalDelay = typingTime * variation;
        
        await this.wait(Math.round(finalDelay));
        return Math.round(finalDelay);
    }

    /**
     * Get delay statistics
     */
    getDelayStats() {
        if (this.delayHistory.length === 0) {
            return {
                averageDelay: 0,
                totalDelays: 0,
                delayTypes: {},
                patternAnalysis: 'insufficient_data'
            };
        }
        
        const delays = this.delayHistory.map(item => item.delay);
        const averageDelay = delays.reduce((a, b) => a + b, 0) / delays.length;
        
        const delayTypes = {};
        this.delayHistory.forEach(item => {
            delayTypes[item.type] = (delayTypes[item.type] || 0) + 1;
        });
        
        // Pattern analysis
        const patternAnalysis = this.analyzeDelayPattern();
        
        return {
            averageDelay: Math.round(averageDelay),
            totalDelays: this.delayHistory.length,
            delayTypes: delayTypes,
            patternAnalysis: patternAnalysis
        };
    }

    /**
     * Analyze delay patterns for human-like behavior
     */
    analyzeDelayPattern() {
        if (this.delayHistory.length < 10) {
            return 'insufficient_data';
        }
        
        const delays = this.delayHistory.map(item => item.delay);
        const variance = this.calculateVariance(delays);
        const coefficientOfVariation = Math.sqrt(variance) / (delays.reduce((a, b) => a + b, 0) / delays.length);
        
        // Human-like behavior has higher variance
        if (coefficientOfVariation > 0.3) {
            return 'human_like';
        } else if (coefficientOfVariation > 0.2) {
            return 'moderately_human';
        } else {
            return 'potentially_automated';
        }
    }

    /**
     * Calculate variance
     */
    calculateVariance(values) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
        return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
    }

    /**
     * Clear delay history
     */
    clearHistory() {
        this.delayHistory = [];
    }
    }

    // Export for use in other modules with immediate availability
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = StealthDelay;
    } else if (typeof window !== 'undefined') {
        // Use stealth naming to avoid detection and ensure immediate availability
        window._stealth_delay = StealthDelay;
        
        // Only export if not already exists
        if (!window.StealthDelay) {
            window.StealthDelay = StealthDelay;
        }
    }
} else {
    // Use existing class
    console.debug('StealthDelay already exists, using existing instance');
}
