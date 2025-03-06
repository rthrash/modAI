const path = require('path');

module.exports = {
    mode: 'production',
    entry: './_build/js/src/index.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },
    output: {
        filename: 'modai.js',
        path: path.resolve(__dirname, 'assets/components/modai/js/mgr/'),
        library: 'modAI',  // Replace with your library name
        libraryTarget: 'umd'
    }
};
