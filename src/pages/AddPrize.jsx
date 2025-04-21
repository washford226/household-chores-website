import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './AddPrize.css'; // Updated to use a page-specific CSS file

function AddPrize() {
  const location = useLocation();
  const navigate = useNavigate();
  const { household_id } = location.state || {}; // Get household_id from state
  const [name, setName] = useState('');
  const [pointsRequired, setPointsRequired] = useState('');
  const [childId, setChildId] = useState(''); // State for child assignment
  const [children, setChildren] = useState([]); // List of children in the household
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Fetch children for the household
    fetch(`http://localhost:3000/children?household_id=${household_id}`)
      .then((response) => response.json())
      .then((data) => setChildren(data))
      .catch(() => setError('Failed to fetch children.'));
  }, [household_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !pointsRequired) {
      setError('All fields are required.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/prizes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          points_required: parseInt(pointsRequired, 10),
          household_id,
          child_id: childId || null, // Assign to child or household
        }),
      });

      if (response.ok) {
        setSuccess('Prize added successfully!');
        setName('');
        setPointsRequired('');
        setChildId('');
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to add prize.');
      }
    } catch {
      setError('Failed to connect to the server.');
    }
  };

  return (
    <div className="add-prize-container">
      <header className="add-prize-header">
        <h1>Add Prize</h1>
        <p>Fill out the form below to add a new prize to your household.</p>
      </header>

      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      <form onSubmit={handleSubmit} className="add-prize-form">
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="pointsRequired">Points Required:</label>
          <input
            type="number"
            id="pointsRequired"
            value={pointsRequired}
            onChange={(e) => setPointsRequired(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="child">Assign to:</label>
          <select
            id="child"
            value={childId}
            onChange={(e) => setChildId(e.target.value)}
          >
            <option value="">Whole Household</option>
            {children.map((child) => (
              <option key={child.id} value={child.id}>
                {child.first_name}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="submit-button">Add Prize</button>
      </form>

      <footer className="add-prize-footer">
        <button
          onClick={() => navigate('/manage-prizes', { state: { household_id } })}
          className="back-button"
        >
          Back to Manage Prizes
        </button>
      </footer>
    </div>
  );
}

export default AddPrize;