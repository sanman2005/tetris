/* global __dirname */
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const StartServerWebpackPlugin = require('start-server-webpack-plugin');
const autoprefixer = require('autoprefixer');
const path = require('path');
const buildConfig = require('./build.config');
const srcPath = path.resolve(__dirname, '../', buildConfig.srcPath);

require('dotenv').config();

const isServer = process.env.NODE_MODE === 'server';
let env = process.env.NODE_ENV;

if (!env) {
  process.env.NODE_ENV = env = 'production';
}

const isProd = env === 'production';
const isDevServer = process.argv.some(v => v.includes('webpack-dev-server'));
const localPort = isServer ? 3001 : 3000;

process.env.APP_MODE = process.env.APP_MODE || 'work';

module.exports = {
  mode: isProd ? 'production' : 'development',
  entry: isServer
    ? {
        server: path.resolve(srcPath, './js/server/server.ts'),
      }
    : {
        client: path.resolve(srcPath, './js/client.tsx'),
      },
  output: {
    filename: () => `[name]${isServer ? '' : '.[hash:8]'}.js`,
    publicPath: '/',
  },
  target: isServer ? 'node' : 'web',
  resolve: {
    extensions: [
      '.ts',
      '.tsx',
      '.js',
      '.jsx',
      '.json',
      '.styl',
      '.css',
      '.svg',
    ],
    alias: {
      api: path.resolve(srcPath, './js/api'),
      components: path.resolve(srcPath, './js/components'),
      config: path.resolve('./'),
      css: path.resolve(srcPath, './css'),
      img: path.resolve(srcPath, './img'),
      js: path.resolve(srcPath, './js'),
      models: path.resolve(srcPath, './js/models'),
      node: path.resolve(__dirname, '../node_modules'),
      pages: path.resolve(srcPath, './js/pages'),
    },
    mainFields: ['module', 'main'],
  },
  node: {
    net: 'empty',
    tls: 'empty',
    dns: 'empty',
  },
  plugins: [
    ...(isServer
      ? [
          new CleanWebpackPlugin(),
          new StartServerWebpackPlugin({
            name: 'server.js',
            nodeArgs: [],
            args: [],
            signal: true,
            keyboard: true,
          }),
        ]
      : [
          new HtmlWebpackPlugin({
            template: `${srcPath}/static/index.html`,
            hmr: !isProd,
            scriptLoading: 'defer',
          }),
          new MiniCssExtractPlugin({
            filename: '[name].[hash:8].css',
            chunkFilename: '[id].css',
            hmr: !isProd,
          }),
          new CopyWebpackPlugin([
            {
              from: `${srcPath}/static`,
              to: './',
            },
            {
              from: `${srcPath}/manifest.json`,
              to: './',
            },
            {
              from: `${srcPath}/img`,
              to: './img',
            },
          ]),
        ]),
    new webpack.DefinePlugin(
      Object.keys(process.env).reduce(
        (result, key) => ({
          ...result,
          [`process.env.${key}`]: JSON.stringify(process.env[key]),
        }),
        {},
      ),
    ),
  ],
  devtool: !isProd && 'source-map',
  devServer: {
    historyApiFallback: true,
    host: '0.0.0.0',
    hot: true,
    open: !isServer,
    overlay: true,
    pfx: './certificate/localhost.pfx',
    pfxPassphrase: 'localhost',
    port: localPort,
    publicPath: '/',
    public: `localhost:${localPort}`,
    writeToDisk: isServer,
  },
  optimization: {
    minimize: isProd,
  },
  module: {
    rules: [
      {
        test: /\.m?jsx?$/,
        type: 'javascript/auto',
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        enforce: 'pre',
        loader: 'tslint-loader',
        options: {
          configFile: path.resolve(__dirname, './eslint.config.json'),
        },
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'awesome-typescript-loader',
            options: {
              configFileName: path.resolve(__dirname, './tsconfig.json'),
            },
          },
          {
            loader: 'source-map-loader',
          },
        ],
      },
      {
        test: /\.(styl(us)?|css)$/,
        use: [
          isProd ? MiniCssExtractPlugin.loader : 'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => [autoprefixer],
            },
          },
          'stylus-loader',
        ],
      },
      {
        test: /\.svg$/,
        loader: 'svg-react-loader',
      },
    ],
  },
  watch: isDevServer,
  watchOptions: {
    poll: true,
    ignored: /node_modules/,
  },
};
