const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
    device: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', required: true },
    name: { type: String, required: true },
    phone: String,
    email: String,
    avatarUrl: String,
    starred: { type: Boolean, default: false },
});

module.exports = mongoose.model('Contact', ContactSchema);
