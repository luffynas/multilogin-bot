/**
 * Script untuk menganalisis pattern navigation dari sample HTML yang dikumpulkan
 * Digunakan untuk mengoptimalkan selector navigation
 */

function analyzeNavigationPatterns() {
    console.log('🔍 Analyzing Navigation Patterns...');
    
    // Get all navigation data from localStorage
    const navigationData = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('navigation_html_')) {
            try {
                const data = JSON.parse(localStorage.getItem(key));
                navigationData.push(data);
            } catch (e) {
                console.warn(`Failed to parse data for key: ${key}`);
            }
        }
    }
    
    console.log(`📊 Found ${navigationData.length} navigation data entries`);
    
    if (navigationData.length === 0) {
        console.log('❌ No navigation data found. Run collect-navigation-html.js first.');
        return;
    }
    
    // Analyze patterns
    const analysis = {
        totalWebsites: navigationData.length,
        websiteTypes: {},
        navigationTypes: {},
        commonSelectors: {},
        commonClasses: {},
        commonTexts: {},
        commonURLs: {},
        recommendations: {}
    };
    
    // 1. Website Type Analysis
    console.log('\n--- 1. Website Type Analysis ---');
    navigationData.forEach(data => {
        const type = data.analysis.websiteType;
        analysis.websiteTypes[type] = (analysis.websiteTypes[type] || 0) + 1;
    });
    
    Object.entries(analysis.websiteTypes).forEach(([type, count]) => {
        console.log(`  ${type}: ${count} websites`);
    });
    
    // 2. Navigation Type Analysis
    console.log('\n--- 2. Navigation Type Analysis ---');
    navigationData.forEach(data => {
        const type = data.analysis.navigationType;
        analysis.navigationTypes[type] = (analysis.navigationTypes[type] || 0) + 1;
    });
    
    Object.entries(analysis.navigationTypes).forEach(([type, count]) => {
        console.log(`  ${type}: ${count} websites`);
    });
    
    // 3. Common Selectors Analysis
    console.log('\n--- 3. Common Selectors Analysis ---');
    navigationData.forEach(data => {
        data.analysis.recommendedSelectors.forEach(selector => {
            analysis.commonSelectors[selector] = (analysis.commonSelectors[selector] || 0) + 1;
        });
    });
    
    const sortedSelectors = Object.entries(analysis.commonSelectors)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 20);
    
    console.log('Top 20 most common selectors:');
    sortedSelectors.forEach(([selector, count]) => {
        console.log(`  ${selector}: ${count} websites`);
    });
    
    // 4. Common Classes Analysis
    console.log('\n--- 4. Common Classes Analysis ---');
    navigationData.forEach(data => {
        data.linkElements.forEach(link => {
            if (link.className) {
                const classes = link.className.split(' ');
                classes.forEach(cls => {
                    if (cls.trim()) {
                        analysis.commonClasses[cls] = (analysis.commonClasses[cls] || 0) + 1;
                    }
                });
            }
        });
    });
    
    const sortedClasses = Object.entries(analysis.commonClasses)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 20);
    
    console.log('Top 20 most common classes:');
    sortedClasses.forEach(([cls, count]) => {
        console.log(`  .${cls}: ${count} occurrences`);
    });
    
    // 5. Common Text Analysis
    console.log('\n--- 5. Common Text Analysis ---');
    navigationData.forEach(data => {
        data.linkElements.forEach(link => {
            if (link.text) {
                const text = link.text.toLowerCase().trim();
                if (text) {
                    analysis.commonTexts[text] = (analysis.commonTexts[text] || 0) + 1;
                }
            }
        });
    });
    
    const sortedTexts = Object.entries(analysis.commonTexts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 20);
    
    console.log('Top 20 most common link texts:');
    sortedTexts.forEach(([text, count]) => {
        console.log(`  "${text}": ${count} occurrences`);
    });
    
    // 6. Common URL Patterns Analysis
    console.log('\n--- 6. Common URL Patterns Analysis ---');
    navigationData.forEach(data => {
        data.linkElements.forEach(link => {
            if (link.href) {
                const url = new URL(link.href);
                const pathname = url.pathname;
                const search = url.search;
                
                // Extract patterns
                const patterns = [
                    pathname.match(/\/page\/(\d+)/),
                    pathname.match(/\/p\/(\d+)/),
                    pathname.match(/\/\d+/),
                    search.match(/[?&]page=(\d+)/),
                    search.match(/[?&]p=(\d+)/)
                ];
                
                patterns.forEach(pattern => {
                    if (pattern) {
                        const patternStr = pattern[0];
                        analysis.commonURLs[patternStr] = (analysis.commonURLs[patternStr] || 0) + 1;
                    }
                });
            }
        });
    });
    
    const sortedURLs = Object.entries(analysis.commonURLs)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10);
    
    console.log('Top 10 most common URL patterns:');
    sortedURLs.forEach(([pattern, count]) => {
        console.log(`  ${pattern}: ${count} occurrences`);
    });
    
    // 7. Generate Recommendations
    console.log('\n--- 7. Generating Recommendations ---');
    analysis.recommendations = generateRecommendations(analysis);
    
    console.log('🎯 Recommended Selectors:');
    analysis.recommendations.selectors.forEach(selector => {
        console.log(`  - ${selector}`);
    });
    
    console.log('\n🎯 Recommended Classes:');
    analysis.recommendations.classes.forEach(cls => {
        console.log(`  - .${cls}`);
    });
    
    console.log('\n🎯 Recommended Text Patterns:');
    analysis.recommendations.textPatterns.forEach(pattern => {
        console.log(`  - "${pattern}"`);
    });
    
    // 8. Export Analysis
    console.log('\n--- 8. Exporting Analysis ---');
    const exportData = {
        analysis: analysis,
        timestamp: Date.now(),
        summary: {
            totalWebsites: analysis.totalWebsites,
            mostCommonWebsiteType: Object.entries(analysis.websiteTypes).sort(([,a], [,b]) => b - a)[0],
            mostCommonNavigationType: Object.entries(analysis.navigationTypes).sort(([,a], [,b]) => b - a)[0],
            topSelector: sortedSelectors[0],
            topClass: sortedClasses[0],
            topText: sortedTexts[0]
        }
    };
    
    // Save to localStorage
    const storageKey = `navigation_analysis_${Date.now()}`;
    localStorage.setItem(storageKey, JSON.stringify(exportData));
    console.log(`💾 Analysis saved to localStorage with key: ${storageKey}`);
    
    // Copy to clipboard
    navigator.clipboard.writeText(JSON.stringify(exportData, null, 2)).then(() => {
        console.log('📋 Analysis copied to clipboard!');
    }).catch(err => {
        console.log('❌ Failed to copy to clipboard:', err);
    });
    
    return exportData;
}

function generateRecommendations(analysis) {
    const recommendations = {
        selectors: [],
        classes: [],
        textPatterns: [],
        urlPatterns: []
    };
    
    // Selector recommendations based on frequency
    const topSelectors = Object.entries(analysis.commonSelectors)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10);
    
    topSelectors.forEach(([selector, count]) => {
        if (count >= 2) { // Only include selectors that appear in at least 2 websites
            recommendations.selectors.push(selector);
        }
    });
    
    // Class recommendations
    const topClasses = Object.entries(analysis.commonClasses)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 15);
    
    topClasses.forEach(([cls, count]) => {
        if (count >= 3) { // Only include classes that appear in at least 3 websites
            recommendations.classes.push(cls);
        }
    });
    
    // Text pattern recommendations
    const topTexts = Object.entries(analysis.commonTexts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10);
    
    topTexts.forEach(([text, count]) => {
        if (count >= 2) { // Only include texts that appear in at least 2 websites
            recommendations.textPatterns.push(text);
        }
    });
    
    // URL pattern recommendations
    const topURLs = Object.entries(analysis.commonURLs)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);
    
    topURLs.forEach(([pattern, count]) => {
        if (count >= 2) { // Only include URL patterns that appear in at least 2 websites
            recommendations.urlPatterns.push(pattern);
        }
    });
    
    return recommendations;
}

// Auto-run analysis
analyzeNavigationPatterns();
