import fs from 'fs/promises'
export async function getWordlist(){
  var data = await fs.readFile('./resources/Lemmaliste_Snaprud_april_2023.txt', 'utf8')
  var fileContentArray = data.split(/\r\n|\n/)
  //console.log(wordlist.length)
  //console.log(fileContentArray.length)
  return fileContentArray
}
