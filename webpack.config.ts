import path from "path"

import webpack from "webpack"

const config: webpack.Configuration = {
  entry: "./src/index",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist")
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".json", ".web.js", ".wasm", ".mjs"]
  },
  cache: {
    type: "filesystem",
    buildDependencies: {
      config: [__filename]
    }
  },
  devServer: {
    contentBase: [path.join(__dirname, "src")], // path.join(__dirname, "test")
    historyApiFallback: true,
    compress: true,
    hot: true,
    port: 29364
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/
      },
      {
        test: /\.(ico|png|jpg|jpeg|gif|svg|webp)(\?v=\d+\.\d+\.\d+)?$/,
        type: "asset/resource"
      }
      // {
      //   test: /\.html$/,
      //   use: [
      //     /* neutrino.config.module.rule('html').use('html') */
      //     {
      //       loader: path.resolve(__dirname, "./node_modules/html-loader/index.js"),
      //       options: {
      //         attrs: ["img:src", "link:href"]
      //       }
      //     }
      //   ]
      // },
      // {
      //   oneOf: [
      //     /* neutrino.config.module.rule('style').oneOf('modules') */
      //     {
      //       test: /\.module\.css$/,
      //       use: [
      //         /* neutrino.config.module.rule('style').oneOf('modules').use('extract') */
      //         {
      //           loader: path.resolve(__dirname, "./node_modules/mini-css-extract-plugin/dist/loader.js"),
      //           options: {
      //             esModule: true
      //           }
      //         },
      //         /* neutrino.config.module.rule('style').oneOf('modules').use('css') */
      //         {
      //           loader: path.resolve(__dirname, "./node_modules/css-loader/dist/cjs.js"),
      //           options: {
      //             importLoaders: 0,
      //             modules: true
      //           }
      //         }
      //       ]
      //     },
      //     /* neutrino.config.module.rule('style').oneOf('normal') */
      //     {
      //       test: /\.css$/,
      //       use: [
      //         /* neutrino.config.module.rule('style').oneOf('normal').use('extract') */
      //         {
      //           loader: path.resolve(__dirname, "./node_modules/mini-css-extract-plugin/dist/loader.js"),
      //           options: {
      //             esModule: true
      //           }
      //         },
      //         /* neutrino.config.module.rule('style').oneOf('normal').use('css') */
      //         {
      //           loader: path.resolve(__dirname, "./node_modules/css-loader/dist/cjs.js"),
      //           options: {
      //             importLoaders: 0
      //           }
      //         }
      //       ]
      //     }
      //   ]
      // },
      // {
      //   test: /\.(eot|ttf|woff|woff2)(\?v=\d+\.\d+\.\d+)?$/,
      //   use: [
      //     /* neutrino.config.module.rule('font').use('file') */
      //     {
      //       loader: path.resolve(__dirname, "./node_modules/file-loader/dist/cjs.js"),
      //       options: {
      //         name: "assets/[name].[hash:8].[ext]"
      //       }
      //     }
      //   ]
      // },
      // {
      //   test: /\.(ico|png|jpg|jpeg|gif|svg|webp)(\?v=\d+\.\d+\.\d+)?$/,
      //   use: [
      //     /* neutrino.config.module.rule('image').use('url') */
      //     {
      //       loader: path.resolve(__dirname, "./node_modules/url-loader/dist/cjs.js"),
      //       options: {
      //         limit: 8192,
      //         name: "assets/[name].[hash:8].[ext]"
      //       }
      //     }
      //   ]
      // }
    ]
  },
  plugins: [new webpack.HotModuleReplacementPlugin()],
  experiments: {
    topLevelAwait: true
  }
}

export default config
