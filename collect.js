const fetch = require('node-fetch')
const fs = require('fs')
const Promise = require('bluebird')
const mkdirp = require('mkdirp')
const hash = require('./utils').hash

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
        if (fs.existsSync(dir+'/'+hash(url)+'.jpg')) {
          console.log(dir+'/'+hash(url)+'.jpg exists')
          return resolve()
        }
        downloadFile(url, dir+'/'+hash(url)+'.jpg').then(() => {
          console.log(hash(url)+'.jpg done')
          resolve()
        })
      }, 0)
    })
  }).then(() => console.log('all done'))
})
