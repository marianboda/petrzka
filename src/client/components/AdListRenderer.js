import React from 'react'
import DOM from 'react-dom'

const defStyle = { cursor: 'pointer', padding: '5', position: 'relative' }
const locationStyle = {position: 'absolute', right: 10, top: 10, fontSize: 15}

export default function({ data, selected, onClick }) {
  let style = (selected) ? {...defStyle, backgroundColor: '#CCDDFF'} : defStyle
  return (<div style={style} key={data.id} onClick={((id) => () => onClick(id))(data.id)}>
    <div>{data.title}</div>
    <span>{data.location}</span>
    <span style={locationStyle}>{data.price + data.price_energy}</span>
  </div>)
}
