export const documentTTL = 60 * 60 * 24

export const port = process.env.DSB_BACKEND_PORT || 6014

export const mongodbServer = process.env.DSB_MONGODB_SERVER
  || 'mongodb://localhost'

export const mongodbName = 'termer-dsb'
