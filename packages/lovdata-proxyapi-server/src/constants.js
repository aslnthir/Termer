export const documentTTL = 60 * 60 * 24

export const port = process.env.LOVDATA_BACKEND_PORT || 6000

export const mongodbServer = process.env.LOVDATA_MONGODB_SERVER ||
  'mongodb://localhost'

export const mongodbName = 'termer-lovdata'

export const tmpDir = process.env.LOVDATA_BACKEND_CACHE_DIR ||
  (process.env.XDG_CACHE_DIR ? process.env.XDG_CACHE_DIR + '/lovdata/' : null) ||
  (process.env.HOME + '/.cache/lovdata/')

export const maxCachedFileAge =
  parseInt(
    process.env.MAX_FILE_AGE_SECONDS ||
    (
      60 * // seconds
      60 * // minutes
      24 * // hours
      30 // days
    )
  )
