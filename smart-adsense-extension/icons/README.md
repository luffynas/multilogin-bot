# Extension Icons

This directory contains the icon files for the AdSense Automation Pro browser extension.

## Required Icon Sizes

The extension requires the following icon sizes:

- `icon16.png` - 16x16 pixels
- `icon32.png` - 32x32 pixels  
- `icon48.png` - 48x48 pixels
- `icon128.png` - 128x128 pixels

## Icon Design Guidelines

### Design Concept
The icon should represent automation and AdSense optimization with a modern, professional appearance.

### Color Scheme
- Primary: #4285F4 (Google Blue)
- Secondary: #34A853 (Google Green)
- Accent: #FBBC04 (Google Yellow)
- Background: #FFFFFF (White)

### Design Elements
- Automation/robot symbol
- AdSense/ads representation
- Modern, clean design
- Scalable vector graphics recommended

## Creating Icons

### Using Design Software
1. Create a 128x128 pixel canvas
2. Design the icon with the specified color scheme
3. Export at all required sizes
4. Ensure icons are clear and recognizable at small sizes

### Using Online Tools
- [Favicon.io](https://favicon.io/) - Generate favicons from images
- [RealFaviconGenerator](https://realfavicongenerator.net/) - Comprehensive favicon generator
- [Icon Kitchen](https://icon.kitchen/) - Google's icon generator

### Icon Requirements
- Format: PNG
- Transparency: Supported
- Quality: High resolution, crisp edges
- File size: Optimized for web

## Placeholder Icons

Until custom icons are created, you can use placeholder icons or generate simple ones using:

```bash
# Using ImageMagick (if installed)
convert -size 16x16 xc:#4285F4 icon16.png
convert -size 32x32 xc:#4285F4 icon32.png
convert -size 48x48 xc:#4285F4 icon48.png
convert -size 128x128 xc:#4285F4 icon128.png
```

## Testing Icons

After creating icons:
1. Place them in this directory
2. Load the extension in your browser
3. Verify icons display correctly in:
   - Extension toolbar
   - Extension management page
   - Browser tabs (if applicable)

## Icon Updates

When updating icons:
1. Maintain the same filename
2. Ensure all sizes are updated
3. Test in both Chrome and Firefox
4. Update version number if needed
