const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const cors = require('cors');
const { body, validationResult } = require('express-validator');

const db = new sqlite3.Database('./database/household.db');
const app = express();
const PORT = 3000;

// Create tables
db.run(`
CREATE TABLE IF NOT EXISTS household (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  household_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL, 
  pin INTEGER NOT NULL
)`);

db.run(`
CREATE TABLE IF NOT EXISTS child (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT NOT NULL,
  birth_date DATE NOT NULL,
  points INTEGER DEFAULT 0,
  household_id INTEGER NOT NULL,
  FOREIGN KEY (household_id) REFERENCES household(id) ON DELETE CASCADE
)`);

db.run(`
CREATE TABLE IF NOT EXISTS chores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  points INTEGER NOT NULL,
  frequency TEXT,
  recurring Boolean DEFAULT 0,
  recurring_frequency TEXT,
  recurring_details TEXT,
  end_date DATE,
  household_id INTEGER NOT NULL,
  FOREIGN KEY (household_id) REFERENCES household(id) ON DELETE CASCADE
)`);

db.run(`
CREATE TABLE IF NOT EXISTS chore_assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  child_id INTEGER NOT NULL,
  chore_id INTEGER NOT NULL,
  assigned_date DATE NOT NULL,
  Completed BOOLEAN DEFAULT 0,
  FOREIGN KEY (child_id) REFERENCES child(id) ON DELETE CASCADE,
  FOREIGN KEY (chore_id) REFERENCES chores(id) ON DELETE CASCADE
)`);

db.run(`
CREATE TABLE IF NOT EXISTS prizes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  points_required INTEGER NOT NULL,
  points_awarded INTEGER DEFAULT 0,
  date_awarded DATE,
  household_id INTEGER NOT NULL,
  child_id INTEGER DEFAULT NULL,
  FOREIGN KEY (child_id) REFERENCES child(id) ON DELETE CASCADE,
  FOREIGN KEY (household_id) REFERENCES household(id) ON DELETE CASCADE
)`);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cors());

// Start server
app.listen(PORT, (err) => {
  if (err) {
    console.error(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
  console.log(`Server running on http://localhost:${PORT}`);
});

// Household CRUD operations

// Login endpoint
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const query = `SELECT * FROM household WHERE email = ?`;
  db.get(query, [email], (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if the provided password matches the stored password
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Successful login
    res.json({ message: 'Login successful', household_id: user.id });
  });
});

// Create a new household (register)
app.post(
  '/households',
  [
    body('household_name').notEmpty().withMessage('Household name is required'),
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('pin').isNumeric().withMessage('PIN must be a number'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { household_name, email, password, pin } = req.body;
    const query = `INSERT INTO household (household_name, email, password, pin) VALUES (?, ?, ?, ?)`;
    db.run(query, [household_name, email, password, pin], function (err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(409).json({ error: 'Email already exists' });
        }
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID, message: 'Household registered successfully' });
    });
  }
);

// Get all households
app.get('/households', (req, res) => {
  const query = `SELECT * FROM household`;
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Get a single household by ID
app.get('/households/:id', (req, res) => {
  const query = `SELECT * FROM household WHERE id = ?`;
  db.get(query, [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Household not found' });
    }
    res.json(row);
  });
});

// Update a household
app.put('/households/:id', (req, res) => {
  const { household_name, email, password, pin } = req.body;
  const query = `UPDATE household SET household_name = ?, email = ?, password = ?, pin = ? WHERE id = ?`;
  db.run(query, [household_name, email, password, pin, req.params.id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Household not found' });
    }
    res.json({ message: 'Household updated successfully' });
  });
});

// Delete a household
app.delete('/households/:id', (req, res) => {
  const query = `DELETE FROM household WHERE id = ?`;
  db.run(query, [req.params.id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Household not found' });
    }
    res.json({ message: 'Household deleted successfully' });
  });
});

// Gracefully close the database connection on server shutdown
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing the database connection:', err.message);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(0);
  });
});

//Child CRUD operations


// Add a new child
app.post('/child', (req, res) => {
  const { first_name, birth_date, household_id } = req.body;

  if (!first_name || !birth_date || !household_id) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const query = `INSERT INTO child (first_name, birth_date, points, household_id) VALUES (?, ?, 0, ?)`;
  db.run(query, [first_name, birth_date, household_id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID, message: 'Child added successfully' });
  });
});
  
  // Get all children for a specific household
app.get('/children', (req, res) => {
  const { household_id } = req.query; // Get household_id from query parameters

  if (!household_id) {
    return res.status(400).json({ error: 'household_id is required' });
  }

  const query = `SELECT * FROM child WHERE household_id = ?`;
  db.all(query, [household_id], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});
  
  // Get a single child by ID
app.get('/children/:id', (req, res) => {
  const query = `SELECT * FROM child WHERE id = ?`;
  db.get(query, [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Child not found' });
    }
    res.json(row);
  });
});
  
  // Update a child's details
app.put('/children/:id', (req, res) => {
  const { first_name, birth_date } = req.body;
  const { id } = req.params;

  if (!first_name || !birth_date) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const query = `UPDATE child SET first_name = ?, birth_date = ? WHERE id = ?`;
  db.run(query, [first_name, birth_date, id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Child not found' });
    }
    res.json({ message: 'Child updated successfully' });
  });
});
  
  // Delete a child
  app.delete('/children/:id', (req, res) => {
    const query = `DELETE FROM child WHERE id = ?`;
    db.run(query, [req.params.id], function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Child not found' });
      }
      res.json({ message: 'Child deleted successfully' });
    });
  });

  // Chore CRUD operations

  // Create a new chore

  app.post('/chores', (req, res) => {
    const { name, description, frequency, points, household_id, recurring, recurring_details, end_date } = req.body;
  
    // Validate required fields
    if (!name || !points || !household_id) {
      return res.status(400).json({ error: 'All required fields must be filled.' });
    }
  
    // If the chore is not recurring, set frequency to NULL
    const finalFrequency = recurring ? frequency : null;
  
    const query = `
      INSERT INTO chores (name, description, frequency, points, household_id, recurring, recurring_details, end_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
  
    db.run(
      query,
      [
        name,
        description,
        finalFrequency, // Use the finalFrequency variable
        points,
        household_id,
        recurring,
        recurring ? JSON.stringify(recurring_details) : null, // Serialize recurring_details
        end_date || null, // Store end_date or NULL if not provided
      ],
      function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
  
        const choreId = this.lastID;
  
        // If the chore is recurring, create chore assignments
        if (recurring) {
          try {
            const assignments = generateRecurringAssignments(choreId, recurring_details, household_id, end_date);
            const assignmentQuery = `INSERT INTO chore_assignments (child_id, chore_id, assigned_date) VALUES (?, ?, ?)`;
  
            assignments.forEach((assignment) => {
              db.run(assignmentQuery, [assignment.child_id, assignment.chore_id, assignment.assigned_date], (err) => {
                if (err) {
                  console.error('Failed to create chore assignment:', err.message);
                }
              });
            });
          } catch (err) {
            console.error('Error generating recurring assignments:', err.message);
            return res.status(500).json({ error: 'Failed to generate recurring assignments.' });
          }
        }
  
        res.status(201).json({ id: choreId, message: 'Chore added successfully' });
      }
    );
  });
  
  // Helper function to generate recurring assignments
  function generateRecurringAssignments(choreId, recurringDetails, householdId, endDate) {
    let details;
  
    try {
      details = typeof recurringDetails === 'string' ? JSON.parse(recurringDetails) : recurringDetails;
    } catch (err) {
      console.error('Invalid recurringDetails JSON:', err.message);
      throw new Error('Invalid recurring details format.');
    }
  
    const assignments = [];
    const { frequency, children, start_date, day_of_week, day_of_month } = details;
  
    const startDate = new Date(start_date);
    const finalDate = endDate ? new Date(endDate) : new Date();
    finalDate.setFullYear(finalDate.getFullYear() + 1); // Default to 1 year if no end_date is provided
  
    let currentDate = new Date(startDate);
  
    while (currentDate <= finalDate) {
      if (
        (frequency === 'daily') ||
        (frequency === 'weekly' && currentDate.getDay() === day_of_week) ||
        (frequency === 'bi-weekly' && currentDate.getDay() === day_of_week && isBiWeekly(startDate, currentDate)) ||
        (frequency === 'monthly' && currentDate.getDate() === day_of_month)
      ) {
        const randomChildId = children[Math.floor(Math.random() * children.length)];
        assignments.push({
          child_id: randomChildId,
          chore_id: choreId,
          assigned_date: currentDate.toISOString().split('T')[0],
        });
      }
  
      currentDate.setDate(currentDate.getDate() + 1); // Increment by 1 day
    }
  
    return assignments;
  }
  
  // Helper function to check bi-weekly frequency
  function isBiWeekly(startDate, currentDate) {
    const diffInDays = Math.floor((currentDate - startDate) / (1000 * 60 * 60 * 24));
    return Math.floor(diffInDays / 7) % 2 === 0;
  }
  
  // Get all chores
  app.get('/chores', (req, res) => {
    const { household_id } = req.query;
  
    if (!household_id) {
      return res.status(400).json({ error: 'household_id is required' });
    }
  
    const query = `SELECT * FROM chores WHERE household_id = ?`;
    db.all(query, [household_id], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    });
  });

  // Get chores for the current date
app.get('/chores/today', (req, res) => {
  const { household_id } = req.query;

  if (!household_id) {
    return res.status(400).json({ error: 'household_id is required' });
  }

  const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
  console.log(`Fetching chores for household_id: ${household_id}, date: ${today}`);

  const query = `
    SELECT ca.id AS assignment_id, ch.name AS chore_name, c.first_name AS child_name, ch.points, ca.assigned_date, ca.Completed
    FROM chore_assignments ca
    JOIN chores ch ON ca.chore_id = ch.id
    JOIN child c ON ca.child_id = c.id
    WHERE ca.assigned_date = ? AND ch.household_id = ? AND ca.Completed = 0
  `;

  db.all(query, [today, household_id], (err, rows) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ error: err.message });
    }

    console.log('Query result:', rows);
    res.json(rows);
  });
});
  
  // Get a single chore by ID
  app.get('/chores/:id', (req, res) => {
    const query = `SELECT * FROM chores WHERE id = ?`;
    db.get(query, [req.params.id], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!row) {
        return res.status(404).json({ error: 'Chore not found' });
      }
      res.json(row);
    });
  });
  
  // Update a chore
  app.put('/chores/:id', (req, res) => {
    const { name, description, frequency, points, recurring, recurring_details, end_date } = req.body;
  
    if (!name || !points) {
      return res.status(400).json({ error: 'All required fields must be filled.' });
    }
  
    const query = `UPDATE chores SET name = ?, description = ?, frequency = ?, points = ?, recurring = ?, recurring_details = ?, end_date = ? WHERE id = ?`;
  
    db.run(
      query,
      [
        name,
        description,
        recurring ? frequency : null,
        points,
        recurring,
        recurring ? JSON.stringify(recurring_details) : null,
        end_date || null,
        req.params.id,
      ],
      function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Chore not found' });
        }
        res.json({ message: 'Chore updated successfully' });
      }
    );
  });
  
  // Delete a chore
  app.delete('/chores/:id', (req, res) => {
    const query = `DELETE FROM chores WHERE id = ?`;
    db.run(query, [req.params.id], function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Chore not found' });
      }
      res.json({ message: 'Chore deleted successfully' });
    });
  });

  // Chore Assignment CRUD operations

  // Create a new chore assignment
  app.post('/chore-assignments', (req, res) => {
    const { child_id, chore_id, assigned_date } = req.body;
  
    if (!child_id || !chore_id || !assigned_date) {
      return res.status(400).json({ error: 'All fields are required' });
    }
  
    const query = `INSERT INTO chore_assignments (child_id, chore_id, assigned_date) VALUES (?, ?, ?)`;
    db.run(query, [child_id, chore_id, assigned_date], function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID, message: 'Chore assignment added successfully' });
    });
  });
  
  // Get all chore assignments
  app.get('/chore-assignments', (req, res) => {
    const { household_id } = req.query;
  
    if (!household_id) {
      return res.status(400).json({ error: 'household_id is required' });
    }
  
    const query = `
      SELECT ca.id, c.first_name AS child_name, ch.name AS chore_name, ca.assigned_date
      FROM chore_assignments ca
      JOIN child c ON ca.child_id = c.id
      JOIN chores ch ON ca.chore_id = ch.id
      WHERE c.household_id = ?
    `;
    db.all(query, [household_id], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    });
  });
  
  // Get a single chore assignment by ID
  app.get('/chore-assignments/:id', (req, res) => {
    const query = `SELECT * FROM chore_assignments WHERE id = ?`;
    db.get(query, [req.params.id], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!row) {
        return res.status(404).json({ error: 'Chore assignment not found' });
      }
      res.json(row);
    });
  });
  
  // Update a chore assignment
  app.put('/chore-assignments/:id', (req, res) => {
    const { child_id, chore_id, assigned_date } = req.body;
    const { id } = req.params;

    if (!child_id || !chore_id || !assigned_date) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const query = `UPDATE chore_assignments SET child_id = ?, chore_id = ?, assigned_date = ? WHERE id = ?`;
    db.run(query, [child_id, chore_id, assigned_date, id], function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Chore assignment not found' });
      }
      res.json({ message: 'Chore assignment updated successfully' });
    });
  });
  
  // Delete a chore assignment
  app.delete('/chore-assignments/:id', (req, res) => {
    const query = `DELETE FROM chore_assignments WHERE id = ?`;
    db.run(query, [req.params.id], function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Chore assignment not found' });
      }
      res.json({ message: 'Chore assignment deleted successfully' });
    });
  });

  // Mark a chore assignment as completed and update prize points
app.put('/chore-assignments/:id/complete', (req, res) => {
  const { id } = req.params;

  // Step 1: Fetch the chore assignment details
  const fetchAssignmentQuery = `
    SELECT ca.child_id, ca.chore_id, ch.points, ch.household_id
    FROM chore_assignments ca
    JOIN chores ch ON ca.chore_id = ch.id
    WHERE ca.id = ?
  `;

  db.get(fetchAssignmentQuery, [id], (err, assignment) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!assignment) {
      return res.status(404).json({ error: 'Chore assignment not found' });
    }

    const { child_id, points, household_id } = assignment;

    // Step 2: Mark the chore assignment as completed
    const markCompleteQuery = `UPDATE chore_assignments SET Completed = 1 WHERE id = ?`;
    db.run(markCompleteQuery, [id], function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Chore assignment not found' });
      }

      // Step 3: Update points for prizes assigned to the child and household
      const updatePrizesQuery = `
        UPDATE prizes
        SET points_awarded = points_awarded + ?
        WHERE household_id = ? AND (child_id = ? OR child_id IS NULL)
      `;

      db.run(updatePrizesQuery, [points, household_id, child_id], function (err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        // Step 4: Respond with success
        res.json({ message: 'Chore assignment marked as completed and points added to prizes successfully' });
      });
    });
  });
});

  // Prize CRUD operations

  // Create a new prize
  app.post('/prizes', (req, res) => {
    const { name, points_required, household_id, child_id } = req.body;

    if (!name || !points_required || !household_id) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const query = `INSERT INTO prizes (name, points_required, household_id, child_id) VALUES (?, ?, ?, ?)`;
    db.run(query, [name, points_required, household_id, child_id || null], function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID, message: 'Prize added successfully' });
    });
  });
  
  // Get all prizes
  app.get('/prizes', (req, res) => {
    const { household_id, child_id } = req.query;
  
    if (!household_id) {
      return res.status(400).json({ error: 'household_id is required' });
    }
  
    let query = `SELECT * FROM prizes WHERE household_id = ?`;
    const params = [household_id];
  
    if (child_id) {
      query += ` AND (child_id = ? OR child_id IS NULL)`;
      params.push(child_id);
    }
  
    db.all(query, params, (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    });
  });
  
  // Get a single prize by ID
  app.get('/prizes/:id', (req, res) => {
    const query = `SELECT * FROM prizes WHERE id = ?`;
    db.get(query, [req.params.id], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!row) {
        return res.status(404).json({ error: 'Prize not found' });
      }
      res.json(row);
    });
  });
  
  // Update a prize's details
  app.put('/prizes/:id', (req, res) => {
    const { name, points_required, child_id, expiration_date, is_active } = req.body;
    const { id } = req.params;
  
    if (!name || !points_required) {
      return res.status(400).json({ error: 'All required fields must be filled.' });
    }
  
    const query = `UPDATE prizes SET name = ?, points_required = ?, child_id = ?, expiration_date = ?, is_active = ? WHERE id = ?`;
    db.run(query, [name, points_required, child_id || null, expiration_date || null, is_active || 1, id], function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Prize not found' });
      }
      res.json({ message: 'Prize updated successfully' });
    });
  });
  
  // Delete a prize
  app.delete('/prizes/:id', (req, res) => {
    const { id } = req.params;
  
    const query = `DELETE FROM prizes WHERE id = ?`;
    db.run(query, [id], function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Prize not found' });
      }
      res.json({ message: 'Prize deleted successfully' });
    });
  });
