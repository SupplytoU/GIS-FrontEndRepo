import React from 'react';
import './LoginIcon.css'; 
import { Link } from 'react-router-dom';

const LoginIcon = () => {
  return (
    <nav className="Solutionsbody">
      <ul className="menu">
        <li className="menu-item">
          <Link to="/Login" className="login-link">Login</Link>
        </li>
      </ul>
    </nav>
  );
};

export default LoginIcon;
