import express from 'express'
import sql from './SqlService'

const app = express()

app.get('/api/ads', (req, res) => {
  sql.getLiveAds().then((r) => {
    res.status(200).send(JSON.stringify(r))
  })
})

app.use('/', express.static(`${__dirname}/../static`))

app.listen(3000, () => {
  console.log('listening on :3000')
})
