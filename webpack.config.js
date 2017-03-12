const ExtractTextPlugin = require('extract-text-webpack-plugin');
var path = require('path');

module.exports = {
    entry: './lib/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    externals: {
        "angular": "angular",
        "d3": "d3"
    },
    module: {
        loaders: [
            {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: 'css-loader'
                })
            },
            {
                test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
                loader: 'url-loader',
                include: path.join(__dirname, './icons'),
                options: {
                    limit: 10000
                }
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin('bundle.css')
    ],
    devServer: {
        contentBase: path.join(__dirname, "."),
        compress: false,
        port: 9000
    }
};