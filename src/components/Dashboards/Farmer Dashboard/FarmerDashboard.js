import React from 'react'
import './FarmerDashboard.css'
import FarmerSidebar from './FarmerSidebar'
import MainContent from './MainContent'

const FarmerDashboard = () => {
  return (
    <>
        <div className='FarmerDashboard'>
            <FarmerSidebar/>
            <MainContent/>
        </div>
    </>
  )
}

export default FarmerDashboard