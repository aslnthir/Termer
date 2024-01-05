import { documentTTL } from './constants.js'
import mongoose from 'mongoose'

const htmlDocumentSchema = new mongoose.Schema({
  url: String,
  html: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
})
export const HtmlDocument = mongoose.model('HtmlDocument', htmlDocumentSchema)

const entrySchema = new mongoose.Schema({
  lexeme: {
    id: String,
    forms: [String],
    lemmas: [String]
  },
  definitions: [{
    id: String,
    gloss: String,
  }],
  langaugeLexeme: String,
  langaugeDefinitions: String,
  id: String,
  foundIn: String,
  createdAt: {
    type: Date,
    default: Date.now,
  }
})
export const Entry = mongoose.model('Entry', entrySchema)

const glossarySchema = new mongoose.Schema({
  url: String,
  name: String,
  id: Number,
  fromLanguage: String,
  toLanguage: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
})
export const Glossary = mongoose.model('Glossary', glossarySchema)
