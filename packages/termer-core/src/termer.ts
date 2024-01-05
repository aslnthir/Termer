// import language from './settings/language'
import flyd from 'flyd'
import flydLift from 'flyd/module/lift'
import flydFilter from 'flyd/module/filter'
import debounceTime from 'flyd-debouncetime'
import { dropRepeatsWith as flydDropRepeatsWith } from 'flyd/module/droprepeats'
import {
  Wordlist, Glossary, GlossaryData, Apikey, ApikeySetting, TermCreation
} from './entry'
import {
  assertNever,
  filterObjectBy,
  filterObjectByPred,
  filterObjectByKeys,
  languageNames
} from './util'
import * as R from 'ramda'
import * as TermerMessage from './TermerMessage'
import { Api, Languages, SearchError, SearchNoResult, SearchResult } from './APIs/api'
import { TermerDatabase } from './IndexDB/termerIndexDB'
import {
  NotAsked,
  isNotAsked,
  isSuccess,
  isLoading,
  constructors as remoteData
} from './remotedata'
import {
  ResultsInfoLogMessage,
  SearchInfoLogMessage,
  Statistics,
  StatisticsItem
} from './statistics-model'
import {
  LocalData,
  isLocalData,
  isSyncError,
  isNotSynced,
  isSynced,
  constructors as localData
} from './localdata'
import { Storage } from './storage'
import * as model from './model'
import { sendLogMessage } from './log-sender'
import {
  lovdataBackendURL,
  domstolBackendURL,
  lexinBackendURL,
  icnpBackendURL,
  ecbBackendURL,
  sprakradetBackendURL,
  snlBackendURL,
  dsbBackendURL,
  ectBackendURL,
  felleskatalogenBackendURL,
  naobBackendURL
} from './global-constants'
import { fetchSiteConfiguration, SiteConfiguration } from 'site-configurations'
import { UserDefaultSetting } from './model'

const ONE_MINUTE = 1000 * 60
const LOG_SYNC_INTERVAL = ONE_MINUTE * 2

const onlyFirstLetterUppercaseRe = /^\p{Lu}\P{Lu}+/u
/*
function notNull<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}
*/

function dropRepeats<T>(x: flyd.Stream<T>): flyd.Stream<T> {
  return flydDropRepeatsWith(R.equals, x)
}

function filterEmpty<T>(stream: flyd.Stream<T[]>): flyd.Stream<T[]> {
  return flydFilter(x => x.length > 0, stream)
}

interface TermerCore {
  readonly backends: flyd.Stream<model.BackendCollection>
  availableSources: (
    backendId: model.BackendId
  ) => flyd.Stream<model.SourceCollection>
  selectConfigSource: (sourceId: model.SourceCompoundIdString[]) => void
  deselectSource: (sourceIds: model.SourceCompoundId[]) => void
  // updateSource: (backendId: BackendId, sourceId: SourceId, data: Source?) => void
  addApiKey: (backendId: model.BackendId, apiKey: model.ApiKey) => void

  readonly wordlist: flyd.Stream<{
    wordlist: Wordlist
    regexes: string[]
    loaded: boolean
  }>

  readonly loadingData: flyd.Stream<boolean>

  search: (term: string) => void

  // deleteEntry: (backendId: BackendId, entryId: EntryId) => void

  // auth ...

  readonly availableBackendTypes: flyd.Stream<Set<model.BackendType>>
  addBackend: (backend: model.BackendType | model.BackendDescriptor) => void
  // protected addModelTriggers: () => void
  // protected updateModel: (message: model.Message) => void
}
//  Public Termer Core API interface:
//   get backends(): (stream of) set of backend infos (including id/name)
//   get availableSources(backend id): (stream of) set of source infos
//   get wordlist(): (stream of) combined wordlist, all backends
//   set search(search term): (stream of) search results, all backends
//   set selectSource(backend id, source id)
//   set deselectSource(backend id, source id)
//
//   further examples:
//   set updateSource(backend id, source id, data)
//   set deleteEntry(backend id, entry id)
//   …
//
//   how about auth related functions? log in, log out
//
//  Other public functions:
//   addBackend(backend creator)
//   list of backend that can be added:
//     backendCreators.termer()
//     backendCreators.wien()
//   …

type BackendDescriptors = Record<string, model.BackendDescriptor>
export const defaultBackendDescriptors: BackendDescriptors = Object.freeze({
  [model.BackendType.Termer]: {
    type: model.BackendType.Termer,
    url: 'https://glossary.tingtun.no/glossary2/',
    loginUrl: 'https://glossary.tingtun.no/v/#/login/',
    config: {
      authenticated: remoteData.notAsked(),
      apiKeys: [],
      selectedSources: []
    },
    properties: {
      auth: true,
      multipleSources: true,
      apiKeys: true,
      name: 'termer',
      domains: true
    }
  },
  [model.BackendType.BrowserBackend]: {
    type: model.BackendType.BrowserBackend,
    config: {
      authenticated: remoteData.notAsked(),
      apiKeys: [],
      selectedSources: []
    },
    properties: {
      auth: false,
      multipleSources: true,
      apiKeys: true,
      name: 'browserBackend',
      domains: true
    }
  },
  [model.BackendType.WikipediaBackend]: {
    type: model.BackendType.WikipediaBackend,
    url: 'https://www.wikipedia.org',
    config: {
      authenticated: remoteData.notAsked(),
      apiKeys: ['sourceNotSelected'],
      selectedSources: []
    },
    properties: {
      auth: false,
      multipleSources: false,
      apiKeys: false,
      name: 'wikipediaBackend',
      domains: false
    }
  },
  [model.BackendType.LexinBackend]: {
    type: model.BackendType.LexinBackend,
    url: 'https://lexin.oslomet.no',
    config: {
      authenticated: remoteData.notAsked(),
      apiKeys: [],
      selectedSources: []
    },
    properties: {
      auth: false,
      multipleSources: false,
      apiKeys: false,
      name: 'lexinBackend',
      domains: false
    }
  },
  [model.BackendType.GemetBackend]: {
    type: model.BackendType.GemetBackend,
    url: 'https://www.eionet.europa.eu',
    config: {
      authenticated: remoteData.notAsked(),
      apiKeys: [],
      selectedSources: []
    },
    properties: {
      auth: false,
      multipleSources: false,
      apiKeys: false,
      name: 'GemetBackend',
      domains: false
    }
  },
  [model.BackendType.LovdataBackend]: {
    type: model.BackendType.LovdataBackend,
    url: 'https://lovdata.no',
    config: {
      authenticated: remoteData.notAsked(),
      apiKeys: [],
      selectedSources: []
    },
    properties: {
      auth: false,
      multipleSources: false,
      apiKeys: false,
      name: 'Lovdata',
      domains: false
    }
  },
  [model.BackendType.NavBackend]: {
    type: model.BackendType.NavBackend,
    url:
      'https://data.nav.no/?size=n_30_n&filters%5B0%5D%5Bfield%5D=tittel&filters%5B0%5D%5Bvalues%5D%5B0%5D=&filters%5B0%5D%5Btype%5D=any',
    config: {
      authenticated: remoteData.notAsked(),
      apiKeys: [],
      selectedSources: []
    },
    properties: {
      auth: false,
      multipleSources: false,
      apiKeys: false,
      name: 'Nav - Begreper',
      domains: false
    }
  },
  [model.BackendType.FellesdataKatalogBackend]: {
    type: model.BackendType.FellesdataKatalogBackend,
    url: 'https://data.norge.no/concepts',
    config: {
      authenticated: remoteData.notAsked(),
      apiKeys: [],
      selectedSources: []
    },
    properties: {
      auth: false,
      multipleSources: false,
      apiKeys: false,
      name: 'Felles datakatalog - Begreper',
      domains: false
    }
  },
  [model.BackendType.DomstolBackend]: {
    type: model.BackendType.DomstolBackend,
    url: 'https://www.domstol.no/verktoy/juridisk-ordliste',
    config: {
      authenticated: remoteData.notAsked(),
      apiKeys: [],
      selectedSources: []
    },
    properties: {
      auth: false,
      multipleSources: false,
      apiKeys: false,
      name: 'Domstol.no - Juridisk ordliste',
      domains: false
    }
  },
  [model.BackendType.JusleksikonBackend]: {
    type: model.BackendType.JusleksikonBackend,
    url: 'https://jusleksikon.no',
    config: {
      authenticated: remoteData.notAsked(),
      apiKeys: [],
      selectedSources: []
    },
    properties: {
      auth: false,
      multipleSources: false,
      apiKeys: false,
      name: 'Jusleksikon',
      domains: false
    }
  },
  [model.BackendType.EcbBackend]: {
    type: model.BackendType.EcbBackend,
    url: 'https://www.ecb.europa.eu/home/glossary/html/glossa.en.html',
    config: {
      authenticated: remoteData.notAsked(),
      apiKeys: [],
      selectedSources: []
    },
    properties: {
      auth: false,
      multipleSources: false,
      apiKeys: false,
      name: 'ECB Glossary',
      domains: false
    }
  },
  [model.BackendType.SprakradetBackend]: {
    type: model.BackendType.SprakradetBackend,
    url: 'https://www.sprakradet.no/Sprakarbeid/Terminologi/datatermliste/',
    config: {
      authenticated: remoteData.notAsked(),
      apiKeys: [],
      selectedSources: []
    },
    properties: {
      auth: false,
      multipleSources: false,
      apiKeys: false,
      name: 'Sprakradet Glossary',
      domains: false
    }
  },
  [model.BackendType.IcnpBackend]: {
    type: model.BackendType.IcnpBackend,
    url: 'https://icn.ch',
    config: {
      authenticated: remoteData.notAsked(),
      apiKeys: [],
      selectedSources: []
    },
    properties: {
      auth: false,
      multipleSources: false,
      apiKeys: false,
      name: 'ICNP',
      domains: false
    }
  },
  [model.BackendType.SnlBackend]: {
    type: model.BackendType.SnlBackend,
    url: 'https://snl.no',
    config: {
      authenticated: remoteData.notAsked(),
      apiKeys: [],
      selectedSources: []
    },
    properties: {
      auth: false,
      multipleSources: false,
      apiKeys: false,
      name: 'SNL',
      domains: false
    }
  },
  [model.BackendType.FofBackend]: {
    type: model.BackendType.FofBackend,
    url: 'https://folkogforsvar.no/leksikon/',
    config: {
      authenticated: remoteData.notAsked(),
      apiKeys: [],
      selectedSources: []
    },
    properties: {
      auth: false,
      multipleSources: false,
      apiKeys: false,
      name: 'FOF',
      domains: false
    }
  },
  [model.BackendType.DsbBackend]: {
    type: model.BackendType.DsbBackend,
    url: 'https://kunnskapsbanken.dsb.no/definisjoner',
    config: {
      authenticated: remoteData.notAsked(),
      apiKeys: [],
      selectedSources: []
    },
    properties: {
      auth: false,
      multipleSources: false,
      apiKeys: false,
      name: 'DSB',
      domains: false
    }
  },
  [model.BackendType.EctBackend]: {
    type: model.BackendType.EctBackend,
    url: 'https://webgate.ec.europa.eu/etranslation/public/welcome.html',
    config: {
      authenticated: remoteData.notAsked(),
      apiKeys: [],
      selectedSources: []
    },
    properties: {
      auth: false,
      multipleSources: false,
      apiKeys: false,
      name: 'ECT',
      domains: false
    }
  },
  [model.BackendType.FelleskatalogenBackend]: {
    type: model.BackendType.FelleskatalogenBackend,
    url: 'https://www.felleskatalogen.no',
    config: {
      authenticated: remoteData.notAsked(),
      apiKeys: [],
      selectedSources: []
    },
    properties: {
      auth: false,
      multipleSources: false,
      apiKeys: false,
      name: 'felleskatalogen',
      domains: false
    }
  },
  [model.BackendType.NaobBackend]: {
    type: model.BackendType.NaobBackend,
    url: 'https://www.naob.no',
    config: {
      authenticated: remoteData.notAsked(),
      apiKeys: [],
      selectedSources: []
    },
    properties: {
      auth: false,
      multipleSources: false,
      apiKeys: false,
      name: 'naob',
      domains: false
    }
  }
  // wien wiki ...
  // const properties = {
  //   auth: false,
  //   multipleSources: false,
  //   apiKeys: false,
  //   name: 'wien',
  //   domains: false
  // }
})

const _backendsApiCache: Record<string, Promise<Api>> = {}
function backendApis(backend: model.Backend): Promise<Api> {
  const key = backend.id
  let api: Promise<Api> = _backendsApiCache[key]
  if (api) {
    return api
  }
  switch (backend.type) {
    case model.BackendType.BrowserBackend: {
      api = (async () => {
        const { API } = await import('./APIs/browser-backend')
        return new API()
      })()
      break
    }
    case model.BackendType.WikipediaBackend: {
      api = (async () => {
        const { API } = await import('./APIs/wikipedia-backend')
        return new API()
      })()
      break
    }
    case model.BackendType.LexinBackend: {
      api = (async () => {
        const { API } = await import('./APIs/lexin-backend')
        return new API(lexinBackendURL)
      })()
      break
    }
    case model.BackendType.GemetBackend: {
      api = (async () => {
        const { API } = await import('./APIs/eionet-backend')
        return new API()
      })()
      break
    }
    case model.BackendType.LovdataBackend: {
      api = (async () => {
        const { API } = await import('./APIs/lovdata-backend')
        return new API(lovdataBackendURL)
      })()
      break
    }
    case model.BackendType.DomstolBackend: {
      api = (async () => {
        const { API } = await import('./APIs/domstol-backend')
        return new API(domstolBackendURL)
      })()
      break
    }
    case model.BackendType.JusleksikonBackend: {
      api = (async () => {
        const { API } = await import('./APIs/jusleksikon')
        return new API()
      })()
      break
    }
    case model.BackendType.NavBackend: {
      api = (async () => {
        const { API } = await import('./APIs/nav-backend')
        return new API()
      })()
      break
    }
    case model.BackendType.FellesdataKatalogBackend: {
      api = (async () => {
        const { API } = await import('./APIs/fellesdatakatalog-backend')
        return new API()
      })()
      break
    }
    case model.BackendType.IcnpBackend: {
      api = (async () => {
        const { API } = await import('./APIs/icnp-backend')
        return new API(icnpBackendURL)
      })()
      break
    }
    case model.BackendType.EcbBackend: {
      api = (async () => {
        const { API } = await import('./APIs/ecb-backend')
        return new API(ecbBackendURL)
      })()
      break
    }
    case model.BackendType.SprakradetBackend: {
      api = (async () => {
        const { API } = await import('./APIs/sprakradet-backend')
        return new API(sprakradetBackendURL)
      })()
      break
    }
    case model.BackendType.SnlBackend: {
      api = (async () => {
        const { API } = await import('./APIs/snl-backend')
        return new API(snlBackendURL)
      })()
      break
    }
    case model.BackendType.FofBackend: {
      api = (async () => {
        const { API } = await import('./APIs/fof-backend')
        return new API()
      })()
      break
    }
    case model.BackendType.DsbBackend: {
      api = (async () => {
        const { API } = await import('./APIs/dsb-backend')
        return new API(dsbBackendURL)
      })()
      break
    }
    case model.BackendType.FelleskatalogenBackend: {
      api = (async () => {
        const { API } = await import('./APIs/felleskatalogen-backend')
        return new API(felleskatalogenBackendURL)
      })()
      break
    }
    case model.BackendType.NaobBackend: {
      api = (async () => {
        const { API } = await import('./APIs/naob-backend')
        return new API(naobBackendURL)
      })()
      break
    }
    case model.BackendType.EctBackend: {
      api = (async () => {
        const { API } = await import('./APIs/eTranslate-backend')
        return new API(ectBackendURL) // XXX type hack
      })()
      break
    }
    case model.BackendType.Termer: {
      api = (async () => {
        const { API } = await import('./APIs/termerAPI')
        return new API(backend.url as string) // XXX type hack
      })()
      break
    }
    default:
      assertNever(backend.type)
  }
  _backendsApiCache[key] = api
  return api
}

function createBackend(
  backend: model.BackendType | model.BackendDescriptor
): model.Backend {
  let backendDescriptor: model.BackendDescriptor
  if (backend in model.BackendType) {
    backendDescriptor = defaultBackendDescriptors[backend as model.BackendType]
  } else {
    backendDescriptor = backend as model.BackendDescriptor
  }

  const backend2 = JSON.parse(JSON.stringify(backendDescriptor))
  backend2.id = backend2.type
  return backend2
}

interface Streams {
  wordlist?: flyd.Stream<{
    wordlist: Wordlist
    regexes: string[]
    loaded: boolean
  }>
  sources: { [key: string]: flyd.Stream<model.SourceCollection> }
  availableBackendTypes?: flyd.Stream<Set<model.BackendType>>
  loadingData?: flyd.Stream<boolean>
}

type Mode = 'slave' | 'master'

let addAllowedDomain: string | undefined = undefined
const el = document.querySelector(
  '#tingtunGlossary, script[src$="glossary.js"]'
)
if (el) {
  // @ts-ignore: script allways has src
  addAllowedDomain = new URL(el.getAttribute('src')).host
} else {
  addAllowedDomain = window.location.host
}

class Termer implements TermerCore {
  private _model: flyd.Stream<model.Model>

  protected modelGetters: model.ModelGetters = model.get

  protected mode: Mode = 'slave'

  protected masterPort?: MessagePort

  protected slavePorts: MessagePort[] = []

  private timeout = -1

  private Queue: Queue<model.Message> = new Queue()

  protected searchResults: flyd.Stream<model.SearchTermCollection>

  protected selectedSources: flyd.Stream<model.GlossaryCompoundIdString[]>

  protected _streams: Streams = { sources: {} }

  private storage: Storage = new Storage(addAllowedDomain)

  private termerDatabase: TermerDatabase = new TermerDatabase(addAllowedDomain)

  private globalStorageKey = 'termer-core'

  // settings: {}

  public constructor(
    backendsToAdd?: (model.BackendType | model.BackendDescriptor)[]
  ) {
    this._model = model.model
    if (!backendsToAdd) {
      backendsToAdd = [model.BackendType.Termer]
    }

    // INPUT -> UPDATE
    backendsToAdd.map(b => this.addBackend(b))
    const saveSettings: () => void = () => {
      const valuesToStore: (keyof model.ModelGetters)[] = [
        'userDeselectedSources',
        'userSelectedSources',
        'userSelectedSourceLanguage',
        'userSelectedSourceGlossary',
        'userDeselectedSourceGlossary',
        'userGlossaryOrderById',
        'userSelectedTermDomains',
        'userSelectedFromLanguages',
        'userSelectedToLanguages',
        'uniqueToken',
        'statistics',
        'userDefault',
        'selectedToLanguages',
        'selectedFromLanguages'
      ]
      const globals = {
        uniqueToken: 1,
        statistics: 1,
        userDefault: 1
      }
      for (const key of valuesToStore) {
        const value = model.get[key]()
        let domainKey = model.get.locationDomain()
        if (key in globals) domainKey = this.globalStorageKey
        const results = this.storage.storeValue(key, value, domainKey)
        if (model.get.debug()) {
          console.log(results)
        }
      }
    }

    window.addEventListener('unload', () => {
      // 'unload' event fires just before window is closed.
      saveSettings()
    })

    // Not used: 'visibilitychange' event on document. It only triggers if the
    // tab is hidden, so not when the window is unfocused but still visible.
    //
    // The 'blur'/'focus' window events trigger on minimize, window focus
    // switched but still visible and tab switching.
    //
    // 'blur' in window 1 must happen before 'focus' in window 2, in order for
    // the values to be synced properly. I.e., values must be saved in window 1
    // before they are loaded in window 2.
    window.addEventListener('blur', () => {
      saveSettings()
    })
    if (this.storage.correctDomain) {
      window.addEventListener('focus', () => {
        this.fetchStorageValues()
      })
    }
    this.getTermerLanguages()

    // MODEL VIEW
    // combined results from all backends
    this.searchResults = flydLift(
      (searchResults, selectedSources, searchTerm) => {
        // return filterObjectByKeys(Object.keys(selectedSourceDict), sources)
        const response: Record<model.SearchTerm, model.GlossaryLexemes> = {}
        if (searchResults[searchTerm]) {
          response[searchTerm] = {}
          Object.entries(searchResults[searchTerm])
            .filter(([, remoteData]) => {
              return isSuccess(remoteData) || isLoading(remoteData) // && Object.keys(selectedSources).includes(array[0])
            })
            .map(([sourceId, remoteData]) => {
              if (isSuccess(remoteData)) {
                let newValue: string[] = []
                Object.entries(selectedSources).forEach(
                  ([selectedSourceId, glossaries]) => {
                    for (const glossary of glossaries) {
                      const glossaryId = selectedSourceId + '/' + glossary.id
                      if (glossaryId === sourceId) {
                        newValue = remoteData.data
                      }
                    }
                  }
                )
                if (newValue.length > 0) {
                  response[searchTerm][sourceId] = {
                    data: newValue,
                    type: 'success'
                  }
                }
                // response[searchTerm][sourceId] = {'data': remoteData.data, 'type': 'success'}
              } else if (isLoading(remoteData)) {
                response[searchTerm][sourceId] = remoteData
              }
            })
        }
        return response
      },
      model.get.searchResults,
      model.get.selectedSources,
      model.get.searchTerm
    )

    this.selectedSources = model.get.selectedGlossaryIDs

    const frames = getAllFrames()
    frames.forEach((f: Window) => {
      if (f === window) return
      TermerMessage.send(f, TermerMessage.announce())
    })

    // XXX Android Firefox do not support MessagePort
    // TODO: Add support for Android Firefox
    // https://developer.mozilla.org/en-US/docs/Web/API/MessagePort
    /*
    // Promote to master if not in iframe
    if (!this.inIframe()) {
      this.mode = 'master'
      this.addModelTriggers()
      this.Queue.handleMessagesInQueue(this.updateModel.bind(this))
    }
    */

    // Set who should be master for termer.
    // Now master is set to be the termer Iframe for the top window
    if ((this.storage.correctDomain && window.parent === top
      && window.name === 'tingtun_move_handler_tooltip')
     || (this.storage.correctDomain && window === top)) {
      // document.readyState === 'complete'
      const termerCore = this
      const setSettings = (siteConf: SiteConfiguration): void => {
        // Site settings, only to be applied if we’re not in an iframe.

        // Add site default source/target languages to the respective lists of
        // selected languages.
        if (siteConf.backends) {
          siteConf.backends.map(backend => {
            Object.values(model.BackendType).forEach(
              (element: model.BackendType) => {
                if (element === backend) {
                  termerCore.addBackend(element)
                }
              }
            )
          })
        }
        if ('sourceLanguages' in siteConf) {
          siteConf.sourceLanguages.map(langCode =>
            termerCore.selectFromLanguage(langCode)
          )
        }
        if ('targetLanguages' in siteConf) {
          siteConf.targetLanguages.map(langCode =>
            termerCore.selectToLanguage(langCode)
          )
        }
        if ('backendSoruceOn' in siteConf) {
          termerCore.setBackendDefaultOn(siteConf.backendSoruceOn)
        }
        if ('apikeys' in siteConf) {
          // Map app site to Termer api keys
          Object.entries(siteConf.apikeys).map(([backendId, apikey]) => {
            if (backendId in termerCore._model().backends) {
              termerCore.addApiKey(backendId, apikey)
            }
          })
        }
        if ('excludeMarkups' in siteConf) {
          termerCore.addExludeMarkups(siteConf.excludeMarkups)
        }
        if ('sourceRank' in siteConf) {
          termerCore.setSourceRank(siteConf.sourceRank)
        }
        if ('mandatorySourcesOn' in siteConf) {
          termerCore.setMandatorySourcesOn(siteConf.mandatorySourcesOn)
        }

        termerCore.setSiteConfig(siteConf)

        termerCore.setSiteSettingState(true)
      }

      if (document.readyState === 'complete') {
        fetchSiteConfiguration(window.location.href).then(setSettings)
      } else {
        window.addEventListener('load', function() {
          fetchSiteConfiguration(window.location.href).then(setSettings)
        })
      }

      this.mode = 'master'
      // Tell top window that your master for updates
      const message = TermerMessage.master()
      TermerMessage.send(window.parent, message)

      this.addModelTriggers()
      this.Queue.handleMessagesInQueue(this.updateModel.bind(this))
      window.setInterval(logSynchroniser, LOG_SYNC_INTERVAL)
    }

    window.addEventListener('message', this.handleTermerMessage.bind(this))

    if (this.storage.correctDomain) {
      this.waitForDomain().then((domain) => {
        this.fetchStorageValues()
      })
    }
  }

  private async waitForDomain(): Promise<model.LocationDomain> {
    const string = this.modelGetters.locationDomain()
    if (string) {
      return string
    } else {
      return new Promise(resolve =>
        setTimeout(() => this.waitForDomain().then(resolve), 100)
      )
    }
  }

  private async fetchStorageValues(): Promise<void> {
    const locationDomain = this.modelGetters.locationDomain()
    const deselected = this.storage.fetchValue(
      'userDeselectedSources',
      locationDomain
    )
    if (deselected.status === 'success' && deselected.value) {
      const values: model.SourceCompoundIdString[] = deselected.value
      this.setUserDeselectSource(values)
      // values.forEach(variable => this.userDeselectSource(variable))
    }

    const selected = this.storage.fetchValue(
      'userSelectedSources',
      locationDomain
    )
    if (selected.status === 'success' && selected.value) {
      const values: model.SourceCompoundIdString[] = selected.value
      this.setUserSelectSource(values)
      // values.forEach(variable => this.userSelectSource(variable))
    }

    const selectedGlossaries = this.storage.fetchValue(
      'userSelectedSourceGlossary',
      locationDomain
    )
    if (selectedGlossaries.status === 'success' && selectedGlossaries.value) {
      const values: model.GlossaryCompoundIdString[] = selectedGlossaries.value
      this.setUserSelectedSourceGlossary(values)
    }

    const deselectedGlossaries = this.storage.fetchValue(
      'userDeselectedSourceGlossary',
      locationDomain
    )
    if (
      deselectedGlossaries.status === 'success' &&
      deselectedGlossaries.value
    ) {
      const values: model.GlossaryCompoundIdString[] =
        deselectedGlossaries.value
      this.setUserDeselectedSourceGlossary(values)
    }

    const spesific = this.storage.fetchValue(
      'userSelectedSourceLanguage',
      locationDomain
    )
    if (spesific.status === 'success' && spesific.value) {
      const values: model.LanguagePairCompoundIdString[] = spesific.value
      this.setUserSelectedSourceLanguages(values)
      // values.forEach(variable => this.selectUserSelectedSourceLanguage(variable))
    }

    const userDefaultSettings = this.storage.fetchValue(
      'userDefault',
      this.globalStorageKey
    )

    let userDefaults
    if (userDefaultSettings.status === 'success') {
      this.updateModel(
        model.message.setUserDefaultSelection(userDefaultSettings.value)
      )
      userDefaults = userDefaultSettings.value
    }

    const toLanguages = this.storage.fetchValue(
      'userSelectedToLanguages',
      locationDomain
    )
    if (
      toLanguages.status === 'success' &&
      toLanguages.value &&
      toLanguages.value.length > 0
    ) {
      const values: model.LanguageCode[] = toLanguages.value
      this.setUserToLanguages(values)
      values.map((langCode: string) =>
        this.selectToLanguage(langCode)
      )
      // values.forEach(variable => this.selectToLanguage(variable))
    } else if (userDefaults && userDefaults.userSelectedTargetLanguage) {
      this.setToLanguages(userDefaults.userSelectedTargetLanguage)
    } else {
      this.setDefaultToLanguages()
    }

    const fromLanguages = this.storage.fetchValue(
      'userSelectedFromLanguages',
      locationDomain
    )
    if (
      fromLanguages.status === 'success' &&
      fromLanguages.value &&
      fromLanguages.value.length > 0
    ) {
      const values: model.LanguageCode[] = fromLanguages.value
      this.setUserFromLanguages(values)
      values.map((langCode: string) =>
        this.selectFromLanguage(langCode)
      )
      // values.forEach(variable => this.selectFromLanguage(variable))
    } else if (userDefaults && userDefaults.userSelectedSourceLanguage) {
      this.setFromLanguages(userDefaults.userSelectedSourceLanguage)
    }

    const uniqueToken = this.storage.fetchValue(
      'uniqueToken',
      this.globalStorageKey
    )
    if (uniqueToken.status === 'success' && uniqueToken.value) {
      model.update(model.message.addUniqueToken(uniqueToken.value))
    } else {
      // Generate unique UUID if missing.
      const { v4: generateUuid } = (await import('uuid')).default
      const token = generateUuid()
      model.update(model.message.addUniqueToken(token))
    }


    const userSelectedTermDomains = this.storage.fetchValue(
      'userSelectedTermDomains',
      locationDomain
    )
    if (userSelectedTermDomains.status === 'success' && userSelectedTermDomains.value) {
      const domainValues: string[] = userSelectedTermDomains.value
      model.update(
        model.message.setUserSelectedTermDomains(domainValues)
      )
    }

    const selectedToLanguages = this.storage.fetchValue(
      'selectedToLanguages',
      locationDomain
    )

    if (selectedToLanguages.status === 'success' && selectedToLanguages.value) {
      selectedToLanguages.value.map((langCode: string) =>
        this.selectToLanguage(langCode)
      )
    }

    const selectedFromLanguages = this.storage.fetchValue(
      'selectedFromLanguages',
      locationDomain
    )
    if (selectedFromLanguages.status === 'success' && selectedFromLanguages.value) {
      selectedFromLanguages.value.map((langCode: string) =>
        this.selectFromLanguage(langCode)
      )
    }

    const userGlossaryOrderById = this.storage.fetchValue(
      'userGlossaryOrderById',
      locationDomain
    )
    if (userGlossaryOrderById.status === 'success' && userGlossaryOrderById.value) {
      this.setUserGlossaryOrderById(userGlossaryOrderById.value)
    }

    const statistics = this.storage.fetchValue(
      'statistics',
      this.globalStorageKey
    )
    if (statistics.status === 'success' && statistics.value) {
      if (Array.isArray(statistics.value)) {
        statistics.value = statistics.value.map(
          (
            v:
              | LocalData<ResultsInfoLogMessage | SearchInfoLogMessage>
              | ResultsInfoLogMessage
              | SearchInfoLogMessage
          ) => {
            // Migration: wrap any plain values in LocalData
            if (isLocalData(v)) return v
            else return localData.notSynced(v)
          }
        )
        // Migration: convert from Array to Object with unique IDs.
        const { v4: generateUuid } = (await import('uuid')).default
        statistics.value = statistics.value.reduce(
          (acc: Statistics, val: StatisticsItem) => {
            acc[generateUuid()] = val
            return acc
          },
          {}
        )
      }
      model.update(
        model.message.patchModelObject('statistics', statistics.value)
      )
    }
  }

  private handleTermerMessageInMaster(msg: TermerMessage.FromSlave): void {
    switch (msg.type) {
      case TermerMessage.Type.UpdateModel:
        this.updateModel(msg.message)
        break
      case TermerMessage.Type.Port: {
        if (msg.port) {
          this.slavePorts.push(msg.port)
          msg.port.onmessage = this.handleTermerMessage.bind(this)
          // initialize the slave by sending the whole model
          const message = model.message.replaceModel(model.model())
          TermerMessage.send(msg.port, TermerMessage.updateModel(message))
        }
        break
      }
      case TermerMessage.Type.Announce: {
        const message = TermerMessage.master()
        if (msg.source) {
          TermerMessage.send(msg.source, message)
        }
        break
      }
    }
  }

  private handleTermerMessageInSlave(msg: TermerMessage.FromMaster): void {
    switch (msg.type) {
      case TermerMessage.Type.UpdateModel:
        model.update(msg.message)
        break
      case TermerMessage.Type.Master: {
        if (!msg.source) return
        clearTimeout(this.timeout)
        const { port1, port2 } = new MessageChannel()
        this.masterPort = port1
        this.masterPort.onmessage = this.handleTermerMessage.bind(this)
        const message = TermerMessage.port(port2)
        TermerMessage.send(msg.source, message)
        this.Queue.handleMessagesInQueue(this.updateModel.bind(this))
        break
      }
    }
  }

  // set up link to master if the master was found
  private handleTermerMessage(msg: MessageEvent): void {
    if (!msg.data.type) return
    const termerMsg = TermerMessage.eventToTermerMessage(msg)
    if (!termerMsg) return
    switch (this.mode) {
      case 'master':
        if (TermerMessage.isFromSlave(termerMsg)) {
          this.handleTermerMessageInMaster(termerMsg)
        } else {
          console.error(new Error('Master received message from master'))
        }
        break
      case 'slave':
        if (TermerMessage.isFromMaster(termerMsg)) {
          this.handleTermerMessageInSlave(termerMsg)
        } else {
          if (termerMsg.type === TermerMessage.Type.Announce) {
            // ignore `Announce` messages from other slaves
            break
          }
          console.error(new Error('Slave received message from slave'))
        }
        break
    }
  }

  protected updateModel(message: model.Message): void {
    if (this.mode === 'master') {
      model.update(message)
      this.slavePorts.forEach(port => {
        TermerMessage.send(port, TermerMessage.updateModel(message))
      })
    } else {
      // slave
      const msg = TermerMessage.updateModel(message)
      if (this.masterPort) {
        TermerMessage.send(this.masterPort, msg)
      } else {
        this.Queue.enqueueMessage(message)
      }
    }
  }

  protected addModelTriggers(): void {
    // Log search attempt
    flydLift(
      (term, token) => {
        if (!term || !token) {
          // Don’t log if term is not defined. Also, token can change only once,
          // from null to an ID. We can’t log without a token, so it’s included
          // as a trigger.
          return
        }
        const log = model.message.createSearchInfoLog({ token })
        this.updateModel(log)
      },
      model.get.searchTerm,
      model.get.uniqueToken
    )

    // Check login
    model.get.backends
      .map(backends => {
        return Object.values(
          filterObjectBy(({ config: { authenticated } }) => {
            return isNotAsked(authenticated)
          }, backends)
        )
      })
      .pipe(filterEmpty)
      .pipe(dropRepeats)
      .map(backends => this.checkLogin.bind(this)(backends[0]))

    // REACT: perform search
    const [sources, externalSources] = splitObjectStream(
      x => isSuccess(x) && x.data.externalData,
      model.get.sources
    )

    /*
     * Note: Need to have the split external and local
     * sources also only have the selected languages.
     */
    const selectedLocalSources = flydLift(
      (sorted, selected) => {
        const newObj = Object.keys(selected)
          .filter(key => Object.keys(sorted).includes(key))
          .reduce(
            (
              obj: Record<model.SourceCompoundIdString, Glossary[]>,
              key: string
            ) => {
              obj[key] = selected[key]
              return obj
            },
            {}
          )
        return newObj
      },
      sources,
      model.get.selectedSources
    )

    const selectedExternalSources = flydLift(
      (sorted, selected) => {
        const newObj = Object.keys(selected)
          .filter(key => Object.keys(sorted).includes(key))
          .reduce(
            (
              obj: Record<model.SourceCompoundIdString, Glossary[]>,
              key: string
            ) => {
              obj[key] = selected[key]
              return obj
            },
            {}
          )
        return newObj
      },
      externalSources,
      model.get.selectedSources
    )

    this.performSearchFor(selectedLocalSources)
    this.performSearchFor(selectedExternalSources)

    // REACT: get sources for backends
    const backendSettingsNotAsked = model.get.backendApikeySettings
      .map(apikeySetting =>
        Object.entries(apikeySetting)
          .filter(([, settings]) => isNotAsked(settings))
          .map(([backendId]) => backendId)
      )
      .pipe(debounceTime(500)) // Stops doulicate lookups of apisettings

    const backendSettingsSucess = model.get.backendApikeySettings.map(
      apikeySetting =>
        Object.entries(apikeySetting)
          .filter(([, settings]) => isSuccess(settings))
          .map(([backendId]) => backendId)
    )

    const backendSourcesNotAsked = model.get.backendSources.map(
      backendSources =>
        Object.entries(backendSources)
          .filter(([, sources]) => isNotAsked(sources))
          .map(([backendId]) => backendId)
    )
    /*
    flydLift(
      (backendIds, backends) =>
        Object.keys(backends).filter(x => backendIds.includes(x)),
      backendSourcesNotAsked,
      model.get.backendSources
    )
      .pipe(dropRepeats)
      .pipe(filterEmpty)
      .map(([x]) => this.sourceListDownloader(model.get.backends()[x]))
*/

    flydLift(
      (backendSettingsLoaded, backends) =>
        backends.filter(x => backendSettingsLoaded.includes(x)),
      backendSettingsSucess,
      backendSourcesNotAsked
    )
      .pipe(dropRepeats)
      .pipe(filterEmpty)
      .map(([x]) => this.sourceListDownloader(model.get.backends()[x]))

    flydLift(
      (backendIds, backends, siteSettingsLoaded) => {
        if (siteSettingsLoaded) {
          return Object.values(filterObjectByKeys(backendIds, backends))
        } else return []
      },
      backendSettingsNotAsked,
      model.get.backends,
      model.get.siteSettingsReady
    )
      .pipe(dropRepeats)
      .pipe(filterEmpty)
      .map(([x]) => this.apikeySettingsDownloader(x))

    // REACT backends, selected sources (with wordlists) -> download wordlists
    // split stream:
    // 1: RemoteData.Success
    // 2: RemoteData.NotAsked
    //
    // map wordlistDownloader over (1).
    // map sourceDownloader over (2).

    const wordlistsNotDownloadedID = model.get.wordlists
      .map(x => {
        return new Set(Object.keys(filterObjectByPred(isNotAsked, x)))
      })
      .pipe(debounceTime(1))

    const glossariesWithWordlists = flydLift(
      (selectedSources, realSources) => {
        const sources = filterObjectByPred(
          isSuccess,
          filterObjectByKeys(Object.keys(selectedSources), realSources)
        )
        const hasWordlist = filterObjectBy(
          source => source.data.markupWords,
          sources
        )
        const glossaries = Object.entries(hasWordlist)
          .map(([key, value]) => {
            const glossIds = selectedSources[key].map(x => {
              return key + '/' + x.id
            })
            return glossIds
          })
          .flat()

        return glossaries
      },
      model.get.selectedSources,
      model.get.sources
    )
      .pipe(dropRepeats)
      .pipe(debounceTime(1))

    const sourcesWithWordlistsToDownload = flydLift(
      (selectedGlossaires, wordlistSourceIds) => {
        const sources = [...wordlistSourceIds].filter(id =>
          selectedGlossaires.includes(id)
        )
        return sources
      },
      glossariesWithWordlists,
      wordlistsNotDownloadedID
    )
      .pipe(dropRepeats)
      .pipe(debounceTime(1)) // Not to reload to fast when asking for wordlists

    const wordlistDownloader = new ParallelTasks(5)
    flydLift(
      (sources, termDomains, backends) => {
        const wordlistUpdate: model.WordlistCollection = {}
        const wordlistRegUpdate: model.RegexCollection = {}

        sources.forEach(id => {
          const idString = model.toIdString(id)
          wordlistUpdate[idString] = remoteData.loading()
          wordlistRegUpdate[idString] = remoteData.loading()
        })
        this.updateModel(model.message.addMultipleWordlist(wordlistUpdate))
        this.updateModel(
          model.message.addMultipleWordlistRegexes(wordlistRegUpdate)
        )
        sources.forEach(id => {
          const glossaryId = model.toGlossaryId(id)
          const backend = backends[glossaryId.backendId]
          wordlistDownloader.addTask(() =>
            this.fetchWordlist(backend, glossaryId, termDomains)
          )
        })
      },
      sourcesWithWordlistsToDownload,
      model.get.userSelectedTermDomains,
      model.get.backends
    )

    /*
    flydLift((backends: model.BackendCollection) => {
      Object.values(backends).forEach(backend => {
        this.getLanguages(backend)
      })
    }, model.get.backends)
    */

    // Stream containing the search results for the current search term.
    const searchResultsForTerm: flyd.Stream<
      model.GlossaryLexemes | {}
    > = flydLift(
      (term, results) => {
        return results[term] || {}
      },
      model.get.searchTerm,
      model.get.searchResults
    )

    // This stream contains only the selected source ids which are not
    // registered in the search results for the current search term.
    const idsNotInSearchResults = flydLift(
      (selected, searchResults) => {
        const keys = new Set(Object.keys(searchResults))
        return selected.filter(x => !keys.has(x))
      },
      this.selectedSources,
      searchResultsForTerm
    )

    // Sends `requestSearch` message for each ID in the stream.
    flydLift(
      (term, [id]) => {
        if (id) {
          model.update(
            model.message.requestSearch(model.toGlossaryId(id), term)
          )
        }
      },
      model.get.searchTerm,
      idsNotInSearchResults
    )

    flydLift(
      async (backends) => {
        const domains = model.get.termDomains()
        for (const backend of Object.keys(backends)) {
          const domainStatus = domains[backend]
          if (!domainStatus) {
            this.updateModel(model.message.addTermDomain(
              backend,
              {
                'type': 'loading'
              }
            ))
            this.getTermDomains(backend)
          }
        }
      },
      model.get.backends
    ).pipe(debounceTime(5))

    const initialGlossaryOrderStream: flyd.Stream<
      string[]
    > = flydLift(
      (sources, mandatorySourcesOn) => {
        const returnObj = Object.entries(sources).filter(([id, remote]) => {
          return !mandatorySourcesOn.includes(id)
        }).map(([id, remote]) => {
          if (remote.type !== 'success') return []
          return [...remote.data.glossaries].sort((a,b) => {
            if (a.name < b.name) {
              return -1
            }
            if (a.name > b.name) {
              return 1
            }
            return 0
          }).map(gloss => {
            return id + '/' + gloss.id
          })
        }).flat()
        return returnObj
      },
      model.get.sources,
      model.get.mandatorySourcesOn
    )
    .pipe(filterEmpty)
    .pipe(dropRepeats)

    flydLift(
      (glossaryOrder) => {
        this.setInitialGlossaryOrderById(glossaryOrder)
      },
      initialGlossaryOrderStream
    )
    .pipe(dropRepeats)

    /*
    flyd.combine((backends, searchTerm) => {
      Object.values(backends()).map(backend => {
        backend.search(searchTerm())
      })
    }, [this.backends, this.searchTerm])
    */

    // XXX: provide functions to perform API calls across all backends,
    // concatenating the results in some way.

    // XXX: Multiple instances of Termer needs to be synced.
    // For instance: backend API calls should be performed in one instance and
    // the results  propagated to others.
    //
    // Can we simply perform API calls in the first Termer instance that is
    // able to do it? So if this instance get a request and can perform it, it
    // is not forwarded anywhere. The data (result from the API call) is
    // synced.  (The state of api calls (loading etc) must also be synced)
    //
    // However, if this instance is not able to perform the API call (maybe it
    // is on the wrong subdomain), the API call is forwarded to the other
    // instances. Any other instance that cannot perform the call just does
    // nothing. The first instance that is able to perform the call performs it,
    // after checking that no one else has handled it. (maybe a mutex?)
    //
    // Naïve copying of data requires that all instances have their own copy.
    // This will include data that often is required in only one of the
    // instances, for example search results or wordlists.
    //
    // Can we wrap downloaded data so that we can sync it betweeen instances on
    // demand?
    //
    // - Get from other instances of Termer:
    // ???

    // this.settings = settings
    //
    // When loading termer-core:
    // - if domain is not the configured domain (for web storage):
    //   Use thin version of termer-core, that is a wrapper around the termer-core API.
    //   On instantiation, the wrapper connects to an instance of the complete
    //   termer-core OR creates such an instance in an iframe.
    //   The whole API is forwarded. E.g:
    //   - backends(): A stream. update stream value whenever the main core
    //     backends stream changes. I.e, the thin implementation of backends must
    //     subscribe to such changes. This goes for all output streams.
    //   - search(): search for definitions. simply post this back to the main core.
    //       return searchResults stream
    //   - get wordlist(): simple output stream
    //
  }

  private performSearchFor(
    selectedSources: flyd.Stream<model.SourceGlossarySelection>
  ): void {
    const searchResultsNotAsked: flyd.Stream<[
      model.SearchTerm,
      model.GlossaryCompoundId[]
    ][]> = flydLift(
      (results, searchTerm) => {
        return Object.entries(results)
          .map<[model.SearchTerm, model.GlossaryCompoundId[]]>(
            ([term, result]) => {
              const ids = Object.entries(result)
                .filter(([, listOfLexemeIds]) => isNotAsked(listOfLexemeIds))
                .map(([glossaryId]) => model.toGlossaryId(glossaryId))
              return [term, ids]
            }
          )
          .filter(([term, ids]) => term === searchTerm && ids.length > 0)
      },
      model.get.searchResults,
      model.get.searchTerm.pipe(flydFilter(x => {
        if (x && x.length < 1001) return x
      })) // drop empty search terms.
    )
      .pipe(dropRepeats)
      .pipe(debounceTime(1))

    const notAskedAndSelected: flyd.Stream<[
      model.SearchTerm,
      model.GlossaryCompoundId[]
    ][]> = flydLift(
      (notAsked, selectedSources) => {
        return notAsked.map<[model.SearchTerm, model.GlossaryCompoundId[]]>(
          ([term, ids]) => {
            return [
              term,
              ids.filter(id => {
                const sourceCompoundId = model.toSourceId(id)
                const sourceCompoundIdString = model.toIdString(
                  sourceCompoundId
                )
                if (sourceCompoundIdString in selectedSources) {
                  const glossarySelection =
                    selectedSources[sourceCompoundIdString]
                  for (const glossary of glossarySelection) {
                    if (glossary.id.toString() === id.glossaryId) {
                      return true
                    }
                  }
                } else return false
              })
            ]
          }
        )
      },
      searchResultsNotAsked,
      selectedSources
    )
      .pipe(filterEmpty)
      .pipe(dropRepeats)
    // .map(x => {
    //   return x
    // })

    notAskedAndSelected.map(([[term, ids]]) => {
      // This function processes the first element from `notAskedAndSelected`, and that
      // element is subsequently filtered out in the `notAskedAndSelected` stream
      // definition above.

      // XXX: Backends cant be part of the stream to be listend too.
      // That may cause diplicate searches as backend info may be updated
      // async when seaching triggering the stream again.
      const backends = model.get.backends()
      const x: Record<string, model.GlossaryCompoundId[]> = R.groupBy(
        x => x.backendId,
        ids
      )
      Object.entries(x).forEach(([backendId, id]) => {
        const backend = backends[backendId]
        this.performSearch(backend, term, id)
      })
    })
  }

  public addApiKey(backend: model.BackendId, apiKey: model.ApiKey): void {
    this.updateModel(model.message.addApiKey(backend, apiKey))
  }

  public setExludeMarkups(list: model.ExcludeMarkupList): void {
    this.updateModel(model.message.setExcludeMarkups(list))
  }

  public addExludeMarkups(list: model.ExcludeMarkupList): void {
    this.updateModel(model.message.addExcludeMarkups(list))
  }

  public get backends(): typeof model.get.backends {
    return model.get.backends
  }

  public get availableBackendTypes(): flyd.Stream<Set<model.BackendType>> {
    if (this._streams.availableBackendTypes) {
      return this._streams.availableBackendTypes
    }
    return (this._streams.availableBackendTypes = flyd.stream(
      new Set<model.BackendType>([model.BackendType.Termer])
    ))
  }

  public async addBackend(
    backend: model.BackendType | model.BackendDescriptor
  ): Promise<void> {
    const b = createBackend(backend)
    this.updateModel(model.message.addBackend(b))
  }

  // combined API/data: Perform operations and receive data for all backends:
  // - Termer.search()
  // - Termer.searchResults()
  //
  // not implemented (yet)
  // - Termer.sources()
  // - Termer.availableSources()
  // - Termer.wordlist()
  // - …
  public search(term: string): void {
    // TODO:
    // Additional arguments:
    // Where to search:
    // - full text
    // - headword
    // How to search:
    // - exact match
    // - longest match
    // - regex
    //
    // - Filter search results on term?

    // INPUT (searchterm) -> UPDATE (add search term)
    // Input stream for search commands.
    this.updateModel(model.message.searchTerm(term))
  }

  public get wordlist(): flyd.Stream<{
    wordlist: Wordlist
    regexes: string[]
    loaded: boolean
  }> {
    // returns the concatenated list containing all wordlists from active sources.

    // const flattenedWordlists = filteredWordlists.map(wordlists => {
    //   const values = Object.values(wordlists)
    //   const flat = ([] as Array<string>).concat.apply([], values)
    //   return flat
    // })
    // return flattenedWordlists

    if (this._streams.wordlist) {
      return this._streams.wordlist
    }
    // MODEL VIEW merged & flattened wordlists
    const wordlistsWithData = model.get.wordlists
      .map(x => filterObjectByPred(isSuccess, x))
      .pipe(dropRepeats)

    const wordlistsLoaded = model.get.wordlists
      .map(x => {
        return Object.values(filterObjectByPred(isLoading, x)).length === 0
      })
      .pipe(dropRepeats)

    const selectedWordlists = flydLift(
      (selectedSources, wordlists) =>
        Object.values(filterObjectByKeys(selectedSources, wordlists)),
      this.selectedSources,
      wordlistsWithData
    ).pipe(dropRepeats)

    const excludedMarkupes = model.get.excludeMarkups
      .pipe(dropRepeats)
    const wordlistStream = selectedWordlists.map(wordlists => {
      let wordlistsArr = wordlists
        .map(x => x.data)
        // Note: Array.flat() requires polyfill for IE & Edge
        .flat()
        // Turn words with only first letter uppercase into all lowercase.
        // E.g. `Example` -> `example`, but `ABC` -> `ABC`.
        .map(x => {
          if (onlyFirstLetterUppercaseRe.test(x)) {
            return x.toLowerCase()
          } else return x
        })
      // Eliminate duplicate entries.
      // This is not really faster than the previous method which used a Set,
      // but it should be able to rewrite this in order to not hang the browser
      // while processing the list.
      return arrayUniq(wordlistsArr)
    })

    const regexesWithData = model.get.wordlistRegexes
      .map(x => filterObjectByPred(isSuccess, x))

    const selectedRegexes = flydLift(
      (selectedSources, regexes) => {
        return Object.values(filterObjectByKeys(selectedSources, regexes))
      },
      this.selectedSources,
      regexesWithData
    ).pipe(dropRepeats)

    const regexStream = selectedRegexes.map(regexes =>
      regexes
        .map(x => x.data)
        // Note: Array.flat() requires polyfill for IE & Edge
        .flat()
    )

    const wordlistStreamFilterd = flydLift(
      (wordlist, excludedMarkupes) => {
        return wordlist.filter(x => {
          return !excludedMarkupes.includes(x)
        })
      },
      wordlistStream,
      excludedMarkupes
    ).pipe(dropRepeats)

    this._streams.wordlist = flydLift(
      (wordlist, regexes, loaded) => ({ wordlist, regexes, loaded }),
      wordlistStreamFilterd,
      regexStream,
      wordlistsLoaded
    ).pipe(debounceTime(500))
    return this._streams.wordlist

    /*
    this._streams.wordlist = this._backends.chain(backends => {
    console.log('(get wordlist) backends ->', backends)
      const mergedWordlistsFromBackends = Object.values(backends).map(x => x.mergedWordlist)
      // Note: Array.flat() requires polyfill for IE & Edge
      return flydLift(
        (...wordlists : string[][]) => wordlists.flat(),
        ...mergedWordlistsFromBackends)
    })
    .map(x => {console.log('(get wordlist) mergeAll', JSON.stringify(x)); return x})
    // .pipe(flyd.scan((a, b) => (b.forEach(a.add.bind(a)), a), new Set<string>()))
    // .map(x => [...x])
    // .map(x => {console.log('(get wordlist) merged', JSON.stringify(x)); return x})
    return this._streams.wordlist
    */
  }

  public get loadingData(): flyd.Stream<boolean> {

    if (this._streams.loadingData) {
      return this._streams.loadingData
    }

    const wordlistsLoaded = model.get.wordlists
      .map(x => {
        return Object.values(filterObjectByPred(isLoading, x)).length === 0
      })
      .pipe(dropRepeats)

    this._streams.loadingData = flydLift(
      (wlLoading) =>  {
        let loading = !wlLoading
        return loading
      },
      wordlistsLoaded
    ).pipe(debounceTime(500))
    return this._streams.loadingData
  }

  // MODEL VIEW
  // Sources for one backend
  public availableSources(
    backendId: model.BackendId
  ): flyd.Stream<model.SourceCollection> {
    if (this._streams.sources[backendId]) {
      return this._streams.sources[backendId]
    }
    return (this._streams.sources[backendId] = flydLift(
      sources =>
        filterObjectBy(
          (value, key) => helpers.toSourceId(key).backendId === backendId,
          sources
        ),
      model.get.sources
    ))
  }

  public setAppDomain(
    domain: model.Domain
  ): void {
    this.updateModel(model.message.setAppDomain(domain))
  }

  public setUserGlossaryOrderById(
    glossaryIds: model.GlossaryCompoundIdString[]
  ): void {
    this.updateModel(model.message.setUserGlossaryOrderById(glossaryIds))
  }

  public setInitialGlossaryOrderById(
    glossaryIds: model.GlossaryCompoundIdString[]
  ): void {
    this.updateModel(model.message.setInitialGlossaryOrderById(glossaryIds))
  }

  public selectConfigSource(sourceId: model.SourceCompoundIdString[]): void {
    // TODO: handle selection per domain.
    this.updateModel(model.message.selectConfigSource(sourceId))
  }

  public userSelectSource(sourceId: model.SourceCompoundId): void {
    // TODO: handle selection per domain.
    this.updateModel(model.message.userSelectSource(sourceId))
  }

  public setUserSelectSource(sourceId: model.SourceCompoundIdString[]): void {
    // TODO: handle selection per domain.
    this.updateModel(model.message.setUserSelectSource(sourceId))
  }

  public deselectSource(sourceIds: model.SourceCompoundId[]): void {
    this.updateModel(model.message.deselectSource(sourceIds))
  }

  public userDeselectSource(sourceId: model.SourceCompoundId): void {
    this.updateModel(model.message.userDeselectSource(sourceId))
  }

  public setUserDeselectSource(sourceId: model.SourceCompoundIdString[]): void {
    this.updateModel(model.message.setUserDeselectSource(sourceId))
  }

  public selectUserFromLanguage(languageCode: model.LanguageCode): void {
    // console.log('***** selectUserFromLanguage *****')
    // TODO: handle selection per domain.
    this.updateModel(model.message.selectUserFromLanguage(languageCode))
  }

  public setUserFromLanguages(languageCode: model.LanguageCode[]): void {
    // console.log('***** setUserFromLanguages *****')
    // TODO: handle selection per domain.
    this.updateModel(model.message.setUserFromLanguages(languageCode))
  }

  public deselectUserFromLanguage(languageCode: model.LanguageCode): void {
    // console.log('***** deselectUserFromLanguage *****')
    this.updateModel(model.message.deselectUserFromLanguage(languageCode))
  }

  public selectUserToLanguage(languageCode: model.LanguageCode): void {
    // console.log('***** selectUserToLanguage *****')
    // TODO: handle selection per domain.
    this.updateModel(model.message.selectUserToLanguage(languageCode))
  }

  public setUserToLanguages(languageCode: model.LanguageCode[]): void {
    // console.log('***** setUserToLanguages *****')
    // TODO: handle selection per domain.
    this.updateModel(model.message.setUserToLanguages(languageCode))
  }

  public deselectUserToLanguage(languageCode: model.LanguageCode): void {
    // console.log('***** deselectUserToLanguage *****')
    this.updateModel(model.message.deselectUserToLanguage(languageCode))
  }

  public selectFromLanguage(languageCode: model.LanguageCode): void {
    // console.log('***** selectFromLanguage *****')
    // TODO: handle selection per domain.
    this.updateModel(model.message.selectFromLanguage(languageCode))
  }

  public setFromLanguages(languageCode: model.LanguageCode[]): void {
    // console.log('***** setFromLanguages *****')
    // TODO: handle selection per domain.
    this.updateModel(model.message.setFromLanguages(languageCode))
  }

  public deselectFromLanguage(languageCode: model.LanguageCode): void {
    // console.log('***** deselectFromLanguage *****')
    this.updateModel(model.message.deselectFromLanguage(languageCode))
  }

  public selectToLanguage(languageCode: model.LanguageCode): void {
    // console.log('***** selectToLanguage *****')
    // TODO: handle selection per domain.
    this.updateModel(model.message.selectToLanguage(languageCode))
  }

  public setToLanguages(languageCode: model.LanguageCode[]): void {
    // console.log('***** setToLanguages *****')
    // TODO: handle selection per domain.
    this.updateModel(model.message.setToLanguages(languageCode))
  }

  public deselectToLanguage(languageCode: model.LanguageCode): void {
    // console.log('***** deselectToLanguage *****')
    this.updateModel(model.message.deselectToLanguage(languageCode))
  }

  public setLocationDomain(locationDomain: model.LocationDomain): void {
    this.updateModel(model.message.setLocationDomain(locationDomain))
  }

  public selectUserSelectedSourceLanguage(
    key: model.LanguagePairCompoundIdString
  ): void {
    this.updateModel(model.message.selectUserSelectedSourceLanguage(key))
  }

  public setUserSelectedSourceLanguages(
    key: model.LanguagePairCompoundIdString[]
  ): void {
    this.updateModel(model.message.setUserSelectedSourceLanguages(key))
  }

  public deselectUserSelectedSourceLanguage(
    key: model.LanguagePairCompoundIdString
  ): void {
    this.updateModel(model.message.deselectUserSelectedSourceLanguage(key))
  }

  public addUserSelectedSourceGlossary(
    key: model.GlossaryCompoundIdString[]
  ): void {
    this.updateModel(model.message.addUserSelectedSourceGlossary(key))
  }

  public setUserSelectedSourceGlossary(
    key: model.GlossaryCompoundIdString[]
  ): void {
    this.updateModel(model.message.setUserSelectedSourceGlossary(key))
  }

  public removeUserSelectedSourceGlossary(
    key: model.GlossaryCompoundIdString[]
  ): void {
    this.updateModel(model.message.removeUserSelectedSourceGlossary(key))
  }

  public addUserDeselectedSourceGlossary(
    key: model.GlossaryCompoundIdString[]
  ): void {
    this.updateModel(model.message.addUserDeselectedSourceGlossary(key))
  }

  public setUserDeselectedSourceGlossary(
    key: model.GlossaryCompoundIdString[]
  ): void {
    this.updateModel(model.message.setUserDeselectedSourceGlossary(key))
  }

  public removeUserDeselectedSourceGlossary(
    key: model.GlossaryCompoundIdString[]
  ): void {
    this.updateModel(model.message.removeUserDeselectedSourceGlossary(key))
  }

  public setSourceRank(key: string[]): void {
    this.updateModel(model.message.setSourceRank(key))
  }

  public setSiteSettingState(state: boolean): void {
    // @ts-ignore The error is tested by the line above
    this.updateModel(model.message.siteSettingState(state))
  }

  public setMandatorySourcesOn(sources: model.SourceCompoundIdString[]): void {
    // @ts-ignore The error is tested by the line above
    this.updateModel(model.message.mandatorySourcesOn(sources))
  }

  public setBackendDefaultOn(backends: string[]): void {
    this.updateModel(model.message.setBackendDefaultOn(backends))
  }

  public setUserSelectedTermDomains(domains: string[]): void {
    this.updateModel(model.message.setUserSelectedTermDomains(domains))
    const wordlists = Object.keys(model.get.wordlists()).filter(x => {
      return x.startsWith('Termer')
    }).map(x => {
      const newVal = x.split('/')
      return {
        backendId: newVal[0],
        sourceId: newVal[1],
        glossaryId: newVal[2]
      }
    })
    wordlists.forEach(id => {
      this.updateModel(
        model.message.addWordlist(
          id,
          remoteData.notAsked()
        )
      )
    })
  }

  public saveUserDefault(): void {
    const sourceLang = model.get.selectedFromLanguages()
    const targetLang = model.get.selectedToLanguages()

    const settings: UserDefaultSetting = {
      // userGlossaryOrderById?: GlossaryCompoundIdString[]
      // userDeselectedSources?: SourceCompoundIdString[]
      // userSelectedSources?: SourceCompoundIdString[]
      userSelectedSourceLanguage: sourceLang,
      userSelectedTargetLanguage: targetLang
      // userSelectedSourceGlossary?: GlossaryCompoundIdString[]
      // userDeselectedSourceGlossary?: GlossaryCompoundIdString[]
      // userSelectedTermDomains?: string[]
    }

    this.updateModel(model.message.setUserDefaultSelection(settings))
  }

  public vueSettings(settings: model.VueSetting): void {
    this.updateModel(model.message.vueSettings(settings))
  }

  public setSiteConfig(config: model.SiteConfig): void {
    this.updateModel(model.message.setSiteConfig(config))
  }

  public addSearchResult(
    searchTerm: model.SearchTerm,
    data: Record<model.GlossaryCompoundIdString, string[]>
  ): void {
    this.updateModel(model.message.addSearchDidYouMean(searchTerm, data))
  }

  public async getTermDomains(
    backendId: string
  ): Promise<void> {
    const backends = model.get.backends()
    const backend = backends[backendId]
    const api = await backendApis(backend)
    if (api.getDomains) {
      const termDomains = await api.getDomains()
      const termDomainsObject: Record<string, model.TermDomain> = {}
      termDomains.forEach(element => {
        const termDomain: model.TermDomain = {
          'id': element.id.toString(),
          'code': element.domain_code || '',
          'name': element.domain_name
        }
        termDomainsObject[element.domain_number] = termDomain
      })
      this.updateModel(model.message.addTermDomain(
        backendId,
        {
          'type': 'success',
          'data': termDomainsObject
        }
      ))
    } else {
      this.updateModel(model.message.addTermDomain(
        backendId,
        {
          'type': 'success',
          'data': {}
        }
      ))
    }
  }

  public async login(
    backendString: string,
    username: string,
    password: string
  ): Promise<void> {
    const backends = model.get.backends()
    const backend = backends[backendString]
    const api = await backendApis(backend)
    const details = await api.login(username, password)
    let localLogin: any = localStorage.getItem('logins')
    if (localLogin) {
      localLogin = JSON.parse(localLogin)
      localLogin.Termer = details.key
      localStorage.setItem('logins', JSON.stringify(localLogin))
    } else {
      localLogin = JSON.stringify({'Termer': details.key})
      localStorage.setItem('logins', localLogin)
    }
    if (localLogin) {
      this.updateModel(
        model.message.setBackendLoggedIn(
          backend.id,
          remoteData.success(true)
        )
      )
    }
  }

  public async logout(
    backendString: string
  ): Promise<void> {
    const backends = model.get.backends()
    const backend = backends[backendString]
    const api = await backendApis(backend)
    const details = await api.logout()
    let localLogin: any = localStorage.getItem('logins')
    if (localLogin) {
      localLogin = JSON.parse(localLogin)
      delete localLogin.Termer
      localStorage.setItem('logins', JSON.stringify(localLogin))
    }
    this.updateModel(
      model.message.setBackendLoggedIn(
        backend.id,
        remoteData.success(false)
      )
    )
  }

  public async createSource(
    source: GlossaryData,
    backendId: string
  ): Promise<void> {
    const backends = model.get.backends()
    const backend = backends[backendId]
    const api = await backendApis(backend)
    const newSource = await api.createSource(source)

    const sourceCompoundId = model.generateSourceId(backend, newSource)
    this.updateModel(
      model.message.addSource(sourceCompoundId, remoteData.success(newSource))
    )
    const glossaries: model.GlossaryCollection = {}

    for (const glossary of newSource.glossaries) {
      const glossaryCompoundId = model.generateGlossaryId(
        sourceCompoundId,
        glossary.id
      )
      glossaries[model.toIdString(glossaryCompoundId)] = glossary
    }
    this.updateModel(
      model.message.addGlossaries(glossaries)
    )
  }

  public async createTerm(
    term: TermCreation,
    backendId: string
  ): Promise<void> {
    const backends = model.get.backends()
    const backend = backends[backendId]
    const api = await backendApis(backend)
    const newTermResponse = await api.createTerm(term)


    const definition = newTermResponse.definition
    const lexeme = newTermResponse.lexeme
    const sourceId = definition.foundIn || lexeme.foundIn
    const definitionCompoundId = model.generateDefinitionId(
      backend,
      sourceId,
      definition.id
    )

    const lexemeId: model.LexemeCompoundId = {
      backendId,
      sourceId,
      lexemeId: lexeme.id
    }
    const defId = { backendId, sourceId, definitionId: definition.id }
    const lexemeIdstring = model.toIdString(lexemeId)
    const glossaryCompId = { backendId, sourceId, glossaryId: term.source }
    this.updateModel(model.message.addDefinition(definitionCompoundId, definition))
    this.updateModel(model.message.addLexeme(lexemeId, lexeme))
    this.updateModel(model.message.addLexemeDefinitions(lexemeId, [defId]))
    this.updateModel(
      model.message.addGlossaryLexemeList(
        glossaryCompId,
        remoteData.success([lexemeIdstring])
      )
    )
    /*
    this.updateModel(
      model.message.addDefinition(definitionCompoundId, definition)
    )
    this.updateModel(model.message.addLexeme(lexemeId, lexeme))
    this.updateModel(model.message.addLexemeDefinitions(lexemeId, [defId]))
    */
  }

  public async updateSource(
    source: any,
    backendId: string
  ): Promise<void> {
    const backends = model.get.backends()
    const backend = backends[backendId]
    const api = await backendApis(backend)
    const id = source.id
    const updatedSource = await api.updateSource(id, source)

    const sourceCompoundId = model.generateSourceId(backend, updatedSource)
    this.updateModel(
      model.message.addSource(sourceCompoundId, remoteData.success(updatedSource))
    )
  }

  public async updateGlossary(
    glossary: GlossaryData,
    backendId: string
  ): Promise<void> {
    const backends = model.get.backends()
    const backend = backends[backendId]
    const api = await backendApis(backend)
    const id = glossary.id
    if (id) {
      const updatedGlossary = await api.updateGlossary(id, glossary)
      const sourceCompoundId = model.generateSourceId(backend, updatedGlossary.source_description)
      const glossaryCompoundId = model.generateGlossaryId(sourceCompoundId, updatedGlossary)
      this.updateModel(
        model.message.updateGlossary(glossaryCompoundId, updatedGlossary)
      )
    }
  }

  public async updateDefinition(
    definition: any,
    backendId: string
  ): Promise<void> {
    const backends = model.get.backends()
    const backend = backends[backendId]
    const api = await backendApis(backend)
    const id = definition.id
    const updatedDefinition = await api.updateDefinition(id, definition)


    const defCompId: model.DefinitionCompoundId = {
      backendId: 'Termer',
      sourceId: (updatedDefinition.definition.foundIn || '').toString(),
      definitionId: updatedDefinition.definition.id.toString()
    }

    // Update the definition
    this.updateModel(model.message.updateDefinition(defCompId, updatedDefinition.definition))

    const lexemes = updatedDefinition.lexemes || []
    const lexemesToAdd = []
    const lexDefsUpdates = []
    for (const lexeme of lexemes) {
      const lexCompId: model.LexemeCompoundId = {
        backendId: 'Termer',
        sourceId: (updatedDefinition.definition.foundIn || '').toString(),
        lexemeId: lexeme.id.toString()
      }
      lexemesToAdd.push(model.message.addLexeme(lexCompId, lexeme))
      lexDefsUpdates.push(model.message.addLexemeDefinitions(lexCompId, [defCompId]))
    }

    // Update all the lexmes and lesDefs
    this.updateModel(model.message.addMultipleLexemes(lexemesToAdd))
    this.updateModel(model.message.addMultipleLexemeDefinitions(lexDefsUpdates))
  }

  public async fetchGlossaryDefinitions(
    glossary: model.GlossaryCompoundId
  ): Promise<void> {
    this.updateModel(
      model.message.addGlossaryLexemeList(glossary, remoteData.loading())
    )
    const backend = this._model().backends[glossary.backendId]
    const api = await backendApis(backend)
    const glossaryDefinitions = api.getGlossaryDefinitionList(glossary)
    const lexemeIds: model.LexemeCompoundIdString[] = []
    const defMessageData = []
    const lexemeMessageData = []
    const lexDefMessageData = []
    for await (const dictResponse of glossaryDefinitions) {
      const definition = dictResponse.definition
      const lexeme = dictResponse.lexeme
      const sourceId = definition.foundIn || lexeme.foundIn
      const definitionCompoundId = model.generateDefinitionId(
        backend,
        sourceId,
        definition.id
      )

      const lexemeId: model.LexemeCompoundId = {
        ...glossary,
        lexemeId: lexeme.id
      }
      const defId = { ...glossary, definitionId: definition.id }
      const lexemeIdstring = model.toIdString(lexemeId)
      lexemeIds.push(lexemeIdstring)

      defMessageData.push(model.message.addDefinition(definitionCompoundId, definition))
      lexemeMessageData.push(model.message.addLexeme(lexemeId, lexeme))
      lexDefMessageData.push(model.message.addLexemeDefinitions(lexemeId, [defId]))
      /*
      this.updateModel(
        model.message.addDefinition(definitionCompoundId, definition)
      )
      this.updateModel(model.message.addLexeme(lexemeId, lexeme))
      this.updateModel(model.message.addLexemeDefinitions(lexemeId, [defId]))
      */
    }
    this.updateModel(model.message.addMultipleDefinitiona(defMessageData))
    this.updateModel(model.message.addMultipleLexemes(lexemeMessageData))
    this.updateModel(model.message.addMultipleLexemeDefinitions(lexDefMessageData))
    this.updateModel(
      model.message.addGlossaryLexemeList(
        glossary,
        remoteData.success(lexemeIds)
      )
    )
  }

  private async performSearch(
    backend: model.Backend,
    searchTerm: model.SearchTerm,
    glossaries: model.GlossaryCompoundId[]
  ): Promise<void> {
    glossaries.forEach(glossaryId => {
      this.updateModel(model.message.startSearch(glossaryId, searchTerm))
    })
    const api = await backendApis(backend)
    // XXX Do we want our backend to search in full sources
    // or maybe only in glossaries
    let languagePairIds: model.LanguagePairCompoundId[] = []

    glossaries.forEach(x => {
      const sourceCompId = model.toSourceId(x)
      const glossaryCompIdString = model.toIdString(x)
      const glossary = model.get.glossaries()[glossaryCompIdString]
      languagePairIds.push(
        model.generateLanguagePairCompundId(
          sourceCompId,
          glossary.sourceLanguage,
          glossary.targetLanguage
        )
      )
    })
    const glossaryInfo = model.get.glossaries()
    languagePairIds = [...new Set([...languagePairIds])]
    const apiSearch = await api.search(
      searchTerm,
      backend,
      glossaries,
      glossaryInfo
    )
    try {
      for await (const dictResponse of apiSearch) {
        if (model.get.debug()) {
          console.log(dictResponse, searchTerm, backend)
        }
        if ('error' in dictResponse) {
          this.storeError(dictResponse, searchTerm, backend)
        } else if ('lexeme' in dictResponse) {
          this.storeLexeme(dictResponse, searchTerm, backend)
        } else {
          this.storeEmptyResult(dictResponse, searchTerm, backend)
        }
      }
    } catch (error) {
      // Search failed completely, return error for all glossaries
      for (const glossary of glossaries) {
        const dictResponse = {
          glossary,
          error
        }
        this.storeError(dictResponse, searchTerm, backend)
        if (model.get.debug()) {
          console.log(dictResponse, searchTerm, backend)
        }
      }
    }
  }

  storeLexeme(dictResponse: SearchResult, searchTerm: model.SearchTerm, backend: model.Backend) {
    const sourceId = model.toIdString(model.toSourceId(dictResponse.glossary))
    const sourceInfo = model.get.sources()[sourceId]
    let sourceName = ''
    if (sourceInfo && 'data' in sourceInfo) {
      sourceName = sourceInfo.data.name
    }
    const glossaryInfo = model.get.glossaries()
    const lexeme = dictResponse.lexeme
    const definitions = dictResponse.definitions
    const lexemeCompoundId = model.generateLexemeId(
      backend,
      lexeme.foundIn,
      lexeme.id
    )
    if (dictResponse.didyoumean) {
      const compId: model.GlossaryCompoundIdString = model.toIdString(dictResponse.glossary)
      const data: Record<model.GlossaryCompoundIdString, string[]> = {}
      data[compId] = dictResponse.didyoumean
      if (data[compId].length > 10) data[compId] = data[compId].slice(0, 10)
      this.updateModel(
        model.message.addSearchDidYouMean(
          searchTerm,
          data
        )
      )
    }

    const languageSelection: model.LanguageSelection = {}
    languageSelection[lexeme.language] = definitions.map(definition => {
      return definition.language
    })
    this.updateModel(
      model.message.addSearchResult(
        searchTerm,
        dictResponse.glossary,
        lexemeCompoundId
      )
    )
    this.updateModel(model.message.addLexeme(lexemeCompoundId, lexeme))

    const definitionIds = definitions.map(definition => {
      const definitionCompoundId = model.generateDefinitionId(
        backend,
        lexeme.foundIn,
        definition.id
      )
      this.updateModel(
        model.message.addDefinition(definitionCompoundId, definition)
      )
      return definitionCompoundId
    })

    this.updateModel(
      model.message.addLexemeDefinitions(lexemeCompoundId, definitionIds)
    )
    this.updateModel(
      model.message.createResultsInfoLog({
        backendName: backend.type,
        backendUrl: backend.url,
        fromLanguage:
          glossaryInfo[model.toIdString(dictResponse.glossary)].sourceLanguage,
        toLanguage:
          glossaryInfo[model.toIdString(dictResponse.glossary)].targetLanguage,
        sourceId: dictResponse.glossary.sourceId,
        sourceName,
        searchTerm: searchTerm,
        definitionCount: definitions.length
      })
    )
  }

  storeEmptyResult(dictResponse: SearchNoResult, searchTerm: model.SearchTerm, backend: model.Backend) {
    const sourceId = model.toIdString(model.toSourceId(dictResponse.glossary))
    const sourceInfo = model.get.sources()[sourceId]
    let sourceName = ''
    if (sourceInfo && 'data' in sourceInfo) {
      sourceName = sourceInfo.data.name
    }
    const glossaryInfo = model.get.glossaries()
    this.updateModel(
      model.message.addEmptySearchResult(dictResponse.glossary, searchTerm)
    )
    if (dictResponse.didyoumean) {
      const compId: model.GlossaryCompoundIdString = model.toIdString(dictResponse.glossary)
      const data: Record<model.GlossaryCompoundIdString, string[]> = {}
      data[compId] = dictResponse.didyoumean
      this.updateModel(
        model.message.addSearchDidYouMean(
          searchTerm,
          data
        )
      )
    }
    this.updateModel(
      model.message.createResultsInfoLog({
        backendName: backend.type,
        backendUrl: backend.url,
        fromLanguage:
          glossaryInfo[model.toIdString(dictResponse.glossary)].sourceLanguage,
        toLanguage:
          glossaryInfo[model.toIdString(dictResponse.glossary)].targetLanguage,
        sourceId: dictResponse.glossary.sourceId,
        sourceName,
        searchTerm: searchTerm,
        definitionCount: 0
      })
    )
  }

  storeError(dictResponse: SearchError, searchTerm: model.SearchTerm, backend: model.Backend): void {
    const sourceId = model.toIdString(model.toSourceId(dictResponse.glossary))
    const sourceInfo = model.get.sources()[sourceId]
    let sourceName = ''
    if (sourceInfo && 'data' in sourceInfo) {
      sourceName = sourceInfo.data.name
    }
    const glossaryInfo = model.get.glossaries()
    this.updateModel(
      model.message.addSearchResultError(
        dictResponse.glossary,
        searchTerm,
        dictResponse
      )
    )
    this.updateModel(
      model.message.createResultsInfoLog({
        backendName: backend.type,
        backendUrl: backend.url,
        fromLanguage:
          glossaryInfo[model.toIdString(dictResponse.glossary)].sourceLanguage,
        toLanguage:
          glossaryInfo[model.toIdString(dictResponse.glossary)].targetLanguage,
        sourceId: dictResponse.glossary.sourceId,
        sourceName,
        searchTerm: searchTerm,
        definitionCount: 0,
        error: dictResponse.error // error message if any
      })
    )
  }


  /*
  For starting we only use this for the iate sources
  This is to be removed when we are using this for more then iate
  */
  private filterSources(
    id: model.GlossaryCompoundId
  ): boolean {
    return (id.backendId === 'Termer' && ['266', '285', '287', '291'].includes(id.sourceId))
  }

  /*
  First check if the wordlist is stored in indexDB
  If not, then download it from the backend.
  */
  private async fetchWordlist(
    backend: model.Backend,
    id: model.GlossaryCompoundId,
    termDomains: string[]
  ): Promise<void> {
    if (this.filterSources(id)) {
      const gotWordlist = await this.checkIndexDB(id)
      if (!gotWordlist) {
        this.wordlistDownloader(backend, id, termDomains)
      }
    } else {
      this.wordlistDownloader(backend, id, termDomains)
    }
  }

  /*
  Fetches wordlist from indexDB
  returns true if it has a wordList
  returns false if it do not have any wordlist
  */
  private async checkIndexDB(
    id: model.GlossaryCompoundId
  ): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      const idString = model.toIdString(id)
      const indexWordlist = await this.termerDatabase.fetchStoredWordlist(idString)
      if (indexWordlist && indexWordlist.words.length > 0) {
        this.updateModel(
          model.message.addWordlist(
            id,
            remoteData.success(indexWordlist.words)
          )
        )
        resolve(true)
      } else {
        resolve(false)
      }
    })
  }

  private async wordlistDownloader(
    backend: model.Backend,
    id: model.GlossaryCompoundId,
    termDomains: string[]
  ): Promise<void> {
    const api = await backendApis(backend)

    const config: any = backend.config
    config.domains = termDomains
    const wordlistResponse = await api.getWordlist(id, config)
    const wordlistUpdate: model.WordlistCollection = {}
    if (wordlistResponse.wordlist && wordlistResponse.wordlist.length > 0) {
      wordlistUpdate[model.toIdString(id)] = remoteData.success(
        wordlistResponse.wordlist
      )
      this.termerDatabase.storeWordlistInDB(model.toIdString(id), wordlistResponse.wordlist)
      // this.updateModel(model.message.addMultipleWordlist(wordlistUpdate))
      this.updateModel(
        model.message.addWordlist(
          id,
          remoteData.success(wordlistResponse.wordlist)
        )
      )
    } else {
      wordlistUpdate[model.toIdString(id)] = remoteData.success([])
      this.updateModel(model.message.addMultipleWordlist(wordlistUpdate))
      // this.updateModel(model.message.addWordlist(id, remoteData.success([])))
    }

    if (wordlistResponse.regexes && wordlistResponse.regexes.length > 0) {
      this.updateModel(
        model.message.addWordlistRegexes(
          id,
          remoteData.success(wordlistResponse.regexes)
        )
      )
    } else {
      this.updateModel(
        model.message.addWordlistRegexes(id, remoteData.success([]))
      )
    }

  }

  private sourcesDownloader(
    sources: Record<model.SourceCompoundIdString, NotAsked>,
    backends: model.BackendCollection
  ): void {
    Object.entries(sources).forEach(([id]) => {
      const sourceCompoundId = helpers.toSourceId(id)
      const backend = backends[sourceCompoundId.backendId]
      this.sourceDownloader(backend, sourceCompoundId)
    })
  }

  private async sourceDownloader(
    backend: model.Backend,
    sourceCompoundId: model.SourceCompoundId
  ): Promise<void> {
    this.updateModel(
      model.message.addSource(sourceCompoundId, remoteData.loading())
    )
    const api = await backendApis(backend)
    try {
      const source = await api.getSource(
        sourceCompoundId.sourceId,
        backend.config
      )
      if (backend.config.apiKeys.length > 0 && !source.defaultApikey) {
        this.deselectSource([sourceCompoundId])
      }
      this.updateModel(
        model.message.addSource(sourceCompoundId, remoteData.success(source))
      )
      this.updateModel(
        model.message.addSourceListForBackend(
          backend.id,
          remoteData.success([helpers.toIdString(sourceCompoundId)])
        )
      )
    } catch (e) {
      this.updateModel(
        model.message.addSource(sourceCompoundId, remoteData.error(e))
      )
    }
  }

  private async sourceListDownloader(backend: model.Backend): Promise<void> {
    this.updateModel(
      model.message.addSourceListForBackend(backend.id, remoteData.loading())
    )
    const api = await backendApis(backend)
    try {
      let noResult = true
      const sourceCompIds = []
      const sourcesToAdd = []
      const deselectSources = []
      const glossaries: model.GlossaryCollection = {}
      const selected = this.getBackendSettingSlected()
      const backendOn = model.get.backendDefaultOn()
      for await (const source of api.getSourceList(backend.config)) {
        noResult = false
        const sourceCompoundId = model.generateSourceId(backend, source)
        const sourceCompoundIdString = helpers.toIdString(sourceCompoundId)
        if (backendOn.includes(sourceCompoundId.backendId))
          selected.push(sourceCompoundIdString)
        if (!selected.includes(sourceCompoundIdString))
          deselectSources.push(sourceCompoundId)
        sourcesToAdd.push(
          model.message.addSource(sourceCompoundId, remoteData.success(source))
        )
        sourceCompIds.push(sourceCompoundIdString)
        for (const glossary of source.glossaries) {
          const glossaryCompoundId = model.generateGlossaryId(
            sourceCompoundId,
            glossary.id
          )
          glossaries[model.toIdString(glossaryCompoundId)] = glossary
        }
      }
      this.deselectSource(deselectSources)
      this.updateModel(model.message.addSources(sourcesToAdd))
      this.updateModel(model.message.addGlossaries(glossaries))
      this.updateModel(
        model.message.addSourceListForBackend(
          backend.id,
          remoteData.success(sourceCompIds)
        )
      )
      if (noResult)
        this.updateModel(
          model.message.addSourceListForBackend(
            backend.id,
            remoteData.success([])
          )
        )
    } catch (e) {
      // There’s no point in logging NetworkError, those can be checked in the
      // Network tab.
      if (e instanceof TypeError && /NetworkError/.test(e.message)) return
      console.error(e)
    }
  }

  private async apikeySettingsDownloader(
    backend: model.Backend
  ): Promise<void> {
    const api = await backendApis(backend)
    this.updateModel(
      model.message.setApikeySetting(backend.id, remoteData.loading())
    )
    const dataObject: Record<Apikey, ApikeySetting> = {}
    for await (const setting of api.getApikeySettings(backend.config.apiKeys)) {
      dataObject[setting.api_key] = setting
    }
    this.updateModel(
      model.message.setApikeySetting(backend.id, remoteData.success(dataObject))
    )
  }

  public async checkLogin(
    backend: model.BackendId | model.Backend
  ): Promise<void> {
    if (typeof backend === 'string') {
      const backends = this.modelGetters.backends()
      backend = backends[backend]
      if (!backend) {
        // In normal usage this should not happen. The caller supplying an ID
        // string will have found the in the model, so unless the
        // backend has been removed in the meanwhile the ID it is guaranteed to
        // exist there.
        throw new Error('no backend with the given ID is available.')
      }
    }

    // Don’t try to authenticate if backend does not support it
    if (!backend.properties.auth) return

    this.updateModel(
      model.message.setBackendLoggedIn(backend.id, remoteData.loading())
    )
    const api = await backendApis(backend)
    let loggedIn = false
    try {
      if (api.getLoggedInUser) {
        const result = await api.getLoggedInUser()
        if (result) {
          loggedIn = true
        }
      }
    } finally {
      this.updateModel(
        model.message.setBackendLoggedIn(
          backend.id,
          remoteData.success(loggedIn)
        )
      )
    }
  }

  private getTermerLanguages() {
    this.updateModel(model.message.addSuportedLanguages(languageNames()))
  }

  private async getLanguages(backend: model.Backend): Promise<void> {
    const api = await backendApis(backend)
    try {
      if (api.getLanguages) {
        const response: Languages = await api.getLanguages()
        const langauges: model.LanguageDict = {}
        if (response)
          for (const item of response) {
            const obj: model.Language = { name: item[1], code: item[0] }
            langauges[obj.code] = obj
          }
        this.updateModel(model.message.addSuportedLanguages(langauges))
      }
    } catch (e) {
      // Do not log 404 errors.
      if (!(e.message && e.message === '404')) {
        console.error(new Error(e))
      }
    }
  }

  public setDefaultToLanguages(): void {
    // commented out to avoid issue #2208
    /* if (navigator.languages) {
      navigator.languages.forEach(language => {
        this.selectToLanguage(language)
      })
    } else if (navigator.language) {
      this.selectToLanguage(navigator.language)
    }
    this.specialCaseLanguages() */
  }

  private specialCaseLanguages(): void {
    if (
      /^(www\.)?kbt\.no/.test(window.location.hostname) ||
      /^(www\.)?nblf\.no/.test(window.location.hostname)
    ) {
      this.selectToLanguage('nb')
      this.selectFromLanguage('nb')
    }
  }

  private getBackendSettingSlected(): model.SourceCompoundIdString[] {
    return Object.entries(model.get.backendApikeySettings())
      .filter(([, settings]) => isSuccess(settings))
      .map(([backendId, settings]) => {
        const selectedSourceList: model.SourceCompoundIdString[] = []
        if (isSuccess(settings)) {
          Object.entries(settings.data).forEach(([, data]) => {
            data.sources.forEach(x => {
              if (x.default)
                selectedSourceList.push(
                  model.toIdString({ backendId, sourceId: x.source })
                )
            })
          })
        }
        return selectedSourceList
      })
      .flat()
  }
}

// const settings = {
//   language
// }

const helpers = {
  getBackendId: model.getBackendId,
  toIdString: model.toIdString,
  toSourceId: model.toSourceId,
  toBackendId: model.toBackendId,
  toSourceLanguageId: model.toSourceLanguageCompoundId,
  getSourceLanguageStringData: model.getSourceLanguageStringData,
  toGlossaryId: model.toGlossaryId,
  toLanguagePairId: model.toLanguagePairId
}

export { Termer, helpers }

class Queue<T> {
  private queue: T[] = []

  public handleMessagesInQueue(fun: (msg: T) => void): void {
    this.queue.forEach(item => {
      fun(item)
    })
    this.queue = []
  }

  public enqueueMessage(msg: T): void {
    this.queue.push(msg)
  }
}

function getAllFrames(): Window[] {
  const frames = [top]
  for (let i = 0; i < top.frames.length; ++i) {
    frames.push(top.frames[i])
  }
  return frames
}

function splitObjectStream<T>(
  predicate: (x: T) => boolean,
  stream: flyd.Stream<Record<string, T>>
): [flyd.Stream<Record<string, T>>, flyd.Stream<Record<string, T>>] {
  type X = string
  const falseStream = flyd.stream<Record<string, T>>()
  const trueStream = flyd.stream<Record<string, T>>()
  flyd.on(v => {
    const falsy: Record<string, T> = {}
    const truthy: Record<string, T> = {}
    Object.entries(v).forEach(([key, value]) => {
      if (predicate(value)) truthy[key] = value
      else falsy[key] = value
    })
    falseStream(falsy)
    trueStream(truthy)
  }, stream)
  return [falseStream, trueStream]
}

class ParallelTasks {
  private taskStream = flyd.stream<() => Promise<void>>()

  public constructor(limit: number) {
    const inFlightCount = flyd.stream(0)
    const queue: (() => Promise<void>)[] = []

    function exec(f: () => Promise<void>): void {
      inFlightCount(inFlightCount() + 1)
      f().then(() => {
        inFlightCount(inFlightCount() - 1)
      })
    }

    flyd.on(f => {
      if (inFlightCount() < limit) {
        exec(f)
      } else {
        queue.push(f)
      }
    }, this.taskStream)

    flyd.on(x => {
      if (x < limit && queue.length > 0) {
        const f = queue.pop()
        if (f) exec(f)
      }
    }, inFlightCount)
  }

  public addTask(task: () => Promise<void>): void {
    this.taskStream(task)
  }
}

let running = false
async function logSynchroniser(): Promise<void> {
  // Ensures that the synchroniser only runs one at a time.
  if (!running)
    try {
      running = true
      await unsafeLogSynchroniser()
    } finally {
      running = false
    }
}

function shuffle<T>(list: Array<T>): Array<T> {
  // Fisher-Yates shuffle, Knuth version.
  for (let i = list.length - 1; i >= 1; i--) {
    const j = Math.floor(Math.random() * (i + 1)) // 0 <= j <= i
    const temp = list[i]
    list[i] = list[j]
    list[j] = temp
  }
  return list
}

async function unsafeLogSynchroniser(): Promise<void> {
  const log = model.get.statistics()
  const logIds = shuffle(Object.keys(log))
  for (const id of logIds) {
    const update = (item: StatisticsItem | typeof model.DELETE): void => {
      model.update(model.message.patchModelObject('statistics', { [id]: item }))
    }
    const logMessage = log[id]
    if (isNotSynced(logMessage)) {
      const result = await sendLogMessage(logMessage)
      update(result)
      if (isSyncError(result)) {
        // Stop on first error, quota may have been exceeded.
        break
      }
    } else if (isSyncError(logMessage)) {
      // Handle persistent errors. Otherwise we’re stuck on retrying
      // forever. A persistent error is when we try to send message of type
      // SyncError and the same type is returned.
      const result = await sendLogMessage(logMessage)
      if (isSyncError(result)) {
        // Failed twice = persistent error.
        // To avoid filling up the log, we delete persistent errors.
        update(model.DELETE)
      } else {
        update(result)
      }
    } else if (isSynced(logMessage)) {
      // Drop already synced item.
      update(model.DELETE)
    }
  }
}

function arrayUniq(arr: Array<string>) {
  const seen: Record<string, boolean> = {}
  return arr.filter((item: string) => {
      return seen.hasOwnProperty(item) ? false : (seen[item] = true)
  })
}

/*
// data structure for lookups.
// IDs must be unique. Must generate them on the client, not rely on ids
// from API responses.
// concatenate + hash, i.e.: md5sum(backendName + sourceId + termId) etc.
term = {
  term-id,
  term (string),
  lemma (bool)
}
lexeme = {
  lexeme-id,
  source-id,
  terms ([term-id]),
}
definition = {
  definition-id,
  definition (string),
  source-id,
  last-edit-time: (date),
  comments (?),
  lexemes ([lexeme-id])
}
source = {
  source-id,
  description (text)
}

sourcesWithResults = flyd.stream([1])
lexemes = flyd.stream([{lexemeId, sourceId:1}])
lexemesWithResults = flyd.combine((lxs, srcs) => {
  // filter lexemes with source ids from sourceWithResults
  return flyd.filter(x => x.lexemeId in srcs, lxs)
}, [lexemes, sourcesWithResults])
definitions = flyd.stream([{definitionId, sourceId:1})
definitionsWithResults = flyd.combine((defs, srcs) => {
  // filter definitions with source ids from sourceWithResults
  return flyd.filter(x => x.lexemeId in srcs, defs)
}, [defs, sourcesWithResults])
terms =  ???

// maybe:
// - a mapping from the actual search term to the set of results
//   (this is handled in Vue atm.)

// de-normalized
backend = {
  sources: [{
    source-id,
    lexemes: [{
      lexeme-id: 1,
      terms: []
    }, {
      lexeme-id: 2,
      terms: [...] // nb: duplicate
    }]
  }]
}

// de-normalized v2
definition = {
  definition: text,
  id,
  source,
  lexemes: [{
    id,
    source,
    terms: [{
      id,
      term: text,
      lemma: bool
    }]
  }]
}

// example
term = {
  term-id: 8174224
  term: 'okse',
  lemma: true
}

lexeme = {
  lexeme-id: 6924237,
  source-id: 31,
  terms: [8174224]
}

definition1 = {
  definition-id: 411065,
  definition: 'tamdyr av tamt hornfe, stut, tyr',
  source-id: 31,
  last-edit-time: 2019-03-26T00:00:00.0000000Z,
  comments: null,
  lexemes: [6924237]
}

definition2 = {
  definition-id: 411066,
  definition: 'hinder i sprangridning',
  source-id: 31,
  last-edit-time: 2019-03-26T00:00:00.0000000Z,
  comments: null,
  lexemes: [6924237]
}
*/
