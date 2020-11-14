const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require('copy-webpack-plugin');
const src = "src"
const dist = "dist"

const toRelativePathWithExt = (filePath, ext) => {
  const relative = path.relative(path.resolve(__dirname, src), filePath);
  return relative.replace(path.extname(relative), ext)
}

const createHtmlPlugin = (ejsPath, chunks = [path.basename(ejsPath, ".ejs")]) =>
  new HtmlWebpackPlugin({
    template: path.resolve(__dirname, "src", ejsPath),
    chunks
  })

const pages = {
  "index.ejs": [],
  "hand.ejs": ["index"],
  "community.ejs": ["index"],
}

function createEntries() {
  const rtn = {}
  for(const ejsPath in pages){
    pages[ejsPath].forEach(entry => rtn[entry] = `./${entry}.js`)
  }
  return rtn
}

function createHtmlPlugins() {
  const rtn = []
  for(const ejsPath in pages){
    rtn.push(new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "src", ejsPath),
      chunks: pages[ejsPath],
      filename: ejsPath.replace(path.extname(ejsPath), ".html")
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
        test: /\.ejs/i,
        use: [
          'html-loader',
          'ejs-html-loader',
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
        test: /\.proto$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
            },
          },
        ],
      },
      {
        test: /\.(svg|json)$/,
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
    new CopyPlugin({
      patterns: [
        { from: '../public', to: '.' },
      ],
      options: {
        concurrency: 100,
      },
    }),
    ...createHtmlPlugins(),
  ],
  devServer: {
    disableHostCheck: true,
  },
};
