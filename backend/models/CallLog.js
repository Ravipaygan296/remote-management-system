const mongoose = require('mongoose');

const CallLogSchema = new mongoose.Schema({
    device: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', required: true },
    contactName: String,
    phoneNumber: String,
    type: { type: String, enum: ['incoming', 'outgoing', 'missed', 'rejected'], default: 'incoming' },
    duration: { type: String, default: '00:00' }, // formatted duration like 02:45
    timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('CallLog', CallLogSchema);
