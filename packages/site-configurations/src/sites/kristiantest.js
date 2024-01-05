export default {
  apikeys: {
    'Termer': 'helse'
  },
  sourceLanguages: ['nb'],
  targetLanguages: ['nb'],
  backends: [
    'WikipediaBackend',
    'Termer',
    'LovdataBackend',
    'LexinBackend',
    'IcnpBackend',
    'NavBackend',
    'SnlBackend',
    'EctBackend',
    'FelleskatalogenBackend'
  ],
  sourceNameViewOrder: [],
  backendSoruceOn: ['IcnpBackend', 'LovdataBackend', 'FelleskatalogenBackend'],
}
