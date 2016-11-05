const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const exportVarName = process.env.EXPORT_VAR_NAME || "h4p";
const cssPrefix = process.env.CSS_PREFIX || (exportVarName + "__");

const CORE_VERSION = 'alpha-23';
const CORE_NAME = 'h4p-' + CORE_VERSION;

const config = {
  entry: {
    h4p: './src/main', // for npm
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
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.html'],
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
      CORE_CDN_URL: JSON.stringify(`https://embed.hackforplay.xyz/open-source/core/${CORE_NAME}.js`)
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
