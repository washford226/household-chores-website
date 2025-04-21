import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import './EditChore.css'; // Updated to use a page-specific CSS file

function EditChore() {
  const { choreId } = useParams(); // Get choreId from the URL
  const location = useLocation();
  const navigate = useNavigate();
  const { household_id } = location.state || {}; // Get household_id from state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [recurring, setRecurring] = useState(false);
  const [frequency, setFrequency] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('');
  const [dayOfMonth, setDayOfMonth] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [points, setPoints] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Fetch the chore's current details
    fetch(`http://localhost:3000/chores/${choreId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch chore details');
        }
        return response.json();
      })
      .then((data) => {
        setName(data.name);
        setDescription(data.description);
        setRecurring(data.recurring);
        setFrequency(data.frequency);
        setPoints(data.points);
        setStartDate(data.start_date || '');
        setEndDate(data.end_date || '');
        if (data.frequency === 'weekly' || data.frequency === 'bi-weekly') {
          setDayOfWeek(data.day_of_week || '');
        }
        if (data.frequency === 'monthly') {
          setDayOfMonth(data.day_of_month || '');
        }
      })
      .catch((err) => setError(err.message));
  }, [choreId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !points || (recurring && !frequency)) {
      setError('All required fields must be filled.');
      return;
    }

    const recurringDetails = recurring
      ? {
          frequency,
          start_date: startDate,
          end_date: endDate || null,
          day_of_week: frequency === 'weekly' || frequency === 'bi-weekly' ? parseInt(dayOfWeek, 10) : null,
          day_of_month: frequency === 'monthly' ? parseInt(dayOfMonth, 10) : null,
        }
      : null;

    try {
      const response = await fetch(`http://localhost:3000/chores/${choreId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          recurring,
          frequency: recurring ? frequency : null,
          points: parseInt(points, 10),
          recurring_details: recurringDetails,
          end_date: endDate || null,
        }),
      });

      if (response.ok) {
        setSuccess('Chore updated successfully!');
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to update chore.');
      }
    } catch (err) {
      setError('Failed to connect to the server.');
    }
  };

  return (
    <div className="edit-chore-container">
      <header className="edit-chore-header">
        <h1>Edit Chore</h1>
        <p>Update the details of the chore below.</p>
      </header>

      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      <form onSubmit={handleSubmit} className="edit-chore-form">
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
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="points">Points:</label>
          <input
            type="number"
            id="points"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="recurring">Is this chore recurring?</label>
          <input
            type="checkbox"
            id="recurring"
            checked={recurring}
            onChange={(e) => setRecurring(e.target.checked)}
          />
        </div>
        {recurring && (
          <div className="recurring-options">
            <div className="form-group">
              <label htmlFor="frequency">Frequency:</label>
              <select
                id="frequency"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                required
              >
                <option value="">Select Frequency</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="bi-weekly">Bi-Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            {frequency === 'weekly' || frequency === 'bi-weekly' ? (
              <div className="form-group">
                <label htmlFor="dayOfWeek">Day of the Week:</label>
                <select
                  id="dayOfWeek"
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(e.target.value)}
                  required
                >
                  <option value="">Select Day</option>
                  <option value="0">Sunday</option>
                  <option value="1">Monday</option>
                  <option value="2">Tuesday</option>
                  <option value="3">Wednesday</option>
                  <option value="4">Thursday</option>
                  <option value="5">Friday</option>
                  <option value="6">Saturday</option>
                </select>
              </div>
            ) : null}
            {frequency === 'monthly' ? (
              <div className="form-group">
                <label htmlFor="dayOfMonth">Day of the Month:</label>
                <input
                  type="number"
                  id="dayOfMonth"
                  value={dayOfMonth}
                  onChange={(e) => setDayOfMonth(e.target.value)}
                  min="1"
                  max="31"
                  required
                />
              </div>
            ) : null}
            <div className="form-group">
              <label htmlFor="startDate">Start Date:</label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="endDate">End Date (optional):</label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        )}
        <button type="submit" className="submit-button">Update Chore</button>
      </form>

      <footer className="edit-chore-footer">
        <button
          onClick={() => navigate('/manage-chores', { state: { household_id } })}
          className="back-button"
        >
          Back to Manage Chores
        </button>
      </footer>
    </div>
  );
}

export default EditChore;