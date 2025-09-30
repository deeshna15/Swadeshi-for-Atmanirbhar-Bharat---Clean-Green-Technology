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

// Mock pickups for map markers
app.get('/api/pickups', (req, res) => {
    res.json([
        { lat: 28.626, lng: 77.218, type: 'Plastic', weightKg: 12.5, time: '10:15 AM', location: 'Connaught Place' },
        { lat: 28.567, lng: 77.210, type: 'Paper', weightKg: 8.2, time: '09:50 AM', location: 'Saket' },
        { lat: 28.644, lng: 77.095, type: 'Metal', weightKg: 5.1, time: '11:05 AM', location: 'Janakpuri' },
        { lat: 28.613, lng: 77.302, type: 'Plastic', weightKg: 15.0, time: '11:20 AM', location: 'Mayur Vihar' },
        { lat: 28.540, lng: 77.334, type: 'Cardboard', weightKg: 18.3, time: '10:35 AM', location: 'Noida Sector 18' }
    ]);
});

// Lessons and progress (mock)
const LESSONS = [
    {
        id: 'plastics',
        title: 'Identify Plastic Types',
        subtitle: 'PET, HDPE, LDPE made simple',
        duration: '6 min',
        image: 'https://images.unsplash.com/photo-1581579188871-45ea61f2a0c8?q=80&w=1200&auto=format&fit=crop',
        tags: ['Plastic', 'Segregation', 'Recyclable'],
        sections: [
            { heading: 'Why It Matters', text: 'Correctly identifying plastics increases recyclability and payout.' },
            { heading: 'PET vs HDPE', text: 'PET is used for bottles, HDPE for containers; both are commonly recyclable.' },
            { heading: 'Look for Codes', text: 'Check the resin code triangle: 1=PET, 2=HDPE, 4=LDPE.' }
        ],
        quiz: {
            question: 'Which resin code indicates PET?',
            options: ['1', '2', '4', '7'],
            answerIndex: 0
        }
    },
    {
        id: 'recyclable',
        title: 'What’s Recyclable?',
        subtitle: 'Yes/No and prep guide',
        duration: '5 min',
        image: 'https://images.unsplash.com/photo-1559718062-361155fad299?q=80&w=1200&auto=format&fit=crop',
        tags: ['Recycling', 'Household'],
        sections: [
            { heading: 'Clean & Dry', text: 'Rinse containers; remove leftover food to prevent contamination.' },
            { heading: 'Flatten Boxes', text: 'Save space and make pickup easier by flattening cardboard.' }
        ],
        quiz: {
            question: 'Which item is NOT recyclable in most cities?',
            options: ['Greasy pizza box', 'Aluminum can', 'Cardboard box', 'PET bottle'],
            answerIndex: 0
        }
    },
    {
        id: 'value',
        title: 'Market Value Basics',
        subtitle: 'How segregation increases ₹/kg',
        duration: '4 min',
        image: 'https://images.unsplash.com/photo-1581092335305-5c1f4f25d3d8?q=80&w=1200&auto=format&fit=crop',
        tags: ['Pricing', 'Quality'],
        sections: [
            { heading: 'Quality Pays', text: 'Clean, well-sorted materials fetch higher prices.' },
            { heading: 'Local Rates', text: 'Rates vary by area and demand; check live rates regularly.' }
        ],
        quiz: {
            question: 'What boosts ₹/kg the most?',
            options: ['Mixing materials', 'Clean segregation', 'Crushing dirty items', 'Leaving labels on'],
            answerIndex: 1
        }
    },
    {
        id: 'ewaste',
        title: 'Responsible E‑waste',
        subtitle: 'Dispose electronics safely',
        duration: '7 min',
        image: 'https://images.unsplash.com/photo-1581093588401-16ec8a23fba1?q=80&w=1200&auto=format&fit=crop',
        tags: ['E‑waste', 'Safety'],
        sections: [
            { heading: 'Why Special Care', text: 'E‑waste can leach harmful chemicals if not handled properly.' },
            { heading: 'Battery Drop‑offs', text: 'Use designated bins or authorized centers for batteries.' }
        ],
        quiz: {
            question: 'Where should used batteries go?',
            options: ['General trash', 'Garden compost', 'Authorized drop‑off', 'Kitchen bin'],
            answerIndex: 2
        }
    }
];

let learnProgress = { completedLessonIds: [], quizCompletedLessonIds: [], totalCompleted: 0, totalLessons: LESSONS.length, points: 0 };

app.get('/api/lessons', (req, res) => {
    res.json(LESSONS);
});

app.get('/api/learn/progress', (req, res) => {
    res.json(learnProgress);
});

app.post('/api/learn/progress', (req, res) => {
    const { lessonId, action } = req.body || {};
    if (action === 'complete' && lessonId && learnProgress.completedLessonIds.indexOf(lessonId) === -1) {
        learnProgress.completedLessonIds.push(lessonId);
        learnProgress.totalCompleted = learnProgress.completedLessonIds.length;
        learnProgress.points += 20; // award per lesson
    }
    if (action === 'quiz' && lessonId && learnProgress.quizCompletedLessonIds.indexOf(lessonId) === -1) {
        learnProgress.quizCompletedLessonIds.push(lessonId);
        learnProgress.points += 10; // bonus for quiz
    }
    res.json(learnProgress);
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


