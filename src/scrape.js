const scraper = require('./scrapers/nehnutelnosti')
const collect = require('./process/collect')

scraper.discover().then(() => {
  console.log('List parsed')
  console.log('Starting to process all new ones')
  return scraper.scrape()
}).then(collect)
.then(() => console.log('all done'))
.catch(e => console.error(e))
