const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    mode: 'development',
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
                        ]
                    }
                }
            }
        ]
    },
    optimization: {
        minimize: false, // No minification in development
        splitChunks: false
    },
    plugins: [
        // Clean dist folder before build
        new CleanWebpackPlugin(),
        
        // Copy static files
        new CopyWebpackPlugin({
            patterns: [
                // Copy manifest files
                { from: 'manifest.json', to: 'manifest.json' },
                
                // Copy HTML files
                { from: 'popup.html', to: 'popup.html' },
                { from: 'popup.css', to: 'popup.css' },
                
                // Copy icons
                { from: 'icons', to: 'icons' },
                
                // Copy lib folder (all JavaScript files)
                { from: 'lib', to: 'lib' },
                
                // Copy documentation files
                { from: 'README.md', to: 'README.md' },
                { from: 'package.json', to: 'package.json' },
                { from: 'INSTALLATION.md', to: 'INSTALLATION.md' },
                
                // Copy documentation files (optional)
                { from: '*.md', to: '[name][ext]', noErrorOnMissing: true }
            ]
        })
    ],
    resolve: {
        extensions: ['.js']
    },
    // Source maps for debugging in development
    devtool: 'source-map',
    // Performance hints
    performance: {
        hints: false // Disable performance hints in development
    }
};
