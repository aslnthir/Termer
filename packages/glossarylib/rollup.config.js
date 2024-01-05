const pkg = require('./package.json')
// plugin ‘alias’ for defining short import names (such as @ for ./src)
const alias = require('@rollup/plugin-alias')
// plugin ‘resolve’ for resolving dependencies found in node_modules
const resolve = require('@rollup/plugin-node-resolve')
// plugin ‘commonjs’ for converting modules found in node_modules from commonjs
// format to ES6 module format.
const commonjs = require('@rollup/plugin-commonjs')

const json = require('@rollup/plugin-json')
const path = require('path')

// import json from 'rollup-plugin-json'

module.exports = {
  input: './src/main.js',
  plugins: [
    alias({ '@': path.join(__dirname, '/src') }),
    commonjs(),
    resolve(),
    json()
  ],
  output: [
    { file: pkg.module, format: 'esm' }
  ],
  external: [
    'glossaryapi-client',
    'imports-loader?self=>window.Symbol?{Symbol: window.Symbol}:{}!exports-loader?self!js-polyfills/url.js'
  ],
  watch: {
    chokidar: false // fixes issue with watch mode stopping after first recompilation.
  }
}
