// Dynamically set HOST. Normally we use the default. But for testing on IE11 and Edge
// running in a virtual machine, substitute the host ip address.
const envIndex = process.argv.indexOf('--env')
if (envIndex > -1) {
  const envString = process.argv[envIndex + 1]
  if (envString && envString.search(/\bie11\b|\bedge\b/) > -1) {
    process.env.HOST = '192.168.56.1'
  }
}

const chainWebpack = config => {
  config.module
    .rule('license')
    .resourceQuery(/blockType=license|blockType=docs/)
    .type('javascript/auto')
    .use('identity-loader')
    .loader('./loaders/identity-loader')
    .end()

  config.module
    .rule('md')
    .test(/\.md$/)
      .oneOf('md-template')
        .resourceQuery(/^\?vue/)
        .use('markdown-loader')
          .loader('./loaders/markdown-loader')
          .end()
        .end()
      .oneOf('md-file')
        .use('raw-loader')
          .loader('raw-loader')
          .end()
        .use('markdown-loader')
          .loader('./loaders/markdown-loader')
          .end()
        .end()

  // The default is 'sinon' => 'sinon/pkg/sinon-esm.js' which contains modern
  // javascript incompatible with IE11.
  config.resolve.alias.set('sinon', 'sinon/lib/sinon')

  // This may break hot module reloading (development mode)
  // But it ensures that symlinked packages in node_modules are not processed by
  // ESLint. So it stops the annoying linter warnings about libraries.
  config.resolve.set('symlinks', false)

  // Separate chunk for webpack runtime.
  config.optimization.set('runtimeChunk', 'single')

  // Disables prefetch of JS & CSS files. Useful for testing purposes.
  // config.plugins.delete('prefetch')

  config.plugin('html-404')
    .use(require('html-webpack-plugin'), [{
      templateParameters: {
        VUE_APP_PUBLIC_PATH: process.env.VUE_APP_PUBLIC_PATH || '/'
      },
      inject: false,
      filename: '404.html', // within the ./dist folder
      template: 'public/404.html'
    }])
    .before('html')

  let openSearchURLs
  try {
    openSearchURLs = [...new Set([
      new URL(publicPath),
      new URL('https://termer.no'),
      new URL('https://insitu.termer.no')
    ])]
  } catch (e) {
    openSearchURLs = [...new Set([
      new URL('https://termer.no'),
      new URL('https://insitu.termer.no')
    ])]
  }

  const xmlFileOptionsList = openSearchURLs.map(url => {
    return {
      template: 'public/opensearch.xml.ejs',
      filename: `opensearch.${url.hostname}.xml`,
      data: {
        searchUrl: url.href + 'search/{searchTerms}',
        description: 'Term definitions and translations',
        favicon16x16png: url.href + 'img/icons/favicon-16x16.png',
        favicon32x32png: url.href + 'img/icons/favicon-32x32.png'
      }
    }
  })

  config.plugin('opensearch.xml')
    .use(require('xml-webpack-plugin'), [{
      files: xmlFileOptionsList
    }])
    .before('html')

  // polyfill fetch for IE11
  if (!process.env.VUE_CLI_MODERN_BUILD) {
    // Include fetch polyfill in legacy bundle.
    config.plugin('fetch')
      .use(require('webpack').ProvidePlugin, [{
        fetch: 'exports-loader?self.fetch!whatwg-fetch/dist/fetch.umd.js'
      }])
  }

  require('./plugins/workbox')(config, {
    name: 'vue-frontend',
    importWorkboxFrom: 'local'
  })
}

const devServer = {}
devServer.port = process.env.VUE_APP_DEV_SERVER_PORT || 3000
devServer.allowedHosts = [
  '.localdomain'
]
// IE11 complained about some security issue. It is safe to disable this because
// it is only used in development and testing in any case.
devServer.disableHostCheck = true

// devServer.quiet = false  // build log
// devServer.clientLogLevel = 'info'
//
// without port :3000:
// websocket on localhost:8000 does not work due to 404 on
// http://glossary.webpack.localdomain:8000/sockjs-node/info?t=1541685874277)
//
// with port :3000:
// websocket on https://glossary.tingtun.no/ (mapped in /etc/hosts & nginx conf) stops
// working (request to
// https://glossary.webpack.localdomain:3000/sockjs-node/info?t=1541686117440
// fails because the dev server at 3000 does not use https.)
//
// http://localhost:3000/#/manage/glossaries works in both cases.
devServer.public = process.env.VUE_APP_PUBLIC_URL || ''

// const backendPort = process.env.DJANGO_BACKEND_PORT | 8000
// devServer.proxy = 'http://' + 'localhost:' + backendPort

devServer.headers = {
  'Access-Control-Allow-Origin': '*'
}

if (process.env.MINIMAL_OUTPUT) {
  devServer.progress = false
}

devServer.historyApiFallback = { index: '/404.html' }

const pluginOptions = {}

pluginOptions.karma = require('./karma.conf.js')

// Normally dependencies are not processed through Babel. However, we want to
// enable this for some of the dependencies so they can be run in the browser
// environment. That is, Babel transforms language features that are not
// universally supported, such as arrow functions (looking at you, IE11!), into
// equivalent expressions that are supported.
const transpileDependencies = [
  'browser-backend',
  'glossarylib',
  'glossaryapi-client',
  'site-configurations',
  'lovdata-law-reference-regex',
  'mdi-vue',
  'termer-core'
]

const publicPath =
  (process.env.VUE_APP_PUBLIC_URL || '') +
  (process.env.VUE_APP_PUBLIC_PATH || '/')

let gitCommitHash = process.env.GIT_COMMIT_HASH
if (!gitCommitHash) {
  gitCommitHash = require('child_process')
    .execSync('git rev-parse HEAD')
    .toString()
    .trim()
}

let gitCommitDate = process.env.GIT_COMMIT_DATE
if (!gitCommitDate) {
  gitCommitDate = require('child_process')
    .execSync(`git show -s --format=%ci ${gitCommitHash}`)
    .toString()
    .trim()
}

process.env.VUE_APP_GIT_COMMIT_HASH = gitCommitHash
process.env.VUE_APP_GIT_COMMIT_DATE = gitCommitDate

// Copy the required env variables into new variables with the VUE_APP_ prefix,
// in order for them to be visible in Vue components.
const envVars = [
  'GLOSSARYJS_PUBLIC_URL',
  'GLOSSARYJS_PUBLIC_PATH',
  'TERMER_BACKEND',
  'PDF_VIEWER_URL',
  'SCRIPT_URL'
]
for (const name of envVars) {
  if (name in process.env) {
    process.env[`VUE_APP_${name}`] = process.env[name]
  }
}
if (process.env.VUE_CLI_MODERN_BUILD) {
  process.env.VUE_APP_TERMER_CORE_URL = process.env.TERMER_CORE_URL
}
if (process.env.VUE_CLI_MODERN_BUILD) {
  process.env.VUE_APP_PDF_VIEWER_URL += 'generic/'
} else {
  process.env.VUE_APP_PDF_VIEWER_URL += 'generic-es5/'
}

const css = {
  // Fix for warning about conflicting order in chunks.
  // It does not seem like ordering is of any importance, so ignore it in order
  // to silence the warning.
  // css extraction is not enabled in development mode.
  extract: process.env.NODE_ENV === 'production'
    ? { ignoreOrder: true }
    : false
}

module.exports = {
  chainWebpack,
  devServer,
  pluginOptions,
  transpileDependencies,
  publicPath,
  assetsDir: '',
  productionSourceMap: !!process.env.BUILD_SOURCEMAP,
  css
}
