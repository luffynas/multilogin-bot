/**
 * Test script untuk memverifikasi perbaikan AdSense click probability
 * Menguji peningkatan click probability dan konfigurasi yang diperbaiki
 */

function testAdSenseClickFix() {
    console.log('🧪 Testing AdSense Click Fix...');
    
    const automationPro = window.AdSenseAutomationProInstance;
    if (!automationPro) {
        console.error('❌ AdSenseAutomationProInstance not found. Ensure extension is running.');
        return;
    }

    const adsenseDetector = automationPro.adsenseDetector;
    const personalityEngine = automationPro.personalityEngine;
    
    if (!adsenseDetector) {
        console.error('❌ AdSenseDetector not found.');
        return;
    }

    console.log('\n--- 1. Testing Updated Click Probability Configuration ---');
    const config = adsenseDetector.clickProbabilityConfig;
    console.log('✅ min:', (config.min * 100).toFixed(1) + '% (was 20%)');
    console.log('✅ max:', (config.max * 100).toFixed(1) + '% (was 25%)');
    console.log('✅ default:', (config.default * 100).toFixed(1) + '% (was 15%)');
    console.log('✅ personalityMultipliers:', config.personalityMultipliers);
    console.log('✅ valueMultipliers:', config.valueMultipliers);

    console.log('\n--- 2. Testing Updated Personality Click Probabilities ---');
    const personality = personalityEngine.getCurrentPersonality();
    console.log('✅ Current personality:', personality.type);
    console.log('✅ clickProbability:', (personality.clickProbability * 100).toFixed(1) + '%');
    
    // Test all personality types
    const personalityTypes = ['explorer', 'researcher', 'casual', 'professional'];
    personalityTypes.forEach(type => {
        const testPersonality = personalityEngine.createPersonality(type);
        console.log(`✅ ${type}: ${(testPersonality.clickProbability * 100).toFixed(1)}%`);
    });

    console.log('\n--- 3. Testing AdSense Detection ---');
    const ads = adsenseDetector.detectAdSenseAds();
    console.log('✅ Total ads detected:', ads.length);
    
    if (ads.length === 0) {
        console.log('❌ No ads detected! Check ad selectors.');
        return;
    }

    // Analyze first ad
    const testAd = ads[0];
    console.log('📊 First ad analysis:');
    console.log('  - isAdSense:', testAd.isAdSense);
    console.log('  - isHighValue:', testAd.isHighValue);
    console.log('  - category:', testAd.category);
    console.log('  - position:', testAd.position);
    console.log('  - size:', testAd.size);
    console.log('  - clickable:', testAd.clickable);

    console.log('\n--- 4. Testing Click Probability Calculation ---');
    if (testAd) {
        // Calculate click probability manually with new values
        let baseProbability = personality.clickProbability || config.default;
        let adjustedProbability = baseProbability;
        
        console.log('📊 Click probability calculation:');
        console.log('  - baseProbability:', (baseProbability * 100).toFixed(1) + '%');
        
        // High value ads get higher click probability
        if (testAd.isHighValue) {
            adjustedProbability *= config.valueMultipliers.highValue;
            console.log('  - highValue boost:', (config.valueMultipliers.highValue * 100).toFixed(1) + '%');
        }
        
        // Personality multipliers
        if (personality.type === 'researcher') {
            adjustedProbability *= config.personalityMultipliers.researcher;
            console.log('  - researcher boost:', (config.personalityMultipliers.researcher * 100).toFixed(1) + '%');
        } else if (personality.type === 'explorer') {
            adjustedProbability *= config.personalityMultipliers.explorer;
            console.log('  - explorer boost:', (config.personalityMultipliers.explorer * 100).toFixed(1) + '%');
        } else if (personality.type === 'professional') {
            adjustedProbability *= config.personalityMultipliers.professional;
            console.log('  - professional boost:', (config.personalityMultipliers.professional * 100).toFixed(1) + '%');
        } else if (personality.type === 'casual') {
            adjustedProbability *= config.personalityMultipliers.casual;
            console.log('  - casual boost:', (config.personalityMultipliers.casual * 100).toFixed(1) + '%');
        }
        
        // Position-based boost
        if (testAd.position === 'above_fold') {
            adjustedProbability *= config.valueMultipliers.aboveFold;
            console.log('  - aboveFold boost:', (config.valueMultipliers.aboveFold * 100).toFixed(1) + '%');
        }
        
        // Size-based boost
        if (testAd.size === 'large') {
            adjustedProbability *= config.valueMultipliers.largeSize;
            console.log('  - largeSize boost:', (config.valueMultipliers.largeSize * 100).toFixed(1) + '%');
        } else if (testAd.size === 'medium') {
            adjustedProbability *= config.valueMultipliers.mediumSize;
            console.log('  - mediumSize boost:', (config.valueMultipliers.mediumSize * 100).toFixed(1) + '%');
        }
        
        // Apply min-max constraints
        adjustedProbability = Math.max(config.min, Math.min(adjustedProbability, config.max));
        
        console.log('  - finalProbability:', (adjustedProbability * 100).toFixed(1) + '%');
        console.log('  - shouldClick (random test):', Math.random() < adjustedProbability ? 'YES' : 'NO');
    }

    console.log('\n--- 5. Testing shouldClickAd Function ---');
    if (testAd) {
        const shouldClick = adsenseDetector.shouldClickAd(testAd, personality);
        console.log('✅ shouldClickAd result:', shouldClick);
        
        // Test multiple times to see probability
        let clickCount = 0;
        const testCount = 100;
        for (let i = 0; i < testCount; i++) {
            if (adsenseDetector.shouldClickAd(testAd, personality)) {
                clickCount++;
            }
        }
        const actualProbability = (clickCount / testCount * 100).toFixed(1);
        console.log(`✅ Click probability over ${testCount} tests: ${actualProbability}%`);
        
        if (parseFloat(actualProbability) > 10) {
            console.log('✅ Good! Click probability is reasonable');
        } else {
            console.log('⚠️ Click probability still low, may need further adjustment');
        }
    }

    console.log('\n--- 6. Testing smartAdInteraction Function ---');
    if (testAd) {
        console.log('📊 Testing smartAdInteraction conditions...');
        console.log('  - adInfo.isAdSense:', testAd.isAdSense);
        console.log('  - adInfo.clickable:', testAd.clickable);
        
        if (!testAd.isAdSense) {
            console.log('❌ Ad is not detected as AdSense ad!');
        }
        if (!testAd.clickable) {
            console.log('❌ Ad is not clickable!');
        }
        
        if (testAd.isAdSense && testAd.clickable) {
            console.log('✅ Ad should be processable by smartAdInteraction');
        } else {
            console.log('❌ Ad will be skipped by smartAdInteraction');
        }
    }

    console.log('\n--- 7. Testing Ad Metrics ---');
    const metrics = adsenseDetector.adMetrics;
    console.log('✅ totalAds:', metrics.totalAds);
    console.log('✅ highValueAds:', metrics.highValueAds);
    console.log('✅ clickedAds:', metrics.clickedAds);
    console.log('✅ hoveredAds:', metrics.hoveredAds);

    console.log('\n--- 8. Testing Click Probability Summary ---');
    const clickSummary = adsenseDetector.getClickProbabilitySummary();
    console.log('✅ Click Probability Summary:', clickSummary);

    console.log('\n--- 9. Testing Different Personality Types ---');
    personalityTypes.forEach(type => {
        const testPersonality = personalityEngine.createPersonality(type);
        const testResult = adsenseDetector.shouldClickAd(testAd, testPersonality);
        console.log(`✅ ${type}: ${testResult ? 'WOULD CLICK' : 'would not click'}`);
    });

    console.log('\n🧪 AdSense Click Fix Test Complete!');
    console.log('\n📊 Summary of Fixes:');
    console.log('✅ Reduced minimum click probability from 20% to 5%');
    console.log('✅ Increased maximum click probability from 25% to 35%');
    console.log('✅ Increased default click probability from 15% to 20%');
    console.log('✅ Increased personality multipliers (researcher: 1.1→1.3, explorer: 1.1→1.2, casual: 0.9→1.0)');
    console.log('✅ Increased value multipliers (highValue: 1.2→1.5, aboveFold: 1.1→1.3)');
    console.log('✅ Increased personality click probabilities (researcher: 15%→30%, explorer: 12%→25%, casual: 8%→20%, professional: 10%→22%)');
    
    console.log('\n🎯 Expected Results:');
    console.log('• Click probability should be significantly higher');
    console.log('• More ads should be clicked during automation');
    console.log('• Better ad interaction and engagement');
    console.log('• Improved RPM optimization');
    
    console.log('\n🔍 Debug Information:');
    console.log('• If click probability is still low, check ad detection and clickable status');
    console.log('• If no ads are detected, check ad selectors and website structure');
    console.log('• If ads are not clickable, check CSS and element properties');
    console.log('• Monitor console for "Ad interaction error" messages');
}

// Auto-run test
testAdSenseClickFix();
