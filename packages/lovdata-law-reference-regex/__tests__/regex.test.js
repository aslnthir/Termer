import {
  lawReferenceRegExp, getLawReference, getRegulationsReference, lovtittel,
  korttittel, paragraf1, paragraf2, hyphens, kapittel, bokstav
} from '../src/regexes.js'
import RegExp from '../src/RegExp.js'

describe('regex matches', () => {
  test.each([
    'Beitelova',
    'Lov om folketrygd',
    'lov 15. mai 2008 nr. 35 om utlendingers adgang til riket og deres opphold her'
  ])('%s', regexTester(lawReferenceRegExp()))
})

describe('lovtittel', () => {
  test.each([
    'lov 18. desember 2009 nr. 131 om sosiale tjenester i arbeids- og ' +
      'velferdsforvaltningen §§ 20 eller 20 a'
  ])('%s', (regexTester(lovtittel)))
})

describe('korttittel', () => {
  test.each([
    'barnebortføringskonvensjonen',
    'yrkesskadeforsikringsloven',
    'barneloven',
    'brann- og eksplosjonsvernloven',
    'beitelova',
    'lappekodisillen',
    'roma-vedtektene',
    'nordisk konkurskonvensjon',
    'menneskerettskonvensjonen',
    'helsingforsavtalen',
    'svalbardtraktaten'
  ])('%s', (regexTester(korttittel)))
})

describe('paragraf 1', () => {
  test.each([
    '§3',
    '§ 3 og § 4',
    '§ 3, § 4 og § 5',
    '§3-1'
  ])('%s', (regexTester(paragraf1)))
})

describe('paragraf 2', () => {
  test.each([
    '§§ 33',
    '§§33 og 38',
    '§§ 33, 34 og 38',
    '§§33-38',
    '§§ 33–38',
    'def §§ 33 – 38',
    'abc §§ 20 eller 20 a'
  ])('%s', (regexTester(paragraf2)))
})

describe('hyphens', () => {
  test.each([
    '-', // 2d
    '‐', // e2 80 90
    '‑', // e2 80 91
    '‒', // e2 80 92
    '–', // e2 80 93
    '—', // e2 80 94
    '―', // e2 80 95
    '⁃', // e2 81 83
    '−' // e2 88 92
  ])('%s', regexTester(hyphens))
})

describe('kapittel', () => {
  test.each([
    'kapittel 5',
    'kapittel 5, 6 og 7',
    'kapittel VIa',
    'kapittel VI a',
    'kapittel VI A'
  ])('%s', (regexTester(kapittel)))
})

describe('bokstav', () => {
  test.each([
    'bokstav a',
    'bokstav a og b',
    'bokstav a, b',
    'bokstav a, b og c',
    'bokstav a, b, c',
    'bokstavene a, b og c'
  ])('%s', (regexTester(bokstav)))
})

function regexTester (regex) {
  regex = new RegExp(regex, 'i')
  return (str) => {
    return expect(regex.test(str)).toBe(true)
  }
}

describe('lovrefs', () => {
  test.each([
    [
      'beitelova §5',
      {
        korttittel: 'beitelova',
        paragraf: '5'
      }
    ],
    [
      'lov 18. desember 2009 nr. 131 om sosiale tjenester i arbeids- og velferdsforvaltningen §§ 20 eller 20 a',
      {
        tittel: 'lov om sosiale tjenester i arbeids- og velferdsforvaltningen',
        paragraf: '20,20'
      }
    ],
    [
      'straffeloven §48',
      {
        korttittel: 'straffeloven',
        paragraf: '48'
      }
    ],
    [
      'brann- og eksplosjonsvernloven §17',
      {
        korttittel: 'brann- og eksplosjonsvernloven',
        paragraf: '17'
      }
    ],
    [
      'yrkesskadetrygdloven § 53 bokstav c',
      {
        korttittel: 'yrkesskadetrygdloven',
        paragraf: '53',
        bokstav: 'bokstav c'
      }
    ],
    [
      'yrkesskadetrygdloven § 53 bokstavene a og b',
      {
        korttittel: 'yrkesskadetrygdloven',
        paragraf: '53',
        bokstav: 'bokstavene a og b'
      }
    ],
    [
      'yrkesskadetrygdloven § 53 bokstavene a, b og c',
      {
        korttittel: 'yrkesskadetrygdloven',
        paragraf: '53',
        bokstav: 'bokstavene a, b og c'
      }
    ],
    [
      'yrkesskadeforsikringsloven § 3 andre ledd',
      {
        korttittel: 'yrkesskadeforsikringsloven',
        paragraf: '3'
      }
    ],
    [
      'yrkesskadeforsikringsloven § 3 andre og tredje ledd',
      {
        korttittel: 'yrkesskadeforsikringsloven',
        paragraf: '3'
      }
    ],
    [
      'yrkesskadeforsikringsloven § 3 andre, tredje og femte ledd',
      {
        korttittel: 'yrkesskadeforsikringsloven',
        paragraf: '3'
      }
    ],
    [
      'yrkesskadeforsikringsloven § 3 1., 2. og 5. ledd',
      {
        korttittel: 'yrkesskadeforsikringsloven',
        paragraf: '3'
      }
    ],
    [
      'barneloven §§ 38 og 63',
      {
        korttittel: 'barneloven',
        paragraf: '38,63'
      }
    ],
    [
      'barneloven kapittel 5',
      {
        korttittel: 'barneloven',
        kapittel: '5'
      }
    ],
    [
      'barneloven kapittel 5 og 6',
      {
        korttittel: 'barneloven',
        kapittel: '5,6'
      }
    ],
    [
      'nordisk konkurskonvensjon',
      {
        korttittel: 'nordisk konkurskonvensjon'
      }
    ],
    [
      'barnebortføringskonvensjonen',
      {
        korttittel: 'barnebortføringskonvensjonen'
      }
    ],
    [
      'sivilbeskyttelsesloven kapittel VI a',
      {
        korttittel: 'sivilbeskyttelsesloven',
        kapittel: 'VIA'
      }
    ],
    [
      '(sivilbeskyttelsesloven) inneholder bestemmelser om rekvisisjon',
      {
        korttittel: 'sivilbeskyttelsesloven'
      }
    ],
    [
      'lov 15. desember 1950 nr. 7 om særlige rådgjerder under krig, krigsfare og liknende forhold (beredskapsloven) § 15',
      {
        tittel: 'lov om særlige rådgjerder under krig, krigsfare og liknende forhold',
        korttittel: 'beredskapsloven',
        paragraf: '15'
      }
    ],
    [
      '(beredskapsloven)',
      {
        korttittel: 'beredskapsloven'
      }
    ],
    [
      'lov 25. juni 2010 nr. 45 om kommunal beredskapsplikt, sivile beskyttelsestiltak og sivilforsvaret.',
      {
        tittel: 'lov om kommunal beredskapsplikt, sivile beskyttelsestiltak og sivilforsvaret'
      }
    ],
    [
      'referanse til lov 15. mai 2008 nr. 35 om utlendingers adgang til riket og deres opphold her.',
      {
        tittel: 'lov om utlendingers adgang til riket og deres opphold her'
      }
    ],
    [
      'lov om tilskudd ved avbrutt permittering (økonomiske tiltak i møte med virusutbruddet)',
      {
        tittel: 'lov om tilskudd ved avbrutt permittering (økonomiske tiltak i møte med virusutbruddet)'
      }
    ]
  ])('%s', (input, expectedResult) => {
    const result = getLawReference(input)
    expect(result).toStrictEqual(expectedResult)
  })
})

describe('forskriftrefs', () => {
  test.each([
    [
      'referanse til forskrift om forurensning og avfall på svalbard.',
      {
        tittel: 'forskrift om forurensning og avfall på svalbard',
      }
    ],
    [
      // There cannot be any spaces in the short title, because then we could
      // match any multi word string ending in -forskriften.
      'ugyldige ugyldighetsforskriften',
      {
        korttittel: 'ugyldighetsforskriften',
      }
    ],
  ])('%s', (input, expectedResult) => {
    const result = getRegulationsReference(input)
    expect(result).toStrictEqual(expectedResult)
  })
})
