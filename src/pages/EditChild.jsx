import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import './EditChild.css'; // Updated to use a page-specific CSS file

function EditChild() {
  const { childId } = useParams(); // Get childId from the URL
  const location = useLocation();
  const navigate = useNavigate();
  const { household_id } = location.state || {}; // Get household_id from state
  const [firstName, setFirstName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Fetch the child's current details
    fetch(`http://localhost:3000/children/${childId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch child details');
        }
        return response.json();
      })
      .then((data) => {
        setFirstName(data.first_name);
        setBirthDate(data.birth_date);
      })
      .catch((err) => setError(err.message));
  }, [childId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!firstName || !birthDate) {
      setError('All fields are required.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/children/${childId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: firstName,
          birth_date: birthDate,
        }),
      });

      if (response.ok) {
        setSuccess('Child updated successfully!');
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update child.');
      }
    } catch (err) {
      setError('Failed to connect to the server.');
    }
  };

  return (
    <div className="edit-child-container">
      <header className="edit-child-header">
        <h1>Edit Child</h1>
        <p>Update the details of the child below.</p>
      </header>

      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      <form onSubmit={handleSubmit} className="edit-child-form">
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
        <button type="submit" className="submit-button">Update Child</button>
      </form>

      <footer className="edit-child-footer">
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

export default EditChild;