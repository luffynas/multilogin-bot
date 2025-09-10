/**
 * Test script to verify navigation highlight feature
 * Run this in browser console to test highlight functionality
 */

function testHighlightFeature() {
    console.log('🧪 Testing navigation highlight feature...');
    
    // Test 1: Check if navigation simulator exists
    if (window.AdSenseAutomationProInstance && window.AdSenseAutomationProInstance.navigationSimulator) {
        const navSim = window.AdSenseAutomationProInstance.navigationSimulator;
        console.log('✅ Navigation simulator found');
        
        // Test 2: Test highlight configuration
        console.log('🔧 Testing highlight configuration:');
        console.log(`  Current highlight setting: ${navSim.isHighlightEnabled()}`);
        
        // Test 3: Enable highlight feature
        console.log('🎯 Enabling highlight feature...');
        navSim.setHighlightNavigation(true);
        console.log(`  Highlight enabled: ${navSim.isHighlightEnabled()}`);
        
        // Test 4: Test highlight styles initialization
        const styleElement = document.getElementById('navigation-highlight-styles');
        if (styleElement) {
            console.log('✅ Highlight styles initialized');
        } else {
            console.log('❌ Highlight styles not found');
        }
        
        // Test 5: Test preview navigation URLs
        console.log('🔍 Testing preview navigation URLs...');
        try {
            const urls = navSim.previewNavigationUrls();
            if (urls && urls.length > 0) {
                console.log(`✅ Preview found ${urls.length} navigation URLs`);
            } else {
                console.log('⚪ No navigation URLs found');
            }
        } catch (error) {
            console.log('❌ Error testing preview:', error);
        }
        
        // Test 6: Test individual highlight functions
        console.log('🎨 Testing individual highlight functions:');
        
        // Find a test element
        const testLink = document.querySelector('a[href]');
        if (testLink) {
            console.log('✅ Test link found:', testLink.href);
            
            // Test highlight element
            navSim.highlightElement(testLink);
            console.log('✅ Element highlighted');
            
            // Wait a moment
            setTimeout(() => {
                // Test remove highlight
                navSim.removeHighlight(testLink);
                console.log('✅ Element highlight removed');
            }, 2000);
        } else {
            console.log('⚪ No test link found');
        }
        
        // Test 7: Test clear highlights
        setTimeout(() => {
            console.log('🧹 Testing clear highlights...');
            navSim.clearHighlights();
            console.log('✅ All highlights cleared');
        }, 3000);
        
        // Test 8: Test disable highlight feature
        setTimeout(() => {
            console.log('🔧 Testing disable highlight feature...');
            navSim.setHighlightNavigation(false);
            console.log(`  Highlight disabled: ${!navSim.isHighlightEnabled()}`);
        }, 4000);
        
        // Test 9: Test navigation with highlight
        setTimeout(() => {
            console.log('🧭 Testing navigation with highlight...');
            navSim.setHighlightNavigation(true);
            
            // Test clickLink with highlight
            const testLink = document.querySelector('a[href]');
            if (testLink) {
                console.log('🎯 Testing clickLink with highlight...');
                // Note: This will actually click the link, so be careful
                // navSim.clickLink(testLink);
                console.log('⚠️ clickLink test skipped to avoid navigation');
            }
        }, 5000);
        
    } else {
        console.log('❌ Navigation simulator not found');
        console.log('Make sure the extension is loaded and automation is initialized');
    }
    
    // Test 10: Manual highlight testing
    console.log('🎨 Manual highlight testing:');
    
    // Create test elements
    const testContainer = document.createElement('div');
    testContainer.innerHTML = `
        <div style="margin: 20px; padding: 20px; border: 1px solid #ccc;">
            <h3>🎯 Highlight Test Elements</h3>
            <a href="#test1" style="display: block; margin: 10px 0; padding: 10px; background: #f0f0f0;">Test Link 1</a>
            <a href="#test2" style="display: block; margin: 10px 0; padding: 10px; background: #f0f0f0;">Test Link 2</a>
            <a href="#test3" style="display: block; margin: 10px 0; padding: 10px; background: #f0f0f0;">Test Link 3</a>
            <button onclick="alert('Test button')" style="margin: 10px 0; padding: 10px;">Test Button</button>
        </div>
    `;
    
    document.body.appendChild(testContainer);
    console.log('✅ Test elements created');
    
    // Test highlighting test elements
    setTimeout(() => {
        if (window.AdSenseAutomationProInstance && window.AdSenseAutomationProInstance.navigationSimulator) {
            const navSim = window.AdSenseAutomationProInstance.navigationSimulator;
            navSim.setHighlightNavigation(true);
            
            const testLinks = testContainer.querySelectorAll('a');
            testLinks.forEach((link, index) => {
                setTimeout(() => {
                    navSim.highlightElement(link);
                    console.log(`✅ Test link ${index + 1} highlighted`);
                    
                    setTimeout(() => {
                        navSim.removeHighlight(link);
                        console.log(`✅ Test link ${index + 1} highlight removed`);
                    }, 1000);
                }, index * 500);
            });
        }
    }, 6000);
    
    // Cleanup after testing
    setTimeout(() => {
        if (testContainer && testContainer.parentNode) {
            testContainer.parentNode.removeChild(testContainer);
            console.log('🧹 Test elements cleaned up');
        }
    }, 10000);
    
    console.log('🧪 Highlight feature test completed');
    console.log('💡 Use these commands to test manually:');
    console.log('  navSim.setHighlightNavigation(true)  - Enable highlighting');
    console.log('  navSim.setHighlightNavigation(false) - Disable highlighting');
    console.log('  navSim.previewNavigationUrls()       - Preview all navigation URLs');
    console.log('  navSim.clearHighlights()             - Clear all highlights');
    console.log('  navSim.isHighlightEnabled()          - Check highlight status');
}

// Auto-run test
if (typeof window !== 'undefined') {
    console.log('🚀 Running highlight feature test...');
    testHighlightFeature();
} else {
    console.log('This test should be run in a browser environment');
}
