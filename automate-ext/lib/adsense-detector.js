/**
 * AdSense Detector - Detects and interacts with AdSense ads
 * Focuses on RPM optimization and high-value ad targeting
 */

class AdSenseDetector {
    constructor() {
        // Stealth: Use less obvious selectors to avoid detection
        this.adSelectors = [
            // Natural-looking selectors
            'ins[class*="ads"]',
            'div[id*="google"]',
            'div[class*="ad"]',
            'div[class*="banner"]',
            'div[class*="sponsor"]',
            'div[class*="promo"]',
            'iframe[src*="google"]',
            'iframe[src*="doubleclick"]',
            'iframe[src*="googlesyndication"]'
        ];

        this.highValueCategories = [
            'finance', 'insurance', 'investment', 'loan', 'credit',
            'business', 'consulting', 'software', 'saas', 'enterprise',
            'healthcare', 'medical', 'pharmaceutical', 'dental',
            'legal', 'lawyer', 'attorney', 'consultation',
            'technology', 'software', 'hardware', 'cloud',
            'real-estate', 'property', 'mortgage', 'home'
        ];

        this.adMetrics = {
            totalAds: 0,
            highValueAds: 0,
            clickedAds: 0,
            hoveredAds: 0,
            viewTime: 0,
            rpmScore: 0
        };

        this.currentSession = {
            startTime: Date.now(),
            adsDetected: [],
            interactions: [],
            rpmOptimization: {
                highValueClicks: 0,
                totalClicks: 0,
                averageViewTime: 0,
                conversionIntent: 0
            }
        };
    }

    /**
     * Detect all AdSense ads on the page with stealth protection
     */
    detectAdSenseAds() {
        const ads = [];
        
        // Stealth: Use more natural selectors and avoid obvious patterns
        const stealthSelectors = [
            'ins[class*="ads"]',
            'div[id*="google"]',
            'div[class*="ad"]',
            'iframe[src*="google"]',
            'div[class*="banner"]',
            'div[class*="sponsor"]'
        ];
        
        stealthSelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    const adInfo = this.analyzeAd(element);
                    if (adInfo.isAdSense) {
                        ads.push(adInfo);
                    }
                });
            } catch (error) {
                // Silent error handling for stealth
            }
        });

        this.adMetrics.totalAds = ads.length;
        this.currentSession.adsDetected = ads;
        
        return ads;
    }

    /**
     * Analyze individual ad element
     */
    analyzeAd(element) {
        const adInfo = {
            element: element,
            isAdSense: false,
            isHighValue: false,
            category: null,
            value: 0,
            position: this.getAdPosition(element),
            size: this.getAdSize(element),
            visibility: this.getAdVisibility(element),
            content: this.extractAdContent(element),
            clickable: this.isClickable(element),
            iframe: element.tagName.toLowerCase() === 'iframe'
        };

        // Check if it's AdSense
        adInfo.isAdSense = this.isAdSenseAd(element);
        
        if (adInfo.isAdSense) {
            adInfo.category = this.categorizeAd(adInfo.content);
            adInfo.isHighValue = this.isHighValueCategory(adInfo.category);
            adInfo.value = this.calculateAdValue(adInfo);
        }

        return adInfo;
    }

    /**
     * Check if element is AdSense ad
     */
    isAdSenseAd(element) {
        // Check class names
        const className = element.className || '';
        if (className.includes('adsbygoogle') || className.includes('google_ads')) {
            return true;
        }

        // Check ID
        const id = element.id || '';
        if (id.includes('google_ads') || id.includes('div-gpt-ad')) {
            return true;
        }

        // Check iframe src
        if (element.tagName.toLowerCase() === 'iframe') {
            const src = element.src || '';
            if (src.includes('googleadservices') || 
                src.includes('doubleclick') || 
                src.includes('googlesyndication')) {
                return true;
            }
        }

        // Check parent elements
        let parent = element.parentElement;
        for (let i = 0; i < 3 && parent; i++) {
            const parentClass = parent.className || '';
            const parentId = parent.id || '';
            
            if (parentClass.includes('adsbygoogle') || 
                parentClass.includes('google_ads') ||
                parentId.includes('google_ads')) {
                return true;
            }
            parent = parent.parentElement;
        }

        return false;
    }

    /**
     * Extract ad content for categorization
     */
    extractAdContent(element) {
        let content = '';

        // Get text content
        content += element.textContent || '';
        content += element.innerText || '';

        // Get alt text from images
        const images = element.querySelectorAll('img');
        images.forEach(img => {
            content += ' ' + (img.alt || '');
            content += ' ' + (img.title || '');
        });

        // Get iframe content if possible
        if (element.tagName.toLowerCase() === 'iframe') {
            try {
                const iframeDoc = element.contentDocument || element.contentWindow.document;
                if (iframeDoc) {
                    content += ' ' + (iframeDoc.body?.textContent || '');
                }
            } catch (e) {
                // Cross-origin restriction
            }
        }

        return content.toLowerCase();
    }

    /**
     * Categorize ad based on content
     */
    categorizeAd(content) {
        const categories = {
            finance: ['loan', 'credit', 'mortgage', 'insurance', 'investment', 'banking', 'financial'],
            business: ['business', 'consulting', 'enterprise', 'corporate', 'professional'],
            healthcare: ['medical', 'health', 'dental', 'pharmacy', 'hospital', 'doctor'],
            legal: ['lawyer', 'attorney', 'legal', 'law', 'consultation'],
            technology: ['software', 'saas', 'cloud', 'tech', 'digital', 'online'],
            real_estate: ['property', 'real estate', 'home', 'house', 'apartment'],
            education: ['course', 'training', 'education', 'learn', 'study'],
            retail: ['shop', 'store', 'buy', 'purchase', 'sale', 'discount']
        };

        for (const [category, keywords] of Object.entries(categories)) {
            for (const keyword of keywords) {
                if (content.includes(keyword)) {
                    return category;
                }
            }
        }

        return 'general';
    }

    /**
     * Check if ad is high value category
     */
    isHighValueCategory(category) {
        return this.highValueCategories.some(keyword => 
            category.includes(keyword) || keyword.includes(category)
        );
    }

    /**
     * Calculate ad value for RPM optimization
     */
    calculateAdValue(adInfo) {
        let value = 1; // Base value

        // High value category bonus
        if (adInfo.isHighValue) {
            value *= 3;
        }

        // Position bonus
        if (adInfo.position === 'above_fold') {
            value *= 2;
        } else if (adInfo.position === 'sidebar') {
            value *= 1.5;
        }

        // Size bonus
        if (adInfo.size === 'large') {
            value *= 1.5;
        } else if (adInfo.size === 'medium') {
            value *= 1.2;
        }

        // Visibility bonus
        if (adInfo.visibility === 'high') {
            value *= 1.3;
        }

        return Math.round(value * 100) / 100;
    }

    /**
     * Get ad position on page
     */
    getAdPosition(element) {
        const rect = element.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        // Check if above the fold
        if (rect.top < viewportHeight && rect.bottom > 0) {
            return 'above_fold';
        }

        // Check if in sidebar
        if (rect.left < viewportWidth * 0.3 || rect.right > viewportWidth * 0.7) {
            return 'sidebar';
        }

        return 'below_fold';
    }

    /**
     * Get ad size category
     */
    getAdSize(element) {
        const rect = element.getBoundingClientRect();
        const area = rect.width * rect.height;

        if (area > 100000) return 'large';
        if (area > 50000) return 'medium';
        return 'small';
    }

    /**
     * Get ad visibility score
     */
    getAdVisibility(element) {
        const rect = element.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        // Check if element is in viewport
        if (rect.top >= viewportHeight || rect.bottom <= 0 ||
            rect.left >= viewportWidth || rect.right <= 0) {
            return 'hidden';
        }

        // Calculate visibility percentage
        const visibleWidth = Math.min(rect.right, viewportWidth) - Math.max(rect.left, 0);
        const visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0);
        const visibleArea = visibleWidth * visibleHeight;
        const totalArea = rect.width * rect.height;
        const visibilityPercent = visibleArea / totalArea;

        if (visibilityPercent > 0.8) return 'high';
        if (visibilityPercent > 0.5) return 'medium';
        return 'low';
    }

    /**
     * Check if element is clickable
     */
    isClickable(element) {
        const style = window.getComputedStyle(element);
        return style.pointerEvents !== 'none' && 
               style.display !== 'none' && 
               style.visibility !== 'hidden';
    }

    /**
     * Smart ad interaction for RPM optimization
     */
    async smartAdInteraction(adInfo, personality) {
        if (!adInfo.isAdSense || !adInfo.clickable) {
            return false;
        }

        const interaction = {
            adId: this.generateAdId(adInfo),
            timestamp: Date.now(),
            type: 'interaction',
            category: adInfo.category,
            isHighValue: adInfo.isHighValue,
            value: adInfo.value
        };

        // Determine interaction type based on personality and ad value
        const shouldClick = this.shouldClickAd(adInfo, personality);
        const shouldHover = this.shouldHoverAd(adInfo, personality);

        if (shouldClick) {
            interaction.action = 'click';
            await this.simulateAdClick(adInfo.element);
            this.adMetrics.clickedAds++;
            this.currentSession.rpmOptimization.totalClicks++;
            
            if (adInfo.isHighValue) {
                this.currentSession.rpmOptimization.highValueClicks++;
            }
        } else if (shouldHover) {
            interaction.action = 'hover';
            await this.simulateAdHover(adInfo.element);
            this.adMetrics.hoveredAds++;
        } else {
            interaction.action = 'view';
            await this.simulateAdView(adInfo.element);
        }

        this.currentSession.interactions.push(interaction);
        return interaction;
    }

    /**
     * Determine if ad should be clicked based on personality and value
     */
    shouldClickAd(adInfo, personality) {
        const baseProbability = personality.clickProbability || 0.5;
        let adjustedProbability = baseProbability;

        // High value ads get higher click probability
        if (adInfo.isHighValue) {
            adjustedProbability *= 1.5;
        }

        // Professional personalities prefer high-value ads
        if (personality.type === 'professional' && adInfo.isHighValue) {
            adjustedProbability *= 1.3;
        }

        // Researcher personalities click more on informational ads
        if (personality.type === 'researcher') {
            adjustedProbability *= 1.2;
        }

        // Casual personalities click less
        if (personality.type === 'casual') {
            adjustedProbability *= 0.7;
        }

        return Math.random() < Math.min(adjustedProbability, 0.9);
    }

    /**
     * Determine if ad should be hovered
     */
    shouldHoverAd(adInfo, personality) {
        const baseProbability = personality.hoverProbability || 0.6;
        let adjustedProbability = baseProbability;

        // High value ads get more hover attention
        if (adInfo.isHighValue) {
            adjustedProbability *= 1.2;
        }

        // Explorer personalities hover more
        if (personality.type === 'explorer') {
            adjustedProbability *= 1.3;
        }

        return Math.random() < adjustedProbability;
    }

    /**
     * Simulate ad click
     */
    async simulateAdClick(element) {
        try {
            // Create and dispatch click event
            const clickEvent = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true,
                clientX: element.getBoundingClientRect().left + 10,
                clientY: element.getBoundingClientRect().top + 10
            });

            element.dispatchEvent(clickEvent);
            
            // Wait for potential navigation
            await this.delay(1000);
            
            return true;
        } catch (error) {
            console.error('Error simulating ad click:', error);
            return false;
        }
    }

    /**
     * Simulate ad hover
     */
    async simulateAdHover(element) {
        try {
            const rect = element.getBoundingClientRect();
            
            // Mouse enter
            const mouseEnterEvent = new MouseEvent('mouseenter', {
                view: window,
                bubbles: true,
                cancelable: true,
                clientX: rect.left + rect.width / 2,
                clientY: rect.top + rect.height / 2
            });
            
            element.dispatchEvent(mouseEnterEvent);
            
            // Wait
            await this.delay(500 + Math.random() * 1000);
            
            // Mouse leave
            const mouseLeaveEvent = new MouseEvent('mouseleave', {
                view: window,
                bubbles: true,
                cancelable: true
            });
            
            element.dispatchEvent(mouseLeaveEvent);
            
            return true;
        } catch (error) {
            console.error('Error simulating ad hover:', error);
            return false;
        }
    }

    /**
     * Simulate ad view (just looking at ad)
     */
    async simulateAdView(element) {
        try {
            // Scroll to make ad visible if needed
            if (this.getAdVisibility(element) === 'hidden') {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                await this.delay(1000);
            }
            
            // Wait for view time
            const viewTime = 2000 + Math.random() * 3000;
            await this.delay(viewTime);
            
            this.adMetrics.viewTime += viewTime;
            
            return true;
        } catch (error) {
            console.error('Error simulating ad view:', error);
            return false;
        }
    }

    /**
     * Generate unique ad ID
     */
    generateAdId(adInfo) {
        return 'ad_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Calculate RPM score for current session
     */
    calculateRPMScore() {
        const totalInteractions = this.currentSession.interactions.length;
        if (totalInteractions === 0) return 0;

        const highValueInteractions = this.currentSession.interactions.filter(
            interaction => interaction.isHighValue
        ).length;

        const clickRate = this.currentSession.rpmOptimization.totalClicks / totalInteractions;
        const highValueRate = highValueInteractions / totalInteractions;
        const averageViewTime = this.adMetrics.viewTime / totalInteractions;

        // RPM score formula
        const rpmScore = (
            clickRate * 0.4 +
            highValueRate * 0.4 +
            (averageViewTime / 5000) * 0.2
        ) * 100;

        this.adMetrics.rpmScore = Math.round(rpmScore * 100) / 100;
        return this.adMetrics.rpmScore;
    }

    /**
     * Get session summary
     */
    getSessionSummary() {
        return {
            sessionId: this.currentSession.startTime,
            duration: Date.now() - this.currentSession.startTime,
            totalAds: this.adMetrics.totalAds,
            highValueAds: this.adMetrics.highValueAds,
            interactions: this.currentSession.interactions.length,
            clicks: this.adMetrics.clickedAds,
            hovers: this.adMetrics.hoveredAds,
            rpmScore: this.calculateRPMScore(),
            optimization: this.currentSession.rpmOptimization
        };
    }

    /**
     * Utility delay function
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Save session data
     */
    async saveSessionData() {
        const sessionData = {
            ...this.getSessionSummary(),
            adsDetected: this.currentSession.adsDetected,
            interactions: this.currentSession.interactions,
            timestamp: new Date().toISOString()
        };

        await chrome.storage.local.set({
            [`adsense_session_${this.currentSession.startTime}`]: sessionData
        });

        return sessionData;
    }
}

// Export for use in other modules with enhanced stealth protection
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdSenseDetector;
} else if (typeof window !== 'undefined' && !window.AdSenseDetector) {
    window.AdSenseDetector = AdSenseDetector;
}
