import express from 'express'
import mongoose from 'mongoose'
import logger from './logger.js'
import { scrape } from './domstol-scraper.js'

import { port, mongodbServer, mongodbName } from './constants.js'
const log = logger.log

import { lookup, addScrapingResult, getWordlist } from './controller.js'

const app = express()

app.get('/lookup/:term', async (req, res) => {
  const term = req.params.term.toLowerCase()
  log('lookup:', term)
  const result = await lookup(term)
  log('return result', result)
  if (!result) {
    res.status(404).end()
  } else {
    res.json(result)
  }
})

app.get('/wordlist/', async (req, res) => {
  const result = await getWordlist()
  if (!result) {
    res.status(404).end()
  } else {
    res.json(result)
  }
})

export default async function server () {
  await mongoose.connect(`${mongodbServer}/${mongodbName}`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  )
  log('db connected')
  const scrapingResult = await scrape()
  await addScrapingResult(scrapingResult)
  await app.listen(port)
  log(`HTTP server ready on :${port}`)
}
