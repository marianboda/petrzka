const fetch = require('node-fetch')
const cheerio = require('cheerio')
const Promise = require('bluebird')
const _ = require('lodash')
const removeDia = require('diacritics').remove
const async = require('async')
const sql = require('./SqlService')

let adsCount = 0
let ads = []
let newAds = []

const makeUrl = (page = 1) => {
  const url = 'http://www.nehnutelnosti.sk/bratislava-v-petrzalka/3-izbove-byty/prenajom'
  if (page === 1)
    return url
  return `${url}?p[page]=${page}`
}

const getPage = (page) => fetch(makeUrl(page))

const parseList = (body) => {
  const $ = cheerio.load(body)
  const a = $('.inzerat')
  const list = a.map((i, el) => {
    const id = el.attribs.id
    const titleEl = $(el).find('h2 a')[0]
    const link = titleEl.attribs.href
    const title = $(titleEl).text()
    return { id, title, link }
  })
  return list.toArray()
}

const getAll = () => {
  const worker = (task, cb) => {
    getPage(task.page).then(r => {
      return r.text()
    }).then(parseList)
    .then((r) => {
      r.forEach(i => {
        sql.addAd(i).then(() => { adsCount += 1 }).catch((e) => console.log('err', e))
      })
      if (r.length > 0) {
        q.push({ page: task.page + 1 })
      }
      cb(null, r)
    })
    .catch(err => {
      console.error('error', err)
      cb(err)
    })
  }
  const q = async.queue(worker)
  q.push({ page: 1 })
}

const parseAd = (body) => {
  const $ = cheerio.load(body)
  const price = $('#data-price').text().replace('\r\n', '').replace('\r\n', '')
    .replace(/ /g, '').replace(/[^0-9]/g, '')
  let energy = $('.energy').text()
  if (energy === 'Zahrnuté v cene')
    energy = 0
  else if (energy === 'Neuvedené')
    energy = -1
  else
    energy = Number(energy.replace(/[^0-9]/g, ''))

  const street = removeDia($('.street').text()).replace(/[,]?\s[0-9]+$/g, '').toLowerCase()
  const condition = removeDia($('span:contains("Stav")').next().text()).toLowerCase()
  let area = $('span:contains("Úžitková plocha")').next().text().replace(' m²', '')
  if (area === '')
    area = 0
  area = Number(area)
  return { price, energy, street, condition, area }
}

const scrapeAd = (rec) => {
  const p = new Promise((resolve, reject) => {
    console.log(rec.link)
    fetch(rec.link).then(r => r.text())
    .then(body => {
      const ad = parseAd(body)
      // console.log(ad)
      resolve(ad)
    })
    .catch(e => {
      console.error(e)
      reject(e)
    })
  })
  return p
}

const adScraper = (task, cb) => {
  scrapeAd(task).then((res) => {
    newAds.push(res)
    console.log(adQ.length())
    cb(null)

  }).catch(e => cb(e))
}

const adQ = async.queue(adScraper)
adQ.drain = () => {
  console.log('==============================================================')
  const conds = _.countBy(newAds, i => i.condition)
  console.log('Stavy:', conds)
  const streets = _.countBy(newAds, i => i.street)
  console.log('Ulice:', streets)
  const energies = _.countBy(newAds, i => i.energy)
  console.log('Energie:', energies)
  const areas = _.countBy(newAds, i => i.area)
  console.log('Energie:', areas)
}

sql.getAds().then(r => {
  ads = r
  return true
})
.then(r => {
  const unpAds = _.take(ads.filter(i => i.desc == null), 1)
  adQ.push(unpAds)
  console.log(unpAds.length, ads.length)
  // if (ads.length > 0) {
  //   scrapeAd(ads[0])
  // }
})


// getAll()
