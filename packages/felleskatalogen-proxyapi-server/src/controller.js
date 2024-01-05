/**
 * Author: Kristian Skibrek
 * Date: 01/03/2022
 */
//this file contains functions relating to controlling the database

import logger from './logger.js'
import fs from 'fs/promises'
import path from 'path'
import mongoose from 'mongoose'
import {Entry} from './model.js'
import {getSplitTitle} from './scraper.js'

const log = logger.log

async function loadWordListToDB(wordlist) {
	log('loading wordlist...')
	//every second line is the link for the term in the line before
	for (var i = 0; i < wordlist.length; i++) {
		let word = wordlist[i]
		if(((i+1) % 2 )!= 0){
			let komplettFlag = false
			if(word.includes('komplett felleskatalogtekst')){
				word = word.replace('komplett felleskatalogtekst', '')
				komplettFlag = true
			}
			let nameForms = []
			nameForms.push(word.toLowerCase().trim())
			const extractedMedNames = await extractMedName(word.toLowerCase())
			nameForms.push.apply(nameForms, extractedMedNames)
			let entry = {
				forms: nameForms,
				definitions: {
					gloss: null,
					url: wordlist[i+1]
				},
				komplett: komplettFlag 
			}
		loadWordToDB(entry)
		}
	}
	log('wordlist loaded')
}

/*
params: medication in "navn produsent form" form. (example: abacavir/lamivudin «mylan» tabl.)
returns: only the medication name (example: abacavir/lamivudin) 
TODO: fix novorapid issue. If detects 
*/
async function extractMedName(navnProdForm){
	let medNames = []
	let medName = navnProdForm.split(' «')[0]
	//if the medication has multiple names
	//example: https://www.felleskatalogen.no/medisin/novorapid-novorapid-flexpen-novorapid-penfill-novorapid-pumpcart-novo-nordisk-562204
	if (medName.includes(',')){
		const splitNames = await getSplitTitle(medName)
		medNames.push.apply(medNames, splitNames)
		log(medNames)
	}
	else{
		medNames.push(medName)
	}
	return medNames 
}

//params: name of medication
//returns: name separated 
export async function getTitleFromSite(name){
	getSplitTitle() 
}

export async function getWordList(){
    const wordlistFromDB = await getWordListFromDB()
    for(var i = 0; i < wordlistFromDB.length; i++){
	    word.replace('Komplett Felleskatalogtekst', '')
    }
    const wordlist = [].concat(wordlistFromDB.wordlist, await getWordsFromFile('./resources/wordlistNavnFormStyrke'))
    return wordlist
}

export async function initializeWordlistDB(){
	try{
    		log('initializing wordlist in db...')
    		const wordlist = await getWordsFromFile('./resources/wordlistNavnProdForm')
    		await loadWordListToDB(wordlist)
	}
	catch(err){
		log('error initializing wordlist', err.toString())
	}
}

//initializes the wordlist without 
export async function initializeWordlistDBsoft(){
	try{
    		log('initializing wordlist in db...')
    		const wordlist = await getWordsFromFile('./resources/wordlistNavnProdForm')
    		await loadWordListToDB(wordlist)
	}
	catch(err){
		log('error initializing wordlist', err.toString())
	}
}

export async function checkDBInitialized(){
    const dbResponse = await Entry.find({})
    if(dbResponse.length === 0){
        log('wordlist is not initialized')
        return false
    }
    else{
        log('wordlist is initialized')
        return true
    }
}

export async function getWordListFromDB(){
    log('getting word list from database')
    const dbResponse = await Entry.find()
    let wordlist = []
    for (let word of dbResponse){
        for(var i = 0; i < word.forms.length; i++){
            //same term should not appear in the word list twice
            if(wordlist.indexOf(word.forms[i]) === -1){
                wordlist.push(word.forms[i])
            }
        }
    }
    
    return {wordlist: wordlist}
}

export async function checkIfTermIsInWordlist(searchTerm){
    const wordlist = await getWordList()
    log(searchTerm)
    log(wordlist.indexOf(searchTerm))
    if(wordlist.indexOf(searchTerm) === -1){
        log('term is not in wordlist')
        return false 
    }
    else{
        log('term is in wordlist')
        return true 
    }
}

export async function checkIfIndicationsInDB(searchTerm){
    const result = await Entry.find({lexeme: {forms : {$nin: [searchTerm]}}})
    if(result[0].indikasjoner === null){
        return false
    }
    else{
        return true
    }
}

export async function loadWordToDB(entryToBeEntered){

    if(await getInfoFromDB(entryToBeEntered.forms[1]).length === 0){
        log(entryToBeEntered.forms[1], ' is already in db')
        return
    }
    let entry = new Entry(entryToBeEntered)

    await entry.save()
    .then(doc => {
    })
    .catch(err => {
        log(err)
    })
}

//get a term from database by term name
export async function getInfoFromDB(searchTerm){
    const query = {"forms": searchTerm}
    const result = await Entry.find(query, {__v:0})
    if(result === undefined){
        return null
    }
    return result
}

export async function getInfoByURL(url){
	const query = {'definitions.url' : url}
	const result = await Entry.find(query, {__v: 0})
	if(result === undefined){
		return null
	}
	return result[0]
}

export async function updateTerm(term, indications, link){
    log('updating', term, '...')
    const filter = {'definitions.url' : link}
    const update = {
	    'definitions.gloss': indications,
	    $push : {forms : term}
    }
    try{
    await Entry.updateOne(filter, update)
    log('term updated')
    }
    catch(err){
	    log('error while updating term', err)
    }
}

export async function updateInfo(url, indications){
    log('updating', url, 'with info', indications, '...')
    const filter = {'definitions.url' : url}
    const update = {
	    'definitions.gloss': indications
    }
    try{
	    await Entry.updateOne(filter, update)
	    log('term updated')
    }
    catch(err){
	    log('error while updating term', err)
    }
}

async function getWordsFromFile(filePath){
    log('getting words from file...')
    const relativeFilePath = path.resolve(filePath)

    const file = await fs.readFile(relativeFilePath, 'utf8')

    var fileContentArray = file.split(/\r\n|\n/)
    log('words gotten')
    return fileContentArray.map(fileContent => fileContent.toLowerCase()) 
}
