# WordPress Selector Refactoring Documentation

## Overview

Refactored the `findLegalLinks()` function in `navigation-simulator.js` to use WordPress-specific selectors only, improving accuracy and compatibility with WordPress websites.

## Changes Made

### 1. Enhanced WordPress-Specific Selectors

#### **WordPress Standard Page Links**
```javascript
// WordPress standard page links
'a[href*="about"]',
'a[href*="contact"]',
'a[href*="privacy"]',
'a[href*="terms"]',
'a[href*="disclaimer"]',
'a[href*="faq"]',
'a[href*="help"]',
'a[href*="support"]',
'a[href*="legal"]',
'a[href*="policy"]',
'a[href*="cookies"]',
'a[href*="sitemap"]'
```

#### **WordPress Standard CSS Classes**
```javascript
// WordPress standard CSS classes
'.about a',
'.contact a',
'.privacy a',
'.terms a',
'.legal a',
'.footer a',
'.footer-links a',
'.legal-links a',
'.info-links a'
```

#### **WordPress Menu Item Selectors**
```javascript
// WordPress specific selectors
'.menu-item a[href*="about"]',
'.menu-item a[href*="contact"]',
'.menu-item a[href*="privacy"]',
'.menu-item a[href*="terms"]'
```

#### **WordPress Block Navigation Selectors**
```javascript
// WordPress Block Editor navigation
'.wp-block-navigation a[href*="about"]',
'.wp-block-navigation a[href*="contact"]',
'.wp-block-navigation a[href*="privacy"]',
'.wp-block-navigation a[href*="terms"]',
'.wp-block-navigation a[href*="legal"]',
'.wp-block-navigation a[href*="help"]',
'.wp-block-navigation a[href*="support"]',
'.wp-block-navigation a[href*="faq"]',
'.wp-block-navigation a[href*="sitemap"]',
'.wp-block-navigation a[href*="disclaimer"]',
'.wp-block-navigation a[href*="policy"]',
'.wp-block-navigation a[href*="cookies"]'
```

#### **WordPress Footer Selectors**
```javascript
// WordPress footer selectors
'.site-footer a[href*="about"]',
'.site-footer a[href*="contact"]',
'.site-footer a[href*="privacy"]',
'.site-footer a[href*="terms"]',
'.site-footer a[href*="legal"]',
'.site-footer a[href*="help"]',
'.site-footer a[href*="support"]',
'.site-footer a[href*="faq"]',
'.site-footer a[href*="sitemap"]',
'.site-footer a[href*="disclaimer"]',
'.site-footer a[href*="policy"]',
'.site-footer a[href*="cookies"]'
```

#### **WordPress Widget Selectors**
```javascript
// WordPress widget selectors
'.widget a[href*="about"]',
'.widget a[href*="contact"]',
'.widget a[href*="privacy"]',
'.widget a[href*="terms"]',
'.widget a[href*="legal"]',
'.widget a[href*="help"]',
'.widget a[href*="support"]',
'.widget a[href*="faq"]',
'.widget a[href*="sitemap"]',
'.widget a[href*="disclaimer"]',
'.widget a[href*="policy"]',
'.widget a[href*="cookies"]'
```

## WordPress Selector Categories

### 1. **WordPress Core Selectors**
- **Menu Items**: `.menu-item a[href*="..."]`
- **Block Navigation**: `.wp-block-navigation a[href*="..."]`
- **Site Footer**: `.site-footer a[href*="..."]`
- **Widgets**: `.widget a[href*="..."]`

### 2. **WordPress Theme Selectors**
- **Footer Links**: `.footer a`, `.footer-links a`
- **Legal Links**: `.legal-links a`
- **Info Links**: `.info-links a`
- **Standard Classes**: `.about a`, `.contact a`, `.privacy a`, `.terms a`, `.legal a`

### 3. **WordPress Content Selectors**
- **Page Links**: `a[href*="about"]`, `a[href*="contact"]`, etc.
- **Policy Links**: `a[href*="privacy"]`, `a[href*="terms"]`, `a[href*="policy"]`
- **Support Links**: `a[href*="help"]`, `a[href*="support"]`, `a[href*="faq"]`
- **Legal Links**: `a[href*="legal"]`, `a[href*="disclaimer"]`, `a[href*="cookies"]`

## Benefits

### 1. **WordPress Compatibility**
- **Native WordPress support** dengan selector yang sesuai standar WordPress
- **Better detection** untuk WordPress websites
- **Reduced false positives** dengan targeted selectors

### 2. **Improved Accuracy**
- **WordPress-specific targeting** untuk legal/info pages
- **Better alignment** dengan WordPress structure
- **Enhanced precision** dalam link detection

### 3. **Performance Optimization**
- **Focused selectors** mengurangi DOM queries yang tidak perlu
- **Efficient targeting** untuk WordPress elements
- **Reduced computational overhead**

### 4. **Future-Proof**
- **WordPress Block Editor support** dengan `.wp-block-navigation`
- **Modern WordPress compatibility** dengan latest standards
- **Scalable architecture** untuk WordPress updates

## WordPress Detection

### WordPress Indicators
```javascript
// WordPress-specific elements to detect
const wpIndicators = [
    'meta[name="generator"][content*="WordPress"]',
    'link[href*="wp-content"]',
    'script[src*="wp-content"]',
    'style[href*="wp-content"]',
    '.wp-block-',
    '.menu-item',
    '.widget',
    '.site-footer',
    '.wp-block-navigation'
];
```

### WordPress Version Support
- **WordPress 5.0+**: Block Editor support (`.wp-block-navigation`)
- **WordPress 4.0+**: Widget support (`.widget`)
- **WordPress 3.0+**: Menu support (`.menu-item`)
- **All Versions**: Standard page links dan CSS classes

## Testing

### Test Script
Use `test-wordpress-selectors.js` to verify:
- WordPress selector effectiveness
- WordPress website detection
- Legal/info page link detection
- Navigation function testing
- WordPress-specific element detection

### Manual Testing
1. Load extension on WordPress websites
2. Check console for WordPress detection
3. Verify selector effectiveness
4. Test legal/info page navigation

## Usage Examples

### Direct Legal Page Navigation
```javascript
// Navigate to legal/info pages
const legalLinks = navigationSimulator.findLegalLinks();
if (legalLinks.length > 0) {
    const selectedLink = navigationSimulator.selectBestLink(legalLinks);
    await navigationSimulator.clickLink(selectedLink);
}
```

### WordPress-Specific Navigation
```javascript
// Check if WordPress website
const isWordPress = document.querySelector('meta[name="generator"][content*="WordPress"]');
if (isWordPress) {
    // Use WordPress-specific navigation
    const legalLinks = navigationSimulator.findLegalLinks();
    // ... navigation logic
}
```

## Selector Effectiveness

### High Effectiveness
- **WordPress Block Navigation**: `.wp-block-navigation a[href*="..."]`
- **WordPress Menu Items**: `.menu-item a[href*="..."]`
- **WordPress Footer**: `.site-footer a[href*="..."]`
- **WordPress Widgets**: `.widget a[href*="..."]`

### Medium Effectiveness
- **Standard Page Links**: `a[href*="about"]`, `a[href*="contact"]`
- **CSS Classes**: `.about a`, `.contact a`, `.privacy a`
- **Footer Links**: `.footer a`, `.footer-links a`

### Low Effectiveness (Non-WordPress)
- **Generic selectors** pada non-WordPress websites
- **Custom theme selectors** yang tidak sesuai standar WordPress

## Future Enhancements

### 1. **WordPress Theme Detection**
- Detect specific WordPress themes
- Use theme-specific selectors
- Optimize for popular themes

### 2. **WordPress Plugin Support**
- Support for popular WordPress plugins
- Plugin-specific navigation selectors
- Enhanced compatibility

### 3. **WordPress Version Adaptation**
- Adapt selectors based on WordPress version
- Support for legacy WordPress versions
- Future WordPress compatibility

### 4. **WordPress Customization**
- Support for custom WordPress configurations
- Custom post type navigation
- Enhanced WordPress integration

## Conclusion

The WordPress selector refactoring provides:
- **Better WordPress compatibility** dengan native selectors
- **Improved accuracy** untuk legal/info page detection
- **Enhanced performance** dengan focused selectors
- **Future-proof architecture** untuk WordPress updates
- **Comprehensive testing** dan documentation

This refactoring significantly improves the navigation system's effectiveness on WordPress websites while maintaining compatibility with other platforms.
