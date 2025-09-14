/**
 * Network Traffic Simulator - Human-like network patterns and traffic simulation
 */

class NetworkTrafficSimulator {
    constructor() {
        this.networkConfig = {
            enabled: false, // DISABLED: Network simulation was causing invalid traffic detection
            baseLatency: 50,
            latencyVariation: 20,
            bandwidthLimit: 1000000, // 1MB/s
            requestFrequency: 0.1,
            humanPatterns: true,
            stealthMode: true
        };
        
        this.trafficPatterns = {
            requests: [],
            responses: [],
            timing: [],
            patterns: []
        };
        
        this.humanPatterns = {
            browsingSessions: [],
            requestClusters: [],
            idlePeriods: [],
            burstPatterns: []
        };
        
        this.currentSession = {
            startTime: Date.now(),
            requestCount: 0,
            lastRequestTime: 0,
            currentPattern: 'normal'
        };
        
        this.simulatedRequests = [];
        this.networkMonitor = null;
    }

    /**
     * Initialize network simulator
     */
    initialize() {
        if (!this.networkConfig.enabled) return this;
        
        this.startNetworkMonitoring();
        this.generateHumanPatterns();
        
        return this;
    }

    /**
     * Start network monitoring
     */
    startNetworkMonitoring() {
        if (this.networkMonitor) return;
        
        this.networkMonitor = setInterval(() => {
            this.simulateNetworkActivity();
        }, 1000); // Monitor every second
    }

    /**
     * Stop network monitoring
     */
    stopNetworkMonitoring() {
        if (this.networkMonitor) {
            clearInterval(this.networkMonitor);
            this.networkMonitor = null;
        }
    }

    /**
     * Generate human-like network patterns
     */
    generateHumanPatterns() {
        // Generate browsing session patterns
        this.humanPatterns.browsingSessions = this.generateBrowsingSessions();
        
        // Generate request cluster patterns
        this.humanPatterns.requestClusters = this.generateRequestClusters();
        
        // Generate idle period patterns
        this.humanPatterns.idlePeriods = this.generateIdlePeriods();
        
        // Generate burst patterns
        this.humanPatterns.burstPatterns = this.generateBurstPatterns();
    }

    /**
     * Generate browsing session patterns
     */
    generateBrowsingSessions() {
        const sessions = [];
        const sessionTypes = ['casual', 'research', 'shopping', 'social', 'work'];
        
        sessionTypes.forEach(type => {
            sessions.push({
                type: type,
                duration: this.getRandomDuration(type),
                requestFrequency: this.getRequestFrequency(type),
                pattern: this.getSessionPattern(type)
            });
        });
        
        return sessions;
    }

    /**
     * Get random duration based on session type
     */
    getRandomDuration(sessionType) {
        const durations = {
            casual: { min: 300000, max: 1800000 }, // 5-30 minutes
            research: { min: 600000, max: 3600000 }, // 10-60 minutes
            shopping: { min: 900000, max: 2700000 }, // 15-45 minutes
            social: { min: 1800000, max: 7200000 }, // 30-120 minutes
            work: { min: 1800000, max: 5400000 } // 30-90 minutes
        };
        
        const range = durations[sessionType] || durations.casual;
        return Math.random() * (range.max - range.min) + range.min;
    }

    /**
     * Get request frequency based on session type
     */
    getRequestFrequency(sessionType) {
        const frequencies = {
            casual: 0.05, // 1 request every 20 seconds
            research: 0.1, // 1 request every 10 seconds
            shopping: 0.15, // 1 request every 6.7 seconds
            social: 0.08, // 1 request every 12.5 seconds
            work: 0.12 // 1 request every 8.3 seconds
        };
        
        return frequencies[sessionType] || frequencies.casual;
    }

    /**
     * Get session pattern based on type
     */
    getSessionPattern(sessionType) {
        const patterns = {
            casual: 'sporadic',
            research: 'continuous',
            shopping: 'burst',
            social: 'steady',
            work: 'focused'
        };
        
        return patterns[sessionType] || 'sporadic';
    }

    /**
     * Generate request cluster patterns
     */
    generateRequestClusters() {
        const clusters = [];
        
        // Generate different cluster types
        const clusterTypes = [
            { type: 'page_load', size: 5, interval: 2000 },
            { type: 'ajax_update', size: 3, interval: 1000 },
            { type: 'image_load', size: 8, interval: 500 },
            { type: 'api_call', size: 2, interval: 3000 },
            { type: 'analytics', size: 1, interval: 5000 }
        ];
        
        clusterTypes.forEach(clusterType => {
            clusters.push({
                type: clusterType.type,
                size: clusterType.size + Math.floor(Math.random() * 3),
                interval: clusterType.interval + Math.random() * 1000,
                pattern: this.generateClusterPattern(clusterType.type)
            });
        });
        
        return clusters;
    }

    /**
     * Generate cluster pattern
     */
    generateClusterPattern(clusterType) {
        const patterns = {
            page_load: 'sequential',
            ajax_update: 'parallel',
            image_load: 'burst',
            api_call: 'sequential',
            analytics: 'single'
        };
        
        return patterns[clusterType] || 'sequential';
    }

    /**
     * Generate idle period patterns
     */
    generateIdlePeriods() {
        const periods = [];
        
        // Generate different idle period types
        const periodTypes = [
            { type: 'reading', duration: 30000, frequency: 0.3 },
            { type: 'thinking', duration: 10000, frequency: 0.2 },
            { type: 'distraction', duration: 60000, frequency: 0.1 },
            { type: 'break', duration: 300000, frequency: 0.05 }
        ];
        
        periodTypes.forEach(periodType => {
            periods.push({
                type: periodType.type,
                duration: periodType.duration + Math.random() * periodType.duration * 0.5,
                frequency: periodType.frequency + Math.random() * 0.1,
                pattern: this.generateIdlePattern(periodType.type)
            });
        });
        
        return periods;
    }

    /**
     * Generate idle pattern
     */
    generateIdlePattern(periodType) {
        const patterns = {
            reading: 'complete_silence',
            thinking: 'minimal_activity',
            distraction: 'background_activity',
            break: 'no_activity'
        };
        
        return patterns[periodType] || 'minimal_activity';
    }

    /**
     * Generate burst patterns
     */
    generateBurstPatterns() {
        const bursts = [];
        
        // Generate different burst types
        const burstTypes = [
            { type: 'navigation', intensity: 0.8, duration: 5000 },
            { type: 'interaction', intensity: 0.6, duration: 3000 },
            { type: 'search', intensity: 0.9, duration: 2000 },
            { type: 'refresh', intensity: 0.7, duration: 1000 }
        ];
        
        burstTypes.forEach(burstType => {
            bursts.push({
                type: burstType.type,
                intensity: burstType.intensity + Math.random() * 0.2,
                duration: burstType.duration + Math.random() * burstType.duration * 0.3,
                pattern: this.generateBurstPattern(burstType.type)
            });
        });
        
        return bursts;
    }

    /**
     * Generate burst pattern
     */
    generateBurstPattern(burstType) {
        const patterns = {
            navigation: 'rapid_sequential',
            interaction: 'parallel_burst',
            search: 'intense_parallel',
            refresh: 'single_intense'
        };
        
        return patterns[burstType] || 'parallel_burst';
    }

    /**
     * Simulate network activity
     */
    simulateNetworkActivity() {
        const currentTime = Date.now();
        const sessionDuration = currentTime - this.currentSession.startTime;
        
        // Determine current pattern based on session
        this.currentSession.currentPattern = this.determineCurrentPattern(sessionDuration);
        
        // Generate requests based on current pattern
        this.generateRequestsForPattern(this.currentSession.currentPattern);
        
        // Simulate network latency and timing
        this.simulateNetworkTiming();
        
        // Record traffic patterns
        this.recordTrafficPattern();
    }

    /**
     * Determine current pattern based on session duration
     */
    determineCurrentPattern(sessionDuration) {
        // Analyze session duration and determine pattern
        if (sessionDuration < 60000) { // First minute
            return 'initial_load';
        } else if (sessionDuration < 300000) { // First 5 minutes
            return 'active_browsing';
        } else if (sessionDuration < 900000) { // First 15 minutes
            return 'steady_browsing';
        } else if (sessionDuration < 1800000) { // First 30 minutes
            return 'casual_browsing';
        } else {
            return 'extended_session';
        }
    }

    /**
     * Generate requests for current pattern
     */
    generateRequestsForPattern(pattern) {
        const requests = [];
        
        switch (pattern) {
            case 'initial_load':
                requests.push(...this.generateInitialLoadRequests());
                break;
            case 'active_browsing':
                requests.push(...this.generateActiveBrowsingRequests());
                break;
            case 'steady_browsing':
                requests.push(...this.generateSteadyBrowsingRequests());
                break;
            case 'casual_browsing':
                requests.push(...this.generateCasualBrowsingRequests());
                break;
            case 'extended_session':
                requests.push(...this.generateExtendedSessionRequests());
                break;
            default:
                requests.push(...this.generateNormalRequests());
        }
        
        this.simulatedRequests.push(...requests);
    }

    /**
     * Generate initial load requests
     */
    generateInitialLoadRequests() {
        const requests = [];
        
        // Simulate page load sequence
        const loadSequence = [
            { type: 'html', delay: 0, size: 50000 },
            { type: 'css', delay: 100, size: 20000 },
            { type: 'js', delay: 200, size: 30000 },
            { type: 'image', delay: 300, size: 15000 },
            { type: 'font', delay: 400, size: 10000 },
            { type: 'analytics', delay: 500, size: 1000 }
        ];
        
        loadSequence.forEach(item => {
            requests.push({
                type: item.type,
                timestamp: Date.now() + item.delay,
                size: item.size + Math.random() * item.size * 0.3,
                latency: this.generateLatency(item.type),
                pattern: 'sequential'
            });
        });
        
        return requests;
    }

    /**
     * Generate active browsing requests
     */
    generateActiveBrowsingRequests() {
        const requests = [];
        const requestCount = Math.floor(Math.random() * 5) + 3; // 3-7 requests
        
        for (let i = 0; i < requestCount; i++) {
            const requestType = this.getRandomRequestType();
            requests.push({
                type: requestType,
                timestamp: Date.now() + i * (1000 + Math.random() * 2000),
                size: this.getRequestSize(requestType),
                latency: this.generateLatency(requestType),
                pattern: 'parallel'
            });
        }
        
        return requests;
    }

    /**
     * Generate steady browsing requests
     */
    generateSteadyBrowsingRequests() {
        const requests = [];
        const requestCount = Math.floor(Math.random() * 3) + 1; // 1-3 requests
        
        for (let i = 0; i < requestCount; i++) {
            const requestType = this.getRandomRequestType();
            requests.push({
                type: requestType,
                timestamp: Date.now() + i * (3000 + Math.random() * 5000),
                size: this.getRequestSize(requestType),
                latency: this.generateLatency(requestType),
                pattern: 'sporadic'
            });
        }
        
        return requests;
    }

    /**
     * Generate casual browsing requests
     */
    generateCasualBrowsingRequests() {
        const requests = [];
        
        // Simulate occasional requests
        if (Math.random() < 0.3) { // 30% chance of request
            const requestType = this.getRandomRequestType();
            requests.push({
                type: requestType,
                timestamp: Date.now(),
                size: this.getRequestSize(requestType),
                latency: this.generateLatency(requestType),
                pattern: 'occasional'
            });
        }
        
        return requests;
    }

    /**
     * Generate extended session requests
     */
    generateExtendedSessionRequests() {
        const requests = [];
        
        // Simulate background activity
        if (Math.random() < 0.1) { // 10% chance of request
            const requestType = this.getRandomRequestType();
            requests.push({
                type: requestType,
                timestamp: Date.now(),
                size: this.getRequestSize(requestType),
                latency: this.generateLatency(requestType),
                pattern: 'background'
            });
        }
        
        return requests;
    }

    /**
     * Generate normal requests
     */
    generateNormalRequests() {
        const requests = [];
        const requestCount = Math.floor(Math.random() * 2) + 1; // 1-2 requests
        
        for (let i = 0; i < requestCount; i++) {
            const requestType = this.getRandomRequestType();
            requests.push({
                type: requestType,
                timestamp: Date.now() + i * (2000 + Math.random() * 3000),
                size: this.getRequestSize(requestType),
                latency: this.generateLatency(requestType),
                pattern: 'normal'
            });
        }
        
        return requests;
    }

    /**
     * Get random request type
     */
    getRandomRequestType() {
        const types = ['ajax', 'image', 'analytics', 'api', 'resource'];
        const weights = [0.4, 0.3, 0.1, 0.15, 0.05];
        
        const random = Math.random();
        let cumulativeWeight = 0;
        
        for (let i = 0; i < types.length; i++) {
            cumulativeWeight += weights[i];
            if (random <= cumulativeWeight) {
                return types[i];
            }
        }
        
        return types[0];
    }

    /**
     * Get request size based on type
     */
    getRequestSize(requestType) {
        const sizes = {
            ajax: 5000,
            image: 50000,
            analytics: 1000,
            api: 3000,
            resource: 15000
        };
        
        const baseSize = sizes[requestType] || 5000;
        return baseSize + Math.random() * baseSize * 0.5;
    }

    /**
     * Generate realistic latency
     */
    generateLatency(requestType) {
        const baseLatency = this.networkConfig.baseLatency;
        const variation = this.networkConfig.latencyVariation;
        
        const typeMultipliers = {
            ajax: 1.2,
            image: 0.8,
            analytics: 0.5,
            api: 1.5,
            resource: 1.0
        };
        
        const multiplier = typeMultipliers[requestType] || 1.0;
        const latency = baseLatency * multiplier + (Math.random() - 0.5) * variation;
        
        return Math.max(10, Math.min(500, latency));
    }

    /**
     * Simulate network timing
     */
    simulateNetworkTiming() {
        this.simulatedRequests.forEach(request => {
            // Simulate request timing
            const actualLatency = request.latency + (Math.random() - 0.5) * 10;
            request.actualLatency = Math.max(5, actualLatency);
            
            // Simulate bandwidth constraints
            const transferTime = request.size / this.networkConfig.bandwidthLimit * 1000;
            request.transferTime = transferTime;
            
            // Calculate total time
            request.totalTime = request.actualLatency + request.transferTime;
        });
    }

    /**
     * Record traffic pattern
     */
    recordTrafficPattern() {
        const pattern = {
            timestamp: Date.now(),
            pattern: this.currentSession.currentPattern,
            requestCount: this.simulatedRequests.length,
            totalSize: this.simulatedRequests.reduce((sum, req) => sum + req.size, 0),
            avgLatency: this.simulatedRequests.reduce((sum, req) => sum + req.actualLatency, 0) / this.simulatedRequests.length || 0
        };
        
        this.trafficPatterns.patterns.push(pattern);
        
        // Limit pattern history
        if (this.trafficPatterns.patterns.length > 1000) {
            this.trafficPatterns.patterns.shift();
        }
    }

    /**
     * Simulate network requests
     */
    simulateNetworkRequests() {
        console.log('NetworkTrafficSimulator: Simulating network requests...');
        
        // Generate realistic request patterns
        const requests = this.generateRealisticRequests();
        
        // Simulate request timing
        this.simulateRequestTiming(requests);
        
        // Simulate network conditions
        this.simulateNetworkConditions(requests);
        
        // Record request patterns
        this.recordRequestPatterns(requests);
        
        console.log(`NetworkTrafficSimulator: Simulated ${requests.length} network requests`);
        return requests;
    }

    /**
     * Generate traffic patterns
     */
    generateTrafficPatterns() {
        console.log('NetworkTrafficSimulator: Generating traffic patterns...');
        
        // Generate browsing session patterns
        const browsingPatterns = this.generateBrowsingSessionPatterns();
        
        // Generate request cluster patterns
        const clusterPatterns = this.generateRequestClusterPatterns();
        
        // Generate idle period patterns
        const idlePatterns = this.generateIdlePeriodPatterns();
        
        // Generate burst patterns
        const burstPatterns = this.generateBurstPatterns();
        
        const patterns = {
            browsing: browsingPatterns,
            clusters: clusterPatterns,
            idle: idlePatterns,
            bursts: burstPatterns,
            timestamp: Date.now()
        };
        
        console.log('NetworkTrafficSimulator: Traffic patterns generated');
        return patterns;
    }

    /**
     * Generate realistic requests
     */
    generateRealisticRequests() {
        const requests = [];
        const currentTime = Date.now();
        
        // Generate different types of requests
        const requestTypes = [
            { type: 'html', count: 1, size: { min: 30000, max: 100000 } },
            { type: 'css', count: 3, size: { min: 5000, max: 50000 } },
            { type: 'js', count: 5, size: { min: 10000, max: 80000 } },
            { type: 'image', count: 8, size: { min: 2000, max: 200000 } },
            { type: 'font', count: 2, size: { min: 8000, max: 30000 } },
            { type: 'analytics', count: 2, size: { min: 500, max: 2000 } },
            { type: 'api', count: 3, size: { min: 1000, max: 10000 } }
        ];
        
        requestTypes.forEach(requestType => {
            for (let i = 0; i < requestType.count; i++) {
                const request = {
                    type: requestType.type,
                    timestamp: currentTime + Math.random() * 5000, // Spread over 5 seconds
                    size: requestType.size.min + Math.random() * (requestType.size.max - requestType.size.min),
                    latency: this.generateLatency(requestType.type),
                    pattern: 'realistic',
                    priority: this.getRequestPriority(requestType.type)
                };
                
                requests.push(request);
            }
        });
        
        return requests.sort((a, b) => a.timestamp - b.timestamp);
    }

    /**
     * Simulate request timing
     */
    simulateRequestTiming(requests) {
        requests.forEach(request => {
            // Add natural timing variations
            const timingVariation = (Math.random() - 0.5) * 100; // ±50ms variation
            request.timestamp += timingVariation;
            
            // Simulate network latency
            const latencyVariation = (Math.random() - 0.5) * 20; // ±10ms variation
            request.actualLatency = Math.max(5, request.latency + latencyVariation);
            
            // Simulate transfer time based on size
            const transferTime = request.size / this.networkConfig.bandwidthLimit * 1000;
            request.transferTime = transferTime;
            
            // Calculate total time
            request.totalTime = request.actualLatency + request.transferTime;
        });
    }

    /**
     * Simulate network conditions
     */
    simulateNetworkConditions(requests) {
        // Simulate bandwidth variations
        const bandwidthVariation = 0.8 + Math.random() * 0.4; // 80-120% of base bandwidth
        this.networkConfig.currentBandwidth = this.networkConfig.bandwidthLimit * bandwidthVariation;
        
        // Simulate packet loss
        const packetLossRate = Math.random() * 0.02; // 0-2% packet loss
        this.networkConfig.packetLossRate = packetLossRate;
        
        // Simulate jitter
        const jitter = Math.random() * 10; // 0-10ms jitter
        this.networkConfig.jitter = jitter;
        
        // Apply conditions to requests
        requests.forEach(request => {
            // Apply bandwidth constraints
            request.transferTime = request.size / this.networkConfig.currentBandwidth * 1000;
            
            // Apply packet loss
            if (Math.random() < packetLossRate) {
                request.packetLoss = true;
                request.retransmissionDelay = 100 + Math.random() * 200; // 100-300ms retransmission
            }
            
            // Apply jitter
            request.jitter = (Math.random() - 0.5) * jitter;
            request.totalTime += request.jitter;
        });
    }

    /**
     * Record request patterns
     */
    recordRequestPatterns(requests) {
        const pattern = {
            timestamp: Date.now(),
            requestCount: requests.length,
            totalSize: requests.reduce((sum, req) => sum + req.size, 0),
            avgLatency: requests.reduce((sum, req) => sum + req.actualLatency, 0) / requests.length,
            avgTransferTime: requests.reduce((sum, req) => sum + req.transferTime, 0) / requests.length,
            packetLossRate: this.networkConfig.packetLossRate,
            bandwidth: this.networkConfig.currentBandwidth,
            jitter: this.networkConfig.jitter
        };
        
        this.trafficPatterns.patterns.push(pattern);
        
        // Limit pattern history
        if (this.trafficPatterns.patterns.length > 1000) {
            this.trafficPatterns.patterns.shift();
        }
    }

    /**
     * Generate browsing session patterns
     */
    generateBrowsingSessionPatterns() {
        const patterns = [];
        
        // Generate different session types
        const sessionTypes = [
            { type: 'quick_browse', duration: 30000, requestCount: 15 },
            { type: 'normal_browse', duration: 120000, requestCount: 45 },
            { type: 'deep_browse', duration: 300000, requestCount: 80 },
            { type: 'extended_browse', duration: 600000, requestCount: 120 }
        ];
        
        sessionTypes.forEach(sessionType => {
            const pattern = {
                type: sessionType.type,
                duration: sessionType.duration,
                requestCount: sessionType.requestCount,
                requestInterval: sessionType.duration / sessionType.requestCount,
                burstPatterns: this.generateBurstPatternsForSession(sessionType.type),
                idlePeriods: this.generateIdlePeriodsForSession(sessionType.type)
            };
            
            patterns.push(pattern);
        });
        
        return patterns;
    }

    /**
     * Generate request cluster patterns
     */
    generateRequestClusterPatterns() {
        const patterns = [];
        
        // Generate different cluster types
        const clusterTypes = [
            { type: 'page_load', size: 8, interval: 100 },
            { type: 'ajax_burst', size: 5, interval: 200 },
            { type: 'image_lazy_load', size: 3, interval: 500 },
            { type: 'analytics_batch', size: 2, interval: 1000 }
        ];
        
        clusterTypes.forEach(clusterType => {
            const pattern = {
                type: clusterType.type,
                size: clusterType.size,
                interval: clusterType.interval,
                timing: this.generateClusterTiming(clusterType),
                distribution: this.generateClusterDistribution(clusterType)
            };
            
            patterns.push(pattern);
        });
        
        return patterns;
    }

    /**
     * Generate idle period patterns
     */
    generateIdlePeriodPatterns() {
        const patterns = [];
        
        // Generate different idle types
        const idleTypes = [
            { type: 'reading_pause', duration: { min: 5000, max: 30000 } },
            { type: 'thinking_pause', duration: { min: 2000, max: 10000 } },
            { type: 'distraction_pause', duration: { min: 10000, max: 60000 } },
            { type: 'break_pause', duration: { min: 30000, max: 300000 } }
        ];
        
        idleTypes.forEach(idleType => {
            const pattern = {
                type: idleType.type,
                duration: idleType.duration.min + Math.random() * (idleType.duration.max - idleType.duration.min),
                frequency: this.calculateIdleFrequency(idleType.type),
                context: this.getIdleContext(idleType.type)
            };
            
            patterns.push(pattern);
        });
        
        return patterns;
    }

    /**
     * Generate burst patterns
     */
    generateBurstPatterns() {
        const patterns = [];
        
        // Generate different burst types
        const burstTypes = [
            { type: 'scroll_burst', intensity: 'high', duration: 2000 },
            { type: 'click_burst', intensity: 'medium', duration: 1000 },
            { type: 'navigation_burst', intensity: 'high', duration: 3000 },
            { type: 'search_burst', intensity: 'medium', duration: 1500 }
        ];
        
        burstTypes.forEach(burstType => {
            const pattern = {
                type: burstType.type,
                intensity: burstType.intensity,
                duration: burstType.duration,
                requestRate: this.calculateBurstRequestRate(burstType.intensity),
                timing: this.generateBurstTiming(burstType)
            };
            
            patterns.push(pattern);
        });
        
        return patterns;
    }

    /**
     * Helper methods
     */
    getRequestPriority(type) {
        const priorities = {
            'html': 'high',
            'css': 'high',
            'js': 'medium',
            'image': 'low',
            'font': 'medium',
            'analytics': 'low',
            'api': 'medium'
        };
        
        return priorities[type] || 'medium';
    }

    generateLatency(type) {
        const baseLatency = {
            'html': 50,
            'css': 30,
            'js': 40,
            'image': 20,
            'font': 35,
            'analytics': 10,
            'api': 60
        };
        
        const base = baseLatency[type] || 30;
        return base + Math.random() * 20; // Add 0-20ms variation
    }

    generateBurstPatternsForSession(sessionType) {
        const patterns = {
            'quick_browse': { count: 2, intensity: 'low' },
            'normal_browse': { count: 4, intensity: 'medium' },
            'deep_browse': { count: 6, intensity: 'high' },
            'extended_browse': { count: 8, intensity: 'high' }
        };
        
        return patterns[sessionType] || { count: 3, intensity: 'medium' };
    }

    generateIdlePeriodsForSession(sessionType) {
        const periods = {
            'quick_browse': { count: 1, duration: 5000 },
            'normal_browse': { count: 3, duration: 10000 },
            'deep_browse': { count: 5, duration: 15000 },
            'extended_browse': { count: 8, duration: 20000 }
        };
        
        return periods[sessionType] || { count: 2, duration: 8000 };
    }

    generateClusterTiming(clusterType) {
        return {
            startDelay: Math.random() * 1000,
            intervalVariation: 0.2,
            endDelay: Math.random() * 500
        };
    }

    generateClusterDistribution(clusterType) {
        return {
            uniform: 0.6,
            exponential: 0.3,
            burst: 0.1
        };
    }

    calculateIdleFrequency(idleType) {
        const frequencies = {
            'reading_pause': 0.3,
            'thinking_pause': 0.2,
            'distraction_pause': 0.1,
            'break_pause': 0.05
        };
        
        return frequencies[idleType] || 0.15;
    }

    getIdleContext(idleType) {
        const contexts = {
            'reading_pause': 'content_consumption',
            'thinking_pause': 'decision_making',
            'distraction_pause': 'external_interruption',
            'break_pause': 'session_break'
        };
        
        return contexts[idleType] || 'general';
    }

    calculateBurstRequestRate(intensity) {
        const rates = {
            'low': 2,
            'medium': 5,
            'high': 10
        };
        
        return rates[intensity] || 3;
    }

    generateBurstTiming(burstType) {
        return {
            rampUp: 200,
            sustain: burstType.duration - 400,
            rampDown: 200
        };
    }

    /**
     * Get network metrics
     */
    getNetworkMetrics() {
        const recentPatterns = this.trafficPatterns.patterns.slice(-100);
        
        return {
            totalRequests: this.simulatedRequests.length,
            totalTraffic: this.simulatedRequests.reduce((sum, req) => sum + req.size, 0),
            avgLatency: recentPatterns.reduce((sum, p) => sum + p.avgLatency, 0) / recentPatterns.length || 0,
            currentPattern: this.currentSession.currentPattern,
            sessionDuration: Date.now() - this.currentSession.startTime,
            humanPatterns: this.humanPatterns.browsingSessions.length,
            networkConditions: {
                bandwidth: this.networkConfig.currentBandwidth,
                packetLoss: this.networkConfig.packetLossRate,
                jitter: this.networkConfig.jitter
            },
            trafficPatterns: {
                browsing: this.generateBrowsingSessionPatterns().length,
                clusters: this.generateRequestClusterPatterns().length,
                idle: this.generateIdlePeriodPatterns().length,
                bursts: this.generateBurstPatterns().length
            }
        };
    }

    /**
     * Simulate human-like request burst
     */
    simulateRequestBurst(burstType = 'navigation') {
        const burst = this.humanPatterns.burstPatterns.find(b => b.type === burstType);
        if (!burst) return;
        
        const requests = [];
        const burstSize = Math.floor(burst.intensity * 10);
        
        for (let i = 0; i < burstSize; i++) {
            const requestType = this.getRandomRequestType();
            requests.push({
                type: requestType,
                timestamp: Date.now() + i * (burst.duration / burstSize),
                size: this.getRequestSize(requestType),
                latency: this.generateLatency(requestType),
                pattern: burst.pattern
            });
        }
        
        this.simulatedRequests.push(...requests);
        return requests;
    }

    /**
     * Simulate idle period
     */
    simulateIdlePeriod(periodType = 'reading') {
        const period = this.humanPatterns.idlePeriods.find(p => p.type === periodType);
        if (!period) return;
        
        // Stop network activity for the period duration
        this.stopNetworkMonitoring();
        
        setTimeout(() => {
            this.startNetworkMonitoring();
        }, period.duration);
        
        return period;
    }

    /**
     * Get human-like network signature
     */
    getNetworkSignature() {
        const metrics = this.getNetworkMetrics();
        const patterns = this.trafficPatterns.patterns.slice(-50);
        
        return {
            requestPattern: this.analyzeRequestPattern(patterns),
            timingPattern: this.analyzeTimingPattern(patterns),
            sizePattern: this.analyzeSizePattern(patterns),
            humanScore: this.calculateHumanScore(metrics, patterns)
        };
    }

    /**
     * Analyze request pattern
     */
    analyzeRequestPattern(patterns) {
        if (patterns.length === 0) return 'unknown';
        
        const requestCounts = patterns.map(p => p.requestCount);
        const avgRequests = requestCounts.reduce((sum, count) => sum + count, 0) / requestCounts.length;
        const variance = this.calculateVariance(requestCounts, avgRequests);
        
        if (variance < 0.1) return 'consistent';
        if (variance < 0.3) return 'variable';
        if (variance < 0.6) return 'bursty';
        return 'random';
    }

    /**
     * Analyze timing pattern
     */
    analyzeTimingPattern(patterns) {
        if (patterns.length < 2) return 'unknown';
        
        const intervals = [];
        for (let i = 1; i < patterns.length; i++) {
            intervals.push(patterns[i].timestamp - patterns[i-1].timestamp);
        }
        
        const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
        const variance = this.calculateVariance(intervals, avgInterval);
        
        if (variance < 0.2) return 'regular';
        if (variance < 0.5) return 'variable';
        return 'irregular';
    }

    /**
     * Analyze size pattern
     */
    analyzeSizePattern(patterns) {
        if (patterns.length === 0) return 'unknown';
        
        const sizes = patterns.map(p => p.totalSize);
        const avgSize = sizes.reduce((sum, size) => sum + size, 0) / sizes.length;
        const variance = this.calculateVariance(sizes, avgSize);
        
        if (variance < 0.3) return 'consistent';
        if (variance < 0.7) return 'variable';
        return 'mixed';
    }

    /**
     * Calculate variance
     */
    calculateVariance(values, mean) {
        if (values.length === 0) return 0;
        
        const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
        const avgSquaredDiff = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
        
        return Math.sqrt(avgSquaredDiff) / mean;
    }

    /**
     * Calculate human score
     */
    calculateHumanScore(metrics, patterns) {
        let score = 0.5; // Base score
        
        // Pattern consistency
        const requestPattern = this.analyzeRequestPattern(patterns);
        if (requestPattern === 'variable' || requestPattern === 'bursty') score += 0.2;
        
        // Timing naturalness
        const timingPattern = this.analyzeTimingPattern(patterns);
        if (timingPattern === 'variable' || timingPattern === 'irregular') score += 0.2;
        
        // Size variation
        const sizePattern = this.analyzeSizePattern(patterns);
        if (sizePattern === 'variable' || sizePattern === 'mixed') score += 0.1;
        
        // Session duration
        if (metrics.sessionDuration > 300000) score += 0.1; // 5+ minutes
        
        return Math.min(1, score);
    }
}

// Export for use in other modules with enhanced stealth protection
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NetworkTrafficSimulator;
} else if (typeof window !== 'undefined') {
    // Always assign to window, overwriting if exists to prevent conflicts
    window.NetworkTrafficSimulator = NetworkTrafficSimulator;
}
