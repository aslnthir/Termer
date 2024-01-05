import express from 'express'
import mongoose from 'mongoose'
import logger from './logger.js'
import { scrape as scrapeGlossary } from './scrape-glossary.js'
import { port, mongodbServer } from './constants.js'
import {
  lookup, getWordlist, getSource
} from './controller.js'

const log = logger.log

const app = express()

app.get('/lookup/:glossryId/:term', async (req, res, next) => {
  res.set("Access-Control-Allow-Origin", "*")
  // return lookup(req, res, lawLookup).catch(next)
  const term = req.params.term
  const glossryId = req.params.glossryId
  if (isNaN(glossryId)) {
    res.json(['Glossary id not valid'])
  } else {
    const result = await lookup(term, glossryId)
    res.json(result)
  }
})

app.get('/list/:glossaryId', async (req, res, next) => {
  res.set("Access-Control-Allow-Origin", "*")
  const glossaryId = req.params.glossaryId
  if (isNaN(glossaryId)) {
    res.json(['Glossary id not valid'])
  } else {
    try {
      const result = await getWordlist(glossaryId)
      res.json(result)
    } catch (err) {
      log(err)
      next('Internal Error')
    }
  }
})

app.get('/source/', async (req, res, next) => {
  res.set("Access-Control-Allow-Origin", "*")
  try {
    const result = await getSource()
    res.json(result)
  } catch (err) {
    log(err)
    next('Internal Error')
  }
})

export default async function server () {
  await mongoose.connect(`${mongodbServer}/termer-ecbdb`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    }
  )
  log('db connected')
  for await (const glossaryScrapingResult of scrapeGlossary('')) {
    // log('glossary result', glossaryScrapingResult)
  }
  // const lastLawId = await getMostRecentLawId()
  // log('most recent law ID:', lastLawId)
  // for await (const lawScrapingResult of scrapeGlossary(lastLawId)) {
  //   await addLawIds(lawScrapingResult)
  // }
  /*
  const lastRegulationsId = await getMostRecentRegulationsId()
  log('most recent regulations ID:', lastRegulationsId)
  for await (const regulationsScrapingResult of scrapeRegulations(lastRegulationsId)) {
    await addRegulationsIds(regulationsScrapingResult)
  }
  */
  await app.listen(port)
  log(`HTTP server ready on :${port}`)
}
