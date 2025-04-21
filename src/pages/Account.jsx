import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Account.css'; // Updated to use a page-specific CSS file

function Account() {
  const location = useLocation();
  const navigate = useNavigate();
  const { household_id } = location.state || {}; // Get household_id from state
  const [household, setHousehold] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (household_id) {
      // Fetch household details
      fetch(`http://localhost:3000/households/${household_id}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to fetch household details');
          }
          return response.json();
        })
        .then((data) => setHousehold(data))
        .catch((err) => setError(err.message));
    }
  }, [household_id]);

  const handleSignOut = () => {
    // Clear any session or authentication data here if needed
    navigate('/'); // Redirect to the login screen
  };

  const goToHome = () => {
    navigate('/home', { state: { household_id } }); // Redirect to the home page with household_id
  };

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  if (!household) {
    return <p className="loading-message">Loading account details...</p>;
  }

  return (
    <div className="account-container">
      <header className="account-header">
        <h1>Account Screen</h1>
        <p>Welcome to your account page!</p>
      </header>

      <section className="account-details">
        <p><strong>Family Name:</strong> {household.household_name}</p>
        <p><strong>Email:</strong> {household.email}</p>
      </section>

      <div className="account-actions">
        <button onClick={goToHome} className="action-button">Go to Home</button>
        <button onClick={handleSignOut} className="action-button sign-out-button">Sign Out</button>
      </div>
    </div>
  );
}

export default Account;