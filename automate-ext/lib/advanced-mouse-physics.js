/**
 * Advanced Mouse Physics Engine - Realistic mouse movement simulation with physics
 */

class AdvancedMousePhysics {
    constructor() {
        this.physicsConfig = {
            enabled: true,
            gravity: 0.1,
            friction: 0.95,
            acceleration: 0.8,
            maxVelocity: 15,
            jitterFactor: 0.3,
            curveSmoothing: 0.7,
            momentumTransfer: 0.8,
            handTremor: 0.1,
            fatigueFactor: 0.05
        };
        
        this.currentState = {
            position: { x: 0, y: 0 },
            velocity: { x: 0, y: 0 },
            acceleration: { x: 0, y: 0 },
            fatigue: 0,
            lastMoveTime: 0
        };
        
        this.movementHistory = [];
        this.physicsEngine = null;
    }

    /**
     * Initialize physics engine
     */
    initialize() {
        if (!this.physicsConfig.enabled) return this;
        
        this.startPhysicsEngine();
        return this;
    }

    /**
     * Start physics engine
     */
    startPhysicsEngine() {
        if (this.physicsEngine) return;
        
        this.physicsEngine = setInterval(() => {
            this.updatePhysics();
        }, 16); // 60 FPS physics update
    }

    /**
     * Stop physics engine
     */
    stopPhysicsEngine() {
        if (this.physicsEngine) {
            clearInterval(this.physicsEngine);
            this.physicsEngine = null;
        }
    }

    /**
     * Update physics simulation
     */
    updatePhysics() {
        const deltaTime = 0.016; // 16ms
        
        // Apply gravity (slight downward pull)
        this.currentState.acceleration.y += this.physicsConfig.gravity;
        
        // Apply friction
        this.currentState.velocity.x *= this.physicsConfig.friction;
        this.currentState.velocity.y *= this.physicsConfig.friction;
        
        // Update velocity
        this.currentState.velocity.x += this.currentState.acceleration.x * deltaTime;
        this.currentState.velocity.y += this.currentState.acceleration.y * deltaTime;
        
        // Limit maximum velocity
        const speed = Math.sqrt(this.currentState.velocity.x ** 2 + this.currentState.velocity.y ** 2);
        if (speed > this.physicsConfig.maxVelocity) {
            const scale = this.physicsConfig.maxVelocity / speed;
            this.currentState.velocity.x *= scale;
            this.currentState.velocity.y *= scale;
        }
        
        // Update position
        this.currentState.position.x += this.currentState.velocity.x * deltaTime;
        this.currentState.position.y += this.currentState.velocity.y * deltaTime;
        
        // Reset acceleration
        this.currentState.acceleration.x = 0;
        this.currentState.acceleration.y = 0;
        
        // Update fatigue
        this.updateFatigue();
    }

    /**
     * Update fatigue based on movement
     */
    updateFatigue() {
        const timeSinceLastMove = Date.now() - this.currentState.lastMoveTime;
        
        if (timeSinceLastMove > 1000) { // 1 second
            // Reduce fatigue when not moving
            this.currentState.fatigue = Math.max(0, this.currentState.fatigue - this.physicsConfig.fatigueFactor);
        }
    }

    /**
     * Generate realistic mouse movement path
     */
    generateMovementPath(startPos, endPos, options = {}) {
        const path = [];
        const distance = Math.sqrt((endPos.x - startPos.x) ** 2 + (endPos.y - startPos.y) ** 2);
        
        // Determine movement type based on distance
        const movementType = this.determineMovementType(distance, options);
        
        switch (movementType) {
            case 'direct':
                path.push(...this.generateDirectPath(startPos, endPos, options));
                break;
            case 'curved':
                path.push(...this.generateCurvedPath(startPos, endPos, options));
                break;
            case 'hesitant':
                path.push(...this.generateHesitantPath(startPos, endPos, options));
                break;
            case 'precise':
                path.push(...this.generatePrecisePath(startPos, endPos, options));
                break;
            default:
                path.push(...this.generateNaturalPath(startPos, endPos, options));
        }
        
        // Apply physics-based smoothing
        return this.applyPhysicsSmoothing(path);
    }

    /**
     * Determine movement type based on distance and context
     */
    determineMovementType(distance, options) {
        const { precision, urgency, targetSize } = options;
        
        if (distance < 50) {
            return precision === 'high' ? 'precise' : 'direct';
        } else if (distance < 200) {
            return urgency === 'high' ? 'direct' : 'curved';
        } else if (distance < 500) {
            return 'curved';
        } else {
            return 'hesitant';
        }
    }

    /**
     * Generate direct movement path
     */
    generateDirectPath(startPos, endPos, options) {
        const path = [];
        const steps = Math.max(10, Math.floor(this.calculateDistance(startPos, endPos) / 5));
        
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = startPos.x + (endPos.x - startPos.x) * t;
            const y = startPos.y + (endPos.y - startPos.y) * t;
            
            path.push({
                x: x + this.generateJitter(options),
                y: y + this.generateJitter(options),
                timestamp: Date.now() + i * 16
            });
        }
        
        return path;
    }

    /**
     * Generate curved movement path
     */
    generateCurvedPath(startPos, endPos, options) {
        const path = [];
        const steps = Math.max(20, Math.floor(this.calculateDistance(startPos, endPos) / 3));
        
        // Generate control points for Bezier curve
        const controlPoint1 = this.generateControlPoint(startPos, endPos, 'mid');
        const controlPoint2 = this.generateControlPoint(startPos, endPos, 'random');
        
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const point = this.cubicBezier(startPos, controlPoint1, controlPoint2, endPos, t);
            
            path.push({
                x: point.x + this.generateJitter(options),
                y: point.y + this.generateJitter(options),
                timestamp: Date.now() + i * 16
            });
        }
        
        return path;
    }

    /**
     * Generate hesitant movement path
     */
    generateHesitantPath(startPos, endPos, options) {
        const path = [];
        const steps = Math.max(30, Math.floor(this.calculateDistance(startPos, endPos) / 2));
        
        let currentPos = { ...startPos };
        const targetPos = { ...endPos };
        
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const progress = this.easeInOutCubic(t);
            
            // Add hesitation points
            if (i > 0 && i < steps && Math.random() < 0.3) {
                const hesitationPoint = {
                    x: currentPos.x + (Math.random() - 0.5) * 20,
                    y: currentPos.y + (Math.random() - 0.5) * 20,
                    timestamp: Date.now() + i * 16
                };
                path.push(hesitationPoint);
                currentPos = hesitationPoint;
            }
            
            const x = startPos.x + (targetPos.x - startPos.x) * progress;
            const y = startPos.y + (targetPos.y - startPos.y) * progress;
            
            path.push({
                x: x + this.generateJitter(options),
                y: y + this.generateJitter(options),
                timestamp: Date.now() + i * 16
            });
            
            currentPos = { x, y };
        }
        
        return path;
    }

    /**
     * Generate precise movement path
     */
    generatePrecisePath(startPos, endPos, options) {
        const path = [];
        const steps = Math.max(15, Math.floor(this.calculateDistance(startPos, endPos) / 2));
        
        // Generate micro-adjustments for precision
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const progress = this.easeOutQuart(t);
            
            const x = startPos.x + (endPos.x - startPos.x) * progress;
            const y = startPos.y + (endPos.y - startPos.y) * progress;
            
            // Add micro-adjustments
            const microAdjustment = this.generateMicroAdjustment(i, steps);
            
            path.push({
                x: x + microAdjustment.x + this.generateJitter(options, 0.1),
                y: y + microAdjustment.y + this.generateJitter(options, 0.1),
                timestamp: Date.now() + i * 20
            });
        }
        
        return path;
    }

    /**
     * Generate natural movement path
     */
    generateNaturalPath(startPos, endPos, options) {
        const path = [];
        const steps = Math.max(25, Math.floor(this.calculateDistance(startPos, endPos) / 4));
        
        // Combine multiple movement types for natural feel
        const segments = this.dividePathIntoSegments(startPos, endPos, 3);
        
        segments.forEach((segment, index) => {
            const segmentPath = this.generateCurvedPath(segment.start, segment.end, options);
            path.push(...segmentPath);
        });
        
        return path;
    }

    /**
     * Apply physics-based smoothing to path
     */
    applyPhysicsSmoothing(path) {
        if (path.length < 3) return path;
        
        const smoothedPath = [];
        const smoothingFactor = this.physicsConfig.curveSmoothing;
        
        for (let i = 0; i < path.length; i++) {
            let smoothedPoint = { ...path[i] };
            
            if (i > 0 && i < path.length - 1) {
                const prev = path[i - 1];
                const curr = path[i];
                const next = path[i + 1];
                
                // Apply smoothing
                smoothedPoint.x = curr.x * (1 - smoothingFactor) + 
                                (prev.x + next.x) / 2 * smoothingFactor;
                smoothedPoint.y = curr.y * (1 - smoothingFactor) + 
                                (prev.y + next.y) / 2 * smoothingFactor;
            }
            
            smoothedPath.push(smoothedPoint);
        }
        
        return smoothedPath;
    }

    /**
     * Generate control point for Bezier curve
     */
    generateControlPoint(startPos, endPos, type) {
        const midX = (startPos.x + endPos.x) / 2;
        const midY = (startPos.y + endPos.y) / 2;
        const distance = this.calculateDistance(startPos, endPos);
        
        switch (type) {
            case 'mid':
                return {
                    x: midX + (Math.random() - 0.5) * distance * 0.3,
                    y: midY + (Math.random() - 0.5) * distance * 0.3
                };
            case 'random':
                return {
                    x: startPos.x + (endPos.x - startPos.x) * (0.3 + Math.random() * 0.4),
                    y: startPos.y + (endPos.y - startPos.y) * (0.3 + Math.random() * 0.4)
                };
            default:
                return { x: midX, y: midY };
        }
    }

    /**
     * Calculate cubic Bezier point
     */
    cubicBezier(p0, p1, p2, p3, t) {
        const u = 1 - t;
        const tt = t * t;
        const uu = u * u;
        const uuu = uu * u;
        const ttt = tt * t;
        
        return {
            x: uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
            y: uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y
        };
    }

    /**
     * Generate jitter for realistic movement
     */
    generateJitter(options, intensity = 1) {
        const baseJitter = this.physicsConfig.jitterFactor * intensity;
        const handTremor = this.physicsConfig.handTremor * this.currentState.fatigue;
        
        return (Math.random() - 0.5) * (baseJitter + handTremor);
    }

    /**
     * Generate micro-adjustment for precise movement
     */
    generateMicroAdjustment(step, totalSteps) {
        const frequency = 0.1;
        const amplitude = 2;
        
        return {
            x: Math.sin(step * frequency) * amplitude * (1 - step / totalSteps),
            y: Math.cos(step * frequency) * amplitude * (1 - step / totalSteps)
        };
    }

    /**
     * Divide path into segments
     */
    dividePathIntoSegments(startPos, endPos, numSegments) {
        const segments = [];
        const segmentLength = this.calculateDistance(startPos, endPos) / numSegments;
        
        for (let i = 0; i < numSegments; i++) {
            const t1 = i / numSegments;
            const t2 = (i + 1) / numSegments;
            
            segments.push({
                start: {
                    x: startPos.x + (endPos.x - startPos.x) * t1,
                    y: startPos.y + (endPos.y - startPos.y) * t1
                },
                end: {
                    x: startPos.x + (endPos.x - startPos.x) * t2,
                    y: startPos.y + (endPos.y - startPos.y) * t2
                }
            });
        }
        
        return segments;
    }

    /**
     * Calculate distance between two points
     */
    calculateDistance(pos1, pos2) {
        return Math.sqrt((pos2.x - pos1.x) ** 2 + (pos2.y - pos1.y) ** 2);
    }

    /**
     * Easing functions
     */
    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    easeOutQuart(t) {
        return 1 - Math.pow(1 - t, 4);
    }

    /**
     * Apply momentum to movement
     */
    applyMomentum(velocity) {
        this.currentState.velocity.x += velocity.x * this.physicsConfig.momentumTransfer;
        this.currentState.velocity.y += velocity.y * this.physicsConfig.momentumTransfer;
        this.currentState.lastMoveTime = Date.now();
    }

    /**
     * Get current physics state
     */
    getPhysicsState() {
        return {
            position: { ...this.currentState.position },
            velocity: { ...this.currentState.velocity },
            fatigue: this.currentState.fatigue,
            config: { ...this.physicsConfig }
        };
    }

    /**
     * Update physics configuration
     */
    updatePhysicsConfig(newConfig) {
        this.physicsConfig = { ...this.physicsConfig, ...newConfig };
    }

    /**
     * Reset physics state
     */
    resetPhysicsState() {
        this.currentState = {
            position: { x: 0, y: 0 },
            velocity: { x: 0, y: 0 },
            acceleration: { x: 0, y: 0 },
            fatigue: 0,
            lastMoveTime: 0
        };
    }
}

// Export for use in other modules with enhanced stealth protection
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdvancedMousePhysics;
} else if (typeof window !== 'undefined' && !window.AdvancedMousePhysics) {
    window.AdvancedMousePhysics = AdvancedMousePhysics;
}
