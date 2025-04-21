import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ParentManagement.css'; // Updated to use a page-specific CSS file

function ParentManagement() {
  const location = useLocation();
  const navigate = useNavigate();
  const { household_id } = location.state || {}; // Get household_id from state

  return (
    <div className="parent-management-container">
      <header className="parent-management-header">
        <h1>Parent Management</h1>
        <p>Manage your household's children, chores, assignments, and prizes.</p>
      </header>

      <div className="section">
        <h2>Children</h2>
        <button
          onClick={() => navigate('/manage-children', { state: { household_id } })}
          className="action-button"
        >
          Add/Edit/Delete Children
        </button>
      </div>

      <div className="section">
        <h2>Chores</h2>
        <button
          onClick={() => navigate('/manage-chores', { state: { household_id } })}
          className="action-button"
        >
          Add/Edit/Delete Chores
        </button>
      </div>

      <div className="section">
        <h2>Chore Assignments</h2>
        <button
          onClick={() => navigate('/manage-chore-assignments', { state: { household_id } })}
          className="action-button"
        >
          Add/Edit/Delete Chore Assignments
        </button>
      </div>

      <div className="section">
        <h2>Prizes</h2>
        <button
          onClick={() => navigate('/manage-prizes', { state: { household_id } })}
          className="action-button"
        >
          Add/Edit/Delete Prizes
        </button>
      </div>

      <footer className="parent-management-footer">
        <button
          onClick={() => navigate('/home', { state: { household_id } })}
          className="back-button"
        >
          Back to Home
        </button>
      </footer>
    </div>
  );
}

export default ParentManagement;