import { versionDB, DB, WordlistStore, createInitialDatabase } from './database/indexDBcreation'
import { sites } from 'site-configurations'
// indexed db initialization

export interface WordlistIndexDB {
  glossaryID: string
  words: string[]
}

/*
interface StorageReturnObject {
  status: 'success' | 'nokey' | 'error'
  value: any | null | undefined
}
*/

export class TermerDatabase {

  constructor (addHost: string | undefined) {
    if (addHost) {
      this.allowedDomains.push(addHost)
    }
    sites.forEach(siteName => {
      this.allowedDomains.push(siteName + '.termer.no')
    })
    this.correctDomain = (this.allowedDomains.includes(
      window.location.hostname
    ) || this.domainReg.exec(window.location.hostname) !== null)

    if (this.correctDomain) {
      createInitialDatabase()
    }
  }

  private allowedDomains: string[] = [
    'localhost',
    'glossary.tingtun.no',
    'termer.no',
    'termer.test.tingtun.no',
    'termer.x.tingtun.no'
  ]

  private domainReg: RegExp = new RegExp('termer.no$')

  public correctDomain: boolean = (this.allowedDomains.includes(
    window.location.hostname
  ) || this.domainReg.exec(window.location.hostname) !== null)


  connect(name: string, version: number): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(name, version)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
      request.onblocked = () => console.warn('pending till unblocked')
    })
  }

  async storeWordlistInDB(id: string, wordLists: string[]): Promise<void> {
    if (!window.indexedDB) {
        console.log(`Your browser doesn't support IndexedDB`)
        return
    } else if (!this.correctDomain) {
      console.log('Wrong domain', window.location.hostname)
      return
    }
    console.log('Correct domain', window.location.hostname)

    //open db without version for getting the existing db version
    var openDB = await this.connect(DB, versionDB)

    let storeData = { glossaryID: id, words: wordLists }
    var transaction = openDB.transaction([WordlistStore], "readwrite")

    transaction.onerror = function(event: Event) {
      // report errors
      console.log(event)
    }

    // create an object store on the transaction
    var objectStore = transaction.objectStore(WordlistStore)

    var objectStoreRequest = objectStore.put(storeData)

    objectStoreRequest.onerror = function(event: Event) {
      // report errors
      console.log(event)
    }
  }

  fetchStoredWordlist(glossaryID: string): Promise<WordlistIndexDB> | void {
    if (!this.correctDomain) {
      return
    }
    return new Promise(async (resolve) => {
      const connection = await this.connect(DB, 2)
      const transaction = connection.transaction([WordlistStore])
      const objectStore = transaction.objectStore(WordlistStore)
      const objectStoreRequest = objectStore.get(glossaryID)
      objectStoreRequest.onsuccess = function() {
        // report the success of our request
        resolve(objectStoreRequest.result)
      }
      objectStoreRequest.onerror = function() {
        // report the success of our request
        resolve({ glossaryID, words: [] })
      }
    })
  }

}
