import createWordlist, { insertInWordlist } from '../../../src/Wordlist'

describe('wordlist', () => {
  describe('insertInWordlist', () => {
    let wordlist
    beforeEach(() => {
      wordlist = createWordlist(['b__', 'd__', 'f__'])
    })
    it('inserts in correct order #1', () => {
      insertInWordlist('a__', wordlist)
      assert.strictEqual(wordlist[3], 'a__b__d__f__')
    })
    it('inserts in correct order #2', () => {
      insertInWordlist('c__', wordlist)
      assert.strictEqual(wordlist[3], 'b__c__d__f__')
    })
    it('inserts in correct order #3', () => {
      insertInWordlist('e__', wordlist)
      assert.strictEqual(wordlist[3], 'b__d__e__f__')
    })
    it('inserts in correct order #4', () => {
      insertInWordlist('g__', wordlist)
      assert.strictEqual(wordlist[3], 'b__d__f__g__')
    })
  })
})
