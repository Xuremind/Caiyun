const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

function getEntrySources(sources) {
  if (process.env.NODE_ENV !== 'production') {
    sources.push('webpack-hot-middleware/client?http://localhost:8080');
    sources.push('webpack/hot/dev-server');
  }
  return sources;
}

const basePlugins = [
  new webpack.DefinePlugin({
    __DEV__: process.env.NODE_ENV !== 'production',
    __PRODUCTION__: process.env.NODE_ENV === 'production',
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  }),
  new HtmlWebpackPlugin({
    template: './src/index.html',
    inject: 'body',
  }),
  new ExtractTextPlugin('style.css', { allChunks: true }),
];

const devPlugins = [
  new webpack.NoErrorsPlugin(),
];

const prodPlugins = [
  new webpack.optimize.OccurenceOrderPlugin(),
  new webpack.optimize.UglifyJsPlugin({
    compressor: {
      warnings: false,
    },
  }),
];

const plugins = basePlugins
  .concat(process.env.NODE_ENV === 'production' ? prodPlugins : [])
  .concat(process.env.NODE_ENV === 'development' ? devPlugins : []);
const devtool = process.env.NODE_ENV === 'production' ? false : 'source-map';
// css local
// https://medium.com/seek-ui-engineering/the-end-of-global-css-90d2a4a06284#.c2jl6jmb8
// and https://github.com/camsong/blog/issues/5
const localIdentName = process.env.NODE_ENV === 'development' ? '[path]___[name]__[local]-[hash:base64:5]' : '[hash:base64:5]';

module.exports = {
  entry: getEntrySources(['./src/index.js']),
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].[hash].js',
    publicPath: '/',
    sourceMapFilename: '[name].[hash].js.map',
    chunkFilename: '[id].chunk.js',
  },
  devServer: {
    historyApiFallback: { index: '/' },
  },
  externals: {
    'react': 'React',
    'react-dom': 'ReactDOM',
    'react-router': 'ReactRouter',
    'react-redux': 'ReactRedux'
  },
  module: {
    preLoaders: [
     { test: /\.js$/, loader: 'source-map-loader' },
     { test: /\.js$/, loader: 'eslint-loader', exclude: /node_modules/ },
    ],
    loaders: [
      { test: /\.scss$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader?modules&importLoaders=1&localIdentName=' + localIdentName + '!sass-loader')},
      // { test: /\.css$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader?modules&importLoaders=1&localIdentName='+localIdentName) },
      { test: /\.json$/, loader: 'json-loader' },
      { test: /\.jsx?$/, loader: 'babel', include: path.join(__dirname, 'src'), exclude: /node_modules/},
      { test: /\.(png|jpg|jpeg|gif|svg)$/, loader: 'url-loader?prefix=img/&limit=1000' },
      { test: /\.(woff|woff2|ttf|eot)$/, loader: 'url-loader?prefix=font/&limit=5000' },
    ],
  },
  devtool: devtool,
  plugins: plugins,
  resolve: {
    extensions: ['', '.js', '.json', '.jsx', 'png', 'jpg', 'jpeg'],
    alias: {
        images: path.resolve( __dirname, 'src/assets/images' ),
        svgs: path.resolve( __dirname, 'src/assets/svgs' ),
    }
  },
};
