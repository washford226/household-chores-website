import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './AddChore.css'; // Updated to use a page-specific CSS file

function AddChore() {
  const location = useLocation();
  const navigate = useNavigate();
  const { household_id } = location.state || {}; // Get household_id from state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState('');
  const [recurring, setRecurring] = useState(false);
  const [frequency, setFrequency] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('');
  const [dayOfMonth, setDayOfMonth] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedChildren, setSelectedChildren] = useState([]);
  const [children, setChildren] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Fetch children for the household
    fetch(`http://localhost:3000/children?household_id=${household_id}`)
      .then((response) => response.json())
      .then((data) => setChildren(data))
      .catch(() => setError('Failed to fetch children.'));
  }, [household_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !points || (recurring && !frequency)) {
      setError('All required fields must be filled.');
      return;
    }

    const recurringDetails = recurring
      ? {
          frequency,
          children: selectedChildren,
          start_date: startDate,
          end_date: endDate || null,
          day_of_week: frequency === 'weekly' || frequency === 'bi-weekly' ? parseInt(dayOfWeek, 10) : null,
          day_of_month: frequency === 'monthly' ? parseInt(dayOfMonth, 10) : null,
        }
      : null;

    try {
      const response = await fetch('http://localhost:3000/chores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          points: parseInt(points, 10),
          household_id,
          recurring,
          frequency: recurring ? frequency : null,
          recurring_details: recurringDetails,
          end_date: endDate || null,
        }),
      });

      if (response.ok) {
        setSuccess('Chore added successfully!');
        setName('');
        setDescription('');
        setPoints('');
        setRecurring(false);
        setFrequency('');
        setDayOfWeek('');
        setDayOfMonth('');
        setStartDate('');
        setEndDate('');
        setSelectedChildren([]);
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to add chore.');
      }
    } catch {
      setError('Failed to connect to the server.');
    }
  };

  return (
    <div className="add-chore-container">
      <header className="add-chore-header">
        <h1>Add Chore</h1>
        <p>Fill out the form below to add a new chore to your household.</p>
      </header>

      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      <form onSubmit={handleSubmit} className="add-chore-form">
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
              <label htmlFor="children">Select Children:</label>
              <select
                id="children"
                multiple
                value={selectedChildren}
                onChange={(e) =>
                  setSelectedChildren(Array.from(e.target.selectedOptions, (option) => parseInt(option.value, 10)))
                }
                required
              >
                {children.map((child) => (
                  <option key={child.id} value={child.id}>
                    {child.first_name}
                  </option>
                ))}
              </select>
            </div>
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
        <button type="submit" className="submit-button">Add Chore</button>
      </form>

      <footer className="add-chore-footer">
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

export default AddChore;