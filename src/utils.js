const crypto = require('crypto')

const hash = (str) => {
  const sha = crypto.createHash('sha256')
  sha.update(str)
  return sha.digest('hex').substring(0,16)
}

module.exports = { hash }
