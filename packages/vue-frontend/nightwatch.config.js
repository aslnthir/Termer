// require('babel-register')
// var config = require('../../config')

// http://nightwatchjs.org/getingstarted#settings-file
// console.log(process.env)
// console.log(config)
module.exports = {
  custom_commands_path: ['tests/e2e/custom-commands'],
  test_workers: false, // parallel execution does not work with Edge and is unstable with IE11.
  detailed_output: true,

  selenium: {
    start_process: false
  },

  test_settings: {
    default: {
      selenium_port: 4445,
      selenium_host: 'localhost',
      silent: true
    },
    ie11: {
      // Connecting to selenium in the virtual machine directly here.
      // Going through the selenium hub caused problems with creating sessions
      selenium_port: 5555,
      selenium_host: '192.168.56.4',
      desiredCapabilities: {
        browserName: 'internet explorer',
        platformName: 'windows',
        javascriptEnabled: true,
        acceptSslCerts: true,
        'se:ieOptions': {
          'ie.usePerProcessProxy': true,
          'ie.forceCreateProcessApi': true,
          'ie.browserCommandLineSwitches': '-private'
        }
      }
    },
    edge: {
      selenium_port: 5555,
      selenium_host: '192.168.56.4',
      desiredCapabilities: {
        browserName: 'MicrosoftEdge',
        name: 'MicrosoftEdge',
        platformName: 'windows',
        javascriptEnabled: true,
        acceptSslCerts: true,
        InPrivate: true
      }
    },
    firefox: {
      desiredCapabilities: {
        browserName: 'firefox',
        javascriptEnabled: true,
        acceptSslCerts: true
      }
    }
  }
}
