/**
 * Behavior Simulator - Simulates human-like browsing behavior
 * Implements mouse movement, scrolling, reading, and navigation patterns
 */

class BehaviorSimulator {
    constructor(personalityEngine) {
        this.personalityEngine = personalityEngine;
        this.currentPersonality = null;
        this.mousePosition = { x: 0, y: 0 };
        this.scrollPosition = 0;
        this.isSimulating = false;
        
        this.behaviorConfig = {
            mouseMovement: {
                enabled: true,
                naturalCurves: true,
                acceleration: true,
                hoverEffects: true
            },
            scrolling: {
                enabled: true,
                variableSpeed: true,
                pauseAtContent: true,
                smoothScrolling: true
            },
            reading: {
                enabled: true,
                variableSpeed: true,
                textSelection: true,
                comprehension: true
            },
            navigation: {
                enabled: true,
                intelligentLinks: true,
                backForward: true,
                tabSwitching: true
            }
        };
    }

    /**
     * Initialize behavior simulator with personality
     */
    async initialize() {
        this.currentPersonality = await this.personalityEngine.loadPersonality();
        if (!this.currentPersonality) {
            this.currentPersonality = this.personalityEngine.generateUserPersonality();
        }
        
        this.updateBehaviorConfig();
        return this.currentPersonality;
    }

    /**
     * Update behavior configuration based on personality
     */
    updateBehaviorConfig() {
        if (!this.currentPersonality) return;

        const personality = this.currentPersonality;
        const patterns = this.personalityEngine.getBehaviorPatterns();

        // Adjust mouse movement based on personality
        this.behaviorConfig.mouseMovement.speed = patterns.mouseMovement.speed;
        this.behaviorConfig.mouseMovement.precision = patterns.mouseMovement.precision;

        // Adjust scrolling based on personality
        this.behaviorConfig.scrolling.speed = patterns.scrolling.speed;
        this.behaviorConfig.scrolling.pauseFrequency = patterns.scrolling.pauseFrequency;

        // Adjust reading based on personality
        this.behaviorConfig.reading.speed = patterns.reading.speed;
        this.behaviorConfig.reading.comprehension = patterns.reading.comprehension;
    }

    /**
     * Simulate natural mouse movement
     */
    async simulateMouseMovement(targetX, targetY, duration = 1000) {
        if (!this.behaviorConfig.mouseMovement.enabled) {
            this.mousePosition = { x: targetX, y: targetY };
            return;
        }

        const startX = this.mousePosition.x;
        const startY = this.mousePosition.y;
        const steps = Math.floor(duration / 16); // 60fps
        const personality = this.currentPersonality;

        // Generate natural curve path
        const path = this.generateNaturalCurve(startX, startY, targetX, targetY, steps);
        
        for (let i = 0; i < path.length; i++) {
            const point = path[i];
            
            // Create mouse move event
            const moveEvent = new MouseEvent('mousemove', {
                view: window,
                bubbles: true,
                cancelable: true,
                clientX: point.x,
                clientY: point.y
            });

            document.dispatchEvent(moveEvent);
            this.mousePosition = { x: point.x, y: point.y };

            // Variable delay based on personality
            const delay = this.getMouseMovementDelay(personality);
            await this.delay(delay);
        }
    }

    /**
     * Generate natural curve path for mouse movement
     */
    generateNaturalCurve(startX, startY, endX, endY, steps) {
        const path = [];
        const personality = this.currentPersonality;
        
        // Add some randomness to the path
        const midX = (startX + endX) / 2 + (Math.random() - 0.5) * 50;
        const midY = (startY + endY) / 2 + (Math.random() - 0.5) * 50;

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            
            // Quadratic Bezier curve for natural movement
            const x = Math.pow(1 - t, 2) * startX + 2 * (1 - t) * t * midX + Math.pow(t, 2) * endX;
            const y = Math.pow(1 - t, 2) * startY + 2 * (1 - t) * t * midY + Math.pow(t, 2) * endY;

            // Add slight jitter for realism
            const jitterX = (Math.random() - 0.5) * 2;
            const jitterY = (Math.random() - 0.5) * 2;

            path.push({
                x: Math.round(x + jitterX),
                y: Math.round(y + jitterY)
            });
        }

        return path;
    }

    /**
     * Get mouse movement delay based on personality
     */
    getMouseMovementDelay(personality) {
        const baseDelay = 16; // 60fps
        
        switch (personality.type) {
            case 'casual':
                return baseDelay * 0.7; // Faster movement
            case 'researcher':
                return baseDelay * 1.5; // Slower, more deliberate
            case 'professional':
                return baseDelay * 1.2; // Moderate speed
            case 'explorer':
                return baseDelay * 0.9; // Slightly faster
            default:
                return baseDelay;
        }
    }

    /**
     * Simulate natural scrolling
     */
    async simulateNaturalScrolling(targetScrollY, duration = 2000) {
        if (!this.behaviorConfig.scrolling.enabled) {
            window.scrollTo(0, targetScrollY);
            return;
        }

        const startScrollY = window.pageYOffset;
        const scrollDistance = targetScrollY - startScrollY;
        const steps = Math.floor(duration / 16);
        const personality = this.currentPersonality;

        for (let i = 0; i <= steps; i++) {
            const progress = i / steps;
            
            // Easing function for natural scrolling
            const easeProgress = this.easeInOutQuad(progress);
            const currentScrollY = startScrollY + (scrollDistance * easeProgress);

            window.scrollTo(0, currentScrollY);
            this.scrollPosition = currentScrollY;

            // Check for content to pause at
            if (this.shouldPauseAtContent(personality)) {
                await this.simulateContentPause();
            }

            const delay = this.getScrollingDelay(personality);
            await this.delay(delay);
        }
    }

    /**
     * Easing function for smooth scrolling
     */
    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }

    /**
     * Get scrolling delay based on personality
     */
    getScrollingDelay(personality) {
        const baseDelay = 16;
        
        switch (personality.scrollBehavior) {
            case 'quick':
                return baseDelay * 0.5;
            case 'analytical':
                return baseDelay * 2.0;
            case 'methodical':
                return baseDelay * 1.5;
            case 'continuous':
                return baseDelay * 0.8;
            default:
                return baseDelay;
        }
    }

    /**
     * Check if should pause at content
     */
    shouldPauseAtContent(personality) {
        if (!this.behaviorConfig.scrolling.pauseAtContent) return false;

        const pauseProbability = personality.attentionSpan === 'long' ? 0.3 : 0.1;
        return Math.random() < pauseProbability;
    }

    /**
     * Simulate pause at content
     */
    async simulateContentPause() {
        const pauseTime = 500 + Math.random() * 1500;
        await this.delay(pauseTime);
    }

    /**
     * Simulate natural click
     */
    async simulateNaturalClick(element, x, y) {
        if (!element) return false;

        const rect = element.getBoundingClientRect();
        const clickX = x || rect.left + rect.width / 2;
        const clickY = y || rect.top + rect.height / 2;

        // Move mouse to element first
        await this.simulateMouseMovement(clickX, clickY, 800);

        // Simulate hover
        if (this.behaviorConfig.mouseMovement.hoverEffects) {
            await this.simulateHover(element);
        }

        // Click delay based on personality
        const clickDelay = this.getClickDelay();
        await this.delay(clickDelay);

        // Perform click
        const clickEvent = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true,
            clientX: clickX,
            clientY: clickY
        });

        element.dispatchEvent(clickEvent);
        return true;
    }

    /**
     * Simulate hover effect
     */
    async simulateHover(element) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Mouse enter
        const mouseEnterEvent = new MouseEvent('mouseenter', {
            view: window,
            bubbles: true,
            cancelable: true,
            clientX: centerX,
            clientY: centerY
        });

        element.dispatchEvent(mouseEnterEvent);

        // Hover time based on personality
        const hoverTime = this.getHoverTime();
        await this.delay(hoverTime);

        // Mouse leave
        const mouseLeaveEvent = new MouseEvent('mouseleave', {
            view: window,
            bubbles: true,
            cancelable: true
        });

        element.dispatchEvent(mouseLeaveEvent);
    }

    /**
     * Get click delay based on personality
     */
    getClickDelay() {
        if (!this.currentPersonality) return 200;

        const personality = this.currentPersonality;
        
        switch (personality.readingSpeed) {
            case 'slow':
                return 300 + Math.random() * 200;
            case 'fast':
                return 100 + Math.random() * 100;
            default:
                return 200 + Math.random() * 150;
        }
    }

    /**
     * Get hover time based on personality
     */
    getHoverTime() {
        if (!this.currentPersonality) return 500;

        const personality = this.currentPersonality;
        const baseTime = personality.hoverProbability > 0.7 ? 800 : 400;
        
        return baseTime + Math.random() * 500;
    }

    /**
     * Simulate realistic typing
     */
    async simulateRealisticTyping(text, element) {
        if (!this.behaviorConfig.reading.enabled || !element) return;

        const personality = this.currentPersonality;
        const typingSpeed = this.getTypingSpeed(personality);

        // Focus element
        element.focus();

        // Clear existing content
        element.value = '';
        element.textContent = '';

        // Type character by character
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            
            // Simulate typo occasionally
            if (this.shouldMakeTypo(personality)) {
                const typoChar = this.generateTypo(char);
                this.insertText(element, typoChar);
                await this.delay(typingSpeed);
                
                // Backspace
                this.backspace(element);
                await this.delay(typingSpeed * 0.5);
            }

            // Insert correct character
            this.insertText(element, char);
            
            // Variable delay between characters
            const delay = typingSpeed + (Math.random() - 0.5) * 100;
            await this.delay(delay);

            // Occasional pause for thinking
            if (this.shouldPauseForThinking(personality)) {
                await this.delay(500 + Math.random() * 1000);
            }
        }
    }

    /**
     * Get typing speed based on personality
     */
    getTypingSpeed(personality) {
        const baseSpeed = 100; // ms per character
        
        switch (personality.readingSpeed) {
            case 'slow':
                return baseSpeed * 1.5;
            case 'fast':
                return baseSpeed * 0.7;
            default:
                return baseSpeed;
        }
    }

    /**
     * Check if should make typo
     */
    shouldMakeTypo(personality) {
        const typoProbability = personality.type === 'casual' ? 0.05 : 0.02;
        return Math.random() < typoProbability;
    }

    /**
     * Generate typo character
     */
    generateTypo(char) {
        const nearbyKeys = {
            'a': ['s', 'q', 'z'],
            's': ['a', 'd', 'z'],
            'd': ['s', 'f', 'e'],
            'f': ['d', 'g', 'r'],
            'g': ['f', 'h', 't'],
            'h': ['g', 'j', 'y'],
            'j': ['h', 'k', 'u'],
            'k': ['j', 'l', 'i'],
            'l': ['k', 'o'],
            'z': ['a', 's', 'x'],
            'x': ['z', 'c', 's'],
            'c': ['x', 'v', 'd'],
            'v': ['c', 'b', 'f'],
            'b': ['v', 'n', 'g'],
            'n': ['b', 'm', 'h'],
            'm': ['n', 'j']
        };

        const nearby = nearbyKeys[char.toLowerCase()];
        if (nearby) {
            return nearby[Math.floor(Math.random() * nearby.length)];
        }
        
        return char;
    }

    /**
     * Check if should pause for thinking
     */
    shouldPauseForThinking(personality) {
        const pauseProbability = personality.attentionSpan === 'long' ? 0.1 : 0.05;
        return Math.random() < pauseProbability;
    }

    /**
     * Insert text into element
     */
    insertText(element, text) {
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            const start = element.selectionStart || 0;
            const end = element.selectionEnd || 0;
            const value = element.value;
            
            element.value = value.substring(0, start) + text + value.substring(end);
            element.selectionStart = element.selectionEnd = start + text.length;
        } else {
            element.textContent += text;
        }

        // Trigger input event
        const inputEvent = new Event('input', { bubbles: true });
        element.dispatchEvent(inputEvent);
    }

    /**
     * Backspace from element
     */
    backspace(element) {
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            const start = element.selectionStart || 0;
            const end = element.selectionEnd || 0;
            const value = element.value;
            
            if (start === end && start > 0) {
                element.value = value.substring(0, start - 1) + value.substring(end);
                element.selectionStart = element.selectionEnd = start - 1;
            } else if (start !== end) {
                element.value = value.substring(0, start) + value.substring(end);
                element.selectionStart = element.selectionEnd = start;
            }
        } else {
            const text = element.textContent;
            if (text.length > 0) {
                element.textContent = text.substring(0, text.length - 1);
            }
        }

        // Trigger input event
        const inputEvent = new Event('input', { bubbles: true });
        element.dispatchEvent(inputEvent);
    }

    /**
     * Simulate reading behavior
     */
    async simulateReadingBehavior(contentType = 'general', contentQuality = 'medium') {
        if (!this.behaviorConfig.reading.enabled) return;

        const personality = this.currentPersonality;
        const readingPattern = this.getReadingPattern(personality, contentType, contentQuality);

        // Simulate reading time
        const readingTime = this.calculateReadingTime(personality, contentType, contentQuality);
        await this.delay(readingTime);

        // Simulate text selection
        if (readingPattern.selectionProbability > Math.random()) {
            await this.simulateTextSelection();
        }

        // Simulate scrolling while reading
        if (readingPattern.scrollWhileReading) {
            await this.simulateReadingScroll();
        }
    }

    /**
     * Get reading pattern based on personality and content
     */
    getReadingPattern(personality, contentType, contentQuality) {
        const basePattern = {
            selectionProbability: 0.3,
            scrollWhileReading: true,
            reReadProbability: 0.2
        };

        // Adjust based on personality
        if (personality.type === 'researcher') {
            basePattern.selectionProbability = 0.8;
            basePattern.reReadProbability = 0.6;
        } else if (personality.type === 'casual') {
            basePattern.selectionProbability = 0.1;
            basePattern.reReadProbability = 0.1;
        }

        // Adjust based on content quality
        if (contentQuality === 'high') {
            basePattern.selectionProbability *= 1.5;
            basePattern.reReadProbability *= 1.3;
        }

        return basePattern;
    }

    /**
     * Calculate reading time based on personality and content
     */
    calculateReadingTime(personality, contentType, contentQuality) {
        let baseTime = 5000; // 5 seconds base

        // Adjust based on personality reading speed
        switch (personality.readingSpeed) {
            case 'slow':
                baseTime *= 1.8;
                break;
            case 'fast':
                baseTime *= 0.6;
                break;
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

        return Math.round(baseTime + (Math.random() - 0.5) * baseTime * 0.3);
    }

    /**
     * Simulate text selection
     */
    async simulateTextSelection() {
        const selection = window.getSelection();
        const range = document.createRange();
        
        // Find text elements
        const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div');
        const readableElements = Array.from(textElements).filter(el => 
            el.textContent && el.textContent.trim().length > 20
        );

        if (readableElements.length > 0) {
            const randomElement = readableElements[Math.floor(Math.random() * readableElements.length)];
            const text = randomElement.textContent;
            
            if (text.length > 10) {
                const start = Math.floor(Math.random() * (text.length - 10));
                const end = start + 5 + Math.floor(Math.random() * 10);
                
                range.setStart(randomElement.firstChild || randomElement, start);
                range.setEnd(randomElement.firstChild || randomElement, end);
                
                selection.removeAllRanges();
                selection.addRange(range);
                
                // Hold selection for a moment
                await this.delay(1000 + Math.random() * 2000);
                
                // Clear selection
                selection.removeAllRanges();
            }
        }
    }

    /**
     * Simulate scrolling while reading
     */
    async simulateReadingScroll() {
        const scrollDistance = 100 + Math.random() * 200;
        await this.simulateNaturalScrolling(window.pageYOffset + scrollDistance, 1500);
    }

    /**
     * Utility delay function
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get current behavior status
     */
    getBehaviorStatus() {
        return {
            isSimulating: this.isSimulating,
            personality: this.currentPersonality,
            config: this.behaviorConfig,
            mousePosition: this.mousePosition,
            scrollPosition: this.scrollPosition
        };
    }

    /**
     * Start behavior simulation
     */
    startSimulation() {
        this.isSimulating = true;
    }

    /**
     * Stop behavior simulation
     */
    stopSimulation() {
        this.isSimulating = false;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BehaviorSimulator;
} else {
    window.BehaviorSimulator = BehaviorSimulator;
}
