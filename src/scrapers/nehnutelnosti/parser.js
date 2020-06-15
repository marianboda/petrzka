import cheerio from 'cheerio'

const getSlug = url => url
  .replace('https://www.nehnutelnosti.sk/', '')
  .replace(/^[0-9]+/, '')
  .replace(/\//g, '')

export const parseList = (body) => {
  const $ = cheerio.load(body)
  const a = $('.advertisement-item')
  const list = a.map((i, el) => {
    const id = el.attribs.id
    const titleEl = $(el).find('h2 a')[0]
    const link = titleEl.attribs.href
    const title = $(titleEl).text()
    const slug = getSlug(link)
    return { id, title, link, slug }
  })
  return list.toArray()
}

export const parseGallery = (body) => {
  const $ = cheerio.load(body)
  const dataJson = $('#advertisement-gallery-wrapper div[data-gallery-photos]').attr('data-gallery-photos')
  return JSON.parse(dataJson)
}

export const parseAd = (body) => {
  const $ = cheerio.load(body)
  const price = $('.price--info .price--main').text().replace('\r\n', '').replace('\r\n', '')
    .replace(/ /g, '').replace(/[^0-9]/g, '')
  let energy = $('.energy').text()
  if (energy === 'Zahrnuté v cene')
    energy = 0
  else if (energy === 'Neuvedené')
    energy = -1
  else
    energy = Number(energy.replace(/[^0-9]/g, ''))

  const street = $('.top--info-location').text().replace(/\s+/g, ' ').replace(', okres Žilina', '').trim()

  const condition = $('.parameter--info div:contains("Stav") strong').text()
  let area = $('.parameter--info div:contains("Úžit. plocha") strong').text().replace(' m2', '')
  area = (area === '') ? 0 : Number(area)
  const description = $('.text-inner').text().trim()
  const agency = $('.agency-name').attr('title')
  const agent = $('.broker-name').text().trim()
  const image = $('#photo-gallery-preview > data-src').attr('srcset')
  const galleryUrl = $('picture[data-gallery-url]').attr('data-gallery-url')

  const images = [image]

  return {
    price,
    price_energy:
    energy,
    location:
    street,
    images,
    condition,
    area,
    description,
    agency,
    agent,
    galleryUrl,
    type: '3bdr-apartment'
  }
}
