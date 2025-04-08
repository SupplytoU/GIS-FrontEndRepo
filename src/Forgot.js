import React, { useState, useRef, useEffect } from 'react';
import './Forgot.css';
import image from './Images/Forgot password-pana.png';

const Forgot = () => {
  const emailReference = useRef(null);

  const [ResetEmail, setResetEmail] = useState('');
  const [ResetError, setResetError] = useState('');
  const [ResetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    if (emailReference.current) {
      emailReference.current.focus();
    }
  }, []);

  useEffect(() => {
    setResetError('');
  }, [ResetEmail]);

  const isValidEmail = (email) => {
    // Regular expression for basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    if (!isValidEmail(ResetEmail)) {
      setResetError('Please enter a valid email address.');
      return;
    }
    console.log(ResetEmail);
    setResetSuccess(true);
    setResetEmail('');
  };

  return (
    <>
      <div className="Forgotdiv">
        <div className="Forgotdiv-2">
          <img loading="lazy" src={image} className="ForgotImg" alt='Image'/>
          <div className="ForgotPassword">
            FORGOT <br /> PASSWORD?
          </div>
          
            <div className="Details">
              Enter the email associated with your account and we'll send an
              email with instructions to reset your password.
            </div>
            <div className="Content">
            {!ResetSuccess ? (
              <section>
                <form onSubmit={handleResetSubmit}>
                  <div className="ResetEmail">
                    <input
                      type="ResetEmail"
                      id="ResetEmail"
                      name="ResetEmail"
                      placeholder="Email Address"
                      value={ResetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      ref={emailReference}
                      required
                    />
                  </div>
                  {ResetError && <div className="Error">{ResetError}</div>}
                  <button type="submit" className="ResetButton">Reset Password</button>
                </form>
              </section>
            ) : (
              <div className="Success">Reset instructions have been <br/>sent to your email.</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Forgot;
