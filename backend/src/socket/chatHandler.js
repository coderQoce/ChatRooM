const { getIO } = require('./index');
const Message = require('../models/message');
const Notification = require('../models/notification');

const sendMessage = async (messageData) => {
  try {
    const io = getIO();
    const { senderId, receiverId, content, messageType } = messageData;

    // Save message to database
    const message = new Message({
      sender: senderId,
      receiver: receiverId,
      content,
      messageType
    });

    await message.save();
    await message.populate('sender', 'username profilePicture');

    // Emit message to receiver
    io.to(`user_${receiverId}`).emit('new_message', message);

    // Create notification
    await Notification.create({
      user: receiverId,
      type: 'message',
      title: 'New Message',
      message: `New message from ${message.sender.username}`,
      relatedUser: senderId,
      relatedId: message._id
    });

    return message;
  } catch (error) {
    console.error('Error in sendMessage socket handler:', error);
    throw error;
  }
};

const markAsRead = async (userId, conversationId) => {
  try {
    const io = getIO();
    
    // Update messages in database
    await Message.updateMany(
      {
        sender: conversationId,
        receiver: userId,
        read: false
      },
      {
        read: true,
        readAt: new Date()
      }
    );

    // Notify sender that messages were read
    io.to(`user_${conversationId}`).emit('messages_read', {
      userId,
      conversationId
    });
  } catch (error) {
    console.error('Error in markAsRead socket handler:', error);
    throw error;
  }
};

module.exports = { sendMessage, markAsRead };