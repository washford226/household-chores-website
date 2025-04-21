import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Home.css'; // Updated to use a page-specific CSS file

function Home() {
  const location = useLocation();
  const navigate = useNavigate();
  const { household_id } = location.state || {}; // Get household_id from state
  const [assignments, setAssignments] = useState([]); // State for today's assignments
  const [error, setError] = useState('');

  useEffect(() => {
    if (household_id) {
      // Fetch today's chore assignments using the new endpoint
      fetch(`http://localhost:3000/chores/today?household_id=${household_id}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to fetch today`s chores');
          }
          return response.json();
        })
        .then((data) => setAssignments(data))
        .catch((err) => setError(err.message));
    }
  }, [household_id]);

  const handleCompleteAssignment = (assignmentId) => {
    fetch(`http://localhost:3000/chore-assignments/${assignmentId}/complete`, { method: 'PUT' })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to mark assignment as completed');
        }
        setAssignments(assignments.filter((assignment) => assignment.assignment_id !== assignmentId)); // Remove completed assignment
      })
      .catch((err) => setError(err.message));
  };

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <div className="home-container">
      <div className="left-section">
        <header className="home-header">
          <h1>Welcome to the Household Chores Website</h1>
        </header>

        <div className="action-buttons">
          <button onClick={() => navigate('/account', { state: { household_id } })} className="action-button">
            Go to Account
          </button>
          <button onClick={() => navigate('/parent-management', { state: { household_id } })} className="action-button">
            Parent Management
          </button>
        </div>
      </div>

      <div className="right-section">
        <section className="chore-assignments">
          <h2>Today's Chore Assignments</h2>
          {assignments.length === 0 ? (
            <p>No chores assigned for today.</p>
          ) : (
            <table className="assignments-table">
              <thead>
                <tr>
                  <th>Chore</th>
                  <th>Assigned To</th>
                  <th>Points</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((assignment) => (
                  <tr key={assignment.assignment_id}>
                    <td>{assignment.chore_name}</td>
                    <td>{assignment.child_name}</td>
                    <td>{assignment.points}</td>
                    <td>
                      <button
                        onClick={() => handleCompleteAssignment(assignment.assignment_id)}
                        className="complete-button"
                      >
                        Mark as Completed
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}

export default Home;