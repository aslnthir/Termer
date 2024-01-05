/**
 * Author: Kristian Skibrek
 * date 23/03/22
 */
//this file contains 

import {getHTMLDocument} from './scraper.js';
import logger from './logger.js'
import fs from 'fs/promises'

const log = logger.log

let url = 'https://www.felleskatalogen.no/medisin/'
var wordlist = []

//gets all the 
export async function scrapeMedicationList(){
    for(var i = 0; i < 26; i++){
        var letter = getLetter(i);
        log('getting meds starting with', letter)
        await addAllLinks(url + letter)
        log(letter, 'done')
    }
    await writeWordlistToFile()
    return wordlist
}

function getLetter(number){
    return (number+10).toString(36)
}


export async function addAllLinks(url){

    const dom = await getHTMLDocument(url)
    const elementList = dom.querySelectorAll('[class = toggle-action]')
    addMedicationList(elementList)
}

function addMedicationList(elementList){
    const medicationList = []
    for(var i = 0; i < elementList.length; i++){
        wordlist.push({
            'medication': elementList[i].title,
            'link': elementList[i].href
        })
    }
}

//TODO: remove the 'Komplett FelleskatalogTekst' which appears on some medications
function writeWordlistToFile(){
    log('writing wordlist to file...')
    let filePath = './resources/wordlistNavnProdForm'
    let printString = ''
    for(var i = 0; i < wordlist.length; i++){
        printString += wordlist[i].medication + '\n'
        printString += wordlist[i].link + '\n'
    }
    fs.writeFile(filePath, printString)
    log('writing done')
}
