const path = require('path');
const webpack = require('webpack');
const { VueLoaderPlugin } = require('vue-loader');

module.exports = {
  context: path.resolve(__dirname, 'src'),
  entry: './main.js',
  module: {
    rules: [
      // ... інші правила
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              modules: {
                localIdentName: '[local]',
              },
            },
          },
        ],
      },
    ],
  },
  resolve: {
    alias: {
      vue: 'vue/dist/vue.esm-bundler',
    },
  },
  plugins: [
    new VueLoaderPlugin(), // Додали VueLoaderPlugin
    new webpack.DefinePlugin({
      '__VUE_OPTIONS_API__': true,
      '__VUE_PROD_DEVTOOLS__': false,
    }),
    
  ],
  devServer: {
    static: path.join(__dirname, 'src'),
    compress: true,
    port: 8080,
  },
};
