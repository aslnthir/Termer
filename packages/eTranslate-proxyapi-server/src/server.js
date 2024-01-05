import express from 'express'
import mongoose from 'mongoose'
import logger from './logger.js'
import bodyParser from 'body-parser'

import { port, mongodbServer, mongodbName } from './constants.js'
const log = logger.log

import { lookup, getWordlist,
  getSourcelist, createSources,
  storeEntry
  } from './controller.js'

const app = express()

app.get('/lookup/:glossary/:term', async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*")
  const term = req.params.term
  const glossary = req.params.glossary

  const result = await lookup(term, glossary)
  if (!result) {
    res.status(404).end()
  } else {
    res.json(result)
  }
})

app.get('/wordlist/', async (req, res) => {
  // res.set("Access-Control-Allow-Origin", "*")
  const result = [] // await getWordlist()
  if (!result) {
    res.status(404).end()
  } else {
    res.json(result)
  }
})

app.get('/source/', async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*")
  const sources = await getSourcelist()
  if (!sources) {
    res.status(404).end()
  } else {
    res.json(sources)
  }
})

// create application/x-www-form-urlencoded parser
const urlencodedParser = bodyParser.urlencoded({ extended: false })

app.post('/eTranslate/Callback/', urlencodedParser, async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*")
  // console.log(req.body)
  const bodyData = await req.body
  storeEntry(bodyData)
  res.status(204).end()
})

export default async function server () {
  await mongoose.connect(`${mongodbServer}/${mongodbName}`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  )
  log('db connected')
  await createSources()
  await app.listen(port)
  log(`HTTP server ready on :${port}`)
}
