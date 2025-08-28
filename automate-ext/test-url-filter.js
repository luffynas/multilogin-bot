/**
 * Test script to validate URL filtering logic
 */

// Simulate the isSupportedWebsite function
function isSupportedWebsite(url) {
    if (!url) return false;
    
    // Don't inject into chrome://, chrome-extension://, or other restricted URLs
    const restrictedProtocols = [
        'chrome://',
        'chrome-extension://',
        'moz-extension://',
        'about:',
        'chrome-search://',
        'chrome-devtools://',
        'view-source:',
        'data:',
        'file:'
    ];
    
    for (const protocol of restrictedProtocols) {
        if (url.startsWith(protocol)) {
            return false;
        }
    }
    
    // Support all other websites
    return true;
}

// Test URLs
const testUrls = [
    // Should be blocked
    'chrome://extensions/',
    'chrome://settings/',
    'chrome-extension://abcdefghijklmnop/',
    'moz-extension://abcdefghijklmnop/',
    'about:blank',
    'about:newtab',
    'chrome-search://local-ntp/',
    'chrome-devtools://devtools/',
    'view-source:https://example.com',
    'data:text/html,<html></html>',
    'file:///Users/user/file.html',
    
    // Should be allowed
    'https://www.google.com',
    'https://www.facebook.com',
    'https://www.youtube.com',
    'https://www.amazon.com',
    'http://localhost:3000',
    'https://example.com',
    'https://subdomain.example.com',
    'https://www.example.com/path?param=value',
    'https://example.com:8080',
    'http://192.168.1.1',
    'https://[2001:db8::1]',
    
    // Edge cases
    null,
    undefined,
    '',
    'not-a-url',
    'chrome://',
    'https://chrome://fake.com',
    'https://about:fake.com'
];

console.log('🧪 Testing URL filtering logic...\n');

let blockedCount = 0;
let allowedCount = 0;

for (const url of testUrls) {
    const isSupported = isSupportedWebsite(url);
    const status = isSupported ? '✅ ALLOWED' : '❌ BLOCKED';
    const displayUrl = url || '(null/undefined)';
    
    console.log(`${status} - ${displayUrl}`);
    
    if (isSupported) {
        allowedCount++;
    } else {
        blockedCount++;
    }
}

console.log(`\n📊 Results:`);
console.log(`   ✅ Allowed: ${allowedCount}`);
console.log(`   ❌ Blocked: ${blockedCount}`);
console.log(`   📈 Total: ${testUrls.length}`);

// Test specific problematic URLs
console.log(`\n🔍 Specific Test Cases:`);
const problematicUrls = [
    'chrome://extensions/',
    'chrome://settings/',
    'about:blank',
    'chrome-search://local-ntp/',
    'https://www.google.com',
    'https://www.facebook.com'
];

for (const url of problematicUrls) {
    const isSupported = isSupportedWebsite(url);
    const status = isSupported ? '✅ ALLOWED' : '❌ BLOCKED';
    console.log(`${status} - ${url}`);
}

console.log(`\n🎉 URL filtering test completed!`);
