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
  plugins: [],
  resolve: {
    extensions: ['.ts'],
  },
  output: {
    filename: 'modai.js',
    path: path.resolve(__dirname, 'assets/components/modai/js/'),
    library: 'ModAI',
    libraryExport: 'default',
  },
});

module.exports = config;
