/**
 * Content Analyzer - Analyzes and processes page content
 * Focuses on content optimization and high-value element targeting
 */

class ContentAnalyzer {
    constructor() {
        // Click probability configuration
        this.clickProbabilityConfig = {
            min: 0.05,  // 5% minimum (reduced from 20%)
            max: 0.35,  // 35% maximum (increased from 25%)
            default: 0.20, // 20% default (increased from 15%)
            personalityMultipliers: {
                researcher: 1.3,  // Increased from 1.1
                explorer: 1.2,    // Increased from 1.1
                professional: 1.1, // Same
                casual: 1.1       // Optimized from 1.0 to 1.1 for better RPM
            },
            valueMultipliers: {
                highValue: 1.5,   // Increased from 1.2
                aboveFold: 1.3,   // Increased from 1.1
                largeSize: 1.2,   // Increased from 1.1
                mediumSize: 1.1   // Same
            }
        };

        // Stealth configuration
        this.stealthConfig = {
            detectionInterval: 60000, // 1 minute instead of real-time
            maxDetectionFrequency: 5, // Max 5 detections per minute
            lastDetectionTime: 0,
            detectionCount: 0,
            stealthMode: true
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
     * Analyze page content with stealth frequency control
     */
    analyzeContent() {
        // Check stealth frequency limits
        if (!this.canDetectAds()) {
            return this.lastDetectionResult || [];
        }
        
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
            }
        });

        // Update detection tracking
        this.updateDetectionTracking();
        
        // Cache result for stealth
        this.lastDetectionResult = ads;
        
        this.adMetrics.totalAds = ads.length;
        this.currentSession.adsDetected = ads;
        
        // Stealth logging - removed for security
        
        return ads;
    }

    /**
     * Check if ad detection is allowed based on stealth limits
     */
    canDetectAds() {
        const now = Date.now();
        
        // Reset counter if interval has passed
        if (now - this.stealthConfig.lastDetectionTime > this.stealthConfig.detectionInterval) {
            this.stealthConfig.detectionCount = 0;
            this.stealthConfig.lastDetectionTime = now;
        }
        
        // Check frequency limit
        if (this.stealthConfig.detectionCount >= this.stealthConfig.maxDetectionFrequency) {
            return false;
        }
        
        return true;
    }

    /**
     * Update detection tracking
     */
    updateDetectionTracking() {
        this.stealthConfig.detectionCount++;
        this.stealthConfig.lastDetectionTime = Date.now();
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
     * Smart element interaction for content optimization
     */
    async processElementInteraction(elementInfo, personality) {
        if (!elementInfo.isAdSense || !elementInfo.clickable) {
            return false;
        }

        const interaction = {
            elementId: this.generateElementId(elementInfo),
            timestamp: Date.now(),
            type: 'interaction',
            category: elementInfo.category,
            isHighValue: elementInfo.isHighValue,
            value: elementInfo.value
        };

        // Determine interaction type based on personality and element value
        const shouldClick = this.shouldClickElement(elementInfo, personality);
        const shouldHover = this.shouldHoverElement(elementInfo, personality);

        if (shouldClick) {
            interaction.action = 'click';
            await this.simulateElementClick(elementInfo.element);
            this.adMetrics.clickedAds++;
            this.currentSession.rpmOptimization.totalClicks++;
            
            if (elementInfo.isHighValue) {
                this.currentSession.rpmOptimization.highValueClicks++;
            }
        } else if (shouldHover) {
            interaction.action = 'hover';
            await this.simulateElementHover(elementInfo.element);
            this.adMetrics.hoveredAds++;
        } else {
            interaction.action = 'view';
            await this.simulateElementView(elementInfo.element);
        }

        this.currentSession.interactions.push(interaction);
        return interaction;
    }

    /**
     * Determine if element should be clicked based on personality and value
     */
    shouldClickElement(elementInfo, personality) {
        const config = this.clickProbabilityConfig;
        const baseProbability = personality.clickProbability || config.default;
        let adjustedProbability = baseProbability;

        // High value elements get higher click probability
        if (elementInfo.isHighValue) {
            adjustedProbability *= config.valueMultipliers.highValue;
        }

        // Professional personalities prefer high-value elements
        if (personality.type === 'professional' && elementInfo.isHighValue) {
            adjustedProbability *= config.personalityMultipliers.professional;
        }

        // Researcher personalities click more on informational elements
        if (personality.type === 'researcher') {
            adjustedProbability *= config.personalityMultipliers.researcher;
        }

        // Explorer personalities click more on various elements
        if (personality.type === 'explorer') {
            adjustedProbability *= config.personalityMultipliers.explorer;
        }

        // Casual personalities click less
        if (personality.type === 'casual') {
            adjustedProbability *= config.personalityMultipliers.casual;
        }

        // Position-based boost
        if (elementInfo.position === 'above_fold') {
            adjustedProbability *= config.valueMultipliers.aboveFold;
        }

        // Size-based boost
        if (elementInfo.size === 'large') {
            adjustedProbability *= config.valueMultipliers.largeSize;
        } else if (elementInfo.size === 'medium') {
            adjustedProbability *= config.valueMultipliers.mediumSize;
        }

        // Apply min-max constraints
        adjustedProbability = Math.max(config.min, Math.min(adjustedProbability, config.max));

        return Math.random() < adjustedProbability;
    }

    /**
     * Determine if element should be hovered
     */
    shouldHoverElement(elementInfo, personality) {
        const baseProbability = personality.hoverProbability || 0.6;
        let adjustedProbability = baseProbability;

        // High value elements get more hover attention
        if (elementInfo.isHighValue) {
            adjustedProbability *= 1.2;
        }

        // Explorer personalities hover more
        if (personality.type === 'explorer') {
            adjustedProbability *= 1.3;
        }

        return Math.random() < adjustedProbability;
    }

    /**
     * Simulate element click
     */
    async simulateElementClick(element) {
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
            console.error('Error simulating element click:', error);
            return false;
        }
    }

    /**
     * Extract actual click URL from iframe content or element
     */
    extractActualClickUrl(element) {
        try {
            console.log('🔍 Extracting actual click URL from element...');
            
            // Method 1: Look for direct href links in the element
            const directLinks = element.element.querySelectorAll('a[href]');
            if (directLinks.length > 0) {
                for (const link of directLinks) {
                    const href = link.getAttribute('href');
                    if (href && href.includes('googleadservices.com/pagead/aclk')) {
                        console.log('📍 Found direct Google AdServices click URL:', href);
                        return href;
                    }
                }
            }
            
            // Method 2: Check if the element itself is a link
            if (element.element.tagName === 'A' && element.element.href) {
                const href = element.element.href;
                if (href.includes('googleadservices.com/pagead/aclk')) {
                    console.log('📍 Ad element is direct link:', href);
                    return href;
                }
            }
            
            // Method 3: Look for iframe and extract from iframe src
            const iframeSrc = element.element.src;
            if (iframeSrc) {
                console.log('🔍 Analyzing iframe src for actual click URL...');
                
                // Parse URL to get parameters
                const url = new URL(iframeSrc);
                const params = new URLSearchParams(url.search);
                
                // Look for common parameters that might contain the actual click URL
                const possibleParams = ['adurl', 'url', 'target', 'dest', 'redirect', 'click'];
                
                for (const param of possibleParams) {
                    const value = params.get(param);
                    if (value) {
                        try {
                            // Decode the URL
                            const decodedUrl = decodeURIComponent(value);
                            console.log(`📍 Found potential click URL in param '${param}':`, decodedUrl);
                            
                            // Validate if it's a proper URL
                            new URL(decodedUrl);
                            return decodedUrl;
                        } catch (e) {
                            console.log(`⚠️ Invalid URL in param '${param}':`, value);
                        }
                    }
                }
                
                // Try to construct Google AdServices click URL from iframe parameters
                if (iframeSrc.includes('doubleclick.net')) {
                    console.log('🔍 Attempting to construct Google AdServices click URL...');
                    
                    // Extract client ID from iframe src
                    const clientMatch = iframeSrc.match(/client=([^&]+)/);
                    const adkMatch = iframeSrc.match(/adk=([^&]+)/);
                    const ifiMatch = iframeSrc.match(/ifi=([^&]+)/);
                    
                    if (clientMatch && adkMatch) {
                        // Construct a potential click URL
                        const baseUrl = 'https://www.googleadservices.com/pagead/aclk';
                        const clickParams = new URLSearchParams({
                            'client': clientMatch[1],
                            'adk': adkMatch[1],
                            'ifi': ifiMatch ? ifiMatch[1] : '1',
                            'gclid': 'Cj0KCQjww4TGBhCKARIsAFLXndQbKNvISWzkW8CH43C3h0HUXZwkNkK3mW8WGJNLFMppTilECdUKfqMaArzREALw_wcB'
                        });
                        
                        const constructedUrl = `${baseUrl}?${clickParams.toString()}`;
                        console.log('🎯 Constructed potential click URL:', constructedUrl);
                        return constructedUrl;
                    }
                }
            }
            
            // Method 4: Try to access iframe content (if same-origin)
            if (element.element.tagName === 'IFRAME') {
                try {
                    const iframeDoc = element.element.contentDocument || element.element.contentWindow.document;
                    if (iframeDoc) {
                        const iframeLinks = iframeDoc.querySelectorAll('a[href]');
                        if (iframeLinks.length > 0) {
                            for (const link of iframeLinks) {
                                const href = link.getAttribute('href');
                                if (href && href.includes('googleadservices.com/pagead/aclk')) {
                                    console.log('📍 Found click URL in iframe content:', href);
                                    return href;
                                }
                            }
                        }
                    }
                } catch (e) {
                    console.log('⚠️ Cannot access iframe content (cross-origin):', e.message);
                }
            }
            
            console.log('❌ No actual click URL found in element');
            return null;
            
        } catch (error) {
            console.error('Error extracting actual click URL:', error);
            return null;
        }
    }

    /**
     * Safe iframe element clicking method
     */
    async clickIframeElement(element) {
        try {
            console.log('🎯 Processing iframe element click...');
            
            // Method 1: Try to extract actual click URL from element
            const actualClickUrl = this.extractActualClickUrl(element);
            if (actualClickUrl) {
                console.log('🎯 Found actual click URL, opening:', actualClickUrl);
                window.open(actualClickUrl, '_blank');
                
                return {
                    success: true,
                    clickMethod: 'iframe_actual_url',
                    actualUrl: actualClickUrl,
                    timestamp: Date.now()
                };
            }
            
            // Method 2: Fallback - try iframe src directly
            const iframeSrc = element.element.src;
            if (iframeSrc) {
                console.log('📍 Iframe src found:', iframeSrc);
                
                // Check if it's a Google AdSense iframe
                if (iframeSrc.includes('googleadservices') || 
                    iframeSrc.includes('doubleclick') || 
                    iframeSrc.includes('googlesyndication')) {
                    
                    // Fallback: open iframe src directly
                    console.log('🎯 No actual URL found, opening iframe src directly...');
                    window.open(iframeSrc, '_blank');
                    
                    return {
                        success: true,
                        clickMethod: 'iframe_src_open',
                        iframeSrc: iframeSrc,
                        timestamp: Date.now()
                    };
                }
            }
            
            // Method 2: Try to access iframe content (if same-origin)
            try {
                const iframeDoc = element.element.contentDocument || element.element.contentWindow.document;
                if (iframeDoc) {
                    console.log('📍 Iframe content accessible, looking for links...');
                    
                    // Look for links in iframe content
                    const links = iframeDoc.querySelectorAll('a[href]');
                    if (links.length > 0) {
                        const randomLink = links[Math.floor(Math.random() * links.length)];
                        const linkHref = randomLink.href;
                        
                        console.log('🎯 Found link in iframe, opening:', linkHref);
                        window.open(linkHref, '_blank');
                        
                        return {
                            success: true,
                            clickMethod: 'iframe_content_link',
                            linkHref: linkHref,
                            timestamp: Date.now()
                        };
                    }
                }
            } catch (e) {
                console.log('⚠️ Cross-origin iframe, cannot access content');
            }
            
            // Method 3: Try to click the iframe element itself
            try {
                console.log('🎯 Attempting to click iframe element directly...');
                element.element.click();
                
                return {
                    success: true,
                    clickMethod: 'iframe_direct_click',
                    timestamp: Date.now()
                };
            } catch (error) {
                console.log('❌ Direct iframe click failed:', error.message);
            }
            
            // Method 4: Try to dispatch click event on iframe
            try {
                console.log('🎯 Attempting to dispatch click event on iframe...');
                const clickEvent = new MouseEvent('click', {
                    view: window,
                    bubbles: true,
                    cancelable: true,
                    clientX: element.element.getBoundingClientRect().left + 10,
                    clientY: element.element.getBoundingClientRect().top + 10
                });
                element.element.dispatchEvent(clickEvent);
                
                return {
                    success: true,
                    clickMethod: 'iframe_event_dispatch',
                    timestamp: Date.now()
                };
            } catch (error) {
                console.log('❌ Iframe event dispatch failed:', error.message);
            }
            
            return {
                success: false,
                error: 'All iframe click methods failed',
                iframeSrc: iframeSrc || 'unknown'
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Simulate element hover
     */
    async simulateElementHover(element) {
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
            console.error('Error simulating element hover:', error);
            return false;
        }
    }

    /**
     * Simulate element view (just looking at element)
     */
    async simulateElementView(element) {
        try {
            // Scroll to make element visible if needed
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
            console.error('Error simulating element view:', error);
            return false;
        }
    }

    /**
     * Generate unique element ID
     */
    generateElementId(elementInfo) {
        return 'element_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
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
     * Utility delay function with stealth
     */
    delay(ms) {
        // Use stealth delay if available, otherwise fallback to standard delay
        try {
            if (window._stealth_delay) {
                const stealthDelay = new window._stealth_delay();
                return stealthDelay.wait(ms);
            } else {
                return new Promise(resolve => setTimeout(resolve, ms));
            }
        } catch (error) {
            // Fallback to standard delay if stealth delay fails
            return new Promise(resolve => setTimeout(resolve, ms));
        }
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

        // Use stealth storage instead of chrome storage
        try {
            const stealthStorage = new (window._stealth_storage || (() => {
                // Fallback storage if stealth storage is not available
                return {
                    set: (key, value) => {
                        try {
                            localStorage.setItem(key, JSON.stringify(value));
                        } catch (e) {
                            // Silent fallback
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
            stealthStorage.set(`adsense_session_${this.currentSession.startTime}`, sessionData);
        } catch (error) {
            // Silent fallback
        }

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
            { type: 'researcher', clickProbability: 0.30 },
            { type: 'explorer', clickProbability: 0.25 },
            { type: 'professional', clickProbability: 0.22 },
            { type: 'casual', clickProbability: 0.20 }
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

        // Stealth logging - removed for security
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
            min: 0.05,  // 5% minimum
            max: 0.35,  // 35% maximum
            default: 0.20, // 20% default
            personalityMultipliers: {
                researcher: 1.3,  // Increased
                explorer: 1.2,    // Increased
                professional: 1.1, // Same
                casual: 1.0       // Increased
            },
            valueMultipliers: {
                highValue: 1.5,   // Increased
                aboveFold: 1.3,   // Increased
                largeSize: 1.2,   // Increased
                mediumSize: 1.1   // Same
            }
        };
        // Stealth logging - removed for security
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
        // Stealth logging - removed for security
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
        // Stealth logging - removed for security
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

    /**
     * Calculate comprehensive RPM probability analysis
     */
    calculateRPMProbabilityAnalysis() {
        const config = this.clickProbabilityConfig;
        const personalities = [
            { type: 'researcher', clickProbability: 0.30 },
            { type: 'explorer', clickProbability: 0.25 },
            { type: 'professional', clickProbability: 0.22 },
            { type: 'casual', clickProbability: 0.20 }
        ];

        const analysis = {
            configuration: {
                minProbability: (config.min * 100).toFixed(1) + '%',
                maxProbability: (config.max * 100).toFixed(1) + '%',
                defaultProbability: (config.default * 100).toFixed(1) + '%',
                personalityMultipliers: config.personalityMultipliers,
                valueMultipliers: config.valueMultipliers
            },
            personalityAnalysis: {},
            scenarioAnalysis: {},
            rpmOptimization: {},
            recommendations: []
        };

        // Analyze each personality
        personalities.forEach(personality => {
            const baseProb = personality.clickProbability;
            const personalityAnalysis = {
                baseProbability: (baseProb * 100).toFixed(1) + '%',
                scenarios: {}
            };

            // Scenario 1: Basic ad (no bonuses)
            const basicProb = Math.max(config.min, Math.min(baseProb, config.max));
            personalityAnalysis.scenarios.basic = (basicProb * 100).toFixed(1) + '%';

            // Scenario 2: High value ad
            const highValueProb = Math.max(config.min, Math.min(baseProb * config.valueMultipliers.highValue, config.max));
            personalityAnalysis.scenarios.highValue = (highValueProb * 100).toFixed(1) + '%';

            // Scenario 3: Above-fold ad
            const aboveFoldProb = Math.max(config.min, Math.min(baseProb * config.valueMultipliers.aboveFold, config.max));
            personalityAnalysis.scenarios.aboveFold = (aboveFoldProb * 100).toFixed(1) + '%';

            // Scenario 4: Large size ad
            const largeSizeProb = Math.max(config.min, Math.min(baseProb * config.valueMultipliers.largeSize, config.max));
            personalityAnalysis.scenarios.largeSize = (largeSizeProb * 100).toFixed(1) + '%';

            // Scenario 5: High value + above-fold + large size (optimal scenario)
            const optimalProb = Math.max(config.min, Math.min(
                baseProb * 
                config.valueMultipliers.highValue * 
                config.valueMultipliers.aboveFold * 
                config.valueMultipliers.largeSize, 
                config.max
            ), config.max);
            personalityAnalysis.scenarios.optimal = (optimalProb * 100).toFixed(1) + '%';

            // Personality-specific bonuses
            if (personality.type === 'professional') {
                const professionalBonus = Math.max(config.min, Math.min(
                    optimalProb * config.personalityMultipliers.professional,
                    config.max
                ));
                personalityAnalysis.scenarios.professionalBonus = (professionalBonus * 100).toFixed(1) + '%';
            }

            analysis.personalityAnalysis[personality.type] = personalityAnalysis;
        });

        // Scenario analysis
        analysis.scenarioAnalysis = {
            bestCase: {
                personality: 'researcher',
                scenario: 'optimal + professional bonus',
                probability: '15.0%',
                description: 'Researcher personality with high-value, above-fold, large ad'
            },
            worstCase: {
                personality: 'casual',
                scenario: 'basic ad',
                probability: '10.0%',
                description: 'Casual personality with basic ad'
            },
            averageCase: {
                personality: 'explorer',
                scenario: 'high value ad',
                probability: '14.4%',
                description: 'Explorer personality with high-value ad'
            }
        };

        // RPM optimization analysis
        analysis.rpmOptimization = {
            highValueTargeting: {
                enabled: true,
                multiplier: config.valueMultipliers.highValue,
                impact: '20% increase in click probability for high-value ads'
            },
            positionOptimization: {
                aboveFold: config.valueMultipliers.aboveFold,
                sidebar: 1.0, // No bonus for sidebar
                impact: '10% increase for above-fold ads'
            },
            sizeOptimization: {
                large: config.valueMultipliers.largeSize,
                medium: config.valueMultipliers.mediumSize,
                impact: '10% increase for large/medium ads'
            },
            personalityOptimization: {
                researcher: 'Highest base probability (15%)',
                explorer: 'High probability (12%)',
                professional: 'Medium probability (10%) with high-value bonus',
                casual: 'Lowest probability (8%)'
            }
        };

        // Recommendations
        analysis.recommendations = [
            'Focus on high-value categories (finance, business, healthcare, legal, technology)',
            'Prioritize above-fold ad positions for better visibility',
            'Target large and medium-sized ads for higher engagement',
            'Use researcher personality for maximum click probability',
            'Combine multiple optimizations for best results',
            'Monitor actual click rates and adjust probabilities if needed'
        ];

        return analysis;
    }

    /**
     * Get RPM probability summary for quick reference
     */
    getRPMProbabilitySummary() {
        const analysis = this.calculateRPMProbabilityAnalysis();
        
        return {
            targetRange: `${analysis.configuration.minProbability} - ${analysis.configuration.maxProbability}`,
            bestCase: analysis.scenarioAnalysis.bestCase,
            worstCase: analysis.scenarioAnalysis.worstCase,
            averageCase: analysis.scenarioAnalysis.averageCase,
            personalityRanking: {
                '1st': 'Researcher (15% base)',
                '2nd': 'Explorer (12% base)',
                '3rd': 'Professional (10% base)',
                '4th': 'Casual (8% base)'
            },
            optimizationFactors: {
                'High Value': '+20%',
                'Above Fold': '+10%',
                'Large Size': '+10%',
                'Professional Bonus': '+10%'
            }
        };
    }

    /**
     * Get click probability for specific personality type
     */
    getPersonalityClickProbability(personalityType) {
        const probabilities = {
            researcher: 0.15,
            explorer: 0.12,
            professional: 0.10,
            casual: 0.08
        };
        return probabilities[personalityType] || this.clickProbabilityConfig.default;
    }

    /**
     * Calculate comprehensive RPM estimation
     */
    calculateRPMEstimation() {
        const config = this.clickProbabilityConfig;
        const session = this.currentSession;
        
        // Base RPM assumptions (industry averages)
        const baseRPM = {
            lowValue: 0.50,    // $0.50 per 1000 impressions
            mediumValue: 2.00, // $2.00 per 1000 impressions
            highValue: 8.00,   // $8.00 per 1000 impressions
            premium: 15.00     // $15.00 per 1000 impressions
        };
        
        // Calculate effective click probability
        const effectiveClickProb = this.calculateEffectiveClickProbability();
        
        // Calculate RPM based on ad value distribution
        const rpmEstimation = {
            baseRPM: baseRPM,
            effectiveClickProbability: (effectiveClickProb * 100).toFixed(2) + '%',
            estimatedRPM: {
                lowValue: baseRPM.lowValue * effectiveClickProb,
                mediumValue: baseRPM.mediumValue * effectiveClickProb,
                highValue: baseRPM.highValue * effectiveClickProb,
                premium: baseRPM.premium * effectiveClickProb
            },
            optimization: {
                highValueMultiplier: config.valueMultipliers.highValue,
                aboveFoldMultiplier: config.valueMultipliers.aboveFold,
                largeSizeMultiplier: config.valueMultipliers.largeSize,
                personalityMultipliers: config.personalityMultipliers
            },
            recommendations: this.generateRPMRecommendations()
        };
        
        return rpmEstimation;
    }
    
    /**
     * Calculate effective click probability considering all factors
     */
    calculateEffectiveClickProbability() {
        const config = this.clickProbabilityConfig;
        const personalities = [
            { type: 'researcher', weight: 0.25 },
            { type: 'explorer', weight: 0.25 },
            { type: 'professional', weight: 0.25 },
            { type: 'casual', weight: 0.25 }
        ];
        
        let totalProbability = 0;
        let totalWeight = 0;
        
        personalities.forEach(personality => {
            const baseProb = this.getPersonalityClickProbability(personality.type);
            const effectiveProb = baseProb * personality.weight;
            totalProbability += effectiveProb;
            totalWeight += personality.weight;
        });
        
        // Apply value multipliers for high-value ads
        const highValueBonus = config.valueMultipliers.highValue;
        const aboveFoldBonus = config.valueMultipliers.aboveFold;
        const largeSizeBonus = config.valueMultipliers.largeSize;
        
        const averageProbability = totalProbability / totalWeight;
        const optimizedProbability = Math.min(
            averageProbability * highValueBonus * aboveFoldBonus * largeSizeBonus,
            config.max
        );
        
        return Math.max(optimizedProbability, config.min);
    }
    
    /**
     * Generate RPM optimization recommendations
     */
    generateRPMRecommendations() {
        return [
            {
                priority: 'High',
                action: 'Focus on high-value categories',
                impact: '20% increase in click probability',
                categories: ['finance', 'business', 'healthcare', 'legal', 'technology']
            },
            {
                priority: 'High',
                action: 'Target above-fold ad positions',
                impact: '10% increase in click probability',
                description: 'Ads visible without scrolling'
            },
            {
                priority: 'Medium',
                action: 'Prefer large and medium ad sizes',
                impact: '10% increase in click probability',
                sizes: ['large', 'medium']
            },
            {
                priority: 'Medium',
                action: 'Use researcher personality',
                impact: '15% base click probability (highest)',
                description: 'Best for RPM optimization'
            },
            {
                priority: 'Low',
                action: 'Avoid casual personality',
                impact: '8% base click probability (lowest)',
                description: 'Use only for stealth scenarios'
            }
        ];
    }

    /**
     * Initialize fraud prevention system
     */
    initializeFraudPrevention() {
        this.fraudPreventionConfig = {
            // Click frequency limits
            maxClicksPerHour: 10,
            maxClicksPerDay: 50,
            minClickInterval: 30000, // 30 seconds
            
            // Page limits
            maxClicksPerPage: 3,
            maxClicksPerDomain: 5,
            
            // Session limits
            maxClicksPerSession: 15,
            maxLandingPageVisits: 20,
            
            // Behavior validation
            requireLandingPageInteraction: true,
            requireRealisticDwellTime: true,
            preventRapidNavigation: true
        };
        
        // Initialize tracking
        this.clickTracking = {
            hourlyClicks: [],
            dailyClicks: [],
            pageClicks: new Map(),
            domainClicks: new Map(),
            sessionClicks: 0,
            lastClickTime: 0,
            landingPageVisits: []
        };
        
        // Setup periodic cleanup
        this.setupClickTrackingCleanup();
    }

    /**
     * Setup periodic cleanup for click tracking
     */
    setupClickTrackingCleanup() {
        // Cleanup hourly clicks every hour
        setInterval(() => {
            this.cleanupHourlyClicks();
        }, 60 * 60 * 1000);
        
        // Cleanup daily clicks every day
        setInterval(() => {
            this.cleanupDailyClicks();
        }, 24 * 60 * 60 * 1000);
    }

    /**
     * Cleanup old click tracking data
     */
    cleanupHourlyClicks() {
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        this.clickTracking.hourlyClicks = this.clickTracking.hourlyClicks.filter(
            click => click.timestamp > oneHourAgo
        );
        console.debug('Hourly click tracking cleaned');
    }

    cleanupDailyClicks() {
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        this.clickTracking.dailyClicks = this.clickTracking.dailyClicks.filter(
            click => click.timestamp > oneDayAgo
        );
        console.debug('Daily click tracking cleaned');
    }

    /**
     * Enhanced fraud prevention validation
     */
    validateFraudPrevention(element) {
        try {
            const now = Date.now();
            const currentUrl = window.location.href;
            const domain = new URL(currentUrl).hostname;
            
            // Check click frequency limits
            if (!this.validateClickFrequency(now)) {
                return { valid: false, reason: 'Click frequency limit exceeded' };
            }
            
            // Check page limits
            if (!this.validatePageLimits(currentUrl)) {
                return { valid: false, reason: 'Page click limit exceeded' };
            }
            
            // Check domain limits
            if (!this.validateDomainLimits(domain)) {
                return { valid: false, reason: 'Domain click limit exceeded' };
            }
            
            // Check session limits
            if (!this.validateSessionLimits()) {
                return { valid: false, reason: 'Session click limit exceeded' };
            }
            
            // Check element validity
            if (!this.validateElement(element)) {
                return { valid: false, reason: 'Invalid ad element' };
            }
            
            return { valid: true, reason: 'All validations passed' };
            
        } catch (error) {
            console.error('Error in fraud prevention validation:', error);
            return { valid: false, reason: 'Validation error' };
        }
    }

    /**
     * Validate click frequency
     */
    validateClickFrequency(now) {
        // Check hourly limit
        const hourlyClicks = this.clickTracking.hourlyClicks.filter(
            click => click.timestamp > now - (60 * 60 * 1000)
        ).length;
        
        if (hourlyClicks >= this.fraudPreventionConfig.maxClicksPerHour) {
            console.warn(`Hourly click limit exceeded: ${hourlyClicks}`);
            return false;
        }
        
        // Check daily limit
        const dailyClicks = this.clickTracking.dailyClicks.filter(
            click => click.timestamp > now - (24 * 60 * 60 * 1000)
        ).length;
        
        if (dailyClicks >= this.fraudPreventionConfig.maxClicksPerDay) {
            console.warn(`Daily click limit exceeded: ${dailyClicks}`);
            return false;
        }
        
        // Check minimum interval
        const timeSinceLastClick = now - this.clickTracking.lastClickTime;
        if (timeSinceLastClick < this.fraudPreventionConfig.minClickInterval) {
            console.warn(`Click too soon: ${timeSinceLastClick}ms since last click`);
            return false;
        }
        
        return true;
    }

    /**
     * Validate page limits
     */
    validatePageLimits(currentUrl) {
        const pageClicks = this.clickTracking.pageClicks.get(currentUrl) || 0;
        if (pageClicks >= this.fraudPreventionConfig.maxClicksPerPage) {
            console.warn(`Page click limit exceeded: ${pageClicks} on ${currentUrl}`);
            return false;
        }
        return true;
    }

    /**
     * Validate domain limits
     */
    validateDomainLimits(domain) {
        const domainClicks = this.clickTracking.domainClicks.get(domain) || 0;
        if (domainClicks >= this.fraudPreventionConfig.maxClicksPerDomain) {
            console.warn(`Domain click limit exceeded: ${domainClicks} on ${domain}`);
            return false;
        }
        return true;
    }

    /**
     * Validate session limits
     */
    validateSessionLimits() {
        if (this.clickTracking.sessionClicks >= this.fraudPreventionConfig.maxClicksPerSession) {
            console.warn(`Session click limit exceeded: ${this.clickTracking.sessionClicks}`);
            return false;
        }
        return true;
    }

    /**
     * Validate element
     */
    validateElement(element) {
        if (!element || !element.getBoundingClientRect) {
            return false;
        }
        
        const rect = element.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
            return false;
        }
        
        // Check if element is in viewport
        if (rect.top < 0 || rect.left < 0 || 
            rect.bottom > window.innerHeight || 
            rect.right > window.innerWidth) {
            return false;
        }
        
        return true;
    }

    /**
     * Record click for fraud prevention
     */
    recordClickForFraudPrevention(element, adInfo) {
        try {
            const now = Date.now();
            const currentUrl = window.location.href;
            const domain = new URL(currentUrl).hostname;
            
            // Record click in all tracking systems
            const clickRecord = {
                timestamp: now,
                url: currentUrl,
                domain: domain,
                adInfo: adInfo,
                element: element
            };
            
            // Add to hourly tracking
            this.clickTracking.hourlyClicks.push(clickRecord);
            
            // Add to daily tracking
            this.clickTracking.dailyClicks.push(clickRecord);
            
            // Update page clicks
            const pageClicks = this.clickTracking.pageClicks.get(currentUrl) || 0;
            this.clickTracking.pageClicks.set(currentUrl, pageClicks + 1);
            
            // Update domain clicks
            const domainClicks = this.clickTracking.domainClicks.get(domain) || 0;
            this.clickTracking.domainClicks.set(domain, domainClicks + 1);
            
            // Update session clicks
            this.clickTracking.sessionClicks++;
            this.clickTracking.lastClickTime = now;
            
            console.log(`📊 Click recorded for fraud prevention - Session: ${this.clickTracking.sessionClicks}, Page: ${pageClicks + 1}, Domain: ${domainClicks + 1}`);
            
        } catch (error) {
            console.error('Error recording click for fraud prevention:', error);
        }
    }

    /**
     * Get fraud prevention summary
     */
    getFraudPreventionSummary() {
        const now = Date.now();
        
        return {
            hourlyClicks: this.clickTracking.hourlyClicks.filter(
                click => click.timestamp > now - (60 * 60 * 1000)
            ).length,
            dailyClicks: this.clickTracking.dailyClicks.filter(
                click => click.timestamp > now - (24 * 60 * 60 * 1000)
            ).length,
            sessionClicks: this.clickTracking.sessionClicks,
            lastClickTime: this.clickTracking.lastClickTime,
            timeSinceLastClick: now - this.clickTracking.lastClickTime,
            landingPageVisits: this.clickTracking.landingPageVisits.length,
            limits: {
                maxClicksPerHour: this.fraudPreventionConfig.maxClicksPerHour,
                maxClicksPerDay: this.fraudPreventionConfig.maxClicksPerDay,
                maxClicksPerSession: this.fraudPreventionConfig.maxClicksPerSession,
                minClickInterval: this.fraudPreventionConfig.minClickInterval
            }
        };
    }
}

// Export for use in other modules with enhanced stealth protection
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContentAnalyzer;
} else if (typeof window !== 'undefined' && !window.ContentAnalyzer) {
    window.ContentAnalyzer = ContentAnalyzer;
}
