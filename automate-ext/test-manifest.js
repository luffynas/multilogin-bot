/**
 * Test script to validate manifest.json
 */

// Read and parse manifest.json
const fs = require('fs');
const path = require('path');

try {
    const manifestPath = path.join(__dirname, 'manifest.json');
    const manifestContent = fs.readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(manifestContent);
    
    console.log('✅ Manifest.json is valid JSON');
    console.log('📋 Manifest details:');
    console.log(`   - Manifest version: ${manifest.manifest_version}`);
    console.log(`   - Name: ${manifest.name}`);
    console.log(`   - Version: ${manifest.version}`);
    console.log(`   - Background: ${manifest.background.service_worker}`);
    
    // Check required fields
    const requiredFields = ['manifest_version', 'name', 'version', 'background'];
    for (const field of requiredFields) {
        if (!manifest[field]) {
            throw new Error(`Missing required field: ${field}`);
        }
    }
    
    console.log('✅ All required fields present');
    
    // Check background service worker
    if (manifest.background && manifest.background.service_worker) {
        const swPath = path.join(__dirname, manifest.background.service_worker);
        if (fs.existsSync(swPath)) {
            console.log('✅ Background service worker file exists');
        } else {
            throw new Error(`Background service worker file not found: ${manifest.background.service_worker}`);
        }
    }
    
    // Check content scripts
    if (manifest.content_scripts && manifest.content_scripts.length > 0) {
        console.log(`✅ Content scripts configured: ${manifest.content_scripts.length} script(s)`);
        
        for (const script of manifest.content_scripts) {
            if (script.js) {
                for (const jsFile of script.js) {
                    const jsPath = path.join(__dirname, jsFile);
                    if (fs.existsSync(jsPath)) {
                        console.log(`   ✅ ${jsFile} exists`);
                    } else {
                        console.warn(`   ⚠️  ${jsFile} not found`);
                    }
                }
            }
        }
    }
    
    // Check icons
    if (manifest.icons) {
        console.log('✅ Icons configured');
        for (const [size, iconPath] of Object.entries(manifest.icons)) {
            const fullPath = path.join(__dirname, iconPath);
            if (fs.existsSync(fullPath)) {
                console.log(`   ✅ Icon ${size}: ${iconPath} exists`);
            } else {
                console.warn(`   ⚠️  Icon ${size}: ${iconPath} not found`);
            }
        }
    }
    
    console.log('\n🎉 Manifest validation completed successfully!');
    
} catch (error) {
    console.error('❌ Manifest validation failed:', error.message);
    process.exit(1);
}
