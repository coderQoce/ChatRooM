const Message = require('../models/message');
const User = require('../models/user');
const Notification = require('../models/notification');

// Send message
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content, messageType = 'text', fileUrl, fileName } = req.body;
    const senderId = req.user._id;

    // Check if receiver is a friend
    const sender = await User.findById(senderId);
    const isFriend = sender.friends.find(f => 
      f.user.toString() === receiverId && f.status === 'accepted'
    );

    if (!isFriend) {
      return res.status(403).json({
        message: 'You can only send messages to friends'
      });
    }

    // Create message
    const message = new Message({
      sender: senderId,
      receiver: receiverId,
      content,
      messageType,
      fileUrl,
      fileName
    });

    await message.save();

    // Populate sender info
    await message.populate('sender', 'username profilePicture');

    // Create notification for receiver
    await Notification.create({
      user: receiverId,
      type: 'message',
      title: 'New Message',
      message: `New message from ${sender.username}`,
      relatedUser: senderId,
      relatedId: message._id
    });

    res.json({
      success: true,
      message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      message: 'Error sending message',
      error: error.message
    });
  }
};

// Get conversation between two users
exports.getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    // Check if users are friends
    const currentUser = await User.findById(currentUserId);
    const isFriend = currentUser.friends.find(f => 
      f.user.toString() === userId && f.status === 'accepted'
    );

    if (!isFriend) {
      return res.status(403).json({
        message: 'You can only view messages with friends'
      });
    }

    // Get messages
    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
      ],
      deletedFor: { $ne: currentUserId }
    })
      .populate('sender', 'username profilePicture')
      .populate('receiver', 'username profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Message.countDocuments({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
      ],
      deletedFor: { $ne: currentUserId }
    });

    // Mark messages as read
    await Message.updateMany(
      {
        sender: userId,
        receiver: currentUserId,
        read: false
      },
      {
        read: true,
        readAt: new Date()
      }
    );

    res.json({
      success: true,
      messages: messages.reverse(), // Return in chronological order
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      message: 'Error fetching conversation',
      error: error.message
    });
  }
};

// Delete message
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        message: 'Message not found'
      });
    }

    // Check if user is part of the conversation
    if (message.sender.toString() !== userId.toString() && 
        message.receiver.toString() !== userId.toString()) {
      return res.status(403).json({
        message: 'You can only delete your own messages'
      });
    }

    // Add user to deletedFor array
    if (!message.deletedFor.includes(userId)) {
      message.deletedFor.push(userId);
      await message.save();
    }

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error deleting message',
      error: error.message
    });
  }
};

// Mark messages as read
exports.markAsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    await Message.updateMany(
      {
        sender: userId,
        receiver: currentUserId,
        read: false
      },
      {
        read: true,
        readAt: new Date()
      }
    );

    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error marking messages as read',
      error: error.message
    });
  }
};