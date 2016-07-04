const getPageUrl = (options = {}, page = 1) => {
  const { location, property, type } = options
  let url = `http://www.nehnutelnosti.sk/${location}/${property}/${type}`
  url += (page !== 1) ? `?p[page]=${page}` : ''
  return {
    url,
    next: page + 1,
  }
}

module.exports = { getPageUrl }
