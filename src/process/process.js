const scrape = require('../scrape')

scrape.getAll().then(() => {
  console.log('List parsed')
  console.log('Starting to process all new ones')
  return scrape.getAllDetails()
})
