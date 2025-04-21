import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ManageChildren.css'; // Updated to use a page-specific CSS file

function ManageChildren() {
  const location = useLocation();
  const navigate = useNavigate();
  const { household_id } = location.state || {}; // Get household_id from state
  const [children, setChildren] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch all children for the household
    fetch(`http://localhost:3000/children?household_id=${household_id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch children');
        }
        return response.json();
      })
      .then((data) => setChildren(data))
      .catch((err) => setError(err.message));
  }, [household_id]);

  const handleAddChild = () => {
    navigate('/add-child', { state: { household_id } });
  };

  const handleEditChild = (childId) => {
    // Navigate to a form for editing a child
    navigate(`/edit-child/${childId}`, { state: { household_id } });
  };

  const handleDeleteChild = (childId) => {
    // Delete a child
    fetch(`http://localhost:3000/children/${childId}`, { method: 'DELETE' })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to delete child');
        }
        setChildren(children.filter((child) => child.id !== childId));
      })
      .catch((err) => setError(err.message));
  };

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <div className="manage-children-container">
      <div className="left-section">
        <header className="manage-children-header">
          <h1>Manage Children</h1>
          <p><strong>Household ID:</strong> {household_id}</p>
        </header>

        <div className="actions">
          <button
            onClick={() => navigate('/parent-management', { state: { household_id } })}
            className="back-button"
          >
            Back to Parent Management
          </button>
          <button onClick={handleAddChild} className="add-button">
            Add Child
          </button>
        </div>
      </div>

      <div className="right-section">
        <div className="table-container">
          {children.length === 0 ? (
            <p>No children found.</p>
          ) : (
            <table className="children-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Birth Date</th>
                  <th>Points</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {children.map((child) => (
                  <tr key={child.id}>
                    <td>{child.first_name}</td>
                    <td>{child.birth_date}</td>
                    <td>{child.points}</td>
                    <td>
                      <button onClick={() => handleEditChild(child.id)} className="edit-button">
                        Edit
                      </button>
                      <button onClick={() => handleDeleteChild(child.id)} className="delete-button">
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

export default ManageChildren;