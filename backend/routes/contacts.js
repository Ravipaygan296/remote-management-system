const express = require('express');
const jwt = require('jsonwebtoken');
const Contact = require('../models/Contact');

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

// Get contacts for device
router.get('/:deviceId', auth, async (req, res) => {
    try {
        const contacts = await Contact.find({ device: req.params.deviceId }).sort({ name: 1 });
        res.json(contacts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Post contact
router.post('/', auth, async (req, res) => {
    try {
        const { deviceId, name, phone, email, avatarUrl, starred } = req.body;
        const contact = new Contact({
            device: deviceId,
            name,
            phone,
            email,
            avatarUrl,
            starred
        });
        await contact.save();
        res.json(contact);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
