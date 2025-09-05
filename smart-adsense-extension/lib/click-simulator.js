/**
 * Click Simulator - Simulasi klik iklan yang realistis dan interaksi dengan halaman iklan
 * ENHANCED VERSION with comprehensive fixes and improvements
 */

class ClickSimulator {
    constructor() {
        this.isClicking = false;
        this.clickHistory = [];
        this.maxClicksPerSession = 1;
        this.currentClicks = 0;
        
        // Enhanced configuration
        this.config = {
            maxRetries: 3,
            clickTimeout: 8000, // 8 seconds
            navigationTimeout: 10000, // 10 seconds
            pageLoadTimeout: 15000, // 15 seconds
            enableAdvancedFallbacks: true,
            enableClickValidation: true,
            enablePerformanceOptimization: true
        };
        
        // Performance optimization: element cache
        this.elementCache = new Map();
        this.cacheTimeout = 30000; // 30 seconds
        
        // Enhanced click tracking
        this.clickAttempts = 0;
        this.lastClickTime = 0;
        this.clickSuccessRate = 0;
        
        // Missing properties for compatibility
        this.lastContent = null;
        this.lastTitle = null;
        this.cacheHitRate = 0;
        this.averageClickTime = 0;
        
        console.log('🚀 Enhanced Click Simulator initialized with config:', this.config);
    }

    async clickAd(ad) {
        if (this.isClicking) {
            console.log('⚠️ Click simulation already in progress');
            return false;
        }

        if (this.currentClicks >= this.maxClicksPerSession) {
            console.log('⚠️ Maximum ad clicks reached for this session');
            return false;
        }

        // Rate limiting: prevent too frequent clicks
        const timeSinceLastClick = Date.now() - this.lastClickTime;
        if (timeSinceLastClick < 2000) { // Minimum 2 seconds between clicks
            console.log('⏱️ Rate limiting: waiting before next click');
            await this.delay(2000 - timeSinceLastClick);
        }

        console.log('🖱️ Starting enhanced ad click simulation...', {
            adText: ad.text ? ad.text.substring(0, 50) : 'No text',
            position: ad.position || 'unknown',
            element: ad.element ? {
                tagName: ad.element.tagName,
                className: ad.element.className,
                id: ad.element.id,
                href: ad.element.href
            } : 'No element'
        });

        // Enhanced debug with performance metrics
        this.debugAdElement(ad);
        this.clickAttempts++;

        this.isClicking = true;
        this.lastClickTime = Date.now();

        try {
            // Step 1: Enhanced pre-click behavior
            await this.performEnhancedPreClickBehavior(ad);

            // Step 2: Perform click with multiple fallback strategies
            const clickSuccess = await this.performEnhancedClick(ad);

            if (clickSuccess) {
                // Step 3: Enhanced post-click behavior
                await this.performEnhancedPostClickBehavior(ad);

                // Step 4: Enhanced ad page interaction
                await this.interactWithAdPageEnhanced();

                this.currentClicks++;
                this.updateClickSuccessRate(true);
                console.log('✅ Enhanced ad click simulation completed successfully');
                return true;
            } else {
                this.updateClickSuccessRate(false);
                console.log('❌ Enhanced ad click failed after all attempts');
                return false;
            }

        } catch (error) {
            console.error('❌ Critical error during enhanced ad click simulation:', error);
            this.updateClickSuccessRate(false);
            return false;
        } finally {
            this.isClicking = false;
        }
    }

    async performEnhancedPreClickBehavior(ad) {
        console.log('🔍 Performing enhanced pre-click behavior...');

        try {
            // Enhanced scroll with viewport optimization
            await this.scrollToAdEnhanced(ad);

            // Enhanced hover with natural movement
            await this.hoverOverAdEnhanced(ad);

            // Dynamic delay based on ad complexity
            const delay = this.calculateOptimalDelay(ad);
            await this.delay(delay);

            console.log('✅ Enhanced pre-click behavior completed');
        } catch (error) {
            console.warn('⚠️ Pre-click behavior error (continuing):', error);
        }
    }

    async performEnhancedClick(ad) {
        console.log('🖱️ Performing enhanced ad click...');

        // Try primary click method first
        let clickSuccess = await this.performPrimaryClick(ad);
        
        if (clickSuccess) {
            return true;
        }

        // If primary method fails, try fallback strategies
        if (this.config.enableAdvancedFallbacks) {
            console.log('🔄 Primary click failed, attempting fallback strategies...');
            
            const fallbackMethods = [
                () => this.performFallbackClick(ad, 'programmatic'),
                () => this.performFallbackClick(ad, 'formSubmit'),
                () => this.performFallbackClick(ad, 'keyboardNavigation'),
                () => this.performFallbackClick(ad, 'iframeClick'),
                () => this.performFallbackClick(ad, 'eventTrigger')
            ];

            for (let i = 0; i < fallbackMethods.length; i++) {
                try {
                    console.log(`🔄 Trying fallback method ${i + 1}: ${fallbackMethods[i].name}`);
                    clickSuccess = await fallbackMethods[i]();
                    
                    if (clickSuccess) {
                        console.log(`✅ Fallback method ${i + 1} succeeded`);
                        return true;
                    }
                } catch (error) {
                    console.warn(`⚠️ Fallback method ${i + 1} failed:`, error);
                }
            }
        }

        console.log('❌ All click methods failed');
        return false;
    }

    async performPrimaryClick(ad) {
        try {
            // Get clickable element with enhanced detection
            const clickableElement = this.findClickableElementEnhanced(ad.element);

            if (!clickableElement) {
                console.log('⚠️ No clickable element found for primary click');
                return false;
            }

            // Enhanced element validation
            if (!this.isElementClickableEnhanced(clickableElement)) {
                console.log('⚠️ Element not clickable for primary click');
                return false;
            }

            // Simulate enhanced mouse movement
            await this.moveMouseToElementEnhanced(clickableElement);

            // Perform enhanced click with proper properties
            const clickSuccess = await this.executeClickEvent(clickableElement, 'primary');

            if (clickSuccess) {
                // Enhanced navigation validation
                const navigationSuccess = await this.waitForNavigationEnhanced();
                return navigationSuccess;
            }

            return false;

        } catch (error) {
            console.error('❌ Primary click error:', error);
            return false;
        }
    }

    async performFallbackClick(ad, method) {
        console.log(`🔄 Attempting ${method} fallback click...`);

        try {
            switch (method) {
                case 'programmatic':
                    return await this.clickWithProgrammaticClick(ad);
                case 'formSubmit':
                    return await this.clickWithFormSubmit(ad);
                case 'keyboardNavigation':
                    return await this.clickWithKeyboardNavigation(ad);
                case 'iframeClick':
                    return await this.clickWithIframeClick(ad);
                case 'eventTrigger':
                    return await this.clickWithEventTrigger(ad);
                default:
                    return false;
            }
        } catch (error) {
            console.error(`❌ ${method} fallback failed:`, error);
            return false;
        }
    }

    async clickWithProgrammaticClick(ad) {
        try {
            const element = ad.element;
            if (!element) return false;

            // Try direct click method
            if (typeof element.click === 'function') {
                element.click();
                await this.delay(1000);
                return await this.waitForNavigationEnhanced();
            }

            // Try HTMLElement click
            if (element instanceof HTMLElement) {
                element.click();
                await this.delay(1000);
                return await this.waitForNavigationEnhanced();
            }

            return false;
        } catch (error) {
            console.error('Programmatic click error:', error);
            return false;
        }
    }

    async clickWithFormSubmit(ad) {
        try {
            const element = ad.element;
            if (!element) return false;

            // Look for form elements
            const form = element.closest('form');
            if (form) {
                const submitButton = form.querySelector('input[type="submit"], button[type="submit"]');
                if (submitButton) {
                    submitButton.click();
                    await this.delay(1000);
                    return await this.waitForNavigationEnhanced();
                }
            }

            return false;
        } catch (error) {
            console.error('Form submit click error:', error);
            return false;
        }
    }

    async clickWithKeyboardNavigation(ad) {
        try {
            const element = ad.element;
            if (!element) return false;

            // Focus element
            element.focus();
            await this.delay(200);

            // Simulate Enter key
            const enterEvent = new KeyboardEvent('keydown', {
                key: 'Enter',
                code: 'Enter',
                keyCode: 13,
                which: 13,
                        bubbles: true,
                cancelable: true
            });

            element.dispatchEvent(enterEvent);
            await this.delay(200);

            const keyupEvent = new KeyboardEvent('keyup', {
                key: 'Enter',
                code: 'Enter',
                keyCode: 13,
                which: 13,
                bubbles: true,
                cancelable: true
            });

            element.dispatchEvent(keyupEvent);
            await this.delay(1000);

            return await this.waitForNavigationEnhanced();
        } catch (error) {
            console.error('Keyboard navigation error:', error);
                    return false;
                }
            }

    async clickWithIframeClick(ad) {
        try {
            const element = ad.element;
            if (!element) return false;

            // Check if element is inside iframe
            const iframe = element.closest('iframe');
            if (iframe) {
                // Try to access iframe content
                try {
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    const iframeElement = iframeDoc.querySelector(element.tagName);
                    if (iframeElement) {
                        iframeElement.click();
                        await this.delay(1000);
                        return await this.waitForNavigationEnhanced();
                    }
                } catch (e) {
                    console.warn('Cannot access iframe content due to CORS');
                }
            }

            return false;
        } catch (error) {
            console.error('Iframe click error:', error);
            return false;
        }
    }

    async clickWithEventTrigger(ad) {
        try {
            const element = ad.element;
            if (!element) return false;

            // Try to trigger custom events
            const events = ['mousedown', 'mouseup', 'click', 'touchend'];
            
            for (const eventType of events) {
                try {
                    const event = new Event(eventType, { bubbles: true, cancelable: true });
                    element.dispatchEvent(event);
                    await this.delay(100);
                } catch (e) {
                    console.warn(`Event ${eventType} failed:`, e);
                }
            }

            await this.delay(1000);
            return await this.waitForNavigationEnhanced();
        } catch (error) {
            console.error('Event trigger error:', error);
            return false;
        }
    }

    async executeClickEvent(element, method = 'primary') {
        try {
            const rect = element.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            // Create enhanced click event with CORRECT properties
            const clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window,
                button: 0,        // Left mouse button
                buttons: 0,       // FIXED: No buttons pressed (was incorrectly 1)
                detail: 1,        // Single click
                clientX: centerX,
                clientY: centerY,
                screenX: centerX + window.screenX,
                screenY: centerY + window.screenY,
                relatedTarget: null,
                ctrlKey: false,
                shiftKey: false,
                altKey: false,
                metaKey: false
            });

            // Dispatch the event
            const eventDispatched = element.dispatchEvent(clickEvent);
            
            if (!eventDispatched) {
                console.warn('⚠️ Click event was cancelled');
                return false;
            }

            console.log(`✅ ${method} click event executed successfully`);
            return true;

        } catch (error) {
            console.error(`❌ ${method} click event error:`, error);
            return false;
        }
    }

    async waitForNavigationEnhanced() {
        const currentUrl = window.location.href;
        const startTime = Date.now();
        const maxWait = this.config.navigationTimeout;

        console.log('🔄 Waiting for navigation...');

        while (Date.now() - startTime < maxWait) {
            // Check for URL change
            if (window.location.href !== currentUrl) {
                console.log('✅ Navigation detected (URL change)');
                return true;
            }

            // Check for page title change
            const currentTitle = document.title;
            if (currentTitle && currentTitle !== this.lastTitle) {
                console.log('✅ Navigation detected (title change)');
                this.lastTitle = currentTitle;
                return true;
            }

            // Check for new window/tab
            if (window.opener || window.name !== '') {
                console.log('✅ Navigation detected (new window)');
                return true;
            }

            // Check for page content changes
            if (this.hasPageContentChanged()) {
                console.log('✅ Navigation detected (content change)');
                return true;
            }

            await this.delay(200);
        }

        console.log('⚠️ No navigation detected within timeout');
        return false;
    }

    hasPageContentChanged() {
        // Simple content change detection
        const currentContent = document.body ? document.body.textContent : '';
        if (this.lastContent && currentContent !== this.lastContent) {
            this.lastContent = currentContent;
            return true;
        }
        this.lastContent = currentContent;
        return false;
    }

    findClickableElementEnhanced(adElement) {
        // Use cached result if available
        const cacheKey = `clickable_${adElement.outerHTML.slice(0, 100)}`;
        if (this.elementCache.has(cacheKey)) {
            const cached = this.elementCache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                console.log('📋 Using cached clickable element');
                return cached.element;
            }
        }

        console.log('🔍 Finding enhanced clickable element for ad...');

        // Enhanced detection strategies
        const detectionStrategies = [
            () => this.findLinkElement(adElement),
            () => this.findButtonElement(adElement),
            () => this.findInteractiveElement(adElement),
            () => this.findAdSpecificElement(adElement),
            () => this.findFallbackElement(adElement)
        ];

        for (const strategy of detectionStrategies) {
            try {
                const element = strategy();
                if (element) {
                    // Cache the result
                    this.elementCache.set(cacheKey, {
                        element: element,
                        timestamp: Date.now()
                    });

                    // Clean old cache entries
                    this.cleanupCache();

                    return element;
                }
            } catch (error) {
                console.warn('Strategy failed:', error);
            }
        }

        console.log('❌ No clickable element found with enhanced detection');
        return null;
    }

    findLinkElement(adElement) {
        // Look for links with enhanced selectors
        const linkSelectors = [
            'a[href]',
            'a[onclick]',
            'a[data-href]',
            'a[data-url]',
            '[role="link"]'
        ];

        for (const selector of linkSelectors) {
            const link = adElement.querySelector(selector);
            if (link && this.isElementClickableEnhanced(link)) {
                console.log('✅ Found clickable link:', selector);
            return link;
            }
        }

        // Check if ad element itself is a link
        if (adElement.tagName === 'A' && adElement.href) {
            console.log('✅ Ad element is a clickable link');
            return adElement;
        }

        return null;
        }

    findButtonElement(adElement) {
        const buttonSelectors = [
            'button', 
            'input[type="button"]', 
            'input[type="submit"]',
            '[role="button"]',
            '[data-button]'
        ];

        for (const selector of buttonSelectors) {
            const button = adElement.querySelector(selector);
            if (button && this.isElementClickableEnhanced(button)) {
                console.log('✅ Found clickable button:', selector);
                return button;
            }
        }

        return null;
    }

    findInteractiveElement(adElement) {
        const interactiveSelectors = [
            '[onclick]',
            '[data-click]',
            '[data-action]',
            '[data-href]',
            '[data-url]',
            '.clickable',
            '.interactive'
        ];

        for (const selector of interactiveSelectors) {
            const element = adElement.querySelector(selector);
            if (element && this.isElementClickableEnhanced(element)) {
                console.log('✅ Found interactive element:', selector);
                return element;
            }
        }

        return null;
    }

    findAdSpecificElement(adElement) {
        // Ad-specific patterns
        const adPatterns = [
            '.adsbygoogle',
            '.advertisement',
            '.ad-container',
            '.ad-wrapper',
            '.ad-unit',
            '[data-ad]',
            '[data-adunit]',
            '[id*="google_ads"]',
            '[class*="adsbygoogle"]'
        ];

        for (const pattern of adPatterns) {
            const element = adElement.querySelector(pattern) || 
                           (adElement.matches(pattern) ? adElement : null);
            if (element && this.isElementClickableEnhanced(element)) {
                console.log('✅ Found ad-specific element:', pattern);
                return element;
            }
        }

        return null;
    }

    findFallbackElement(adElement) {
        // Last resort: check if ad element itself is clickable
        if (this.isElementClickableEnhanced(adElement)) {
            console.log('✅ Using ad element as fallback');
            return adElement;
        }

        // Look for any element with click-like attributes
        const fallbackSelectors = [
            '[tabindex]',
            '[data-*]',
            '[class*="click"]',
            '[class*="btn"]',
            '[class*="button"]'
        ];

        for (const selector of fallbackSelectors) {
            const element = adElement.querySelector(selector);
            if (element && this.isElementClickableEnhanced(element)) {
                console.log('✅ Found fallback element:', selector);
                return element;
            }
        }

        return null;
    }

    isElementClickableEnhanced(element) {
        if (!element) return false;

        try {
            // Enhanced visibility check
        const rect = element.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
            return false;
        }

            // Enhanced size check
            if (rect.width < 15 || rect.height < 15) {
            return false;
        }

            // Enhanced viewport check
            if (rect.top < -100 || rect.left < -100 || 
                rect.bottom > window.innerHeight + 100 || 
                rect.right > window.innerWidth + 100) {
            return false;
        }

            // Enhanced style check
            const style = window.getComputedStyle(element);
            if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
                return false;
            }

            // Enhanced interaction check
            const hasInteraction = element.onclick || 
                                 element.getAttribute('onclick') || 
                                 element.href || 
                                 element.tagName === 'A' || 
                                 element.tagName === 'BUTTON' ||
                                 element.getAttribute('role') === 'button' ||
                                 element.getAttribute('role') === 'link' ||
                                 element.getAttribute('tabindex') !== null;

            if (hasInteraction) {
                return true;
            }

            // Enhanced ad indicator check
        const className = element.className.toLowerCase();
        const id = element.id.toLowerCase();
        
        const adIndicators = [
            'ad', 'ads', 'advertisement', 'adsbygoogle', 'google-ad',
                'ad-container', 'ad-wrapper', 'ad-unit', 'advertisement',
                'clickable', 'interactive', 'button', 'btn'
        ];

        const hasAdIndicator = adIndicators.some(indicator => 
            className.includes(indicator) || id.includes(indicator)
        );

        if (hasAdIndicator) {
            return true;
        }

        return false;

        } catch (error) {
            console.warn('Error in enhanced clickability check:', error);
        return false;
    }
    }

    async scrollToAdEnhanced(ad) {
        try {
            const rect = ad.element.getBoundingClientRect();
            const targetY = window.scrollY + rect.top - window.innerHeight / 3;

            // Enhanced smooth scrolling
            window.scrollTo({
                top: targetY,
                behavior: 'smooth'
            });

            // Wait for scroll to complete
            await this.waitForScrollComplete();
            
            // Additional delay for stability
            await this.delay(300);

        } catch (error) {
            console.warn('Scroll error (continuing):', error);
        }
    }

    async waitForScrollComplete() {
        return new Promise(resolve => {
            let scrollTimeout;
            let scrollEndTimeout;

            const onScroll = () => {
                clearTimeout(scrollEndTimeout);
                scrollEndTimeout = setTimeout(() => {
                    window.removeEventListener('scroll', onScroll);
                    clearTimeout(scrollTimeout);
                    resolve();
                }, 150); // 150ms after scroll stops
            };

            window.addEventListener('scroll', onScroll);
            
            // Fallback timeout
            scrollTimeout = setTimeout(() => {
                window.removeEventListener('scroll', onScroll);
                resolve();
            }, 2000);
        });
    }

    async hoverOverAdEnhanced(ad) {
        try {
            const rect = ad.element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

            // Enhanced mouse movement simulation
            await this.simulateNaturalMouseMovement(centerX, centerY);

            // Enhanced hover events
            const hoverEvents = ['mouseover', 'mouseenter'];
            for (const eventType of hoverEvents) {
                const event = new MouseEvent(eventType, {
                    bubbles: true,
                    cancelable: true,
                    clientX: centerX,
                    clientY: centerY
                });
                ad.element.dispatchEvent(event);
            }

            // Dynamic hover duration
            const hoverDuration = 300 + Math.random() * 700; // 300ms - 1s
            await this.delay(hoverDuration);

        } catch (error) {
            console.warn('Hover error (continuing):', error);
        }
    }

    async simulateNaturalMouseMovement(targetX, targetY) {
        const steps = 15; // More natural movement
        const startX = Math.random() * window.innerWidth;
        const startY = Math.random() * window.innerHeight;

        for (let i = 0; i <= steps; i++) {
            const progress = i / steps;
            
            // Add some randomness to movement
            const randomOffsetX = (Math.random() - 0.5) * 20;
            const randomOffsetY = (Math.random() - 0.5) * 20;
            
            const currentX = startX + (targetX - startX) * progress + randomOffsetX;
            const currentY = startY + (targetY - startY) * progress + randomOffsetY;

            const moveEvent = new MouseEvent('mousemove', {
                clientX: currentX,
                clientY: currentY,
                bubbles: true
            });

            document.dispatchEvent(moveEvent);

            // Variable delay for natural movement
            const delay = 8 + Math.random() * 12; // 8-20ms
            await this.delay(delay);
        }
    }

    calculateOptimalDelay(ad) {
        // Calculate delay based on ad complexity and size
        let baseDelay = 500;
        
        if (ad.element) {
            const rect = ad.element.getBoundingClientRect();
            const area = rect.width * rect.height;
            
            // Larger ads get longer delays
            if (area > 50000) baseDelay += 300;
            else if (area > 20000) baseDelay += 200;
            else if (area > 10000) baseDelay += 100;
            
            // Check for complex content
            const childCount = ad.element.children.length;
            if (childCount > 5) baseDelay += 200;
            else if (childCount > 2) baseDelay += 100;
        }
        
        // Add randomness
        const randomDelay = Math.random() * 1000;
        return baseDelay + randomDelay;
    }

    async performEnhancedPostClickBehavior(ad) {
        console.log('🔍 Performing enhanced post-click behavior...');

        try {
            // Enhanced click history recording
            this.clickHistory.push({
                ad: {
                    text: ad.text || 'Unknown',
                    position: ad.position || 'unknown',
                    url: window.location.href,
                    timestamp: Date.now(),
                    method: 'enhanced',
                    success: true
                },
                timestamp: Date.now(),
                url: window.location.href,
                sessionId: this.generateSessionId()
            });

            // Enhanced delay calculation
            const postClickDelay = 1000 + Math.random() * 2000;
            await this.delay(postClickDelay);

            console.log('✅ Enhanced post-click behavior completed');

        } catch (error) {
            console.warn('⚠️ Post-click behavior error (continuing):', error);
        }
    }

    async interactWithAdPageEnhanced() {
        console.log('🌐 Performing enhanced ad page interactions...');

        try {
            // Wait for enhanced page load
            await this.waitForPageLoadEnhanced();

            // Enhanced page interactions
            await this.performEnhancedPageInteractions();

            // Dynamic interaction duration
            const interactionDuration = 2000 + Math.random() * 4000; // 2-6 seconds
            await this.delay(interactionDuration);

            console.log('✅ Enhanced ad page interactions completed');

        } catch (error) {
            console.warn('⚠️ Ad page interaction error (continuing):', error);
        }
    }

    async waitForPageLoadEnhanced() {
        const startTime = Date.now();
        const maxWait = this.config.pageLoadTimeout;

        console.log('🔄 Waiting for enhanced page load...');

        // Wait for DOM content loaded
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
                setTimeout(resolve, maxWait);
            });
        }

        // Wait for additional dynamic content
        let lastContentLength = document.body ? document.body.textContent.length : 0;
        let stableCount = 0;
        const requiredStableCount = 3;

        while (Date.now() - startTime < maxWait && stableCount < requiredStableCount) {
            await this.delay(500);
            
            const currentContentLength = document.body ? document.body.textContent.length : 0;
            
            if (Math.abs(currentContentLength - lastContentLength) < 100) {
                stableCount++;
            } else {
                stableCount = 0;
                lastContentLength = currentContentLength;
            }
        }

        // Additional stability delay
        await this.delay(1000);
        console.log('✅ Page load completed');
    }

    async performEnhancedPageInteractions() {
        console.log('🔄 Performing enhanced page interactions...');

        try {
            // Enhanced scrolling
            await this.performEnhancedScrolling();

            // Enhanced element interactions
            await this.interactWithElementsEnhanced();

            // Enhanced content analysis
            await this.analyzePageContent();

        } catch (error) {
            console.warn('⚠️ Enhanced interactions error (continuing):', error);
        }
    }

    async performEnhancedScrolling() {
        const scrollSteps = 3 + Math.floor(Math.random() * 3); // 3-5 steps
        const scrollDistance = window.innerHeight * (0.2 + Math.random() * 0.3); // 20-50% of viewport

        for (let i = 0; i < scrollSteps; i++) {
            window.scrollBy({
                top: scrollDistance,
                behavior: 'smooth'
            });

            // Variable delay between scrolls
            const scrollDelay = 400 + Math.random() * 600; // 400ms - 1s
            await this.delay(scrollDelay);
        }
    }

    async interactWithElementsEnhanced() {
        try {
            // Find interactive elements with enhanced selectors
            const interactiveSelectors = [
                'button:not([disabled])',
                'a[href]:not([href="#"])',
                'input[type="button"]:not([disabled])',
                'input[type="submit"]:not([disabled])',
                'select:not([disabled])',
                '[role="button"]:not([disabled])',
                '[tabindex]:not([tabindex="-1"])'
            ];

            const interactiveElements = document.querySelectorAll(interactiveSelectors.join(', '));
            
            // Enhanced interaction count
            const numInteractions = Math.min(2 + Math.floor(Math.random() * 3), interactiveElements.length);
            const selectedElements = this.getRandomElementsEnhanced(interactiveElements, numInteractions);

        for (const element of selectedElements) {
                await this.interactWithElementEnhanced(element);
            }

        } catch (error) {
            console.warn('⚠️ Element interactions error (continuing):', error);
        }
    }

    async interactWithElementEnhanced(element) {
        try {
            // Enhanced hover simulation
            const rect = element.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            // Move mouse to element
            await this.simulateNaturalMouseMovement(centerX, centerY);

            // Enhanced hover events
            const hoverEvent = new MouseEvent('mouseover', {
                bubbles: true,
                cancelable: true,
                clientX: centerX,
                clientY: centerY
            });
            element.dispatchEvent(hoverEvent);

            // Hover duration
            await this.delay(200 + Math.random() * 300);

            // Move away
            const moveAwayEvent = new MouseEvent('mouseout', {
                bubbles: true,
                cancelable: true
            });
            element.dispatchEvent(moveAwayEvent);

            // Delay before next interaction
            await this.delay(100 + Math.random() * 200);

        } catch (error) {
            console.warn('⚠️ Element interaction error (continuing):', error);
        }
    }

    async analyzePageContent() {
        try {
            // Simple content analysis for interaction realism
            const contentLength = document.body ? document.body.textContent.length : 0;
            const imageCount = document.querySelectorAll('img').length;
            const linkCount = document.querySelectorAll('a').length;

            console.log('📊 Page content analysis:', {
                contentLength,
                imageCount,
                linkCount,
                url: window.location.href
            });

        } catch (error) {
            console.warn('⚠️ Content analysis error (continuing):', error);
        }
    }

    getRandomElementsEnhanced(elements, count) {
        const array = Array.from(elements);
        const selected = [];

        for (let i = 0; i < count && array.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * array.length);
            selected.push(array[randomIndex]);
            array.splice(randomIndex, 1);
        }

        return selected;
    }

    cleanupCache() {
        const now = Date.now();
        for (const [key, value] of this.elementCache.entries()) {
            if (now - value.timestamp > this.cacheTimeout) {
                this.elementCache.delete(key);
            }
        }
    }

    updateClickSuccessRate(success) {
        if (this.clickAttempts > 0) {
            this.clickSuccessRate = (this.clickSuccessRate * (this.clickAttempts - 1) + (success ? 1 : 0)) / this.clickAttempts;
        }
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getClickStats() {
        return {
            totalClicks: this.clickHistory.length,
            currentClicks: this.currentClicks,
            maxClicks: this.maxClicksPerSession,
            remainingClicks: this.maxClicksPerSession - this.currentClicks,
            clickAttempts: this.clickAttempts,
            successRate: this.clickSuccessRate,
            lastClickTime: this.lastClickTime
        };
    }

    resetSession() {
        this.currentClicks = 0;
        this.clickHistory = [];
        this.clickAttempts = 0;
        this.clickSuccessRate = 0;
        this.lastClickTime = 0;
        this.elementCache.clear();
        console.log('🔄 Enhanced click session reset');
    }

    isSessionComplete() {
        return this.currentClicks >= this.maxClicksPerSession;
    }

    // Enhanced configuration methods
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        console.log('⚙️ Click Simulator config updated:', this.config);
    }

    getConfig() {
        return { ...this.config };
    }

    // Performance monitoring
    getPerformanceMetrics() {
        return {
            cacheSize: this.elementCache.size,
            cacheHitRate: this.calculateCacheHitRate(),
            averageClickTime: this.calculateAverageClickTime(),
            successRate: this.clickSuccessRate
        };
    }

    calculateCacheHitRate() {
        // Placeholder for cache hit rate calculation
        return this.elementCache.size > 0 ? 0.8 : 0; // Simplified calculation
    }

    calculateAverageClickTime() {
        if (this.clickHistory.length === 0) return 0;
        
        const totalTime = this.clickHistory.reduce((sum, click) => {
            return sum + (click.timestamp - this.lastClickTime);
        }, 0);
        
        return totalTime / this.clickHistory.length;
    }

    // Missing methods implementation
    debugAdElement(ad) {
        try {
            console.log('🔍 Debugging ad element:', {
                element: ad.element ? {
                    tagName: ad.element.tagName,
                    className: ad.element.className,
                    id: ad.element.id,
                    href: ad.element.href,
                    textContent: ad.element.textContent ? ad.element.textContent.substring(0, 100) : 'No text',
                    isVisible: ad.element.offsetParent !== null,
                    dimensions: {
                        width: ad.element.offsetWidth,
                        height: ad.element.offsetHeight
                    },
                    position: {
                        top: ad.element.offsetTop,
                        left: ad.element.offsetLeft
                    }
                } : 'No element',
                adData: {
                    text: ad.text,
                    position: ad.position,
                    type: ad.type,
                    confidence: ad.confidence
                }
            });
        } catch (error) {
            console.warn('Error debugging ad element:', error);
        }
    }

    updatePerformanceMetrics() {
        try {
            // Update performance metrics based on current state
            const currentTime = Date.now();
            
            // Calculate cache hit rate
            const totalCacheRequests = this.elementCache.size + this.clickAttempts;
            if (totalCacheRequests > 0) {
                this.cacheHitRate = this.elementCache.size / totalCacheRequests;
            }
            
            // Update average click time
            if (this.clickHistory.length > 0) {
                const recentClicks = this.clickHistory.slice(-5); // Last 5 clicks
                const totalTime = recentClicks.reduce((sum, click) => {
                    return sum + (click.timestamp - (click.ad?.timestamp || click.timestamp));
                }, 0);
                this.averageClickTime = totalTime / recentClicks.length;
            }
            
            console.log('📊 Performance metrics updated');
        } catch (error) {
            console.warn('Error updating performance metrics:', error);
        }
    }

    analyzeReadingEfficiency() {
        try {
            // Analyze reading efficiency based on click patterns
            if (this.clickHistory.length === 0) return 0.5;
            
            const recentClicks = this.clickHistory.slice(-10); // Last 10 clicks
            const successfulClicks = recentClicks.filter(click => click.success).length;
            const efficiency = successfulClicks / recentClicks.length;
            
            return Math.max(0, Math.min(1, efficiency));
        } catch (error) {
            console.warn('Error analyzing reading efficiency:', error);
            return 0.5;
        }
    }

    analyzeClickEfficiency() {
        try {
            // Analyze click efficiency based on success rate
            if (this.clickAttempts === 0) return 1.0;
            
            const efficiency = this.clickSuccessRate;
            return Math.max(0, Math.min(1, efficiency));
        } catch (error) {
            console.warn('Error analyzing click efficiency:', error);
            return 1.0;
        }
    }

    analyzeNavigationEfficiency() {
        try {
            // Analyze navigation efficiency based on click success and timing
            if (this.clickHistory.length === 0) return 0.5;
            
            const recentClicks = this.clickHistory.slice(-5); // Last 5 clicks
            const successfulNavigations = recentClicks.filter(click => 
                click.success && click.ad && click.ad.url
            ).length;
            
            const efficiency = successfulNavigations / recentClicks.length;
            return Math.max(0, Math.min(1, efficiency));
        } catch (error) {
            console.warn('Error analyzing navigation efficiency:', error);
            return 0.5;
        }
    }
}
