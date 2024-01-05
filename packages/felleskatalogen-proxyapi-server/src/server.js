/**
 * Author Kristian Skibrek
 * DOC: 08/02/2022
 * test
 */

import express from 'express'
import mongoose from 'mongoose'
import logger from './logger.js'
import { port, mongodbServer, mongodbName } from './constants.js'
import { scrapeMedInfo } from './scraper.js'
import {getWordList,
  loadWordToDB,
  getInfoFromDB,
  checkDBInitialized,
  checkIfTermIsInWordlist,
  initializeWordlistDB,
  initializeWordlistDBsoft,
  updateInfo,
  updateTerm
  } from './controller.js'
import {scrapeMedicationList} from './medicationScraper.js'
import {Entry} from './model.js'

const log = logger.log

const app = express()

app.get('/lookup/:term', async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*")
  const medInfo = await scrapeMedInfo(req.params.term.toLocaleLowerCase())
  res.json(medInfo)
  log('lookup done.\n')
})

app.get('/getWordList', async(req, res, next) => {
  res.set("Access-Control-Allow-Origin", "*")
  const wordList = await getWordList();
  res.json(wordList)
})

app.get('/testDB', async(req, res) => {
  try{
    res.set("Access-Control-Allow-Origin", "*")
    log(await Entry.find())
    res.send('check log')
  }
  catch(err){
    res.send(err.toString())
  }
})

app.get('/testScrape', async(req, res) => {
  try{
    res.set("Access-Control-Allow-Origin", "*")
    const medInfo = await scrapeMedInfo("abilify")
    res.json(medInfo)
    log(medInfo)
  }
  catch(err){
    res.send(err.toString())
  }
})


app.get('/testUpdateTerm', async(req, res) => {
  try{
    await updateTerm('test abilify', 'new indications', 'https://www.felleskatalogen.no/medisin/abilify-2care4-668476')
    res.send('term updated, check log')
  }
  catch(err){
    res.send(err)
  }
})

app.get('/testUpdateInfo', async(req, res) => {
  try{
    await updateInfo('https://www.felleskatalogen.no/medisin/abilify-2care4-668476', 'test indication for abilify, lorem ipsum dolor etc')
    res.send('term updated, check log')
  }
  catch(err){
    res.send(err)
  }
})

app.get('/scrapeAllMedications', async(req, res) =>{
  try{
    res.set('Access-Control-Allow-Origin', '*')
    const result = await scrapeMedicationList()
    res.send(result)
  }
  catch(err){
    res.send(err.toString())
  }
})

app.get('/getAllLinks', async (req, res) => {
  try{
    res.set('Access-Control-Allow-Origin', '*')
    const result = await getAllLinks('https://www.felleskatalogen.no/medisin/a')
    res.json(result)
  }
  catch(err){
    res.send(err.toString())
  }
})

app.get('/resetDB', async(req, res) => {
  try{
    res.set("Access-Control-Allow-Origin", "*")
    var con = await mongoose.connect(`${mongodbServer}/termer-felleskatalogen`);
    con.connection.db.dropDatabase(function(err, db) {
      res.send('Database has been reset')
    })
    await initializeWordlistDB()
    log('wordlist initialized')
  }
  catch(err){
    res.send.apply(err.toString())
  }
})

app.get('/testWordlist', async(req, res) => {
  res.send('test')
})

//Is started in index.js
export default async function server () {
  log('connecting db...')
  
  try{
    await mongoose.connect(`${mongodbServer}/termer-felleskatalogen`, {
      useNewUrlParser: true, 
      useUnifiedTopology: true
    })
    log('db connected')
  }
  catch(error){
    log('error while connecting database')
    log(error)
  }
  
  try{
    const wordlistInitialized = await checkDBInitialized()
    if(wordlistInitialized === false){
      await initializeWordlistDB()
      log('wordlist initialized')
    }
  }
  catch(error){
    log(error)
  }


  log('starting server ...')
  await app.listen(port)
  log(`HTTP server ready on :${port}`)
}
