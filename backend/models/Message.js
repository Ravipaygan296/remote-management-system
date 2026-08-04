const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    device: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', required: true },
    contactName: String,
    phoneNumber: String,
    body: String,
    direction: { type: String, enum: ['incoming', 'outgoing'], default: 'incoming' },
    timestamp: { type: Date, default: Date.now },
    read: { type: Boolean, default: true },
});

module.exports = mongoose.model('Message', MessageSchema);
