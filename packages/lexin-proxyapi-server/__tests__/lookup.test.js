import mongoose from 'mongoose'
import { lookup } from '../src/controller.js'
import { mongodbServer } from '../src/constants.js'
import {
  Entry
} from '../src/model.js'

beforeAll(async () => {
  // Connect to a Mongo DB
  await mongoose.connect(`${mongodbServer}/test-lexin`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  )
})

// Cleans up database between each test
afterEach(async () => {
  await Entry.deleteMany()
})

afterAll(async () => {
  // Closes the Mongoose connection
  await mongoose.connection.close()
})

const exampleObject = {
  "_id": expect.any(Object),
  "id": expect.any(String),
  "text": expect.any(String)
}

const definitionObject = {
  "_id": expect.any(Object),
  "examples": expect.arrayContaining([
    expect.objectContaining(exampleObject)
  ]),
  "gloss": expect.any(String),
  "language": expect.any(String)
}

const lexemeObject = {
  "forms": expect.arrayContaining([expect.any(String)]),
  "language": expect.any(String),
  "lemmas": expect.arrayContaining([expect.any(String)])
}

const resultObject = {
  "_id": expect.any(Object),
  "definitions": expect.arrayContaining([
    expect.objectContaining(definitionObject)
  ]),
  "lexeme": expect.objectContaining(lexemeObject)
}

const didyoumeanObject = {
  "didyoumean": expect.arrayContaining([expect.any(String)])
}

const responseObject = {
  "results": expect.arrayContaining([expect.objectContaining(resultObject)]),
  "didyoumean": expect.arrayContaining([expect.any(String)])
}

test('lookup bil', async (done) => {
  jest.setTimeout(30000)
  const result = await lookup('bil', 'nb', 'nb')
  // console.log(result)
  // expect(result).toEqual(expect.arrayContaining([expect.objectContaining(resultObject)]))
  // const result2 = [{"__v": 0, "_id": "60195234811d19ef304fcc71", "createdAt": "2021-02-02T13:23:00.446Z", "definitions": [{"_id": "60195234811d19ef304fcc72", "examples": [{"_id": "60195234811d19ef304fcc73", "id": "89", "text": "kjøre bil"}], "gloss": "et motorkjøretøy med fire hjul", "language": "nb", "lastEditTime": "1612272180432"}], "lexeme": {"forms": ["bil", "bilen", "biler", "bilene"], "language": "nb", "lemmas": ["bil"]}}]

  expect(result).toEqual(
    expect.objectContaining(responseObject)
  )
  done()
})

test('check didyoumean return', async (done) => {
  jest.setTimeout(30000)
  const result = await lookup('seizure', 'en', 'en')

  expect(result).toEqual(
    expect.objectContaining(didyoumeanObject)
  )
  done()
})
/*
// Test will fail as this will not match
test('lookup epileptic seizure - en - en', async (done) => {
  jest.setTimeout(30000)
  const result = await lookup('epileptic seizure', 'en', 'en')

  expect(result).toEqual(
    expect.arrayContaining([
      expect.objectContaining(resultObject)
    ])
  )
  done()
})
*/
/*
test ('fetch "seizure" from lexin', async (done) => {
  jest.setTimeout(30000)
  const result = await lookup('seizure', 'en', 'en')
  expect(result).toEqual(
    expect.arrayContaining([
      expect.objectContaining(resultObject)
    ])
  )
  done()
})
*/
