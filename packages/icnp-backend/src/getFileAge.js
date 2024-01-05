import fs from 'fs/promises'
import logger from './logger.js'

const log = logger.log

export default getFileAge

async function getFileAge(filePath) {
  // Get file age in seconds. Returns fake age if file does not exist.
  const currentTime = Date.now()/1000
  try {
    const mtime = (await fs.stat(filePath)).mtimeMs/1000
    const age = currentTime - mtime
    return age
  } catch (e) {
    log(filePath, 'does not exist, returning fake file age')
    return 999999999
  }
}

