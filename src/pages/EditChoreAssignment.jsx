import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import './EditChoreAssignment.css'; // Updated to use a page-specific CSS file

function EditChoreAssignment() {
  const { assignmentId } = useParams(); // Get assignmentId from the URL
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
    // Fetch the current chore assignment details
    fetch(`http://localhost:3000/chore-assignments/${assignmentId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch chore assignment details');
        }
        return response.json();
      })
      .then((data) => {
        setChildId(data.child_id);
        setChoreId(data.chore_id);
        setAssignedDate(data.assigned_date);
      })
      .catch((err) => setError(err.message));

    // Fetch children and chores for the household
    fetch(`http://localhost:3000/children?household_id=${household_id}`)
      .then((response) => response.json())
      .then((data) => setChildren(data))
      .catch((err) => setError(err.message));

    fetch(`http://localhost:3000/chores?household_id=${household_id}`)
      .then((response) => response.json())
      .then((data) => setChores(data))
      .catch((err) => setError(err.message));
  }, [assignmentId, household_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!childId || !choreId || !assignedDate) {
      setError('All fields are required.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/chore-assignments/${assignmentId}`, {
        method: 'PUT',
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
        setSuccess('Chore assignment updated successfully!');
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update chore assignment.');
      }
    } catch (err) {
      setError('Failed to connect to the server.');
    }
  };

  return (
    <div className="edit-chore-assignment-container">
      <header className="edit-chore-assignment-header">
        <h1>Edit Chore Assignment</h1>
        <p>Update the details of the chore assignment below.</p>
      </header>

      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      <form onSubmit={handleSubmit} className="edit-chore-assignment-form">
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
        <button type="submit" className="submit-button">Update Assignment</button>
      </form>

      <footer className="edit-chore-assignment-footer">
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

export default EditChoreAssignment;