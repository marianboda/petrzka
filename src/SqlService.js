import Promise from 'bluebird'
import SQL from 'sqlite3'
import moment from 'moment'
import { isIterable } from './utils'

const db = new SQL.Database('./db.sqlite')
const run = Promise.promisify(db.run, { context: db })
const all = Promise.promisify(db.all, { context: db })

const SQLService = {
  addOne: (rec) => {
    const keys = Object.keys(rec)
    const vals = keys.map(i => rec[i])
    const prep = `INSERT INTO ad (${keys.join(', ')}) VALUES (${Array(keys.length).fill('?').join(', ')})`
    return run(prep, vals)
  },

  add: (records) => {
    const recs = isIterable ? records : [records]
    const fn = i => SQLService.addOne(i).catch(e => {
      if (e.code !== 'SQLITE_CONSTRAINT')
        console.error(e)
      return 0
    })
    return Promise.mapSeries(recs, fn)
  },

  updateAd: (rec) => {
    const keys = Object.keys(rec)
      .filter(i => i !== 'id')
    const keyTemplates = keys
      .map(i => `${i}=?`)
      .join(', ')
    const vals = keys.map(i => rec[i])
    const query = `UPDATE ad SET ${keyTemplates} WHERE id="${rec.id}"`
    return run(query, vals)
  },

  getAds: () => {
    return all('SELECT * FROM ad ORDER BY id DESC')
  },

  getLiveAds: () => {
    return all('SELECT * FROM ad ORDER BY id DESC')
  },
}

export default SQLService
