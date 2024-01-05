import express from 'express'
import mongoose from 'mongoose'
import logger from './logger.js'
import { scrape as scrapeLaws } from './scrape-laws.js'
import { scrape as scrapeRegulations } from './scrape-regulations.js'
import { port, mongodbServer, mongodbName } from './constants.js'
import {
  lawLookup, regulationsLookup, addLawIds, getLawList, getRegulationsList, getMostRecentLawId,
  getMostRecentRegulationsId, addRegulationsIds
} from './controller.js'

const log = logger.log

const app = express()

async function lookup (req, res, fn) {
  const term = req.params.term.toLowerCase()
  log('lookup:', term)
  const result = await fn(term)
  log('return result', result)
  if (!result) {
    res.status(404).end()
  } else {
    res.json(result)
  }
}

app.get('/law/lookup/:term', async (req, res, next) => {
  return lookup(req, res, lawLookup).catch(next)
})

app.get('/law/list/', async (req, res, next) => {
  try {
    const result = await getLawList()
    res.json(result)
  } catch (err) {
    next(err)
  }
})

app.get('/regulations/lookup/:term', async (req, res, next) => {
  return lookup(req, res, regulationsLookup).catch(next)
})

app.get('/regulations/list/', async (req, res, next) => {
  try {
    const result = await getRegulationsList()
    res.json(result)
  } catch (err) {
    next(err)
  }
})

export default async function server () {
  await mongoose.connect(`${mongodbServer}/${mongodbName}`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    }
  )
  log('db connected')
  const lastLawId = await getMostRecentLawId()
  log('most recent law ID:', lastLawId)
  for await (const { documentNames, sourceUrl } of scrapeLaws(lastLawId)) {
    await addLawIds(documentNames, sourceUrl)
  }

  const lastRegulationsId = await getMostRecentRegulationsId()
  log('most recent regulations ID:', lastRegulationsId)
  for await (const { documentNames, sourceUrl } of scrapeRegulations(lastRegulationsId)) {
    await addRegulationsIds(documentNames, sourceUrl)
  }

  await app.listen(port)
  log(`HTTP server ready on :${port}`)
}
