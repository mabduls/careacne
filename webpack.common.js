const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const webpack = require('webpack')

module.exports = {
	entry: {
		app: path.resolve(__dirname, 'src/scripts/index.js')
	},
	output: {
		filename: '[name].[contenthash].bundle.js',
		path: path.resolve(__dirname, 'dist'),
		publicPath: '',
		clean: true
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader',
					options: {
						presets: ['@babel/preset-env']
					}
				}
			},
			{
				test: /\.html$/i,
				use: 'raw-loader',
			},
			{
				test: /\.tflite$/,
				type: 'asset/resource',
				generator: {
					filename: 'models/[name][ext]'
				}
			},
			{
				test: /\.bin$/,
				type: 'asset/resource',
				generator: {
					filename: (pathData) => {
						if (pathData.filename.includes('tfjs_model')) {
							return 'models/tfjs_model/[name][ext]';
						}
						return '[name][ext]';
					}
				}
			},
			{
				test: /\.json$/,
				type: 'asset/resource',
				generator: {
					filename: 'models/tfjs_model/[name][ext]'
				},
				include: [
					path.resolve(__dirname, 'src/models/tfjs_model')
				]
			}
		]
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: path.resolve(__dirname, 'src/index.html'),
			filename: 'index.html',
			inject: 'body',
			excludeChunks: ['sw']
		}),
		new CopyWebpackPlugin({
			patterns: [
				{
					from: path.resolve(__dirname, 'src/public'),
					to: path.resolve(__dirname, 'dist'),
					globOptions: {
						ignore: ['**/index.html']
					}
				},
				{
					from: path.resolve(__dirname, 'src/scripts/sw.js'),
					to: path.resolve(__dirname, 'dist/sw.js'),
					transform(content) {
						// Replace process.env.NODE_ENV in service worker
						return content.toString().replace(
							/process\.env\.NODE_ENV/g,
							`'${process.env.NODE_ENV || 'development'}'`
						);
					}
				},
				{
					from: path.resolve(__dirname, 'src/models/tfjs_model'),
					to: path.resolve(__dirname, 'dist/models/tfjs_model'),
					globOptions: {
						ignore: ['**/.DS_Store']
					}
				}
			]
		})
	]
}