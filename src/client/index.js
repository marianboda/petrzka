import React from 'react'
import DOM from 'react-dom'
import { nogo, maybego } from '../config'
import { hash } from '../utils'
import AdListRenderer from './components/AdListRenderer'

const containerStyles = { display: 'flex', width: '100%', height: '100%', overflow: 'hidden' }
const adListStyles = { flex: '1 1 300px', height: '100%', overflow: 'auto' }
const adDetailStyles = { flex: '1 1 300px' }

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

    const adElements = ads.map(i => (<AdListRenderer
        data={i}
        onClick={((id) => () => this.clickHandler(id))(i.id)}
        selected={(i.id === this.state.selectedId)}
      />))

    return (<div style={containerStyles}>
      <div style={adListStyles}>
        {adElements}
      </div>
      {detailPane}
    </div>)
  }
})

DOM.render(<App />, document.getElementById('content'))
