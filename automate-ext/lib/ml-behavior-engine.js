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
     * Learn from behavior patterns
     */
    learnFromPatterns() {
        if (!this.mlConfig.enabled) return;
        
        console.log('MLBehaviorEngine: Learning from behavior patterns...');
        
        // Analyze successful patterns
        this.analyzeSuccessfulPatterns();
        
        // Analyze failed patterns
        this.analyzeFailedPatterns();
        
        // Update adaptation rules
        this.updateAdaptationRules();
        
        // Save learned patterns
        this.saveLearnedPatterns();
        
        console.log('MLBehaviorEngine: Pattern learning completed');
    }

    /**
     * Analyze successful patterns
     */
    analyzeSuccessfulPatterns() {
        const successfulPatterns = this.learnedPatterns.successfulPatterns;
        
        if (successfulPatterns.length === 0) return;
        
        // Group patterns by context
        const contextGroups = this.groupPatternsByContext(successfulPatterns);
        
        // Extract common characteristics
        Object.keys(contextGroups).forEach(context => {
            const patterns = contextGroups[context];
            const characteristics = this.extractPatternCharacteristics(patterns);
            
            // Store successful characteristics
            if (!this.learnedPatterns.contextPatterns[context]) {
                this.learnedPatterns.contextPatterns[context] = {};
            }
            
            this.learnedPatterns.contextPatterns[context].successful = characteristics;
        });
        
        console.log(`MLBehaviorEngine: Analyzed ${successfulPatterns.length} successful patterns`);
    }

    /**
     * Analyze failed patterns
     */
    analyzeFailedPatterns() {
        const failedPatterns = this.learnedPatterns.failedPatterns;
        
        if (failedPatterns.length === 0) return;
        
        // Group patterns by context
        const contextGroups = this.groupPatternsByContext(failedPatterns);
        
        // Extract common characteristics
        Object.keys(contextGroups).forEach(context => {
            const patterns = contextGroups[context];
            const characteristics = this.extractPatternCharacteristics(patterns);
            
            // Store failed characteristics
            if (!this.learnedPatterns.contextPatterns[context]) {
                this.learnedPatterns.contextPatterns[context] = {};
            }
            
            this.learnedPatterns.contextPatterns[context].failed = characteristics;
        });
        
        console.log(`MLBehaviorEngine: Analyzed ${failedPatterns.length} failed patterns`);
    }

    /**
     * Update adaptation rules based on learned patterns
     */
    updateAdaptationRules() {
        const rules = [];
        
        // Generate rules from context patterns
        Object.keys(this.learnedPatterns.contextPatterns).forEach(context => {
            const contextPatterns = this.learnedPatterns.contextPatterns[context];
            
            if (contextPatterns.successful && contextPatterns.failed) {
                // Compare successful vs failed patterns
                const rule = this.generateAdaptationRule(context, contextPatterns.successful, contextPatterns.failed);
                if (rule) {
                    rules.push(rule);
                }
            }
        });
        
        // Update adaptation rules
        this.learnedPatterns.adaptationRules = rules;
        
        console.log(`MLBehaviorEngine: Updated ${rules.length} adaptation rules`);
    }

    /**
     * Adapt behavior based on learned patterns
     */
    adaptBehavior() {
        if (!this.mlConfig.enabled) return null;
        
        console.log('MLBehaviorEngine: Adapting behavior based on learned patterns...');
        
        // Get current context
        const currentContext = this.analyzeWebsiteContext();
        const contextKey = this.getContextKey(currentContext);
        
        // Find applicable rules
        const applicableRules = this.findApplicableRules(contextKey);
        
        if (applicableRules.length === 0) {
            console.log('MLBehaviorEngine: No applicable rules found');
            return null;
        }
        
        // Apply best rule
        const bestRule = this.selectBestRule(applicableRules);
        const adaptedBehavior = this.applyAdaptationRule(bestRule);
        
        console.log(`MLBehaviorEngine: Applied adaptation rule: ${bestRule.type}`);
        return adaptedBehavior;
    }

    /**
     * Predict optimal behavior for current context
     */
    predictOptimalBehavior() {
        if (!this.mlConfig.enabled) return null;
        
        console.log('MLBehaviorEngine: Predicting optimal behavior...');
        
        // Get current context
        const currentContext = this.analyzeWebsiteContext();
        const contextKey = this.getContextKey(currentContext);
        
        // Get context patterns
        const contextPatterns = this.learnedPatterns.contextPatterns[contextKey];
        
        if (!contextPatterns || !contextPatterns.successful) {
            console.log('MLBehaviorEngine: No successful patterns found for context');
            return null;
        }
        
        // Predict optimal parameters
        const optimalBehavior = this.calculateOptimalParameters(contextPatterns.successful);
        
        console.log('MLBehaviorEngine: Optimal behavior predicted');
        return optimalBehavior;
    }

    /**
     * Group patterns by context
     */
    groupPatternsByContext(patterns) {
        const groups = {};
        
        patterns.forEach(pattern => {
            const contextKey = this.getContextKey(pattern.context);
            if (!groups[contextKey]) {
                groups[contextKey] = [];
            }
            groups[contextKey].push(pattern);
        });
        
        return groups;
    }

    /**
     * Extract pattern characteristics
     */
    extractPatternCharacteristics(patterns) {
        if (patterns.length === 0) return {};
        
        const characteristics = {
            mouseSpeed: this.calculateAverage(patterns.map(p => p.mouseSpeed)),
            clickDelay: this.calculateAverage(patterns.map(p => p.clickDelay)),
            scrollSpeed: this.calculateAverage(patterns.map(p => p.scrollSpeed)),
            readingTime: this.calculateAverage(patterns.map(p => p.readingTime)),
            navigationDelay: this.calculateAverage(patterns.map(p => p.navigationDelay)),
            successRate: this.calculateAverage(patterns.map(p => p.successRate))
        };
        
        return characteristics;
    }

    /**
     * Generate adaptation rule
     */
    generateAdaptationRule(context, successful, failed) {
        const rule = {
            context: context,
            type: 'behavior_adaptation',
            conditions: this.generateRuleConditions(successful, failed),
            actions: this.generateRuleActions(successful, failed),
            confidence: this.calculateRuleConfidence(successful, failed),
            timestamp: Date.now()
        };
        
        return rule.confidence > this.mlConfig.adaptationThreshold ? rule : null;
    }

    /**
     * Find applicable rules for context
     */
    findApplicableRules(contextKey) {
        return this.learnedPatterns.adaptationRules.filter(rule => 
            rule.context === contextKey && rule.confidence > this.mlConfig.adaptationThreshold
        );
    }

    /**
     * Select best rule from applicable rules
     */
    selectBestRule(rules) {
        return rules.reduce((best, current) => 
            current.confidence > best.confidence ? current : best
        );
    }

    /**
     * Apply adaptation rule
     */
    applyAdaptationRule(rule) {
        const adaptedBehavior = {
            mouseSpeed: rule.actions.mouseSpeed || 1.0,
            clickDelay: rule.actions.clickDelay || 1.0,
            scrollSpeed: rule.actions.scrollSpeed || 1.0,
            readingTime: rule.actions.readingTime || 1.0,
            navigationDelay: rule.actions.navigationDelay || 1.0,
            confidence: rule.confidence,
            ruleType: rule.type
        };
        
        return adaptedBehavior;
    }

    /**
     * Calculate optimal parameters
     */
    calculateOptimalParameters(successfulPatterns) {
        return {
            mouseSpeed: this.calculateOptimalValue(successfulPatterns.mouseSpeed),
            clickDelay: this.calculateOptimalValue(successfulPatterns.clickDelay),
            scrollSpeed: this.calculateOptimalValue(successfulPatterns.scrollSpeed),
            readingTime: this.calculateOptimalValue(successfulPatterns.readingTime),
            navigationDelay: this.calculateOptimalValue(successfulPatterns.navigationDelay),
            confidence: successfulPatterns.successRate
        };
    }

    /**
     * Helper methods
     */
    getContextKey(context) {
        return `${context.website}_${context.pageType}_${context.contentType}`;
    }

    calculateAverage(values) {
        return values.reduce((sum, val) => sum + val, 0) / values.length;
    }

    calculateOptimalValue(value) {
        // Simple optimization: use the value with highest success rate
        return value;
    }

    generateRuleConditions(successful, failed) {
        return {
            mouseSpeed: { min: successful.mouseSpeed * 0.9, max: successful.mouseSpeed * 1.1 },
            clickDelay: { min: successful.clickDelay * 0.9, max: successful.clickDelay * 1.1 },
            scrollSpeed: { min: successful.scrollSpeed * 0.9, max: successful.scrollSpeed * 1.1 }
        };
    }

    generateRuleActions(successful, failed) {
        return {
            mouseSpeed: successful.mouseSpeed,
            clickDelay: successful.clickDelay,
            scrollSpeed: successful.scrollSpeed,
            readingTime: successful.readingTime,
            navigationDelay: successful.navigationDelay
        };
    }

    calculateRuleConfidence(successful, failed) {
        // Calculate confidence based on success rate difference
        const successRate = successful.successRate || 0.8;
        const failureRate = failed.successRate || 0.2;
        return Math.abs(successRate - failureRate);
    }

    /**
     * Get ML metrics
     */
    getMLMetrics() {
        return {
            patternsLearned: this.learnedPatterns.successfulPatterns.length + this.learnedPatterns.failedPatterns.length,
            adaptationRules: this.learnedPatterns.adaptationRules.length,
            currentContext: this.currentContext,
            learningEnabled: this.mlConfig.enabled,
            contextPatterns: Object.keys(this.learnedPatterns.contextPatterns).length,
            averageConfidence: this.calculateAverageConfidence()
        };
    }

    /**
     * Calculate average confidence of adaptation rules
     */
    calculateAverageConfidence() {
        if (this.learnedPatterns.adaptationRules.length === 0) return 0;
        
        const totalConfidence = this.learnedPatterns.adaptationRules.reduce((sum, rule) => sum + rule.confidence, 0);
        return totalConfidence / this.learnedPatterns.adaptationRules.length;
    }
}

// Export for use in other modules with enhanced stealth protection
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MLBehaviorEngine;
} else if (typeof window !== 'undefined') {
    // Always assign to window, overwriting if exists to prevent conflicts
    window.MLBehaviorEngine = MLBehaviorEngine;
}
