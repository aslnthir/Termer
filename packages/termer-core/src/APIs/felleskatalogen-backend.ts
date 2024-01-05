/**
 * Author: Kristian Skibrek
 * Date: 01/03/2022
 */

import { result,} from 'lodash'
import { Backend, GlossaryCompoundId, toIdString, GlossaryCollection} from '../model'
import {
  Api,
  SearchResult,
  SearchNoResult,
  SearchError,
  WordlistResponse,
  Languages,
  DefinitionResult
} from './api'
import { Glossary, Definition, Lexeme, Source, ApikeySetting } from '../entry'
import { json } from 'express'

export {API}

const felleskatalogenGlossary = {
    id: '1',
    url: 'https://felleskatalogen.no',
    name: 'Felleskatalogen',
    displayname: 'Felleskatalogen',
    sourceLanguage: 'nb',
    targetLanguage: 'nb'
}

const source: Source= {
  id: '1',
  url: 'https://felleskatalogen.no',
  name: 'Felleskatalogen',
  displayname: 'Felleskatalogen',
  owner: null,
  terms: null,
  privateSource: false,
  description: 'Felleskatalogen',
  markupWords: true,
  contactEmail: 'contact@tingtun.no',
  inGarbage: false,
  permissions: null,
  defaultApikey: false,
  logoUrl: null,
  inputLanguages: {
    nb: ['nb']
  },
  externalData: false,
  inApikey: false,
  glossaries: [felleskatalogenGlossary]
}

class API implements Api {

  protected url: string
  public constructor(url: string) {
    this.url = url
  }
  
	//TODO: returns an array of results (which are iterated through)
	public async *search(
	term: string,
	backend: Backend,
	ids: GlossaryCompoundId[],
	glossaries: GlossaryCollection
	): AsyncIterableIterator<SearchResult | SearchNoResult | SearchError>{
		const lookupResult = await lookup(term, this.url)
		if(lookupResult === null){
			yield {
				glossary: ids[0]
			}
		}
		else{
			try{
				for(var i = 0; i < lookupResult.length; i++){
					const result = {
						glossary: ids[0],
						definitions:[{
							id: lookupResult[i]._id,
							gloss: lookupResult[i].definitions.gloss,
							url: lookupResult[i].definitions.url
						}],
						lexeme: {
							id: lookupResult[i]._id,
							lemmas: [lookupResult[i].forms[0]],
							language: source.inputLanguages,
							foundIn: source.id,
							glossary: felleskatalogenGlossary.id
						}
					}
					yield result
				}
			}
			catch (error) {
				const errorMessage = (error as Error).message
				yield {
					glossary: ids[0],
					error: errorMessage
				}
			}
			
		}
	}

  public async getSource(): Promise<Source> {
    return source
  }

  public async *getSourceList(): AsyncIterableIterator<Source> {
    yield await this.getSource()
  }

  public async getLanguages(): Promise<Languages> {
    return Object.entries('nb')
  }

  public async *getApikeySettings(): AsyncIterableIterator<ApikeySetting> {
    for (const _ of []) {
      yield _
    }
  }

  public async *getGlossaryDefinitionList(): AsyncIterableIterator<
    DefinitionResult
  > {
    for (const _ of []) {
      yield _
    }
  }

  public async getWordlist(id: GlossaryCompoundId): Promise<WordlistResponse> {

    const result = await getWordlist(this.url)

    if(result === null){
      return {
        wordlist: []
      }
    }
    else {
      return {
        wordlist: result
      }
    }
  }
}

//does not do anything, remove
interface FetchResponse {
  id: string
  lemmas: string[]
  meaning: string
  url: string
}

async function getWordlist(url: string): Promise<WordlistResponse | null> {

  const result = await fetch(url + '/getWordList')
  if(!result.ok){
    return null
  }
  const jsonResponse = await result.json()
  return jsonResponse
}


//TODO: can take in terms with slashes
//possible solution: replace the slash with som other special sign (%2F), then in the server it is reversed back again to slash
//uses the function lookup in packages/felleskatalogen-proxyapi-server to lookup
async function lookup(term: string, url: string): Promise<LookupResult[] | null> {
  let cleanTerm = term.replace( /[\r\/]+/gm, " ")
  cleanTerm = cleanTerm.replace( /[\r\%]+/gm, " ")
  const result = await fetch(url + '/lookup/' + cleanTerm)
  if(!result.ok){
    return null
  }
  const jsonResult = await result.json()
  return jsonResult 
}

interface LookupResult {
	forms: [string],
	definitions: {
		gloss: string,
		url: string
	},
	komplett: boolean
}
