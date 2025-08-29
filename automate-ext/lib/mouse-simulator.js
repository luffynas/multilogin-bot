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
        const steps = Math.floor(duration / 16); // 60fps
        const distance = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
        
        // Add some randomness to the path
        const controlPoints = this.generateControlPoints(startX, startY, endX, endY);
        
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            
            // Apply easing function for natural acceleration
            const easedT = this.easeInOutCubic(t);
            
            // Calculate position using cubic Bezier curve
            const point = this.cubicBezier(
                startX, startY,
                controlPoints[0].x, controlPoints[0].y,
                controlPoints[1].x, controlPoints[1].y,
                endX, endY,
                easedT
            );
            
            // Add slight jitter for realism
            const jitterX = (Math.random() - 0.5) * 2;
            const jitterY = (Math.random() - 0.5) * 2;
            
            path.push({
                x: Math.round(point.x + jitterX),
                y: Math.round(point.y + jitterY),
                delay: this.calculateStepDelay(t, distance, duration)
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
     * Click on element with natural behavior
     */
    async click(element, options = {}) {
        if (!element) return false;
        
        const rect = element.getBoundingClientRect();
        const clickX = options.x || rect.left + rect.width / 2;
        const clickY = options.y || rect.top + rect.height / 2;
        
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
     * Calculate click delay based on personality
     */
    calculateClickDelay() {
        const personality = this.behaviorSimulator?.currentPersonality;
        if (!personality) return 200 + Math.random() * 100;
        
        const baseDelay = 200;
        let multiplier = 1.0;
        
        switch (personality.readingSpeed) {
            case 'slow':
                multiplier = 1.5;
                break;
            case 'fast':
                multiplier = 0.7;
                break;
        }
        
        return baseDelay * multiplier + Math.random() * 100;
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
        if (window._stealth_delay) {
            const stealthDelay = new window._stealth_delay();
            return stealthDelay.wait(ms);
        } else {
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
