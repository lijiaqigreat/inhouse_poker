const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require("html-webpack-plugin");
const src = "src"
const dist = "dist"

const toRelativePathWithExt = (filePath, ext) => {
  const relative = path.relative(path.resolve(__dirname, src), filePath);
  return relative.replace(path.extname(relative), ext)
}

const createHtmlPlugin = (htmlPath, chunks = [path.basename(htmlPath, ".html")]) =>
  new HtmlWebpackPlugin({
    template: path.resolve(__dirname, "src", htmlPath),
    chunks
  })

const pages = {
  "index.html": ["index"],
}

function createEntries() {
  const rtn = {}
  for(const htmlPath in pages){
    pages[htmlPath].forEach(entry => rtn[entry] = `./${entry}.js`)
  }
  return rtn
}

function createHtmlPlugins() {
  const rtn = []
  for(const htmlPath in pages){
    rtn.push(new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "src", htmlPath),
      chunks: pages[htmlPath],
    }))
  }
  return rtn
}

//skipped html plugin

module.exports = {
  context: path.resolve(__dirname, src),
  mode: 'none',
  entry: createEntries(),
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
          'html-loader',
        ],
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].css',
            },
          },
          'sass-loader',
        ],
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    ...createHtmlPlugins(),
  ],
  watch: true,
};
