#!/usr/bin/env node

/**
 * Coverage Analysis Script
 * Analyzes test coverage and generates detailed reports
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { qualityGates, qualityGateValidators, qualityGateReporter } from '../quality.gates.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

/**
 * Coverage analysis class
 */
class CoverageAnalyzer {
  constructor() {
    this.coverageData = null;
    this.analysisResults = null;
  }

  /**
   * Load coverage data from JSON file
   */
  loadCoverageData() {
    const coveragePath = path.join(projectRoot, 'coverage', 'coverage-final.json');
    
    if (!fs.existsSync(coveragePath)) {
      console.error('❌ Coverage data not found. Run tests with coverage first.');
      process.exit(1);
    }

    try {
      const coverageContent = fs.readFileSync(coveragePath, 'utf8');
      this.coverageData = JSON.parse(coverageContent);
      console.log('✅ Coverage data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading coverage data:', error.message);
      process.exit(1);
    }
  }

  /**
   * Analyze coverage data
   */
  analyzeCoverage() {
    if (!this.coverageData) {
      throw new Error('Coverage data not loaded');
    }

    const analysis = {
      global: this.calculateGlobalCoverage(),
      byModule: this.calculateModuleCoverage(),
      byFile: this.calculateFileCoverage(),
      uncovered: this.findUncoveredCode(),
      recommendations: this.generateRecommendations()
    };

    this.analysisResults = analysis;
    return analysis;
  }

  /**
   * Calculate global coverage metrics
   */
  calculateGlobalCoverage() {
    const files = Object.values(this.coverageData);
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
      const branchMap = file.branchMap;
      const fnMap = file.fnMap;

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
      statements: {
        total: totalStatements,
        covered: coveredStatements,
        percentage: totalStatements > 0 ? (coveredStatements / totalStatements * 100).toFixed(2) : 0
      },
      branches: {
        total: totalBranches,
        covered: coveredBranches,
        percentage: totalBranches > 0 ? (coveredBranches / totalBranches * 100).toFixed(2) : 0
      },
      functions: {
        total: totalFunctions,
        covered: coveredFunctions,
        percentage: totalFunctions > 0 ? (coveredFunctions / totalFunctions * 100).toFixed(2) : 0
      },
      lines: {
        total: totalLines,
        covered: coveredLines,
        percentage: totalLines > 0 ? (coveredLines / totalLines * 100).toFixed(2) : 0
      }
    };
  }

  /**
   * Calculate coverage by module
   */
  calculateModuleCoverage() {
    const moduleCoverage = {};
    const files = Object.entries(this.coverageData);

    files.forEach(([filePath, fileData]) => {
      const module = this.getModuleFromPath(filePath);
      if (!moduleCoverage[module]) {
        moduleCoverage[module] = {
          files: 0,
          statements: { total: 0, covered: 0 },
          branches: { total: 0, covered: 0 },
          functions: { total: 0, covered: 0 },
          lines: { total: 0, covered: 0 }
        };
      }

      moduleCoverage[module].files++;
      
      // Calculate metrics for this file
      const s = fileData.s;
      const b = fileData.b;
      const f = fileData.f;
      const statementMap = fileData.statementMap;

      // Statements
      const totalStatements = Object.keys(s).length;
      const coveredStatements = Object.values(s).filter(count => count > 0).length;
      moduleCoverage[module].statements.total += totalStatements;
      moduleCoverage[module].statements.covered += coveredStatements;

      // Branches
      const totalBranches = Object.keys(b).length;
      const coveredBranches = Object.values(b).filter(counts => counts.some(count => count > 0)).length;
      moduleCoverage[module].branches.total += totalBranches;
      moduleCoverage[module].branches.covered += coveredBranches;

      // Functions
      const totalFunctions = Object.keys(f).length;
      const coveredFunctions = Object.values(f).filter(count => count > 0).length;
      moduleCoverage[module].functions.total += totalFunctions;
      moduleCoverage[module].functions.covered += coveredFunctions;

      // Lines
      const lines = new Set();
      Object.values(statementMap).forEach(stmt => {
        lines.add(stmt.start.line);
      });
      const totalLines = lines.size;
      const coveredLines = Array.from(lines).filter(line => {
        return Object.values(statementMap).some(stmt => 
          stmt.start.line === line && s[stmt.id] > 0
        );
      }).length;
      moduleCoverage[module].lines.total += totalLines;
      moduleCoverage[module].lines.covered += coveredLines;
    });

    // Calculate percentages
    Object.keys(moduleCoverage).forEach(module => {
      const data = moduleCoverage[module];
      data.statements.percentage = data.statements.total > 0 ? 
        (data.statements.covered / data.statements.total * 100).toFixed(2) : 0;
      data.branches.percentage = data.branches.total > 0 ? 
        (data.branches.covered / data.branches.total * 100).toFixed(2) : 0;
      data.functions.percentage = data.functions.total > 0 ? 
        (data.functions.covered / data.functions.total * 100).toFixed(2) : 0;
      data.lines.percentage = data.lines.total > 0 ? 
        (data.lines.covered / data.lines.total * 100).toFixed(2) : 0;
    });

    return moduleCoverage;
  }

  /**
   * Calculate coverage by file
   */
  calculateFileCoverage() {
    const fileCoverage = {};
    const files = Object.entries(this.coverageData);

    files.forEach(([filePath, fileData]) => {
      const s = fileData.s;
      const b = fileData.b;
      const f = fileData.f;
      const statementMap = fileData.statementMap;

      // Calculate metrics
      const totalStatements = Object.keys(s).length;
      const coveredStatements = Object.values(s).filter(count => count > 0).length;
      const totalBranches = Object.keys(b).length;
      const coveredBranches = Object.values(b).filter(counts => counts.some(count => count > 0)).length;
      const totalFunctions = Object.keys(f).length;
      const coveredFunctions = Object.values(f).filter(count => count > 0).length;

      // Lines
      const lines = new Set();
      Object.values(statementMap).forEach(stmt => {
        lines.add(stmt.start.line);
      });
      const totalLines = lines.size;
      const coveredLines = Array.from(lines).filter(line => {
        return Object.values(statementMap).some(stmt => 
          stmt.start.line === line && s[stmt.id] > 0
        );
      }).length;

      fileCoverage[filePath] = {
        statements: {
          total: totalStatements,
          covered: coveredStatements,
          percentage: totalStatements > 0 ? (coveredStatements / totalStatements * 100).toFixed(2) : 0
        },
        branches: {
          total: totalBranches,
          covered: coveredBranches,
          percentage: totalBranches > 0 ? (coveredBranches / totalBranches * 100).toFixed(2) : 0
        },
        functions: {
          total: totalFunctions,
          covered: coveredFunctions,
          percentage: totalFunctions > 0 ? (coveredFunctions / totalFunctions * 100).toFixed(2) : 0
        },
        lines: {
          total: totalLines,
          covered: coveredLines,
          percentage: totalLines > 0 ? (coveredLines / totalLines * 100).toFixed(2) : 0
        }
      };
    });

    return fileCoverage;
  }

  /**
   * Find uncovered code
   */
  findUncoveredCode() {
    const uncovered = [];
    const files = Object.entries(this.coverageData);

    files.forEach(([filePath, fileData]) => {
      const s = fileData.s;
      const b = fileData.b;
      const f = fileData.f;
      const statementMap = fileData.statementMap;
      const branchMap = fileData.branchMap;
      const fnMap = fileData.fnMap;

      // Uncovered statements
      Object.entries(s).forEach(([id, count]) => {
        if (count === 0) {
          const stmt = statementMap[id];
          uncovered.push({
            type: 'statement',
            file: filePath,
            line: stmt.start.line,
            column: stmt.start.column,
            id: id
          });
        }
      });

      // Uncovered branches
      Object.entries(b).forEach(([id, counts]) => {
        if (counts.every(count => count === 0)) {
          const branch = branchMap[id];
          uncovered.push({
            type: 'branch',
            file: filePath,
            line: branch.loc.start.line,
            column: branch.loc.start.column,
            id: id
          });
        }
      });

      // Uncovered functions
      Object.entries(f).forEach(([id, count]) => {
        if (count === 0) {
          const fn = fnMap[id];
          uncovered.push({
            type: 'function',
            file: filePath,
            line: fn.loc.start.line,
            column: fn.loc.start.column,
            id: id
          });
        }
      });
    });

    return uncovered;
  }

  /**
   * Generate recommendations
   */
  generateRecommendations() {
    const recommendations = [];
    const global = this.analysisResults.global;

    // Coverage recommendations
    if (global.statements.percentage < 80) {
      recommendations.push({
        type: 'coverage',
        priority: 'high',
        message: `Statement coverage is ${global.statements.percentage}%. Target: 80%+`,
        action: 'Add more unit tests to cover uncovered statements'
      });
    }

    if (global.branches.percentage < 80) {
      recommendations.push({
        type: 'coverage',
        priority: 'high',
        message: `Branch coverage is ${global.branches.percentage}%. Target: 80%+`,
        action: 'Add tests for conditional branches and edge cases'
      });
    }

    if (global.functions.percentage < 80) {
      recommendations.push({
        type: 'coverage',
        priority: 'medium',
        message: `Function coverage is ${global.functions.percentage}%. Target: 80%+`,
        action: 'Add tests for uncovered functions'
      });
    }

    if (global.lines.percentage < 80) {
      recommendations.push({
        type: 'coverage',
        priority: 'medium',
        message: `Line coverage is ${global.lines.percentage}%. Target: 80%+`,
        action: 'Add tests to cover uncovered lines'
      });
    }

    // Module-specific recommendations
    Object.entries(this.analysisResults.byModule).forEach(([module, data]) => {
      if (data.statements.percentage < 80) {
        recommendations.push({
          type: 'module',
          priority: 'medium',
          message: `${module} module has low statement coverage: ${data.statements.percentage}%`,
          action: `Focus on testing ${module} module`
        });
      }
    });

    return recommendations;
  }

  /**
   * Get module name from file path
   */
  getModuleFromPath(filePath) {
    const relativePath = path.relative(projectRoot, filePath);
    const parts = relativePath.split(path.sep);
    
    if (parts[0] === 'src' && parts.length > 1) {
      return parts[1];
    }
    
    return 'other';
  }

  /**
   * Generate coverage report
   */
  generateReport() {
    if (!this.analysisResults) {
      throw new Error('Analysis not performed');
    }

    const report = {
      timestamp: new Date().toISOString(),
      global: this.analysisResults.global,
      byModule: this.analysisResults.byModule,
      byFile: this.analysisResults.byFile,
      uncovered: this.analysisResults.uncovered,
      recommendations: this.analysisResults.recommendations,
      qualityGates: qualityGateValidators.validateCoverage(this.analysisResults.global)
    };

    return report;
  }

  /**
   * Save report to file
   */
  saveReport(report, format = 'json') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `coverage-analysis-${timestamp}.${format}`;
    const filepath = path.join(projectRoot, 'coverage', filename);

    let content;
    switch (format) {
      case 'json':
        content = JSON.stringify(report, null, 2);
        break;
      case 'html':
        content = this.generateHTMLReport(report);
        break;
      default:
        throw new Error(`Unsupported format: ${format}`);
    }

    fs.writeFileSync(filepath, content);
    console.log(`✅ Report saved to: ${filepath}`);
    return filepath;
  }

  /**
   * Generate HTML report
   */
  generateHTMLReport(report) {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Coverage Analysis Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; }
        .metric { margin: 10px 0; padding: 10px; border-left: 4px solid #ddd; }
        .metric-good { border-left-color: #28a745; }
        .metric-warning { border-left-color: #ffc107; }
        .metric-danger { border-left-color: #dc3545; }
        .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .table th { background-color: #f2f2f2; }
        .recommendation { background: #e9ecef; padding: 10px; margin: 10px 0; border-radius: 5px; }
        .priority-high { border-left: 4px solid #dc3545; }
        .priority-medium { border-left: 4px solid #ffc107; }
        .priority-low { border-left: 4px solid #28a745; }
    </style>
</head>
<body>
    <div class="header">
        <h1>📊 Coverage Analysis Report</h1>
        <p>Generated: ${report.timestamp}</p>
    </div>
    
    <h2>Global Coverage</h2>
    <div class="metric ${report.global.statements.percentage >= 80 ? 'metric-good' : report.global.statements.percentage >= 60 ? 'metric-warning' : 'metric-danger'}">
        <strong>Statements:</strong> ${report.global.statements.covered}/${report.global.statements.total} (${report.global.statements.percentage}%)
    </div>
    <div class="metric ${report.global.branches.percentage >= 80 ? 'metric-good' : report.global.branches.percentage >= 60 ? 'metric-warning' : 'metric-danger'}">
        <strong>Branches:</strong> ${report.global.branches.covered}/${report.global.branches.total} (${report.global.branches.percentage}%)
    </div>
    <div class="metric ${report.global.functions.percentage >= 80 ? 'metric-good' : report.global.functions.percentage >= 60 ? 'metric-warning' : 'metric-danger'}">
        <strong>Functions:</strong> ${report.global.functions.covered}/${report.global.functions.total} (${report.global.functions.percentage}%)
    </div>
    <div class="metric ${report.global.lines.percentage >= 80 ? 'metric-good' : report.global.lines.percentage >= 60 ? 'metric-warning' : 'metric-danger'}">
        <strong>Lines:</strong> ${report.global.lines.covered}/${report.global.lines.total} (${report.global.lines.percentage}%)
    </div>
    
    <h2>Coverage by Module</h2>
    <table class="table">
        <thead>
            <tr>
                <th>Module</th>
                <th>Files</th>
                <th>Statements</th>
                <th>Branches</th>
                <th>Functions</th>
                <th>Lines</th>
            </tr>
        </thead>
        <tbody>
            ${Object.entries(report.byModule).map(([module, data]) => `
                <tr>
                    <td>${module}</td>
                    <td>${data.files}</td>
                    <td>${data.statements.percentage}%</td>
                    <td>${data.branches.percentage}%</td>
                    <td>${data.functions.percentage}%</td>
                    <td>${data.lines.percentage}%</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
    
    <h2>Recommendations</h2>
    ${report.recommendations.map(rec => `
        <div class="recommendation priority-${rec.priority}">
            <strong>${rec.type.toUpperCase()}</strong> - ${rec.message}<br>
            <em>Action: ${rec.action}</em>
        </div>
    `).join('')}
    
    <h2>Quality Gates</h2>
    <div class="metric ${report.qualityGates.passed ? 'metric-good' : 'metric-danger'}">
        <strong>Status:</strong> ${report.qualityGates.passed ? '✅ PASSED' : '❌ FAILED'}
    </div>
</body>
</html>`;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🔍 Starting Coverage Analysis...\n');

  try {
    const analyzer = new CoverageAnalyzer();
    
    // Load and analyze coverage data
    analyzer.loadCoverageData();
    analyzer.analyzeCoverage();
    
    // Generate report
    const report = analyzer.generateReport();
    
    // Save reports
    analyzer.saveReport(report, 'json');
    analyzer.saveReport(report, 'html');
    
    // Display summary
    console.log('\n📊 Coverage Analysis Summary:');
    console.log('=============================');
    console.log(`Statements: ${report.global.statements.percentage}% (${report.global.statements.covered}/${report.global.statements.total})`);
    console.log(`Branches: ${report.global.branches.percentage}% (${report.global.branches.covered}/${report.global.branches.total})`);
    console.log(`Functions: ${report.global.functions.percentage}% (${report.global.functions.covered}/${report.global.functions.total})`);
    console.log(`Lines: ${report.global.lines.percentage}% (${report.global.lines.covered}/${report.global.lines.total})`);
    
    console.log('\n🎯 Quality Gates:');
    console.log(`Status: ${report.qualityGates.passed ? '✅ PASSED' : '❌ FAILED'}`);
    
    if (report.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      report.recommendations.forEach(rec => {
        console.log(`  ${rec.priority.toUpperCase()}: ${rec.message}`);
      });
    }
    
    console.log('\n✅ Coverage analysis completed successfully!');
    
  } catch (error) {
    console.error('❌ Coverage analysis failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default CoverageAnalyzer;
