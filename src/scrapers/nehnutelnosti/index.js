const fetch = require('node-fetch')
const Promise = require('bluebird')
const _ = require('lodash')
const async = require('async')
const moment = require('moment')
const sql = require('../../SqlService')
const { parseList, parseAd } = require('./parser')

const makeUrl = (page = 1) => {
  const url = 'http://www.nehnutelnosti.sk/bratislava-v-petrzalka/3-izbove-byty/prenajom'
  if (page === 1)
    return url
  return `${url}?p[page]=${page}`
}

const getPage = (page) => fetch(makeUrl(page))

let liveAds = []

const deleteDead = (live) => {
  sql.getAds().then((ads) => {
    const stored = ads.filter(i => i.time_deleted == null).map(i => i.id)
    const dead = stored.filter(i => !live.includes(i))
    const timeDeleted = moment().format('YYYY-MM-DD HH:mm:ss')
    dead.forEach(i => {
      console.log('deleting ID: ', i)
      sql.updateAd({ id: i, time_deleted: timeDeleted })
        .catch(e => console.error(e))
    })
  })
}

const parsePage = (page) => {
  return getPage(page)
    .then(r => r.text())
    .then(parseList)
    .then((r) => ({ records: r, page }))
}

const storeRecs = (res) => {
  const { records, page } = res
  console.log(' - ', records.length, ' records')
  sql.addAds(records)
  liveAds = liveAds.concat(records.map(i => i.id))
  return { records, page }
}

const parseAndStore = (page) => {
  console.log('getting page: ', page)
  return parsePage(page).then(storeRecs)
    .then(({ records, page }) => {
      if (records.length > 0) {
        return parseAndStore(page + 1)
      }
      return null
    })
}

const getAll = () => {
  return new Promise((resolve, reject) => {
    parseAndStore(1)
      .then(() => deleteDead(liveAds))
      .then(() => resolve())
      .catch(err => {
        console.error('error', err)
        reject()
      })
  })
}


const scrapeAd = (rec) => {
  const p = new Promise((resolve, reject) => {
    console.log(rec.link)
    fetch(rec.link).then(r => r.text())
    .then(body => {
      const ad = parseAd(body)
      ad.id = rec.id
      console.log(ad.id)
      sql.updateAd(ad)
      resolve(ad)
    })
    .catch(e => {
      console.error(e)
      reject(e)
    })
  })
  return p
}

const getAllDetails = () => {
  return new Promise((resolve, reject) => {
    const newAds = []
    const adScraper = (task, cb) => {
      scrapeAd(task).then((res) => {
        newAds.push(res)
        cb(null)
      }).catch(e => cb(e))
    }
    const adQ = async.queue(adScraper)
    adQ.drain = () => {
      console.log('==============================================================')
      console.log('Stavy:', _.countBy(newAds, i => i.condition))
      console.log('Ulice:', _.countBy(newAds, i => i.location))
      console.log('Energie:', _.countBy(newAds, i => i.price_energy))
      console.log('Plochy:', _.countBy(newAds, i => i.area))
      console.log('==============================================================')
      resolve()
    }
    sql.getAds()
      .then((ads) => {
        const unpAds = _.take(ads.filter(i => i.images == null), 100)
        // const unpAds = ads.filter(i => i.id === 'i2448859')
        adQ.push(unpAds)
        console.log(unpAds.length, '/', ads.length)
        return null
      })
  })
}

module.exports = { getAllDetails, getAll }
