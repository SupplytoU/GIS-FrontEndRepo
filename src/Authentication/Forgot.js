import React, { useState, useRef, useEffect } from 'react';
import './Forgot.css';
import image from '../Images/Forgot password-pana.png';

const ForgotPassword = () => {
  const emailRef = useRef(null);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  useEffect(() => {
      setError('');
    }, [email]);

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    console.log(email);
    setSuccess(true);
    setEmail('');
  };

  return (
    <div className="forgot-container">
      <div className="forgot-content">
        <img 
          src={image} 
          className="forgot-image" 
          alt="Forgot Password Illustration" 
          loading="lazy"
        />
        
        <div className="forgot-form-container">
          <h1 className="forgot-title">FORGOT PASSWORD?</h1>
          
          <p className="forgot-instructions">
            Enter the email associated with your account and we'll send an email 
            with instructions to reset your password.
          </p>
          
          {!success ? (
            <form onSubmit={handleSubmit} className="forgot-form">
              <div className="form-group">
                <input
                  type="email"
                  id="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  ref={emailRef}
                  required
                />
              </div>
              
              {error && <div className="error-message">{error}</div>}
              
              <button type="submit" className="reset-button">
                Reset Password
              </button>
            </form>
          ) : (
            <div className="success-message">
              Reset instructions have been sent to your email.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;