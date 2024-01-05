export default {
  apikeys: {
    'Termer': 'jus'
  },
  sourceLanguages: ['nb'],
  targetLanguages: ['nb'],
  backends: [
    'Termer',
    'DomstolBackend',
    'JusleksikonBackend',
    'LexinBackend',
    'LovdataBackend',
    'NavBackend',
    'WikipediaBackend',
    'EctBackend'
  ],
  backendSoruceOn: [],
  SourcesGeneralOn: [
    'NavBackend/1',
    'DomstolBackend/1', 'JusleksikonBackend/1', 'LovdataBackend/1'
  ]
}
