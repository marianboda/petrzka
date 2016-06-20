const Promise = require('bluebird')
const SQL = require('sqlite3')
const moment = require('moment')
const db = new SQL.Database('./db.sqlite')
const run = Promise.promisify(db.run, { context: db })
const all = Promise.promisify(db.all, { context: db })

const SQLService = {
  addAd: (rec) => {
    const prep = 'INSERT INTO ad (id, title, link, time_added) VALUES (?,?,?,?)'
    return run(prep, [rec.id, rec.title, rec.link, moment().format('YYYY-MM-DD HH:mm:ss')])
  },

  addAds: (recs) => {
    recs.forEach(i => {
      SQLService.addAd(i).catch(e => {
        if (e.code !== 'SQLITE_CONSTRAINT')
          console.error(e)
      })
    })
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
}

module.exports = SQLService
