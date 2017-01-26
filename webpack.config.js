const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const exportVarName = process.env.EXPORT_VAR_NAME || "h4p";
const cssPrefix = process.env.CSS_PREFIX || (exportVarName + "__");

const CORE_VERSION = 'alpha-45d';
const corePrefix = 'h4p-';
const CORE_NAME = corePrefix + CORE_VERSION;
const CORE_CDN_PREFIX = 'https://embed.hackforplay.xyz/open-source/core/' + corePrefix;

const config = {
  entry: {
    h4p: [
      'babel-polyfill',
      'whatwg-fetch',
      './src/main'
    ],
  },
  output: {
    path: __dirname + '/dist/',
    filename: '[name].js',
    library: exportVarName,
    libraryTarget: 'umd',
  },
  module: {
    loaders: [
      {
        test: /\.(jsx?)$/,
        loaders: ["babel"],
        exclude: /node_modules|lib/,
      },
      {
        test: /\.css$/,
        loaders: ["style", "css"]
      },
      {
        test: /\.html$/,
        loaders: ["handlebars"]
      },
      {
        test: /\.json$/,
        loaders: ["json"]
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.html', '.json'],
    modules: [
      path.resolve('./src'),
      'node_modules'
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      CSS_PREFIX: JSON.stringify(cssPrefix),
      EXPORT_VAR_NAME: JSON.stringify(exportVarName),
      CORE_VERSION: JSON.stringify(CORE_VERSION),
      CORE_CDN_PREFIX: JSON.stringify(CORE_CDN_PREFIX),
      CORE_CDN_URL: JSON.stringify(`${CORE_CDN_PREFIX}${CORE_VERSION}.js`)
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false
    })
  ],
  devServer: {
    contentBase: 'dist',
    port: process.env.PORT
  },
};

if (process.env.NODE_ENV === 'production') {

  // for browser (& upload CDN)
  config.entry[CORE_NAME] = config.entry.h4p;
}

module.exports = config;
