import mongoose from 'mongoose'

const entrySchema = new mongoose.Schema({
  lexeme: {
    language: String,
    forms: [String],
    lemmas: [String]
  },
  definitions: [{
    gloss: String,
    note: String,
    language: String,
    lastEditTime: String
  }],
  glossary: {type: mongoose.Schema.Types.ObjectId, ref: 'Glossary'},
  createdAt: {
    type: Date,
    default: Date.now,
  }
})
export const Entry = mongoose.model('Entry', entrySchema)

const glossarySchema = new mongoose.Schema({
  name: String,
  displayname: String,
  sourceLanguage: String,
  targetLanguage: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
})

export const Glossary = mongoose.model('Glossary', glossarySchema)

const sourceSchema = new mongoose.Schema({
  url: String,
  name: String,
  displayname: String,
  description: String,
  contactEmail: String,
  inputLanguages: {
    type: Map,
    of: [String]
  },
  glossaries: [
    {type: mongoose.Schema.Types.ObjectId, ref: 'Glossary'}
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
})

export const Source = mongoose.model('Source', sourceSchema)
