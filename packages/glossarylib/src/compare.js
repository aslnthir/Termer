/*
 * Vertraulich
 */
import levenshtein from 'js-levenshtein'

export function compareLexemes (lexemeIdList, lexemeList) {
  const testElementID = lexemeIdList.pop()
  if (!testElementID) return []
  const testTerms = lexemeList[testElementID].forms
  let results = []
  lexemeIdList.forEach(lexemeID => {
    const lexeme = lexemeList[lexemeID]
    testTerms.forEach(word => {
      let wordMatch
      let dinstance
      let lowestScore
      lexeme.forms.forEach(testWord => {
        dinstance = levenshtein(word.toLowerCase(), testWord.toLowerCase())
        if (!lowestScore || lowestScore > dinstance) {
          lowestScore = dinstance
          wordMatch = testWord
        }
      })
      if (scoreLexemeTest(lowestScore, word)) {
        results.push({
          score: lowestScore,
          lexemesMatch: [testElementID, lexemeID],
          termMatch: [word, wordMatch]
        })
      }
    })
  })
  const nextResult = compareLexemes(lexemeIdList, lexemeList)
  results = results.concat(nextResult)
  return results
}

function scoreLexemeTest (score, string) {
  if (string.length < 6 && score < 2) return true
  else return score < string.length / 2
}

function scoreDefinitionTest (score, string) {
  return score < string.length / 2
}

export function compareLexemesDict (lexemeIdList, lexemeList) {
  const list = [...lexemeIdList]
  const compList = compareLexemes(list, lexemeList)
  const returnDict = {}
  compList.forEach(item => {
    item.lexemesMatch.forEach(lexemeId => {
      if (!(lexemeId in returnDict)) returnDict[lexemeId] = []
      returnDict[lexemeId].push(item)
    })
  })
  return returnDict
}

export function compareTwoLexemeLists (lexemeIdList1, lexemeIdList2, lexemeList) {
  const results = {}
  lexemeIdList1.forEach(listID => {
    results[listID] = compareLexemeToList(listID, lexemeIdList2, lexemeList)
  })
  return results
}

function compareLexemeToList (lexemeId, lexemeIdList, lexemeList) {
  const results = []
  const testElement = lexemeList[lexemeId]
  lexemeIdList.forEach(listID => {
    const lexeme = lexemeList[listID]
    const testScore = compareTwoLexemes(testElement, lexeme)
    if (Object.keys(testScore).length !== 0) {
      testScore.lexemesMatch = [lexemeId, listID]
      results.push(testScore)
    }
    /*
    const dinstance = levenshtein(
      testElement.gloss.toLowerCase(),
      definition.gloss.toLowerCase()
    )
    if (scoreLexemeTest(dinstance, testElement.gloss)) {
      if (!(definitionID in results)) results[definitionID] = []
      const item = {
        score: dinstance,
        definitionIds: [definitionID, listID],
        text: [testElement.gloss, definition.gloss]
      }
      results[definitionID].push(item)
    } */
  })
  return results
}

function compareTwoLexemes (lexeme1, lexeme2) {
  if (lexeme1.id === lexeme2.id) return {}
  const results = {}
  const termsLexeme1 = lexeme1.forms
  const termsLexeme2 = lexeme2.forms
  termsLexeme1.forEach(wordId1 => {
    let wordMatch
    let dinstance
    let lowestScore
    termsLexeme2.forEach(wordId2 => {
      dinstance = levenshtein(wordId1.toLowerCase(), wordId2.toLowerCase())
      if (!lowestScore || lowestScore > dinstance) {
        lowestScore = dinstance
        wordMatch = wordId2
      }
    })
    if (scoreLexemeTest(lowestScore, wordId1)) {
      results.score = lowestScore
      results.termMatch = [wordId1, wordMatch]
    }
  })
  return results
}

export function compareDefinitions (definitionIdList, definitionList) {
  const testElementID = definitionIdList.pop()
  if (!testElementID) return []
  const testElement = definitionList[testElementID]
  const results = {}
  definitionIdList.forEach(definitionID => {
    const definition = definitionList[definitionID]
    const dinstance = levenshtein(
      testElement.gloss.toLowerCase(),
      definition.gloss.toLowerCase()
    )
    if (scoreDefinitionTest(dinstance, testElement.gloss)) {
      if (!(testElementID in results)) results[testElementID] = []
      if (!(definitionID in results)) results[definitionID] = []
      const item = {
        score: dinstance,
        definitionIds: [testElementID, definitionID],
        text: [testElement.gloss, definition.gloss]
      }
      results[testElementID].push(item)
      results[definitionID].push(item)
    }
  })

  return results
}

export function compareTwoDefinitionLists (definitionIdList1, definitionIdList2, definitionList) {
  let results = {}
  definitionIdList1.forEach(listID => {
    results = Object.assign({}, results, compareDefinitionToList(listID, definitionIdList2, definitionList))
  })
  return results
}

function compareDefinitionToList (definitionID, definitionIdList, definitionList) {
  const results = {}
  const testElement = definitionList[definitionID]
  definitionIdList.forEach(listID => {
    // if (listID === definitionID) continue
    const definition = definitionList[listID]
    if (definition.id === testElement.id) return

    const div = document.createElement('div')
    div.innerHTML = testElement.gloss
    const testElementText = div.textContent.toLowerCase()

    div.innerHTML = definition.gloss
    const definitionText = div.textContent.toLowerCase()

    const dinstance = levenshtein(
      testElementText,
      definitionText
    )
    if (scoreDefinitionTest(dinstance, testElement.gloss)) {
      if (!(definitionID in results)) results[definitionID] = []
      const item = {
        score: dinstance,
        definitionId: listID,
        text: definition.gloss
      }
      results[definitionID].push(item)
    }
  })
  return results
}
