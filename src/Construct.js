import React from 'react'
import construct from './Images/soon.jpg'
import './Construct.css'

const Construct = () => {
  return (
    <>
    <div className='Construct'><img 
        src={construct}
        className='constimage'
        alt='Image'
    />
    <p>This page is still under construction. Stay tuned🙂 !</p> </div></>
  )
}

export default Construct