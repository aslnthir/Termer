import logger from './logger.js'
import jsdom from 'jsdom'
import re from 'lovdata-law-reference-regex/src/regexHelper.js'
import { lovPostfix } from 'lovdata-law-reference-regex'
import RegExp from 'lovdata-law-reference-regex/src/RegExp.js'
import spanAll from './utils/spanAll.js'

const log = logger.log

export function extract (reference, document) {
  if (typeof document === 'string') {
    document = new jsdom.JSDOM(document).window.document
  }
  let extract
  if (reference.kapittel) {
    extract = extractChapter(reference, document)
  } else if (reference.paragraf) {
    extract = extractParagraph(findParagraph(reference, document))
  // } else if (reference.bokstav) {
  } else {
    extract = extractLawSummary(document)
  }
  if (extract) {
    const documentTitle = extractLawTitle(document)
    if (documentTitle) {
      extract.documentTitle = documentTitle
    }
  }
  return extract
}

const trailingShortTitleRegexp = new RegExp(
  re`\s*(?:
    \[[^\]]+${lovPostfix}\]|
    \([^\)]+${lovPostfix}\)
  )$`
)

function extractLawTitle (document) {
  let text = document.querySelector('.metaTitleText')
  if (text) text = text.textContent
  else return null
  // remove short title from document title.
  text = text.replace(trailingShortTitleRegexp, '')
  text = text.toLowerCase()
  return text
}

export function extractChapter (reference, document) {
  const number = reference.kapittel
  const selector = `[data-refid="kap${number}"] h2`
  const element = document.querySelector(selector)
  if (element) {
    // Grab the first paragraph from the chapter as the extract for the chapter.
    const firstParagraphElement = document.querySelector(
      selector + '~ [id*="PARAGRAF_"]'
    )
    const { extract } = extractParagraph(firstParagraphElement)
    return {
      extract,
      title: element.textContent
    }
  } else return {}
}

// summary or first available §
export function extractLawSummary (document) {
  const summary = getShortSummary(document)
  if (summary) {
    return {
      extract: summary
    }
  } else {
    return getFirstParagraph(document)
  }
}

function getShortSummary (document) {
  // Paragraphs under heading “Kort om loven”
  // Applies to (examles):
  // - forvaltningsloven
  // - aksjeloven
  let shortSummary = document.querySelectorAll('.dokument-intro p')
  if (shortSummary && shortSummary.length > 0) {
    const regex = new RegExp(re`^Oppdatert \d`)
    shortSummary = [].slice.apply(shortSummary).map(x => x.textContent.trim())
      .filter(x => !regex.test(x))
    shortSummary = '<p>' + shortSummary.join('\n<p>')
    log('short summary:', shortSummary)
    return shortSummary
  }
}

function getFirstParagraph (document) {
  // §1 of the law, or chapter if there are no paragraphs.
  let firstParagraph = document.querySelector('[id^=PARAGRAF_]') || document.querySelector('[id^=KAPITTEL_]')
  if (firstParagraph) {
    return extractParagraph(firstParagraph)
  }
  // For laws that have no §’s, like the ‘cancelli-promemoria’.
  firstParagraph = document.querySelector('.avsnitt')
  return {
    extract: firstParagraph.textContent
  }
}

export function findParagraph (reference, document) {
  const number = reference.paragraf.match(/\d+(?:-\d+)?/)[0]
  const selector = `#PARAGRAF_${number}`
  const paragraph = document.querySelector(selector)
  return paragraph
}
export function extractParagraph (paragraphElement) {
  if (!paragraphElement) return null
  const selector = 'p, table.listeItem, table.avsnitt:not(.fotnote)'
  const numberSelector = '.paragrafValue'
  const titleSelector = '.paragrafTittel'
  const elements = [].slice.apply(
    paragraphElement.querySelectorAll(selector)
  )
  const title = paragraphElement.querySelector(titleSelector)
  if (!title && elements.length === 0) return null
  const number = paragraphElement.querySelector(numberSelector)
  const spans = spanAll(elements, x => x.nodeName)
  let text = ''
  for (const span of spans) {
    const spanType = span[0].nodeName
    if (spanType === 'P') {
      text += '<p>' +
        span.map(x => x.textContent.trim())
          .join('<p>')
    } else if (spanType === 'TABLE') {
      text += tablesArrayToHtmlList(span)
    }
  }
  let numberText = ''
  let titleText = ''
  if (number) {
    numberText = number.textContent.trim()
  }
  if (title) {
    titleText = title.textContent.trim()
  }
  const result = {}
  if (!text) {
    if (!title) return null
    else {
      // Use the title as paragraph text
      result.extract = titleText
      if (numberText) result.title = numberText
    }
  } else {
    result.extract = text
    result.title = [numberText, titleText].filter(x => x).join(' ')
  }
  return result
}

function tablesArrayToHtmlList (arr) {
  return tablesToList(arr).join('')
}

function getListType (el) {
  const listMarkerRe = /^(?:(?<alpha>[a-z]\))|(?<numeric>\d+\.|\(\d+\)))\s*/
  const reResult = listMarkerRe.exec(el.textContent.trim())
  let listType = null
  if (reResult) {
    const { alpha, numeric } = reResult.groups
    if (alpha) {
      listType = 'a'
    } else if (numeric) {
      listType = '1'
    }
  }
  return { listType, listMarkerRe }
}

function tablesToList (tableElements, returnLevel) {
  const myLevel = tableElements[0].dataset.level
  const { listType, listMarkerRe } = getListType(tableElements[0])
  const text = []

  let el = tableElements.shift()
  while (el) {
    const level = el.dataset.level
    if (level === myLevel) {
      // next item in this list
      let item = el.textContent.trim()
      if (listType) {
        item = item.replace(listMarkerRe, '')
      }
      text.push('<li>', item)
    } else {
      tableElements.unshift(el)
      if (level === returnLevel) {
        // finish this list, return to previous level
        break
      } else {
        // new sublist
        const sublist = tablesToList(tableElements, myLevel)
        text.push(...sublist)
      }
    }
    el = tableElements.shift()
  }
  text.unshift(`<ol type="${listType || 1}">`)
  text.push('</ol>')
  return text
}
