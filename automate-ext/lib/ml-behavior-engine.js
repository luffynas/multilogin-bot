/**
 * Machine Learning Behavior Engine - Advanced pattern learning and adaptation
 */

class MLBehaviorEngine {
    constructor() {
        this.mlConfig = {
            enabled: true,
            learningRate: 0.01,
            patternMemory: 1000,
            adaptationThreshold: 0.7,
            contextSensitivity: 0.8
        };
        
        this.behaviorPatterns = {
            mouseMovements: [],
            clickPatterns: [],
            scrollPatterns: [],
            typingPatterns: [],
            navigationPatterns: [],
            websiteContexts: []
        };
        
        this.learnedPatterns = {
            successfulPatterns: [],
            failedPatterns: [],
            contextPatterns: {},
            adaptationRules: []
        };
        
        this.currentContext = {
            website: '',
            pageType: '',
            contentType: '',
            userIntent: '',
            timeOfDay: '',
            sessionDuration: 0
        };
    }

    /**
     * Initialize ML engine
     */
    initialize() {
        if (!this.mlConfig.enabled) return;
        
        this.loadLearnedPatterns();
        this.startPatternLearning();
        
        return this;
    }

    /**
     * Analyze website context for dynamic adaptation
     */
    analyzeWebsiteContext() {
        const context = {
            website: window.location.hostname,
            pageType: this.detectPageType(),
            contentType: this.detectContentType(),
            userIntent: this.detectUserIntent(),
            timeOfDay: this.getTimeOfDay(),
            sessionDuration: this.getSessionDuration(),
            adDensity: this.detectAdDensity(),
            contentLength: this.detectContentLength(),
            interactionElements: this.detectInteractionElements()
        };
        
        this.currentContext = context;
        return context;
    }

    /**
     * Detect page type for context-aware behavior
     */
    detectPageType() {
        const url = window.location.pathname;
        const title = document.title.toLowerCase();
        
        if (url.includes('/article') || url.includes('/post') || title.includes('article')) {
            return 'article';
        } else if (url.includes('/product') || title.includes('product')) {
            return 'product';
        } else if (url.includes('/category') || title.includes('category')) {
            return 'category';
        } else if (url.includes('/search') || title.includes('search')) {
            return 'search';
        } else if (url === '/' || url === '') {
            return 'homepage';
        } else {
            return 'general';
        }
    }

    /**
     * Detect content type for behavior adaptation
     */
    detectContentType() {
        const content = document.body.textContent;
        const wordCount = content.split(' ').length;
        
        if (wordCount > 2000) return 'long-form';
        if (wordCount > 500) return 'medium-form';
        if (wordCount > 100) return 'short-form';
        return 'minimal';
    }

    /**
     * Detect user intent based on page analysis
     */
    detectUserIntent() {
        const context = this.currentContext;
        
        if (context.pageType === 'article' && context.contentType === 'long-form') {
            return 'reading';
        } else if (context.pageType === 'product') {
            return 'shopping';
        } else if (context.pageType === 'search') {
            return 'searching';
        } else if (context.adDensity > 0.3) {
            return 'browsing';
        } else {
            return 'exploring';
        }
    }

    /**
     * Get time of day for behavior adaptation
     */
    getTimeOfDay() {
        const hour = new Date().getHours();
        
        if (hour >= 6 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 17) return 'afternoon';
        if (hour >= 17 && hour < 21) return 'evening';
        return 'night';
    }

    /**
     * Get session duration
     */
    getSessionDuration() {
        const sessionStart = sessionStorage.getItem('sessionStart');
        if (sessionStart) {
            return (Date.now() - parseInt(sessionStart)) / 1000;
        }
        return 0;
    }

    /**
     * Detect ad density on page
     */
    detectAdDensity() {
        const adSelectors = [
            'ins.adsbygoogle',
            'div[id*="google_ads"]',
            'div[class*="ad"]',
            'iframe[src*="google"]'
        ];
        
        let adCount = 0;
        adSelectors.forEach(selector => {
            adCount += document.querySelectorAll(selector).length;
        });
        
        const totalElements = document.querySelectorAll('*').length;
        return adCount / totalElements;
    }

    /**
     * Detect content length
     */
    detectContentLength() {
        const content = document.body.textContent;
        return content.length;
    }

    /**
     * Detect interactive elements
     */
    detectInteractionElements() {
        return {
            buttons: document.querySelectorAll('button').length,
            links: document.querySelectorAll('a').length,
            forms: document.querySelectorAll('form').length,
            inputs: document.querySelectorAll('input').length
        };
    }

    /**
     * Generate dynamic personality based on context
     */
    generateDynamicPersonality() {
        const context = this.currentContext;
        const basePersonality = this.getBasePersonality();
        
        // Adapt personality based on context
        const adaptedPersonality = {
            ...basePersonality,
            readingSpeed: this.adaptReadingSpeed(context),
            interactionFrequency: this.adaptInteractionFrequency(context),
            attentionSpan: this.adaptAttentionSpan(context),
            curiosityLevel: this.adaptCuriosityLevel(context),
            patienceLevel: this.adaptPatienceLevel(context)
        };
        
        return adaptedPersonality;
    }

    /**
     * Get base personality
     */
    getBasePersonality() {
        const personalities = [
            {
                type: 'explorer',
                readingSpeed: 0.7,
                interactionFrequency: 0.8,
                attentionSpan: 0.6,
                curiosityLevel: 0.9,
                patienceLevel: 0.5
            },
            {
                type: 'researcher',
                readingSpeed: 0.5,
                interactionFrequency: 0.6,
                attentionSpan: 0.9,
                curiosityLevel: 0.8,
                patienceLevel: 0.8
            },
            {
                type: 'casual',
                readingSpeed: 0.8,
                interactionFrequency: 0.4,
                attentionSpan: 0.4,
                curiosityLevel: 0.5,
                patienceLevel: 0.3
            },
            {
                type: 'professional',
                readingSpeed: 0.6,
                interactionFrequency: 0.7,
                attentionSpan: 0.8,
                curiosityLevel: 0.6,
                patienceLevel: 0.7
            }
        ];
        
        return personalities[Math.floor(Math.random() * personalities.length)];
    }

    /**
     * Adapt reading speed based on context
     */
    adaptReadingSpeed(context) {
        let baseSpeed = 0.6;
        
        if (context.contentType === 'long-form') {
            baseSpeed *= 0.8; // Slower for long content
        } else if (context.contentType === 'short-form') {
            baseSpeed *= 1.2; // Faster for short content
        }
        
        if (context.timeOfDay === 'morning') {
            baseSpeed *= 1.1; // Faster in morning
        } else if (context.timeOfDay === 'night') {
            baseSpeed *= 0.9; // Slower at night
        }
        
        return Math.min(1, Math.max(0.3, baseSpeed));
    }

    /**
     * Adapt interaction frequency based on context
     */
    adaptInteractionFrequency(context) {
        let baseFrequency = 0.6;
        
        if (context.userIntent === 'shopping') {
            baseFrequency *= 1.3; // More interactions for shopping
        } else if (context.userIntent === 'reading') {
            baseFrequency *= 0.7; // Fewer interactions for reading
        }
        
        if (context.adDensity > 0.3) {
            baseFrequency *= 1.2; // More interactions on ad-heavy pages
        }
        
        return Math.min(1, Math.max(0.2, baseFrequency));
    }

    /**
     * Adapt attention span based on context
     */
    adaptAttentionSpan(context) {
        let baseAttention = 0.7;
        
        if (context.contentType === 'long-form') {
            baseAttention *= 1.2; // Higher attention for long content
        } else if (context.contentType === 'minimal') {
            baseAttention *= 0.6; // Lower attention for minimal content
        }
        
        if (context.sessionDuration > 300) { // 5 minutes
            baseAttention *= 0.8; // Lower attention after long session
        }
        
        return Math.min(1, Math.max(0.3, baseAttention));
    }

    /**
     * Adapt curiosity level based on context
     */
    adaptCuriosityLevel(context) {
        let baseCuriosity = 0.6;
        
        if (context.pageType === 'search') {
            baseCuriosity *= 1.3; // Higher curiosity for search results
        } else if (context.pageType === 'homepage') {
            baseCuriosity *= 1.1; // Higher curiosity for homepage
        }
        
        if (context.timeOfDay === 'morning') {
            baseCuriosity *= 1.2; // Higher curiosity in morning
        }
        
        return Math.min(1, Math.max(0.3, baseCuriosity));
    }

    /**
     * Adapt patience level based on context
     */
    adaptPatienceLevel(context) {
        let basePatience = 0.6;
        
        if (context.userIntent === 'reading') {
            basePatience *= 1.3; // Higher patience for reading
        } else if (context.userIntent === 'searching') {
            basePatience *= 0.8; // Lower patience for searching
        }
        
        if (context.sessionDuration > 600) { // 10 minutes
            basePatience *= 0.7; // Lower patience after long session
        }
        
        return Math.min(1, Math.max(0.2, basePatience));
    }

    /**
     * Learn from behavior patterns
     */
    learnFromPattern(pattern, success) {
        if (!this.mlConfig.enabled) return;
        
        const context = this.currentContext;
        const learnedPattern = {
            pattern: pattern,
            context: { ...context },
            success: success,
            timestamp: Date.now()
        };
        
        if (success) {
            this.learnedPatterns.successfulPatterns.push(learnedPattern);
        } else {
            this.learnedPatterns.failedPatterns.push(learnedPattern);
        }
        
        // Limit memory
        if (this.learnedPatterns.successfulPatterns.length > this.mlConfig.patternMemory) {
            this.learnedPatterns.successfulPatterns.shift();
        }
        if (this.learnedPatterns.failedPatterns.length > this.mlConfig.patternMemory) {
            this.learnedPatterns.failedPatterns.shift();
        }
        
        this.updateAdaptationRules();
    }

    /**
     * Update adaptation rules based on learned patterns
     */
    updateAdaptationRules() {
        const successfulPatterns = this.learnedPatterns.successfulPatterns;
        const failedPatterns = this.learnedPatterns.failedPatterns;
        
        // Analyze successful patterns
        const successAnalysis = this.analyzePatterns(successfulPatterns);
        const failureAnalysis = this.analyzePatterns(failedPatterns);
        
        // Generate adaptation rules
        this.learnedPatterns.adaptationRules = this.generateAdaptationRules(successAnalysis, failureAnalysis);
    }

    /**
     * Analyze patterns for learning
     */
    analyzePatterns(patterns) {
        if (patterns.length === 0) return {};
        
        const analysis = {
            contextPatterns: {},
            timingPatterns: {},
            interactionPatterns: {}
        };
        
        patterns.forEach(pattern => {
            const context = pattern.context;
            const contextKey = `${context.website}_${context.pageType}_${context.userIntent}`;
            
            if (!analysis.contextPatterns[contextKey]) {
                analysis.contextPatterns[contextKey] = [];
            }
            analysis.contextPatterns[contextKey].push(pattern);
        });
        
        return analysis;
    }

    /**
     * Generate adaptation rules
     */
    generateAdaptationRules(successAnalysis, failureAnalysis) {
        const rules = [];
        
        // Generate rules based on successful patterns
        Object.entries(successAnalysis.contextPatterns).forEach(([contextKey, patterns]) => {
            if (patterns.length >= 3) { // Minimum pattern threshold
                const avgPattern = this.calculateAveragePattern(patterns);
                rules.push({
                    context: contextKey,
                    action: 'emulate',
                    pattern: avgPattern,
                    confidence: patterns.length / this.mlConfig.patternMemory
                });
            }
        });
        
        // Generate rules based on failed patterns
        Object.entries(failureAnalysis.contextPatterns).forEach(([contextKey, patterns]) => {
            if (patterns.length >= 2) { // Lower threshold for failures
                const avgPattern = this.calculateAveragePattern(patterns);
                rules.push({
                    context: contextKey,
                    action: 'avoid',
                    pattern: avgPattern,
                    confidence: patterns.length / this.mlConfig.patternMemory
                });
            }
        });
        
        return rules;
    }

    /**
     * Calculate average pattern
     */
    calculateAveragePattern(patterns) {
        if (patterns.length === 0) return {};
        
        const avgPattern = {};
        const keys = Object.keys(patterns[0].pattern);
        
        keys.forEach(key => {
            const values = patterns.map(p => p.pattern[key]).filter(v => typeof v === 'number');
            if (values.length > 0) {
                avgPattern[key] = values.reduce((sum, val) => sum + val, 0) / values.length;
            }
        });
        
        return avgPattern;
    }

    /**
     * Get optimal behavior pattern for current context
     */
    getOptimalBehaviorPattern() {
        const context = this.currentContext;
        const contextKey = `${context.website}_${context.pageType}_${context.userIntent}`;
        
        // Find applicable rules
        const applicableRules = this.learnedPatterns.adaptationRules.filter(rule => 
            rule.context === contextKey && rule.confidence > this.mlConfig.adaptationThreshold
        );
        
        if (applicableRules.length > 0) {
            // Use learned pattern
            const bestRule = applicableRules.reduce((best, rule) => 
                rule.confidence > best.confidence ? rule : best
            );
            
            return {
                pattern: bestRule.pattern,
                source: 'learned',
                confidence: bestRule.confidence
            };
        } else {
            // Use dynamic personality
            const dynamicPersonality = this.generateDynamicPersonality();
            return {
                pattern: dynamicPersonality,
                source: 'dynamic',
                confidence: 0.5
            };
        }
    }

    /**
     * Start pattern learning
     */
    startPatternLearning() {
        if (!this.mlConfig.enabled) return;
        
        // Analyze context every 30 seconds
        setInterval(() => {
            this.analyzeWebsiteContext();
        }, 30000);
    }

    /**
     * Load learned patterns from storage
     */
    loadLearnedPatterns() {
        try {
            const stored = localStorage.getItem('mlBehaviorPatterns');
            if (stored) {
                this.learnedPatterns = JSON.parse(stored);
            }
        } catch (error) {
            console.warn('Failed to load ML patterns:', error);
        }
    }

    /**
     * Save learned patterns to storage
     */
    saveLearnedPatterns() {
        try {
            localStorage.setItem('mlBehaviorPatterns', JSON.stringify(this.learnedPatterns));
        } catch (error) {
            console.warn('Failed to save ML patterns:', error);
        }
    }

    /**
     * Get ML metrics
     */
    getMLMetrics() {
        return {
            patternsLearned: this.learnedPatterns.successfulPatterns.length + this.learnedPatterns.failedPatterns.length,
            adaptationRules: this.learnedPatterns.adaptationRules.length,
            currentContext: this.currentContext,
            learningEnabled: this.mlConfig.enabled
        };
    }
}

// Export for use in other modules with enhanced stealth protection
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MLBehaviorEngine;
} else if (typeof window !== 'undefined' && !window.MLBehaviorEngine) {
    window.MLBehaviorEngine = MLBehaviorEngine;
}
