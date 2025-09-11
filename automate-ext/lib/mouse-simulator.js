/**
 * Mouse Simulator - Advanced mouse interaction simulation
 * Handles mouse movements, clicks, hovers, and gestures
 */

class MouseSimulator {
    constructor(behaviorSimulator) {
        this.behaviorSimulator = behaviorSimulator;
        this.currentPosition = { x: 0, y: 0 };
        this.isMoving = false;
        this.lastClickTime = 0;
        
        this.mouseConfig = {
            acceleration: true,
            naturalCurves: true,
            hoverEffects: true,
            clickVariation: true,
            gestureSupport: true
        };
    }

    /**
     * Initialize mouse simulator
     */
    initialize() {
        this.currentPosition = {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2
        };
        
        // Set initial mouse position
        this.setMousePosition(this.currentPosition.x, this.currentPosition.y);
    }

    /**
     * Set mouse position
     */
    setMousePosition(x, y) {
        this.currentPosition = { x, y };
        
        // Dispatch mouse move event
        const moveEvent = new MouseEvent('mousemove', {
            view: window,
            bubbles: true,
            cancelable: true,
            clientX: x,
            clientY: y
        });
        
        document.dispatchEvent(moveEvent);
    }

    /**
     * Move mouse to target with natural curve
     */
    async moveTo(targetX, targetY, duration = 1000) {
        if (this.isMoving) return;
        
        this.isMoving = true;
        
        const startX = this.currentPosition.x;
        const startY = this.currentPosition.y;
        const distance = Math.sqrt(Math.pow(targetX - startX, 2) + Math.pow(targetY - startY, 2));
        
        // Adjust duration based on distance
        const adjustedDuration = Math.max(500, Math.min(2000, duration * (distance / 500)));
        
        // Generate natural curve path
        const path = this.generateNaturalPath(startX, startY, targetX, targetY, adjustedDuration);
        
        // Follow the path
        for (const point of path) {
            this.setMousePosition(point.x, point.y);
            await this.delay(point.delay);
        }
        
        this.isMoving = false;
    }

    /**
     * Generate natural mouse path with acceleration
     */
    generateNaturalPath(startX, startY, endX, endY, duration) {
        const path = [];
        // Variable frame rate (45-75 fps) for more human-like movement
        const fps = 45 + Math.random() * 30;
        const steps = Math.floor(duration / (1000 / fps));
        const distance = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
        
        // Add more randomness to the path
        const controlPoints = this.generateControlPoints(startX, startY, endX, endY);
        
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            
            // Apply variable easing function for more natural acceleration
            const easedT = this.easeInOutCubic(t) + (Math.random() - 0.5) * 0.1;
            
            // Calculate position using cubic Bezier curve with imperfections
            const point = this.cubicBezier(
                startX, startY,
                controlPoints[0].x, controlPoints[0].y,
                controlPoints[1].x, controlPoints[1].y,
                endX, endY,
                Math.max(0, Math.min(1, easedT))
            );
            
            // Add enhanced natural jitter to make movement less perfect
            const jitterX = (Math.random() - 0.5) * 4; // Increased jitter
            const jitterY = (Math.random() - 0.5) * 4;
            
            // Add micro-tremors for human-like imperfection
            const tremorX = (Math.random() - 0.5) * 1.5;
            const tremorY = (Math.random() - 0.5) * 1.5;
            
            // Add occasional larger deviations (human hand tremor)
            const largeDeviation = Math.random() < 0.05 ? (Math.random() - 0.5) * 8 : 0;
            
            path.push({
                x: Math.round(point.x + jitterX + tremorX + largeDeviation),
                y: Math.round(point.y + jitterY + tremorY + largeDeviation),
                delay: this.calculateVariableStepDelay(t, distance, duration, i, steps)
            });
        }
        
        return path;
    }

    /**
     * Generate control points for Bezier curve
     */
    generateControlPoints(startX, startY, endX, endY) {
        const distance = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
        const maxOffset = Math.min(distance * 0.3, 100);
        
        return [
            {
                x: startX + (endX - startX) * 0.25 + (Math.random() - 0.5) * maxOffset,
                y: startY + (endY - startY) * 0.25 + (Math.random() - 0.5) * maxOffset
            },
            {
                x: startX + (endX - startX) * 0.75 + (Math.random() - 0.5) * maxOffset,
                y: startY + (endY - startY) * 0.75 + (Math.random() - 0.5) * maxOffset
            }
        ];
    }

    /**
     * Cubic Bezier curve calculation
     */
    cubicBezier(x1, y1, x2, y2, x3, y3, x4, y4, t) {
        const oneMinusT = 1 - t;
        const oneMinusTSquared = oneMinusT * oneMinusT;
        const oneMinusTCubed = oneMinusTSquared * oneMinusT;
        const tSquared = t * t;
        const tCubed = tSquared * t;
        
        return {
            x: oneMinusTCubed * x1 + 3 * oneMinusTSquared * t * x2 + 3 * oneMinusT * tSquared * x3 + tCubed * x4,
            y: oneMinusTCubed * y1 + 3 * oneMinusTSquared * t * y2 + 3 * oneMinusT * tSquared * y3 + tCubed * y4
        };
    }

    /**
     * Easing function for natural acceleration
     */
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    /**
     * Calculate delay for each step based on acceleration
     */
    calculateStepDelay(t, distance, duration) {
        const baseDelay = 16; // 60fps
        
        // Slower at start and end, faster in middle (natural acceleration)
        const accelerationFactor = Math.sin(t * Math.PI);
        
        return baseDelay * (1 + accelerationFactor * 0.5);
    }

    /**
     * Calculate variable delay for each step with enhanced human-like imperfections
     */
    calculateVariableStepDelay(t, distance, duration, stepIndex, totalSteps) {
        // More natural base delay with wider variation (8-25ms for 40-125fps)
        const baseDelay = 8 + Math.random() * 17;
        
        // More natural acceleration curve with human imperfection
        const accelerationFactor = Math.sin(t * Math.PI) + (Math.random() - 0.5) * 0.2;
        
        // Add more random variation to timing
        const randomVariation = (Math.random() - 0.5) * 0.6; // Increased from 0.3 to 0.6
        
        // Add occasional micro-pauses with more natural frequency
        const microPauseChance = Math.random() < 0.05; // 5% chance (was 2%)
        const microPause = microPauseChance ? Math.random() * 100 : 0; // 0-100ms (was 0-50ms)
        
        // Add more realistic fatigue factor
        const fatigueFactor = 1 + (stepIndex / totalSteps) * (0.05 + Math.random() * 0.15); // 1.0-1.2 (was 1.0-1.1)
        
        // Add human-like hesitation factor
        const hesitationFactor = Math.random() < 0.08 ? (1.2 + Math.random() * 0.6) : 1.0; // 8% chance for 1.2-1.8x delay
        
        // Add attention factor (slower when distracted)
        const attentionFactor = 0.8 + Math.random() * 0.4; // 0.8-1.2
        
        const finalDelay = (baseDelay * (1 + accelerationFactor * 0.5 + randomVariation) * fatigueFactor * hesitationFactor * attentionFactor) + microPause;
        
        return Math.max(5, Math.round(finalDelay)); // Minimum 5ms delay
    }

    /**
     * Click on element with natural behavior
     */
    async click(element, options = {}) {
        if (!element) return false;
        
        const rect = element.getBoundingClientRect();
        
        // Add human-like click imperfection (not always perfect center)
        let clickX, clickY;
        if (options.x && options.y) {
            // Use provided coordinates
            clickX = options.x;
            clickY = options.y;
        } else {
            // Add imperfection to center click
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            
            // Random offset within element bounds (human-like imperfection)
            const maxOffsetX = Math.min(rect.width * 0.3, 20); // Max 30% of width or 20px
            const maxOffsetY = Math.min(rect.height * 0.3, 20); // Max 30% of height or 20px
            
            clickX = centerX + (Math.random() - 0.5) * maxOffsetX;
            clickY = centerY + (Math.random() - 0.5) * maxOffsetY;
            
            // Ensure click is within element bounds
            clickX = Math.max(rect.left, Math.min(rect.right, clickX));
            clickY = Math.max(rect.top, Math.min(rect.bottom, clickY));
        }
        
        // Move to element first
        await this.moveTo(clickX, clickY, options.moveDuration || 800);
        
        // Simulate hover if enabled
        if (this.mouseConfig.hoverEffects) {
            await this.hover(element, options.hoverDuration);
        }
        
        // Click delay
        const clickDelay = this.calculateClickDelay();
        await this.delay(clickDelay);
        
        // Perform click
        const clickType = options.doubleClick ? 'dblclick' : 'click';
        const clickEvent = new MouseEvent(clickType, {
            view: window,
            bubbles: true,
            cancelable: true,
            clientX: clickX,
            clientY: clickY,
            button: options.button || 0,
            buttons: options.buttons || 1
        });
        
        element.dispatchEvent(clickEvent);
        
        // Update last click time
        this.lastClickTime = Date.now();
        
        return true;
    }

    /**
     * Hover over element
     */
    async hover(element, duration = 500) {
        if (!element) return;
        
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Move to element center
        await this.moveTo(centerX, centerY, 400);
        
        // Mouse enter
        const mouseEnterEvent = new MouseEvent('mouseenter', {
            view: window,
            bubbles: true,
            cancelable: true,
            clientX: centerX,
            clientY: centerY
        });
        
        element.dispatchEvent(mouseEnterEvent);
        
        // Hover duration
        await this.delay(duration);
        
        // Mouse leave
        const mouseLeaveEvent = new MouseEvent('mouseleave', {
            view: window,
            bubbles: true,
            cancelable: true
        });
        
        element.dispatchEvent(mouseLeaveEvent);
    }

    /**
     * Right click on element
     */
    async rightClick(element) {
        return this.click(element, { button: 2, buttons: 2 });
    }

    /**
     * Double click on element
     */
    async doubleClick(element) {
        return this.click(element, { doubleClick: true });
    }

    /**
     * Drag and drop operation
     */
    async dragAndDrop(sourceElement, targetElement, duration = 1000) {
        if (!sourceElement || !targetElement) return false;
        
        const sourceRect = sourceElement.getBoundingClientRect();
        const targetRect = targetElement.getBoundingClientRect();
        
        const startX = sourceRect.left + sourceRect.width / 2;
        const startY = sourceRect.top + sourceRect.height / 2;
        const endX = targetRect.left + targetRect.width / 2;
        const endY = targetRect.top + targetRect.height / 2;
        
        // Move to source
        await this.moveTo(startX, startY, 600);
        
        // Mouse down
        const mouseDownEvent = new MouseEvent('mousedown', {
            view: window,
            bubbles: true,
            cancelable: true,
            clientX: startX,
            clientY: startY,
            button: 0,
            buttons: 1
        });
        
        sourceElement.dispatchEvent(mouseDownEvent);
        
        // Drag to target
        await this.moveTo(endX, endY, duration);
        
        // Mouse up
        const mouseUpEvent = new MouseEvent('mouseup', {
            view: window,
            bubbles: true,
            cancelable: true,
            clientX: endX,
            clientY: endY,
            button: 0,
            buttons: 0
        });
        
        targetElement.dispatchEvent(mouseUpEvent);
        
        return true;
    }

    /**
     * Scroll with mouse wheel
     */
    async scrollWheel(element, deltaY, deltaX = 0) {
        if (!element) {
            element = document;
        }
        
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Move to element center
        await this.moveTo(centerX, centerY, 400);
        
        // Wheel event
        const wheelEvent = new WheelEvent('wheel', {
            view: window,
            bubbles: true,
            cancelable: true,
            clientX: centerX,
            clientY: centerY,
            deltaX: deltaX,
            deltaY: deltaY
        });
        
        element.dispatchEvent(wheelEvent);
        
        // Wait for scroll to complete
        await this.delay(300);
    }

    /**
     * Calculate click delay based on personality (Enhanced for Human-Like Behavior)
     */
    calculateClickDelay() {
        const personality = this.behaviorSimulator?.currentPersonality;
        
        if (!personality) {
            return 150 + Math.random() * 400; // 150-550ms default (was 200-300ms)
        }
        
        let baseDelay;
        switch (personality.readingSpeed) {
            case 'slow':
                baseDelay = 250 + Math.random() * 500; // 250-750ms
                break;
            case 'fast':
                baseDelay = 100 + Math.random() * 300; // 100-400ms
                break;
            default:
                baseDelay = 150 + Math.random() * 400; // 150-550ms
                break;
        }
        
        // Add human-like hesitation factor
        const hesitationFactor = Math.random() < 0.12 ? (1.3 + Math.random() * 0.7) : 1.0; // 12% chance for 1.3-2.0x delay
        baseDelay *= hesitationFactor;
        
        // Add attention factor
        const attentionFactor = 0.7 + Math.random() * 0.6; // 0.7-1.3
        baseDelay *= attentionFactor;
        
        // Add random human imperfection
        baseDelay += (Math.random() - 0.5) * baseDelay * 0.3; // ±15% variation
        
        return Math.max(50, Math.round(baseDelay)); // Minimum 50ms delay
    }

    /**
     * Get current mouse position
     */
    getCurrentPosition() {
        return { ...this.currentPosition };
    }

    /**
     * Check if mouse is over element
     */
    isOverElement(element) {
        if (!element) return false;
        
        const rect = element.getBoundingClientRect();
        return this.currentPosition.x >= rect.left &&
               this.currentPosition.x <= rect.right &&
               this.currentPosition.y >= rect.top &&
               this.currentPosition.y <= rect.bottom;
    }

    /**
     * Utility delay function with stealth
     */
    delay(ms) {
        // Use stealth delay if available, otherwise fallback to standard delay
        try {
            if (window._stealth_delay) {
                const stealthDelay = new window._stealth_delay();
                return stealthDelay.wait(ms);
            } else {
                return new Promise(resolve => setTimeout(resolve, ms));
            }
        } catch (error) {
            // Fallback to standard delay if stealth delay fails
            return new Promise(resolve => setTimeout(resolve, ms));
        }
    }
}

// Export for use in other modules with enhanced stealth protection
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MouseSimulator;
} else if (typeof window !== 'undefined' && !window.MouseSimulator) {
    window.MouseSimulator = MouseSimulator;
}
