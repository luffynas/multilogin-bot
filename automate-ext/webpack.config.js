const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = (env, argv) => {
    const isProduction = argv.mode === 'production';
    
    return {
        mode: isProduction ? 'production' : 'development',
    entry: {
        // Main scripts
        'content-script': './content-script.js',
        'background': './background.js',
        'popup': './popup.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        clean: true
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ['@babel/preset-env', {
                                targets: {
                                    chrome: '88',
                                    firefox: '85'
                                }
                            }]
                        ],
                        plugins: isProduction ? [
                            // Remove console.log statements in production
                            ['transform-remove-console', {
                                exclude: ['error', 'warn']
                            }]
                        ] : []
                    }
                }
            }
        ]
    },
    optimization: {
        minimize: isProduction,
        minimizer: isProduction ? [
            new TerserPlugin({
                terserOptions: {
                    compress: {
                        // Remove console.log, console.info, console.debug in production
                        drop_console: true,
                        drop_debugger: true,
                        pure_funcs: ['console.log', 'console.info', 'console.debug'],
                        // Remove unused code
                        dead_code: true,
                        // Remove unused variables
                        unused: true,
                        // Remove unreachable code
                        passes: 2,
                        // Additional production optimizations
                        sequences: true,
                        conditionals: true,
                        booleans: true,
                        loops: true,
                        if_return: true,
                        join_vars: true,
                        side_effects: false
                    },
                    mangle: {
                        // Mangle variable names for obfuscation in production
                        toplevel: true,
                        reserved: [
                            'chrome', 'window', 'document', 'navigator', 'location',
                            'chrome.runtime', 'chrome.tabs', 'chrome.storage', 
                            'chrome.action', 'chrome.scripting', 'chrome.notifications',
                            'BackgroundManager', 'PageProcessor', 'PersonalityEngine',
                            'ContentAnalyzer', 'BehaviorSimulator', 'MouseSimulator',
                            'KeyboardSimulator', 'ReadingSimulator', 'NavigationSimulator',
                            'SessionManager', 'StealthMonitor', 'MLBehaviorEngine',
                            'AdvancedMousePhysics', 'NetworkTrafficSimulator',
                            'AdvancedBotEvasion', 'AnalyticsMonitor',
                            'DynamicAdaptationEngine', 'EnhancedFraudPrevention',
                            'StealthDelay', 'StealthStorage'
                        ]
                    },
                    format: {
                        // Remove all comments in production
                        comments: false,
                        // Minimize whitespace
                        beautify: false
                    }
                },
                extractComments: false
            })
        ] : [],
        // Disable code splitting to keep individual files
        splitChunks: false,
        // Production optimizations
        ...(isProduction && {
            // Enable tree shaking
            usedExports: true,
            providedExports: true,
            // Optimize module concatenation
            concatenateModules: true
        })
    },
    plugins: [
        // Clean dist folder before build
        new CleanWebpackPlugin(),
        
        // Copy static files
        new CopyWebpackPlugin({
            patterns: [
                // Copy manifest files
                { from: 'manifest.json', to: 'manifest.json' },
                { from: 'manifest-firefox.json', to: 'manifest-firefox.json' },
                
                // Copy HTML files
                { from: 'popup.html', to: 'popup.html' },
                { from: 'popup.css', to: 'popup.css' },
                
                // Copy icons
                { from: 'icons', to: 'icons' },
                
                // Copy lib folder (all JavaScript files)
                { from: 'lib', to: 'lib' },
                
                // Copy other assets
                { from: 'data', to: 'data', noErrorOnMissing: true },
                { from: 'assets', to: 'assets', noErrorOnMissing: true }
            ]
        })
    ],
    resolve: {
        extensions: ['.js']
    },
    // Source maps for debugging
    devtool: isProduction ? false : 'source-map',
    // Performance hints
    performance: {
        hints: isProduction ? 'error' : 'warning',
        maxEntrypointSize: isProduction ? 256000 : 512000, // Stricter limits for production
        maxAssetSize: isProduction ? 256000 : 512000
    },
    
    };
};
