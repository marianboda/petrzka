const fetch = require('node-fetch')
const fs = require('fs')
const Promise = require('bluebird')
const crypto = require('crypto')
const mkdirp = require('mkdirp')

const hash = (str) => {
  const sha = crypto.createHash('sha256')
  sha.update(str)
  return sha.digest('hex').substring(0,16)
}

const downloadFile = (url, path) => {
  return fetch(url)
  .then(r => {
    r.body.pipe(fs.createWriteStream(path))
  })
  .catch(e => console.error(e))
}

// module.exports = downloadFile

const sql = require('./SqlService')

sql.getAds().then(ads => {
  const images = ads.map(i => (i.images) ? i.images.split(' ').map(j => i.id + ' ' + j) : [])
    .reduce((acc, el) => {
      return acc.concat(el)
    }, [])

  Promise.mapSeries(images, (item, index) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const id = item.split(' ')[0]
        const url = item.split(' ')[1]
        const dir = './static/img/' + id
        mkdirp(dir)
        downloadFile(url, dir+'/'+hash(url)+'.jpg').then(() => {
          console.log(hash(url)+'.jpg done')
          resolve()
        })
      }, 5000)
    })
  }).then(() => console.log('all done'))
})
