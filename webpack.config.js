const StylexPlugin = require('@stylexjs/webpack-plugin');
const path = require('path');

const config = (env, argv) => ({
  mode: 'production',
  entry: './_build/js/src/index.ts',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new StylexPlugin({
      filename: 'modai.css',
      dev: false,
      runtimeInjection: false,
      classNamePrefix: 'x',
      unstable_moduleResolution: {
        type: 'commonJS',
        rootDir: __dirname,
      },
    }),
  ],
  resolve: {
    extensions: ['.ts'],
  },
  output: {
    filename: 'modai.js',
    path: path.resolve(__dirname, 'assets/components/modai/js/mgr/'),
    library: 'modAI',
    libraryTarget: 'umd',
  },
});

module.exports = config;
