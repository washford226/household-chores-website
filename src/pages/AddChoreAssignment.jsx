import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './AddChoreAssignment.css'; // Updated to use a page-specific CSS file

function AddChoreAssignment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { household_id } = location.state || {}; // Get household_id from state
  const [children, setChildren] = useState([]);
  const [chores, setChores] = useState([]);
  const [childId, setChildId] = useState('');
  const [choreId, setChoreId] = useState('');
  const [assignedDate, setAssignedDate] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Fetch children and chores for the household
    fetch(`http://localhost:3000/children?household_id=${household_id}`)
      .then((response) => response.json())
      .then((data) => setChildren(data))
      .catch(() => setError('Failed to fetch children.'));

    fetch(`http://localhost:3000/chores?household_id=${household_id}`)
      .then((response) => response.json())
      .then((data) => setChores(data))
      .catch(() => setError('Failed to fetch chores.'));
  }, [household_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!childId || !choreId || !assignedDate) {
      setError('All fields are required.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/chore-assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          child_id: childId,
          chore_id: choreId,
          assigned_date: assignedDate,
        }),
      });

      if (response.ok) {
        setSuccess('Chore assignment added successfully!');
        setChildId('');
        setChoreId('');
        setAssignedDate('');
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to add chore assignment.');
      }
    } catch {
      setError('Failed to connect to the server.');
    }
  };

  return (
    <div className="add-chore-assignment-container">
      <header className="add-chore-assignment-header">
        <h1>Add Chore Assignment</h1>
        <p>Assign a chore to a child in your household.</p>
      </header>

      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      <form onSubmit={handleSubmit} className="add-chore-assignment-form">
        <div className="form-group">
          <label htmlFor="child">Child:</label>
          <select
            id="child"
            value={childId}
            onChange={(e) => setChildId(e.target.value)}
            required
          >
            <option value="">Select a child</option>
            {children.map((child) => (
              <option key={child.id} value={child.id}>
                {child.first_name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="chore">Chore:</label>
          <select
            id="chore"
            value={choreId}
            onChange={(e) => setChoreId(e.target.value)}
            required
          >
            <option value="">Select a chore</option>
            {chores.map((chore) => (
              <option key={chore.id} value={chore.id}>
                {chore.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="assignedDate">Assigned Date:</label>
          <input
            type="date"
            id="assignedDate"
            value={assignedDate}
            onChange={(e) => setAssignedDate(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="submit-button">Add Assignment</button>
      </form>

      <footer className="add-chore-assignment-footer">
        <button
          onClick={() => navigate('/manage-chore-assignments', { state: { household_id } })}
          className="back-button"
        >
          Back to Manage Chore Assignments
        </button>
      </footer>
    </div>
  );
}

export default AddChoreAssignment;