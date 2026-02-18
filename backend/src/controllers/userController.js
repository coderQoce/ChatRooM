const { users, readDB, writeDB } = require('../db/db');
const fs = require('fs');
const path = require('path');

// Search user by unique code
exports.searchByCode = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code || code.length !== 6) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 6-character code'
      });
    }

    const user = await users.findByCode(code.toUpperCase());

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this code'
      });
    }

    // Remove sensitive data
    const { password, friends, ...safeUser } = user;

    // Check if already friends
    const isFriend = req.user.friends?.includes(user.id);

    res.json({
      success: true,
      user: safeUser,
      isFriend
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching user',
      error: error.message
    });
  }
};

// Get user by ID
exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await users.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove sensitive data
    const { password, ...safeUser } = user;

    res.json({
      success: true,
      user: safeUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    const currentUser = req.user;

    // Filter allowed updates
    const allowedUpdates = ['username', 'profilePicture', 'status'];
    const filteredUpdates = {};

    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    // Check if username is being changed and if it's unique
    if (filteredUpdates.username && filteredUpdates.username !== currentUser.username) {
      const existingUser = await users.findByUsername(filteredUpdates.username);

      if (existingUser && existingUser.id !== currentUser.id) {
        return res.status(400).json({
          success: false,
          message: 'Username already taken'
        });
      }
    }

    const updatedUser = await users.update(currentUser.id, filteredUpdates);

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove password from response
    const { password, ...safeUser } = updatedUser;

    res.json({
      success: true,
      user: safeUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// Delete account (cascade: remove user, messages, friend references, avatar)
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const db = await readDB();

    // Find user to delete avatar file
    const userToDelete = db.users.find(u => u.id === userId);
    if (!userToDelete) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Delete avatar file if exists
    if (userToDelete.profilePicture) {
      const avatarPath = path.join(__dirname, '..', '..', userToDelete.profilePicture);
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }
    }

    // Remove user from all friends lists
    db.users.forEach(u => {
      if (u.friends && u.friends.includes(userId)) {
        u.friends = u.friends.filter(fId => fId !== userId);
      }
    });

    // Remove user
    db.users = db.users.filter(u => u.id !== userId);

    // Remove messages where user is sender or receiver
    db.messages = (db.messages || []).filter(
      m => m.senderId !== userId && m.receiverId !== userId
    );

    // Remove friend requests involving user
    db.friendRequests = (db.friendRequests || []).filter(
      r => r.senderId !== userId && r.receiverId !== userId
    );

    await writeDB(db);

    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ success: false, message: 'Error deleting account', error: error.message });
  }
};

// Get all users (for debugging)
exports.getAllUsers = async (req, res) => {
  try {
    const allUsers = await users.findAll();

    // Remove passwords from response
    const safeUsers = allUsers.map(user => {
      const { password, ...safeUser } = user;
      return safeUser;
    });

    res.json({
      success: true,
      users: safeUsers,
      count: safeUsers.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};