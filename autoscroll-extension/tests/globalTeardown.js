/**
 * Global Teardown for Jest Tests
 * Runs once after all tests
 */

export default async function globalTeardown() {
  console.log('🧹 Cleaning up after test suite...');
  
  const testDuration = Date.now() - global.testStartTime;
  console.log(`⏱️  Total test duration: ${(testDuration / 1000).toFixed(2)}s`);
  
  // Clean up any global resources
  if (global.testUtils) {
    global.testUtils.resetAllMocks();
  }
  
  console.log('✅ Global teardown completed');
}
