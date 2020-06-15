import * as scraper from './scrapers/nehnutelnosti'
import { collect } from './process/collect'

const harvest = {
  scraper: 'nehnutelnosti',
  parameters: {
    location: 'bratislava-v-petrzalka',
    property: '3-izbove-byty',
    type: 'prenajom',
  },
}

const zilinaAptHarvest = {
  scraper: 'nehnutelnosti',
  parameters: {
    location: 'zilina',
    property: '3-izbove-byty',
    type: 'predaj',
  },
}

const houseHarvest = {
  scraper: 'nehnutelnosti',
  parameters: {
    location: 'bernolakovo',
    property: 'rodinne-domy',
    type: 'predaj'
  }
}

scraper.discover(zilinaAptHarvest).then(() => {
  console.log('List parsed')
  console.log('Starting to process all new ones')
  return scraper.scrape()
}).then(collect)
  .then(() => console.log('all done'))
  .catch(e => console.error(e))
