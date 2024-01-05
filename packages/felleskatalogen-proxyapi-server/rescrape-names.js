import mongoose from 'mongoose'
import logger from './src/logger.js'
import { LawName } from './src/model.js'
import { addLawIds } from './src/controller.js'
import { mongodbServer, mongodbName } from './src/constants.js'
import { scrape as scrapeLaws } from './src/scrape-laws.js'
import { scrape as scrapeRegulations } from './src/scrape-regulations.js'

const log = logger.log

async function main () {
  await mongoose.connect(`${mongodbServer}/${mongodbName}`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    }
  )
  log('db connected')

  const result = await LawName.deleteMany({ source: { $ne: '[document]' } })
  log('deleted', result.deletedCount)

  for await (const { documentNames, sourceUrl } of scrapeLaws()) {
    await addLawIds(documentNames, sourceUrl)
  }
  for await (const { documentNames, sourceUrl } of scrapeRegulations()) {
    await addLawIds(documentNames, sourceUrl)
  }
}

Promise.all([main()]).then(() => process.exit(0))
