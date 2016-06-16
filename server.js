const express = require('express')
const app = express()
const sql = require('./SqlService')

app.get('/', (req, res) => {
  sql.getAds().then((r) => {
    console.log('its going to be there')
    res.status(200).send(r.map(i => {
      return `<a href="${i.link}">${i.id} ${i.title}</a>`
    }).join('<br>'))
  })
})

app.listen(3000, () => {
  console.log('listening on 3000')
})
