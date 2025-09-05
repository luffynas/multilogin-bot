/**
 * Content Analyzer - Ekstraksi dan analisis konten halaman
 */

class ContentAnalyzer {
    constructor() {
        // Enhanced configuration for error handling and validation
        this.config = {
            // Content validation
            minContentLength: 50,
            maxContentLength: 100000,
            minWordCount: 10,
            maxWordCount: 50000,
            
            // Error handling
            maxRetries: 3,
            retryDelay: 1000,
            enableFallbackBehavior: true,
            enableErrorRecovery: true,
            
            // Performance optimization
            enableCaching: true,
            cacheTimeout: 300000, // 5 minutes
            maxCacheSize: 100,
            enableLazyProcessing: true,
            
            // Content analysis
            enableAdvancedTopicDetection: true,
            enableSentimentAnalysis: true,
            enableContentQualityScoring: true,
            enableLanguageDetection: true
        };

        // Enhanced content selectors with priority and fallbacks
        this.contentSelectors = [
            // High priority selectors (modern websites)
            { selector: 'article', priority: 1, type: 'semantic' },
            { selector: '.post-content', priority: 1, type: 'blog' },
            { selector: '.entry-content', priority: 1, type: 'blog' },
            { selector: '[role="main"]', priority: 1, type: 'semantic' },
            { selector: 'main', priority: 1, type: 'semantic' },
            
            // Medium priority selectors (common patterns)
            { selector: '.content', priority: 2, type: 'generic' },
            { selector: '.main-content', priority: 2, type: 'generic' },
            { selector: '#content', priority: 2, type: 'generic' },
            { selector: '.post-body', priority: 2, type: 'blog' },
            { selector: '.article-content', priority: 2, type: 'blog' },
            
            // Low priority selectors (fallbacks)
            { selector: '.text-content', priority: 3, type: 'fallback' },
            { selector: '.body-content', priority: 3, type: 'fallback' },
            { selector: '.page-content', priority: 3, type: 'fallback' }
        ];
        
        // Enhanced title selectors with validation
        this.titleSelectors = [
            // High priority selectors
            { selector: 'h1', priority: 1, type: 'heading' },
            { selector: '.post-title', priority: 1, type: 'blog' },
            { selector: '.entry-title', priority: 1, type: 'blog' },
            { selector: '[data-testid*="title"]', priority: 1, type: 'test' },
            
            // Medium priority selectors
            { selector: '.title', priority: 2, type: 'generic' },
            { selector: 'title', priority: 2, type: 'document' },
            { selector: '[property="og:title"]', priority: 2, type: 'meta' },
            
            // Low priority selectors
            { selector: '.page-title', priority: 3, type: 'fallback' },
            { selector: '.content-title', priority: 3, type: 'fallback' }
        ];
        
        // Enhanced meta selectors with comprehensive coverage
        this.metaSelectors = [
            // Description selectors
            { selector: 'meta[name="description"]', type: 'description' },
            { selector: 'meta[property="og:description"]', type: 'og_description' },
            { selector: 'meta[name="twitter:description"]', type: 'twitter_description' },
            
            // Keyword selectors
            { selector: 'meta[name="keywords"]', type: 'keywords' },
            { selector: 'meta[name="news_keywords"]', type: 'news_keywords' },
            
            // Author and publisher selectors
            { selector: 'meta[name="author"]', type: 'author' },
            { selector: 'meta[property="article:author"]', type: 'article_author' },
            { selector: 'meta[property="og:site_name"]', type: 'site_name' }
        ];

        // Performance optimization: caching system
        this.contentCache = new Map();
        this.selectorCache = new Map();
        this.analysisCache = new Map();
        this.lastCleanup = Date.now();
        
        // Error tracking and recovery
        this.errorCount = 0;
        this.lastError = null;
        this.recoveryAttempts = 0;
        this.fallbackUsed = false;
        
        // Performance metrics
        this.performanceMetrics = {
            totalExtractions: 0,
            successfulExtractions: 0,
            failedExtractions: 0,
            cacheHits: 0,
            cacheMisses: 0,
            averageProcessingTime: 0,
            lastExtractionTime: 0
        };
        
        // Content quality metrics
        this.qualityMetrics = {
            readabilityScore: 0,
            contentDepth: 0,
            topicRelevance: 0,
            languageComplexity: 0,
            overallQuality: 0
        };
        
        // Initialize cleanup interval
        this.initializeCleanupInterval();
        
        console.log('🚀 Enhanced Content Analyzer initialized with config:', this.config);
    }

    extractContent() {
        const content = {
            title: this.extractTitle(),
            text: this.extractText(),
            images: this.extractImages(),
            links: this.extractLinks(),
            meta: this.extractMeta(),
            wordCount: 0,
            readingTime: 0
        };
        
        // Calculate word count and reading time
        content.wordCount = this.calculateWordCount(content.text);
        content.readingTime = this.calculateReadingTime(content.wordCount);
        
        return content;
    }

    extractTitle() {
        try {
            // Try to find the main title using priority-based selectors
            for (const selectorInfo of this.titleSelectors) {
                if (!selectorInfo || !selectorInfo.selector || typeof selectorInfo.selector !== 'string') {
                    console.warn('Invalid selector info in titleSelectors:', selectorInfo);
                    continue;
                }

                try {
                    const element = document.querySelector(selectorInfo.selector);
                    if (element && element.textContent && element.textContent.trim()) {
                        const title = element.textContent.trim();
                        console.log(`✅ Title extracted using selector: ${selectorInfo.selector} (${selectorInfo.type})`);
                        return title;
                    }
                } catch (selectorError) {
                    console.warn(`Error with selector ${selectorInfo.selector}:`, selectorError);
                    continue;
                }
            }
            
            // Fallback to document title
            const fallbackTitle = document.title || '';
            if (fallbackTitle) {
                console.log('📄 Using fallback document title');
                return fallbackTitle;
            }
            
            // Last resort fallback
            console.warn('⚠️ No title found with any selector, using empty string');
            return '';
            
        } catch (error) {
            console.error('Error in extractTitle:', error);
            // Return document title as last resort
            return document.title || '';
        }
    }

    extractText() {
        try {
            let mainContent = '';
            let usedSelector = '';
            
            // Try to find main content area using priority-based selectors
            for (const selectorInfo of this.contentSelectors) {
                if (!selectorInfo || !selectorInfo.selector || typeof selectorInfo.selector !== 'string') {
                    console.warn('Invalid selector info in contentSelectors:', selectorInfo);
                    continue;
                }

                try {
                    const element = document.querySelector(selectorInfo.selector);
                    if (element && element.textContent) {
                        const cleanedContent = this.cleanText(element.textContent);
                        if (cleanedContent.length > this.config.minContentLength) {
                            mainContent = cleanedContent;
                            usedSelector = selectorInfo.selector;
                            console.log(`✅ Content extracted using selector: ${selectorInfo.selector} (${selectorInfo.type}) - Length: ${cleanedContent.length}`);
                            break;
                        }
                    }
                } catch (selectorError) {
                    console.warn(`Error with selector ${selectorInfo.selector}:`, selectorError);
                    continue;
                }
            }
            
            // If no main content found, extract from body
            if (!mainContent || mainContent.length < this.config.minContentLength) {
                try {
                    const body = document.body;
                    if (body && body.textContent) {
                        const bodyContent = this.cleanText(body.textContent);
                        if (bodyContent.length > mainContent.length) {
                            mainContent = bodyContent;
                            usedSelector = 'body';
                            console.log(`📄 Using body content as fallback - Length: ${bodyContent.length}`);
                        }
                    }
                } catch (bodyError) {
                    console.warn('Error extracting body content:', bodyError);
                }
            }
            
            // Ensure we always return a string
            if (mainContent) {
                console.log(`📝 Final content extracted - Length: ${mainContent.length}, Selector: ${usedSelector}`);
                return mainContent;
            } else {
                console.warn('⚠️ No content found with any selector, returning empty string');
                return '';
            }
            
        } catch (error) {
            console.error('Error in extractText:', error);
            // Return empty string as last resort
            return '';
        }
    }

    extractImages() {
        const images = [];
        const imgElements = document.querySelectorAll('img');
        
        imgElements.forEach(img => {
            if (img.src && img.alt) {
                images.push({
                    src: img.src,
                    alt: img.alt,
                    width: img.width,
                    height: img.height
                });
            }
        });
        
        return images;
    }

    extractLinks() {
        const links = [];
        const linkElements = document.querySelectorAll('a[href]');
        
        linkElements.forEach(link => {
            if (link.href && link.textContent.trim()) {
                links.push({
                    href: link.href,
                    text: link.textContent.trim(),
                    title: link.title || ''
                });
            }
        });
        
        return links;
    }

    extractMeta() {
        const meta = {};
        
        this.metaSelectors.forEach(selectorInfo => {
            const element = document.querySelector(selectorInfo.selector);
            if (element) {
                const name = element.getAttribute('name') || element.getAttribute('property');
                const content = element.getAttribute('content');
                if (name && content) {
                    meta[name] = content;
                }
            }
        });
        
        return meta;
    }

    cleanText(text) {
        if (!text || typeof text !== 'string') return '';
        
        return text
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            .replace(/\n+/g, ' ') // Replace newlines with spaces
            .replace(/\t+/g, ' ') // Replace tabs with spaces
            .trim();
    }

    calculateWordCount(text) {
        if (!text || typeof text !== 'string') return 0;
        
        // Split by whitespace and filter out empty strings
        const words = text.split(/\s+/).filter(word => word.length > 0);
        return words.length;
    }

    calculateReadingTime(wordCount) {
        // Average reading speed: 200-250 words per minute
        const wordsPerMinute = 225;
        const minutes = wordCount / wordsPerMinute;
        return Math.ceil(minutes);
    }

    getContentType() {
        const url = window.location.href;
        const path = window.location.pathname;
        
        // Determine content type based on URL patterns
        if (path.includes('/blog/') || path.includes('/post/') || path.includes('/article/')) {
            return 'article';
        } else if (path.includes('/product/') || path.includes('/item/')) {
            return 'product';
        } else if (path.includes('/category/') || path.includes('/tag/')) {
            return 'category';
        } else if (path === '/' || path === '') {
            return 'homepage';
        } else {
            return 'page';
        }
    }

    getContentTopics() {
        const text = this.extractText() || '';
        const title = this.extractTitle() || '';
        const fullText = `${title} ${text}`.toLowerCase();
        
        // Simple topic detection based on keywords
        const topics = [];
        
        const topicKeywords = {
            'technology': ['tech', 'software', 'programming', 'computer', 'digital', 'app', 'mobile'],
            'business': ['business', 'entrepreneur', 'startup', 'company', 'market', 'finance'],
            'health': ['health', 'medical', 'fitness', 'wellness', 'diet', 'exercise'],
            'lifestyle': ['lifestyle', 'fashion', 'beauty', 'travel', 'food', 'home'],
            'education': ['education', 'learning', 'study', 'course', 'tutorial', 'guide']
        };
        
        Object.entries(topicKeywords).forEach(([topic, keywords]) => {
            const matchCount = keywords.filter(keyword => 
                fullText.includes(keyword)
            ).length;
            
            if (matchCount > 0) {
                topics.push({
                    topic,
                    confidence: matchCount / keywords.length
                });
            }
        });
        
        // Sort by confidence
        topics.sort((a, b) => b.confidence - a.confidence);
        
        return topics;
    }

    isContentReadable() {
        const text = this.extractText() || '';
        const wordCount = this.calculateWordCount(text);
        
        // Content is readable if it has at least 50 words
        return wordCount >= 50;
    }

    // Enhanced error handling and validation methods
    initializeCleanupInterval() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        
        this.cleanupInterval = setInterval(() => {
            this.cleanupCache();
        }, this.config.cacheTimeout);
    }

    cleanupCache() {
        const now = Date.now();
        
        // Cleanup expired cache entries
        for (const [key, value] of this.contentCache.entries()) {
            if (now - value.timestamp > this.config.cacheTimeout) {
                this.contentCache.delete(key);
            }
        }

        for (const [key, value] of this.selectorCache.entries()) {
            if (now - value.timestamp > this.config.cacheTimeout) {
                this.selectorCache.delete(key);
            }
        }

        for (const [key, value] of this.analysisCache.entries()) {
            if (now - value.timestamp > this.config.cacheTimeout) {
                this.analysisCache.delete(key);
            }
        }

        // Limit cache size
        if (this.contentCache.size > this.config.maxCacheSize) {
            const entries = Array.from(this.contentCache.entries());
            entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
            const toDelete = entries.slice(0, entries.length - this.config.maxCacheSize);
            toDelete.forEach(([key]) => this.contentCache.delete(key));
        }

        this.lastCleanup = now;
        console.log('🧹 Content Analyzer cache cleanup completed');
    }

    // Enhanced input validation
    validateInput(input, type = 'text') {
        try {
            if (input === null || input === undefined) {
                return { isValid: false, reason: 'null_or_undefined', value: '' };
            }

            switch (type) {
                case 'text':
                    if (typeof input !== 'string') {
                        return { isValid: false, reason: 'not_string', value: '' };
                    }
                    if (input.trim().length === 0) {
                        return { isValid: false, reason: 'empty_string', value: '' };
                    }
                    if (input.length > this.config.maxContentLength) {
                        return { isValid: false, reason: 'too_long', value: input.substring(0, this.config.maxContentLength) };
                    }
                    return { isValid: true, reason: 'valid', value: input.trim() };

                case 'url':
                    try {
                        new URL(input);
                        return { isValid: true, reason: 'valid_url', value: input };
                    } catch {
                        return { isValid: false, reason: 'invalid_url', value: '' };
                    }

                case 'selector':
                    if (typeof input !== 'string' || input.trim().length === 0) {
                        return { isValid: false, reason: 'invalid_selector', value: '' };
                    }
                    return { isValid: true, reason: 'valid_selector', value: input.trim() };

                default:
                    return { isValid: false, reason: 'unknown_type', value: '' };
            }
        } catch (error) {
            console.warn('Error validating input:', error);
            return { isValid: false, reason: 'validation_error', value: '' };
        }
    }

    // Enhanced error handling with retry mechanism
    async performActionWithRetry(action, fallback, maxRetries = null) {
        const retries = maxRetries || this.config.maxRetries;
        
        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                return await action();
            } catch (error) {
                this.errorCount++;
                this.lastError = error;
                
                console.warn(`⚠️ Content extraction action failed (attempt ${attempt + 1}/${retries}):`, error);
                
                if (attempt === retries - 1) {
                    console.warn('⚠️ All retry attempts failed, using fallback');
                    if (fallback) {
                        return await fallback();
                    }
                    throw error;
                }
                
                // Wait before retry with exponential backoff
                await this.delay(this.config.retryDelay * Math.pow(2, attempt));
            }
        }
    }

    // Enhanced DOM query with error handling
    async querySelectorSafe(selector, context = document) {
        try {
            const validation = this.validateInput(selector, 'selector');
            if (!validation.isValid) {
                console.warn('Invalid selector:', validation.reason);
                return null;
            }

            const element = context.querySelector(validation.value);
            if (!element) {
                return null;
            }

            return element;
        } catch (error) {
            console.warn('Error in querySelectorSafe:', error);
            return null;
        }
    }

    async querySelectorAllSafe(selector, context = document) {
        try {
            const validation = this.validateInput(selector, 'selector');
            if (!validation.isValid) {
                console.warn('Invalid selector:', validation.reason);
                return [];
            }

            const elements = context.querySelectorAll(validation.value);
            return Array.from(elements);
        } catch (error) {
            console.warn('Error in querySelectorAllSafe:', error);
            return [];
        }
    }

    // Enhanced content validation
    validateContent(content) {
        try {
            if (!content || typeof content !== 'string') {
                return { isValid: false, reason: 'invalid_content', score: 0 };
            }

            const wordCount = this.calculateWordCount(content);
            const charCount = content.length;
            
            // Check minimum requirements
            if (wordCount < this.config.minWordCount) {
                return { isValid: false, reason: 'insufficient_words', score: 0, wordCount };
            }

            if (charCount < this.config.minContentLength) {
                return { isValid: false, reason: 'insufficient_length', score: 0, charCount };
            }

            // Calculate content quality score
            const score = this.calculateContentQualityScore(content, wordCount, charCount);
            
            return {
                isValid: true,
                reason: 'valid_content',
                score: score,
                wordCount: wordCount,
                charCount: charCount,
                quality: this.getQualityLevel(score)
            };
        } catch (error) {
            console.warn('Error validating content:', error);
            return { isValid: false, reason: 'validation_error', score: 0 };
        }
    }

    calculateContentQualityScore(content, wordCount, charCount) {
        let score = 0;
        
        try {
            // Word count score (0-30 points)
            const wordScore = Math.min(30, (wordCount / 100) * 30);
            score += wordScore;

            // Content diversity score (0-25 points)
            const uniqueWords = new Set(content.toLowerCase().split(/\s+/)).size;
            const diversityScore = Math.min(25, (uniqueWords / wordCount) * 50);
            score += diversityScore;

            // Readability score (0-25 points)
            const avgWordLength = charCount / wordCount;
            const readabilityScore = Math.min(25, Math.max(0, 25 - Math.abs(avgWordLength - 5) * 5));
            score += readabilityScore;

            // Structure score (0-20 points)
            const hasParagraphs = content.includes('\n\n') || content.includes('</p>');
            const hasHeadings = content.includes('<h') || content.includes('#');
            const structureScore = (hasParagraphs ? 10 : 0) + (hasHeadings ? 10 : 0);
            score += structureScore;

        } catch (error) {
            console.warn('Error calculating content quality score:', error);
        }

        return Math.round(score);
    }

    getQualityLevel(score) {
        if (score >= 80) return 'excellent';
        if (score >= 60) return 'good';
        if (score >= 40) return 'fair';
        if (score >= 20) return 'poor';
        return 'very_poor';
    }

    // Enhanced content quality calculation
    calculateContentQuality(content) {
        try {
            const quality = {
                readabilityScore: 0,
                contentDepth: 0,
                topicRelevance: 0,
                languageComplexity: 0,
                overallQuality: 0
            };

            if (content.text) {
                const wordCount = content.wordCount || 0;
                const charCount = content.text.length;
                
                // Readability score based on word length and sentence structure
                quality.readabilityScore = this.calculateReadabilityScore(content.text, wordCount);
                
                // Content depth based on word count and structure
                quality.contentDepth = this.calculateContentDepth(content.text, wordCount);
                
                // Topic relevance based on content analysis
                quality.topicRelevance = this.calculateTopicRelevance(content.text);
                
                // Language complexity based on vocabulary diversity
                quality.languageComplexity = this.calculateLanguageComplexity(content.text, wordCount);
                
                // Overall quality score
                quality.overallQuality = Math.round(
                    (quality.readabilityScore + quality.contentDepth + quality.topicRelevance + quality.languageComplexity) / 4
                );
            }

            this.qualityMetrics = quality;
            return quality;
            
        } catch (error) {
            console.warn('Error calculating content quality:', error);
            return this.qualityMetrics;
        }
    }

    calculateReadabilityScore(text, wordCount) {
        try {
            if (!text || wordCount === 0) return 0;
            
            const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
            const avgSentenceLength = wordCount / Math.max(sentences, 1);
            const avgWordLength = text.length / wordCount;
            
            // Flesch Reading Ease approximation
            let score = 100;
            score -= avgSentenceLength * 1.015;
            score -= avgWordLength * 84.6;
            
            return Math.max(0, Math.min(100, Math.round(score)));
        } catch (error) {
            return 50; // Default score
        }
    }

    calculateContentDepth(text, wordCount) {
        try {
            if (!text || wordCount === 0) return 0;
            
            let depth = 0;
            
            // Check for structured content
            if (text.includes('<h') || text.includes('#')) depth += 20;
            if (text.includes('<p>') || text.includes('\n\n')) depth += 20;
            if (text.includes('<ul>') || text.includes('<ol>')) depth += 15;
            if (text.includes('<blockquote>') || text.includes('>')) depth += 15;
            
            // Check for content length
            if (wordCount > 1000) depth += 20;
            else if (wordCount > 500) depth += 15;
            else if (wordCount > 200) depth += 10;
            
            // Check for multimedia content
            if (text.includes('<img') || text.includes('<video')) depth += 10;
            
            return Math.min(100, depth);
        } catch (error) {
            return 50; // Default score
        }
    }

    calculateTopicRelevance(text) {
        try {
            if (!text) return 0;
            
            const lowerText = text.toLowerCase();
            let relevance = 0;
            
            // Check for topic indicators
            const topicIndicators = [
                'research', 'study', 'analysis', 'report', 'findings',
                'evidence', 'data', 'statistics', 'survey', 'interview',
                'expert', 'professional', 'authority', 'specialist'
            ];
            
            topicIndicators.forEach(indicator => {
                if (lowerText.includes(indicator)) relevance += 5;
            });
            
            return Math.min(100, relevance);
        } catch (error) {
            return 50; // Default score
        }
    }

    calculateLanguageComplexity(text, wordCount) {
        try {
            if (!text || wordCount === 0) return 0;
            
            const uniqueWords = new Set(text.toLowerCase().split(/\s+/)).size;
            const vocabularyDiversity = uniqueWords / wordCount;
            
            // Calculate complexity based on vocabulary diversity
            let complexity = vocabularyDiversity * 100;
            
            // Adjust for technical terms
            const technicalTerms = text.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g) || [];
            complexity += technicalTerms.length * 2;
            
            return Math.min(100, Math.round(complexity));
        } catch (error) {
            return 50; // Default score
        }
    }

    // Fallback content generation
    getFallbackContent() {
        console.log('⚠️ Generating fallback content');
        
        return {
            title: document.title || 'Untitled',
            text: 'Content extraction failed. Please try again.',
            images: [],
            links: [],
            meta: {},
            wordCount: 0,
            readingTime: 0,
            quality: { overallQuality: 0 },
            validation: { isValid: false, reason: 'extraction_failed' }
        };
    }

    // Performance monitoring
    getPerformanceMetrics() {
        const successRate = this.performanceMetrics.totalExtractions > 0 ? 
            (this.performanceMetrics.successfulExtractions / this.performanceMetrics.totalExtractions) * 100 : 0;
        
        return {
            ...this.performanceMetrics,
            successRate: Math.round(successRate),
            errorRate: this.errorCount,
            fallbackUsed: this.fallbackUsed,
            lastCleanup: this.lastCleanup
        };
    }

    // Utility method for delays
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
