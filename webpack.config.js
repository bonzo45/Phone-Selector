const path = require('path');

module.exports = {
  // Run these things when webpacking the project.
  entry: [
  	'babel-polyfill',
  	'./src/index.jsx',
  ],

  // Output the bundle.js file.
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },

  // Source maps for debugging.
  devtool: 'inline-source-map',

  // Development server config.
  devServer: {
  	contentBase: './dist',
  },

  // How to handle each input file.
  module: {
  	rules: [
  		// Run *.js files through babel.
  		{
  			test: /\.jsx?$/,
  			include: path.join(__dirname, 'src'),
  			loader: 'babel-loader',
  			query: {
  				presets: ['es2015', 'react'],
  			},
  		},
  		{
  			test: /\.css$/,
  			use: [
  				'style-loader',
  				'css-loader',
  			],
  		}
  	]
  },
};
