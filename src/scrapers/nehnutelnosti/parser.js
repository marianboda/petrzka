import cheerio from 'cheerio'
import { remove as removeDia } from 'diacritics'

export const parseList = (body) => {
  const $ = cheerio.load(body)
  const a = $('.advertisement-item')
  const list = a.map((i, el) => {
    const id = el.attribs.id
    const titleEl = $(el).find('h2 a')[0]
    const link = titleEl.attribs.href
    const title = $(titleEl).text()
    return { id, title, link }
  })
  return list.toArray()
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

  return { price, price_energy: energy, location: street, images,
    condition, area, description, agency, agent, type: '3bdr-apartment' }
}
