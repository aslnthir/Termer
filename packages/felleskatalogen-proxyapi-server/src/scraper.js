/**
 * Author: Kristian Skibrek
 * DOC: 12. february 2022
 */


import got from 'got'
import logger from './logger.js'
import { tmpDir } from './constants.js'
import fs from 'fs/promises'
import sanitizeFilename from 'sanitize-filename'
import jsdom from 'jsdom'
import {getInfoFromDB, getInfoByURL, updateInfo, updateTerm, checkIfTermIsInWordlist} from './controller.js'

const log = logger.log

export async function scrape(url){
    log('scrape starting...')
    try{
        const response = await got(url)
        log('scrape ended')
        return response
    }
    catch(error){
	log(url)
        log(error)
        return null
    }
}

//TODO: refactor to make more readable 
//params: name of medication (string)
//returns: array of entries with the specified name or null
export async function scrapeMedInfo(medName){
	try{
		log('searching for', medName)
		const termInWordlist = await checkIfTermIsInWordlist(medName)
		if(!termInWordlist){
			log('term not found in wordlist, returning null')
			return null
		}
		log('term found in wordlist')
		var entries = await getInfoFromDB(medName)
		log('there are', entries.length, 'entries in the DB')
		if(entries.length === 0 || entries === null){
			entries = await addTermFromWeb(medName)
		}
		else{
			entries = await getMedGloss(entries)
		}
		return entries
	}
	catch(error){
		log('an error occured inf scrapeMedInfo', error)
		log('returning null')
		return null
	}
}

//params: array of entries from the DB
//returns: array of the entries with their gloss (explanation and such)
async function getMedGloss(entries){
	var newEntries = []
	for (var i = 0; i < entries.length; i++){
		if(entries[i].definitions.gloss != null){
			newEntries.push(entries[i])
		}
		else{
			if(entries[i].komplett === true){
				const medInfo = await getMedInfo(entries[i].definitions.url)
				//updating both the database entries and the local entries
				await updateInfo(entries[i].definitions.url, medInfo)
				entries[i].definitions.gloss = medInfo
			}
			else{
				//only get the links
				const medInfo = await getMedInfo(entries[i].definitions.url)
				await updateInfo(entries[i].definitions.url, medInfo)
				entries[i].definitions.gloss = medInfo
			}
		}
	}
	return entries
}

async function addTermFromWeb(medName){
	const result = await getInfoFromWebsite(medName)
	log('result', result)
	const url = cleanURL(result.url)
	await updateTerm(medName, result.indications, url) 		
	const entry = await getInfoByURL(url)
	log('entry', entry)
	var entries = []
	entries.push(entry)
	return entries	
}

//gets the information from website felleskatalogen.no
async function getInfoFromWebsite(medName){

	var link = await getLink(medName)
	var medInfo = await getMedInfo(link.href)	
    
	return {
		name: medName,
		indications: medInfo,
		url: link.href
	}

}

//params: medication
//returns: link to the felleskatalogen page (as object, not string) or null (if doesent exist)
async function getLink(medName){
	const url = "https://www.felleskatalogen.no/medisin/internsok?sokord=" + medName
	var link, medInfo
	const completeLink = await getCompleteLink(url)
	if(completeLink === null || completeLink === undefined){
		try{
			log('no complete link found, getting only link')
			link = await getOnlyLink(url)

		}
		catch(err){
			log('error getting med info returning null')
			return null;
		}
	}
	else{
		try{
			link = completeLink
		}
		catch(err){
			log(err)
		}
	}
	return link
} 

//gets information from webpage
//params: url for a medication page
//returns: the info located on the site as a string
async function getMedInfo(url){
	log(url)
	const dom = await getHTMLDocument(url);
	const indicationElement = dom.querySelector('[class = "indikasjon section"]')
	const linkSet = dom.querySelectorAll('[class = "anchorindex"]')
	const linkSetString = await generateLinksetString(linkSet, url)
	if(indicationElement != null || indicationElement != undefined){
		var indicationsString = removeFirstWordAndWhiteSpace(removeLineBreaks(indicationElement.textContent))
		// log('***** indications', indicationsString)
		return linkSetString + '<b>Indikasjoner</b font-size="15"><br>' + indicationsString
	}
	return linkSetString 
}

//params: html element cointaining link elements 
//returns: string of html code as it will be presented in termer
async function generateLinksetString(linkSet, url){
	var output = ''
	const linkArray = Array.from(linkSet)
	for(var i = 0; i < linkArray.length; i++){
		var element = linkArray[i]
		var href = element.href
		if(href != undefined){
			output += '<a href="' + href + '">'
			output += element.textContent
			output += '</a>'
		}
		else{
			output += '<span>'
			output += element.textContent
			output += '</span>'
		}	
		if(i != linkArray.length -1){
			output += ' | '
		}
	}
	output += "<br><br>"
	return output 
}

//get link to page with complete info
async function getCompleteLink(url){
    const dom = await getHTMLDocument(url)
    const allLinks = await getAllLinks(dom)
    log('getting complete link')
    const completeLink = await checkForTitle('Komplett', allLinks)
    return completeLink
}

//if there is only one link
async function getOnlyLink(url){
	const dom = await getHTMLDocument(url)
	log('getting only link')
	const link = dom.querySelector('.toggle-action')
	return link
}

//params: name of medication
//returns: name separated as in the website (array)
export async function getSplitTitle(medName){
	medName = medName.replace( /[\r/]+/gm, " ")
	medName = medName.replace( /[\r%]+/gm, " ")
	try{
		const link = await getLink(medName) 
		const dom = await getHTMLDocument(link.href)
		const splitNames = await getTitles(dom)

		return getInnerHTML(splitNames)
	}
	catch(err){
		log("error getting", medName, err.toString())
	}
}

//params: nodelist
//returns: array of innerHTML
function getInnerHTML(nodelist){
	const nodeArray = Array.from(nodelist)
	var output = []
	for(var i = 0; i < nodeArray.length; i++){
		output.push(nodeArray[i].innerHTML.toLowerCase())	
	}
	return output
}

//params: jsondom object
//returns: nodelist of the titles in the object (<h1 class="PreparatNavn">)
async function getTitles(doc){
	try{
		const names = doc.querySelectorAll('[class = "PreparatNavn"]')
		return names
	}
	catch(error){
		log('error getting titles from website', error)
	}
}

//returns nodelist of all links in the document
async function getAllLinks(document){
    try{
        var links = document.querySelectorAll('a')
        return links
    }
    catch(error){
        log('error while getting all links: ', error)
        return(null)
    }
}

//finds the element in the given list which has a title containing the given target title
async function checkForTitle(targetTitle, list){
    try{
        return await iterateList(targetTitle, list)
    }
    catch(error){
        log(error)
        return null;
    }
}

//iterates a list and uses the findTitleInElement to see if the element contains the title
//returns the element if found
async function iterateList(targetTitle, list){
    const listLength = list.length
    var iterator = 0
    var found = false

    while(iterator < listLength && !found){
        var foundElement = findTitleInElement(targetTitle, list[iterator])
        if(foundElement!=null){
            return foundElement
        }
        iterator ++
    }
}

//breaks the string into separate words and checks if it contains the target title.
//returns element if found, null otherwise
function findTitleInElement(targetTitle, element){
    const titles = element.title.split(' ')
        for (var i = 0; i < titles.length; i += 1) {
            var title = titles[i];
            if (title === targetTitle) {
                return element
            }
        }
    return null;
}

//TODO: checking dates for cached files and overwrites if they are too old
export async function getHTMLDocument (url) {
    const htmlFile = tmpDir + sanitizeFilename(url)

    var html, dom

    try{
        html = await fs.readFile(htmlFile, 'utf8')
        dom = new jsdom.JSDOM(html, { url }).window.document
    }
    catch(error){
        log('cached file not found')
        const response = await scrape(url)
        await fs.writeFile(htmlFile, response.body)
        html = await fs.readFile(htmlFile, 'utf8')
        dom = new jsdom.JSDOM(html, { url }).window.document
    }

    return dom
}

//removes \n from string
function removeLineBreaks(str){
    str = str.replace( /[\r\n]+/gm, "")
    return str
}

//removes first word from a string and whitespace
function removeFirstWordAndWhiteSpace(str) {
    var words = str.replace(/^\s+|\s+$/g, '').split(' ')
    log('removing first word', words[0])
    delete words[0]
    return words.join(' ').replace(/^\s+|\s+$/g, '');
}

//remove the ?markering = 1 which appears on urls gotten from the search field
function cleanURL(url){
	return url.replace('?markering=1', '')
}
