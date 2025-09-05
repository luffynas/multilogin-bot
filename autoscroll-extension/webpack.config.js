const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    background: './src/background/background.js',
    content: './src/content/index.js',
    popup: './src/ui/popup/popup.js',
    options: './src/ui/options/options.js'
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
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: 'src/manifest.json',
          to: 'manifest.json'
        },
        {
          from: 'src/ui/popup/popup.html',
          to: 'popup.html'
        },
        {
          from: 'src/ui/options/options.html',
          to: 'options.html'
        },
        {
          from: 'src/ui/popup/popup.css',
          to: 'popup.css'
        },
        {
          from: 'src/ui/options/options.css',
          to: 'options.css'
        },
        {
          from: 'src/profiles',
          to: 'profiles'
        },
        {
          from: 'icons',
          to: 'icons'
        }
      ]
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@core': path.resolve(__dirname, 'src/core'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@strategies': path.resolve(__dirname, 'src/strategies'),
      '@adapters': path.resolve(__dirname, 'src/adapters'),
      '@stealth': path.resolve(__dirname, 'src/stealth'),
      '@detectors': path.resolve(__dirname, 'src/detectors'),
      '@navigation': path.resolve(__dirname, 'src/navigation'),
      '@analytics': path.resolve(__dirname, 'src/analytics'),
      '@ai': path.resolve(__dirname, 'src/ai')
    }
  },
  devtool: 'source-map',
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    }
  }
};
