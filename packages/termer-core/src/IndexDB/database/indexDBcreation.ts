export let versionDB = 1
export const DB = "TermerDatabase";
export const WordlistStore = "WordLists"

export function createInitialDatabase(): void {
  var initialRequest = indexedDB.open(DB)
  initialRequest.onsuccess = function (event: any) {
    var database = event.target.result
    var version = parseInt(database.version)

    if (version === 1) {
      versionDB = version + 1
      var actualRequest = indexedDB.open(DB, versionDB)
      actualRequest.onupgradeneeded = function (event: any) {
        var db = event.target.result;
        if (!db.objectStoreNames.contains(WordlistStore)) {
          var objectStore = db.createObjectStore(WordlistStore, { keyPath: 'glossaryID' })
          objectStore.createIndex("words", "words", { unique: false })
        }
      }
    } else {
      versionDB = version
    }
  }
}
