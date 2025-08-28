/**
 * Production Build Script for AdSense Automation Pro
 * Creates a completely clean production build without logs, comments, or debug info
 * Enhanced with aggressive minification for maximum obfuscation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ProductionBuilder {
    constructor() {
        this.sourceDir = '.';
        this.distDir = 'dist';
        this.buildConfig = {
            removeConsoleLogs: true,
            removeComments: true,
            minifyCode: true,
            obfuscateNames: true,
            removeDebugInfo: true,
            optimizePerformance: true,
            aggressiveMinification: true,
            obfuscateStrings: true,
            compressCode: true
        };
        
        // Variable name mapping for obfuscation
        this.variableMap = new Map();
        this.variableCounter = 0;
        this.stringMap = new Map();
        this.stringCounter = 0;
    }

    /**
     * Run complete production build
     */
    async build() {
        console.log('🚀 Starting Production Build with Aggressive Minification...\n');
        
        try {
            // Step 1: Clean previous builds
            this.cleanDist();
            
            // Step 2: Create dist directory
            this.createDistDirectory();
            
            // Step 3: Process and copy files
            await this.processFiles();
            
            // Step 4: Optimize manifests
            this.optimizeManifests();
            
            // Step 5: Create production packages
            this.createPackages();
            
            // Step 6: Generate build report
            this.generateBuildReport();
            
            console.log('\n✅ Production build completed successfully!');
            
        } catch (error) {
            console.error('❌ Build failed:', error);
            process.exit(1);
        }
    }

    /**
     * Clean dist directory
     */
    cleanDist() {
        console.log('🧹 Cleaning previous builds...');
        
        if (fs.existsSync(this.distDir)) {
            fs.rmSync(this.distDir, { recursive: true, force: true });
        }
    }

    /**
     * Create dist directory structure
     */
    createDistDirectory() {
        console.log('📁 Creating build directory...');
        
        fs.mkdirSync(this.distDir, { recursive: true });
        fs.mkdirSync(path.join(this.distDir, 'lib'), { recursive: true });
        fs.mkdirSync(path.join(this.distDir, 'icons'), { recursive: true });
        
        if (fs.existsSync('data')) {
            fs.mkdirSync(path.join(this.distDir, 'data'), { recursive: true });
        }
        
        if (fs.existsSync('assets')) {
            fs.mkdirSync(path.join(this.distDir, 'assets'), { recursive: true });
        }
    }

    /**
     * Process and copy files
     */
    async processFiles() {
        console.log('📝 Processing files with aggressive minification...');
        
        // Process JavaScript files
        await this.processJavaScriptFiles();
        
        // Copy static files
        this.copyStaticFiles();
        
        // Copy icons
        this.copyIcons();
        
        // Copy other assets
        this.copyAssets();
    }

    /**
     * Process JavaScript files for production
     */
    async processJavaScriptFiles() {
        const jsFiles = [
            'content-script.js',
            'background.js',
            'popup.js'
        ];
        
        const libFiles = fs.readdirSync('lib').filter(file => file.endsWith('.js'));
        
        // Process main files
        for (const file of jsFiles) {
            if (fs.existsSync(file)) {
                await this.processJavaScriptFile(file, '');
            }
        }
        
        // Process library files
        for (const file of libFiles) {
            await this.processJavaScriptFile(file, 'lib/');
        }
    }

    /**
     * Process individual JavaScript file
     */
    async processJavaScriptFile(fileName, subDir = '') {
        const sourcePath = path.join(this.sourceDir, subDir, fileName);
        const destPath = path.join(this.distDir, subDir, fileName);
        
        if (!fs.existsSync(sourcePath)) return;
        
        let content = fs.readFileSync(sourcePath, 'utf8');
        
        // Remove console.log statements (except errors and warnings)
        if (this.buildConfig.removeConsoleLogs) {
            content = this.removeConsoleLogs(content);
        }
        
        // Remove comments
        if (this.buildConfig.removeComments) {
            content = this.removeComments(content);
        }
        
        // Remove debug information
        if (this.buildConfig.removeDebugInfo) {
            content = this.removeDebugInfo(content);
        }
        
        // Aggressive minification
        if (this.buildConfig.aggressiveMinification) {
            content = this.aggressiveMinify(content);
        }
        
        // Obfuscate strings
        if (this.buildConfig.obfuscateStrings) {
            content = this.obfuscateStrings(content);
        }
        
        // Compress code
        if (this.buildConfig.compressCode) {
            content = this.compressCode(content);
        }
        
        // Ensure directory exists
        const destDir = path.dirname(destPath);
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }
        
        // Write processed file
        fs.writeFileSync(destPath, content);
        
        console.log(`  ✅ Processed: ${subDir}${fileName}`);
    }

    /**
     * Remove console.log statements
     */
    removeConsoleLogs(content) {
        // Remove console.log, console.info, console.debug
        content = content.replace(/console\.(log|info|debug)\s*\([^)]*\);?\s*/g, '');
        
        // Remove console.log with template literals
        content = content.replace(/console\.(log|info|debug)\s*`[^`]*`;?\s*/g, '');
        
        // Remove console.log with multiple arguments
        content = content.replace(/console\.(log|info|debug)\s*\([^)]*\);?\s*/g, '');
        
        // Keep console.error and console.warn for production debugging
        return content;
    }

    /**
     * Remove comments
     */
    removeComments(content) {
        // Remove single-line comments
        content = content.replace(/\/\/.*$/gm, '');
        
        // Remove multi-line comments
        content = content.replace(/\/\*[\s\S]*?\*\//g, '');
        
        // Remove JSDoc comments
        content = content.replace(/\/\*\*[\s\S]*?\*\//g, '');
        
        return content;
    }

    /**
     * Remove debug information
     */
    removeDebugInfo(content) {
        // Remove debug mode checks
        content = content.replace(/if\s*\(\s*this\.\w+\.debugMode\s*\)\s*\{[^}]*\}/g, '');
        
        // Remove debug logging
        content = content.replace(/console\.log\s*\(\s*['"`].*debug.*['"`]\s*\)/g, '');
        
        // Remove development-only code
        content = content.replace(/\/\*\s*DEV_ONLY\s*\*\/[\s\S]*?\/\*\s*END_DEV_ONLY\s*\*\//g, '');
        
        return content;
    }

    /**
     * Aggressive minification with obfuscation
     */
    aggressiveMinify(content) {
        // Remove all whitespace and newlines
        content = content.replace(/\s+/g, ' ');
        
        // Remove empty lines
        content = content.replace(/^\s*[\r\n]/gm, '');
        
        // Remove trailing whitespace
        content = content.replace(/\s+$/gm, '');
        
        // Remove unnecessary semicolons
        content = content.replace(/;+/g, ';');
        
        // Remove empty blocks
        content = content.replace(/\{\s*\}/g, '{}');
        
        // Remove unnecessary parentheses
        content = content.replace(/\(\s*([^)]+)\s*\)/g, '($1)');
        
        // Obfuscate variable names (basic)
        content = this.obfuscateVariableNames(content);
        
        // Compress function calls
        content = content.replace(/\s*\(\s*/g, '(');
        content = content.replace(/\s*\)\s*/g, ')');
        
        // Compress object properties
        content = content.replace(/\s*:\s*/g, ':');
        content = content.replace(/\s*,\s*/g, ',');
        
        return content.trim();
    }

    /**
     * Obfuscate variable names
     */
    obfuscateVariableNames(content) {
        // Generate short variable names
        const generateShortName = () => {
            const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
            let name = '';
            for (let i = 0; i < 2; i++) {
                name += chars[Math.floor(Math.random() * chars.length)];
            }
            return name;
        };

        // Find and replace variable names (basic implementation)
        const variablePattern = /\b(let|const|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g;
        const functionPattern = /\bfunction\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g;
        const classPattern = /\bclass\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g;

        // Replace variable declarations
        content = content.replace(variablePattern, (match, keyword, varName) => {
            if (!this.variableMap.has(varName)) {
                this.variableMap.set(varName, generateShortName());
            }
            return `${keyword} ${this.variableMap.get(varName)}`;
        });

        // Replace function names
        content = content.replace(functionPattern, (match, funcName) => {
            if (!this.variableMap.has(funcName)) {
                this.variableMap.set(funcName, generateShortName());
            }
            return `function ${this.variableMap.get(funcName)}`;
        });

        // Replace class names
        content = content.replace(classPattern, (match, className) => {
            if (!this.variableMap.has(className)) {
                this.variableMap.set(className, generateShortName());
            }
            return `class ${this.variableMap.get(className)}`;
        });

        // Replace variable usage (basic)
        for (const [originalName, obfuscatedName] of this.variableMap) {
            const regex = new RegExp(`\\b${originalName}\\b`, 'g');
            content = content.replace(regex, obfuscatedName);
        }

        return content;
    }

    /**
     * Obfuscate strings
     */
    obfuscateStrings(content) {
        // Find string literals and obfuscate them
        const stringPattern = /(['"`])((?:(?!\1)[^\\]|\\.)*)\1/g;
        
        content = content.replace(stringPattern, (match, quote, stringContent) => {
            // Skip if it's a console.error or console.warn
            if (match.includes('console.error') || match.includes('console.warn')) {
                return match;
            }
            
            // Skip if it's a short string (likely a property name)
            if (stringContent.length < 3) {
                return match;
            }
            
            // Generate obfuscated string
            const obfuscated = this.generateObfuscatedString(stringContent);
            return `${quote}${obfuscated}${quote}`;
        });

        return content;
    }

    /**
     * Generate obfuscated string
     */
    generateObfuscatedString(original) {
        // Simple string obfuscation using character codes
        return original.split('').map(char => {
            const code = char.charCodeAt(0);
            // Use different obfuscation for different character ranges
            if (code >= 65 && code <= 90) { // A-Z
                return String.fromCharCode(90 - (code - 65));
            } else if (code >= 97 && code <= 122) { // a-z
                return String.fromCharCode(122 - (code - 97));
            } else if (code >= 48 && code <= 57) { // 0-9
                return String.fromCharCode(57 - (code - 48));
            }
            return char;
        }).join('');
    }

    /**
     * Compress code further
     */
    compressCode(content) {
        // Remove all unnecessary whitespace
        content = content.replace(/\s+/g, ' ');
        
        // Remove spaces around operators
        content = content.replace(/\s*([+\-*/=<>!&|])\s*/g, '$1');
        
        // Remove spaces around dots
        content = content.replace(/\s*\.\s*/g, '.');
        
        // Remove spaces around brackets
        content = content.replace(/\s*\(\s*/g, '(');
        content = content.replace(/\s*\)\s*/g, ')');
        content = content.replace(/\s*\[\s*/g, '[');
        content = content.replace(/\s*\]\s*/g, ']');
        content = content.replace(/\s*\{\s*/g, '{');
        content = content.replace(/\s*\}\s*/g, '}');
        
        // Remove spaces around commas
        content = content.replace(/\s*,\s*/g, ',');
        
        // Remove spaces around semicolons
        content = content.replace(/\s*;\s*/g, ';');
        
        // Remove spaces around colons
        content = content.replace(/\s*:\s*/g, ':');
        
        // Remove leading/trailing whitespace
        content = content.trim();
        
        return content;
    }

    /**
     * Copy static files
     */
    copyStaticFiles() {
        const staticFiles = [
            'popup.html',
            'popup.css'
        ];
        
        staticFiles.forEach(file => {
            if (fs.existsSync(file)) {
                const content = fs.readFileSync(file, 'utf8');
                fs.writeFileSync(path.join(this.distDir, file), content);
                console.log(`  ✅ Copied: ${file}`);
            }
        });
    }

    /**
     * Copy icons
     */
    copyIcons() {
        const iconsDir = 'icons';
        const destIconsDir = path.join(this.distDir, 'icons');
        
        if (fs.existsSync(iconsDir)) {
            const files = fs.readdirSync(iconsDir);
            files.forEach(file => {
                const sourcePath = path.join(iconsDir, file);
                const destPath = path.join(destIconsDir, file);
                
                if (fs.statSync(sourcePath).isFile()) {
                    fs.copyFileSync(sourcePath, destPath);
                    console.log(`  ✅ Copied: icons/${file}`);
                }
            });
        }
    }

    /**
     * Copy other assets
     */
    copyAssets() {
        const assetDirs = ['data', 'assets'];
        
        assetDirs.forEach(dir => {
            if (fs.existsSync(dir)) {
                this.copyDirectory(dir, path.join(this.distDir, dir));
                console.log(`  ✅ Copied: ${dir}/`);
            }
        });
    }

    /**
     * Copy directory recursively
     */
    copyDirectory(source, destination) {
        if (!fs.existsSync(destination)) {
            fs.mkdirSync(destination, { recursive: true });
        }
        
        const files = fs.readdirSync(source);
        files.forEach(file => {
            const sourcePath = path.join(source, file);
            const destPath = path.join(destination, file);
            
            if (fs.statSync(sourcePath).isDirectory()) {
                this.copyDirectory(sourcePath, destPath);
            } else {
                fs.copyFileSync(sourcePath, destPath);
            }
        });
    }

    /**
     * Optimize manifest files for production
     */
    optimizeManifests() {
        console.log('📋 Optimizing manifests...');
        
        const manifests = [
            { source: 'manifest.json', dest: 'manifest.json' },
            { source: 'manifest-firefox.json', dest: 'manifest-firefox.json' },
            { source: 'manifest-pwa.json', dest: 'manifest-pwa.json' }
        ];
        
        manifests.forEach(({ source, dest }) => {
            if (fs.existsSync(source)) {
                const manifest = JSON.parse(fs.readFileSync(source, 'utf8'));
                
                // Remove development-specific properties
                delete manifest.$schema;
                delete manifest.devDependencies;
                
                // Optimize for production
                if (manifest.content_scripts) {
                    manifest.content_scripts.forEach(script => {
                        // Ensure scripts are in correct order
                        if (script.js) {
                            script.js = script.js.filter(file => fs.existsSync(path.join(this.distDir, file)));
                        }
                    });
                }
                
                fs.writeFileSync(path.join(this.distDir, dest), JSON.stringify(manifest, null, 2));
                console.log(`  ✅ Optimized: ${dest}`);
            }
        });
    }

    /**
     * Create production packages
     */
    createPackages() {
        console.log('📦 Creating packages...');
        
        try {
            // Create Chrome package
            execSync(`cd ${this.distDir} && zip -r adsense-automation-pro-chrome.zip . -x "manifest-firefox.json" "manifest-pwa.json"`, { stdio: 'inherit' });
            console.log('  ✅ Created: dist/adsense-automation-pro-chrome.zip');
            
            // Create Firefox package
            execSync(`cd ${this.distDir} && zip -r adsense-automation-pro-firefox.zip . -x "manifest.json" "manifest-pwa.json"`, { stdio: 'inherit' });
            console.log('  ✅ Created: dist/adsense-automation-pro-firefox.zip');
            
            // Create complete package
            execSync(`cd ${this.distDir} && zip -r adsense-automation-pro-complete.zip .`, { stdio: 'inherit' });
            console.log('  ✅ Created: dist/adsense-automation-pro-complete.zip');
            
        } catch (error) {
            console.warn('⚠️ Package creation failed, but build completed successfully');
        }
    }

    /**
     * Generate build report
     */
    generateBuildReport() {
        console.log('📊 Generating build report...');
        
        const report = {
            buildTime: new Date().toISOString(),
            buildConfig: this.buildConfig,
            files: this.getBuildStats(),
            optimization: {
                consoleLogsRemoved: this.buildConfig.removeConsoleLogs,
                commentsRemoved: this.buildConfig.removeComments,
                codeMinified: this.buildConfig.minifyCode,
                debugInfoRemoved: this.buildConfig.removeDebugInfo,
                aggressiveMinification: this.buildConfig.aggressiveMinification,
                stringsObfuscated: this.buildConfig.obfuscateStrings,
                codeCompressed: this.buildConfig.compressCode,
                variablesObfuscated: this.variableMap.size
            },
            obfuscationStats: {
                variablesObfuscated: this.variableMap.size,
                stringsObfuscated: this.stringMap.size
            }
        };
        
        fs.writeFileSync(path.join(this.distDir, 'build-report.json'), JSON.stringify(report, null, 2));
        console.log('  ✅ Generated: build-report.json');
    }

    /**
     * Get build statistics
     */
    getBuildStats() {
        const stats = {
            totalFiles: 0,
            totalSize: 0,
            jsFiles: 0,
            jsSize: 0
        };
        
        const countFiles = (dir) => {
            const files = fs.readdirSync(dir);
            files.forEach(file => {
                const filePath = path.join(dir, file);
                const stat = fs.statSync(filePath);
                
                if (stat.isDirectory()) {
                    countFiles(filePath);
                } else {
                    stats.totalFiles++;
                    stats.totalSize += stat.size;
                    
                    if (file.endsWith('.js')) {
                        stats.jsFiles++;
                        stats.jsSize += stat.size;
                    }
                }
            });
        };
        
        countFiles(this.distDir);
        
        return {
            ...stats,
            totalSizeKB: Math.round(stats.totalSize / 1024),
            jsSizeKB: Math.round(stats.jsSize / 1024)
        };
    }
}

// Run production build
const builder = new ProductionBuilder();
builder.build().catch(console.error);
