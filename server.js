const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'habits.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname))); // Serve frontend files

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}

// Helper functions for data management
const readData = () => {
    if (!fs.existsSync(DATA_FILE)) {
        return { habits: [], completionData: {} };
    }
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
};

const writeData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
};

// API Endpoints
app.get('/api/data', (req, res) => {
    try {
        const data = readData();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to read data' });
    }
});

app.post('/api/habits', (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ error: 'Name is required' });

        const data = readData();
        if (data.habits.includes(name)) {
            return res.status(400).json({ error: 'Habit already exists' });
        }

        data.habits.push(name);
        writeData(data);
        res.status(201).json({ message: 'Habit added', habits: data.habits });
    } catch (err) {
        res.status(500).json({ error: 'Failed to add habit' });
    }
});

app.delete('/api/habits/:name', (req, res) => {
    try {
        const { name } = req.params;
        const data = readData();
        data.habits = data.habits.filter(h => h !== name);
        writeData(data);
        res.json({ message: 'Habit deleted', habits: data.habits });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete habit' });
    }
});

app.post('/api/toggle', (req, res) => {
    try {
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
        res.json({ message: 'Status toggled', completionData: data.completionData });
    } catch (err) {
        res.status(500).json({ error: 'Failed to toggle status' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
