import axios from 'axios'
import logger from './logger.js'
import jsdom from 'jsdom'

const log = logger.log

//summary:
//the lookup has to first search for how many entries match the searchword
//then make a request per match. Each match has a base64 encoded XML, we 
//then the xml is parsed for the relevant information

//param: term: string 
//returns: object containing definition
export async function lookup(term){
  const result = await searchNaob(term)
  if(result){
    const formattedResult = format(result)
    return formattedResult
  }
  else{
    return null
  }
}

//param: term: string
//returns: array of results
async function searchNaob(term){
//one term may have multiple definitions
//first we have to do a request to get the 
  var result = await postRequest(term, false)
  //console.log(result.array)
  var terms = []
  //console.log(result.array.length)
  if(result.array){
    for(var i = 0; i < result.array.length; i++){
      //console.log(result.array[i].wordcombined[0])
      var termResult = await postRequest(result.array[i].wordcombined[0], true)
      terms.push(termResult)
    }
    //console.log(terms)
    return terms
  }
  else{
    return null
  }
}

//param: term: string
//param: isExactWordSearch: boolean
//returns: object: result of postRequest
async function postRequest(term, isExactWordSearch){
  var data = JSON.stringify({
    "searchData": term,
    "isExactWordSearch": isExactWordSearch,
    "freeTextSearch": false
  });

  var config = {
    method: 'post',
    url: 'https://naob.no/search-word',
    headers: { 
      'Content-Type': 'application/json'
    },
    data : data
  };

  var result = null;

  await axios(config)
  .then(function (response) {
    //console.log(JSON.stringify(response.data));
    result = response.data
  })
  .catch(function (error) {
  log('failed to process request');
    return null
  });
  return result;
}

//gets all the relevant data out of the result and formats it
//param: data: array: result as given by request
//returns: result in the format 
function format(data){
  for(var i = 0; i < data.length; i++){
    //decode the base64 xmlcontent
    var extractedData
    try{
    //decode the string to extract data
    const base64string = data[i].array[0].xmlcontent[0]
    let bufferObj = Buffer.from(base64string, "base64")
    const decodedString = bufferObj.toString("utf8")
    extractedData = extractData(decodedString)
    }
    catch(err){
      console.log('an error occurred decoding the base64 string')
      console.error(err)
      data[i] = null
    }

    const gloss = '<b>etymology: </b>' + extractedData.etymology 
      + '<br><b>definitions: <br></b>' + extractedData.definitions
    
    //replace data with formatted data
    data[i] = {
      forms: [data[i].array[0].oppslagsord[0]],
      definitions: {
        gloss: gloss,
        url: 'https://naob.no/ordbok/' + data[i].array[0].wordcombined[0]
      },
      _id: data[i].array[0].artid[0],
      //original: {
        //data: data[i]
      //}
    }
  }
  return data
}

//extracts the wanted data from the string and returns it in a object
//param: htmlString: string
//returns: array<object {}>
function extractData(htmlString){
  //console.log(htmlString)
  const dom = new jsdom.JSDOM(htmlString).window.document
  const overskriftElements = dom.getElementsByClassName('overskrift')
  var etymology
  for(let element of overskriftElements){
    if(element.innerHTML == "ETYMOLOGI"){
      //get the etymology text
      //regex removes link tags
      etymology = element.parentElement.getElementsByTagName('div')[0].innerHTML.replace(/<a\b[^>]*>(.*?)<\/a>/gi, '$1')
      //console.log(etymology)
    }
  }

  var definitions = ''
  const definitionElements = dom.getElementsByClassName('betydning')

  for(var i = 0; i < definitionElements.length; i++){
    var definition = ''
    //console.log('**************')
    const children = definitionElements[i].children
    for(var k = 0; k < children.length; k++){
      //console.log(children[k].className)
      if(children[k].className == 'redeksseksjon' 
        || children[k].className == 'sitatseksjon'
        || children[k].className == 'overskrift'
        || children[k].className == ''){
        break
      }

      if(children[k].className == "betydningnr"){
        var indent = 0.75
        var padding = indent

        if(children[k].innerHTML.indexOf('.') != -1){
          const indentCount = children[k].innerHTML.match(/\./g || []).length
          padding = indentCount * 2.5
          indent = indentCount * 1.5
        }
        definition += "<span style='padding-left: " + padding + "em; text-indent: -" + indent + "em; display: inline-block'><b>" + children[k].innerHTML.replace(/[^0-9\.]/g, " ") + "</b>"
      }
      else{
        //definition += children[k].textContent.replace(/[\r\n]+|\s{2,}/g, " ") + '</span>'
        definition += children[k].textContent.replace(/[\r\n]+|\s{2,}/g, " ")
      }
    }
    definition += '</span>'
    definitions += definition + "<br>"
    
  }

  return {
    etymology: etymology,
    definitions: definitions
  }
}
