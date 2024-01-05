export default {
  apikeys: {'Termer': 'titi'},
  sourceLanguages: ['nb'],
  targetLanguages: ['nb'],
  backends: [
    'Termer',
    'DomstolBackend',
    'JusleksikonBackend',
    'LexinBackend',
    'LovdataBackend',
    'NavBackend',
    'WikipediaBackend'],
  sourceRank: [
    'NavBackend/1',
    'DomstolBackend/1', 
    'JusleksikonBackend/1', 
    'LovdataBackend/1'
  ],
  backendSoruceOn: [],
  SourcesGeneralOn: [
    'NavBackend/1',
    'DomstolBackend/1', 
    'JusleksikonBackend/1', 
    'LovdataBackend/1'
  ]
}
