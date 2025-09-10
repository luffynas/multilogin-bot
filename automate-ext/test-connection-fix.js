/**
 * Test script to verify connection issue fixes
 * Run this in browser console to test connection handling
 */

function testConnectionFix() {
    console.log('🧪 Testing connection issue fixes...');
    
    // Test 1: Check if automation instance exists
    if (window.AdSenseAutomationProInstance) {
        const automation = window.AdSenseAutomationProInstance;
        console.log('✅ AdSenseAutomationProInstance found');
        
        // Test 2: Test connection availability check
        console.log('🔌 Testing connection availability check:');
        try {
            const isAvailable = automation.isExtensionConnectionAvailable();
            console.log(`  Connection available: ${isAvailable}`);
        } catch (error) {
            console.log('❌ Error testing connection availability:', error);
        }
        
        // Test 3: Test extension context validation
        console.log('🔍 Testing extension context validation:');
        try {
            const isValid = automation.isExtensionContextValid();
            console.log(`  Extension context valid: ${isValid}`);
        } catch (error) {
            console.log('❌ Error testing extension context:', error);
        }
        
        // Test 4: Test sendMessage with error handling
        console.log('📤 Testing sendMessage with error handling:');
        try {
            // This should not cause errors even if connection is lost
            automation.sendMessage('test', { message: 'test connection' });
            console.log('✅ sendMessage executed without errors');
        } catch (error) {
            console.log('❌ Error in sendMessage:', error);
        }
        
        // Test 5: Test automation status
        console.log('📊 Testing automation status:');
        try {
            const status = automation.getStatus();
            console.log('  Automation status:', {
                isInitialized: status.isInitialized,
                isRunning: status.isRunning
            });
        } catch (error) {
            console.log('❌ Error getting automation status:', error);
        }
        
    } else {
        console.log('❌ AdSenseAutomationProInstance not found');
        console.log('Make sure the extension is loaded and automation is initialized');
    }
    
    // Test 6: Test chrome.runtime availability
    console.log('🌐 Testing chrome.runtime availability:');
    try {
        if (typeof chrome !== 'undefined' && chrome.runtime) {
            console.log('✅ chrome.runtime is available');
            console.log(`  Extension ID: ${chrome.runtime.id}`);
            
            // Test sendMessage directly
            chrome.runtime.sendMessage({ action: 'test', data: 'test' }, (response) => {
                if (chrome.runtime.lastError) {
                    console.log('⚠️ Direct chrome.runtime.sendMessage error:', chrome.runtime.lastError.message);
                } else {
                    console.log('✅ Direct chrome.runtime.sendMessage successful');
                }
            });
        } else {
            console.log('❌ chrome.runtime is not available');
        }
    } catch (error) {
        console.log('❌ Error testing chrome.runtime:', error);
    }
    
    // Test 7: Test connection error simulation
    console.log('🧪 Testing connection error simulation:');
    try {
        // Simulate connection loss by temporarily disabling chrome.runtime
        const originalChrome = window.chrome;
        window.chrome = undefined;
        
        if (window.AdSenseAutomationProInstance) {
            const automation = window.AdSenseAutomationProInstance;
            const isAvailable = automation.isExtensionConnectionAvailable();
            console.log(`  Connection available after simulation: ${isAvailable}`);
            
            // Test sendMessage with simulated connection loss
            automation.sendMessage('test', { message: 'test with no connection' });
            console.log('✅ sendMessage handled connection loss gracefully');
        }
        
        // Restore chrome
        window.chrome = originalChrome;
        console.log('✅ Chrome runtime restored');
        
    } catch (error) {
        console.log('❌ Error in connection simulation:', error);
    }
    
    // Test 8: Test automation loop connection checks
    console.log('🔄 Testing automation loop connection checks:');
    if (window.AdSenseAutomationProInstance) {
        const automation = window.AdSenseAutomationProInstance;
        
        // Test if automation loop would handle connection loss
        try {
            const isRunning = automation.isRunning;
            const isInitialized = automation.isInitialized;
            
            console.log(`  Automation running: ${isRunning}`);
            console.log(`  Automation initialized: ${isInitialized}`);
            
            if (isRunning) {
                console.log('⚠️ Automation is running - connection checks are active');
            } else {
                console.log('ℹ️ Automation is not running - connection checks are inactive');
            }
        } catch (error) {
            console.log('❌ Error testing automation loop:', error);
        }
    }
    
    // Test 9: Test error message patterns
    console.log('🔍 Testing error message pattern recognition:');
    const testErrorMessages = [
        'Could not establish connection. Receiving end does not exist.',
        'Extension context invalidated.',
        'The message port closed before a response was received.',
        'Could not establish connection',
        'Receiving end does not exist'
    ];
    
    testErrorMessages.forEach((errorMsg, index) => {
        const isConnectionError = errorMsg.includes('Could not establish connection') || 
                                 errorMsg.includes('Receiving end does not exist') ||
                                 errorMsg.includes('Extension context invalidated') ||
                                 errorMsg.includes('The message port closed');
        
        console.log(`  ${index + 1}. "${errorMsg}" - Connection error: ${isConnectionError}`);
    });
    
    // Test 10: Test timeout handling
    console.log('⏱️ Testing timeout handling:');
    try {
        // Test if timeout mechanism would work
        const testTimeout = setTimeout(() => {
            console.log('✅ Timeout mechanism works');
        }, 100);
        
        setTimeout(() => {
            clearTimeout(testTimeout);
            console.log('✅ Timeout cleared successfully');
        }, 50);
        
    } catch (error) {
        console.log('❌ Error testing timeout:', error);
    }
    
    console.log('🧪 Connection fix test completed');
    console.log('💡 Key improvements:');
    console.log('  - Enhanced connection availability checking');
    console.log('  - Better error message pattern recognition');
    console.log('  - Timeout handling for message sending');
    console.log('  - Graceful handling of connection loss');
    console.log('  - Automation loop connection monitoring');
}

// Auto-run test
if (typeof window !== 'undefined') {
    console.log('🚀 Running connection fix test...');
    testConnectionFix();
} else {
    console.log('This test should be run in a browser environment');
}
