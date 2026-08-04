const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
    device: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: String,
    accuracy: { type: Number, default: 10 }, // in meters
    timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Location', LocationSchema);
