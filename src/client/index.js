import React from 'react'
import DOM from 'react-dom'
import Mousetrap from 'mousetrap'
import { findIndex } from 'lodash'
import { nogo, maybego } from '../config'
import { hash } from '../utils'
import AdListRenderer from './components/AdListRenderer'

const containerStyles = { display: 'flex', width: '100%', height: '100%', overflow: 'hidden' }
const adListStyles = { flex: '0 0 300px', height: '100%', overflow: 'auto', backgroundColor: '#DDD' }
const adDetailStyles = { flex: '1 1 300px', height: '100%', overflow: 'auto', padding: 10 }

const App = React.createClass({
  getInitialState() {
    return { ads: [], selectedId: 'i2477748' }
  },
  componentWillUpdate(nextProps, nextState) {
    const node = this.refs.adList
    const listHeight = node.offsetHeight
    const ad = DOM.findDOMNode(this.refs[nextState.selectedId])
    if (ad) {
      const adTop = ad.getBoundingClientRect().top
      const adBottom = ad.getBoundingClientRect().bottom
      if (adTop < 0)
        node.scrollTop += adTop
      if (adBottom > listHeight)
        node.scrollTop += adBottom - listHeight
    }
  },
  componentWillMount() {
    Mousetrap.bind('up', (e) => {
      e.preventDefault(); console.log('UP')
      if (this.state.selectedId) {
        const index = findIndex(this.state.ads, { id: this.state.selectedId })
        if (index >= 1 && index < this.state.ads.length)
          this.setState({selectedId: this.state.ads[index - 1].id})
      }
    })
    Mousetrap.bind('down',  (e) => {
      e.preventDefault(); console.log('DOWN')
      if (this.state.selectedId) {
        const index = findIndex(this.state.ads, { id: this.state.selectedId })
        if (index >= 0 && index < this.state.ads.length - 1)
          this.setState({selectedId: this.state.ads[index + 1].id})
      }
    })

    const ads = fetch('/api/ads')
      .then(r => r.json())
      .then(r => {
        this.setState({ ads: r, selectedId: (r[0]) ? r[0].id : null})
      })
  },
  clickHandler(id) {
    this.setState({ selectedId: id })
  },
  onKeyDown(e) {
    console.log(e)
  },
  render() {
    const ads = this.state.ads
    const selectedAd = (ads.filter(i => i.id === this.state.selectedId))[0]

    let images = []
    let detailPane = null
    if (selectedAd) {
      const images = selectedAd.images.split(' ')
      detailPane = (!selectedAd) ? null : (<div style={adDetailStyles}>
        <h2><a href={selectedAd.link} target="_blank">{selectedAd.title}</a></h2>
        <div>{selectedAd.description}</div>
        <div >
          { images.map(i => {
            const src = `img/${selectedAd.id}/${hash(i)}.jpg`
            return (<img height="250px" src={src} />)
          }) }
        </div>
      </div>)
    }

    const adElements = ads.map(i => (<AdListRenderer
        ref={i.id}
        data={i}
        onClick={((id) => () => this.clickHandler(id))(i.id)}
        selected={(i.id === this.state.selectedId)}
      />))

    return (<div style={containerStyles}>
      <div ref="adList" style={adListStyles}>
        {adElements}
      </div>
      {detailPane}
    </div>)
  }
})

DOM.render(<App />, document.getElementById('content'))
