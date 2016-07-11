const crypto = require('crypto')
const moment = require('moment')

const hash = (str) => {
  const sha = crypto.createHash('sha256')
  sha.update(str)
  return sha.digest('hex').substring(0,16)
}

const isIterable = object =>
  object != null && typeof object[Symbol.iterator] === 'function'

const timestamp = (time) => moment(time).format('YYYY-MM-DD HH:mm:ss')

module.exports = { hash, isIterable, timestamp }
