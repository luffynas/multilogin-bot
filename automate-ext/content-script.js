/**
 * AdSense Automation Pro - Main Content Script
 * Integrates all automation libraries for AdSense optimization and RPM improvement
 */

/**
 * Module Loader for proper dependency management
 */
class ModuleLoader {
    constructor() {
        this.loadedModules = new Map();
        this.loadingPromises = new Map();
    }
    
    async loadModule(moduleName, modulePath) {
        if (this.loadedModules.has(moduleName)) {
            return this.loadedModules.get(moduleName);
        }
        
        if (this.loadingPromises.has(moduleName)) {
            return this.loadingPromises.get(moduleName);
        }
        
        const loadPromise = this._loadModuleFromPath(moduleName, modulePath);
        this.loadingPromises.set(moduleName, loadPromise);
        
        try {
            const module = await loadPromise;
            this.loadedModules.set(moduleName, module);
            this.loadingPromises.delete(moduleName);
            return module;
        } catch (error) {
            this.loadingPromises.delete(moduleName);
            throw new Error(`Failed to load module ${moduleName}: ${error.message}`);
        }
    }
    
    async _loadModuleFromPath(moduleName, modulePath) {
        // Check if module is already available globally (injected by background script)
        if (window[moduleName]) {
            return window[moduleName];
        }
        
        // If module is not available, it means background script didn't inject it properly
        // This should not happen in normal operation, but we'll handle it gracefully
        console.warn(`Module ${moduleName} not found globally, this indicates an injection issue`);
        
        // Try to load module from actual file as fallback
        const script = document.createElement('script');
        script.src = chrome.runtime.getURL(modulePath);
        
        return new Promise((resolve, reject) => {
            script.onload = () => {
                if (window[moduleName]) {
                    resolve(window[moduleName]);
                } else {
                    reject(new Error(`Module ${moduleName} not found after loading`));
                }
            };
            script.onerror = () => reject(new Error(`Failed to load script: ${modulePath}`));
            document.head.appendChild(script);
        });
    }
}

/**
 * Automation Module Factory
 */
class AutomationModuleFactory {
    constructor(moduleLoader) {
        this.moduleLoader = moduleLoader;
    }
    
    async createPersonalityEngine() {
        const PersonalityEngine = await this.moduleLoader.loadModule('PersonalityEngine', 'lib/personality-engine.js');
        return new PersonalityEngine();
    }
    
    async createBehaviorSimulator(personalityEngine) {
        const BehaviorSimulator = await this.moduleLoader.loadModule('BehaviorSimulator', 'lib/behavior-simulator.js');
        return new BehaviorSimulator(personalityEngine);
    }
    
    async createMouseSimulator(behaviorSimulator) {
        const MouseSimulator = await this.moduleLoader.loadModule('MouseSimulator', 'lib/mouse-simulator.js');
        return new MouseSimulator(behaviorSimulator);
    }
    
    async createKeyboardSimulator(behaviorSimulator) {
        const KeyboardSimulator = await this.moduleLoader.loadModule('KeyboardSimulator', 'lib/keyboard-simulator.js');
        return new KeyboardSimulator(behaviorSimulator);
    }
    
    async createReadingSimulator(behaviorSimulator) {
        const ReadingSimulator = await this.moduleLoader.loadModule('ReadingSimulator', 'lib/reading-simulator.js');
        return new ReadingSimulator(behaviorSimulator);
    }
    
    async createNavigationSimulator(behaviorSimulator) {
        const NavigationSimulator = await this.moduleLoader.loadModule('NavigationSimulator', 'lib/navigation-simulator.js');
        return new NavigationSimulator(behaviorSimulator);
    }
    
    async createAdSenseDetector() {
        const ContentAnalyzer = await this.moduleLoader.loadModule('ContentAnalyzer', 'lib/adsense-detector.js');
        return new ContentAnalyzer();
    }
    
    async createSessionManager() {
        const SessionManager = await this.moduleLoader.loadModule('SessionManager', 'lib/session-manager.js');
        return new SessionManager();
    }
    
    async createStealthMonitor() {
        const StealthMonitor = await this.moduleLoader.loadModule('StealthMonitor', 'lib/stealth-monitor.js');
        return new StealthMonitor();
    }
    
    async createAnalyticsMonitor() {
        const AnalyticsMonitor = await this.moduleLoader.loadModule('AnalyticsMonitor', 'lib/analytics-monitor.js');
        return new AnalyticsMonitor();
    }
    
    async createDynamicAdaptationEngine() {
        const DynamicAdaptationEngine = await this.moduleLoader.loadModule('DynamicAdaptationEngine', 'lib/dynamic-adaptation-engine.js');
        return new DynamicAdaptationEngine();
    }
    
    async createEnhancedFraudPrevention() {
        const EnhancedFraudPrevention = await this.moduleLoader.loadModule('EnhancedFraudPrevention', 'lib/enhanced-fraud-prevention.js');
        return new EnhancedFraudPrevention();
    }
    
    async createStealthDelay() {
        const StealthDelay = await this.moduleLoader.loadModule('StealthDelay', 'lib/stealth-delay.js');
        return new StealthDelay();
    }
    
    // ✅ INTEGRATED: Add missing create functions for flow-chart modules
    async createAdvancedMousePhysics() {
        const AdvancedMousePhysics = await this.moduleLoader.loadModule('AdvancedMousePhysics', 'lib/advanced-mouse-physics.js');
        return new AdvancedMousePhysics();
    }
    
    async createNetworkTrafficSimulator() {
        const NetworkTrafficSimulator = await this.moduleLoader.loadModule('NetworkTrafficSimulator', 'lib/network-traffic-simulator.js');
        return new NetworkTrafficSimulator();
    }
    
    async createMLBehaviorEngine() {
        const MLBehaviorEngine = await this.moduleLoader.loadModule('MLBehaviorEngine', 'lib/ml-behavior-engine.js');
        return new MLBehaviorEngine();
    }
    
    async createAdvancedBotEvasion() {
        const AdvancedBotEvasion = await this.moduleLoader.loadModule('AdvancedBotEvasion', 'lib/advanced-bot-evasion.js');
        return new AdvancedBotEvasion();
    }
    
    async createStealthStorage() {
        const StealthStorage = await this.moduleLoader.loadModule('StealthStorage', 'lib/stealth-storage.js');
        return new StealthStorage();
    }
    
    async createAllModules() {
        // Load StealthDelay first as it's a dependency for other modules
        const stealthDelay = await this.createStealthDelay();
        
        const personalityEngine = await this.createPersonalityEngine();
        const behaviorSimulator = await this.createBehaviorSimulator(personalityEngine);
        const mouseSimulator = await this.createMouseSimulator(behaviorSimulator);
        const keyboardSimulator = await this.createKeyboardSimulator(behaviorSimulator);
        const readingSimulator = await this.createReadingSimulator(behaviorSimulator);
        const navigationSimulator = await this.createNavigationSimulator(behaviorSimulator);
        const adsenseDetector = await this.createAdSenseDetector();
        const sessionManager = await this.createSessionManager();
        const stealthMonitor = await this.createStealthMonitor();
        const analyticsMonitor = await this.createAnalyticsMonitor();
        const dynamicAdaptationEngine = await this.createDynamicAdaptationEngine();
        const enhancedFraudPrevention = await this.createEnhancedFraudPrevention();
        
        // ✅ INTEGRATED: Add missing modules from flow-chart
        const advancedMousePhysics = await this.createAdvancedMousePhysics();
        const networkTrafficSimulator = await this.createNetworkTrafficSimulator();
        const mlBehaviorEngine = await this.createMLBehaviorEngine();
        const advancedBotEvasion = await this.createAdvancedBotEvasion();
        const stealthStorage = await this.createStealthStorage();
        
        return {
            stealthDelay,
            personalityEngine,
            behaviorSimulator,
            mouseSimulator,
            keyboardSimulator,
            readingSimulator,
            navigationSimulator,
            adsenseDetector,
            sessionManager,
            stealthMonitor,
            analyticsMonitor,
            dynamicAdaptationEngine,
            enhancedFraudPrevention,
            // ✅ INTEGRATED: Missing modules
            advancedMousePhysics,
            networkTrafficSimulator,
            mlBehaviorEngine,
            advancedBotEvasion,
            stealthStorage
        };
    }
}

/**
 * Automation State Machine
 */
class AutomationStateMachine {
    constructor() {
        this.currentState = 'idle';
        this.states = {
            idle: { next: ['initializing', 'stopped', 'error'] },
            initializing: { next: ['idle', 'running', 'error'] },
            running: { next: ['paused', 'stopping', 'error'] },
            paused: { next: ['running', 'stopping', 'error'] },
            stopping: { next: ['stopped', 'error'] },
            stopped: { next: ['idle', 'error'] },
            error: { next: ['idle', 'stopped'] }
        };
        this.stateHistory = [];
    }
    
    transition(newState) {
        if (!this.states[this.currentState].next.includes(newState)) {
            throw new Error(`Invalid state transition from ${this.currentState} to ${newState}`);
        }
        
        this.stateHistory.push({
            from: this.currentState,
            to: newState,
            timestamp: Date.now()
        });
        
        this.currentState = newState;
        return this.currentState;
    }
    
    canTransitionTo(state) {
        return this.states[this.currentState].next.includes(state);
    }
    
    /**
     * Safe state transition with error handling
     */
    safeTransition(newState) {
        try {
            if (this.canTransitionTo(newState)) {
                return this.transition(newState);
            } else {
                console.warn(`Cannot transition from ${this.currentState} to ${newState}, forcing transition`);
                // Force transition for error recovery
                this.stateHistory.push({
                    from: this.currentState,
                    to: newState,
                    timestamp: Date.now(),
                    forced: true
                });
                this.currentState = newState;
                return this.currentState;
            }
        } catch (error) {
            console.warn(`State transition failed: ${error.message}, forcing to ${newState}`);
            this.currentState = newState;
            return this.currentState;
        }
    }
    
    /**
     * Validate current state
     */
    validateState() {
        const validStates = ['idle', 'initializing', 'running', 'paused', 'stopping', 'stopped', 'error'];
        if (!validStates.includes(this.currentState)) {
            console.warn(`Invalid state detected: ${this.currentState}, resetting to idle`);
            this.currentState = 'idle';
        }
        return this.currentState;
    }
}

/**
 * Automation Manager - Singleton for managing automation lifecycle
 */
class AutomationManager {
    static instance = null;
    static isInitializing = false;
    static initializationPromise = null;
    
    constructor() {
        if (AutomationManager.instance) {
            return AutomationManager.instance;
        }
        
        this.automationInstance = null;
        this.isInitialized = false;
        this.state = 'idle'; // idle, initializing, running, stopped, error
        this.initializationPromise = null;
        this.cleanupPromise = null;
        this.isCleaningUp = false;
        
        AutomationManager.instance = this;
    }
    
    static getInstance() {
        if (!AutomationManager.instance) {
            AutomationManager.instance = new AutomationManager();
        }
        return AutomationManager.instance;
    }
    
    async initialize() {
        if (this.isInitialized) {
            return this.automationInstance;
        }
        
        // Check if initialization is already in progress
        if (AutomationManager.isInitializing && AutomationManager.initializationPromise) {
            return AutomationManager.initializationPromise;
        }
        
        // Check if cleanup is in progress
        if (this.isCleaningUp && this.cleanupPromise) {
            await this.cleanupPromise;
        }
        
        AutomationManager.isInitializing = true;
        this.state = 'initializing';
        
        try {
            this.initializationPromise = this._performInitialization();
            AutomationManager.initializationPromise = this.initializationPromise;
            
            this.automationInstance = await this.initializationPromise;
            this.isInitialized = true;
            this.state = 'idle';
            return this.automationInstance;
        } catch (error) {
            this.state = 'error';
            throw error;
        } finally {
            AutomationManager.isInitializing = false;
            AutomationManager.initializationPromise = null;
            this.initializationPromise = null;
        }
    }
    
    async _performInitialization() {
        // Create module factory and load all modules
        const moduleLoader = new ModuleLoader();
        const moduleFactory = new AutomationModuleFactory(moduleLoader);
        const modules = await moduleFactory.createAllModules();
        
        // Create automation instance with dependency injection
        const automationInstance = new PageProcessor(modules);
        
        // Initialize the automation instance
        await automationInstance.initialize();
        
        return automationInstance;
    }
    
    checkInitialized() {
        return this.isInitialized;
    }
    
    getAutomationInstance() {
        return this.automationInstance;
    }
    
    getState() {
        return this.state;
    }
    
    async cleanup() {
        if (!this.isInitialized || !this.automationInstance) {
            return;
        }
        
        // Check if cleanup is already in progress
        if (this.isCleaningUp && this.cleanupPromise) {
            return this.cleanupPromise;
        }
        
        // Check if initialization is in progress
        if (AutomationManager.isInitializing && AutomationManager.initializationPromise) {
            await AutomationManager.initializationPromise;
        }
        
        this.isCleaningUp = true;
        this.cleanupPromise = this._performCleanup();
        
        try {
            await this.cleanupPromise;
        } finally {
            this.isCleaningUp = false;
            this.cleanupPromise = null;
        }
    }
    
    async _performCleanup() {
        try {
            // Don't set state to 'stopped' immediately
            // Let the cleanup process determine the final state
            
            // Stop automation if running
            if (this.automationInstance && this.automationInstance.isRunning) {
                await this.automationInstance.stopAutomation();
            }
            
            // Cleanup automation instance
            if (this.automationInstance && typeof this.automationInstance.cleanup === 'function') {
                await this.automationInstance.cleanup();
            }
            
            this.automationInstance = null;
            this.isInitialized = false;
            this.state = 'idle';  // Set to idle only if cleanup succeeds
            
        } catch (error) {
            console.error('Error during automation cleanup:', error);
            this.state = 'error';  // Can transition to 'error' from any state
        }
    }
    
    static reset() {
        if (AutomationManager.instance) {
            AutomationManager.instance.cleanup();
            AutomationManager.instance = null;
        }
        AutomationManager.isInitializing = false;
    }
}

/**
 * Error Recovery Manager
 */
class ErrorRecoveryManager {
    constructor() {
        this.errorHistory = [];
        this.recoveryStrategies = new Map();
        this.maxRetries = 3;
    }
    
    registerRecoveryStrategy(errorType, strategy) {
        this.recoveryStrategies.set(errorType, strategy);
    }
    
    async handleError(error, context) {
        const errorInfo = {
            error: error.message,
            stack: error.stack,
            context: context,
            timestamp: Date.now()
        };
        
        this.errorHistory.push(errorInfo);
        
        // Find recovery strategy
        const strategy = this.recoveryStrategies.get(error.constructor.name);
        if (strategy) {
            try {
                return await strategy(error, context);
            } catch (recoveryError) {
                console.error('Recovery strategy failed:', recoveryError);
                throw recoveryError;
            }
        }
        
        // Default recovery
        return this.defaultRecovery(error, context);
    }
    
    async defaultRecovery(error, context) {
        if (this.errorHistory.length >= this.maxRetries) {
            throw new Error(`Maximum retry attempts reached: ${error.message}`);
        }
        
        // Wait before retry
        const delay = 1000 * this.errorHistory.length;
        await new Promise(resolve => setTimeout(resolve, delay));
        return { shouldRetry: true, delay: delay };
    }
}

class PageProcessor {
    constructor(dependencies = {}) {
        this.isInitialized = false;
        this.isRunning = false;
        this.automationConfig = {
            enabled: true,
            autoStart: true,
            targetRPM: 0,
            personalityType: 'auto',
            automationLevel: 'medium',
            stealthMode: true,
            debugMode: true
        };
        
        // Validate required dependencies
        this._validateDependencies(dependencies);
        
        // Inject dependencies
        this.stealthDelay = dependencies.stealthDelay;
        this.personalityEngine = dependencies.personalityEngine;
        this.behaviorSimulator = dependencies.behaviorSimulator;
        this.mouseSimulator = dependencies.mouseSimulator;
        this.keyboardSimulator = dependencies.keyboardSimulator;
        this.readingSimulator = dependencies.readingSimulator;
        this.navigationSimulator = dependencies.navigationSimulator;
        this.adsenseDetector = dependencies.adsenseDetector;
        this.sessionManager = dependencies.sessionManager;
        this.stealthMonitor = dependencies.stealthMonitor;
        this.analyticsMonitor = dependencies.analyticsMonitor;
        this.dynamicAdaptationEngine = dependencies.dynamicAdaptationEngine;
        this.enhancedFraudPrevention = dependencies.enhancedFraudPrevention;
        
        // ✅ INTEGRATED: Inject missing modules from flow-chart
        this.advancedMousePhysics = dependencies.advancedMousePhysics;
        this.networkTrafficSimulator = dependencies.networkTrafficSimulator;
        this.mlBehaviorEngine = dependencies.mlBehaviorEngine;
        this.advancedBotEvasion = dependencies.advancedBotEvasion;
        this.stealthStorage = dependencies.stealthStorage;
        
        // Initialize state machine and error recovery
        this.stateMachine = new AutomationStateMachine();
        this.errorRecovery = new ErrorRecoveryManager();
        
        // Register error recovery strategies
        this.errorRecovery.registerRecoveryStrategy('TypeError', async (error, context) => {
            if (error.message.includes('Cannot read properties of undefined')) {
                console.warn('Undefined property access detected, retrying...');
                return { shouldRetry: true, delay: 1000 };
            }
            return { shouldRetry: false };
        });
        
        this.errorRecovery.registerRecoveryStrategy('ReferenceError', async (error, context) => {
            if (error.message.includes('is not defined')) {
                console.warn('Undefined reference detected, retrying...');
                return { shouldRetry: true, delay: 2000 };
            }
            return { shouldRetry: false };
        });
        
        // Event listeners
        this.eventListeners = [];
        
        // Reading and navigation state
        this.readingCompleted = false;
        this.lastReadingTime = 0;
        this.sessionStartTime = 0;
        
        // Message handling
        this.setupMessageHandling();
    }

    _validateDependencies(dependencies) {
        try {
            const requiredDeps = [
                'stealthDelay', 'personalityEngine', 'behaviorSimulator', 'mouseSimulator',
                'keyboardSimulator', 'readingSimulator', 'navigationSimulator',
                'adsenseDetector', 'sessionManager', 'stealthMonitor',
                'analyticsMonitor', 'dynamicAdaptationEngine', 'enhancedFraudPrevention'
            ];
            
            const missingDeps = requiredDeps.filter(dep => !dependencies[dep]);
            if (missingDeps.length > 0) {
                throw new Error(`Missing required dependencies: ${missingDeps.join(', ')}`);
            }
            
            // Validate that dependencies are actually objects/functions
            const invalidDeps = requiredDeps.filter(dep => {
                const depValue = dependencies[dep];
                return !depValue || (typeof depValue !== 'object' && typeof depValue !== 'function');
            });
            
            if (invalidDeps.length > 0) {
                throw new Error(`Invalid dependencies (not objects/functions): ${invalidDeps.join(', ')}`);
            }
            
            // Validate that dependencies have required methods
            const requiredMethods = {
                'stealthDelay': ['wait', 'waitRandom', 'generateDelay'],
                'personalityEngine': ['getCurrentPersonality', 'loadPersonality'],
                'behaviorSimulator': ['initialize', 'getBehaviorStatus'],
                'mouseSimulator': ['initialize', 'moveTo', 'click'],
                'keyboardSimulator': ['typeText'],
                'readingSimulator': ['detectContentType', 'analyzeContentQuality', 'simulateReadingBehavior'],
                'navigationSimulator': ['initialize', 'simulateIntelligentNavigation'],
                'adsenseDetector': ['analyzeContent', 'processElementInteraction', 'getSessionSummary'],
                'sessionManager': ['initialize', 'startSession', 'endSession', 'getCurrentSession', 'getSessionSummary', 'addInteraction', 'addPageVisit', 'updateAdSenseData', 'exportSessionData', 'getSessionAnalytics'],
                'stealthMonitor': ['initialize', 'recordBehaviorPattern', 'getStealthStatus', 'getStealthMetrics', 'getDetectionSignals', 'stopMonitoring'],
                'analyticsMonitor': ['initialize', 'trackPageView', 'trackAdView', 'trackAdClick', 'trackNavigation', 'trackReadingTime', 'getAnalyticsReport', 'cleanup'],
                'dynamicAdaptationEngine': ['initialize', 'resetSessionAdaptations', 'getCurrentRiskAssessment', 'cleanup'],
                'enhancedFraudPrevention': ['initialize', 'cleanup']
            };
            
            const missingMethods = [];
            Object.entries(requiredMethods).forEach(([depName, methods]) => {
                if (dependencies[depName]) {
                    methods.forEach(method => {
                        if (typeof dependencies[depName][method] !== 'function') {
                            missingMethods.push(`${depName}.${method}`);
                        }
                    });
                }
            });
            
            if (missingMethods.length > 0) {
                throw new Error(`Missing required methods: ${missingMethods.join(', ')}`);
            }
        } catch (error) {
            console.error('Dependency validation error:', error);
            throw error;
        }
    }



    /**
     * Initialize the automation system with state machine, error recovery, enhanced validation, dependency injection, and proper module loading
     */
    async initialize() {
        if (this.isInitialized) return;
        
        try {
            this.stateMachine.transition('initializing');
            
            // Stealth logging - minimal console output
            if (this.automationConfig.debugMode) {
                console.log('Initializing automation system...');
            }
            
            // Initialize all components with error recovery
            try {
            await this.personalityEngine.loadPersonality();
            await this.behaviorSimulator.initialize();
            this.mouseSimulator.initialize();
            await this.sessionManager.initialize();
            this.stealthMonitor.initialize();
            
            // Initialize navigation simulator (DOM is ready at this point)
            this.navigationSimulator.initialize();
            
            // Initialize new advanced systems
            this.analyticsMonitor.initialize();
            
            // Initialize dynamic adaptation engine (DOM is ready at this point)
            this.dynamicAdaptationEngine.initialize(this.analyticsMonitor);
            this.dynamicAdaptationEngine.resetSessionAdaptations(); // Reset adaptations for new session
            
            this.enhancedFraudPrevention.initialize();
            
            // ✅ INTEGRATED: Initialize missing modules from flow-chart
            this.advancedMousePhysics.initialize();
            this.networkTrafficSimulator.initialize();
            this.mlBehaviorEngine.initialize();
            this.advancedBotEvasion.initialize();
            this.stealthStorage.initialize();
            } catch (initError) {
                console.error('Component initialization error:', initError);
                const recovery = await this.errorRecovery.handleError(initError, 'component_initialization');
                if (recovery.shouldRetry) {
                    console.log('Retrying component initialization after error recovery...');
                    await this.delay(recovery.delay || 2000);
                    return this.initialize();
                }
                throw initError;
            }
            
            // Set session start time for navigation tracking
            this.sessionStartTime = Date.now();
            console.log(`🕐 Session started at: ${new Date(this.sessionStartTime).toLocaleTimeString()}`);
            
            // Load configuration
            await this.loadConfiguration();
            
            // Setup event listeners
            this.setupEventListeners();
            
            this.isInitialized = true;
            this.stateMachine.transition('idle');
            
            // Stealth logging - minimal console output
            if (this.automationConfig.debugMode) {
                console.log('Automation system ready');
            }
            
            // Send initialization complete message
            if (this.isExtensionContextValid()) {
                this.sendMessage('initializationComplete', {
                    status: 'success',
                    config: this.automationConfig
                });
            }
            
        } catch (error) {
            // Enhanced error handling - always show critical errors
            console.error('❌ Automation initialization failed:', error.message);
            console.error('Error stack:', error.stack);
            
            this.stateMachine.transition('error');
            
            // Always show initialization issues for debugging
            console.warn('⚠️ Initialization issue detected - check error above');
            
            if (this.isExtensionContextValid()) {
                this.sendMessage('initializationComplete', {
                    status: 'error',
                    error: error.message
                });
            }
            
            throw error;
        }
    }

    /**
     * Load configuration from storage with error recovery, state machine, enhanced validation, and dependency injection
     */
    async loadConfiguration() {
        try {
            // Check if extension context is valid
            if (!this.isExtensionContextValid()) {
                console.warn('Extension context invalid, skipping configuration load');
                return;
            }
            
            const result = await chrome.storage.local.get(['automationConfig']);
            if (result.automationConfig) {
                this.automationConfig = { ...this.automationConfig, ...result.automationConfig };
            }
        } catch (error) {
            console.warn('Failed to load configuration:', error);
            
            // Handle error with recovery manager
            const recovery = await this.errorRecovery.handleError(error, 'load_configuration');
            if (recovery.shouldRetry) {
                console.log('Retrying configuration load after error recovery...');
                await this.delay(recovery.delay || 1000);
                return this.loadConfiguration();
            }
        }
    }

    /**
     * Save configuration to storage with error recovery, state machine, enhanced validation, and dependency injection
     */
    async saveConfiguration() {
        try {
            // Check if extension context is valid
            if (!this.isExtensionContextValid()) {
                console.warn('Extension context invalid, skipping configuration save');
                return;
            }
            
            await chrome.storage.local.set({
                automationConfig: this.automationConfig
            });
        } catch (error) {
            console.warn('Failed to save configuration:', error);
            
            // Handle error with recovery manager
            const recovery = await this.errorRecovery.handleError(error, 'save_configuration');
            if (recovery.shouldRetry) {
                console.log('Retrying configuration save after error recovery...');
                await this.delay(recovery.delay || 1000);
                return this.saveConfiguration();
            }
        }
    }

    /**
     * Setup event listeners for user interactions with error recovery, enhanced validation, and dependency injection
     */
    setupEventListeners() {
        try {
            // Clear existing listeners first
            this.cleanupEventListeners();
            
        // Mouse movement tracking
        const mouseMoveListener = (event) => {
                try {
            this.stealthMonitor.recordBehaviorPattern('mouse_movement', {
                x: event.clientX,
                y: event.clientY,
                timestamp: Date.now()
            });
                } catch (error) {
                    console.warn('Error recording mouse movement:', error);
                }
        };
        
        // Click tracking
        const clickListener = (event) => {
                try {
            this.stealthMonitor.recordBehaviorPattern('click', {
                x: event.clientX,
                y: event.clientY,
                target: event.target.tagName,
                timestamp: Date.now()
            });
                } catch (error) {
                    console.warn('Error recording click:', error);
                }
        };
        
        // Scroll tracking
        const scrollListener = (event) => {
                try {
            this.stealthMonitor.recordBehaviorPattern('scroll', {
                deltaX: event.deltaX,
                deltaY: event.deltaY,
                timestamp: Date.now()
            });
                } catch (error) {
                    console.warn('Error recording scroll:', error);
                }
        };
        
        // Typing tracking
        const keydownListener = (event) => {
                try {
            this.stealthMonitor.recordBehaviorPattern('typing', {
                key: event.key,
                isTypo: false,
                isBackspace: event.key === 'Backspace',
                timestamp: Date.now()
            });
                } catch (error) {
                    console.warn('Error recording typing:', error);
                }
            };
        
        // Store for cleanup
        this.eventListeners = [
            { type: 'mousemove', listener: mouseMoveListener },
            { type: 'click', listener: clickListener },
            { type: 'scroll', listener: scrollListener },
            { type: 'keydown', listener: keydownListener }
        ];
            
            // Add listeners
            this.eventListeners.forEach(({ type, listener }) => {
                try {
                    document.addEventListener(type, listener);
                } catch (error) {
                    console.warn('Error adding event listener:', error);
                }
            });
        } catch (error) {
            console.error('Error setting up event listeners:', error);
            
            // Handle error with recovery manager
            this.errorRecovery.handleError(error, 'setup_event_listeners').catch(recoveryError => {
                console.error('Error recovery failed for event listener setup:', recoveryError);
            });
        }
    }
    
    /**
     * Cleanup event listeners with error recovery, enhanced validation, and dependency injection
     */
    cleanupEventListeners() {
        try {
            this.eventListeners?.forEach(({ type, listener }) => {
                try {
                    document.removeEventListener(type, listener);
                } catch (error) {
                    console.warn('Error removing event listener:', error);
                }
            });
            this.eventListeners = [];
        } catch (error) {
            console.warn('Error during event listener cleanup:', error);
            
            // Handle error with recovery manager
            this.errorRecovery.handleError(error, 'event_listener_cleanup').catch(recoveryError => {
                console.error('Error recovery failed for event listener cleanup:', recoveryError);
            });
        }
    }

    /**
     * Setup message handling for communication with popup and background with error recovery, state machine, and enhanced validation
     */
    setupMessageHandling() {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            try {
            // Add ping handler for injection detection
            if (message.action === 'ping') {
                sendResponse({ status: 'success', data: { isRunning: this.isRunning } });
                return true;
            }
            
            this.handleMessage(message, sender, sendResponse);
            return true; // Keep message channel open for async responses
            } catch (error) {
                console.error('Message handling setup error:', error);
                
                // Handle error with recovery manager
                this.errorRecovery.handleError(error, 'message_handling_setup').catch(recoveryError => {
                    console.error('Error recovery failed for message handling setup:', recoveryError);
                });
                
                sendResponse({ status: 'error', error: error.message });
                return true;
            }
        });
    }

    /**
     * Handle incoming messages with error recovery, state machine, enhanced validation, and dependency injection
     */
    async handleMessage(message, sender, sendResponse) {
        try {
            // Check if automation is in a valid state for message handling
            if (this.stateMachine.currentState === 'error' && message.action !== 'getStatus' && message.action !== 'getErrorHistory') {
                sendResponse({ status: 'error', message: 'Automation is in error state' });
                return;
            }
            
            // Validate message structure
            if (!message || typeof message.action !== 'string') {
                sendResponse({ status: 'error', message: 'Invalid message structure' });
                return;
            }
            
            // Validate sender (popup messages don't have tab property)
            if (!sender) {
                console.warn('Invalid message sender: no sender provided');
                sendResponse({ status: 'error', message: 'Invalid message sender' });
                return;
            }
            
            // Log sender info for debugging (popup vs tab messages)
            if (sender.tab) {
                // Message from tab (content script to content script)
                console.log('Message from tab:', sender.tab.id, sender.tab.url);
            } else if (sender.id) {
                // Message from extension (popup, background, etc.)
                console.log('Message from extension:', sender.id, sender.url);
            }
            
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
                    const ads = this.adsenseDetector.analyzeContent();
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
                    
                case 'getStateMachine':
                    const stateMachineData = {
                        currentState: this.stateMachine.currentState,
                        stateHistory: this.stateMachine.stateHistory,
                        states: this.stateMachine.states
                    };
                    sendResponse({ status: 'success', data: stateMachineData });
                    break;
                    
                case 'getErrorHistory':
                    const errorHistory = this.errorRecovery.errorHistory;
                    sendResponse({ status: 'success', data: errorHistory });
                    break;
                    
                case 'testNavigation':
                    const navigationResult = await this.testNavigation(message.direction);
                    sendResponse({ status: 'success', data: navigationResult });
                    break;
                    
                case 'clickRandomAds':
                    const adsClickResult = await this.processRandomElements();
                    sendResponse({ status: 'success', data: adsClickResult });
                    break;
                    
                case 'detectAds':
                    const detectedAds = this.adsenseDetector.analyzeContent();
                    sendResponse({ status: 'success', data: detectedAds });
                    break;
                    
                default:
                    sendResponse({ status: 'error', message: 'Unknown action' });
            }
        } catch (error) {
            console.error('Message handling error:', error);
            
            // Handle error with recovery manager
            try {
                const recovery = await this.errorRecovery.handleError(error, 'message_handling');
                if (recovery.shouldRetry) {
                    console.log('Retrying message handling after error recovery...');
                    // Retry the message handling
                    setTimeout(() => {
                        this.handleMessage(message, sender, sendResponse);
                    }, recovery.delay || 1000);
                    return;
                }
            } catch (recoveryError) {
                console.error('Error recovery failed:', recoveryError);
            }
            
            sendResponse({ status: 'error', error: error.message });
        }
    }

    /**
     * Start automation with state machine, error recovery, enhanced validation, dependency injection, and proper module loading
     */
    async startAutomation(options = {}) {
        if (this.isRunning) {
            console.log('Automation already running');
            return { status: 'already_running' };
        }
        
        try {
            console.log('AdSense Automation Pro: Starting automation...');
            
            // Transition through proper state sequence: idle → initializing → running
            this.stateMachine.transition('initializing');
            this.isRunning = true;
            
            // Reset reading state for new session
            this.readingCompleted = false;
            this.lastReadingTime = 0;
            this.sessionStartTime = Date.now();
            
            // Start new session with error recovery
            try {
            const personality = this.personalityEngine.getCurrentPersonality();
            await this.sessionManager.startSession({
                personality: personality,
                personalityType: this.automationConfig.personalityType,
                automationLevel: this.automationConfig.automationLevel,
                targetRPM: this.automationConfig.targetRPM
            });
            } catch (sessionError) {
                console.error('Session start error:', sessionError);
                const recovery = await this.errorRecovery.handleError(sessionError, 'session_start');
                if (recovery.shouldRetry) {
                    console.log('Retrying session start after error recovery...');
                    await this.delay(recovery.delay || 2000);
                    return this.startAutomation(options);
                }
                throw sessionError;
            }
            
            // Transition to running state after successful session start
            this.stateMachine.transition('running');
            
            // ✅ INTEGRATED: Start behavior simulation
            this.behaviorSimulator.startSimulation();
            
            // Start automation loop
            this.automationLoop(options);
            
            return { status: 'started', sessionId: this.sessionManager.getCurrentSession()?.id };
            
        } catch (error) {
            console.error('Failed to start automation:', error);
            
            // Transition to error state only if current state allows it
            if (this.stateMachine.canTransitionTo('error')) {
                this.stateMachine.transition('error');
            } else {
                // If can't transition to error, go to stopped state
                this.stateMachine.transition('stopped');
            }
            
            this.isRunning = false;
            throw error;
        }
    }

    /**
     * Stop automation with state machine, error recovery, enhanced validation, dependency injection, and proper module loading
     */
    async stopAutomation() {
        if (!this.isRunning) {
            console.log('Automation not running');
            return;
        }
        
        try {
            console.log('AdSense Automation Pro: Stopping automation...');
            
            this.stateMachine.transition('stopping');
            this.isRunning = false;
            
            // ✅ INTEGRATED: Stop behavior simulation
            this.behaviorSimulator.stopSimulation();
            
            // End session with error recovery
            try {
            await this.sessionManager.endSession('manual_stop');
            } catch (sessionError) {
                console.error('Session end error:', sessionError);
                const recovery = await this.errorRecovery.handleError(sessionError, 'session_end');
                if (recovery.shouldRetry) {
                    console.log('Retrying session end after error recovery...');
                    await this.delay(recovery.delay || 1000);
                    try {
                        await this.sessionManager.endSession('manual_stop');
                    } catch (retryError) {
                        console.warn('Session end retry failed:', retryError);
                    }
                }
            }
            
            // Send stop message
            if (this.isExtensionContextValid()) {
                this.sendMessage('automationStopped', {
                    sessionId: this.sessionManager.getCurrentSession()?.id
                });
            }
            
            this.stateMachine.transition('stopped');
            
        } catch (error) {
            console.error('Failed to stop automation:', error);
            this.stateMachine.transition('error');
        }
    }

    /**
     * Main automation loop with state machine, error recovery, enhanced validation, dependency injection, and proper module loading
     */
    async automationLoop(options = {}) {
        try {
            // Don't transition to running if already running
            if (this.stateMachine.currentState !== 'running') {
                this.stateMachine.transition('running');
            }
            
        // Stealth logging - minimal console output
        if (this.automationConfig.debugMode) {
            console.log('Starting automation process...');
        }
        
        // Start with immediate scrolling
        await this.startImmediateScrolling();
        
            const maxRunTime = 30 * 60 * 1000; // 30 minutes max
            const startTime = Date.now();
            
            while (this.stateMachine.currentState === 'running') {
                try {
                    // Check exit conditions
                    if (Date.now() - startTime > maxRunTime) {
                        console.log('Maximum runtime reached, stopping automation');
                        this.stateMachine.transition('stopping');
                        break;
                    }
                    
                // Check if extension context is still valid
                if (!this.isExtensionContextValid()) {
                    console.warn('Extension context invalidated, stopping automation loop');
                        this.stateMachine.transition('stopping');
                    break;
                }
                
                // Check if extension connection is available
                if (!this.isExtensionConnectionAvailable()) {
                    console.warn('Extension connection lost, stopping automation loop');
                        this.stateMachine.transition('stopping');
                    break;
                }
                
                // Check stealth status
                const stealthStatus = this.stealthMonitor.getStealthStatus();
                if (stealthStatus.riskLevel === 'high') {
                    console.warn('High bot detection risk detected, pausing automation');
                    if (this.stateMachine.canTransitionTo('paused')) {
                        this.stateMachine.transition('paused');
                    }
                    await this.delay(10000); // Pause for 10 seconds
                    if (this.stateMachine.canTransitionTo('running')) {
                        this.stateMachine.transition('running');
                    }
                    continue;
                }
                    
                    // Execute automation step
                    await this.executeAutomationStep();
                    
                    // Random delay between actions
                    const delay = this.getRandomDelay();
                    await this.delay(delay);
                    
                } catch (error) {
                    console.error('Automation loop error:', error);
                    
                    // Handle error with recovery manager
                    try {
                        const recovery = await this.errorRecovery.handleError(error, 'automation_loop');
                        if (!recovery.shouldRetry) {
                            if (this.stateMachine.canTransitionTo('error')) {
                                this.stateMachine.transition('error');
                            } else {
                                this.stateMachine.transition('stopping');
                            }
                            break;
                        }
                        await this.delay(recovery.delay || 5000);
                    } catch (recoveryError) {
                        console.error('Error recovery failed:', recoveryError);
                        if (this.stateMachine.canTransitionTo('error')) {
                            this.stateMachine.transition('error');
                        } else {
                            this.stateMachine.transition('stopping');
                        }
                        break;
                    }
                }
            }
        } catch (error) {
            console.error('Automation loop fatal error:', error);
            if (this.stateMachine.canTransitionTo('error')) {
                this.stateMachine.transition('error');
            } else {
                this.stateMachine.transition('stopping');
            }
            throw error;
        } finally {
            if (this.stateMachine.currentState === 'stopping') {
                this.stateMachine.transition('stopped');
            }
        }
    }
    
    /**
     * Execute single automation step with error recovery, state machine, enhanced validation, dependency injection, and proper module loading
     */
    async executeAutomationStep() {
        try {
            // Check if automation is in a valid state for execution
            if (this.stateMachine.currentState !== 'running') {
                throw new Error(`Cannot execute automation step in state: ${this.stateMachine.currentState}`);
                }
                
                // Detect AdSense ads
                const ads = this.adsenseDetector.analyzeContent();
                
                if (ads.length > 0) {
                    // Interact with ads
                    await this.interactWithAds({ ads: ads, personality: this.personalityEngine.getCurrentPersonality() });
                }
                
                // Simulate reading behavior first (priority)
                await this.simulateReadingBehavior();
                
                // Check if we've been on this page too long (force navigation)
                const sessionStartTime = this.sessionStartTime || this.sessionManager?.currentSession?.startTime || Date.now();
                const pageTime = Date.now() - sessionStartTime;
                
                if (this.automationConfig.debugMode) {
                    console.log(`⏱️ Page time: ${Math.round(pageTime / 1000)}s`);
                }
                
                // Navigation cooldown after reading (reduced for testing)
                const minPageTime = 30000 + Math.random() * 30000; // 30-60 seconds variable (reduced for testing)
                if (pageTime < minPageTime) {
                    if (this.automationConfig.debugMode) {
                        console.log(`⏳ Navigation cooldown: ${Math.round((minPageTime - pageTime) / 1000)}s remaining`);
                    }
                    // Variable delay between checks (5-15 seconds)
                    const checkDelay = 5000 + Math.random() * 10000;
                    await this.delay(checkDelay);
                return;
                }
                
                // Ensure reading is completed before allowing navigation
                if (!this.readingCompleted) {
                    if (this.automationConfig.debugMode) {
                        console.log(`📚 Reading not completed yet, continuing...`);
                    }
                    // Variable delay for reading completion check (3-8 seconds)
                    const readingCheckDelay = 3000 + Math.random() * 5000;
                    await this.delay(readingCheckDelay);
                return;
                }
                
                // Variable force navigation time (4-6 minutes)
                const maxPageTime = 240000 + Math.random() * 120000; // 4-6 minutes variable
                if (pageTime > maxPageTime) {
                    if (this.automationConfig.debugMode) {
                        console.log(`🚨 Force navigation after ${Math.round(pageTime / 1000)}s on page`);
                    }
                    await this.simulateNavigation();
                return; // Skip normal navigation logic
                }
                
                // Variable delay after reading before navigation (3-18 seconds)
                const postReadingDelay = 3000 + Math.random() * 15000;
                await this.delay(postReadingDelay);
                
                // Simulate navigation with variable probability (increased for testing)
                const baseProbability = Math.min(0.8, pageTime / 120000); // 80% max after 2 minutes (increased for testing)
                const personalityMultiplier = this.getPersonalityNavigationMultiplier();
                const navigationProbability = baseProbability * personalityMultiplier;
                
                if (Math.random() < navigationProbability) {
                    console.log(`🧭 Navigation triggered! Probability: ${(navigationProbability * 100).toFixed(1)}% (page time: ${Math.round(pageTime / 1000)}s)`);
                    await this.simulateNavigation();
                } else {
                    console.log(`⏳ Navigation skipped (${(navigationProbability * 100).toFixed(1)}% chance) - will try again next loop`);
                }
            } catch (error) {
            console.error('Automation step execution error:', error);
            
            // Handle error with recovery manager
            const recovery = await this.errorRecovery.handleError(error, 'automation_step');
            if (recovery.shouldRetry) {
                console.log('Retrying automation step after error recovery...');
                await this.delay(recovery.delay || 2000);
                return this.executeAutomationStep();
            }
            
            throw error;
        }
    }

    /**
     * Interact with AdSense ads with error recovery, state machine, enhanced validation, and dependency injection
     */
    async interactWithAds(options = {}) {
        try {
            // Check if automation is in a valid state for ad interaction
            if (this.stateMachine.currentState !== 'running' && this.stateMachine.currentState !== 'idle') {
                throw new Error(`Cannot interact with ads in state: ${this.stateMachine.currentState}`);
            }
            
        const ads = options.ads || this.adsenseDetector.detectAdSenseAds();
        const personality = options.personality || this.personalityEngine.getCurrentPersonality();
        
        const interactions = [];
        
        for (const ad of ads) {
            try {
                // Smart ad interaction based on personality and ad value
                const interaction = await this.adsenseDetector.processElementInteraction(ad, personality);
                
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
                    
                    // Track analytics
                    if (interaction.action === 'click') {
                        this.analyticsMonitor.trackAdClick();
                    } else {
                        this.analyticsMonitor.trackAdView();
                    }
                    
                    // Update AdSense data
                    this.sessionManager.updateAdSenseData(this.adsenseDetector.getSessionSummary());
                }
                
                // Delay between ad interactions
                await this.delay(2000 + Math.random() * 3000);
                
            } catch (error) {
                console.error('Ad interaction error:', error);
                    
                    // Handle error with recovery manager
                    const recovery = await this.errorRecovery.handleError(error, 'ad_interaction');
                    if (recovery.shouldRetry) {
                        console.log('Retrying ad interaction after error recovery...');
                        await this.delay(recovery.delay || 2000);
                        continue; // Retry this ad interaction
                    }
            }
        }
        
        return interactions;
        } catch (error) {
            console.error('AdSense interaction error:', error);
            
            // Handle error with recovery manager
            const recovery = await this.errorRecovery.handleError(error, 'adsense_interaction');
            if (recovery.shouldRetry) {
                console.log('Retrying AdSense interaction after error recovery...');
                await this.delay(recovery.delay || 2000);
                return this.interactWithAds(options);
            }
            
            throw error;
        }
    }

    /**
     * Start immediate scrolling when page loads with error recovery, state machine, enhanced validation, and dependency injection
     */
    async startImmediateScrolling() {
        try {
            // Check if automation is in a valid state for scrolling
            if (this.stateMachine.currentState !== 'running' && this.stateMachine.currentState !== 'idle') {
                throw new Error(`Cannot start immediate scrolling in state: ${this.stateMachine.currentState}`);
            }
            
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
            
            // Handle error with recovery manager
            const recovery = await this.errorRecovery.handleError(error, 'immediate_scrolling');
            if (recovery.shouldRetry) {
                console.log('Retrying immediate scrolling after error recovery...');
                await this.delay(recovery.delay || 2000);
                return this.startImmediateScrolling();
            }
        }
    }

    /**
     * Simulate reading behavior with enhanced logging, error recovery, state machine, enhanced validation, and dependency injection
     */
    async simulateReadingBehavior() {
        try {
            // Check if automation is in a valid state for reading behavior
            if (this.stateMachine.currentState !== 'running' && this.stateMachine.currentState !== 'idle') {
                throw new Error(`Cannot simulate reading behavior in state: ${this.stateMachine.currentState}`);
            }
            
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
            
            // Handle error with recovery manager
            const recovery = await this.errorRecovery.handleError(error, 'reading_behavior');
            if (recovery.shouldRetry) {
                console.log('Retrying reading behavior simulation after error recovery...');
                await this.delay(recovery.delay || 2000);
                return this.simulateReadingBehavior();
            }
            
            // If reading fails, mark as completed to prevent infinite loop
            this.readingCompleted = true;
            this.lastReadingTime = Date.now();
        }
    }

    /**
     * Simulate navigation with improved timing, state management, error recovery, state machine, enhanced validation, and dependency injection
     */
    async simulateNavigation() {
        try {
            // Check if automation is in a valid state for navigation
            if (this.stateMachine.currentState !== 'running' && this.stateMachine.currentState !== 'idle') {
                throw new Error(`Cannot simulate navigation in state: ${this.stateMachine.currentState}`);
            }
            
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
            
            // Check navigation cooldown (reduced for testing)
            const now = Date.now();
            const timeSinceLastNavigation = now - this.navigationState.lastNavigationTime;
            const navigationCooldown = 15000; // 15 seconds cooldown (reduced for testing)
            
            if (timeSinceLastNavigation < navigationCooldown) {
                console.log(`⏳ Navigation cooldown: ${Math.round((navigationCooldown - timeSinceLastNavigation) / 1000)}s remaining`);
                return;
            }
            
            // Intelligent navigation based on personality with explicit Previous/Next Post
            let navigationResult;
            
            // Try Previous/Next Post navigation first (more specific for blog posts)
            const navigationType = Math.random() < 0.5 ? 'next' : 'previous';
            console.log(`🎯 Attempting ${navigationType} post navigation...`);
            
            if (navigationType === 'next') {
                navigationResult = await this.navigationSimulator.navigatePreviousNext();
            } else {
                navigationResult = await this.navigationSimulator.navigateToPreviousPage();
            }
            
            // Fallback to intelligent navigation if Previous/Next fails
            if (!navigationResult) {
                console.log('🔄 Previous/Next navigation failed, trying intelligent navigation...');
                navigationResult = await this.navigationSimulator.simulateIntelligentNavigation();
            }
            
            if (navigationResult) {
                console.log('🧭 Navigation completed, starting reading on new page...');
                
                // Reset navigation state for new page
                this.navigationState = {
                    navigationAttempts: 0,
                    maxNavigationAttempts: 3,
                    lastNavigationTime: now,
                    readingCompleted: false,
                    pageStartTime: now
                };
                
                // Reset reading state for new page
                this.readingCompleted = false;
                this.lastReadingTime = 0;
                
                // Wait after navigation before reading
                const postNavigationDelay = 3000 + Math.random() * 5000; // 3-8 seconds
                console.log(`⏳ Post-navigation delay: ${Math.round(postNavigationDelay / 1000)}s`);
                await this.delay(postNavigationDelay);
                
                // Force reading behavior after navigation
                console.log('📖 Starting reading behavior on new page...');
                await this.simulateReadingBehavior();
                
                // Mark reading as completed
                this.navigationState.readingCompleted = true;
                this.readingCompleted = true;
                
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
                
                // Track analytics
                this.analyticsMonitor.trackNavigation();
                
                console.log('🧭 Navigation and reading cycle completed successfully');
                
            } else {
                console.log('🧭 Navigation failed, will retry later');
                // Reduce navigation attempts counter since this attempt failed
                this.navigationState.navigationAttempts--;
            }
            
        } catch (error) {
            console.warn('Navigation simulation error:', error.message);
            
            // Handle error with recovery manager
            const recovery = await this.errorRecovery.handleError(error, 'navigation_simulation');
            if (recovery.shouldRetry) {
                console.log('Retrying navigation simulation after error recovery...');
                await this.delay(recovery.delay || 3000);
                return this.simulateNavigation();
            }
            
            // Reduce navigation attempts counter since this attempt failed
            if (this.navigationState) {
                this.navigationState.navigationAttempts--;
            }
        }
    }

    /**
     * Get current status with state machine, error recovery, enhanced validation, and dependency injection
     */
    getStatus() {
        try {
        return {
            isInitialized: this.isInitialized,
            isRunning: this.isRunning,
                state: this.stateMachine.currentState,
                stateHistory: this.stateMachine.stateHistory,
            config: this.automationConfig,
            personality: this.personalityEngine.getCurrentPersonality(),
            session: this.sessionManager.getSessionSummary(),
            stealth: this.stealthMonitor.getStealthStatus(),
            adsense: this.adsenseDetector.getSessionSummary(),
            analytics: this.analyticsMonitor.getAnalyticsReport(),
            adaptation: this.dynamicAdaptationEngine.getCurrentRiskAssessment(),
                fraudPrevention: this.enhancedFraudPrevention.riskAssessment,
            
            // ✅ INTEGRATED MISSING FUNCTIONS
            behavior: this.behaviorSimulator.getBehaviorStatus(),
            scrollBehavior: this.behaviorSimulator.getScrollBehaviorSummary(),
            deviceBehavior: this.behaviorSimulator.getDeviceComparisonSummary(),
            navigation: this.navigationSimulator.getNavigationMaturitySummary(),
            evasion: this.advancedBotEvasion.getEvasionMetrics(),
            adaptationStats: this.dynamicAdaptationEngine.getAdaptationStats(),
            fraudPreventionSummary: this.adsenseDetector.getFraudPreventionSummary(),
            clickProbability: this.adsenseDetector.getClickProbabilitySummary(),
            rpmProbability: this.adsenseDetector.getRPMProbabilitySummary(),
            mlMetrics: this.mlBehaviorEngine.getMLMetrics(),
                errorRecovery: {
                    errorCount: this.errorRecovery.errorHistory.length,
                    lastError: this.errorRecovery.errorHistory[this.errorRecovery.errorHistory.length - 1],
                    maxRetries: this.errorRecovery.maxRetries,
                    recoveryStrategies: Array.from(this.errorRecovery.recoveryStrategies.keys())
                },
                extensionContext: {
                    isValid: this.isExtensionContextValid(),
                    connectionAvailable: this.isExtensionConnectionAvailable()
                },
                performance: {
                    sessionStartTime: this.sessionStartTime,
                    readingCompleted: this.readingCompleted,
                    lastReadingTime: this.lastReadingTime
                },
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error getting status:', error);
            
            // Handle error with recovery manager
            this.errorRecovery.handleError(error, 'status_retrieval').catch(recoveryError => {
                console.error('Error recovery failed for status retrieval:', recoveryError);
            });
            
            return {
                isInitialized: this.isInitialized,
                isRunning: this.isRunning,
                state: this.stateMachine.currentState,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Get metrics with state machine, error recovery, enhanced validation, and dependency injection
     */
    getMetrics() {
        try {
        return {
            session: this.sessionManager.getSessionAnalytics(),
            stealth: this.stealthMonitor.getStealthMetrics(),
            adsense: this.adsenseDetector.getSessionSummary(),
            behavior: this.behaviorSimulator.getBehaviorStatus(),
            analytics: this.analyticsMonitor.getAnalyticsReport(),
            adaptation: this.dynamicAdaptationEngine.getCurrentRiskAssessment(),
                fraudPrevention: this.enhancedFraudPrevention.riskAssessment,
            
            // ✅ INTEGRATED: Add missing metrics from integrated functions
            scrollBehavior: this.behaviorSimulator.getScrollBehaviorSummary(),
            deviceBehavior: this.behaviorSimulator.getDeviceComparisonSummary(),
            navigation: this.navigationSimulator.getNavigationMaturitySummary(),
            evasion: this.advancedBotEvasion.getEvasionMetrics(),
            adaptationStats: this.dynamicAdaptationEngine.getAdaptationStats(),
            fraudPreventionSummary: this.adsenseDetector.getFraudPreventionSummary(),
            clickProbability: this.adsenseDetector.getClickProbabilitySummary(),
            rpmProbability: this.adsenseDetector.getRPMProbabilitySummary(),
            mlMetrics: this.mlBehaviorEngine.getMLMetrics(),
                stateMachine: {
                    currentState: this.stateMachine.currentState,
                    stateHistory: this.stateMachine.stateHistory,
                    canTransitionTo: Object.keys(this.stateMachine.states[this.stateMachine.currentState].next),
                    totalTransitions: this.stateMachine.stateHistory.length,
                    states: this.stateMachine.states
                },
                errorRecovery: {
                    errorCount: this.errorRecovery.errorHistory.length,
                    lastError: this.errorRecovery.errorHistory[this.errorRecovery.errorHistory.length - 1],
                    maxRetries: this.errorRecovery.maxRetries,
                    recoveryStrategies: Array.from(this.errorRecovery.recoveryStrategies.keys()),
                    errorHistory: this.errorRecovery.errorHistory
                },
                extensionContext: {
                    isValid: this.isExtensionContextValid(),
                    connectionAvailable: this.isExtensionConnectionAvailable()
                },
                performance: {
                    sessionStartTime: this.sessionStartTime,
                    readingCompleted: this.readingCompleted,
                    lastReadingTime: this.lastReadingTime,
                    isInitialized: this.isInitialized,
                    isRunning: this.isRunning
                },
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error getting metrics:', error);
            
            // Handle error with recovery manager
            this.errorRecovery.handleError(error, 'metrics_retrieval').catch(recoveryError => {
                console.error('Error recovery failed for metrics retrieval:', recoveryError);
            });
            
            return {
                error: error.message,
                state: this.stateMachine.currentState,
                isRunning: this.isRunning,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Export all data with state machine, error recovery, enhanced validation, and dependency injection
     */
    exportAllData() {
        try {
        return {
            session: this.sessionManager.exportSessionData(),
            stealth: this.stealthMonitor.getDetectionSignals(),
            adsense: this.adsenseDetector.getSessionSummary(),
            personality: this.personalityEngine.getCurrentPersonality(),
            config: this.automationConfig,
            analytics: this.analyticsMonitor.getAnalyticsReport(),
            adaptation: this.dynamicAdaptationEngine.getCurrentRiskAssessment(),
            fraudPrevention: this.enhancedFraudPrevention.riskAssessment,
                stateMachine: {
                    currentState: this.stateMachine.currentState,
                    stateHistory: this.stateMachine.stateHistory,
                    states: this.stateMachine.states,
                    totalTransitions: this.stateMachine.stateHistory.length
                },
                errorRecovery: {
                    errorHistory: this.errorRecovery.errorHistory,
                    maxRetries: this.errorRecovery.maxRetries,
                    recoveryStrategies: Array.from(this.errorRecovery.recoveryStrategies.keys()),
                    errorCount: this.errorRecovery.errorHistory.length
                },
                extensionContext: {
                    isValid: this.isExtensionContextValid(),
                    connectionAvailable: this.isExtensionConnectionAvailable()
                },
                performance: {
                    sessionStartTime: this.sessionStartTime,
                    readingCompleted: this.readingCompleted,
                    lastReadingTime: this.lastReadingTime,
                    isInitialized: this.isInitialized,
                    isRunning: this.isRunning
                },
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error exporting data:', error);
            
            // Handle error with recovery manager
            this.errorRecovery.handleError(error, 'data_export').catch(recoveryError => {
                console.error('Error recovery failed for data export:', recoveryError);
            });
            
            return {
                error: error.message,
                state: this.stateMachine.currentState,
            timestamp: new Date().toISOString()
        };
        }
    }

    /**
     * Simulate specific behavior with error recovery, state machine, enhanced validation, and dependency injection
     */
    async simulateBehavior(behaviorType, options = {}) {
        try {
            // Check if automation is in a valid state for behavior simulation
            if (this.stateMachine.currentState !== 'running' && this.stateMachine.currentState !== 'idle') {
                throw new Error(`Cannot simulate behavior in state: ${this.stateMachine.currentState}`);
            }
            
            // Validate behavior type
            const validBehaviorTypes = ['mouse_movement', 'click', 'typing', 'scrolling', 'reading', 'navigation'];
            if (!validBehaviorTypes.includes(behaviorType)) {
                throw new Error(`Invalid behavior type: ${behaviorType}. Valid types: ${validBehaviorTypes.join(', ')}`);
            }
            
            // Validate options based on behavior type
            if (behaviorType === 'mouse_movement' && (typeof options.x !== 'number' || typeof options.y !== 'number')) {
                throw new Error('Mouse movement requires x and y coordinates');
            }
            
            if (behaviorType === 'click' && !options.element) {
                throw new Error('Click behavior requires target element');
            }
            
            if (behaviorType === 'typing' && !options.text) {
                throw new Error('Typing behavior requires text to type');
            }
            
            if (behaviorType === 'scrolling' && typeof options.targetY !== 'number') {
                throw new Error('Scrolling behavior requires targetY coordinate');
            }
            
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
        } catch (error) {
            console.error(`Error simulating behavior ${behaviorType}:`, error);
            
            // Handle error with recovery manager
            const recovery = await this.errorRecovery.handleError(error, `simulate_behavior_${behaviorType}`);
            if (recovery.shouldRetry) {
                console.log(`Retrying behavior simulation ${behaviorType} after error recovery...`);
                await this.delay(recovery.delay || 1000);
                return this.simulateBehavior(behaviorType, options);
            }
            
            throw error;
        }
    }

    /**
     * Test navigation functionality (previous/next post)
     */
    async testNavigation(direction) {
        try {
            console.log(`🧪 Testing ${direction} post navigation...`);
            
            // Check if automation is in a valid state for navigation testing
            if (this.stateMachine.currentState !== 'running' && this.stateMachine.currentState !== 'idle') {
                throw new Error(`Cannot test navigation in state: ${this.stateMachine.currentState}`);
            }
            
            // Validate direction
            if (!['previous', 'next'].includes(direction)) {
                throw new Error(`Invalid navigation direction: ${direction}. Valid directions: previous, next`);
            }
            
            // Check if navigation simulator is available
            if (!this.navigationSimulator) {
                throw new Error('Navigation simulator not available');
            }
            
            // Get current page info
            const currentPage = {
                url: window.location.href,
                title: document.title,
                timestamp: Date.now()
            };
            
            // Simulate navigation based on direction
            let navigationResult;
            if (direction === 'previous') {
                // navigationResult = await this.navigationSimulator.simulatePreviousNavigation();
                navigationResult = await this.navigationSimulator.navigateToPreviousPage();
            } else {
                // navigationResult = await this.navigationSimulator.simulateNextNavigation();
                navigationResult = await this.navigationSimulator.navigatePreviousNext();
            }
            
            // Record navigation test in session
            if (this.sessionManager) {
                this.sessionManager.addInteraction({
                    type: 'navigation_test',
                    direction: direction,
                    url: currentPage.url,
                    title: currentPage.title,
                    timestamp: Date.now(),
                    result: navigationResult
                });
            }
            
            // Track analytics
            this.analyticsMonitor.trackNavigation();
            
            console.log(`✅ ${direction} post navigation test completed:`, navigationResult);
            
            return {
                direction: direction,
                currentPage: currentPage,
                navigationResult: navigationResult,
                timestamp: Date.now(),
                success: true
            };
            
        } catch (error) {
            console.error(`❌ Error testing ${direction} navigation:`, error);
            
            // Handle error with recovery manager
            const recovery = await this.errorRecovery.handleError(error, `test_navigation_${direction}`);
            if (recovery.shouldRetry) {
                console.log(`Retrying ${direction} navigation test after error recovery...`);
                await this.delay(recovery.delay || 1000);
                return this.testNavigation(direction);
            }
            
            return {
                direction: direction,
                error: error.message,
                timestamp: Date.now(),
                success: false
            };
        }
    }

    /**
     * Click random ads on the page using AdSense detector
     */
    async processRandomElements() {
        try {
            console.log('🎯 Starting random ads click...');
            
            // Check if automation is in a valid state for ads clicking
            if (this.stateMachine.currentState !== 'running' && this.stateMachine.currentState !== 'idle') {
                throw new Error(`Cannot click ads in state: ${this.stateMachine.currentState}`);
            }
            
            // Check if adsense detector is available
            if (!this.adsenseDetector) {
                throw new Error('AdSense detector not available');
            }
            
            // Detect ads on the page using AdSense detector
            const ads = this.adsenseDetector.detectAdSenseAds();
            console.log(`🔍 Found ${ads.length} ads on page`);
            
            if (ads.length === 0) {
                return {
                    adsFound: 0,
                    adsClicked: 0,
                    message: 'No ads found on this page',
                    success: true
                };
            }
            
            // Filter clickable ads
            const clickableAds = ads.filter(ad => ad.clickable && ad.element);
            console.log(`🎯 Found ${clickableAds.length} clickable ads`);
            
            if (clickableAds.length === 0) {
                return {
                    adsFound: ads.length,
                    adsClicked: 0,
                    message: 'No clickable ads found on this page',
                    success: true
                };
            }
            
            // Randomly select ads to click (1-3 ads max)
            const maxClicks = Math.min(3, clickableAds.length);
            const numClicks = Math.floor(Math.random() * maxClicks) + 1;
            const selectedAds = this.shuffleArray(clickableAds).slice(0, numClicks);
            
            console.log(`🎯 Clicking ${selectedAds.length} random ads...`);
            
            let clickedCount = 0;
            const clickResults = [];
            
            for (const ad of selectedAds) {
                try {
                    // Add delay between clicks for human-like behavior
                    if (clickedCount > 0) {
                        await this.delay(1000 + Math.random() * 2000); // 1-3 seconds
                    }
                    
                    // Step 1: Scroll and focus to the ad
                    console.log(`🎯 Step 1: Scrolling to ad and focusing...`);
                    await this.scrollAndFocusToAd(ad);
                    
                    // Step 2: Pause scroll system temporarily
                    console.log(`🎯 Step 2: Pausing scroll system...`);
                    await this.pauseScrollSystem();
                    
                    // Step 3: Wait a bit for focus
                    await this.delay(500 + Math.random() * 1000);
                    
                    // Step 4: Click the ad
                    console.log(`🎯 Step 3: Clicking ad...`);
                    const clickResult = await this.clickAdWithFocus(ad);
                    
                    if (clickResult.success) {
                        clickedCount++;
                        console.log(`✅ Successfully clicked ad: ${ad.category || 'AdSense'}`);
                        clickResults.push({
                            success: true,
                            ad: ad,
                            clickResult: clickResult,
                            timestamp: Date.now()
                        });
                    } else {
                        console.log(`❌ Ad click failed: ${clickResult.error}`);
                        clickResults.push({
                            success: false,
                            error: clickResult.error,
                            ad: ad,
                            timestamp: Date.now()
                        });
                    }
                    
                    // Step 5: Resume scroll system
                    console.log(`🎯 Step 4: Resuming scroll system...`);
                    await this.resumeScrollSystem();
                    
                } catch (error) {
                    console.error('Error clicking ad:', error);
                    clickResults.push({
                        success: false,
                        error: error.message,
                        ad: ad,
                        timestamp: Date.now()
                    });
                    
                    // Ensure scroll system is resumed even on error
                    await this.resumeScrollSystem();
                }
            }
            
            // Record ads interaction in session
            if (this.sessionManager) {
                this.sessionManager.addInteraction({
                    type: 'ads_click',
                    adsFound: ads.length,
                    adsClicked: clickedCount,
                    clickResults: clickResults,
                    timestamp: Date.now()
                });
            }
            
            // Track analytics
            this.analyticsMonitor.trackAdClick();
            
            console.log(`✅ Random ads click completed: ${clickedCount}/${selectedAds.length} successful`);
            
            return {
                adsFound: ads.length,
                adsClicked: clickedCount,
                clickResults: clickResults,
                timestamp: Date.now(),
                success: true
            };
            
        } catch (error) {
            console.error('❌ Error in random ads click:', error);
            
            // Handle error with recovery manager
            const recovery = await this.errorRecovery.handleError(error, 'random_ads_click');
            if (recovery.shouldRetry) {
                console.log('Retrying random ads click after error recovery...');
                await this.delay(recovery.delay || 1000);
                return this.processRandomElements();
            }
            
            return {
                adsFound: 0,
                adsClicked: 0,
                error: error.message,
                timestamp: Date.now(),
                success: false
            };
        }
    }


    /**
     * Scroll and focus to ad element
     */
    async scrollAndFocusToAd(ad) {
        try {
            if (!ad.element) {
                throw new Error('Ad element not found');
            }
            
            // Get ad position
            const rect = ad.element.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const viewportWidth = window.innerWidth;
            
            // Check if ad is already visible
            const isVisible = rect.top >= 0 && rect.bottom <= viewportHeight && 
                             rect.left >= 0 && rect.right <= viewportWidth;
            
            if (!isVisible) {
                console.log(`📍 Ad not visible, scrolling to position...`);
                
                // Scroll to ad with smooth behavior
                ad.element.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center', 
                    inline: 'center' 
                });
                
                // Wait for scroll to complete
                await this.delay(1000 + Math.random() * 500);
            }
            
            // Add visual focus indicator
            ad.element.style.outline = '2px solid #ff6b6b';
            ad.element.style.outlineOffset = '2px';
            ad.element.style.transition = 'outline 0.3s ease';
            
            console.log(`✅ Ad focused and ready for interaction`);
            
        } catch (error) {
            console.error('Error scrolling to ad:', error);
            throw error;
        }
    }

    /**
     * Pause scroll system temporarily
     */
    async pauseScrollSystem() {
        try {
            // Pause any active scroll automation
            if (this.readingSimulator && this.readingSimulator.pause) {
                this.readingSimulator.pause();
                console.log('📖 Reading simulator paused');
            }
            
            if (this.behaviorSimulator && this.behaviorSimulator.pauseScrolling) {
                this.behaviorSimulator.pauseScrolling();
                console.log('🎭 Behavior simulator scrolling paused');
            }
            
            // Store pause state
            this.scrollSystemPaused = true;
            this.scrollPauseTime = Date.now();
            
        } catch (error) {
            console.error('Error pausing scroll system:', error);
        }
    }

    /**
     * Resume scroll system
     */
    async resumeScrollSystem() {
        try {
            // Resume scroll automation
            if (this.readingSimulator && this.readingSimulator.resume) {
                this.readingSimulator.resume();
                console.log('📖 Reading simulator resumed');
            }
            
            if (this.behaviorSimulator && this.behaviorSimulator.resumeScrolling) {
                this.behaviorSimulator.resumeScrolling();
                console.log('🎭 Behavior simulator scrolling resumed');
            }
            
            // Clear pause state
            this.scrollSystemPaused = false;
            
        } catch (error) {
            console.error('Error resuming scroll system:', error);
        }
    }

    /**
     * Click ad with proper focus and interaction
     */
    async clickAdWithFocus(ad) {
        try {
            if (!ad.element) {
                return { success: false, error: 'Ad element not found' };
            }
            
            // Remove focus indicator
            ad.element.style.outline = '';
            ad.element.style.outlineOffset = '';
            
            // Add click visual feedback
            ad.element.style.transition = 'all 0.2s ease';
            ad.element.style.transform = 'scale(0.95)';
            ad.element.style.opacity = '0.8';
            
            // Wait for visual feedback
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Restore original state
            ad.element.style.transform = 'scale(1)';
            ad.element.style.opacity = '1';
            
            // Wait a bit more before actual click
            await new Promise(resolve => setTimeout(resolve, 200));
            
            // Check if it's an iframe ad
            if (ad.iframe) {
                console.log('🎯 Detected iframe ad, using safe iframe click method...');
                return await this.adsenseDetector.clickIframeElement(ad);
            }
            
            // Try multiple click methods for better compatibility
            let clickSuccess = false;
            let clickMethod = 'none';
            
            // Method 1: Direct click
            try {
                ad.element.click();
                clickSuccess = true;
                clickMethod = 'direct';
                console.log('🎯 Ad clicked (direct method)');
            } catch (error) {
                console.log('Direct click failed, trying alternative methods...');
            }
            
            // Method 2: Dispatch click event if direct click failed
            if (!clickSuccess) {
                try {
                    const clickEvent = new MouseEvent('click', {
                        view: window,
                        bubbles: true,
                        cancelable: true,
                        clientX: ad.element.getBoundingClientRect().left + 10,
                        clientY: ad.element.getBoundingClientRect().top + 10
                    });
                    ad.element.dispatchEvent(clickEvent);
                    clickSuccess = true;
                    clickMethod = 'event_dispatch';
                    console.log('🎯 Ad clicked (event dispatch method)');
                } catch (error) {
                    console.log('Event click failed, trying link extraction...');
                }
            }
            
            // Method 3: Find and click link inside ad if other methods failed
            if (!clickSuccess) {
                try {
                    const link = ad.element.querySelector('a[href]');
                    if (link) {
                        // Open link in new tab to avoid navigation issues
                        window.open(link.href, '_blank');
                        clickSuccess = true;
                        clickMethod = 'link_open';
                        console.log('🎯 Ad link opened in new tab:', link.href);
                    } else {
                        // Try to find any clickable element
                        const clickableElement = ad.element.querySelector('[onclick], button, input[type="button"]');
                        if (clickableElement) {
                            clickableElement.click();
                            clickSuccess = true;
                            clickMethod = 'child_click';
                            console.log('🎯 Clickable element in ad clicked');
                        }
                    }
                } catch (error) {
                    console.log('Link extraction failed');
                }
            }
            
            if (!clickSuccess) {
                return { success: false, error: 'All click methods failed' };
            }
            
            // Wait for potential navigation or ad opening
            await this.delay(1000);
            
            return {
                success: true,
                clickMethod: clickMethod,
                timestamp: Date.now()
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }


    /**
     * Shuffle array utility
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * Check if extension connection is available with enhanced validation, error recovery, state machine, and dependency injection
     */
    isExtensionConnectionAvailable() {
        try {
            // Check if chrome.runtime is available
            if (!chrome || !chrome.runtime) {
                return false;
            }
            
            // Check if sendMessage is available
            if (!chrome.runtime.sendMessage) {
                return false;
            }
            
            // Check for last error
            if (chrome.runtime.lastError) {
                return false;
            }
            
            // Try to get extension ID to verify connection
            try {
                const extensionId = chrome.runtime.id;
                if (!extensionId) {
                    return false;
                }
                
                // Additional validation: check if extension is still installed
                if (typeof chrome.runtime.getManifest === 'function') {
                    const manifest = chrome.runtime.getManifest();
                    if (!manifest || !manifest.name) {
                        return false;
                    }
                }
                
                // Check if extension is still enabled
                if (typeof chrome.runtime.getURL === 'function') {
                    try {
                        chrome.runtime.getURL('');
                    } catch (error) {
                        return false;
                    }
                }
                
                // Check if extension is still connected
                if (typeof chrome.runtime.onConnect === 'function') {
                    try {
                        chrome.runtime.onConnect;
                    } catch (error) {
                        return false;
                    }
                }
                
                // Check if extension is still listening for messages
                if (typeof chrome.runtime.onMessage === 'function') {
                    try {
                        chrome.runtime.onMessage;
                    } catch (error) {
                        return false;
                    }
                }
                
                // Check if extension is still listening for disconnect events
                if (typeof chrome.runtime.onDisconnect === 'function') {
                    try {
                        chrome.runtime.onDisconnect;
                    } catch (error) {
                        return false;
                    }
                }
                
                return true;
            } catch (error) {
                return false;
            }
        } catch (error) {
            return false;
        }
    }
    
    /**
     * Send message to popup or background with error recovery, state machine, enhanced validation, and dependency injection
     */
    sendMessage(action, data) {
        try {
            // Check if automation is in a valid state for sending messages
            if (this.stateMachine.currentState === 'error' && action !== 'initializationComplete') {
                console.warn('Automation is in error state, skipping message:', action);
                return;
            }
            
            // Check if extension connection is available
            if (!this.isExtensionConnectionAvailable()) {
                console.warn('Extension connection not available, skipping message:', action);
                return;
            }
            
            // Set timeout for message sending
            const messageTimeout = setTimeout(() => {
                console.warn('Message send timeout, connection may be lost');
                this.handleContextInvalidation();
            }, 5000); // 5 second timeout
            
            chrome.runtime.sendMessage({ action, data }, (response) => {
                clearTimeout(messageTimeout);
                
                if (chrome.runtime.lastError) {
                    const errorMessage = chrome.runtime.lastError.message;
                    
                    // Handle specific connection errors
                    if (errorMessage.includes('Could not establish connection') || 
                        errorMessage.includes('Receiving end does not exist') ||
                        errorMessage.includes('Extension context invalidated') ||
                        errorMessage.includes('The message port closed') ||
                        errorMessage.includes('Could not establish connection. Receiving end does not exist')) {
                        console.warn('Extension connection lost, handling gracefully:', errorMessage);
                        this.handleContextInvalidation();
                    } else {
                        console.warn('Message send failed:', errorMessage);
                    }
                }
            });
        } catch (error) {
            if (error.message && error.message.includes('Extension context invalidated')) {
                console.warn('Extension context invalidated, stopping automation');
                this.handleContextInvalidation();
            } else {
                console.warn('Failed to send message:', error);
                
                // Handle error with recovery manager
                this.errorRecovery.handleError(error, 'send_message').catch(recoveryError => {
                    console.error('Error recovery failed for sendMessage:', recoveryError);
                });
            }
        }
    }
    
    /**
     * Check if extension context is still valid with enhanced validation, error recovery, state machine, and dependency injection
     */
    isExtensionContextValid() {
        try {
            // Check if chrome.runtime is available
            if (!chrome || !chrome.runtime) {
                return false;
            }
            
            // Check if sendMessage is available
            if (!chrome.runtime.sendMessage) {
                return false;
            }
            
            // Check for last error
            if (chrome.runtime.lastError) {
                return false;
            }
            
            // Try to get extension ID to verify context
            try {
                const extensionId = chrome.runtime.id;
                if (!extensionId) {
                    return false;
                }
                
                // Additional validation: check if extension is still installed
                if (typeof chrome.runtime.getManifest === 'function') {
                    const manifest = chrome.runtime.getManifest();
                    if (!manifest || !manifest.name) {
                        return false;
                    }
                }
                
                // Check if extension is still enabled
                if (typeof chrome.runtime.getURL === 'function') {
                    try {
                        chrome.runtime.getURL('');
                    } catch (error) {
                        return false;
                    }
                }
                
                // Check if extension is still connected
                if (typeof chrome.runtime.onConnect === 'function') {
                    try {
                        chrome.runtime.onConnect;
                    } catch (error) {
                        return false;
                    }
                }
                
                // Check if extension is still listening for messages
                if (typeof chrome.runtime.onMessage === 'function') {
                    try {
                        chrome.runtime.onMessage;
                    } catch (error) {
                        return false;
                    }
                }
                
                return true;
            } catch (error) {
                return false;
            }
        } catch (error) {
            return false;
        }
    }
    
    /**
     * Handle extension context invalidation with state machine, error recovery, enhanced validation, and dependency injection
     */
    handleContextInvalidation() {
        try {
            console.log('Handling extension context invalidation...');
            
            // Transition to error state
            this.stateMachine.transition('error');
            
            // Stop automation gracefully
            this.isRunning = false;
            this.isInitialized = false;
            
            // Cleanup resources
            this.cleanup();
            
            // Clear instance
            if (window.PageProcessorInstance) {
                window.PageProcessorInstance = null;
            }
            
            console.log('Extension context invalidation handled gracefully');
        } catch (error) {
            console.warn('Error during context invalidation handling:', error);
            
            // Handle error with recovery manager
            this.errorRecovery.handleError(error, 'context_invalidation').catch(recoveryError => {
                console.error('Error recovery failed for context invalidation:', recoveryError);
            });
        }
    }

    /**
     * Get personality-based navigation multiplier
     */
    getPersonalityNavigationMultiplier() {
        try {
            const personality = this.personalityEngine.getCurrentPersonality();
            if (!personality) return 1.0;
            
            switch (personality.type) {
                case 'explorer':
                    return 1.3; // More likely to navigate
                case 'researcher':
                    return 0.7; // Less likely to navigate (stays longer)
                case 'casual':
                    return 1.1; // Slightly more likely
                case 'professional':
                    return 0.9; // Slightly less likely
                default:
                    return 1.0;
            }
        } catch (error) {
            console.warn('Error getting personality navigation multiplier:', error);
            return 1.0;
        }
    }

    /**
     * Get random delay based on personality, state machine, error recovery, enhanced validation, and dependency injection
     */
    getRandomDelay() {
        try {
        const personality = this.personalityEngine.getCurrentPersonality();
        const baseDelay = 3000; // 3 seconds base
        
        if (!personality) return baseDelay + Math.random() * 2000;
        
            // Adjust delay based on current state
            let stateMultiplier = 1.0;
            switch (this.stateMachine.currentState) {
                case 'running':
                    stateMultiplier = 1.0;
                    break;
                case 'paused':
                    stateMultiplier = 2.0;
                    break;
                case 'error':
                    stateMultiplier = 3.0;
                    break;
                case 'stopping':
                    stateMultiplier = 0.5; // Faster when stopping
                    break;
                case 'idle':
                    stateMultiplier = 1.5; // Slower when idle
                    break;
            default:
                    stateMultiplier = 1.0;
            }
            
            // Adjust delay based on error history
            let errorMultiplier = 1.0;
            if (this.errorRecovery.errorHistory.length > 0) {
                errorMultiplier = 1.0 + (this.errorRecovery.errorHistory.length * 0.1);
            }
            
            // Adjust delay based on extension context validity
            let contextMultiplier = 1.0;
            if (!this.isExtensionContextValid() || !this.isExtensionConnectionAvailable()) {
                contextMultiplier = 2.0; // Slower when context is invalid
            }
            
            // Adjust delay based on stealth status
            let stealthMultiplier = 1.0;
            const stealthStatus = this.stealthMonitor.getStealthStatus();
            if (stealthStatus.riskLevel === 'high') {
                stealthMultiplier = 2.0; // Slower when high risk
            } else if (stealthStatus.riskLevel === 'medium') {
                stealthMultiplier = 1.5; // Moderately slower when medium risk
            }
            
            let personalityMultiplier = 1.0;
            switch (personality.type) {
                case 'casual':
                    personalityMultiplier = 0.7; // Faster
                    break;
                case 'researcher':
                    personalityMultiplier = 1.5; // Slower
                    break;
                case 'professional':
                    personalityMultiplier = 1.2; // Moderate
                    break;
                case 'explorer':
                    personalityMultiplier = 0.9; // Slightly faster
                    break;
                default:
                    personalityMultiplier = 1.0;
            }
            
            const adjustedDelay = baseDelay * personalityMultiplier * stateMultiplier * errorMultiplier * contextMultiplier * stealthMultiplier;
            return adjustedDelay + Math.random() * (adjustedDelay * 0.5);
                } catch (error) {
            console.error('Error calculating random delay:', error);
            
            // Handle error with recovery manager
            this.errorRecovery.handleError(error, 'random_delay_calculation').catch(recoveryError => {
                console.error('Error recovery failed for random delay calculation:', recoveryError);
            });
            
            return 3000 + Math.random() * 2000; // Fallback delay
        }
    }

    /**
     * Check if automation should pause with enhanced validation, error recovery, state machine, dependency injection, and proper module loading
     */
    shouldPauseAutomation() {
        try {
            // Check stealth status
            const stealthStatus = this.stealthMonitor.getStealthStatus();
            if (stealthStatus.riskLevel === 'high') {
                return true;
            }
            
            // Check if extension context is valid
            if (!this.isExtensionContextValid()) {
                return true;
            }
            
            // Check if extension connection is available
            if (!this.isExtensionConnectionAvailable()) {
                return true;
            }
            
            // Check if automation is in error state
            if (this.stateMachine.currentState === 'error') {
                return true;
            }
            
            // Check if automation is in stopping state
            if (this.stateMachine.currentState === 'stopping') {
                return true;
            }
            
            // Check if automation is in paused state
            if (this.stateMachine.currentState === 'paused') {
                return true;
            }
            
            // Check if automation is in idle state
            if (this.stateMachine.currentState === 'idle') {
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Error checking pause conditions:', error);
            
            // Handle error with recovery manager
            this.errorRecovery.handleError(error, 'pause_condition_check').catch(recoveryError => {
                console.error('Error recovery failed for pause condition check:', recoveryError);
            });
            
            return true; // Pause on error
        }
    }
    
    /**
     * Handle pause state with enhanced monitoring, error recovery, state machine, dependency injection, and proper module loading
     */
    async handlePauseState() {
        try {
            console.log('⏸️ Automation paused, waiting for conditions to improve...');
            
            // Wait for conditions to improve
            let pauseTime = 0;
            const maxPauseTime = 60000; // 1 minute max pause
            
            while (this.shouldPauseAutomation() && pauseTime < maxPauseTime) {
                await this.delay(5000); // Check every 5 seconds
                pauseTime += 5000;
                
                // Log pause status
                if (this.automationConfig.debugMode) {
                    console.log(`⏸️ Pause time: ${pauseTime / 1000}s / ${maxPauseTime / 1000}s`);
                }
            }
            
            if (pauseTime >= maxPauseTime) {
                console.log('⏸️ Maximum pause time reached, stopping automation');
                this.stateMachine.transition('stopping');
            } else {
                console.log('▶️ Automation resuming...');
            }
        } catch (error) {
            console.error('Error handling pause state:', error);
            
            // Handle error with recovery manager
            const recovery = await this.errorRecovery.handleError(error, 'pause_state_handling');
            if (recovery.shouldRetry) {
                console.log('Retrying pause state handling after error recovery...');
                await this.delay(recovery.delay || 2000);
                return this.handlePauseState();
            }
            
            // If pause handling fails, stop automation
            this.stateMachine.transition('stopping');
        }
    }
    
    /**
     * Utility delay function with error handling, state machine validation, enhanced validation, dependency injection, and proper module loading
     */
    delay(ms) {
        return new Promise((resolve, reject) => {
            try {
                // Check if automation is still running before setting timeout
                if (this.stateMachine.currentState === 'stopping' || this.stateMachine.currentState === 'stopped') {
                    resolve();
                return;
            }
            
                // Validate delay duration
                if (typeof ms !== 'number' || ms < 0 || ms > 300000) { // Max 5 minutes
                    console.warn('Invalid delay duration:', ms);
                    ms = Math.min(Math.max(ms || 1000, 100), 300000); // Clamp to valid range
                }
                
                setTimeout(() => {
                    try {
                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                }, ms);
            } catch (error) {
                reject(error);
            }
        });
    }



    /**
     * Cleanup resources with state machine, error recovery, enhanced validation, and dependency injection
     */
    cleanup() {
        try {
            // Transition to stopping state only if not already stopped or error
            if (this.stateMachine.currentState !== 'stopped' && 
                this.stateMachine.currentState !== 'error') {
                this.stateMachine.safeTransition('stopping');
            }
            
            // Stop automation if running
            if (this.isRunning) {
                this.isRunning = false;
            }
            
            // Cleanup event listeners
            this.cleanupEventListeners();
            
            // Stop monitoring
            if (this.stealthMonitor && typeof this.stealthMonitor.stopMonitoring === 'function') {
                try {
                    this.stealthMonitor.stopMonitoring();
                } catch (error) {
                    console.warn('Error stopping stealth monitor:', error);
                }
            }
            
            // Cleanup all modules
            const modules = [
                this.stealthDelay,
                this.analyticsMonitor,
                this.dynamicAdaptationEngine,
                this.enhancedFraudPrevention,
                this.sessionManager,
                this.adsenseDetector,
                this.personalityEngine,
                this.behaviorSimulator,
                this.mouseSimulator,
                this.keyboardSimulator,
                this.readingSimulator,
                this.navigationSimulator
            ];
            
            modules.forEach(module => {
                if (module && typeof module.cleanup === 'function') {
                    try {
                        module.cleanup();
                    } catch (error) {
                        console.warn('Error cleaning up module:', error);
                    }
                }
            });
            
            // Transition to stopped state only if not already stopped
            if (this.stateMachine.currentState !== 'stopped') {
                this.stateMachine.safeTransition('stopped');
            }
            
        } catch (error) {
            console.warn('Error during cleanup:', error);
            // Transition to error state
            try {
                if (this.stateMachine.currentState !== 'error') {
                    this.stateMachine.safeTransition('error');
                }
            } catch (transitionError) {
                console.warn('Error transitioning to error state:', transitionError);
                // Force set to error state if transition fails
                this.stateMachine.currentState = 'error';
            }
            
            // Handle error with recovery manager
            this.errorRecovery.handleError(error, 'cleanup').catch(recoveryError => {
                console.error('Error recovery failed for cleanup:', recoveryError);
            });
        }
    }
}

// No fallback classes - proper module loading only

// Main initialization function with proper singleton pattern and DOM ready check
async function initializeAutomation() {
    try {
        console.log('🚀 Starting automation initialization...');
        
        // Wait for DOM to be ready if not already
        if (document.readyState === 'loading') {
            console.log('⏳ Waiting for DOM to be ready...');
            await new Promise(resolve => {
                document.addEventListener('DOMContentLoaded', resolve, { once: true });
            });
            console.log('✅ DOM is ready, proceeding with initialization');
        }
        
        // Use AutomationManager singleton for proper initialization
        const automationManager = AutomationManager.getInstance();
        
        // Initialize if not already done
        if (!automationManager.checkInitialized()) {
            await automationManager.initialize();
        }
        
        // Get the automation instance
        const automationPro = automationManager.getAutomationInstance();
            window.PageProcessorInstance = automationPro;
        
        // Start automation if not already running
        if (automationManager.getState() === 'idle') {
                    await automationPro.startAutomation();
        }
        
        console.log('✅ Automation initialized and started successfully');
        return automationPro;
        
        } catch (error) {
            console.error('❌ Automation initialization failed:', error.message);
            console.error('Error stack:', error.stack);
            
            // Handle state machine errors gracefully
            if (error.message.includes('Invalid state transition')) {
                console.warn('⚠️ State machine error detected, attempting recovery...');
                try {
                    const automationManager = AutomationManager.getInstance();
                    if (automationManager.checkInitialized()) {
                        const automationInstance = automationManager.getAutomationInstance();
                        if (automationInstance && automationInstance.stateMachine) {
                            // Reset to idle state
                            automationInstance.stateMachine.currentState = 'idle';
                            console.log('✅ State machine reset to idle');
                        }
                    }
                } catch (recoveryError) {
                    console.warn('⚠️ State machine recovery failed:', recoveryError.message);
                }
            }
            
            throw error;
        }
}

// Check for extension conflicts
const conflictingExtensions = [];
if (typeof window.smartAdSenseExtension !== 'undefined') {
    conflictingExtensions.push('smart-adsense-extension');
}
if (typeof window.adaptiveReaderExtension !== 'undefined') {
    conflictingExtensions.push('adaptive-reader-extension');
}
if (typeof window.SmartAdSenseContent !== 'undefined') {
    conflictingExtensions.push('SmartAdSenseContent');
}

if (conflictingExtensions.length > 0) {
    console.warn('⚠️ Conflicting extensions detected:', conflictingExtensions.join(', '));
    console.warn('⚠️ Consider disabling other extensions for optimal performance');
}

// Single entry point initialization
if (typeof window !== 'undefined' && !window.AdSenseAutomationProInstance) {
    // Wrap in IIFE to handle async operations
    (async () => {
        try {
            // Check if URL has changed (for navigation restart)
const currentUrl = window.location.href;
            const previousUrl = window.lastAutomationUrl;

            if (window.AdSenseAutomationProInstance && currentUrl !== previousUrl) {
        console.log('🔄 URL changed, restarting automation...');
                console.log('  - Previous URL:', previousUrl);
        console.log('  - Current URL:', currentUrl);
        
                // Cleanup previous instance using singleton
        try {
                    const automationManager = AutomationManager.getInstance();
                    if (automationManager.checkInitialized()) {
                        await automationManager.cleanup();
            }
        } catch (error) {
            console.debug('Cleanup during URL change failed:', error.message);
        }
        
        window.AdSenseAutomationProInstance = null;
    }
    
    // Store current URL for next comparison
    window.lastAutomationUrl = currentUrl;
            
            // Initialize automation
            await initializeAutomation();
        } catch (error) {
            console.error('❌ Initialization failed:', error.message);
        }
    })();
    
    // URL change detection for SPA navigation with debouncing
    let spaLastUrl = window.location.href;
    let urlChangeTimeout = null;
    let isUrlChangeInProgress = false;
    
    const checkUrlChange = async () => {
        const currentUrl = window.location.href;
        if (currentUrl !== spaLastUrl && !isUrlChangeInProgress) {
            isUrlChangeInProgress = true;
            
            console.log('🔄 URL changed detected (SPA navigation):');
            console.log('  - Previous URL:', spaLastUrl);
            console.log('  - Current URL:', currentUrl);
            
            // Clear any pending URL change timeout
            if (urlChangeTimeout) {
                clearTimeout(urlChangeTimeout);
                urlChangeTimeout = null;
            }
            
            // Cleanup previous automation using singleton
            try {
                const automationManager = AutomationManager.getInstance();
                if (automationManager.checkInitialized()) {
                    await automationManager.cleanup();
                    }
                } catch (error) {
                    console.debug('Cleanup during SPA navigation failed:', error.message);
                }
                window.AdSenseAutomationProInstance = null;
            
            // Update stored URL
            window.lastAutomationUrl = currentUrl;
            spaLastUrl = currentUrl;
            
            // Restart automation for new URL with delay
            urlChangeTimeout = setTimeout(async () => {
                try {
                console.log('🔄 Restarting automation for new URL...');
                    await initializeAutomation();
                } catch (error) {
                    console.error('❌ SPA navigation automation restart failed:', error.message);
                } finally {
                    isUrlChangeInProgress = false;
                    urlChangeTimeout = null;
                }
            }, 1000);
        }
    };
    
    // Check for URL changes every 500ms (for SPA navigation)
    setInterval(checkUrlChange, 500);
    
    // Listen for popstate events (back/forward navigation)
    window.addEventListener('popstate', () => {
        console.log('🔄 Popstate event detected (back/forward navigation)');
        setTimeout(checkUrlChange, 100);
    });
}

// Cleanup on page unload with graceful handling using singleton
window.addEventListener('beforeunload', () => {
    try {
        const automationManager = AutomationManager.getInstance();
        if (automationManager.checkInitialized()) {
            // Try to save session before cleanup (sync only)
            const automationInstance = automationManager.getAutomationInstance();
            if (automationInstance && automationInstance.sessionManager && automationInstance.sessionManager.currentSession) {
                // Use sendBeacon for reliable data transmission during page unload
                try {
                    const sessionData = automationInstance.sessionManager.exportSessionData();
                    if (navigator.sendBeacon) {
                        navigator.sendBeacon('/api/save-session', JSON.stringify(sessionData));
                    }
                } catch (error) {
                    console.debug('Session save during cleanup failed:', error.message);
                }
            }
            
            // Perform sync cleanup only
            automationManager.isInitialized = false;
            automationManager.automationInstance = null;
            automationManager.state = 'stopped';
        }
    } catch (error) {
        console.debug('Cleanup during page unload failed:', error.message);
    }
});

// Export for debugging
window.AdSenseAutomationPro = window.AdSenseAutomationProInstance;
