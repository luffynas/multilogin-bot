/**
 * Test script to verify navigation refactoring with new selectors
 * Run this in browser console to test navigation functionality
 */

function testNavigationRefactor() {
    console.log('🧪 Testing navigation refactoring with new selectors...');
    
    // Test 1: Check if navigation simulator exists
    if (window.AdSenseAutomationProInstance && window.AdSenseAutomationProInstance.navigationSimulator) {
        const navSim = window.AdSenseAutomationProInstance.navigationSimulator;
        console.log('✅ Navigation simulator found');
        
        // Test 2: Test findNextPageLinks function
        try {
            const nextLinks = navSim.findNextPageLinks();
            console.log(`✅ findNextPageLinks() found ${nextLinks.length} next page links`);
            
            if (nextLinks.length > 0) {
                console.log('Next page links found:');
                nextLinks.forEach((link, index) => {
                    console.log(`  ${index + 1}. ${link.textContent.trim()} - ${link.href}`);
                });
            }
        } catch (error) {
            console.log('❌ Error testing findNextPageLinks:', error);
        }
        
        // Test 3: Test findPreviousPageLinks function
        try {
            const prevLinks = navSim.findPreviousPageLinks();
            console.log(`✅ findPreviousPageLinks() found ${prevLinks.length} previous page links`);
            
            if (prevLinks.length > 0) {
                console.log('Previous page links found:');
                prevLinks.forEach((link, index) => {
                    console.log(`  ${index + 1}. ${link.textContent.trim()} - ${link.href}`);
                });
            }
        } catch (error) {
            console.log('❌ Error testing findPreviousPageLinks:', error);
        }
        
        // Test 4: Test selector effectiveness
        const nextSelectors = [
            'a[rel="next"]',
            '.next',
            '.next-page',
            '.pagination .next',
            '.page-nav .next'
        ];
        
        const prevSelectors = [
            'a[rel="prev"]',
            '.prev',
            '.previous',
            '.previous-page',
            '.pagination .prev',
            '.page-nav .prev'
        ];
        
        console.log('🔍 Testing selector effectiveness:');
        
        // Test next selectors
        nextSelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                if (elements.length > 0) {
                    console.log(`✅ Next selector "${selector}" found ${elements.length} elements`);
                } else {
                    console.log(`⚪ Next selector "${selector}" found 0 elements`);
                }
            } catch (error) {
                console.log(`❌ Next selector "${selector}" error:`, error.message);
            }
        });
        
        // Test previous selectors
        prevSelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                if (elements.length > 0) {
                    console.log(`✅ Previous selector "${selector}" found ${elements.length} elements`);
                } else {
                    console.log(`⚪ Previous selector "${selector}" found 0 elements`);
                }
            } catch (error) {
                console.log(`❌ Previous selector "${selector}" error:`, error.message);
            }
        });
        
        // Test 5: Test navigation functions (without actually clicking)
        console.log('🧪 Testing navigation functions (dry run):');
        
        // Test navigateToNextPage (dry run)
        try {
            const nextLinks = navSim.findNextPageLinks();
            if (nextLinks.length > 0) {
                const bestLink = navSim.selectBestLink(nextLinks);
                console.log(`✅ navigateToNextPage() would click: ${bestLink.textContent.trim()} - ${bestLink.href}`);
            } else {
                console.log('⚪ navigateToNextPage() - no next page links found');
            }
        } catch (error) {
            console.log('❌ Error testing navigateToNextPage:', error);
        }
        
        // Test navigateToPreviousPage (dry run)
        try {
            const prevLinks = navSim.findPreviousPageLinks();
            if (prevLinks.length > 0) {
                const bestLink = navSim.selectBestLink(prevLinks);
                console.log(`✅ navigateToPreviousPage() would click: ${bestLink.textContent.trim()} - ${bestLink.href}`);
            } else {
                console.log('⚪ navigateToPreviousPage() - no previous page links found');
            }
        } catch (error) {
            console.log('❌ Error testing navigateToPreviousPage:', error);
        }
        
        // Test 6: Test navigation weights
        try {
            const weights = navSim.getNavigationWeights({ type: 'casual' });
            console.log('✅ Navigation weights for casual personality:');
            console.log(`  next_page: ${weights.next_page}`);
            console.log(`  previous_page: ${weights.previous_page}`);
            console.log(`  previous_next: ${weights.previous_next}`);
        } catch (error) {
            console.log('❌ Error testing navigation weights:', error);
        }
        
        // Test 7: Test chooseNavigationType
        try {
            const navType = navSim.chooseNavigationType({ type: 'casual' });
            console.log(`✅ chooseNavigationType() returned: ${navType}`);
        } catch (error) {
            console.log('❌ Error testing chooseNavigationType:', error);
        }
        
    } else {
        console.log('❌ Navigation simulator not found');
        console.log('Make sure the extension is loaded and automation is initialized');
    }
    
    // Test 8: Manual selector testing
    console.log('🔍 Manual selector testing:');
    
    const allSelectors = [
        ...nextSelectors,
        ...prevSelectors
    ];
    
    allSelectors.forEach(selector => {
        try {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
                console.log(`✅ "${selector}" found ${elements.length} elements:`);
                elements.forEach((el, index) => {
                    const link = el.tagName === 'A' ? el : el.querySelector('a');
                    if (link) {
                        console.log(`  ${index + 1}. ${link.textContent.trim()} - ${link.href}`);
                    } else {
                        console.log(`  ${index + 1}. ${el.textContent.trim()} (no link)`);
                    }
                });
            }
        } catch (error) {
            console.log(`❌ "${selector}" error:`, error.message);
        }
    });
    
    console.log('🧪 Navigation refactoring test completed');
}

// Auto-run test
if (typeof window !== 'undefined') {
    console.log('🚀 Running navigation refactoring test...');
    testNavigationRefactor();
} else {
    console.log('This test should be run in a browser environment');
}
