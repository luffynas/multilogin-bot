/**
 * Stealth Monitor - Enhanced Monitoring dan menghindari deteksi bot
 * ENHANCED VERSION with comprehensive fixes and improvements
 */

class StealthMonitor {
    constructor() {
        this.isMonitoring = false;
        this.riskLevel = 'low';
        this.behaviorPatterns = [];
        this.detectionSignals = [];
        this.lastActivity = Date.now();
        this.sessionStartTime = Date.now();
        
        // Enhanced configuration with adaptive thresholds
        this.config = {
            // Memory management
            maxPatterns: 50,           // Reduced from 100
            maxMovements: 30,          // Reduced from 50
            maxSignals: 25,            // Reduced from 50
            maxNetworkRequests: 15,    // New: limit network tracking
            
            // Performance optimization
            monitoringInterval: 10000,  // Increased from 5000ms (10 seconds)
            cleanupInterval: 30000,     // New: cleanup every 30s
            analysisThreshold: 5,      // Minimum patterns for analysis
            
            // Adaptive thresholds
            enableAdaptiveThresholds: true,
            sessionDurationMultiplier: 2, // Max 2x after 5 minutes
            
            // Advanced features
            enableMachineLearning: true,
            enableDynamicAdjustment: true,
            enableAdvancedStealth: true,
            
            // Risk management
            riskThresholds: {
            low: 0.3,
            medium: 0.6,
            high: 0.8
            }
        };
        
        // Performance optimization: data structures
        this.mouseMovements = [];
        this.keyPresses = [];
        this.scrollEvents = [];
        this.networkRequests = [];
        
        // Missing properties for compatibility
        this.lastScrollY = 0;
        
        // Advanced stealth features
        this.behaviorBaseline = this.initializeBehaviorBaseline();
        this.riskHistory = [];
        this.adaptationHistory = [];
        
        // Memory management
        this.lastCleanup = Date.now();
        this.memoryUsage = 0;
        
        // Dynamic behavior adjustment
        this.currentDelayMultiplier = 1;
        this.behaviorRandomization = 0.1;
        this.stealthMode = 'normal';
        
        console.log('🚀 Enhanced Stealth Monitor initialized with config:', this.config);
    }

    initializeBehaviorBaseline() {
        // Initialize baseline behavior patterns for machine learning
        return {
            mouseMovement: {
                averageSpeed: 0,
                variance: 0,
                naturalPauses: 0,
                directionChanges: 0
            },
            keyboardActivity: {
                averageInterval: 0,
                typoRate: 0.15, // 15% typo rate is natural
                pausePatterns: 0
            },
            scrollBehavior: {
                averageSpeed: 0,
                pauseFrequency: 0,
                naturalStops: 0
            },
            timingPatterns: {
                naturalVariance: 0,
                humanDelays: 0,
                irregularity: 0
            }
        };
    }

    // Enhanced memory management
    cleanupMemory() {
        const now = Date.now();
        const cutoffTime = now - (this.config.cleanupInterval * 2);

        // Cleanup old behavior patterns
        this.behaviorPatterns = this.behaviorPatterns.filter(pattern => 
            pattern.timestamp > cutoffTime
        );

        // Cleanup old detection signals
        this.detectionSignals = this.detectionSignals.filter(signal => 
            signal.timestamp > cutoffTime
        );

        // Cleanup old mouse movements
        this.mouseMovements = this.mouseMovements.filter(movement => 
            movement.timestamp > cutoffTime
        );

        // Cleanup old key presses
        this.keyPresses = this.keyPresses.filter(press => 
            press.timestamp > cutoffTime
        );

        // Cleanup old scroll events
        this.scrollEvents = this.scrollEvents.filter(event => 
            event.timestamp > cutoffTime
        );

        // Cleanup old network requests
        this.networkRequests = this.networkRequests.filter(request => 
            request.timestamp > cutoffTime
        );

        // Update memory usage tracking
        this.memoryUsage = this.calculateMemoryUsage();
        this.lastCleanup = now;

        console.log('🧹 Memory cleanup completed. Current usage:', this.memoryUsage);
    }

    calculateMemoryUsage() {
        const patternsSize = this.behaviorPatterns.length;
        const signalsSize = this.detectionSignals.length;
        const movementsSize = this.mouseMovements.length;
        const keysSize = this.keyPresses.length;
        const scrollsSize = this.scrollEvents.length;
        const networkSize = this.networkRequests.length;

        return patternsSize + signalsSize + movementsSize + keysSize + scrollsSize + networkSize;
    }

    // Adaptive threshold management
    getAdaptiveThresholds() {
        if (!this.config.enableAdaptiveThresholds) {
            return this.config.riskThresholds;
        }

        const sessionDuration = Date.now() - this.sessionStartTime;
        const timeMultiplier = Math.min(sessionDuration / 300000, this.config.sessionDurationMultiplier); // Max after 5 minutes

        return {
            low: this.config.riskThresholds.low * timeMultiplier,
            medium: this.config.riskThresholds.medium * timeMultiplier,
            high: this.config.riskThresholds.high * timeMultiplier
        };
    }

    initialize() {
        console.log('🛡️ Initializing enhanced stealth monitor...');
        
        this.startMonitoring();
        this.setupDetectionListeners();
        this.setupMemoryManagement();
        
        console.log('✅ Enhanced stealth monitor initialized');
    }

    startMonitoring() {
        if (this.isMonitoring) return;
        
        this.isMonitoring = true;
        
        // Enhanced monitoring with longer intervals
        this.monitoringInterval = setInterval(() => {
            this.analyzeBehavior();
            this.checkDetectionSignals();
            this.updateRiskLevel();
            this.performAdaptiveAdjustments();
        }, this.config.monitoringInterval);
        
        console.log('🔍 Enhanced stealth monitoring started');
    }

    stopMonitoring() {
        if (!this.isMonitoring) return;
        
        this.isMonitoring = false;
        
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        
        console.log('⏹️ Enhanced stealth monitoring stopped');
    }

    setupMemoryManagement() {
        // Setup automatic memory cleanup
        setInterval(() => {
            this.cleanupMemory();
        }, this.config.cleanupInterval);
        
        console.log('🧹 Memory management setup completed');
    }

    setupDetectionListeners() {
        // Enhanced monitoring for common bot detection signals
        this.monitorMouseMovements();
        this.monitorKeyboardActivity();
        this.monitorScrollBehavior();
        this.monitorTimingPatterns();
        this.monitorNetworkActivity();
        this.monitorAdvancedPatterns();
    }

    monitorMouseMovements() {
        let lastMouseX = 0;
        let lastMouseY = 0;

        document.addEventListener('mousemove', (event) => {
            const currentTime = Date.now();
            const deltaX = event.clientX - lastMouseX;
            const deltaY = event.clientY - lastMouseY;
            const deltaTime = currentTime - this.lastActivity;

            this.mouseMovements.push({
                deltaX,
                deltaY,
                deltaTime,
                timestamp: currentTime,
                clientX: event.clientX,
                clientY: event.clientY
            });

            // Enhanced memory management
            if (this.mouseMovements.length > this.config.maxMovements) {
                this.mouseMovements.shift();
            }

            lastMouseX = event.clientX;
            lastMouseY = event.clientY;
            this.lastActivity = currentTime;

            // Analyze mouse movement patterns with enhanced logic
            if (this.mouseMovements.length >= this.config.analysisThreshold) {
                this.analyzeMousePatternsEnhanced(this.mouseMovements);
            }
        });
    }

    monitorKeyboardActivity() {
        let lastKeyTime = 0;

        document.addEventListener('keydown', (event) => {
            const currentTime = Date.now();
            const deltaTime = currentTime - lastKeyTime;

            this.keyPresses.push({
                key: event.key,
                deltaTime,
                timestamp: currentTime,
                keyCode: event.keyCode,
                isTypo: this.detectTypo(event.key, event.keyCode)
            });

            // Enhanced memory management
            if (this.keyPresses.length > 20) {
                this.keyPresses.shift();
            }

            lastKeyTime = currentTime;
            this.lastActivity = currentTime;

            // Analyze typing patterns with enhanced logic
            if (this.keyPresses.length >= this.config.analysisThreshold) {
                this.analyzeTypingPatternsEnhanced(this.keyPresses);
            }
        });
    }

    monitorScrollBehavior() {
        let lastScrollTime = 0;

        window.addEventListener('scroll', (event) => {
            const currentTime = Date.now();
            const deltaTime = currentTime - lastScrollTime;

            this.scrollEvents.push({
                scrollY: window.scrollY,
                deltaTime,
                timestamp: currentTime,
                scrollDirection: this.getScrollDirection(window.scrollY, this.lastScrollY)
            });

            // Enhanced memory management
            if (this.scrollEvents.length > 30) {
                this.scrollEvents.shift();
            }

            lastScrollTime = currentTime;
            this.lastActivity = currentTime;

            // Analyze scroll patterns with enhanced logic
            if (this.scrollEvents.length >= this.config.analysisThreshold) {
                this.analyzeScrollPatternsEnhanced(this.scrollEvents);
            }
        });
    }

    monitorTimingPatterns() {
        // Enhanced timing pattern monitoring
        setInterval(() => {
            this.checkTimingPatternsEnhanced();
        }, 15000); // Increased from 10 seconds
    }

    monitorNetworkActivity() {
        // Enhanced network monitoring with better interception
        const originalFetch = window.fetch;
        const originalXHR = window.XMLHttpRequest;

        // Intercept fetch requests with enhanced tracking
        window.fetch = (...args) => {
            this.recordNetworkRequestEnhanced('fetch', args);
            return originalFetch.apply(this, args);
        };

        // Intercept XHR requests with enhanced tracking
        const originalOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(...args) {
            this.addEventListener('load', () => {
                this.recordNetworkRequestEnhanced('xhr', args);
            });
            return originalOpen.apply(this, args);
        };
    }

    monitorAdvancedPatterns() {
        // Monitor for advanced bot detection patterns
        setInterval(() => {
            this.checkAdvancedPatterns();
        }, 20000); // Every 20 seconds
    }

    // Enhanced analysis methods
    analyzeMousePatternsEnhanced(movements) {
        if (movements.length < this.config.analysisThreshold) return;

        const suspiciousPatterns = [];
        const thresholds = this.getAdaptiveThresholds();

        // Enhanced variance calculation
        const timeIntervals = movements.map(m => m.deltaTime);
        const avgInterval = timeIntervals.reduce((a, b) => a + b, 0) / timeIntervals.length;
        const variance = timeIntervals.reduce((sum, interval) => 
            sum + Math.pow(interval - avgInterval, 2), 0) / timeIntervals.length;

        // Adaptive variance check (more realistic)
        if (variance < (thresholds.low * 1000)) {
            suspiciousPatterns.push('regular_mouse_movements');
        }

        // Enhanced straight line detection
        const straightLines = this.detectStraightLineMovementsEnhanced(movements);
        if (straightLines > 0.9) { // Increased threshold
            suspiciousPatterns.push('straight_line_movements');
        }

        // Check for natural movement patterns
        const naturalPatterns = this.detectNaturalMousePatterns(movements);
        if (naturalPatterns.length > 0) {
            // Reduce risk if natural patterns detected
            this.reduceRiskLevel('natural_mouse_patterns');
        }

        if (suspiciousPatterns.length > 0) {
            this.addDetectionSignalEnhanced('mouse_patterns', suspiciousPatterns);
        }
    }

    analyzeTypingPatternsEnhanced(keyPresses) {
        if (keyPresses.length < this.config.analysisThreshold) return;

        const suspiciousPatterns = [];
        const thresholds = this.getAdaptiveThresholds();

        // Enhanced typing speed analysis
        const timeIntervals = keyPresses.map(k => k.deltaTime);
        const avgInterval = timeIntervals.reduce((a, b) => a + b, 0) / timeIntervals.length;

        // More realistic typing speed threshold
        if (avgInterval < (thresholds.low * 100)) {
            suspiciousPatterns.push('too_fast_typing');
        }

        // Enhanced typo detection
        const hasTypos = this.detectTypingMistakesEnhanced(keyPresses);
        if (!hasTypos) {
            suspiciousPatterns.push('no_typing_mistakes');
        }

        // Check for natural typing patterns
        const naturalPatterns = this.detectNaturalTypingPatterns(keyPresses);
        if (naturalPatterns.length > 0) {
            this.reduceRiskLevel('natural_typing_patterns');
        }

        if (suspiciousPatterns.length > 0) {
            this.addDetectionSignalEnhanced('typing_patterns', suspiciousPatterns);
        }
    }

    analyzeScrollPatternsEnhanced(scrollEvents) {
        if (scrollEvents.length < this.config.analysisThreshold) return;

        const suspiciousPatterns = [];
        const thresholds = this.getAdaptiveThresholds();

        // Enhanced scroll speed analysis
        const timeIntervals = scrollEvents.map(s => s.deltaTime);
        const avgInterval = timeIntervals.reduce((a, b) => a + b, 0) / timeIntervals.length;

        // More realistic scroll speed threshold
        if (avgInterval < (thresholds.low * 200)) {
            suspiciousPatterns.push('too_fast_scrolling');
        }

        // Enhanced pause detection
        const hasPauses = this.detectScrollPausesEnhanced(scrollEvents);
        if (!hasPauses) {
            suspiciousPatterns.push('no_scroll_pauses');
        }

        // Check for natural scroll patterns
        const naturalPatterns = this.detectNaturalScrollPatterns(scrollEvents);
        if (naturalPatterns.length > 0) {
            this.reduceRiskLevel('natural_scroll_patterns');
        }

        if (suspiciousPatterns.length > 0) {
            this.addDetectionSignalEnhanced('scroll_patterns', suspiciousPatterns);
        }
    }

    // Enhanced detection methods
    detectStraightLineMovementsEnhanced(movements) {
        let straightCount = 0;
        const total = movements.length - 1;

        for (let i = 1; i < movements.length; i++) {
            const prev = movements[i - 1];
            const curr = movements[i];

            const angle = Math.atan2(curr.deltaY, curr.deltaX);
            const prevAngle = Math.atan2(prev.deltaY, prev.deltaX);
            const angleDiff = Math.abs(angle - prevAngle);

            // More realistic angle threshold
            if (angleDiff < 0.05) { // Reduced from 0.1
                straightCount++;
            }
        }

        return straightCount / total;
    }

    detectTypingMistakesEnhanced(keyPresses) {
        // Enhanced typo detection
        const backspaceCount = keyPresses.filter(k => k.key === 'Backspace').length;
        const totalKeys = keyPresses.length;
        
        // Natural typo rate is around 5-15%
        const typoRate = backspaceCount / totalKeys;
        return typoRate >= 0.05;
    }

    detectScrollPausesEnhanced(scrollEvents) {
        // Enhanced pause detection
        const pauses = scrollEvents.filter(s => s.deltaTime > 800); // Increased from 500ms
        return pauses.length > 0;
    }

    // Natural pattern detection
    detectNaturalMousePatterns(movements) {
        const naturalPatterns = [];
        
        // Check for natural pauses
        const pauses = movements.filter(m => m.deltaTime > 1000);
        if (pauses.length > 0) {
            naturalPatterns.push('natural_pauses');
        }

        // Check for direction changes
        let directionChanges = 0;
        for (let i = 1; i < movements.length; i++) {
            const prev = movements[i - 1];
            const curr = movements[i];
            
            if ((prev.deltaX > 0 && curr.deltaX < 0) || 
                (prev.deltaY > 0 && curr.deltaY < 0)) {
                directionChanges++;
            }
        }
        
        if (directionChanges > 3) {
            naturalPatterns.push('direction_changes');
        }

        return naturalPatterns;
    }

    detectNaturalTypingPatterns(keyPresses) {
        const naturalPatterns = [];
        
        // Check for natural typing rhythm
        const intervals = keyPresses.map(k => k.deltaTime);
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        
        if (avgInterval > 100 && avgInterval < 500) {
            naturalPatterns.push('natural_rhythm');
        }

        // Check for pause patterns
        const longPauses = intervals.filter(i => i > 2000);
        if (longPauses.length > 0) {
            naturalPatterns.push('thinking_pauses');
        }

        return naturalPatterns;
    }

    detectNaturalScrollPatterns(scrollEvents) {
        const naturalPatterns = [];
        
        // Check for natural scroll stops
        const stops = scrollEvents.filter(s => s.deltaTime > 1500);
        if (stops.length > 0) {
            naturalPatterns.push('natural_stops');
        }

        // Check for variable scroll speed
        const speeds = scrollEvents.map(s => s.deltaTime);
        const variance = this.calculateVariance(speeds);
        
        if (variance > 100000) { // High variance indicates natural behavior
            naturalPatterns.push('variable_speed');
        }

        return naturalPatterns;
    }

    // Utility methods
    calculateVariance(values) {
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        return values.reduce((sum, value) => sum + Math.pow(value - avg, 2), 0) / values.length;
    }

    getScrollDirection(currentY, lastY) {
        if (!lastY) return 'unknown';
        return currentY > lastY ? 'down' : 'up';
    }

    detectTypo(key, keyCode) {
        // Simple typo detection
        return key === 'Backspace' || keyCode === 8;
    }

    // Enhanced risk management
    reduceRiskLevel(reason) {
        const currentRisk = this.getCurrentRiskScore();
        const reduction = 0.1; // Reduce risk by 10%
        
        this.riskLevel = Math.max(0, currentRisk - reduction);
        console.log(`🟢 Risk reduced due to ${reason}. New level: ${this.riskLevel}`);
    }

    getCurrentRiskScore() {
        const recentSignals = this.detectionSignals.filter(signal => 
            Date.now() - signal.timestamp < 300000 // Last 5 minutes
        );

        if (recentSignals.length === 0) return 0;

        const totalRisk = recentSignals.reduce((sum, signal) => sum + signal.risk, 0);
        return totalRisk / recentSignals.length;
    }

    // Enhanced detection signal management
    addDetectionSignalEnhanced(type, patterns) {
        const signal = {
            type,
            patterns,
            timestamp: Date.now(),
            risk: this.calculateSignalRiskEnhanced(patterns),
            context: this.getSignalContext()
        };

        this.detectionSignals.push(signal);

        // Enhanced memory management
        if (this.detectionSignals.length > this.config.maxSignals) {
            this.detectionSignals.shift();
        }

        console.log('⚠️ Enhanced detection signal:', signal);
    }

    calculateSignalRiskEnhanced(patterns) {
        const riskScores = {
            'regular_mouse_movements': 0.2,    // Reduced from 0.3
            'straight_line_movements': 0.3,    // Reduced from 0.4
            'too_fast_typing': 0.2,            // Reduced from 0.3
            'no_typing_mistakes': 0.1,         // Reduced from 0.2
            'too_fast_scrolling': 0.2,         // Reduced from 0.3
            'no_scroll_pauses': 0.1,           // Reduced from 0.2
            'regular_intervals': 0.3,          // Reduced from 0.5
            'too_many_requests': 0.3           // Reduced from 0.4
        };

        return patterns.reduce((total, pattern) => {
            return total + (riskScores[pattern] || 0.05); // Reduced default risk
        }, 0);
    }

    getSignalContext() {
        return {
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString(),
            sessionDuration: Date.now() - this.sessionStartTime
        };
    }

    // Enhanced network monitoring
    recordNetworkRequestEnhanced(type, args) {
        const request = {
            type,
            args,
            timestamp: Date.now(),
            url: args[0] || 'unknown'
        };

        this.networkRequests.push(request);

        // Enhanced memory management
        if (this.networkRequests.length > this.config.maxNetworkRequests) {
            this.networkRequests.shift();
        }

        // Check for suspicious patterns
        this.analyzeNetworkPatterns();
    }

    analyzeNetworkPatterns() {
        const recentRequests = this.getRecentNetworkRequests();
        
        if (recentRequests.length > 15) { // Reduced threshold
            this.addDetectionSignalEnhanced('network_patterns', ['too_many_requests']);
        }
    }

    getRecentNetworkRequests() {
        const currentTime = Date.now();
        return this.networkRequests.filter(r => 
            currentTime - r.timestamp < 60000
        );
    }

    // Enhanced timing pattern analysis
    checkTimingPatternsEnhanced() {
        const currentTime = Date.now();
        const recentPatterns = this.behaviorPatterns.filter(p => 
            currentTime - p.timestamp < 60000 // Last minute
        );

        if (recentPatterns.length > 8) { // Reduced threshold
            const intervals = [];
            for (let i = 1; i < recentPatterns.length; i++) {
                intervals.push(recentPatterns[i].timestamp - recentPatterns[i - 1].timestamp);
            }

            const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
            const variance = this.calculateVariance(intervals);

            // More realistic variance threshold
            if (variance < 2000) { // Increased from 1000
                this.addDetectionSignalEnhanced('timing_patterns', ['regular_intervals']);
            }
        }
    }

    // Advanced pattern detection
    checkAdvancedPatterns() {
        // Check for machine learning patterns
        if (this.config.enableMachineLearning) {
            this.analyzeMachineLearningPatterns();
        }

        // Check for behavioral anomalies
        this.checkBehavioralAnomalies();
    }

    analyzeMachineLearningPatterns() {
        // Simple ML pattern analysis
        const patterns = this.behaviorPatterns.slice(-10);
        
        if (patterns.length >= 10) {
            const avgRisk = patterns.reduce((sum, p) => sum + p.riskLevel, 0) / patterns.length;
            
            if (avgRisk > 0.7) {
                this.triggerAdvancedStealthMode();
            }
        }
    }

    checkBehavioralAnomalies() {
        // Check for unusual behavior patterns
        const recentActivity = Date.now() - this.lastActivity;
        
        if (recentActivity > 300000) { // 5 minutes of inactivity
            this.addDetectionSignalEnhanced('behavioral_anomalies', ['extended_inactivity']);
        }
    }

    // Advanced stealth mode
    triggerAdvancedStealthMode() {
        if (this.stealthMode === 'advanced') return;
        
        this.stealthMode = 'advanced';
        this.behaviorRandomization = 0.3; // Increase randomization
        this.currentDelayMultiplier = 2;   // Increase delays
        
        console.log('🚀 Advanced stealth mode activated');
    }

    // Enhanced behavior analysis
    analyzeBehavior() {
        const currentTime = Date.now();
        const timeSinceLastActivity = currentTime - this.lastActivity;

        // Enhanced behavior pattern recording
        this.behaviorPatterns.push({
            timestamp: currentTime,
            timeSinceLastActivity,
            riskLevel: this.riskLevel,
            stealthMode: this.stealthMode,
            userAgent: navigator.userAgent,
            screenResolution: `${screen.width}x${screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            memoryUsage: this.memoryUsage
        });

        // Enhanced memory management
        if (this.behaviorPatterns.length > this.config.maxPatterns) {
            this.behaviorPatterns.shift();
        }
    }

    // Enhanced risk level checking
    checkDetectionSignals() {
        const recentSignals = this.detectionSignals.filter(signal => 
            Date.now() - signal.timestamp < 300000 // Last 5 minutes
        );

        const totalRisk = recentSignals.reduce((sum, signal) => sum + signal.risk, 0);
        const averageRisk = totalRisk / Math.max(recentSignals.length, 1);

        const thresholds = this.getAdaptiveThresholds();

        if (averageRisk > thresholds.high) {
            this.riskLevel = 'high';
            this.triggerHighRiskResponse();
        } else if (averageRisk > thresholds.medium) {
            this.riskLevel = 'medium';
            this.triggerMediumRiskResponse();
        } else {
            this.riskLevel = 'low';
        }

        // Update risk history
        this.riskHistory.push({
            timestamp: Date.now(),
            riskLevel: this.riskLevel,
            averageRisk: averageRisk
        });

        // Keep only recent history
        if (this.riskHistory.length > 20) {
            this.riskHistory.shift();
        }
    }

    // Enhanced risk responses
    triggerHighRiskResponse() {
        console.log('🚨 HIGH RISK DETECTED - Implementing emergency measures');
        
        this.stealthMode = 'emergency';
        this.currentDelayMultiplier = 5;
        this.behaviorRandomization = 0.5;
        
        // Implement emergency measures
        this.slowDownActivity();
        this.addRandomDelays();
        this.simulateHumanErrors();
        this.activateEmergencyStealth();
    }

    triggerMediumRiskResponse() {
        console.log('⚠️ MEDIUM RISK DETECTED - Adjusting behavior');
        
        this.stealthMode = 'caution';
        this.currentDelayMultiplier = 2;
        this.behaviorRandomization = 0.2;
        
        // Implement medium risk measures
        this.addRandomDelays();
        this.simulateHumanErrors();
    }

    // Enhanced stealth measures
    slowDownActivity() {
        this.currentDelayMultiplier = 3;
        console.log('🐌 Activity slowed down for stealth');
    }

    addRandomDelays() {
        const baseDelay = 1000 + Math.random() * 2000; // 1-3 seconds
        const adjustedDelay = baseDelay * this.currentDelayMultiplier;
        
        setTimeout(() => {
            console.log('⏱️ Random delay completed');
        }, adjustedDelay);
    }

    simulateHumanErrors() {
        if (Math.random() < 0.15) { // 15% chance
            console.log('🤦 Simulating human error...');
            
            // Simulate various human errors
            const errors = [
                'slight_misclick',
                'hesitation_pause',
                'double_click',
                'scroll_overshoot'
            ];
            
            const randomError = errors[Math.floor(Math.random() * errors.length)];
            console.log(`🤦 Simulated error: ${randomError}`);
        }
    }

    activateEmergencyStealth() {
        console.log('🚨 Emergency stealth mode activated');
        
        // Implement extreme stealth measures
        this.behaviorRandomization = 0.8;
        this.currentDelayMultiplier = 10;
        
        // Add extreme delays
        setTimeout(() => {
            console.log('🚨 Emergency measures completed');
        }, 5000);
    }

    // Enhanced performance monitoring
    getStealthStats() {
        return {
            riskLevel: this.riskLevel,
            stealthMode: this.stealthMode,
            detectionSignals: this.detectionSignals.length,
            behaviorPatterns: this.behaviorPatterns.length,
            memoryUsage: this.memoryUsage,
            lastActivity: this.lastActivity,
            timeSinceLastActivity: Date.now() - this.lastActivity,
            sessionDuration: Date.now() - this.sessionStartTime,
            riskHistory: this.riskHistory.length,
            adaptationHistory: this.adaptationHistory.length
        };
    }

    // Configuration management
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        console.log('⚙️ Stealth Monitor config updated:', this.config);
    }

    getConfig() {
        return { ...this.config };
    }

    // Performance monitoring
    getPerformanceMetrics() {
        return {
            memoryUsage: this.memoryUsage,
            patternsCount: this.behaviorPatterns.length,
            signalsCount: this.detectionSignals.length,
            riskLevel: this.riskLevel,
            stealthMode: this.stealthMode,
            lastCleanup: this.lastCleanup
        };
    }

    // Utility methods
    isHighRisk() {
        return this.riskLevel === 'high';
    }

    isMediumRisk() {
        return this.riskLevel === 'medium';
    }

    isLowRisk() {
        return this.riskLevel === 'low';
    }

    // Dynamic behavior adjustment
    performAdaptiveAdjustments() {
        if (!this.config.enableDynamicAdjustment) return;

        const currentRisk = this.getCurrentRiskScore();
        
        if (currentRisk > 0.6) {
            this.increaseStealthMeasures();
        } else if (currentRisk < 0.2) {
            this.decreaseStealthMeasures();
        }

        // Record adaptation
        this.adaptationHistory.push({
            timestamp: Date.now(),
            riskLevel: currentRisk,
            adjustment: this.currentDelayMultiplier
        });

        // Keep only recent adaptations
        if (this.adaptationHistory.length > 10) {
            this.adaptationHistory.shift();
        }
    }

    increaseStealthMeasures() {
        this.currentDelayMultiplier = Math.min(this.currentDelayMultiplier * 1.2, 5);
        this.behaviorRandomization = Math.min(this.behaviorRandomization * 1.1, 0.5);
        console.log('🛡️ Stealth measures increased');
    }

    decreaseStealthMeasures() {
        this.currentDelayMultiplier = Math.max(this.currentDelayMultiplier * 0.9, 1);
        this.behaviorRandomization = Math.max(this.behaviorRandomization * 0.9, 0.05);
        console.log('🛡️ Stealth measures decreased');
    }

    // Missing methods implementation
    updateRiskLevel() {
        try {
            // Update risk level based on current behavior patterns
            const currentRisk = this.getCurrentRiskScore();
            
            if (currentRisk > this.config.riskThresholds.high) {
                this.riskLevel = 'high';
                this.triggerHighRiskResponse();
            } else if (currentRisk > this.config.riskThresholds.medium) {
                this.riskLevel = 'medium';
                this.triggerMediumRiskResponse();
            } else {
                this.riskLevel = 'low';
            }
            
            console.log(`🛡️ Risk level updated: ${this.riskLevel} (score: ${currentRisk.toFixed(2)})`);
        } catch (error) {
            console.warn('Error updating risk level:', error);
        }
    }

    checkPerformanceIssues() {
        try {
            // Check for performance issues in stealth monitoring
            const issues = [];
            
            // Check memory usage
            if (this.memoryUsage > 100) {
                issues.push({
                    type: 'memory_usage',
                    severity: 'medium',
                    message: 'High memory usage detected',
                    action: 'cleanup_memory'
                });
            }
            
            // Check for excessive detection signals
            if (this.detectionSignals.length > 20) {
                issues.push({
                    type: 'detection_signals',
                    severity: 'high',
                    message: 'Too many detection signals',
                    action: 'reduce_monitoring'
                });
            }
            
            // Check for behavioral anomalies
            if (this.behaviorPatterns.length > 40) {
                issues.push({
                    type: 'behavior_patterns',
                    severity: 'medium',
                    message: 'Excessive behavior patterns',
                    action: 'cleanup_patterns'
                });
            }
            
            // Log issues if any
            if (issues.length > 0) {
                console.log('⚠️ Performance issues detected in stealth monitor:', issues);
                
                // Trigger cleanup if needed
                if (issues.some(issue => issue.action === 'cleanup_memory')) {
                    this.cleanupMemory();
                }
            }
        } catch (error) {
            console.warn('Error checking performance issues:', error);
        }
    }

    analyzeHistoricalPerformance() {
        try {
            // Analyze historical performance for stealth optimization
            if (this.riskHistory.length === 0) {
                return {
                    averageRisk: 0,
                    riskTrend: 'stable',
                    adaptationCount: 0
                };
            }
            
            const recentRisk = this.riskHistory.slice(-10); // Last 10 entries
            const avgRisk = recentRisk.reduce((sum, entry) => sum + entry.riskLevel, 0) / recentRisk.length;
            
            // Calculate risk trend
            let riskTrend = 'stable';
            if (recentRisk.length >= 2) {
                const firstRisk = recentRisk[0].riskLevel;
                const lastRisk = recentRisk[recentRisk.length - 1].riskLevel;
                
                if (lastRisk > firstRisk * 1.2) {
                    riskTrend = 'increasing';
                } else if (lastRisk < firstRisk * 0.8) {
                    riskTrend = 'decreasing';
                }
            }
            
            return {
                averageRisk: avgRisk,
                riskTrend: riskTrend,
                adaptationCount: this.adaptationHistory.length
            };
        } catch (error) {
            console.warn('Error analyzing historical performance:', error);
            return {
                averageRisk: 0,
                riskTrend: 'stable',
                adaptationCount: 0
            };
        }
    }

    optimizeIntervals(historicalPerformance) {
        try {
            // Optimize monitoring intervals based on historical performance
            if (historicalPerformance.riskTrend === 'increasing') {
                // Reduce intervals for better monitoring
                this.config.monitoringInterval = Math.max(5000, this.config.monitoringInterval * 0.8);
                this.config.cleanupInterval = Math.max(20000, this.config.cleanupInterval * 0.8);
                console.log('⚡ Intervals optimized for increased risk monitoring');
            } else if (historicalPerformance.riskTrend === 'decreasing') {
                // Increase intervals for efficiency
                this.config.monitoringInterval = Math.min(20000, this.config.monitoringInterval * 1.2);
                this.config.cleanupInterval = Math.min(60000, this.config.cleanupInterval * 1.2);
                console.log('⚡ Intervals optimized for efficiency');
            }
        } catch (error) {
            console.warn('Error optimizing intervals:', error);
        }
    }

    applyAdaptiveLimits(adaptiveLimits) {
        try {
            // Apply adaptive limits to stealth monitoring
            if (adaptiveLimits.riskThresholds) {
                this.config.riskThresholds = {
                    ...this.config.riskThresholds,
                    ...adaptiveLimits.riskThresholds
                };
            }
            
            if (adaptiveLimits.monitoringInterval) {
                this.config.monitoringInterval = Math.max(5000, 
                    Math.min(30000, adaptiveLimits.monitoringInterval));
            }
            
            if (adaptiveLimits.cleanupInterval) {
                this.config.cleanupInterval = Math.max(15000, 
                    Math.min(60000, adaptiveLimits.cleanupInterval));
            }
            
            console.log('✅ Adaptive limits applied to stealth monitor:', adaptiveLimits);
        } catch (error) {
            console.warn('Error applying adaptive limits:', error);
        }
    }
}
