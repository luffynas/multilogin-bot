/**
 * Test script untuk menganalisis mengapa tidak ada iklan Google AdSense yang diklik
 * Meskipun banyak iklan yang muncul
 */

function testAdSenseClicks() {
    console.log('🧪 Testing AdSense Click Analysis...');
    
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

    console.log('\n--- 1. Testing AdSense Detection ---');
    const ads = adsenseDetector.detectAdSenseAds();
    console.log('✅ Total ads detected:', ads.length);
    
    if (ads.length === 0) {
        console.log('❌ No ads detected! This is the problem.');
        return;
    }

    // Analyze each ad
    ads.forEach((ad, index) => {
        console.log(`\n📊 Ad ${index + 1}:`);
        console.log('  - isAdSense:', ad.isAdSense);
        console.log('  - isHighValue:', ad.isHighValue);
        console.log('  - category:', ad.category);
        console.log('  - position:', ad.position);
        console.log('  - size:', ad.size);
        console.log('  - clickable:', ad.clickable);
        console.log('  - value:', ad.value);
        console.log('  - element:', ad.element ? 'Found' : 'Not found');
    });

    console.log('\n--- 2. Testing Personality Configuration ---');
    const personality = personalityEngine.getCurrentPersonality();
    console.log('✅ Current personality:', personality.type);
    console.log('✅ clickProbability:', personality.clickProbability);
    console.log('✅ hoverProbability:', personality.hoverProbability);

    console.log('\n--- 3. Testing Click Probability Configuration ---');
    const config = adsenseDetector.clickProbabilityConfig;
    console.log('✅ min:', (config.min * 100).toFixed(1) + '%');
    console.log('✅ max:', (config.max * 100).toFixed(1) + '%');
    console.log('✅ default:', (config.default * 100).toFixed(1) + '%');
    console.log('✅ personalityMultipliers:', config.personalityMultipliers);
    console.log('✅ valueMultipliers:', config.valueMultipliers);

    console.log('\n--- 4. Testing Click Probability Calculation ---');
    const testAd = ads[0]; // Use first ad for testing
    if (testAd) {
        console.log('📊 Testing with first ad:');
        console.log('  - isAdSense:', testAd.isAdSense);
        console.log('  - isHighValue:', testAd.isHighValue);
        console.log('  - category:', testAd.category);
        console.log('  - position:', testAd.position);
        console.log('  - size:', testAd.size);
        
        // Calculate click probability manually
        let baseProbability = personality.clickProbability || config.default;
        let adjustedProbability = baseProbability;
        
        console.log('  - baseProbability:', (baseProbability * 100).toFixed(1) + '%');
        
        // High value ads get higher click probability
        if (testAd.isHighValue) {
            adjustedProbability *= config.valueMultipliers.highValue;
            console.log('  - highValue boost:', (config.valueMultipliers.highValue * 100).toFixed(1) + '%');
        }
        
        // Professional personalities prefer high-value ads
        if (personality.type === 'professional' && testAd.isHighValue) {
            adjustedProbability *= config.personalityMultipliers.professional;
            console.log('  - professional boost:', (config.personalityMultipliers.professional * 100).toFixed(1) + '%');
        }
        
        // Researcher personalities click more on informational ads
        if (personality.type === 'researcher') {
            adjustedProbability *= config.personalityMultipliers.researcher;
            console.log('  - researcher boost:', (config.personalityMultipliers.researcher * 100).toFixed(1) + '%');
        }
        
        // Explorer personalities click more on various ads
        if (personality.type === 'explorer') {
            adjustedProbability *= config.personalityMultipliers.explorer;
            console.log('  - explorer boost:', (config.personalityMultipliers.explorer * 100).toFixed(1) + '%');
        }
        
        // Casual personalities click less
        if (personality.type === 'casual') {
            adjustedProbability *= config.personalityMultipliers.casual;
            console.log('  - casual reduction:', (config.personalityMultipliers.casual * 100).toFixed(1) + '%');
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
        console.log(`✅ Click probability over ${testCount} tests: ${(clickCount / testCount * 100).toFixed(1)}%`);
    }

    console.log('\n--- 6. Testing smartAdInteraction Function ---');
    if (testAd) {
        console.log('📊 Testing smartAdInteraction...');
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

    console.log('\n--- 8. Testing Session Summary ---');
    const sessionSummary = adsenseDetector.getSessionSummary();
    console.log('✅ Session Summary:', sessionSummary);

    console.log('\n--- 9. Testing Click Probability Summary ---');
    const clickSummary = adsenseDetector.getClickProbabilitySummary();
    console.log('✅ Click Probability Summary:', clickSummary);

    console.log('\n🧪 AdSense Click Analysis Complete!');
    console.log('\n📊 Potential Issues:');
    
    if (ads.length === 0) {
        console.log('❌ No ads detected - check ad selectors');
    }
    
    if (testAd && !testAd.isAdSense) {
        console.log('❌ Ads not detected as AdSense - check isAdSenseAd function');
    }
    
    if (testAd && !testAd.clickable) {
        console.log('❌ Ads not clickable - check clickable detection');
    }
    
    if (personality.clickProbability < 0.1) {
        console.log('❌ Personality click probability too low:', (personality.clickProbability * 100).toFixed(1) + '%');
    }
    
    if (config.min > 0.3) {
        console.log('❌ Minimum click probability too high:', (config.min * 100).toFixed(1) + '%');
    }
    
    console.log('\n🎯 Recommendations:');
    console.log('• Check if ads are properly detected as AdSense');
    console.log('• Verify clickable detection logic');
    console.log('• Review personality click probability settings');
    console.log('• Consider adjusting click probability configuration');
    console.log('• Test with different personality types');
}

// Auto-run test
testAdSenseClicks();
