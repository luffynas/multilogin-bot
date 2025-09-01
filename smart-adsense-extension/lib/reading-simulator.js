/**
 * Reading Simulator - Simulasi behavior membaca yang realistis
 */

class ReadingSimulator {
    constructor() {
        this.isReading = false;
        this.currentPosition = 0;
        this.readingStartTime = null;
        this.scrollPositions = [];
        this.mousePositions = [];
        this.textSelections = [];
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
            timeOfDay: personalization.timeOfDay,
            deviceType: personalization.deviceType,
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
        
        // Device-specific element scrolling
        if (this.isMobileDevice()) {
            await this.performSmoothMobileElementScroll(element, targetY);
        } else {
            await this.scrollToPosition(targetY);
        }
    }

    // Smooth mobile element scrolling with focus animation
    async performSmoothMobileElementScroll(element, targetY) {
        const currentY = window.scrollY;
        const distance = targetY - currentY;
        
        console.log('📱 Performing smooth mobile element scroll:', {
            element: element.tagName,
            from: currentY,
            to: targetY,
            distance: distance
        });

        // Use different strategies based on element type and distance
        if (element.tagName === 'H1' || element.tagName === 'H2') {
            // Headings: use instant scroll for better UX
            await this.performInstantMobileScroll(targetY);
        } else if (Math.abs(distance) < 300) {
            // Short distance: use smooth scroll
            await this.performSmoothMobileNavigation(targetY);
        } else {
            // Long distance: use accelerated scroll
            await this.performAcceleratedMobileScroll(targetY);
        }

        // Add focus highlight effect for mobile
        await this.addMobileElementFocus(element);
    }

    // Add mobile element focus effect
    async addMobileElementFocus(element) {
        // Add temporary highlight class
        element.classList.add('mobile-focus-highlight');
        
        // Remove highlight after animation
        setTimeout(() => {
            element.classList.remove('mobile-focus-highlight');
        }, 1000);
    }

    async scrollToPosition(y) {
        // Device-specific scrolling behavior
        if (this.isMobileDevice()) {
            // Mobile: use smart navigation strategy for optimal smoothness
            await this.performSmoothMobileNavigation(y);
        } else {
            // Desktop: use smooth scrolling
            window.scrollTo({
                top: y,
                behavior: 'smooth'
            });
        }

        // Minimal delays for smoother navigation
        const scrollDelay = this.isMobileDevice() ? 100 + Math.random() * 100 : 200 + Math.random() * 100;
        await this.delay(scrollDelay);
    }

    async scrollToTop() {
        // Device-specific scrolling behavior
        if (this.isMobileDevice()) {
            // Mobile: use smart navigation strategy for optimal smoothness
            await this.performSmoothMobileNavigation(0);
        } else {
            // Desktop: use smooth scrolling
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
        
        // Minimal delays for smoother navigation
        const scrollDelay = this.isMobileDevice() ? 100 + Math.random() * 100 : 200 + Math.random() * 100;
        await this.delay(scrollDelay);
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
        
        // Adjust based on time of day for more realistic reading behavior
        switch (personalization.timeOfDay) {
            case 'morning':
                // Morning: More alert, faster reading
                adjusted.readingSpeed *= 0.7;
                console.log('🌅 Morning reading: Slightly faster (110%)');
                break;
            case 'afternoon':
                // Afternoon: Peak alertness, fastest reading
                adjusted.readingSpeed *= 0.7;
                console.log('☀️ Afternoon reading: Fastest (120%)');
                break;
            case 'evening':
                // Evening: Starting to slow down, more relaxed
                adjusted.readingSpeed *= 0.85; // Slower in evening
                console.log('🌆 Evening reading: Slower and more relaxed (85%)');
                break;
            case 'night':
                // Night: Tired, slowest reading
                adjusted.readingSpeed *= 0.7; // Much slower at night
                console.log('🌙 Night reading: Slowest (70%)');
                break;
            default:
                console.log('⏰ Default reading speed (100%)');
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
        
        // Add some randomness to reading speed based on personality and time of day
        const randomFactor = this.getRandomFactorForPersonality(behavior.type, personalization.timeOfDay);
        const adjustedTime = totalTime * randomFactor;
        
        await this.delay(adjustedTime);
    }

    getRandomFactorForPersonality(personalityType, timeOfDay = 'afternoon') {
        // Base factors for personality types
        const baseFactors = {
            'explorer': 1.2 + Math.random() * 0.8,    // 1.2-2.0 (variable but realistic)
            'researcher': 1.8 + Math.random() * 0.6,  // 1.8-2.4 (slower, thorough)
            'casual': 1.0 + Math.random() * 0.5,      // 1.0-1.5 (faster but realistic)
            'professional': 1.4 + Math.random() * 0.4 // 1.4-1.8 (consistent, focused)
        };
        
        let factor = baseFactors[personalityType] || 1.4;
        
        // Adjust factor based on time of day for more realistic behavior
        switch (timeOfDay) {
            case 'morning':
                factor *= 0.9; // Slightly faster in morning (more alert)
                break;
            case 'afternoon':
                factor *= 0.85; // Fastest in afternoon (peak alertness)
                break;
            case 'evening':
                factor *= 1.3; // Slower in evening (more relaxed)
                break;
            case 'night':
                factor *= 1.6; // Slowest at night (tired)
                break;
        }
        
        return factor;
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

    // Device detection helper
    isMobileDevice() {
        return window.innerWidth < 768 || 
               'ontouchstart' in window || 
               navigator.maxTouchPoints > 0;
    }

    // Mobile-specific scrolling simulation with smooth easing
    async performMobileScroll(targetY) {
        const currentY = window.scrollY;
        const distance = targetY - currentY;
        
        // Use smaller steps for smoother scrolling (20px per step)
        const steps = Math.max(10, Math.abs(Math.ceil(distance / 20)));
        
        console.log('📱 Performing smooth mobile scroll simulation:', {
            from: currentY,
            to: targetY,
            distance: distance,
            steps: steps
        });

        // Use requestAnimationFrame for smooth scrolling
        return new Promise((resolve) => {
            let currentStep = 0;
            
            const animateScroll = () => {
                if (currentStep <= steps) {
                    // Use easing function for smooth acceleration/deceleration
                    const progress = this.easeInOutCubic(currentStep / steps);
                    const currentScrollY = currentY + (distance * progress);
                    
                    // Smooth scroll to position
                    window.scrollTo({
                        top: currentScrollY,
                        behavior: 'auto' // Use 'auto' for better mobile performance
                    });
                    
                    currentStep++;
                    
                    // Use requestAnimationFrame for smooth 60fps animation
                    requestAnimationFrame(animateScroll);
                } else {
                    // Final scroll to exact position
                    window.scrollTo({
                        top: targetY,
                        behavior: 'auto'
                    });
                    resolve();
                }
            };
            
            // Start animation
            requestAnimationFrame(animateScroll);
        });
    }

    // Easing function for smooth acceleration/deceleration
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    // Enhanced mobile scroll with momentum simulation
    async performMobileScrollWithMomentum(targetY) {
        const currentY = window.scrollY;
        const distance = targetY - currentY;
        
        // Calculate momentum-based scrolling
        const momentum = Math.abs(distance) > 500 ? 1.2 : 1.0; // Faster for longer distances
        const duration = Math.min(800, Math.abs(distance) * 0.8); // Dynamic duration based on distance
        
        console.log('📱 Performing momentum-based mobile scroll:', {
            from: currentY,
            to: targetY,
            distance: distance,
            momentum: momentum,
            duration: duration
        });

        return new Promise((resolve) => {
            const startTime = performance.now();
            
            const animateMomentum = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Use easeOutQuart for natural deceleration
                const easedProgress = this.easeOutQuart(progress);
                const currentScrollY = currentY + (distance * easedProgress);
                
                window.scrollTo({
                    top: currentScrollY,
                    behavior: 'auto'
                });
                
                if (progress < 1) {
                    requestAnimationFrame(animateMomentum);
                } else {
                    // Final position
                    window.scrollTo({
                        top: targetY,
                        behavior: 'auto'
                    });
                    resolve();
                }
            };
            
            requestAnimationFrame(animateMomentum);
        });
    }

    // Easing function for natural deceleration
    easeOutQuart(t) {
        return 1 - Math.pow(1 - t, 4);
    }

    // Smooth mobile navigation with touch gesture simulation
    async performSmoothMobileNavigation(targetY) {
        const currentY = window.scrollY;
        const distance = targetY - currentY;
        
        // Use different scrolling strategies based on distance
        if (Math.abs(distance) < 200) {
            // Short distance: use instant smooth scroll
            return this.performInstantMobileScroll(targetY);
        } else if (Math.abs(distance) < 800) {
            // Medium distance: use momentum scroll
            return this.performMobileScrollWithMomentum(targetY);
        } else {
            // Long distance: use accelerated scroll
            return this.performAcceleratedMobileScroll(targetY);
        }
    }

    // Instant smooth scroll for short distances
    async performInstantMobileScroll(targetY) {
        console.log('📱 Performing instant mobile scroll for short distance');
        
        return new Promise((resolve) => {
            window.scrollTo({
                top: targetY,
                behavior: 'smooth'
            });
            
            // Short delay for instant scroll
            setTimeout(resolve, 100);
        });
    }

    // Accelerated scroll for long distances
    async performAcceleratedMobileScroll(targetY) {
        const currentY = window.scrollY;
        const distance = targetY - currentY;
        const duration = Math.min(600, Math.abs(distance) * 0.6); // Faster for long distances
        
        console.log('📱 Performing accelerated mobile scroll for long distance:', {
            from: currentY,
            to: targetY,
            distance: distance,
            duration: duration
        });

        return new Promise((resolve) => {
            const startTime = performance.now();
            
            const animateAccelerated = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Use easeInOutQuart for smooth acceleration and deceleration
                const easedProgress = this.easeInOutQuart(progress);
                const currentScrollY = currentY + (distance * easedProgress);
                
                window.scrollTo({
                    top: currentScrollY,
                    behavior: 'auto'
                });
                
                if (progress < 1) {
                    requestAnimationFrame(animateAccelerated);
                } else {
                    window.scrollTo({
                        top: targetY,
                        behavior: 'auto'
                    });
                    resolve();
                }
            };
            
            requestAnimationFrame(animateAccelerated);
        });
    }

    // Enhanced easing function for smooth acceleration/deceleration
    easeInOutQuart(t) {
        return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
    }

    // Mobile performance monitoring
    monitorMobilePerformance() {
        if (!this.isMobileDevice()) return;

        try {
            // Monitor scroll performance
            let lastScrollTime = performance.now();
            let scrollCount = 0;
            let isMonitoring = true;
            
            const scrollHandler = () => {
                try {
                    if (!isMonitoring) return;
                    
                    const currentTime = performance.now();
                    const timeDiff = currentTime - lastScrollTime;
                    
                    if (timeDiff < 16) { // Less than 60fps
                        scrollCount++;
                        
                        // Safe logging with error handling
                        try {
                            console.warn('📱 Mobile scroll performance issue detected:', {
                                timeDiff: timeDiff.toFixed(2),
                                scrollCount: scrollCount,
                                timestamp: new Date().toISOString()
                            });
                        } catch (logError) {
                            console.warn('📱 Mobile scroll performance issue detected:', 
                                `timeDiff: ${timeDiff.toFixed(2)}, scrollCount: ${scrollCount}`);
                        }
                        
                        // Enable performance mode if issues persist
                        if (scrollCount > 5) {
                            this.enableMobilePerformanceMode();
                        }
                    } else {
                        scrollCount = Math.max(0, scrollCount - 1);
                    }
                    
                    lastScrollTime = currentTime;
                } catch (error) {
                    console.error('📱 Error in scroll performance monitoring:', error);
                    // Disable monitoring on error
                    isMonitoring = false;
                }
            };

            // Throttle scroll events for performance
            let ticking = false;
            const throttledScrollHandler = () => {
                try {
                    if (!ticking && isMonitoring) {
                        requestAnimationFrame(() => {
                            try {
                                scrollHandler();
                            } catch (error) {
                                console.error('📱 Error in throttled scroll handler:', error);
                            }
                            ticking = false;
                        });
                        ticking = true;
                    }
                } catch (error) {
                    console.error('📱 Error in throttled scroll handler setup:', error);
                }
            };

            // Add scroll event listener with error handling
            try {
                window.addEventListener('scroll', throttledScrollHandler, { passive: true });
                console.log('📱 Mobile performance monitoring enabled successfully');
            } catch (error) {
                console.error('📱 Failed to add scroll event listener:', error);
            }
            
            // Cleanup function
            this.cleanupMobilePerformanceMonitoring = () => {
                try {
                    isMonitoring = false;
                    window.removeEventListener('scroll', throttledScrollHandler);
                    console.log('📱 Mobile performance monitoring cleaned up');
                } catch (error) {
                    console.error('📱 Error cleaning up mobile performance monitoring:', error);
                }
            };
            
        } catch (error) {
            console.error('📱 Error setting up mobile performance monitoring:', error);
        }
    }

    // Enable mobile performance mode
    enableMobilePerformanceMode() {
        if (!this.isMobileDevice()) return;
        
        try {
            // Check if document.body exists
            if (!document.body) {
                console.warn('📱 Document body not available for performance mode');
                return;
            }
            
            document.body.classList.add('mobile-performance-mode');
            console.log('📱 Mobile performance mode enabled for better scrolling');
            
            // Disable performance mode after 10 seconds
            setTimeout(() => {
                try {
                    if (document.body && document.body.classList.contains('mobile-performance-mode')) {
                        document.body.classList.remove('mobile-performance-mode');
                        console.log('📱 Mobile performance mode disabled');
                    }
                } catch (error) {
                    console.error('📱 Error disabling mobile performance mode:', error);
                }
            }, 10000);
            
        } catch (error) {
            console.error('📱 Error enabling mobile performance mode:', error);
        }
    }

    // Mobile touch gesture detection
    detectMobileTouchGestures() {
        if (!this.isMobileDevice()) return;

        try {
            let startY = 0;
            let startTime = 0;
            let isGestureDetectionActive = true;
            
            const touchStart = (e) => {
                try {
                    if (!isGestureDetectionActive) return;
                    
                    if (e.touches && e.touches.length > 0) {
                        startY = e.touches[0].clientY;
                        startTime = Date.now();
                    }
                } catch (error) {
                    console.error('📱 Error in touch start handler:', error);
                }
            };
            
            const touchEnd = (e) => {
                try {
                    if (!isGestureDetectionActive) return;
                    
                    if (e.changedTouches && e.changedTouches.length > 0) {
                        const endY = e.changedTouches[0].clientY;
                        const endTime = Date.now();
                        const distance = Math.abs(endY - startY);
                        const duration = endTime - startTime;
                        
                        if (distance > 50 && duration < 300) {
                            // Swipe gesture detected
                            const direction = endY > startY ? 'down' : 'up';
                            
                            // Safe logging with error handling
                            try {
                                console.log('📱 Mobile swipe gesture detected:', {
                                    direction: direction,
                                    distance: distance,
                                    duration: duration,
                                    timestamp: new Date().toISOString()
                                });
                            } catch (logError) {
                                console.log('📱 Mobile swipe gesture detected:', 
                                    `direction: ${direction}, distance: ${distance}, duration: ${duration}`);
                            }
                            
                            // Handle swipe gesture
                            this.handleMobileSwipe(direction, distance, duration);
                        }
                    }
                } catch (error) {
                    console.error('📱 Error in touch end handler:', error);
                }
            };
            
            // Add touch event listeners with error handling
            try {
                document.addEventListener('touchstart', touchStart, { passive: true });
                document.addEventListener('touchend', touchEnd, { passive: true });
                console.log('📱 Mobile touch gesture detection enabled successfully');
            } catch (error) {
                console.error('📱 Failed to add touch event listeners:', error);
            }
            
            // Cleanup function
            this.cleanupMobileTouchGestures = () => {
                try {
                    isGestureDetectionActive = false;
                    document.removeEventListener('touchstart', touchStart);
                    document.removeEventListener('touchend', touchEnd);
                    console.log('📱 Mobile touch gesture detection cleaned up');
                } catch (error) {
                    console.error('📱 Error cleaning up mobile touch gestures:', error);
                }
            };
            
        } catch (error) {
            console.error('📱 Error setting up mobile touch gesture detection:', error);
        }
    }

    // Handle mobile swipe gestures
    handleMobileSwipe(direction, distance, duration) {
        const currentY = window.scrollY;
        let targetY = currentY;
        
        if (direction === 'down') {
            // Swipe down: scroll up
            targetY = Math.max(0, currentY - distance);
        } else {
            // Swipe up: scroll down
            targetY = currentY + distance;
        }
        
        // Perform smooth scroll based on gesture
        this.performSmoothMobileNavigation(targetY);
    }
}
