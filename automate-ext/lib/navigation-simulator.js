/**
 * Navigation Simulator - Intelligent page navigation and browsing patterns
 */

class NavigationSimulator {
    constructor(behaviorSimulator) {
        this.behaviorSimulator = behaviorSimulator;
        this.isNavigating = false;
        this.navigationHistory = [];
        this.currentPage = null;
        
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
        
        this.navigationHistory.push(this.currentPage);
    }

    /**
     * Simulate intelligent navigation
     */
    async simulateIntelligentNavigation(options = {}) {
        if (this.isNavigating) return;
        
        this.isNavigating = true;
        
        const personality = this.behaviorSimulator?.currentPersonality;
        const navigationType = this.chooseNavigationType(personality, options);
        
        switch (navigationType) {
            case 'related_content':
                await this.navigateRelatedContent();
                break;
            case 'category':
                await this.navigateToCategory();
                break;
            case 'previous_next':
                await this.navigatePreviousNext();
                break;
            case 'random':
                await this.navigateRandomPage();
                break;
            case 'search':
                await this.navigateSearchResults();
                break;
            case 'back':
                await this.navigateBack();
                break;
            case 'forward':
                await this.navigateForward();
                break;
            default:
                await this.navigateRelatedContent();
        }
        
        this.isNavigating = false;
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
     * Get navigation weights based on personality
     */
    getNavigationWeights(personality) {
        const baseWeights = {
            related_content: 0.3,
            category: 0.2,
            previous_next: 0.2,
            random: 0.1,
            search: 0.1,
            back: 0.05,
            forward: 0.05
        };
        
        if (!personality) return baseWeights;
        
        // Adjust weights based on personality type
        switch (personality.type) {
            case 'explorer':
                return {
                    ...baseWeights,
                    random: 0.3,
                    related_content: 0.4,
                    category: 0.2
                };
            case 'researcher':
                return {
                    ...baseWeights,
                    related_content: 0.5,
                    category: 0.3,
                    search: 0.2
                };
            case 'casual':
                return {
                    ...baseWeights,
                    previous_next: 0.4,
                    back: 0.2,
                    random: 0.2
                };
            case 'professional':
                return {
                    ...baseWeights,
                    related_content: 0.4,
                    category: 0.3,
                    search: 0.2
                };
            default:
                return baseWeights;
        }
    }

    /**
     * Navigate to related content
     */
    async navigateRelatedContent() {
        const links = this.findRelatedLinks();
        
        if (links.length > 0) {
            const selectedLink = this.selectBestLink(links);
            await this.clickLink(selectedLink);
        } else {
            // Fallback to category navigation
            await this.navigateToCategory();
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
            '.related a',
            '.similar a',
            '.recommended a',
            '.more a',
            '.next a'
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
     * Navigate to category page
     */
    async navigateToCategory() {
        const categoryLinks = this.findCategoryLinks();
        
        if (categoryLinks.length > 0) {
            const selectedLink = this.selectBestLink(categoryLinks);
            await this.clickLink(selectedLink);
        } else {
            // Fallback to random navigation
            await this.navigateRandomPage();
        }
    }

    /**
     * Find category links
     */
    findCategoryLinks() {
        const links = [];
        const selectors = [
            'a[href*="category"]',
            'a[href*="tag"]',
            'a[href*="section"]',
            'a[href*="topic"]',
            '.category a',
            '.tag a',
            '.section a',
            '.topic a',
            'nav a',
            '.navigation a',
            '.menu a'
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
        const prevNextLinks = this.findPreviousNextLinks();
        
        if (prevNextLinks.length > 0) {
            const selectedLink = this.selectBestLink(prevNextLinks);
            await this.clickLink(selectedLink);
        } else {
            // Fallback to back navigation
            await this.navigateBack();
        }
    }

    /**
     * Find previous/next links
     */
    findPreviousNextLinks() {
        const links = [];
        const selectors = [
            'a[href*="prev"]',
            'a[href*="next"]',
            'a[href*="previous"]',
            '.prev a',
            '.next a',
            '.previous a',
            '.pagination a',
            '.nav-prev a',
            '.nav-next a'
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
     * Navigate to random page
     */
    async navigateRandomPage() {
        const allLinks = this.findAllValidLinks();
        
        if (allLinks.length > 0) {
            const randomLink = allLinks[Math.floor(Math.random() * allLinks.length)];
            await this.clickLink(randomLink);
        } else {
            // Fallback to search
            await this.navigateSearchResults();
        }
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
    }

    /**
     * Score link based on various factors
     */
    scoreLink(link) {
        let score = 0;
        
        // Text content relevance
        const text = link.textContent.toLowerCase();
        const relevantKeywords = ['read', 'more', 'continue', 'next', 'article', 'post', 'story'];
        relevantKeywords.forEach(keyword => {
            if (text.includes(keyword)) {
                score += 2;
            }
        });
        
        // URL relevance
        const href = link.href.toLowerCase();
        const urlKeywords = ['article', 'post', 'page', 'content'];
        urlKeywords.forEach(keyword => {
            if (href.includes(keyword)) {
                score += 1;
            }
        });
        
        // Position on page (prefer above the fold)
        const rect = link.getBoundingClientRect();
        if (rect.top < window.innerHeight) {
            score += 1;
        }
        
        // Size (prefer larger, more prominent links)
        const area = rect.width * rect.height;
        if (area > 1000) {
            score += 1;
        }
        
        // Random factor
        score += Math.random();
        
        return score;
    }

    /**
     * Click link with realistic behavior
     */
    async clickLink(link) {
        if (!link) return false;
        
        // Add to navigation history
        this.navigationHistory.push({
            url: link.href,
            title: link.textContent,
            timestamp: Date.now()
        });
        
        // Simulate realistic click
        await this.behaviorSimulator.simulateNaturalClick(link);
        
        return true;
    }

    /**
     * Find search box
     */
    findSearchBox() {
        const selectors = [
            'input[type="search"]',
            'input[name*="search"]',
            'input[placeholder*="search"]',
            'input[placeholder*="Search"]',
            '.search input',
            '#search input',
            'form[role="search"] input'
        ];
        
        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element) {
                return element;
            }
        }
        
        return null;
    }

    /**
     * Generate search query based on current page
     */
    generateSearchQuery() {
        const personality = this.behaviorSimulator?.currentPersonality;
        const currentTitle = document.title;
        const currentContent = document.body.textContent;
        
        // Extract keywords from current page
        const keywords = this.extractKeywords(currentTitle + ' ' + currentContent);
        
        // Generate query based on personality
        if (personality?.type === 'researcher') {
            return keywords.slice(0, 3).join(' ');
        } else if (personality?.type === 'explorer') {
            return keywords[0] + ' ' + this.getRandomTopic();
        } else {
            return keywords[0] || 'interesting';
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
        return Object.entries(wordCount)
            .sort((a, b) => b[1] - a[1])
            .map(entry => entry[0]);
    }

    /**
     * Check if word is common
     */
    isCommonWord(word) {
        const commonWords = [
            'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
            'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had',
            'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might',
            'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they'
        ];
        
        return commonWords.includes(word);
    }

    /**
     * Get random topic for search
     */
    getRandomTopic() {
        const topics = [
            'news', 'technology', 'science', 'health', 'business', 'entertainment',
            'sports', 'politics', 'education', 'travel', 'food', 'fashion'
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
     * Utility delay function
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Export for use in other modules with enhanced stealth protection
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationSimulator;
} else if (typeof window !== 'undefined' && !window.NavigationSimulator) {
    window.NavigationSimulator = NavigationSimulator;
}
