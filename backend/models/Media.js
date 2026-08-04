const mongoose = require('mongoose');

const MediaSchema = new mongoose.Schema({
    filename: String,
    url: String,
    device: { type: mongoose.Schema.Types.ObjectId, ref: 'Device' },
    type: { type: String, enum: ['photo', 'video'], default: 'photo' },
    category: { type: String, default: 'Camera' }, // Camera, Screenshots, WhatsApp, Downloads
    size: { type: String, default: '2.4 MB' },
    uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Media', MediaSchema);