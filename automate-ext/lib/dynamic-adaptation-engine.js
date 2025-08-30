class DynamicAdaptationEngine {
    constructor() {
        this.adaptationConfig = {
            enabled: true,
            adaptationInterval: 60000, // 1 minute
            riskThresholds: {
                critical: 80,
                high: 60,
                medium: 40,
                low: 20,
                minimal: 0
            },
            adaptationStrategies: {
                critical: 'emergency',
                high: 'aggressive',
                medium: 'moderate',
                low: 'light',
                minimal: 'monitoring'
            }
        };
        
        this.currentContext = {
            website: '',
            pageType: '',
            contentType: '',
            timeOfDay: '',
            sessionDuration: 0,
            riskLevel: 'minimal',
            adaptationLevel: 'monitoring',
            lastAdaptation: Date.now()
        };
        
        this.adaptationHistory = [];
        this.behaviorModifiers = {
            clickProbability: 1.0,
            navigationFrequency: 1.0,
            readingSpeed: 1.0,
            interactionDelay: 1.0,
            stealthLevel: 1.0
        };
        
        this.adaptationTimer = null;
        this.analyticsMonitor = null;
    }

    initialize(analyticsMonitor) {
        if (!this.adaptationConfig.enabled) return this;
        
        this.analyticsMonitor = analyticsMonitor;
        this.startAdaptation();
        this.analyzeCurrentContext();
        
        return this;
    }

    startAdaptation() {
        this.adaptationTimer = setInterval(() => {
            this.analyzeCurrentContext();
            this.assessRiskLevel();
            this.adaptBehavior();
            this.recordAdaptation();
        }, this.adaptationConfig.adaptationInterval);
    }

    stopAdaptation() {
        if (this.adaptationTimer) {
            clearInterval(this.adaptationTimer);
            this.adaptationTimer = null;
        }
    }

    analyzeCurrentContext() {
        this.currentContext = {
            website: window.location.hostname,
            pageType: this.detectPageType(),
            contentType: this.detectContentType(),
            timeOfDay: this.getTimeOfDay(),
            sessionDuration: this.getSessionDuration(),
            riskLevel: this.currentContext.riskLevel,
            adaptationLevel: this.currentContext.adaptationLevel,
            lastAdaptation: this.currentContext.lastAdaptation
        };
    }

    detectPageType() {
        const path = window.location.pathname;
        const title = document.title.toLowerCase();
        
        if (path.includes('/article') || path.includes('/post') || title.includes('article')) {
            return 'article';
        } else if (path.includes('/product') || title.includes('product')) {
            return 'product';
        } else if (path.includes('/category') || title.includes('category')) {
            return 'category';
        } else if (path.includes('/search') || title.includes('search')) {
            return 'search';
        } else if (path === '/' || path === '') {
            return 'homepage';
        }
        
        return 'general';
    }

    detectContentType() {
        const textLength = document.body.textContent.length;
        
        if (textLength > 5000) return 'long-form';
        if (textLength > 1000) return 'medium-form';
        if (textLength > 100) return 'short-form';
        return 'minimal';
    }

    getTimeOfDay() {
        const hour = new Date().getHours();
        
        if (hour >= 6 && hour < 12) return 'morning';
        if (hour >= 12 && hour < 17) return 'afternoon';
        if (hour >= 17 && hour < 21) return 'evening';
        return 'night';
    }

    getSessionDuration() {
        if (this.analyticsMonitor && this.analyticsMonitor.currentSession) {
            return Date.now() - this.analyticsMonitor.currentSession.startTime;
        }
        return 0;
    }

    assessRiskLevel() {
        if (!this.analyticsMonitor) return;
        
        const report = this.analyticsMonitor.getAnalyticsReport();
        const riskFactors = report.riskAssessment.recentFactors;
        
        let riskScore = 0;
        
        riskFactors.forEach(factor => {
            switch (factor.type) {
                case 'high_ctr':
                    riskScore += 20;
                    break;
                case 'rapid_navigation':
                    riskScore += 15;
                    break;
                case 'consistent_timing':
                    riskScore += 25;
                    break;
                case 'excessive_clicks':
                    riskScore += 30;
                    break;
                case 'unnatural_patterns':
                    riskScore += 35;
                    break;
            }
        });
        
        // Context-based risk adjustments
        riskScore += this.calculateContextRisk();
        
        this.currentContext.riskLevel = this.calculateRiskLevel(riskScore);
        this.currentContext.adaptationLevel = this.adaptationConfig.adaptationStrategies[this.currentContext.riskLevel];
    }

    calculateContextRisk() {
        let risk = 0;
        
        // Website-specific risk
        const highRiskSites = ['google.com', 'facebook.com', 'youtube.com', 'amazon.com'];
        if (highRiskSites.includes(this.currentContext.website)) {
            risk += 10;
        }
        
        // Time-based risk
        if (this.currentContext.timeOfDay === 'night') {
            risk += 5; // Lower activity expected
        }
        
        // Session duration risk
        if (this.currentContext.sessionDuration > 3600000) { // > 1 hour
            risk += 10;
        }
        
        // Page type risk
        if (this.currentContext.pageType === 'search') {
            risk += 5; // Search pages are more monitored
        }
        
        return risk;
    }

    calculateRiskLevel(score) {
        const thresholds = this.adaptationConfig.riskThresholds;
        
        if (score >= thresholds.critical) return 'critical';
        if (score >= thresholds.high) return 'high';
        if (score >= thresholds.medium) return 'medium';
        if (score >= thresholds.low) return 'low';
        return 'minimal';
    }

    adaptBehavior() {
        const strategy = this.getAdaptationStrategy();
        
        // Apply behavior modifications
        this.behaviorModifiers = {
            clickProbability: strategy.clickProbability,
            navigationFrequency: strategy.navigationFrequency,
            readingSpeed: strategy.readingSpeed,
            interactionDelay: strategy.interactionDelay,
            stealthLevel: strategy.stealthLevel
        };
        
        // Apply context-specific adaptations
        this.applyContextAdaptations();
        
        // Update current context
        this.currentContext.lastAdaptation = Date.now();
        
        // Log adaptation for debugging
        if (this.currentContext.riskLevel !== 'minimal') {
            console.log(`🔄 Adaptation applied: ${this.currentContext.adaptationLevel} (Risk: ${this.currentContext.riskLevel})`);
        }
    }

    getAdaptationStrategy() {
        const level = this.currentContext.adaptationLevel;
        
        const strategies = {
            emergency: {
                clickProbability: 0.3, // Drastically reduce clicks
                navigationFrequency: 0.2, // Minimal navigation
                readingSpeed: 1.5, // Faster reading
                interactionDelay: 2.0, // Much longer delays
                stealthLevel: 2.0 // Maximum stealth
            },
            aggressive: {
                clickProbability: 0.5,
                navigationFrequency: 0.4,
                readingSpeed: 1.3,
                interactionDelay: 1.5,
                stealthLevel: 1.5
            },
            moderate: {
                clickProbability: 0.7,
                navigationFrequency: 0.6,
                readingSpeed: 1.1,
                interactionDelay: 1.2,
                stealthLevel: 1.2
            },
            light: {
                clickProbability: 0.9,
                navigationFrequency: 0.8,
                readingSpeed: 1.0,
                interactionDelay: 1.1,
                stealthLevel: 1.1
            },
            monitoring: {
                clickProbability: 1.0,
                navigationFrequency: 1.0,
                readingSpeed: 1.0,
                interactionDelay: 1.0,
                stealthLevel: 1.0
            }
        };
        
        return strategies[level] || strategies.monitoring;
    }

    applyContextAdaptations() {
        // Website-specific adaptations
        this.applyWebsiteAdaptations();
        
        // Time-based adaptations
        this.applyTimeBasedAdaptations();
        
        // Content-based adaptations
        this.applyContentAdaptations();
        
        // Session-based adaptations
        this.applySessionAdaptations();
    }

    applyWebsiteAdaptations() {
        const website = this.currentContext.website;
        
        // High-monitoring websites
        if (website.includes('google.com')) {
            this.behaviorModifiers.clickProbability *= 0.7;
            this.behaviorModifiers.interactionDelay *= 1.3;
        }
        
        // E-commerce websites
        if (website.includes('amazon.com') || website.includes('ebay.com')) {
            this.behaviorModifiers.navigationFrequency *= 1.2;
            this.behaviorModifiers.readingSpeed *= 0.9;
        }
        
        // Social media websites
        if (website.includes('facebook.com') || website.includes('twitter.com')) {
            this.behaviorModifiers.clickProbability *= 0.8;
            this.behaviorModifiers.stealthLevel *= 1.2;
        }
    }

    applyTimeBasedAdaptations() {
        const timeOfDay = this.currentContext.timeOfDay;
        
        switch (timeOfDay) {
            case 'morning':
                this.behaviorModifiers.readingSpeed *= 1.1; // More alert
                this.behaviorModifiers.clickProbability *= 1.1;
                break;
            case 'afternoon':
                // Default behavior
                break;
            case 'evening':
                this.behaviorModifiers.readingSpeed *= 0.9; // More relaxed
                this.behaviorModifiers.navigationFrequency *= 1.1;
                break;
            case 'night':
                this.behaviorModifiers.clickProbability *= 0.7; // Less activity
                this.behaviorModifiers.interactionDelay *= 1.2;
                break;
        }
    }

    applyContentAdaptations() {
        const contentType = this.currentContext.contentType;
        const pageType = this.currentContext.pageType;
        
        // Long-form content
        if (contentType === 'long-form') {
            this.behaviorModifiers.readingSpeed *= 0.8;
            this.behaviorModifiers.navigationFrequency *= 0.7;
        }
        
        // Short-form content
        if (contentType === 'short-form') {
            this.behaviorModifiers.readingSpeed *= 1.2;
            this.behaviorModifiers.navigationFrequency *= 1.3;
        }
        
        // Article pages
        if (pageType === 'article') {
            this.behaviorModifiers.readingSpeed *= 0.9;
            this.behaviorModifiers.clickProbability *= 1.1;
        }
        
        // Search pages
        if (pageType === 'search') {
            this.behaviorModifiers.stealthLevel *= 1.3;
            this.behaviorModifiers.interactionDelay *= 1.2;
        }
    }

    applySessionAdaptations() {
        const sessionDuration = this.currentContext.sessionDuration;
        
        // Long sessions
        if (sessionDuration > 1800000) { // > 30 minutes
            this.behaviorModifiers.clickProbability *= 0.8;
            this.behaviorModifiers.navigationFrequency *= 0.9;
            this.behaviorModifiers.readingSpeed *= 0.9;
        }
        
        // Very long sessions
        if (sessionDuration > 3600000) { // > 1 hour
            this.behaviorModifiers.clickProbability *= 0.6;
            this.behaviorModifiers.navigationFrequency *= 0.7;
            this.behaviorModifiers.interactionDelay *= 1.3;
        }
    }

    recordAdaptation() {
        const adaptation = {
            timestamp: Date.now(),
            context: { ...this.currentContext },
            modifiers: { ...this.behaviorModifiers },
            trigger: this.getAdaptationTrigger()
        };
        
        this.adaptationHistory.push(adaptation);
        
        // Keep only recent adaptations
        if (this.adaptationHistory.length > 100) {
            this.adaptationHistory = this.adaptationHistory.slice(-100);
        }
    }

    getAdaptationTrigger() {
        const triggers = [];
        
        if (this.currentContext.riskLevel !== 'minimal') {
            triggers.push(`risk_${this.currentContext.riskLevel}`);
        }
        
        if (this.currentContext.sessionDuration > 1800000) {
            triggers.push('long_session');
        }
        
        if (this.currentContext.timeOfDay === 'night') {
            triggers.push('night_time');
        }
        
        return triggers.length > 0 ? triggers : ['context_change'];
    }

    // Public methods for other modules to access behavior modifiers
    getClickProbabilityModifier() {
        return this.behaviorModifiers.clickProbability;
    }

    getNavigationFrequencyModifier() {
        return this.behaviorModifiers.navigationFrequency;
    }

    getReadingSpeedModifier() {
        return this.behaviorModifiers.readingSpeed;
    }

    getInteractionDelayModifier() {
        return this.behaviorModifiers.interactionDelay;
    }

    getStealthLevelModifier() {
        return this.behaviorModifiers.stealthLevel;
    }

    // Dynamic personality switching
    getAdaptedPersonality(basePersonality) {
        const adapted = { ...basePersonality };
        
        // Adjust click probability based on risk level
        adapted.clickProbability *= this.behaviorModifiers.clickProbability;
        adapted.clickProbability = Math.max(0.05, Math.min(0.25, adapted.clickProbability));
        
        // Adjust reading speed
        adapted.readingSpeed = this.adaptReadingSpeed(adapted.readingSpeed);
        
        // Adjust attention span based on session duration
        adapted.attentionSpan = this.adaptAttentionSpan(adapted.attentionSpan);
        
        return adapted;
    }

    adaptReadingSpeed(baseSpeed) {
        const speedMap = {
            'slow': 'very_slow',
            'medium': 'slow',
            'fast': 'medium'
        };
        
        const adaptedSpeed = speedMap[baseSpeed] || baseSpeed;
        return this.behaviorModifiers.readingSpeed < 0.8 ? adaptedSpeed : baseSpeed;
    }

    adaptAttentionSpan(baseSpan) {
        const spanMap = {
            'short': 'very_short',
            'medium': 'short',
            'long': 'medium'
        };
        
        const adaptedSpan = spanMap[baseSpan] || baseSpan;
        return this.currentContext.sessionDuration > 1800000 ? adaptedSpan : baseSpan;
    }

    // Real-time risk assessment
    getCurrentRiskAssessment() {
        return {
            riskLevel: this.currentContext.riskLevel,
            adaptationLevel: this.currentContext.adaptationLevel,
            context: this.currentContext,
            modifiers: this.behaviorModifiers,
            recommendations: this.getRecommendations()
        };
    }

    getRecommendations() {
        const recommendations = [];
        
        if (this.currentContext.riskLevel === 'critical') {
            recommendations.push('Emergency mode: Minimize all interactions');
            recommendations.push('Increase delays between actions');
            recommendations.push('Consider switching to different website');
        } else if (this.currentContext.riskLevel === 'high') {
            recommendations.push('High risk: Reduce click frequency');
            recommendations.push('Increase reading time on pages');
            recommendations.push('Add more natural pauses');
        } else if (this.currentContext.riskLevel === 'medium') {
            recommendations.push('Moderate risk: Slightly reduce activity');
            recommendations.push('Vary interaction patterns');
        }
        
        return recommendations;
    }

    // Cleanup
    cleanup() {
        this.stopAdaptation();
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DynamicAdaptationEngine;
}

// Global registration
if (typeof window !== 'undefined' && !window.DynamicAdaptationEngine) {
    window.DynamicAdaptationEngine = DynamicAdaptationEngine;
}
