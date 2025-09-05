/**
 * Navigation Engine - Enhanced Mencari dan navigasi ke post berikutnya
 * ENHANCED VERSION with comprehensive fixes and improvements
 */

class NavigationEngine {
    constructor() {
        // Enhanced configuration
        this.config = {
            // Performance optimization
            enableCaching: true,
            cacheTimeout: 300000, // 5 minutes
            maxCacheSize: 100,
            enablePerformanceOptimization: true,
            
            // Navigation strategies
            maxRetries: 3,
            fallbackTimeout: 10000, // 10 seconds
            enableSmartFallback: true,
            
            // Selector optimization
            enableSelectorCaching: true,
            enableLazyLoading: true,
            maxSelectorAttempts: 5
        };

        // Performance optimization: caching system
        this.selectorCache = new Map();
        this.urlPatternCache = new Map();
        this.navigationCache = new Map();
        this.lastCleanup = Date.now();
        
        // Enhanced navigation selectors with priority
        this.navigationSelectors = {
            previous: [
                // High priority selectors
                { selector: '.prev-post', priority: 1, type: 'previous' },
                { selector: '.previous-post', priority: 1, type: 'previous' },
                { selector: '.nav-previous', priority: 1, type: 'previous' },
                { selector: '.pagination-prev', priority: 1, type: 'previous' },
                { selector: 'a[rel="prev"]', priority: 1, type: 'previous' },
                
                // Medium priority selectors
                { selector: '.post-navigation .prev', priority: 2, type: 'previous' },
                { selector: '.navigation .prev', priority: 2, type: 'previous' },
                { selector: '.pager .prev', priority: 2, type: 'previous' },
                
                // Low priority selectors
                { selector: 'a[href*="prev"]', priority: 3, type: 'previous' },
                { selector: 'a[href*="previous"]', priority: 3, type: 'previous' }
            ],
            next: [
                // High priority selectors
                { selector: '.next-post', priority: 1, type: 'next' },
                { selector: '.nav-next', priority: 1, type: 'next' },
                { selector: '.pagination-next', priority: 1, type: 'next' },
                { selector: 'a[rel="next"]', priority: 1, type: 'next' },
                
                // Medium priority selectors
                { selector: '.post-navigation .next', priority: 2, type: 'next' },
                { selector: '.navigation .next', priority: 2, type: 'next' },
                { selector: '.pager .next', priority: 2, type: 'next' },
                
                // Low priority selectors
                { selector: 'a[href*="next"]', priority: 3, type: 'next' },
                { selector: 'a[href*="forward"]', priority: 3, type: 'next' }
            ],
            related: [
                // High priority selectors (specific widgets) - Themes Superfast
                { selector: '.idblog-rp-widget .idblog-rp-link a', priority: 1, type: 'related', source: 'idblog-widget' },
                { selector: '.idblog-rp-widget .idblog-rp-title', priority: 1, type: 'related', source: 'idblog-widget' },
                { selector: '.idblog-rp-widget a[itemprop="url"]', priority: 1, type: 'related', source: 'idblog-widget' },
                
                // Standard high priority selectors
                { selector: '.related-posts', priority: 1, type: 'related' },
                { selector: '.related-articles', priority: 1, type: 'related' },
                { selector: '.similar-posts', priority: 1, type: 'related' },
                
                // Medium priority selectors
                { selector: '.recommended-posts', priority: 2, type: 'related' },
                { selector: '.more-posts', priority: 2, type: 'related' },
                { selector: '.post-suggestions', priority: 2, type: 'related' },
                { selector: '.you-might-like', priority: 2, type: 'related' },
                
                // Low priority selectors
                { selector: '.suggested-content', priority: 3, type: 'related' },
                { selector: '.more-like-this', priority: 3, type: 'related' }
            ],
            random: [
                // High priority selectors
                { selector: '.random-posts', priority: 1, type: 'random' },
                { selector: '.popular-posts', priority: 1, type: 'random' },
                { selector: '.featured-posts', priority: 1, type: 'random' },
                
                // Medium priority selectors
                { selector: '.latest-posts', priority: 2, type: 'random' },
                { selector: '.recent-posts', priority: 2, type: 'random' },
                { selector: '.trending-posts', priority: 2, type: 'random' },
                
                // Low priority selectors
                { selector: '.blog-posts a', priority: 3, type: 'random' },
                { selector: '.post-list a', priority: 3, type: 'random' },
                { selector: '.article-list a', priority: 3, type: 'random' }
            ],
            // Enhanced post link selectors with priority
            postLinks: [
                // High priority selectors (specific widgets)
                { selector: '.idblog-rp-widget .idblog-rp-link a', priority: 1, type: 'post', source: 'idblog-widget' },
                { selector: '.idblog-rp-widget a[itemprop="url"]', priority: 1, type: 'post', source: 'idblog-widget' },
                
                // Standard high priority selectors
                { selector: '.post-title a', priority: 1, type: 'post' },
                { selector: '.entry-title a', priority: 1, type: 'post' },
                { selector: '.article-title a', priority: 1, type: 'post' },
                { selector: '.blog-post-title a', priority: 1, type: 'post' },
                
                // Medium priority selectors
                { selector: '.post-heading a', priority: 2, type: 'post' },
                { selector: '.post-link', priority: 2, type: 'post' },
                { selector: '.entry-link', priority: 2, type: 'post' },
                { selector: '.article-link', priority: 2, type: 'post' },
                
                // Container-based selectors
                { selector: '.post a[href*="/post/"]', priority: 3, type: 'post' },
                { selector: '.post a[href*="/article/"]', priority: 3, type: 'post' },
                { selector: '.post a[href*="/blog/"]', priority: 3, type: 'post' },
                { selector: '.entry a[href*="/post/"]', priority: 3, type: 'post' },
                { selector: '.entry a[href*="/article/"]', priority: 3, type: 'post' },
                { selector: '.entry a[href*="/blog/"]', priority: 3, type: 'post' },
                { selector: '.article a[href*="/post/"]', priority: 3, type: 'post' },
                { selector: '.article a[href*="/article/"]', priority: 3, type: 'post' },
                { selector: '.article a[href*="/blog/"]', priority: 3, type: 'post' },
                
                // List-based selectors
                { selector: '.post-list .post a', priority: 4, type: 'post' },
                { selector: '.post-list .entry a', priority: 4, type: 'post' },
                { selector: '.post-list .article a', priority: 4, type: 'post' },
                { selector: '.article-list .post a', priority: 4, type: 'post' },
                { selector: '.article-list .entry a', priority: 4, type: 'post' },
                { selector: '.article-list .article a', priority: 4, type: 'post' },
                { selector: '.blog-list .post a', priority: 4, type: 'post' },
                { selector: '.blog-list .entry a', priority: 4, type: 'post' },
                { selector: '.blog-list .article a', priority: 4, type: 'post' },
                { selector: '.blog-list .article a', priority: 4, type: 'post' },
                
                // Grid-based selectors
                { selector: '.post-grid .post a', priority: 4, type: 'post' },
                { selector: '.post-grid .entry a', priority: 4, type: 'post' },
                { selector: '.post-grid .article a', priority: 4, type: 'post' },
                { selector: '.article-grid .post a', priority: 4, type: 'post' },
                { selector: '.article-grid .entry a', priority: 4, type: 'post' },
                { selector: '.article-grid .article a', priority: 4, type: 'post' },
                
                // Generic post patterns
                { selector: 'a[href*="/post/"]', priority: 5, type: 'post' },
                { selector: 'a[href*="/article/"]', priority: 5, type: 'post' },
                { selector: 'a[href*="/blog/"]', priority: 5, type: 'post' },
                { selector: 'a[href*="/news/"]', priority: 5, type: 'post' },
                { selector: 'a[href*="/2024/"]', priority: 5, type: 'post' },
                { selector: 'a[href*="/2023/"]', priority: 5, type: 'post' },
                { selector: 'a[href*="/2022/"]', priority: 5, type: 'post' },
                { selector: 'a[href*="/2021/"]', priority: 5, type: 'post' },
                { selector: 'a[href*="/2020/"]', priority: 5, type: 'post' },
                
                // WordPress specific
                { selector: '.post a[href*="?p="]', priority: 5, type: 'post' },
                { selector: '.entry a[href*="?p="]', priority: 5, type: 'post' },
                { selector: '.article a[href*="?p="]', priority: 5, type: 'post' }
            ]
        };

        // Enhanced URL patterns with priority and flexibility
        this.urlPatterns = {
            home: [
                { pattern: /^\/$/, priority: 1, name: 'root' },
                { pattern: /^\/home\/?$/, priority: 1, name: 'home' },
                { pattern: /^\/index\.html?$/, priority: 1, name: 'index' },
                { pattern: /^\/default\.html?$/, priority: 2, name: 'default' },
                { pattern: /^\/main\.html?$/, priority: 2, name: 'main' },
                { pattern: /^\/blog\/?$/, priority: 1, name: 'blog_root' },
                { pattern: /^\/posts\/?$/, priority: 1, name: 'posts_root' },
                { pattern: /^\/articles\/?$/, priority: 1, name: 'articles_root' }
            ],
            category: [
                { pattern: /\/category\//, priority: 1, name: 'category' },
                { pattern: /\/cat\//, priority: 1, name: 'cat' },
                { pattern: /\/tag\//, priority: 1, name: 'tag' },
                { pattern: /\/taxonomy\//, priority: 1, name: 'taxonomy' },
                { pattern: /\/archive\//, priority: 2, name: 'archive' },
                { pattern: /\/section\//, priority: 2, name: 'section' },
                { pattern: /\/topic\//, priority: 2, name: 'topic' },
                { pattern: /\/subject\//, priority: 2, name: 'subject' },
                { pattern: /\/catalog\//, priority: 3, name: 'catalog' },
                { pattern: /\/directory\//, priority: 3, name: 'directory' }
            ],
            post: [
                { pattern: /\/post\//, priority: 1, name: 'post' },
                { pattern: /\/article\//, priority: 1, name: 'article' },
                { pattern: /\/blog\/[^\/]+\//, priority: 1, name: 'blog_post' },
                { pattern: /\/news\//, priority: 1, name: 'news' },
                { pattern: /\/[0-9]{4}\/[0-9]{2}\//, priority: 1, name: 'date_post' },
                { pattern: /\/[0-9]{4}\//, priority: 2, name: 'year_post' },
                { pattern: /\/[a-zA-Z0-9-]+\.html$/, priority: 2, name: 'html_post' },
                { pattern: /\/[a-zA-Z0-9-]+\/$/, priority: 2, name: 'slug_post' },
                { pattern: /\/story\//, priority: 3, name: 'story' },
                { pattern: /\/content\//, priority: 3, name: 'content' }
            ]
        };

        // Initialize unified storage service
        this.storageService = new StorageService();
        
        // Navigation state tracking
        this.navigationState = {
            currentPage: null,
            visitedUrls: new Set(),
            navigationHistory: [],
            lastNavigation: null,
            lastNavigationAttempt: null,
            failedAttempts: 0,
            successRate: 0
        };

        // Performance metrics
        this.performanceMetrics = {
            totalQueries: 0,
            cacheHits: 0,
            cacheMisses: 0,
            averageQueryTime: 0,
            lastQueryTime: 0
        };

        console.log('🚀 Enhanced Navigation Engine initialized with config:', this.config);
    }

    // Enhanced memory management
    cleanupCache() {
        const now = Date.now();
        const cutoffTime = now - this.config.cacheTimeout;

        // Cleanup selector cache
        for (const [key, value] of this.selectorCache.entries()) {
            if (value.timestamp < cutoffTime) {
                this.selectorCache.delete(key);
            }
        }

        // Cleanup URL pattern cache
        for (const [key, value] of this.urlPatternCache.entries()) {
            if (value.timestamp < cutoffTime) {
                this.urlPatternCache.delete(key);
            }
        }

        // Cleanup navigation cache
        for (const [key, value] of this.navigationCache.entries()) {
            if (value.timestamp < cutoffTime) {
                this.navigationCache.delete(key);
            }
        }

        // Limit cache size
        this.limitCacheSize();

        this.lastCleanup = now;
        console.log('🧹 Navigation cache cleanup completed');
    }

    limitCacheSize() {
        // Limit selector cache
        if (this.selectorCache.size > this.config.maxCacheSize) {
            const entries = Array.from(this.selectorCache.entries());
            entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
            const toRemove = entries.slice(0, entries.length - this.config.maxCacheSize);
            toRemove.forEach(([key]) => this.selectorCache.delete(key));
        }

        // Limit URL pattern cache
        if (this.urlPatternCache.size > this.config.maxCacheSize) {
            const entries = Array.from(this.urlPatternCache.entries());
            entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
            const toRemove = entries.slice(0, entries.length - this.config.maxCacheSize);
            toRemove.forEach(([key]) => this.urlPatternCache.delete(key));
        }

        // Limit navigation cache
        if (this.navigationCache.size > this.config.maxCacheSize) {
            const entries = Array.from(this.navigationCache.entries());
            entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
            const toRemove = entries.slice(0, entries.length - this.config.maxCacheSize);
            toRemove.forEach(([key]) => this.navigationCache.delete(key));
        }
    }

    // Enhanced selector search with caching
    findNavigationElements(selectorType) {
        const cacheKey = `${selectorType}_${window.location.href}`;
        
        if (this.config.enableSelectorCaching && this.selectorCache.has(cacheKey)) {
            const cached = this.selectorCache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.config.cacheTimeout) {
                this.performanceMetrics.cacheHits++;
                console.log('📋 Using cached navigation elements for:', selectorType);
                return cached.elements;
            }
        }

        this.performanceMetrics.cacheMisses++;
        const startTime = Date.now();

        const selectors = this.navigationSelectors[selectorType] || [];
        const elements = [];

        // Sort selectors by priority
        const sortedSelectors = selectors.sort((a, b) => a.priority - b.priority);

        for (const selectorObj of sortedSelectors) {
            try {
                const selector = selectorObj.selector;
                const found = document.querySelectorAll(selector);
                
                if (found.length > 0) {
                    const validElements = Array.from(found).filter(element => 
                        this.isValidNavigationElement(element, selectorObj.type)
                    );
                    
                    if (validElements.length > 0) {
                        elements.push(...validElements.map(element => ({
                            element: element,
                            priority: selectorObj.priority,
                            type: selectorObj.type,
                            selector: selector
                        })));
                        
                        // If we found high priority elements, we can stop early
                        if (selectorObj.priority === 1 && validElements.length > 0) {
                            break;
                        }
                    }
                }
        } catch (error) {
                console.warn(`Invalid selector: ${selectorObj.selector}`, error);
            }
        }

        // Cache the result
        if (this.config.enableSelectorCaching) {
            this.selectorCache.set(cacheKey, {
                elements: elements,
                timestamp: Date.now()
            });
        }

        // Update performance metrics
        const queryTime = Date.now() - startTime;
        this.performanceMetrics.totalQueries++;
        this.performanceMetrics.lastQueryTime = queryTime;
        this.performanceMetrics.averageQueryTime = 
            (this.performanceMetrics.averageQueryTime * (this.performanceMetrics.totalQueries - 1) + queryTime) / 
            this.performanceMetrics.totalQueries;

        console.log(`🔍 Found ${elements.length} navigation elements for ${selectorType} in ${queryTime}ms`);
        return elements;
    }

    // Enhanced element validation
    isValidNavigationElement(element, type) {
        if (!element || !element.href) return false;

        try {
            const url = new URL(element.href, window.location.origin);
            
            // Check if URL is valid
            if (!url.href || url.href === window.location.href) return false;
            
            // Check if URL is already visited
            if (this.navigationState.visitedUrls.has(url.href)) return false;
            
            // Check if element is visible
            const rect = element.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return false;
            
            // Check if element is in viewport
            if (rect.top < 0 || rect.left < 0 || 
                rect.bottom > window.innerHeight || 
                rect.right > window.innerWidth) return false;
            
            // Type-specific validation
            switch (type) {
                case 'previous':
                case 'next':
                    return this.isValidSequentialElement(element, type);
                case 'related':
                    return this.isValidRelatedElement(element);
                case 'random':
                    return this.isValidRandomElement(element);
                case 'post':
                    return this.isValidPostElement(element);
                default:
                    return true;
            }
        } catch (error) {
            console.warn('Error validating navigation element:', error);
            return false;
        }
    }

    isValidSequentialElement(element, type) {
        // Check for sequential navigation indicators
        const text = element.textContent.toLowerCase();
        const href = element.href.toLowerCase();
        
        if (type === 'previous') {
            return text.includes('prev') || text.includes('previous') || 
                   text.includes('←') || text.includes('back') ||
                   href.includes('prev') || href.includes('previous');
        } else if (type === 'next') {
            return text.includes('next') || text.includes('→') || 
                   text.includes('forward') || text.includes('continue') ||
                   href.includes('next');
        }
        
        return true;
    }

    isValidRelatedElement(element) {
        // Check for related content indicators
        const text = element.textContent.toLowerCase();
        const href = element.href.toLowerCase();
        
        return text.includes('related') || text.includes('similar') || 
               text.includes('recommended') || text.includes('more') ||
               text.includes('you might like') || text.includes('suggested');
    }

    isValidRandomElement(element) {
        // Check for random/featured content indicators
        const text = element.textContent.toLowerCase();
        const href = element.href.toLowerCase();
        
        return text.includes('random') || text.includes('popular') || 
               text.includes('featured') || text.includes('latest') ||
               text.includes('recent') || text.includes('trending');
    }

    isValidPostElement(element) {
        // Check if element leads to a post page
        const href = element.href.toLowerCase();
        const currentUrl = window.location.href.toLowerCase();
        
        // Don't navigate to the same page
        if (href === currentUrl) return false;
        
        // Check for post-like URL patterns
        const postPatterns = [
            '/post/', '/article/', '/blog/', '/news/', '/story/',
            '/2024/', '/2023/', '/2022/', '/2021/', '/2020/'
        ];
        
        return postPatterns.some(pattern => href.includes(pattern));
    }

    // Enhanced navigation strategies
    async findNextPostWithFallback() {
        console.log('🧭 Starting enhanced navigation with fallback strategies...');
        
        // Check current page type to determine strategy priority
        const currentPageType = this.getCurrentPageType();
        const isOnHomepage = currentPageType === 'home' || 
                            window.location.pathname === '/' || 
                            window.location.pathname === '/index.php';
        
        let strategies;
        if (isOnHomepage) {
            // If on homepage, prioritize finding posts from homepage
            console.log('🏠 On homepage - prioritizing homepage post discovery');
            strategies = [
                () => this.findPostFromHomepage(),
                () => this.findRandomPost(),
                () => this.findRelatedPost(),
                () => this.findPostFromCategory(),
                () => this.findPostFromSearch(),
                () => this.findPostFromArchive(),
                () => this.findNextPost()
            ];
        } else {
            // If on other pages, use normal strategy order
            console.log('📄 On other page - using normal navigation strategy');
            strategies = [
                () => this.findNextPost(),
                () => this.findRelatedPost(),
                () => this.findRandomPost(),
                () => this.findPostFromHomepage(),
                () => this.findPostFromCategory(),
                () => this.findPostFromSearch(),
                () => this.findPostFromArchive()
            ];
        }
        
        for (let i = 0; i < strategies.length; i++) {
            try {
                console.log(`🔄 Trying navigation strategy ${i + 1}: ${strategies[i].name}`);
                const result = await strategies[i]();
                
                if (result && result.url && await this.isValidNavigationTarget(result.url)) {
                    console.log(`✅ Strategy ${i + 1} succeeded:`, result);
                    this.recordNavigationSuccess(result, i + 1);
                    return result;
                }
            } catch (error) {
                console.warn(`⚠️ Navigation strategy ${i + 1} failed:`, error);
                this.recordNavigationFailure(i + 1, error);
            }
        }
        
        // Ultimate fallback: try to find any valid post URL from current page
        console.log('🔄 All navigation strategies failed, trying ultimate fallback...');
        try {
            const ultimateFallback = await this.findAnyValidPostUrl();
            if (ultimateFallback && ultimateFallback.url && await this.isValidNavigationTarget(ultimateFallback.url)) {
                console.log('✅ Ultimate fallback succeeded:', ultimateFallback);
                this.recordNavigationSuccess(ultimateFallback, 'ultimate_fallback');
                return ultimateFallback;
            }
        } catch (error) {
            console.warn('⚠️ Ultimate fallback failed:', error);
        }
        
        // If all else fails, return null instead of invalid URL
        console.log('❌ All navigation strategies failed, no valid posts found');
        return null;
    }

    // Enhanced navigation methods
    async findNextPost() {
        const nextElements = this.findNavigationElements('next');
        
        if (nextElements.length === 0) {
            console.log('⚠️ No next post elements found');
            return null;
        }

        console.log(`📝 Found ${nextElements.length} next post elements`);
        
        // FILTER FIRST: Remove already visited URLs before sorting
        console.log('🔍 Filtering out already visited URLs...');
        const unvisitedElements = [];
        
        for (const element of nextElements) {
            try {
                const isVisited = await this.isUrlVisitedComprehensive(element.element.href);
                if (!isVisited) {
                    unvisitedElements.push(element);
                } else {
                    console.log(`🚫 Skipping visited URL: ${element.element.href}`);
                }
            } catch (error) {
                console.warn(`⚠️ Error checking visited status for ${element.element.href}:`, error);
                // If we can't determine visited status, include it (safer approach)
                unvisitedElements.push(element);
            }
        }
        
        console.log(`✅ Filtered to ${unvisitedElements.length} unvisited posts out of ${nextElements.length} total`);
        
        if (unvisitedElements.length === 0) {
            console.log('⚠️ All next posts have been visited');
            return null;
        }
        
        // SORT AFTER FILTERING: Sort only unvisited elements by priority
        const sortedUnvisitedElements = unvisitedElements.sort((a, b) => a.priority - b.priority);
        const bestUnvisitedElement = sortedUnvisitedElements[0];
        
        return {
            url: bestUnvisitedElement.element.href,
            type: 'next',
            element: bestUnvisitedElement.element,
            priority: bestUnvisitedElement.priority,
            strategy: 'next_post'
        };
    }

    async findRelatedPost() {
        const relatedElements = this.findNavigationElements('related');
        
        if (relatedElements.length === 0) {
            console.log('⚠️ No related post elements found');
            return null;
        }

        console.log(`📝 Found ${relatedElements.length} related post elements`);
        
        // FILTER FIRST: Remove already visited URLs before sorting
        console.log('🔍 Filtering out already visited URLs...');
        const unvisitedElements = [];
        
        for (const element of relatedElements) {
            try {
                const isVisited = await this.isUrlVisitedComprehensive(element.element.href);
                if (!isVisited) {
                    unvisitedElements.push(element);
                } else {
                    console.log(`🚫 Skipping visited URL: ${element.element.href}`);
                }
            } catch (error) {
                console.warn(`⚠️ Error checking visited status for ${element.element.href}:`, error);
                // If we can't determine visited status, include it (safer approach)
                unvisitedElements.push(element);
            }
        }
        
        console.log(`✅ Filtered to ${unvisitedElements.length} unvisited posts out of ${relatedElements.length} total`);
        
        if (unvisitedElements.length === 0) {
            console.log('⚠️ All related posts have been visited');
            return null;
        }
        
        // SORT AFTER FILTERING: Sort only unvisited elements by priority
        const sortedUnvisitedElements = unvisitedElements.sort((a, b) => a.priority - b.priority);
        const bestUnvisitedElement = sortedUnvisitedElements[0];
        
        return {
            url: bestUnvisitedElement.element.href,
            type: 'related',
            element: bestUnvisitedElement.element,
            priority: bestUnvisitedElement.priority,
            strategy: 'related_post'
        };
    }

    async findRandomPost() {
        const randomElements = this.findNavigationElements('random');
        
        if (randomElements.length === 0) {
            console.log('⚠️ No random post elements found');
            return null;
        }

        console.log(`📝 Found ${randomElements.length} random post elements`);
        
        // FILTER FIRST: Remove already visited URLs before random selection
        console.log('🔍 Filtering out already visited URLs...');
        const unvisitedElements = [];
        
        for (const element of randomElements) {
            try {
                const isVisited = await this.isUrlVisitedComprehensive(element.element.href);
                if (!isVisited) {
                    unvisitedElements.push(element);
                } else {
                    console.log(`🚫 Skipping visited URL: ${element.element.href}`);
                }
            } catch (error) {
                console.warn(`⚠️ Error checking visited status for ${element.element.href}:`, error);
                // If we can't determine visited status, include it (safer approach)
                unvisitedElements.push(element);
            }
        }
        
        console.log(`✅ Filtered to ${unvisitedElements.length} unvisited posts out of ${randomElements.length} total`);
        
        if (unvisitedElements.length === 0) {
            console.log('⚠️ All random posts have been visited');
            return null;
        }
        
        // RANDOM SELECTION AFTER FILTERING: Randomly select from unvisited elements
        const randomIndex = Math.floor(Math.random() * unvisitedElements.length);
        const selectedUnvisitedElement = unvisitedElements[randomIndex];
        
        return {
            url: selectedUnvisitedElement.element.href,
            type: 'random',
            element: selectedUnvisitedElement.element,
            priority: selectedUnvisitedElement.priority,
            strategy: 'random_post'
        };
    }

    async findPostFromHomepage() {
        console.log('🏠 Attempting to find post from homepage...');
        
        // Check if we're currently on a homepage
        const currentPageType = this.getCurrentPageType();
        const isOnHomepage = currentPageType === 'home' || 
                            window.location.pathname === '/' || 
                            window.location.pathname === '/index.php';
        
        if (isOnHomepage) {
            console.log('✅ Currently on homepage, searching for post links...');
            
            // Find post links on current homepage
            const postElements = this.findNavigationElements('postLinks');
            
            if (postElements.length > 0) {
                console.log(`📝 Found ${postElements.length} post links on homepage`);
                
                // FILTER FIRST: Remove already visited URLs before sorting
                console.log('🔍 Filtering out already visited URLs...');
                const unvisitedElements = [];
                
                for (const element of postElements) {
                    try {
                        const isVisited = await this.isUrlVisitedComprehensive(element.element.href);
                        if (!isVisited) {
                            unvisitedElements.push(element);
                        } else {
                            console.log(`🚫 Skipping visited URL: ${element.element.href}`);
                        }
                    } catch (error) {
                        console.warn(`⚠️ Error checking visited status for ${element.element.href}:`, error);
                        // If we can't determine visited status, include it (safer approach)
                        unvisitedElements.push(element);
                    }
                }
                
                console.log(`✅ Filtered to ${unvisitedElements.length} unvisited posts out of ${postElements.length} total`);
                
                if (unvisitedElements.length === 0) {
                    console.log('⚠️ All homepage posts have been visited');
                    return null;
                }
                
                // SORT AFTER FILTERING: Sort only unvisited elements by priority
                const sortedUnvisitedElements = unvisitedElements.sort((a, b) => a.priority - b.priority);
                const bestUnvisitedElement = sortedUnvisitedElements[0];
                
                // Additional validation for homepage posts
                if (this.isValidHomepagePost(bestUnvisitedElement.element.href)) {
                    console.log('✅ Valid unvisited homepage post found:', bestUnvisitedElement.element.href);
                    return {
                        url: bestUnvisitedElement.element.href,
                        type: 'homepage_post',
                        element: bestUnvisitedElement.element,
                        priority: bestUnvisitedElement.priority,
                        strategy: 'homepage_post',
                        source: 'homepage'
                    };
                } else {
                    console.log('⚠️ Best unvisited element is not a valid homepage post, trying next...');
                    // Try next best unvisited element
                    for (let i = 1; i < sortedUnvisitedElements.length; i++) {
                        if (this.isValidHomepagePost(sortedUnvisitedElements[i].element.href)) {
                            console.log('✅ Alternative unvisited homepage post found:', sortedUnvisitedElements[i].element.href);
                            return {
                                url: sortedUnvisitedElements[i].element.href,
                                type: 'homepage_post',
                                element: sortedUnvisitedElements[i].element,
                                priority: sortedUnvisitedElements[i].priority,
                                strategy: 'homepage_post',
                                source: 'homepage'
                            };
                        }
                    }
                }
            } else {
                console.log('⚠️ No post links found on homepage');
            }
        } else {
            console.log('ℹ️ Not currently on homepage, skipping homepage strategy');
        }
        
        return null;
    }

    async findPostFromCategory() {
        console.log('🏷️ Attempting to find post from category page...');
        
        const currentPageType = this.getCurrentPageType();
        
        if (currentPageType === 'category') {
            const postElements = this.findNavigationElements('postLinks');
            
            if (postElements.length > 0) {
                console.log(`📝 Found ${postElements.length} post links on category page`);
                
                // FILTER FIRST: Remove already visited URLs before sorting
                console.log('🔍 Filtering out already visited URLs...');
                const unvisitedElements = [];
                
                for (const element of postElements) {
                    try {
                        const isVisited = await this.isUrlVisitedComprehensive(element.element.href);
                        if (!isVisited) {
                            unvisitedElements.push(element);
                        } else {
                            console.log(`🚫 Skipping visited URL: ${element.element.href}`);
                        }
                    } catch (error) {
                        console.warn(`⚠️ Error checking visited status for ${element.element.href}:`, error);
                        // If we can't determine visited status, include it (safer approach)
                        unvisitedElements.push(element);
                    }
                }
                
                console.log(`✅ Filtered to ${unvisitedElements.length} unvisited posts out of ${postElements.length} total`);
                
                if (unvisitedElements.length === 0) {
                    console.log('⚠️ All category posts have been visited');
                    return null;
                }
                
                // SORT AFTER FILTERING: Sort only unvisited elements by priority
                const sortedUnvisitedElements = unvisitedElements.sort((a, b) => a.priority - b.priority);
                const bestUnvisitedElement = sortedUnvisitedElements[0];
                
                return {
                    url: bestUnvisitedElement.element.href,
                    type: 'post',
                    element: bestUnvisitedElement.element,
                    priority: bestUnvisitedElement.priority,
                    strategy: 'category_post'
                };
            }
        }
        
        return null;
    }

    async findPostFromSearch() {
        console.log('🔍 Attempting to find post from search...');
        
        // This is a placeholder for search functionality
        // In a real implementation, you might search for related content
        return null;
    }

    async findPostFromArchive() {
        console.log('📚 Attempting to find post from archive...');
        
        // This is a placeholder for archive functionality
        // In a real implementation, you might browse through archived posts
        return null;
    }

    // Validate if a URL is a valid homepage post
    isValidHomepagePost(url) {
        try {
            if (!url || typeof url !== 'string') {
                return false;
            }

            // Check for invalid patterns
            if (url === '/' || url === '' || url === '#' || url === 'javascript:void(0)') {
                return false;
            }

            const urlObj = new URL(url, window.location.origin);
            
            // Must be same domain (including subdomains)
            if (!this.isSameDomain(urlObj.hostname, window.location.hostname)) {
                console.log('⚠️ External domain detected, skipping:', urlObj.hostname);
                return false;
            }
            
            // Must be different from current page
            if (urlObj.href === window.location.href) {
                return false;
            }
            
            // Must have meaningful path (not homepage)
            const pathname = urlObj.pathname;
            if (pathname === '/' || pathname === '/index.php') {
                return false;
            }
            
            // Must have minimum path length
            if (pathname.length < 3) {
                return false;
            }
            
            // Check for post-like patterns
            const hasPostPattern = pathname.includes('/202') || 
                                 pathname.includes('/post') || 
                                 pathname.includes('/article') ||
                                 pathname.includes('/blog') ||
                                 pathname.includes('/news') ||
                                 pathname.includes('/story') ||
                                 pathname.includes('/content');
            
            if (hasPostPattern) {
                return true;
            }
            
            // Check for date-based patterns (common in WordPress)
            const datePattern = /\/(20\d{2})\/(\d{1,2})\//;
            if (datePattern.test(pathname)) {
                return true;
            }
            
            // Check for slug-based patterns (exclude admin/author pages)
            const slugPattern = /\/[a-zA-Z0-9-]+\/$/;
            if (slugPattern.test(pathname)) {
                // Exclude admin, author, and other non-post pages
                const excludePatterns = [
                    /\/author\//,
                    /\/admin\//,
                    /\/administrator\//,
                    /\/wp-admin\//,
                    /\/wp-content\//,
                    /\/wp-includes\//,
                    /\/login\//,
                    /\/register\//,
                    /\/profile\//,
                    /\/dashboard\//,
                    /\/settings\//,
                    /\/account\//,
                    /\/user\//,
                    /\/member\//,
                    /\/moderator\//,
                    /\/editor\//,
                    /\/contributor\//,
                    /\/subscriber\//
                ];
                
                // Check if URL matches any exclude pattern
                const shouldExclude = excludePatterns.some(pattern => pattern.test(pathname));
                if (shouldExclude) {
                    console.log('🚫 Excluding admin/author page:', pathname);
                    return false;
                }
                
                return true;
            }
            
            return false;
            
        } catch (error) {
            console.warn('Error validating homepage post:', error);
            return false;
        }
    }

    // Check if two hostnames belong to the same domain (including subdomains)
    isSameDomain(hostname1, hostname2) {
        try {
            if (!hostname1 || !hostname2) {
                return false;
            }

            // Normalize hostnames (remove www. prefix if present)
            const normalizeHostname = (hostname) => {
                return hostname.replace(/^www\./, '');
            };

            const normalized1 = normalizeHostname(hostname1);
            const normalized2 = normalizeHostname(hostname2);

            // Check if they are exactly the same
            if (normalized1 === normalized2) {
                return true;
            }

            // Check if one is a subdomain of the other
            const parts1 = normalized1.split('.');
            const parts2 = normalized2.split('.');

            // Both must have at least 2 parts (domain.tld)
            if (parts1.length < 2 || parts2.length < 2) {
                return false;
            }

            // Check if one domain ends with the other
            // Example: blog.example.com and example.com
            if (normalized1.endsWith('.' + normalized2) || normalized2.endsWith('.' + normalized1)) {
                return true;
            }

            // Check for common TLD patterns
            const tld1 = parts1.slice(-2).join('.'); // Get last 2 parts
            const tld2 = parts2.slice(-2).join('.'); // Get last 2 parts

            if (tld1 === tld2) {
                // Check if they share the same base domain
                const base1 = parts1.slice(0, -2).join('.');
                const base2 = parts2.slice(0, -2).join('.');

                if (base1 === base2 || base1.endsWith('.' + base2) || base2.endsWith('.' + base1)) {
                    return true;
                }
            }

            return false;

        } catch (error) {
            console.warn('Error checking domain relationship:', error);
            return false;
        }
    }

    // Test method for domain validation (for debugging)
    testDomainValidation() {
        console.log('🧪 Testing domain validation...');
        
        const testCases = [
            // Same domain
            { host1: 'example.com', host2: 'example.com', expected: true },
            { host1: 'www.example.com', host2: 'example.com', expected: true },
            { host1: 'example.com', host2: 'www.example.com', expected: true },
            
            // Subdomains
            { host1: 'blog.example.com', host2: 'example.com', expected: true },
            { host1: 'news.example.com', host2: 'example.com', expected: true },
            { host1: 'sub.example.com', host2: 'example.com', expected: true },
            { host1: 'example.com', host2: 'blog.example.com', expected: true },
            
            // Multi-level subdomains
            { host1: 'dev.blog.example.com', host2: 'example.com', expected: true },
            { host1: 'staging.app.example.com', host2: 'example.com', expected: true },
            
            // Different domains
            { host1: 'example.com', host2: 'other.com', expected: false },
            { host1: 'blog.example.com', host2: 'other.com', expected: false },
            { host1: 'example.org', host2: 'example.com', expected: false },
            
            // Edge cases
            { host1: '', host2: 'example.com', expected: false },
            { host1: 'example.com', host2: '', expected: false },
            { host1: null, host2: 'example.com', expected: false }
        ];
        
        let passed = 0;
        let total = testCases.length;
        
        for (const testCase of testCases) {
            const result = this.isSameDomain(testCase.host1, testCase.host2);
            const status = result === testCase.expected ? '✅ PASS' : '❌ FAIL';
            console.log(`${status} ${testCase.host1} vs ${testCase.host2} = ${result} (expected: ${testCase.expected})`);
            
            if (result === testCase.expected) {
                passed++;
            }
        }
        
        console.log(`🧪 Domain validation test: ${passed}/${total} passed`);
        return passed === total;
    }

    // Ultimate fallback: find any valid post URL from current page
    async findAnyValidPostUrl() {
        console.log('🆘 Attempting to find any valid post URL from current page...');
        
        try {
            // Try to find any link that might be a post
            const allLinks = document.querySelectorAll('a[href]');
            const validPostUrls = [];
            
            // Process links sequentially to handle async validation
            for (let i = 0; i < allLinks.length; i++) {
                try {
                    const link = allLinks[i];
                    const href = link.href;
                    if (!href || href === '#' || href === 'javascript:void(0)') continue;
                    
                    // Check if this looks like a post URL
                    if (await this.isValidNavigationTarget(href)) {
                        const linkText = link.textContent?.trim() || '';
                        const linkTitle = link.title || '';
                        
                        // Prioritize links that look like posts
                        let priority = 3; // Default low priority
                        
                        if (linkText.length > 10 && linkText.length < 100) priority = 2; // Good text length
                        if (linkTitle.length > 10) priority = 1; // Has meaningful title
                        if (href.includes('/202') || href.includes('/2024') || href.includes('/2025')) priority = 0; // Date-based URL
                        
                        validPostUrls.push({
                            url: href,
                            type: 'fallback_post',
                            element: link,
                            priority: priority,
                            strategy: 'any_valid_post',
                            text: linkText,
                            title: linkTitle
                        });
                    }
                } catch (linkError) {
                    // Skip invalid links
                    continue;
                }
            }
            
            if (validPostUrls.length > 0) {
                // Sort by priority and return the best match
                validPostUrls.sort((a, b) => a.priority - b.priority);
                const bestMatch = validPostUrls[0];
                
                console.log(`✅ Found ${validPostUrls.length} potential post URLs, best match:`, bestMatch);
                return bestMatch;
            }
            
            console.log('⚠️ No valid post URLs found in ultimate fallback');
            return null;

        } catch (error) {
            console.error('Error in ultimate fallback:', error);
            return null;
        }
    }

    // Enhanced URL validation
    async isValidNavigationTarget(url) {
        try {
            if (!url || typeof url !== 'string') {
                console.warn('Invalid URL provided:', url);
                return false;
            }

            // Check for invalid URL patterns
            if (url === '/' || url === '' || url === '#' || url === 'javascript:void(0)') {
                console.warn('Invalid URL pattern detected:', url);
                return false;
            }
            
            const urlObj = new URL(url, window.location.origin);
            
            // Check if URL is valid
            if (!urlObj.href) return false;
            
            // Check if URL is already visited using comprehensive visited URL checking
            const isVisited = await this.isUrlVisitedComprehensive(url);
            if (isVisited) {
                console.log('🚫 URL already visited, skipping:', url);
                return false;
            }

            // Check if URL is external (including subdomain check)
            if (!this.isSameDomain(urlObj.hostname, window.location.hostname)) {
                console.log('⚠️ External domain detected, skipping:', urlObj.hostname);
                return false;
            }

            // Check if URL leads to a different page
            if (urlObj.href === window.location.href) return false;
            
            // Check for valid post URLs (should have meaningful path)
            const pathname = urlObj.pathname;
            if (pathname === '/' || pathname === '/index.php') {
                console.warn('Homepage URL detected, not a valid post:', url);
                return false;
            }

            // Check for minimum path length (avoid very short paths)
            if (pathname.length < 3) {
                console.warn('URL path too short, likely not a post:', url);
                return false;
            }

            // Exclude admin, author, and other non-post pages
            const excludePatterns = [
                /\/author\//,
                /\/admin\//,
                /\/administrator\//,
                /\/wp-admin\//,
                /\/wp-content\//,
                /\/wp-includes\//,
                /\/login\//,
                /\/register\//,
                /\/profile\//,
                /\/dashboard\//,
                /\/settings\//,
                /\/account\//,
                /\/user\//,
                /\/member\//,
                /\/moderator\//,
                /\/editor\//,
                /\/contributor\//,
                /\/subscriber\//
            ];
            
            // Check if URL matches any exclude pattern
            const shouldExclude = excludePatterns.some(pattern => pattern.test(pathname));
            if (shouldExclude) {
                console.warn('🚫 Excluding admin/author page:', pathname);
                return false;
            }
            
            return true;
        } catch (error) {
            console.warn('Invalid URL:', url, error);
            return false;
        }
    }

    // Enhanced page type detection
    getCurrentPageType() {
        const currentUrl = window.location.href;
        const cacheKey = `pageType_${currentUrl}`;
        
        if (this.config.enableCaching && this.urlPatternCache.has(cacheKey)) {
            const cached = this.urlPatternCache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.config.cacheTimeout) {
                return cached.pageType;
            }
        }

        const pageType = this.detectPageTypeEnhanced();
        
        // Cache the result
        if (this.config.enableCaching) {
            this.urlPatternCache.set(cacheKey, {
                pageType: pageType,
                timestamp: Date.now()
            });
        }
        
        return pageType;
    }

    detectPageTypeEnhanced() {
        const currentUrl = window.location.href;
        const url = new URL(currentUrl);
        const pathname = url.pathname;
        
        console.log('🔍 Enhanced page type detection for:', pathname);
        
        // Check URL parameters first
        const urlParams = new URLSearchParams(url.search);
        const hasCategoryParam = urlParams.has('cat') || urlParams.has('category') || 
                                urlParams.has('tag') || urlParams.has('taxonomy');
        
        if (hasCategoryParam) {
            console.log('🏷️ Category page detected via URL parameters');
            return 'category';
        }
        
        // Check for WordPress specific patterns
        const isWordPressHome = urlParams.has('page_id') || 
                               (pathname === '/' && !urlParams.has('p')) ||
                               (pathname === '/index.php' && !urlParams.has('p'));
        
        if (isWordPressHome) {
            console.log('🏠 WordPress home page detected');
            return 'home';
        }
        
        if (urlParams.has('p')) {
            console.log('📝 WordPress individual post detected');
            return 'post';
        }
        
        // Check patterns with priority
        const pageTypes = ['home', 'category', 'post'];
        
        for (const pageType of pageTypes) {
            const patterns = this.urlPatterns[pageType];
            if (patterns) {
                for (const patternObj of patterns) {
                    if (patternObj.pattern.test(pathname)) {
                        console.log(`✅ ${pageType} page detected via pattern: ${patternObj.name}`);
                        return pageType;
                    }
                }
            }
        }
        
        // Default logic
        if (pathname === '/' || pathname === '' || pathname.split('/').length <= 2) {
            console.log('🏠 Defaulting to home page (short pathname)');
            return 'home';
        }
        
        console.log('❓ Unknown page type, defaulting to post');
        return 'post';
    }

    // Utility methods
    getHomepageUrl() {
        const currentUrl = window.location.href;
        const url = new URL(currentUrl);
        return `${url.protocol}//${url.host}/`;
    }

    // Navigation tracking
    recordNavigationSuccess(result, strategy) {
        this.navigationState.successRate = 
            (this.navigationState.successRate * this.navigationState.navigationHistory.length + 1) / 
            (this.navigationState.navigationHistory.length + 1);
        
        this.navigationState.navigationHistory.push({
            timestamp: Date.now(),
            strategy: strategy,
            result: result,
            success: true
        });
        
        this.navigationState.lastNavigation = result;
        this.navigationState.failedAttempts = 0;
        
        console.log(`✅ Navigation success recorded. Success rate: ${this.navigationState.successRate.toFixed(2)}`);
    }

    recordNavigationFailure(strategy, error) {
        this.navigationState.failedAttempts++;
        
        this.navigationState.navigationHistory.push({
            timestamp: Date.now(),
            strategy: strategy,
            error: error,
            success: false
        });
        
        console.log(`❌ Navigation failure recorded. Failed attempts: ${this.navigationState.failedAttempts}`);
    }

    // Performance monitoring
    getPerformanceMetrics() {
        return {
            totalQueries: this.performanceMetrics.totalQueries,
            cacheHits: this.performanceMetrics.cacheHits,
            cacheMisses: this.performanceMetrics.cacheMisses,
            cacheHitRate: this.performanceMetrics.totalQueries > 0 ? 
                this.performanceMetrics.cacheHits / this.performanceMetrics.totalQueries : 0,
            averageQueryTime: this.performanceMetrics.averageQueryTime,
            lastQueryTime: this.performanceMetrics.lastQueryTime
        };
    }

    getNavigationStats() {
        return {
            currentPage: this.navigationState.currentPage,
            visitedUrls: this.navigationState.visitedUrls.size,
            navigationHistory: this.navigationState.navigationHistory.length,
            lastNavigation: this.navigationState.lastNavigation,
            failedAttempts: this.navigationState.failedAttempts,
            successRate: this.navigationState.successRate
        };
    }

    // Configuration management
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        console.log('⚙️ Navigation Engine config updated:', this.config);
    }

    getConfig() {
        return { ...this.config };
    }

    // Cache management
    clearCache() {
        this.selectorCache.clear();
        this.urlPatternCache.clear();
        this.navigationCache.clear();
        console.log('🧹 All navigation caches cleared');
    }

    getCacheStats() {
        return {
            selectorCacheSize: this.selectorCache.size,
            urlPatternCacheSize: this.urlPatternCache.size,
            navigationCacheSize: this.navigationCache.size,
            lastCleanup: this.lastCleanup
        };
    }

    // Missing methods implementation
    async loadSessionHistory() {
        try {
            // Load navigation history from unified storage
            if (this.storageService) {
                const savedHistory = await this.storageService.get('navigationHistory');
                
                if (savedHistory) {
                    this.navigationState.navigationHistory = savedHistory;
                    console.log('📊 Navigation history loaded from unified storage:', this.navigationState.navigationHistory.length, 'entries');
                } else {
                    this.navigationState.navigationHistory = [];
                    console.log('📊 No navigation history found, initialized empty array');
                }
            } else {
                this.navigationState.navigationHistory = [];
                console.log('📊 Storage service not available, initialized empty navigation history');
            }
        } catch (error) {
            console.warn('Error loading navigation history from unified storage:', error);
            this.navigationState.navigationHistory = [];
        }
    }

    initializeAdaptiveLimits() {
        try {
            // Initialize adaptive limits for navigation
            this.adaptiveLimits = {
                maxRetries: this.config.maxRetries,
                fallbackTimeout: this.config.fallbackTimeout,
                selectorAttempts: this.config.maxSelectorAttempts,
                cacheTimeout: this.config.cacheTimeout
            };
            
            console.log('⚙️ Adaptive limits initialized:', this.adaptiveLimits);
        } catch (error) {
            console.warn('Error initializing adaptive limits:', error);
        }
    }



    // Get all visited URLs from various sources
    async getVisitedUrls() {
        try {
            const visitedUrls = new Set();

            // Add URLs from navigation history
            this.navigationState.navigationHistory.forEach(entry => {
                visitedUrls.add(entry.url);
            });

            // Add URLs from unified storage if available
            try {
                if (this.storageService) {
                    const storedVisitedUrls = await this.storageService.get('visitedUrls');
                    if (storedVisitedUrls) {
                        storedVisitedUrls.forEach(url => visitedUrls.add(url));
                    }
                }
            } catch (error) {
                console.warn('Error loading visited URLs from unified storage:', error);
            }

            return Array.from(visitedUrls);

        } catch (error) {
            console.error('Error getting visited URLs:', error);
            return [];
        }
    }

    // Normalize URL for comparison (remove hash, normalize query params)
    normalizeUrl(url) {
        try {
            const urlObj = new URL(url);
            // Remove trailing slash for consistency
            let normalized = urlObj.origin + urlObj.pathname + urlObj.search;
            if (normalized.endsWith('/') && normalized !== urlObj.origin + '/') {
                normalized = normalized.slice(0, -1);
            }
            return normalized;
        } catch (error) {
            // If URL parsing fails, return original URL
            return url;
        }
    }

    // Consolidate visited URL checking from all sources
    async isUrlVisitedComprehensive(url) {
        try {
            if (!url || typeof url !== 'string') {
                return false;
            }

            const normalizedUrl = this.normalizeUrl(url);
            console.log('🔍 Checking if URL is visited:', url, '-> Normalized:', normalizedUrl);

            // Check navigation history
            const isInHistory = this.navigationState.navigationHistory.some(entry => {
                const normalizedEntry = this.normalizeUrl(entry.url);
                return normalizedEntry === normalizedUrl;
            });

            if (isInHistory) {
                console.log('📍 URL found in navigation history:', url);
                return true;
            }
            


            // Check regular visited URLs from unified storage
            try {
                if (this.storageService) {
                    const storedVisitedUrls = await this.storageService.get('visitedUrls');
                    if (storedVisitedUrls) {
                        const isInStorage = storedVisitedUrls.some(storedUrl => {
                            const normalizedStored = this.normalizeUrl(storedUrl);
                            return normalizedStored === normalizedUrl;
                        });

                        if (isInStorage) {
                            console.log('📍 URL found in visited URLs storage:', url);
                            return true;
                        }
                    }
                }
            } catch (error) {
                console.warn('Error checking visited URLs from unified storage:', error);
            }
            
            console.log('🆕 URL not visited yet:', url);
            return false;

        } catch (error) {
            console.error('Error in comprehensive visited URL check:', error);
            return false;
        }
    }

    // Mark URL as visited
    async markUrlAsVisited(url) {
        try {
            if (!url || typeof url !== 'string') {
                console.warn('Invalid URL provided to markUrlAsVisited:', url);
                return false;
            }

            // Add to navigation history
            this.navigationState.navigationHistory.push({
                timestamp: Date.now(),
                url: url,
                type: this.getCurrentPageType(),
                success: true
            });

            // Save to unified storage
            try {
                if (this.storageService) {
                    const visitedUrls = await this.getVisitedUrls();
                    if (!visitedUrls.includes(url)) {
                        visitedUrls.push(url);
                        await this.storageService.set('visitedUrls', visitedUrls);
                    }
                }
            } catch (error) {
                console.warn('Error saving visited URL to unified storage:', error);
            }

            console.log('✅ URL marked as visited:', url);
            return true;

        } catch (error) {
            console.error('Error marking URL as visited:', error);
                return false;
        }
    }

    // Check if current page is already visited
    async isCurrentPageVisited() {
        try {
            const currentUrl = window.location.href;
            return await this.isUrlVisitedComprehensive(currentUrl);
        } catch (error) {
            console.error('Error checking if current page is visited:', error);
            return false;
        }
    }

    





    // Navigate to a specific post URL
    async navigateToPost(url) {
        try {
            if (!url || typeof url !== 'string') {
                console.warn('Invalid URL provided to navigateToPost:', url);
                return false;
            }

            console.log('🧭 Navigating to post:', url);

            // Validate URL using existing method
            if (!(await this.isValidNavigationTarget(url))) {
                console.warn('Invalid URL format or already visited:', url);
                return false;
            }

            // Check if URL is already visited
            const isVisited = await this.isUrlVisitedComprehensive(url);
            if (isVisited) {
                console.log('⚠️ URL already visited, but proceeding with navigation:', url);
            }

            // Perform navigation
            try {
                // Use window.location.href for navigation
                window.location.href = url;
                
                // Mark as successful navigation using existing method
                this.recordNavigationSuccess({ url: url, type: 'direct_navigation' }, 'navigateToPost');
                
                console.log('✅ Navigation initiated successfully to:', url);
                return true;

            } catch (navigationError) {
                console.error('Error during navigation:', navigationError);
                this.recordNavigationFailure('navigateToPost', navigationError);
                return false;
            }

        } catch (error) {
            console.error('Error in navigateToPost:', error);
            return false;
        }
    }





    async updateUserBehaviorPatterns() {
        try {
            // Update user behavior patterns based on navigation
            const currentTime = Date.now();
            const currentUrl = window.location.href;
            
            // Record navigation pattern
            this.navigationState.navigationHistory.push({
                timestamp: currentTime,
                url: currentUrl,
                type: this.getCurrentPageType(),
                success: true
            });
            
            // Limit history size
            if (this.navigationState.navigationHistory.length > 100) {
                this.navigationState.navigationHistory = this.navigationState.navigationHistory.slice(-100);
            }
            
            // Save to unified storage
            try {
                if (this.storageService) {
                    await this.storageService.set('navigationHistory', this.navigationState.navigationHistory);
                }
            } catch (error) {
                console.warn('Error saving navigation history to unified storage:', error);
            }
        } catch (error) {
            console.warn('Error updating user behavior patterns:', error);
        }
    }

    updateOptimizationData() {
        try {
            // Update optimization data based on navigation performance
            const currentMetrics = this.getPerformanceMetrics();
            
            // Calculate success rate
            const recentNavigations = this.navigationState.navigationHistory.slice(-20);
            const successfulNavigations = recentNavigations.filter(nav => nav.success).length;
            const successRate = recentNavigations.length > 0 ? 
                successfulNavigations / recentNavigations.length : 1.0;
            
            // Update navigation state
            this.navigationState.successRate = successRate;
            
            // Generate optimization recommendations
            if (successRate < 0.7) {
                console.log('⚠️ Low navigation success rate detected:', successRate.toFixed(2));
            }
        } catch (error) {
            console.warn('Error updating optimization data:', error);
        }
    }

    updatePerformanceHistory() {
        try {
            // Update performance history
            const currentEntry = {
                timestamp: Date.now(),
                url: window.location.href,
                pageType: this.getCurrentPageType(),
                cacheStats: this.getCacheStats(),
                performance: this.getPerformanceMetrics()
            };
            
            // This would be stored in a performance history array if needed
            console.log('📊 Performance history updated for:', currentEntry.url);
        } catch (error) {
            console.warn('Error updating performance history:', error);
        }
    }
}
