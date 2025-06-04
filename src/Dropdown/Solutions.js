import React, { useState } from 'react';
import './Solutions.css'; 
import { FaChevronDown } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Solutions  = () => {
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const handleMouseEnter = () => {
    setDropdownVisible(true);
  };

  const handleMouseLeave = () => {
    setDropdownVisible(false);
  };

  return (
    <nav className="Solutionsbody">
      <ul className="menu">
        <li 
          className="menu-item" 
          onMouseEnter={handleMouseEnter} 
          onMouseLeave={handleMouseLeave}
        >
          <div className='SolutionsTitle'>Our Solutions</div>
          <span className="solution-arrow"><FaChevronDown/></span>
          {dropdownVisible && (
            <ul className="dropdown">
              <Link to='/truck-tracking'><li className="dropdown-item">Track An Order</li></Link>
              <Link to='/View Locations'><li className="dropdown-item">View Locations</li></Link>
              <Link to=''><li className="dropdown-item">View Analytics</li></Link>
            </ul>
          )}
        </li>
      </ul>
    </nav>
  );
};

export default Solutions;
