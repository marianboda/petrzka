module.exports = {
  entry: "./src/client/index.js",
  devtool: "inline-source-map",
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
        presets: ['es2015', 'stage-1', 'react']
      }
    }]
  }
}
