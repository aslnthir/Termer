export const documentTTL = 60 * 60 * 24

export const port = process.env.SPRAKRADET_BACKEND_PORT || 6006

export const mongodbServer = process.env.SPRAKRADET_MONGODB_SERVER ||
  'mongodb://localhost'

export const tmpDir = process.env.SPRAKRADET_BACKEND_CACHE_DIR ||
  (process.env.XDG_CACHE_DIR + '/sprakradet/') ||
  (process.env.HOME + '/.cache/sprakradet/')
