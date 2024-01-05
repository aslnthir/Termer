export const documentTTL = 60 * 60 * 24

export const port = process.env.LEXIN_BACKEND_PORT || 6004

export const mongodbServer = process.env.LEXIN_MONGODB_SERVER
  || 'mongodb://localhost'

export const mongodbName = 'termer-lexin'
