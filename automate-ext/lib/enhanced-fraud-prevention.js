class EnhancedFraudPrevention {
    constructor() {
        this.fraudConfig = {
            enabled: true,
            strictMode: true,
            realTimeMonitoring: true,
            adaptiveLimits: true,
            sessionTracking: true
        };
        
        this.clickLimits = {
            hourly: {
                max: 2,  // Reduced from 8 to 2 for more realistic behavior
                current: 0,
                resetTime: Date.now() + 3600000
            },
            daily: {
                max: 8,  // Reduced from 25 to 8 for more realistic behavior
                current: 0,
                resetTime: Date.now() + 86400000
            },
            session: {
                max: 3,  // Reduced from 12 to 3 for more realistic behavior
                current: 0
            },
            perPage: {
                max: 1,  // Reduced from 2 to 1 for more realistic behavior
                current: 0,
                pageUrl: ''
            },
            perDomain: {
                max: 2,  // Reduced from 4 to 2 for more realistic behavior
                current: 0,
                domain: ''
            }
        };
        
        this.interactionRequirements = {
            minTimeOnPage: 120000, // Increased to 2 minutes for more realistic behavior
            minScrollDepth: 0.6, // Increased to 60% of page for more realistic behavior
            requireReading: false, // Disabled to reduce detection risk
            requireNaturalPauses: false, // Disabled to reduce detection risk
            minLandingPageTime: 60000, // Increased to 1 minute for more realistic behavior
            requireLandingPageInteraction: false // Disabled to reduce detection risk
        };
        
        this.behaviorPatterns = {
            clickIntervals: [],
            navigationPatterns: [],
            readingPatterns: [],
            sessionPatterns: []
        };
        
        this.riskAssessment = {
            currentRisk: 'low',
            riskFactors: [],
            riskScore: 0,
            lastAssessment: Date.now()
        };
        
        this.blockedActions = [];
        this.whitelistedDomains = [];
        this.blacklistedDomains = [];
        
        this.monitoringTimer = null;
    }

    initialize() {
        if (!this.fraudConfig.enabled) return this;
        
        this.setupClickTracking();
        this.startRealTimeMonitoring();
        this.loadDomainLists();
        this.initializeSessionTracking();
        
        return this;
    }

    setupClickTracking() {
        // Track clicks with detailed information
        this.clickHistory = [];
        this.currentPageData = {
            url: window.location.href,
            startTime: Date.now(),
            scrollDepth: 0,
            readingTime: 0,
            interactions: []
        };
    }

    startRealTimeMonitoring() {
        if (!this.fraudConfig.realTimeMonitoring) return;
        
        this.monitoringTimer = setInterval(() => {
            this.assessCurrentRisk();
            this.updateClickLimits();
            this.analyzeBehaviorPatterns();
            this.checkForSuspiciousActivity();
        }, 30000); // Every 30 seconds
    }

    stopRealTimeMonitoring() {
        if (this.monitoringTimer) {
            clearInterval(this.monitoringTimer);
            this.monitoringTimer = null;
        }
    }

    // Enhanced click validation
    validateClick(adElement, adInfo) {
        const validation = {
            allowed: true,
            reason: 'Click allowed',
            riskLevel: 'low',
            recommendations: []
        };

        // Check if domain is blacklisted
        if (this.isDomainBlacklisted()) {
            validation.allowed = false;
            validation.reason = 'Domain is blacklisted';
            validation.riskLevel = 'critical';
            return validation;
        }

        // Check click limits
        const limitCheck = this.checkClickLimits();
        if (!limitCheck.allowed) {
            validation.allowed = false;
            validation.reason = limitCheck.reason;
            validation.riskLevel = 'high';
            return validation;
        }

        // Check interaction requirements
        const interactionCheck = this.checkInteractionRequirements();
        if (!interactionCheck.met) {
            validation.allowed = false;
            validation.reason = interactionCheck.reason;
            validation.riskLevel = 'medium';
            validation.recommendations = interactionCheck.recommendations;
            return validation;
        }

        // Check behavior patterns
        const behaviorCheck = this.checkBehaviorPatterns();
        if (!behaviorCheck.natural) {
            validation.allowed = false;
            validation.reason = behaviorCheck.reason;
            validation.riskLevel = 'high';
            validation.recommendations = behaviorCheck.recommendations;
            return validation;
        }

        // Check ad-specific requirements
        const adCheck = this.checkAdRequirements(adElement, adInfo);
        if (!adCheck.valid) {
            validation.allowed = false;
            validation.reason = adCheck.reason;
            validation.riskLevel = 'medium';
            return validation;
        }

        return validation;
    }

    checkClickLimits() {
        const currentTime = Date.now();
        const currentDomain = window.location.hostname;
        const currentPage = window.location.href;

        // Reset limits if needed
        this.resetLimitsIfNeeded(currentTime);

        // Check hourly limit
        if (this.clickLimits.hourly.current >= this.clickLimits.hourly.max) {
            return {
                allowed: false,
                reason: 'Hourly click limit exceeded'
            };
        }

        // Check daily limit
        if (this.clickLimits.daily.current >= this.clickLimits.daily.max) {
            return {
                allowed: false,
                reason: 'Daily click limit exceeded'
            };
        }

        // Check session limit
        if (this.clickLimits.session.current >= this.clickLimits.session.max) {
            return {
                allowed: false,
                reason: 'Session click limit exceeded'
            };
        }

        // Check per-page limit
        if (this.clickLimits.perPage.pageUrl === currentPage && 
            this.clickLimits.perPage.current >= this.clickLimits.perPage.max) {
            return {
                allowed: false,
                reason: 'Page click limit exceeded'
            };
        }

        // Check per-domain limit
        if (this.clickLimits.perDomain.domain === currentDomain && 
            this.clickLimits.perDomain.current >= this.clickLimits.perDomain.max) {
            return {
                allowed: false,
                reason: 'Domain click limit exceeded'
            };
        }

        return { allowed: true };
    }

    checkInteractionRequirements() {
        const currentTime = Date.now();
        const timeOnPage = currentTime - this.currentPageData.startTime;
        const scrollDepth = this.getCurrentScrollDepth();
        const readingTime = this.currentPageData.readingTime;

        const requirements = {
            met: true,
            reason: 'All requirements met',
            recommendations: []
        };

        // Check minimum time on page
        if (timeOnPage < this.interactionRequirements.minTimeOnPage) {
            requirements.met = false;
            requirements.reason = 'Insufficient time on page';
            requirements.recommendations.push(`Spend at least ${this.interactionRequirements.minTimeOnPage / 1000} seconds on page`);
        }

        // Check scroll depth
        if (scrollDepth < this.interactionRequirements.minScrollDepth) {
            requirements.met = false;
            requirements.reason = 'Insufficient scroll depth';
            requirements.recommendations.push(`Scroll to at least ${this.interactionRequirements.minScrollDepth * 100}% of page`);
        }

        // Check reading time
        if (this.interactionRequirements.requireReading && readingTime < 10000) {
            requirements.met = false;
            requirements.reason = 'Insufficient reading time';
            requirements.recommendations.push('Spend more time reading content');
        }

        return requirements;
    }

    checkBehaviorPatterns() {
        const patterns = {
            natural: true,
            reason: 'Behavior patterns are natural',
            recommendations: []
        };

        // Check click intervals
        if (this.clickHistory.length >= 3) {
            const recentClicks = this.clickHistory.slice(-3);
            const intervals = [];
            
            for (let i = 1; i < recentClicks.length; i++) {
                intervals.push(recentClicks[i].timestamp - recentClicks[i-1].timestamp);
            }

            const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
            const variance = this.calculateVariance(intervals);

            // Check for too consistent timing
            if (variance < 5000) { // Less than 5 seconds variance
                patterns.natural = false;
                patterns.reason = 'Click timing too consistent';
                patterns.recommendations.push('Vary timing between clicks');
            }

            // Check for too rapid clicking
            if (avgInterval < 30000) { // Less than 30 seconds average
                patterns.natural = false;
                patterns.reason = 'Clicking too rapidly';
                patterns.recommendations.push('Wait longer between clicks');
            }
        }

        // Check for natural pauses
        if (!this.hasNaturalPauses()) {
            patterns.natural = false;
            patterns.reason = 'Missing natural pauses';
            patterns.recommendations.push('Add natural pauses between actions');
        }

        return patterns;
    }

    checkAdRequirements(adElement, adInfo) {
        const requirements = {
            valid: true,
            reason: 'Ad requirements met'
        };

        // Check if ad is visible
        if (!this.isElementVisible(adElement)) {
            requirements.valid = false;
            requirements.reason = 'Ad not visible';
            return requirements;
        }

        // Check if ad is clickable
        if (!this.isElementClickable(adElement)) {
            requirements.valid = false;
            requirements.reason = 'Ad not clickable';
            return requirements;
        }

        // Check if ad is in viewport
        if (!this.isElementInViewport(adElement)) {
            requirements.valid = false;
            requirements.reason = 'Ad not in viewport';
            return requirements;
        }

        // Check for high-value ad targeting
        if (adInfo && adInfo.isHighValue) {
            const highValueCheck = this.checkHighValueAdRequirements(adInfo);
            if (!highValueCheck.valid) {
                requirements.valid = false;
                requirements.reason = highValueCheck.reason;
            }
        }

        return requirements;
    }

    checkHighValueAdRequirements(adInfo) {
        const requirements = {
            valid: true,
            reason: 'High-value ad requirements met'
        };

        // Require longer time on page for high-value ads
        const timeOnPage = Date.now() - this.currentPageData.startTime;
        if (timeOnPage < 60000) { // At least 1 minute
            requirements.valid = false;
            requirements.reason = 'Insufficient time on page for high-value ad';
        }

        // Require deeper scroll for high-value ads
        const scrollDepth = this.getCurrentScrollDepth();
        if (scrollDepth < 0.5) { // At least 50% scroll
            requirements.valid = false;
            requirements.reason = 'Insufficient scroll depth for high-value ad';
        }

        return requirements;
    }

    // Record click for tracking
    recordClick(adElement, adInfo) {
        const clickData = {
            timestamp: Date.now(),
            url: window.location.href,
            domain: window.location.hostname,
            adInfo: adInfo,
            pageData: { ...this.currentPageData },
            behaviorData: this.getCurrentBehaviorData()
        };

        this.clickHistory.push(clickData);
        this.updateClickCounts();
        this.recordClickForLimits();
    }

    updateClickCounts() {
        const currentTime = Date.now();
        const currentDomain = window.location.hostname;
        const currentPage = window.location.href;

        // Update hourly count
        this.clickLimits.hourly.current++;

        // Update daily count
        this.clickLimits.daily.current++;

        // Update session count
        this.clickLimits.session.current++;

        // Update per-page count
        if (this.clickLimits.perPage.pageUrl === currentPage) {
            this.clickLimits.perPage.current++;
        } else {
            this.clickLimits.perPage.pageUrl = currentPage;
            this.clickLimits.perPage.current = 1;
        }

        // Update per-domain count
        if (this.clickLimits.perDomain.domain === currentDomain) {
            this.clickLimits.perDomain.current++;
        } else {
            this.clickLimits.perDomain.domain = currentDomain;
            this.clickLimits.perDomain.current = 1;
        }
    }

    recordClickForLimits() {
        // Store click data for limit tracking
        const clickData = {
            timestamp: Date.now(),
            url: window.location.href,
            domain: window.location.hostname
        };

        // Use stealth storage
        try {
            if (window._stealth_storage) {
                const storage = new window._stealth_storage();
                const existingData = storage.get('click_limits') || [];
                existingData.push(clickData);
                
                // Keep only recent data (last 24 hours)
                const cutoff = Date.now() - 86400000;
                const filteredData = existingData.filter(click => click.timestamp >= cutoff);
                
                storage.set('click_limits', filteredData);
            }
        } catch (error) {
            // Silent fail for stealth
        }
    }

    resetLimitsIfNeeded(currentTime) {
        // Reset hourly limit
        if (currentTime >= this.clickLimits.hourly.resetTime) {
            this.clickLimits.hourly.current = 0;
            this.clickLimits.hourly.resetTime = currentTime + 3600000;
        }

        // Reset daily limit
        if (currentTime >= this.clickLimits.daily.resetTime) {
            this.clickLimits.daily.current = 0;
            this.clickLimits.daily.resetTime = currentTime + 86400000;
        }
    }

    // Landing page control
    async handleLandingPageNavigation(originalUrl) {
        const landingPageData = {
            originalUrl: originalUrl,
            landingUrl: window.location.href,
            startTime: Date.now(),
            interactions: []
        };

        // Wait for page load
        await this.waitForPageLoad();

        // Simulate realistic landing page behavior
        await this.simulateLandingPageBehavior(landingPageData);

        // Navigate back to original page
        await this.navigateBackToOriginal(originalUrl);

        return landingPageData;
    }

    async simulateLandingPageBehavior(landingPageData) {
        const minTime = this.interactionRequirements.minLandingPageTime;
        const startTime = Date.now();

        // Simulate reading behavior
        await this.simulateLandingPageReading();

        // Simulate scrolling
        await this.simulateLandingPageScrolling();

        // Simulate interactions with non-ad elements
        await this.simulateLandingPageInteractions();

        // Ensure minimum time spent
        const timeSpent = Date.now() - startTime;
        if (timeSpent < minTime) {
            await this.delay(minTime - timeSpent);
        }

        landingPageData.interactions = this.getLandingPageInteractions();
        landingPageData.totalTime = Date.now() - startTime;
    }

    async simulateLandingPageReading() {
        const contentElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, div');
        const readingTime = 5000 + Math.random() * 10000; // 5-15 seconds
        
        await this.delay(readingTime);
    }

    async simulateLandingPageScrolling() {
        const scrollDistance = window.innerHeight * (0.3 + Math.random() * 0.4); // 30-70% of viewport
        const scrollSteps = 3 + Math.floor(Math.random() * 3);
        
        for (let i = 0; i < scrollSteps; i++) {
            window.scrollBy(0, scrollDistance / scrollSteps);
            await this.delay(500 + Math.random() * 1000);
        }
    }

    async simulateLandingPageInteractions() {
        // Find non-ad interactive elements
        const interactiveElements = document.querySelectorAll('a:not([href*="google"]):not([href*="doubleclick"]), button:not([class*="ad"]), input, select');
        
        if (interactiveElements.length > 0) {
            const randomElement = interactiveElements[Math.floor(Math.random() * interactiveElements.length)];
            
            // Simulate hover
            const hoverEvent = new MouseEvent('mouseenter', {
                bubbles: true,
                cancelable: true
            });
            randomElement.dispatchEvent(hoverEvent);
            
            await this.delay(1000 + Math.random() * 2000);
            
            // Simulate mouse leave
            const leaveEvent = new MouseEvent('mouseleave', {
                bubbles: true,
                cancelable: true
            });
            randomElement.dispatchEvent(leaveEvent);
        }
    }

    async navigateBackToOriginal(originalUrl) {
        // Use browser back if possible
        if (window.history.length > 1) {
            window.history.back();
        } else {
            // Fallback to direct navigation
            window.location.href = originalUrl;
        }
        
        await this.delay(2000 + Math.random() * 3000);
    }

    // Utility methods
    getCurrentScrollDepth() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
        return documentHeight > 0 ? scrollTop / documentHeight : 0;
    }

    isElementVisible(element) {
        if (!element) return false;
        
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
    }

    isElementClickable(element) {
        if (!element) return false;
        
        const style = window.getComputedStyle(element);
        return style.pointerEvents !== 'none' && style.display !== 'none' && style.visibility !== 'hidden';
    }

    isElementInViewport(element) {
        if (!element) return false;
        
        const rect = element.getBoundingClientRect();
        return rect.top >= 0 && rect.left >= 0 && 
               rect.bottom <= window.innerHeight && rect.right <= window.innerWidth;
    }

    hasNaturalPauses() {
        // Check if there are natural pauses in recent activity
        const recentActivity = this.getRecentActivity();
        return recentActivity.pauses > 0;
    }

    getRecentActivity() {
        // Analyze recent user activity for natural pauses
        return {
            pauses: Math.floor(Math.random() * 3) + 1, // Simulate natural pauses
            activityLevel: 'moderate'
        };
    }

    getCurrentBehaviorData() {
        return {
            scrollDepth: this.getCurrentScrollDepth(),
            timeOnPage: Date.now() - this.currentPageData.startTime,
            readingTime: this.currentPageData.readingTime,
            interactions: this.currentPageData.interactions.length
        };
    }

    getLandingPageInteractions() {
        return [
            { type: 'reading', duration: 5000 + Math.random() * 10000 },
            { type: 'scrolling', distance: window.innerHeight * (0.3 + Math.random() * 0.4) },
            { type: 'hover', element: 'non-ad' }
        ];
    }

    calculateVariance(values) {
        if (values.length < 2) return 0;
        
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        return variance;
    }

    isDomainBlacklisted() {
        const currentDomain = window.location.hostname;
        return this.blacklistedDomains.includes(currentDomain);
    }

    isDomainWhitelisted() {
        const currentDomain = window.location.hostname;
        return this.whitelistedDomains.includes(currentDomain);
    }

    loadDomainLists() {
        // Load domain lists from storage or use defaults
        this.blacklistedDomains = [
            'google.com',
            'facebook.com',
            'youtube.com',
            'amazon.com'
        ];
        
        this.whitelistedDomains = [
            // Add trusted domains here
        ];
    }

    initializeSessionTracking() {
        this.sessionData = {
            startTime: Date.now(),
            clicks: 0,
            pages: [],
            domains: []
        };
    }

    assessCurrentRisk() {
        let riskScore = 0;
        const riskFactors = [];

        // Check click frequency
        if (this.clickLimits.hourly.current > this.clickLimits.hourly.max * 0.8) {
            riskScore += 20;
            riskFactors.push('high_click_frequency');
        }

        // Check behavior patterns
        if (this.clickHistory.length >= 3) {
            const recentClicks = this.clickHistory.slice(-3);
            const intervals = [];
            
            for (let i = 1; i < recentClicks.length; i++) {
                intervals.push(recentClicks[i].timestamp - recentClicks[i-1].timestamp);
            }

            const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
            if (avgInterval < 30000) {
                riskScore += 25;
                riskFactors.push('rapid_clicking');
            }
        }

        // Check domain diversity
        const uniqueDomains = new Set(this.clickHistory.map(click => click.domain));
        if (uniqueDomains.size < 2) {
            riskScore += 15;
            riskFactors.push('limited_domain_diversity');
        }

        this.riskAssessment = {
            currentRisk: this.calculateRiskLevel(riskScore),
            riskFactors: riskFactors,
            riskScore: riskScore,
            lastAssessment: Date.now()
        };
    }

    calculateRiskLevel(score) {
        if (score >= 60) return 'critical';
        if (score >= 40) return 'high';
        if (score >= 20) return 'medium';
        if (score >= 10) return 'low';
        return 'minimal';
    }

    updateClickLimits() {
        // Adaptive limits based on risk level
        if (this.fraudConfig.adaptiveLimits) {
            const riskLevel = this.riskAssessment.currentRisk;
            
            switch (riskLevel) {
                case 'critical':
                    this.clickLimits.hourly.max = Math.max(2, this.clickLimits.hourly.max - 2);
                    this.clickLimits.daily.max = Math.max(5, this.clickLimits.daily.max - 5);
                    break;
                case 'high':
                    this.clickLimits.hourly.max = Math.max(4, this.clickLimits.hourly.max - 1);
                    this.clickLimits.daily.max = Math.max(10, this.clickLimits.daily.max - 2);
                    break;
                case 'medium':
                    // Keep current limits
                    break;
                case 'low':
                case 'minimal':
                    // Gradually increase limits
                    this.clickLimits.hourly.max = Math.min(12, this.clickLimits.hourly.max + 1);
                    this.clickLimits.daily.max = Math.min(35, this.clickLimits.daily.max + 2);
                    break;
            }
        }
    }

    analyzeBehaviorPatterns() {
        // Analyze recent behavior for patterns
        const recentClicks = this.clickHistory.slice(-10);
        
        if (recentClicks.length >= 3) {
            // Analyze timing patterns
            const timingPatterns = this.analyzeTimingPatterns(recentClicks);
            
            // Analyze domain patterns
            const domainPatterns = this.analyzeDomainPatterns(recentClicks);
            
            // Store patterns for future analysis
            this.behaviorPatterns.clickIntervals.push({
                timestamp: Date.now(),
                patterns: { timing: timingPatterns, domain: domainPatterns }
            });
        }
    }

    analyzeTimingPatterns(clicks) {
        const intervals = [];
        for (let i = 1; i < clicks.length; i++) {
            intervals.push(clicks[i].timestamp - clicks[i-1].timestamp);
        }
        
        const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
        const variance = this.calculateVariance(intervals);
        
        return {
            averageInterval: avgInterval,
            variance: variance,
            consistency: variance < 10000 ? 'high' : variance < 30000 ? 'medium' : 'low'
        };
    }

    analyzeDomainPatterns(clicks) {
        const domains = clicks.map(click => click.domain);
        const uniqueDomains = new Set(domains);
        
        return {
            totalClicks: clicks.length,
            uniqueDomains: uniqueDomains.size,
            domainDiversity: uniqueDomains.size / clicks.length,
            mostFrequentDomain: this.getMostFrequentDomain(domains)
        };
    }

    getMostFrequentDomain(domains) {
        const frequency = {};
        domains.forEach(domain => {
            frequency[domain] = (frequency[domain] || 0) + 1;
        });
        
        return Object.keys(frequency).reduce((a, b) => frequency[a] > frequency[b] ? a : b);
    }

    checkForSuspiciousActivity() {
        const suspiciousActivities = [];
        
        // Check for rapid clicking
        if (this.clickLimits.hourly.current > this.clickLimits.hourly.max * 0.9) {
            suspiciousActivities.push('rapid_clicking');
        }
        
        // Check for consistent timing
        if (this.behaviorPatterns.clickIntervals.length > 0) {
            const recentPatterns = this.behaviorPatterns.clickIntervals.slice(-3);
            const consistentTiming = recentPatterns.every(pattern => 
                pattern.patterns.timing.consistency === 'high'
            );
            
            if (consistentTiming) {
                suspiciousActivities.push('consistent_timing');
            }
        }
        
        // Log suspicious activities
        if (suspiciousActivities.length > 0) {
            console.warn('🚨 Suspicious activity detected:', suspiciousActivities);
        }
    }

    // Utility methods
    async waitForPageLoad() {
        return new Promise(resolve => {
            if (document.readyState === 'complete') {
                resolve();
            } else {
                window.addEventListener('load', resolve);
            }
        });
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Cleanup
    cleanup() {
        this.stopRealTimeMonitoring();
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedFraudPrevention;
}

// Global registration
if (typeof window !== 'undefined' && !window.EnhancedFraudPrevention) {
    window.EnhancedFraudPrevention = EnhancedFraudPrevention;
}
