/**
 * Author: Kristian Skibrek
 * DOC: 19/02/22
 */


//TODO: model after search results
//TODO: add boolean flag for if the text is complete or not
import mongoose from 'mongoose'

//is modeled after the searchresult in the termercore/APIs/src/api.ts
let entrySchema = new mongoose.Schema({
	forms: [String],
	definitions: {
		gloss: String,
		url: String
	},
	komplett: Boolean
})

export const Entry = mongoose.model('entry', entrySchema, 'Entry')
