var path = require('path')
const DefinePlugin = require('webpack').DefinePlugin
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
// const Dotenv = require('dotenv-webpack')
const dotenv = require('dotenv')
dotenv.config({ path: '../../.env' })

const defaultPath = '/static/glossaryjs/js/'

let publicPath =
  (process.env.GLOSSARYJS_PUBLIC_URL || '') +
  (process.env.GLOSSARYJS_PUBLIC_PATH || '')

if (!publicPath) publicPath = defaultPath

const outputPath = process.env.GLOSSARYJS_OUTPUT_SUBDIR
  ? 'dist' + process.env.GLOSSARYJS_OUTPUT_SUBDIR
  : 'dist' + defaultPath

module.exports = {
  devtool: !!process.env.BUILD_SOURCEMAP ? 'source-map' : undefined,
  devServer: {
    contentBase: false, // don’t serve any files from directory.
    disableHostCheck: true,
    publicPath: publicPath,
    port: process.env.DEV_SERVER_PORT || 3001,
    host: '0.0.0.0'
  },
  // context: __dirname,
  entry: {
    glossary: [
      // These next two are for supporting the import() statement in IE11.
      'core-js/modules/es.promise',
      'core-js/modules/es.promise.finally',
      'core-js/modules/es.array.iterator',
      './src/fetch.js',
      './src/glossary.js'
    ]
  },
  output: {
    // Library option is set in order to reduce conflict between multiple
    // webpack runtimes. Loading the Termer bookmarklet on the Termer site
    // results in a conflict when the jsonpFunction in both instances are named
    // the same. When the library option is specified, the library name is added
    // to the jsonpFunction name.
    // Alternatively, if this causes other issues or does not resolve the
    // problem completely, we may be able to instead set output.jsonpFunction to
    // some unique value directly.
    library: 'Termer',
    path: path.resolve(__dirname, outputPath),
    publicPath: publicPath,
    filename: '[name].js'
  },
  resolve: {
    modules: [
      path.resolve('./src'),
      path.resolve('./static'),
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, '../../node_modules')
    ],
    alias: {
      '@': path.resolve('./src')
    },
    mainFields: ['esnext', 'browser', 'module', 'main']
  // extensions: ['', '.js']
    // alias: {
      // 'lib': './src/lib/'
    //   '@': resolve('src')
    // }
    // modulesDirectories: ['node_modules'],
  },
  plugins: [
    new DefinePlugin(
      {
        // 'process.env.TERMER_CORE_URL': '"https://termer.test.tingtun.no/termer-js/termer-core/termer.js"'
        'process.env.VUE_APP_PUBLIC_PATH': JSON.stringify(
          process.env.VUE_APP_PUBLIC_PATH ||
          '/'
        ),
        'process.env.VUE_APP_PUBLIC_URL': JSON.stringify(
          process.env.VUE_APP_PUBLIC_URL ||
          'https://termer.no'
        ),
        'process.env.TERMER_BACKEND': JSON.stringify(
          process.env.TERMER_BACKEND ||
          'https://glossary.tingtun.no'
        ),
        'process.env.PDF_VIEWER_URL': JSON.stringify(
          process.env.PDF_VIEWER_URL || ''
        )
      }
    ),
    new CleanWebpackPlugin()
    // new Dotenv({ path: '../../.env' })
  ],
  module: {
    rules: [
      // {
      //   test: /\.js$/,
      //   loader: 'eslint-loader',
      //   enforce: 'pre',
      //   // include: [resolve('src'), resolve('test')],
      //   exclude: /node_modules/,
      //   options: {
      //     formatter: require('eslint-friendly-formatter')
      //   }
      // },
      {
        test: /\.(js|mjs)$/,
        include: filepath => {
          // Apply babel-loader to files in node_modules only if the
          // package.json has an esnext property.
          const nodeModules = /node_modules/.test(filepath)
          if (nodeModules) {
            const esnext = hasPkgEsnext(filepath)
            return esnext
          } else {
            return true
          }
        },
        // options (presets, plugins) for babel-loader are defined in .babelrc.
        loader: 'babel-loader'
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      }
    ]
  }
}

/**
 * Find package.json for file at `filepath`.
 * Return `true` if it has a property whose key is `PROPKEY_ESNEXT`.
 *
 * Code from http://2ality.com/2017/06/pkg-esnext.html
 */
const fs = require('fs')
const findRoot = require('find-root')
function hasPkgEsnext (filepath) {
  const pkgRoot = findRoot(filepath)
  const packageJsonPath = path.resolve(pkgRoot, 'package.json')
  const packageJsonText = fs.readFileSync(packageJsonPath,
      {encoding: 'utf-8'})
  const packageJson = JSON.parse(packageJsonText)
  return {}.hasOwnProperty.call(packageJson, 'esnext')
}
