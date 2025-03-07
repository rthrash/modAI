const path = require('path');

module.exports = {
    mode: 'production',
    entry: './_build/js/src/index.ts',
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.ts']
    },
    output: {
        filename: 'modai.js',
        path: path.resolve(__dirname, 'assets/components/modai/js/mgr/'),
        library: 'modAI',  // Replace with your library name
        libraryTarget: 'umd'
    }
};
