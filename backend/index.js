const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());

// Database setup
const db = new sqlite3.Database('./comments.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        db.run(`CREATE TABLE IF NOT EXISTS comments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            comment TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error('Error creating table:', err);
            }
        });
    }
});

// API Endpoints

// Get all comments
app.get('/comments', (req, res) => {
    db.all('SELECT * FROM comments ORDER BY timestamp DESC', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// Add a new comment
app.post('/comments', (req, res) => {
    const { name, comment } = req.body;
    if (!name || !comment) {
        return res.status(400).json({ error: 'Name and comment are required.' });
    }
    db.run('INSERT INTO comments (name, comment) VALUES (?, ?)', [name, comment], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.status(201).json({ id: this.lastID, name, comment });
        }
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});