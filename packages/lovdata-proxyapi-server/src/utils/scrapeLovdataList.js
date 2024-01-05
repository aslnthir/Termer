import getHTMLDocument from '../getHTMLDocument.js'
import logger from '../logger.js'
import { maxCachedFileAge } from '../constants.js'

const log = logger.log

async function getDocumentListFromPage (pageUrl) {
  const document = await getHTMLDocument(pageUrl, maxCachedFileAge)
  const links = document.querySelectorAll('.documentList a')

  const collection = []
  for (const link of links) {
    const documentPath = link.href
    const documentId = documentPath.replace(/^.+dokument\//, '/')
    const name = link.textContent.trim().toLowerCase()
    collection.push({ documentId, name })
  }
  collection.sort()

  let nextPage = null
  // check if the next page link exists, if not, we’re at the end of the list.
  if (document.querySelector('.next a')) {
    const u = new URL(pageUrl)
    const currentOffset = parseInt(u.searchParams.get('offset') | '0')
    u.searchParams.set('offset', currentOffset + links.length)
    nextPage = u.href
  }

  const years =
    Array.from(document.querySelectorAll('#yearSelect option:not([disabled])'))
      .map(x => parseInt(x.value))
      .sort()
  return { documents: collection, sourceUrl: pageUrl, nextPage, years }
}

function getYear (str) {
  return parseInt(str.match(/\/(\d\d\d\d)/)[1])
}

// Yields: arrays of tuples [documentId, name], one for each page
export default async function * scrapeLovdataList (listUrl, fromDocumentId) {
  // If fromDocumentId is falsy, start at the first available year.
  // Else, start at the year from fromDocumentId, and go
  // forward from there, year by year.

  let fromYear = null
  if (fromDocumentId) {
    // We’re assuming that the provided year is valid.
    fromYear = getYear(fromDocumentId)
  } else {
    const { years } = await getDocumentListFromPage(listUrl)
    fromYear = years[0]
  }

  yield * scrapeFromYear(listUrl, fromYear)
}

async function * scrapeFromYear (listUrl, fromYear) {
  let countPages = 0
  let countDocuments = 0

  const urlParams = `?year=${fromYear}&sort=alpha&dir=asc`
  let currentUrl = listUrl + urlParams
  while (currentUrl) {
    const { documents, sourceUrl, nextPage, years } = await getDocumentListFromPage(currentUrl)
    yield { documents, sourceUrl }
    countPages++
    countDocuments += documents.length
    if (nextPage) {
      currentUrl = nextPage
    } else if (fromYear) {
      const indexOfNextYear = years.indexOf(fromYear) + 1
      fromYear = years[indexOfNextYear]
      if (!fromYear) break
      const urlParams = `?year=${fromYear}&sort=alpha&dir=asc`
      currentUrl = listUrl + urlParams
    }
  }
  log(`collected ${countDocuments} document links from ${countPages} pages.`)
}
