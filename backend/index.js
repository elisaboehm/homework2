// Import required modules
const express = require('express');           // Web framework for Node.js
const bodyParser = require('body-parser');   // Middleware to parse JSON request bodies
const cors = require('cors');                // Middleware to enable Cross-Origin Resource Sharing
const sqlite3 = require('sqlite3').verbose(); // SQLite3 database with verbose logging
const path = require('path');                 // Helps with file paths

// Initialize the Express app
const app = express();

// Serve static files from the frontend folder
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Connect to (or create) a SQLite database file called 'comments.db'
const db = new sqlite3.Database('./comments.db');

// Middleware setup
app.use(cors());                // Allow requests from different origins
app.use(bodyParser.json());     // Parse JSON request bodies

// Create comments table if it doesn't exist
db.run(`CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    name TEXT NOT NULL,
    comment TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)`);
// Unique ID for each comment
// Name of the commenter
// Comment text
// Time the comment was posted

// GET endpoint to fetch all comments from the database
app.get('/comments', (req, res) => {
    db.all('SELECT * FROM comments ORDER BY timestamp DESC', [], (err, rows) => {
        if (err) {
            // If there's a database error, return a 500 status
            return res.status(500).json({ error: err.message });
        }
        // Return all comments in JSON format
        res.json(rows);
    });
});

// POST endpoint to add a new comment to the database
app.post('/comments', (req, res) => {
    const { name, comment } = req.body;

    // Check if both name and comment are provided
    if (!name || !comment) {
        return res.status(400).json({ error: 'Name and comment are required.' });
    }

    // Insert the new comment into the database
    db.run('INSERT INTO comments (name, comment) VALUES (?, ?)', [name, comment], function (err) {
        if (err) {
            // Handle database errors
            return res.status(500).json({ error: err.message });
        }
        // Return the ID of the new comment with status 201 (created)
        res.status(201).json({ id: this.lastID });
    });
});


// Start the server on port 3000
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});