const Promise = require('bluebird')
const SQL = require('sqlite3')
const moment = require('moment')
const db = new SQL.Database('./db.sqlite')
const run = Promise.promisify(db.run, { context: db })
const all = Promise.promisify(db.all, { context: db })

const SQLService = {
  addAd: (rec) => {
    // console.log('should add', rec.id)
    const prep = 'INSERT INTO ad (id, title, link, time_added) VALUES (?,?,?,?)'
    return run(prep, [rec.id, rec.title, rec.link, moment().format('YYYY-MM-DD HH:mm:ss')])
  },

  getAds: () => {
    return all('SELECT * FROM ad')
  },
}

module.exports = SQLService
