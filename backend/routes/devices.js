const express = require('express');
const jwt = require('jsonwebtoken');
const Device = require('../models/Device');

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

// Get user's devices
router.get('/', auth, async (req, res) => {
    const devices = await Device.find({ owner: req.userId });
    res.json(devices);
});

// Add device
router.post('/', auth, async (req, res) => {
    const { name, status } = req.body;
    const device = new Device({ name, owner: req.userId, status, lastSeen: new Date() });
    await device.save();
    res.json(device);
});

// Update device
router.put('/:id', auth, async (req, res) => {
    const { id } = req.params;
    const { name, status } = req.body;
    const device = await Device.findOneAndUpdate(
        { _id: id, owner: req.userId },
        { name, status, lastSeen: new Date() },
        { new: true }
    );
    res.json(device);
});

// Delete device
router.delete('/:id', auth, async (req, res) => {
    const { id } = req.params;
    await Device.deleteOne({ _id: id, owner: req.userId });
    res.json({ message: 'Deleted' });
});

module.exports = router;