import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ManageChores.css'; // Updated to use a page-specific CSS file

function ManageChores() {
  const location = useLocation();
  const navigate = useNavigate();
  const { household_id } = location.state || {}; // Get household_id from state
  const [chores, setChores] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch all chores for the household
    fetch(`http://localhost:3000/chores?household_id=${household_id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch chores');
        }
        return response.json();
      })
      .then((data) => setChores(data))
      .catch((err) => setError(err.message));
  }, [household_id]);

  const handleAddChore = () => {
    navigate('/add-chore', { state: { household_id } });
  };

  const handleEditChore = (choreId) => {
    navigate(`/edit-chore/${choreId}`, { state: { household_id } });
  };

  const handleDeleteChore = (choreId) => {
    fetch(`http://localhost:3000/chores/${choreId}`, { method: 'DELETE' })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to delete chore');
        }
        setChores(chores.filter((chore) => chore.id !== choreId));
      })
      .catch((err) => setError(err.message));
  };

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <div className="manage-chores-container">
      <div className="left-section">
        <header className="manage-chores-header">
          <h1>Manage Chores</h1>
          <p><strong>Household ID:</strong> {household_id}</p>
        </header>

        <div className="actions">
          <button
            onClick={() => navigate('/parent-management', { state: { household_id } })}
            className="back-button"
          >
            Back to Parent Management
          </button>
          <button onClick={handleAddChore} className="add-button">
            Add Chore
          </button>
        </div>
      </div>

      <div className="right-section">
        <div className="table-container">
          {chores.length === 0 ? (
            <p>No chores found.</p>
          ) : (
            <table className="chores-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Frequency</th>
                  <th>Points</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {chores.map((chore) => (
                  <tr key={chore.id}>
                    <td>{chore.name}</td>
                    <td>{chore.description}</td>
                    <td>{chore.frequency}</td>
                    <td>{chore.points}</td>
                    <td>
                      <button
                        onClick={() => handleEditChore(chore.id)}
                        className="edit-button"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteChore(chore.id)}
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

export default ManageChores;