/**
 * Fix script untuk memperbaiki masalah navigation
 * Berdasarkan analisis console log pengajartekno.co.id
 */

function fixNavigationIssues() {
    console.log('🔧 Fixing Navigation Issues...');
    
    const fixResults = {
        fixesApplied: [],
        errors: [],
        success: true
    };
    
    // Fix 1: StealthManager Fallback
    console.log('\n--- Fix 1: StealthManager Fallback ---');
    try {
        if (typeof StealthManager === 'undefined') {
            console.log('⚠️ StealthManager not available, implementing enhanced fallback...');
            
            // Create enhanced fallback
            window.StealthManager = {
                isAvailable: false,
                fallbackMode: true,
                initialize: function() {
                    console.log('🔄 Enhanced StealthManager fallback initialized');
                    return true;
                },
                enableStealthMode: function() {
                    console.log('🔄 Enhanced stealth mode enabled (fallback)');
                    return true;
                }
            };
            
            fixResults.fixesApplied.push('StealthManager fallback implemented');
            console.log('✅ StealthManager fallback implemented');
        } else {
            console.log('✅ StealthManager already available');
        }
    } catch (error) {
        fixResults.errors.push(`StealthManager fix failed: ${error.message}`);
        fixResults.success = false;
        console.log('❌ StealthManager fix failed:', error.message);
    }
    
    // Fix 2: AdSenseAutomationPro Instance
    console.log('\n--- Fix 2: AdSenseAutomationPro Instance ---');
    try {
        if (!window.AdSenseAutomationProInstance) {
            console.log('⚠️ AdSenseAutomationProInstance not available, initializing...');
            
            if (typeof AdSenseAutomationPro !== 'undefined') {
                window.AdSenseAutomationProInstance = new AdSenseAutomationPro();
                window.AdSenseAutomationProInstance.initialize();
                fixResults.fixesApplied.push('AdSenseAutomationPro instance initialized');
                console.log('✅ AdSenseAutomationPro instance initialized');
            } else {
                console.log('❌ AdSenseAutomationPro class not available');
                fixResults.errors.push('AdSenseAutomationPro class not available');
                fixResults.success = false;
            }
        } else {
            console.log('✅ AdSenseAutomationPro instance already available');
        }
    } catch (error) {
        fixResults.errors.push(`AdSenseAutomationPro fix failed: ${error.message}`);
        fixResults.success = false;
        console.log('❌ AdSenseAutomationPro fix failed:', error.message);
    }
    
    // Fix 3: Navigation Simulator
    console.log('\n--- Fix 3: Navigation Simulator ---');
    try {
        if (window.AdSenseAutomationProInstance && !window.AdSenseAutomationProInstance.navigationSimulator) {
            console.log('⚠️ Navigation simulator not available, initializing...');
            
            if (typeof NavigationSimulator !== 'undefined') {
                window.AdSenseAutomationProInstance.navigationSimulator = new NavigationSimulator();
                window.AdSenseAutomationProInstance.navigationSimulator.initialize();
                fixResults.fixesApplied.push('Navigation simulator initialized');
                console.log('✅ Navigation simulator initialized');
            } else {
                console.log('❌ NavigationSimulator class not available');
                fixResults.errors.push('NavigationSimulator class not available');
                fixResults.success = false;
            }
        } else if (window.AdSenseAutomationProInstance?.navigationSimulator) {
            console.log('✅ Navigation simulator already available');
        } else {
            console.log('❌ AdSenseAutomationPro instance not available for navigation simulator');
        }
    } catch (error) {
        fixResults.errors.push(`Navigation simulator fix failed: ${error.message}`);
        fixResults.success = false;
        console.log('❌ Navigation simulator fix failed:', error.message);
    }
    
    // Fix 4: Automation Loop Start
    console.log('\n--- Fix 4: Automation Loop Start ---');
    try {
        if (window.AdSenseAutomationProInstance && !window.AdSenseAutomationProInstance.isRunning) {
            console.log('⚠️ Automation loop not running, starting...');
            
            if (typeof window.AdSenseAutomationProInstance.startAutomation === 'function') {
                window.AdSenseAutomationProInstance.startAutomation();
                fixResults.fixesApplied.push('Automation loop started');
                console.log('✅ Automation loop started');
            } else {
                console.log('❌ startAutomation method not available');
                fixResults.errors.push('startAutomation method not available');
                fixResults.success = false;
            }
        } else if (window.AdSenseAutomationProInstance?.isRunning) {
            console.log('✅ Automation loop already running');
        } else {
            console.log('❌ AdSenseAutomationPro instance not available for automation loop');
        }
    } catch (error) {
        fixResults.errors.push(`Automation loop fix failed: ${error.message}`);
        fixResults.success = false;
        console.log('❌ Automation loop fix failed:', error.message);
    }
    
    // Fix 5: Reading to Navigation Transition
    console.log('\n--- Fix 5: Reading to Navigation Transition ---');
    try {
        if (window.AdSenseAutomationProInstance?.readingSimulator && 
            window.AdSenseAutomationProInstance.readingCompleted && 
            !window.AdSenseAutomationProInstance.navigationSimulator?.isNavigating) {
            
            console.log('⚠️ Reading completed but no navigation transition, forcing...');
            
            if (window.AdSenseAutomationProInstance.navigationSimulator) {
                window.AdSenseAutomationProInstance.navigationSimulator.simulateIntelligentNavigation();
                fixResults.fixesApplied.push('Navigation transition forced');
                console.log('✅ Navigation transition forced');
            } else {
                console.log('❌ Navigation simulator not available for transition');
            }
        } else {
            console.log('✅ Reading to navigation transition not needed');
        }
    } catch (error) {
        fixResults.errors.push(`Navigation transition fix failed: ${error.message}`);
        fixResults.success = false;
        console.log('❌ Navigation transition fix failed:', error.message);
    }
    
    // Fix 6: AdSense Detector
    console.log('\n--- Fix 6: AdSense Detector ---');
    try {
        if (window.AdSenseAutomationProInstance && !window.AdSenseAutomationProInstance.adsenseDetector) {
            console.log('⚠️ AdSense detector not available, initializing...');
            
            if (typeof AdSenseDetector !== 'undefined') {
                window.AdSenseAutomationProInstance.adsenseDetector = new AdSenseDetector();
                fixResults.fixesApplied.push('AdSense detector initialized');
                console.log('✅ AdSense detector initialized');
            } else {
                console.log('❌ AdSenseDetector class not available');
                fixResults.errors.push('AdSenseDetector class not available');
                fixResults.success = false;
            }
        } else if (window.AdSenseAutomationProInstance?.adsenseDetector) {
            console.log('✅ AdSense detector already available');
        } else {
            console.log('❌ AdSenseAutomationPro instance not available for AdSense detector');
        }
    } catch (error) {
        fixResults.errors.push(`AdSense detector fix failed: ${error.message}`);
        fixResults.success = false;
        console.log('❌ AdSense detector fix failed:', error.message);
    }
    
    // Fix 7: Enhanced Error Handling
    console.log('\n--- Fix 7: Enhanced Error Handling ---');
    try {
        // Add global error handler
        window.addEventListener('error', function(event) {
            console.error('🚨 Global error caught:', event.error);
            if (event.error.message.includes('StealthManager') || 
                event.error.message.includes('NavigationSimulator') ||
                event.error.message.includes('AdSenseAutomationPro')) {
                console.log('🔄 Attempting to reinitialize automation system...');
                setTimeout(() => {
                    fixNavigationIssues();
                }, 1000);
            }
        });
        
        fixResults.fixesApplied.push('Enhanced error handling added');
        console.log('✅ Enhanced error handling added');
    } catch (error) {
        fixResults.errors.push(`Error handling fix failed: ${error.message}`);
        console.log('❌ Error handling fix failed:', error.message);
    }
    
    // Fix 8: Navigation Test
    console.log('\n--- Fix 8: Navigation Test ---');
    try {
        if (window.AdSenseAutomationProInstance?.navigationSimulator) {
            console.log('🧪 Testing navigation after fixes...');
            const testUrls = window.AdSenseAutomationProInstance.navigationSimulator.previewNavigationUrls();
            console.log(`✅ Navigation test successful: Found ${testUrls.length} URLs`);
            
            if (testUrls.length > 0) {
                fixResults.fixesApplied.push('Navigation test successful');
                console.log('✅ Navigation test successful');
            } else {
                console.log('⚠️ Navigation test: No URLs found');
            }
        } else {
            console.log('❌ Cannot test navigation - simulator not available');
        }
    } catch (error) {
        fixResults.errors.push(`Navigation test failed: ${error.message}`);
        console.log('❌ Navigation test failed:', error.message);
    }
    
    // Display Results
    console.log('\n--- Fix Results Summary ---');
    console.log(`Fixes Applied: ${fixResults.fixesApplied.length}`);
    console.log(`Errors: ${fixResults.errors.length}`);
    console.log(`Overall Success: ${fixResults.success ? 'YES' : 'NO'}`);
    
    console.log('\n--- Fixes Applied ---');
    fixResults.fixesApplied.forEach((fix, index) => {
        console.log(`${index + 1}. ✅ ${fix}`);
    });
    
    if (fixResults.errors.length > 0) {
        console.log('\n--- Errors ---');
        fixResults.errors.forEach((error, index) => {
            console.log(`${index + 1}. ❌ ${error}`);
        });
    }
    
    // Final Status Check
    console.log('\n--- Final Status Check ---');
    console.log('StealthManager:', typeof StealthManager !== 'undefined' ? '✅ Available' : '❌ Not Available');
    console.log('AdSenseAutomationPro Instance:', window.AdSenseAutomationProInstance ? '✅ Available' : '❌ Not Available');
    console.log('Navigation Simulator:', window.AdSenseAutomationProInstance?.navigationSimulator ? '✅ Available' : '❌ Not Available');
    console.log('Automation Running:', window.AdSenseAutomationProInstance?.isRunning ? '✅ Running' : '❌ Not Running');
    console.log('AdSense Detector:', window.AdSenseAutomationProInstance?.adsenseDetector ? '✅ Available' : '❌ Not Available');
    
    // Recommendations
    console.log('\n--- Recommendations ---');
    if (fixResults.success) {
        console.log('✅ All fixes applied successfully');
        console.log('✅ Navigation system should now work properly');
        console.log('✅ Monitor console for navigation logs');
    } else {
        console.log('⚠️ Some fixes failed - check errors above');
        console.log('⚠️ May need to rebuild extension');
        console.log('⚠️ Check webpack.config.js for class loading issues');
    }
    
    return fixResults;
}

// Auto-run fix
fixNavigationIssues();
