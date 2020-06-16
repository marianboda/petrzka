import fetch from 'node-fetch'
import Promise from 'bluebird'
import _ from 'lodash'
import async from 'async'
import { omit } from 'ramda'
import sql from '../../SqlService'
import { parseList, parseAd, parseGallery } from './parser'
import { timestamp } from './../../utils'

const makeUrl = (harvest, page = 1) => {
  const { location, property, type } = harvest.parameters
  const url = `http://www.nehnutelnosti.sk/${location}/${property}/${type}`
  if (page === 1)
    return url
  return `${url}?p[page]=${page}`
}

const getPage = (harvest, page) => {
  return new Promise((resolve, reject) => {
    fetch(makeUrl(harvest, page)).then((response) => {
      if (response.ok) resolve(response)
      reject(response)
    })
  })
}

let liveAds = []

const deleteDead = (live) => {
  sql.getAds().then((ads) => {
    const stored = ads.filter(i => i.time_deleted == null).map(i => i.id)
    const dead = stored.filter(i => !live.includes(i))
    const timeDeleted = timestamp()
    dead.forEach(i => {
      console.log('deleting ID: ', i)
      sql.updateAd({ id: i, time_deleted: timeDeleted })
        .catch(e => console.error(e))
    })
  })
}

const parsePage = (harvest, page) => {
  return getPage(harvest, page)
    .then(r => r.text())
    .then(parseList)
    .then((r) => ({ records: r, page }))
}

const storeRecs = (res) => {
  const { records, page } = res
  console.log(' - ', records.length, ' records')
  sql.add(records.map(i => ({...i, time_added: timestamp()})))
  liveAds = liveAds.concat(records.map(i => i.id))
  return { records, page }
}

const parseAndStore = (harvest, page) => {
  console.log('getting page: ', page)
  return parsePage(harvest, page).then(storeRecs)
    .then(({ records, page }) => {
      if (records.length > 0) {
        return parseAndStore(harvest, page + 1)
      }
      return null
    })
}

export const discover = (harvest) => {
  return new Promise((resolve, reject) => {
    parseAndStore(harvest, 1)
      .then(() => deleteDead(liveAds))
      .then(() => resolve())
      .catch(err => {
        console.error('discovery error', err)
        reject()
      })
  })
}

export const discoverImages = (ad) => {
  return fetch(ad.galleryUrl).then(r => r.text()).then((body) => {
    const images = parseGallery(body).map(i => i.src)
    return {
      ...omit(['galleryUrl'], ad),
      images: [...ad.images, ...images].join(' '),
    }
  }).catch(e => console.log(e))
}

const scrapeAd = (rec) => {
  const p = new Promise((resolve, reject) => {
    console.log(rec.link)
    fetch(rec.link)
    .then(r => {
      console.log('response:', r.status)
      if (!r.ok) return Promise.reject(r)
      return r
    })
    .then(r => r.text())
    .then(body => {
      const ad = parseAd(body)
      ad.id = rec.id
      ad.slug = rec.slug

      discoverImages(ad).then((ad) => {
        sql.updateAd(ad)
        resolve(ad)
      })
    })
    .catch((e) => {
      console.error(e)
      reject(e)
    })
  })
  return p
}

export const scrape = () => {
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
