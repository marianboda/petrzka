const scrape = require('../scrape')
const collect = require('./collect')

scrape.getAll().then(() => {
  console.log('List parsed')
  console.log('Starting to process all new ones')
  return scrape.getAllDetails()
}).then(collect)
.then(() => console.log('all done'))
.catch(e => console.error(e))
