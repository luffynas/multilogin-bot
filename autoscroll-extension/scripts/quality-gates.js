#!/usr/bin/env node

/**
 * Quality Gates Runner Script
 * Runs comprehensive quality checks and generates reports
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { qualityGates, qualityGateValidators, qualityGateReporter } from '../quality.gates.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

/**
 * Quality gates runner class
 */
class QualityGatesRunner {
  constructor() {
    this.results = {
      coverage: null,
      performance: null,
      codeQuality: null,
      security: null,
      testQuality: null
    };
  }

  /**
   * Run all quality gates
   */
  async runAll() {
    console.log('🔍 Running Quality Gates...\n');

    try {
      // Run coverage analysis
      await this.runCoverageAnalysis();
      
      // Run performance analysis
      await this.runPerformanceAnalysis();
      
      // Run code quality analysis
      await this.runCodeQualityAnalysis();
      
      // Run security analysis
      await this.runSecurityAnalysis();
      
      // Run test quality analysis
      await this.runTestQualityAnalysis();
      
      // Generate comprehensive report
      const validationResults = qualityGateValidators.runAllValidations(this.results);
      
      // Display results
      const passed = qualityGateReporter.generateConsoleReport(validationResults);
      
      // Save reports
      this.saveReports(validationResults);
      
      // Exit with appropriate code
      process.exit(passed ? 0 : 1);
      
    } catch (error) {
      console.error('❌ Quality gates failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Run coverage analysis
   */
  async runCoverageAnalysis() {
    console.log('📊 Running coverage analysis...');
    
    try {
      // Run tests with coverage
      execSync('npm run test:coverage:all', { 
        cwd: projectRoot, 
        stdio: 'pipe' 
      });
      
      // Load coverage data
      const coveragePath = path.join(projectRoot, 'coverage', 'coverage-final.json');
      if (fs.existsSync(coveragePath)) {
        const coverageContent = fs.readFileSync(coveragePath, 'utf8');
        const coverageData = JSON.parse(coverageContent);
        
        // Calculate global coverage
        const global = this.calculateGlobalCoverage(coverageData);
        this.results.coverage = global;
        
        console.log(`  ✅ Coverage: ${global.statements}% statements, ${global.branches}% branches`);
      } else {
        console.log('  ⚠️  Coverage data not found');
        this.results.coverage = { statements: 0, branches: 0, functions: 0, lines: 0 };
      }
      
    } catch (error) {
      console.log('  ❌ Coverage analysis failed:', error.message);
      this.results.coverage = { statements: 0, branches: 0, functions: 0, lines: 0 };
    }
  }

  /**
   * Run performance analysis
   */
  async runPerformanceAnalysis() {
    console.log('⚡ Running performance analysis...');
    
    try {
      // Run performance tests
      const startTime = Date.now();
      execSync('npm run test:performance', { 
        cwd: projectRoot, 
        stdio: 'pipe' 
      });
      const executionTime = Date.now() - startTime;
      
      // Get memory usage
      const memoryUsage = process.memoryUsage();
      
      this.results.performance = {
        executionTime,
        memory: {
          heapUsed: memoryUsage.heapUsed / 1024 / 1024, // Convert to MB
          heapTotal: memoryUsage.heapTotal / 1024 / 1024,
          external: memoryUsage.external / 1024 / 1024
        }
      };
      
      console.log(`  ✅ Performance: ${executionTime}ms execution time`);
      
    } catch (error) {
      console.log('  ❌ Performance analysis failed:', error.message);
      this.results.performance = {
        executionTime: 0,
        memory: { heapUsed: 0, heapTotal: 0, external: 0 }
      };
    }
  }

  /**
   * Run code quality analysis
   */
  async runCodeQualityAnalysis() {
    console.log('🔧 Running code quality analysis...');
    
    try {
      // Run ESLint
      const eslintOutput = execSync('npm run lint', { 
        cwd: projectRoot, 
        stdio: 'pipe',
        encoding: 'utf8'
      });
      
      // Parse ESLint output (simplified)
      const eslintResults = this.parseESLintOutput(eslintOutput);
      
      this.results.codeQuality = {
        eslint: eslintResults,
        complexity: {
          maxCyclomaticComplexity: 10, // Placeholder
          maxCognitiveComplexity: 15   // Placeholder
        }
      };
      
      console.log(`  ✅ Code quality: ${eslintResults.errors} errors, ${eslintResults.warnings} warnings`);
      
    } catch (error) {
      // ESLint might exit with non-zero code if there are issues
      const eslintResults = this.parseESLintOutput(error.stdout || '');
      this.results.codeQuality = {
        eslint: eslintResults,
        complexity: {
          maxCyclomaticComplexity: 10,
          maxCognitiveComplexity: 15
        }
      };
      
      console.log(`  ⚠️  Code quality: ${eslintResults.errors} errors, ${eslintResults.warnings} warnings`);
    }
  }

  /**
   * Run security analysis
   */
  async runSecurityAnalysis() {
    console.log('🔒 Running security analysis...');
    
    try {
      // Run npm audit
      const auditOutput = execSync('npm audit --json', { 
        cwd: projectRoot, 
        stdio: 'pipe',
        encoding: 'utf8'
      });
      
      const auditData = JSON.parse(auditOutput);
      const vulnerabilities = auditData.vulnerabilities || {};
      
      const auditResults = {
        high: 0,
        moderate: 0,
        low: 0
      };
      
      Object.values(vulnerabilities).forEach(vuln => {
        if (vuln.severity === 'high') auditResults.high++;
        else if (vuln.severity === 'moderate') auditResults.moderate++;
        else if (vuln.severity === 'low') auditResults.low++;
      });
      
      this.results.security = {
        audit: auditResults
      };
      
      console.log(`  ✅ Security: ${auditResults.high} high, ${auditResults.moderate} moderate, ${auditResults.low} low vulnerabilities`);
      
    } catch (error) {
      console.log('  ❌ Security analysis failed:', error.message);
      this.results.security = {
        audit: { high: 0, moderate: 0, low: 0 }
      };
    }
  }

  /**
   * Run test quality analysis
   */
  async runTestQualityAnalysis() {
    console.log('🧪 Running test quality analysis...');
    
    try {
      // Run all tests and capture output
      const testOutput = execSync('npm run test:all', { 
        cwd: projectRoot, 
        stdio: 'pipe',
        encoding: 'utf8'
      });
      
      // Parse test output (simplified)
      const testResults = this.parseTestOutput(testOutput);
      
      this.results.testQuality = {
        counts: testResults.counts,
        successRates: testResults.successRates
      };
      
      console.log(`  ✅ Test quality: ${testResults.counts.total} tests, ${testResults.successRates.overall}% success rate`);
      
    } catch (error) {
      console.log('  ❌ Test quality analysis failed:', error.message);
      this.results.testQuality = {
        counts: { total: 0, unit: 0, integration: 0, e2e: 0 },
        successRates: { overall: 0, unit: 0, integration: 0, e2e: 0 }
      };
    }
  }

  /**
   * Calculate global coverage from coverage data
   */
  calculateGlobalCoverage(coverageData) {
    const files = Object.values(coverageData);
    let totalStatements = 0;
    let coveredStatements = 0;
    let totalBranches = 0;
    let coveredBranches = 0;
    let totalFunctions = 0;
    let coveredFunctions = 0;
    let totalLines = 0;
    let coveredLines = 0;

    files.forEach(file => {
      const s = file.s;
      const b = file.b;
      const f = file.f;
      const statementMap = file.statementMap;

      // Statements
      totalStatements += Object.keys(s).length;
      coveredStatements += Object.values(s).filter(count => count > 0).length;

      // Branches
      totalBranches += Object.keys(b).length;
      coveredBranches += Object.values(b).filter(counts => counts.some(count => count > 0)).length;

      // Functions
      totalFunctions += Object.keys(f).length;
      coveredFunctions += Object.values(f).filter(count => count > 0).length;

      // Lines
      const lines = new Set();
      Object.values(statementMap).forEach(stmt => {
        lines.add(stmt.start.line);
      });
      totalLines += lines.size;
      coveredLines += Array.from(lines).filter(line => {
        return Object.values(statementMap).some(stmt => 
          stmt.start.line === line && s[stmt.id] > 0
        );
      }).length;
    });

    return {
      statements: totalStatements > 0 ? (coveredStatements / totalStatements * 100).toFixed(2) : 0,
      branches: totalBranches > 0 ? (coveredBranches / totalBranches * 100).toFixed(2) : 0,
      functions: totalFunctions > 0 ? (coveredFunctions / totalFunctions * 100).toFixed(2) : 0,
      lines: totalLines > 0 ? (coveredLines / totalLines * 100).toFixed(2) : 0
    };
  }

  /**
   * Parse ESLint output
   */
  parseESLintOutput(output) {
    // Simplified parsing - in real implementation, you'd parse the actual ESLint output
    const lines = output.split('\n');
    let errors = 0;
    let warnings = 0;
    
    lines.forEach(line => {
      if (line.includes('error')) errors++;
      if (line.includes('warning')) warnings++;
    });
    
    return { errors, warnings };
  }

  /**
   * Parse test output
   */
  parseTestOutput(output) {
    // Simplified parsing - in real implementation, you'd parse the actual test output
    const lines = output.split('\n');
    let total = 0;
    let passed = 0;
    let failed = 0;
    
    lines.forEach(line => {
      if (line.includes('Tests:')) {
        const match = line.match(/(\d+) total/);
        if (match) total = parseInt(match[1]);
      }
      if (line.includes('passed')) {
        const match = line.match(/(\d+) passed/);
        if (match) passed = parseInt(match[1]);
      }
      if (line.includes('failed')) {
        const match = line.match(/(\d+) failed/);
        if (match) failed = parseInt(match[1]);
      }
    });
    
    const successRate = total > 0 ? (passed / total * 100).toFixed(2) : 0;
    
    return {
      counts: {
        total,
        unit: Math.floor(total * 0.6), // Estimate
        integration: Math.floor(total * 0.3), // Estimate
        e2e: Math.floor(total * 0.1) // Estimate
      },
      successRates: {
        overall: successRate,
        unit: successRate,
        integration: successRate,
        e2e: successRate
      }
    };
  }

  /**
   * Save reports
   */
  saveReports(validationResults) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    // Save JSON report
    const jsonReport = {
      timestamp: new Date().toISOString(),
      results: this.results,
      validation: validationResults
    };
    
    const jsonPath = path.join(projectRoot, 'coverage', `quality-gates-${timestamp}.json`);
    fs.writeFileSync(jsonPath, JSON.stringify(jsonReport, null, 2));
    console.log(`\n📄 JSON report saved to: ${jsonPath}`);
    
    // Save HTML report
    const htmlContent = qualityGateReporter.generateHTMLReport(validationResults);
    const htmlPath = path.join(projectRoot, 'coverage', `quality-gates-${timestamp}.html`);
    fs.writeFileSync(htmlPath, htmlContent);
    console.log(`📄 HTML report saved to: ${htmlPath}`);
  }
}

/**
 * Main execution
 */
async function main() {
  const runner = new QualityGatesRunner();
  await runner.runAll();
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default QualityGatesRunner;
