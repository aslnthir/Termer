import flyd from 'flyd'
import flydFilter from 'flyd/module/filter'
import { dropRepeats as flydDropRepeats } from 'flyd/module/droprepeats'
import daggy from 'daggy'
const languages = {
  GERMAN: 'de',
  NORWEGIAN_BOKMAL: 'nb',
  ENGLISH: 'en'
}

const RemoteData = daggy.taggedSum('RemoteData', {
  NotAsked: [],
  Loading: [],
  Failure: ['error'],
  Success: ['data']
})

// Start request for language data.
// Creates a new stream with the language data.
// Stream values:
// - Loading (initial)
// - Success
// - Failure
function performRequest (langCode) {
  const stream = flyd.stream()
  const validLangCode = Object.values(languages).filter(x => langCode === x).length > 0
  if (!validLangCode) {
    stream(RemoteData.Failure(new Error('invalid language code:' + langCode)))
  }

  // Indicate start of request
  stream(RemoteData.Loading)

  import(`@/locales/${langCode}.json`)
    .then(module => {
      stream(RemoteData.Success(module.default))
    })
    .catch(error => {
      stream(RemoteData.Failure(error))
    })

  return stream
}

function languageFilter (languageCode) {
  return flydFilter(x => x === languageCode)
}

// This function has type:
// Stream Language -> Stream RemoteData Error LanguageData
function languageDataStream (languageCodeStream) {
  const languageData = flyd.stream(RemoteData.NotAsked)
  languageCodeStream.map(language => {
    performRequest(language).map(languageData)
  })
  return languageData
}

class Language {
  constructor () {
    // XXX: translation files should not be handled in the core, but by the
    // frontend.
    //
    // Input:
    // Requests to change the language.
    this.languageChangeRequest = flyd.stream()

    // Container for the language data streams.
    const translationData = {}
    for (const languageId of Object.values(languages)) {
      if (languageId === languages.ENGLISH) {
        // Special case: English translations are the actual strings in the
        // app, so there is nothing to fetch from the server.
        translationData[languageId] = flyd.stream(RemoteData.Success(null))
        continue
      }
      // This is a stream which will only emit one value once.
      // It is used as a trigger to start downloading language data.
      const thisLanguage = flydDropRepeats(
        this.languageChangeRequest.pipe(languageFilter(languageId))
      )
      // The stream with language data. It starts as NotAsked, but when
      // thisLanguage has a value, it starts downloading the language data.
      translationData[languageId] = languageDataStream(thisLanguage)
    }

    // Holds a value if it is okay to change to the language. (i.e, the language
    // data has been downloaded.
    const languageChange = flyd.combine((language, ...args) => {
      const index = Object.values(languages).indexOf(language())
      const data = args[index]()
      if (RemoteData.Success.is(data)) {
        return language()
      }
    }, [this.languageChangeRequest, ...Object.values(translationData)])

    // output:
    // actual language to use, with initial default value English
    this.language = flyd.merge(flyd.stream(languages.ENGLISH), languageChange)

    // output:
    // event stream with downloaded language data
    this.translationData = flyd.stream()
    for (const [languageCode, data] of Object.entries(translationData)) {
      if (languageCode === languages.ENGLISH) continue
      const s = data.pipe(flydFilter(RemoteData.Success.is))
        .map(x => { return { code: languageCode, data: x.data } })
        // .map(x => { console.log('1', x); return x })
      this.translationData = flyd.merge(this.translationData, s)
    }
  }

  // request to change the language
  setLanguage (code) {
    if (!(Object.values(languages).indexOf(code) > -1)) {
      throw new Error('invalid language code: ' + code)
    }
    if (this.language() === code) {
      // no change.
      return
    }
    this.languageChangeRequest(code)
  }


  // set language (code) {
  //   this.setLanguage(code)
  // }
  getLanguage () {
    return this.language()
  }
  // get language () {
  //   return this.getLanguage()
  // }
  // run callback f whenever language changes
  onLanguageChange (f) {
    flyd.on(f, this.language)
  }
  onTranslationDataDownloaded (f) {
    flyd.on(f, this.translationData)
  }
}

export default new Language()
