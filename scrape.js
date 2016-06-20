const fetch = require('node-fetch')
const cheerio = require('cheerio')
const Promise = require('bluebird')
const _ = require('lodash')
const removeDia = require('diacritics').remove
const async = require('async')
const sql = require('./SqlService')

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
    getPage(task.page)
      .then(r => r.text())
      .then(parseList)
      .then(r => {
        sql.addAds(r)
        if (r.length > 0)
          q.push({ page: task.page + 1 })
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

  const street = removeDia($('.street').text()).replace(/[,]?\s[0-9]+$/g, '').toLowerCase().trim()
  const condition = removeDia($('span:contains("Stav")').next().text()).toLowerCase()
  let area = $('span:contains("Úžitková plocha")').next().text().replace(' m²', '')
  area = (area === '') ? 0 : Number(area)
  const description = $('.popis').text().trim()
  const agency = $('.kontaktne-udaje a').first().text().trim()
  const agent = $('.brokerContacts > .bold').text().trim()
  const image = $('#galeryElementJS > a').first().attr('data-href')
  const otherImages = $('#male a').map((i, el) => el.attribs['data-href']).toArray()
  const images = [].concat(image, otherImages).join(' ')
  console.log(images)

  return { price, price_energy: energy, location: street, images,
    condition, area, description, agency, agent, type: '3bdr-apartment' }
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
  let newAds = []
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
  }
  sql.getAds()
    .then((ads) => {
      const unpAds = _.take(ads.filter(i => i.images == null), 100)
      // const unpAds = ads.filter(i => i.id === 'i2448859')
      adQ.push(unpAds)
      console.log(unpAds.length, '/',  ads.length)
      return null
    })
}

module.exports = { getAllDetails, getAll }
