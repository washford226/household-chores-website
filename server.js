const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/household.db');

// Create tables
db.run(`
CREATE TABLE IF NOT EXISTS household (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  household_name TEXT NOT NULL,
  email TEXT NOT NULL,
  password TEXT NOT NULL, 
  pin INTEGER NOT NULL 
)`);

db.run(`
CREATE TABLE IF NOT EXISTS child (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  first_name TEXT NOT NULL,
  birth_date TEXT NOT NULL,
  points INTEGER DEFAULT 0,
  household_id INTEGER NOT NULL,
  FOREIGN KEY (household_id) REFERENCES household(id)
)`);

db.run(`
CREATE TABLE IF NOT EXISTS chores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  frequency TEXT,
  points INTEGER NOT NULL,
  completed INTEGER DEFAULT 0,
  household_id INTEGER NOT NULL,
  FOREIGN KEY (household_id) REFERENCES household(id)
)`);

db.run(`
CREATE TABLE IF NOT EXISTS chore_assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  child_id INTEGER NOT NULL,
  chore_id INTEGER NOT NULL,
  assigned_date TEXT NOT NULL,
  FOREIGN KEY (child_id) REFERENCES child(id),
  FOREIGN KEY (chore_id) REFERENCES chores(id)
)`);

db.run(`
CREATE TABLE IF NOT EXISTS prizes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  points_required INTEGER NOT NULL,
  household_id INTEGER NOT NULL,
  FOREIGN KEY (household_id) REFERENCES household(id)
)`);

const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});


// Household CRUD operations

// Create a new household
app.post('/households', (req, res) => {
  const { household_name, email, password, pin } = req.body;
  const query = `INSERT INTO household (household_name, email, password, pin) VALUES (?, ?, ?, ?)`;
  db.run(query, [household_name, email, password, pin], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID });
  });
});

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

//Child CRUD operations

// Create a new child
app.post('/child', (req, res) => {
    const { first_name, birth_date, points, household_id } = req.body;
    const query = `INSERT INTO child (first_name, birth_date, points, household_id) VALUES (?, ?, ?, ?)`;
    db.run(query, [first_name, birth_date, points || 0, household_id], function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID });
    });
  });
  
  // Get all children
  app.get('/child', (req, res) => {
    const query = `SELECT * FROM child`;
    db.all(query, [], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    });
  });
  
  // Get a single child by ID
  app.get('/child/:id', (req, res) => {
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
  
  // Update a child
  app.put('/child/:id', (req, res) => {
    const { first_name, birth_date, points, household_id } = req.body;
    const query = `UPDATE child SET first_name = ?, birth_date = ?, points = ?, household_id = ? WHERE id = ?`;
    db.run(query, [first_name, birth_date, points, household_id, req.params.id], function (err) {
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
  app.delete('/child/:id', (req, res) => {
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
    const { name, description, frequency, points, completed, household_id } = req.body;
    const query = `INSERT INTO chores (name, description, frequency, points, completed, household_id) VALUES (?, ?, ?, ?, ?, ?)`;
    db.run(query, [name, description, frequency, points, completed || 0, household_id], function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID });
    });
  });
  
  // Get all chores
  app.get('/chores', (req, res) => {
    const query = `SELECT * FROM chores`;
    db.all(query, [], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
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
    const { name, description, frequency, points, completed, household_id } = req.body;
    const query = `UPDATE chores SET name = ?, description = ?, frequency = ?, points = ?, completed = ?, household_id = ? WHERE id = ?`;
    db.run(query, [name, description, frequency, points, completed, household_id, req.params.id], function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Chore not found' });
      }
      res.json({ message: 'Chore updated successfully' });
    });
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
    const query = `INSERT INTO chore_assignments (child_id, chore_id, assigned_date) VALUES (?, ?, ?)`;
    db.run(query, [child_id, chore_id, assigned_date], function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID });
    });
  });
  
  // Get all chore assignments
  app.get('/chore-assignments', (req, res) => {
    const query = `SELECT * FROM chore_assignments`;
    db.all(query, [], (err, rows) => {
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
    const query = `UPDATE chore_assignments SET child_id = ?, chore_id = ?, assigned_date = ? WHERE id = ?`;
    db.run(query, [child_id, chore_id, assigned_date, req.params.id], function (err) {
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

  // Prize CRUD operations

  // Create a new prize
app.post('/prizes', (req, res) => {
    const { name, points_required, household_id } = req.body;
    const query = `INSERT INTO prizes (name, points_required, household_id) VALUES (?, ?, ?)`;
    db.run(query, [name, points_required, household_id], function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: this.lastID });
    });
  });
  
  // Get all prizes
  app.get('/prizes', (req, res) => {
    const query = `SELECT * FROM prizes`;
    db.all(query, [], (err, rows) => {
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
  
  // Update a prize
  app.put('/prizes/:id', (req, res) => {
    const { name, points_required, household_id } = req.body;
    const query = `UPDATE prizes SET name = ?, points_required = ?, household_id = ? WHERE id = ?`;
    db.run(query, [name, points_required, household_id, req.params.id], function (err) {
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
    const query = `DELETE FROM prizes WHERE id = ?`;
    db.run(query, [req.params.id], function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Prize not found' });
      }
      res.json({ message: 'Prize deleted successfully' });
    });
  });