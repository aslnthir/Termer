import mongoose from 'mongoose'

const ONE_WEEK = (7 * 24 * 60 * 60) + 's'
const ONE_MONTH = (30 * 24 * 60 * 60) + 's'


const conceptSchema = new mongoose.Schema({
  conceptId: String, // integer ID, code, "c"
  conceptName: String, // "k", knowledge_name, CamelCase English
  term: String, // "p", preferred term
  language: String, // language code
  createdAt: {
    type: Date,
    default: Date.now,
  }
})

conceptSchema.index({ language: 1, term: 1 }); // schema level

const descriptionSchema = new mongoose.Schema({
  conceptId: String, // "code", integer ID
  language: String, // language code
  description: String,
  term: String, // "preferred_term"
  // parents: Array, // Array<String>
  examples: Array, // Array<String>
  createdAt: {
    type: Date,
    default: Date.now,
    expire: ONE_WEEK
  }
})
descriptionSchema.index({ language: 1, term: 1 }); // schema level

const requestLogSchema = new mongoose.Schema({
  url: String,
  createdAt: {
    type: Date,
    default: Date.now,
    expire: ONE_MONTH
  }
})

export const Concept = mongoose.model('Concept', conceptSchema)
export const Description = mongoose.model('Description', descriptionSchema)
export const RequestLog = mongoose.model('RequestLog', requestLogSchema)

/*
{"563":{"r":"Capacidade para Mover-se 10012108","p":"Capacidade para Mover-se","k":"AbilityToMobilise","c":"10012108"}}

{"icnp_type":"ICNP Primitive","code":"10012108","knowledge_name":"AbilityToMobilise","preferred_term":"Capacidade para Mover-se","search":"Capacidade para Mover-se 10012108","description":"Capacidade: Movimentação voluntária do corpo.","axis":"F","axis_name":"Foco","root":"0","version":"1","parents":[{"code":"10000075","term":"Capacidade para Executar"}],"children":[{"code":"10000258","term":"Capacidade para Andar (Caminhar)"},{"code":"10028461","term":"Capaz de Mobilizar-se"},{"code":"10021068","term":"Mobilidade em Cadeira de Rodas"},{"code":"10003181","term":"Mobilidade na Cama"},{"code":"10001219","term":"Mobilidade, Prejudicada"}]}
*/
