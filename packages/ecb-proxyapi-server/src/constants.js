export const documentTTL = 60 * 60 * 24

export const port = process.env.ECB_BACKEND_PORT || 6006

export const mongodbServer = process.env.ECB_MONGODB_SERVER ||
  'mongodb://localhost'

export const tmpDir = process.env.ECB_BACKEND_CACHE_DIR ||
  (process.env.XDG_CACHE_DIR + '/ecb/') ||
  (process.env.HOME + '/.cache/ecb/')
