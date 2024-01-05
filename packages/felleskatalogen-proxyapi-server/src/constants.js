/**
 * purpose: defining constant variables to be used in the server
 */

export const documentTTL = 60 * 60 * 24

//the port is either the port specified in the .env file (in this case 6013) or 6013
export const port = process.env.FELLESKATALOGEN_BACKEND_PORT || 6015

//mongodb
export const mongodbServer = process.env.FELLESKATALOGEN_MONGODB_SERVER ||
  'mongodb://localhost'

export const mongodbName = 'termer-felleskatalogen'

export const tmpDir = process.env.FELLESKATALOGEN_BACKEND_CACHE_DIR ||
  (process.env.XDG_CACHE_DIR ? process.env.XDG_CACHE_DIR + '/felleskatalogen/' : null) ||
  (process.env.HOME + '/.cache/felleskatalogen/')