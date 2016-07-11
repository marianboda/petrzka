import fetch from 'node-fetch'
import fs from 'fs'
import Promise from 'bluebird'
import mkdirp from 'mkdirp'
import { hash } from '../utils'
import sql from '../SqlService'

const downloadFile = (url, path) => {
  return fetch(url)
  .then(r => {
    r.body.pipe(fs.createWriteStream(path))
  })
  .catch(e => console.error(e))
}

export const collect = () => {
  return sql.getAds().then(ads => {
    const images = ads.map(i => (i.images) ? i.images.split(' ').map(j => i.id + ' ' + j) : [])
      .reduce((acc, el) => {
        return acc.concat(el)
      }, [])
    return Promise.mapSeries(images, (item, index) => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const id = item.split(' ')[0]
          const url = item.split(' ')[1]
          const dir = './static/img/' + id
          mkdirp(dir)
          if (fs.existsSync(dir+'/'+hash(url)+'.jpg')) {
            // console.log(dir+'/'+hash(url)+'.jpg exists')
            return resolve()
          }
          downloadFile(url, dir+'/'+hash(url)+'.jpg').then(() => {
            console.log(hash(url)+'.jpg done')
            resolve()
          })
        }, 0)
      })
    })
  })
}
