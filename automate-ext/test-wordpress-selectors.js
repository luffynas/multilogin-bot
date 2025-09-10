/**
 * Test script to verify WordPress selector refactoring
 * Run this in browser console to test WordPress-specific selectors
 */

function testWordPressSelectors() {
    console.log('🧪 Testing WordPress selector refactoring...');
    
    // Test 1: Check if navigation simulator exists
    if (window.AdSenseAutomationProInstance && window.AdSenseAutomationProInstance.navigationSimulator) {
        const navSim = window.AdSenseAutomationProInstance.navigationSimulator;
        console.log('✅ Navigation simulator found');
        
        // Test 2: Test findLegalLinks function
        try {
            const legalLinks = navSim.findLegalLinks();
            console.log(`✅ findLegalLinks() found ${legalLinks.length} legal/info page links`);
            
            if (legalLinks.length > 0) {
                console.log('Legal/Info page links found:');
                legalLinks.forEach((link, index) => {
                    console.log(`  ${index + 1}. ${link.textContent.trim()} - ${link.href}`);
                });
            }
        } catch (error) {
            console.log('❌ Error testing findLegalLinks:', error);
        }
        
        // Test 3: Test WordPress-specific selectors
        const wordpressSelectors = [
            // WordPress standard page links
            'a[href*="about"]',
            'a[href*="contact"]',
            'a[href*="privacy"]',
            'a[href*="terms"]',
            'a[href*="disclaimer"]',
            'a[href*="faq"]',
            'a[href*="help"]',
            'a[href*="support"]',
            'a[href*="legal"]',
            'a[href*="policy"]',
            'a[href*="cookies"]',
            'a[href*="sitemap"]',
            
            // WordPress standard CSS classes
            '.about a',
            '.contact a',
            '.privacy a',
            '.terms a',
            '.legal a',
            '.footer a',
            '.footer-links a',
            '.legal-links a',
            '.info-links a',
            
            // WordPress specific selectors
            '.menu-item a[href*="about"]',
            '.menu-item a[href*="contact"]',
            '.menu-item a[href*="privacy"]',
            '.menu-item a[href*="terms"]',
            '.wp-block-navigation a[href*="about"]',
            '.wp-block-navigation a[href*="contact"]',
            '.wp-block-navigation a[href*="privacy"]',
            '.wp-block-navigation a[href*="terms"]',
            '.wp-block-navigation a[href*="legal"]',
            '.wp-block-navigation a[href*="help"]',
            '.wp-block-navigation a[href*="support"]',
            '.wp-block-navigation a[href*="faq"]',
            '.wp-block-navigation a[href*="sitemap"]',
            '.wp-block-navigation a[href*="disclaimer"]',
            '.wp-block-navigation a[href*="policy"]',
            '.wp-block-navigation a[href*="cookies"]',
            
            // WordPress footer selectors
            '.site-footer a[href*="about"]',
            '.site-footer a[href*="contact"]',
            '.site-footer a[href*="privacy"]',
            '.site-footer a[href*="terms"]',
            '.site-footer a[href*="legal"]',
            '.site-footer a[href*="help"]',
            '.site-footer a[href*="support"]',
            '.site-footer a[href*="faq"]',
            '.site-footer a[href*="sitemap"]',
            '.site-footer a[href*="disclaimer"]',
            '.site-footer a[href*="policy"]',
            '.site-footer a[href*="cookies"]',
            
            // WordPress widget selectors
            '.widget a[href*="about"]',
            '.widget a[href*="contact"]',
            '.widget a[href*="privacy"]',
            '.widget a[href*="terms"]',
            '.widget a[href*="legal"]',
            '.widget a[href*="help"]',
            '.widget a[href*="support"]',
            '.widget a[href*="faq"]',
            '.widget a[href*="sitemap"]',
            '.widget a[href*="disclaimer"]',
            '.widget a[href*="policy"]',
            '.widget a[href*="cookies"]'
        ];
        
        console.log('🔍 Testing WordPress selector effectiveness:');
        
        let totalFound = 0;
        let selectorsWithResults = 0;
        
        wordpressSelectors.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                if (elements.length > 0) {
                    console.log(`✅ "${selector}" found ${elements.length} elements`);
                    totalFound += elements.length;
                    selectorsWithResults++;
                    
                    // Show first few results
                    const maxShow = Math.min(3, elements.length);
                    for (let i = 0; i < maxShow; i++) {
                        const element = elements[i];
                        const link = element.tagName === 'A' ? element : element.querySelector('a');
                        if (link) {
                            console.log(`  ${i + 1}. ${link.textContent.trim()} - ${link.href}`);
                        }
                    }
                    if (elements.length > maxShow) {
                        console.log(`  ... and ${elements.length - maxShow} more`);
                    }
                } else {
                    console.log(`⚪ "${selector}" found 0 elements`);
                }
            } catch (error) {
                console.log(`❌ "${selector}" error:`, error.message);
            }
        });
        
        console.log(`📊 Summary: ${selectorsWithResults}/${wordpressSelectors.length} selectors found elements (${totalFound} total elements)`);
        
        // Test 4: Test WordPress-specific elements
        console.log('🔍 Testing WordPress-specific elements:');
        
        const wordpressElements = [
            '.menu-item',
            '.wp-block-navigation',
            '.site-footer',
            '.widget',
            '.footer',
            '.footer-links',
            '.legal-links',
            '.info-links'
        ];
        
        wordpressElements.forEach(selector => {
            try {
                const elements = document.querySelectorAll(selector);
                if (elements.length > 0) {
                    console.log(`✅ "${selector}" found ${elements.length} elements`);
                } else {
                    console.log(`⚪ "${selector}" found 0 elements`);
                }
            } catch (error) {
                console.log(`❌ "${selector}" error:`, error.message);
            }
        });
        
        // Test 5: Test navigation function (dry run)
        console.log('🧪 Testing navigation function (dry run):');
        
        try {
            const legalLinks = navSim.findLegalLinks();
            if (legalLinks.length > 0) {
                const bestLink = navSim.selectBestLink(legalLinks);
                console.log(`✅ navigateToLegalPage() would click: ${bestLink.textContent.trim()} - ${bestLink.href}`);
            } else {
                console.log('⚪ navigateToLegalPage() - no legal/info page links found');
            }
        } catch (error) {
            console.log('❌ Error testing navigateToLegalPage:', error);
        }
        
    } else {
        console.log('❌ Navigation simulator not found');
        console.log('Make sure the extension is loaded and automation is initialized');
    }
    
    // Test 6: Manual WordPress detection
    console.log('🔍 Manual WordPress detection:');
    
    // Check for WordPress-specific elements
    const wpIndicators = [
        'meta[name="generator"][content*="WordPress"]',
        'link[href*="wp-content"]',
        'script[src*="wp-content"]',
        'style[href*="wp-content"]',
        '.wp-block-',
        '.menu-item',
        '.widget',
        '.site-footer',
        '.wp-block-navigation'
    ];
    
    let wpDetected = false;
    wpIndicators.forEach(selector => {
        try {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
                console.log(`✅ WordPress indicator "${selector}" found ${elements.length} elements`);
                wpDetected = true;
            }
        } catch (error) {
            console.log(`❌ WordPress indicator "${selector}" error:`, error.message);
        }
    });
    
    if (wpDetected) {
        console.log('✅ WordPress website detected - selectors should work well');
    } else {
        console.log('⚠️ WordPress website not detected - selectors may have limited effectiveness');
    }
    
    console.log('🧪 WordPress selector refactoring test completed');
}

// Auto-run test
if (typeof window !== 'undefined') {
    console.log('🚀 Running WordPress selector refactoring test...');
    testWordPressSelectors();
} else {
    console.log('This test should be run in a browser environment');
}
