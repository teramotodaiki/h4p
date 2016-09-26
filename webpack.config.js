const webpack = require('webpack');

const exportVarName = process.env.EXPORT_VAR_NAME || "h4p";
const cssPrefix = process.env.CSS_PREFIX || (exportVarName + "__");

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
      }
    ]
  },
  resolve: {
    extensions: ['', '.js', '.jsx']
  },
  plugins: [
    new webpack.DefinePlugin({
      EXPORT_VAR_NAME: JSON.stringify(exportVarName),
      CSS_PREFIX: JSON.stringify(cssPrefix),
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
}

module.exports = config;
