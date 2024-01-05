export const documentTTL = 60 * 60 * 24

export const port = process.env.ICNP_BACKEND_PORT || 6000

export const mongodbServer = process.env.ICNP_MONGODB_SERVER
  || 'mongodb://localhost'

export const mongodbName = 'termer-icnp'

