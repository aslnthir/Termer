import express from 'express'
import mongoose from 'mongoose'
import logger from './logger.js'

import { port, mongodbServer, mongodbName } from './constants.js'
const log = logger.log

import { lookup, getWordlist, getSourcelist } from './controller.js'

const app = express()

app.get('/lookup/:term', async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*")
  const term = req.params.term.toLowerCase()
  if (!('fromLanguage' in req.query && 'toLanguage' in req.query)) res.status(404).end()
  const result = await lookup(term, req.query.fromLanguage, req.query.toLanguage)
  if (!result) {
    res.status(404).end()
  } else {
    res.json(result)
  }
})

app.get('/wordlist/', async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*")
  const result = [] // await getWordlist()
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
  await app.listen(port)
  log(`HTTP server ready on :${port}`)
}
