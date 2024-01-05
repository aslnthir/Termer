//   create new backend using this regex, node/express etc.

/*
mulige direkte referanser:

del 1,2,3 etc: #kapi, #kapii, etc
- fungerer ikke fordi referansene kan være duplisert i dokumentet

kapittel 1: #kap1

§1: #§1

§1-1: #§1-1 (kapittel 1 § 1)

§ 1 bokstav a: #§1a
§1 a: #§1a

§1-1 a: #§1-1a
*/

import RegExp from './RegExp.js'
import re from './regexHelper.js'

// Various dashes, hyphens and minuses:
export const hyphens = '[-‐‑‒–—―⁃−]'
const alfa = '[a-zæøå]'
const inTitle = re`(?:${alfa}|${hyphens}|[\s\.,])`

const mndnavn = re`(?:januar|februar|mars|april|mai|juni|juli|august|september|
                oktober|november|desember)`

export const lovPostfix = re`(?:loven|lova|kodisillen|vedtektene|konvensjon(?:en)?
  |avtalen|traktaten)`

export const lovDatoId = re`\d\d?\.\s${mndnavn}\s\d\d\d\d\snr\.\s\d{1,3}`

const lovtittel = re`(?<tittel>
  lov\s
    (?<lovid>${lovDatoId}\s)?
  [ou]m\s
  ${inTitle}+
  /* some titles include text in parentheses.
   * we match this here, unless the parenthesised text ends with a known short
   * title postfix.
   * (?<!x)y is a negative lookbehind assertion, and
   * will match the ‘y’ only if it is not preceeded by ‘x’.
   */
  (?:\(${inTitle}+(?<!${lovPostfix})\)|\b)
)`

const forskriftstittel = re`(?<tittel>forskrift\s(?<lovid>${lovDatoId}\s)?[ou]m\s[-a-zæøå \.,]+(?=\b))`

const korttittelSpecialCases = '(?:nordisk konkurskonvensjon|norske lov|cancelli-promemoria)'

const korttittelWithPostfix = re`
  (?:(?:${hyphens}|${hyphens}\sog\s|${alfa})+${lovPostfix})`

export const lovkorttittel = re`
  (?:${korttittelSpecialCases}|${korttittelWithPostfix})`

const forskriftskorttitteldobbel = re`(forskriften|\sforskrift)`

const forskriftskorttittel = re`
  (?:(?:${hyphens}|${hyphens}\sog\s|${alfa})+${forskriftskorttitteldobbel})`

const lovnavn = re`
  (?:${lovtittel}(?:\s\((?<korttittelParens>${lovkorttittel})\))?|
    (?<korttittel>${lovkorttittel})
  )`

const forskriftsnavn = re`
  (?:${forskriftstittel}(?:\s\((?<korttittelParens>${forskriftskorttittel})\))?|
    (?<korttittel>${forskriftskorttittel})
  )`

const para = re`\s?(?:\d{1,3}${hyphens})?\d{1,3}`

export const paragraf1 = re`(?:§${para})(?:(?:,|\sog)\s(?:§${para}))*`

export const paragraf2 = re`(?:§§${para})(?:(?:,|\sog|\seller)\s(?:${para}))*`

const paragraf = re`(?:${paragraf1}|${paragraf2})`

const roman = re`[ivxIVX]+`

const kap = re`\s(?:\d+|${roman})(?:\s?[a-dA-D])?`

const kapittel = re`kapittel${kap}(?:(?:,|\sog)${kap})*`

const bokstav = re`bokstav(?:ene)?\s(?:[a-z](?:,\s|\sog\s)?)+`

export const subReferenceRegExp = re`
  (?:\s(?<kapittel>${kapittel}))?
  (?:\s
    (?<paragraf>${paragraf})
    (?:\s(?<bokstav>${bokstav}))?
  )?`

export const lawReferenceRegExp = () => new RegExp(re`
  (?:${lovnavn})${subReferenceRegExp}`, 'i'
)

export const regulationsReferenceRegExp = () => new RegExp(re`
  (?:${forskriftsnavn})${subReferenceRegExp}`, 'i'
)

export function getRegulationsReference (str) {
  return getReference(str, regulationsReferenceRegExp())
}

export function getLawReference (str) {
  return getReference(str, lawReferenceRegExp())
}

function getReference (str, regExp) {
  let result = regExp.exec(str)
  if (!result || !result.groups) {
    return null
  }
  let {
    tittel,
    korttittelParens,
    korttittel,
    lovid,
    kapittel,
    paragraf,
    bokstav
  } = result.groups
  result = {}
  if (korttittel) {
    result.korttittel = korttittel
  }
  if (tittel) {
    if (korttittelParens) {
      result.korttittel = korttittelParens
    }
    if (lovid) {
      // drop date/ID from name
      tittel = tittel.replace(lovid, '')
    }
    result.tittel = tittel
  }
  if (kapittel) {
    result.kapittel = kapittel
      .replace(/(?:og|eller)/g, ',')
      .replace(/(?:\s|kapittel)/g, '')
      .toUpperCase()
  }
  if (paragraf) {
    result.paragraf = paragraf
      .replace(/(?:og|eller)/g, ',')
      .replace(/[\s§]/g, '')
  }
  if (bokstav) result.bokstav = bokstav
  return result
}

/*
const ledd1Matches = [
  'andre ledd',
  'andre og sjuende ledd',
  'første, tredje ledd'
  'første, tredje og femte ledd'
]

const ledd1 = [a-zA-ZæøåÆØÅ]+(?:(?:,|\sog)\s[a-zA-ZæøåÆØÅ]+)*\sledd

const ledd2Matches = [
  '2. ledd',
  '2. og 7. ledd',
  '2., 3. ledd',
  '2., 3. og 3. ledd'
]

const ledd2 = \d+\.(?:(?:,|\sog)\s\d+\.)*\sledd
*/
