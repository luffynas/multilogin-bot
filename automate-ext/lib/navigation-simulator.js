/**
 * Navigation Simulator - Intelligent page navigation and browsing patterns
 */

class NavigationSimulator {
    constructor(behaviorSimulator) {
        this.behaviorSimulator = behaviorSimulator;
        this.isNavigating = false;
        this.navigationLock = false; // Thread safety lock
        this.navigationHistory = [];
        this.currentPage = null;
        
        // Memory management for navigation history
        this.maxHistorySize = 100; // Limit navigation history to prevent memory leaks
        
        this.navigationConfig = {
            intelligentLinks: true,
            backForward: true,
            tabSwitching: true,
            searchBehavior: true,
            bookmarkBehavior: true
        };
    }

    /**
     * Initialize navigation simulator
     */
    initialize() {
        this.currentPage = {
            url: window.location.href,
            title: document.title,
            timestamp: Date.now()
        };
        
        this.addToHistory(this.currentPage);
    }

    /**
     * Add page to navigation history with size limit
     */
    addToHistory(page) {
        this.navigationHistory.push(page);
        
        // Limit history size to prevent memory leaks
        if (this.navigationHistory.length > this.maxHistorySize) {
            this.navigationHistory = this.navigationHistory.slice(-this.maxHistorySize);
        }
    }

    /**
     * Simulate intelligent navigation with thread safety and cooldown
     */
    async simulateIntelligentNavigation(options = {}) {
        // Thread safety: prevent concurrent navigation
        if (this.navigationLock || this.isNavigating) {
            console.debug('Navigation already in progress, skipping...');
            return false;
        }
        
        // Acquire lock
        this.navigationLock = true;
        this.isNavigating = true;
        
        try {
            // Add cooldown to prevent over-navigation (reduced for testing)
            const now = Date.now();
            const lastNavigation = this.lastNavigationTime || 0;
            const cooldownPeriod = 60000; // Reduced from 120 to 60 seconds (1 minute) cooldown for testing
            
            if (now - lastNavigation < cooldownPeriod) {
                console.debug(`Navigation in cooldown, skipping... (${Math.round((cooldownPeriod - (now - lastNavigation)) / 1000)}s remaining)`);
                return false;
            }
            
            // Reduce navigation probability based on page time
            const pageTime = now - (this.currentPage?.timestamp || now);
            const navigationProbability = this.calculateNavigationProbability(pageTime);
            
            if (Math.random() > navigationProbability) {
                console.debug('Navigation skipped due to low probability');
                return false;
            }
        
        const personality = this.behaviorSimulator?.currentPersonality;
        const navigationType = this.chooseNavigationType(personality, options);
            
            console.log(`Navigating to: ${navigationType}`);
            
            let navigationSuccess = false;
        
        switch (navigationType) {
            case 'related_content':
                    navigationSuccess = await this.navigateRelatedContent();
                break;
            case 'category':
                    navigationSuccess = await this.navigateToCategory();
                break;
            case 'previous_next':
                    navigationSuccess = await this.navigatePreviousNext();
                break;
            case 'random':
                    navigationSuccess = await this.navigateRandomPage();
                break;
            case 'search':
                    navigationSuccess = await this.navigateSearchResults();
                break;
            case 'back':
                    navigationSuccess = await this.navigateBack();
                break;
            case 'forward':
                    navigationSuccess = await this.navigateForward();
                break;
            default:
                    navigationSuccess = await this.navigateRelatedContent();
            }
            
            // Update last navigation time only if successful
            if (navigationSuccess) {
                this.lastNavigationTime = now;
            }
            
            return navigationSuccess;
            
        } catch (error) {
            // Silent error handling for stealth
            console.warn('Navigation error:', error.message);
            return false;
        } finally {
            // Always release lock
            this.navigationLock = false;
        this.isNavigating = false;
        }
    }
    
    /**
     * Calculate navigation probability based on page time
     */
    calculateNavigationProbability(pageTime) {
        // Increased probability for testing
        const baseProbability = 0.05; // Increased from 2% to 5% base probability
        const maxProbability = 0.25;  // Increased from 8% to 25% max probability
        const timeThreshold = 180000; // Reduced from 5 to 3 minutes
        
        if (pageTime < timeThreshold) {
            return baseProbability;
        }
        
        const timeProgress = Math.min((pageTime - timeThreshold) / timeThreshold, 1);
        return baseProbability + (maxProbability - baseProbability) * timeProgress;
    }

    /**
     * Choose navigation type based on personality
     */
    chooseNavigationType(personality, options = {}) {
        const navigationTypes = [
            'related_content',
            'category', 
            'previous_next',
            'random',
            'search',
            'back',
            'forward'
        ];
        
        const weights = this.getNavigationWeights(personality);
        
        // Apply personality-based weights
        let totalWeight = 0;
        const weightedTypes = navigationTypes.map(type => {
            const weight = weights[type] || 1;
            totalWeight += weight;
            return { type, weight, cumulativeWeight: totalWeight };
        });
        
        // Random selection based on weights
        const random = Math.random() * totalWeight;
        for (const item of weightedTypes) {
            if (random <= item.cumulativeWeight) {
                return item.type;
            }
        }
        
        return 'related_content'; // Fallback
    }

    /**
     * Get navigation weights based on personality with reduced frequency
     */
    getNavigationWeights(personality) {
        // Drastically reduced base weights to prevent over-navigation
        const baseWeights = {
            related_content: 0.05,  // Reduced from 0.15 to 0.05
            category: 0.03,         // Reduced from 0.1 to 0.03
            previous_next: 0.03,    // Reduced from 0.1 to 0.03
            random: 0.02,           // Reduced from 0.05 to 0.02
            search: 0.02,           // Reduced from 0.05 to 0.02
            back: 0.01,             // Reduced from 0.02 to 0.01
            forward: 0.01           // Reduced from 0.02 to 0.01
        };
        
        if (!personality) return baseWeights;
        
        // Adjust weights based on personality type with reduced frequency
        switch (personality.type) {
            case 'explorer':
                return {
                    ...baseWeights,
                    random: 0.05,         // Reduced from 0.15 to 0.05
                    related_content: 0.08, // Reduced from 0.2 to 0.08
                    category: 0.05        // Reduced from 0.1 to 0.05
                };
            case 'researcher':
                return {
                    ...baseWeights,
                    related_content: 0.08, // Reduced from 0.25 to 0.08
                    category: 0.05,        // Reduced from 0.15 to 0.05
                    search: 0.03           // Reduced from 0.1 to 0.03
                };
            case 'casual':
                return {
                    ...baseWeights,
                    previous_next: 0.05,   // Reduced from 0.2 to 0.05
                    back: 0.03,            // Reduced from 0.1 to 0.03
                    random: 0.03           // Reduced from 0.1 to 0.03
                };
            case 'professional':
                return {
                    ...baseWeights,
                    related_content: 0.08, // Reduced from 0.2 to 0.08
                    category: 0.05,        // Reduced from 0.15 to 0.05
                    search: 0.03           // Reduced from 0.1 to 0.03
                };
            default:
                return baseWeights;
        }
    }

    /**
     * Navigate to related content
     */
    async navigateRelatedContent() {
        try {
        const links = this.findRelatedLinks();
        
        if (links.length > 0) {
            const selectedLink = this.selectBestLink(links);
            await this.clickLink(selectedLink);
        } else {
            // Fallback to category navigation
            await this.navigateToCategory();
            }
        } catch (error) {
            // Silent error handling for stealth
            console.warn('Related content navigation error:', error.message);
        }
    }

    /**
     * Find related content links
     */
    findRelatedLinks() {
        const links = [];
        const selectors = [
            'a[href*="related"]',
            'a[href*="similar"]',
            'a[href*="recommended"]',
            'a[href*="more"]',
            'a[href*="next"]',
            'a[href*="continue"]',
            'a[href*="read-more"]',
            'a[href*="full-story"]',
            '.related a',
            '.similar a',
            '.recommended a',
            '.more a',
            '.next a',
            '.read-more a',
            '.full-story a',
            '.continue-reading a',
            '.related-posts a',
            '.similar-posts a',
            '.recommended-posts a'
        ];
        
        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (this.isValidLink(element)) {
                    links.push(element);
                }
            });
        });
        
        return links;
    }

    /**
     * Find ANY valid link on the page as fallback
     */
    findAnyValidLink() {
        console.log('🧭 Searching for ANY valid link on page...');
        const allLinks = document.querySelectorAll('a[href]');
        console.log(`🧭 Total links found: ${allLinks.length}`);
        
        const validLinks = [];
        allLinks.forEach(link => {
            if (this.isValidLink(link)) {
                console.log(`🧭 Valid link found: ${link.href} (text: "${link.textContent.trim()}")`);
                validLinks.push(link);
            }
        });
        
        console.log(`🧭 Total valid links: ${validLinks.length}`);
        return validLinks;
    }

    /**
     * Navigate to category page
     */
    async navigateToCategory() {
        try {
            console.log('🧭 Searching for category links...');
        const categoryLinks = this.findCategoryLinks();
            console.log(`🧭 Found ${categoryLinks.length} category links`);
        
        if (categoryLinks.length > 0) {
            const selectedLink = this.selectBestLink(categoryLinks);
                console.log(`🧭 Selected category link: ${selectedLink.href}`);
                const success = await this.clickLink(selectedLink);
                console.log(`🧭 Category link click ${success ? 'successful' : 'failed'}`);
        } else {
                console.log('🧭 No category links found, trying random navigation...');
            // Fallback to random navigation
            await this.navigateRandomPage();
            }
        } catch (error) {
            // Silent error handling for stealth
            console.warn('🧭 Category navigation error:', error.message);
        }
    }

    /**
     * Find category links
     */
    findCategoryLinks() {
        const links = [];
        const selectors = [
            'a[href*="category"]',
            'a[href*="cat"]',
            'a[href*="tag"]',
            'a[href*="section"]',
            'a[href*="topic"]',
            'a[href*="subject"]',
            'a[href*="department"]',
            'a[href*="genre"]',
            'nav a',
            '.category a',
            '.categories a',
            '.tag a',
            '.tags a',
            '.section a',
            '.sections a',
            '.topic a',
            '.topics a',
            '.subject a',
            '.subjects a',
            '.navigation a',
            '.menu a',
            '.main-menu a',
            '.primary-menu a',
            '.secondary-menu a',
            '.sidebar-menu a',
            '.footer-menu a',
            'ul.menu a',
            '.categories-menu a',
            '.tag-cloud a'
        ];
        
        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (this.isValidLink(element)) {
                    links.push(element);
                }
            });
        });
        
        return links;
    }

    /**
     * Navigate to previous/next page
     */
    async navigatePreviousNext() {
        try {
        const prevNextLinks = this.findPreviousNextLinks();
        
        if (prevNextLinks.length > 0) {
                // Prefer next over previous (more natural behavior)
                const nextLinks = prevNextLinks.filter(link => {
                    const text = link.textContent.toLowerCase();
                    const href = link.href.toLowerCase();
                    return text.includes('next') || 
                           text.includes('newer') || 
                           href.includes('next') || 
                           text.includes('→') || 
                           text.includes('›') ||
                           text.includes('>');
                });
                
                let selectedLink;
                if (nextLinks.length > 0) {
                    // Prefer next links
                    selectedLink = this.selectBestLink(nextLinks);
        } else {
                    // Fallback to any navigation link
                    selectedLink = this.selectBestLink(prevNextLinks);
                }
                
                if (selectedLink) {
                    await this.clickLink(selectedLink);
                    return true;
                }
            }
            
            // Fallback to back navigation
            await this.navigateBack();
            return false;
        } catch (error) {
            // Silent error handling for stealth
            console.warn('Previous/Next navigation error:', error.message);
            return false;
        }
    }

    /**
     * Find previous/next links
     */
    findPreviousNextLinks() {
        const links = [];
        const selectors = [
            // Standard pagination selectors
            'a[rel="prev"]',
            'a[rel="next"]',
            'a[href*="prev"]',
            'a[href*="next"]',
            'a[href*="previous"]',
            'a[href*="page"]',
            'a[href*="p="]',
            
            // CSS class selectors
            '.prev a',
            '.next a',
            '.previous a',
            '.pagination a',
            '.nav-prev a',
            '.nav-next a',
            '.nav-previous a',
            '.pagination-prev a',
            '.pagination-next a',
            '.post-navigation a',
            '.article-navigation a',
            '.content-navigation a',
            
            // WordPress specific
            '.nav-previous a',
            '.nav-next a',
            '.post-navigation a',
            '.navigation a',
            
            // Bootstrap and other frameworks
            '.pagination .prev a',
            '.pagination .next a',
            '.pagination .previous a',
            '.pagination .page-item a',
            
            // Custom selectors
            '[data-nav="prev"] a',
            '[data-nav="next"] a',
            '.navigation-prev a',
            '.navigation-next a',
            
            // Text-based detection
            'a:contains("Previous")',
            'a:contains("Next")',
            'a:contains("Older")',
            'a:contains("Newer")',
            'a:contains("←")',
            'a:contains("→")',
            'a:contains("‹")',
            'a:contains("›")'
        ];
        
        selectors.forEach(selector => {
            try {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (this.isValidLink(element)) {
                    links.push(element);
                }
            });
            } catch (error) {
                // Silent error handling for stealth
            }
        });
        
        // Additional text-based detection for links containing navigation keywords
        const allLinks = document.querySelectorAll('a[href]');
        const navigationKeywords = ['previous', 'next', 'older', 'newer', 'prev', 'next'];
        const navigationSymbols = ['←', '→', '‹', '›', '<', '>'];
        
        allLinks.forEach(link => {
            if (this.isValidLink(link)) {
                const text = link.textContent.toLowerCase().trim();
                const href = link.href.toLowerCase();
                
                // Check for navigation keywords in text or href
                const hasKeyword = navigationKeywords.some(keyword => 
                    text.includes(keyword) || href.includes(keyword)
                );
                
                // Check for navigation symbols
                const hasSymbol = navigationSymbols.some(symbol => 
                    link.textContent.includes(symbol)
                );
                
                if (hasKeyword || hasSymbol) {
                    links.push(link);
                }
            }
        });
        
        return links;
    }

    /**
     * Navigate to random page
     */
    async navigateRandomPage() {
        try {
            console.log('🧭 Searching for random links...');
            const randomLinks = this.findAnyValidLink();
            
            if (randomLinks.length > 0) {
                const selectedLink = randomLinks[Math.floor(Math.random() * randomLinks.length)];
                console.log(`🧭 Selected random link: ${selectedLink.href}`);
                const success = await this.clickLink(selectedLink);
                console.log(`🧭 Random link click ${success ? 'successful' : 'failed'}`);
        } else {
                console.log('🧭 No valid links found anywhere on page!');
            }
        } catch (error) {
            console.warn('🧭 Random navigation error:', error.message);
        }
    }

    /**
     * Navigate to legal/info page
     */
    async navigateToLegalPage() {
        const legalLinks = this.findLegalLinks();
        
        if (legalLinks.length > 0) {
            const selectedLink = this.selectBestLink(legalLinks);
            await this.clickLink(selectedLink);
        } else {
            // Fallback to random navigation
            await this.navigateRandomPage();
        }
    }

    /**
     * Find legal/info page links
     */
    findLegalLinks() {
        const links = [];
        const selectors = [
            'a[href*="about"]',
            'a[href*="contact"]',
            'a[href*="privacy"]',
            'a[href*="terms"]',
            'a[href*="disclaimer"]',
            'a[href*="faq"]',
            'a[href*="help"]',
            'a[href*="support"]',
            'a[href*="legal"]',
            'a[href*="policy"]',
            'a[href*="cookies"]',
            'a[href*="sitemap"]',
            '.about a',
            '.contact a',
            '.privacy a',
            '.terms a',
            '.legal a',
            '.footer a',
            '.footer-links a',
            '.legal-links a',
            '.info-links a'
        ];
        
        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (this.isValidLink(element)) {
                    links.push(element);
                }
            });
        });
        
        return links;
    }

    /**
     * Navigate to search results
     */
    async navigateSearchResults() {
        const searchBox = this.findSearchBox();
        
        if (searchBox) {
            const searchQuery = this.generateSearchQuery();
            await this.performSearch(searchBox, searchQuery);
        } else {
            // Fallback to random navigation
            await this.navigateRandomPage();
        }
    }

    /**
     * Navigate back
     */
    async navigateBack() {
        if (window.history.length > 1) {
            window.history.back();
            await this.delay(1000);
        } else {
            // Fallback to random navigation
            await this.navigateRandomPage();
        }
    }

    /**
     * Navigate forward
     */
    async navigateForward() {
        if (window.history.length > 1) {
            window.history.forward();
            await this.delay(1000);
        } else {
            // Fallback to random navigation
            await this.navigateRandomPage();
        }
    }

    /**
     * Find all valid links on page
     */
    findAllValidLinks() {
        const links = [];
        const elements = document.querySelectorAll('a[href]');
        
        elements.forEach(element => {
            if (this.isValidLink(element)) {
                links.push(element);
            }
        });
        
        return links;
    }

    /**
     * Check if link is valid for navigation
     */
    isValidLink(element) {
        const href = element.href;
        
        // Skip invalid URLs
        if (!href || href === '#' || href === 'javascript:void(0)') {
            return false;
        }
        
        // Skip external links (optional)
        if (href.startsWith('http') && !href.includes(window.location.hostname)) {
            return false;
        }
        
        // Skip anchor links
        if (href.startsWith('#')) {
            return false;
        }
        
        // Check if element is visible
        const rect = element.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
            return false;
        }
        
        // Check if element is clickable
        const style = window.getComputedStyle(element);
        if (style.display === 'none' || style.visibility === 'hidden') {
            return false;
        }
        
        return true;
    }

    /**
     * Select best link from options
     */
    selectBestLink(links) {
        try {
        if (links.length === 0) return null;
        
        // Score links based on various factors
        const scoredLinks = links.map(link => ({
            element: link,
            score: this.scoreLink(link)
        }));
        
        // Sort by score (highest first)
        scoredLinks.sort((a, b) => b.score - a.score);
        
        // Return top link or random from top 3
        const topLinks = scoredLinks.slice(0, Math.min(3, scoredLinks.length));
        return topLinks[Math.floor(Math.random() * topLinks.length)].element;
        } catch (error) {
            // Silent error handling for stealth
            console.warn('Link selection error:', error.message);
            return links.length > 0 ? links[0] : null;
        }
    }

    /**
     * Score link based on various factors
     */
    scoreLink(link) {
        try {
        const rect = link.getBoundingClientRect();
            const text = link.textContent.trim();
            const href = link.href;
        
            let score = 0;
            
            // Size factor (larger links are better)
        const area = rect.width * rect.height;
            score += area * 0.1;
            
            // Position factor (more centered links are better)
            const centerDistance = Math.abs(rect.top + rect.height / 2 - window.innerHeight / 2);
            score += (1000 / (1 + centerDistance)) * 10;
            
            // Text length factor (meaningful text is better)
            score += text.length * 2;
            
            // URL quality factor
            if (href.includes('article') || href.includes('post') || href.includes('blog')) {
                score += 50;
            }
            
            // Text quality factor
            const qualityKeywords = ['read', 'more', 'continue', 'full', 'story', 'article', 'post'];
            const hasQualityKeyword = qualityKeywords.some(keyword => 
                text.toLowerCase().includes(keyword)
            );
            if (hasQualityKeyword) {
                score += 30;
            }
            
            return score;
        } catch (error) {
            return 0;
        }
    }

    /**
     * Extract keywords from text
     */
    extractKeywords(text) {
        // Simple keyword extraction
        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 3)
            .filter(word => !this.isCommonWord(word));
        
        // Count frequency
        const wordCount = {};
        words.forEach(word => {
            wordCount[word] = (wordCount[word] || 0) + 1;
        });
        
        // Sort by frequency
        const sortedWords = Object.entries(wordCount)
            .sort(([,a], [,b]) => b - a)
            .map(([word]) => word);
        
        return sortedWords.slice(0, 10);
    }

    /**
     * Check if word is common
     */
    isCommonWord(word) {
        const commonWords = [
            'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
            'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before',
            'after', 'above', 'below', 'between', 'among', 'within', 'without',
            'this', 'that', 'these', 'those', 'is', 'are', 'was', 'were', 'be',
            'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
            'would', 'could', 'should', 'may', 'might', 'can', 'must', 'shall'
        ];
        
        return commonWords.includes(word);
    }

    /**
     * Get random topic for search
     */
    getRandomTopic() {
        const topics = [
            'news', 'technology', 'science', 'health', 'business', 'entertainment',
            'sports', 'politics', 'education', 'travel', 'food', 'fashion',
            'lifestyle', 'finance', 'automotive', 'real estate', 'fitness',
            'cooking', 'gaming', 'music', 'movies', 'books', 'art', 'design'
        ];
        
        return topics[Math.floor(Math.random() * topics.length)];
    }

    /**
     * Perform search
     */
    async performSearch(searchBox, query) {
        // Focus search box
        searchBox.focus();
        
        // Type search query
        await this.behaviorSimulator.simulateRealisticTyping(query, searchBox);
        
        // Submit search
        const form = searchBox.closest('form');
        if (form) {
            form.submit();
        } else {
            // Simulate Enter key
            const enterEvent = new KeyboardEvent('keydown', {
                key: 'Enter',
                code: 'Enter',
                bubbles: true,
                cancelable: true
            });
            
            searchBox.dispatchEvent(enterEvent);
        }
        
        await this.delay(1000);
    }

    /**
     * Simulate tab switching
     */
    async simulateTabSwitching() {
        const personality = this.behaviorSimulator?.currentPersonality;
        
        if (personality?.tabSwitching === 'frequent') {
            // Simulate opening new tab
            await this.openNewTab();
        } else if (personality?.tabSwitching === 'rare') {
            // Stay on current tab
            return;
        } else {
            // Occasional tab switching
            if (Math.random() < 0.3) {
                await this.openNewTab();
            }
        }
    }

    /**
     * Open new tab
     */
    async openNewTab() {
        // Simulate Ctrl+T (or Cmd+T on Mac)
        const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
        const metaKey = isMac ? 'meta' : 'ctrl';
        
        const keyEvent = new KeyboardEvent('keydown', {
            key: 't',
            code: 'KeyT',
            [metaKey + 'Key']: true,
            bubbles: true,
            cancelable: true
        });
        
        document.dispatchEvent(keyEvent);
        
        await this.delay(500);
    }

    /**
     * Simulate bookmark creation
     */
    async simulateBookmarkCreation() {
        const personality = this.behaviorSimulator?.currentPersonality;
        
        if (personality?.type === 'professional') {
            // Simulate Ctrl+D (or Cmd+D on Mac)
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const metaKey = isMac ? 'meta' : 'ctrl';
            
            const keyEvent = new KeyboardEvent('keydown', {
                key: 'd',
                code: 'KeyD',
                [metaKey + 'Key']: true,
                bubbles: true,
                cancelable: true
            });
            
            document.dispatchEvent(keyEvent);
            
            await this.delay(1000);
        }
    }

    /**
     * Get navigation history
     */
    getNavigationHistory() {
        return [...this.navigationHistory];
    }

    /**
     * Get current page info
     */
    getCurrentPage() {
        return { ...this.currentPage };
    }

    /**
     * Check if current page is a category/listing page
     */
    isCategoryPage() {
        const currentUrl = window.location.href.toLowerCase();
        const pageTitle = document.title.toLowerCase();
        
        // Common indicators of category/listing pages
        const categoryIndicators = [
            // URL patterns
            '/category/',
            '/tag/',
            '/blog/',
            '/news/',
            '/articles/',
            '/posts/',
            '/listing/',
            '/search',
            '?cat=',
            '?category=',
            '?tag=',
            '?section=',
            
            // Page title patterns
            'category:',
            'tag:',
            'blog',
            'news',
            'articles',
            'posts',
            'listing',
            'search results',
            'archives',
            'all posts'
        ];
        
        // Check URL patterns
        for (const indicator of categoryIndicators) {
            if (currentUrl.includes(indicator)) {
                console.log(`Category detected via URL: ${indicator}`);
                return true;
            }
        }
        
        // Check title patterns
        for (const indicator of categoryIndicators) {
            if (pageTitle.includes(indicator)) {
                console.log(`Category detected via title: ${indicator}`);
                return true;
            }
        }
        
        // Check for multiple article links (common in category pages)
        const articleSelectors = [
            'article a',
            '.post a',
            '.entry a',
            '.article a',
            '.blog-post a',
            '.news-item a',
            '.listing-item a'
        ];
        
        let articleLinkCount = 0;
        articleSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            articleLinkCount += elements.length;
        });
        
        if (articleLinkCount >= 3) {
            console.log(`Category detected via article count: ${articleLinkCount} articles`);
            return true;
        }
        
        return false;
    }

    /**
     * Select random article from category page
     */
    selectRandomArticle() {
        const articleSelectors = [
            'article a',
            '.post a',
            '.entry a',
            '.article a',
            '.blog-post a',
            '.news-item a',
            '.listing-item a',
            '.item a',
            '.content a',
            '.main-content a'
        ];
        
        const articleLinks = [];
        
        articleSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (this.isValidLink(element) && this.isArticleLink(element)) {
                    articleLinks.push(element);
                }
            });
        });
        
        if (articleLinks.length > 0) {
            return articleLinks[Math.floor(Math.random() * articleLinks.length)];
        }
        
        return null;
    }

    /**
     * Check if link is an article link
     */
    isArticleLink(link) {
        const href = link.href.toLowerCase();
        const text = link.textContent.toLowerCase();
        
        // Article URL patterns
        const articlePatterns = [
            '/article/',
            '/post/',
            '/entry/',
            '/blog/',
            '/news/',
            '/story/',
            '/read/',
            '/view/',
            '.html',
            '.php',
            '?p=',
            '?post=',
            '?article='
        ];
        
        // Article text patterns
        const articleTextPatterns = [
            'read more',
            'continue reading',
            'full story',
            'read full',
            'view article',
            'read article',
            'read post'
        ];
        
        // Check URL patterns
        for (const pattern of articlePatterns) {
            if (href.includes(pattern)) {
                return true;
            }
        }
        
        // Check text patterns
        for (const pattern of articleTextPatterns) {
            if (text.includes(pattern)) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * Find internal links (same domain)
     */
    findInternalLinks() {
        const links = [];
        const currentDomain = window.location.hostname;
        
        const allLinks = document.querySelectorAll('a[href]');
        
        allLinks.forEach(link => {
            if (this.isValidLink(link)) {
                const href = link.href;
                const linkDomain = new URL(href).hostname;
                
                // Check if it's same domain or relative link
                if (linkDomain === currentDomain || href.startsWith('/') || href.startsWith('./') || href.startsWith('../')) {
                    links.push(link);
                }
            }
        });
        
        return links;
    }

    /**
     * Get navigation maturity summary
     */
    getNavigationMaturitySummary() {
        return {
            features: {
                intelligentNavigation: true,
                personalityBasedWeights: true,
                categoryDetection: true,
                articleSelection: true,
                legalPageNavigation: true,
                searchBehavior: true,
                backForwardNavigation: true,
                tabSwitching: true,
                bookmarkBehavior: true,
                linkValidation: true,
                fallbackMechanisms: true
            },
            navigationTypes: {
                relatedContent: 'Find and navigate to related content',
                category: 'Navigate to category pages',
                legal: 'Navigate to legal/info pages',
                previousNext: 'Use pagination navigation',
                random: 'Random page navigation with article detection',
                search: 'Search behavior simulation',
                back: 'Browser back navigation',
                forward: 'Browser forward navigation'
            },
            selectors: {
                related: 18, // Number of related content selectors
                category: 25, // Number of category selectors
                legal: 20, // Number of legal page selectors
                article: 10, // Number of article selectors
                pagination: 35 // Enhanced pagination selectors (increased from 9)
            },
            maturity: 'Advanced',
            comparison: 'Matches Python Selenium implementation'
        };
    }

    /**
     * Click link with natural behavior simulation
     */
    async clickLink(element) {
        if (!element || !this.isValidLink(element)) {
            return false;
        }

        try {
            // Use behavior simulator if available
            if (this.behaviorSimulator && typeof this.behaviorSimulator.simulateNaturalClick === 'function') {
                return await this.behaviorSimulator.simulateNaturalClick(element);
            }

            // Fallback to direct click
            const rect = element.getBoundingClientRect();
            const clickX = rect.left + rect.width / 2;
            const clickY = rect.top + rect.height / 2;

            // Simulate mouse movement
            await this.simulateMouseMovement(clickX, clickY, 800);

            // Click delay
            await this.delay(200 + Math.random() * 300);

            // Perform click
            const clickEvent = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true,
                clientX: clickX,
                clientY: clickY
            });

            element.dispatchEvent(clickEvent);

            // Record navigation
            this.recordNavigation(element.href, 'click');

            return true;
        } catch (error) {
            console.warn('Link click failed:', error.message);
            return false;
        }
    }

    /**
     * Simulate mouse movement to coordinates
     */
    async simulateMouseMovement(targetX, targetY, duration = 800) {
        try {
            // Simple mouse movement simulation
            const startX = 0;
            const startY = 0;
            const steps = 10;
            const stepDelay = duration / steps;

            for (let i = 0; i <= steps; i++) {
                const progress = i / steps;
                const currentX = startX + (targetX - startX) * progress;
                const currentY = startY + (targetY - startY) * progress;

                // Dispatch mousemove event
                const moveEvent = new MouseEvent('mousemove', {
                    view: window,
                    bubbles: true,
                    cancelable: true,
                    clientX: currentX,
                    clientY: currentY
                });

                document.dispatchEvent(moveEvent);
                await this.delay(stepDelay);
            }
        } catch (error) {
            // Silent error handling
        }
    }

    /**
     * Record navigation action
     */
    recordNavigation(url, method) {
        this.addToHistory({
            url: url,
            method: method,
            timestamp: Date.now(),
            deviceType: this.detectDeviceType()
        });
    }

    /**
     * Detect device type
     */
    detectDeviceType() {
        const userAgent = navigator.userAgent.toLowerCase();
        const isMobile = /android|iphone|ipad|ipod|blackberry|windows phone/i.test(userAgent);
        const isTablet = /ipad|android(?=.*\b(?!.*mobile))/i.test(userAgent);
        
        if (isTablet) return 'tablet';
        if (isMobile) return 'mobile';
        return 'desktop';
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
}

// Export for use in other modules with enhanced stealth protection
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationSimulator;
} else if (typeof window !== 'undefined' && !window.NavigationSimulator) {
    window.NavigationSimulator = NavigationSimulator;
}
