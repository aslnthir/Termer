export default {
  apikeys: {
    'Termer': 'ukrainian'
  },
  sourceLanguages: ['nb', 'en'],
  targetLanguages: ['uk','en'],
  backends: [
    'WikipediaBackend',
    'Termer',
    'LovdataBackend',
    'LexinBackend',
    'NavBackend',
    'SnlBackend',
    'EctBackend'    
  ],
  sourceNameViewOrder: [],
  backendSoruceOn: ['EctBackend']
}
