import mongoose from 'mongoose'

const entrySchema = new mongoose.Schema({
  lexeme: {
    id: String,
    language: String,
    forms: [String],
    lemmas: [String],
    foundIn: String,
    glossary: String,
  },
  definitions: [{
    id: String,
    gloss: String,
    language: String,
    lastEditTime: String,
    examples: [{
      id: String,
      text: String
    }],
    sourceId: String,
    glossaryId: String,
  }],
  langaugeLexeme: String,
  langaugeDefinitions: String,
  id: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  sourceId: String,
  glossaryId: String,
})
export const Entry = mongoose.model('Entry', entrySchema)

const didyoumeanSchema = new mongoose.Schema({
  fromLanguage: String,
  toLanguage: String,
  searchTerm: String,
  didyoumean: [String]
})

export const Didyoumean = mongoose.model('Didyoumean', didyoumeanSchema)
