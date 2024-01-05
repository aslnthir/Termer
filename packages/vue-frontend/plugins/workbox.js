module.exports = (webpackConfig, options) => {
  const target = process.env.VUE_CLI_BUILD_TARGET
  if (target && target !== 'app') {
    return
  }

  const name = options.name

  // generate /service-worker.js in production mode
  if (process.env.NODE_ENV === 'production') {
    // Default to GenerateSW mode, though InjectManifest also might be used.
    const workboxPluginMode = options.workboxPluginMode || 'GenerateSW'
    // const workboxPluginMode = 'GenerateSW'
    const workboxWebpackModule = require('workbox-webpack-plugin')

    if (!(workboxPluginMode in workboxWebpackModule)) {
      throw new Error(
        `${workboxPluginMode} is not a supported Workbox webpack plugin mode. ` +
        `Valid modes are: ${Object.keys(workboxWebpackModule).join(', ')}`
      )
    }

    const defaultOptions = {
      exclude: [
        /pwa\//,
        /\.map$/,
        /img\/icons\//,
        /favicon\.ico$/,
        /^manifest.*\.js?$/
      ]
    }

    const defaultGenerateSWOptions = workboxPluginMode === 'GenerateSW' ? {
      cacheId: name
    } : {}

    const workBoxConfig = Object.assign(defaultOptions,
      defaultGenerateSWOptions,
      options.workboxOptions
    )

    webpackConfig
      .plugin('workbox')
      .use(workboxWebpackModule[workboxPluginMode], [workBoxConfig])
  }
}
