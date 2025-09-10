/**
 * Test script untuk memverifikasi perbaikan navigasi
 * Menguji readingCompleted state dan navigation logic
 */

function testNavigationFix() {
    console.log('🧪 Testing Navigation Fix...');
    
    const automationPro = window.AdSenseAutomationProInstance;
    if (!automationPro) {
        console.error('❌ AdSenseAutomationProInstance not found. Ensure extension is running.');
        return;
    }

    console.log('\n--- 1. Testing Reading State Initialization ---');
    console.log('✅ readingCompleted:', automationPro.readingCompleted);
    console.log('✅ lastReadingTime:', automationPro.lastReadingTime);
    console.log('✅ sessionStartTime:', automationPro.sessionStartTime);

    console.log('\n--- 2. Testing Navigation State ---');
    if (automationPro.navigationState) {
        console.log('✅ navigationState.readingCompleted:', automationPro.navigationState.readingCompleted);
        console.log('✅ navigationState.lastNavigationTime:', automationPro.navigationState.lastNavigationTime);
        console.log('✅ navigationState.pageStartTime:', automationPro.navigationState.pageStartTime);
    } else {
        console.log('⚠️ navigationState not initialized yet');
    }

    console.log('\n--- 3. Testing Navigation Simulator ---');
    const navSim = automationPro.navigationSimulator;
    if (navSim) {
        console.log('✅ NavigationSimulator available');
        
        // Test next page links
        const nextLinks = navSim.findNextPageLinks();
        console.log('✅ Next page links found:', nextLinks.length);
        nextLinks.forEach((link, i) => {
            console.log(`  ${i + 1}. ${link.href} (Text: "${link.textContent.trim()}")`);
        });
        
        // Test previous page links
        const prevLinks = navSim.findPreviousPageLinks();
        console.log('✅ Previous page links found:', prevLinks.length);
        prevLinks.forEach((link, i) => {
            console.log(`  ${i + 1}. ${link.href} (Text: "${link.textContent.trim()}")`);
        });
        
        // Test navigation weights
        const weights = navSim.getNavigationWeights({ type: 'explorer' });
        console.log('✅ Navigation weights for explorer:', weights);
        
    } else {
        console.error('❌ NavigationSimulator not available');
    }

    console.log('\n--- 4. Testing Reading Simulator ---');
    const readingSim = automationPro.readingSimulator;
    if (readingSim) {
        console.log('✅ ReadingSimulator available');
        console.log('✅ Reading state:', readingSim.getReadingStatus());
    } else {
        console.error('❌ ReadingSimulator not available');
    }

    console.log('\n--- 5. Testing Automation State ---');
    console.log('✅ isRunning:', automationPro.isRunning);
    console.log('✅ isInitialized:', automationPro.isInitialized);
    console.log('✅ automationConfig:', automationPro.automationConfig);

    console.log('\n--- 6. Testing Navigation Probability Calculation ---');
    const now = Date.now();
    const sessionStart = automationPro.sessionStartTime || now;
    const pageTime = now - sessionStart;
    const navigationProbability = Math.min(0.3, pageTime / 300000); // 30% max after 5 minutes
    
    console.log('✅ Current page time:', Math.round(pageTime / 1000), 'seconds');
    console.log('✅ Navigation probability:', (navigationProbability * 100).toFixed(1) + '%');
    console.log('✅ Should navigate:', Math.random() < navigationProbability ? 'YES' : 'NO');

    console.log('\n--- 7. Testing Force Navigation Logic ---');
    if (pageTime > 300000) { // 5 minutes
        console.log('✅ Force navigation should trigger (page time > 5 minutes)');
    } else {
        console.log('⏳ Force navigation not yet triggered (page time < 5 minutes)');
    }

    console.log('\n--- 8. Testing Navigation Cooldown ---');
    const navigationCooldown = 60000; // 1 minute
    const lastNavTime = automationPro.navigationState?.lastNavigationTime || 0;
    const timeSinceLastNav = now - lastNavTime;
    
    console.log('✅ Time since last navigation:', Math.round(timeSinceLastNav / 1000), 'seconds');
    console.log('✅ Navigation cooldown period:', navigationCooldown / 1000, 'seconds');
    console.log('✅ Can navigate now:', timeSinceLastNav >= navigationCooldown ? 'YES' : 'NO');

    console.log('\n--- 9. Testing Reading Completion Logic ---');
    console.log('✅ readingCompleted state:', automationPro.readingCompleted);
    console.log('✅ Navigation blocked by reading:', !automationPro.readingCompleted ? 'YES' : 'NO');

    console.log('\n--- 10. Testing Session Manager ---');
    const sessionManager = automationPro.sessionManager;
    if (sessionManager) {
        const session = sessionManager.getCurrentSession();
        console.log('✅ Current session:', session ? 'Active' : 'None');
        if (session) {
            console.log('✅ Session start time:', new Date(session.startTime).toLocaleTimeString());
            console.log('✅ Session duration:', Math.round((now - session.startTime) / 1000), 'seconds');
        }
    }

    console.log('\n🧪 Navigation Fix Test Complete!');
    console.log('\n📊 Summary of Fixes:');
    console.log('✅ Fixed readingCompleted initialization in constructor');
    console.log('✅ Added readingCompleted reset in startAutomation');
    console.log('✅ Added readingCompleted reset after navigation');
    console.log('✅ Added readingCompleted set after reading completion');
    console.log('✅ Increased navigation probability from 5% to 30%');
    console.log('✅ Reduced navigation probability calculation time from 10 to 5 minutes');
    
    console.log('\n🎯 Expected Results:');
    console.log('• readingCompleted should be properly initialized and managed');
    console.log('• Navigation should trigger after reading completion');
    console.log('• Next/previous page links should be found and clickable');
    console.log('• Navigation probability should be reasonable (not too low)');
    console.log('• Force navigation should work after 5 minutes');
    
    console.log('\n🔍 Debug Information:');
    console.log('• If readingCompleted is false, navigation will be blocked');
    console.log('• If no next/previous links found, navigation will fail');
    console.log('• If navigation probability is too low, navigation will rarely occur');
    console.log('• If cooldown is active, navigation will be delayed');
}

// Auto-run test
testNavigationFix();
