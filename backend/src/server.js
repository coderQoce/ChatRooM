const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const friendRoutes = require('./routes/friends');
const messageRoutes = require('./routes/messages');
const uploadRoutes = require('./routes/upload');
const { readDB, writeDB } = require('./db/db');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000'
].filter(Boolean);

const corsCheck = (origin, cb) => {
  if (!origin) return cb(null, true);
  if (allowedOrigins.includes(origin)) return cb(null, true);
  if (allowedOrigins.includes(origin.replace(/\/$/, ''))) return cb(null, true);
  if (origin.match(/^https:\/\/chat-roo-m.*\.vercel\.app$/)) return cb(null, true);
  console.log('CORS blocked origin:', origin);
  cb(new Error('Not allowed by CORS'));
};

app.use(cors({ origin: corsCheck, credentials: true }));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is working!' });
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/upload', uploadRoutes);

/* ===== Socket.IO for WebRTC Signaling ===== */
const io = new Server(server, {
  cors: { origin: corsCheck, credentials: true },
  pingTimeout: 60000
});

// Map userId -> socketId for quick lookups
const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  // Authenticate user via JWT
  socket.on('authenticate', (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId || decoded.id;
      socket.userId = userId;
      socket.join(`user_${userId}`);
      onlineUsers.set(userId, socket.id);
      console.log(`User ${userId} authenticated on socket ${socket.id}`);
    } catch (err) {
      console.error('Socket auth error:', err.message);
    }
  });

  // WebRTC: caller sends offer to receiver
  socket.on('call:offer', ({ to, offer, callType, callerInfo }) => {
    console.log(`Call offer from ${socket.userId} to ${to} (${callType})`);
    io.to(`user_${to}`).emit('call:offer', {
      from: socket.userId,
      offer,
      callType,
      callerInfo
    });
  });

  // WebRTC: receiver sends answer back to caller
  socket.on('call:answer', ({ to, answer }) => {
    console.log(`Call answer from ${socket.userId} to ${to}`);
    io.to(`user_${to}`).emit('call:answer', {
      from: socket.userId,
      answer
    });
  });

  // WebRTC: ICE candidate exchange
  socket.on('call:ice-candidate', ({ to, candidate }) => {
    io.to(`user_${to}`).emit('call:ice-candidate', {
      from: socket.userId,
      candidate
    });
  });

  // Call rejected by receiver
  socket.on('call:reject', ({ to }) => {
    console.log(`Call rejected by ${socket.userId}`);
    io.to(`user_${to}`).emit('call:rejected', { from: socket.userId });
  });

  // Call ended by either party
  socket.on('call:end', ({ to }) => {
    console.log(`Call ended by ${socket.userId}`);
    io.to(`user_${to}`).emit('call:ended', { from: socket.userId });
  });

  // Disconnect
  socket.on('disconnect', () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      console.log(`User ${socket.userId} disconnected`);
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
});