const express = require('express');
const jwt = require('jsonwebtoken');
const CallLog = require('../models/CallLog');

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

// Get call logs for device
router.get('/:deviceId', auth, async (req, res) => {
    try {
        const callLogs = await CallLog.find({ device: req.params.deviceId }).sort({ timestamp: -1 });
        res.json(callLogs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Post call log entry
router.post('/', auth, async (req, res) => {
    try {
        const { deviceId, contactName, phoneNumber, type, duration } = req.body;
        const log = new CallLog({
            device: deviceId,
            contactName,
            phoneNumber,
            type,
            duration,
            timestamp: new Date()
        });
        await log.save();
        res.json(log);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
