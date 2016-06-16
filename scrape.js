const fetch = require('node-fetch')
const cheerio = require('cheerio')
const async = require('async')
const sql = require('./SqlService')

let adsCount = 0

const makeUrl = (page = 1) => {
  const url = 'http://www.nehnutelnosti.sk/bratislava-v-petrzalka/3-izbove-byty/prenajom'
  if (page === 1)
    return url
  return `${url}?p[page]=${page}`
}

const getPage = (page) => {
  return fetch(makeUrl(page))
}

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

getAll()
