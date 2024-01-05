var webpackConfig = require('../../webpack.config.js')
delete webpackConfig.output.library

module.exports = function (config) {
  config.set({
    browsers: ['ChromeHeadless'],
    frameworks: ['mocha'],
    reporters: ['spec'],
    files: [
      { pattern: 'specs/*.spec.js' },
    ],
    preprocessors: {
      'specs/*.spec.js': [ 'webpack', 'sourcemap']
    },
    webpack: webpackConfig,
    // webpack: {},
    webpackMiddleware: {
      stats: 'errors-only'
      // noInfo: true
    }
  })
}
