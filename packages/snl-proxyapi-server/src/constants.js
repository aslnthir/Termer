export const documentTTL = 60 * 60 * 24

export const port = process.env.SNL_BACKEND_PORT || 6012

export const mongodbServer = process.env.SNL_MONGODB_SERVER
  || 'mongodb://localhost'

export const mongodbName = 'termer-snl'
