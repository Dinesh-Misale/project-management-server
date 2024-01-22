const path = require("path");

module.exports = {
  entry: { main: "./server.js" }, // Entry point of your application
  output: {
    filename: "bundle.js", // Output file name
    path: path.join(__dirname, "dev-build"), // Output directory
    publicPath: "/",
    clean: true,
  },
  mode: "development",
  target: "node",
  module: {
    rules: [
      {
        test: /\.js$/, // Match JavaScript files
        exclude: /node_modules/, // Exclude the node_modules directory

        loader: "babel-loader", // Use Babel for transpiling JavaScript
      },
    ],
  },
};
