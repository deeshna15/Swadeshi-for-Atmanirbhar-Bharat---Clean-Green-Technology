const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_DIR = path.join(__dirname, 'frontend');

app.use(express.json({ limit: '4mb' }));
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

// Simple in-memory gamification state (demo only)
let pointsState = {
    pointsTotal: 1250,
    itemsScanned: 47,
    uniqueTypesToday: 3,
    recent: [
        { label: 'PET Bottle', points: 10 },
        { label: 'Cardboard Box', points: 15 },
        { label: 'Aluminum Can', points: 8 }
    ]
};

app.get('/api/points', (req, res) => {
    res.json(pointsState);
});

app.post('/api/scan', (req, res) => {
    // Mock classification from image data; in production, call CV model
    const labels = [
        { label: 'PET Bottle (PET)', recyclable: true, type: 'Plastic', valuePerKg: 12 },
        { label: 'HDPE Container (HDPE)', recyclable: true, type: 'Plastic', valuePerKg: 12 },
        { label: 'Cardboard', recyclable: true, type: 'Cardboard', valuePerKg: 6 },
        { label: 'Aluminum Can', recyclable: true, type: 'Metal', valuePerKg: 45 },
        { label: 'Mixed Plastic (LDPE)', recyclable: false, type: 'Plastic', valuePerKg: 0 }
    ];
    const choice = labels[Math.floor(Math.random() * labels.length)];
    const estWeightKg = 0.15; // demo assumption per item
    const estimatedValue = Math.max(0, (choice.valuePerKg || 0) * estWeightKg);

    // Update points/challenge state
    const earned = choice.recyclable ? 10 : 2;
    pointsState.pointsTotal += earned;
    pointsState.itemsScanned += 1;
    if (!pointsState.recent) pointsState.recent = [];
    pointsState.recent.unshift({ label: choice.label, points: earned });
    pointsState.recent = pointsState.recent.slice(0, 10);
    // naive unique type tracker
    const normalized = (choice.type || '').toLowerCase();
    const todaySet = new Set(pointsState.recent.map(r => (r.label.split(' ')[0] || '').toLowerCase()));
    pointsState.uniqueTypesToday = Math.min(5, todaySet.size);

    res.json({
        result: {
            label: choice.label,
            recyclable: choice.recyclable,
            estimatedValue
        },
        stats: pointsState
    });
});

// Fallback to index.html for unknown routes within frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Kar-Kadam server running at http://localhost:${PORT}`);
});


