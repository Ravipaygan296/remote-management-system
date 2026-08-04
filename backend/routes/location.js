const express = require('express');
const jwt = require('jsonwebtoken');
const Location = require('../models/Location');

const router = express.Router();
const SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

const auth = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: 'No token provided' });
    jwt.verify(token, SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Invalid token' });
        req.userId = decoded.userId;
        next();
    });
};

// Get location history for device
router.get('/:deviceId', auth, async (req, res) => {
    try {
        const locations = await Location.find({ device: req.params.deviceId }).sort({ timestamp: -1 }).limit(20);
        res.json(locations);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Post location update
router.post('/', auth, async (req, res) => {
    try {
        const { deviceId, latitude, longitude, address, accuracy } = req.body;
        const loc = new Location({
            device: deviceId,
            latitude,
            longitude,
            address,
            accuracy,
            timestamp: new Date()
        });
        await loc.save();
        res.json(loc);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
