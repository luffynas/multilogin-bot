/**
 * Test script untuk memvalidasi automation start
 * Berdasarkan analisis automation tidak berjalan setelah content artikel dibuka
 */

function testAutomationStart() {
    console.log('🧪 Testing Automation Start...');
    
    const testResults = {
        tests: [],
        passed: 0,
        failed: 0,
        overall: false
    };
    
    // Test 1: Check if automation instance exists
    console.log('\n--- Test 1: Automation Instance Exists ---');
    try {
        if (window.AdSenseAutomationProInstance) {
            testResults.tests.push({ name: 'Automation Instance Exists', status: 'PASS' });
            testResults.passed++;
            console.log('✅ AdSenseAutomationProInstance found');
        } else {
            testResults.tests.push({ name: 'Automation Instance Exists', status: 'FAIL' });
            testResults.failed++;
            console.log('❌ AdSenseAutomationProInstance not found');
        }
    } catch (error) {
        testResults.tests.push({ name: 'Automation Instance Exists', status: 'ERROR', error: error.message });
        testResults.failed++;
        console.log('❌ Error checking automation instance:', error.message);
    }
    
    // Test 2: Check if automation is initialized
    console.log('\n--- Test 2: Automation Initialized ---');
    try {
        if (window.AdSenseAutomationProInstance?.isInitialized) {
            testResults.tests.push({ name: 'Automation Initialized', status: 'PASS' });
            testResults.passed++;
            console.log('✅ Automation is initialized');
        } else {
            testResults.tests.push({ name: 'Automation Initialized', status: 'FAIL' });
            testResults.failed++;
            console.log('❌ Automation not initialized');
        }
    } catch (error) {
        testResults.tests.push({ name: 'Automation Initialized', status: 'ERROR', error: error.message });
        testResults.failed++;
        console.log('❌ Error checking initialization:', error.message);
    }
    
    // Test 3: Check if automation is running
    console.log('\n--- Test 3: Automation Running ---');
    try {
        if (window.AdSenseAutomationProInstance?.isRunning) {
            testResults.tests.push({ name: 'Automation Running', status: 'PASS' });
            testResults.passed++;
            console.log('✅ Automation is running');
        } else {
            testResults.tests.push({ name: 'Automation Running', status: 'FAIL' });
            testResults.failed++;
            console.log('❌ Automation not running');
        }
    } catch (error) {
        testResults.tests.push({ name: 'Automation Running', status: 'ERROR', error: error.message });
        testResults.failed++;
        console.log('❌ Error checking running status:', error.message);
    }
    
    // Test 4: Check required components
    console.log('\n--- Test 4: Required Components ---');
    try {
        const components = [
            'personalityEngine',
            'behaviorSimulator',
            'navigationSimulator',
            'adsenseDetector',
            'readingSimulator',
            'sessionManager',
            'stealthMonitor'
        ];
        
        const missingComponents = components.filter(comp => 
            !window.AdSenseAutomationProInstance?.[comp]
        );
        
        if (missingComponents.length === 0) {
            testResults.tests.push({ name: 'Required Components', status: 'PASS' });
            testResults.passed++;
            console.log('✅ All required components available');
        } else {
            testResults.tests.push({ name: 'Required Components', status: 'FAIL', missing: missingComponents });
            testResults.failed++;
            console.log('❌ Missing components:', missingComponents);
        }
    } catch (error) {
        testResults.tests.push({ name: 'Required Components', status: 'ERROR', error: error.message });
        testResults.failed++;
        console.log('❌ Error checking components:', error.message);
    }
    
    // Test 5: Check automation config
    console.log('\n--- Test 5: Automation Config ---');
    try {
        const config = window.AdSenseAutomationProInstance?.automationConfig;
        if (config && config.enabled) {
            testResults.tests.push({ name: 'Automation Config', status: 'PASS' });
            testResults.passed++;
            console.log('✅ Automation config is valid');
            console.log('  - Enabled:', config.enabled);
            console.log('  - Auto Start:', config.autoStart);
            console.log('  - Personality Type:', config.personalityType);
            console.log('  - Automation Level:', config.automationLevel);
        } else {
            testResults.tests.push({ name: 'Automation Config', status: 'FAIL' });
            testResults.failed++;
            console.log('❌ Automation config invalid or disabled');
        }
    } catch (error) {
        testResults.tests.push({ name: 'Automation Config', status: 'ERROR', error: error.message });
        testResults.failed++;
        console.log('❌ Error checking config:', error.message);
    }
    
    // Test 6: Check session status
    console.log('\n--- Test 6: Session Status ---');
    try {
        const session = window.AdSenseAutomationProInstance?.sessionManager?.currentSession;
        if (session) {
            testResults.tests.push({ name: 'Session Status', status: 'PASS' });
            testResults.passed++;
            console.log('✅ Session is active');
            console.log('  - Session ID:', session.id);
            console.log('  - Start Time:', new Date(session.startTime).toLocaleTimeString());
            console.log('  - Personality:', session.personality?.type);
        } else {
            testResults.tests.push({ name: 'Session Status', status: 'FAIL' });
            testResults.failed++;
            console.log('❌ No active session');
        }
    } catch (error) {
        testResults.tests.push({ name: 'Session Status', status: 'ERROR', error: error.message });
        testResults.failed++;
        console.log('❌ Error checking session:', error.message);
    }
    
    // Test 7: Check reading behavior
    console.log('\n--- Test 7: Reading Behavior ---');
    try {
        const readingSimulator = window.AdSenseAutomationProInstance?.readingSimulator;
        if (readingSimulator) {
            testResults.tests.push({ name: 'Reading Behavior', status: 'PASS' });
            testResults.passed++;
            console.log('✅ Reading simulator available');
        } else {
            testResults.tests.push({ name: 'Reading Behavior', status: 'FAIL' });
            testResults.failed++;
            console.log('❌ Reading simulator not available');
        }
    } catch (error) {
        testResults.tests.push({ name: 'Reading Behavior', status: 'ERROR', error: error.message });
        testResults.failed++;
        console.log('❌ Error checking reading behavior:', error.message);
    }
    
    // Test 8: Check navigation capability
    console.log('\n--- Test 8: Navigation Capability ---');
    try {
        const navigationSimulator = window.AdSenseAutomationProInstance?.navigationSimulator;
        if (navigationSimulator) {
            // Test navigation URLs
            const navigationUrls = navigationSimulator.previewNavigationUrls();
            if (navigationUrls && navigationUrls.length > 0) {
                testResults.tests.push({ name: 'Navigation Capability', status: 'PASS' });
                testResults.passed++;
                console.log('✅ Navigation simulator available with URLs');
                console.log('  - Navigation URLs found:', navigationUrls.length);
            } else {
                testResults.tests.push({ name: 'Navigation Capability', status: 'FAIL' });
                testResults.failed++;
                console.log('❌ Navigation simulator available but no URLs found');
            }
        } else {
            testResults.tests.push({ name: 'Navigation Capability', status: 'FAIL' });
            testResults.failed++;
            console.log('❌ Navigation simulator not available');
        }
    } catch (error) {
        testResults.tests.push({ name: 'Navigation Capability', status: 'ERROR', error: error.message });
        testResults.failed++;
        console.log('❌ Error checking navigation:', error.message);
    }
    
    // Test 9: Check AdSense detection
    console.log('\n--- Test 9: AdSense Detection ---');
    try {
        const adsenseDetector = window.AdSenseAutomationProInstance?.adsenseDetector;
        if (adsenseDetector) {
            const ads = adsenseDetector.detectAdSenseAds();
            testResults.tests.push({ name: 'AdSense Detection', status: 'PASS' });
            testResults.passed++;
            console.log('✅ AdSense detector available');
            console.log('  - Ads detected:', ads.length);
        } else {
            testResults.tests.push({ name: 'AdSense Detection', status: 'FAIL' });
            testResults.failed++;
            console.log('❌ AdSense detector not available');
        }
    } catch (error) {
        testResults.tests.push({ name: 'AdSense Detection', status: 'ERROR', error: error.message });
        testResults.failed++;
        console.log('❌ Error checking AdSense detection:', error.message);
    }
    
    // Test 10: Check automation loop
    console.log('\n--- Test 10: Automation Loop ---');
    try {
        const isRunning = window.AdSenseAutomationProInstance?.isRunning;
        const sessionStartTime = window.AdSenseAutomationProInstance?.sessionStartTime;
        
        if (isRunning && sessionStartTime) {
            const pageTime = Date.now() - sessionStartTime;
            testResults.tests.push({ name: 'Automation Loop', status: 'PASS' });
            testResults.passed++;
            console.log('✅ Automation loop is active');
            console.log('  - Page time:', (pageTime / 1000).toFixed(0) + 's');
            console.log('  - Reading completed:', window.AdSenseAutomationProInstance.readingCompleted);
        } else {
            testResults.tests.push({ name: 'Automation Loop', status: 'FAIL' });
            testResults.failed++;
            console.log('❌ Automation loop not active');
        }
    } catch (error) {
        testResults.tests.push({ name: 'Automation Loop', status: 'ERROR', error: error.message });
        testResults.failed++;
        console.log('❌ Error checking automation loop:', error.message);
    }
    
    // Calculate overall result
    testResults.overall = testResults.failed === 0;
    
    // Display Results
    console.log('\n--- Test Results Summary ---');
    console.log(`Total Tests: ${testResults.tests.length}`);
    console.log(`Passed: ${testResults.passed}`);
    console.log(`Failed: ${testResults.failed}`);
    console.log(`Overall: ${testResults.overall ? 'PASS' : 'FAIL'}`);
    
    console.log('\n--- Detailed Results ---');
    testResults.tests.forEach((test, index) => {
        const status = test.status === 'PASS' ? '✅' : test.status === 'FAIL' ? '❌' : '⚠️';
        console.log(`${index + 1}. ${status} ${test.name}: ${test.status}`);
        if (test.error) {
            console.log(`   Error: ${test.error}`);
        }
        if (test.missing) {
            console.log(`   Missing: ${test.missing.join(', ')}`);
        }
    });
    
    // Recommendations
    console.log('\n--- Recommendations ---');
    if (testResults.overall) {
        console.log('✅ All tests passed - automation is working correctly');
        console.log('✅ Automation should be running and functional');
        console.log('✅ Monitor console for automation logs');
    } else {
        console.log('⚠️ Some tests failed - automation needs attention');
        console.log('⚠️ Check failed tests above for specific issues');
        console.log('⚠️ Consider running fix-automation-start.js');
        
        // Specific recommendations based on failed tests
        const failedTests = testResults.tests.filter(test => test.status === 'FAIL');
        failedTests.forEach(test => {
            switch (test.name) {
                case 'Automation Instance Exists':
                    console.log('  - Run initializeAutomation() to create instance');
                    break;
                case 'Automation Initialized':
                    console.log('  - Check class loading issues');
                    break;
                case 'Automation Running':
                    console.log('  - Run startAutomation() to start automation');
                    break;
                case 'Required Components':
                    console.log('  - Check component initialization');
                    break;
                case 'Automation Config':
                    console.log('  - Check automation configuration');
                    break;
                case 'Session Status':
                    console.log('  - Check session manager initialization');
                    break;
                case 'Reading Behavior':
                    console.log('  - Check reading simulator initialization');
                    break;
                case 'Navigation Capability':
                    console.log('  - Check navigation simulator initialization');
                    break;
                case 'AdSense Detection':
                    console.log('  - Check AdSense detector initialization');
                    break;
                case 'Automation Loop':
                    console.log('  - Check automation loop status');
                    break;
            }
        });
    }
    
    return testResults;
}

// Auto-run test
testAutomationStart();
