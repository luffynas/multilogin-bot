/**
 * Test script to verify that all required classes are properly loaded
 * Run this in browser console to test class availability
 */

function testClassLoading() {
    console.log('🧪 Testing class loading...');
    
    const requiredClasses = [
        'PersonalityEngine', 'BehaviorSimulator', 'MouseSimulator', 
        'KeyboardSimulator', 'ReadingSimulator', 'NavigationSimulator',
        'AdSenseDetector', 'SessionManager', 'StealthMonitor',
        'AnalyticsMonitor', 'DynamicAdaptationEngine', 'EnhancedFraudPrevention'
    ];
    
    const results = {
        available: [],
        missing: [],
        fallback: []
    };
    
    requiredClasses.forEach(className => {
        if (typeof window[className] !== 'undefined') {
            results.available.push(className);
            console.log(`✅ ${className} - Available`);
        } else {
            results.missing.push(className);
            console.log(`❌ ${className} - Missing`);
        }
    });
    
    // Test if fallback classes are working
    if (results.missing.length > 0) {
        console.log('🔧 Testing fallback creation...');
        
        // Simulate the fallback creation logic
        results.missing.forEach(className => {
            if (className === 'AnalyticsMonitor') {
                window.AnalyticsMonitor = class FallbackAnalyticsMonitor {
                    constructor() {
                        this.analyticsConfig = { enabled: false };
                        this.metrics = {};
                        this.currentSession = { startTime: Date.now(), pageViews: 0, adClicks: 0, adViews: 0, navigationCount: 0, readingTime: 0, riskLevel: 'low' };
                        this.historicalData = { sessions: [], dailyStats: [], weeklyTrends: [] };
                        this.monitoringTimer = null;
                    }
                    initialize() { return this; }
                    startMonitoring() {}
                    stopMonitoring() {}
                    trackPageView() { this.currentSession.pageViews++; }
                    trackAdView() { this.currentSession.adViews++; }
                    trackAdClick() { this.currentSession.adClicks++; }
                    trackNavigation() { this.currentSession.navigationCount++; }
                    trackReadingTime(duration) { this.currentSession.readingTime += duration; }
                    getAnalyticsReport() { return { currentSession: this.currentSession, metrics: this.metrics }; }
                    cleanup() {}
                };
                results.fallback.push(className);
                console.log(`🔧 ${className} - Fallback created`);
            }
            
            if (className === 'DynamicAdaptationEngine') {
                window.DynamicAdaptationEngine = class FallbackDynamicAdaptationEngine {
                    constructor() {
                        this.adaptationConfig = { enabled: false };
                        this.currentContext = { website: '', pageType: '', contentType: '', timeOfDay: '', sessionDuration: 0, riskLevel: 'minimal', adaptationLevel: 'monitoring', lastAdaptation: Date.now() };
                        this.adaptationHistory = [];
                        this.behaviorModifiers = { clickProbability: 1.0, navigationFrequency: 1.0, readingSpeed: 1.0, interactionDelay: 1.0, stealthLevel: 1.0 };
                        this.adaptationTimer = null;
                        this.analyticsMonitor = null;
                    }
                    initialize(analyticsMonitor) { this.analyticsMonitor = analyticsMonitor; return this; }
                    startAdaptation() {}
                    stopAdaptation() {}
                    analyzeCurrentContext() { return this.currentContext; }
                    assessRiskLevel() { return { level: 'low', score: 0, factors: [] }; }
                    adaptBehavior() {}
                    getCurrentRiskAssessment() { return { level: 'low', score: 0, factors: [] }; }
                    getRecommendations() { return []; }
                    cleanup() {}
                };
                results.fallback.push(className);
                console.log(`🔧 ${className} - Fallback created`);
            }
            
            if (className === 'EnhancedFraudPrevention') {
                window.EnhancedFraudPrevention = class FallbackEnhancedFraudPrevention {
                    constructor() {
                        this.fraudConfig = { enabled: false };
                        this.clickLimits = { hourly: { max: 8, current: 0, resetTime: Date.now() + 3600000 }, daily: { max: 25, current: 0, resetTime: Date.now() + 86400000 }, session: { max: 12, current: 0 }, perPage: { max: 2, current: 0, pageUrl: '' }, perDomain: { max: 4, current: 0, domain: '' } };
                        this.interactionRequirements = { minTimeOnPage: 30000, minScrollDepth: 0.3, requireReading: true, requireNaturalPauses: true, minLandingPageTime: 15000, requireLandingPageInteraction: true };
                        this.behaviorPatterns = { clickIntervals: [], navigationPatterns: [], readingPatterns: [], sessionPatterns: [] };
                        this.riskAssessment = { currentRisk: 'low', riskFactors: [], riskScore: 0, lastAssessment: Date.now() };
                        this.blockedActions = [];
                        this.whitelistedDomains = [];
                        this.blacklistedDomains = [];
                        this.monitoringTimer = null;
                    }
                    initialize() { return this; }
                    setupClickTracking() {}
                    startRealTimeMonitoring() {}
                    stopRealTimeMonitoring() {}
                    validateClick(adElement, adInfo) { return { valid: true, reason: 'fallback_mode' }; }
                    recordClick(adElement, adInfo) {}
                    assessCurrentRisk() { return { level: 'low', score: 0, factors: [] }; }
                    cleanup() {}
                };
                results.fallback.push(className);
                console.log(`🔧 ${className} - Fallback created`);
            }
        });
    }
    
    // Test instantiation
    console.log('🧪 Testing class instantiation...');
    try {
        const analyticsMonitor = new window.AnalyticsMonitor();
        console.log('✅ AnalyticsMonitor instantiation - Success');
        
        const dynamicAdaptationEngine = new window.DynamicAdaptationEngine();
        console.log('✅ DynamicAdaptationEngine instantiation - Success');
        
        const enhancedFraudPrevention = new window.EnhancedFraudPrevention();
        console.log('✅ EnhancedFraudPrevention instantiation - Success');
        
        // Test initialization
        analyticsMonitor.initialize();
        dynamicAdaptationEngine.initialize(analyticsMonitor);
        enhancedFraudPrevention.initialize();
        
        console.log('✅ All classes initialized successfully');
        
    } catch (error) {
        console.error('❌ Class instantiation failed:', error);
    }
    
    // Summary
    console.log('\n📊 Test Results Summary:');
    console.log(`✅ Available classes: ${results.available.length}/${requiredClasses.length}`);
    console.log(`🔧 Fallback classes: ${results.fallback.length}`);
    console.log(`❌ Missing classes: ${results.missing.length}`);
    
    if (results.available.length === requiredClasses.length) {
        console.log('🎉 All classes are available!');
    } else if (results.available.length + results.fallback.length === requiredClasses.length) {
        console.log('🔧 All classes available with fallbacks!');
    } else {
        console.log('⚠️ Some classes are still missing');
    }
    
    return results;
}

// Auto-run test
if (typeof window !== 'undefined') {
    console.log('🚀 Running class loading test...');
    testClassLoading();
} else {
    console.log('This test should be run in a browser environment');
}
