const express = require('express');
const jwt = require('jsonwebtoken');
const Media = require('../models/Media');

const router = express.Router();
const SECRET = 'your_jwt_secret';

const auth = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: 'No token' });
    jwt.verify(token, SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Invalid token' });
        req.userId = decoded.userId;
        next();
    });
};

// Get media for device
router.get('/:deviceId', auth, async (req, res) => {
    const media = await Media.find({ device: req.params.deviceId });
    res.json(media);
});

// Upload media (simulate)
router.post('/', auth, async (req, res) => {
    const { filename, url, deviceId, type } = req.body;
    const media = new Media({ filename, url, device: deviceId, type, uploadedAt: new Date() });
    await media.save();
    res.json(media);
});

module.exports = router;