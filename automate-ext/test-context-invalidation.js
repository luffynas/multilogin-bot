/**
 * Test script to verify extension context invalidation handling
 * Run this in browser console to test context validation
 */

function testContextInvalidation() {
    console.log('🧪 Testing extension context invalidation handling...');
    
    // Test 1: Check if extension context is valid
    function isExtensionContextValid() {
        try {
            if (!chrome || !chrome.runtime) {
                return false;
            }
            
            if (!chrome.runtime.sendMessage) {
                return false;
            }
            
            if (chrome.runtime.lastError) {
                return false;
            }
            
            try {
                chrome.runtime.id;
                return true;
            } catch (error) {
                return false;
            }
        } catch (error) {
            return false;
        }
    }
    
    console.log('✅ Extension context valid:', isExtensionContextValid());
    
    // Test 2: Test sendMessage with error handling
    function testSendMessage() {
        try {
            if (!isExtensionContextValid()) {
                console.log('⚠️ Extension context invalid, skipping message test');
                return;
            }
            
            chrome.runtime.sendMessage({ action: 'test', data: 'test' }, (response) => {
                if (chrome.runtime.lastError) {
                    console.log('⚠️ Message send failed:', chrome.runtime.lastError.message);
                } else {
                    console.log('✅ Message sent successfully');
                }
            });
        } catch (error) {
            if (error.message && error.message.includes('Extension context invalidated')) {
                console.log('⚠️ Extension context invalidated detected');
            } else {
                console.log('❌ Unexpected error:', error);
            }
        }
    }
    
    testSendMessage();
    
    // Test 3: Check automation instance
    if (window.AdSenseAutomationProInstance) {
        console.log('✅ AdSenseAutomationProInstance exists');
        
        // Test context validation method
        if (typeof window.AdSenseAutomationProInstance.isExtensionContextValid === 'function') {
            const isValid = window.AdSenseAutomationProInstance.isExtensionContextValid();
            console.log('✅ Context validation method works:', isValid);
        } else {
            console.log('❌ Context validation method not found');
        }
        
        // Test automation status
        const status = window.AdSenseAutomationProInstance.getStatus();
        console.log('✅ Automation status:', {
            isInitialized: status.isInitialized,
            isRunning: status.isRunning
        });
        
    } else {
        console.log('❌ AdSenseAutomationProInstance not found');
    }
    
    // Test 4: Simulate context invalidation
    function simulateContextInvalidation() {
        console.log('🧪 Simulating context invalidation...');
        
        if (window.AdSenseAutomationProInstance) {
            try {
                window.AdSenseAutomationProInstance.handleContextInvalidation();
                console.log('✅ Context invalidation handled gracefully');
            } catch (error) {
                console.log('❌ Error handling context invalidation:', error);
            }
        } else {
            console.log('⚠️ No automation instance to test');
        }
    }
    
    // Only run simulation if user confirms
    console.log('To simulate context invalidation, run: simulateContextInvalidation()');
    
    console.log('🧪 Context invalidation test completed');
}

// Auto-run test
if (typeof window !== 'undefined') {
    console.log('🚀 Running context invalidation test...');
    testContextInvalidation();
} else {
    console.log('This test should be run in a browser environment');
}
