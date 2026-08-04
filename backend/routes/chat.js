const express = require('express');
const jwt = require('jsonwebtoken');
const ChatMessage = require('../models/ChatMessage');

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

// Get chat messages
router.get('/', auth, async (req, res) => {
    const messages = await ChatMessage.find().populate('sender', 'username').sort({ timestamp: -1 }).limit(50);
    res.json(messages);
});

module.exports = router;