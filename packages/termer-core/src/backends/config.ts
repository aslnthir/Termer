import flyd from 'flyd'
import { RemoteData, constructors as remoteData } from '../remotedata'

export interface BackendProperties {
  // Backend name
  name: string
  // Does this backend support user authentication?
  auth: boolean
  // Are there multiple Sources available from this backend?
  multipleSources: boolean
  // Can API keys be used with this source?
  apiKeys: boolean
  // Does this backend support lexical domain filtering?
  domains: boolean
}

export class Config {
  states: flyd.Stream<ConfigValues>
  actions: Actions
  // addApiKey?: (apikey: string) => void  // apikey
  // addSource?: (sourceId: string) => void  // apikey
  constructor (properties: BackendProperties, initialValues?: OptionalConfigValues) {
  /*
    if (properties.multipleDictionaries) {
      Object.defineProperty(this, 'dictionaries', {
        set (value) {
          this._dictionaries(value)
        }
      }
    }
    if (this.properties.domains) {
      o['domains'] = state.domains
    }
    if (this.properties.auth) {
      o['auth'] =
    }
    */

    const update = flyd.stream<PatchFunction>()
    this.actions = makeActions(update, properties)
    const initialState = {
      authenticated: remoteData.notAsked(),
      apiKeys: (initialValues && initialValues.apiKeys) ? initialValues.apiKeys : [],
      selectedSources: (initialValues && initialValues.selectedSources) ? initialValues.selectedSources : []
    }
    this.states = flyd.scan(statePatcher, initialState, update)

    // if (properties.apiKeys) {
    //   this.addApiKey = function addApiKey (key) {
    //     actions.addApiKey(key)
    //   }
    // }
    // if (properties.multipleSources) {
    //   this.addSource = function addSource (sourceId) {
    //     actions.addSource(sourceId)
    //   }
    // }
  }
}

export interface ConfigValues {
  authenticated: RemoteData<boolean>
  apiKeys: Array<string>
  selectedSources: Array<string>
  domains?: Array<string>
  page?: string
}

export interface OptionalConfigValues {
  authenticated?: boolean
  apiKeys?: Array<string>
  selectedSources?: Array<string>
}


interface ApiKeysActions {
  addApiKey (key: string) : void
}

function apiKeysActions (update: UpdateFunction) : ApiKeysActions {
  return {
    addApiKey (key) {
      update((state: ConfigValues) => {
        if (!state.apiKeys) state.apiKeys = [key]
        else state.apiKeys.push(key)
        return state
      })
    }
  }
}

interface MultipleSourcesActions {
  addSelectedSource (sourceId: string) : void
}

function multipleSourcesActions (update: UpdateFunction) : MultipleSourcesActions {
  return {
    addSelectedSource (sourceId) {
      update((state: ConfigValues) => {
        if (!state.selectedSources) state.selectedSources = [sourceId]
        else state.selectedSources.push(sourceId)
        return state
      })
    }
  }
}

interface Actions {
  [fn: string]: Function
}

function makeActions (update: UpdateFunction, properties: BackendProperties) : Actions {
  const _actions = {}
  if (properties.apiKeys) {
    Object.assign(_actions, apiKeysActions(update))
  }
  if (properties.multipleSources) {
    Object.assign(_actions, multipleSourcesActions(update))
  }
  return _actions
}

interface PatchFunction {
  (state: ConfigValues) : ConfigValues
}
interface UpdateFunction {
  (patch: PatchFunction) : void
}

function statePatcher (state: ConfigValues, patch: PatchFunction) : ConfigValues {
  return patch(state)
}
