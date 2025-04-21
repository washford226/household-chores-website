import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ManagePrizes.css'; // Updated to use a page-specific CSS file

function ManagePrizes() {
  const location = useLocation();
  const navigate = useNavigate();
  const { household_id } = location.state || {}; // Get household_id from state
  const [prizes, setPrizes] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch all prizes for the household
    fetch(`http://localhost:3000/prizes?household_id=${household_id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch prizes');
        }
        return response.json();
      })
      .then((data) => setPrizes(data))
      .catch((err) => setError(err.message));
  }, [household_id]);

  const handleAddPrize = () => {
    navigate('/add-prize', { state: { household_id } });
  };

  const handleEditPrize = (prizeId) => {
    navigate(`/edit-prize/${prizeId}`, { state: { household_id } });
  };

  const handleDeletePrize = (prizeId) => {
    fetch(`http://localhost:3000/prizes/${prizeId}`, { method: 'DELETE' })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to delete prize');
        }
        setPrizes(prizes.filter((prize) => prize.id !== prizeId));
      })
      .catch((err) => setError(err.message));
  };

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <div className="manage-prizes-container">
      <div className="left-section">
        <header className="manage-prizes-header">
          <h1>Manage Prizes</h1>
          <p><strong>Household ID:</strong> {household_id}</p>
        </header>

        <div className="actions">
          <button
            onClick={() => navigate('/parent-management', { state: { household_id } })}
            className="back-button"
          >
            Back to Parent Management
          </button>
          <button onClick={handleAddPrize} className="add-button">
            Add Prize
          </button>
        </div>
      </div>

      <div className="right-section">
        <div className="table-container">
          {prizes.length === 0 ? (
            <p>No prizes found.</p>
          ) : (
            <table className="prizes-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Points Required</th>
                  <th>Points Acquired</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {prizes.map((prize) => (
                  <tr key={prize.id}>
                    <td>{prize.name}</td>
                    <td>{prize.points_required}</td>
                    <td>{prize.points_awarded}</td>
                    <td>
                      <button
                        onClick={() => handleEditPrize(prize.id)}
                        className="edit-button"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeletePrize(prize.id)}
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

export default ManagePrizes;