const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    mode: 'production',
    entry: {
        // Main scripts
        'content-script': './content-script.js',
        'background': './background.js',
        'popup': './popup.js',
        
        // Library files
        'lib/personality-engine': './lib/personality-engine.js',
        'lib/adsense-detector': './lib/adsense-detector.js',
        'lib/behavior-simulator': './lib/behavior-simulator.js',
        'lib/mouse-simulator': './lib/mouse-simulator.js',
        'lib/keyboard-simulator': './lib/keyboard-simulator.js',
        'lib/reading-simulator': './lib/reading-simulator.js',
        'lib/navigation-simulator': './lib/navigation-simulator.js',
        'lib/session-manager': './lib/session-manager.js',
        'lib/stealth-monitor': './lib/stealth-monitor.js',
        'lib/ml-behavior-engine': './lib/ml-behavior-engine.js',
        'lib/advanced-mouse-physics': './lib/advanced-mouse-physics.js',
        'lib/network-traffic-simulator': './lib/network-traffic-simulator.js',
        'lib/advanced-bot-evasion': './lib/advanced-bot-evasion.js',
        'lib/multilogin-optimizer': './lib/multilogin-optimizer.js'
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
                        plugins: [
                            // Remove console.log statements in production
                            ['transform-remove-console', {
                                exclude: ['error', 'warn']
                            }]
                        ]
                    }
                }
            }
        ]
    },
    optimization: {
        minimize: true,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    compress: {
                        // Remove console.log, console.info, console.debug
                        drop_console: true,
                        drop_debugger: true,
                        pure_funcs: ['console.log', 'console.info', 'console.debug'],
                        // Remove unused code
                        dead_code: true,
                        // Remove unused variables
                        unused: true,
                        // Remove unreachable code
                        passes: 2
                    },
                    mangle: {
                        // Mangle variable names for obfuscation
                        toplevel: true,
                        reserved: [
                            'chrome', 'window', 'document', 'navigator', 'location',
                            'chrome.runtime', 'chrome.tabs', 'chrome.storage', 
                            'chrome.action', 'chrome.scripting', 'chrome.notifications',
                            'BackgroundManager', 'AdSenseAutomationPro', 'PersonalityEngine',
                            'AdSenseDetector', 'BehaviorSimulator', 'MouseSimulator',
                            'KeyboardSimulator', 'ReadingSimulator', 'NavigationSimulator',
                            'SessionManager', 'StealthMonitor', 'MLBehaviorEngine',
                            'AdvancedMousePhysics', 'NetworkTrafficSimulator',
                            'AdvancedBotEvasion', 'MultiloginOptimizer'
                        ]
                    },
                    format: {
                        // Remove all comments
                        comments: false
                    }
                },
                extractComments: false
            })
        ],
        // Split chunks for better caching
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                vendor: {
                    test: /[\\/]lib[\\/]/,
                    name: 'vendors',
                    chunks: 'all'
                }
            }
        }
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
                
                // Copy other assets
                { from: 'data', to: 'data', noErrorOnMissing: true },
                { from: 'assets', to: 'assets', noErrorOnMissing: true }
            ]
        })
    ],
    resolve: {
        extensions: ['.js']
    },
    // Source maps for debugging (optional - can be disabled for production)
    devtool: false,
    // Performance hints
    performance: {
        hints: 'warning',
        maxEntrypointSize: 512000,
        maxAssetSize: 512000
    }
};
