import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ManageChoreAssignments.css'; // Updated to use a page-specific CSS file

function ManageChoreAssignments() {
  const location = useLocation();
  const navigate = useNavigate();
  const { household_id } = location.state || {}; // Get household_id from state
  const [assignments, setAssignments] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch all chore assignments for the household
    fetch(`http://localhost:3000/chore-assignments?household_id=${household_id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch chore assignments');
        }
        return response.json();
      })
      .then((data) => setAssignments(data))
      .catch((err) => setError(err.message));
  }, [household_id]);

  const handleAddAssignment = () => {
    navigate('/add-chore-assignment', { state: { household_id } });
  };

  const handleEditAssignment = (assignmentId) => {
    navigate(`/edit-chore-assignment/${assignmentId}`, { state: { household_id } });
  };

  const handleDeleteAssignment = (assignmentId) => {
    fetch(`http://localhost:3000/chore-assignments/${assignmentId}`, { method: 'DELETE' })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to delete chore assignment');
        }
        setAssignments(assignments.filter((assignment) => assignment.id !== assignmentId));
      })
      .catch((err) => setError(err.message));
  };

  return (
    <div className="manage-chore-assignments-container">
      <div className="left-section">
        <header className="manage-chore-assignments-header">
          <h1>Manage Chore Assignments</h1>
          <p>View, edit, or delete chore assignments for your household.</p>
        </header>

        {error && <p className="error-message">{error}</p>}

        <div className="actions">
          <button
            onClick={() => navigate('/parent-management', { state: { household_id } })}
            className="back-button"
          >
            Back to Parent Management
          </button>
          <button onClick={handleAddAssignment} className="add-button">
            Add Chore Assignment
          </button>
        </div>
      </div>

      <div className="right-section">
        <div className="table-container">
          {assignments.length === 0 ? (
            <p>No chore assignments found.</p>
          ) : (
            <table className="assignments-table">
              <thead>
                <tr>
                  <th>Child</th>
                  <th>Chore</th>
                  <th>Assigned Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment) => (
                  <tr key={assignment.id}>
                    <td>{assignment.child_name}</td>
                    <td>{assignment.chore_name}</td>
                    <td>{assignment.assigned_date}</td>
                    <td>
                      <button
                        onClick={() => handleEditAssignment(assignment.id)}
                        className="edit-button"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAssignment(assignment.id)}
                        className="delete-button"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default ManageChoreAssignments;