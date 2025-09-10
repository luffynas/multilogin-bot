/**
 * Script untuk mengumpulkan sample HTML navigation dari berbagai website
 * Digunakan untuk menganalisis pattern navigation dan mengoptimalkan selector
 */

function collectNavigationHTML() {
    console.log('🔍 Collecting Navigation HTML...');
    
    const navigationData = {
        website: window.location.hostname,
        url: window.location.href,
        timestamp: Date.now(),
        pageTitle: document.title,
        navigationElements: [],
        paginationElements: [],
        breadcrumbElements: [],
        menuElements: [],
        linkElements: [],
        buttonElements: [],
        analysis: {}
    };
    
    console.log(`📊 Analyzing navigation for: ${navigationData.website}`);
    
    // 1. Collect Navigation Elements
    console.log('\n--- 1. Collecting Navigation Elements ---');
    const navSelectors = [
        'nav', '.navigation', '.nav', '.pagination', '.pager',
        '.breadcrumb', '.breadcrumbs', '.menu', '.navbar',
        '.page-nav', '.post-nav', '.article-nav', '.forum-nav'
    ];
    
    navSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            navigationData.navigationElements.push({
                selector: selector,
                outerHTML: element.outerHTML,
                innerHTML: element.innerHTML,
                className: element.className,
                id: element.id,
                tagName: element.tagName
            });
        });
    });
    
    console.log(`✅ Found ${navigationData.navigationElements.length} navigation elements`);
    
    // 2. Collect Pagination Elements
    console.log('\n--- 2. Collecting Pagination Elements ---');
    const paginationSelectors = [
        '.pagination', '.pager', '.page-numbers', '.nav-links',
        '.wp-pagenavi', '.pagination-wrapper', '.pagination-container'
    ];
    
    paginationSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            navigationData.paginationElements.push({
                selector: selector,
                outerHTML: element.outerHTML,
                innerHTML: element.innerHTML,
                className: element.className,
                id: element.id
            });
        });
    });
    
    console.log(`✅ Found ${navigationData.paginationElements.length} pagination elements`);
    
    // 3. Collect Link Elements (potential navigation)
    console.log('\n--- 3. Collecting Link Elements ---');
    const linkSelectors = [
        'a[rel="next"]', 'a[rel="prev"]', 'a[rel="previous"]',
        'a.next', 'a.prev', 'a.previous',
        'a.next-page', 'a.prev-page', 'a.previous-page',
        'a.nextpostslink', 'a.previouspostslink',
        'a.pagination-link', 'a.pager-btn'
    ];
    
    linkSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            navigationData.linkElements.push({
                selector: selector,
                text: element.textContent.trim(),
                href: element.href,
                className: element.className,
                id: element.id,
                outerHTML: element.outerHTML
            });
        });
    });
    
    console.log(`✅ Found ${navigationData.linkElements.length} potential navigation links`);
    
    // 4. Collect Button Elements (potential navigation)
    console.log('\n--- 4. Collecting Button Elements ---');
    const buttonSelectors = [
        'button.next', 'button.prev', 'button.previous',
        'button.next-page', 'button.prev-page',
        'button.pagination', 'button.pager',
        'button[onclick*="next"]', 'button[onclick*="prev"]'
    ];
    
    buttonSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            navigationData.buttonElements.push({
                selector: selector,
                text: element.textContent.trim(),
                className: element.className,
                id: element.id,
                onclick: element.onclick ? element.onclick.toString() : null,
                outerHTML: element.outerHTML
            });
        });
    });
    
    console.log(`✅ Found ${navigationData.buttonElements.length} potential navigation buttons`);
    
    // 5. Content-Based Search
    console.log('\n--- 5. Content-Based Search ---');
    const contentPatterns = [
        'Next', 'Previous', 'Next Page', 'Previous Page',
        'Next Post', 'Previous Post', 'Next Article', 'Previous Article',
        '→', '←', '»', '«', '>', '<',
        'Next →', '← Previous', 'Next »', '« Previous'
    ];
    
    const contentBasedLinks = [];
    contentPatterns.forEach(pattern => {
        const elements = document.querySelectorAll('a, button');
        elements.forEach(element => {
            if (element.textContent.trim().includes(pattern)) {
                contentBasedLinks.push({
                    pattern: pattern,
                    text: element.textContent.trim(),
                    href: element.href || null,
                    className: element.className,
                    tagName: element.tagName,
                    outerHTML: element.outerHTML
                });
            }
        });
    });
    
    console.log(`✅ Found ${contentBasedLinks.length} content-based navigation elements`);
    
    // 6. URL Pattern Analysis
    console.log('\n--- 6. URL Pattern Analysis ---');
    const urlPatterns = [
        /\/page\/\d+/, /\/p\/\d+/, /\/\d+/,
        /\?page=\d+/, /\?p=\d+/, /\?page=\d+&/,
        /\/next/, /\/prev/, /\/previous/,
        /\/article\/\d+/, /\/post\/\d+/, /\/blog\/\d+/
    ];
    
    const urlBasedLinks = [];
    const allLinks = document.querySelectorAll('a[href]');
    allLinks.forEach(link => {
        const href = link.href;
        urlPatterns.forEach(pattern => {
            if (pattern.test(href)) {
                urlBasedLinks.push({
                    pattern: pattern.toString(),
                    href: href,
                    text: link.textContent.trim(),
                    className: link.className,
                    outerHTML: link.outerHTML
                });
            }
        });
    });
    
    console.log(`✅ Found ${urlBasedLinks.length} URL-based navigation links`);
    
    // 7. Analysis
    console.log('\n--- 7. Analysis ---');
    navigationData.analysis = {
        totalNavigationElements: navigationData.navigationElements.length,
        totalPaginationElements: navigationData.paginationElements.length,
        totalLinkElements: navigationData.linkElements.length,
        totalButtonElements: navigationData.buttonElements.length,
        contentBasedLinks: contentBasedLinks.length,
        urlBasedLinks: urlBasedLinks.length,
        websiteType: detectWebsiteType(),
        navigationType: detectNavigationType(),
        hasNextLink: navigationData.linkElements.some(link => 
            link.selector.includes('next') || link.text.toLowerCase().includes('next')
        ),
        hasPrevLink: navigationData.linkElements.some(link => 
            link.selector.includes('prev') || link.text.toLowerCase().includes('prev')
        ),
        recommendedSelectors: generateRecommendedSelectors()
    };
    
    // 8. Generate Report
    console.log('\n--- 8. Navigation Analysis Report ---');
    console.log(`🌐 Website: ${navigationData.website}`);
    console.log(`📄 Page: ${navigationData.pageTitle}`);
    console.log(`🔗 URL: ${navigationData.url}`);
    console.log(`📊 Total Elements: ${navigationData.analysis.totalNavigationElements}`);
    console.log(`📄 Pagination Elements: ${navigationData.analysis.totalPaginationElements}`);
    console.log(`🔗 Link Elements: ${navigationData.analysis.totalLinkElements}`);
    console.log(`🔘 Button Elements: ${navigationData.analysis.totalButtonElements}`);
    console.log(`📝 Content-Based Links: ${navigationData.analysis.contentBasedLinks}`);
    console.log(`🔗 URL-Based Links: ${navigationData.analysis.urlBasedLinks}`);
    console.log(`🏷️ Website Type: ${navigationData.analysis.websiteType}`);
    console.log(`🧭 Navigation Type: ${navigationData.analysis.navigationType}`);
    console.log(`✅ Has Next Link: ${navigationData.analysis.hasNextLink}`);
    console.log(`✅ Has Prev Link: ${navigationData.analysis.hasPrevLink}`);
    
    console.log('\n--- 9. Recommended Selectors ---');
    navigationData.analysis.recommendedSelectors.forEach(selector => {
        console.log(`  - ${selector}`);
    });
    
    // 9. Export Data
    console.log('\n--- 10. Exporting Data ---');
    const exportData = {
        ...navigationData,
        contentBasedLinks: contentBasedLinks,
        urlBasedLinks: urlBasedLinks
    };
    
    // Save to localStorage for analysis
    const storageKey = `navigation_html_${navigationData.website}_${Date.now()}`;
    localStorage.setItem(storageKey, JSON.stringify(exportData));
    console.log(`💾 Data saved to localStorage with key: ${storageKey}`);
    
    // Copy to clipboard
    navigator.clipboard.writeText(JSON.stringify(exportData, null, 2)).then(() => {
        console.log('📋 Data copied to clipboard!');
    }).catch(err => {
        console.log('❌ Failed to copy to clipboard:', err);
    });
    
    return exportData;
}

function detectWebsiteType() {
    const hostname = window.location.hostname;
    const title = document.title.toLowerCase();
    const body = document.body.innerHTML.toLowerCase();
    
    if (hostname.includes('wordpress') || body.includes('wp-content') || body.includes('wp-includes')) {
        return 'WordPress';
    } else if (hostname.includes('shop') || body.includes('add to cart') || body.includes('buy now')) {
        return 'E-commerce';
    } else if (body.includes('forum') || body.includes('discussion') || body.includes('topic')) {
        return 'Forum';
    } else if (body.includes('news') || body.includes('article') || body.includes('blog')) {
        return 'News/Blog';
    } else if (hostname.includes('gov') || hostname.includes('edu')) {
        return 'Government/Education';
    } else {
        return 'Unknown';
    }
}

function detectNavigationType() {
    const hasPagination = document.querySelector('.pagination, .pager, .page-numbers');
    const hasBreadcrumb = document.querySelector('.breadcrumb, .breadcrumbs');
    const hasMenu = document.querySelector('.menu, .navbar, .nav');
    
    if (hasPagination) return 'Pagination';
    if (hasBreadcrumb) return 'Breadcrumb';
    if (hasMenu) return 'Menu';
    return 'Unknown';
}

function generateRecommendedSelectors() {
    const selectors = [];
    
    // Check for existing selectors
    const existingSelectors = [
        'a[rel="next"]', 'a[rel="prev"]',
        '.next', '.prev', '.previous',
        '.next-page', '.prev-page', '.previous-page',
        '.pagination .next', '.pagination .prev',
        '.page-nav .next', '.page-nav .prev'
    ];
    
    existingSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
            selectors.push(selector);
        }
    });
    
    // Add content-based selectors
    const contentPatterns = ['Next', 'Previous', '→', '←', '»', '«'];
    contentPatterns.forEach(pattern => {
        const elements = document.querySelectorAll('a, button');
        elements.forEach(element => {
            if (element.textContent.trim().includes(pattern)) {
                const className = element.className;
                if (className) {
                    selectors.push(`.${className.split(' ')[0]}`);
                }
            }
        });
    });
    
    return [...new Set(selectors)]; // Remove duplicates
}

// Auto-run collection
collectNavigationHTML();
