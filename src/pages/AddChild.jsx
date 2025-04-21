import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './AddChild.css'; // Updated to use a page-specific CSS file

function AddChild() {
  const location = useLocation();
  const navigate = useNavigate();
  const { household_id } = location.state || {}; // Get household_id from state
  const [firstName, setFirstName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!firstName || !birthDate) {
      setError('All fields are required.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/child', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: firstName,
          birth_date: birthDate,
          household_id,
        }),
      });

      if (response.ok) {
        setSuccess('Child added successfully!');
        setFirstName('');
        setBirthDate('');
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to add child.');
      }
    } catch (err) {
      setError('Failed to connect to the server.');
    }
  };

  return (
    <div className="add-child-container">
      <header className="add-child-header">
        <h1>Add Child</h1>
        <p>Fill out the form below to add a new child to your household.</p>
      </header>

      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      <form onSubmit={handleSubmit} className="add-child-form">
        <div className="form-group">
          <label htmlFor="firstName">First Name:</label>
          <input
            type="text"
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="birthDate">Birth Date:</label>
          <input
            type="date"
            id="birthDate"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="submit-button">Add Child</button>
      </form>

      <footer className="add-child-footer">
        <button
          onClick={() => navigate('/manage-children', { state: { household_id } })}
          className="back-button"
        >
          Back to Manage Children
        </button>
      </footer>
    </div>
  );
}

export default AddChild;