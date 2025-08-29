/**
 * AdSense Detector - Detects and interacts with AdSense ads
 * Focuses on RPM optimization and high-value ad targeting
 */

class AdSenseDetector {
    constructor() {
        // Click probability configuration
        this.clickProbabilityConfig = {
            min: 0.10,  // 10% minimum
            max: 0.15,  // 15% maximum
            default: 0.12, // 12% default
            personalityMultipliers: {
                researcher: 1.1,
                explorer: 1.1,
                professional: 1.1,
                casual: 0.9
            },
            valueMultipliers: {
                highValue: 1.2,
                aboveFold: 1.1,
                largeSize: 1.1,
                mediumSize: 1.1
            }
        };

        // Comprehensive AdSense selectors matching Python Selenium implementation
        this.adSelectors = [
            // Standard AdSense
            'ins.adsbygoogle',
            'div[class*="adsbygoogle"]',
            'div[id*="google_ads"]',
            
            // Google Ad Manager / DFP
            'div[id*="div-gpt-ad"]',
            'div[data-google-ad-client]',
            'div[data-ad-slot]',
            
            // Generic ad selectors
            'div[class*="ad-"]',
            'div[id*="ad-"]',
            'div[class*="ads-"]',
            'div[id*="ads-"]',
            '.ad-container',
            '.ad-banner',
            '.ad-unit',
            '.advertisement',
            
            // iFrame ads
            'iframe[src*="googleads"]',
            'iframe[src*="doubleclick"]',
            'iframe[src*="googlesyndication"]',
            'iframe[src*="adsystem"]',
            
            // More specific patterns
            'div[class*="google"]',
            'div[id*="google"]',
            
            // Stealth selectors (natural-looking)
            'ins[class*="ads"]',
            'div[class*="banner"]',
            'div[class*="sponsor"]',
            'div[class*="promo"]',
            'div[class*="ad"]',
            
            // Additional comprehensive selectors
            'div[data-ad-client]',
            'div[data-ad-slot]',
            'div[data-ad-format]',
            'div[data-ad-layout]',
            'div[data-ad-region]',
            'div[data-adtest]',
            
            // Google AdSense responsive
            'ins[data-ad-client]',
            'ins[data-ad-slot]',
            'ins[data-ad-format]',
            
            // Google Ad Manager
            'div[id*="google_ads_iframe"]',
            'div[id*="google_ads_"]',
            'div[class*="google_ads_"]',
            
            // DoubleClick
            'div[id*="div-gpt-ad"]',
            'div[class*="gpt-ad"]',
            'div[data-google-query-id]',
            
            // AdSense auto ads
            'div[id*="aswift"]',
            'div[id*="google_ads_iframe"]',
            'ins[id*="aswift"]',
            
            // Responsive ads
            'div[class*="adsbygoogle"]',
            'div[class*="ad-container"]',
            'div[class*="ad-wrapper"]',
            
            // Native ads
            'div[class*="native-ad"]',
            'div[class*="sponsored-content"]',
            'div[class*="promoted-content"]',
            
            // Display ads
            'div[class*="display-ad"]',
            'div[class*="banner-ad"]',
            'div[class*="sidebar-ad"]',
            
            // In-feed ads
            'div[class*="in-feed-ad"]',
            'div[class*="feed-ad"]',
            'div[class*="content-ad"]',
            
            // In-article ads
            'div[class*="in-article-ad"]',
            'div[class*="article-ad"]',
            'div[class*="post-ad"]',
            
            // Sticky ads
            'div[class*="sticky-ad"]',
            'div[class*="fixed-ad"]',
            'div[class*="floating-ad"]',
            
            // Video ads
            'div[class*="video-ad"]',
            'div[class*="player-ad"]',
            'div[class*="media-ad"]',
            
            // Mobile ads
            'div[class*="mobile-ad"]',
            'div[class*="responsive-ad"]',
            'div[class*="adaptive-ad"]'
        ];

        this.highValueCategories = [
            // Finance & Investment
            'finance', 'insurance', 'investment', 'loan', 'credit', 'banking', 'financial',
            'trading', 'forex', 'crypto', 'bitcoin', 'ethereum', 'blockchain', 'nft',
            
            // Business & Enterprise
            'business', 'consulting', 'enterprise', 'corporate', 'professional', 'startup',
            'entrepreneur', 'management', 'strategy', 'leadership', 'executive',
            
            // Healthcare & Medical
            'healthcare', 'medical', 'pharmaceutical', 'dental', 'hospital', 'doctor',
            'telemedicine', 'health', 'wellness', 'fitness', 'nutrition', 'supplements',
            
            // Legal & Professional Services
            'legal', 'lawyer', 'attorney', 'consultation', 'law', 'court', 'litigation',
            'compliance', 'regulatory', 'intellectual property', 'patent', 'trademark',
            
            // Technology & AI
            'technology', 'software', 'hardware', 'cloud', 'saas', 'ai', 'artificial intelligence',
            'machine learning', 'ml', 'deep learning', 'neural network', 'data science',
            'big data', 'analytics', 'automation', 'robotics', 'iot', 'internet of things',
            
            // Cybersecurity & Digital Security
            'cybersecurity', 'security', 'hacking', 'penetration testing', 'ethical hacking',
            'vulnerability', 'threat', 'malware', 'firewall', 'encryption', 'vpn',
            
            // Real Estate & Property
            'real-estate', 'property', 'mortgage', 'home', 'house', 'apartment', 'commercial',
            'investment property', 'rental', 'leasing', 'development', 'construction',
            
            // Education & Training
            'education', 'training', 'course', 'certification', 'degree', 'university',
            'online learning', 'e-learning', 'skill development', 'professional development',
            
            // Digital Marketing & SEO
            'marketing', 'digital marketing', 'seo', 'search engine optimization', 'ppc',
            'social media marketing', 'content marketing', 'email marketing', 'affiliate',
            
            // E-commerce & Retail
            'ecommerce', 'e-commerce', 'online store', 'retail', 'shop', 'store', 'marketplace',
            'dropshipping', 'amazon', 'ebay', 'shopify', 'woocommerce',
            
            // Travel & Hospitality
            'travel', 'hotel', 'flight', 'booking', 'vacation', 'tourism', 'resort',
            'airline', 'cruise', 'adventure', 'luxury travel', 'business travel',
            
            // Automotive & Transportation
            'automotive', 'car', 'vehicle', 'auto', 'motor', 'truck', 'motorcycle',
            'electric vehicle', 'ev', 'tesla', 'hybrid', 'autonomous', 'self-driving',
            
            // Fashion & Luxury
            'fashion', 'clothing', 'shoes', 'accessories', 'luxury', 'designer', 'brand',
            'jewelry', 'watches', 'cosmetics', 'beauty', 'skincare', 'makeup',
            
            // Food & Beverage
            'food', 'restaurant', 'delivery', 'catering', 'beverage', 'alcohol', 'wine',
            'coffee', 'tea', 'organic', 'healthy food', 'supplements', 'vitamins',
            
            // Entertainment & Media
            'entertainment', 'movie', 'music', 'game', 'gaming', 'esports', 'streaming',
            'netflix', 'spotify', 'youtube', 'podcast', 'social media', 'influencer',
            
            // Sports & Fitness
            'sport', 'fitness', 'gym', 'workout', 'exercise', 'athletic', 'sports equipment',
            'personal trainer', 'nutrition', 'supplements', 'wellness',
            
            // Home & Garden
            'home improvement', 'garden', 'furniture', 'decor', 'renovation', 'construction',
            'kitchen', 'bathroom', 'outdoor', 'landscaping', 'interior design',
            
            // Professional Services
            'accounting', 'tax', 'bookkeeping', 'hr', 'human resources', 'recruitment',
            'outsourcing', 'bpo', 'call center', 'customer service', 'support'
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
     * Detect all AdSense ads on the page with comprehensive selectors
     */
    detectAdSenseAds() {
        const ads = [];
        
        // Use comprehensive selectors matching Python Selenium implementation
        this.adSelectors.forEach((selector, index) => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    // Check if element is visible and has reasonable size
                    const rect = element.getBoundingClientRect();
                    const isVisible = rect.width > 0 && rect.height > 0 && 
                                    rect.width >= 30 && rect.height >= 30; // Reduced from 50x50
                    
                    if (isVisible) {
                        const adInfo = this.analyzeAd(element, selector);
                        if (adInfo.isAdSense) {
                            ads.push(adInfo);
                        }
                    }
                });
            } catch (error) {
                // Silent error handling for stealth
                console.debug(`Selector ${index + 1}/${this.adSelectors.length} failed:`, error.message);
            }
        });

        this.adMetrics.totalAds = ads.length;
        this.currentSession.adsDetected = ads;
        
        console.log(`🔍 AdSense Detection: Found ${ads.length} ads using ${this.adSelectors.length} selectors`);
        
        return ads;
    }

    /**
     * Analyze individual ad element
     */
    analyzeAd(element, selector = '') {
        const adInfo = {
            element: element,
            selector: selector,
            isAdSense: false,
            isHighValue: false,
            category: null,
            value: 0,
            position: this.getAdPosition(element),
            size: this.getAdSize(element),
            visibility: this.getAdVisibility(element),
            content: this.extractAdContent(element),
            clickable: this.isClickable(element),
            iframe: element.tagName.toLowerCase() === 'iframe',
            visible: true
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
            value *= 4; // Increased from 3
        }

        // Position bonus
        if (adInfo.position === 'above_fold') {
            value *= 2.5; // Increased from 2
        } else if (adInfo.position === 'sidebar') {
            value *= 2.0; // Increased from 1.5
        }

        // Size bonus
        if (adInfo.size === 'large') {
            value *= 2.0; // Increased from 1.5
        } else if (adInfo.size === 'medium') {
            value *= 1.5; // Increased from 1.2
        }

        // Visibility bonus
        if (adInfo.visibility === 'high') {
            value *= 1.5; // Increased from 1.3
        }

        // Clickable bonus
        if (adInfo.clickable) {
            value *= 1.3; // New bonus for clickable ads
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
        const config = this.clickProbabilityConfig;
        const baseProbability = personality.clickProbability || config.default;
        let adjustedProbability = baseProbability;

        // High value ads get higher click probability
        if (adInfo.isHighValue) {
            adjustedProbability *= config.valueMultipliers.highValue;
        }

        // Professional personalities prefer high-value ads
        if (personality.type === 'professional' && adInfo.isHighValue) {
            adjustedProbability *= config.personalityMultipliers.professional;
        }

        // Researcher personalities click more on informational ads
        if (personality.type === 'researcher') {
            adjustedProbability *= config.personalityMultipliers.researcher;
        }

        // Explorer personalities click more on various ads
        if (personality.type === 'explorer') {
            adjustedProbability *= config.personalityMultipliers.explorer;
        }

        // Casual personalities click less
        if (personality.type === 'casual') {
            adjustedProbability *= config.personalityMultipliers.casual;
        }

        // Position-based boost
        if (adInfo.position === 'above_fold') {
            adjustedProbability *= config.valueMultipliers.aboveFold;
        }

        // Size-based boost
        if (adInfo.size === 'large') {
            adjustedProbability *= config.valueMultipliers.largeSize;
        } else if (adInfo.size === 'medium') {
            adjustedProbability *= config.valueMultipliers.mediumSize;
        }

        // Apply min-max constraints
        adjustedProbability = Math.max(config.min, Math.min(adjustedProbability, config.max));

        return Math.random() < adjustedProbability;
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

    /**
     * Get comprehensive detection statistics (similar to Python Selenium)
     */
    getDetectionStatistics() {
        const stats = {
            totalSelectors: this.adSelectors.length,
            adsDetected: this.adMetrics.totalAds,
            highValueAds: this.adMetrics.highValueAds,
            detectionRate: 0,
            selectorEffectiveness: {},
            adPositions: [],
            adSizes: [],
            adTypes: {},
            detectionTimestamp: new Date().toISOString()
        };

        // Calculate detection rate
        if (this.currentSession.adsDetected.length > 0) {
            stats.detectionRate = (this.currentSession.adsDetected.length / this.adSelectors.length) * 100;
        }

        // Analyze selector effectiveness
        this.adSelectors.forEach((selector, index) => {
            const adsFound = this.currentSession.adsDetected.filter(ad => 
                ad.selector === selector
            ).length;
            
            if (adsFound > 0) {
                stats.selectorEffectiveness[selector] = {
                    adsFound: adsFound,
                    effectiveness: (adsFound / this.currentSession.adsDetected.length) * 100
                };
            }
        });

        // Collect ad positions and sizes
        this.currentSession.adsDetected.forEach(ad => {
            if (ad.position) {
                stats.adPositions.push(ad.position);
            }
            if (ad.size) {
                stats.adSizes.push(ad.size);
            }
            if (ad.category) {
                stats.adTypes[ad.category] = (stats.adTypes[ad.category] || 0) + 1;
            }
        });

        return stats;
    }

    /**
     * Get detailed ad analysis (similar to Python _detect_adsense_ads)
     */
    getDetailedAdAnalysis() {
        const analysis = {
            url: window.location.href,
            adsDetected: this.currentSession.adsDetected.length,
            adPositions: [],
            adDetails: [],
            detectionMethod: 'comprehensive_selectors',
            selectorsUsed: this.adSelectors.length,
            timestamp: new Date().toISOString()
        };

        this.currentSession.adsDetected.forEach((ad, index) => {
            analysis.adPositions.push({
                index: index + 1,
                position: ad.position,
                size: ad.size,
                category: ad.category,
                value: ad.value,
                isHighValue: ad.isHighValue
            });

            analysis.adDetails.push({
                selector: ad.selector,
                element: ad.element.tagName,
                visible: ad.visible,
                clickable: ad.clickable,
                category: ad.category,
                value: ad.value
            });
        });

        return analysis;
    }

    /**
     * Calculate actual click probability for monitoring
     */
    calculateActualClickProbability(personality) {
        const config = this.clickProbabilityConfig;
        const baseProbability = personality.clickProbability || config.default;
        let maxProbability = baseProbability;

        // Calculate maximum possible probability with all bonuses
        if (personality.type === 'researcher') {
            maxProbability *= config.personalityMultipliers.researcher;
        } else if (personality.type === 'explorer') {
            maxProbability *= config.personalityMultipliers.explorer;
        } else if (personality.type === 'professional') {
            maxProbability *= config.personalityMultipliers.professional;
        } else if (personality.type === 'casual') {
            maxProbability *= config.personalityMultipliers.casual;
        }

        // Add position and size bonuses
        maxProbability *= config.valueMultipliers.aboveFold; // Above-fold bonus
        maxProbability *= config.valueMultipliers.largeSize; // Large size bonus
        maxProbability *= config.valueMultipliers.highValue; // High value bonus

        // Apply min-max constraints
        maxProbability = Math.max(config.min, Math.min(maxProbability, config.max));

        return {
            baseProbability: (baseProbability * 100).toFixed(1) + '%',
            maxProbability: (maxProbability * 100).toFixed(1) + '%',
            personality: personality.type,
            clickProbability: (personality.clickProbability * 100).toFixed(1) + '%',
            config: {
                min: (config.min * 100).toFixed(1) + '%',
                max: (config.max * 100).toFixed(1) + '%'
            }
        };
    }

    /**
     * Get click probability summary
     */
    getClickProbabilitySummary() {
        const personalities = [
            { type: 'researcher', clickProbability: 0.15 },
            { type: 'explorer', clickProbability: 0.12 },
            { type: 'professional', clickProbability: 0.10 },
            { type: 'casual', clickProbability: 0.08 }
        ];

        const summary = {
            targetRange: `${(this.clickProbabilityConfig.min * 100).toFixed(0)}% - ${(this.clickProbabilityConfig.max * 100).toFixed(0)}%`,
            personalities: {},
            averageProbability: 0,
            config: this.clickProbabilityConfig
        };

        let totalProbability = 0;

        personalities.forEach(personality => {
            const actual = this.calculateActualClickProbability(personality);
            summary.personalities[personality.type] = actual;
            totalProbability += parseFloat(actual.maxProbability);
        });

        summary.averageProbability = (totalProbability / personalities.length).toFixed(1) + '%';

        return summary;
    }

    /**
     * Update click probability configuration
     */
    updateClickProbabilityConfig(newConfig) {
        // Validate input
        if (newConfig.min && (newConfig.min < 0 || newConfig.min > 1)) {
            throw new Error('Min probability must be between 0 and 1');
        }
        if (newConfig.max && (newConfig.max < 0 || newConfig.max > 1)) {
            throw new Error('Max probability must be between 0 and 1');
        }
        if (newConfig.min && newConfig.max && newConfig.min > newConfig.max) {
            throw new Error('Min probability cannot be greater than max probability');
        }

        // Update configuration
        this.clickProbabilityConfig = {
            ...this.clickProbabilityConfig,
            ...newConfig
        };

        console.log('✅ Click probability config updated:', this.clickProbabilityConfig);
        return this.clickProbabilityConfig;
    }

    /**
     * Set probability range (min-max)
     */
    setProbabilityRange(min, max) {
        return this.updateClickProbabilityConfig({ min, max });
    }

    /**
     * Set default probability
     */
    setDefaultProbability(defaultProb) {
        return this.updateClickProbabilityConfig({ default: defaultProb });
    }

    /**
     * Update personality multipliers
     */
    updatePersonalityMultipliers(multipliers) {
        return this.updateClickProbabilityConfig({
            personalityMultipliers: {
                ...this.clickProbabilityConfig.personalityMultipliers,
                ...multipliers
            }
        });
    }

    /**
     * Update value multipliers
     */
    updateValueMultipliers(multipliers) {
        return this.updateClickProbabilityConfig({
            valueMultipliers: {
                ...this.clickProbabilityConfig.valueMultipliers,
                ...multipliers
            }
        });
    }

    /**
     * Get current probability configuration
     */
    getProbabilityConfig() {
        return {
            ...this.clickProbabilityConfig,
            currentRange: `${(this.clickProbabilityConfig.min * 100).toFixed(1)}% - ${(this.clickProbabilityConfig.max * 100).toFixed(1)}%`
        };
    }

    /**
     * Reset to default configuration
     */
    resetProbabilityConfig() {
        this.clickProbabilityConfig = {
            min: 0.10,
            max: 0.15,
            default: 0.12,
            personalityMultipliers: {
                researcher: 1.1,
                explorer: 1.1,
                professional: 1.1,
                casual: 0.9
            },
            valueMultipliers: {
                highValue: 1.2,
                aboveFold: 1.1,
                largeSize: 1.1,
                mediumSize: 1.1
            }
        };
        console.log('🔄 Click probability config reset to default');
        return this.clickProbabilityConfig;
    }

    /**
     * Add high value category keywords
     */
    addHighValueCategories(categories) {
        if (Array.isArray(categories)) {
            this.highValueCategories.push(...categories);
        } else if (typeof categories === 'string') {
            this.highValueCategories.push(categories);
        }
        console.log(`✅ Added ${Array.isArray(categories) ? categories.length : 1} high value categories`);
        return this.highValueCategories;
    }

    /**
     * Remove high value category keywords
     */
    removeHighValueCategories(categories) {
        if (Array.isArray(categories)) {
            this.highValueCategories = this.highValueCategories.filter(cat => !categories.includes(cat));
        } else if (typeof categories === 'string') {
            this.highValueCategories = this.highValueCategories.filter(cat => cat !== categories);
        }
        console.log(`🗑️ Removed ${Array.isArray(categories) ? categories.length : 1} high value categories`);
        return this.highValueCategories;
    }

    /**
     * Get high value categories by category type
     */
    getHighValueCategoriesByType(type) {
        const categoryGroups = {
            'ai': ['ai', 'artificial intelligence', 'machine learning', 'ml', 'deep learning', 'neural network'],
            'finance': ['finance', 'insurance', 'investment', 'loan', 'credit', 'banking', 'financial', 'trading', 'forex'],
            'crypto': ['crypto', 'bitcoin', 'ethereum', 'blockchain', 'nft'],
            'cybersecurity': ['cybersecurity', 'security', 'hacking', 'penetration testing', 'ethical hacking'],
            'healthcare': ['healthcare', 'medical', 'pharmaceutical', 'dental', 'hospital', 'doctor', 'telemedicine'],
            'legal': ['legal', 'lawyer', 'attorney', 'consultation', 'law', 'court', 'litigation'],
            'real-estate': ['real-estate', 'property', 'mortgage', 'home', 'house', 'apartment', 'commercial'],
            'technology': ['technology', 'software', 'hardware', 'cloud', 'saas', 'automation', 'robotics', 'iot']
        };
        
        return categoryGroups[type] || [];
    }

    /**
     * Get all high value categories
     */
    getAllHighValueCategories() {
        return {
            categories: [...this.highValueCategories],
            count: this.highValueCategories.length,
            categoriesByType: {
                'AI & Technology': this.getHighValueCategoriesByType('ai'),
                'Finance & Investment': this.getHighValueCategoriesByType('finance'),
                'Cryptocurrency': this.getHighValueCategoriesByType('crypto'),
                'Cybersecurity': this.getHighValueCategoriesByType('cybersecurity'),
                'Healthcare': this.getHighValueCategoriesByType('healthcare'),
                'Legal': this.getHighValueCategoriesByType('legal'),
                'Real Estate': this.getHighValueCategoriesByType('real-estate'),
                'Technology': this.getHighValueCategoriesByType('technology')
            }
        };
    }

    /**
     * Check if specific keyword is high value
     */
    isHighValueKeyword(keyword) {
        return this.highValueCategories.includes(keyword.toLowerCase());
    }

    /**
     * Get high value score for content
     */
    getHighValueScore(content) {
        const words = content.toLowerCase().split(/\s+/);
        let score = 0;
        let matchedKeywords = [];

        this.highValueCategories.forEach(category => {
            if (content.toLowerCase().includes(category.toLowerCase())) {
                score += 1;
                matchedKeywords.push(category);
            }
        });

        return {
            score: score,
            matchedKeywords: matchedKeywords,
            isHighValue: score > 0,
            density: score / words.length
        };
    }
}

// Export for use in other modules with enhanced stealth protection
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdSenseDetector;
} else if (typeof window !== 'undefined' && !window.AdSenseDetector) {
    window.AdSenseDetector = AdSenseDetector;
}
