import React from 'react'
import DOM from 'react-dom'
import { nogo, maybego } from '../config'

const App = React.createClass({
  getInitialState() {
    return { ads: [] }
  },
  componentWillMount() {
    const ads = fetch('/api/ads')
    .then(r => r.json())
    .then(r => {
      this.setState({ ads: r })
    })
  },
  render() {
    const ads = this.state.ads
    return (<div>
      {ads.map(i => <div key={i.id}>{i.title}</div>)}
    </div>)
  }
})

DOM.render(<App />, document.getElementById('content'))
