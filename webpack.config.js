const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: {
    popup: "./src/popup/index.js",
    background: "./src/background/index.js",
  },
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "[name].js",
  },
  mode: "development",
  devtool: "inline-source-map",
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/popup.html",
      filename: "popup.html",
      chunks: ["popup"],
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, "public"),
    },
    compress: true,
    port: 9000,
  },
};
