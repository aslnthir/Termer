export const documentTTL = 60 * 60 * 24

export const port = process.env.ECT_BACKEND_PORT || 6016

export const domain = process.env.ECT_BACKEND || 'https://webhook.site/6bb9cf9d-a9a7-4c07-9ea5-900b11085227'

export const mongodbServer = process.env.ECT_MONGODB_SERVER
  || 'mongodb://localhost'

export const mongodbName = 'termer-eTranslate'
