/**
 * Test Results Processor
 * Processes test results and generates additional reports
 */

export default function processTestResults(results) {
  const { numTotalTests, numPassedTests, numFailedTests, numPendingTests } = results;
  
  // Calculate pass rate
  const passRate = numTotalTests > 0 ? (numPassedTests / numTotalTests * 100).toFixed(2) : 0;
  
  // Generate summary
  const summary = {
    total: numTotalTests,
    passed: numPassedTests,
    failed: numFailedTests,
    pending: numPendingTests,
    passRate: `${passRate}%`,
    timestamp: new Date().toISOString()
  };
  
  // Log summary
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  console.log(`Total Tests: ${summary.total}`);
  console.log(`Passed: ${summary.passed} ✅`);
  console.log(`Failed: ${summary.failed} ❌`);
  console.log(`Pending: ${summary.pending} ⏳`);
  console.log(`Pass Rate: ${summary.passRate}`);
  console.log('========================\n');
  
  // Return processed results
  return {
    ...results,
    summary
  };
}
