/**
 * AdSense Detector - Deteksi dan analisis AdSense ads
 */

class AdSenseDetector {
    constructor() {
        this.adSelectors = [
            // Standard AdSense selectors
            'ins.adsbygoogle',
            'div[id*="google_ads"]',
            'div[id*="div-gpt-ad"]',
            'div[class*="adsbygoogle"]',
            'div[class*="google-ad"]',
            'div[class*="advertisement"]',
            'div[class*="ad-container"]',
            'div[class*="ad-wrapper"]',
            'div[class*="ad-unit"]',
            'div[class*="advertisement"]',
            
            // Common ad container patterns
            'div[id*="ad-"]',
            'div[class*="ad-"]',
            'div[id*="ads-"]',
            'div[class*="ads-"]',
            
            // Responsive ad patterns
            'div[data-ad-client]',
            'div[data-ad-slot]',
            'div[data-ad-format]',
            
            // Inline ad patterns
            'div[class*="inline-ad"]',
            'div[class*="content-ad"]',
            'div[class*="sidebar-ad"]',
            'div[class*="header-ad"]',
            'div[class*="footer-ad"]'
        ];
        
        this.adKeywords = [
            'advertisement',
            'sponsored',
            'ad',
            'ads',
            'google ads',
            'adsense',
            'sponsor'
        ];
        
        this.detectedAds = [];
    }

    detectAds() {
        console.log('🔍 Detecting AdSense ads...');
        
        this.detectedAds = [];
        
        // Method 1: Direct selector matching
        this.detectBySelectors();
        
        // Method 2: Content analysis
        this.detectByContent();
        
        // Method 3: URL pattern matching
        this.detectByUrlPatterns();
        
        // Method 4: Script detection
        this.detectByScripts();
        
        console.log(`✅ Detected ${this.detectedAds.length} potential AdSense ads`);
        
        return this.detectedAds;
    }

    detectBySelectors() {
        this.adSelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    if (this.isValidAdElement(element)) {
                        this.addDetectedAd(element, 'selector');
                    }
                });
            } catch (error) {
                // Ignore invalid selectors
            }
        });
    }

    detectByContent() {
        // Look for elements with ad-related text
        const allElements = document.querySelectorAll('div, span, a, ins');
        
        allElements.forEach(element => {
            const text = element.textContent.toLowerCase();
            const className = element.className.toLowerCase();
            const id = element.id.toLowerCase();
            
            // Check if element contains ad keywords
            const hasAdKeywords = this.adKeywords.some(keyword => 
                text.includes(keyword) || className.includes(keyword) || id.includes(keyword)
            );
            
            if (hasAdKeywords && this.isValidAdElement(element)) {
                this.addDetectedAd(element, 'content');
            }
        });
    }

    detectByUrlPatterns() {
        // Look for iframes with ad URLs
        const iframes = document.querySelectorAll('iframe');
        
        iframes.forEach(iframe => {
            const src = iframe.src || '';
            
            if (this.isAdUrl(src) && this.isValidAdElement(iframe)) {
                this.addDetectedAd(iframe, 'url');
            }
        });
    }

    detectByScripts() {
        // Look for AdSense scripts
        const scripts = document.querySelectorAll('script');
        
        scripts.forEach(script => {
            const content = script.textContent || script.src || '';
            
            if (this.isAdSenseScript(content)) {
                // Find associated ad elements
                const adElements = this.findAdElementsNearScript(script);
                adElements.forEach(element => {
                    if (this.isValidAdElement(element)) {
                        this.addDetectedAd(element, 'script');
                    }
                });
            }
        });
    }

    findRelatedAds(content) {
        if (!content || this.detectedAds.length === 0) {
            return [];
        }

        const contentText = content.text || content;
        const contentKeywords = this.extractKeywords(contentText);
        
        // Score ads based on content relevance
        const scoredAds = this.detectedAds.map(ad => ({
            ad,
            score: this.calculateAdRelevanceScore(ad, contentKeywords)
        }));

        // Sort by relevance score
        scoredAds.sort((a, b) => b.score - a.score);

        // Return top related ads
        const relatedAds = scoredAds
            .filter(item => item.score > 0)
            .slice(0, 3)
            .map(item => item.ad);

        console.log(`🎯 Found ${relatedAds.length} related ads`);
        
        return relatedAds;
    }

    calculateAdRelevanceScore(ad, contentKeywords) {
        let score = 0;
        
        // Get ad text and attributes
        const adText = ad.element.textContent.toLowerCase();
        const adTitle = ad.element.title ? ad.element.title.toLowerCase() : '';
        const adAlt = ad.element.alt ? ad.element.alt.toLowerCase() : '';
        
        // Check keyword matches
        contentKeywords.forEach(keyword => {
            if (adText.includes(keyword) || adTitle.includes(keyword) || adAlt.includes(keyword)) {
                score += 1;
            }
        });

        // Bonus for high-value ad categories
        const highValueKeywords = ['finance', 'business', 'investment', 'money', 'credit', 'loan', 'insurance'];
        highValueKeywords.forEach(keyword => {
            if (adText.includes(keyword)) {
                score += 2;
            }
        });

        // Bonus for visible ads
        if (this.isAdVisible(ad.element)) {
            score += 1;
        }

        // Bonus for well-positioned ads
        if (this.isAdWellPositioned(ad.element)) {
            score += 1;
        }

        return score;
    }

    extractKeywords(text) {
        if (!text || typeof text !== 'string') return [];

        // Simple keyword extraction
        const words = text.split(/\s+/)
            .filter(word => word.length > 3)
            .filter(word => !this.isCommonWord(word))
            .slice(0, 15);

        return words;
    }

    isCommonWord(word) {
        const commonWords = [
            'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of',
            'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have',
            'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
            'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those'
        ];

        return commonWords.includes(word.toLowerCase());
    }

    isValidAdElement(element) {
        if (!element) return false;

        // Check if element is visible
        if (!this.isElementVisible(element)) {
            return false;
        }

        // Check if element has reasonable size
        const rect = element.getBoundingClientRect();
        if (rect.width < 50 || rect.height < 50) {
            return false;
        }

        // Check if element is not already detected
        const isAlreadyDetected = this.detectedAds.some(ad => ad.element === element);
        if (isAlreadyDetected) {
            return false;
        }

        // Check if element is not a TOC (Table of Contents)
        if (this.isTOCElement(element)) {
            console.log('🚫 Skipping TOC element as ad:', element);
            return false;
        }

        return true;
    }

    isElementVisible(element) {
        const style = window.getComputedStyle(element);
        
        // Check if element is hidden
        if (style.display === 'none' || style.visibility === 'hidden') {
            return false;
        }

        // Check if element has opacity
        if (parseFloat(style.opacity) === 0) {
            return false;
        }

        // Check if element is in viewport
        const rect = element.getBoundingClientRect();
        if (rect.top > window.innerHeight || rect.bottom < 0) {
            return false;
        }

        return true;
    }

    isAdVisible(element) {
        return this.isElementVisible(element);
    }

    isAdWellPositioned(element) {
        const rect = element.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        // Check if ad is in a good position (not too close to edges)
        const margin = 50;
        
        return rect.top > margin && 
               rect.bottom < viewportHeight - margin &&
               rect.left > margin && 
               rect.right < viewportWidth - margin;
    }

    isAdUrl(url) {
        const adDomains = [
            'googleadservices.com',
            'googlesyndication.com',
            'doubleclick.net',
            'google.com/ads',
            'adsystem.com',
            'adnxs.com'
        ];

        return adDomains.some(domain => url.includes(domain));
    }

    isAdSenseScript(content) {
        const adSensePatterns = [
            'adsbygoogle',
            'google_ad',
            'googleadservices',
            'googlesyndication',
            'adsense',
            'data-ad-client',
            'data-ad-slot'
        ];

        return adSensePatterns.some(pattern => content.includes(pattern));
    }

    findAdElementsNearScript(script) {
        const elements = [];
        
        // Look for elements near the script
        let current = script.nextElementSibling;
        let count = 0;
        
        while (current && count < 5) {
            if (current.tagName === 'DIV' || current.tagName === 'INS') {
                elements.push(current);
            }
            current = current.nextElementSibling;
            count++;
        }

        return elements;
    }

    addDetectedAd(element, detectionMethod) {
        const ad = {
            element: element,
            detectionMethod: detectionMethod,
            position: this.getAdPosition(element),
            size: this.getAdSize(element),
            text: element.textContent.trim().substring(0, 100),
            href: element.href || '',
            title: element.title || '',
            alt: element.alt || ''
        };

        this.detectedAds.push(ad);
    }

    getAdPosition(element) {
        const rect = element.getBoundingClientRect();
        
        return {
            top: rect.top,
            left: rect.left,
            bottom: rect.bottom,
            right: rect.right,
            centerX: rect.left + rect.width / 2,
            centerY: rect.top + rect.height / 2
        };
    }

    getAdSize(element) {
        const rect = element.getBoundingClientRect();
        
        return {
            width: rect.width,
            height: rect.height,
            area: rect.width * rect.height
        };
    }

    getAdStats() {
        return {
            totalAds: this.detectedAds.length,
            visibleAds: this.detectedAds.filter(ad => this.isAdVisible(ad.element)).length,
            wellPositionedAds: this.detectedAds.filter(ad => this.isAdWellPositioned(ad.element)).length,
            detectionMethods: this.detectedAds.reduce((methods, ad) => {
                methods[ad.detectionMethod] = (methods[ad.detectionMethod] || 0) + 1;
                return methods;
            }, {})
        };
    }

    isTOCElement(element) {
        if (!element) return false;

        try {
            const elementText = (element.textContent || '').toLowerCase().trim();
            const elementClass = (element.className || '').toLowerCase();
            const elementId = (element.id || '').toLowerCase();
            const elementTag = element.tagName.toLowerCase();

            // Check for TOC-related text content
            const tocTextPatterns = [
                'table of contents',
                'table of content',
                'contents',
                'content',
                'toc',
                'index',
                'menu',
                'navigation',
                'nav',
                'outline',
                'summary',
                'overview',
                'list of',
                'chapter',
                'section',
                'part'
            ];

            for (const pattern of tocTextPatterns) {
                if (elementText.includes(pattern)) {
                    console.log('🚫 TOC element detected by text:', pattern, element);
                    return true;
                }
            }

            // Check for TOC-related CSS classes and IDs
            const tocClassPatterns = [
                'toc',
                'table-of-contents',
                'contents',
                'index',
                'menu',
                'nav',
                'navigation',
                'outline',
                'summary'
            ];

            for (const pattern of tocClassPatterns) {
                if (elementClass.includes(pattern) || elementId.includes(pattern)) {
                    console.log('🚫 TOC element detected by class/id:', pattern, element);
                    return true;
                }
            }

            // Check if element is inside a TOC container
            const tocContainerSelectors = [
                '.toc',
                '.table-of-contents',
                '.contents',
                '.index',
                '.menu',
                '.nav',
                '.navigation',
                '.outline',
                '.summary',
                '#toc',
                '#table-of-contents',
                '#contents',
                '#index',
                '#menu',
                '#nav',
                '#navigation',
                '#outline',
                '#summary'
            ];

            for (const selector of tocContainerSelectors) {
                if (element.closest(selector)) {
                    console.log('🚫 TOC element detected: Inside TOC container', selector, element);
                    return true;
                }
            }

            // Check for specific TOC patterns from the log
            if (elementText.includes('table of contents') && elementText.includes('importance of web applications')) {
                console.log('🚫 TOC element detected: Specific pattern from log', element);
                return true;
            }

            return false;

        } catch (error) {
            console.warn('Error checking TOC element:', error);
            return false;
        }
    }
}
