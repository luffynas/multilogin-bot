/**
 * Reading Simulator - Simulasi behavior membaca yang realistis
 */

class ReadingSimulator {
    constructor() {
        // Enhanced configuration for performance optimization
        this.config = {
            // Memory management
            maxScrollPositions: 30,
            maxMousePositions: 25,
            maxTextSelections: 20,
            cleanupInterval: 30000, // 30 seconds
            
            // Performance optimization
            enableCaching: true,
            cacheTimeout: 300000, // 5 minutes
            maxCacheSize: 100,
            enableRateLimiting: true,
            minEventDelay: 100, // Minimum delay between events
            
            // Reading behavior
            maxReadingDuration: 300000, // 5 minutes
            enableProgressTracking: true,
            enableAdaptiveTiming: true,
            
            // Error handling
            maxRetries: 3,
            retryDelay: 1000,
            enableFallbackBehavior: true
        };

        // Core reading state
        this.isReading = false;
        this.currentPosition = 0;
        this.readingStartTime = null;
        this.totalDuration = 0;
        this.totalElements = 0;
        
        // Performance optimization: memory management
        this.scrollPositions = [];
        this.mousePositions = [];
        this.textSelections = [];
        this.lastCleanup = Date.now();
        
        // Performance optimization: caching system
        this.elementCache = new Map();
        this.selectorCache = new Map();
        this.positionCache = new Map();
        
        // Performance optimization: rate limiting
        this.lastEventTime = 0;
        this.eventCount = 0;
        this.rateLimitWindow = 1000; // 1 second window
        
        // Progress tracking
        this.readingProgress = {
            current: 0,
            total: 0,
            percentage: 0,
            timeElapsed: 0,
            elementsRead: 0
        };
        
        // Error tracking and recovery
        this.errorCount = 0;
        this.lastError = null;
        this.recoveryAttempts = 0;
        
        // Performance metrics
        this.performanceMetrics = {
            totalSessions: 0,
            averageReadingTime: 0,
            cacheHits: 0,
            cacheMisses: 0,
            errorRate: 0,
            memoryUsage: 0
        };
        
        // Initialize cleanup interval
        this.initializeCleanupInterval();
        
        console.log('🚀 Enhanced Reading Simulator initialized with config:', this.config);
    }

    async simulateReading(options) {
        const {
            content,
            personalization,
            behavior,
            duration
        } = options;

        if (this.isReading) {
            console.log('⚠️ Reading simulation already in progress');
            return;
        }

        console.log('📖 Starting reading simulation...', {
            duration: `${duration / 1000} seconds`,
            personality: behavior.type,
            readingSpeed: behavior.readingSpeed,
            personalization: personalization
        });

        this.isReading = true;
        this.readingStartTime = Date.now();
        this.currentPosition = 0;

        try {
            // Step 1: Initial page scan with personalization
            await this.performInitialScan(behavior, personalization);

            // Step 2: Main reading process with personalization
            await this.performMainReading(content, behavior, personalization, duration);

            // Step 3: Post-reading interactions with personalization
            await this.performPostReadingInteractions(behavior, personalization);

            console.log('✅ Reading simulation completed successfully');

        } catch (error) {
            console.error('❌ Error during reading simulation:', error);
        } finally {
            this.isReading = false;
        }
    }

    async performInitialScan(behavior, personalization) {
        console.log('🔍 Performing initial page scan with personalization...', {
            personality: behavior.type,
            topics: personalization.topics,
            preferences: personalization.preferences
        });

        // Adjust scan behavior based on personality
        const scanSpeed = this.getScanSpeed(behavior.type);
        const focusAreas = personalization.preferences.focusAreas || ['title', 'main-content'];

        // Quick overview of the page
        await this.scrollToTop();
        await this.delay(800 + Math.random() * 400); // 0.8-1.2 seconds

        // Scan through the page based on personality
        const scrollSteps = this.getScrollSteps(behavior.type);
        for (let i = 0; i < scrollSteps; i++) {
            const scrollY = (window.innerHeight * i) / scrollSteps;
            await this.scrollToPosition(scrollY);
            await this.delay(scanSpeed);
        }

        // Focus on preferred areas based on personalization
        if (personalization.preferences.focusAreas) {
            await this.focusOnPreferredAreas(personalization.preferences.focusAreas);
        }

        // Return to top
        await this.scrollToTop();
        await this.delay(600 + Math.random() * 300); // 0.6-0.9 seconds
    }

    async performMainReading(content, behavior, personalization, duration) {
        console.log('📚 Performing main reading process with personalization...', {
            topics: personalization.topics,
            deviceType: personalization.deviceType,
            timeOfDay: personalization.timeOfDay
        });

        const textElements = this.findTextElements();
        const totalElements = textElements.length;
        const timePerElement = duration / totalElements;

        // Filter elements based on personalization topics
        const relevantElements = this.filterElementsByTopics(textElements, personalization.topics);
        console.log(`📊 Reading ${relevantElements.length} relevant elements out of ${totalElements} total`);

        for (let i = 0; i < relevantElements.length && this.isReading; i++) {
            const element = relevantElements[i];
            
            // Adjust reading behavior based on personalization
            const adjustedBehavior = this.adjustBehaviorForPersonalization(behavior, personalization);
            
            // Scroll to element
            await this.scrollToElement(element);
            await this.delay(400 + Math.random() * 200); // 0.4-0.6 seconds

            // Simulate reading this element with personalization
            await this.readElement(element, adjustedBehavior, timePerElement, personalization);

            // Occasional pause for thinking based on personality
            if (this.shouldPause(adjustedBehavior)) {
                await this.performThinkingPause(adjustedBehavior);
            }

            // Occasional text selection based on personality
            if (adjustedBehavior.textSelection && this.shouldSelectText(adjustedBehavior)) {
                await this.performTextSelection(element);
            }

            // Check if we should stop
            if (Date.now() - this.readingStartTime > duration) {
                break;
            }
        }
    }

    async performPostReadingInteractions(behavior, personalization) {
        console.log('🔍 Performing post-reading interactions with personalization...', {
            personality: behavior.type,
            topics: personalization.topics
        });

        // Scroll back to review important parts based on personality
        if (behavior.style === 'thorough' || behavior.style === 'researcher') {
            await this.performReviewScroll();
        }

        // Look for related content based on personalization topics
        if (behavior.type === 'explorer' || personalization.topics.length > 0) {
            await this.lookForRelatedContent(personalization.topics);
        }

        // Perform personality-specific interactions
        await this.performPersonalitySpecificInteractions(behavior, personalization);

        // Final pause before moving on (adjusted by personality)
        const finalPause = this.getFinalPauseDuration(behavior.type);
        await this.delay(finalPause);
    }

    findTextElements() {
        const selectors = [
            'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            '.post-content p', '.entry-content p',
            'article p', '.content p', 'main p'
        ];

        const elements = [];
        selectors.forEach(selector => {
            const found = document.querySelectorAll(selector);
            found.forEach(el => {
                if (el.textContent.trim().length > 20) {
                    elements.push(el);
                }
            });
        });

        return elements;
    }

    async readElement(element, behavior, timePerElement, personalization) {
        const text = element.textContent || '';
        if (!text || typeof text !== 'string') {
            console.warn('Invalid text content in element:', element);
            return;
        }
        
        // Adjust reading based on personalization
        const relevanceScore = this.calculateElementRelevance(element, personalization.topics);
        const adjustedTimePerElement = timePerElement * relevanceScore;
        
        const wordCount = text.split(/\s+/).length;
        const timePerWord = adjustedTimePerElement / wordCount;

        // Simulate eye movement across the text
        const words = text.split(/\s+/);
        const readingChunks = this.createReadingChunks(words, behavior);

        for (const chunk of readingChunks) {
            if (!this.isReading) break;

            // Simulate reading this chunk with personalization
            await this.simulateWordReading(chunk, timePerWord, behavior, personalization);
            
            // Occasional mouse movement based on personality
            if (this.shouldPerformMouseMovement(behavior)) {
                await this.performMouseMovement(element);
            }
        }
    }

    createReadingChunks(words, behavior) {
        const chunks = [];
        let currentChunk = [];

        words.forEach(word => {
            currentChunk.push(word);
            
            // Create chunks based on reading style
            const chunkSize = this.getChunkSize(behavior);
            
            if (currentChunk.length >= chunkSize) {
                chunks.push([...currentChunk]);
                currentChunk = [];
            }
        });

        // Add remaining words
        if (currentChunk.length > 0) {
            chunks.push(currentChunk);
        }

        return chunks;
    }

    getChunkSize(behavior) {
        switch (behavior.style) {
            case 'thorough': return 3; // Read 3 words at a time
            case 'skim': return 8; // Read 8 words at a time
            case 'focused': return 5; // Read 5 words at a time
            case 'curious': return 4; // Read 4 words at a time
            default: return 5;
        }
    }

    async simulateWordReading(chunk, timePerWord, behavior) {
        const totalTime = chunk.length * timePerWord;
        
        // Add some randomness to reading speed
        const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
        const adjustedTime = totalTime * randomFactor;
        
        await this.delay(adjustedTime);
    }

    async performMouseMovement(element) {
        const rect = element.getBoundingClientRect();
        const x = rect.left + Math.random() * rect.width;
        const y = rect.top + Math.random() * rect.height;

        // Simulate mouse movement
        const event = new MouseEvent('mousemove', {
            clientX: x,
            clientY: y,
            bubbles: true
        });

        element.dispatchEvent(event);
    }

    async performTextSelection(element) {
        const text = element.textContent || '';
        if (!text || typeof text !== 'string' || text.length < 10) return;

        // Select a random portion of text
        const start = Math.floor(Math.random() * (text.length - 10));
        const end = start + Math.floor(Math.random() * 20) + 10;

        try {
            const range = document.createRange();
            range.setStart(element.firstChild, start);
            range.setEnd(element.firstChild, Math.min(end, text.length));

            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);

            // Keep selection for a moment
            await this.delay(500 + Math.random() * 1000);

            // Clear selection
            selection.removeAllRanges();
        } catch (error) {
            // Ignore selection errors
        }
    }

    async performThinkingPause(behavior) {
        const pauseDuration = this.getPauseDuration(behavior);
        console.log(`🤔 Thinking pause for ${pauseDuration}ms`);
        await this.delay(pauseDuration);
    }

    getPauseDuration(behavior) {
        const baseDuration = 2000; // 2 seconds base (more realistic)
        
        switch (behavior.pauseFrequency) {
            case 'high': return baseDuration * (1.5 + Math.random() * 0.5); // 3.0-4.0 seconds
            case 'medium': return baseDuration * (1.0 + Math.random() * 0.5); // 2.0-3.0 seconds
            case 'low': return baseDuration * (0.5 + Math.random() * 0.3); // 1.0-1.6 seconds
            default: return baseDuration;
        }
    }

    shouldPause(behavior) {
        const pauseRates = {
            'high': 0.15,
            'medium': 0.08,
            'low': 0.03
        };

        return Math.random() < pauseRates[behavior.pauseFrequency];
    }

    shouldSelectText(behavior) {
        const selectionRates = {
            'explorer': 0.1,
            'researcher': 0.2,
            'casual': 0.02,
            'professional': 0.15
        };

        return Math.random() < selectionRates[behavior.type];
    }

    async scrollToElement(element) {
        const rect = element.getBoundingClientRect();
        const targetY = window.scrollY + rect.top - window.innerHeight / 3;
        
        await this.scrollToPosition(targetY);
    }

    async scrollToPosition(y) {
        window.scrollTo({
            top: y,
            behavior: 'smooth'
        });

        // Wait for scroll to complete with realistic timing
        await this.delay(500 + Math.random() * 300); // 0.5-0.8 seconds
    }

    async scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        await this.delay(600 + Math.random() * 300); // 0.6-0.9 seconds
    }

    async performReviewScroll() {
        console.log('📖 Performing review scroll...');
        
        // Scroll back to important sections
        const importantElements = document.querySelectorAll('h1, h2, h3, .highlight, .important');
        
        for (const element of importantElements) {
            await this.scrollToElement(element);
            await this.delay(1000 + Math.random() * 500); // 1.0-1.5 seconds
        }
    }

    async lookForRelatedContentLegacy() {
        console.log('🔍 Looking for related content (legacy method)...');
        
        // Look for related links
        const relatedLinks = document.querySelectorAll('a[href*="related"], a[href*="similar"], .related-posts a');
        
        for (const link of relatedLinks) {
            // Hover over link
            link.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
            await this.delay(200);
            
            // Move away
            link.dispatchEvent(new MouseEvent('mouseout', { bubbles: true }));
            await this.delay(100);
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Personalization helper functions
    getScanSpeed(personalityType) {
        const speeds = {
            'explorer': 800,    // Fast scan but more realistic
            'researcher': 1500, // Slow, thorough scan
            'casual': 1000,     // Medium scan
            'professional': 1200 // Balanced scan
        };
        return speeds[personalityType] || 1000;
    }

    getScrollSteps(personalityType) {
        const steps = {
            'explorer': 8,      // More steps for exploration
            'researcher': 10,   // Many steps for thoroughness
            'casual': 5,        // Fewer steps for casual reading
            'professional': 6   // Balanced steps
        };
        return steps[personalityType] || 5;
    }

    async focusOnPreferredAreas(focusAreas) {
        console.log('🎯 Focusing on preferred areas:', focusAreas);
        
        for (const area of focusAreas) {
            const selector = this.getSelectorForArea(area);
            const element = document.querySelector(selector);
            
            if (element) {
                await this.scrollToElement(element);
                await this.delay(800 + Math.random() * 400); // 0.8-1.2 seconds
            }
        }
    }

    getSelectorForArea(area) {
        const selectors = {
            'title': 'h1, .title, .post-title, .entry-title',
            'introduction': '.intro, .introduction, .lead, p:first-of-type',
            'main-content': '.content, .post-content, .entry-content, main',
            'conclusion': '.conclusion, .summary, .ending',
            'images': 'img, .image, .figure'
        };
        return selectors[area] || 'p';
    }

    filterElementsByTopics(elements, topics) {
        if (!topics || topics.length === 0) {
            return elements; // Return all elements if no topics specified
        }

        return elements.filter(element => {
            const elementText = element.textContent.toLowerCase();
            return topics.some(topic => 
                elementText.includes(topic.topic.toLowerCase()) ||
                topic.keywords.some(keyword => elementText.includes(keyword.toLowerCase()))
            );
        });
    }

    adjustBehaviorForPersonalization(behavior, personalization) {
        const adjusted = { ...behavior };
        
        // Adjust based on device type
        if (personalization.deviceType === 'mobile') {
            adjusted.readingSpeed *= 0.8; // Slower on mobile
        }
        
        // Adjust based on time of day
        if (personalization.timeOfDay === 'night') {
            adjusted.readingSpeed *= 0.9; // Slower at night
        }
        
        return adjusted;
    }

    calculateElementRelevance(element, topics) {
        if (!topics || topics.length === 0) {
            return 1.0; // Default relevance
        }

        const elementText = element.textContent.toLowerCase();
        let maxRelevance = 0;

        topics.forEach(topic => {
            const topicRelevance = topic.relevance || 0.5;
            const keywordMatches = topic.keywords.filter(keyword => 
                elementText.includes(keyword.toLowerCase())
            ).length;
            
            const relevance = (keywordMatches / topic.keywords.length) * topicRelevance;
            maxRelevance = Math.max(maxRelevance, relevance);
        });

        return Math.max(0.5, Math.min(2.0, maxRelevance + 0.5)); // Between 0.5 and 2.0
    }

    async simulateWordReading(chunk, timePerWord, behavior, personalization) {
        const totalTime = chunk.length * timePerWord;
        
        // Add some randomness to reading speed based on personality
        const randomFactor = this.getRandomFactorForPersonality(behavior.type);
        const adjustedTime = totalTime * randomFactor;
        
        await this.delay(adjustedTime);
    }

    getRandomFactorForPersonality(personalityType) {
        const factors = {
            'explorer': 1.2 + Math.random() * 0.8,    // 1.2-2.0 (variable but realistic)
            'researcher': 1.8 + Math.random() * 0.6,  // 1.8-2.4 (slower, thorough)
            'casual': 1.0 + Math.random() * 0.5,      // 1.0-1.5 (faster but realistic)
            'professional': 1.4 + Math.random() * 0.4 // 1.4-1.8 (consistent, focused)
        };
        return factors[personalityType] || 1.4;
    }

    shouldPerformMouseMovement(behavior) {
        const movementRates = {
            'explorer': 0.15,     // More mouse movement
            'researcher': 0.08,   // Less mouse movement
            'casual': 0.12,       // Moderate mouse movement
            'professional': 0.10  // Balanced mouse movement
        };
        return Math.random() < (movementRates[behavior.type] || 0.1);
    }

    async lookForRelatedContent(topics) {
        console.log('🔍 Looking for related content based on topics:', topics);
        
        if (!topics || topics.length === 0) {
            return;
        }

        // Look for links that might be related to topics
        const links = document.querySelectorAll('a[href]');
        const relatedLinks = Array.from(links).filter(link => {
            const linkText = link.textContent.toLowerCase();
            return topics.some(topic => 
                linkText.includes(topic.topic.toLowerCase()) ||
                topic.keywords.some(keyword => linkText.includes(keyword.toLowerCase()))
            );
        });

        if (relatedLinks.length > 0) {
            console.log(`🔗 Found ${relatedLinks.length} related links`);
            // Hover over a few related links with realistic timing
            const linksToHover = relatedLinks.slice(0, Math.min(3, relatedLinks.length));
            for (const link of linksToHover) {
                await this.performMouseMovement(link);
                await this.delay(600 + Math.random() * 400); // 0.6-1.0 seconds
            }
        }
    }

    async performPersonalitySpecificInteractions(behavior, personalization) {
        console.log('🎭 Performing personality-specific interactions for:', behavior.type);
        
        switch (behavior.type) {
            case 'explorer':
                await this.performExplorerInteractions();
                break;
            case 'researcher':
                await this.performResearcherInteractions();
                break;
            case 'casual':
                await this.performCasualInteractions();
                break;
            case 'professional':
                await this.performProfessionalInteractions();
                break;
        }
    }

    async performExplorerInteractions() {
        // Explorer: Look for more content, scroll around
        await this.scrollToPosition(window.innerHeight * 0.8);
        await this.delay(1200 + Math.random() * 800); // 1.2-2.0 seconds
        await this.scrollToPosition(window.innerHeight * 0.2);
        await this.delay(800 + Math.random() * 600); // 0.8-1.4 seconds
    }

    async performResearcherInteractions() {
        // Researcher: Go back to important sections, take notes
        await this.scrollToTop();
        await this.delay(1000 + Math.random() * 500); // 1.0-1.5 seconds
        // Simulate taking notes by selecting some text
        const paragraphs = document.querySelectorAll('p');
        if (paragraphs.length > 0) {
            await this.performTextSelection(paragraphs[0]);
            await this.delay(800 + Math.random() * 400); // 0.8-1.2 seconds for note-taking
        }
    }

    async performCasualInteractions() {
        // Casual: Quick scroll to bottom, minimal interaction
        await this.scrollToPosition(window.innerHeight * 0.9);
        await this.delay(600 + Math.random() * 400); // 0.6-1.0 seconds
    }

    async performProfessionalInteractions() {
        // Professional: Systematic review, focused behavior
        await this.scrollToPosition(window.innerHeight * 0.5);
        await this.delay(800 + Math.random() * 400); // 0.8-1.2 seconds
        await this.scrollToTop();
        await this.delay(600 + Math.random() * 300); // 0.6-0.9 seconds
    }

    getFinalPauseDuration(personalityType) {
        const pauses = {
            'explorer': 1500 + Math.random() * 1500,    // 1.5-3.0 seconds
            'researcher': 2500 + Math.random() * 2500, // 2.5-5.0 seconds
            'casual': 1000 + Math.random() * 1000,      // 1.0-2.0 seconds
            'professional': 1800 + Math.random() * 1800 // 1.8-3.6 seconds
        };
        return pauses[personalityType] || 1500;
    }

    stopReading() {
        this.isReading = false;
        console.log('⏹️ Reading simulation stopped');
    }

    getReadingProgress() {
        if (!this.readingStartTime) return 0;
        
        const elapsed = Date.now() - this.readingStartTime;
        return Math.min(100, (elapsed / this.totalDuration) * 100);
    }

    // Enhanced memory management
    initializeCleanupInterval() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        
        this.cleanupInterval = setInterval(() => {
            this.cleanupMemory();
        }, this.config.cleanupInterval);
    }

    cleanupMemory() {
        const now = Date.now();
        const cutoffTime = now - (this.config.cleanupInterval * 2);

        // Cleanup old scroll positions
        if (this.scrollPositions.length > this.config.maxScrollPositions) {
            this.scrollPositions = this.scrollPositions.slice(-this.config.maxScrollPositions);
        }

        // Cleanup old mouse positions
        if (this.mousePositions.length > this.config.maxMousePositions) {
            this.mousePositions = this.mousePositions.slice(-this.config.maxMousePositions);
        }

        // Cleanup old text selections
        if (this.textSelections.length > this.config.maxTextSelections) {
            this.textSelections = this.textSelections.slice(-this.config.maxTextSelections);
        }

        // Cleanup expired cache entries
        this.cleanupCache();

        // Update memory usage metrics
        this.updateMemoryUsage();

        this.lastCleanup = now;
        console.log('🧹 Memory cleanup completed');
    }

    cleanupCache() {
        const now = Date.now();
        
        // Cleanup element cache
        for (const [key, value] of this.elementCache.entries()) {
            if (now - value.timestamp > this.config.cacheTimeout) {
                this.elementCache.delete(key);
            }
        }

        // Cleanup selector cache
        for (const [key, value] of this.selectorCache.entries()) {
            if (now - value.timestamp > this.config.cacheTimeout) {
                this.selectorCache.delete(key);
            }
        }

        // Cleanup position cache
        for (const [key, value] of this.positionCache.entries()) {
            if (now - value.timestamp > this.config.cacheTimeout) {
                this.positionCache.delete(key);
            }
        }

        // Limit cache size
        if (this.elementCache.size > this.config.maxCacheSize) {
            const entries = Array.from(this.elementCache.entries());
            entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
            const toDelete = entries.slice(0, entries.length - this.config.maxCacheSize);
            toDelete.forEach(([key]) => this.elementCache.delete(key));
        }
    }

    updateMemoryUsage() {
        this.performanceMetrics.memoryUsage = 
            this.scrollPositions.length + 
            this.mousePositions.length + 
            this.textSelections.length +
            this.elementCache.size +
            this.selectorCache.size +
            this.positionCache.size;
    }

    // Enhanced performance optimization
    getCachedElement(selector) {
        if (!this.config.enableCaching) {
            return document.querySelector(selector);
        }

        const cached = this.elementCache.get(selector);
        if (cached && Date.now() - cached.timestamp < this.config.cacheTimeout) {
            this.performanceMetrics.cacheHits++;
            return cached.element;
        }

        this.performanceMetrics.cacheMisses++;
        const element = document.querySelector(selector);
        if (element) {
            this.elementCache.set(selector, {
                element: element,
                timestamp: Date.now()
            });
        }
        return element;
    }

    getCachedElements(selector) {
        if (!this.config.enableCaching) {
            return document.querySelectorAll(selector);
        }

        const cached = this.selectorCache.get(selector);
        if (cached && Date.now() - cached.timestamp < this.config.cacheTimeout) {
            this.performanceMetrics.cacheHits++;
            return cached.elements;
        }

        this.performanceMetrics.cacheMisses++;
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
            this.selectorCache.set(selector, {
                elements: elements,
                timestamp: Date.now()
            });
        }
        return elements;
    }

    // Enhanced rate limiting
    checkRateLimit() {
        if (!this.config.enableRateLimiting) {
            return true;
        }

        const now = Date.now();
        if (now - this.lastEventTime < this.config.minEventDelay) {
            return false;
        }

        if (now - this.lastEventTime > this.rateLimitWindow) {
            this.eventCount = 0;
        }

        if (this.eventCount >= 10) { // Max 10 events per second
            return false;
        }

        this.lastEventTime = now;
        this.eventCount++;
        return true;
    }

    // Enhanced error handling and recovery
    async performActionWithRetry(action, fallback, maxRetries = null) {
        const retries = maxRetries || this.config.maxRetries;
        
        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                return await action();
            } catch (error) {
                this.errorCount++;
                this.lastError = error;
                
                console.warn(`⚠️ Action failed (attempt ${attempt + 1}/${retries}):`, error);
                
                if (attempt === retries - 1) {
                    console.warn('⚠️ All retry attempts failed, using fallback');
                    if (fallback) {
                        return await fallback();
                    }
                    throw error;
                }
                
                // Wait before retry
                await this.delay(this.config.retryDelay * (attempt + 1));
            }
        }
    }

    // Enhanced progress tracking
    updateReadingProgress(current, total, elementsRead = 0) {
        if (!this.config.enableProgressTracking) return;

        this.readingProgress = {
            current: current,
            total: total,
            percentage: total > 0 ? Math.round((current / total) * 100) : 0,
            timeElapsed: this.readingStartTime ? Date.now() - this.readingStartTime : 0,
            elementsRead: elementsRead
        };

        // Emit progress event if supported
        if (typeof this.onProgress === 'function') {
            this.onProgress(this.readingProgress);
        }

        console.log(`📊 Reading progress: ${this.readingProgress.percentage}% (${current}/${total})`);
    }

    // Enhanced performance monitoring
    getPerformanceMetrics() {
        const totalRequests = this.performanceMetrics.cacheHits + this.performanceMetrics.cacheMisses;
        const cacheHitRate = totalRequests > 0 ? this.performanceMetrics.cacheHits / totalRequests : 0;
        const errorRate = this.performanceMetrics.totalSessions > 0 ? this.errorCount / this.performanceMetrics.totalSessions : 0;

        return {
            ...this.performanceMetrics,
            cacheHitRate: cacheHitRate,
            errorRate: errorRate,
            memoryUsage: this.performanceMetrics.memoryUsage,
            lastCleanup: this.lastCleanup
        };
    }

    // Enhanced session management
    startSession() {
        this.performanceMetrics.totalSessions++;
        this.readingStartTime = Date.now();
        this.errorCount = 0;
        this.lastError = null;
        this.recoveryAttempts = 0;
        
        console.log('🚀 Reading session started');
    }

    endSession() {
        if (this.readingStartTime) {
            const sessionDuration = Date.now() - this.readingStartTime;
            this.performanceMetrics.averageReadingTime = 
                (this.performanceMetrics.averageReadingTime * (this.performanceMetrics.totalSessions - 1) + sessionDuration) / 
                this.performanceMetrics.totalSessions;
        }
        
        // Cleanup memory
        this.cleanupMemory();
        
        console.log('🏁 Reading session ended');
    }

    // Enhanced cleanup and disposal
    dispose() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
        
        // Clear all caches
        this.elementCache.clear();
        this.selectorCache.clear();
        this.positionCache.clear();
        
        // Clear arrays
        this.scrollPositions.length = 0;
        this.mousePositions.length = 0;
        this.textSelections.length = 0;
        
        console.log('🧹 Reading Simulator disposed and cleaned up');
    }
}
