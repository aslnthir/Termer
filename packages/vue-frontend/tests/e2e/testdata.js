const user = {
  username: 'testuser@test.localdomain',
  password: '123456'
}

const testingTerm = {
  lexemes: [
    {
      // source: posetive integer,
      terms: [
        {
          term: 'test',
          lemma: true
        }
      ]
    }
  ],
  meaning: 'testing'
  // source: posetive integer
}

module.exports.user = user
module.exports.testingTerm = testingTerm
