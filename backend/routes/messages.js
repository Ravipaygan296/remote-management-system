const express = require('express');
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');

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

// Get all SMS messages for a device
router.get('/:deviceId', auth, async (req, res) => {
    try {
        const messages = await Message.find({ device: req.params.deviceId }).sort({ timestamp: 1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Post/Sync new message from device
router.post('/', auth, async (req, res) => {
    try {
        const { deviceId, contactName, phoneNumber, body, direction } = req.body;
        const msg = new Message({
            device: deviceId,
            contactName,
            phoneNumber,
            body,
            direction,
            timestamp: new Date(),
        });
        await msg.save();
        res.json(msg);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
