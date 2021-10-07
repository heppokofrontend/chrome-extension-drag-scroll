// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require('path');

const isProduction = process.env.NODE_ENV == 'production';


const config = {
  entry: {
    content: './src/content/content.ts',
    popup: './src/popup/popup.ts',
    worker: './src/worker/worker.ts',
  },
  output: {
    path: path.resolve(__dirname, 'package'),
  },
  plugins: [
    // Add your plugins here
    // Learn more about plugins from https://webpack.js.org/configuration/plugins/
  ],
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/i,
        loader: 'ts-loader',
        exclude: ['/node_modules/'],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: 'asset',
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  devServer: {
    static: {
      directory: './',
      watch: true,
    },
    compress: true,
    port: 9000,
  },
};

module.exports = () => {
  config.mode = 'production';
  return config;
};
