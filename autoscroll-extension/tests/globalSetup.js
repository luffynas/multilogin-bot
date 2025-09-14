/**
 * Global Setup for Jest Tests
 * Runs once before all tests
 */

export default async function globalSetup() {
  console.log('🚀 Starting Autoscroll Extension Test Suite...');
  
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.TEST_MODE = 'true';
  
  // Mock global objects that need to be available before tests
  global.testStartTime = Date.now();
  
  console.log('✅ Global setup completed');
}
