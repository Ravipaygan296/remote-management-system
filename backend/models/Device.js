const mongoose = require('mongoose');

const DeviceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    modelName: { type: String, default: 'Android Phone' },
    osVersion: { type: String, default: 'Android 14' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, default: 'online' }, // online, offline, busy
    batteryLevel: { type: Number, default: 85 },
    isCharging: { type: Boolean, default: false },
    storageUsed: { type: Number, default: 42.5 }, // GB
    storageTotal: { type: Number, default: 128 }, // GB
    networkType: { type: String, default: 'WiFi 5GHz' },
    ipAddress: { type: String, default: '192.168.1.105' },
    lastSeen: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Device', DeviceSchema);