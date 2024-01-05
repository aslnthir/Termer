const fs = require('fs')
if (!fs.existsSync('.env')) {
  console.error('.env file not found!')
  console.error('See an example .env file in env.example')
  process.exit(1)
}
