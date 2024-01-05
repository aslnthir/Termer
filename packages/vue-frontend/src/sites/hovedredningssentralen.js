export default {
  apikeys: ['Hovedredningssentralen_test'],
  searchPrompt: {
    en: 'Search for rescue concept',
    nb: 'Søk på begreper innen redning'
  },
  sourceLanguages: ['nb'],
  targetLanguages: ['nb'],
  backends: ['WikipediaBackend', 'LexinBackend', 'GemetBackend'],
  sourceNameViewOrder: [
    'Redningshåndboken - forkortelser',
    'Redningshåndboken - forkortelser initl.',
    'Redningshåndboken - navn',
    'Redningshåndboken - termer',
    'Redningshåndboken - termer initl.',
    'PBSI',
    'Medisinsk Operativ Manual',
    'KBT',
    'Flom ordliste',
    'Kartverket ordbok',
    'Kartverket beredskapssymboler',
    'PTIL',
    'Barents Watch Norsk - engelsk UTKAST',
    'Barents Watch Engelsk - Norsk UTKAST',
    'Sikkerhetsloven',
    'Store medisinske leksikon',
    'Store norske leksikon',
    'SUS Definisjoner og forkortelser',
    'Klima',
    'UTKAST INSITU begrep',
    'UTKAST INSITU symbol',
    'Lexin'
  ]
}
