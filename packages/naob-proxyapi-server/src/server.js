/**
 * Author Kristian Skibrek
 * DOC: 21/04/2022
 */

import express from 'express'
import logger from './logger.js'
import {lookup} from './lookup.js'
import {getWordlist} from './wordlist.js'
const port = 6019
const log = logger.log

const app = express()

app.get('/test', async(req, res, next) => {
  res.set("Access-Control-Allow-Origin", "*")
  res.json('test')
})

app.get('/lookup/:term', async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*")
  const response = await lookup(req.params.term.toLocaleLowerCase())
  res.json(response)
})

app.get('/getWordList', async(req, res, next) => {
  res.set("Access-Control-Allow-Origin", "*")
  const wordList = await getWordlist();
  res.json(wordList)
})

//Is started in index.js
export default async function server () {

  log('starting server ...')
  await app.listen(port)
  log(`HTTP server ready on :${port}`)
}
