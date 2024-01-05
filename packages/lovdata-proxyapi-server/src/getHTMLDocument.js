import fs from 'fs/promises'
import got from 'got'
import jsdom from 'jsdom'
import getFileAge from './getFileAge.js'
import logger from './logger.js'
import sanitizeFilename from 'sanitize-filename'
import { tmpDir } from './constants.js'
const log = logger.log

// Download a URL, or use the cached version if it is less that `maxAge` seconds
// old.
//
// Returns the document as a DOM object.
async function getHTMLDocument (url, maxAge = 0) {
  const htmlFile = tmpDir + sanitizeFilename(url)
  const age = await getFileAge(htmlFile)
  log(`Cached file age: ${age}s, max age: ${maxAge}s)`)
  if (age > maxAge) {
    log('Downloading', url)
    const response = await getUrl(url)
    await fs.writeFile(htmlFile, response.body)
  } else {
    log('Using cached file for', url)
  }

  const html = await fs.readFile(htmlFile, 'utf8')
  const dom = new jsdom.JSDOM(html, { url }).window.document
  return dom
}

function randomHoldoffTime () {
  // random number between (lowLimit, highLimit)
  const lowLimit = 5
  const highLimit = 10
  return (lowLimit + Math.random() * (highLimit - lowLimit)) * 1000
}

const holdoffs = {}
async function getServerHandle (host) {
  // get current timer, if any
  let timer = holdoffs[host]

  if (!timer) {
    // no timer, resolve immediately
    timer = Promise.resolve()
  }

  // create a new timer, after the current one expires
  timer.then(() => {
    holdoffs[host] = new Promise(resolve => {
      setTimeout(() => {
        delete holdoffs[host]
        resolve()
      }, randomHoldoffTime())
    })
  })

  return timer
}
async function getUrl (url) {
  const host = new URL(url).host
  await getServerHandle(host)
  const response = await got(url)
  return response
}

export default getHTMLDocument
