/**
 * AdSense Automation Pro - Main Content Script
 * Integrates all automation libraries for AdSense optimization and RPM improvement
 */

class AdSenseAutomationPro {
    constructor() {
        this.isInitialized = false;
        this.isRunning = false;
        this.automationConfig = {
            enabled: true,
            autoStart: true,
            targetRPM: 0,
            personalityType: 'auto',
            automationLevel: 'medium',
            stealthMode: true,
            debugMode: false // Disable debug logging for stealth
        };
        
        // Initialize all components
        this.personalityEngine = new PersonalityEngine();
        this.behaviorSimulator = new BehaviorSimulator(this.personalityEngine);
        this.mouseSimulator = new MouseSimulator(this.behaviorSimulator);
        this.keyboardSimulator = new KeyboardSimulator(this.behaviorSimulator);
        this.readingSimulator = new ReadingSimulator(this.behaviorSimulator);
        this.navigationSimulator = new NavigationSimulator(this.behaviorSimulator);
        this.adsenseDetector = new AdSenseDetector();
        this.sessionManager = new SessionManager();
        this.stealthMonitor = new StealthMonitor();
        
        // Multilogin Optimizer removed - was only simulation without real API integration
        
        // Event listeners
        this.eventListeners = [];
        
        // Message handling
        this.setupMessageHandling();
    }



    /**
     * Initialize the automation system
     */
    async initialize() {
        if (this.isInitialized) return;
        
        try {
            // Stealth logging - minimal console output
            if (this.automationConfig.debugMode) {
                console.log('Initializing automation system...');
            }
            
            // Initialize all components
            await this.personalityEngine.loadPersonality();
            await this.behaviorSimulator.initialize();
            this.mouseSimulator.initialize();
            await this.sessionManager.initialize();
            this.stealthMonitor.initialize();
            this.navigationSimulator.initialize();
            
            // Set session start time for navigation tracking
            this.sessionStartTime = Date.now();
            console.log(`🕐 Session started at: ${new Date(this.sessionStartTime).toLocaleTimeString()}`);
            

            
            // Load configuration
            await this.loadConfiguration();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Start automation immediately after initialization
            await this.startAutomation();
            
            this.isInitialized = true;
            // Stealth logging - minimal console output
            if (this.automationConfig.debugMode) {
                console.log('Automation system ready');
            }
            
            // Send initialization complete message
            this.sendMessage('initializationComplete', {
                status: 'success',
                config: this.automationConfig
            });
            
        } catch (error) {
            // Stealth error handling - minimal console output
            if (this.automationConfig.debugMode) {
                console.warn('Initialization issue detected');
            }
            this.sendMessage('initializationComplete', {
                status: 'error',
                error: error.message
            });
        }
    }

    /**
     * Load configuration from storage
     */
    async loadConfiguration() {
        try {
            const result = await chrome.storage.local.get(['automationConfig']);
            if (result.automationConfig) {
                this.automationConfig = { ...this.automationConfig, ...result.automationConfig };
            }
        } catch (error) {
            console.warn('Failed to load configuration:', error);
        }
    }

    /**
     * Save configuration to storage
     */
    async saveConfiguration() {
        try {
            await chrome.storage.local.set({
                automationConfig: this.automationConfig
            });
        } catch (error) {
            console.warn('Failed to save configuration:', error);
        }
    }

    /**
     * Setup event listeners for user interactions
     */
    setupEventListeners() {
        // Mouse movement tracking
        const mouseMoveListener = (event) => {
            this.stealthMonitor.recordBehaviorPattern('mouse_movement', {
                x: event.clientX,
                y: event.clientY,
                timestamp: Date.now()
            });
        };
        
        // Click tracking
        const clickListener = (event) => {
            this.stealthMonitor.recordBehaviorPattern('click', {
                x: event.clientX,
                y: event.clientY,
                target: event.target.tagName,
                timestamp: Date.now()
            });
        };
        
        // Scroll tracking
        const scrollListener = (event) => {
            this.stealthMonitor.recordBehaviorPattern('scroll', {
                deltaX: event.deltaX,
                deltaY: event.deltaY,
                timestamp: Date.now()
            });
        };
        
        // Typing tracking
        const keydownListener = (event) => {
            this.stealthMonitor.recordBehaviorPattern('typing', {
                key: event.key,
                isTypo: false,
                isBackspace: event.key === 'Backspace',
                timestamp: Date.now()
            });
        };
        
        // Add listeners
        document.addEventListener('mousemove', mouseMoveListener);
        document.addEventListener('click', clickListener);
        document.addEventListener('scroll', scrollListener);
        document.addEventListener('keydown', keydownListener);
        
        // Store for cleanup
        this.eventListeners = [
            { type: 'mousemove', listener: mouseMoveListener },
            { type: 'click', listener: clickListener },
            { type: 'scroll', listener: scrollListener },
            { type: 'keydown', listener: keydownListener }
        ];
    }

    /**
     * Setup message handling for communication with popup and background
     */
    setupMessageHandling() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            // Add ping handler for injection detection
            if (message.action === 'ping') {
                sendResponse({ status: 'success', data: { isRunning: this.isRunning } });
                return true;
            }
            
            this.handleMessage(message, sender, sendResponse);
            return true; // Keep message channel open for async responses
        });
    }

    /**
     * Handle incoming messages
     */
    async handleMessage(message, sender, sendResponse) {
        try {
            switch (message.action) {
                case 'initialize':
                    await this.initialize();
                    sendResponse({ status: 'success' });
                    break;
                    
                case 'startAutomation':
                    const result = await this.startAutomation(message.options);
                    sendResponse({ status: 'success', result });
                    break;
                    
                case 'stopAutomation':
                    await this.stopAutomation();
                    sendResponse({ status: 'success' });
                    break;
                    
                case 'getStatus':
                    const status = this.getStatus();
                    sendResponse({ status: 'success', data: status });
                    break;
                    
                case 'updateConfig':
                    this.automationConfig = { ...this.automationConfig, ...message.config };
                    await this.saveConfiguration();
                    sendResponse({ status: 'success' });
                    break;
                    
                case 'getMetrics':
                    const metrics = this.getMetrics();
                    sendResponse({ status: 'success', data: metrics });
                    break;
                    
                case 'detectAds':
                    const ads = this.adsenseDetector.detectAdSenseAds();
                    sendResponse({ status: 'success', data: ads });
                    break;
                    
                case 'interactWithAds':
                    const interaction = await this.interactWithAds(message.options);
                    sendResponse({ status: 'success', data: interaction });
                    break;
                    
                case 'simulateBehavior':
                    await this.simulateBehavior(message.behaviorType, message.options);
                    sendResponse({ status: 'success' });
                    break;
                    
                case 'getSessionData':
                    const sessionData = this.sessionManager.getCurrentSession();
                    sendResponse({ status: 'success', data: sessionData });
                    break;
                    
                case 'exportData':
                    const exportData = this.exportAllData();
                    sendResponse({ status: 'success', data: exportData });
                    break;
                    
                default:
                    sendResponse({ status: 'error', message: 'Unknown action' });
            }
        } catch (error) {
            console.error('Message handling error:', error);
            sendResponse({ status: 'error', error: error.message });
        }
    }

    /**
     * Start automation
     */
    async startAutomation(options = {}) {
        if (this.isRunning) {
            console.log('Automation already running');
            return { status: 'already_running' };
        }
        
        try {
            console.log('AdSense Automation Pro: Starting automation...');
            
            this.isRunning = true;
            
            // Start new session
            const personality = this.personalityEngine.getCurrentPersonality();
            await this.sessionManager.startSession({
                personality: personality,
                personalityType: this.automationConfig.personalityType,
                automationLevel: this.automationConfig.automationLevel,
                targetRPM: this.automationConfig.targetRPM
            });
            
            // Start automation loop
            this.automationLoop(options);
            
            return { status: 'started', sessionId: this.sessionManager.getCurrentSession()?.id };
            
        } catch (error) {
            console.error('Failed to start automation:', error);
            this.isRunning = false;
            throw error;
        }
    }

    /**
     * Stop automation
     */
    async stopAutomation() {
        if (!this.isRunning) {
            console.log('Automation not running');
            return;
        }
        
        try {
            console.log('AdSense Automation Pro: Stopping automation...');
            
            this.isRunning = false;
            
            // End session
            await this.sessionManager.endSession('manual_stop');
            
            // Send stop message
            this.sendMessage('automationStopped', {
                sessionId: this.sessionManager.getCurrentSession()?.id
            });
            
        } catch (error) {
            console.error('Failed to stop automation:', error);
        }
    }

    /**
     * Main automation loop
     */
    async automationLoop(options = {}) {
        // Stealth logging - minimal console output
        if (this.automationConfig.debugMode) {
            console.log('Starting automation process...');
        }
        
        // Start with immediate scrolling
        await this.startImmediateScrolling();
        
        while (this.isRunning) {
            try {
                // Check stealth status
                const stealthStatus = this.stealthMonitor.getStealthStatus();
                if (stealthStatus.riskLevel === 'high') {
                    console.warn('High bot detection risk detected, pausing automation');
                    await this.delay(10000); // Pause for 10 seconds
                    continue;
                }
                
                // Detect AdSense ads
                const ads = this.adsenseDetector.detectAdSenseAds();
                
                if (ads.length > 0) {
                    // Interact with ads
                    await this.interactWithAds({ ads: ads, personality: this.personalityEngine.getCurrentPersonality() });
                }
                
                // Simulate reading behavior first (priority)
                await this.simulateReadingBehavior();
                
                // Check if we've been on this page too long (force navigation)
                const sessionStartTime = this.sessionStartTime || this.sessionManager?.currentSession?.startTime || Date.now();
                const pageTime = Date.now() - sessionStartTime;
                
                console.log(`⏱️ Page time: ${(pageTime / 1000).toFixed(0)}s`);
                
                // Navigation cooldown after reading (minimum 2 minutes on page)
                if (pageTime < 120000) { // 2 minutes minimum
                    console.log(`⏳ Navigation cooldown: ${(120 - pageTime / 1000).toFixed(0)}s remaining`);
                    await this.delay(10000); // Wait 10 seconds before next check
                    continue;
                }
                
                // Ensure reading is completed before allowing navigation
                if (!this.readingCompleted) {
                    console.log(`📚 Reading not completed yet, continuing...`);
                    await this.delay(5000); // Wait 5 seconds before next check
                    continue;
                }
                
                if (pageTime > 300000) { // 5 minutes
                    console.log(`🚨 Force navigation after ${(pageTime / 1000).toFixed(0)}s on page`);
                    await this.simulateNavigation();
                    continue; // Skip normal navigation logic
                }
                
                // Add longer delay after reading before navigation
                await this.delay(5000 + Math.random() * 10000); // 5-15 seconds
                
                // Simulate navigation with drastically reduced frequency
                const navigationProbability = Math.min(0.05, pageTime / 600000); // 5% max after 10 minutes
                
                if (Math.random() < navigationProbability) {
                    console.log(`🧭 Navigation probability: ${(navigationProbability * 100).toFixed(1)}% (page time: ${(pageTime / 1000).toFixed(0)}s)`);
                    await this.simulateNavigation();
                } else {
                    console.log(`⏳ Navigation skipped (${(navigationProbability * 100).toFixed(1)}% chance)`);
                }
                
                // Random delay between actions
                const delay = this.getRandomDelay();
                await this.delay(delay);
                
            } catch (error) {
                console.error('Automation loop error:', error);
                await this.delay(5000); // Wait before retrying
            }
        }
    }

    /**
     * Interact with AdSense ads
     */
    async interactWithAds(options = {}) {
        const ads = options.ads || this.adsenseDetector.detectAdSenseAds();
        const personality = options.personality || this.personalityEngine.getCurrentPersonality();
        
        const interactions = [];
        
        for (const ad of ads) {
            try {
                // Smart ad interaction based on personality and ad value
                const interaction = await this.adsenseDetector.smartAdInteraction(ad, personality);
                
                if (interaction) {
                    interactions.push(interaction);
                    
                    // Record interaction in session
                    this.sessionManager.addInteraction({
                        type: 'adsense_interaction',
                        action: interaction.action,
                        adId: interaction.adId,
                        category: interaction.category,
                        isHighValue: interaction.isHighValue,
                        value: interaction.value
                    });
                    
                    // Update AdSense data
                    this.sessionManager.updateAdSenseData(this.adsenseDetector.getSessionSummary());
                }
                
                // Delay between ad interactions
                await this.delay(2000 + Math.random() * 3000);
                
            } catch (error) {
                console.error('Ad interaction error:', error);
            }
        }
        
        return interactions;
    }

    /**
     * Start immediate scrolling when page loads
     */
    async startImmediateScrolling() {
        try {
            // Stealth logging - minimal console output
            if (this.automationConfig.debugMode) {
                console.log('Starting page interaction...');
            }
            
            // Get page height
            const pageHeight = document.documentElement.scrollHeight;
            const viewportHeight = window.innerHeight;
            const maxScroll = pageHeight - viewportHeight;
            
            // Start scrolling immediately
            let currentScroll = 0;
            const scrollStep = 100 + Math.random() * 200; // Random scroll step
            
            while (currentScroll < maxScroll && this.isRunning) {
                // Natural scrolling with easing
                const progress = currentScroll / maxScroll;
                const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
                
                window.scrollTo({
                    top: currentScroll,
                    behavior: 'smooth'
                });
                
                // Random pause at content
                if (Math.random() < 0.3) {
                    await this.delay(1000 + Math.random() * 2000);
                }
                
                currentScroll += scrollStep;
                await this.delay(500 + Math.random() * 1000);
            }
            
            // Scroll back up partially
            if (this.isRunning) {
                const scrollBackAmount = maxScroll * 0.3;
                window.scrollTo({
                    top: scrollBackAmount,
                    behavior: 'smooth'
                });
                await this.delay(2000);
            }
            
            // Stealth logging - minimal console output
            if (this.automationConfig.debugMode) {
                console.log('Page interaction completed');
            }
            
        } catch (error) {
            // Stealth error handling - minimal console output
            if (this.automationConfig.debugMode) {
                console.warn('Page interaction issue detected');
            }
        }
    }

    /**
     * Simulate reading behavior with enhanced logging
     */
    async simulateReadingBehavior() {
        try {
            console.log('📖 Starting reading behavior simulation...');
            
            // Analyze content
            const contentType = this.readingSimulator.detectContentType();
            const contentQuality = this.readingSimulator.analyzeContentQuality();
            
            console.log(`📖 Content type: ${contentType}, Quality: ${contentQuality}`);
            
            // Simulate reading with longer duration
            const readingStartTime = Date.now();
            await this.readingSimulator.simulateReadingBehavior(contentType, contentQuality);
            const readingDuration = Date.now() - readingStartTime;
            
            console.log(`📖 Reading completed in ${readingDuration}ms`);
            
            // Record reading interaction
            this.sessionManager.addInteraction({
                type: 'reading',
                contentType: contentType,
                contentQuality: contentQuality,
                duration: readingDuration,
                timestamp: Date.now()
            });
            
            console.log('📖 Reading behavior simulation completed successfully');
            
            // Mark reading as completed for this page
            this.readingCompleted = true;
            this.lastReadingTime = Date.now();
            
        } catch (error) {
            console.error('Reading behavior simulation error:', error);
        }
    }

    /**
     * Simulate navigation with improved timing and state management
     */
    async simulateNavigation() {
        try {
            console.log('🧭 Starting navigation simulation...');
            
            // Check if navigation simulator is available
            if (!this.navigationSimulator) {
                console.warn('Navigation simulator not available');
                return;
            }
            
            // Track navigation attempt
            if (!this.navigationState) {
                this.navigationState = {
                    navigationAttempts: 0,
                    maxNavigationAttempts: 3,
                    lastNavigationTime: 0,
                    readingCompleted: false,
                    pageStartTime: Date.now()
                };
            }
            
            this.navigationState.navigationAttempts++;
            
            // Check if we've exceeded maximum navigation attempts
            if (this.navigationState.navigationAttempts > this.navigationState.maxNavigationAttempts) {
                console.log(`🚫 Maximum navigation attempts (${this.navigationState.maxNavigationAttempts}) reached`);
                return;
            }
            
            // Check navigation cooldown
            const now = Date.now();
            const timeSinceLastNavigation = now - this.navigationState.lastNavigationTime;
            const navigationCooldown = 60000; // 1 minute cooldown
            
            if (timeSinceLastNavigation < navigationCooldown) {
                console.log(`⏳ Navigation cooldown: ${Math.round((navigationCooldown - timeSinceLastNavigation) / 1000)}s remaining`);
                return;
            }
            
            // Intelligent navigation based on personality
            const navigationResult = await this.navigationSimulator.simulateIntelligentNavigation();
            
            if (navigationResult) {
                console.log('🧭 Navigation completed, starting reading on new page...');
                
                // Update navigation state
                this.navigationState.lastNavigationTime = now;
                this.navigationState.readingCompleted = false;
                this.navigationState.pageStartTime = now;
                
                // Wait after navigation before reading
                const postNavigationDelay = 3000 + Math.random() * 5000; // 3-8 seconds
                console.log(`⏳ Post-navigation delay: ${Math.round(postNavigationDelay / 1000)}s`);
                await this.delay(postNavigationDelay);
                
                // Force reading behavior after navigation
                console.log('📖 Starting reading behavior on new page...');
                await this.simulateReadingBehavior();
                
                // Mark reading as completed
                this.navigationState.readingCompleted = true;
                
                // Mandatory delay after reading to prevent immediate navigation
                const mandatoryReadingDelay = 30000 + Math.random() * 60000; // 30-90 seconds
                console.log(`📚 Mandatory reading delay: ${Math.round(mandatoryReadingDelay / 1000)}s`);
                await this.delay(mandatoryReadingDelay);
                
                // Record navigation interaction
                if (this.sessionManager) {
                    this.sessionManager.addInteraction({
                        type: 'navigation',
                        url: window.location.href,
                        title: document.title,
                        timestamp: Date.now(),
                        navigationAttempt: this.navigationState.navigationAttempts
                    });
                    
                    // Add page visit to session
                    this.sessionManager.addPageVisit({
                        url: window.location.href,
                        title: document.title,
                        timeSpent: mandatoryReadingDelay + postNavigationDelay,
                        scrollDepth: Math.random() * 100,
                        readingTime: 15000 + Math.random() * 30000
                    });
                }
                
                console.log('🧭 Navigation and reading cycle completed successfully');
                
            } else {
                console.log('🧭 Navigation failed, will retry later');
                // Reduce navigation attempts counter since this attempt failed
                this.navigationState.navigationAttempts--;
            }
            
        } catch (error) {
            console.warn('Navigation simulation error:', error.message);
            // Reduce navigation attempts counter since this attempt failed
            if (this.navigationState) {
                this.navigationState.navigationAttempts--;
            }
        }
    }

    /**
     * Get current status
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            isRunning: this.isRunning,
            config: this.automationConfig,
            personality: this.personalityEngine.getCurrentPersonality(),
            session: this.sessionManager.getSessionSummary(),
            stealth: this.stealthMonitor.getStealthStatus(),
            adsense: this.adsenseDetector.getSessionSummary()
        };
    }

    /**
     * Get metrics
     */
    getMetrics() {
        return {
            session: this.sessionManager.getSessionAnalytics(),
            stealth: this.stealthMonitor.getStealthMetrics(),
            adsense: this.adsenseDetector.getSessionSummary(),
            behavior: this.behaviorSimulator.getBehaviorStatus()
        };
    }

    /**
     * Export all data
     */
    exportAllData() {
        return {
            session: this.sessionManager.exportSessionData(),
            stealth: this.stealthMonitor.getDetectionSignals(),
            adsense: this.adsenseDetector.getSessionSummary(),
            personality: this.personalityEngine.getCurrentPersonality(),
            config: this.automationConfig,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Simulate specific behavior
     */
    async simulateBehavior(behaviorType, options = {}) {
        switch (behaviorType) {
            case 'mouse_movement':
                await this.mouseSimulator.moveTo(options.x, options.y, options.duration);
                break;
                
            case 'click':
                await this.mouseSimulator.click(options.element, options.clickOptions);
                break;
                
            case 'typing':
                await this.keyboardSimulator.typeText(options.text, options.element, options.typingOptions);
                break;
                
            case 'scrolling':
                await this.behaviorSimulator.simulateNaturalScrolling(options.targetY, options.duration);
                break;
                
            case 'reading':
                await this.readingSimulator.simulateReadingBehavior(options.contentType, options.contentQuality);
                break;
                
            case 'navigation':
                await this.navigationSimulator.simulateIntelligentNavigation(options.navigationOptions);
                break;
                
            default:
                throw new Error(`Unknown behavior type: ${behaviorType}`);
        }
    }

    /**
     * Send message to popup or background
     */
    sendMessage(action, data) {
        try {
            chrome.runtime.sendMessage({ action, data });
        } catch (error) {
            console.warn('Failed to send message:', error);
        }
    }

    /**
     * Get random delay based on personality
     */
    getRandomDelay() {
        const personality = this.personalityEngine.getCurrentPersonality();
        const baseDelay = 3000; // 3 seconds base
        
        if (!personality) return baseDelay + Math.random() * 2000;
        
        switch (personality.type) {
            case 'casual':
                return baseDelay * 0.7 + Math.random() * 1000; // Faster
            case 'researcher':
                return baseDelay * 1.5 + Math.random() * 3000; // Slower
            case 'professional':
                return baseDelay * 1.2 + Math.random() * 2000; // Moderate
            case 'explorer':
                return baseDelay * 0.9 + Math.random() * 1500; // Slightly faster
            default:
                return baseDelay + Math.random() * 2000;
        }
    }

    /**
     * Utility delay function
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }



    /**
     * Cleanup resources
     */
    cleanup() {
        // Remove event listeners
        this.eventListeners.forEach(({ type, listener }) => {
            document.removeEventListener(type, listener);
        });
        
        // Stop monitoring
        this.stealthMonitor.stopMonitoring();
        
        // Stop automation if running
        if (this.isRunning) {
            this.stopAutomation();
        }
    }
}

// Pre-initialize stealth modules to ensure availability
if (typeof window !== 'undefined') {
    // Ensure stealth modules are available immediately
    if (typeof window._stealth_delay === 'undefined') {
        window._stealth_delay = class PreInitStealthDelay {
            constructor() {
                this.delayHistory = [];
            }
            async wait(ms) { 
                this.delayHistory.push({ delay: ms, type: 'wait', timestamp: Date.now() });
                return new Promise(resolve => setTimeout(resolve, ms)); 
            }
            async waitRandom(min, max) { 
                const delay = Math.random() * (max - min) + min;
                this.delayHistory.push({ delay: delay, type: 'random', timestamp: Date.now() });
                return new Promise(resolve => setTimeout(resolve, delay)); 
            }
            getDelayStats() {
                return { averageDelay: 0, totalDelays: this.delayHistory.length, delayTypes: {}, patternAnalysis: 'pre_init' };
            }
        };
    }
    
    if (typeof window._stealth_storage === 'undefined') {
        window._stealth_storage = class PreInitStealthStorage {
            constructor() {
                this.prefix = 'stealth_';
                this.maxStorageSize = 1024 * 1024; // 1MB
            }
            set(key, value) { 
                try { 
                    const fullKey = this.prefix + key;
                    const data = { value: value, timestamp: Date.now() };
                    localStorage.setItem(fullKey, JSON.stringify(data)); 
                } catch (e) { 
                    console.warn('Pre-init storage set failed:', e.message);
                } 
            }
            get(key) { 
                try { 
                    const fullKey = this.prefix + key;
                    const item = localStorage.getItem(fullKey); 
                    return item ? JSON.parse(item).value : null; 
                } catch (e) { 
                    console.warn('Pre-init storage get failed:', e.message);
                    return null; 
                } 
            }
            remove(key) {
                try {
                    const fullKey = this.prefix + key;
                    localStorage.removeItem(fullKey);
                } catch (e) {
                    console.warn('Pre-init storage remove failed:', e.message);
                }
            }
            clear() {
                try {
                    const keys = Object.keys(localStorage);
                    keys.forEach(key => {
                        if (key.startsWith(this.prefix)) {
                            localStorage.removeItem(key);
                        }
                    });
                } catch (e) {
                    console.warn('Pre-init storage clear failed:', e.message);
                }
            }
            getStats() {
                return { keyCount: 0, totalSize: 0, maxSize: this.maxStorageSize, usagePercent: 0 };
            }
        };
    }
}

// Initialize automation when content script loads with enhanced stealth protection
let automationPro = null;

// Function to initialize automation with dependency checks
function initializeAutomation() {
    if (typeof window !== 'undefined' && !window.AdSenseAutomationProInstance) {
        try {
            // Check if required dependencies are available
            if (typeof AdSenseAutomationPro === 'undefined') {
                console.warn('AdSenseAutomationPro class not available, retrying...');
                setTimeout(initializeAutomation, 1000); // Retry after 1 second
                return;
            }
            
            // Enhanced stealth modules check with immediate fallback creation
            const stealthDelayAvailable = typeof window._stealth_delay !== 'undefined';
            const stealthStorageAvailable = typeof window._stealth_storage !== 'undefined';
            
            // Create fallback modules immediately if not available
            if (!stealthDelayAvailable) {
                console.log('Creating fallback StealthDelay module...');
                window._stealth_delay = class FallbackStealthDelay {
                    constructor() {
                        this.delayHistory = [];
                    }
                    async wait(ms) { 
                        this.delayHistory.push({ delay: ms, type: 'wait', timestamp: Date.now() });
                        return new Promise(resolve => setTimeout(resolve, ms)); 
                    }
                    async waitRandom(min, max) { 
                        const delay = Math.random() * (max - min) + min;
                        this.delayHistory.push({ delay: delay, type: 'random', timestamp: Date.now() });
                        return new Promise(resolve => setTimeout(resolve, delay)); 
                    }
                    getDelayStats() {
                        return { averageDelay: 0, totalDelays: this.delayHistory.length, delayTypes: {}, patternAnalysis: 'fallback' };
                    }
                };
            }
            
            if (!stealthStorageAvailable) {
                console.log('Creating fallback StealthStorage module...');
                window._stealth_storage = class FallbackStealthStorage {
                    constructor() {
                        this.prefix = 'stealth_';
                        this.maxStorageSize = 1024 * 1024; // 1MB
                    }
                    set(key, value) { 
                        try { 
                            const fullKey = this.prefix + key;
                            const data = { value: value, timestamp: Date.now() };
                            localStorage.setItem(fullKey, JSON.stringify(data)); 
                        } catch (e) { 
                            console.warn('Fallback storage set failed:', e.message);
                        } 
                    }
                    get(key) { 
                        try { 
                            const fullKey = this.prefix + key;
                            const item = localStorage.getItem(fullKey); 
                            return item ? JSON.parse(item).value : null; 
                        } catch (e) { 
                            console.warn('Fallback storage get failed:', e.message);
                            return null; 
                        } 
                    }
                    remove(key) {
                        try {
                            const fullKey = this.prefix + key;
                            localStorage.removeItem(fullKey);
                        } catch (e) {
                            console.warn('Fallback storage remove failed:', e.message);
                        }
                    }
                    clear() {
                        try {
                            const keys = Object.keys(localStorage);
                            keys.forEach(key => {
                                if (key.startsWith(this.prefix)) {
                                    localStorage.removeItem(key);
                                }
                            });
                        } catch (e) {
                            console.warn('Fallback storage clear failed:', e.message);
                        }
                    }
                    getStats() {
                        return { keyCount: 0, totalSize: 0, maxSize: this.maxStorageSize, usagePercent: 0 };
                    }
                };
            }
            
            // Log status after fallback creation
            if (!stealthDelayAvailable || !stealthStorageAvailable) {
                console.log(`Stealth modules created - Delay: ${typeof window._stealth_delay !== 'undefined'}, Storage: ${typeof window._stealth_storage !== 'undefined'}`);
            }
            
            automationPro = new AdSenseAutomationPro();
            window.AdSenseAutomationProInstance = automationPro;
            automationPro.initialize();
            console.log('Automation initialized successfully');
        } catch (error) {
            console.warn('Failed to initialize automation:', error.message);
        }
    }
}

// Enhanced check if already initialized to prevent duplication
if (typeof window !== 'undefined' && window.AdSenseAutomationProInstance) {
    console.log('Automation already initialized, skipping...');
    automationPro = window.AdSenseAutomationProInstance;
} else {
    // Initialize immediately with multiple attempts
    console.log('Starting automation initialization...');
    
    // First attempt - immediate
    initializeAutomation();
    
    // Second attempt - after DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(initializeAutomation, 50); // Very short delay
        });
    } else {
        setTimeout(initializeAutomation, 50); // Very short delay
    }
    
    // Third attempt - after window load
    window.addEventListener('load', () => {
        setTimeout(initializeAutomation, 100);
    });
}

// Cleanup on page unload with graceful handling
window.addEventListener('beforeunload', () => {
    try {
        if (automationPro) {
            // Try to save session before cleanup
            if (automationPro.sessionManager && automationPro.sessionManager.currentSession) {
                automationPro.sessionManager.saveSession().catch(error => {
                    console.debug('Session save during cleanup failed:', error.message);
                });
            }
            
            // Perform cleanup
            automationPro.cleanup();
        }
    } catch (error) {
        console.debug('Cleanup during page unload failed:', error.message);
    }
});

// Export for debugging
window.AdSenseAutomationPro = automationPro;
