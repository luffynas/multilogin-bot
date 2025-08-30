class AnalyticsMonitor {
    constructor() {
        this.analyticsConfig = {
            enabled: true,
            trackingInterval: 30000, // 30 seconds
            dataRetention: 7 * 24 * 60 * 60 * 1000, // 7 days
            maxDataPoints: 1000,
            stealthMode: true
        };
        
        this.metrics = {
            clickThroughRates: [],
            sessionDurations: [],
            navigationPatterns: [],
            adInteractions: [],
            behaviorConsistency: [],
            riskScores: [],
            performanceMetrics: []
        };
        
        this.currentSession = {
            startTime: Date.now(),
            pageViews: 0,
            adClicks: 0,
            adViews: 0,
            navigationCount: 0,
            readingTime: 0,
            riskLevel: 'low'
        };
        
        this.historicalData = {
            sessions: [],
            dailyStats: [],
            weeklyTrends: []
        };
        
        this.monitoringTimer = null;
    }

    initialize() {
        if (!this.analyticsConfig.enabled) return this;
        
        this.startMonitoring();
        this.setupDataCleanup();
        this.loadHistoricalData();
        
        return this;
    }

    startMonitoring() {
        this.monitoringTimer = setInterval(() => {
            this.collectMetrics();
            this.analyzeBehavior();
            this.updateRiskScore();
            this.saveMetrics();
        }, this.analyticsConfig.trackingInterval);
    }

    stopMonitoring() {
        if (this.monitoringTimer) {
            clearInterval(this.monitoringTimer);
            this.monitoringTimer = null;
        }
    }

    collectMetrics() {
        const currentTime = Date.now();
        const sessionDuration = currentTime - this.currentSession.startTime;

        // Click-through rate tracking
        if (this.currentSession.adViews > 0) {
            const ctr = (this.currentSession.adClicks / this.currentSession.adViews) * 100;
            this.metrics.clickThroughRates.push({
                timestamp: currentTime,
                value: ctr,
                sessionId: this.currentSession.startTime
            });
        }

        // Session duration tracking
        this.metrics.sessionDurations.push({
            timestamp: currentTime,
            value: sessionDuration,
            pageViews: this.currentSession.pageViews
        });

        // Navigation pattern tracking
        this.metrics.navigationPatterns.push({
            timestamp: currentTime,
            navigationCount: this.currentSession.navigationCount,
            avgTimePerPage: sessionDuration / Math.max(this.currentSession.pageViews, 1)
        });

        // Ad interaction tracking
        this.metrics.adInteractions.push({
            timestamp: currentTime,
            adClicks: this.currentSession.adClicks,
            adViews: this.currentSession.adViews,
            interactionRate: this.currentSession.adClicks / Math.max(this.currentSession.adViews, 1)
        });

        // Behavior consistency tracking
        this.metrics.behaviorConsistency.push({
            timestamp: currentTime,
            readingTime: this.currentSession.readingTime,
            navigationFrequency: this.currentSession.navigationCount / (sessionDuration / 60000) // per minute
        });

        // Performance metrics
        this.metrics.performanceMetrics.push({
            timestamp: currentTime,
            memoryUsage: this.getMemoryUsage(),
            cpuUsage: this.getCpuUsage(),
            networkLatency: this.getNetworkLatency()
        });

        // Limit data points
        Object.keys(this.metrics).forEach(key => {
            if (this.metrics[key].length > this.analyticsConfig.maxDataPoints) {
                this.metrics[key] = this.metrics[key].slice(-this.analyticsConfig.maxDataPoints);
            }
        });
    }

    analyzeBehavior() {
        const recentMetrics = this.getRecentMetrics(300000); // Last 5 minutes
        
        // Analyze click-through rate consistency
        const ctrAnalysis = this.analyzeCTRConsistency(recentMetrics.clickThroughRates);
        
        // Analyze session duration patterns
        const durationAnalysis = this.analyzeSessionDurationPatterns(recentMetrics.sessionDurations);
        
        // Analyze navigation behavior
        const navigationAnalysis = this.analyzeNavigationBehavior(recentMetrics.navigationPatterns);
        
        // Analyze ad interaction patterns
        const interactionAnalysis = this.analyzeAdInteractionPatterns(recentMetrics.adInteractions);
        
        // Update current session with analysis results
        this.currentSession.behaviorAnalysis = {
            ctrConsistency: ctrAnalysis.consistency,
            durationPattern: durationAnalysis.pattern,
            navigationBehavior: navigationAnalysis.behavior,
            interactionPattern: interactionAnalysis.pattern,
            riskFactors: this.identifyRiskFactors(recentMetrics)
        };
    }

    updateRiskScore() {
        const riskFactors = this.currentSession.behaviorAnalysis?.riskFactors || [];
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
        
        this.currentSession.riskLevel = this.calculateRiskLevel(riskScore);
        this.metrics.riskScores.push({
            timestamp: Date.now(),
            score: riskScore,
            level: this.currentSession.riskLevel,
            factors: riskFactors
        });
    }

    calculateRiskLevel(score) {
        if (score >= 80) return 'critical';
        if (score >= 60) return 'high';
        if (score >= 40) return 'medium';
        if (score >= 20) return 'low';
        return 'minimal';
    }

    identifyRiskFactors(metrics) {
        const factors = [];
        
        // Check for high click-through rates
        if (metrics.clickThroughRates.length > 0) {
            const avgCTR = metrics.clickThroughRates.reduce((sum, m) => sum + m.value, 0) / metrics.clickThroughRates.length;
            if (avgCTR > 20) { // Unrealistic CTR
                factors.push({ type: 'high_ctr', value: avgCTR, threshold: 20 });
            }
        }
        
        // Check for rapid navigation
        if (metrics.navigationPatterns.length > 0) {
            const avgTimePerPage = metrics.navigationPatterns.reduce((sum, m) => sum + m.avgTimePerPage, 0) / metrics.navigationPatterns.length;
            if (avgTimePerPage < 30000) { // Less than 30 seconds per page
                factors.push({ type: 'rapid_navigation', value: avgTimePerPage, threshold: 30000 });
            }
        }
        
        // Check for consistent timing patterns
        if (metrics.behaviorConsistency.length > 5) {
            const timingVariance = this.calculateTimingVariance(metrics.behaviorConsistency);
            if (timingVariance < 0.1) { // Very low variance
                factors.push({ type: 'consistent_timing', value: timingVariance, threshold: 0.1 });
            }
        }
        
        // Check for excessive clicks
        if (metrics.adInteractions.length > 0) {
            const totalClicks = metrics.adInteractions.reduce((sum, m) => sum + m.adClicks, 0);
            if (totalClicks > 10) { // More than 10 clicks in recent period
                factors.push({ type: 'excessive_clicks', value: totalClicks, threshold: 10 });
            }
        }
        
        return factors;
    }

    calculateTimingVariance(metrics) {
        const timestamps = metrics.map(m => m.timestamp);
        const intervals = [];
        
        for (let i = 1; i < timestamps.length; i++) {
            intervals.push(timestamps[i] - timestamps[i-1]);
        }
        
        if (intervals.length === 0) return 1;
        
        const mean = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
        const variance = intervals.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / intervals.length;
        
        return Math.sqrt(variance) / mean; // Coefficient of variation
    }

    getRecentMetrics(timeWindow) {
        const cutoff = Date.now() - timeWindow;
        const recent = {};
        
        Object.keys(this.metrics).forEach(key => {
            recent[key] = this.metrics[key].filter(m => m.timestamp >= cutoff);
        });
        
        return recent;
    }

    analyzeCTRConsistency(ctrMetrics) {
        if (ctrMetrics.length < 2) return { consistency: 'insufficient_data' };
        
        const values = ctrMetrics.map(m => m.value);
        const variance = this.calculateVariance(values);
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        
        return {
            consistency: variance < 0.01 ? 'too_consistent' : variance > 0.1 ? 'too_variable' : 'realistic',
            mean: mean,
            variance: variance
        };
    }

    analyzeSessionDurationPatterns(durationMetrics) {
        if (durationMetrics.length < 2) return { pattern: 'insufficient_data' };
        
        const durations = durationMetrics.map(m => m.value);
        const avgDuration = durations.reduce((sum, val) => sum + val, 0) / durations.length;
        
        return {
            pattern: avgDuration < 60000 ? 'too_short' : avgDuration > 1800000 ? 'too_long' : 'realistic',
            averageDuration: avgDuration
        };
    }

    analyzeNavigationBehavior(navigationMetrics) {
        if (navigationMetrics.length < 2) return { behavior: 'insufficient_data' };
        
        const navRates = navigationMetrics.map(m => m.navigationCount / Math.max(m.avgTimePerPage / 60000, 1));
        const avgNavRate = navRates.reduce((sum, val) => sum + val, 0) / navRates.length;
        
        return {
            behavior: avgNavRate > 2 ? 'too_frequent' : avgNavRate < 0.1 ? 'too_infrequent' : 'realistic',
            averageRate: avgNavRate
        };
    }

    analyzeAdInteractionPatterns(interactionMetrics) {
        if (interactionMetrics.length < 2) return { pattern: 'insufficient_data' };
        
        const interactionRates = interactionMetrics.map(m => m.interactionRate);
        const avgRate = interactionRates.reduce((sum, val) => sum + val, 0) / interactionRates.length;
        
        return {
            pattern: avgRate > 0.3 ? 'too_high' : avgRate < 0.05 ? 'too_low' : 'realistic',
            averageRate: avgRate
        };
    }

    calculateVariance(values) {
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        return variance;
    }

    // Utility methods for performance monitoring
    getMemoryUsage() {
        if (performance.memory) {
            return performance.memory.usedJSHeapSize / performance.memory.totalJSHeapSize;
        }
        return 0;
    }

    getCpuUsage() {
        // Simulate CPU usage based on activity
        return Math.random() * 0.3 + 0.1; // 10-40% range
    }

    getNetworkLatency() {
        // Simulate network latency
        return Math.random() * 100 + 50; // 50-150ms range
    }

    // Event tracking methods
    trackPageView() {
        this.currentSession.pageViews++;
    }

    trackAdView() {
        this.currentSession.adViews++;
    }

    trackAdClick() {
        this.currentSession.adClicks++;
    }

    trackNavigation() {
        this.currentSession.navigationCount++;
    }

    trackReadingTime(duration) {
        this.currentSession.readingTime += duration;
    }

    // Data management
    saveMetrics() {
        if (!this.analyticsConfig.stealthMode) return;
        
        try {
            const data = {
                metrics: this.metrics,
                currentSession: this.currentSession,
                historicalData: this.historicalData,
                timestamp: Date.now()
            };
            
            // Use stealth storage
            if (window._stealth_storage) {
                new window._stealth_storage().set('analytics_data', data);
            } else {
                localStorage.setItem('analytics_data', JSON.stringify(data));
            }
        } catch (error) {
            // Silent fail for stealth
        }
    }

    loadHistoricalData() {
        try {
            let data;
            if (window._stealth_storage) {
                data = new window._stealth_storage().get('analytics_data');
            } else {
                const stored = localStorage.getItem('analytics_data');
                data = stored ? JSON.parse(stored) : null;
            }
            
            if (data && data.timestamp) {
                const age = Date.now() - data.timestamp;
                if (age < this.analyticsConfig.dataRetention) {
                    this.metrics = data.metrics || this.metrics;
                    this.historicalData = data.historicalData || this.historicalData;
                }
            }
        } catch (error) {
            // Silent fail for stealth
        }
    }

    setupDataCleanup() {
        setInterval(() => {
            this.cleanupOldData();
        }, 24 * 60 * 60 * 1000); // Daily cleanup
    }

    cleanupOldData() {
        const cutoff = Date.now() - this.analyticsConfig.dataRetention;
        
        Object.keys(this.metrics).forEach(key => {
            this.metrics[key] = this.metrics[key].filter(m => m.timestamp >= cutoff);
        });
    }

    // Analytics reporting
    getAnalyticsReport() {
        const recentMetrics = this.getRecentMetrics(3600000); // Last hour
        
        return {
            currentSession: {
                ...this.currentSession,
                duration: Date.now() - this.currentSession.startTime
            },
            recentMetrics: {
                avgCTR: this.calculateAverage(recentMetrics.clickThroughRates, 'value'),
                avgSessionDuration: this.calculateAverage(recentMetrics.sessionDurations, 'value'),
                avgNavigationRate: this.calculateAverage(recentMetrics.navigationPatterns, 'navigationCount'),
                avgInteractionRate: this.calculateAverage(recentMetrics.adInteractions, 'interactionRate')
            },
            riskAssessment: {
                currentLevel: this.currentSession.riskLevel,
                recentFactors: this.currentSession.behaviorAnalysis?.riskFactors || [],
                recommendations: this.getRecommendations()
            },
            performance: {
                memoryUsage: this.getMemoryUsage(),
                cpuUsage: this.getCpuUsage(),
                networkLatency: this.getNetworkLatency()
            }
        };
    }

    calculateAverage(metrics, field) {
        if (!metrics || metrics.length === 0) return 0;
        return metrics.reduce((sum, m) => sum + (m[field] || 0), 0) / metrics.length;
    }

    getRecommendations() {
        const recommendations = [];
        const analysis = this.currentSession.behaviorAnalysis;
        
        if (!analysis) return recommendations;
        
        if (analysis.ctrConsistency === 'too_consistent') {
            recommendations.push('Increase variation in click-through rates');
        }
        
        if (analysis.durationPattern === 'too_short') {
            recommendations.push('Increase time spent on pages');
        }
        
        if (analysis.navigationBehavior === 'too_frequent') {
            recommendations.push('Reduce navigation frequency');
        }
        
        if (analysis.interactionPattern === 'too_high') {
            recommendations.push('Reduce ad interaction frequency');
        }
        
        return recommendations;
    }

    // Cleanup on page unload
    cleanup() {
        this.stopMonitoring();
        this.saveMetrics();
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnalyticsMonitor;
}

// Global registration
if (typeof window !== 'undefined' && !window.AnalyticsMonitor) {
    window.AnalyticsMonitor = AnalyticsMonitor;
}
