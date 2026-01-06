const socketIO = require('socket.io');
const User = require('../models/user');

let io;

const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true
    },
    pingTimeout: 60000
  });

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // User authentication
    socket.on('authenticate', async (token) => {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (user) {
          // Update user's socket ID and status
          user.socketId = socket.id;
          user.status = 'online';
          await user.save();

          socket.userId = user._id;
          socket.join(`user_${user._id}`);

          // Notify friends about online status
          const friends = user.friends
            .filter(f => f.status === 'accepted')
            .map(f => f.user.toString());

          friends.forEach(friendId => {
            io.to(`user_${friendId}`).emit('friend_status', {
              userId: user._id,
              status: 'online',
              lastSeen: user.lastSeen
            });
          });

          console.log(`User ${user.username} authenticated with socket ${socket.id}`);
        }
      } catch (error) {
        console.error('Socket authentication error:', error);
      }
    });

    // Join conversation room
    socket.on('join_conversation', (conversationId) => {
      socket.join(`conversation_${conversationId}`);
    });

    // Leave conversation room
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conversation_${conversationId}`);
    });

    // Typing indicator
    socket.on('typing', ({ conversationId, userId }) => {
      socket.to(`conversation_${conversationId}`).emit('user_typing', {
        userId,
        conversationId
      });
    });

    // Stop typing indicator
    socket.on('stop_typing', ({ conversationId, userId }) => {
      socket.to(`conversation_${conversationId}`).emit('user_stop_typing', {
        userId,
        conversationId
      });
    });

    // Call signaling
    socket.on('call_signal', ({ to, signal, callId }) => {
      io.to(`user_${to}`).emit('incoming_signal', {
        from: socket.userId,
        signal,
        callId
      });
    });

    socket.on('call_accepted', ({ to, callId }) => {
      io.to(`user_${to}`).emit('call_accepted', { callId });
    });

    socket.on('call_rejected', ({ to, callId }) => {
      io.to(`user_${to}`).emit('call_rejected', { callId });
    });

    socket.on('call_ended', ({ to, callId }) => {
      io.to(`user_${to}`).emit('call_ended', { callId });
    });

    // Disconnect
    socket.on('disconnect', async () => {
      console.log('Client disconnected:', socket.id);
      
      if (socket.userId) {
        const user = await User.findById(socket.userId);
        if (user && user.socketId === socket.id) {
          user.status = 'offline';
          user.lastSeen = new Date();
          user.socketId = null;
          await user.save();

          // Notify friends about offline status
          const friends = user.friends
            .filter(f => f.status === 'accepted')
            .map(f => f.user.toString());

          friends.forEach(friendId => {
            io.to(`user_${friendId}`).emit('friend_status', {
              userId: user._id,
              status: 'offline',
              lastSeen: user.lastSeen
            });
          });
        }
      }
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = { initializeSocket, getIO };