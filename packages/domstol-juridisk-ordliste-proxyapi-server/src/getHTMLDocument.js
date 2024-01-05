import fs from 'fs/promises'
import got from 'got'
import jsdom from 'jsdom'
import getFileAge from './getFileAge.js'
import logger from './logger.js'
const log = logger.log
import sanitizeFilename from 'sanitize-filename'

// Download a URL, or use the cached version if it is less that `maxAge` seconds
// old.
//
// Returns the document as a DOM object.
async function getHTMLDocument(url, maxAge=0) {
  const htmlFile = '/tmp/' + sanitizeFilename(url)
  const age = await getFileAge(htmlFile)
  if (age > maxAge) {
    log('Downloading', url, `(file age: ${age}s, max age: ${maxAge}s)`)
    const response = await got(url)
    await fs.writeFile(htmlFile, response.body)
  } else {
    log('Using cached file for', url)
  }

  const html = await fs.readFile(htmlFile, 'utf8')
  const dom = new jsdom.JSDOM(html).window.document
  return dom
}

export default getHTMLDocument
