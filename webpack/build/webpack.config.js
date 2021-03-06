const path = require(/* install ignore */ 'path');

const webpack = require('webpack'); // install require('webpack-cli')
const merge = require('webpack-merge');

/* plugins */
const Html = require('html-webpack-plugin');
const Clean = require('clean-webpack-plugin').CleanWebpackPlugin;
const Terser = require('terser-webpack-plugin');
const OptimizeCSS = require('optimize-css-assets-webpack-plugin');
const MiniCssExtract = require('mini-css-extract-plugin');

function r(...args) {
  return path.resolve(...args);
}

module.exports = function (env = {}, argv) {
  const prod = env.prod || env === 'prod';

  const cssLoaders = [
    {
      loader: 'css-loader',
      options: {importLoaders: 2},
    },
    {
      loader: 'postcss-loader', // install require('postcss'); require('autoprefixer');
    },
  ];
  if (prod) {
    cssLoaders.unshift(MiniCssExtract.loader);
  } else {
    cssLoaders.unshift({loader: 'style-loader'});
  }

  /* common config */
  const commonConfig = {
    target: 'web',
    context: r(),
    entry: {
      index: './src/index.js',
    },
    output: {
      path: r('dist'),
      filename: prod ? '[name]-[contenthash].js' : '[name].js',
      chunkFilename: '[name]-[contenthash].js',
      pathinfo: false,
      // publicPath: 'assets/',
      // library: 'math',
      // libraryTarget: 'umd',
      // globalObject: 'this',
    },
    resolve: {
      modules: [r('node_modules'), r('src')],
      extensions: [
        '.js',
        '.json',
        '.jsx',
        'ts',
        'tsx',
        'vue',
        '.css',
        'less',
        'scss',
      ],
      alias: {
        '@': r('src'),
      },
    },
    externals: {
      // jquery: 'JQuery',
      // lodash: {
      //   commonjs: 'lodash',
      //   commonjs2: 'lodash',
      //   amd: 'lodash',
      //   root: '_',
      // },
    },
    performance: {
      hints: 'warning',
      maxAssetSize: 250 * 1024,
      maxEntrypointSize: 250 * 1024,
    },
    // stats: 'minimal',
    module: {
      // noParse: [],
      rules: [
        {
          test: /\.(html|htm)$/,
          use: [
            {
              loader: 'html-loader',
              options: {
                root: r('assets'),
                attrs: ['img:src', 'img:data-src', 'link:href'],
              },
            },
          ],
        },
        {
          test: /\.css$/,
          use: cssLoaders,
        },
        {
          test: /\.less$/,
          use: [
            ...cssLoaders,
            {
              loader: 'less-loader', // install require('less');
              options: {paths: [r('src/less')]},
            },
          ],
        },
        {
          test: /\.jsx?$/,
          include: r('src'),
          exclude: /node_modules/,
          use: [
            {
              // install require('@babel/core'); require('@babel/cli'); require('@babel/preset-env'); require('@babel/preset-react'); require('@babel/plugin-transform-runtime'); require('@babel/plugin-syntax-dynamic-import');
              loader: 'babel-loader',
            },
            {
              loader: 'eslint-loader', // install require('eslint');
            },
          ],
        },
        {
          test: /\.(png|jpg|jpeg|gif|bmp|ico)$/,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 1024 * (prod ? 8 : 250),
                fallback: 'file-loader',
                outputPath: 'images',
              },
            },
          ],
        },
        {
          test: /\.(woff|woff2|svg|ttf|eot)$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[name].[ext]',
                outputPath: 'fonts',
              },
            },
          ],
        },
      ],
    },
    plugins: [
      new Clean(),
      new Html({
        filename: 'index.html',
        template: './src/index.html',
      }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(
          prod ? 'production' : 'development'
        ),
      }),
      new webpack.ProvidePlugin({
        // $: 'jquery',
        // jQuery: 'jquery',
        // React: 'react',
        // ReactDOM: 'react-dom',
        // Vue: 'vue',
      }),
    ],
  };

  /* development config */
  const devConfig = merge(commonConfig, {
    mode: 'development',
    devtool: 'cheap-module-eval-source-map',
    // install require('webpack-dev-server');
    devServer: {
      // publicPath: '/public/',
      contentBase: [r('assets')],
      compress: true,
      hot: true,
      watchContentBase: true,
      // stats: 'minimal'
    },
    module: {
      rules: [],
    },
    plugins: [new webpack.HotModuleReplacementPlugin()],
  });

  /* production config */
  const prodConfig = merge(commonConfig, {
    mode: 'production',
    optimization: {
      minimizer: [
        new Terser({
          cache: true,
          parallel: true,
        }),
        new OptimizeCSS(),
      ],
      runtimeChunk: 'single',
      splitChunks: {
        automaticNameDelimiter: '-',
        cacheGroups: {
          vendor: {
            chunks: 'all',
            test: /[\\/]node_modules[\\/]/,
            enforce: true,
            reuseExistingChunk: true,
          },
        },
      },
    },
    module: {
      rules: [],
    },
    plugins: [
      new webpack.HashedModuleIdsPlugin(),
      new MiniCssExtract({
        filename: '[name]-[contenthash].css',
        chunkFilename: '[name]-[contenthash].css',
      }),
    ],
  });

  return prod ? prodConfig : devConfig;
};
