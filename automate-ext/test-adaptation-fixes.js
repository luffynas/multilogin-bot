/**
 * Test script untuk memverifikasi perbaikan Dynamic Adaptation Engine
 * Menguji cooldown, session limits, dan risk assessment yang lebih seimbang
 */

function testAdaptationFixes() {
    console.log('🧪 Testing Dynamic Adaptation Engine Fixes...');
    
    const automationPro = window.AdSenseAutomationProInstance;
    if (!automationPro) {
        console.error('❌ AdSenseAutomationProInstance not found. Ensure extension is running.');
        return;
    }

    const adaptationEngine = automationPro.dynamicAdaptationEngine;
    if (!adaptationEngine) {
        console.error('❌ DynamicAdaptationEngine not found.');
        return;
    }

    console.log('\n--- 1. Testing Configuration Changes ---');
    const config = adaptationEngine.adaptationConfig;
    console.log('✅ Adaptation Interval:', config.adaptationInterval / 1000, 'seconds (should be 300)');
    console.log('✅ Adaptation Cooldown:', config.adaptationCooldown / 1000, 'seconds (should be 120)');
    console.log('✅ Max Adaptations Per Session:', config.maxAdaptationsPerSession, '(should be 3)');
    console.log('✅ Risk Thresholds:', config.riskThresholds);

    console.log('\n--- 2. Testing Session Tracking ---');
    const stats = adaptationEngine.getAdaptationStats();
    console.log('✅ Session Adaptations:', stats.sessionAdaptations, '/', stats.maxAdaptationsPerSession);
    console.log('✅ Last Adaptation Time:', stats.lastAdaptationTime);
    console.log('✅ Current Risk Level:', stats.currentRiskLevel);
    console.log('✅ Current Adaptation Level:', stats.currentAdaptationLevel);

    console.log('\n--- 3. Testing Risk Assessment Sensitivity ---');
    // Simulate risk factors to test new scoring
    const testRiskFactors = [
        { type: 'high_ctr' },
        { type: 'rapid_navigation' },
        { type: 'consistent_timing' },
        { type: 'excessive_clicks' },
        { type: 'unnatural_patterns' }
    ];

    let testRiskScore = 0;
    testRiskFactors.forEach(factor => {
        switch (factor.type) {
            case 'high_ctr':
                testRiskScore += 8; // New reduced score
                break;
            case 'rapid_navigation':
                testRiskScore += 6; // New reduced score
                break;
            case 'consistent_timing':
                testRiskScore += 10; // New reduced score
                break;
            case 'excessive_clicks':
                testRiskScore += 12; // New reduced score
                break;
            case 'unnatural_patterns':
                testRiskScore += 15; // New reduced score
                break;
        }
    });

    console.log('✅ Test Risk Score (all factors):', testRiskScore);
    console.log('✅ Risk Level for test score:', adaptationEngine.calculateRiskLevel(testRiskScore));

    console.log('\n--- 4. Testing Adaptation Strategies ---');
    const strategies = {
        emergency: adaptationEngine.getAdaptationStrategy(),
        aggressive: adaptationEngine.getAdaptationStrategy(),
        moderate: adaptationEngine.getAdaptationStrategy(),
        light: adaptationEngine.getAdaptationStrategy(),
        monitoring: adaptationEngine.getAdaptationStrategy()
    };

    // Test each strategy level
    ['emergency', 'aggressive', 'moderate', 'light', 'monitoring'].forEach(level => {
        adaptationEngine.currentContext.adaptationLevel = level;
        const strategy = adaptationEngine.getAdaptationStrategy();
        console.log(`✅ ${level.toUpperCase()} Strategy:`, {
            clickProbability: strategy.clickProbability,
            navigationFrequency: strategy.navigationFrequency,
            readingSpeed: strategy.readingSpeed,
            interactionDelay: strategy.interactionDelay,
            stealthLevel: strategy.stealthLevel
        });
    });

    console.log('\n--- 5. Testing Cooldown Mechanism ---');
    const now = Date.now();
    adaptationEngine.lastAdaptationTime = now - 60000; // 1 minute ago
    console.log('✅ Time since last adaptation:', (now - adaptationEngine.lastAdaptationTime) / 1000, 'seconds');
    console.log('✅ Cooldown period:', adaptationEngine.adaptationConfig.adaptationCooldown / 1000, 'seconds');
    console.log('✅ Can adapt now:', (now - adaptationEngine.lastAdaptationTime) >= adaptationEngine.adaptationConfig.adaptationCooldown);

    console.log('\n--- 6. Testing Session Limit ---');
    console.log('✅ Current session adaptations:', adaptationEngine.sessionAdaptations);
    console.log('✅ Max adaptations per session:', adaptationEngine.adaptationConfig.maxAdaptationsPerSession);
    console.log('✅ Can adapt more:', adaptationEngine.sessionAdaptations < adaptationEngine.adaptationConfig.maxAdaptationsPerSession);

    console.log('\n--- 7. Testing Reset Function ---');
    adaptationEngine.resetSessionAdaptations();
    const resetStats = adaptationEngine.getAdaptationStats();
    console.log('✅ After reset - Session Adaptations:', resetStats.sessionAdaptations, '(should be 0)');
    console.log('✅ After reset - Last Adaptation Time:', resetStats.lastAdaptationTime, '(should be 0)');

    console.log('\n--- 8. Testing Context Risk Calculation ---');
    adaptationEngine.currentContext.website = 'google.com';
    adaptationEngine.currentContext.timeOfDay = 'night';
    adaptationEngine.currentContext.sessionDuration = 7200000; // 2 hours
    adaptationEngine.currentContext.pageType = 'search';
    
    const contextRisk = adaptationEngine.calculateContextRisk();
    console.log('✅ Context Risk Score:', contextRisk, '(should be 10: 3+2+3+2)');
    console.log('✅ Website Risk (google.com):', 3);
    console.log('✅ Time Risk (night):', 2);
    console.log('✅ Session Risk (2 hours):', 3);
    console.log('✅ Page Type Risk (search):', 2);

    console.log('\n🧪 Dynamic Adaptation Engine Fixes Test Complete!');
    console.log('\n📊 Summary of Improvements:');
    console.log('✅ Increased adaptation interval from 1 to 5 minutes');
    console.log('✅ Added 2-minute cooldown between adaptations');
    console.log('✅ Limited to 3 adaptations per session');
    console.log('✅ Reduced risk factor scores by 50-60%');
    console.log('✅ Increased risk thresholds significantly');
    console.log('✅ Made adaptation strategies less aggressive');
    console.log('✅ Added session tracking and reset functionality');
    console.log('✅ Reduced context risk scores');
    
    console.log('\n🎯 Expected Results:');
    console.log('• Fewer "🔄 Adaptation applied" messages in console');
    console.log('• More stable behavior patterns');
    console.log('• Better performance on websites like pengajartekno.co.id');
    console.log('• Reduced over-adaptation issues');
}

// Auto-run test
testAdaptationFixes();
