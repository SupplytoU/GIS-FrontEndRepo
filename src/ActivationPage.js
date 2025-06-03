// ActivationPage.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function ActivationPage() {
  const { uidb64, token } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('Activating your account...');

  useEffect(() => {
    const activateUser = async () => {
      try {
        const response = await fetch(`https://gis-backend-1c87.onrender.com//api/users/activation/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ uid: uidb64, token: token })
        });

        if (response.ok) {
          setMessage('Account activated successfully!');
          setTimeout(() => navigate('/login'), 2000); // Redirect to login after 2 seconds
        } else {
          setMessage('Activation failed. Please try again or contact support.');
        }
      } catch (error) {
        setMessage('An error occurred. Please check your internet connection or try again later.');
        console.error('Error activating user:', error);
      }
    };

    activateUser();
  }, [uidb64, token, navigate]);

  return (
    <div>
      <h2>{message}</h2>
    </div>
  );
}

export default ActivationPage;
