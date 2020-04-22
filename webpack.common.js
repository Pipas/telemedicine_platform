const path = require('path')
const ThreadsPlugin = require('threads-plugin')

module.exports = {
  entry: './src/index.ts',
  devtool: 'inline-source-map',
  plugins: [new ThreadsPlugin()],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          compilerOptions: {
            module: 'esnext',
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'public'),
  },
}
