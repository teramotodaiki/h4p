const webpack = require('webpack');

const exportVarName = process.env.EXPORT_VAR_NAME || "h4p";
const cssPrefix = process.env.CSS_PREFIX || (exportVarName + "__");

const currentVer = 'alpha-2';

const config = {
  entry: {
    h4p: './src/main'
  },
  output: {
    path: __dirname + '/dist/',
    filename: '[name].js'
  },
  module: {
    loaders: [
      {
        test: /\.(jsx?)$/,
        loaders: ["babel"],
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        loaders: ["style", "css"]
      },
      {
        test: /\.scss$/,
        loaders: ["style", "css", "sass"]
      },
      {
        test: /\.html$/,
        loaders: ["mustache"]
      }
    ]
  },
  resolve: {
    extensions: ['', '.js', '.jsx', '.html']
  },
  plugins: [
    new webpack.DefinePlugin({
      EXPORT_VAR_NAME: JSON.stringify(exportVarName),
      CSS_PREFIX: JSON.stringify(cssPrefix),
      CORE_CDN_URL: JSON.stringify(`https://embed.hackforplay.xyz/open-source/core/${currentVer}.js`),
      'process.env': {
        'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
      }
    })
  ],
  sassLoader: {
    data: `$prefix: ${cssPrefix};`
  },
  devServer: {
    contentBase: 'dist',
    port: process.env.PORT
  },
};

if (process.env.NODE_ENV === 'production') {
  const uglify = new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false
    }
  });
  config.plugins.push(uglify);

  // CDN upload file
  config.entry[currentVer] = config.entry.h4p;
}

module.exports = config;
