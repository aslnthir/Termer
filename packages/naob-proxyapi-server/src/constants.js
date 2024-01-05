/**
 * purpose: defining constant variables to be used in the server
 */

export const documentTTL = 60 * 60 * 24

//the port is either the port specified in the .env file (in this case 6013) or 6013
export const port = process.env.NAOB_BACKEND_PORT || 6019

//mongodb
export const mongodbServer = process.env.NAOB_MONGODB_SERVER ||
  'mongodb://localhost'

export const mongodbName = 'termer-naob'

export const tmpDir = process.env.NAOB_BACKEND_CACHE_DIR ||
  (process.env.XDG_CACHE_DIR ? process.env.XDG_CACHE_DIR + '/naob/' : null) ||
  (process.env.HOME + '/.cache/naob/')
