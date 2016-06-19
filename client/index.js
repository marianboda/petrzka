import React from 'react'
import DOM from 'react-dom'
import { nogo, maybego } from '../config'

const containerStyles = { display: 'flex', width: '100%', height: '100%' }
const adListStyles = { flex: '1 1 300px' }
const adDetailStyles = { flex: '1 1 300px' }
const adRowStyles = { cursor: 'pointer' }
const isNumeric = (n) => !isNaN(parseFloat(n)) && isFinite(n)

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

    const detailPane = (!selectedAd) ? null : (<div style={adDetailStyles}>
      <h2>{selectedAd.title}</h2>
      <a href={selectedAd.link} target="_blank">[LINK]</a>
    </div>)



    return (<div style={containerStyles}>
      <div style={adListStyles}>
        <table>
          {ads.map(i => {
            const price = i.price +
              (isNumeric(i.price_energy) && i.price_energy >= 0 ? i.price_energy : 0)
            return (<tr style={adRowStyles} key={i.id} onClick={((id) => () => this.clickHandler(id))(i.id)}>
              <td>{i.id}</td>
              <td>{i.location}</td>
              <td>{i.title}</td>
              <td>{price}</td>
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
