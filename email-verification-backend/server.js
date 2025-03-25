    const express = require('express');
    const fs = require('fs');
    const path = require('path');
    const app = express();
    const port = 3001;
    const cors = require('cors');

    // Debugging setup
    const DB_PATH = path.join(__dirname, 'db.json');
    console.log(`Using database file at: ${DB_PATH}`);

    // Initialize database file if missing
    if (!fs.existsSync(DB_PATH)) {
    console.log('Creating new db.json file');
    fs.writeFileSync(DB_PATH, JSON.stringify({ users: [] }, null, 2));
    }

    app.use(cors());
    app.use(express.json());

    // Helper functions with debug logging
    function readDb() {
    try {
        const data = fs.readFileSync(DB_PATH);
        console.log('Current DB contents:', data.toString());
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading db.json:', err);
        return { users: [] };
    }
    }

    function writeDb(data) {
    try {
        console.log('Writing to DB:', data);
        fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
        console.log('Write successful');
    } catch (err) {
        console.error('Error writing to db.json:', err);
    }
    }

    // Registration endpoint
    app.post('/register', (req, res) => {
    console.log('Registration request:', req.body);
    const db = readDb();
    
    // Check for duplicate email
    if (db.users.some(user => user.email === req.body.email)) {
        console.log('Duplicate email detected');
        return res.status(400).json({ error: 'Email already registered' });
    }

    const newUser = {
        id: Date.now(),
        ...req.body,
        createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    writeDb(db);

    console.log('New user added:', newUser);
    res.status(201).json({ success: true, user: newUser });
    });

    // Login endpoint
    app.post('/login', (req, res) => {
    const db = readDb();
    const user = db.users.find(u => 
        u.email === req.body.email && 
        u.password === req.body.password
    );
    
    if (user) {
        res.json({ success: true, user });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
    });

    app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    console.log(`Database location: ${DB_PATH}`);
    });

    // Add this to server.js
    app.get('/validate-session', (req, res) => {
        try {
            const db = JSON.parse(fs.readFileSync(DB_PATH));
            const userData = JSON.parse(req.query.user || '{}');
            
            // Verify user exists in database
            const validUser = db.users.some(user => 
                user.email === userData.email && 
                user.id === userData.id
            );
            
            res.json({ valid: validUser });
        } catch (error) {
            res.status(500).json({ error: 'Session validation failed' });
        }
    });