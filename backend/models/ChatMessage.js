const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: String,
    timestamp: Date,
});

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);