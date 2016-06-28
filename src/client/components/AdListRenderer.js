import React from 'react'
import DOM from 'react-dom'
import moment from 'moment'

const defStyle = { cursor: 'pointer', padding: '5', position: 'relative', borderBottom: '1px solid #8AC',
  minHeight: 50}
const locationStyle = {position: 'absolute', right: 10, top: 10, fontSize: 15}
const daysOldStyle = {position: 'absolute', right: 10, bottom: 10, color: '#369', paddingLeft: 20}

export default React.createClass({
  render() {
    const { data, selected, onClick } = this.props
    let style = { ...defStyle }
    let days = moment().diff(moment(data.time_added, 'YYYY-MM-DD HH:mm:ss'), 'days')
    if (days == 0) {
      days = 'today'
    } else if (days == 1) {
      days = '1 day ago'
    } else {
      days = days + ' days ago'
    }

    if (!selected && data.time_deleted > '2015') {
      style.backgroundColor = '#FFCCCC'
    } else if (!selected) {
      style.backgroundColor = '#DDD'
    } else {
       style.backgroundColor = (data.time_deleted > '2015') ? '#FF9999' : '#AACCFF'
    }

    return (<div style={style} key={data.id} onClick={((id) => () => onClick(id))(data.id)}>
      <div style={{marginRight: 60}}>{data.title}</div>
      <span>{data.location}</span>
      <span style={daysOldStyle}>{days}</span>
      <span style={locationStyle}>{data.price + data.price_energy}</span>
    </div>)
  }
})
