const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const __DEV__ = process.env.NODE_ENV === 'development';
const __PROD__ = process.env.NODE_ENV === 'production';

function getEnv() {
  const ret = {};
  Object.keys(process.env).forEach(name => {
    if (name.startsWith('PD_PUBLIC_')) {
      ret['process.env.' + name.replace('PD_PUBLIC_', '')] = JSON.stringify(
        process.env[name]
      );
    }
  });
  return ret;
}

module.exports = {
  mode: __DEV__ ? 'development' : 'production',
  target: 'web',
  entry: process.env.BUILD_SOLUTION ? './src/solution-index' : './src/index',
  devtool: __DEV__ ? 'cheap-module-source-map' : false,
  output: {
    filename: '[name].[fullhash].js',
    chunkFilename: '[name].[fullhash].js',
    path: __dirname + '/build',
  },
  stats: 'errors-only',
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  devServer: {
    compress: true,
    port: process.env.PORT ?? 4010,
    hot: true,
    stats: 'errors-only',
    historyApiFallback: true,
  },
  module: {
    rules: [
      {
        test: /\.(t|j)sx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      ...getEnv(),
    }),
    new CleanWebpackPlugin(),
    !process.env.BUILD_SOLUTION &&
      new HtmlWebpackPlugin({
        title: 'Your awesome app',
      }),
  ].filter(Boolean),
};
