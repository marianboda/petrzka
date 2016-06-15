const fetch = require('node-fetch')
const cheerio = require('cheerio')

let ads = []

const makeUrl = (page = 1) => {
  const url = 'http://www.nehnutelnosti.sk/bratislava-v-petrzalka/3-izbove-byty/prenajom'
  if (page == 1)
    return url
  return url + '?p[page]=' + page
}

const getPage = (page) => {
  return fetch(makeUrl(page))
}

const parseList = (body) => {
  $ = cheerio.load(body)
  const a = $('.inzerat')
  console.log(a.length)

  const list = a.map((i, el) => {
    const id = el.attribs['id']
    const titleEl = $(el).find('h2 a')[0]
    const link = titleEl.attribs['href']
    const title = $(titleEl).text()
    // console.log(id, link, title)
    return {id, title, link}
  })
  return list.toArray()
}

getPage(3).then(r => {
  return r.text()
}).then(parseList)
.then((r) => console.log(r))
.catch(err => {console.error(err)})
