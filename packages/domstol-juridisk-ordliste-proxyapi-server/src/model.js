import mongoose from 'mongoose'

const entrySchema = new mongoose.Schema({
  term: String,
  definition: String,
  id: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  }
})
export const Entry = mongoose.model('Entry', entrySchema)
