module.exports = {
  entry: "./client/index.js",
  output: {
    path: __dirname,
    filename: "static/bundle.js",
    publicPath: "/static/"
  },
  module: {
    loaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: "babel",
      include: __dirname,
      query: {
        presets: ['es2015', 'react']
      }
    }]
  }
}
