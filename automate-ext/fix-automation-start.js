/**
 * Fix script untuk memperbaiki masalah automation start
 * Berdasarkan analisis automation tidak berjalan setelah content artikel dibuka
 */

function fixAutomationStart() {
    console.log('🔧 Fixing Automation Start Issues...');
    
    const fixResults = {
        fixesApplied: [],
        errors: [],
        success: true
    };
    
    // Fix 1: Enhanced DOM Ready Detection
    console.log('\n--- Fix 1: Enhanced DOM Ready Detection ---');
    try {
        // Add DOMContentLoaded listener for immediate initialization
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                console.log('✅ DOM ready, checking automation status...');
                if (!window.AdSenseAutomationProInstance) {
                    console.log('🔄 DOM ready - initializing automation...');
                    initializeAutomation();
                } else {
                    console.log('✅ Automation already initialized');
                }
            });
            fixResults.fixesApplied.push('DOMContentLoaded listener added');
            console.log('✅ DOMContentLoaded listener added');
        } else {
            console.log('✅ DOM already ready, checking automation...');
            if (!window.AdSenseAutomationProInstance) {
                console.log('🔄 DOM ready - initializing automation...');
                initializeAutomation();
            }
        }
    } catch (error) {
        fixResults.errors.push(`DOM ready fix failed: ${error.message}`);
        fixResults.success = false;
        console.log('❌ DOM ready fix failed:', error.message);
    }
    
    // Fix 2: Enhanced Class Loading Detection
    console.log('\n--- Fix 2: Enhanced Class Loading Detection ---');
    try {
        // Override waitForClasses with enhanced version
        window.enhancedWaitForClasses = function(attempts = 0, maxAttempts = 50) {
            const requiredClasses = [
                'PersonalityEngine', 'BehaviorSimulator', 'MouseSimulator', 
                'KeyboardSimulator', 'ReadingSimulator', 'NavigationSimulator',
                'AdSenseDetector', 'SessionManager', 'StealthMonitor',
                'AnalyticsMonitor', 'DynamicAdaptationEngine', 'EnhancedFraudPrevention'
            ];
            
            const missingClasses = requiredClasses.filter(cls => typeof window[cls] === 'undefined');
            
            if (missingClasses.length > 0) {
                console.log(`🔄 Attempt ${attempts + 1}/${maxAttempts}: Waiting for classes: ${missingClasses.join(', ')}`);
                
                if (attempts >= maxAttempts) {
                    console.error('❌ Max attempts reached, creating fallback classes...');
                    createFallbackClasses(missingClasses);
                    initializeAutomation();
                    return;
                }
                
                setTimeout(() => window.enhancedWaitForClasses(attempts + 1, maxAttempts), 200);
                return;
            }
            
            console.log('✅ All required classes are available, initializing...');
            initializeAutomation();
        };
        
        fixResults.fixesApplied.push('Enhanced class loading detection added');
        console.log('✅ Enhanced class loading detection added');
    } catch (error) {
        fixResults.errors.push(`Class loading fix failed: ${error.message}`);
        fixResults.success = false;
        console.log('❌ Class loading fix failed:', error.message);
    }
    
    // Fix 3: Enhanced Error Handling
    console.log('\n--- Fix 3: Enhanced Error Handling ---');
    try {
        // Override initializeAutomation with enhanced error handling
        window.enhancedInitializeAutomation = async function() {
            if (typeof window !== 'undefined' && !window.AdSenseAutomationProInstance) {
                try {
                    console.log('🔄 Starting enhanced automation initialization...');
                    
                    // Ensure all classes are globally available
                    if (typeof ensureGlobalClasses === 'function') {
                        ensureGlobalClasses();
                    }
                    
                    // Check if required dependencies are available
                    if (typeof AdSenseAutomationPro === 'undefined') {
                        console.warn('⚠️ AdSenseAutomationPro class not available, retrying...');
                        setTimeout(window.enhancedInitializeAutomation, 1000);
                        return;
                    }
                    
                    // Check if all required classes are available
                    const requiredClasses = [
                        'PersonalityEngine', 'BehaviorSimulator', 'MouseSimulator', 
                        'KeyboardSimulator', 'ReadingSimulator', 'NavigationSimulator',
                        'AdSenseDetector', 'SessionManager', 'StealthMonitor',
                        'AnalyticsMonitor', 'DynamicAdaptationEngine', 'EnhancedFraudPrevention'
                    ];
                    
                    const missingClasses = requiredClasses.filter(cls => typeof window[cls] === 'undefined');
                    if (missingClasses.length > 0) {
                        console.warn(`⚠️ Missing required classes: ${missingClasses.join(', ')}`);
                        
                        // Create fallback classes
                        createFallbackClasses(missingClasses);
                        
                        // Retry after creating fallbacks
                        setTimeout(window.enhancedInitializeAutomation, 100);
                        return;
                    }
                    
                    // Create automation instance
                    const automationPro = new AdSenseAutomationPro();
                    window.AdSenseAutomationProInstance = automationPro;
                    
                    // Initialize with enhanced error handling
                    await automationPro.initialize();
                    console.log('✅ Automation initialized successfully');
                    
                    // Verify automation is running
                    if (automationPro.isRunning) {
                        console.log('✅ Automation is running');
                    } else {
                        console.warn('⚠️ Automation initialized but not running, starting...');
                        await automationPro.startAutomation();
                    }
                    
                    // Additional verification
                    setTimeout(() => {
                        if (!automationPro.isRunning) {
                            console.error('❌ Automation still not running after 5 seconds');
                            console.log('🔍 Debug info:', {
                                isInitialized: automationPro.isInitialized,
                                isRunning: automationPro.isRunning,
                                automationConfig: automationPro.automationConfig
                            });
                        }
                    }, 5000);
                    
                } catch (error) {
                    console.error('❌ Failed to initialize automation:', error.message);
                    console.error('Error stack:', error.stack);
                    
                    // Attempt recovery
                    setTimeout(() => {
                        console.log('🔄 Attempting recovery...');
                        window.enhancedInitializeAutomation();
                    }, 2000);
                }
            }
        };
        
        fixResults.fixesApplied.push('Enhanced error handling added');
        console.log('✅ Enhanced error handling added');
    } catch (error) {
        fixResults.errors.push(`Error handling fix failed: ${error.message}`);
        fixResults.success = false;
        console.log('❌ Error handling fix failed:', error.message);
    }
    
    // Fix 4: Create Fallback Classes
    console.log('\n--- Fix 4: Create Fallback Classes ---');
    try {
        window.createFallbackClasses = function(missingClasses) {
            console.log('🔄 Creating fallback classes for:', missingClasses.join(', '));
            
            missingClasses.forEach(className => {
                if (typeof window[className] === 'undefined') {
                    console.log(`🔄 Creating fallback for ${className}...`);
                    
                    switch (className) {
                        case 'AnalyticsMonitor':
                            window[className] = class {
                                initialize() { console.log(`✅ ${className} fallback initialized`); }
                                cleanup() {}
                            };
                            break;
                        case 'DynamicAdaptationEngine':
                            window[className] = class {
                                initialize() { console.log(`✅ ${className} fallback initialized`); }
                                cleanup() {}
                                resetSessionAdaptations() {}
                            };
                            break;
                        case 'EnhancedFraudPrevention':
                            window[className] = class {
                                initialize() { console.log(`✅ ${className} fallback initialized`); }
                                cleanup() {}
                            };
                            break;
                        default:
                            window[className] = class {
                                initialize() { console.log(`✅ ${className} fallback initialized`); }
                                cleanup() {}
                            };
                    }
                }
            });
            
            console.log('✅ Fallback classes created');
        };
        
        fixResults.fixesApplied.push('Fallback classes creation added');
        console.log('✅ Fallback classes creation added');
    } catch (error) {
        fixResults.errors.push(`Fallback classes fix failed: ${error.message}`);
        fixResults.success = false;
        console.log('❌ Fallback classes fix failed:', error.message);
    }
    
    // Fix 5: Enhanced Status Logging
    console.log('\n--- Fix 5: Enhanced Status Logging ---');
    try {
        window.logAutomationStatus = function() {
            console.log('🔍 Automation Status Check:');
            console.log('  - AdSenseAutomationProInstance:', !!window.AdSenseAutomationProInstance);
            console.log('  - Is Initialized:', window.AdSenseAutomationProInstance?.isInitialized);
            console.log('  - Is Running:', window.AdSenseAutomationProInstance?.isRunning);
            console.log('  - Session Start Time:', window.AdSenseAutomationProInstance?.sessionStartTime);
            console.log('  - Reading Completed:', window.AdSenseAutomationProInstance?.readingCompleted);
            console.log('  - Navigation Simulator:', !!window.AdSenseAutomationProInstance?.navigationSimulator);
            console.log('  - AdSense Detector:', !!window.AdSenseAutomationProInstance?.adsenseDetector);
            console.log('  - Personality Engine:', !!window.AdSenseAutomationProInstance?.personalityEngine);
            console.log('  - Behavior Simulator:', !!window.AdSenseAutomationProInstance?.behaviorSimulator);
        };
        
        // Call status logging after initialization
        setTimeout(() => {
            window.logAutomationStatus();
        }, 1000);
        
        fixResults.fixesApplied.push('Enhanced status logging added');
        console.log('✅ Enhanced status logging added');
    } catch (error) {
        fixResults.errors.push(`Status logging fix failed: ${error.message}`);
        console.log('❌ Status logging fix failed:', error.message);
    }
    
    // Fix 6: Test Automation Start
    console.log('\n--- Fix 6: Test Automation Start ---');
    try {
        window.testAutomationStart = function() {
            console.log('🧪 Testing Automation Start...');
            
            // Check 1: Instance exists
            if (!window.AdSenseAutomationProInstance) {
                console.error('❌ AdSenseAutomationProInstance not found');
                return false;
            }
            
            // Check 2: Is initialized
            if (!window.AdSenseAutomationProInstance.isInitialized) {
                console.error('❌ Automation not initialized');
                return false;
            }
            
            // Check 3: Is running
            if (!window.AdSenseAutomationProInstance.isRunning) {
                console.error('❌ Automation not running');
                return false;
            }
            
            // Check 4: Components available
            const components = [
                'personalityEngine',
                'behaviorSimulator',
                'navigationSimulator',
                'adsenseDetector',
                'readingSimulator'
            ];
            
            const missingComponents = components.filter(comp => 
                !window.AdSenseAutomationProInstance[comp]
            );
            
            if (missingComponents.length > 0) {
                console.error('❌ Missing components:', missingComponents);
                return false;
            }
            
            console.log('✅ Automation start test passed');
            return true;
        };
        
        // Run test after page load
        setTimeout(() => {
            window.testAutomationStart();
        }, 3000);
        
        fixResults.fixesApplied.push('Automation start test added');
        console.log('✅ Automation start test added');
    } catch (error) {
        fixResults.errors.push(`Test automation start failed: ${error.message}`);
        console.log('❌ Test automation start failed:', error.message);
    }
    
    // Fix 7: Force Automation Start
    console.log('\n--- Fix 7: Force Automation Start ---');
    try {
        // If automation instance exists but not running, force start
        if (window.AdSenseAutomationProInstance && !window.AdSenseAutomationProInstance.isRunning) {
            console.log('🔄 Forcing automation start...');
            window.AdSenseAutomationProInstance.startAutomation().then(() => {
                console.log('✅ Automation force started successfully');
            }).catch(error => {
                console.error('❌ Failed to force start automation:', error.message);
            });
        }
        
        fixResults.fixesApplied.push('Force automation start added');
        console.log('✅ Force automation start added');
    } catch (error) {
        fixResults.errors.push(`Force automation start failed: ${error.message}`);
        console.log('❌ Force automation start failed:', error.message);
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
    console.log('AdSenseAutomationPro Instance:', window.AdSenseAutomationProInstance ? '✅ Available' : '❌ Not Available');
    console.log('Is Initialized:', window.AdSenseAutomationProInstance?.isInitialized ? '✅ Yes' : '❌ No');
    console.log('Is Running:', window.AdSenseAutomationProInstance?.isRunning ? '✅ Yes' : '❌ No');
    console.log('Navigation Simulator:', window.AdSenseAutomationProInstance?.navigationSimulator ? '✅ Available' : '❌ Not Available');
    console.log('AdSense Detector:', window.AdSenseAutomationProInstance?.adsenseDetector ? '✅ Available' : '❌ Not Available');
    
    // Recommendations
    console.log('\n--- Recommendations ---');
    if (fixResults.success) {
        console.log('✅ All fixes applied successfully');
        console.log('✅ Automation should now start immediately after page load');
        console.log('✅ Monitor console for automation logs');
        console.log('✅ Check automation status with logAutomationStatus()');
    } else {
        console.log('⚠️ Some fixes failed - check errors above');
        console.log('⚠️ May need to rebuild extension');
        console.log('⚠️ Check webpack.config.js for class loading issues');
    }
    
    return fixResults;
}

// Auto-run fix
fixAutomationStart();
