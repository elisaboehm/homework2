require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const OpenAI = require('openai');
const path = require('path');

const app = express();

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// SQLite setup
const db = new sqlite3.Database('./comments.db');

app.use(cors());
app.use(bodyParser.json());

// Create table if not exists
db.run(`CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    name TEXT NOT NULL,
    comment TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// GET all comments
app.get('/comments', (req, res) => {
    db.all('SELECT * FROM comments ORDER BY timestamp DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// POST a new comment
app.post('/comments', (req, res) => {
    const { name, comment } = req.body;
    if (!name || !comment) {
        return res.status(400).json({ error: 'Name and comment are required.' });
    }

    db.run('INSERT INTO comments (name, comment) VALUES (?, ?)', [name, comment], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: this.lastID });
    });
});

// ✅ OpenAI API v4 setup
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

console.log("🔐 OpenAI key loaded:", process.env.OPENAI_API_KEY);

// ✅ AI chat route (GPT-4 compatible)
app.post('/ai-response', async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required.' });
    }

    console.log("🟡 Calling OpenAI with message:", message);

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo', // or 'gpt-4' if your key supports it
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                { role: 'user', content: message }
            ],
            max_tokens: 150
        });

        const aiResponse = response.choices[0].message.content.trim();
        res.json({ response: aiResponse });

    } catch (error) {
        console.error('❌ OpenAI API error details:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Message:', error.message);
        }

        res.status(500).json({ error: 'Failed to generate AI response.' });
    }
});

// Serve HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
