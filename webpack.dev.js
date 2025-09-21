const path = require('path')
const common = require('./webpack.common.js')
const { merge } = require('webpack-merge')

module.exports = merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',
    output: {
        filename: '[name].bundle.js', // Removed contenthash for development
        publicPath: '/'
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            sourceMap: true,
                            importLoaders: 1
                        }
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            sourceMap: true
                        }
                    }
                ]
            }
        ]
    },
    devServer: {
        static: {
            directory: path.resolve(__dirname, 'dist')
        },
        open: true,
        port: 9000,
        hot: true,
        liveReload: false, // Changed to false to avoid conflicts with HMR
        compress: true,
        historyApiFallback: true,
        client: {
            overlay: {
                errors: true,
                warnings: true
            },
            progress: true,
            logging: 'info' // Changed from verbose to info
        },
        devMiddleware: {
            writeToDisk: false // Changed to false for better performance
        }
    },
    optimization: {
        runtimeChunk: 'single'
    }
})
