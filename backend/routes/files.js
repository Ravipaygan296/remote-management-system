const express = require('express');
const jwt = require('jsonwebtoken');

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

// Get remote device files simulation structure
router.get('/:deviceId', auth, async (req, res) => {
    res.json({
        path: '/storage/emulated/0',
        folders: [
            { name: 'DCIM', items: 142, size: '12.4 GB', modified: '2026-08-02' },
            { name: 'Download', items: 38, size: '1.8 GB', modified: '2026-08-03' },
            { name: 'Documents', items: 19, size: '420 MB', modified: '2026-07-28' },
            { name: 'Pictures', items: 85, size: '4.2 GB', modified: '2026-08-01' },
            { name: 'WhatsApp', items: 310, size: '8.1 GB', modified: '2026-08-03' },
            { name: 'Music', items: 54, size: '650 MB', modified: '2026-07-15' }
        ],
        files: [
            { name: 'system_log.txt', type: 'text/plain', size: '45 KB', modified: '2026-08-03' },
            { name: 'backup_config.json', type: 'application/json', size: '12 KB', modified: '2026-08-02' },
            { name: 'passport_scan.pdf', type: 'application/pdf', size: '2.1 MB', modified: '2026-07-20' },
            { name: 'voice_recording_01.m4a', type: 'audio/m4a', size: '5.8 MB', modified: '2026-08-01' }
        ]
    });
});

module.exports = router;
