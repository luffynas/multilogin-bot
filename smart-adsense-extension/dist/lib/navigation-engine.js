/**
 * Navigation Engine - Mencari dan navigasi ke post berikutnya
 */

class NavigationEngine {
    constructor() {
        this.navigationSelectors = {
            previous: [
                '.prev-post',
                '.previous-post',
                '.nav-previous',
                '.pagination-prev',
                'a[rel="prev"]',
                '.post-navigation .prev',
                '.navigation .prev'
            ],
            next: [
                '.next-post',
                '.next-post',
                '.nav-next',
                '.pagination-next',
                'a[rel="next"]',
                '.post-navigation .next',
                '.navigation .next'
            ],
            related: [
                '.related-posts',
                '.related-articles',
                '.similar-posts',
                '.recommended-posts',
                '.more-posts',
                '.post-suggestions'
            ],
            random: [
                '.random-posts',
                '.popular-posts',
                '.featured-posts',
                '.latest-posts',
                '.recent-posts',
                '.blog-posts a',
                '.post-list a',
                '.article-list a'
            ],
            // New selectors for post links on home/category pages
            postLinks: [
                // Common post link selectors
                '.post-title a',
                '.entry-title a',
                '.article-title a',
                '.blog-post-title a',
                '.post-heading a',
                '.post-link',
                '.entry-link',
                '.article-link',
                
                // Container-based selectors
                '.post a[href*="/post/"]',
                '.post a[href*="/article/"]',
                '.post a[href*="/blog/"]',
                '.entry a[href*="/post/"]',
                '.entry a[href*="/article/"]',
                '.entry a[href*="/blog/"]',
                '.article a[href*="/post/"]',
                '.article a[href*="/article/"]',
                '.article a[href*="/blog/"]',
                
                // List-based selectors
                '.post-list .post a',
                '.post-list .entry a',
                '.post-list .article a',
                '.article-list .post a',
                '.article-list .entry a',
                '.article-list .article a',
                '.blog-list .post a',
                '.blog-list .entry a',
                '.blog-list .article a',
                
                // Grid-based selectors
                '.post-grid .post a',
                '.post-grid .entry a',
                '.post-grid .article a',
                '.article-grid .post a',
                '.article-grid .entry a',
                '.article-grid .article a',
                
                // Generic post patterns
                'a[href*="/post/"]',
                'a[href*="/article/"]',
                'a[href*="/blog/"]',
                'a[href*="/news/"]',
                'a[href*="/2024/"]',
                'a[href*="/2023/"]',
                'a[href*="/2022/"]',
                'a[href*="/2021/"]',
                'a[href*="/2020/"]',
                
                // WordPress specific
                '.post a[href*="?p="]',
                '.entry a[href*="?p="]',
                '.article a[href*="?p="]',
                
                // Category page specific
                '.category-posts a',
                '.category-articles a',
                '.taxonomy-posts a',
                '.archive-posts a',
                '.archive-articles a'
            ],
            // Recent post selectors
            recentPosts: [
                // Common recent post selectors
                '.recent-posts a',
                '.latest-posts a',
                '.new-posts a',
                '.recent-articles a',
                '.latest-articles a',
                '.new-articles a',
                '.recent-blog-posts a',
                '.latest-blog-posts a',
                '.new-blog-posts a',
                
                // Container-based recent selectors
                '.recent-posts .post a',
                '.recent-posts .entry a',
                '.recent-posts .article a',
                '.latest-posts .post a',
                '.latest-posts .entry a',
                '.latest-posts .article a',
                '.new-posts .post a',
                '.new-posts .entry a',
                '.new-posts .article a',
                
                // Sidebar recent posts
                '.sidebar .recent-posts a',
                '.sidebar .latest-posts a',
                '.sidebar .new-posts a',
                '.widget .recent-posts a',
                '.widget .latest-posts a',
                '.widget .new-posts a',
                
                // Widget-based selectors
                '.recent-posts-widget a',
                '.latest-posts-widget a',
                '.new-posts-widget a',
                '.recent-articles-widget a',
                '.latest-articles-widget a',
                '.new-articles-widget a',
                
                // WordPress specific recent selectors
                '.widget_recent_entries a',
                '.widget_recent_posts a',
                '.recent-posts-widget a',
                '.latest-posts-widget a',
                
                // Time-based selectors (posts from last 7-30 days)
                '.recent-7-days a',
                '.recent-30-days a',
                '.latest-week a',
                '.latest-month a',
                
                // Featured recent posts
                '.featured-recent a',
                '.highlighted-recent a',
                '.spotlight-recent a',
                
                // Category-specific recent posts
                '.recent-category-posts a',
                '.latest-category-posts a',
                '.category-recent a',
                
                // Generic recent patterns
                'a[href*="/recent/"]',
                'a[href*="/latest/"]',
                'a[href*="/new/"]',
                'a[href*="/2024/"]', // Current year posts
                'a[href*="/2023/"]'  // Last year posts
            ]
        };
        
        this.visitedUrls = new Set();
        this.maxPostsPerSession = 5;
        
        // Add current page to visited URLs on initialization
        this.addCurrentPageToVisited();
    }

    addCurrentPageToVisited() {
        const currentUrl = window.location.href;
        this.visitedUrls.add(currentUrl);
        console.log('📍 Added current page to visited URLs:', currentUrl);
    }

    addToVisitedUrls(url) {
        if (url && typeof url === 'string') {
            this.visitedUrls.add(url);
            console.log('📝 Added to visited URLs:', url);
            console.log('📊 Total visited URLs:', this.visitedUrls.size);
        }
    }

    isUrlVisited(url) {
        if (!url || typeof url !== 'string') return false;
        
        // Check exact match
        if (this.visitedUrls.has(url)) {
            console.log('🚫 URL already visited (exact match):', url);
            return true;
        }
        
        // Check without hash fragments
        try {
            const urlObj = new URL(url, window.location.origin);
            const urlWithoutHash = urlObj.origin + urlObj.pathname + urlObj.search;
            
            for (const visitedUrl of this.visitedUrls) {
                const visitedUrlObj = new URL(visitedUrl, window.location.origin);
                const visitedWithoutHash = visitedUrlObj.origin + visitedUrlObj.pathname + visitedUrlObj.search;
                
                if (urlWithoutHash === visitedWithoutHash) {
                    console.log('🚫 URL already visited (without hash):', url);
                    return true;
                }
            }
        } catch (error) {
            console.warn('Error checking visited URL:', error);
        }
        
        return false;
    }

    getVisitedUrlsInfo() {
        return {
            total: this.visitedUrls.size,
            urls: Array.from(this.visitedUrls),
            maxPosts: this.maxPostsPerSession,
            remaining: this.maxPostsPerSession - this.visitedUrls.size
        };
    }

    findNavigationLinks() {
        const currentPageInfo = this.getCurrentPageInfo();
        const pageType = this.detectPageType();
        
        console.log('🔍 Searching for navigation links on:', currentPageInfo.withoutHash);
        console.log('📄 Page type detected:', pageType);
        
        let links;
        
        if (pageType === 'home' || pageType === 'category') {
            // On home/category pages, look for post links
            links = {
                previous: [],
                next: [],
                related: [],
                random: [],
                postLinks: this.findPostLinks(),
                recentPosts: this.findRecentPosts()
            };
            
            console.log('🏠 Home/Category page detected - focusing on post links and recent posts');
        } else {
            // On individual post pages, look for navigation links
            links = {
                previous: this.findPreviousLinks(),
                next: this.findNextLinks(),
                related: this.findRelatedLinks(),
                random: this.findRandomLinks(),
                postLinks: [],
                recentPosts: this.findRecentPosts()
            };
            
            console.log('📝 Individual post page detected - focusing on navigation links and recent posts');
        }

        console.log('🔗 Found navigation links:', {
            previous: links.previous.length,
            next: links.next.length,
            related: links.related.length,
            random: links.random.length,
            postLinks: links.postLinks.length,
            recentPosts: links.recentPosts.length
        });

        // Log current page info for debugging
        console.log('📍 Current page info:', currentPageInfo);
        
        // Log visited URLs info
        const visitedInfo = this.getVisitedUrlsInfo();
        console.log('📊 Visited URLs info:', visitedInfo);

        return links;
    }

    findBestNavigationTarget(content = null) {
        const pageType = this.detectPageType();
        console.log('🎯 Finding best navigation target for page type:', pageType);
        
        if (pageType === 'home' || pageType === 'category') {
            // On home/category pages, prioritize recent posts first
            const recentUrl = this.findRecentPost();
            if (recentUrl) {
                console.log('🕒 Selected recent post from home/category page:', recentUrl);
                return recentUrl;
            }
            
            // Then try regular post links
            const postUrl = this.findPostFromHomeOrCategory();
            if (postUrl) {
                console.log('🏠 Selected post from home/category page:', postUrl);
                return postUrl;
            }
            
            // Fallback to random links if no post links found
            console.log('⚠️ No post links found, trying random links as fallback');
            return this.findRandomPost();
        } else {
            // On individual post pages, use existing navigation logic with recent posts
            console.log('📝 Using post navigation logic with recent posts');
            
            // Try recent posts first (fresh content)
            const recentUrl = this.findRecentPost();
            if (recentUrl) {
                console.log('🕒 Selected recent post:', recentUrl);
                return recentUrl;
            }
            
            // Try next post
            const nextUrl = this.findPreviousNextPost();
            if (nextUrl) {
                return nextUrl;
            }
            
            // Try related post
            const relatedUrl = this.findRelatedPost(content);
            if (relatedUrl) {
                return relatedUrl;
            }
            
            // Try random post
            const randomUrl = this.findRandomPost();
            if (randomUrl) {
                return randomUrl;
            }
        }
        
        console.log('❌ No navigation target found');
        return null;
    }

    findPreviousNextPost() {
        // Try to find next post first (more common)
        const nextLinks = this.findNextLinks();
        if (nextLinks.length > 0) {
            const nextLink = this.selectBestLink(nextLinks);
            console.log('✅ Found next post:', nextLink.href);
            return nextLink.href;
        }

        // Try to find previous post
        const prevLinks = this.findPreviousLinks();
        if (prevLinks.length > 0) {
            const prevLink = this.selectBestLink(prevLinks);
            console.log('✅ Found previous post:', prevLink.href);
            return prevLink.href;
        }

        console.log('ℹ️ No previous/next posts found');
        return null;
    }

    findRelatedPost(content) {
        const relatedLinks = this.findRelatedLinks();
        
        if (relatedLinks.length === 0) {
            console.log('ℹ️ No related posts found');
            return null;
        }

        // Score links based on content relevance
        const scoredLinks = relatedLinks.map(link => ({
            link,
            score: this.calculateRelevanceScore(link, content)
        }));

        // Sort by relevance score
        scoredLinks.sort((a, b) => b.score - a.score);

        const bestLink = scoredLinks[0].link;
        console.log('✅ Found related post:', bestLink.href, 'score:', scoredLinks[0].score);
        return bestLink.href;
    }

    findRandomPost() {
        const randomLinks = this.findRandomLinks();
        
        if (randomLinks.length === 0) {
            console.log('ℹ️ No random posts found');
            return null;
        }

        const randomLink = this.selectBestLink(randomLinks);
        console.log('✅ Found random post:', randomLink.href);
        return randomLink.href;
    }

    findPostFromHomeOrCategory() {
        const postLinks = this.findPostLinks();
        
        if (postLinks.length === 0) {
            console.log('ℹ️ No post links found on home/category page');
            return null;
        }

        const selectedPost = this.selectBestLink(postLinks);
        if (selectedPost) {
            console.log('✅ Selected post from home/category page:', selectedPost.href);
            return selectedPost.href;
        }

        console.log('ℹ️ No valid post links found on home/category page');
        return null;
    }

    findRecentPost() {
        const recentLinks = this.findRecentPosts();
        
        if (recentLinks.length === 0) {
            console.log('ℹ️ No recent posts found');
            return null;
        }

        const selectedRecent = this.selectBestLink(recentLinks);
        if (selectedRecent) {
            console.log('✅ Selected recent post:', selectedRecent.href);
            return selectedRecent.href;
        }

        console.log('ℹ️ No valid recent posts found');
        return null;
    }

    findPreviousLinks() {
        const links = [];
        
        this.navigationSelectors.previous.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (element.href && this.isValidPostLink(element.href) && !this.isTOCLink(element)) {
                    links.push(element);
                }
            });
        });

        console.log('⬅️ Previous links found:', links.map(link => link.href));
        return links;
    }

    findNextLinks() {
        const links = [];
        
        this.navigationSelectors.next.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (element.href && this.isValidPostLink(element.href) && !this.isTOCLink(element)) {
                    links.push(element);
                }
            });
        });

        console.log('➡️ Next links found:', links.map(link => link.href));
        return links;
    }

    findRelatedLinks() {
        const links = [];
        
        this.navigationSelectors.related.forEach(selector => {
            const container = document.querySelector(selector);
            if (container) {
                const linkElements = container.querySelectorAll('a[href]');
                linkElements.forEach(element => {
                    if (element.href && this.isValidPostLink(element.href) && !this.isTOCLink(element)) {
                        links.push(element);
                    }
                });
            }
        });

        console.log('🔗 Related links found:', links.map(link => link.href));
        return links;
    }

    findRandomLinks() {
        const links = [];
        
        this.navigationSelectors.random.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (element.href && this.isValidPostLink(element.href) && !this.isTOCLink(element)) {
                    links.push(element);
                }
            });
        });

        console.log('🎲 Random links found:', links.map(link => link.href));
        return links;
    }

    findPostLinks() {
        const links = [];
        
        this.navigationSelectors.postLinks.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (element.href && this.isValidPostLink(element.href) && !this.isTOCLink(element)) {
                    links.push(element);
                }
            });
        });

        console.log('📝 Post links found:', links.map(link => link.href));
        return links;
    }

    findRecentPosts() {
        const links = [];
        
        this.navigationSelectors.recentPosts.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (element.href && this.isValidPostLink(element.href) && !this.isTOCLink(element)) {
                    links.push(element);
                }
            });
        });

        console.log('🕒 Recent posts found:', links.map(link => link.href));
        return links;
    }

    selectBestLink(links) {
        if (links.length === 0) return null;

        // Filter out already visited links and current page
        const validLinks = links.filter(link => {
            // Check if not visited
            if (this.isUrlVisited(link.href)) {
                console.log('🚫 Filtering out visited link:', link.href);
                return false;
            }
            
            // Check if not current page
            if (this.isCurrentPage(link.href)) {
                console.log('🚫 Filtering out current page link:', link.href);
                return false;
            }
            
            return true;
        });

        if (validLinks.length === 0) {
            console.log('⚠️ No valid unvisited links found');
            
            // Check if we should reset session
            if (this.shouldResetSession()) {
                console.log('🔄 Resetting session due to no valid links');
                this.forceResetSession();
                
                // Try again with reset session
                const resetValidLinks = links.filter(link => !this.isCurrentPage(link.href));
                
                if (resetValidLinks.length === 0) {
                    console.log('❌ No valid links found even after reset');
                    return null;
                }
                
                const selectedLink = resetValidLinks[0];
                console.log('✅ Selected link after session reset:', selectedLink.href);
                return selectedLink;
            } else {
                console.log('❌ No valid links found and session not ready for reset');
                return null;
            }
        }

        // Select random valid link
        const randomIndex = Math.floor(Math.random() * validLinks.length);
        const selectedLink = validLinks[randomIndex];
        console.log('✅ Selected valid link for navigation:', selectedLink.href);
        return selectedLink;
    }

    calculateRelevanceScore(link, content) {
        let score = 0;
        const linkText = link.textContent.toLowerCase();
        const linkTitle = link.title ? link.title.toLowerCase() : '';
        const contentText = content.text ? content.text.toLowerCase() : '';

        // Extract keywords from content
        const contentKeywords = this.extractKeywords(contentText);
        
        // Check for keyword matches
        contentKeywords.forEach(keyword => {
            if (linkText.includes(keyword) || linkTitle.includes(keyword)) {
                score += 1;
            }
        });

        // Bonus for exact title matches
        if (content.title && linkText.includes(content.title.toLowerCase())) {
            score += 5;
        }

        // Bonus for related keywords
        const relatedKeywords = ['related', 'similar', 'recommended', 'more'];
        relatedKeywords.forEach(keyword => {
            if (linkText.includes(keyword)) {
                score += 2;
            }
        });

        return score;
    }

    extractKeywords(text) {
        if (!text || typeof text !== 'string') return [];

        // Simple keyword extraction
        const words = text.split(/\s+/)
            .filter(word => word.length > 3) // Filter out short words
            .filter(word => !this.isCommonWord(word)) // Filter out common words
            .slice(0, 10); // Take top 10 words

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

    isTOCLink(element) {
        if (!element || !element.href) return false;

        try {
            const url = new URL(element.href, window.location.origin);
            const linkText = (element.textContent || '').toLowerCase().trim();
            const linkTitle = (element.title || '').toLowerCase().trim();
            const linkClass = (element.className || '').toLowerCase();
            const linkId = (element.id || '').toLowerCase();
            const linkHref = element.href.toLowerCase();
            
            // Debug logging for troubleshooting
            if (element.href.includes('aplikasi-penghasil-uang-2025-yougov')) {
                console.log('🔍 Debugging TOC detection for:', element.href);
                this.debugTOCDetection(element);
            }

            // Check for anchor links (hash fragments)
            if (url.hash && url.hash.length > 0) {
                console.log('🚫 TOC detected: Anchor link', element.href);
                return true;
            }

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
                if (linkText.includes(pattern) || linkTitle.includes(pattern)) {
                    console.log('🚫 TOC detected: Text pattern', pattern, element.href);
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
                if (linkClass.includes(pattern) || linkId.includes(pattern)) {
                    console.log('🚫 TOC detected: Class/ID pattern', pattern, element.href);
                    return true;
                }
            }

            // Check for TOC-related URL patterns
            const tocUrlPatterns = [
                /#toc/i,
                /#table-of-contents/i,
                /#contents/i,
                /#index/i,
                /#menu/i,
                /#nav/i,
                /toc/i,
                /table-of-contents/i,
                /contents/i,
                /rswebsols-toc/i // Specific pattern from log
            ];

            for (const pattern of tocUrlPatterns) {
                if (pattern.test(linkHref)) {
                    console.log('🚫 TOC detected: URL pattern', pattern, element.href);
                    return true;
                }
            }

            // Check if link is inside a TOC container (more specific selectors)
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

            // More specific TOC container detection
            const specificTOCSelectors = [
                '.toc-container',
                '.table-of-contents-container',
                '.contents-container',
                '.index-container',
                '.menu-container',
                '.nav-container',
                '.navigation-container',
                '.outline-container',
                '.summary-container',
                '[role="navigation"]',
                '[aria-label*="table of contents"]',
                '[aria-label*="contents"]',
                '[aria-label*="index"]',
                '[aria-label*="menu"]',
                '[data-toc]',
                '[data-contents]',
                '[data-index]'
            ];

            // Check for specific TOC containers first (higher priority)
            for (const selector of specificTOCSelectors) {
                if (element.closest(selector)) {
                    console.log('🚫 TOC detected: Inside specific TOC container', selector, element.href);
                    return true;
                }
            }

            // Check for general TOC containers with additional validation
            for (const selector of tocContainerSelectors) {
                if (element.closest(selector)) {
                    // Additional validation for broad selectors like .navigation
                    const container = element.closest(selector);
                    const containerText = (container.textContent || '').toLowerCase();
                    const containerClass = (container.className || '').toLowerCase();
                    const containerId = (container.id || '').toLowerCase();
                    
                    // Check if this is actually a TOC container
                    const tocIndicators = [
                        'table of contents',
                        'table of content',
                        'contents',
                        'content',
                        'toc',
                        'index',
                        'outline',
                        'summary',
                        'chapter',
                        'section',
                        'part'
                    ];
                    
                    const hasTOCIndicator = tocIndicators.some(indicator => 
                        containerText.includes(indicator) || 
                        containerClass.includes(indicator) || 
                        containerId.includes(indicator)
                    );
                    
                    // Check if container has many links (typical of TOC)
                    const linkCount = container.querySelectorAll('a').length;
                    const isHighLinkCount = linkCount > 10; // TOC usually has many links
                    
                    // Check if links are mostly anchor links (typical of TOC)
                    const anchorLinks = container.querySelectorAll('a[href^="#"]').length;
                    const totalLinks = container.querySelectorAll('a').length;
                    const isMostlyAnchors = totalLinks > 0 && (anchorLinks / totalLinks) > 0.7;
                    
                    // Only consider it TOC if it has clear TOC indicators or characteristics
                    if (hasTOCIndicator || (isHighLinkCount && isMostlyAnchors)) {
                        console.log('🚫 TOC detected: Inside TOC container with indicators', selector, element.href);
                        return true;
                    } else {
                        console.log('✅ Not TOC: Container lacks TOC indicators', selector, element.href);
                    }
                }
            }

            return false;

        } catch (error) {
            console.warn('Error checking TOC link:', error);
            return false;
        }
    }

    isValidPostLink(href) {
        try {
            const url = new URL(href, window.location.origin);
            const currentUrl = new URL(window.location.href);
            
            // Must be same domain
            if (url.hostname !== window.location.hostname) {
                console.log('🚫 Skipping external link:', href);
                return false;
            }

            // Must not be current page (multiple checks for robustness)
            const currentPath = currentUrl.pathname;
            const currentSearch = currentUrl.search;
            const urlPath = url.pathname;
            const urlSearch = url.search;
            
            // Check if it's the same page (ignoring hash)
            if (urlPath === currentPath && urlSearch === currentSearch) {
                console.log('🚫 Skipping current page:', href);
                return false;
            }
            
            // Additional check for full URL comparison (without hash)
            const currentUrlWithoutHash = currentUrl.origin + currentUrl.pathname + currentUrl.search;
            const urlWithoutHash = url.origin + url.pathname + url.search;
            
            if (urlWithoutHash === currentUrlWithoutHash) {
                console.log('🚫 Skipping current page (without hash):', href);
                return false;
            }

            // Must not be visited recently
            if (this.isUrlVisited(href)) {
                console.log('🚫 Skipping recently visited URL:', href);
                return false;
            }

            // Check for table of contents links (anchor links)
            if (url.hash && url.hash.length > 0) {
                console.log('🚫 Skipping TOC/anchor link:', href);
                return false;
            }

            // Check for TOC-related patterns in URL
            const tocPatterns = [
                /#toc/i,
                /#table-of-contents/i,
                /#contents/i,
                /#index/i,
                /#menu/i,
                /#nav/i,
                /#rswebsols-toc/i, // Specific pattern from log
                /toc/i,
                /table-of-contents/i,
                /contents/i
            ];

            if (tocPatterns.some(pattern => pattern.test(url.href))) {
                console.log('🚫 Skipping TOC link:', href);
                return false;
            }

            // Must look like a post URL
            const path = url.pathname;
            const postPatterns = [
                /\/post\//,
                /\/article\//,
                /\/blog\//,
                /\/news\//,
                /\/[0-9]{4}\//, // Year pattern
                /\/[a-zA-Z0-9-]+\.html$/,
                /\/[a-zA-Z0-9-]+\/$/
            ];

            const isValidPost = postPatterns.some(pattern => pattern.test(path));
            
            if (isValidPost) {
                console.log('✅ Valid post link found:', href);
            } else {
                console.log('🚫 Not a valid post link:', href);
            }

            return isValidPost;

        } catch (error) {
            console.warn('Error validating post link:', error, href);
            return false;
        }
    }

    async navigateToPost(url) {
        console.log('🚀 Navigating to post:', url);
        
        // Final validation before navigation
        if (!this.isValidPostLink(url)) {
            console.error('❌ Cannot navigate to invalid post link:', url);
            return false;
        }
        
        // Check if it's the current page
        const currentUrl = new URL(window.location.href);
        const targetUrl = new URL(url, window.location.origin);
        
        const currentUrlWithoutHash = currentUrl.origin + currentUrl.pathname + currentUrl.search;
        const targetUrlWithoutHash = targetUrl.origin + targetUrl.pathname + targetUrl.search;
        
        if (currentUrlWithoutHash === targetUrlWithoutHash) {
            console.error('❌ Cannot navigate to current page:', url);
            return false;
        }
        
        // Mark URL as visited
        this.addToVisitedUrls(url);
        
        console.log('✅ Navigation validated, proceeding to:', url);
        
        // Navigate to the URL
        window.location.href = url;
        return true;
    }

    getNavigationStats() {
        const recentPosts = this.findRecentPosts();
        const postLinks = this.findPostLinks();
        
        return {
            visitedUrls: this.visitedUrls.size,
            maxPostsPerSession: this.maxPostsPerSession,
            remainingPosts: this.maxPostsPerSession - this.visitedUrls.size,
            recentPostsFound: recentPosts.length,
            postLinksFound: postLinks.length,
            totalAvailableLinks: recentPosts.length + postLinks.length
        };
    }

    resetSession() {
        this.visitedUrls.clear();
        console.log('🔄 Navigation session reset');
    }

    isSessionComplete() {
        return this.visitedUrls.size >= this.maxPostsPerSession;
    }

    shouldResetSession() {
        const visitedCount = this.visitedUrls.size;
        const maxPosts = this.maxPostsPerSession;
        
        if (visitedCount >= maxPosts) {
            console.log('🔄 Session limit reached, should reset session');
            return true;
        }
        
        // Reset if we have visited most posts but no more valid links
        if (visitedCount >= maxPosts * 0.8) {
            console.log('⚠️ Session nearly complete, consider reset');
            return true;
        }
        
        return false;
    }

    forceResetSession() {
        console.log('🔄 Force resetting navigation session');
        this.visitedUrls.clear();
        this.addCurrentPageToVisited();
        console.log('✅ Navigation session reset complete');
    }

    isCurrentPage(href) {
        try {
            const url = new URL(href, window.location.origin);
            const currentUrl = new URL(window.location.href);
            
            // Compare without hash fragments
            const currentUrlWithoutHash = currentUrl.origin + currentUrl.pathname + currentUrl.search;
            const urlWithoutHash = url.origin + url.pathname + url.search;
            
            return currentUrlWithoutHash === urlWithoutHash;
        } catch (error) {
            console.warn('Error checking if link is current page:', error);
            return false;
        }
    }

    getCurrentPageInfo() {
        const currentUrl = new URL(window.location.href);
        return {
            href: window.location.href,
            pathname: currentUrl.pathname,
            search: currentUrl.search,
            hash: currentUrl.hash,
            origin: currentUrl.origin,
            withoutHash: currentUrl.origin + currentUrl.pathname + currentUrl.search
        };
    }

    debugTOCDetection(element) {
        if (!element) return;
        
        const container = element.closest('.navigation, .nav, .menu, .toc, .contents, .index');
        if (container) {
            const containerText = (container.textContent || '').toLowerCase();
            const containerClass = (container.className || '').toLowerCase();
            const containerId = (container.id || '').toLowerCase();
            const linkCount = container.querySelectorAll('a').length;
            const anchorLinks = container.querySelectorAll('a[href^="#"]').length;
            const totalLinks = container.querySelectorAll('a').length;
            
            console.log('🔍 TOC Debug Info:', {
                elementHref: element.href,
                containerClass: containerClass,
                containerId: containerId,
                containerText: containerText.substring(0, 100) + '...',
                linkCount: linkCount,
                anchorLinks: anchorLinks,
                totalLinks: totalLinks,
                anchorRatio: totalLinks > 0 ? (anchorLinks / totalLinks).toFixed(2) : 0
            });
        }
    }

    detectPageType() {
        const currentUrl = new URL(window.location.href);
        const pathname = currentUrl.pathname.toLowerCase();
        const search = currentUrl.search.toLowerCase();
        
        // Check for home page patterns
        const homePatterns = [
            /^\/$/, // Root path
            /^\/home\/?$/,
            /^\/index\.html?$/,
            /^\/default\.html?$/,
            /^\/main\.html?$/,
            /^\/blog\/?$/,
            /^\/posts\/?$/,
            /^\/articles\/?$/
        ];
        
        // Check for category page patterns
        const categoryPatterns = [
            /\/category\//,
            /\/cat\//,
            /\/tag\//,
            /\/taxonomy\//,
            /\/archive\//,
            /\/section\//,
            /\/topic\//,
            /\/subject\//
        ];
        
        // Check for individual post patterns
        const postPatterns = [
            /\/post\//,
            /\/article\//,
            /\/blog\//,
            /\/news\//,
            /\/[0-9]{4}\/[0-9]{2}\//, // Year/month pattern
            /\/[0-9]{4}\//, // Year pattern
            /\/[a-zA-Z0-9-]+\.html$/,
            /\/[a-zA-Z0-9-]+\/$/
        ];
        
        // Check URL parameters
        const urlParams = new URLSearchParams(currentUrl.search);
        const hasCategoryParam = urlParams.has('cat') || urlParams.has('category') || 
                                urlParams.has('tag') || urlParams.has('taxonomy');
        
        // Check for WordPress specific patterns
        const isWordPressHome = urlParams.has('page_id') || 
                               (pathname === '/' && !urlParams.has('p')) ||
                               (pathname === '/index.php' && !urlParams.has('p'));
        
        // Check for category in URL params
        if (hasCategoryParam) {
            console.log('🏷️ Category page detected via URL parameters');
            return 'category';
        }
        
        // Check for home page
        for (const pattern of homePatterns) {
            if (pattern.test(pathname)) {
                console.log('🏠 Home page detected via pathname pattern:', pattern);
                return 'home';
            }
        }
        
        // Check for category page
        for (const pattern of categoryPatterns) {
            if (pattern.test(pathname)) {
                console.log('🏷️ Category page detected via pathname pattern:', pattern);
                return 'category';
            }
        }
        
        // Check for individual post
        for (const pattern of postPatterns) {
            if (pattern.test(pathname)) {
                console.log('📝 Individual post detected via pathname pattern:', pattern);
                return 'post';
            }
        }
        
        // Check WordPress specific logic
        if (isWordPressHome) {
            console.log('🏠 WordPress home page detected');
            return 'home';
        }
        
        // Check for WordPress post
        if (urlParams.has('p')) {
            console.log('📝 WordPress individual post detected');
            return 'post';
        }
        
        // Default to home if pathname is root or very short
        if (pathname === '/' || pathname === '' || pathname.split('/').length <= 2) {
            console.log('🏠 Defaulting to home page (short pathname)');
            return 'home';
        }
        
        console.log('❓ Unknown page type, defaulting to post');
        return 'post';
    }
}
