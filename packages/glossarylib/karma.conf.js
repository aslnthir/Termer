const rollupConfig = require('./rollup.config.js')

const { string } = require('rollup-plugin-string')

rollupConfig.output.format = 'iife'
rollupConfig.output.name = 'test'
rollupConfig.output.sourcemap = 'inline'
rollupConfig.plugins.push(string({
  include: '**/*.txt'
}))

module.exports = function (config) {
  config.set({
    basePath: '.',
    browsers: ['Chromium'],
    frameworks: ['mocha', 'chai'],
    reporters: ['spec'],
    files: [
      {
        pattern: './tests/unit/specs/*.spec.js',
        type: 'module'
      }
    ],
    preprocessors: {
      './tests/unit/specs/*.spec.js': ['rollup']
    },
    rollupPreprocessor: rollupConfig
  })
}
