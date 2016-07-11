const scraper = require('./scrapers/nehnutelnosti')
const collect = require('./process/collect')

const harvest = {
  scraper: 'nehnutelnosti',
  parameters: {
    location: 'bratislava-v-petrzalka',
    property: '3-izbove-byty',
    type: 'prenajom',
  },
}

scraper.discover(harvest).then(() => {
  console.log('List parsed')
  console.log('Starting to process all new ones')
  return scraper.scrape()
}).then(collect)
  .then(() => console.log('all done'))
  .catch(e => console.error(e))
