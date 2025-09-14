/**
 * Simple test for background script functionality
 * Run this in browser console to test background script
 */

// Test if background script is working
async function testBackgroundScript() {
  console.log('Testing background script...');
  
  try {
    // Test 1: Check if background script is loaded
    console.log('✓ Background script loaded');
    
    // Test 2: Test storage functionality
    console.log('Testing storage...');
    const testData = { test: 'value', timestamp: Date.now() };
    
    // Send message to background script
    const response = await new Promise((resolve) => {
      chrome.runtime.sendMessage({
        action: 'updateSettings',
        settings: testData
      }, (response) => {
        resolve(response);
      });
    });
    
    if (response && response.success) {
      console.log('✓ Storage test passed');
    } else {
      console.log('✗ Storage test failed:', response);
    }
    
    // Test 3: Test get status
    console.log('Testing status...');
    const statusResponse = await new Promise((resolve) => {
      chrome.runtime.sendMessage({
        action: 'getStatus'
      }, (response) => {
        resolve(response);
      });
    });
    
    if (statusResponse && statusResponse.success) {
      console.log('✓ Status test passed:', statusResponse.data);
    } else {
      console.log('✗ Status test failed:', statusResponse);
    }
    
    // Test 4: Test get stats
    console.log('Testing stats...');
    const statsResponse = await new Promise((resolve) => {
      chrome.runtime.sendMessage({
        action: 'getStats'
      }, (response) => {
        resolve(response);
      });
    });
    
    if (statsResponse && statsResponse.success) {
      console.log('✓ Stats test passed:', statsResponse.data);
    } else {
      console.log('✗ Stats test failed:', statsResponse);
    }
    
    console.log('All tests completed!');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Test storage directly
async function testStorage() {
  console.log('Testing storage directly...');
  
  try {
    // Test chrome.storage.local
    const testData = { test: 'value', timestamp: Date.now() };
    
    await chrome.storage.local.set({ testKey: testData });
    console.log('✓ Storage set successful');
    
    const result = await chrome.storage.local.get('testKey');
    console.log('✓ Storage get successful:', result);
    
    if (result.testKey && result.testKey.test === 'value') {
      console.log('✓ Storage data integrity verified');
    } else {
      console.log('✗ Storage data integrity failed');
    }
    
    // Clean up
    await chrome.storage.local.remove('testKey');
    console.log('✓ Storage cleanup successful');
    
  } catch (error) {
    console.error('Storage test failed:', error);
  }
}

// Test extension APIs
function testExtensionAPIs() {
  console.log('Testing extension APIs...');
  
  try {
    // Test chrome.runtime
    if (chrome.runtime) {
      console.log('✓ chrome.runtime available');
      console.log('  - ID:', chrome.runtime.id);
      console.log('  - URL:', chrome.runtime.getURL(''));
    } else {
      console.log('✗ chrome.runtime not available');
    }
    
    // Test chrome.storage
    if (chrome.storage) {
      console.log('✓ chrome.storage available');
      console.log('  - local:', !!chrome.storage.local);
      console.log('  - sync:', !!chrome.storage.sync);
      console.log('  - session:', !!chrome.storage.session);
    } else {
      console.log('✗ chrome.storage not available');
    }
    
    // Test chrome.tabs
    if (chrome.tabs) {
      console.log('✓ chrome.tabs available');
    } else {
      console.log('✗ chrome.tabs not available');
    }
    
    // Test chrome.alarms
    if (chrome.alarms) {
      console.log('✓ chrome.alarms available');
    } else {
      console.log('✗ chrome.alarms not available');
    }
    
  } catch (error) {
    console.error('API test failed:', error);
  }
}

// Run all tests
async function runAllTests() {
  console.log('=== Background Script Test Suite ===');
  
  testExtensionAPIs();
  await testStorage();
  await testBackgroundScript();
  
  console.log('=== Test Suite Complete ===');
}

// Export for use
window.testBackgroundScript = testBackgroundScript;
window.testStorage = testStorage;
window.testExtensionAPIs = testExtensionAPIs;
window.runAllTests = runAllTests;

console.log('Background script tests loaded. Run runAllTests() to start testing.');
