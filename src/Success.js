import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import tickImg from './Images/Tick.jpeg';
import './Success.css';

function Success() {
  const navigate = useNavigate();
  const location = useLocation();
  const [ , setIsTokenPresent] = useState(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');

    if (token) {
      // Handle token verification logic here
      // For example, send a request to your backend to verify the token
      console.log(`Token: ${token}`);
      setIsTokenPresent(true);
      
      const timer = setTimeout(() => {
        navigate('/login');
      }, 5000); // 5-second delay to give the user time to read the message

      return () => clearTimeout(timer);
    } else {
      // If no token is present, redirect to the login page after a delay to show the message
      const timer = setTimeout(() => {
        navigate('/login');
      }, 5000); // 5-second delay to give the user time to read the message

      return () => clearTimeout(timer);
    }
  }, [navigate, location]);

  return (
    <div className="success-container">
      <img src={tickImg} alt="Tick" className="success-image" />
      <h1 className="success-heading">Check your email for the activation link!</h1>
      <p className="success-subheading">You will be redirected to login shortly...</p>
    </div>
  );
}

export default Success;
