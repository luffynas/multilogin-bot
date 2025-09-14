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
        
        // Initialize stealth delay system
        this.stealthDelay = new (window._stealth_delay || (() => {
            // Fallback delay function if stealth delay is not available
            return {
                wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
                waitRandom: (min, max) => new Promise(resolve => setTimeout(resolve, Math.random() * (max - min) + min))
            };
        })());
    }

    /**
     * Simulate reading behavior for content with focus on HTML structure
     */
    async simulateReadingBehavior(contentType = 'general', contentQuality = 'medium', options = {}) {
        if (!this.readingConfig.readingPatterns) return;
        
        this.isReading = true;
        
        const personality = this.behaviorSimulator?.currentPersonality;
        const readingPattern = this.getReadingPattern(personality, contentType, contentQuality);
        
        // Analyze content with enhanced structure analysis
        if (this.readingConfig.contentAnalysis) {
            this.currentContent = this.analyzeContent();
        }
        
        // Assess content interest and calculate reading time
        const contentInterest = this.assessContentInterest();
        const readingTime = this.calculateReadingTimeWithInterest(personality, contentType, contentQuality, contentInterest, options);
        
        console.log(`📖 Starting structured reading behavior: ${Math.round(readingTime/1000)}s, Interest: ${(contentInterest * 100).toFixed(1)}%`);
        
        // Check for early bounce based on content interest
        if (this.shouldBounceEarly(contentInterest, personality)) {
            console.log(`🚪 Early bounce - content not interesting enough (${(contentInterest * 100).toFixed(1)}% interest)`);
            this.isReading = false;
            return;
        }
        
        // Simulate structured reading process
        await this.simulateStructuredReadingProcess(readingPattern, readingTime, contentInterest);
        
        this.isReading = false;
    }

    /**
     * Simulate structured reading process focusing on HTML elements
     */
    async simulateStructuredReadingProcess(pattern, totalTime, contentInterest) {
        if (!this.currentContent) {
            // Fallback to original method if no content analysis
            return this.simulateReadingProcessWithFatigue(pattern, totalTime, contentInterest);
        }
        
        const { headings, tables, articleStructure, contentSections } = this.currentContent;
        
        console.log(`📖 Structured Reading: ${headings.total} headings, ${tables.total} tables, ${contentSections.length} sections`);
        
        // Phase 1: Read main headings (H1, H2)
        await this.simulateHeadingReading(headings, 'main');
        
        // Phase 2: Read introduction and key sections
        await this.simulateSectionReading(contentSections, 'introduction');
        
        // Phase 3: Read tables if present
        if (tables.total > 0) {
            await this.simulateTableReading(tables);
        }
        
        // Phase 4: Read sub-headings and content
        await this.simulateHeadingReading(headings, 'sub');
        
        // Phase 5: Read remaining sections
        await this.simulateSectionReading(contentSections, 'content');
        
        // Phase 6: Read conclusion if present
        await this.simulateSectionReading(contentSections, 'conclusion');
        
        console.log('📖 Structured reading process completed');
    }

    /**
     * Simulate reading process with fatigue tracking
     */
    async simulateReadingProcessWithFatigue(pattern, totalTime, contentInterest) {
        const personality = this.behaviorSimulator?.currentPersonality;
        const startTime = Date.now();
        
        // Break reading into segments
        const segments = this.divideReadingIntoSegmentsWithInterest(totalTime, pattern, contentInterest);
        
        console.log(`📖 Starting reading process: ${segments.length} segments, ${Math.round(totalTime/1000)}s total, Interest: ${(contentInterest * 100).toFixed(1)}%`);
        
        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i];
            const currentTime = Date.now();
            const timeOnPage = currentTime - startTime;
            
            // Calculate reading fatigue
            const readingFatigue = Math.min(1.0, timeOnPage / 300000); // 5 minutes max fatigue
            const segmentFatigue = Math.min(1.0, i / segments.length);
            
            console.log(`📖 Reading segment ${i + 1}/${segments.length}: ${Math.round(segment.duration/1000)}s (Fatigue: ${(readingFatigue * 100).toFixed(1)}%)`);
            
            // Check for mid-reading bounce
            if (this.shouldBounceMidReading(contentInterest, readingFatigue, timeOnPage)) {
                console.log(`🚪 Mid-reading bounce - losing interest (${(contentInterest * 100).toFixed(1)}% interest, ${(readingFatigue * 100).toFixed(1)}% fatigue)`);
                break;
            }
            
            // Simulate reading segment with fatigue consideration
            await this.simulateReadingSegmentWithFatigue(segment, pattern, readingFatigue, segmentFatigue, contentInterest);
            
            // Simulate text selection if appropriate (with fatigue consideration)
            const selectionProbability = this.getSelectionProbabilityWithFatigue(pattern.selectionProbability, readingFatigue, contentInterest);
            if (Math.random() < selectionProbability) {
                await this.simulateTextSelection();
            }
            
            // Simulate scrolling while reading (with fatigue consideration)
            const scrollProbability = this.getScrollProbabilityWithFatigue(pattern.scrollWhileReading, readingFatigue, contentInterest);
            if (Math.random() < scrollProbability) {
                await this.simulateReadingScrollWithFatigue(readingFatigue, contentInterest);
            }
            
            // Simulate pause for comprehension (with fatigue consideration)
            const comprehensionProbability = this.getComprehensionProbabilityWithFatigue(pattern.comprehensionPauses, readingFatigue, contentInterest);
            if (Math.random() < comprehensionProbability) {
                await this.simulateComprehensionPauseWithFatigue(readingFatigue, contentInterest);
            }
            
            // Progress logging with fatigue and interest info
            const progress = (((i + 1) / segments.length) * 100).toFixed(1);
            console.log(`📊 Reading progress: ${progress}% completed (Fatigue: ${(readingFatigue * 100).toFixed(1)}%, Interest: ${(contentInterest * 100).toFixed(1)}%)`);
        }
        
        console.log(`✅ Reading process completed: ${segments.length} segments read`);
    }

    /**
     * Simulate reading segment with fatigue consideration
     */
    async simulateReadingSegmentWithFatigue(segment, pattern, readingFatigue, segmentFatigue, contentInterest) {
        const { duration, content } = segment;
        
        // Simulate eye movement
        await this.simulateEyeMovement(content);
        
        // Calculate adjusted reading time based on fatigue and interest
        const adjustedDuration = this.adjustReadingTimeForFatigueAndInterest(duration, content, readingFatigue, segmentFatigue, contentInterest);
        await this.delay(adjustedDuration);
        
        // Simulate occasional re-reading (with fatigue consideration)
        const reReadProbability = this.getReReadProbabilityWithFatigue(pattern.reReadProbability, readingFatigue, contentInterest);
        if (Math.random() < reReadProbability) {
            await this.simulateReReadingWithFatigue(content, readingFatigue, contentInterest);
        }
    }

    /**
     * Adjust reading time based on content complexity and importance
     */
    adjustReadingTimeForContent(baseDuration, content) {
        let adjustedDuration = baseDuration;
        
        // Adjust based on content type
        if (content && content.type) {
            switch (content.type) {
                case 'article':
                    adjustedDuration *= 1.3; // 30% longer for articles
                    break;
                case 'technical':
                    adjustedDuration *= 1.5; // 50% longer for technical content
                    break;
                case 'news':
                    adjustedDuration *= 1.1; // 10% longer for news
                    break;
                case 'blog':
                    adjustedDuration *= 1.2; // 20% longer for blog posts
                    break;
            }
        }
        
        // Adjust based on content quality
        if (content && content.quality === 'high') {
            adjustedDuration *= 1.2; // 20% longer for high-quality content
        }
        
        // Adjust based on reading level
        if (content && content.readingLevel) {
            switch (content.readingLevel) {
                case 'difficult':
                case 'very_difficult':
                    adjustedDuration *= 1.4; // 40% longer for difficult content
                    break;
                case 'easy':
                case 'very_easy':
                    adjustedDuration *= 0.8; // 20% shorter for easy content
                    break;
            }
        }
        
        return Math.round(adjustedDuration);
    }

    /**
     * Adjust reading time for fatigue and interest
     */
    adjustReadingTimeForFatigueAndInterest(baseDuration, content, readingFatigue, segmentFatigue, contentInterest) {
        let adjustedDuration = baseDuration;
        
        // Fatigue adjustments
        adjustedDuration *= (1 + readingFatigue * 0.3); // Longer when fatigued
        adjustedDuration *= (1 + segmentFatigue * 0.2); // Longer in later segments
        
        // Interest adjustments
        adjustedDuration *= (0.5 + contentInterest * 0.5); // Shorter when not interested
        
        // Content-based adjustments
        if (content && content.type) {
            switch (content.type) {
                case 'article':
                    adjustedDuration *= 1.3;
                    break;
                case 'technical':
                    adjustedDuration *= 1.5;
                    break;
            }
        }
        
        // Content quality adjustments
        if (content && content.quality === 'high') {
            adjustedDuration *= 1.2;
        }
        
        // Reading level adjustments
        if (content && content.readingLevel) {
            switch (content.readingLevel) {
                case 'difficult':
                case 'very_difficult':
                    adjustedDuration *= 1.4;
                    break;
                case 'easy':
                case 'very_easy':
                    adjustedDuration *= 0.8;
                    break;
            }
        }
        
        return Math.round(adjustedDuration);
    }

    /**
     * Simulate eye movement across content (Enhanced for Human-Like Behavior)
     */
    async simulateEyeMovement(content) {
        if (!content || !content.elements) return;
        
        const elements = content.elements;
        const personality = this.behaviorSimulator?.currentPersonality;
        
        // More natural element selection with human-like attention
        const maxElements = Math.min(elements.length, 8 + Math.floor(Math.random() * 7)); // 8-15 elements (was 10 fixed)
        const selectedElements = this.selectElementsNaturally(elements, maxElements);
        
        for (let i = 0; i < selectedElements.length; i++) {
            const element = selectedElements[i];
            
            // More natural eye movement frequency with human attention patterns
            const eyeMovementChance = 0.15 + Math.random() * 0.25; // 15-40% chance (was 30% fixed)
            if (element.boundingRect && Math.random() < eyeMovementChance) {
                const centerX = element.boundingRect.left + element.boundingRect.width / 2;
                const centerY = element.boundingRect.top + element.boundingRect.height / 2;
                
                // Add natural eye movement variation
                const eyeMovementDuration = 150 + Math.random() * 300; // 150-450ms (was 200ms fixed)
                await this.behaviorSimulator.simulateMouseMovement(centerX, centerY, eyeMovementDuration);
            }
            
            // More natural reading pause with human attention patterns
            const basePauseTime = this.getReadingPauseTime(personality, element.type);
            const attentionFactor = 0.4 + Math.random() * 0.8; // 0.4-1.2x
            const pauseTime = basePauseTime * attentionFactor;
            
            // Add occasional longer pauses for important content
            const importantContentChance = Math.random() < 0.2; // 20% chance
            const finalPauseTime = importantContentChance ? pauseTime * (1.5 + Math.random() * 1.0) : pauseTime;
            
            await this.delay(finalPauseTime);
            
            // Add random micro-pauses between elements
            if (Math.random() < 0.3) { // 30% chance for micro-pause
                const microPause = 100 + Math.random() * 400; // 100-500ms
                await this.delay(microPause);
            }
        }
    }
    
    /**
     * Select elements naturally based on human attention patterns
     */
    selectElementsNaturally(elements, maxCount) {
        // Prioritize headings, images, and important content
        const importantElements = elements.filter(el => 
            el.type === 'heading' || el.type === 'image' || el.type === 'important'
        );
        
        const regularElements = elements.filter(el => 
            el.type !== 'heading' && el.type !== 'image' && el.type !== 'important'
        );
        
        // Select more important elements with higher probability
        const selectedImportant = importantElements.slice(0, Math.min(importantElements.length, Math.floor(maxCount * 0.6)));
        const remainingCount = maxCount - selectedImportant.length;
        const selectedRegular = regularElements.slice(0, Math.min(regularElements.length, remainingCount));
        
        // Shuffle to create natural reading order
        const allSelected = [...selectedImportant, ...selectedRegular];
        return this.shuffleArray(allSelected);
    }
    
    /**
     * Shuffle array to create natural reading order
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * Simulate text selection with improved error handling
     */
    async simulateTextSelection() {
        const selection = window.getSelection();
        const range = document.createRange();
        
        try {
        // Find readable text elements
        const textElements = this.findReadableElements();
        
        if (textElements.length > 0) {
            const randomElement = textElements[Math.floor(Math.random() * textElements.length)];
            const text = randomElement.textContent;
            
            if (text && text.length > 10) {
                    // Get the text node to work with
                    const textNode = this.getTextNode(randomElement);
                    if (!textNode) {
                        console.debug('No valid text node found for selection');
                        return; // No valid text node found
                    }
                    
                    // Calculate safe start and end positions
                    const maxLength = textNode.length;
                    const minSelectionLength = 5;
                    const maxSelectionLength = Math.min(20, maxLength - 1);
                    
                    if (maxLength < minSelectionLength) {
                        console.debug('Text too short for selection');
                        return; // Text too short for selection
                    }
                    
                    const start = Math.floor(Math.random() * (maxLength - minSelectionLength));
                    const selectionLength = minSelectionLength + Math.floor(Math.random() * (maxSelectionLength - minSelectionLength));
                    const end = Math.min(start + selectionLength, maxLength);
                    
                    // Set range with proper bounds checking
                    range.setStart(textNode, start);
                    range.setEnd(textNode, end);
                    
                    // Verify range is valid
                    if (range.collapsed) {
                        console.debug('Range is collapsed, skipping selection');
                        return; // Range is collapsed, skip selection
                    }
                    
                    selection.removeAllRanges();
                    selection.addRange(range);
                    
                    // Hold selection for a moment - reduced timing
                    await this.delay(300 + Math.random() * 500); // Reduced from 1-3s to 0.3-0.8s
                    
                    // Clear selection
                    selection.removeAllRanges();
                }
            } else {
                console.debug('No readable elements found for text selection');
            }
                } catch (error) {
            // Enhanced error handling with fallback
                        console.warn('Text selection failed:', error.message);
            await this.simulateAlternativeSelection();
        }
    }

    /**
     * Simulate alternative selection when text selection fails
     */
    async simulateAlternativeSelection() {
        try {
            // Fallback: simulate mouse selection by clicking and dragging
            const elements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6');
            if (elements.length > 0) {
                const randomElement = elements[Math.floor(Math.random() * elements.length)];
                
                // Simulate mouse down
                const mouseDownEvent = new MouseEvent('mousedown', {
                    bubbles: true,
                    cancelable: true,
                    clientX: randomElement.offsetLeft,
                    clientY: randomElement.offsetTop
                });
                
                randomElement.dispatchEvent(mouseDownEvent);
                await this.delay(100);
                
                // Simulate mouse up
                const mouseUpEvent = new MouseEvent('mouseup', {
                    bubbles: true,
                    cancelable: true,
                    clientX: randomElement.offsetLeft + 50,
                    clientY: randomElement.offsetTop
                });
                
                randomElement.dispatchEvent(mouseUpEvent);
                await this.delay(200);
                
                console.debug('Alternative selection simulation completed');
            }
        } catch (error) {
            console.debug('Alternative selection also failed:', error.message);
        }
    }

    /**
     * Get the first text node from an element
     */
    getTextNode(element) {
        if (!element) return null;
        
        // If element itself is a text node
        if (element.nodeType === Node.TEXT_NODE) {
            return element.textContent.trim() ? element : null;
        }
        
        // Find first text node in the element
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function(node) {
                    return node.textContent.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
                }
            }
        );
        
        const textNode = walker.nextNode();
        return textNode;
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
     * Simulate scrolling while reading with improved page coverage
     */
    async simulateReadingScroll() {
        // Get page dimensions
        const pageHeight = document.body.scrollHeight;
        const viewportHeight = window.innerHeight;
        const currentPosition = window.pageYOffset;
        
        // Calculate how much to scroll based on remaining content
        const remainingContent = pageHeight - currentPosition - viewportHeight;
        
        if (remainingContent > 0) {
            // Scroll to read more content (not just 100-300px)
            const scrollDistance = Math.min(
                remainingContent * 0.3 + Math.random() * remainingContent * 0.4, // 30-70% of remaining content
                viewportHeight * 2 // But not more than 2 viewport heights
            );
            
            console.log(`📖 Reading scroll: ${Math.round(scrollDistance)}px forward (${Math.round(remainingContent)}px remaining)`);
            
        await this.behaviorSimulator.simulateNaturalScrolling(
                currentPosition + scrollDistance, 
                1500
            );
        } else {
            // If at bottom, scroll back up to re-read some content
            const scrollBackDistance = Math.random() * viewportHeight;
            console.log(`📖 Reading scroll back: ${Math.round(scrollBackDistance)}px for re-reading`);
            
            await this.behaviorSimulator.simulateNaturalScrolling(
                Math.max(0, currentPosition - scrollBackDistance), 
            1500
        );
        }
    }

    /**
     * Simulate comprehension pause (Enhanced for Human-Like Behavior)
     */
    async simulateComprehensionPause() {
        const personality = this.behaviorSimulator?.currentPersonality;
        
        // More natural base pause time with wider variation
        let basePauseTime;
        if (personality?.attentionSpan === 'long') {
            basePauseTime = 800 + Math.random() * 2000; // 0.8-2.8s (was 0.5-1.5s)
        } else {
            basePauseTime = 400 + Math.random() * 1200; // 0.4-1.6s (was 0.3-1s)
        }
        
        // Add personality-based variation
        if (personality) {
            switch (personality.type) {
                case 'researcher':
                    basePauseTime *= (1.2 + Math.random() * 0.6); // 1.2-1.8x
                    break;
                case 'explorer':
                    basePauseTime *= (0.8 + Math.random() * 0.4); // 0.8-1.2x
                    break;
                case 'casual':
                    basePauseTime *= (0.6 + Math.random() * 0.4); // 0.6-1.0x
                    break;
                case 'professional':
                    basePauseTime *= (0.9 + Math.random() * 0.3); // 0.9-1.2x
                    break;
            }
        }
        
        // Add content complexity factor
        const contentComplexity = this.assessContentComplexity();
        if (contentComplexity === 'high') {
            basePauseTime *= (1.3 + Math.random() * 0.5); // 1.3-1.8x for complex content
        } else if (contentComplexity === 'low') {
            basePauseTime *= (0.7 + Math.random() * 0.3); // 0.7-1.0x for simple content
        }
        
        // Add random thinking pause
        const thinkingChance = Math.random() < 0.2; // 20% chance for longer thinking pause
        if (thinkingChance) {
            basePauseTime *= (1.5 + Math.random() * 1.0); // 1.5-2.5x for thinking
        }
        
        // Add natural micro-variations
        const microVariation = (Math.random() - 0.5) * basePauseTime * 0.2; // ±10% variation
        const finalPauseTime = Math.max(200, Math.round(basePauseTime + microVariation)); // Minimum 200ms
        
        console.log(`🤔 Comprehension pause: ${finalPauseTime}ms`);
        await this.delay(finalPauseTime);
    }

    /**
     * Analyze page content with focus on HTML structure
     */
    analyzeContent() {
        const content = {
            type: this.detectContentType(),
            quality: this.analyzeContentQuality(),
            elements: this.extractContentElements(),
            readingLevel: this.assessReadingLevel(),
            complexity: this.assessComplexity(),
            
            // Enhanced structure analysis for article reading
            headings: this.analyzeHeadings(),
            tables: this.analyzeTables(),
            articleStructure: this.analyzeArticleStructure(),
            contentSections: this.identifyContentSections()
        };
        
        console.log('📊 Content Analysis:', {
            headings: content.headings.total,
            tables: content.tables.total,
            sections: content.contentSections.length,
            structure: content.articleStructure.type
        });
        
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
     * Calculate reading time (Enhanced for Human-Like Behavior)
     */
    calculateReadingTime(personality, contentType, contentQuality, options = {}) {
        // More natural base time with wider variation
        let baseTime = 12000 + Math.random() * 8000; // 12-20 seconds base (was 15 seconds fixed)
        
        // Adjust based on personality reading speed with more natural variation
        if (personality) {
            switch (personality.readingSpeed) {
                case 'slow':
                    baseTime *= (1.6 + Math.random() * 0.8); // 1.6-2.4x (was 2.0x fixed)
                    break;
                case 'fast':
                    baseTime *= (0.6 + Math.random() * 0.4); // 0.6-1.0x (was 0.8x fixed)
                    break;
                default:
                    baseTime *= (0.8 + Math.random() * 0.4); // 0.8-1.2x for normal speed
                    break;
            }
        }
        
        // Adjust based on content type with more natural variation
        switch (contentType) {
            case 'article':
                baseTime *= (1.6 + Math.random() * 0.8); // 1.6-2.4x (was 2.0x fixed)
                break;
            case 'technical':
                baseTime *= (2.0 + Math.random() * 1.0); // 2.0-3.0x (was 2.5x fixed)
                break;
            case 'news':
                baseTime *= (1.2 + Math.random() * 0.6); // 1.2-1.8x (was 1.5x fixed)
                break;
            case 'blog':
                baseTime *= (1.4 + Math.random() * 0.8); // 1.4-2.2x (was 1.8x fixed)
                break;
            case 'casual':
                baseTime *= (1.0 + Math.random() * 0.4); // 1.0-1.4x (was 1.2x fixed)
                break;
            default:
                baseTime *= (1.0 + Math.random() * 0.6); // 1.0-1.6x for general content
                break;
        }
        
        // Adjust based on content quality with more natural variation
        if (contentQuality === 'high') {
            baseTime *= (1.2 + Math.random() * 0.6); // 1.2-1.8x (was 1.5x fixed)
        } else if (contentQuality === 'low') {
            baseTime *= (0.6 + Math.random() * 0.4); // 0.6-1.0x for low quality
        }
        
        // Add human-like attention and distraction factors
        const attentionFactor = 0.7 + Math.random() * 0.6; // 0.7-1.3
        baseTime *= attentionFactor;
        
        // Add random distraction factor
        const distractionFactor = Math.random() < 0.15 ? (1.5 + Math.random() * 1.5) : 1.0; // 15% chance for 1.5-3.0x longer
        baseTime *= distractionFactor;
        
        // Add more natural randomness
        baseTime += (Math.random() - 0.5) * baseTime * 0.5; // ±25% variation (was ±15%)
        
        // Add fatigue factor (longer reading over time)
        const fatigueFactor = 1 + Math.random() * 0.3; // 1.0-1.3
        baseTime *= fatigueFactor;
        
        // Ensure minimum reading time for proper content consumption
        const minTime = 8000 + Math.random() * 4000; // 8-12 seconds minimum (was 12 seconds fixed)
        const calculatedTime = Math.round(baseTime);
        
        return Math.max(calculatedTime, minTime);
    }

    /**
     * Calculate reading time with content interest consideration
     */
    calculateReadingTimeWithInterest(personality, contentType, contentQuality, contentInterest, options = {}) {
        let baseTime = 15000; // 15 seconds base
        
        // Adjust based on personality reading speed
        if (personality) {
            switch (personality.readingSpeed) {
                case 'slow':
                baseTime *= 2.0;
                    break;
                case 'fast':
                    baseTime *= 0.8;
                    break;
            }
        }
        
        // Adjust based on content type
        switch (contentType) {
            case 'article':
                baseTime *= 2.0;
                break;
            case 'technical':
                baseTime *= 2.5;
                break;
            case 'news':
                baseTime *= 1.5;
                break;
            case 'blog':
                baseTime *= 1.8;
                break;
            case 'casual':
                baseTime *= 1.2;
                break;
        }
        
        // Adjust based on content quality
        if (contentQuality === 'high') {
            baseTime *= 1.5;
        }
        
        // Interest-based adjustment
        const interestMultiplier = 0.3 + (contentInterest * 0.7); // 0.3x to 1.0x
        baseTime *= interestMultiplier;
        
        // Add randomness
        baseTime += (Math.random() - 0.5) * baseTime * 0.3;
        
        // Ensure minimum reading time for proper content consumption
        const minTime = 8000; // 8 seconds minimum (reduced for low interest content)
        const calculatedTime = Math.round(baseTime);
        
        return Math.max(calculatedTime, minTime);
    }

    /**
     * Divide reading into segments (optimized for realistic timing)
     */
    divideReadingIntoSegments(totalTime, pattern) {
        const segments = [];
        const segmentCount = 3 + Math.floor(Math.random() * 3); // Increased from 2-3 to 3-5 segments
        const baseSegmentTime = totalTime / segmentCount;
        
        console.log(`📖 Dividing reading into ${segmentCount} segments of ~${Math.round(baseSegmentTime/1000)}s each`);
        
        for (let i = 0; i < segmentCount; i++) {
            const segmentTime = baseSegmentTime + (Math.random() - 0.5) * baseSegmentTime * 0.3; // Reduced variation
            segments.push({
                duration: Math.round(segmentTime),
                content: this.currentContent,
                segmentIndex: i,
                totalSegments: segmentCount
            });
        }
        
        return segments;
    }

    /**
     * Divide reading into segments with interest consideration
     */
    divideReadingIntoSegmentsWithInterest(totalTime, pattern, contentInterest) {
        // Adjust segment count based on interest
        const baseSegmentCount = 3 + Math.floor(Math.random() * 3); // 3-5 segments
        const interestMultiplier = 0.5 + (contentInterest * 0.5); // 0.5x to 1.0x
        const segmentCount = Math.max(2, Math.floor(baseSegmentCount * interestMultiplier));
        
        const baseSegmentTime = totalTime / segmentCount;
        
        console.log(`📖 Dividing reading into ${segmentCount} segments of ~${Math.round(baseSegmentTime/1000)}s each (Interest: ${(contentInterest * 100).toFixed(1)}%)`);
        
        const segments = [];
        for (let i = 0; i < segmentCount; i++) {
            const segmentTime = baseSegmentTime + (Math.random() - 0.5) * baseSegmentTime * 0.3;
            segments.push({
                duration: Math.round(segmentTime),
                content: this.currentContent,
                segmentIndex: i,
                totalSegments: segmentCount
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
     * Get reading pause time (Enhanced for Human-Like Behavior)
     */
    getReadingPauseTime(personality, elementType) {
        // More natural base time with wider variation
        const baseTime = 150 + Math.random() * 300; // 150-450ms (was 200ms fixed)
        let multiplier = 1.0;
        
        if (personality) {
            switch (personality.readingSpeed) {
                case 'slow':
                    multiplier = 1.2 + Math.random() * 0.6; // 1.2-1.8x (was 1.3x fixed)
                    break;
                case 'fast':
                    multiplier = 0.5 + Math.random() * 0.3; // 0.5-0.8x (was 0.6x fixed)
                    break;
                default:
                    multiplier = 0.8 + Math.random() * 0.4; // 0.8-1.2x for normal speed
                    break;
            }
        }
        
        // Adjust based on element type with more natural variation
        switch (elementType) {
            case 'h1':
            case 'h2':
                multiplier *= (1.1 + Math.random() * 0.4); // 1.1-1.5x (was 1.2x fixed)
                break;
            case 'h3':
            case 'h4':
                multiplier *= (1.0 + Math.random() * 0.3); // 1.0-1.3x
                break;
            case 'p':
                multiplier *= (0.9 + Math.random() * 0.3); // 0.9-1.2x (was 1.0x fixed)
                break;
            case 'img':
                multiplier *= (1.3 + Math.random() * 0.5); // 1.3-1.8x for images
                break;
            case 'blockquote':
                multiplier *= (1.2 + Math.random() * 0.4); // 1.2-1.6x for quotes
                break;
            default:
                multiplier *= (0.6 + Math.random() * 0.4); // 0.6-1.0x (was 0.7x fixed)
                break;
        }
        
        // Add human-like attention factor
        const attentionFactor = 0.7 + Math.random() * 0.6; // 0.7-1.3
        multiplier *= attentionFactor;
        
        // Add occasional longer pauses for comprehension
        const comprehensionChance = Math.random() < 0.15; // 15% chance
        const comprehensionMultiplier = comprehensionChance ? (1.5 + Math.random() * 1.0) : 1.0; // 1.5-2.5x
        
        const finalTime = baseTime * multiplier * comprehensionMultiplier;
        
        // Add natural micro-variations
        const microVariation = (Math.random() - 0.5) * finalTime * 0.3; // ±15% variation
        
        return Math.max(50, Math.round(finalTime + microVariation)); // Minimum 50ms
    }

    /**
     * Get re-read time (optimized for realistic timing)
     */
    getReReadTime(personality, contentType) {
        const baseTime = 800; // Reduced from 2000ms to 800ms
        let multiplier = 1.0;
        
        if (personality?.attentionSpan === 'long') {
            multiplier = 1.3; // Reduced from 1.5 to 1.3
        }
        
        if (contentType === 'technical') {
            multiplier *= 1.2; // Reduced from 1.3 to 1.2
        }
        
        return baseTime * multiplier + Math.random() * 400; // Reduced randomness
    }

    /**
     * Get selection probability with fatigue consideration
     */
    getSelectionProbabilityWithFatigue(baseProbability, readingFatigue, contentInterest) {
        // Higher probability when interested
        const interestBonus = contentInterest * 0.2;
        
        // Lower probability when fatigued
        const fatiguePenalty = readingFatigue * 0.3;
        
        return Math.max(0.05, Math.min(0.9, baseProbability + interestBonus - fatiguePenalty));
    }

    /**
     * Get scroll probability with fatigue consideration
     */
    getScrollProbabilityWithFatigue(baseProbability, readingFatigue, contentInterest) {
        // Higher probability when interested
        const interestBonus = contentInterest * 0.2;
        
        // Lower probability when fatigued
        const fatiguePenalty = readingFatigue * 0.2;
        
        return Math.max(0.1, Math.min(0.8, baseProbability + interestBonus - fatiguePenalty));
    }

    /**
     * Get comprehension probability with fatigue consideration
     */
    getComprehensionProbabilityWithFatigue(baseProbability, readingFatigue, contentInterest) {
        // Higher probability when interested
        const interestBonus = contentInterest * 0.15;
        
        // Lower probability when fatigued
        const fatiguePenalty = readingFatigue * 0.4;
        
        return Math.max(0.05, Math.min(0.6, baseProbability + interestBonus - fatiguePenalty));
    }

    /**
     * Simulate reading scroll with fatigue consideration
     */
    async simulateReadingScrollWithFatigue(readingFatigue, contentInterest) {
        // Get page dimensions
        const pageHeight = document.body.scrollHeight;
        const viewportHeight = window.innerHeight;
        const currentPosition = window.pageYOffset;
        
        // Calculate scroll distance based on fatigue and interest
        const remainingContent = pageHeight - currentPosition - viewportHeight;
        
        if (remainingContent > 0) {
            // Interest-based scroll distance
            const interestMultiplier = 0.3 + (contentInterest * 0.4); // 0.3x to 0.7x
            const fatigueMultiplier = 1 - (readingFatigue * 0.3); // 0.7x to 1.0x
            
            const scrollDistance = Math.min(
                remainingContent * interestMultiplier * fatigueMultiplier,
                viewportHeight * 2
            );
            
            console.log(`📖 Reading scroll: ${Math.round(scrollDistance)}px forward (Interest: ${(contentInterest * 100).toFixed(1)}%, Fatigue: ${(readingFatigue * 100).toFixed(1)}%)`);
            
            await this.behaviorSimulator.simulateNaturalScrolling(
                currentPosition + scrollDistance, 
                1500
            );
        } else {
            // Scroll back for re-reading (less likely when fatigued)
            if (Math.random() > readingFatigue) {
                const scrollBackDistance = Math.random() * viewportHeight * (1 - readingFatigue);
                console.log(`📖 Reading scroll back: ${Math.round(scrollBackDistance)}px for re-reading`);
                
                await this.behaviorSimulator.simulateNaturalScrolling(
                    Math.max(0, currentPosition - scrollBackDistance), 
                    1500
                );
            }
        }
    }

    /**
     * Simulate comprehension pause with fatigue consideration
     */
    async simulateComprehensionPauseWithFatigue(readingFatigue, contentInterest) {
        const personality = this.behaviorSimulator?.currentPersonality;
        
        // Base pause time
        let pauseTime = personality?.attentionSpan === 'long' ? 
            500 + Math.random() * 1000 : 
            300 + Math.random() * 700;
        
        // Interest-based adjustment
        const interestMultiplier = 0.5 + (contentInterest * 0.5); // 0.5x to 1.0x
        pauseTime *= interestMultiplier;
        
        // Fatigue-based adjustment
        const fatigueMultiplier = 1 + (readingFatigue * 0.5); // Longer pauses when fatigued
        pauseTime *= fatigueMultiplier;
        
        await this.delay(pauseTime);
    }

    /**
     * Get re-read probability with fatigue consideration
     */
    getReReadProbabilityWithFatigue(baseProbability, readingFatigue, contentInterest) {
        // Higher probability when interested
        const interestBonus = contentInterest * 0.2;
        
        // Lower probability when fatigued
        const fatiguePenalty = readingFatigue * 0.4;
        
        return Math.max(0.02, Math.min(0.6, baseProbability + interestBonus - fatiguePenalty));
    }

    /**
     * Simulate re-reading with fatigue consideration
     */
    async simulateReReadingWithFatigue(content, readingFatigue, contentInterest) {
        const personality = this.behaviorSimulator?.currentPersonality;
        
        // Interest-based re-read time
        const baseTime = 800;
        const interestMultiplier = 0.3 + (contentInterest * 0.7); // 0.3x to 1.0x
        const fatigueMultiplier = 1 - (readingFatigue * 0.5); // 0.5x to 1.0x
        
        const reReadTime = baseTime * interestMultiplier * fatigueMultiplier;
        
        // Move back to content (less likely when fatigued)
        if (Math.random() > readingFatigue && content.elements && content.elements.length > 0) {
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
     * Assess content interest level (0.0 to 1.0)
     */
    assessContentInterest() {
        try {
            let interestScore = 0.5; // Base interest level
            
            // Check for engaging content indicators
            const title = document.title.toLowerCase();
            const content = document.body.textContent.toLowerCase();
            
            // Interest keywords
            const highInterestKeywords = [
                'breaking', 'exclusive', 'latest', 'update', 'news', 'trending',
                'viral', 'popular', 'best', 'top', 'amazing', 'incredible',
                'how to', 'guide', 'tutorial', 'tips', 'tricks', 'secrets',
                'review', 'comparison', 'vs', 'versus', 'analysis', 'study',
                'ai', 'artificial intelligence', 'machine learning', 'technology',
                'startup', 'business', 'money', 'investment', 'crypto', 'bitcoin'
            ];
            
            const lowInterestKeywords = [
                'privacy policy', 'terms of service', 'cookie policy', 'disclaimer',
                '404', 'error', 'not found', 'maintenance', 'under construction',
                'advertisement', 'sponsored', 'paid content'
            ];
            
            // Check title for interest keywords
            const titleInterest = highInterestKeywords.filter(keyword => 
                title.includes(keyword)
            ).length;
            
            const titleDisinterest = lowInterestKeywords.filter(keyword => 
                title.includes(keyword)
            ).length;
            
            // Check content length and structure
            const contentLength = content.length;
            const hasImages = document.querySelectorAll('img').length;
            const hasVideos = document.querySelectorAll('video, iframe[src*="youtube"], iframe[src*="vimeo"]').length;
            const hasHeadings = document.querySelectorAll('h1, h2, h3, h4, h5, h6').length;
            const hasLists = document.querySelectorAll('ul, ol').length;
            
            // Calculate interest score
            interestScore += (titleInterest * 0.1);
            interestScore -= (titleDisinterest * 0.2);
            
            // Content structure bonuses
            if (contentLength > 1000) interestScore += 0.1;
            if (hasImages > 0) interestScore += 0.1;
            if (hasVideos > 0) interestScore += 0.2;
            if (hasHeadings > 3) interestScore += 0.1;
            if (hasLists > 0) interestScore += 0.05;
            
            // Personality-based adjustments
            if (this.behaviorSimulator?.currentPersonality) {
                const personality = this.behaviorSimulator.currentPersonality;
                switch (personality.type) {
                    case 'researcher':
                        if (contentLength > 2000) interestScore += 0.2;
                        if (hasHeadings > 5) interestScore += 0.1;
                        if (title.includes('study') || title.includes('research')) interestScore += 0.2;
                        break;
                    case 'casual':
                        if (hasImages > 2) interestScore += 0.2;
                        if (hasVideos > 0) interestScore += 0.3;
                        if (title.includes('viral') || title.includes('trending')) interestScore += 0.2;
                        break;
                    case 'professional':
                        if (contentLength > 1500) interestScore += 0.1;
                        if (hasHeadings > 4) interestScore += 0.1;
                        if (title.includes('business') || title.includes('professional')) interestScore += 0.2;
                        break;
                    case 'explorer':
                        if (title.includes('new') || title.includes('latest')) interestScore += 0.2;
                        if (hasImages > 1) interestScore += 0.1;
                        break;
                }
            }
            
            // Ensure score is between 0 and 1
            return Math.max(0, Math.min(1, interestScore));
            
        } catch (error) {
            console.debug('Error assessing content interest:', error.message);
            return 0.5; // Default to neutral interest
        }
    }

    /**
     * Check if should bounce early based on content interest
     */
    shouldBounceEarly(contentInterest, personality) {
        const bounceThreshold = this.getBounceThreshold(personality);
        const earlyBounceProbability = Math.max(0, (bounceThreshold - contentInterest) * 0.4);
        
        return Math.random() < earlyBounceProbability;
    }

    /**
     * Check if should bounce mid-reading
     */
    shouldBounceMidReading(contentInterest, readingFatigue, timeOnPage) {
        // Higher chance to bounce if low interest and high fatigue
        const bounceProbability = (1 - contentInterest) * readingFatigue * 0.15;
        
        // Additional bounce chance after 2 minutes for low interest content
        if (timeOnPage > 120000 && contentInterest < 0.3) {
            return Math.random() < 0.4;
        }
        
        return Math.random() < bounceProbability;
    }

    /**
     * Get bounce threshold based on personality
     */
    getBounceThreshold(personality) {
        if (!personality) return 0.3;
        
        switch (personality.type) {
            case 'researcher':
                return 0.2; // Lower threshold - more patient
            case 'casual':
                return 0.4; // Higher threshold - less patient
            case 'professional':
                return 0.25; // Moderate threshold
            case 'explorer':
                return 0.35; // Slightly higher threshold
            default:
                return 0.3;
        }
    }

    /**
     * Utility delay function with stealth
     */
    delay(ms) {
        return this.stealthDelay.wait(ms);
    }

    /**
     * Analyze headings structure (H1, H2, H3, H4, etc.)
     */
    analyzeHeadings() {
        const headings = {
            h1: document.querySelectorAll('h1'),
            h2: document.querySelectorAll('h2'),
            h3: document.querySelectorAll('h3'),
            h4: document.querySelectorAll('h4'),
            h5: document.querySelectorAll('h5'),
            h6: document.querySelectorAll('h6')
        };
        
        const headingData = {
            total: 0,
            hierarchy: {},
            structure: [],
            readingOrder: []
        };
        
        // Count headings by level
        Object.entries(headings).forEach(([level, elements]) => {
            headingData.hierarchy[level] = elements.length;
            headingData.total += elements.length;
            
            // Create structure for reading order
            elements.forEach((heading, index) => {
                const headingInfo = {
                    level: level,
                    text: heading.textContent.trim(),
                    element: heading,
                    position: this.getElementPosition(heading),
                    wordCount: heading.textContent.split(' ').length,
                    importance: this.calculateHeadingImportance(level, heading)
                };
                
                headingData.structure.push(headingInfo);
            });
        });
        
        // Sort by reading order (top to bottom)
        headingData.structure.sort((a, b) => a.position.top - b.position.top);
        headingData.readingOrder = headingData.structure;
        
        console.log(`📋 Headings Analysis: ${headingData.total} total (H1:${headingData.hierarchy.h1}, H2:${headingData.hierarchy.h2}, H3:${headingData.hierarchy.h3})`);
        
        return headingData;
    }

    /**
     * Analyze tables in the content
     */
    analyzeTables() {
        const tables = document.querySelectorAll('table');
        const tableData = {
            total: tables.length,
            tables: [],
            hasComplexTables: false,
            totalRows: 0,
            totalColumns: 0
        };
        
        tables.forEach((table, index) => {
            const rows = table.querySelectorAll('tr');
            const cells = table.querySelectorAll('td, th');
            const columns = this.getTableColumns(table);
            
            const tableInfo = {
                index: index,
                element: table,
                rows: rows.length,
                columns: columns,
                cells: cells.length,
                position: this.getElementPosition(table),
                complexity: this.assessTableComplexity(table),
                hasHeaders: table.querySelectorAll('th').length > 0,
                content: this.extractTableContent(table)
            };
            
            tableData.tables.push(tableInfo);
            tableData.totalRows += rows.length;
            tableData.totalColumns = Math.max(tableData.totalColumns, columns);
            
            if (tableInfo.complexity > 0.7) {
                tableData.hasComplexTables = true;
            }
        });
        
        console.log(`📊 Tables Analysis: ${tableData.total} tables, ${tableData.totalRows} rows, max ${tableData.totalColumns} columns`);
        
        return tableData;
    }

    /**
     * Analyze article structure
     */
    analyzeArticleStructure() {
        const structure = {
            type: 'unknown',
            hasIntroduction: false,
            hasConclusion: false,
            hasSections: false,
            hasSidebar: false,
            hasNavigation: false,
            mainContent: null,
            readingFlow: []
        };
        
        // Detect article type
        if (document.querySelector('article')) {
            structure.type = 'semantic-article';
            structure.mainContent = document.querySelector('article');
        } else if (document.querySelector('.article, .post, .content')) {
            structure.type = 'class-based-article';
            structure.mainContent = document.querySelector('.article, .post, .content');
        } else if (document.querySelector('main')) {
            structure.type = 'main-content';
            structure.mainContent = document.querySelector('main');
        } else {
            structure.type = 'general-page';
            structure.mainContent = document.body;
        }
        
        // Check for common article elements
        structure.hasIntroduction = this.hasIntroductionSection();
        structure.hasConclusion = this.hasConclusionSection();
        structure.hasSections = document.querySelectorAll('section, .section').length > 0;
        structure.hasSidebar = document.querySelectorAll('aside, .sidebar, .side-content').length > 0;
        structure.hasNavigation = document.querySelectorAll('nav, .navigation, .nav').length > 0;
        
        // Create reading flow
        structure.readingFlow = this.createReadingFlow(structure.mainContent);
        
        console.log(`📖 Article Structure: ${structure.type}, sections: ${structure.hasSections}, flow: ${structure.readingFlow.length} elements`);
        
        return structure;
    }

    /**
     * Identify content sections for focused reading
     */
    identifyContentSections() {
        const sections = [];
        const mainContent = document.querySelector('article, main, .content, .post') || document.body;
        
        // Find all potential content sections
        const sectionSelectors = [
            'section',
            '.section',
            '.content-section',
            '.post-section',
            'div[class*="section"]',
            'div[class*="content"]',
            'div[class*="post"]'
        ];
        
        sectionSelectors.forEach(selector => {
            const elements = mainContent.querySelectorAll(selector);
            elements.forEach(element => {
                if (this.isContentSection(element)) {
                    sections.push({
                        element: element,
                        type: this.getSectionType(element),
                        position: this.getElementPosition(element),
                        content: this.extractSectionContent(element),
                        importance: this.calculateSectionImportance(element)
                    });
                }
            });
        });
        
        // Sort by position
        sections.sort((a, b) => a.position.top - b.position.top);
        
        console.log(`📑 Content Sections: ${sections.length} sections identified`);
        
        return sections;
    }

    /**
     * Get element position in viewport
     */
    getElementPosition(element) {
        const rect = element.getBoundingClientRect();
        return {
            top: rect.top + window.scrollY,
            left: rect.left + window.scrollX,
            bottom: rect.bottom + window.scrollY,
            right: rect.right + window.scrollX,
            width: rect.width,
            height: rect.height,
            inViewport: rect.top >= 0 && rect.bottom <= window.innerHeight
        };
    }

    /**
     * Calculate heading importance based on level and content
     */
    calculateHeadingImportance(level, heading) {
        const levelWeights = { h1: 1.0, h2: 0.8, h3: 0.6, h4: 0.4, h5: 0.3, h6: 0.2 };
        const baseWeight = levelWeights[level] || 0.1;
        
        // Boost importance for longer headings (more descriptive)
        const textLength = heading.textContent.length;
        const lengthBoost = Math.min(textLength / 50, 0.3);
        
        // Boost importance for headings with keywords
        const keywords = ['introduction', 'conclusion', 'summary', 'overview', 'important', 'key', 'main'];
        const hasKeywords = keywords.some(keyword => 
            heading.textContent.toLowerCase().includes(keyword)
        );
        const keywordBoost = hasKeywords ? 0.2 : 0;
        
        return Math.min(baseWeight + lengthBoost + keywordBoost, 1.0);
    }

    /**
     * Get number of columns in a table
     */
    getTableColumns(table) {
        const firstRow = table.querySelector('tr');
        if (!firstRow) return 0;
        
        return firstRow.querySelectorAll('td, th').length;
    }

    /**
     * Assess table complexity
     */
    assessTableComplexity(table) {
        const rows = table.querySelectorAll('tr').length;
        const columns = this.getTableColumns(table);
        const cells = table.querySelectorAll('td, th').length;
        
        // Simple complexity calculation
        const sizeComplexity = Math.min((rows * columns) / 100, 0.5);
        const structureComplexity = table.querySelectorAll('thead, tbody, tfoot').length > 0 ? 0.2 : 0;
        const contentComplexity = cells > 20 ? 0.3 : 0;
        
        return Math.min(sizeComplexity + structureComplexity + contentComplexity, 1.0);
    }

    /**
     * Extract table content for analysis
     */
    extractTableContent(table) {
        const content = {
            headers: [],
            data: [],
            summary: ''
        };
        
        // Extract headers
        const headerCells = table.querySelectorAll('th');
        headerCells.forEach(cell => {
            content.headers.push(cell.textContent.trim());
        });
        
        // Extract data rows
        const rows = table.querySelectorAll('tr');
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length > 0) {
                const rowData = Array.from(cells).map(cell => cell.textContent.trim());
                content.data.push(rowData);
            }
        });
        
        // Create summary
        content.summary = `${content.headers.length} columns, ${content.data.length} rows`;
        
        return content;
    }

    /**
     * Check if has introduction section
     */
    hasIntroductionSection() {
        const introSelectors = [
            '.introduction',
            '.intro',
            '.overview',
            '.summary',
            'section:first-of-type',
            '.content > p:first-of-type'
        ];
        
        return introSelectors.some(selector => document.querySelector(selector));
    }

    /**
     * Check if has conclusion section
     */
    hasConclusionSection() {
        const conclusionSelectors = [
            '.conclusion',
            '.summary',
            '.ending',
            '.final',
            'section:last-of-type',
            '.content > p:last-of-type'
        ];
        
        return conclusionSelectors.some(selector => document.querySelector(selector));
    }

    /**
     * Create reading flow from main content
     */
    createReadingFlow(mainContent) {
        const flow = [];
        const elements = mainContent.querySelectorAll('h1, h2, h3, h4, h5, h6, p, ul, ol, table, blockquote, .highlight');
        
        elements.forEach(element => {
            const position = this.getElementPosition(element);
            flow.push({
                element: element,
                tagName: element.tagName.toLowerCase(),
                position: position,
                text: element.textContent.trim(),
                importance: this.getElementImportance(element)
            });
        });
        
        // Sort by position
        flow.sort((a, b) => a.position.top - b.position.top);
        
        return flow;
    }

    /**
     * Check if element is a content section
     */
    isContentSection(element) {
        const textContent = element.textContent.trim();
        const minLength = 50; // Minimum text length for a section
        
        // Must have sufficient content
        if (textContent.length < minLength) return false;
        
        // Must not be navigation, footer, or sidebar
        const excludeClasses = ['nav', 'navigation', 'footer', 'sidebar', 'menu', 'header'];
        const hasExcludeClass = excludeClasses.some(cls => 
            element.className.toLowerCase().includes(cls)
        );
        
        if (hasExcludeClass) return false;
        
        // Must have meaningful content
        const hasHeadings = element.querySelector('h1, h2, h3, h4, h5, h6');
        const hasParagraphs = element.querySelector('p');
        const hasLists = element.querySelector('ul, ol');
        const hasTables = element.querySelector('table');
        
        return hasHeadings || hasParagraphs || hasLists || hasTables;
    }

    /**
     * Get section type
     */
    getSectionType(element) {
        const className = element.className.toLowerCase();
        const textContent = element.textContent.toLowerCase();
        
        if (className.includes('intro') || textContent.includes('introduction')) return 'introduction';
        if (className.includes('conclusion') || textContent.includes('conclusion')) return 'conclusion';
        if (className.includes('summary') || textContent.includes('summary')) return 'summary';
        if (element.querySelector('table')) return 'data';
        if (element.querySelector('ul, ol')) return 'list';
        if (element.querySelector('h1, h2, h3')) return 'content';
        
        return 'general';
    }

    /**
     * Extract section content
     */
    extractSectionContent(element) {
        return {
            text: element.textContent.trim(),
            wordCount: element.textContent.split(' ').length,
            hasHeadings: element.querySelectorAll('h1, h2, h3, h4, h5, h6').length,
            hasLists: element.querySelectorAll('ul, ol').length,
            hasTables: element.querySelectorAll('table').length,
            hasImages: element.querySelectorAll('img').length
        };
    }

    /**
     * Calculate section importance
     */
    calculateSectionImportance(element) {
        let importance = 0.5; // Base importance
        
        // Boost for headings
        const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
        importance += headings.length * 0.1;
        
        // Boost for content length
        const wordCount = element.textContent.split(' ').length;
        importance += Math.min(wordCount / 200, 0.3);
        
        // Boost for special content types
        if (element.querySelector('table')) importance += 0.2;
        if (element.querySelector('ul, ol')) importance += 0.1;
        if (element.querySelector('img')) importance += 0.1;
        
        // Boost for section type
        const sectionType = this.getSectionType(element);
        if (sectionType === 'introduction' || sectionType === 'conclusion') importance += 0.2;
        
        return Math.min(importance, 1.0);
    }

    /**
     * Get element importance for reading flow
     */
    getElementImportance(element) {
        const tagName = element.tagName.toLowerCase();
        const importanceMap = {
            'h1': 1.0,
            'h2': 0.8,
            'h3': 0.6,
            'h4': 0.4,
            'h5': 0.3,
            'h6': 0.2,
            'p': 0.7,
            'table': 0.8,
            'ul': 0.6,
            'ol': 0.6,
            'blockquote': 0.5,
            'div': 0.3
        };
        
        return importanceMap[tagName] || 0.3;
    }

    /**
     * Simulate reading headings with focus
     */
    async simulateHeadingReading(headings, type = 'main') {
        const personality = this.behaviorSimulator?.currentPersonality;
        const targetHeadings = type === 'main' ? 
            headings.structure.filter(h => h.level === 'h1' || h.level === 'h2') :
            headings.structure.filter(h => h.level === 'h3' || h.level === 'h4' || h.level === 'h5' || h.level === 'h6');
        
        console.log(`📋 Reading ${type} headings: ${targetHeadings.length} headings`);
        
        for (const heading of targetHeadings) {
            // Scroll to heading if not in viewport
            if (!heading.position.inViewport) {
                await this.scrollToElement(heading.element);
                await this.delay(500 + Math.random() * 1000);
            }
            
            // Simulate reading the heading
            const readingTime = this.calculateHeadingReadingTime(heading, personality);
            console.log(`📋 Reading ${heading.level}: "${heading.text.substring(0, 50)}..." (${readingTime}ms)`);
            
            // Simulate eye movement and focus
            await this.simulateEyeMovementOnElement(heading.element);
            await this.delay(readingTime);
            
            // Simulate text selection for important headings
            if (heading.importance > 0.7 && Math.random() < 0.3) {
                await this.simulateTextSelectionOnElement(heading.element);
            }
            
            // Pause after reading heading
            const pauseTime = this.calculateHeadingPause(heading, personality);
            await this.delay(pauseTime);
        }
    }

    /**
     * Simulate reading content sections
     */
    async simulateSectionReading(sections, type = 'content') {
        const personality = this.behaviorSimulator?.currentPersonality;
        const targetSections = type === 'introduction' ? 
            sections.filter(s => s.type === 'introduction') :
            type === 'conclusion' ?
            sections.filter(s => s.type === 'conclusion') :
            sections.filter(s => s.type === 'content' || s.type === 'general');
        
        console.log(`📑 Reading ${type} sections: ${targetSections.length} sections`);
        
        for (const section of targetSections) {
            // Scroll to section if not in viewport
            if (!section.position.inViewport) {
                await this.scrollToElement(section.element);
                await this.delay(500 + Math.random() * 1000);
            }
            
            // Simulate reading the section
            const readingTime = this.calculateSectionReadingTime(section, personality);
            console.log(`📑 Reading ${section.type} section: ${section.content.wordCount} words (${readingTime}ms)`);
            
            // Simulate reading behavior for section
            await this.simulateSectionReadingBehavior(section, readingTime);
            
            // Pause after reading section
            const pauseTime = this.calculateSectionPause(section, personality);
            await this.delay(pauseTime);
        }
    }

    /**
     * Simulate reading tables with special attention
     */
    async simulateTableReading(tables) {
        const personality = this.behaviorSimulator?.currentPersonality;
        
        console.log(`📊 Reading tables: ${tables.total} tables`);
        
        for (const table of tables.tables) {
            // Scroll to table if not in viewport
            if (!table.position.inViewport) {
                await this.scrollToElement(table.element);
                await this.delay(500 + Math.random() * 1000);
            }
            
            // Simulate reading the table
            const readingTime = this.calculateTableReadingTime(table, personality);
            console.log(`📊 Reading table: ${table.rows} rows × ${table.columns} columns (${readingTime}ms)`);
            
            // Simulate table reading behavior
            await this.simulateTableReadingBehavior(table, readingTime);
            
            // Pause after reading table
            const pauseTime = this.calculateTablePause(table, personality);
            await this.delay(pauseTime);
        }
    }

    /**
     * Scroll to element smoothly
     */
    async scrollToElement(element) {
        const rect = element.getBoundingClientRect();
        const targetY = rect.top + window.scrollY - 100; // 100px offset from top
        
        // Smooth scroll to element
        const startY = window.scrollY;
        const distance = targetY - startY;
        const duration = 800 + Math.random() * 400; // 800-1200ms
        const startTime = Date.now();
        
        return new Promise(resolve => {
            const animateScroll = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Easing function for smooth scroll
                const easeInOutCubic = progress < 0.5 ? 
                    4 * progress * progress * progress : 
                    1 - Math.pow(-2 * progress + 2, 3) / 2;
                
                window.scrollTo(0, startY + distance * easeInOutCubic);
                
                if (progress < 1) {
                    requestAnimationFrame(animateScroll);
                } else {
                    resolve();
                }
            };
            
            animateScroll();
        });
    }

    /**
     * Simulate eye movement on element
     */
    async simulateEyeMovementOnElement(element) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Simulate eye movement with small random variations
        const eyeMovements = 3 + Math.floor(Math.random() * 3);
        
        for (let i = 0; i < eyeMovements; i++) {
            const offsetX = (Math.random() - 0.5) * 20;
            const offsetY = (Math.random() - 0.5) * 10;
            
            // Simulate eye movement by moving mouse slightly
            const event = new MouseEvent('mousemove', {
                clientX: centerX + offsetX,
                clientY: centerY + offsetY,
                bubbles: true
            });
            
            document.dispatchEvent(event);
            await this.delay(100 + Math.random() * 200);
        }
    }

    /**
     * Simulate text selection on element
     */
    async simulateTextSelectionOnElement(element) {
        try {
            const range = document.createRange();
            const textNode = element.firstChild;
            
            if (textNode && textNode.nodeType === Node.TEXT_NODE) {
                const text = textNode.textContent;
                const startOffset = Math.floor(Math.random() * Math.max(0, text.length - 10));
                const endOffset = startOffset + Math.floor(Math.random() * 10) + 5;
                
                range.setStart(textNode, startOffset);
                range.setEnd(textNode, Math.min(endOffset, text.length));
                
                const selection = window.getSelection();
                selection.removeAllRanges();
                selection.addRange(range);
                
                // Keep selection for a short time
                await this.delay(500 + Math.random() * 1000);
                
                // Clear selection
                selection.removeAllRanges();
            }
        } catch (error) {
            // Silent error handling
            console.warn('Text selection simulation error:', error.message);
        }
    }

    /**
     * Calculate heading reading time
     */
    calculateHeadingReadingTime(heading, personality) {
        const baseTime = 800; // Base reading time for headings
        const wordCount = heading.wordCount;
        const importance = heading.importance;
        
        // Adjust based on word count
        const wordTime = wordCount * 150; // 150ms per word
        
        // Adjust based on importance
        const importanceMultiplier = 0.5 + (importance * 0.5);
        
        // Adjust based on personality
        const personalityMultiplier = this.getPersonalityReadingMultiplier(personality);
        
        return Math.floor(baseTime + wordTime * importanceMultiplier * personalityMultiplier);
    }

    /**
     * Calculate section reading time
     */
    calculateSectionReadingTime(section, personality) {
        const baseTime = 2000; // Base reading time for sections
        const wordCount = section.content.wordCount;
        
        // Adjust based on word count (50ms per word)
        const wordTime = wordCount * 50;
        
        // Adjust based on content complexity
        const complexityMultiplier = 1 + (section.content.hasHeadings * 0.2) + 
                                   (section.content.hasTables * 0.3) + 
                                   (section.content.hasLists * 0.1);
        
        // Adjust based on personality
        const personalityMultiplier = this.getPersonalityReadingMultiplier(personality);
        
        return Math.floor(baseTime + wordTime * complexityMultiplier * personalityMultiplier);
    }

    /**
     * Calculate table reading time
     */
    calculateTableReadingTime(table, personality) {
        const baseTime = 3000; // Base reading time for tables
        const cellCount = table.cells;
        const complexity = table.complexity;
        
        // Adjust based on cell count (100ms per cell)
        const cellTime = cellCount * 100;
        
        // Adjust based on complexity
        const complexityMultiplier = 1 + (complexity * 0.5);
        
        // Adjust based on personality
        const personalityMultiplier = this.getPersonalityReadingMultiplier(personality);
        
        return Math.floor(baseTime + cellTime * complexityMultiplier * personalityMultiplier);
    }

    /**
     * Calculate heading pause time
     */
    calculateHeadingPause(heading, personality) {
        const basePause = 500;
        const importance = heading.importance;
        
        // Longer pause for more important headings
        const importanceMultiplier = 1 + (importance * 0.5);
        
        // Adjust based on personality
        const personalityMultiplier = this.getPersonalityReadingMultiplier(personality);
        
        return Math.floor(basePause * importanceMultiplier * personalityMultiplier);
    }

    /**
     * Calculate section pause time
     */
    calculateSectionPause(section, personality) {
        const basePause = 1000;
        const importance = section.importance;
        
        // Longer pause for more important sections
        const importanceMultiplier = 1 + (importance * 0.3);
        
        // Adjust based on personality
        const personalityMultiplier = this.getPersonalityReadingMultiplier(personality);
        
        return Math.floor(basePause * importanceMultiplier * personalityMultiplier);
    }

    /**
     * Calculate table pause time
     */
    calculateTablePause(table, personality) {
        const basePause = 1500;
        const complexity = table.complexity;
        
        // Longer pause for more complex tables
        const complexityMultiplier = 1 + (complexity * 0.4);
        
        // Adjust based on personality
        const personalityMultiplier = this.getPersonalityReadingMultiplier(personality);
        
        return Math.floor(basePause * complexityMultiplier * personalityMultiplier);
    }

    /**
     * Get personality reading multiplier
     */
    getPersonalityReadingMultiplier(personality) {
        const multipliers = {
            'Explorer': 1.2,      // Reads faster, less detail
            'Researcher': 0.8,    // Reads slower, more detail
            'Casual': 1.0,        // Normal reading speed
            'Professional': 0.9   // Slightly slower, more thorough
        };
        
        return multipliers[personality?.type] || 1.0;
    }

    /**
     * Simulate section reading behavior
     */
    async simulateSectionReadingBehavior(section, readingTime) {
        // Simulate reading with eye movements
        const eyeMovements = Math.floor(readingTime / 2000); // Eye movement every 2 seconds
        
        for (let i = 0; i < eyeMovements; i++) {
            await this.simulateEyeMovementOnElement(section.element);
            await this.delay(2000 + Math.random() * 1000);
        }
        
        // Simulate occasional text selection
        if (Math.random() < 0.2) {
            await this.simulateTextSelectionOnElement(section.element);
        }
    }

    /**
     * Simulate table reading behavior
     */
    async simulateTableReadingBehavior(table, readingTime) {
        // Simulate reading table with systematic eye movements
        const rows = table.element.querySelectorAll('tr');
        const cells = table.element.querySelectorAll('td, th');
        
        // Simulate reading headers first
        const headers = table.element.querySelectorAll('th');
        if (headers.length > 0) {
            for (const header of headers) {
                await this.simulateEyeMovementOnElement(header);
                await this.delay(300 + Math.random() * 200);
            }
        }
        
        // Simulate reading data cells
        const cellsToRead = Math.min(cells.length, Math.floor(readingTime / 200));
        for (let i = 0; i < cellsToRead; i++) {
            const cell = cells[Math.floor(Math.random() * cells.length)];
            await this.simulateEyeMovementOnElement(cell);
            await this.delay(200 + Math.random() * 300);
        }
    }
}

// Export for use in other modules with enhanced stealth protection
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ReadingSimulator;
} else if (typeof window !== 'undefined' && !window.ReadingSimulator) {
    window.ReadingSimulator = ReadingSimulator;
}
