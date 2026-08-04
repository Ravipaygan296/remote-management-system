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
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

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
        io.to(`device_${data.deviceId}`).emit('device_status_update', data);
    });

    socket.on('send_command', (data) => {
        // e.g. command: 'take_photo', 'fetch_sms', 'lock_screen', 'ring_phone'
        io.to(`device_${data.deviceId}`).emit('remote_command', data);
    });

    socket.on('screen_frame', (data) => {
        // Stream frame from remote device to web frontend
        io.to(`device_${data.deviceId}`).emit('remote_screen_frame', data);
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