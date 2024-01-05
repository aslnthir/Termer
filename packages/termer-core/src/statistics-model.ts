import { immutable as O, PatchRequest } from 'patchinko'
import { gitCommitHash } from './global-constants'
import { LocalData, constructors as localData } from './localdata'
import uuid from 'uuid'

let termerCoreOrigin = ''
if (document.getElementById('tingtunGlossary')) {
  termerCoreOrigin = new URL(
    // @ts-ignore: it will not be null at this point
    document.getElementById('tingtunGlossary').getAttribute('src')
  ).origin
} else {
  termerCoreOrigin = window.location.origin
}

export interface LogMessage {
  version: number
  gitVersion: string
  timestampUTC: string // timestamp in UTC format, e.g. '2019-10-17T11:01:07.169Z'
  termerCoreOrigin: string // Origin part of URL of the termer-core source
}
export interface SearchInfo {
  token: string // unique identifier, UUID
}
export type SearchInfoLogMessage = LogMessage &
  SearchInfo & { type: MessageType.SEARCH_INFO_LOG }

export interface ResultsInfo {
  backendName: string
  backendUrl?: string
  fromLanguage: string
  toLanguage: string
  sourceId: string
  sourceName: string
  searchTerm: string
  definitionCount: number // unsigned integer, could be 0 for no results/errors
  error?: string // error message if any
}
export type ResultsInfoLogMessage = LogMessage &
  ResultsInfo & { type: MessageType.RESULTS_INFO_LOG }

export type Message = SearchInfoLogMessage | ResultsInfoLogMessage
export type StatisticsItem = LocalData<Message>
export type Statistics = Record<string, StatisticsItem>

export interface Model {
  statistics: Statistics
}

export const initialModel: Model = {
  statistics: {}
}

enum MessageType {
  SEARCH_INFO_LOG = 'SEARCH_INFO_LOG',
  RESULTS_INFO_LOG = 'RESULTS_INFO_LOG'
}

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export function isMessage(x: MessageType | any): x is MessageType {
  return x in MessageType
}

export function handleMessage(message: Message): Partial<PatchRequest<Model>> {
  const id = uuid.v4()
  const data = localData.notSynced(message)
  return {
    statistics: O({
      [id]: data
    })
  }
}

export const message = {
  createSearchInfoLog(info: SearchInfo): SearchInfoLogMessage {
    return {
      type: MessageType.SEARCH_INFO_LOG,
      version: 2,
      gitVersion: gitCommitHash,
      timestampUTC: new Date().toISOString(),
      termerCoreOrigin,
      ...info
    }
  },

  createResultsInfoLog(info: ResultsInfo): ResultsInfoLogMessage {
    return {
      type: MessageType.RESULTS_INFO_LOG,
      version: 2,
      gitVersion: gitCommitHash,
      timestampUTC: new Date().toISOString(),
      termerCoreOrigin,
      ...info
    }
  }
}
