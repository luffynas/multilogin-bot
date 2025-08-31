/**
 * Stealth Monitor - Monitoring dan menghindari deteksi bot
 */

class StealthMonitor {
    constructor() {
        this.isMonitoring = false;
        this.riskLevel = 'low';
        this.behaviorPatterns = [];
        this.detectionSignals = [];
        this.lastActivity = Date.now();
        
        this.riskThresholds = {
            low: 0.3,
            medium: 0.6,
            high: 0.8
        };
        
        this.monitoringInterval = null;
    }

    initialize() {
        console.log('🛡️ Initializing stealth monitor...');
        
        this.startMonitoring();
        this.setupDetectionListeners();
        
        console.log('✅ Stealth monitor initialized');
    }

    startMonitoring() {
        if (this.isMonitoring) return;
        
        this.isMonitoring = true;
        
        // Monitor behavior patterns every 5 seconds
        this.monitoringInterval = setInterval(() => {
            this.analyzeBehavior();
            this.checkDetectionSignals();
            this.updateRiskLevel();
        }, 5000);
        
        console.log('🔍 Stealth monitoring started');
    }

    stopMonitoring() {
        if (!this.isMonitoring) return;
        
        this.isMonitoring = false;
        
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        
        console.log('⏹️ Stealth monitoring stopped');
    }

    setupDetectionListeners() {
        // Monitor for common bot detection signals
        this.monitorMouseMovements();
        this.monitorKeyboardActivity();
        this.monitorScrollBehavior();
        this.monitorTimingPatterns();
        this.monitorNetworkActivity();
    }

    monitorMouseMovements() {
        let lastMouseX = 0;
        let lastMouseY = 0;
        let mouseMovements = [];

        document.addEventListener('mousemove', (event) => {
            const currentTime = Date.now();
            const deltaX = event.clientX - lastMouseX;
            const deltaY = event.clientY - lastMouseY;
            const deltaTime = currentTime - this.lastActivity;

            mouseMovements.push({
                deltaX,
                deltaY,
                deltaTime,
                timestamp: currentTime
            });

            // Keep only last 50 movements
            if (mouseMovements.length > 50) {
                mouseMovements.shift();
            }

            lastMouseX = event.clientX;
            lastMouseY = event.clientY;
            this.lastActivity = currentTime;

            // Analyze mouse movement patterns
            this.analyzeMousePatterns(mouseMovements);
        });
    }

    monitorKeyboardActivity() {
        let keyPresses = [];
        let lastKeyTime = 0;

        document.addEventListener('keydown', (event) => {
            const currentTime = Date.now();
            const deltaTime = currentTime - lastKeyTime;

            keyPresses.push({
                key: event.key,
                deltaTime,
                timestamp: currentTime
            });

            // Keep only last 20 key presses
            if (keyPresses.length > 20) {
                keyPresses.shift();
            }

            lastKeyTime = currentTime;
            this.lastActivity = currentTime;

            // Analyze typing patterns
            this.analyzeTypingPatterns(keyPresses);
        });
    }

    monitorScrollBehavior() {
        let scrollEvents = [];
        let lastScrollTime = 0;

        window.addEventListener('scroll', (event) => {
            const currentTime = Date.now();
            const deltaTime = currentTime - lastScrollTime;

            scrollEvents.push({
                scrollY: window.scrollY,
                deltaTime,
                timestamp: currentTime
            });

            // Keep only last 30 scroll events
            if (scrollEvents.length > 30) {
                scrollEvents.shift();
            }

            lastScrollTime = currentTime;
            this.lastActivity = currentTime;

            // Analyze scroll patterns
            this.analyzeScrollPatterns(scrollEvents);
        });
    }

    monitorTimingPatterns() {
        // Monitor for suspicious timing patterns
        const suspiciousPatterns = [
            'too_regular_intervals',
            'instant_responses',
            'no_human_delays'
        ];

        setInterval(() => {
            this.checkTimingPatterns(suspiciousPatterns);
        }, 10000);
    }

    monitorNetworkActivity() {
        // Monitor for suspicious network patterns
        const originalFetch = window.fetch;
        const originalXHR = window.XMLHttpRequest;

        // Intercept fetch requests
        window.fetch = (...args) => {
            this.recordNetworkRequest('fetch', args);
            return originalFetch.apply(this, args);
        };

        // Intercept XHR requests
        const originalOpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(...args) {
            this.addEventListener('load', () => {
                this.recordNetworkRequest('xhr', args);
            });
            return originalOpen.apply(this, args);
        };
    }

    analyzeBehavior() {
        const currentTime = Date.now();
        const timeSinceLastActivity = currentTime - this.lastActivity;

        // Record behavior pattern
        this.behaviorPatterns.push({
            timestamp: currentTime,
            timeSinceLastActivity,
            riskLevel: this.riskLevel,
            userAgent: navigator.userAgent,
            screenResolution: `${screen.width}x${screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        });

        // Keep only last 100 patterns
        if (this.behaviorPatterns.length > 100) {
            this.behaviorPatterns.shift();
        }
    }

    analyzeMousePatterns(movements) {
        if (movements.length < 10) return;

        // Check for suspicious patterns
        const suspiciousPatterns = [];

        // Check for too regular movements
        const timeIntervals = movements.map(m => m.deltaTime);
        const avgInterval = timeIntervals.reduce((a, b) => a + b, 0) / timeIntervals.length;
        const variance = timeIntervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / timeIntervals.length;

        if (variance < 100) { // Too regular
            suspiciousPatterns.push('regular_mouse_movements');
        }

        // Check for straight line movements
        const straightLines = this.detectStraightLineMovements(movements);
        if (straightLines > 0.7) {
            suspiciousPatterns.push('straight_line_movements');
        }

        if (suspiciousPatterns.length > 0) {
            this.addDetectionSignal('mouse_patterns', suspiciousPatterns);
        }
    }

    analyzeTypingPatterns(keyPresses) {
        if (keyPresses.length < 5) return;

        // Check for suspicious typing patterns
        const suspiciousPatterns = [];

        // Check for too regular typing
        const timeIntervals = keyPresses.map(k => k.deltaTime);
        const avgInterval = timeIntervals.reduce((a, b) => a + b, 0) / timeIntervals.length;

        if (avgInterval < 50) { // Too fast typing
            suspiciousPatterns.push('too_fast_typing');
        }

        // Check for no typos
        const hasTypos = this.detectTypingMistakes(keyPresses);
        if (!hasTypos) {
            suspiciousPatterns.push('no_typing_mistakes');
        }

        if (suspiciousPatterns.length > 0) {
            this.addDetectionSignal('typing_patterns', suspiciousPatterns);
        }
    }

    analyzeScrollPatterns(scrollEvents) {
        if (scrollEvents.length < 5) return;

        // Check for suspicious scroll patterns
        const suspiciousPatterns = [];

        // Check for too regular scrolling
        const timeIntervals = scrollEvents.map(s => s.deltaTime);
        const avgInterval = timeIntervals.reduce((a, b) => a + b, 0) / timeIntervals.length;

        if (avgInterval < 100) { // Too fast scrolling
            suspiciousPatterns.push('too_fast_scrolling');
        }

        // Check for smooth scrolling (no human-like pauses)
        const hasPauses = this.detectScrollPauses(scrollEvents);
        if (!hasPauses) {
            suspiciousPatterns.push('no_scroll_pauses');
        }

        if (suspiciousPatterns.length > 0) {
            this.addDetectionSignal('scroll_patterns', suspiciousPatterns);
        }
    }

    detectStraightLineMovements(movements) {
        let straightCount = 0;
        const total = movements.length - 1;

        for (let i = 1; i < movements.length; i++) {
            const prev = movements[i - 1];
            const curr = movements[i];

            const angle = Math.atan2(curr.deltaY, curr.deltaX);
            const prevAngle = Math.atan2(prev.deltaY, prev.deltaX);
            const angleDiff = Math.abs(angle - prevAngle);

            if (angleDiff < 0.1) { // Very small angle change
                straightCount++;
            }
        }

        return straightCount / total;
    }

    detectTypingMistakes(keyPresses) {
        // Look for backspace usage
        return keyPresses.some(k => k.key === 'Backspace');
    }

    detectScrollPauses(scrollEvents) {
        // Look for pauses longer than 500ms
        return scrollEvents.some(s => s.deltaTime > 500);
    }

    checkTimingPatterns(patterns) {
        const currentTime = Date.now();
        const recentPatterns = this.behaviorPatterns.filter(p => 
            currentTime - p.timestamp < 60000 // Last minute
        );

        if (recentPatterns.length > 10) {
            // Check for too regular intervals
            const intervals = [];
            for (let i = 1; i < recentPatterns.length; i++) {
                intervals.push(recentPatterns[i].timestamp - recentPatterns[i - 1].timestamp);
            }

            const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
            const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;

            if (variance < 1000) { // Too regular
                this.addDetectionSignal('timing_patterns', ['regular_intervals']);
            }
        }
    }

    recordNetworkRequest(type, args) {
        // Monitor for suspicious network patterns
        const request = {
            type,
            args,
            timestamp: Date.now()
        };

        // Check for too many requests
        const recentRequests = this.getRecentNetworkRequests();
        if (recentRequests.length > 20) {
            this.addDetectionSignal('network_patterns', ['too_many_requests']);
        }
    }

    getRecentNetworkRequests() {
        const currentTime = Date.now();
        return this.networkRequests ? this.networkRequests.filter(r => 
            currentTime - r.timestamp < 60000
        ) : [];
    }

    addDetectionSignal(type, patterns) {
        const signal = {
            type,
            patterns,
            timestamp: Date.now(),
            risk: this.calculateSignalRisk(patterns)
        };

        this.detectionSignals.push(signal);

        // Keep only last 50 signals
        if (this.detectionSignals.length > 50) {
            this.detectionSignals.shift();
        }

        console.log('⚠️ Detection signal:', signal);
    }

    calculateSignalRisk(patterns) {
        const riskScores = {
            'regular_mouse_movements': 0.3,
            'straight_line_movements': 0.4,
            'too_fast_typing': 0.3,
            'no_typing_mistakes': 0.2,
            'too_fast_scrolling': 0.3,
            'no_scroll_pauses': 0.2,
            'regular_intervals': 0.5,
            'too_many_requests': 0.4
        };

        return patterns.reduce((total, pattern) => {
            return total + (riskScores[pattern] || 0.1);
        }, 0);
    }

    checkDetectionSignals() {
        const recentSignals = this.detectionSignals.filter(signal => 
            Date.now() - signal.timestamp < 300000 // Last 5 minutes
        );

        const totalRisk = recentSignals.reduce((sum, signal) => sum + signal.risk, 0);
        const averageRisk = totalRisk / Math.max(recentSignals.length, 1);

        if (averageRisk > this.riskThresholds.high) {
            this.riskLevel = 'high';
            this.triggerHighRiskResponse();
        } else if (averageRisk > this.riskThresholds.medium) {
            this.riskLevel = 'medium';
            this.triggerMediumRiskResponse();
        } else {
            this.riskLevel = 'low';
        }
    }

    updateRiskLevel() {
        console.log(`🛡️ Current risk level: ${this.riskLevel}`);
    }

    triggerHighRiskResponse() {
        console.log('🚨 HIGH RISK DETECTED - Implementing emergency measures');
        
        // Implement emergency measures
        this.slowDownActivity();
        this.addRandomDelays();
        this.simulateHumanErrors();
    }

    triggerMediumRiskResponse() {
        console.log('⚠️ MEDIUM RISK DETECTED - Adjusting behavior');
        
        // Implement medium risk measures
        this.addRandomDelays();
        this.simulateHumanErrors();
    }

    slowDownActivity() {
        // Add longer delays between actions
        this.currentDelayMultiplier = 3;
    }

    addRandomDelays() {
        // Add random delays to make behavior more human-like
        const delay = Math.random() * 2000 + 1000; // 1-3 seconds
        setTimeout(() => {
            // Continue normal operation
        }, delay);
    }

    simulateHumanErrors() {
        // Simulate occasional human errors
        if (Math.random() < 0.1) { // 10% chance
            // Simulate a "mistake" like clicking slightly off target
            console.log('🤦 Simulating human error...');
        }
    }

    getStealthStats() {
        return {
            riskLevel: this.riskLevel,
            detectionSignals: this.detectionSignals.length,
            behaviorPatterns: this.behaviorPatterns.length,
            lastActivity: this.lastActivity,
            timeSinceLastActivity: Date.now() - this.lastActivity
        };
    }

    isHighRisk() {
        return this.riskLevel === 'high';
    }

    isMediumRisk() {
        return this.riskLevel === 'medium';
    }

    isLowRisk() {
        return this.riskLevel === 'low';
    }
}
