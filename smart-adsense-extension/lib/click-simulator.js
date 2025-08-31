/**
 * Click Simulator - Simulasi klik iklan yang realistis dan interaksi dengan halaman iklan
 */

class ClickSimulator {
    constructor() {
        this.isClicking = false;
        this.clickHistory = [];
        this.maxClicksPerSession = 1;
        this.currentClicks = 0;
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

        console.log('🖱️ Starting ad click simulation...', {
            adText: ad.text.substring(0, 50),
            position: ad.position,
            element: ad.element ? {
                tagName: ad.element.tagName,
                className: ad.element.className,
                id: ad.element.id,
                href: ad.element.href
            } : 'No element'
        });

        // Debug ad element structure
        this.debugAdElement(ad);

        this.isClicking = true;

        try {
            // Step 1: Pre-click behavior
            await this.performPreClickBehavior(ad);

            // Step 2: Perform the click
            const clickSuccess = await this.performClick(ad);

            if (clickSuccess) {
                // Step 3: Post-click behavior
                await this.performPostClickBehavior(ad);

                // Step 4: Interact with ad page
                await this.interactWithAdPage();

                this.currentClicks++;
                console.log('✅ Ad click simulation completed successfully');
                return true;
            } else {
                console.log('❌ Ad click failed');
                return false;
            }

        } catch (error) {
            console.error('❌ Error during ad click simulation:', error);
            return false;
        } finally {
            this.isClicking = false;
        }
    }

    async performPreClickBehavior(ad) {
        console.log('🔍 Performing pre-click behavior...');

        // Scroll to ad if not visible
        await this.scrollToAd(ad);

        // Hover over ad
        await this.hoverOverAd(ad);

        // Wait a bit before clicking
        await this.delay(500 + Math.random() * 1000);
    }

    async performClick(ad) {
        console.log('🖱️ Performing ad click...');

        try {
            // Get clickable element (could be the ad itself or a link inside it)
            const clickableElement = this.findClickableElement(ad.element);

            if (!clickableElement) {
                console.log('⚠️ No clickable element found, trying fallback click on ad element itself');
                
                // Fallback: try clicking on the ad element itself
                if (ad.element && this.isElementClickable(ad.element)) {
                    console.log('🔄 Attempting fallback click on ad element');
                    
                    // Simulate mouse movement to ad element
                    await this.moveMouseToElement(ad.element);
                    
                    // Perform the click
                    const clickEvent = new MouseEvent('click', {
                        bubbles: true,
                        cancelable: true,
                        view: window,
                        button: 0,
                        buttons: 1
                    });
                    
                    ad.element.dispatchEvent(clickEvent);
                    
                    // Wait for navigation or new window
                    await this.waitForNavigation();
                    
                    console.log('✅ Fallback click performed successfully');
                    return true;
                } else {
                    console.log('❌ No clickable element found and fallback failed');
                    return false;
                }
            }

            // Simulate mouse movement to element
            await this.moveMouseToElement(clickableElement);

            // Perform the click
            const clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window,
                button: 0,
                buttons: 1
            });

            clickableElement.dispatchEvent(clickEvent);

            // Wait for navigation or new window
            await this.waitForNavigation();

            console.log('✅ Click performed successfully');
            return true;

        } catch (error) {
            console.error('❌ Error performing click:', error);
            return false;
        }
    }

    async performPostClickBehavior(ad) {
        console.log('🔍 Performing post-click behavior...');

        // Record click in history
        this.clickHistory.push({
            ad: ad,
            timestamp: Date.now(),
            url: window.location.href
        });

        // Wait a moment after click
        await this.delay(1000 + Math.random() * 2000);
    }

    async interactWithAdPage() {
        console.log('🌐 Interacting with ad page...');

        // Wait for page to load
        await this.waitForPageLoad();

        // Perform realistic interactions
        await this.performPageInteractions();

        // Wait before potentially going back
        await this.delay(2000 + Math.random() * 3000);
    }

    async scrollToAd(ad) {
        const rect = ad.element.getBoundingClientRect();
        const targetY = window.scrollY + rect.top - window.innerHeight / 3;

        window.scrollTo({
            top: targetY,
            behavior: 'smooth'
        });

        await this.delay(500);
    }

    async hoverOverAd(ad) {
        const rect = ad.element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Simulate mouse movement to ad center
        const moveEvent = new MouseEvent('mousemove', {
            clientX: centerX,
            clientY: centerY,
            bubbles: true
        });

        ad.element.dispatchEvent(moveEvent);

        // Simulate hover
        const mouseoverEvent = new MouseEvent('mouseover', {
            bubbles: true
        });

        ad.element.dispatchEvent(mouseoverEvent);

        await this.delay(300 + Math.random() * 500);
    }

    findClickableElement(adElement) {
        console.log('🔍 Finding clickable element for ad:', {
            tagName: adElement.tagName,
            className: adElement.className,
            id: adElement.id,
            href: adElement.href,
            onclick: adElement.onclick ? 'exists' : 'none'
        });

        // First, try to find a link inside the ad
        const link = adElement.querySelector('a[href]');
        if (link && link.href) {
            console.log('✅ Found clickable link inside ad:', link.href);
            return link;
        }

        // If no link found, check if the ad element itself is clickable
        if (adElement.tagName === 'A' && adElement.href) {
            console.log('✅ Ad element itself is a clickable link:', adElement.href);
            return adElement;
        }

        // Check if element has click handlers
        if (this.hasClickHandlers(adElement)) {
            console.log('✅ Ad element has click handlers');
            return adElement;
        }

        // Look for any clickable element within the ad
        const clickableSelectors = [
            'button', 
            'input[type="button"]', 
            '[onclick]', 
            '[role="button"]',
            '[data-ad]',
            '[data-adunit]',
            '.adsbygoogle',
            '.advertisement',
            '.ad-container',
            '.ad-wrapper'
        ];
        
        for (const selector of clickableSelectors) {
            const element = adElement.querySelector(selector);
            if (element) {
                console.log('✅ Found clickable element with selector:', selector);
                return element;
            }
        }

        // Try to find any element with href attribute
        const hrefElement = adElement.querySelector('[href]');
        if (hrefElement && hrefElement.href) {
            console.log('✅ Found element with href attribute:', hrefElement.href);
            return hrefElement;
        }

        // Try to find any element with onclick attribute
        const onclickElement = adElement.querySelector('[onclick]');
        if (onclickElement) {
            console.log('✅ Found element with onclick attribute');
            return onclickElement;
        }

        // If still no clickable element found, try the ad element itself
        // (some ads might be clickable even without explicit click handlers)
        if (adElement.style.cursor === 'pointer' || 
            adElement.getAttribute('style')?.includes('cursor: pointer') ||
            adElement.className.toLowerCase().includes('clickable') ||
            adElement.className.toLowerCase().includes('ad')) {
            console.log('✅ Using ad element itself (appears to be clickable)');
            return adElement;
        }

        console.log('❌ No clickable element found in ad');
        return null;
    }

    isElementClickable(element) {
        if (!element) return false;

        // Check if element is visible
        const rect = element.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
            return false;
        }

        // Check if element has reasonable size
        if (rect.width < 20 || rect.height < 20) {
            return false;
        }

        // Check if element is in viewport
        if (rect.top < 0 || rect.left < 0 || 
            rect.bottom > window.innerHeight || 
            rect.right > window.innerWidth) {
            return false;
        }

        // Check for common ad indicators
        const className = element.className.toLowerCase();
        const id = element.id.toLowerCase();
        
        const adIndicators = [
            'ad', 'ads', 'advertisement', 'adsbygoogle', 'google-ad',
            'ad-container', 'ad-wrapper', 'ad-unit', 'advertisement'
        ];

        const hasAdIndicator = adIndicators.some(indicator => 
            className.includes(indicator) || id.includes(indicator)
        );

        if (hasAdIndicator) {
            console.log('✅ Element appears to be an ad and is clickable');
            return true;
        }

        // Check if element has any interactive properties
        if (element.onclick || 
            element.getAttribute('onclick') || 
            element.href || 
            element.tagName === 'A' || 
            element.tagName === 'BUTTON') {
            console.log('✅ Element has interactive properties');
            return true;
        }

        console.log('❌ Element does not appear to be clickable');
        return false;
    }

    hasClickHandlers(element) {
        // Check for onclick attribute
        if (element.onclick || element.getAttribute('onclick')) {
            return true;
        }

        // Check for event listeners (this is limited due to security restrictions)
        return false;
    }

    debugAdElement(ad) {
        if (!ad || !ad.element) {
            console.log('❌ Ad object is invalid or missing element');
            return;
        }

        const element = ad.element;
        console.log('🔍 Debugging ad element:', {
            tagName: element.tagName,
            className: element.className,
            id: element.id,
            href: element.href,
            onclick: element.onclick ? 'exists' : 'none',
            style: element.style.cssText,
            innerHTML: element.innerHTML.substring(0, 200) + '...',
            children: element.children.length,
            childNodes: element.childNodes.length
        });

        // Check for common ad patterns
        const adPatterns = [
            'adsbygoogle',
            'advertisement',
            'ad-container',
            'ad-wrapper',
            'google-ad',
            'adsense',
            'ad-unit'
        ];

        adPatterns.forEach(pattern => {
            if (element.className.toLowerCase().includes(pattern) || 
                element.id.toLowerCase().includes(pattern)) {
                console.log('✅ Found ad pattern:', pattern);
            }
        });

        // Check for clickable children
        const clickableChildren = element.querySelectorAll('a, button, [onclick], [href]');
        console.log('🔍 Found clickable children:', clickableChildren.length);
        clickableChildren.forEach((child, index) => {
            console.log(`  Child ${index + 1}:`, {
                tagName: child.tagName,
                className: child.className,
                href: child.href,
                onclick: child.onclick ? 'exists' : 'none'
            });
        });
    }

    async moveMouseToElement(element) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Simulate natural mouse movement
        const steps = 10;
        const startX = Math.random() * window.innerWidth;
        const startY = Math.random() * window.innerHeight;

        for (let i = 0; i <= steps; i++) {
            const progress = i / steps;
            const currentX = startX + (centerX - startX) * progress;
            const currentY = startY + (centerY - startY) * progress;

            const moveEvent = new MouseEvent('mousemove', {
                clientX: currentX,
                clientY: currentY,
                bubbles: true
            });

            document.dispatchEvent(moveEvent);

            await this.delay(10);
        }
    }

    async waitForNavigation() {
        const currentUrl = window.location.href;
        const maxWait = 5000; // 5 seconds
        const startTime = Date.now();

        while (Date.now() - startTime < maxWait) {
            if (window.location.href !== currentUrl) {
                console.log('✅ Navigation detected');
                return true;
            }
            await this.delay(100);
        }

        console.log('⚠️ No navigation detected, continuing...');
        return false;
    }

    async waitForPageLoad() {
        if (document.readyState === 'loading') {
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve);
                setTimeout(resolve, 5000); // Timeout after 5 seconds
            });
        }

        // Additional wait for dynamic content
        await this.delay(1000);
    }

    async performPageInteractions() {
        console.log('🔄 Performing page interactions...');

        // Scroll down a bit
        await this.performScrolling();

        // Look for interactive elements
        await this.interactWithElements();

        // Wait a bit more
        await this.delay(1000 + Math.random() * 2000);
    }

    async performScrolling() {
        const scrollSteps = 3;
        const scrollDistance = window.innerHeight * 0.3;

        for (let i = 0; i < scrollSteps; i++) {
            window.scrollBy({
                top: scrollDistance,
                behavior: 'smooth'
            });

            await this.delay(500 + Math.random() * 500);
        }
    }

    async interactWithElements() {
        // Find interactive elements
        const interactiveElements = document.querySelectorAll('button, a, input, select');

        // Interact with a few random elements
        const numInteractions = Math.min(3, interactiveElements.length);
        const selectedElements = this.getRandomElements(interactiveElements, numInteractions);

        for (const element of selectedElements) {
            await this.interactWithElement(element);
        }
    }

    async interactWithElement(element) {
        try {
            // Hover over element
            element.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
            await this.delay(200);

            // Move away
            element.dispatchEvent(new MouseEvent('mouseout', { bubbles: true }));
            await this.delay(100);

        } catch (error) {
            // Ignore interaction errors
        }
    }

    getRandomElements(elements, count) {
        const array = Array.from(elements);
        const selected = [];

        for (let i = 0; i < count && array.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * array.length);
            selected.push(array[randomIndex]);
            array.splice(randomIndex, 1);
        }

        return selected;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getClickStats() {
        return {
            totalClicks: this.clickHistory.length,
            currentClicks: this.currentClicks,
            maxClicks: this.maxClicksPerSession,
            remainingClicks: this.maxClicksPerSession - this.currentClicks
        };
    }

    resetSession() {
        this.currentClicks = 0;
        this.clickHistory = [];
        console.log('🔄 Click session reset');
    }

    isSessionComplete() {
        return this.currentClicks >= this.maxClicksPerSession;
    }
}
