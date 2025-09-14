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
            bookmarkBehavior: true,
            highlightNavigation: true // Enable/disable URL highlighting
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
        
        // Initialize highlight styles if enabled
        if (this.navigationConfig.highlightNavigation) {
            this.initializeHighlightStyles();
        }
    }
    
    /**
     * Initialize highlight styles
     */
    initializeHighlightStyles() {
        // Create or update highlight styles
        let styleElement = document.getElementById('navigation-highlight-styles');
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = 'navigation-highlight-styles';
            document.head.appendChild(styleElement);
        }
        
        styleElement.textContent = `
            .navigation-highlight {
                background-color: #ffeb3b !important;
                border: 2px solid #ff9800 !important;
                box-shadow: 0 0 10px rgba(255, 152, 0, 0.5) !important;
                animation: navigation-pulse 1s ease-in-out infinite alternate !important;
                position: relative !important;
                z-index: 9999 !important;
            }
            
            .navigation-highlight::before {
                content: "🚀 NAVIGATION TARGET" !important;
                position: absolute !important;
                top: -25px !important;
                left: 0 !important;
                background: #ff9800 !important;
                color: white !important;
                padding: 2px 6px !important;
                font-size: 10px !important;
                font-weight: bold !important;
                border-radius: 3px !important;
                white-space: nowrap !important;
                z-index: 10000 !important;
            }
            
            @keyframes navigation-pulse {
                0% { 
                    background-color: #ffeb3b !important;
                    box-shadow: 0 0 10px rgba(255, 152, 0, 0.5) !important;
                }
                100% { 
                    background-color: #ffc107 !important;
                    box-shadow: 0 0 15px rgba(255, 152, 0, 0.8) !important;
                }
            }
            
            .navigation-highlight-removed {
                transition: all 0.3s ease-out !important;
                background-color: transparent !important;
                border: none !important;
                box-shadow: none !important;
                animation: none !important;
            }
        `;
    }
    
    /**
     * Highlight navigation URLs
     */
    highlightNavigationUrls(urls) {
        if (!this.navigationConfig.highlightNavigation) {
            return;
        }
        
        // Remove existing highlights first
        this.removeAllHighlights();
        
        urls.forEach(url => {
            try {
                // Find all links with this URL
                const links = document.querySelectorAll(`a[href="${url}"], a[href*="${url}"]`);
                links.forEach(link => {
                    link.classList.add('navigation-highlight');
                });
                
                // Also highlight elements that might contain this URL
                const elements = document.querySelectorAll(`[href*="${url}"], [data-href*="${url}"], [onclick*="${url}"]`);
                elements.forEach(element => {
                    element.classList.add('navigation-highlight');
                });
            } catch (error) {
                console.warn('Error highlighting URL:', url, error);
            }
        });
        
        console.log(`🎯 Highlighted ${urls.length} navigation URLs`);
    }
    
    /**
     * Remove all highlights
     */
    removeAllHighlights() {
        const highlightedElements = document.querySelectorAll('.navigation-highlight');
        highlightedElements.forEach(element => {
            element.classList.remove('navigation-highlight');
            element.classList.add('navigation-highlight-removed');
            
            // Remove the transition class after animation
            setTimeout(() => {
                element.classList.remove('navigation-highlight-removed');
            }, 300);
        });
    }
    
    /**
     * Highlight specific element
     */
    highlightElement(element) {
        if (!this.navigationConfig.highlightNavigation) {
            return;
        }
        
        if (element && element.classList) {
            element.classList.add('navigation-highlight');
        }
    }
    
    /**
     * Remove highlight from specific element
     */
    removeHighlight(element) {
        if (element && element.classList) {
            element.classList.remove('navigation-highlight');
            element.classList.add('navigation-highlight-removed');
            
            // Remove the transition class after animation
            setTimeout(() => {
                element.classList.remove('navigation-highlight-removed');
            }, 300);
        }
    }
    
    /**
     * Enable/disable highlight feature
     */
    setHighlightNavigation(enabled) {
        this.navigationConfig.highlightNavigation = enabled;
        
        if (enabled) {
            this.initializeHighlightStyles();
            console.log('🎯 Navigation highlighting enabled');
        } else {
            this.removeAllHighlights();
            console.log('🎯 Navigation highlighting disabled');
        }
    }
    
    /**
     * Get highlight setting
     */
    isHighlightEnabled() {
        return this.navigationConfig.highlightNavigation;
    }
    
    /**
     * Preview all navigation URLs that would be highlighted
     */
    previewNavigationUrls() {
        if (!this.navigationConfig.highlightNavigation) {
            console.log('🎯 Highlight feature is disabled. Enable it first with setHighlightNavigation(true)');
            return;
        }
        
        const allUrls = [];
        
        // Get all possible navigation URLs
        const relatedLinks = this.findRelatedLinks();
        const categoryLinks = this.findCategoryLinks();
        const nextLinks = this.findNextPageLinks();
        const prevLinks = this.findPreviousPageLinks();
        const recentPostsLinks = this.findRecentPostsLinks();
        const tagsLinks = this.findTagsLinks();
        const legalLinks = this.findLegalLinks();
        const randomLinks = this.findAnyValidLink();
        
        // Collect all URLs
        [...relatedLinks, ...categoryLinks, ...nextLinks, ...prevLinks, ...recentPostsLinks, ...tagsLinks, ...legalLinks, ...randomLinks].forEach(link => {
            if (link && link.href && !allUrls.includes(link.href)) {
                allUrls.push(link.href);
            }
        });
        
        console.log(`🎯 Found ${allUrls.length} navigation URLs:`);
        allUrls.forEach((url, index) => {
            console.log(`  ${index + 1}. ${url}`);
        });
        
        // Highlight all URLs
        this.highlightNavigationUrls(allUrls);
        
        return allUrls;
    }
    
    /**
     * Clear all highlights
     */
    clearHighlights() {
        this.removeAllHighlights();
        console.log('🎯 All highlights cleared');
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
            // Add variable cooldown to prevent over-navigation
            const now = Date.now();
            const lastNavigation = this.lastNavigationTime || 0;
            const baseCooldownPeriod = 45000; // 45 seconds base
            const cooldownVariation = Math.random() * 30000; // 0-30 seconds variation
            const cooldownPeriod = baseCooldownPeriod + cooldownVariation; // 45-75 seconds variable
            
            if (now - lastNavigation < cooldownPeriod) {
                if (this.behaviorSimulator?.behaviorConfig?.debugMode) {
                    console.debug(`Navigation in cooldown, skipping... (${Math.round((cooldownPeriod - (now - lastNavigation)) / 1000)}s remaining)`);
                }
                return false;
            }
            
            // Reduce navigation probability based on page time
            const pageTime = now - (this.currentPage?.timestamp || now);
            const navigationProbability = this.calculateNavigationProbability(pageTime);
            
            if (Math.random() > navigationProbability) {
                if (this.behaviorSimulator?.behaviorConfig?.debugMode) {
                    console.debug('Navigation skipped due to low probability');
                }
                return false;
            }
        
        const personality = this.behaviorSimulator?.currentPersonality;
        const navigationType = this.chooseNavigationType(personality, options);
            
            if (this.behaviorSimulator?.behaviorConfig?.debugMode) {
                console.log(`Navigating to: ${navigationType}`);
            }
            
            let navigationSuccess = false;
        
        switch (navigationType) {
            case 'related_content':
                    navigationSuccess = await this.navigateRelatedContent();
                break;
            case 'category':
                    navigationSuccess = await this.navigateToCategory();
                break;
            case 'next_page':
                    navigationSuccess = await this.navigateToNextPage();
                break;
            case 'previous_page':
                    navigationSuccess = await this.navigateToPreviousPage();
                break;
            case 'previous_next':
                    navigationSuccess = await this.navigatePreviousNext();
                break;
            case 'recent_posts':
                    navigationSuccess = await this.navigateToRecentPosts();
                break;
            case 'tags':
                    navigationSuccess = await this.navigateToTags();
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
     * Simulate previous post navigation for testing
     */
    async simulatePreviousNavigation() {
        try {
            console.log('🧪 Testing previous post navigation...');
            
            // Look for previous post links
            const previousSelectors = [
                'a[rel="prev"]',
                '.prev-post',
                '.previous-post',
                '.nav-previous',
                '.pagination-prev',
                '.post-navigation .prev',
                'a:contains("Previous")',
                'a:contains("Prev")',
                'a:contains("←")',
                'a:contains("&larr;")'
            ];
            
            let previousLink = null;
            for (const selector of previousSelectors) {
                try {
                    if (selector.includes(':contains')) {
                        // Handle text-based selectors
                        const links = document.querySelectorAll('a');
                        for (const link of links) {
                            if (link.textContent.toLowerCase().includes('previous') || 
                                link.textContent.toLowerCase().includes('prev') ||
                                link.textContent.includes('←')) {
                                previousLink = link;
                                break;
                            }
                        }
                    } else {
                        previousLink = document.querySelector(selector);
                    }
                    if (previousLink) break;
                } catch (e) {
                    continue;
                }
            }
            
            if (previousLink) {
                const href = previousLink.href;
                const title = previousLink.textContent.trim();
                
                console.log(`✅ Found previous post link: ${title} -> ${href}`);
                console.log(`🚀 Navigating to previous post...`);
                
                // Simulate click with human-like behavior and navigate
                await this.simulateHumanClick(previousLink);
                
                return {
                    success: true,
                    linkFound: true,
                    href: href,
                    title: title,
                    method: 'navigation',
                    navigating: true
                };
            } else {
                console.log('⚠️ No previous post link found');
                return {
                    success: false,
                    linkFound: false,
                    message: 'No previous post link found on page'
                };
            }
            
        } catch (error) {
            console.error('❌ Error in previous navigation test:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Simulate next post navigation for testing
     */
    async simulateNextNavigation() {
        try {
            console.log('🧪 Testing next post navigation...');
            
            // Look for next post links
            const nextSelectors = [
                'a[rel="next"]',
                '.next-post',
                '.next-post',
                '.nav-next',
                '.pagination-next',
                '.post-navigation .next',
                'a:contains("Next")',
                'a:contains("→")',
                'a:contains("&rarr;")'
            ];
            
            let nextLink = null;
            for (const selector of nextSelectors) {
                try {
                    if (selector.includes(':contains')) {
                        // Handle text-based selectors
                        const links = document.querySelectorAll('a');
                        for (const link of links) {
                            if (link.textContent.toLowerCase().includes('next') ||
                                link.textContent.includes('→')) {
                                nextLink = link;
                                break;
                            }
                        }
                    } else {
                        nextLink = document.querySelector(selector);
                    }
                    if (nextLink) break;
                } catch (e) {
                    continue;
                }
            }
            
            if (nextLink) {
                const href = nextLink.href;
                const title = nextLink.textContent.trim();
                
                console.log(`✅ Found next post link: ${title} -> ${href}`);
                console.log(`🚀 Navigating to next post...`);
                
                // Simulate click with human-like behavior and navigate
                await this.simulateHumanClick(nextLink);
                
                return {
                    success: true,
                    linkFound: true,
                    href: href,
                    title: title,
                    method: 'navigation',
                    navigating: true
                };
            } else {
                console.log('⚠️ No next post link found');
                return {
                    success: false,
                    linkFound: false,
                    message: 'No next post link found on page'
                };
            }
            
        } catch (error) {
            console.error('❌ Error in next navigation test:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Simulate human-like click behavior and navigate
     */
    async simulateHumanClick(element) {
        try {
            // Add visual feedback
            element.style.transition = 'all 0.2s ease';
            element.style.transform = 'scale(0.95)';
            element.style.opacity = '0.8';
            
            // Wait a bit
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Restore original state
            element.style.transform = 'scale(1)';
            element.style.opacity = '1';
            
            // Wait a bit more before actual click
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Perform actual navigation
            console.log('🎯 Navigating to:', element.href);
            
            // Use window.location for navigation
            window.location.href = element.href;
            
        } catch (error) {
            console.warn('Error in human click simulation:', error);
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
        // const navigationTypes = [
        //     'related_content',
        //     'category', 
        //     'next_page',
        //     'previous_page',
        //     'previous_next',
        //     'recent_posts',
        //     'tags',
        //     'random',
        //     'search',
        //     'back',
        //     'forward'
        // ];
        const navigationTypes = [
            'related_content',
            // 'category', 
            'next_page',
            'previous_page',
            'previous_next',
            'recent_posts',
            'tags',
            // 'random',
            // 'search',
            // 'back',
            // 'forward'
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
            next_page: 0.04,        // New: optimized next page navigation
            previous_page: 0.02,    // New: optimized previous page navigation
            previous_next: 0.03,    // Reduced from 0.1 to 0.03 (legacy)
            recent_posts: 0.03,     // New: recent posts navigation
            tags: 0.02,             // New: tags navigation
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
                    category: 0.05,        // Reduced from 0.1 to 0.05
                    next_page: 0.06,       // New: explorers like to go forward
                    recent_posts: 0.05,    // New: explorers like recent content
                    tags: 0.04             // New: explorers like to explore topics
                };
            case 'researcher':
                return {
                    ...baseWeights,
                    related_content: 0.08, // Reduced from 0.25 to 0.08
                    category: 0.05,        // Reduced from 0.15 to 0.05
                    search: 0.03,          // Reduced from 0.1 to 0.03
                    next_page: 0.05,       // New: researchers follow content sequences
                    previous_page: 0.03,   // New: researchers also go back to review
                    recent_posts: 0.04,    // New: researchers check recent content
                    tags: 0.03             // New: researchers explore topics
                };
            case 'casual':
                return {
                    ...baseWeights,
                    next_page: 0.06,       // New: casual users prefer next page
                    previous_next: 0.05,   // Reduced from 0.2 to 0.05 (legacy)
                    back: 0.03,            // Reduced from 0.1 to 0.03
                    random: 0.03,          // Reduced from 0.1 to 0.03
                    recent_posts: 0.04,    // New: casual users like recent content
                    tags: 0.02             // New: casual users occasionally explore tags
                };
            case 'professional':
                return {
                    ...baseWeights,
                    related_content: 0.08, // Reduced from 0.2 to 0.08
                    category: 0.05,        // Reduced from 0.15 to 0.05
                    search: 0.03,          // Reduced from 0.1 to 0.03
                    next_page: 0.05,       // New: professionals follow structured content
                    previous_page: 0.02,   // New: minimal back navigation
                    recent_posts: 0.03,    // New: professionals check recent content
                    tags: 0.02             // New: professionals occasionally explore topics
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
     * Navigate to recent posts
     */
    async navigateToRecentPosts() {
        try {
            console.log('🧭 Searching for recent posts links...');
            const recentPostsLinks = this.findRecentPostsLinks();
            console.log(`🧭 Found ${recentPostsLinks.length} recent posts links`);
            
            if (recentPostsLinks.length > 0) {
                const selectedLink = this.selectBestLink(recentPostsLinks);
                console.log(`🧭 Selected recent post link: ${selectedLink.href}`);
                const success = await this.clickLink(selectedLink);
                console.log(`🧭 Recent post link click ${success ? 'successful' : 'failed'}`);
            } else {
                console.log('🧭 No recent posts links found, trying random navigation...');
                // Fallback to random navigation
                await this.navigateRandomPage();
            }
        } catch (error) {
            // Silent error handling for stealth
            console.warn('🧭 Recent posts navigation error:', error.message);
        }
    }

    /**
     * Navigate to tags
     */
    async navigateToTags() {
        try {
            console.log('🧭 Searching for tags links...');
            const tagsLinks = this.findTagsLinks();
            console.log(`🧭 Found ${tagsLinks.length} tags links`);
            
            if (tagsLinks.length > 0) {
                const selectedLink = this.selectBestLink(tagsLinks);
                console.log(`🧭 Selected tag link: ${selectedLink.href}`);
                const success = await this.clickLink(selectedLink);
                console.log(`🧭 Tag link click ${success ? 'successful' : 'failed'}`);
            } else {
                console.log('🧭 No tags links found, trying random navigation...');
                // Fallback to random navigation
                await this.navigateRandomPage();
            }
        } catch (error) {
            // Silent error handling for stealth
            console.warn('🧭 Tags navigation error:', error.message);
        }
    }

    /**
     * Find category links
     */
    findCategoryLinks() {
        const links = [];
        const selectors = [
            // WordPress-specific selectors (highest priority)
            '.menu-item.menu-item-type-taxonomy.menu-item-object-category a',
            '.menu-item-object-category a',
            '.menu-item-type-taxonomy a',
            '.main-navigation .menu-item-object-category a',
            '.primary-menu .menu-item-object-category a',
            '.secondary-menu .menu-item-object-category a',
            '.header-menu .menu-item-object-category a',
            '.footer-menu .menu-item-object-category a',
            '#main-menu .menu-item-object-category a',
            '#primary-menu .menu-item-object-category a',
            '#secondary-menu .menu-item-object-category a',
            '#header-menu .menu-item-object-category a',
            '#footer-menu .menu-item-object-category a',
            
            // Theme-specific selectors (medium priority)
            '.jeg_menu .menu-item-object-category a',
            '.jeg_main_menu .menu-item-object-category a',
            '.jeg_nav_item .menu-item-object-category a',
            '.jeg_mainmenu_wrap .menu-item-object-category a',
            '#menu-home .menu-item-object-category a',
            '.sf-menu .menu-item-object-category a',
            '.menu .menu-item-object-category a',
            '.main-menu .menu-item-object-category a',
            '.primary-menu .menu-item-object-category a',
            '.navigation .menu-item-object-category a',
            '.nav-menu .menu-item-object-category a',
            '.header-menu .menu-item-object-category a',
            '.footer-menu .menu-item-object-category a',
            
            // URL pattern selectors (low priority)
            'a[href*="/category/"]',
            'a[href*="/cat/"]',
            'a[href*="/categories/"]',
            'a[href*="/section/"]',
            'a[href*="/sections/"]',
            'a[href*="/topic/"]',
            'a[href*="/topics/"]',
            'a[href*="/subject/"]',
            'a[href*="/subjects/"]',
            'a[href*="/department/"]',
            'a[href*="/departments/"]',
            'a[href*="/genre/"]',
            'a[href*="/genres/"]',
            'a[href*="/bisnis/"]',
            'a[href*="/pendidikan/"]',
            'a[href*="/teknologi/"]',
            'a[href*="/tutorial/"]',
            'a[href*="/komputer/"]',
            'a[href*="/smartphone/"]',
            'a[href*="/laptop/"]',
            'a[href*="/kamera/"]',
            'a[href*="/blog/"]',
            
            // Generic selectors (last resort)
            'nav a[href*="category"]',
            '.navigation a[href*="category"]',
            '.menu a[href*="category"]',
            '.main-menu a[href*="category"]',
            '.primary-menu a[href*="category"]',
            '.secondary-menu a[href*="category"]',
            '.sidebar-menu a[href*="category"]',
            '.footer-menu a[href*="category"]',
            '.category a',
            '.categories a',
            '.cat a',
            '.cats a',
            '.section a',
            '.sections a',
            '.topic a',
            '.topics a',
            '.subject a',
            '.subjects a',
            '.department a',
            '.departments a',
            '.genre a',
            '.genres a',
            'ul.menu a[href*="category"]',
            'ul.navigation a[href*="category"]',
            'ul.categories a',
            'ul.category-list a',
            'ul.category-menu a',
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
     * Find recent posts links based on sample HTML analysis
     */
    findRecentPostsLinks() {
        const links = [];
        const selectors = [
            // WordPress patterns
            '.wp-block-latest-posts__post-title',
            '.wp-block-latest-posts__list a',
            '.wp-block-latest-posts a',
            
            // Cekmedia.com patterns
            '.widget.widget_block .wp-block-latest-posts__post-title',
            '#block-3 .wp-block-latest-posts__post-title',
            
            // Pintar.cekmedia.com patterns
            '.bs-widget.widget_block .wp-block-latest-posts__post-title',
            
            // Pengajartekno.co.id patterns
            '.gb-headline a', '.limit-title a', '.gb-headline-text a',
            '.gb-query-loop-item a', '.gb-grid-column a',
            
            // Generic patterns
            '.recent-posts a', '.latest-posts a', '.widget a',
            'h2:contains("Recent Posts") + ul a',
            'h2:contains("Latest Post") + div a',
            '.sidebar .recent-posts a',
            '.widget_recent_entries a',
            '.latest-posts-widget a'
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
                // Skip invalid selectors
                console.debug(`Invalid selector: ${selector}`);
            }
        });
        
        return links;
    }

    /**
     * Find tags links based on sample HTML analysis
     */
    findTagsLinks() {
        const links = [];
        const selectors = [
            // Standard patterns
            'a[rel="tag"]',
            
            // Cekmedia.com patterns
            '.jeg_post_tags a[rel="tag"]',
            
            // Pintar.cekmedia.com patterns
            '.blogus-tags a', '.tag-links a',
            
            // Generic patterns
            'a[href*="/tag/"]', 'a[href*="/tags/"]',
            '.post-tags a', '.article-tags a',
            '.tags a', '.tag-cloud a',
            '.post-tag a', '.entry-tags a',
            '.meta-tags a', '.content-tags a'
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
                // Skip invalid selectors
                console.debug(`Invalid selector: ${selector}`);
            }
        });
        
        return links;
    }
    
    /**
     * Find next page links using expanded selectors for better coverage
     */
    findNextPageLinksExpanded() {
        const links = [];
        const expandedSelectors = [
            // More generic patterns
            'a[href*="next"]', 'a[href*="continue"]', 'a[href*="more"]',
            'a[href*="page"]', 'a[href*="post"]', 'a[href*="article"]',
            
            // Text-based patterns
            'a:contains("Next")', 'a:contains("Continue")', 'a:contains("More")',
            'a:contains("Read More")', 'a:contains("View More")',
            
            // Position-based patterns
            '.pagination a:last-child', '.page-nav a:last-child',
            '.navigation a:last-child', '.nav a:last-child',
            
            // Class-based patterns
            '.btn-next', '.button-next', '.link-next',
            '.more-link', '.continue-link', '.read-more'
        ];
        
        expandedSelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    if (this.isValidLink(element)) {
                        // Additional validation for expanded selectors
                        const text = element.textContent.toLowerCase();
                        const href = element.href.toLowerCase();
                        
                        if (text.includes('next') || text.includes('continue') || 
                            text.includes('more') || href.includes('next') || 
                            href.includes('continue') || href.includes('more')) {
                            links.push(element);
                        }
                    }
                });
            } catch (error) {
                // Skip invalid selectors
            }
        });
        
        return links;
    }
    
    /**
     * Navigate to next page using optimized selectors with retry mechanism
     */
    async navigateToNextPage() {
        const maxRetries = 2;
        
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                const nextLinks = this.findNextPageLinks();
                
                if (nextLinks.length > 0) {
                    const selectedLink = this.selectBestLink(nextLinks);
                    if (selectedLink) {
                        const clickSuccess = await this.clickLink(selectedLink);
                        if (clickSuccess) {
                            if (this.behaviorSimulator?.behaviorConfig?.debugMode) {
                                console.log(`✅ Next page navigation successful (attempt ${attempt + 1})`);
                            }
                            return true;
                        }
                    }
                }
                
                // If no links found, try with expanded selectors
                if (attempt === 0) {
                    const expandedLinks = this.findNextPageLinksExpanded();
                    if (expandedLinks.length > 0) {
                        const selectedLink = this.selectBestLink(expandedLinks);
                        if (selectedLink) {
                            const clickSuccess = await this.clickLink(selectedLink);
                            if (clickSuccess) {
                                if (this.behaviorSimulator?.behaviorConfig?.debugMode) {
                                    console.log(`✅ Next page navigation successful with expanded selectors`);
                                }
                                return true;
                            }
                        }
                    }
                }
                
            } catch (error) {
                console.warn(`Next page navigation error (attempt ${attempt + 1}):`, error.message);
                if (attempt === maxRetries - 1) {
                    return false;
                }
                // Wait before retry
                await this.delay(500 + Math.random() * 1000);
            }
        }
        
        return false;
    }
    
    /**
     * Navigate to previous page using optimized selectors
     */
    async navigateToPreviousPage() {
        try {
            const prevLinks = this.findPreviousPageLinks();
            
            if (prevLinks.length > 0) {
                const selectedLink = this.selectBestLink(prevLinks);
                if (selectedLink) {
                    await this.clickLink(selectedLink);
                    return true;
                }
            }
            
            return false;
        } catch (error) {
            console.warn('Previous page navigation error:', error.message);
            return false;
        }
    }
    
    /**
     * Navigate to previous/next page with enhanced logic and personality-based behavior
     */
    async navigatePreviousNext() {
        try {
            const personality = this.behaviorSimulator?.currentPersonality;
            
            // Personality-based navigation preference
            let navigationOrder = this.getNavigationOrder(personality);
            
            // Try navigation in personality-based order
            for (const navType of navigationOrder) {
                let success = false;
                
                switch (navType) {
                    case 'next':
                        success = await this.navigateToNextPage();
                        break;
                    case 'previous':
                        success = await this.navigateToPreviousPage();
                        break;
                    case 'related':
                        success = await this.navigateRelatedContent();
                        break;
                    case 'category':
                        success = await this.navigateToCategory();
                        break;
                    case 'recent':
                        success = await this.navigateToRecentPosts();
                        break;
                }
                
                if (success) {
                    if (this.behaviorSimulator?.behaviorConfig?.debugMode) {
                        console.log(`✅ Navigation successful: ${navType}`);
                    }
                    return true;
                }
            }
            
            // Enhanced fallback with retry mechanism
            const fallbackSuccess = await this.enhancedFallbackNavigation();
            if (fallbackSuccess) {
                return true;
            }
            
            // Final fallback to back navigation
            await this.navigateBack();
            return false;
        } catch (error) {
            console.warn('Previous/Next navigation error:', error.message);
            return false;
        }
    }
    
    /**
     * Get navigation order based on personality
     */
    getNavigationOrder(personality) {
        if (!personality) {
            return ['next', 'previous', 'related', 'category', 'recent'];
        }
        
        switch (personality.type) {
            case 'researcher':
                // Researchers prefer systematic navigation
                return ['next', 'related', 'category', 'previous', 'recent'];
            case 'explorer':
                // Explorers prefer variety and discovery
                return ['related', 'category', 'next', 'recent', 'previous'];
            case 'casual':
                // Casual users prefer simple navigation
                return ['next', 'previous', 'recent', 'related', 'category'];
            case 'professional':
                // Professionals prefer efficient navigation
                return ['next', 'category', 'related', 'previous', 'recent'];
            default:
                return ['next', 'previous', 'related', 'category', 'recent'];
        }
    }
    
    /**
     * Enhanced fallback navigation with retry mechanism
     */
    async enhancedFallbackNavigation() {
        try {
            // Try generic selectors as fallback
            const genericSelectors = [
                'a[href*="next"]', 'a[href*="previous"]',
                'a[href*="prev"]', 'a[href*="continue"]',
                '.pagination a', '.page-nav a',
                '.navigation a', '.nav a'
            ];
            
            for (const selector of genericSelectors) {
                try {
                    const elements = document.querySelectorAll(selector);
                    const validLinks = Array.from(elements).filter(el => this.isValidLink(el));
                    
                    if (validLinks.length > 0) {
                        const selectedLink = this.selectBestLink(validLinks);
                        if (selectedLink) {
                            await this.clickLink(selectedLink);
                            return true;
                        }
                    }
                } catch (error) {
                    // Continue to next selector
                    continue;
                }
            }
            
            return false;
        } catch (error) {
            console.warn('Enhanced fallback navigation error:', error.message);
            return false;
        }
    }

    /**
     * Find next page links using optimized selectors
     */
    findNextPageLinks() {
        const links = [];
        const nextSelectors = [
            // Standard selectors
            'a[rel="next"]',
            
            // Cekmedia.com patterns
            '.next-post', '.post.next-post',
            '.jeg_prevnext_post .next-post',
            
            // Pintar.cekmedia.com patterns
            '.nav-next a',
            '.navigation.post-navigation .nav-next a',
            '.nav-links .nav-next a',
            
            // Pengajartekno.co.id patterns
            '.post-navigation-link-next a',
            '.wp-block-post-navigation-link a[rel="next"]',
            '#Post-Nav .post-navigation-link-next a',
            
            // Generic patterns
            '.next', '.next-page',
            '.pagination .next', '.page-nav .next',
            '.post-navigation a[rel="next"]',
            '.article-navigation a[rel="next"]',
            '.navigation .next', '.nav .next'
        ];
        
        nextSelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    // Handle both direct links and links within elements
                    const link = element.tagName === 'A' ? element : element.querySelector('a');
                    if (link && this.isValidLink(link)) {
                        links.push(link);
                    }
                });
            } catch (error) {
                // Silent error handling for stealth
            }
        });
        
        return links;
    }
    
    /**
     * Find previous page links using optimized selectors
     */
    findPreviousPageLinks() {
        const links = [];
        const prevSelectors = [
            // Standard selectors
            'a[rel="prev"]',
            
            // Cekmedia.com patterns
            '.prev-post', '.post.prev-post',
            '.jeg_prevnext_post .prev-post',
            
            // Pintar.cekmedia.com patterns
            '.nav-previous a',
            '.navigation.post-navigation .nav-previous a',
            '.nav-links .nav-previous a',
            
            // Pengajartekno.co.id patterns
            '.post-navigation-link-previous a',
            '.wp-block-post-navigation-link a[rel="prev"]',
            '#Post-Nav .post-navigation-link-previous a',
            
            // Generic patterns
            '.prev', '.previous', '.previous-page',
            '.pagination .prev', '.page-nav .prev',
            '.post-navigation a[rel="prev"]',
            '.article-navigation a[rel="prev"]',
            '.navigation .prev', '.nav .prev'
        ];
        
        prevSelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                elements.forEach(element => {
                    // Handle both direct links and links within elements
                    const link = element.tagName === 'A' ? element : element.querySelector('a');
                    if (link && this.isValidLink(link)) {
                        links.push(link);
                    }
                });
            } catch (error) {
                // Silent error handling for stealth
            }
        });
        
        return links;
    }
    
    /**
     * Find previous/next links (legacy function for backward compatibility)
     */
    findPreviousNextLinks() {
        const nextLinks = this.findNextPageLinks();
        const prevLinks = this.findPreviousPageLinks();
        return [...nextLinks, ...prevLinks];
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
        } 
        // else {
        //     // Fallback to random navigation
        //     await this.navigateRandomPage();
        // }
    }

    /**
     * Find legal/info page links
     */
    findLegalLinks() {
        const links = [];
        const selectors = [
            // WordPress standard page links
            'a[href*="about"]',
            'a[href*="contact"]',
            
            // WordPress standard CSS classes
            '.about a',
            '.contact a',
            
            // WordPress specific selectors
            '.menu-item a[href*="about"]',
            '.menu-item a[href*="contact"]',
            '.wp-block-navigation a[href*="about"]',
            '.wp-block-navigation a[href*="contact"]',
            
            // WordPress footer selectors
            '.site-footer a[href*="about"]',
            '.site-footer a[href*="contact"]',
            
            // WordPress widget selectors
            '.widget a[href*="about"]',
            '.widget a[href*="contact"]',
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
            // Highlight the element before clicking
            this.highlightElement(element);
            
            // Show highlight for a moment before clicking
            await this.delay(1000);

            // Use behavior simulator if available
            if (this.behaviorSimulator && typeof this.behaviorSimulator.simulateNaturalClick === 'function') {
                const result = await this.behaviorSimulator.simulateNaturalClick(element);
                // Remove highlight after click
                this.removeHighlight(element);
                return result;
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

            // Remove highlight after click
            this.removeHighlight(element);

            return true;
        } catch (error) {
            console.warn('Link click failed:', error.message);
            // Remove highlight on error
            this.removeHighlight(element);
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
