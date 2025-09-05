/**
 * AdSense Detector - Enhanced Deteksi dan analisis AdSense ads
 * ENHANCED VERSION with comprehensive fixes and improvements
 */

class AdSenseDetector {
    constructor() {
        // Enhanced configuration
        this.config = {
            // Performance optimization
            enableCaching: true,
            cacheTimeout: 300000, // 5 minutes
            maxCacheSize: 100,
            enablePerformanceOptimization: true,
            
            // Ad detection settings
            maxAdsPerPage: 50,
            enableSmartDetection: true,
            enableRegionalOptimization: true,
            enableFraudDetection: true,
            
            // Quality scoring
            enableQualityScoring: true,
            minQualityScore: 0.3,
            enablePositionAnalysis: true,
            
            // Memory management
            cleanupInterval: 30000, // 30 seconds
            maxDetectedAds: 100,
            
            // Related ads configuration
            minRelevanceScore: 1.0,
            maxRelatedAds: 5,
            enableContentMatching: true,
            enablePositionScoring: true
        };

        // Performance optimization: caching system
        this.adCache = new Map();
        this.selectorCache = new Map();
        this.qualityCache = new Map();
        this.lastCleanup = Date.now();
        
        // Enhanced regional detection
        this.userRegion = this.detectUserRegionEnhanced();
        
        // Enhanced ad selectors with priority and categories
        this.adSelectors = {
            // High priority selectors (definitely ads)
            high: [
                { selector: 'ins.adsbygoogle', priority: 1, type: 'adsense', confidence: 0.95 },
                { selector: 'div[id*="google_ads"]', priority: 1, type: 'adsense', confidence: 0.95 },
                { selector: 'div[id*="div-gpt-ad"]', priority: 1, type: 'adsense', confidence: 0.95 },
                { selector: 'div[class*="adsbygoogle"]', priority: 1, type: 'adsense', confidence: 0.95 },
                { selector: 'div[data-ad-client]', priority: 1, type: 'adsense', confidence: 0.95 },
                { selector: 'div[data-ad-slot]', priority: 1, type: 'adsense', confidence: 0.95 }
            ],
            
            // Medium priority selectors (likely ads)
            medium: [
                { selector: 'div[class*="google-ad"]', priority: 2, type: 'adsense', confidence: 0.8 },
                { selector: 'div[class*="advertisement"]', priority: 2, type: 'ad', confidence: 0.8 },
                { selector: 'div[class*="ad-container"]', priority: 2, type: 'ad', confidence: 0.8 },
                { selector: 'div[class*="ad-wrapper"]', priority: 2, type: 'ad', confidence: 0.8 },
                { selector: 'div[class*="ad-unit"]', priority: 2, type: 'ad', confidence: 0.8 },
                { selector: 'div[data-ad-format]', priority: 2, type: 'adsense', confidence: 0.8 }
            ],
            
            // Low priority selectors (possible ads)
            low: [
                { selector: 'div[id*="ad-"]', priority: 3, type: 'ad', confidence: 0.6 },
                { selector: 'div[class*="ad-"]', priority: 3, type: 'ad', confidence: 0.6 },
                { selector: 'div[id*="ads-"]', priority: 3, type: 'ad', confidence: 0.6 },
                { selector: 'div[class*="ads-"]', priority: 3, type: 'ad', confidence: 0.6 },
                { selector: 'div[class*="inline-ad"]', priority: 3, type: 'ad', confidence: 0.6 },
                { selector: 'div[class*="content-ad"]', priority: 3, type: 'ad', confidence: 0.6 },
                { selector: 'div[class*="sidebar-ad"]', priority: 3, type: 'ad', confidence: 0.6 },
                { selector: 'div[class*="header-ad"]', priority: 3, type: 'ad', confidence: 0.6 },
                { selector: 'div[class*="footer-ad"]', priority: 3, type: 'ad', confidence: 0.6 }
            ]
        };
        
        // Enhanced ad keywords with regional optimization
        this.adKeywords = this.getEnhancedAdKeywords();
        
        // Ad detection state
        this.detectedAds = [];
        this.adDetectionHistory = [];
        this.qualityScores = new Map();
        
        // Performance metrics
        this.performanceMetrics = {
            totalDetections: 0,
            cacheHits: 0,
            cacheMisses: 0,
            averageDetectionTime: 0,
            lastDetectionTime: 0,
            totalAdsFound: 0,
            highQualityAds: 0,
            mediumQualityAds: 0,
            lowQualityAds: 0
        };
        
        // Fraud detection patterns
        this.fraudPatterns = [
            { pattern: /click\s+here/i, score: -0.3, type: 'suspicious_text' },
            { pattern: /free\s+download/i, score: -0.4, type: 'suspicious_text' },
            { pattern: /earn\s+money/i, score: -0.3, type: 'suspicious_text' },
            { pattern: /make\s+money/i, score: -0.3, type: 'suspicious_text' },
            { pattern: /work\s+from\s+home/i, score: -0.4, type: 'suspicious_text' },
            { pattern: /get\s+rich/i, score: -0.5, type: 'suspicious_text' },
            { pattern: /quick\s+cash/i, score: -0.5, type: 'suspicious_text' },
            { pattern: /instant\s+money/i, score: -0.5, type: 'suspicious_text' }
        ];
        
        // Missing properties for compatibility
        this.sessionData = {
            id: 'adsense_detector',
            startTime: Date.now(),
            postsRead: 0,
            adClicks: 0,
            status: 'active'
        };
        
        this.clickHistory = [];
        
        // Start automatic cleanup
        this.startAutoCleanup();
        
        console.log('🚀 Enhanced AdSense Detector initialized with config:', this.config);
    }

    // Enhanced regional detection
    detectUserRegionEnhanced() {
        try {
        // Try to detect user region from various sources
        const language = navigator.language || navigator.userLanguage;
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            const locale = navigator.languages ? navigator.languages[0] : language;
        
            console.log('🌍 Enhanced region detection:', { language, timezone, locale });
        
            // Check for Indonesian indicators with higher priority
        if (language.includes('id') || language.includes('ID') || 
            timezone.includes('Asia/Jakarta') || timezone.includes('Asia/Makassar') ||
                timezone.includes('Asia/Jayapura') || locale.includes('id')) {
            console.log('🇮🇩 Detected Indonesia region');
            return 'ID';
        }
        
        // Check for US indicators
        if (language.includes('en-US') || timezone.includes('America/') ||
            timezone.includes('US/') || timezone.includes('EST') || 
            timezone.includes('CST') || timezone.includes('MST') || 
                timezone.includes('PST') || locale.includes('en-US')) {
            console.log('🇺🇸 Detected US region');
            return 'US';
        }
            
            // Check for other regions
            if (timezone.includes('Europe/')) {
                console.log('🇪🇺 Detected European region');
                return 'EU';
            }
            
            if (timezone.includes('Asia/')) {
                console.log('🌏 Detected Asian region');
                return 'ASIA';
        }
        
        // Default to global
        console.log('🌐 Using global region (default)');
        return 'GLOBAL';
        } catch (error) {
            console.warn('Error detecting region, defaulting to global:', error);
            return 'GLOBAL';
        }
    }

    // Enhanced ad keywords with regional optimization
    getEnhancedAdKeywords() {
        const baseKeywords = [
            // Finance & Investment (High CPC - Global)
            'finance', 'business', 'investment', 'money', 'credit', 'loan', 'insurance',
            'mortgage', 'banking', 'trading', 'forex', 'crypto', 'bitcoin', 'stock',
            'real estate', 'property', 'wealth', 'financial', 'economic'
        ];

        const regionalKeywords = {
            ID: [
            // Indonesia High CPC Keywords
            'kredit', 'pinjaman', 'investasi', 'keuangan', 'bisnis', 'asuransi', 'bank',
            'tabungan', 'deposito', 'reksadana', 'saham', 'obligasi', 'forex', 'trading',
            'properti', 'rumah', 'mobil', 'motor', 'bpkb', 'leasing', 'gadai', 'kartu kredit',
            'paylater', 'fintech', 'p2p lending', 'crowdfunding', 'crypto', 'bitcoin',
            'emoney', 'dana', 'ovo', 'gopay', 'shopeepay', 'linkaja', 'doku',
            
            // E-commerce Indonesia
            'tokopedia', 'shopee', 'lazada', 'bukalapak', 'blibli', 'jd.id',
            
            // Travel Indonesia
                'bali', 'jakarta', 'surabaya', 'yogyakarta', 'bandung', 'medan', 'semarang',
                'makassar', 'palembang', 'manado', 'denpasar', 'batam', 'lombok',
                
                // Health & Beauty Indonesia
                'kecantikan', 'kesehatan', 'obat', 'vitamin', 'supplement', 'kosmetik',
                'skincare', 'makeup', 'perawatan', 'dokter', 'rumah sakit', 'klinik'
            ],
            
            US: [
                // US High CPC Keywords
                'mortgage', 'insurance', 'loans', 'credit cards', 'investment', 'real estate',
                'health insurance', 'car insurance', 'life insurance', 'home insurance',
                'personal loans', 'business loans', 'student loans', 'payday loans',
                'credit repair', 'debt consolidation', 'bankruptcy', 'foreclosure',
                'refinance', 'home equity', 'reverse mortgage', 'annuities', '401k',
                'ira', 'mutual funds', 'etfs', 'options trading', 'futures trading',
                
                // US E-commerce
                'amazon', 'ebay', 'walmart', 'target', 'best buy', 'home depot',
                
                // US Travel
                'new york', 'los angeles', 'chicago', 'houston', 'phoenix', 'philadelphia',
                'san antonio', 'san diego', 'dallas', 'san jose', 'austin', 'jacksonville',
                'fort worth', 'columbus', 'charlotte', 'san francisco', 'indianapolis',
                'seattle', 'denver', 'washington dc', 'boston', 'nashville', 'detroit'
            ],
            
            EU: [
                // European High CPC Keywords
                'mortgage', 'insurance', 'loans', 'investment', 'real estate', 'banking',
                'credit cards', 'personal finance', 'wealth management', 'pension',
                'retirement planning', 'tax planning', 'estate planning', 'inheritance',
                'property investment', 'stock market', 'bonds', 'mutual funds', 'etfs'
            ],
            
            ASIA: [
                // Asian High CPC Keywords
                'investment', 'trading', 'forex', 'crypto', 'bitcoin', 'real estate',
                'property', 'insurance', 'banking', 'finance', 'wealth management',
                'stock market', 'mutual funds', 'bonds', 'commodities', 'gold', 'silver'
            ],
            
            GLOBAL: [
                // Global High CPC Keywords
                'finance', 'investment', 'trading', 'crypto', 'bitcoin', 'real estate',
                'insurance', 'loans', 'credit cards', 'mortgage', 'forex', 'stock market',
                'mutual funds', 'etfs', 'bonds', 'commodities', 'gold', 'silver',
                'wealth management', 'financial planning', 'retirement planning'
            ]
        };

        // Combine base keywords with regional keywords
        const allKeywords = [...baseKeywords, ...(regionalKeywords[this.userRegion] || regionalKeywords.GLOBAL)];
        
        // Remove duplicates and sort by relevance
        const uniqueKeywords = [...new Set(allKeywords)];
        
        console.log(`🌍 Enhanced keywords loaded for region ${this.userRegion}:`, uniqueKeywords.length);
        return uniqueKeywords;
    }

    // Enhanced ad detection with caching
    detectAdsEnhanced() {
        const cacheKey = `ads_${window.location.href}`;
        
        if (this.config.enableCaching && this.adCache.has(cacheKey)) {
            const cached = this.adCache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.config.cacheTimeout) {
                this.performanceMetrics.cacheHits++;
                console.log('📋 Using cached ad detection results');
                return cached.ads;
            }
        }

        this.performanceMetrics.cacheMisses++;
        const startTime = Date.now();

        console.log('🔍 Starting enhanced ad detection...');
        
        const detectedAds = [];
        const allSelectors = [
            ...this.adSelectors.high,
            ...this.adSelectors.medium,
            ...this.adSelectors.low
        ];

        // Sort selectors by priority
        const sortedSelectors = allSelectors.sort((a, b) => a.priority - b.priority);

        for (const selectorObj of sortedSelectors) {
            try {
                const elements = document.querySelectorAll(selectorObj.selector);
                
                if (elements.length > 0) {
                    for (const element of elements) {
                        if (this.isValidAdElement(element, selectorObj)) {
                            const adInfo = this.analyzeAdElement(element, selectorObj);
                            
                            if (adInfo && adInfo.finalScore >= this.config.minQualityScore) {
                                detectedAds.push(adInfo);
                                
                                // Stop if we've reached the maximum
                                if (detectedAds.length >= this.config.maxAdsPerPage) {
                                    break;
                                }
                            }
                        }
                    }
                }
                
                // If we found high priority ads, we can stop early
                if (selectorObj.priority === 1 && detectedAds.length > 0) {
                    break;
                }
            } catch (error) {
                console.warn(`Invalid selector: ${selectorObj.selector}`, error);
            }
        }

        // Cache the result
        if (this.config.enableCaching) {
            this.adCache.set(cacheKey, {
                ads: detectedAds,
                timestamp: Date.now()
            });
        }

        // Update performance metrics
        const detectionTime = Date.now() - startTime;
        this.performanceMetrics.totalDetections++;
        this.performanceMetrics.lastDetectionTime = detectionTime;
        this.performanceMetrics.averageDetectionTime = 
            (this.performanceMetrics.averageDetectionTime * (this.performanceMetrics.totalDetections - 1) + detectionTime) / 
            this.performanceMetrics.totalDetections;
        
        this.performanceMetrics.totalAdsFound += detectedAds.length;
        
        // Update quality metrics
        detectedAds.forEach(ad => {
            if (ad.finalScore >= 0.8) this.performanceMetrics.highQualityAds++;
            else if (ad.finalScore >= 0.5) this.performanceMetrics.mediumQualityAds++;
            else this.performanceMetrics.lowQualityAds++;
        });

        // Store detection history
        this.adDetectionHistory.push({
            timestamp: Date.now(),
            url: window.location.href,
            adsFound: detectedAds.length,
            detectionTime: detectionTime,
            qualityDistribution: {
                high: detectedAds.filter(ad => ad.finalScore >= 0.8).length,
                medium: detectedAds.filter(ad => ad.finalScore >= 0.5 && ad.finalScore < 0.8).length,
                low: detectedAds.filter(ad => ad.finalScore < 0.5).length
            }
        });

        console.log(`✅ Enhanced ad detection completed: ${detectedAds.length} ads found in ${detectionTime}ms`);
        return detectedAds;
    }

    // Enhanced ad element validation
    isValidAdElement(element, selectorObj) {
        if (!element || !element.tagName) return false;

        try {
            // Check if element is visible
            const rect = element.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return false;
            
            // Check if element is in viewport
            if (rect.top < 0 || rect.left < 0 || 
                rect.bottom > window.innerHeight || 
                rect.right > window.innerWidth) return false;
            
            // Check if element is not a TOC element
            if (this.isTOCElement(element)) return false;
            
            // Check if element is not already detected
            if (this.detectedAds.some(ad => ad.element === element)) return false;
            
            // Check if element has valid dimensions
            if (rect.width < 50 || rect.height < 50) return false;
            
            return true;
        } catch (error) {
            console.warn('Error validating ad element:', error);
            return false;
        }
    }

    // Enhanced ad analysis
    analyzeAdElement(element, selectorObj) {
        try {
            const rect = element.getBoundingClientRect();
            const computedStyle = window.getComputedStyle(element);
            
            // Basic ad information
            const adInfo = {
                element: element,
                selector: selectorObj.selector,
                type: selectorObj.type,
                priority: selectorObj.priority,
                confidence: selectorObj.confidence,
                position: {
                    x: rect.left,
                    y: rect.top,
                    width: rect.width,
                    height: rect.height
                },
                isVisible: rect.width > 0 && rect.height > 0,
                timestamp: Date.now()
            };
            
            // Enhanced quality scoring
            adInfo.qualityScore = this.calculateAdQualityScore(adInfo, element, computedStyle);
            
            // Regional optimization
            adInfo.regionalScore = this.calculateRegionalScore(adInfo);
            
            // Fraud detection
            adInfo.fraudScore = this.calculateFraudScore(element);
            
            // Final quality score (combine all factors)
            adInfo.finalScore = this.calculateFinalScore(adInfo);
            
            // Ad content analysis
            adInfo.content = this.analyzeAdContent(element);
            
            // Performance metrics
            adInfo.performance = this.analyzeAdPerformance(element);
            
            return adInfo;
        } catch (error) {
            console.warn('Error analyzing ad element:', error);
            return null;
        }
    }

    // Enhanced quality scoring
    calculateAdQualityScore(adInfo, element, computedStyle) {
        let score = 0.5; // Base score
        
        try {
            // Position-based scoring
            if (this.config.enablePositionAnalysis) {
                const viewportHeight = window.innerHeight;
                const viewportWidth = window.innerWidth;
                
                // Above the fold (top 50% of viewport)
                if (adInfo.position.y < viewportHeight * 0.5) {
                    score += 0.2;
                }
                
                // Center of page (horizontal)
                if (adInfo.position.x > viewportWidth * 0.2 && 
                    adInfo.position.x < viewportWidth * 0.8) {
                    score += 0.1;
                }
                
                // Good size (not too small, not too large)
                if (adInfo.position.width >= 300 && adInfo.position.width <= 728 &&
                    adInfo.position.height >= 250 && adInfo.position.height <= 600) {
                    score += 0.15;
                }
            }
            
            // Content-based scoring
            const textContent = element.textContent || '';
            const hasText = textContent.trim().length > 0;
            const hasImages = element.querySelectorAll('img').length > 0;
            
            if (hasText && hasImages) score += 0.1;
            else if (hasText || hasImages) score += 0.05;
            
            // Selector confidence
            score += (adInfo.confidence - 0.5) * 0.2;
            
            // Priority-based scoring
            score += (4 - adInfo.priority) * 0.05;
            
            // Normalize score to 0-1 range
            score = Math.max(0, Math.min(1, score));
            
        } catch (error) {
            console.warn('Error calculating quality score:', error);
        }

        return score;
    }

    // Regional scoring
    calculateRegionalScore(adInfo) {
        if (!this.config.enableRegionalOptimization) return 0.5;
        
        try {
            let score = 0.5;
            
            // Check if ad content matches regional keywords
            const textContent = (adInfo.element.textContent || '').toLowerCase();
            const regionalKeywords = this.getEnhancedAdKeywords();
            
            const keywordMatches = regionalKeywords.filter(keyword => 
                textContent.includes(keyword.toLowerCase())
            ).length;
            
            if (keywordMatches > 0) {
                score += Math.min(0.3, keywordMatches * 0.1);
            }
            
            // Regional preference adjustments
            if (this.userRegion === 'ID') {
                // Indonesia prefers local content
                if (textContent.includes('indonesia') || textContent.includes('indonesia')) {
                    score += 0.1;
                }
            } else if (this.userRegion === 'US') {
                // US prefers English content
                if (textContent.includes('united states') || textContent.includes('america')) {
                    score += 0.1;
                }
            }
            
            return Math.max(0, Math.min(1, score));
        } catch (error) {
            console.warn('Error calculating regional score:', error);
            return 0.5;
        }
    }

    // Fraud detection scoring
    calculateFraudScore(element) {
        if (!this.config.enableFraudDetection) return 0;
        
        try {
            let score = 0;
            const textContent = (element.textContent || '').toLowerCase();
            
            // Check for suspicious patterns
            for (const pattern of this.fraudPatterns) {
                if (pattern.pattern.test(textContent)) {
                    score += Math.abs(pattern.score);
                    console.log(`🚨 Fraud pattern detected: ${pattern.type}`, pattern.pattern);
                }
            }
            
            // Check for excessive exclamation marks
            const exclamationCount = (textContent.match(/!/g) || []).length;
            if (exclamationCount > 3) {
                score += 0.2;
            }
            
            // Check for all caps text
            const capsRatio = (textContent.match(/[A-Z]/g) || []).length / 
                             (textContent.match(/[a-zA-Z]/g) || []).length;
            if (capsRatio > 0.7) {
                score += 0.1;
            }
            
            return Math.min(1, score);
        } catch (error) {
            console.warn('Error calculating fraud score:', error);
            return 0;
        }
    }

    // Final score calculation
    calculateFinalScore(adInfo) {
        try {
            let finalScore = adInfo.qualityScore * 0.4; // 40% weight
            finalScore += adInfo.regionalScore * 0.3;   // 30% weight
            finalScore += (1 - adInfo.fraudScore) * 0.3; // 30% weight (inverse fraud)
            
            // Normalize to 0-1 range
            finalScore = Math.max(0, Math.min(1, finalScore));
            
            return finalScore;
        } catch (error) {
            console.warn('Error calculating final score:', error);
            return adInfo.qualityScore;
        }
    }

    // Ad content analysis
    analyzeAdContent(element) {
        try {
            const textContent = element.textContent || '';
            const images = element.querySelectorAll('img');
            const links = element.querySelectorAll('a');
        
        return {
                textLength: textContent.length,
                wordCount: textContent.split(/\s+/).length,
                imageCount: images.length,
                linkCount: links.length,
                hasText: textContent.trim().length > 0,
                hasImages: images.length > 0,
                hasLinks: links.length > 0,
                textPreview: textContent.substring(0, 100) + (textContent.length > 100 ? '...' : '')
            };
        } catch (error) {
            console.warn('Error analyzing ad content:', error);
            return {};
        }
    }

    // Ad performance analysis
    analyzeAdPerformance(element) {
        try {
        const rect = element.getBoundingClientRect();
            const viewportArea = window.innerWidth * window.innerHeight;
            const adArea = rect.width * rect.height;
        
        return {
                viewportCoverage: adArea / viewportArea,
                aspectRatio: rect.width / rect.height,
                isAboveFold: rect.top < window.innerHeight * 0.5,
                isCentered: Math.abs(rect.left + rect.width/2 - window.innerWidth/2) < 100,
                sizeCategory: this.getSizeCategory(rect.width, rect.height)
            };
        } catch (error) {
            console.warn('Error analyzing ad performance:', error);
            return {};
        }
    }

    // Size categorization
    getSizeCategory(width, height) {
        if (width >= 728 && height >= 90) return 'leaderboard';
        if (width >= 300 && height >= 250) return 'medium_rectangle';
        if (width >= 320 && height >= 50) return 'mobile_banner';
        if (width >= 468 && height >= 60) return 'banner';
        if (width >= 120 && height >= 600) return 'skyscraper';
        if (width >= 160 && height >= 600) return 'wide_skyscraper';
        if (width >= 300 && height >= 600) return 'half_page';
        if (width >= 970 && height >= 90) return 'large_leaderboard';
        if (width >= 970 && height >= 250) return 'billboard';
        if (width >= 250 && height >= 250) return 'square';
        return 'custom';
    }

    // Enhanced TOC detection
    isTOCElement(element) {
        if (!element) return false;

        try {
            const elementText = (element.textContent || '').toLowerCase().trim();
            const elementClass = (element.className || '').toLowerCase();
            const elementId = (element.id || '').toLowerCase();
            const elementTag = element.tagName.toLowerCase();

            // Enhanced TOC text patterns
            const tocTextPatterns = [
                'table of contents', 'table of content', 'contents', 'content', 'toc',
                'index', 'menu', 'navigation', 'nav', 'outline', 'summary', 'overview',
                'list of', 'chapter', 'section', 'part', 'directory', 'guide',
                'quick start', 'getting started', 'tutorial', 'how to', 'steps',
                'prologue', 'epilogue', 'appendix', 'bibliography', 'references'
            ];

            for (const pattern of tocTextPatterns) {
                if (elementText.includes(pattern)) {
                    console.log('🚫 TOC element detected by text:', pattern, element);
                    return true;
                }
            }

            // Enhanced TOC class/ID patterns
            const tocClassPatterns = [
                'toc', 'table-of-contents', 'contents', 'index', 'menu', 'nav',
                'navigation', 'outline', 'summary', 'sidebar', 'sidebar-menu',
                'breadcrumb', 'breadcrumbs', 'pagination', 'page-nav', 'page-navigation'
            ];

            for (const pattern of tocClassPatterns) {
                if (elementClass.includes(pattern) || elementId.includes(pattern)) {
                    console.log('🚫 TOC element detected by class/id:', pattern, element);
                    return true;
                }
            }

            // Enhanced TOC container detection
            const tocContainerSelectors = [
                '.toc', '.table-of-contents', '.contents', '.index', '.menu',
                '.nav', '.navigation', '.outline', '.summary', '.sidebar',
                '.sidebar-menu', '.breadcrumb', '.breadcrumbs', '.pagination',
                '.page-nav', '.page-navigation', '#toc', '#table-of-contents',
                '#contents', '#index', '#menu', '#nav', '#navigation', '#outline',
                '#summary', '#sidebar', '#sidebar-menu', '#breadcrumb', '#breadcrumbs'
            ];

            for (const selector of tocContainerSelectors) {
                if (element.closest(selector)) {
                    console.log('🚫 TOC element detected: Inside TOC container', selector, element);
                    return true;
                }
            }

            // Check for list-like structures that might be TOC
            if (elementTag === 'ul' || elementTag === 'ol') {
                const listItems = element.querySelectorAll('li');
                if (listItems.length > 3) {
                    const hasLinks = Array.from(listItems).some(li => li.querySelector('a'));
                    if (hasLinks) {
                        console.log('🚫 TOC element detected: List with links', element);
                return true;
                    }
                }
            }

            return false;

        } catch (error) {
            console.warn('Error checking TOC element:', error);
            return false;
        }
    }

    // Memory management
    startAutoCleanup() {
        setInterval(() => {
            this.cleanupMemory();
        }, this.config.cleanupInterval);
    }

    cleanupMemory() {
        const now = Date.now();
        const cutoffTime = now - this.config.cacheTimeout;

        // Cleanup ad cache
        for (const [key, value] of this.adCache.entries()) {
            if (value.timestamp < cutoffTime) {
                this.adCache.delete(key);
            }
        }

        // Cleanup selector cache
        for (const [key, value] of this.selectorCache.entries()) {
            if (value.timestamp < cutoffTime) {
                this.selectorCache.delete(key);
            }
        }

        // Cleanup quality cache
        for (const [key, value] of this.qualityCache.entries()) {
            if (value.timestamp < cutoffTime) {
                this.qualityCache.delete(key);
            }
        }

        // Limit detected ads
        if (this.detectedAds.length > this.config.maxDetectedAds) {
            this.detectedAds = this.detectedAds.slice(-this.config.maxDetectedAds);
        }

        // Limit detection history
        if (this.adDetectionHistory.length > 100) {
            this.adDetectionHistory = this.adDetectionHistory.slice(-100);
        }

        this.lastCleanup = now;
        console.log('🧹 AdSense Detector memory cleanup completed');
    }

    // Find related ads based on content
    findRelatedAds(content) {
        try {
            if (!content || !content.text) {
                console.warn('No content provided to findRelatedAds');
                return [];
            }

            const relatedAds = [];
            const contentText = content.text.toLowerCase();
            const contentTopics = this.extractContentTopics(contentText);
            
            console.log('🔍 Finding related ads for content topics:', contentTopics);

            // Filter ads based on content relevance
            for (const ad of this.detectedAds) {
                if (!ad || !ad.element) continue;

                const adRelevance = this.calculateAdRelevance(ad, contentTopics, contentText);
                
                if (adRelevance.score > this.config.minRelevanceScore) {
                    relatedAds.push({
                        ...ad,
                        relevance: adRelevance,
                        contentMatch: adRelevance.matchedTopics
                    });
                }
            }

            // Sort by relevance score (highest first)
            relatedAds.sort((a, b) => b.relevance.score - a.relevance.score);

            // Limit results
            const maxRelatedAds = Math.min(relatedAds.length, this.config.maxRelatedAds);
            const finalRelatedAds = relatedAds.slice(0, maxRelatedAds);

            console.log(`🎯 Found ${finalRelatedAds.length} related ads out of ${this.detectedAds.length} total ads`);
            
            return finalRelatedAds;

        } catch (error) {
            console.error('Error finding related ads:', error);
            return [];
        }
    }

    // Calculate ad relevance based on content
    calculateAdRelevance(ad, contentTopics, contentText) {
        try {
            let score = 0;
            const matchedTopics = [];
            
            // Check ad text content
            const adText = this.extractAdText(ad);
            if (adText) {
                const adTextLower = adText.toLowerCase();
                
                // Topic matching
                for (const topic of contentTopics) {
                    if (adTextLower.includes(topic.toLowerCase())) {
                        score += 2; // High score for topic match
                        matchedTopics.push(topic);
                    }
                }
                
                // Keyword matching
                const adKeywords = this.extractKeywords(adText);
                for (const keyword of adKeywords) {
                    if (contentText.includes(keyword.toLowerCase())) {
                        score += 1; // Medium score for keyword match
                    }
                }
            }

            // Check ad image alt text
            const adImageAlt = this.extractAdImageAlt(ad);
            if (adImageAlt) {
                const altTextLower = adImageAlt.toLowerCase();
                for (const topic of contentTopics) {
                    if (altTextLower.includes(topic.toLowerCase())) {
                        score += 1.5; // High score for image alt match
                        if (!matchedTopics.includes(topic)) {
                            matchedTopics.push(topic);
                        }
                    }
                }
            }

            // Check ad position relevance
            const positionScore = this.calculatePositionRelevance(ad);
            score += positionScore;

            // Check ad quality
            const qualityScore = ad.finalScore || 0;
            score += qualityScore * 0.5; // Quality contributes to relevance

            return {
                score: Math.max(0, score),
                matchedTopics: matchedTopics,
                positionScore: positionScore,
                qualityScore: qualityScore
            };

        } catch (error) {
            console.error('Error calculating ad relevance:', error);
            return { score: 0, matchedTopics: [], positionScore: 0, qualityScore: 0 };
        }
    }

    // Extract content topics from text
    extractContentTopics(text) {
        try {
            const topics = [];
            const words = text.split(/\s+/);
            const wordFreq = {};
            
            // Count word frequency
            for (const word of words) {
                const cleanWord = word.replace(/[^\w]/g, '').toLowerCase();
                if (cleanWord.length > 3) { // Only words longer than 3 characters
                    wordFreq[cleanWord] = (wordFreq[cleanWord] || 0) + 1;
                }
            }
            
            // Get top topics by frequency
            const sortedWords = Object.entries(wordFreq)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 10); // Top 10 topics
            
            for (const [word, freq] of sortedWords) {
                if (freq > 2) { // Only words that appear more than twice
                    topics.push(word);
                }
            }
            
            return topics;

        } catch (error) {
            console.error('Error extracting content topics:', error);
            return [];
        }
    }

    // Extract ad text content
    extractAdText(ad) {
        try {
            if (!ad.element) return '';
            
            // Try to get text from various ad elements
            const textSelectors = [
                '.adsbygoogle',
                '.advertisement',
                '.ad-content',
                '.ad-text',
                'ins',
                'iframe[title*="ad"]',
                'iframe[title*="Ad"]'
            ];
            
            for (const selector of textSelectors) {
                const element = ad.element.querySelector(selector);
                if (element && element.textContent) {
                    return element.textContent.trim();
                }
            }
            
            // Fallback to element text content
            return ad.element.textContent ? ad.element.textContent.trim() : '';

        } catch (error) {
            console.error('Error extracting ad text:', error);
            return '';
        }
    }

    // Extract ad image alt text
    extractAdImageAlt(ad) {
        try {
            if (!ad.element) return '';
            
            const img = ad.element.querySelector('img');
            return img ? (img.alt || '') : '';

        } catch (error) {
            console.error('Error extracting ad image alt:', error);
            return '';
        }
    }

    // Extract keywords from text
    extractKeywords(text) {
        try {
            if (!text) return [];
            
            const words = text.split(/\s+/);
            const keywords = [];
            
            for (const word of words) {
                const cleanWord = word.replace(/[^\w]/g, '').toLowerCase();
                if (cleanWord.length > 4 && cleanWord.length < 15) { // Reasonable keyword length
                    keywords.push(cleanWord);
                }
            }
            
            return keywords.slice(0, 20); // Limit to 20 keywords

        } catch (error) {
            console.error('Error extracting keywords:', error);
            return [];
        }
    }

    // Calculate position relevance
    calculatePositionRelevance(ad) {
        try {
            if (!ad.element) return 0;
            
            const rect = ad.element.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const viewportWidth = window.innerWidth;
            
            // Check if ad is in viewport
            if (rect.top < 0 || rect.left < 0 || 
                rect.bottom > viewportHeight || rect.right > viewportWidth) {
                return -1; // Penalty for off-screen ads
            }
            
            // Prefer ads in content area (middle of page)
            const pageHeight = document.documentElement.scrollHeight;
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const adCenterY = rect.top + rect.height / 2;
            const pageCenterY = scrollTop + viewportHeight / 2;
            
            const distanceFromCenter = Math.abs(adCenterY - pageCenterY);
            const maxDistance = pageHeight / 2;
            
            // Score based on distance from center (closer = higher score)
            return Math.max(0, 2 - (distanceFromCenter / maxDistance) * 2);

        } catch (error) {
            console.error('Error calculating position relevance:', error);
            return 0;
        }
    }

    // Performance monitoring
    getPerformanceMetrics() {
        return {
            totalDetections: this.performanceMetrics.totalDetections,
            cacheHits: this.performanceMetrics.cacheHits,
            cacheMisses: this.performanceMetrics.cacheMisses,
            cacheHitRate: this.performanceMetrics.totalDetections > 0 ? 
                this.performanceMetrics.cacheHits / this.performanceMetrics.totalDetections : 0,
            averageDetectionTime: this.performanceMetrics.averageDetectionTime,
            lastDetectionTime: this.performanceMetrics.lastDetectionTime,
            totalAdsFound: this.performanceMetrics.totalAdsFound,
            qualityDistribution: {
                high: this.performanceMetrics.highQualityAds,
                medium: this.performanceMetrics.mediumQualityAds,
                low: this.performanceMetrics.lowQualityAds
            }
        };
    }

    getDetectionStats() {
        return {
            currentAds: this.detectedAds.length,
            detectionHistory: this.adDetectionHistory.length,
            lastDetection: this.adDetectionHistory[this.adDetectionHistory.length - 1],
            qualityScores: Array.from(this.qualityScores.values()),
            regionalOptimization: this.userRegion
        };
    }

    // Configuration management
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        console.log('⚙️ AdSense Detector config updated:', this.config);
    }

    getConfig() {
        return { ...this.config };
    }

    // Cache management
    clearCache() {
        this.adCache.clear();
        this.selectorCache.clear();
        this.qualityCache.clear();
        console.log('🧹 All AdSense Detector caches cleared');
    }

    getCacheStats() {
        return {
            adCacheSize: this.adCache.size,
            selectorCacheSize: this.selectorCache.size,
            qualityCacheSize: this.qualityCache.size,
            lastCleanup: this.lastCleanup
        };
    }

    // Legacy method compatibility
    detectAds() {
        return this.detectAdsEnhanced();
    }

    getHighValueKeywords() {
        return this.getEnhancedAdKeywords();
    }
}
