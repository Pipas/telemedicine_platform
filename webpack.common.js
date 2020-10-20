const path = require('path')
const ThreadsPlugin = require('threads-plugin')

module.exports = {
  entry: {
    demo: './src/demo/index.ts',
    library: './src/index.ts',
  },
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
    filename: '[name].bundle.js',
    // path: path.resolve(__dirname, 'public/final_website/library'),
    path: path.resolve(__dirname, 'public/demo'),
  },
}
