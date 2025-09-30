const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_DIR = path.join(__dirname, 'frontend');

// Basic request logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Serve static frontend files
app.use(express.static(FRONTEND_DIR, {
    extensions: ['html']
}));

// Simple mock APIs
app.get('/api/rates', (req, res) => {
    res.json([
        { id: 'paper', title: 'Paper', pricePerKg: 8, trendPct: 5 },
        { id: 'plastic', title: 'Plastic', pricePerKg: 12, trendPct: 8 },
        { id: 'metal', title: 'Metal', pricePerKg: 45, trendPct: 0 },
        { id: 'cardboard', title: 'Cardboard', pricePerKg: 6, trendPct: -2 }
    ]);
});

app.get('/api/aggregators', (req, res) => {
    res.json([
        { id: 1, name: 'Rajesh Kumar', rating: 4.8, distanceKm: 1.2, location: 'Sector 15, Noida', categories: ['Paper', 'Plastic', 'Metal'] },
        { id: 2, name: 'Amit Sharma', rating: 4.6, distanceKm: 2.1, location: 'Sector 22, Noida', categories: ['Plastic', 'E-waste'] },
        { id: 3, name: 'Vikram Singh', rating: 4.9, distanceKm: 3.5, location: 'Sector 18, Noida', categories: ['Paper', 'Cardboard', 'Metal'] }
    ]);
});

// Fallback to index.html for unknown routes within frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Kar-Kadam server running at http://localhost:${PORT}`);
});


