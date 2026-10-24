const express = require('express');
const cors = require('cors');
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');
const authRoutes = require('./routes/auth');
const Prediction = require('./models/Prediction');
const mongoose = require('mongoose');
const Listing = require('./models/Listing');
const path = require('path');
const fs = require('fs');
const User = require('./models/User');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log("MongoDB Error:", err));

// Auth Routes connect karein
app.use('/api/auth', authRoutes);

// Prediction History Routes
app.post('/api/save-prediction', async (req, res) => {
    try {
        const { userId, brand, model, year, price, details } = req.body;
        if (!userId) return res.status(400).json({ error: "User not logged in" });
        
        const newPrediction = new Prediction({ userId, brand, model, year, price, details });
        await newPrediction.save();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Failed to save history" });
    }
});

app.get('/api/history/:userId', async (req, res) => {
    try {
        const history = await Prediction.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json(history);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch history" });
    }
});

const upload = multer({ storage: multer.memoryStorage() });

// 1. Price Prediction Route
app.post('/api/predict', async (req, res) => {
    try {
        const response = await axios.post('http://localhost:8000/predict', req.body);
        res.json(response.data);
    } catch (error) {
        console.error("AI Backend Error:", error.message);
        res.status(500).json({ error: "AI Model se connect nahi ho saka." });
    }
});

// 2. Stats Route
app.get('/api/stats', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:8000/api/stats');
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Stats fetch failed" });
    }
});

// 3. Car Options Route
app.get('/api/car-options', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:8000/api/car-options');
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Options fetch failed" });
    }
});

// 4. Car Details Route
app.get('/api/car-details', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:8000/api/car-details', { params: req.query });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Car details fetch failed" });
    }
});

// 5. Damage Detection Route (Image Upload)
app.post('/api/detect-damage', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No image uploaded" });
        }

        const formData = new FormData();
        formData.append('file', req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype,
        });

        const response = await axios.post('http://localhost:8000/api/detect-damage', formData, {
            headers: { ...formData.getHeaders() }
        });

        res.json(response.data);
    } catch (error) {
        console.error("Damage API Error:", error.message);
        res.status(500).json({ error: "Damage detection failed" });
    }
});

// 6. Market Trends Route
app.get('/api/trends', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:8000/api/trends');
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Trends fetch failed" });
    }
});

// 7. Marketplace Routes
// Images ko server par save karne ke liye folder banayein
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const uploadListing = multer({ storage });

// Naya Listing Add Karein
app.post('/api/listings', uploadListing.single('image'), async (req, res) => {
    try {
        const { title, price, year, city, description, userId } = req.body;
        if (!req.file) return res.status(400).json({ error: "Image required" });

        const newListing = new Listing({
            title, price: Number(price), year: Number(year), city, description,
            imageUrl: `/uploads/${req.file.filename}`,
            userId
        });
        await newListing.save();
        res.json({ success: true, listing: newListing });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to add listing" });
    }
});

// Saari Listings Get Karein
app.get('/api/listings', async (req, res) => {
    try {
        const listings = await Listing.find().sort({ createdAt: -1 });
        res.json(listings);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch listings" });
    }
});

// Images ko public access dene ke liye (taake React show kar sake)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// 8. Admin Dashboard Routes
app.get('/api/admin/stats', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalListings = await Listing.countDocuments();
        const totalPredictions = await Prediction.countDocuments();
        
        // Top 5 Brands (Predictions ki history se)
        const brandStats = await Prediction.aggregate([
            { $group: { _id: "$brand", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        // Recent Users
        const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5);

        // Recent Predictions
        const recentPredictions = await Prediction.find().sort({ createdAt: -1 }).limit(5);

        res.json({
            totalUsers, totalListings, totalPredictions,
            brandStats: brandStats.map(b => ({ name: b._id, count: b.count })),
            recentUsers: recentUsers.map(u => ({ name: u.name, email: u.email, date: u.createdAt })),
            recentPredictions: recentPredictions.map(p => ({ car: `${p.brand} ${p.model}`, price: p.price, date: p.createdAt }))
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch admin stats" });
    }
});

// last. Server Start (Hamesha Aakhir mein)
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Node.js Server chal raha hai: http://localhost:${PORT}`);
});


