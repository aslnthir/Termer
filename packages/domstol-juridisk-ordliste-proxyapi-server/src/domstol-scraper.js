import logger from './logger.js'
import re from 'lovdata-law-reference-regex/src/regexHelper.js'
import getHTMLDocument from './getHTMLDocument.js'

const log = logger.log
const MAX_FILE_AGE_SECONDS = 60 * 60

export async function scrape() {
  const url = 'https://www.domstol.no/verktoy/juridisk-ordliste/'
  const document = await getHTMLDocument(url, MAX_FILE_AGE_SECONDS)
  const listItems = document.querySelectorAll('._jsWordList > li')

  const collection = {}
  let id = 0
  for (const li of listItems) {
    let term = li.querySelector('._jsWordListHeading')
    if (!term) continue
    term = term.textContent.trim()

    let definition = li.querySelector('._jsWordListBody')
    if (!definition) continue
    definition = definition.textContent.trim()

    if (!term || !definition) continue

    id += 1

    collection[term] = {
      id,
      definition
    }
  }

  return collection
}
