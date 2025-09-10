/**
 * Simple test to verify class availability
 * Run this in browser console on any page where the extension is loaded
 */

console.log('🧪 Testing class availability...');

// Test if classes are available
const classes = [
    'AnalyticsMonitor',
    'DynamicAdaptationEngine', 
    'EnhancedFraudPrevention'
];

classes.forEach(className => {
    if (typeof window[className] !== 'undefined') {
        console.log(`✅ ${className} - Available`);
        
        // Test instantiation
        try {
            const instance = new window[className]();
            console.log(`✅ ${className} - Can be instantiated`);
            
            // Test initialization
            if (typeof instance.initialize === 'function') {
                instance.initialize();
                console.log(`✅ ${className} - Can be initialized`);
            }
        } catch (error) {
            console.error(`❌ ${className} - Instantiation failed:`, error);
        }
    } else {
        console.log(`❌ ${className} - Missing`);
    }
});

// Test AdSenseAutomationPro
if (typeof window.AdSenseAutomationPro !== 'undefined') {
    console.log('✅ AdSenseAutomationPro - Available');
} else {
    console.log('❌ AdSenseAutomationPro - Missing');
}

// Test instance
if (typeof window.AdSenseAutomationProInstance !== 'undefined') {
    console.log('✅ AdSenseAutomationProInstance - Available');
} else {
    console.log('❌ AdSenseAutomationProInstance - Missing');
}

console.log('🧪 Test completed');
