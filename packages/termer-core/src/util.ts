import {
  SourceGlossarySelection,
  GlossaryCompoundIdString,
  GlossaryCollection,
  Language
} from './model'
import ISO6391 from 'iso-639-1'

export function filterLanguages(languages: string[]): string[] {
  return languages.map(language => {
    if (language.includes('-')) {
      return language.split('-')[0]
    }
    if (language === 'no' || language === 'nob') {
      return 'nb'
    }
    return language
  })
}

export function filterObjectByKeys<T>(
  keys: string[] | Set<string>,
  obj: Record<string, T>
): Record<string, T> {
  const filtered: Record<string, T> = {}
  const keysSet: Set<string> = toSet(keys)
  Object.keys(obj)
    .filter(key => keysSet.has(key))
    .map(key => (filtered[key] = obj[key]))
  return filtered
}

function toSet<K>(keys: K[] | Set<K>): Set<K> {
  let keysSet: Set<K>
  if (Array.isArray(keys)) {
    keysSet = new Set(keys)
  } else {
    keysSet = keys
  }
  return keysSet
}

export function filterMapByKeys<K, V>(
  keys: K[] | Set<K>,
  map: Map<K, V>
): Map<K, V> {
  const keysSet = toSet(keys)
  return new Map([...map].filter(([key]) => keysSet.has(key)))
}

export function filterObjectByKeysNotIn<T>(
  keys: string[] | Set<string>,
  obj: Record<string, T>
): Record<string, T> {
  const filtered: Record<string, T> = {}
  const keysSet = toSet(keys)
  Object.keys(obj)
    .filter(key => !keysSet.has(key))
    .map(key => (filtered[key] = obj[key]))
  return filtered
}

export function filterObjectBy<T>(
  predicate: (value: T, key: string) => boolean,
  obj: Record<string, T>
): Record<string, T> {
  const filtered: Record<string, T> = {}
  Object.entries(obj)
    .filter(keyValueTuple => predicate(keyValueTuple[1], keyValueTuple[0]))
    .map(([key]) => (filtered[key] = obj[key]))
  return filtered
}

export function filterObjectByPred<X, Y extends X>(
  predicate: (value: X) => value is Y,
  obj: Record<string, X>
): Record<string, Y> {
  function keyValuePredicate(kvt: [string, X]): kvt is [string, Y] {
    return predicate(kvt[1])
  }
  const filtered: Record<string, Y> = {}
  Object.entries(obj)
    .filter(keyValuePredicate)
    .map(([key, value]) => (filtered[key] = value))
  return filtered
}

export function filterMapByPred<K, V, Y extends V>(
  predicate: (value: V) => value is Y,
  map: Map<K, V>
): Map<K, Y> {
  function keyValuePredicate(kvt: [K, V]): kvt is [K, Y] {
    return predicate(kvt[1])
  }
  return new Map([...map].filter(keyValuePredicate))
}

export function filterMapBy<K, V>(
  predicate: (value: V) => boolean,
  map: Map<K, V>
): Map<K, V> {
  return new Map([...map].filter(x => predicate(x[1])))
}

export function filterSourceObjectsByLanguages(
  fromLanguages: string[] | Set<string>,
  toLanguages: string[] | Set<string>,
  glossaryObjects: GlossaryCollection,
  removedGlossaries: GlossaryCompoundIdString[]
): SourceGlossarySelection {
  const filtered: SourceGlossarySelection = {}

  const fromLanguagesSet = toSet(fromLanguages)
  const toLanguagesSet = toSet(toLanguages)
  Object.entries(glossaryObjects)
    .filter(([glossCompId]) => {
      return !removedGlossaries.includes(glossCompId)
    })
    .forEach(([glossCompId, glossary]) => {
      const values = glossCompId.split('/')
      const sourceId = values[0] + '/' + values[1]
      if (!(sourceId in filtered)) filtered[sourceId] = []
      if (
        fromLanguagesSet.has(glossary.sourceLanguage) &&
        toLanguagesSet.has(glossary.targetLanguage)
      ) {
        filtered[sourceId].push(glossary)
      }
      if (filtered[sourceId].length === 0) delete filtered[sourceId]
    })
  return filtered
}

function addSpesifictGlossarySelectedSources(
  selectedGlossaries: GlossaryCompoundIdString[],
  sourceObjects: SourceGlossarySelection,
  glossaries: GlossaryCollection
): SourceGlossarySelection {
  const languageSelectedGlossaries: GlossaryCompoundIdString[] = []
  const finalList = [
    ...new Set(selectedGlossaries.concat(languageSelectedGlossaries))
  ]
  finalList.forEach(glossId => {
    const values = glossId.split('/')
    const sourceId = values[0] + '/' + values[1]
    if (glossId in glossaries) {
      if (!(sourceId in sourceObjects)) sourceObjects[sourceId] = []
      sourceObjects[sourceId].push(glossaries[glossId])
    }
  })
  return sourceObjects
}

export function filterSourceObjects(
  fromLanguages: string[] | Set<string>,
  toLangauges: string[] | Set<string>,
  deselectedSources: string[],
  selectedGlossaries: GlossaryCompoundIdString[],
  glossaryObjects: GlossaryCollection,
  removedGlossaries: GlossaryCompoundIdString[],
  mandatorySourcesOn: string[]
): SourceGlossarySelection {
  const glossarySelection = filterSourceObjectsByLanguages(
    fromLanguages,
    toLangauges,
    glossaryObjects,
    removedGlossaries
  )

  const _deselectedSources = deselectedSources.filter(x =>
    !mandatorySourcesOn.includes(x)
  )

  let deselectedRemoved = filterObjectByKeysNotIn(
    _deselectedSources,
    glossarySelection
  )
  deselectedRemoved = addSpesifictGlossarySelectedSources(
    selectedGlossaries,
    deselectedRemoved,
    glossaryObjects
  )
  return deselectedRemoved
}

/*
 * For use in exhaustive case checking, where it will cause a type checking
 * error if not all cases are handled.
 */
export function assertNever(x: never): never {
  throw new Error('Unexpected object: ' + x)
}

export function languageNames(): Record<string, Language> {
  const isoLanguages = ISO6391.getLanguages(ISO6391.getAllCodes())

  const supportedLanguages: Record<string, Language> = {}
  isoLanguages.forEach(language => {
    supportedLanguages[language.code] = language
  })
  supportedLanguages.kmr = { code: 'kmr', name: 'Kurmanji' }
  supportedLanguages.prs = { code: 'prs', name: 'Dari' }
  supportedLanguages.ckb = { code: 'ckb', name: 'Sorani' }

  return supportedLanguages
}
