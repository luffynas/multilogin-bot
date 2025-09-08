const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'production',
  entry: {
    background: './src/background.js',
    injector: './src/injector-enhanced.js',
    inpage: './src/inpage-enhanced.js',
    popup: './src/popup.js',
    modules: [
      './src/modules/scroll-behavior.js',
      './src/modules/stealth-detector.js',
      './src/modules/url-analyzer.js',
      './src/modules/storage-manager.js',
      './src/modules/settings-ui.js'
    ]
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle_[contenthash].js',
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
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    // Generate hashed filenames for inpage bundle
    new webpack.BannerPlugin({
      banner: '/* Enhanced Stealth Scroll Extension - Injected Script */',
      raw: true,
      include: /inpage\.bundle\.js$/
    }),
    // Generate hashed filenames for modules bundle
    new webpack.BannerPlugin({
      banner: '/* Enhanced Stealth Scroll Extension - Modules */',
      raw: true,
      include: /modules\.bundle\.js$/
    })
  ],
  optimization: {
    minimize: true,
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        },
        modules: {
          test: /[\\/]src[\\/]modules[\\/]/,
          name: 'modules',
          chunks: 'all'
        }
      }
    }
  },
  resolve: {
    extensions: ['.js'],
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  devtool: false, // No source maps in production
  target: 'web'
};
