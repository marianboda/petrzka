const express = require('express')
const app = express()
const _ = require('lodash')
const sql = require('./SqlService')
const config = require('./config')


app.get('/', (req, res) => {
  sql.getAds().then((r) => {
    res.status(200).send(r
      .filter(i => !_.includes(config.nogo, i.location))
      .map(i => {
        const maybe = _.includes(config.maybego, i.location)
        let col = (maybe) ? 'gray' : 'blue'
        if (i.price + i.price_energy > 780)
          col = 'red'
        return `<a style="color: ${col}" href="${i.link}">${i.id} ${i.title} '${i.location}'</a>`
      }).join('<br>'))
  })
})

app.use('/static', express.static(`${__dirname}/static`))

app.listen(3000, () => {
  console.log('listening on 3000')
})
