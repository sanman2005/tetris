const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
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
const isDevServer = process.argv.some((v) => v.includes('webpack-dev-server'));
const localPort = isServer ? 4001 : 4000;

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
    publicPath: '/',
    path: path.resolve(
      __dirname,
      '../',
      isServer ? buildConfig.buildServerPath : buildConfig.buildPath,
    ),
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
    new CleanWebpackPlugin(),
    ...(isServer
      ? isProd
        ? []
        : [
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
  devServer: isDevServer
    ? {
        historyApiFallback: true,
        host: '0.0.0.0',
        hot: !isServer,
        open: !isServer,
        overlay: true,
        port: localPort,
        publicPath: '/',
        public: `localhost:${localPort}`,
        writeToDisk: isServer,
      }
    : {},
  optimization: {
    minimize: isProd,
  },
  module: {
    rules: [
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
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env',
                '@babel/preset-react',
                '@babel/preset-typescript',
              ],
              plugins: [
                '@babel/plugin-proposal-class-properties',
                '@babel/plugin-proposal-object-rest-spread',
              ],
            },
          },
          {
            loader: 'ts-loader',
            options: {
              context: path.resolve(__dirname, '../'),
              configFile: path.resolve(__dirname, './tsconfig.json'),
            },
          },
        ],
      },
      {
        test: /\.(styl(us)?|css)$/,
        use: [
          'style-loader',
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
      {
        test: /\.(png|jpe?g|gif)$/,
        loader: 'file-loader',
        options: {
          emitFile: false,
        },
      },
    ],
  },
  watch: isDevServer,
  watchOptions: {
    poll: true,
    ignored: /node_modules/,
  },
};
