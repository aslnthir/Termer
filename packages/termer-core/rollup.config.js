import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import dotenv from 'dotenv'
import { terser } from 'rollup-plugin-terser'
import { DEFAULT_EXTENSIONS } from '@babel/core'
// import typescript from 'rollup-plugin-typescript2'
import path from 'path'
// import injectProcessEnv from 'rollup-plugin-inject-process-env'
import replace from '@rollup/plugin-replace'
import dynamicImportVariables from 'rollup-plugin-dynamic-import-variables'

let gitCommitHash = process.env.GIT_COMMIT_HASH
if (!gitCommitHash) {
  gitCommitHash = require('child_process')
    .execSync('git rev-parse HEAD')
    .toString()
    .trim()
}

dotenv.config({ path: '../../.env' })
// import pkg from './package.json'
//
const extensions = [...DEFAULT_EXTENSIONS, '.ts', '.tsx']

// Config for browsers that support ES modules
const moduleConfig = {
  input: {
    'main': 'src/main-module.ts',
  },
  output: {
    // dir: pkg.config.publicDir,
    dir: 'dist',
    format: 'esm',
    // entryFileNames: 'termer-[hash].mjs',
    entryFileNames: 'termer.mjs',
    chunkFileNames: '[name]-[hash].mjs',
    // dynamicImportFunction: '__import__',
    sourcemap: !!process.env.BUILD_SOURCEMAP
  },
  plugins: basePlugins(),
  manualChunks(id) {
    return nodeModuleChunks(id)
  },
  watch: {
    clearScreen: false, // what is  this
    chokidar: false // fixes issue with watch mode stopping after first recompilation.
  }
}

// Config for browsers that don’t support ES modules
// const nomoduleConfig = {
//   input: {
//     // input: './src/termer.ts',
//     nomodule: 'src/main-nomodule.ts',
//   },
//   output: {
//     // dir: pkg.config.publicDir,
//     dir: 'dist',
//     format: 'umd',
//     name: 'termer',
//     // entryFileNames: 'termer-[hash].js',
//     entryFileNames: 'termer.js',
//     sourcemap: !!process.env.BUILD_SOURCEMAP
//   },
//   plugins: basePlugins({nomodule: true}),
//   inlineDynamicImports: true,
//   watch: {
//     clearScreen: false, // what is  this
//     chokidar: false // what is  this
//   },
// }

const configs = [moduleConfig]
// if (process.env.NODE_ENV === 'production')
//   configs.push(nomoduleConfig)
// }

export default configs

function nodeModuleChunks (id) {
  if (id.includes('node_modules')) {
    // The directory name following the last `node_modules`.
    // Usually this is the package, but it could also be the scope.
    const directories = id.split(path.sep);
    const name = directories[directories.lastIndexOf('node_modules') + 1];
    return name
  }
}

function basePlugins({ nomodule = false } = {}) {
  const browsers = nomodule ? ['ie 11'] : [
    // NOTE: I'm not using the `esmodules` target due to this issue:
    // https://github.com/babel/babel/issues/8809
    'last 2 Chrome versions',
    'last 2 Safari versions',
    'last 2 iOS versions',
    'last 2 Edge versions',
    'Firefox ESR',
    'ie 11'
  ]
  const plugins = [
    nodeResolve({ extensions, browser: true }),
    replace({
      __LOVDATA_BACKEND_URL__: process.env.LOVDATA_BACKEND,
      __DOMSTOL_BACKEND_URL__: process.env.DOMSTOL_BACKEND,
      __LEXIN_BACKEND_URL__: process.env.LEXIN_BACKEND,
      __SNL_BACKEND_URL__: process.env.SNL_BACKEND,
      __DSB_BACKEND_URL__: process.env.DSB_BACKEND,
      __ICNP_BACKEND_URL__: process.env.ICNP_BACKEND,
      __ECB_BACKEND_URL__: process.env.ECB_BACKEND,
      __ECT_BACKEND_URL__: process.env.ECT_BACKEND,
      __SPRAKRADET_BACKEND_URL__: process.env.SPRAKRADET_BACKEND,
      __GIT_COMMIT_HASH__: gitCommitHash,
      __TERMER_STATS_SERVER__: process.env.TERMER_STATS_SERVER,
      __FELLESKATALOGEN_BACKEND_URL__: process.env.FELLESKATALOGEN_BACKEND,
      __NAOB_BACKEND_URL__: process.env.NAOB_BACKEND,
    }),

    // Allow bundling cjs modules. Rollup doesn't understand cjs
    // commonjs({
    //   namedExports: {
    //     'node_modules/flyd/lib/index.js': ['combine', 'scan', 'stream']
    //   }
    // })
    // typescript({
    //   abortOnError: process.env.NODE_ENV === 'production'
    // }),
    // Compile TypeScript/JavaScript files
    babel({
      runtimeHelpers: true,
      extensions,
      presets: [
        ['@babel/preset-env', {
            targets: { browsers },
            // ^Disable corejs. This is a library, it is the consumer’s
            // responsibility to add polyfills as needed.
        }],
        '@babel/preset-typescript',
      ],
      plugins: [
        '@babel/proposal-class-properties',
        '@babel/proposal-object-rest-spread',
        '@babel/plugin-syntax-dynamic-import',
        [
          '@babel/plugin-transform-runtime', {
            corejs: false,
          }
        ]
        // ['transform-define', {
        //   '$$TERMER_DATA_DOMAIN$$': process.env.TERMER_DATA_DOMAIN
        // }],
      ],
      exclude: /node_modules/,
      // include: ['src/**/*']
    }),
    commonjs(),
  ]

  if (process.env.NODE_ENV === 'production') {
    // minify
    plugins.push(terser({module: !nomodule}))
  }

  plugins.push(dynamicImportVariables({
      // options
    }))

  return plugins
}
