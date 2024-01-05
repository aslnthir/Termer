export const documentTTL = 60 * 60 * 24

export const port = process.env.DOMSTOL_BACKEND_PORT || 6000

export const mongodbServer = process.env.DOMSTOL_MONGODB_SERVER
  || 'mongodb://localhost'

export const mongodbName = 'termer-domstol'

