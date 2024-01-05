export default {
  apikeys: {
    'Termer': 'mfa'
  },
  sourceLanguages: ['nb'],
  targetLanguages: ['nb','en'],
  backends: [
    'Termer',
    'DomstolBackend',
    'JusleksikonBackend',
    'LovdataBackend',
    'NavBackend',
    'EctBackend'
          ],
  backendSoruceOn: [],
  SourcesGeneralOn: [
    'DomstolBackend/1', 'JusleksikonBackend/1', 'LovdataBackend/1','NavBackend/1'
  ]
}
