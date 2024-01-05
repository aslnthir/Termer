export default {
  apikeys: {'Termer': 'termcoordDemoApi'},
  sourceLanguages: ['en'],
  targetLanguages: ['en'],
  backends: [
    'Termer',
    'WikipediaBackend',
    'GemetBackend',
    'EcbBackend',
    'EctBackend'],
  highlightMode: 'all',
  excludeMarkups: ['european parliament', 'european commission',
  'european council','under', 'on', 'to', 'in', 'be', 'use', 'its', 'as','a.','are','da','at','do','out','can','at','are','24','no','tra','rev','val','am','TRA','REV','VAL','AM'],
  selectionParts: ['language', 'source', 'domain']
}
