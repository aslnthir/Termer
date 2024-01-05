export default {
  apikeys: {
    'Termer': 'kildebruk'
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
    'FelleskatalogenBackend',
    'NaobBackend'
  ],
  sourceNameViewOrder: [],
  backendSoruceOn: ['NaobBackend','LovdataBackend']
}
