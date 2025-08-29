/**
 * Stealth Monitor - Tracks bot detection avoidance and human behavior scoring
 */

class StealthMonitor {
    constructor() {
        this.stealthMetrics = {
            humanBehaviorScore: 0,
            botDetectionRisk: 0,
            stealthEffectiveness: 0,
            behaviorConsistency: 0,
            patternAnalysis: 0
        };
        
        this.behaviorPatterns = {
            mouseMovements: [],
            clicks: [],
            scrolls: [],
            typing: [],
            navigation: []
        };
        
        this.detectionSignals = {
            suspiciousPatterns: [],
            botIndicators: [],
            humanIndicators: [],
            riskFactors: []
        };
        
        this.stealthConfig = {
            enabled: true,
            monitoringInterval: 30000, // 30 seconds - increased for stealth
            maxPatternHistory: 200, // Reduced history for better stealth
            riskThreshold: 0.95, // Very high threshold to reduce false positives
            humanThreshold: 0.3, // Lowered threshold for more realistic assessment
            suspiciousPatternThreshold: 0.98, // Very high threshold for suspicious patterns
            debugMode: false, // Disable debug logging for stealth
            stealthMode: true, // Enable enhanced stealth mode
            consoleLogging: false, // Disable all console logging
            windowExposure: false, // Disable window object exposure
            chromeStorage: false // Disable chrome storage usage
        };
        
        this.monitoringTimer = null;
    }

    /**
     * Initialize stealth monitor
     */
    initialize() {
        if (this.stealthConfig.enabled) {
            this.startMonitoring();
        }
        
        return this.stealthMetrics;
    }

    /**
     * Start monitoring behavior patterns
     */
    startMonitoring() {
        if (this.monitoringTimer) {
            clearInterval(this.monitoringTimer);
        }
        
        this.monitoringTimer = setInterval(() => {
            this.analyzeBehaviorPatterns();
            this.calculateStealthMetrics();
        }, this.stealthConfig.monitoringInterval);
    }

    /**
     * Stop monitoring
     */
    stopMonitoring() {
        if (this.monitoringTimer) {
            clearInterval(this.monitoringTimer);
            this.monitoringTimer = null;
        }
    }

    /**
     * Record behavior pattern
     */
    recordBehaviorPattern(type, data) {
        if (!this.stealthConfig.enabled) return;
        
        const pattern = {
            type: type,
            timestamp: Date.now(),
            data: data
        };
        
        switch (type) {
            case 'mouse_movement':
                this.behaviorPatterns.mouseMovements.push(pattern);
                break;
            case 'click':
                this.behaviorPatterns.clicks.push(pattern);
                break;
            case 'scroll':
                this.behaviorPatterns.scrolls.push(pattern);
                break;
            case 'typing':
                this.behaviorPatterns.typing.push(pattern);
                break;
            case 'navigation':
                this.behaviorPatterns.navigation.push(pattern);
                break;
        }
        
        // Limit pattern history
        this.limitPatternHistory();
    }

    /**
     * Limit pattern history size
     */
    limitPatternHistory() {
        Object.keys(this.behaviorPatterns).forEach(key => {
            if (this.behaviorPatterns[key].length > this.stealthConfig.maxPatternHistory) {
                this.behaviorPatterns[key] = this.behaviorPatterns[key].slice(-this.stealthConfig.maxPatternHistory);
            }
        });
    }

    /**
     * Analyze behavior patterns for human-like characteristics
     */
    analyzeBehaviorPatterns() {
        this.analyzeMouseMovements();
        this.analyzeClickPatterns();
        this.analyzeScrollPatterns();
        this.analyzeTypingPatterns();
        this.analyzeNavigationPatterns();
        this.detectSuspiciousPatterns();
    }

    /**
     * Analyze mouse movement patterns
     */
    analyzeMouseMovements() {
        const movements = this.behaviorPatterns.mouseMovements;
        if (movements.length < 10) return;
        
        const recentMovements = movements.slice(-50);
        let humanScore = 0;
        let botScore = 0;
        
        // Check for natural acceleration/deceleration
        const speeds = this.calculateMouseSpeeds(recentMovements);
        const speedVariation = this.calculateVariation(speeds);
        
        if (speedVariation > 0.3) {
            humanScore += 0.3; // Natural speed variation
        } else {
            botScore += 0.3; // Too consistent
        }
        
        // Check for curved paths vs straight lines
        const pathCurvature = this.calculatePathCurvature(recentMovements);
        if (pathCurvature > 0.2) {
            humanScore += 0.2; // Curved paths are more human-like
        } else {
            botScore += 0.2; // Too straight
        }
        
        // Check for natural pauses
        const pauses = this.detectNaturalPauses(recentMovements);
        if (pauses > 0) {
            humanScore += 0.2; // Natural pauses
        } else {
            botScore += 0.2; // No pauses
        }
        
        // Check for realistic timing
        const timing = this.analyzeTimingPatterns(recentMovements);
        if (timing.isRealistic) {
            humanScore += 0.3; // Realistic timing
        } else {
            botScore += 0.3; // Unrealistic timing
        }
        
        this.detectionSignals.humanIndicators.push({
            type: 'mouse_movement',
            score: humanScore,
            timestamp: Date.now()
        });
        
        this.detectionSignals.botIndicators.push({
            type: 'mouse_movement',
            score: botScore,
            timestamp: Date.now()
        });
    }

    /**
     * Analyze click patterns
     */
    analyzeClickPatterns() {
        const clicks = this.behaviorPatterns.clicks;
        if (clicks.length < 5) return;
        
        const recentClicks = clicks.slice(-20);
        let humanScore = 0;
        let botScore = 0;
        
        // Check for click timing variation
        const clickIntervals = this.calculateClickIntervals(recentClicks);
        const intervalVariation = this.calculateVariation(clickIntervals);
        
        if (intervalVariation > 0.4) {
            humanScore += 0.3; // Natural timing variation
        } else {
            botScore += 0.3; // Too consistent
        }
        
        // Check for click precision (slight offsets)
        const clickPrecision = this.analyzeClickPrecision(recentClicks);
        if (clickPrecision.hasOffset) {
            humanScore += 0.2; // Natural imprecision
        } else {
            botScore += 0.2; // Too precise
        }
        
        // Check for double-click patterns
        const doubleClicks = this.detectDoubleClicks(recentClicks);
        if (doubleClicks > 0) {
            humanScore += 0.2; // Natural double-clicks
        }
        
        // Check for click context (hover before click)
        const hoverBeforeClick = this.analyzeHoverBeforeClick(recentClicks);
        if (hoverBeforeClick > 0.5) {
            humanScore += 0.3; // Natural hover-click pattern
        } else {
            botScore += 0.3; // No hover pattern
        }
        
        this.detectionSignals.humanIndicators.push({
            type: 'click',
            score: humanScore,
            timestamp: Date.now()
        });
        
        this.detectionSignals.botIndicators.push({
            type: 'click',
            score: botScore,
            timestamp: Date.now()
        });
    }

    /**
     * Analyze scroll patterns
     */
    analyzeScrollPatterns() {
        const scrolls = this.behaviorPatterns.scrolls;
        if (scrolls.length < 5) return;
        
        const recentScrolls = scrolls.slice(-20);
        let humanScore = 0;
        let botScore = 0;
        
        // Check for scroll speed variation
        const scrollSpeeds = this.calculateScrollSpeeds(recentScrolls);
        const speedVariation = this.calculateVariation(scrollSpeeds);
        
        if (speedVariation > 0.3) {
            humanScore += 0.3; // Natural speed variation
        } else {
            botScore += 0.3; // Too consistent
        }
        
        // Check for scroll pauses
        const scrollPauses = this.detectScrollPauses(recentScrolls);
        if (scrollPauses > 0) {
            humanScore += 0.2; // Natural pauses
        } else {
            botScore += 0.2; // No pauses
        }
        
        // Check for scroll direction changes
        const directionChanges = this.analyzeScrollDirectionChanges(recentScrolls);
        if (directionChanges > 0) {
            humanScore += 0.2; // Natural direction changes
        } else {
            botScore += 0.2; // No direction changes
        }
        
        // Check for scroll distance variation
        const scrollDistances = this.calculateScrollDistances(recentScrolls);
        const distanceVariation = this.calculateVariation(scrollDistances);
        
        if (distanceVariation > 0.4) {
            humanScore += 0.3; // Natural distance variation
        } else {
            botScore += 0.3; // Too consistent
        }
        
        this.detectionSignals.humanIndicators.push({
            type: 'scroll',
            score: humanScore,
            timestamp: Date.now()
        });
        
        this.detectionSignals.botIndicators.push({
            type: 'scroll',
            score: botScore,
            timestamp: Date.now()
        });
    }

    /**
     * Analyze typing patterns
     */
    analyzeTypingPatterns() {
        const typing = this.behaviorPatterns.typing;
        if (typing.length < 10) return;
        
        const recentTyping = typing.slice(-50);
        let humanScore = 0;
        let botScore = 0;
        
        // Check for typing speed variation
        const typingSpeeds = this.calculateTypingSpeeds(recentTyping);
        const speedVariation = this.calculateVariation(typingSpeeds);
        
        if (speedVariation > 0.3) {
            humanScore += 0.3; // Natural speed variation
        } else {
            botScore += 0.3; // Too consistent
        }
        
        // Check for typos
        const typos = this.detectTypos(recentTyping);
        if (typos > 0) {
            humanScore += 0.2; // Natural typos
        } else {
            botScore += 0.2; // No typos
        }
        
        // Check for typing pauses
        const typingPauses = this.detectTypingPauses(recentTyping);
        if (typingPauses > 0) {
            humanScore += 0.2; // Natural pauses
        } else {
            botScore += 0.2; // No pauses
        }
        
        // Check for backspace usage
        const backspaces = this.detectBackspaces(recentTyping);
        if (backspaces > 0) {
            humanScore += 0.3; // Natural corrections
        } else {
            botScore += 0.3; // No corrections
        }
        
        this.detectionSignals.humanIndicators.push({
            type: 'typing',
            score: humanScore,
            timestamp: Date.now()
        });
        
        this.detectionSignals.botIndicators.push({
            type: 'typing',
            score: botScore,
            timestamp: Date.now()
        });
    }

    /**
     * Analyze navigation patterns
     */
    analyzeNavigationPatterns() {
        const navigation = this.behaviorPatterns.navigation;
        if (navigation.length < 3) return;
        
        const recentNavigation = navigation.slice(-10);
        let humanScore = 0;
        let botScore = 0;
        
        // Check for navigation timing
        const navigationIntervals = this.calculateNavigationIntervals(recentNavigation);
        const intervalVariation = this.calculateVariation(navigationIntervals);
        
        if (intervalVariation > 0.4) {
            humanScore += 0.3; // Natural timing variation
        } else {
            botScore += 0.3; // Too consistent
        }
        
        // Check for navigation context
        const navigationContext = this.analyzeNavigationContext(recentNavigation);
        if (navigationContext.isContextual) {
            humanScore += 0.3; // Contextual navigation
        } else {
            botScore += 0.3; // Random navigation
        }
        
        // Check for back/forward usage
        const backForwardUsage = this.analyzeBackForwardUsage(recentNavigation);
        if (backForwardUsage > 0) {
            humanScore += 0.2; // Natural back/forward usage
        } else {
            botScore += 0.2; // No back/forward usage
        }
        
        // Check for tab switching
        const tabSwitching = this.analyzeTabSwitching(recentNavigation);
        if (tabSwitching > 0) {
            humanScore += 0.2; // Natural tab switching
        } else {
            botScore += 0.2; // No tab switching
        }
        
        this.detectionSignals.humanIndicators.push({
            type: 'navigation',
            score: humanScore,
            timestamp: Date.now()
        });
        
        this.detectionSignals.botIndicators.push({
            type: 'navigation',
            score: botScore,
            timestamp: Date.now()
        });
    }

    /**
     * Detect suspicious patterns with improved thresholds
     */
    detectSuspiciousPatterns() {
        const suspiciousPatterns = [];
        
        // Only analyze if we have enough data
        const totalPatterns = this.behaviorPatterns.mouseMovements.length + 
                            this.behaviorPatterns.clicks.length + 
                            this.behaviorPatterns.scrolls.length + 
                            this.behaviorPatterns.typing.length + 
                            this.behaviorPatterns.navigation.length;
        
        if (totalPatterns < 20) {
            // Not enough data to make meaningful analysis
            this.detectionSignals.suspiciousPatterns = suspiciousPatterns;
            return;
        }
        
        // Check for too-perfect timing with higher threshold
        const perfectTiming = this.detectPerfectTiming();
        if (perfectTiming && perfectTiming.detected && perfectTiming.confidence > this.stealthConfig.suspiciousPatternThreshold) {
            suspiciousPatterns.push({
                type: 'perfect_timing',
                severity: 'medium',
                description: 'Consistent timing patterns detected',
                confidence: perfectTiming.confidence
            });
        }
        
        // Check for too-fast interactions with more realistic thresholds
        const tooFast = this.detectTooFastInteractions();
        if (tooFast && tooFast.detected && tooFast.confidence > 0.95) { // Very high threshold
            suspiciousPatterns.push({
                type: 'too_fast',
                severity: 'medium',
                description: 'Very fast interactions detected',
                confidence: tooFast.confidence
            });
        }
        
        // Check for repetitive patterns with higher threshold
        const repetitive = this.detectRepetitivePatterns();
        if (repetitive && repetitive.detected && repetitive.confidence > this.stealthConfig.suspiciousPatternThreshold) {
            suspiciousPatterns.push({
                type: 'repetitive',
                severity: 'low',
                description: 'Some repetitive patterns detected',
                confidence: repetitive.confidence
            });
        }
        
        // Check for lack of natural variation with more lenient threshold
        const noVariation = this.detectNoVariation();
        if (noVariation && noVariation.detected && noVariation.confidence > 0.95) { // Very high threshold
            suspiciousPatterns.push({
                type: 'no_variation',
                severity: 'medium',
                description: 'Limited variation in behavior',
                confidence: noVariation.confidence
            });
        }
        
        this.detectionSignals.suspiciousPatterns = suspiciousPatterns;
    }

    /**
     * Calculate stealth metrics
     */
    calculateStealthMetrics() {
        // Calculate human behavior score
        const humanIndicators = this.detectionSignals.humanIndicators.slice(-20);
        const humanScore = humanIndicators.reduce((sum, indicator) => sum + indicator.score, 0) / humanIndicators.length;
        
        // Calculate bot detection risk
        const botIndicators = this.detectionSignals.botIndicators.slice(-20);
        const botScore = botIndicators.reduce((sum, indicator) => sum + indicator.score, 0) / botIndicators.length;
        
        // Calculate behavior consistency
        const consistency = this.calculateBehaviorConsistency();
        
        // Calculate pattern analysis score
        const patternScore = this.calculatePatternAnalysisScore();
        
        // Update metrics
        this.stealthMetrics = {
            humanBehaviorScore: Math.min(1, Math.max(0, humanScore)),
            botDetectionRisk: Math.min(1, Math.max(0, botScore)),
            stealthEffectiveness: Math.min(1, Math.max(0, 1 - botScore)),
            behaviorConsistency: Math.min(1, Math.max(0, consistency)),
            patternAnalysis: Math.min(1, Math.max(0, patternScore))
        };
        
        // Check for high risk
        if (this.stealthMetrics.botDetectionRisk > this.stealthConfig.riskThreshold) {
            this.triggerRiskAlert();
        }
    }

    /**
     * Calculate behavior consistency
     */
    calculateBehaviorConsistency() {
        const allPatterns = [
            ...this.behaviorPatterns.mouseMovements,
            ...this.behaviorPatterns.clicks,
            ...this.behaviorPatterns.scrolls,
            ...this.behaviorPatterns.typing,
            ...this.behaviorPatterns.navigation
        ];
        
        if (allPatterns.length < 10) return 0.5;
        
        // Calculate timing consistency
        const timings = allPatterns.map(p => p.timestamp);
        const intervals = [];
        
        for (let i = 1; i < timings.length; i++) {
            intervals.push(timings[i] - timings[i - 1]);
        }
        
        const variation = this.calculateVariation(intervals);
        return Math.max(0, 1 - variation);
    }

    /**
     * Calculate pattern analysis score
     */
    calculatePatternAnalysisScore() {
        let score = 0;
        
        // Check for natural patterns
        if (this.behaviorPatterns.mouseMovements.length > 0) score += 0.2;
        if (this.behaviorPatterns.clicks.length > 0) score += 0.2;
        if (this.behaviorPatterns.scrolls.length > 0) score += 0.2;
        if (this.behaviorPatterns.typing.length > 0) score += 0.2;
        if (this.behaviorPatterns.navigation.length > 0) score += 0.2;
        
        // Check for suspicious patterns
        const suspiciousCount = this.detectionSignals.suspiciousPatterns.length;
        score -= suspiciousCount * 0.1;
        
        return Math.max(0, Math.min(1, score));
    }

    /**
     * Trigger risk alert
     */
    triggerRiskAlert() {
        const alert = {
            type: 'high_risk',
            timestamp: Date.now(),
            metrics: { ...this.stealthMetrics },
            suspiciousPatterns: [...this.detectionSignals.suspiciousPatterns]
        };
        
        this.detectionSignals.riskFactors.push(alert);
        
        // Stealth logging - only log if debug mode is enabled
        if (this.stealthConfig.debugMode) {
            console.warn('Stealth Monitor: High bot detection risk detected', alert);
        }
        
        // Could trigger additional actions here
        // - Slow down automation
        // - Add more human-like delays
        // - Change behavior patterns
    }

    /**
     * Get stealth metrics
     */
    getStealthMetrics() {
        return { ...this.stealthMetrics };
    }

    /**
     * Get detection signals
     */
    getDetectionSignals() {
        return {
            suspiciousPatterns: [...this.detectionSignals.suspiciousPatterns],
            botIndicators: [...this.detectionSignals.botIndicators],
            humanIndicators: [...this.detectionSignals.humanIndicators],
            riskFactors: [...this.detectionSignals.riskFactors]
        };
    }

    /**
     * Get stealth status
     */
    getStealthStatus() {
        const riskLevel = this.stealthMetrics.botDetectionRisk > this.stealthConfig.riskThreshold ? 'high' :
                         this.stealthMetrics.botDetectionRisk > 0.5 ? 'medium' : 'low';
        
        const humanLevel = this.stealthMetrics.humanBehaviorScore > this.stealthConfig.humanThreshold ? 'excellent' :
                          this.stealthMetrics.humanBehaviorScore > 0.6 ? 'good' : 'poor';
        
        return {
            riskLevel: riskLevel,
            humanLevel: humanLevel,
            overallScore: this.stealthMetrics.stealthEffectiveness,
            recommendations: this.getRecommendations()
        };
    }

    /**
     * Get recommendations for improving stealth
     */
    getRecommendations() {
        const recommendations = [];
        
        if (this.stealthMetrics.botDetectionRisk > 0.7) {
            recommendations.push('Add more random delays between actions');
            recommendations.push('Increase variation in mouse movement patterns');
            recommendations.push('Add more natural pauses and hesitations');
        }
        
        if (this.stealthMetrics.humanBehaviorScore < 0.6) {
            recommendations.push('Improve mouse movement naturalness');
            recommendations.push('Add more realistic typing patterns');
            recommendations.push('Include occasional typos and corrections');
        }
        
        if (this.stealthMetrics.behaviorConsistency > 0.8) {
            recommendations.push('Reduce behavior consistency - add more variation');
            recommendations.push('Introduce more random elements');
        }
        
        return recommendations;
    }

    // Utility methods for pattern analysis
    calculateMouseSpeeds(movements) {
        const speeds = [];
        for (let i = 1; i < movements.length; i++) {
            const prev = movements[i - 1].data;
            const curr = movements[i].data;
            const timeDiff = movements[i].timestamp - movements[i - 1].timestamp;
            const distance = Math.sqrt(Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2));
            speeds.push(distance / timeDiff);
        }
        return speeds;
    }

    calculateVariation(values) {
        if (values.length < 2) return 0;
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        return Math.sqrt(variance) / mean;
    }

    calculatePathCurvature(movements) {
        if (movements.length < 3) return 0;
        let totalCurvature = 0;
        for (let i = 1; i < movements.length - 1; i++) {
            const prev = movements[i - 1].data;
            const curr = movements[i].data;
            const next = movements[i + 1].data;
            
            const angle = Math.atan2(next.y - curr.y, next.x - curr.x) - 
                         Math.atan2(curr.y - prev.y, curr.x - prev.x);
            totalCurvature += Math.abs(angle);
        }
        return totalCurvature / (movements.length - 2);
    }

    detectNaturalPauses(movements) {
        let pauseCount = 0;
        for (let i = 1; i < movements.length; i++) {
            const timeDiff = movements[i].timestamp - movements[i - 1].timestamp;
            if (timeDiff > 1000) { // Pause longer than 1 second
                pauseCount++;
            }
        }
        return pauseCount;
    }

    analyzeTimingPatterns(movements) {
        const intervals = [];
        for (let i = 1; i < movements.length; i++) {
            intervals.push(movements[i].timestamp - movements[i - 1].timestamp);
        }
        
        const variation = this.calculateVariation(intervals);
        return {
            isRealistic: variation > 0.2 && variation < 2.0,
            variation: variation
        };
    }

    calculateClickIntervals(clicks) {
        const intervals = [];
        for (let i = 1; i < clicks.length; i++) {
            intervals.push(clicks[i].timestamp - clicks[i - 1].timestamp);
        }
        return intervals;
    }

    analyzeClickPrecision(clicks) {
        let hasOffset = false;
        for (const click of clicks) {
            if (click.data && click.data.offsetX !== undefined && click.data.offsetY !== undefined) {
                if (click.data.offsetX !== 0 || click.data.offsetY !== 0) {
                    hasOffset = true;
                    break;
                }
            }
        }
        return { hasOffset };
    }

    detectDoubleClicks(clicks) {
        let doubleClickCount = 0;
        for (let i = 1; i < clicks.length; i++) {
            const timeDiff = clicks[i].timestamp - clicks[i - 1].timestamp;
            if (timeDiff < 500) { // Double-click threshold
                doubleClickCount++;
            }
        }
        return doubleClickCount;
    }

    analyzeHoverBeforeClick(clicks) {
        // This would need to be implemented based on actual hover data
        return Math.random() * 0.8 + 0.2; // Placeholder
    }

    calculateScrollSpeeds(scrolls) {
        const speeds = [];
        for (let i = 1; i < scrolls.length; i++) {
            const timeDiff = scrolls[i].timestamp - scrolls[i - 1].timestamp;
            const distance = Math.abs(scrolls[i].data.deltaY - scrolls[i - 1].data.deltaY);
            speeds.push(distance / timeDiff);
        }
        return speeds;
    }

    detectScrollPauses(scrolls) {
        let pauseCount = 0;
        for (let i = 1; i < scrolls.length; i++) {
            const timeDiff = scrolls[i].timestamp - scrolls[i - 1].timestamp;
            if (timeDiff > 2000) { // Pause longer than 2 seconds
                pauseCount++;
            }
        }
        return pauseCount;
    }

    analyzeScrollDirectionChanges(scrolls) {
        let directionChanges = 0;
        for (let i = 1; i < scrolls.length; i++) {
            const prevDirection = Math.sign(scrolls[i - 1].data.deltaY);
            const currDirection = Math.sign(scrolls[i].data.deltaY);
            if (prevDirection !== currDirection) {
                directionChanges++;
            }
        }
        return directionChanges;
    }

    calculateScrollDistances(scrolls) {
        return scrolls.map(scroll => Math.abs(scroll.data.deltaY));
    }

    calculateTypingSpeeds(typing) {
        const speeds = [];
        for (let i = 1; i < typing.length; i++) {
            const timeDiff = typing[i].timestamp - typing[i - 1].timestamp;
            speeds.push(timeDiff);
        }
        return speeds;
    }

    detectTypos(typing) {
        return typing.filter(t => t.data && t.data.isTypo).length;
    }

    detectTypingPauses(typing) {
        let pauseCount = 0;
        for (let i = 1; i < typing.length; i++) {
            const timeDiff = typing[i].timestamp - typing[i - 1].timestamp;
            if (timeDiff > 1000) { // Pause longer than 1 second
                pauseCount++;
            }
        }
        return pauseCount;
    }

    detectBackspaces(typing) {
        return typing.filter(t => t.data && t.data.isBackspace).length;
    }

    calculateNavigationIntervals(navigation) {
        const intervals = [];
        for (let i = 1; i < navigation.length; i++) {
            intervals.push(navigation[i].timestamp - navigation[i - 1].timestamp);
        }
        return intervals;
    }

    analyzeNavigationContext(navigation) {
        // This would need to be implemented based on actual navigation data
        return { isContextual: Math.random() > 0.3 };
    }

    analyzeBackForwardUsage(navigation) {
        return navigation.filter(n => n.data && n.data.type === 'back_forward').length;
    }

    analyzeTabSwitching(navigation) {
        return navigation.filter(n => n.data && n.data.type === 'tab_switch').length;
    }

    detectPerfectTiming() {
        // Check for too-perfect timing patterns
        const allPatterns = [
            ...this.behaviorPatterns.mouseMovements,
            ...this.behaviorPatterns.clicks,
            ...this.behaviorPatterns.scrolls
        ];
        
        if (allPatterns.length < 10) return false;
        
        const timings = allPatterns.map(p => p.timestamp);
        const intervals = [];
        
        for (let i = 1; i < timings.length; i++) {
            intervals.push(timings[i] - timings[i - 1]);
        }
        
        const variation = this.calculateVariation(intervals);
        const confidence = Math.max(0, (0.1 - variation) / 0.1); // Higher confidence for lower variation
        
        return {
            detected: variation < 0.1,
            confidence: confidence,
            variation: variation
        };
    }

    detectTooFastInteractions() {
        const allPatterns = [
            ...this.behaviorPatterns.mouseMovements,
            ...this.behaviorPatterns.clicks,
            ...this.behaviorPatterns.scrolls
        ];
        
        if (allPatterns.length < 5) return false;
        
        const timings = allPatterns.map(p => p.timestamp);
        const intervals = [];
        
        for (let i = 1; i < timings.length; i++) {
            intervals.push(timings[i] - timings[i - 1]);
        }
        
        const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
        const confidence = Math.max(0, (50 - avgInterval) / 50); // Higher confidence for faster interactions
        
        return {
            detected: avgInterval < 50,
            confidence: confidence,
            avgInterval: avgInterval
        };
    }

    detectRepetitivePatterns() {
        // Check for repetitive patterns in behavior
        const allPatterns = [
            ...this.behaviorPatterns.mouseMovements,
            ...this.behaviorPatterns.clicks,
            ...this.behaviorPatterns.scrolls
        ];
        
        if (allPatterns.length < 20) return false;
        
        // Simple repetition detection
        const recentPatterns = allPatterns.slice(-20);
        const patternTypes = recentPatterns.map(p => p.type);
        
        // Check if same pattern repeats too often
        const typeCounts = {};
        patternTypes.forEach(type => {
            typeCounts[type] = (typeCounts[type] || 0) + 1;
        });
        
        const maxCount = Math.max(...Object.values(typeCounts));
        const repetitionRatio = maxCount / recentPatterns.length;
        const confidence = Math.max(0, (repetitionRatio - 0.75) / 0.25); // Higher confidence for higher repetition
        
        return {
            detected: maxCount > 15,
            confidence: confidence,
            repetitionRatio: repetitionRatio
        };
    }

    detectNoVariation() {
        const allPatterns = [
            ...this.behaviorPatterns.mouseMovements,
            ...this.behaviorPatterns.clicks,
            ...this.behaviorPatterns.scrolls,
            ...this.behaviorPatterns.typing
        ];
        
        if (allPatterns.length < 10) return false;
        
        const timings = allPatterns.map(p => p.timestamp);
        const intervals = [];
        
        for (let i = 1; i < timings.length; i++) {
            intervals.push(timings[i] - timings[i - 1]);
        }
        
        const variation = this.calculateVariation(intervals);
        const confidence = Math.max(0, (0.05 - variation) / 0.05); // Higher confidence for lower variation
        
        return {
            detected: variation < 0.05,
            confidence: confidence,
            variation: variation
        };
    }
}

// Export for use in other modules with enhanced stealth protection
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StealthMonitor;
} else if (typeof window !== 'undefined' && !window.StealthMonitor) {
    window.StealthMonitor = StealthMonitor;
}
