const webdriverConfig = {
  hostname: '192.168.56.4',
  port: 5555
}

const browsers = new Set(['ChromiumHeadless'])
let hostname = 'localhost'

const envIndex = process.argv.indexOf('--env')
if (envIndex > -1) {
  const envString = process.argv[envIndex + 1]
  if (envString) {
    browsers.clear()
    if (envString.search(/\bchrome\b/) > -1) {
      browsers.add('ChromiumHeadless')
    }
    if (envString.search(/\bfirefox\b/) > -1) {
      browsers.add('FirefoxHeadless')
    }
    if (envString.search(/\bedge\b/) > -1) {
      hostname = '192.168.56.1'
      browsers.add('Edge')
    }
    if (envString.search(/\bie11\b/) > -1) {
      hostname = '192.168.56.1'
      browsers.add('IE11')
    }
    // Default: chrome
    if (browsers.size === 0) {
      browsers.add('ChromiumHeadless')
    }
  }
}

module.exports = {
  karmaConfig: {
    // logLevel: 'DEBUG',
    hostname,
    browsers: Array.from(browsers),
    customLaunchers: {
      IE11: {
        base: 'WebDriver',
        config: webdriverConfig,
        pseudoActivityInterval: 4000,
        browserName: 'internet explorer',
        platformName: 'windows',
        javascriptEnabled: true,
        acceptSslCerts: true,
        'se:ieOptions': {
          'ie.usePerProcessProxy': true,
          'ie.forceCreateProcessApi': true,
          'ie.browserCommandLineSwitches': '-private'
        }
      },
      Edge: {
        base: 'WebDriver',
        config: webdriverConfig,
        pseudoActivityInterval: 4000,
        browserName: 'MicrosoftEdge',
        name: 'MicrosoftEdge',
        platformName: 'windows',
        javascriptEnabled: true,
        acceptSslCerts: true,
        InPrivate: true
      }
    },
    // frameworks: ['mocha-debug', 'mocha'],
    client: {
      mocha: {
        // change Karma's debug.html to the mocha web reporter
        reporter: 'html'
      }
    },
    mochaReporter: {
      showDiff: true
    }
  }
}
