import express from 'express'
import mongoose from 'mongoose'
import logger from './logger.js'
import { getIcnpLanguageCode } from './supportedLanguages.js'
import { port, mongodbServer, mongodbName } from './constants.js'
import { lookup, getWordlist, updateConceptCollection } from './controller.js'

const log = logger.log
const app = express()

async function lookupRouteHandler (req, res) {
  const term = req.params.term.toLowerCase()
  const fromLanguage = getIcnpLanguageCode(req.params.fromLanguage)
  const toLanguage = getIcnpLanguageCode(req.params.toLanguage)
  log('lookup:', term, fromLanguage, toLanguage ? toLanguage : '')
  const result = await lookup(term, fromLanguage, toLanguage)
  log('return result', result)
  if (!result) {
    res.status(204).end()
  } else {
    res.json(result)
  }
}

app.get('/lookup/:fromLanguage/:term', function() {
  return lookupRouteHandler(...arguments)
})

app.get('/lookup/:fromLanguage/:term/:toLanguage', function () {
  return lookupRouteHandler(...arguments)
})

app.get('/wordlist/:language', async (req, res) => {
  const language = getIcnpLanguageCode(req.params.language)
  const result = await getWordlist(language)
  if (!result) {
    res.status(204).end()
  } else {
    res.json(result)
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
  await updateConceptCollection()
  await app.listen(port)
  log(`HTTP server ready on :${port}`)
}
