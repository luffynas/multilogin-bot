/**
 * Debug script untuk menguji dan memperbaiki masalah navigation
 * Berdasarkan analisis console log pengajartekno.co.id
 */

function debugNavigationIssues() {
    console.log('🔍 Debugging Navigation Issues...');
    
    const debugResults = {
        issues: [],
        fixes: [],
        recommendations: []
    };
    
    // Check 1: StealthManager Availability
    console.log('\n--- 1. Checking StealthManager Availability ---');
    if (typeof StealthManager === 'undefined') {
        debugResults.issues.push({
            type: 'CRITICAL',
            issue: 'StealthManager not available',
            impact: 'Extension falls back to basic simulation only',
            line: 'Line 5 & 11 in console log'
        });
        console.log('❌ StealthManager not available');
        
        // Fix 1: Enhanced Fallback
        debugResults.fixes.push({
            fix: 'Implement enhanced StealthManager fallback',
            code: `
                if (typeof StealthManager === 'undefined') {
                    console.warn('⚠️ StealthManager not available, using enhanced fallback');
                    window.StealthManager = new EnhancedStealthManager();
                }
            `
        });
    } else {
        console.log('✅ StealthManager available');
    }
    
    // Check 2: AdSenseAutomationPro Instance
    console.log('\n--- 2. Checking AdSenseAutomationPro Instance ---');
    if (!window.AdSenseAutomationProInstance) {
        debugResults.issues.push({
            type: 'CRITICAL',
            issue: 'AdSenseAutomationProInstance not available',
            impact: 'No automation system running',
            line: 'Missing from console log'
        });
        console.log('❌ AdSenseAutomationProInstance not available');
        
        // Fix 2: Initialize Instance
        debugResults.fixes.push({
            fix: 'Initialize AdSenseAutomationPro instance',
            code: `
                if (!window.AdSenseAutomationProInstance) {
                    console.warn('⚠️ AdSenseAutomationProInstance not available, initializing now');
                    window.AdSenseAutomationProInstance = new AdSenseAutomationPro();
                    window.AdSenseAutomationProInstance.initialize();
                }
            `
        });
    } else {
        console.log('✅ AdSenseAutomationProInstance available');
        
        // Check instance status
        console.log('  - Is running:', window.AdSenseAutomationProInstance.isRunning);
        console.log('  - Is initialized:', window.AdSenseAutomationProInstance.isInitialized);
        
        if (!window.AdSenseAutomationProInstance.isRunning) {
            debugResults.issues.push({
                type: 'CRITICAL',
                issue: 'Automation loop not running',
                impact: 'No automation behavior',
                line: 'Missing automation loop logs'
            });
            console.log('❌ Automation loop not running');
            
            // Fix 3: Start Automation
            debugResults.fixes.push({
                fix: 'Start automation loop',
                code: `
                    if (!window.AdSenseAutomationProInstance.isRunning) {
                        console.warn('⚠️ Automation loop not running, starting now');
                        window.AdSenseAutomationProInstance.startAutomation();
                    }
                `
            });
        }
    }
    
    // Check 3: Navigation Simulator
    console.log('\n--- 3. Checking Navigation Simulator ---');
    if (window.AdSenseAutomationProInstance?.navigationSimulator) {
        console.log('✅ Navigation simulator available');
        console.log('  - Is navigating:', window.AdSenseAutomationProInstance.navigationSimulator.isNavigating);
        console.log('  - Navigation lock:', window.AdSenseAutomationProInstance.navigationSimulator.navigationLock);
    } else {
        debugResults.issues.push({
            type: 'CRITICAL',
            issue: 'Navigation simulator not initialized',
            impact: 'No navigation attempts',
            line: 'Missing navigation logs'
        });
        console.log('❌ Navigation simulator not available');
        
        // Fix 4: Initialize Navigation Simulator
        debugResults.fixes.push({
            fix: 'Initialize navigation simulator',
            code: `
                if (!window.AdSenseAutomationProInstance?.navigationSimulator) {
                    console.warn('⚠️ Navigation simulator not initialized, initializing now');
                    window.AdSenseAutomationProInstance.navigationSimulator = new NavigationSimulator();
                    window.AdSenseAutomationProInstance.navigationSimulator.initialize();
                }
            `
        });
    }
    
    // Check 4: AdSense Detector
    console.log('\n--- 4. Checking AdSense Detector ---');
    if (window.AdSenseAutomationProInstance?.adsenseDetector) {
        console.log('✅ AdSense detector available');
    } else {
        debugResults.issues.push({
            type: 'HIGH',
            issue: 'AdSense detector not initialized',
            impact: 'No ad interactions',
            line: 'Missing AdSense logs'
        });
        console.log('❌ AdSense detector not available');
        
        // Fix 5: Initialize AdSense Detector
        debugResults.fixes.push({
            fix: 'Initialize AdSense detector',
            code: `
                if (!window.AdSenseAutomationProInstance?.adsenseDetector) {
                    console.warn('⚠️ AdSense detector not initialized, initializing now');
                    window.AdSenseAutomationProInstance.adsenseDetector = new AdSenseDetector();
                }
            `
        });
    }
    
    // Check 5: Reading to Navigation Transition
    console.log('\n--- 5. Checking Reading to Navigation Transition ---');
    if (window.AdSenseAutomationProInstance?.readingSimulator) {
        console.log('✅ Reading simulator available');
        console.log('  - Reading completed:', window.AdSenseAutomationProInstance.readingCompleted);
        console.log('  - Last reading time:', window.AdSenseAutomationProInstance.lastReadingTime);
        
        if (window.AdSenseAutomationProInstance.readingCompleted && !window.AdSenseAutomationProInstance.navigationSimulator?.isNavigating) {
            debugResults.issues.push({
                type: 'HIGH',
                issue: 'Reading completed but no navigation transition',
                impact: 'Stuck in reading mode',
                line: 'Line 144-342: Reading behavior only'
            });
            console.log('❌ Reading completed but no navigation transition');
            
            // Fix 6: Force Navigation Transition
            debugResults.fixes.push({
                fix: 'Force navigation transition after reading',
                code: `
                    if (window.AdSenseAutomationProInstance.readingCompleted && !window.AdSenseAutomationProInstance.navigationSimulator?.isNavigating) {
                        console.log('🧭 Reading completed, forcing navigation transition...');
                        window.AdSenseAutomationProInstance.navigationSimulator.simulateIntelligentNavigation();
                    }
                `
            });
        }
    } else {
        console.log('❌ Reading simulator not available');
    }
    
    // Check 6: Navigation Links Availability
    console.log('\n--- 6. Checking Navigation Links Availability ---');
    if (window.AdSenseAutomationProInstance?.navigationSimulator) {
        try {
            const navigationUrls = window.AdSenseAutomationProInstance.navigationSimulator.previewNavigationUrls();
            console.log(`✅ Found ${navigationUrls.length} navigation URLs`);
            
            if (navigationUrls.length === 0) {
                debugResults.issues.push({
                    type: 'MEDIUM',
                    issue: 'No navigation links found',
                    impact: 'No navigation targets available',
                    line: 'No navigation URLs detected'
                });
                console.log('❌ No navigation links found');
            }
        } catch (error) {
            console.log('❌ Error checking navigation URLs:', error.message);
        }
    }
    
    // Check 7: Class Loading Status
    console.log('\n--- 7. Checking Class Loading Status ---');
    const requiredClasses = [
        'StealthManager',
        'NavigationSimulator', 
        'AdSenseAutomationPro',
        'AdSenseDetector',
        'BehaviorSimulator',
        'ReadingSimulator'
    ];
    
    const missingClasses = [];
    requiredClasses.forEach(className => {
        if (typeof window[className] === 'undefined') {
            missingClasses.push(className);
            console.log(`❌ ${className} not available`);
        } else {
            console.log(`✅ ${className} available`);
        }
    });
    
    if (missingClasses.length > 0) {
        debugResults.issues.push({
            type: 'CRITICAL',
            issue: `Missing classes: ${missingClasses.join(', ')}`,
            impact: 'Extension functionality compromised',
            line: 'Class loading issues'
        });
        
        // Fix 7: Class Loading Fix
        debugResults.fixes.push({
            fix: 'Fix class loading issues',
            code: `
                // Add to webpack.config.js
                mangle: {
                    reserved: [
                        'StealthManager',
                        'NavigationSimulator',
                        'AdSenseAutomationPro',
                        'AdSenseDetector',
                        'BehaviorSimulator',
                        'ReadingSimulator'
                    ]
                }
            `
        });
    }
    
    // Display Results
    console.log('\n--- Debug Results Summary ---');
    console.log(`Total Issues Found: ${debugResults.issues.length}`);
    console.log(`Total Fixes Available: ${debugResults.fixes.length}`);
    
    console.log('\n--- Issues Found ---');
    debugResults.issues.forEach((issue, index) => {
        console.log(`${index + 1}. [${issue.type}] ${issue.issue}`);
        console.log(`   Impact: ${issue.impact}`);
        console.log(`   Location: ${issue.line}`);
    });
    
    console.log('\n--- Fixes Available ---');
    debugResults.fixes.forEach((fix, index) => {
        console.log(`${index + 1}. ${fix.fix}`);
        console.log(`   Code: ${fix.code.trim()}`);
    });
    
    // Recommendations
    console.log('\n--- Recommendations ---');
    debugResults.recommendations.push('1. Implement StealthManager fallback mechanism');
    debugResults.recommendations.push('2. Ensure AdSenseAutomationPro instance initialization');
    debugResults.recommendations.push('3. Fix class loading issues in webpack.config.js');
    debugResults.recommendations.push('4. Add navigation transition after reading completion');
    debugResults.recommendations.push('5. Implement automation loop start mechanism');
    debugResults.recommendations.push('6. Add comprehensive error handling and logging');
    
    debugResults.recommendations.forEach((rec, index) => {
        console.log(`${rec}`);
    });
    
    // Test Navigation Manually
    console.log('\n--- Manual Navigation Test ---');
    if (window.AdSenseAutomationProInstance?.navigationSimulator) {
        try {
            console.log('🧪 Testing navigation manually...');
            const testUrls = window.AdSenseAutomationProInstance.navigationSimulator.previewNavigationUrls();
            console.log(`✅ Manual test successful: Found ${testUrls.length} URLs`);
        } catch (error) {
            console.log('❌ Manual test failed:', error.message);
        }
    } else {
        console.log('❌ Cannot test navigation - simulator not available');
    }
    
    return debugResults;
}

// Auto-run debug
debugNavigationIssues();
