const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require("html-webpack-plugin");
const src = "src"
const dist = "dist"

const toRelativePathWithExt = (filePath, ext) => {
  const relative = path.relative(path.resolve(__dirname, src), filePath);
  return relative.replace(path.extname(relative), ext)
}

createHtmlPlugin = (htmlPath, chunks = [path.basename(htmlPath, ".html")]) =>
  new HtmlWebpackPlugin({
    template: path.resolve(__dirname, "src", htmlPath),
    chunks
  })

//skipped html plugin

module.exports = {
  context: path.resolve(__dirname, src),
  mode: 'none',
  entry: {
    test: './test.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, dist),
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.html$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
            },
          },
          'extract-loader',
          {
            loader: 'html-loader',
            options: {
              attributes: true,
            }
          },
        ],
      },
      { test: /\.svg$/, loader: 'file-loader' },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    createHtmlPlugin('index.html'),
  ],
  watch: true,
};
