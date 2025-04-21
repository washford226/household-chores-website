import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import './EditPrize.css'; // Updated to use a page-specific CSS file

function EditPrize() {
  const { prizeId } = useParams(); // Get prizeId from the URL
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
    // Fetch the prize's current details
    fetch(`http://localhost:3000/prizes/${prizeId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch prize details');
        }
        return response.json();
      })
      .then((data) => {
        setName(data.name);
        setPointsRequired(data.points_required);
        setChildId(data.child_id || ''); // Set childId to the current assignment or empty for household
      })
      .catch((err) => setError(err.message));

    // Fetch children for the household
    fetch(`http://localhost:3000/children?household_id=${household_id}`)
      .then((response) => response.json())
      .then((data) => setChildren(data))
      .catch(() => setError('Failed to fetch children.'));
  }, [prizeId, household_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !pointsRequired) {
      setError('All fields are required.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/prizes/${prizeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          points_required: parseInt(pointsRequired, 10),
          child_id: childId || null, // Assign to child or household
        }),
      });

      if (response.ok) {
        setSuccess('Prize updated successfully!');
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update prize.');
      }
    } catch {
      setError('Failed to connect to the server.');
    }
  };

  return (
    <div className="edit-prize-container">
      <header className="edit-prize-header">
        <h1>Edit Prize</h1>
        <p>Update the details of the prize below.</p>
      </header>

      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      <form onSubmit={handleSubmit} className="edit-prize-form">
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
        <button type="submit" className="submit-button">Update Prize</button>
      </form>

      <footer className="edit-prize-footer">
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

export default EditPrize;