import React from 'react'
import DOM from 'react-dom'
import { nogo, maybego } from '../config'
import { hash } from '../utils'

const containerStyles = { display: 'flex', width: '100%', height: '100%' }
const adListStyles = { flex: '1 1 300px' }
const adDetailStyles = { flex: '1 1 300px' }
const adRowStyles = { cursor: 'pointer' }

const App = React.createClass({
  getInitialState() {
    return { ads: [], selectedId: 'i2477748' }
  },
  componentWillMount() {
    const ads = fetch('/api/ads')
    .then(r => r.json())
    .then(r => {
      this.setState({ ads: r })
    })
  },
  clickHandler(id) {
    this.setState({ selectedId: id })
  },
  render() {
    const ads = this.state.ads

    console.log((ads.filter(i => i.id !== this.state.selectedId)).length)
    const selectedAd = (ads.filter(i => i.id === this.state.selectedId))[0]

    let images = []
    let detailPane = null
    if (selectedAd) {
      const images = selectedAd.images.split(' ')
      detailPane = (!selectedAd) ? null : (<div style={adDetailStyles}>
        <h2><a href={selectedAd.link} target="_blank">{selectedAd.title}</a></h2>
        <div>
          { images.map(i => {
            const src = `img/${selectedAd.id}/${hash(i)}.jpg`
            return (<img height="150px" src={src} />)
          }) }
        </div>
      </div>)
    }

    return (<div style={containerStyles}>
      <div style={adListStyles}>
        <table>
          {ads.map(i => {
            let style = (i.id === this.state.selectedId) ? {...adRowStyles, backgroundColor: '#DDEEFF'} : adRowStyles
            return (<tr style={style} key={i.id} onClick={((id) => () => this.clickHandler(id))(i.id)}>
              <td>{i.id}</td>
              <td>{i.location}</td>
              <td>{i.title}</td>
              <td>{i.price + i.price_energy}</td>
            </tr>)
          })
          }
        </table>
      </div>
      {detailPane}
    </div>)
  }
})

DOM.render(<App />, document.getElementById('content'))
