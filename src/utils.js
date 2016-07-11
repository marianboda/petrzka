import crypto from 'crypto'
import moment from 'moment'

export const hash = (str) => {
  const sha = crypto.createHash('sha256')
  sha.update(str)
  return sha.digest('hex').substring(0,16)
}

export const isIterable = object =>
  object != null && typeof object[Symbol.iterator] === 'function'

export const timestamp = (time) => moment(time).format('YYYY-MM-DD HH:mm:ss')
