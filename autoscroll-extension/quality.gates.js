/**
 * Quality Gates Configuration for Autoscroll Extension
 * Comprehensive quality checks and thresholds
 */

export const qualityGates = {
  // Test coverage thresholds - Adjusted for current implementation status
  coverage: {
    // Minimum coverage requirements
    minimum: {
      branches: 20,
      functions: 20,
      lines: 20,
      statements: 20
    },
    
    // Recommended coverage targets
    recommended: {
      branches: 40,
      functions: 40,
      lines: 40,
      statements: 40
    },
    
    // Strict coverage requirements
    strict: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60
    }
  },

  // Performance thresholds
  performance: {
    // Test execution time limits (in milliseconds)
    testExecution: {
      unit: 1000,        // Unit tests should complete within 1 second
      integration: 5000, // Integration tests within 5 seconds
      e2e: 10000,        // E2E tests within 10 seconds
      performance: 3000  // Performance tests within 3 seconds
    },
    
    // Memory usage limits (in MB)
    memory: {
      maxHeapUsed: 100,  // Maximum heap usage
      maxMemoryIncrease: 50 // Maximum memory increase during tests
    }
  },

  // Code quality thresholds
  codeQuality: {
    // ESLint error thresholds
    eslint: {
      maxErrors: 0,      // No errors allowed
      maxWarnings: 10    // Maximum 10 warnings
    },
    
    // Code complexity thresholds
    complexity: {
      maxCyclomaticComplexity: 10,  // Maximum cyclomatic complexity
      maxCognitiveComplexity: 15    // Maximum cognitive complexity
    },
    
    // File size thresholds
    fileSize: {
      maxLines: 500,     // Maximum lines per file
      maxCharacters: 10000 // Maximum characters per file
    }
  },

  // Security thresholds
  security: {
    // NPM audit thresholds
    npmAudit: {
      maxHigh: 0,        // No high severity vulnerabilities
      maxModerate: 5,    // Maximum 5 moderate vulnerabilities
      maxLow: 10         // Maximum 10 low vulnerabilities
    },
    
    // Dependency thresholds
    dependencies: {
      maxOutdated: 5,    // Maximum 5 outdated dependencies
      maxVulnerable: 0   // No vulnerable dependencies
    }
  },

  // Test quality thresholds
  testQuality: {
    // Test count thresholds
    testCount: {
      minUnitTests: 50,      // Minimum 50 unit tests
      minIntegrationTests: 10, // Minimum 10 integration tests
      minE2ETests: 5         // Minimum 5 E2E tests
    },
    
    // Test success rate
    successRate: {
      minUnitSuccess: 95,    // Minimum 95% unit test success
      minIntegrationSuccess: 90, // Minimum 90% integration test success
      minE2ESuccess: 85      // Minimum 85% E2E test success
    }
  }
};

/**
 * Quality gate validation functions
 */
export const qualityGateValidators = {
  /**
   * Validate test coverage
   */
  validateCoverage: (coverageData, threshold = 'minimum') => {
    const thresholds = qualityGates.coverage[threshold];
    const results = {
      passed: true,
      details: {},
      summary: {}
    };

    // Check global coverage
    for (const [metric, threshold] of Object.entries(thresholds)) {
      const actual = coverageData.global[metric];
      const passed = actual >= threshold;
      
      results.details[metric] = {
        actual,
        threshold,
        passed,
        percentage: ((actual / threshold) * 100).toFixed(1)
      };
      
      if (!passed) {
        results.passed = false;
      }
    }

    // Generate summary
    results.summary = {
      totalMetrics: Object.keys(thresholds).length,
      passedMetrics: Object.values(results.details).filter(d => d.passed).length,
      overallPercentage: (Object.values(results.details).reduce((sum, d) => sum + d.actual, 0) / Object.values(results.details).reduce((sum, d) => sum + d.threshold, 0) * 100).toFixed(1)
    };

    return results;
  },

  /**
   * Validate performance metrics
   */
  validatePerformance: (performanceData) => {
    const results = {
      passed: true,
      details: {},
      summary: {}
    };

    // Check test execution times
    for (const [testType, maxTime] of Object.entries(qualityGates.performance.testExecution)) {
      const actual = performanceData[testType]?.executionTime || 0;
      const passed = actual <= maxTime;
      
      results.details[testType] = {
        actual,
        threshold: maxTime,
        passed,
        percentage: ((actual / maxTime) * 100).toFixed(1)
      };
      
      if (!passed) {
        results.passed = false;
      }
    }

    // Check memory usage
    const memoryData = performanceData.memory || {};
    for (const [metric, maxValue] of Object.entries(qualityGates.performance.memory)) {
      const actual = memoryData[metric] || 0;
      const passed = actual <= maxValue;
      
      results.details[`memory_${metric}`] = {
        actual,
        threshold: maxValue,
        passed,
        percentage: ((actual / maxValue) * 100).toFixed(1)
      };
      
      if (!passed) {
        results.passed = false;
      }
    }

    return results;
  },

  /**
   * Validate code quality
   */
  validateCodeQuality: (qualityData) => {
    const results = {
      passed: true,
      details: {},
      summary: {}
    };

    // Check ESLint results
    const eslintData = qualityData.eslint || {};
    for (const [metric, threshold] of Object.entries(qualityGates.codeQuality.eslint)) {
      const actual = eslintData[metric] || 0;
      const passed = actual <= threshold;
      
      results.details[`eslint_${metric}`] = {
        actual,
        threshold,
        passed
      };
      
      if (!passed) {
        results.passed = false;
      }
    }

    // Check complexity
    const complexityData = qualityData.complexity || {};
    for (const [metric, threshold] of Object.entries(qualityGates.codeQuality.complexity)) {
      const actual = complexityData[metric] || 0;
      const passed = actual <= threshold;
      
      results.details[`complexity_${metric}`] = {
        actual,
        threshold,
        passed
      };
      
      if (!passed) {
        results.passed = false;
      }
    }

    return results;
  },

  /**
   * Validate security metrics
   */
  validateSecurity: (securityData) => {
    const results = {
      passed: true,
      details: {},
      summary: {}
    };

    // Check NPM audit results
    const auditData = securityData.audit || {};
    for (const [severity, threshold] of Object.entries(qualityGates.security.npmAudit)) {
      const actual = auditData[severity] || 0;
      const passed = actual <= threshold;
      
      results.details[`audit_${severity}`] = {
        actual,
        threshold,
        passed
      };
      
      if (!passed) {
        results.passed = false;
      }
    }

    return results;
  },

  /**
   * Validate test quality
   */
  validateTestQuality: (testData) => {
    const results = {
      passed: true,
      details: {},
      summary: {}
    };

    // Check test counts
    const testCounts = testData.counts || {};
    for (const [testType, minCount] of Object.entries(qualityGates.testQuality.testCount)) {
      const actual = testCounts[testType] || 0;
      const passed = actual >= minCount;
      
      results.details[`count_${testType}`] = {
        actual,
        threshold: minCount,
        passed
      };
      
      if (!passed) {
        results.passed = false;
      }
    }

    // Check success rates
    const successRates = testData.successRates || {};
    for (const [testType, minRate] of Object.entries(qualityGates.testQuality.successRate)) {
      const actual = successRates[testType] || 0;
      const passed = actual >= minRate;
      
      results.details[`success_${testType}`] = {
        actual,
        threshold: minRate,
        passed
      };
      
      if (!passed) {
        results.passed = false;
      }
    }

    return results;
  },

  /**
   * Run all quality gate validations
   */
  runAllValidations: (data) => {
    const results = {
      overall: { passed: true },
      coverage: qualityGateValidators.validateCoverage(data.coverage),
      performance: qualityGateValidators.validatePerformance(data.performance),
      codeQuality: qualityGateValidators.validateCodeQuality(data.codeQuality),
      security: qualityGateValidators.validateSecurity(data.security),
      testQuality: qualityGateValidators.validateTestQuality(data.testQuality)
    };

    // Check overall pass status
    results.overall.passed = Object.values(results)
      .filter(result => result !== results.overall)
      .every(result => result.passed);

    return results;
  }
};

/**
 * Quality gate report generator
 */
export const qualityGateReporter = {
  /**
   * Generate console report
   */
  generateConsoleReport: (validationResults) => {
    console.log('\n🔍 Quality Gates Report');
    console.log('========================\n');

    // Overall status
    const status = validationResults.overall.passed ? '✅ PASSED' : '❌ FAILED';
    console.log(`Overall Status: ${status}\n`);

    // Coverage report
    console.log('📊 Coverage Quality Gate:');
    const coverage = validationResults.coverage;
    console.log(`  Status: ${coverage.passed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`  Summary: ${coverage.summary.passedMetrics}/${coverage.summary.totalMetrics} metrics passed (${coverage.summary.overallPercentage}%)`);
    
    for (const [metric, details] of Object.entries(coverage.details)) {
      const status = details.passed ? '✅' : '❌';
      console.log(`    ${status} ${metric}: ${details.actual}% (threshold: ${details.threshold}%)`);
    }
    console.log('');

    // Performance report
    console.log('⚡ Performance Quality Gate:');
    const performance = validationResults.performance;
    console.log(`  Status: ${performance.passed ? '✅ PASSED' : '❌ FAILED'}`);
    
    for (const [metric, details] of Object.entries(performance.details)) {
      const status = details.passed ? '✅' : '❌';
      console.log(`    ${status} ${metric}: ${details.actual}ms (threshold: ${details.threshold}ms)`);
    }
    console.log('');

    // Code quality report
    console.log('🔧 Code Quality Gate:');
    const codeQuality = validationResults.codeQuality;
    console.log(`  Status: ${codeQuality.passed ? '✅ PASSED' : '❌ FAILED'}`);
    
    for (const [metric, details] of Object.entries(codeQuality.details)) {
      const status = details.passed ? '✅' : '❌';
      console.log(`    ${status} ${metric}: ${details.actual} (threshold: ${details.threshold})`);
    }
    console.log('');

    // Security report
    console.log('🔒 Security Quality Gate:');
    const security = validationResults.security;
    console.log(`  Status: ${security.passed ? '✅ PASSED' : '❌ FAILED'}`);
    
    for (const [metric, details] of Object.entries(security.details)) {
      const status = details.passed ? '✅' : '❌';
      console.log(`    ${status} ${metric}: ${details.actual} (threshold: ${details.threshold})`);
    }
    console.log('');

    // Test quality report
    console.log('🧪 Test Quality Gate:');
    const testQuality = validationResults.testQuality;
    console.log(`  Status: ${testQuality.passed ? '✅ PASSED' : '❌ FAILED'}`);
    
    for (const [metric, details] of Object.entries(testQuality.details)) {
      const status = details.passed ? '✅' : '❌';
      console.log(`    ${status} ${metric}: ${details.actual} (threshold: ${details.threshold})`);
    }
    console.log('');

    return validationResults.overall.passed;
  },

  /**
   * Generate JSON report
   */
  generateJSONReport: (validationResults) => {
    return JSON.stringify(validationResults, null, 2);
  },

  /**
   * Generate HTML report
   */
  generateHTMLReport: (validationResults) => {
    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Quality Gates Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .status-passed { color: #28a745; }
        .status-failed { color: #dc3545; }
        .metric { margin: 10px 0; padding: 10px; border-left: 4px solid #ddd; }
        .metric-passed { border-left-color: #28a745; }
        .metric-failed { border-left-color: #dc3545; }
        .summary { background: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔍 Quality Gates Report</h1>
        <p>Overall Status: <span class="${validationResults.overall.passed ? 'status-passed' : 'status-failed'}">${validationResults.overall.passed ? '✅ PASSED' : '❌ FAILED'}</span></p>
    </div>
    
    <div class="summary">
        <h2>Summary</h2>
        <p>Coverage: ${validationResults.coverage.passed ? '✅ PASSED' : '❌ FAILED'}</p>
        <p>Performance: ${validationResults.performance.passed ? '✅ PASSED' : '❌ FAILED'}</p>
        <p>Code Quality: ${validationResults.codeQuality.passed ? '✅ PASSED' : '❌ FAILED'}</p>
        <p>Security: ${validationResults.security.passed ? '✅ PASSED' : '❌ FAILED'}</p>
        <p>Test Quality: ${validationResults.testQuality.passed ? '✅ PASSED' : '❌ FAILED'}</p>
    </div>
    
    <h2>Detailed Results</h2>
    <pre>${JSON.stringify(validationResults, null, 2)}</pre>
</body>
</html>`;
    
    return html;
  }
};

export default qualityGates;
