/**
 * Content Analyzer - Ekstraksi dan analisis konten halaman
 */

class ContentAnalyzer {
    constructor() {
        this.contentSelectors = [
            'article',
            '.post-content',
            '.entry-content',
            '.content',
            'main',
            '.main-content',
            '#content',
            '.post-body',
            '.article-content'
        ];
        
        this.titleSelectors = [
            'h1',
            '.post-title',
            '.entry-title',
            '.title',
            'title'
        ];
        
        this.metaSelectors = [
            'meta[name="description"]',
            'meta[property="og:description"]',
            'meta[name="keywords"]'
        ];
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
        // Try to find the main title
        for (const selector of this.titleSelectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent && element.textContent.trim()) {
                return element.textContent.trim();
            }
        }
        
        // Fallback to document title
        return document.title || '';
    }

    extractText() {
        let mainContent = '';
        
        // Try to find main content area
        for (const selector of this.contentSelectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent) {
                mainContent = this.cleanText(element.textContent);
                if (mainContent.length > 100) { // Minimum content length
                    break;
                }
            }
        }
        
        // If no main content found, extract from body
        if (!mainContent || mainContent.length < 100) {
            const body = document.body;
            if (body && body.textContent) {
                mainContent = this.cleanText(body.textContent);
            }
        }
        
        // Ensure we always return a string
        return mainContent || '';
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
        
        this.metaSelectors.forEach(selector => {
            const element = document.querySelector(selector);
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
}
