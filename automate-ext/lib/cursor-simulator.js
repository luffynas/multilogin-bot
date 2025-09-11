/**
 * Cursor Simulator - Simulates natural cursor movement during reading pauses
 * Enhances human-like behavior by adding realistic cursor interactions
 */

// Check if class already exists before declaring
if (typeof window.CursorSimulator === 'undefined') {
    class CursorSimulator {
    constructor(behaviorSimulator) {
        this.behaviorSimulator = behaviorSimulator;
        this.isActive = false;
        this.currentPattern = 'idle';
        this.movementHistory = [];
        this.fatigueLevel = 0;
        this.currentPosition = { x: 0, y: 0 };
        this.lastMovementTime = 0;
        
        this.cursorConfig = {
            enabled: true,
            movementTypes: ['text-following', 'attention-shift', 'micro-movement', 'hover-exploration'],
            intensity: 'medium',
            naturalVariation: true,
            personalityAdaptation: true,
            performanceMode: 'balanced' // 'high', 'balanced', 'low'
        };
        
        this.personalityConfigs = {
            researcher: {
                movementTypes: ['text-following', 'micro-movement'],
                intensity: 'high',
                textFollowingSpeed: 0.8, // Slower, more careful
                attentionSpan: 'long',
                microMovementFrequency: 0.6,
                hoverExploration: 0.3, // Less exploration, more focused
                movementSmoothness: 0.9
            },
            explorer: {
                movementTypes: ['attention-shift', 'hover-exploration'],
                intensity: 'medium',
                textFollowingSpeed: 1.2, // Faster, more scanning
                attentionSpan: 'short',
                microMovementFrequency: 0.8,
                hoverExploration: 0.9, // More exploration
                movementSmoothness: 0.7
            },
            casual: {
                movementTypes: ['micro-movement', 'hover-exploration'],
                intensity: 'low',
                textFollowingSpeed: 1.0, // Normal speed
                attentionSpan: 'medium',
                microMovementFrequency: 0.4,
                hoverExploration: 0.6, // Moderate exploration
                movementSmoothness: 0.8
            },
            professional: {
                movementTypes: ['text-following', 'micro-movement'],
                intensity: 'medium',
                textFollowingSpeed: 0.9, // Slightly slower, more deliberate
                attentionSpan: 'long',
                microMovementFrequency: 0.5,
                hoverExploration: 0.4, // Less exploration, more focused
                movementSmoothness: 0.95
            }
        };
        
        this.movementCache = new Map();
        this.performanceMetrics = {
            totalMovements: 0,
            averageMovementTime: 0,
            lastPerformanceCheck: Date.now()
        };
    }

    /**
     * Initialize cursor simulator
     */
    initialize() {
        if (!this.cursorConfig.enabled) return;
        
        this.setupEventListeners();
        this.initializePosition();
        this.startPerformanceMonitoring();
        
        console.log('🎯 CursorSimulator initialized');
    }

    /**
     * Setup event listeners for cursor tracking
     */
    setupEventListeners() {
        // Track real mouse movements to maintain realistic position
        document.addEventListener('mousemove', (event) => {
            this.currentPosition = { x: event.clientX, y: event.clientY };
            this.lastMovementTime = Date.now();
        });
    }

    /**
     * Initialize cursor position
     */
    initializePosition() {
        // Get current mouse position or use center of viewport
        this.currentPosition = {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2
        };
    }

    /**
     * Main method to simulate cursor movement during reading pause
     */
    async simulateReadingCursorMovement(duration, scrollPosition, personality) {
        if (!this.cursorConfig.enabled || duration < 0.5) {
            // If disabled or very short pause, just wait
            await this.delay(duration * 1000);
            return;
        }

        this.isActive = true;
        const startTime = Date.now();
        const personalityConfig = this.personalityConfigs[personality?.type] || this.personalityConfigs.casual;
        
        console.log(`🎯 Starting cursor simulation: ${duration.toFixed(1)}s, personality: ${personality?.type || 'default'}`);
        
        try {
            // Determine movement pattern based on duration and personality
            const movementPattern = this.selectMovementPattern(duration, personalityConfig);
            
            // Execute the selected pattern
            await this.executeMovementPattern(movementPattern, duration, personalityConfig, scrollPosition);
            
        } catch (error) {
            console.debug('Error in cursor simulation:', error);
            // Fallback to simple delay
            await this.delay(duration * 1000);
        } finally {
            this.isActive = false;
            const actualDuration = (Date.now() - startTime) / 1000;
            console.log(`🎯 Cursor simulation completed: ${actualDuration.toFixed(1)}s`);
        }
    }

    /**
     * Select appropriate movement pattern based on duration and personality
     */
    selectMovementPattern(duration, personalityConfig) {
        const patterns = [];
        
        // Add patterns based on duration
        if (duration >= 3.0) {
            patterns.push('text-following');
        }
        if (duration >= 2.0) {
            patterns.push('attention-shift');
        }
        if (duration >= 1.0) {
            patterns.push('micro-movement');
        }
        if (duration >= 1.5) {
            patterns.push('hover-exploration');
        }
        
        // Filter by personality preferences
        const availablePatterns = patterns.filter(pattern => 
            personalityConfig.movementTypes.includes(pattern)
        );
        
        // Select primary pattern
        const primaryPattern = availablePatterns.length > 0 
            ? availablePatterns[Math.floor(Math.random() * availablePatterns.length)]
            : 'micro-movement';
        
        // Add secondary pattern for longer durations
        let secondaryPattern = null;
        if (duration >= 4.0 && availablePatterns.length > 1) {
            const remainingPatterns = availablePatterns.filter(p => p !== primaryPattern);
            secondaryPattern = remainingPatterns[Math.floor(Math.random() * remainingPatterns.length)];
        }
        
        return {
            primary: primaryPattern,
            secondary: secondaryPattern,
            duration: duration,
            intensity: personalityConfig.intensity
        };
    }

    /**
     * Execute the selected movement pattern
     */
    async executeMovementPattern(pattern, duration, personalityConfig, scrollPosition) {
        const startTime = Date.now();
        const remainingTime = () => duration - ((Date.now() - startTime) / 1000);
        
        // Execute primary pattern
        const primaryDuration = pattern.secondary ? duration * 0.6 : duration;
        await this.executePattern(pattern.primary, primaryDuration, personalityConfig, scrollPosition);
        
        // Execute secondary pattern if available and time permits
        if (pattern.secondary && remainingTime() > 0.5) {
            await this.executePattern(pattern.secondary, remainingTime(), personalityConfig, scrollPosition);
        }
        
        // Fill remaining time with micro-movements
        if (remainingTime() > 0.2) {
            await this.executePattern('micro-movement', remainingTime(), personalityConfig, scrollPosition);
        }
    }

    /**
     * Execute specific movement pattern
     */
    async executePattern(patternType, duration, personalityConfig, scrollPosition) {
        switch (patternType) {
            case 'text-following':
                await this.simulateTextFollowing(duration, personalityConfig, scrollPosition);
                break;
            case 'attention-shift':
                await this.simulateAttentionShift(duration, personalityConfig, scrollPosition);
                break;
            case 'micro-movement':
                await this.simulateMicroMovement(duration, personalityConfig, scrollPosition);
                break;
            case 'hover-exploration':
                await this.simulateHoverExploration(duration, personalityConfig, scrollPosition);
                break;
            default:
                await this.simulateMicroMovement(duration, personalityConfig, scrollPosition);
        }
    }

    /**
     * Simulate text following pattern
     */
    async simulateTextFollowing(duration, personalityConfig, scrollPosition) {
        const textElements = this.getVisibleTextElements();
        if (textElements.length === 0) {
            await this.simulateMicroMovement(duration, personalityConfig, scrollPosition);
            return;
        }
        
        const readingSpeed = personalityConfig.textFollowingSpeed;
        const totalTextLength = textElements.reduce((sum, el) => sum + el.textContent.length, 0);
        const timePerChar = (duration * 1000) / totalTextLength;
        
        for (const element of textElements) {
            if (this.isActive === false) break;
            
            const textRect = element.getBoundingClientRect();
            const textLength = element.textContent.length;
            const elementDuration = (textLength * timePerChar) / 1000;
            
            if (elementDuration < 0.1) continue;
            
            // Move cursor along text
            await this.moveCursorAlongText(element, elementDuration, personalityConfig);
        }
    }

    /**
     * Move cursor along text element
     */
    async moveCursorAlongText(element, duration, personalityConfig) {
        const rect = element.getBoundingClientRect();
        const textLength = element.textContent.length;
        const steps = Math.max(5, Math.floor(duration * 10)); // 10 steps per second
        
        for (let i = 0; i < steps; i++) {
            if (this.isActive === false) break;
            
            const progress = i / steps;
            const charIndex = Math.floor(progress * textLength);
            
            // Estimate character position (simplified)
            const charX = rect.left + (progress * rect.width);
            const charY = rect.top + (rect.height / 2);
            
            // Add natural variation
            const variationX = (Math.random() - 0.5) * 10;
            const variationY = (Math.random() - 0.5) * 5;
            
            const targetX = charX + variationX;
            const targetY = charY + variationY;
            
            await this.moveCursorTo(targetX, targetY, personalityConfig.movementSmoothness);
            await this.delay(100 / personalityConfig.textFollowingSpeed);
        }
    }

    /**
     * Simulate attention shift pattern
     */
    async simulateAttentionShift(duration, personalityConfig, scrollPosition) {
        const attentionTargets = this.getAttentionTargets();
        if (attentionTargets.length === 0) {
            await this.simulateMicroMovement(duration, personalityConfig, scrollPosition);
            return;
        }
        
        const shiftCount = Math.max(1, Math.floor(duration * personalityConfig.microMovementFrequency));
        const shiftInterval = duration / shiftCount;
        
        for (let i = 0; i < shiftCount; i++) {
            if (this.isActive === false) break;
            
            const target = this.selectRandomTarget(attentionTargets);
            await this.moveCursorToTarget(target, 'attention-shift', personalityConfig);
            await this.delay(shiftInterval * 1000);
        }
    }

    /**
     * Simulate micro movement pattern
     */
    async simulateMicroMovement(duration, personalityConfig, scrollPosition) {
        const microMovements = this.generateMicroMovements(duration, personalityConfig);
        
        for (const movement of microMovements) {
            if (this.isActive === false) break;
            
            await this.executeMicroMovement(movement, personalityConfig);
            await this.delay(movement.delay);
        }
    }

    /**
     * Generate micro movements
     */
    generateMicroMovements(duration, personalityConfig) {
        const movements = [];
        const movementCount = Math.max(3, Math.floor(duration * personalityConfig.microMovementFrequency * 2));
        const baseDelay = (duration * 1000) / movementCount;
        
        for (let i = 0; i < movementCount; i++) {
            const movement = {
                type: this.getRandomMicroMovementType(),
                distance: 5 + Math.random() * 15, // 5-20 pixels
                direction: Math.random() * Math.PI * 2,
                delay: baseDelay * (0.5 + Math.random() * 1.0), // 50-150% of base delay
                intensity: personalityConfig.intensity === 'high' ? 1.2 : 
                          personalityConfig.intensity === 'low' ? 0.8 : 1.0
            };
            movements.push(movement);
        }
        
        return movements;
    }

    /**
     * Get random micro movement type
     */
    getRandomMicroMovementType() {
        const types = ['drift', 'tremor', 'adjustment', 'hover'];
        return types[Math.floor(Math.random() * types.length)];
    }

    /**
     * Execute micro movement
     */
    async executeMicroMovement(movement, personalityConfig) {
        const currentX = this.currentPosition.x;
        const currentY = this.currentPosition.y;
        
        const targetX = currentX + Math.cos(movement.direction) * movement.distance * movement.intensity;
        const targetY = currentY + Math.sin(movement.direction) * movement.distance * movement.intensity;
        
        // Ensure target is within viewport
        const boundedX = Math.max(0, Math.min(window.innerWidth, targetX));
        const boundedY = Math.max(0, Math.min(window.innerHeight, targetY));
        
        await this.moveCursorTo(boundedX, boundedY, personalityConfig.movementSmoothness);
    }

    /**
     * Simulate hover exploration pattern
     */
    async simulateHoverExploration(duration, personalityConfig, scrollPosition) {
        const hoverTargets = this.getHoverTargets();
        if (hoverTargets.length === 0) {
            await this.simulateMicroMovement(duration, personalityConfig, scrollPosition);
            return;
        }
        
        const explorationCount = Math.max(1, Math.floor(duration * personalityConfig.hoverExploration));
        const explorationInterval = duration / explorationCount;
        
        for (let i = 0; i < explorationCount; i++) {
            if (this.isActive === false) break;
            
            const target = this.selectRandomTarget(hoverTargets);
            await this.hoverOverElement(target, personalityConfig);
            await this.delay(explorationInterval * 1000);
        }
    }

    /**
     * Move cursor to target coordinates
     */
    async moveCursorTo(targetX, targetY, smoothness = 0.8) {
        const startX = this.currentPosition.x;
        const startY = this.currentPosition.y;
        const distance = Math.sqrt(Math.pow(targetX - startX, 2) + Math.pow(targetY - startY, 2));
        
        if (distance < 1) return; // Too close to move
        
        const steps = Math.max(2, Math.floor(distance / 10 * smoothness));
        const stepDelay = Math.max(10, Math.min(50, distance / steps));
        
        for (let i = 0; i <= steps; i++) {
            if (this.isActive === false) break;
            
            const progress = i / steps;
            const currentX = startX + (targetX - startX) * progress;
            const currentY = startY + (targetY - startY) * progress;
            
            this.dispatchMouseMove(currentX, currentY);
            this.currentPosition = { x: currentX, y: currentY };
            
            if (i < steps) {
                await this.delay(stepDelay);
            }
        }
    }

    /**
     * Move cursor to target element
     */
    async moveCursorToTarget(target, movementType, personalityConfig) {
        const rect = target.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Add natural variation based on movement type
        let variationX = 0;
        let variationY = 0;
        
        switch (movementType) {
            case 'attention-shift':
                variationX = (Math.random() - 0.5) * 20;
                variationY = (Math.random() - 0.5) * 10;
                break;
            case 'hover-exploration':
                variationX = (Math.random() - 0.5) * 15;
                variationY = (Math.random() - 0.5) * 15;
                break;
            default:
                variationX = (Math.random() - 0.5) * 10;
                variationY = (Math.random() - 0.5) * 5;
        }
        
        const targetX = centerX + variationX;
        const targetY = centerY + variationY;
        
        await this.moveCursorTo(targetX, targetY, personalityConfig.movementSmoothness);
    }

    /**
     * Hover over element
     */
    async hoverOverElement(element, personalityConfig) {
        const rect = element.getBoundingClientRect();
        const hoverX = rect.left + Math.random() * rect.width;
        const hoverY = rect.top + Math.random() * rect.height;
        
        await this.moveCursorTo(hoverX, hoverY, personalityConfig.movementSmoothness);
        
        // Simulate hover duration
        const hoverDuration = 200 + Math.random() * 800; // 200-1000ms
        await this.delay(hoverDuration);
    }

    /**
     * Get visible text elements
     */
    getVisibleTextElements() {
        const textElements = [];
        const selectors = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div', 'article', 'section'];
        
        for (const selector of selectors) {
            const elements = document.querySelectorAll(selector);
            for (const element of elements) {
                if (this.isElementVisible(element) && element.textContent.trim().length > 10) {
                    textElements.push(element);
                }
            }
        }
        
        return textElements.slice(0, 10); // Limit to first 10 elements
    }

    /**
     * Get attention targets (headings, images, links)
     */
    getAttentionTargets() {
        const targets = [];
        const selectors = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img', 'a', 'button', 'input'];
        
        for (const selector of selectors) {
            const elements = document.querySelectorAll(selector);
            for (const element of elements) {
                if (this.isElementVisible(element)) {
                    targets.push(element);
                }
            }
        }
        
        return targets.slice(0, 15); // Limit to first 15 elements
    }

    /**
     * Get hover targets (interactive elements)
     */
    getHoverTargets() {
        const targets = [];
        const selectors = ['a', 'button', 'input', 'select', 'textarea', '[onclick]', '[role="button"]'];
        
        for (const selector of selectors) {
            const elements = document.querySelectorAll(selector);
            for (const element of elements) {
                if (this.isElementVisible(element)) {
                    targets.push(element);
                }
            }
        }
        
        return targets.slice(0, 10); // Limit to first 10 elements
    }

    /**
     * Check if element is visible in viewport
     */
    isElementVisible(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= window.innerHeight &&
            rect.right <= window.innerWidth &&
            rect.width > 0 &&
            rect.height > 0
        );
    }

    /**
     * Select random target from array
     */
    selectRandomTarget(targets) {
        if (targets.length === 0) return null;
        return targets[Math.floor(Math.random() * targets.length)];
    }

    /**
     * Dispatch mouse move event
     */
    dispatchMouseMove(x, y) {
        const moveEvent = new MouseEvent('mousemove', {
            view: window,
            bubbles: true,
            cancelable: true,
            clientX: x,
            clientY: y,
            screenX: x + window.screenX,
            screenY: y + window.screenY
        });
        
        document.dispatchEvent(moveEvent);
    }

    /**
     * Start performance monitoring
     */
    startPerformanceMonitoring() {
        setInterval(() => {
            this.updatePerformanceMetrics();
        }, 5000); // Check every 5 seconds
    }

    /**
     * Update performance metrics
     */
    updatePerformanceMetrics() {
        const now = Date.now();
        const timeSinceLastCheck = now - this.performanceMetrics.lastPerformanceCheck;
        
        if (timeSinceLastCheck > 0) {
            this.performanceMetrics.averageMovementTime = 
                this.performanceMetrics.totalMovements / (timeSinceLastCheck / 1000);
        }
        
        this.performanceMetrics.lastPerformanceCheck = now;
        this.performanceMetrics.totalMovements = 0;
    }

    /**
     * Get performance metrics
     */
    getPerformanceMetrics() {
        return {
            ...this.performanceMetrics,
            isActive: this.isActive,
            currentPattern: this.currentPattern,
            fatigueLevel: this.fatigueLevel
        };
    }

    /**
     * Update fatigue level
     */
    updateFatigue() {
        this.fatigueLevel = Math.min(1.0, this.fatigueLevel + 0.1);
        
        // Reduce fatigue over time
        setTimeout(() => {
            this.fatigueLevel = Math.max(0, this.fatigueLevel - 0.05);
        }, 10000);
    }

    /**
     * Delay utility
     */
    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Stop cursor simulation
     */
    stop() {
        this.isActive = false;
        console.log('🎯 Cursor simulation stopped');
    }

    /**
     * Update configuration
     */
    updateConfig(newConfig) {
        this.cursorConfig = { ...this.cursorConfig, ...newConfig };
        console.log('🎯 Cursor configuration updated:', this.cursorConfig);
    }
    }

    // Export for use in other modules
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = CursorSimulator;
    } else if (typeof window !== 'undefined') {
        // Only export if not already exists
        if (!window.CursorSimulator) {
            window.CursorSimulator = CursorSimulator;
        }
    }
} else {
    // Use existing class
    console.debug('CursorSimulator already exists, using existing instance');
}
