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
        
        // Initialize Multilogin Optimizer for RPM enhancement
        this.multiloginOptimizer = null;
        this.initializeMultiloginOptimizer();
        
        // Event listeners
        this.eventListeners = [];
        
        // Message handling
        this.setupMessageHandling();
    }

    /**
     * Initialize Multilogin Optimizer with retry mechanism
     */
    async initializeMultiloginOptimizer() {
        try {
            // Wait for MultiloginOptimizer to be available
            const isAvailable = await this.waitForMultiloginOptimizer();
            
            if (isAvailable && typeof MultiloginOptimizer !== 'undefined') {
                this.multiloginOptimizer = new MultiloginOptimizer();
                console.log('MultiloginOptimizer initialized successfully');
            } else {
                console.warn('MultiloginOptimizer not available, continuing without it');
            }
        } catch (error) {
            console.warn('Failed to initialize MultiloginOptimizer:', error);
        }
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
            
            // Initialize Multilogin Optimizer
            if (this.multiloginOptimizer) {
                await this.multiloginOptimizer.initialize();
            }
            
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
                
                // Simulate reading behavior
                await this.simulateReadingBehavior();
                
                // Simulate navigation
                await this.simulateNavigation();
                
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
     * Simulate reading behavior
     */
    async simulateReadingBehavior() {
        try {
            // Analyze content
            const contentType = this.readingSimulator.detectContentType();
            const contentQuality = this.readingSimulator.analyzeContentQuality();
            
            // Simulate reading
            await this.readingSimulator.simulateReadingBehavior(contentType, contentQuality);
            
            // Record reading interaction
            this.sessionManager.addInteraction({
                type: 'reading',
                contentType: contentType,
                contentQuality: contentQuality,
                duration: 5000 + Math.random() * 10000
            });
            
        } catch (error) {
            console.error('Reading behavior simulation error:', error);
        }
    }

    /**
     * Simulate navigation
     */
    async simulateNavigation() {
        try {
            // Intelligent navigation based on personality
            await this.navigationSimulator.simulateIntelligentNavigation();
            
            // Record navigation interaction
            this.sessionManager.addInteraction({
                type: 'navigation',
                url: window.location.href,
                title: document.title
            });
            
            // Add page visit to session
            this.sessionManager.addPageVisit({
                url: window.location.href,
                title: document.title,
                timeSpent: 30000 + Math.random() * 60000, // 30-90 seconds
                scrollDepth: Math.random() * 100,
                readingTime: 15000 + Math.random() * 30000
            });
            
        } catch (error) {
            console.error('Navigation simulation error:', error);
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
     * Wait for MultiloginOptimizer to be available
     */
    async waitForMultiloginOptimizer() {
        let attempts = 0;
        const maxAttempts = 10;
        
        while (attempts < maxAttempts) {
            if (typeof MultiloginOptimizer !== 'undefined') {
                return true;
            }
            await this.delay(500);
            attempts++;
        }
        return false;
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

// Initialize automation when content script loads with enhanced stealth protection
let automationPro = null;

// Enhanced check if already initialized to prevent duplication
if (typeof window !== 'undefined' && window.AdSenseAutomationProInstance) {
    console.log('Automation already initialized, skipping...');
    automationPro = window.AdSenseAutomationProInstance;
} else {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (typeof window !== 'undefined' && !window.AdSenseAutomationProInstance) {
                try {
                    automationPro = new AdSenseAutomationPro();
                    window.AdSenseAutomationProInstance = automationPro;
                    automationPro.initialize();
                } catch (error) {
                    console.warn('Failed to initialize automation:', error);
                }
            }
        });
    } else {
        if (typeof window !== 'undefined' && !window.AdSenseAutomationProInstance) {
            try {
                automationPro = new AdSenseAutomationPro();
                window.AdSenseAutomationProInstance = automationPro;
                automationPro.initialize();
            } catch (error) {
                console.warn('Failed to initialize automation:', error);
            }
        }
    }
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (automationPro) {
        automationPro.cleanup();
    }
});

// Export for debugging
window.AdSenseAutomationPro = automationPro;
