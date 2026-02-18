const { readDB, writeDB, users } = require('../db/db');

const buildMessageResponse = async (message) => {
  const sender = await users.findById(message.senderId);
  const receiver = await users.findById(message.receiverId);

  const safeSender = sender ? (() => { const { password, ...rest } = sender; return rest; })() : null;
  const safeReceiver = receiver ? (() => { const { password, ...rest } = receiver; return rest; })() : null;

  return {
    ...message,
    sender: safeSender,
    receiver: safeReceiver
  };
};

// Get recent chats list for current user
exports.getChats = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const currentUser = await users.findById(currentUserId);
    const friendIds = currentUser?.friends || [];

    const db = await readDB();
    const allMessages = db.messages || [];

    const latestByOtherUser = new Map();
    for (const m of allMessages) {
      const involved = m.senderId === currentUserId || m.receiverId === currentUserId;
      if (!involved) continue;

      const otherUserId = m.senderId === currentUserId ? m.receiverId : m.senderId;
      if (!friendIds.includes(otherUserId)) continue;
      if ((m.deletedFor || []).includes(currentUserId)) continue;

      const prev = latestByOtherUser.get(otherUserId);
      if (!prev || new Date(m.createdAt) > new Date(prev.createdAt)) {
        latestByOtherUser.set(otherUserId, m);
      }
    }

    const chats = [];
    for (const [otherUserId, lastMessage] of latestByOtherUser.entries()) {
      const otherUser = await users.findById(otherUserId);
      if (!otherUser) continue;
      const { password, ...safeOtherUser } = otherUser;

      chats.push({
        user: safeOtherUser,
        lastMessage: await buildMessageResponse(lastMessage)
      });
    }

    chats.sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));

    res.json({
      success: true,
      chats
    });
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching chats',
      error: error.message
    });
  }
};

// Send message
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user.id;

    if (!receiverId || !content) {
      return res.status(400).json({
        success: false,
        message: 'receiverId and content are required'
      });
    }

    // Validate receiver exists
    const receiver = await users.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }

    // Only allow messaging friends
    const sender = await users.findById(senderId);
    const isFriend = (sender?.friends || []).includes(receiverId);
    if (!isFriend) {
      return res.status(403).json({
        success: false,
        message: 'You can only send messages to friends'
      });
    }

    const db = await readDB();

    const newMessage = {
      id: Date.now().toString(),
      senderId,
      receiverId,
      content,
      createdAt: new Date().toISOString(),
      read: false,
      readAt: null,
      deletedFor: []
    };

    db.messages = db.messages || [];
    db.messages.push(newMessage);
    await writeDB(db);

    const messageWithUsers = await buildMessageResponse(newMessage);

    res.json({
      success: true,
      message: messageWithUsers
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending message',
      error: error.message
    });
  }
};

// Get conversation between two users
exports.getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    // Check if users are friends
    const currentUser = await users.findById(currentUserId);
    const isFriend = (currentUser?.friends || []).includes(userId);

    if (!isFriend) {
      return res.status(403).json({
        success: false,
        message: 'You can only view messages with friends'
      });
    }

    const db = await readDB();
    const allMessages = db.messages || [];

    const conversation = allMessages
      .filter(m => {
        const betweenUsers =
          (m.senderId === currentUserId && m.receiverId === userId) ||
          (m.senderId === userId && m.receiverId === currentUserId);
        const notDeleted = !(m.deletedFor || []).includes(currentUserId);
        return betweenUsers && notDeleted;
      })
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    // Mark messages as read (messages from other user to current user)
    let updated = false;
    for (const msg of allMessages) {
      if (msg.senderId === userId && msg.receiverId === currentUserId && msg.read === false) {
        msg.read = true;
        msg.readAt = new Date().toISOString();
        updated = true;
      }
    }
    if (updated) {
      db.messages = allMessages;
      await writeDB(db);
    }

    const responseMessages = [];
    for (const msg of conversation) {
      responseMessages.push(await buildMessageResponse(msg));
    }

    res.json({
      success: true,
      messages: responseMessages
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching conversation',
      error: error.message
    });
  }
};

// Delete message
exports.deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const db = await readDB();
    const allMessages = db.messages || [];
    const message = allMessages.find(m => m.id === messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is part of the conversation
    if (message.senderId !== userId && message.receiverId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete messages from your conversations'
      });
    }

    message.deletedFor = message.deletedFor || [];
    if (!message.deletedFor.includes(userId)) {
      message.deletedFor.push(userId);
    }

    db.messages = allMessages;
    await writeDB(db);

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting message',
      error: error.message
    });
  }
};

// Mark messages as read
exports.markAsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    const db = await readDB();
    const allMessages = db.messages || [];
    let updated = false;

    for (const msg of allMessages) {
      if (msg.senderId === userId && msg.receiverId === currentUserId && msg.read === false) {
        msg.read = true;
        msg.readAt = new Date().toISOString();
        updated = true;
      }
    }

    if (updated) {
      db.messages = allMessages;
      await writeDB(db);
    }

    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking messages as read',
      error: error.message
    });
  }
};