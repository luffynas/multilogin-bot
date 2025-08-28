/**
 * Reading Simulator - Simulates realistic reading behavior and content analysis
 */

class ReadingSimulator {
    constructor(behaviorSimulator) {
        this.behaviorSimulator = behaviorSimulator;
        this.isReading = false;
        this.currentContent = null;
        
        this.readingConfig = {
            variableSpeed: true,
            textSelection: true,
            comprehension: true,
            contentAnalysis: true,
            readingPatterns: true
        };
    }

    /**
     * Simulate reading behavior for content
     */
    async simulateReadingBehavior(contentType = 'general', contentQuality = 'medium', options = {}) {
        if (!this.readingConfig.readingPatterns) return;
        
        this.isReading = true;
        
        const personality = this.behaviorSimulator?.currentPersonality;
        const readingPattern = this.getReadingPattern(personality, contentType, contentQuality);
        
        // Analyze content if enabled
        if (this.readingConfig.contentAnalysis) {
            this.currentContent = this.analyzeContent();
        }
        
        // Calculate reading time
        const readingTime = this.calculateReadingTime(personality, contentType, contentQuality, options);
        
        // Simulate reading process
        await this.simulateReadingProcess(readingPattern, readingTime);
        
        this.isReading = false;
    }

    /**
     * Simulate reading process with realistic patterns
     */
    async simulateReadingProcess(pattern, totalTime) {
        const personality = this.behaviorSimulator?.currentPersonality;
        
        // Break reading into segments
        const segments = this.divideReadingIntoSegments(totalTime, pattern);
        
        for (const segment of segments) {
            // Simulate reading segment
            await this.simulateReadingSegment(segment, pattern);
            
            // Simulate text selection if appropriate
            if (pattern.selectionProbability > Math.random()) {
                await this.simulateTextSelection();
            }
            
            // Simulate scrolling while reading
            if (pattern.scrollWhileReading) {
                await this.simulateReadingScroll();
            }
            
            // Simulate pause for comprehension
            if (pattern.comprehensionPauses && Math.random() < 0.3) {
                await this.simulateComprehensionPause();
            }
        }
    }

    /**
     * Simulate reading segment
     */
    async simulateReadingSegment(segment, pattern) {
        const { duration, content } = segment;
        
        // Simulate eye movement
        await this.simulateEyeMovement(content);
        
        // Simulate reading time
        await this.delay(duration);
        
        // Simulate occasional re-reading
        if (pattern.reReadProbability > Math.random()) {
            await this.simulateReReading(content);
        }
    }

    /**
     * Simulate eye movement across content
     */
    async simulateEyeMovement(content) {
        if (!content || !content.elements) return;
        
        const elements = content.elements;
        const personality = this.behaviorSimulator?.currentPersonality;
        
        for (const element of elements) {
            // Move mouse to element (simulating eye focus)
            if (element.boundingRect) {
                const centerX = element.boundingRect.left + element.boundingRect.width / 2;
                const centerY = element.boundingRect.top + element.boundingRect.height / 2;
                
                await this.behaviorSimulator.simulateMouseMovement(centerX, centerY, 300);
            }
            
            // Pause for reading
            const pauseTime = this.getReadingPauseTime(personality, element.type);
            await this.delay(pauseTime);
        }
    }

    /**
     * Simulate text selection
     */
    async simulateTextSelection() {
        const selection = window.getSelection();
        const range = document.createRange();
        
        // Find readable text elements
        const textElements = this.findReadableElements();
        
        if (textElements.length > 0) {
            const randomElement = textElements[Math.floor(Math.random() * textElements.length)];
            const text = randomElement.textContent;
            
            if (text && text.length > 10) {
                // Select random portion of text
                const start = Math.floor(Math.random() * (text.length - 10));
                const end = start + 5 + Math.floor(Math.random() * 10);
                
                try {
                    range.setStart(randomElement.firstChild || randomElement, start);
                    range.setEnd(randomElement.firstChild || randomElement, end);
                    
                    selection.removeAllRanges();
                    selection.addRange(range);
                    
                    // Hold selection for a moment
                    await this.delay(1000 + Math.random() * 2000);
                    
                    // Clear selection
                    selection.removeAllRanges();
                } catch (error) {
                    // Handle selection errors gracefully
                    console.warn('Text selection failed:', error);
                }
            }
        }
    }

    /**
     * Simulate re-reading content
     */
    async simulateReReading(content) {
        const personality = this.behaviorSimulator?.currentPersonality;
        const reReadTime = this.getReReadTime(personality, content.type);
        
        // Move back to content
        if (content.elements && content.elements.length > 0) {
            const firstElement = content.elements[0];
            if (firstElement.boundingRect) {
                const centerX = firstElement.boundingRect.left + firstElement.boundingRect.width / 2;
                const centerY = firstElement.boundingRect.top + firstElement.boundingRect.height / 2;
                
                await this.behaviorSimulator.simulateMouseMovement(centerX, centerY, 200);
            }
        }
        
        // Re-read time
        await this.delay(reReadTime);
    }

    /**
     * Simulate scrolling while reading
     */
    async simulateReadingScroll() {
        const scrollDistance = 100 + Math.random() * 200;
        await this.behaviorSimulator.simulateNaturalScrolling(
            window.pageYOffset + scrollDistance, 
            1500
        );
    }

    /**
     * Simulate comprehension pause
     */
    async simulateComprehensionPause() {
        const personality = this.behaviorSimulator?.currentPersonality;
        const pauseTime = personality?.attentionSpan === 'long' ? 
            2000 + Math.random() * 3000 : 
            1000 + Math.random() * 2000;
        
        await this.delay(pauseTime);
    }

    /**
     * Analyze page content
     */
    analyzeContent() {
        const content = {
            type: this.detectContentType(),
            quality: this.analyzeContentQuality(),
            elements: this.extractContentElements(),
            readingLevel: this.assessReadingLevel(),
            complexity: this.assessComplexity()
        };
        
        return content;
    }

    /**
     * Detect content type
     */
    detectContentType() {
        const url = window.location.href;
        const title = document.title;
        const content = document.body.textContent;
        
        // Check for article indicators
        if (this.isArticleContent(title, content)) {
            return 'article';
        }
        
        // Check for product page
        if (this.isProductPage(url, content)) {
            return 'product';
        }
        
        // Check for blog post
        if (this.isBlogPost(url, title)) {
            return 'blog';
        }
        
        // Check for news content
        if (this.isNewsContent(title, content)) {
            return 'news';
        }
        
        // Check for technical content
        if (this.isTechnicalContent(content)) {
            return 'technical';
        }
        
        return 'general';
    }

    /**
     * Check if content is article
     */
    isArticleContent(title, content) {
        const articleKeywords = ['article', 'post', 'story', 'feature', 'analysis', 'review'];
        const hasArticleKeyword = articleKeywords.some(keyword => 
            title.toLowerCase().includes(keyword) || content.toLowerCase().includes(keyword)
        );
        
        const hasArticleStructure = document.querySelector('article') || 
                                  document.querySelector('[class*="article"]') ||
                                  document.querySelector('[class*="post"]');
        
        return hasArticleKeyword || hasArticleStructure;
    }

    /**
     * Check if content is product page
     */
    isProductPage(url, content) {
        const productKeywords = ['product', 'buy', 'purchase', 'price', 'shop', 'store'];
        const hasProductKeyword = productKeywords.some(keyword => 
            url.toLowerCase().includes(keyword) || content.toLowerCase().includes(keyword)
        );
        
        const hasProductStructure = document.querySelector('[class*="product"]') ||
                                  document.querySelector('[class*="price"]') ||
                                  document.querySelector('[class*="buy"]');
        
        return hasProductKeyword || hasProductStructure;
    }

    /**
     * Check if content is blog post
     */
    isBlogPost(url, title) {
        const blogPatterns = ['/blog/', '/post/', '/article/', '/news/'];
        const hasBlogPattern = blogPatterns.some(pattern => url.includes(pattern));
        
        const blogKeywords = ['blog', 'post', 'article', 'news'];
        const hasBlogKeyword = blogKeywords.some(keyword => 
            title.toLowerCase().includes(keyword)
        );
        
        return hasBlogPattern || hasBlogKeyword;
    }

    /**
     * Check if content is news
     */
    isNewsContent(title, content) {
        const newsKeywords = ['news', 'breaking', 'update', 'latest', 'report'];
        const hasNewsKeyword = newsKeywords.some(keyword => 
            title.toLowerCase().includes(keyword) || content.toLowerCase().includes(keyword)
        );
        
        return hasNewsKeyword;
    }

    /**
     * Check if content is technical
     */
    isTechnicalContent(content) {
        const technicalKeywords = ['api', 'code', 'function', 'class', 'method', 'algorithm', 'database'];
        const hasTechnicalKeyword = technicalKeywords.some(keyword => 
            content.toLowerCase().includes(keyword)
        );
        
        const hasCodeBlocks = document.querySelector('pre') || 
                            document.querySelector('code') ||
                            document.querySelector('[class*="code"]');
        
        return hasTechnicalKeyword || hasCodeBlocks;
    }

    /**
     * Analyze content quality
     */
    analyzeContentQuality() {
        const content = document.body.textContent;
        const wordCount = content.split(/\s+/).length;
        const sentenceCount = content.split(/[.!?]+/).length;
        const paragraphCount = document.querySelectorAll('p').length;
        
        // Calculate quality metrics
        const avgWordsPerSentence = wordCount / sentenceCount;
        const avgWordsPerParagraph = wordCount / paragraphCount;
        
        // Determine quality based on metrics
        if (wordCount > 1000 && avgWordsPerSentence > 10 && avgWordsPerParagraph > 50) {
            return 'high';
        } else if (wordCount > 500 && avgWordsPerSentence > 8) {
            return 'medium';
        } else {
            return 'low';
        }
    }

    /**
     * Extract content elements
     */
    extractContentElements() {
        const elements = [];
        const selectors = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'span'];
        
        selectors.forEach(selector => {
            const foundElements = document.querySelectorAll(selector);
            foundElements.forEach(element => {
                if (element.textContent && element.textContent.trim().length > 20) {
                    const rect = element.getBoundingClientRect();
                    elements.push({
                        element: element,
                        text: element.textContent.trim(),
                        type: selector,
                        boundingRect: {
                            left: rect.left,
                            top: rect.top,
                            width: rect.width,
                            height: rect.height
                        },
                        wordCount: element.textContent.split(/\s+/).length
                    });
                }
            });
        });
        
        return elements;
    }

    /**
     * Assess reading level
     */
    assessReadingLevel() {
        const content = document.body.textContent;
        const sentences = content.split(/[.!?]+/);
        const words = content.split(/\s+/);
        
        const avgWordsPerSentence = words.length / sentences.length;
        const avgSyllablesPerWord = this.calculateAverageSyllables(words);
        
        // Flesch Reading Ease calculation
        const fleschScore = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
        
        if (fleschScore >= 90) return 'very_easy';
        if (fleschScore >= 80) return 'easy';
        if (fleschScore >= 70) return 'fairly_easy';
        if (fleschScore >= 60) return 'standard';
        if (fleschScore >= 50) return 'fairly_difficult';
        if (fleschScore >= 30) return 'difficult';
        return 'very_difficult';
    }

    /**
     * Calculate average syllables per word
     */
    calculateAverageSyllables(words) {
        let totalSyllables = 0;
        
        words.forEach(word => {
            totalSyllables += this.countSyllables(word);
        });
        
        return totalSyllables / words.length;
    }

    /**
     * Count syllables in word
     */
    countSyllables(word) {
        word = word.toLowerCase();
        word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
        word = word.replace(/^y/, '');
        const matches = word.match(/[aeiouy]{1,2}/g);
        return matches ? matches.length : 1;
    }

    /**
     * Assess content complexity
     */
    assessComplexity() {
        const content = document.body.textContent;
        const technicalTerms = this.countTechnicalTerms(content);
        const longWords = this.countLongWords(content);
        const sentenceComplexity = this.assessSentenceComplexity(content);
        
        const complexityScore = (technicalTerms * 0.4) + (longWords * 0.3) + (sentenceComplexity * 0.3);
        
        if (complexityScore > 0.7) return 'high';
        if (complexityScore > 0.4) return 'medium';
        return 'low';
    }

    /**
     * Count technical terms
     */
    countTechnicalTerms(content) {
        const technicalTerms = [
            'algorithm', 'api', 'database', 'framework', 'protocol', 'interface',
            'methodology', 'implementation', 'optimization', 'configuration',
            'architecture', 'infrastructure', 'deployment', 'integration'
        ];
        
        const matches = technicalTerms.filter(term => 
            content.toLowerCase().includes(term)
        );
        
        return matches.length / technicalTerms.length;
    }

    /**
     * Count long words
     */
    countLongWords(content) {
        const words = content.split(/\s+/);
        const longWords = words.filter(word => word.length > 8);
        
        return longWords.length / words.length;
    }

    /**
     * Assess sentence complexity
     */
    assessSentenceComplexity(content) {
        const sentences = content.split(/[.!?]+/);
        const complexSentences = sentences.filter(sentence => 
            sentence.split(/\s+/).length > 20
        );
        
        return complexSentences.length / sentences.length;
    }

    /**
     * Get reading pattern based on personality and content
     */
    getReadingPattern(personality, contentType, contentQuality) {
        const basePattern = {
            selectionProbability: 0.3,
            scrollWhileReading: true,
            reReadProbability: 0.2,
            comprehensionPauses: true,
            eyeMovement: true
        };
        
        // Adjust based on personality
        if (personality?.type === 'researcher') {
            basePattern.selectionProbability = 0.8;
            basePattern.reReadProbability = 0.6;
            basePattern.comprehensionPauses = true;
        } else if (personality?.type === 'casual') {
            basePattern.selectionProbability = 0.1;
            basePattern.reReadProbability = 0.1;
            basePattern.comprehensionPauses = false;
        }
        
        // Adjust based on content quality
        if (contentQuality === 'high') {
            basePattern.selectionProbability *= 1.5;
            basePattern.reReadProbability *= 1.3;
        }
        
        return basePattern;
    }

    /**
     * Calculate reading time
     */
    calculateReadingTime(personality, contentType, contentQuality, options = {}) {
        let baseTime = 5000; // 5 seconds base
        
        // Adjust based on personality reading speed
        if (personality) {
            switch (personality.readingSpeed) {
                case 'slow':
                    baseTime *= 1.8;
                    break;
                case 'fast':
                    baseTime *= 0.6;
                    break;
            }
        }
        
        // Adjust based on content type
        switch (contentType) {
            case 'article':
                baseTime *= 1.5;
                break;
            case 'technical':
                baseTime *= 2.0;
                break;
            case 'casual':
                baseTime *= 0.7;
                break;
        }
        
        // Adjust based on content quality
        if (contentQuality === 'high') {
            baseTime *= 1.3;
        }
        
        // Add randomness
        baseTime += (Math.random() - 0.5) * baseTime * 0.3;
        
        return Math.round(baseTime);
    }

    /**
     * Divide reading into segments
     */
    divideReadingIntoSegments(totalTime, pattern) {
        const segments = [];
        const segmentCount = 3 + Math.floor(Math.random() * 3); // 3-5 segments
        const baseSegmentTime = totalTime / segmentCount;
        
        for (let i = 0; i < segmentCount; i++) {
            const segmentTime = baseSegmentTime + (Math.random() - 0.5) * baseSegmentTime * 0.5;
            segments.push({
                duration: Math.round(segmentTime),
                content: this.currentContent
            });
        }
        
        return segments;
    }

    /**
     * Find readable elements
     */
    findReadableElements() {
        const selectors = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div', 'span'];
        const elements = [];
        
        selectors.forEach(selector => {
            const foundElements = document.querySelectorAll(selector);
            foundElements.forEach(element => {
                if (element.textContent && element.textContent.trim().length > 20) {
                    elements.push(element);
                }
            });
        });
        
        return elements;
    }

    /**
     * Get reading pause time
     */
    getReadingPauseTime(personality, elementType) {
        const baseTime = 500;
        let multiplier = 1.0;
        
        if (personality) {
            switch (personality.readingSpeed) {
                case 'slow':
                    multiplier = 1.5;
                    break;
                case 'fast':
                    multiplier = 0.7;
                    break;
            }
        }
        
        // Adjust based on element type
        switch (elementType) {
            case 'h1':
            case 'h2':
                multiplier *= 1.3;
                break;
            case 'p':
                multiplier *= 1.0;
                break;
            default:
                multiplier *= 0.8;
        }
        
        return baseTime * multiplier + Math.random() * 200;
    }

    /**
     * Get re-read time
     */
    getReReadTime(personality, contentType) {
        const baseTime = 2000;
        let multiplier = 1.0;
        
        if (personality?.attentionSpan === 'long') {
            multiplier = 1.5;
        }
        
        if (contentType === 'technical') {
            multiplier *= 1.3;
        }
        
        return baseTime * multiplier + Math.random() * 1000;
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
    module.exports = ReadingSimulator;
} else if (typeof window !== 'undefined' && !window.ReadingSimulator) {
    window.ReadingSimulator = ReadingSimulator;
}
