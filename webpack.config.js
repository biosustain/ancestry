const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    entry: './lib/index.js',
    output: {
        filename: 'bundle.js',
        //path: path.resolve(__dirname, 'dist')
    },
    externals: {
        "angular": {
            commonjs: "angualr",
            commonjs2: "angular",
            amd: "angular",
            root: "_"
        },
        "d3": {
            commonjs: "d3",
            commonjs2: "d3",
            amd: "d3",
            root: "_"
        }
    },
    module: {
        loaders: [
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract({
                    fallbackLoader: 'style-loader',
                    loader: 'css-loader'
                }),
            },
            {
                test: /\.svg$/,
                loader: 'url?limit=8192!svgo'
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin('styles.css'),
    ]
};