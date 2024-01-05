import mongoose from 'mongoose'

const entrySchema = new mongoose.Schema({
  lexeme: {
    language: String,
    forms: [String],
    lemmas: [String]
  },
  definitions: [{
    gloss: String,
    language: String,
    lastEditTime: String,
    examples: [{
      id: String,
      text: String
    }]
  }],
  langaugeLexeme: String,
  langaugeDefinitions: String,
  id: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  }
})
export const Entry = mongoose.model('Entry', entrySchema)

const didyoumeanSchema = new mongoose.Schema({
  fromLanguage: String,
  toLanguage: String,
  searchTerm: String,
  didyoumean: [String]
})

export const Didyoumean = mongoose.model('Didyoumean', didyoumeanSchema)
