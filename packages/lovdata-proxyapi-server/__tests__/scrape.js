/* eslint-env jest */
import {
  fixupDocumentList
} from '../src/scrape-laws'

describe('scraper', () => {
  it('splits out short name in square brackets', async () => {
    const coll = [
      'lov om norges flag [flaggloven]'
    ].map(name => { return { name } })
    const result = fixupDocumentList(coll)
    const expected = [
      'lov om norges flag',
      'flaggloven',
      'flagglova'
    ]
    expect(pick(result, 'name')).toStrictEqual(expected)
  })

  it('turns -loven into -lova, and vice versa', () => {
    const coll = [
      'veglova'
    ].map(name => { return { name } })
    const result = fixupDocumentList(coll)
    const expected = [
      'veglova',
      'vegloven'
    ]
    expect(pick(result, 'name')).toStrictEqual(expected)
  })

  describe('does not convert loven <=> lova for blacklisted names', () => {
    const blacklisted = ['grunnloven', 'grunnlova']
    for (const name of blacklisted) {
      it(name, () => {
        expect(pick(fixupDocumentList([{ name }]), 'name')).toStrictEqual([name])
      })
    }
  })

  it('removes ‘m.v.’, ‘m.m.’ and variants', () => {
    const coll = [
      'lov om allmenninger m.v.',
      'lov om helseforetak m.m.',
      'lov om helsepersonell m.v. (helsepersonelloven)',
      'lov om individuell pensjonsordning mv.',
      'lov om kornforvaltning m.v'
    ].map(name => { return { name } })
    const result = fixupDocumentList(coll)
    const expected = [
      'lov om allmenninger',
      'lov om helseforetak',
      'lov om helsepersonell',
      'lov om individuell pensjonsordning',
      'lov om kornforvaltning',
      'helsepersonelloven',
      'helsepersonellova'
    ]

    expect(pick(result, 'name')).toStrictEqual(expected)
  })

  it('excludes opphevingslov, endringslov etc.', () => {
    const coll = [
      'lov om allmenninger m.v. (opphevelseslov)',
      'lov om vaktvirksomhet (endringslov)',
      'endringslov til skattebetalingsloven'
    ].map(name => { return { name } })
    const result = fixupDocumentList(coll)
    const expected = []
    expect(pick(result, 'name')).toStrictEqual(expected)
  })

  it('short and long names are separated', () => {
    const coll = [
      'lov om domstolene (domstolloven)',
      'lov om jakt og fangst av vilt (viltloven)',
      'lov om jord (jordlova)',
      'lov om luftfart (luftfartsloven)'
    ].map(name => { return { name } })
    const result = fixupDocumentList(coll)
    const expected = [
      'lov om domstolene',
      'lov om jakt og fangst av vilt',
      'lov om jord',
      'lov om luftfart',
      'domstolloven',
      'viltloven',
      'jordlova',
      'luftfartsloven',
      'domstollova',
      'viltlova',
      'jordloven',
      'luftfartslova'
    ]
    expect(pick(result, 'name')).toStrictEqual(expected)
  })

  it('removes dot from the end', () => {
    const coll = ['lov om kringkasting.']
      .map(name => { return { name } })
    const result = fixupDocumentList(coll)
    const expected = ['lov om kringkasting']
    expect(pick(result, 'name')).toStrictEqual(expected)
  })

  it('does not add ‘lov om’ to excluded names', () => {
    const coll = [
      'cancelli-promemoria',
      'kong christian den femtis norske lov',
      'norske lov',
      'traktat mellem norge, amerikas forente stater, danmark, frankrike, italia, japan, nederlandene, storbritannia og irland og de britiske oversjøiske besiddelser og sverige angående spitsbergen'
    ]
    const coll1 = coll.slice().map(name => { return { name } })
    const result = fixupDocumentList(coll1)
    const expected = coll
    expect(pick(result, 'name')).toStrictEqual(expected)
  })

  it('removes blacklisted laws', () => {
    const coll = [
      'grunnlova - grl. - nynorsk',
      'grunnloven - grl. - bokmål'
    ].map(name => { return { name } })
    const result = fixupDocumentList(coll)
    expect(result).toStrictEqual([])
  })

  it('drops text after `-` which is not a shortname', () => {
    const coll = [
      'norske lov - nl',
      'norske lov – nl',
      'grunnlova - nynorsk',
      'konfliktrådsloven - konfrådl'
    ].map(name => { return { name } })
    const result = fixupDocumentList(coll)
    const expected = [
      'norske lov',
      'norske lov',
      'grunnlova',
      'konfliktrådsloven',
      'konfliktrådslova'
    ]
    expect(pick(result, 'name')).toStrictEqual(expected)
  })
})

// Map over an iterable of objects, picking out a single named property of each
// object.
function pick (iterable, key) {
  return iterable.map(x => x[key])
}
