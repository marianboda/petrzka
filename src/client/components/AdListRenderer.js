import React from 'react'
import DOM from 'react-dom'

const defStyle = { cursor: 'pointer', padding: '5', position: 'relative', borderBottom: '1px solid #8AC' }
const locationStyle = {position: 'absolute', right: 10, top: 10, fontSize: 15}

export default function({ data, selected, onClick }) {
  let style = (selected) ? {...defStyle, backgroundColor: '#AACCFF'} : defStyle
  return (<div style={style} key={data.id} onClick={((id) => () => onClick(id))(data.id)}>
    <div style={{marginRight: 60}}>{data.title}</div>
    <span>{data.location}</span>
    <span style={locationStyle}>{data.price + data.price_energy}</span>
  </div>)
}
