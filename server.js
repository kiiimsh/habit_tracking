const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Vercel environment detection
const isVercel = process.env.VERCEL === '1';
// Use process.cwd() to correctly reference the project root on Vercel
const DATA_FILE = isVercel ? '/tmp/habits.json' : path.join(process.cwd(), 'data', 'habits.json');

// In-memory fallback for Vercel
let inMemoryData = { habits: [], completionData: {} };

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files from the project root
// On Vercel, process.cwd() is the root of the deployment
app.use(express.static(process.cwd()));

// Helper functions for data management
const readData = () => {
    try {
        if (isVercel) {
            if (fs.existsSync(DATA_FILE)) {
                return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
            }
            return inMemoryData;
        }

        if (!fs.existsSync(DATA_FILE)) {
            return { habits: [], completionData: {} };
        }
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Read Error:', err);
        return inMemoryData;
    }
};

const writeData = (data) => {
    try {
        const dir = path.dirname(DATA_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
        inMemoryData = data;
    } catch (err) {
        console.error('Write Error:', err);
        inMemoryData = data;
    }
};

// API Endpoints
app.get('/api/data', (req, res) => {
    const data = readData();
    res.json(data);
});

app.post('/api/habits', (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const data = readData();
    if (data.habits.includes(name)) {
        return res.status(400).json({ error: 'Habit already exists' });
    }

    data.habits.push(name);
    writeData(data);
    res.status(201).json({ habits: data.habits });
});

app.delete('/api/habits/:name', (req, res) => {
    const { name } = req.params;
    const data = readData();
    data.habits = data.habits.filter(h => h !== name);
    writeData(data);
    res.json({ habits: data.habits });
});

app.post('/api/toggle', (req, res) => {
    const { date, name, isChecked } = req.body;
    if (!date || !name) return res.status(400).json({ error: 'Date and Name are required' });

    const data = readData();
    if (!data.completionData[date]) {
        data.completionData[date] = [];
    }

    if (isChecked) {
        if (!data.completionData[date].includes(name)) {
            data.completionData[date].push(name);
        }
    } else {
        data.completionData[date] = data.completionData[date].filter(h => h !== name);
    }

    writeData(data);
    res.json({ completionData: data.completionData });
});

// Explicitly handle the root to serve index.html if static middleware fails for some reason
app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'index.html'));
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

module.exports = app;
