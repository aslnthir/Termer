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

const lawName = new mongoose.Schema({
  lawName: String,
  lawId: String,
  status: {
    type: Number,
    default: null
  },
  source: {
    type: String,
    default: null
  }
})
export const LawName = mongoose.model('LawName', lawName)

const extractSchema = new mongoose.Schema({
  id: String,
  paragraf: {
    type: String,
    default: null
  },
  kapittel: {
    type: String,
    default: null
  },
  bokstav: {
    type: String,
    default: null
  },
  extract: String,
  title: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: documentTTL + 's'
  }
})

export const LawExtract = mongoose.model('LawExtract', extractSchema)
