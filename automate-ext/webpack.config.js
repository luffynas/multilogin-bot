const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    mode: 'production',
    entry: {
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
                        reserved: ['chrome', 'window', 'document']
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
                { from: 'manifest-pwa.json', to: 'manifest-pwa.json' },
                
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
